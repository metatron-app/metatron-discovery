/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.engine;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.common.fileloader.FileLoaderFactory;
import app.metatron.discovery.common.fileloader.FileLoaderProperties;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceIngetionException;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.connection.DataConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveTableInformation;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnectionException;
import app.metatron.discovery.domain.datasource.ingestion.HdfsIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.HiveIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistoryRepository;
import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.IngestionOption;
import app.metatron.discovery.domain.datasource.ingestion.IngestionOptionService;
import app.metatron.discovery.domain.datasource.ingestion.LocalFileIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.RealtimeIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.file.CsvFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.ExcelFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.JsonFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.OrcFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.domain.datasource.realtime.KafkaClient;
import app.metatron.discovery.domain.datasource.realtime.RealTimeProperties;
import app.metatron.discovery.domain.engine.model.IngestionStatusResponse;
import app.metatron.discovery.spec.druid.ingestion.BatchIndex;
import app.metatron.discovery.spec.druid.ingestion.HadoopIndex;
import app.metatron.discovery.spec.druid.ingestion.Index;
import app.metatron.discovery.spec.druid.ingestion.IngestionSpec;
import app.metatron.discovery.spec.druid.ingestion.IngestionSpecBuilder;
import app.metatron.discovery.spec.druid.ingestion.KafkaRealTimeIndexBuilder;
import app.metatron.discovery.spec.druid.ingestion.SupervisorIndex;
import app.metatron.discovery.util.PolarisUtils;

import static app.metatron.discovery.domain.datasource.DataSource.SourceType.FILE;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.HDFS;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.HIVE;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.JDBC;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.NONE;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.REALTIME;
import static app.metatron.discovery.domain.datasource.DataSource.Status.ENABLED;
import static app.metatron.discovery.domain.datasource.ingestion.IngestionHistory.IngestionStatus.FAILED;
import static app.metatron.discovery.domain.datasource.ingestion.IngestionHistory.IngestionStatus.PASS;
import static app.metatron.discovery.domain.datasource.ingestion.IngestionHistory.IngestionStatus.RUNNING;

/**
 *
 */
@Component
@Transactional(readOnly = true)
public class EngineIngestionService {

  private static final Logger LOGGER = LoggerFactory.getLogger(EngineIngestionService.class);

  private static final String DEFAULT_DEDICATED_WORKER = "localhost:8091";

  @Autowired
  FileLoaderFactory fileLoaderFactory;

  @Autowired
  JdbcConnectionService jdbcConnectionService;

  @Autowired
  IngestionOptionService ingestionOptionService;

  @Autowired
  DruidEngineMetaRepository engineMetaRepository;

  @Autowired
  IngestionHistoryRepository ingestionHistoryRepository;

  @Autowired
  DruidEngineRepository engineRepository;

  @Autowired
  EngineProperties engineProperties;

  @Autowired(required = false)
  KafkaClient kafkaClient;

  @Autowired
  RealTimeProperties realTimeProperties;

  public EngineIngestionService() {
    // Empty Constructor
  }

  /**
   * 데이터 소스내 진행중인 적재 작업이 있다면 종료 시킵니다 엔진내 예외 발생시 로그로만 실패여부를 표시합니다
   */
  public void shutDownIngestionTask(String dataSourceId) {
    // Shutdown Ingestion Task
    List<IngestionHistory> ingestionHistories = ingestionHistoryRepository.findByDataSourceIdAndStatus(dataSourceId, RUNNING);
    for (IngestionHistory ingestionHistory : ingestionHistories) {
      try {
        if (ingestionHistory.getIngestionMethod() == IngestionHistory.IngestionMethod.SUPERVISOR) {
          engineMetaRepository.shutDownSupervisorIngestionTask(ingestionHistory.getIngestionId());
        } else {
          engineMetaRepository.shutDownIngestionTask(ingestionHistory.getIngestionId());
        }
        LOGGER.info("Successfully shutdown ingestion task : ({}) {}",
                    ingestionHistory.getIngestionMethod(),
                    ingestionHistory.getIngestionId());
      } catch (Exception e) {
        LOGGER.warn("Fail to shutdown ingestion task : ({}) {}",
                    ingestionHistory.getIngestionMethod(),
                    ingestionHistory.getIngestionId());
      }
    }
  }

