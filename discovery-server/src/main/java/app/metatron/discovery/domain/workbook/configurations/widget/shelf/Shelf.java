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

package app.metatron.discovery.domain.workbook.configurations.widget.shelf;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.io.Serializable;
import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.field.Field;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXTERNAL_PROPERTY,
    property = "type",
    defaultImpl = PivotShelf.class)
@JsonSubTypes({
    @JsonSubTypes.Type(value = PivotShelf.class, name = "pivot"),
    @JsonSubTypes.Type(value = GraphShelf.class, name = "graph"),
    @JsonSubTypes.Type(value = GeoShelf.class, name = "geo")
})
public interface Shelf extends Serializable {
  @JsonIgnore
  List<Field> getFields();
}
