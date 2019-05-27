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
import { Dashboard, PresentationDashboard, LayoutMode, BoardDataSource } from '../domain/dashboard/dashboard';
import { Widget } from '../domain/dashboard/widget/widget';
import { ChartSelectInfo } from '../common/component/chart/base-chart';
import { SelectionFilterComponent } from './component/selection-filter/selection-filter.component';
import { DashboardLayoutComponent } from './component/dashboard-layout/dashboard.layout.component';
import { Filter } from '../domain/workbook/configurations/filter/filter';
import { PopupService } from '../common/service/popup.service';
import { DatasourceService } from '../datasource/service/datasource.service';
import {
  ConnectionType,
  Datasource,
  TempDsStatus,
  TemporaryDatasource
} from 'app/domain/datasource/datasource';
import { Modal } from '../common/domain/modal';
import { ConfirmModalComponent } from '../common/component/modal/confirm/confirm.component';
import { CommonConstant } from '../common/constant/common.constant';
import { CookieConstant } from '../common/constant/cookie.constant';
import { Alert } from '../common/util/alert.util';
import { WidgetService } from './service/widget.service';
import { DashboardUtil } from './util/dashboard.util';
import { EventBroadcaster } from '../common/event/event.broadcaster';
import {isNullOrUndefined} from "util";
import { Message } from '@stomp/stompjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [ '.ddp-div-table { position: absolute;top: 0;left: 0;right: 0;bottom: 0; }' ]
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

  public isError:boolean = false;

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
    if (boardChanges) {
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
      this.broadCaster.broadcast('SET_GLOBAL_FILTER', { filters: boardFilters });
    }
    this.selectionFilter.init();
  } // function - changeFilterWidgetEventHandler

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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
    return this.selectionFilter ? this.selectionFilter.getChartSelectionList() : [];
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

  /**
   * show error screen
   */
  public showError() {
    this.isError = true;
    this.safelyDetectChanges();
  } // function - showError

  /**
   * hide error screen
   */
  public hideError() {
    this.isError = false;
    this.safelyDetectChanges();
  } // function - hideError

  /**
   * request reload board
   */
  public reloadBoard() {
    this.dashboardEvent.emit({ name: 'RELOAD_BOARD' });
  } // function - reloadBoard

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
      const subscription = CommonConstant.stomp.watch(progressTopic).subscribe((msg: Message) => {

        const data: { progress: number, message: string } = JSON.parse( msg.body );

        if (-1 === data.progress) {
          this.ingestionStatus = data;
          this.ingestionStatus.step = -1;
          Alert.error(data.message);
          this.changeDetect.markForCheck();
        } else if (100 === data.progress) {
          this.datasourceStatus = TempDsStatus.ENABLE;        // 데이터소스 상태 변경
          this.changeDetect.markForCheck();
          this._initViewPage();                               // 화면 재설정
          subscription.unsubscribe();     // Socket 응답 해제
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - Linked Datasource Ingestion
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 화면 초기화
   * @private
   */
  private _initViewPage() {
    (0 === this.router.url.indexOf('/dashboard')) && (this.isStandAlone = true);

    // 초기화
    this.fullSizeWidget = null;
    this.datasourceStatus = TempDsStatus.ENABLE;
    if (this.selectionFilter) {
      this.selectionFilter.resetFilter(false);
    }

    const dashboard = this.dashboard;
    if (dashboard) {

      // Send statistics data
      this.sendViewActivityStream(dashboard.id, 'DASHBOARD');

      // Linked Datasource 인지 그리고 데이터소스가 적재되었는지 여부를 판단함
      const mainDsList: Datasource[] = DashboardUtil.getMainDataSources(dashboard);

      const linkedDsList: Datasource[] = mainDsList.filter(item => item.connType === ConnectionType.LINK);
      if (linkedDsList && 0 < linkedDsList.length) {
        // Multi Datasource Dashboard
        this.showBoardLoading();

        const promises = [];

        linkedDsList.forEach(dsInfo => {
          promises.push(new Promise<any>((res, rej) => {
            const boardDsInfo: BoardDataSource = DashboardUtil.getBoardDataSourceFromDataSource(dashboard, dsInfo);
            if( isNullOrUndefined( boardDsInfo['temporaryId'] ) ) {
              rej( 'INVALID_LINKED_DATASOURCE' );
              return;
            }
            this.datasourceService.getDatasourceDetail(boardDsInfo['temporaryId']).then((ds: Datasource) => {

              if (this.datasourceStatus || TempDsStatus.ENABLE !== this.datasourceStatus) {
                (ds.temporary) && (this.datasourceStatus = ds.temporary.status);
              }

              if (ds.temporary && TempDsStatus.ENABLE === ds.temporary.status) {
                boardDsInfo.metaDataSource = ds;
                if( dashboard.configuration.filters ) {
                  dashboard.configuration.filters = ds.temporary.filters.concat( dashboard.configuration.filters);
                } else {
                  dashboard.configuration.filters = ds.temporary.filters;
                }
                // if( 'multi' === dashboard.configuration.dataSource.type ) {
                //   dashboard.configuration.dataSource.dataSources.some( item => {
                //     if( DashboardUtil.isSameDataSource( item, ds ) ) {
                //       item.metaDataSource = ds;
                //       return true;
                //     }
                //     return false;
                //   });
                // } else {
                //   dashboard.configuration.dataSource.metaDataSource = ds;
                // }
              } else {
                this.expiredDatasource = ds;
                this.hideBoardLoading();
              }

              res();

            }).catch(err => rej(err));
          }));
        });

        Promise.all(promises).then(() => {
          if (TempDsStatus.ENABLE === this.datasourceStatus) {
            this._runDashboard(dashboard);
          } else {
            this.onLayoutInitialised();
            this.hideBoardLoading();
          }
          this.safelyDetectChanges();
        }).catch((error) => {
          if( 'INVALID_LINKED_DATASOURCE' === error ) {
            this.showError();
            this.onLayoutInitialised();
            this.hideBoardLoading();
          } else {
            this.commonExceptionHandler(error);
            this.onLayoutInitialised();
            this.hideBoardLoading();
          }
        });

      } else {
        // Single Datasource Dashboard
        this.showBoardLoading();
        this._runDashboard(dashboard);
      }

    } else {
      this.destroyDashboard();
    }

  } // function - _initViewPage

  /**
   * 대시보드를 실행(?) 한다 ( 초기설정 시작 )
   * @param {Dashboard} targetDashboard
   * @private
   */
  private _runDashboard(targetDashboard: Dashboard) {
    this.initializeDashboard(targetDashboard, this._getLayoutMode()).then(() => {
      this.safelyDetectChanges();
    }).catch((error) => {
      console.error(error);
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
