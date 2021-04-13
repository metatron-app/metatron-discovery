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

/**
 * 대시보드 옵션 구조체
 */
export class BoardGlobalOptions {
  public layout?: BoardLayoutOptions;    // 대시보드 레이아웃 정보
  public widget?: BoardWidgetOptions;    // 차트 표현 방식 설정
  public sync?: BoardSyncOptions;        // 대시보드 실시간 옵션 정보
  constructor() {
    this.layout = new BoardLayoutOptions();
    this.widget = new BoardWidgetOptions();
  }
} // structure - BoardGlobalOptions

/**
 * 대시보드 옵션 - 레이아웃 형태 정의 옵션 구조체
 */
export class BoardLayoutOptions {
  public layoutType:BoardLayoutType;   // Layout Type
  public layoutHeight:number;     // height value, if layoutType set FIT_TO_HEIGHT
  public widgetPadding:number;    // widget 간 간격

  constructor() {
    this.layoutType = BoardLayoutType.FIT_TO_SCREEN;
    this.widgetPadding = 5;
  }
} // structure - BoardLayoutOptions

/**
 * 대시보드 옵션 - 차트 속성 표시 옵션 구조체
 */
export class BoardWidgetOptions {
  public showTitle: WidgetShowType;
  public showLegend: WidgetShowType;
  public showMinimap: WidgetShowType;

  constructor() {
    this.showTitle = WidgetShowType.BY_WIDGET;
    this.showLegend = WidgetShowType.BY_WIDGET;
    this.showMinimap = WidgetShowType.BY_WIDGET;
  }
} // structure - BoardWidgetOptions

/**
 * 대시보드 옵션 - 실시간 옵션 구조체
 */
export class BoardSyncOptions {
  public enabled: boolean = false;
  public interval: number;

  constructor(interval?: number) {
    if (interval) {
      this.enabled = true;
      this.interval = interval;
    }
  }
} // structure - BoardSyncOptions

/**
 * 레이아웃 타입
 */
export enum BoardLayoutType {
  FIT_TO_SCREEN = 'FIT_TO_SCREEN',
  FIT_TO_HEIGHT = 'FIT_TO_HEIGHT'
}

/**
 * 위젯 표시 여부
 */
export enum WidgetShowType {
  ON = 'ON',
  OFF = 'OFF',
  BY_WIDGET = 'BY_WIDGET'
}
