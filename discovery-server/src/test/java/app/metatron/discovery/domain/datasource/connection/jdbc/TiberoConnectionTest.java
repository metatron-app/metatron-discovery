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
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceUtils;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
public class TiberoConnectionTest {

  private JdbcConnectionService jdbcConnectionService = new JdbcConnectionService();


  @Test
  public void showTiberoTables() {
    TiberoConnection connection = getConnection();

    List<Map<String, String>> tableList = jdbcConnectionService.showTables(connection, "METATRON");
    System.out.println(tableList);
  }

  @Test
  public void showTiberoDatabases() {
    TiberoConnection connection = getConnection();

    List<String> dbList = jdbcConnectionService.showDatabases(connection, jdbcConnectionService.getDataSource(connection, true));
    System.out.println(dbList);
  }

  @Test
  public void showTiberoSchemas() {
    TiberoConnection connection = getConnection();

    List<String> dbList = jdbcConnectionService.showSchemas(connection, jdbcConnectionService.getDataSource(connection, true));
    System.out.println(dbList);
  }

  @Test
  public void searchTiberoSchemas() {
    TiberoConnection connection = getConnection();

    PageRequest pageRequest = new PageRequest(0, 2);
    String searchKeyword = "";

    Map<String, Object> databaseList = jdbcConnectionService.searchSchemas(connection, searchKeyword, pageRequest);
    System.out.println(databaseList);
  }

  @Test
  public void searchTiberoDatabases() {
    TiberoConnection connection = getConnection();

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";

    Map<String, Object> databaseList = jdbcConnectionService.searchDatabases(connection, searchKeyword, pageRequest);
    System.out.println(databaseList);
  }

  @Test
  public void searchTiberoTables() {
    TiberoConnection connection = getConnection();

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";
    String schema = "METATRON";

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
  public void showTableInfoTibero() {
    TiberoConnection connection = getConnection();

    String schemaName = "METATRON";
    String tableName = "PRODUCT"; //PRODUCT, SALESQA

    Map<String, Object> tableDescMap = jdbcConnectionService.showTableDescription(connection, schemaName, tableName);
    for(String key : tableDescMap.keySet()){
      System.out.println(key + " = " + tableDescMap.get(key));
    }
  }

  @Test
  public void showTableColumnTibero() {
    TiberoConnection connection = getConnection();
    String schemaName = "METATRON";
    String tableName = "META_SAMPLE_01"; //PRODUCT, SALESQA
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
  public void changeDatabase() {
    TiberoConnection connection = getConnection();

    String webSocketId = "test1";
    String database1 = "METATRON";
    String database2 = "TIBERO";

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
  
  private TiberoConnection getConnection(){
    TiberoConnection connection = new TiberoConnection();
    connection.setHostname("192.168.35.175");
    connection.setPort(8629);
    connection.setSid("tibero");
    connection.setUsername("metatron");
    connection.setPassword("metatron");
    return connection;
  }

}
