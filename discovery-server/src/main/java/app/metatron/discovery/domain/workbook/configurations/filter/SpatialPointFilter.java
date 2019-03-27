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

package app.metatron.discovery.domain.workbook.configurations.filter;

import com.google.common.base.Preconditions;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import app.metatron.discovery.query.druid.SpatialOperations;
import app.metatron.discovery.util.EnumUtils;

public class SpatialPointFilter extends SpatialFilter {

  Double latitude;

  Double longitude;

  Double radiusMeters;

  SpatialOperations operation;

  @JsonCreator
  public SpatialPointFilter(@JsonProperty("dataSource") String dataSource,
                            @JsonProperty("field") String field,
                            @JsonProperty("ref") String ref,
                            @JsonProperty("latitude") Double latitude,
                            @JsonProperty("longitude") Double longitude,
                            @JsonProperty("radiusMeters") Double radiusMeters,
                            @JsonProperty("operation") String operation) {
    super(dataSource, field, ref);

    Preconditions.checkArgument(
        latitude != null, "Must have a valid, non-null latitude or latitudes"
    );
    Preconditions.checkArgument(
        longitude != null, "Must have a valid, non-null longitude or longitudes"
    );

    this.latitude = latitude;
    this.longitude = longitude;

    this.operation = EnumUtils.getUpperCaseEnum(SpatialOperations.class, operation, SpatialOperations.INTERSECTS);
    if (!this.operation.isFilterOperation()) {
      throw new IllegalArgumentException("Invalid bbox filter operation : " + operation);
    }
    this.radiusMeters = radiusMeters == null ? 0 : radiusMeters;
  }

  public Double getLatitude() {
    return latitude;
  }

  public Double getLongitude() {
    return longitude;
  }

  public Double getRadiusMeters() {
    return radiusMeters;
  }

  public SpatialOperations getOperation() {
    return operation;
  }

  @Override
  public boolean compare(Filter filter) {
    return false;
  }
}
