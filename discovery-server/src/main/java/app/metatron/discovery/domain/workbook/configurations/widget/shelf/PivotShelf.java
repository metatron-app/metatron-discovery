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

package app.metatron.discovery.domain.workbook.configurations.widget.shelf;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.collections4.CollectionUtils;

import java.util.Collections;
import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.field.Field;

public class PivotShelf implements Shelf {

  /**
   * 열 영역에 위치한 필드 정보
   */
  List<Field> columns;

  /**
   * 행 영역에 위치한 필드 정보
   */
  List<Field> rows;

  /**
   * 교차 영역에 위치한 필드 정보
   */
  List<Field> aggregations;

  public PivotShelf() {
    // Empty Constructor
  }

  @JsonCreator
  public PivotShelf(@JsonProperty("columns") List<Field> columns,
                    @JsonProperty("rows") List<Field> rows,
                    @JsonProperty("aggregations") List<Field> aggregations) {
    this.columns = columns;
    this.rows = rows;
    this.aggregations = aggregations;
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

  @Override
  public List<Field> getFields() {

    List<Field> collectedFields = Collections.emptyList();

    if(CollectionUtils.isNotEmpty(columns)) {
      collectedFields.addAll(columns);
    }

    if(CollectionUtils.isNotEmpty(rows)) {
      collectedFields.addAll(rows);
    }

    if(CollectionUtils.isNotEmpty(aggregations)) {
      collectedFields.addAll(aggregations);
    }

    return collectedFields;
  }

  @JsonIgnore
  public List<Field> getFieldsByType(Class clz) {

    List<Field> fields = Lists.newArrayList();

    if(CollectionUtils.isNotEmpty(columns)) {
      for(Field field : columns) {
        if(clz.isInstance(field)) {
          fields.add(field);
        }
      }
    }

    if(CollectionUtils.isNotEmpty(rows)) {
      for(Field field : rows) {
        if(clz.isInstance(field)) {
          fields.add(field);
        }
      }
    }

    if(CollectionUtils.isNotEmpty(this.aggregations)) {
      for(Field field : this.aggregations) {
        if(clz.isInstance(field)) {
          fields.add(field);
        }
      }
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
}
