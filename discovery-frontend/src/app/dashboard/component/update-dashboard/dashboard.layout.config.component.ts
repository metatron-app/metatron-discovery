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

import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {EventBroadcaster} from '@common/event/event.broadcaster';

import {
  BoardGlobalOptions,
  BoardLayoutOptions,
  BoardLayoutType,
  BoardSyncOptions,
  BoardWidgetOptions,
  WidgetShowType
} from '@domain/dashboard/dashboard.globalOptions';
import {BoardConfiguration, Dashboard} from '@domain/dashboard/dashboard';
import {SourceType} from '@domain/datasource/datasource';

@Component({
  selector: 'app-dashboard-layout-config',
  templateUrl: './dashboard.layout.config.component.html'
})
export class DashboardLayoutConfigComponent extends AbstractComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _widgetOpts: BoardWidgetOptions = new BoardWidgetOptions();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Input&Output Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input('dashboard')
  public inputDashboard: Dashboard;

  @Input('boardConf')
  public inputBoardConf: BoardConfiguration;  // Board 설정

  @Output()
  public changeBoardConf: EventEmitter<BoardConfiguration> = new EventEmitter();     // 변경 이벤트

  public boardConf: BoardConfiguration;  // Board 설정
  public dashboard: Dashboard;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public layoutHeight: number = 900;
  public layoutMargin: number = 5;

  // Data Sync Interval 설정 관련
  public isLiveDatasource: boolean = false;
  public isShowIntervalList: boolean = false;
  public syncIntervals: SyncInterval[] = [
    {name: this.translateService.instant('msg.comm.ui.not-used'), interval: 0},
    {name: '1', interval: 1},
    {name: '5', interval: 5},
    {name: '10', interval: 10},
    {name: '30', interval: 30},
    {name: '60', interval: 60}
  ];
  public selectedInterval: SyncInterval;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
    this.selectedInterval = this.syncIntervals[0];
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();

    // 초기값 백업 및 변수 정의
    const boardConf: BoardConfiguration = this.boardConf;
    const globalOpts: BoardGlobalOptions = boardConf.options;

    // 라이브 데이터소스 여부 및 동기화 주기 설정
    this.isLiveDatasource = this.dashboard.dataSources.some(item => {
      return SourceType.REALTIME === item.srcType
        && item.id === this.dashboard.configuration.dataSource.id;
    });
    if (this.isLiveDatasource && globalOpts.sync && globalOpts.sync.enabled) {
      this.selectedInterval = this.syncIntervals.find(item => item.interval === globalOpts.sync.interval);
    }

    // 기존 Layout 정보에 레이아웃 옵션 설정
    (globalOpts.layout.layoutType) || (globalOpts.layout.layoutType = BoardLayoutType.FIT_TO_SCREEN);
    (globalOpts.layout.layoutHeight) && (this.layoutHeight = globalOpts.layout.layoutHeight);
    (globalOpts.layout.widgetPadding) && (this.layoutMargin = globalOpts.layout.widgetPadding);

    // 차트 옵션 설정
    this._widgetOpts.showTitle = (globalOpts.widget.showTitle) ? globalOpts.widget.showTitle : WidgetShowType.BY_WIDGET;
    this._widgetOpts.showLegend = (globalOpts.widget.showLegend) ? globalOpts.widget.showLegend : WidgetShowType.BY_WIDGET;
    this._widgetOpts.showMinimap = (globalOpts.widget.showMinimap) ? globalOpts.widget.showMinimap : WidgetShowType.BY_WIDGET;


    // 위젯 타이틀 표시 여부 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('TOGGLE_TITLE').subscribe(() => {
        this._widgetOpts.showTitle = WidgetShowType.BY_WIDGET;
      })
    );

    // 범례 표시 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('TOGGLE_LEGEND').subscribe(() => {
        this._widgetOpts.showLegend = WidgetShowType.BY_WIDGET;
      })
    );

    // 미니맵 표시 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('TOGGLE_MINIMAP').subscribe(() => {
        this._widgetOpts.showMinimap = WidgetShowType.BY_WIDGET;
      })
    );

    this.safelyDetectChanges();
  }

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const confChanges: SimpleChange = changes.inputBoardConf;
    const boardChanges: SimpleChange = changes.inputDashboard;
    if (confChanges && confChanges.currentValue) {
      this.boardConf = confChanges.currentValue;
    }
    if (boardChanges && boardChanges.currentValue) {
      this.dashboard = boardChanges.currentValue;
    }
  } // function - ngOnChanges

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Screen Fit 여부를 반환한다.
   */
  public isFitToScreen() {
    return this.boardConf.options.layout.layoutType === BoardLayoutType.FIT_TO_SCREEN;
  } // function - isFitToScreen

  /**
   * 레이아웃을 화면에 꽉차게 구성한다.
   */
  public setFitToScreen() {
    const layoutInfo: BoardLayoutOptions = this.boardConf.options.layout;
    layoutInfo.layoutType = BoardLayoutType.FIT_TO_SCREEN;
    delete layoutInfo.layoutHeight;
    this.changeConfig();
  } // function - setFitToScreen

  /**
   * Height Fit 여부를 반환한다.
   */
  public isFitToHeight() {
    return this.boardConf.options.layout.layoutType === BoardLayoutType.FIT_TO_HEIGHT;
  } // function - isFitToHeight

  /**
   * 레이아웃의 높이를 지정할 수 있는 형식으로 구성한다.
   */
  public setFitToHeight() {
    const layoutInfo: BoardLayoutOptions = this.boardConf.options.layout;
    layoutInfo.layoutType = BoardLayoutType.FIT_TO_HEIGHT;
    layoutInfo.layoutHeight = this.layoutHeight;
    this.changeConfig();
  } // function - setFitToHeight

  /**
   * 레이아웃 높이를 지정한다
   * @param {number} heightValue
   */
  public setLayoutHeight(heightValue: number) {
    const layoutInfo: BoardLayoutOptions = this.boardConf.options.layout;
    if (BoardLayoutType.FIT_TO_HEIGHT === layoutInfo.layoutType) {
      if (heightValue < 900) {
        heightValue = 900;
      } else if (heightValue > 2400) {
        heightValue = 2400;
      }
      this.layoutHeight = heightValue;
      layoutInfo.layoutHeight = heightValue;
      this.changeConfig();
    }
  } // function - setLayoutHeight

  /**
   * 레이아웃 여백 설정
   * @param {number} marginValue
   */
  public setLayoutMargin(marginValue: number) {
    if (marginValue < 0) {
      marginValue = 0;
    } else if (marginValue > 100) {
      marginValue = 100;
    }
    this.layoutMargin = marginValue;
    this.boardConf.options.layout.widgetPadding = marginValue;
    this.changeConfig();
  } // function - setLayoutMargin

  /**
   * 위젯 기능 - 위젯 설정 여부
   * @param {string} feature
   */
  public isByWidgetFeature(feature: string) {
    return this._widgetOpts[feature] === WidgetShowType.BY_WIDGET;
  } // function - isByWidgetFeature

  /**
   * 위젯 기능 - 일괄 설정 여부
   * @param {string} feature
   */
  public isCheckedFeature(feature: string) {
    return this._widgetOpts[feature] === WidgetShowType.ON;
  } // function - isCheckedFeature

  /**
   * 위젯 기능 - 명칭 조회
   * @param {string} feature
   * @return {string}
   */
  public getFeatureLabel(feature: string): string {
    return this._widgetOpts[feature];
  } // function - getFeatureLabel

  /**
   * 위젯 기능 - 클릭 이벤트 핸들러
   * @param {string} feature
   */
  public featureClickHandler(feature: string) {
    this._widgetOpts[feature]
      = (this._widgetOpts[feature] === WidgetShowType.ON) ? WidgetShowType.OFF : WidgetShowType.ON;
    this.boardConf.options.widget = this._widgetOpts;
    this.changeConfig();
  } // function - featureClickHandler

  /**
   * 변경사항 적용
   */
  public changeConfig() {
    // 상위 컴포넌트에 options 전달
    this.changeBoardConf.emit(this.boardConf);
  } // function - changeConfig

  /**
   * Data Sync Interval을 선택한다.
   * @param {SyncInterval} item
   */
  public selectSyncInterval(item: SyncInterval) {
    this.selectedInterval = item;
    if (0 < item.interval) {
      this.boardConf.options.sync = new BoardSyncOptions(item.interval);
    } else {
      this.boardConf.options.sync = new BoardSyncOptions();
    }
    this.changeConfig();
  } // function - selectSyncInterval

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

/**
 * Interval 목록 아이템 클래스
 */
class SyncInterval {
  public name: string;
  public interval: number;
}
