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
  public void test_nest_map() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"));
    contract = prepare_contract(contract);
    contract.show();

    String ruleString = "nest col: pcode1, pcode2, pcode3, pcode4 into: map as: pcode";

    DataFrame newDf = apply_rule(contract, ruleString);
    newDf.show();
  }

  @Test
  public void test_nest_unnest_map() throws IOException, TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(grids.get("contract"));
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
