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

import com.google.common.collect.Maps;

import java.util.Map;

public class Feature implements GeoJson {

  String id;

  GeoJsonGeometry geometry;

  Map<String, Object> properties;

  public Feature() {
  }

  public void addProperties(String key, Object value) {
    if (properties == null) {
      properties = Maps.newLinkedHashMap();
    }

    properties.put(key, value);
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public GeoJsonGeometry getGeometry() {
    return geometry;
  }

  public void setGeometry(GeoJsonGeometry geometry) {
    this.geometry = geometry;
  }

  public Map<String, Object> getProperties() {
    return properties;
  }

}
