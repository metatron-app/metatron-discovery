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

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.collections4.CollectionUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.workbook.configurations.field.Field;

public class GeoShelf implements Shelf {

  /**
   * GEO Layers
   */
  List<MapViewLayer> layers;

  @JsonCreator
  public GeoShelf(@JsonProperty("layers") List<Object> layers) {

    // for backward compatibility ex) {"type":"geo","layers":[[]]}
    if (CollectionUtils.isEmpty(layers)) {
      return;
    }

    Object firstObject = layers.get(0);
    if (firstObject instanceof MapViewLayer
        || firstObject instanceof Map) {
      this.layers = layers.stream()
                          .map(o -> GlobalObjectMapper.getDefaultMapper().convertValue(o, MapViewLayer.class))
                          .collect(Collectors.toList());
    } else if (firstObject instanceof List) { // for backward compatibility
      List<Object> firstLayer = (List<Object>) firstObject;
      if (CollectionUtils.isEmpty(firstLayer)) {
        return;
      }
      List<Field> fields = firstLayer.stream()
                                     .map(o -> GlobalObjectMapper.getDefaultMapper().convertValue(o, Field.class))
                                     .collect(Collectors.toList());
      this.layers = Lists.newArrayList(new MapViewLayer("Layer1", null, fields, null));
    } else {
      throw new IllegalArgumentException("Not support layer type : " + firstObject);
    }
  }

  /**
   * find datasource by name (in multiple datasource)
   */
  @JsonIgnore
  public Optional<MapViewLayer> getLayerByName(String name) {
    Preconditions.checkNotNull(name, "Name of layer is required.");

    for (MapViewLayer mapViewLayer : layers) {
      if (name.equals(mapViewLayer.getName())) {
        return Optional.of(mapViewLayer);
      }
    }
    return Optional.empty();
  }

  @Override
  public List<Field> getFields() {
    List<Field> collectedFields = Lists.newArrayList();
    layers.forEach(layer -> collectedFields.addAll(layer.getFields()));
    return collectedFields;
  }

  public List<MapViewLayer> getLayers() {
    return layers;
  }

  @Override
  public String toString() {
    return "GeoShelf{" +
        "layers=" + layers +
        '}';
  }

}
