package app.metatron.discovery.domain.idcube.hive_personal_database.dto;

import java.util.List;
import java.util.Map;

public class ImportFilePreview {
  private List<String> fields;
  private List<Map<String, Object>> records;
  private Integer totalRecords;
  private List<String> sheets;

  public ImportFilePreview() {
  }

  public ImportFilePreview(List<String> fields, List<Map<String, Object>> records, Integer totalRecords) {
    this.fields = fields;
    this.records = records;
    this.totalRecords = totalRecords;
  }

  public List<String> getFields() {
    return fields;
  }

  public List<Map<String, Object>> getRecords() {
    return records;
  }

  public void setFields(List<String> fields) {
    this.fields = fields;
  }

  public void setRecords(List<Map<String, Object>> records) {
    this.records = records;
  }

  public Integer getTotalRecords() {
    return totalRecords;
  }

  public void setTotalRecords(Integer totalRecords) {
    this.totalRecords = totalRecords;
  }

  public List<String> getSheets() {
    return sheets;
  }

  public void setSheets(List<String> sheets) {
    this.sheets = sheets;
  }
}
