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

public class Nest implements Rule, Rule.Factory {

  /**
   * Nest target column expressions (multiple)
   */
  Expression col;

  /**
   * Target type (map, array)
   */
  String into;

  /**
   * New column name
   */
  String as;

  public Nest() {
  }

  public Nest(Expression col, String into, String as) {
    this.col = col;
    this.into = into;
    this.as = as;
  }

  public Expression getCol() {
    return col;
  }

  public void setCol(Expression col) {
    this.col = col;
  }

  public String getInto() {
    return into;
  }

  public void setInto(String into) {
    this.into = into;
  }

  public String getAs() {
    return as;
  }

  public void setAs(String as) {
    this.as = as;
  }

  @Override
  public String getName() {
    return "nest";
  }

  @Override
  public Rule get() {
    return new Nest();
  }

  @Override
  public String toString() {
    return "Nest{" +
        "col=" + col +
        ", into='" + into + '\'' +
        ", as='" + as + '\'' +
        '}';
  }
}
