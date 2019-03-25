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

import com.google.common.collect.Lists;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.accessor.HiveDataAccessor;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveTableInformation;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.datasource.ingestion.HiveIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;
import app.metatron.discovery.domain.datasource.ingestion.IngestionOption;
import app.metatron.discovery.domain.datasource.ingestion.file.OrcFileFormat;
import app.metatron.discovery.domain.storage.StorageProperties;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import app.metatron.discovery.spec.druid.ingestion.HadoopIndex;
import app.metatron.discovery.spec.druid.ingestion.Index;
import app.metatron.discovery.spec.druid.ingestion.IngestionSpec;
import app.metatron.discovery.spec.druid.ingestion.IngestionSpecBuilder;

public class HiveIngestionJob extends AbstractIngestionJob implements IngestionJob {

  private static final Logger LOGGER = LoggerFactory.getLogger(HiveIngestionJob.class);

  private JdbcConnectionService jdbcConnectionService;

  private HiveIngestionInfo ingestionInfo;

  private String srcFilePath;

  private String loadFileName;

  private Index indexSpec;

  public HiveIngestionJob(DataSource dataSource, IngestionHistory ingestionHistory) {
    super(dataSource, ingestionHistory);
    ingestionInfo = dataSource.getIngestionInfoByType();
  }

  public void setJdbcConnectionService(JdbcConnectionService jdbcConnectionService) {
    this.jdbcConnectionService = jdbcConnectionService;
  }

  @Override
  public void preparation() {
    return;
  }

  @Override
  public void loadToEngine() {
    return;
  }

  @Override
  public void buildSpec() {

    StorageProperties.StageDBConnection stageDBConnection = storageProperties.getStagedb();

    String metastoreUri = ingestionInfo.getContextValue(HiveIngestionInfo.KEY_HIVE_METASTORE);
    if (StringUtils.isEmpty(metastoreUri)) {
      metastoreUri = stageDBConnection.getMetastoreUri();
    }

    if (ingestionInfo.getFormat() instanceof OrcFileFormat) {
      String orcSchema = ingestionInfo.getContextValue(HiveIngestionInfo.KEY_ORC_SCHEMA);
      if (StringUtils.isEmpty(orcSchema)) {
        ingestionInfo.setTypeString(makeOrcTypeSchema(stageDBConnection, ingestionInfo.getSource()));
      } else {
        ingestionInfo.setTypeString(orcSchema);
      }
    }

    // Tuning config 외 타 Spec 에서 사용할수 있는 옵션 지정
    // Map Job 내에서 한번에 처리할수 있는 데이터 사이즈 지정 (Hive 인 경우 table directory size)
    String mapSplitSize = null;
    if (MapUtils.isNotEmpty(ingestionInfo.getTuningOptions())) {
      mapSplitSize = (String) ingestionInfo.getTuningOptions().get("mapSplitSize");
    }

    Map<String,Object> tuningOptions = ingestionOptionService.findTuningOptionMap(IngestionOption.IngestionType.HADOOP,
                                                                                  ingestionInfo.getTuningOptions());
    Map<String,Object> jobProperties = ingestionOptionService.findJobOptionMap(IngestionOption.IngestionType.HADOOP,
                                                                               ingestionInfo.getJobProperties());

    // Ingestion Task 생성
    IngestionSpec spec = new IngestionSpecBuilder()
        .dataSchema(dataSource)
        .hiveIoConfig(ingestionInfo.getSource(), metastoreUri, ingestionInfo.getPartitions(), mapSplitSize)
        .hiveTuningConfig(tuningOptions, jobProperties)
        .build();

    indexSpec = new HadoopIndex(spec, ingestionInfo.getContext());
  }

  @Override
  public String process() {
    String taskId = doIngestion(indexSpec);
    LOGGER.info("Successfully creating task : {}", ingestionHistory);
    return taskId;
  }

  private String makeOrcTypeSchema(StorageProperties.StageDBConnection hiveProperties, String source) {
    DataConnection connection = new DataConnection();
    connection.setImplementor("HIVE");
    connection.setUrl(hiveProperties.getUrl());
    connection.setHostname(hiveProperties.getHostname());
    connection.setPort(hiveProperties.getPort());
    connection.setUsername(hiveProperties.getUsername());
    connection.setPassword(hiveProperties.getPassword());

    String[] splited = StringUtils.split(source, ".");
    String schema = splited.length == 1 ? "default" : splited[0];

    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(connection);
    HiveTableInformation hiveTableInformation
        = ((HiveDataAccessor) jdbcDataAccessor).showHiveTableDescription(connection,
                                                                         null,
                                                                         schema,
                                                                         splited[1],
                                                                         false);

    List<String> columnPairs = Lists.newArrayList();
    for (Field field : hiveTableInformation.getFields()) {
      columnPairs.add(field.getName() + ":" + field.getOriginalType());
    }

    return "struct<" + StringUtils.join(columnPairs, ",") + ">";
  }


}

