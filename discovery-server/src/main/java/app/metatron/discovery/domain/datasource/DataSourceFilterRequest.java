package app.metatron.discovery.domain.datasource;

import org.joda.time.DateTime;

import java.util.List;

/**
 * Project : metatron-discovery-build
 * Created by IntelliJ IDEA
 * Developer : sohncw
 * Date : 2018. 11. 21.
 * Time : AM 10:40
 */
public class DataSourceFilterRequest {
  List<String> status;
  List<String> workspace;
  List<String> createdBy;
  List<String> userGroup;
  DateTime createdTimeFrom;
  DateTime createdTimeTo;
  DateTime modifiedTimeFrom;
  DateTime modifiedTimeTo;
  String containsText;
  List<String> dataSourceType;
  List<String> sourceType;
  List<String> connectionType;

  public List<String> getStatus() {
    return status;
  }

  public void setStatus(List<String> status) {
    this.status = status;
  }

  public List<String> getWorkspace() {
    return workspace;
  }

  public void setWorkspace(List<String> workspace) {
    this.workspace = workspace;
  }

  public List<String> getCreatedBy() {
    return createdBy;
  }

  public void setCreatedBy(List<String> createdBy) {
    this.createdBy = createdBy;
  }

  public List<String> getUserGroup() {
    return userGroup;
  }

  public void setUserGroup(List<String> userGroup) {
    this.userGroup = userGroup;
  }

  public DateTime getCreatedTimeFrom() {
    return createdTimeFrom;
  }

  public void setCreatedTimeFrom(DateTime createdTimeFrom) {
    this.createdTimeFrom = createdTimeFrom;
  }

  public DateTime getCreatedTimeTo() {
    return createdTimeTo;
  }

  public void setCreatedTimeTo(DateTime createdTimeTo) {
    this.createdTimeTo = createdTimeTo;
  }

  public DateTime getModifiedTimeFrom() {
    return modifiedTimeFrom;
  }

  public void setModifiedTimeFrom(DateTime modifiedTimeFrom) {
    this.modifiedTimeFrom = modifiedTimeFrom;
  }

  public DateTime getModifiedTimeTo() {
    return modifiedTimeTo;
  }

  public void setModifiedTimeTo(DateTime modifiedTimeTo) {
    this.modifiedTimeTo = modifiedTimeTo;
  }

  public String getContainsText() {
    return containsText;
  }

  public void setContainsText(String containsText) {
    this.containsText = containsText;
  }

  public List<String> getDataSourceType() {
    return dataSourceType;
  }

  public void setDataSourceType(List<String> dataSourceType) {
    this.dataSourceType = dataSourceType;
  }

  public List<String> getSourceType() {
    return sourceType;
  }

  public void setSourceType(List<String> sourceType) {
    this.sourceType = sourceType;
  }

  public List<String> getConnectionType() {
    return connectionType;
  }

  public void setConnectionType(List<String> connectionType) {
    this.connectionType = connectionType;
  }
}
