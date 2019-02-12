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

package app.metatron.discovery.query.druid.limits;


import com.fasterxml.jackson.annotation.JsonProperty;

import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.query.druid.funtions.TimeFormatFunc;

public class PivotColumn {

  String dimension;

  /**
   * dimension 필드명 대신 expression 으로 대체 <br/>
   * 주로 timestamp 제어를 위한 time_format function 으로 활용
   */
  String expression;

  Direction direction;

  String dimensionOrder;

  public PivotColumn() {
  }

  public PivotColumn(String dimension, Direction direction, String dimensionOrder) {
    this.dimension = dimension;
    this.direction = direction;
    this.dimensionOrder = dimensionOrder;
  }

  public PivotColumn(Field field) {

    if((field instanceof DimensionField || field instanceof TimestampField)
        && field.getFormat() instanceof TimeFieldFormat) {
      TimeFieldFormat format = (TimeFieldFormat) field.getFormat();
      TimeFormatFunc timeFormatFunc = new TimeFormatFunc("\"" + field.getAlias() + "\"",
                                                         format.enableSortField() ? format.getSortFormat() : format.getFormat(),
                                                         format.selectTimezone(),
                                                         format.getLocale(),
                                                         format.getFormat(),
                                                         format.selectTimezone(),
                                                         format.getLocale());
      this.expression = timeFormatFunc.toExpression();
      this.dimensionOrder = format.getSortComparator();
    } else {
      this.dimension = field.getAlias();
      this.dimensionOrder = SortComparator.ALPHANUMERIC;
    }

    this.direction = Direction.ASCENDING;
  }

  public String getDimension() {
    return dimension;
  }

  public void setDimension(String dimension) {
    this.dimension = dimension;
  }

  public String getExpression() {
    return expression;
  }

  public void setExpression(String expression) {
    this.expression = expression;
  }

  public Direction getDirection() {
    return direction;
  }

  public void setDirection(Direction direction) {
    this.direction = direction;
  }

  public String getDimensionOrder() {
    return dimensionOrder;
  }

  public void setDimensionOrder(String dimensionOrder) {
    this.dimensionOrder = dimensionOrder;
  }

  public enum Direction {
    @JsonProperty("ascending")
    ASCENDING,
    @JsonProperty("descending")
    DESCENDING
  }

  public static class SortComparator {

    public final static String LEXICOGRAPHIC = "lexicographic";

    public final static String ALPHANUMERIC = "alphanumeric";

    public final static String NUMERIC = "numeric";

    public final static String INTEGER = "integer";

    public final static String FLOATING_POINT = "floatingpoint";

    public final static String DAYOFWEEK = "dayofweek.%s";

    public final static String MONTH = "month.%s";

    public final static String DATETIME = "datetime(%s,%s,%s)";
  }
}
