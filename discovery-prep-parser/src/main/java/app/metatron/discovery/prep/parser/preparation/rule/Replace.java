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

import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;

public class Replace implements Rule, Rule.Factory {

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
   * Replace with this expression
   */
  Constant with;

  /**
   * if true, match all occurences
   */
  Boolean global;

  /**
   * if true, ignore case.
   */
  Boolean ignoreCase;

  /**
   * Ignore matches between
   */
  Expression quote;

  /**
   * Only rows which meet this condition
   */
  Expression row;


  public Replace() {
  }

  public Replace(Expression col, Expression on, Expression after, Expression before, Constant with, Boolean global, Boolean ignoreCase, Expression quote, Expression row) {
    this.col = col;
    this.on = on;
    this.after = after;
    this.before = before;
    this.with = with;
    this.global = global;
    this.ignoreCase = ignoreCase;
    this.quote = quote;
    this.row = row;
  }

  @Override
  public String getName() {
    return "replace";
  }

  @Override
  public Rule get() {
    return new Replace();
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

  public Constant getWith() {
    return with;
  }

  public void setWith(Constant with) {
    this.with = with;
  }

  public Boolean getGlobal() {
    return global;
  }

  public void setGlobal(Boolean global) {
    this.global = global;
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

  public Expression getRow() {
    return row;
  }

  public void setRow(Expression row) {
    this.row = row;
  }

  @Override
  public String toString() {
    String quoteString = null;
    if (quote != null) quoteString = quote.toString(); else quoteString = "";
    return "Replace{" +
        "col=" + col +
        ", on=" + on +
        ", after=" + after +
        ", before=" + before +
        ", with=" + with +
        ", global=" + global +
        ", ignoreCase=" + ignoreCase +
        ", quote='" + quoteString + '\'' +
        ", row=" + row +
        '}';
  }
}
