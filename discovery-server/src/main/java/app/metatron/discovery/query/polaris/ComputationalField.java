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

package app.metatron.discovery.query.polaris;

import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.data.InvalidExpressionException;
import app.metatron.discovery.domain.workbook.configurations.field.ExpressionField;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.aggregations.*;
import app.metatron.discovery.query.druid.limits.WindowingSpec;
import app.metatron.discovery.query.druid.postaggregations.MathPostAggregator;
import app.metatron.discovery.query.polaris.ExprParser.FunctionExprContext;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.antlr.v4.runtime.ANTLRInputStream;
import org.antlr.v4.runtime.CommonToken;
import org.antlr.v4.runtime.CommonTokenStream;
import org.antlr.v4.runtime.ParserRuleContext;
import org.antlr.v4.runtime.tree.ErrorNode;
import org.antlr.v4.runtime.tree.ParseTree;
import org.antlr.v4.runtime.tree.TerminalNode;
import org.antlr.v4.runtime.tree.TerminalNodeImpl;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;

import java.util.*;

import static app.metatron.discovery.query.polaris.ExprParser.IDENTIFIER;
import static app.metatron.discovery.query.polaris.ExprParser.IdentifierExprContext;

/**
 * Created by hsp on 2016. 4. 22..
 */
public class ComputationalField {

  public enum CheckType {
    CHECK_TYPE_INVALID,
    CHECK_TYPE_VALID_AGGREGATOR,
    CHECK_TYPE_VALID_NON_AGGREGATOR,
  }


  static class FunctionInfo {

    enum FunctionInfoType {
      FUNCTION_INFO_TYPE_OPERATOR,
      FUNCTION_INFO_TYPE_WINDOW_OPERATOR,
      FUNCTION_INFO_TYPE_AGGREGATOR
    }

    public FunctionInfo(String compareType, int numberOfParam, FunctionInfoType type) {
      this.compareType = compareType;
      this.numberOfParam = numberOfParam;
      this.type = type;
    }

    public FunctionInfo(String compareType, int numberOfParam, FunctionInfoType type, String cmdPresto) {
      this.compareType = compareType;
      this.numberOfParam = numberOfParam;
      this.type = type;
      this.cmdPresto = cmdPresto;
    }

    public FunctionInfo(String compareType, int numberOfParam, FunctionInfoType type, String cmdPresto,
            String cmdPhoenix) {
      this.compareType = compareType;
      this.numberOfParam = numberOfParam;
      this.type = type;
      this.cmdPresto = cmdPresto;
      this.cmdPhoenix = cmdPhoenix;
    }

    String compareType;
    int numberOfParam;
    FunctionInfoType type;
    String cmdPresto;
    String cmdPhoenix;

  }

  static class WrapInt {

    int value;

    public WrapInt() {
      value = 0;
    }
  }

  static final Map<String, FunctionInfo> functionInfos;

