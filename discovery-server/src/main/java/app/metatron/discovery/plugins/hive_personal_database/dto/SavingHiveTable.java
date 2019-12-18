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

package app.metatron.discovery.plugins.hive_personal_database.dto;

import app.metatron.discovery.domain.workbench.hive.DataTable;
import org.apache.commons.lang3.StringUtils;

public class SavingHiveTable {
  private String importType;
  private String databaseName;
  private String tableName;
  private String tablePartitionColumn;
  private DataTable dataTable;
  private String hdfsDataFilePath;

  public SavingHiveTable(final ImportFile importFile, final String hdfsDataFilePath, final DataTable dataTable) {
//    if(StringUtils.isNotEmpty(importFile.getDatabaseName())) {
//      if(AuthUtils.getPermissions().contains("PERM_SYSTEM_MANAGE_DATASOURCE")) {
//        this.databaseName = importFile.getDatabaseName();
//      } else {
//        throw new WorkbenchException(WorkbenchErrorCodes.NO_OTHER_DATABASE_PERMISSION, "No other database permissions.");
//      }
//    } else {
//      this.databaseName = String.format("%s_%s", personalDatabasePrefix, importFile.getLoginUserId());
//    }

    this.importType = importFile.getImportType();
    this.databaseName = importFile.getDatabaseName();
    this.tableName = importFile.getTableName();
    this.tablePartitionColumn = importFile.getTablePartitionColumn();
    this.hdfsDataFilePath = hdfsDataFilePath;
    this.dataTable = dataTable;
  }

  public String getTableName() {
    return tableName;
  }

  public String getTablePartitionColumn() {
    return tablePartitionColumn;
  }

  public DataTable getDataTable() {
    return dataTable;
  }

  public String getHdfsDataFilePath() {
    return hdfsDataFilePath;
  }

  public String getDatabaseName() {
    return databaseName;
  }

  public boolean isPartitioningTable() {
    return StringUtils.isNotEmpty(this.tablePartitionColumn);
  }

  public boolean isTableOverwrite() {
    return importType.equalsIgnoreCase("overwrite");
  }

  public String getImportType() {
    return importType;
  }

  public void setTablePartitionColumn(String tablePartitionColumn) {
    this.tablePartitionColumn = tablePartitionColumn;
  }
}
