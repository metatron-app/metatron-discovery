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

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.hive.ql.exec.vector.BytesColumnVector;
import org.apache.hadoop.hive.ql.exec.vector.DoubleColumnVector;
import org.apache.hadoop.hive.ql.exec.vector.LongColumnVector;
import org.apache.hadoop.hive.ql.exec.vector.VectorizedRowBatch;
import org.apache.orc.OrcFile;
import org.apache.orc.TypeDescription;
import org.apache.orc.Writer;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import app.metatron.discovery.domain.dataprep.PrepSnapshot;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.RuleNotSupportedException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.*;

import static org.junit.Assert.assertEquals;

//import org.apache.hadoop.hive.ql.io.orc.OrcFile;
//import org.apache.hadoop.hive.ql.io.orc.Writer;

public class OrcTest {

  static String getResourcePath(String relPath, boolean fromHdfs) {
    if (fromHdfs) {
      throw new IllegalArgumentException("HDFS not supported yet");
    }
    URL url = OrcTest.class.getClassLoader().getResource(relPath);
    return (new File(url.getFile())).getAbsolutePath();
  }

  public static String getResourcePath(String relPath) {
    return getResourcePath(relPath, false);
  }

  public static Map<String, List<String[]>> grids = new HashMap<>();

  static int limitRowCnt = 10000;

