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

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.datasource.DataSource;

/**
 * Created by kyungtaak on 2016. 7. 30..
 */
public class BulkLoadSpecBuilder extends AbstractSpecBuilder {

  String basePath;

  boolean temporary;

  List<String> paths;

  Map<String, Object> tuningConfig;

  Map<String, Object> properties;

  public BulkLoadSpecBuilder(DataSource dataSource) {
    setDataSchema(dataSource);
  }

  public BulkLoadSpecBuilder name(String name) {
    dataSchema.setDataSource(name);

    return this;
  }

  public BulkLoadSpecBuilder basePath(String basePath) {
    this.basePath = basePath;
    return this;
  }

  public BulkLoadSpecBuilder path(List<String> paths) {
    this.paths = paths;
    return this;
  }

  public BulkLoadSpecBuilder tuningConfig(Map<String, Object> tuningConfig) {
    this.tuningConfig = tuningConfig;
    return this;
  }

  public BulkLoadSpecBuilder properties(Map<String, Object> properties) {
    this.properties = properties;
    return this;
  }

  public BulkLoadSpecBuilder temporary(boolean temporary) {
    this.temporary = temporary;
    return this;
  }

  public BulkLoadSpec build() {
    BulkLoadSpec spec = new BulkLoadSpec();
    spec.setSchema(dataSchema);
    spec.setBasePath(basePath);
    spec.setPaths(paths);
    spec.setTuningConfig(tuningConfig);
    spec.setProperties(properties);
    spec.setTemporary(temporary);

    return spec;
  }
}
