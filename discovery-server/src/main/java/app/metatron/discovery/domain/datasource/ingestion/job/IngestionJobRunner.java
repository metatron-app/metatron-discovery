/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.datasource.ingestion.job;

import com.google.common.collect.Maps;

import net.jodah.failsafe.Failsafe;
import net.jodah.failsafe.RetryPolicy;

import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionException;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.ResourceAccessException;

import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import javax.annotation.PostConstruct;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.ProgressResponse;
import app.metatron.discovery.common.fileloader.FileLoaderFactory;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceErrorCodes;
import app.metatron.discovery.domain.datasource.DataSourceIngestionException;
import app.metatron.discovery.domain.datasource.DataSourceService;
import app.metatron.discovery.domain.datasource.DataSourceSummary;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.datasource.ingestion.HdfsIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.HiveIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistoryRepository;
import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.IngestionOptionService;
import app.metatron.discovery.domain.datasource.ingestion.LocalFileIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.domain.engine.DruidEngineMetaRepository;
import app.metatron.discovery.domain.engine.DruidEngineRepository;
import app.metatron.discovery.domain.engine.EngineIngestionService;
import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.domain.engine.EngineQueryService;
import app.metatron.discovery.domain.engine.model.IngestionStatusResponse;
import app.metatron.discovery.domain.engine.model.SegmentMetaDataResponse;
import app.metatron.discovery.domain.storage.StorageProperties;
import app.metatron.discovery.util.PolarisUtils;

import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_COMMON_ERROR;
import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_ENGINE_REGISTRATION_ERROR;
import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_ENGINE_TASK_ERROR;
import static app.metatron.discovery.domain.datasource.ingestion.IngestionHistory.IngestionStatus.FAILED;
import static app.metatron.discovery.domain.datasource.ingestion.IngestionHistory.IngestionStatus.SUCCESS;
import static app.metatron.discovery.domain.datasource.ingestion.job.IngestionProgress.END_INGESTION_JOB;
import static app.metatron.discovery.domain.datasource.ingestion.job.IngestionProgress.ENGINE_INIT_TASK;
import static app.metatron.discovery.domain.datasource.ingestion.job.IngestionProgress.ENGINE_REGISTER_DATASOURCE;
import static app.metatron.discovery.domain.datasource.ingestion.job.IngestionProgress.ENGINE_RUNNING_TASK;
import static app.metatron.discovery.domain.datasource.ingestion.job.IngestionProgress.FAIL_INGESTION_JOB;
import static app.metatron.discovery.domain.datasource.ingestion.job.IngestionProgress.PREPARATION_HANDLE_LOCAL_FILE;
import static app.metatron.discovery.domain.datasource.ingestion.job.IngestionProgress.PREPARATION_LOAD_FILE_TO_ENGINE;
import static app.metatron.discovery.domain.datasource.ingestion.job.IngestionProgress.START_INGESTION_JOB;

@Component
public class IngestionJobRunner {

  private static final Logger LOGGER = LoggerFactory.getLogger(IngestionJobRunner.class);

  public static final String TOPIC_INGESTION_PROGRESS = "/topic/datasources/%s/progress";

  @Autowired
  private PlatformTransactionManager platformTransactionManager;

  @Autowired
  private EngineProperties engineProperties;

  @Autowired(required = false)
  private StorageProperties storageProperties;

  @Autowired
  private FileLoaderFactory fileLoaderFactory;

  @Autowired
  private DataSourceService dataSourceService;

  @Autowired
  private JdbcConnectionService jdbcConnectionService;

  @Autowired
  private IngestionHistoryRepository historyRepository;

  @Autowired
  private DruidEngineMetaRepository engineMetaRepository;

  @Autowired
  private DruidEngineRepository engineRepository;

  @Autowired
  private EngineIngestionService ingestionService;

  @Autowired
  private EngineQueryService queryService;

  @Autowired
  private IngestionOptionService ingestionOptionService;

  private SimpMessageSendingOperations messagingTemplate;

  private TransactionTemplate transactionTemplate;

  @Value("${polaris.datasource.ingestion.retries.delay:3}")
  private Long delay;

  @Value("${polaris.datasource.ingestion.retries.maxDelay:60}")
  private Long maxDelay;

  @Value("${polaris.datasource.ingestion.retries.maxDuration:3600}")
  private Long maxDuration;

