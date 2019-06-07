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

import static app.metatron.discovery.domain.dataprep.entity.PrDataset.RS_TYPE.QUERY;

import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.DataConnectionRepository;
import app.metatron.discovery.domain.dataprep.csv.PrepCsvUtil;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.json.PrepJsonUtil;
import app.metatron.discovery.domain.dataprep.repository.PrDatasetRepository;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.storage.StorageProperties;
import app.metatron.discovery.domain.storage.StorageProperties.StageDBConnection;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.servlet.ServletOutputStream;
import org.apache.hive.jdbc.HiveConnection;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.stereotype.Service;

@Service
public class PrepDatasetStagingDbService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrepDatasetStagingDbService.class);

    private String hiveDefaultHDFSPath=null;

    @Autowired(required = false)
    PrepProperties prepProperties;

    @Autowired(required = false)
    StorageProperties storageProperties;

    @Autowired
    PrDatasetRepository datasetRepository;

    @Autowired
    JdbcConnectionService connectionService;

    ExecutorService poolExecutorService = null;
    Set<Future<Integer>> futures = null;

    public class PrepDatasetTotalLinesCallable implements Callable {
        PrDatasetRepository datasetRepository;

        PrDataset dataset;

        String sql;
        String connectUrl;
        String username;
        String password;
        String customUrl;
        String dbName;
        public PrepDatasetTotalLinesCallable(PrDatasetRepository datasetRepository, PrDataset dataset, String sql, String connectUrl, String username, String password, String customUrl, String dbName) {
            this.datasetRepository = datasetRepository;
            this.dataset = dataset;
            this.sql = sql;
            this.connectUrl = connectUrl;
            this.username = username;
            this.password = password;
            this.customUrl = customUrl;
            this.dbName = dbName;
        }

        public Integer call() {
            Integer totalLines = 0;
            try {
                Thread.sleep(500);

                Connection conn = null;
                if (customUrl != null) {
                    conn = DriverManager.getConnection(customUrl);
                } else {
                    conn = DriverManager.getConnection(connectUrl, username, password);
                }
                if (conn != null) {
                    Statement statement = conn.createStatement();
                    ResultSet rs = statement.executeQuery("SELECT count(*) from ("+sql+") AS query_stmt");
                    while( rs.next() ) {
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
            } catch(Exception e) {
                e.printStackTrace();
            }
            return totalLines;
        }
    }

    public PrepDatasetStagingDbService() {
        this.poolExecutorService = Executors.newCachedThreadPool();
        this.futures = Sets.newHashSet();
    }

    public String getHiveDefaultHDFSPath() {
        if(null==hiveDefaultHDFSPath && null!=prepProperties.getStagingBaseDir(false)) {
            hiveDefaultHDFSPath = prepProperties.getStagingBaseDir(false) + File.separator + PrepProperties.dirSnapshot;
        }
        return hiveDefaultHDFSPath;
    }

    @Autowired(required=false)
    DataConnectionRepository connectionRepository;

    public List<String> getQuerySchemas(PrepQueryRequest queryRequest) throws Exception {
        List<String> response;

        try {
            DataConnection jdbcDataConnection = queryRequest.getConnection();
            Map<String, Object> mapSchemas = connectionService.getDatabases(jdbcDataConnection, "", null);

            if(mapSchemas!=null) {
                Object databases = mapSchemas.get("databases");
                if(databases!=null) {
                    response = (List<String>) databases;
                } else {
                    Exception exception = new Exception("no schema");
                    throw exception;
                }
            } else {
                Exception exception = new Exception("searchSchemas() returns null");
                throw exception;
            }
        } catch (Exception e) {
          if (queryRequest.isConnectivityCheck()) {
              throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
          }
          LOGGER.error("Failed to getQuerySchemas : {}", e.getMessage());
          throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, e);
        }

        return response;
    }

    public List<String> getQueryTables(PrepQueryRequest queryRequest ) throws Exception {
        List<String> response = Lists.newArrayList();

        try {
            DataConnection jdbcDataConnection = queryRequest.getConnection();
            Map<String, Object> tableInfoMaps = connectionService.getTableNames(jdbcDataConnection, queryRequest.getSchema(), null);
            List<String> listTableNames = (List<String>) tableInfoMaps.get("tables");
            if(listTableNames!=null) {
                for(String tblName : listTableNames) {
                    if(tblName!=null && 0<tblName.length()) {
                        response.add(tblName);
                    }
                }
            } else {
                Exception exception = new Exception("searchTables() returns null");
                throw exception;
            }
        } catch (Exception e) {
            LOGGER.error("Failed to getQuerySchemas : {}", e.getMessage());
            throw e;
        }

        return response;
    }

    // FIXME: connectUrl에 명시된 server에 hiveserver2가 돌고 있어야 한다.
    public Map<String, Object> getPreviewStagedb(String queryStmt, String dbName, String tblName, String size) throws SQLException {

        Map<String, Object> responseMap = Maps.newHashMap();

        try {
            int limitSize = Integer.parseInt(size);

            if(dbName==null || dbName.isEmpty()) {
                dbName = "default";
            }

            List<Map<String, String>> resultSet = Lists.newArrayList();
            List<Field> fields = Lists.newArrayList();
            List<Map<String, String>> headers = Lists.newArrayList();

            validateStorageProperties(storageProperties);

            StageDBConnection stageDB = storageProperties.getStagedb();
            DataConnection stageDataConnection = new DataConnection();
            stageDataConnection.setHostname(    stageDB.getHostname());
            stageDataConnection.setPort(        stageDB.getPort());
            stageDataConnection.setUsername(    stageDB.getUsername());
            stageDataConnection.setPassword(    stageDB.getPassword());
            stageDataConnection.setUrl(         stageDB.getUrl());
            stageDataConnection.setDatabase(dbName);
            stageDataConnection.setImplementor("STAGE");

            String connectUrl = DataConnectionHelper.getConnectionUrl(stageDataConnection);
            String username = stageDataConnection.getUsername();
            String password = stageDataConnection.getPassword();
            String customUrl = stageDataConnection.getUrl();
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

            Connection connection = null;
            if (customUrl != null) {
                connection = DriverManager.getConnection(customUrl);
            } else {
                connection = DriverManager.getConnection(connectUrl, username, password);
            }
            if (connection != null && connection instanceof HiveConnection) {
                HiveConnection conn = (HiveConnection) connection;

                Statement statement = conn.createStatement();
                ResultSet rs = statement.executeQuery(sql);
                ResultSetMetaData resultSetMetaData = rs.getMetaData();
                int numberOfColumns = resultSetMetaData.getColumnCount();

                for (int i=0;i<numberOfColumns;i++) {
                    String typeName = resultSetMetaData.getColumnTypeName(i+1);
                    String columnName = resultSetMetaData.getColumnName(i+1);
                    if( true==columnName.contains(".") ) {
                        columnName = columnName.substring(columnName.lastIndexOf(".")+1);
                    }
                    Field field = new Field(columnName, null, Field.FieldRole.DIMENSION, Long.valueOf(i + 1));
                    field.setColumnType(DataConnectionHelper.lookupDialect(stageDataConnection), typeName);
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

    private static void validateStorageProperties(StorageProperties storageProperties) {
        if (storageProperties == null || storageProperties.getStagedb() == null) {
            throw new ResourceNotFoundException("Stage DB information required.");
        }
    }

    // FIXME: connectUrl에 명시된 server에 hiveserver2가 돌고 있어야 한다.
    public DataFrame getPreviewStagedbForDataFrame(String queryStmt, String dbName, String tblName, String size) throws SQLException {

        DataFrame dataFrame = new DataFrame();

        try {
            int limitSize = Integer.parseInt(size);

            if(dbName==null || dbName.isEmpty()) {
                dbName = "default";
            }

            validateStorageProperties(storageProperties);

            StageDBConnection stageDB = storageProperties.getStagedb();
            DataConnection stageDataConnection = new DataConnection();
            stageDataConnection.setHostname(    stageDB.getHostname());
            stageDataConnection.setPort(        stageDB.getPort());
            stageDataConnection.setUsername(    stageDB.getUsername());
            stageDataConnection.setPassword(    stageDB.getPassword());
            stageDataConnection.setUrl(         stageDB.getUrl());
            stageDataConnection.setDatabase(dbName);
            stageDataConnection.setImplementor("STAGE");

            String connectUrl = DataConnectionHelper.getConnectionUrl(stageDataConnection);
            String username = stageDataConnection.getUsername();
            String password = stageDataConnection.getPassword();
            String customUrl = stageDataConnection.getUrl();
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

            Connection connection;
            if (customUrl != null) {
                connection = DriverManager.getConnection(customUrl);
            } else {
                connection = DriverManager.getConnection(connectUrl, username, password);
            }
            if (connection != null && connection instanceof HiveConnection) {
                HiveConnection conn = (HiveConnection) connection;

                Statement statement = conn.createStatement();
                ResultSet rs = statement.executeQuery(sql);
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
                        // 현재 모두 String 처리중
                        row.add( dataFrame.getColName(i), value );
                    }
                    dataFrame.rows.add(readRows++,row);
                    if( limitSize < readRows ) { break; }
                }

                JdbcUtils.closeResultSet(rs);
                JdbcUtils.closeStatement(statement);
                JdbcUtils.closeConnection(conn);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to read hive : {}", e.getMessage());
            throw e;
        }

        return dataFrame;
    }

    // FIXME: connectUrl에 명시된 server에 hiveserver2가 돌고 있어야 한다.
    public DataFrame getPreviewLinesFromStagedbForDataFrame(PrDataset dataset, String size) throws SQLException, IOException {

        DataFrame dataFrame = new DataFrame();

        try {
            int limitSize = Integer.parseInt(size);

            String queryStmt = dataset.getQueryStmt();
            String tblName = dataset.getTblName();
            String dbName = dataset.getDbName();
            String sql = null;
            if(dataset.getRsType() == QUERY) {
                if(dbName==null || true==dbName.isEmpty()) {
                    dbName = "default";
                }
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
                }
            } else {
                sql = "SELECT * FROM " + tblName + " LIMIT " + size;
            }

            validateStorageProperties(storageProperties);

            StageDBConnection stageDB = storageProperties.getStagedb();
            DataConnection stageDataConnection = new DataConnection();
            stageDataConnection.setHostname(    stageDB.getHostname());
            stageDataConnection.setPort(        stageDB.getPort());
            stageDataConnection.setUsername(    stageDB.getUsername());
            stageDataConnection.setPassword(    stageDB.getPassword());
            stageDataConnection.setUrl(         stageDB.getUrl());
            stageDataConnection.setDatabase(dbName);
            stageDataConnection.setImplementor("STAGE");

            String connectUrl = DataConnectionHelper.getConnectionUrl(stageDataConnection);
            String username = stageDataConnection.getUsername();
            String password = stageDataConnection.getPassword();
            String customUrl = stageDataConnection.getUrl();

            Connection connection = null;
            if (customUrl != null) {
                connection = DriverManager.getConnection(customUrl);
            } else {
                connection = DriverManager.getConnection(connectUrl, username, password);
            }
            if (connection != null && connection instanceof HiveConnection) {
                HiveConnection conn = (HiveConnection) connection;

                Statement statement = conn.createStatement();
                ResultSet rs = statement.executeQuery(sql);
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
                dataset.setTotalLines(-1L);

                if(dataset.getRsType() == QUERY) {
                    dataset.setTotalBytes(-1L);
                } else {
                    String sql2 = "SHOW CREATE TABLE " + dbName + "." + tblName;
                    Statement statement2 = conn.createStatement();
                    ResultSet rs2 = statement.executeQuery(sql2);
                    StringBuilder sb = new StringBuilder("");
                    while (rs2.next()) {
                        sb.append(rs2.getString(1));
                        sb.append(" ");
                    }
                    String create_stmt = sb.toString();
                    String extTblPath = null;
                    String patternLocation = "^.*LOCATION\\p{Space}+\'([^']+)\'.*$";
                    Pattern pl = Pattern.compile(patternLocation);
                    Matcher ml = pl.matcher(create_stmt);
                    if (true == ml.matches()) {
                        extTblPath = ml.group(1);
                    }
                    if (null != extTblPath) {
                        Long totalBytes = getTotalBytesFromHdfs(extTblPath, dbName, tblName);
                        dataset.setTotalBytes(totalBytes);
                    }
                    JdbcUtils.closeResultSet(rs2);
                    JdbcUtils.closeStatement(statement2);
                }

                JdbcUtils.closeResultSet(rs);
                JdbcUtils.closeStatement(statement);
                JdbcUtils.closeConnection(conn);

                datasetRepository.saveAndFlush(dataset);

                Callable<Integer> callable = new PrepDatasetTotalLinesCallable(datasetRepository, dataset, queryStmt, connectUrl, username, password, customUrl, dbName);
                this.futures.add( poolExecutorService.submit(callable) );
            }
        } catch (SQLException e) {
            e.printStackTrace();
            LOGGER.error("SQLException while read from staging db : {}", e.getMessage());
            throw e;
        } catch (IOException e) {
            e.printStackTrace();
            LOGGER.error("IOException while read from staging db : {}", e.getMessage());
            throw e;
        }

        return dataFrame;
    }

    private Long getTotalBytesFromHdfs(String extTblPath, String dbName, String tblName) throws IOException {
        String cmd = "hdfs dfs -du -s " + extTblPath;
        Process p = Runtime.getRuntime().exec(cmd);

        BufferedReader stdInput = new BufferedReader(new
                InputStreamReader(p.getInputStream()));

        String line = stdInput.readLine();
        if (line == null) {
            throw new IOException(String.format("Cannot du HDFS: extTblPath=%s extHdfsDir=%s dbName=%s tblName=%s",
                    extTblPath, this.getHiveDefaultHDFSPath(), dbName, tblName ));
        }

        LOGGER.info("HDFS du result: cmd={} result_line={}", cmd, line);
        return Long.parseLong((line.split("\\s+"))[0]);
    }

    public void writeSnapshot(ServletOutputStream outputStream, String dbName, String sql, String fileType) throws PrepException {
        try {
            validateStorageProperties(storageProperties);

            StageDBConnection stageDB = storageProperties.getStagedb();
            DataConnection stageDataConnection = new DataConnection();
            stageDataConnection.setHostname(    stageDB.getHostname());
            stageDataConnection.setPort(        stageDB.getPort());
            stageDataConnection.setUsername(    stageDB.getUsername());
            stageDataConnection.setPassword(    stageDB.getPassword());
            stageDataConnection.setUrl(         stageDB.getUrl());
            stageDataConnection.setImplementor("STAGE");

            String connectUrl = DataConnectionHelper.getConnectionUrl(stageDataConnection);
            String username = stageDataConnection.getUsername();
            String password = stageDataConnection.getPassword();
            String customUrl = stageDataConnection.getUrl();

            Connection connection;
            if (customUrl != null) {
                connection = DriverManager.getConnection(customUrl);
            } else {
                connection = DriverManager.getConnection(connectUrl, username, password);
            }
            if (connection != null && connection instanceof HiveConnection) {
                HiveConnection conn = (HiveConnection) connection;
                Statement statement = conn.createStatement();
                ResultSet rs = statement.executeQuery(sql);

                if(fileType.equalsIgnoreCase("JSON")) {
                    PrepJsonUtil.writeHiveTableAsJSON(rs, outputStream, dbName);

                } else {
                    PrepCsvUtil.writeHiveTableAsCSV(rs, outputStream, dbName);
                }

                JdbcUtils.closeResultSet(rs);
                JdbcUtils.closeStatement(statement);
                JdbcUtils.closeConnection(conn);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to read hive : {}", e.getMessage());
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }
    }

    public void dropHiveSnapshotTable(String sql) throws PrepException {
        try {
            validateStorageProperties(storageProperties);

            StageDBConnection stageDB = storageProperties.getStagedb();
            DataConnection stageDataConnection = new DataConnection();
            stageDataConnection.setHostname(    stageDB.getHostname());
            stageDataConnection.setPort(        stageDB.getPort());
            stageDataConnection.setUsername(    stageDB.getUsername());
            stageDataConnection.setPassword(    stageDB.getPassword());
            stageDataConnection.setUrl(         stageDB.getUrl());
            stageDataConnection.setImplementor("STAGE");

            JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(stageDataConnection);
            jdbcDataAccessor.executeUpdate(jdbcDataAccessor.getConnection(), sql);
        } catch (Exception e) {
            LOGGER.error("Failed to drop hive table: {}", e.getMessage());
            throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
        }
    }
}

