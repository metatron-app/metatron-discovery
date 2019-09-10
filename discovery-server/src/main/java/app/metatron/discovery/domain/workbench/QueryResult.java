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

package app.metatron.discovery.domain.workbench;

import com.fasterxml.jackson.annotation.JsonInclude;

import app.metatron.discovery.domain.datasource.Field;
import org.joda.time.DateTime;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
public class QueryResult implements Serializable {

  List<Field> fields;

  @JsonInclude
  List<Map<String,Object>> data;
  
  String runQuery;
  
  Long numRows;

  Long maxNumRows;

  Long defaultNumRows;

  QueryResultStatus queryResultStatus;

  DateTime startDateTime;

  DateTime finishDateTime;

  String message;

  String tempTable;

  String auditId;

  long queryHistoryId;

  String queryEditorId;

  String csvFilePath;

  public enum QueryResultStatus {
    SUCCESS, FAIL, CANCELLED, RUNNING, ALL
  }

  public List<Field> getFields() {
    return fields;
  }

  public void setFields(List<Field> fields) {
    this.fields = fields;
  }

  public List<Map<String, Object>> getData() {
    return data;
  }

  public void setData(List<Map<String, Object>> data) {
    this.data = data;
  }

  public String getRunQuery() {
    return runQuery;
  }

  public void setRunQuery(String runQuery) {
    this.runQuery = runQuery;
  }

  public Long getNumRows() {
    return numRows;
  }

  public void setNumRows(Long numRows) {
    this.numRows = numRows;
  }

  public QueryResultStatus getQueryResultStatus() {
    return queryResultStatus;
  }

  public void setQueryResultStatus(QueryResultStatus queryResultStatus) {
    this.queryResultStatus = queryResultStatus;
  }

  public DateTime getStartDateTime() {
    return startDateTime;
  }

  public void setStartDateTime(DateTime startDateTime) {
    this.startDateTime = startDateTime;
  }

  public DateTime getFinishDateTime() {
    return finishDateTime;
  }

  public void setFinishDateTime(DateTime finishDateTime) {
    this.finishDateTime = finishDateTime;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public String getTempTable() {
    return tempTable;
  }

  public void setTempTable(String tempTable) {
    this.tempTable = tempTable;
  }

  public String getAuditId() {
    return auditId;
  }

  public void setAuditId(String auditId) {
    this.auditId = auditId;
  }

  public long getQueryHistoryId() {
    return queryHistoryId;
  }

  public void setQueryHistoryId(long queryHistoryId) {
    this.queryHistoryId = queryHistoryId;
  }

  public String getQueryEditorId() {
    return queryEditorId;
  }

  public void setQueryEditorId(String queryEditorId) {
    this.queryEditorId = queryEditorId;
  }

  public String getCsvFilePath() {
    return csvFilePath;
  }

  public void setCsvFilePath(String csvFilePath) {
    this.csvFilePath = csvFilePath;
  }

  public Long getMaxNumRows() {
    return maxNumRows;
  }

  public void setMaxNumRows(Long maxNumRows) {
    this.maxNumRows = maxNumRows;
  }

  public Long getDefaultNumRows() {
    return defaultNumRows;
  }

  public void setDefaultNumRows(Long defaultNumRows) {
    this.defaultNumRows = defaultNumRows;
  }

  @Override
  public String toString() {
    return "QueryResult{" +
            "fields=" + fields +
            ", data=" + data +
            ", runQuery='" + runQuery + '\'' +
            ", numRows=" + numRows +
            ", queryResultStatus=" + queryResultStatus +
            ", startDateTime=" + startDateTime +
            ", finishDateTime=" + finishDateTime +
            ", message='" + message + '\'' +
            ", tempTable='" + tempTable + '\'' +
            ", auditId='" + auditId + '\'' +
            ", queryHistoryId=" + queryHistoryId +
            ", queryEditorId='" + queryEditorId + '\'' +
            ", csvFilePath='" + csvFilePath + '\'' +
            '}';
  }
}

