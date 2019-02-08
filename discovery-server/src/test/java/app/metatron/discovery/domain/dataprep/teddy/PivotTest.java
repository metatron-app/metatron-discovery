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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;

import static org.junit.Assert.assertEquals;

/**
 * WrangleTest
 */
public class PivotTest extends TeddyTest {

  @BeforeClass
  public static void setUp() throws Exception {
    loadGridCsv("multi", "teddy/pivot_test_multiple_column.csv");
  }

  private DataFrame newMultiDataFrame() throws IOException, TeddyException {
    DataFrame multi = new DataFrame();
    multi.setByGrid(grids.get("multi"), null);
    multi = prepare_multi(multi);
    multi.show();
    return multi;
  }

  @Test
  public void test_pivot1() throws IOException, TeddyException {
    DataFrame multi = newMultiDataFrame();
    String ruleString = "pivot col: minute value: sum(measure) group: machine_code";
    DataFrame newDf = apply_rule(multi, ruleString);
    newDf.show();

    assertEquals(new Long(124), newDf.rows.get(0).get("sum_measure_00_00"));
  }

  @Test
  public void test_pivot2() throws IOException, TeddyException {
    DataFrame multi = newMultiDataFrame();
    String ruleString = "pivot col: minute value: sum(measure) group: machine_code,module_code";
    DataFrame newDf = apply_rule(multi, ruleString);
    newDf.show();

    assertEquals(new Long(30), newDf.rows.get(0).get("sum_measure_00_00"));
  }

  @Test
  public void test_pivot3() throws IOException, TeddyException {
    DataFrame multi = newMultiDataFrame();
    String ruleString = "pivot col: minute, column15 value: count(), sum(measure) group: machine_code,module_code";
    DataFrame newDf = apply_rule(multi, ruleString);
    newDf.show();

    assertEquals(new Long(30), newDf.rows.get(0).get("sum_measure_00_00_true"));
  }

  @Test
  public void test_pivot4() throws IOException, TeddyException {
    DataFrame multi = newMultiDataFrame();
    String ruleString = "pivot col: minute, column15 value: sum(measure), count() group: machine_code,module_code";
    DataFrame newDf = apply_rule(multi, ruleString);
    newDf.show();

    assertEquals(new Long(30), newDf.rows.get(0).get("sum_measure_00_00_true"));
  }

  @Test
  public void test_pivot5() throws IOException, TeddyException {
    DataFrame multi = newMultiDataFrame();
    String ruleString = "pivot col: minute, column15 value: sum(measure), min(measure), max(measure), count() group: machine_code";
    DataFrame newDf = apply_rule(multi, ruleString);
    newDf.show();

    assertEquals(new Long(32), newDf.rows.get(0).get("sum_measure_00_00_false"));
  }

  @Test
  public void test_pivot6() throws IOException, TeddyException {
    DataFrame multi = newMultiDataFrame();
    String ruleString = "pivot col: minute, column15 value: sum(measure), count() group: machine_code,module_code";
    DataFrame newDf = apply_rule(multi, ruleString);
    newDf.show();

    assertEquals(new Long(0), newDf.rows.get(0).get("sum_measure_00_00_false"));
  }

  @Test
  public void test_pivot7() throws IOException, TeddyException {
    DataFrame multi = newMultiDataFrame();
    String ruleString = "pivot col: minute, column15,column7 value: sum(measure), count() group: machine_code,module_code";
    DataFrame newDf = apply_rule(multi, ruleString);
    newDf.show();

    assertEquals(new Long(0), newDf.rows.get(0).get("sum_measure_00_00_false_3"));
  }

  @Test
  public void test_pivot8() throws IOException, TeddyException {
    DataFrame multi = newMultiDataFrame();
    String ruleString = "pivot col: minute, column11 value: count()";
    DataFrame newDf = apply_rule(multi, ruleString);
    newDf.show();

    assertEquals(new Long(8), newDf.rows.get(0).get("row_count_00_00_0_0"));
  }

  @Test
  public void test_unpivot1() throws IOException, TeddyException {
    DataFrame multi = newMultiDataFrame();
    String ruleString = "unpivot col: minute,column15,column7 groupEvery: 3";
    DataFrame newDf = apply_rule(multi, ruleString);
    newDf.show();

    assertEquals("00:00", newDf.rows.get(0).get("value1"));
  }

  @Test
  public void test_unpivot2() throws IOException, TeddyException {
    DataFrame multi = newMultiDataFrame();
    String ruleString = "unpivot col: column7,column11,column16,column12 groupEvery: 1";
    DataFrame newDf = apply_rule(multi, ruleString);
    newDf.show();

    assertEquals("2", newDf.rows.get(0).get("value1"));
  }

  @Test
  public void test_unpivot3() throws IOException, TeddyException {
    DataFrame multi = newMultiDataFrame();
    String ruleString = "unpivot col: column7 groupEvery: 1";
    DataFrame newDf = apply_rule(multi, ruleString);
    newDf.show();

    assertEquals("2", newDf.rows.get(0).get("value1"));
  }

  @Test
  public void test_unpivot4() throws IOException, TeddyException {
    DataFrame multi = newMultiDataFrame();
    String ruleString = "unpivot col: column7";
    DataFrame newDf = apply_rule(multi, ruleString);
    newDf.show();

    assertEquals("2", newDf.rows.get(0).get("value1"));
  }
}
