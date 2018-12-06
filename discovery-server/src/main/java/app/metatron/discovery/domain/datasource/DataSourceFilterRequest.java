package app.metatron.discovery.domain.datasource;

import app.metatron.discovery.common.criteria.ListFilterRequest;

import java.util.List;

/**
 * Project : metatron-discovery-build
 * Created by IntelliJ IDEA
 * Developer : sohncw
 * Date : 2018. 11. 21.
 * Time : AM 10:40
 */
public class DataSourceFilterRequest extends ListFilterRequest {
  List<String> status;
  List<String> workspace;
  List<String> userGroup;
  List<String> dataSourceType;
  List<String> sourceType;
  List<String> connectionType;
  List<Boolean> published;

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

  public List<String> getUserGroup() {
    return userGroup;
  }

  public void setUserGroup(List<String> userGroup) {
    this.userGroup = userGroup;
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

  public List<Boolean> getPublished() {
    return published;
  }

  public void setPublished(List<Boolean> published) {
    this.published = published;
  }
}
