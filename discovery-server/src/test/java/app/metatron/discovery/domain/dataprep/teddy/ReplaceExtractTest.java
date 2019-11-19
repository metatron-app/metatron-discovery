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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import app.metatron.discovery.domain.dataprep.teddy.exceptions.ColumnNotFoundException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import java.io.IOException;
import org.junit.BeforeClass;
import org.junit.Test;

public class ReplaceExtractTest extends TeddyTest {

  @BeforeClass
  public static void setUp() throws Exception {
    loadGridCsv("sample", "teddy/sample.csv");
    loadGridCsv("contract", "teddy/contract.csv");
    loadGridCsv("crime", "teddy/crime.csv");
    loadGridCsv("sales_regex_test", "teddy/sales_regex_test.csv");

    // Original values of sales desc column:
    // "Nortel Networks T7316 \"E Nt8 B27\""
    // "SM TSP800 TSP847IIU Receipt Printer"
    // "SM \"TSP100 TSP143LAN Receipt\" Printer"
    // "SM TSP800 TSP847IIU Receipt Printer"
  }

  @Test
  public void test_replace() throws IOException, TeddyException {
    DataFrame sales = new DataFrame();
    sales.setByGrid(grids.get("sales_regex_test"));
    sales = prepare_sales_regex_test(sales);

    String ruleString = "replace col: `desc` on: 'Star Micronics' with: 'SM' global: false";
    DataFrame newDf = apply_rule(sales, ruleString);
    newDf.show();

    assertEquals("Nortel Networks T7316 \"E Nt8 B27\"", newDf.rows.get(0).get("desc"));
    assertEquals("SM TSP800 TSP847IIU Receipt Printer", newDf.rows.get(1).get("desc"));
    assertEquals("SM \"TSP100 TSP143LAN Receipt\" Printer", newDf.rows.get(2).get("desc"));
    assertEquals("SM TSP800 TSP847IIU Receipt Printer", newDf.rows.get(3).get("desc"));
  }

  @Test
  public void test_replace_multi() throws IOException, TeddyException {
    DataFrame crime = new DataFrame();
    crime.setByGrid(grids.get("crime"));
    crime.show();

    String ruleString = "replace col: column3, column5, column7, column8, column9, column10, column11, column12, column13 on: '_' with: '' global: true";

    DataFrame newDf = apply_rule(crime, ruleString);
    newDf.show();
  }

  @Test
  public void test_replace_regex() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"));
    contract = prepare_contract(contract);
    contract.show(100);

    String ruleString = "extract col: cdate on: /\\w+/ quote: '\"' limit: 3";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_extract() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"));
    df = prepare_sample(df);
    df.show();

    String ruleString = "extract col: name on: 'e' limit: 3";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();

    assertEquals("e", newDf.rows.get(0).get("extract_name1"));
    assertNull(newDf.rows.get(0).get("extract_name2"));

    assertNull(newDf.rows.get(1).get("extract_name1"));
    assertNull(newDf.rows.get(1).get("extract_name2"));

    assertEquals("e", newDf.rows.get(2).get("extract_name1"));
    assertEquals("e", newDf.rows.get(2).get("extract_name2"));
    assertEquals("e", newDf.rows.get(2).get("extract_name3"));
  }

  @Test
  public void test_extract_regex() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"));
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "extract col: cdate on: /\\w+/ limit: 3";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();

    assertEquals("2012", newDf.rows.get(0).get("extract_cdate1"));
  }

