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

import com.google.common.collect.Maps;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.collections4.MapUtils;

import java.util.Map;

import app.metatron.discovery.spec.druid.ingestion.index.IndexSpec;

/**
 * Created by kyungtaak on 2016. 6. 18..
 */
public class RealTimeTuningConfig implements TuningConfig {

  Integer maxRowsInMemory;

  Integer rowFlushBoundary;

  Integer targetPartitionSize;

  // ISO8601 Period
  String windowPeriod;

  // ISO8601 Period
  String intermediatePersistPeriod;

  String basePersistDirectory;

  Object versioningPolicy;

  Object rejectionPolicy;

  String maxPendingPersists;

  Object shardSpec;

  Boolean buildV9Directly;

  Integer persistThreadPriority;

  Integer mergeThreadPriority;

  Boolean reportParseExceptions;

  Boolean ignorePreviousSegments;

  IndexSpec indexSpec;

  public RealTimeTuningConfig() {
  }

  public RealTimeTuningConfig(Map<String, Object> tuningConfig) {
    overrideConfig(tuningConfig);
  }

  public void overrideConfig(Map<String, Object> tuningConfig) {

    if(MapUtils.isNotEmpty(tuningConfig)) {
      for (String key : tuningConfig.keySet()) {
        try {
          BeanUtils.setProperty(this, key, tuningConfig.get(key));
        } catch (Exception e) {
        }
      }
    }

  }

  public static RealTimeTuningConfig defaultConfig() {
    RealTimeTuningConfig config = new RealTimeTuningConfig();
    config.setRowFlushBoundary(0);
    config.setMaxRowsInMemory(5000);
    config.setTargetPartitionSize(0);
    config.setIgnorePreviousSegments(false);

    Map<String, Object> rejectionPolicy = Maps.newHashMap();
    rejectionPolicy.put("type", "none");
    config.setRejectionPolicy(rejectionPolicy);

    return config;
  }

  public Integer getMaxRowsInMemory() {
    return maxRowsInMemory;
  }

  public void setMaxRowsInMemory(Integer maxRowsInMemory) {
    this.maxRowsInMemory = maxRowsInMemory;
  }

  public Integer getRowFlushBoundary() {
    return rowFlushBoundary;
  }

  public void setRowFlushBoundary(Integer rowFlushBoundary) {
    this.rowFlushBoundary = rowFlushBoundary;
  }

  public Integer getTargetPartitionSize() {
    return targetPartitionSize;
  }

  public void setTargetPartitionSize(Integer targetPartitionSize) {
    this.targetPartitionSize = targetPartitionSize;
  }

  public String getWindowPeriod() {
    return windowPeriod;
  }

  public void setWindowPeriod(String windowPeriod) {
    this.windowPeriod = windowPeriod;
  }

  public String getIntermediatePersistPeriod() {
    return intermediatePersistPeriod;
  }

  public void setIntermediatePersistPeriod(String intermediatePersistPeriod) {
    this.intermediatePersistPeriod = intermediatePersistPeriod;
  }

  public String getBasePersistDirectory() {
    return basePersistDirectory;
  }

  public void setBasePersistDirectory(String basePersistDirectory) {
    this.basePersistDirectory = basePersistDirectory;
  }

  public Object getVersioningPolicy() {
    return versioningPolicy;
  }

  public void setVersioningPolicy(Object versioningPolicy) {
    this.versioningPolicy = versioningPolicy;
  }

  public Object getRejectionPolicy() {
    return rejectionPolicy;
  }

  public void setRejectionPolicy(Object rejectionPolicy) {
    this.rejectionPolicy = rejectionPolicy;
  }

  public String getMaxPendingPersists() {
    return maxPendingPersists;
  }

  public void setMaxPendingPersists(String maxPendingPersists) {
    this.maxPendingPersists = maxPendingPersists;
  }

  public Object getShardSpec() {
    return shardSpec;
  }

  public void setShardSpec(Object shardSpec) {
    this.shardSpec = shardSpec;
  }

  public Boolean getBuildV9Directly() {
    return buildV9Directly;
  }

  public void setBuildV9Directly(Boolean buildV9Directly) {
    this.buildV9Directly = buildV9Directly;
  }

  public Integer getPersistThreadPriority() {
    return persistThreadPriority;
  }

  public void setPersistThreadPriority(Integer persistThreadPriority) {
    this.persistThreadPriority = persistThreadPriority;
  }

  public Integer getMergeThreadPriority() {
    return mergeThreadPriority;
  }

  public void setMergeThreadPriority(Integer mergeThreadPriority) {
    this.mergeThreadPriority = mergeThreadPriority;
  }

  public Boolean getReportParseExceptions() {
    return reportParseExceptions;
  }

  public void setReportParseExceptions(Boolean reportParseExceptions) {
    this.reportParseExceptions = reportParseExceptions;
  }

  public Boolean getIgnorePreviousSegments() {
    return ignorePreviousSegments;
  }

  public void setIgnorePreviousSegments(Boolean ignorePreviousSegments) {
    this.ignorePreviousSegments = ignorePreviousSegments;
  }

  @Override
  public IndexSpec getIndexSpec() {
    return indexSpec;
  }

  @Override
  public void setIndexSpec(IndexSpec indexSpec) {
    this.indexSpec = indexSpec;
  }
}
