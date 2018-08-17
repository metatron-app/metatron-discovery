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
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.DataFrameService;
import app.metatron.discovery.domain.dataprep.teddy.Util;
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

  Map<String, List<DataFrame>> cache = Maps.newHashMap();

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

  public Map<String, List<DataFrame>> getCache() {
    return cache;
  }

  private List<DataFrame> getDfs(String dsId) throws PrepException {
    List<DataFrame> dfs = cache.get(dsId);
    if (dfs == null) {
      LOGGER.error("getDfs(): Dataset not found: dsId=" + dsId);
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_NO_DATASET);
    }
    return dfs;   // dataframe stages
  }

  public void checkNonAlphaNumericalColNames(String dsId) throws IllegalColumnNameForHiveException {
    DataFrame df = getLastDf(dsId);
    df.checkNonAlphaNumericalColNames();
  }

  public void deleteDfs(String dsId) throws PrepException {
    if (cache.containsKey(dsId)) {
      cache.remove(dsId);
    }
  }

  public DataFrame applyRule(String dsId, String ruleString, int srcIdx,
                             boolean needCollect, boolean justPreview) throws PrepException, TransformTimeoutException, TransformExecutionFailedException {
    List<DataFrame> dfs = getDfs(dsId);
    DataFrame df = dfs.get(srcIdx == -1 ? dfs.size() - 1 : srcIdx);   // -1을 주면 제일 끝의 것
    List<DataFrame> slaveDfs = new ArrayList<>();
    DataFrame newDf;

    LOGGER.trace("applyRule(): start");

    List<String> slaveDsIds = DataFrameService.getSlaveDsIds(ruleString);
    if (slaveDsIds != null) {
      for (String slaveDsId : slaveDsIds) {
        slaveDfs.add(getLastDf(slaveDsId));
      }
    }

    try {
      newDf = dataFrameService.applyRule(df, ruleString, slaveDfs, sampleRows, timeout);
    } catch (TeddyException e) {
      LOGGER.error("applyRule(): TeddyException occurred from dataFrameService.applyRule()", e);
      throw PrepException.fromTeddyException(e);
    }

    // join, union등에서 dataset의 이름을 누적으로 제공
    newDf.slaveDsNameMap.putAll(df.slaveDsNameMap);
    if (slaveDsIds != null) {
      for (String slaveDsId : slaveDsIds) {
        newDf.slaveDsNameMap.put(slaveDsId, getInitialDf(slaveDsId).dsName);
      }
    }

    if (justPreview == false) {
      dfs.add(newDf);
    }

    LOGGER.trace("applyRule(): end");
    return needCollect ? newDf : null;
  }

  private DataFrame getLastDf(String dsId) throws PrepException {
    return getDfAt(dsId, getDfs(dsId).size() - 1);
  }

  private DataFrame getInitialDf(String dsId) throws PrepException {
    return getDfAt(dsId, 0);
  }

  public DataFrame getDfAt(String dsId, int idx) throws PrepException {
    List<DataFrame> dfs = getDfs(dsId);
    DataFrame df;

    try {
      dfs = getDfs(dsId);
      df = dfs.get(idx);
    } catch (ArrayIndexOutOfBoundsException e) {
      LOGGER.error(String.format("getDfAt(): caught ArrayIndexOutOfBoundsException: dsId=%s dfs.size()=%d idx=%d",
                                 dsId, dfs.size(), idx));
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_OUT_OF_BOUND);
    }

    if (LOGGER.isDebugEnabled()) {
      df.show(20);
    }
    return df;
  }

  public DataFrame duplicateDf(String dsId, int idx) {
    DataFrame df = getDfAt(dsId, idx);
    List<DataFrame> dfs = getDfs(dsId);
    dfs.add(df);
    return df;
  }

  public void removeLastDf(String dsId) {
    List<DataFrame> dfs = getDfs(dsId);
    assert dfs.size() != 0 : dsId;
    dfs.remove(dfs.size() - 1);
  }

  public DataFrame loadFileDataset(String dsId, String targetUrl, String delimiter, String dsName) {
    DataFrame df = new DataFrame(dsName);   // join, union등에서 dataset 이름을 제공하기위해 dsName 추가
    df.setByGrid(Util.loadGridLocalCsv( targetUrl, delimiter, sampleRows, this.hdfsService.getConf(), null ), null);

    List<DataFrame> dfs = new ArrayList<>();
    dfs.add(df);
    cache.put(dsId, dfs);
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
      LOGGER.error("loadContentsByImportedHIVE(): JdbcTypeNotSupportedException occurred", e);
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_NOT_SUPPORTED_TYPE);
    } catch (JdbcQueryFailedException e) {
      LOGGER.error("loadContentsByImportedHIVE(): JdbcQueryFailedException occurred", e);
      throw PrepException.create(PrepErrorCodes.PREP_TEDDY_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_QUERY_FAILED);
    }

    List<DataFrame> dfs = new ArrayList<>();
    dfs.add(df);
    cache.put(dsId, dfs);
    return df;
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

    List<DataFrame> dfs = new ArrayList<>();
    dfs.add(df);
    cache.put(dsId, dfs);
    return df;
  }
}
