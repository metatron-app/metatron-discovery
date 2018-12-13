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

import com.google.common.collect.Lists;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.regex.Matcher;

/**
 */
public interface BuiltinFunctions extends Function.Library {

  Logger LOGGER = LoggerFactory.getLogger(BuiltinFunctions.class);

  abstract class NonParam implements Function {

    @Override
    public boolean validate(List<Expr> args) {
      if (args.size() >= 1) {
        LOGGER.warn("function '{}' needs 0 argument", name());
        return false;
      }

      return true;
    }

  }

  abstract class SingleParam implements Function {

    @Override
    public boolean validate(List<Expr> args) {
      if (args.size() != 1) {
        LOGGER.warn("function '{}' needs 1 argument", name());
        return false;
      }

      return true;
    }

  }

  abstract class DoubleParam implements Function {

    @Override
    public boolean validate(List<Expr> args) {
      if (args.size() != 2) {
        LOGGER.warn("function '{}' needs 2 arguments", name());
        return false;
      }

      return true;
    }

  }

  abstract class TripleParam implements Function {

    @Override
    public boolean validate(List<Expr> args) {
      if (args.size() != 3) {
        LOGGER.warn("function '{}' needs 3 arguments", name());
        return false;
      }

      return true;
    }

  }

  abstract class NamedParams implements Function, Function.Factory {

    @Override
    public boolean validate(List<Expr> args) {

      List<Expr> prefix = Lists.newArrayList();
      int i = 0;
      for (; i < args.size(); i++) {
        Expr expr = args.get(i);
        if (expr instanceof Expr.AssignExpr) {
          break;
        }
        prefix.add(args.get(i));
      }

      Map<String, Expr> params;
      for (; i < args.size(); i++) {
        Expr expr = args.get(i);
        if (!(expr instanceof Expr.AssignExpr)) {
          LOGGER.warn("function '{}' requires named parameters", name());
          return false;
        }
      }

      return true;
    }

  }

  class Regex implements Function, Function.Factory {
    private Matcher matcher;
    private int index = -1;

    @Override
    public String name() {
      return "regex";
    }

    @Override
    public boolean validate(List<Expr> args) {
      if (args.size() != 2 && args.size() != 3) {
        LOGGER.warn("function '{}' needs 2 or 3 arguments", name());
        return false;
      }
      return true;
    }

    @Override
    public Function get() {
      return new Regex();
    }
  }

  abstract class AggreationFunc extends SingleParam { }

  class Sum extends AggreationFunc {

    @Override
    public String name() {
      return "sum";
    }
  }

  class Avg extends AggreationFunc {

    @Override
    public String name() {
      return "avg";
    }
  }

  class Max extends AggreationFunc {

    @Override
    public String name() {
      return "max";
    }
  }

  class Min extends AggreationFunc {

    @Override
    public String name() {
      return "min";
    }
  }

  class first extends AggreationFunc {

    @Override
    public String name() {
      return "first";
    }
  }

  class last extends AggreationFunc {

    @Override
    public String name() {
      return "last";
    }
  }

  class Count extends AggreationFunc {

    @Override
    public String name() {
      return "count";
    }
  }

  abstract class WindowFuncNonParam extends NonParam { }

  abstract class WindowFuncSingleParam extends SingleParam { }

  abstract class WindowFuncDoubleParam extends DoubleParam { }

  abstract class WindowFuncTripleParam extends TripleParam { }

  class rank extends WindowFuncNonParam {

    @Override
    public String name() {
      return "rank";
    }
  }

  class dense_rank extends WindowFuncNonParam {

    @Override
    public String name() {
      return "dense_rank";
    }
  }

  class percent_rank extends WindowFuncNonParam {

    @Override
    public String name() {
      return "percent_rank";
    }
  }

  class row_number extends WindowFuncNonParam {

    @Override
    public String name() {
      return "row_number";
    }
  }

  class ntile extends WindowFuncSingleParam {

    @Override
    public String name() {
      return "ntile";
    }
  }

  class lag extends WindowFuncDoubleParam {

    @Override
    public String name() {
      return "lag";
    }
  }

  class lead extends WindowFuncDoubleParam {

    @Override
    public String name() {
      return "lead";
    }
  }

  class rolling_sum extends  WindowFuncTripleParam {

    @Override
    public String name() {
      return "rolling_sum";
    }
  }

  class rolling_avg extends  WindowFuncTripleParam {

    @Override
    public String name() {
      return "rolling_avg";
    }
  }

  class cume_dist extends WindowFuncNonParam {

    @Override
    public String name() {
      return "cume_dist";
    }
  }

