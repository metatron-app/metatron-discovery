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
public class MSSQLConnectionTest {

  private JdbcConnectionService jdbcConnectionService = new JdbcConnectionService();

  @Test
  public void searchMssqlSchema() {
    MssqlConnection connection = new MssqlConnection();
    connection.setHostname("metatron-poc-sql.database.windows.net");
    //connection.setDatabase("metatron-poc-sql");
    connection.setPort(1433);
    connection.setUsername("kyungtaak");
    connection.setPassword("imsi$$00");

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";

    Map<String, Object> databaseList = jdbcConnectionService.searchSchemas(connection, searchKeyword, pageRequest);
    System.out.println(databaseList);
  }

  @Test
  public void showMssqlTables() {
    MssqlConnection connection = new MssqlConnection();
    connection.setHostname("metatron-poc-sql.database.windows.net");
    connection.setPort(1433);
    //connection.setDatabase("metatron-poc-sql");
    connection.setUsername("kyungtaak");
    connection.setPassword("imsi$$00");

    String schema = "dbo";  //dbo, guest

    System.out.println(new JdbcConnectionService().showTables(connection, schema));

  }

  @Test
  public void searchMssqlTables() {
    MssqlConnection connection = new MssqlConnection();
    connection.setHostname("metatron-poc-sql.database.windows.net");
    connection.setPort(1433);
    //connection.setDatabase("metatron-poc-sql");
    connection.setUsername("kyungtaak");
    connection.setPassword("imsi$$00");

    PageRequest pageRequest = new PageRequest(0, 20);
    String schema = "dbo";  //dbo, guest
    String searchKeyword = "";

    Map<String, Object> tableList = jdbcConnectionService.searchTables(connection, schema, searchKeyword, pageRequest);
    System.out.println(tableList);
  }

  @Test
  public void showTableInfoMSSQL() {
    MssqlConnection connection = new MssqlConnection();
    connection.setHostname("metatron-poc-sql.database.windows.net");
    connection.setPort(1433);
    //connection.setDatabase("metatron-poc-sql");
    connection.setUsername("kyungtaak");
    connection.setPassword("imsi$$00");

    String schemaName = "guest";
    String tableName = "TEST"; //product, TbSample, userTbl

    Map<String, Object> tableDescMap = jdbcConnectionService.showTableDescription(connection, schemaName, tableName);
    for(String key : tableDescMap.keySet()){
      System.out.println(key + " = " + tableDescMap.get(key));
    }
  }

  @Test
  public void showTableColumnMSSQL() {
    MssqlConnection connection = new MssqlConnection();
    connection.setHostname("metatron-poc-sql.database.windows.net");
    connection.setPort(1433);
    //connection.setDatabase("metatron-poc-sql");
    connection.setUsername("kyungtaak");
    connection.setPassword("imsi$$00");

    String schemaName = "dbo";
    String tableName = "userTbl"; //product, TbSample, userTbl
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
    MssqlConnection connection = new MssqlConnection();
    connection.setHostname("metatron-poc-sql.database.windows.net");
    connection.setPort(1433);
    connection.setUsername("kyungtaak");
    connection.setPassword("imsi$$00");

    String webSocketId = "test1";
    String database = "dbo";

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
  public void check() {
    MssqlConnection connection = new MssqlConnection();
    connection.setHostname("metatron-poc-sql.database.windows.net");
    connection.setPort(1433);
    connection.setUsername("kyungtaak");
    connection.setPassword("imsi$$00");

    System.out.println(jdbcConnectionService.checkConnection(connection));

  }

  @Test
  public void checkTimeout() {
    MssqlConnection connection = new MssqlConnection();
    connection.setHostname("255.255.255.0");
    connection.setPort(1433);
    connection.setUsername("kyungtaak");
    connection.setPassword("imsi$$00");

    System.out.println(jdbcConnectionService.checkConnection(connection));

  }
}