  public IngestionJobRunner() {
    // Empty Constructor
  }

  @Autowired
  public void setMessagingTemplate(SimpMessageSendingOperations messagingTemplate) {
    this.messagingTemplate = messagingTemplate;
  }

  @PostConstruct
  public void init() {
    transactionTemplate = new TransactionTemplate(platformTransactionManager);
  }

  public void ingestion(DataSource dataSource) {

    String sendTopicUri = String.format(TOPIC_INGESTION_PROGRESS, dataSource.getId());

    IngestionHistory history = null;
    Map<String, Object> results = Maps.newLinkedHashMap();
    Boolean isResultEmpty = false;

    try {

      // Temporary Process
      Thread.sleep(3000L);
      history = createNewHistory(dataSource.getId(), dataSource.getIngestionInfo());

      sendTopic(sendTopicUri, new ProgressResponse(0, START_INGESTION_JOB));
      history = updateHistoryProgress(history.getId(), START_INGESTION_JOB);

      IngestionJob ingestionJob = getJob(dataSource, history);

      sendTopic(sendTopicUri, new ProgressResponse(20, PREPARATION_HANDLE_LOCAL_FILE));
      history = updateHistoryProgress(history.getId(), PREPARATION_HANDLE_LOCAL_FILE);

      try{
        ingestionJob.preparation();
      } catch(DataSourceIngestionException e){
        //if Result is Empty, complete ingestion.
        if(e.getCode() == DataSourceErrorCodes.INGESTION_JDBC_EMPTY_RESULT_ERROR){
          LOGGER.debug("Jdbc result is empty. : {}", dataSource.getId());
          isResultEmpty = true;
        } else { throw e; }
      }

      if(!isResultEmpty){
        sendTopic(sendTopicUri, new ProgressResponse(40, PREPARATION_LOAD_FILE_TO_ENGINE));
        history = updateHistoryProgress(history.getId(), PREPARATION_LOAD_FILE_TO_ENGINE);

        ingestionJob.loadToEngine();

        sendTopic(sendTopicUri, new ProgressResponse(50, ENGINE_INIT_TASK));
        history = updateHistoryProgress(history.getId(), ENGINE_INIT_TASK);

        ingestionJob.buildSpec();

        // Call engine api.
        String taskId = ingestionJob.process();

        history = updateHistoryProgress(history.getId(), ENGINE_RUNNING_TASK, taskId);

        results.put("history", history);
        sendTopic(sendTopicUri, new ProgressResponse(70, ENGINE_RUNNING_TASK, results));

        // Check ingestion Task.
        IngestionStatusResponse statusResponse = checkIngestion(taskId);
        if (statusResponse.getStatus() == FAILED) {
          throw new DataSourceIngestionException(INGESTION_ENGINE_TASK_ERROR, "An error occurred while loading the data source : " + statusResponse.getCause());
        }

        // Check registering datasource
        sendTopic(sendTopicUri, new ProgressResponse(90, ENGINE_REGISTER_DATASOURCE));
        history = updateHistoryProgress(history.getId(), ENGINE_REGISTER_DATASOURCE, taskId);
      }

      SegmentMetaDataResponse segmentMetaData = checkDataSource(dataSource.getEngineName());
      if (segmentMetaData == null) {
        throw new DataSourceIngestionException(INGESTION_ENGINE_REGISTRATION_ERROR, "An error occurred while registering the data source");
      }

      // FIXME: fix deprecated code with DataSourceCheckJob
      DataSourceSummary summary = new DataSourceSummary(segmentMetaData);
      summary.updateSummary(segmentMetaData);

      if (BooleanUtils.isTrue(dataSource.getIncludeGeo())) {
        List<Field> geoFields = dataSource.getGeoFields();

        Map<String, Object> result = queryService.geoBoundary(dataSource.getEngineName(), geoFields);
        summary.updateGeoCorner(result);
      }

      results.put("summary", summary);
      results.put("history", history);

      ProgressResponse successResponse = new ProgressResponse(100, END_INGESTION_JOB);
      successResponse.setResults(results);

      sendTopic(sendTopicUri, successResponse);
      setSuccessProgress(history.getId(), summary);

    } catch (Exception e) {

      DataSourceIngestionException ie;
      if (!(e instanceof DataSourceIngestionException)) {
        ie = new DataSourceIngestionException(INGESTION_COMMON_ERROR, e);
      } else {
        ie = (DataSourceIngestionException) e;
      }

      try {
        history = setFailProgress(history.getId(), ie);
      } catch (TransactionException ex) {
        LOGGER.warn("Fail to save fail process : {}", ex.getMessage());
      }

      results.put("history", history);
      sendTopic(sendTopicUri, new ProgressResponse(-1, FAIL_INGESTION_JOB, results));

      LOGGER.error("Fail to ingestion : {}", history, ie);
    }

  }

