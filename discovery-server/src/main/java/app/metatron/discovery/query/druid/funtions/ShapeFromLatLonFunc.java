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

package app.metatron.discovery.query.druid.funtions;

import app.metatron.discovery.common.datasource.LogicalType;

public class ShapeFromLatLonFunc {

  private static final String FUNC_NAME = "shape_fromLatLon";

  String pointGeometry;

  public ShapeFromLatLonFunc() {
  }

  public ShapeFromLatLonFunc(String pointGeometry) {
    this.pointGeometry = pointGeometry;
  }

  public String toExpression() {

    StringBuilder sb = new StringBuilder();
    sb.append(FUNC_NAME).append("( ");
    sb.append(pointGeometry + "." + LogicalType.GEO_POINT.getGeoPointKeys().get(0)).append(", ");
    sb.append(pointGeometry + "." + LogicalType.GEO_POINT.getGeoPointKeys().get(1));
    sb.append(" )");

    return sb.toString();
  }
}
