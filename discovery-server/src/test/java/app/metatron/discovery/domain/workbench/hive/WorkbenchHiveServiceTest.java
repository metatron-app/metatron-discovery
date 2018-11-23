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

import app.metatron.discovery.domain.datasource.connection.jdbc.HiveConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.workbench.WorkbenchProperties;
import app.metatron.discovery.domain.workbench.dto.ImportCsvFile;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceUtils;
import org.apache.hadoop.fs.Path;
import org.junit.Test;
import org.mockito.ArgumentCaptor;

import java.nio.file.Paths;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Matchers.anyObject;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.*;

public class WorkbenchHiveServiceTest {

  @Test
  public void importFileToPersonalDatabase_csv() {
    // given
    final String webSocketId = "test-ws";
    final String metatronUserId = "polaris";
    HiveConnection hiveConnection = getHiveConnection();
    WorkbenchDataSourceUtils.createDataSourceInfo(hiveConnection, webSocketId, hiveConnection.getUsername(), hiveConnection.getPassword(), false);

    WorkbenchHiveService workbenchHiveService = new WorkbenchHiveService();

    DataTableHiveRepository mockDataTableHiveRepository = mock(DataTableHiveRepository.class);
    final String savedFilePath = String.format("/tmp/metatron/%s.dat", UUID.randomUUID().toString());
    when(mockDataTableHiveRepository.saveToHdfs(eq(hiveConnection), anyObject(), anyObject())).thenReturn(savedFilePath);
    workbenchHiveService.setDataTableHiveRepository(mockDataTableHiveRepository);

    JdbcConnectionService mockJdbcConnectionService = mock(JdbcConnectionService.class);
    workbenchHiveService.setJdbcConnectionService(mockJdbcConnectionService);

    WorkbenchProperties workbenchProperties = new WorkbenchProperties();
    workbenchProperties.setTempCSVPath(getClass().getResource("/").getPath());
    workbenchHiveService.setWorkbenchProperties(workbenchProperties);

    // when
    ImportCsvFile importFile = new ImportCsvFile();
    importFile.setLoginUserId(metatronUserId);
    importFile.setUploadedFile("product_sales.csv");
    importFile.setWebSocketId(webSocketId);
    importFile.setTableName("sales_2018");
    importFile.setFirstRowHeadColumnUsed(true);

    workbenchHiveService.importFileToPersonalDatabase(hiveConnection, importFile);

    // then
    // saveToHdfs
    ArgumentCaptor<Path> argPath = ArgumentCaptor.forClass(Path.class);
    ArgumentCaptor<DataTable> argDataTable = ArgumentCaptor.forClass(DataTable.class);
    verify(mockDataTableHiveRepository).saveToHdfs(eq(hiveConnection), argPath.capture(), argDataTable.capture());
    assertThat(argPath.getValue().toString()).isEqualTo("/tmp/metatron");
    assertThat(argDataTable.getValue().getFields()).hasSize(5);
    assertThat(argDataTable.getValue().getFields()).contains("time", "order_id", "amount", "product_id", "sale_count");
    assertThat(argDataTable.getValue().getRecords()).hasSize(9);
    assertThat(argDataTable.getValue().getRecords()).extracting("time").contains("20/04/2017","21/04/2017","22/04/2017","23/04/2017","24/04/2017","25/04/2017","26/04/2017","27/04/2017","28/04/2017");
    assertThat(argDataTable.getValue().getRecords()).extracting("order_id").contains("1", "2", "3", "4", "5", "6", "7", "8", "9");
    assertThat(argDataTable.getValue().getRecords()).extracting("amount").contains("20","300","400","550","129","212","412","412","2111");
    assertThat(argDataTable.getValue().getRecords()).extracting("product_id").contains("1","1","2","2","3","3","4","4","5");
    assertThat(argDataTable.getValue().getRecords()).extracting("sale_count").contains("1","2","3","4","1","2","3","4","5");

    // saveAsHiveTable
    ArgumentCaptor<String> queries = ArgumentCaptor.forClass(String.class);
    verify(mockJdbcConnectionService, times(3)).ddlQuery(eq(hiveConnection),
        eq(WorkbenchDataSourceUtils.findDataSourceInfo(webSocketId).getSecondarySingleConnectionDataSource()),
        queries.capture());
    assertThat(queries.getAllValues()).hasSize(3);
    assertThat(queries.getAllValues().get(0))
        .isEqualTo(String.format("CREATE DATABASE IF NOT EXISTS %s_%s",
            hiveConnection.getPropertiesMap().get(HiveConnection.PROPERTY_KEY_PERSONAL_DATABASE_PREFIX), metatronUserId));
    assertThat(queries.getAllValues().get(1))
        .isEqualTo(
            String.format("CREATE TABLE %s_%s.%s (`time` STRING, `order_id` STRING, `amount` STRING, `product_id` STRING, `sale_count` STRING) ROW FORMAT DELIMITED FIELDS TERMINATED BY '\\001' LINES TERMINATED BY '\\n'",
                hiveConnection.getPropertiesMap().get(HiveConnection.PROPERTY_KEY_PERSONAL_DATABASE_PREFIX), metatronUserId, importFile.getTableName()));
    assertThat(queries.getAllValues().get(2))
        .isEqualTo(String.format("LOAD DATA INPATH '%s' OVERWRITE INTO TABLE %s_%s.%s",
            savedFilePath, hiveConnection.getPropertiesMap().get(HiveConnection.PROPERTY_KEY_PERSONAL_DATABASE_PREFIX), metatronUserId, importFile.getTableName()));
  }

  private HiveConnection getHiveConnection() {
    HiveConnection hiveConnection = new HiveConnection();
    hiveConnection.setUsername("read_only");
    hiveConnection.setPassword("1111");
    hiveConnection.setHostname("localhost");
    hiveConnection.setPort(10000);
    hiveConnection.setProperties("{" +
        "  \"metatron.hdfs.conf.path\": \"/tmp/hdfs-conf\"," +
        "  \"metatron.hive.admin.name\": \"hive_admin\"," +
        "  \"metatron.hive.admin.password\": \"1111\"," +
        "  \"metatron.personal.database.prefix\": \"private\"" +
        "}");

    return hiveConnection;
  }

}