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

package app.metatron.discovery.domain.workbench;

import org.junit.Assert;
import org.junit.Test;

import java.sql.SQLException;
import java.util.List;
import java.util.concurrent.CountDownLatch;

import app.metatron.discovery.domain.dataconnection.DataConnection;

public class QueryEditorServiceTest {

  QueryEditorService queryEditorService = new QueryEditorService();

  @Test
  public void getSubstitutedQueryListTest() {
    Workbench workbench = new Workbench();
    workbench.setGlobalVar("");

    String singleQuery = "select * from sales";

    List<String> queryList = queryEditorService.getSubstitutedQueryList(singleQuery, workbench);

    Assert.assertTrue(queryList.size() == 1);
    for(String query : queryList){
      System.out.println("=======query = " + query);
    }
  }

  @Test
  public void getSubstitutedQueryListTest2() {
    Workbench workbench = new Workbench();
    workbench.setGlobalVar("123");

    String singleQuery = "";

    List<String> queryList = queryEditorService.getSubstitutedQueryList(singleQuery, workbench);

    Assert.assertTrue(queryList.size() == 0);
    for(String query : queryList){
      System.out.println("========query = " + query);
    }
  }

  @Test
  public void getSubstitutedQueryListTest3() {
    Workbench workbench = new Workbench();
    workbench.setGlobalVar("123");

    String singleQuery = "select * from sale";

    List<String> queryList = queryEditorService.getSubstitutedQueryList(singleQuery, workbench);

    Assert.assertTrue(queryList.size() == 1);
    Assert.assertTrue(queryList.get(0).equals(singleQuery));
    for(String query : queryList){
      System.out.println("========query = " + query);
    }
  }

  @Test
  public void getSubstitutedQueryListTest4() {
    Workbench workbench = new Workbench();
    workbench.setGlobalVar("[{\"globalNm\":\"var1\",\"globalVar\":\"20170701\",\"globalType\":\"c\"},{\"globalNm\":\"var2\",\"globalVar\":\"limit 10\",\"globalType\":\"t\"}]");

    String singleQuery = "select * from ${var1};select * from ${var2};select ${var1} from ${var1} select ${var2} from ${var2};";

    List<String> queryList = queryEditorService.getSubstitutedQueryList(singleQuery, workbench);

    int i = 0;
    for(String query : queryList){
      System.out.println("========query(" + i++ + ") = " + query);
    }
    Assert.assertTrue(queryList.size() == 3);
    Assert.assertTrue(!queryList.get(1).contains("$"));
  }

  @Test
  public void runSingleQueryHive() throws SQLException{

    QueryEditor queryEditor = new QueryEditor();

    DataConnection hiveConn1 = createHiveConnection("localhost", "hive", "hive", 10000, "hiveConn1");

    Workbench workbench = new Workbench();
    workbench.setGlobalVar("[{\"globalNm\":\"var1\",\"globalVar\":\"20170701\",\"globalType\":\"c\"},{\"globalNm\":\"var2\",\"globalVar\":\"limit 1000000\",\"globalType\":\"t\"}]");

    String query = "select\n" +
            " t1.*, t2.*\n" +
            " from\n" +
            " lfdc t1\n" +
            " left outer join sales t2\n" +
            " where city ='Houston'";

    query = "select count(*) from default.sales_test1;";

    String webSocketId = "test1";
//    WorkbenchDataSourceManager.createDataSourceInfo(hiveConn1, webSocketId, true);
//    List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, hiveConn1, workbench, query, webSocketId);
//    System.out.println(queryResults);
//
//    Assert.assertTrue(queryResults.size() == 1);
//    Assert.assertTrue(queryResults.get(0).getQueryResultStatus() == QueryResult.QueryResultStatus.SUCCESS);
  }

