/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.engine.monitoring;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import app.metatron.discovery.common.BaseProjections;

public class EngineMonitoringProjections extends BaseProjections {

  @Projection(types = EngineMonitoring.class, name = "default")
  public interface DefaultProjection{

    String getId();

    String getType();

    String getHostname();

    String getPort();

    Boolean getStatus();

  }

  @Projection(types = EngineMonitoring.class, name = "forDetailView")
  public interface ForDetailViewProjection{

    String getId();

    String getType();

    String getHostname();

    String getPort();

    Boolean getStatus();

    String getErrorMessage();

    DateTime getErrorTime();

    @Value("#{target.getErrorDuration()}")
    Long getErrorDuration();
  }

  @Projection(types = EngineMonitoring.class, name = "forServerHealth")
  public interface ServerProjection{

    String getType();

    Boolean getStatus();

  }

}
