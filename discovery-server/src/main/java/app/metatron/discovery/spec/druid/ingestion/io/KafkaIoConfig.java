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

  /**
   * The length of time before tasks stop reading and begin publishing their segment.
   * Note that segments are only pushed to deep storage and loadable by historical nodes when the indexing task completes.
   */
  String taskDuration;

  /**
   * The period to wait before the supervisor starts managing tasks.
   */
  String startDelay;

  /**
   * How often the supervisor will execute its management logic.
   * Note that the supervisor will also run in response to certain events
   * (such as tasks succeeding, failing, and reaching their taskDuration)
   * so this value specifies the maximum time between iterations.
   * default PT30S
   */
  String period;

  /**
   * If a supervisor is managing a dataSource for the first time,
   * it will obtain a set of starting offsets from Kafka.
   * This flag determines whether it retrieves the earliest or latest offsets in Kafka.
   * Under normal circumstances, subsequent tasks will start from where the previous segments ended
   * so this flag will only be used on first run.
   */
  Boolean useEarliestOffset;

  /**
   * The length of time to wait before declaring a publishing task as failed and terminating it.
   * If this is set too low, your tasks may never publish.
   * The publishing clock for a task begins roughly after taskDuration elapses.
   */
  String completionTimeout;

  String lateMessageRejectionPeriod;

  public KafkaIoConfig() {
  }

  public KafkaIoConfig(String topic, Map<String, Object> consumerProperties, Integer taskCount, Integer replicas, String taskDuration) {
    this.topic = topic;
    this.consumerProperties = consumerProperties;
    this.taskCount = taskCount;
    this.replicas = replicas;
    this.taskDuration = taskDuration;
  }

  public KafkaIoConfig(String topic, Map<String, Object> consumerProperties, Map<String, Object> taskOptions) {
    this.topic = topic;
    this.consumerProperties = consumerProperties;
    this.taskCount = (Integer) taskOptions.get("taskCount");
    this.replicas = (Integer) taskOptions.get("replicas");
    this.taskDuration = (String) taskOptions.get("taskDuration");
    this.startDelay = (String) taskOptions.get("startDelay");
    this.period = (String) taskOptions.get("period");
    this.useEarliestOffset = (Boolean) taskOptions.get("useEarliestOffset");
    this.completionTimeout = (String) taskOptions.get("completionTimeout");
    this.lateMessageRejectionPeriod = (String) taskOptions.get("lateMessageRejectionPeriod");
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

  public String getStartDelay() {
    return startDelay;
  }

  public void setStartDelay(String startDelay) {
    this.startDelay = startDelay;
  }

  public String getPeriod() {
    return period;
  }

  public void setPeriod(String period) {
    this.period = period;
  }

  public Boolean getUseEarliestOffset() {
    return useEarliestOffset;
  }

  public void setUseEarliestOffset(Boolean useEarliestOffset) {
    this.useEarliestOffset = useEarliestOffset;
  }

  public String getCompletionTimeout() {
    return completionTimeout;
  }

  public void setCompletionTimeout(String completionTimeout) {
    this.completionTimeout = completionTimeout;
  }

  public String getLateMessageRejectionPeriod() {
    return lateMessageRejectionPeriod;
  }

  public void setLateMessageRejectionPeriod(String lateMessageRejectionPeriod) {
    this.lateMessageRejectionPeriod = lateMessageRejectionPeriod;
  }
}
