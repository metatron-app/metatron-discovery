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

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.*;

import static org.junit.Assert.assertEquals;

public class DataFrameTest extends TeddyTest {

  @BeforeClass
  public static void setUp() throws Exception {
    loadGridCsv("sample", "teddy/sample.csv");
    loadGridCsv("null_contained", "teddy/null_contained.csv");
    loadGridCsv("crime", "teddy/crime.csv");
    loadGridCsv("sale", "teddy/sale.csv");
    loadGridCsv("contract", "teddy/contract.csv");
    loadGridCsv("product", "teddy/product.csv");
    loadGridCsv("store", "teddy/store.csv");
    loadGridCsv("store1", "teddy/store.csv");
    loadGridCsv("store2", "teddy/store2.csv");
    loadGridCsv("store3", "teddy/store3.csv");
    loadGridCsv("store4", "teddy/store4.csv");
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

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();
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

    String ruleString = "rename col: speed to: 'speed new'";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();

    ruleString = "rename col: `speed new`, name to: 'speed', 'new name'";

    newDf = apply_rule(newDf, ruleString);
    newDf.show();
  }

  @Test
  public void test_rename2() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "rename col: itemNo, speed, weight to: 'speed', 'speed', 'speed_1'";

    DataFrame newDf = apply_rule(df, ruleString);
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

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_plus_multi() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "set col: speed, itemNo value: $col + 1000";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_plus_multi_but_on_single_col() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "set col: speed value: $col + 1000";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_minus() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "set col: speed value: speed - 300";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_mul() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df.show();
    df = prepare_sample(df);

    String ruleString = "set col: speed value: speed * 10";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_if() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df.show();
    df = prepare_sample(df);

