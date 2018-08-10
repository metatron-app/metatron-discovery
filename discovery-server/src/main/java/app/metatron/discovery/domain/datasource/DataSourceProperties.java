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

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Created by kyungtaak on 2016. 12. 11..
 */
@Component
@ConfigurationProperties(prefix = "polaris.datasource")
public class DataSourceProperties {

  Map<String, List<String>> connections;

  public Map<String, List<String>> getConnections() {
    return connections;
  }

  public void setConnections(Map<String, List<String>> connections) {
    this.connections = connections;
  }
}
