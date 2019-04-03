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

import app.metatron.discovery.domain.dataprep.transform.Histogram;
import org.junit.BeforeClass;
import org.junit.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.dataprep.teddy.exceptions.ColumnNotFoundException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;

public class HistogramTest extends  TeddyTest{

  @BeforeClass
  public static void setUp() throws Exception {
    DataFrameTest.setUp();
  }

  @Test
  public void test_hist_string_raw() throws TeddyException {
    DataFrame contract = new DataFrame();
    contract.setByGrid(DataFrameTest.grids.get("contract"), null);
    contract.show();

    contract = DataFrameTest.prepare_contract(contract);
    contract.show();

    Map<String, Integer> map = new HashMap();
    for (int rowno = 0; rowno < contract.rows.size(); rowno++) {
      String key = contract.rows.get(rowno).get(5).toString();
      Integer val = map.get(key);
      map.put(key, val == null ? 1 : val + 1);
    }

    List<String> labels = new ArrayList<>();
    List<Integer> counts = new ArrayList<>();

    map.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .forEach(entry -> {
              labels.add(entry.getKey());
              counts.add(entry.getValue());
            });

    contract.show();
  }

  private void updateHist(DataFrame df, String colName) throws ColumnNotFoundException {
    int colno = df.getColnoByColName(colName);
    Histogram.createHist(colName, df.getColType(colno), df.rows, colno, null);
  }

  @Test
  public void test_hist_string() throws TeddyException {
    DataFrame sale = new DataFrame();
    sale.setByGrid(DataFrameTest.grids.get("sale"), null);
    sale.show();

    sale = DataFrameTest.prepare_sale(sale);
    sale.show();

    updateHist(sale, "state");

    sale.show();
  }

  @Test
  public void test_hist_long() throws TeddyException {
    DataFrame sale = new DataFrame();
    sale.setByGrid(DataFrameTest.grids.get("sale"), null);
    sale.show();

    sale = DataFrameTest.prepare_sale(sale);
    sale.show();

    updateHist(sale, "price");

    sale.show();
  }

  @Test
  public void test_hist_long_coarse() throws TeddyException {
    DataFrame sale = new DataFrame();
    sale.setByGrid(DataFrameTest.grids.get("sale"), null);
    sale.show();

    sale = DataFrameTest.prepare_sale(sale);
    sale.show();

    updateHist(sale, "quantity");

    sale.show();
  }

  private void test_long_label_single(long min, long max, int barCnt) {
    System.err.print(String.format("min=%d max=%d barCnt=%d ==> ", min, max, barCnt));
    List<Long> labels = Histogram.getLongLabels(min, max, barCnt);
    assert labels != null;
    assert labels.size() > 1 : labels.size();
    System.err.println("longLabels: " + labels.toString());
  }

  @Test
  public void test_long_labels() {
    test_long_label_single(100, 119, 5);
    test_long_label_single(1, 120, 30);
    test_long_label_single(1, 120, 11);
    test_long_label_single(1, 1200, 11);
    test_long_label_single(1, 1199, 11);
    test_long_label_single(50, 60, 10);
    test_long_label_single(50, 60, 11);
    test_long_label_single(1, 25, 5);
    test_long_label_single(1, 26, 5);
    test_long_label_single(1, 2, 3);
    test_long_label_single(-2, -1, 3);
    test_long_label_single(-2, -1, 2);
    test_long_label_single(-200, -100, 2);
    test_long_label_single(-2000, -1123, 20);
    test_long_label_single(-2001, -1123, 20);
    test_long_label_single(-2001, 1123, 20);
  }

  private void test_double_label_single(double min, double max, int barCnt) {
    System.err.print(String.format("min=%.16f max=%.16f barCnt=%d ==> ", min, max, barCnt));
    List<Double> labels = Histogram.getDoubleLabels(min, max, barCnt);
    assert labels != null;
    assert labels.size() > 1 : labels.size();
    System.err.println("doubleLabels: " + labels.toString());
  }

  @Test
  public void test_double_labels() {
    test_double_label_single(1.0, 1.19, 5);
    test_double_label_single(1.0, 1.21, 5);
    test_double_label_single(1.0, 12.0, 5);
    test_double_label_single(1.0, 120.0, 30);
    test_double_label_single(0.1, 0.12, 11);
    test_double_label_single(0.1, 11.99, 11);
    test_double_label_single(0.0005, 0.0006, 10);
    test_double_label_single(0.0005, 0.0006, 11);
    test_double_label_single(0.0005, 0.0016, 10);
    test_double_label_single(0.0005, 0.0016, 11);
    test_double_label_single(10000.0, 10000.25, 5);
    test_double_label_single(10001.0, 10002.26, 5);
    test_double_label_single(1.0, 2.0, 3);
    test_double_label_single(-2.0, -1.0, 3);
    test_double_label_single(-2.0, -1.0, 2);
    test_double_label_single(-0.02, -0.01, 2);
    test_double_label_single(-0.002, -0.001123, 20);
    test_double_label_single(-0.00021, -0.0001123, 20);
    test_double_label_single(-0.000002001, 0.000001123, 20);
//    test_double_label_single(-0.000002001, -0.000002001, 20);   // 같은 경우는 getDoubleLabels() 호출 이전에 특별 처리해주도록 변경했음 -180514jhkim
    test_double_label_single(-0.000002001, 0.000001123, 1);
  }
}
