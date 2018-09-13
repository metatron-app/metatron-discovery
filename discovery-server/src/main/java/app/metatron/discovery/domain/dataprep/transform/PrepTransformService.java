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

package app.metatron.discovery.domain.dataprep.transform;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.*;
import app.metatron.discovery.domain.dataprep.PrepDataset.OP_TYPE;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.teddy.*;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.IllegalColumnNameForHiveException;
import app.metatron.discovery.domain.datasource.connection.DataConnection;
import app.metatron.discovery.domain.datasource.connection.DataConnectionRepository;
import app.metatron.discovery.prep.parser.exceptions.RuleException;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.*;
import app.metatron.discovery.prep.parser.preparation.rule.Set;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.hibernate.Hibernate;
import org.hibernate.proxy.HibernateProxy;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static app.metatron.discovery.domain.dataprep.PrepDataset.DS_TYPE.WRANGLED;

@Service
public class PrepTransformService {
  private static Logger LOGGER = LoggerFactory.getLogger(PrepTransformService.class);

  @Autowired
  private Environment env;

//  @Autowired
//  SparkProperties sparkProperties;

  @Autowired(required = false)
  TeddyExecutor teddyExecutor;

  @Autowired
  HistogramService histogramService;

  @PostConstruct
  public void init() {
    System.setProperty("dataprep", Arrays.asList(env.getActiveProfiles()).contains("dataprep") ? "enabled" : "disabled");
  }

  @Autowired PrepDatasetRepository datasetRepository;
  @Autowired PrepDataflowRepository dataflowRepository;
  @Autowired PrepTransitionRepository transitionRepository;
  @Autowired PrepTransformRuleRepository transformRuleRepository;
  @Autowired PrepPreviewLineService previewLineService;
  @Autowired PrepDatasetFileService datasetFileService;
  @Autowired PrepSnapshotRepository snapshotRepository;
  @Autowired DataConnectionRepository connectionRepository;
  @Autowired PrepHdfsService hdfsService;
  @Autowired PrepSnapshotService snapshotService;

  @Autowired(required = false)
  TeddyImpl teddyImpl;

  @Autowired(required = false)
  PrepProperties prepProperties;

//  // Properties used in this process (discovery-server)
//  @Value("${polaris.dataprep.autotyping:true}")
//  private Boolean autotyping;
//
//
//  // These properties could be considered as being used in ETL programs.
//  // But technically, they are consumed in this process, resulting the snapshot informations.
//  @Value("${polaris.dataprep.localBaseDir:MISSING_LOCAL_BASE_DIR}")
//  private String localBaseDir;
//
//  @Value("${polaris.dataprep.stagingBaseDir:MISSING_STAGING_BASE_DIR}")
//  private String stagingBaseDir;
//
//
//
//  // Properties used in other ETL programs (discovery-prep-embedded, discovery-prep-spark, etc.)
//  @Value("${polaris.dataprep.hadoopConfDir:MISSING_HADOOP_CONF_DIR}")
//  private String hadoopConfDir;
//
//  @Value("${polaris.dataprep.hive.hostname:MISSING_HIVE_HOSTNAME}")
//  private String hiveHostname;
//
//  @Value("${polaris.dataprep.hive.port:10000}")
//  private int hivePort;
//
//  @Value("${polaris.dataprep.hive.username:MISSING_HIVE_USERNAME}")
//  private String hiveUsername;
//
//  @Value("${polaris.dataprep.hive.password:#{NULL}}")
//  private String hivePassword;
//
//  @Value("${polaris.dataprep.hive.customUrl:#{NULL}}")
//  private String hiveCustomUrl;
//
//  @Value("${polaris.dataprep.hive.metastoreUris:MISSING_HIVE_METASTORE_URIS}")
//  private String hiveMetastoreUris;   // twinkle, 즉 spark에서만 사용. teddy에선 사용하지 않음.
//
//  @Value("${polaris.dataprep.etl.jar:MISSING_TRANSFORMER_EXECUTABLE_JAR_PATH}")
//  String executableJarPath;
//
//  @Value("${polaris.dataprep.etl.jvmOptions:-Xmx1g}")
//  String jvmOptions;
//
//  @Value("${polaris.dataprep.etl.timeout:-1}")
//  private int timeout;
//
//  @Value("${polaris.dataprep.etl.cores:0}")
//  private int cores;
//

  @Value("${server.port:8180}")
  private String serverPort;

  // Datasource properties are only for Twinkle, which is to be obsolete.
  @Value("${spring.datasource.driver-class-name:MISSING_DATASOURCE_DRIVER_CLASS_NAME}")
  String datasourceDriverClassName;

  @Value("${spring.datasource.url:MISSING_DATASOURCE_URL}")
  String datasourceUrl;

  @Value("${spring.datasource.username:MISSING_DATASOURCE_USERNAME}")
  String datasourceUsername;

  @Value("${spring.datasource.password:MISSING_DATASOURCE_PASSWORD}")
  String datasourcePassword;

  // Properties along the ETL program kinds are gathered into a single JSON properties string.
  // Currently, the ETL programs kinds are the embedded engine and Apache Spark.
  private String getJsonPrepPropertiesInfo(PrepSnapshotRequestPost requestPost) throws JsonProcessingException {
    Map<String, Object> map = new HashMap();
    PrepSnapshot.SS_TYPE ssType = requestPost.getSsTypeEnum();
    PrepSnapshot.ENGINE engine = requestPost.getEngineEnum();

    switch (ssType) {
      case FILE:
        // CSVs are stored on HDFS first.  (FILE dataset != FILE snapshot)
        map.put(PrepProperties.HADOOP_CONF_DIR, prepProperties.getHadoopConfDir());
        break;
      case HDFS:
        map.put(PrepProperties.HADOOP_CONF_DIR, prepProperties.getHadoopConfDir());
        break;
      case JDBC:
        // not implemented
        assert false : ssType.name();
        break;
      case HIVE:
        map.put(PrepProperties.HADOOP_CONF_DIR, prepProperties.getHadoopConfDir());

        PrepProperties.HiveInfo hive = prepProperties.getHive();
        map.put(PrepProperties.HIVE_HOSTNAME,   hive.getHostname());
        map.put(PrepProperties.HIVE_PORT,       hive.getPort());
        map.put(PrepProperties.HIVE_USERNAME,   hive.getUsername());
        map.put(PrepProperties.HIVE_PASSWORD,   hive.getPassword());
        map.put(PrepProperties.HIVE_CUSTOM_URL, hive.getCustomUrl());

        if (engine == PrepSnapshot.ENGINE.TWINKLE) {
          map.put(PrepProperties.HIVE_METASTORE_URIS, hive.getMetastoreUris());
        }
        break;
    }

    PrepProperties.EtlInfo etl = prepProperties.getEtl();
    map.put(PrepProperties.ETL_CORES,       etl.getCores());
    map.put(PrepProperties.ETL_TIMEOUT,     etl.getTimeout());
    map.put(PrepProperties.ETL_LIMIT_ROWS,  etl.getLimitRows());

    if (engine == PrepSnapshot.ENGINE.TWINKLE) {
      map.put(PrepProperties.ETL_JAR, etl.getJar());
      map.put(PrepProperties.ETL_JVM_OPTIONS, etl.getJvmOptions());
    }

    return GlobalObjectMapper.getDefaultMapper().writeValueAsString(map);
  }

  private String getJsonSnapshotInfo(PrepSnapshotRequestPost requestPost, String ssId) throws JsonProcessingException {
    Map<String, Object> map = new HashMap();
    PrepSnapshot.SS_TYPE ssType = requestPost.getSsTypeEnum();
    PrepSnapshot.ENGINE engine = requestPost.getEngineEnum();
    PrepSnapshot.MODE mode = requestPost.getModeEnum();

    // 공통
    map.put("ssId",           ssId);
    map.put("ssName",         requestPost.getSsName());
    map.put("ssType",         ssType.name());
    map.put("engine",         engine.name());
    map.put("format",         requestPost.getFormat());
    map.put("compression",    requestPost.getCompression());
    map.put("localBaseDir",   prepProperties.getLocalBaseDir());

    switch (ssType) {
      case FILE:
        map.put("fileUri",        requestPost.getUri());
        break;
      case HDFS:
        map.put("stagingBaseDir", prepProperties.getStagingBaseDir());
        map.put("fileUri",        requestPost.getUri());
        break;
      case JDBC:
        assert false : ssId;
        break;
      case HIVE:
        map.put("stagingBaseDir", prepProperties.getStagingBaseDir());
        map.put("partKeys",       requestPost.getPartKeys());
        map.put("mode",           mode.name());
        map.put("dbName",         requestPost.getDbName());
        map.put("tblName",        requestPost.getTblName());
        break;
    }

    if (engine == PrepSnapshot.ENGINE.TWINKLE) {
      map.put("codec",             requestPost.getCompression().toLowerCase());
      map.put("mode",              requestPost.getMode().toLowerCase());    // Twinkle demands to lower;
      map.put("driver-class-name", datasourceDriverClassName);
      map.put("url",               datasourceUrl);
      map.put("username",          datasourceUsername);
      map.put("password",          datasourcePassword);
    }

    return GlobalObjectMapper.getDefaultMapper().writeValueAsString(map);
  }

  public PrepTransformService() { }

  // create stage0 (POST)
  @Transactional(rollbackFor = Exception.class)
  public PrepTransformResponse create(String importedDsId, String dfId) throws Exception {
    PrepDataset importedDataset = datasetRepository.findRealOne(datasetRepository.findOne(importedDsId));
    PrepDataflow dataflow = dataflowRepository.findOne(dfId);
    List<String> setTypeRules;

    assert(!importedDataset.isWrangled());

    LOGGER.trace("create(): start");

    PrepDataset wrangledDataset = makeWrangledDataset(importedDataset, dataflow, dfId);
    datasetRepository.save(wrangledDataset);

    // save를 해야 id가 나온다는 것에 유의
    String wrangledDsId = wrangledDataset.getDsId();
    DataFrame gridResponse = initialLoad(wrangledDsId, importedDataset);

    // Preview를 저장한다. Dataset 상세보기에서 이용한다.
    previewLineService.putPreviewLines(wrangledDsId, gridResponse);

    PrepTransition transition = new PrepTransition(wrangledDataset, OP_TYPE.CREATE);
    transition.setDsRevision(0);
    transition.setRuleCurIdxAfter(-1);   // getSrcRevision()에서 필요
    transition.setRuleString(importedDsId);
    transitionRepository.save(transition);

    wrangledDataset.addDataflow(dataflow);
    dataflow.addDataset(wrangledDataset);

    datasetRepository.save(wrangledDataset);
    dataflowRepository.save(dataflow);

    PrepTransformResponse response = new PrepTransformResponse(wrangledDsId);
    response.setWrangledDsId(wrangledDsId);
    this.putAddedInfo(response, wrangledDataset);

    //Auto Heading 및 Auto Typing을 위한 로직.

    Boolean isNotORC = true;
//    for(ColumnType ct : gridResponse.colTypes) {
    for(ColumnDescription cd : gridResponse.colDescs) {
      if(cd.getType() != ColumnType.STRING)
        isNotORC = false;
    }

    if(prepProperties.isAutoTyping() && isNotORC) {
        setTypeRules = autoTypeDetection(gridResponse);
        //반환 받은 setType Rule 들을 적용.
        for (String setTypeRule : setTypeRules) {
            try {
                // 주의: response를 갱신하면 안됨. 기존의 create()에 대한 response를 그대로 주어야 함.
                transform(wrangledDsId, PrepDataset.OP_TYPE.APPEND, -1, setTypeRule);
            } catch (Exception e) {
                LOGGER.info("create(): caught an exception: this setType rule might be wrong [" + setTypeRule + "]", e);
                transform(wrangledDsId, PrepDataset.OP_TYPE.UNDO, -1, setTypeRule);
                continue;
            }
        }
    }

    LOGGER.trace("create(): end");
    return response;
  }

