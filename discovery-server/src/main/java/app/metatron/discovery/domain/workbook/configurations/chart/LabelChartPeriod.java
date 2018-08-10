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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;

/**
 * Created by kyungtaak on 2016. 6. 2..
 */
public class LabelChartPeriod implements Serializable {

  TimeFieldFormat.TimeUnit timeUnit;

  public LabelChartPeriod() {
    // Empty Constructor
  }

  @JsonCreator
  public LabelChartPeriod(@JsonProperty("timeUnit") String timeUnit) {
    this.timeUnit = SearchParamValidator.enumUpperValue(TimeFieldFormat.TimeUnit.class,
                                                        timeUnit, "timeUnit");
  }

  public TimeFieldFormat.TimeUnit getTimeUnit() {
    return timeUnit;
  }

  @Override
  public String toString() {
    return "LabelChartPeriod{" +
        "timeUnit=" + timeUnit +
        '}';
  }
}
