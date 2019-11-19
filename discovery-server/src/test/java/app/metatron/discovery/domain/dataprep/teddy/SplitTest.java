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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import java.io.IOException;
import org.junit.BeforeClass;
import org.junit.Test;

public class SplitTest extends TeddyTest {

  @BeforeClass
  public static void setUp() throws Exception {
    loadGridCsv("sample_split", "teddy/sample_split.csv");
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
}
