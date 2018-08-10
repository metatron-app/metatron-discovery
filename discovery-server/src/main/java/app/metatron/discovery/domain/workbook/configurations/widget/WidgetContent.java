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

package app.metatron.discovery.domain.workbook.configurations.widget;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class WidgetContent {

  /**
   * Layout Content Type : stack, row, column, component
   */
  String type;

  /**
   * Widget Type : page, filter, text
   */
  String widgetType;

  /**
   * Widget Id
   */
  String id;

  /**
   * 이게 왜 필요할까요?
   */
  String title;

  /**
   * isClosable -> closable
   *
   */
  Boolean closable;

  /**
   * reorderEnable -> enableReorder
   *
   */
  Boolean enableReorder;

  /**
   * stack, row type content 일대 지정
   */
  Double height;

  /**
   * stack column type content 일대 지정
   */
  Double width;

  /**
   * stack type content 일대 지정
   */
  Integer activeItemIndex;

  /**
   * Layout 에 포함되는 컨텐츠 지정
   */
  List<WidgetContent> content;

  public WidgetContent() {
  }

  @JsonCreator
  public WidgetContent(@JsonProperty("type") String type,
                       @JsonProperty("widgetType") String widgetType,
                       @JsonProperty("id") String id,
                       @JsonProperty("title") String title,
                       @JsonProperty("closable") Boolean closable,
                       @JsonProperty("enableReorder") Boolean enableReorder,
                       @JsonProperty("height") Double height,
                       @JsonProperty("width") Double width,
                       @JsonProperty("activeItemIndex") Integer activeItemIndex,
                       @JsonProperty("content") List<WidgetContent> content) {
    this.type = type;
    this.widgetType = widgetType;
    this.id = id;
    this.title = title;
    this.closable = closable;
    this.enableReorder = enableReorder;
    this.height = height;
    this.width = width;
    this.activeItemIndex = activeItemIndex;
    this.content = content;
  }

  public String getType() {
    return type;
  }

  public String getWidgetType() {
    return widgetType;
  }

  public String getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public Boolean getClosable() {
    return closable;
  }

  public Boolean getEnableReorder() {
    return enableReorder;
  }

  public Double getHeight() {
    return height;
  }

  public Double getWidth() {
    return width;
  }

  public Integer getActiveItemIndex() {
    return activeItemIndex;
  }

  public List<WidgetContent> getContent() {
    return content;
  }
}
