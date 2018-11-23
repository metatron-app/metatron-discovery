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
import app.metatron.discovery.spec.druid.ingestion.partition.HashBasedPartition;
import app.metatron.discovery.spec.druid.ingestion.partition.PartitionSpec;
import app.metatron.discovery.spec.druid.ingestion.partition.SizedPartition;

/**
 * Created by kyungtaak on 2017. 3. 20..
 */
public class HadoopTuningConfig implements TuningConfig {

  String ingestionMode;

  Boolean useCombiner;

  Boolean combineText;

  Boolean buildV9Directly;

  Long maxRowsInMemory;

  Long maxOccupationInMemory;

  Long maxShardLength;

  Integer scatterPram;

  Integer numBackgroundPersistThreads;

  Boolean leaveIntermediate;

  Boolean cleanupOnFailure;

  Boolean overwriteFiles;

  Boolean ignoreInvalidRows;

  Boolean assumeTimeSorted;

  PartitionSpec partitionsSpec;

  IndexSpec indexSpec;

  Map<String, String> jobProperties;

  public HadoopTuningConfig() {
  }

  public void overrideConfig(Map<String, Object> tuningConfig, Map<String, Object> jobProperties) {

    if(MapUtils.isNotEmpty(tuningConfig)) {
      for (String key : tuningConfig.keySet()) {
        try {
          BeanUtils.setProperty(this, key, tuningConfig.get(key));
        } catch (Exception e) {
        }
      }
    }

    if (MapUtils.isNotEmpty(jobProperties)) {
      for (String key : jobProperties.keySet()) {
        addJobProperty(key, String.valueOf(jobProperties.get(key)));
      }
    }

  }


  /**
   *
   * @return
   */
  public static HadoopTuningConfig hiveDefaultConfig() {

    HadoopTuningConfig config = new HadoopTuningConfig();

    config.setIngestionMode("REDUCE_MERGE");
    config.setUseCombiner(false);
    config.setBuildV9Directly(true);
    config.setMaxRowsInMemory(3000000L);
    config.setMaxOccupationInMemory(1024000000L);
    config.setMaxShardLength(256000000L);
    config.setIgnoreInvalidRows(true);
    config.setPartitionsSpec(new SizedPartition(0));

    config.addJobProperty("mapreduce.map.memory.mb", "4096");
    config.addJobProperty("mapreduce.task.files.preserve.filepattern", ".*");
    config.addJobProperty("mapreduce.reduce.memory.mb", "4096");
    config.addJobProperty("keep.task.files.pattern", ".*");
    config.addJobProperty("mapreduce.reduce.java.opts", "-server -Xmx4096m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps");
    config.addJobProperty("mapreduce.map.java.opts", "-server -Xmx4096m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps");
//    config.addJobProperty("mapreduce.job.classloader", "false");
//    config.addJobProperty("mapreduce.job.user.classpath.first", "true");

    return config;
  }

  /**
   *
   * @return
   */
  public static HadoopTuningConfig hdfsDefaultConfig() {

    HadoopTuningConfig config = new HadoopTuningConfig();

    config.setIngestionMode("MAPRED");
    config.setUseCombiner(false);
    config.setCombineText(false);
    config.setBuildV9Directly(true);
    config.setNumBackgroundPersistThreads(0);
    config.setMaxRowsInMemory(75000L);
    config.setMaxOccupationInMemory(-1L);
    config.setMaxShardLength(-2147483648L);
    config.setLeaveIntermediate(false);
    config.setCleanupOnFailure(true);
    config.setOverwriteFiles(false);
    config.setIgnoreInvalidRows(false);
    config.setAssumeTimeSorted(false);
    config.setPartitionsSpec(new HashBasedPartition(1000000L, 1500000L, false, -1));

    config.addJobProperty("keep.task.files.pattern", ".*");
    config.addJobProperty("mapreduce.task.files.preserve.filepattern", ".*");
    config.addJobProperty("mapreduce.map.memory.mb", "4096");
    config.addJobProperty("mapreduce.reduce.memory.mb", "4096");
    config.addJobProperty("mapreduce.map.java.opts", "-server -Xmx8192m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps");
    config.addJobProperty("mapreduce.reduce.java.opts", "-server -Xmx10240m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps");

    return config;
  }

