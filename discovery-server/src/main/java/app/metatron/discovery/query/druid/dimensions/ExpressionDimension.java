/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.query.druid.dimensions;

import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.query.druid.Dimension;

@JsonTypeName("expression")
public class ExpressionDimension implements Dimension {

  String outputName;

  String expression;

  public ExpressionDimension() {
  }

  public ExpressionDimension(String outputName, String expression) {
    this.outputName = outputName;
    this.expression = expression;
  }

  @Override
  public String getDimension() {
    return null;
  }

  public String getExpression() {
    return expression;
  }

  @Override
  public String getOutputName() {
    return outputName;
  }

  @Override
  public LogicalType getLogicalType() {
    return null;
  }
}
