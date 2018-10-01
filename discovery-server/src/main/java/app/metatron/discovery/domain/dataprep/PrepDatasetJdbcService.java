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
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.connection.DataConnection;
import app.metatron.discovery.domain.datasource.connection.DataConnectionRepository;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
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
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

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
public class PrepDatasetJdbcService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrepDatasetJdbcService.class);

    @Autowired
    PrepDatasetRepository datasetRepository;

    @Value("${server.port:8180}")
    private String restAPIserverPort;

    private String oauth_token;

    public void setoAuthToekn(String token){
        this.oauth_token=token;
    }

    public String getoAuthToekn(){
        return this.oauth_token;
    }

    ExecutorService poolExecutorService = null;
    Set<Future<Integer>> futures = null;

    public class PrepDatasetTotalLinesCallable implements Callable {
        PrepDatasetJdbcService datasetJdbcService;

        String dsId;
        String sql;
        String connectUrl;
        String username;
        String password;
        String databaseName;
        public PrepDatasetTotalLinesCallable(PrepDatasetJdbcService datasetJdbcService, String dsId, String sql, String connectUrl, String username, String password, String databaseName) {
            this.datasetJdbcService = datasetJdbcService;
            this.dsId = dsId;
            this.sql = sql;
            this.connectUrl = connectUrl;
            this.username = username;
            this.password = password;
            this.databaseName = databaseName;
        }

        @Transactional
        public Integer call() {
            Integer totalLines = 0;
            try {
                Connection conn = DriverManager.getConnection(connectUrl, username, password);
                if (conn != null) {
                    if (databaseName != null && false == databaseName.isEmpty()) {
                        conn.setCatalog(databaseName);
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
                this.datasetJdbcService.setTotalLines(dsId, totalLines);
            } catch (ObjectOptimisticLockingFailureException e) {
                e.printStackTrace();
            } catch(Exception e) {
                e.printStackTrace();
            }
            return totalLines;
        }
    }

    public PrepDatasetJdbcService() {
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

    DataFrame getPreviewLinesFromJdbcForDataFrame(PrepDataset dataset, String size) throws SQLException {

        DataFrame dataFrame = new DataFrame();

        try {
            int limitSize = Integer.parseInt(size);

            String dcId = dataset.getDcId();
            DataConnection connection = this.connectionRepository.findOne(dcId);

            String connectUrl = connection.getConnectUrl();
            String username = connection.getUsername();
            String password = connection.getPassword();
            String queryStmt = dataset.getQueryStmt();
            String tableName = dataset.getTableName();
            String databaseName = dataset.getCustomValue("databaseName");
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
                sql = "SELECT * FROM " + tableName + " LIMIT " + size;
            }

            Connection conn = DriverManager.getConnection(connectUrl, username, password);
            if (conn != null) {
                if(databaseName!=null && false==databaseName.isEmpty()) {
                    conn.setCatalog(databaseName);
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
//                dataset.setTotalLines(-1);    // FIXME: 이것을 설정하면 callable에서 하는 일과 lock이 겹침. 추후, callback으로 REST API를 쓰도록 수정하면 해결될 듯.
                dataset.setTotalBytes(-1L);

                JdbcUtils.closeResultSet(rs);
                JdbcUtils.closeStatement(statement);
                JdbcUtils.closeConnection(conn);

                Callable<Integer> callable = new PrepDatasetTotalLinesCallable(this, dataset.getDsId(), queryStmt, connectUrl, username, password, databaseName);
                poolExecutorService.submit(callable);
            }
        } catch (Exception e) {
            LOGGER.error("Failed to read JDBC : {}", e.getMessage());
            throw e;
        }

        return dataFrame;
    }

    Map<String, Object> getPreviewJdbc(String dcId, String queryStmt, String dbName, String tableName, String size) throws SQLException {

        Map<String, Object> responseMap = Maps.newHashMap();

        try {
            int limitSize = Integer.parseInt(size);

            List<Map<String, String>> resultSet = Lists.newArrayList();
            List<Field> fields = Lists.newArrayList();
            List<Map<String, String>> headers = Lists.newArrayList();

            DataConnection dataConnection = this.connectionRepository.findOne(dcId);
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
                sql = "SELECT * FROM " + dbName +"."+ tableName + " LIMIT " + size;
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
}

