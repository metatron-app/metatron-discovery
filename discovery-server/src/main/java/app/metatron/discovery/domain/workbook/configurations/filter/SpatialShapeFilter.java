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

package app.metatron.discovery.domain.workbook.configurations.filter;

import com.google.common.base.Preconditions;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import app.metatron.discovery.query.druid.ShapeFormat;
import app.metatron.discovery.query.druid.SpatialOperations;
import app.metatron.discovery.util.EnumUtils;

public class SpatialShapeFilter extends SpatialFilter {

  SpatialOperations operation;

  ShapeFormat shapeFormat;

  String shapeString;

  @JsonCreator
  public SpatialShapeFilter(@JsonProperty("dataSource") String dataSource,
                            @JsonProperty("field") String field,
                            @JsonProperty("ref") String ref,
                            @JsonProperty("operation") String operation,
                            @JsonProperty("shapeFormat") String shapeFormat,
                            @JsonProperty("shapeString") String shapeString) {
    super(dataSource, field, ref);

    this.shapeFormat = EnumUtils.getUpperCaseEnum(ShapeFormat.class, shapeFormat, ShapeFormat.WKT);
    this.operation = EnumUtils.getUpperCaseEnum(SpatialOperations.class, operation, SpatialOperations.INTERSECTS);
    if (!this.operation.isFilterOperation()) {
      throw new IllegalArgumentException("Invalid bbox filter operation : " + operation);
    }

    this.shapeString = Preconditions.checkNotNull(shapeString, "'shapeString' required.");
  }

  public SpatialOperations getOperation() {
    return operation;
  }

  public ShapeFormat getShapeFormat() {
    return shapeFormat;
  }

  public String getShapeString() {
    return shapeString;
  }

  @Override
  public boolean compare(Filter filter) {
    return false;
  }
}
