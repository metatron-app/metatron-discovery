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

public class Pivot implements Rule, Rule.Factory {

  /**
   * Pivot target expressions (multiple)
   */
  Expression col;

  /**
   * Pivot result aggregation value expressions (multiple)
   */
  Expression value;

  /**
   * Group by column expressions (multiple)
   */
  Expression group;

  /**
   * Column count limit
   */
  Integer limit;


  public Pivot() {
  }

  public Pivot(Expression col, Expression value, Expression group, Integer limit) {
    this.col = col;
    this.value = value;
    this.group = group;
    this.limit = limit;
  }

  public Expression getCol() {
    return col;
  }

  public void setCol(Expression col) {
    this.col = col;
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

  public Integer getLimit() {
    return limit;
  }

  public void setLimit(Integer limit) {
    this.limit = limit;
  }

  @Override
  public String getName() {
    return "pivot";
  }

  @Override
  public Rule get() {
    return new Pivot();
  }

  @Override
  public String toString() {
    return "Pivot{" +
        "col=" + col +
        ", value=" + value +
        ", group=" + group +
        ", limit=" + limit +
        '}';
  }
}
