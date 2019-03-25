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

package app.metatron.discovery.domain.datasource.connection.jdbc;

import au.com.bytecode.opencsv.CSVReader;

import org.apache.commons.lang3.StringUtils;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.supercsv.prefs.CsvPreference;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import app.metatron.discovery.MetatronDiscoveryApplication;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.dialect.HiveDialect;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionErrorCodes;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = MetatronDiscoveryApplication.class)
@ActiveProfiles({"local", "h2-in-memory-db", "logging-console-debug", "spark-local-standalone", "initial"})
public class JdbcConnectionTest {

  @Autowired
  JdbcConnectionService jdbcConnectionService;

  static {
    System.out.println("==========JdbcConnectionTest static...");
//    System.setProperty("pf4j.mode", "deployment"); //deployment, development
    System.setProperty("pf4j.pluginsDir", "../discovery-distribution/plugins"); //deployment, development
  }

  @Test
  public void checkConnection() {
    Map checkResult = jdbcConnectionService.checkConnection(getConnection());
    System.out.println(checkResult);
    Assert.assertTrue((Boolean) checkResult.get("connected"));
  }

  @Test
  public void showDatabases() {
    Map<String, Object> databaseResult = jdbcConnectionService.getDatabases(getConnection(), null, null);
    System.out.println(databaseResult);

    List<String> databaseNames = (List<String>) databaseResult.get("databases");
    Assert.assertTrue(databaseNames.size() > 0);
  }

  @Test
  public void showTables() {
    System.out.println(jdbcConnectionService.getTableNames(getConnection(), null, null));
  }

  @Test
  public void findTablesInDatabase() {
    System.out.println(jdbcConnectionService.getTableNames(getConnection(), "hr", null));

  }

  @Test
  public void showTableColumn() throws SQLException{
    DataConnection connection = getConnection();

    String schemaName = "hr";
    String tableName = "JOBS";
    String columnNamePattern = "";
    PageRequest pageRequest = new PageRequest(0, 20);

    Map<String, Object> columnMaps = jdbcConnectionService.getTableColumns(connection, schemaName, tableName, columnNamePattern, pageRequest);
    List<Map> columnList = (List) columnMaps.get("columns");
    Map<String, Object> pageInfo = (Map) columnMaps.get("page");
    System.out.println("pageInfo = " + pageInfo);
    for(Map<String, Object> columnMap : columnList){
      System.out.println(columnMap);
    }
  }

  @Test
  public void showTableInfo() {
    DataConnection connection = getConnection();

    String schema = "hr";
    String tableName = "jobs";

    Map<String, Object> tableDescMap = jdbcConnectionService.showTableDescription(connection, schema, tableName);
    for(String key : tableDescMap.keySet()){
      System.out.println(key + " = " + tableDescMap.get(key));
    }
  }

  @Test
  public void createCSVHive() throws IOException{
    DataConnection dataConnection = new DataConnection("HIVE");
    dataConnection.setHostname("localhost");
    dataConnection.setUsername("hive");
    dataConnection.setPassword("hive");
    dataConnection.setPort(10000);

    String query = "select * from default.sales limit 10";
    String csvFilePath = "/tmp/temp_csv001.csv";

    JdbcAccessor jdbcAccessor = DataConnectionHelper.getAccessor(dataConnection);
    Connection connection = jdbcAccessor.getConnection(true);

    JdbcCSVWriter jdbcCSVWriter = new JdbcCSVWriter(new FileWriter(csvFilePath), CsvPreference.STANDARD_PREFERENCE);
    jdbcCSVWriter.setConnection(connection);
    jdbcCSVWriter.setQuery(query);
    jdbcCSVWriter.setFileName(csvFilePath);
    jdbcCSVWriter.write();

    CSVReader reader = new CSVReader(new FileReader(csvFilePath));
    String[] line;
    while ((line = reader.readNext()) != null) {
      for(String text : line){
        System.out.print(text);
      }
      System.out.println("");
    }
  }

  @Test
  public void createHiveTable() throws IOException{
    DataConnection dataConnection = new DataConnection("HIVE");
    dataConnection.setHostname("localhost");
    dataConnection.setUsername("hive");
    dataConnection.setPassword("hive");
    dataConnection.setPort(10000);

    List<String> querys = new ArrayList<>();
    querys.add("create schema col_test");
    querys.add("use col_test");
//    for(int i = 0; i < 3000; ++i){
//      String tableName = getRanTableName() + i;
//      String tableComment = getRanComment();
//      String col1Name = getRanTableName() + "1";
//      String col2Name = getRanTableName() + "2";
//      String col3Name = getRanTableName() + "3";
//      String col1Comment = getRanComment();
//      String col2Comment = getRanComment();
//      String col3Comment = getRanComment();
//      querys.add("CREATE TABLE " + tableName +" " +
//              "( " + col1Name +" STRING COMMENT '" + col1Comment + "'" +
//              ", " + col2Name + " STRING COMMENT '" + col2Comment + "'" +
//              ", " + col3Name + " STRING COMMENT '" + col3Comment + "' ) " +
//              "COMMENT '" + tableComment + "'");
//    }

    JdbcAccessor jdbcAccessor = DataConnectionHelper.getAccessor(dataConnection);

    Connection connection = null;
    Statement stmt = null;
    try {
      connection = jdbcAccessor.getConnection(true);
      stmt = connection.createStatement();

      // Set Fetch size
      stmt.setFetchSize(10000);
      for(String query : querys){
        stmt.execute(query);
      }
    } catch (SQLException e) {
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to query : " + e.getMessage());
    } finally {
      try{ JdbcUtils.closeStatement(stmt); } catch(Exception e){ }
      try{ JdbcUtils.closeConnection(connection); } catch(Exception e){}
    }
  }

