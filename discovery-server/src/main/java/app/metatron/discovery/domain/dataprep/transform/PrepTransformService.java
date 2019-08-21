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

import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_HOSTNAME;
import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_METASTORE_URI;
import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_PASSWORD;
import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_PORT;
import static app.metatron.discovery.domain.dataprep.PrepProperties.STAGEDB_USERNAME;
import static app.metatron.discovery.domain.dataprep.entity.PrDataset.DS_TYPE.IMPORTED;
import static app.metatron.discovery.domain.dataprep.entity.PrDataset.DS_TYPE.WRANGLED;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.DataConnectionRepository;
import app.metatron.discovery.domain.dataprep.PrepDatasetFileService;
import app.metatron.discovery.domain.dataprep.PrepPreviewLineService;
import app.metatron.discovery.domain.dataprep.PrepProperties;
import app.metatron.discovery.domain.dataprep.PrepSnapshotRequestPost;
import app.metatron.discovery.domain.dataprep.PrepSwapRequest;
import app.metatron.discovery.domain.dataprep.entity.PrDataflow;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot.ENGINE;
import app.metatron.discovery.domain.dataprep.entity.PrTransformRule;
import app.metatron.discovery.domain.dataprep.etl.SparkExecutor;
import app.metatron.discovery.domain.dataprep.etl.TeddyExecutor;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.repository.PrDataflowRepository;
import app.metatron.discovery.domain.dataprep.repository.PrDatasetRepository;
import app.metatron.discovery.domain.dataprep.repository.PrSnapshotRepository;
import app.metatron.discovery.domain.dataprep.repository.PrTransformRuleRepository;
import app.metatron.discovery.domain.dataprep.rule.ExprFunction;
import app.metatron.discovery.domain.dataprep.service.PrSnapshotService;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.DataFrameService;
import app.metatron.discovery.domain.dataprep.teddy.Row;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.CannotSerializeIntoJsonException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.IllegalColumnNameForHiveException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.storage.StorageProperties;
import app.metatron.discovery.domain.storage.StorageProperties.StageDBConnection;
import com.facebook.presto.jdbc.internal.guava.collect.Lists;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Maps;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import javax.annotation.PostConstruct;
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
import org.springframework.core.env.StandardEnvironment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PrepTransformService {

  private static Logger LOGGER = LoggerFactory.getLogger(PrepTransformService.class);

  @Autowired
  private Environment env;

  @Autowired(required = false)
  TeddyExecutor teddyExecutor;

  @Autowired(required = false)
  SparkExecutor sparkExecutor;

  @Autowired
  PrepHistogramService prepHistogramService;

  @PostConstruct
  public void init() {
    System.setProperty("dataprep",
        Arrays.asList(env.getActiveProfiles()).contains("dataprep") ? "enabled" : "disabled");
  }

  @Autowired
  PrDatasetRepository datasetRepository;
  @Autowired
  PrDataflowRepository dataflowRepository;
  @Autowired
  PrTransformRuleRepository transformRuleRepository;
  @Autowired
  PrepPreviewLineService previewLineService;
  @Autowired
  PrepDatasetFileService datasetFileService;
  @Autowired
  PrSnapshotRepository snapshotRepository;
  @Autowired
  DataConnectionRepository connectionRepository;
  @Autowired
  PrSnapshotService snapshotService;
  @Autowired
  DataFrameService dataFrameService;
  @Autowired
  PrepTransformRuleService transformRuleService;

  @Autowired(required = false)
  TeddyImpl teddyImpl;

  @Autowired(required = false)
  PrepProperties prepProperties;

  @Autowired(required = false)
  StorageProperties storageProperties;

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

  public enum OP_TYPE {
    CREATE,
    APPEND,
    UPDATE,
    DELETE,
    JUMP,
    UNDO,
    REDO,
    PREVIEW,
    NOT_USED
  }

  // Properties along the ETL program kinds are gathered into a single JSON properties string.
  // Currently, the ETL programs kinds are the embedded engine and Apache Spark.
  private String getJsonPrepPropertiesInfo(String dsId, PrepSnapshotRequestPost requestPost)
      throws JsonProcessingException, URISyntaxException {
    PrDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));

    PrDataset.IMPORT_TYPE importType = dataset.getImportType();
    boolean dsStagingDb = (importType == PrDataset.IMPORT_TYPE.STAGING_DB);

    PrSnapshot.SS_TYPE ssType = requestPost.getSsType();

    boolean ssHdfs = (ssType == PrSnapshot.SS_TYPE.URI && (new URI(requestPost.getStoredUri()))
        .getScheme().equals("hdfs"));
    boolean ssStagingDb = (ssType == PrSnapshot.SS_TYPE.STAGING_DB);

    PrSnapshot.ENGINE engine = requestPost.getEngine();

    // check polaris.dataprep.hadoopConfDir
    if (ssHdfs || ssStagingDb) {
      prepProperties.getHadoopConfDir(true);
      prepProperties.getStagingBaseDir(true);
    }

    Map<String, Object> mapEveryForEtl = prepProperties.getEveryForEtl();

    if (storageProperties != null && storageProperties.getStagedb()
        != null) { // if the value is null, that means storage.stagedb is not in a yaml. NOT using STAGING_DB
      StageDBConnection stageDB = storageProperties.getStagedb();
      mapEveryForEtl.put(STAGEDB_HOSTNAME, stageDB.getHostname());
      mapEveryForEtl.put(STAGEDB_PORT, stageDB.getPort());
      mapEveryForEtl.put(STAGEDB_USERNAME, stageDB.getUsername());
      mapEveryForEtl.put(STAGEDB_PASSWORD, stageDB.getPassword());

      if (engine == ENGINE.SPARK) {
        mapEveryForEtl.put(STAGEDB_METASTORE_URI, stageDB.getMetastoreUri());
      }
    }

    return GlobalObjectMapper.getDefaultMapper().writeValueAsString(mapEveryForEtl);
  }

  private String getJsonSnapshotInfo(PrepSnapshotRequestPost requestPost, String ssId)
      throws JsonProcessingException {
    Map<String, Object> map = new HashMap();
    PrSnapshot.SS_TYPE ssType = requestPost.getSsType();
    PrSnapshot.ENGINE engine = requestPost.getEngine();
    PrSnapshot.APPEND_MODE appendMode = requestPost.getAppendMode();

    // 공통
    map.put("ssId", ssId);
    map.put("ssName", requestPost.getSsName());
    map.put("ssType", ssType.name());
    map.put("engine", engine.name());
    map.put("hiveFileFormat", requestPost.getHiveFileFormat());
    map.put("hiveFileCompression", requestPost.getHiveFileCompression());
    map.put("localBaseDir", prepProperties.getLocalBaseDir());

    switch (ssType) {
      case URI:
        String storedUri = requestPost.getStoredUri();
        assert storedUri != null;
        map.put("storedUri", storedUri);
        break;
      case STAGING_DB:
        map.put("partitionColNames", requestPost.getPartitionColNames());
        map.put("appendMode", appendMode.name());
        map.put("dbName", requestPost.getDbName());
        map.put("tblName", requestPost.getTblName());

        map.put("stagingBaseDir", prepProperties.getStagingBaseDir(true));
        break;
      default:
        assert false : ssType;
    }

    return GlobalObjectMapper.getDefaultMapper().writeValueAsString(map);
  }

  private String getJsonCallbackInfo(String oauth_token) throws JsonProcessingException {
    Map<String, Object> map = new HashMap();
    map.put("port", getServerPort());
    map.put("oauth_token", oauth_token);

    return GlobalObjectMapper.getDefaultMapper().writeValueAsString(map);
  }


  public PrepTransformService() {
  }

  // skips the last rule for UPDATE purpose
  public List<String> getUpstreamDsIds(String dsId, boolean forUpdate)
      throws IOException, CannotSerializeIntoJsonException {
    List<String> upstreamDsIds = new ArrayList<>();

    String firstUpstreamDsId = getFirstUpstreamDsId(dsId);
    if (firstUpstreamDsId == null) {  // then, this is not a wrangled dataset
      return upstreamDsIds;
    }
    upstreamDsIds.add(firstUpstreamDsId);

    List<PrTransformRule> rules = getRulesInOrder(dsId);

    int until = forUpdate ? rules.size() - 1 : rules.size();

    prepareTransformRules(dsId);

    for (int i = 0; i < until; i++) {
      PrTransformRule rule = rules.get(i);
      upstreamDsIds.addAll(transformRuleService.getUpstreamDsIds(rule.getRuleString()));
    }
    return upstreamDsIds;
  }

  public List<String> getUpstreamDsIds(String dsId)
      throws IOException, CannotSerializeIntoJsonException {
    return getUpstreamDsIds(dsId, false);
  }

  // create stage0 (POST)
  @Transactional(rollbackFor = Exception.class)
  public PrepTransformResponse create(String importedDsId, String dfId, String cloningDsName)
      throws Exception {
    LOGGER.trace("create(): start");

    PrDataset importedDataset = datasetRepository
        .findRealOne(datasetRepository.findOne(importedDsId));
    PrDataflow dataflow = dataflowRepository.findOne(dfId);
    assert importedDataset.getDsType() == IMPORTED : importedDataset.getDsType();

    PrDataset wrangledDataset = makeWrangledDataset(importedDataset, dataflow, dfId, cloningDsName);
    datasetRepository.save(wrangledDataset);

    // We need to save into the repository to get an ID.
    String wrangledDsId = wrangledDataset.getDsId();
    createStage0(wrangledDsId, importedDataset);

    wrangledDataset.addDataflow(dataflow);
    dataflow.addDataset(wrangledDataset);

    datasetRepository.save(wrangledDataset);
    dataflowRepository.save(dataflow);

    // The 1st rule string is the master upstream dsId.
    // This could be either an imported dataset or another wrangled dataset.
    String createRuleString = transformRuleService.getCreateRuleString(importedDsId);
    String createJsonRuleString = transformRuleService.jsonizeRuleString(createRuleString);
    String shortRuleString = transformRuleService.shortenRuleString(createRuleString);
    PrTransformRule rule = new PrTransformRule(wrangledDataset, 0, createRuleString,
        createJsonRuleString, shortRuleString);
    transformRuleRepository.saveAndFlush(rule);

    PrepTransformResponse response = new PrepTransformResponse(wrangledDsId);
    response.setWrangledDsId(wrangledDsId);
    this.putAddedInfo(response, wrangledDataset);

    // Auto type detection and conversion (except cloning case)
    if (cloningDsName == null && prepProperties.isAutoTypingEnabled()) {
      switch (importedDataset.getImportType()) {
        case UPLOAD:
        case URI:
          List<String> ruleStrings = teddyImpl.getAutoTypingRules(teddyImpl.getCurDf(wrangledDsId));
          for (int i = 0; i < ruleStrings.size(); i++) {
            String ruleString = ruleStrings.get(i);
            String jsonRuleString = transformRuleService.jsonizeRuleString(ruleString);
            transform(wrangledDsId, OP_TYPE.APPEND, i, ruleString, jsonRuleString, true);
          }
          break;
        case DATABASE:
        case STAGING_DB:
        case DRUID:
          /* NOP */
          break;
      }
    }

    // Save the preview as a file. To be used in dataset details page.
    previewLineService.putPreviewLines(wrangledDsId, teddyImpl.getCurDf(wrangledDsId));

    LOGGER.trace("create(): end");
    return response;
  }


  @Transactional(rollbackFor = Exception.class)
  public PrepTransformResponse clone(String wrangledDsId) throws Exception {
    PrDataset wrangledDataset = datasetRepository
        .findRealOne(datasetRepository.findOne(wrangledDsId));
    String upstreamDsId = getFirstUpstreamDsId(wrangledDsId);

    PrepTransformResponse response = create(upstreamDsId, wrangledDataset.getCreatorDfId(),
        wrangledDataset.getDsName());
    String cloneDsId = response.getWrangledDsId();

    List<PrTransformRule> transformRules = getRulesInOrder(wrangledDsId);
    for (int i = 1; i < transformRules.size(); i++) {
      String ruleString = transformRules.get(i).getRuleString();
      String jsonRuleString = transformRules.get(i).getJsonRuleString();
      try {
        response = transform(cloneDsId, OP_TYPE.APPEND, i - 1, ruleString, jsonRuleString, true);
      } catch (TeddyException te) {
        LOGGER.info("clone(): A TeddyException is suppressed: {}", te.getMessage());
      }
    }
    return response;
  }

  @Transactional(rollbackFor = Exception.class)
  public List<String> swap(String oldDsId, String newDsId) throws Exception {
    List<String> targetDsIds = Lists.newArrayList();

    // Replace all occurrence of oldDsid in whole rule strings in the system.
    for (PrTransformRule rule : transformRuleRepository.findAll()) {
      String ruleString = rule.getRuleString();
      if (ruleString.contains(oldDsId)) {
        String newRuleString = ruleString.replace(oldDsId, newDsId);
        String newJsonRuleString = rule.getJsonRuleString().replaceAll(oldDsId, newDsId);
        String newShortRuleString = transformRuleService.shortenRuleString(newRuleString);

        rule.setRuleString(newRuleString);
        rule.setJsonRuleString(newJsonRuleString);
        rule.setShortRuleString(newShortRuleString);

        // un-cache to be reloaded
        teddyImpl.remove(rule.getDataset().getDsId());

        if (false == targetDsIds.contains(rule.getDataset().getDsId())) {
          // It must be wrangled dataset, but not chaining wrangled
          targetDsIds.add(rule.getDataset().getDsId());
        }
      }
    }

    PrDataset oldDataset = datasetRepository.findOne(oldDsId);
    PrDataset newDataset = datasetRepository.findOne(newDsId);

    List<PrDataflow> dataflows = dataflowRepository.findAll();
    for (PrDataflow dataflow : dataflows) {
      List<PrDataset> datasets = dataflow.getDatasets();
      for (PrDataset dataset : datasets) {
        if (dataset.getDsId().equals(oldDataset.getDsId())) {
          datasets.remove(dataset);
          datasets.add(newDataset);
          dataflow.setDatasets(datasets);
          dataflowRepository.save(dataflow);
          break;
        }
      }
    }
    dataflowRepository.flush();

    return targetDsIds;
  }

  @Transactional(rollbackFor = Exception.class)
  public List<String> swap_upstream(PrDataflow dataflow, PrepSwapRequest swapRequest)
      throws Exception {
    String oldDsId = swapRequest.getOldDsId();
    String newDsId = swapRequest.getNewDsId();
    String wrangledDsId = swapRequest.getWrangledDsId();
    List<String> affectedDsIds = Lists.newArrayList();
    List<String> dataflowDsIds = Lists.newArrayList();

    if (wrangledDsId != null) {         // if a single (downstream) dataset is specified
      dataflowDsIds.add(wrangledDsId);
    } else {                            // else, all datasets in the dataflow become the targets
      List<PrDataset> datasets = dataflow.getDatasets();
      for (PrDataset dataset : datasets) {
        dataflowDsIds.add(dataset.getDsId());
      }
    }

    // Replace all occurrence of oldDsid in whole rule strings in the targets.
    for (PrTransformRule rule : transformRuleRepository.findAll()) {
      if (!dataflowDsIds.contains(rule.getDataset().getDsId())) {
        continue;
      }

      String ruleString = rule.getRuleString();
      if (!ruleString.contains(oldDsId)) {
        continue;
      }

      String newRuleString = transformRuleService.getCreateRuleString(newDsId);
      String newJsonRuleString = rule.getJsonRuleString().replaceAll(oldDsId, newDsId);
      String newShortRuleString = transformRuleService.shortenRuleString(newRuleString);

      rule.setRuleString(newRuleString);
      rule.setJsonRuleString(newJsonRuleString);
      rule.setShortRuleString(newShortRuleString);

      // Uncache the affected target so that it can be reloaded
      teddyImpl.remove(rule.getDataset().getDsId());

      if (false == affectedDsIds.contains(rule.getDataset().getDsId())) {
        // It must be wrangled dataset, but not chaining wrangled
        affectedDsIds.add(rule.getDataset().getDsId());
      }
    }

    // If a wrangled dataset is specified, rearranging datasets is not necessary.
    // The UI adds the new dataset in advance (if needed).
    // And, the UI will not specify a wrangled dataset if the old dataset is the last one, so that it can be removed.
    if (wrangledDsId != null) {
      return affectedDsIds;
    }

    PrDataset newDataset = datasetRepository.findOne(newDsId);

    List<PrDataset> datasets = dataflow.getDatasets();
    for (PrDataset dataset : datasets) {
      if (dataset.getDsId().equals(oldDsId)) {
        datasets.remove(dataset);
        if (!datasets.contains(newDataset)) {
          datasets.add(newDataset);
        }
        dataflow.setDatasets(datasets);
        dataflowRepository.save(dataflow);
        break;
      }
    }
    dataflowRepository.flush();

    return affectedDsIds;
  }

  @Transactional(rollbackFor = Exception.class)
  public void after_swap(List<String> affectedDsIds) throws Exception {
    for (String affectedDsId : affectedDsIds) {
      PrepTransformResponse response = this.fetch(affectedDsId, null);
      DataFrame dataFrame = response.getGridResponse();
      this.previewLineService.putPreviewLines(affectedDsId, dataFrame);
    }
  }

  public DataFrame loadWrangledDataset(String dsId)
      throws IOException, CannotSerializeIntoJsonException {
    return loadWrangledDataset(dsId, false);
  }

  private DataFrame loadWrangledDataset(String dsId, boolean compaction)
      throws IOException, CannotSerializeIntoJsonException {
    if (teddyImpl.revisionSetCache.containsKey(dsId)) {
      if (compaction && !onlyAppend(dsId)) {
        LOGGER.trace("loadWrangledDataset(): dataset will be uncached and reloaded: dsId={}", dsId);
      } else {
        return teddyImpl.getCurDf(dsId);
      }
    }
    LOGGER.trace("loadWrangledDataset(): start: dsId={}", dsId);

    DataFrame gridResponse;

    // 만약 PLM cache에 존재하고, transition을 재적용할 필요가 없다면
    if (teddyImpl.revisionSetCache.containsKey(dsId)) {
      if (onlyAppend(dsId)) {
        return teddyImpl.getCurDf(dsId);
      }
    }

    // 이하 코드는 dataset이 PLM cache에 존재하지 않거나, transition을 처음부터 다시 적용해야 하는 경우
    teddyImpl.remove(dsId);

    PrDataset upstreamDataset = datasetRepository
        .findRealOne(datasetRepository.findOne(getFirstUpstreamDsId(dsId)));
    gridResponse = createStage0(dsId, upstreamDataset);
    teddyImpl.reset(dsId);

    List<String> ruleStrings = new ArrayList<>();
    List<String> jsonRuleStrings = new ArrayList<>();
    ArrayList<String> totalTargetDsIds = new ArrayList<>();           // What is this for?
    ArrayList<PrDataset> totalTargetDatasets = new ArrayList<>();     // What is this for?

    prepareTransformRules(dsId);

    for (PrTransformRule transformRule : getRulesInOrder(dsId)) {
      String ruleString = transformRule.getRuleString();

      // add to the rule string array
      ruleStrings.add(ruleString);
      jsonRuleStrings.add(transformRule.getJsonRuleString());

      // gather slave datasets (load and apply, too)
      List<String> upstreamDsIds = transformRuleService.getUpstreamDsIds(ruleString);

      for (String upstreamDsId : upstreamDsIds) {
        loadWrangledDataset(upstreamDsId);
        totalTargetDsIds.add(upstreamDsId);

        PrDataset targetDataset = datasetRepository
            .findRealOne(datasetRepository.findOne(upstreamDsId));
        totalTargetDatasets.add(targetDataset);
      }
    }

    // 적용할 rule string이 없으면 그냥 리턴.
    if (ruleStrings.size() == 0) {
      LOGGER.trace("loadWrangledDataset(): end (no rules to apply)");
      return teddyImpl.getCurDf(dsId);
    }

    for (int i = 1; i < ruleStrings.size(); i++) {
      String ruleString = ruleStrings.get(i);
      String jsonRuleString = jsonRuleStrings.get(i);
      gridResponse = teddyImpl.append(dsId, i - 1, ruleString, jsonRuleString, true);
    }
    updateTransformRules(dsId);
    adjustStageIdx(dsId, ruleStrings.size() - 1, true);

    LOGGER.trace("loadWrangledDataset(): end (applied rules)");
    return gridResponse;
  }

  private List<Histogram> createHistsWithColWidths(DataFrame df, List<Integer> colnos,
      List<Integer> colWidths) {
    LOGGER.debug("createHistsWithColWidths(): df.colCnt={}, colnos={} colWidths={}", df.getColCnt(),
        colnos, colWidths);

    df.colHists = new ArrayList<>();
    List<Future<Histogram>> futures = new ArrayList<>();
    List<Histogram> colHists = new ArrayList<>();

    assert colnos.size() == colWidths.size() : String
        .format("colnos.size()=%d colWidths.size()=%d", colnos.size(), colWidths.size());

    int dop = 16;
    int issued = 0;

    for (int i = 0; i < colnos.size(); i++) {
      int colno = colnos.get(i);
      int colWidth = colWidths.get(i);
      futures.add(prepHistogramService
          .updateHistWithColWidth(df.getColName(colno), df.getColType(colno), df.rows, colno,
              colWidth));

      if (++issued == dop) {
        for (int j = 0; j < issued; j++) {
          try {
            colHists.add(futures.get(j).get());
          } catch (InterruptedException e) {
            LOGGER.error("createHistsWithColWidths(): interrupted", e);
          } catch (ExecutionException e) {
            e.getCause().printStackTrace();
            LOGGER.error("createHistsWithColWidths(): execution error on " + df.dsName, e);
          }
        }
        issued = 0;
        futures.clear();
      }
    }

    if (issued > 0) {
      for (int j = 0; j < issued; j++) {
        try {
          colHists.add(futures.get(j).get());
        } catch (InterruptedException e) {
          LOGGER.error("createHistsWithColWidths(): interrupted", e);
        } catch (ExecutionException e) {
          e.getCause().printStackTrace();
          LOGGER.error("createHistsWithColWidths(): execution error on " + df.dsName, e);
        }
      }
    }

    LOGGER.trace("createHistsWithColWidths(): finished");
    return colHists;
  }

  private void adjustStageIdx(String dsId, Integer stageIdx, boolean persist) {

    assert stageIdx != null;

    teddyImpl.setCurStageIdx(dsId, stageIdx);

    if (persist) {
      PrDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
      dataset.setRuleCurIdx(stageIdx);
      datasetRepository.saveAndFlush(dataset);
    }
  }

  private int preTransform(String dsId, OP_TYPE op, String ruleString)
      throws CannotSerializeIntoJsonException, IOException {
    if (op == OP_TYPE.APPEND || op == OP_TYPE.UPDATE || op == OP_TYPE.PREVIEW) {
      PrepRuleChecker.confirmRuleStringForException(ruleString);

      // Check in advance, or a severe inconsistency between stages and rules can happen,
      // when these functions fail at that time, after all works done for the stages successfully.
      transformRuleService.shortenRuleString(ruleString);
    }

    PrDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
    assert dataset != null : dsId;

    // dataset이 loading되지 않았으면 loading
    loadWrangledDataset(dsId);      // TODO: do compaction (only when UI requested explicitly)

    int origStageIdx = teddyImpl.getCurStageIdx(dsId);

    // join이나 union의 경우, 대상 dataset들도 loading
    if (ruleString != null) {
      for (String upstreamDsId : transformRuleService.getUpstreamDsIds(ruleString)) {
        loadWrangledDataset(upstreamDsId);
      }
    }

    return origStageIdx;
  }

  // transform (PUT)
  @Transactional(rollbackFor = Exception.class)
  public PrepTransformResponse transform(String dsId, OP_TYPE op, Integer stageIdx,
      String ruleString, String jsonRuleString, boolean suppress) throws Exception {
    LOGGER.trace("transform(): start: dsId={} op={} stageIdx={} ruleString={} jsonRuleString={}",
        dsId, op, stageIdx, ruleString, jsonRuleString);

    int origStageIdx = preTransform(dsId, op, ruleString);

    // 아래 각 case에서 ruleCurIdx, matrixResponse는 채워서 리턴
    // rule list는 transform()을 마칠 때에 채움. 모든 op에 대해 동일하기 때문에.
    switch (op) {
      case APPEND:
        teddyImpl.append(dsId, stageIdx, ruleString, jsonRuleString, suppress);
        if (stageIdx >= origStageIdx) {
          adjustStageIdx(dsId, stageIdx + 1, true);
        } else {
          adjustStageIdx(dsId, origStageIdx + 1, true);
        }
        break;
      case DELETE:
        teddyImpl.delete(dsId, stageIdx);
        if (stageIdx <= origStageIdx) {
          adjustStageIdx(dsId, origStageIdx - 1, true);
        } else {
          adjustStageIdx(dsId, origStageIdx,
              true);  // Currently, this case does not happen (no delete button after curRuleIdx)
        }
        break;
      case UPDATE:
        teddyImpl.update(dsId, stageIdx, ruleString, jsonRuleString);
        break;
      case UNDO:
        assert stageIdx == null;
        teddyImpl.undo(dsId);
        adjustStageIdx(dsId, teddyImpl.getCurStageIdx(dsId), true);
        break;
      case REDO:
        assert stageIdx == null;
        teddyImpl.redo(dsId);
        adjustStageIdx(dsId, teddyImpl.getCurStageIdx(dsId), true);
        break;
      case JUMP:
        adjustStageIdx(dsId, stageIdx, true);
        break;
      case PREVIEW:
        LOGGER.trace("transform(): preview end");
        return new PrepTransformResponse(teddyImpl.preview(dsId, stageIdx, ruleString));
      case NOT_USED:
      default:
        throw new IllegalArgumentException("invalid transform op: " + op.toString());
    }

    LOGGER.trace("transform(): end");
    return postTransform(dsId, op);
  }

  private PrepTransformResponse postTransform(String dsId, OP_TYPE op)
      throws CannotSerializeIntoJsonException, JsonProcessingException {
    PrDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
    assert dataset != null : dsId;

    PrepTransformResponse response = null;
    switch (op) {
      case APPEND:
      case DELETE:
      case UNDO:
      case REDO:
      case UPDATE:
        updateTransformRules(dsId);
        response = fetch_internal(dsId, dataset.getRuleCurIdx());
        dataset.setTotalLines((long) response.getGridResponse().rows.size());
        this.previewLineService.putPreviewLines(dsId, response.getGridResponse());
        break;
      case JUMP:
        response = fetch_internal(dsId, dataset.getRuleCurIdx());
        break;
      case PREVIEW:
      case NOT_USED:
      default:
        break;
    }

    response.setRuleCurIdx(dataset.getRuleCurIdx());
    response.setTransformRules(getRulesInOrder(dsId), teddyImpl.isUndoable(dsId),
        teddyImpl.isRedoable(dsId));
    return response;
  }

  private void updateTransformRules(String dsId)
      throws CannotSerializeIntoJsonException, JsonProcessingException {
    for (PrTransformRule rule : getRulesInOrder(dsId)) {
      transformRuleRepository.delete(rule);
    }
    transformRuleRepository.flush();

    List<String> ruleStrings = teddyImpl.getRuleStrings(dsId);
    List<String> jsonRuleStrings = teddyImpl.getJsonRuleStrings(dsId);
    List<Boolean> valids = teddyImpl.getValids(dsId);

    PrDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
    for (int i = 0; i < ruleStrings.size(); i++) {
      String ruleString = ruleStrings.get(i);
      String jsonRuleString = jsonRuleStrings.get(i);
      String shortRuleString = transformRuleService.shortenRuleString(ruleString);
      PrTransformRule rule = new PrTransformRule(dataset, i, ruleStrings.get(i), jsonRuleString,
          shortRuleString);
      rule.setValid(valids.get(i));
      transformRuleRepository.save(rule);
    }

    transformRuleRepository.flush();
  }

  // transform_histogram (POST)
  public PrepHistogramResponse transform_histogram(String dsId, Integer stageIdx,
      List<Integer> colnos, List<Integer> colWidths) throws Exception {
    LOGGER.trace(
        "transform_histogram(): start: dsId={} curRevIdx={} stageIdx={} colnos={} colWidths={}",
        dsId, teddyImpl.getCurRevIdx(dsId), stageIdx, colnos, colWidths);

    loadWrangledDataset(dsId);

    assert stageIdx != null;
    assert stageIdx >= 0 : stageIdx;

    DataFrame df = teddyImpl.fetch(dsId, stageIdx);
    List<Histogram> colHists = createHistsWithColWidths(df, colnos, colWidths);

    LOGGER.trace("transform_histogram(): end");
    return new PrepHistogramResponse(colHists);
  }

  private Map<String, Integer> getTimestampFormatList(DataFrame df, String colName)
      throws Exception {
    Map<String, Integer> timestampFormatList = new LinkedHashMap<>();
    List<TimestampTemplate> timestampStyleGuess = new ArrayList<>();
    int colNo;

    // 기본 포맷은 항상 리턴
    for (TimestampTemplate tt : TimestampTemplate.values()) {
      String timestampFormat = tt.getFormatForRuleString();
      timestampFormatList.put(timestampFormat, 0);
    }

    if (colName.equals("")) {
    } else {

      try {
        colNo = df.getColnoByColName(colName);
      } catch (Exception e) {
        //return null;

        // null은 안된다는 UI 요청. 원칙적으로 colNo가 없을 수는 없는데 룰 로직의 버그로 발생할 수 있는 듯.
        // 확인 필요.
        // 우선 템플릿 중 첫번째 포맷을 디폴트로 사용함
        return timestampFormatList;
      }

      int rowCount = df.rows.size() < 100 ? df.rows.size() : 100;

      for (int i = 0; i < rowCount; i++) {
        if (df.rows.get(i).get(colNo) == null) {
          continue;
        }

        String str = df.rows.get(i).get(colNo).toString();

        for (TimestampTemplate tt : TimestampTemplate.values()) {
          try {
            DateTimeFormatter dtf = DateTimeFormat.forPattern(tt.getFormat())
                .withLocale(Locale.ENGLISH);
            DateTime.parse(str, dtf);

            timestampStyleGuess.add(tt);
            break;
          } catch (Exception e) {
            //LOGGER.info("create(): Detecting Column Type...", e);
          }
        }
      }
    }

    /*
    for(TimestampTemplate tt : TimestampTemplate.values()) {
      String timestampFormat = tt.getFormatForRuleString();
      timestampFormatList.put(timestampFormat, 0);
    }
    */

    for (TimestampTemplate tt : timestampStyleGuess) {
      String timestampFormat = tt.getFormatForRuleString();
      timestampFormatList.put(timestampFormat, timestampFormatList.get(timestampFormat) + 1);
    }

    return timestampFormatList;
  }

  // transform_timestampFormat
  public Map<String, Object> transform_timestampFormat(String dsId, List<String> colNames)
      throws Exception {
    loadWrangledDataset(dsId);

    DataFrame df = teddyImpl.getCurDf(dsId);
    Map<String, Object> response = new HashMap<>();

    if (colNames.size() == 0) {
      colNames.add("");
    }

    for (String colName : colNames) {
      response.put(colName, getTimestampFormatList(df, colName));
    }

    return response;
  }

  // this includes IMPORTED datasets
  private Map<String, Object> buildDatasetInfoRecursive(String wrangledDsId)
      throws IOException, CannotSerializeIntoJsonException {
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
      PrDataset upstreamDataset = datasetRepository
          .findRealOne(datasetRepository.findOne(upstreamDsId));
      if (upstreamDataset.getDsType() == IMPORTED) {
        datasetInfo.put("importType", upstreamDataset.getImportType().name());
        switch (upstreamDataset.getImportType()) {
          case UPLOAD:
          case URI:
            datasetInfo.put("storedUri", upstreamDataset.getStoredUri());
            datasetInfo.put("delimiter", upstreamDataset.getDelimiter());
            datasetInfo.put("manualColumnCount", upstreamDataset.getManualColumnCount());
            break;

          case DATABASE:
            datasetInfo.put("sourceQuery", upstreamDataset.getQueryStmt());
            String dcId = upstreamDataset.getDcId();
            datasetInfo.put("dcId", dcId);
            DataConnection dataConnection = this.connectionRepository.getOne(dcId);

            datasetInfo.put("implementor", dataConnection.getImplementor());
            datasetInfo.put("connectUri", DataConnectionHelper.getConnectionUrl(dataConnection));
            datasetInfo.put("username", dataConnection.getUsername());
            datasetInfo.put("password", dataConnection.getPassword());
            break;

          case STAGING_DB:
            datasetInfo.put("sourceQuery", upstreamDataset.getQueryStmt());
            break;

          case DRUID:
            assert false : upstreamDataset.getImportType();
        }
      } else {
        Map<String, Object> upstreamDatasetInfo = buildDatasetInfoRecursive(
            upstreamDsId);  // add slaves first
        upstreamDatasetInfos.add(upstreamDatasetInfo);
      }
    }

    // put sourceQuery
    assert datasetInfo.get("sourceQuery") != null
        || datasetInfo.get("storedUri") != null : wrangledDsId;

    // put ruleStrings
    List<String> ruleStrings = new ArrayList<>();
    List<PrTransformRule> transformRules = getRulesInOrder(wrangledDsId);
    for (int i = 1; i < transformRules.size(); i++) {
      ruleStrings.add(transformRules.get(i).getRuleString());
    }
    datasetInfo.put("ruleStrings", ruleStrings);

    // put upstreamDatasetInfos
    datasetInfo.put("upstreamDatasetInfos", upstreamDatasetInfos);

    LOGGER.info("buildDatasetInfoRecursive(): " + GlobalObjectMapper.getDefaultMapper()
        .writeValueAsString(datasetInfo));
    return datasetInfo;
  }

  private String getJsonDatasetInfo(String wrangledDsId)
      throws IOException, CannotSerializeIntoJsonException {
    Map<String, Object> datasetInfo = buildDatasetInfoRecursive(wrangledDsId);
    return GlobalObjectMapper.getDefaultMapper().writeValueAsString(datasetInfo);
  }

  private void runTransformer(String wrangledDsId, PrepSnapshotRequestPost requestPost, String ssId,
      String authorization) throws Throwable {

    String jsonPrepPropertiesInfo = getJsonPrepPropertiesInfo(wrangledDsId, requestPost);
    String jsonDatasetInfo = getJsonDatasetInfo(wrangledDsId);
    String jsonSnapshotInfo = getJsonSnapshotInfo(requestPost, ssId);
    String jsonCallbackInfo = getJsonCallbackInfo(authorization);

    switch (requestPost.getEngine()) {
      case EMBEDDED:
        runTeddy(jsonPrepPropertiesInfo, jsonDatasetInfo, jsonSnapshotInfo, jsonCallbackInfo);
        break;
      case SPARK:
        runSpark(jsonPrepPropertiesInfo, jsonDatasetInfo, jsonSnapshotInfo, jsonCallbackInfo);
        break;
      default:
        assert false : requestPost.getEngine();
    }
  }

  private String getServerPort() {
    // Temporary code for REST Assure test
    if (!serverPort.equals("0")) {
      return serverPort;
    }

    return ((StandardEnvironment) this.env).getPropertySources().get("server.ports")
        .getProperty("local.server.port").toString();
  }

  private void runTeddy(String jsonPrepPropertiesInfo, String jsonDatasetInfo,
      String jsonSnapshotInfo, String jsonCallbackInfo) throws Throwable {
    LOGGER.info("runTeddy(): engine=embedded");

    Future<String> future = teddyExecutor.run(
        new String[]{jsonPrepPropertiesInfo, jsonDatasetInfo, jsonSnapshotInfo,
            jsonCallbackInfo});

    LOGGER.debug("runTeddy(): (Future) result from teddyExecutor: " + future.toString());
  }

  private void runSpark(String jsonPrepPropertiesInfo, String jsonDatasetInfo,
      String jsonSnapshotInfo, String jsonCallbackInfo) throws Throwable {

    Future<String> future = sparkExecutor.run(
        new String[]{jsonPrepPropertiesInfo, jsonDatasetInfo, jsonSnapshotInfo,
            jsonCallbackInfo});

    LOGGER.debug("runSpark(): (Future) result from sparkExecutor: " + future.toString());

    ObjectMapper mapper = GlobalObjectMapper.getDefaultMapper();
    LOGGER.info("runSpark(): engine=spark");

    // Spark engine gets arguments as Map not as JSON string.

    // TO-DO: This is natural. Embbeded engine should do like this too.

//    Map<String, Object> prepPropertiesInfo = mapper
//        .readValue(jsonPrepPropertiesInfo, HashMap.class);
//    Map<String, Object> datasetInfo = mapper.readValue(jsonDatasetInfo, HashMap.class);
//    Map<String, Object> snapshotInfo = mapper.readValue(jsonSnapshotInfo, HashMap.class);
//    Map<String, Object> callbackInfo = mapper.readValue(jsonCallbackInfo, HashMap.class);
//
//    // TO-DO: fork if not running
//
//    // Send spark request
//    Map<String, Object> args = new HashMap();
//
//    args.put("prepProperties", prepPropertiesInfo);
//    args.put("datasetInfo", datasetInfo);
//    args.put("snapshotInfo", snapshotInfo);
//    args.put("callbackInfo", callbackInfo);
//
//    URL url = new URL("http://localhost:" + prepPropertiesInfo.get(ETL_SPARK_PORT) + "/run");
//    HttpURLConnection con = (HttpURLConnection) url.openConnection();
//
//    con.setRequestMethod("POST");
//    con.setRequestProperty("Content-Type", "application/json; utf-8");
//    con.setRequestProperty("Accept", "application/json");
//    con.setDoOutput(true);
//
//    String jsonArgs = GlobalObjectMapper.getDefaultMapper().writeValueAsString(args);
//
//    try (OutputStream os = con.getOutputStream()) {
//      byte[] input = jsonArgs.getBytes("utf-8");
//      os.write(input, 0, input.length);
//    }
//
//    StringBuilder response = new StringBuilder();
//    InputStreamReader reader = new InputStreamReader(con.getInputStream(), "utf-8");
//
//    try (BufferedReader br = new BufferedReader(reader)) {
//      String responseLine;
//
//      while (true) {
//        responseLine = br.readLine();
//        if (responseLine == null) {
//          break;
//        }
//        response.append(responseLine.trim());
//      }
//      System.out.println(response.toString());
//    }
//
//    LOGGER.debug("runSpark(): done with statusCode " + con.getResponseCode());
  }


  private void checkHiveNamingRule(String dsId)
      throws IOException, CannotSerializeIntoJsonException {
    try {
      teddyImpl.checkNonAlphaNumericalColNames(dsId);
    } catch (IllegalColumnNameForHiveException e) {
      throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,
          PrepMessageKey.MSG_DP_ALERT_TEDDY_ILLEGAL_COLUMN_NAME_FOR_HIVE, e.getMessage());
    }
  }

  // FIXME: What is this functions for?
  private void prepareTransformRules(String dsId)
      throws CannotSerializeIntoJsonException, JsonProcessingException {
    PrDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
    List<PrTransformRule> transformRules = dataset.getTransformRules();

    if (transformRules != null && transformRules.size() > 0) {
      for (PrTransformRule transformRule : transformRules) {
        if (transformRule.getJsonRuleString() == null) {
          String jsonRuleString = transformRule.getJsonRuleString();
          transformRule.setJsonRuleString(jsonRuleString);
        }
        if (transformRule.getShortRuleString() == null) {
          String shortRuleString = transformRuleService
              .shortenRuleString(transformRule.getRuleString());
          transformRule.setShortRuleString(shortRuleString);
        }
      }
    }
  }

  @Transactional
  public PrepSnapshotResponse transform_snapshot(String wrangledDsId,
      PrepSnapshotRequestPost requestPost, String authorization) throws Throwable {
    PrepSnapshotResponse response;
    List<String> allFullDsIds;
    PrSnapshot snapshot = new PrSnapshot();
    PrDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(wrangledDsId));

    PrSnapshot.SS_TYPE ssType = requestPost.getSsType();
    String ssName = requestPost.getSsName();

    LOGGER.trace("transform_snapshot(): start: ssType={} ssName={} dsId={} ", ssType, ssName,
        wrangledDsId);

    if (ssName == null || ssName.equals("")) {
      throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE,
          PrepMessageKey.MSG_DP_ALERT_INVALID_SNAPSHOT_NAME);
    }

    loadWrangledDataset(wrangledDsId);

    if (requestPost.getSsType() == PrSnapshot.SS_TYPE.STAGING_DB) {
      checkHiveNamingRule(wrangledDsId);
    }

    String dfId = dataset.getCreatorDfId();
    PrDataflow dataflow = dataflowRepository.findOne(dfId);

    // fill snapshot entity: common attributes - snapshot own
    snapshot.setSsName(ssName);
    snapshot.setSsType(ssType);
    snapshot.setStatus(PrSnapshot.STATUS.INITIALIZING);
    snapshot.setEngine(requestPost.getEngine());
    snapshot.setAppendMode(requestPost.getAppendMode());
    snapshot.setLaunchTime(DateTime.now(DateTimeZone.UTC));

    prepareTransformRules(dataset.getDsId());
    Map<String, Object> mapLineageInfo = new HashMap<>();
    mapLineageInfo.put("transformRules", dataset.getTransformRules());
    snapshot
        .setLineageInfo(GlobalObjectMapper.getDefaultMapper().writeValueAsString(mapLineageInfo));

    // fill snapshot entity: common attributes - info for wrangled dataset
    snapshot.setDfId(dfId);
    snapshot.setDfName(dataflow.getDfName());
    snapshot.setDsId(dataset.getDsId());
    snapshot.setDsName(dataset.getDsName());
    snapshot.setDsCreatedBy(dataset.getCreatedBy());
    snapshot.setDsCreatedTime(dataset.getCreatedTime());
    snapshot.setDsModifiedBy(dataset.getModifiedBy());
    snapshot.setDsModifiedTime(dataset.getModifiedTime());

    // fill snapshot entity: common attributes - info for origin dataset
    String origDsId = getFirstUpstreamDsId(dataset.getDsId());
    PrDataset origDataset = datasetRepository.findRealOne(datasetRepository.findOne(origDsId));
    snapshot.setOrigDsId(origDsId);
    snapshot.setOrigDsName(origDataset.getDsName());
    snapshot.setOrigDsCreatedBy(origDataset.getCreatedBy());
    snapshot.setOrigDsCreatedTime(origDataset.getCreatedTime());
    snapshot.setOrigDsModifiedBy(origDataset.getModifiedBy());
    snapshot.setOrigDsModifiedTime(origDataset.getModifiedTime());
    snapshot.setOrigDsImportType(origDataset.getImportType());
    snapshot.setOrigDsStoredUri(origDataset.getStoredUri());

    String dcId = origDataset.getDcId();
    if (dcId != null) { // If ImportType is not UPLOAD, the dataset has no connection
      snapshot.setOrigDsDcId(origDataset.getDcId());
      DataConnection origDsDc = connectionRepository.getOne(origDataset.getDcId());
      snapshot.setOrigDsDcImplementor(origDsDc.getImplementor());
      snapshot.setOrigDsDcName(origDsDc.getName());
      snapshot.setOrigDsDcDesc(origDsDc.getDescription());
      snapshot.setOrigDsDcType(origDsDc.getType());
      snapshot.setOrigDsDcHostname(origDsDc.getHostname());
      snapshot.setOrigDsDcPort(origDsDc.getPort());
      snapshot.setOrigDsDcUsername(origDsDc.getUsername());
      snapshot.setOrigDsDcUrl(origDsDc.getUrl());
    }

    snapshot.setOrigDsDbName(origDataset.getDbName());
    snapshot.setOrigDsTblName(origDataset.getTblName());
    snapshot.setOrigDsQueryStmt(origDataset.getQueryStmt());

    // fill snapshot entity: attributes per ssType
    switch (ssType) {
      case URI:
        String storedUri = requestPost.getStoredUri();
        if (storedUri == null) {
          throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_SNAPSHOT_DEST_URI_IS_NEEDED);
        }
        try {
          new URI(storedUri);
        } catch (URISyntaxException e) {
          throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_MALFORMED_URI_SYNTAX);
        }
        snapshot.setStoredUri(requestPost.getStoredUri());
        break;

      case DATABASE:    // TODO: not implemented yet (just coded in advance a little bit)
        snapshot.setOrigDsDcId(dataset.getDcId());
        DataConnection dataConnection = connectionRepository.getOne(origDataset.getDcId());
        snapshot.setDcImplementor(dataConnection.getImplementor());
        snapshot.setDcName(dataConnection.getName());
        snapshot.setDcDesc(dataConnection.getDescription());
        snapshot.setDcType(dataConnection.getType());
        snapshot.setDcHostname(dataConnection.getHostname());
        snapshot.setDcPort(dataConnection.getPort());
        snapshot.setDcUsername(dataConnection.getUsername());
        snapshot.setDcPassword(dataConnection.getPassword());
        snapshot.setDcUrl(dataConnection.getUrl());

        snapshot.setDbName(requestPost.getDbName());
        snapshot.setTblName(requestPost.getTblName());
        break;

      case STAGING_DB:
        snapshot.setDbName(requestPost.getDbName());
        snapshot.setTblName(requestPost.getTblName());
        snapshot.setHiveFileFormat(requestPost.getHiveFileFormat());
        snapshot.setHiveFileCompression(requestPost.getHiveFileCompression());
        snapshot.setPartitionColNames(requestPost.getJsonPartitionColNames());
        break;
      case DRUID:
        break;
      default:
        throw PrepException.create(PrepErrorCodes.PREP_SNAPSHOT_ERROR_CODE,
            PrepMessageKey.MSG_DP_ALERT_SNAPSHOT_TYPE_NOT_SUPPORTED_YET, ssType.name());
    }

    snapshotRepository.saveAndFlush(snapshot);

    if (requestPost.getSsType() == PrSnapshot.SS_TYPE.URI ||
        requestPost.getSsType() == PrSnapshot.SS_TYPE.STAGING_DB) {
      runTransformer(wrangledDsId, requestPost, snapshot.getSsId(), authorization);
      LOGGER.info("transform_snapshot(): snapshot generation successfully start");

      allFullDsIds = new ArrayList<>();   // for backward-compatability
    } else {
      throw new IllegalArgumentException(requestPost.toString());
    }

    snapshotRepository.saveAndFlush(snapshot);

    response = new PrepSnapshotResponse(snapshot.getSsId(), allFullDsIds, snapshot.getSsName());

    LOGGER.trace("transform_snapshot(): end");
    return response;
  }

  @Transactional(rollbackFor = Exception.class)
  public PrepTransformResponse fetch(String dsId, Integer stageIdx) throws IOException {
    PrepTransformResponse response;

    try {
      loadWrangledDataset(dsId);

      response = fetch_internal(dsId, stageIdx);
    } catch (CannotSerializeIntoJsonException e) {
      e.printStackTrace();
      throw PrepException.fromTeddyException(e);
    }

    response.setTransformRules(getRulesInOrder(dsId), false, false);
    response.setRuleCurIdx(stageIdx != null ? stageIdx : teddyImpl.getCurStageIdx(dsId));

    return response;
  }

  public PrepTransformResponse fetch_internal(String dsId, Integer stageIdx) {
    DataFrame gridResponse = teddyImpl.fetch(dsId, stageIdx);
    PrepTransformResponse response = new PrepTransformResponse(gridResponse);
    return response;
  }

  private static String getNewDsName(PrDataset importedDataset, PrDataflow dataflow, String dfId,
      String cloningDsName) {
    if (cloningDsName == null) {
      return importedDataset.getDsName().replaceFirst(
          " \\((EXCEL|CSV|JSON|STAGING|MYSQL|ORACLE|TIBERO|HIVE|POSTGRESQL|MSSQL|PRESTO)\\)$", "");
    }

    List<String> dsNames = new ArrayList();
    for (PrDataset dataset : dataflow.getDatasets()) {
      dsNames.add(dataset.getDsName());
    }

    for (int i = 1; /* NOP */ ; i++) {
      String newDsName = String.format("%s (%d)", cloningDsName, i);

      if (!dsNames.contains(newDsName)) {
        return newDsName;
      }

      assert i < 100000 : String.format("Too much duplication: cloningDsName=%s" + cloningDsName);
    }
  }

  private static PrDataset makeWrangledDataset(PrDataset importedDataset, PrDataflow dataflow,
      String dfId, String cloningDsName) {
    PrDataset wrangledDataset = new PrDataset();

    String newDsName = getNewDsName(importedDataset, dataflow, dfId, cloningDsName);
    wrangledDataset.setDsName(newDsName);
    wrangledDataset.setDsType(WRANGLED);
    wrangledDataset.setManualColumnCount(importedDataset.getManualColumnCount());
    wrangledDataset.setCreatorDfId(dfId);
    wrangledDataset.setCreatorDfName(dataflow.getDfName());
    wrangledDataset.setCreatedTime(DateTime.now());
    wrangledDataset.setModifiedTime(DateTime.now());
    wrangledDataset.setCreatedBy(dataflow.getCreatedBy());
    wrangledDataset.setModifiedBy(dataflow.getCreatedBy());

    return wrangledDataset;
  }

  public List<PrTransformRule> getRulesInOrder(String dsId) {
    List<PrTransformRule> rules = new ArrayList<>();

    for (PrTransformRule rule : transformRuleRepository.findAllByOrderByRuleNoAsc()) {
      if (rule.getDataset().getDsId().equals(dsId)) {
        rules.add(rule);
      }
    }
    return rules;
  }

  public String getFirstUpstreamDsId(String dsId) {
    for (PrTransformRule rule : transformRuleRepository.findAllByOrderByRuleNoAsc()) {
      if (rule.getDataset().getDsId().equals(dsId)) {
        String ruleString = rule.getRuleString();
        assert ruleString.startsWith("create") : ruleString;
        return transformRuleService.getUpstreamDsIdFromCreateRule(ruleString);
      }
    }
    return null;
  }

  private boolean onlyAppend(String dsId) throws JsonProcessingException {
    List<PrTransformRule> transformRules = getRulesInOrder(dsId);
    teddyImpl.reset(dsId);

    return (teddyImpl.getRevCnt(dsId) == transformRules.size());
  }

  public void putAddedInfo(PrepTransformResponse transformResponse, PrDataset wrangledDataset) {
    if (transformResponse != null && wrangledDataset != null) {
      transformResponse.setSampledRows(wrangledDataset.getTotalLines());
      transformResponse.setFullBytes(wrangledDataset.getTotalBytes()); // 아직 totalBytes 미구현
    }
  }

  private DataFrame createStage0(String wrangledDsId, PrDataset importedDataset)
      throws CannotSerializeIntoJsonException, JsonProcessingException {
    PrDataset wrangledDataset = datasetRepository
        .findRealOne(datasetRepository.findOne(wrangledDsId));
    DataFrame gridResponse;

    LOGGER.trace("createStage0: dsId={}", wrangledDsId);

    switch (importedDataset.getImportType()) {
      case UPLOAD:
      case URI:
        String storedUri = importedDataset.getStoredUri();
        LOGGER.debug(wrangledDsId + " storedUri=[" + storedUri + "]");

        if (importedDataset.getFileFormat() == PrDataset.FILE_FORMAT.CSV ||
            importedDataset.getFileFormat() == PrDataset.FILE_FORMAT.EXCEL ||
            importedDataset.getFileFormat() == PrDataset.FILE_FORMAT.JSON) {
          Integer columnCount = importedDataset.getManualColumnCount();
          gridResponse = teddyImpl
              .loadFileDataset(wrangledDsId, storedUri, importedDataset.getDelimiter(), columnCount,
                  wrangledDataset.getDsName());
        } else {
          throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_FILE_FORMAT_WRONG,
              "invalid flie type: createWrangledDataset\nimportedDataset: " + importedDataset
                  .toString());
          //throw new IllegalArgumentException("invalid flie type: createWrangledDataset\nimportedDataset: " + importedDataset.toString());
        }
        break;

      case DATABASE:
        String queryStmt = importedDataset.getQueryStmt().trim();
        if (queryStmt.charAt(queryStmt.length() - 1) == ';') {
          queryStmt = queryStmt.substring(0, queryStmt.length() - 1);
        }

        DataConnection dataConnection = this.connectionRepository.getOne(importedDataset.getDcId());
        Hibernate.initialize(dataConnection);
        if (dataConnection instanceof HibernateProxy) {
          dataConnection = (DataConnection) ((HibernateProxy) dataConnection)
              .getHibernateLazyInitializer().getImplementation();
        }

        gridResponse = teddyImpl
            .loadJdbcDataset(wrangledDsId, dataConnection, queryStmt, wrangledDataset.getDsName());
        break;

      case STAGING_DB:
        queryStmt = importedDataset.getQueryStmt().trim();
        if (queryStmt.charAt(queryStmt.length() - 1) == ';') {
          queryStmt = queryStmt.substring(0, queryStmt.length() - 1);
        }

        gridResponse = teddyImpl
            .loadStageDBDataset(wrangledDsId, queryStmt, wrangledDataset.getDsName());
        break;

      default:
        throw new IllegalArgumentException(
            "invalid import type: createWrangledDataset\nimportedDataset: " + importedDataset
                .toString());
    }

    wrangledDataset.setRuleCurIdx(0);

    assert gridResponse != null : wrangledDsId;
    wrangledDataset.setTotalLines((long) gridResponse.rows.size());

    String createRuleString = transformRuleService.getCreateRuleString(importedDataset.getDsId());
    teddyImpl.getCurDf(wrangledDsId).setRuleString(createRuleString);
    teddyImpl.getCurDf(wrangledDsId)
        .setJsonRuleString(transformRuleService.jsonizeRuleString(createRuleString));

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
  public Map<String, Object> getConfiguration(String wrangledDsId) {
    Map<String, Object> configuration = Maps.newHashMap();
    try {
      PrDataset wrangledDataset = datasetRepository.findOne(wrangledDsId);
      assert (null != wrangledDataset);
      DateTime launchTime = DateTime.now(DateTimeZone.UTC);
      String ssName = this.snapshotService
          .makeSnapshotName(wrangledDataset.getDsName(), launchTime);
      configuration.put("ss_name", ssName);

      if (prepProperties.isFileSnapshotEnabled()) {
        Map<String, Object> fileUri = Maps.newHashMap();

        // TODO: "LOCAL", "HDFS" will be replaced by location presets from application.yaml (later)
        String localDir = this.snapshotService
            .getSnapshotDir(prepProperties.getLocalBaseDir(), ssName);
        localDir = this.snapshotService.escapeUri(localDir);
        fileUri.put("LOCAL", "file://" + localDir);

        try {
          String hdfsDir = this.snapshotService
              .getSnapshotDir(prepProperties.getStagingBaseDir(true), ssName);
          hdfsDir = this.snapshotService.escapeUri(hdfsDir);
          fileUri.put("HDFS", hdfsDir);
        } catch (Exception e) {
          // MSG_DP_ALERT_STAGING_DIR_NOT_CONFIGURED is suppressed
        }
        configuration.put("file_uri", fileUri);
      }

      if (prepProperties.isSparkEngineEnabled()) {
        configuration.put("sparkEngineEnabled", true);
      }
    } catch (Exception e) {
      throw e;
    }
    return configuration;
  }

  public String cancelSnapshot(String ssId) {
    PrSnapshot.STATUS status = teddyExecutor.statusCheck(ssId);

    if (status == null) {
      return "NO_MATCHED_SNAPSHOT_ID";
    }

    switch (status) {
      case INITIALIZING:
      case WRITING:
      case TABLE_CREATING:
        snapshotService.updateSnapshotStatus(ssId, PrSnapshot.STATUS.CANCELED);
        return "OK";
      case RUNNING:
        snapshotService.updateSnapshotStatus(ssId, PrSnapshot.STATUS.CANCELED);
        List<Future<List<Row>>> jobs = teddyExecutor.getJob(ssId);
        if (jobs != null && !jobs.isEmpty()) {
          for (Future<List<Row>> job : jobs) {
            job.cancel(true);
          }
        }
        return "OK";
      case CANCELING:
      case CANCELED:
        return "THIS_SNAPSHOT_IS_ALREADY_CANCELED";
      case SUCCEEDED:
        snapshotService.deleteSnapshot(ssId);
        snapshotService.updateSnapshotStatus(ssId, PrSnapshot.STATUS.CANCELED);
        return "OK";
      case FAILED:
        snapshotService.updateSnapshotStatus(ssId, PrSnapshot.STATUS.CANCELED);
        return "OK";
      case NOT_AVAILABLE:
      default:
        return "UNKNOWN_ERROR";
    }
  }

  public List<ExprFunction> getFunctionList() {
    return PrepRuleChecker.getFunctionList();
  }
}
