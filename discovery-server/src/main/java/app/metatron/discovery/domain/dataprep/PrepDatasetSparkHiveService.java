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

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.connection.DataConnectionRepository;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.StageDataConnection;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import org.apache.hive.jdbc.HiveConnection;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.ServletOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.sql.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PrepDatasetSparkHiveService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrepDatasetSparkHiveService.class);

    private String hiveDefaultHDFSPath=null;

    @Autowired(required = false)
    PrepProperties prepProperties;

    @Value("${server.port:8180}")
    private String restAPIserverPort;

    private String oauth_token;

    public void setoAuthToekn(String token){
        this.oauth_token=token;
    }

    public String getoAuthToekn(){
        return this.oauth_token;
    }

    @Autowired
    PrepDatasetRepository datasetRepository;

    @Autowired
    JdbcConnectionService connectionService;

    ExecutorService poolExecutorService = null;
    Set<Future<Integer>> futures = null;

    public class PrepDatasetTotalLinesCallable implements Callable {
        PrepDatasetSparkHiveService datasetSparkHiveService;

        String dsId;
        String sql;
        String connectUrl;
        String username;
        String password;
        String customUrl;
        String databaseName;
        public PrepDatasetTotalLinesCallable(PrepDatasetSparkHiveService datasetSparkHiveService, String dsId, String sql, String connectUrl, String username, String password, String customUrl, String databaseName) {
            this.datasetSparkHiveService = datasetSparkHiveService;
            this.dsId = dsId;
            this.sql = sql;
            this.connectUrl = connectUrl;
            this.username = username;
            this.password = password;
            this.customUrl = customUrl;
            this.databaseName = databaseName;
        }
        public Integer call() {
            Integer totalLines = 0;
            try {
                Connection conn = null;
                if (customUrl != null) {
                    DriverManager.getConnection(customUrl);
                } else {
                    DriverManager.getConnection(connectUrl, username, password);
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
                this.datasetSparkHiveService.setTotalLines(dsId,totalLines);
            } catch(Exception e) {
                e.printStackTrace();
            }
            return totalLines;
        }
    }

    public PrepDatasetSparkHiveService() {
        this.poolExecutorService = Executors.newCachedThreadPool();
        this.futures = Sets.newHashSet();
    }

    public void setTotalLines(String dsId, Integer totalLines) {
        URI snapshot_uri = UriComponentsBuilder.newInstance()
                .scheme("http")
                .host("localhost")
                .port(restAPIserverPort)
                .path("/api/preparationdatasets/")
                .path(dsId)
                .build().encode().toUri();

        LOGGER.info("setTotalLines(): REST URI=" + snapshot_uri);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("Accept", "application/json, text/plain, */*");
        headers.add("Authorization", oauth_token);


        HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
        RestTemplate restTemplate = new RestTemplate(requestFactory);

        Map<String, String> patchItems = new HashMap<>();
        patchItems.put("totalLines", totalLines.toString());

        LOGGER.info("setTotalLines(): update totalLines" + " as " + totalLines);

        HttpEntity<Map<String, String>> entity2 = new HttpEntity<>(patchItems, headers);
        ResponseEntity<String> responseEntity;
        responseEntity = restTemplate.exchange(snapshot_uri, HttpMethod.PATCH, entity2, String.class);

        LOGGER.info("setTotalLines(): done with statusCode " + responseEntity.getStatusCode());

        return;
    }

    public String getHiveDefaultHDFSPath() {
        if(null==hiveDefaultHDFSPath && null!=prepProperties.getStagingBaseDir(false)) {
            hiveDefaultHDFSPath = prepProperties.getStagingBaseDir(false) + File.separator + PrepProperties.dirSnapshot;
        }
        return hiveDefaultHDFSPath;
    }

    @Autowired(required=false)
    DataConnectionRepository connectionRepository;

    private void createHeaderRow(Sheet sheet) {
        sheet.shiftRows(0, sheet.getLastRowNum(), 1);

        Row row = sheet.createRow(0);
        for (int i = 0; i < sheet.getRow(1).getPhysicalNumberOfCells(); i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue("Field " + (i + 1));
        }
    }
    private Field makeField(int idx, String fieldKey, Cell dataCell) {
        DataType fieldType;
        Field.FieldRole fieldBIType;

        switch (dataCell.getCellType()) {
            case Cell.CELL_TYPE_STRING:
                fieldType = DataType.STRING;
                fieldBIType = Field.FieldRole.DIMENSION;
                break;
            case Cell.CELL_TYPE_NUMERIC:
                if (DateUtil.isCellDateFormatted(dataCell)) {
                    fieldType = DataType.TIMESTAMP;
                    fieldBIType = Field.FieldRole.TIMESTAMP;
                } else {
                    fieldType = DataType.DOUBLE;
                    fieldBIType = Field.FieldRole.MEASURE;
                }
                break;
            case Cell.CELL_TYPE_BOOLEAN:
                fieldType = DataType.BOOLEAN;
                fieldBIType = Field.FieldRole.DIMENSION;
                break;
            case Cell.CELL_TYPE_FORMULA:
            default:
                fieldType = DataType.STRING;
                fieldBIType = Field.FieldRole.DIMENSION;
        }

        return new Field(fieldKey, fieldType, fieldBIType, new Long(idx + 1));
    }

    private String getCellValue(Cell cell) {
        String v = null;

        switch (cell.getCellType()) {
            case Cell.CELL_TYPE_STRING:
                v = cell.getRichStringCellValue().getString();
                break;
            case Cell.CELL_TYPE_NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    v = new DateTime(cell.getDateCellValue().getTime()).toString();
                } else {
                    v = String.valueOf(cell.getNumericCellValue());
                }
                break;
            case Cell.CELL_TYPE_BOOLEAN:
                v = String.valueOf(cell.getBooleanCellValue());
                break;
            case Cell.CELL_TYPE_FORMULA:
                v = cell.getCellFormula();
                break;
            default:
        }
        return v;
    }

    List<String> getQuerySchemas(PrepQueryRequest queryRequest) throws Exception {
        List<String> response;

        try {
            JdbcDataConnection jdbcDataConnection = queryRequest.getConnection();
            Map<String, Object> mapSchemas = connectionService.searchSchemas(jdbcDataConnection,"",null);

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

    List<String> getQueryTables(PrepQueryRequest queryRequest ) throws Exception {
        List<String> response = Lists.newArrayList();

        try {
            JdbcDataConnection jdbcDataConnection = queryRequest.getConnection();
            List<Map<String, String>> listTableInfos = connectionService.showTables(jdbcDataConnection,queryRequest.getSchema());

            if(listTableInfos!=null) {
                for(Map<String,String> tableInfo : listTableInfos) {
                    String tableName = tableInfo.get("name");
                    if(tableName!=null && 0<tableName.length()) {
                        response.add(tableName);
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
    Map<String, Object> getPreviewStagedb(String queryStmt, String dbName, String tableName, String size) throws SQLException {

        Map<String, Object> responseMap = Maps.newHashMap();

        try {
            int limitSize = Integer.parseInt(size);

            if(dbName==null || dbName.isEmpty()) {
                dbName = "default";
            }

            List<Map<String, String>> resultSet = Lists.newArrayList();
            List<Field> fields = Lists.newArrayList();
            List<Map<String, String>> headers = Lists.newArrayList();

            StageDataConnection stageDataConnection = new StageDataConnection();
            stageDataConnection.setHostname(    prepProperties.getHiveHostname(true));
            stageDataConnection.setPort(        prepProperties.getHivePort(true));
            stageDataConnection.setUsername(    prepProperties.getHiveUsername(true));
            stageDataConnection.setPassword(    prepProperties.getHivePassword(true));
            stageDataConnection.setUrl(         prepProperties.getHiveCustomUrl(true));
            stageDataConnection.setMetastoreUrl(prepProperties.getHiveMetastoreUris(true));     // FIXME: metastore는 spark에서만 필요
            stageDataConnection.setDatabase(dbName);

            String connectUrl = stageDataConnection.getConnectUrl();
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
                sql = "SELECT * FROM " + dbName +"."+ tableName + " LIMIT " + size;
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
                    field.setColumnType(stageDataConnection,typeName);
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

    // FIXME: connectUrl에 명시된 server에 hiveserver2가 돌고 있어야 한다.
    DataFrame getPreviewStagedbForDataFrame(String queryStmt, String dbName, String tableName, String size) throws SQLException {

        DataFrame dataFrame = new DataFrame();

        try {
            int limitSize = Integer.parseInt(size);

            if(dbName==null || dbName.isEmpty()) {
                dbName = "default";
            }

            StageDataConnection stageDataConnection = new StageDataConnection();
            stageDataConnection.setHostname(    prepProperties.getHiveHostname(true));
            stageDataConnection.setPort(        prepProperties.getHivePort(true));
            stageDataConnection.setUsername(    prepProperties.getHiveUsername(true));
            stageDataConnection.setPassword(    prepProperties.getHivePassword(true));
            stageDataConnection.setUrl(         prepProperties.getHiveCustomUrl(true));
            stageDataConnection.setMetastoreUrl(prepProperties.getHiveMetastoreUris(true));     // FIXME: metastore는 spark에서만 필요
            stageDataConnection.setDatabase(dbName);

            String connectUrl = stageDataConnection.getConnectUrl();
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
                sql = "SELECT * FROM " + dbName +"."+ tableName + " LIMIT " + size;
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
    DataFrame getPreviewLinesFromStagedbForDataFrame(PrepDataset dataset, String size) throws Exception {

        DataFrame dataFrame = new DataFrame();

        try {
            int limitSize = Integer.parseInt(size);

            String queryStmt = dataset.getQueryStmt();
            String tableName = dataset.getTableName();
            String databaseName = dataset.getCustomValue("databaseName");
            String sql = null;
            if(dataset.getRsTypeEnum()== PrepDataset.RS_TYPE.SQL) {
                if(databaseName==null || true==databaseName.isEmpty()) {
                    databaseName = "default";
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
                sql = "SELECT * FROM " + tableName + " LIMIT " + size;
            }

            StageDataConnection stageDataConnection = new StageDataConnection();
            stageDataConnection.setHostname(    prepProperties.getHiveHostname(true));
            stageDataConnection.setPort(        prepProperties.getHivePort(true));
            stageDataConnection.setUsername(    prepProperties.getHiveUsername(true));
            stageDataConnection.setPassword(    prepProperties.getHivePassword(true));
            stageDataConnection.setUrl(         prepProperties.getHiveCustomUrl(true));
            stageDataConnection.setMetastoreUrl(prepProperties.getHiveMetastoreUris(true));     // FIXME: metastore는 spark에서만 필요
            stageDataConnection.setDatabase(databaseName);

            String connectUrl = stageDataConnection.getConnectUrl();
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
                dataset.setTotalLines(-1);

                if(dataset.getRsTypeEnum()== PrepDataset.RS_TYPE.SQL) {
                    dataset.setTotalBytes(-1L);
                } else {
                    String sql2 = "SHOW CREATE TABLE " + databaseName + "." + tableName;
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
                        Long totalBytes = getTotalBytesFromHdfs(extTblPath, databaseName, tableName);
                        dataset.setTotalBytes(totalBytes);
                    }
                    JdbcUtils.closeResultSet(rs2);
                    JdbcUtils.closeStatement(statement2);
                }

                JdbcUtils.closeResultSet(rs);
                JdbcUtils.closeStatement(statement);
                JdbcUtils.closeConnection(conn);

                Callable<Integer> callable = new PrepDatasetTotalLinesCallable(this, dataset.getDsId(), queryStmt, connectUrl, username, password, customUrl, databaseName);
                poolExecutorService.submit(callable);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to read hive : {}", e.getMessage());
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

        LOGGER.info("HDFS du result: cmd=%s result_line=%s", cmd, line);
        return Long.parseLong((line.split("\\s+"))[0]);
    }

    public void writeSnapshot(ServletOutputStream outputStream, String dbName, String sql ) throws PrepException {
        try {
            StageDataConnection stageDataConnection = new StageDataConnection();
            stageDataConnection.setHostname(    prepProperties.getHiveHostname(true));
            stageDataConnection.setPort(        prepProperties.getHivePort(true));
            stageDataConnection.setUsername(    prepProperties.getHiveUsername(true));
            stageDataConnection.setPassword(    prepProperties.getHivePassword(true));
            stageDataConnection.setUrl(         prepProperties.getHiveCustomUrl(true));
            stageDataConnection.setMetastoreUrl(prepProperties.getHiveMetastoreUris(true));     // FIXME: metastore는 spark에서만 필요

            String connectUrl = stageDataConnection.getConnectUrl();
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
                ResultSetMetaData rsmd = rs.getMetaData();
                int columnCount = rsmd.getColumnCount();
                StringBuffer sb = new StringBuffer();
                for(int columnIdx=1;columnIdx<=columnCount;columnIdx++) {
                    String colName = rsmd.getColumnName(columnIdx);
                    if(colName.startsWith(dbName+".")) {
                        colName = colName.substring(dbName.length()+1);
                    }
                    //int colType = rsmd.getColumnType(columnIdx);
                    if(1<columnIdx) {
                        sb.append(",");
                    }
                    sb.append(escapeCsvField(colName));
                }
                outputStream.write(sb.toString().getBytes());
                while(rs.next()) {
                    sb = new StringBuffer();
                    sb.append("\n");
                    for(int columnIdx=1;columnIdx<=columnCount;columnIdx++) {
                        String columnValue = rs.getString(columnIdx);
                        if(1<columnIdx) {
                            sb.append(",");
                        }
                        sb.append(escapeCsvField(columnValue));
                    }
                    outputStream.write(sb.toString().getBytes());
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

    public String escapeCsvField(String value) {
        if( value.contains("\"") || value.contains(",") ) {
            value.replaceAll("\"","\\\"");
            return "\"" + value + "\"";
        }
        return value;
    }

}

