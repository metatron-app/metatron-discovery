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

package app.metatron.discovery.domain.datalineage;


import com.querydsl.core.annotations.QueryProjection;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

public class DataLineageDto implements Comparable<DataLineageDto>{
  private String type;
  private String databaseName;
  private String tableName;
  private String fieldName;
  private String fieldType;

  private Long dataLineageId;
  private String sqlQuery;
  private String sqlFileName;
  private DateTime timestamp;
  private String workflowName;
  private Long workflowId;

  @QueryProjection
  public DataLineageDto(String databaseName, String tableName) {
    this.databaseName = databaseName;
    this.tableName = tableName;
    this.type = "TABLE";
  }

  @QueryProjection
  public DataLineageDto(String databaseName, String tableName, String fieldName, String fieldType) {
    this.databaseName = databaseName;
    this.tableName = tableName;
    this.fieldName = fieldName;
    this.fieldType = fieldType;
    this.type = "COLUMN";
  }

  @QueryProjection
  public DataLineageDto(Long dataLineageId, String sqlQuery, DateTime timestamp, String sqlFileName) {
    this.dataLineageId = dataLineageId;
    this.sqlQuery = sqlQuery;
    this.timestamp = timestamp;
    this.sqlFileName = sqlFileName;
    this.type = "SQL";
  }

  @QueryProjection
  public DataLineageDto(Long dataLineageId, String sqlQuery, DateTime timestamp, String sqlFileName,
                        Long workflowId, String workflowName) {
    this.dataLineageId = dataLineageId;
    this.sqlQuery = sqlQuery;
    this.timestamp = timestamp;
    this.sqlFileName = sqlFileName;
    this.workflowId = workflowId;
    this.workflowName = workflowName;
    this.type = "WORKFLOW";
  }

  @Override
  public int compareTo(DataLineageDto entity) {
    int compare = 0;
    if(compare == 0){
      if(StringUtils.isNotEmpty(this.databaseName) && StringUtils.isNotEmpty(entity.databaseName)){
        compare = this.databaseName.compareTo(entity.databaseName);
      } else if(StringUtils.isNotEmpty(this.databaseName)){
        compare = 1;
      } else {
        compare = -1;
      }
    }

    if(compare == 0){
      if(StringUtils.isNotEmpty(this.tableName) && StringUtils.isNotEmpty(entity.tableName)){
        compare = this.tableName.compareTo(entity.tableName);
      } else if(StringUtils.isNotEmpty(this.tableName)){
        compare = 1;
      } else {
        compare = -1;
      }
    }

    if(compare == 0){
      if(StringUtils.isNotEmpty(this.fieldName) && StringUtils.isNotEmpty(entity.fieldName)){
        compare = this.fieldName.compareTo(entity.fieldName);
      } else if(StringUtils.isNotEmpty(this.fieldName)){
        compare = 1;
      } else {
        compare = -1;
      }
    }

    return compare;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getDatabaseName() {
    return databaseName;
  }

  public void setDatabaseName(String databaseName) {
    this.databaseName = databaseName;
  }

  public String getTableName() {
    return tableName;
  }

  public void setTableName(String tableName) {
    this.tableName = tableName;
  }

  public String getFieldName() {
    return fieldName;
  }

  public void setFieldName(String fieldName) {
    this.fieldName = fieldName;
  }

  public String getFieldType() {
    return fieldType;
  }

  public void setFieldType(String fieldType) {
    this.fieldType = fieldType;
  }

  public Long getDataLineageId() {
    return dataLineageId;
  }

  public void setDataLineageId(Long dataLineageId) {
    this.dataLineageId = dataLineageId;
  }

  public String getSqlQuery() {
    return sqlQuery;
  }

  public void setSqlQuery(String sqlQuery) {
    this.sqlQuery = sqlQuery;
  }

  public String getSqlFileName() {
    return sqlFileName;
  }

  public void setSqlFileName(String sqlFileName) {
    this.sqlFileName = sqlFileName;
  }

  public DateTime getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(DateTime timestamp) {
    this.timestamp = timestamp;
  }

  public String getWorkflowName() {
    return workflowName;
  }

  public void setWorkflowName(String workflowName) {
    this.workflowName = workflowName;
  }

  public Long getWorkflowId() {
    return workflowId;
  }

  public void setWorkflowId(Long workflowId) {
    this.workflowId = workflowId;
  }

  @Override
  public String toString() {
    return "DataLineageDto{" +
            "type='" + type + '\'' +
            ", databaseName='" + databaseName + '\'' +
            ", tableName='" + tableName + '\'' +
            ", fieldName='" + fieldName + '\'' +
            ", fieldType='" + fieldType + '\'' +
            ", dataLineageId=" + dataLineageId +
            ", sqlQuery='" + sqlQuery + '\'' +
            ", sqlFileName='" + sqlFileName + '\'' +
            ", timestamp=" + timestamp +
            ", workflowName='" + workflowName + '\'' +
            ", workflowId=" + workflowId +
            '}';
  }
}