  static private List<String[]> loadGridCsv(String alias, String path) throws MalformedURLException {
    List<String[]> grid = new ArrayList<>();

    BufferedReader br = null;
    String line;
    String cvsSplitBy = ",";

    try {
      br = new BufferedReader(new InputStreamReader(new FileInputStream(getResourcePath(path))));
      while ((line = br.readLine()) != null) {
        String[] strCols = line.split(cvsSplitBy);
        grid.add(strCols);
        if (grid.size() == limitRowCnt)
          break;
      }
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    } finally {
      if (br != null) {
        try {
          br.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }

    grids.put(alias, grid);
    return grid;
  }

  static DataFrame prepare_multi(DataFrame multi) throws TeddyException {
    List<String> ruleStrings = new ArrayList<>();
    ruleStrings.add("header rownum: 1");
    ruleStrings.add("settype col: measure type: long");
    return OrcTest.apply_rule(multi, ruleStrings);
  }

  static DataFrame prepare_crime(DataFrame crime) throws TeddyException {
    List<String> ruleStrings = new ArrayList<>();
    ruleStrings.add("header rownum: 1");
    return OrcTest.apply_rule(crime, ruleStrings);
  }

  static DataFrame prepare_crime_more(DataFrame crime) throws TeddyException {
    List<String> ruleStrings = new ArrayList<>();
    ruleStrings.add("replace col: column3, column4, column5, column6, column7, column8, column9, column10, column11, column13, column12 with: '' on: /_$/ global: true");
    ruleStrings.add("replace col: column3, column4, column5, column7, column6, column8, column9, column10, column11, column12, column13 with: ' ' on: '_' global: true");
    ruleStrings.add("header rownum: 1");
    ruleStrings.add("replace col: Population, Total_Crime, Violent_Crime, Property_Crime, Murder, Forcible_Rape, Robbery, Aggravated_Assault, Burglary, Larceny_Theft, Vehicle_Theft with: '' on: ',' global: true");
    ruleStrings.add("replace col: Population, Violent_Crime, Total_Crime, Property_Crime, Murder, Forcible_Rape, Robbery, Aggravated_Assault, Burglary, Larceny_Theft, Vehicle_Theft with: '' on: ' ' global: true");
    return OrcTest.apply_rule(crime, ruleStrings);
  }

  static DataFrame prepare_timestamp(DataFrame dataFrame) throws TeddyException {
    List<String> ruleStrings = new ArrayList<>();
    ruleStrings.add("header rownum: 1");
    return OrcTest.apply_rule(dataFrame, ruleStrings);
  }

  static DataFrame prepare_timestamp2(DataFrame dataFrame) throws TeddyException {
    List<String> ruleStrings = new ArrayList<>();
    ruleStrings.add("header rownum: 1");
    ruleStrings.add("settype col: birth_date type: timestamp format: 'MM.dd.yyyy HH:mm:ss'");
    return OrcTest.apply_rule(dataFrame, ruleStrings);
  }

  static DataFrame prepare_sale(DataFrame sale) throws TeddyException {
    List<String> ruleStrings = new ArrayList<>();
//    ruleStrings.add("rename col: column2 to: 'category'");
//    ruleStrings.add("rename col: column3 to: 'city'");
    ruleStrings.add("rename col: column14 to: 'state'");
//    ruleStrings.add("rename col: column15 to: 'product'");
    ruleStrings.add("rename col: column24 to: 'quantity'");
    ruleStrings.add("settype col: quantity type: long");
    ruleStrings.add("rename col: column25 to: 'price'");
    ruleStrings.add("settype col: price type: long");
//    ruleStrings.add("sort order: price type: 'desc'");
    return OrcTest.apply_rule(sale, ruleStrings);
  }

  @BeforeClass
  public static void setUp() throws Exception {
    grids.put("sample", Util.loadGridLocalCsv(getResourcePath("teddy/sample.csv"), ",", limitRowCnt));
    grids.put("null_contained", Util.loadGridLocalCsv(getResourcePath("teddy/null_contained.csv"), ",", limitRowCnt));
    grids.put("crime", Util.loadGridLocalCsv(getResourcePath("teddy/crime.csv"), ",", limitRowCnt));
    grids.put("sale", Util.loadGridLocalCsv(getResourcePath("teddy/sale.csv"), ",", limitRowCnt));
  }

  @Test
  public void test_show() {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df.show();

    df = new DataFrame();
    df.setByGrid(grids.get("contract"), null);
    df.show();

    df = new DataFrame();
    df.setByGrid(grids.get("store"), null);
    df.show();
  }

  @Test
  public void test_drop() throws TeddyException, IOException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "drop col: contract_date, itemNo";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doDrop((Drop)rule);
    newDf.show();
  }

  static DataFrame apply_rule(DataFrame df, List<String> ruleStrings) throws TeddyException {
    for (String ruleString : ruleStrings) {
      Rule rule = new RuleVisitorParser().parse(ruleString);
      switch (rule.getName()) {
        // 계산할 필요가 없음
        case "drop":          df = df.doDrop((Drop) rule); break;
        case "move":          df = df.doMove((Move) rule); break;
        case "sort":          df = df.doSort((Sort) rule); break;

        // 기존 컬럼 중 1개가 영향을 받는 경우
        case "replace":       df = df.doReplace((Replace) rule, ruleString); break;
        case "rename":        df = df.doRename((Rename) rule); break;
        case "settype":       df = df.doSetType((SetType) rule); break;
        case "flatten":       df = df.doFlatten((Flatten) rule, limitRowCnt); break;

        // $col 치환이 필요한 경우
        case "set":
          df = df.doSet((Set) rule, ruleString);
          break;

        // 새로 column이 1개 생기는 경우
        case "countpattern":  df = df.doCountPattern((CountPattern) rule); break;
        case "derive":        df = df.doDerive((Derive) rule); break;
        case "merge":         df = df.doMerge((Merge) rule); break;
        case "unnest":        df = df.doUnnest((Unnest) rule); break;
        case "extract":       df = df.doExtract((Extract) rule); break;
        case "aggregate":     df = df.doAggregate((Aggregate) rule); break;

        // 새로 column이 여려개 생기는 경우
        case "split":         df = df.doSplit((Split) rule); break;
        case "nest":          df = df.doNest((Nest) rule); break;
        case "pivot":         df = df.doPivot((Pivot) rule); break;
        case "unpivot":       df = df.doUnpivot((Unpivot) rule); break;

        // 몽땅 다 영향 받는 경우
        case "header":        df = df.doHeader((Header) rule); break;
        case "keep":          df = df.doKeep((Keep) rule); break;
        case "delete":        df = df.doDelete((Delete) rule); break;

        default:
          throw new RuleNotSupportedException("rule not supported: " + rule.getName());
      }
    } // end of for
    return df;
  }

  static DataFrame prepare_sample(DataFrame df) throws IOException, TeddyException {
    List<String> ruleStrings = new ArrayList<>();

    ruleStrings.add("header rownum: 1");
    ruleStrings.add("settype col: itemNo type: long");
    ruleStrings.add("settype col: speed type: long");
    ruleStrings.add("settype col: weight type: double");

    return apply_rule(df, ruleStrings);
  }

  static DataFrame prepare_null_contained(DataFrame df) throws IOException, TeddyException {
    List<String> ruleStrings = new ArrayList<>();

    ruleStrings.add("header rownum: 1");
    ruleStrings.add("set col: itemNo value: if(itemNo=='NULL', null, itemNo)");
    ruleStrings.add("set col: name value: if(name=='NULL', null, name)");
    ruleStrings.add("set col: speed value: if(speed=='NULL', null, speed)");

    ruleStrings.add("settype col: itemNo type: long");
    ruleStrings.add("settype col: speed type: long");
    ruleStrings.add("settype col: weight type: long");

    df = apply_rule(df, ruleStrings);
    return df;
//    df.objGrid.get(1).set("itemNo", null);
//    return df;
  }

  @Test
  public void test_rename_settype() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();
  }

