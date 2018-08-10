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

public class Unpivot implements Rule, Rule.Factory {

  /**
   * Unpivot target column expressions (multiple)
   */
  Expression col;

  /**
   * Make a row on every this columns (equals or less than the column count)
   */
  Integer groupEvery;

  public Unpivot() {
  }

  public Unpivot(Expression col) {
    this.col = col;
  }

  public Unpivot(Expression col, Integer groupEvery) {
    this.col = col;
    this.groupEvery = groupEvery;
  }

  public Expression getCol() {
    return col;
  }

  public void setCol(Expression col) {
    this.col = col;
  }

  public Integer getGroupEvery() {
    return groupEvery;
  }

  public void setGroupEvery(Integer groupEvery) {
    this.groupEvery = groupEvery;
  }

  @Override
  public String getName() {
    return "unpivot";
  }

  @Override
  public Rule get() {
    return new Unpivot();
  }

  @Override
  public String toString() {
    return "Unpivot{" +
        "col=" + col +
        ", groupEvery=" + groupEvery +
        '}';
  }
}