  public void addJobProperty(String key, String value) {
    if (jobProperties == null) {
      jobProperties = Maps.newHashMap();
    }

    this.jobProperties.put(key, value);
  }

  public void addJobProperty(Map<String, String> jobProperties) {
    if (jobProperties == null) {
      jobProperties = Maps.newHashMap();
    }

    this.jobProperties.putAll(jobProperties);
  }

  public String getIngestionMode() {
    return ingestionMode;
  }

  public void setIngestionMode(String ingestionMode) {
    this.ingestionMode = ingestionMode;
  }

  public Boolean getUseCombiner() {
    return useCombiner;
  }

  public void setUseCombiner(Boolean useCombiner) {
    this.useCombiner = useCombiner;
  }

  public Map<String, String> getJobProperties() {
    return jobProperties;
  }

  public void setJobProperties(Map<String, String> jobProperties) {
    this.jobProperties = jobProperties;
  }

  public Boolean getBuildV9Directly() {
    return buildV9Directly;
  }

  public void setBuildV9Directly(Boolean buildV9Directly) {
    this.buildV9Directly = buildV9Directly;
  }

  public Long getMaxRowsInMemory() {
    return maxRowsInMemory;
  }

  public void setMaxRowsInMemory(Long maxRowsInMemory) {
    this.maxRowsInMemory = maxRowsInMemory;
  }

  public Long getMaxOccupationInMemory() {
    return maxOccupationInMemory;
  }

  public void setMaxOccupationInMemory(Long maxOccupationInMemory) {
    this.maxOccupationInMemory = maxOccupationInMemory;
  }

  public Long getMaxShardLength() {
    return maxShardLength;
  }

  public Integer getScatterPram() {
    return scatterPram;
  }

  public void setScatterPram(Integer scatterPram) {
    this.scatterPram = scatterPram;
  }

  public void setMaxShardLength(Long maxShardLength) {
    this.maxShardLength = maxShardLength;
  }

  public Boolean getCombineText() {
    return combineText;
  }

  public void setCombineText(Boolean combineText) {
    this.combineText = combineText;
  }

  public Integer getNumBackgroundPersistThreads() {
    return numBackgroundPersistThreads;
  }

  public void setNumBackgroundPersistThreads(Integer numBackgroundPersistThreads) {
    this.numBackgroundPersistThreads = numBackgroundPersistThreads;
  }

  public Boolean getLeaveIntermediate() {
    return leaveIntermediate;
  }

  public void setLeaveIntermediate(Boolean leaveIntermediate) {
    this.leaveIntermediate = leaveIntermediate;
  }

  public Boolean getCleanupOnFailure() {
    return cleanupOnFailure;
  }

  public void setCleanupOnFailure(Boolean cleanupOnFailure) {
    this.cleanupOnFailure = cleanupOnFailure;
  }

  public Boolean getOverwriteFiles() {
    return overwriteFiles;
  }

  public void setOverwriteFiles(Boolean overwriteFiles) {
    this.overwriteFiles = overwriteFiles;
  }

  public Boolean getIgnoreInvalidRows() {
    return ignoreInvalidRows;
  }

  public void setIgnoreInvalidRows(Boolean ignoreInvalidRows) {
    this.ignoreInvalidRows = ignoreInvalidRows;
  }

  public Boolean getAssumeTimeSorted() {
    return assumeTimeSorted;
  }

  public void setAssumeTimeSorted(Boolean assumeTimeSorted) {
    this.assumeTimeSorted = assumeTimeSorted;
  }

  public PartitionSpec getPartitionsSpec() {
    return partitionsSpec;
  }

  public void setPartitionsSpec(PartitionSpec partitionsSpec) {
    this.partitionsSpec = partitionsSpec;
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
