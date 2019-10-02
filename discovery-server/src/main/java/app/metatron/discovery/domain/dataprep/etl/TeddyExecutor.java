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

package app.metatron.discovery.domain.dataprep.etl;

import static app.metatron.discovery.domain.dataprep.PrepProperties.ETL_CORES;
import static app.metatron.discovery.domain.dataprep.PrepProperties.ETL_EXPLICIT_GC;
import static app.metatron.discovery.domain.dataprep.PrepProperties.ETL_LIMIT_ROWS;
import static app.metatron.discovery.domain.dataprep.PrepProperties.ETL_TIMEOUT;
import static app.metatron.discovery.domain.dataprep.PrepProperties.HADOOP_CONF_DIR;
import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_HOSTNAME;
import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_METASTORE_URI;
import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_PASSWORD;
import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_PORT;
import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_USERNAME;
import static app.metatron.discovery.domain.dataprep.entity.PrSnapshot.STATUS.RUNNING;
import static app.metatron.discovery.domain.dataprep.entity.PrSnapshot.STATUS.TABLE_CREATING;
import static app.metatron.discovery.domain.dataprep.entity.PrSnapshot.STATUS.WRITING;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_CLOSE_CSV;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FAILED_TO_WRITE_CSV;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.snapshotError;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot.HIVE_FILE_COMPRESSION;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot.HIVE_FILE_FORMAT;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.file.PrepCsvUtil;
import app.metatron.discovery.domain.dataprep.file.PrepJsonUtil;
import app.metatron.discovery.domain.dataprep.file.PrepParseResult;
import app.metatron.discovery.domain.dataprep.service.PrSnapshotService;
import app.metatron.discovery.domain.dataprep.teddy.ColumnDescription;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.DataFrameService;
import app.metatron.discovery.domain.dataprep.teddy.Row;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.IllegalColumnNameForHiveException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.util.DbInfo;
import app.metatron.discovery.domain.dataprep.util.PrepUtil;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.prep.parser.exceptions.RuleException;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.Join;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Maps;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.io.FilenameUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;

@Service
public class TeddyExecutor {

  private static Logger LOGGER = LoggerFactory.getLogger(TeddyExecutor.class);

  Map<String, Object> jobList = Maps.newHashMap();

  @Autowired(required = false)
  DataFrameService dataFrameService;

  @Autowired
  PrSnapshotService snapshotService;

  @Autowired
  TeddyExecCallback callback;

  public String hadoopConfDir = null;
  Configuration hadoopConf = null;

  public String hiveHostname;
  public Integer hivePort;
  public String hiveUsername;
  public String hivePassword;
  public String hiveCustomUrl;

  public Integer timeout;
  public Integer cores;
  public Integer limitRows;
  public Boolean explicitGC;

  String oauth_token;
  String restAPIserverPort;

  Map<String, String> replaceMap = new HashMap(); // origTeddyDsId -> newFullDsId
  Map<String, String> reverseMap = new HashMap(); // newFullDsId -> origTeddyDsId

  private Map<String, DataFrame> cache = Maps.newHashMap();
  private Map<String, Long> snapshotRuleDoneCnt = new HashMap();

  private Long incrRuleCntDone(String ssId) {
    Long cnt = snapshotRuleDoneCnt.get(ssId);
    snapshotRuleDoneCnt.put(ssId, ++cnt);
    return cnt;
  }

  private void setPrepPropertiesInfo(Map<String, Object> prepPropertiesInfo) {
    hadoopConfDir = (String) prepPropertiesInfo.get(HADOOP_CONF_DIR);

    hiveHostname = (String) prepPropertiesInfo.get(STAGEDB_HOSTNAME);
    hivePort = (Integer) prepPropertiesInfo.get(STAGEDB_PORT);
    hiveUsername = (String) prepPropertiesInfo.get(STAGEDB_USERNAME);
    hivePassword = (String) prepPropertiesInfo.get(STAGEDB_PASSWORD);
    hiveCustomUrl = (String) prepPropertiesInfo.get(STAGEDB_METASTORE_URI);

    cores = (Integer) prepPropertiesInfo.get(ETL_CORES);
    timeout = (Integer) prepPropertiesInfo.get(ETL_TIMEOUT);
    limitRows = (Integer) prepPropertiesInfo.get(ETL_LIMIT_ROWS);
    explicitGC = (Boolean) prepPropertiesInfo.get(ETL_EXPLICIT_GC);

    if (hadoopConfDir != null) {
      hadoopConf = PrepUtil.getHadoopConf(hadoopConfDir);
    }
  }