  public void shutDownIngestionTask(String datasourceName, String taskId) {

    engineMetaRepository.shutDownIngestionTask(taskId);

    if (kafkaClient != null) {
      kafkaClient.destroyTopic(datasourceName);
    }
  }

  public IngestionStatusResponse doCheckResult(String ingestionId) {

    return engineMetaRepository.getIngestionStatus(ingestionId)
                               .orElse(IngestionStatusResponse.failedResponse(ingestionId));

  }

  public Optional<String> doSupervisorCheckResult(String ingestionId) {

    Optional<Map> result = engineMetaRepository.getSupervisorIngestionStatus(ingestionId);

    // 엔진상에서 처리방식에 대한 협의 필요
    String status = "FAILED";
    if (result.isPresent()) {
      Map resultMap = result.get();
      if (resultMap.containsKey("id")) {
        status = "RUNNING";
      }
    }

    return Optional.of(status);
  }

  public Optional<IngestionHistory> doIngestion(DataSource dataSource) {
    Optional<IngestionHistory> status = null;
    if (dataSource.getSrcType() == FILE) {
      status = localFileIngestion(dataSource);
    } else if (dataSource.getSrcType() == JDBC) {
      status = doDBToFileIngestion(dataSource);
    } else if (dataSource.getSrcType() == HDFS) {
      status = hdfsIngestion(dataSource);
    } else if (dataSource.getSrcType() == HIVE) {
      status = hiveIngestion(dataSource);
    } else if (dataSource.getSrcType() == REALTIME) {
      status = realtimeIngestion(dataSource);
    } else if (dataSource.getSrcType() == NONE) {
      LOGGER.info("Pass Ingestion.");
      dataSource.setStatus(ENABLED);
    } else {
      throw new IllegalArgumentException("Not support source type( " + dataSource.getSrcType() + " ).");
    }

    return status;
  }

  public Optional<IngestionHistory> realtimeIngestion(DataSource dataSource) {

    RealtimeIngestionInfo ingestionInfo = dataSource.getIngestionInfoByType();

    // Ingestion Task 생성
    SupervisorIndex spec = new KafkaRealTimeIndexBuilder()
        .dataSchema(dataSource)
        .ioConfig(ingestionInfo.getTopic(), ingestionInfo.getConsumerProperties(), ingestionInfo.getTuningOptions())
        .tuningConfig(ingestionInfo.getTuningOptions())
        .build();

    return doSupervisorIngestion(dataSource.getId(), ingestionInfo, spec);

  }

  public Optional<IngestionHistory> hdfsIngestion(DataSource dataSource) {
    Preconditions.checkArgument(dataSource.getSrcType() == HDFS, "Required HDFS type.");
    HdfsIngestionInfo hdfsInfo = dataSource.getIngestionInfoByType();

    // Tuning config 외 타 Spec 에서 사용할수 있는 옵션 지정
    // Map Job 내에서 한번에 처리할수 있는 데이터 사이즈 지정 (Hive 인 경우 table directory size)
    String mapSplitSize = null;
    if (MapUtils.isNotEmpty(hdfsInfo.getTuningOptions())) {
      mapSplitSize = (String) hdfsInfo.getTuningOptions().get("mapSplitSize");
    }

    Map<String,Object> tuningOptions = ingestionOptionService.findTuningOptionMap(IngestionOption.IngestionType.HADOOP,
                                                                                  hdfsInfo.getTuningOptions());
    Map<String,Object> jobProperties = ingestionOptionService.findJobOptionMap(IngestionOption.IngestionType.HADOOP,
                                                                                  hdfsInfo.getJobProperties());

    // Ingestion Task 생성
    IngestionSpec spec = new IngestionSpecBuilder()
        .dataSchema(dataSource)
        .hdfsIoConfig(hdfsInfo.getPaths(), hdfsInfo.isFindRecursive(), mapSplitSize)
        .hdfsTuningConfig(tuningOptions, jobProperties)
        .build();

    return doIngestion(dataSource.getId(), hdfsInfo, new HadoopIndex(spec));

  }

