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

package app.metatron.discovery.domain.audit;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import com.univocity.parsers.annotations.Parsed;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.*;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name="audit")
@org.hibernate.annotations.Entity(dynamicUpdate = true)
public class Audit extends AbstractHistoryEntity implements MetatronDomain<String> {

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  @Parsed
  String id;

  @Column(name="user")
  @Parsed
  String user;

  @Column(name="query_id")
  @Parsed
  String queryId;

  @Lob
  @Column(name="query")
  @Parsed
  String query;

  @Lob
  @Column(name="job_name")
  @Parsed
  String jobName;

  @Column(name="job_id")
  @Parsed
  String jobId;

  @Lob
  @Column(name="job_log")
  @Parsed
  String jobLog;

  @Column(name="logs_link")
  String logsLink;

  @Column(name="task_id")
  @Parsed
  String taskId;


  @Column(name="queue")
  @Parsed
  String queue;

  @Column(name="start_time")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  @Parsed
  DateTime startTime;

  @Column(name="finish_time")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  @Parsed
  DateTime finishTime;

  @Column(name="elapsed_time")
  @Parsed
  Long elapsedTime;

  @Column(name="type")
  @Enumerated(EnumType.STRING)
  @Parsed
  AuditType type;

  @Column(name="status")
  @Enumerated(EnumType.STRING)
  @Parsed
  AuditStatus status;

  @Column(name="dc_id")
  @Parsed
  String dataConnectionId;

  @Column(name="dc_hostname")
  @Parsed
  String dataConnectionHostName;

  @Column(name="dc_database")
  @Parsed
  String dataConnectionDatabase;

  @Column(name="dc_port")
  @Parsed
  Integer dataConnectionPort;

  @Column(name="dc_connect_url")
  @Parsed
  String dataConnectionConnectUrl;

  @Column(name="dc_implementor")
  @Parsed
  String dataConnectionImplementor;

  @Column(name="qh_id")
  @Parsed
  Long queryHistoryId;

  @Lob
  @Column(name="plan")
  @Parsed
  String plan;

  @Column(name="num_rows")
  @Parsed
  Long numRows;


  //Application Info
  @Column(name="application_id")
  @Parsed
  String applicationId;

  @Column(name="application_name")
  @Parsed
  String applicationName;

  @Column(name="application_type")
  @Parsed
  String applicationType;

  @Column(name="application_memory_seconds")
  @Parsed
  Long memorySeconds;

  @Column(name="application_vcore_seconds")
  @Parsed
  Long vcoreSeconds;

  @Column(name="application_memory_seconds_increment")
  @Parsed
  Long incrementMemorySeconds;

  @Column(name="application_vcore_seconds_increment")
  @Parsed
  Long incrementVcoreSeconds;


  public enum AuditStatus {
    SUCCESS, FAIL, RUNNING, CANCELLED
  }

  public enum AuditType {
    QUERY, JOB
  }

  @Override
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getQueryId() {
    return queryId;
  }

  public void setQueryId(String queryId) {
    this.queryId = queryId;
  }

  public String getQuery() {
    return query;
  }

  public void setQuery(String query) {
    this.query = query;
  }

  public String getJobName() {
    return jobName;
  }

  public void setJobName(String jobName) {
    this.jobName = jobName;
  }

  public String getJobId() {
    return jobId;
  }

  public void setJobId(String jobId) {
    this.jobId = jobId;
  }

  public String getJobLog() {
    return jobLog;
  }

  public void setJobLog(String jobLog) {
    this.jobLog = jobLog;
  }

  public String getTaskId() {
    return taskId;
  }

  public void setTaskId(String taskId) {
    this.taskId = taskId;
  }

  public String getQueue() {
    return queue;
  }

  public void setQueue(String queue) {
    this.queue = queue;
  }

  public DateTime getStartTime() {
    return startTime;
  }

  public void setStartTime(DateTime startTime) {
    this.startTime = startTime;
  }

  public DateTime getFinishTime() {
    return finishTime;
  }

  public void setFinishTime(DateTime finishTime) {
    this.finishTime = finishTime;
  }

  public Long getElapsedTime() {
    return elapsedTime;
  }

  public void setElapsedTime(Long elapsedTime) {
    this.elapsedTime = elapsedTime;
  }

  public AuditType getType() {
    return type;
  }

  public void setType(AuditType type) {
    this.type = type;
  }

  public AuditStatus getStatus() {
    return status;
  }

  public void setStatus(AuditStatus status) {
    this.status = status;
  }

  public String getDataConnectionId() {
    return dataConnectionId;
  }

  public void setDataConnectionId(String dataConnectionId) {
    this.dataConnectionId = dataConnectionId;
  }

  public String getDataConnectionHostName() {
    return dataConnectionHostName;
  }

  public void setDataConnectionHostName(String dataConnectionHostName) {
    this.dataConnectionHostName = dataConnectionHostName;
  }

