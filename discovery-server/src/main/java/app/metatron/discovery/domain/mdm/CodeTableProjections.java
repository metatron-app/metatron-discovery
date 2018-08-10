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

package app.metatron.discovery.domain.mdm;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.user.UserProfile;

public class CodeTableProjections extends BaseProjections {

  @Projection(types = CodeTable.class, name = "default")
  public interface DefaultProjection {

    String getId();

    String getName();

    String getDescription();
  }

  @Projection(types = CodeTable.class, name = "forListView")
  public interface ForListViewProjection {

    String getId();

    String getName();

    String getDescription();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getCreatedTime();

    DateTime getModifiedTime();
  }

  @Projection(types = CodeTable.class, name = "forDetailView")
  public interface ForDetailViewProjection {

    String getId();

    String getName();

    String getDescription();

    List<CodeValuePair> getCodes();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getCreatedTime();

    DateTime getModifiedTime();
  }

  @Projection(types = CodeTable.class, name = "forCodeView")
  public interface ForCodeViewProjection {

    String getId();

    String getName();

    List<CodeValuePair> getCodes();
  }
}
