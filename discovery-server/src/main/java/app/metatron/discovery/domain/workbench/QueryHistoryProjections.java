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

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.user.UserProfile;

/**
 * Created by kyungtaak on 2016. 11. 29..
 */
public class QueryHistoryProjections extends BaseProjections{

  @Projection(name = "default", types = { QueryHistory.class })
  public interface DefaultProjection {

    Long getId();

    String getQuery();

    String getQueryLog();

    DateTime getQueryStartTime();

    DateTime getQueryFinishTime();

    Long getQueryTimeTaken();

    Long getNumRows();

    QueryResult.QueryResultStatus getQueryResultStatus();

    QueryEditor getQueryEditor();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();
  }

  @Projection(name = "forListView", types = { QueryHistory.class })
  public interface ListProjection {

    Long getId();

    String getQuery();

    String getQueryLog();

    QueryResult.QueryResultStatus getQueryResultStatus();

    Long getQueryTimeTaken();

    Long getNumRows();

//    @Value("#{T(app.metatron.discovery.util.TimeUtils).millisecondToString(target.queryTimeTaken, null)}")
//    String getQueryTimeTakenFormatted();

    @Value("#{target.getQueryTimeTakenFormatted()}")
    String getQueryTimeTakenFormatted();

    DateTime getQueryStartTime();

    DateTime getQueryFinishTime();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();
  }
}
