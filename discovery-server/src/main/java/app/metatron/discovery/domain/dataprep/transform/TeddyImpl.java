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
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.jdbc.JdbcDataPrepService;
import app.metatron.discovery.domain.dataprep.teddy.*;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.*;
import app.metatron.discovery.domain.datasource.connection.DataConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection;
import com.facebook.presto.jdbc.internal.guava.collect.Maps;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
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

  @Value("${polaris.dataprep.sampling.rows:10000}")
  private int sampleRows;

  @Value("${polaris.dataprep.sampling.timeout:-1}")
  private int timeout;

  public void checkNonAlphaNumericalColNames(String dsId) throws IllegalColumnNameForHiveException {
    Revision rev = getCurRev(dsId);
    DataFrame df = rev.get(-1);
    df.checkNonAlphaNumericalColNames();
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

  public void setStageIdx(String dsId, Integer dfIdx) {
    getCurRev(dsId).setCurStageIdx(dfIdx);
  }

  public DataFrame append(String dsId, String ruleString) throws PrepException, TransformTimeoutException, TransformExecutionFailedException {
    Revision rev = getCurRev(dsId);     // rule apply == revision generate, so always use the last one.
    int lastIdx = rev.getCurStageIdx();
    Revision newRev = new Revision(rev, lastIdx + 1);   // then copies up to lastIdx
    DataFrame newDf = apply(rev.get(lastIdx), ruleString);
    newRev.add(newDf);  // this removes useless revisions
    for (int i = lastIdx + 1; i < rev.size(); i++) {
      newRev.add(apply(newRev.get(i), rev.get(i).ruleString));    // apply trailing rules of the original revision into the new revision.
    }
    newRev.setCurStageIdx(rev.getCurStageIdx() + 1);
    addRev(dsId, newRev);
    return newDf;
  }

  public DataFrame preview(String dsId, String ruleString) throws PrepException, TransformTimeoutException, TransformExecutionFailedException {
    Revision rev = getCurRev(dsId);     // rule apply == revision generate, so always use the last one.
    return apply(rev.get(), ruleString);
  }

  public DataFrame fetch(String dsId) {
    Revision rev = getCurRev(dsId);
    return rev.get();
  }

  private DataFrame apply(DataFrame df, String ruleString) throws PrepException, TransformTimeoutException, TransformExecutionFailedException {
    List<DataFrame> slaveDfs = new ArrayList<>();
    DataFrame newDf;

    List<String> slaveDsIds = DataFrameService.getSlaveDsIds(ruleString);
    if (slaveDsIds != null) {
      for (String slaveDsId : slaveDsIds) {
        Revision slaveRev = getCurRev(slaveDsId);
        slaveDfs.add(slaveRev.get(-1));
      }
    }

    try {
      newDf = dataFrameService.applyRule(df, ruleString, slaveDfs, sampleRows, timeout);
    } catch (TeddyException e) {
      LOGGER.error("apply(): TeddyException occurred from TeddyImpl.applyRule()", e);
      throw PrepException.fromTeddyException(e);
    }

    // join, union등에서 dataset의 이름을 누적으로 제공
    newDf.slaveDsNameMap.putAll(df.slaveDsNameMap);
    if (slaveDsIds != null) {
      for (String slaveDsId : slaveDsIds) {
        newDf.slaveDsNameMap.put(slaveDsId, getFirstRev(slaveDsId).get(0).dsName);
      }
    }

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

  public DataFrame delete(String dsId) throws TransformExecutionFailedException, TransformTimeoutException {    // used in DELETE only
    Revision rev = getCurRev(dsId);     // rule apply == revision generate, so always use the last one.
    int deleteTargetIdx = rev.getCurStageIdx();
    Revision newRev = new Revision(rev, deleteTargetIdx);   // apply previous rules until the delete target.

    for (int i = deleteTargetIdx + 1; i < rev.size(); i++) {
      newRev.add(apply(newRev.get(-1), rev.get(i).ruleString));    // apply trailing rules of the original revision into the new revision.
    }
    addRev(dsId, newRev);

    return newRev.get(Math.min(deleteTargetIdx, newRev.size() - 1));
  }

  public DataFrame update(String dsId, String ruleString) throws TransformExecutionFailedException, TransformTimeoutException {    // used in DELETE only
    Revision rev = getCurRev(dsId);     // rule apply == revision generate, so always use the last one.
    int updateTargetIdx = rev.getCurStageIdx();
    Revision newRev = new Revision(rev, updateTargetIdx);   // apply previous rules until the update target.

    // replace with the new, updated DF
    DataFrame newDf = apply(rev.get(updateTargetIdx - 1), ruleString);
    newRev.add(newDf);

    for (int i = updateTargetIdx + 1; i < rev.size(); i++) {
      newRev.add(apply(newRev.get(-1), rev.get(i).ruleString));    // apply trailing rules of the original revision into the new revision.
    }
    addRev(dsId, newRev);
    return newDf;
  }

  public DataFrame loadFileDataset(String dsId, String targetUrl, String delimiter, String dsName) {
    DataFrame df = new DataFrame(dsName);   // join, union등에서 dataset 이름을 제공하기위해 dsName 추가
    df.setByGrid(Util.loadGridLocalCsv( targetUrl, delimiter, sampleRows, this.hdfsService.getConf(), null ), null);

    return createStage0(dsId, df);
  }

  private DataFrame createStage0(String dsId, DataFrame df) {
    Revision rev = new Revision(df);
    RevisionSet rs = new RevisionSet(rev);
    revisionSetCache.put(dsId, rs);
    return df;
  }

  public DataFrame loadHiveDataset(String dsId, String sql, String dsName) throws PrepException {

    PrepProperties.HiveInfo hive = prepProperties.getHive();
    HiveConnection hiveConnection = new HiveConnection();

    hiveConnection.setHostname(hive.getHostname());
    hiveConnection.setPort(hive.getPort());
    hiveConnection.setUsername(hive.getUsername());
    hiveConnection.setPassword(hive.getPassword());
    hiveConnection.setUrl(hive.getCustomUrl());

    JdbcDataPrepService jdbcConnectionService = new JdbcDataPrepService();
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
      df.setByJDBC(stmt, sql, sampleRows);
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
    JdbcDataPrepService jdbcConnectionService = new JdbcDataPrepService();
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
      df.setByJDBC(stmt, sql, sampleRows);
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
}