  private String getRanTableName(){
    String[] strings = {"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"};
    String table = "";

    int length = 8;
    int min = 0;
    int max = strings.length - 1;
    for(int i = 0; i < length; ++i){
      int randomNum = ThreadLocalRandom.current().nextInt(min, max + 1);
      table = table + strings[randomNum];
    }
    return table;
  }

  private String getRanComment(){
    String[] strings = {"가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하"};
    String comment = "";

    int length = 8;
    int min = 0;
    int max = strings.length - 1;
    for(int i = 0; i < length; ++i){
      int randomNum = ThreadLocalRandom.current().nextInt(min, max + 1);
      comment = comment + strings[randomNum];
    }
    return comment;
  }

  @Test
  public void changeDatabase() {
    DataConnection connection = new DataConnection("HIVE");
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    JdbcDialect dialect = DataConnectionHelper.lookupDialect(connection);

    String webSocketId = "test1";
    String database = "test1";

//    DataSource dataSource = WorkbenchDataSourceManager.createDataSourceInfo(connection, webSocketId, true).
//                            getSingleConnectionDataSource();
//
//    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
//
//    List<Map<String, Object>> tables1 = jdbcTemplate.queryForList(dialect.getTableQuery(connection, null, null, null, null, null, null));
//
//    jdbcConnectionService.changeDatabase(connection, database, dataSource);
//
//    List<Map<String, Object>> tables2 = jdbcTemplate.queryForList(dialect.getTableQuery(connection, null, null, null, null, null, null));
//
//    System.out.println(tables1);
//    System.out.println(tables2);

  }

  @Test
  public void searchTableWithMetastoreInfo() {
    DataConnection connection = new DataConnection("HIVE");
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    Map<String, String> propMap = new HashMap<>();
    propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_HOST, "localhost");
    propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_PORT, "3306");
    propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_SCHEMA, "hivemeta");
    propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_USERNAME, "hiveuser");
    propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_PASSWORD, "hive1234");
    connection.setProperties(GlobalObjectMapper.writeValueAsString(propMap));

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";
    String schema = "default";

    Map<String, Object> tableMap = jdbcConnectionService.getTables(connection, schema, searchKeyword, pageRequest);
    List<String> tableList = (List) tableMap.get("tables");
    Map<String, Object> pageInfo = (Map) tableMap.get("page");
    System.out.println("pageInfo = " + pageInfo);
    for(String tableName : tableList){
      System.out.println(tableName);
      Assert.assertTrue(StringUtils.containsIgnoreCase(tableName, searchKeyword));
    }

  }

  @Test
  public void searchTableWithMetastoreInfo2() {
    DataConnection connection = new DataConnection("HIVE");
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    Map<String, String> propMap = new HashMap<>();
    propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_HOST, "localhost");
    propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_PORT, "3306");
    propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_SCHEMA, "metastore2");
    propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_USERNAME, "hiveuser");
    propMap.put(HiveDialect.PROPERTY_KEY_METASTORE_PASSWORD, "password");
    connection.setProperties(GlobalObjectMapper.writeValueAsString(propMap));

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";
    String schema = "default";

    Map<String, Object> tableMap = jdbcConnectionService.getTables(connection, schema, searchKeyword, pageRequest);
    List<Map<String, Object>> tableList = (List) tableMap.get("tables");
    Map<String, Object> pageInfo = (Map) tableMap.get("page");
    System.out.println("pageInfo = " + pageInfo);
    for (Map<String, Object> tableMapObj : tableList) {
      System.out.println(tableMapObj);
      String tableName = (String) tableMapObj.get("name");
      Assert.assertTrue(StringUtils.containsIgnoreCase(tableName, searchKeyword));
    }
  }

  @Test
  public void conInfoTest(){
    List<Object> specLists = new ArrayList<>();
    List<DataConnection> connectionLists = new ArrayList<>();
    connectionLists.add(new DataConnection("HIVE"));
    connectionLists.add(new DataConnection("MYSQL"));
    connectionLists.add(new DataConnection("PRESTO"));
    connectionLists.add(new DataConnection("POSTGRESQL"));
    connectionLists.add(new DataConnection("DRUID"));
    connectionLists.add(new DataConnection("TIBERO"));

    for(DataConnection dataConnection : connectionLists){
      Object conInfo = jdbcConnectionService.getConnectionInformation(dataConnection);
      specLists.add(conInfo);
    }

    System.out.println(GlobalObjectMapper.writeValueAsString(specLists));

  }

  public DataConnection getConnection(){
//    DataConnection connection = new DataConnection("HIVE");


    DataConnection connection = new DataConnection("ORACLE");
    connection.setHostname("localhost");
    connection.setUsername("hr");
    connection.setPassword("hr");
    connection.setPort(49161);
    connection.setSid("xe");
    return connection;
  }
}
