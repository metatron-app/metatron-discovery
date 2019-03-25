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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.dataconnection.DataConnection;


/**
 * Created by kyungtaak on 2016. 6. 16..
 */
public class HiveMetaStoreConnectionTest {

  private JdbcConnectionService jdbcConnectionService = new JdbcConnectionService();

  @Test
  public void showTableViaJDBC() {
    String metastoreURL = "jdbc:mysql://localhost:3306/metastore2";
    String metastoreDriver = "com.mysql.jdbc.Driver";
    String metastoreUser = "hiveuser";
    String metastorePassword = "password";
    HiveMetaStoreJdbcClient metaStoreJdbcClient = new HiveMetaStoreJdbcClient(metastoreURL, metastoreUser, metastorePassword, metastoreDriver);

    String dbName = "col_test";
    String tableNamePattern = "";
    String columnNamePattern = "";
    PageRequest pageRequest = new PageRequest(0, 20);

    List<Map<String, Object>> tables = metaStoreJdbcClient.getTable(dbName, tableNamePattern, columnNamePattern, pageRequest.getPageSize(), pageRequest.getPageNumber());

    System.out.println("size = " + tables.size());
    System.out.println(tables);
  }

  @Test
  public void searchTableViaJDBC() {
    String metastoreURL = "jdbc:mysql://localhost:3306/metastore2";
    String metastoreDriver = "com.mysql.jdbc.Driver";
    String metastoreUser = "hiveuser";
    String metastorePassword = "password";
    HiveMetaStoreJdbcClient metaStoreJdbcClient = new HiveMetaStoreJdbcClient(metastoreURL, metastoreUser, metastorePassword, metastoreDriver);

    String dbName = "default";
    String tableNamePattern = "";
    String columnNamePattern = "";
    PageRequest pageRequest = new PageRequest(0, 20);

    long tableCount = metaStoreJdbcClient.getTableCount(dbName, tableNamePattern, columnNamePattern);
    List<Map<String, Object>> tables = metaStoreJdbcClient.getTable(dbName, tableNamePattern, columnNamePattern, pageRequest.getPageSize(), pageRequest.getPageNumber());

    System.out.println("tableCount = " + tableCount);
    System.out.println("size = " + tables.size());
    System.out.println(tables);
  }

  @Test
  public void getColumnViaJDBC() {
    String metastoreURL = "jdbc:mysql://localhost:3306/metastore2";
    String metastoreDriver = "com.mysql.jdbc.Driver";
    String metastoreUser = "hiveuser";
    String metastorePassword = "password";
    HiveMetaStoreJdbcClient metaStoreJdbcClient = new HiveMetaStoreJdbcClient(metastoreURL, metastoreUser, metastorePassword, metastoreDriver);

    String dbName = "col_test";
    String tableName = "abvzpuzf2574";
    String columnNamePattern = "f";

    List<Map<String, Object>> columns = metaStoreJdbcClient.getColumns(dbName, tableName, columnNamePattern);

    System.out.println("size = " + columns.size());
    System.out.println(columns);
  }

  @Test
  public void hiveMetaStoreClientTest() throws MetaException{
    DataConnection dataConnection = new DataConnection("HIVE");
    dataConnection.setHostname("localhost");
    dataConnection.setUsername("hive");
    dataConnection.setPassword("hive");
    dataConnection.setPort(10000);

    HiveMetaStoreClient hiveMetaStoreClient = getHiveMetaStoreClient(dataConnection.getHostname(), "9083");
    List<String> dbs = hiveMetaStoreClient.getAllDatabases();
    System.out.println(dbs);
  }

  @Test
  public void getDatabaseViaThrift() throws MetaException{
    DataConnection dataConnection = new DataConnection("HIVE");
    dataConnection.setHostname("localhost");
    dataConnection.setUsername("hive");
    dataConnection.setPassword("hive");
    dataConnection.setPort(10000);

    String dbNamePattern = "*";

    HiveMetaStoreClient hiveMetaStoreClient = getHiveMetaStoreClient(dataConnection.getHostname(), "9083");
    List<String> dbs = hiveMetaStoreClient.getDatabases(dbNamePattern);
    System.out.println(dbs);
  }