  interface Math extends Function {

    abstract class SingleParamMath extends SingleParam {
    }

    abstract class DoubleParamMath extends DoubleParam {
    }

    abstract class TripleParamMath extends TripleParam {
    }

    class Abs extends SingleParamMath {
      @Override
      public String name() {
        return "math.abs";
      }
    }

    class Acos extends SingleParamMath {
      @Override
      public String name() {
        return "math.acos";
      }
    }

    class Asin extends SingleParamMath {
      @Override
      public String name() {
        return "math.asin";
      }
    }

    class Atan extends SingleParamMath {
      @Override
      public String name() {
        return "math.atan";
      }
    }

    class Cbrt extends SingleParamMath {
      @Override
      public String name() {
        return "math.cbrt";
      }
    }

    class Ceil extends SingleParamMath {
      @Override
      public String name() {
        return "math.ceil";
      }
    }

    class Cos extends SingleParamMath {
      @Override
      public String name() {
        return "math.cos";
      }
    }

    class Cosh extends SingleParamMath {
      @Override
      public String name() {
        return "math.cosh";
      }
    }

    class Exp extends SingleParamMath {
      @Override
      public String name() {
        return "math.exp";
      }
    }

    class Expm1 extends SingleParamMath {
      @Override
      public String name() {
        return "math.expm1";
      }
    }

    class Floor extends SingleParamMath {
      @Override
      public String name() {
        return "math.floor";
      }
    }

    class GetExponent extends SingleParamMath {
      @Override
      public String name() {
        return "math.getExponent";
      }
    }

    class Round extends SingleParamMath {
      @Override
      public String name() {
        return "math.round";
      }
    }

    class Signum extends SingleParamMath {
      @Override
      public String name() {
        return "math.signum";
      }
    }

    class Sin extends SingleParamMath {
      @Override
      public String name() {
        return "math.sin";
      }
    }

    class Sinh extends SingleParamMath {
      @Override
      public String name() {
        return "math.sinh";
      }
    }

    class Sqrt extends SingleParamMath {
      @Override
      public String name() {
        return "math.sqrt";
      }
    }

    class Tan extends SingleParamMath {
      @Override
      public String name() {
        return "math.tan";
      }
    }

    class Tanh extends SingleParamMath {
      @Override
      public String name() {
        return "math.tanh";
      }
    }

    class Max extends DoubleParamMath {
      @Override
      public String name() {
        return "math.max";
      }
    }

    class Min extends DoubleParamMath {
      @Override
      public String name() {
        return "math.min";
      }
    }

    class NextAfter extends DoubleParamMath {
      @Override
      public String name() {
        return "math.nextAfter";
      }
    }

    class Pow extends DoubleParamMath {
      @Override
      public String name() {
        return "math.pow";
      }
    }

  }

  class ConditionFunc implements Function {
    @Override
    public String name() {
      return "if";
    }

    @Override
    public boolean validate(List<Expr> args) {
      if (args.size() < 3) {
        LOGGER.warn("function 'if' needs at least 3 argument");
        return false;
      }
      if (args.size() % 2 == 0) {
        LOGGER.warn("function 'if' needs default value");
        return false;
      }
      return true;
    }
  }

  class CastFunc implements Function, Function.Factory {
    private ExprType castTo;

    @Override
    public String name() {
      return "cast";
    }

    @Override
    public boolean validate(List<Expr> args) {
      if (args.size() != 2) {
        LOGGER.warn("function '" + name() + "' needs 2 argument");
        return false;
      }

      return true;
    }

    @Override
    public Function get() {
      return new CastFunc();
    }
  }

  class TimestampFromEpochFunc extends NamedParams {

    private DateTimeFormatter formatter;

    @Override
    public String name() {
      return "timestamp";
    }

    @Override
    public boolean validate(List<Expr> args) {

      if (args.isEmpty()) {
        LOGGER.warn("function '{}' needs at least 1 generic argument", name());
        return false;
      }

      return true;
    }

    protected void initialize(List<Expr> args, Map<String, Expr> params, Expr.NumericBinding bindings) {
      String format = args.size() > 1 ?
          Evals.getConstantString(args.get(1)).trim() :
          Evals.evalOptionalString(params.get("format"), bindings);
      String language = args.size() > 2 ?
          Evals.getConstantString(args.get(2)).trim() :
          Evals.evalOptionalString(params.get("locale"), bindings);
      String timezone = args.size() > 3 ?
          Evals.getConstantString(args.get(3)).trim() :
          Evals.evalOptionalString(params.get("timezone"), bindings);

      formatter = format == null ? DateTimeFormat.fullDateTime() : DateTimeFormat.forPattern(format);
      if (language != null) {
        formatter.withLocale(Locale.forLanguageTag(language));
      }
      if (timezone != null) {
        formatter.withZone(DateTimeZone.forTimeZone(TimeZone.getTimeZone(timezone)));
      }
    }

