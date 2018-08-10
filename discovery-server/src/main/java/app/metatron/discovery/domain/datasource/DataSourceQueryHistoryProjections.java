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

package app.metatron.discovery.domain.datasource;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.datasource.data.forward.ResultForward;
import app.metatron.discovery.domain.user.UserProfile;

/**
 * Created by kyungtaak on 2016. 9. 3..
 */
public class DataSourceQueryHistoryProjections extends BaseProjections {

  @Projection(types = DataSourceQueryHistory.class, name = "default")
  public interface DefaultProjection {

    String getId();

    String getDataSourceId();

    String getQuery();

    DataSourceQueryHistory.QueryType getQueryType();

    String getEngineQuery();

    DataSourceQueryHistory.EngineQueryType getEngineQueryType();

    ResultForward.ForwardType getForwardType();

    Boolean getSucceed();

    String getMessage();

    Long getResultCount();

    Long getResultSize();

    Long getElapsedTime();

    Long getEngineElapsedTime();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreator();

  }

  @Projection(types = DataSourceQueryHistory.class, name = "forListView")
  public interface ForListViewProjection {

    String getId();

    String getDataSourceId();

    DataSourceQueryHistory.QueryType getQueryType();

    DataSourceQueryHistory.EngineQueryType getEngineQueryType();

    Boolean getSucceed();

    Long getResultCount();

    Long getResultSize();

    Long getElapsedTime();

    Long getEngineElapsedTime();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreator();

  }
}
