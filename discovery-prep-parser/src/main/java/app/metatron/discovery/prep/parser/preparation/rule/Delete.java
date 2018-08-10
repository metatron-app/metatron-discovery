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

public class Delete implements Rule, Rule.Factory {

  /**
   * Condition
   */
  Expression row;

  public Delete() {
  }

  public Delete(Expression row) {
    this.row = row;
  }

  @Override
  public String getName() {
    return "delete";
  }

  public Expression getRow() {
    return row;
  }

  public void setRow(Expression row) {
    this.row = row;
  }

  @Override
  public Rule get() {
    return new Delete();
  }

  @Override
  public String toString() {
    return "Delete{" +
        "row=" + row +
        '}';
  }
}
