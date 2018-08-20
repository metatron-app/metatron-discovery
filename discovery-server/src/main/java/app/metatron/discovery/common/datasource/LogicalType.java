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
  GIS,          // [lat(latitude),lon(longitude),addr(address)] structure for gis
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
  HTTP_CODE;

  public List<String> getGisStructKeys() {
    return Lists.newArrayList("lat", "lon", "addr");
  }
}