  public IngestionHistory createNewHistory(final String datasourceId, final IngestionInfo ingestionInfo) {
    return transactionTemplate.execute(transactionStatus -> {
      IngestionHistory history = new IngestionHistory();
      history.setIngestionInfo(ingestionInfo);
      history.setDataSourceId(datasourceId);
      history.setStatus(IngestionHistory.IngestionStatus.RUNNING);
      history.setHostname(PolarisUtils.getLocalHostname());
      return historyRepository.saveAndFlush(history);
    });
  }

  public IngestionHistory updateHistoryProgress(final Long id, final IngestionProgress progress) {
    return updateHistoryProgress(id, progress, null);
  }

  public IngestionHistory updateHistoryProgress(final Long id, final IngestionProgress progress, final String taskId) {
    return transactionTemplate.execute(transactionStatus -> {
      IngestionHistory history = historyRepository.findOne(id);
      history.setProgress(progress);

      if (StringUtils.isNotEmpty(taskId)) {
        history.setIngestionId(taskId);
      }

      return historyRepository.save(history);
    });
  }

  public IngestionHistory setSuccessProgress(final Long historyId, final DataSourceSummary summary) {
    return transactionTemplate.execute(transactionStatus -> {
      IngestionHistory history = historyRepository.findOne(historyId);
      history.setStatus(SUCCESS);
      history.setProgress(END_INGESTION_JOB);

      dataSourceService.setDataSourceStatus(history.getDataSourceId(), DataSource.Status.ENABLED, summary, null);

      return historyRepository.save(history);
    });
  }

  public IngestionHistory setFailProgress(final Long historyId, final DataSourceIngestionException ie) {
    return transactionTemplate.execute(transactionStatus -> {
      IngestionHistory history = historyRepository.findOne(historyId);
      history.setStatus(FAILED, ie);

      dataSourceService.setDataSourceStatus(history.getDataSourceId(), DataSource.Status.FAILED,
                                            null,
                                            history.getProgress() == ENGINE_REGISTER_DATASOURCE);

      return historyRepository.save(history);
    });
  }

  public IngestionJob getJob(DataSource dataSource, IngestionHistory ingestionHistory) {
    IngestionInfo ingestionInfo = dataSource.getIngestionInfo();

    if (ingestionInfo instanceof LocalFileIngestionInfo) {
      FileIngestionJob ingestionJob = new FileIngestionJob(dataSource, ingestionHistory);
      ingestionJob.setEngineProperties(engineProperties);
      ingestionJob.setStorageProperties(storageProperties);
      ingestionJob.setEngineMetaRepository(engineMetaRepository);
      ingestionJob.setEngineRepository(engineRepository);
      ingestionJob.setFileLoaderFactory(fileLoaderFactory);
      ingestionJob.setHistoryRepository(historyRepository);
      ingestionJob.setIngestionOptionService(ingestionOptionService);
      return ingestionJob;

    } else if (ingestionInfo instanceof JdbcIngestionInfo) {
      JdbcIngestionJob ingestionJob = new JdbcIngestionJob(dataSource, ingestionHistory);
      ingestionJob.setEngineProperties(engineProperties);
      ingestionJob.setStorageProperties(storageProperties);
      ingestionJob.setEngineMetaRepository(engineMetaRepository);
      ingestionJob.setEngineRepository(engineRepository);
      ingestionJob.setFileLoaderFactory(fileLoaderFactory);
      ingestionJob.setHistoryRepository(historyRepository);
      ingestionJob.setIngestionOptionService(ingestionOptionService);
      ingestionJob.setJdbcConnectionService(jdbcConnectionService);
      return ingestionJob;

    } else if (ingestionInfo instanceof HdfsIngestionInfo) {
      HdfsIngestionJob ingestionJob = new HdfsIngestionJob(dataSource, ingestionHistory);
      ingestionJob.setEngineProperties(engineProperties);
      ingestionJob.setStorageProperties(storageProperties);
      ingestionJob.setEngineMetaRepository(engineMetaRepository);
      ingestionJob.setEngineRepository(engineRepository);
      ingestionJob.setFileLoaderFactory(fileLoaderFactory);
      ingestionJob.setHistoryRepository(historyRepository);
      ingestionJob.setIngestionOptionService(ingestionOptionService);
      return ingestionJob;

    } else if (ingestionInfo instanceof HiveIngestionInfo) {
      HiveIngestionJob ingestionJob = new HiveIngestionJob(dataSource, ingestionHistory);
      ingestionJob.setEngineProperties(engineProperties);
      ingestionJob.setStorageProperties(storageProperties);
      ingestionJob.setEngineMetaRepository(engineMetaRepository);
      ingestionJob.setEngineRepository(engineRepository);
      ingestionJob.setFileLoaderFactory(fileLoaderFactory);
      ingestionJob.setHistoryRepository(historyRepository);
      ingestionJob.setIngestionOptionService(ingestionOptionService);
      ingestionJob.setJdbcConnectionService(jdbcConnectionService);
      return ingestionJob;
    } else {
      throw new IllegalArgumentException("Not supported ingestion information.");
    }

  }

