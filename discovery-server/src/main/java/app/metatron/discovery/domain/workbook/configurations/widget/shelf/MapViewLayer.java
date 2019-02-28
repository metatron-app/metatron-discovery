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

package app.metatron.discovery.domain.workbook.configurations.widget.shelf;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.field.Field;

public class MapViewLayer implements Serializable {

  /**
   * Name of layer (optional)
   */
  String name;

  /**
   * datasource reference
   */
  String ref;

  /**
   * fields
   */
  List<Field> fields;

  /**
   * View mode for point geometry
   */
  LayerView view;

  public MapViewLayer() {
  }

  @JsonCreator
  public MapViewLayer(@JsonProperty("name") String name,
                      @JsonProperty("ref") String ref,
                      @JsonProperty("layer") List<Field> fields,
                      @JsonProperty("view") LayerView view) {
    this.name = name;
    this.ref = ref;
    this.fields = fields;
    this.view = (view == null) ? new LayerView.OriginalLayerView() : view;
  }

  public String getName() {
    return name;
  }

  public String getRef() {
    return ref;
  }

  public List<Field> getFields() {
    return fields;
  }

  public LayerView getView() {
    return view;
  }

  @Override
  public String toString() {
    return "Layer{" +
        "name='" + name + '\'' +
        ", ref='" + ref + '\'' +
        ", fields=" + fields +
        '}';
  }
}
