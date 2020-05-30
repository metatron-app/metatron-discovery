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

package app.metatron.discovery.domain.workbook.configurations.field;

import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.util.EnumUtils;
import app.metatron.discovery.util.PolarisUtils;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.Map;

import static app.metatron.discovery.domain.workbook.configurations.field.MeasureField.AggregationType.NONE;
import static app.metatron.discovery.domain.workbook.configurations.field.MeasureField.AggregationType.SUM;

/**
 * 측정값 필드
 */
@JsonTypeName("measure")
public class MeasureField extends Field {

  /**
   * 집합 함수 타입, 기본값 SUM
   */
  AggregationType aggregationType = NONE;

  /**
   * 집합 함수관련 옵션. key1=value1,key2=value2,.. 형태로 구성
   * Percentile 인 경우 0~1 사이의 값이 올수 있습니다 (ex. value=0.75)
   */
  String options;

  /**
   * 값에 대한 포맷 타입 지정 ( for UI )
   */
  FieldFormat format;

  @JsonIgnore
  Map<String, Object> param;

  public MeasureField() {
  }

  @JsonCreator
  public MeasureField(
      @JsonProperty("name") String name,
      @JsonProperty("alias") String alias,
      @JsonProperty("ref") String ref,
      @JsonProperty("aggregationType") String aggregationType,
      @JsonProperty("format") FieldFormat format,
      @JsonProperty("options") String options) {


    super.name = name;
    Preconditions.checkArgument(StringUtils.isNotEmpty(super.name));

    super.alias = alias;
    super.ref = ref;

    if (StringUtils.isNotEmpty(aggregationType)) {
      this.aggregationType = EnumUtils.getUpperCaseEnum(AggregationType.class, aggregationType, SUM);
    }

    this.format = format;

    Map<String, String> parsedMap = Maps.newHashMap();
    if (StringUtils.isNotEmpty(options)) {
      this.options = options;
      parsedMap = PolarisUtils.splitToMap(options, ",", "=");
    }

    switch (this.aggregationType) {
      case PERCENTILE:
        if (parsedMap.containsKey("value")) {
          setParamValue("value", Double.parseDouble(parsedMap.get("value")));
        } else {
          setParamValue("value", 0.75); // 기본값 처리
        }
        break;
      case LAST:
      case FIRST:
        if (parsedMap.containsKey("includeTimestamp")) {
          setParamValue("includeTimestamp", BooleanUtils.toBoolean(parsedMap.get("includeTimestamp")));
        } else {
          setParamValue("includeTimestamp", false);
        }
        break;
      default:
        break;
    }

  }

  public MeasureField(String name) {
    super.name = name;
  }

  public MeasureField(String name, String ref) {
    super.name = name;
    super.ref = ref;
  }

  public MeasureField(String name, String alias, String ref) {
    this(name, alias, ref, null, null, null);
  }

  public MeasureField(String name, String ref, AggregationType aggregationType) {
    super.name = name;
    super.ref = ref;
    this.aggregationType = aggregationType;
  }

  public MeasureField(String name, AggregationType aggregationType) {
    super.name = name;
    this.aggregationType = aggregationType;
  }

  public MeasureField(String name, AggregationType aggregationType, String alias) {
    super.name = name;
    super.alias = alias;
    this.aggregationType = aggregationType;
  }

  @JsonIgnore
  public void setParamValue(String key, Object value) {
    if (param == null) {
      param = Maps.newHashMap();
    }

    param.put(key, value);
  }

  @JsonIgnore
  public <T> T getParamValue(String key) {
    if (param == null || key == null) {
      return null;
    }

    return (T) param.get(key);
  }

  @Override
  public String getAlias() {

    if (StringUtils.isEmpty(alias)) {
      if (aggregationType == null || aggregationType == NONE) {
        alias = getColunm();
      } else {
        alias = aggregationType.name() + "(" + getColunm() + ")";
      }
    }

    return alias;
  }

  /**
   * for following ui naming rule case of user-defined field
   */
  public String getUserDefinedAlias() {

    if (StringUtils.isEmpty(alias)) {
      if (aggregationType == null || aggregationType == NONE) {
        alias = name;
      } else {
        alias = aggregationType.name() + "(" + name + ")";
      }
    }

    return alias;
  }


  public AggregationType getAggregationType() {
    return aggregationType;
  }

  public void setAggregationType(AggregationType aggregationType) {
    this.aggregationType = aggregationType;
  }

  public String getOptions() {
    return options;
  }

  public void setOptions(String option) {
    this.options = option;
  }

  @Override
  public FieldFormat getFormat() {
    return format;
  }

  public void setFormat(FieldFormat format) {
    this.format = format;
  }

  /**
   * 집합함수 Enum Type
   */
  public enum AggregationType {
    NONE, MIN, MAX, COUNT, COUNTD, SUM, AVG, STDDEV, MEDIAN, AREA, RANGE, PERCENTILE, FIRST, LAST, // 사용자 노출 타입
    SLOPE,
    VARIATION, APPROX,  // Ingestion 타입
    COMPLEX             // 계산식내 집계함수 포함 경우
  }
}
