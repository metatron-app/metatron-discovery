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

package app.metatron.discovery.domain.dataprep;

import app.metatron.discovery.common.GlobalObjectMapper;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.sql.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class PrepMonitorService implements ApplicationListener<ApplicationReadyEvent> {
  private static Logger LOGGER = LoggerFactory.getLogger(PrepMonitorService.class);

  @Autowired
  PrepProperties prepProperties;

  @Value("${spring.datasource.driver-class-name:MISSING_DATASOURCE_DRIVER_CLASS_NAME}")
  String datasourceDriverClassName;

  @Value("${spring.datasource.url:MISSING_DATASOURCE_URL}")
  String datasourceUrl;

  @Value("${spring.datasource.username:MISSING_DATASOURCE_USERNAME}")
  String datasourceUsername;

  @Value("${spring.datasource.password:MISSING_DATASOURCE_PASSWORD}")
  String datasourcePassword;

  private final String TBL_NEW_DATASET               = "pr_dataset";
  private final String TBL_NEW_DATAFLOW              = "pr_dataflow";
  private final String TBL_NEW_DATAFLOW_DATASET      = "pr_dataflow_dataset";
  private final String TBL_NEW_TRANSFORM_RULE        = "pr_transform_rule";
  private final String TBL_NEW_SNAPSHOT              = "pr_snapshot";

  private final String TBL_OLD_DATASET               = "polaris_v2.prep_dataset";
  private final String TBL_OLD_IMPORTED_DATASET_INFO = "polaris_v2.prep_imported_dataset_info";
  private final String TBL_OLD_DATAFLOW              = "polaris_v2.prep_dataflow";
  private final String TBL_OLD_DATAFLOW_DATASET      = "polaris_v2.prep_dataflow_dataset";
  private final String TBL_OLD_TRANSFORM_RULE        = "polaris_v2.prep_transform_rule";
  private final String TBL_OLD_SNAPSHOT              = "polaris_v2.prep_snapshot";

  private boolean dbMigratedAll = false;
  private boolean dbMigratedDataset = false;
  private boolean dbMigratedDataflow = false;
  private boolean dbMigratedDataflowDataset = false;
  private boolean dbMigratedTransformRule = false;
  private boolean dbMigratedSnapshot = false;

  private long lastLogTime;

  @Override
  public void onApplicationEvent(ApplicationReadyEvent event) {
    LOGGER.debug("PrepMonitorService started: pmonInterval={}s pmonLoggingInterval={}s",
            prepProperties.getPmonInterval(), prepProperties.getPmonLoggingInterval());

    dbMigratedAll = migratePrepEntities();
    lastLogTime = DateTime.now().getMillis();

    while (true) {
      try {
        Thread.sleep(prepProperties.getPmonInterval() * 1000);
      } catch (InterruptedException e) {
        e.printStackTrace();
      }

      if (DateTime.now().getMillis() - lastLogTime > prepProperties.getPmonLoggingInterval() * 1000) {
        LOGGER.debug("PrepMonitorService running: pmonInterval={}s pmonLoggingInterval={}s",
                prepProperties.getPmonInterval(), prepProperties.getPmonLoggingInterval());
        lastLogTime = DateTime.now().getMillis();
      }

      if (!dbMigratedAll) {
        dbMigratedAll = migratePrepEntities();
      }
    }
  }

  private boolean migratePrepEntities() {
    Connection conn;

    try {
      Class.forName(datasourceDriverClassName);
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
      LOGGER.error("migratePrepEntities(): cannot find driver class", e);
      return true;    // hopeless
    }

    try {
      conn = DriverManager.getConnection(datasourceUrl, datasourceUsername, datasourcePassword);
      conn.setAutoCommit(true);
    } catch (SQLException e) {
      e.printStackTrace();
      LOGGER.error("migratePrepEntities(): url={} username={} password={}", datasourceUrl, datasourceUsername, datasourcePassword);
      LOGGER.error("migratePrepEntities(): failed to connect to DB", e);
      return false;   // retry
    }

    if (!dbMigratedDataset) {
      try {
        dbMigratedDataset = migrateDataset(conn);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    }

    if (!dbMigratedDataflow) {
      try {
        dbMigratedDataflow = migrateDataflow(conn);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    }

    if (false) {
      try {
        dbMigratedDataflowDataset = migrateDataflowDataset(conn);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    }

    if (false) {
      try {
        dbMigratedTransformRule = migrateTransformRule(conn);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    }

    if (false) {
      try {
        dbMigratedSnapshot = migrateSnapshot(conn);
      } catch (SQLException e) {
        e.printStackTrace();
      }
    }

    return dbMigratedDataset && dbMigratedDataflow && dbMigratedDataflowDataset && dbMigratedTransformRule && dbMigratedSnapshot;
  }

  private void insertColVals(Connection conn, String tblName, LinkedHashMap<String, Object> colVals) throws SQLException {
    List<String> colNames = new ArrayList(colVals.keySet());

    String colList = colNames.stream().collect(Collectors.joining(","));
    String paramList = "";
    for (int i = 0; i < colNames.size(); i++) {
      paramList += "?, ";
    }
    paramList = paramList.substring(0, paramList.length() - 2);

    String psql = String.format("INSERT INTO %s (%s) values (%s)", tblName, colList, paramList);
    PreparedStatement pstmt = conn.prepareStatement(psql);

    for (int i = 0; i < colNames.size(); i++) {
      pstmt.setObject(i + 1, colVals.get(colNames.get(i)));
    }
    pstmt.executeUpdate();
  }

  private void copySameCol(String colName, LinkedHashMap colVals, ResultSet rs) throws SQLException {
    colVals.put(colName, rs.getObject(colName));
  }

  private void copyDatasetWrangled(Connection conn, ResultSet rs) throws SQLException {
    LinkedHashMap<String, Object> colVals = new LinkedHashMap();

    copySameCol("ds_id",         colVals, rs);
    copySameCol("created_by",    colVals, rs);
    copySameCol("created_time",  colVals, rs);
    copySameCol("modified_by",   colVals, rs);
    copySameCol("modified_time", colVals, rs);
    copySameCol("version",       colVals, rs);
    copySameCol("creator_df_id", colVals, rs);
    copySameCol("ds_desc",       colVals, rs);
    copySameCol("ds_name",       colVals, rs);
    copySameCol("ds_type",       colVals, rs);
    copySameCol("rule_cur_idx",  colVals, rs);
    copySameCol("total_bytes",   colVals, rs);
    copySameCol("total_lines",   colVals, rs);

    insertColVals(conn, "pr_dataset", colVals);
  }

  private void copySnapshot(Connection conn, ResultSet rs) throws SQLException {
    LinkedHashMap<String, Object> colVals = new LinkedHashMap();

    // TODO: In case of storage_type LOCAL, storedUri should be attached with part-<master_teddy_ds_id>.csv;
    //       We need to change the code for snapshot detail page, too.

    copySameCol("ss_id",         colVals, rs);
    copySameCol("created_by",    colVals, rs);
    copySameCol("created_time",  colVals, rs);
    copySameCol("modified_by",   colVals, rs);
    copySameCol("modified_time", colVals, rs);
    copySameCol("version",       colVals, rs);
    copySameCol("creator_df_id", colVals, rs);
    copySameCol("ds_desc",       colVals, rs);
    copySameCol("ds_name",       colVals, rs);
    copySameCol("ds_type",       colVals, rs);
    copySameCol("rule_cur_idx",  colVals, rs);
    copySameCol("total_bytes",   colVals, rs);
    copySameCol("total_lines",   colVals, rs);

    insertColVals(conn, "pr_dataset", colVals);
  }

  private void migrateWrangledDataset(Connection conn) throws SQLException {
    String selectSql = String.format("SELECT * FROM %s WHERE ds_type = 'WRANGLED'", TBL_OLD_DATASET);
    Statement stmt = conn.createStatement();
    ResultSet rs = stmt.executeQuery(selectSql);

    while (rs.next()) {
      // skip if the same ds_id exists
      Statement stmtForCheck = conn.createStatement();
      String rowCheckQuery = String.format("SELECT * FROM %s WHERE ds_id = '%s'", TBL_NEW_DATASET, rs.getString("ds_id"));
      if (stmtForCheck.executeQuery(rowCheckQuery).next()) {
        continue;
      }

      copyDatasetWrangled(conn, rs);
    }
  }

  private boolean checkOldTableExists(Connection conn, String tblName) throws SQLException {
    Statement stmt = conn.createStatement();

    try {
      String tblCheckQuery = String.format("SELECT * FROM %s", tblName);
      stmt.executeQuery(tblCheckQuery);
    } catch (SQLException e) {
      // It probably be TABLE NOT FOUND.
      e.printStackTrace();
      LOGGER.info("checkOldTableExists(): no old table: {}", tblName);
      return false;
    }

    return true;
  }

  private boolean migrateTransformRule(Connection conn) throws SQLException {
    if (!checkOldTableExists(conn, TBL_OLD_TRANSFORM_RULE)) {
      return true;
    }

    Statement stmt = conn.createStatement();
    String selectQuery = String.format("SELECT * FROM %s", TBL_OLD_TRANSFORM_RULE);
    ResultSet rs = stmt.executeQuery(selectQuery);

    while (rs.next()) {
      // skip if the same ds_id exists (if any transform rule already exists, then skip all transform rules for the ds_id)
      Statement stmtForCheck = conn.createStatement();
      String rowCheckQueryFmt = "SELECT * FROM %s WHERE ds_id = '%s'";
      String rowCheckQuery = String.format(rowCheckQueryFmt, TBL_NEW_TRANSFORM_RULE, rs.getString("ds_id"));
      if (stmtForCheck.executeQuery(rowCheckQuery).next()) {
        continue;
      }

      Statement stmtForInsert = conn.createStatement();
      String insertDmlFmt = "INSERT INTO %s SELECT * FROM %s WHERE ds_id='%s'";
      String insertDml = String.format(insertDmlFmt, TBL_NEW_DATAFLOW_DATASET, TBL_OLD_DATAFLOW_DATASET, rs.getString("ds_id"));
      stmtForInsert.execute(insertDml);
    }

    return false;   // TODO: to-be true
  }

  private boolean migrateDataflowDataset(Connection conn) throws SQLException {
    if (!checkOldTableExists(conn, TBL_OLD_DATAFLOW_DATASET)) {
      return true;
    }

    Statement stmt = conn.createStatement();
    String selectQuery = String.format("SELECT * FROM %s", TBL_OLD_DATAFLOW_DATASET);
    ResultSet rs = stmt.executeQuery(selectQuery);

    while (rs.next()) {
      // skip if the same df_id and ds_id combination exists
      Statement stmtForCheck = conn.createStatement();
      String rowCheckQueryFmt = "SELECT * FROM %s WHERE df_id = '%s' AND ds_id = '%s'";
      String rowCheckQuery = String.format(rowCheckQueryFmt, TBL_NEW_DATAFLOW_DATASET, rs.getString("df_id"), rs.getString("ds_id"));
      if (stmtForCheck.executeQuery(rowCheckQuery).next()) {
        continue;
      }

      Statement stmtForInsert = conn.createStatement();
      String insertDmlFmt = "INSERT INTO %s SELECT * FROM %s WHERE df_id = '%s' AND ds_id='%s'";
      String insertDml = String.format(insertDmlFmt, TBL_NEW_DATAFLOW_DATASET, TBL_OLD_DATAFLOW_DATASET, rs.getString("df_id"), rs.getString("ds_id"));
      stmtForInsert.execute(insertDml);
    }

    return false;   // TODO: to-be true
  }

  private boolean migrateDataflow(Connection conn) throws SQLException {
    if (!checkOldTableExists(conn, TBL_OLD_DATAFLOW)) {
      return true;
    }

    Statement stmt = conn.createStatement();
    String selectQuery = String.format("SELECT * FROM %s", TBL_OLD_DATAFLOW);
    ResultSet rs = stmt.executeQuery(selectQuery);

    while (rs.next()) {
      // skip if the same df_id exists
      Statement stmtForCheck = conn.createStatement();
      String rowCheckQuery = String.format("SELECT * FROM %s WHERE df_id = '%s'", TBL_NEW_DATAFLOW, rs.getString("df_id"));
      if (stmtForCheck.executeQuery(rowCheckQuery).next()) {
        continue;
      }

      Statement stmtForInsert = conn.createStatement();
      String insertDml = String.format("INSERT INTO %s SELECT * FROM %s WHERE df_id = '%s'", TBL_NEW_DATAFLOW, TBL_OLD_DATAFLOW, rs.getString("df_id"));
      stmtForInsert.execute(insertDml);
    }

    return false;   // TODO: to-be true
  }

  private boolean migrateDataset(Connection conn) throws SQLException {
    if (!checkOldTableExists(conn, TBL_OLD_DATASET)) {
      return true;
    }

    if (!migrateDatasetImported(conn)) {
      return false;
    }

    migrateWrangledDataset(conn);

    return false;   // TODO: to-be true
  }

  private boolean migrateSnapshot(Connection conn) throws SQLException {
    if (!checkOldTableExists(conn, TBL_OLD_SNAPSHOT)) {
      return true;
    }

    Statement stmt = conn.createStatement();
    String selectQuery = String.format("SELECT * FROM %s", TBL_OLD_SNAPSHOT);
    ResultSet rs = stmt.executeQuery(selectQuery);

    while (rs.next()) {
      // skip if the same ss_id exists
      Statement stmtForCheck = conn.createStatement();
      String rowCheckQueryFmt = "SELECT * FROM %s WHERE ss_id = '%s'";
      String rowCheckQuery = String.format(rowCheckQueryFmt, TBL_NEW_SNAPSHOT, rs.getString("ss_id"));
      if (stmtForCheck.executeQuery(rowCheckQuery).next()) {
        continue;
      }

//      Statement stmtForInsert = conn.createStatement();
//      String insertDmlFmt = "INSERT INTO %s SELECT * FROM %s WHERE ds_id='%s'";
//      String insertDml = String.format(insertDmlFmt, TBL_NEW_DATAFLOW_DATASET, TBL_OLD_DATAFLOW_DATASET, rs.getString("ds_id"));
//      stmtForInsert.execute(insertDml);

//      copySnapshot(conn, rs);
    }

    return false;   // TODO: to-be true
  }


  private boolean copyImportedFileCsv(Connection conn, ResultSet rs, String storedUri, String delimiter) throws SQLException {
    if (delimiter == null) {
      LOGGER.error("copyImportedFileCsv(): delimiter missing: storedUri={}", storedUri);
      return false;
    }

    LinkedHashMap<String, Object> colVals = new LinkedHashMap();

    copySameCol("ds_id",                  colVals, rs);
    copySameCol("created_by",             colVals, rs);
    copySameCol("created_time",           colVals, rs);
    copySameCol("modified_by",            colVals, rs);
    copySameCol("modified_time",          colVals, rs);
    copySameCol("version",                colVals, rs);
    colVals.put("delimiter",              delimiter);                 // add new column
    copySameCol("ds_desc",                colVals, rs);
    copySameCol("ds_name",                colVals, rs);
    copySameCol("ds_type",                colVals, rs);
    colVals.put("file_format",            "CSV");                     // add new column
    colVals.put("filename_before_upload", rs.getObject("filename"));  // change column name
    copySameCol("import_type",            colVals, rs);
    colVals.put("storage_type",           rs.getObject("file_type")); // change column name
    colVals.put("stored_uri",             storedUri);                 // add new column
    copySameCol("total_bytes",            colVals, rs);
    copySameCol("total_lines",            colVals, rs);

    insertColVals(conn, "pr_dataset", colVals);
    return true;
  }

  private boolean copyImportedFileExcel(Connection conn, ResultSet rs, String storedUri, String sheetName) throws SQLException {
    assert sheetName != null;

    LinkedHashMap<String, Object> colVals = new LinkedHashMap();

    copySameCol("ds_id",                  colVals, rs);
    copySameCol("created_by",             colVals, rs);
    copySameCol("created_time",           colVals, rs);
    copySameCol("modified_by",            colVals, rs);
    copySameCol("modified_time",          colVals, rs);
    copySameCol("version",                colVals, rs);
    copySameCol("ds_desc",                colVals, rs);
    copySameCol("ds_name",                colVals, rs);
    copySameCol("ds_type",                colVals, rs);
    colVals.put("file_format",            "CSV");                     // add new column
    colVals.put("filename_before_upload", rs.getObject("filename"));  // change column name
    copySameCol("import_type",            colVals, rs);
    colVals.put("sheet_name",             sheetName);                 // add new column
    colVals.put("storage_type",           rs.getObject("file_type")); // change column name
    colVals.put("stored_uri",             storedUri);                 // add new column
    copySameCol("total_bytes",            colVals, rs);
    copySameCol("total_lines",            colVals, rs);

    insertColVals(conn, "pr_dataset", colVals);
    return true;
  }

  private boolean copyDatasetImportedFile(Connection conn, ResultSet rs) throws SQLException {
    String storedUri;

    String fileType = rs.getString("file_type");
    if (fileType == null) {
      LOGGER.error("copyDatasetImportedFile(): fileType missing");
      return false;
    }

    switch (fileType) {
      case "LOCAL":
        storedUri = "file://" + getCustomValue(rs, "filePath");
        break;
      case "HDFS":
        storedUri = getCustomValue(rs, "filePath");
        break;

      default:
        LOGGER.error("copyDatasetImportedFile(): invalid fileType: {}", fileType);
        return false;
    }

    if (getCustomValue(rs, "sheet") != null) {
      if (!copyImportedFileExcel(conn, rs, storedUri, getCustomValue(rs, "sheet"))) {
        return false;
      }
    } else {
      if (!copyImportedFileCsv(conn, rs, storedUri, getCustomValue(rs, "delimiter"))) {
        return false;
      }
    }
    return true;
  }

  private boolean copyDatasetImportedDatabase(Connection conn, ResultSet rs) throws SQLException {
    LinkedHashMap<String, Object> colVals = new LinkedHashMap();

    copySameCol("ds_id",         colVals, rs);
    copySameCol("created_by",    colVals, rs);
    copySameCol("created_time",  colVals, rs);
    copySameCol("modified_by",   colVals, rs);
    copySameCol("modified_time", colVals, rs);
    copySameCol("version",       colVals, rs);
    colVals.put("db_name",       getCustomValue(rs, "databaseName"));                         // add new column
    copySameCol("dc_id",         colVals, rs);
    copySameCol("ds_desc",       colVals, rs);
    copySameCol("ds_name",       colVals, rs);
    copySameCol("ds_type",       colVals, rs);
    colVals.put("import_type",   "DATABASE");                                                 // change enum
    copySameCol("query_stmt",    colVals, rs);
    colVals.put("rs_type",       rs.getString("rs_type").equals("SQL") ? "QUERY" : "TABLE");  // change enum
    colVals.put("tbl_name",      rs.getObject("table_name"));                                 // change column name
    // no total_bytes for Database type dataset
    copySameCol("total_lines",   colVals, rs);

    insertColVals(conn, "pr_dataset", colVals);
    return true;
  }

  private boolean copyDatasetImportedStagingDb(Connection conn, ResultSet rs) throws SQLException {
    LinkedHashMap<String, Object> colVals = new LinkedHashMap();

    copySameCol("ds_id",         colVals, rs);
    copySameCol("created_by",    colVals, rs);
    copySameCol("created_time",  colVals, rs);
    copySameCol("modified_by",   colVals, rs);
    copySameCol("modified_time", colVals, rs);
    copySameCol("version",       colVals, rs);
    colVals.put("db_name",       getCustomValue(rs, "databaseName"));                         // add new column
    copySameCol("ds_desc",       colVals, rs);
    copySameCol("ds_name",       colVals, rs);
    copySameCol("ds_type",       colVals, rs);
    colVals.put("import_type",   "STAGING_DB");                                               // change enum
    copySameCol("query_stmt",    colVals, rs);
    colVals.put("rs_type",       rs.getString("rs_type").equals("SQL") ? "QUERY" : "TABLE");  // change enum
    colVals.put("tbl_name",      rs.getObject("table_name"));                                 // change column name
    copySameCol("total_bytes",   colVals, rs);
    copySameCol("total_lines",   colVals, rs);

    insertColVals(conn, "pr_dataset", colVals);
    return true;
  }

  private boolean migrateDatasetImported(Connection conn) throws SQLException {
    Statement stmt = conn.createStatement();
    String selectQueryFmt = "SELECT * FROM %s AS a JOIN %s AS b ON a.ds_id = b.ds_id";
    String selectQuery = String.format(selectQueryFmt, TBL_OLD_DATASET, TBL_OLD_IMPORTED_DATASET_INFO);
    ResultSet rs = stmt.executeQuery(selectQuery);

    while (rs.next()) {
      // skip if the same ds_id exists
      Statement stmtForCheck = conn.createStatement();
      String rowCheckQuery = String.format("SELECT * FROM pr_dataset WHERE ds_id = '%s'", rs.getString("ds_id"));
      if (stmtForCheck.executeQuery(rowCheckQuery).next()) {
        continue;
      }

      assert rs.getString("ds_type").equals("IMPORTED") : rs.getString("ds_type");

      String importType = rs.getString("import_type");
      if (importType == null) {
        LOGGER.error("migrateDatasetImported(): importType missing");
        return false;
      }

      switch (importType) {
        case "FILE":
          if (!copyDatasetImportedFile(conn, rs)) {
            return false;
          }
          break;

        case "DB":
          if (!copyDatasetImportedDatabase(conn, rs)) {
            return false;
          }
          break;

        case "HIVE":
          if (!copyDatasetImportedStagingDb(conn, rs)) {
            return false;
          }
          break;

        default:
          LOGGER.error("migrateDatasetImported(): invalid importType: {}", importType);
          return false;
      }
    }
    return true;
  }

  private String getCustomValue(ResultSet rs, String key) throws SQLException {
    String custom = rs.getString("custom");
    if (custom == null) {
      return null;
    }

    Map customObject = GlobalObjectMapper.readValue(custom, Map.class);
    return (String) customObject.get(key);
  }

}

