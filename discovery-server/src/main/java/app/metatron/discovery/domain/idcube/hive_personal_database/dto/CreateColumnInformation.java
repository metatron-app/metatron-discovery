package app.metatron.discovery.domain.idcube.hive_personal_database.dto;

public class CreateColumnInformation {
  private String columnType;
  private String columnName;
  private String columnDataType;

  public CreateColumnInformation() {
  }

  public CreateColumnInformation(String columnType, String columnName, String columnDataType) {
    this.columnType = columnType;
    this.columnName = columnName;
    this.columnDataType = columnDataType;
  }

  public String getColumnType() {
    return columnType;
  }

  public void setColumnType(String columnType) {
    this.columnType = columnType;
  }

  public String getColumnName() {
    return columnName;
  }

  public void setColumnName(String columnName) {
    this.columnName = columnName;
  }

  public String getColumnDataType() {
    return columnDataType;
  }

  public void setColumnDataType(String columnDataType) {
    this.columnDataType = columnDataType;
  }
}
