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

package app.metatron.discovery.domain.dataprep.teddy;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.csv.PrepCsvParseResult;
import app.metatron.discovery.domain.dataprep.csv.PrepCsvUtil;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot.HIVE_FILE_COMPRESSION;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot.HIVE_FILE_FORMAT;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.jdbc.PrepJdbcService;
import app.metatron.discovery.domain.dataprep.service.PrSnapshotService;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.IllegalColumnNameForHiveException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.JdbcQueryFailedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.JdbcTypeNotSupportedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.datasource.connection.jdbc.*;
import app.metatron.discovery.prep.parser.exceptions.RuleException;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Maps;
import org.apache.commons.csv.CSVPrinter;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.sql.DataSource;
import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.*;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static app.metatron.discovery.domain.dataprep.PrepProperties.*;

@Service
public class TeddyExecutor {
  private static Logger LOGGER = LoggerFactory.getLogger(TeddyExecutor.class);

  Map<String, Object> jobList = Maps.newHashMap();

  @Autowired(required = false)
  DataFrameService dataFrameService;

  @Autowired
  PrSnapshotService snapshotService;

  public String  hadoopConfDir;

  public String  hiveHostname;
  public Integer hivePort;
  public String  hiveUsername;
  public String  hivePassword;
  public String  hiveCustomUrl;

  public Integer timeout;
  public Integer cores;
  public Integer limitRows;
  public final Integer CANCEL_INTERVAL = 1000;

  String oauth_token;
  String restAPIserverPort;

  Map<String, String> replaceMap = new HashMap<>(); // origTeddyDsId -> newFullDsId
  Map<String, String> reverseMap = new HashMap<>(); // newFullDsId -> origTeddyDsId

  private Map<String, DataFrame> cache = Maps.newHashMap();
  private Map<String, Long> snapshotRuleDoneCnt = new HashMap<>();

  Configuration conf;

  private Long incrRuleCntDone(String ssId){
    Long cnt = snapshotRuleDoneCnt.get(ssId);
    snapshotRuleDoneCnt.put(ssId, ++cnt);
    return cnt;
  }

  private void setPrepPropertiesInfo(Map<String, Object> prepPropertiesInfo) {
    hadoopConfDir = (String)  prepPropertiesInfo.get(HADOOP_CONF_DIR);

    hiveHostname  = (String)  prepPropertiesInfo.get(HIVE_HOSTNAME);
    hivePort      = (Integer) prepPropertiesInfo.get(HIVE_PORT);
    hiveUsername  = (String)  prepPropertiesInfo.get(HIVE_USERNAME);
    hivePassword  = (String)  prepPropertiesInfo.get(HIVE_PASSWORD);
    hiveCustomUrl = (String)  prepPropertiesInfo.get(HIVE_CUSTOM_URL);

    cores         = (Integer) prepPropertiesInfo.get(ETL_CORES);
    timeout       = (Integer) prepPropertiesInfo.get(ETL_TIMEOUT);
    limitRows     = (Integer) prepPropertiesInfo.get(ETL_LIMIT_ROWS);

    if (hadoopConfDir != null) {
      conf = new Configuration();
      conf.addResource(new Path(hadoopConfDir + File.separator + "core-site.xml"));
      conf.addResource(new Path(hadoopConfDir + File.separator + "hdfs-site.xml"));
    }
  }

