package app.metatron.discovery.domain.idcube.hive_personal_database.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "plugin_hive_personal_database_data_aggregate_task_histories")
public class DataAggregateTaskHistory {
  @Id
  @GeneratedValue
  private Long id;

  @Column(name ="task_id")
  private Long taskId;

  private LocalDateTime startTime;

  private LocalDateTime endTime;

  private LocalDateTime expiredTime;

  private String query;

  private String status;

  @Column(name = "error_message", length = 65535, columnDefinition = "TEXT")
  private String errorMessage;

  public DataAggregateTaskHistory() {
  }

  public DataAggregateTaskHistory(Long taskId, String sql) {
    this.taskId = taskId;
    this.startTime = LocalDateTime.now();
    this.status = "RUNNING";
    this.expiredTime = startTime.plusMinutes(30);
    this.query = sql;
  }

  public Long getId() {
    return id;
  }

  public void setEndTime(LocalDateTime endTime) {
    this.endTime = endTime;
  }

  public void setStatus(String status) {
    this.status = status;
    this.endTime = LocalDateTime.now();
  }

  public void setErrorMessage(String errorMessage) {
    this.errorMessage = errorMessage;
  }

  public Long getTaskId() {
    return taskId;
  }

  public LocalDateTime getStartTime() {
    return startTime;
  }

  public LocalDateTime getEndTime() {
    return endTime;
  }

  public LocalDateTime getExpiredTime() {
    return expiredTime;
  }

  public String getStatus() {
    return status;
  }

  public String getErrorMessage() {
    return errorMessage;
  }

  public String getQuery() {
    return query;
  }
}