  //Dataframe과 Column number를 받아 해당 column의 Type을 판단하는 함수.
  private void doTypeCheck_100(DataFrame df, int colNo, List<ColumnType> columnTypes, List<ColumnType> columnTypesrow0, List<String> timestampStyles) {
      List<ColumnType> columnTypeGuess = new ArrayList<>();
      List<TimestampTemplate> timestampStyleGuess = new ArrayList<>();
      ColumnType columnType = ColumnType.STRING;
      String timestampStyle = "";
      int maxCount;
      int maxRow = df.rows.size() < 100 ? df.rows.size() : 100;

      //0번부터 99번까지 첫 100개의 row를 검사.
      for(int i = 0; i<maxRow; i++) {
        //null check
          if(df.rows.get(i).objCols.get(colNo) == null) {
            columnTypeGuess.add(ColumnType.UNKNOWN);
            continue;
          }

          String str = df.rows.get(i).objCols.get(colNo).toString();

          //Boolean Check
          if (str.equalsIgnoreCase("true") || str.equalsIgnoreCase("false")) {
              columnTypeGuess.add(ColumnType.BOOLEAN);
              continue;
          }

          //Long Check
          try {
              Long.parseLong(str);
              columnTypeGuess.add(ColumnType.LONG);
              continue;
          } catch (Exception e) {
              //LOGGER.info("create(): Detecting Column Type...", e);
          }

          //Double Check
          try {
              Double.parseDouble(str);
              columnTypeGuess.add(ColumnType.DOUBLE);
              continue;
          } catch (Exception e) {
              //LOGGER.info("create(): Detecting Column Type...", e);
          }

          //Timestamp Check
          for (TimestampTemplate tt : TimestampTemplate.values()) {
              try {
                  DateTimeFormatter dtf = DateTimeFormat.forPattern(tt.getFormat());
                  DateTime.parse(str, dtf);

                  timestampStyleGuess.add(tt);
                  columnTypeGuess.add(ColumnType.TIMESTAMP);
                  break;
              } catch (Exception e) {
                  //LOGGER.info("create(): Detecting Column Type...", e);
              }
          }

          //Else String
          if(columnTypeGuess.size() == i)
              columnTypeGuess.add(ColumnType.STRING);
      }

      //가장 많이 선택된 columnType을 확인.
      maxCount = 0;
      for(ColumnType ct: ColumnType.values()){
          if(Collections.frequency(columnTypeGuess, ct) > maxCount) {
              maxCount = Collections.frequency(columnTypeGuess, ct);
              columnType = ct;
          }
      }

      //columnType == TIMESTAMP인 경우엔 Style 확인 필요.
      maxCount = 0;
      if(columnType == ColumnType.TIMESTAMP) {
          for(TimestampTemplate tt : TimestampTemplate.values()) {
              if(Collections.frequency(timestampStyleGuess, tt) > maxCount) {
                  maxCount = Collections.frequency(timestampStyleGuess, tt);
                  timestampStyle = tt.getFormat();
              }
          }
      } else {
          timestampStyle = null;
      }

      //최다 득표 타입, 0번 row의 타입, timestampStyle을 넣어준다.
      columnTypes.add(columnType);
      columnTypesrow0.add(columnTypeGuess.get(0));
      timestampStyles.add(timestampStyle);
  }

  //Dataframe를 받아서 해당 Dataset의 100개의 row를 검사하고, 적절한 Header/setType Rule String 들을 생성 해 주는 함수.
  public List<String> autoTypeDetection(DataFrame df) throws Exception {
    String[] ruleStrings = new String[3];
    List<String> setTypeRules = new ArrayList<>();
    List<String> columnNames = new ArrayList<>(df.colNames);
    List<ColumnType> columnTypes = new ArrayList<>();
    List<ColumnType> columnTypesRow0 = new ArrayList<>();
    List<String> timestampStyles = new ArrayList<>();

    if(df.colCnt == 0)
      df.colCnt = df.rows.get(0).objCols.size();

    for(int i=0; i<df.colCnt; i++) {
      //각 컬럼마다 100개의 row를 검색하여 Type, 0번 row의 Type, TimestampStyle을 확인.
      doTypeCheck_100(df, i, columnTypes, columnTypesRow0, timestampStyles);
    }

    //0번 Row의 예상 Type이 모두 String인 경우 header 룰을 추가하고 columnNames를 변경.
    if(Collections.frequency(columnTypesRow0, ColumnType.STRING) == df.colCnt) {
      setTypeRules.add("header rownum: 1");
      columnNames.clear();

      Header header = new Header(1L);
      DataFrame newDf = df.doHeader(header);

      columnNames.addAll(newDf.colNames);
    }
    //Boolean, Long, Double 룰스트링 만들기.(Timestamp는 format 문제로 개별 추가)
    ruleStrings[0] = "settype col: ";
    ruleStrings[1] = "settype col: ";
    ruleStrings[2] = "settype col: ";

    //각 컬럼의 type에 따라 rulestring에 추가.
    for(int i = 0; i < df.colCnt; i++) {
      if(columnTypes.get(i) == ColumnType.BOOLEAN)
        ruleStrings[0] = ruleStrings[0] + columnNames.get(i) + ", ";
      else if(columnTypes.get(i) == ColumnType.LONG)
        ruleStrings[1] = ruleStrings[1] + columnNames.get(i) + ", ";
      else if(columnTypes.get(i) == ColumnType.DOUBLE)
        ruleStrings[2] = ruleStrings[2] + columnNames.get(i) + ", ";
      else if(columnTypes.get(i) == ColumnType.TIMESTAMP)
        setTypeRules.add("settype col: " + columnNames.get(i) + " type: Timestamp format: '" + timestampStyles.get(i) + "'");
    }

    //생선된 rulestring을 settypeRules에 추가.
    if(ruleStrings[0].length() > 13) {
      ruleStrings[0] = ruleStrings[0].substring(0, ruleStrings[0].length() - 2) + " type: Boolean";
      setTypeRules.add(ruleStrings[0]);
    }
    if(ruleStrings[1].length() > 13) {
      ruleStrings[1] = ruleStrings[1].substring(0, ruleStrings[1].length() - 2) + " type: Long";
      setTypeRules.add(ruleStrings[1]);
    }
    if(ruleStrings[2].length() > 13) {
      ruleStrings[2] = ruleStrings[2].substring(0, ruleStrings[2].length() - 2) + " type: Double";
      setTypeRules.add(ruleStrings[2]);
    }

      return setTypeRules;
  }


  @Transactional(rollbackFor = Exception.class)
  public PrepTransformResponse clone(String wrangledDsId) throws Exception {
    PrepDataset wrangledDataset = datasetRepository.findRealOne(datasetRepository.findOne(wrangledDsId));
    String importedDsId = getUpstreamImportedDsId(wrangledDsId);

    PrepTransformResponse response = create(importedDsId, wrangledDataset.getCreatorDfId());
    String cloneDsId = response.getWrangledDsId();

    for (PrepTransformRule transformRule : getRulesInOrder(wrangledDsId)) {
      String ruleString = transformRule.getRuleString();
      response = transform(cloneDsId, OP_TYPE.APPEND, -1, ruleString);
    }
    return response;
  }

  public List<PrepTransition> findTransitionsAsc(String dsId) {
    List<PrepTransition> result = new ArrayList<>();

    List<PrepTransition> transitions = transitionRepository.findAllByOrderByChangeNoAsc();
    for (PrepTransition transition : transitions) {
      if (transition.getDataset().getDsId().equals(dsId) == false) {
        continue;
      }
      result.add(transition);
    }
    return result;
  }