  public Optional<IngestionHistory> hiveIngestion(DataSource dataSource) {
    Preconditions.checkArgument(dataSource.getSrcType() == HIVE &&
                                    dataSource.getIngestionInfo() instanceof HiveIngestionInfo, "Required HIVE ingestion info.");

    HiveIngestionInfo hiveInfo = dataSource.getIngestionInfoByType();
    EngineProperties.HiveConnection hiveProperties = engineProperties.getIngestion().getHive();

    String metastoreUri = hiveInfo.getContextValue(HiveIngestionInfo.KEY_HIVE_METASTORE);
    if (StringUtils.isEmpty(metastoreUri)) {
      metastoreUri = hiveProperties.getMetastore();
    }

    if (hiveInfo.getFormat() instanceof OrcFileFormat) {
      String orcSchema = hiveInfo.getContextValue(HiveIngestionInfo.KEY_ORC_SCHEMA);
      if (StringUtils.isEmpty(orcSchema)) {
        hiveInfo.setTypeString(makeOrcTypeSchema(hiveProperties, hiveInfo.getSource()));
      } else {
        hiveInfo.setTypeString(orcSchema);
      }
    }

    // Tuning config 외 타 Spec 에서 사용할수 있는 옵션 지정
    // Map Job 내에서 한번에 처리할수 있는 데이터 사이즈 지정 (Hive 인 경우 table directory size)
    String mapSplitSize = null;
    if (MapUtils.isNotEmpty(hiveInfo.getTuningOptions())) {
      mapSplitSize = (String) hiveInfo.getTuningOptions().get("mapSplitSize");
    }

    Map<String,Object> tuningOptions = ingestionOptionService.findTuningOptionMap(IngestionOption.IngestionType.HADOOP,
                                                                                  hiveInfo.getTuningOptions());
    Map<String,Object> jobProperties = ingestionOptionService.findJobOptionMap(IngestionOption.IngestionType.HADOOP,
                                                                               hiveInfo.getJobProperties());

    // Ingestion Task 생성
    IngestionSpec spec = new IngestionSpecBuilder()
        .dataSchema(dataSource)
        .hiveIoConfig(hiveInfo.getSource(), metastoreUri, hiveInfo.getPartitions(), mapSplitSize)
        .hiveTuningConfig(tuningOptions, jobProperties)
        .build();

    return doIngestion(dataSource.getId(), hiveInfo, new HadoopIndex(spec, hiveInfo.getContext()));

  }