  @Async("prepThreadPoolTaskExecutor")
  public Future<String> run(String[] argv) {
    Future<String> result = null;
    String ssId = "";

    try {
      Map<String, Object> prepPropertiesInfo = GlobalObjectMapper.readValue(argv[0], HashMap.class);
      Map<String, Object> dsInfo = GlobalObjectMapper.readValue(argv[1], HashMap.class);
      Map<String, Object> snapshotInfo = GlobalObjectMapper.readValue(argv[2], HashMap.class);
      Map<String, Object> callbackInfo = GlobalObjectMapper.readValue(argv[3], HashMap.class);

      callback.setCallbackInfo(callbackInfo);

      setPrepPropertiesInfo(prepPropertiesInfo);

      ssId = (String) snapshotInfo.get("ssId");
      snapshotRuleDoneCnt.put(ssId, 0L);
      long ruleCntTotal = countAllRules(dsInfo);

      callback.updateSnapshot(ssId, "ruleCntTotal", String.valueOf(ruleCntTotal));
      callback.updateSnapshotStatus(ssId, RUNNING);

      String ssType = (String) snapshotInfo.get("ssType");

      if (ssType.equals(PrSnapshot.SS_TYPE.URI.name())) {
        result = createUriSnapshot(dsInfo, snapshotInfo);
      } else if (ssType.equals(PrSnapshot.SS_TYPE.STAGING_DB.name())) {
        result = createStagingDbSnapshot(hadoopConfDir, dsInfo, snapshotInfo);
      } else {
        updateAsFailed(ssId);
        throw new IllegalArgumentException("run(): ssType not supported: ssType=" + ssType);
      }
    } catch (CancellationException ce) {
      LOGGER.info("run(): snapshot canceled from run_internal(): ", ce);
      callback.updateSnapshot(ssId, "finishTime", DateTime.now(DateTimeZone.UTC).toString());
      updateAsCanceled(ssId);
      StringBuffer sb = new StringBuffer();

      for (StackTraceElement ste : ce.getStackTrace()) {
        sb.append("\n");
        sb.append(ste.toString());
      }
      callback.updateSnapshot(ssId, "custom", "{'fail_msg':'" + sb.toString() + "'}");
      throw ce;
    } catch (IOException | SQLException | ClassNotFoundException | InterruptedException | TeddyException |
            TimeoutException | URISyntaxException e) {
      LOGGER.error("run(): error while creating a snapshot: ", e);
      callback.updateSnapshot(ssId, "finishTime", DateTime.now(DateTimeZone.UTC).toString());
      updateAsFailed(ssId);
      StringBuffer sb = new StringBuffer();

      for (StackTraceElement ste : e.getStackTrace()) {
        sb.append("\n");
        sb.append(ste.toString());
      }
      callback.updateSnapshot(ssId, "custom", "{'fail_msg':'" + sb.toString() + "'}");
    }

    LOGGER.info("run(): success from run_internal(): {}", result != null ? result.toString() : "null");
    return result;
  }

  private int writeCsv(String strUri, DataFrame df, String ssId) {
    CSVPrinter printer = PrepCsvUtil.getPrinter(strUri, hadoopConf);
    String errmsg = null;

    try {
      for (int colno = 0; colno < df.getColCnt(); colno++) {
        printer.print(df.getColName(colno));
      }
      printer.println();

      for (int rowno = 0; rowno < df.rows.size(); snapshotService.cancelCheck(ssId, ++rowno)) {
        Row row = df.rows.get(rowno);
        for (int colno = 0; colno < df.getColCnt(); ++colno) {
          printer.print(row.get(colno));
        }
        printer.println();
      }
    } catch (IOException e) {
      errmsg = e.getMessage();
    }

    try {
      printer.close(true);
    } catch (IOException e) {
      throw snapshotError(MSG_DP_ALERT_FAILED_TO_CLOSE_CSV, e.getMessage());
    }

    if (errmsg != null) {
      throw snapshotError(MSG_DP_ALERT_FAILED_TO_WRITE_CSV, errmsg);
    }

    return df.rows.size();
  }

  private int writeJson(String strUri, DataFrame df, String ssId) {
    LOGGER.debug("TeddyExecutor.wirteJSON(): strUri={} hadoopConfDir={}", strUri, hadoopConfDir);
    PrintWriter printWriter = PrepJsonUtil.getJsonPrinter(strUri, hadoopConf);
    ObjectMapper mapper = new ObjectMapper();
    String errmsg = null;

    try {
      for (int rowno = 0; rowno < df.rows.size(); snapshotService.cancelCheck(ssId, ++rowno)) {
        Row row = df.rows.get(rowno);
        Map<String, Object> jsonRow = new LinkedHashMap();

        for (int colno = 0; colno < df.getColCnt(); ++colno) {
          if (df.getColType(colno).equals(ColumnType.TIMESTAMP)) {
            if (row.get(colno) == null) {
              jsonRow.put(df.getColName(colno), row.get(colno));
            } else {
              jsonRow.put(df.getColName(colno), ((DateTime) row.get(colno))
                      .toString(df.getColTimestampStyle(colno), Locale.ENGLISH));
            }
          } else {
            jsonRow.put(df.getColName(colno), row.get(colno));
          }
        }

        String json = mapper.writeValueAsString(jsonRow);
        printWriter.println(json);
      }
    } catch (IOException e) {
      errmsg = e.getMessage();
    }

    try {
      printWriter.close();
    } catch (Exception e) {
      throw snapshotError(MSG_DP_ALERT_FAILED_TO_CLOSE_CSV, e.getMessage());
    }

    if (errmsg != null) {
      throw snapshotError(MSG_DP_ALERT_FAILED_TO_WRITE_CSV, errmsg);
    }

    return df.rows.size();
  }

