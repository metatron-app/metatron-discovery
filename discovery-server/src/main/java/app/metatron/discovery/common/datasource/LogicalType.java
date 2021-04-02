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

package app.metatron.discovery.common.datasource;

import com.google.common.collect.Lists;

import java.util.List;

/**
 * Common Logical Type
 */
public enum LogicalType {
  STRING,
  BOOLEAN,
  NUMBER,       // Integer or Double
  INTEGER,
  DOUBLE,
  TIMESTAMP,
  LNG,
  LNT,
  GEO_POINT,          // [lat(latitude),lon(longitude)] structure for GEO
  GEO_LINE,
  GEO_POLYGON,
  ARRAY,
  STRUCT,
  MAP_KEY,
  MAP_VALUE,
  IP_V4,         // IPv4 Address
  DISTRICT,      // District
  EMAIL,
  SEX,
  CREDIT_CARD,   // Credit card
  NIN,           // National Indentification Number (eq. SSN)
  POSTAL_CODE,
  PHONE_NUMBER,  // Phone Number
  URL,
  HTTP_CODE,
  HASHED_MAP;

  public List<String> getGeoPointKeys() {
    return Lists.newArrayList("lat", "lon", "coord");
  }

  public boolean isGeoType() {
    if (this == GEO_POINT || this == GEO_LINE || this == GEO_POLYGON) {
      return true;
    }
    return false;
  }

  public boolean isShape() {
    if (this == GEO_LINE || this == GEO_POLYGON) {
      return true;
    }
    return false;
  }

  public boolean isPoint() {
    if (this == GEO_POINT) {
      return true;
    }
    return false;
  }

  public String toEngineMetricType() {
    switch (this) {
      case STRING:
        return "string";
      case INTEGER:
        return "long";
      case ARRAY:
        return "array.double";
      case DOUBLE:
      default:
        return "double";
    }
  }
}
