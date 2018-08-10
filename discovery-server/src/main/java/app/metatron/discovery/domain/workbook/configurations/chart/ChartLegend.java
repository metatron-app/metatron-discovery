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

import app.metatron.discovery.util.EnumUtils;

/**
 * Created by kyungtaak on 2016. 4. 16..
 */
public class ChartLegend implements Serializable {

  Boolean showName;

  String customName;

  Position pos;

  public ChartLegend() {
    // Empty Constructor
  }

  @JsonCreator
  public ChartLegend(
      @JsonProperty("showName") Boolean showName,
      @JsonProperty("customName") String customName,
      @JsonProperty("pos") String pos) {
    this.showName = showName;
    this.customName = customName;
    this.pos = EnumUtils.getUpperCaseEnum(Position.class, pos, Position.AUTO);
  }

  public Boolean getShowName() {
    return showName;
  }

  public String getCustomName() {
    return customName;
  }

  public Position getPos() {
    return pos;
  }

  @Override
  public String toString() {
    return "ChartLegend{" +
        "showName=" + showName +
        ", customName='" + customName + '\'' +
        ", pos=" + pos +
        '}';
  }

  public enum Position {
    AUTO, LEFT, RIGHT, TOP, BOTTOM,
    RIGHT_BOTTOM, LEFT_BOTTOM, RIGHT_TOP, LEFT_TOP
  }
}
