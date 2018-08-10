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

package app.metatron.discovery.query.druid.queries;

import java.util.List;
import java.util.Map;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.query.druid.Query;
import app.metatron.discovery.query.druid.datasource.DataSource;

/**
 *
 */
public class JoinQuery extends Query {

  Map<String, DataSource> dataSources;

  List<JoinElement> elements;

  Boolean prefixAlias;

  Integer numPartition;

  Integer scannerLen;

  Integer limit;

  Integer queue;

  @NotNull
  List<String> intervals;

  Map<String, Object> context;

  public JoinQuery() {
  }

  public Map<String, DataSource> getDataSources() {
    return dataSources;
  }

  public void setDataSources(Map<String, DataSource> dataSources) {
    this.dataSources = dataSources;
  }

  public List<JoinElement> getElements() {
    return elements;
  }

  public void setElements(List<JoinElement> elements) {
    this.elements = elements;
  }

  public Boolean getPrefixAlias() {
    return prefixAlias;
  }

  public void setPrefixAlias(Boolean prefixAlias) {
    this.prefixAlias = prefixAlias;
  }

  public Integer getNumPartition() {
    return numPartition;
  }

  public void setNumPartition(Integer numPartition) {
    this.numPartition = numPartition;
  }

  public Integer getScannerLen() {
    return scannerLen;
  }

  public void setScannerLen(Integer scannerLen) {
    this.scannerLen = scannerLen;
  }

  public Integer getLimit() {
    return limit;
  }

  public void setLimit(Integer limit) {
    this.limit = limit;
  }

  public Integer getQueue() {
    return queue;
  }

  public void setQueue(Integer queue) {
    this.queue = queue;
  }

  public List<String> getIntervals() {
    return intervals;
  }

  public void setIntervals(List<String> intervals) {
    this.intervals = intervals;
  }

  public Map<String, Object> getContext() {
    return context;
  }

  public void setContext(Map<String, Object> context) {
    this.context = context;
  }

  public static JoinQueryBuilder builder(app.metatron.discovery.domain.workbook.configurations.datasource.DataSource dataSource) {
    return new JoinQueryBuilder(dataSource);
  }
}
