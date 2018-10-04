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
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.JdbcUtils;
import org.supercsv.prefs.CsvPreference;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import javax.sql.DataSource;

import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceUtils;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
public class HiveConnectionTest {

  private JdbcConnectionService jdbcConnectionService = new JdbcConnectionService();

  @Test
  public void checkHiveConnection() {
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    System.out.println(new JdbcConnectionService().checkConnection(connection));
  }

  @Test
  public void showHiveSchemas() {
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    //    //connection.setDatabase("default");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    DataSource dataSource = jdbcConnectionService.getDataSource(connection, true);
    System.out.println(jdbcConnectionService.showSchemas(connection, dataSource));
  }

  @Test
  public void showHiveTables() {
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    System.out.println(new JdbcConnectionService().showTables(connection, null));

  }

  @Test
  public void findTablesInDatabase() {
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    System.out.println(new JdbcConnectionService().findTablesInDatabase(connection, "default", null));

  }

  @Test
  public void searchHiveTables() {
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";
    String schema = "default";

    Map<String, Object> tableMap = jdbcConnectionService.searchTables(connection, schema, searchKeyword, pageRequest);
    List<Map<String, Object>> tableList = (List) tableMap.get("tables");
    Map<String, Object> pageInfo = (Map) tableMap.get("page");
    System.out.println("pageInfo = " + pageInfo);
    for(Map<String, Object> tableMapObj : tableList){
      System.out.println(tableMapObj);
      String tableName = (String) tableMapObj.get("name");
      Assert.assertTrue(StringUtils.containsIgnoreCase(tableName, searchKeyword));
    }
  }

  @Test
  public void searchHiveSchemas() {
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    //connection.setDatabase("default");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";

    Map<String, Object> databaseList = jdbcConnectionService.searchSchemas(connection, searchKeyword, pageRequest);
    System.out.println(databaseList);
  }

  @Test
  public void showTableColumnHive() throws SQLException{
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    String catalogName = "hive";
    String schemaName = "default";
    String tableName = "sales";
    String columnNamePattern = "";
    PageRequest pageRequest = new PageRequest(0, 20);

    Map<String, Object> columnMaps = jdbcConnectionService.searchTableColumns(connection, schemaName, tableName, columnNamePattern, pageRequest);
    List<Map> columnList = (List) columnMaps.get("columns");
    Map<String, Object> pageInfo = (Map) columnMaps.get("page");
    System.out.println("pageInfo = " + pageInfo);
    for(Map<String, Object> columnMap : columnList){
      System.out.println(columnMap);
    }
  }

  @Test
  public void showTableInfoHive() {
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    String schema = "default";
    String tableName = "sales";

    Map<String, Object> tableDescMap = jdbcConnectionService.showTableDescription(connection, schema, tableName);
    for(String key : tableDescMap.keySet()){
      System.out.println(key + " = " + tableDescMap.get(key));
    }
  }

  @Test
  public void createCSVHive() throws IOException{
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    String query = "select * from default.sales limit 10";
    String csvFilePath = "/tmp/temp_csv001.csv";

    DataSource dataSource = jdbcConnectionService.getDataSource(connection, true);

    JdbcCSVWriter jdbcCSVWriter = new JdbcCSVWriter(new FileWriter(csvFilePath), CsvPreference.STANDARD_PREFERENCE);
    jdbcCSVWriter.setConnection(connection);
    jdbcCSVWriter.setDataSource(dataSource);
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
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

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

    DataSource dataSource = jdbcConnectionService.getDataSource(connection, true);

    Statement stmt = null;
    try {
      stmt = dataSource.getConnection().createStatement();

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
      try{ JdbcUtils.closeConnection(dataSource.getConnection()); } catch(Exception e){}
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
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    String webSocketId = "test1";
    String database = "test1";

    DataSource dataSource = WorkbenchDataSourceUtils.createDataSourceInfo(connection, webSocketId, true).
                            getSingleConnectionDataSource();

    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

    List<Map<String, Object>> tables1 = jdbcTemplate.queryForList(connection.getShowTableQuery(null));

    jdbcConnectionService.changeDatabase(connection, dataSource, database);

    List<Map<String, Object>> tables2 = jdbcTemplate.queryForList(connection.getShowTableQuery(null));

    System.out.println(tables1);
    System.out.println(tables2);

  }

  @Test
  public void searchTableWithMetastoreInfo() {
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);
    connection.setMetastoreHost("localhost");
    connection.setMetastorePort("3306");
    connection.setMetastoreSchema("hivemeta");
    connection.setMetastoreUserName("hiveuser");
    connection.setMetastorePassword("hive1234");

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";
    String schema = "default";

    Map<String, Object> tableMap = jdbcConnectionService.searchTables(connection, schema, searchKeyword, pageRequest);
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
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);
    connection.setMetastoreHost("localhost");
    connection.setMetastorePort("3306");
    connection.setMetastoreSchema("metastore");
    connection.setMetastoreUserName("hiveuser");
    connection.setMetastorePassword("password");

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";
    String schema = "default";

    Map<String, Object> tableMap = jdbcConnectionService.searchTables(connection, schema, searchKeyword, pageRequest);
    List<Map<String, Object>> tableList = (List) tableMap.get("tables");
    Map<String, Object> pageInfo = (Map) tableMap.get("page");
    System.out.println("pageInfo = " + pageInfo);
    for(Map<String, Object> tableMapObj : tableList){
      System.out.println(tableMapObj);
      String tableName = (String) tableMapObj.get("name");
      Assert.assertTrue(StringUtils.containsIgnoreCase(tableName, searchKeyword));
    }

  }

  @Test
  public void runQuery(){

    String query = "select * from sales_test1";

    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);
    connection.setMetastoreHost("localhost");
    connection.setMetastorePort("3306");
    connection.setMetastoreSchema("metastore");
    connection.setMetastoreUserName("hiveuser");
    connection.setMetastorePassword("password");

    DataSource ds = jdbcConnectionService.getDataSource(connection, true);

    JdbcTemplate template = new JdbcTemplate(ds);


  }

}