  private Future<String> createUriSnapshot(Map<String, Object> dsInfo, Map<String, Object> snapshotInfo)
          throws JsonProcessingException, TimeoutException, TeddyException, InterruptedException, SQLException,
          URISyntaxException, ClassNotFoundException {
    LOGGER.info("createUriSnapshot(): started");

    // master dataset 정보에 모든 upstream 정보도 포함되어있음.
    String ssId = (String) snapshotInfo.get("ssId");
    String masterTeddyDsId = ((String) dsInfo.get("origTeddyDsId"));
    transformRecursive(dsInfo, ssId);
    String masterFullDsId = replaceMap.get(masterTeddyDsId);

    callback.updateSnapshotStatus(ssId, WRITING);

    DataFrame df = cache.get(masterFullDsId);

    String storedUri = (String) snapshotInfo.get("storedUri");

    switch (PrSnapshot.getFileFormatByUri(storedUri)) {
      case CSV:
        writeCsv(storedUri, df, ssId);
        break;
      case JSON:
        writeJson(storedUri, df, ssId);
        break;
      default:
        assert false : storedUri;
    }

    String jsonColDescs = GlobalObjectMapper.getDefaultMapper().writeValueAsString(df.colDescs);
    callback.updateSnapshot(ssId, "custom", "{'colDescs':" + jsonColDescs + "}");

    // master를 비롯해서, 스냅샷 생성을 위해 새로 만들어진 모든 full dataset을 제거
    for (String fullDsId : reverseMap.keySet()) {
      cache.remove(fullDsId);
    }

    LOGGER.info("createUriSnapshot() finished: totalLines={}", df.rows.size());

    DateTime finishTime = DateTime.now(DateTimeZone.UTC);
    callback.updateSnapshot(ssId, "finishTime", finishTime.toString());
    callback.updateSnapshot(ssId, "totalLines", String.valueOf(df.rows.size()));
    updateAsSucceeded(ssId);

    return new AsyncResult("Success");
  }

  private Future<String> createStagingDbSnapshot(String hadoopConfDir, Map<String, Object> dsInfo,
          Map<String, Object> snapshotInfo)
          throws TeddyException, SQLException, IOException, ClassNotFoundException, InterruptedException,
          TimeoutException, URISyntaxException {
    LOGGER.info("hadoopConfDir={}", hadoopConfDir);
    LOGGER.info("hive: hostname={} port={} username={}", hiveHostname, hivePort, hiveUsername);
    LOGGER.info("callback: restAPIserverPort={} oauth_token={}", restAPIserverPort,
            oauth_token.substring(0, 10));

    LOGGER.info("run(): adding hadoop config files (if exists): " + hadoopConfDir);

    // master dataset 정보에 모든 upstream 정보도 포함되어있음.
    String ssId = (String) snapshotInfo.get("ssId");
    String masterTeddyDsId = ((String) dsInfo.get("origTeddyDsId"));
    transformRecursive(dsInfo, ssId);
    String masterFullDsId = replaceMap.get(masterTeddyDsId);

    // Some rules like pivot may break Hive column naming rule.
    DataFrame finalDf = cache.get(masterFullDsId);
    finalDf.checkAlphaNumericalColNames();

    List<String> ruleStrings = (List<String>) dsInfo.get("ruleStrings");
    List<String> partKeys = (List<String>) snapshotInfo.get("partitionColNames");
    String format = (String) snapshotInfo.get("hiveFileFormat");
    String compression = (String) snapshotInfo.get("hiveFileCompression");
    String database = (String) snapshotInfo.get("dbName");
    String tableName = (String) snapshotInfo.get("tblName");
    String extHdfsDir = snapshotInfo.get("stagingBaseDir") + File.separator + "snapshots";

    // totalLines는 아래 함수 안에서 설정함
    createHiveSnapshotInternal(ssId, masterFullDsId, ruleStrings, partKeys, database, tableName,
            extHdfsDir, format, compression);

    String jsonColDescs = GlobalObjectMapper.getDefaultMapper()
            .writeValueAsString(finalDf.colDescs);
    callback.updateSnapshot(ssId, "custom", "{'colDescs':" + jsonColDescs + "}");

    // master를 비롯해서, 스냅샷 생성을 위해 새로 만들어진 모든 full dataset을 제거
    for (String fullDsId : reverseMap.keySet()) {
      cache.remove(fullDsId);
    }

    LOGGER.info("createStagingDbSnapshot() finished");

    DateTime finishTime = DateTime.now(DateTimeZone.UTC);
    callback.updateSnapshot(ssId, "finishTime", finishTime.toString());
    // totalLines is already written in writeCsvForStagingDbSnapshot()
    updateAsSucceeded(ssId);

    return new AsyncResult("Success");
  }

