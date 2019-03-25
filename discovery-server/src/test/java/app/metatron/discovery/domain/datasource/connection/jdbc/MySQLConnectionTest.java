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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.supercsv.prefs.CsvPreference;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;

/**
 * Created by kyungtaak on 2016. 7. 2..
 */
public class MySQLConnectionTest extends AbstractIntegrationTest {

  @Autowired
  JdbcConnectionService jdbcConnectionService;

  private Pageable pageable = new PageRequest(0, 100);

  @Test
  public void showMySQLDatabases() {
    DataConnection connection = new DataConnection("MYSQL");
    connection.setHostname("localhost");
    connection.setPort(3306);
    //connection.setDatabase("polaris_datasources");
    connection.setUsername("polaris");
    connection.setPassword("polaris");

    System.out.println(jdbcConnectionService.getDatabases(connection, null, pageable));
  }

  @Test
  public void showTiberoDatabases() {
    DataConnection connection = new DataConnection("TIBERO");
    connection.setHostname("localhost");
    connection.setPort(3306);
    //connection.setDatabase("polaris_datasources");
    connection.setUsername("polaris");
    connection.setPassword("polaris");

    System.out.println(jdbcConnectionService.getDatabases(connection, null, pageable));
  }

  @Test
  public void showMySQLTables() {
    DataConnection connection = new DataConnection("MYSQL");
    connection.setHostname("localhost");
    //connection.setDatabase("polaris");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(3306);

    System.out.println(new JdbcConnectionService().getDatabases(connection, null, null));

  }

  @Test
  public void searchMysqlDatabases() {
    DataConnection connection = new DataConnection("MYSQL");
    connection.setHostname("localhost");
    //connection.setDatabase("sample");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(3306);

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "ME";

    Map<String, Object> databaseList = jdbcConnectionService.getDatabases(connection, searchKeyword, pageRequest);
    System.out.println(databaseList);
  }

  @Test
  public void searchMysqlTables() {
    DataConnection connection = new DataConnection("MYSQL");
    connection.setHostname("localhost");
//    connection.setDatabase("sample");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(3306);

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";
    String schema = "metatron";

    Map<String, Object> tableMap = jdbcConnectionService.getTables(connection, schema, searchKeyword, pageRequest);

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
  public void showTableInfoMySQL() {
    DataConnection connection = new DataConnection("MYSQL");
    connection.setHostname("localhost");
    //connection.setDatabase("sample");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(3306);

    String databaseName = "sample";
    String tableName = "sales";

    Map<String, Object> tableDescMap = jdbcConnectionService.showTableDescription(connection, databaseName, tableName);
    for(String key : tableDescMap.keySet()){
      System.out.println(key + " = " + tableDescMap.get(key));
    }
  }

  @Test
  public void showTableColumnMySQL() {
    DataConnection connection = new DataConnection("MYSQL");
    connection.setHostname("localhost");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(3306);

    String schemaName = "information_schema";
    String tableName = "FILES";
    String columnNamePattern = "TABLE";

    schemaName = "sample";
    tableName = "sales";
    columnNamePattern = "";
    PageRequest pageRequest = new PageRequest(0, 20);

    Map<String, Object> columnMaps = jdbcConnectionService.getTableColumns(connection, schemaName, tableName, columnNamePattern, pageRequest);
    List<Map> columnList = (List) columnMaps.get("columns");
    Map<String, Object> pageInfo = (Map) columnMaps.get("page");
    System.out.println("pageInfo = " + pageInfo);
    for(Map<String, Object> columnMap : columnList){
      System.out.println(columnMap);
    }

    columnMaps = jdbcConnectionService.getTableColumns(connection, null, tableName, columnNamePattern, pageRequest);
    columnList = (List) columnMaps.get("columns");
    pageInfo = (Map) columnMaps.get("page");
    System.out.println("pageInfo = " + pageInfo);
    for(Map<String, Object> columnMap : columnList){
      System.out.println(columnMap);
    }

  }

  @Test
  public void createCSVMySQL() throws IOException{
    DataConnection dataConnection = new DataConnection("MYSQL");
    dataConnection.setHostname("localhost");
    //dataConnection.setDatabase("sample");
    dataConnection.setUsername("polaris");
    dataConnection.setPassword("polaris");
    dataConnection.setPort(3306);

    String query = "select * from sales limit 5";
    String csvFilePath = "/tmp/temp_csv001.csv";

    Connection connection = DataConnectionHelper.getAccessor(dataConnection).getConnection();

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
  public void changeDatabase() {
    DataConnection connection = new DataConnection("MYSQL");
    connection.setHostname("localhost");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(3306);

    JdbcDialect dialect = DataConnectionHelper.lookupDialect(connection);

    String webSocketId = "test1";
    String database1 = "metatron";
    String database2 = "sample";

//    DataSource dataSource = WorkbenchDataSourceManager.createDataSourceInfo(connection, webSocketId, true).
//            getSingleConnectionDataSource();
//
//    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
//
//    jdbcConnectionService.changeDatabase(connection, database1, dataSource);
//
//    List<Map<String, Object>> tables1 = jdbcTemplate.queryForList(dialect.getTableNameQuery(connection, null, null));
//
//    jdbcConnectionService.changeDatabase(connection, database2, dataSource);
//
//    List<Map<String, Object>> tables2 = jdbcTemplate.queryForList(dialect.getTableNameQuery(connection, null, null));
//
//    System.out.println(tables1);
//    System.out.println(tables2);

  }

  @Test
  public void check() {
    System.out.println(jdbcConnectionService.checkConnection(getMySQLConnection()));

  }

  @Test
  public void checkTimeout() {
    DataConnection connection = new DataConnection("MYSQL");
    connection.setHostname("255.255.255.0");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(3306);

    System.out.println(jdbcConnectionService.checkConnection(connection));

  }

  public DataConnection getMySQLConnection(){
    DataConnection connection = new DataConnection();
    connection.setHostname("localhost");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(3306);
    connection.setImplementor("MYSQL");
    return connection;
  }
}
