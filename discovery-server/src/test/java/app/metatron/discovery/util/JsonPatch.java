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

package app.metatron.discovery.util;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Created by kyungtaak on 2017. 5. 29..
 */
public class JsonPatch {

  Operations op;
  String path;
  Object value;

  public JsonPatch(Operations op, String path) {
    this.op = op;
    this.path = path;
  }

  public JsonPatch(Operations op, String path, Object value) {
    this.op = op;
    this.path = path;
    this.value = value;
  }

  public Operations getOp() {
    return op;
  }

  public void setOp(Operations op) {
    this.op = op;
  }

  public String getPath() {
    return path;
  }

  public void setPath(String path) {
    this.path = path;
  }

  public Object getValue() {
    return value;
  }

  public void setValue(Object value) {
    this.value = value;
  }

  public enum Operations {
    @JsonProperty("add")
    ADD,
    @JsonProperty("remove")
    REMOVE,
    @JsonProperty("replace")
    REPLACE
  }
}