  // needCollect: 결과 matrixResponse를 원하는지 여부
  //      true  --> load해서 grid를 보여주고자 할 때
  //      false --> snapshot을 뽑을 때, 결과 grid 필요 없음. 또 join, union시 slave dataset를 PLM cache에 올려놓는 것만 원할 때.
  private DataFrame load_internal(String dsId, boolean needCollect) throws Exception {
    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));

    LOGGER.trace("load_internal(): start");

    // loading시 UNDO 한계 설정
    dataset.setSessionRevision(getLastDsRevision(dataset));

    // 만약 PLM cache에 존재하고, transition을 재적용할 필요가 없다면
    if (teddyImpl.getCache().get(dsId) != null && onlyAppend(dsId)) {
      if (needCollect == false) {
        return null;
      }
      return teddyImpl.getDfAt(dsId, getLastDsRevision(dataset));  // cache 내용을 모아서 주는 것으로 끝.
    }
    // 이하 코드는 dataset이 PLM cache에 존재하지 않거나, transition을 처음부터 다시 적용해야 하는 경우
    teddyImpl.deleteDfs(dsId);

    String importedDsId = getUpstreamDsIds(dsId, false).get(0);  // TODO: I.DS -> W.DS -> W.DS 처리
    PrepDataset importedDataset = datasetRepository.findRealOne(datasetRepository.findOne(importedDsId));
    initialLoad(dsId, importedDataset);
    resetTransitions(dsId);

    List<String> ruleStrings = new ArrayList<>();
    ArrayList<String> totalTargetDsIds = new ArrayList<>();
    ArrayList<PrepDataset> totalTargetDatasets = new ArrayList<>();

    for (PrepTransformRule transformRule : getRulesInOrder(dsId)) {
      String ruleString = transformRule.getRuleString();

      // add a PrepTransition
      PrepTransition transition = new PrepTransition(dataset, OP_TYPE.APPEND);
      PrepTransition last = getLastTransition(dataset);

      transition.setRuleString(ruleString);
      transition.setChangeNo(last.getChangeNo() + 1);
      transition.setDsRevision(last.getDsRevision() + 1);
      transition.setRuleString(ruleString);
      transition.setRuleCurIdxBefore(last.getRuleCurIdxAfter());
      transition.setRuleCntBefore(last.getRuleCntAfter());
      transition.setRuleCurIdxAfter(transition.getRuleCurIdxBefore() + 1);
      transition.setRuleCntAfter(transition.getRuleCntBefore() + 1);

      transition.setSrcIdx(last.getDsRevision());
      transition.setDstIdx(last.getDsRevision() + 1);
      transitionRepository.save(transition);

      dataset.setRuleCurIdx(transition.getRuleCurIdxAfter());
      dataset.setRuleCnt(transition.getRuleCntAfter());
      datasetRepository.save(dataset);

      // add to the rule string array
      ruleStrings.add(ruleString);

      // gather slave datasets (load and apply, too)
      ArrayList<String> targetDsIds = getTargetDsIds(ruleString);
      for (String targetDsId : targetDsIds) {
        load_internal(targetDsId, false);
        totalTargetDsIds.add(targetDsId);

        PrepDataset targetDataset = datasetRepository.findRealOne(datasetRepository.findOne(targetDsId));
        totalTargetDatasets.add(targetDataset);
      }
    }

    // reset하면 UNDO 한계 재설정
    dataset.setSessionRevision(getLastDsRevision(dataset));

    // 적용할 rule string이 없으면 그냥 리턴.
    if (ruleStrings.size() == 0) {
      LOGGER.trace("load_internal(): end (no rules to apply)");
      return teddyImpl.getDfAt(dsId, 0);
    }

    // stage들을 만들어내야하기 때문에, 한 요청으로 묶을 수는 없음.
    // 마지막 요청이 아닌 이상, needCollect는 false
    DataFrame gridResponse = null;
    assert ruleStrings.size() > 0;

    for (int i = 0; i < ruleStrings.size(); i++) {
      String ruleString = ruleStrings.get(i);
      gridResponse = teddyImpl.applyRule(dsId, ruleString, -1, (i == ruleStrings.size() - 1), false);
    }
    LOGGER.trace("load_internal(): end (applied rules)");
    return gridResponse;
  }

  private List<Histogram> createHistsWithColWidths(DataFrame df, List<Integer> colnos, List<Integer> colWidths) {
    LOGGER.debug("createHistsWithColWidths(): df.colCnt={}, colnos={} colWidths={}", df.getColCnt(), colnos, colWidths);
    df.colHists = new ArrayList<>();
    List<Future<Histogram>> futures = new ArrayList<>();

    assert colnos.size() == colWidths.size() : String.format("colnos.size()=%d colWidths.size()=%d", colnos.size(), colWidths.size());

    for (int i = 0; i < colnos.size(); i++) {
      int colno = colnos.get(i);
      int colWidth = colWidths.get(i);
      futures.add(histogramService.updateHistWithColWidth(df.getColName(colno), df.getColType(colno), df.rows, colno, colWidth));
    }

    List<Histogram> colHists = new ArrayList<>();
    for (int colno = 0; colno < colnos.size(); colno++) {
      try {
        colHists.add(futures.get(colno).get());
      } catch (InterruptedException e) {
        e.printStackTrace();
      } catch (ExecutionException e) {
        e.printStackTrace();
      }
    }

    LOGGER.trace("createHistsWithColWidths(): finished");
    return colHists;
  }

  // load (and apply transitions if needed) (GET)
  @Transactional(rollbackFor = Exception.class)
  public PrepTransformResponse load(String dsId) throws Exception {
    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
    PrepTransformResponse response;
    DataFrame gridResponse;

    LOGGER.trace("load(): start");

    // rebuild transitions always - 171023jhkim
    // 단, 모든 transition이 APPEND인 경우는 그냥 넘어가도록.

    gridResponse = load_internal(dsId, true);

    response = new PrepTransformResponse(dataset.getRuleCurIdx(), gridResponse);
    response.setRuleStringInfos(getRulesInOrder(dsId), false, false);

    if (gridResponse != null) {
      previewLineService.putPreviewLines(dsId, gridResponse);
    }

    LOGGER.debug("load(): done");
    return response;
  }

  // transform (PUT)
  @Transactional(rollbackFor = Exception.class)
  public PrepTransformResponse transform(String dsId, OP_TYPE op, int ruleIdx, String ruleString) throws Exception {
    if(op==OP_TYPE.APPEND || op==OP_TYPE.UPDATE || op==OP_TYPE.PREVIEW) {
      confirmRuleStringForException(ruleString);
    }

    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
    PrepTransformResponse response;

    assert dataset != null : dsId;

    LOGGER.trace("transform(): start");

    // 아래 각 case에서 ruleCurIdx, matrixResponse는 채워서 리턴
    // rule list는 transform()을 마칠 때에 채움. 모든 op에 대해 동일하기 때문에.
    switch (op) {
      case APPEND:
        response = append(dataset, ruleString);
        break;
      case DELETE:
        response = delete(dataset);
        break;
      case UNDO:
        response = undo(dataset);
        break;
      case REDO:
        response = redo(dataset);
        break;
      case FETCH:  // Fetch for update. Update할 때에만 쓰임.
        response = fetch(dataset, dataset.getRuleCnt() - 2);
        break;
      case JUMP:
        response = jump(dataset, ruleIdx);
        break;
      case UPDATE:
        response = update(dataset, ruleString);
        break;
      case PREVIEW:
        response = preview(dataset, ruleString);
        break;
      case NOT_USED:
      default:
        throw new IllegalArgumentException("invalid transform op: " + op.toString());
    }

    datasetRepository.save(dataset);

    transitionRepository.flush();
    transformRuleRepository.flush();
    datasetRepository.flush();

    DataFrame gridResponse = response.getGridResponse();

    switch (op) {
      case APPEND:
      case DELETE:
      case UNDO:
      case REDO:
      case UPDATE:
        if(null!=gridResponse) {
          dataset.setTotalLines(gridResponse.rows.size());
        }
        this.previewLineService.putPreviewLines(dsId, gridResponse);
        break;
      case JUMP:
      case FETCH:
      case PREVIEW:
      case NOT_USED:
      default:
        break;
    }

    boolean undoable = getLastDsRevision(dataset) > dataset.getSessionRevision();
    boolean redoable = getLastTransition(dataset).getOp() == OP_TYPE.UNDO;
    response.setRuleStringInfos(getRulesInOrder(dsId), undoable, redoable);

    LOGGER.trace("transform(): end");
    return response;
  }

  // transform_histogram (POST)
  public PrepHistogramResponse transform_histogram(String dsId, int ruleIdx, List<Integer> colnos, List<Integer> colWidths) throws Exception {
    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
    LOGGER.trace("transform_histogram(): start");
    LOGGER.trace("transform_histogram(): dsId={} ruleIdx={} colnos={} colWidths={}", dsId, ruleIdx, colnos, colWidths);

    DataFrame df = teddyImpl.getDfAt(dataset.getDsId(), getDstRevision(dsId, ruleIdx));
    List<Histogram> colHists = createHistsWithColWidths(df, colnos, colWidths);

    LOGGER.trace("transform_histogram(): end");
    return new PrepHistogramResponse(colHists);
  }

  private Map<String, Integer> getTimestampFormatList(DataFrame df, String colName) throws Exception{
    Map<String, Integer> timestampFormatList = new LinkedHashMap<>();
    List<TimestampTemplate> timestampStyleGuess = new ArrayList<>();
    int colNo;

    if(colName.equals("")) {
    }
    else {

      try {
        colNo = df.getColnoByColName(colName);
      } catch (Exception e) {
        return null;
      }

      int rowCount = df.rows.size() < 100 ? df.rows.size() : 100;

      for (int i = 0; i < rowCount; i++) {
        if (df.rows.get(i).get(colNo) == null)
          continue;

        String str = df.rows.get(i).get(colNo).toString();

        for (TimestampTemplate tt : TimestampTemplate.values()) {
          try {
            DateTimeFormatter dtf = DateTimeFormat.forPattern(tt.getFormat());
            DateTime.parse(str, dtf);

            timestampStyleGuess.add(tt);
            break;
          } catch (Exception e) {
            //LOGGER.info("create(): Detecting Column Type...", e);
          }
        }
      }
    }

    for(TimestampTemplate tt : TimestampTemplate.values()) {
      String timestampFormat = tt.getFormatForRuleString();
      timestampFormatList.put(timestampFormat, 0);
    }

    for(TimestampTemplate tt : timestampStyleGuess) {
      String timestampFormat = tt.getFormatForRuleString();
      timestampFormatList.put(timestampFormat, timestampFormatList.get(timestampFormat)+1);
    }

    return timestampFormatList;
  }

  // transform_timestampFormat
  public Map<String, Object> transform_timestampFormat(String dsId, List<String> colNames) throws  Exception{
    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
    DataFrame df = teddyImpl.getDfAt(dataset.getDsId(), dataset.getRuleCnt());
    Map<String, Object> response = new HashMap<>();

    if(colNames.size() == 0)
      colNames.add("");

    for(String colName : colNames) {
      response.put(colName, getTimestampFormatList(df, colName));
    }

    return response;
  }

  // this includes IMPORTED datasets
  private Map<String, Object> buildDatasetInfoRecursive(String wrangledDsId) throws IOException {
    // {"origTeddyDsId": "MASTER-TEDDY-DSID",
    //  "importType": "HIVE",
    //  "sourceQuery": "select * from t",
    //  "ruleStrings": ["rename col:x to: y", "join ... dataset2: JOIN-TARGET-TEDDY-DSID"],
    //  "upstreamDatasetInfos": [
    //           {"origTeddyDsId": "JOIN-TARGET-TEDDY-DSID",
    //            "importType": "HIVE",
    //            "sourceQuery": "select * from s",
    //            "ruleStrings": ["rename col:a to: b", "drop col:c", "union dataset2: UNION-TARGET-TEDDY-DSID1, UNION-TARGET-TEDDY-DSID2"],
    //            "upstreamDatasetInfos": [
    //                     {"origTeddyDsId": "UNION-TARGET-TEDDY-DSID1",
    //                      "importType": "FILE",
    //                      "filePath": "hdfs://metatron/user/hive/imported_upload/sample1.csv",
    //                      "delimiter": ",",
    //                      "ruleStrings": [],
    //                      "upstreamDatasetInfos": []},
    //                     {"origTeddyDsId": "UNION-TARGET-TEDDY-DSID2",
    //                      "importType": "FILE",
    //                      "filePath": "hdfs://metatron/user/hive/imported_upload/sample2.csv",
    //                      "delimiter": ",",
    //                      "ruleStrings": [],
    //                      "upstreamDatasetInfos": []} ] } ] }

    Map<String, Object> datasetInfo = new HashMap();
    List<Map<String, Object>> upstreamDatasetInfos = new ArrayList();

    // put origTeddyDsId
    datasetInfo.put("origTeddyDsId", wrangledDsId);

    for (String upstreamDsId : getUpstreamDsIds(wrangledDsId, false)) {
      PrepDataset upstreamDataset = datasetRepository.findRealOne(datasetRepository.findOne(upstreamDsId));
      if (upstreamDataset.getDsTypeForEnum() == PrepDataset.DS_TYPE.IMPORTED) {
        datasetInfo.put("importType", upstreamDataset.getImportType());
        switch (upstreamDataset.getImportTypeEnum()) {
          case FILE:
            //datasetInfo.put("filePath", hiveDefaultUploadHDFSPath + "/" + upstreamDataset.getFilekey());
//            String filePath = datasetFileService.uploadHdfsAndReturnPath(upstreamDataset.getFilekey());
            /* HDFS upload 처리 이슈에서 변경함
            String filePath = Paths.get(localBaseDir, "uploads", upstreamDataset.getFilekey()).toString();
            upstreamDataset.putCustomValue("filePath",filePath);
            */
            String filePath = upstreamDataset.getCustomValue("filePath");
            /*
            String custom = upstreamDataset.getCustom();
            custom = custom.replaceAll("\"filePath\"\\s*:\\s*\"[^\"]*\"","\"filePath\":\""+filePath+"\"");
            upstreamDataset.setCustom(custom);
            */
            datasetInfo.put("filePath", filePath);
            datasetInfo.put("delimiter", upstreamDataset.getDelimiter());
            break;
          case HIVE:
            datasetInfo.put("sourceQuery", upstreamDataset.getQueryStmt());
            break;
          case DB:
            datasetInfo.put("sourceQuery", upstreamDataset.getQueryStmt());
            String dcId = upstreamDataset.getDcId();
            datasetInfo.put("dcId", dcId);
            DataConnection dataConnection = this.connectionRepository.getOne(dcId);
            datasetInfo.put("implementor", dataConnection.getImplementor() );
            datasetInfo.put("connectUri", dataConnection.getConnectUrl() );
            datasetInfo.put("username", dataConnection.getUsername() );
            datasetInfo.put("password", dataConnection.getPassword() );
            break;
          default:
            assert false : upstreamDataset.getImportType();
        }
      } else {
        Map<String, Object> upstreamDatasetInfo = buildDatasetInfoRecursive(upstreamDsId);  // add slaves first
        upstreamDatasetInfos.add(upstreamDatasetInfo);
      }
    }

    // put sourceQuery
    assert datasetInfo.get("sourceQuery") != null || datasetInfo.get("filePath") != null : wrangledDsId;

    // put ruleStrings
    List<String> ruleStrings = new ArrayList<>();
    for (PrepTransformRule transformRule : getRulesInOrder(wrangledDsId)) {
      String ruleString = transformRule.getRuleString();
      ruleStrings.add(ruleString);
    }
    datasetInfo.put("ruleStrings", ruleStrings);

    // put upstreamDatasetInfos
    datasetInfo.put("upstreamDatasetInfos", upstreamDatasetInfos);

    LOGGER.info("runTransformer(): datasetInfo: " + GlobalObjectMapper.getDefaultMapper().writeValueAsString(datasetInfo));
    return datasetInfo;
  }

  private String runTwinkle(String jsonPrepPropertiesInfo, String jsonDatasetInfo, String jsonSnapshotInfo) {
    String result = "RUNNING";

    // copied from ProcessFunctionAnalyzer.java
    String baseName = FilenameUtils.getBaseName(prepProperties.getEtl().getJar());
    // TODO : sparkProperties 삭제로 인한 임의 수정이므로 별도 수정 부탁드립니다
//    String appName = sparkProperties.getAppNamePrefix() + "-" + baseName + "-" + System.currentTimeMillis();
    String appName = baseName + "-" + System.currentTimeMillis();
//    File workingDir = new File(sparkProperties.getWorkingDir() + File.separator + appName);
    File workingDir = new File("/tmp" + File.separator + appName);
    Process process;

    try {
      FileUtils.forceMkdir(workingDir);
      if (!workingDir.exists()) {
        throw new IllegalArgumentException("Fail to create working directory :" + workingDir.getAbsolutePath());
      }

      LOGGER.info("runTwinkle(): engine=twinkle");
      List<String> commands = Lists.newArrayList(
              "java",
              prepProperties.getEtl().getJvmOptions(),
              "-jar",
              prepProperties.getEtl().getJar(),
              "twinkle",
              jsonPrepPropertiesInfo,
              jsonDatasetInfo,
              jsonSnapshotInfo
      );

      LOGGER.info("ProcessCommands : {}", commands);

      ProcessBuilder pb = new ProcessBuilder(commands);

      File errFile = new File(workingDir.getAbsolutePath() + File.separator + "transformer_stderr.log");
      File logFile = new File(workingDir.getAbsolutePath() + File.separator + "transformer_stdout.log");
      pb.redirectOutput(logFile);
      pb.redirectError(errFile);

      process = pb.start();
      if (process.waitFor(100, TimeUnit.MILLISECONDS)) {
        int errCode = process.exitValue();
        if (errCode == 0) {
          result = FileUtils.readFileToString(logFile);
        } else {
          LOGGER.error("runTwinkle() failed: logFile: " + FileUtils.readFileToString(logFile));
          LOGGER.error("runTwinkle() failed: errFile: " + FileUtils.readFileToString(errFile));
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TRANSFORM_SNAPSHOT_FAILED);
        }
      }
    } catch (Exception e) {
      LOGGER.error("runTwinkle(): failed to create a HIVE snapshot: appName={} errmsg={}", appName, e.getMessage());
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TRANSFORM_SNAPSHOT_FAILED);
    }

    return result;
  }

  private String getJsonSnapshotInfoForTwinkle(PrepSnapshotRequestPost requestPost, String ssId, String ssName) throws JsonProcessingException {
    Map<String, Object> snapshotInfo = new HashMap();

    // 공통
    snapshotInfo.put("ssId",              ssId);
    snapshotInfo.put("ssName",            requestPost.getSsName());
    snapshotInfo.put("ssType",            requestPost.getSsType());
    snapshotInfo.put("engine",            "twinkle");       // 로깅을 위해 포함
    snapshotInfo.put("format",            requestPost.getFormat().toLowerCase());
    snapshotInfo.put("fileUri",           requestPost.getUri());
    snapshotInfo.put("localBaseDir",      prepProperties.getLocalBaseDir());    // FILE snapshot을 읽어들이는데 사용
    snapshotInfo.put("stagingBaseDir",    prepProperties.getStagingBaseDir());  // extHdfsDir이 따로 안주어졌을 때 사용
    snapshotInfo.put("partKeys",          requestPost.getPartKeys());
    snapshotInfo.put("dbName",            requestPost.getDbName());
    snapshotInfo.put("tblName",           requestPost.getTblName());

    // Twinkle 전용
    snapshotInfo.put("codec",             requestPost.getCompression().toLowerCase());
    snapshotInfo.put("mode",              requestPost.getMode().toLowerCase());
    snapshotInfo.put("driver-class-name", datasourceDriverClassName);
    snapshotInfo.put("url",               datasourceUrl);
    snapshotInfo.put("username",          datasourceUsername);
    snapshotInfo.put("password",          datasourcePassword);

    return GlobalObjectMapper.getDefaultMapper().writeValueAsString(snapshotInfo);
  }

