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

package app.metatron.discovery.common.geospatial.geojson;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = PointGeometry.class, name = "Point"),
    @JsonSubTypes.Type(value = MultiPointGeometry.class, name = "MultiPoint"),
    @JsonSubTypes.Type(value = LineStringGeometry.class, name = "LineString"),
    @JsonSubTypes.Type(value = MultiLineStringGeometry.class, name = "MultiLineString"),
    @JsonSubTypes.Type(value = PolygonGeometry.class, name = "Polygon"),
    @JsonSubTypes.Type(value = MultiPolygonGeometry.class, name = "MultiPolygon")
})
public interface GeoJsonGeometry {
}
