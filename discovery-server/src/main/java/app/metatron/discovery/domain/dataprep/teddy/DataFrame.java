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

import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.*;
import app.metatron.discovery.prep.parser.exceptions.RuleException;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.*;
import app.metatron.discovery.prep.parser.preparation.rule.Set;
import app.metatron.discovery.prep.parser.preparation.rule.expr.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang.StringUtils;
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

  public Map<String, Integer> mapColno;
  public List<String> newColNames;            // 자동 생성된 컬럼이름 리스트 (countpattern, split, unnest, extract)
  public List<String> interestedColNames;     // target 컬럼, 새로 생긴 컬럼 등을 모두 추가해서 반환 (컬럼 선택/반전을 위해)

  public String dsName;
  public Map<String, String> slaveDsNameMap;  // slaveDsId -> slaveDsName (join, union의 경우 룰 축약시 계속해서 필요)

  @JsonIgnore
  protected int newColPos;      // 새로운 컬럼의 위치. derive에서 수식에 유일한 컬럼만 쓰인 경우에 사용됨.

  public String ruleString;   // debugging purpose

  @JsonIgnore
  public List<String> ruleColumns;


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

    ruleString = "ORIGINAL";

    ruleColumns = new ArrayList<>();
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

  public String getRuleString() {
    return ruleString;
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

  // 대소문자 구분 없이 unique해야 함 (Hive, Druid 제약 때문에, DataFrame도 그렇게 함)
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

  public void setByGrid(List<String[]> strGrid, List<String> colNames) {
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
      int maxColCnt = getMaxColCnt(strGrid);
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
          case ARRAY: case MAP:
          case TIMESTAMP:   // 임시로 그냥 둠. toString한 후에 STRING으로 바꿀 예정. (이렇게 하는 것 역시 임시방편임)
            colType = ColumnType.TIMESTAMP;
            break;
          case UNKNOWN:
            throw new JdbcTypeNotSupportedException("setByJDBC(): not supported type: " + columnType.name());
        }

        assert colType != ColumnType.UNKNOWN;
        addColumn(colName, colType);
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
    Util.showSep(widths);
    Util.showColNames(widths, colNames);
    Util.showColTypes(widths, colDescs);
    Util.showSep(widths);
    for (int rowno = 0; rowno < limit; rowno++) {
      Util.showRow(widths, rows.get(rowno));
    }
    Util.showSep(widths);
  }

  public DataFrame drop(List<String> targetColNames) {
    DataFrame newDf = new DataFrame();

    List<Integer> survivedColNos = new ArrayList<>();
    for (int i = 0; i < getColCnt(); i++) {
      if (targetColNames.contains(getColName(i))) {
        continue;   // drop 대상 컬럼들은 새 df에서 누락
      }
      survivedColNos.add(i);
    }

    for (int colno : survivedColNos) {
      newDf.addColumnWithDf(this, colno);
    }

    for (Row row : this.rows) {
      Row newRow = new Row();
      for (int colno : survivedColNos) {
        newRow.add(getColName(colno), row.get(colno));
      }
      newDf.rows.add(newRow);
    }
    return newDf;
  }

  public DataFrame doDrop(Drop drop) throws TeddyException {
    List<String> targetColNames = new ArrayList<>();

    Expr expr = (Expr) drop.getCol();
    if (expr instanceof Identifier.IdentifierExpr) {
      targetColNames.add(((Identifier.IdentifierExpr) expr).getValue());
    } else if (expr instanceof Identifier.IdentifierArrayExpr) {
      targetColNames.addAll(((Identifier.IdentifierArrayExpr) expr).getValue());
    } else {
      assert false : expr;
    }

    for (String colName : targetColNames) {
      if (!colsContains(colName)) {
        throw new ColumnNotFoundException("doDrop(): column not found: " + colName);
      }
    }
    return drop(targetColNames);
  }

  public DataFrame doRename(Rename rename) throws TeddyException {
    DataFrame newDf = new DataFrame();
    Expression targetColExpr = rename.getCol();
    Expression newColNameExpr = rename.getTo();
    List<String> targetColNames = new ArrayList<>();
    List<String> newColNames = new ArrayList<>();
    List<String> oldColNames = new ArrayList<>();
    Map<Integer, String> newColnoAndColName = new HashMap<>();

    //타깃 컬럼/컬럼리스트 처리
    if(targetColExpr instanceof Identifier.IdentifierExpr) {
      targetColNames.add(((Identifier.IdentifierExpr) targetColExpr).getValue());
    } else if(targetColExpr instanceof  Identifier.IdentifierArrayExpr) {
      targetColNames = ((Identifier.IdentifierArrayExpr) targetColExpr).getValue();
    } else {
      throw new WrongTargetColumnExpressionException("doRename(): wrong target column expression: " + targetColExpr.toString());
    }

    //타깃 컬럼의 새로운 컬럼이름 처리
    if(newColNameExpr instanceof Constant.StringExpr) {
      newColNames.add(((Constant.StringExpr) newColNameExpr).toString());
    } else if(newColNameExpr instanceof  Constant.ArrayExpr) {
      newColNames = ((Constant.ArrayExpr) newColNameExpr).getValue();
    } else {
      throw new IllegalColumnNameExpressionException("doRename(): the new column name expression is not an appropriate expression type: " + newColNameExpr.toString());
    }

    //새로운 컬럼이름의 중복/특수문자 처리
    oldColNames.addAll(this.colNames);
    oldColNames.removeAll(targetColNames);

    for(int i = 0; i < newColNames.size(); i++) {
      String newColName = newColNames.get(i);
      newColName = makeParsable(newColName);
      newColName = modifyDuplicatedColName(oldColNames, newColName);

      newColNames.set(i, newColName);
      oldColNames.add(newColName);
    }

    //타깃컬럼번호-신규이름 매핑
    for(int i = 0; i < targetColNames.size(); i++) {
      newColnoAndColName.put(this.getColnoByColName(targetColNames.get(i)), newColNames.get(i));
    }

    for (int colNo = 0; colNo < getColCnt(); colNo++) {
      if (newColnoAndColName.containsKey(colNo)) {
        newDf.addColumn(newColnoAndColName.get(colNo), getColDesc(colNo));
      } else {
        newDf.addColumn(this.getColName(colNo), getColDesc(colNo));
      }
    }

    newDf.interestedColNames.addAll(newColNames);

    for (int rowno = 0; rowno < rows.size(); rowno++) {
      Row row = rows.get(rowno);
      Row newRow = new Row();
      for (int colno = 0; colno < getColCnt(); colno++) {
        if (newColnoAndColName.containsKey(colno)) {
          newRow.add(newColnoAndColName.get(colno), row.get(colno));
        } else {
          newRow.add(getColName(colno), row.get(colno));
        }
      }
      newDf.rows.add(newRow);
    }
    return newDf;
  }

  private void assertArgc(int desirable, List<Expr> args, String func) throws TeddyException {
    if (args.size() != desirable) {
      LOGGER.error("decideType(): invalid function arguments: func={} argc={} desirable={}", func, args.size(), desirable);
      throw new InvalidFunctionArgsException("decideType(): invalid function arguments");
    }
  }

  private void assertArgc(int desirable, List<Expr> args, String func, int option) throws TeddyException { // TeddyException {
    if (option==1) {
      if(args.size() < desirable){
        LOGGER.error("decideType(): invalid function arguments: func={} argc={} desirable={}", func, args.size(), desirable);
        throw new InvalidFunctionArgsException("decideType(): invalid function arguments");
      }
    }
    else if (option==2) {
      if(args.size() > desirable){
        LOGGER.error("decideType(): invalid function arguments: func={} argc={} desirable={}", func, args.size(), desirable);
        throw new InvalidFunctionArgsException("decideType(): invalid function arguments");
      }
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
      ColumnType left = decideType(((Expr.BinaryNumericOpExprBase) expr).getLeft());
      ColumnType right = decideType(((Expr.BinaryNumericOpExprBase) expr).getRight());
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
        decideType(arg);
      }
      switch (func) {
        // conditional function
        case "if":
          if (args.size() == 1) {
            resultType = ColumnType.BOOLEAN;
          } else if (args.size() == 3) {
            ColumnType trueExpr = decideType(args.get(1));
            ColumnType falseExpr = decideType(args.get(2));
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
          assertArgc(1, args, func);
          break;
        case "isnull":
        case "isnan":
        case "ismissing":
          resultType = ColumnType.BOOLEAN;
          assertArgc(1, args, func);
          break;
        case "ismismatched":
          resultType = ColumnType.BOOLEAN;
          assertArgc(2, args, func);
          break;
        case "upper":
        case "lower":
        case "trim":
        case "ltrim":
        case "rtrim":
          resultType = ColumnType.STRING;
          assertArgc(1, args, func);
          break;
        case "math.abs":
          resultType = decideType(args.get(0));
          assertArgc(1, args, func);
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
          assertArgc(1, args, func);
          break;
        // 2-argument functions
        case "math.max":
        case "math.min":
          resultType = ColumnType.LONG;
          assertArgc(2, args, func);
          break;
        case "math.pow":
          resultType = ColumnType.DOUBLE;
          assertArgc(2, args, func);
          break;
        case "coalesce":
          resultType = ColumnType.UNKNOWN;
          break;
        // 3-argument functions
        case "substring":
          resultType = ColumnType.STRING;
          assertArgc(3, args, func);
          break;
        case "timestamptostring":
          resultType = ColumnType.STRING;
          assertArgc(2, args, func);
          break;
        case "concat":
          assertArgc(1, args, func, 1);
          resultType=ColumnType.STRING;
          break;
        case "concat_ws":
          assertArgc(2, args, func, 1);
          resultType=ColumnType.STRING;
          break;
        case "sum":
        case "avg":
        case "mean":
        case "max":
        case "min":
          assertArgc(2, args, func, 1);
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
          assertArgc(1, args, func);
          break;
        case "weekday":
          resultType = ColumnType.STRING;
          assertArgc(1, args, func);
          break;
        case "now":
          resultType = ColumnType.TIMESTAMP;
          assertArgc(1, args, func, 2);
          break;
        case "add_time":
          resultType = ColumnType.TIMESTAMP;
          assertArgc(3, args, func);
          break;
        case "time_diff":
          resultType = ColumnType.LONG;
          assertArgc(2, args, func);
          break;
        case "timestamp":
          resultType = ColumnType.TIMESTAMP;
          assertArgc(2, args, func);
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
              try {
                return Double.valueOf(obj.toString()).longValue();
              } catch (Exception e2){
                return obj;
              }
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

  public DataFrame doSetType(SetType setType) throws TeddyException {
    DataFrame newDf = new DataFrame();
    Expression targetColExpr = setType.getCol();
    List<Integer> targetColnos = new ArrayList<>();
    String timestampFormat = setType.getFormat();
    ColumnType toType = getColTypeFromExprType(ExprType.bestEffortOf(setType.getType()));

    if (targetColExpr instanceof Identifier.IdentifierExpr) {
      String targetColName = ((Identifier.IdentifierExpr) targetColExpr).getValue();
      Integer colno = getColnoByColName(targetColName);
      if (colno == null) {
        throw new ColumnNotFoundException("doSetType(): column not found: " + targetColName);
      }
      targetColnos.add(colno);
      newDf.interestedColNames.add(targetColName);
    }
    else if (targetColExpr instanceof Identifier.IdentifierArrayExpr) {
      List<String> targetColNames = ((Identifier.IdentifierArrayExpr) targetColExpr).getValue();
      for (String targetColName : targetColNames) {
        Integer colno = getColnoByColName(targetColName);
        if (colno == null) {
          throw new ColumnNotFoundException("doSetType(): column not found: " + targetColName);
        }
        targetColnos.add(colno);
        newDf.interestedColNames.add(targetColName);
      }
    } else {
      throw new WrongTargetColumnExpressionException("doSetType(): wrong target column expression: " + targetColExpr.toString());
    }

    if (targetColnos.size() == 0) {
      throw new WrongTargetColumnExpressionException("doSetType(): no target column designated: " + targetColExpr.toString());
    }

    for (int colno = 0; colno < getColCnt(); colno++) {
      if (targetColnos.contains(colno)) {
        newDf.addColumnWithTimestampStyle(getColName(colno), toType, timestampFormat);
      } else {
        newDf.addColumn(getColName(colno), getColDesc(colno));
      }
    }

    for (int rowno = 0; rowno < rows.size(); rowno++) {
      Row row = rows.get(rowno);
      Row newRow = new Row();
      for (int colno = 0; colno < getColCnt(); colno++) {
        newRow.add(getColName(colno), targetColnos.contains(colno) ? cast(row.get(colno), toType, timestampFormat) : row.get(colno)); //실제 각 Row에는 간단하게 캐스팅 해서 넣는다
      }
      newDf.rows.add(newRow);
    }
    return newDf;
  }

  public DataFrame doSetFormat(SetFormat setFormat) throws TeddyException {
    DataFrame newDf = new DataFrame();
    Expression targetColExpr = setFormat.getCol();
    List<Integer> targetColnos = new ArrayList<>();
    String timestampFormat = setFormat.getFormat();

    if (targetColExpr instanceof Identifier.IdentifierExpr) {
      String targetColName = ((Identifier.IdentifierExpr) targetColExpr).getValue();
      Integer colno = getColnoByColName(targetColName);
      if (colno == null) {
        throw new ColumnNotFoundException("doSetFormat(): column not found: " + targetColName);
      }
      if (getColType(colno) != ColumnType.TIMESTAMP) {
        throw new WorksOnlyOnTimestampException("doSetFormat(): This column is not timestamp type: " + targetColName);
      }
      targetColnos.add(colno);
      newDf.interestedColNames.add(targetColName);
    }
    else if (targetColExpr instanceof Identifier.IdentifierArrayExpr) {
      List<String> targetColNames = ((Identifier.IdentifierArrayExpr) targetColExpr).getValue();
      for (String targetColName : targetColNames) {
        Integer colno = getColnoByColName(targetColName);
        if (colno == null) {
          throw new ColumnNotFoundException("doSetFormat(): column not found: " + targetColName);
        }
        if (getColType(colno) != ColumnType.TIMESTAMP) {
          throw new WorksOnlyOnTimestampException("doSetFormat(): This column is not timestamp type: " + targetColName);
        }
        targetColnos.add(colno);
        newDf.interestedColNames.add(targetColName);
      }
    } else {
      throw new WrongTargetColumnExpressionException("doSetFormat(): wrong target column expression: " + targetColExpr.toString());
    }

    if (targetColnos.size() == 0) {
      throw new WrongTargetColumnExpressionException("doSetFormat(): no target column designated: " + targetColExpr.toString());
    }

    for (int colno = 0; colno < getColCnt(); colno++) {
      if (targetColnos.contains(colno)) {
        newDf.addColumnWithTimestampStyle(getColName(colno), getColType(colno), timestampFormat);
      } else {
        newDf.addColumn(getColName(colno), getColDesc(colno));
      }
    }

    newDf.rows = this.rows;

    return newDf;
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

  private void putTargetCol(String targetColName, String ruleString,
                            List<Integer> targetColnos, Map<Integer, Expr> replacedColExprs, Map<Integer, Expr> replacedConditionExprs) throws TeddyException {
    // add targetColno
    Integer colno = getColnoByColName(targetColName);
    if (colno == null) {
      throw new ColumnNotFoundException("putTargetCol(): column not found: " + targetColName);
    }
    targetColnos.add(colno);

    // add replacedColExpr
    Rule rule = new RuleVisitorParser().parse(ruleString);
    Expression exprCopy = ((Set) rule).getValue();
    Expression conditionExpr = ((Set) rule).getRow();
    replace$col(exprCopy, targetColName);
    replace$col(conditionExpr, targetColName);
    convertTimestampForConcat(exprCopy);
    convertTimestampForConcat(conditionExpr);
    replacedColExprs.put(colno, (Expr) exprCopy);
    replacedConditionExprs.put(colno, (Expr) conditionExpr);
  }

  public DataFrame doSet(Set set, String ruleString) throws TeddyException {
    DataFrame newDf = new DataFrame();
    Expression targetColExpr = set.getCol();
    List<Integer> targetColnos = new ArrayList<>();
    Map<Integer, Expr> replacedColExprs = new HashMap<>();
    Map<Integer, Expr> replacedConditionExprs = new HashMap<>();

    if (targetColExpr instanceof Identifier.IdentifierExpr) {
      String targetColName = ((Identifier.IdentifierExpr) targetColExpr).getValue();
      newDf.interestedColNames.add(targetColName);
      putTargetCol(targetColName, ruleString, targetColnos, replacedColExprs, replacedConditionExprs);
    }
    else if (targetColExpr instanceof Identifier.IdentifierArrayExpr) {
      List<String> targetColNames = ((Identifier.IdentifierArrayExpr) targetColExpr).getValue();
      for (String targetColName : targetColNames) {
        newDf.interestedColNames.add(targetColName);
        putTargetCol(targetColName, ruleString, targetColnos, replacedColExprs, replacedConditionExprs);
      }
    } else {
      throw new WrongTargetColumnExpressionException("doSet(): wrong target column expression: " + targetColExpr.toString());
    }

    // add columns
    for (int colno = 0; colno < getColCnt(); colno++) {
      // 변경이 가해진 column은 type이 바뀔 수 있다는 가정 (맞는지는 모르겠으나, backward-compatability를 위해 그렇게 함) --> FIXME: 이제 mismatch가 생겼기 때문에 값에 의해 타입이 바뀌는 일은 없어져야 함
      if (targetColnos.contains(colno)) {
        newDf.addColumnWithTimestampStyle(
                getColName(colno),
                decideType(replacedColExprs.get(colno)) == ColumnType.UNKNOWN ? getColType(colno) : decideType(replacedColExprs.get(colno)),
                getColTimestampStyle(colno));
      } else {
        newDf.addColumn(getColName(colno), getColDesc(colno));
      }
    }

    // add rows
    for (int rowno = 0; rowno < rows.size(); rowno++) {
      Row row = rows.get(rowno);
      Row newRow = new Row();
      for (int colno = 0; colno < newDf.getColCnt(); colno++) {
        if (targetColnos.contains(colno) && checkCondition(replacedConditionExprs.get(colno), row)) {
          newRow.add(getColName(colno), eval(replacedColExprs.get(colno), row, newDf.getColType(colno)));
        } else {
          newRow.add(getColName(colno), row.get(colno));
        }
      }
      newDf.rows.add(newRow);
    }

    return newDf;
  }

  public DataFrame doDerive(Derive derive) throws TeddyException {
    DataFrame newDf = new DataFrame();
    String targetColName = derive.getAs().replaceAll("'", "");
    String timestampStyle;
    Expression expr = derive.getValue();
    int colno = 0;
    newColPos = -1;

    // add columns
    newDf.addColumnWithDfAll(this);

    //concat에 포함된 timestamp column 처리
    convertTimestampForConcat(expr);
    // 새 컬럼의 타입을 결정 (+ rule에 등장하는 identifier들도 체크)
    ColumnType newColType = decideType(expr);

    if (ruleColumns.size() == 0) {             // identifier가 없거나 2개 이상인 경우, 제일 끝으로 붙인다.
      newColPos = getColCnt();
      timestampStyle = null;
    } else if(ruleColumns.size() == 1){                        // 딱 한 개의 identifier가 있는 경우 해당 identifier 뒤로 붙인다.
      newColPos = getColnoByColName(ruleColumns.get(0))+1;
      timestampStyle = newDf.colDescs.get(newColPos-1).getTimestampStyle();
    } else {                                    //여러개인 경우 colno가 가장 마지막인 녀석 뒤로 붙인다.
      for(String colName : ruleColumns) {
        newColPos = getColnoByColName(colName) > newColPos ? getColnoByColName(colName) : newColPos;
      }

      newColPos++;
      timestampStyle = null;
    }

    targetColName = newDf.addColumnWithTimestampStyle(newColPos, targetColName, newColType, timestampStyle);
    newDf.interestedColNames.add(targetColName);

    // add rows
    for (int rowno = 0; rowno < rows.size(); rowno++) {
      Row row = rows.get(rowno);
      Row newRow = new Row();

      // 새 컬럼 position 이전까지
      for (colno = 0; colno < newColPos; colno++) {
        newRow.add(getColName(colno), row.get(colno));
      }

      // 새 컬럼
      newRow.add(targetColName, eval((Expr) expr, row, newDf.getColType(colno)));

      // 이후 컬럼들
      for (colno = newColPos; colno < getColCnt(); colno++) {
        newRow.add(getColName(colno), row.get(colno));
      }
      newDf.rows.add(newRow);
    }

    return newDf;
  }

  public DataFrame doHeader(Header header) throws TeddyException {
    DataFrame newDf = new DataFrame();
    int targetRowno = header.getRownum().intValue() - 1;
    if (targetRowno < 0) {
      throw new NoRowException("doHeader(): rownum should be >= 1: rownum=" + (targetRowno + 1));
    }

    int i = 1;
    Row targetRow = rows.get(targetRowno);
    for (int colno = 0; colno < getColCnt(); colno++) {
      String newColName = targetRow.get(colno) == null ? null : targetRow.get(colno).toString();

      if (newColName ==  null || newColName.equals("")) {
        newColName = "column" + (i++);
      } else if (Character.isDigit(newColName.charAt(0))) {
        newColName = "column" + targetRow.get(colno);
      }

      newColName = makeParsable(newColName);
      newColName = newDf.modifyDuplicatedColName(newColName);
      newDf.addColumn(newColName, getColDesc(colno));
    }

    for (int rowno = 0; rowno < rows.size(); rowno++) {
      if (rowno == targetRowno) {
        continue;
      }

      Row row = rows.get(rowno);
      Row newRow = new Row();
      for (int colno = 0; colno < getColCnt(); colno++) {
        newRow.add(newDf.getColName(colno), row.get(colno));
      }
      newDf.rows.add(newRow);
    }
    return newDf;
  }

  private void addJoinedRow(Row lrow, List<String> leftSelectColNames, Row rrow, List<String> rightSelectColNames) {
    Row newRow = new Row();
    for (String colName : leftSelectColNames) {
      newRow.add(colName, lrow.get(colName));                           // left에서 온 컬럼은 이름 그대로 넣음
    }
    for (String colName : rightSelectColNames) {
      newRow.add(this.getColName(newRow.colCnt), rrow.get(colName));  // 필요한 경우 "r_"이 붙은 컬럼 이름 (여기까지 온 것은 이미 붙은 상황)
    }
    rows.add(newRow);
  }

  private void gatherPredicates(Expression expr, DataFrame rightDf,
                                List<Identifier.IdentifierExpr> leftPredicates,
                                List<Identifier.IdentifierExpr> rightPredicates) throws TeddyException {
    int colno;

    if (expr instanceof Expr.BinAndExpr) {
      gatherPredicates(((Expr.BinAndExpr) expr).getLeft(), rightDf, leftPredicates, rightPredicates);
      gatherPredicates(((Expr.BinAndExpr) expr).getRight(), rightDf, leftPredicates, rightPredicates);
    }
    else if (expr instanceof Expr.BinAsExpr) {
      if (!((Expr.BinAsExpr) expr).getOp().equals("=")) {
        throw new JoinTypeNotSupportedException("join(): join type not suppoerted: op: " + ((Expr.BinAsExpr) expr).getOp());
      }

      for (colno = 0; colno < getColCnt(); colno++) {
        if (getColName(colno).equals(((Expr.BinAsExpr) expr).getLeft().toString())) {
          leftPredicates.add((Identifier.IdentifierExpr) ((Expr.BinAsExpr) expr).getLeft());
          break;
        }
      }
      if (colno == getColCnt()) {
        throw new LeftPredicateNotFoundException("join(): left predicate not found: " + expr.toString());
      }

      for (colno = 0; colno < getColCnt(); colno++) {
        if (rightDf.getColName(colno).equals(((Expr.BinAsExpr) expr).getRight().toString())) {
          rightPredicates.add((Identifier.IdentifierExpr) ((Expr.BinAsExpr) expr).getRight());
          break;
        }
      }
      if (colno == getColCnt()) {
        throw new RightPredicateNotFoundException("join(): right predicate not found: " + expr.toString());
      }
    }
  }

  public DataFrame doJoin(Join join, DataFrame rightDf, int limitRowCnt) throws TeddyException {
    Expression leftSelectCol = join.getLeftSelectCol();
    Expression rightSelectCol = join.getRightSelectCol();
    Expression condition = join.getCondition();
    String joinType = join.getJoinType();

    List<String> leftSelectColNames = getIdentifierList(leftSelectCol);
    List<String> rightSelectColNames = getIdentifierList(rightSelectCol);

    return joinInternal(rightDf, leftSelectColNames, rightSelectColNames, condition, joinType, limitRowCnt);
  }

  public DataFrame joinInternal(DataFrame rightDf, List<String> leftSelectColNames, List<String> rightSelectColNames,
                                Expression condition, String joinType, int limitRowCnt) throws TeddyException {
    List<Identifier.IdentifierExpr> leftPredicates = new ArrayList<>();
    List<Identifier.IdentifierExpr> rightPredicates = new ArrayList<>();
    gatherPredicates(condition, rightDf, leftPredicates, rightPredicates);

    List<Expr.BinEqExpr> eqExprs = new ArrayList<>();
    for (int i = 0; i < leftPredicates.size(); i++) {
      eqExprs.add(new Expr.BinEqExpr("=", leftPredicates.get(i), rightPredicates.get(i)));
    }

    DataFrame newDf = new DataFrame();
    for (String colName : leftSelectColNames) {
      newDf.addColumn(colName, getColDescByColName(colName));
    }
    for (String colName : rightSelectColNames) {
      String rightColName = newDf.checkRightColName(colName);   // 같은 column이름이 있을 경우 right에서 온 것에 "r_"을 붙여준다.
      newDf.addColumn(rightColName, rightDf.getColDescByColName(colName));
      newDf.interestedColNames.add(rightColName);
    }

    List<Object[]> lobjsList = new ArrayList<>();
    List<Object[]> robjsList = new ArrayList<>();

    for (int i = 0; i < leftPredicates.size(); i++) {
      lobjsList.add(new Object[rows.size()]);
      robjsList.add(new Object[rightDf.rows.size()]);
    }

    Row lrow = null;
    Row rrow = null;
    for (int lrowno = 0; lrowno < rows.size(); lrowno++) {
      lrow = rows.get(lrowno);
      for (int i = 0; i < leftPredicates.size(); i++) {
        (lobjsList.get(i))[lrowno] = leftPredicates.get(i).eval(lrow).value();
      }
    }
    for (int rrowno = 0; rrowno < rightDf.rows.size(); rrowno++) {
      rrow = rightDf.rows.get(rrowno);
      for (int i = 0; i < leftPredicates.size(); i++) {
        (robjsList.get(i))[rrowno] = rightPredicates.get(i).eval(rrow).value();
      }
    }

    // 각 predicate column 별로 1줄만 type check
    for (int i = 0; i < leftPredicates.size(); i++) {
      if (lrow == null || rrow == null || leftPredicates.get(i).eval(lrow).type() != rightPredicates.get(i).eval(rrow).type()) {
        throw new PredicateTypeMismatchException(String.format("join(): predicate type mismatch: left=%s right=%s", lrow == null ? "null" : leftPredicates.get(i).eval(lrow).type().name(), rrow == null ? "null" : rightPredicates.get(i).eval(rrow).type().name()));

      }
    }

    for (int lrowno = 0; lrowno < rows.size(); lrowno++) {
      for (int rrowno = 0; rrowno < rightDf.rows.size(); rrowno++) {
        boolean equal = true;
        for (int i = 0; i < lobjsList.size(); i++) {
          if (!(lobjsList.get(i))[lrowno].equals((robjsList.get(i))[rrowno])) {
            equal = false;
            break;
          }
        }
        if (equal) {
          lrow = rows.get(lrowno);
          rrow = rightDf.rows.get(rrowno);
          newDf.addJoinedRow(lrow, leftSelectColNames, rrow, rightSelectColNames);

          if (newDf.rows.size() == limitRowCnt) {
            return newDf;
          }
        }
      } // end of each rrow
    }
    return newDf;
  }

  public DataFrame union(List<DataFrame> slaveDfs, int limitRowCnt) throws TeddyException {
    DataFrame newDf = new DataFrame();
    newDf.addColumnWithDfAll(this);

    // master도 추가
    slaveDfs.add(0, this);
    for (DataFrame df : slaveDfs) {
      for (Row row : df.rows) {
        if (newDf.rows.size() >= limitRowCnt) {
          return newDf;
        }
        newDf.rows.add(row);
      }
    }
    return newDf;
  }

  public DataFrame doExtract(Extract extract) throws TeddyException {
    String targetColName = extract.getCol();
    int targetColno;
    Expression expr = extract.getOn();
    Expression quote = extract.getQuote();    // TODO: quote processing
    Boolean isCaseIgnore = extract.getIgnoreCase();
    String patternStr;
    String quoteStr;
    Pattern pattern;

    int limit = extract.getLimit();
    int rowno, colno;

    if (limit <= 0) {
      throw new NoLimitException("doExtract(): limit should be >= 0: " + limit);
    }

    targetColno = getColnoByColName(targetColName);
    if (getColType(targetColno) != ColumnType.STRING) {
      throw new WorksOnlyOnStringException("doExtract(): works only on STRING: " + getColType(targetColno));
    }

    DataFrame newDf = new DataFrame();
    newDf.addColumnWithDfAll(this);

    for (int i = 1; i <= limit; i++) {
      String newColName = newDf.addColumn(targetColno + i, "extract_" + targetColName + i, ColumnType.STRING);  // 중간 삽입
      newDf.newColNames.add(newColName);  // for newRow add
      newDf.interestedColNames.add(newColName);
    }

    assert !(expr.toString().equals("''") || expr.toString().equals("//")) : "You can not extract empty string!";

    //quote가 없을 때의 처리
    if(quote == null) {
      if (expr instanceof Constant.StringExpr) {
        patternStr = ((Constant.StringExpr) expr).getEscapedValue();

        if (isCaseIgnore != null && isCaseIgnore)
          pattern = Pattern.compile(patternStr, Pattern.LITERAL + Pattern.CASE_INSENSITIVE);
        else
          pattern = Pattern.compile(patternStr, Pattern.LITERAL);

      } else if (expr instanceof RegularExpr) {
        patternStr = ((RegularExpr) expr).getEscapedValue();
        pattern = Pattern.compile(patternStr);
      } else {
        throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + expr.toString());
      }

      for (rowno = 0; rowno < rows.size(); rowno++) {
        Row row = rows.get(rowno);
        Row newRow = new Row();

        // 목적 컬럼까지만 추가
        for (colno = 0; colno <= targetColno; colno++) {
          newRow.add(getColName(colno), row.get(colno));
        }

        String targetStr = (String) row.get(targetColno);
        Matcher matcher = pattern.matcher(targetStr);

        // 새 컬럼들 추가
        for (int i = 0; i < limit; i++) {
          if (matcher.find()) {
            String newColData = targetStr.substring(matcher.start(), matcher.end());
            newRow.add(newDf.newColNames.get(i), newColData);
          } else {
            newRow.add(newDf.newColNames.get(i), "");
          }
        }

        // 나머지 추가
        for (colno = targetColno + 1; colno < getColCnt(); colno++) {
          newRow.add(getColName(colno), row.get(colno));
        }
        newDf.rows.add(newRow);
      }

    } else {

      if (expr instanceof Constant.StringExpr) {
        patternStr = ((Constant.StringExpr) expr).getEscapedValue();
        patternStr = disableRegexSymbols(patternStr);

        if (isCaseIgnore != null && isCaseIgnore)
          patternStr = makeCaseInsensitive(patternStr);

      } else if (expr instanceof RegularExpr) {
        patternStr = ((RegularExpr) expr).getEscapedValue();
      } else {
        throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + expr.toString());
      }

      if (quote instanceof Constant.StringExpr) {
        quoteStr = ((Constant.StringExpr) quote).getEscapedValue();
        quoteStr = disableRegexSymbols(quoteStr);
      } else if (expr instanceof RegularExpr) {
        quoteStr = ((RegularExpr) quote).getEscapedValue();
      } else {
        throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + quote.toString());
      }

      patternStr = compilePatternWithQuote(patternStr, quoteStr);
      pattern = Pattern.compile(patternStr);

      for (rowno = 0; rowno < rows.size(); rowno++) {
        Row row = rows.get(rowno);
        Row newRow = new Row();

        // 목적 컬럼까지만 추가
        for (colno = 0; colno <= targetColno; colno++) {
          newRow.add(getColName(colno), row.get(colno));
        }

        // quote의 수가 홀수개 일 때 마지막 quote 이후의 문자열은 처리대상이 아님으로 날려버린다
        String targetStr = (String) row.get(targetColno);
        if (StringUtils.countMatches(targetStr, quoteStr) % 2 != 0) {
          targetStr = targetStr.substring(0, targetStr.lastIndexOf(quoteStr));
        }

        Matcher matcher = pattern.matcher(targetStr);

        // 새 컬럼들 추가
        for (int i = 0; i < limit; i++) {
          if (matcher.find()) {
            String newColData = targetStr.substring(matcher.start(), matcher.end());
            newRow.add(newDf.newColNames.get(i), newColData);
          } else {
            newRow.add(newDf.newColNames.get(i), "");
          }
        }

        // 나머지 추가
        for (colno = targetColno + 1; colno < getColCnt(); colno++) {
          newRow.add(getColName(colno), row.get(colno));
        }
        newDf.rows.add(newRow);
      }
    }

    return newDf;
  }

  public DataFrame doCountPattern(CountPattern countPattern) throws TeddyException {
    DataFrame newDf = new DataFrame();
    Expression targetColExpr = countPattern.getCol();
    List<Integer> targetColnos = new ArrayList<>();
    Expression expr = countPattern.getOn();
    Expression quote = countPattern.getQuote();
    Boolean ignoreCase = countPattern.getIgnoreCase();
    String patternStr;
    String quoteStr;
    Pattern pattern;
    int rowno;

    if (targetColExpr instanceof Identifier.IdentifierExpr) {
      String targetColName = ((Identifier.IdentifierExpr) targetColExpr).getValue();
      Integer colno = getColnoByColName(targetColName);
      if (colno == null) {
        throw new ColumnNotFoundException("doCountPattern(): column not found: " + targetColName);
      }
      targetColnos.add(colno);
    }
    else if (targetColExpr instanceof Identifier.IdentifierArrayExpr) {
      List<String> targetColNames = ((Identifier.IdentifierArrayExpr) targetColExpr).getValue();
      for (String targetColName : targetColNames) {
        Integer colno = getColnoByColName(targetColName);
        if (colno == null) {
          throw new ColumnNotFoundException("doCountPattern(): column not found: " + targetColName);
        }
        targetColnos.add(colno);
      }
    } else {
      throw new WrongTargetColumnExpressionException("doCountPattern(): wrong target column expression: " + targetColExpr.toString());
    }

    if (targetColnos.size() == 0) {
      throw new WrongTargetColumnExpressionException("doCountPattern(): no target column designated: " + targetColExpr.toString());
    }


    newDf.addColumnWithDfAll(this);

    String newColName = "countpattern";
    for (Integer targetColno : targetColnos) {
      newColName += "_" + getColName(targetColno);
    }
    newColName = newDf.addColumn(targetColnos.get(targetColnos.size() - 1) + 1, newColName, ColumnType.LONG);  // 마지막 대상 컬럼 뒤로 삽입
    newDf.newColNames.add(newColName);
    newDf.interestedColNames.add(newColName);

    assert !(expr.toString().equals("''") || expr.toString().equals("//")) : "You can not count empty string!";

    //quote 여부에 다른 처리

    if(quote == null) {
      if (expr instanceof Constant.StringExpr) {
        patternStr = ((Constant.StringExpr) expr).getEscapedValue();

        if (ignoreCase != null && ignoreCase)
          pattern = Pattern.compile(patternStr, Pattern.LITERAL + Pattern.CASE_INSENSITIVE);
        else
          pattern = Pattern.compile(patternStr, Pattern.LITERAL);

      } else if (expr instanceof RegularExpr) {
        patternStr = ((RegularExpr) expr).getEscapedValue();
        pattern = Pattern.compile(patternStr);
      } else {
        throw new IllegalPatternTypeException("deCountPattern(): illegal pattern type: " + expr.toString());
      }

      int lastTargetColno = targetColnos.get(targetColnos.size() - 1);

      for (rowno = 0; rowno < rows.size(); rowno++) {
        Row row = rows.get(rowno);
        Row newRow = new Row();

        // 마지막 대상 컬럼까지만 추가
        for (int colno = 0; colno <= lastTargetColno; colno++) {
          newRow.add(getColName(colno), row.get(colno));
        }

        // 새 컬럼 추가
        long count = 0;

        for (int targetColno : targetColnos) {
          Matcher matcher = pattern.matcher(row.get(targetColno).toString());
          while (matcher.find()) {
            count++;
          }
        }
        newRow.add(newColName, count);

        // 나머지 추가
        for (int colno = lastTargetColno + 1; colno < getColCnt(); colno++) {
          newRow.add(getColName(colno), row.get(colno));
        }
        newDf.rows.add(newRow);
      }
    } else {

      if (expr instanceof Constant.StringExpr) {
        patternStr = ((Constant.StringExpr) expr).getEscapedValue();
        patternStr = disableRegexSymbols(patternStr);

        if (ignoreCase != null && ignoreCase)
          patternStr = makeCaseInsensitive(patternStr);

      } else if (expr instanceof RegularExpr) {
        patternStr = ((RegularExpr) expr).getEscapedValue();
      } else {
        throw new IllegalPatternTypeException("deCountPattern(): illegal pattern type: " + expr.toString());
      }

      if (quote instanceof Constant.StringExpr) {
        quoteStr = ((Constant.StringExpr) quote).getEscapedValue();
        quoteStr = disableRegexSymbols(quoteStr);
      } else if (expr instanceof RegularExpr) {
        quoteStr = ((RegularExpr) quote).getEscapedValue();
      } else {
        throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + quote.toString());
      }

      patternStr = compilePatternWithQuote(patternStr, quoteStr);
      pattern = Pattern.compile(patternStr);

      int lastTargetColno = targetColnos.get(targetColnos.size() - 1);

      for (rowno = 0; rowno < rows.size(); rowno++) {
        Row row = rows.get(rowno);
        Row newRow = new Row();

        // 마지막 대상 컬럼까지만 추가
        for (int colno = 0; colno <= lastTargetColno; colno++) {
          newRow.add(getColName(colno), row.get(colno));
        }

        // 새 컬럼 추가
        long count = 0;

        for (int targetColno : targetColnos) {
          String targetStr = row.get(targetColno).toString();

          if (StringUtils.countMatches(targetStr, quoteStr) % 2 != 0) {
            targetStr = targetStr.substring(0, targetStr.lastIndexOf(quoteStr));
          }

          Matcher matcher = pattern.matcher(targetStr);
          while (matcher.find()) {
            count++;
          }
        }
        newRow.add(newColName, count);

        // 나머지 추가
        for (int colno = lastTargetColno + 1; colno < getColCnt(); colno++) {
          newRow.add(getColName(colno), row.get(colno));
        }
        newDf.rows.add(newRow);
      }
    }

    return newDf;
  }

  private void putReplacedConditions(String targetColName, String ruleString, Map<String, Expr> rowConditionExprs) throws TeddyException {
    Rule rule = new RuleVisitorParser().parse(ruleString);
    Expression conditionExpr = ((Replace) rule).getRow();
    replace$col(conditionExpr, targetColName);
    rowConditionExprs.put(targetColName, (Expr) conditionExpr);
  }

  public DataFrame doReplace(Replace replace, String ruleString) throws TeddyException {
    List<String> targetColNames = new ArrayList<>();
    Map<String, Expr> replacedConditionExprs = new HashMap<>();
    Expression targetColExpr = replace.getCol();
    Expression expr = replace.getOn();
    Expression withExpr = replace.getWith();
    Expression quote = replace.getQuote();
    Boolean globalReplace = replace.getGlobal();
    Boolean isCaseIgnore = replace.getIgnoreCase();
    String patternStr;
    String quoteStr;
    Pattern pattern;
    DataFrame newDf = new DataFrame();
    int rowno, colno;

    if (targetColExpr instanceof Identifier.IdentifierExpr) {
      targetColNames.add(((Identifier.IdentifierExpr) targetColExpr).getValue());
    } else if (targetColExpr instanceof Identifier.IdentifierArrayExpr) {
      targetColNames.addAll(((Identifier.IdentifierArrayExpr) targetColExpr).getValue());
    } else {
      throw new WrongTargetColumnExpressionException("doReplace(): wrong target column expression: " + targetColExpr.toString());
    }

    for (String targetColName : targetColNames) {
      //Type Check
      if (getColTypeByColName(targetColName) != ColumnType.STRING) {
        throw new WorksOnlyOnStringException("doReplace(): works only on STRING: " + getColTypeByColName(targetColName));
      }
      //Highlighted Column List
      newDf.interestedColNames.add(targetColName);

      //Build Condition Expression
      putReplacedConditions(targetColName, ruleString, replacedConditionExprs);
    }

    newDf.addColumnWithDfAll(this);
    for (rowno = 0; rowno < rows.size(); rowno++) {
      Row row = rows.get(rowno);
      Row newRow = new Row();
      for (colno = 0; colno < getColCnt(); colno++) {
        newRow.add(getColName(colno), row.get(colno));
      }
      newDf.rows.add(newRow);
    }

    assert !(expr.toString().equals("''") || expr.toString().equals("//")) : "You can not replace empty string!";

    //quote 문자가 없을 경우의 처리.

    if(quote == null) {
      if (expr instanceof Constant.StringExpr) {
        patternStr = ((Constant.StringExpr) expr).getEscapedValue();

        if (isCaseIgnore != null && isCaseIgnore)
          pattern = Pattern.compile(patternStr, Pattern.LITERAL + Pattern.CASE_INSENSITIVE);
        else
          pattern = Pattern.compile(patternStr, Pattern.LITERAL);

      } else if (expr instanceof RegularExpr) {
        patternStr = ((RegularExpr) expr).getEscapedValue();
        pattern = Pattern.compile(patternStr);
      } else {
        throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + expr.toString());
      }

      for (rowno = 0; rowno < newDf.rows.size(); rowno++) {
        Row row = newDf.rows.get(rowno);
        for (String targetColName : targetColNames) {
          String targetStr = (String) row.get(targetColName);
          if (targetStr == null || !checkCondition(replacedConditionExprs.get(targetColName), row)) {
            continue;
          }
          Matcher matcher = pattern.matcher(targetStr);
          if (matcher.find()) {
            if (globalReplace) {
              row.set(targetColName, matcher.replaceAll(((Expr) withExpr).eval(rows.get(rowno)).stringValue()));
            } else {
              row.set(targetColName, matcher.replaceFirst(((Expr) withExpr).eval(rows.get(rowno)).stringValue()));
            }
          }
        }
      }
    } else { //quote 문자가 있을 경우의 처리(정규식으로 quote를 처리해야 해서 Pattern.compile 사용 불가)
      if (expr instanceof Constant.StringExpr) {
        patternStr = ((Constant.StringExpr) expr).getEscapedValue();
        patternStr = disableRegexSymbols(patternStr);

        if (isCaseIgnore != null && isCaseIgnore)
          patternStr = makeCaseInsensitive(patternStr);

      } else if (expr instanceof RegularExpr) {
        patternStr = ((RegularExpr) expr).getEscapedValue();
      } else {
        throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + expr.toString());
      }

      if (quote instanceof Constant.StringExpr) {
        quoteStr = ((Constant.StringExpr) quote).getEscapedValue();
        quoteStr = disableRegexSymbols(quoteStr);
      } else if (expr instanceof RegularExpr) {
        quoteStr = ((RegularExpr) quote).getEscapedValue();
      } else {
        throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + quote.toString());
      }

      patternStr = compilePatternWithQuote(patternStr, quoteStr);
      pattern = Pattern.compile(patternStr);

      for (rowno = 0; rowno < newDf.rows.size(); rowno++) {
        Row row = newDf.rows.get(rowno);
        for (String targetColName : targetColNames) {
          String targetStr = (String) row.get(targetColName);
          if (targetStr == null || !checkCondition(replacedConditionExprs.get(targetColName), row)) {
            continue;
          }
          if(StringUtils.countMatches(targetStr, quoteStr)%2 == 0){
            Matcher matcher = pattern.matcher(targetStr);
            if (matcher.find()) {
              if (globalReplace) {
                row.set(targetColName, matcher.replaceAll(((Expr) withExpr).eval(rows.get(rowno)).stringValue()));
              } else {
                row.set(targetColName, matcher.replaceFirst(((Expr) withExpr).eval(rows.get(rowno)).stringValue()));
              }
            }
          } else {//quote가 홀수개일 때는 마지막 quote 이후의 문자열은 처리 하지 않는다.
            String targetStr2 = targetStr.substring(targetStr.lastIndexOf(quoteStr));
            targetStr = targetStr.substring(0, targetStr.lastIndexOf(quoteStr));

            Matcher matcher = pattern.matcher(targetStr);
            if (matcher.find()) {
              if (globalReplace) {
                row.set(targetColName, matcher.replaceAll(((Expr) withExpr).eval(rows.get(rowno)).stringValue()) + targetStr2);
              } else {
                row.set(targetColName, matcher.replaceFirst(((Expr) withExpr).eval(rows.get(rowno)).stringValue()) + targetStr2);
              }
            }
          }
        }
      }
    }
    return newDf;
  }

  public DataFrame doNest(Nest nest) throws TeddyException {
    Expression targetExpr = nest.getCol();
    List<String> targetColNames = new ArrayList<>();
    String into = nest.getInto();
    String newColName = nest.getAs().replaceAll("'", "");
    DataFrame newDf = new DataFrame();
    int rowno, colno;

    if (targetExpr instanceof Identifier.IdentifierExpr) {
      targetColNames.add(((Identifier.IdentifierExpr) targetExpr).getValue());
    } else if (targetExpr instanceof Identifier.IdentifierArrayExpr) {
      targetColNames.addAll(((Identifier.IdentifierArrayExpr) targetExpr).getValue());
    } else {
      assert false : targetExpr;
    }

    // 마지막 목적 컬럼까지만 추가 하기 위해
    int lastTargetColno = 0;
    for (String targetColName : targetColNames) {
      colno = getColnoByColName(targetColName);
      if (colno > lastTargetColno) {
        lastTargetColno = colno;
      }
    }
    newDf.addColumnWithDfAll(this);

    ColumnType newColType = into.equalsIgnoreCase("ARRAY") ? ColumnType.ARRAY : ColumnType.MAP;
    ColumnDescription newColDesc = new ColumnDescription(newColType, null); // array, map 자체엔 timestamp style이 없다.

    if (newColType == ColumnType.ARRAY) {
      List<ColumnDescription> arrColDesc = new ArrayList<>();
      for (String targetColName : targetColNames) {
        ColumnDescription colDesc = getColDescByColName(targetColName);
        arrColDesc.add(colDesc);
      }
      newColDesc.setArrColDesc(arrColDesc);
    } else {
      Map<String, ColumnDescription> mapColDesc = new HashMap<>();
      for (String targetColName : targetColNames) {
        ColumnDescription colDesc = getColDescByColName(targetColName);
        mapColDesc.put(targetColName, colDesc);
      }
      newColDesc.setMapColDesc(mapColDesc);
    }
    newColName = newDf.addColumn(lastTargetColno + 1, newColName, newColDesc);  // 중간 삽입 (이후 컬럼들은 뒤로 밀림)
    newDf.interestedColNames.add(newColName);

    for (rowno = 0; rowno < rows.size(); rowno++) {
      Row row  = rows.get(rowno);
      Row newRow = new Row();

      // 마지막 목적 컬럼까지만 추가
      for (colno = 0; colno <= lastTargetColno; colno++) {
        newRow.add(getColName(colno), row.get(colno));
      }

      // 새 컬럼 추가
      if (newColType == ColumnType.ARRAY) {
        List<Object> arr = new ArrayList();
        for (String colName : targetColNames) {
          arr.add(row.get(colName));
        }
        newRow.add(newColName, arr);
      } else {
        Map<String, Object> map = new HashMap();
        for (String colName : targetColNames) {
          map.put(colName, row.get(colName));
        }
        newRow.add(newColName, map);
      }

      // 나머지 추가
      for (colno = lastTargetColno + 1; colno < getColCnt(); colno++) {
        newRow.add(getColName(colno), row.get(colno));
      }
      newDf.rows.add(newRow);
    }
    return newDf;
  }

  private String checkRightColName(String rightColName) throws TeddyException {
    if (colsContains(rightColName)) {
      return checkRightColName("r_" + rightColName);
    }
    return rightColName;
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

  public DataFrame doUnnest(Unnest unnest) throws TeddyException {
    String targetColName = unnest.getCol();
    int targetColno = -1;
    Expression idx = unnest.getIdx(); // constant numeric, literal, numeric as literal  --> 정작 array가 필요
    int rowno, colno;

    targetColno = getColnoByColName(targetColName);
    if (getColType(targetColno) != ColumnType.ARRAY && getColType(targetColno) != ColumnType.MAP) {
      throw new WorksOnlyOnArrayOrMapException("doUnnest(): works only on ARRAY/MAP: " + getColType(targetColno));
    }

    int arrayIdx = -1;
    String mapKey = null;   // if null -> array
    String newColName;
    ColumnDescription colDesc = getColDesc(targetColno);
    ColumnDescription newColDesc;

    if (getColType(targetColno) == ColumnType.ARRAY) {
      // 컬럼이름은 언제나 unnest_0
      // row별로 fetch는 arrayIdx로
      if (idx instanceof Constant.StringExpr) {   // supports StringExpr for backward-compatability
        arrayIdx = Integer.valueOf(((Constant.StringExpr) idx).getEscapedValue());
      } else if (idx instanceof Constant.LongExpr) {
        arrayIdx = ((Long)((Constant.LongExpr) idx).getValue()).intValue();
      } else {
        throw new InvalidIndexTypeException("doUnnest(): invalid index type: " + idx.toString());
      }
      newColName = modifyDuplicatedColName("unnest_" + arrayIdx);
    } else {
      // row별로 fetch는 mapKey로, 컬럼이름은 mapKey를 기존컬럼과 안겹치게 변형한 것
      if (idx instanceof Identifier.IdentifierExpr) {
        throw new IdxOnMapTypeShouldBeStringException("doUnnest(): idx on MAP type should be STRING (maybe, this is a column name): " + ((Identifier.IdentifierExpr) idx).getValue());
      } else if (idx instanceof Constant.StringExpr) {
        mapKey = ((Constant.StringExpr) idx).getEscapedValue();
        newColName = modifyDuplicatedColName("unnest_" + mapKey);
      } else {
        throw new IdxOnMapTypeShouldBeStringException("doUnnest(): idx on MAP type should be STRING: " + idx.toString());
      }
    }

    DataFrame newDf = new DataFrame();
    newDf.addColumnWithDfAll(this);

    if (mapKey == null) {
      newColDesc = colDesc.getArrColDesc().get(arrayIdx);
    } else {
      newColDesc = colDesc.getMapColDesc().get(mapKey);
    }
    assert newColDesc != null : getColName(targetColno);
    newColName = newDf.addColumn(targetColno + 1, newColName, newColDesc);

    newDf.newColNames.add(newColName);
    newDf.interestedColNames.add(newColName);

    for (rowno = 0; rowno < rows.size(); rowno++) {
      Row row = rows.get(rowno);
      Row newRow = new Row();

      // 목적 컬럼까지만 추가
      for (colno = 0; colno <= targetColno; colno++) {
        newRow.add(getColName(colno), row.get(colno));
      }

      // 새 컬럼 추가
      if (mapKey == null) {
        List arr = (List) row.get(targetColno);
        if (arrayIdx >= arr.size()) {
          throw new WrongArrayIndexException(String.format("doUnnest(): arrayIdx > array length: idx=%d len=%d rowno=%d", arrayIdx, arr.size(), rowno));
        }
        Object obj = arr.get(arrayIdx);
        newRow.add(newColName, obj);
      } else {
        Map<String, Object> map = (Map<String, Object>) row.get(targetColno);
        if (!map.containsKey(mapKey)) {
          throw new WrongMapKeyException("doUnnest(): the map value does not have the requested key: " + mapKey);
        }
        Object obj = map.get(mapKey);
        newRow.add(newColName, obj);
      }

      // 나머지 추가
      for (colno = targetColno + 1; colno < getColCnt(); colno++) {
        newRow.add(getColName(colno), row.get(colno));
      }

      newDf.rows.add(newRow);
    }
    return newDf;
  }

  public DataFrame doFlatten(Flatten flatten, int limitRows) throws TeddyException {
    String targetColName = flatten.getCol();
    int targetColno = -1;
    int colno;

    for (colno = 0; colno < getColCnt(); colno++) {
      if (getColName(colno).equals(targetColName)) {
        if (getColType(colno) != ColumnType.ARRAY) {
          throw new WorksOnlyOnArrayException("doFlatten(): works only on ARRAY: " + getColType(colno));
        }
        targetColno = colno;
        break;
      }
    }
    if (colno == getColCnt()) {
      throw new ColumnNotFoundException("doFlatten(): column not found: " + targetColName);
    }

    DataFrame newDf = new DataFrame();

    // 컬럼 이름이 바뀌는 일은 없음
    newDf.interestedColNames.add(targetColName);

    for (colno = 0; colno < getColCnt(); colno++) {
      if (getColName(colno).equals(targetColName)) {
        newDf.addColumn(getColName(colno), ColumnType.STRING);    // TODO: 일단 모두 STRING으로 처리.
                                                                  // 모두 동일한 type, timestamp style을 갖고 있을 가능성이 크고,
                                                                  // 아니더라도 mismatch 처리하면 되지만.. 일단 STRING으로 처리.
      } else {
        newDf.addColumnWithDf(this, colno);
      }
    }

    Iterator<Row> iter = rows.iterator();
    Row row;     // of aggregatedDf
    Row newRow;  // of pivotedDf
    while (iter.hasNext()) {
      if (newDf.rows.size() >= limitRows) {
        break;
      }
      row = iter.next();  // of aggregatedDf
      ArrayList targetObj = (ArrayList)(row.get(targetColno));

      for (Object obj : targetObj) {
        String value = obj.toString();
        newRow = new Row();
        for (colno = 0; colno < getColCnt(); colno++) {
          String colName = getColName(colno);
          if (colno == targetColno) {
            newRow.add(colName, value);
          } else {
            newRow.add(colName, row.get(getColName(colno)));
          }
        }
        newDf.rows.add(newRow);
      }
    }
    return newDf;
  }

  public DataFrame doMerge(Merge merge) throws TeddyException {
    Expression targetExpr = merge.getCol();
    String with = merge.getWith().replaceAll("'", "");
    String newColName = merge.getAs().replaceAll("'", "");
    DataFrame newDf = new DataFrame();
    int rowno, colno;

    List<String> targetColNames = new ArrayList<>();
    if (targetExpr instanceof Identifier.IdentifierExpr) {
      targetColNames.add(((Identifier.IdentifierExpr) targetExpr).getValue());
    } else if (targetExpr instanceof Identifier.IdentifierArrayExpr) {
      targetColNames.addAll(((Identifier.IdentifierArrayExpr) targetExpr).getValue());
    }
    if (targetColNames.size() == 0) {
      throw new NoInputColumnDesignatedException("doMerge(): no input column designated");
    }

    for (String colName : targetColNames) {
      if (!colsContains(colName)) {
        throw new ColumnNotFoundException("doMerge(): column not found: " + colName);
      }
    }

    // 마지막 목적 컬럼까지만 추가 하기 위해
    int lastTargetColno = 0;
    for (int i = 0; i < getColCnt(); i++) {
      if (getColName(i).equals(targetColNames.get(targetColNames.size() - 1))) {
        lastTargetColno = i;
        break;
      }
    }

    newDf.addColumnWithDfAll(this);
    newColName = newDf.addColumn(lastTargetColno + 1, newColName, ColumnType.STRING);  // 중간 삽입
    newDf.interestedColNames.add(newColName);

    for (rowno = 0; rowno < rows.size(); rowno++) {
      Row row = rows.get(rowno);
      Row newRow = new Row();

      // 마지막 목적 컬럼까지만 추가
      for (colno = 0; colno <= lastTargetColno; colno++) {
        newRow.add(getColName(colno), row.get(colno));
      }

      // 새 컬럼 추가
      StringBuilder sb = new StringBuilder();
      sb.append(row.get(targetColNames.get(0)));

      for (int i = 1; i < targetColNames.size(); i++) {
        sb.append(with).append(row.get(targetColNames.get(i)));
      }
      newRow.add(newColName, sb.toString());

      // 나머지 추가
      for (colno = lastTargetColno + 1; colno < getColCnt(); colno++) {
        newRow.add(getColName(colno), row.get(colno));
      }

      newDf.rows.add(newRow);
    }
    return newDf;
  }

  public DataFrame doSplit(Split split) throws TeddyException {
    String targetColName = split.getCol();
    Expression expr = split.getOn();
    Expression quote = split.getQuote();
    Integer limit = split.getLimit();
    Boolean ignoreCase = split.getIgnoreCase();
    String patternStr;
    String quoteStr;
    int targetColno = -1;
    int rowno, colno;
    int index;

    if (limit==null) {
      limit = 0;
    }

    for (colno = 0; colno < getColCnt(); colno++) {
      if (getColName(colno).equals(targetColName)) {
        if (getColType(colno) != ColumnType.STRING) {
          throw new WorksOnlyOnStringException("doSplit(): works only on STRING: " + getColType(colno));
        }
        targetColno = colno;
        break;
      }
    }

    if (colno == getColCnt()) {
      throw new ColumnNotFoundException("doSplit(): column not found: " + targetColName);
    }
    DataFrame newDf = new DataFrame();
    newDf.addColumnWithDfAll(this);

    for (int i = 1; i <= limit + 1; i++) {
      String newColName = "split_" + targetColName + i;
      newColName = newDf.addColumn(targetColno + i, newColName, ColumnType.STRING);  // 중간 삽입
      newDf.newColNames.add(newColName);
      newDf.interestedColNames.add(newColName);
    }

    assert !(expr.toString().equals("''") || expr.toString().equals("//")) : "You can not replace empty string!";

    //패턴에 대한 처리. 1. 문자열 1-1. 대소문자 무시 2.정규식
    if (expr instanceof Constant.StringExpr) {
      patternStr = ((Constant.StringExpr) expr).getEscapedValue();
      patternStr = disableRegexSymbols(patternStr);

      if(ignoreCase!=null && ignoreCase)
        patternStr = makeCaseInsensitive(patternStr);

    } else if (expr instanceof RegularExpr) {
      patternStr = ((RegularExpr) expr).getEscapedValue();
    } else {
      throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + expr.toString());
    }

    //콰트에 대한 처리. 1. 문자열 2.정규식
    if(quote == null) {
      quoteStr ="";
    }
    else if (quote instanceof Constant.StringExpr) {
      quoteStr = ((Constant.StringExpr) quote).getEscapedValue();
      quoteStr = disableRegexSymbols(quoteStr);
    } else if (expr instanceof RegularExpr) {
      quoteStr = ((RegularExpr) quote).getEscapedValue();
    } else {
      throw new IllegalPatternTypeException("deReplace(): illegal pattern type: " + quote.toString());
    }

    if(quoteStr != "")
      patternStr = compilePatternWithQuote(patternStr, quoteStr);

    for (rowno = 0; rowno < rows.size(); rowno++) {
      Row row = rows.get(rowno);
      Row newRow = new Row();

      // 목적 컬럼까지만 추가
      for (colno = 0; colno <= targetColno; colno++) {
        newRow.add(getColName(colno), row.get(colno));
      }

      String targetStr = (String)row.get(targetColno);
      String[] tokens = new String[limit+1];
      index = 0;

      if(StringUtils.countMatches(targetStr, quoteStr)%2 == 0) {
        String[] tempTokens = targetStr.split(patternStr, limit+1);
        if(tempTokens.length<=limit) {
          for(index=0; index<tempTokens.length; index++) {
            tokens[index] = tempTokens[index];
          }
        } else
          tokens=tempTokens;
      } else {
        int lastQuoteMark = targetStr.lastIndexOf(quoteStr);

        String[] firstHalf = targetStr.substring(0, lastQuoteMark).split(patternStr, limit+1);

        for(int i=0; i < firstHalf.length; i++) {
          tokens[i] = firstHalf[i];
          index = i;
        }
        tokens[index]=tokens[index]+targetStr.substring(lastQuoteMark);
      }

      // 새 컬럼들 추가
      for (int i = 0; i <= limit; i++) {
        newRow.add(newDf.newColNames.get(i), tokens[i]);
      }

      // 나머지 추가
      for (colno = targetColno + 1; colno < getColCnt(); colno++) {
        newRow.add(getColName(colno), row.get(colno));
      }

      newDf.rows.add(newRow);
    }

    return newDf;
  }

  protected String stripSingleQuote(String str) {
    if(str.indexOf("'") == 0)
      return str.substring(str.indexOf("'") + 1, str.lastIndexOf("'"));
    else
      return str;
  }

  protected void aggregate(DataFrame prevDf, List<String> groupByColNames, List<String> targetExprStrs) throws TeddyException, InterruptedException {
    List<Integer> groupByColnos = new ArrayList<>();
    List<Integer> targetAggrColnos = new ArrayList<>();   // 각 aggrValue는 1개의 target column을 가짐
    List<AggrType> targetAggrTypes = new ArrayList<>();
    List<String> resultColNames = new ArrayList<>();
    List<ColumnType> resultColTypes = new ArrayList<>();
    Map<Object, Object> groupByBuckets = new HashMap<>();
    int rowno, colno;

    // aggregation expression strings -> target aggregation types, target colnos, result colnames, result coltypes
    for (int i = 0; i < targetExprStrs.size(); i++) {
      String targetExprStr = stripSingleQuote(targetExprStrs.get(i));
      AggrType aggrType;
      String targetColName;
      if (targetExprStr.toUpperCase().startsWith("COUNT")) {
        aggrType = AggrType.COUNT;
        resultColNames.add(modifyDuplicatedColName("count"));
        resultColTypes.add(ColumnType.LONG);
        targetAggrColnos.add(-1);
      } else {
        Pattern pattern = Pattern.compile("\\w+\\((\\w+)\\)");
        Matcher matcher = pattern.matcher(targetExprStr);
        if (matcher.find() == false) {
          throw new IllegalAggregationFunctionExpression("doAggregateInternal(): invalid aggregation function expression: " + targetExprStr.toString());
        }

        if (targetExprStr.toUpperCase().startsWith(AggrType.SUM.name())) {
          aggrType = AggrType.SUM;
        } else if (targetExprStr.toUpperCase().startsWith(AggrType.AVG.name())) {
          aggrType = AggrType.AVG;
        } else if (targetExprStr.toUpperCase().startsWith(AggrType.MIN.name())) {
          aggrType = AggrType.MIN;
        } else if (targetExprStr.toUpperCase().startsWith(AggrType.MAX.name())) {
          aggrType = AggrType.MAX;
        } else {
          throw new ColumnNotFoundException("doAggregateInternal(): aggregation column not found: " + targetExprStr);
        }

        targetColName = matcher.group(1);
        for (colno = 0; colno < prevDf.getColCnt(); colno++) {
          String colName = prevDf.getColName(colno);
          if (colName.equals(targetColName)) {
            targetAggrColnos.add(colno);
            resultColNames.add(modifyDuplicatedColName(aggrType.name().toLowerCase() + "_" + colName));
            resultColTypes.add((aggrType == AggrType.AVG) ? ColumnType.DOUBLE : prevDf.getColType(colno));
            break;
          }
        }
        if (colno == prevDf.getColCnt()) {
          throw new TargetColumnNotFoundException("doAggregateInternal(): aggregation target column not found: " + targetColName);
        }
      }
      targetAggrTypes.add(aggrType);
    }

    // Group-by 컬럼 먼저 추가
    for (int i = 0; i < groupByColNames.size(); i++) {
      String groupByColName = groupByColNames.get(i);
      for (colno = 0; colno < prevDf.getColCnt(); colno++) {
        if (prevDf.getColName(colno).equals(groupByColName)) {
          groupByColnos.add(colno);
          addColumnWithDf(prevDf, colno);
          break;
        }
      }
      if (colno == prevDf.getColCnt()) {
        throw new GroupByColumnNotFoundException("doAggregateInternal(): group by column not found: " + groupByColName);
      }
    }

    // 그 다음에 aggregated 컬럼 추가
    for (int i = 0; i < resultColNames.size(); i++) {
      addColumn(resultColNames.get(i), resultColTypes.get(i));
    }

    for (rowno = 0; rowno < prevDf.rows.size(); cancelCheck(rowno++)) {
      Row row = prevDf.rows.get(rowno);
      List<Object> groupByKey = new ArrayList<>();
      for (int i = 0; i < groupByColnos.size(); i++) {
        groupByKey.add(row.get(groupByColnos.get(i)));
      }

      if (groupByBuckets.containsKey(groupByKey)) {
        List<Object> aggregatedValues = (List<Object>) groupByBuckets.get(groupByKey);
        for (int j = 0; j < targetAggrTypes.size(); j++) {
          if (targetAggrTypes.get(j) == AggrType.AVG) {
            Map<String, Object> avgObj = (Map<String, Object>) aggregatedValues.get(j);
            avgObj.put("count", (Long)avgObj.get("count") + 1);
            if (resultColTypes.get(j) == ColumnType.LONG) {
              avgObj.put("sum", (Long)avgObj.get("sum") + (Long)row.get(targetAggrColnos.get(j)));
            } else {
              if (prevDf.getColType(targetAggrColnos.get(j)) == ColumnType.LONG) {
                avgObj.put("sum", (Double)avgObj.get("sum") + Double.valueOf((Long)row.get(targetAggrColnos.get(j))));
              } else {
                avgObj.put("sum", (Double) avgObj.get("sum") + (Double) row.get(targetAggrColnos.get(j)));
              }
            }
            aggregatedValues.set(j, avgObj);
          }
          else if (targetAggrTypes.get(j) == AggrType.COUNT) {
            aggregatedValues.set(j, (Long)aggregatedValues.get(j) + 1);
          }
          else if (targetAggrTypes.get(j) == AggrType.SUM) {
            if (resultColTypes.get(j) == ColumnType.LONG) {
              aggregatedValues.set(j, (Long)aggregatedValues.get(j) + (Long)row.get(targetAggrColnos.get(j)));
            } else {
              aggregatedValues.set(j, (Double)aggregatedValues.get(j) + (Double)row.get(targetAggrColnos.get(j)));
            }
          }
          else if (targetAggrTypes.get(j) == AggrType.MIN) {
            if (resultColTypes.get(j) == ColumnType.LONG) {
              Long newValue = (Long)row.get(targetAggrColnos.get(j));
              if (newValue < (Long)aggregatedValues.get(j)) {
                aggregatedValues.set(j, newValue);
              }
            } else {
              Double newValue = (Double)row.get(targetAggrColnos.get(j));
              if (newValue < (Double)aggregatedValues.get(j)) {
                aggregatedValues.set(j, newValue);
              }
            }
          }
          else if (targetAggrTypes.get(j) == AggrType.MAX) {
            if (resultColTypes.get(j) == ColumnType.LONG) {
              Long newValue = (Long)row.get(targetAggrColnos.get(j));
              if (newValue > (Long)aggregatedValues.get(j)) {
                aggregatedValues.set(j, newValue);
              }
            } else {
              Double newValue = (Double)row.get(targetAggrColnos.get(j));
              if (newValue > (Double)aggregatedValues.get(j)) {
                aggregatedValues.set(j, newValue);
              }
            }
          }
        }
        groupByBuckets.put(groupByKey, aggregatedValues);
      } // end of containes groupByKey
      else {  // belows are for new groupByKey
        List<Object> aggregatedValues = new ArrayList<>();
        for (int j = 0; j < targetAggrTypes.size(); j++) {
          if (targetAggrTypes.get(j) == AggrType.AVG) {
            Map<String, Object> avgObj = new HashMap();
            avgObj.put("count", Long.valueOf(1));
            if (prevDf.getColType(targetAggrColnos.get(j)) == ColumnType.LONG) {
              avgObj.put("sum", Double.valueOf((Long)row.get(targetAggrColnos.get(j))));
            } else {
              avgObj.put("sum", row.get(targetAggrColnos.get(j)));
            }
            aggregatedValues.add(avgObj);
          }
          else if (targetAggrTypes.get(j) == AggrType.COUNT) {
            aggregatedValues.add(Long.valueOf(1));
          }
          else {
            aggregatedValues.add(row.get(targetAggrColnos.get(j)));
          }
        }
        groupByBuckets.put(groupByKey, aggregatedValues);
      }
    }

    for (Map.Entry<Object, Object> elem : groupByBuckets.entrySet()) {
      Row newRow = new Row();
      List<Object> aggregatedValues = (List<Object>)elem.getValue();

      int i = 0;
      for (Object groupByValue : (List<Object>) elem.getKey()) {
        newRow.add(groupByColNames.get(i++), groupByValue);
      }

      for (i = 0; i < aggregatedValues.size(); i++) {
        if (targetAggrTypes.get(i) == AggrType.AVG) {
          Map<String, Object> avgObj = (Map<String, Object>) aggregatedValues.get(i);
          Double sum = (Double)avgObj.get("sum");
          Long count = (Long)avgObj.get("count");
          Double avg = BigDecimal.valueOf(sum / count).setScale(2, RoundingMode.HALF_UP).doubleValue();
          newRow.add(resultColNames.get(i), avg);
        } else {
          newRow.add(resultColNames.get(i), aggregatedValues.get(i));
        }
      }
      rows.add(newRow);
      cancelCheck();
    }
  }

  private DataFrame doAggregateInternal(List<String> groupByColNames, List<String> targetExprStrs) throws TeddyException {
    List<Integer> groupByColnos = new ArrayList<>();
    List<Integer> targetAggrColnos = new ArrayList<>();   // 각 aggrValue는 1개의 target column을 가짐
    List<AggrType> targetAggrTypes = new ArrayList<>();
    List<String> resultColNames = new ArrayList<>();
    List<ColumnType> resultColTypes = new ArrayList<>();
    Map<Object, Object> groupByBuckets = new HashMap<>();
    int rowno, colno;

    // aggregation expression strings -> target aggregation types, target colnos, result colnames, result coltypes
    for (int i = 0; i < targetExprStrs.size(); i++) {
      String targetExprStr = stripSingleQuote(targetExprStrs.get(i));
      AggrType aggrType;
      String targetColName;
      if (targetExprStr.toUpperCase().startsWith("COUNT")) {
        aggrType = AggrType.COUNT;
        resultColNames.add(modifyDuplicatedColName("count"));
        resultColTypes.add(ColumnType.LONG);
        targetAggrColnos.add(-1);
      } else {
        Pattern pattern = Pattern.compile("\\w+\\((\\w+)\\)");
        Matcher matcher = pattern.matcher(targetExprStr);
        if (matcher.find() == false) {
          throw new IllegalAggregationFunctionExpression("doAggregateInternal(): invalid aggregation function expression: " + targetExprStr.toString());
        }

        if (targetExprStr.toUpperCase().startsWith(AggrType.SUM.name())) {
          aggrType = AggrType.SUM;
        } else if (targetExprStr.toUpperCase().startsWith(AggrType.AVG.name())) {
          aggrType = AggrType.AVG;
        } else if (targetExprStr.toUpperCase().startsWith(AggrType.MIN.name())) {
          aggrType = AggrType.MIN;
        } else if (targetExprStr.toUpperCase().startsWith(AggrType.MAX.name())) {
          aggrType = AggrType.MAX;
        } else {
          throw new ColumnNotFoundException("doAggregateInternal(): aggregation column not found: " + targetExprStr);
        }

        targetColName = matcher.group(1);
        for (colno = 0; colno < getColCnt(); colno++) {
          String colName = getColName(colno);
          if (colName.equals(targetColName)) {
            targetAggrColnos.add(colno);
            resultColNames.add(modifyDuplicatedColName(aggrType.name().toLowerCase() + "_" + colName));
            resultColTypes.add((aggrType == AggrType.AVG) ? ColumnType.DOUBLE : getColType(colno));
            break;
          }
        }
        if (colno == getColCnt()) {
          throw new TargetColumnNotFoundException("doAggregateInternal(): aggregation target column not found: " + targetColName);
        }
      }
      targetAggrTypes.add(aggrType);
    }

    DataFrame newDf = new DataFrame();

    // Group-by 컬럼 먼저 추가
    for (int i = 0; i < groupByColNames.size(); i++) {
      String groupByColName = groupByColNames.get(i);
      for (colno = 0; colno < getColCnt(); colno++) {
        if (getColName(colno).equals(groupByColName)) {
          groupByColnos.add(colno);
          newDf.addColumnWithDf(this, colno);
          break;
        }
      }
      if (colno == getColCnt()) {
        throw new GroupByColumnNotFoundException("doAggregateInternal(): group by column not found: " + groupByColName);
      }
    }

    // 그 다음에 aggregated 컬럼 추가
    for (int i = 0; i < resultColNames.size(); i++) {
      newDf.addColumn(resultColNames.get(i), resultColTypes.get(i));
    }

    for (rowno = 0; rowno < rows.size(); rowno++) {
      Row row = rows.get(rowno);
      List<Object> groupByKey = new ArrayList<>();
      for (int i = 0; i < groupByColnos.size(); i++) {
        groupByKey.add(row.get(groupByColnos.get(i)));
      }

      if (groupByBuckets.containsKey(groupByKey)) {
        List<Object> aggregatedValues = (List<Object>) groupByBuckets.get(groupByKey);
        for (int j = 0; j < targetAggrTypes.size(); j++) {
          if (targetAggrTypes.get(j) == AggrType.AVG) {
            Map<String, Object> avgObj = (Map<String, Object>) aggregatedValues.get(j);
            avgObj.put("count", (Long)avgObj.get("count") + 1);
            if (resultColTypes.get(j) == ColumnType.LONG) {
              avgObj.put("sum", (Long)avgObj.get("sum") + (Long)row.get(targetAggrColnos.get(j)));
            } else {
              if (getColType(targetAggrColnos.get(j)) == ColumnType.LONG) {
                avgObj.put("sum", (Double)avgObj.get("sum") + Double.valueOf((Long)row.get(targetAggrColnos.get(j))));
              } else {
                avgObj.put("sum", (Double) avgObj.get("sum") + (Double) row.get(targetAggrColnos.get(j)));
              }
            }
            aggregatedValues.set(j, avgObj);
          }
          else if (targetAggrTypes.get(j) == AggrType.COUNT) {
            aggregatedValues.set(j, (Long)aggregatedValues.get(j) + 1);
          }
          else if (targetAggrTypes.get(j) == AggrType.SUM) {
            if (resultColTypes.get(j) == ColumnType.LONG) {
              aggregatedValues.set(j, (Long)aggregatedValues.get(j) + (Long)row.get(targetAggrColnos.get(j)));
            } else {
              aggregatedValues.set(j, (Double)aggregatedValues.get(j) + (Double)row.get(targetAggrColnos.get(j)));
            }
          }
          else if (targetAggrTypes.get(j) == AggrType.MIN) {
            if (resultColTypes.get(j) == ColumnType.LONG) {
              Long newValue = (Long)row.get(targetAggrColnos.get(j));
              if (newValue < (Long)aggregatedValues.get(j)) {
                aggregatedValues.set(j, newValue);
              }
            } else {
              Double newValue = (Double)row.get(targetAggrColnos.get(j));
              if (newValue < (Double)aggregatedValues.get(j)) {
                aggregatedValues.set(j, newValue);
              }
            }
          }
          else if (targetAggrTypes.get(j) == AggrType.MAX) {
            if (resultColTypes.get(j) == ColumnType.LONG) {
              Long newValue = (Long)row.get(targetAggrColnos.get(j));
              if (newValue > (Long)aggregatedValues.get(j)) {
                aggregatedValues.set(j, newValue);
              }
            } else {
              Double newValue = (Double)row.get(targetAggrColnos.get(j));
              if (newValue > (Double)aggregatedValues.get(j)) {
                aggregatedValues.set(j, newValue);
              }
            }
          }
        }
        groupByBuckets.put(groupByKey, aggregatedValues);
      } // end of containes groupByKey
      else {  // belows are for new groupByKey
        List<Object> aggregatedValues = new ArrayList<>();
        for (int j = 0; j < targetAggrTypes.size(); j++) {
          if (targetAggrTypes.get(j) == AggrType.AVG) {
            Map<String, Object> avgObj = new HashMap();
            avgObj.put("count", Long.valueOf(1));
            if (getColType(targetAggrColnos.get(j)) == ColumnType.LONG) {
              avgObj.put("sum", Double.valueOf((Long)row.get(targetAggrColnos.get(j))));
            } else {
              avgObj.put("sum", row.get(targetAggrColnos.get(j)));
            }
            aggregatedValues.add(avgObj);
          }
          else if (targetAggrTypes.get(j) == AggrType.COUNT) {
            aggregatedValues.add(Long.valueOf(1));
          }
          else {
            aggregatedValues.add(row.get(targetAggrColnos.get(j)));
          }
        }
        groupByBuckets.put(groupByKey, aggregatedValues);
      }
    }

    for (Map.Entry<Object, Object> elem : groupByBuckets.entrySet()) {
      Row newRow = new Row();
      List<Object> aggregatedValues = (List<Object>)elem.getValue();

      int i = 0;
      for (Object groupByValue : (List<Object>) elem.getKey()) {
        newRow.add(groupByColNames.get(i++), groupByValue);
      }

      for (i = 0; i < aggregatedValues.size(); i++) {
        if (targetAggrTypes.get(i) == AggrType.AVG) {
          Map<String, Object> avgObj = (Map<String, Object>) aggregatedValues.get(i);
          Double sum = (Double)avgObj.get("sum");
          Long count = (Long)avgObj.get("count");
          Double avg = BigDecimal.valueOf(sum / count).setScale(2, RoundingMode.HALF_UP).doubleValue();
          newRow.add(resultColNames.get(i), avg);
        } else {
          newRow.add(resultColNames.get(i), aggregatedValues.get(i));
        }
      }
      newDf.rows.add(newRow);
    }
    return newDf;
  }

  public DataFrame doAggregate(Aggregate aggregate) throws TeddyException {
    Expression groupByColExpr = aggregate.getGroup();
    Expression aggrValueExpr = aggregate.getValue();
    List<String> groupByColNames = new ArrayList<>();
    List<String> targetExprStrs = new ArrayList<>();      // sum(x), avg(x), count() 등의 expression string

    // group by expression -> group by colnames
    if (groupByColExpr == null) {
      /* NOP */
    } else if (groupByColExpr instanceof Identifier.IdentifierExpr) {
      groupByColNames.add(((Identifier.IdentifierExpr) groupByColExpr).getValue());
    } else if (groupByColExpr instanceof Identifier.IdentifierArrayExpr) {
      groupByColNames.addAll(((Identifier.IdentifierArrayExpr) groupByColExpr).getValue());
    } else {
      throw new InvalidColumnExpressionTypeException("doAggregate(): invalid group by column expression type: " + groupByColExpr.toString());
    }

    // aggregation value expression -> aggregation expression strings
    if (aggrValueExpr instanceof Constant.StringExpr) {
      targetExprStrs.add((String)(((Constant.StringExpr) aggrValueExpr).getValue()));
    } else if (aggrValueExpr instanceof Constant.ArrayExpr) {
      for (Object obj : ((Constant.ArrayExpr) aggrValueExpr).getValue()) {
        String strAggrValue = (String)obj;
        targetExprStrs.add(strAggrValue);
      }
    } else {
      throw new InvalidAggregationValueExpressionTypeException("doAggregate(): invalid aggregation value expression type: " + aggrValueExpr.toString());
    }
    return doAggregateInternal(groupByColNames, targetExprStrs);
  }

  protected Map<String, Object> buildGroupByKey(Row row, List<String> groupByColNames) {
    Map<String, Object> groupByKey = new HashMap<>();
    for (String groupByColName : groupByColNames) {
      groupByKey.put(groupByColName, row.get(groupByColName));
    }
    return groupByKey;
  }

  protected boolean groupByKeyChanged(Row row, List<String> groupByColNames, Map<String, Object> groupByKey) {
    for (String groupByColName : groupByColNames) {
      if (!groupByKey.get(groupByColName).equals(row.get(groupByColName))) {
        return true;
      }
    }
    return false;
  }

  // row: row from aggregatedDf
  protected Row newPivotRow(Row row, DataFrame pivotDf, List<String> groupByColNames) throws TeddyException {
    Row newRow = new Row();
    int colno;

    for (String groupByColName : groupByColNames) {
      newRow.add(groupByColName, row.get(groupByColName));
    }

    // 일단 기본값으로 깔고, 실제 있는 값을 채우기로 함
    for (colno = groupByColNames.size(); colno < pivotDf.getColCnt(); colno++) {
      ColumnType colType = pivotDf.getColType(colno);
      switch (colType) {
        case DOUBLE:
          newRow.add(pivotDf.getColName(colno), Double.valueOf(0));
          break;
        case LONG:
          newRow.add(pivotDf.getColName(colno), Long.valueOf(0));
          break;
        default:
          throw new ColumnTypeShouldBeDoubleOrLongException("doPivot(): column type of aggregation value should be DOUBLE or LONG: " + colType);
      }
    }
    return newRow;
  }

  protected String buildPivotNewColName(AggrType aggrType, String aggrTargetColName,
                                        List<String> pivotColNames, Row row) throws TeddyException {
    String newColName = null;

    switch (aggrType) {
      case COUNT:
        newColName = "row_count";
        break;
      case SUM:
        newColName = "sum_" + aggrTargetColName;
        break;
      case AVG:
        newColName = "avg_" + aggrTargetColName;
        break;
      case MIN:
        newColName = "min_" + aggrTargetColName;
        break;
      case MAX:
        newColName = "max_" + aggrTargetColName;
        break;
    }

    for (String pivotColName : pivotColNames) {
      newColName += "_" + row.get(pivotColName);
    }
    return modifyDuplicatedColName(newColName);
  }

  public DataFrame doPivot(Pivot pivot) throws TeddyException {
    Expression pivotColExpr = pivot.getCol();
    Expression groupByColExpr = pivot.getGroup();
    Expression aggrValueExpr = pivot.getValue();
    List<String> pivotColNames = new ArrayList<>();
    List<String> groupByColNames = new ArrayList<>();
    List<String> aggrValueStrs = new ArrayList<>();      // sum(x), avg(x), count() 등의 expression string
    List<AggrType> aggrTypes = new ArrayList<>();
    List<String> aggrTargetColNames = new ArrayList<>();
    int colno;

    // group by expression -> group by colnames
    if (groupByColExpr == null) {
      /* NOP */
    } else if (groupByColExpr instanceof Identifier.IdentifierExpr) {
      groupByColNames.add(((Identifier.IdentifierExpr) groupByColExpr).getValue());
    } else if (groupByColExpr instanceof Identifier.IdentifierArrayExpr) {
      groupByColNames.addAll(((Identifier.IdentifierArrayExpr) groupByColExpr).getValue());
    } else {
      throw new InvalidColumnExpressionTypeException("doPivot(): invalid group by column expression type: " + groupByColExpr.toString());
    }

    // pivot target (to-be-column) column expression -> group by colnames
    if (pivotColExpr instanceof Identifier.IdentifierExpr) {
      pivotColNames.add(((Identifier.IdentifierExpr) pivotColExpr).getValue());
    } else if (pivotColExpr instanceof Identifier.IdentifierArrayExpr) {
      pivotColNames.addAll(((Identifier.IdentifierArrayExpr) pivotColExpr).getValue());
    } else {
      throw new InvalidColumnExpressionTypeException("doPivot(): invalid pivot column expression type: " + pivotColExpr.toString());
    }

    // aggregation value expression -> aggregation expression strings
    if (aggrValueExpr instanceof Constant.StringExpr) {
      aggrValueStrs.add((String) (((Constant.StringExpr) aggrValueExpr).getValue()));
    } else if (aggrValueExpr instanceof Constant.ArrayExpr) {
      for (Object obj : ((Constant.ArrayExpr) aggrValueExpr).getValue()) {
        String strAggrValue = (String) obj;
        aggrValueStrs.add(strAggrValue);
      }
    } else {
      throw new InvalidAggregationValueExpressionTypeException("doPivot(): invalid aggregation value expression type: " + aggrValueExpr.toString());
    }

    List<String> mergedGroupByColNames = new ArrayList<>();
    mergedGroupByColNames.addAll(pivotColNames);
    mergedGroupByColNames.addAll(groupByColNames);

    DataFrame aggregatedDf = doAggregateInternal(mergedGroupByColNames, aggrValueStrs);

    // < Command Summary >
    // +--------------+--------------+----------+----------+------------+------------+
    // | pivotTarget1 | pivotTarget2 | groupBy1 | groupBy2 | aggrValue1 | aggrValue2 |
    // +--------------+--------------+----------+----------+------------+------------+
    // |     year     |     month    | priority |  status  | sum(price) |   count()  |
    // +--------------+--------------+----------+----------+------------+------------+
    //
    // < this >
    // +----+----------+--------+-------+------+-------+--------+
    // | id | priority | status | price | year | month | ...    |
    // +----+----------+--------+-------+------+-------+--------+
    // | 01 | high     | good   |   100 | 1992 |    01 | ...    |
    // | 01 | high     | good   |   150 | 1992 |    01 | ...    |
    // | 02 | high     | good   |   200 | 1992 |    02 | ...    |
    // | 03 | low      | bad    |    50 | 1992 |    01 | ...    |
    // +----+----------+--------+-------+------+-------+--------+
    //
    // < aggregatedDf >
    // +----------+--------+------+-------+------------+-------+
    // | priority | status | year | month | sum(price) | count |
    // +----------+--------+------+-------+------------+-------+
    // | high     | good   | 1992 |    01 |        250 |     2 |
    // | high     | good   | 1992 |    02 |        200 |     1 |
    // | low      | bad    | 1992 |    01 |         50 |     1 |
    // +----+----------+--------+-------+------+-------+--------+
    //
    // < pivotedDf>
    // +----------+--------+-------------------+-------------------+-------------------+-------------------+
    // | priority | status | sum_price_1992_01 | sum_price_1992_02 | row_count_1992_01 | row_count_1992_02 |
    // +----------+--------+-------------------+-------------------+-------------------+-------------------+
    // | high     | good   |               250 |               200 |                 2 |                1  |
    // | low      | bad    |                50 |                 0 |                 1 |                0  |
    // +----------+--------+-------------------+-------------------+-------------------+-------------------+

    DataFrame pivotedDf = new DataFrame();

    // 일단 group by column은 column에 추가
    for (String colName : groupByColNames) {
      pivotedDf.addColumn(colName, getColTypeByColName(colName));
    }

    // pivot column을 추가: aggrType은 prefix, distinct value는 surfix -> pivotColNames로 sort해서 진행
    aggregatedDf = aggregatedDf.doSortInternal(pivotColNames, SortType.ASCENDING);

    for (int i = 0; i < aggrValueStrs.size(); i++) {
      String aggrValueStr = stripSingleQuote(aggrValueStrs.get(i));
      AggrType aggrType;
      ColumnType newColType = ColumnType.UNKNOWN;
      String newColName;
      String aggrTargetColName = null;

      if (aggrValueStr.toUpperCase().startsWith("COUNT")) {
        aggrType = AggrType.COUNT;
        newColType = ColumnType.LONG;
      } else {
        if (aggrValueStr.toUpperCase().startsWith(AggrType.SUM.name())) {
          aggrType = AggrType.SUM;
        } else if (aggrValueStr.toUpperCase().startsWith(AggrType.AVG.name())) {
          aggrType = AggrType.AVG;
        } else if (aggrValueStr.toUpperCase().startsWith(AggrType.MIN.name())) {
          aggrType = AggrType.MIN;
        } else if (aggrValueStr.toUpperCase().startsWith(AggrType.MAX.name())) {
          aggrType = AggrType.MAX;
        } else {
          throw new UnsupportedAggregationFunctionExpressionException("doAggregateInternal(): unsupported aggregation function: " + aggrValueStr);
        }

        Pattern pattern = Pattern.compile("\\w+\\((\\w+)\\)");
        Matcher matcher = pattern.matcher(aggrValueStr);
        if (matcher.find() == false) {
          throw new WrongAggregationFunctionExpressionException("doAggregateInternal(): wrong aggregation function expression: " + aggrValueStr);
        }

        aggrTargetColName = matcher.group(1);
        for (colno = 0; colno < getColCnt(); colno++) {
          String colName = getColName(colno);
          if (colName.equals(aggrTargetColName)) {
            newColType = (aggrType == AggrType.AVG) ? ColumnType.DOUBLE : getColType(colno);
            break;
          }
        }
        if (colno == getColCnt()) {
          throw new ColumnNotFoundException("doAggregateInternal(): aggregation target column not found: " + aggrTargetColName);
        }
      }

      Map<String, Object> pivotColGroupKey = null;
      for (Row row : aggregatedDf.rows) {
        //ggregatedDF는 pivotColNames 기준으로 Sorting 되어있는 상태이기 때문에 새로운 조합인지 판단하기 위해서는 전체를 볼 필요 없이 바로 전 row하고만 비교하면 됨.
        if (pivotColGroupKey == null || groupByKeyChanged(row, pivotColNames, pivotColGroupKey)) {
          newColName = buildPivotNewColName(aggrType, aggrTargetColName, pivotColNames, row);

          pivotedDf.addColumn(newColName, newColType);

          pivotColGroupKey = buildGroupByKey(row, pivotColNames);
        }
        if (pivotColGroupKey == null) {
          pivotColGroupKey = buildGroupByKey(row, pivotColNames);
        }
      }

      if (pivotedDf.getColCnt() > 2000) {  // FIXME: hard-cording
        throw new TooManyPivotedColumnsException("doPivot(): too many pivoted column count: " + pivotedDf.getColCnt());
      }

      aggrTypes.add(aggrType);
      aggrTargetColNames.add(aggrTargetColName);
    }

    // group by column, pivot column들을 모두 포함한 row들 생성  -> groupByColNames으로 sort해서 진행
    // aggregatedDf의 row가 더 남지 않을 때까지  를 모두 돌아갈 때까지 pivotDf를 만듦
    aggregatedDf = aggregatedDf.doSortInternal(groupByColNames, SortType.ASCENDING);
    Map<String, Object> groupByKey = null;
    //agrgregatedDF에서 실제 데이터가 위치하는 point를 가르킴.
    int aggregatedDataPointer = mergedGroupByColNames.size();

    Iterator<Row> iter = aggregatedDf.rows.iterator();
    Row row;            // of aggregatedDf
    Row newRow = null;  // of pivotedDf
    while (iter.hasNext()) {
      row = iter.next();  // of aggregatedDf
      if (groupByKey == null) {
        newRow = newPivotRow(row, pivotedDf, groupByColNames);
        groupByKey = buildGroupByKey(row, groupByColNames);
      } else if (groupByKeyChanged(row, groupByColNames, groupByKey)) {
        pivotedDf.rows.add(newRow);
        newRow = newPivotRow(row, pivotedDf, groupByColNames);
        groupByKey = buildGroupByKey(row, groupByColNames);
      }

      List<String> aggregatedDfColNames = new ArrayList<>();
      for (colno = 0; colno < aggrTargetColNames.size(); colno++) {
        aggregatedDfColNames.add(aggregatedDf.getColName(colno));
      }
      for (int i = 0; i < aggrTargetColNames.size(); i++) {
        String aggrTargetColName = aggrTargetColNames.get(i);
        newRow.set(buildPivotNewColName(aggrTypes.get(i), aggrTargetColName, pivotColNames, row),
                row.get(aggregatedDataPointer+i));
      }
    }
    pivotedDf.rows.add(newRow); // add the last retained row
    return pivotedDf;
  }

  public DataFrame doUnpivot(Unpivot unpivot) throws TeddyException {
    Expression unpivotColExpr = unpivot.getCol();
    int groupEvery = (unpivot.getGroupEvery() == null) ? 1 : unpivot.getGroupEvery();
    List<String> unpivotColNames = new ArrayList<>();
    List<String> fixedColNames = new ArrayList<>();

    // group by expression -> group by colnames
    if (unpivotColExpr instanceof Identifier.IdentifierExpr) {
      unpivotColNames.add(((Identifier.IdentifierExpr) unpivotColExpr).getValue());
    } else if (unpivotColExpr instanceof Identifier.IdentifierArrayExpr) {
      unpivotColNames.addAll(((Identifier.IdentifierArrayExpr) unpivotColExpr).getValue());
    } else {
      throw new WrongTargetColumnExpressionException("doUnpivot(): invalid unpivot target column expression type: " + unpivotColExpr.toString());
    }

    // unpivot target이 존재하는지 체크
    for (String colName : unpivotColNames) {
      if (!colName.contains(colName)) {
        throw new ColumnNotFoundException("doUnpivot(): column not found: " + colName);
      }
    }

    if (groupEvery != 1 && groupEvery != unpivotColNames.size()) {
      throw new WrongGroupEveryCountException(
              "doUnpivot(): group every count should be 1 or all: " + groupEvery);
    }

    // FIXME: 왜 여기서만 colName을 기준으로 할까? 다른 곳은 colNo를 가지고 모으고, 넣고 했는데..

    // 고정 column 리스트 확보
    for (int colno = 0; colno < getColCnt(); colno++) {
      if (!unpivotColNames.contains(getColName(colno))) {
        fixedColNames.add(getColName(colno));
      }
    }

    DataFrame newDf = new DataFrame();
    for (int i = 0; i < fixedColNames.size(); i++) {
      String colName = fixedColNames.get(i);
      newDf.addColumn(colName, getColTypeByColName(colName));
    }
    for (int i = 0; i < unpivotColNames.size(); i++) {
      String unpivotColName = unpivotColNames.get(i);
      ColumnType unpivotColType = getColTypeByColName(unpivotColName);
      newDf.addColumn("key" + (i + 1), ColumnType.STRING);
      newDf.addColumn("value" + (i + 1), unpivotColType);

      // groupEvery가 1인 경우 key1, value1만 사용함.
      // 이 경우, 모든 unpivot 대상 column의 TYPE이 같아야함.
      if (groupEvery == 1) {
        for (i++; i < unpivotColNames.size(); i++) {
          unpivotColName = unpivotColNames.get(i);
          if (unpivotColType != getColTypeByColName(unpivotColName)) {
            throw new TypeDifferentException(String.format(
                    "doUnpivot(): unpivot target column types differ: %s != %s",
                    unpivotColType, getColTypeByColName(unpivotColName)));
          }
        }
        break;
      }
    }

    Iterator<Row> iter = rows.iterator();
    Row row;     // of aggregatedDf
    Row newRow;  // of pivotedDf
    while (iter.hasNext()) {
      row = iter.next();
      newRow = new Row();
      for (String fixedColName : fixedColNames) {
        newRow.add(fixedColName, row.get(fixedColName));
      }
      int keyNo = 1;
      for (int i = 0; i < unpivotColNames.size(); i++) {
        String unpivotColName = unpivotColNames.get(i);
        newRow.add("key" + keyNo, unpivotColName);
        newRow.add("value" + keyNo, row.get(unpivotColName));
        if (groupEvery == 1) {
          newDf.rows.add(newRow);
          keyNo = 1;
          newRow = new Row();
          for (String fixedColName : fixedColNames) {
            newRow.add(fixedColName, row.get(fixedColName));
          }
          continue;
        } else if (groupEvery != unpivotColNames.size()) {
          throw new WrongGroupEveryCountException("doUnpivot(): group every count should be 1 or all: " + groupEvery);
        }
        keyNo++;
      }
      if (groupEvery != 1) {
        newDf.rows.add(newRow);
      }
    }
    return newDf;
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

  private DataFrame doSortInternal(List<String> orderByColNames, SortType sortType) throws TeddyException {
    int colno;

    DataFrame newDf = new DataFrame();
    newDf.addColumnWithDfAll(this);

    for (Row row : rows) {
      newDf.rows.add(row);
    }

    for (Row row : newDf.rows) {
      row.cmpKeyIdxs = new ArrayList<>();
      row.cmpKeyTypes = new ArrayList<>();
    }

    // order by colnames existence check & append to result colnames/coltypes
    for (int i = 0; i < orderByColNames.size(); i++) {
      String orderByColName = orderByColNames.get(i);
      for (colno = 0; colno < getColCnt(); colno++) {
        if (getColName(colno).equals(orderByColName)) {
          for (Row row : newDf.rows) {
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

    newDf.rows.sort(new Comparator<Row>() {
      @Override
      public int compare(Row row1, Row row2) {
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
    return newDf;
  }

  public DataFrame doSort(Sort sort) throws TeddyException {
    Expression orderByColExpr = sort.getOrder();
    List<String> orderByColNames = new ArrayList<>();
    Expression typeExpr = sort.getType();
    SortType sortType = SortType.ASCENDING;

    // order by expression -> order by colnames
    if (orderByColExpr instanceof Identifier.IdentifierExpr) {
      orderByColNames.add(((Identifier.IdentifierExpr) orderByColExpr).getValue());
    } else if (orderByColExpr instanceof Identifier.IdentifierArrayExpr) {
      orderByColNames.addAll(((Identifier.IdentifierArrayExpr) orderByColExpr).getValue());
    } else {
      throw new InvalidColumnExpressionTypeException("doSort(): invalid order by column expression type: " + orderByColExpr.toString());
    }

    // type절이 "DESC" 일 때는 내림차순. 기본은 오름차순.
    if (typeExpr != null) {
      if (typeExpr instanceof Constant.StringExpr) {
        if (((Constant.StringExpr) typeExpr).getEscapedValue().equalsIgnoreCase("DESC")) {
          sortType = SortType.DESCENDING;
        }
      } else {
        throw new InvalidColumnExpressionTypeException("doSort(): invalid sort type expression type: " + typeExpr.toString());
      }
    }

    DataFrame newDf = doSortInternal(orderByColNames, sortType);

    for (String orderByColName: orderByColNames) {
      newDf.interestedColNames.add(orderByColName);
    }

    return newDf;
  }

  private DataFrame filter(Expression condExpr, boolean keep) throws TeddyException {
    DataFrame newDf = new DataFrame();
    newDf.addColumnWithDfAll(this);

    if(condExpr instanceof Expr.BinAsExpr)
      throw PrepException.fromTeddyException(new NoAssignmentStatementIsAllowedException(condExpr.toString()));

    for (int rowno = 0; rowno < rows.size(); rowno++) {
      try {
        if (((Expr) condExpr).eval(rows.get(rowno)).longValue() == ((keep) ? 1 : 0)) {
          newDf.rows.add(rows.get(rowno));
        }
      } catch (Exception e) {
        throw PrepException.fromTeddyException(new ColumnNotFoundException(e.getMessage()));
      }
    }
    return newDf;
  }

  protected List<Row> filter2(DataFrame prevDf, Expression condExpr, boolean keep, int offset, int length) throws TeddyException {
    List<Row> rows = new ArrayList<>();

    if(condExpr instanceof Expr.BinAsExpr)
      throw PrepException.fromTeddyException(new NoAssignmentStatementIsAllowedException(condExpr.toString()));

    for (int rowno = offset; rowno < offset + length; rowno++) {
      try {
        if (((Expr) condExpr).eval(prevDf.rows.get(rowno)).longValue() == ((keep) ? 1 : 0)) {
          rows.add(prevDf.rows.get(rowno));
        }
      } catch (Exception e) {
        throw PrepException.fromTeddyException(new ColumnNotFoundException(e.getMessage()));
      }
    }

    return rows;
  }

  public DataFrame doKeep(Keep keep) throws TeddyException {
    Expression condExpr = keep.getRow();
    return filter(condExpr, true);
  }

  public DataFrame doDelete(Delete delete) throws TeddyException {
    Expression condExpr = delete.getRow();
    return filter(condExpr, false);
  }

  public DataFrame doMove(Move move) throws TeddyException {
    DataFrame newDf = new DataFrame();
    Expression targetColExpr = move.getCol();
    List<Integer> targetColnos = new ArrayList<>();
    String beforeColName = move.getBefore();
    String afterColName = move.getAfter();
    int destColno = -1;

    if (beforeColName != null) {
      for (int colno = 0; colno < getColCnt(); colno++) {
        if (beforeColName.equals(getColName(colno))) {
          destColno = colno;
          break;
        }
      }
    } else if (afterColName != null) {
      for (int colno = 0; colno < getColCnt(); colno++) {
        if (afterColName.equals(getColName(colno))) {
          destColno = colno + 1;  // 원 DF를 기준으로 하기 때문에, 기존에는 없던 colno를 가리킬 수도 있음.
          // 아래에서 알아서 처리될 예정
          break;
        }
      }
    } else {
      throw new NeedBeforeOrAfterException("doMove(): \"before:\" or \"after:\" clause is needed: " + move.toString());
    }

    if (targetColExpr instanceof Identifier.IdentifierExpr) {
      String targetColName = ((Identifier.IdentifierExpr) targetColExpr).getValue();
      Integer colno = getColnoByColName(targetColName);
      if (colno == null) {
        throw new ColumnNotFoundException("doMove(): column not found: " + targetColName);
      }
      targetColnos.add(colno);
    }
    else if (targetColExpr instanceof Identifier.IdentifierArrayExpr) {
      List<String> targetColNames = ((Identifier.IdentifierArrayExpr) targetColExpr).getValue();
      Integer lastColno = null;
      for (String targetColName : targetColNames) {
        Integer colno = getColnoByColName(targetColName);
        if (colno == null) {
          throw new ColumnNotFoundException("doMove(): column not found: " + targetColName);
        }
        if (lastColno != null && colno != lastColno + 1) {
          throw new ColumnNotContinuousException("doMove(): columns are not countinuous: " + targetColExpr.toString());
        }
        targetColnos.add(colno);
        lastColno = colno;
      }
    } else {
      throw new WrongTargetColumnExpressionException("doMove(): wrong target column expression: " + targetColExpr.toString());
    }

    if (targetColnos.size() == 0) {
      throw new WrongTargetColumnExpressionException("doMove(): no target column designated: " + targetColExpr.toString());
    }

    if (targetColnos.get(0) == destColno) {
      throw new WrongTargetPositionException("doMove(): target position is same to current position: " + move.toString());
    }

    List<Integer> targetOrder = new ArrayList<>();

    for (int colno = 0; colno < getColCnt(); colno++) {
      if (targetColnos.contains(colno)) {   // src 위치면 그냥 통과 (목표 컬럼 위치에 2번 넣을 예정)
        newDf.interestedColNames.add(getColName(colno));
        continue;
      } else if (colno == destColno) {      // dest 위치면 src 컬럼을 넣고, 그 위치에 있던 컬럼을 넣는다.
        targetOrder.addAll(targetColnos);
        targetOrder.add(colno);
        continue;
      }
      targetOrder.add(colno);           // src도 dest도 아닌 경우
    }
    if (destColno == getColCnt()) {     // dest 위치가 제일 끝인 경우
      assert targetOrder.size() == getColCnt() - targetColnos.size();
      targetOrder.addAll(targetColnos);
    }

    for (int i = 0; i < targetOrder.size(); i++) {
      int colno = targetOrder.get(i);
      newDf.addColumnWithDf(this, colno);
    }

    for (int rowno = 0; rowno < rows.size(); rowno++) {
      Row row = rows.get(rowno);
      Row newRow = new Row();
      for (int i = 0; i < targetOrder.size(); i++) {
        int colno = targetOrder.get(i);
        newRow.add(getColName(colno), row.get(colno));
      }
      newDf.rows.add(newRow);
    }
    return newDf;
  }

  static private List<String> getIdentifierList(Expression expr) {
    List<String> colNames = new ArrayList<>();
    if (expr instanceof Identifier.IdentifierExpr) {
      colNames.add(((Identifier.IdentifierExpr) expr).getValue());
    } else if (expr instanceof Identifier.IdentifierArrayExpr) {
      colNames.addAll(((Identifier.IdentifierArrayExpr) expr).getValue());
    } else {
      assert false : expr;
    }
    return colNames;
  }

  // Hive 테이블로 만들 때에만 이 함수를 사용해서 컬럼명을 제약함.
  public void checkNonAlphaNumerical(String colName) throws IllegalColumnNameForHiveException {
    Pattern p = Pattern.compile("[^\\\\p{IsAlphabetic}^\\\\p{Digit}_]");
    Matcher m = p.matcher(colName);

    // 영문자, 숫자, _만 허용
    if (m.matches()) {
      throw new IllegalColumnNameForHiveException("The column name contains non-alphanumerical characters: " + colName);
    }

    // 그리고, 첫글자는 반드시 영문자
    char c = colName.charAt(0);
    if (Character.isDigit(c) || c == '_') {
      throw new IllegalColumnNameForHiveException("The first character should be alphabetic: " + colName);
    }
  }

  // Hive 테이블로 만들 때에만 이 함수를 사용해서 컬럼명을 제약함
  public void checkNonAlphaNumericalColNames() throws IllegalColumnNameForHiveException {
    for (String colName : colNames) {
      checkNonAlphaNumerical(colName);
    }
  }

  protected String makeParsable(String colName) {
    if(colName.matches("^\'.+\'"))
        colName = colName.substring(1, colName.length()-1);

    return colName.replaceAll("[\\p{Punct}\\p{IsPunctuation} ]", "_");
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

