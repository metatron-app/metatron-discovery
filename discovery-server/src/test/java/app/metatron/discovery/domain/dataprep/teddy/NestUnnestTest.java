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

public class NestUnnestTest extends TeddyTest {

  @BeforeClass
  public static void setUp() throws Exception {
    loadGridCsv("contract", "teddy/contract.csv");
  }

  @Test
  public void test_nest_unnest_array() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"));
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "nest col: pcode1, pcode2, pcode3, pcode4 into: array as: pcode";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();

    ruleString = "unnest col: pcode into: array idx: '0'";  // "into" is used in spark engine

    newDf = apply_rule(newDf, ruleString);
    newDf.show();
  }

  @Test
  public void test_nest_unnest_array_multi() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"));
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "nest col: pcode1, pcode2, pcode3, pcode4 into: array as: pcode";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();

    ruleString = "unnest col: pcode into: array idx: '0', '1', '3'";  // "into" is used in spark engine

    newDf = apply_rule(newDf, ruleString);
    newDf.show();
  }

  @Test
  public void test_nest_unnest_map() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"3", "1", "2"},
            {"1", "1", "3"},
            {"3", "1", "4"},
            {}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"a", "b", "c"});

    df = apply_rule(df, "settype col: a, b type: long");

    df = apply_rule(df, "nest col: a, b, c into: map as: d");
    assertRow(df.rows.get(0), new Object[]{3L, 1L, "2", "{\"a\":3,\"b\":1,\"c\":\"2\"}"});
    assertRow(df.rows.get(1), new Object[]{1L, 1L, "3", "{\"a\":1,\"b\":1,\"c\":\"3\"}"});
    assertRow(df.rows.get(2), new Object[]{3L, 1L, "4", "{\"a\":3,\"b\":1,\"c\":\"4\"}"});
    assertRow(df.rows.get(3), new Object[]{null, null, null, "{}"});

    DataFrame df2 = apply_rule(df, "unnest col: d into: map idx: 'a'");
    assertRow(df2.rows.get(0), new Object[]{3L, 1L, "2", "{\"a\":3,\"b\":1,\"c\":\"2\"}", 3L});
    assertRow(df2.rows.get(1), new Object[]{1L, 1L, "3", "{\"a\":1,\"b\":1,\"c\":\"3\"}", 1L});
    assertRow(df2.rows.get(2), new Object[]{3L, 1L, "4", "{\"a\":3,\"b\":1,\"c\":\"4\"}", 3L});

    df2 = apply_rule(df, "unnest col: d into: map idx: 'c'");
    assertRow(df2.rows.get(0), new Object[]{3L, 1L, "2", "{\"a\":3,\"b\":1,\"c\":\"2\"}", "2"});
    assertRow(df2.rows.get(1), new Object[]{1L, 1L, "3", "{\"a\":1,\"b\":1,\"c\":\"3\"}", "3"});
    assertRow(df2.rows.get(2), new Object[]{3L, 1L, "4", "{\"a\":3,\"b\":1,\"c\":\"4\"}", "4"});
  }

  @Test
  public void test_nest_unnest_map_multi() throws IOException, TeddyException {
    String[][] strGrid = new String[][]{
            {"3", "2"},
            {"1", "3"},
            {null, "4"},
            {}
    };
    DataFrame df = createByGrid(strGrid, new String[]{"a", "b"});

    df = apply_rule(df, "settype col: a type: long");

    df = apply_rule(df, "nest col: a, b into: map as: c");
    assertRow(df.rows.get(0), new Object[]{3L, "2", "{\"a\":3,\"b\":\"2\"}"});
    assertRow(df.rows.get(1), new Object[]{1L, "3", "{\"a\":1,\"b\":\"3\"}"});
    assertRow(df.rows.get(2), new Object[]{null, "4", "{\"b\":\"4\"}"});
    assertRow(df.rows.get(3), new Object[]{null, null, "{}"});

    DataFrame df2 = apply_rule(df, "unnest col: c into: map idx: 'a', 'b'");
    assertRow(df2.rows.get(0), new Object[]{3L, "2", "{\"a\":3,\"b\":\"2\"}", 3L, "2"});
    assertRow(df2.rows.get(1), new Object[]{1L, "3", "{\"a\":1,\"b\":\"3\"}", 1L, "3"});
    assertRow(df2.rows.get(2), new Object[]{null, "4", "{\"b\":\"4\"}", null, "4"});
  }

  @Test
  public void test_flatten() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"));
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "nest col: pcode1, pcode2, pcode3, pcode4 into: array as: pcode";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();

    ruleString = "flatten col: pcode";

    newDf = apply_rule(newDf, ruleString);
    newDf.show();
  }
}
