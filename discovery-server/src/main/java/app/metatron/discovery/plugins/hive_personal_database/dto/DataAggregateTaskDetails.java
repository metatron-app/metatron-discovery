package app.metatron.discovery.plugins.hive_personal_database.dto;

import java.util.ArrayList;
import java.util.List;

public class DataAggregateTaskDetails {
  private DataAggregateTaskInformation taskInformation;

  private List<DataAggregateTaskHistoryStatusInformation> histories = new ArrayList<>();

  public DataAggregateTaskDetails(DataAggregateTaskInformation taskInformation, List<DataAggregateTaskHistoryStatusInformation> histories) {
    this.taskInformation = taskInformation;
    this.histories = histories;
  }

  public DataAggregateTaskInformation getTaskInformation() {
    return taskInformation;
  }

  public void setTaskInformation(DataAggregateTaskInformation taskInformation) {
    this.taskInformation = taskInformation;
  }

  public List<DataAggregateTaskHistoryStatusInformation> getHistories() {
    return histories;
  }

  public void setHistories(List<DataAggregateTaskHistoryStatusInformation> histories) {
    this.histories = histories;
  }
}
