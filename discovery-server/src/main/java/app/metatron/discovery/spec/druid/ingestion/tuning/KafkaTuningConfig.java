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

package app.metatron.discovery.spec.druid.ingestion.tuning;

/**
 *
 */
public class KafkaTuningConfig extends AbstractTuningConfig {

  Integer maxOccupationInMemory;

  Integer maxRowsPerSegment;

  String intermediatePersistPeriod;

  Integer maxPendingPersists;

  Boolean reportParseExceptions;

  Long handoffConditionTimeout;

  Boolean resetOffsetAutomatically;

  String httpTimeout;

  String shutdownTimeout;

  String offsetFetchPeriod;

  public KafkaTuningConfig() {
  }

  public static KafkaTuningConfig defaultConfig() {
    KafkaTuningConfig config = new KafkaTuningConfig();
    config.setMaxRowsPerSegment(5000000);

    return config;
  }

  public Integer getMaxOccupationInMemory() {
    return maxOccupationInMemory;
  }

  public void setMaxOccupationInMemory(Integer maxOccupationInMemory) {
    this.maxOccupationInMemory = maxOccupationInMemory;
  }

  public Integer getMaxRowsPerSegment() {
    return maxRowsPerSegment;
  }

  public void setMaxRowsPerSegment(Integer maxRowsPerSegment) {
    this.maxRowsPerSegment = maxRowsPerSegment;
  }

  public String getIntermediatePersistPeriod() {
    return intermediatePersistPeriod;
  }

  public void setIntermediatePersistPeriod(String intermediatePersistPeriod) {
    this.intermediatePersistPeriod = intermediatePersistPeriod;
  }

  public Integer getMaxPendingPersists() {
    return maxPendingPersists;
  }

  public void setMaxPendingPersists(Integer maxPendingPersists) {
    this.maxPendingPersists = maxPendingPersists;
  }

  public Boolean getReportParseExceptions() {
    return reportParseExceptions;
  }

  public void setReportParseExceptions(Boolean reportParseExceptions) {
    this.reportParseExceptions = reportParseExceptions;
  }

  public Long getHandoffConditionTimeout() {
    return handoffConditionTimeout;
  }

  public void setHandoffConditionTimeout(Long handoffConditionTimeout) {
    this.handoffConditionTimeout = handoffConditionTimeout;
  }

  public Boolean getResetOffsetAutomatically() {
    return resetOffsetAutomatically;
  }

  public void setResetOffsetAutomatically(Boolean resetOffsetAutomatically) {
    this.resetOffsetAutomatically = resetOffsetAutomatically;
  }

  public String getHttpTimeout() {
    return httpTimeout;
  }

  public void setHttpTimeout(String httpTimeout) {
    this.httpTimeout = httpTimeout;
  }

  public String getShutdownTimeout() {
    return shutdownTimeout;
  }

  public void setShutdownTimeout(String shutdownTimeout) {
    this.shutdownTimeout = shutdownTimeout;
  }

  public String getOffsetFetchPeriod() {
    return offsetFetchPeriod;
  }

  public void setOffsetFetchPeriod(String offsetFetchPeriod) {
    this.offsetFetchPeriod = offsetFetchPeriod;
  }

}
