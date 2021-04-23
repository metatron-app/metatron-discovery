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

import java.util.Map;

import app.metatron.discovery.spec.druid.ingestion.io.IoConfig;
import app.metatron.discovery.spec.druid.ingestion.tuning.TuningConfig;

/**
 * Kafka RealTime Spec
 *
 * @author Kyungtaak Noh
 */
public class KafkaRealTimeIndex implements SupervisorIndex {

  /**
   * Supervisor Id
   */
  String id;

  /**
   * Data Schema Spec.
   */
  DataSchema dataSchema;

  /**
   * tuning configuration
   */
  TuningConfig tuningConfig;

  /**
   * Input configuration
   */
  IoConfig ioConfig;

  /**
   * Context - Extra. configuration
   */
  Map<String, Object> context;

  public KafkaRealTimeIndex() {
  }

  public DataSchema getDataSchema() {
    return dataSchema;
  }

  public void setDataSchema(DataSchema dataSchema) {
    this.dataSchema = dataSchema;
  }

  public TuningConfig getTuningConfig() {
    return tuningConfig;
  }

  public void setTuningConfig(TuningConfig tuningConfig) {
    this.tuningConfig = tuningConfig;
  }

  public IoConfig getIoConfig() {
    return ioConfig;
  }

  public void setIoConfig(IoConfig ioConfig) {
    this.ioConfig = ioConfig;
  }

  public Map<String, Object> getContext() {
    return context;
  }

  public void setContext(Map<String, Object> context) {
    this.context = context;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }
}
