package app.metatron.discovery.domain.idcube.hive_personal_database.dto;

public class DataAggregateSource {
  private String database;
  private String query;

  public DataAggregateSource() {
  }

  public DataAggregateSource(String database, String query) {
    this.database = database;
    this.query = query;
  }

  public String getDatabase() {
    return database;
  }

  public void setDatabase(String database) {
    this.database = database;
  }

  public String getQuery() {
    return query;
  }

  public void setQuery(String query) {
    this.query = query;
  }

  @Override
  public String toString() {
    return "DataAggregateSource{" +
        "database='" + database + '\'' +
        ", query='" + query + '\'' +
        '}';
  }

  public void validate() {

  }
}
