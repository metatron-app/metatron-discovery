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

import app.metatron.discovery.domain.dataprep.PrepHdfsService;
import app.metatron.discovery.domain.dataprep.PrepProperties;
import app.metatron.discovery.domain.dataprep.csv.PrepCsvUtil;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.jdbc.PrepJdbcService;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.DataFrameService;
import app.metatron.discovery.domain.dataprep.teddy.Revision;
import app.metatron.discovery.domain.dataprep.teddy.RevisionSet;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.*;
import app.metatron.discovery.domain.datasource.connection.DataConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection;
import com.facebook.presto.jdbc.internal.guava.collect.Maps;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class TeddyImpl {
  private static Logger LOGGER = LoggerFactory.getLogger(TeddyImpl.class);

  Map<String, RevisionSet> revisionSetCache = Maps.newHashMap();

  @Autowired(required = false)
  PrepTransformService transformService;

  @Autowired(required = false)
  DataFrameService dataFrameService;

  @Autowired
  private PrepHdfsService hdfsService;

  @Autowired
  PrepProperties prepProperties;

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

  public int getCurStageCnt(String dsId) {
    RevisionSet rs = revisionSetCache.get(dsId);
    return rs.get().getCurStageCnt();
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

      try {
        nextDf = apply(newRev.get(-1), ruleString);   // apply trailing rules of the original revision into the new revision.
      } catch (Exception e) {
        nextDf = new DataFrame(newRev.get(-1));
        nextDf.setRuleString(ruleString);
        nextDf.setValid(false);
      }
      newRev.add(nextDf);
    }
  }

  // APPEND *AFTER* stageIdx
  public DataFrame append(String dsId, int stageIdx, String ruleString, boolean forced) {
    Revision rev = getCurRev(dsId);     // rule apply == revision generate, so always use the last one.
    Revision newRev = new Revision(rev, stageIdx + 1);
    DataFrame newDf = null;
    boolean suppressed = false;

    try {
      newDf = apply(rev.get(stageIdx), ruleString);
    } catch (TeddyException te) {
      if (forced == false) {
        throw PrepException.fromTeddyException(te);   // RuntimeException
      }
      suppressed = true;
      LOGGER.info("append(): TeddyException is suppressed: {}", te.getMessage());
    }

    if (suppressed) {
      newDf = new DataFrame(rev.get(stageIdx));
      newDf.setRuleString(ruleString);
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
    return apply(rev.get(stageIdx), ruleString);
  }

  public DataFrame fetch(String dsId, Integer stageIdx) {
    Revision rev = getCurRev(dsId);
    return rev.get(stageIdx); // if null, get curStage
  }

  private DataFrame apply(DataFrame df, String ruleString) throws TeddyException {
    List<DataFrame> slaveDfs = null;

    List<String> slaveDsIds = DataFrameService.getSlaveDsIds(ruleString);
    if (slaveDsIds != null) {
      slaveDfs = new ArrayList<>();

      for (String slaveDsId : slaveDsIds) {
        Revision slaveRev = getCurRev(slaveDsId);
        slaveDfs.add(slaveRev.get(-1));
      }
    }

    return dataFrameService.applyRule(df, ruleString, slaveDfs);
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

  public void update(String dsId, int stageIdx, String ruleString) throws TeddyException {    // used in DELETE only
    Revision rev = getCurRev(dsId);     // rule apply == revision generate, so always use the last one.
    Revision newRev = new Revision(rev, stageIdx);   // apply previous rules until the update target.

    // replace with the new, updated DF
    DataFrame newDf = apply(rev.get(stageIdx - 1), ruleString);
    newRev.add(newDf);

    appendNewDfs(newRev, rev, stageIdx + 1);

    newRev.saveSlaveDsNameMap(getSlaveDsNameMapOfRuleString(ruleString));   // APPEND, UPDATE have a new df

    addRev(dsId, newRev);
  }

  public DataFrame loadFileDataset(String dsId, String strUri, String delimiter, String dsName) {
    DataFrame df = new DataFrame(dsName);   // join, union등에서 dataset 이름을 제공하기위해 dsName 추가
    df.setByGrid(PrepCsvUtil.parse(strUri, delimiter, prepProperties.getSamplingLimitRows(), hdfsService.getConf()));

    return createStage0(dsId, df);
  }

  private DataFrame createStage0(String dsId, DataFrame df) {
    Revision rev = new Revision(df);
    RevisionSet rs = new RevisionSet(rev);
    revisionSetCache.put(dsId, rs);
    return df;
  }

  public DataFrame loadHiveDataset(String dsId, String sql, String dsName) throws PrepException {

    HiveConnection hiveConnection = new HiveConnection();

    hiveConnection.setHostname(prepProperties.getHiveHostname(true));
    hiveConnection.setPort(    prepProperties.getHivePort(true));
    hiveConnection.setUsername(prepProperties.getHiveUsername(true));
    hiveConnection.setPassword(prepProperties.getHivePassword(true));
    hiveConnection.setUrl(     prepProperties.getHiveCustomUrl(true));

    PrepJdbcService jdbcConnectionService = new PrepJdbcService();
    DataSource dataSource = jdbcConnectionService.getDataSource(hiveConnection, true);
    Statement stmt;

    try {
      stmt = dataSource.getConnection().createStatement();
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

  public DataFrame loadJdbcDataset(String dsId, DataConnection dataConnection, String dbName, String sql,
                                   String dsName) throws PrepException {
    PrepJdbcService jdbcConnectionService = new PrepJdbcService();
    JdbcDataConnection jdbcDataConnection;
    if( dataConnection instanceof JdbcDataConnection ) {
      jdbcDataConnection = (JdbcDataConnection) dataConnection;
    } else {
      jdbcDataConnection = jdbcConnectionService.makeJdbcDataConnection(dataConnection);
    }
    jdbcDataConnection.setDatabase(dbName);
    DataSource dataSource = jdbcConnectionService.getDataSource(jdbcDataConnection, true);
    Statement stmt = null;

    try {
      stmt = dataSource.getConnection().createStatement();
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

  public List<Boolean> getValids(String dsId) {
    List<Boolean> valids = new ArrayList<>();
    Revision rev = getCurRev(dsId);
    for (DataFrame df : rev.dfs) {
      valids.add(df.isValid());
    }
    return valids;
  }
}
