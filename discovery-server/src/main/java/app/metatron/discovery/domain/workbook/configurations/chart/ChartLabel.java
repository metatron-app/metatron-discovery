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

import com.google.common.collect.Lists;

import java.io.Serializable;
import java.util.List;

import javax.validation.constraints.Size;

/**
 * Created by kyungtaak on 2016. 4. 16..
 */
@Deprecated
public class ChartLabel implements Serializable {

  /**
   * log scale, if true
   */
  Boolean scaled;

  /**
   * show value on chart, if true
   */
  Boolean showValue;

  /**
   * 축별 설정
   */
  @Size(max = 3)
  List<ChartLabelMode> axis;

  public ChartLabel() {
    // Empty Constructor
  }

  public ChartLabel(boolean scaled, boolean showValue, ChartLabelMode... axis) {
    this.scaled = scaled;
    this.showValue = showValue;
    this.axis = Lists.newArrayList(axis);
  }

  public Boolean getScaled() {
    return scaled;
  }

  public void setScaled(Boolean scaled) {
    this.scaled = scaled;
  }

  public Boolean getShowValue() {
    return showValue;
  }

  public void setShowValue(Boolean showValue) {
    this.showValue = showValue;
  }

  public List<ChartLabelMode> getAxis() {
    return axis;
  }

  public void setAxis(List<ChartLabelMode> axis) {
    this.axis = axis;
  }

  @Override
  public String toString() {
    return "ChartLabel{" +
        "scaled=" + scaled +
        ", showValue=" + showValue +
        ", axis=" + axis +
        '}';
  }
}
