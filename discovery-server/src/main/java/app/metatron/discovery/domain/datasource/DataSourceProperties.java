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

package app.metatron.discovery.domain.datasource;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Created by kyungtaak on 2016. 12. 11..
 */
@Component
@ConfigurationProperties(prefix = "polaris.datasource")
public class DataSourceProperties {

  Map<String, List<String>> connections;

  List<DefaultFilter> defaultFilters;

  Realtime realtimeConfig;

  public Map<String, List<String>> getConnections() {
    return connections;
  }

  public void setConnections(Map<String, List<String>> connections) {
    this.connections = connections;
  }

  public List<DefaultFilter> getDefaultFilters() {
    return defaultFilters;
  }

  public void setDefaultFilters(List<DefaultFilter> defaultFilters) {
    this.defaultFilters = defaultFilters;
  }

  public Realtime getRealtimeConfig() {
    return realtimeConfig;
  }

  public void setRealtimeConfig(Realtime realtimeConfig) {
    this.realtimeConfig = realtimeConfig;
  }

  public static class DefaultFilter {
    String criterionKey;
    String filterKey;
    String filterValue;
    String filterName;

    public DefaultFilter(){

    }

    public String getCriterionKey() {
      return criterionKey;
    }

    public void setCriterionKey(String criterionKey) {
      this.criterionKey = criterionKey;
    }

    public String getFilterKey() {
      return filterKey;
    }

    public void setFilterKey(String filterKey) {
      this.filterKey = filterKey;
    }

    public String getFilterValue() {
      return filterValue;
    }

    public void setFilterValue(String filterValue) {
      this.filterValue = filterValue;
    }

    public String getFilterName() {
      return filterName;
    }

    public void setFilterName(String filterName) {
      this.filterName = filterName;
    }
  }

  public static class Realtime {
    ConsumerConfig consumerConfig;

    public Realtime() {
    }

    public ConsumerConfig getConsumerConfig() {
      return consumerConfig;
    }

    public void setConsumerConfig(ConsumerConfig consumerConfig) {
      this.consumerConfig = consumerConfig;
    }
  }

  class ConsumerConfig {

    String groupId = "KafkaSampleConsumer";
    String keyDeserializer = "org.apache.kafka.common.serialization.LongDeserializer";
    String valueDeserializer = "org.apache.kafka.common.serialization.StringDeserializer";
    String autoOffsetReset = "latest";
    long requestTimeout = 10000;
    long sessionTimeOut = 8000;
    long fetchMaxWait = 8000;
    long heartbeatInterval = 5000;

    public ConsumerConfig() {
    }

    public String getGroupId() {
      return groupId;
    }

    public void setGroupId(String groupId) {
      this.groupId = groupId;
    }

    public String getKeyDeserializer() {
      return keyDeserializer;
    }

    public void setKeyDeserializer(String keyDeserializer) {
      this.keyDeserializer = keyDeserializer;
    }

    public String getValueDeserializer() {
      return valueDeserializer;
    }

    public void setValueDeserializer(String valueDeserializer) {
      this.valueDeserializer = valueDeserializer;
    }

    public String getAutoOffsetReset() {
      return autoOffsetReset;
    }

    public void setAutoOffsetReset(String autoOffsetReset) {
      this.autoOffsetReset = autoOffsetReset;
    }

    public long getRequestTimeout() {
      return requestTimeout;
    }

    public void setRequestTimeout(long requestTimeout) {
      this.requestTimeout = requestTimeout;
    }

    public long getSessionTimeOut() {
      return sessionTimeOut;
    }

    public void setSessionTimeOut(long sessionTimeOut) {
      this.sessionTimeOut = sessionTimeOut;
    }

    public long getFetchMaxWait() {
      return fetchMaxWait;
    }

    public void setFetchMaxWait(long fetchMaxWait) {
      this.fetchMaxWait = fetchMaxWait;
    }

    public long getHeartbeatInterval() {
      return heartbeatInterval;
    }

    public void setHeartbeatInterval(long heartbeatInterval) {
      this.heartbeatInterval = heartbeatInterval;
    }
  }
}
