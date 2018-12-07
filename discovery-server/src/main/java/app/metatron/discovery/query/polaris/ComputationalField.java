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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.datasource.data.InvalidExpressionException;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.aggregations.CardinalityAggregation;
import app.metatron.discovery.query.druid.aggregations.CountAggregation;
import app.metatron.discovery.query.druid.aggregations.DistinctSketchAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericMaxAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericMinAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericSumAggregation;
import app.metatron.discovery.query.druid.aggregations.VarianceAggregation;
import app.metatron.discovery.query.druid.limits.WindowingSpec;
import app.metatron.discovery.query.druid.postaggregations.MathPostAggregator;
import app.metatron.discovery.query.polaris.ExprParser.FunctionExprContext;

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

    public FunctionInfo(String compareType, int numberOfParam, FunctionInfoType type, String cmdPresto, String cmdPhoenix) {
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

  static class WrapInt{
    int value;
    public WrapInt(){
      value =0;
    }
  }

  static final Map<String, FunctionInfo> functionInfos;

  static {
    // ImmutableMap을 써볼까?
    functionInfos = new HashMap<String, FunctionInfo>();

    functionInfos.put("size".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("array".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("like".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("regex".toLowerCase(), new FunctionInfo("ge", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("abs".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("acos".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("asin".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("atan".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("cbrt".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("ceil".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("cos".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("cosh".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("exp".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("expm1".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("floor".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("getexponent".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("log".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("log10".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("log1p".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("nextup".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("rint".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("round".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("signum".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("sin".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("sinh".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("sqrt".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("tan".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("tanh".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("todegrees".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("toradians".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("ulp".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("atan2".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("copysign".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("hypot".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("remainder".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("max".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("min".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("nextafter".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("pow".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("scalb".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("if".toLowerCase(), new FunctionInfo("ge", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("cast".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("timestamp".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("unix_timestamp".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("time_format".toLowerCase(), new FunctionInfo("ge", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("isnull".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("nvl".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("datediff".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("switch".toLowerCase(), new FunctionInfo("ge", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("case".toLowerCase(), new FunctionInfo("ge", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("concat".toLowerCase(), new FunctionInfo("ge", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("format".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("lpad".toLowerCase(), new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("rpad".toLowerCase(), new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("upper".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("lower".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("split".toLowerCase(), new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("splitregex".toLowerCase(), new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("proper".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("length".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("strlen".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("left".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("right".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("mid".toLowerCase(), new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("substring".toLowerCase(), new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("indexof".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("replace".toLowerCase(), new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("trim".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("btrim".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("ltrim".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("rtrim".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("in".toLowerCase(), new FunctionInfo("ge", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("between".toLowerCase(), new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("startswith".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("endswith".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("startswithignorecase".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("endswithignorecase".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("contains".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("match".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("now".toLowerCase(), new FunctionInfo("eq", 0, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("current_time".toLowerCase(), new FunctionInfo("eq", 0, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("recent".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("bucketstart".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("bucketend".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("bucketstartdatetime".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("bucketenddatetime".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("add_time".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("sub_time".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("difftime".toLowerCase(), new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("dayname".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("dayofmonth".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("lastdayofmonth".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("dayofweek".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("dayofyear".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("weekofweekyear".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("weekyear".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("hour".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("month".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("monthname".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("year".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("first_day".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("last_day".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("datetime".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("datetime_millis".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("timestamp_validate".toLowerCase(), new FunctionInfo("ge", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("datetime_extract".toLowerCase(), new FunctionInfo("ge", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("$prev".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$next".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$last".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$first".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$nth".toLowerCase(), new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$lag".toLowerCase(), new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$lead".toLowerCase(), new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$delta".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$sum".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$min".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$max".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$row_num".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$rank".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$dense_rank".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$mean".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$variance".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$stddev".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$variancepop".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$stddevpop".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$percentile".toLowerCase(), new FunctionInfo("eq", 3, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("$size".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ));
    functionInfos.put("minof".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR ));
    functionInfos.put("maxof".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR ));
    functionInfos.put("avgof".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR ));
    functionInfos.put("sumof".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR ));
    functionInfos.put("varianceof".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR ));
    functionInfos.put("stddevof".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR ));
    functionInfos.put("countof".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR ));
    functionInfos.put("countd".toLowerCase(), new FunctionInfo("eq", 1, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR ));
    functionInfos.put("ifcountd".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR ));
//    functionInfos.put("+".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
//    functionInfos.put("-".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
//    functionInfos.put("*".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
//    functionInfos.put("/".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
//    functionInfos.put("%".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
//    functionInfos.put("^".toLowerCase(), new FunctionInfo("eq", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));
    functionInfos.put("ipv4_in".toLowerCase(), new FunctionInfo("ge", 2, FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR ));


  }

  public static int getWindowFunctions(ParseTree node, List<FunctionExprContext> windowFunctions) {

    if(node == null || node.getChild(0) == null) {
      return windowFunctions == null ? 0 : windowFunctions.size();
    }

    if (node instanceof FunctionExprContext) {

      if(node.getChild(0).getText() == null) {
        return windowFunctions == null ? 0 : windowFunctions.size();
      }

      String fnName = node.getChild(0).getText().toLowerCase();

      FunctionInfo functionInfo = functionInfos.get(fnName);

      if( functionInfo == null )
        return windowFunctions.size();

      if (functionInfo.type == FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR) {
        windowFunctions.add((FunctionExprContext) node);
      }
      else{
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
      }
      else{
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

  public static boolean checkParserTree(ParseTree node, boolean inAggregationFunc, WrapInt AggregationFuncCount, StringBuilder errorInfo) {

    if (node instanceof ErrorNode) {
      errorInfo.append( node.getText() );
      return false;
    }

    if (node instanceof FunctionExprContext) {

      String fnName = ((FunctionExprContext) node).IDENTIFIER().getText().toLowerCase();

      FunctionInfo functionInfo = functionInfos.get(fnName);

      if (functionInfo == null) {
        errorInfo.append( "unknown function name , " + node.getText() );
        return false;
      }

      if (functionInfo.numberOfParam != 0 && node.getChildCount() != 4) {
        errorInfo.append( "param count miss match , " + node.getText() );
        return false;
      }

      if( ((FunctionExprContext) node).fnArgs() == null ){
        if( !(functionInfo.compareType.equals( "eq" ) && functionInfo.numberOfParam == 0 )) {
          errorInfo.append("param count miss match , " + node.getText());
          return false;
        }
      }
      else if ( functionInfo.compareType.equals( "eq" ) ){
        if( !(((FunctionExprContext) node).fnArgs().getChildCount() == (functionInfo.numberOfParam * 2 - 1)) ){
          errorInfo.append( "param count miss match , " + node.getText() );
          return false;
        }
      }
      else if( functionInfo.compareType.equals( "ge" ) ){
        if( !(((FunctionExprContext) node).fnArgs().getChildCount() >= (functionInfo.numberOfParam * 2 - 1)) ){
          errorInfo.append( "param count miss match , " + node.getText() );
          return false;
        }
      }

      if (functionInfo.type == FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_AGGREGATOR) {
        if (inAggregationFunc == true) {
          errorInfo.append( "aggregation in aggregation, " + node.getText() );
          return false;
        }
        inAggregationFunc = true;
        AggregationFuncCount.value += 1;
      }
      else if (functionInfo.type == FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR) {
        if (inAggregationFunc == true) {
          errorInfo.append( "windowfunction in aggregation, " + node.getText() );
          return false;
        }
        // TODO : need to check window function in window function ??
        // TODO : need to check aggregation in window function !!

      } else { // FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_OPERATOR

      }
    }

    if (!(node instanceof TerminalNode) && (node.getChildCount() == 0)) {
      errorInfo.append( "no viable alternative at input" );
      return false;
    }

    for (int i = 0; i < node.getChildCount(); i++) {
      if (checkParserTree(node.getChild(i), inAggregationFunc, AggregationFuncCount, errorInfo) == false)
        return false;
    }


    return true;
  }


  // 1. error node 가 발견된 경우
  // 2. agg 안에서 agg가 발생한 경우
  // 3. param count check
  public static CheckType checkComputationalField(String computationalField) {

    List<String> aggregationFunctions = new ArrayList<String>();
    app.metatron.discovery.query.polaris.ExprLexer lexer = new app.metatron.discovery.query.polaris.ExprLexer(new ANTLRInputStream(computationalField));
    CommonTokenStream tokens = new CommonTokenStream(lexer);
    app.metatron.discovery.query.polaris.ExprParser parser = new app.metatron.discovery.query.polaris.ExprParser(tokens);
    ParseTree tree = parser.expr();

    StringBuilder errorInfo = new StringBuilder();
    WrapInt AggregationFuncCount = new WrapInt();

    boolean result = checkParserTree(tree, false, AggregationFuncCount, errorInfo);
    if (!result) {
      throw new InvalidExpressionException(errorInfo.toString());
    }

    if ( result == true ){
      if ( AggregationFuncCount.value > 0 ){
        return CheckType.CHECK_TYPE_VALID_AGGREGATOR;
      }
      else{
        return CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR;
      }
    }

    return CheckType.CHECK_TYPE_INVALID;
  }

  public static CheckType checkComputationalFieldIn(String computationalField, Map<String, String> mapField ) {

    String fieldName = "check_computational_field";
    if( mapField == null ) {
      mapField = Maps.newHashMap();
    }
    mapField.put(fieldName, computationalField);
    Map<String, String> mapHistoryField = Maps.newHashMap();

    String newComputationalField = generateAggregationExpression( fieldName, mapField, mapHistoryField );


    return checkComputationalField( newComputationalField );
  }



  public static ParseTree getParseTree( String expression ){

    app.metatron.discovery.query.polaris.ExprLexer lexer = new app.metatron.discovery.query.polaris.ExprLexer(new ANTLRInputStream(expression));
    CommonTokenStream tokens = new CommonTokenStream(lexer);
    app.metatron.discovery.query.polaris.ExprParser parser = new app.metatron.discovery.query.polaris.ExprParser(tokens);
    ParseTree tree = parser.expr();

    return tree;
  }

  public static void searchInFieldName( ParseTree node, Map<String, String> mapField, Map<String, String> mapHistoryField ){

    if ((node instanceof IdentifierExprContext)) {

      String expression = generateAggregationExpression( node.getText(), mapField, mapHistoryField );

      if( !expression.equals( node.getText() )) {
        TerminalNode terminalNode = new TerminalNodeImpl(new CommonToken(IDENTIFIER, "(" + expression + ")"));
        ((IdentifierExprContext) node).removeLastChild();
        ((IdentifierExprContext) node).addChild(terminalNode);
      }
    } else {
      for (int i = 0; i < node.getChildCount(); i++) {
        searchInFieldName(node.getChild(i), mapField, mapHistoryField);
      }
    }
  }

  public static String generateAggregationExpression( String fieldName, Map<String, String> mapField, Map<String, String> mapHistoryField){

    String cleanFieldName = fieldName.replaceAll("^\"|\"$", "");

    if (!mapField.containsKey(cleanFieldName))
      return fieldName;

    if (mapHistoryField.containsKey(cleanFieldName))
      return fieldName;

    String expression = mapField.get(cleanFieldName);

    ParseTree tree = getParseTree( expression );

    mapHistoryField.put( cleanFieldName, expression );

    if( tree instanceof IdentifierExprContext ){
      searchInFieldName(tree, mapField, mapHistoryField );
    }
    else {
      for (int i = 0; i < tree.getChildCount(); i++) {
        searchInFieldName(tree.getChild(i), mapField, mapHistoryField );
      }
    }

    mapHistoryField.remove( cleanFieldName );

    return tree.getText();
  }

//  public static boolean makeAggregationFunctions(String fieldName, String computationalField, List<Aggregation> aggregations, List<PostAggregation> postAggregations) {
//
//    List<FunctionExprContext> aggregationFunctions = new ArrayList<FunctionExprContext>();
//    app.metatron.discovery.query.polaris.ExprLexer lexer = new app.metatron.discovery.query.polaris.ExprLexer(new ANTLRInputStream(computationalField));
//    CommonTokenStream tokens = new CommonTokenStream(lexer);
//    app.metatron.discovery.query.polaris.ExprParser parser = new app.metatron.discovery.query.polaris.ExprParser(tokens);
//    ParseTree tree = parser.expr();
//
//    getAggregations(tree, aggregationFunctions);
//
//    int aggregationCount = aggregations.size();
//    String postAggregation = tree.getText();
//    for (int i = 0; i < aggregationFunctions.size(); i++) {
//
//      FunctionExprContext context = aggregationFunctions.get(i);
//
//      String paramName = "aggregationfunc" + String.format("_%03d", aggregationCount+i);
//      String aggregationFunction = context.getText();
//      String fieldExpression = context.fnArgs().getText();
//      String dataType = "double";
//      //String fieldExpression = generateAggregationExpression( context.fnArgs().getText() );
//
//      if ("sumof".equals(context.IDENTIFIER().getText().toLowerCase())) {
//        aggregations.add(new GenericSumAggregation(paramName, null, fieldExpression, dataType));
//        postAggregation = postAggregation.replace(aggregationFunction, paramName);
//      } else if ("minof".equals(context.IDENTIFIER().getText().toLowerCase())) {
//        aggregations.add(new GenericMinAggregation(paramName, null, fieldExpression, dataType));
//        postAggregation = postAggregation.replace(aggregationFunction, paramName);
//      } else if ("maxof".equals(context.IDENTIFIER().getText().toLowerCase())) {
//        aggregations.add(new GenericMaxAggregation(paramName, null, fieldExpression, dataType));
//        postAggregation = postAggregation.replace(aggregationFunction, paramName);
//      } else if ("avgof".equals(context.IDENTIFIER().getText().toLowerCase())) {
//        aggregations.add(new GenericSumAggregation("count", "count", null, dataType));
//        aggregations.add(new GenericSumAggregation(paramName, null, fieldExpression, dataType));
//        postAggregation = postAggregation.replace(aggregationFunction, "(" + paramName + "/count)");
//      } else if ("countof".equals(context.IDENTIFIER().getText().toLowerCase())) {
//        aggregations.add(new CountAggregation(paramName));
//        postAggregation = postAggregation.replace(aggregationFunction, paramName);
//      } else if ("countd".equals(context.IDENTIFIER().getText().toLowerCase())) {
//        aggregations.add(new CardinalityAggregation(paramName, Arrays.asList( fieldExpression ), true));
//        postAggregation = postAggregation.replace(aggregationFunction, paramName);
//      } else if ("ifcountd".equals(context.IDENTIFIER().getText().toLowerCase())) {
//        aggregations.add(new CardinalityAggregation(paramName, Arrays.asList( context.fnArgs().getChild(2).getText() ),  context.fnArgs().getChild(0).getText(), true));
//        postAggregation = postAggregation.replace(aggregationFunction, paramName);
//      }
//
//    }
//
//    MathPostAggregator mathPostAggregator = new MathPostAggregator(fieldName, postAggregation, null);
//    postAggregations.add(mathPostAggregator);
//
//    return true;
//  }

  public static boolean makePostAggregationFunctionParseTree( String fieldName, ParseTree tree, List<Aggregation> aggregations, List<PostAggregation> postAggregations ){

    List<FunctionExprContext> aggregationFunctions = new ArrayList<FunctionExprContext>();

    if ( tree instanceof IdentifierExprContext && tree.getChildCount() == 1 ){
      return false;
    }

    getAggregations(tree, aggregationFunctions);

    int aggregationCount = aggregations.size();
    String postAggregation = tree.getText();
    for (int i = 0; i < aggregationFunctions.size(); i++) {

      FunctionExprContext context = aggregationFunctions.get(i);

      String paramName = "aggregationfunc" + String.format("_%03d", aggregationCount + i);
      String aggregationFunction = context.getText();
      String fieldExpression = context.fnArgs().getText();
      String dataType = "double";

      //String fieldExpression = generateAggregationExpression( context.fnArgs().getText() );

      if ("sumof".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new GenericSumAggregation(paramName, null, fieldExpression, dataType));
        postAggregation = postAggregation.replace(aggregationFunction, paramName);
      } else if ("minof".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new GenericMinAggregation(paramName, null, fieldExpression, dataType));
        postAggregation = postAggregation.replace(aggregationFunction, paramName);
      } else if ("maxof".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new GenericMaxAggregation(paramName, null, fieldExpression, dataType));
        postAggregation = postAggregation.replace(aggregationFunction, paramName);
      } else if ("avgof".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new GenericSumAggregation("count", "count", null, dataType));
        aggregations.add(new GenericSumAggregation(paramName, null, fieldExpression, dataType));
        postAggregation = postAggregation.replace(aggregationFunction, "(" + paramName + "/count)");
      } else if ("varianceof".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new VarianceAggregation(paramName, null, fieldExpression));
        postAggregation = postAggregation.replace(aggregationFunction, paramName);
      } else if ("stddevof".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new VarianceAggregation(paramName, null, fieldExpression));
        postAggregation = postAggregation.replace(aggregationFunction, "sqrt(" + paramName + ")");
      } else if ("countof".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new CountAggregation(paramName));
        postAggregation = postAggregation.replace(aggregationFunction, paramName);
      } else if ("countd".equals(context.IDENTIFIER().getText().toLowerCase())) {
        List<String> dimensions = new ArrayList<String>();
        dimensions.add(fieldExpression);
        aggregations.add(new CardinalityAggregation(paramName, dimensions, true));
        postAggregation = postAggregation.replace(aggregationFunction, paramName);
      } else if ("ifcountd".equals(context.IDENTIFIER().getText().toLowerCase())) {
        List<String> dimensions = new ArrayList<String>();
        dimensions.add(context.fnArgs().getChild(2).getText());
        aggregations.add(new CardinalityAggregation(paramName, dimensions, context.fnArgs().getChild(0).getText(), true));
        postAggregation = postAggregation.replace(aggregationFunction, paramName);
      }
    }

    MathPostAggregator mathPostAggregator = new MathPostAggregator(fieldName, postAggregation, null);
    postAggregations.add(mathPostAggregator);

    return true;
  }

  public static boolean makeAggregationFunctions3(String fieldName, String computationalField, List<Aggregation> aggregations, List<PostAggregation> postAggregations, List<WindowingSpec> windowingSpecs, Map<String, Object> queryContext) {

    ParseTree tree = getParseTree( computationalField );

    List<FunctionExprContext> aggregationFunctions = Lists.newArrayList();
    getAggregations(tree, aggregationFunctions);

    int aggregationCount = aggregations.size();

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
        aggregations.add(new DistinctSketchAggregation(fieldName, fieldExpression.replaceAll("^\"|\"$", ""), 65536L, true));
        paramName = null;
        Map<String, Object> processingMap = Maps.newHashMap();
        processingMap.put("type", "sketch.estimate");
        queryContext.put("postProcessing", processingMap);
      } else if ("ifcountd".equals(context.IDENTIFIER().getText().toLowerCase())) {
        aggregations.add(new CardinalityAggregation(paramName, Arrays.asList( context.fnArgs().getChild(2).getText().replaceAll("^\"|\"$", "") ), context.fnArgs().getChild(0).getText(), true));
        paramName = "ROUND(" + paramName + ")";
      }
      else {
        continue;
      }

      while (context.getChildCount() > 0) {
        context.removeLastChild();
      }
      if(paramName != null){
        TerminalNode terminalNode = new TerminalNodeImpl(new CommonToken(IDENTIFIER, paramName));
        context.addChild(terminalNode);
      }
    }


    List<FunctionExprContext> windowFunctions = Lists.newArrayList();
    getWindowFunctions(tree, windowFunctions);

    if ( CollectionUtils.isEmpty(windowFunctions) ){

      String postAggregationExpression = tree.getText();

      if(StringUtils.isNotEmpty(postAggregationExpression) && !"null".equals(postAggregationExpression)) {
        MathPostAggregator mathPostAggregator = new MathPostAggregator(fieldName, postAggregationExpression, null);
        postAggregations.add(mathPostAggregator);
      }

    } else {

      // 1. generate postaggregation
      for ( FunctionExprContext node : windowFunctions) {

        if ( node.fnArgs() == null )
          continue;

        if ( node.fnArgs().getChildCount() == 0 )
          continue;

        ParseTree postnode = node.fnArgs().getChild(0);
        if ( postnode instanceof IdentifierExprContext && postnode.getChildCount() == 1 ){
          continue;
        }

        String paramName = "postaggregationfunc" + String.format("_%03d", postAggregations.size());
        String postAggregationExpression = postnode.getText();
        MathPostAggregator mathPostAggregator = new MathPostAggregator(paramName, postAggregationExpression, null);
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
      if( windowFunctions.size() > 0 ) {
        ParseTree windowNode = windowFunctions.get(0).fnArgs();

        if (windowNode.getChildCount() > 0) {
          getAllFieldNames(windowNode.getChild(windowNode.getChildCount() - 1), partitionColumns);
          isSetPartitionColumns = true;
        }
      }

      // 3. remove partition column info
      for ( FunctionExprContext node : windowFunctions) {
        ParseTree windowNode = node.fnArgs();

        ((ParserRuleContext) windowNode).removeLastChild();
        if (windowNode.getChildCount() > 0)
          ((ParserRuleContext) windowNode).removeLastChild();
      }

      // 4. make windowing spec
      if( isSetPartitionColumns ) {
        String windowFunctionExpression = tree.getText();
        windowFunctionExpression = "\"" + fieldName + "\"" + " = " + windowFunctionExpression;
        WindowingSpec windowingSpec = new WindowingSpec(partitionColumns, null, Arrays.asList(windowFunctionExpression));
        windowingSpecs.add(windowingSpec);
      }
    }

    return true;
  }

  public static boolean makeAggregationFunctionsIn(String fieldName, String computationalField, List<Aggregation> aggregations, List<PostAggregation> postAggregations, List<WindowingSpec> windowingSpecs, Map<String, Object> context, Map<String, String> mapField ) {

    mapField.put(fieldName, computationalField );
    Map<String, String> mapHistoryField = Maps.newHashMap();

    String newComputationalField = generateAggregationExpression( fieldName, mapField, mapHistoryField );

    return makeAggregationFunctions3( fieldName, newComputationalField, aggregations, postAggregations, windowingSpecs, context );

  }

  public static List<String> makeDependencyTree( String fieldName,  Map<String, String> mapField ){


    List<String> resultFieldNames = new ArrayList<>();
    List<String> targetFieldNames = new ArrayList<>();
    List<String> newFieldNames = new ArrayList<>();
    targetFieldNames.add(fieldName);

    while( true ) {

      for (String curFieldName : targetFieldNames) {

        if (!mapField.containsKey(curFieldName))
          continue;

        resultFieldNames.add(curFieldName);

        String curComputationalField = mapField.get(curFieldName);

        app.metatron.discovery.query.polaris.ExprLexer lexer = new app.metatron.discovery.query.polaris.ExprLexer(new ANTLRInputStream(curComputationalField));
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        app.metatron.discovery.query.polaris.ExprParser parser = new app.metatron.discovery.query.polaris.ExprParser(tokens);
        ParseTree tree = parser.expr();

        getAllFieldNames(tree, newFieldNames);

      }

      if ( newFieldNames.size() == 0 )
        break;
      else{
        targetFieldNames.clear();
        targetFieldNames.addAll( newFieldNames );
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
      newFieldNames.add( newFieldName );
    } else {
      for (int i = 0; i < node.getChildCount(); i++) {
        getAllFieldNames(node.getChild(i), newFieldNames);
      }
    }

    return newFieldNames.size();
  }

  private static String generatePrestoQueryNode( ParseTree node ){

    String nodeText = "";

    if( node.getChildCount() == 0 ){
      nodeText = node.getText();

      if( nodeText.equals("&&")){
        nodeText = " AND ";
      }
      else if( nodeText.equals("||")){
        nodeText = " OR ";
      }
      else if( nodeText.equals("==")){
        nodeText = " = ";
      }
    }
    else {

      if (node instanceof FunctionExprContext) {

        String fnName = node.getChild(0).getText().toLowerCase();
        FunctionInfo functionInfo = functionInfos.get(fnName);

        if( fnName.equals( "like") ){
          nodeText = "\"" + node.getChild(2).getChild(0).getText() + "\" LIKE " + node.getChild(2).getChild(2).getText();
        }
        else if( functionInfo.type == FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ){

        }
        else {
          nodeText = functionInfo.cmdPresto;
          for (int i = 1; i < node.getChildCount(); i++) {
            nodeText = nodeText + generatePrestoQueryNode(node.getChild(i));
          }
        }
      }
      else if ((node instanceof IdentifierExprContext)) {
        nodeText = "\"" + node.getText() + "\"";
      }
      else{
        for (int i = 0; i < node.getChildCount(); i++) {
          nodeText = nodeText + generatePrestoQueryNode(node.getChild(i));
        }
      }
    }

    return nodeText;

  }

  public static String generatePrestoQuery( String computationalField ) {

    ParseTree tree = getParseTree( computationalField );

    String nodeText = generatePrestoQueryNode( tree );

    return nodeText;
  }

  private static String generatePhoenixQueryNode( ParseTree node ){

    String nodeText = "";

    if( node.getChildCount() == 0 ){
      nodeText = node.getText();

      if( nodeText.equals("&&")){
        nodeText = " AND ";
      }
      else if( nodeText.equals("||")){
        nodeText = " OR ";
      }
      else if( nodeText.equals("==")){
        nodeText = " = ";
      }
    }
    else {

      if (node instanceof FunctionExprContext) {

        String fnName = node.getChild(0).getText().toLowerCase();
        FunctionInfo functionInfo = functionInfos.get(fnName);

        if( fnName.equals( "like") ){
          nodeText = "\"" + node.getChild(2).getChild(0).getText() + "\" LIKE " + node.getChild(2).getChild(2).getText();
        }
        else if( fnName.equals( "isnumber") ){
          nodeText = "REGEXP_SUBSTR( \"" +  node.getChild(2).getChild(0).getText() + "\", '^(\\+|\\-)?[0-9]+(\\.)?[0-9]*$') is not null";
        }
        else if( functionInfo.type == FunctionInfo.FunctionInfoType.FUNCTION_INFO_TYPE_WINDOW_OPERATOR ){

        }
        else {
          nodeText = functionInfo.cmdPresto;
          for (int i = 1; i < node.getChildCount(); i++) {
            nodeText = nodeText + generatePhoenixQueryNode(node.getChild(i));
          }
        }
      }
      else if ((node instanceof IdentifierExprContext)) {
        nodeText = "\"" + node.getText() + "\"";
      }
      else{
        for (int i = 0; i < node.getChildCount(); i++) {
          nodeText = nodeText + generatePhoenixQueryNode(node.getChild(i));
        }
      }
    }

    return nodeText;

  }

  public static String generatePhoenixQuery( String computationalField ) {

    ParseTree tree = getParseTree( computationalField );

    String nodeText = generatePhoenixQueryNode( tree );

    return nodeText;
  }

  public static String generateHiveQuery( String computationalField ) {

    ParseTree tree = getParseTree( computationalField );

    String nodeText = generatePrestoQueryNode( tree );

    return nodeText;
  }

  public static String generateOracleQuery( String computationalField ) {

    ParseTree tree = getParseTree( computationalField );

    String nodeText = generatePrestoQueryNode( tree );

    return nodeText;
  }

}
