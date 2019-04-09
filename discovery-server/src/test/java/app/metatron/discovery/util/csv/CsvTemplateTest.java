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
package app.metatron.discovery.util.csv;

import com.google.common.collect.Maps;
import org.junit.Test;

import java.io.File;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class CsvTemplateTest {

  @Test
  public void getRows() {
    // given
    final String filePath = getClass().getClassLoader().getResource("product_sales.csv").getPath();
    final boolean firstRowHeadColumnUsed = true;

    // when
    CsvTemplate csvTemplate = new CsvTemplate(new File(filePath));
    Map<Integer, String> headers = Maps.newTreeMap();
    List<Map<String, String>> csvData = csvTemplate.getRows("\n", ",",
        (rowNumber, row) -> {
          if(rowNumber == 1) {
            if(firstRowHeadColumnUsed) {
              for (int i = 0; i < row.length; i++) {
                headers.put(i, row[i]);
              }
              return null;
            } else {
              for (int i = 0; i < row.length; i++) {
                headers.put(i, "col_" + (i + 1));
              }
            }
          }

          Map<String, String> rowMap = Maps.newTreeMap();
          for (int i = 0; i < row.length; i++) {
            if (headers.containsKey(i)) {
              rowMap.put(headers.get(i), row[i]);
            }
          }

          return rowMap;
        });

    // then
    assertThat(headers).hasSize(5);
    assertThat(headers).containsValues("time", "order_id", "amount", "product_id", "sale_count");

    assertThat(csvData).hasSize(9);
    assertThat(csvData).extracting("time").contains("20/04/2017", "21/04/2017", "22/04/2017", "23/04/2017", "24/04/2017", "25/04/2017", "26/04/2017", "27/04/2017", "28/04/2017");
    assertThat(csvData).extracting("order_id").contains("1", "2", "3", "4", "5", "6", "7", "8", "9");
    assertThat(csvData).extracting("amount").contains("20", "300", "400", "550", "129", "212", "412", "412", "2111");
    assertThat(csvData).extracting("product_id").contains("1", "1", "2", "2", "3", "3", "4", "4", "5");
    assertThat(csvData).extracting("sale_count").contains("1", "2", "3", "4", "1", "2", "3", "4", "5");
  }

  @Test
  public void getRows_when_limit() {
    // given
    final String filePath = getClass().getClassLoader().getResource("product_sales.csv").getPath();
    final boolean firstRowHeadColumnUsed = true;

    // when
    CsvTemplate csvTemplate = new CsvTemplate(new File(filePath));
    Map<Integer, String> headers = Maps.newTreeMap();
    List<Map<String, String>> csvData = csvTemplate.getRows("\n", ",",
        (rowNumber, row) -> {
          if(rowNumber == 1) {
            if(firstRowHeadColumnUsed) {
              for (int i = 0; i < row.length; i++) {
                headers.put(i, row[i]);
              }
              return null;
            } else {
              for (int i = 0; i < row.length; i++) {
                headers.put(i, "col_" + (i + 1));
              }
            }
          }

          Map<String, String> rowMap = Maps.newTreeMap();
          for (int i = 0; i < row.length; i++) {
            if (headers.containsKey(i)) {
              rowMap.put(headers.get(i), row[i]);
            }
          }

          return rowMap;
    }, 3);

    // then

    assertThat(headers).hasSize(5);
    assertThat(headers).containsValues("time", "order_id", "amount", "product_id", "sale_count");

    assertThat(csvData).hasSize(2);
    assertThat(csvData).extracting("time").contains("20/04/2017", "21/04/2017");
    assertThat(csvData).extracting("order_id").contains("1", "2");
    assertThat(csvData).extracting("amount").contains("20", "300");
    assertThat(csvData).extracting("product_id").contains("1", "1");
    assertThat(csvData).extracting("sale_count").contains("1", "2");
  }

  @Test
  public void getTotalRows() {
    // given
    final String filePath = getClass().getClassLoader().getResource("product_sales.csv").getPath();
    CsvTemplate csvTemplate = new CsvTemplate(new File(filePath));

    // when
    int totalRows = csvTemplate.getTotalRows( "\n", ",");

    // then
    assertThat(totalRows).isEqualTo(10);
  }
}