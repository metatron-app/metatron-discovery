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

package app.metatron.discovery.domain.workbook;

import com.google.common.collect.Maps;

import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.workbook.configurations.WorkBookConfiguration;

/**
 * 테스트용 WorkBook 모델 Builder
 */
public class WorkBookBuilder {

  private Map<String, Object> workBook = Maps.newHashMap();

  private boolean toJson = false;

  public WorkBookBuilder name(String name) {
    workBook.put("name", name);
    return this;
  }

  public WorkBookBuilder description(String description) {
    workBook.put("description", description);
    return this;
  }

  public WorkBookBuilder configuration(WorkBookConfiguration configuration) {
    workBook.put("configuration", GlobalObjectMapper.writeValueAsString(configuration));
    return this;
  }

  public WorkBookBuilder dashboard(DashBoard... boards) {
    return this;
  }

  public WorkBookBuilder workspace(String workspaceId) {
    workBook.put("workspace", "/api/workspaces/" + workspaceId);
    return this;
  }

  public WorkBookBuilder toJson(boolean toJson) {
    this.toJson = true;
    return this;
  }

  public Object build() {

    workBook.put("type", "workbook");

    if(toJson) {
      return GlobalObjectMapper.writeValueAsString(this.workBook);
    } else {
      return workBook;
    }
  }

}