  @Async("threadPoolTaskExecutor")
  public Future<String> run(String[] argv) throws Throwable {
    Future<String> result;
    String ssId="";

    try {
      Map<String, Object> prepPropertiesInfo = GlobalObjectMapper.readValue(argv[1], HashMap.class);
      Map<String, Object> datasetInfo =        GlobalObjectMapper.readValue(argv[2], HashMap.class);
      Map<String, Object> snapshotInfo =       GlobalObjectMapper.readValue(argv[3], HashMap.class);
      restAPIserverPort = argv[4];
      oauth_token = argv[5];

      setPrepPropertiesInfo(prepPropertiesInfo);

      ssId = (String) snapshotInfo.get("ssId");
      snapshotRuleDoneCnt.put(ssId, 0L);
      long ruleCntTotal = countAllRules(datasetInfo);

      updateSnapshot("ruleCntTotal", String.valueOf(ruleCntTotal), ssId);
      updateAsRunning(ssId);

      String ssType = (String) snapshotInfo.get("ssType");

      if (ssType.equals(PrSnapshot.SS_TYPE.URI.name())) {
        result = createUriSnapshot(argv);
//      } else if (snapshotInfo.get("ssType").equals(PrSnapshot.SS_TYPE.HDFS.name())) {
//        result = createHdfsSnapshot(hadoopConfDir, argv);
      } else if (ssType.equals(PrSnapshot.SS_TYPE.STAGING_DB.name())) {
        result = createHiveSnapshot(hadoopConfDir, datasetInfo, snapshotInfo);
      } else {
        updateAsFailed(ssId);
        throw new IllegalArgumentException("run(): ssType not supported: ssType=" + ssType);
      }
    } catch(CancellationException ce) {
      LOGGER.info("run(): snapshot canceled from run_internal(): ", ce);
      updateSnapshot("finishTime", DateTime.now(DateTimeZone.UTC).toString(), ssId);
      updateAsCanceled(ssId);
      StringBuffer sb = new StringBuffer();

      for(StackTraceElement ste : ce.getStackTrace()) {
        sb.append("\n");
        sb.append(ste.toString());
      }
      updateSnapshot("custom", "{'fail_msg':'"+sb.toString()+"'}", ssId);
      throw ce;
    } catch (Exception e) {
      LOGGER.error("run(): error while creating a snapshot: ", e);
      updateSnapshot("finishTime", DateTime.now(DateTimeZone.UTC).toString(), ssId);
      updateAsFailed(ssId);
      StringBuffer sb = new StringBuffer();

      for(StackTraceElement ste : e.getStackTrace()) {
        sb.append("\n");
        sb.append(ste.toString());
      }
      updateSnapshot("custom", "{'fail_msg':'"+sb.toString()+"'}", ssId);
      throw e;
    }

    LOGGER.info("run(): success from run_internal(): ", result.toString());
    return result;
  }

  private int writeCsv(String strUri, DataFrame df, String ssId) {
    CSVPrinter printer = PrepCsvUtil.getPrinter(strUri, conf);
    String errmsg = null;

    try {
      for(int colno=0; colno < df.getColCnt(); colno++) {
        printer.print(df.getColName(colno));
      }
      printer.println();

      for (int rowno = 0; rowno < df.rows.size(); cancelCheck(ssId, ++rowno)) {
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
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_CLOSE_CSV, e.getMessage());
    }

    if (errmsg != null) {
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_WRITE_CSV, errmsg);
    }