  // returns slaveFullDsIds
  void transformRecursive(Map<String, Object> dsInfo, String ssId)
          throws ClassNotFoundException, SQLException, TeddyException, URISyntaxException, TimeoutException,
          InterruptedException {
    snapshotService.cancelCheck(ssId);
    String origTeddyDsId = (String) dsInfo.get("origTeddyDsId");

    String newFullDsId = createStage0(dsInfo);
    replaceMap.put(origTeddyDsId, newFullDsId);
    reverseMap.put(newFullDsId, origTeddyDsId);

    List<Map<String, Object>> upstreamDatasetInfos;
    upstreamDatasetInfos = (List<Map<String, Object>>) dsInfo.get("upstreamDatasetInfos");
    for (Map<String, Object> upstreamDatasetInfo : upstreamDatasetInfos) {
      transformRecursive(upstreamDatasetInfo, ssId);
    }

    List<String> ruleStrings = (List<String>) dsInfo.get("ruleStrings");
    List<String> replacedRuleStrings = new ArrayList();
    for (String ruleString : ruleStrings) {
      String replacedRuleString = ruleString;
      for (String key : replaceMap.keySet()) {
        if (ruleString.contains(key)) {
          replacedRuleString = replacedRuleString.replace(key, replaceMap.get(key));
        }
      }
      replacedRuleStrings.add(replacedRuleString);
    }
    applyRuleStrings(newFullDsId, replacedRuleStrings, ssId);
  }

  // returns total rule count of the snapshot (including slave datasets)
  long countAllRules(Map<String, Object> dsInfo) {
    long ruleCntTotal = 0L;

    for (Map<String, Object> upstreamDatasetInfo : (List<Map<String, Object>>) dsInfo.get("upstreamDatasetInfos")) {
      ruleCntTotal += countAllRules(upstreamDatasetInfo);
    }

    return ruleCntTotal + ((List<String>) dsInfo.get("ruleStrings")).size();
  }

  private void applyRuleStrings(String masterFullDsId, List<String> ruleStrings, String ssId)
          throws TeddyException, InterruptedException, TimeoutException {
    LOGGER.trace("applyRuleStrings(): start");
    // multi-thread
    for (String ruleString : ruleStrings) {     // create rule has been removed already
      List<Future<List<Row>>> futures = new ArrayList();
      List<DataFrame> slaveDfs = new ArrayList();

      Rule rule = new RuleVisitorParser().parse(ruleString);

      // FIXME: use 'rule'. avoid redundant parsing
      List<String> slaveDsIds = DataFrameService.getSlaveDsIds(ruleString);
      if (slaveDsIds != null) {
        for (String slaveDsId : slaveDsIds) {
          slaveDfs.add(cache.get(slaveDsId));
        }
      }

      DataFrame df = cache.get(masterFullDsId);
      DataFrame newDf = DataFrame.getNewDf(rule, df.dsName, ruleString);

      try {
        LOGGER.debug("applyRuleStrings(): start: ruleString={}", ruleString);
        List<Object> preparedArgs = newDf.prepare(df, rule, slaveDfs);
        int rowcnt = df.rows.size();

        if (rowcnt > 0) {
          if (DataFrame.isParallelizable(rule)) {
            int partSize = rowcnt / cores + 1;  // +1 to prevent being 0

            // Outer joins cannot be parallelized. (But, implemented as prepare-gather structure)
            if (rule.getName().equals("join")
                    && ((Join) rule).getJoinType().equalsIgnoreCase("INNER") == false) {
              partSize = rowcnt;
            }

            for (int rowno = 0; rowno < rowcnt; rowno += partSize) {
              LOGGER.debug("applyRuleStrings(): add thread: rowno={} partSize={} rowcnt={}", rowno,
                      partSize, rowcnt);
              futures.add(dataFrameService
                      .gatherAsync(df, newDf, preparedArgs, rowno, Math.min(partSize, rowcnt - rowno),
                              limitRows));
            }

            snapshotService.cancelCheck(ssId);
            addJob(ssId, futures);

            for (int i = 0; i < futures.size(); i++) {
              List<Row> rows = futures.get(i).get(timeout, TimeUnit.SECONDS);
              assert rows != null : rule.toString();
              newDf.rows.addAll(rows);
            }

            removeJob(ssId);
          } else {
            // if not parallelizable, newDf comes to be modified directly.
            // then, 'rows' returned is only for assertion.
            List<Row> rows = newDf.gather(df, preparedArgs, 0, rowcnt, limitRows);
            assert rows == null : ruleString;
          }
        }
      } catch (RuleException e) {
        LOGGER.error("applyRuleStrings(): rule syntax error: ", e);
        throw PrepException.fromTeddyException(TeddyException.fromRuleException(e));
      } catch (ExecutionException e) {
        e.getCause().printStackTrace();
        LOGGER.error("applyRuleStrings(): execution error on " + ruleString, e);
      }

      LOGGER.debug("applyRuleStrings(): end: ruleString={}", ruleString);
      cache.put(masterFullDsId, newDf);
      callback.updateSnapshot(ssId, "ruleCntDone", String.valueOf(incrRuleCntDone(ssId)));

      if (explicitGC) {
        System.gc();
      }
    }

    LOGGER.trace("applyRuleStrings(): end");
  }

