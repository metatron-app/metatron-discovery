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

public class Move implements Rule, Rule.Factory {

  /**
   * Target column expressions (multiple)
   */
  Expression col;

  String after;

  String before;

  public Move() {
  }

  public Move(Expression col, String after, String before) {
    this.col = col;
    this.after = after;
    this.before = before;
  }

  public Expression getCol() {
    return col;
  }

  public void setCol(Expression col) {
    this.col = col;
  }

  public String getAfter() {
    return after;
  }

  public void setAfter(String after) {
    this.after = after;
  }

  public String getBefore() {
    return before;
  }

  public void setBefore(String before) {
    this.before = before;
  }


  @Override
  public String getName() {
    return "move";
  }

  @Override
  public Rule get() {
    return new Move();
  }

  @Override
  public String toString() {
    return "Move{" +
            "col=" + col +
            ", after=" + after +
            ", before=" + before +
            '}';
  }
}
