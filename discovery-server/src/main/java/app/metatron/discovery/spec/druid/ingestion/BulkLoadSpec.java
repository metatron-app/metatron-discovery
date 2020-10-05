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

package app.metatron.discovery.spec.druid.ingestion;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

public class BulkLoadSpec implements Serializable {

  String basePath;

  List<String> paths;

  DataSchema schema;

  Map<String, Object> tuningConfig;

  Map<String, Object> properties;

  boolean temporary;

  public BulkLoadSpec() {
  }

  public BulkLoadSpec(String basePath, List<String> paths, DataSchema schema, Map<String, Object> tuningConfig) {
    this.basePath = basePath;
    this.paths = paths;
    this.schema = schema;
    this.tuningConfig = tuningConfig;
    this.temporary = false;
  }

  public BulkLoadSpec(String basePath, List<String> paths, DataSchema schema, Map<String, Object> tuningConfig, boolean temporary) {
    this.basePath = basePath;
    this.paths = paths;
    this.schema = schema;
    this.tuningConfig = tuningConfig;
    this.temporary = temporary;
  }

  public String getBasePath() {
    return basePath;
  }

  public void setBasePath(String basePath) {
    this.basePath = basePath;
  }

  public List<String> getPaths() {
    return paths;
  }

  public void setPaths(List<String> paths) {
    this.paths = paths;
  }

  public DataSchema getSchema() {
    return schema;
  }

  public void setSchema(DataSchema schema) {
    this.schema = schema;
  }

  public Map<String, Object> getTuningConfig() {
    return tuningConfig;
  }

  public void setTuningConfig(Map<String, Object> tuningConfig) {
    this.tuningConfig = tuningConfig;
  }

  public Map<String, Object> getProperties() {
    return properties;
  }

  public void setProperties(Map<String, Object> properties) {
    this.properties = properties;
  }

  public boolean isTemporary() {
    return temporary;
  }

  public void setTemporary(boolean temporary) {
    this.temporary = temporary;
  }
}
