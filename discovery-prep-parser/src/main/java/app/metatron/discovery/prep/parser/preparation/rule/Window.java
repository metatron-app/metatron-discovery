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

public class Window implements Rule, Rule.Factory {

  /**
   * Target value expressions (multiple)
   */
  Expression value;

  /**
   * limit of column (Optional)
   */
  Expression order;

  Expression group;

  Expression rowsBetween;


  public Window() {
  }

  public Window(Expression value, Expression order, Expression group, Expression rowsBetween) {
    this.value = value;
    this.order = order;
    this.group = group;
    this.rowsBetween = rowsBetween;
  }

  public Expression getValue() {
    return value;
  }

  public void setValue(Expression value) {
    this.value = value;
  }

  public Expression getOrder() {
    return order;
  }

  public void setOrder(Expression order) {
    this.order = order;
  }

  public Expression getGroup() {
    return group;
  }

  public void setGroup(Expression group) {
    this.group = group;
  }

  public Expression getRowsBetween() {
    return rowsBetween;
  }

  public void setRowsBetween(Expression rowsBetween) {
    this.rowsBetween = rowsBetween;
  }

  @Override
  public String getName() {
    return "window";
  }

  @Override
  public Rule get() {
    return new Window();
  }

  @Override
  public String toString() {
    return "Window{" +
        "value=" + value +
        ", order=" + order +
        ", group=" + group +
        ", rowsBetween=" + rowsBetween +
        '}';
  }
}
