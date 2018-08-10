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

import javax.validation.constraints.NotNull;

/**
 * Created by kyungtaak on 2016. 6. 18..
 */
public class SingleDimensionPartition implements PartitionSpec {

  @NotNull
  Long targetPartitionSize;

  Long maxPartitionSize;

  String partitionDimension;

  String assumeGrouped;

  public SingleDimensionPartition(Long targetPartitionSize) {
    this.targetPartitionSize = targetPartitionSize;
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

  public String getPartitionDimension() {
    return partitionDimension;
  }

  public void setPartitionDimension(String partitionDimension) {
    this.partitionDimension = partitionDimension;
  }

  public String getAssumeGrouped() {
    return assumeGrouped;
  }

  public void setAssumeGrouped(String assumeGrouped) {
    this.assumeGrouped = assumeGrouped;
  }
}
