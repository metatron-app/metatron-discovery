package app.metatron.discovery.domain.datasource.connection;

import app.metatron.discovery.common.criteria.ListFilterRequest;

import java.util.List;

/**
 * Project : metatron-discovery
 * Created by IntelliJ IDEA
 * Developer : sohncw
 * Date : 2018. 11. 29.
 * Time : PM 7:11
 */
public class DataConnectionFilterRequest extends ListFilterRequest {
  List<String> workspace;
  List<String> userGroup;
  List<Boolean> published;
  List<String> implementor;
  List<String> authenticationType;

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

  public List<Boolean> getPublished() {
    return published;
  }

  public void setPublished(List<Boolean> published) {
    this.published = published;
  }

  public List<String> getImplementor() {
    return implementor;
  }

  public void setImplementor(List<String> implementor) {
    this.implementor = implementor;
  }

  public List<String> getAuthenticationType() {
    return authenticationType;
  }

  public void setAuthenticationType(List<String> authenticationType) {
    this.authenticationType = authenticationType;
  }
}
