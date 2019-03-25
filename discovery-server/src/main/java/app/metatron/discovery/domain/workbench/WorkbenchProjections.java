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

package app.metatron.discovery.domain.workbench;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;
import org.springframework.stereotype.Component;

import java.util.Set;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.user.UserProfile;
import app.metatron.discovery.domain.workspace.WorkspaceProjections;

/**
 * Created by kyungtaak on 2016. 11. 29..
 */
@Component
public class WorkbenchProjections extends BaseProjections{

  @Projection(name = "workbenchDefault", types = { Workbench.class })
  public interface DefaultProjection {

    String getId();

    String getType();

    String getName();

    String getDescription();

    String getFolderId();

    String getDatabaseName();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();
  }

  @Projection(name = "workbenchDetail", types = { Workbench.class })
  public interface DetailViewProjection {

    String getId();

    String getType();

    String getName();

    String getDescription();

    String getFolderId();

    String getGlobalVar();

    WorkspaceProjections.HeaderViewProjection getWorkspace();

    @Value("#{target.dataConnection.getDataConnectionProjection(@projectionFactory, T(app.metatron.discovery.domain.dataconnection.DataConnectionProjections$defaultProjection))}")
    Object getDataConnection();
    //DataConnectionProjections.defaultProjection getDataConnection();

    Set<QueryEditor> getQueryEditors();

    String getDatabaseName();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();
  }

  @Projection(name = "workbenchNavigation", types = { Workbench.class })
  public interface WorkbenchNavigationProjection {

    String getId();

    String getType();

    String getName();

    String getDescription();

    String getFolderId();

//    WorkspaceProjections.HeaderViewProjection getWorkspace();

    @Value("#{target.workspace.id}")
    String getWorkspaceId();

    @Value("#{target.workspace.name}")
    String getWorkspaceName();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();
  }

}
