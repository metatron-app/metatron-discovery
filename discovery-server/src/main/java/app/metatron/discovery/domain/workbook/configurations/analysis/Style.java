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

package app.metatron.discovery.domain.workbook.configurations.analysis;

import java.io.Serializable;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

/**
 * Created by kyungtaak on 2017. 5. 24..
 */
public class Style implements Serializable {

  /**
   * 표시 색상
   */
  String color;

  /**
   * 라인 표시 방식
   */
  LineStyle lineStyle;

  /**
   * 라인 두께
   */
  Number lineThickness;

  /**
   * 투명도
   */
  @Min(0)
  @Max(100)
  Integer transparency;

  public Style() {
    // Empty Constructor
  }

  public Style(String color) {
    this.color = color;
  }

  public Style(String color, LineStyle lineStyle, Number lineThickness) {
    this.color = color;
    this.lineStyle = lineStyle;
    this.lineThickness = lineThickness;
  }

  public Style(String color, Integer transparency) {
    this.color = color;
    this.transparency = transparency;
  }

  public String getColor() {
    return color;
  }

  public void setColor(String color) {
    this.color = color;
  }

  public LineStyle getLineStyle() {
    return lineStyle;
  }

  public void setLineStyle(LineStyle lineStyle) {
    this.lineStyle = lineStyle;
  }

  public Number getLineThickness() {
    return lineThickness;
  }

  public void setLineThickness(Number lineThickness) {
    this.lineThickness = lineThickness;
  }

  public Integer getTransparency() {
    return transparency;
  }

  public void setTransparency(Integer transparency) {
    this.transparency = transparency;
  }

  /**
   * Line Styles
   */
  public enum LineStyle {
    SOLID, DASHED, DOTTED
  }
}

