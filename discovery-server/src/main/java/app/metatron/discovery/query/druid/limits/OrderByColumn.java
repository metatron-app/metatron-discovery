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

import javax.validation.constraints.NotNull;

public class OrderByColumn {

  @NotNull
  String dimension;

  @JsonProperty(defaultValue = "ascending")
  DIRECTION direction;

  @JsonProperty(defaultValue = "alphanumeric")
  COMPARATOR dimensionOrder;

  public OrderByColumn() {
    this.direction = DIRECTION.ASCENDING;
  }

  public OrderByColumn(String dimension) {
    this.dimension = dimension;
  }

  public OrderByColumn(String dimension, DIRECTION direction) {
    this.dimension = dimension;
    this.direction = direction;
    this.dimensionOrder = COMPARATOR.ALPHANUMERIC;
  }

  public OrderByColumn(String dimension, DIRECTION direction, COMPARATOR dimensionOrder) {
    this.dimension = dimension;
    this.direction = direction;
    this.dimensionOrder = dimensionOrder;
  }

  public String getDimension() {
    return dimension;
  }

  public void setDimension(String dimension) {
    this.dimension = dimension;
  }

  public DIRECTION getDirection() {
    return direction;
  }

  public void setDirection(DIRECTION direction) {
    this.direction = direction;
  }

  public COMPARATOR getDimensionOrder() {
    return dimensionOrder;
  }

  public void setDimensionOrder(COMPARATOR dimensionOrder) {
    this.dimensionOrder = dimensionOrder;
  }

  public enum DIRECTION{
    @JsonProperty("ascending")
    ASCENDING,
    @JsonProperty("descending")
    DESCENDING
  }

  public enum COMPARATOR{
    @JsonProperty("lexicographic")
    LEXICOGRAPHIC,
    @JsonProperty("alphanumeric")
    ALPHANUMERIC,
    @JsonProperty("numeric")
    NUMERIC,
    @JsonProperty("integer")
    INTEGER,
    @JsonProperty("floatingpoint")
    FLOATING_POINT,
    @JsonProperty("dayofweek.en")
    DAYOFWEEK,
    @JsonProperty("month.en")
    MONTH
  }
}
