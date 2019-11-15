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

package app.metatron.discovery.domain.dataconnection;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import app.metatron.discovery.domain.user.UserProfile;

/**
 * Created by kyungtaak on 2016. 11. 12..
 */
public class DataConnectionProjections {

  @Projection(name = "default", types = { DataConnection.class })
  public interface defaultProjection {

    String getId();

    String getName();

    String getDescription();

    String getType();

    String getImplementor();

    String getHostname();

    String getPort();

    String getUrl();

    String getDatabase();

    String getCatalog();

    String getSid();

    DataConnection.AuthenticationType getAuthenticationType();

    String getUsername();

    String getPassword();

    Boolean getPublished();

    Integer getLinkedWorkspaces();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();

    @Value("#{target.getPropertiesMap()}")
    Object getProperties();

    @Value("#{@jdbcConnectionService.isSupportSaveAsHiveTable(target)}")
    Boolean isSupportSaveAsHiveTable();

    @Value("#{@jdbcConnectionService.getConnectionInformation(target)}")
    Object getConnectionInformation();

    @Value("#{@jdbcConnectionService.getHivePersonalDatasourceInformation(target)}")
    Object getHivePersonalDatasourceInformation();
  }

  @Projection(name = "forSimpleListView", types = { DataConnection.class })
  public interface ForSimpleListViewProjection {

    String getId();

    String getName();

    String getType();

    String getImplementor();

  }

  @Projection(name = "list", types = { DataConnection.class })
  public interface listProjection {

    String getId();

    String getName();

    String getDescription();

    String getType();

    String getImplementor();

    String getHostname();

    String getPort();

    String getUrl();

    String getDatabase();

    String getAuthenticationType();

    Boolean getPublished();

    Integer getLinkedWorkspaces();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();
  }

}
