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

package app.metatron.discovery.spec.druid.ingestion.parser;

import com.google.common.collect.Lists;

import java.util.List;

import javax.validation.constraints.NotNull;

/**
 * Created by kyungtaak on 2016. 6. 17..
 */
public class DimensionsSpec {

  @NotNull
  List<Object> dimensions;

  List<String> dimensionExclusions;

  List<SpatialDimension> spatialDimensions;

  public DimensionsSpec() {
  }

  public DimensionsSpec(List<Object> dimensions) {
    this.dimensions = dimensions;
    this.dimensionExclusions = Lists.newArrayList();
    this.spatialDimensions = Lists.newArrayList();
  }

  public List<Object> getDimensions() {
    return dimensions;
  }

  public void setDimensions(List<Object> dimensions) {
    this.dimensions = dimensions;
  }

  public List<String> getDimensionExclusions() {
    return dimensionExclusions;
  }

  public void setDimensionExclusions(List<String> dimensionExclusions) {
    this.dimensionExclusions = dimensionExclusions;
  }

  public List<SpatialDimension> getSpatialDimensions() {
    return spatialDimensions;
  }

  public void setSpatialDimensions(List<SpatialDimension> spatialDimensions) {
    this.spatialDimensions = spatialDimensions;
  }
}