  public Optional<IngestionHistory> localFileIngestion(DataSource dataSource) {

    Preconditions.checkArgument(dataSource.getSrcType() == FILE, "Required FILE type.");
    LocalFileIngestionInfo localFileInfo = dataSource.getIngestionInfoByType();

    Preconditions.checkArgument(localFileInfo.getPath() != null
                                    && localFileInfo.getFormat() != null,
                                "Invalid local file information.");

    EngineProperties.IngestionInfo ingestionInfo = engineProperties.getIngestion();

    // Set path of source file
    String sourceFilePath = null;
    if (StringUtils.isNotEmpty(localFileInfo.getOriginalFileName())) {
      sourceFilePath = System.getProperty("java.io.tmpdir") + File.separator + localFileInfo.getPath();
    } else {
      sourceFilePath = localFileInfo.getPath();
      localFileInfo.setOriginalFileName(FilenameUtils.getName(sourceFilePath));
    }

    Path destFilePath = null;
    if(localFileInfo.getFormat() instanceof CsvFileFormat
        || localFileInfo.getFormat() instanceof ExcelFileFormat) {

      boolean removeFirstRow = localFileInfo.getRemoveFirstRow();

      destFilePath = Paths.get(ingestionInfo.getBaseDir(),
                               dataSource.getEngineName() + "-" + System.currentTimeMillis() + ".csv");

      if (localFileInfo.getFormat() instanceof CsvFileFormat) {
        if (removeFirstRow) {
          PolarisUtils.removeCSVHeaderRow(sourceFilePath);
        }
        PolarisUtils.fileCopy(sourceFilePath, destFilePath.toString());
      } else if (localFileInfo.getFormat() instanceof ExcelFileFormat) {
        ExcelFileFormat excelFileFormat = (ExcelFileFormat) localFileInfo.getFormat();
        PolarisUtils.convertExcelToCSV(excelFileFormat.getSheetIndex(), removeFirstRow, sourceFilePath, destFilePath.toString());
      }

      // TODO: Remove processing timestamp field
      int fieldSize = dataSource.getFields().size();
      Field lastField = dataSource.getFields().get(fieldSize - 1);
      if (lastField.getType() == DataType.TIMESTAMP && "current_datetime".equals(lastField.getName())) {
        Date date = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat(lastField.getTimeFormat());//yyyy-MM-dd HH:mm:ss
        String timestampValue = sdf.format(date);
        PolarisUtils.addTimestampColumn(timestampValue, destFilePath.toString());
      }

    } else if (localFileInfo.getFormat() instanceof JsonFileFormat) {

      destFilePath = Paths.get(ingestionInfo.getBaseDir(),
                               dataSource.getEngineName() + "-" + System.currentTimeMillis() + ".json");

      PolarisUtils.fileCopy(sourceFilePath, destFilePath.toString());
    } else {
      throw new IllegalArgumentException("Not supported file format. ( " + GlobalObjectMapper.writeValueAsString(localFileInfo.getFormat()) + " )");
    }

    // Copy source file to middle manager
    String worker = copyLocalToRemoteMiddleManager(Lists.newArrayList(destFilePath.toString())).orElse("");

    IngestionSpec spec = new IngestionSpecBuilder()
        .dataSchema(dataSource)
        .batchTuningConfig(ingestionOptionService.findTuningOptionMap(IngestionOption.IngestionType.BATCH,
                                                                      localFileInfo.getTuningOptions()))
        .localIoConfig(ingestionInfo.getBaseDir(), destFilePath.getFileName().toString())
        .build();

    return doIngestion(dataSource.getId(), localFileInfo, new BatchIndex(spec, worker));

  }

  public Optional<IngestionHistory> doDBToFileIngestion(DataSource dataSource) {

    Preconditions.checkArgument(dataSource.getSrcType() == JDBC, "Required JDBC type.");

    JdbcIngestionInfo jdbcInfo = dataSource.getIngestionInfoByType();
    jdbcInfo.setFormat(new CsvFileFormat());

    DataConnection connection = Preconditions.checkNotNull(dataSource.getJdbcConnectionForIngestion(), "Required connection info.");

    if (!(connection instanceof JdbcDataConnection)) {
      throw new MetatronException("Required JdbcDataConnecion type.");
    }

    // Select 문을 가지고 CSV 파일로 변환
    List<String> csvFiles = jdbcConnectionService.selectQueryToCsv(
        (JdbcDataConnection) connection,
        jdbcInfo,
        dataSource.getEngineName(),
        dataSource.getFields());

    if (CollectionUtils.isEmpty(csvFiles)) {
      throw new DataSourceIngetionException("Empty result of query.");
    }

    // 파일이 존재하는지 여부 확인 필요
    File tempFile = new File(csvFiles.get(0));
    if (!tempFile.canRead()) {
      throw new DataSourceIngetionException("Temporary file for ingestion are not available.");
    }

    // Middle Manager에 파일 복사
    String worker = copyLocalToRemoteMiddleManager(csvFiles).orElse("");

    // 사전에 DataSource file 준비할 것
    EngineProperties.IngestionInfo ingestionInfo = engineProperties.getIngestion();
    IngestionSpec spec = new IngestionSpecBuilder()
        .dataSchema(dataSource)
        .batchTuningConfig(ingestionOptionService.findTuningOptionMap(IngestionOption.IngestionType.BATCH,
                                                                      jdbcInfo.getTuningOptions()))
        .localIoConfig(ingestionInfo.getBaseDir(), tempFile.getName())
        .build();

    return doIngestion(dataSource.getId(), jdbcInfo, new BatchIndex(spec, worker));
  }

