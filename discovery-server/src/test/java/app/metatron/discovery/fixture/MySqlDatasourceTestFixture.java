package app.metatron.discovery.fixture;

import com.facebook.presto.jdbc.internal.guava.base.Charsets;
import com.facebook.presto.jdbc.internal.guava.io.Resources;
import org.springframework.core.io.InputStreamResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.jdbc.support.JdbcUtils;

import java.io.ByteArrayInputStream;
import java.sql.Connection;
import java.sql.DriverManager;

public class MySqlDatasourceTestFixture {

  public static void setUpPaymentFixture() {
    // TODO Docker 같은 가상 환경의 MySQL 위치로 대체해야 함..
    final String URL = "jdbc:mysql://localhost:3306";
    final String TEST_DB_NAME = "test_sales_for_metatron";

    Connection conn = null;
    try{
      Class.forName(com.mysql.jdbc.Driver.class.getName());
      conn = DriverManager.getConnection(URL, "root", "1111");

      StringBuffer script = new StringBuffer();
      script.append(String.format("CREATE DATABASE IF NOT EXISTS %s;", TEST_DB_NAME));
      script.append(String.format("use %s;", TEST_DB_NAME));
      script.append(Resources.toString(MySqlDatasourceTestFixture.class.getClassLoader().getResource("fixture/mysql/payment.sql"), Charsets.UTF_8));

      ScriptUtils.executeSqlScript(conn, new InputStreamResource(new ByteArrayInputStream(script.toString().getBytes())));
    } catch(Exception e){
      e.printStackTrace();
    } finally{
      JdbcUtils.closeConnection(conn);
    }
  }
}
