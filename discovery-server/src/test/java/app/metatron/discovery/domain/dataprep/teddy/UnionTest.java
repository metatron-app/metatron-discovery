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
import java.util.ArrayList;
import java.util.List;
import org.junit.BeforeClass;
import org.junit.Test;

public class UnionTest extends TeddyTest {

  @BeforeClass
  public static void setUp() throws Exception {
    loadGridCsv("store1", "teddy/store.csv");
    loadGridCsv("store2", "teddy/store2.csv");
    loadGridCsv("store3", "teddy/store3.csv");
  }

  @Test
  public void testUnion1() throws IOException, TeddyException {
    DataFrame store1 = new DataFrame();
    store1.setByGrid(grids.get("store1"), null);
    store1 = DataFrameTest.prepare_store(store1);
    store1.show();

    DataFrame store2 = new DataFrame();
    store2.setByGrid(grids.get("store2"), null);
    store2 = DataFrameTest.prepare_store(store2);
    store2.show();

    DataFrame store3 = new DataFrame();
    store3.setByGrid(grids.get("store3"), null);
    store3 = DataFrameTest.prepare_store(store3);
    store3.show();

    String ruleString = "union masterCol: customer_id, detail_store_name dataset2: 'store2'";

    List<DataFrame> slaveLastDfs = new ArrayList<>();
    slaveLastDfs.add(store2);
    slaveLastDfs.add(store3);

    DataFrame newDf = apply_rule(store1, ruleString, slaveLastDfs);

    newDf.show();

    //assertEquals("한성대학교(출)", newDf.rows.get(3000).get("detail_store_name"));   // 1
    //assertEquals("사당역", newDf.rows.get(6000).get("detail_store_name"));   // null
  }
}
