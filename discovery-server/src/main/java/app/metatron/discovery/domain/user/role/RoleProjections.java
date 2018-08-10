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

package app.metatron.discovery.domain.user.role;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;
import java.util.Map;
import java.util.Set;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.user.UserProfile;

/**
 * Created by kyungtaak on 2016. 5. 16..
 */
public class RoleProjections extends BaseProjections {

  @Projection(types = Role.class, name = "default")
  public interface DefaultRoleProjection {
    String getId();

    String getName();

    Boolean getPredefined();
  }

  @Projection(types = Role.class, name = "withPermission")
  public interface RoleWithPermissionProjection {

    String getId();

    String getName();

    Boolean getPredefined();

    Role.RoleScope getScope();

    Boolean getDefaultRole();

    @Value("#{target.getAllPermissionNames()}")
    List<String> getPermissions();
  }

  @Projection(types = Role.class, name = "forListView")
  public interface ForListViewProjection {

    String getId();

    String getName();

    String getDescription();

    Integer getUserCount();

    Integer getGroupCount();

    Boolean getPredefined();

    Boolean getDefaultRole();

  }

  @Projection(types = Role.class, name = "forDetailView")
  public interface ForDetailViewProjection {

    String getId();

    String getName();

    String getDescription();

    Boolean getPredefined();

    Boolean getDefaultRole();

    Integer getUserCount();

    Integer getGroupCount();

    Set<Permission> getPermissions();

    @Value("#{@contextService.getContexts(target)}")
    Map<String, Object> getContexts();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();
  }
}
