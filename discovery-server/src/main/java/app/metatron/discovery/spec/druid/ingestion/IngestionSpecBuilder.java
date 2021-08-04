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
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.spec.druid.ingestion;

import org.apache.commons.collections.MapUtils;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.spec.druid.ingestion.firehose.LocalFirehose;
import app.metatron.discovery.spec.druid.ingestion.index.IndexSpec;
import app.metatron.discovery.spec.druid.ingestion.input.HadoopInputSpec;
import app.metatron.discovery.spec.druid.ingestion.input.HiveInputSpec;
import app.metatron.discovery.spec.druid.ingestion.io.BatchIoConfig;
import app.metatron.discovery.spec.druid.ingestion.io.HadoopIoConfig;
import app.metatron.discovery.spec.druid.ingestion.io.IoConfig;
import app.metatron.discovery.spec.druid.ingestion.tuning.BatchTuningConfig;
import app.metatron.discovery.spec.druid.ingestion.tuning.HadoopTuningConfig;
import app.metatron.discovery.spec.druid.ingestion.tuning.TuningConfig;

/**
 *
 */
public class IngestionSpecBuilder extends AbstractSpecBuilder {

  private TuningConfig tuningConfig;

  private IoConfig ioConfig;

  public IngestionSpecBuilder dataSchema(DataSource dataSource) {

    setDataSchema(dataSource);

    return this;
  }

  public IngestionSpecBuilder batchTuningConfig(Map<String, Object> tuningProperties) {

    tuningConfig = new BatchTuningConfig(tuningProperties);

    addSecondaryIndexing();

    return this;
  }

  public IngestionSpecBuilder hdfsTuningConfig(Map<String, Object> tuningProperties, Map<String, Object> jobProperties) {

    tuningConfig = HadoopTuningConfig.hdfsDefaultConfig();
    ((HadoopTuningConfig) tuningConfig).addJobProperty(jobProperties);
    ((HadoopTuningConfig) tuningConfig).overrideConfig(tuningProperties);

    addSecondaryIndexing();

    return this;
  }

  public IngestionSpecBuilder hiveTuningConfig(Map<String, Object> tuningProperties, Map<String, Object> jobProperties) {

    tuningConfig = HadoopTuningConfig.hiveDefaultConfig();

    ((HadoopTuningConfig) tuningConfig).addJobProperty(jobProperties);
    ((HadoopTuningConfig) tuningConfig).overrideConfig(tuningProperties);

    addSecondaryIndexing();

    return this;
  }

  private void addSecondaryIndexing() {
    if (MapUtils.isEmpty(secondaryIndexing)) {
      return;
    }

    IndexSpec indexSpec = tuningConfig.getIndexSpec();
    if (indexSpec == null) {
      indexSpec = new IndexSpec();
      indexSpec.setSecondaryIndexing(secondaryIndexing);
      tuningConfig.setIndexSpec(indexSpec);
    } else {
      indexSpec.setSecondaryIndexing(secondaryIndexing);
    }
  }

  public IngestionSpecBuilder localIoConfig(String baseDir, String filter) {

    LocalFirehose firehose = new LocalFirehose();
    firehose.setBaseDir(baseDir);
    firehose.setFilter(filter);

    BatchIoConfig config = new BatchIoConfig();
    config.setFirehose(firehose);

    ioConfig = config;

    return this;
  }

  public IngestionSpecBuilder hiveIoConfig(String source, String metastoreUri, List<Map<String, Object>> partialPartitions, String splitSize) {

    HadoopIoConfig hadoopIoConfig = new HadoopIoConfig();
    hadoopIoConfig.setInputSpec(new HiveInputSpec(source, metastoreUri, partialPartitions, splitSize));

    this.ioConfig = hadoopIoConfig;

    return this;
  }

  public IngestionSpecBuilder hdfsIoConfig(List<String> paths, boolean findRecursive, String splitSize) {

    HadoopIoConfig hadoopIoConfig = new HadoopIoConfig();
    if (fileFormat == null) {
      hadoopIoConfig.setInputSpec(new HadoopInputSpec(paths, findRecursive, splitSize));
    } else {
      hadoopIoConfig.setInputSpec(new HadoopInputSpec(paths, findRecursive, splitSize, fileFormat.getInputFormat()));
    }

    ioConfig = hadoopIoConfig;

    return this;
  }

  public IngestionSpec build() {
    IngestionSpec spec = new IngestionSpec();
    spec.setDataSchema(dataSchema);
    spec.setTuningConfig(tuningConfig);
    spec.setIoConfig(ioConfig);

    return spec;
  }
}