    String ruleString = "set col: name value: if(length(name) > 5, '11', '10')";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();
  }

  @Test
  public void test_derive_mul() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "derive as: Turbo value: speed * 10";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_div() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "set col: speed value: speed / 10";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_div_double() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "set col: speed value: 3.0 / speed";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();
  }

  @Test
  public void test_set_type_mismatch() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "set col: speed value: speed * '10'";


    try {
      DataFrame newDf = apply_rule(df, ruleString);
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
    store = apply_rules(store, ruleStrings);
    store.show();
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

    String ruleString = "join leftSelectCol: cdate,pcode1,pcode2,pcode3,pcode4,customer_id,detail_store_code rightSelectCol: detail_store_code,customer_id condition: customer_id=customer_id joinType: 'inner' dataset2: '88888888-4444-4444-4444-121212121212'";
    ArrayList<DataFrame> slaveDFs = new ArrayList<>(Arrays.asList(store));

    DataFrame newDf = apply_rule(contract, ruleString, slaveDFs);
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
    ArrayList<DataFrame> slaveDFs = new ArrayList<>(Arrays.asList(product));

    DataFrame newDf = apply_rule(contract, ruleString, slaveDFs);
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

    String ruleString = "join leftSelectCol: cdate,pcode1,pcode2,pcode3,pcode4,customer_id,detail_store_code rightSelectCol: detail_store_code,customer_id condition: detail_store_code=detail_store_code joinType: 'inner' dataset2: '88888888-4444-4444-4444-121212121212'";
    ArrayList<DataFrame> slaveDFs = new ArrayList<>(Arrays.asList(store));

    DataFrame newDf = apply_rule(contract, ruleString, slaveDFs);
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

    String ruleString = "union";

    DataFrame newDf = apply_rule(store1, ruleString, slaveDataFrames);
    newDf.show();
  }

  @Test
  public void test_extract() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "extract col: name on: 'e' quote: '\"' limit: 3";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();
  }

  @Test
  public void test_extract_regex() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "extract col: cdate on: /\\w+/ quote: '\"' limit: 3";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_countpattern() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "countpattern col: cdate on: '2'";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_countpattern_2_columns() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "countpattern col: cdate, customer_id on: '08'";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_countpattern_3_columns_with_casting() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "countpattern col: cdate, customer_id, detail_store_code on: '08'";

    DataFrame newDf = apply_rule(contract, ruleString);

    ruleString = "sort order: countpattern_cdate_customer_id_detail_store_code type: 'desc'";

    newDf = apply_rule(newDf, ruleString);

    newDf.show();
  }

  @Test
  public void test_countpattern_regex() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "countpattern col: cdate on: /0\\d+/";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_countpattern_ignorecase() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "countpattern col: name on: 'm'";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();

    ruleString = "countpattern col: name on: 'm' ignoreCase: true";

    newDf = apply_rule(newDf, ruleString);
    newDf.show();
  }

  @Test
  public void test_replace() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "replace col: cdate on: '0' with: 'X' global: false";

    DataFrame newDf =apply_rule(contract, ruleString);
    newDf.show();

    ruleString = "replace col: cdate on: '0' with: 'X' global: true";

    newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_replace_multi() throws IOException, TeddyException {
    DataFrame crime = new DataFrame();
    crime.setByGrid(grids.get("crime"), null);
    crime.show();

    String ruleString = "replace col: column3, column5, column7, column8, column9, column10, column11, column12, column13 on: '_' with: '' global: true";

    DataFrame newDf = apply_rule(crime, ruleString);
    newDf.show();
  }

  @Test
  public void test_replace_regex() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show(100);

    String ruleString = "extract col: cdate on: /\\w+/ quote: '\"' limit: 3";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_nest_unnest_array() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "nest col: pcode1, pcode2, pcode3, pcode4 into: array as: pcode";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();

    ruleString = "unnest col: pcode into: array idx: 0";  // into: is not used

    newDf = apply_rule(newDf, ruleString);
    newDf.show();
  }

  @Test
  public void test_nest_map() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "nest col: pcode1, pcode2, pcode3, pcode4 into: map as: pcode";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_nest_unnest_map() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "nest col: pcode1, pcode2, pcode3, pcode4 into: map as: pcode";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();

    ruleString = "unnest col: pcode into: map idx: 'pcode3'"; // into: is not used (remains for backward-compatability)

    newDf = apply_rule(newDf, ruleString);
    newDf.show();
  }

  @Test
  public void test_flatten() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "nest col: pcode1, pcode2, pcode3, pcode4 into: array as: pcode";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();

    ruleString = "flatten col: pcode";

    newDf = apply_rule(newDf, ruleString);
    newDf.show();
  }

  @Test
  public void test_merge() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "merge col: pcode1, pcode2, pcode3, pcode4 with: '_' as: 'pcode'";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_merge_split() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "merge col: pcode1, pcode2, pcode3, pcode4 with: '_' as: 'pcode'";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();

    ruleString = "split col: pcode on: '_' limit: 4";

    newDf = apply_rule(newDf, ruleString);
    newDf.show();
  }

  @Test
  public void test_split_ignorecase() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_sample(df);
    df.show();

    String ruleString = "split col: name on: 'e' limit: 2";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();

    assertEquals("rrari", newDf.rows.get(0).get("split_name2"));
    assertEquals("rc", newDf.rows.get(2).get("split_name2"));

    ruleString = "split col: name on: 'm' limit: 2 ignoreCase: true";

    DataFrame newDf2 = apply_rule(df, ruleString);
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

    String ruleString = "aggregate value: sum(pcode4) group: pcode1, pcode2";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_aggregate_count() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "aggregate value: count() group: pcode1, pcode2";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_aggregate_avg() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "aggregate value: avg(pcode4) group: pcode1, pcode2";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_aggregate_min_max() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "aggregate value: min(detail_store_code), max(detail_store_code) group: pcode1, pcode2";
    
    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_sort() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "sort order: detail_store_code";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show(100);
  }

  @Test
  public void test_sort_multi() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "sort order: pcode1, pcode2, pcode3 type: 'desc'";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show(1000);
  }

  @Test
  public void test_sort_int() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "settype col: detail_store_code type: long";

    DataFrame newDf = apply_rule(contract, ruleString);

    ruleString = "sort order: detail_store_code type: 'desc'";

    newDf = apply_rule(newDf, ruleString);
    newDf.show(100);
  }

  @Test
  public void test_pivot_sum() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "pivot col: pcode1, pcode2 value: sum(detail_store_code), count() group: pcode3, pcode4";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_pivot_avg() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "pivot col: pcode1, pcode2 value: avg(detail_store_code) group: pcode3, pcode4";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show(100);
  }

  @Test
  public void test_unpivot_sum() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "pivot col: pcode1 value: sum(detail_store_code) group: pcode3, pcode4";

    DataFrame newDf = apply_rule(contract, ruleString);

    ruleString = "unpivot col: sum_detail_store_code_1, sum_detail_store_code_2, sum_detail_store_code_3, sum_detail_store_code_4 groupEvery: 1";

    newDf = apply_rule(newDf, ruleString);

    newDf.show();
  }

  @Test
  public void test_unpivot_sum_every() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "pivot col: pcode1 value: sum(detail_store_code) group: pcode3, pcode4";

    DataFrame newDf = apply_rule(contract, ruleString);

    ruleString = "unpivot col: sum_detail_store_code_1, sum_detail_store_code_2, sum_detail_store_code_3, sum_detail_store_code_4 groupEvery: 4";

    newDf = apply_rule(newDf, ruleString);

    newDf.show();
  }

  @Test
  public void test_keep() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "keep row: if(pcode4 < 10)";

    DataFrame newDf = apply_rule(contract, ruleString);

    newDf.show();
  }

  @Test
  public void test_keep_literal() throws IOException, TeddyException {
    DataFrame store = new DataFrame();
    store.setByGrid(grids.get("store1"), null);
    store = prepare_store(store);
    store.show();

    String ruleString = "keep row: if(store_code=='001')";

    DataFrame newDf = apply_rule(store, ruleString);

    newDf.show();
  }

  @Test
  public void test_delete() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "delete row: if(pcode4 < 10)";

    DataFrame newDf = apply_rule(contract, ruleString);

    newDf.show();
  }

  @Test
  public void test_delete2() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "delete row: if(pcode1==1 || pcode4>20)";

    DataFrame newDf = apply_rule(contract, ruleString);

    newDf.show();

    assertEquals("uid01923289", newDf.rows.get(1).get("customer_id"));
    assertEquals("uid00035874", newDf.rows.get(2).get("customer_id"));
  }

  @Test
  public void test_move_before() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode4 before: pcode1";
    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();

    ruleString = "move col: pcode4 before: cdate";
    newDf = apply_rule(contract, ruleString);
    newDf.show();
  }


  @Test
  public void test_move_after() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode4 after: customer_id";
    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_move_after_last() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode4 after: detail_store_code";
    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }
  @Test

  public void test_move_before_multi() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode3, pcode4 before: pcode1";
    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();

    ruleString = "move col: pcode3, pcode4 before: cdate";
    newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_move_after_multi() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode2, pcode3, pcode4 after: customer_id";
    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_move_after_last_multi() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode1, pcode2, pcode3, pcode4 after: detail_store_code";
    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_move_not_continuous_columns() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"), null);
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "move col: pcode1, pcode4 after: detail_store_code";

    try {
      DataFrame newDf = apply_rule(contract, ruleString);
      newDf.show();
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

    try {
      DataFrame newDf = apply_rule(contract, ruleString);
      newDf.show();
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
    String ruleString = "header rownum: 1";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();
    assertEquals("2010_01_01", newDf.getColName(0));

    ruleString = "header rownum: 2";
    newDf = apply_rule(null_contained, ruleString);
    newDf.show();
    assertEquals("column1", newDf.getColName(2));

    ruleString = "header rownum: 6";
    newDf = apply_rule(null_contained, ruleString);
    newDf.show();
    assertEquals("column1", newDf.getColName(3));
    assertEquals("column2", newDf.getColName(4));
  }
}
