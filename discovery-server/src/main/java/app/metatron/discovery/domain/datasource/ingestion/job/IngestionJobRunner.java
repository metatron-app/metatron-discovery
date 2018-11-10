package app.metatron.discovery.domain.datasource.ingestion.job;

import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionException;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.Map;

import javax.annotation.PostConstruct;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.ProgressResponse;
import app.metatron.discovery.common.fileloader.FileLoaderFactory;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceIngestionException;
import app.metatron.discovery.domain.datasource.DataSourceService;
import app.metatron.discovery.domain.datasource.DataSourceSummary;
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
import app.metatron.discovery.util.PolarisUtils;

import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_COMMON_ERROR;
import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_ENGINE_REGISTRATION_ERROR;
import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_ENGINE_TASK_ERROR;
import static app.metatron.discovery.domain.datasource.ingestion.IngestionHistory.IngestionStatus.FAILED;
import static app.metatron.discovery.domain.datasource.ingestion.IngestionHistory.IngestionStatus.SUCCESS;
import static app.metatron.discovery.domain.datasource.ingestion.IngestionHistory.IngestionStatus.UNKNOWN;
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

  @Autowired
  private SimpMessageSendingOperations messagingTemplate;

  private TransactionTemplate transactionTemplate;

  private Long interval = 5000L;

  public IngestionJobRunner() {
    // Empty Constructor
  }

  @PostConstruct
  public void init() {
    transactionTemplate = new TransactionTemplate(platformTransactionManager);
  }

  public void ingestion(DataSource dataSource) {

    String sendTopicUri = String.format(TOPIC_INGESTION_PROGRESS, dataSource.getId());

    IngestionHistory history = null;
    Map<String, Object> results = Maps.newLinkedHashMap();

    try {

      // Temporary Process
      Thread.sleep(3000L);
      history = createNewHistory(dataSource.getId(), dataSource.getIngestionInfo());

      sendTopic(sendTopicUri, new ProgressResponse(0, START_INGESTION_JOB));
      history = updateHistoryProgress(history.getId(), START_INGESTION_JOB);

      IngestionJob ingestionJob = getJob(dataSource, history);

      sendTopic(sendTopicUri, new ProgressResponse(20, PREPARATION_HANDLE_LOCAL_FILE));
      history = updateHistoryProgress(history.getId(), PREPARATION_HANDLE_LOCAL_FILE);

      ingestionJob.preparation();

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
      history = updateHistoryProgress(history.getId(), ENGINE_RUNNING_TASK, taskId);

      SegmentMetaDataResponse segmentMetaData = checkDataSource(dataSource.getEngineName());
      if (segmentMetaData == null) {
        throw new DataSourceIngestionException(INGESTION_ENGINE_REGISTRATION_ERROR, "An error occurred while registering the data source");
      }

      DataSourceSummary summary = new DataSourceSummary(segmentMetaData);
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
      } catch (TransactionException ex) {}

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

      dataSourceService.setDataSourceStatus(history.getDataSourceId(), DataSource.Status.ENABLED, summary);

      return historyRepository.save(history);
    });
  }

  public IngestionHistory setFailProgress(final Long historyId, final DataSourceIngestionException ie) {
    return transactionTemplate.execute(transactionStatus -> {
      IngestionHistory history = historyRepository.findOne(historyId);
      history.setStatus(FAILED, ie);
      history.setProgress(FAIL_INGESTION_JOB);

      dataSourceService.setDataSourceStatus(history.getDataSourceId(), DataSource.Status.FAILED, null);

      return historyRepository.save(history);
    });
  }

  public IngestionJob getJob(DataSource dataSource, IngestionHistory ingestionHistory) {
    IngestionInfo ingestionInfo = dataSource.getIngestionInfo();

    if (ingestionInfo instanceof LocalFileIngestionInfo) {
      FileIngestionJob ingestionJob = new FileIngestionJob(dataSource, ingestionHistory);
      ingestionJob.setEngineProperties(engineProperties);
      ingestionJob.setEngineMetaRepository(engineMetaRepository);
      ingestionJob.setEngineRepository(engineRepository);
      ingestionJob.setFileLoaderFactory(fileLoaderFactory);
      ingestionJob.setHistoryRepository(historyRepository);
      ingestionJob.setIngestionOptionService(ingestionOptionService);
      return ingestionJob;

    } else if (ingestionInfo instanceof JdbcIngestionInfo) {
      JdbcIngestionJob ingestionJob = new JdbcIngestionJob(dataSource, ingestionHistory);
      ingestionJob.setEngineProperties(engineProperties);
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
      ingestionJob.setEngineMetaRepository(engineMetaRepository);
      ingestionJob.setEngineRepository(engineRepository);
      ingestionJob.setFileLoaderFactory(fileLoaderFactory);
      ingestionJob.setHistoryRepository(historyRepository);
      ingestionJob.setIngestionOptionService(ingestionOptionService);
      return ingestionJob;

    } else if (ingestionInfo instanceof HiveIngestionInfo) {
      HiveIngestionJob ingestionJob = new HiveIngestionJob(dataSource, ingestionHistory);
      ingestionJob.setEngineProperties(engineProperties);
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

    SegmentMetaDataResponse segmentMetaData = null;
    int checkCount = 0;

    do {
      if (checkCount == 20) {
        LOGGER.info("Not Find datasource({}) in 20 times", engineName);
        break;
      }

      try {
        Thread.sleep(interval);
      } catch (InterruptedException e) {
      }

      try {
        segmentMetaData = queryService.segmentMetadata(engineName);
      } catch (Exception e) {
        LOGGER.debug("{} : Check ingested datasource({}) : {}", checkCount, engineName, e.getMessage());
        checkCount++;
      }

      if (segmentMetaData != null) {
        LOGGER.debug("{} : Find datasource({})!!", checkCount, engineName);
        break;
      }

    } while (true);

    return segmentMetaData;
  }

  public IngestionStatusResponse checkIngestion(String taskId) {

    IngestionStatusResponse statusResponse;
    int unknownCount = 0;

    do {
      try {
        Thread.sleep(interval);
      } catch (InterruptedException e) {
      }

      try {
        statusResponse = ingestionService.doCheckResult(taskId);
      } catch (Exception e) {
        LOGGER.warn("Keep task({}) status cause by engine error : {}", taskId, e.getMessage());
        statusResponse = IngestionStatusResponse.unknownResponse(taskId, e);
      }

      LOGGER.debug("Check Task({}) : {}", taskId, statusResponse);

      if (statusResponse.getStatus() == SUCCESS
          || statusResponse.getStatus() == FAILED) {
        break;
      } else if (statusResponse.getStatus() == UNKNOWN) {
        // If an unrecognized server error occurs consistently, the failure is handled.
        unknownCount++;
        if (unknownCount == 10) {
          LOGGER.info("Unknown error occurred over 10 time. It will mark 'fail'.");
          statusResponse.setStatus(FAILED);
          break;
        }
      }

    } while (true);

    return statusResponse;
  }

}

