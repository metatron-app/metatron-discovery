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

package app.metatron.discovery.domain.datasource.ingestion.rule;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import org.apache.commons.lang3.StringUtils;

import app.metatron.discovery.spec.druid.ingestion.Evaluation;
import app.metatron.discovery.spec.druid.ingestion.expr.Nvl;

@JsonTypeName("replace")
public class ReplaceNullRule extends EvaluationRule implements IngestionRule {

  /**
   * Default value to replace
   */
  Object value;

  public ReplaceNullRule(Object value) {
    this(null, value);
  }

  @JsonCreator
  public ReplaceNullRule(@JsonProperty("name") String name,
                         @JsonProperty("value") Object value) {
    super(name);
    this.value = value;
  }

  @Override
  public Evaluation toEvaluation(String name) {
    String outputName = StringUtils.isNotEmpty(name) ? name : this.name;
    Nvl nvl = new Nvl(outputName, value);

    return new Evaluation(outputName, nvl.expr());
  }

  public Object getValue() {
    return value;
  }
}