  public void sendTopic(String topicUri, ProgressResponse progressResponse) {
    LOGGER.debug("Send Progress Topic : {}, {}", topicUri, progressResponse);
    try {
      messagingTemplate.convertAndSend(topicUri,
                                       GlobalObjectMapper.writeValueAsString(progressResponse));
    } catch (Exception e) {
      LOGGER.error("Fail to send message : {}, {}", topicUri, progressResponse, e);
    }

  }

  public SegmentMetaDataResponse checkDataSource(String engineName) {

    // @formatter:off
    RetryPolicy retryPolicy = new RetryPolicy()
        .retryOn(ResourceAccessException.class)
        .retryOn(Exception.class)
        .retryIf(result -> result == null)
        .withBackoff(delay, maxDelay, TimeUnit.SECONDS)
        .withMaxDuration(maxDuration, TimeUnit.SECONDS);
		// @formatter:on

    Callable<SegmentMetaDataResponse> callable = () -> queryService.segmentMetadata(engineName);

    // @formatter:off
    SegmentMetaDataResponse response = Failsafe.with(retryPolicy)
            .onRetriesExceeded((o, throwable) -> {
              throw new DataSourceIngestionException("Retries exceed for checking datasource : " + engineName);
            })
            .onComplete((o, throwable, ctx) -> {
              if(ctx != null) {
                LOGGER.debug("Completed checking datasource({}). {} tries. Take time {} seconds.", engineName, ctx.getExecutions(), ctx.getElapsedTime().toSeconds());
              }
            })
            .get(callable);
    // @formatter:on

    return response;
  }

  public IngestionStatusResponse checkIngestion(String taskId) {

    // @formatter:off
    RetryPolicy retryPolicy = new RetryPolicy()
        .retryOn(ResourceAccessException.class)
        .retryOn(Exception.class)
        .retryIf(result -> {
          if(result instanceof IngestionStatusResponse) {
            IngestionStatusResponse response = (IngestionStatusResponse) result;
            if(response.getStatus() == SUCCESS || response.getStatus() == FAILED) {
              return false;
            }
          }
          return true;
        })
        .withBackoff(delay, maxDelay, TimeUnit.SECONDS)
        .withMaxDuration(maxDuration, TimeUnit.SECONDS);
		// @formatter:on


    Callable<IngestionStatusResponse> callable = () -> ingestionService.doCheckResult(taskId);

    // @formatter:off
    IngestionStatusResponse statusResponse = Failsafe.with(retryPolicy)
            .onRetriesExceeded((o, throwable) -> {
              throw new DataSourceIngestionException("Retries exceed for ingestion task : " + taskId);
            })
            .onComplete((o, throwable, ctx) -> {
              if(ctx != null) {
                LOGGER.debug("Completed checking task ({}). {} tries. Take time {} seconds.", taskId, ctx.getExecutions(), ctx.getElapsedTime().toSeconds());
              }
            })
            .get(callable);
    // @formatter:on

    return statusResponse;
  }

}

