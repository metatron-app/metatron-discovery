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

import java.util.Map;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.spec.druid.ingestion.io.IoConfig;
import app.metatron.discovery.spec.druid.ingestion.io.KafkaIoConfig;
import app.metatron.discovery.spec.druid.ingestion.tuning.KafkaTuningConfig;
import app.metatron.discovery.spec.druid.ingestion.tuning.TuningConfig;

/**
 * Kafka RealTime Spec
 *
 * @author Kyungtaak Noh
 */
public class KafkaRealTimeIndexBuilder extends AbstractSpecBuilder {

  String id;

  TuningConfig tuningConfig;

  IoConfig ioConfig;

  Map<String, Object> context;

  public KafkaRealTimeIndexBuilder() {
  }

  public KafkaRealTimeIndexBuilder dataSchema(DataSource dataSource) {

    // Set the id for supervisor update
    id = dataSource.getEngineName();

    setDataSchema(dataSource);

    return this;
  }

  public KafkaRealTimeIndexBuilder ioConfig(String topic,
                                            Map<String, Object> consumerProperties,
                                            Map<String, Object> ioOptions,
                                            Map<String, Object> tuningConfigs) {

    if(MapUtils.isNotEmpty(ioOptions)) {
      ioConfig = new KafkaIoConfig(topic, consumerProperties, ioOptions);
    } else {
      // remain for backward compatibility..
      int taskCount = 1;
      int replicas = 1;
      String taskDuration = "PT1H";

      if (MapUtils.isNotEmpty(tuningConfigs)) {
        if (tuningConfigs.containsKey("taskCount")) {
          taskCount = Integer.parseInt(tuningConfigs.get("taskCount") + "");
        }

        if (tuningConfigs.containsKey("replicas")) {
          replicas = Integer.parseInt(tuningConfigs.get("replicas") + "");
        }

        if (tuningConfigs.containsKey("taskDuration")) {
          taskDuration = (String) tuningConfigs.get("taskDuration");
        }
      }
      ioConfig = new KafkaIoConfig(topic, consumerProperties, taskCount, replicas, taskDuration);
    }

    return this;
  }

  public KafkaRealTimeIndexBuilder tuningConfig(Map<String, Object> tuningConfigs) {
    tuningConfig = KafkaTuningConfig.defaultConfig();

    ((KafkaTuningConfig) tuningConfig).overrideConfig(tuningConfigs);

    return this;
  }

  public KafkaRealTimeIndexBuilder context(Map<String, Object> contexts) {
    this.context = contexts;

    return this;
  }

  public KafkaRealTimeIndex build() {

    KafkaRealTimeIndex spec = new KafkaRealTimeIndex();
    spec.setId(id);
    spec.setDataSchema(dataSchema);
    spec.setTuningConfig(tuningConfig);
    spec.setIoConfig(ioConfig);
    spec.setContext(context);

    return spec;
  }
}
