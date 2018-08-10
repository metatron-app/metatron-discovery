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

package app.metatron.discovery.domain.user;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.BaseProjections;

/**
 * Created by kyungtaak on 2016. 5. 16..
 */
public class UserProjections extends BaseProjections {

  @Projection(types = User.class, name = "default")
  public interface DefaultUserProjection {

    @Value("#{target.username}")
    String getId();

    String getUsername();

    String getFullName();

    String getEmail();

    String getImageUrl();
  }

  @Projection(types = User.class, name = "forDetailView")
  public interface ForDetailProjection {

    @Value("#{target.username}")
    String getId();

    String getUsername();

    String getFullName();

    String getEmail();

    String getTel();

    String getImageUrl();

    User.Status getStatus();

    String getStatusMessage();

    @Value("#{@roleService.getRoleNamesByUsername(target.getUsername())}")
    List<String> getRoleNames();

    @Value("#{@groupService.getJoinedGroupsForProjection(target.getUsername(), true)}")
    List<Map<String, Object>> getGroups();

    DateTime getCreatedTime();

    DateTime getModifiedTime();
  }

  @Projection(types = User.class, name = "forListView")
  public interface ForListProjection {

    @Value("#{target.username}")
    String getId();

    String getUsername();

    String getFullName();

    String getEmail();

    String getImageUrl();

    User.Status getStatus();

    String getStatusMessage();

    @Value("#{@groupService.getJoinedGroupsForProjection(target.getUsername(), false)}")
    List<Map<String, Object>> getGroups();

    DateTime getCreatedTime();
  }

  @Projection(types = User.class, name = "forMemberListView")
  public interface ForMemberListProjection {

    @Value("#{target.username}")
    String getId();

    String getUsername();

    String getFullName();

    String getEmail();

    String getImageUrl();

    @Value("#{@groupService.getJoinedGroupsForProjection(target.getUsername(), false)}")
    List<Map<String, Object>> getGroups();

  }

}
