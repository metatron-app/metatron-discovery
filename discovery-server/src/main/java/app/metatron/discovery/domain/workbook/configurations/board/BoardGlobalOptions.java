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

package app.metatron.discovery.domain.workbook.configurations.board;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

import app.metatron.discovery.util.EnumUtils;

/**
 * 대시보드 공통 설정
 */
public class BoardGlobalOptions implements Serializable {

  /**
   * Dashboard Layout 설정
   */
  LayoutOptions layout;

  /**
   * Dashboard 차트 표현 방식 설정
   */
  WidgetOptions widget;

  /**
   * RealTime 관련 설정
   */
  SyncOptions sync;

  public BoardGlobalOptions() {
    // Empty Constructor
  }

  @JsonCreator
  public BoardGlobalOptions(@JsonProperty("grid") LayoutOptions layout,
                            @JsonProperty("widget") WidgetOptions widget,
                            @JsonProperty("sync") SyncOptions sync) {
    this.layout = layout;
    this.widget = widget;
    this.sync = sync;
  }

  public LayoutOptions getLayout() {
    return layout;
  }

  public WidgetOptions getWidget() {
    return widget;
  }

  public SyncOptions getSync() {
    return sync;
  }

  @Override
  public String toString() {
    return "BoardGlobalOptions{" +
        "layout=" + layout +
        ", widget=" + widget +
        ", sync=" + sync +
        '}';
  }

  public static class WidgetOptions implements Serializable {

    /**
     * Show title of chart widget, if set 'ON'
     */
    ShowType showTitle;

    /**
     * Show legend of chart widget, if set 'ON'
     */
    ShowType showLegend;

    /**
     * Show mini-map of chart widget, if set 'ON'
     */
    ShowType showMinimap;

    public WidgetOptions() {
      // Empty Constructor
    }

    @JsonCreator
    public WidgetOptions(@JsonProperty("showTitle") String showTitle,
                        @JsonProperty("showLegend") String showLegend,
                        @JsonProperty("showMinimap") String showMinimap) {

      this.showTitle = EnumUtils.getCaseEnum(ShowType.class, showTitle, ShowType.BY_WIDGET);
      this.showLegend = EnumUtils.getCaseEnum(ShowType.class, showLegend, ShowType.BY_WIDGET);
      this.showMinimap = EnumUtils.getCaseEnum(ShowType.class, showMinimap, ShowType.BY_WIDGET);
    }

    public ShowType getShowTitle() {
      return showTitle;
    }

    public ShowType getShowLegend() {
      return showLegend;
    }

    public ShowType getShowMinimap() {
      return showMinimap;
    }

    @Override
    public String toString() {
      return "WidgetOptions{" +
          "showTitle=" + showTitle +
          ", showLegend=" + showLegend +
          ", showMinimap=" + showMinimap +
          '}';
    }
  }

  /**
   * Set Grid Layout
   */
  public static class LayoutOptions implements Serializable {

    /**
     * Layout Type
     */
    LayoutType layoutType;

    /**
     * height value, if layoutType set FIT_TO_HEIGHT
     */
    Integer layoutHeight;

    /**
     * widget 간 간격
     */
    Integer widgetPadding;

    public LayoutOptions() {
      // Empty Constructor
    }

    @JsonCreator
    public LayoutOptions(@JsonProperty("layoutType") String layoutType,
                         @JsonProperty("layoutHeight") Integer layoutHeight,
                         @JsonProperty("widgetPadding") Integer widgetPadding) {

      this.layoutType = EnumUtils.getCaseEnum(LayoutType.class, layoutType, LayoutType.FIT_TO_SCREEN);
      if (this.layoutType == LayoutType.FIT_TO_HEIGHT) {
        if (layoutHeight == null) {
          throw new IllegalArgumentException("Required height values, if gridType set 'FIT_TO_HEIGHT'");
        }
        this.layoutHeight = layoutHeight;
      }
      this.widgetPadding = widgetPadding;
    }

    public LayoutType getLayoutType() {
      return layoutType;
    }

    public Integer getLayoutHeight() {
      return layoutHeight;
    }

    public Integer getWidgetPadding() {
      return widgetPadding;
    }

    @Override
    public String toString() {
      return "LayoutOptions{" +
          "layoutType=" + layoutType +
          ", layoutHeight=" + layoutHeight +
          ", widgetPadding=" + widgetPadding +
          '}';
    }
  }

  /**
   * 실시간 관련 옵션
   */
  public static class SyncOptions implements Serializable {

    /**
     * 실시간 처리 수행 여부
     */
    Boolean enabled;

    /**
     * Pooling 주기
     */
    Integer interval;

    public SyncOptions() {
    }

    public SyncOptions(@JsonProperty("enabled") boolean enabled,
                       @JsonProperty("interval") Integer interval) {
      this.enabled = enabled;
      this.interval = interval == null ? 5 : interval;
    }

    public Boolean getEnabled() {
      return enabled;
    }

    public Integer getInterval() {
      return interval;
    }

    @Override
    public String toString() {
      return "SyncOptions{" +
          "enabled=" + enabled +
          ", interval=" + interval +
          '}';
    }
  }

  public enum LayoutType {
    FIT_TO_SCREEN, FIT_TO_HEIGHT
  }

  public enum ShowType {
    ON, OFF, BY_WIDGET
  }
}
