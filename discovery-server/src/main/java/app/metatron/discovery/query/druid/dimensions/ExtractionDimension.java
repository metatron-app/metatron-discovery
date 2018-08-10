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

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonTypeName;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.query.druid.Dimension;
import app.metatron.discovery.query.druid.ExtractionFunction;

@JsonTypeName("extraction")
public class ExtractionDimension implements Dimension {

  @NotNull
  String dimension;

  @JsonInclude(JsonInclude.Include.NON_NULL)
  String outputName;

  @NotNull
  ExtractionFunction extractionFn;

  public ExtractionDimension() {
  }

  public ExtractionDimension(String dimension, String outputName, ExtractionFunction extractionFn) {
    this.dimension = dimension;
    this.outputName = outputName;
    this.extractionFn = extractionFn;
  }

  public String getDimension() {
    return dimension;
  }

  public void setDimension(String dimension) {
    this.dimension = dimension;
  }

  public String getOutputName() {
    return outputName;
  }

  public void setOutputName(String outputName) {
    this.outputName = outputName;
  }

  public ExtractionFunction getExtractionFn() {
    return extractionFn;
  }

  public void setExtractionFn(ExtractionFunction extractionFn) {
    this.extractionFn = extractionFn;
  }

  @Override
  public LogicalType getLogicalType() {
    return null;
  }
}
