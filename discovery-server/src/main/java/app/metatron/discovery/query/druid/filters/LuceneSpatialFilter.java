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
package app.metatron.discovery.query.druid.filters;

import com.google.common.base.Preconditions;

import app.metatron.discovery.domain.workbook.configurations.filter.SpatialBboxFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.SpatialShapeFilter;
import app.metatron.discovery.query.druid.Filter;
import app.metatron.discovery.query.druid.ShapeFormat;
import app.metatron.discovery.query.druid.SpatialOperations;

public class LuceneSpatialFilter implements Filter {

  String field;

  SpatialOperations operation;

  ShapeFormat shapeFormat;

  String shapeString;

  public LuceneSpatialFilter() {
  }

  public LuceneSpatialFilter(String field,
                             SpatialOperations operation,
                             ShapeFormat shapeFormat,
                             String shapeString) {

    this.field = Preconditions.checkNotNull(field, "field can not be null");
    this.operation = Preconditions.checkNotNull(operation, "type can not be null");
    this.shapeFormat = shapeFormat;
    this.shapeString = shapeString;
  }

  public LuceneSpatialFilter(SpatialBboxFilter filter) {
    this.field = filter.getField() + ".shape";
    this.operation = filter.getOperation().toBBoxFilterOperation();
    this.shapeFormat = ShapeFormat.WKT;
    this.shapeString = pointToShape(filter);
  }

  public LuceneSpatialFilter(SpatialShapeFilter filter, boolean isPoint) {
    this.field = filter.getField();
    if (isPoint) {
      this.field += ".coord";
    } else {
      this.field += ".shape";
    }

    this.operation = filter.getOperation();
    this.shapeFormat = filter.getShapeFormat();
    this.shapeString = filter.getShapeString();
  }

  public String pointToShape(SpatialBboxFilter filter) {

    StringBuilder builder = new StringBuilder();
    builder.append("MULTIPOINT (");
    builder.append("(").append(filter.getLowerCorner()).append("), ");
    builder.append("(").append(filter.getUpperCorner()).append(")");
    builder.append(")");

    return builder.toString();
  }

  public String getField() {
    return field;
  }

  public void setField(String field) {
    this.field = field;
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

  public enum PointQueryType {
    DISTANCE, BBOX, POLYGON
  }
}
