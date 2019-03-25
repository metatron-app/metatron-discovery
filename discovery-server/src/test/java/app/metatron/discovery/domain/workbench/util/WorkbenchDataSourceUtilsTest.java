/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.workbench.util;

public class WorkbenchDataSourceUtilsTest {

//  @Test
//  public void openHiveConnection() {
//    WorkbenchDataSourceManager workbenchDataSourceManager = mock(WorkbenchDataSourceManager.class);
//
//    DataConnection hiveConn1 = createHiveConnection("localhost", "hive", "hive", 10000, "hiveConn1");
//
//    SingleConnectionDataSource ds1 = workbenchDataSourceManager.createDataSourceInfo(hiveConn1, "websocket1")
//        .getSingleConnectionDataSource();
//    JdbcTemplate jt = new JdbcTemplate(ds1);
//    jt.execute(hiveConn1.getTestQuery());
//
//    System.out.println("========First Stmt...");
//
//    SingleConnectionDataSource ds2 = WorkbenchDataSourceUtils.createDataSourceInfo(hiveConn1, "websocket1", false)
//        .getSingleConnectionDataSource();;
//    JdbcTemplate jt2 = new JdbcTemplate(ds2);
//    jt2.execute(hiveConn1.getTestQuery());
//
//    System.out.println("=========Second Stmt...");
//
//    SingleConnectionDataSource ds3 = WorkbenchDataSourceUtils.createDataSourceInfo(hiveConn1, "websocket2", false)
//        .getSingleConnectionDataSource();;
//    JdbcTemplate jt3 = new JdbcTemplate(ds3);
//    jt3.execute(hiveConn1.getTestQuery());
//
//    Assert.assertEquals(ds1, ds2);
//    Assert.assertNotEquals(ds1, ds3);
//  }
//
//  @Test(expected = IllegalArgumentException.class)
//  public void openHiveConnectionWithoutConnection() {
//    SingleConnectionDataSource ds1 = WorkbenchDataSourceUtils.createDataSourceInfo(null, "websocket1", false)
//        .getSingleConnectionDataSource();;
//  }
//
//  @Test(expected = IllegalArgumentException.class)
//  public void openHiveConnectionWithoutWebSocketId() {
//    HiveConnection hiveConn1 = createHiveConnection("localhost", "hive", "hive", 10000, "hiveConn1");
//    SingleConnectionDataSource ds1 = WorkbenchDataSourceUtils.createDataSourceInfo(hiveConn1, null, false)
//        .getSingleConnectionDataSource();;
//  }
//
//  @Test(expected = IllegalArgumentException.class)
//  public void openHiveConnectionWithEmptyWebSocketId() {
//    HiveConnection hiveConn1 = createHiveConnection("localhost", "hive", "hive", 10000, "hiveConn1");
//    SingleConnectionDataSource ds1 = WorkbenchDataSourceUtils.createDataSourceInfo(hiveConn1, "", false)
//        .getSingleConnectionDataSource();;
//  }
//
//  @Test
//  public void openMultipleConnection() {
//    HiveConnection hiveConn1 = createHiveConnection("localhost", "hive", "hive", 10000, "hiveConn1");
//    SingleConnectionDataSource ds1 = WorkbenchDataSourceUtils.createDataSourceInfo(hiveConn1, "websocket1", false)
//        .getSingleConnectionDataSource();;
//
//    JdbcTemplate jt = new JdbcTemplate(ds1);
//    jt.execute(hiveConn1.getTestQuery());
//
//    HiveConnection hiveConn2 = createHiveConnection("localhost", "hive", "hive", 10000, "hiveConn2");
//    SingleConnectionDataSource ds2 = WorkbenchDataSourceUtils.createDataSourceInfo(hiveConn2, "websocket1", false)
//        .getSingleConnectionDataSource();;
//
//    JdbcTemplate jt2 = new JdbcTemplate(ds2);
//    jt2.execute(hiveConn2.getTestQuery());
//  }
//
//  @Test
//  public void closeHiveConnection(){
//    HiveConnection hiveConn1 = createHiveConnection("localhost", "hive", "hive", 10000, "hiveConn1");
//    SingleConnectionDataSource ds1 = WorkbenchDataSourceUtils.createDataSourceInfo(hiveConn1, "websocket1", false)
//        .getSingleConnectionDataSource();;
//
//    System.out.println("========First Stmt...");
//    JdbcTemplate jt = new JdbcTemplate(ds1);
//    jt.execute(hiveConn1.getTestQuery());
//
//
//    WorkbenchDataSourceUtils.destroyDataSource("websocket1");
//
//    System.out.println("=========Second Stmt...");
//    JdbcTemplate jt2 = new JdbcTemplate(ds1);
//    jt2.execute(hiveConn1.getTestQuery());
//  }
//
//  @Test
//  public void cancelQuery() throws InterruptedException, SQLException{
//    System.out.println("Test Start...");
//    CountDownLatch latch = new CountDownLatch(1);
//
//    HiveConnection hiveConn1 = createHiveConnection("localhost", "hive", "hive", 10000, "hiveConn1");
//
//    SingleConnectionDataSource ds1 = WorkbenchDataSourceUtils.createDataSourceInfo(hiveConn1, "websocket1", false)
//        .getSingleConnectionDataSource();;
//    JdbcTemplate jt1 = new JdbcTemplate(ds1);
//    String testQuery = "drop table etl.contract_all_test1";
//    System.out.println("=====drop table");
//    jt1.execute(testQuery);
//
//    final PreparedStatement[] stmt = new PreparedStatement[1];
//
//    new Thread(() -> {
//      System.out.println("=====create table1");
//      SingleConnectionDataSource ds2 = WorkbenchDataSourceUtils.createDataSourceInfo(hiveConn1, "websocket1", false)
//          .getSingleConnectionDataSource();;
//
//
//      JdbcTemplate jt2 = new JdbcTemplate(ds2);
//      System.out.println("ds2 = " + ds2);
//      String testQuery2 = "create table etl.contract_all_test1 as\n" +
//          "select\n" +
//          "  t1.*, t2.birth_date, t2.customer_sex\n" +
//          "from\n" +
//          "  etl.contract t1\n" +
//          "  join etl.customer t2 on (t1.customer_id = t2.customer_id)";
//
//      PreparedStatementCreator pstmtCreator = new PreparedStatementCreator() {
//        public PreparedStatement createPreparedStatement(Connection connection) throws SQLException {
//          stmt[0] = connection.prepareStatement(testQuery2);
//          return stmt[0];
//        }
//      };
//
//      PreparedStatementCallback cb = new PreparedStatementCallback() {
//        @Override
//        public Object doInPreparedStatement(PreparedStatement preparedStatement) throws SQLException, DataAccessException {
//          return null;
//        }
//      };
//
//      final int i = (Integer) jt2.query(new PreparedStatementCreator() {
//        public PreparedStatement createPreparedStatement(Connection connection) throws SQLException {
//          stmt[0] = connection.prepareStatement(testQuery2);
//          return stmt[0];
//        }
//      }, new ResultSetExtractor() {
//        public Object extractData(ResultSet resultSet) throws SQLException, DataAccessException {
//          return resultSet;
//        }
//      });
//
//      System.out.println("=====created1...");
//      latch.countDown();
//    }).start();
//
////    System.out.println("Stmt Wait..");
////    Thread.sleep(5000);
//
////    System.out.println("Stmt Cancel..");
////    stmt[0].cancel();
//
//    latch.await();
//    //Drop된 테이블 존재 확인
//    System.out.println("query result...");
//    List<?> tables = jt1.queryForList("select * from etl.contract_all_test1 limit 10" );
//    System.out.println("tables = " + tables);
//
//    System.out.println("Test End...");
//  }
//
//  @Test
//  public void showTable() throws InterruptedException{
//    HiveConnection hiveConn1 = createHiveConnection("localhost", "hive", "hive", 10000, "hiveConn1");
//
//    SingleConnectionDataSource ds1 = WorkbenchDataSourceUtils.createDataSourceInfo(hiveConn1, "websocket1", false)
//        .getSingleConnectionDataSource();;
//    JdbcTemplate jt1 = new JdbcTemplate(ds1);
//    System.out.println("=====show table");
//    jt1.execute("use default");
//    List<?> tables = jt1.queryForList("select * from test");
//
//    System.out.println("tables = " + tables);
//  }
//
//  @Test
//  public void threadSleepTest() throws InterruptedException{
//    System.out.println("GO");
//
//    Thread.sleep(5000);
//
//    System.out.println("END");
//  }
//
//  @Test
//  public void selectHiveConnection() {
//    HiveConnection hiveConn1 = createHiveConnection("localhost", "hive", "hive", 10000, "hiveConn1");
//
//    SingleConnectionDataSource ds1 = WorkbenchDataSourceUtils.createDataSourceInfo(hiveConn1, "websocket1", false)
//        .getSingleConnectionDataSource();;
//    JdbcTemplate jt = new JdbcTemplate(ds1);
//
//    final PreparedStatement[] stmt = new PreparedStatement[1];
//    final Object result = jt.query(new PreparedStatementCreator() {
//      public PreparedStatement createPreparedStatement(Connection connection) throws SQLException {
//        stmt[0] = connection.prepareStatement("select * from sales limit 100");
//        return stmt[0];
//      }
//    }, new ResultSetExtractor() {
//      public Object extractData(ResultSet resultSet) throws SQLException, DataAccessException {
//        return resultSet.getString(1);
//      }
//    });
//
////    List<Map<String, Object>> result = jt.queryForList("select * from sales limit 100");
//    System.out.println("result = " + result);
//  }
//
//  private DataConnection createHiveConnection(String hostName, String userName, String password, int port, String id){
//    DataConnection conn = new DataConnection("HIVE");
//    conn.setId(id);
//    conn.setHostname(hostName);
//    conn.setUsername(userName);
//    conn.setPassword(password);
//    conn.setPort(port);
//    return conn;
//  }
//
//  private DataConnection createPrestoConnection(String hostName, String userName, String password, int port, String id, String catalog){
//    DataConnection prestoConn = new DataConnection("PRESTO");
//    prestoConn.setHostname(hostName);
//    prestoConn.setUsername(userName);
//    prestoConn.setPassword(password);
//    prestoConn.setPort(port);
//    prestoConn.setCatalog(catalog);
//    prestoConn.setId(id);
//    return prestoConn;
//  }
}
