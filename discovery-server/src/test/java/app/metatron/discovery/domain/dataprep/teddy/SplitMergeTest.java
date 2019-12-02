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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import java.io.IOException;
import org.junit.BeforeClass;
import org.junit.Test;

public class SplitMergeTest extends TeddyTest {

  @BeforeClass
  public static void setUp() throws Exception {
    loadGridCsv("contract", "teddy/contract.csv");
    loadGridCsv("sample", "teddy/sample.csv");
    loadGridCsv("sample_split", "teddy/sample_split.csv");
    loadGridCsv("contract", "teddy/contract.csv");
  }

  private DataFrame prepare_sample_split() throws IOException, TeddyException {
    DataFrame sample_split = new DataFrame();
    sample_split.setByGrid(grids.get("sample_split"));
    sample_split = prepare_null_contained(sample_split);
    sample_split.show();
    return sample_split;
  }


  @Test
  public void testSplit() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{{"2017-01-12"}};
    DataFrame df = createByGrid(strGrid, new String[]{"dt"});

    df = apply_rule(df, "split col: dt on: '-' limit: 3 ignoreCase: false");
    assertRow(df.rows.get(0), new Object[]{"2017", "01", "12", null});
  }

  @Test
  public void testSplitQuote() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{{"2017\"-01\"-12"}};
    DataFrame df = createByGrid(strGrid, new String[]{"dt"});

    df = apply_rule(df, "split col: dt on: '-' limit: 3 quote: '\"' ignoreCase: false");
    assertRow(df.rows.get(0), new Object[]{"2017\"-01\"", "12", null, null});
  }

  @Test
  public void testSplitIgnoreCase() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{{"This is a sample line. IgnoreCase case."}};
    DataFrame df = createByGrid(strGrid, new String[]{"text"});

    df = apply_rule(df, "split col: text on: 'i' limit: 5 ignoreCase: false");
    assertRow(df.rows.get(0), new Object[]{"Th", "s ", "s a sample l", "ne. IgnoreCase case.", null});

    df = createByGrid(strGrid, new String[]{"text"});
    df = apply_rule(df, "split col: text on: 'i' limit: 5 ignoreCase: true");
    assertRow(df.rows.get(0), new Object[]{"Th", "s ", "s a sample l", "ne. ", "gnoreCase case."});
  }

  @Test
  public void testSplitEmptyOrNull() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"This is a sample line. IgnoreCase case."},
            {""},
            {}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"text"});
    df = apply_rule(df, "split col: text on: 'i' limit: 4 ignoreCase: false");
    assertRow(df.rows.get(0), new Object[]{"Th", "s ", "s a sample l", "ne. IgnoreCase case.", null});
    assertRow(df.rows.get(1), new Object[]{"", null, null, null, null});
    assertRow(df.rows.get(2), new Object[]{null, null, null, null, null});
  }

  @Test
  public void testSplitMultiChar() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"This is a sample line. IgnoreCase case."},
            {""},
            {}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"text"});
    df = apply_rule(df, "split col: text on: 'is' limit: 4 ignoreCase: false");
    assertRow(df.rows.get(0), new Object[]{"Th", " ", " a sample line. IgnoreCase case.", null, null});
    assertRow(df.rows.get(1), new Object[]{"", null, null, null, null});
    assertRow(df.rows.get(2), new Object[]{null, null, null, null, null});
  }

  @Test
  public void testSplitRegEx() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"This is a sample line. IgnoreCase case."},
            {""},
            {}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"text"});
    df = apply_rule(df, "split col: text on: /i\\w+/ limit: 4");
    assertRow(df.rows.get(0), new Object[]{"Th", " ", " a sample l", ". IgnoreCase case."});
    assertRow(df.rows.get(1), new Object[]{"", null, null, null});
    assertRow(df.rows.get(2), new Object[]{null, null, null, null});
  }

  @Test
  public void testSplitRegExQuote() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"Nortel Networks T7316 \"E Nt8 B27\""},
            {"SM TSP800 TSP847IIU Receipt Printer"},
            {"SM \"TSP100 TSP143LAN Receipt\" Printer"}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"desc"});

    // When the pattern is "/[\s\W\\"]+[^\s\d\W]+\d+/" (Words start with alphabets, end numeric chars after):
    // Nortel Networks T7316 "E Nt8 B27" -> [Nortel Networks ], [ "E ], [ ], ["], null
    // "SM TSP800 TSP847IIU Receipt Printer" -> [SM ], [ ], [ Receipt Printer], null, null
    // "SM \"TSP100 TSP143LAN Receipt\" Printer" -> [SM "], [ ], [ Receipt" Printer], null, null

    df = apply_rule(df, "split col: desc on: /[^\\s\\W]\\w+\\d+\\w*/ limit: 4");
    assertRow(df.rows.get(0), new Object[]{"Nortel Networks ", " \"E ", " ", "\"", null});
    assertRow(df.rows.get(1), new Object[]{"SM ", " ", " Receipt Printer", null, null});
    assertRow(df.rows.get(2), new Object[]{"SM \"", " ", " Receipt\" Printer", null, null});

    // When a quote is used:
    // Nortel Networks T7316 "E Nt8 B27" -> [Nortel Networks ], [ "E Nt8 B27"], null, null, null
    // "SM TSP800 TSP847IIU Receipt Printer" -> [SM ], [ ], [ Receipt Printer], null, null
    // "SM \"TSP100 TSP143LAN Receipt\" Printer" -> [SM "TSP100 TSP143LAN Receipt Printer"], null, null, null, null

    df = createByGrid(strGrid, new String[]{"desc"});
    df = apply_rule(df, "split col: desc on: /[^\\s\\W]\\w+\\d+\\w*/ limit: 4 quote: '\"'");

    assertRow(df.rows.get(0), new Object[]{"Nortel Networks ", " \"E Nt8 B27\"", null, null, null});
    assertRow(df.rows.get(1), new Object[]{"SM ", " ", " Receipt Printer", null, null});
    assertRow(df.rows.get(2), new Object[]{"SM \"TSP100 TSP143LAN Receipt\" Printer", null, null, null, null});
  }

  @Test
  public void test_merge() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"));
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "merge col: pcode1, pcode2, pcode3, pcode4 with: '_' as: 'pcode'";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_merge_split() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"));
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
    df.setByGrid(grids.get("sample"));
    df = prepare_sample(df);
    df.show();

    String ruleString = "split col: name on: 'e' limit: 3";

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
  public void test_merge_null() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"Nortel Networks", "T7316 \"E Nt8 B27\""},
            {"SM", "TSP800", "TSP847IIU", "Receipt Printer"},
            {"SM", "\"TSP100", "TSP143LAN", "Receipt\" Printer"},
            {null, null, null},
            {}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"manufacturer", "model1", "model2", "etc"});

    df = apply_rule(df, "merge col: manufacturer, model1, model2, etc with: ',' as 'altogether'");
    assertRow(df.rows.get(0), new Object[]{"Nortel Networks,T7316 \"E Nt8 B27\""});
    assertRow(df.rows.get(1), new Object[]{"SM,TSP800,TSP847IIU,Receipt Printer"});
    assertRow(df.rows.get(2), new Object[]{"SM,\"TSP100,TSP143LAN,Receipt\" Printer"});
    assertRow(df.rows.get(3), new Object[]{""});
    assertRow(df.rows.get(4), new Object[]{""});
  }
}