  public Optional<IngestionHistory> doDBIncrementalToFileIngestion(DataSource dataSource) {

    IngestionHistory resultHistory = new IngestionHistory(dataSource.getId());

    // CSV 파일 포맷 선언
    JdbcIngestionInfo jdbcInfo = dataSource.getIngestionInfoByType();
    jdbcInfo.setFormat(new CsvFileFormat());

    DataConnection connection = Preconditions.checkNotNull(dataSource.getJdbcConnectionForIngestion(), "Required connection info.");

    if (!(connection instanceof JdbcDataConnection)) {
      throw new MetatronException("Required JdbcDataConnecion type.");
    }

    // Select 문을 가지고 CSV 파일로 변환
    List<String> csvFiles;
    File tempFile = null;
    try {
      csvFiles = jdbcConnectionService.selectIncrementalQueryToCsv(
          (JdbcDataConnection) connection,
          jdbcInfo,
          dataSource.getEngineName(),
          dataSource.getSummary() == null ? null : dataSource.getSummary().getIngestionMaxTime(),
          dataSource.getFields());

      // 결과 값이 존재하지 않을 경우 PASS
      if (CollectionUtils.isEmpty(csvFiles)) {
        resultHistory.setStatus(PASS, "Fail to get result file");
        return Optional.of(resultHistory);
      }

      // 실제 파일이 존재하지 않거나 Size 가 0 인 경우 PASS
      tempFile = new File(csvFiles.get(0));
      if (!tempFile.exists() || tempFile.length() == 0) {
        resultHistory.setStatus(PASS, "No results.");
        return Optional.of(resultHistory);
      }

    } catch (JdbcDataConnectionException e) {
      resultHistory.setStatus(FAILED, e.getMessage());
      return Optional.of(resultHistory);
    }

    // Middle Manager에 파일 복사
    String worker = copyLocalToRemoteMiddleManager(csvFiles).orElse("");

    // 사전에 DataSource file 준비할 것
    EngineProperties.IngestionInfo ingestionInfo = engineProperties.getIngestion();
    IngestionSpec spec = new IngestionSpecBuilder()
        .dataSchema(dataSource)
        .batchTuningConfig(ingestionOptionService.findTuningOptionMap(IngestionOption.IngestionType.BATCH,
                                                                      jdbcInfo.getTuningOptions()))
        .localIoConfig(ingestionInfo.getBaseDir(), tempFile.getName())
        .build();

    return doIngestion(dataSource.getId(), jdbcInfo, new BatchIndex(spec, worker));

  }

  /**
   * 실제 스펙을 가지고 Ingestion task 전달
   */
  private Optional<IngestionHistory> doIngestion(String dataSourceId, IngestionInfo info, Index spec) {
    String ingestionSpec = null;
    try {
      ingestionSpec = GlobalObjectMapper.getDefaultMapper().writeValueAsString(spec);
    } catch (JsonProcessingException e) {/* Empty statement */}

    LOGGER.info("Ingestion Spec: " + ingestionSpec);
    Map<String, Object> result = null;
    try {
      result = engineRepository.ingestion(ingestionSpec, Map.class)
                               .orElseThrow(() -> new DataSourceIngetionException("Result empty"));
    } catch (Exception e) {
      LOGGER.error("Server error during ingestion : {}", e.getMessage());
      throw new DataSourceIngetionException("Server error during ingestion : " + e.getMessage());
    }

    LOGGER.info("Ingestion Result: " + result);
    IngestionHistory ingestionHistory = new IngestionHistory(dataSourceId);
    ingestionHistory.setIngestionInfo(info);
    if (result.containsKey("task")) {
      String ingestionId = (String) result.get("task");
      ingestionHistory.setIngestionId(ingestionId);

      // 성공 실패 여부를 체크하기 위해 Sleep!
      try {
        Thread.sleep(3000L);
      } catch (InterruptedException e) { /* Empty statement */ }

      IngestionStatusResponse checkResponse = doCheckResult(ingestionId);
      if (checkResponse.getStatus() == FAILED) {
        throw new DataSourceIngetionException("Fail to ingest datasource. please, Check engine.");
      } else {
        ingestionHistory.addResponse(checkResponse);
      }
    } else {
      throw new DataSourceIngetionException("Invalid result of ingestion : " + result);
    }

    return Optional.ofNullable(ingestionHistory);
  }

