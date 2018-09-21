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

import org.apache.commons.lang3.StringUtils;
import org.junit.Assert;
import org.junit.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceUtils;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
public class PrestoConnectionTest {

  private JdbcConnectionService jdbcConnectionService = new JdbcConnectionService();

  private Pageable pageable = new PageRequest(0, 100);

  @Test
  public void checkPrestoConnection() {
    PrestoConnection connection = new PrestoConnection();
    connection.setHostname("localhost");
    //    connection.setDatabase("polaris_datasources");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(8080);

    System.out.println(jdbcConnectionService.checkConnection(connection));

  }

  @Test
  public void showPrestoDatabases() {
    PrestoConnection connection = new PrestoConnection();
    connection.setHostname("localhost");
    connection.setPort(8080);
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");

    System.out.println(jdbcConnectionService.findDatabases(connection, pageable));
  }

  @Test
  public void showPrestoTables() {
    PrestoConnection connection = new PrestoConnection();
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(8080);

    System.out.println(jdbcConnectionService.findTablesInDatabase(connection, "default", pageable));

  }

  @Test
  public void searchPrestoTables() {
    PrestoConnection connection = new PrestoConnection();
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(8080);

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
  public void searchPrestoSchemas() {
    PrestoConnection connection = new PrestoConnection();
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(8080);

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";

    Map<String, Object> databaseList = jdbcConnectionService.searchSchemas(connection, searchKeyword, pageRequest);
    System.out.println(databaseList);
  }

  @Test
  public void showTableColumnPresto() {
    PrestoConnection connection = new PrestoConnection();
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(8080);

    PageRequest pageRequest = new PageRequest(0, 20);
    String schemaName = "col_test";
    String tableName = "aabldvcf283";
    String columnNamePattern = "";

    Map<String, Object> columnMaps = jdbcConnectionService.searchTableColumns(connection, schemaName, tableName, columnNamePattern, pageRequest);
    List<Map> columnList = (List) columnMaps.get("columns");
    Map<String, Object> pageInfo = (Map) columnMaps.get("page");
    System.out.println("pageInfo = " + pageInfo);
    for(Map<String, Object> columnMap : columnList){
      System.out.println(columnMap);
    }
  }

  @Test
  public void showTableInfoPresto() {
    PrestoConnection connection = new PrestoConnection();
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(8080);

    String schemaName = "default";
    String tableName = "sales";

    Map<String, Object> tableDescMap = jdbcConnectionService.showTableDescription(connection, schemaName, tableName);
    for(String key : tableDescMap.keySet()){
      System.out.println(key + " = " + tableDescMap.get(key));
    }
  }

  @Test
  public void changeDatabase() {
    PrestoConnection connection = new PrestoConnection();
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(8080);

    String webSocketId = "test1";
    String database1 = "default";
    String database2 = "test1";

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
  public void searchTableWithMetastoreInfo() {
    PrestoConnection connection = new PrestoConnection();
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(8080);
    connection.setMetastoreHost("localhost");
    connection.setMetastorePort("3306");
    connection.setMetastoreSchema("hivemeta");
    connection.setMetastoreUserName("hiveuser");
    connection.setMetastorePassword("hive1234");

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
  public void searchTableWithMetastoreInfo2() {
    PrestoConnection connection = new PrestoConnection();
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(8080);
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
}
