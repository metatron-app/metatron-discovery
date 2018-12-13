package app.metatron.discovery.domain.datasource.connection.dto;

public class RenameDatabaseTable {
  private String webSocketId;
  private String table;

  public String getWebSocketId() {
    return webSocketId;
  }

  public void setWebSocketId(String webSocketId) {
    this.webSocketId = webSocketId;
  }

  public String getTable() {
    return table;
  }

  public void setTable(String table) {
    this.table = table;
  }

  @Override
  public String toString() {
    return "RenameDatabaseTable{" +
        "webSocketId='" + webSocketId + '\'' +
        ", table='" + table + '\'' +
        '}';
  }
}
