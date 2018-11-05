package app.metatron.discovery.domain.datasource.ingestion.job;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.ProgressResponse;
import app.metatron.discovery.common.exception.ErrorCodes;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.common.fileloader.FileLoaderFactory;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceIngestionException;
import app.metatron.discovery.domain.datasource.DataSourceService;
import app.metatron.discovery.domain.datasource.DataSourceSummary;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
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
import app.metatron.discovery.domain.engine.model.SegmentMetaData;
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

  private Long interval = 5000L;

  @Transactional
  public void ingestion(DataSource dataSource) {

    IngestionHistory history = new IngestionHistory(dataSource.getId());
    history.setIngestionInfo(dataSource.getIngestionInfo());
    history.setStatus(IngestionHistory.IngestionStatus.RUNNING);
    history.setProgress(START_INGESTION_JOB);
    history.setHostname(PolarisUtils.getLocalHostname());
    historyRepository.saveAndFlush(history);

    IngestionJob ingestionJob = getJob(dataSource, history);

    String sendTopicUri = String.format(TOPIC_INGESTION_PROGRESS, dataSource.getId());
    sendTopic(sendTopicUri, new ProgressResponse(0, START_INGESTION_JOB));

    try {
      sendTopic(sendTopicUri, new ProgressResponse(20, PREPARATION_HANDLE_LOCAL_FILE));
      history.setProgress(PREPARATION_HANDLE_LOCAL_FILE);
      historyRepository.saveAndFlush(history);
      ingestionJob.preparation();

      sendTopic(sendTopicUri, new ProgressResponse(40, PREPARATION_LOAD_FILE_TO_ENGINE));
      history.setProgress(PREPARATION_LOAD_FILE_TO_ENGINE);
      historyRepository.saveAndFlush(history);
      ingestionJob.loadToEngine();

      sendTopic(sendTopicUri, new ProgressResponse(50, ENGINE_INIT_TASK));
      history.setProgress(ENGINE_INIT_TASK);
      historyRepository.saveAndFlush(history);
      ingestionJob.buildSpec();

      // Call engine api.
      String taskId = ingestionJob.process();
      sendTopic(sendTopicUri, new ProgressResponse(70, ENGINE_RUNNING_TASK));
      history.setIngestionId(taskId);
      history.setProgress(ENGINE_RUNNING_TASK);
      historyRepository.saveAndFlush(history);

      // Check ingestion Task.
      IngestionStatusResponse statusResponse = checkIngestion(taskId);
      if(statusResponse.getStatus() == FAILED) {
        throw new DataSourceIngestionException(INGESTION_ENGINE_TASK_ERROR, "An error occurred while loading the data source : " + statusResponse.getCause());
      }

      // Check registering datasource
      sendTopic(sendTopicUri, new ProgressResponse(90, ENGINE_REGISTER_DATASOURCE));
      history.setProgress(ENGINE_REGISTER_DATASOURCE);
      historyRepository.saveAndFlush(history);

      SegmentMetaData segmentMetaData = checkDataSource(dataSource.getEngineName());
      if(segmentMetaData == null) {
        throw new DataSourceIngestionException(INGESTION_ENGINE_REGISTRATION_ERROR, "An error occurred while registering the data source");
      }

      history.setStatus(SUCCESS);
      historyRepository.saveAndFlush(history);
      dataSourceService.setDataSourceStatus(history.getDataSourceId(), DataSource.Status.ENABLED, new DataSourceSummary(segmentMetaData));

      sendTopic(sendTopicUri, new ProgressResponse(100, END_INGESTION_JOB));

    } catch (DataSourceIngestionException ie) {
      sendTopic(sendTopicUri, new ProgressResponse(-1, FAIL_INGESTION_JOB, ie));
      handleFailProcess(history, ie.getCode(), ie);
    } catch (Exception e) {
      sendTopic(sendTopicUri, new ProgressResponse(-1, FAIL_INGESTION_JOB, new MetatronException(INGESTION_COMMON_ERROR, e)));
      handleFailProcess(history, INGESTION_COMMON_ERROR, e);
    }

  }

  @Transactional
  public void handleFailProcess(IngestionHistory history, ErrorCodes code, Throwable t) {
    history.setStatus(FAILED);
    history.setCause(code.toString());
    historyRepository.saveAndFlush(history);
    dataSourceService.setDataSourceStatus(history.getDataSourceId(), DataSource.Status.FAILED, null);

    LOGGER.error("Fail to ingestion : {}", history, t);
  }

  public IngestionJob getJob(DataSource dataSource, IngestionHistory ingestionHistory) {
    IngestionInfo ingestionInfo = dataSource.getIngestionInfo();

    if(ingestionInfo instanceof LocalFileIngestionInfo) {
      FileIngestionJob ingestionJob = new FileIngestionJob(dataSource, ingestionHistory);
      ingestionJob.setEngineProperties(engineProperties);
      ingestionJob.setEngineMetaRepository(engineMetaRepository);
      ingestionJob.setEngineRepository(engineRepository);
      ingestionJob.setFileLoaderFactory(fileLoaderFactory);
      ingestionJob.setHistoryRepository(historyRepository);
      ingestionJob.setIngestionOptionService(ingestionOptionService);
      return ingestionJob;

    } else if(ingestionInfo instanceof JdbcIngestionInfo) {
      JdbcIngestionJob ingestionJob = new JdbcIngestionJob(dataSource, ingestionHistory);
      ingestionJob.setEngineProperties(engineProperties);
      ingestionJob.setEngineMetaRepository(engineMetaRepository);
      ingestionJob.setEngineRepository(engineRepository);
      ingestionJob.setFileLoaderFactory(fileLoaderFactory);
      ingestionJob.setHistoryRepository(historyRepository);
      ingestionJob.setIngestionOptionService(ingestionOptionService);
      ingestionJob.setJdbcConnectionService(jdbcConnectionService);
      return ingestionJob;
    }

    return null;

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

  public SegmentMetaData checkDataSource(String engineName) {

    SegmentMetaData segmentMetaData = null;
    int checkCount = 0;

    do {
      if(checkCount == 20) {
        break;
      }

      try {
        Thread.sleep(interval);
      } catch (InterruptedException e) {}

      try {
        segmentMetaData = queryService.segmentMetadata(engineName);
      } catch (Exception e) {
        LOGGER.debug("{} : Check ingested datasource({}) : {}", checkCount, engineName, e.getMessage());
      }

      checkCount++;

    } while (true);

    return segmentMetaData;
  }

  public IngestionStatusResponse checkIngestion(String taskId) {

    IngestionStatusResponse statusResponse;
    int unknownCount = 0;

    do {
      try {
        Thread.sleep(interval);
      } catch (InterruptedException e) {}

      try {
        statusResponse = ingestionService.doCheckResult(taskId);
      } catch (Exception e) {
        LOGGER.warn("Keep task({}) status cause by engine error : {}", taskId, e.getMessage());
        statusResponse = IngestionStatusResponse.unknownResponse(taskId, e);
      }

      if(statusResponse.getStatus() == SUCCESS
          || statusResponse.getStatus() == FAILED) {
        break;
      } else if(statusResponse.getStatus() == UNKNOWN) {
        // If an unrecognized server error occurs consistently, the failure is handled.
        unknownCount++;
        if(unknownCount == 10) {
          statusResponse.setStatus(FAILED);
          break;
        }
      }

    } while (true);

    return statusResponse;
  }

}

