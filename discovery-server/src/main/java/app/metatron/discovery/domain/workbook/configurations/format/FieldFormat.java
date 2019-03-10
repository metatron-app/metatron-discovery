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

package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.io.Serializable;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXTERNAL_PROPERTY,
    property = "type",
    defaultImpl = DefaultFormat.class)
@JsonSubTypes({
    @JsonSubTypes.Type(value = DefaultFormat.class, name = "default"),
    @JsonSubTypes.Type(value = GeoFormat.class, name = "geo"),
    @JsonSubTypes.Type(value = GeoPointFormat.class, name = "geo_point"),
    @JsonSubTypes.Type(value = GeoLineFormat.class, name = "geo_line"),
    @JsonSubTypes.Type(value = GeoPolygonFormat.class, name = "geo_polygon"),
    @JsonSubTypes.Type(value = NumberFieldFormat.class, name = "number"),
    @JsonSubTypes.Type(value = ExponentOfTenFormat.class, name = "exponent10"),
    @JsonSubTypes.Type(value = CurrencyFormat.class, name = "currency"),
    @JsonSubTypes.Type(value = PercentFormat.class, name = "percent"),
    @JsonSubTypes.Type(value = ContinuousTimeFormat.class, name = "time_continuous"),
    @JsonSubTypes.Type(value = CustomDateTimeFormat.class, name = "time_format"),
    @JsonSubTypes.Type(value = UnixTimeFormat.class, name = "time_unix"),
    @JsonSubTypes.Type(value = TemporaryTimeFormat.class, name = "time_temporary")
})
public interface FieldFormat extends Serializable {
}
