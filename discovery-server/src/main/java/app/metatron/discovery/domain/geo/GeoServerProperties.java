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

package app.metatron.discovery.domain.geo;

import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Map;

import javax.annotation.PostConstruct;

@Component
@ConfigurationProperties(prefix = "polaris.geoserver")
public class GeoServerProperties {

  public final static String DEFAULT_WORKSPACE_NAME = "metatron";

  public final static String URI_WFS = "/geoserver/%s/wfs";
  public final static String URI_REST_PREFIX = "/geoserver/rest";

  public final static String KEY_REST_API_WORKSPACE = "REST_API_WORKSPACE";
  public final static String KEY_REST_API_DATASTORE = "REST_API_DATASTORE";
  public final static String KEY_REST_API_FEATURETYPE = "REST_API_FEATURETYPE";

  String baseUrl;

  String username;

  String password;

  String defaultWorkspace;

  String wfsUrl;

  Map<String, String> restUrls = Maps.newHashMap();

  @PostConstruct
  public void init() {

    if (StringUtils.isEmpty(defaultWorkspace)) {
      defaultWorkspace = DEFAULT_WORKSPACE_NAME;
    }

    wfsUrl = baseUrl + String.format(URI_WFS, defaultWorkspace);

    String restUri = baseUrl + URI_REST_PREFIX;
    String workspaceUrl = restUri + "/workspaces";
    restUrls.put(KEY_REST_API_WORKSPACE, workspaceUrl);

    String dataStoreUrl = workspaceUrl + "/" + defaultWorkspace + "/datastores";
    restUrls.put(KEY_REST_API_DATASTORE, dataStoreUrl);

    String featureTypeUrl = dataStoreUrl + "/%s/featuretypes";
    restUrls.put(KEY_REST_API_FEATURETYPE, featureTypeUrl);

  }

  public String getWfsUrl() {
    return wfsUrl;
  }

  public String getRestDataStoreUrl() {
    return getRestDataStoreUrl(null);
  }

  public String getRestDataStoreUrl(String dataStoreName) {
    String dataStoreUrl = restUrls.get(KEY_REST_API_DATASTORE);
    if (StringUtils.isEmpty(dataStoreName)) {
      return dataStoreUrl;
    }
    return dataStoreUrl + "/" + dataStoreName;
  }

  public String getRestFeatureTypeUrl(String dataStoreName) {
    return String.format(restUrls.get(KEY_REST_API_FEATURETYPE), dataStoreName);
  }

  public String getBaseUrl() {
    return baseUrl;
  }

  public void setBaseUrl(String baseUrl) {
    this.baseUrl = baseUrl;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getDefaultWorkspace() {
    return defaultWorkspace;
  }

  public void setDefaultWorkspace(String defaultWorkspace) {
    this.defaultWorkspace = defaultWorkspace;
  }

}