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

import app.metatron.discovery.prep.parser.exceptions.*;
import com.google.common.math.LongMath;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Created by kyungtaak on 2017. 3. 5..
 */
public interface Expr extends Expression {

  ExprEval eval(NumericBinding bindings);

  interface NumericBinding {
    Object get(String name);
  }

  class FunctionArrayExpr implements Expr {
    final List<FunctionExpr> functions;

    public FunctionArrayExpr(List<FunctionExpr> functions) {
      this.functions = functions;
    }

    public List<FunctionExpr> getFunctions() {
      return functions;
    }

    @Override
    public ExprEval eval(NumericBinding bindings) {
      return null;
    }

    @Override
    public String toString() {
      return "FunctionArrayExpr{" +
          "functions=" + functions +
          '}';
    }
  }

  class AssignExpr implements Expr {
    final Expr assignee;
    final Expr assigned;

    public AssignExpr(Expr assignee, Expr assigned) {
      this.assignee = assignee;
      this.assigned = assigned;
    }

    public Expr getAssignee() {
      return assignee;
    }

    public Expr getAssigned() {
      return assigned;
    }

    @Override
    public String toString() {
      return "(" + assignee + " = " + assigned + ")";
    }

    @Override
    public ExprEval eval(NumericBinding bindings) {
      throw new IllegalStateException("cannot evaluated directly");
    }
  }

  class FunctionExpr implements Expr {
    final Function function;
    final String name;
    final List<Expr> args;

    public Expr getLeft() {
      return null;
    }
    public Expr getRight() {
      return null;
    }
    public String getOp() {
      return null;
    }

    public FunctionExpr(Function function, String name, List<Expr> args) {
      this.function = function;
      this.name = name;
      this.args = args;
    }

    public String getName() {
      return name;
    }

    public List<Expr> getArgs() {
      return args;
    }

    @Override
    public String toString() {
      List<String> argsExprs = args.stream()
          .map(expr -> expr.toString())
          .collect(Collectors.toList());

      return name + "(" + StringUtils.join(argsExprs, ",") + ")";
    }

