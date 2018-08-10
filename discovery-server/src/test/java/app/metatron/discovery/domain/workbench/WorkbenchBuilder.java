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

package app.metatron.discovery.domain.workbench;

import com.google.common.collect.Maps;

import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 * 테스트용 Workbench 모델 Builder
 */
public class WorkbenchBuilder {

  private Map<String, Object> workbench = Maps.newHashMap();

  private boolean toJson = false;

  public WorkbenchBuilder name(String name) {
    workbench.put("name", name);
    return this;
  }

  public WorkbenchBuilder description(String description) {
    workbench.put("description", description);
    return this;
  }

  public WorkbenchBuilder globalVar(String globalVar){
    workbench.put("globalVar", globalVar);
    return this;
  }

  public WorkbenchBuilder workspace(String workspaceId) {
    workbench.put("workspace", "/api/workspaces/" + workspaceId);
    return this;
  }

  public WorkbenchBuilder dataConnection(String dataConnectionId){
    workbench.put("dataConnection", "/api/dataconnections/" + dataConnectionId);
    return this;
  }

  public WorkbenchBuilder favorite(Boolean favorite){
    workbench.put("favorite", favorite);
    return this;
  }

  public WorkbenchBuilder tag(String tag){
    workbench.put("tag", tag);
    return this;
  }

  public WorkbenchBuilder folderId(String folderId){
    workbench.put("folderId", folderId);
    return this;
  }

  public WorkbenchBuilder toJson(boolean toJson) {
    this.toJson = true;
    return this;
  }

  public Object build() {

    workbench.put("type", "workbench");

    if(toJson) {
      return GlobalObjectMapper.writeValueAsString(this.workbench);
    } else {
      return workbench;
    }
  }

}