  private void loadCsvFile(String dsId, String strUri, String delimiter, Integer columnCount)
          throws URISyntaxException {
    DataFrame df = new DataFrame();

    LOGGER.info("loadCsvFile(): dsId={} strUri={} delemiter={}", dsId, strUri, delimiter);

    PrepParseResult result = PrepCsvUtil.parse(strUri, delimiter, limitRows, columnCount, hadoopConf);
    df.setByGrid(result);

    LOGGER.info("loadCsvFile(): done");
    cache.put(dsId, df);
  }

  private void loadJsonFile(String dsId, String strUri, Integer columnCount)
          throws URISyntaxException {
    DataFrame df = new DataFrame();

    LOGGER.info("loadJsonFile(): dsId={} strUri={}", dsId, strUri);

    PrepParseResult result = PrepJsonUtil.parse(strUri, limitRows, columnCount, hadoopConf);
    df.setByGrid(result);

    LOGGER.info("loadJsonFile(): done");
    cache.put(dsId, df);
  }

  public String createStage0(Map<String, Object> dsInfo)
          throws URISyntaxException, TeddyException, SQLException, ClassNotFoundException {
    String newFullDsId = UUID.randomUUID().toString();

    LOGGER.trace("TeddyExecutor.createStage0(): newFullDsId={}", newFullDsId);

    if (dsInfo.get("importType") == null) {
      throw new IllegalArgumentException(
              "TeddyExecutor.createStage0(): importType should not be null");
    }

    String importType = (String) dsInfo.get("importType");
    switch (importType) {
      case "UPLOAD":
      case "URI":
        String storedUri = (String) dsInfo.get("storedUri");
        Integer columnCount = (Integer) dsInfo.get("manualColumnCount");
        String extensionType = FilenameUtils.getExtension(storedUri).toLowerCase();
        if (extensionType.equals("json")) {
          loadJsonFile(newFullDsId, storedUri, columnCount);
        } else {
          String delimiter = (String) dsInfo.get("delimiter");
          loadCsvFile(newFullDsId, storedUri, delimiter, columnCount);
        }
        break;

      case "DATABASE":
        String implementor = (String) dsInfo.get("implementor");
        String connectUri = (String) dsInfo.get("connectUri");
        String username = (String) dsInfo.get("username");
        String password = (String) dsInfo.get("password");

        DbInfo dbInfo = new DbInfo(implementor, connectUri, username, password);
        loadJdbcTable(newFullDsId, (String) dsInfo.get("sourceQuery"), dbInfo);
        break;

      case "STAGING_DB":
        loadHiveTable(newFullDsId, (String) dsInfo.get("sourceQuery"));
        break;

      default:
        throw new IllegalArgumentException("TeddyExecutor.createStage0(): not supported importType: " + importType);
    }

    LOGGER.trace("TeddyExecutor.createStage0(): end");
    return newFullDsId;
  }

  private String processArray(ColumnDescription colDesc) {
    ColumnType uniformSubType = colDesc.hasUniformSubType();
    String strType;

    switch (uniformSubType) {
      case STRING:
        strType = "array<string>";
        break;
      case LONG:
        strType = "array<bigint>";
        break;
      case DOUBLE:
        strType = "array<double>";
        break;
      case BOOLEAN:
        strType = "array<boolean>";
        break;
      case TIMESTAMP:
        strType = "array<timestamp>";
        break;
      default:
        StringBuffer sb = new StringBuffer();
        sb.append("struct<");
        for (int i = 0; i < colDesc.getArrColDesc().size(); i++) {
          ColumnDescription subColDesc = colDesc.getArrColDesc().get(i);
          if (i > 0) {
            sb.append(",");
          }
          sb.append(String.format("c%d:%s", i, fromColumnTypetoHiveType(subColDesc.getType(), subColDesc)));
        }
        strType = sb.append(">").toString();
        break;
    }
    return strType;
  }