  @Test
  public void getTableViaThrift() throws MetaException{
    DataConnection dataConnection = new DataConnection("HIVE");
    dataConnection.setHostname("localhost");
    dataConnection.setUsername("hive");
    dataConnection.setPassword("hive");
    dataConnection.setPort(10000);

    String dbName = "col_test";
    String tableNamePattern = "*a*";
    HiveMetaStoreClient hiveMetaStoreClient = getHiveMetaStoreClient(dataConnection.getHostname(), "9083");
    List<String> tables = hiveMetaStoreClient.getTables(dbName, tableNamePattern);
    System.out.println(tables);
  }

  @Test
  public void getSchemaViaThrift() throws TException{
    DataConnection dataConnection = new DataConnection("HIVE");
    dataConnection.setHostname("localhost");
    dataConnection.setUsername("hive");
    dataConnection.setPassword("hive");
    dataConnection.setPort(10000);

    String dbName = "col_test";
    String tableName = "aacglmae1138";

    HiveMetaStoreClient hiveMetaStoreClient = getHiveMetaStoreClient(dataConnection.getHostname(), "9083");
    List<FieldSchema> schemas = hiveMetaStoreClient.getSchema(dbName, tableName);
    System.out.println(schemas);
  }

  @Test
  public void getFieldViaThrift() throws TException{
    DataConnection dataConnection = new DataConnection("HIVE");
    dataConnection.setHostname("localhost");
    dataConnection.setUsername("hive");
    dataConnection.setPassword("hive");
    dataConnection.setPort(10000);

    String dbName = "col_test";
    String tableName = "aacglmae1138";

    HiveMetaStoreClient hiveMetaStoreClient = getHiveMetaStoreClient(dataConnection.getHostname(), "9083");
    List<FieldSchema> schemas = hiveMetaStoreClient.getFields(dbName, tableName);
    System.out.println(schemas);
  }

  @Test
  public void getPartitionsViaThrift() throws TException{
    DataConnection dataConnection = new DataConnection("HIVE");
    dataConnection.setHostname("localhost");
    dataConnection.setUsername("hive");
    dataConnection.setPassword("hive");
    dataConnection.setPort(10000);

    String dbName = "col_test";
    String tableName = "aacglmae1138";
    short sf = 123;
    HiveMetaStoreClient hiveMetaStoreClient = getHiveMetaStoreClient(dataConnection.getHostname(), "9083");
    List<String> schemas = hiveMetaStoreClient.listPartitionNames(dbName, tableName, sf);
    System.out.println(schemas);
  }

  private HiveMetaStoreClient getHiveMetaStoreClient(String host, String port) throws MetaException{
    HiveConf hiveConf = new HiveConf();
    hiveConf.setVar(HiveConf.ConfVars.METASTOREURIS, "thrift://" + host + ":" + port);
    HiveMetaStoreClient hiveMetaStoreClient = new HiveMetaStoreClient(hiveConf);
    return hiveMetaStoreClient;
  }

  @Test
  public void getPartitionsInfoList() throws TException{
    String metastoreURL = "jdbc:mysql://localhost:3306/metastore2";
    String metastoreDriver = "com.mysql.jdbc.Driver";
    String metastoreUser = "hiveuser";
    String metastorePassword = "password";
    HiveMetaStoreJdbcClient metaStoreJdbcClient = new HiveMetaStoreJdbcClient(metastoreURL, metastoreUser, metastorePassword, metastoreDriver);

    String dbName = "default";
    String tableName = "part1";

    List partList = new ArrayList();
    partList.add("ymd=20110115");
    partList.add("ymd=20110116");
    partList.add("ymd=20110117");
    partList.add("ymd=20110118");

    List<Map<String, Object>> partitionInfo = metaStoreJdbcClient.getPartitionList(dbName, tableName, partList);
    for(Map<String, Object> partMap : partitionInfo){
      System.out.println(partMap.get("PART_NAME") + ", " + partMap.get("NUM_ROWS"));
    }
  }
}