  public String getDataConnectionDatabase() {
    return dataConnectionDatabase;
  }

  public void setDataConnectionDatabase(String dataConnectionDatabase) {
    this.dataConnectionDatabase = dataConnectionDatabase;
  }

  public Integer getDataConnectionPort() {
    return dataConnectionPort;
  }

  public void setDataConnectionPort(Integer dataConnectionPort) {
    this.dataConnectionPort = dataConnectionPort;
  }

  public String getDataConnectionConnectUrl() {
    return dataConnectionConnectUrl;
  }

  public void setDataConnectionConnectUrl(String dataConnectionConnectUrl) {
    this.dataConnectionConnectUrl = dataConnectionConnectUrl;
  }

  public String getDataConnectionImplementor() {
    return dataConnectionImplementor;
  }

  public void setDataConnectionImplementor(String dataConnectionImplementor) {
    this.dataConnectionImplementor = dataConnectionImplementor;
  }

  public Long getQueryHistoryId() {
    return queryHistoryId;
  }

  public void setQueryHistoryId(Long queryHistoryId) {
    this.queryHistoryId = queryHistoryId;
  }

  public String getPlan() {
    return plan;
  }

  public void setPlan(String plan) {
    this.plan = plan;
  }

  public Long getNumRows() {
    return numRows;
  }

  public void setNumRows(Long numRows) {
    this.numRows = numRows;
  }

  public String getApplicationId() {
    return applicationId;
  }

  public void setApplicationId(String applicationId) {
    this.applicationId = applicationId;
  }

  public String getApplicationName() {
    return applicationName;
  }

  public void setApplicationName(String applicationName) {
    this.applicationName = applicationName;
  }

  public String getApplicationType() {
    return applicationType;
  }

  public void setApplicationType(String applicationType) {
    this.applicationType = applicationType;
  }

  public Long getMemorySeconds() {
    return memorySeconds;
  }

  public void setMemorySeconds(Long memorySeconds) {
    this.memorySeconds = memorySeconds;
  }

  public Long getVcoreSeconds() {
    return vcoreSeconds;
  }

  public void setVcoreSeconds(Long vcoreSeconds) {
    this.vcoreSeconds = vcoreSeconds;
  }

  public String getUser() {
    return user;
  }

  public void setUser(String user) {
    this.user = user;
  }

  public List<String> getLogsLink() {
    if(logsLink != null){
      return Arrays.asList(logsLink.split(","));
    }
    return null;
  }

  public void setLogsLink(List<String> logsLink) {
    if(logsLink != null){
      this.logsLink = String.join(",", logsLink);
    } else {
      this.logsLink = null;
    }
  }

  public Long getIncrementMemorySeconds() {
    return incrementMemorySeconds;
  }

  public void setIncrementMemorySeconds(Long incrementMemorySeconds) {
    this.incrementMemorySeconds = incrementMemorySeconds;
  }

  public Long getIncrementVcoreSeconds() {
    return incrementVcoreSeconds;
  }

  public void setIncrementVcoreSeconds(Long incrementVcoreSeconds) {
    this.incrementVcoreSeconds = incrementVcoreSeconds;
  }

  @Override
  public String toString() {
    return "Audit{" +
            "id='" + id + '\'' +
            ", user='" + user + '\'' +
            ", queryId='" + queryId + '\'' +
            ", query='" + query + '\'' +
            ", jobName='" + jobName + '\'' +
            ", jobId='" + jobId + '\'' +
            ", jobLog='" + jobLog + '\'' +
            ", logsLink='" + logsLink + '\'' +
            ", taskId='" + taskId + '\'' +
            ", queue='" + queue + '\'' +
            ", startTime=" + startTime +
            ", finishTime=" + finishTime +
            ", elapsedTime=" + elapsedTime +
            ", type=" + type +
            ", status=" + status +
            ", dataConnectionId='" + dataConnectionId + '\'' +
            ", dataConnectionHostName='" + dataConnectionHostName + '\'' +
            ", dataConnectionDatabase='" + dataConnectionDatabase + '\'' +
            ", dataConnectionPort=" + dataConnectionPort +
            ", dataConnectionConnectUrl='" + dataConnectionConnectUrl + '\'' +
            ", dataConnectionImplementor='" + dataConnectionImplementor + '\'' +
            ", queryHistoryId=" + queryHistoryId +
            ", plan='" + plan + '\'' +
            ", numRows=" + numRows +
            ", applicationId='" + applicationId + '\'' +
            ", applicationName='" + applicationName + '\'' +
            ", applicationType='" + applicationType + '\'' +
            ", memorySeconds=" + memorySeconds +
            ", vcoreSeconds=" + vcoreSeconds +
            ", incrementMemorySeconds=" + incrementMemorySeconds +
            ", incrementVcoreSeconds=" + incrementVcoreSeconds +
            '}';
  }
}
