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

package app.metatron.discovery.spec.druid.ingestion.io;

import java.util.Map;

/**
 * Kafka IO Config
 *
 * @author Kyungtaak Noh
 */
public class KafkaIoConfig implements IoConfig {

  String topic;

  Map<String, Object> consumerProperties;

  Integer taskCount;

  Integer replicas;

  String taskDuration;

  public KafkaIoConfig() {
  }

  public KafkaIoConfig(String topic, Map<String, Object> consumerProperties, Integer taskCount, Integer replicas, String taskDuration) {
    this.topic = topic;
    this.consumerProperties = consumerProperties;
    this.taskCount = taskCount;
    this.replicas = replicas;
    this.taskDuration = taskDuration;
  }

  public String getTopic() {
    return topic;
  }

  public void setTopic(String topic) {
    this.topic = topic;
  }

  public Map<String, Object> getConsumerProperties() {
    return consumerProperties;
  }

  public void setConsumerProperties(Map<String, Object> consumerProperties) {
    this.consumerProperties = consumerProperties;
  }

  public Integer getTaskCount() {
    return taskCount;
  }

  public void setTaskCount(Integer taskCount) {
    this.taskCount = taskCount;
  }

  public Integer getReplicas() {
    return replicas;
  }

  public void setReplicas(Integer replicas) {
    this.replicas = replicas;
  }

  public String getTaskDuration() {
    return taskDuration;
  }

  public void setTaskDuration(String taskDuration) {
    this.taskDuration = taskDuration;
  }
}
