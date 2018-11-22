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
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

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
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.geo.model;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import java.util.List;
import java.util.Map;

public class GeoDataStore {

  String name;

  String type;

  Map<String, Object> connectionParameters;

  public GeoDataStore(String name,
                      Integer numOfConnection, Integer readTimeout, String brokerUrl) {
    this.name = name;
    this.type = "Druid";
    this.connectionParameters = Maps.newHashMap();

    numOfConnection = numOfConnection == null ? 5 : numOfConnection;
    readTimeout = readTimeout == null ? -1 : readTimeout;

    List<Map<String, Object>> entry = Lists.newArrayList();

    Map<String, Object> numOfConProp = Maps.newLinkedHashMap();
    numOfConProp.put("@key", "num_connection");
    numOfConProp.put("$", numOfConnection + "");
    entry.add(numOfConProp);

    Map<String, Object> nameOfDataSource = Maps.newLinkedHashMap();
    nameOfDataSource.put("@key", "datasource_name");
    nameOfDataSource.put("$", name);
    entry.add(nameOfDataSource);

    Map<String, Object> timeout = Maps.newLinkedHashMap();
    timeout.put("@key", "read_timeout");
    timeout.put("$", readTimeout + "");
    entry.add(timeout);

    Map<String, Object> broker = Maps.newLinkedHashMap();
    broker.put("@key", "druid_broker");
    broker.put("$", brokerUrl);
    entry.add(broker);

    connectionParameters.put("entry", entry);

  }

  public String getName() {
    return name;
  }

  public String getType() {
    return type;
  }

  public Map<String, Object> getConnectionParameters() {
    return connectionParameters;
  }
}
