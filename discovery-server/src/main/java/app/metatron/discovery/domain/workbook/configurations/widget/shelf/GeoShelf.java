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

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.field.Field;

public class GeoShelf implements Shelf {

  /**
   * GEO Layers
   */
  List<List<Field>> layers;

  @JsonCreator
  public GeoShelf(@JsonProperty("layers") List<List<Field>> layers) {
    this.layers = layers;
  }

  @Override
  public List<Field> getFields() {
    List<Field> collectedFields = Lists.newArrayList();
    layers.forEach(fields -> collectedFields.addAll(fields));
    return collectedFields;
  }

  public List<List<Field>> getLayers() {
    return layers;
  }



  @Override
  public String toString() {
    return "GeoShelf{" +
        "layers=" + layers +
        '}';
  }
}
