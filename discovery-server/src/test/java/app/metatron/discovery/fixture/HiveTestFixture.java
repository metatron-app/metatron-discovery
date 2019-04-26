package app.metatron.discovery.fixture;

import org.apache.hive.jdbc.HiveDriver;
import org.springframework.core.io.InputStreamResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.jdbc.support.JdbcUtils;

import java.io.ByteArrayInputStream;
import java.sql.Connection;
import java.sql.DriverManager;

public class HiveTestFixture {
  // TODO Docker 같은 가상 환경으로 대체해야 함..
  final static String HOST_NAME = "localhost";
  final static String PORT = "10000";
  final static String USER = "test_user";
  final static String PASSWORD = "1111";

  public static void setUpDefaultDatabaseFixture() {
    final String URL = String.format("jdbc:hive2://%s:%s", HOST_NAME, PORT);

    Connection conn = null;
    try{

      Class.forName(HiveDriver.class.getName());
      conn = DriverManager.getConnection(URL, USER, PASSWORD);

      StringBuffer script = new StringBuffer();
      script.append(String.format("DROP DATABASE IF EXISTS metatron_test_db CASCADE;"));
      script.append(String.format("CREATE DATABASE metatron_test_db;"));

      ScriptUtils.executeSqlScript(conn, new InputStreamResource(new ByteArrayInputStream(script.toString().getBytes())));
    } catch(Exception e){
      e.printStackTrace();
    } finally{
      JdbcUtils.closeConnection(conn);
    }

  }
}
