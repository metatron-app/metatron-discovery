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

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.repository.PrDatasetRepository;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.CannotSerializeIntoJsonException;
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
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant.ArrayExpr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr.BinaryNumericOpExprBase;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr.FunctionArrayExpr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr.FunctionExpr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr.UnaryMinusExpr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr.UnaryNotExpr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier.IdentifierArrayExpr;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PrepTransformRuleService {
  private static Logger LOGGER = LoggerFactory.getLogger(PrepTransformRuleService.class);

  @Autowired
  private PrDatasetRepository datasetRepository;

  public PrepTransformRuleService() { }

  public static final String CREATE_RULE_PREFIX = "create with: ";

  private RuleVisitorParser ruleVisitorParser = null;

  public String getCreateRuleString(String dsId) {
    return CREATE_RULE_PREFIX + dsId;
  }

  public String getUpstreamDsIdFromCreateRule(String ruleString) {
    return ruleString.substring(CREATE_RULE_PREFIX.length());
  }

  private String strip(String str) {
    if (str != null && str.length() >= 2 && str.startsWith("'") && str.endsWith("'")) {
      return str.substring(1, str.length() - 1);
    }
    return str;
  }

  private StrExpResult strip(StrExpResult strExpResult) {
    if (strExpResult == null) {
      return new StrExpResult("");
    }

    for (int i = 0; i < strExpResult.arrStr.size(); i++) {
      strExpResult.arrStr.set(i, strip(strExpResult.arrStr.get(i)));
    }
    strExpResult.str = joinWithComma(strExpResult.arrStr);
    return strExpResult;
  }

  private String wrapIdentifier(String identifier) {
    if (!identifier.matches("[_a-zA-Z\u0080-\uFFFF]+[_a-zA-Z0-9\u0080-\uFFFF]*")) {  // if has odd characters
      return "`" + identifier + "`";
    }
    return identifier;
  }

  private StrExpResult wrapIdentifier(StrExpResult strExpResult) {
    for (int i = 0; i < strExpResult.arrStr.size(); i++) {
      strExpResult.arrStr.set(i, wrapIdentifier(strExpResult.arrStr.get(i)));
    }
    strExpResult.str = joinWithComma(strExpResult.arrStr);
    return strExpResult;
  }

  private String stringifyFuncExpr(FunctionExpr funcExpr) {
    List<Expr> args = funcExpr.getArgs();
    String str = funcExpr.getName() + "(";

    for (Expr arg : args) {
      str += stringifyExpr(arg).str + ", ";
    }
    return str.substring(0, str.length() - 2) + ")";
  }

  private String joinWithComma(List<String> strs) {
    String resultStr = "";

    for (String str : strs) {
      resultStr += str + ", ";
    }
    return resultStr.substring(0, resultStr.length() - 2);
  }

  private StrExpResult stringifyExpr(Expression expr) {
    if (expr == null) {
      return null;
    }

    if (expr instanceof IdentifierArrayExpr) {    // This should come first because this is the sub-class of Identifier
      IdentifierArrayExpr arrExpr = (IdentifierArrayExpr) expr;
      List<String> wrappedIdentifiers = new ArrayList();

      for (String colName : arrExpr.getValue()) {
        wrappedIdentifiers.add(wrapIdentifier(colName));
      }

      return new StrExpResult(joinWithComma(wrappedIdentifiers), wrappedIdentifiers);
    }
    else if (expr instanceof Identifier) {
      return new StrExpResult(wrapIdentifier(expr.toString()));
    }
    else if (expr instanceof FunctionExpr) {
      return new StrExpResult(stringifyFuncExpr((FunctionExpr) expr));
    }
    else if (expr instanceof FunctionArrayExpr) {
      FunctionArrayExpr funcArrExpr = (FunctionArrayExpr) expr;
      List<String> funcStrExprs = new ArrayList();

      for (FunctionExpr funcExpr : funcArrExpr.getFunctions()) {
        funcStrExprs.add(stringifyFuncExpr(funcExpr));
      }
      return new StrExpResult(joinWithComma(funcStrExprs), funcStrExprs);
    }
    else if (expr instanceof BinaryNumericOpExprBase) {
      BinaryNumericOpExprBase binExpr = (BinaryNumericOpExprBase) expr;
      return new StrExpResult(stringifyExpr(binExpr.getLeft()).str + " " + binExpr.getOp() + " " + stringifyExpr(binExpr.getRight()).str);
    }
    else if (expr instanceof UnaryNotExpr) {
      UnaryNotExpr notExpr = (UnaryNotExpr) expr;
      return new StrExpResult("!" + stringifyExpr(notExpr.getChild()));
    }
    else if (expr instanceof UnaryMinusExpr) {
      UnaryMinusExpr minusExpr = (UnaryMinusExpr) expr;
      return new StrExpResult(minusExpr.toString());
    }
    else if (expr instanceof ArrayExpr) {
      List<String> arrStr = ((ArrayExpr) expr).getValue();
      return new StrExpResult(joinWithComma(arrStr), arrStr);
    }

    return new StrExpResult(expr.toString());
  }

  private void putIfExists(Map<String, StrExpResult> mapStrExp, String key, Object obj) {
    if (obj == null) {
      return;
    }

    if (obj instanceof StrExpResult) {
      mapStrExp.put(key, (StrExpResult) obj);
      return;
    }

    mapStrExp.put(key, new StrExpResult(obj.toString()));
  }

  private class StrExpResult {
    public String str;
    public List<String> arrStr;

    public StrExpResult(String str, List<String> arrStr) {
      this.str = str;
      this.arrStr = arrStr;
    }

    public StrExpResult(String str) {
      this(str, Arrays.asList(str));
    }

    public int getArrSize() {
      return arrStr.size();
    }

    public String toColList() {
      if (arrStr.size() >= 3) {
        return arrStr.size() + " columns";
      }

      return str;
    }

    @Override
    public String toString() {
      return str;
    }
  }

  public List<String> getUpstreamDsIds(String ruleString) throws CannotSerializeIntoJsonException, JsonProcessingException {
    List<String> upstreamDsIds = new ArrayList<>();
    Map<String, StrExpResult> mapStrExp = stringifyRuleString(ruleString);

    if (mapStrExp.containsKey("dataset2")) {
      upstreamDsIds.addAll(mapStrExp.get("dataset2").arrStr);
    }

    return upstreamDsIds;
  }

  // If there's no uiRuleString from UI (like auto-generated rules), server makes the uiRuleString.
  // Of course it has to be as same as if UI had sent. (Actually, the UI should code according to the server's)
  public String jsonizeRuleString(String ruleString) throws CannotSerializeIntoJsonException, JsonProcessingException {
    Map<String, StrExpResult> mapStrExp = stringifyRuleString(ruleString);
    Map<String, Object> mapJsonStr = new HashMap();

    String ruleCommand = mapStrExp.get("name").toString();

    mapJsonStr.put("name", ruleCommand);

    switch (ruleCommand) {
      case "create":
        String dsId = mapStrExp.get("with").toString();
        String dsName = datasetRepository.findRealOne(datasetRepository.findOne(dsId)).getDsName();
        mapJsonStr.put("with", dsName);
        break;
      case "header":
        mapJsonStr.put("rownum", Integer.valueOf(mapStrExp.get("rownum").str));
        mapJsonStr.put("isBuilder", true);
        break;
      case "settype":
        StrExpResult col = mapStrExp.get("col");
        if (col.getArrSize() > 1) {
          List<String> colList = new ArrayList();
          for (String colName : col.arrStr) {
            colList.add(colName);
          }
          mapJsonStr.put("col", colList);
        } else {
          mapJsonStr.put("col", mapStrExp.get("col").str);
        }
        mapJsonStr.put("type", mapStrExp.get("type").str);
        mapJsonStr.put("format", mapStrExp.get("format").str);
        mapJsonStr.put("isBuilder", true);
        break;
      default:
        assert false : ruleCommand;
    }

    return GlobalObjectMapper.getDefaultMapper().writeValueAsString(mapJsonStr);
  }

  public Map<String, StrExpResult> stringifyRuleString(String ruleString) throws CannotSerializeIntoJsonException, JsonProcessingException {
    Map<String, StrExpResult> mapStrExp = new HashMap();

    if (ruleString.startsWith(CREATE_RULE_PREFIX)) {
      mapStrExp.put("name", new StrExpResult("create"));
      mapStrExp.put("with", new StrExpResult(ruleString.substring(CREATE_RULE_PREFIX.length())));
      return mapStrExp;
    }

    if (ruleVisitorParser == null) {
      ruleVisitorParser = new RuleVisitorParser();
    }

    Rule rule = ruleVisitorParser.parse(ruleString);
    mapStrExp.put("name", new StrExpResult(rule.getName()));

    switch (rule.getName()) {
      case "header":
        Header header = (Header) rule;
        putIfExists(mapStrExp, "rownum", header.getRownum());
        break;
      case "keep":
        Keep keep = (Keep) rule;
        putIfExists(mapStrExp, "row", stringifyExpr(keep.getRow()));
        break;
      case "replace":
        Replace replace = (Replace) rule;
        putIfExists(mapStrExp, "col", stringifyExpr(replace.getCol()));
        putIfExists(mapStrExp, "on", stringifyExpr(replace.getOn()));
        putIfExists(mapStrExp, "with", replace.getWith().getValue());
        putIfExists(mapStrExp, "quote", replace.getQuote());
        putIfExists(mapStrExp, "global", replace.getGlobal());
        putIfExists(mapStrExp, "ignoreCase", replace.getIgnoreCase());
        break;
      case "rename":
        Rename rename = (Rename) rule;
        putIfExists(mapStrExp, "col", stringifyExpr(rename.getCol()));
        putIfExists(mapStrExp, "to", wrapIdentifier(strip(stringifyExpr(rename.getTo()))));  // literal -> identifier
        break;
      case "set":
        Set set = (Set) rule;
        putIfExists(mapStrExp, "col", stringifyExpr(set.getCol()));
        putIfExists(mapStrExp, "value", stringifyExpr(set.getValue()));
        putIfExists(mapStrExp, "row", stringifyExpr(set.getRow()));
        break;
      case "settype":
        SetType settype = (SetType) rule;
        putIfExists(mapStrExp, "col", stringifyExpr(settype.getCol()));
        putIfExists(mapStrExp, "type", settype.getType());
        putIfExists(mapStrExp, "format", settype.getFormat());
        break;
      case "countpattern":
        CountPattern countPattern = (CountPattern) rule;
        putIfExists(mapStrExp, "col", stringifyExpr(countPattern.getCol()));
        putIfExists(mapStrExp, "on", countPattern.getOn());
        putIfExists(mapStrExp, "quote", countPattern.getQuote());
        putIfExists(mapStrExp, "ignoreCase", countPattern.getIgnoreCase());
        break;
      case "split":
        Split split = (Split) rule;
        putIfExists(mapStrExp, "col", stringifyExpr(split.getCol()));
        putIfExists(mapStrExp, "on", split.getOn());
        putIfExists(mapStrExp, "limit", split.getLimit());
        putIfExists(mapStrExp, "quote", split.getQuote());
        putIfExists(mapStrExp, "ignoreCase", split.getIgnoreCase());
        break;
      case "derive":
        Derive derive = (Derive) rule;
        putIfExists(mapStrExp, "value", stringifyExpr(derive.getValue()));
        putIfExists(mapStrExp, "as", wrapIdentifier(strip(derive.getAs())));   // string -> identifier
        break;
      case "delete":
        Delete delete = (Delete) rule;
        putIfExists(mapStrExp, "row", stringifyExpr(delete.getRow()));
        break;
      case "drop":
        Drop drop = (Drop) rule;
        putIfExists(mapStrExp, "col", stringifyExpr(drop.getCol()));
        break;
      case "pivot":
        Pivot pivot = (Pivot) rule;
        putIfExists(mapStrExp, "col", stringifyExpr(pivot.getCol()));
        putIfExists(mapStrExp, "value", stringifyExpr(pivot.getValue()));
        putIfExists(mapStrExp, "group", stringifyExpr(pivot.getGroup()));
        putIfExists(mapStrExp, "limit", pivot.getLimit());
        break;
      case "unpivot":
        Unpivot unpivot = (Unpivot) rule;
        putIfExists(mapStrExp, "col", stringifyExpr(unpivot.getCol()));
        putIfExists(mapStrExp, "groupEvery", unpivot.getGroupEvery());
        break;
      case "join":
        Join join = (Join) rule;
        putIfExists(mapStrExp, "dataset2", strip(stringifyExpr(join.getDataset2())));
        putIfExists(mapStrExp, "leftSelectCol", stringifyExpr(join.getLeftSelectCol()));
        putIfExists(mapStrExp, "rightSelectCol", stringifyExpr(join.getRightSelectCol()));
        putIfExists(mapStrExp, "condition", stringifyExpr(join.getCondition()));
        putIfExists(mapStrExp, "joinType", join.getJoinType());
        break;
      case "extract":
        Extract extract = (Extract) rule;
        putIfExists(mapStrExp, "col", stringifyExpr(extract.getCol()));
        putIfExists(mapStrExp, "on", extract.getOn());
        putIfExists(mapStrExp, "limit", extract.getLimit());
        putIfExists(mapStrExp, "quote", extract.getQuote());
        putIfExists(mapStrExp, "ignoreCase", extract.getIgnoreCase());
        break;
      case "flatten":
        Flatten flatten = (Flatten) rule;
        putIfExists(mapStrExp, "col", wrapIdentifier(strip(flatten.getCol())));  // string -> identifier
        break;
      case "merge":
        Merge merge = (Merge) rule;
        putIfExists(mapStrExp, "col", stringifyExpr(merge.getCol()));
        putIfExists(mapStrExp, "with", merge.getWith());
        putIfExists(mapStrExp, "as", wrapIdentifier(strip(merge.getAs())));      // string -> identifier
        break;
      case "nest":
        Nest nest = (Nest) rule;
        putIfExists(mapStrExp, "col", stringifyExpr(nest.getCol()));
        putIfExists(mapStrExp, "into", nest.getInto());
        putIfExists(mapStrExp, "as", wrapIdentifier(strip(nest.getAs())));       // string -> identifier
        break;
      case "unnest":
        Unnest unnest = (Unnest) rule;
        putIfExists(mapStrExp, "col", wrapIdentifier(unnest.getCol()));
        putIfExists(mapStrExp, "into", wrapIdentifier(strip(unnest.getInto()))); // string -> identifier
        putIfExists(mapStrExp, "idx", unnest.getIdx());
        break;
      case "aggregate":
        Aggregate aggregate = (Aggregate) rule;
        putIfExists(mapStrExp, "value", stringifyExpr(aggregate.getValue()));
        putIfExists(mapStrExp, "group", stringifyExpr(aggregate.getGroup()));
        break;
      case "sort":
        Sort sort = (Sort) rule;
        String type = sort.getType() != null && strip(sort.getType().toString()).equalsIgnoreCase("desc") ? "desc" : "asc";
        putIfExists(mapStrExp, "order", stringifyExpr(sort.getOrder()));
        putIfExists(mapStrExp, "type", new StrExpResult(type));
        break;
      case "move":
        Move move = (Move) rule;
        putIfExists(mapStrExp, "col", stringifyExpr(move.getCol()));
        putIfExists(mapStrExp, "after", move.getAfter());             // after, before could be null,
        putIfExists(mapStrExp, "before", move.getBefore());           // shortenRuleString() takes care of them.
        break;
      case "union":
        Union union = (Union) rule;
        putIfExists(mapStrExp, "dataset2", strip(stringifyExpr(union.getDataset2())));
        break;
      case "setformat":
        SetFormat setformat = (SetFormat) rule;
        putIfExists(mapStrExp, "col", stringifyExpr(setformat.getCol()));
        putIfExists(mapStrExp, "format", setformat.getFormat());
        break;
      case "window":
        Window window = (Window) rule;
        putIfExists(mapStrExp, "value", stringifyExpr(window.getValue()));
        putIfExists(mapStrExp, "order", stringifyExpr(window.getOrder()));
        putIfExists(mapStrExp, "group", stringifyExpr(window.getGroup()));
        break;
      default:
    }
    return mapStrExp;
  }

  /**
   * Returns a string that represents the dataset
   *
   * @param strExpResult  A result of stringifyExpr()
   * @return String: the dsName like "sales (CSV)"
   *         List with 2 elements: dsName list like "lineitem, customer"
   *         List with N (>2) elements: "N datasets"
   */
  private String shortenDatasetList(StrExpResult strExpResult) {
    if (strExpResult.getArrSize() >= 3) {
      return strExpResult.getArrSize() + " datasets";
    }

    for (String dsId : strExpResult.arrStr) {
      PrDataset dataset = datasetRepository.findRealOne(datasetRepository.findOne(dsId));
      strExpResult.str = strExpResult.str.replaceAll(dsId, dataset.getDsName());
    }

    return strExpResult.str;
  }

  private String combineCountAndUnit(int count, String unit) {
    assert count > 0 : unit;

    if (count == 1) {
      return String.format("%d %s", count, unit);
    }
    return String.format("%d %ss", count, unit);
  }

  private final String FMTSTR_CREATE       = "create with %s";                          // with
  private final String FMTSTR_HEADER       = "convert row %s to header";                // rownum
  private final String FMTSTR_KEEP         = "keep rows where %s";                      // row
  private final String FMTSTR_RENAME       = "rename %s to %s";                         // col, to
  private final String FMTSTR_RENAMES      = "rename %s";                               // col
  private final String FMTSTR_NEST         = "convert %s into %s";                      // col, into
  private final String FMTSTR_UNNEST       = "create a new column from %s";             // col
  private final String FMTSTR_SETTYPE      = "set type %s to %s";                       // col, type
  private final String FMTSTR_SETFORMAT    = "set format %s to %s";                     // col, format
  private final String FMTSTR_DERIVE       = "create %s from %s";                       // as, value
  private final String FMTSTR_DELETE       = "delete rows where %s";                    // row
  private final String FMTSTR_SET          = "set %s to %s";                            // col, value
  private final String FMTSTR_SPLIT        = "split %s into %s on %s";                  // col, limit, on
  private final String FMTSTR_EXTRACT      = "extract %s %s from %s";                   // on, limit, col
  private final String FMTSTR_FLATTEN      = "convert arrays in %s to rows";            // col
  private final String FMTSTR_COUNTPATTERN = "count occurrences of %s in %s";           // value, col
  private final String FMTSTR_SORT         = "sort rows by %s %s";                      // order, type
  private final String FMTSTR_REPLACE      = "replace %s from %s with %s";              // on, col, with
  private final String FMTSTR_REPLACES     = "replace %s";                              // col
  private final String FMTSTR_MERGE        = "concatenate %s separated by %s";          // col, with
  private final String FMTSTR_AGGREGATE    = "aggregate with %s grouped by %s";         // value, group
  private final String FMTSTR_MOVE         = "move %s %s";                              // col, before/after
  private final String FMTSTR_JOIN_UNION   = "%s with %s";                              // command, strDsNames
  private final String FMTSTR_PIVOT        = "pivot %s and compute %s grouped by %s";   // col, value, group
  private final String FMTSTR_UNPIVOT      = "convert %s into rows";                    // col
  private final String FMTSTR_DROP         = "drop %s";                                 // col
  private final String FMTSTR_WINDOW       = "create %s from %s%s%s";                   // N columns, value, order, group

  public String shortenRuleString(String ruleString) throws CannotSerializeIntoJsonException, JsonProcessingException {
    String shortRuleString;

    Map<String, StrExpResult> mapStrExp = stringifyRuleString(ruleString);

    switch (mapStrExp.get("name").toString()) {
      case "create":
        String dsId = mapStrExp.get("with").toString();
        String dsName = datasetRepository.findRealOne(datasetRepository.findOne(dsId)).getDsName();
        shortRuleString = String.format(FMTSTR_CREATE, dsName);
        break;
      case "header":
        shortRuleString = String.format(FMTSTR_HEADER, mapStrExp.get("rownum"));
        break;
      case "keep":
        shortRuleString = String.format(FMTSTR_KEEP, mapStrExp.get("row"));
        break;
      case "replace":
        int colCnt = mapStrExp.get("col").getArrSize();
        if (colCnt >= 3) {
          shortRuleString = String.format(FMTSTR_REPLACES, mapStrExp.get("col").toColList());
        } else {
          shortRuleString = String.format(FMTSTR_REPLACE, mapStrExp.get("on"), mapStrExp.get("col").toColList(), mapStrExp.get("with"));
        }
        break;
      case "rename":
        colCnt = mapStrExp.get("col").getArrSize();
        if (colCnt >= 3) {
          shortRuleString = String.format(FMTSTR_RENAMES, colCnt + " columns");
        } else {
          shortRuleString = String.format(FMTSTR_RENAME, mapStrExp.get("col"), mapStrExp.get("to"));
        }
        break;
      case "set":
        shortRuleString = String.format(FMTSTR_SET, mapStrExp.get("col").toColList(), mapStrExp.get("value"));
        break;
      case "settype":
        shortRuleString = String.format(FMTSTR_SETTYPE, mapStrExp.get("col").toColList(), mapStrExp.get("type"));
        break;
      case "countpattern":
        shortRuleString = String.format(FMTSTR_COUNTPATTERN, mapStrExp.get("on"), mapStrExp.get("col").toColList());
        break;
      case "split":
        int limit = Integer.parseInt(mapStrExp.get("limit").toString());
        String strCount = combineCountAndUnit(limit + 1, "column");      // split N times, produces N + 1 columns

        shortRuleString = String.format(FMTSTR_SPLIT, mapStrExp.get("col").toColList(), strCount, mapStrExp.get("on"));
        break;
      case "derive":
        shortRuleString = String.format(FMTSTR_DERIVE, mapStrExp.get("as"), mapStrExp.get("value"));
        break;
      case "delete":
        shortRuleString = String.format(FMTSTR_DELETE, mapStrExp.get("row"));
        break;
      case "drop":
        shortRuleString = String.format(FMTSTR_DROP, mapStrExp.get("col").toColList());
        break;
      case "pivot":
        shortRuleString = String.format(FMTSTR_PIVOT, mapStrExp.get("col").toColList(), mapStrExp.get("value"), mapStrExp.get("group").toColList());
        break;
      case "unpivot":
        shortRuleString = String.format(FMTSTR_UNPIVOT, mapStrExp.get("col").toColList());
        break;
      case "join":
      case "union":
        String dsList = shortenDatasetList(mapStrExp.get("dataset2"));
        shortRuleString = String.format(FMTSTR_JOIN_UNION, mapStrExp.get("name"), dsList);
        break;
      case "extract":
        limit = Integer.parseInt(mapStrExp.get("limit").toString());
        strCount = combineCountAndUnit(limit, "time");            // extract N times, produces just N columns
        shortRuleString = String.format(FMTSTR_EXTRACT, mapStrExp.get("on"), strCount, mapStrExp.get("col").toColList());
        break;
      case "flatten":
        shortRuleString = String.format(FMTSTR_FLATTEN, mapStrExp.get("col"));
        break;
      case "merge":
        shortRuleString = String.format(FMTSTR_MERGE, mapStrExp.get("col").toColList(), mapStrExp.get("with"));
        break;
      case "nest":
        shortRuleString = String.format(FMTSTR_NEST, mapStrExp.get("col").toColList(), mapStrExp.get("into"));
        break;
      case "unnest":
        shortRuleString = String.format(FMTSTR_UNNEST, mapStrExp.get("col"));
        break;
      case "aggregate":
        shortRuleString = String.format(FMTSTR_AGGREGATE, mapStrExp.get("value"), mapStrExp.get("group").toColList());
        break;
      case "sort":
        shortRuleString = String.format(FMTSTR_SORT, mapStrExp.get("order"), mapStrExp.get("type"));
        break;
      case "move":
        StrExpResult before = mapStrExp.get("before");
        StrExpResult after = mapStrExp.get("after");
        String strTo = (before != null) ? "before " + wrapIdentifier(strip(before.str))
                                        : "after " + wrapIdentifier(strip(after.str));
        shortRuleString = String.format(FMTSTR_MOVE, mapStrExp.get("col").toColList(), strTo);
        break;
      case "setformat":
        shortRuleString = String.format(FMTSTR_SETFORMAT, mapStrExp.get("col").toColList(), mapStrExp.get("format"));
        break;
      case "window":
        StrExpResult value = mapStrExp.get("value");
        String strColumns = "a new column";
        if (value.getArrSize() >= 1) {
          strColumns = value.getArrSize() + " columns";
        }

        // order
        StrExpResult order = mapStrExp.get("order");
        String strOrder = (order == null) ? "" : " ordered by " + order.toString();

        // group
        StrExpResult group = mapStrExp.get("group");
        String strGroup = (group == null) ? "" : " grouped by " + group.toString();

        shortRuleString = String.format(FMTSTR_WINDOW, strColumns, value, strOrder, strGroup);
        break;

      default:
        shortRuleString = "Unknown rule command: " + mapStrExp.get("name").toString();
    }

    LOGGER.debug("shortRuleString: {}", shortRuleString);
    return shortRuleString;
  }
}
