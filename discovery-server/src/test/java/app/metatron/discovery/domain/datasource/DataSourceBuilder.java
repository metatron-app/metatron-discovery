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

import com.google.common.collect.Lists;

import org.mockito.internal.util.collections.Sets;

import java.util.UUID;

import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.workspace.Workspace;

/**
 * 테스트용 Datasource 모델 Builder
 */
public class DataSourceBuilder {

  private DataSource dataSource = new DataSource();

  public DataSourceBuilder id() {
    dataSource.setId(UUID.randomUUID().toString());
    return this;
  }

  public DataSourceBuilder name(String name) {
    dataSource.setName(name);
    return this;
  }

  public DataSourceBuilder description(String description) {
    dataSource.setDescription(description);
    return this;
  }

  public DataSourceBuilder ownerId(String ownerId) {
    dataSource.setOwnerId(ownerId);
    return this;
  }

  public DataSourceBuilder type(DataSource.DataSourceType type) {
    dataSource.setDsType(type);
    return this;
  }

  public DataSourceBuilder srcType(DataSource.SourceType type) {
    dataSource.setSrcType(type);
    return this;
  }

  public DataSourceBuilder connection(DataConnection connection) {
    dataSource.setConnection(connection);
    return this;
  }

  public DataSourceBuilder fields(Field... field) {
    dataSource.setFields(Lists.newArrayList(field));
    return this;
  }

  public DataSourceBuilder workspaces(Workspace... workspace) {
    dataSource.setWorkspaces(Sets.newSet(workspace));
    return this;
  }

  public DataSourceBuilder published(boolean published) {
    dataSource.setPublished(published);
    return this;
  }
  public DataSource build() {
    return dataSource;
  }
}
