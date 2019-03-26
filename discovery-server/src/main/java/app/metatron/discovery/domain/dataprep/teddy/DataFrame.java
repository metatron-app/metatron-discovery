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

package app.metatron.discovery.domain.dataprep.teddy;

import app.metatron.discovery.domain.dataprep.csv.PrepCsvParseResult;
import app.metatron.discovery.domain.dataprep.json.PrepJsonParseResult;
import app.metatron.discovery.domain.dataprep.transform.Histogram;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.*;
import app.metatron.discovery.domain.dataprep.transform.TimestampTemplate;
import app.metatron.discovery.prep.parser.exceptions.RuleException;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DataFrame implements Serializable, Transformable {
  private static Logger LOGGER = LoggerFactory.getLogger(DataFrame.class);

  private static int CANCEL_INTERVAL = 1000;

  // Members
  public int colCnt;
  public List<String> colNames;
  public List<ColumnDescription> colDescs;
  public List<Histogram> colHists;
  public List<Row> rows;

  public Map<String, Integer> mapColno;       // TODO: colNameInvertedMap
  public List<String> newColNames;            // 자동 생성된 컬럼이름 리스트 (countpattern, split, unnest, extract)   // TODO: if possible, use as local variable
  public List<String> interestedColNames;     // target 컬럼, 새로 생긴 컬럼 등을 모두 추가해서 반환 (컬럼 선택/반전을 위해)

  public String dsName;
  public Map<String, String> slaveDsNameMap;  // slaveDsId -> slaveDsName (join, union의 경우 룰 축약시 계속해서 필요)   // FIXME: delete

  public String ruleString;
  public String jsonRuleString;
  public boolean valid;

  @JsonIgnore
  public List<String> ruleColumns;            // TODO: if possible, use as local variable


  // copy the references to all members (to avoid deep copy, but make a non-identical object)   // TODO: find out why we do deep-copy like this
  public DataFrame(DataFrame df) {
    colCnt             = df.colCnt;
    colNames           = df.colNames;
    colDescs           = df.colDescs;
    colHists           = df.colHists;
    rows               = df.rows;
    mapColno           = df.mapColno;
    newColNames        = df.newColNames;
    interestedColNames = df.interestedColNames;
    dsName             = df.dsName;
    slaveDsNameMap     = df.slaveDsNameMap;
    ruleString         = df.ruleString;
    jsonRuleString     = df.jsonRuleString;
    valid              = df.valid;
    ruleColumns        = df.ruleColumns;
  }

  // Constructor
  public DataFrame() {
    colCnt = 0;
    colNames = new ArrayList<>();
    colDescs = new ArrayList<>();
    colHists = new ArrayList<>();
    rows = new ArrayList<>();

    mapColno = new HashMap<>();
    newColNames = new ArrayList<>();
    interestedColNames = new ArrayList<>();

    dsName = null;
    slaveDsNameMap = new HashMap<>();

    ruleString = "MUST_NOT_BE_SHOWN";
    jsonRuleString = "MUST_NOT_BE_SHOWN";

    ruleColumns = new ArrayList<>();
    valid = true;
  }

  public DataFrame(String dsName) {
    this();
    this.dsName = dsName;
  }

  public DataFrame(String dsName, String ruleString) {
    this(dsName);
    this.ruleString = ruleString;
  }

  public void setRuleString(String ruleString) {
    this.ruleString = ruleString;
  }

  public void setJsonRuleString(String jsonRuleString) {
    this.jsonRuleString = jsonRuleString;
  }

  public String getRuleString() {
    return ruleString;
  }

  public String getJsonRuleString() {
    return jsonRuleString;
  }

  public boolean isValid() {
    return valid;
  }

  public void setValid(boolean valid) {
    this.valid = valid;
  }

  public static DataFrame getNewDf(Rule rule, String dsName, String ruleString) {
    switch (rule.getName()) {
      case "move":         return new DfMove(dsName, ruleString);
      case "sort":         return new DfSort(dsName, ruleString);
      case "union":        return new DfUnion(dsName, ruleString);
      case "drop":         return new DfDrop(dsName, ruleString);
      case "keep":         return new DfKeep(dsName, ruleString);
      case "delete":       return new DfDelete(dsName, ruleString);
      case "flatten":      return new DfFlatten(dsName, ruleString);
      case "header":       return new DfHeader(dsName, ruleString);
      case "rename":       return new DfRename(dsName, ruleString);
      case "replace":      return new DfReplace(dsName, ruleString);
      case "settype":      return new DfSetType(dsName, ruleString);
      case "setformat":    return new DfSetFormat(dsName, ruleString);
      case "set":          return new DfSet(dsName, ruleString);
      case "countpattern": return new DfCountPattern(dsName, ruleString);
      case "derive":       return new DfDerive(dsName, ruleString);
      case "merge":        return new DfMerge(dsName, ruleString);
      case "unnest":       return new DfUnnest(dsName, ruleString);
      case "extract":      return new DfExtract(dsName, ruleString);
      case "aggregate":    return new DfAggregate(dsName, ruleString);
      case "split":        return new DfSplit(dsName, ruleString);
      case "nest":         return new DfNest(dsName, ruleString);
      case "pivot":        return new DfPivot(dsName, ruleString);
      case "unpivot":      return new DfUnpivot(dsName, ruleString);
      case "join":         return new DfJoin(dsName, ruleString);
      case "window":       return new DfWindow(dsName, ruleString);

      default:
        throw new IllegalArgumentException("getNewDf(): unknown rule: " + rule.getName());
    }
  }

  public static boolean isParallelizable(Rule rule) {
    switch (rule.getName()) {
      case "move":
      case "drop":
      case "keep":
      case "delete":
      case "flatten":
      case "header":
      case "rename":
      case "replace":
      case "settype":
      case "set":
      case "countpattern":
      case "derive":
      case "merge":
      case "unnest":
      case "extract":
      case "split":
      case "nest":
      case "unpivot":
      case "join":
        return true;

      case "sort":
      case "union":
      case "setformat":
      case "aggregate":
      case "pivot":
      case "window":

      default:
        return false;
    }
  }


  // Setters, getters
  public int getColCnt() {
    return colCnt;
  }

  public String getColName(int colno) {
    return colNames.get(colno);
  }

  public String getColTimestampStyle(int colno) {
    return colDescs.get(colno).getTimestampStyle();
  }

  public ColumnDescription getColDesc(int colno) {
    return colDescs.get(colno);
  }

  public ColumnType getColType(int colno) {
    return colDescs.get(colno).getType();
  }

  private void setColType(int colno, ColumnType colType) {
    colDescs.get(colno).setType(colType);
  }

  // used in serialization
  public List<String> getNewColNames() {
    return newColNames;
  }

  // used in serialization
  public List<String> getInterestedColNames() {
    return interestedColNames;
  }

  // used in serialization
  public Map<String, String> getSlaveDsNameMap() {
    return slaveDsNameMap;
  }

  // Methods
  public int getColnoByColName(String colName) throws ColumnNotFoundException {
    Integer colno = mapColno.get(colName);
    if (colno == null) {
      throw new ColumnNotFoundException("getColnoByColName(): column not found: " + colName);
    }
    return colno;
  }

  public ColumnDescription getColDescByColName(String colName) throws ColumnNotFoundException {
    return getColDesc(getColnoByColName(colName));
  }

  public ColumnType getColTypeByColName(String colName) throws ColumnNotFoundException {
    return getColType(getColnoByColName(colName));
  }

  String getColTimestampStyleByColName(String colName) throws ColumnNotFoundException {
    return getColTimestampStyle(getColnoByColName(colName));
  }

  // 대소문자 구분 없이 unique해야 함 (Hive, Druid 제약 때문에, DataFrame도 그렇게 함)   // FIXME: 주석 수정
  boolean colsContains(String colName) {
    return colsContains(colNames, colName);
  }

  boolean colsContains(List<String> oldColNames, String colName) {
    for (int i = 0; i < oldColNames.size(); i++) {
      if (oldColNames.get(i).equalsIgnoreCase(colName)) {
        return true;
      }
    }
    return false;
  }

  String addColumn(int colno, String colName, ColumnDescription colDesc) {
    makeParsable(colName);

    // 중복 체크 및 이름 치환은 여기서 함 (rename, derive 등 새 컬럼이름에 대한 제한은 미리)
    colName = modifyDuplicatedColName(colName);

    // colName -> colno mapping 에 추가. 추가되는 colno 이후의 모든 column의 colno를 모두 수정
    // colNames에 colName을 추가하기 전에 해야함 (getColName(i)이 현재 기준으로 동작하게 하기 위해)
    mapColno.put(colName, colno);
    for (int i = colno; i < getColCnt(); i++) {
      mapColno.put(getColName(i), mapColno.get(getColName(i)) + 1);   // colno 이후로 모두 1씩 증가
    }

    colNames.add(colno, colName);
    colDescs.add(colno, colDesc);
    colCnt++;

    return colName;   // 중복을 회피하려고 변경된 확정 colName
  }

  String addColumn(int colno, String colName, ColumnType colType, String colTimestampStyle) {
    ColumnDescription colDesc = new ColumnDescription(colType, colTimestampStyle);
    return addColumn(colno, colName, colDesc);
  }

  String addColumn(String colName, ColumnDescription colDesc) {
    return addColumn(getColCnt(), colName, colDesc);
  }

  String addColumnWithTimestampStyle(int colno, String colName, ColumnType colType, String colTimestampStyle) {
    return addColumn(colno,
                     colName,
                     colType,
                     colTimestampStyle);
  }

  String addColumnWithTimestampStyle(String colName, ColumnType colType, String colTimestampStyle) {
    return addColumnWithTimestampStyle(getColCnt(), colName, colType, colTimestampStyle);
  }

  String addColumn(int colno, String colName, ColumnType colType) {
    return addColumn(colno,
                     colName,
                     colType,
                     null);
  }

  public String addColumn(String colName, ColumnType colType) {
    return addColumn(getColCnt(), colName, colType);
  }

  String addColumnWithDf(DataFrame df, int colno) {
    return addColumn(df.colNames.get(colno),
                     df.colDescs.get(colno));
  }

  void addColumnWithDfAll(DataFrame df) {
    for (int colno = 0; colno < df.getColCnt(); colno++) {
      addColumnWithDf(df, colno);
    }
  }

  // Initialization functions
  private int getMaxColCnt(List<String[]> strGrid) {
    int colCnt = 0;
    for (String[] strRow : strGrid) {
      if (strRow.length > colCnt) {
        colCnt = strRow.length;
      }
    }
    return colCnt;
  }

  public void setByGrid(List<String[]> strGrid, List<String> colNames, int maxColCnt) {
    if (strGrid == null) {
      LOGGER.warn("setByGrid(): null grid");
      return;
    }

    if (strGrid.size() == 0) {
      LOGGER.warn("setByGrid(): empty grid");
      return;
    }

    assert getColCnt() == 0 : getColCnt();

    if (colNames != null) {
      for (String colName : colNames) {
        addColumn(colName, ColumnType.STRING);
      }
    } else {
      if (maxColCnt == -1) {
        maxColCnt = getMaxColCnt(strGrid);
      }
      for (int colno = 1; colno <= maxColCnt; colno++) {
        addColumn("column" + colno, ColumnType.STRING);
      }
    }

    for (String[] strRow : strGrid) {
      Row row = new Row();
      for (int colno = 0; colno < colCnt; colno++) {
        row.add(getColName(colno), colno >= strRow.length ? null : strRow[colno]);
      }
      rows.add(row);
    }
  }

  public void setByGrid(List<String[]> strGrid, List<String> colNames) {
    setByGrid(strGrid, colNames, -1);
  }

  public void setByGrid(PrepCsvParseResult result) {
    setByGrid(result.grid, result.colNames, result.maxColCnt);
  }

  public void setByGridWithJson(PrepJsonParseResult result) {
    setByGrid(result.grid, result.colNames, result.maxColCnt);
  }

  // column 순서가 중요해서 JdbcConnectionService를 그대로 쓰기가 어려움. customize가 필요.
  public void setByJDBC(Statement stmt, String query, int limit) throws JdbcTypeNotSupportedException, JdbcQueryFailedException {
    ResultSet rs;
    ResultSetMetaData rsmd;
    int colno;

    try {
      rs = stmt.executeQuery(query);
      rsmd = rs.getMetaData();

      int colCnt = rsmd.getColumnCount();
      for (int i = 1; i <= colCnt; i++) {                 // i --> 1-base integer
        String colName = rsmd.getColumnName(i);
        ColumnType colType = ColumnType.UNKNOWN;
        String colTimestampStyle = null;

        if (colName.contains(".")) {
          colName = colName.substring(colName.indexOf(".") + 1);
        }

        ColumnType columnType = ColumnType.fromJdbcType(rsmd.getColumnType(i));
        switch (columnType) {
          case STRING:
            colType = ColumnType.STRING;
            break;
          case LONG:
            colType = ColumnType.LONG;
            break;
          case DOUBLE:
            colType = ColumnType.DOUBLE;
            break;
          case BOOLEAN:
            colType = ColumnType.BOOLEAN;
            break;
          case ARRAY:
            colType = ColumnType.ARRAY;
            break;
          case MAP:
            colType = ColumnType.MAP;
            break;
          case TIMESTAMP:   // 임시로 그냥 둠. toString한 후에 STRING으로 바꿀 예정. (이렇게 하는 것 역시 임시방편임)
            colType = ColumnType.TIMESTAMP;
            colTimestampStyle = TimestampTemplate.DATE_TIME_01.getFormat();
            break;
          case UNKNOWN:
            throw new JdbcTypeNotSupportedException("setByJDBC(): not supported type: " + columnType.name());
        }

        assert colType != ColumnType.UNKNOWN;
        addColumnWithTimestampStyle(colName, colType, colTimestampStyle);
      }

      while (rs.next()) {
        Row row = new Row();
        for (colno = 0; colno < colCnt; colno++) {    // colno --> 0-base integer
          row.add(getColName(colno), ColumnType.fromJdbcObj(rs.getObject(colno + 1)));
        }
        rows.add(row);
        if (rows.size() >= limit) {
          break;
        }
      }
    } catch (SQLException e) {
      String line = String.format("setByJDBC(): query failed: (sql=[%s] msg=[%s])", query, e.getMessage());
      LOGGER.error(line);
      throw new JdbcQueryFailedException("setByJDBC(): query failed");
    }
  }

  public void show() {
    show(20);
  }

  public void show(int limit) {
    limit = rows.size() < limit ? rows.size() : limit;
    List<Integer> widths = new ArrayList<>();
    for (int colno = 0; colno < getColCnt(); colno++) {
      widths.add(Math.max(getColName(colno).length(), getColType(colno).toString().length()));
    }
    for (int rowno = 0; rowno < limit; rowno++) {
      Row row = rows.get(rowno);
      for (int colno = 0; colno < row.size(); colno++) {
        Object objCol = row.get(getColName(colno));
        int colLen = (objCol == null) ? 4 : objCol.toString().length();   // 4 for "null"
        if (colLen > widths.get(colno)) {
          widths.set(colno, colLen);
        }
      }
    }
    TeddyUtil.showSep(widths);
    TeddyUtil.showColNames(widths, colNames);
    TeddyUtil.showColTypes(widths, colDescs);
    TeddyUtil.showSep(widths);
    for (int rowno = 0; rowno < limit; rowno++) {
      TeddyUtil.showRow(widths, rows.get(rowno));
    }
    TeddyUtil.showSep(widths);
  }

  public void dropColumn(String targetColName) throws TeddyException{
    if(colNames.contains(targetColName)) {
      colDescs.remove(getColnoByColName(targetColName));
      colNames.remove(targetColName);
      mapColno.clear();

      int i = 0;
      for (String colName : colNames) {
        mapColno.put(colName, i);
        i++;
      }

      colCnt = colCnt -1;
    }

    List<Row> newRows = new ArrayList<>();
    for (Row row : this.rows) {
      Row newRow = new Row();
      for (String column : colNames) {
        newRow.add(column, row.get(column));
      }
      newRows.add(newRow);
    }
    rows = newRows;
  }

  //check if Args size are exactly matched with desirable size.
  private void assertArgsEq(int desirable, List<Expr> args, String func) throws TeddyException {
    if (args.size() != desirable) {
      LOGGER.error("decideType(): invalid function arguments: func={} argc={} desirable={}", func, args.size(), desirable);
      throw new InvalidFunctionArgsException("decideType(): invalid function arguments");
    }
  }

  //check if Args size are greater than matched with desirable size.
  private void assertArgsGt(int desirable, List<Expr> args, String func) throws TeddyException {
    if (args.size() < desirable) {
      LOGGER.error("decideType(): invalid function arguments: func={} argc={} desirable= greater than {}", func, args.size(), desirable);
      throw new InvalidFunctionArgsException("decideType(): invalid function arguments");
    }
  }

  //check if Args size are in between desirable nubmers.
  private void assertArgsBw(int min, int max, List<Expr> args, String func) throws TeddyException {
    if (args.size() < min || args.size() > max) {
      LOGGER.error("decideType(): invalid function arguments: func={} argc={} desirable= between {} and {}", func, args.size(), min, max);
      throw new InvalidFunctionArgsException("decideType(): invalid function arguments");
    }
  }

  protected static ColumnType getColTypeFromExprType(ExprType exprType) {
    switch (exprType) {
      case STRING:
        return ColumnType.STRING;
      case DOUBLE:
        return ColumnType.DOUBLE;
      case LONG:
        return ColumnType.LONG;
      case BOOLEAN:
        return ColumnType.BOOLEAN;
      case TIMESTAMP:
        return ColumnType.TIMESTAMP;
    }
    assert false : exprType;
    return ColumnType.UNKNOWN;
  }

  protected ColumnType decideType(Expression expr) throws TeddyException {
    ruleColumns.clear();

    return decideType_internal(expr);
  }

  protected ColumnType decideType_internal(Expression expr) throws TeddyException {
    ColumnType resultType = ColumnType.UNKNOWN;
    String errmsg;

    // Identifier
    if (expr instanceof Identifier.IdentifierExpr) {
      String colName = ((Identifier.IdentifierExpr) expr).getValue();
      int colno = getColnoByColName(colName);
      resultType = getColType(colno);
      ruleColumns.add(colName); //ruleString에 등장하는 identifier 들을 리스트업.
    }
    // Constant
    else if (expr instanceof Constant) {
      if (expr instanceof Constant.StringExpr) {
        resultType = getColTypeFromExprType(ExprType.STRING);
      }
      else if (expr instanceof Constant.LongExpr) {
        resultType = getColTypeFromExprType(ExprType.LONG);
      }
      else if (expr instanceof Constant.DoubleExpr) {
        resultType = getColTypeFromExprType(ExprType.DOUBLE);
      }
      else if (expr instanceof Constant.BooleanExpr) {
        resultType = getColTypeFromExprType(ExprType.BOOLEAN);
      }
      else if (expr instanceof Null.NullExpr) {
        resultType = ColumnType.UNKNOWN;  // binary op에서 반대편 type을 result로 하기 위해
      }
      else {
        errmsg = String.format("decideType(): unsupported constant type: expr=%s", expr);
        // Array, map, timestamp는 constant로써 입력하는 것이 불가함.
        throw new UnsupportedConstantType(errmsg);
      }
    }
    // Binary Operation
    else if (expr instanceof Expr.BinaryNumericOpExprBase) {
      ColumnType left = decideType_internal(((Expr.BinaryNumericOpExprBase) expr).getLeft());
      ColumnType right = decideType_internal(((Expr.BinaryNumericOpExprBase) expr).getRight());
      if (left == right) {
        return (expr instanceof Expr.BinDivExpr) ? ColumnType.DOUBLE : left;    // for compatability to twinkle, which acts like this because of spark's behavior
      } else if (left == ColumnType.DOUBLE && right == ColumnType.LONG || left == ColumnType.LONG && right == ColumnType.DOUBLE) {
        // 한쪽이 double인 경우는 허용
        return ColumnType.DOUBLE;
      }
      String msg = String.format("decideType(): type mismatch: left=%s right=%s expr=%s", left, right, expr);
      throw new TypeMismatchException(msg);
    }
    // Function Operation
    else if (expr instanceof Expr.FunctionExpr) {
      String func = ((Expr.FunctionExpr) expr).getName();
      List<Expr> args = ((Expr.FunctionExpr) expr).getArgs();
      for(Expr arg : args) {  //args를 다시 decideType을 돌려서 함수 내에 있는 identifier들도 찾아낸다.
        decideType_internal(arg);
      }
      switch (func) {
        // conditional function
        case "if":
          if (args.size() == 1) {
            resultType = ColumnType.BOOLEAN;
          } else if (args.size() == 3) {
            ColumnType trueExpr = decideType_internal(args.get(1));
            ColumnType falseExpr = decideType_internal(args.get(2));
            if (trueExpr == falseExpr) {
              resultType = trueExpr;
            } else {
              if (trueExpr == ColumnType.UNKNOWN && falseExpr == ColumnType.UNKNOWN) {
                throw new UnknownTypeException(String.format("decideType(): both types are UNKNOWN trueVal=%s falseVal=%s", args.get(1).toString(), args.get(2).toString()));
              } else if (trueExpr == ColumnType.UNKNOWN) {
                resultType = falseExpr;
              } else if (falseExpr == ColumnType.UNKNOWN) {
                resultType = trueExpr;
              } else {
                throw new TypeDifferentException(String.format("decideType(): type different: trueVal=%s falseVal=%s", args.get(1).toString(), args.get(2).toString()));
              }
            }
          } else {
            throw new InvalidFunctionArgsException("decideType(): invalid conditional function argument count: " + args.size());
          }
          break;
        // 1-argument functions
        case "length":
        case "math.getExponent":
        case "math.round":
          resultType = ColumnType.LONG;
          assertArgsEq(1, args, func);
          break;
        case "isnull":
        case "isnan":
        case "ismissing":
          resultType = ColumnType.BOOLEAN;
          assertArgsEq(1, args, func);
          break;
        case "ismismatched":
          resultType = ColumnType.BOOLEAN;
          assertArgsEq(2, args, func);
          break;
        case "upper":
        case "lower":
        case "trim":
        case "ltrim":
        case "rtrim":
          resultType = ColumnType.STRING;
          assertArgsEq(1, args, func);
          break;
        case "math.abs":
          resultType = decideType_internal(args.get(0));
          assertArgsEq(1, args, func);
          break;
        case "math.acos":
        case "math.asin":
        case "math.atan":
        case "math.cbrt":
        case "math.ceil":
        case "math.cos":
        case "math.cosh":
        case "math.exp":
        case "math.floor":
        case "math.signum":
        case "math.sin":
        case "math.sinh":
        case "math.sqrt":
        case "math.tan":
        case "math.tanh":
          resultType = ColumnType.DOUBLE;
          assertArgsEq(1, args, func);
          break;
        // 2-argument functions
        case "math.max":
        case "math.min":
          resultType = ColumnType.LONG;
          assertArgsEq(2, args, func);
          break;
        case "math.pow":
          resultType = ColumnType.DOUBLE;
          assertArgsEq(2, args, func);
          break;
        case "coalesce":
          resultType = ColumnType.UNKNOWN;
          break;
        // 3-argument functions
        case "substring":
          resultType = ColumnType.STRING;
          assertArgsBw(2, 3, args, func);
          break;
        case "contains":
          resultType = ColumnType.BOOLEAN;
          assertArgsEq(2, args, func);
          break;
        case "startswith":
          resultType = ColumnType.BOOLEAN;
          assertArgsEq(2, args, func);
          break;
        case "endswith":
          resultType = ColumnType.BOOLEAN;
          assertArgsEq(2, args, func);
          break;
        case "timestamptostring":
          resultType = ColumnType.STRING;
          assertArgsEq(2, args, func);
          break;
        case "concat":
          assertArgsGt(1, args, func);
          resultType=ColumnType.STRING;
          break;
        case "concat_ws":
          assertArgsGt(2, args, func);
          resultType=ColumnType.STRING;
          break;
        case "sum":
        case "avg":
        case "mean":
        case "max":
        case "min":
          assertArgsGt(2, args, func);
          resultType=ColumnType.DOUBLE;
          break;
        case "year":
        case "month":
        case "day":
        case "hour":
        case "minute":
        case "second":
        case "millisecond":
          resultType = ColumnType.LONG;
          assertArgsEq(1, args, func);
          break;
        case "weekday":
          resultType = ColumnType.STRING;
          assertArgsEq(1, args, func);
          break;
        case "now":
          resultType = ColumnType.TIMESTAMP;
          assertArgsBw(0, 1, args, func);
          break;
        case "add_time":
          resultType = ColumnType.TIMESTAMP;
          assertArgsEq(3, args, func);
          break;
        case "time_diff":
          resultType = ColumnType.LONG;
          assertArgsEq(2, args, func);
          break;
        case "time_between":
          resultType = ColumnType.BOOLEAN;
          assertArgsEq(3, args, func);
          break;
        case "timestamp":
          resultType = ColumnType.TIMESTAMP;
          assertArgsEq(2, args, func);
          break;
        default:
          LOGGER.error("decideType(): invalid function type: " + expr.toString());
          throw new InvalidFunctionTypeException("decideType(): invalid function type");
      } // end of switch (func)
    } // end of if (expr instanceof Expr.FunctionExpr)

    LOGGER.debug(String.format("decideType(): resultType=%s expr=%s", resultType, expr.toString()));
    return resultType;
  }

  //$col 표현을 해당 컬럼명으로 바꿔주는 함수.
  protected void replace$col(Expression expr, String colName) throws TeddyException {
    // Identifier
    if (expr instanceof Identifier.IdentifierExpr) {
      if (((Identifier.IdentifierExpr) expr).getValue().equals("$col")) {
        ((Identifier.IdentifierExpr) expr).setValue(colName);
      }
    }
    // Binary Operation
    else if (expr instanceof Expr.BinaryNumericOpExprBase) {
      replace$col(((Expr.BinaryNumericOpExprBase) expr).getLeft(), colName);
      replace$col(((Expr.BinaryNumericOpExprBase) expr).getRight(), colName);
    }
    // Function Operation
    else if (expr instanceof Expr.FunctionExpr) {
      List<Expr> args = ((Expr.FunctionExpr) expr).getArgs();
      for (Expr arg : args) {
        replace$col(arg, colName);
      }
    } // end of if (expr instanceof Expr.FunctionExpr)
  }

  //concat 함수에 timestamp 컬럼을 넣었을 때 format을 유지하기위해 timestamptostring(colname, format)으로 교체해 주는 함수.
  protected void convertTimestampForConcat(Expression expr) throws TeddyException {
    //Function
    if (expr instanceof Expr.FunctionExpr) {
      String func = ((Expr.FunctionExpr) expr).getName();
      List<Expr> args = ((Expr.FunctionExpr) expr).getArgs();
      switch (func) {
        case "concat":
        case "concat_ws":
          for(int i=0; i <args.size(); i++) {
            if(args.get(i) instanceof Identifier.IdentifierExpr
                    && getColTypeByColName(((Identifier.IdentifierExpr) args.get(i)).getValue()).equals(ColumnType.TIMESTAMP)) {
              Function newFunc = new BuiltinFunctions.Times.TimestampToString();
              List<Expr> newArgs = new ArrayList<>();
              newArgs.add(args.get(i));
              newArgs.add(new Constant.StringExpr("'" + getColTimestampStyleByColName(((Identifier.IdentifierExpr) args.get(i)).getValue()) + "'"));
              args.set(i, new Expr.FunctionExpr(newFunc, newFunc.name(), newArgs));
            }
          }
        default:
          for (Expr arg : args) {
            convertTimestampForConcat(arg);
          }
      }
    }
    // Binary Operation
    else if (expr instanceof Expr.BinaryNumericOpExprBase) {
      convertTimestampForConcat(((Expr.BinaryNumericOpExprBase) expr).getLeft());
      convertTimestampForConcat(((Expr.BinaryNumericOpExprBase) expr).getRight());
    }
  }

  protected Object cast(Object obj, ColumnType toType, String format) throws TeddyException {
    if (obj == null) {
      return null;
    }

    ColumnType fromType = ColumnType.fromClass(obj);

    switch (toType) {
      case DOUBLE:
        switch (fromType) {
          case DOUBLE:
            return obj;
          case LONG:
            return ((Long)obj).doubleValue();
          case STRING:
            try {
              return Double.valueOf(obj.toString());
            } catch(Exception e) {
              return obj;
            }
          case BOOLEAN:
            return (boolean)obj ? 1D : 0D;
          case TIMESTAMP:
            Long longV = ((DateTime) obj).getMillis();
            return longV.doubleValue();
          default:
            return obj;
        }

      case LONG:
        switch (fromType) {
          case DOUBLE:
            try {
              return ((Double)obj).longValue();
            } catch(Exception e) {
              return obj;
            }
          case LONG:
            return obj;
          case STRING:
            try {
              return Long.valueOf(obj.toString());
            } catch(Exception e) {
              return obj;
            }
          case BOOLEAN:
            return (boolean)obj ? 1L : 0L;
          case TIMESTAMP:
            return ((DateTime) obj).getMillis();
          default:
            return obj;
        }

      case STRING:
        switch (fromType) {
          case DOUBLE:
            return String.valueOf(((Double)obj).doubleValue());
          case LONG:
            return String.valueOf(((Long)obj).longValue());
          case STRING:
            return obj;
          case BOOLEAN:
            return String.valueOf((boolean)obj?"true":"false");
          case TIMESTAMP:
            try {
              if(format.equals("")) {
                format = null;
              }
              return ((DateTime) obj).toString(format, Locale.ENGLISH);
            } catch (Exception e) {
              return obj.toString();
            }
          default:
            return obj;
        }

      case BOOLEAN:
        switch (fromType) {
          case DOUBLE:
            return ((Double)obj)!=0;
          case LONG:
            return ((Long)obj)!=0;
          case STRING:
            if (((String)obj).equalsIgnoreCase("true") || ((String)obj).equalsIgnoreCase("false")) {
              return Boolean.valueOf(obj.toString());
            } else {
              return null;
            }
          case BOOLEAN:
            return obj;
          default:
            return obj;
        }

      case TIMESTAMP:
        switch (fromType) {
          case STRING:
            try {
              DateTimeFormatter dtf = DateTimeFormat.forPattern(format).withLocale(Locale.ENGLISH);
              DateTime jTime = DateTime.parse(obj.toString(), dtf);
              return jTime;
            } catch (Exception e) {
              return obj;
            }
          case TIMESTAMP:
            return obj;
          case LONG:
            return new DateTime((long)obj);
          default:
            return obj;
        }

      default:
        throw new CannotCastFromException("cast(): cannot cast from " + toType);
    }
  }

  protected Object eval(Expr expr, Row row, ColumnType colType) throws TeddyException {
    ExprEval exprEval;
    Object obj;

    try {
      exprEval = expr.eval(row);
    } catch (RuleException re) {
      if(TeddyException.fromRuleException(re) instanceof  ColumnNotFoundException)
        throw TeddyException.fromRuleException(re);
      return null;
    } catch (Exception e) {
      if(e instanceof NullPointerException)
        throw new ColumnNotFoundException(e.getMessage());
      return null;
    }

    if (exprEval == null) {
      return null;
    }
    else if (colType == ColumnType.BOOLEAN) {
      obj = exprEval.asBoolean();
    } else {
      obj = exprEval.value();
    }

    return obj;
  }

  protected Boolean checkCondition(Expr expr, Row row) throws TeddyException {
    if(expr ==null) {
      return true;
    } else {
      ExprEval exprEval;
      Boolean result;

      try {
        exprEval = expr.eval(row);
        result = exprEval.asBoolean();
      } catch (RuleException re) {
        if(TeddyException.fromRuleException(re) instanceof  ColumnNotFoundException)
          throw TeddyException.fromRuleException(re);
        return false;
      } catch (Exception e) {
        if(e instanceof NullPointerException)
          throw new ColumnNotFoundException(e.getMessage());
        return false;
      }

      return result;
    }
  }

  protected String disableRegexSymbols(String str) {
    String regExSymbols = "[\\<\\(\\[\\{\\\\\\^\\-\\=\\$\\!\\|\\]\\}\\)\\?\\*\\+\\.\\>]";
    return str.replaceAll(regExSymbols, "\\\\$0");
  }

  protected String makeCaseInsensitive(String str) {
    String ignorePatternStr = "";
    for (int i = 0; i < str.length(); i++) {
      String c = String.valueOf(str.charAt(i));

      if(c.matches("[a-zA-Z]"))
        ignorePatternStr += "["+c.toUpperCase() + c.toLowerCase()+"]";
      else
        ignorePatternStr +=c;
    }
    return ignorePatternStr;
  }

  protected String compilePatternWithQuote(String patternStr, String quoteStr){
    return patternStr + "(?=([^" + quoteStr + "]*" + quoteStr + "[^" + quoteStr + "]*" + quoteStr + ")*[^" + quoteStr + "]*$)";
  }

  protected String getColNameAndColnoFromFunc(Expr.FunctionExpr funcExpr, List<Integer> targetAggrColnos) throws ColumnNotFoundException, InvalidAggregationValueExpressionTypeException {
    List<Expr> args = funcExpr.getArgs();
    String funcName = funcExpr.getName();

    if (args.size() == 1 || args.get(0) instanceof Identifier.IdentifierExpr) {
      String origColName = ((Identifier.IdentifierExpr) args.get(0)).getValue();
      targetAggrColnos.add(getColnoByColName(origColName));
      return modifyDuplicatedColName(funcName + "_" + origColName);
    }

    throw new InvalidAggregationValueExpressionTypeException("aggregate(): invalid argument expression: " + funcExpr.toString());
  }

  private Map<String, Object> getAvgObj(List<Object> aggregatedValues, int targetExprIdx,
                                        int targetColno, DataFrame prevDf, Row row) throws ColumnTypeShouldBeDoubleOrLongException {
    Map<String, Object> avgObj = (Map<String, Object>) aggregatedValues.get(targetExprIdx);

    avgObj.put("count", (Long) avgObj.get("count") + 1);
    switch (prevDf.getColType(targetColno)) {
      case LONG:
        avgObj.put("sum", (Double) avgObj.get("sum") + ((Long) row.get(targetColno)).doubleValue());
        break;
      case DOUBLE:
        avgObj.put("sum", (Double) avgObj.get("sum") + (Double) row.get(targetColno));
        break;
      default:
        throw new ColumnTypeShouldBeDoubleOrLongException("getAvgObj(): wrong colType: " + prevDf.getColType(targetColno).toString());
    }

    return avgObj;
  }

  protected void aggregate(DataFrame prevDf, List<String> groupByColNames, List<Expr.FunctionExpr> funcExprs) throws TeddyException, InterruptedException {
    List<Integer> targetColnos = new ArrayList<>();   // Each aggregation value has 1 target column. (except "count")
    List<String> resultColNames = new ArrayList<>();
    List<ColumnType> resultColTypes = new ArrayList<>();
    Map<Object, Object> groupByBuckets = new HashMap<>();
    int rowno;

    // Prepare result colNames, colTypes
    for (Expr.FunctionExpr funcExpr : funcExprs) {
      List<Expr> args = funcExpr.getArgs();
      String funcName = funcExpr.getName();
      String resultColName = null;
      ColumnType resultColType = null;

      switch (funcName) {
        case "count":
          if (args == null || args.size() == 0) {   // I'm not sure what parser produces.
            resultColName = modifyDuplicatedColName("row_count");
            targetColnos.add(-1);
          } else {
            resultColName = prevDf.getColNameAndColnoFromFunc(funcExpr, targetColnos);
          }
          resultColType = ColumnType.LONG;
          break;

        case "avg":
          resultColName = prevDf.getColNameAndColnoFromFunc(funcExpr, targetColnos);
          resultColType = ColumnType.DOUBLE;
          break;

        case "sum":
        case "min":
        case "max":
          resultColName = prevDf.getColNameAndColnoFromFunc(funcExpr, targetColnos);
          resultColType = prevDf.getColType(targetColnos.get(targetColnos.size() - 1));   // last appended colType
          break;

        default:
          throw new UnsupportedAggregationFunctionExpressionException("aggregate(): unsupported aggregation function: " + funcExpr.toString());
      }
      resultColNames.add(resultColName);
      resultColTypes.add(resultColType);
    }

    // Group-by columns go first
    for (int i = 0; i < groupByColNames.size(); i++) {
      addColumnWithDf(prevDf, prevDf.getColnoByColName(groupByColNames.get(i)));
    }

    // Next, aggregated value columns
    for (int i = 0; i < resultColNames.size(); i++) {
      addColumn(resultColNames.get(i), resultColTypes.get(i));
    }

    // Build rows
    for (rowno = 0; rowno < prevDf.rows.size(); cancelCheck(rowno++)) {
      Row row = prevDf.rows.get(rowno);
      List<Object> groupByKey = new ArrayList<>(groupByColNames.size());
      for (String groupByColName : groupByColNames) {
        groupByKey.add(row.get(groupByColName));
      }

      if (groupByBuckets.containsKey(groupByKey)) {
        List<Object> aggregatedValues = (List<Object>) groupByBuckets.get(groupByKey);

        for (int i = 0; i < funcExprs.size(); i++) {
          Expr.FunctionExpr funcExpr = funcExprs.get(i);
          int targetColno = targetColnos.get(i);

          switch (funcExpr.getName()) {
            case "avg":
              aggregatedValues.set(i, getAvgObj(aggregatedValues, i, targetColno, prevDf, row));
              break;
            case "count":
              aggregatedValues.set(i, (Long) aggregatedValues.get(i) + 1);
              break;
            case "sum":
              if (resultColTypes.get(i) == ColumnType.LONG) {
                aggregatedValues.set(i, (Long) aggregatedValues.get(i) + (Long) row.get(targetColno));
              } else {
                aggregatedValues.set(i, (Double) aggregatedValues.get(i) + (Double) row.get(targetColno));
              }
              break;
            case "min":
              if (resultColTypes.get(i) == ColumnType.LONG) {
                aggregatedValues.set(i, Math.min((Long) aggregatedValues.get(i), (Long) row.get(targetColno)));
              } else {
                aggregatedValues.set(i, Math.min((Double) aggregatedValues.get(i), (Double) row.get(targetColno)));
              }
              break;
            case "max":
              if (resultColTypes.get(i) == ColumnType.LONG) {
                aggregatedValues.set(i, Math.max((Long) aggregatedValues.get(i), (Long) row.get(targetColno)));
              } else {
                aggregatedValues.set(i, Math.max((Double) aggregatedValues.get(i), (Double) row.get(targetColno)));
              }
              break;
            default:
              throw new InvalidAggregationValueExpressionTypeException("aggregate(): invalid argument expression: " + funcExpr.toString());
          }
        }
        groupByBuckets.put(groupByKey, aggregatedValues);
      } // end of containes groupByKey
      else {  // belows are for new groupByKey
        List<Object> aggregatedValues = new ArrayList<>();
        for (int i = 0; i < funcExprs.size(); i++) {
          Expr.FunctionExpr funcExpr = funcExprs.get(i);
          int targetColno = targetColnos.get(i);

          switch (funcExpr.getName()) {
            case "avg":
              Map<String, Object> avgObj = new HashMap();
              avgObj.put("count", Long.valueOf(1));
              avgObj.put("sum", Double.valueOf(row.get(targetColno).toString()));
              aggregatedValues.add(avgObj);
              break;
            case "count":
              aggregatedValues.add(Long.valueOf(1));
              break;
            default:
              aggregatedValues.add(row.get(targetColno));
          }
        }
        groupByBuckets.put(groupByKey, aggregatedValues);
      }
    }

    for (Map.Entry<Object, Object> elem : groupByBuckets.entrySet()) {
      Row newRow = new Row();
      List<Object> aggregatedValues = (List<Object>) elem.getValue();

      int i = 0;
      for (Object groupByValue : (List<Object>) elem.getKey()) {
        newRow.add(groupByColNames.get(i++), groupByValue);
      }

      for (i = 0; i < funcExprs.size(); i++) {
        Expr.FunctionExpr funcExpr = funcExprs.get(i);

        switch (funcExpr.getName()) {
          case "avg":
            Map<String, Object> avgObj = (Map<String, Object>) aggregatedValues.get(i);
            Double sum = (Double)avgObj.get("sum");
            Long count = (Long)avgObj.get("count");
            Double avg = BigDecimal.valueOf(sum / count).setScale(2, RoundingMode.HALF_UP).doubleValue();
            newRow.add(resultColNames.get(i), avg);
            break;
          default:
            newRow.add(resultColNames.get(i), aggregatedValues.get(i));
        }
      }
      rows.add(newRow);
      cancelCheck();
    }
  }

  protected void sorted(DataFrame prevDf, List<String> orderByColNames, SortType sortType) throws TeddyException {
    int colno;

    addColumnWithDfAll(prevDf);

    for (Row row : prevDf.rows) {
      rows.add(row);
    }

    for (Row row : rows) {
      row.cmpKeyIdxs = new ArrayList<>();
      row.cmpKeyTypes = new ArrayList<>();
    }

    // order by colnames existence check & append to result colnames/coltypes
    for (int i = 0; i < orderByColNames.size(); i++) {
      String orderByColName = orderByColNames.get(i);
      for (colno = 0; colno < getColCnt(); colno++) {
        if (getColName(colno).equals(orderByColName)) {
          for (Row row : rows) {
            row.cmpKeyIdxs.add(colno);
            row.cmpKeyTypes.add(getColType(colno));
          }
          break;
        }
      }
      if (colno == getColCnt()) {
        throw new ColumnNotFoundException("doSortInternal(): order by column not found: " + orderByColName);
      }
    }

    // 이 값을 곱해서 compare 결과를 뒤집는다.
    int sign = sortType.getValue();

    rows.sort(new Comparator<Row>() {
      @Override
      public int compare(Row row1, Row row2) {
        try {
          cancelCheck();
        } catch (InterruptedException e) {
          throw new RuntimeException("sorted(): cancelled by user");
        }

        int result;
        for (int i = 0; i < row1.cmpKeyIdxs.size(); i++) {
          Object obj1 = row1.get(row1.cmpKeyIdxs.get(i));
          Object obj2 = row2.get(row2.cmpKeyIdxs.get(i));
          Boolean obj1_isMismatched;
          Boolean ojb2_isMismatched;

          if (obj1 == null && obj2 == null) {
            return 0;
          } else if (obj1 == null) {
            return -1 * sign;
          } else if (obj2 == null) {
            return 1 * sign;
          }

          try {
            obj1_isMismatched = !ColumnType.fromClass(obj1).equals(row1.cmpKeyTypes.get(i));
            ojb2_isMismatched = !ColumnType.fromClass(obj2).equals(row2.cmpKeyTypes.get(i));
          } catch(Exception e) {
            return 0;
          }

          if (obj1_isMismatched && ojb2_isMismatched) {
            return 0;
          } else if (obj1_isMismatched) {
            return -1 * sign;
          } else if (ojb2_isMismatched) {
            return 1 * sign;
          }else {
            ColumnType colType = row1.cmpKeyTypes.get(i);
            switch(colType) {
              case STRING:
                result = ((String) obj1).compareTo((String) obj2);
                if (result != 0) {
                  return result * sign;
                }
                break;
              case BOOLEAN:
                result = ((Boolean) obj1).compareTo((Boolean) obj2);
                if (result != 0) {
                  return result * sign;
                }
                break;
              case LONG:
                result = ((Long) obj1).compareTo((Long) obj2);
                if (result != 0) {
                  return result * sign;
                }
                break;
              case DOUBLE:
                result = ((Double) obj1).compareTo((Double) obj2);
                if (result != 0) {
                  return result * sign;
                }
                break;
              case TIMESTAMP:
                result = ((DateTime) obj1).compareTo((DateTime) obj2);
                if (result != 0) {
                  return result * sign;
                }
                break;
              default:
                try {
                  throw new InvalidColumnExpressionTypeException("doSortInternal(): invalid column type: " + colType.name());
                } catch (TeddyException e) {
                  e.printStackTrace();
                }
            }
          }
        }
        return 0;
      }
    });
  }

  protected List<Row> filter(DataFrame prevDf, Expression condExpr, boolean keep, int offset, int length) throws NoAssignmentStatementIsAllowedException, TypeMismatchException {
    List<Row> rows = new ArrayList<>();

    if(condExpr instanceof Expr.BinAsExpr) {
      throw new NoAssignmentStatementIsAllowedException(condExpr.toString());
    }

    for (int rowno = offset; rowno < offset + length; rowno++) {
      try {
        if (((Expr) condExpr).eval(prevDf.rows.get(rowno)).asLong() == ((keep) ? 1 : 0)) {
          rows.add(prevDf.rows.get(rowno));
        }
      } catch (ClassCastException e) {
        throw new TypeMismatchException(e.getMessage());
      }
    }

    return rows;
  }

  // Hive 테이블로 만들 때에만 이 함수를 사용해서 컬럼명을 제약함.
  public void checkAlphaNumerical(String colName) throws IllegalColumnNameForHiveException {
    Pattern p = Pattern.compile("^[a-zA-Z0-9_]*$");
    Matcher m = p.matcher(colName);

    // 영문자, 숫자, _만 허용
    if (m.matches() == false) {
      throw new IllegalColumnNameForHiveException("The column name contains non-alphanumerical characters: " + colName);
    }
  }

  // Hive 테이블로 만들 때에만 이 함수를 사용해서 컬럼명을 제약함
  public void checkAlphaNumericalColNames() throws IllegalColumnNameForHiveException {
    for (String colName : colNames) {
      checkAlphaNumerical(colName);
    }
  }

  public void lowerColNames() throws IllegalColumnNameForHiveException {
    List<String> lowerColNames = new ArrayList();
    for (String colName : colNames) {
      String lowerColName = colName.toLowerCase();
      if (lowerColNames.contains(lowerColName)) {
        throw new IllegalColumnNameForHiveException("Column names become duplicated while saving into a Hive table: " + colName);
      }
      lowerColNames.add(lowerColName);
    }
    colNames = lowerColNames;
  }

  protected String makeParsable(String colName) {
    if(colName.matches("^\'.+\'"))
        colName = colName.substring(1, colName.length()-1);

    return colName.replaceAll("[\\p{Punct}\\p{IsPunctuation}]", "_");
  }

  private void assertParsable(String colName) {
    assert makeParsable(colName).equals(colName) : colName;
  }

  protected String modifyDuplicatedColName(String colName) {
    return modifyDuplicatedColName(colNames, colName);
  }

  protected String modifyDuplicatedColName(List<String> oldColNames, String colName) {
    assertParsable(colName);

    if (!colsContains(oldColNames, colName)) {
      return colName;
    }

    // 숫자를 1씩 늘려가면서 중복 체크
    for (int i = 1; i < Integer.MAX_VALUE; i++) {
      String newColName = String.format("%s_%d", colName, i);
      if (!colsContains(oldColNames, newColName)) {
        return newColName;
      }
    }

    assert false : colName;
    return null;
  }

  protected void cancelCheck() throws InterruptedException {
    if (Thread.currentThread().isInterrupted()) {
      throw new InterruptedException();
    }
  }

  protected void cancelCheck(int rowno) throws InterruptedException {
    if (rowno % CANCEL_INTERVAL == 0) {
      cancelCheck();
    }
  }

  // Below functions must be overrided to be called

  @Override
  public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
    assert false : rule.toString();
    return null;
  }

  @Override
  public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
    assert false : prevDf.ruleString;
    return null;
  }
}

