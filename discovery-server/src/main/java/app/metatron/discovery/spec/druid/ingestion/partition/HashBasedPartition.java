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

package app.metatron.discovery.spec.druid.ingestion.partition;

import com.google.common.collect.Lists;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 6. 18..
 */
public class HashBasedPartition implements PartitionSpec {

  Long targetPartitionSize;

  Long maxPartitionSize;

  Boolean assumeGrouped;

  Integer numShards;

  List<String> partitionDimensions;

  public HashBasedPartition() {
  }

  public HashBasedPartition(Long targetPartitionSize, Long maxPartitionSize, Boolean assumeGrouped, Integer numShards) {
    this.targetPartitionSize = targetPartitionSize;
    this.maxPartitionSize = maxPartitionSize;
    this.assumeGrouped = assumeGrouped;
    this.numShards = numShards;
  }

  public void addPartitionDimension(String... dimensions) {
    if(partitionDimensions == null) {
      partitionDimensions = Lists.newArrayList();
    }
    partitionDimensions.addAll(Lists.newArrayList(dimensions));
  }

  public Long getTargetPartitionSize() {
    return targetPartitionSize;
  }

  public void setTargetPartitionSize(Long targetPartitionSize) {
    this.targetPartitionSize = targetPartitionSize;
  }

  public Long getMaxPartitionSize() {
    return maxPartitionSize;
  }

  public void setMaxPartitionSize(Long maxPartitionSize) {
    this.maxPartitionSize = maxPartitionSize;
  }

  public Boolean getAssumeGrouped() {
    return assumeGrouped;
  }

  public void setAssumeGrouped(Boolean assumeGrouped) {
    this.assumeGrouped = assumeGrouped;
  }

  public Integer getNumShards() {
    return numShards;
  }

  public void setNumShards(Integer numShards) {
    this.numShards = numShards;
  }

  public List<String> getPartitionDimensions() {
    return partitionDimensions;
  }

  public void setPartitionDimensions(List<String> partitionDimensions) {
    this.partitionDimensions = partitionDimensions;
  }
}
