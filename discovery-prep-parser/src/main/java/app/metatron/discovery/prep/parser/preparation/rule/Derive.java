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

public class Derive implements Rule, Rule.Factory {

  /**
   * New column value expression
   */
  Expression value;

  /**
   * New column name
   */
  String as;

  public Derive() {
  }

  public Derive(Expression value, String as) {
    this.value = value;
    this.as = as;
  }

  public Expression getValue() {
    return value;
  }

  public void setValue(Expression value) {
    this.value = value;
  }

  public String getAs() {
    return as;
  }

  public void setAs(String as) {
    this.as = as;
  }

  @Override
  public String getName() {
    return "derive";
  }

  @Override
  public Rule get() {
    return new Derive();
  }

  @Override
  public String toString() {
    return "Derive{" +
        "value=" + value +
        ", as='" + as + '\'' +
        '}';
  }
}