  @Test
  public void runMultiQueryHive() throws SQLException{

    QueryEditor queryEditor = new QueryEditor();

    DataConnection hiveConn1 = createHiveConnection("localhost", "hive", "hive", 10000, "hiveConn1");

    Workbench workbench = new Workbench();
    workbench.setGlobalVar("[{\"globalNm\":\"var1\",\"globalVar\":\"20170701\",\"globalType\":\"c\"},{\"globalNm\":\"var2\",\"globalVar\":\"limit 1000000\",\"globalType\":\"t\"}]");

    String query = "set mapred.reduce.tasks = 12;\n" +
            "set hive.tez.auto.reducer.parallelism = true;\n" +
            "\n" +
            "-- 기존 데이터 제거\n" +
            "drop table contract_all_test1;\n" +
            "\n" +
            "-- 계약 전체 데이터 생성\n" +
            "create table contract_all_test1 as\n" +
            "select\n" +
            "  *\n" +
            "from\n" +
            " sales t1\n" +
            " left outer join lfdc t2\n" +
            "where t1.city = 'Houston' " +
            ";\n" +
            "\n" +
            "select * from contract_all_test1 limit 10;";

    String webSocketId = "test1";
//    WorkbenchDataSourceManager.createDataSourceInfo(hiveConn1, webSocketId, true);
//    List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, hiveConn1, workbench, query, webSocketId);
//    System.out.println(queryResults);
//
//    Assert.assertTrue(queryResults.size() == 5);
//    for(QueryResult queryResult : queryResults){
//      Assert.assertTrue(queryResult.getQueryResultStatus() == QueryResult.QueryResultStatus.SUCCESS);
//    }
  }

  @Test
  public void runInvalidQueryHive() throws SQLException{

    QueryEditor queryEditor = new QueryEditor();

    DataConnection hiveConn1 = createHiveConnection("localhost", "hive", "hive", 10000, "hiveConn1");

    Workbench workbench = new Workbench();
    workbench.setGlobalVar("[{\"globalNm\":\"var1\",\"globalVar\":\"20170701\",\"globalType\":\"c\"},{\"globalNm\":\"var2\",\"globalVar\":\"limit 1000000\",\"globalType\":\"t\"}]");

    String query = "safsafsdaf;\n" +
            "set hive.reducer.parallelism = true;\n" +
            "select * from sales;\n" +
            "asd\n";

    String webSocketId = "test1";

    List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, hiveConn1, workbench, query, webSocketId);
    System.out.println(queryResults);