//  @Test
//  public void extractTest1() throws IOException, TeddyException {
//    String ruleString = "extract col: contract_date on: '-' quote: '\"' limit: 10";
//
//    DataFrame null_contained = newNullContainedDataFrame();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1
//
//  }
//
//  @Test
//  public void extractTest2() throws IOException, TeddyException {
//    String ruleString = "extract col: name on: /[a-zA-z]+/ quote: '\"' limit: 10";
//
//    DataFrame null_contained = newNullContainedDataFrame();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("Ferrari", newDf.rows.get(0).get("extract_name1"));   // 1
//
//  }
//
//  @Test
//  public void extractTest3() throws IOException, TeddyException {
//    String ruleString = "extract col: name on: /[0-9]+/ quote: '-' limit: 10";
//
//    DataFrame null_contained = newNullContainedDataFrame();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("123022", newDf.rows.get(11).get("extract_name1"));   // 1
//
//  }
//
//  @Test
//  public void replace1() throws IOException, TeddyException {
//    String ruleString = "replace col: name on: '1' with: 'X' quote:'-' global:true";
//
//    DataFrame null_contained = newNullContainedDataFrame();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1
//
//  }
//
//  @Test
//  public void replace2() throws IOException, TeddyException {
//    String ruleString = "replace col: name on: 'e' with: 'E' quote:'\"' global:true";
//
//    DataFrame null_contained = newNullContainedDataFrame();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1
//
//  }
//
//  @Test
//  public void countPattern1() throws IOException, TeddyException {
//    String ruleString = "countpattern col: name on: '0' quote:'-' global:true";
//
//    DataFrame null_contained = newNullContainedDataFrame();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1
//
//  }
//
//  @Test
//  public void countPattern2() throws IOException, TeddyException {
//    String ruleString = "countpattern col: name on: /[0-9]/ quote:'-' global:true";
//
//    DataFrame null_contained = newNullContainedDataFrame();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1
//
//  }
//
//  @Test
//  public void countPattern3() throws IOException, TeddyException {
//    String ruleString = "countpattern col: name on: /[a-zA-Z]+/ quote:'-' global:true";
//
//    DataFrame null_contained = newNullContainedDataFrame();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1
//
//  }
//
//  // FIXME: different from extract
//  //  @Test
//  public void countPattern4() throws IOException, TeddyException {
//    DataFrame sales = new DataFrame();
//    sales.setByGrid(grids.get("sales_regex_test"));
//    sales = prepare_sales_regex_test(sales);
//
//    // When the pattern is "/[\s\W\\"]+[^\s\d\W]+\d+/"
//    // Nortel Networks T7316 "E Nt8 B27" ->
//
//    String ruleString = "countpattern col: desc on: /[a-zA-Z]+/ quote:'\"' global:true";
//    DataFrame newDf = apply_rule(sales, ruleString);
//    newDf.show();
//
//    assertEquals(3L, newDf.rows.get(9).get("countpattern_name"));   // 1
//
//  }
//
//  @Test
//  public void test_countpattern() throws IOException, TeddyException {
//    DataFrame contract = new DataFrame();
//    contract.setByGrid(grids.get("contract"));
//    contract = prepare_contract(contract);
//    contract.show();
//
//    String ruleString = "countpattern col: cdate on: '2'";
//
//    DataFrame newDf = apply_rule(contract, ruleString);
//    newDf.show();
//  }
//
//  @Test
//  public void test_countpattern_2_columns() throws IOException, TeddyException {
//    DataFrame contract = new DataFrame();
//    contract.setByGrid(grids.get("contract"));
//    contract = prepare_contract(contract);
//    contract.show();
//
//    String ruleString = "countpattern col: cdate, customer_id on: '08'";
//
//    DataFrame newDf = apply_rule(contract, ruleString);
//    newDf.show();
//  }
//
//  @Test
//  public void test_countpattern_3_columns_with_casting() throws IOException, TeddyException {
//    DataFrame contract = new DataFrame();
//    contract.setByGrid(grids.get("contract"));
//    contract = prepare_contract(contract);
//    contract.show();
//
//    String ruleString = "countpattern col: cdate, customer_id, detail_store_code on: '08'";
//
//    DataFrame newDf = apply_rule(contract, ruleString);
//
//    ruleString = "sort order: countpattern_cdate_customer_id_detail_store_code type: 'desc'";
//
//    newDf = apply_rule(newDf, ruleString);
//
//    newDf.show();
//  }
//
//  @Test
//  public void test_countpattern_regex() throws IOException, TeddyException {
//    DataFrame contract = new DataFrame();
//    contract.setByGrid(grids.get("contract"));
//    contract = prepare_contract(contract);
//    contract.show();
//
//    String ruleString = "countpattern col: cdate on: /0\\d+/";
//
//    DataFrame newDf = apply_rule(contract, ruleString);
//    newDf.show();
//  }
//
//  @Test
//  public void test_countpattern_ignorecase() throws IOException, TeddyException {
//    DataFrame df = new DataFrame();
//    df.setByGrid(grids.get("sample"));
//    df = prepare_sample(df);
//    df.show();
//
//    String ruleString = "countpattern col: name on: 'm'";
//
//    DataFrame newDf = apply_rule(df, ruleString);
//    newDf.show();
//
//    ruleString = "countpattern col: name on: 'm' ignoreCase: true";
//
//    newDf = apply_rule(newDf, ruleString);
//    newDf.show();
//  }


}