  private String processMap(ColumnDescription colDesc) {
    StringBuffer sb = new StringBuffer();
    sb.append("struct<");

    List<String> keys = colDesc.getMapColDesc().keySet().stream().collect(Collectors.toList());
    for (int i = 0; i < keys.size(); i++) {
      String key = keys.get(i);
      ColumnDescription subColDesc = colDesc.getMapColDesc().get(key);
      if (i > 0) {
        sb.append(",");
      }
      sb.append(String.format("%s:%s", key, fromColumnTypetoHiveType(subColDesc.getType(), subColDesc)));
    }
    return sb.append(">").toString();
  }

  public String fromColumnTypetoHiveType(ColumnType colType, ColumnDescription colDesc) {
    switch (colType) {
      case STRING:
        return "string";
      case LONG:
        return "bigint";
      case DOUBLE:
        return "double";
      case BOOLEAN:
        return "boolean";
      case TIMESTAMP:
        return "timestamp";
      case ARRAY:
        return processArray(colDesc);
      case MAP:
        return processMap(colDesc);
      case UNKNOWN:
        assert false : colType;
    }
    return null;
  }

  public void appendColumn(StringBuffer sb, DataFrame df, int colno, boolean withComma) {
    if (withComma) {
      sb.append(", ");
    }
    sb.append(String.format("`%s` ", df.getColName(colno)));
    sb.append(fromColumnTypetoHiveType(df.getColType(colno), df.getColDesc(colno)));
  }

  public void makeHiveTable(DataFrame df, List<String> partitions, String fullTblName, String location,
          HIVE_FILE_FORMAT hiveFileFormat, HIVE_FILE_COMPRESSION compression)
          throws SQLException, ClassNotFoundException {
    StringBuffer createTable = null;
    StringBuffer partitionedBy = null;

    for (int colno = 0; colno < df.getColCnt(); colno++) {
      if (!partitions.contains(df.getColName(colno))) {
        if (createTable == null) {
          createTable = new StringBuffer();
          createTable.append(String.format("CREATE EXTERNAL TABLE %s (", fullTblName));
          appendColumn(createTable, df, colno, false);
        } else {
          appendColumn(createTable, df, colno, true);
        }
      } else {
        if (partitionedBy == null) {
          partitionedBy = new StringBuffer();
          partitionedBy.append("PARTITIONED BY (");
          appendColumn(partitionedBy, df, colno, false);
        } else {
          appendColumn(partitionedBy, df, colno, true);
        }
      }
    }
    createTable.append(")");
    if (partitions.size() > 0) {
      assert partitionedBy != null : partitions;
      createTable.append(String.format(" %s)", partitionedBy));
    }

    switch (hiveFileFormat) {
      case CSV:
        // By the method below, we cannot designate the quote character.
        // We cannot prevent the comma from spliting even if it's inside quotes.
        // Instead, we can preserve the types. (cf. see the other method)
        createTable.append(String.format(
                " ROW FORMAT DELIMITED FIELDS TERMINATED BY ',' STORED AS TEXTFILE LOCATION '%s'",
                location));

        // By the method below, we can designate the quote character.
        // But all the columns loose their types and become strings.
        //        String quote = "\"";
        //        String slash = "\\";
        //        createTable.append(" ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.OpenCSVSerde' ");
        //        createTable.append("WITH SERDEPROPERTIES (");
        //        createTable.append(String.format("%sseparatorChar%s = %s%s,%s, ", quote, quote, quote, slash, quote));        // "separatorChar" = "\,",
        //        createTable.append(String.format("%squoteChar%s     = %s%s%s%s", quote, quote, quote, slash, quote, quote));  // "quoteChar"     = "\""
        //        createTable.append(")");
        //        createTable.append(String.format(" STORED AS TEXTFILE LOCATION '%s'", location));
        break;
      case ORC:
        createTable.append(String
                .format(" STORED AS ORC LOCATION '%s' TBLPROPERTIES (\"orc.compress\"=\"%s\")", location,
                        compression.name()));
        break;
      default:
        assert false : hiveFileFormat;
    }
    LOGGER.info("makeHiveTable(): create table statement=" + createTable.toString());

    Statement hiveStmt = getHiveStatement();

    try {
      hiveStmt.execute("DROP TABLE IF EXISTS " + fullTblName);
    } catch (SQLException e) {
      // suppress the exception (table not found)
    }

    try {
      hiveStmt.execute(createTable.toString());
      if (partitions.size() != 0) {
        hiveStmt.execute("MSCK REPAIR TABLE " + fullTblName);
      }
    } catch (SQLException e) {
      LOGGER.error("makeHiveTable(): failed to create table with JDBC: statement=" + createTable.toString());
      throw e;
    }
  }

