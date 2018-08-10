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

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.persistence.Transient;

import app.metatron.discovery.domain.MetatronDomain;

@Entity
@Table(name="data_lineage")
public class DataLineage implements MetatronDomain<Long> {

  @Id
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Column(name = "id")
  Long id;

  @Column(name="source_db_name")
  String sourceDataBaseName;

  @Column(name="source_tb_name")
  String sourceTableName;

  @Column(name="source_field_name")
  String sourceFieldName;

  @Column(name="source_field_type")
  String sourceFieldType;

  @Column(name="source_field_comment")
  String sourceFieldComment;

  @Column(name="target_db_name")
  String targetDataBaseName;

  @Column(name="target_tb_name")
  String targetTableName;

  @Column(name="target_field_name")
  String targetFieldName;

  @Column(name="target_field_type")
  String targetFieldType;

  @Column(name="target_field_comment")
  String targetFieldComment;

  @Column(name="target_table_type")
  String targetTableType;  //Table 타입으로 Table, View, Temporary Table

  @Column(name="target_table_temporary")
  boolean targetTableTemporary;

  @Column(name = "event_time")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  DateTime timestamp;

  @Column(name = "ms")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  DateTime ms;

  @Column(name="cluster")
  String cluster; //Server 종류로 Hive 의 설정 파일 정보에서 가져오게 해야할 것 같음

  @Column(name="current_db")
  String currentDatabase;

  @Column(name="predicate")
  boolean predicate;

  @Column(name="predicate_str", columnDefinition = "TEXT")
  String predicateStr;

  @Column(name="pruning")
  boolean pruning;

  @Column(name="owner")
  String owner;

  @Column(name="job_id")
  String jobId;

  @Column(name="user_ip_addr")
  String userIpAddress;

  @Lob
  @Column(name="sql_query")
  String sqlQuery;

  @Column(name="sql_type")
  String sqlType;

  @Column(name="sql_id")
  String sqlId;

  @Column(name="sql_hash")
  String sqlHash;

  @Column(name="sql_file")
  String sqlFile;

  @Lob
  @Column(name="sql_expr")
  String sqlExpr;

  @Transient
  Long workFlowId;

  @Transient
  String workFlowName;

  public enum SearchScope{
    TABLE, COLUMN, SQL, WORKFLOW
  }

  public enum SqlType{
    QUERY, INSERT, UPDATE, DELETE, CREATETABLE, DROP, TRUNCATETABLE, CREATETABLE_AS_SELECT, INSERT_OVERWRITE, PATH_WRITE
  }

  @Override
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getSourceDataBaseName() {
    return sourceDataBaseName;
  }

  public void setSourceDataBaseName(String sourceDataBaseName) {
    this.sourceDataBaseName = sourceDataBaseName;
  }

  public String getSourceTableName() {
    return sourceTableName;
  }

  public void setSourceTableName(String sourceTableName) {
    this.sourceTableName = sourceTableName;
  }

  public String getSourceFieldName() {
    return sourceFieldName;
  }

  public void setSourceFieldName(String sourceFieldName) {
    this.sourceFieldName = sourceFieldName;
  }

  public String getSourceFieldType() {
    return sourceFieldType;
  }

  public void setSourceFieldType(String sourceFieldType) {
    this.sourceFieldType = sourceFieldType;
  }

  public String getSourceFieldComment() {
    return sourceFieldComment;
  }

  public void setSourceFieldComment(String sourceFieldComment) {
    this.sourceFieldComment = sourceFieldComment;
  }

  public String getTargetDataBaseName() {
    return targetDataBaseName;
  }

  public void setTargetDataBaseName(String targetDataBaseName) {
    this.targetDataBaseName = targetDataBaseName;
  }

  public String getTargetTableName() {
    return targetTableName;
  }

  public void setTargetTableName(String targetTableName) {
    this.targetTableName = targetTableName;
  }

  public String getTargetFieldName() {
    return targetFieldName;
  }

  public void setTargetFieldName(String targetFieldName) {
    this.targetFieldName = targetFieldName;
  }

  public String getTargetFieldType() {
    return targetFieldType;
  }

  public void setTargetFieldType(String targetFieldType) {
    this.targetFieldType = targetFieldType;
  }

  public String getTargetFieldComment() {
    return targetFieldComment;
  }

  public void setTargetFieldComment(String targetFieldComment) {
    this.targetFieldComment = targetFieldComment;
  }

  public String getTargetTableType() {
    return targetTableType;
  }

  public void setTargetTableType(String targetTableType) {
    this.targetTableType = targetTableType;
  }

  public boolean isTargetTableTemporary() {
    return targetTableTemporary;
  }