  @Test
  public void test_rename() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "rename col: speed to: 'speed_new'";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doRename((Rename) rule);
    newDf.show();
  }

  @Test
  public void test_set_plus() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "set col: speed value: speed + 1000";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doSet((Set)rule, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_plus_multi() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "set col: speed, itemNo value: $col + 1000";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doSet((Set)rule, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_plus_multi_but_on_single_col() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "set col: speed value: $col + 1000";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doSet((Set)rule, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_minus() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "set col: speed value: speed - 300";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doSet((Set)rule, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_mul() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df.show();
    df = prepare_sample(df);

    String ruleString = "set col: speed value: speed * 10";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doSet((Set)rule, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_if() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df.show();
    df = prepare_sample(df);

    String ruleString = "set col: name value: if(length(name) > 5, '11', '10')";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doSet((Set)rule, ruleString);
    newDf.show();
  }

  @Test
  public void test_derive_mul() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "derive as: Turbo value: speed * 10";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doDerive((Derive)rule);
    newDf.show();
  }

  @Test
  public void test_set_div() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "set col: speed value: speed / 10";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doSet((Set)rule, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_div_double() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "set col: speed value: 3.0 / speed";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doSet((Set)rule, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_type_mismatch() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "set col: speed value: speed * '10'";
    Rule rule = new RuleVisitorParser().parse(ruleString);

    try {
      df.doSet((Set) rule, ruleString);
    } catch (TeddyException e) {
      System.out.println(e);
    }
  }

  @Test
  public void test_header() throws IOException, TeddyException {
    List<String> ruleStrings = new ArrayList<>();

    DataFrame store = new DataFrame();
    store.setByGrid(grids.get("store"), null);
    store.show();

    ruleStrings.clear();
    ruleStrings.add("header rownum: 1");
    store = apply_rule(store, ruleStrings);
    store.show();
  }

  static DataFrame prepare_contract(DataFrame contract) throws TeddyException {
    List<String> ruleStrings = new ArrayList<>();
    ruleStrings.add("rename col: column1, column3, column4, column5, column6, column7, column8 to: 'cdate', 'pcode1', 'pcode2', 'pcode3', 'pcode4', 'customer_id', 'detail_store_code'");
    ruleStrings.add("drop col: column2, column9");

    ruleStrings.add("settype col: pcode1 type: long");
    ruleStrings.add("settype col: pcode2 type: long");
    ruleStrings.add("settype col: pcode3 type: long");
    ruleStrings.add("settype col: pcode4 type: long");
    ruleStrings.add("settype col: detail_store_code type: long");

    return apply_rule(contract, ruleStrings);
  }

  private DataFrame prepare_product(DataFrame product) throws TeddyException {
    List<String> ruleStrings = new ArrayList<>();
    ruleStrings.add("rename col: column1, column2, column3, column4, column5 to: 'pcode1', 'pcode2', 'pcode3', 'pcode4', 'pcode'");
    ruleStrings.add("settype col: pcode1 type: long");
    ruleStrings.add("settype col: pcode2 type: long");
    ruleStrings.add("settype col: pcode3 type: long");
    ruleStrings.add("settype col: pcode4 type: long");

    return apply_rule(product, ruleStrings);
  }

  public static DataFrame prepare_store(DataFrame store) throws TeddyException {
    List<String> ruleStrings = new ArrayList<>();
    ruleStrings.add("header rownum: 1");
    ruleStrings.add("drop col: store_name");
    ruleStrings.add("settype col: detail_store_code type: long");
    return apply_rule(store, ruleStrings);
  }

  @Test
  public void test_join_by_string() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract.show();

    contract = prepare_contract(contract);
    contract.show();

    DataFrame store = new DataFrame();
    store.setByGrid(grids.get("store"), null);
    store.show();

    store = prepare_store(store);
    store.show();

    String ruleString = "join leftSelectCol: cdate,pcode1,pcode2,pcode3,pcode4,customer_id,detail_store_code rightSelectCol: detail_store_code,customer_id,detail_store_name condition: customer_id=customer_id joinType: 'inner' dataset2: '88888888-4444-4444-4444-121212121212'";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doJoin((Join)rule, store, 10000);
    newDf.show();
  }

  @Test
  public void test_join_multi_key() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract.show();

    contract = prepare_contract(contract);
    contract.show();

    DataFrame product = new DataFrame();
    product.setByGrid(grids.get("product"), null);
    product.show();

    product = prepare_product(product);
    product.show();

    String ruleString = "join leftSelectCol: cdate,pcode1,pcode2,pcode3,pcode4,customer_id,detail_store_code rightSelectCol: pcode1,pcode2,pcode3,pcode4,pcode condition: pcode1=pcode1 && pcode2=pcode2 && pcode3=pcode3 && pcode4=pcode4 joinType: 'inner' dataset2: '88888888-4444-4444-4444-121212121212'";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doJoin((Join)rule, product, 10000);
    newDf.show();
  }

  @Test
  public void test_join_by_long() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract.show();

    contract = prepare_contract(contract);
    contract.show();

    DataFrame store = new DataFrame();
    store.setByGrid(grids.get("store"), null);
    store.show();

    store = prepare_store(store);
    store.show();

    String ruleString = "join leftSelectCol: cdate,pcode1,pcode2,pcode3,pcode4,customer_id,detail_store_code rightSelectCol: detail_store_code,customer_id,detail_store_name condition: detail_store_code=detail_store_code joinType: 'inner' dataset2: '88888888-4444-4444-4444-121212121212'";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doJoin((Join)rule, store, 10000);
    newDf.show();
  }

  @Test
  public void test_union() throws IOException, TeddyException {
    DataFrame store1 = new DataFrame();
    DataFrame store2 = new DataFrame();
    DataFrame store3 = new DataFrame();
    DataFrame store4 = new DataFrame();

    store1.setByGrid(grids.get("store1"), null);
    store2.setByGrid(grids.get("store2"), null);
    store3.setByGrid(grids.get("store3"), null);
    store4.setByGrid(grids.get("store4"), null);

    store1.show();

    store1 = prepare_store(store1);
    store2 = prepare_store(store2);
    store3 = prepare_store(store3);
    store4 = prepare_store(store4);

    store1.show();

    List<DataFrame> slaveDataFrames = new ArrayList<>();
    slaveDataFrames.add(store2);
    slaveDataFrames.add(store3);
    slaveDataFrames.add(store4);
    DataFrame newDf = store1.union(slaveDataFrames, 10000);
    newDf.show();
  }

  @Test
  public void test_extract() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "extract col: name on: 'e' quote: '\"' limit: 3";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doExtract((Extract)rule);
    newDf.show();
  }

  @Test
  public void test_extract_regex() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "extract col: cdate on: /\\w+/ quote: '\"' limit: 3";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doExtract((Extract)rule);
    newDf.show();
  }

  @Test
  public void test_countpattern() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "countpattern col: cdate on: '2'";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doCountPattern((CountPattern) rule);
    newDf.show();
  }

  @Test
  public void test_countpattern_2_columns() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "countpattern col: cdate, customer_id on: '08'";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doCountPattern((CountPattern) rule);
    newDf.show();
  }

  @Test
  public void test_countpattern_3_columns_with_casting() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "countpattern col: cdate, customer_id, detail_store_code on: '08'";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doCountPattern((CountPattern) rule);

    ruleString = "sort order: countpattern_cdate_customer_id_detail_store_code type: 'desc'";
    rule = new RuleVisitorParser().parse(ruleString);
    newDf = newDf.doSort((Sort) rule);

    newDf.show();
  }

  @Test
  public void test_countpattern_regex() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "countpattern col: cdate on: /0\\d+/";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doCountPattern((CountPattern) rule);
    newDf.show();
  }

  @Test
  public void test_countpattern_ignorecase() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "countpattern col: name on: 'm'";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doCountPattern((CountPattern) rule);
    newDf.show();

    ruleString = "countpattern col: name on: 'm' ignoreCase: true";
    rule = new RuleVisitorParser().parse(ruleString);
    newDf = newDf.doCountPattern((CountPattern) rule);
    newDf.show();
  }

  @Test
  public void test_replace() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "replace col: cdate on: '0' with: 'X' global: false";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doReplace((Replace) rule, ruleString);
    newDf.show();

    ruleString = "replace col: cdate on: '0' with: 'X' global: true";
    rule = new RuleVisitorParser().parse(ruleString);
    newDf = contract.doReplace((Replace) rule, ruleString);
    newDf.show();
  }

  @Test
  public void test_replace_multi() throws IOException, TeddyException {
    DataFrame crime = new DataFrame();
    crime.setByGrid(grids.get("crime"), null);
    crime.show();

    String ruleString = "replace col: column3, column5, column7, column8, column9, column10, column11, column12, column13 on: '_' with: '' global: true";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = crime.doReplace((Replace) rule, ruleString);
    newDf.show();
  }

  @Test
  public void test_replace_regex() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show(100);

    String ruleString = "extract col: cdate on: /\\w+/ quote: '\"' limit: 3";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doExtract((Extract)rule);
    newDf.show();
  }

  @Test
  public void test_nest_unnest_array() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "nest col: pcode1, pcode2, pcode3, pcode4 into: array as: pcode";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doNest((Nest)rule);
    newDf.show();

    ruleString = "unnest col: pcode into: array idx: 0";  // into: is not used
    rule = new RuleVisitorParser().parse(ruleString);
    newDf = newDf.doUnnest((Unnest)rule);
    newDf.show();
  }

  @Test
  public void test_nest_map() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "nest col: pcode1, pcode2, pcode3, pcode4 into: map as: pcode";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doNest((Nest)rule);
    newDf.show();
  }

  @Test
  public void test_nest_unnest_map() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "nest col: pcode1, pcode2, pcode3, pcode4 into: map as: pcode";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doNest((Nest)rule);
    newDf.show();

    ruleString = "unnest col: pcode into: map idx: 'pcode3'"; // into: is not used (remains for backward-compatability)
    rule = new RuleVisitorParser().parse(ruleString);
    newDf = newDf.doUnnest((Unnest)rule);
    newDf.show();
  }

  @Test
  public void test_flatten() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "nest col: pcode1, pcode2, pcode3, pcode4 into: array as: pcode";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doNest((Nest)rule);
    newDf.show();

    ruleString = "flatten col: pcode";
    rule = new RuleVisitorParser().parse(ruleString);
    newDf = newDf.doFlatten((Flatten) rule, limitRowCnt);
    newDf.show();
  }

  @Test
  public void test_merge() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "merge col: pcode1, pcode2, pcode3, pcode4 with: '_' as: 'pcode'";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doMerge((Merge)rule);
    newDf.show();
  }

  @Test
  public void test_merge_split() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "merge col: pcode1, pcode2, pcode3, pcode4 with: '_' as: 'pcode'";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doMerge((Merge)rule);
    newDf.show();

    ruleString = "split col: pcode on: '_' limit: 4";
    rule = new RuleVisitorParser().parse(ruleString);
    newDf = newDf.doSplit((Split)rule);
    newDf.show();
  }

  @Test
  public void test_split_ignorecase() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "split col: name on: 'e' limit: 2";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doSplit((Split)rule);
    newDf.show();

    assertEquals("rrari", newDf.rows.get(0).get("split_name2"));
    assertEquals("rc", newDf.rows.get(2).get("split_name2"));

    ruleString = "split col: name on: 'm' limit: 2 ignoreCase: true";
    rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf2 = df.doSplit((Split)rule);
    newDf2.show();

    assertEquals("ercedes", newDf2.rows.get(2).get("split_name2"));
    assertEquals("borghini", newDf2.rows.get(4).get("split_name2"));
  }
  @Test
  public void test_aggregate_sum() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "aggregate value: 'sum(pcode4)' group: pcode1, pcode2";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doAggregate((Aggregate)rule);
    newDf.show();
  }

  @Test
  public void test_aggregate_count() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "aggregate value: 'count()' group: pcode1, pcode2";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doAggregate((Aggregate)rule);
    newDf.show();
  }

  @Test
  public void test_aggregate_avg() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "aggregate value: 'avg(pcode4)' group: pcode1, pcode2";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doAggregate((Aggregate)rule);
    newDf.show();
  }

  @Test
  public void test_aggregate_min_max() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "aggregate value: 'min(detail_store_code)', 'max(detail_store_code)' group: pcode1, pcode2";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doAggregate((Aggregate)rule);
    newDf.show();
  }

  @Test
  public void test_sort() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "sort order: detail_store_code";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doSort((Sort)rule);
    newDf.show(100);
  }

  @Test
  public void test_sort_multi() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "sort order: pcode1, pcode2, pcode3 type: 'desc'";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doSort((Sort)rule);
    newDf.show(1000);
  }

  @Test
  public void test_sort_int() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "settype col: detail_store_code type: long";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doSetType((SetType)rule);

    ruleString = "sort order: detail_store_code type: 'desc'";
    rule = new RuleVisitorParser().parse(ruleString);
    newDf = newDf.doSort((Sort)rule);
    newDf.show(100);
  }

  @Test
  public void test_pivot_sum() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "pivot col: pcode1, pcode2 value: 'sum(detail_store_code)', 'count()' group: pcode3, pcode4";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doPivot((Pivot) rule);
    newDf.show();
  }

  @Test
  public void test_pivot_avg() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "pivot col: pcode1, pcode2 value: 'avg(detail_store_code)' group: pcode3, pcode4";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doPivot((Pivot) rule);
    newDf.show(100);
  }

  @Test
  public void test_unpivot_sum() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "pivot col: pcode1 value: 'sum(detail_store_code)' group: pcode3, pcode4";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doPivot((Pivot) rule);

    ruleString = "unpivot col: sum_detail_store_code_1, sum_detail_store_code_2, sum_detail_store_code_3, sum_detail_store_code_4 groupEvery: 1";
    rule = new RuleVisitorParser().parse(ruleString);
    newDf = newDf.doUnpivot((Unpivot) rule);

    newDf.show();
  }

  @Test
  public void test_unpivot_sum_every() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "pivot col: pcode1 value: 'sum(detail_store_code)' group: pcode3, pcode4";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doPivot((Pivot) rule);

    ruleString = "unpivot col: sum_detail_store_code_1, sum_detail_store_code_2, sum_detail_store_code_3, sum_detail_store_code_4 groupEvery: 4";
    rule = new RuleVisitorParser().parse(ruleString);
    newDf = newDf.doUnpivot((Unpivot) rule);

    newDf.show();
  }

  @Test
  public void test_keep() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "keep row: if(pcode4 < 10)";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doKeep((Keep) rule);

    newDf.show();
  }

  @Test
  public void test_keep_literal() throws IOException, TeddyException {
    DataFrame store = new DataFrame();
    store.setByGrid(grids.get("store"), null);
    store = prepare_store(store);
    store.show();

    String ruleString = "keep row: if(store_code=='0001')";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = store.doKeep((Keep) rule);

    newDf.show();
  }

  @Test
  public void test_delete() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "delete row: if(pcode4 < 10)";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doDelete((Delete) rule);

    newDf.show();
  }

  @Test
  public void test_delete2() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "delete row: if(pcode1==1 || pcode4>20)";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doDelete((Delete) rule);

    newDf.show();

    assertEquals("uid00000011", newDf.rows.get(1).get("customer_id"));
    assertEquals("uid00000014", newDf.rows.get(2).get("customer_id"));
  }

  @Test
  public void test_move_before() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode4 before: pcode1";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doMove((Move) rule);
    newDf.show();

    ruleString = "move col: pcode4 before: cdate";
    rule = new RuleVisitorParser().parse(ruleString);
    newDf = newDf.doMove((Move) rule);
    newDf.show();
  }

  @Test
  public void test_move_after() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode4 after: customer_id";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doMove((Move) rule);
    newDf.show();
  }

  @Test
  public void test_move_after_last() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode4 after: detail_store_code";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doMove((Move) rule);
    newDf.show();
  }
  @Test

  public void test_move_before_multi() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode3, pcode4 before: pcode1";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doMove((Move) rule);
    newDf.show();

    ruleString = "move col: pcode3, pcode4 before: cdate";
    rule = new RuleVisitorParser().parse(ruleString);
    newDf = newDf.doMove((Move) rule);
    newDf.show();
  }

  @Test
  public void test_move_after_multi() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode2, pcode3, pcode4 after: customer_id";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doMove((Move) rule);
    newDf.show();
  }

  @Test
  public void test_move_after_last_multi() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode1, pcode2, pcode3, pcode4 after: detail_store_code";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = contract.doMove((Move) rule);
    newDf.show();
  }

  @Test
  public void test_move_not_continuous_columns() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode1, pcode4 after: detail_store_code";
    Rule rule = new RuleVisitorParser().parse(ruleString);

    try {
      contract.doMove((Move) rule);
    } catch (TeddyException e) {
      System.out.println(e);
    }
  }

  @Test
  public void test_move_not_continuous_order() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode1, pcode3, pcode2, pcode4 after: detail_store_code";
    Rule rule = new RuleVisitorParser().parse(ruleString);

    try {
      contract.doMove((Move) rule);
    } catch (TeddyException e) {
      System.out.println(e);
    }
  }


  private DataFrame newNullContainedDataFrame() throws IOException, TeddyException {
    DataFrame null_contained = new DataFrame();
    null_contained.setByGrid(grids.get("null_contained"), null);
    null_contained = OrcTest.prepare_null_contained(null_contained);
    null_contained.show();
    return null_contained;
  }

  @Test
  public void test_header_exceptional_case() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    Rule rule = new RuleVisitorParser().parse("header rownum: 1");
    DataFrame newDf = null_contained.doHeader((Header) rule);
    newDf.show();
    assertEquals("column2010_01_01", newDf.getColName(0));

    rule = new RuleVisitorParser().parse("header rownum: 2");
    newDf = null_contained.doHeader((Header) rule);
    newDf.show();
    assertEquals("column1", newDf.getColName(2));

    rule = new RuleVisitorParser().parse("header rownum: 6");
    newDf = null_contained.doHeader((Header) rule);
    newDf.show();
    assertEquals("column1", newDf.getColName(3));
    assertEquals("column2", newDf.getColName(4));
  }