    protected ExprEval toValue(DateTime date) {
      return ExprEval.of(date.getMillis(), ExprType.LONG);
    }

    @Override
    public Function get() {
      return new TimestampFromEpochFunc();
    }
  }

  class UnixTimestampFunc extends TimestampFromEpochFunc {
    @Override
    public String name() {
      return "unix_timestamp";
    }

    @Override
    protected final ExprEval toValue(DateTime date) {
      return ExprEval.of(date.getMillis() / 1000, ExprType.LONG);
    }

    @Override
    public Function get() {
      return new UnixTimestampFunc();
    }
  }

  class TimeExtractFunc extends TimestampFromEpochFunc {

    private DateTimeFormatter outputFormat;

    @Override
    public String name() {
      return "time_extract";
    }

    @Override
    protected void initialize(List<Expr> args, Map<String, Expr> params, Expr.NumericBinding bindings) {
      super.initialize(args, params, bindings);
      String format = Evals.evalOptionalString(params.get("out.format"), bindings);
      String language = Evals.evalOptionalString(params.get("out.locale"), bindings);
      String timezone = Evals.evalOptionalString(params.get("out.timezone"), bindings);

      outputFormat = format == null ? DateTimeFormat.fullDateTime() : DateTimeFormat.forPattern(format);
      if (language != null) {
        outputFormat.withLocale(Locale.forLanguageTag(language));
      }
      if (timezone != null) {
        outputFormat.withZone(DateTimeZone.forTimeZone(TimeZone.getTimeZone(timezone)));
      }
    }

    @Override
    protected final ExprEval toValue(DateTime date) {
      return ExprEval.of(date.toString(outputFormat));
    }

    @Override
    public Function get() {
      return new TimeExtractFunc();
    }
  }

  class IsNullFunc implements Function {
    @Override
    public String name() {
      return "isnull";
    }

    @Override
    public boolean validate(List<Expr> args) {

      if (args.size() != 1) {
        LOGGER.warn("function 'isNull' needs 1 argument");
        return false;
      }

      return true;
    }
  }

  class IsNanFunc implements Function {
    @Override
    public String name() {
      return "isnan";
    }

    @Override
    public boolean validate(List<Expr> args) {

      if (args.size() != 1) {
        LOGGER.warn("function 'isNull' needs 1 argument");
        return false;
      }

      return true;
    }
  }

  class IsMismatchedFunc implements Function {
    @Override
    public String name() {
      return "ismismatched";
    }

    @Override
    public boolean validate(List<Expr> args) {

      if (args.size() != 2) {
        LOGGER.warn("function 'isMismatched' needs 2 argument");
        return false;
      }

      return true;
    }
  }

  class IsMissingFunc implements Function {
    @Override
    public String name() {
      return "ismissing";
    }

    @Override
    public boolean validate(List<Expr> args) {

      if (args.size() != 1) {
        LOGGER.warn("function 'isMissing' needs 1 argument");
        return false;
      }

      return true;
    }
  }

  abstract class NvlFunc implements Function {
    @Override
    public String name() {
      return "nvl";
    }

    @Override
    public boolean validate(List<Expr> args) {

      if (args.size() != 2) {
        LOGGER.warn("function 'nvl' needs 2 arguments");
        return false;
      }

      return true;
    }

  }

  class Coalesce extends NvlFunc {
    @Override
    public String name() {
      return "coalesce";
    }
  }

  class DateDiffFunc implements Function {
    @Override
    public String name() {
      return "datediff";
    }

    @Override
    public boolean validate(List<Expr> args) {
      if (args.size() < 2) {
        LOGGER.warn("function 'datediff' needs at least 2 arguments");
        return false;
      }

      return true;
    }

  }

  class ToDateFunc implements Function {
    @Override
    public String name() {
      return "to_date";
    }

    @Override
    public boolean validate(List<Expr> args) {
      if (args.size() == 1) {
        LOGGER.warn("function 'datediff' needs 1 arguments");
        return false;
      }

      return true;
    }

  }

  class CaseWhenFunc implements Function {
    @Override
    public String name() {
      return "case";
    }

    @Override
    public boolean validate(List<Expr> args) {
      if (args.size() < 3) {
        LOGGER.warn("function 'case' needs at least 3 arguments");
        return false;
      }

      return true;
    }
  }

