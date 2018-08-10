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

package app.metatron.discovery.spec.druid.ingestion.firehose;

import javax.validation.constraints.NotNull;

/**
 * Created by kyungtaak on 2016. 6. 18..
 */
public class LocalFirehose implements Firehose {

  @NotNull
  String type;

  @NotNull
  String filter;

  @NotNull
  String baseDir;

  public LocalFirehose() {
  }

  public LocalFirehose(String type, String filter, String baseDir) {
    this.type = type;
    this.filter = filter;
    this.baseDir = baseDir;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getFilter() {
    return filter;
  }

  public void setFilter(String filter) {
    this.filter = filter;
  }

  public String getBaseDir() {
    return baseDir;
  }

  public void setBaseDir(String baseDir) {
    this.baseDir = baseDir;
  }
}