    return df.rows.size();
  }

  private PrintWriter getJsonPrinter(String strUri, Configuration conf) {
    PrintWriter printWriter;
    URI uri;

    try {
      uri = new URI(strUri);
    } catch (URISyntaxException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_MALFORMED_URI_SYNTAX, strUri);
    }

    switch (uri.getScheme()) {
      case "hdfs":
        if (conf == null) {
          throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE, PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, HADOOP_CONF_DIR);
        }
        Path path = new Path(uri);

        FileSystem hdfsFs;
        try {
          hdfsFs = FileSystem.get(conf);
        } catch (IOException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_GET_HDFS_FILE_SYSTEM, strUri);
        }

        FSDataOutputStream hos;
        try {
          hos = hdfsFs.create(path);
        } catch (IOException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_WRITE_TO_HDFS_PATH, strUri);
        }

        printWriter = new PrintWriter(new BufferedWriter( new OutputStreamWriter(hos)));
        break;

      case "file":
        File file = new File(uri);

        FileOutputStream fos;
        try {
          fos = new FileOutputStream(file);
        } catch (FileNotFoundException e) {
          e.printStackTrace();
          throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_CANNOT_READ_FROM_LOCAL_PATH, strUri);
        }

        printWriter = new PrintWriter(new BufferedWriter( new OutputStreamWriter(fos)));
        break;

      default:
        throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_URI_SCHEME, strUri);
    }

    return printWriter;
  }

  private int writeJSON(String strUri, DataFrame df, String ssId) {
    LOGGER.debug("TeddyExecutor.wirteJSON(): strUri={} conf={}", strUri, conf);
    PrintWriter printWriter = getJsonPrinter(strUri, conf);
    ObjectMapper mapper = new ObjectMapper();
    String errmsg = null;

    try {
      for (int rowno = 0; rowno < df.rows.size(); cancelCheck(ssId, ++rowno)) {
        Row row = df.rows.get(rowno);
        Map<String, Object> jsonRow = new HashMap<>();

        for (int colno = 0; colno < df.getColCnt(); ++colno) {
          if(df.getColType(colno).equals(ColumnType.TIMESTAMP)) {
            jsonRow.put(df.getColName(colno), ((DateTime) row.get(colno)).toString(df.getColTimestampStyle(colno), Locale.ENGLISH));
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
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_CLOSE_CSV, e.getMessage());
    }

    if (errmsg != null) {
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FAILED_TO_WRITE_CSV, errmsg);
    }

    return df.rows.size();
  }

  private Future<String> createUriSnapshot(String[] argv) throws Throwable {
    LOGGER.info("createUriSnapshot(): started");

    Map<String, Object> datasetInfo = GlobalObjectMapper.readValue(argv[2], HashMap.class);
    Map<String, Object> snapshotInfo = GlobalObjectMapper.readValue(argv[3], HashMap.class);

    // master dataset 정보에 모든 upstream 정보도 포함되어있음.
    String ssId = (String) snapshotInfo.get("ssId");
    String masterTeddyDsId = ((String) datasetInfo.get("origTeddyDsId"));
    transformRecursive(datasetInfo, ssId);
    String masterFullDsId = replaceMap.get(masterTeddyDsId);

    updateAsWriting(ssId);

    DataFrame df = cache.get(masterFullDsId);

//    String fileUri = (String) snapshotInfo.get("fileUri");
//    if(fileUri == null) {
//      String localBaseDir = (String) snapshotInfo.get("localBaseDir");
//      String ssName = (String) snapshotInfo.get("ssName");
//      fileUri = this.snapshotService.getSnapshotDir(localBaseDir, ssName);
//      fileUri = this.snapshotService.escapeSsNameOfUri(fileUri);
//      Files.createDirectories(Paths.get(fileUri));
//
//      fileUri = fileUri.replace(" ",  "%20");
//    }
//    String fullPath = fileUri + "/part-00000-" + masterTeddyDsId + ".csv";
//    String strUri = "file://" + fullPath;
//
//    writeCsvForUriSnapshot(strUri, df, ssId);

//    String fileUri = ((String) snapshotInfo.get("fileUri")).replace(" ",  "%20");
//    String storageType = (String) snapshotInfo.get("storageType");

    // Currently, fileUri from UI for HDFS storage_type is the directory's URI of the destination of the snapshot.
//    switch (storageType) {  // PrSnapshot.STORAGE_TYPE
//      case "LOCAL":
//        storedUri = fileUri;
//        writeCsv(storedUri, df, ssId);
//        break;
//      case "HDFS":
//        storedUri = fileUri + File.separator + "/part-00000-" + masterTeddyDsId + ".csv";;
//        writeCsv(storedUri, df, ssId);
//        break;
//      default:
//        assert false : storageType;
//    }

    String fileUri = (String) snapshotInfo.get("storedUri");
    String dirUri = snapshotService.escapeUri(fileUri);
    String storedUri = dirUri + File.separator + "part-00000-" + masterTeddyDsId + ".csv";;
    writeCsv(storedUri, df, ssId);

    // master를 비롯해서, 스냅샷 생성을 위해 새로 만들어진 모든 full dataset을 제거
    for (String fullDsId : reverseMap.keySet()) {
      cache.remove(fullDsId);
    }

    updateSnapshot("storedUri", storedUri, ssId);

    LOGGER.info("createUriSnapshot() finished: totalLines={}", df.rows.size());

    DateTime finishTime = DateTime.now(DateTimeZone.UTC);
    updateSnapshot("finishTime", finishTime.toString(), ssId);
    updateSnapshot("totalLines", String.valueOf(df.rows.size()), ssId);
    updateAsSucceeded(ssId);

    return new AsyncResult<>("Success");
  }

//  private Future<String> createHdfsSnapshot(String hadoopConfDir, String[] argv) throws Throwable {
//    LOGGER.info("createHdfsSnapshot(): adding hadoop config files (if exists): " + hadoopConfDir);
//
//    Map<String, Object> datasetInfo = GlobalObjectMapper.readValue(argv[2], HashMap.class);
//    Map<String, Object> snapshotInfo = GlobalObjectMapper.readValue(argv[3], HashMap.class);
//
//    // master dataset 정보에 모든 upstream 정보도 포함되어있음.
//    String ssId = (String) snapshotInfo.get("ssId");
//    String masterTeddyDsId = ((String) datasetInfo.get("origTeddyDsId"));
//    transformRecursive(datasetInfo, ssId);
//    String masterFullDsId = replaceMap.get(masterTeddyDsId);
//
//    updateAsWriting(ssId);
//
//    String stagingBaseDir = (String) snapshotInfo.get("stagingBaseDir");
//    String ssUri = (String) snapshotInfo.get("fileUri");
//    if(null==ssUri) {
//      String ssName = (String) snapshotInfo.get("ssName");
//      ssUri = this.snapshotService.getSnapshotDir(stagingBaseDir, ssName);
//    }
//
//    /* 변경됨.
//    // 겹치지는 않을 것. garbage collection 필요. (주기적으로 참조되지 않는 snapshot 디렉토리 제거)
//    Path ssDir = new Path(stagingBaseDir + "/snapshots/", ssId);
//    */
//    FileSystem fs = FileSystem.get(conf);
//    ssUri = this.snapshotService.escapeUri(ssUri);
//    Path ssDir = new Path(ssUri);
//    if (fs.exists(ssDir)) {
//      fs.delete(ssDir, true);
//    }
//
//    Path file = new Path(ssDir.toString() + File.separator + "part-00000-" + ssId + ".csv"); // masterTeddyDsId 대신 ssId를 쓰고 있었음
////    OutputStream os = fs.create(file);
////    BufferedWriter br = new BufferedWriter(new OutputStreamWriter(os, "UTF-8"));
////
////    LOGGER.info("createHdfsSnapshot() path={}", file.toString());
//
//    DataFrame df = cache.get(masterFullDsId);
////    int totalLines = writeCsvForUriSnapshot(ssId, df, br, df.colNames);
//
//    String strUri = ssUri + File.separator + "part-00000-" + ssId + ".csv";
//
//    LOGGER.info("createHdfsSnapshot() strUri={}", strUri);
//    int totalLines = writeCsvForUriSnapshot(strUri, df, ssId);
//
//    // master를 비롯해서, 스냅샷 생성을 위해 새로 만들어진 모든 full dataset을 제거
//    for (String fullDsId : reverseMap.keySet()) {
//      cache.remove(fullDsId);
//    }
//
//    updateSnapshot("uri", this.snapshotService.unescapeSsNameOfUri(file.toString()), ssId);   // 필드명은 uri지만, hdfs full path가 들어간다.
//
//    LOGGER.info("createHdfsSnapshot() finished: totalLines={}", totalLines);
//
//    DateTime finishTime = DateTime.now(DateTimeZone.UTC);
//    updateSnapshot("finishTime", finishTime.toString(), ssId);
//    updateSnapshot("totalLines", String.valueOf(totalLines), ssId);
//    updateAsSucceeded(ssId);
//
//    return new AsyncResult<>("Success");
//  }

  private Future<String> createHiveSnapshot(String hadoopConfDir,
                                            Map<String, Object> datasetInfo,
                                            Map<String, Object> snapshotInfo) throws Throwable {
    LOGGER.info("hadoopConfDir={}", hadoopConfDir);
    LOGGER.info("hive: hostname={} port={} username={}", hiveHostname, hivePort, hiveUsername);
    LOGGER.info("callback: restAPIserverPort={} oauth_token={}", restAPIserverPort, oauth_token.substring(0, 10));

    LOGGER.info("run(): adding hadoop config files (if exists): " + hadoopConfDir);

    // master dataset 정보에 모든 upstream 정보도 포함되어있음.
    String ssId = (String) snapshotInfo.get("ssId");
    String masterTeddyDsId = ((String) datasetInfo.get("origTeddyDsId"));
    transformRecursive(datasetInfo, ssId);
    String masterFullDsId = replaceMap.get(masterTeddyDsId);

    // Some rules like pivot may break Hive column naming rule.
    DataFrame finalDf = cache.get(masterFullDsId);
    finalDf.checkAlphaNumericalColNames();

    List<String> ruleStrings = (List<String>) datasetInfo.get("ruleStrings");
    List<String> partKeys = (List<String>) snapshotInfo.get("partitionColNames");
    String format = (String) snapshotInfo.get("hiveFileFormat");
    String compression = (String) snapshotInfo.get("hiveFileCompression");
    String database = (String) snapshotInfo.get("dbName");
    String tableName = (String) snapshotInfo.get("tblName");
    String extHdfsDir = snapshotInfo.get("stagingBaseDir") + File.separator + "snapshots";

    // totalLines는 아래 함수 안에서 설정함
    createHiveSnapshotInternal(ssId, masterFullDsId, ruleStrings, partKeys, database, tableName, extHdfsDir, format, compression);

    // master를 비롯해서, 스냅샷 생성을 위해 새로 만들어진 모든 full dataset을 제거
    for (String fullDsId : reverseMap.keySet()) {
      cache.remove(fullDsId);
    }

    LOGGER.info("createHiveSnapshot() finished");

    DateTime finishTime = DateTime.now(DateTimeZone.UTC);
    updateSnapshot("finishTime", finishTime.toString(), ssId);
    // totalLines is already written in writeCsvForStagingDbSnapshot()
    updateAsSucceeded(ssId);

    return new AsyncResult<>("Success");
  }

  private void updateSnapshot(String colname, String value, String ssId) {
    LOGGER.debug("updateSnapshot(): ssId={}: update {} as {}", ssId, colname, value);

    URI snapshot_uri = UriComponentsBuilder.newInstance()
            .scheme("http")
            .host("localhost")
            .port(restAPIserverPort)
            .path("/api/preparationsnapshots/")
            .path(ssId)
            .build().encode().toUri();

    LOGGER.debug("updateSnapshot(): REST URI=" + snapshot_uri);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.add("Accept", "application/json, text/plain, */*");
    headers.add("Authorization", oauth_token);


    HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
    RestTemplate restTemplate = new RestTemplate(requestFactory);

    Map<String, String> patchItems = new HashMap<>();
    patchItems.put(colname, value);

    HttpEntity<Map<String, String>> entity2 = new HttpEntity<>(patchItems, headers);
    ResponseEntity<String> responseEntity;
    responseEntity = restTemplate.exchange(snapshot_uri, HttpMethod.PATCH, entity2, String.class);

    LOGGER.debug("updateSnapshot(): done with statusCode " + responseEntity.getStatusCode());
  }

  // returns slaveFullDsIds
  void transformRecursive(Map<String, Object> datasetInfo, String ssId) throws Throwable {
    cancelCheck(ssId);
    String origTeddyDsId = (String) datasetInfo.get("origTeddyDsId");

    String newFullDsId = createStage0(datasetInfo);
    replaceMap.put(origTeddyDsId, newFullDsId);
    reverseMap.put(newFullDsId, origTeddyDsId);

    List<Map<String, Object>> upstreamDatasetInfos = (List<Map<String, Object>>) datasetInfo.get("upstreamDatasetInfos");
    for (Map<String, Object> upstreamDatasetInfo : upstreamDatasetInfos) {
      transformRecursive(upstreamDatasetInfo, ssId);
    }

    List<String> ruleStrings = (List<String>) datasetInfo.get("ruleStrings");
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
  long countAllRules(Map<String, Object> datasetInfo) throws Throwable {
    long ruleCntTotal = 0L;

    for (Map<String, Object> upstreamDatasetInfo : (List<Map<String, Object>>) datasetInfo.get("upstreamDatasetInfos")) {
      ruleCntTotal += countAllRules(upstreamDatasetInfo);
    }

    return ruleCntTotal + ((List<String>) datasetInfo.get("ruleStrings")).size();
  }

  private void applyRuleStrings(String masterFullDsId, List<String> ruleStrings, String ssId) throws Throwable {
    LOGGER.trace("applyRuleStrings(): start");
    // multi-thread
    for (String ruleString : ruleStrings) {     // create rule has been removed already
      List<Future<List<Row>>> futures = new ArrayList<>();
      List<DataFrame> slaveDfs = new ArrayList<>();

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

            for (int rowno = 0; rowno < rowcnt; rowno += partSize) {
              LOGGER.debug("applyRuleStrings(): add thread: rowno={} partSize={} rowcnt={}", rowno, partSize, rowcnt);
              futures.add(dataFrameService.gatherAsync(df, newDf, preparedArgs, rowno, Math.min(partSize, rowcnt - rowno), limitRows));
            }

            cancelCheck(ssId);
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
        LOGGER.error("applyRuleStrings(): execution error on " + ruleString, e);
      }

      LOGGER.debug("applyRuleStrings(): end: ruleString={}", ruleString);
      cache.put(masterFullDsId, newDf);
      updateSnapshot("ruleCntDone", String.valueOf(incrRuleCntDone(ssId)), ssId);
    }

    LOGGER.trace("applyRuleStrings(): end");
  }

  private void loadCsvFile(String dsId, String strUri, String delimiter) throws URISyntaxException {
    DataFrame df = new DataFrame();

    LOGGER.info("loadCsvFile(): dsId={} strUri={} delemiter={}", dsId, strUri, delimiter);

    PrepCsvParseResult result = PrepCsvUtil.parse(strUri, ",", 10000, conf, false);
    df.setByGrid(result);

    LOGGER.info("loadCsvFile(): done");
    cache.put(dsId, df);
  }

  public String createStage0(Map<String, Object> datasetInfo) throws Throwable {
    String newFullDsId = UUID.randomUUID().toString();

    LOGGER.trace("TeddyExecutor.createStage0(): newFullDsId={}", newFullDsId);

    if (datasetInfo.get("importType") == null) {
      throw new IllegalArgumentException("TeddyExecutor.createStage0(): importType should not be null");
    }

    String importType = (String) datasetInfo.get("importType");
    switch (importType) {
      case "UPLOAD":
        loadCsvFile(newFullDsId, (String) datasetInfo.get("storedUri"), (String) datasetInfo.get("delimiter"));
        break;

      case "DATABASE":
        loadJdbcTable(newFullDsId,
                (String) datasetInfo.get("sourceQuery"),
                (String) datasetInfo.get("implementor"),
                (String) datasetInfo.get("connectUri"),
                (String) datasetInfo.get("username"),
                (String) datasetInfo.get("password"));
        break;

      case "STAGING_DB":
        loadHiveTable(newFullDsId, (String) datasetInfo.get("sourceQuery"));
        break;

      default:
        throw new IllegalArgumentException("TeddyExecutor.createStage0(): not supported importType: " + importType);
    }

    LOGGER.trace("TeddyExecutor.createStage0(): end");
    return newFullDsId;
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
        StringBuffer sb = new StringBuffer();
        sb.append("struct<");
        for (int i = 0; i < colDesc.getArrColDesc().size(); i++) {
          ColumnDescription subColDesc = colDesc.getArrColDesc().get(i);
          if (i > 0) {
            sb.append(",");
          }
          sb.append(String.format("c%d:%s", i, fromColumnTypetoHiveType(subColDesc.getType(), subColDesc)));
        }
        return sb.append(">").toString();
      case MAP:
        sb = new StringBuffer();
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

  // 테스트를 위해 public으로 바꾸고, dsId대신 dataframe을 받도록 수정
  public void makeHiveTable(DataFrame df, List<String> partitions,
                            String fullTblName, String location,
                            HIVE_FILE_FORMAT hiveFileFormat, HIVE_FILE_COMPRESSION compression) throws SQLException, ClassNotFoundException {
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
        // 아래 방법으로 table을 만들면 quote 문자를 지정하지 못한다.
        // 내용 중간에 comma가 있는 경우 다음 컬럼으로 인식된다.
        // 대신 type이 모두 string이 되는 현상은 없다.
        createTable.append(String.format(" ROW FORMAT DELIMITED FIELDS TERMINATED BY ',' STORED AS TEXTFILE LOCATION '%s'", location));

        // 아래 방법으로 table을 만들면 quote 문자를 지정할 수 있다.
        // 하지만 모든 컬럼이 string이 된다.
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
        createTable.append(String.format(" STORED AS ORC LOCATION '%s' TBLPROPERTIES (\"orc.compress\"=\"%s\")", location, compression.name()));
        break;
      default:
        assert false : hiveFileFormat;
    }
    LOGGER.info("makeHiveTable(): create table statement=" + createTable.toString());

    Statement hiveStmt = getHiveStatement();

    try {
      hiveStmt.execute("DROP TABLE IF EXISTS " + fullTblName);
    } catch (SQLException e) {
      // suppress exception (table not found)
    }

    try {
      hiveStmt.execute(createTable.toString());
      if (partitions.size() != 0) {
        hiveStmt.execute("MSCK REPAIR TABLE " + fullTblName);
      }
    } catch (SQLException e) {
      LOGGER.info("makeHiveTable(): failed to create table with JDBC: create table statement=" + createTable.toString());
      throw e;
    }
  }

  private int writeCsvForUriSnapshot(String ssId, DataFrame df, BufferedWriter br, List<String> colNames) throws IOException {
    LOGGER.trace("writeCsvForUriSnapshot(): start");

    if (colNames != null) {
      for (int colno = 0; colno < df.getColCnt(); colno++) {
        if (colno > 0) {
          br.write(",");
        }
        br.write(colNames.get(colno));
      }
      br.write("\n");
    }

    for (int rowno = 0; rowno < df.rows.size(); cancelCheck(ssId, ++rowno)) {
      Row row = df.rows.get(rowno);
      for (int colno = 0; colno < df.getColCnt(); colno++) {
        if (colno > 0) {
          br.write(",");
        }
        Object obj = row.get(colno);
        if (obj != null) {
          String str;
          if (obj instanceof DateTime) {
            str = ((DateTime) obj).toString(df.getColTimestampStyle(colno));
          } else if (obj instanceof Double) {
            DecimalFormat decimalFormat = new DecimalFormat("0", DecimalFormatSymbols.getInstance(Locale.ENGLISH));
            decimalFormat.setMaximumFractionDigits(340);
            str = decimalFormat.format(obj);
          } else {
            str = obj.toString();
          }

          // check , in any case. for safety.
          if (str.contains(",")) {
            br.write("\"");
            br.write(str);
            br.write("\"");
          } else {
            br.write(str);
          }
        }
      }
      br.write("\n");
    }
    br.close();

    LOGGER.trace("writeCsvForUriSnapshot(): end");
    return df.rows.size();
  }

  public String writeCsvForStagingDbSnapshot(String ssId, String dsId, String extHdfsDir, String dbName, String tblName,
                            HIVE_FILE_FORMAT hiveFileFormat, HIVE_FILE_COMPRESSION compression) throws IOException, IllegalColumnNameForHiveException {
    Integer[] rowCnt = new Integer[2];
    FileSystem fs = FileSystem.get(conf);

    LOGGER.trace("writeCsvForStagingDbSnapshot(): start");
    assert extHdfsDir.equals("") == false : extHdfsDir;
    LOGGER.info("extHdfsDir=" + extHdfsDir);

    Path dir = new Path(extHdfsDir + "/" + dbName + "/" + tblName); // 어차피 org.apache.hadoop.fs.Path라 File.separator는 항상 '/'
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
        rowCnt = orcWriter.writeOrc(df, conf, file, compression);
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

    updateSnapshot("totalLines", String.valueOf(rowCnt[0]), ssId);

    if(rowCnt[1]!=null && rowCnt[1]>0) {
      Map<String, Object> lineageInfo = snapshotService.getSnapshotLineageInfo(ssId);
      lineageInfo.put("excludedLines", rowCnt[1]);
      ObjectMapper mapper = new ObjectMapper();
      updateSnapshot("lineageInfo", mapper.writeValueAsString(lineageInfo), ssId);
    }

    LOGGER.trace("writeCsvForStagingDbSnapshot(): end");
    return dir.toUri().toString();
  }

  public void createHiveSnapshotInternal(String ssId, String masterFullDsId, List<String> ruleStrings,
                                         List<String> partKeys, String dbName, String tblName, String extHdfsDir,
                                         String format, String compression) throws Throwable {
    LOGGER.info("createHiveSnapshotInternal(): ruleStrings.size()={} fullTblName={}.{} format={} compression={}",
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

    updateAsWriting(ssId);
    String location = writeCsvForStagingDbSnapshot(ssId, masterFullDsId, extHdfsDir, dbName, tblName, enumFormat, enumCompression);

    updateAsTableCreating(ssId);
    makeHiveTable(cache.get(masterFullDsId), partKeys, dbName + "." + tblName, location, enumFormat, enumCompression);

    LOGGER.trace("createHiveSnapshotInternal(): end");
  }

  private Statement getJdbcStatement(String implementor, String connectUri, String username, String password) throws SQLException, ClassNotFoundException {

    JdbcDataConnection jdbcDataConnection = null;
    switch(implementor) {
      case "ORACLE": jdbcDataConnection = new OracleConnection(); break;
      case "MYSQL": jdbcDataConnection = new MySQLConnection(); break;
      case "POSTGRESQL": jdbcDataConnection = new PostgresqlConnection(); break;
      case "HIVE": jdbcDataConnection = new HiveConnection(); break;
      case "PRESTO": jdbcDataConnection = new PrestoConnection(); break;
      case "TIBERO": jdbcDataConnection = new TiberoConnection(); break;
    }
    jdbcDataConnection.setUsername(username);
    jdbcDataConnection.setPassword(password);

    try {
      Class.forName(jdbcDataConnection.getDriverClass());
      Connection conn = DriverManager.getConnection(connectUri, jdbcDataConnection.getUsername(), jdbcDataConnection.getPassword());
      return conn.createStatement();
    } catch (ClassNotFoundException e) {
      LOGGER.error(String.format("getJdbcStatement(): ClassNotFoundException occurred: driver-class-name=%s", jdbcDataConnection.getDriverClass()), e);
      throw e;
    } catch (SQLException e) {
      LOGGER.error(String.format("getJdbcStatement(): SQLException occurred: connStr=%s username=%s password=%s",
              connectUri, jdbcDataConnection.getUsername(), jdbcDataConnection.getPassword()), e);
      throw e;
    }
  }

  private Statement getHiveStatement() throws SQLException, ClassNotFoundException {
    HiveConnection hiveConn = new HiveConnection();
    hiveConn.setHostname(hiveHostname);
    hiveConn.setPort(Integer.valueOf(hivePort));
    hiveConn.setUsername(hiveUsername);
    hiveConn.setPassword(hivePassword);
    hiveConn.setUrl(hiveCustomUrl);

    PrepJdbcService jdbcConnectionService = new PrepJdbcService();
    DataSource dataSource = jdbcConnectionService.getDataSource(hiveConn, true);
    Statement stmt;

    try {
      stmt = dataSource.getConnection().createStatement();
    } catch (SQLException e) {
      LOGGER.error(String.format("getHiveStatement(): SQLException occurred: connStr=%s username=%s password=%s",
              hiveConn.getConnectUrl(), hiveConn.getUsername(), hiveConn.getPassword()), e);
      throw e;
    }
    return stmt;
  }

  public void loadJdbcTable(String dsId, String sql, String implementor, String connectUri, String username, String password ) throws JdbcTypeNotSupportedException, JdbcQueryFailedException, SQLException, ClassNotFoundException {
    Statement stmt = getJdbcStatement(implementor, connectUri, username, password);
    DataFrame df = new DataFrame();

    LOGGER.info(String.format("loadJdbcTable(): dsId=%s sql=%s, implementor=%s, connectUri=%s, username=%s", dsId, sql, implementor, connectUri, username));

    df.setByJDBC(stmt, sql, limitRows);
    cache.put(dsId, df);

    LOGGER.trace("loadJdbcTable(): end");
  }

  public void loadHiveTable(String dsId, String sql) throws JdbcTypeNotSupportedException, JdbcQueryFailedException, SQLException, ClassNotFoundException {
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

  private void updateAsRunning(String ssId) {
    cancelCheck(ssId);
    updateSnapshot("status", PrSnapshot.STATUS.RUNNING.name(), ssId);
  }

  private void updateAsWriting(String ssId) {
    cancelCheck(ssId);
    updateSnapshot("status", PrSnapshot.STATUS.WRITING.name(), ssId);
  }

  private void updateAsTableCreating(String ssId) {
    cancelCheck(ssId);
    updateSnapshot("status", PrSnapshot.STATUS.TABLE_CREATING.name(), ssId);
  }

  private void updateAsSucceeded(String ssId) {
    updateSnapshot("status", PrSnapshot.STATUS.SUCCEEDED.name(), ssId);
    snapshotRuleDoneCnt.remove(ssId);
  }

  private void updateAsFailed(String ssId) {
    updateSnapshot("status", PrSnapshot.STATUS.FAILED.name(), ssId);
    snapshotRuleDoneCnt.remove(ssId);
  }

  private void updateAsCanceled(String ssId) {
    updateSnapshot("status", PrSnapshot.STATUS.CANCELED.name(), ssId);
    snapshotRuleDoneCnt.remove(ssId);
  }

  synchronized public void cancelCheck(String ssId) throws CancellationException{
    if(snapshotService.getSnapshotStatus(ssId).equals(PrSnapshot.STATUS.CANCELED)) {
      throw new CancellationException("This snapshot generating was canceled by user. ssid: " + ssId);
    }
  }

  public void cancelCheck(String ssId, int rowNo) throws CancellationException{
    if(rowNo % CANCEL_INTERVAL == 0) {
      cancelCheck(ssId);
    }
  }

  public PrSnapshot.STATUS statusCheck(String ssId) {
    return snapshotService.getSnapshotStatus(ssId);
  }
}