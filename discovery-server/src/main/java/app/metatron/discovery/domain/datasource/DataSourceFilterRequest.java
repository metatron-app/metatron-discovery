/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.datasource;

import java.util.List;

import app.metatron.discovery.common.criteria.ListFilterRequest;

/**
 *
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
