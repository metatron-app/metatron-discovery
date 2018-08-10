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

package app.metatron.discovery.prep.parser.preparation.rule.expr;

import java.util.List;

public interface Identifier extends Constant {
  class IdentifierExpr implements Identifier {

    private String value;     // 원래는 final이었으나, set rule에서 각 컬럼별 작업시 해당 컬럼값으로 치환되어야 하는 경우가 생겨서 바꿈 (col$)

    public IdentifierExpr(String value) {
      this.value = value;
    }

    public String getValue() {
      return value;
    }

    public void setValue (String value) {
      this.value = value;
    }

    @Override
    public String toString() {
      return value;
    }

    @Override
    public ExprEval eval(NumericBinding bindings) {
      try {
        return ExprEval.bestEffortOf(bindings.get(value));
      } catch (Exception e){
        throw new NullPointerException("No such column name >> " + value);
      }
    }

  }

  class IdentifierArrayExpr implements Identifier {

    private final List<String> value;

    public IdentifierArrayExpr(List<String> value) {
      this.value = value;
    }

    public List<String> getValue() {
      return value;
    }

    @Override
    public String toString() {
      return value == null ? "null" : value.toString();
    }

    @Override
    public ExprEval eval(NumericBinding bindings) {
      return null;
    }
  }
}
