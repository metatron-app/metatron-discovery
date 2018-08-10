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

import org.springframework.data.rest.core.config.Projection;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.user.DirectoryProfile;

/**
 * Created by kyungtaak on 2016. 5. 16..
 */
public class RoleDirectoryProjections extends BaseProjections {

  @Projection(types = RoleDirectory.class, name = "default")
  public interface DefaultProjection {

    String getDirectoryId();

    String getDirectoryName();

    DirectoryProfile.Type getType();
  }

  @Projection(types = RoleDirectory.class, name = "forListView")
  public interface ForListViewProjection {

    String getId();

    String getName();

    String getDescription();

    Boolean getPredefined();

    Boolean getDefaultRole();

  }

}
