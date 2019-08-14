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

package app.metatron.discovery.domain.workbench.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = ImportExcelFile.class, name = "excel"),
    @JsonSubTypes.Type(value = ImportCsvFile.class, name = "csv"),
})
public abstract class ImportFile {
  private String importType = "new";
  private Boolean firstRowHeadColumnUsed = false;
  private String tableName;
  private String filePath;
  private String webSocketId;
  private String tablePartitionColumn;
  private String databaseName;

  public String getFilePath() {
    return filePath;
  }

  public void setFilePath(String filePath) {
    this.filePath = filePath;
  }

  public String getWebSocketId() {
    return webSocketId;
  }

  public void setWebSocketId(String webSocketId) {
    this.webSocketId = webSocketId;
  }

  public String getTableName() {
    return tableName;
  }

  public void setTableName(String tableName) {
    this.tableName = tableName;
  }

  public Boolean getFirstRowHeadColumnUsed() {
    return firstRowHeadColumnUsed;
  }

  public void setFirstRowHeadColumnUsed(Boolean firstRowHeadColumnUsed) {
    this.firstRowHeadColumnUsed = firstRowHeadColumnUsed;
  }

  public String getTablePartitionColumn() {
    return tablePartitionColumn;
  }

  public void setTablePartitionColumn(String tablePartitionColumn) {
    this.tablePartitionColumn = tablePartitionColumn;
  }

  public String getDatabaseName() {
    return databaseName;
  }

  public void setDatabaseName(String databaseName) {
    this.databaseName = databaseName;
  }

  public String getImportType() {
    return importType;
  }

  public void setImportType(String importType) {
    this.importType = importType;
  }

  public boolean isTableOverwrite() {
    return importType.equalsIgnoreCase("overwrite");
  }

}