  public void setTargetTableTemporary(boolean targetTableTemporary) {
    this.targetTableTemporary = targetTableTemporary;
  }

  public DateTime getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(DateTime timestamp) {
    this.timestamp = timestamp;
  }

  public DateTime getMs() {
    return ms;
  }

  public void setMs(DateTime ms) {
    this.ms = ms;
  }

  public String getCluster() {
    return cluster;
  }

  public void setCluster(String cluster) {
    this.cluster = cluster;
  }

  public String getCurrentDatabase() {
    return currentDatabase;
  }

  public void setCurrentDatabase(String currentDatabase) {
    this.currentDatabase = currentDatabase;
  }

  public boolean isPredicate() {
    return predicate;
  }

  public void setPredicate(boolean predicate) {
    this.predicate = predicate;
  }

  public String getPredicateStr() {
    return predicateStr;
  }

  public void setPredicateStr(String predicateStr) {
    this.predicateStr = predicateStr;
  }

  public boolean isPruning() {
    return pruning;
  }

  public void setPruning(boolean pruning) {
    this.pruning = pruning;
  }

  public String getOwner() {
    return owner;
  }

  public void setOwner(String owner) {
    this.owner = owner;
  }

  public String getJobId() {
    return jobId;
  }

  public void setJobId(String jobId) {
    this.jobId = jobId;
  }

  public String getUserIpAddress() {
    return userIpAddress;
  }

  public void setUserIpAddress(String userIpAddress) {
    this.userIpAddress = userIpAddress;
  }

  public String getSqlQuery() {
    return sqlQuery;
  }

  public void setSqlQuery(String sqlQuery) {
    this.sqlQuery = sqlQuery;
  }

  public String getSqlType() {
    return sqlType;
  }

  public void setSqlType(String sqlType) {
    this.sqlType = sqlType;
  }

  public String getSqlId() {
    return sqlId;
  }

  public void setSqlId(String sqlId) {
    this.sqlId = sqlId;
  }

  public String getSqlHash() {
    return sqlHash;
  }

  public void setSqlHash(String sqlHash) {
    this.sqlHash = sqlHash;
  }

  public String getSqlFile() {
    return sqlFile;
  }

  public void setSqlFile(String sqlFile) {
    this.sqlFile = sqlFile;
  }

  public String getSqlExpr() {
    return sqlExpr;
  }

  public void setSqlExpr(String sqlExpr) {
    this.sqlExpr = sqlExpr;
  }

  public Long getWorkFlowId() {
    return workFlowId;
  }

  public void setWorkFlowId(Long workFlowId) {
    this.workFlowId = workFlowId;
  }

  public String getWorkFlowName() {
    return workFlowName;
  }

  public void setWorkFlowName(String workFlowName) {
    this.workFlowName = workFlowName;
  }

  @Override
  public String toString() {
    return "DataLineage{" +
            "id=" + id +
            ", sourceDataBaseName='" + sourceDataBaseName + '\'' +
            ", sourceTableName='" + sourceTableName + '\'' +
            ", sourceFieldName='" + sourceFieldName + '\'' +
            ", sourceFieldType='" + sourceFieldType + '\'' +
            ", sourceFieldComment='" + sourceFieldComment + '\'' +
            ", targetDataBaseName='" + targetDataBaseName + '\'' +
            ", targetTableName='" + targetTableName + '\'' +
            ", targetFieldName='" + targetFieldName + '\'' +
            ", targetFieldType='" + targetFieldType + '\'' +
            ", targetFieldComment='" + targetFieldComment + '\'' +
            ", targetTableType='" + targetTableType + '\'' +
            ", targetTableTemporary=" + targetTableTemporary +
            ", timestamp=" + timestamp +
            ", ms=" + ms +
            ", cluster='" + cluster + '\'' +
            ", currentDatabase='" + currentDatabase + '\'' +
            ", predicate=" + predicate +
            ", predicateStr='" + predicateStr + '\'' +
            ", pruning=" + pruning +
            ", owner='" + owner + '\'' +
            ", jobId='" + jobId + '\'' +
            ", userIpAddress='" + userIpAddress + '\'' +
            ", sqlQuery='" + sqlQuery + '\'' +
            ", sqlType='" + sqlType + '\'' +
            ", sqlId='" + sqlId + '\'' +
            ", sqlHash='" + sqlHash + '\'' +
            ", sqlFile='" + sqlFile + '\'' +
            ", sqlExpr='" + sqlExpr + '\'' +
            ", workFlowId=" + workFlowId +
            ", workFlowName='" + workFlowName + '\'' +
            '}';
  }
}
