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

import java.util.List;

import javax.validation.constraints.Size;

/**
 * Created by kyungtaak on 2016. 4. 16..
 */
public class ChartLabelRowMode extends ChartLabelMode {

  @Size(min = 2, max = 2)
  @Deprecated
  List<Double> range;

  public ChartLabelRowMode() {
    // Empty Constructor
  }

  public ChartLabelRowMode(ChartLabelMarkType mark, List<Double> range) {
    this.mark = mark;
    this.range = range;
  }

  public ChartLabelRowMode(ChartLabelMarkType mark) {
    this.mark = mark;
  }

  public List<Double> getRange() {
    return range;
  }

  public void setRange(List<Double> range) {
    this.range = range;
  }

  @Override
  public String toString() {
    return "ChartLabelRowMode{} " + super.toString();
  }
}
