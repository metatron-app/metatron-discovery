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

package app.metatron.discovery.domain.workbook.configurations;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import java.io.Serializable;
import java.util.List;

import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.domain.workbook.configurations.board.BoardGlobalOptions;
import app.metatron.discovery.domain.workbook.configurations.board.WidgetRelation;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;

/**
 * Dashboard Configuration Spec.
 */
public class BoardConfiguration implements Serializable {

  /**
   * 데이터 소스 연결 설정
   */
  DataSource dataSource;

  /**
   * 보드 전체 옵션
   */
  BoardGlobalOptions options;

  /**
   * 대시보드내 배치되는 Widget 정보
   */
  List<LayoutWidget> widgets;

  /**
   * 대시보드 위젯 배치 정보 (대시보드 라이브러리 스펙에 따름)
   */
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  String content;

  /**
   * 페이지 위젯 관계 설정
   */
  List<WidgetRelation> relations;

  /**
   * 사용자 정의 필드 정보
   */
  List<UserDefinedField> userDefinedFields;

  /**
   * DashBoard 내 Global Filter 설정
   */
  List<Filter> filters;

  public BoardConfiguration() {
    // Empty Constructor
  }

  @JsonCreator
  public BoardConfiguration(@JsonProperty(value = "dataSource", required = true) DataSource dataSource,
                            @JsonProperty("options") BoardGlobalOptions options,
                            @JsonProperty("widgets") List<LayoutWidget> widgets,
                            @JsonProperty("content") String content,
                            @JsonProperty("relations") List<WidgetRelation> relations,
                            @JsonProperty("userDefinedFields") List<UserDefinedField> userDefinedFields,
                            @JsonProperty("filters") List<Filter> filters) {
    this.dataSource = dataSource;
    this.options = options;
    this.widgets = widgets;
    this.content = content;
    this.relations = relations;
    this.userDefinedFields = userDefinedFields;
    this.filters = filters;
  }

  public DataSource getDataSource() {
    return dataSource;
  }

  public BoardGlobalOptions getOptions() {
    return options;
  }

  public List<LayoutWidget> getWidgets() {
    return widgets;
  }

  public String getContent() {
    return content;
  }

  public List<WidgetRelation> getRelations() {
    return relations;
  }

  public List<UserDefinedField> getUserDefinedFields() {
    return userDefinedFields;
  }

  public List<Filter> getFilters() {
    return filters;
  }

  @Override
  public String toString() {
    return "BoardConfiguration{" +
        "dataSource=" + dataSource +
        ", options=" + options +
        ", widgets=" + widgets +
        ", content='" + content + '\'' +
        ", relations=" + relations +
        ", userDefinedFields=" + userDefinedFields +
        ", filters=" + filters +
        '}';
  }

  /**
   * 대시보드 레이아웃을 구성하는 위젯 정보
   */
  public static class LayoutWidget implements Serializable {

    /**
     * Widget Id
     */
    String id;

    /**
     * Widget Type
     */
    String type;

    /**
     * Widget Reference Id (Content 내 ID 와 연결됨)
     */
    String ref;

    /**
     * 대시보드 내에서 Widget Title 지정 (값이 없을 경우 Widget내 저장된 Title 지정)
     */
    String title;

    public LayoutWidget() {
    }

    @JsonCreator
    public LayoutWidget(@JsonProperty(value = "id", required = true) String id,
                        @JsonProperty(value = "type", required = true) String type,
                        @JsonProperty(value = "ref", required = true) String ref,
                        @JsonProperty("title") String title) {
      this.id = id;
      this.type = type;
      this.ref = ref;
      this.title = title;
    }

    public String getId() {
      return id;
    }

    public String getType() {
      return type;
    }

    public String getRef() {
      return ref;
    }

    public void setRef(String ref) {
      this.ref = ref;
    }

    public String getTitle() {
      return title;
    }

    @Override
    public String toString() {
      return "LayoutWidget{" +
          "id='" + id + '\'' +
          ", type='" + type + '\'' +
          ", ref='" + ref + '\'' +
          ", title='" + title + '\'' +
          '}';
    }
  }
}
