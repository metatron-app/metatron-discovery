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

package app.metatron.discovery.domain.workbook.configurations.format;

import com.google.common.base.Preconditions;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.lang3.StringUtils;

import java.util.List;

import app.metatron.discovery.common.datasource.LogicalType;

public class GeoHashFormat extends GeoFormat implements FieldFormat {

  /**
   * Type of hash
   */
  String method;

  /**
   * precision value (1~12)
   */
  Integer precision;

  @JsonCreator
  public GeoHashFormat(@JsonProperty("method") String method,
                       @JsonProperty("precision") Integer precision) {

    this.method = StringUtils.isEmpty(method) ? "geohex" : method;

    if (precision == null) {
      this.precision = 4;
    } else {
      Preconditions.checkArgument(precision > 0 && precision < 13, "precision value must be between 1 and 12.");
      this.precision = precision;
    }
  }

  public String toHashExpression(String fieldName) {

    List<String> pointKeyList = LogicalType.GEO_POINT.getGeoPointKeys();
    StringBuilder builder = new StringBuilder();
    builder.append("to_").append(method).append("(");
    builder.append(fieldName).append(".").append(pointKeyList.get(0)).append(",");
    builder.append(fieldName).append(".").append(pointKeyList.get(1)).append(",");
    builder.append(precision).append(")");

    return builder.toString();
  }

  public String toWktExpression(String hashColumnName, String geoColumnName) {

    StringBuilder builder = new StringBuilder();
    builder.append(geoColumnName).append("=");
    builder.append(method).append("_to_boundary_wkt").append("(");
    builder.append(hashColumnName).append(")");

    return builder.toString();
  }

  public String getMethod() {
    return method;
  }

  public Integer getPrecision() {
    return precision;
  }
}