    @Override
    public ExprEval eval(NumericBinding bindings) {
      if (function instanceof BuiltinFunctions.Str.LengthFunc) {
        // length(expr)
        assert (args.size() == 1) : args.size();
        try {
          ExprEval exprEval = args.get(0).eval(bindings);
          return (exprEval.value() == null) ? exprEval : ExprEval.of(exprEval.stringValue().length());
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("length(): No such column name >> " + args.get(0).toString());
        } catch (ClassCastException ce) {
          throw new FunctionWorksOnlyOnStringException("ExprEval.eval() length: This function works only on string");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() length: Unknown error occur");
        }
      }
      else if (function instanceof BuiltinFunctions.ConditionFunc) {
        // if(condExpr, trueValue, falseValue)
        assert (args.size() == 1 || args.size() == 3) : args.size();
        ExprEval condEval = args.get(0).eval(bindings);
        if (args.size() == 1) {
          return ExprEval.of(condEval.asBoolean());
        }
        if (condEval.asBoolean()) {
          return args.get(1).eval(bindings);  // trueEval
        } else {
          return args.get(2).eval(bindings);  // falseEval
        }
      }
      else if (function instanceof BuiltinFunctions.IsNullFunc) {
        // isnull(expr)
        assert (args.size() == 1) : args.size();
        try {
          ExprEval exprEval = args.get(0).eval(bindings);
          return exprEval.value() == null ? ExprEval.of(true) : ExprEval.of(false);
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("isnull(): No such column name >> " + args.get(0).toString());
        }
      }
      else if (function instanceof BuiltinFunctions.IsNanFunc) {
        // isnan(expr)
        assert (args.size() == 1) : args.size();
        ExprEval exprEval;
        Double d;
        try {
          exprEval = args.get(0).eval(bindings);
          d = exprEval.asDouble();
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("isnan(): No such column name >> " + args.get(0).toString());
        } catch(Exception e) {
          return ExprEval.of(false);
        }
        return ExprEval.of(d.isNaN());
      }
      else if (function instanceof BuiltinFunctions.IsMismatchedFunc) {
        // isnull(expr)
        assert (args.size() == 2) : args.size();
        try {
          ExprEval exprEval = args.get(0).eval(bindings);
          String colType = args.get(1).eval(bindings).stringValue().replace("'", "").toUpperCase();

          if(exprEval.value() == null)
            return ExprEval.of(false);
          else
            return exprEval.type().toString().toUpperCase().equals(colType) ? ExprEval.of(false) : ExprEval.of(true);
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("isnull(): No such column name >> " + args.get(0).toString());
        }
      }
      else if (function instanceof BuiltinFunctions.IsMissingFunc) {
        // isnull(expr)
        assert (args.size() == 1) : args.size();
        try {
          ExprEval exprEval = args.get(0).eval(bindings);

          if(exprEval.value() == null) {
            return ExprEval.of(true);
          } else if(exprEval.asString().isEmpty()) {
            return ExprEval.of(true);
          }

          return ExprEval.of(false);
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("isnull(): No such column name >> " + args.get(0).toString());
        }
      }
      else if (function instanceof BuiltinFunctions.Str.UpperFunc) {
        // upper(expr)
        assert (args.size() == 1) : args.size();

        try {
          ExprEval exprEval = args.get(0).eval(bindings);
          return (exprEval.value() == null) ? exprEval : ExprEval.of(exprEval.stringValue().toUpperCase());
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("ExprEval.eval() upper: No such column name >> " + args.get(0).toString());
        } catch (ClassCastException ce) {
          throw new FunctionWorksOnlyOnStringException("ExprEval.eval() upper: This function works only on string");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() upper: Unknown error occur");
        }
      }
      else if (function instanceof BuiltinFunctions.Str.LowerFunc) {
        // lower(expr)
        assert (args.size() == 1) : args.size();

        try {
          ExprEval exprEval = args.get(0).eval(bindings);
          return (exprEval.value() == null) ? exprEval : ExprEval.of(exprEval.stringValue().toLowerCase());
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("ExprEval.eval() lower: No such column name >> " + args.get(0).toString());
        } catch (ClassCastException ce) {
          throw new FunctionWorksOnlyOnStringException("ExprEval.eval() lower: This function works only on string");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() lower: Unknown error occur");
        }
      }
      else if (function instanceof BuiltinFunctions.Str.TrimFunc) {
        // trim(expr)
        assert (args.size() == 1) : args.size();

        try{
          ExprEval exprEval = args.get(0).eval(bindings);
          return (exprEval.value() == null) ? exprEval : ExprEval.bestEffortOf(exprEval.stringValue().trim());
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("ExprEval.eval() trim: No such column name >> " + args.get(0).toString());
        } catch (ClassCastException ce) {
          throw new FunctionWorksOnlyOnStringException("ExprEval.eval() trim: This function works only on string");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() trim: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Str.LTrimFunc) {
        // ltrim(expr)
        assert (args.size() == 1) : args.size();

        try{
          ExprEval exprEval = args.get(0).eval(bindings);
          return (exprEval.value() == null) ? exprEval : ExprEval.bestEffortOf(exprEval.stringValue().replaceFirst("^\\s+", ""));
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("ExprEval.eval() ltrim: No such column name >> " + args.get(0).toString());
        } catch (ClassCastException ce) {
          throw new FunctionWorksOnlyOnStringException("ExprEval.eval() ltrim: This function works only on string");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() ltrim: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Str.RTrimFunc) {
        // rtrim(expr)
        assert (args.size() == 1) : args.size();

        try{
          ExprEval exprEval = args.get(0).eval(bindings);
          return (exprEval.value() == null) ? exprEval : ExprEval.bestEffortOf(exprEval.stringValue().replaceFirst("\\s+$", ""));
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("ExprEval.eval() rtrim: No such column name >> " + args.get(0).toString());
        } catch (ClassCastException ce) {
          throw new FunctionWorksOnlyOnStringException("ExprEval.eval() rtrim: This function works only on string");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() rtrim: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Str.SubstringFunc) {
        // substring(expr)
        assert (args.size() == 2 || args.size() == 3) : args.size();

        try{
          ExprEval exprEval = args.get(0).eval(bindings);
          String exprStr = exprEval.stringValue();

          int beginIndex = args.get(1).eval(bindings).intValue();
          if(beginIndex > exprStr.length()) {
            beginIndex = exprStr.length();
          } else if (beginIndex < 0) {
            beginIndex = exprStr.length()+beginIndex;
          }

          if(args.size()==2) {
            exprStr = exprStr.substring(beginIndex);
          } else {
            int endIndex = beginIndex + args.get(2).eval(bindings).intValue();
            if(endIndex > exprStr.length()) {
              endIndex = exprStr.length();
            }

            exprStr = exprStr.substring(beginIndex, endIndex);
          }

          return (exprEval.value() == null) ? exprEval : ExprEval.bestEffortOf(exprStr);
        } catch (StringIndexOutOfBoundsException se) {
          throw new FunctionInvalidIndexNumberException("ExprEval.eval() substring: Wrong index param");
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("ExprEval.eval() substring: No such column name >> " + args.get(0).toString());
        } catch (ClassCastException ce) {
          throw new FunctionWorksOnlyOnStringException("ExprEval.eval() substring: This function works only on string");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() substring: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Str.ContainsFunc) {
        // substring(expr)
        assert (args.size() == 2) : args.size();

        try{
          ExprEval arg0 = args.get(0).eval(bindings);
          String targetText = arg0.stringValue();

          if(arg0.value() == null)
            return arg0;

          ExprEval arg1 = args.get(1).eval(bindings);
          String searchWord = arg1.stringValue();

          return ExprEval.bestEffortOf(targetText.contains(searchWord));
        } catch (StringIndexOutOfBoundsException se) {
          throw new FunctionInvalidIndexNumberException("ExprEval.eval() contains: Wrong index param");
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("ExprEval.eval() contains: No such column name >> " + args.get(0).toString());
        } catch (ClassCastException ce) {
          throw new FunctionWorksOnlyOnStringException("ExprEval.eval() contains: This function works only on string");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() contains: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Str.StartsWithFunc) {
        // substring(expr)
        assert (args.size() == 2) : args.size();

        try{
          ExprEval arg0 = args.get(0).eval(bindings);
          String targetText = arg0.stringValue();

          if(arg0.value() == null)
            return arg0;

          ExprEval arg1 = args.get(1).eval(bindings);
          String searchWord = arg1.stringValue();

          return ExprEval.bestEffortOf(targetText.startsWith(searchWord));
        } catch (StringIndexOutOfBoundsException se) {
          throw new FunctionInvalidIndexNumberException("ExprEval.eval() startswith: Wrong index param");
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("ExprEval.eval() startswith: No such column name >> " + args.get(0).toString());
        } catch (ClassCastException ce) {
          throw new FunctionWorksOnlyOnStringException("ExprEval.eval() startswith: This function works only on string");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() startswith: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Str.EndsWithFunc) {
        // substring(expr)
        assert (args.size() == 2) : args.size();

        try{
          ExprEval arg0 = args.get(0).eval(bindings);
          String targetText = arg0.stringValue();

          if(arg0.value() == null)
            return arg0;

          ExprEval arg1 = args.get(1).eval(bindings);
          String searchWord = arg1.stringValue();

          return ExprEval.bestEffortOf(targetText.endsWith(searchWord));
        } catch (StringIndexOutOfBoundsException se) {
          throw new FunctionInvalidIndexNumberException("ExprEval.eval() endswith: Wrong index param");
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("ExprEval.eval() endswith: No such column name >> " + args.get(0).toString());
        } catch (ClassCastException ce) {
          throw new FunctionWorksOnlyOnStringException("ExprEval.eval() endswith: This function works only on string");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() endswith: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Str.ConcatFunc) {
        // concat(expr)
        assert (args.size() > 0) : args.size();
        Expression expression;
        String exprStr="";
        String resultStr="";

        try{
          for(int i = 0; i < args.size(); i++) {
            expression = args.get(i);
            if(expression instanceof Constant.StringExpr) {
              exprStr = ((Constant.StringExpr) expression).getEscapedValue();
            }
            else {
              exprStr = ((Expr) expression).eval(bindings).asString();
            }

            resultStr = resultStr + exprStr;
          }
          return ExprEval.bestEffortOf(resultStr);
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("concat(): No such column name >> " + exprStr);
        } catch (ClassCastException ce) {
          throw new FunctionWorksOnlyOnStringException("ExprEval.eval() concat: This function works only on string");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() concat: Unknown error occur");
        }
      }
      else if (function instanceof BuiltinFunctions.Str.ConcatwsFunc) {
        // concat_ws(expr)
        assert (args.size() > 1) : args.size();
        ExprEval exprEval;
        Expression expression;
        String exprStr="";
        String wsStr;
        String resultStr;

        try{
          wsStr = ((Constant.StringExpr) args.get(0)).getEscapedValue();

          expression = args.get(1);

          if(expression instanceof Constant.StringExpr) {
            resultStr = ((Constant.StringExpr) expression).getEscapedValue();
          }
          else {
            resultStr = ((Expr) expression).eval(bindings).asString();
          }

          for(int i = 2; i < args.size(); i++) {
            expression = args.get(i);
            if(expression instanceof Constant.StringExpr) {
              exprStr = ((Constant.StringExpr) expression).getEscapedValue();
            }
            else {
              exprStr = ((Expr) expression).eval(bindings).asString();
            }

            resultStr = resultStr + wsStr + exprStr;
          }
          return ExprEval.bestEffortOf(resultStr);
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("concat_ws(): No such column name >> " + exprStr);
        } catch (ClassCastException ce) {
          throw new FunctionWorksOnlyOnStringException("ExprEval.eval() concat_ws: This function works only on string");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() concat_ws: Unknown error occur");
        }
      }
      else if (function instanceof BuiltinFunctions.Times.TimestampToString) {
        //year(expr)
        assert (args.size() == 2) : args.size();

        try {
          DateTime dt = args.get(0).eval(bindings).timestampValue();
          String format = args.get(1).eval(bindings).stringValue();
          return ExprEval.of(dt.toString(format));
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("year(): No such column name >> " + args.get(0).toString());
        } catch (ClassCastException e) {
          throw new FunctionWorksOnlyOnTimestampException("ExprEval.eval() year: This function works only on timestamp");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() year: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Times.YearFunc) {
        //year(expr)
        assert (args.size() == 1) : args.size();

        try {
          DateTime dt = args.get(0).eval(bindings).timestampValue();
          return ExprEval.of(dt.getYear());
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("year(): No such column name >> " + args.get(0).toString());
        } catch (ClassCastException e) {
          throw new FunctionWorksOnlyOnTimestampException("ExprEval.eval() year: This function works only on timestamp");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() year: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Times.MonthFunc) {
        //month(expr)
        assert (args.size() == 1) : args.size();

        try {
          DateTime dt = args.get(0).eval(bindings).timestampValue();
          return ExprEval.of(dt.getMonthOfYear());
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("month(): No such column name >> " + args.get(0).toString());
        } catch (ClassCastException e) {
          throw new FunctionWorksOnlyOnTimestampException("ExprEval.eval() month: This function works only on timestamp");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() month: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Times.DayFunc) {
        //day(expr)
        assert (args.size() == 1) : args.size();

        try {
          DateTime dt = args.get(0).eval(bindings).timestampValue();
          return ExprEval.of(dt.getDayOfMonth());
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("day(): No such column name >> " + args.get(0).toString());
        } catch (ClassCastException e) {
          throw new FunctionWorksOnlyOnTimestampException("ExprEval.eval() day: This function works only on timestamp");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() day: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Times.HourFunc) {
        //hour(expr)
        assert (args.size() == 1) : args.size();

        try {
          DateTime dt = args.get(0).eval(bindings).timestampValue();
          return ExprEval.of(dt.getHourOfDay());
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("hour(): No such column name >> " + args.get(0).toString());
        } catch (ClassCastException e) {
          throw new FunctionWorksOnlyOnTimestampException("ExprEval.eval() hour: This function works only on timestamp");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() hour: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Times.MinuteFunc) {
        //minute(expr)
        assert (args.size() == 1) : args.size();

        try {
          DateTime dt = args.get(0).eval(bindings).timestampValue();
          return ExprEval.of(dt.getMinuteOfHour());
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("minute(): No such column name >> " + args.get(0).toString());
        } catch (ClassCastException e) {
          throw new FunctionWorksOnlyOnTimestampException("ExprEval.eval() minute: This function works only on timestamp");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() minute: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Times.SecondFunc) {
        //second(expr)
        assert (args.size() == 1) : args.size();

        try {
          DateTime dt = args.get(0).eval(bindings).timestampValue();
          return ExprEval.of(dt.getSecondOfMinute());
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("second(): No such column name >> " + args.get(0).toString());
        } catch (ClassCastException e) {
          throw new FunctionWorksOnlyOnTimestampException("ExprEval.eval() second: This function works only on timestamp");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() second: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Times.MillisecondFunc) {
        //millisecond(expr)
        assert (args.size() == 1) : args.size();

        try {
          DateTime dt = args.get(0).eval(bindings).timestampValue();
          return ExprEval.of(dt.getMillisOfSecond());
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("millisecond(): No such column name >> " + args.get(0).toString());
        } catch (ClassCastException e) {
          throw new FunctionWorksOnlyOnTimestampException("ExprEval.eval() millisecond: This function works only on timestamp");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() millisecond: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Times.WeekdayFunc) {
        //weekday(expr)
        assert (args.size() == 1) : args.size();

        try {
          DateTime dt = args.get(0).eval(bindings).timestampValue();
          int weekday = dt.getDayOfWeek();

          switch (weekday) {
            case 1:
              return ExprEval.bestEffortOf("Monday");
            case 2:
              return ExprEval.bestEffortOf("Tuesday");
            case 3:
              return ExprEval.bestEffortOf("Wednesday");
            case 4:
              return ExprEval.bestEffortOf("Thursday");
            case 5:
              return ExprEval.bestEffortOf("Friday");
            case 6:
              return ExprEval.bestEffortOf("Saturday");
            case 7:
              return ExprEval.bestEffortOf("Sunday");
            default:
              break;
          }
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("weekday(): No such column name >> " + args.get(0).toString());
        } catch (ClassCastException e) {
          throw new FunctionWorksOnlyOnTimestampException("ExprEval.eval() weekday: This function works only on timestamp");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() weekday: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Times.NowFunc) {

        String timeZoneId;

        if(args.size() == 0)
          timeZoneId = "UTC";
        else
          timeZoneId = args.get(0).eval(bindings).asString().replaceAll("'", "");

        try {
          DateTime dt = DateTime.now(DateTimeZone.forID(timeZoneId));
          return ExprEval.bestEffortOf(dt);
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("now(): No such column name >> " + args.get(0).toString());
        } catch (IllegalArgumentException e) {
          throw new FunctionInvalidTimezonIDException("ExprEval.eval() now: Timezone ID is invalid");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() now: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Times.AddtimeFunc) {

        assert (args.size() == 3) : args.size();

        try {
          DateTime dateTime = args.get(0).eval(bindings).asTimestamp();

          if(dateTime == null)
            throw new FunctionWorksOnlyOnTimestampException("");

          int delta = args.get(1).eval(bindings).intValue();
          String timeUnit = args.get(2).eval(bindings).stringValue().replaceAll("'", "");

          switch (timeUnit.toUpperCase()){
            case "YEAR":
              return ExprEval.bestEffortOf(dateTime.plusYears(delta));
            case "MONTH":
              return ExprEval.bestEffortOf(dateTime.plusMonths(delta));
            case "DAY":
              return ExprEval.bestEffortOf(dateTime.plusDays(delta));
            case "HOUR":
              return ExprEval.bestEffortOf(dateTime.plusHours(delta));
            case "MINUTE":
              return ExprEval.bestEffortOf(dateTime.plusMinutes(delta));
            case "SECOND":
              return ExprEval.bestEffortOf(dateTime.plusSeconds(delta));
            case "MILLISECOND":
              return ExprEval.bestEffortOf(dateTime.plusMillis(delta));
            default:
              throw new FunctionInvalidTimestampUnitException("");
          }

        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("add_time(): No such column name >> " + args.get(0).toString());
        } catch (FunctionInvalidTimestampUnitException e) {
          throw new FunctionInvalidTimestampUnitException("ExprEval.eval() add_time: Timestamp unit is invalid");
        } catch (FunctionWorksOnlyOnTimestampException e) {
          throw new FunctionWorksOnlyOnTimestampException("ExprEval.eval() add_time: This function is works only on timestamp");
        } catch (ClassCastException e) {
          throw new FunctionInvalidDeltaValueException("ExprEval.eval() add_time: The delta value must be a number");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() add_time: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Times.TimeBetweenFunc) {

        assert (args.size() == 3) : args.size();

        try {
          DateTimeFormatter dtf = DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ss.sssZ").withLocale(Locale.ENGLISH);
          DateTime dateTime = args.get(0).eval(bindings).asTimestamp();
          DateTime startTime = DateTime.parse(args.get(1).eval(bindings).asString(), dtf);
          DateTime endTime = DateTime.parse(args.get(2).eval(bindings).asString(), dtf);

          if(dateTime == null)
            return ExprEval.of(false);
          if(dateTime.isEqual(startTime))
            return ExprEval.of(true);
          if(dateTime.isAfter(startTime) && dateTime.isBefore(endTime))
            return ExprEval.of(true);

          return ExprEval.of(false);
        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("time_between(): No such column name >> " + args.get(0).toString());
        } catch (FunctionWorksOnlyOnTimestampException e) {
          throw new FunctionWorksOnlyOnTimestampException("ExprEval.eval() time_between(): This function is works only on timestamp");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() time_between(): Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Times.TimeDiffFunc) {

        assert (args.size() == 2) : args.size();

        try {
          DateTime dateTime1 = args.get(0).eval(bindings).asTimestamp();
          DateTime dateTime2 = args.get(1).eval(bindings).asTimestamp();

          if(dateTime1 == null || dateTime2 == null)
            throw new FunctionWorksOnlyOnTimestampException("");

          return ExprEval.bestEffortOf(dateTime2.getMillis()-dateTime1.getMillis());

        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("time_diff(): No such column name >> " + args.get(0).toString() + ", " + args.get(1).toString());
        } catch (FunctionWorksOnlyOnTimestampException e) {
          throw new FunctionWorksOnlyOnTimestampException("ExprEval.eval() add_time: This function is works only on timestamp");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() time_diff: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Times.TimestampFunc) {

        assert (args.size() == 2) : args.size();

        try {
          String time = args.get(0).eval(bindings).asString().replaceAll("'", "");;
          String format = args.get(1).eval(bindings).asString();

          org.joda.time.format.DateTimeFormatter dtf = DateTimeFormat.forPattern(format);
          DateTime dateTime = DateTime.parse(time, dtf);

          return ExprEval.bestEffortOf(dateTime);

        } catch (NullPointerException ne){
          throw new FunctionColumnNotFoundException("timestamp(): No such column name >> " + args.get(0).toString());
        } catch (IllegalArgumentException ie){
          throw new FunctionTimestampFormatMismatchedException("ExprEval.eval() timestamp: Timestamp format does not match");
        } catch (Exception e) {
          throw new FunctionUndefinedException("ExprEval.eval() timestamp: Unknown error occur");
        }

      }
      else if (function instanceof BuiltinFunctions.Math.SingleParamMath) {
        assert (args.size() == 1) : args.size();
        ExprEval exprEval = args.get(0).eval(bindings);
        assert exprEval.isNumeric() : exprEval.toString();
        if (exprEval.value() == null) {
          return exprEval;
        }
        switch (function.name()) {
          case "math.abs":
            return (exprEval.type()) == ExprType.LONG ? ExprEval.of(Math.abs(exprEval.longValue())) : ExprEval.of(Math.abs(exprEval.doubleValue()));
          case "math.acos":
            return ExprEval.of(Math.acos(exprEval.doubleValue()));
          case "math.asin":
            return ExprEval.of(Math.asin(exprEval.doubleValue()));
          case "math.atan":
            return ExprEval.of(Math.atan(exprEval.doubleValue()));
          case "math.cbrt":
            return ExprEval.of(Math.cbrt(exprEval.doubleValue()));
          case "math.ceil":
            return ExprEval.of(Math.ceil(exprEval.doubleValue()));
          case "math.cos":
            return ExprEval.of(Math.cos(exprEval.doubleValue()));
          case "math.cosh":
            return ExprEval.of(Math.cosh(exprEval.doubleValue()));
          case "math.exp":
            return ExprEval.of(Math.exp(exprEval.doubleValue()));
          case "math.expm1":
            return ExprEval.of(Math.expm1(exprEval.doubleValue()));
          case "math.floor":
            return ExprEval.of(Math.floor(exprEval.doubleValue()));
          case "math.getExponent":
            return ExprEval.of(Math.getExponent(exprEval.doubleValue()));
          case "math.round":
            return ExprEval.of(Math.round(exprEval.doubleValue()));
          case "math.signum":
            return ExprEval.of(Math.signum(exprEval.doubleValue()));
          case "math.sin":
            return ExprEval.of(Math.sin(exprEval.doubleValue()));
          case "math.sinh":
            return ExprEval.of(Math.sinh(exprEval.doubleValue()));
          case "math.sqrt":
            return ExprEval.of(Math.sqrt(exprEval.doubleValue()));
          case "math.tan":
            return ExprEval.of(Math.tan(exprEval.doubleValue()));
          case "math.tanh":
            return  ExprEval.of(Math.tanh(exprEval.doubleValue()));
          default:
            break;
        }
      }
      else if (function instanceof BuiltinFunctions.Math.DoubleParamMath) {
        assert (args.size() == 2) : args.size();
        ExprEval left = args.get(0).eval(bindings);
        ExprEval right = args.get(0).eval(bindings);
        assert left.isNumeric() : left.toString();
        assert right.isNumeric() : right.toString();
        if (left.value() == null) {
          return left;
        } else if (right.value() == null) {
          return right;
        }
        switch (function.name()) {
          case "math.max":
            return (left.type() == ExprType.LONG && right.type() == ExprType.LONG) ? ExprEval.of(Math.max(left.longValue(), right.longValue())) : ExprEval.of(Math.max(left.doubleValue(), right.doubleValue()));
          case "math.min":
            return (left.type() == ExprType.LONG && right.type() == ExprType.LONG) ? ExprEval.of(Math.min(left.longValue(), right.longValue())) : ExprEval.of(Math.min(left.doubleValue(), right.doubleValue()));
          case "math.nextAfter":
            return ExprEval.of(Math.nextAfter(left.doubleValue(), right.doubleValue()));
          case "math.pow":
            return ExprEval.of(Math.pow(left.doubleValue(), right.doubleValue()));
          default:
            break;
        }
      }
      else if (function instanceof BuiltinFunctions.Coalesce) {
        for (Expr expr : args) {
          ExprEval exprEval = expr.eval(bindings);
          if (exprEval.value() != null) {
            return exprEval;
          }
        }
        return ExprEval.of(null, ExprType.STRING);
      }

      assert false : "unhandled function: " + function.name();
      return null;
    }
  }

  class UnaryMinusExpr implements Expr {
    final Expr expr;

    public UnaryMinusExpr(Expr expr) {
//      if (expr.toString().contains("."))
//        this.expr = new Constant.DoubleExpr(Double.parseDouble("-" + expr.toString()));
//      else
//        this.expr = new Constant.LongExpr(Long.parseLong("-" + expr.toString()));
      this.expr = expr;
    }

    @Override
    public ExprEval eval(NumericBinding bindings) {
      ExprEval ret = expr.eval(bindings);
      if (ret.type() == ExprType.LONG) {
        return ExprEval.of(-ret.longValue());
      }
      if (ret.type() == ExprType.DOUBLE) {
        return ExprEval.of(-ret.doubleValue());
      }
      throw new IllegalArgumentException("unsupported type " + ret.type());
    }

    @Override
    public String toString() {
      return "-" + expr.toString();
    }
  }

  class UnaryNotExpr implements Expr, Expression.NotExpression {
    final Expr expr;

    public UnaryNotExpr(Expr expr) {
      this.expr = expr;
    }

    @Override
    public ExprEval eval(NumericBinding bindings)  {
      ExprEval ret = expr.eval(bindings);
      if (ret.type() == ExprType.LONG) {
        return ExprEval.of(ret.asBoolean() ? 0L : 1L);
      }
      if (ret.type() == ExprType.DOUBLE) {
        return ExprEval.of(ret.asBoolean() ? 0.0d : 1.0d);
      }
      throw new IllegalArgumentException("unsupported type " + ret.type());
    }

    @Override
    public String toString() {
      return "!" + expr.toString();
    }

    @Override
    public Expr getChild() {
      return expr;
    }
  }

  abstract class BinaryOpExprBase implements Expr {
    protected String op;
    protected Expr left;
    protected Expr right;

    public BinaryOpExprBase(String op, Expr left, Expr right) {
      this.op = op;
      this.left = left;
      this.right = right;
    }

    public String getOp() {
      return op;
    }

    public Expr getLeft() {
      return left;
    }

    public Expr getRight() {
      return right;
    }

    @Override
    public String toString() {
      return "(" + left + " " + op + " " + right + ")";
    }
  }

  abstract class BinaryNumericOpExprBase extends BinaryOpExprBase {

    public BinaryNumericOpExprBase(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    public ExprEval eval(NumericBinding bindings)  {
      ExprEval leftVal = left.eval(bindings);
      ExprEval rightVal = right.eval(bindings);

      if (leftVal.value() == null) {
        return leftVal;
      } else if (rightVal.value() == null) {
        return rightVal;
      }

      String leftStr;
      String rightStr;
      if (leftVal.type() == ExprType.STRING || rightVal.type() == ExprType.STRING) {
        if (left instanceof Constant.StringExpr) {
          leftStr = ((Constant.StringExpr) left).getEscapedValue();
        } else if(leftVal.type() == ExprType.STRING) {
          leftStr = leftVal.asString();
        } else {
          return ExprEval.of(null, ExprType.LONG);
        }
        if (right instanceof Constant.StringExpr) {
          rightStr = ((Constant.StringExpr) right).getEscapedValue();
        } else if(rightVal.type() == ExprType.STRING) {
          rightStr = rightVal.asString();
        } else {
          return ExprEval.of(null, ExprType.LONG);
        }
        return evalString(leftStr, rightStr);
//        return evalString(StringUtils.defaultString(leftVal.asString()), StringUtils.defaultString(rightVal.asString()));
      }
      if (leftVal.value() == null || rightVal.value() == null) {
        throw new IllegalArgumentException("null value");
      }
      if (leftVal.type() == ExprType.LONG && rightVal.type() == ExprType.LONG) {
        if (this.op.equals("/")) {
          return ExprEval.of(evalDouble(leftVal.doubleValue(), rightVal.doubleValue()));
        } else {
          return ExprEval.of(evalLong(leftVal.longValue(), rightVal.longValue()));
        }
      }
      return ExprEval.of(evalDouble(leftVal.doubleValue(), rightVal.doubleValue()));
    }

    protected ExprEval evalString(String left, String right) {
      throw new IllegalArgumentException("unsupported type " + ExprType.STRING);
    }

    protected abstract long evalLong(long left, long right);

    protected abstract double evalDouble(double left, double right);

    @Override
    public String toString() {
      return "(" + left + " " + op + " " + right + ")";
    }
  }

  class BinMinusExpr extends BinaryNumericOpExprBase {

    public BinMinusExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    protected final long evalLong(long left, long right) {
      return left - right;
    }

    @Override
    protected final double evalDouble(double left, double right) {
      return left - right;
    }

  }

  class BinPowExpr extends BinaryNumericOpExprBase {

    public BinPowExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    protected final long evalLong(long left, long right) {
      return LongMath.pow(left, (int) right);
    }

    @Override
    protected final double evalDouble(double left, double right) {
      return Math.pow(left, right);
    }
  }

  class BinMulExpr extends BinaryNumericOpExprBase {

    public BinMulExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    protected final long evalLong(long left, long right) {
      return left * right;
    }

    @Override
    protected final double evalDouble(double left, double right) {
      return left * right;
    }
  }

  class BinDivExpr extends BinaryNumericOpExprBase {

    public BinDivExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    protected final long evalLong(long left, long right) {
      return left / right;
    }

    @Override
    protected final double evalDouble(double left, double right) {
      return left / right;
    }
  }

  class BinModuloExpr extends BinaryNumericOpExprBase {

    public BinModuloExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    protected final long evalLong(long left, long right) {
      return left % right;
    }

    @Override
    protected final double evalDouble(double left, double right) {
      return left % right;
    }
  }

  class BinPlusExpr extends BinaryNumericOpExprBase {

    public BinPlusExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    protected ExprEval evalString(String left, String right) {
      return ExprEval.of(left + right);
    }

    @Override
    protected final long evalLong(long left, long right) {
      return left + right;
    }

    @Override
    protected final double evalDouble(double left, double right) {
      return left + right;
    }
  }

  class BinAsExpr extends BinaryNumericOpExprBase {

    public BinAsExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    protected ExprEval evalString(String left, String right) {
      return ExprEval.of(left.compareTo(right) < 0 ? 1L : 0L);
    }

    @Override
    protected final long evalLong(long left, long right) {
      return left < right ? 1L : 0L;
    }

    @Override
    protected final double evalDouble(double left, double right) {
      return left < right ? 1.0d : 0.0d;
    }
  }

  class BinLtExpr extends BinaryNumericOpExprBase {

    public BinLtExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    protected ExprEval evalString(String left, String right) {
      return ExprEval.of(left.compareTo(right) < 0 ? 1L : 0L);
    }

    @Override
    protected final long evalLong(long left, long right) {
      return left < right ? 1L : 0L;
    }

    @Override
    protected final double evalDouble(double left, double right) {
      return left < right ? 1.0d : 0.0d;
    }
  }

  class BinLeqExpr extends BinaryNumericOpExprBase {

    public BinLeqExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    protected ExprEval evalString(String left, String right) {
      return ExprEval.of(left.compareTo(right) <= 0 ? 1L : 0L);
    }

    @Override
    protected final long evalLong(long left, long right) {
      return left <= right ? 1L : 0L;
    }

    @Override
    protected final double evalDouble(double left, double right) {
      return left <= right ? 1.0d : 0.0d;
    }
  }

  class BinGtExpr extends BinaryNumericOpExprBase {

    public BinGtExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    protected ExprEval evalString(String left, String right) {
      return ExprEval.of(left.compareTo(right) > 0 ? 1L : 0L);
    }

    @Override
    protected final long evalLong(long left, long right) {
      return left > right ? 1L : 0L;
    }

    @Override
    protected final double evalDouble(double left, double right) {
      return left > right ? 1.0d : 0.0d;
    }
  }

  class BinGeqExpr extends BinaryNumericOpExprBase {

    public BinGeqExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    protected ExprEval evalString(String left, String right) {
      return ExprEval.of(left.compareTo(right) >= 0 ? 1L : 0L);
    }

    @Override
    protected final long evalLong(long left, long right) {
      return left >= right ? 1L : 0L;
    }

    @Override
    protected final double evalDouble(double left, double right) {
      return left >= right ? 1.0d : 0.0d;
    }
  }

  class BinEqExpr extends BinaryNumericOpExprBase {

    public BinEqExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    protected ExprEval evalString(String left, String right) {
      return ExprEval.of(left.equals(right) ? 1L : 0L);
    }

    @Override
    protected final long evalLong(long left, long right) {
      return left == right ? 1L : 0L;
    }

    @Override
    protected final double evalDouble(double left, double right) {
      return left == right ? 1.0d : 0.0d;
    }
  }

  class BinNeqExpr extends BinaryNumericOpExprBase {

    public BinNeqExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    protected ExprEval evalString(String left, String right) {
      return ExprEval.of(!Objects.equals(left, right) ? 1L : 0L);
    }

    @Override
    protected final long evalLong(long left, long right) {
      return left != right ? 1L : 0L;
    }

    @Override
    protected final double evalDouble(double left, double right) {
      return left != right ? 1.0d : 0.0d;
    }
  }

  class BinAndExpr extends BinaryNumericOpExprBase implements Expression.AndExpression {
    public BinAndExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    public ExprEval eval(NumericBinding bindings) {
      ExprEval leftVal = left.eval(bindings);
      return leftVal.asBoolean() ? right.eval(bindings) : leftVal;
    }

    @Override
    public List<Expr> getChildren() {
      return Arrays.asList(left, right);
    }

    protected long evalLong(long left, long right) {
      return left > 0 & right > 0 ? 1L : 0L;
    }

    @Override
    protected double evalDouble(double left, double right) {
      return left > 0 & right > 0 ? 1.0d : 0.0d;
    }
  }

  class BinOrExpr extends BinaryNumericOpExprBase implements Expression.OrExpression {
    public BinOrExpr(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    public ExprEval eval(NumericBinding bindings) {
      ExprEval leftVal = left.eval(bindings);
      return leftVal.asBoolean() ? leftVal : right.eval(bindings);
    }

    @Override
    public List<Expr> getChildren() {
      return Arrays.asList(left, right);
    }

    protected long evalLong(long left, long right) {
      return left > 0 | right > 0 ? 1L : 0L;
    }

    @Override
    protected double evalDouble(double left, double right) {
      return left > 0 | right > 0 ? 1.0d : 0.0d;
    }
  }

  class BinAndExpr2 extends BinaryNumericOpExprBase implements Expression.AndExpression {
    public BinAndExpr2(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    protected long evalLong(long left, long right) {
      return left > 0 && right > 0 ? 1L : 0L;
    }

    @Override
    protected double evalDouble(double left, double right) {
      return left > 0 && right > 0 ? 1.0d : 0.0d;
    }

    @Override
    public List<Expr> getChildren() {
      return Arrays.asList(left, right);
    }
  }

  class BinOrExpr2 extends BinaryNumericOpExprBase implements Expression.OrExpression {
    public BinOrExpr2(String op, Expr left, Expr right) {
      super(op, left, right);
    }

    @Override
    protected long evalLong(long left, long right) {
      return left > 0 || right > 0 ? 1L : 0L;
    }

    @Override
    protected double evalDouble(double left, double right) {
      return left > 0 || right > 0 ? 1.0d : 0.0d;
    }

    @Override
    public List<Expr> getChildren() {
      return Arrays.asList(left, right);
    }
  }
}


