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


import org.apache.commons.lang3.BooleanUtils;

public abstract class AbstractGeoSpatialOperation implements GeoSpatialOperation {

  Integer buffer;

  boolean choropleth;

  ChoroplethAggregation aggregation;

  public AbstractGeoSpatialOperation() {
  }

  public AbstractGeoSpatialOperation(Integer buffer, Boolean choropleth, ChoroplethAggregation aggregation) {
    this.buffer = buffer;
    this.choropleth = BooleanUtils.isTrue(choropleth);
    this.aggregation = aggregation;
  }

  @Override
  public Integer getBuffer() {
    return buffer;
  }

  @Override
  public boolean isChoropleth() {
    return choropleth;
  }

  @Override
  public ChoroplethAggregation getAggregation() {
    return aggregation;
  }
}
