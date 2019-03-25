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

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.dataconnection.DataConnection;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
public class PostgresqlConnectionTest {

  private JdbcConnectionService jdbcConnectionService = new JdbcConnectionService();

  private Pageable pageable = new PageRequest(0, 100);

  @Test
  public void showPostgresSchemas() {
    DataConnection connection = new DataConnection("POSTGRESQL");
    connection.setHostname("localhost");
    connection.setPort(5432);
    connection.setUsername("postgres");
    connection.setPassword("postgres");

    System.out.println(jdbcConnectionService.getDatabases(connection, null, pageable));

  }

  @Test
  public void searchPostgresSchemas() {
    DataConnection connection = new DataConnection("POSTGRESQL");
    connection.setHostname("localhost");
    connection.setPort(5432);
    connection.setUsername("metatron");
    connection.setPassword("metatron");

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";

    Map<String, Object> databaseList = jdbcConnectionService.getDatabases(connection, searchKeyword, pageRequest);
    System.out.println(databaseList);
  }

  @Test
  public void searchPostgresTables() {
    DataConnection connection = new DataConnection("POSTGRESQL");
    connection.setHostname("localhost");
    connection.setPort(5432);
    connection.setUsername("metatron");
    connection.setPassword("metatron");

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
  public void showTableColumnPostgresql() {
    DataConnection connection = new DataConnection("POSTGRESQL");
    connection.setHostname("localhost");
    connection.setPort(5432);
    connection.setUsername("metatron");
    connection.setPassword("metatron");

    PageRequest pageRequest = new PageRequest(0, 20);
    String schemaName = "metatron";
    String tableName = "sales";
    String columnNamePattern = "";

    Map<String, Object> columnMaps = jdbcConnectionService.getTableColumns(connection, schemaName, tableName, columnNamePattern, pageRequest);
    List<Map> columnList = (List) columnMaps.get("columns");
    Map<String, Object> pageInfo = (Map) columnMaps.get("page");
    System.out.println("pageInfo = " + pageInfo);
    for(Map<String, Object> columnMap : columnList){
      System.out.println(columnMap);
    }
  }

  @Test
  public void showTableInfoPostgresql() {
    DataConnection connection = new DataConnection("POSTGRESQL");
    connection.setHostname("localhost");
    connection.setPort(5432);
    connection.setUsername("metatron");
    connection.setPassword("metatron");

    String schemaName = "metatron";
    String tableName = "sales";

    Map<String, Object> tableDescMap = jdbcConnectionService.showTableDescription(connection, schemaName, tableName);
    for(String key : tableDescMap.keySet()){
      System.out.println(key + " = " + tableDescMap.get(key));
    }
  }

  @Test
  public void changeDatabase() {
    DataConnection connection = new DataConnection("POSTGRESQL");
    connection.setHostname("localhost");
    connection.setPort(5432);
    connection.setUsername("metatron");
    connection.setPassword("metatron");

    String webSocketId = "test1";
    String database1 = "metatron";
    String database2 = "test_schema";

//    DataSource dataSource = WorkbenchDataSourceManager.createDataSourceInfo(connection, webSocketId, true).
//            getSingleConnectionDataSource();
//
//    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
//
//    jdbcConnectionService.changeDatabase(connection, database1, dataSource);
//
//    List<Map<String, Object>> tables1 = jdbcTemplate.queryForList("select * from sales");
//
//    jdbcConnectionService.changeDatabase(connection, database2, dataSource);
//
//    List<Map<String, Object>> tables2 = jdbcTemplate.queryForList("select * from test_tb1");
//
//    System.out.println(tables1);
//    System.out.println(tables2);

  }

}
