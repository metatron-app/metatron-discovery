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

public class CountPattern implements Rule, Rule.Factory {

  /**
   * Allows multiple column expressions
   */
  Expression col;

  /**
   * RegularExpr or StringExpr
   */
  Expression on;

  /**
   * Accepts expressions only after this
   */
  Expression after;

  /**
   * Accepts expressions only before this
   */
  Expression before;

  /**
   * if true, ignore case.
   */
  Boolean ignoreCase;

  /**
   * Ignore matches between
   */
  Expression quote;


  public CountPattern() {
  }

  public CountPattern(Expression col, Expression on, Expression after, Expression before, Boolean ignoreCase, Expression quote) {

    this.col = col;
    this.on = on;
    this.after = after;
    this.before = before;
    this.ignoreCase = ignoreCase;
    this.quote = quote;
  }

  @Override
  public String getName() {
    return "countpattern";
  }

  @Override
  public Rule get() {
    return new CountPattern();
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

  public Expression getAfter() {
    return after;
  }

  public void setAfter(Expression after) {
    this.after = after;
  }

  public Expression getBefore() {
    return before;
  }

  public void setBefore(Expression before) {
    this.before = before;
  }

  public Boolean getIgnoreCase() {
    return ignoreCase;
  }

  public void setIgnoreCase(Boolean ignoreCase) {
    this.ignoreCase = ignoreCase;
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
    return "CountPattern{" +
        "col=" + col +
        ", on=" + on +
        ", after=" + after +
        ", before=" + before +
        ", ignoreCase=" + ignoreCase +
        ", quote='" + quoteString + '\'' +
        '}';
  }
}
