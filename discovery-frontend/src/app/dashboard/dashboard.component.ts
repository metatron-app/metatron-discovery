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

import * as _ from 'lodash';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  ViewChild,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ChangeDetectionStrategy,
  SimpleChanges, SimpleChange
} from '@angular/core';
import { Workbook } from '../domain/workbook/workbook';
import { Dashboard, PresentationDashboard, LayoutMode } from '../domain/dashboard/dashboard';
import { Widget } from '../domain/dashboard/widget/widget';
import { ChartSelectInfo } from '../common/component/chart/base-chart';
import { SelectionFilter, SelectionFilterComponent } from './component/selection-filter/selection-filter.component';
import { DashboardLayoutComponent } from './component/dashboard-layout/dashboard.layout.component';
import { Filter } from '../domain/workbook/configurations/filter/filter';
import { PopupService } from '../common/service/popup.service';
import { DatasourceService } from '../datasource/service/datasource.service';
import { Datasource, TempDsStatus, TemporaryDatasource } from 'app/domain/datasource/datasource';
import { Modal } from '../common/domain/modal';
import { ConfirmModalComponent } from '../common/component/modal/confirm/confirm.component';
import { CommonConstant } from '../common/constant/common.constant';
import { CookieConstant } from '../common/constant/cookie.constant';
import { Alert } from '../common/util/alert.util';
import { WidgetService } from './service/widget.service';
import { DashboardUtil } from './util/dashboard.util';
import { EventBroadcaster } from '../common/event/event.broadcaster';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent extends DashboardLayoutComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | ViewChild Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(SelectionFilterComponent)
  public selectionFilter: SelectionFilterComponent;

  @ViewChild(ConfirmModalComponent)
  private _confirmModalComp: ConfirmModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public fullSizeWidget: Widget;      // 크게 보고 있는 위젯

  // 데이터소스 상태 정보
  public datasourceStatus: TempDsStatus = TempDsStatus.ENABLE;
  public enumStatus = TempDsStatus;

  public expiredDatasource: Datasource;   // 만료된 데이터소스 정보 ( for Linked Datasource )
  public ingestionStatus: { progress: number, message: string, step?: number };  // 적재 진행 정보

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public - Input Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input('dashboard')
  public inputDashboard: Dashboard;

  @Input('standalone')
  public isStandAlone: boolean = false;    // 독립 화면 여부

  // 관리 유저 여부
  @Input()
  public isManagementUser: boolean = false;

  @Input()
  public workbook: Workbook;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public - Output Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  public dashboardEvent = new EventEmitter<{ name: string, data?: any }>();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected broadCaster: EventBroadcaster,
              protected widgetService: WidgetService,
              protected datasourceService: DatasourceService,
              protected popupService: PopupService,
              protected elementRef: ElementRef,
              protected injector: Injector,
              protected appRef: ApplicationRef,
              protected componentFactoryResolver: ComponentFactoryResolver) {
    super(broadCaster, widgetService, datasourceService, popupService, appRef, componentFactoryResolver, elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 클래스 초기화
   */
  public ngOnInit() {
    super.ngOnInit();

    // 필터 위젯 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('CHANGE_FILTER_WIDGET').subscribe(data => {
        this.changeFilterWidgetEventHandler(data.filter);
      })
    );
  } // function - ngOnInit

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const boardChanges: SimpleChange = changes.inputDashboard;
    if (boardChanges && boardChanges.currentValue) {
      this.dashboard = boardChanges.currentValue;
      this._initViewPage();
    }
  } // function - ngOnChanges

  /**
   * 클래스 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /**
   * Layout 초기 로딩 완료 이벤트 핸들러
   */
  public onLayoutInitialised() {
    const ptBoardInfo: PresentationDashboard = <PresentationDashboard>this.dashboard;
    if (ptBoardInfo) {
      // 임시 로직 -> 후에 돈일대리와 내용 확인 할 것
      if (ptBoardInfo.selectionFilters) {
        ptBoardInfo.selectionFilters.forEach(item => {
          this.selectionFilter.changeFilter(item);
        });
      }
    }
    this.dashboardEvent.emit({ name: 'LAYOUT_INITIALISED' });
  } // function - onLayoutInitialised

  /**
   * 필터 위젯 변경에 대한 이벤트 핸들러
   * @param {Filter} filter
   */
  public changeFilterWidgetEventHandler(filter: Filter) {

    // 필터 정보 갱신
    DashboardUtil.updateBoardFilter(this.dashboard, filter, true);

    // 대시보드 필터 정보 조회 및 각 위젯 적용
    const boardFilters: Filter[] = DashboardUtil.getBoardFilters(this.dashboard);
    if (boardFilters && boardFilters.length > 0) {
      this.broadCaster.broadcast('SET_EXTERNAL_FILTER', { filters: boardFilters });
    }
    this.selectionFilter.init();
    // TODO 필터 변경알림 나중에 제거할 로직
    // this.popupService.notiFilter({ name: 'change-filter-widget-value', data: filter });
  } // function - changeFilterWidgetEventHandler

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 필터 내용이 변경됨
   * @param {SelectionFilter[]} data
   */
  public changedSelectionFilter(data: any) {

    // 셀렉션필터에 의한 변경
    if (_.isArray(data)) {
      const selectionFilters: SelectionFilter[] = <SelectionFilter[]>data;
      // console.info('셀렉션필터에 의한 변경', selectionFilters);
      // console.info('모든 차트에 필터 추가');

      this.broadCaster.broadcast(
        'SET_EXTERNAL_FILTER',
        { filters: DashboardUtil.getBoardFilters(this.dashboard).concat(selectionFilters) }
      );

    } else {
      // 차트에 의한 변경
      // console.info('위젯에 의한 변경', data, data.chartSelectInfo.mode);
      // console.info('위젯 해당 필터들 추가해서 다시 draw 요청');

      const externalFilterData:any = {};

      let widgetId: string = '';

      // 1. widgets에서 본인차트 제외
      if (data.chartSelectInfo.params && data.chartSelectInfo.params.hasOwnProperty('widgetId')) {
        widgetId = data.chartSelectInfo.params.widgetId;
        externalFilterData.excludeWidgetId = widgetId;
      }

      // 2. 선택 필터 데이터 변환
      let cloneBoardFilters:Filter[] = DashboardUtil.getBoardFilters(this.dashboard, true);
      let selectionFilters:SelectionFilter[] = data.filters.map((filter: SelectionFilter) => {
        filter.valueList = _.uniq(_.flattenDeep(filter.valueList));
        (widgetId) && (filter.selectedWidgetId = widgetId); // detail 차트를 위해 필터 선택을 한 위젯의 아이디를 저장해준다.
        return filter;
      });

      // 3. 선택필터와 보드필터 병합 ( 같은 필드 )
      cloneBoardFilters.forEach( item1 => {
        const idx:number = selectionFilters.findIndex( item2 => item1.field === item2.field && item1.ref === item2.ref );
        if( -1 < idx ) {
          if( 'include' === item1.type ) {
            const selection:SelectionFilter = selectionFilters.splice( idx, 1 )[0];
            ( selection.selectedWidgetId ) && ( item1['sourceWidgetId'] = selection.selectedWidgetId );
            item1['valueList'] = item1['valueList'] ? _.uniq( item1['valueList'].concat( selection.valueList ) ) : selection.valueList;
          }
        }
      });

      externalFilterData.filters = cloneBoardFilters.concat( selectionFilters );

      this.broadCaster.broadcast( 'SET_EXTERNAL_FILTER', externalFilterData );

    }
  } // function - changedSelectionFilter

  /**
   * 대시보드 열람화면 ( Workbook 화면 ) 에서 좌측 메뉴 접힘/펼침 시 실행하는 함수
   * ( 실행을 workbook.component.ts 에서 한다 )
   */
  public toggleFoldWorkbookDashboardList() {
    this.updateLayoutSize();
  } // function - toggleFoldWorkbookDashboardList

  /**
   * 현재 선택된 필터 정보를 반환한다
   * ( 실행을 workbook.component.ts 에서 한다 )
   * @returns {ChartSelectInfo[]}
   */
  public getSelectedFilters(): ChartSelectInfo[] {
    return this.selectionFilter.getChartSelectionList();
  } // function - getSelectedFilters

  /**
   * 확인 팝업 확인 클릭시
   * @param {Modal} modal
   */
  public confirm(modal: Modal) {
    if (modal.data.afterConfirm) {
      modal.data.afterConfirm.call(this);
    }
  } // function - confirm

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Ingestion
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 만료된 Linked Datasource를 다시 적재한다.
   */
  public reIngestion() {

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.board.ui.ingestion.time');
    // modal.btnName = this.translateService.instant('msg.comm.btn.del');
    modal.data = {
      type: 'RE-INGEST',
      afterConfirm: () => {
        this.datasourceStatus = TempDsStatus.PREPARING;
        this.ingestionStatus = { progress: 0, message: '', step: 1 };
        this.showBoardLoading();
        this.checkAndConnectWebSocket(true).then(() => {
          this.changeDetect.markForCheck();
          // console.info('>>>> before createLinkedDatasourceTemporary' );
          const tempDsInfo: TemporaryDatasource = this.expiredDatasource.temporary;
          this.datasourceService.createLinkedDatasourceTemporary(tempDsInfo.dataSourceId, tempDsInfo.filters)
            .then((result: { id: string, progressTopic }) => {
              this.changeDetect.markForCheck();
              // result
              // id: "TEMP-c5a839ae-f8a7-41e0-93f6-86e487f68dbd"
              // progressTopic : "/topic/datasources/TEMP-c5a839ae-f8a7-41e0-93f6-86e487f68dbd/progress"
              this._processIngestion(result.progressTopic);
              this.hideBoardLoading();
            })
            .catch(err => {
              console.error(err);
              this.commonExceptionHandler(err, this.translateService.instant('msg.board.alert.fail.ingestion'));
              this.hideBoardLoading();
            });
        });
      }
    };
    this._confirmModalComp.init(modal);

  } // function - reIngestion

  /**
   * Reingestion 진행
   * @param {string} progressTopic
   * @private
   */
  private _processIngestion(progressTopic: string) {
    try {
      // console.info('>>>> progressTopic', progressTopic);
      const headers: any = { 'X-AUTH-TOKEN': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN) };
      // 메세지 수신
      const subscription = CommonConstant.stomp.subscribe(progressTopic, (data: { progress: number, message: string }) => {
        if (-1 === data.progress) {
          this.ingestionStatus = data;
          this.ingestionStatus.step = -1;
          Alert.error(data.message);
          this.changeDetect.markForCheck();
        } else if (100 === data.progress) {
          this.datasourceStatus = TempDsStatus.ENABLE;        // 데이터소스 상태 변경
          this.changeDetect.markForCheck();
          this._initViewPage();                               // 화면 재설정
          CommonConstant.stomp.unsubscribe(subscription);     // Socket 응답 해제
        } else {
          this.ingestionStatus = data;
          this.ingestionStatus.step = 2;
          this.changeDetect.markForCheck();
        }
        console.info('response process', data);
      }, headers);
    } catch (e) {
      console.info(e);
    }
  } // function - _processIngestion

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 화면 초기화
   * @private
   */
  private _initViewPage() {
    (0 === this.router.url.indexOf('/dashboard')) && (this.isStandAlone = true);

    // 초기화
    this.fullSizeWidget = null;
    if (this.selectionFilter) {
      this.selectionFilter.resetFilter(false);
    }

    const dashboard = this.dashboard;
    if (dashboard) {

      // Linked Datasource 인지 그리고 데이터소스가 적재되었는지 여부를 판단함
      const mainDsList:Datasource[] = DashboardUtil.getMainDataSources( dashboard );

      if (0 < mainDsList.length) {
        this.showBoardLoading();
        this._runDashboard(dashboard);
/*
        // Linked 에 대한 처리 추후 확인
        if (mainDs.connType === ConnectionType.LINK) {
          this.showBoardLoading();
          this.datasourceService.getDatasourceDetail(dashboard.temporaryId).then((ds: Datasource) => {
            (ds.temporary) && (this.datasourceStatus = ds.temporary.status);
            if (TempDsStatus.ENABLE === this.datasourceStatus) {
              dashboard.configuration.dataSource.metaDataSource = ds;
              this._runDashboard(dashboard);
            } else {
              this.expiredDatasource = ds;
              this.hideBoardLoading();
            }
            this.changeDetect.markForCheck();
          }).catch(err => this.commonExceptionHandler(err));
        } else {
          this.showBoardLoading();
          this._runDashboard(dashboard);
        }
*/
      }
    } // end if - this._inputDashboard

  } // function - _initViewPage

  /**
   * 대시보드를 실행(?) 한다 ( 초기설정 시작 )
   * @param {Dashboard} targetDashboard
   * @private
   */
  private _runDashboard(targetDashboard: Dashboard) {
    this.initializeDashboard(targetDashboard, this._getLayoutMode()).then(() => {
      this.safelyDetectChanges();
    }).catch( (error) => {
      console.error( error );
      this.hideBoardLoading();
    });
  } // function - _runDashboard

  /**
   * 설정값에 따른 레이아웃 모드 반환
   * @return {LayoutMode}
   * @private
   */
  private _getLayoutMode(): LayoutMode {
    if (this.isStandAlone) {
      return LayoutMode.STANDALONE;
    } else if (this.isManagementUser) {
      return LayoutMode.VIEW_AUTH_MGMT;
    } else {
      return LayoutMode.VIEW;
    }
  } // function - _getLayoutMode

}
