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
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import java.util.List;
import java.util.Objects;

/**
 * Created by kyungtaak on 2017. 3. 5..
 */
public class Evals {

  static final DateTimeFormatter defaultFormat = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");

  static boolean eq(ExprEval leftVal, ExprEval rightVal) {
    if (isSameType(leftVal, rightVal)) {
      return Objects.equals(leftVal.value(), rightVal.value());
    }
    if (isAllNumeric(leftVal, rightVal)) {
      return leftVal.doubleValue() == rightVal.doubleValue();
    }
    return false;
  }

  private static boolean isSameType(ExprEval leftVal, ExprEval rightVal)
  {
    return leftVal.type() == rightVal.type();
  }

  static boolean isAllNumeric(ExprEval left, ExprEval right)
  {
    return left.isNumeric() && right.isNumeric();
  }

  static boolean isAllString(ExprEval left, ExprEval right) {
    return left.type() == ExprType.STRING && right.type() == ExprType.STRING;
  }

  static void assertNumeric(ExprType type) {
    if (type != ExprType.LONG && type != ExprType.DOUBLE) {
      throw new IllegalArgumentException("unsupported type " + type);
    }
  }

  static String evalOptionalString(Expr arg, Expr.NumericBinding binding) {
    return arg == null ? null : arg.eval(binding).asString();
  }

  static String getConstantString(Expr arg) {
    if (!(arg instanceof Constant.StringExpr)) {
      throw new RuntimeException(arg + " is not constant string");
    }
    return arg.eval(null).stringValue();
  }

  static String getIdentifier(Expr arg) {
    if (!(arg instanceof Identifier.IdentifierExpr)) {
      throw new RuntimeException(arg + " is not identifier");
    }
    return arg.toString();
  }

  static long getConstantLong(Expr arg) {
    Object constant = getConstant(arg);
    if (!(constant instanceof Long)) {
      throw new RuntimeException(arg + " is not a constant long");
    }
    return (Long) constant;
  }

  static Number getConstantNumber(Expr arg) {
    Object constant = getConstant(arg);
    if (!(constant instanceof Number)) {
      throw new RuntimeException(arg + " is not a constant number");
    }
    return (Number) constant;
  }

  static DateTime getConstantTimestamp(Expr arg) {
    Object constant = getConstant(arg);
    if(!(constant instanceof  DateTime)) {
      throw new RuntimeException(arg + " is not a constant timestamp");
    }
    return (DateTime) constant;
  }

  static Object getConstant(Expr arg) {
    if (arg instanceof Constant.StringExpr) {
      return arg.eval(null).stringValue();
    } else if (arg instanceof Constant.LongExpr) {
      return arg.eval(null).longValue();
    } else if (arg instanceof Constant.DoubleExpr) {
      return arg.eval(null).doubleValue();
    } else if (arg instanceof  Constant.BooleanExpr) {
      return arg.eval(null).booleanValue();
    } else if (arg instanceof Constant.TimestampExpr) {
      return arg.eval(null).timestampValue();
    } else if (arg instanceof Expr.UnaryMinusExpr) {
      Expr.UnaryMinusExpr minusExpr = (Expr.UnaryMinusExpr)arg;
      if (minusExpr.expr instanceof Constant.LongExpr) {
        return -minusExpr.expr.eval(null).longValue();
      } else if (minusExpr.expr instanceof Constant.DoubleExpr) {
        return -minusExpr.expr.eval(null).doubleValue();
      }
    }
    throw new RuntimeException(arg + " is not a constant");
  }

  static boolean isConstant(Expr arg) {
    if (arg instanceof Constant) {
      return true;
    } else if (arg instanceof Expr.UnaryMinusExpr) {
      return ((Expr.UnaryMinusExpr)arg).expr instanceof Constant;
    }
    return false;
  }

  static Object[] getConstants(List<Expr> args) {
    Object[] constants = new Object[args.size()];
    for (int i = 0; i < constants.length; i++) {
      constants[i] = getConstant(args.get(i));
    }
    return constants;
  }

  static ExprEval castTo(ExprEval eval, ExprType castTo) {
    if (eval.type() == castTo) {
      return eval;
    }
    switch (castTo) {
      case DOUBLE:
        return ExprEval.of(eval.asDouble());
      case LONG:
        return ExprEval.of(eval.asLong());
      case STRING:
        return ExprEval.of(eval.asString());
      case BOOLEAN:
        return ExprEval.of(eval.asBoolean());
      case TIMESTAMP:
        return ExprEval.of(eval.asTimestamp());
    }
    throw new IllegalArgumentException("not supported type " + castTo);
  }

  static DateTime toDateTime(ExprEval arg) {
    switch (arg.type()) {
      case STRING:
        String string = arg.stringValue();
        return StringUtils.isNumeric(string) ? new DateTime(Long.valueOf(string)) : defaultFormat.parseDateTime(string);
      default:
        return new DateTime(arg.longValue());
    }
  }
}
