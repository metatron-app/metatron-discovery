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


import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import org.apache.commons.lang3.BooleanUtils;

import java.io.Serializable;

import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = GeoSpatialOperation.DistanceWithin.class, name = "dwithin"),
    @JsonSubTypes.Type(value = GeoSpatialOperation.Within.class, name = "within"),
    @JsonSubTypes.Type(value = GeoSpatialOperation.Intersects.class, name = "intersects")
})
public interface GeoSpatialOperation extends Serializable {

  Integer getBuffer();

  boolean isChoropleth();

  class DistanceWithin implements GeoSpatialOperation {

    Integer distance;

    boolean choropleth;

    public DistanceWithin() {
    }

    @JsonCreator
    public DistanceWithin(@JsonProperty("distance") Integer distance,
                          @JsonProperty("choropleth") Boolean choropleth) {
      this.distance = distance;
      this.choropleth = BooleanUtils.isTrue(choropleth);
    }

    public Integer getDistance() {
      return distance;
    }

    @Override
    public Integer getBuffer() {
      return distance;
    }

    @Override
    public boolean isChoropleth() {
      return choropleth;
    }
  }

  class Intersects extends AbstractGeoSpatialOperation implements GeoSpatialOperation {

    public Intersects() {
    }

    @JsonCreator
    public Intersects(@JsonProperty("buffer") Integer buffer,
                      @JsonProperty("choropleth") Boolean choropleth,
                      @JsonProperty("aggregation") MeasureField.AggregationType aggregation) {
      super(buffer, choropleth, aggregation);
    }
  }

  class Within extends AbstractGeoSpatialOperation implements GeoSpatialOperation {

    public Within() {
    }

    @JsonCreator
    public Within(@JsonProperty("buffer") Integer buffer,
                  @JsonProperty("choropleth") Boolean choropleth,
                  @JsonProperty("aggregation") MeasureField.AggregationType aggregation) {
      super(buffer, choropleth, aggregation);
    }
  }

}
