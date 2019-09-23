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

public class SplitTest extends TeddyTest {

  @BeforeClass
  public static void setUp() throws Exception {
    loadGridCsv("sample", "teddy/sample_split.csv");
  }

  private DataFrame newNullContainedDataFrame() throws IOException, TeddyException {
    DataFrame sample = new DataFrame();
    sample.setByGrid(grids.get("sample"), null);
    sample = prepare_null_contained(sample);
    sample.show();
    return sample;
  }

  @Test
  public void testSplit1() throws IOException, TeddyException {
    String ruleString = "split col: contract_date on: '-' limit: 10 quote: '\"' ignoreCase: true";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("\"2017-01\"", newDf.rows.get(0).get("split_contract_date1"));   // 1

  }

  @Test
  public void testSplit2() throws IOException, TeddyException {
    String ruleString = "split col: contract_date on: '-' limit: 2 quote: '\"' ignoreCase: false";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("\"2017-01\"", newDf.rows.get(0).get("split_contract_date1"));   // 1

  }

  @Test
  public void testSplit3() throws IOException, TeddyException {
    String ruleString = "split col: birth_date on: '-' limit: 1 ignoreCase: false";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("2010", newDf.rows.get(0).get("split_birth_date1"));   // 1

  }

  @Test
  public void testSplit4() throws IOException, TeddyException {
    String ruleString = "split col: birth_date on: '-' limit: 1 ignoreCase: false";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("2010", newDf.rows.get(0).get("split_birth_date1"));   // 1

  }

  @Test
  public void testSplit5() throws IOException, TeddyException {
    String ruleString = "split col: contract_date on: '-' limit: 2 ignoreCase: false";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("\"2017", newDf.rows.get(0).get("split_contract_date1"));   // 1

  }

  @Test
  public void testSplit6() throws IOException, TeddyException {
    String ruleString = "split col: contract_date on: /-/ limit: 2 ignoreCase: false";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("\"2017", newDf.rows.get(0).get("split_contract_date1"));   // 1

  }

  @Test
  public void testSplit7() throws IOException, TeddyException {
    String ruleString = "split col: name on: 'e' limit: 3 ignoreCase: false";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("F", newDf.rows.get(0).get("split_name1"));   // 1

  }

  @Test
  public void testSplit8() throws IOException, TeddyException {
    String ruleString = "split col: name on: 'E' limit: 2 ignoreCase: true";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("F", newDf.rows.get(0).get("split_name1"));   // 1

  }

  @Test
  public void testSplit9() throws IOException, TeddyException {
    String ruleString = "split col: name on: 'ER' limit: 2 ignoreCase: false";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("Ferrari", newDf.rows.get(0).get("split_name1"));   // 1

  }

  @Test
  public void testSplit10() throws IOException, TeddyException {
    String ruleString = "split col: name on: 'ER' limit: 2 ignoreCase: true";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("F", newDf.rows.get(0).get("split_name1"));   // 1

  }

  @Test
  public void testSplit11() throws IOException, TeddyException {
    String ruleString = "split col: name on: 'ER'";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("Ferrari", newDf.rows.get(0).get("split_name1"));   // 1

  }

  @Test
  public void testSplit12() throws IOException, TeddyException {
    String ruleString = "split col: name on: 'er' limit: 0";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("Ferrari", newDf.rows.get(0).get("split_name1"));   // 1

  }

  @Test
  public void testSplit13() throws IOException, TeddyException {
    String ruleString = "split col: contract_date on: '-' limit: 2 ignoreCase: true";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("\"2017", newDf.rows.get(0).get("split_contract_date1"));   // 1

  }

  @Test
  public void testSplit14() throws IOException, TeddyException {
    String ruleString = "split col: contract_date on: '-' limit: 2 quote: '@|' ignoreCase: true";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("\"2017", newDf.rows.get(0).get("split_contract_date1"));   // 1

  }

  @Test
  public void testSplit15() throws IOException, TeddyException {
    String ruleString = "split col: contract_date on: '-' limit: 7 quote: '\"' ignoreCase: true";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("\"2017-01\"", newDf.rows.get(0).get("split_contract_date1"));   // 1

  }

  @Test
  public void testSplit16() throws IOException, TeddyException {
    String ruleString = "split col: name on: '0' quote: '-' limit: 5 ignoreCase: true";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("22-12300", newDf.rows.get(11).get("split_name2"));   // 1

  }

  @Test
  public void testSplit17() throws IOException, TeddyException {
    String ruleString = "split col: name on: 'e' quote: '-' limit: 5 global:true";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    //assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1

  }

  @Test
  public void extractTest1() throws IOException, TeddyException {
    String ruleString = "extract col: contract_date on: '-' quote: '\"' limit: 10";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1

  }

  @Test
  public void extractTest2() throws IOException, TeddyException {
    String ruleString = "extract col: name on: /[a-zA-z]+/ quote: '\"' limit: 10";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("Ferrari", newDf.rows.get(0).get("extract_name1"));   // 1

  }

  @Test
  public void extractTest3() throws IOException, TeddyException {
    String ruleString = "extract col: name on: /[0-9]+/ quote: '-' limit: 10";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("123022", newDf.rows.get(11).get("extract_name1"));   // 1

  }

  @Test
  public void replace1() throws IOException, TeddyException {
    String ruleString = "replace col: name on: '1' with: 'X' quote:'-' global:true";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    //assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1

  }

  @Test
  public void replace2() throws IOException, TeddyException {
    String ruleString = "replace col: name on: 'e' with: 'E' quote:'\"' global:true";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    //assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1

  }

  @Test
  public void countPattern1() throws IOException, TeddyException {
    String ruleString = "countpattern col: name on: '0' quote:'-' global:true";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    //assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1

  }

  @Test
  public void countPattern2() throws IOException, TeddyException {
    String ruleString = "countpattern col: name on: /[0-9]/ quote:'-' global:true";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    //assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1

  }

  @Test
  public void countPattern3() throws IOException, TeddyException {
    String ruleString = "countpattern col: name on: /[a-zA-Z]+/ quote:'-' global:true";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    //assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1

  }

  @Test
  public void countPattern4() throws IOException, TeddyException {
    String ruleString = "countpattern col: name on: /[a-zA-Z]+/ quote:'\"' global:true";

    DataFrame null_contained = newNullContainedDataFrame();
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(3L, newDf.rows.get(9).get("countpattern_name"));   // 1

  }

}
