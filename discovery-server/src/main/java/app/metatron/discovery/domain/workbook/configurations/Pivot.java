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

package app.metatron.discovery.domain.workbook.configurations;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;

import java.io.Serializable;
import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.GraphShelf;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.PivotShelf;

/**
 * Page 내 선반 정보
 */
public class Pivot implements Serializable  {

  /**
   * List of field in column area
   */
  List<Field> columns;

  /**
   * List of field in row area
   */
  List<Field> rows;

  /**
   * List of field in aggregation area
   */
  List<Field> aggregations;

  /**
   * for reversed pivoting (percentage)
   */
  @JsonIgnore
  boolean reverseMode;

  public Pivot() {
    // Empty Constructor
  }

  public Pivot(List<Field> columns, List<Field> rows, List<Field> aggregations) {
    this.columns = columns;
    this.rows = rows;
    this.aggregations = aggregations;
  }

  public PivotShelf toPivotShelf() {
    return new PivotShelf(columns, rows, aggregations);
  }

  public GraphShelf toGraghShelf() {
    Preconditions.checkArgument(CollectionUtils.isNotEmpty(aggregations));

    return new GraphShelf(columns, rows, aggregations.get(0));
  }

  public void addColumn(Field field) {
    if(columns == null) {
      columns = Lists.newArrayList();
    }

    columns.add(field);
  }

  public void addAggregation(Field field) {
    if(aggregations == null) {
      aggregations = Lists.newArrayList();
    }

    aggregations.add(field);
  }

  /**
   * Pivot 내 필드 정보가 존재하는지 여부 체크
   *
   * @return
   */
  @JsonIgnore
  public boolean isEmpty() {
    if( CollectionUtils.isEmpty(columns) &&
        CollectionUtils.isEmpty(rows) &&
        CollectionUtils.isEmpty(aggregations) ) {
      return true;
    }

    return false;
  }

  /**
   * Pivot 내 필드 정보가 존재하는지 여부 체크
   */
  @JsonIgnore
  public boolean reverseMode() {
    if (CollectionUtils.isNotEmpty(rows)) {
      reverseMode = true;
      return true;
    }

    if (CollectionUtils.isNotEmpty(aggregations)) {
      long dimCount = aggregations.stream().filter(field -> field instanceof DimensionField).count();
      if (dimCount > 1) {
        reverseMode = true;
        return true;
      }
    }

    return false;
  }

  @JsonIgnore
  public List<Field> getAllFields() {

    List<Field> fields = Lists.newArrayList();

    if(BooleanUtils.isTrue(reverseMode)) {
      if (CollectionUtils.isNotEmpty(rows)) {
        fields.addAll(rows);
      }

      if (CollectionUtils.isNotEmpty(columns)) {
        fields.addAll(columns);
      }
    } else {
      if (CollectionUtils.isNotEmpty(columns)) {
        fields.addAll(columns);
      }

      if (CollectionUtils.isNotEmpty(rows)) {
        fields.addAll(rows);
      }
    }

    if (CollectionUtils.isNotEmpty(aggregations)) {
      fields.addAll(aggregations);
    }

    return fields;
  }

  public List<Field> getColumns() {
    return columns;
  }

  public void setColumns(List<Field> columns) {
    this.columns = columns;
  }

  public List<Field> getRows() {
    return rows;
  }

  public void setRows(List<Field> rows) {
    this.rows = rows;
  }

  public List<Field> getAggregations() {
    return aggregations;
  }

  public void setAggregations(List<Field> aggregations) {
    this.aggregations = aggregations;
  }

  public Boolean getReverseMode() {
    return reverseMode;
  }
}
