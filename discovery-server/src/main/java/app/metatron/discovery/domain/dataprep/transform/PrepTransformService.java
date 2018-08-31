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
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TransformExecutionFailedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TransformTimeoutException;
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
import com.google.common.collect.Maps;
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
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import static app.metatron.discovery.domain.dataprep.PrepDataset.DS_TYPE.WRANGLED;
import static app.metatron.discovery.domain.dataprep.PrepProperties.*;

@Service
public class PrepTransformService {
  private static Logger LOGGER = LoggerFactory.getLogger(PrepTransformService.class);

  @Autowired
  private Environment env;

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
  private String getJsonPrepPropertiesInfo(String dsId, PrepSnapshotRequestPost requestPost) throws JsonProcessingException {
    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));

    PrepDataset.IMPORT_TYPE importType = dataset.getImportTypeEnum();
    boolean dsFile = (importType == PrepDataset.IMPORT_TYPE.FILE);
    boolean dsDb   = (importType == PrepDataset.IMPORT_TYPE.DB);
    boolean dsHive = (importType == PrepDataset.IMPORT_TYPE.HIVE);

    PrepSnapshot.SS_TYPE ssType = requestPost.getSsTypeEnum();
    boolean ssFile = (ssType == PrepSnapshot.SS_TYPE.FILE);
    boolean ssHdfs = (ssType == PrepSnapshot.SS_TYPE.HDFS);
    boolean ssHive = (ssType == PrepSnapshot.SS_TYPE.HIVE);

    PrepSnapshot.ENGINE engine = requestPost.getEngineEnum();

    // check polaris.dataprep.hadoopConfDir
    if (ssHdfs || ssHive) {
      if (prepProperties.getHadoopConfDir() == null) {
        throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE,
                PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, HADOOP_CONF_DIR);
      }
      if (prepProperties.getStagingBaseDir() == null) {
        throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE,
                PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, STAGING_BASE_DIR);
      }
    }

    // check polaris.dataprep.hive
    if (dsHive || ssHive) {
      PrepProperties.HiveInfo hive = prepProperties.getHive();
      if (hive == null) {
        throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE,
                PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, HIVE_HOSTNAME);
      }
    }

    // check polaris.dataprep.etl.jar
    if (engine == PrepSnapshot.ENGINE.TWINKLE) {
      EtlInfo etlInfo = prepProperties.getEtl();
      if (etlInfo == null || etlInfo.getJar() == null) {
        throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE,
                PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, ETL_JAR);
      }
    }

    return GlobalObjectMapper.getDefaultMapper().writeValueAsString(prepProperties.getEveryForEtl());
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

  private List<String> getTargetDsIds(String jsonRuleString) throws IOException {
    List<String> targetDsIds = new ArrayList<>();
    Map<String,Object> dataset2;

    Map<String, Object> jsonObj = GlobalObjectMapper.getDefaultMapper().readValue(jsonRuleString, Map.class);
    switch ((String) jsonObj.get("name")) {
      case "join":
        dataset2 = (Map<String, Object>) jsonObj.get("dataset2");
        targetDsIds.add((String) dataset2.get("escapedValue"));
        break;
      case "union":
        dataset2 = (Map<String, Object>) jsonObj.get("dataset2");
        Object value = dataset2.get("value");
        if (value instanceof List) {
          for (String unionDsId : (List<String>) value) {
            targetDsIds.add(unionDsId.replace("'", "").trim());
          }
        } else if (value instanceof String) {
          targetDsIds.add(((String) value).replace("'", "").trim());
        }
        break;
      default:
    }

    return targetDsIds;
  }

  // skips the last rule for UPDATE purpose
  public List<String> getUpstreamDsIds(String dsId, boolean forUpdate) throws IOException {
    List<String> upstreamDsIds = new ArrayList<>();

    String firstUpstreamDsId = getFirstUpstreamDsId(dsId);
    if (firstUpstreamDsId == null) {  // then, this is not a wrangled dataset
      return upstreamDsIds;
    }
    upstreamDsIds.add(firstUpstreamDsId);

    List<PrepTransformRule> rules = getRulesInOrder(dsId);

    int until = forUpdate ? rules.size() - 1 : rules.size();

    for (int i = 0; i < until; i++) {
      PrepTransformRule rule = rules.get(i);
      String jsonRuleString = rule.getJsonRuleString();
      assert jsonRuleString != null : dsId;

      upstreamDsIds.addAll(getTargetDsIds(jsonRuleString));
    }
    return upstreamDsIds;
  }

  public List<String> getUpstreamDsIds(String dsId) throws IOException {
    return getUpstreamDsIds(dsId, false);
  }

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
    DataFrame gridResponse = createStage0(wrangledDsId, importedDataset);

    // Preview를 저장한다. Dataset 상세보기에서 이용한다.
    previewLineService.putPreviewLines(wrangledDsId, gridResponse);

    wrangledDataset.addDataflow(dataflow);
    dataflow.addDataset(wrangledDataset);

    datasetRepository.save(wrangledDataset);
    dataflowRepository.save(dataflow);

    // The 1st rule string is the master upstream dsId.
    // This could be either an imported dataset or another wrangled dataset.
    PrepTransformRule rule = new PrepTransformRule(wrangledDataset, 0, Util.getCreateRuleString(importedDsId)); // changed
    rule.setJsonRuleString(Util.getCreateJsonRuleString(rule.getRuleString()));
    transformRuleRepository.saveAndFlush(rule);

    PrepTransformResponse response = new PrepTransformResponse(wrangledDsId);
    response.setWrangledDsId(wrangledDsId);
    this.putAddedInfo(response, wrangledDataset);

    //Auto Heading 및 Auto Typing을 위한 로직.

    // 이미 "지정된 타입이 있으면" 인 듯
    Boolean isNotORC = true;
    for(ColumnDescription cd : gridResponse.colDescs) {
      if(cd.getType() != ColumnType.STRING)
        isNotORC = false;
    }

    // FIXME: reconsider whether UNDO is necessary.
    if(prepProperties.isAutoTyping() && isNotORC) {
        setTypeRules = autoTypeDetection(gridResponse);
        //반환 받은 setType Rule 들을 적용
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
                  DateTimeFormatter dtf = DateTimeFormat.forPattern(tt.getFormat()).withLocale(Locale.ENGLISH);
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
    String upstreamDsId = getFirstUpstreamDsId(wrangledDsId);

    PrepTransformResponse response = create(upstreamDsId, wrangledDataset.getCreatorDfId());
    String cloneDsId = response.getWrangledDsId();

    for (PrepTransformRule transformRule : getRulesInOrder(wrangledDsId)) {
      String ruleString = transformRule.getRuleString();
      response = transform(cloneDsId, OP_TYPE.APPEND, -1, ruleString);
    }
    return response;
  }

  private DataFrame load_internal(String dsId) throws Exception {
    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
    DataFrame gridResponse = null;

    LOGGER.trace("load_internal(): start");

    // 만약 PLM cache에 존재하고, transition을 재적용할 필요가 없다면
    if (teddyImpl.revisionSetCache.containsKey(dsId)) {
      if (onlyAppend(dsId)) {
        return teddyImpl.getCurDf(dsId);
      }
    }

    // 이하 코드는 dataset이 PLM cache에 존재하지 않거나, transition을 처음부터 다시 적용해야 하는 경우
    teddyImpl.remove(dsId);

    String upstreamDsId = getFirstUpstreamDsId(dsId);
    PrepDataset upstreamDataset = datasetRepository.findRealOne(datasetRepository.findOne(upstreamDsId));
    gridResponse = createStage0(dsId, upstreamDataset);
    teddyImpl.reset(dsId);

    List<String> ruleStrings = new ArrayList<>();
    ArrayList<String> totalTargetDsIds = new ArrayList<>();
    ArrayList<PrepDataset> totalTargetDatasets = new ArrayList<>();

    for (PrepTransformRule transformRule : getRulesInOrder(dsId)) {
      String ruleString = transformRule.getRuleString();
      datasetRepository.save(dataset);

      // add to the rule string array
      ruleStrings.add(ruleString);

      // gather slave datasets (load and apply, too)
      List<String> targetDsIds = getTargetDsIds(Util.parseRuleString(ruleString));

      for (String targetDsId : targetDsIds) {
        load_internal(targetDsId);
        totalTargetDsIds.add(targetDsId);

        PrepDataset targetDataset = datasetRepository.findRealOne(datasetRepository.findOne(targetDsId));
        totalTargetDatasets.add(targetDataset);
      }
    }

    // 적용할 rule string이 없으면 그냥 리턴.
    if (ruleStrings.size() == 0) {
      LOGGER.trace("load_internal(): end (no rules to apply)");
      return teddyImpl.getCurDf(dsId);
    }

    for (int i = 1; i < ruleStrings.size(); i++) {
      String ruleString = ruleStrings.get(i);
      gridResponse = teddyImpl.append(dsId, ruleString);
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

  // Although this is not used for now, but it would be better to be used in the initial loading.
  // FETCH is used for too many purposes.
  // load (and apply transitions if needed) (GET)
//  @Transactional(rollbackFor = Exception.class)
//  public PrepTransformResponse load(String dsId) throws Exception {
//    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
//    PrepTransformResponse response;
//    DataFrame gridResponse;
//
//    LOGGER.trace("load(): start");
//
//    gridResponse = load_internal(dsId);
//    response = new PrepTransformResponse(dataset.getRuleCurIdx(), gridResponse);
//    response.setRuleStringInfos(getRulesInOrder(dsId), false, false);
//
//    if (gridResponse != null) {
//      previewLineService.putPreviewLines(dsId, gridResponse);
//    }
//
//    LOGGER.debug("load(): done");
//    return response;
//  }

  // transform (PUT)
  @Transactional(rollbackFor = Exception.class)
  public PrepTransformResponse transform(String dsId, OP_TYPE op, int stageIdx, String ruleString) throws Exception {
    LOGGER.trace("transform(): start: dsId={} op={} stageIdx={} ruleString={}", dsId, op, stageIdx, ruleString);

    if(op==OP_TYPE.APPEND || op==OP_TYPE.UPDATE || op==OP_TYPE.PREVIEW) {
      confirmRuleStringForException(ruleString);
    }

    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
    PrepTransformResponse response;

    assert dataset != null : dsId;

    if (teddyImpl.revisionSetCache.containsKey(dsId) == false) {
      load_internal(dsId);
    }

    if (stageIdx >= 0) {
      dataset.setRuleCurIdx(stageIdx);
      teddyImpl.setStageIdx(dsId, stageIdx);
    }

    // 아래 각 case에서 ruleCurIdx, matrixResponse는 채워서 리턴
    // rule list는 transform()을 마칠 때에 채움. 모든 op에 대해 동일하기 때문에.
    switch (op) {
      case APPEND:
        response = append(dsId, ruleString);
        break;
      case DELETE:
        response = delete(dsId);
        break;
      case UNDO:
        response = undo(dsId);
        break;
      case REDO:
        response = redo(dsId);
        break;
      case JUMP:
        response = jump(dsId);
        break;
      case FETCH:
        response = fetch(dsId);
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

    transformRuleRepository.flush();
    datasetRepository.flush();

    DataFrame gridResponse = response.getGridResponse();

    switch (op) {
      case APPEND:
      case DELETE:
      case UNDO:
      case REDO:
      case UPDATE:
        updateTransformRules(dsId);
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

    response.setRuleStringInfos(getRulesInOrder(dsId), teddyImpl.isUndoable(dsId), teddyImpl.isRedoable(dsId));

    LOGGER.trace("transform(): end");
    return response;
  }

  private void updateTransformRules(String dsId) {
    for (PrepTransformRule rule : getRulesInOrder(dsId)) {
      transformRuleRepository.delete(rule);
    }

    List<String> ruleStrings = teddyImpl.getRuleStrings(dsId);
    for (int i = 0; i < ruleStrings.size(); i++) {
      PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
      PrepTransformRule rule = new PrepTransformRule(dataset, i, ruleStrings.get(i));
      transformRuleRepository.save(rule);
    }

    transformRuleRepository.flush();
  }

  // transform_histogram (POST)
  public PrepHistogramResponse transform_histogram(String dsId, List<Integer> colnos, List<Integer> colWidths) throws Exception {
    LOGGER.trace("transform_histogram(): start: dsId={} curRevIdx={} curStageIdx={} colnos={} colWidths={}",
                 dsId, teddyImpl.getCurRevIdx(dsId), teddyImpl.getCurStageIdx(dsId), colnos, colWidths);

    if (teddyImpl.revisionSetCache.containsKey(dsId) == false) {
      load_internal(dsId);
    }

    DataFrame df = teddyImpl.getCurDf(dsId);
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
            DateTimeFormatter dtf = DateTimeFormat.forPattern(tt.getFormat()).withLocale(Locale.ENGLISH);
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
    if (teddyImpl.revisionSetCache.containsKey(dsId) == false) {
      load_internal(dsId);
    }

    DataFrame df = teddyImpl.getCurDf(dsId);
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

    for (String upstreamDsId : getUpstreamDsIds(wrangledDsId)) {
      PrepDataset upstreamDataset = datasetRepository.findRealOne(datasetRepository.findOne(upstreamDsId));
      if (upstreamDataset.getDsTypeForEnum() == PrepDataset.DS_TYPE.IMPORTED) {
        datasetInfo.put("importType", upstreamDataset.getImportType());
        switch (upstreamDataset.getImportTypeEnum()) {
          case FILE:
            String filePath = upstreamDataset.getCustomValue("filePath");
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

  private String getJsonDatasetInfo(String wrangledDsId) throws IOException {
    Map<String, Object> datasetInfo = buildDatasetInfoRecursive(wrangledDsId);
    return GlobalObjectMapper.getDefaultMapper().writeValueAsString(datasetInfo);
  }

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

    String jsonPrepPropertiesInfo = getJsonPrepPropertiesInfo(wrangledDsId, requestPost);
    String jsonDatasetInfo        = getJsonDatasetInfo(wrangledDsId);
    String jsonSnapshotInfo       = getJsonSnapshotInfo(requestPost, ssId);

    switch (requestPost.getEngineEnum()) {
      case TWINKLE:
        assert false : "Spark engine not supported for a while";
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
    snapshot.setStatus(PrepSnapshot.STATUS.INITIALIZING);
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
    PrepDataset origDataset = datasetRepository.findRealOne(datasetRepository.findOne(getFirstUpstreamDsId(dataset.getDsId())));
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

    snapshotRepository.saveAndFlush(snapshot);

    response = new PrepSnapshotResponse(snapshot.getSsId(), allFullDsIds, snapshot.getSsName());

    LOGGER.trace("transform_snapshot(): end");
    return response;
  }

  // APPEND ////////////////////////////////////////////////////////////
  //  - leave an APPEND transition
  //  - transform the grid, ruleCurIdx, ruleString[]
  //  - return a response which contains grid, ruleCurIdx (ruleString[] will be added in caller)
  private PrepTransformResponse append(String dsId, String ruleString) throws Exception {
    LOGGER.trace("append(): start: dsId={} ruleString={}", dsId, ruleString);

    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
    assert dataset != null : dsId;

    int lastIdx = teddyImpl.getCurStageIdx(dsId);

    // increase ruleNos after the new rule.
    List<PrepTransformRule> rules = getRulesInOrder(dsId);
    for (int i = rules.size() - 1; i > lastIdx; i--) {
      PrepTransformRule rule = rules.get(i);
      rule.setRuleNo(rule.getRuleNo() + 1);
      transformRuleRepository.save(rule);
    }

    PrepTransformRule rule = new PrepTransformRule(dataset, lastIdx + 1, ruleString);
    transformRuleRepository.save(rule);

    dataset.setRuleCnt(dataset.getRuleCnt() + 1);
    dataset.setRuleCurIdx(lastIdx + 1);
    datasetRepository.save(dataset);

    DataFrame gridResponse = teddyImpl.append(dsId, ruleString);
    return new PrepTransformResponse(teddyImpl.getCurStageIdx(dsId), gridResponse);
  }

  private PrepTransformResponse preview(PrepDataset dataset, String ruleString) throws Exception {
    // join이나 union의 경우, 각각 대상 dataset들을 함께 인자로 넘겨준다.
    List<String> targetDsIds = getTargetDsIds(Util.parseRuleString(ruleString));

    for (String targetDsId : targetDsIds) {
      load_internal(targetDsId);  // 필요한 경우 PLM cache에 loading하거나, transition을 다시 적용한다.
    }

    DataFrame gridResponse = teddyImpl.preview(dataset.getDsId(), ruleString);

    PrepTransformResponse response = new PrepTransformResponse(dataset.getRuleCurIdx(), gridResponse);
    return response;
  }

  private PrepTransformResponse append_internal(String dsId, int lastIdx, String ruleString) throws Exception {
    assert teddyImpl.revisionSetCache.containsKey(dsId) : dsId;
    assert lastIdx >= 0;

    DataFrame gridResponse = teddyImpl.append(dsId, ruleString);

    PrepTransformResponse response = new PrepTransformResponse(lastIdx + 1, gridResponse);
    return response;
  }

  // DELETE ////////////////////////////////////////////////////////////
  private PrepTransformResponse delete(String dsId) throws TransformTimeoutException, TransformExecutionFailedException {
    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
    DataFrame gridResponse;

    int stageIdx = teddyImpl.getCurStageIdx(dsId);
    assert stageIdx == dataset.getRuleCurIdx() : String.format(
            "delete(): ruleCurIdx != stageIdx: ruleCurIdx=%d stageIdx=%d", stageIdx, dataset.getRuleCurIdx());

    // delete할 것이 없는 경우 처리
    if (dataset.getRuleCurIdx() == 0) {   // rule 0 -> "create" rule
      throw new IllegalArgumentException(
              String.format("delete(): no rule exists: dsId=%s", dataset.getDsId()));
    }

    int ruleCnt = dataset.getRuleCnt();
    assert stageIdx < ruleCnt : String.format(
            "delete(): stageIdx >= ruleCnt: stageIdx=%d ruleCnt=%d", stageIdx, ruleCnt);

    // Now, we can delete in the middle of the rule list
//    if (stageIdx != ruleCnt - 1) {
//      assert dataset.getRuleCurIdx() < dataset.getRuleCnt() :
//        String.format("ruleCurIdx=%d ruleCurCnt=%d", dataset.getRuleCurIdx(), dataset.getRuleCnt());
//      throw new IllegalArgumentException(
//              String.format("DELETE is only permitted at the end of the rules: dsId=%s", dataset.getDsId()));
//    }

    /*
    // UPDATE의 경우 revision에 따라 룰을 새로 저장하므로 없어도 됨
    List<PrepTransformRule> rules = getRulesInOrder(dsId);

    PrepTransformRule rule = getTransformRuleAt(dataset, stageIdx);
    transformRuleRepository.delete(rule);

    // decrease ruleNos after the new rule.
    for (int i = stageIdx + 1; i < rules.size(); i++) {
      rule = rules.get(i);
      rule.setRuleNo(rule.getRuleNo() - 1);
      transformRuleRepository.save(rule);
    }

    transformRuleRepository.flush();
    */

    gridResponse = teddyImpl.delete(dsId);

    // FIXME: we should not use PrepDataset's rule_no, rule_cnt.
    //        they're confused with stage indice.
    //        to saving the last stage index could be useful. that's enough. rule_cnt must be removed anyway.
    dataset.setRuleCnt(dataset.getRuleCnt() - 1);
    dataset.setRuleCurIdx(Math.min(stageIdx, dataset.getRuleCnt() - 1));
    datasetRepository.save(dataset);

    PrepTransformResponse response = new PrepTransformResponse(dataset.getRuleCurIdx(), gridResponse);
    return response;
  }

  // UPDATE ////////////////////////////////////////////////////////////
  private PrepTransformResponse update(PrepDataset dataset, String ruleString) throws Exception {
    /*
    if (dataset.getRuleCurIdx() != dataset.getRuleCnt() - 1) {
      assert dataset.getRuleCurIdx() < dataset.getRuleCnt() :
        String.format("ruleCurIdx=%d ruleCurCnt=%d", dataset.getRuleCurIdx(), dataset.getRuleCnt());
      throw new IllegalArgumentException("UPDATE not permitted: UPDATE from the last as needed");
    }
    */
    if (dataset.getRuleCurIdx() <= 0) { // || dataset.getRuleCnt()<dataset.getRuleCurIdx()) {
      throw new IllegalArgumentException( String.format("UPDATE not permitted: ruleCurIdx=%d ruleCurCnt=%d", dataset.getRuleCurIdx(), dataset.getRuleCnt()) );
    }

    PrepTransformRule rule = new PrepTransformRule(dataset, dataset.getRuleCurIdx(), ruleString);
    transformRuleRepository.save(rule);

    PrepTransformResponse response = update_internal(dataset, ruleString);
    return response;
  }

  private PrepTransformResponse update_internal(PrepDataset dataset, String ruleString) throws Exception {
    List<String> newRules = new ArrayList<>();  // one-element array (all the time)
    newRules.add(ruleString);

    assert teddyImpl.revisionSetCache.containsKey(dataset.getDsId()) : dataset.getDsId();
    DataFrame gridResponse = teddyImpl.update(dataset.getDsId(), ruleString);

    PrepTransformResponse response = new PrepTransformResponse(dataset.getRuleCurIdx(), gridResponse);

    assert dataset.getRuleCurIdx() == dataset.getRuleCnt() :
            String.format("ruleCurIdx=%d ruleCurCnt=%d", dataset.getRuleCurIdx(), dataset.getRuleCnt());

    return response;
  }

  // Only difference between jump() and fetch() is that jump() changes ruleCurIdx of the entity, and fetch() doesn't.
  private PrepTransformResponse jump(String dsId) throws PrepException {
    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
    dataset.setRuleCurIdx(teddyImpl.getCurStageIdx(dsId));
    return fetch(dsId);
  }

  private PrepTransformResponse fetch(String dsId) throws PrepException {
    DataFrame gridResponse;
    gridResponse = teddyImpl.fetch(dsId);

    PrepTransformResponse response = new PrepTransformResponse(teddyImpl.getCurStageIdx(dsId), gridResponse);
    response.setRuleStringInfos(getRulesInOrder(dsId), false, false);
    return response;
  }

  // UNDO ////////////////////////////////////////////////////////////
  //  - leave an undo transition (for redo later)
  //  - transform the grid, ruleCurIdx, ruleString[]
  private PrepTransformResponse undo(String dsId) throws PrepException { // TeddyException {
    DataFrame gridResponse = teddyImpl.undo(dsId);
    int newIdx = teddyImpl.getCurStageIdx(dsId);

    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));

    dataset.setRuleCnt(newIdx+1);
    dataset.setRuleCurIdx(newIdx);
    datasetRepository.save(dataset);

    PrepTransformResponse response = new PrepTransformResponse(dataset.getRuleCurIdx(), gridResponse);
    return response;
  }

  // REDO ////////////////////////////////////////////////////////////
  // 단지 UNDO transition 제거
  private PrepTransformResponse redo(String dsId) throws PrepException { // TeddyException {
    DataFrame gridResponse = teddyImpl.redo(dsId);

    int newIdx = teddyImpl.getCurStageIdx(dsId);

    PrepDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));

    dataset.setRuleCnt(newIdx+1);
    dataset.setRuleCurIdx(newIdx);
    datasetRepository.save(dataset);

    PrepTransformResponse response = new PrepTransformResponse(dataset.getRuleCurIdx(), gridResponse);
    return response;
  }

  private PrepTransformRule getTransformRuleAt(PrepDataset dataset, int stageIdx) {
    List<PrepTransformRule> transformRules = transformRuleRepository.findAllByOrderByRuleNoAsc();

    for (PrepTransformRule transformRule : transformRules) {
      if (transformRule.getDataset().getDsId().equals(dataset.getDsId()) == false)
        continue;

      // FIXME: sadly, we have changed the meaning of "rule_no" into stageIdx
      //        yet, we didn't change. Server code and UI code will be changed at once.
      if (transformRule.getRuleNo() == stageIdx) {
        return transformRule;
      }
    }
    throw new IllegalArgumentException(String.format("rule not found: dsId=%s stageIdx=%d", dataset.getDsId(), stageIdx));
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
        rule.setJsonRuleString(Util.parseRuleString(rule.getRuleString()));
        rules.add(rule);
      }
    }
    return rules;
  }

  public String getFirstUpstreamDsId(String dsId) {
    for (PrepTransformRule rule : transformRuleRepository.findAllByOrderByRuleNoAsc()) {
      if (rule.getDataset().getDsId().equals(dsId)) {
        String ruleString = rule.getRuleString();
        assert ruleString.startsWith("create") : ruleString;
        return Util.getUpstreamDsId(ruleString);
      }
    }
    return null;
  }

  private boolean onlyAppend(String dsId) {
    List<PrepTransformRule> transformRules = getRulesInOrder(dsId);
    teddyImpl.reset(dsId);

    return (teddyImpl.getRevCnt(dsId) == transformRules.size() + 1);  // revision# = stage0 + rule#
  }

  public void putAddedInfo(PrepTransformResponse transformResponse, PrepDataset wrangledDataset) {
    if(transformResponse!=null && wrangledDataset!=null) {
      transformResponse.setSampledRows(wrangledDataset.getTotalLines());
      transformResponse.setFullBytes(wrangledDataset.getTotalBytes()); // 아직 totalBytes 미구현
    }
  }

  private DataFrame createStage0(String wrangledDsId, PrepDataset importedDataset) throws Exception {
    PrepDataset wrangledDataset = datasetRepository.findRealOne(datasetRepository.findOne(wrangledDsId));
    DataFrame gridResponse;

    LOGGER.info("createStage0: dsId={} (using embedded transform engine)", wrangledDsId);

    if (importedDataset.getImportType().equalsIgnoreCase("FILE")) {
      String path = importedDataset.getCustomValue("filePath"); // datasetFileService.getPath2(importedDataset);
      LOGGER.debug(wrangledDsId + " path=[" + path + "]");
      if (importedDataset.isDSV()) {
        gridResponse = teddyImpl.loadFileDataset(wrangledDsId, path, importedDataset.getDelimiter(), wrangledDataset.getDsName());
      }
      else if (importedDataset.isEXCEL()) {
        LOGGER.error("createStage0(): EXCEL not supported: " + path);
        throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_FORMAT_WRONG);
      }
      else if (importedDataset.isJSON()) {
        LOGGER.error("createStage0(): EXCEL not supported: " + path);
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
      throw new IllegalArgumentException("invalid import type: createWrangledDataset\nimportedDataset: " + importedDataset.toString());
    }

    wrangledDataset.setRuleCurIdx(0);
    wrangledDataset.setRuleCnt(1);

    assert gridResponse != null : wrangledDsId;
    wrangledDataset.setTotalLines(gridResponse.rows.size());

    teddyImpl.getCurDf(wrangledDsId).setRuleString(Util.getCreateRuleString(importedDataset.getDsId()));

    LOGGER.trace("createStage0(): end");
    return gridResponse;
  }

  // only debugging purpose
  public PrepTransformResponse getCacheInfo() {
    Map<String, Object> cacheInfo = new HashMap<>();

    PrepTransformResponse response = new PrepTransformResponse();
    response.setCacheInfo(cacheInfo);
    return response;
  }

  // FIXME: just send static configurations. we do not need specific dataset info.
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
    } catch (PrepException e) {
      throw e;
    } catch (RuleException e) {
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    } catch (Exception e) {
      LOGGER.error("confirmRuleStringForException(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED, e.getMessage());
    }
  }

  public String cancelSnapshot(String ssId) {
      PrepSnapshot.STATUS status = teddyExecutor.statusCheck(ssId);

      if(status == null)
          return "NO_MATCHED_SNAPSHOT_ID";

      switch (status) {
          case INITIALIZING:
          case WRITING:
          case TABLE_CREATING:
              teddyExecutor.updateAsCanceling(ssId);
              return "OK";
          case RUNNING:
              teddyExecutor.updateAsCanceling(ssId);
              List<Future<List<Row>>> jobs = teddyExecutor.getJob(ssId);
              if( jobs != null && !jobs.isEmpty()) {
                  for (Future<List<Row>> job : jobs) {
                      job.cancel(true);
                  }
              }
              return "OK";
          case CANCELING:
          case CANCELED:
              return "THIS_SNAPSHOT_IS_ALREADY_CANCELED";
          case SUCCEEDED:
          case FAILED:
              return "THIS_SNAPSHOT_IS_ALREADY_CREATED_OR_FAILED";
          case NOT_AVAILABLE:
          default:
              return "UNKNOWN_ERROR";
      }
  }
}
