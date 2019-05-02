/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.datasource.ingestion.job;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;

import org.apache.commons.collections.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.List;

import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceIngestionException;
import app.metatron.discovery.domain.datasource.DataSourceSummary;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;
import app.metatron.discovery.domain.datasource.ingestion.IngestionOption;
import app.metatron.discovery.domain.datasource.ingestion.file.CsvFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.BatchIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionErrorCodes;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;
import app.metatron.discovery.spec.druid.ingestion.BatchIndex;
import app.metatron.discovery.spec.druid.ingestion.Index;
import app.metatron.discovery.spec.druid.ingestion.IngestionSpec;
import app.metatron.discovery.spec.druid.ingestion.IngestionSpecBuilder;

import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_COMMON_ERROR;
import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_JDBC_EMPTY_RESULT_ERROR;
import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_JDBC_FETCH_RESULT_ERROR;
import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_JDBC_QUERY_EXECUTION_ERROR;
import static app.metatron.discovery.domain.datasource.ingestion.jdbc.BatchIngestionInfo.IngestionScope.INCREMENTAL;

public class JdbcIngestionJob extends AbstractIngestionJob implements IngestionJob {

  private static final Logger LOGGER = LoggerFactory.getLogger(JdbcIngestionJob.class);

  private JdbcConnectionService jdbcConnectionService;

  private JdbcIngestionInfo ingestionInfo;

  private String srcFilePath;

  private String loadFileName;

  private Index indexSpec;

  public JdbcIngestionJob(DataSource dataSource, IngestionHistory ingestionHistory) {
    super(dataSource, ingestionHistory);
    ingestionInfo = dataSource.getIngestionInfoByType();
    ingestionInfo.setFormat(new CsvFileFormat());
  }

  public void setJdbcConnectionService(JdbcConnectionService jdbcConnectionService) {
    this.jdbcConnectionService = jdbcConnectionService;
  }

  @Override
  public void preparation() {

    DataConnection connection = Preconditions.checkNotNull(dataSource.getJdbcConnectionForIngestion(), "Required connection info.");

    // Select 문을 가지고 CSV 파일로 변환
    List<String> csvFiles = null;

    if (connection.getImplementor().equals("MYSQL")
        || connection.getImplementor().equals("HIVE")
        || connection.getImplementor().equals("PRESTO")) {
      if (ingestionInfo.getDatabase() != null && ingestionInfo.getDataType() == JdbcIngestionInfo.DataType.QUERY) {
        connection.setDatabase(ingestionInfo.getDatabase());
      }
    }

    try {
      if (ingestionInfo instanceof BatchIngestionInfo
          && ((BatchIngestionInfo) ingestionInfo).getRange() == INCREMENTAL) {

        DataSourceSummary summary = dataSource.getSummary();

        csvFiles = jdbcConnectionService.selectIncrementalQueryToCsv(
            connection,
            ingestionInfo,
            dataSource.getEngineName(),
            summary == null ? null : summary.getIngestionMaxTime(),
            dataSource.getFields()
        );
      } else {
        csvFiles = jdbcConnectionService.selectQueryToCsv(
            connection,
            ingestionInfo,
            dataSource.getEngineName(),
            dataSource.getFields()
        );
      }
    } catch (JdbcDataConnectionException ce) {
      if (ce.getCode() == JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE) {
        throw new DataSourceIngestionException(INGESTION_JDBC_QUERY_EXECUTION_ERROR, ce);
      } else if (ce.getCode() == JdbcDataConnectionErrorCodes.CSV_IO_ERROR_CODE) {
        throw new DataSourceIngestionException(INGESTION_JDBC_FETCH_RESULT_ERROR, ce);
      } else {
        throw new DataSourceIngestionException(INGESTION_COMMON_ERROR, ce);
      }
    } catch (Exception e) {
      throw new DataSourceIngestionException(INGESTION_COMMON_ERROR, e);
    }

    if (CollectionUtils.isEmpty(csvFiles)) {
      throw new DataSourceIngestionException(INGESTION_JDBC_EMPTY_RESULT_ERROR, "Empty result of query.");
    }

    File tempFile = new File(csvFiles.get(0));
    if (!tempFile.canRead()) {
      throw new DataSourceIngestionException(INGESTION_JDBC_FETCH_RESULT_ERROR, "Temporary file for ingestion are not available.");
    }

    srcFilePath = tempFile.getAbsolutePath();
    loadFileName = tempFile.getName();
  }

  @Override
  public void loadToEngine() {
    loadFileToEngine(Lists.newArrayList(srcFilePath), Lists.newArrayList(loadFileName));
  }

  @Override
  public void buildSpec() {
    IngestionSpec spec = new IngestionSpecBuilder()
        .dataSchema(dataSource)
        .batchTuningConfig(ingestionOptionService.findTuningOptionMap(IngestionOption.IngestionType.BATCH,
                                                                      ingestionInfo.getTuningOptions()))
        .localIoConfig(engineProperties.getIngestion().getBaseDir(), loadFileName)
        .build();

    indexSpec = new BatchIndex(spec, dedicatedWorker);
  }

  @Override
  public String process() {
    String taskId = doIngestion(indexSpec);
    LOGGER.info("Successfully creating task : {}", ingestionHistory);
    return taskId;
  }

}

