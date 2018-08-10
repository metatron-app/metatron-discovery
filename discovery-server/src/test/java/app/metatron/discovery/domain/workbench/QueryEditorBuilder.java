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
 * 테스트용 QueryEditor 모델 Builder
 */
public class QueryEditorBuilder {

  private Map<String, Object> queryEditor = Maps.newHashMap();

  private boolean toJson = false;

  public QueryEditorBuilder name(String name) {
    queryEditor.put("name", name);
    return this;
  }

  public QueryEditorBuilder order(int order) {
    queryEditor.put("order", order);
    return this;
  }

  public QueryEditorBuilder query(String query){
    queryEditor.put("query", query);
    return this;
  }

  public QueryEditorBuilder workbench(String workbenchId) {
    queryEditor.put("workbench", "/api/workbenchs/" + workbenchId);
    return this;
  }

  public QueryEditorBuilder toJson(boolean toJson) {
    this.toJson = true;
    return this;
  }

  public Object build() {

    if(toJson) {
      return GlobalObjectMapper.writeValueAsString(this.queryEditor);
    } else {
      return queryEditor;
    }
  }

}
