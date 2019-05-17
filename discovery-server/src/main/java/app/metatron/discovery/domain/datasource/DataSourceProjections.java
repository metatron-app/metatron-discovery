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

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;
import app.metatron.discovery.domain.user.UserProfile;

/**
 *
 */
public class DataSourceProjections extends BaseProjections {

  @Projection(types = DataSource.class, name = "default")
  public interface DefaultProjection {

    String getId();

    String getName();

    String getEngineName();

    String getDescription();

    DataSource.DataSourceType getDsType();

    DataSource.ConnectionType getConnType();

    DataSource.SourceType getSrcType();

    DataSource.Status getStatus();

    Boolean getPublished();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getCreatedTime();

    DateTime getModifiedTime();

  }

  @Projection(types = DataSource.class, name = "forSimpleView")
  public interface ForSimpleViewProjection {

    String getId();

    String getName();

    String getEngineName();

    String getDescription();

  }

  @Projection(types = DataSource.class, name = "forListView")
  public interface ForListProjection {

    String getId();

    String getName();

    String getEngineName();

    String getDescription();

    DataSource.DataSourceType getDsType();

    DataSource.ConnectionType getConnType();

    DataSource.SourceType getSrcType();

    String getIngestionType();

    DataSource.Status getStatus();

    Boolean getPublished();

    Integer getLinkedWorkspaces();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getCreatedTime();

    DateTime getModifiedTime();

    Boolean getFieldsMatched();
  }

  @Projection(types = DataSource.class, name = "forListInWorkspaceView")
  public interface ForListInWorkspaceProjection {

    String getId();

    String getName();

    String getEngineName();

    String getDescription();

    DataSource.ConnectionType getConnType();

    Boolean getPublished();

    DataSource.Status getStatus();

    Integer getLinkedWorkspaces();

    DataSourceSummary getSummary();

    List<Field> getFields();

    DateTime getModifiedTime();

  }

  @Projection(types = DataSource.class, name = "forDetailView")
  public interface ForDetailProjection {

    String getId();

    String getName();

    String getEngineName();

    String getDescription();

    DataSource.DataSourceType getDsType();

    DataSource.ConnectionType getConnType();

    DataSourceSummary getSummary();

    @Value("#{target.findUnloadedField()}")
    List<Field> getFields();

    @Value("#{target.getIngestionInfo()}")
    IngestionInfo getIngestion();

    DataConnection getConnection();

    PrSnapshot getSnapshot();

    Integer getLinkedWorkspaces();

    Boolean getPublished();

    String getGranularity();

    String getSegGranularity();

    DataSource.Status getStatus();

    DataSource.SourceType getSrcType();

    DataSourceTemporary getTemporary();

    @Value("#{@contextService.getContexts(target)}")
    Map<String, Object> getContexts();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getCreatedTime();

    DateTime getModifiedTime();

    Boolean getFieldsMatched();
  }

  @Projection(types = DataSource.class, name = "forAllFieldDetailView")
  public interface ForDetailIncludeAllFieldProjection {

    String getId();

    String getName();

    String getEngineName();

    String getDescription();

    DataSource.DataSourceType getDsType();

    DataSource.ConnectionType getConnType();

    DataSourceSummary getSummary();

    List<Field> getFields();

    @Value("#{target.getIngestionInfo()}")
    IngestionInfo getIngestion();

    DataConnection getConnection();

    Integer getLinkedWorkspaces();

    Boolean getPublished();

    String getGranularity();

    String getSegGranularity();

    DataSource.Status getStatus();

    DataSource.SourceType getSrcType();

    DataSourceTemporary getTemporary();

    @Value("#{@contextService.getContexts(target)}")
    Map<String, Object> getContexts();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getCreatedTime();

    DateTime getModifiedTime();

    Boolean getFieldsMatched();
  }

}
