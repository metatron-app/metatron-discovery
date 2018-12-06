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

public class Extract implements Rule, Rule.Factory {

  /**
   * Allows only single column
   */
  Expression col;

  /**
   * RegularExpr or StringExpr
   */
  Expression on;

  /**
   * Number of times
   */
  Integer limit;

  /**
   * Ignore matches between
   */
  Expression quote;

  /**
   * if true, ignore case.
   */
  Boolean ignoreCase;


  public Extract() {
  }

  public Extract(Expression col, Expression on, Integer limit, Expression quote, Boolean ignoreCase) {
    this.col = col;
    this.on = on;
    this.limit = limit;
    this.quote = quote;
    this.ignoreCase = ignoreCase;
  }

  @Override
  public String getName() {
    return "extract";
  }

  @Override
  public Rule get() {
    return new Extract();
  }

  public Expression getCol() {
    return col;
  }

  public void setCol(Expression col) {
    this.col = col;
  }

  public Expression getOn() {
    return on;
  }

  public void setOn(Expression on) {
    this.on = on;
  }

  public Integer getLimit() {
    return limit;
  }

  public void setLimit(Integer limit) {
    this.limit = limit;
  }

  public Expression getQuote() {
    return quote;
  }

  public void setQuote(Expression quote) {
    this.quote = quote;
  }

  public Boolean getIgnoreCase() {
    return ignoreCase;
  }

  public void setIgnoreCase(Boolean ignoreCase) {
    this.ignoreCase = ignoreCase;
  }

  @Override
  public String toString() {
    String quoteString = null;
    if (quote != null) quoteString = quote.toString(); else quoteString = "";
    return "Extract{" +
        "col='" + col + '\'' +
        ", on=" + on +
        ", limit=" + limit +
        ", quote='" + quoteString + '\'' +
        ", ignoreCase=" + ignoreCase +
        '}';
  }
}
