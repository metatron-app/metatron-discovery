package app.metatron.discovery.plugins.hive_personal_database.dto;

import java.util.List;

public class CreateTableInformation {
  private String webSocketId;
  private String database;
  private String table;
  private List<CreateColumnInformation> columns;

  public String getWebSocketId() {
    return webSocketId;
  }

  public void setWebSocketId(String webSocketId) {
    this.webSocketId = webSocketId;
  }

  public String getDatabase() {
    return database;
  }

  public void setDatabase(String database) {
    this.database = database;
  }

  public String getTable() {
    return table;
  }

  public void setTable(String table) {
    this.table = table;
  }

  public List<CreateColumnInformation> getColumns() {
    return columns;
  }

  public void setColumns(List<CreateColumnInformation> columns) {
    this.columns = columns;
  }
}
