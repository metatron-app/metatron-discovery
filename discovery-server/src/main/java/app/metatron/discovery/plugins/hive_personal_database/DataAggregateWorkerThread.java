package app.metatron.discovery.plugins.hive_personal_database;

import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.extension.dataconnection.jdbc.connector.JdbcConnector;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.plugins.hive_personal_database.entity.DataAggregateTaskHistory;
import app.metatron.discovery.plugins.hive_personal_database.repository.DataAggregateTaskHistoryRepository;
import app.metatron.discovery.util.ApplicationContextProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

public class DataAggregateWorkerThread implements Runnable {
  private static Logger LOGGER = LoggerFactory.getLogger(DataAggregateWorkerThread.class);
  private Long taskId;
  private DataAggregateDataConnection dataConnection;
  private DataAggregateQuery aggregateQuery;

  public DataAggregateWorkerThread(Long taskId, DataAggregateDataConnection dataConnection, DataAggregateQuery aggregateQuery) {
    this.taskId = taskId;
    this.dataConnection = dataConnection;
    this.aggregateQuery= aggregateQuery;
  }

  @Override
  public void run() {
    LOGGER.info("start worker thread...");
    try {
      // 1. DB Connection을 생성한다.
      JdbcDialect jdbcDialect = DataConnectionHelper.lookupDialect(dataConnection);
      JdbcConnector jdbcConnector = DataConnectionHelper.lookupJdbcConnector(dataConnection, jdbcDialect);
      Connection connection = jdbcConnector.getConnection(dataConnection, jdbcDialect, dataConnection.getDatabase(), true, dataConnection.getAdminUsername(), dataConnection.getAdminUserPassword());

      Statement stmt = null;
      String[] rangeOfValues = aggregateQuery.getRangeOfValues();

      // find entity
      DataAggregateTaskHistoryRepository dataAggregateTaskHistoryRepository =
          ApplicationContextProvider.getApplicationContext().getBean(DataAggregateTaskHistoryRepository.class);
      try {
        for (String value : rangeOfValues) {
          // 2.1  동적 쿼리 생성한다....
          // FIXME 쿼리 생성할 때 오류 나면????
          final String query = aggregateQuery.generateDynamicQuery(value);
          DataAggregateTaskHistory history = new DataAggregateTaskHistory(taskId, query);
          dataAggregateTaskHistoryRepository.save(history);

          try {
            stmt = connection.createStatement();
            stmt.execute(String.format("use %s", aggregateQuery.getUseDatabase()));
            stmt.execute("set hive.exec.dynamic.partition.mode=nonstrict");
            LOGGER.info("running query -" + query);
            stmt.execute(query);
            stmt.close();

            history.setStatus("SUCCESS");
            dataAggregateTaskHistoryRepository.save(history);
          } catch (SQLException e) {
            // TODO 문법 오류 시에는 반복문을 실행하지 않고 종료 한다.
            LOGGER.error("Fail to execute query : {}", e.getMessage());
            history.setStatus("FAILURE");
            history.setErrorMessage(e.getMessage());
            dataAggregateTaskHistoryRepository.save(history);
          } finally {
            try { if (stmt != null) stmt.close(); } catch (SQLException se2) { }
          }
        }
        connection.close();
      } catch (SQLException e) {
        LOGGER.error("Fail to execute query2 : {}", e.getMessage());
      } finally {
        try{ if(stmt!=null) stmt.close(); } catch(SQLException se2) {}// nothing we can do
        try{ if(connection!=null)  connection.close(); }catch(SQLException se) { se.printStackTrace();}//end finally try
      }
    } catch (Exception e) {
      e.printStackTrace();
    }

    LOGGER.info("end worker thread...");
  }
}
