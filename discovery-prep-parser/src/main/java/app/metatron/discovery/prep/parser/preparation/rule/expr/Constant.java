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

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by kyungtaak on 2017. 3. 5..
 */
public interface Constant extends Expr {

  Object getValue();

  class LongExpr implements Constant {
    private final long value;

    public LongExpr(long value) {
      this.value = value;
    }

    public Object getValue() {
      return value;
    }

    @Override
    public String toString() {
      return String.valueOf(value);
    }

    @Override
    public ExprEval eval(NumericBinding bindings) {
      return ExprEval.of(value, ExprType.LONG);
    }
  }

  class DoubleExpr implements Constant {

    private final double value;

      public DoubleExpr(double value) {
      this.value = value;
    }

    public Object getValue() {
      return value;
    }

    @Override
    public String toString() {
      return String.valueOf(value);
    }

    @Override
    public ExprEval eval(NumericBinding bindings) {
      return ExprEval.of(value, ExprType.DOUBLE);
    }
  }

  class BooleanExpr implements Constant {

    private final boolean value;

    public BooleanExpr(boolean value) {
      this.value = value;
    }

    public Object getValue() {
      return value;
    }

    @Override
    public String toString() {
      return String.valueOf(value);
    }

    @Override
    public ExprEval eval(NumericBinding bindings) {
      return ExprEval.of(value, ExprType.BOOLEAN);
    }
  }

  class ArrayExpr<T> implements Constant {

    private final List<T> value;

    public ArrayExpr(List<T> value) {
      this.value = value;
    }

    @Override
    public List<T> getValue() {
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

  class StringExpr implements Constant {

    private final String value;

    public StringExpr(String value) {
      this.value = value;
    }

    public String getEscapedValue() {
      return StringUtils.substring(value, 1, value.length() - 1)
              .replace("\\'", "'")
              .replace("\\\\", "\\");
    }

    public Object getValue() {
      return value;
    }

    @Override
    public String toString() {
      return String.valueOf(value);
    }

    @Override
    public ExprEval eval(NumericBinding bindings) {
      return ExprEval.of(this.getEscapedValue(), ExprType.STRING);
    }
  }

  class TimestampExpr implements Constant {

    private final DateTime value;

    public TimestampExpr(DateTime value) {
      this.value = value;
    }

    public Object getValue() {
      return value;
    }

    @Override
    public String toString() {
      return String.valueOf(value);
    }

    @Override
    public ExprEval eval(NumericBinding bindings) {
      return ExprEval.of(value, ExprType.TIMESTAMP);
    }
  }

  class StringArrayExpr implements Constant {

    private final List<String> value;

    public StringArrayExpr(List<String> value) {
      this.value = value;
    }

    public List<String> getEscapedValue() {
      return value.stream()
          .map(s -> StringUtils.substring(s, 1, s.length() - 1)
                  .replace("\\'", "'")
                  .replace("\\\\", "\\"))
          .collect(Collectors.toList());
    }

    @Override
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