//  @Test
//  public void test_orc_write() throws IOException, TeddyException {
//    final File file = new File("/tmp/tmp_2.orc");
//    file.deleteOnExit();
//
//    final OrcFile.WriterOptions wOpts =
//            OrcFile.writerOptions(new Configuration()).inspector(ROW_OI);
//    final OrcFile.ReaderOptions rOpts = new OrcFile.ReaderOptions(new Configuration());
//
//    final org.apache.hadoop.hive.ql.io.orc.Writer writer = OrcFile.createWriter(new Path(file.toString()), wOpts);
//    writeUsingOrcWriter(writer);
//    final byte[] memOrcBytes = FileUtils.readFileToByteArray(file);
//
//    readAndAssertUsingReader(OrcUtils.createReader(memOrcBytes, rOpts).rows());
//  }

//  @Test
//  public void test_orc_write() throws IOException {
//    String input = "my_text_string\t1\t2\t3\t123.4\t123.45";
//
//    String typeStr = "struct<string_value:string,short_value:smallint,integer_value:int,long_value:bigint,double_value:double,float_value:float>";
//    TypeInfo typeInfo = TypeInfoUtils.getTypeInfoFromTypeString(typeStr);
//    ObjectInspector inspector = OrcStruct.createObjectInspector(typeInfo);
//
//    String[] inputTokens = input.split("\\t");
//
//    OrcStruct orcLine = OrcUtils.createOrcStruct(
//            typeInfo,
//            new Text(inputTokens[0]),
//            new ShortWritable(Short.valueOf(inputTokens[1])),
//            new IntWritable(Integer.valueOf(inputTokens[2])),
//            new LongWritable(Long.valueOf(inputTokens[3])),
//            new DoubleWritable(Double.valueOf(inputTokens[4])),
//            new FloatWritable(Float.valueOf(inputTokens[5])));
//    Configuration conf = new Configuration();
//    Path tempPath = new Path("/user/hive/dataprep/test.orc");

