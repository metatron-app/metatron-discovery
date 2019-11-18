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

package app.metatron.discovery.domain.dataprep.transform;

import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_UNNEST_COL;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.transformError;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.rule.ExprFunction;
import app.metatron.discovery.domain.dataprep.rule.ExprFunctionCategory;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.prep.parser.exceptions.RuleException;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.Aggregate;
import app.metatron.discovery.prep.parser.preparation.rule.CountPattern;
import app.metatron.discovery.prep.parser.preparation.rule.Delete;
import app.metatron.discovery.prep.parser.preparation.rule.Derive;
import app.metatron.discovery.prep.parser.preparation.rule.Drop;
import app.metatron.discovery.prep.parser.preparation.rule.Extract;
import app.metatron.discovery.prep.parser.preparation.rule.Flatten;
import app.metatron.discovery.prep.parser.preparation.rule.Header;
import app.metatron.discovery.prep.parser.preparation.rule.Join;
import app.metatron.discovery.prep.parser.preparation.rule.Keep;
import app.metatron.discovery.prep.parser.preparation.rule.Merge;
import app.metatron.discovery.prep.parser.preparation.rule.Move;
import app.metatron.discovery.prep.parser.preparation.rule.Nest;
import app.metatron.discovery.prep.parser.preparation.rule.Pivot;
import app.metatron.discovery.prep.parser.preparation.rule.Rename;
import app.metatron.discovery.prep.parser.preparation.rule.Replace;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.Set;
import app.metatron.discovery.prep.parser.preparation.rule.SetFormat;
import app.metatron.discovery.prep.parser.preparation.rule.SetType;
import app.metatron.discovery.prep.parser.preparation.rule.Sort;
import app.metatron.discovery.prep.parser.preparation.rule.Split;
import app.metatron.discovery.prep.parser.preparation.rule.Union;
import app.metatron.discovery.prep.parser.preparation.rule.Unnest;
import app.metatron.discovery.prep.parser.preparation.rule.Unpivot;
import app.metatron.discovery.prep.parser.preparation.rule.Window;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import com.google.common.collect.Lists;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PrepRuleChecker {

  private static Logger LOGGER = LoggerFactory.getLogger(PrepRuleChecker.class);

  private PrepRuleChecker() {
  }

  private static void checkMove(Move move) {
    String after = move.getAfter();
    String before = move.getBefore();
    if ((null == after || after.isEmpty()) && (null == before || before.isEmpty())) {
      LOGGER.error("confirmRuleStringForException(): move before and after is empty");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_MOVE_BEFORE_AND_AFTER);
    }
    Expression expression = move.getCol();
    if (null == expression) {
      LOGGER.error("confirmRuleStringForException(): move expression is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_MOVE_EXPRESSION);
    }
  }

  private static void checkSort(Sort sort) {
    Expression order = sort.getOrder();
    if (!(order instanceof Identifier.IdentifierExpr || order instanceof Identifier.IdentifierArrayExpr)) {
      LOGGER.error("confirmRuleStringForException(): sort order is not valid");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SORT_ORDER);
    }

    Expression type = sort.getType();
    if (type == null || (type instanceof Constant.StringExpr && ((Constant.StringExpr) type)
            .getEscapedValue().equalsIgnoreCase("DESC"))) {
      return;
    }

    LOGGER.error("confirmRuleStringForException(): sort type is not valid");
    throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
            PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SORT_TYPE);
  }

  private static void checkDrop(Drop drop) {
    Expression col = drop.getCol();
    if (col instanceof Identifier.IdentifierExpr
            || col instanceof Identifier.IdentifierArrayExpr) {
      return;
    }

    LOGGER.error("confirmRuleStringForException(): drop col is not valid");
    throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
            PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_DROP_COL);
  }

  private static void checkKeep(Keep keep) {
    Expression expression = keep.getRow();
    if (null == expression) {
      LOGGER.error("confirmRuleStringForException(): keep expression is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_KEEP_EXPRESSION);
    }
  }

  private static void checkDelete(Delete delete) {
    Expression expression = delete.getRow();
    if (null == expression) {
      LOGGER.error("confirmRuleStringForException(): delete expression is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_DELETE_EXPRESSION);
    }
  }

  private static void checkFlatten(Flatten flatten) {
    String col = flatten.getCol();
    if (null == col || 0 == col.length()) {
      LOGGER.error("confirmRuleStringForException(): flatten col is wrong");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_FLATTEN_COL);
    }
  }

  private static void checkHeader(Header header) {
    Long rowNum = header.getRownum();
    if (null == rowNum || rowNum < 0) {
      LOGGER.error("confirmRuleStringForException(): header rowNum is wrong");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_HEADER_ROWNUM);
    }
  }

  private static void checkRename(Rename rename) {
    Expression col = rename.getCol();
    Expression to = rename.getTo();
    if (null == col) {
      LOGGER.error("confirmRuleStringForException(): rename col is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_RENAME_COL);
    }
    if (null == to) {
      LOGGER.error("confirmRuleStringForException(): rename to is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_RENAME_TO);
    }
  }

  private static void checkReplace(Replace replace) {
    Expression after = replace.getAfter();
    Expression before = replace.getBefore();
    Expression col = replace.getCol();
    boolean global = replace.getGlobal();
    boolean ignoreCase = replace.getIgnoreCase();
    Expression on = replace.getOn();
    Expression quote = replace.getQuote();
    Expression row = replace.getRow();
    Constant with = replace.getWith();
    if (null == col) {
      LOGGER.error("confirmRuleStringForException(): replace col is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_REPLACE_COL);
    }
    if (null == on) {
      LOGGER.error("confirmRuleStringForException(): replace on is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_REPLACE_ON);
    }
  }

  private static void checkSetType(SetType setType) {
    Expression col = setType.getCol();
    String format = setType.getFormat();
    String type = setType.getType();
    if (null == col) {
      LOGGER.error("confirmRuleStringForException(): settype col is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SETTYPE_COL);
    }
    if (null == type) {
      LOGGER.error("confirmRuleStringForException(): settype type is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SETTYPE_TYPE);
    }
  }

  private static void checkSetFormat(SetFormat setFormat) {
    Expression col = setFormat.getCol();
    String format = setFormat.getFormat();

    if (null == col) {
      LOGGER.error("confirmRuleStringForException(): setformat col is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SETFORMAT_COL);
    }
    if (null == format) {
      LOGGER.error("confirmRuleStringForException(): setformat format is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SETFORMAT_FORMAT);
    }
  }

  private static void checkSet(Set set) {
    Expression col = set.getCol();
    Expression row = set.getRow();
    Expression value = set.getValue();
    if (null == col) {
      LOGGER.error("confirmRuleStringForException(): set col is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SET_COL);
    }
    if (null == value) {
      LOGGER.error("confirmRuleStringForException(): set value is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SET_VALUE);
    }
  }

  private static void checkCountPattern(CountPattern countPattern) {
    Expression after = countPattern.getAfter();
    Expression before = countPattern.getBefore();
    Expression col = countPattern.getCol();
    Boolean ignoreCase = countPattern.getIgnoreCase();
    Expression on = countPattern.getOn();
    Expression quote = countPattern.getQuote();
    if (null == col) {
      LOGGER.error("confirmRuleStringForException(): countpattern col is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_COUNTPATTERN_COL);
    }
    if (null == on) {
      LOGGER.error("confirmRuleStringForException(): countpattern on is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_COUNTPATTERN_ON);
    }
  }

  private static void checkDerive(Derive derive) {
    String as = derive.getAs();
    Expression value = derive.getValue();
    if (null == as) {
      LOGGER.error("confirmRuleStringForException(): derive as col is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_DERIVE_AS);
    }
    if (null == value) {
      LOGGER.error("confirmRuleStringForException(): derive value is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_DERIVE_VALUE);
    }
  }

  private static void checkMerge(Merge merge) {
    String as = merge.getAs();
    Expression col = merge.getCol();
    String with = merge.getWith();
    if (null == as) {
      LOGGER.error("confirmRuleStringForException(): merge as is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_MERGE_AS);
    }
    if (null == col) {
      LOGGER.error("confirmRuleStringForException(): merge col is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_MERGE_COL);
    }
    if (null == with) {
      LOGGER.error("confirmRuleStringForException(): merge with is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_MERGE_WITH);
    }
  }

  private static void checkUnnest(Unnest unnest) {
    String col = unnest.getCol();
    if (col == null) {
      LOGGER.error("confirmRuleStringForException(): unnest col is null");
      throw transformError(MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_UNNEST_COL);
    }
  }

  private static void checkExtract(Extract extract) {
    Expression col = extract.getCol();
    Boolean IgnoreCase = extract.getIgnoreCase();
    Integer limit = extract.getLimit();
    Expression on = extract.getOn();
    Expression quote = extract.getQuote();
    if (null == col) {
      LOGGER.error("confirmRuleStringForException(): extract col is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_EXTRACT_COL);
    }
    if (null == limit) {
      LOGGER.error("confirmRuleStringForException(): extract limit is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_EXTRACT_LIMIT);
    }
    if (null == on) {
      LOGGER.error("confirmRuleStringForException(): extract on is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_EXTRACT_ON);
    }
  }

  private static void checkAggregate(Aggregate aggregate) {
    Expression group = aggregate.getGroup();
    Expression value = aggregate.getValue();
    if (null == value) {
      LOGGER.error("confirmRuleStringForException(): aggregate value is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_AGGREGATE_VALUE);
    }
  }

  private static void checkSplit(Split split) {
    Expression col = split.getCol();
    Boolean ignoreCase = split.getIgnoreCase();
    Integer limit = split.getLimit();
    Expression on = split.getOn();
    Expression quote = split.getQuote();
    if (null == col) {
      LOGGER.error("confirmRuleStringForException(): split col is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SPLIT_COL);
    }
    if (null == limit) {
      LOGGER.error("confirmRuleStringForException(): split limit is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SPLIT_LIMIT);
    }
    if (null == on) {
      LOGGER.error("confirmRuleStringForException(): split on is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_SPLIT_ON);
    }
  }

  private static void checkNest(Nest nest) {
    String as = nest.getAs();
    Expression col = nest.getCol();
    String into = nest.getInto();
    if (null == as) {
      LOGGER.error("confirmRuleStringForException(): nest as is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_NEST_AS);
    }
    if (null == col) {
      LOGGER.error("confirmRuleStringForException(): nest col is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_NEST_COL);
    }
    if (null == into) {
      LOGGER.error("confirmRuleStringForException(): nest into is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_NEST_INTO);
    }
  }

  private static void checkPivot(Pivot pivot) {
    Expression col = pivot.getCol();
    Expression group = pivot.getGroup();
    Integer limit = pivot.getLimit();
    Expression value = pivot.getValue();
    if (null == col) {
      LOGGER.error("confirmRuleStringForException(): pivot col is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_PIVOT_COL);
    }
    if (null == group) {
      LOGGER.error("confirmRuleStringForException(): pivot group is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_PIVOT_GROUP);
    }
    if (null == value) {
      LOGGER.error("confirmRuleStringForException(): pivot value is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_PIVOT_VALUE);
    }
  }

  private static void checkUnpivot(Unpivot unpivot) {
    Expression col = unpivot.getCol();
    Integer groupEvery = unpivot.getGroupEvery();
    if (null == col) {
      LOGGER.error("confirmRuleStringForException(): unpivot col is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_UNPIVOT_COL);
    }
    if (null == groupEvery) {
      LOGGER.error("confirmRuleStringForException(): unpivot groupEvery is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_UNPIVOT_GROUPEVERY);
    }
  }

  private static void checkJoin(Join join) {
    Expression condition = join.getCondition();
    Expression dataset2 = join.getDataset2();
    String joinType = join.getJoinType();
    Expression leftSelectCol = join.getLeftSelectCol();
    Expression rightSelectCol = join.getRightSelectCol();
    if (null == dataset2) {
      LOGGER.error("confirmRuleStringForException(): join dataset2 is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_JOIN_DATASET2);
    }
    if (null == joinType) {
      LOGGER.error("confirmRuleStringForException(): join joinType is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_JOIN_JOINTYPE);
    }
  }

  private static void checkWindow(Window window) {
    Expression order = window.getOrder();
    Expression value = window.getValue();
    if (null == value || !(value instanceof Expr.FunctionExpr
            || value instanceof Expr.FunctionArrayExpr)) {
      LOGGER.error("confirmRuleStringForException(): window value is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_WINDOW_VALUE);
    }
  }

  private static void checkUnion(Union union) {
    Expression dataset2 = union.getDataset2();
    if (null == dataset2) {
      LOGGER.error("confirmRuleStringForException(): union dataset2 is null");
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED_BY_UNION_DATASET2);
    }
  }

  private static void switchAndCheck(Rule rule) {
    switch (rule.getName()) {
      case "move":
        checkMove((Move) rule);
        break;
      case "sort":
        checkSort((Sort) rule);
        break;
      case "drop":
        checkDrop((Drop) rule);
        break;
      case "keep":
        checkKeep((Keep) rule);
        break;
      case "delete":
        checkDelete((Delete) rule);
        break;
      case "flatten":
        checkFlatten((Flatten) rule);
        break;
      case "header":
        checkHeader((Header) rule);
        break;
      case "rename":
        checkRename((Rename) rule);
        break;
      case "replace":
        checkReplace((Replace) rule);
        break;
      case "settype":
        checkSetType((SetType) rule);
        break;
      case "setformat":
        checkSetFormat((SetFormat) rule);
        break;
      case "set":
        checkSet((Set) rule);
        break;
      case "countpattern":
        checkCountPattern((CountPattern) rule);
        break;
      case "derive":
        checkDerive((Derive) rule);
        break;
      case "merge":
        checkMerge((Merge) rule);
        break;
      case "unnest":
        checkUnnest((Unnest) rule);
        break;
      case "extract":
        checkExtract((Extract) rule);
        break;
      case "aggregate":
        checkAggregate((Aggregate) rule);
        break;
      case "split":
        checkSplit((Split) rule);
        break;
      case "nest":
        checkNest((Nest) rule);
        break;
      case "pivot":
        checkPivot((Pivot) rule);
        break;
      case "unpivot":
        checkUnpivot((Unpivot) rule);
        break;
      case "join":
        checkJoin((Join) rule);
        break;
      case "window":
        checkWindow((Window) rule);
        break;
      case "union":
        checkUnion((Union) rule);
        break;
      default:
        LOGGER.error("confirmRuleStringForException(): ruleName is wrong - " + rule.getName());
        throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
                PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED, "ruleName is wrong");
    }
  }


  public static void confirmRuleStringForException(String ruleString) {
    try {
      switchAndCheck(new RuleVisitorParser().parse(ruleString));
    } catch (RuleException e) {
      // Convert exceptions of Teddy package into Data-prep exceptions, that can be handled in UI.
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              TeddyException.fromRuleException(e));
    } catch (NumberFormatException e) {
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE,
              PrepMessageKey.MSG_DP_ALERT_UNSUPPORTED_NUMBER_FORMAT, e.getMessage());
    }
  }

  public static List<ExprFunction> getFunctionList() {
    List<ExprFunction> functionList = Lists.newArrayList();

    functionList.add(
            new ExprFunction(ExprFunctionCategory.STRING, "length",
                    "msg.dp.ui.expression.functiondesc.string.length"
                    , "length(‘hello world’)", "11")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.STRING, "upper",
                    "msg.dp.ui.expression.functiondesc.string.upper"
                    , "upper(‘Hello world’)", "’HELLO WORLD’")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.STRING, "lower",
                    "msg.dp.ui.expression.functiondesc.string.lower"
                    , "lower(‘Hello WORLD’)", "’hello world’")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.STRING, "trim",
                    "msg.dp.ui.expression.functiondesc.string.trim"
                    , "trim(‘  .   Hi!   ‘)", "‘.   Hi!’")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.STRING, "ltrim",
                    "msg.dp.ui.expression.functiondesc.string.ltrim"
                    , "ltrim(‘  .   Hi!   ‘)", "’.   Hi!   ‘")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.STRING, "rtrim",
                    "msg.dp.ui.expression.functiondesc.string.rtrim"
                    , "rtrim(‘  .   Hi!   ‘)", "‘  .   Hi!’")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.STRING, "substring",
                    "msg.dp.ui.expression.functiondesc.string.substring"
                    , "substring(‘hello world’, 1, 7)", "‘ello w’")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.STRING, "concat",
                    "msg.dp.ui.expression.functiondesc.string.concat"
                    , "concat(‘1980’, ’02’)", "‘198002’")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.STRING, "concat_ws",
                    "msg.dp.ui.expression.functiondesc.string.concat_ws"
                    , "concat_ws(‘-‘, ‘010’, ‘1234’, ‘5678’)", "’010-1234-5678’")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.LOGICAL, "if",
                    "msg.dp.ui.expression.functiondesc.logical.if"
                    , "if(gender==‘male’)", "TRUE")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.LOGICAL, "ismismatched",
                    "msg.dp.ui.expression.functiondesc.logical.ismismatched"
                    , "", "")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.LOGICAL, "isnull",
                    "msg.dp.ui.expression.functiondesc.logical.isnull"
                    , "isnull(telephone)", "FALSE")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.LOGICAL, "isnan",
                    "msg.dp.ui.expression.functiondesc.logical.isnan"
                    , "isnan(1000/ratio)", "FALSE")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.LOGICAL, "contains",
                    "msg.dp.ui.expression.functiondesc.logical.contains"
                    , "contains(‘hello world’, 'wor')", "true")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.LOGICAL, "startswith",
                    "msg.dp.ui.expression.functiondesc.logical.startswith"
                    , "startswith(‘hello world’, 'hell')", "true")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.LOGICAL, "endswith",
                    "msg.dp.ui.expression.functiondesc.logical.endswith"
                    , "endswith(‘hello world’, 'world')", "true")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.TIMESTAMP, "year",
                    "msg.dp.ui.expression.functiondesc.timestamp.year"
                    , "year(birthday)", " 1987")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.TIMESTAMP, "month",
                    "msg.dp.ui.expression.functiondesc.timestamp.month"
                    , "month(birthday)", " 2")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.TIMESTAMP, "day",
                    "msg.dp.ui.expression.functiondesc.timestamp.day"
                    , "day(birthday)", " 13")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.TIMESTAMP, "hour",
                    "msg.dp.ui.expression.functiondesc.timestamp.hour"
                    , "hour(last_login)", " 21")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.TIMESTAMP, "minute",
                    "msg.dp.ui.expression.functiondesc.timestamp.minute"
                    , "minute(last_login)", " 49")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.TIMESTAMP, "second",
                    "msg.dp.ui.expression.functiondesc.timestamp.second"
                    , "second(last_login)", " 28")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.TIMESTAMP, "millisecond",
                    "msg.dp.ui.expression.functiondesc.timestamp.millisecond"
                    , "millisecond(last_login)", " 831")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.TIMESTAMP, "now",
                    "msg.dp.ui.expression.functiondesc.timestamp.now"
                    , "now()", "2018-04-18T12:20:90.220Z")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.TIMESTAMP, "add_time",
                    "msg.dp.ui.expression.functiondesc.timestamp.add_time"
                    , "add_time(timestamp, delta, time_unit)", "add_time(end_date, 10, ‘day’)")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.AGGREGATION, "sum",
                    "msg.dp.ui.expression.functiondesc.aggregation.sum"
                    , "sum(profit)", "")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.AGGREGATION, "avg",
                    "msg.dp.ui.expression.functiondesc.aggregation.avg"
                    , "avg(profit)", "")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.AGGREGATION, "max",
                    "msg.dp.ui.expression.functiondesc.aggregation.max"
                    , "max(profit)", "")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.AGGREGATION, "min",
                    "msg.dp.ui.expression.functiondesc.aggregation.min"
                    , "min(profit)", "")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.AGGREGATION, "count",
                    "msg.dp.ui.expression.functiondesc.aggregation.count"
                    , "count()", "")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.abs",
                    "msg.dp.ui.expression.functiondesc.math.abs"
                    , "math.abs(-10)", "10")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.acos",
                    "msg.dp.ui.expression.functiondesc.math.acos"
                    , "math.acos(-1)", " 3.141592653589793")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.asin",
                    "msg.dp.ui.expression.functiondesc.math.asin"
                    , "math.asin(-1)", "-1.5707963267948966")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.atan",
                    "msg.dp.ui.expression.functiondesc.math.atan"
                    , "math.atan(-1)", "-0.7853981633974483")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.cbrt",
                    "msg.dp.ui.expression.functiondesc.math.cbrt"
                    , "math.cbrt(5)", " 1.709975946676697")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.ceil",
                    "msg.dp.ui.expression.functiondesc.math.ceil"
                    , "math.ceil(15.142)", " 16")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.cos",
                    "msg.dp.ui.expression.functiondesc.math.cos"
                    , "math.cos(45)", "0.5253219888177297")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.cosh",
                    "msg.dp.ui.expression.functiondesc.math.cosh"
                    , "math.cosh(9)", "4051.5420254925943")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.exp",
                    "msg.dp.ui.expression.functiondesc.math.exp"
                    , "math.exp(4)", "54.598150033144236")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.expm1",
                    "msg.dp.ui.expression.functiondesc.math.expm1"
                    , "math.expm1(4)", "53.598150033144236")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.getExponent",
                    "msg.dp.ui.expression.functiondesc.math.getExponent"
                    , "math.getExponent(9)", "3")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.round",
                    "msg.dp.ui.expression.functiondesc.math.round"
                    , "math.round(14.2)", "14")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.signum",
                    "msg.dp.ui.expression.functiondesc.math.signum"
                    , "math.signum(-24)", "-1")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.sin",
                    "msg.dp.ui.expression.functiondesc.math.sin"
                    , "math.sin(90)", "0.8939966636005579")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.sinh",
                    "msg.dp.ui.expression.functiondesc.math.sinh"
                    , "math.sinh(1)", "1.1752011936438014")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.sqrt",
                    "msg.dp.ui.expression.functiondesc.math.sqrt"
                    , "math.sqrt(4)", "2")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.tan",
                    "msg.dp.ui.expression.functiondesc.math.tan"
                    , "math.tan(10)", "0.6483608274590866")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.MATH, "math.tanh",
                    "msg.dp.ui.expression.functiondesc.math.tanh"
                    , "math.tanh(4)", "0.999329299739067")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.WINDOW, "row_number",
                    "msg.dp.ui.expression.functiondesc.window.row_number"
                    , "row_number()", "window function")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.WINDOW, "rolling_sum",
                    "msg.dp.ui.expression.functiondesc.window.rolling_sum"
                    , "rolling_sum(target_col, before, after)", "window function")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.WINDOW, "rolling_avg",
                    "msg.dp.ui.expression.functiondesc.window.rolling_avg"
                    , "rolling_sum(target_col, before, after)", "window function")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.WINDOW, "lag",
                    "msg.dp.ui.expression.functiondesc.window.lag"
                    , "lag(target_col, before)", "window function")
    );
    functionList.add(
            new ExprFunction(ExprFunctionCategory.WINDOW, "lead",
                    "msg.dp.ui.expression.functiondesc.window.lead"
                    , "lead(target_col, after)", "window function")
    );

    return functionList;
  }
}
