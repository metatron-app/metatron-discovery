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

public class SplitRows implements Rule, Rule.Factory {

  /**
   * Allows only single column
   */
  String col;

  /**
   * RegularExpr or StringExpr
   */
  Expression on;

  /**
   * Ignore matches between
   */
  Expression quote;

  public SplitRows() {
  }

  public SplitRows(String col, Expression on, Expression quote) {
    this.col = col;
    this.on = on;
    this.quote = quote;
  }

  @Override
  public String getName() {
    return "split";
  }

  @Override
  public Rule get() {
    return new SplitRows();
  }

  public String getCol() {
    return col;
  }

  public void setCol(String col) {
    this.col = col;
  }

  public Expression getOn() {
    return on;
  }

  public void setOn(Expression on) {
    this.on = on;
  }

  public Expression getQuote() {
    return quote;
  }

  public void setQuote(Expression quote) {
    this.quote = quote;
  }

  @Override
  public String toString() {
    String quoteString = null;
    if (quote != null) quoteString = quote.toString(); else quoteString = "";
    return "SplitRows{" +
        "col='" + col + '\'' +
        ", on=" + on +
        ", quote='" + quoteString + '\'' +
        '}';
  }
}
