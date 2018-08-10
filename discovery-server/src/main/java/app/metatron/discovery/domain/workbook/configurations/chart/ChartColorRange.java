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

package app.metatron.discovery.domain.workbook.configurations.chart;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.io.Serializable;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = ChartColorRange.ChartColorSectionRange.class, name = "section"),
    @JsonSubTypes.Type(value = ChartColorRange.ChartColorGradientRange.class, name = "gradient")
})
public abstract class ChartColorRange implements Serializable {
  /**
   * 색상 코드
   */
  String color;

  public ChartColorRange(String color) {
    this.color = color;
  }

  public String getColor() {
    return color;
  }

  @Override
  public String toString() {
    return "ChartColorRange{" +
        "color='" + color + '\'' +
        '}';
  }

  public static class ChartColorGradientRange extends ChartColorRange {

    /**
     * Position of
     */
    Number pos;

    /**
     * 값
     */
    Number value;

    /**
     * Index
     */
    String index;

    public ChartColorGradientRange(@JsonProperty("color") String color,
                                   @JsonProperty("pos") Number pos,
                                   @JsonProperty("value") Number value,
                                   @JsonProperty("index") String index) {
      super(color);
      this.pos = pos;
      this.value = value;
      this.index = index;
    }

    public Number getPos() {
      return pos;
    }

    public Number getValue() {
      return value;
    }

    public String getIndex() {
      return index;
    }

    @Override
    public String toString() {
      return "ChartColorGradientRange{" +
          "pos=" + pos +
          ", value=" + value +
          ", index='" + index + '\'' +
          "} " + super.toString();
    }
  }

  public static class ChartColorSectionRange extends ChartColorRange {

    /**
     * 초과 값
     */
    Number gt;

    /**
     * 이하 값
     */
    Number lte;


    public ChartColorSectionRange(@JsonProperty("color") String color,
                                  @JsonProperty("gt") Number gt,
                                  @JsonProperty("lte") Number lte) {
      super(color);
      this.gt = gt;
      this.lte = lte;
    }

    public Number getGt() {
      return gt;
    }

    public Number getLte() {
      return lte;
    }

    @Override
    public String toString() {
      return "ChartColorSectionRange{" +
          "gt=" + gt +
          ", lte=" + lte +
          "} " + super.toString();
    }
  }
}
