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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.*;

import static org.junit.Assert.assertEquals;

public class DataFrameTest {

  static String getResourcePath(String relPath, boolean fromHdfs) {
    if (fromHdfs) {
      throw new IllegalArgumentException("HDFS not supported yet");
    }
    URL url = DataFrameTest.class.getClassLoader().getResource(relPath);
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
    return DataFrameTest.apply_rule(multi, ruleStrings);
  }

  static DataFrame prepare_crime(DataFrame crime) throws TeddyException {
    List<String> ruleStrings = new ArrayList<>();
    ruleStrings.add("header rownum: 1");
    return DataFrameTest.apply_rule(crime, ruleStrings);
  }

  static DataFrame prepare_crime_more(DataFrame crime) throws TeddyException {
    List<String> ruleStrings = new ArrayList<>();
    ruleStrings.add("replace col: column3, column4, column5, column6, column7, column8, column9, column10, column11, column13, column12 with: '' on: /_$/ global: true");
    ruleStrings.add("replace col: column3, column4, column5, column7, column6, column8, column9, column10, column11, column12, column13 with: ' ' on: '_' global: true");
    ruleStrings.add("header rownum: 1");
    ruleStrings.add("replace col: Population, Total_Crime, Violent_Crime, Property_Crime, Murder, Forcible_Rape, Robbery, Aggravated_Assault, Burglary, Larceny_Theft, Vehicle_Theft with: '' on: ',' global: true");
    ruleStrings.add("replace col: Population, Violent_Crime, Total_Crime, Property_Crime, Murder, Forcible_Rape, Robbery, Aggravated_Assault, Burglary, Larceny_Theft, Vehicle_Theft with: '' on: ' ' global: true");
    return DataFrameTest.apply_rule(crime, ruleStrings);
  }

  static DataFrame prepare_timestamp(DataFrame dataFrame) throws TeddyException {
    List<String> ruleStrings = new ArrayList<>();
    ruleStrings.add("header rownum: 1");
    return DataFrameTest.apply_rule(dataFrame, ruleStrings);
  }

  static DataFrame prepare_timestamp2(DataFrame dataFrame) throws TeddyException {
    List<String> ruleStrings = new ArrayList<>();
    ruleStrings.add("header rownum: 1");
    ruleStrings.add("settype col: birth_date type: timestamp format: 'MM.dd.yyyy HH:mm:ss'");
    ruleStrings.add("set col: memo value: if(memo=='null', null, memo)");

    return DataFrameTest.apply_rule(dataFrame, ruleStrings);
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
    return DataFrameTest.apply_rule(sale, ruleStrings);
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
    DataFrameService dataFrameService = new DataFrameService();

    for (String ruleString : ruleStrings) {
      // XXX: slaveDsId가 있는 경우 (join, union) 는 이런 식으로 사용할 수 없음
      df = dataFrameService.applyRuleInternal(df, ruleString, new ArrayList<>(), limitRowCnt);
    }
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
  public void test_rename2() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "rename col: itemNo, speed, weight to: 'speed', 'speed', 'speed_1'";
    Rule rule = new RuleVisitorParser().parse(ruleString);
    DataFrame newDf = df.doRename((Rename) rule);
    newDf.show();

    assertEquals("speed", newDf.getColName(2));
    assertEquals("speed_1", newDf.getColName(4));
    assertEquals("speed_1_1", newDf.getColName(5));
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
    null_contained = DataFrameTest.prepare_null_contained(null_contained);
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
}
