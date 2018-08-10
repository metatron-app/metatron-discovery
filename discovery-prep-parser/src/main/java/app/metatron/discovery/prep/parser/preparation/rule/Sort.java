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

public class Sort implements Rule, Rule.Factory {

  Expression order;
  Expression type;

  public Sort() {
  }

  public Sort(Expression order, Expression type) {

    this.order = order;
    this.type = type;
  }

  public Expression getOrder() {
    return order;
  }

  public void setOrder(Expression order) {
    this.order = order;
  }

  public Expression getType() {
    return type;
  }

  public void setType(Expression type) {
    this.type = type;
  }

  @Override
  public String getName() {
    return "sort";
  }

  @Override
  public Rule get() {
    return new Sort();
  }

  @Override
  public String toString() {
    return "Sort{" +
        "order=" + order +
        ", type=" + type + '}';
  }
}
