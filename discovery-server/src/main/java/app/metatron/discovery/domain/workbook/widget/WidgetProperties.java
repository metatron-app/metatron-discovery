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

package app.metatron.discovery.domain.workbook.widget;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "polaris.widget")
public class WidgetProperties {

  /**
   * Map Configurations
   */
  MapView mapView;

  public MapView getMapView() {
    return mapView;
  }

  public void setMapView(MapView mapView) {
    this.mapView = mapView;
  }

  public static class MapView {

    /**
     * Default Base Map Name
     */
    private String defaultBaseMap;

    /**
     * Whether to use only the custom base map
     */
    private Boolean overrideBaseMap;

    /**
     * List of base map
     */
    private List<BaseMap> baseMaps;

    public String getDefaultBaseMap() {
      return defaultBaseMap;
    }

    public void setDefaultBaseMap(String defaultBaseMap) {
      this.defaultBaseMap = defaultBaseMap;
    }

    public Boolean getOverrideBaseMap() {
      return overrideBaseMap;
    }

    public void setOverrideBaseMap(Boolean overrideBaseMap) {
      this.overrideBaseMap = overrideBaseMap;
    }

    public List<BaseMap> getBaseMaps() {
      return baseMaps;
    }

    public void setBaseMaps(List<BaseMap> baseMaps) {
      this.baseMaps = baseMaps;
    }
  }

  public static class BaseMap {

    /**
     * Base Map Name
     */
    private String name;

    /**
     * Base Map Url
     */
    private String url;

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getUrl() {
      return url;
    }

    public void setUrl(String url) {
      this.url = url;
    }
  }

}
