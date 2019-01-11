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
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.Reader;
import java.io.StringWriter;
import java.net.URI;
import java.sql.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class PrepMetaDBMigrationService implements ApplicationListener<ApplicationReadyEvent> {
  private static Logger LOGGER = LoggerFactory.getLogger(PrepMetaDBMigrationService.class);

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

  private final String TBL_NEW_DATASET               = "PR_DATASET";
  private final String TBL_NEW_DATAFLOW              = "PR_DATAFLOW";
  private final String TBL_NEW_DATAFLOW_DATASET      = "PR_DATAFLOW_DATASET";
  private final String TBL_NEW_TRANSFORM_RULE        = "PR_TRANSFORM_RULE";
  private final String TBL_NEW_SNAPSHOT              = "PR_SNAPSHOT";

  private final String TBL_OLD_DATASET               = "PREP_DATASET";
  private final String TBL_OLD_IMPORTED_DATASET_INFO = "PREP_IMPORTED_DATASET_INFO";
  private final String TBL_OLD_DATAFLOW              = "PREP_DATAFLOW";
  private final String TBL_OLD_DATAFLOW_DATASET      = "PREP_DATAFLOW_DATASET";
  private final String TBL_OLD_TRANSFORM_RULE        = "PREP_TRANSFORM_RULE";
  private final String TBL_OLD_SNAPSHOT              = "PREP_SNAPSHOT";

  @Override
  public void onApplicationEvent(ApplicationReadyEvent event) {
    Connection conn;

    if (prepProperties.isMigrateMetaDB() == false) {
      return;
    }

    LOGGER.info("PrepMetaDBMigrationService: started");

    try {
      Class.forName(datasourceDriverClassName);
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
      LOGGER.error("onApplicationEvent(): cannot find driver class", e);
      return;
    }

    try {
      conn = DriverManager.getConnection(datasourceUrl, datasourceUsername, datasourcePassword);
      conn.setAutoCommit(true);
    } catch (SQLException e) {
      e.printStackTrace();
      LOGGER.error("onApplicationEvent(): connectionUrl={} username={} password={}", datasourceUrl, datasourceUsername, datasourcePassword);
      LOGGER.error("onApplicationEvent(): failed to connect to DB", e);
      return;
    }

    try {
      migrateDataset(conn);
      migrateDataflow(conn);
      migrateDataflowDataset(conn);
      migrateTransformRule(conn);
      migrateSnapshot(conn);
    } catch (SQLException e) {
      e.printStackTrace();
    }

    // TODO: drop old tables

    LOGGER.info("PrepMetaDBMigrationService: ended");
  }

  /**
   * @param conn
   * @return skipped row count. -1 if we need to retry.
   * @throws SQLException
   */
  private void migrateDataset(Connection conn) throws SQLException {
    if (!checkOldTableExists(conn, TBL_OLD_DATASET)) {
      return;
    }

    // Unless it fails, we don't skip any wrangled dataset.
    migrateWrangledDataset(conn);

    // Imported datasets can be skipped without blocking migration.
    int skipCount = migrateDatasetImported(conn);
    if (skipCount > 0) {
      LOGGER.info("PrepMetaDBMigrationService: {}, {} migrated with {} rows skipped", TBL_OLD_DATASET, TBL_OLD_IMPORTED_DATASET_INFO, skipCount);
    } else {
      LOGGER.info("PrepMetaDBMigrationService: {}, {} migrated successfully", TBL_OLD_DATASET, TBL_OLD_IMPORTED_DATASET_INFO);
    }
  }

  private void migrateDataflow(Connection conn) throws SQLException {
    if (!checkOldTableExists(conn, TBL_OLD_DATAFLOW)) {
      return;
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

    LOGGER.info("PrepMetaDBMigrationService: {} migrated successfully", TBL_OLD_DATAFLOW);
  }

  private void migrateDataflowDataset(Connection conn) throws SQLException {
    if (!checkOldTableExists(conn, TBL_OLD_DATAFLOW_DATASET)) {
      return;
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

      // skip if the dataflow does not exist
      stmtForCheck = conn.createStatement();
      rowCheckQuery = String.format("SELECT * FROM %s WHERE df_id = '%s'", TBL_NEW_DATAFLOW, rs.getString("df_id"));
      if (!stmtForCheck.executeQuery(rowCheckQuery).next()) {
        continue;
      }

      // skip if the dataset does not exist
      stmtForCheck = conn.createStatement();
      rowCheckQuery = String.format("SELECT * FROM %s WHERE ds_id = '%s'", TBL_NEW_DATASET, rs.getString("ds_id"));
      if (!stmtForCheck.executeQuery(rowCheckQuery).next()) {
        continue;
      }

      Statement stmtForInsert = conn.createStatement();
      String insertDmlFmt = "INSERT INTO %s SELECT * FROM %s WHERE df_id = '%s' AND ds_id='%s'";
      String insertDml = String.format(insertDmlFmt, TBL_NEW_DATAFLOW_DATASET, TBL_OLD_DATAFLOW_DATASET, rs.getString("df_id"), rs.getString("ds_id"));
      stmtForInsert.execute(insertDml);
    }

    LOGGER.info("PrepMetaDBMigrationService: {} migrated successfully", TBL_OLD_DATAFLOW_DATASET);
  }

  private void migrateTransformRule(Connection conn) throws SQLException {
    if (!checkOldTableExists(conn, TBL_OLD_TRANSFORM_RULE)) {
      LOGGER.info("PrepMetaDBMigrationService: migrateTransformRule(): no old transform rule table found");
      return;
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
      String insertDml = String.format(insertDmlFmt, TBL_NEW_TRANSFORM_RULE, TBL_OLD_TRANSFORM_RULE, rs.getString("ds_id"));
      stmtForInsert.execute(insertDml);
    }

    LOGGER.info("PrepMetaDBMigrationService: {} migrated successfully", TBL_OLD_TRANSFORM_RULE);
  }

  private void migrateSnapshot(Connection conn) throws SQLException {
    if (!checkOldTableExists(conn, TBL_OLD_SNAPSHOT)) {
      return;
    }

    Statement stmt = conn.createStatement();
    String selectQuery = String.format("SELECT * FROM %s", TBL_OLD_SNAPSHOT);
    ResultSet rs = stmt.executeQuery(selectQuery);

    int skipCount = 0;

    while (rs.next()) {
      // skip if the same ss_id exists
      Statement stmtForCheck = conn.createStatement();
      String rowCheckQueryFmt = "SELECT * FROM %s WHERE ss_id = '%s'";
      String rowCheckQuery = String.format(rowCheckQueryFmt, TBL_NEW_SNAPSHOT, rs.getString("ss_id"));
      if (stmtForCheck.executeQuery(rowCheckQuery).next()) {
        continue;
      }

      String ssType = rs.getString("ss_type");    // FILE, HDFS, HIVE -> URI, STAGING_DB

      switch (ssType) {
        case "FILE":
        case "HDFS":
          if (!copySnapshotUri(conn, rs)) {
            skipCount++;
          }
          break;
        case "HIVE":
          copySnapshotStagingDb(conn, rs);
          break;
        default:
          LOGGER.error("migrateSnapshot(): invalid ssType: ssType={} ssId={}", ssType, rs.getString("ss_id"));
          skipCount++;
      }
    }

    if (skipCount > 0) {
      LOGGER.info("PrepMetaDBMigrationService: {} migrated with {} rows skipped", TBL_OLD_SNAPSHOT, skipCount);
    } else {
      LOGGER.info("PrepMetaDBMigrationService: {} migrated successfully", TBL_OLD_SNAPSHOT);
    }
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

  /**
   * @param conn
   * @return skipped row count. -1 if we need to retry.
   * @throws SQLException
   */
  private int migrateDatasetImported(Connection conn) throws SQLException {
    Statement stmt = conn.createStatement();
    String selectQueryFmt = "SELECT * FROM %s AS a JOIN %s AS b ON a.ds_id = b.ds_id";
    String selectQuery = String.format(selectQueryFmt, TBL_OLD_DATASET, TBL_OLD_IMPORTED_DATASET_INFO);
    ResultSet rs = stmt.executeQuery(selectQuery);

    int skipCount = 0;

    while (rs.next()) {
      // skip if the same ds_id exists
      Statement stmtForCheck = conn.createStatement();
      String rowCheckQueryFmt = "SELECT * FROM %s WHERE ds_id = '%s'";
      String rowCheckQuery = String.format(rowCheckQueryFmt, TBL_NEW_DATASET, rs.getString("ds_id"));
      if (stmtForCheck.executeQuery(rowCheckQuery).next()) {
        continue;
      }

      assert rs.getString("ds_type").equals("IMPORTED") : rs.getString("ds_type");

      String importType = rs.getString("import_type");
      if (importType == null) {
        LOGGER.error("migrateDatasetImported(): importType missing: dsId={}", rs.getString("ds_id"));
        skipCount++;
      }

      switch (importType) {
        case "FILE":
          if (!copyDatasetImportedFile(conn, rs)) {
            skipCount++;
          }
          break;
        case "DB":
          copyDatasetImportedDatabase(conn, rs);
          break;
        case "HIVE":
          copyDatasetImportedStagingDb(conn, rs);
          break;
        default:
          LOGGER.error("migrateDatasetImported(): invalid importType: importType={} dsId={}", importType, rs.getString("ds_id"));
          skipCount++;
      }
    }
    return skipCount;
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

    insertColVals(conn, TBL_NEW_DATASET, colVals);
  }

  /**
   * @param conn
   * @param rs
   * @return true for success
   * @throws SQLException
   */
  private boolean copyDatasetImportedFile(Connection conn, ResultSet rs) throws SQLException {
    String storedUri;
    String filePath = getCustomValue(rs, "filePath");

    if (filePath.startsWith("/")) {
      storedUri = "file://" + filePath;
    } else {
      storedUri = filePath;
    }

    if (getCustomValue(rs, "sheet") != null) {
      copyImportedFileExcel(conn, rs, storedUri, getCustomValue(rs, "sheet"));
    } else {
      copyImportedFileCsv(conn, rs, storedUri, getCustomValue(rs, "delimiter"));
    }
    return true;
  }

  private void copyImportedFileCsv(Connection conn, ResultSet rs, String storedUri, String delimiter) throws SQLException {
    if (delimiter == null) {
      LOGGER.error("copyImportedFileCsv(): delimiter missing: storedUri={}", storedUri);
      return;
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
    colVals.put("import_type",            "UPLOAD");                  // change enum
    colVals.put("stored_uri",             storedUri);                 // add new column
    copySameCol("total_bytes",            colVals, rs);
    copySameCol("total_lines",            colVals, rs);

    insertColVals(conn, TBL_NEW_DATASET, colVals);
  }

  private void copyImportedFileExcel(Connection conn, ResultSet rs, String storedUri, String sheetName) throws SQLException {
    assert sheetName != null;

    LinkedHashMap<String, Object> colVals = new LinkedHashMap();

    copySameCol("ds_id",                  colVals, rs);
    copySameCol("created_by",             colVals, rs);
    copySameCol("created_time",           colVals, rs);
    copySameCol("modified_by",            colVals, rs);
    copySameCol("modified_time",          colVals, rs);
    copySameCol("version",                colVals, rs);
    colVals.put("delimiter",              ",");                       // add new column
    copySameCol("ds_desc",                colVals, rs);
    copySameCol("ds_name",                colVals, rs);
    copySameCol("ds_type",                colVals, rs);
    colVals.put("file_format",            "EXCEL");                   // add new column
    colVals.put("filename_before_upload", rs.getObject("filename"));  // change column name
    colVals.put("import_type",            "UPLOAD");                  // change enum
    colVals.put("sheet_name",             sheetName);                 // add new column
    colVals.put("stored_uri",             storedUri);                 // add new column
    copySameCol("total_bytes",            colVals, rs);
    copySameCol("total_lines",            colVals, rs);

    insertColVals(conn, TBL_NEW_DATASET, colVals);
  }

  private void copyDatasetImportedDatabase(Connection conn, ResultSet rs) throws SQLException {
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

    insertColVals(conn, TBL_NEW_DATASET, colVals);
  }

  private void copyDatasetImportedStagingDb(Connection conn, ResultSet rs) throws SQLException {
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

    insertColVals(conn, TBL_NEW_DATASET, colVals);
  }

  /**
   * @param conn
   * @param rs
   * @return true for success
   * @throws SQLException
   */
  private boolean copySnapshotUri(Connection conn, ResultSet rs) throws SQLException {
    LinkedHashMap<String, Object> colVals = new LinkedHashMap();

    String ssType = rs.getString("ss_type");
    String storageType = null;
    String storedUri = null;
    String filePath = null;

    String strDir = rs.getString("uri");
    if (strDir == null) {
      LOGGER.error("copySnapshotUri(): no uri stored in local file snapshot: ssId={} ssName={} ssType={}",
                   rs.getString("ss_id"), rs.getString("ss_name"), rs.getString("ss_type"));
      return false;
    }

    switch (ssType) {
      case "FILE":      // We stored `uri` to be the directory of the file. There'll be a single file.
        storageType = "LOCAL";

        try {
          File fileDir = new File(strDir);

          if (!fileDir.exists()) {
            LOGGER.error("copySnapshotUri(): file not found: uri={} ssId={} ssName={} ssType={}",
                         strDir, rs.getString("ss_id"), rs.getString("ss_name"), rs.getString("ss_type"));
            return false;
          } else if (!fileDir.isDirectory()) {
            LOGGER.error("copySnapshotUri(): not a directory: uri={} ssId={} ssName={} ssType={}",
                         strDir, rs.getString("ss_id"), rs.getString("ss_name"), rs.getString("ss_type"));
            return false;
          }

          for (File file : fileDir.listFiles()) {
            filePath = file.getAbsolutePath();
            break;
          }
          if (filePath == null) {
            LOGGER.error("copySnapshotUri(): no file found in directory: uri={} ssId={} ssName={} ssType={}",
                         strDir, rs.getString("ss_id"), rs.getString("ss_name"), rs.getString("ss_type"));
            return false;
          }
          storedUri = new URI("file://" + filePath).toString();
        } catch (Throwable e) {
          e.printStackTrace();
          return false;
        }
        break;

      case "HDFS":      // For HDFS type, we stored  `uri` to be the exact URI.
        storageType = "HDFS";
        storedUri = rs.getString("uri");
        break;

      default:
        // only FILE or HDFS comes here
        assert false : ssType;
    }

    assert storageType != null;
    assert storedUri != null;

    copySameCol("ss_id",           colVals, rs);
    copySameCol("created_by",      colVals, rs);
    copySameCol("created_time",    colVals, rs);
    copySameCol("modified_by",     colVals, rs);
    copySameCol("modified_time",   colVals, rs);
    copySameCol("version",         colVals, rs);
    // no append mode has been used until now
    colVals.put("df_id",           getLineageInfoValue(rs, "dfId"));  // add new column
    colVals.put("df_name",         rs.getObject("creator_df_name"));  // change column name
    colVals.put("ds_id",           getLineageInfoValue(rs, "dsId"));  // add new column
    copySameCol("ds_name",         colVals, rs);
    copySameCol("engine",          colVals, rs);
    copySameCol("finish_time",     colVals, rs);
    copySameCol("launch_time",     colVals, rs);
    colVals.put("lineage_info",    readClob(rs, "lineage_info").replaceAll("\"ruleStringinfos\":", "\"transformRules\":"));
    copySameCol("rule_cnt_done",   colVals, rs);
    copySameCol("rule_cnt_total",  colVals, rs);
    copySameCol("ss_name",         colVals, rs);
    colVals.put("ss_type",         "URI");
    copySameCol("status",          colVals, rs);
    colVals.put("stored_uri",      storedUri);                        // add new column
    copySameCol("total_bytes",     colVals, rs);
    copySameCol("total_lines",     colVals, rs);

    insertColVals(conn, TBL_NEW_SNAPSHOT, colVals);
    return true;
  }

  private void copySnapshotStagingDb(Connection conn, ResultSet rs) throws SQLException {
    LinkedHashMap<String, Object> colVals = new LinkedHashMap();

    copySameCol("ss_id",                 colVals, rs);
    copySameCol("created_by",            colVals, rs);
    copySameCol("created_time",          colVals, rs);
    copySameCol("modified_by",           colVals, rs);
    copySameCol("modified_time",         colVals, rs);
    copySameCol("version",               colVals, rs);
    // no append mode has been used until now
    colVals.put("df_id",                 getLineageInfoValue(rs, "dfId"));  // add new column
    colVals.put("df_name",               rs.getObject("creator_df_name"));  // change column name
    colVals.put("ds_id",                 getLineageInfoValue(rs, "dsId"));  // add new column
    copySameCol("ds_name",               colVals, rs);
    copySameCol("engine",                colVals, rs);
    copySameCol("finish_time",           colVals, rs);
    colVals.put("hive_file_compression", rs.getObject("compression"));      // change column name
    colVals.put("hive_file_format",      rs.getObject("format"));           // change column name
    copySameCol("launch_time",           colVals, rs);
    colVals.put("lineage_info",          readClob(rs, "lineage_info").replaceAll("\"ruleStringinfos\":", "\"transformRules\":"));
    copySameCol("rule_cnt_done",         colVals, rs);
    copySameCol("rule_cnt_total",        colVals, rs);
    copySameCol("ss_name",               colVals, rs);
    colVals.put("ss_type",               "STAGING_DB");
    copySameCol("status",                colVals, rs);
    copySameCol("db_name",               colVals, rs);
    copySameCol("tbl_name",              colVals, rs);
    copySameCol("total_bytes",           colVals, rs);
    copySameCol("total_lines",           colVals, rs);

    insertColVals(conn, TBL_NEW_SNAPSHOT, colVals);
  }

  private boolean checkOldTableExists(Connection conn, String tblName) throws SQLException {
    Statement stmt = conn.createStatement();

    try {
      String tblCheckQuery = String.format("SELECT * FROM %s", tblName);
      stmt.executeQuery(tblCheckQuery);
    } catch (SQLException e) {
      // It will probably be TABLE NOT FOUND: just suppress
      return false;
    }

    return true;
  }

  private void copySameCol(String colName, LinkedHashMap colVals, ResultSet rs) throws SQLException {
    colVals.put(colName, rs.getObject(colName));
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

  private String getCustomValue(ResultSet rs, String key) throws SQLException {
    String custom = readClob(rs, "custom");
    if (custom == null) {
      return null;
    }

    Map customObject;
    try {
      customObject = GlobalObjectMapper.readValue(custom, Map.class);
    } catch (NullPointerException e) {
      return null;
    }

    Object obj = customObject.get(key);
    if (obj == null) {
      return null;
    }
    return (String) obj;
  }

  private String getLineageInfoValue(ResultSet rs, String key) throws SQLException {
    String lineageInfo = readClob(rs, "lineage_info");
    if (lineageInfo == null) {
      return null;
    }

    Map lineageInfoObject;
    try {
      lineageInfoObject = GlobalObjectMapper.readValue(lineageInfo, Map.class);
    } catch (NullPointerException e) {
      return null;
    }

    Object obj = lineageInfoObject.get(key);
    if (obj == null) {
      return null;
    }
    return (String) obj;
  }

  private static String readClob(ResultSet rs, String colName) throws SQLException {
    Clob clob = rs.getClob(colName);
    Reader reader = clob.getCharacterStream();
    StringWriter writer = new StringWriter();

    try {
      IOUtils.copy(reader, writer);
    } catch (IOException e) {
      e.printStackTrace();
      throw new SQLException(e.getMessage());   // This could be regarded as SQLException as well.
                                                // Of course this is for coding convenience.
    }

    return writer.toString();
  }
}

