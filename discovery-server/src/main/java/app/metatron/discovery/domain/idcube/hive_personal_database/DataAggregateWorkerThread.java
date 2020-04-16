package app.metatron.discovery.domain.idcube.hive_personal_database;

import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.workbench.WorkbenchProperties;
import app.metatron.discovery.domain.workbench.hive.DataTable;
import app.metatron.discovery.domain.workbench.hive.DataTableHiveRepository;
import app.metatron.discovery.domain.workbench.hive.HivePersonalDatasource;
import app.metatron.discovery.extension.dataconnection.jdbc.connector.JdbcConnector;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.domain.idcube.hive_personal_database.entity.DataAggregateTaskHistory;
import app.metatron.discovery.domain.idcube.hive_personal_database.repository.DataAggregateTaskHistoryRepository;
import app.metatron.discovery.util.ApplicationContextProvider;
import org.apache.hadoop.fs.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    String[] rangeOfValues = aggregateQuery.getRangeOfValues();

    // find entity
    DataAggregateTaskHistoryRepository dataAggregateTaskHistoryRepository =
        ApplicationContextProvider.getApplicationContext().getBean(DataAggregateTaskHistoryRepository.class);

    JdbcDialect jdbcDialect = DataConnectionHelper.lookupDialect(dataConnection);
    JdbcConnector jdbcConnector = DataConnectionHelper.lookupJdbcConnector(dataConnection, jdbcDialect);
    Connection readConnection = jdbcConnector.getConnection(dataConnection, jdbcDialect, dataConnection.getDatabase(), true, dataConnection.getUsername(), dataConnection.getPassword());
    Connection writeConnection = jdbcConnector.getConnection(dataConnection, jdbcDialect, dataConnection.getDatabase(), true, dataConnection.getAdminUsername(), dataConnection.getAdminUserPassword());

    try {
      for (String value : rangeOfValues) {
        // FIXME 쿼리 생성할 때 오류 나면????
        final String query = aggregateQuery.generateSelectQuery(value);
        DataAggregateTaskHistory history = new DataAggregateTaskHistory(taskId, query);
        dataAggregateTaskHistoryRepository.save(history);

        try {
          // 1. Read Data
          DataTable dataTable = executeQuery(readConnection, query);

          // 2. Write Data
          insertDataTable(writeConnection, dataTable, value);

          history.setStatus("SUCCESS");
          dataAggregateTaskHistoryRepository.save(history);
        } catch (Exception e) {
          // TODO 문법 오류 시에는 반복문을 실행하지 않고 종료 한다.
          LOGGER.error("Fail to execute query : {}", e.getMessage());
          history.setStatus("FAILURE");
          history.setErrorMessage(e.getMessage());
          dataAggregateTaskHistoryRepository.save(history);
        }
      }
    } finally {
      try{ if(readConnection != null)  readConnection.close(); }catch(SQLException se) { se.printStackTrace();}//end finally try
      try{ if(writeConnection != null)  writeConnection.close(); }catch(SQLException se) { se.printStackTrace();}//end finally try
    }

    LOGGER.info("end worker thread...");
  }

  private DataTable executeQuery(Connection connection, final String query) throws Exception {
    Statement stmt = null;
    DataTable dataTable;
    try {
      stmt = connection.createStatement();
      stmt.execute(String.format("use %s", aggregateQuery.getUseDatabase()));
      LOGGER.info("running select query -" + query);
      ResultSet resultSet = stmt.executeQuery(query);
      dataTable = convertResultSetToDataTable(resultSet);
    } catch (Exception e) {
      throw e;
    } finally {
      try{ if(stmt != null) stmt.close(); } catch(SQLException se2) {}// nothing we can do
    }

    return dataTable;
  }

  private DataTable convertResultSetToDataTable(ResultSet rs) throws SQLException {
    ResultSetMetaData md = rs.getMetaData();
    int columns = md.getColumnCount();
    List<String> fields = new ArrayList<>();
    for(int i=1; i <= md.getColumnCount(); i++) {
      fields.add(md.getColumnName(i));
    }

    List<Map<String,Object>> records = new ArrayList<>();
    while(rs.next()) {
      Map<String,Object> row = new HashMap<>(columns);
      for(int i=1; i<=columns; ++i) {
        row.put(md.getColumnName(i), rs.getObject(i));
      }
      records.add(row);
    }

    return new DataTable(fields, records);
  }

  private void insertDataTable(Connection connection, DataTable dataTable, String rangeOfValue) throws Exception {
    // 1. hdfs에 저장
    DataTableHiveRepository dataTableHiveRepository = ApplicationContextProvider.getApplicationContext().getBean(DataTableHiveRepository.class);
    WorkbenchProperties workbenchProperties = ApplicationContextProvider.getApplicationContext().getBean(WorkbenchProperties.class);

    HivePersonalDatasource hivePersonalDatasource =
        new HivePersonalDatasource(dataConnection.getHdfsConfPath(), dataConnection.getAdminUsername(), dataConnection.getAdminUserPassword(), "");

    String hdfsDataFilePath = dataTableHiveRepository.saveToHdfs(hivePersonalDatasource, new Path(workbenchProperties.getTempDataTableHdfsPath()), dataTable, "");

    // 2. load data
    Statement stmt = null;
    try {
      stmt = connection.createStatement();
      stmt.execute(String.format("use %s", aggregateQuery.getUseDatabase()));
//      stmt.execute("set hive.exec.dynamic.partition.mode=nonstrict");
      final String query = aggregateQuery.generateInsertQuery(hdfsDataFilePath, rangeOfValue);
      LOGGER.info("running insert query -" + query);
      stmt.execute(query);
    } catch (Exception e) {
      throw e;
    } finally {
      try{ if(stmt != null) stmt.close(); } catch(SQLException se2) {}// nothing we can do
    }
  }
}