//    Writer writer = OrcFile.createWriter(tempPath, OrcFile.writerOptions(conf).inspector(inspector).stripeSize(100000).bufferSize(10000));
//    writer.addRow(orcLine);
//    writer.close();
//  }

//  @Test
//  public void test_orc_write_var() throws IOException {
//    String input = "my_text_string\t1\t2\t3\t123.4\t123.45";
//
//    String typeStr = "struct<string_value:string,short_value:smallint,integer_value:int,long_value:bigint,double_value:double,float_value:float>";
//    TypeInfo typeInfo = TypeInfoUtils.getTypeInfoFromTypeString(typeStr);
//    ObjectInspector inspector = OrcStruct.createObjectInspector(typeInfo);
//
//    String[] inputTokens = input.split("\\t");
//
//    Object[] objs = new Object[inputTokens.length];
//    objs[0] = new Text(inputTokens[0]);
//    objs[1] = new ShortWritable(Short.valueOf(inputTokens[1]));
//    objs[2] = new IntWritable(Integer.valueOf(inputTokens[2]));
//    objs[3] = new LongWritable(Long.valueOf(inputTokens[3]));
//    objs[4] = new DoubleWritable(Double.valueOf(inputTokens[4]));
//    objs[5] = new FloatWritable(Float.valueOf(inputTokens[5]));
//
//    OrcStruct orcLine = OrcUtils.createOrcStruct(typeInfo, objs);
//    Configuration conf = new Configuration();
//    Path tempPath = new Path("/user/hive/dataprep/test2.orc");

