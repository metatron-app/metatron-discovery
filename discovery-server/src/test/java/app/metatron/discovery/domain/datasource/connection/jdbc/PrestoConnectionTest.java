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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.dialect.HiveDialect;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
public class PrestoConnectionTest {

  private JdbcConnectionService jdbcConnectionService = new JdbcConnectionService();

  private Pageable pageable = new PageRequest(0, 100);

  @Test
  public void checkPrestoConnection() {
    DataConnection connection = new DataConnection("PRESTO");
    connection.setHostname("localhost");
    //    connection.setDatabase("polaris_datasources");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(8080);

    System.out.println(jdbcConnectionService.checkConnection(connection));

  }

  @Test
  public void showPrestoDatabases() {
    DataConnection connection = new DataConnection("PRESTO");
    connection.setHostname("localhost");
    connection.setPort(8080);
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    System.out.println(jdbcConnectionService.getDatabases(connection, null, pageable));
  }

  @Test
  public void showPrestoTables() {
    DataConnection connection = new DataConnection("PRESTO");
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("polaris");
    connection.setPassword("polaris");
    connection.setPort(8080);

    System.out.println(jdbcConnectionService.getTableNames(connection, "default", pageable));

  }

  @Test
  public void searchPrestoTables() {
    DataConnection connection = new DataConnection("PRESTO");
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(8080);

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";
    String schema = "default";

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
  public void searchPrestoSchemas() {
    DataConnection connection = new DataConnection("PRESTO");
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(8080);

    PageRequest pageRequest = new PageRequest(0, 20);
    String searchKeyword = "";

    Map<String, Object> databaseList = jdbcConnectionService.getDatabases(connection, searchKeyword, pageRequest);
    System.out.println(databaseList);
  }

  @Test
  public void showTableColumnPresto() {
    DataConnection connection = new DataConnection("PRESTO");
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(8080);

    PageRequest pageRequest = new PageRequest(0, 20);
    String schemaName = "col_test";
    String tableName = "aabldvcf283";
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
  public void showTableInfoPresto() {
    DataConnection connection = new DataConnection("PRESTO");
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
    DataConnection connection = new DataConnection("PRESTO");
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(8080);

    JdbcDialect dialect = DataConnectionHelper.lookupDialect(connection);

    String webSocketId = "test1";
    String database1 = "default";
    String database2 = "test1";

//    DataSource dataSource = WorkbenchDataSourceManager.createDataSourceInfo(connection, webSocketId, true).
//            getSingleConnectionDataSource();
//
//    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
//
//    jdbcConnectionService.changeDatabase(connection, database1, dataSource);
//    List<Map<String, Object>> tables1 = jdbcTemplate.queryForList(dialect.getTableQuery(connection, null, null, null, null, null, null));
//
//    jdbcConnectionService.changeDatabase(connection, database2, dataSource);
//
//    List<Map<String, Object>> tables2 = jdbcTemplate.queryForList(dialect.getTableQuery(connection, null, null, null, null, null, null));
//
//    System.out.println(tables1);
//    System.out.println(tables2);

  }

  @Test
  public void searchTableWithMetastoreInfo() {
    DataConnection connection = new DataConnection("PRESTO");
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(8080);

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