//  private String getJsonSnapshotInfoForEmbeddedEngine(PrepSnapshotRequestPost requestPost, String ssId, String ssName) throws JsonProcessingException {
//    Map<String, Object> snapshotInfo = new HashMap();
//
//    // 공통
//    snapshotInfo.put("ssId",           ssId);
//    snapshotInfo.put("ssName",            requestPost.getSsName());
//    snapshotInfo.put("ssType",         requestPost.getSsType());
//    snapshotInfo.put("engine",         "embedded");      // 로깅을 위해 포함
//    snapshotInfo.put("format",         requestPost.getFormat());
//    snapshotInfo.put("fileUri",           requestPost.getUri());
//    snapshotInfo.put("localBaseDir",   localBaseDir);
//    snapshotInfo.put("stagingBaseDir", stagingBaseDir);
//    snapshotInfo.put("partKeys",       requestPost.getPartKeys());
//    snapshotInfo.put("dbName",         requestPost.getDbName());
//    snapshotInfo.put("tblName",        requestPost.getTblName());
//
//    // Embedded engine 전용
//    snapshotInfo.put("compression",    requestPost.getCompression());
//    snapshotInfo.put("ssName",         ssName);            // for naming FILE snapshot
//    snapshotInfo.put("partKeys",       new ArrayList());   // TODO: currently, partitioned table is not supported by embedded engine
//
//    return GlobalObjectMapper.getDefaultMapper().writeValueAsString(snapshotInfo);
//  }

  private String getJsonDatasetInfo(String wrangledDsId) throws IOException {
    Map<String, Object> datasetInfo = buildDatasetInfoRecursive(wrangledDsId);
    return GlobalObjectMapper.getDefaultMapper().writeValueAsString(datasetInfo);
  }

  // FIXME: 각 snapshot type별로 필요한 코드만 사용하도록 정리. 특히, spark 관련 파라미터 꼭 필요한 것만 사용하도록 하기
  String runTransformer(String wrangledDsId, PrepSnapshotRequestPost requestPost, String ssId, String authorization) throws Throwable {
    // 1. spark, dataprep configuration
    // 2. datasetInfos --> 순차적으로 만들 dataframe의 ruleStrings 및 importInfo
    // 3. snapshotInfo --> 목적 결과물에 대한 정보 (HIVE의 경우 table)
    //    - 공통
    //      - ssType -> FILE, HDFS, HIVE
    //      - format -> CSV, ORC
    //      - engine
    //      - ssId
    //      - localBaseDir
    //      - stagingBaseDir
    //    - HIVE
    //      - partKeys
    //      - codec     (사용자가 입력한 compression 항목)
    //      - mode
    //      - dbName
    //      - tblName
    //      - extHdfsDir
    //    - FILE
    //      - compression
    //      - ssName    (target directory 명에 쓰임)

    String jsonPrepPropertiesInfo = getJsonPrepPropertiesInfo(requestPost);
    String jsonDatasetInfo         = getJsonDatasetInfo(wrangledDsId);
    String jsonSnapshotInfo        = getJsonSnapshotInfo(requestPost, ssId);

    switch (requestPost.getEngineEnum()) {
      case TWINKLE:
        return runTwinkle(jsonPrepPropertiesInfo, jsonDatasetInfo, jsonSnapshotInfo);  // Twinkle doesn't support callback for now.
      case EMBEDDED:
        return runTeddy(jsonPrepPropertiesInfo, jsonDatasetInfo, jsonSnapshotInfo, authorization);
      default:
        assert false : requestPost.getEngine();
    }

    return "CANNOT_REACH_HERE";
  }

  public void checkNonAlphaNumericalColNames(Map<String, Object> mapDatasetInfo) throws PrepException {
    try {
      teddyImpl.checkNonAlphaNumericalColNames((String) mapDatasetInfo.get("origTeddyDsId"));
    } catch (IllegalColumnNameForHiveException e) {
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_FORMAT_WRONG, e.getMessage());
    }
    List<Map<String, Object>> upstreamDatasetInfos = (List<Map<String, Object>>) mapDatasetInfo.get("upstreamDatasetInfos");
    for (Map<String, Object> upstreamDatasetInfo : upstreamDatasetInfos) {
      checkNonAlphaNumericalColNames(upstreamDatasetInfo);
    }
  }

  private String runTeddy(String jsonPrepPropertiesInfo, String jsonDatasetInfo, String jsonSnapshotInfo, String authorization) throws Throwable {
    LOGGER.info("runTeddy(): engine=embedded");

    // check non-alphanumerical column name on hive snapshot
    checkNonAlphaNumericalColNames(GlobalObjectMapper.readValue(jsonDatasetInfo, HashMap.class));

    Future<String> future = teddyExecutor.run(new String[]{"embedded", jsonPrepPropertiesInfo, jsonDatasetInfo, jsonSnapshotInfo, serverPort, authorization});

    LOGGER.debug("runTeddy(): (Future) result from teddyExecutor: " + future.toString());
    return "RUNNING";
  }