//    Writer writer = OrcFile.createWriter(tempPath, OrcFile.writerOptions(conf).inspector(inspector).stripeSize(100000).bufferSize(10000));
//    writer.addRow(orcLine);
//    writer.close();
//  }

// 1.5.0 이상을 써야 overwrite 옵션을 쓸 수 있으나, 그러면 대신 TimestampColumnVector가 안만들어짐.
// 그래서 전체적으로 1.4.4를 쓰게 되었고, 미리 지우는 코드를 짜기 심히 귀찮아서 주석처리함.
// @Test
  public void test_orc_write_vector_simple() throws IOException {
    Random rand = new Random();

    Configuration conf = new Configuration();
    TypeDescription schema = TypeDescription.createStruct()
            .addField("int_value", TypeDescription.createInt())
            .addField("long_value", TypeDescription.createLong())
            .addField("double_value", TypeDescription.createDouble())
            .addField("float_value", TypeDescription.createFloat())
            .addField("boolean_value", TypeDescription.createBoolean())
            .addField("string_value", TypeDescription.createString());

    Path path = new Path("/user/hive/dataprep/orc3/my-file.orc");
    Writer writer = OrcFile.createWriter(path,
            OrcFile.writerOptions(conf)//.overwrite(true)
                    .setSchema(schema));

    VectorizedRowBatch batch = schema.createRowBatch();
    LongColumnVector intVector = (LongColumnVector) batch.cols[0];
    LongColumnVector longVector = (LongColumnVector) batch.cols[1];
    DoubleColumnVector doubleVector = (DoubleColumnVector) batch.cols[2];
    DoubleColumnVector floatColumnVector = (DoubleColumnVector) batch.cols[3];
    LongColumnVector booleanVector = (LongColumnVector) batch.cols[4];
    BytesColumnVector stringVector = (BytesColumnVector) batch.cols[5];


    for (int r = 0; r < 100000; ++r) {
      int row = batch.size++;

      intVector.vector[row] = rand.nextInt();
      longVector.vector[row] = rand.nextLong();
      doubleVector.vector[row] = rand.nextDouble();
      floatColumnVector.vector[row] = rand.nextFloat();
      booleanVector.vector[row] = rand.nextBoolean() ? 1 : 0;
      byte[] bytes = UUID.randomUUID().toString().getBytes();
      stringVector.setVal(row, bytes, 0, bytes.length);

      if (batch.size == batch.getMaxSize()) {
        writer.addRowBatch(batch);
        batch.reset();
      }
    }
    if (batch.size != 0) {
      writer.addRowBatch(batch);
      batch.reset();
    }
    writer.close();
  }

  @Test
  public void test_writeOrc() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    Configuration conf = new Configuration();
    String hadoopConfDir = "Users/jhkim/opt/hadoop/etc/hadoop";
    conf.addResource(new Path(hadoopConfDir + File.separator + "core-site.xml"));
    conf.addResource(new Path(hadoopConfDir + File.separator + "hdfs-site.xml"));

    Path file = new Path("/user/hive/dataprep/orc4/test_writeOrc.orc");

    TeddyOrcWriter orcWriter = new TeddyOrcWriter();
    orcWriter.writeOrc(df, conf, file, PrepSnapshot.COMPRESSION.SNAPPY);
  }

  @Test
  public void test_makeHiveTable() throws IOException, TeddyException, SQLException, ClassNotFoundException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    Configuration conf = new Configuration();
    String hadoopConfDir = "Users/jhkim/opt/hadoop/etc/hadoop";
    conf.addResource(new Path(hadoopConfDir + File.separator + "core-site.xml"));
    conf.addResource(new Path(hadoopConfDir + File.separator + "hdfs-site.xml"));

    String location = "/user/hive/dataprep/test_makeHiveTable";
    Path file = new Path(location + "/file1.orc");

    TeddyOrcWriter orcWriter = new TeddyOrcWriter();
    orcWriter.writeOrc(df, conf, file, PrepSnapshot.COMPRESSION.SNAPPY);

    TeddyExecutor executor = new TeddyExecutor();
    executor.hiveHostname = "localhost";
    executor.hivePort = 10000;
    executor.hiveUsername = "hadoop";
    executor.hivePassword = "hadoop";
    executor.makeHiveTable(df, new ArrayList<>(), "default.test_orc_hive", location, PrepSnapshot.FORMAT.ORC, PrepSnapshot.COMPRESSION.SNAPPY);
  }
}
