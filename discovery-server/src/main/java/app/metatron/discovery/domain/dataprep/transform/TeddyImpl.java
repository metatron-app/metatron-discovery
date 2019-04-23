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

import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataprep.PrepProperties;
import app.metatron.discovery.domain.dataprep.PrepUtil;
import app.metatron.discovery.domain.dataprep.csv.PrepCsvUtil;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.json.PrepJsonUtil;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.DataFrameService;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.IllegalColumnNameForHiveException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.JdbcQueryFailedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.JdbcTypeNotSupportedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TransformExecutionFailedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TransformTimeoutException;
import app.metatron.discovery.domain.storage.StorageProperties;
import app.metatron.discovery.domain.storage.StorageProperties.StageDBConnection;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import com.facebook.presto.jdbc.internal.guava.collect.Maps;
import com.facebook.presto.jdbc.internal.joda.time.DateTime;
import com.facebook.presto.jdbc.internal.joda.time.format.DateTimeFormat;
import com.facebook.presto.jdbc.internal.joda.time.format.DateTimeFormatter;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.apache.commons.io.FilenameUtils;
import org.apache.hadoop.conf.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TeddyImpl {
  private static Logger LOGGER = LoggerFactory.getLogger(TeddyImpl.class);

  Map<String, RevisionSet> revisionSetCache = Maps.newHashMap();

  @Autowired(required = false)
  PrepTransformService transformService;

  @Autowired(required = false)
  DataFrameService dataFrameService;

  @Autowired
  PrepProperties prepProperties;

  @Autowired
  StorageProperties storageProperties;

  public void checkNonAlphaNumericalColNames(String dsId) throws IllegalColumnNameForHiveException {
    Revision rev = getCurRev(dsId);
    DataFrame df = rev.get(-1);
    df.checkAlphaNumericalColNames();
  }

  public void remove(String dsId) throws PrepException {
    if (revisionSetCache.containsKey(dsId)) {
      revisionSetCache.remove(dsId);
    }
  }

  // get revision
  private Revision getFirstRev(String dsId) {
    return revisionSetCache.get(dsId).get(0);
  }

  private Revision getCurRev(String dsId) {
    return revisionSetCache.get(dsId).get();
  }

  // add revision
  private void addRev(String dsId, Revision rev) {
    revisionSetCache.get(dsId).add(rev);
  }

  public int getCurRevIdx(String dsId) {
    return revisionSetCache.get(dsId).getCurRevIdx();
  }

  public int getCurStageIdx(String dsId) {
    RevisionSet rs = revisionSetCache.get(dsId);
    return rs.get().getCurStageIdx();
  }

  public int getRevCnt(String dsId) {
    return revisionSetCache.get(dsId).revs.size();
  }

  public DataFrame getCurDf(String dsId) {
    return getCurRev(dsId).get();
  }

  public void setCurStageIdx(String dsId, Integer dfIdx) {
    getCurRev(dsId).setCurStageIdx(dfIdx);
  }

  private Map<String, String> getSlaveDsNameMapOfRuleString(String ruleString) {
    Map<String, String> slaveDsNameMap = new HashMap();

    List<String> slaveDsIds = DataFrameService.getSlaveDsIds(ruleString);
    if (slaveDsIds != null) {
      for (String slaveDsId : slaveDsIds) {
        slaveDsNameMap.put(slaveDsId, getFirstRev(slaveDsId).get(0).dsName);
      }
    }

    return slaveDsNameMap;
  }

  private void appendNewDfs(Revision newRev, Revision rev, int startIdx) {
    for (int i = startIdx; i < rev.size(); i++) {
      DataFrame nextDf;
      String ruleString = rev.get(i).ruleString;
      String jsonRuleString = rev.get(i).jsonRuleString;

      try {
        nextDf = apply(newRev.get(-1), ruleString, jsonRuleString);   // apply trailing rules of the original revision into the new revision.
      } catch (Exception e) {
        nextDf = new DataFrame(newRev.get(-1));
        nextDf.setRuleString(ruleString);
        nextDf.setValid(false);
      }
      nextDf.setJsonRuleString(jsonRuleString);
      newRev.add(nextDf);
    }
  }

  // APPEND *AFTER* stageIdx
  public DataFrame append(String dsId, int stageIdx, String ruleString, String jsonRuleString, boolean suppress) {
    Revision rev = getCurRev(dsId);     // rule apply == revision generate, so always use the last one.
    Revision newRev = new Revision(rev, stageIdx + 1);
    DataFrame newDf = null;
    boolean suppressed = false;

    try {
      newDf = apply(rev.get(stageIdx), ruleString, jsonRuleString);
    } catch (TeddyException te) {
      if (suppress == false) {
        throw PrepException.fromTeddyException(te);   // RuntimeException
      }
      suppressed = true;
      LOGGER.info("append(): TeddyException is suppressed: {}", te.getMessage());
    }

    if (suppressed) {
      newDf = new DataFrame(rev.get(stageIdx));
      newDf.setRuleString(ruleString);
      newDf.setJsonRuleString(jsonRuleString);
      newDf.setValid(false);
    }

    newRev.add(newDf);  // this removes useless revisions

    appendNewDfs(newRev, rev, stageIdx + 1);

    newRev.saveSlaveDsNameMap(getSlaveDsNameMapOfRuleString(ruleString));   // APPEND, UPDATE have a new df
    newRev.setCurStageIdx(rev.getCurStageIdx() + 1);                        // APPEND's result grid is the new appended df

    addRev(dsId, newRev);
    return newDf;
  }

  public DataFrame preview(String dsId, int stageIdx, String ruleString) throws TeddyException {
    Revision rev = getCurRev(dsId);     // rule apply == revision generate, so always use the last one.
    return apply(rev.get(stageIdx), ruleString, null);
  }

  public DataFrame fetch(String dsId, Integer stageIdx) {
    Revision rev = getCurRev(dsId);
    return rev.get(stageIdx); // if null, get curStage
  }

  private DataFrame apply(DataFrame df, String ruleString, String jsonRuleString) throws TeddyException {
    List<DataFrame> slaveDfs = null;

    List<String> slaveDsIds = DataFrameService.getSlaveDsIds(ruleString);
    if (slaveDsIds != null) {
      slaveDfs = new ArrayList<>();

      for (String slaveDsId : slaveDsIds) {
        Revision slaveRev = getCurRev(slaveDsId);
        slaveDfs.add(slaveRev.get(-1));
      }
    }

    DataFrame newDf = dataFrameService.applyRule(df, ruleString, slaveDfs);
    newDf.setJsonRuleString(jsonRuleString);
    return newDf;
  }

  public DataFrame undo(String dsId) {
    RevisionSet rs = revisionSetCache.get(dsId);
    Revision rev = rs.undo();
    return rev.get();
  }

  public DataFrame redo(String dsId) {
    RevisionSet rs = revisionSetCache.get(dsId);
    Revision rev = rs.redo();
    return rev.get();
  }

  public void reset(String dsId) {
    revisionSetCache.get(dsId).reset();
  }

  public boolean isUndoable(String dsId) {
    return revisionSetCache.get(dsId).isUndoable();
  }

  public boolean isRedoable(String dsId) {
    return revisionSetCache.get(dsId).isRedoable();
  }

  public void delete(String dsId, int stageIdx) throws TransformExecutionFailedException, TransformTimeoutException {    // used in DELETE only
    Revision rev = getCurRev(dsId);     // rule apply == revision generate, so always use the last one.
    Revision newRev = new Revision(rev, stageIdx);   // apply previous rules until the delete target.

    appendNewDfs(newRev, rev, stageIdx + 1);

    addRev(dsId, newRev);
  }

  public void update(String dsId, int stageIdx, String ruleString, String jsonRuleString) throws TeddyException {    // used in DELETE only
    Revision rev = getCurRev(dsId);     // rule apply == revision generate, so always use the last one.
    Revision newRev = new Revision(rev, stageIdx);   // apply previous rules until the update target.

    // replace with the new, updated DF
    DataFrame newDf = apply(rev.get(stageIdx - 1), ruleString, jsonRuleString);
    newRev.add(newDf);
    newRev.setCurStageIdx(stageIdx);

    appendNewDfs(newRev, rev, stageIdx + 1);

    newRev.saveSlaveDsNameMap(getSlaveDsNameMapOfRuleString(ruleString));   // APPEND, UPDATE have a new df

    addRev(dsId, newRev);
  }

  public DataFrame loadFileDataset(String dsId, String strUri, String delimiter, Integer columnCount, String dsName) {
    DataFrame df = new DataFrame(dsName);   // join, union등에서 dataset 이름을 제공하기위해 dsName 추가
    Configuration hadoopConf = PrepUtil.getHadoopConf(prepProperties.getHadoopConfDir(false));
    int samplingRows = prepProperties.getSamplingLimitRows();

    String extensionType = FilenameUtils.getExtension(strUri);
    switch (extensionType) {
      case "json":
        df.setByGridWithJson(PrepJsonUtil.parseJson(strUri, samplingRows, columnCount, hadoopConf));
        break;
      default: // csv
        df.setByGrid(PrepCsvUtil.parse(strUri, delimiter, samplingRows, columnCount, hadoopConf));
    }

    return createStage0(dsId, df);
  }

  private DataFrame createStage0(String dsId, DataFrame df) {
    Revision rev = new Revision(df);
    RevisionSet rs = new RevisionSet(rev);
    revisionSetCache.put(dsId, rs);
    return df;
  }

  public DataFrame loadStageDBDataset(String dsId, String sql, String dsName) throws PrepException {

    DataConnection hiveConnection = new DataConnection();
    StageDBConnection stageDB = storageProperties.getStagedb();
    hiveConnection.setHostname(stageDB.getHostname());
    hiveConnection.setPort(    stageDB.getPort());
    hiveConnection.setUsername(stageDB.getUsername());
    hiveConnection.setPassword(stageDB.getPassword());
    hiveConnection.setUrl(     stageDB.getUrl());
    hiveConnection.setImplementor("HIVE");

    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(hiveConnection);
    Connection conn;
    Statement stmt;

    try {
      conn = jdbcDataAccessor.getConnection();
      stmt = conn.createStatement();
    } catch (SQLException e) {
      e.printStackTrace();
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, e);
    }

    DataFrame df = new DataFrame(dsName);   // join, union등에서 dataset 이름을 제공하기위해 dsName 추가

    try {
      df.setByJDBC(stmt, sql, prepProperties.getSamplingLimitRows());
    } catch (JdbcTypeNotSupportedException e) {
      LOGGER.error("loadHiveDataset(): JdbcTypeNotSupportedException occurred", e);
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_NOT_SUPPORTED_TYPE);
    } catch (JdbcQueryFailedException e) {
      LOGGER.error("loadHiveDataset(): JdbcQueryFailedException occurred", e);
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_QUERY_FAILED);
    }

    return createStage0(dsId, df);
  }

  public DataFrame loadJdbcDataset(String dsId, DataConnection jdbcDataConnection, String dbName, String sql,
                                   String dsName) throws PrepException {
    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(jdbcDataConnection);
    Connection conn;
    Statement stmt = null;

    try {
      conn = jdbcDataAccessor.getConnection();
      stmt = conn.createStatement();
    } catch (SQLException e) {
      e.printStackTrace();
    }

    DataFrame df = new DataFrame(dsName);   // join, union등에서 dataset 이름을 제공하기위해 dsName 추가

    try {
      df.setByJDBC(stmt, sql, prepProperties.getSamplingLimitRows());
    } catch (JdbcTypeNotSupportedException e) {
      LOGGER.error("loadContentsByImportedJdbc(): JdbcTypeNotSupportedException occurred", e);
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_NOT_SUPPORTED_TYPE);
    } catch (JdbcQueryFailedException e) {
      LOGGER.error("loadContentsByImportedJdbc(): JdbcQueryFailedException occurred", e);
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_QUERY_FAILED);
    }

    return createStage0(dsId, df);
  }

  public List<String> getRuleStrings(String dsId) {
    List<String> ruleStrings = new ArrayList<>();
    Revision rev = getCurRev(dsId);
    for (DataFrame df : rev.dfs) {
      ruleStrings.add(df.getRuleString());
    }
    return ruleStrings;
  }

  public List<String> getJsonRuleStrings(String dsId) {
    List<String> jsonRuleStrings = new ArrayList<>();
    Revision rev = getCurRev(dsId);
    for (DataFrame df : rev.dfs) {
      jsonRuleStrings.add(df.getJsonRuleString());
    }
    return jsonRuleStrings;
  }

  public List<Boolean> getValids(String dsId) {
    List<Boolean> valids = new ArrayList<>();
    Revision rev = getCurRev(dsId);
    for (DataFrame df : rev.dfs) {
      valids.add(df.isValid());
    }
    return valids;
  }

  private boolean looksLikeHeadered(DataFrame df) {
    if (df.rows.size() == 0) {
      return false;
    }

    Set<Object> strSet = new HashSet();
    for (int i = 0; i < df.getColCnt(); i++) {
      Object obj = df.rows.get(0).get(i);
      if (obj == null || !(obj instanceof String)) {
        return false;
      }

      if (strSet.contains(obj)) {
        return false;
      }
      strSet.add(obj);
    }

    return true;
  }

  // Get header and settype rule strings via inspecting 100 rows.
  public List<String> getAutoTypingRules(DataFrame df) throws TeddyException {
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
      guessColTypes(df, i, columnTypes, columnTypesRow0, timestampStyles);
    }

    //If all column types of row 0 elements is String and predicted column types is not all String.
    //Then add Header rule and change column name.
    if(Collections.frequency(columnTypesRow0, ColumnType.STRING) == df.colCnt &&
        Collections.frequency(columnTypes, ColumnType.STRING) != df.colCnt && looksLikeHeadered(df)) {
      String ruleString = "header rownum: 1";

      setTypeRules.add(ruleString);
      columnNames.clear();

      DataFrame newDf = dataFrameService.applyRule(df, ruleString);

      columnNames.addAll(newDf.colNames);
    }
    //Boolean, Long, Double 룰스트링 만들기.(Timestamp는 format 문제로 개별 추가)
    ruleStrings[0] = "settype col: ";
    ruleStrings[1] = "settype col: ";
    ruleStrings[2] = "settype col: ";

    //각 컬럼의 type에 따라 rulestring에 추가.
    for(int i = 0; i < df.colCnt; i++) {
      if(columnTypes.get(i) == ColumnType.BOOLEAN)
        ruleStrings[0] = ruleStrings[0] + "`" + columnNames.get(i) + "`, ";
      else if(columnTypes.get(i) == ColumnType.LONG)
        ruleStrings[1] = ruleStrings[1] + "`" + columnNames.get(i) + "`, ";
      else if(columnTypes.get(i) == ColumnType.DOUBLE)
        ruleStrings[2] = ruleStrings[2] + "`" + columnNames.get(i) + "`, ";
      else if(columnTypes.get(i) == ColumnType.TIMESTAMP)
        setTypeRules.add("settype col: `" + columnNames.get(i) + "` type: Timestamp format: '" + timestampStyles.get(i) + "'");
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

  // Guess column types via inspecting 100 rows.
  private void guessColTypes(DataFrame df, int colNo, List<ColumnType> columnTypes, List<ColumnType> columnTypesrow0, List<String> timestampStyles) {
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

  // Just apply rules to dataframe. No rule list
  public DataFrame applyAutoTyping(DataFrame df) throws TeddyException {
    if (!prepProperties.isAutoTypingEnabled()) {
      return df;
    }

    List<String> ruleStrings = getAutoTypingRules(df);
    for (String ruleString : ruleStrings) {
      df = dataFrameService.applyRule(df, ruleString);
    }

    return df;
  }
}