//  @Transactional  // temporarily untransactional until teddy-executor uses springframework (JPA)
  public PrepSnapshotResponse transform_snapshot(String wrangledDsId, PrepSnapshotRequestPost requestPost, String authorization) throws Throwable {
    PrepSnapshotResponse response;
    List<String> allFullDsIds;

    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(wrangledDsId));
    assert dataset != null : wrangledDsId;

    LOGGER.trace("transform_snapshot(): start");

    PrepSnapshot snapshot = new PrepSnapshot();

    DateTime launchTime = DateTime.now(DateTimeZone.UTC);
    if(null==requestPost.getSsName()) {
      requestPost.setSsName(this.snapshotService.makeSnapshotName(dataset.getDsName(),launchTime));
    }
    snapshot.setSsName(requestPost.getSsName());

    String creatorDfId = dataset.getCreatorDfId();
    assert creatorDfId != null : dataset.toString();

    PrepDataflow dataflow = dataflowRepository.findOne(creatorDfId);
    snapshot.setCreatorDfName(dataflow.getDfName());

    snapshot.setDsName(dataset.getDsName());
    snapshot.setVersion(dataset.getVersion());
    snapshot.setSsType(requestPost.getSsTypeEnum());
    snapshot.setUri(requestPost.getUri());
    snapshot.setDbName(requestPost.getDbName());
    snapshot.setTblName(requestPost.getTblName());
    snapshot.setFormat(requestPost.getFormatEnum());
    snapshot.setCompression(requestPost.getCompressionEnum());
    snapshot.setEngine(requestPost.getEngineEnum());
    snapshot.setProfile(requestPost.isProfile());
    snapshot.setLaunchTime(launchTime);

    // snapshot table의 partition 정보는 custom field에 JSON으로 저장
    List<String> partKeys = requestPost.getPartKeys();
    ObjectMapper mapper = new ObjectMapper();
    String json = mapper.writeValueAsString(partKeys);
    snapshot.putCustomValue("part_keys",json);

    // lineage information도 JSON으로 저장
    // - dataflow name
    // - dataset name, createdTime, createdBy
    // - origImported name, query, cretedTime, createdBy
    Map<String, Object> map = new HashMap<>();
    PrepDataflow df = dataflowRepository.findOne(dataset.getCreatorDfId());
    map.put("dfName", df.getDfName());
    map.put("dfId", df.getDfId());
    map.put("dsName", dataset.getDsName());
    map.put("dsId", dataset.getDsId());
    map.put("createdTime", dataset.getCreatedTime().toString());
    map.put("createdBy", dataset.getCreatedBy());

    if(null!=dataset.getGridResponse()) {
      map.put("slaveDsNameMap", dataset.getGridResponse().getSlaveDsNameMap());
    } else {
      map.put("slaveDsNameMap", null);
    }
    if(null!=dataset.getRuleStringInfos()) {
      map.put("ruleStringinfos", dataset.getRuleStringInfos());
    } else {
      map.put("ruleStringinfos", null);
    }

    Map<String, Object> mapOrigDataset = new HashMap<>();
    PrepDataset origDataset = datasetRepository.findRealOne(datasetRepository.findOne(getUpstreamImportedDsId(dataset.getDsId())));
    mapOrigDataset.put("dsName", origDataset.getDsName());
    mapOrigDataset.put("queryStmt", requestPost.getSsTypeEnum() == PrepSnapshot.SS_TYPE.HIVE ? origDataset.getQueryStmt() : "N/A");
    mapOrigDataset.put("createdTime", origDataset.getCreatedTime().toString());
    mapOrigDataset.put("createdBy", origDataset.getCreatedBy());
    map.put("origDsInfo", mapOrigDataset);

    String jsonLineageInfo = mapper.writeValueAsString(map);
    snapshot.setLineageInfo(jsonLineageInfo);

    snapshotRepository.saveAndFlush(snapshot);

    if (requestPost.getSsTypeEnum() == PrepSnapshot.SS_TYPE.FILE ||
        requestPost.getSsTypeEnum() == PrepSnapshot.SS_TYPE.HDFS ||
        requestPost.getSsTypeEnum() == PrepSnapshot.SS_TYPE.HIVE) {
      String result = runTransformer(wrangledDsId, requestPost, snapshot.getSsId(), authorization);
      LOGGER.info("transform_snapshot(): return from runTransformer(): " + result);

      allFullDsIds = new ArrayList<>();   // for backward-compatability
    }
    else {
      throw new IllegalArgumentException(requestPost.toString());
    }

    //snapshot.setDataset(dataset);
    snapshotRepository.saveAndFlush(snapshot);

    response = new PrepSnapshotResponse(snapshot.getSsId(), allFullDsIds, snapshot.getSsName());

    LOGGER.trace("transform_snapshot(): end");
    return response;
  }

  private String getUpstreamImportedDsId(String wrangledDsId) throws IOException {
    for (String upstreamDsId : getUpstreamDsIds(wrangledDsId, false)) {
      PrepDataset upstreamDataset = datasetRepository.findRealOne(datasetRepository.findOne(upstreamDsId));
      if (upstreamDataset.getDsTypeForEnum() == PrepDataset.DS_TYPE.IMPORTED) {
        return upstreamDsId;
      }
    }
    assert false : wrangledDsId;
    return null;
  }

  public PrepStatsResponse transform_stats(String dsId, int ruleIdx) throws Exception
  {
    // Not implemented

    Map<String, Object> stats = new HashMap<>();
    PrepStatsResponse response = new PrepStatsResponse(stats);
    return response;
  }

  // APPEND ////////////////////////////////////////////////////////////
  //  - leave an APPEND transition
  //  - transform the grid, ruleCurIdx, ruleString[]
  //  - return a response which contains grid, ruleCurIdx (ruleString[] will be added in caller)
  private PrepTransformResponse append(PrepDataset dataset, String ruleString) throws Exception {
    PrepTransition last = getLastTransition(dataset);
    PrepTransition transition = new PrepTransition(dataset, OP_TYPE.APPEND);
    PrepTransformResponse response;

    LOGGER.trace("append(): start");

    if (last.getOp() == OP_TYPE.UNDO) {
      clearUndoState(dataset);
    }

    if (dataset.getRuleCurIdx() != dataset.getRuleCnt() - 1) {
      assert dataset.getRuleCurIdx() < dataset.getRuleCnt() :
        String.format("ruleCurIdx=%d ruleCurCnt=%d", dataset.getRuleCurIdx(), dataset.getRuleCnt());
      throw new IllegalArgumentException("APPEND not permitted: APPEND from the last as needed");
    }

    // leave a transition
    transition.setChangeNo(last.getChangeNo() + 1);
    transition.setDsRevision(last.getDsRevision() + 1);
    transition.setRuleString(ruleString);
    transition.setRuleCurIdxBefore(last.getRuleCurIdxAfter());
    transition.setRuleCntBefore(last.getRuleCntAfter());
    transition.setRuleCurIdxAfter(transition.getRuleCurIdxBefore() + 1);
    transition.setRuleCntAfter(transition.getRuleCntBefore() + 1);

    transition.setSrcIdx(last.getDsRevision());
    transition.setDstIdx(last.getDsRevision() + 1);

    transitionRepository.save(transition);

    dataset.setRuleCurIdx(transition.getRuleCurIdxAfter());
    dataset.setRuleCnt(transition.getRuleCntAfter());
    datasetRepository.save(dataset);

    PrepTransformRule rule = new PrepTransformRule(dataset, dataset.getRuleCnt() - 1, ruleString);
    transformRuleRepository.save(rule);

    response = append_internal(dataset, ruleString);
    return response;
  }

  private ArrayList<String> getTargetDsIds(String ruleString) {
    ArrayList<String> targetDsIds = new ArrayList<>();

    String jsonRuleString = parseRuleString(ruleString);

    HashMap<String, Object> map;
    try {
      map = new ObjectMapper().readValue(jsonRuleString, HashMap.class);

      String ruleName = (String) map.get("name");
      if (ruleName.equalsIgnoreCase("join") || ruleName.equalsIgnoreCase("union")) {
        HashMap<String, Object> dataset2 = (HashMap<String, Object>)map.get("dataset2");
        Object obj = dataset2.get("escapedValue");
        if (obj != null) {
          targetDsIds.add((String)obj);
        } else {
          for (Object s : (List<Object>)((HashMap<String, Object>)map.get("dataset2")).values().toArray()[0]) {
            targetDsIds.add(((String)s).replace("'", ""));
          }
        }
      }
    } catch (IOException e) {
      e.printStackTrace();
    }

    LOGGER.trace("append(): end");
    return targetDsIds;
  }

  private PrepTransformResponse preview(PrepDataset dataset, String ruleString) throws Exception {
    List<String> newRules = new ArrayList<>();  // one-element array (all the time)
    newRules.add(ruleString);

    // join이나 union의 경우, 각각 대상 dataset들을 함께 인자로 넘겨준다.
    ArrayList<String> targetDsIds = getTargetDsIds(ruleString);
    ArrayList<PrepDataset> targetDatasets = new ArrayList<>();

    for (String targetDsId : targetDsIds) {
      load_internal(targetDsId, false);  // 필요한 경우 PLM cache에 loading하거나, transition을 다시 적용한다.

      PrepDataset targetDataset = datasetRepository.findRealOne(datasetRepository.findOne(targetDsId));
      targetDataset = datasetRepository.findRealOne(targetDataset);
      targetDatasets.add(targetDataset);
    }

    DataFrame gridResponse;
    gridResponse = teddyImpl.applyRule(dataset.getDsId(), ruleString, -1, true, true);

    PrepTransformResponse response = new PrepTransformResponse(dataset.getRuleCurIdx(), gridResponse);
    return response;
  }

  private PrepTransformResponse append_internal(PrepDataset dataset, String ruleString) throws Exception {
    assert teddyImpl.cache.containsKey(dataset.getDsId()) : dataset.getDsId();

    DataFrame gridResponse = teddyImpl.applyRule(dataset.getDsId(), ruleString, -1, true, false);

    PrepTransformResponse response = new PrepTransformResponse(dataset.getRuleCurIdx(), gridResponse);
    return response;
  }

  private int getLastDsRevision(PrepDataset dataset) {
    PrepTransition last = getLastTransition(dataset);
    return last.getDsRevision();
  }

  // DELETE ////////////////////////////////////////////////////////////
  private PrepTransformResponse delete(PrepDataset dataset) {
    PrepTransition last = getLastTransition(dataset);
    PrepTransition transition = new PrepTransition(dataset, OP_TYPE.DELETE);
    DataFrame gridResponse = null;

    // delete할 것이 없는 경우 처리
    if (dataset.getRuleCurIdx() == -1) {
      throw new IllegalArgumentException(
              String.format("There's no transform rule: dsId=%s", dataset.getDsId()));
    }

    if (dataset.getRuleCurIdx() != dataset.getRuleCnt() - 1) {
      assert dataset.getRuleCurIdx() < dataset.getRuleCnt() :
        String.format("ruleCurIdx=%d ruleCurCnt=%d", dataset.getRuleCurIdx(), dataset.getRuleCnt());
      throw new IllegalArgumentException(
              String.format("DELETE is only permitted at the end of the rules: dsId=%s", dataset.getDsId()));
    }

    if (last.getOp() == OP_TYPE.UNDO) {
      clearUndoState(dataset);
    }

    // ruleCurIdx:    지우려는 index
    // newRuleCurIdx: 결국 새로 설정될 index
    int ruleCurIdx = dataset.getRuleCurIdx();
    assert ruleCurIdx == last.getRuleCurIdxAfter() :
            String.format("ruleCurIdx=%d last.getRuleCurIdxAfter()=%d", ruleCurIdx, last.getRuleCntAfter());
    int newRuleCurIdx = ruleCurIdx - 1;

    transition.setChangeNo(last.getChangeNo() + 1);
    transition.setDsRevision(last.getDsRevision() + 1);

    transition.setRuleCurIdxBefore(ruleCurIdx);
    transition.setRuleCurIdxAfter(newRuleCurIdx);
    transition.setRuleCntBefore(dataset.getRuleCnt());
    transition.setRuleCntAfter(dataset.getRuleCnt() - 1);

    // 없어지는 rule string을 보존
    PrepTransformRule rule = getTransformRuleAt(dataset, dataset.getRuleCnt() - 1);
    transition.setRuleString(rule.getRuleString());

    // srcIdx: 현재 상태 (UNDO시 되돌아 올 상태)
    // dstIdx: 결국 남을 상태 --> response에 실음
    transition.setSrcIdx(last.getDsRevision());  // meaningless for twinkle. only for UNDO
    int targetDsRevision = getLastDsRevisionForRuleIdx(dataset.getDsId(), transition.getRuleCurIdxAfter());
    transition.setDstIdx(targetDsRevision);

    transitionRepository.save(transition);

    rule = new PrepTransformRule(dataset, transition.getRuleCurIdxBefore(), null);
    transformRuleRepository.delete(rule);
    transformRuleRepository.flush();

    dataset.setRuleCurIdx(transition.getRuleCurIdxAfter());
    dataset.setRuleCnt(transition.getRuleCntAfter());
    datasetRepository.save(dataset);

    String dsId = dataset.getDsId();
    gridResponse = teddyImpl.duplicateDf(dsId, targetDsRevision);
    return new PrepTransformResponse(newRuleCurIdx, gridResponse);
  }

  // UPDATE ////////////////////////////////////////////////////////////
  private PrepTransformResponse update(PrepDataset dataset, String ruleString) throws Exception {
    PrepTransition last = getLastTransition(dataset);
    PrepTransition transition = new PrepTransition(dataset, OP_TYPE.UPDATE);

    if (last.getOp() == OP_TYPE.UNDO) {
      clearUndoState(dataset);
    }

    if (dataset.getRuleCurIdx() != dataset.getRuleCnt() - 1) {
      assert dataset.getRuleCurIdx() < dataset.getRuleCnt() :
        String.format("ruleCurIdx=%d ruleCurCnt=%d", dataset.getRuleCurIdx(), dataset.getRuleCnt());
      throw new IllegalArgumentException("UPDATE not permitted: UPDATE from the last as needed");
    }

    // leave a transition
    transition.setChangeNo(last.getChangeNo() + 1);
    transition.setDsRevision(last.getDsRevision() + 1);
    transition.setRuleString(ruleString);
    transition.setRuleCurIdxBefore(last.getRuleCurIdxAfter());
    transition.setRuleCntBefore(last.getRuleCntAfter());
    transition.setRuleCurIdxAfter(transition.getRuleCurIdxBefore());
    transition.setRuleCntAfter(transition.getRuleCntBefore());

    transition.setSrcIdx(getSrcRevision(dataset.getDsId(), dataset.getRuleCurIdx()));
    transition.setDstIdx(transition.getDsRevision());

    transitionRepository.save(transition);

    dataset.setRuleCurIdx(transition.getRuleCurIdxAfter());
    dataset.setRuleCnt(transition.getRuleCntAfter());
    datasetRepository.save(dataset);

    PrepTransformRule rule = new PrepTransformRule(dataset, dataset.getRuleCurIdx(), ruleString);
    transformRuleRepository.save(rule);

    PrepTransformResponse response = update_internal(dataset, ruleString, transition.getSrcIdx(), transition.getDstIdx());
    return response;
  }

  private PrepTransformResponse update_internal(PrepDataset dataset, String ruleString, int srcIdx, int dstIdx) throws Exception {
    List<String> newRules = new ArrayList<>();  // one-element array (all the time)
    newRules.add(ruleString);

    assert teddyImpl.cache.containsKey(dataset.getDsId()) : dataset.getDsId();
    DataFrame gridResponse = teddyImpl.applyRule(dataset.getDsId(), ruleString, srcIdx, true, false);

    PrepTransformResponse response = new PrepTransformResponse(dataset.getRuleCurIdx(), gridResponse);

    assert dataset.getRuleCurIdx() == dataset.getRuleCnt() - 1 :
      String.format("ruleCurIdx=%d ruleCurCnt=%d", dataset.getRuleCurIdx(), dataset.getRuleCnt());

    return response;
  }

  private PrepTransformResponse fetch(PrepDataset dataset, int ruleIdx) throws PrepException { // TeddyException {
    int dstRevision;

    assert ruleIdx >= -1 : "fetch(): no rule string: dsId=" + dataset.getDsId();

    if (ruleIdx == -1)
      dstRevision = 0;
    else
      dstRevision = getDstRevision(dataset.getDsId(), ruleIdx);

    DataFrame gridResponse;
    gridResponse = teddyImpl.getDfAt(dataset.getDsId(), dstRevision);

    PrepTransformResponse response = new PrepTransformResponse(dataset.getRuleCurIdx(), gridResponse);
    response.setRuleStringInfos(getRulesInOrder(dataset.getDsId()), false, false);
    return response;
  }

  private PrepTransformResponse jump(PrepDataset dataset, int ruleIdx) throws PrepException { // TeddyException {
    dataset.setRuleCurIdx(ruleIdx);
    datasetRepository.save(dataset);

    return fetch(dataset, ruleIdx);
  }

  // UNDO ////////////////////////////////////////////////////////////
  //  - leave an undo transition (for redo later)
  //  - transform the grid, ruleCurIdx, ruleString[]
  private PrepTransformResponse undo(PrepDataset dataset) throws PrepException { // TeddyException {
    PrepTransition last = getLastTransition(dataset);   // last before curIdx
    PrepTransition against = last;
    PrepTransition transition;
    PrepTransformRule rule;

    // 뭐에 대한 undo인지를 찾아내기.
    // 모든 UNDO transition pass후, (UNDO streak은 언제나 1개이고, 직전 transition에서부터 시작됨)
    // 이후, last와 같은 revision을 찾을 때까지 계속 이전의 transition으로 이동
    while (against.getOp() == OP_TYPE.UNDO || against.getDsRevision() > last.getDsRevision())
      against = getBeforeTransition(against);

    // 과한 UNDO -> 무시하고, 현재 상태를 리턴.
    if (against.getOp() == OP_TYPE.CREATE) {
      DataFrame gridResponse = null;
      gridResponse = teddyImpl.getDfAt(dataset.getDsId(), last.getDsRevision());
      return new PrepTransformResponse(dataset.getRuleCurIdx(), gridResponse);
    }

    // leave a transition
    transition = new PrepTransition(dataset, OP_TYPE.UNDO);
    transition.setChangeNo(last.getChangeNo() + 1);

    assert against.getDsRevision() == last.getDsRevision() : against;
//    assert against.getDsRevision() == against.getDstIdx() : against;
//    assert last.getDsRevision() == last.getDstIdx() : last;

    transition.setDsRevision(against.getDsRevision() - 1);
    transition.setRuleString(against.getRuleString());  // 없어도 동작 (디버깅용 정보를 DB에 저장)

    transition.setRuleCurIdxBefore(against.getRuleCurIdxAfter());
    transition.setRuleCurIdxAfter(against.getRuleCurIdxBefore());

    transition.setRuleCntBefore(against.getRuleCntAfter());
    transition.setRuleCntAfter(against.getRuleCntBefore());

    transition.setSrcIdx(against.getDsRevision());      // logic에 쓰이지 않음. 디버깅용.
    transition.setDstIdx(against.getDsRevision() - 1);

    assert(transition.getDsRevision() == transition.getDstIdx());   // always true, not only UNDO case
    transitionRepository.save(transition);

    // manage on transform rules
    switch (against.getOp()) {
      case APPEND:  // r1 -(against)-> r1,r2 : r1,r2 --> r1
        transformRuleRepository.delete(getTransformRuleAt(dataset, against.getRuleCntAfter() - 1));
        break;
      case DELETE:  // r1,r2 -(against)-> r1 : r1 --> r1,r2
        // make a transform rule with the corresponding transition
        rule = new PrepTransformRule(dataset, against.getRuleCurIdxBefore(), against.getRuleString());
        transformRuleRepository.save(rule);
        break;
      case UPDATE:  // r1,r2 -(against)-> r1,r3 : r1,r3 --> r1,r2
        PrepTransition previous = getBeforeTransition(against);
        String originalRuleString = "invalid";
        while (true) {
          if (previous.getRuleCurIdxAfter() == against.getRuleCurIdxAfter()) {
            switch (previous.getOp()) {
              case CREATE:
              case APPEND:
              case UPDATE:
                originalRuleString = previous.getRuleString();
                break;

              case DELETE:
              case JUMP:
              case UNDO:
                continue;

              case NOT_USED:
              default:
                throw new IllegalArgumentException("invalid transform op: " + transition.getOp().toString());
            }
          }
          previous = getBeforeTransition(previous);
          if (previous == null) {
            LOGGER.error("cannot find the previous transition of UPDATE");
            break;
          }
        }

        rule = getTransformRuleAt(dataset, against.getRuleCurIdxAfter());
        rule.setRuleString(originalRuleString);
        transformRuleRepository.save(rule);
        break;

      case UNDO:
      case REDO:
      case CREATE:
        assert false : against.getOp();
        break;

      default:
        throw new IllegalArgumentException("invalid transform op: " + transition.getOp().toString());
    }

    // transform the grid, ruleCurIdx
    dataset.setRuleCurIdx(transition.getRuleCurIdxAfter());
    dataset.setRuleCnt(transition.getRuleCntAfter());
    datasetRepository.save(dataset);

    DataFrame gridResponse = null;
    gridResponse = teddyImpl.getDfAt(dataset.getDsId(), transition.getDsRevision());
    PrepTransformResponse response = new PrepTransformResponse(dataset.getRuleCurIdx(), gridResponse);

    return response;
  }

  // REDO ////////////////////////////////////////////////////////////
  // 단지 UNDO transition 제거
  private PrepTransformResponse redo(PrepDataset dataset) throws PrepException { // TeddyException {
    PrepTransition last = getLastTransition(dataset);
    PrepTransition against = last;
    int undoCnt = 0;

    // 이전 transition은 반드시 UNDO
    assert last.getOp() == OP_TYPE.UNDO : last.getOp();

    while (against.getOp() == OP_TYPE.UNDO) {
      undoCnt++;
      against = getBeforeTransition(against);
    }

    while (undoCnt > 1) {
      against = getBeforeTransition(against);
      undoCnt--;
    }

    dataset.setRuleCurIdx(last.getRuleCurIdxBefore());
    dataset.setRuleCnt(last.getRuleCntBefore());
    datasetRepository.save(dataset);

    switch (against.getOp()) {
      case APPEND:  // r1 -(against)-> r1,r2 -(undo)-> r1 -(redo)-> r1,r2
        PrepTransformRule rule = new PrepTransformRule(dataset, against.getRuleCurIdxAfter(), against.getRuleString());
        transformRuleRepository.save(rule);
        break;
      case DELETE:  // r1,r2 -(against)-> r1 -(undo)-> r1,r2 -(redo)-> r1
        transformRuleRepository.delete(getTransformRuleAt(dataset, against.getRuleCntBefore() - 1));
        break;
      case UPDATE:  // r1,r2 -(against)-> r1,r3 -(undo)-> r1,r2 -(redo)-> r1,r3
        rule = getTransformRuleAt(dataset, against.getRuleCurIdxAfter());
        rule.setRuleString(against.getRuleString());
        transformRuleRepository.save(rule);

        break;
      case UNDO:
      case REDO:
      case CREATE:
        assert false : against.getOp();
        break;
    }

    transitionRepository.delete(last);
    transitionRepository.flush();

    dataset.setRuleCurIdx(against.getRuleCurIdxAfter());
    dataset.setRuleCnt(against.getRuleCntAfter());
    datasetRepository.save(dataset);

    DataFrame gridResponse = null;
    gridResponse = teddyImpl.getDfAt(dataset.getDsId(), getLastDsRevision(dataset));
    PrepTransformResponse response = new PrepTransformResponse(dataset.getRuleCurIdx(), gridResponse);
    return response;
  }


  private void clearUndoState(PrepDataset dataset) throws AssertionError {
    List<PrepTransition> transitions = transitionRepository.findAllByOrderByChangeNoDesc();
    int undoCnt = 0;

    for (PrepTransition transition : transitions) {
      if (transition.getDataset().getDsId().equals(dataset.getDsId()) == false)
        continue;

      if (transition.getOp() != OP_TYPE.UNDO)
        break;

      undoCnt++;
      transitionRepository.delete(transition);

      teddyImpl.removeLastDf(dataset.getDsId());
    }

    assert undoCnt > 0 : String.format("no UNDO to clear: undoCnt=%d dsId=%s", undoCnt, dataset.getDsId());

    transitions = transitionRepository.findAllByOrderByChangeNoDesc();

    for (PrepTransition transition : transitions) {
      if (transition.getDataset().getDsId().equals(dataset.getDsId()) == false)
        continue;

      if (undoCnt == 0)
        break;

      transitionRepository.delete(transition);
      undoCnt--;
    }

    // Spark stages will be deleted in loadContentsByRules()
  }

  private PrepTransformRule getTransformRuleAt(PrepDataset dataset, int ruleNo) {
    List<PrepTransformRule> transformRules = transformRuleRepository.findAllByOrderByRuleNoAsc();

    for (PrepTransformRule transformRule : transformRules) {
      if (transformRule.getDataset().getDsId().equals(dataset.getDsId()) == false)
        continue;

      if (transformRule.getRuleNo() == ruleNo)
        return transformRule;
    }
    throw new IllegalArgumentException(String.format("rule not found: dsId=%s ruleNo=%d", dataset.getDsId(), ruleNo));
  }

  private PrepTransition getBeforeTransition(PrepTransition transition) {
    List<PrepTransition> transitions = transitionRepository.findAllByOrderByChangeNoDesc();
    for (PrepTransition before : transitions) {
      // loop until the dsId matches
      if (before.getDataset().getDsId().equals(transition.getDataset().getDsId()) == false)
        continue;

      if (before.getChangeNo() < transition.getChangeNo())
        return before;
    }
    return null;
  }

  private PrepTransition getLastTransition(PrepDataset dataset) {
    List<PrepTransition> transitions = transitionRepository.findAllByOrderByChangeNoDesc();

    for (PrepTransition transition : transitions) {
      if (transition.getDataset().getDsId().equals(dataset.getDsId())) {
        return transition;
      }
    }

    assert false : "dsId: " + dataset.getDsId() + " + transitions: " + transitions;
    return null;
  }

  private int getLastDsRevisionForRuleIdx(String dsId, int ruleIdx) {
    List<PrepTransition> transitions = transitionRepository.findAllByOrderByChangeNoDesc();

    for (PrepTransition transition : transitions) {
      if (transition.getDataset().getDsId().equals(dsId)) {
        if (transition.getRuleCurIdxAfter() == ruleIdx) {
          return transition.getDsRevision();
        }
      }
    }

    assert false : "dsId: " +dsId + " + transitions: " + transitions;
    return -1;
  }

  // remote transitions except CREATE
  private void resetTransitions(String dsId) {
    List<PrepTransition> transitions = transitionRepository.findAllByOrderByChangeNoAsc();

    for (PrepTransition transition : transitions) {
      if (transition.getDataset().getDsId().equals(dsId)) {
        if (transition.getOp() != OP_TYPE.CREATE) {
          transitionRepository.delete(transition);
        }
      }
    }
  }

  // Returns Call with (ruleIdx = 0) to get initial grid
  private int getSrcRevision(String dsId, int ruleIdx) {
    // ruleIdx의 src가 된 revision을 찾아낸다.
    // UNDO, REDO, DELETE, JUMP 등을 모두 무시하고, 해당 ruleCurIdx를 있게한 CREATE, APPEND, UPDATE만 찾으면 된다.

    assert ruleIdx >= 0 : ruleIdx;  // CREATE에 대해 srcRevision을 찾으려는 시도

    List<PrepTransition> transitions = transitionRepository.findAllByOrderByChangeNoDesc();
    for (PrepTransition transition : transitions) {
      // loop until the dsId matches
      if (transition.getDataset().getDsId().equals(dsId) == false)
        continue;

      if (transition.getRuleCurIdxAfter() != ruleIdx)
        continue;

      switch (transition.getOp()) {
        case CREATE:
        case APPEND:
        case UPDATE:
          return transition.getSrcIdx();

        case DELETE:
        case JUMP:
          continue;

        case UNDO:
          throw new IllegalTransactionStateException(
                  String.format("UNDO had to be cleared: ruleIdx=%d dsId=%s", ruleIdx, dsId));

        case NOT_USED:
        default:
          throw new IllegalArgumentException("invalid transform op: " + transition.getOp().toString());
      }
    }
    throw new IllegalTransactionStateException(
            String.format("transition not found: ruleIdx=%d dsId=%s", ruleIdx, dsId));
  }

  // Call with (ruleIdx = -1) to get initial grid
  private int getDstRevision(String dsId, int ruleIdx) {
    List<PrepTransition> transitions = transitionRepository.findAllByOrderByChangeNoDesc();
    for (PrepTransition transition : transitions) {
      if (transition.getDataset().getDsId().equals(dsId) == false)
        continue;

      if (transition.getRuleCurIdxAfter() != ruleIdx)
        continue;

      switch (transition.getOp()) {
        case CREATE:
        case APPEND:
        case UPDATE:
        case DELETE:
          return transition.getDsRevision();

        case UNDO:
          continue;

        // FETCH, JUMP는 transition으로 남는 op가 아님
        case FETCH:
        case JUMP:
        case NOT_USED:
        default:
          throw new IllegalArgumentException("invalid transform op: " + transition.getOp().toString());
      }
    }
    throw new IllegalTransactionStateException(
            String.format("transition not found: targetRuleCurIdx=%d dsId=%s", ruleIdx, dsId));
  }

  private static PrepDataset makeWrangledDataset(PrepDataset importedDataset, PrepDataflow dataflow, String dfId) {
    PrepDataset wrangledDataset = new PrepDataset();

    //wrangledDataset.setDsName(importedDataset.getDsName() + " [W]");
    String dsName = importedDataset.getDsName();
    String newDsName = dsName.replaceFirst(" \\((EXCEL|CSV|STAGING|MYSQL|ORACLE|TIBERO|HIVE|POSTGRESQL|MSSQL|PRESTO)\\)$","");
    wrangledDataset.setDsName(newDsName);
    wrangledDataset.setDsType(WRANGLED);
    wrangledDataset.setCreatorDfId(dfId);
    wrangledDataset.setCreatedTime(DateTime.now());
    wrangledDataset.setModifiedTime(DateTime.now());
    wrangledDataset.setCreatedBy(dataflow.getCreatedBy());
    wrangledDataset.setModifiedBy(dataflow.getCreatedBy());
    wrangledDataset.putCustomValue("previewPath",importedDataset.getCustomValue("previewPath"));

    return wrangledDataset;
  }

  public List<PrepTransformRule> getRulesInOrder(String dsId) {
    List<PrepTransformRule> rules = new ArrayList<>();

    for (PrepTransformRule rule : transformRuleRepository.findAllByOrderByRuleNoAsc()) {
      if (rule.getDataset().getDsId().equals(dsId)) {
        rule.setJsonRuleString(parseRuleString(rule.getRuleString()));
        rules.add(rule);
      }
    }
    return rules;
  }

  private boolean onlyAppend(String dsId) {
    for (PrepTransition transition : findTransitionsAsc(dsId)) {
      if (transition.getOp() != OP_TYPE.CREATE && transition.getOp() != OP_TYPE.APPEND) {
        return false;
      }
    }
    return true;
  }

  private String parseRuleString(String ruleString) {
    Rule rule = new RuleVisitorParser().parse(ruleString);

    ObjectMapper mapper = new ObjectMapper();
    String json = null;
    try {
      json = mapper.writeValueAsString(rule);
    } catch (JsonProcessingException e) {
      e.printStackTrace();
    }
//    LOGGER.trace("parseRuleString(): \"{}\" --> {}", ruleString, rule.toString());
//    LOGGER.trace("parseRuleString(): JSON: {}", json);
    return json;
  }

  public void putAddedInfo( PrepTransformResponse transformResponse, PrepDataset wrangledDataset ) {
    if(transformResponse!=null && wrangledDataset!=null) {
      transformResponse.setSampledRows(wrangledDataset.getTotalLines());
      transformResponse.setFullBytes(wrangledDataset.getTotalBytes()); // 아직 totalBytes 미구현
    }
  }

  private DataFrame initialLoad(String wrangledDsId, PrepDataset importedDataset) throws Exception {
    PrepDataset wrangledDataset = datasetRepository.findRealOne(datasetRepository.findOne(wrangledDsId));
    DataFrame gridResponse;

    LOGGER.info("initialLoad: dsId={} (using embedded transform engine)", wrangledDsId);

    if (importedDataset.getImportType().equalsIgnoreCase("FILE")) {
      String path = importedDataset.getCustomValue("filePath"); // datasetFileService.getPath2(importedDataset);
      LOGGER.debug(wrangledDsId + " path=[" + path + "]");
      if (importedDataset.isDSV()) {
        gridResponse = teddyImpl.loadFileDataset(wrangledDsId, path, importedDataset.getDelimiter(), wrangledDataset.getDsName());
      }
      else if (importedDataset.isEXCEL()) {
        LOGGER.error("initialLoad(): EXCEL not supported: " + path);
        throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_FORMAT_WRONG);
      }
      else if (importedDataset.isJSON()) {
        LOGGER.error("initialLoad(): EXCEL not supported: " + path);
        throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_FORMAT_WRONG);
      }
      else {
        throw new IllegalArgumentException("invalid flie type: createWrangledDataset\nimportedDataset: " + importedDataset.toString());
      }
    }
    else if (importedDataset.isHive()) {
      String queryStmt = importedDataset.getQueryStmt().trim();
      if (queryStmt.charAt(queryStmt.length() - 1) == ';')
        queryStmt = queryStmt.substring(0, queryStmt.length() - 1);

      gridResponse = teddyImpl.loadHiveDataset(wrangledDsId, queryStmt, wrangledDataset.getDsName());
    }
    else if (importedDataset.isJDBC()) {
      String queryStmt = importedDataset.getQueryStmt().trim();
      if (queryStmt.charAt(queryStmt.length() - 1) == ';')
        queryStmt = queryStmt.substring(0, queryStmt.length() - 1);

      String dbName = importedDataset.getCustomValue("databaseName");
      DataConnection dataConnection = this.connectionRepository.getOne( importedDataset.getDcId() );
      Hibernate.initialize(dataConnection);
      if (dataConnection instanceof HibernateProxy) {
        dataConnection = (DataConnection) ((HibernateProxy) dataConnection).getHibernateLazyInitializer().getImplementation();
      }

      gridResponse = teddyImpl.loadJdbcDataset(wrangledDsId, dataConnection, dbName, queryStmt, wrangledDataset.getDsName());
    }
    else {
      throw new IllegalArgumentException("imvalid import type: createWrangledDataset\nimportedDataset: " + importedDataset.toString());
    }

    wrangledDataset.setRuleCurIdx(-1);
    wrangledDataset.setRuleCnt(0);

    assert gridResponse != null : wrangledDsId;
    wrangledDataset.setTotalLines(gridResponse.rows.size());

    LOGGER.trace("initialLoad(): end");
    return gridResponse;
  }

  public List<String> getUpstreamDsIds(String dsId, boolean forUpdate) throws IOException {
    List<String> upstreamDsIds = new ArrayList<>();

    try {
      List<PrepTransition> transitions = findTransitionsAsc(dsId);
      if (null != transitions) {
        for (PrepTransition transition : transitions) {
          if (transition.getOp() == OP_TYPE.CREATE) {
            upstreamDsIds.add(transition.getRuleString());
            break;
          }
        }
      }

      ObjectMapper mapper = new ObjectMapper();
      List<PrepTransformRule> transformRules = getRulesInOrder(dsId);
      if(null!=transformRules) {
        int end = forUpdate ? transformRules.size() - 1 : transformRules.size();

        for (int i = 0; i < end; i++) {
          PrepTransformRule rule = transformRules.get(i);
          String jsonRuleString = rule.getJsonRuleString();
          assert jsonRuleString != null : dsId;

          Map<String,Object> jsonObj = mapper.readValue(jsonRuleString, Map.class);
          if(null!=jsonObj) {
            String name = jsonObj.get("name").toString();
            if(null!=name) {
              if(name.equalsIgnoreCase("join")) {
                Map<String,Object> dataset2 = (Map<String, Object>) jsonObj.get("dataset2");
                if(null!=dataset2) {
                  String joinDsId = dataset2.get("escapedValue").toString();
                  if(null!=joinDsId) {
                    upstreamDsIds.add(joinDsId.trim());
                  }
                }
              } else if(name.equalsIgnoreCase("union") ) {
                Map<String,Object> dataset2 = (Map<String, Object>) jsonObj.get("dataset2");
                if(null!=dataset2) {
                  // value 형태가 일정하지 않음 , string or list<string>
                  Object value = dataset2.get("value");
                  List<String> unionDsIds = null;
                  if(value instanceof List) {
                    unionDsIds = (List<String>)value;
                  } else if(value instanceof String) {
                    unionDsIds = Lists.newArrayList();
                    unionDsIds.add( (String)value );
                  }
                  if(null!=unionDsIds) {
                    for(String unionDsId : unionDsIds) {
                      upstreamDsIds.add(unionDsId.replace("'","").trim());
                    }
                  }
                }
              }
            }
          } else {
            throw PrepException.create(PrepErrorCodes.PREP_UPSTREAM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_UPSTREAM);
          }
        }
      } else {
        throw PrepException.create(PrepErrorCodes.PREP_UPSTREAM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_RULESTRING_NOT_FOUND);
      }
    } catch (Exception e) {
      LOGGER.error("getUpstreamDsIds(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_UPSTREAM_ERROR_CODE, e);
    }

    return upstreamDsIds;
  }

  // only debugging purpose
  public PrepTransformResponse getCacheInfo() {
    Map<String, Object> cacheInfo = new HashMap<>();

    for (String dsId : teddyImpl.cache.keySet()) {
      List<DataFrame> dfs = teddyImpl.cache.get(dsId);
      List<Object> stageInfos = new ArrayList<>();

      for (DataFrame df : dfs) {
        Map<String, Object> stageInfo = new HashMap<>();
        stageInfo.put("colcnt", df.getColCnt());
        stageInfo.put("ruleString", df.ruleString);

        try {
          stageInfo.put("jsonRuleString", parseRuleString(df.ruleString));
        } catch (Exception e) {
        }

        stageInfos.add(stageInfo);
      }

      cacheInfo.put(dsId, stageInfos);
    }

    PrepTransformResponse response = new PrepTransformResponse();
    response.setCacheInfo(cacheInfo);
    return response;
  }

  public Map<String,Object> getConfiguration(String wrangledDsId) {
    Map<String,Object> configuration = Maps.newHashMap();
    try {
      PrepDataset wrangledDataset = datasetRepository.findOne(wrangledDsId);
      assert (null != wrangledDataset);
      DateTime launchTime = DateTime.now(DateTimeZone.UTC);
      String ssName = this.snapshotService.makeSnapshotName(wrangledDataset.getDsName(),launchTime);
      configuration.put("ss_name", ssName);

      if(PrepSnapshot.SS_TYPE.FILE==PrepSnapshot.SS_TYPE.FILE) {
        Map<String,Object> fileUri = Maps.newHashMap();

        String wasDir = this.snapshotService.getSnapshotDir(prepProperties.getLocalBaseDir(), ssName);
        wasDir = this.snapshotService.escapeSsNameOfUri(wasDir);
        fileUri.put("was", wasDir);

        try {
          Map<String,Object> checked = this.hdfsService.checkHdfs();
          if(checked.get("checkConnection").equals(true)) {
            String hdfsDir = this.snapshotService.getSnapshotDir(prepProperties.getStagingBaseDir(), ssName);
            hdfsDir = this.snapshotService.escapeSsNameOfUri(hdfsDir);
            fileUri.put("hdfs", hdfsDir);
          }
        } catch (Exception e) {
        }
        configuration.put("file_uri", fileUri);
      }

      if(PrepSnapshot.SS_TYPE.HIVE==PrepSnapshot.SS_TYPE.HIVE) {
        Map<String,Object> hive = null;
        PrepProperties.HiveInfo hiveInfo = prepProperties.getHive();
        if(hiveInfo!=null) {
          hive = Maps.newHashMap();
          hive.put("custom_url", hiveInfo.getCustomUrl());
          hive.put("metastore_uris", hiveInfo.getMetastoreUris());
          hive.put("hostname", hiveInfo.getHostname());
          hive.put("port", hiveInfo.getPort());
          hive.put("username", hiveInfo.getUsername());
          hive.put("password", hiveInfo.getPassword());
        }
        configuration.put("hive_info", hive);
      }
    } catch (Exception e) {
      throw e;
    }
    return configuration;
  }

  private void confirmRuleStringForException(String ruleString) {
    try {
      Rule rule = new RuleVisitorParser().parse(ruleString);

      if( rule.getName().equals( "move"  ) ) {
        Move move = (Move)rule;
        String after = move.getAfter();
        String before = move.getBefore();
        if( (null==after || after.isEmpty()) && (null==before || before.isEmpty()) ) {
          LOGGER.error("confirmRuleStringForException(): move before and after is empty");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_MOVE_BEFORE_AND_AFTER);
        }
        Expression expression = move.getCol();
        if(null==expression) {
          LOGGER.error("confirmRuleStringForException(): move expression is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_MOVE_EXPRESSION);
        }
      } else if( rule.getName().equals( "sort"  ) ) {
        Sort sort = (Sort)rule;
        Expression order = sort.getOrder();
        if (order instanceof Identifier.IdentifierExpr || order instanceof Identifier.IdentifierArrayExpr) {
        } else {
          LOGGER.error("confirmRuleStringForException(): sort order is not valid");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SORT_ORDER);
        }

        Expression type = sort.getType();
        if (type == null || (type instanceof Constant.StringExpr && ((Constant.StringExpr)type).getEscapedValue().equalsIgnoreCase("DESC")) ) {
        } else {
          LOGGER.error("confirmRuleStringForException(): sort type is not valid");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SORT_TYPE);
        }
      } else if( rule.getName().equals( "union"  ) ) {
      } else if( rule.getName().equals( "drop"  ) ) {
        Drop drop = (Drop)rule;
        Expression col = drop.getCol();
        if (col instanceof Identifier.IdentifierExpr || col instanceof Identifier.IdentifierArrayExpr) {
        } else {
          LOGGER.error("confirmRuleStringForException(): drop col is not valid");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_DROP_COL);
        }
      } else if( rule.getName().equals( "keep"  ) ) {
        Keep keep = (Keep)rule;
        Expression expression = keep.getRow();
        if(null==expression) {
          LOGGER.error("confirmRuleStringForException(): keep expression is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_KEEP_EXPRESSION);
        }
      } else if( rule.getName().equals( "delete"  ) ) {
        Delete delete = (Delete)rule;
        Expression expression = delete.getRow();
        if(null==expression) {
          LOGGER.error("confirmRuleStringForException(): delete expression is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_DELETE_EXPRESSION);
        }
      } else if( rule.getName().equals( "flatten"  ) ) {
        Flatten flatten = (Flatten)rule;
        String col = flatten.getCol();
        if(null==col || 0==col.length()) {
          LOGGER.error("confirmRuleStringForException(): flatten col is wrong");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_FLATTEN_COL);
        }
      } else if( rule.getName().equals( "header"  ) ) {
        Header header = (Header)rule;
        Long rowNum = header.getRownum();
        if(null==rowNum || rowNum<0) {
          LOGGER.error("confirmRuleStringForException(): header rowNum is wrong");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_HEADER_ROWNUM);
        }
      } else if( rule.getName().equals( "rename"  ) ) {
        Rename rename = (Rename)rule;
        Expression col = rename.getCol();
        Expression to = rename.getTo();
        if(null==col) {
          LOGGER.error("confirmRuleStringForException(): rename col is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_RENAME_COL);
        }
        if(null==to) {
          LOGGER.error("confirmRuleStringForException(): rename to is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_RENAME_TO);
        }
      } else if( rule.getName().equals( "replace"  ) ) {
        Replace replace = (Replace)rule;
        Expression after = replace.getAfter();
        Expression before = replace.getBefore();
        Expression col = replace.getCol();
        boolean global = replace.getGlobal();
        boolean ignoreCase = replace.getIgnoreCase();
        Expression on = replace.getOn();
        Expression quote = replace.getQuote();
        Expression row = replace.getRow();
        Constant with = replace.getWith();
        if(null==col) {
          LOGGER.error("confirmRuleStringForException(): replace col is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_REPLACE_COL);
        }
        if(null==on) {
          LOGGER.error("confirmRuleStringForException(): replace on is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_REPLACE_ON);
        }
      } else if( rule.getName().equals( "settype"  ) ) {
        SetType setType = (SetType)rule;
        Expression col = setType.getCol();
        String format = setType.getFormat();
        String type = setType.getType();
        if(null==col) {
          LOGGER.error("confirmRuleStringForException(): settype col is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SETTYPE_COL);
        }
        if(null==type) {
          LOGGER.error("confirmRuleStringForException(): settype type is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SETTYPE_TYPE);
        }
      } else if( rule.getName().equals( "setformat"  ) ) {
        SetFormat setFormat = (SetFormat) rule;
        Expression col = setFormat.getCol();
        String format = setFormat.getFormat();

        if(null==col) {
          LOGGER.error("confirmRuleStringForException(): setformat col is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SETFORMAT_COL);
        }
        if(null==format) {
          LOGGER.error("confirmRuleStringForException(): setformat format is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SETFORMAT_FORMAT);
        }
      } else if( rule.getName().equals( "set"  ) ) {
        Set set = (Set)rule;
        Expression col = set.getCol();
        Expression row = set.getRow();
        Expression value = set.getValue();
        if(null==col) {
          LOGGER.error("confirmRuleStringForException(): set col is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SET_COL);
        }
        if(null==value) {
          LOGGER.error("confirmRuleStringForException(): set value is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SET_VALUE);
        }
      } else if( rule.getName().equals( "countpattern"  ) ) {
        CountPattern countPattern = (CountPattern)rule;
        Expression after = countPattern.getAfter();
        Expression before = countPattern.getBefore();
        Expression col = countPattern.getCol();
        Boolean ignoreCase = countPattern.getIgnoreCase();
        Expression on = countPattern.getOn();
        Expression quote = countPattern.getQuote();
        if(null==col) {
          LOGGER.error("confirmRuleStringForException(): countpattern col is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_COUNTPATTERN_COL);
        }
        if(null==on) {
          LOGGER.error("confirmRuleStringForException(): countpattern on is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_COUNTPATTERN_ON);
        }
      } else if( rule.getName().equals( "derive"  ) ) {
        Derive derive = (Derive)rule;
        String as = derive.getAs();
        Expression value = derive.getValue();
        if(null==as) {
          LOGGER.error("confirmRuleStringForException(): derive as col is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_DERIVE_AS);
        }
        if(null==value) {
          LOGGER.error("confirmRuleStringForException(): derive value is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_DERIVE_VALUE);
        }
      } else if( rule.getName().equals( "merge"  ) ) {
        Merge merge = (Merge)rule;
        String as = merge.getAs();
        Expression col = merge.getCol();
        String with = merge.getWith();
        if(null==as) {
          LOGGER.error("confirmRuleStringForException(): merge as is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_MERGE_AS);
        }
        if(null==col) {
          LOGGER.error("confirmRuleStringForException(): merge col is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_MERGE_COL);
        }
        if(null==with) {
          LOGGER.error("confirmRuleStringForException(): merge with is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_MERGE_WITH);
        }
      } else if( rule.getName().equals( "unnest"  ) ) {
        Unnest unnest = (Unnest)rule;
        String col = unnest.getCol();
        Expression idx = unnest.getIdx();
        String into = unnest.getInto();
        if(null==idx) {
          LOGGER.error("confirmRuleStringForException(): unnest idx is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_UNNEST_IDX);
        }
        if(null==into) {
          LOGGER.error("confirmRuleStringForException(): unnest into is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_UNNEST_INTO);
        }
      } else if( rule.getName().equals( "extract"  ) ) {
        Extract extract = (Extract)rule;
        String col = extract.getCol();
        Boolean IgnoreCase = extract.getIgnoreCase();
        Integer limit = extract.getLimit();
        Expression on = extract.getOn();
        Expression quote = extract.getQuote();
        if(null==col) {
          LOGGER.error("confirmRuleStringForException(): extract col is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_EXTRACT_COL);
        }
        if(null==limit) {
          LOGGER.error("confirmRuleStringForException(): extract limit is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_EXTRACT_LIMIT);
        }
        if(null==on) {
          LOGGER.error("confirmRuleStringForException(): extract on is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_EXTRACT_ON);
        }
      } else if( rule.getName().equals( "aggregate"  ) ) {
        Aggregate aggregate = (Aggregate)rule;
        Expression group = aggregate.getGroup();
        Expression value = aggregate.getValue();
        if(null==group) {
          LOGGER.error("confirmRuleStringForException(): aggregate group is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_AGGREGATE_GROUP);
        }
        if(null==value) {
          LOGGER.error("confirmRuleStringForException(): aggregate value is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_AGGREGATE_VALUE);
        }
      } else if( rule.getName().equals( "split"  ) ) {
        Split split = (Split)rule;
        String col = split.getCol();
        Boolean ignoreCase = split.getIgnoreCase();
        Integer limit = split.getLimit();
        Expression on = split.getOn();
        Expression quote = split.getQuote();
        if(null==col) {
          LOGGER.error("confirmRuleStringForException(): split col is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SPLIT_COL);
        }
        if(null==limit) {
          LOGGER.error("confirmRuleStringForException(): split limit is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SPLIT_LIMIT);
        }
        if(null==on) {
          LOGGER.error("confirmRuleStringForException(): split on is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SPLIT_ON);
        }
      } else if( rule.getName().equals( "nest"  ) ) {
        Nest nest = (Nest)rule;
        String as = nest.getAs();
        Expression col = nest.getCol();
        String into = nest.getInto();
        if(null==as) {
          LOGGER.error("confirmRuleStringForException(): nest as is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_NEST_AS);
        }
        if(null==col) {
          LOGGER.error("confirmRuleStringForException(): nest col is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_NEST_COL);
        }
        if(null==into) {
          LOGGER.error("confirmRuleStringForException(): nest into is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_NEST_INTO);
        }
      } else if( rule.getName().equals( "pivot"  ) ) {
        Pivot pivot = (Pivot)rule;
        Expression col = pivot.getCol();
        Expression group = pivot.getGroup();
        Integer limit = pivot.getLimit();
        Expression value = pivot.getValue();
        if(null==col) {
          LOGGER.error("confirmRuleStringForException(): pivot col is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_PIVOT_COL);
        }
        if(null==group) {
          LOGGER.error("confirmRuleStringForException(): pivot group is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_PIVOT_GROUP);
        }
        if(null==value) {
          LOGGER.error("confirmRuleStringForException(): pivot value is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_PIVOT_VALUE);
        }
      } else if( rule.getName().equals( "unpivot"  ) ) {
        Unpivot unpivot = (Unpivot)rule;
        Expression col = unpivot.getCol();
        Integer groupEvery = unpivot.getGroupEvery();
        if(null==col) {
          LOGGER.error("confirmRuleStringForException(): unpivot col is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_UNPIVOT_COL);
        }
        if(null==groupEvery) {
          LOGGER.error("confirmRuleStringForException(): unpivot groupEvery is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_UNPIVOT_GROUPEVERY);
        }
      } else if( rule.getName().equals( "join"  ) ) {
        Join join = (Join)rule;
        Expression condition = join.getCondition();
        Expression dataset2 = join.getDataset2();
        String joinType = join.getJoinType();
        Expression leftSelectCol = join.getLeftSelectCol();
        Expression rightSelectCol = join.getRightSelectCol();
        if(null==dataset2) {
          LOGGER.error("confirmRuleStringForException(): join col is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_JOIN_DATASET2);
        }
        if(null==joinType) {
          LOGGER.error("confirmRuleStringForException(): join joinType is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_JOIN_JOINTYPE);
        }
      } else if( rule.getName().equals( "window"  ) ) {
        Window window = (Window) rule;
        Expression order = window.getOrder();
        Expression value = window.getValue();
        if (null == order) {
          LOGGER.error("confirmRuleStringForException(): aggregate group is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_AGGREGATE_GROUP);
        }
        if (null == value) {
          LOGGER.error("confirmRuleStringForException(): aggregate value is null");
          throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_AGGREGATE_VALUE);
        }
      } else {
        LOGGER.error("confirmRuleStringForException(): ruleName is wrong - "+rule.getName());
        throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED, "ruleName is wrong");
      }

      /*
      ObjectMapper mapper = new ObjectMapper();
      String json = null;
      try {
        json = mapper.writeValueAsString(rule);
      } catch (JsonProcessingException e) {
        e.printStackTrace();
      }
      */
    } catch (PrepException e) {
      throw e;
    } catch (RuleException e) {
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    } catch (Exception e) {
      LOGGER.error("confirmRuleStringForException(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED, e.getMessage());
    }
  }

  public void cancelSnapshot(String ssId) throws  Exception{

    List<Future<List<Row>>> jobs = teddyExecutor.getJob(ssId);

    if(!jobs.isEmpty()) {
      teddyExecutor.updateAsCanceling(ssId);

      for (Future<List<Row>> job : jobs) {
        job.cancel(true);
      }
    }
  }
}
