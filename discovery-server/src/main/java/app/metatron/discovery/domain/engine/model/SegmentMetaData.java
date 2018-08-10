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

package app.metatron.discovery.domain.engine.model;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.Serializable;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.query.druid.Granularity;

public class SegmentMetaData implements Serializable {

  /**
   *
   */
  String id;

  /**
   *
   */
  List<String> intervals;

  /**
   *
   */
  Map<String, ColumnInfo> columns;

  /**
   *
   */
  List<Field> fields;

  /**
   *
   */
  Long serializedSize;

  /**
   *
   */
  Long numRows;

  /**
   *
   */
  Long ingestedNumRows;

  /**
   *
   */
  Granularity queryGranularity;

  public SegmentMetaData() {
  }

  /**
   * Engine 내 컬럼 정보를 metatron Field 정보로 변환
   *
   * @param overwriteFields
   * @return
   */
  @JsonIgnore
  public List<Field> getConvertedField(List<Field> overwriteFields) {

    if (overwriteFields == null) {
      overwriteFields = Lists.newArrayList();
    }

    // 중복된 값을 찾기위한 Mapper 변환
    Map<String, Field> reqFieldMap = overwriteFields.stream()
                                                    .collect(Collectors.toMap(Field::getName, f -> f));

    List<Field> convertedFields = Lists.newArrayList();
    Long seq = 1L;
    for (String key : this.columns.keySet()) {
      Field field;
      if(reqFieldMap.containsKey(key)) {
        field = reqFieldMap.get(key);
        field.setSeq(seq++);
      } else {
        if("__time".equals(key)) {
          field = new Field("event_time", DataType.TIMESTAMP, Field.FieldRole.TIMESTAMP, 0L);
        } else if("count".equals(key)) {
          continue;
        } else {
          SegmentMetaData.ColumnInfo info = this.columns.get(key);
          field = new Field(key, DataType.engineToFieldDataType(info.getType()), seq++);
        }
      }
      convertedFields.add(field);
    }

    convertedFields.sort(Comparator.comparing(Field::getSeq));

    return convertedFields;
  }


  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public List<String> getIntervals() {
    return intervals;
  }

  public void setIntervals(List<String> intervals) {
    this.intervals = intervals;
  }

  public Map<String, ColumnInfo> getColumns() {
    return columns;
  }

  public void setColumns(Map<String, ColumnInfo> columns) {
    this.columns = columns;
  }

  public List<Field> getFields() {
    return fields;
  }

  public void setFields(List<Field> fields) {
    this.fields = fields;
  }

  public Long getSerializedSize() {
    return serializedSize;
  }

  public void setSerializedSize(Long serializedSize) {
    this.serializedSize = serializedSize;
  }

  public Long getIngestedNumRows() {
    return ingestedNumRows;
  }

  public void setIngestedNumRows(Long ingestedNumRows) {
    this.ingestedNumRows = ingestedNumRows;
  }

  public Long getNumRows() {
    return numRows;
  }

  public void setNumRows(Long numRows) {
    this.numRows = numRows;
  }

  public Granularity getQueryGranularity() {
    return queryGranularity;
  }

  public void setQueryGranularity(Granularity queryGranularity) {
    this.queryGranularity = queryGranularity;
  }

  public static SegmentMetaData empty() {
    SegmentMetaData data = new SegmentMetaData();
    data.setId("");
    data.setColumns(Maps.newHashMap());
    data.setIntervals(Lists.newArrayList());
    data.setSerializedSize(0L);
    data.setNumRows(0L);

    return data;
  }

  public static class ColumnInfo implements Serializable {

    /**
     *
     */
    String type;

    /**
     *
     */
    Long size;

    /**
     *
     */
    Long cardinality;

    public ColumnInfo() {
    }

    public String getType() {
      return type;
    }

    public void setType(String type) {
      this.type = type;
    }

    public Long getSize() {
      return size;
    }

    public void setSize(Long size) {
      this.size = size;
    }

    public Long getCardinality() {
      return cardinality;
    }

    public void setCardinality(Long cardinality) {
      this.cardinality = cardinality;
    }
  }
}
