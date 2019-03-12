/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.workbook.configurations.analysis;

import com.google.common.base.Preconditions;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class GeoSpatialAnalysis implements Analysis {

  String mainLayer;

  String compareLayer;

  GeoSpatialOperation operation;

  public GeoSpatialAnalysis() {
  }

  @JsonCreator
  public GeoSpatialAnalysis(@JsonProperty("mainLayer") String mainLayer,
                            @JsonProperty("compareLayer") String compareLayer,
                            @JsonProperty("operation") GeoSpatialOperation operation) {
    this.mainLayer = Preconditions.checkNotNull(mainLayer);
    this.compareLayer = Preconditions.checkNotNull(compareLayer);
    this.operation = Preconditions.checkNotNull(operation);
  }

  public boolean enableChoropleth() {
    return operation.isChoropleth();
  }

  public String getMainLayer() {
    return mainLayer;
  }

  public String getCompareLayer() {
    return compareLayer;
  }

  public GeoSpatialOperation getOperation() {
    return operation;
  }

  @Override
  public String getVersionKey() {
    return null;
  }
}
