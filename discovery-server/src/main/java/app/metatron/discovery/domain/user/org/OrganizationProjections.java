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

package app.metatron.discovery.domain.user.org;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.user.UserProfile;

/**
 *
 */
public class OrganizationProjections extends BaseProjections {

  @Projection(types = Organization.class, name = "default")
  public interface DefaultProjection {

    String getId();

    String getName();

    String getDescription();

    String getCode();

    String getCreatedBy();

    DateTime getCreatedTime();

    String getModifiedBy();

    DateTime getModifiedTime();
  }

  @Projection(types = Organization.class, name = "forListView")
  public interface ForListProjection {

    String getId();

    String getName();

    String getDescription();

    String getCode();

    Integer getUserCount();

    Integer getGroupCount();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();
  }

  @Projection(types = Organization.class, name = "forDetailView")
  public interface ForDetailProjection {

    String getId();

    String getName();

    String getDescription();

    String getCode();

    Integer getUserCount();

    Integer getGroupCount();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();

    List<OrganizationMember> getMembers();
  }
}
