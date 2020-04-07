package app.metatron.discovery.domain.idcube.hive_personal_database.dto;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;

public class DataAggregateTaskHistoryStatusInformation {
  private String start;
  private String end;
  private long elapsedTime;
  private String sql;
  private String status;
  private String errorMessage;

  public DataAggregateTaskHistoryStatusInformation() {
  }

  public DataAggregateTaskHistoryStatusInformation(LocalDateTime start, LocalDateTime end, String sql, String status, String errorMessage) {
    this.start = start == null ? "" : start.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    this.end = end == null ? "" : end.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    this.elapsedTime = (start != null && end != null) ? TimeUnit.MILLISECONDS.toSeconds(Duration.between(start, end).toMillis()) : 0L;
    this.sql = sql;
    this.status = status;
    this.errorMessage = errorMessage;
  }

  public String getStart() {
    return start;
  }

  public void setStart(String start) {
    this.start = start;
  }

  public String getEnd() {
    return end;
  }

  public void setEnd(String end) {
    this.end = end;
  }

  public long getElapsedTime() {
    return elapsedTime;
  }

  public void setElapsedTime(long elapsedTime) {
    this.elapsedTime = elapsedTime;
  }

  public String getSql() {
    return sql;
  }

  public void setSql(String sql) {
    this.sql = sql;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public String getErrorMessage() {
    return errorMessage;
  }

  public void setErrorMessage(String errorMessage) {
    this.errorMessage = errorMessage;
  }
}
