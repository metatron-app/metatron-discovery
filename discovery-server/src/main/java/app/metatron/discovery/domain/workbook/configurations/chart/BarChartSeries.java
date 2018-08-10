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

/**
 * Bar Chart 시리즈 표현 방식 정의
 */
public class BarChartSeries implements ChartSeries {

  /**
   * 그래프 내 시리즈 표현 방식(병렬/중첩)
   */
  MarkType mark;

  /**
   *  그래프 표현 방향(가로/세로)
   */
  Align align;

  /**
   *  그래프 내 수치 단위
   */
  UnitType unit;

  public BarChartSeries() {
    // Empty Constructor
  }

  public BarChartSeries(MarkType mark, Align align, UnitType unit) {
    this.mark = mark;
    this.align = align;
    this.unit = unit;
  }

  public Align getAlign() {
    return align;
  }

  public void setAlign(Align align) {
    this.align = align;
  }

  public MarkType getMark() {
    return mark;
  }

  public void setMark(MarkType mark) {
    this.mark = mark;
  }

  public UnitType getUnit() { return unit; }

  public void setUnit(UnitType unit) { this.unit = unit; }

  public enum MarkType {
    MULTIPLE, // 병렬
    STACKED   // 중첩
  }

  public enum Align {
    HORIZONTAL,   // 가로 막대
    VERTICAL      // 세로 막대
  }

  public enum UnitType {
    NONE,     // 없음
    PERCENT   // 백분율
  }

  @Override
  public String toString() {
    return "BarChartSeries{" +
            "mark=" + mark +
            ", align=" + align +
            ", unit=" + unit +
            '}';
  }
}
