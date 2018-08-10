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

public class Unnest implements Rule, Rule.Factory {

  /**
   * Unnest target column
   */
  String col;

  /**
   * Target's type (map, array)
   */
  String into;

  /**
   * Index on arrays, key name on maps (multiple)
   */
  Expression idx;

  public Unnest() {
  }

  public Unnest(String col, String into, Expression idx) {
    this.col = col;
    this.into = into;
    this.idx = idx;
  }

  public String getCol() {
    return col;
  }

  public void setCol(String col) {
    this.col = col;
  }

  public String getInto() {
    return into;
  }

  public void setInto(String into) {
    this.into = into;
  }

  public Expression getIdx() {
    return idx;
  }

  public void setIdx(Expression idx) {
    this.idx = idx;
  }

  @Override
  public String getName() {
    return "unnest";
  }

  @Override
  public Rule get() {
    return new Unnest();
  }

  @Override
  public String toString() {
    return "Unnest{" +
        "col='" + col + '\'' +
        ", into=" + into +
        ", idx=" + idx +
        '}';
  }
}
