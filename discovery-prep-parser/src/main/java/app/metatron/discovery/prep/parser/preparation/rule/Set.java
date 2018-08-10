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

public class Set implements Rule, Rule.Factory {

  Expression col;
  Expression value;
  Expression row;

  public Set() {
  }

  public Set(Expression col, Expression value, Expression row) {
    this.col = col;
    this.value = value;
    this.row = row;
  }

  @Override
  public String getName() {
    return "set";
  }

  @Override
  public Rule get() {
    return new Set();
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

  public Expression getRow() {
    return row;
  }

  public void setRow(Expression row) {
    this.row = row;
  }

  @Override
  public String toString() {
    return "Set{" +
        "col=" + col +
        ", value=" + value +
        ", row=" + row +
        '}';
  }
}
