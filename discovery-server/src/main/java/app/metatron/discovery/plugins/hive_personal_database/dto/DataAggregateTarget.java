package app.metatron.discovery.plugins.hive_personal_database.dto;

public class DataAggregateTarget {
  private String database;
  private String table;

  public DataAggregateTarget() {
  }

  public DataAggregateTarget(String database, String table) {
    this.database = database;
    this.table = table;
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

  @Override
  public String toString() {
    return "DataAggregateTarget{" +
        "database='" + database + '\'' +
        ", table='" + table + '\'' +
        '}';
  }

  public void validate() {

  }
}