  public String writeCsvForStagingDbSnapshot(String ssId, String dsId, String extHdfsDir, String dbName, String tblName,
          HIVE_FILE_FORMAT hiveFileFormat, HIVE_FILE_COMPRESSION compression)
          throws IOException, IllegalColumnNameForHiveException {
    Integer[] rowCnt = new Integer[2];
    FileSystem fs = FileSystem.get(hadoopConf);

    LOGGER.trace("writeCsvForStagingDbSnapshot(): start");
    assert extHdfsDir.equals("") == false : extHdfsDir;
    LOGGER.info("extHdfsDir=" + extHdfsDir);

    Path dir = new Path(extHdfsDir + "/" + dbName + "/" + tblName);
    if (fs.exists(dir)) {
      fs.delete(dir, true);
    }

    DataFrame df = cache.get(dsId);

    switch (hiveFileFormat) {
      case CSV:
        String strUri = dir.toString() + File.separator + "part-00000-" + dsId + ".csv";
        rowCnt[0] = writeCsv(strUri, df, ssId);
        break;
      case ORC:
        df.lowerColNames();
        Path file = new Path(dir.toString() + File.separator + "part-00000-" + dsId + ".orc");
        TeddyOrcWriter orcWriter = new TeddyOrcWriter();
        rowCnt = orcWriter.writeOrc(df, hadoopConf, file, compression);
        break;
      default:
        assert false : hiveFileFormat;
    }

    Path success = new Path(extHdfsDir + File.separator + "_SUCCESS");
    Path byTeddy = new Path(extHdfsDir + File.separator + "_BY_TEDDY");

    FSDataOutputStream fin = fs.create(success);
    fin.close();
    fin = fs.create(byTeddy);
    fin.close();

    callback.updateSnapshot(ssId, "totalLines", String.valueOf(rowCnt[0]));
    ObjectMapper mapper = GlobalObjectMapper.getDefaultMapper();

    if (rowCnt[1] != null && rowCnt[1] > 0) {
      Map<String, Object> lineageInfo = snapshotService.getSnapshotLineageInfo(ssId);
      lineageInfo.put("excludedLines", rowCnt[1]);
      callback.updateSnapshot(ssId, "lineageInfo", mapper.writeValueAsString(lineageInfo));
    }

    LOGGER.trace("writeCsvForStagingDbSnapshot(): end");
    return dir.toUri().toString();
  }

  public void createHiveSnapshotInternal(String ssId, String masterFullDsId, List<String> ruleStrings,
          List<String> partKeys, String dbName, String tblName, String extHdfsDir, String format, String compression)
          throws IOException, IllegalColumnNameForHiveException, SQLException, ClassNotFoundException {
    LOGGER.info(
            "createHiveSnapshotInternal(): ruleStrings.size()={} fullTblName={}.{} format={} compression={}",
            ruleStrings.size(), dbName, tblName, format, compression);
    HIVE_FILE_FORMAT enumFormat = null;
    HIVE_FILE_COMPRESSION enumCompression = null;

    // format -> CSV or ORC
    if (format.equalsIgnoreCase(HIVE_FILE_FORMAT.CSV.name())) {
      enumFormat = HIVE_FILE_FORMAT.CSV;
    } else if (format.equalsIgnoreCase(HIVE_FILE_FORMAT.ORC.name())) {
      enumFormat = HIVE_FILE_FORMAT.ORC;

      // compression -> SNAPPY, ZLIB or LZO
      if (compression.equalsIgnoreCase(HIVE_FILE_COMPRESSION.SNAPPY.name())) {
        enumCompression = HIVE_FILE_COMPRESSION.SNAPPY;
      } else if (compression.equalsIgnoreCase(HIVE_FILE_COMPRESSION.ZLIB.name())) {
        enumCompression = HIVE_FILE_COMPRESSION.ZLIB;
      } else if (compression.equalsIgnoreCase(HIVE_FILE_COMPRESSION.NONE.name())) {
        enumCompression = HIVE_FILE_COMPRESSION.NONE;
      } else if (compression.equalsIgnoreCase(HIVE_FILE_COMPRESSION.LZO.name())) {
        assert false : "LZO not supported by embedded engine";
      } else {
        assert false : compression;   // FIXME: make and throw an appropriate Exception
      }

    } else {
      assert false : format;  // FIXME: make and throw an appropriate Exception
    }

    callback.updateSnapshotStatus(ssId, WRITING);

    String location = writeCsvForStagingDbSnapshot(ssId, masterFullDsId, extHdfsDir, dbName,
            tblName, enumFormat, enumCompression);

    callback.updateSnapshotStatus(ssId, TABLE_CREATING);
    makeHiveTable(cache.get(masterFullDsId), partKeys, dbName + "." + tblName, location, enumFormat,
            enumCompression);

    LOGGER.trace("createHiveSnapshotInternal(): end");
  }

