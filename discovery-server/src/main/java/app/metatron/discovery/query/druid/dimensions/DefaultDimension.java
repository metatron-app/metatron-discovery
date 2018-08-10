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

package app.metatron.discovery.query.druid.dimensions;

import com.fasterxml.jackson.annotation.JsonTypeName;

import org.springframework.data.annotation.Transient;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.query.druid.Dimension;

@JsonTypeName("default")
public class DefaultDimension implements Dimension {

  @NotNull
  String dimension;

  String outputName;

  @Transient
  LogicalType logicalType;

  public DefaultDimension() {
  }

  public DefaultDimension(String dimension) {
    this.dimension = dimension;
  }

  public DefaultDimension(String dimension, String outputName) {
    this.dimension = dimension;
    this.outputName = outputName;
  }

  public DefaultDimension(String dimension, String outputName, LogicalType logicalType) {
    this.dimension = dimension;
    this.outputName = outputName;
    this.logicalType = logicalType;
  }

  public String getDimension() {
    return dimension;
  }

  public void setDimension(String dimension) {
    this.dimension = dimension;
  }

  public String getOutputName() {
    if (outputName == null)
      return dimension;
    return outputName;
  }

  public void setOutputName(String outputName) {
    this.outputName = outputName;
  }

  @Override
  public LogicalType getLogicalType() {
    return logicalType;
  }

  public void setLogicalType(LogicalType logicalType) {
    this.logicalType = logicalType;
  }
}
