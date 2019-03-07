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

package app.metatron.discovery.common.geospatial.geojson;

import java.util.HashMap;
import java.util.Map;

public class Crs {

  public final static Crs WGS84 = Crs.of("urn:ogc:def:crs:EPSG::4326");

  public final static Crs EPSG4326 = WGS84;

  public final static Crs DEFAULT = WGS84;

  private String type;

  private Map<String, Object> properties;

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public Map<String, Object> getProperties() {
    return properties;
  }

  public void setProperties(Map<String, Object> properties) {
    this.properties = properties;
  }

  /**
   * create a name style CRS
   *
   * @param uri name string
   * @return name style crs
   */
  public static Crs of(final String uri) {
    Crs crs = new Crs();
    crs.setType("name");
    crs.setProperties(new HashMap<String, Object>() {
      {
        put("name", uri);
      }
    });
    return crs;
  }

  public static String getName(Crs crs) {
    if (crs == null || crs.getProperties() == null || crs.getProperties().get("name") == null) {
      return null;
    }
    return crs.getProperties().get("name").toString();
  }
}
