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
package app.metatron.discovery.domain.workbench.hive;

import org.apache.hadoop.fs.Path;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.TestLocalHdfs;

import static org.assertj.core.api.Assertions.assertThat;


public class DataTableHiveRepositoryTest {
  final TestLocalHdfs testLocalHdfs = new TestLocalHdfs("/tmp/hdfs-conf");

  @Before
  public void setUp() throws IOException, InterruptedException {
    testLocalHdfs.delete(new Path("/tmp/metatron/test"));
  }

  @Test
  public void saveToHdfs() throws IOException, InterruptedException {
    // given
    List<String> fields = Arrays.asList("records.year", "records.temperature", "records.quality");

    List<Map<String, Object>> records = new ArrayList<>();
    Map<String, Object> record1 = new HashMap<>();
    record1.put("records.year", "1990");
    record1.put("records.temperature", 10);
    record1.put("records.quality", 0);
    records.add(record1);
    Map<String, Object> record2 = new HashMap<>();
    record2.put("records.year", "1991");
    record2.put("records.temperature", 20);
    record2.put("records.quality", 1);
    records.add(record2);

    DataTable dataTable = new DataTable(fields, records);

    // when
    final DataTableHiveRepository dataTableHiveRepository = new DataTableHiveRepository();

    HivePersonalDatasource hivePersonalDatasource = new HivePersonalDatasource("/tmp/hdfs-conf", "hive_admin", "1111", "private");
    String filePath = dataTableHiveRepository.saveToHdfs(hivePersonalDatasource, new Path("/tmp/metatron/test"), dataTable, "");

    // then
    assertThat(testLocalHdfs.exists(new Path(filePath))).isTrue();
  }
}