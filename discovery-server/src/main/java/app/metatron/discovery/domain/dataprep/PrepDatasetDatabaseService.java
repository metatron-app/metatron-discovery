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

import com.google.common.collect.Sets;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;

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

import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.DataConnectionRepository;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.jdbc.PrepJdbcService;
import app.metatron.discovery.domain.dataprep.repository.PrDatasetRepository;
import app.metatron.discovery.domain.dataprep.service.PrDatasetService;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;

@Service
public class PrepDatasetDatabaseService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrepDatasetDatabaseService.class);

    @Autowired
    PrDatasetRepository datasetRepository;

    @Autowired
    PrDatasetService datasetService;

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
        public PrepDatasetTotalLinesCallable( PrDatasetRepository datasetRepository, PrDataset dataset, String sql, String connectUrl, String username, String password, String dbName) {
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

                if(totalLines!=null) {
                    dataset.setTotalLines(totalLines.longValue());
                    datasetRepository.saveAndFlush(dataset);
                }
            } catch (ObjectOptimisticLockingFailureException e) {
                e.printStackTrace();
            } catch(Exception e) {
                e.printStackTrace();
            }
            return totalLines;
        }
    }

    public PrepDatasetDatabaseService() {
        this.poolExecutorService = Executors.newCachedThreadPool();
        this.futures = Sets.newHashSet();
    }

    @Autowired(required=false)
    DataConnectionRepository connectionRepository;

    public DataFrame getPreviewLinesFromJdbcForDataFrame(PrDataset dataset, String size) throws SQLException {

        DataFrame dataFrame = new DataFrame();

        try {
            int limitSize = Integer.parseInt(size);

            String dcId = dataset.getDcId();
            DataConnection connection = this.datasetService.findRealDataConnection(
                this.connectionRepository.findOne(dcId));

            PrepJdbcService jdbcConnectionService = new PrepJdbcService();
            DataConnection jdbcDataConnection;
            if( connection instanceof DataConnection ) {
                jdbcDataConnection = connection;
            } else {
                jdbcDataConnection = jdbcConnectionService.makeJdbcDataConnection(connection);
            }

            JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(jdbcDataConnection);
            JdbcDialect dialect = jdbcDataAccessor.getDialect();

            String connectUrl = dialect.getConnectUrl(jdbcDataConnection);
            String username = jdbcDataConnection.getUsername();
            String password = jdbcDataConnection.getPassword();
            String queryStmt = dataset.getQueryStmt();
            String tblName = dataset.getTblName();
            String dbName = dataset.getDbName();
            String sql = null;
            if(queryStmt!=null && false==queryStmt.isEmpty()) {
                String pattern0 = ".*\\s*;\\s*$";
                if(true==queryStmt.matches(pattern0)) {
                    queryStmt = queryStmt.substring(0,queryStmt.lastIndexOf(";"));
                }

                String pattern = ".*limit\\p{Space}+[0-9]+\\p{Space}*$";
                Pattern p = Pattern.compile(pattern);
                Matcher m = p.matcher(queryStmt.toLowerCase());
                if(true==m.matches()) {
                    sql = queryStmt;
                } else {
                    sql = queryStmt + " LIMIT " + size;
                }
            } else {
                sql = "SELECT * FROM " + tblName + " LIMIT " + size;
            }

            Connection conn = null;
            Statement stmt = null;

            try {
                conn = jdbcDataAccessor.getConnection(dbName, true);
                stmt = conn.createStatement();
            } catch (SQLException e) {
                e.printStackTrace();
            }

            ResultSet rs = stmt.executeQuery(sql);
            ResultSetMetaData resultSetMetaData = rs.getMetaData();
            int numberOfColumns = resultSetMetaData.getColumnCount();

            for (int i=0;i<numberOfColumns;i++) {
                String columnName = resultSetMetaData.getColumnName(i+1);
                if( true==columnName.contains(".") ) {
                    columnName = columnName.substring(columnName.lastIndexOf(".")+1);
                }

                ColumnType columnType = ColumnType.fromJdbcType( resultSetMetaData.getColumnType(i+1) );
                dataFrame.addColumn(columnName, columnType);
            }

            int readRows = 0;
            while (rs.next()) {
                app.metatron.discovery.domain.dataprep.teddy.Row row = new app.metatron.discovery.domain.dataprep.teddy.Row();
                for (int i=0;i<numberOfColumns;i++) {
                    Object value = rs.getObject(i+1);

                    if(dataFrame.getColType(i)==ColumnType.TIMESTAMP) {
                        DateTime jodaTime = new DateTime(value);
                        row.add(dataFrame.getColName(i), jodaTime);
                    } else {
                        // 모두 Object 그대로 들어감
                        row.add(dataFrame.getColName(i), value);
                    }
                }
                dataFrame.rows.add(readRows++,row);
                if( limitSize < readRows ) { break; }
            }

            JdbcUtils.closeResultSet(rs);
            JdbcUtils.closeStatement(stmt);

            dataset.setTotalLines(-1L);
            dataset.setTotalBytes(-1L);
            datasetRepository.saveAndFlush(dataset);

            Callable<Integer> callable = new PrepDatasetTotalLinesCallable(datasetRepository, dataset, queryStmt, connectUrl, username, password, dbName);
            this.futures.add( poolExecutorService.submit(callable) );
        } catch (Exception e) {
            LOGGER.error("Failed to read JDBC : {}", e.getMessage());
            throw e;
        }

        return dataFrame;
    }

    /*
    public Map<String, Object> getPreviewJdbc(String dcId, String queryStmt, String dbName, String tblName, String size) throws SQLException {

        Map<String, Object> responseMap = Maps.newHashMap();

        try {
            int limitSize = Integer.parseInt(size);

            List<Map<String, String>> resultSet = Lists.newArrayList();
            List<Field> fields = Lists.newArrayList();
            List<Map<String, String>> headers = Lists.newArrayList();

            DataConnection dataConnection = this.datasetService.findRealDataConnection(this.connectionRepository.findOne(dcId));
            String connectUrl = dataConnection.getConnectUrl();
            String username = dataConnection.getUsername();
            String password = dataConnection.getPassword();
            String sql = null;
            if(queryStmt!=null && false==queryStmt.isEmpty()) {
                // 자바 정규식 치환 문법 맞아도 오지게도 안먹힘. 그냥 substring으로 추출
                String pattern0 = ".*\\s*;\\s*$";
                if(true==queryStmt.matches(pattern0)) {
                    queryStmt = queryStmt.substring(0,queryStmt.lastIndexOf(";"));
                }

                String pattern = ".*limit\\p{Space}+[0-9]+\\p{Space}*$";
                Pattern p = Pattern.compile(pattern);
                Matcher m = p.matcher(queryStmt.toLowerCase());
                if(true==m.matches()) {
                    sql = queryStmt;
                } else {
                    sql = queryStmt + " LIMIT " + size;
                }
            } else {
                sql = "SELECT * FROM " + dbName +"."+ tblName + " LIMIT " + size;
            }

            Connection conn = DriverManager.getConnection(connectUrl, username, password);
            if (conn != null) {
                if(dbName!=null && false==dbName.isEmpty()) {
                    conn.setCatalog(dbName);
                }
                Statement statement = conn.createStatement();
                ResultSet rs = statement.executeQuery(sql);
                ResultSetMetaData resultSetMetaData = rs.getMetaData();
                int numberOfColumns = resultSetMetaData.getColumnCount();

                for (int i=0;i<numberOfColumns;i++) {
                    String columnName = resultSetMetaData.getColumnName(i+1);
                    if( true==columnName.contains(".") ) {
                        columnName = columnName.substring(columnName.lastIndexOf(".")+1);
                    }
                    Field field = new Field(columnName, DataType.UNKNOWN, Field.FieldRole.DIMENSION, Long.valueOf(i + 1));
                    fields.add(field);
                }

                while (rs.next()) {
                    Map<String, String> result = Maps.newHashMap();
                    for (int i=0;i<numberOfColumns;i++) {
                        Object value = rs.getObject(i+1);
                        // 현재 모두 String 처리중
                        result.put(fields.get(i).getName(), String.valueOf(value));
                    }
                    resultSet.add(result);
                }

                JdbcUtils.closeResultSet(rs);
                JdbcUtils.closeStatement(statement);
                JdbcUtils.closeConnection(conn);

                responseMap.put("success", true);
                responseMap.put("headers", headers);
                responseMap.put("fields", fields);

                int resultSetSize = resultSet.size();
                int endIndex = resultSetSize - limitSize < 0 ? resultSetSize : limitSize;

                responseMap.put("data", resultSet.subList(0, endIndex));
                responseMap.put("totalRows", endIndex);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to read hive : {}", e.getMessage());
            responseMap.put("success", false);
            responseMap.put("message", e.getMessage());
            throw e;
        }

        return responseMap;
    }
    */
}

