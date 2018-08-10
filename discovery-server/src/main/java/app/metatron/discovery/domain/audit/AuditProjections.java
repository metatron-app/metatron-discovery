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

package app.metatron.discovery.domain.audit;

import org.joda.time.DateTime;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;

import app.metatron.discovery.common.BaseProjections;

/**
 * Created by kyungtaak on 2016. 11. 29..
 */
public class AuditProjections extends BaseProjections{

  @Projection(name = "default", types = { Audit.class })
  public interface DefaultProjection {

    String getId();

    String getQuery();

    String getUser();

    String getJobName();

    String getApplicationId();

    String getApplicationType();

    String getApplicationName();

    String getQueue();

    DateTime getStartTime();

    DateTime getFinishTime();

    Long getElapsedTime();

    Audit.AuditType getType();

    Audit.AuditStatus getStatus();

    String getJobLog();

    String getDataConnectionId();

    String getPlan();

    String getCreatedBy();

    DateTime getCreatedTime();

    String getModifiedBy();

    DateTime getModifiedTime();

    Long getNumRows();

    Long getIncrementMemorySeconds();

    Long getIncrementVcoreSeconds();
  }

  @Projection(name = "list", types = { Audit.class })
  public interface ListProjection {

    String getId();

    String getQuery();

    String getUser();

    String getJobName();

    String getJobId();

    String getApplicationId();

    String getQueue();

    DateTime getStartTime();

    DateTime getFinishTime();

    Long getElapsedTime();

    Audit.AuditType getType();

    Audit.AuditStatus getStatus();

    String getCreatedBy();

    DateTime getCreatedTime();

    String getModifiedBy();

    DateTime getModifiedTime();

    Long getNumRows();

    List<String> getLogsLink();
  }

  @Projection(name = "detail", types = { Audit.class })
  public interface DetailQueryProjection {

    String getId();

    String getQuery();

    String getUser();

    String getJobName();

    String getJobId();

    String getApplicationId();

    String getApplicationType();

    String getApplicationName();

    String getQueue();

    DateTime getStartTime();

    DateTime getFinishTime();

    Long getElapsedTime();

    Audit.AuditType getType();

    Audit.AuditStatus getStatus();

    String getJobLog();

    String getDataConnectionId();

    String getDataConnectionHostName();

    String getDataConnectionDatabase();

    Integer getDataConnectionPort();

    String getDataConnectionConnectUrl();

    String getDataConnectionImplementor();

    String getPlan();

    Long getNumRows();

    Long getIncrementMemorySeconds();

    Long getIncrementVcoreSeconds();

    String getCreatedBy();

    DateTime getCreatedTime();

    String getModifiedBy();

    DateTime getModifiedTime();

    List<String> getLogsLink();
  }

}
