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

import com.fasterxml.jackson.databind.JsonNode;

import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.workbook.configurations.WidgetConfiguration;

/**
 * 테스트용 Page 모델 Builder
 */
public class WidgetBuilder {

  private Map<String, Object> widget = Maps.newHashMap();

  private boolean toJson = false;

  public WidgetBuilder name(String name) {
    widget.put("name", name);
    return this;
  }

  public WidgetBuilder configuration(WidgetConfiguration configuration) {
    widget.put("configuration", GlobalObjectMapper.getDefaultMapper().convertValue(configuration, JsonNode.class));
    return this;
  }

  public WidgetBuilder type(String type) {
    widget.put("type", type);
    return this;
  }

  public WidgetBuilder contents(String contents) {
    widget.put("contents", contents);
    return this;
  }

  public WidgetBuilder imageUrl(String imageUrl) {
    widget.put("imageUrl", imageUrl);
    return this;
  }

  public WidgetBuilder dashboard(String dashboardId) {
    widget.put("dashBoard", "/api/dashboard/" + dashboardId);
    return this;
  }

  public WidgetBuilder toJson(boolean toJson) {
    this.toJson = true;
    return this;
  }

  public Object build() {
    if(toJson) {
      return GlobalObjectMapper.writeValueAsString(widget);
    } else {
      return widget;
    }
  }

}