  interface Times extends Function {
    class TimestampToString implements Function {
      @Override
      public String name() {
        return "timestamptostring";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 2) {
          LOGGER.warn("function 'year' needs 1 argument");
          return false;
        }
        return true;
      }
    }

    class YearFunc implements Function {
      @Override
      public String name() {
        return "year";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 1) {
          LOGGER.warn("function 'year' needs 1 argument");
          return false;
        }
        return true;
      }
    }

    class MonthFunc implements Function {
      @Override
      public String name() {
        return "month";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 1) {
          LOGGER.warn("function 'month' needs 1 argument");
          return false;
        }
        return true;
      }
    }

    class DayFunc implements Function {
      @Override
      public String name() {
        return "day";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 1) {
          LOGGER.warn("function 'day' needs 1 argument");
          return false;
        }
        return true;
      }
    }

    class HourFunc implements Function {
      @Override
      public String name() {
        return "hour";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 1) {
          LOGGER.warn("function 'hour' needs 1 argument");
          return false;
        }
        return true;
      }
    }

    class MinuteFunc implements Function {
      @Override
      public String name() {
        return "minute";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 1) {
          LOGGER.warn("function 'minute' needs 1 argument");
          return false;
        }
        return true;
      }
    }

    class SecondFunc implements Function {
      @Override
      public String name() {
        return "second";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 1) {
          LOGGER.warn("function 'second' needs 1 argument");
          return false;
        }
        return true;
      }
    }

    class MillisecondFunc implements Function {
      @Override
      public String name() {
        return "millisecond";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 1) {
          LOGGER.warn("function 'millisecond' needs 1 argument");
          return false;
        }
        return true;
      }
    }

    class WeekdayFunc implements Function {
      @Override
      public String name() {
        return "weekday";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 1) {
          LOGGER.warn("function 'weekday' needs 1 argument");
          return false;
        }
        return true;
      }
    }

    class NowFunc implements Function {
      @Override
      public String name() {
        return "now";
      }

      @Override
      public boolean validate(List<Expr> args) {
        return true;
      }
    }

    class AddtimeFunc implements Function {
      @Override
      public String name() {
        return "add_time";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 3) {
          LOGGER.warn("function 'add_time' needs 3 argument");
          return false;
        }
        return true;
      }
    }

    class TimeDiffFunc implements Function {
      @Override
      public String name() {
        return "time_diff";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 2) {
          LOGGER.warn("function 'time_diff' needs 2 argument");
          return false;
        }
        return true;
      }
    }

    class TimeBetweenFunc implements Function {
      @Override
      public String name() {
        return "time_between";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 3) {
          LOGGER.warn("function 'time_diff' needs 2 argument");
          return false;
        }
        return true;
      }
    }

    class TimestampFunc implements Function {
      @Override
      public String name() {
        return "timestamp";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 2) {
          LOGGER.warn("function 'timestamp' needs 2 argument");
          return false;
        }
        return true;
      }
    }
  }

  interface Str extends Function {

    class ConcatFunc implements Function {
      @Override
      public String name() {
        return "concat";
      }

      @Override
      public boolean validate(List<Expr> args) {
        return true;
      }
    }

    class ConcatwsFunc implements Function {
      @Override
      public String name() {
        return "concat_ws";
      }

      @Override
      public boolean validate(List<Expr> args) {
        return true;
      }
    }

    class FormatFunc implements Function, Factory {

      @Override
      public String name() {
        return "format";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.isEmpty()) {
          LOGGER.warn("function 'format' needs at least 1 argument");
          return false;
        }

        return true;
      }

      @Override
      public Function get() {
        return new FormatFunc();
      }
    }

    class LPadFunc implements Function, Factory {

      @Override
      public String name() {
        return "lpad";
      }

      private transient int length = -1;
      private transient char padding;

      @Override
      public boolean validate(List<Expr> args) {
        if (args.isEmpty()) {
          LOGGER.warn("function 'lpad' needs 3 arguments");
          return false;
        }

        length = (int) Evals.getConstantLong(args.get(1));
        String string = Evals.getConstantString(args.get(2));
        if (string.length() != 1) {
          LOGGER.warn("3rd argument of function 'lpad' should be constant char");
          return false;
        }

        return true;
      }

      @Override
      public Function get() {
        return new LPadFunc();
      }
    }

    class RPadFunc implements Function, Factory {
      @Override
      public String name() {
        return "rpad";
      }

      private transient int length = -1;
      private transient char padding;

      @Override
      public boolean validate(List<Expr> args) {
        if (args.isEmpty()) {
          LOGGER.warn("function 'rpad' needs 3 arguments");
          return false;
        }

        length = (int) Evals.getConstantLong(args.get(1));
        String string = Evals.getConstantString(args.get(2));
        if (string.length() != 1) {
          LOGGER.warn("3rd argument of function 'rpad' should be constant char");
          return false;
        }

        return true;
      }

      @Override
      public Function get() {
        return new RPadFunc();
      }
    }

    class UpperFunc implements Function {
      @Override
      public String name() {
        return "upper";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 1) {
          LOGGER.warn("function 'upper' needs 1 argument");
          return false;
        }

        return true;
      }

    }

    class LowerFunc implements Function {
      @Override
      public String name() {
        return "lower";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 1) {
          LOGGER.warn("function 'lower' needs 1 argument");
          return false;
        }

        return true;
      }

    }

    class SplitFunc implements Function {
      @Override
      public String name() {
        return "split";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 3) {
          LOGGER.warn("function 'split' needs 3 arguments");
          return false;
        }

        return true;
      }
    }

    class ProperFunc implements Function {
      @Override
      public String name() {
        return "proper";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 1) {
          LOGGER.warn("function 'split' needs 1 arguments");
          return false;
        }

        return true;
      }

    }

    class LengthFunc implements Function {
      @Override
      public String name() {
        return "length";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 1) {
          LOGGER.warn("function 'length' needs 1 argument");
          return false;
        }

        return true;
      }
    }

    class SubstringFunc implements Function {
      @Override
      public String name() {
        return "substring";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() > 3 || args.size() < 2) {
          LOGGER.warn("function 'substring' allows 2 or 3 arguments");
          return false;
        }

        return true;
      }
    }

    class ContainsFunc implements Function {
      @Override
      public String name() {
        return "contains";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() !=2 ) {
          LOGGER.warn("function 'substring' allows 2 or 3 arguments");
          return false;
        }

        return true;
      }
    }

    class StartsWithFunc implements Function {
      @Override
      public String name() {
        return "startswith";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() !=2 ) {
          LOGGER.warn("function 'startswith' allows 2 or 3 arguments");
          return false;
        }

        return true;
      }
    }

    class EndsWithFunc implements Function {
      @Override
      public String name() {
        return "endswith";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() !=2 ) {
          LOGGER.warn("function 'endswith' allows 2 or 3 arguments");
          return false;
        }

        return true;
      }
    }

    class LeftFunc implements Function {
      @Override
      public String name() {
        return "left";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 2) {
          LOGGER.warn("function 'left' needs 2 arguments");
          return false;
        }

        return true;
      }

    }

    class RightFunc implements Function {
      @Override
      public String name() {
        return "right";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 2) {
          LOGGER.warn("function 'right' needs 2 arguments");
          return false;
        }

        return true;
      }
    }

    class MidFunc implements Function {
      @Override
      public String name() {
        return "mid";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 3) {
          LOGGER.warn("function 'mid' needs 3 arguments");
          return false;
        }

        return true;
      }

    }

    class IndexOfFunc implements Function {
      @Override
      public String name() {
        return "indexOf";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 2) {
          LOGGER.warn("function 'mid' needs 2 arguments");
          return false;
        }

        return true;
      }
    }

    class ReplaceFunc implements Function {

      @Override
      public String name() {
        return "replace";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 3) {
          LOGGER.warn("function 'replace' needs 2 arguments");
          return false;
        }

        return true;
      }

    }

    class TrimFunc implements Function {
      @Override
      public String name() {
        return "trim";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 3) {
          LOGGER.warn("function 'trim' needs 1 argument");
          return false;
        }

        return true;
      }
    }

    class LTrimFunc implements Function {
      @Override
      public String name() {
        return "ltrim";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 3) {
          LOGGER.warn("function 'ltrim' needs 1 argument");
          return false;
        }

        return true;
      }
    }

    class RTrimFunc implements Function {
      @Override
      public String name() {
        return "rtrim";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() != 3) {
          LOGGER.warn("function 'rtrim' needs 1 argument");
          return false;
        }

        return true;
      }
    }

    class InFunc implements Function, Factory {
      @Override
      public String name() {
        return "in";
      }

      @Override
      public boolean validate(List<Expr> args) {
        if (args.size() < 2) {
          LOGGER.warn("function 'in' needs at least 2 arguments");
          return false;
        }

        return true;
      }

      @Override
      public Function get() {
        return new InFunc();
      }
    }
    /*
    class Now implements Function {

      @Override
      public String name() {
        return "now";
      }

      @Override
      public boolean validate(List<Expr> args) {
        return true;
      }

    }
    */
  }
}
