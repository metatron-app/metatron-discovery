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

package app.metatron.discovery.prep.parser.preparation.rule;

import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;

public class Aggregate implements Rule, Rule.Factory {

  /**
   * Pivot target expression (Required)
   *
   */
  Expression value;

  /**
   * Group by expression (multiple)
   *
   */
  Expression group;


  public Aggregate() {
  }

  public Expression getValue() {
    return value;
  }

  public void setValue(Expression value) {
    this.value = value;
  }

  public Expression getGroup() {
    return group;
  }

  public void setGroup(Expression group) {
    this.group = group;
  }

  @Override
  public String getName() {
    return "aggregate";
  }

  @Override
  public Rule get() {
    return new Aggregate();
  }

  @Override
  public String toString() {
    return "Aggregate{" +
        "value=" + value +
        ", group=" + group +
        '}';
  }
}