  /**
   * 실제 스펙을 가지고 Ingestion task 전달
   */
  private Optional<IngestionHistory> doSupervisorIngestion(String dataSourceId, IngestionInfo info, SupervisorIndex spec) {
    String ingestionSpec = null;
    try {
      ingestionSpec = GlobalObjectMapper.getDefaultMapper().writeValueAsString(spec);
    } catch (JsonProcessingException e) {/* Empty statement */}

    LOGGER.info("Ingestion Spec: " + ingestionSpec);
    Map<String, Object> result = engineRepository.supervisorIngestion(ingestionSpec, Map.class)
                                                 .orElseThrow(() -> new DataSourceIngetionException("Result empty"));

    LOGGER.info("Ingestion Result: " + result);
    IngestionHistory ingestionHistory = new IngestionHistory(dataSourceId);
    ingestionHistory.setIngestionInfo(info);
    // Supervisor 타입지정
    ingestionHistory.setIngestionMethod(IngestionHistory.IngestionMethod.SUPERVISOR);
    if (result.containsKey("id")) {
      String ingestionId = (String) result.get("id");
      ingestionHistory.setIngestionId(ingestionId);

      // 성공 실패 여부를 체크하기 위해 Sleep!
      try {
        Thread.sleep(3000L);
      } catch (InterruptedException e) { /* Empty statement */ }

      Optional<String> checkStatus = doSupervisorCheckResult(ingestionId);
      if (!checkStatus.isPresent() || checkStatus.get().equals("FAILED")) {
        throw new DataSourceIngetionException("Fail to ingest datasource. please, Check engine.");
      } else {
        ingestionHistory.setStatus(checkStatus.get());
      }
    } else {
      throw new DataSourceIngetionException("Invalid result of ingestion : " + result);
    }

    return Optional.ofNullable(ingestionHistory);
  }

  /**
   * MiddleManager가 위치한 서버에 파일 업로드, Local 일 경우 Empty
   *
   * @return Dedicated worker host, if success.
   */
  private Optional<String> copyLocalToRemoteMiddleManager(List<String> fileNames) {

    String dedicatedWorker = engineMetaRepository.dedicatedWorker().orElse(DEFAULT_DEDICATED_WORKER);
    String targetHost = StringUtils.substringBefore(dedicatedWorker, ":");

    EngineProperties.IngestionInfo ingestionInfo = engineProperties.getIngestion();
    FileLoaderProperties loaderProperties = ingestionInfo.getLoader();

    fileLoaderFactory.put(targetHost, loaderProperties, fileNames.toArray(new String[fileNames.size()]));

    return Optional.of(dedicatedWorker);
  }

  private String makeOrcTypeSchema(EngineProperties.HiveConnection hiveProperties, String source) {
    HiveConnection connection = new HiveConnection();
    connection.setUrl(hiveProperties.getUrl());
    connection.setHostname(hiveProperties.getHostname());
    connection.setPort(hiveProperties.getPort());
    connection.setUsername(hiveProperties.getUsername());
    connection.setPassword(hiveProperties.getPassword());

    String[] splited = StringUtils.split(source, ".");
    String schema = splited.length == 1 ? "default" : splited[0];

    HiveTableInformation hiveTableInformation = jdbcConnectionService.showHiveTableDescription(connection, schema,
                                                                                               splited[1], false);

    List<String> columnPairs = Lists.newArrayList();
    for (Field field : hiveTableInformation.getFields()) {
      columnPairs.add(field.getName() + ":" + field.getOriginalType());
    }

    return "struct<" + StringUtils.join(columnPairs, ",") + ">";
  }
}
