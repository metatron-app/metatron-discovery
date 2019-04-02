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

package app.metatron.discovery.domain.mdm.source;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.user.UserProfile;

public class MetadataSourceProjections extends BaseProjections {

  @Projection(types = MetadataSource.class, name = "default")
  public interface DefaultProjection {

    String getId();

    String getName();

    Metadata.SourceType getType();

    String getSourceId();
  }

  @Projection(types = MetadataSource.class, name = "forDetailView")
  public interface ForDetailViewProjection {

    String getId();

    String getName();

    Metadata.SourceType getType();

    //String getSourceId();

    @Value("#{@metaSourceService.getSourcesBySourceId(target.type, target.sourceId)}")
    Object getSource();

    String getSchema();

    String getTable();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getCreatedTime();

    DateTime getModifiedTime();
  }

}
