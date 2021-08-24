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

import app.metatron.discovery.spec.druid.ingestion.partition.HashBasedPartition;
import app.metatron.discovery.spec.druid.ingestion.partition.PartitionSpec;
import app.metatron.discovery.spec.druid.ingestion.partition.SizedPartition;

/**
 * Created by kyungtaak on 2017. 3. 20..
 */
public class HadoopTuningConfig extends AbstractTuningConfig {

  String ingestionMode;

  Boolean useCombiner;

  Boolean combineText;

  Long maxOccupationInMemory;

  Long maxShardLength;

  Integer scatterPram;

  Integer numBackgroundPersistThreads;

  Boolean leaveIntermediate;

  Boolean cleanupOnFailure;

  Boolean overwriteFiles;

  Boolean assumeTimeSorted;

  PartitionSpec partitionsSpec;

  public HadoopTuningConfig() {
  }

  public static HadoopTuningConfig hiveDefaultConfig() {

    HadoopTuningConfig config = new HadoopTuningConfig();

    config.setIngestionMode("REDUCE_MERGE");
    config.setUseCombiner(false);
    config.setBuildV9Directly(true);
    config.setMaxRowsInMemory(3000000);
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

  public static HadoopTuningConfig hdfsDefaultConfig() {

    HadoopTuningConfig config = new HadoopTuningConfig();

    config.setIngestionMode("MAPRED");
    config.setUseCombiner(false);
    config.setCombineText(false);
    config.setBuildV9Directly(true);
    config.setNumBackgroundPersistThreads(0);
    config.setMaxRowsInMemory(75000);
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

}
