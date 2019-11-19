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
  }

  @Test
  public void test_replace_multi() throws IOException, TeddyException {
    DataFrame crime = new DataFrame();
    crime.setByGrid(grids.get("crime"));
    crime.show();

    String ruleString = "replace col: column3, column5, column7, column8, column9, column10, column11, column12,"
            + " column13 on: '_' with: '' global: true";

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

  @Test
  public void test_extract_extra() throws IOException, TeddyException {
    DataFrame sales = new DataFrame();
    sales.setByGrid(grids.get("sales_regex_test"));
    sales = prepare_sales_regex_test(sales);

    String ruleString = "extract col: desc on: /[a-zA-Z]+/ quote:'\"' limit: 8 global:true";
    DataFrame newDf = apply_rule(sales, ruleString);
    newDf.show();

    assertNull(newDf.rows.get(0).get("extract_desc4"));
    assertEquals("TSP", newDf.rows.get(1).get("extract_desc4"));
    assertNull(newDf.rows.get(2).get("extract_desc4"));
    assertEquals("TSP", newDf.rows.get(3).get("extract_desc4"));
  }

  @Test
  public void test_extract_quote_literal() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"Nortel Networks T7316 \"E Nt8 B27\""},
            {"SM TSP800 TSP847IIU Receipt Printer"},
            {"SM \"TSP100 TSP143LAN Receipt\" Printer"},
            {"SM \"TSP100\" TSP143LAN Receipt Printer"},
            {}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"desc"});

    // When the pattern is "TSP":
    // Nortel Networks T7316 "E Nt8 B27" -> None
    // "SM TSP800 TSP847IIU Receipt Printer" -> [TSP], [TSP], null
    // "SM \"TSP100 TSP143LAN Receipt\" Printer" -> null, null, null
    // "SM \"TSP100\" TSP143LAN Receipt Printer" -> [TSP], null, null

    df = apply_rule(df, "extract col: desc on: 'TSP' quote: '\"' limit: 3");
    assertRow(df.rows.get(0), new Object[]{"Nortel Networks T7316 \"E Nt8 B27\"", null, null, null});
    assertRow(df.rows.get(1), new Object[]{"SM TSP800 TSP847IIU Receipt Printer", "TSP", "TSP", null});
    assertRow(df.rows.get(2), new Object[]{"SM \"TSP100 TSP143LAN Receipt\" Printer", null, null, null});
    assertRow(df.rows.get(3), new Object[]{"SM \"TSP100\" TSP143LAN Receipt Printer", "TSP", null, null});
    assertRow(df.rows.get(4), new Object[]{null, null, null, null});
  }

  @Test
  public void test_extract_unmatched_quote_literal() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"Nortel Networks T7316 \"E Nt8 B27\""},
            {"SM \"TSP800 TSP847IIU Receipt Printer"},
            {"SM \"\"TSP100 TSP143LAN Receipt\" Printer"},
            {"SM \"\"TSP100\" TSP143LAN Receipt Printer"}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"desc"});

    // When the pattern is "TSP":
    // Nortel Networks T7316 "E Nt8 B27" -> None
    // "SM \"TSP800 TSP847IIU Receipt Printer" -> null, null, null
    // "SM \"\"TSP100 TSP143LAN Receipt\" Printer" -> [TSP], [TSP], null
    // "SM \"\"TSP100\" TSP143LAN Receipt Printer" -> [TSP], null, null

    df = apply_rule(df, "extract col: desc on: 'TSP' quote: '\"' limit: 3");
    assertRow(df.rows.get(0), new Object[]{"Nortel Networks T7316 \"E Nt8 B27\"", null, null, null});
    assertRow(df.rows.get(0), new Object[]{"Nortel Networks T7316 \"E Nt8 B27\"", null, null, null});
    assertRow(df.rows.get(1), new Object[]{"SM \"TSP800 TSP847IIU Receipt Printer", null, null, null});
    assertRow(df.rows.get(2), new Object[]{"SM \"\"TSP100 TSP143LAN Receipt\" Printer", "TSP", "TSP", null});
    assertRow(df.rows.get(3), new Object[]{"SM \"\"TSP100\" TSP143LAN Receipt Printer", "TSP", null, null});
  }

  @Test
  public void test_extract_quote_regex() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"Nortel Networks T7316 \"E Nt8 B27\""},
            {"SM TSP800 TSP847IIU Receipt Printer"},
            {"SM \"TSP100 TSP143LAN Receipt\" Printer"},
            {"SM \"TSP100\" TSP143LAN Receipt Printer"},
            {}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"desc"});

    // When the pattern is "/[\s\W\\"]+[^\s\d\W]+\d+/" (Words start with alphabets, end numeric chars after):
    // Nortel Networks T7316 "E Nt8 B27" -> [T7316], null, null
    // "SM TSP800 TSP847IIU Receipt Printer" -> [TSP800], [TSP847IIU], null
    // "SM \"TSP100 TSP143LAN Receipt\" Printer" -> null, null, null
    // "SM \"TSP100\" TSP143LAN Receipt Printer" -> [TSP143LAN], null, null

    df = apply_rule(df, "extract col: desc on: /[^\\s\\W]\\w+\\d+\\w*/ quote: '\"' limit: 3");
    assertRow(df.rows.get(0), new Object[]{"Nortel Networks T7316 \"E Nt8 B27\"", "T7316", null, null});
    assertRow(df.rows.get(1), new Object[]{"SM TSP800 TSP847IIU Receipt Printer", "TSP800", "TSP847IIU", null});
    assertRow(df.rows.get(2), new Object[]{"SM \"TSP100 TSP143LAN Receipt\" Printer", null, null, null});
    assertRow(df.rows.get(3), new Object[]{"SM \"TSP100\" TSP143LAN Receipt Printer", "TSP143LAN", null, null});
  }

  @Test
  public void test_extract_weird_quote_regex() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"Nortel Networks T7316 \"E Nt8 B27\""},
            {"SM \"TSP800 TSP847IIU Receipt Printer"},
            {"SM \"\"TSP100 TSP143LAN Receipt\" Printer"},
            {"SM \"\"TSP100\" TSP143LAN Receipt Printer"},
            {}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"desc"});

    // Nortel Networks T7316 "E Nt8 B27" -> [T7316], null, null
    // "SM \"TSP800 TSP847IIU Receipt Printer" -> null, null, null
    // "SM \"\"TSP100 TSP143LAN Receipt\" Printer" -> [TSP100], [TSP143LAN], null
    // "SM \"\"TSP100\" TSP143LAN Receipt Printer" -> [TSP143LAN], null, null

    df = apply_rule(df, "extract col: desc on: /[^\\s\\W]\\w+\\d+\\w*/ quote: '\"' limit: 3");
    assertRow(df.rows.get(0), new Object[]{"Nortel Networks T7316 \"E Nt8 B27\"", "T7316", null, null});
    assertRow(df.rows.get(1), new Object[]{"SM \"TSP800 TSP847IIU Receipt Printer", null, null, null});
    assertRow(df.rows.get(2), new Object[]{"SM \"\"TSP100 TSP143LAN Receipt\" Printer", "TSP100", "TSP143LAN", null});
    assertRow(df.rows.get(3), new Object[]{"SM \"\"TSP100\" TSP143LAN Receipt Printer", "TSP100", null, null});
  }

  // Countpattern test cases below are almost the same to extract test cases above.

  @Test
  public void test_countpattern() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"));
    df = prepare_sample(df);
    df.show();

    String ruleString = "countpattern col: name on: 'e'";

    DataFrame newDf = apply_rule(df, ruleString);
    newDf.show();

    assertEquals(1L, newDf.rows.get(0).get("countpattern_name"));
    assertEquals(0L, newDf.rows.get(1).get("countpattern_name"));
    assertEquals(3L, newDf.rows.get(2).get("countpattern_name"));
    assertEquals(0L, newDf.rows.get(3).get("countpattern_name"));
    assertEquals(0L, newDf.rows.get(4).get("countpattern_name"));
  }

  @Test
  public void test_countpattern_regex() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"));
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "countpattern col: cdate on: /\\w+/";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();

    assertEquals(3L, newDf.rows.get(0).get("countpattern_cdate"));
    assertEquals(3L, newDf.rows.get(1).get("countpattern_cdate"));
    assertEquals(3L, newDf.rows.get(2).get("countpattern_cdate"));
    assertEquals(3L, newDf.rows.get(3).get("countpattern_cdate"));
    assertEquals(3L, newDf.rows.get(4).get("countpattern_cdate"));
  }

  @Test
  public void test_countpattern_quote_literal() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"Nortel Networks T7316 \"E Nt8 B27\""},
            {"SM TSP800 TSP847IIU Receipt Printer"},
            {"SM \"TSP100 TSP143LAN Receipt\" Printer"},
            {"SM \"TSP100\" TSP143LAN Receipt Printer"},
            {}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"desc"});

    // When the pattern is "TSP":
    // Nortel Networks T7316 "E Nt8 B27" -> None
    // "SM TSP800 TSP847IIU Receipt Printer" -> [TSP], [TSP], null
    // "SM \"TSP100 TSP143LAN Receipt\" Printer" -> null, null, null
    // "SM \"TSP100\" TSP143LAN Receipt Printer" -> [TSP], null, null
    // Null -> 0

    df = apply_rule(df, "countpattern col: desc on: 'TSP' quote: '\"'");
    assertRow(df.rows.get(0), new Object[]{"Nortel Networks T7316 \"E Nt8 B27\"", 0L});
    assertRow(df.rows.get(1), new Object[]{"SM TSP800 TSP847IIU Receipt Printer", 2L});
    assertRow(df.rows.get(2), new Object[]{"SM \"TSP100 TSP143LAN Receipt\" Printer", 0L});
    assertRow(df.rows.get(3), new Object[]{"SM \"TSP100\" TSP143LAN Receipt Printer", 1L});
    assertRow(df.rows.get(4), new Object[]{null, 0L});
  }

  @Test
  public void test_countpattern_unmatched_quote_literal() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"Nortel Networks T7316 \"E Nt8 B27\""},
            {"SM \"TSP800 TSP847IIU Receipt Printer"},
            {"SM \"\"TSP100 TSP143LAN Receipt\" Printer"},
            {"SM \"\"TSP100\" TSP143LAN Receipt Printer"}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"desc"});

    // When the pattern is "TSP":
    // Nortel Networks T7316 "E Nt8 B27" -> None
    // "SM \"TSP800 TSP847IIU Receipt Printer" -> null, null, null
    // "SM \"\"TSP100 TSP143LAN Receipt\" Printer" -> [TSP], [TSP], null
    // "SM \"\"TSP100\" TSP143LAN Receipt Printer" -> [TSP], null, null

    df = apply_rule(df, "countpattern col: desc on: 'TSP' quote: '\"' limit: 3");
    assertRow(df.rows.get(0), new Object[]{"Nortel Networks T7316 \"E Nt8 B27\"", 0L});
    assertRow(df.rows.get(1), new Object[]{"SM \"TSP800 TSP847IIU Receipt Printer", 0L});
    assertRow(df.rows.get(2), new Object[]{"SM \"\"TSP100 TSP143LAN Receipt\" Printer", 2L});
    assertRow(df.rows.get(3), new Object[]{"SM \"\"TSP100\" TSP143LAN Receipt Printer", 1L});
  }

  @Test
  public void test_countpattern_quote_regex() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"Nortel Networks T7316 \"E Nt8 B27\""},
            {"SM TSP800 TSP847IIU Receipt Printer"},
            {"SM \"TSP100 TSP143LAN Receipt\" Printer"},
            {"SM \"TSP100\" TSP143LAN Receipt Printer"},
            {}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"desc"});

    // When the pattern is "/[\s\W\\"]+[^\s\d\W]+\d+/" (Words start with alphabets, end numeric chars after):
    // Nortel Networks T7316 "E Nt8 B27" -> [T7316], null, null
    // "SM TSP800 TSP847IIU Receipt Printer" -> [TSP800], [TSP847IIU], null
    // "SM \"TSP100 TSP143LAN Receipt\" Printer" -> null, null, null
    // "SM \"TSP100\" TSP143LAN Receipt Printer" -> [TSP143LAN], null, null

    df = apply_rule(df, "countpattern col: desc on: /[^\\s\\W]\\w+\\d+\\w*/ quote: '\"'");
    assertRow(df.rows.get(0), new Object[]{"Nortel Networks T7316 \"E Nt8 B27\"", 1L});
    assertRow(df.rows.get(1), new Object[]{"SM TSP800 TSP847IIU Receipt Printer", 2L});
    assertRow(df.rows.get(2), new Object[]{"SM \"TSP100 TSP143LAN Receipt\" Printer", 0L});
    assertRow(df.rows.get(3), new Object[]{"SM \"TSP100\" TSP143LAN Receipt Printer", 1L});
    assertRow(df.rows.get(4), new Object[]{null, 0L});
  }

  @Test
  public void test_countpattern_weird_quote_regex() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"Nortel Networks T7316 \"E Nt8 B27\""},
            {"SM \"TSP800 TSP847IIU Receipt Printer"},
            {"SM \"\"TSP100 TSP143LAN Receipt\" Printer"},
            {"SM \"\"TSP100\" TSP143LAN Receipt Printer"},
            {}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"desc"});

    // Nortel Networks T7316 "E Nt8 B27" -> [T7316], null, null
    // "SM \"TSP800 TSP847IIU Receipt Printer" -> null, null, null
    // "SM \"\"TSP100 TSP143LAN Receipt\" Printer" -> [TSP100], [TSP143LAN], null
    // "SM \"\"TSP100\" TSP143LAN Receipt Printer" -> [TSP143LAN], null, null

    df = apply_rule(df, "countpattern col: desc on: /[^\\s\\W]\\w+\\d+\\w*/ quote: '\"'");
    assertRow(df.rows.get(0), new Object[]{"Nortel Networks T7316 \"E Nt8 B27\"", 1L});
    assertRow(df.rows.get(1), new Object[]{"SM \"TSP800 TSP847IIU Receipt Printer", 0L});
    assertRow(df.rows.get(2), new Object[]{"SM \"\"TSP100 TSP143LAN Receipt\" Printer", 2L});
    assertRow(df.rows.get(3), new Object[]{"SM \"\"TSP100\" TSP143LAN Receipt Printer", 1L});
  }

  @Test
  public void test_countpattern_extra() throws IOException, TeddyException {
    DataFrame sales = new DataFrame();
    sales.setByGrid(grids.get("sales_regex_test"));
    sales = prepare_sales_regex_test(sales);

    String ruleString = "countpattern col: desc on: /[a-zA-Z]+/ quote:'\"' global:true";
    DataFrame newDf = apply_rule(sales, ruleString);
    newDf.show();

    assertEquals(3L, newDf.rows.get(0).get("countpattern_desc"));
    assertEquals(3L, newDf.rows.get(0).get("countpattern_desc"));
    assertEquals(3L, newDf.rows.get(0).get("countpattern_desc"));
    assertEquals(3L, newDf.rows.get(0).get("countpattern_desc"));
  }
}
