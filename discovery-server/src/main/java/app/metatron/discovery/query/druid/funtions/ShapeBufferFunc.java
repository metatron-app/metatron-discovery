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

import static app.metatron.discovery.query.druid.funtions.ShapeBufferFunc.EndCapStyle.FLAT;

public class ShapeBufferFunc {

  private static final String FUNC_NAME = "geom_buffer";

  String shapeExpr;

  /**
   * meter unit
   */
  Integer distance;

  /**
   * Round or flat
   */
  EndCapStyle endCapStyle;

  public ShapeBufferFunc() {
  }

  public ShapeBufferFunc(String shapeExpr, Integer distance, EndCapStyle endCapStyle) {
    this.shapeExpr = shapeExpr;
    this.distance = (distance == null) ? 100 : distance;
    this.endCapStyle = (endCapStyle == null) ? FLAT : endCapStyle;
  }

  public String toExpression() {
    StringBuilder sb = new StringBuilder();
    sb.append(FUNC_NAME).append("(");
    sb.append(shapeExpr).append(",");
    sb.append(distance);
    if (endCapStyle == null) {
      sb.append(",").append("endCapStyle=").append(endCapStyle.value());
    }
    sb.append(")");
    return sb.toString();
  }

  public enum EndCapStyle {

    ROUND(1), FLAT(2);

    Integer style;

    EndCapStyle(Integer style) {
      this.style = style;
    }

    public Integer value() {
      return style;
    }
  }

}
