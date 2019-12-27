package app.metatron.discovery.plugins.hive_personal_database.entity;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.plugins.hive_personal_database.DataAggregateDataConnection;
import app.metatron.discovery.plugins.hive_personal_database.dto.DataAggregateTaskInformation;
import app.metatron.discovery.plugins.hive_personal_database.dto.DataAggregateTaskStatusInformation;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "plugin_hive_personal_database_data_aggregate_tasks")
public class DataAggregateTask {
  @Id
  @GeneratedValue
  private Long id;

  private String name;

  @Column(name = "thread_name")
  private String threadName;

  @Column(name = "workbench_id")
  private String workbenchId;

  @Column(name = "task_information", length = 65535, columnDefinition = "TEXT")
  private String taskInformation;

  @Column(name = "data_connection_information", length = 65535, columnDefinition = "TEXT")
  private String dataConnectionInformation;

  private LocalDateTime createdAt;

  public DataAggregateTask() {
  }

  public DataAggregateTask(String name, String workbenchId, DataAggregateDataConnection dataConnectionInformation, DataAggregateTaskInformation taskInformation, String threadName) {
    this.name = name;
    this.workbenchId = workbenchId;
    this.dataConnectionInformation = GlobalObjectMapper.writeValueAsString(dataConnectionInformation);
    this.taskInformation = GlobalObjectMapper.writeValueAsString(taskInformation);
    this.threadName = threadName;
    this.createdAt = LocalDateTime.now();
  }

  public Long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getDataConnectionInformation() {
    return dataConnectionInformation;
  }

  public String getTaskInformation() {
    return taskInformation;
  }

  public String getWorkbenchId() {
    return workbenchId;
  }

  public String getThreadName() {
    return threadName;
  }

  public DataAggregateTaskStatusInformation getStatusInformation() {
    Thread aThread = getThreadByName();
    final String status = aThread == null ? "종료" : aThread.isAlive() ? "실행 중" : "종료";
    return new DataAggregateTaskStatusInformation(id, name, status);
  }

  private Thread getThreadByName() {
    for (Thread t : Thread.getAllStackTraces().keySet()) {
      if (t.getName().equals(threadName)) return t;
    }
    return null;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public DataAggregateTaskInformation getTaskInformationObject() {
    return GlobalObjectMapper.readValue(this.taskInformation, DataAggregateTaskInformation.class);
  }
}
