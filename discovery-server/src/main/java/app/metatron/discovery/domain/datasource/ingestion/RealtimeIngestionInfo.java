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

package app.metatron.discovery.domain.datasource.ingestion;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.Map;

import app.metatron.discovery.domain.datasource.ingestion.file.FileFormat;

/**
 * Specify Real-time ingestion
 */
@JsonTypeName("realtime")
public class RealtimeIngestionInfo implements IngestionInfo {

  /**
   * Target Topic Name
   */
  String topic;

  /**
   * Consumer Type
   */
  ConsumerType consumerType = ConsumerType.KAFKA;

  /**
   * Set properties of consumer
   */
  Map<String, Object> consumerProperties;

  /**
   * Specify file format
   */
  FileFormat format;

  /**
   * Roll-up
   */
  Boolean rollup;

  /**
   * Specify task option
   */
  Map<String, Object> taskOptions;

  /**
   * Specify Tuning Configuration, override default Value
   */
  Map<String, Object> tuningOptions;

  public RealtimeIngestionInfo() {
  }

  @JsonCreator
  public RealtimeIngestionInfo(@JsonProperty("topic") String topic,
                               @JsonProperty("consumerProperties") Map<String, Object> consumerProperties,
                               @JsonProperty("format") FileFormat format,
                               @JsonProperty("rollup") Boolean rollup,
                               @JsonProperty("taskOptions") Map<String, Object> taskOptions,
                               @JsonProperty("tuningOptions") Map<String, Object> tuningOptions) {
    this.topic = topic;
    this.consumerProperties = consumerProperties;
    this.format = format;
    this.rollup = rollup == null ? false : rollup;
    this.taskOptions = taskOptions;
    this.tuningOptions = tuningOptions;
  }

  @Override
  public FileFormat getFormat() {
    return format;
  }

  @Override
  public Map<String, Object> getTuningOptions() {
    return tuningOptions;
  }

  @Override
  public Boolean getRollup() {
    return rollup;
  }

  public String getTopic() {
    return topic;
  }

  public ConsumerType getConsumerType() {
    return consumerType;
  }

  public Map<String, Object> getConsumerProperties() {
    return consumerProperties;
  }

  public Map<String, Object> getTaskOptions() {
    return taskOptions;
  }

  public enum ConsumerType {
    KAFKA
  }
}
