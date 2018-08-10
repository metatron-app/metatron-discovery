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

public class SetType implements Rule, Rule.Factory {
  Expression col;
  String type;
  String format;

  public SetType() {
  }

  public SetType(Expression col, String type) {
    this.col = col;
    this.type = type;
    this.format = "";
  }

  public SetType(Expression col, String type, String format) {
    this.col = col;
    this.type = type;
    this.format = format;
  }

  @Override
  public String getName() {
    return "settype";
  }

  public Expression getCol() {
    return col;
  }

  public void setCol(Expression col) {
    this.col = col;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }


  public String getFormat() {
    if(format == null)
      return "";

    return format.substring(1, format.length()-1)
            .replace("\\'", "'")
            .replace("\\\\", "\\");
  }

  public void setFormat(String format) {
    this.format = format;
  }


  @Override
  public Rule get() {
    return new SetType();
  }

  @Override
  public String toString() {
    return "SetType{" +
        "col=" + col +
        ", type=" + type +
        ", format=" + format +
        '}';
  }
}
