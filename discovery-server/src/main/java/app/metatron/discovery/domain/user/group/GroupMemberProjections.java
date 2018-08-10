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

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import app.metatron.discovery.domain.user.UserProfile;

/**
 *
 */
public class GroupMemberProjections {

  @Projection(name = "default", types = { GroupMember.class })
  public interface DefaultProjection {

    String getMemberId();

    String getMemberName();

  }

  @Projection(name = "forListView", types = { GroupMember.class })
  public interface ForListViewProjection {

    String getMemberId();

    String getMemberName();

    // TODO: 최적화된 방안 찾아볼것!
    @Value("#{@cachedUserService.findUserProfile(target.getMemberId())}")
    UserProfile getProfile();

  }

  @Projection(name = "forDetailView", types = { GroupMember.class })
  public interface ForDetailViewProjection {

    String getMemberId();

    String getMemberName();

    @Value("#{@cachedUserService.findUserProfile(target.getMemberId())}")
    UserProfile getProfile();
  }

}
