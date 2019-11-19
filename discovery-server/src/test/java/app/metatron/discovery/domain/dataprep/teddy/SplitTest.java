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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
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

    df = apply_rule(df, "split col: dt on: '-' limit: 3 quote: '\"' ignoreCase: false");
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

    df = apply_rule(df, "split col: text on: 'i' limit: 4 ignoreCase: false");
    assertRow(df.rows.get(0), new Object[]{"Th", "s ", "s a sample l", "ne. IgnoreCase case.", null});

    df = createByGrid(strGrid, new String[]{"text"});
    df = apply_rule(df, "split col: text on: 'i' limit: 4 ignoreCase: true");
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

//  @Test
//  public void testSplit5() throws IOException, TeddyException {
//    String ruleString = "split col: contract_date on: '-' limit: 2 ignoreCase: false";
//
//    DataFrame null_contained = prepare_sample_split();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("\"2017", newDf.rows.get(0).get("split_contract_date1"));   // 1
//
//  }
//
//  @Test
//  public void testSplit6() throws IOException, TeddyException {
//    String ruleString = "split col: contract_date on: /-/ limit: 2 ignoreCase: false";
//
//    DataFrame null_contained = prepare_sample_split();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("\"2017", newDf.rows.get(0).get("split_contract_date1"));   // 1
//
//  }
//
//  @Test
//  public void testSplit7() throws IOException, TeddyException {
//    String ruleString = "split col: name on: 'e' limit: 3 ignoreCase: false";
//
//    DataFrame null_contained = prepare_sample_split();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("F", newDf.rows.get(0).get("split_name1"));   // 1
//
//  }
//
//  @Test
//  public void testSplit8() throws IOException, TeddyException {
//    String ruleString = "split col: name on: 'E' limit: 2 ignoreCase: true";
//
//    DataFrame null_contained = prepare_sample_split();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("F", newDf.rows.get(0).get("split_name1"));   // 1
//
//  }
//
//  @Test
//  public void testSplit9() throws IOException, TeddyException {
//    String ruleString = "split col: name on: 'ER' limit: 2 ignoreCase: false";
//
//    DataFrame null_contained = prepare_sample_split();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("Ferrari", newDf.rows.get(0).get("split_name1"));   // 1
//
//  }
//
//  @Test
//  public void testSplit10() throws IOException, TeddyException {
//    String ruleString = "split col: name on: 'ER' limit: 2 ignoreCase: true";
//
//    DataFrame null_contained = prepare_sample_split();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("F", newDf.rows.get(0).get("split_name1"));   // 1
//
//  }
//
//  @Test
//  public void testSplit11() throws IOException, TeddyException {
//    String ruleString = "split col: name on: 'ER'";
//
//    DataFrame null_contained = prepare_sample_split();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("Ferrari", newDf.rows.get(0).get("split_name1"));   // 1
//
//  }
//
//  @Test
//  public void testSplit12() throws IOException, TeddyException {
//    String ruleString = "split col: name on: 'er' limit: 0";
//
//    DataFrame null_contained = prepare_sample_split();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("Ferrari", newDf.rows.get(0).get("split_name1"));   // 1
//
//  }
//
//  @Test
//  public void testSplit13() throws IOException, TeddyException {
//    String ruleString = "split col: contract_date on: '-' limit: 2 ignoreCase: true";
//
//    DataFrame null_contained = prepare_sample_split();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("\"2017", newDf.rows.get(0).get("split_contract_date1"));   // 1
//
//  }
//
//  @Test
//  public void testSplit14() throws IOException, TeddyException {
//    String ruleString = "split col: contract_date on: '-' limit: 2 quote: '@|' ignoreCase: true";
//
//    DataFrame null_contained = prepare_sample_split();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("\"2017", newDf.rows.get(0).get("split_contract_date1"));   // 1
//
//  }
//
//  @Test
//  public void testSplit15() throws IOException, TeddyException {
//    String ruleString = "split col: contract_date on: '-' limit: 7 quote: '\"' ignoreCase: true";
//
//    DataFrame null_contained = prepare_sample_split();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("\"2017-01\"", newDf.rows.get(0).get("split_contract_date1"));   // 1
//
//  }
//
//  @Test
//  public void testSplit16() throws IOException, TeddyException {
//    String ruleString = "split col: name on: '0' quote: '-' limit: 5 ignoreCase: true";
//
//    DataFrame null_contained = prepare_sample_split();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("22-12300", newDf.rows.get(11).get("split_name2"));   // 1
//
//  }
//
//  @Test
//  public void testSplit17() throws IOException, TeddyException {
//    String ruleString = "split col: name on: 'e' quote: '-' limit: 5 global:true";
//
//    DataFrame null_contained = prepare_sample_split();
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    //assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1
//
//  }
}