  static {
    // ImmutableMap을 써볼까?
    functionInfos = new HashMap<>();

    functionInfos.put("size".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("array".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("like".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("regex".toLowerCase(),
            new FunctionInfo("ge", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("abs".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("acos".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("asin".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("atan".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("cbrt".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("ceil".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("cos".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("cosh".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("exp".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("expm1".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("floor".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("getexponent".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("log".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("log10".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("log1p".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("nextup".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("rint".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("round".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("signum".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("sin".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("sinh".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("sqrt".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("tan".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("tanh".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("todegrees".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("toradians".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("ulp".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("atan2".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("copysign".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("hypot".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("remainder".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("max".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("min".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("nextafter".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("pow".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("scalb".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("if".toLowerCase(),
            new FunctionInfo("ge", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("cast".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("timestamp".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("unix_timestamp".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("time_format".toLowerCase(),
            new FunctionInfo("ge", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("isnull".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("nvl".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("datediff".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("switch".toLowerCase(),
            new FunctionInfo("ge", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("case".toLowerCase(),
            new FunctionInfo("ge", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("concat".toLowerCase(),
            new FunctionInfo("ge", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("format".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("lpad".toLowerCase(),
            new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("rpad".toLowerCase(),
            new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("upper".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("lower".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("split".toLowerCase(),
            new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("splitregex".toLowerCase(),
            new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("proper".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("length".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("strlen".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("left".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("right".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("mid".toLowerCase(),
            new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("substring".toLowerCase(),
            new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("indexof".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("replace".toLowerCase(),
            new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("trim".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("btrim".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("ltrim".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("rtrim".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("in".toLowerCase(),
            new FunctionInfo("ge", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("between".toLowerCase(),
            new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("startswith".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("endswith".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("startswithignorecase".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("endswithignorecase".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("contains".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("match".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("now".toLowerCase(),
            new FunctionInfo("eq", 0, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("current_time".toLowerCase(),
            new FunctionInfo("eq", 0, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("recent".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("bucketstart".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("bucketend".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("bucketstartdatetime".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("bucketenddatetime".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("add_time".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("sub_time".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("difftime".toLowerCase(),
            new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("dayname".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("dayofmonth".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("lastdayofmonth".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("dayofweek".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("dayofyear".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("weekofweekyear".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("weekyear".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("hour".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("month".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("monthname".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("year".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("first_day".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("last_day".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("datetime".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("datetime_millis".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("timestamp_validate".toLowerCase(),
            new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("datetime_extract".toLowerCase(),
            new FunctionInfo("ge", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));
    functionInfos.put("$prev".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$next".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$last".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$first".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$nth".toLowerCase(),
            new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$lag".toLowerCase(),
            new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$lead".toLowerCase(),
            new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$delta".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$sum".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$min".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$max".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$row_num".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$rank".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$dense_rank".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$mean".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$variance".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$stddev".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$variancepop".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$stddevpop".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$percentile".toLowerCase(),
            new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("$size".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR));
    functionInfos.put("minof".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR));
    functionInfos.put("maxof".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR));
    functionInfos.put("avgof".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR));
    functionInfos.put("sumof".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR));
    functionInfos.put("varianceof".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR));
    functionInfos.put("stddevof".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR));
    functionInfos.put("countof".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR));
    functionInfos.put("countd".toLowerCase(),
            new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR));
    functionInfos.put("ifcountd".toLowerCase(),
            new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR));
    //    functionInfos.put("+".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    //    functionInfos.put("-".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    //    functionInfos.put("*".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    //    functionInfos.put("/".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    //    functionInfos.put("%".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    //    functionInfos.put("^".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("ipv4_in".toLowerCase(),
            new FunctionInfo("ge", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR));


  }

  public static int getWindowFunctions(ParseTree node, List<FunctionExprContext> windowFunctions) {

    if (node == null || node.getChild(0) == null) {
      return windowFunctions == null ? 0 : windowFunctions.size();
    }

    if (node instanceof FunctionExprContext) {

      if (node.getChild(0).getText() == null) {
        return windowFunctions == null ? 0 : windowFunctions.size();
      }

      String fnName = node.getChild(0).getText().toLowerCase();

      FunctionInfo functionInfo = functionInfos.get(fnName);

      if (functionInfo == null) {
        return windowFunctions.size();
      }

      if (functionInfo.type == FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR) {
        windowFunctions.add((FunctionExprContext) node);
      } else {
        for (int i = 0; i < node.getChildCount(); i++) {
          getWindowFunctions(node.getChild(i), windowFunctions);
        }
      }
    } else {
      for (int i = 0; i < node.getChildCount(); i++) {
        getWindowFunctions(node.getChild(i), windowFunctions);
      }
    }

    return windowFunctions.size();
  }

  public static int getAggregations(ParseTree node, List<FunctionExprContext> aggregationFunctions) {

    if (node instanceof FunctionExprContext) {
      String fnName = node.getChild(0).getText().toLowerCase();

      FunctionInfo functionInfo = functionInfos.get(fnName);

      if (functionInfo.type == FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR) {
        aggregationFunctions.add((FunctionExprContext) node);
      } else {
        for (int i = 0; i < node.getChildCount(); i++) {
          getAggregations(node.getChild(i), aggregationFunctions);
        }
      }
    } else {
      for (int i = 0; i < node.getChildCount(); i++) {
        getAggregations(node.getChild(i), aggregationFunctions);
      }
    }

    return aggregationFunctions.size();
  }

  public static boolean checkParserTree(ParseTree node, boolean inAggregationFunc, WrapInt AggregationFuncCount,
          StringBuilder errorInfo) {

    if (node instanceof ErrorNode) {
      errorInfo.append(node.getText());
      return false;
    }

    if (node instanceof FunctionExprContext) {

      String fnName = ((FunctionExprContext) node).IDENTIFIER().getText().toLowerCase();

      FunctionInfo functionInfo = functionInfos.get(fnName);

      if (functionInfo == null) {
        errorInfo.append("unknown function name , ").append(node.getText());
        return false;
      }

      if (functionInfo.numberOfParam != 0 && node.getChildCount() != 4) {
        errorInfo.append("param count miss match , ").append(node.getText());
        return false;
      }

      if (((FunctionExprContext) node).fnArgs() == null) {
        if (!(functionInfo.compareType.equals("eq") && functionInfo.numberOfParam == 0)) {
          errorInfo.append("param count miss match , ").append(node.getText());
          return false;
        }
      } else if (functionInfo.compareType.equals("eq")) {
        if (!(((FunctionExprContext) node).fnArgs().getChildCount() == (functionInfo.numberOfParam * 2 - 1))) {
          errorInfo.append("param count miss match , ").append(node.getText());
          return false;
        }
      } else if (functionInfo.compareType.equals("ge")) {
        if (!(((FunctionExprContext) node).fnArgs().getChildCount() >= (functionInfo.numberOfParam * 2 - 1))) {
          errorInfo.append("param count miss match , ").append(node.getText());
          return false;
        }
      }

      if (functionInfo.type == FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR) {
        if (inAggregationFunc) {
          errorInfo.append("aggregation in aggregation, ").append(node.getText());
          return false;
        }
        inAggregationFunc = true;
        AggregationFuncCount.value += 1;
      } else if (functionInfo.type == FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR) {
        if (inAggregationFunc) {
          errorInfo.append("windowfunction in aggregation, ").append(node.getText());
          return false;
        }
        // TODO : need to check window function in window function ??
        // TODO : need to check aggregation in window function !!

      } else { // FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR

      }
    }

    if (!(node instanceof TerminalNode) && (node.getChildCount() == 0)) {
      errorInfo.append("no viable alternative at input");
      return false;
    }

    for (int i = 0; i < node.getChildCount(); i++) {
      if (!checkParserTree(node.getChild(i), inAggregationFunc, AggregationFuncCount, errorInfo)) {
        return false;
      }
    }

    return true;
  }


  // 1. error node 가 발견된 경우
  // 2. agg 안에서 agg가 발생한 경우
  // 3. param count check
  public static CheckType checkComputationalField(String computationalField) {

    List<String> aggregationFunctions = new ArrayList<>();
    app.metatron.discovery.query.polaris.ExprLexer lexer = new app.metatron.discovery.query.polaris.ExprLexer(
            new ANTLRInputStream(computationalField));
    CommonTokenStream tokens = new CommonTokenStream(lexer);
    app.metatron.discovery.query.polaris.ExprParser parser = new app.metatron.discovery.query.polaris.ExprParser(
            tokens);
    ParseTree tree = parser.expr();

    StringBuilder errorInfo = new StringBuilder();
    WrapInt AggregationFuncCount = new WrapInt();

    boolean result = checkParserTree(tree, false, AggregationFuncCount, errorInfo);
    if (!result) {
      throw new InvalidExpressionException(errorInfo.toString());
    }

    if (AggregationFuncCount.value > 0) {
      return CheckType.CHECK_TYPE_VALID_AGGREGATOR;
    } else {
      return CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR;
    }

  }

  public static CheckType checkComputationalFieldIn(String computationalField, Map<String, String> mapField) {

    String fieldName = "check_computational_field";
    if (mapField == null) {
      mapField = Maps.newHashMap();
    }
    mapField.put(fieldName, computationalField);

    return checkComputationalField(computationalField);
  }


  public static ParseTree getParseTree(String expression) {

    app.metatron.discovery.query.polaris.ExprLexer lexer = new app.metatron.discovery.query.polaris.ExprLexer(
            new ANTLRInputStream(expression));
    CommonTokenStream tokens = new CommonTokenStream(lexer);
    app.metatron.discovery.query.polaris.ExprParser parser = new app.metatron.discovery.query.polaris.ExprParser(
            tokens);

    return parser.expr();
  }

  public static void searchInFieldName(ParseTree node, Map<String, String> mapHistoryField,
          Map<String, UserDefinedField> userDefinedFieldMap) {

    if ((node instanceof IdentifierExprContext)) {

      String identifierName = node.getText().replaceAll("^\"|\"$", "");

      String expression = generateAggregationExpression(identifierName, true, mapHistoryField, userDefinedFieldMap);

      // skip if identifierName is field name
      if (expression.equals(identifierName)) {
        return;
      }

      if (!userDefinedFieldMap.containsKey(identifierName)) {
        return;
      }

      // skip substitution in case of dimension type of user-defined column
      if (((ExpressionField) userDefinedFieldMap.get(identifierName)).getRole() == Field.FieldRole.MEASURE) {
        TerminalNode terminalNode = new TerminalNodeImpl(new CommonToken(IDENTIFIER, "(" + expression + ")"));
        ((IdentifierExprContext) node).removeLastChild();
        ((IdentifierExprContext) node).addChild(terminalNode);
      }

    } else {
      for (int i = 0; i < node.getChildCount(); i++) {
        searchInFieldName(node.getChild(i), mapHistoryField, userDefinedFieldMap);
      }
    }
  }

  public static String generateAggregationExpression(String fieldName, boolean isIdentifier,
          Map<String, String> mapHistoryField,
          Map<String, UserDefinedField> userDefinedFieldMap) {

    if (isIdentifier) {

      String cleanFieldName = fieldName.replaceAll("^\"|\"$", "");

      if (userDefinedFieldMap.containsKey(cleanFieldName)) {
        ExpressionField expressionField = (ExpressionField) userDefinedFieldMap.get(cleanFieldName);
        // convert expression if user-defined field is aggregated.
        if (expressionField.isAggregated()) {
          return expressionField.getExpr();
        } else {
          return cleanFieldName;
        }
      } else {
        return cleanFieldName;
      }

    } else {

      if (mapHistoryField.containsKey(fieldName)) {
        return mapHistoryField.get(fieldName);
      }

      ParseTree tree = getParseTree(fieldName);

      if (tree instanceof IdentifierExprContext) {
        searchInFieldName(tree, mapHistoryField, userDefinedFieldMap);
      } else {
        for (int i = 0; i < tree.getChildCount(); i++) {
          searchInFieldName(tree.getChild(i), mapHistoryField, userDefinedFieldMap);
        }
      }

      mapHistoryField.put(fieldName, tree.getText());

      return tree.getText();
    }
  }

  public static boolean makeAggregationFunctions(String fieldName, String computationalField,
          List<Aggregation> aggregations, List<PostAggregation> postAggregations, List<WindowingSpec> windowingSpecs,
          Map<String, Object> queryContext) {

    ParseTree tree = getParseTree(computationalField);

    List<FunctionExprContext> aggregationFunctions = Lists.newArrayList();
    getAggregations(tree, aggregationFunctions);

    int aggregationCount = aggregations.size();
    boolean finalize = false;

    for (int i = 0; i < aggregationFunctions.size(); i++) {

      FunctionExprContext context = aggregationFunctions.get(i);

      String paramName = "aggregationfunc" + String.format("_%03d", aggregationCount + i);
      String fieldExpression = context.fnArgs().getText();
      String dataType = "double";

      if ("sumof".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new GenericSumAggregation(paramName, null, fieldExpression, dataType));
      } else if ("minof".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new GenericMinAggregation(paramName, null, fieldExpression, dataType));
      } else if ("maxof".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new GenericMaxAggregation(paramName, null, fieldExpression, dataType));
      } else if ("varianceof".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new VarianceAggregation(paramName, null, fieldExpression));
      } else if ("stddevof".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new VarianceAggregation(paramName, null, fieldExpression));
        paramName = "sqrt(" + paramName + ")";
      } else if ("avgof".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new GenericSumAggregation("count", "count", null, dataType));
        aggregations.add(new GenericSumAggregation(paramName, null, fieldExpression, dataType));
        paramName = "(" + paramName + "/count)";
        //postAggregation = postAggregation.replace(aggregationFunction, "(" + paramName + "/count)");
      } else if ("countof".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new CountAggregation(paramName));
      } else if ("countd".equals(context.IDENTIFIER().getText().toLowerCase())) {
        // if you shouldFinalize to false, this route's return includes .estimation value. So you may need to modify UI code.
        aggregations
                .add(new DistinctSketchAggregation(paramName, fieldExpression.replaceAll("^\"|\"$", ""), 65536L, true));
        Map<String, Object> processingMap = Maps.newHashMap();
        processingMap.put("type", "sketch.estimate");
        queryContext.put("postProcessing", processingMap);
        finalize = true;
      } else if ("ifcountd".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new CardinalityAggregation(paramName,
                Collections.singletonList(context.fnArgs().getChild(2).getText().replaceAll("^\"|\"$", "")),
                context.fnArgs().getChild(0).getText(), true));
        paramName = "ROUND(" + paramName + ")";

        // set true case of only "ifcountd" function
        finalize = true;
      } else {
        continue;
      }

      while (context.getChildCount() > 0) {
        context.removeLastChild();
      }

      TerminalNode terminalNode = new TerminalNodeImpl(new CommonToken(IDENTIFIER, paramName));
      context.addChild(terminalNode);
    }

    List<FunctionExprContext> windowFunctions = Lists.newArrayList();
    getWindowFunctions(tree, windowFunctions);

    if (CollectionUtils.isEmpty(windowFunctions)) {

      String postAggregationExpression = tree.getText();

      if (StringUtils.isNotEmpty(postAggregationExpression) && !"null".equals(postAggregationExpression)) {
        MathPostAggregator mathPostAggregator = new MathPostAggregator(fieldName, postAggregationExpression, finalize);
        postAggregations.add(mathPostAggregator);
      }

    } else {

      // 1. generate postaggregation
      for (FunctionExprContext node : windowFunctions) {

        if (node.fnArgs() == null) {
          continue;
        }

        if (node.fnArgs().getChildCount() == 0) {
          continue;
        }

        ParseTree postnode = node.fnArgs().getChild(0);
        if (postnode instanceof IdentifierExprContext && postnode.getChildCount() == 1) {
          continue;
        }

        String paramName = "postaggregationfunc" + String.format("_%03d", postAggregations.size());
        String postAggregationExpression = postnode.getText();
        MathPostAggregator mathPostAggregator = new MathPostAggregator(paramName, postAggregationExpression, false);
        postAggregations.add(mathPostAggregator);

        while (postnode.getChildCount() > 0) {
          ((ParserRuleContext) postnode).removeLastChild();
        }

        TerminalNode terminalNode = new TerminalNodeImpl(new CommonToken(IDENTIFIER, paramName));
        ((ParserRuleContext) postnode).addChild(terminalNode);

      }

      // 2. get partition columns
      List<String> partitionColumns = Lists.newArrayList();
      boolean isSetPartitionColumns = false;
      if (windowFunctions.size() > 0) {
        ParseTree windowNode = windowFunctions.get(0).fnArgs();

        if (windowNode.getChildCount() > 0) {
          getAllFieldNames(windowNode.getChild(windowNode.getChildCount() - 1), partitionColumns);
          isSetPartitionColumns = true;
        }
      }

      // 3. remove partition column info
      for (FunctionExprContext node : windowFunctions) {
        ParserRuleContext windowNode = node.fnArgs();

        windowNode.removeLastChild();
        if (windowNode.getChildCount() > 0) {
          windowNode.removeLastChild();
        }
      }

      // 4. make windowing spec
      if (!isSetPartitionColumns) {
        return true;
      }
      String windowFunctionExpression = tree.getText();
      windowFunctionExpression = "\"" + fieldName + "\"" + " = " + windowFunctionExpression;
      WindowingSpec windowingSpec = new WindowingSpec(partitionColumns, null,
              Collections.singletonList(windowFunctionExpression));
      windowingSpecs.add(windowingSpec);
    }

    return true;
  }

  public static boolean makeAggregationFunctionsIn(MeasureField field, String expr, List<Aggregation> aggregations,
          List<PostAggregation> postAggregations, List<WindowingSpec> windowingSpecs,
          Map<String, UserDefinedField> userDefinedFieldMap, Map<String, Object> context) {

    Map<String, String> mapHistoryField = Maps.newHashMap();

    String newComputationalField = generateAggregationExpression(expr, false, mapHistoryField, userDefinedFieldMap);

    return makeAggregationFunctions(field.getAlias(), newComputationalField, aggregations, postAggregations,
            windowingSpecs,
            context);

  }

  public static List<String> makeDependencyTree(String fieldName, Map<String, String> mapField) {

    List<String> resultFieldNames = new ArrayList<>();
    List<String> targetFieldNames = new ArrayList<>();
    List<String> newFieldNames = new ArrayList<>();
    targetFieldNames.add(fieldName);

    while (true) {

      for (String curFieldName : targetFieldNames) {

        if (!mapField.containsKey(curFieldName)) {
          continue;
        }

        resultFieldNames.add(curFieldName);

        String curComputationalField = mapField.get(curFieldName);

        app.metatron.discovery.query.polaris.ExprLexer lexer = new app.metatron.discovery.query.polaris.ExprLexer(
                new ANTLRInputStream(curComputationalField));
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        app.metatron.discovery.query.polaris.ExprParser parser = new app.metatron.discovery.query.polaris.ExprParser(
                tokens);
        ParseTree tree = parser.expr();

        getAllFieldNames(tree, newFieldNames);

      }

      if (newFieldNames.size() == 0) {
        break;
      } else {
        targetFieldNames.clear();
        targetFieldNames.addAll(newFieldNames);
        newFieldNames.clear();
      }
    }

    return resultFieldNames;
  }


  private static int getAllFieldNames(ParseTree node, List<String> newFieldNames) {

    if (node instanceof app.metatron.discovery.query.polaris.ExprParser.IdfieldContext) {

      //      TerminalNode terminalNode = new TerminalNodeImpl( new CommonToken( IDENTIFIER, "test"));
      //      ((IdentifierExprContext) node).removeLastChild();
      //      ((IdentifierExprContext) node).addChild(terminalNode);
      String newFieldName = node.getText().replaceAll("^\"|\"$", "");
      newFieldNames.add(newFieldName);
    } else {
      for (int i = 0; i < node.getChildCount(); i++) {
        getAllFieldNames(node.getChild(i), newFieldNames);
      }
    }

    return newFieldNames.size();
  }

  private static String generatePrestoQueryNode(ParseTree node) {

    StringBuilder nodeText = new StringBuilder();

    if (node.getChildCount() == 0) {
      nodeText = Optional.ofNullable(node.getText()).map(StringBuilder::new).orElse(null);

      switch (nodeText == null ? "null" : nodeText.toString()) {
        case "&&":
          nodeText = new StringBuilder(" AND ");
          break;
        case "||":
          nodeText = new StringBuilder(" OR ");
          break;
        case "==":
          nodeText = new StringBuilder(" = ");
          break;
      }
    } else {

      if (node instanceof FunctionExprContext) {

        String fnName = node.getChild(0).getText().toLowerCase();
        FunctionInfo functionInfo = functionInfos.get(fnName);

        if (fnName.equals("like")) {
          nodeText = new StringBuilder("\"" + node.getChild(2).getChild(0).getText() + "\" LIKE " + node.getChild(2).getChild(2).getText());
        } else if (functionInfo.type == FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR) {

        } else {
          nodeText = Optional.ofNullable(functionInfo.cmdPresto).map(StringBuilder::new).orElse(null);
          for (int i = 1; i < node.getChildCount(); i++) {
            nodeText = (nodeText == null ? new StringBuilder("null") : nodeText).append(generatePrestoQueryNode(node.getChild(i)));
          }
        }
      } else if ((node instanceof IdentifierExprContext)) {
        nodeText = new StringBuilder("\"" + node.getText() + "\"");
      } else {
        for (int i = 0; i < node.getChildCount(); i++) {
          nodeText.append(generatePrestoQueryNode(node.getChild(i)));
        }
      }
    }

    return nodeText != null ? nodeText.toString() : "null";

  }

  public static String generatePrestoQuery(String computationalField) {

    ParseTree tree = getParseTree(computationalField);

    return generatePrestoQueryNode(tree);
  }

  private static String generatePhoenixQueryNode(ParseTree node) {

    StringBuilder nodeText = new StringBuilder();

    if (node.getChildCount() == 0) {
      nodeText = Optional.ofNullable(node.getText()).map(StringBuilder::new).orElse(null);

      switch (nodeText == null ? "null" : nodeText.toString()) {
        case "&&":
          nodeText = new StringBuilder(" AND ");
          break;
        case "||":
          nodeText = new StringBuilder(" OR ");
          break;
        case "==":
          nodeText = new StringBuilder(" = ");
          break;
      }
    } else {

      if (node instanceof FunctionExprContext) {

        String fnName = node.getChild(0).getText().toLowerCase();
        FunctionInfo functionInfo = functionInfos.get(fnName);

        if (fnName.equals("like")) {
          nodeText = new StringBuilder("\"" + node.getChild(2).getChild(0).getText() + "\" LIKE " + node.getChild(2).getChild(2).getText());
        } else if (fnName.equals("isnumber")) {
          nodeText = new StringBuilder("REGEXP_SUBSTR( \"" + node.getChild(2).getChild(0).getText()
                  + "\", '^(\\+|\\-)?[0-9]+(\\.)?[0-9]*$') is not null");
        } else if (functionInfo.type == FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR) {

        } else {
          nodeText = Optional.ofNullable(functionInfo.cmdPresto).map(StringBuilder::new).orElse(null);
          for (int i = 1; i < node.getChildCount(); i++) {
            nodeText = (nodeText == null ? new StringBuilder("null") : nodeText).append(generatePhoenixQueryNode(node.getChild(i)));
          }
        }
      } else if ((node instanceof IdentifierExprContext)) {
        nodeText = new StringBuilder("\"" + node.getText() + "\"");
      } else {
        for (int i = 0; i < node.getChildCount(); i++) {
          nodeText.append(generatePhoenixQueryNode(node.getChild(i)));
        }
      }
    }

    return nodeText == null ? null : nodeText.toString();

  }

  public static String generatePhoenixQuery(String computationalField) {

    ParseTree tree = getParseTree(computationalField);

    return generatePhoenixQueryNode(tree);
  }

  public static String generateHiveQuery(String computationalField) {

    ParseTree tree = getParseTree(computationalField);

    return generatePrestoQueryNode(tree);
  }

  public static String generateOracleQuery(String computationalField) {

    ParseTree tree = getParseTree(computationalField);

    return generatePrestoQueryNode(tree);
  }

}