    Assert.assertTrue(queryResults.size() == 4);
    Assert.assertTrue(queryResults.get(0).getQueryResultStatus() == QueryResult.QueryResultStatus.FAIL);
    Assert.assertTrue(queryResults.get(1).getQueryResultStatus() == QueryResult.QueryResultStatus.SUCCESS);
    Assert.assertTrue(queryResults.get(2).getQueryResultStatus() == QueryResult.QueryResultStatus.SUCCESS);
    Assert.assertTrue(queryResults.get(3).getQueryResultStatus() == QueryResult.QueryResultStatus.FAIL);

  }

  @Test
  public void runSingleQueryMysql() throws SQLException{

    QueryEditor queryEditor = new QueryEditor();

    DataConnection connection = createMysqlConnection("localhost", "polaris", "polaris", 3306, "mysqlConn", "sample");

    Workbench workbench = new Workbench();
    workbench.setGlobalVar("[{\"globalNm\":\"var1\",\"globalVar\":\"20170701\",\"globalType\":\"c\"},{\"globalNm\":\"var2\",\"globalVar\":\"limit 10\",\"globalType\":\"t\"}]");

    String query = "select * from sample.sales limit 10;";

    String webSocketId = "test1";

    List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, connection, workbench, query, webSocketId);
    System.out.println(queryResults);

    Assert.assertTrue(queryResults.size() == 1);
    Assert.assertTrue(queryResults.get(0).getQueryResultStatus() == QueryResult.QueryResultStatus.SUCCESS);
  }

  @Test
  public void runMultiQueryMysql() throws SQLException{

    QueryEditor queryEditor = new QueryEditor();

    DataConnection connection = createMysqlConnection("localhost", "polaris", "polaris", 3306, "mysqlConn", "sample");

    Workbench workbench = new Workbench();
    workbench.setGlobalVar("[{\"globalNm\":\"var1\",\"globalVar\":\"20170701\",\"globalType\":\"c\"},{\"globalNm\":\"var2\",\"globalVar\":\"limit 10\",\"globalType\":\"t\"}]");

    String query = "DROP TABLE IF EXISTS TEST1;\n" +
            "\n" +
            "CREATE TABLE TEST1(\n" +
            "SCHED_NAME VARCHAR(120) NOT NULL,\n" +
            "JOB_NAME VARCHAR(200) NOT NULL,\n" +
            "JOB_GROUP VARCHAR(200) NOT NULL,\n" +
            "DESCRIPTION VARCHAR(250) NULL,\n" +
            "JOB_CLASS_NAME VARCHAR(250) NOT NULL,\n" +
            "IS_DURABLE VARCHAR(1) NOT NULL,\n" +
            "IS_NONCONCURRENT VARCHAR(1) NOT NULL,\n" +
            "IS_UPDATE_DATA VARCHAR(1) NOT NULL,\n" +
            "REQUESTS_RECOVERY VARCHAR(1) NOT NULL,\n" +
            "JOB_DATA BLOB NULL,\n" +
            "PRIMARY KEY (SCHED_NAME,JOB_NAME,JOB_GROUP))\n" +
            "ENGINE=InnoDB;" +
            "select * from TEST1;";

    String webSocketId = "test1";

    List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, connection, workbench, query, webSocketId);
    System.out.println(queryResults);

    Assert.assertTrue(queryResults.size() == 3);
    for(QueryResult queryResult : queryResults){
      Assert.assertTrue(queryResult.getQueryResultStatus() == QueryResult.QueryResultStatus.SUCCESS);
    }
  }

  @Test
  public void runInvalidQueryMysql() throws SQLException{

    QueryEditor queryEditor = new QueryEditor();

    DataConnection connection = createMysqlConnection("localhost", "polaris", "polaris", 3306, "mysqlConn", "sample");

    Workbench workbench = new Workbench();
    workbench.setGlobalVar("[{\"globalNm\":\"var1\",\"globalVar\":\"20170701\",\"globalType\":\"c\"},{\"globalNm\":\"var2\",\"globalVar\":\"limit 10\",\"globalType\":\"t\"}]");

    String query = "use sales;\n" +
            "show tables;\n";

    String webSocketId = "test1";

    List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, connection, workbench, query, webSocketId);
    System.out.println(queryResults);

    Assert.assertTrue(queryResults.size() == 2);
    Assert.assertTrue(queryResults.get(0).getQueryResultStatus() == QueryResult.QueryResultStatus.FAIL);
    Assert.assertTrue(queryResults.get(1).getQueryResultStatus() == QueryResult.QueryResultStatus.SUCCESS);
  }

  @Test
  public void runSingleQueryPresto() throws SQLException{

    QueryEditor queryEditor = new QueryEditor();

    DataConnection connection = createPrestoConnection("localhost", "hive", "hive", 8080, "prestoConn", "hive");

    Workbench workbench = new Workbench();
    workbench.setGlobalVar("[{\"globalNm\":\"var1\",\"globalVar\":\"20170701\",\"globalType\":\"c\"},{\"globalNm\":\"var2\",\"globalVar\":\"limit 10\",\"globalType\":\"t\"}]");

    String query = "select * from default.sales;";

    String webSocketId = "test1";

    List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, connection, workbench, query, webSocketId);
    System.out.println(queryResults);

    Assert.assertTrue(queryResults.size() == 1);
    Assert.assertTrue(queryResults.get(0).getQueryResultStatus() == QueryResult.QueryResultStatus.SUCCESS);
  }

  @Test
  public void runMultiQueryPresto() throws SQLException{

    QueryEditor queryEditor = new QueryEditor();

    DataConnection connection = createPrestoConnection("localhost", "hive", "hive", 8080, "prestoConn", "hive");
    Workbench workbench = new Workbench();
    workbench.setGlobalVar("[{\"globalNm\":\"var1\",\"globalVar\":\"20170701\",\"globalType\":\"c\"},{\"globalNm\":\"var2\",\"globalVar\":\"limit 10\",\"globalType\":\"t\"}]");

    String query = "DROP TABLE IF EXISTS default.TEST1;\n" +
            "\n" +
            "CREATE TABLE default.TEST1(\n" +
            "SCHED_NAME VARCHAR(120),\n" +
            "JOB_NAME VARCHAR(200),\n" +
            "JOB_GROUP VARCHAR(200),\n" +
            "DESCRIPTION VARCHAR(250),\n" +
            "JOB_CLASS_NAME VARCHAR(250),\n" +
            "IS_DURABLE VARCHAR(1),\n" +
            "IS_NONCONCURRENT VARCHAR(1),\n" +
            "IS_UPDATE_DATA VARCHAR(1),\n" +
            "REQUESTS_RECOVERY VARCHAR(1)\n" +
            ");" +
            "select * from default.TEST1;";

    String webSocketId = "test1";

    List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, connection, workbench, query, webSocketId);
    System.out.println(queryResults);

    Assert.assertTrue(queryResults.size() == 3);
    for(QueryResult queryResult : queryResults){
      Assert.assertTrue(queryResult.getQueryResultStatus() == QueryResult.QueryResultStatus.SUCCESS);
    }
  }

  @Test
  public void runInvalidQueryPresto() throws SQLException{

    QueryEditor queryEditor = new QueryEditor();

    DataConnection connection = createPrestoConnection("localhost", "hive", "hive", 8080, "prestoConn", "hive");

    Workbench workbench = new Workbench();
    workbench.setGlobalVar("[{\"globalNm\":\"var1\",\"globalVar\":\"20170701\",\"globalType\":\"c\"},{\"globalNm\":\"var2\",\"globalVar\":\"limit 10\",\"globalType\":\"t\"}]");

    String query = "use sales;\n" +
            "show tables from default;\n";

    String webSocketId = "test1";

    List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, connection, workbench, query, webSocketId);
    System.out.println(queryResults);

    Assert.assertTrue(queryResults.size() == 2);
    Assert.assertTrue(queryResults.get(0).getQueryResultStatus() == QueryResult.QueryResultStatus.FAIL);
    Assert.assertTrue(queryResults.get(1).getQueryResultStatus() == QueryResult.QueryResultStatus.SUCCESS);
  }

  @Test
  public void runQueryDuringExecuteQuery(){
    CountDownLatch latch = new CountDownLatch(1);

    QueryEditor queryEditor = new QueryEditor();

    DataConnection connection = createMysqlConnection("localhost", "polaris", "polaris", 3306, "mysqlConn", "sample");

    Workbench workbench = new Workbench();
    workbench.setGlobalVar("[{\"globalNm\":\"var1\",\"globalVar\":\"20170701\",\"globalType\":\"c\"},{\"globalNm\":\"var2\",\"globalVar\":\"limit 10\",\"globalType\":\"t\"}]");

    String webSocketId = "test1";

    new Thread(() -> {
      String query = "select t1.city as c1\n" +
              "from sales t1\n" +
              "join (select * from sales) t2 on (t1.city = t2.city)\n" +
              "left outer join (select * from sales) t3  on (t1.city = t3.city)\n" +
              "left outer join (select * from sales) t4  on (t1.city = t4.city)\n" +
              "left outer join (select * from sales) t5  on (t1.city = t5.city)\n" +
              "left outer join (select * from sales) t6  on (t1.city = t6.city)\n" +
              "left outer join (select * from sales) t7  on (t1.city = t7.city)\n" +
              "left outer join (select * from sales) t8  on (t1.city = t8.city)\n" +
              "group by c1\n" +
              ";" +
              "" +
              "select * from sales limit 100;";
      List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, connection, workbench, query, webSocketId);

      latch.countDown();
    }).start();

    try{
      System.out.println("======thread..");
      Thread.sleep(5000);
      System.out.println("======thread..sleeped..");

      String query = "select * from sales limit 100;";
      List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, connection, workbench, query, webSocketId);
      System.out.println("queryResults = " + queryResults);

      latch.await();
      System.out.println("Test Completed...");
    } catch(Exception e){

    }

  }

  @Test
  public void cancelMysqlQuery(){
    CountDownLatch latch = new CountDownLatch(1);

    QueryEditor queryEditor = new QueryEditor();

    DataConnection connection = createMysqlConnection("localhost", "polaris", "polaris", 3306, "mysqlConn", "sample");

    Workbench workbench = new Workbench();
    workbench.setGlobalVar("[{\"globalNm\":\"var1\",\"globalVar\":\"20170701\",\"globalType\":\"c\"},{\"globalNm\":\"var2\",\"globalVar\":\"limit 10\",\"globalType\":\"t\"}]");

    String webSocketId = "test1";

    new Thread(() -> {
      String query = "select * from sales limit 1;" +
              "select t1.city as c1\n" +
              "from sales t1\n" +
              "join (select * from sales) t2 on (t1.city = t2.city)\n" +
              "left outer join (select * from sales) t3  on (t1.city = t3.city)\n" +
              "left outer join (select * from sales) t4  on (t1.city = t4.city)\n" +
              "left outer join (select * from sales) t5  on (t1.city = t5.city)\n" +
              "left outer join (select * from sales) t6  on (t1.city = t6.city)\n" +
              "left outer join (select * from sales) t7  on (t1.city = t7.city)\n" +
              "left outer join (select * from sales) t8  on (t1.city = t8.city)\n" +
              "group by c1\n" +
              ";" +
              "" +
              "select * from sales limit 2;" +
              "select * from sales limit 3;"
              ;
      List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, connection, workbench, query, webSocketId);

      System.out.println("queryResults = " + queryResults);
      latch.countDown();
    }).start();

    try{
      System.out.println("======thread..");
      Thread.sleep(5000);
      System.out.println("======thread..sleeped..");

      queryEditorService.cancelQuery(connection, webSocketId);

      latch.await();
      System.out.println("Test Completed.");
    } catch(Exception e){

    }

  }

  @Test
  public void cancelHiveQuery(){
    CountDownLatch latch = new CountDownLatch(1);

    QueryEditor queryEditor = new QueryEditor();

    DataConnection connection = createHiveConnection("localhost", "hive", "hive", 10000, "hiveConn1");

    Workbench workbench = new Workbench();
    workbench.setGlobalVar("[{\"globalNm\":\"var1\",\"globalVar\":\"20170701\",\"globalType\":\"c\"},{\"globalNm\":\"var2\",\"globalVar\":\"limit 10\",\"globalType\":\"t\"}]");

    String webSocketId = "test1";

    new Thread(() -> {
      int i = 1;
      String query = "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "select t1.*, t2.* from lfdc t1 left outer join sales t2 limit " + i++ + ";" +
              "";
      List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, connection, workbench, query, webSocketId);

      System.out.println("queryResults = " + queryResults);
      latch.countDown();
    }).start();

    try{
      System.out.println("======thread..");
      Thread.sleep(2000);
      System.out.println("======thread..sleeped..");

      queryEditorService.cancelQuery(connection, webSocketId);

      latch.await();
      System.out.println("Test Completed.");
    } catch(Exception e){

    }

  }

  @Test
  public void cancelPrestoQuery(){
    CountDownLatch latch = new CountDownLatch(1);

    QueryEditor queryEditor = new QueryEditor();

    DataConnection connection = createPrestoConnection("localhost", "hive", "hive", 8080, "prestoConn", "hive");

    Workbench workbench = new Workbench();
    workbench.setGlobalVar("[{\"globalNm\":\"var1\",\"globalVar\":\"20170701\",\"globalType\":\"c\"},{\"globalNm\":\"var2\",\"globalVar\":\"limit 10\",\"globalType\":\"t\"}]");

    String webSocketId = "test1";

    new Thread(() -> {
      int i = 1;
      String query = "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "select * from default.sales limit " + i++ + ";" +
              "";
      List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, connection, workbench, query, webSocketId);

      System.out.println("queryResults = " + queryResults);
      latch.countDown();
    }).start();

    try{
      System.out.println("======thread..");
      Thread.sleep(2000);
      System.out.println("======thread..sleeped..");

      queryEditorService.cancelQuery(connection, webSocketId);

      latch.await();
      System.out.println("Test Completed.");
    } catch(Exception e){

    }

  }

  private DataConnection createHiveConnection(String hostName, String userName, String password, int port, String id){
    DataConnection conn = new DataConnection("HIVE");
    conn.setId(id);
    conn.setHostname(hostName);
    conn.setUsername(userName);
    conn.setPassword(password);
    conn.setPort(port);
    return conn;
  }

  private DataConnection createMysqlConnection(String hostName, String userName, String password, int port, String id, String database){
    DataConnection conn = new DataConnection("MYSQL");
    conn.setId(id);
    conn.setDatabase(database);
    conn.setHostname(hostName);
    conn.setUsername(userName);
    conn.setPassword(password);
    conn.setPort(port);
    return conn;
  }

  private DataConnection createPrestoConnection(String hostName, String userName, String password, int port, String id, String catalog){
    DataConnection prestoConn = new DataConnection("PRESTO");
    prestoConn.setHostname(hostName);
    prestoConn.setUsername(userName);
    prestoConn.setPassword(password);
    prestoConn.setPort(port);
    prestoConn.setCatalog(catalog);
    prestoConn.setId(id);
    return prestoConn;
  }

  private DataConnection createMssqlConnection(String hostName, String userName, String password, int port, String id, String database){
    DataConnection conn = new DataConnection("MSSQL");
    conn.setId(id);
    conn.setDatabase(database);
    conn.setHostname(hostName);
    conn.setUsername(userName);
    conn.setPassword(password);
    conn.setPort(port);
    return conn;
  }

}
