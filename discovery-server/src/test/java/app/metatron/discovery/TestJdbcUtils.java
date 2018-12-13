package app.metatron.discovery;

import org.springframework.core.io.InputStreamResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.jdbc.support.JdbcUtils;

import java.io.ByteArrayInputStream;
import java.sql.Connection;

public class TestJdbcUtils {

  public static void executeSqlScript(Connection conn, String script) {
    try{
      ScriptUtils.executeSqlScript(conn, new InputStreamResource(new ByteArrayInputStream(script.getBytes())));
    } catch(Exception e){
      e.printStackTrace();
    } finally{
      JdbcUtils.closeConnection(conn);
    }
  }
}
