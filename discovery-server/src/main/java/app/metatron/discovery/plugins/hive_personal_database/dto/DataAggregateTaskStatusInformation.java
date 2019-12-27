package app.metatron.discovery.plugins.hive_personal_database.dto;

public class DataAggregateTaskStatusInformation {
  private Long id;
  private String name;
  private String status;

  public DataAggregateTaskStatusInformation() {
  }

  public DataAggregateTaskStatusInformation(Long id, String name, String status) {
    this.id = id;
    this.name = name;
    this.status = status;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
}
