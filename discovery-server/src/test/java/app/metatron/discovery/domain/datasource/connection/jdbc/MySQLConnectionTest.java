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
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.supercsv.prefs.CsvPreference;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceUtils;

/**
 * Created by kyungtaak on 2016. 7. 2..
 */
public class MySQLConnectionTest {

  private JdbcConnectionService jdbcConnectionService = new JdbcConnectionService();

  private Pageable pageable = new PageRequest(0, 100);

  @Test
  public void showMySQLDatabases() {
    MySQLConnection connection = new MySQLConnection();
    connection.setHostname("localhost");
    connection.setPort(3306);
    //connection.setDatabase("polaris_datasources");
    connection.setUsername("polaris");
    connection.setPassword("polaris");

    System.out.println(jdbcConnectionService.findDatabases(connection, pageable));
  }

  @Test
  public void showMySQLTables() {
    MySQLConnection connection = new MySQLConnection();
    connection.setHostname("localhost");
    //connection.setDatabase("polaris");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(3306);

    System.out.println(new JdbcConnectionService().findDatabases(connection, null));

  }

  @Test
  public void searchMysqlDatabases() {
    MySQLConnection connection = new MySQLConnection();
    connection.setHostname("localhost");
    //connection.setDatabase("sample");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(3306);

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "ME";

    Map<String, Object> databaseList = jdbcConnectionService.searchDatabases(connection, searchKeyword, pageRequest);
    System.out.println(databaseList);
  }

  @Test
  public void searchMysqlTables() {
    MySQLConnection connection = new MySQLConnection();
    connection.setHostname("localhost");
//    connection.setDatabase("sample");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(3306);

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";
    String schema = "metatron";

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
  public void showTableInfoMySQL() {
    MySQLConnection connection = new MySQLConnection();
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
    MySQLConnection connection = new MySQLConnection();
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

    Map<String, Object> columnMaps = jdbcConnectionService.searchTableColumns(connection, schemaName, tableName, columnNamePattern, pageRequest);
    List<Map> columnList = (List) columnMaps.get("columns");
    Map<String, Object> pageInfo = (Map) columnMaps.get("page");
    System.out.println("pageInfo = " + pageInfo);
    for(Map<String, Object> columnMap : columnList){
      System.out.println(columnMap);
    }

  }

  @Test
  public void createCSVMySQL() throws IOException{
    MySQLConnection connection = new MySQLConnection();
    connection.setHostname("localhost");
    //connection.setDatabase("sample");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
//    connection.setPort(3306);

    String query = "select * from sales limit 5";
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
  public void changeDatabase() {
    MySQLConnection connection = new MySQLConnection();
    connection.setHostname("localhost");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(3306);

    String webSocketId = "test1";
    String database1 = "metatron";
    String database2 = "sample";

    DataSource dataSource = WorkbenchDataSourceUtils.createDataSourceInfo(connection, webSocketId, true).
            getSingleConnectionDataSource();

    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

    jdbcConnectionService.changeDatabase(connection, dataSource, database1);

    List<Map<String, Object>> tables1 = jdbcTemplate.queryForList(connection.getShowTableQuery(null));

    jdbcConnectionService.changeDatabase(connection, dataSource, database2);

    List<Map<String, Object>> tables2 = jdbcTemplate.queryForList(connection.getShowTableQuery(null));

    System.out.println(tables1);
    System.out.println(tables2);

  }

  @Test
  public void check() {
    MySQLConnection connection = new MySQLConnection();
    connection.setHostname("localhost");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(3306);

    System.out.println(jdbcConnectionService.checkConnection(connection));

  }

  @Test
  public void checkTimeout() {
    MySQLConnection connection = new MySQLConnection();
    connection.setHostname("255.255.255.0");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(3306);

    System.out.println(jdbcConnectionService.checkConnection(connection));

  }
}
