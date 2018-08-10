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

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.io.Serializable;

import javax.validation.constraints.NotNull;

/**
 * Created by kyungtaak on 2016. 4. 16..
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "mode")
@JsonSubTypes({
        @JsonSubTypes.Type(value = ChartLabelRowMode.class, name = "row"),                // X 축
        @JsonSubTypes.Type(value = ChartLabelColMode.class, name = "column"),             // Y 축
        @JsonSubTypes.Type(value = ChartLabelSubColMode.class, name = "sub_column"),      // Y 축 (보조)
        @JsonSubTypes.Type(value = ChartLabelSimpleMode.class, name = "simple")           // X/Y 축 없는 경우
})
public abstract class ChartLabelMode implements Serializable {

  /**
   * Show label, if true
   */
  boolean showName;

  /**
   * Custom Label Name
   */
  String name;

  /**
   * Show mark, if true
   */
  boolean showMark;

  /**
   * 레이블 방향
   */
  @NotNull
  ChartLabelMarkType mark;

  /**
   * 축 옵션
   */
  ChartAxis axisOption;

  public ChartLabelMode() {
  }

  public boolean isShowName() {
    return showName;
  }

  public void setShowName(boolean showName) {
    this.showName = showName;
  }

  public boolean isShowMark() {
    return showMark;
  }

  public void setShowMark(boolean showMark) {
    this.showMark = showMark;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public ChartLabelMarkType getMark() {
    return mark;
  }

  public void setMark(ChartLabelMarkType mark) {
    this.mark = mark;
  }

  public ChartAxis getAxisOption() {
    return axisOption;
  }

  public void setAxisOption(ChartAxis axisOption) {
    this.axisOption = axisOption;
  }

  @Override
  public String toString() {
    return "ChartLabelMode{" +
        "showName=" + showName +
        ", name='" + name + '\'' +
        ", showMark=" + showMark +
        ", mark=" + mark +
        '}';
  }
}
