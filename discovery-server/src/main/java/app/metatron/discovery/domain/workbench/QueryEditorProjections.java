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

import java.util.List;
import java.util.Set;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.user.UserProfile;

/**
 * Created by kyungtaak on 2016. 11. 29..
 */
public class QueryEditorProjections extends BaseProjections{

  @Projection(name = "default", types = { QueryEditor.class })
  public interface DefaultProjection {

    String getId();

    String getName();

    String getQuery();

    int getOrder();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();

    List<QueryEditorResult> getQueryResults();
  }

  @Projection(name = "forQueryHistory", types = { QueryEditor.class })
  public interface QueryEditorWithHistoryProjection {

    String getId();

    String getName();

    String getQuery();

    int getOrder();

    Set<QueryHistory> getQueryHistories();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();
  }

}
