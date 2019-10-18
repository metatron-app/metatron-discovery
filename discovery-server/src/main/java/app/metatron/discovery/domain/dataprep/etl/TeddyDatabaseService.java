package app.metatron.discovery.domain.dataprep.etl;

import static app.metatron.discovery.domain.dataprep.PrepProperties.ETL_LIMIT_ROWS;

import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.util.DbInfo;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class TeddyDatabaseService {

  private static Logger LOGGER = LoggerFactory.getLogger(TeddyExecutor.class);

  private Integer limitRows = null;

  public void setPrepPropertiesInfo(Map<String, Object> prepPropertiesInfo) {
    limitRows = (Integer) prepPropertiesInfo.get(ETL_LIMIT_ROWS);
  }

  public DataFrame loadDatabaseTable(String dsId, String sql, DbInfo db)
          throws SQLException, ClassNotFoundException, TeddyException {
    Statement stmt = getJdbcStatement(db.implementor, db.connectUri, db.username, db.password);
    DataFrame df = new DataFrame();

    LOGGER.info(
            String.format("loadDatabaseTable(): dsId=%s sql=%s, implementor=%s, connectUri=%s, username=%s", dsId, sql,
                    db.implementor, db.connectUri, db.username));

    df.setByJDBC(stmt, sql, limitRows);

    LOGGER.trace("loadJdbcTable(): end");
    return df;
  }

  private Statement getJdbcStatement(String implementor, String connectUri, String username, String password)
          throws SQLException, ClassNotFoundException {

    DataConnection jdbcDataConnection = new DataConnection();
    jdbcDataConnection.setImplementor(implementor);
    jdbcDataConnection.setUsername(username);
    jdbcDataConnection.setPassword(password);
    jdbcDataConnection.setUrl(connectUri);

    JdbcDialect dialect = DataConnectionHelper.lookupDialect(jdbcDataConnection);
    String driverClass = dialect.getDriverClass(jdbcDataConnection);
    try {
      if (driverClass != null) {
        Class.forName(driverClass);
      }
      Connection conn = DriverManager.getConnection(connectUri, jdbcDataConnection.getUsername(),
              jdbcDataConnection.getPassword());
      return conn.createStatement();
    } catch (ClassNotFoundException e) {
      LOGGER.error(String
              .format("getJdbcStatement(): ClassNotFoundException occurred: driver-class-name=%s",
                      driverClass), e);
      throw e;
    } catch (SQLException e) {
      LOGGER.error(String
              .format("getJdbcStatement(): SQLException occurred: connStr=%s username=%s password=%s",
                      connectUri, jdbcDataConnection.getUsername(), jdbcDataConnection.getPassword()), e);
      throw e;
    }
  }

}
