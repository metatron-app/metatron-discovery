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

package app.metatron.discovery.domain.dataprep;

import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.DataConnectionRepository;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.entity.PrDataset.RS_TYPE;
import app.metatron.discovery.domain.dataprep.jdbc.PrepJdbcService;
import app.metatron.discovery.domain.dataprep.repository.PrDatasetRepository;
import app.metatron.discovery.domain.dataprep.service.PrDatasetService;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.IllegalColumnNameExpressionException;
import app.metatron.discovery.domain.dataprep.transform.TeddyImpl;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import com.google.common.collect.Sets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;

@Service
public class PrepDatasetDatabaseService {

  private static Logger LOGGER = LoggerFactory.getLogger(PrepDatasetDatabaseService.class);

  @Autowired
  PrDatasetRepository datasetRepository;

  @Autowired
  PrDatasetService datasetService;

  @Autowired
  TeddyImpl teddyImpl;

  ExecutorService poolExecutorService = null;
  Set<Future<Integer>> futures = null;

  public class PrepDatasetTotalLinesCallable implements Callable {

    PrDatasetRepository datasetRepository;

    PrDataset dataset;

    String sql;
    String connectUrl;
    String username;
    String password;
    String dbName;

    public PrepDatasetTotalLinesCallable(PrDatasetRepository datasetRepository, PrDataset dataset,
        String sql, String connectUrl, String username, String password, String dbName) {
      this.datasetRepository = datasetRepository;
      this.dataset = dataset;
      this.sql = sql;
      this.connectUrl = connectUrl;
      this.username = username;
      this.password = password;
      this.dbName = dbName;
    }

    public Integer call() {
      Integer totalLines = 0;
      try {
        Thread.sleep(500);

        Connection conn = DriverManager.getConnection(connectUrl, username, password);
        if (conn != null) {
          if (dbName != null && false == dbName.isEmpty()) {
            conn.setCatalog(dbName);
          }

          Statement statement = conn.createStatement();
          ResultSet rs = statement.executeQuery("SELECT count(*) from (" + sql + ") AS query_stmt");
          while (rs.next()) {
            totalLines = rs.getInt(1);
            break;
          }

          JdbcUtils.closeResultSet(rs);
          JdbcUtils.closeStatement(statement);
          JdbcUtils.closeConnection(conn);
        }

        if (totalLines != null) {
          dataset.setTotalLines(totalLines.longValue());
          datasetRepository.saveAndFlush(dataset);
        }
      } catch (ObjectOptimisticLockingFailureException e) {
        e.printStackTrace();
      } catch (Exception e) {
        e.printStackTrace();
      }
      return totalLines;
    }
  }

  public PrepDatasetDatabaseService() {
    this.poolExecutorService = Executors.newCachedThreadPool();
    this.futures = Sets.newHashSet();
  }

  @Autowired(required = false)
  DataConnectionRepository connectionRepository;

  private void countTotalLines(PrDataset dataset, DataConnection dataConnection) {
    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(dataConnection);
    JdbcDialect dialect = jdbcDataAccessor.getDialect();

    String connectUrl = dialect.getConnectUrl(dataConnection);
    String username = dataConnection.getUsername();
    String password = dataConnection.getPassword();
    String queryStmt = dataset.getQueryStmt();
    String tblName = dataset.getTblName();
    String dbName = dataset.getDbName();

    dataset.setTotalLines(-1L);
    dataset.setTotalBytes(-1L);
    datasetRepository.saveAndFlush(dataset);

    Callable<Integer> callable = new PrepDatasetTotalLinesCallable(datasetRepository, dataset,
        queryStmt, connectUrl, username, password, dbName);
    this.futures.add(poolExecutorService.submit(callable));
  }

  public DataFrame getPreviewLinesFromJdbcForDataFrame(PrDataset dataset, String size) {
    DataFrame dataFrame;
    String dcId = dataset.getDcId();
    DataConnection dataConnection = this.datasetService.findRealDataConnection(this.connectionRepository.findOne(dcId));
    PrepJdbcService connectionService = new PrepJdbcService();

    if (dataConnection instanceof DataConnection == false) {
      dataConnection = connectionService.makeJdbcDataConnection(dataConnection);
    }

    int limit = Integer.parseInt(size);
    String sql = dataset.getRsType() == RS_TYPE.QUERY ? dataset.getQueryStmt() :
        String.format("SELECT * FROM %s.%s", dataset.getDbName(), dataset.getTblName());

    dataFrame = teddyImpl.loadJdbcDataFrame(dataConnection, sql, limit, null);

    countTotalLines(dataset, dataConnection);
    return dataFrame;
  }
}