  private Statement getJdbcStatement(String implementor, String connectUri, String username, String password)
          throws SQLException, ClassNotFoundException {

    DataConnection jdbcDataConnection = new DataConnection();
    jdbcDataConnection.setImplementor(implementor);
    jdbcDataConnection.setUsername(username);
    jdbcDataConnection.setPassword(password);
    jdbcDataConnection.setUrl(connectUri);

    JdbcDialect dialect = DataConnectionHelper.lookupDialect(jdbcDataConnection);
    String driverClass = dialect.getDriverClass(jdbcDataConnection);
    try {
      if (driverClass != null) {
        Class.forName(driverClass);
      }
      Connection conn = DriverManager.getConnection(connectUri, jdbcDataConnection.getUsername(),
              jdbcDataConnection.getPassword());
      return conn.createStatement();
    } catch (ClassNotFoundException e) {
      LOGGER.error(String
              .format("getJdbcStatement(): ClassNotFoundException occurred: driver-class-name=%s",
                      driverClass), e);
      throw e;
    } catch (SQLException e) {
      LOGGER.error(String
              .format("getJdbcStatement(): SQLException occurred: connStr=%s username=%s password=%s",
                      connectUri, jdbcDataConnection.getUsername(), jdbcDataConnection.getPassword()), e);
      throw e;
    }
  }

  private Statement getHiveStatement() throws SQLException, ClassNotFoundException {
    DataConnection hiveConn = new DataConnection();
    hiveConn.setImplementor("HIVE");
    hiveConn.setHostname(hiveHostname);
    hiveConn.setPort(Integer.valueOf(hivePort));
    hiveConn.setUsername(hiveUsername);
    hiveConn.setPassword(hivePassword);
    hiveConn.setUrl(hiveCustomUrl);

    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(hiveConn);
    Statement stmt;
    Connection conn;
    try {
      conn = jdbcDataAccessor.getConnection();
      stmt = conn.createStatement();
    } catch (SQLException e) {
      LOGGER.error(String.format("getHiveStatement(): SQLException occurred: connStr=%s username=%s password=%s",
              jdbcDataAccessor.getDialect().getConnectUrl(hiveConn), hiveConn.getUsername(), hiveConn.getPassword()),
              e);
      throw e;
    }
    return stmt;
  }

  public void loadJdbcTable(String dsId, String sql, DbInfo db)
          throws SQLException, ClassNotFoundException, TeddyException {
    Statement stmt = getJdbcStatement(db.implementor, db.connectUri, db.username, db.password);
    DataFrame df = new DataFrame();

    LOGGER.info(String.format("loadJdbcTable(): dsId=%s sql=%s, implementor=%s, connectUri=%s, username=%s", dsId, sql,
            db.implementor, db.connectUri, db.username));

    df.setByJDBC(stmt, sql, limitRows);
    cache.put(dsId, df);

    LOGGER.trace("loadJdbcTable(): end");
  }

  public void loadHiveTable(String dsId, String sql) throws SQLException, ClassNotFoundException, TeddyException {
    Statement stmt = getHiveStatement();
    DataFrame df = new DataFrame();

    LOGGER.info(String.format("loadHiveTable(): dsId=%s sql=%s", dsId, sql));

    df.setByJDBC(stmt, sql, limitRows);
    cache.put(dsId, df);

    LOGGER.trace("loadHiveTable(): end");
  }

  public List<Future<List<Row>>> getJob(String key) {
    return (List<Future<List<Row>>>) jobList.get(key);
  }

  synchronized private void addJob(String key, Object value) {
    jobList.put(key, value);
  }

  private void removeJob(String key) {
    jobList.remove(key);
  }

  private void updateAsSucceeded(String ssId) {
    callback.updateSnapshot(ssId, "status", PrSnapshot.STATUS.SUCCEEDED.name());
    snapshotRuleDoneCnt.remove(ssId);
  }

  private void updateAsFailed(String ssId) {
    callback.updateSnapshot(ssId, "status", PrSnapshot.STATUS.FAILED.name());
    snapshotRuleDoneCnt.remove(ssId);
  }

  private void updateAsCanceled(String ssId) {
    callback.updateSnapshot(ssId, "status", PrSnapshot.STATUS.CANCELED.name());
    snapshotRuleDoneCnt.remove(ssId);
  }
}