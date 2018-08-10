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

import org.apache.hadoop.hive.conf.HiveConf;
import org.apache.hadoop.hive.metastore.HiveMetaStoreClient;
import org.apache.hadoop.hive.metastore.api.FieldSchema;
import org.apache.hadoop.hive.metastore.api.MetaException;
import org.apache.thrift.TException;
import org.junit.Test;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
public class HiveMetaStoreConnectionTest {

  private JdbcConnectionService jdbcConnectionService = new JdbcConnectionService();

  @Test
  public void initialTest() throws Exception{
    HiveConnection connection = new HiveConnection();
    connection.setHostname("metatron-poc-h04");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    DataSource dataSource = jdbcConnectionService.getDataSource(connection, true);
    HiveMetaStoreJdbcClient metaStoreJdbcClient = new HiveMetaStoreJdbcClient(dataSource);
  }

  @Test
  public void showTableViaJDBC() {
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    DataSource dataSource = jdbcConnectionService.getDataSource(connection, true);

    HiveMetaStoreJdbcClient metaStoreJdbcClient = new HiveMetaStoreJdbcClient(dataSource);

    String dbName = "col_test";
    String tableNamePattern = "";
    String columnNamePattern = "";
    PageRequest pageRequest = new PageRequest(0, 20);

    List<Map<String, Object>> tables = metaStoreJdbcClient.getTable(dbName, tableNamePattern, columnNamePattern, pageRequest);

    System.out.println("size = " + tables.size());
    System.out.println(tables);
  }

  @Test
  public void searchTableViaJDBC() {
    HiveConnection connection = new HiveConnection();
    connection.setHostname("metatron-poc-h04");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    DataSource dataSource = jdbcConnectionService.getDataSource(connection, true);

    HiveMetaStoreJdbcClient metaStoreJdbcClient = new HiveMetaStoreJdbcClient(dataSource);

    String dbName = "default";
    String tableNamePattern = "";
    String columnNamePattern = "";
    PageRequest pageRequest = new PageRequest(0, 20);

    long tableCount = metaStoreJdbcClient.getTableCount(dbName, tableNamePattern, columnNamePattern);
    List<Map<String, Object>> tables = metaStoreJdbcClient.getTable(dbName, tableNamePattern, columnNamePattern, pageRequest);

    System.out.println("tableCount = " + tableCount);
    System.out.println("size = " + tables.size());
    System.out.println(tables);
  }

  @Test
  public void getColumnViaJDBC() {
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    DataSource dataSource = jdbcConnectionService.getDataSource(connection, true);

    HiveMetaStoreJdbcClient metaStoreJdbcClient = new HiveMetaStoreJdbcClient(dataSource);

    String dbName = "col_test";
    String tableName = "abvzpuzf2574";
    String columnNamePattern = "f";

    List<Map<String, Object>> columns = metaStoreJdbcClient.getColumns(dbName, tableName, columnNamePattern);

    System.out.println("size = " + columns.size());
    System.out.println(columns);
  }

  @Test
  public void hiveMetaStoreClientTest() throws MetaException{
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    HiveMetaStoreClient hiveMetaStoreClient = getHiveMetaStoreClient(connection.getHostname(), "9083");
    List<String> dbs = hiveMetaStoreClient.getAllDatabases();
    System.out.println(dbs);
  }

  @Test
  public void getDatabaseViaThrift() throws MetaException{
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    String dbNamePattern = "*";

    HiveMetaStoreClient hiveMetaStoreClient = getHiveMetaStoreClient(connection.getHostname(), "9083");
    List<String> dbs = hiveMetaStoreClient.getDatabases(dbNamePattern);
    System.out.println(dbs);
  }

  @Test
  public void getTableViaThrift() throws MetaException{
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    String dbName = "col_test";
    String tableNamePattern = "*a*";
    HiveMetaStoreClient hiveMetaStoreClient = getHiveMetaStoreClient(connection.getHostname(), "9083");
    List<String> tables = hiveMetaStoreClient.getTables(dbName, tableNamePattern);
    System.out.println(tables);
  }

  @Test
  public void getSchemaViaThrift() throws TException{
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    String dbName = "col_test";
    String tableName = "aacglmae1138";

    HiveMetaStoreClient hiveMetaStoreClient = getHiveMetaStoreClient(connection.getHostname(), "9083");
    List<FieldSchema> schemas = hiveMetaStoreClient.getSchema(dbName, tableName);
    System.out.println(schemas);
  }

  @Test
  public void getFieldViaThrift() throws TException{
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    String dbName = "col_test";
    String tableName = "aacglmae1138";

    HiveMetaStoreClient hiveMetaStoreClient = getHiveMetaStoreClient(connection.getHostname(), "9083");
    List<FieldSchema> schemas = hiveMetaStoreClient.getFields(dbName, tableName);
    System.out.println(schemas);
  }

  @Test
  public void getPartitionsViaThrift() throws TException{
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    String dbName = "col_test";
    String tableName = "aacglmae1138";
    short sf = 123;
    HiveMetaStoreClient hiveMetaStoreClient = getHiveMetaStoreClient(connection.getHostname(), "9083");
    List<String> schemas = hiveMetaStoreClient.listPartitionNames(dbName, tableName, sf);
    System.out.println(schemas);
  }

  private HiveMetaStoreClient getHiveMetaStoreClient(String host, String port) throws MetaException{
    HiveConf hiveConf = new HiveConf();
    hiveConf.setVar(HiveConf.ConfVars.METASTOREURIS, "thrift://" + host + ":" + port);
    HiveMetaStoreClient hiveMetaStoreClient = new HiveMetaStoreClient(hiveConf);
    return hiveMetaStoreClient;
  }
}
