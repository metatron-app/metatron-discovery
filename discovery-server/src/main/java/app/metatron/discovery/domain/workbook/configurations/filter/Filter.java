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

package app.metatron.discovery.domain.workbook.configurations.filter;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import org.apache.commons.lang3.StringUtils;

import java.io.Serializable;

import static app.metatron.discovery.domain.workbook.configurations.field.Field.FIELD_NAMESPACE_SEP;


@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = InclusionFilter.class, name = "include"),
    @JsonSubTypes.Type(value = TopNFilter.class, name = "topn"),
    @JsonSubTypes.Type(value = IntervalFilter.class, name = "interval"),
    @JsonSubTypes.Type(value = TimestampFilter.class, name = "timestamp"),
    @JsonSubTypes.Type(value = TimeAllFilter.class, name = "time_all"),
    @JsonSubTypes.Type(value = TimeListFilter.class, name = "time_list"),
    @JsonSubTypes.Type(value = TimeRelativeFilter.class, name = "time_relative"),
    @JsonSubTypes.Type(value = TimeRangeFilter.class, name = "time_range"),
    @JsonSubTypes.Type(value = TimeSingleFilter.class, name = "time_single"),
    @JsonSubTypes.Type(value = SpatialBboxFilter.class, name = "spatial_bbox"),
    @JsonSubTypes.Type(value = SpatialPointFilter.class, name = "spatial_point"),
    @JsonSubTypes.Type(value = SpatialShapeFilter.class, name = "spatial_shape"),
    @JsonSubTypes.Type(value = RegExprFilter.class, name = "regexpr"),
    @JsonSubTypes.Type(value = ExpressionFilter.class, name = "expr"),
    @JsonSubTypes.Type(value = LikeFilter.class, name = "like"),
    @JsonSubTypes.Type(value = BoundFilter.class, name = "bound"),
    @JsonSubTypes.Type(value = MeasureInequalityFilter.class, name = "measure_inequality"),
    @JsonSubTypes.Type(value = MeasurePositionFilter.class, name = "measure_position"),
    @JsonSubTypes.Type(value = WildCardFilter.class, name = "wildcard")
})
public abstract class Filter implements Serializable {

  /**
   * 멀티 데이터 소스 사용 필터링 필드를 가지고 있느 데이터 소스 명 지정
   *
   */
  String dataSource;

  /**
   *  필터링 대상 필드명
   */
  String field;

  /**
   * 필드 참조 대상(데이터소스 ID, CustomField Name)
   */
  String ref;

  public Filter() {
    // Empty Constructor
  }

  public Filter(String dataSource, String field, String ref) {
    this.dataSource = dataSource;
    this.field = field;
    this.ref = ref;
  }

  public Filter(String field) {
    this.field = field;
  }

  public Filter(String field, String ref) {
    this.field = field;
    this.ref = ref;
  }

  abstract public boolean compare(Filter filter);

  @JsonIgnore
  public String getColumn() {

    if(StringUtils.isEmpty(ref)) {
      return field;
    }

    return ref + FIELD_NAMESPACE_SEP + field;
  }

  public String getDataSource() {
    return dataSource;
  }

  public void setDataSource(String dataSource) {
    this.dataSource = dataSource;
  }

  public String getField() {
    return field;
  }

  public void setField(String field) {
    this.field = field;
  }

  public String getRef() {
    return ref;
  }

  public void setRef(String ref) {
    this.ref = ref;
  }
}
