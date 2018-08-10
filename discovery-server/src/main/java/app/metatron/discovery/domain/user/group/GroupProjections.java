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

package app.metatron.discovery.domain.user.group;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.user.UserProfile;

/**
 * Created by kyungtaak on 2016. 5. 16..
 */
public class GroupProjections extends BaseProjections {

  @Projection(types = Group.class, name = "default")
  public interface DefaultProjection {
    String getId();

    String getName();

    Boolean getPredefined();

    Boolean getReadOnly();
  }

  @Projection(types = Group.class, name = "forListView")
  public interface ForListProjection {

    String getId();

    String getName();

    String getDescription();

    Integer getMemberCount();

    Boolean getPredefined();

    Boolean getReadOnly();

    DateTime getCreatedTime();

    DateTime getModifiedTime();
  }

  @Projection(types = Group.class, name = "forDetailView")
  public interface ForDetailProjection {

    String getId();

    String getName();

    String getDescription();

    Integer getMemberCount();

    Boolean getPredefined();

    Boolean getReadOnly();

    @Value("#{@roleService.getRoleNamesByGroupId(target.id)}")
    List<String> getRoleNames();

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
