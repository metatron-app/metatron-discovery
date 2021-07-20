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
import * as $ from 'jquery';
import {isNullOrUndefined, isObject} from 'util';

import {
  AfterViewInit,
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {Alert} from '@common/util/alert.util';
import {CommonUtil} from '@common/util/common.util';
import {PopupService} from '@common/service/popup.service';
import {ImageService} from '@common/service/image.service';
import {Modal} from '@common/domain/modal';
import {SubscribeArg} from '@common/domain/subscribe-arg';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {ChartType} from '@common/component/chart/option/define/common';
import {UIMapOption} from '@common/component/chart/option/ui-option/map/ui-map-chart';

import {Workbook} from '@domain/workbook/workbook';
import {
  BoardConfiguration,
  BoardDataSource,
  Dashboard,
  DashboardWidgetRelation,
  LayoutMode
} from '@domain/dashboard/dashboard';
import {TextWidget} from '@domain/dashboard/widget/text-widget';
import {ConnectionType, Datasource, Field, FieldRole} from '@domain/datasource/datasource';
import {PageWidget, PageWidgetConfiguration} from '@domain/dashboard/widget/page-widget';
import {Widget} from '@domain/dashboard/widget/widget';
import {CustomField} from '@domain/workbook/configurations/field/custom-field';
import {Filter} from '@domain/workbook/configurations/filter/filter';
import {Pivot} from '@domain/workbook/configurations/pivot';
import {Shelf, ShelfLayers} from '@domain/workbook/configurations/shelf/shelf';
import {InclusionFilter} from '@domain/workbook/configurations/filter/inclusion-filter';
import {WidgetShowType} from '@domain/dashboard/dashboard.globalOptions';
import {FilterWidget, FilterWidgetConfiguration} from '@domain/dashboard/widget/filter-widget';

import {DatasourceService} from '../datasource/service/datasource.service';
import {PageComponent} from '../page/page.component';
import {DashboardUtil} from './util/dashboard.util';
import {FilterUtil} from './util/filter.util';
import {WidgetService} from './service/widget.service';
import {DashboardService} from './service/dashboard.service';
import {ConfigureFiltersComponent} from './filters/configure-filters.component';
import {PageRelationComponent} from './component/update-dashboard/page-relation.component';
import {TextWidgetPanelComponent} from './component/update-dashboard/text-widget-panel.component';
import {DatasourcePanelComponent} from './component/update-dashboard/datasource-panel.component';
import {DashboardLayoutComponent} from './component/dashboard-layout/dashboard.layout.component';

@Component({
  selector: 'app-update-dashboard',
  templateUrl: './update-dashboard.component.html'
})
export class UpdateDashboardComponent extends DashboardLayoutComponent implements OnInit, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | ViewChild Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(DatasourcePanelComponent)
  private datasourcePanelComp: DatasourcePanelComponent;

  @ViewChild(TextWidgetPanelComponent)
  private _textWidgetsPanelComp: TextWidgetPanelComponent;

  @ViewChild(PageRelationComponent)
  private _pageRelationComp: PageRelationComponent;

  @ViewChild(ConfigureFiltersComponent)
  private _configFilterComp: ConfigureFiltersComponent;

  // Dashboard util for get dashboard image
  public dashboardUtil: DashboardUtil = new DashboardUtil();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 데이터소스 필드 리스트
  public fields: Field[];

  // 선택한 오른쪽 탭
  public selectedRightTab: RightTab = RightTab.CHART;

  // 우측 탭
  public rightTab = RightTab;

  // 대시보드 검색
  public isSearchMode = false;
  public searchText = '';

  // 위젯
  public deleteWidgetIds: string[] = [];

  // 편집할 위젯
  public selectedPageWidget: PageWidget;

  // 차트 필터 목록
  public chartFilters: Filter[] = [];

  public isShowDetailMenu = false;            // 디테일 메뉴
  public isShowDashboardList = false;         // 대시보드 리스트 보이기 유무
  public isAppendLayout: boolean = false;     // 생성 후 바로 위젯 추가 여부
  public isUpdateDataSource: boolean = false;  // 데이터소스 수정 여부
  public isShowPage: boolean = false;         // 페이지 상세 show/hide
  public isShowChartPanelTooltip: boolean = false;
  public isChangeDataSource: boolean = false;

  public orgBoardInfo: Dashboard;

  public hierarchyType: string;
  public openPanelDefaultFilter: number = -1;             // 오픈 일반 필터 index
  public defaultFilterListInPanel: Filter[] = [];         // 패널 내 기본 필터 목록
  public openPanelGeneralFilter: number = 0;              // 오픈 일반 필터 index
  public generalFilterListInPanel: FilterWidget[] = [];   // 패널 내 일반 필터 목록

  public filterUtil = FilterUtil;



  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public - Input Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크북 정보
  @Input()
  public workbook: Workbook;

  // 대시보드 리스트
  @Input()
  public dashboards: Dashboard[] = [];

  @Input()
  public startupCmd: { cmd: string, id?: string, type?: string };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public - Output Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 모드 변경 이벤트
  @Output()
  public changeMode = new EventEmitter<string>();

  // 대시보드 선택
  @Output()
  public selectedDashboard: EventEmitter<Dashboard> = new EventEmitter();

  // 대시보드 생성
  @Output()
  public createDashboard = new EventEmitter<any>();

  // 대시보드 업데이트
  @Output()
  public updateComplete: EventEmitter<Dashboard> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(public imageService: ImageService,
              protected broadCaster: EventBroadcaster,
              protected dashboardService: DashboardService,
              protected widgetService: WidgetService,
              protected datasourceService: DatasourceService,
              protected popupService: PopupService,
              protected appRef: ApplicationRef,
              protected componentFactoryResolver: ComponentFactoryResolver,
              protected elementRef: ElementRef,
              protected activatedRoute: ActivatedRoute,
              protected injector: Injector) {
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

    // 대시보드 데이터소스 변경 - 관계 설정 및 조인
    this.subscriptions.push(
      this.broadCaster.on<any>('UPDATE_BOARD_UPDATE_DATASOURCE').subscribe(() => {
        this.isUpdateDataSource = true;
        this.isShowPage = false;
      })
    );

    // 타이틀 변경 이벤트
    this.subscriptions.push(
      this.broadCaster.on<any>('WIDGET_CHANGE_TITLE').subscribe(data => {
        const widget = DashboardUtil.getWidget(this.dashboard, data.widgetId);
        if (widget) {
          widget.name = data.value;
          this.safelyDetectChanges();
        }
      })
    );

    // 위젯 타이틀 표시 여부 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('TOGGLE_TITLE').subscribe(data => {
        this.dashboard.configuration.options.widget.showTitle = WidgetShowType.BY_WIDGET;
        this.dashboard = DashboardUtil.setVisibleWidgetTitle(this.dashboard, data.widgetId, data.mode);
      })
    );

    // 범례 표시 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('TOGGLE_LEGEND').subscribe(() => {
        this.dashboard.configuration.options.widget.showLegend = WidgetShowType.BY_WIDGET;
      })
    );

    this.subscriptions.push(
      this.broadCaster.on<any>('TOGGLE_MINIMAP').subscribe(() => {
        this.dashboard.configuration.options.widget.showMinimap = WidgetShowType.BY_WIDGET;
      })
    );

    this.subscriptions.push(
      this.broadCaster.on<any>('TOGGLE_SYNC').subscribe((data) => {
        const widgetInfo = DashboardUtil.getWidget(this.dashboard, data.widgetId);
        const widgetConf = (widgetInfo.configuration as PageWidgetConfiguration);
        widgetConf.sync = (false === widgetConf.sync);
        DashboardUtil.updateWidget(this.dashboard, widgetInfo);
      })
    );

    // 위젯 복사
    this.subscriptions.push(
      this.broadCaster.on<any>('COPY_WIDGET').subscribe(data => {
        this.showBoardLoading();
        const srcWidgetInfo = DashboardUtil.getWidget(this.dashboard, data.widgetId);
        // 복제 위젯 정보 설정 및 생성
        const newWidgetInfo: PageWidget = _.cloneDeep(srcWidgetInfo) as PageWidget;
        delete newWidgetInfo.id;
        newWidgetInfo.name = srcWidgetInfo.name + '_copy';
        const board: Dashboard = this.dashboard;
        this.widgetService.createWidget(newWidgetInfo, board.id).then(resWidgetInfo => {
          const pageWidget: PageWidget = _.extend(new PageWidget(), resWidgetInfo);

          // 위젯필터가 있는 경우 정보 추가
          if (pageWidget.configuration.filters) {
            pageWidget.configuration.filters.forEach(filter => {
              (filter.ui) || (filter.ui = {});
              filter.ui.widgetId = pageWidget.id;
            })
          }
          this.dashboard = this._addWidget(this.dashboard, pageWidget);
          this.appendWidgetInLayout([pageWidget]);
          this.hideBoardLoading();
          this.safelyDetectChanges();
        }).catch(err => this.commonExceptionHandler(err));
      })
    );

    // 위젯 수정
    this.subscriptions.push(
      this.broadCaster.on<any>('EDIT_WIDGET').subscribe(data => {
        this.editWidgetEventHandler(data.widgetId);
      })
    );

    // 위젯 삭제
    this.subscriptions.push(
      this.broadCaster.on<any>('REMOVE').subscribe(data => {
        this.removeWidgetComponent(data.widgetId);
      })
    );

    // 필터 선택 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('CHANGE_FILTER_SELECTOR').subscribe(data => {
        this.dashboard = DashboardUtil.updateWidget(this.dashboard, data.widget);
        this.dashboard = DashboardUtil.updateBoardFilter(this.dashboard, data.filter)[0];
      })
    );

    // 위젯 편집 이벤트 ( 대시보드 편집 화면으로 이동 )
    this.subscriptions.push(
      this.broadCaster.on<any>('MOVE_EDIT_WIDGET').subscribe(data => {
        this.editWidgetEventHandler(data.id);
      })
    );

    this.selectedRightTab = RightTab.CHART;

    // 팝업에 대한 이벤트 처리
    const popupSubscribe = this.popupService.view$.subscribe((data: SubscribeArg) => {
      this.isShowPage = false;
      this.selectedPageWidget = null;

      if ('modify-page-close' !== data.name) {
        let alertMsg: string = '';
        const changeWidgetData: PageWidget = data.data as PageWidget;
        if ('create-page-complete' === data.name) {
          // 위젯 생성
          this.createPageWidget(changeWidgetData, this.isAppendLayout);
          alertMsg = this.translateService.instant('msg.board.alert.create.chart.success');
        } else if ('modify-page-complete' === data.name) {
          this.modifyPageWidget(changeWidgetData, true);
          alertMsg = this.translateService.instant('msg.board.alert.update.chart.success');
        }

        // 위젯 및 필터 재정리
        const customFields: CustomField[] = changeWidgetData.configuration.customFields;
        this._syncWidgetsAndFilters(customFields, DashboardUtil.getFields(this.dashboard), changeWidgetData.id);

        Alert.success(alertMsg);

        // Layout 업데이트
        this.renderLayout();

        this.dashboard.updateId = CommonUtil.getUUID();

        this.hideBoardLoading();
      }

      // 바로 추가 여부 초기화
      this.isAppendLayout = false;

      this.safelyDetectChanges();
    });
    // 일괄삭제를 위한 서비스 등록
    this.subscriptions.push(popupSubscribe);
    $('body').css('overflow', 'hidden');


  } // function - ngOnInit

  public ngAfterViewInit() {
    super.ngAfterViewInit();
    this.showBoardLoading();
    const dashboard = this.dashboardService.getCurrentDashboard();
    this.dashboardService.getDashboard(dashboard.id).then((result: Dashboard) => {
      this.hideBoardLoading();                   // 로딩 hide
      this.dashboard = result;
      this.dashboard.workBook = this.workbook;
      result.workBook = this.workbook;
      this._initViewPage();
    }).catch(() => {
      // 로딩 hide
      this.hideBoardLoading();    // 로딩 hide
    });
  }

  /**
   * 클래스 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
    $('body').css('overflow', '');
  } // function - ngOnDestroy

  /**
   * 위젯 수정에 대한 이벤트 핸들러
   * @param {string} widgetId
   */
  public editWidgetEventHandler(widgetId: string) {
    const widget: Widget = DashboardUtil.getWidget(this.dashboard, widgetId);
    switch (widget.type) {
      case 'page' :
        widget.dashBoard = this.dashboard;
        // (<PageWidgetConfiguration>widget.configuration).dataSource = DashboardUtil.getBoardDataSource(this.dashboard);

        const pageWidgetConf = widget.configuration as PageWidgetConfiguration;
        if (pageWidgetConf.filters) {
          pageWidgetConf.filters.forEach(filter => {
            if (!filter['clzField']) {
              filter['clzField'] = DashboardUtil.getFieldByName(this.dashboard, filter.dataSource, filter.field);
            }
          });
        }

        this.selectedPageWidget = widget as PageWidget;
        this.isShowPage = true;
        break;
      case 'filter' :
        const filterWidgetConf: FilterWidgetConfiguration = widget.configuration as FilterWidgetConfiguration;
        this.openUpdateFilterPopup(filterWidgetConf.filter);
        break;
      case 'text' :
        this.openTextWidgetEditor(widget as TextWidget);
        break;
    }
  } // function - editWidgetEventHandler

  /**
   * Layout 초기 로딩 완료 이벤트 핸들러
   */
  public onLayoutInitialised() {
    this.changeDetect.detectChanges();
  } // function - onLayoutInitialised

  /**
   * unload 전 실행
   */
  public execBeforeUnload(): boolean {
    let orgInfo: Dashboard = _.cloneDeep(this.orgBoardInfo);
    let currInfo: Dashboard = _.cloneDeep(this.dashboard);

    const removeKeys: string[] = ['createdBy', 'createdTime', 'dataSources', 'modifiedBy', 'modifiedTime', '_links', 'workBook'];
    removeKeys.forEach(key => {
      delete orgInfo[key];
      delete currInfo[key];
    });
    const convertSpec = item => {
      if ('page' === item.type) {
        // 스펙 변경
        item.configuration = DashboardUtil.convertPageWidgetSpecToServer(item.configuration);
      } else if ('filter' === item.type) {
        item.configuration['filter'] = FilterUtil.convertToServerSpecForDashboard(item.configuration['filter']);
      }
      delete item['dashBoard'];
      return item;
    };
    orgInfo.widgets = orgInfo.widgets.map(convertSpec);
    currInfo.widgets = currInfo.widgets.map(convertSpec);
    orgInfo = this.dashboardService.convertSpecToServer(orgInfo);
    currInfo = this.dashboardService.convertSpecToServer(currInfo);

    this.useUnloadConfirm = (JSON.stringify(orgInfo) !== JSON.stringify(currInfo));

    return this.useUnloadConfirm;
  } // function - execBeforeUnload

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Common
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차트 위젯을 추가함
   */
  public addChart() {
    this.selectedRightTab = RightTab.CHART;
    this.safelyDetectChanges();
    this.selectedPageWidget = this.getNewPageWidget();
    this.isShowPage = true;
  } // function - addChart

  /**
   * 텍스트 위젯 에디터를 표시함
   * @param {TextWidget} widget
   */
  public openTextWidgetEditor(widget?: TextWidget) {
    this.selectedRightTab = RightTab.TEXT;
    this.safelyDetectChanges();
    if (widget) {
      this._textWidgetsPanelComp.modifyWidget(widget);
    } else {
      this._textWidgetsPanelComp.addWidget();
    }
  } // function - openTextWidgetEditor

  /**
   * 필터 편집 팝업 오픈
   * @param {Filter} filter
   */
  public openUpdateFilterPopup(filter?: Filter) {
    this.selectedRightTab = RightTab.FILTER;
    this.safelyDetectChanges();
    this._configFilterComp.open(this.dashboard, this.chartFilters, filter);
  } // function - openUpdateFilterPopup

  /**
   * 텍스트 위젯을 설정함
   * @param {any} event
   */
  public setTextWidget(event: { name: string, widget: TextWidget }) {
    if ('CREATE' === event.name) {
      this.showBoardLoading();
      this.widgetService.createWidget(event.widget, this.dashboard.id).then(result => {
        const textWidget: TextWidget = _.merge(event.widget, result);
        this.dashboard = this._addWidget(this.dashboard, textWidget, this.isAppendLayout);
        this.dashboard.updateId = CommonUtil.getUUID();
        this.renderLayout();
        this.hideBoardLoading();
        this.isAppendLayout = false;
        this.safelyDetectChanges();
      });
    } else if ('DELETE' === event.name) {
      this.isAppendLayout = false;
      const modal = new Modal();
      modal.name = this.translateService.instant('msg.comm.ui.del.description');
      modal.btnName = this.translateService.instant('msg.comm.btn.del');
      modal.data = {type: 'removeTextWidget'};
      modal.afterConfirm = () => {
        this.deleteWidgetIds.push(event.widget.id);  // 삭제 위젯 등록
        this.removeWidget(event.widget.id);          // 대시보드상의 위젯 제거
        this.dashboard.updateId = CommonUtil.getUUID();
        this.safelyDetectChanges();
      };
      CommonUtil.confirm(modal);
    } else {
      this.isAppendLayout = false;
      const textWidget: TextWidget = event.widget as TextWidget;
      this.dashboard = DashboardUtil.updateWidget(this.dashboard, textWidget);
      this.reloadWidget(textWidget);
      this.renderLayout();
    }

  } // function - setTextWidget

  /**
   * 위젯 삭제
   * @param {string} widgetId
   */
  public removeWidget(widgetId: string) {
    this.removeWidgetComponent(widgetId);
    this.dashboard = DashboardUtil.removeWidget(this.dashboard, widgetId);
  } // function - removeWidget

  /**
   * 초기 차트 추가 ( 위젯정보가 없을 시 )
   */
  public getNewPageWidget(): PageWidget {
    const pageWidget: PageWidget = new PageWidget();
    const board: Dashboard = this.dashboard;
    pageWidget.dashBoard = board;
    (pageWidget.configuration as PageWidgetConfiguration).dataSource = DashboardUtil.getFirstBoardDataSource(board);
    (pageWidget.configuration as PageWidgetConfiguration).customFields = board.configuration.customFields;
    return pageWidget;
  } // function - addChart

  /**
   * 신규 페이지 위젯을 생성한다.
   * @param {PageWidget} pageWidget
   * @param {Boolean} isAppendLayout
   * @returns {PageWidget}
   */
  public createPageWidget(pageWidget: PageWidget, isAppendLayout: boolean): PageWidget {

    // Set Filter
    if (pageWidget.dashBoard.configuration
      && pageWidget.dashBoard.configuration.filters
      && pageWidget.dashBoard.configuration.filters.length > 0) {
      this.dashboard = DashboardUtil.setBoardFilters(this.dashboard, pageWidget.dashBoard.configuration.filters);
    }

    // Set CustomFields
    if (pageWidget.dashBoard && pageWidget.dashBoard.configuration) {
      this.dashboard = DashboardUtil.setCustomFields(this.dashboard, pageWidget.dashBoard.configuration.customFields);
    }

    // 위젯 목록 추가
    this.dashboard = this._addWidget(this.dashboard, pageWidget, isAppendLayout);

    return pageWidget;
  } // function - createPageWidget

  /**
   * 페이지 위젯을 수정한다.
   * @param {PageWidget} pageWidget
   * @param {boolean} isReload
   * @returns {PageWidget}
   */
  public modifyPageWidget(pageWidget: PageWidget, isReload: boolean): PageWidget {

    // Set Filter
    if (pageWidget.dashBoard.configuration
      && pageWidget.dashBoard.configuration.hasOwnProperty('filters')
      && pageWidget.dashBoard.configuration.filters.length > 0) {
      this.dashboard = DashboardUtil.setBoardFilters(this.dashboard, pageWidget.dashBoard.configuration.filters);
    }

    // Set CustomFields
    if (pageWidget.dashBoard && pageWidget.dashBoard.configuration) {
      this.dashboard = DashboardUtil.setCustomFields(this.dashboard, pageWidget.dashBoard.configuration.customFields);
    }

    this.dashboard = DashboardUtil.updateWidget(this.dashboard, pageWidget);
    if (isReload) {
      this.reloadWidget(pageWidget);
    }

    return pageWidget;
  } // function - modifyPageWidget

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Header & Right Side Layout Menu
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // noinspection JSMethodCanBeStatic

  /**
   * 대시보드를 변경한다.
   * @param {Dashboard} dashboardItem
   */
  public moveOrNewDashboard(dashboardItem?: Dashboard) {
    this.execBeforeUnload();
    if (this.useUnloadConfirm) {
      const modal = new Modal();
      modal.name = this.translateService.instant('msg.board.alert.title.change');
      modal.description = this.translateService.instant('msg.board.alert.desc.move');
      modal.btnName = this.translateService.instant('msg.comm.btn.mov');
      modal.data = {type: 'changeDashboard'};
      modal.afterConfirm = () => {
        if (dashboardItem) {
          this.selectedDashboard.emit(dashboardItem);
        } else {
          this.createDashboard.emit();
        }
      };
      CommonUtil.confirm(modal);
    } else {
      if (dashboardItem) {
        this.selectedDashboard.emit(dashboardItem);
      } else {
        this.createDashboard.emit();
      }
    }
  } // function - moveOrNewDashboard

  /**
   * RNB 메뉴 토글
   * @param {RightTab} menu
   */
  public toggleRnb(menu: RightTab) {
    // 드래그 소스가 중첩되서 생성되는 것을 방지하기 위해서
    // 기존 드래그소스를 제거한다
    this.destroyDragSources();

    // 메뉴 선택
    if (menu === this.selectedRightTab) {
      this.selectedRightTab = RightTab.NONE;
    } else {
      this.selectedRightTab = menu;
    }

    // 레이아웃 변경 적용
    this.updateLayoutSize();
  } // function - toggleRnb

  /**
   * 대시보드 변경사항 저장
   */
  public updateDashboard() {

    // 로딩 show
    this.showBoardLoading();

    // 대시보드 모든 위젯 업데이트
    const promises = [];

    // 위젯 등록/수정
    DashboardUtil.getWidgets(this.dashboard).forEach((result: Widget) => {

      if (-1 === this.deleteWidgetIds.indexOf(result.id)) {
        const param = {configuration: _.cloneDeep(result.configuration), name: result.name};
        if ('page' === result.type) {
          if (-1 < this._removeDsEngineNames.indexOf(param.configuration['dataSource']['engineName'])) {
            this._removeWidgetRelation(result.id, this.dashboard.configuration.relations);
            this.deleteWidgetIds.push(result.id);     // 삭제 위젯 등록
            this.removeWidgetComponent(result.id);    // 대시보드상의 위젯 제거
          } else {
            // 스펙 변경
            param.configuration = DashboardUtil.convertPageWidgetSpecToServer(param.configuration);
            promises.push(() => this.widgetService.updateWidget(result.id, param));   // update widget
          }
        } else if ('filter' === result.type) {
          if (-1 < this._removeDsEngineNames.indexOf(param.configuration['filter']['dataSource'])) {
            this._removeWidgetRelation(result.id, this.dashboard.configuration.filterRelations, this.dashboard);
            this.deleteWidgetIds.push(result.id);
            this.removeWidgetComponent(result.id);    // 대시보드상의 위젯 제거
          } else {
            promises.push(() => this.widgetService.updateWidget(result.id, param));   // update widget
          }
        } else if ('text' === result.type) {
          promises.push(() => this.widgetService.updateWidget(result.id, param));   // update widget
        }
      }

    });

    // 삭제 위젯 체크 - Start
    if (this.deleteWidgetIds.length > 0) {
      this.deleteWidgetIds.forEach(id => promises.push(() => this.widgetService.deleteWidget(id)));
    } // if - deleteWidgetIds
    // 삭제 위젯 체크 - End

    const cntWidgetComps: number = this.getWidgetComps().length;

    // 이미지 저장을 위해 화면을 임시적으로 채운다.
    (0 < cntWidgetComps) && (this.resizeToFitScreenForSave());

    // 위젯 업데이트 후 작동
    if (0 < promises.length) {
      CommonUtil.waterfallPromise(promises).then(() => {

        if (0 < cntWidgetComps) {
          // 이미지 업로드 - 임시적으로 채운 화면인 인식되기 위해
          this._uploadDashboardImage(this.dashboard)
            .then(result => this._callUpdateDashboardService(result['imageUrl']))
            .catch(() => this._callUpdateDashboardService(null));
        } else {
          this._callUpdateDashboardService(null);
        }

      }).catch((error) => {
        console.error(error);
        Alert.error(this.translateService.instant('msg.board.alert.widget.apply.error'));
        this.hideBoardLoading();     // 로딩 hide
      });
    } else {
      if (0 < cntWidgetComps) {
        // 이미지 업로드 - 임시적으로 채운 화면인 인식되기 위해
        this._uploadDashboardImage(this.dashboard)
          .then(result => this._callUpdateDashboardService(result['imageUrl']))
          .catch(() => this._callUpdateDashboardService(null));
      } else {
        this._callUpdateDashboardService(null);
      }
    }

  } // function - updateDashboard

  /**
   * 대시보드 변경취소
   */
  public openDismissConfirm() {
    this.execBeforeUnload();
    if (this.useUnloadConfirm) {
      const modal = new Modal();
      modal.name = this.translateService.instant('msg.board.alert.title.change');
      modal.description = this.translateService.instant('msg.board.alert.desc.exit');
      modal.btnName = this.translateService.instant('msg.comm.btn.exit');
      modal.data = {type: 'dismiss'};
      modal.afterConfirm = () => {
        this.changeMode.emit('VIEW');   // 대시보드 변경취소
      };
      CommonUtil.confirm(modal);
    } else {
      this.changeMode.emit('VIEW');    // 대시보드 변경취소
    }
  } // function - openDismissConfirm

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Panels
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 데이터 소스 패널 표시 상태를 변경한다.
   */
  public toggleDatasourcePanel() {
    if (RightTab.NONE === this.selectedRightTab) {
      this.toggleRnb(RightTab.CHART);
      this.changeDetect.detectChanges();
    }
    this.datasourcePanelComp.toggleDatasourcePanel();
  } // function - toggleDatasourcePanel

  /**
   * 데이터소스 변경 종료
   */
  public closeUpdateDataSource() {
    this.isUpdateDataSource = false;
  } // function - closeUpdateDataSource



  /**
   * 대시보드의 데이터소스 변경
   * @param {Dashboard} dashboard
   */
  public changeDataSource(dashboard: Dashboard) {
    this.dashboard = dashboard;

    // 없어진 데이터소스에 대한 필터 제거
    this.dashboard.configuration.filters =
      _.cloneDeep(this.dashboard.configuration.filters).filter(filter => {
        if (dashboard.dataSources.some(ds => ds.engineName === filter.dataSource)) {
          return true;
        } else {
          const filterWidget: FilterWidget = DashboardUtil.getFilterWidgetByFilter(dashboard, filter);
          if (filterWidget) {
            this.deleteWidgetIds.push(filterWidget.id);  // 삭제 위젯 등록
            this.removeWidget(filterWidget.id);          // 대시보드상의 위젯 제거
          }
          return false;
        }
      });

    // 없어진 데이터소스에 대한 차트 제거
    _.cloneDeep(this.dashboard.widgets).forEach(widget => {
      if ('page' !== widget.type) {
        return true;
      } else {
        const pageConf: PageWidgetConfiguration = widget.configuration as PageWidgetConfiguration;
        if (dashboard.dataSources.some(ds => DashboardUtil.isSameDataSource(pageConf.dataSource, ds))) {
          return true;
        } else {
          this._removeWidgetRelation(widget.id, this.dashboard.configuration.relations);
          this.deleteWidgetIds.push(widget.id);  // 삭제 위젯 등록
          this.removeWidget(widget.id);          // 대시보드상의 위젯 제거
          return false;
        }
      }
    });

    this.dashboard.configuration.fields = [];

    this._runDashboard(this.dashboard);

    this.isChangeDataSource = true;
    this.isUpdateDataSource = false;
  } // function - changeDataSource

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Page Widget Panel
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 페이지 연관관계 설정 팝업 오픈
   * @param {string} type
   */
  public showSetPageRelation(type: string) {
    if ('filter' === type) {
      this.hierarchyType = 'filter';
      this.safelyDetectChanges();
      this._pageRelationComp.run({
        nodes: this.dashboard.configuration.filterRelations,
        widgets: DashboardUtil.getFilterWidgets(this.dashboard),
        title: 'Set filter hierarchy', description: 'This is description'
      });
    } else {
      this.hierarchyType = 'page';
      this.safelyDetectChanges();
      this._pageRelationComp.run({
        nodes: this.dashboard.configuration.relations,
        widgets: DashboardUtil.getPageWidgets(this.dashboard)
      });
    }

  } // function - showSetPageRelation

  /**
   * 위젯 연관관계 변경 이벤트 핸들러
   * @param data
   */
  public changeWidgetRelation(data: { relations: DashboardWidgetRelation[], type: string }) {
    if (data.relations) {
      this.destroyDragSources();

      if (data.type === 'page') {
        this.dashboard.configuration.relations = data.relations;
      } else {
        // dragSource 를 재설정하기 위해서는 List 전체 초기화가 이루어져야 함
        this.dashboard.configuration.filterRelations = [];
        this.defaultFilterListInPanel = this._getDefaultFilterListInPanel();
        this.generalFilterListInPanel = this._getGeneralFilterListInPanel();
        this.safelyDetectChanges();
        this.dashboard.configuration.filterRelations = data.relations;
        this._generateFilterRelationMap(this.dashboard);
        this.defaultFilterListInPanel = this._getDefaultFilterListInPanel();
        this.generalFilterListInPanel = this._getGeneralFilterListInPanel();
      }

      this.refreshLayout();
    }
  } // function - changeWidgetRelation

  /**
   * 위젯의 타입을 얻는다. Page 위젯일 경우에는 차트에 대한 타입을 얻는다.
   * @param {string} widgetId
   * @returns {string}
   */
  public getWidgetType(widgetId: string): string {
    const widget = DashboardUtil.getWidget(this.dashboard, widgetId);
    if (widget) {
      let strType: string = widget.type;
      if ('page' === widget.type) {
        strType = (widget.configuration as PageWidgetConfiguration).chart.type.toString();
      }
      return strType;
    } else {
      return '';
    }
  } // function - getWidgetType

  /**
   * 페이지 위젯 드래그 설정
   * @param {ElementRef} elm : 대상 ElementRef
   * @param {string} widgetId : 위젯 아이디
   */
  public setDragWidget(elm: ElementRef, widgetId: string) {
    const widgetInfo: Widget = DashboardUtil.getWidget(this.dashboard, widgetId);
    if (widgetInfo) {
      this.setDragSource(elm.nativeElement, widgetInfo);
    }
  } // function - setDragWidget

  /**
   * 차트 삭제 등록
   * @param {string} widgetId
   */
  public setRemoveChart(widgetId: string) {
    if (this._isLeafWidgetRelation(widgetId, this.dashboard.configuration.relations)) {
      const modal = new Modal();
      modal.name = this.translateService.instant('msg.comm.ui.del.description');
      modal.btnName = this.translateService.instant('msg.comm.btn.del');
      modal.data = {type: 'removePageWidget'};
      modal.afterConfirm = () => {
        // 연관관계 정보 삭제 및 relation 정보 갱신
        this._removeWidgetRelation(widgetId, this.dashboard.configuration.relations);
        this.deleteWidgetIds.push(widgetId);  // 삭제 위젯 등록
        this.removeWidget(widgetId);          // 대시보드상의 위젯 제거

        this.dashboard.updateId = CommonUtil.getUUID();
        this.safelyDetectChanges();
      };
      CommonUtil.confirm(modal);
    } else {
      Alert.warning(this.translateService.instant('msg.board.alert.remove-not-parent'));
    }
  } // function - setRemoveChart

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Page Widget
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 페이지 화면에서 필드 Alias 변경 이벤트 발생 시 처리
   * ( PageComponent 와 changeFieldAlias 이벤트로 연결 )
   * @param {Field} changeField
   * @param {boolean} isReload
   */
  public updateFieldAndWidgetPivot(changeField: Field, isReload: boolean = false) {
    this.dashboard = DashboardUtil.updateField(this.dashboard, changeField);
    this._changeFieldAlias(changeField, isReload);
  } // function - updateFieldAndWidgetPivot

  /**
   * 데이터필드 패털에서 필드 Alias 변경 이벤트 발생 시 처리
   * ( DatasourcePanelComponent 와 changeFieldAlias 이벤트로 연결 )
   * @param {Field} changeField
   */
  public updateFieldAndWidgetPivotAndRender(changeField: Field) {
    this.updateFieldAndWidgetPivot(changeField, true);
  } // function - updateFieldAndWidgetPivotAndRender

  /**
   * 위젯 이름 조회
   * @param {string} widgetId
   */
  public getWidgetName(widgetId: string): string {
    const widgetInfo: Widget = DashboardUtil.getWidget(this.dashboard, widgetId);
    return (widgetInfo) ? widgetInfo.name : '';
  } // function - getWidgetName

  /**
   * 차트 필드 배열 문자를 얻음
   * @param {string} widgetId
   * @returns {string}
   */
  public getChartFields(widgetId: string): string {
    const widget: Widget = DashboardUtil.getWidget(this.dashboard, widgetId);
    if (widget) {
      let arrFields: string[] = [];

      const pivot: Pivot = widget.configuration['pivot'];

      // set shelf layers (map chart)
      let shelf: any = widget.configuration['shelf'];
      const layerNum: number = widget.configuration['chart'].layerNum;
      if (shelf && undefined !== layerNum && shelf.layers[layerNum] && (shelf.layers[layerNum].length > 0 || shelf.layers[layerNum].fields.length > 0)) {

        // 기존 스펙이 남아있을경우 변환
        if (_.isUndefined(shelf.layers[layerNum].fields)) {
          const tempShelf: Shelf = new Shelf();
          for (let idx = 0; idx < shelf.layers.length; idx++) {
            const tempLayer: any = _.cloneDeep(shelf.layers[idx]);
            if (_.isUndefined(tempShelf.layers[idx])) {
              const shelfLayers: ShelfLayers = new ShelfLayers();
              tempShelf.layers.push(shelfLayers);
            }
            tempShelf.layers[idx].fields = tempLayer;
          }
          widget.configuration['shelf'] = tempShelf;
          shelf = widget.configuration['shelf'];
        }

        arrFields = arrFields.concat(shelf.layers[layerNum].fields.map(item => {
          if (item.alias) {
            return item.alias;
          } else {
            return (item.fieldAlias) ? item.fieldAlias : item.name;
          }
        }));
      } else if (pivot) {
        if (pivot.columns) {
          arrFields = arrFields.concat(pivot.columns.map(item => {
            if (item.alias) {
              return item.alias;
            } else {
              return (item.fieldAlias) ? item.fieldAlias : item.name;
            }
          }));
        }
        if (pivot.rows) {
          arrFields = arrFields.concat(pivot.rows.map(item => {
            if (item.alias) {
              return item.alias;
            } else {
              return (item.fieldAlias) ? item.fieldAlias : item.name;
            }
          }));
        }
        if (pivot.aggregations) {
          arrFields = arrFields.concat(pivot.aggregations.map(item => {
            if (item.alias) {
              return item.alias;
            } else {
              return (item.fieldAlias) ? item.fieldAlias : item.name;
            }
          }));
        }
      }
      return arrFields.join(',');
    }
  } // function - getChartFields

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Text Widget Panel
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 텍스트 위젯 드래그 설정
   * @param {any} data
   */
  public setDragTextWidget(data: { elm: ElementRef, widget: Widget }) {
    this.setDragSource(data.elm, data.widget);
  } // function - setDragTextWidget

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Filter Widget Panel
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // noinspection JSMethodCanBeStatic
  /**
   * 필터 목록의
   * @param _index
   * @param {FilterWidget} filterWidget
   * @return {string}
   */
  public filterListTrackByFn(_index, filterWidget: FilterWidget) {
    const filter: Filter = (filterWidget.configuration as FilterWidgetConfiguration).filter;
    return filter.dataSource + filter.type + filter.field;
  } // function - trackByFn

  /**
   * 필터 위젯 드래그 설정
   * @param {ElementRef} elm
   * @param {FilterWidget} item
   */
  public setDragFilterWidget(elm: ElementRef, item: FilterWidget) {
    const filter: Filter = this.getFilterForFilterWidget(item);
    if (!filter.ui.filteringSeq && !filter.ui.widgetId) {
      this.setDragSource(elm.nativeElement.querySelector('.ddp-ui-down-title2'), item);
    }
  } // function - setDragFilterWidget

  /**
   * 드래그 가능한 필터 위젯
   * @param {FilterWidget} item
   * @return {boolean}
   */
  public isDraggableFilterWidget(item: FilterWidget): boolean {
    const filter: Filter = this.getFilterForFilterWidget(item);
    (filter.ui) || (filter.ui = {});
    return !filter.ui.filteringSeq && !filter.ui.widgetId && !this.isWidgetInLayout(item.id);
  } // function - isDraggableFilterWidget

  // noinspection JSMethodCanBeStatic
  /**
   * 필터 위젯에 대한 필터 정보 조회
   * @param {FilterWidget} item
   * @return {Filter}
   */
  public getFilterForFilterWidget(item: FilterWidget): Filter {
    return (item.configuration as FilterWidgetConfiguration).filter;
  } // function - getFilterForFilterWidget

  /**
   * 필터 위젯의 관계 설정
   */
  public isPossibleSettingFilterRelation(): boolean {
    const boardConf: BoardConfiguration = this.dashboard.configuration;
    if (boardConf && boardConf.filters && 1 < boardConf.filters.length) {
      return 1 < boardConf.filters.filter(item => 'include' === item.type).length;
    } else {
      return false;
    }
  } // function - isPossibleSettingFilterRelation

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Dashboard Layout Panel
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 대시보드 레이아웃 패널의 값이 변경되었을 때의 처리
   * @param {BoardConfiguration} boardConf
   */
  public changeBoardConf(boardConf: BoardConfiguration) {
    this.refreshLayout(boardConf);
  } // function - changeBoardConf

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - Filter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 커스텀 컬럼 업데이트
   * @param data
   */
  public updateCustomField(data: any) {

    this.showBoardLoading();

    const customField: CustomField = data.customField;
    const isEdit: boolean = data.isEdit;

    // 커스텀 컬럼이
    const customFields: CustomField[] = DashboardUtil.getCustomFields(this.dashboard);

    // 수정이 아닐 경우 insert
    if (!isEdit) {
      customFields.push(customField);
    } else {
      customFields.forEach((field) => {
        if (field.name === customField.oriColumnName) {
          field.alias = customField.alias;
          field.name = customField.name;
          field.expr = customField.expr;
        }
      });
    }

    this.dashboardService.updateDashboard(
      this.dashboard.id, {configuration: DashboardUtil.getBoardConfiguration(this.dashboard)}
    ).then((result) => {
      if (result.hasOwnProperty('configuration')) {
        result = DashboardUtil.convertSpecToUI(result);
        this.dashboard = DashboardUtil.updateBoardConfiguration(this.dashboard, result.configuration);
        this.dashboard.updateId = CommonUtil.getUUID();
        this.broadCaster.broadcast('SET_CUSTOM_FIELDS', {customFields: customFields});
        if (isEdit) {
          Alert.success(this.translateService.instant('msg.board.custom.ui.update', {name: customField.name}));
        } else {
          Alert.success(this.translateService.instant('msg.board.custom.ui.create', {name: customField.name}));
        }
        this.hideBoardLoading();
      }
      this.safelyDetectChanges();
    }).catch(err => this.commonExceptionHandler(err));
  } // function - updateCustomColumn

  /**
   * 커스텀 컬럼 삭제
   * @param {CustomField} field
   */
  public deleteCustomField(field: CustomField) {
    const useChartList: string[] = [];
    const useFilterList: string[] = [];

    const widgets = DashboardUtil.getPageWidgets(this.dashboard);
    // 차트에서 사용중인지 체크
    if (widgets && widgets.length > 0) {

      widgets.forEach((widget: Widget) => {
        //  차트인 의 컬럼이 사용중일경우
        if (widget.configuration && widget.configuration.hasOwnProperty('pivot') && widget.configuration['pivot'].hasOwnProperty('columns')) {
          const colIdx = _.findIndex(widget.configuration['pivot']['columns'], {name: field.name});
          if (colIdx > -1) useChartList.push(widget.name);
        }
        //
        if (widget.configuration && widget.configuration.hasOwnProperty('pivot') && widget.configuration['pivot'].hasOwnProperty('aggregations')) {
          const aggrIdx = _.findIndex(widget.configuration['pivot']['aggregations'], {name: field.name});
          if (aggrIdx > -1) useChartList.push(widget.name);
        }
        if (widget.configuration && widget.configuration.hasOwnProperty('pivot') && widget.configuration['pivot'].hasOwnProperty('rows')) {
          const rowIdx = _.findIndex(widget.configuration['pivot']['rows'], {name: field.name});
          if (rowIdx > -1) useChartList.push(widget.name);
        }
      });
    }

    // 차트필터에서 사용중인지 체크
    let idx = _.findIndex(this.chartFilters, {field: field.name});
    if (idx > -1) useFilterList.push(this.chartFilters[idx].type + '_' + this.chartFilters[idx].field);
    // 글로벌필터에서 사용중인지 체크
    const boardFilter: Filter = DashboardUtil.getBoardFilter(this.dashboard, field.dataSource, field.name);
    (boardFilter) && (useFilterList.push(boardFilter.type + '_' + boardFilter.field));

    // 사용중인 곳이 있으면 알림 팝업
    if (useFilterList.length > 0 || useChartList.length > 0) {
      let description: string = '';
      if (useFilterList.length > 0 && useChartList.length > 0) {
        description = '\'' + useChartList.join('\' , \'') + '\',\'' + useFilterList.join('\' , \'') + '\' ' + this.translateService.instant('msg.board.ui.use.chart.filter');
      } else if (useChartList.length > 0) {
        description = '\'' + useChartList.join('\' , \'') + '\' ' + this.translateService.instant('msg.board.ui.use.chart');
      } else if (useFilterList.length > 0) {
        description = '\'' + useFilterList.join('\' , \'') + '\' ' + this.translateService.instant('msg.board.ui.use.filter');
      }

      const modal = new Modal();
      modal.name = this.translateService.instant('msg.board.ui.not.delete.custom');
      modal.description = description;
      modal.isShowCancel = false;
      modal.data = {type: 'deleteCustomField'};
      CommonUtil.confirm(modal);
      return;
    }

    // 사용중인 곳이 없다면 바로 삭제
    const customFields = DashboardUtil.getCustomFields(this.dashboard);

    idx = _.findIndex(customFields, {name: field.name});

    if (idx > -1) {
      customFields.splice(idx, 1);

      // 커스텀 필드, 필터 재설정
      this.dashboard = DashboardUtil.setCustomFields(this.dashboard, customFields);
      this.dashboard.updateId = CommonUtil.getUUID();
      this.safelyDetectChanges();

      // 페이지 위젯내 커스텀 필드 재설정
      this.broadCaster.broadcast('SET_CUSTOM_FIELDS', {customFields: customFields});

      this.hideBoardLoading();
    }
  } // function - deleteCustomField

  /**
   * 필터 변경
   * @param {Filter} filter
   * @param {boolean} _isSetPanel
   */
  public updateFilter(filter: Filter, _isSetPanel: boolean = false) {

    this.showBoardLoading();

    if (isNullOrUndefined(filter) || isNullOrUndefined(filter.type)) {
      return;
    }

    // 차트 필터에서 변경한 경우를 위해서 차트 필터에서 제거한다.
    this._changeChartFilterToGlobalFilter(filter);

    // 변경된 필터가 어떤 필터의 상위 필터인 경우 하위 필터의 값을 초기화 해준다. - S
    {
      const findRelationInfo = (targetId: string, items: DashboardWidgetRelation[], callback: (relItem: DashboardWidgetRelation) => void) => {
        return items.some((relItem: DashboardWidgetRelation) => {
          if (targetId === relItem.ref) {
            return callback(relItem);
          } else {
            if (relItem.children) {
              return findRelationInfo(targetId, relItem.children, callback);
            } else {
              return false;
            }
          }
        });
      };
      const recursiveRelation = (items: DashboardWidgetRelation[], execFunc: (rel: string) => void) => {
        return items.some((relItem: DashboardWidgetRelation) => {
          execFunc(relItem.ref);
          if (relItem.children) {
            return recursiveRelation(relItem.children, execFunc);
          } else {
            return false;
          }
        });
      };
      const filterWidget: FilterWidget = DashboardUtil.getFilterWidgetByFilter(this.dashboard, filter);
      findRelationInfo(
        filterWidget.id,
        this.dashboard.configuration.filterRelations,
        (relInfo: DashboardWidgetRelation) => {
          if (relInfo.children && 0 < relInfo.children.length) {
            recursiveRelation(relInfo.children, (widgetId: string) => {
              const childFilterWidget: FilterWidget = DashboardUtil.getWidget(this.dashboard, widgetId) as FilterWidget;
              const targetFilterConf: FilterWidgetConfiguration = childFilterWidget.configuration;
              this.dashboard.configuration.filters.find(item => {
                if (item.field === targetFilterConf.filter.field && item.dataSource === targetFilterConf.filter.dataSource) {
                  if ('include' === item.type) {
                    (item as InclusionFilter).valueList = [];
                  }
                  return true;
                }
                return false;
              });
            });
          }
        });
    }
    // 변경된 필터가 어떤 필터의 상위 필터인 경우 하위 필터의 값을 초기화 해준다. - E

    // 대시보드 필터 업데이트
    const updateResult: [Dashboard, boolean] = DashboardUtil.updateBoardFilter(this.dashboard, filter, true);
    this.dashboard = updateResult[0];

    this._organizeAllFilters(true).then(() => {
      this._syncFilterWidget();

      if (updateResult[1]) {
        // append New Filter
        this.openPanelDefaultFilter = -1;
        this.openPanelGeneralFilter = DashboardUtil.getFilterWidgets(this.dashboard).length - 1;
      }

      // 필터 패널 목록을 동기화 해준다.
      this.defaultFilterListInPanel = this._getDefaultFilterListInPanel();
      this.generalFilterListInPanel = this._getGeneralFilterListInPanel();

      this._configFilterComp.close();
      this.hideBoardLoading();
      // if (isSetPanel) {
      //   this.popupService.notiFilter({name: 'change-filter', data: filter});
      // }
      this.popupService.notiFilter({name: 'change-filter', data: filter});
      this.safelyDetectChanges();
    });

  } // function - updateFilter

  /**
   * 필터 설정 ( 설정 팝업을 통해 )
   * @param {Filter} filter
   */
  public configureFilter(filter: Filter) {

    if (DashboardUtil.isNewFilter(this.dashboard, filter)) {
      this.addFilter(filter, () => {
        this.updateFilter(filter, true);
      });
    } else {
      this.updateFilter(filter, true);
    }
  } // function - configureFilter

  /**
   * 단일 필터 추가
   * @param {Filter} filter
   * @param {Function} callback
   */
  public addFilter(filter: Filter, callback?: () => void) {
    if (!filter.ui.widgetId) {
      this.showBoardLoading();
      const newFilterWidget: FilterWidget = new FilterWidget(filter, this.dashboard);
      this.widgetService.createWidget(newFilterWidget, this.dashboard.id).then((result) => {

        // 위젯 등록
        this.dashboard = this._addWidget(this.dashboard, _.merge(newFilterWidget, result));

        // 글로벌 필터 업데이트
        filter['isNew'] = true;
        this.dashboard = DashboardUtil.addBoardFilter(this.dashboard, filter);

        (callback) && (callback());

        this.safelyDetectChanges();

        // Layout 업데이트
        this.renderLayout();

        this.dashboard.updateId = CommonUtil.getUUID();

        this.defaultFilterListInPanel = this._getDefaultFilterListInPanel();
        this.generalFilterListInPanel = this._getGeneralFilterListInPanel();

        this.hideBoardLoading();
      });
    }
  } // function - addFilter

  /**
   * 필터 삭제
   * @param {Filter} filter
   */
  public deleteFilter(filter: Filter) {
    if (filter.ui.widgetId) {
      // 차트필터 제거
      const widget: PageWidget = DashboardUtil.getWidget(this.dashboard, filter.ui.widgetId) as PageWidget;

      if (widget) {

        // 위젯에서 필터제거
        _.remove(widget.configuration.filters, {field: filter.field});

        // 차트 필터에서 필터제거
        const removeIdx: number
          = this.chartFilters.findIndex(item => item.field === filter.field && item.ui.widgetId === filter.ui.widgetId);
        this.chartFilters.splice(removeIdx, 1);

        // 위젯 필터 재설정
        this._syncFilterWidget();
        this.popupService.notiFilter({name: 'remove-filter', data: filter});
      }
    } else {

      // 필터 위젯 정보 삭제
      const filterWidget: FilterWidget = DashboardUtil.getFilterWidgetByFilter(this.dashboard, filter);
      const isLeaf: boolean = this._isLeafWidgetRelation(filterWidget.id, this.dashboard.configuration.filterRelations, this.dashboard);

      if (!isLeaf) {
        Alert.warning(this.translateService.instant('msg.board.alert.remove-not-parent-filter'));
        return;
      }

      if (filterWidget) {
        this.removeWidget(filterWidget.id);          // 대시보드상의 위젯 제거
        this._removeWidgetRelation(filterWidget.id, this.dashboard.configuration.filterRelations, this.dashboard);
        this.deleteWidgetIds.push(filterWidget.id);  // 삭제 위젯 등록
      }

      // 글로벌 필터 삭제
      this.dashboard = DashboardUtil.deleteBoardFilter(this.dashboard, filter);
      this.dashboard.updateId = CommonUtil.getUUID();

      // 패널 목록 동기화
      this.defaultFilterListInPanel = this._getDefaultFilterListInPanel();
      this.generalFilterListInPanel = this._getGeneralFilterListInPanel();

      this.safelyDetectChanges();
    }

    // 위젯 필터 재설정
    this._syncFilterWidget();
    this.popupService.notiFilter({name: 'remove-filter', data: filter});
  } // function - deleteFilter

  // noinspection JSMethodCanBeStatic
  /**
   * 필터 변경
   * @param {Field} field
   */
  public changeFilter(field: Field) {
    field.useFilter = !field.useFilter;
  } // function - changeFilter

  /**
   * 확인팝업
   * @param {Filter} filter
   */
  public openChangeFilterConfirm(filter: Filter) {
    // 차트 필터를 글로벌필터로 변경 확인
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.board.filter.alert.change.global');
    modal.description = this.translateService.instant('msg.board.filter.alert.change.global.des');
    modal.data = {filter, type: 'changeFilter'};
    CommonUtil.confirm(modal);
  } // function - openChangeFilterConfirm

  /**
   * 컴포넌트를 닫는다.
   * @param {string} target
   */
  public closeComponent(target: string) {
    switch (target) {
      case 'UPDATE-FILTER' :
        this._configFilterComp.close();
        break;
      case 'PAGE' :
        this.isShowPage = false;
        break;
    }
    this.changeDetect.detectChanges();
  } // function - closeComponent

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차트 필터를 글로벌 필터로 변경
   * @param {Filter} targetFilter
   * @private
   */
  private _changeChartFilterToGlobalFilter(targetFilter: Filter) {

    // 위젯에서 필터 제거
    DashboardUtil.getPageWidgets(this.dashboard).forEach((widget: PageWidget) => {
      if (widget.configuration.filters && widget.configuration.filters.length > 0) {
        _.remove(widget.configuration.filters, {field: targetFilter.field});
      }
    });

    // 차트필터에서 필터 제거
    _.remove(this.chartFilters, {field: targetFilter.field});

    delete targetFilter.ui.widgetId;
  } // function - _changeChartFilterToGlobalFilter

  /**
   * 변경된 위젯 정보를 바탕으로 다른 위젯의 정보 변경
   * @param {CustomField[]} customFields
   * @param {Field[]} fields
   * @param {string} changeWidgetId
   * @private
   */
  private _syncWidgetsAndFilters(customFields: CustomField[], fields: Field[], changeWidgetId: string) {

    customFields = CommonUtil.objectToArray(customFields);

    // 사용자 정의 필드를 위젯에 셋팅
    DashboardUtil.getPageWidgets(this.dashboard).forEach((widget: Widget) => {
      // 위젯 사용자 정의 필드 정보 수정
      widget.configuration['customFields'] = customFields;
      // 위젯 피봇 정보 수정
      // map chart - add shelf config
      if (ChartType.MAP === (widget.configuration as PageWidgetConfiguration).chart.type) {
        widget.configuration['shelf'] = this._syncCustomFieldInWidgetShelf(widget, customFields);
        widget.configuration['shelf'] = this._syncDatasourceAliasInWidgetPivot(widget, fields);
      } else {
        widget.configuration['pivot'] = this._syncCustomFieldInWidgetPivot(widget, customFields);
        widget.configuration['pivot'] = this._syncDatasourceAliasInWidgetPivot(widget, fields);
      }
      if (this.getWidgetComp(widget.id)) {
        this.broadCaster.broadcast('SET_WIDGET_CONFIG', {
          widgetId: widget.id,
          config: widget.configuration
        });
      }
    });
    this._organizeAllFilters(true).then(() => {
      this._syncFilterWidget(changeWidgetId);
    });

  } // function - _syncWidgetsAndFilters

  /**
   * 필드 Alias 변경 처리
   * @param {Field} changeField
   * @param {boolean} isReload
   * @private
   */
  private _changeFieldAlias(changeField: Field, isReload: boolean = false) {
    DashboardUtil.getPageWidgets(this.dashboard).forEach((widget: Widget) => {
      // 위젯 피봇 정보 수정
      // map chart - add shelf config
      if (ChartType.MAP === (widget.configuration as PageWidgetConfiguration).chart.type) {
        widget.configuration['shelf'] = this._syncDatasourceAliasInWidgetPivot(widget, [changeField]);
      } else {
        widget.configuration['pivot'] = this._syncDatasourceAliasInWidgetPivot(widget, [changeField]);
      }

      if (this.getWidgetComp(widget.id)) {
        this.broadCaster.broadcast('SET_WIDGET_CONFIG', {
          widgetId: widget.id,
          config: widget.configuration,
          refresh: isReload
        });
      }
    });
  } // function - _changeFieldAlias

  /**
   * 패널 내 기본 필터 목록 ( 추천 / 필수 )
   */
  private _getDefaultFilterListInPanel() {
    return this.dashboard.configuration.filters.filter(item => 0 < item.ui.filteringSeq);
  } // function - _getDefaultFilterListInPanel


  /**
   * 패널 내 일반 필터 목록
   */
  private _getGeneralFilterListInPanel() {
    let filterList: FilterWidget[];
    if (this.dashboard.configuration && this.dashboard.configuration.filterRelations) {
      const filterRel: DashboardWidgetRelation[] = this.dashboard.configuration.filterRelations;

      const recurrsiveRelation = (items: DashboardWidgetRelation[], hierarchy: { node: string, parent: string }[] = [], parentId: string) => {
        items.forEach((relItem: DashboardWidgetRelation) => {
          hierarchy.push({
            node: relItem.ref,
            parent: parentId
          });
          if (relItem.children && 0 < relItem.children.length) {
            hierarchy = recurrsiveRelation(relItem.children, [].concat(hierarchy), relItem.ref);
          }
        });
        return hierarchy;
      };

      filterList = recurrsiveRelation(filterRel, [], '').map(hierarchyItem => {
        const filterWidget: FilterWidget = DashboardUtil.getWidget(this.dashboard, hierarchyItem.node) as FilterWidget;
        if (filterWidget) {
          filterWidget.parent = DashboardUtil.getWidget(this.dashboard, hierarchyItem.parent) as FilterWidget;
        }
        return filterWidget;
      }).filter(item => !!item);
    } else {
      filterList = DashboardUtil.getBoardFilters(this.dashboard)
        .map(filter => DashboardUtil.getFilterWidgetByFilter(this.dashboard, filter));
    }
    return filterList.filter(filter => isObject(filter));
  } // function - _getGeneralFilterListInPanel

  /**
   * 위젯 피봇 / shelf 내 별칭 정보 동기화
   * @param {Widget} widget
   * @param {Field[]} fields
   * @private
   */
  private _syncDatasourceAliasInWidgetPivot(widget: Widget, fields: Field[]) {
    const widgetConfig = widget.configuration as PageWidgetConfiguration;

    // map chart - add shelf config
    const mapFl = (ChartType.MAP === widgetConfig.chart.type);

    if (fields) {
      fields.filter(field => field.nameAlias).forEach((field: Field) => {

        // when it's map, set shelf alias
        if (mapFl) {
          PageComponent.updateShelfAliasFromField(widgetConfig.shelf, field, (widgetConfig.chart as UIMapOption).layerNum);
        } else {
          PageComponent.updatePivotAliasFromField(widgetConfig.pivot, field);
        }
      });
    }
    return mapFl ? widgetConfig.shelf : widgetConfig.pivot;
  } // function - _syncDatasourceAliasInWidgetPivot

  /**
   * 위젯 피봇 내 커스텀 필드 정보 동기화
   * @param {Widget} widget
   * @param {CustomField[]} customFields
   * @return {Pivot}
   * @private
   */
  private _syncCustomFieldInWidgetPivot(widget: Widget, customFields: CustomField[]): Pivot {
    const pivot: Pivot = widget.configuration['pivot'];
    if (customFields) {
      customFields.forEach((field: CustomField) => {
        if (FieldRole.DIMENSION === field.role) {
          pivot.columns.some(col => {
            if (col.name === field['oriColumnName']) {
              col.field = _.merge(col.field, field);
              col['expr'] = field['expr'];
              col['name'] = field['name'];
              return true;
            }
          });
          pivot.rows.some(row => {
            if (row.name === field['oriColumnName']) {
              row.field = _.merge(row.field, field);
              row['expr'] = field['expr'];
              row['name'] = field['name'];
              return true;
            }
          });
        } else if (FieldRole.MEASURE === field.role) {
          const customFieldPivotIdxs: number[] = [];
          pivot.aggregations.forEach((agg, idx: number) => {
            if (agg.name === field['oriColumnName']) {
              customFieldPivotIdxs.push(idx);
            }
          });
          if (1 < customFieldPivotIdxs.length) {
            customFieldPivotIdxs.splice(0, 1);
            customFieldPivotIdxs.reverse().forEach(idx => {
              pivot.aggregations.splice(idx, 1);
            });
          }
          pivot.aggregations.forEach(agg => {
            if (agg.name === field['oriColumnName']) {
              agg.field = _.merge(agg.field, field);
              agg['expr'] = field['expr'];
              agg['name'] = field['name'];
              agg['aggregated'] = field['aggregated'];
              agg['aggregationType'] = (field['aggregated']) ? null : 'SUM';
              return true;
            }
          });
        }
      });
    }
    return pivot;
  } // function - _syncCustomFieldInWidgetPivot

  /**
   * 위젯 shelf 내 커스텀 필드 정보 동기화 (map chart - add shelf config)
   * @param {Widget} widget
   * @param {CustomField[]} customFields
   * @return {Pivot}
   * @private
   */
  private _syncCustomFieldInWidgetShelf(widget: Widget, customFields: CustomField[]): Shelf {

    const layerNum = ((widget.configuration as PageWidgetConfiguration).chart as UIMapOption).layerNum;
    const shelf: Shelf = (widget.configuration as PageWidgetConfiguration).shelf;
    if (customFields) {
      customFields.forEach((field: CustomField) => {
        if (FieldRole.DIMENSION === field.role) {
          shelf.layers[layerNum].fields.some(layer => {
            if (layer.name === field['oriColumnName']) {
              layer.field = _.merge(layer.field, field);
              layer['expr'] = field['expr'];
              layer['name'] = field['name'];
              return true;
            }
          });
        } else if (FieldRole.MEASURE === field.role) {
          const customFieldPivotIdxs: number[] = [];
          shelf.layers[layerNum].fields.forEach((agg, idx: number) => {
            if (agg.name === field['oriColumnName']) {
              customFieldPivotIdxs.push(idx);
            }
          });
          if (1 < customFieldPivotIdxs.length) {
            customFieldPivotIdxs.splice(0, 1);
            customFieldPivotIdxs.reverse().forEach(idx => {
              shelf.layers[layerNum].fields.splice(idx, 1);
            });
          }
          shelf.layers[layerNum].fields.forEach(agg => {
            if (agg.name === field['oriColumnName']) {
              agg.field = _.merge(agg.field, field);
              agg['expr'] = field['expr'];
              agg['name'] = field['name'];
              agg['aggregated'] = field['aggregated'];
              agg['aggregationType'] = (field['aggregated']) ? null : 'SUM';
              return true;
            }
          });
        }
      });
    }
    return shelf;
  } // function - _syncCustomFieldInWidgetShelf

  /**
   * 화면 정보 초기화
   * @private
   */
  private _initViewPage() {

    this.showBoardLoading();

    this.useUnloadConfirm = false;

    // 대시보드 설정
    {
      const boardInfo = this.dashboard;
      // Linked Datasource 인지 그리고 데이터소스가 적재되었는지 여부를 판단함
      const mainDsList: Datasource[] = DashboardUtil.getMainDataSources(boardInfo);

      if (0 < mainDsList.length) {
        const linkedDsList: Datasource[] = mainDsList.filter(item => item.connType === ConnectionType.LINK);

        if (linkedDsList && 0 < linkedDsList.length) {
          // Multi Datasource Dashboard
          this.showBoardLoading();

          const promises = [];

          linkedDsList.forEach(dsInfo => {
            promises.push(new Promise<any>((res, rej) => {
              const boardDsInfo: BoardDataSource = DashboardUtil.getBoardDataSourceFromDataSource(boardInfo, dsInfo);
              this.datasourceService.getDatasourceDetail(boardDsInfo['temporaryId']).then((ds: Datasource) => {
                boardDsInfo.metaDataSource = ds;
                if (boardInfo.configuration.filters) {
                  boardInfo.configuration.filters = ds.temporary.filters.concat(boardInfo.configuration.filters);
                } else {
                  boardInfo.configuration.filters = ds.temporary.filters;
                }

                res(null);
              }).catch(err => rej(err));
            }));
          });

          Promise.all(promises).then(() => {
            this._runDashboard(boardInfo, true);
            this.safelyDetectChanges();
          }).catch((error) => {
            this.commonExceptionHandler(error);
            this.hideBoardLoading();
          });

        } else {
          this.showBoardLoading();
          this._runDashboard(boardInfo, true);
        }

      } else {
        this.hideBoardLoading();
      }
    }

  } // function - _initViewPage

  /**
   * 대시보드 실행 ( 초기설정 시작 )
   * @param {Dashboard} boardInfo
   * @param {boolean} setInitialBoard
   * @private
   */
  private _runDashboard(boardInfo: Dashboard, setInitialBoard: boolean = false) {

    this.initializeDashboard(boardInfo, LayoutMode.EDIT).then((dashboard) => {

      // 시작시 초기 작업 실행
      if ('NEW' === this.startupCmd.cmd) {
        this.isAppendLayout = true;
        switch (this.startupCmd.type) {
          case 'CHART' :
            this.addChart();
            break;
          case 'TEXT' :
            this.openTextWidgetEditor();
            break;
          case 'FILTER' :
            this.openUpdateFilterPopup();
            break;
        }
      } else if ('MODIFY' === this.startupCmd.cmd) {
        this.editWidgetEventHandler(this.startupCmd.id);
      }

      // 필터 셋팅
      this._organizeAllFilters().then(() => {
        (setInitialBoard) && (this.orgBoardInfo = _.cloneDeep(dashboard));
        this.defaultFilterListInPanel = this._getDefaultFilterListInPanel();
        this.generalFilterListInPanel = this._getGeneralFilterListInPanel();

        this.hideBoardLoading();
        this.changeDetect.detectChanges();
      });

    }).catch((error) => {
      console.error(error);
      this.hideBoardLoading();
    });
  } // function - _runDashboard

  /**
   * 이미지 업로드
   * @param {Dashboard} dashboard
   * @returns {Promise<any>}
   * @private
   */
  private _uploadDashboardImage(dashboard: Dashboard) {
    return new Promise<any>((resolve, reject) => {
      const chart = this.$element.find('.ddp-ui-boardedit');    // chart element 설정

      if (0 < chart.length) {
        this.imageService.getBlob(chart).then(blobData => {
          this.imageService.uploadImage(dashboard.name, blobData, dashboard.id, 'page', 250).then((response) => {
            resolve(response);
          }).catch((err) => {
            console.log(err);
            reject(err);
          });
        }).catch((err) => this.commonExceptionHandler(err));

      } else {  // chart가 undefined인 경우
        (reject('not found chart'));
      }
    });
  } // function - _uploadDashboardImage

  /**
   * 대시보드 변경 서비스를 호출한다.
   * @param imageUrl
   * @private
   */
  private _callUpdateDashboardService(imageUrl) {

    // params
    const param: any = {configuration: DashboardUtil.getBoardConfiguration(this.dashboard)};
    param.imageUrl = imageUrl;

    this.showBoardLoading();

    const boardId: string = this.dashboard.id;

    // 대시보드 업데이트
    this.dashboardService.updateDashboard(boardId, param).then(() => {
      const boardDs: BoardDataSource = DashboardUtil.getBoardDataSource(this.dashboard);
      const dsList: BoardDataSource[] = ('multi' === boardDs.type) ? boardDs.dataSources : [boardDs];
      if (this.isChangeDataSource) {
        this.dashboardService.connectDashboardAndDataSource(this.dashboard.id, dsList).then(() => {
          this.dashboardService.getDashboard(boardId).then((result: Dashboard) => {
            this.hideBoardLoading();                   // 로딩 hide
            result.workBook = this.workbook;
            this.updateComplete.emit(result);     // 대시보드 정보 전달
          }).catch(() => {
            // 로딩 hide
            this.hideBoardLoading();    // 로딩 hide
          });
        });
      } else {
        this.dashboardService.getDashboard(boardId).then((result: Dashboard) => {
          this.hideBoardLoading();                   // 로딩 hide
          result.workBook = this.workbook;
          this.updateComplete.emit(result);     // 대시보드 정보 전달
        }).catch(() => {
          // 로딩 hide
          this.hideBoardLoading();    // 로딩 hide
        });
      }
    }).catch(() => {
      Alert.error(this.translateService.instant('msg.board.alert.update.board.error'));
      this.hideBoardLoading();    // 로딩 hide
    });
  } // function - _callUpdateDashboardService

  /**
   * Synchronize filter and filter widget - Delete filter widget when deleting filter
   * @param {string} excludeWidgetId
   * @private
   */
  private _syncFilterWidget(excludeWidgetId?: string) {

    const boardFilters: Filter[] = DashboardUtil.getBoardFilters(this.dashboard);
    // Compares the filter widget with the filter information and deletes it for widgets that do not have filter information.
    this.getWidgetComps().forEach((widgetComp) => {
      if (widgetComp.isFilterWidget) {
        const filterWidget: FilterWidget = widgetComp.getWidget() as FilterWidget;
        const filter = boardFilters.find(item => DashboardUtil.isSameFilterAndWidget(this.dashboard, item, filterWidget));

        if (filter) {
          filterWidget.configuration.filter = filter;
          this.dashboard = DashboardUtil.updateWidget(this.dashboard, filterWidget);
          this.broadCaster.broadcast('SET_WIDGET_CONFIG', {
            widgetId: filterWidget.id,
            config: filterWidget.configuration
          });
        } else {
          this.removeWidget(widgetComp.getWidgetId());
        }
      }
    });

    const boardCastData = {filters: boardFilters};
    (excludeWidgetId) && (boardCastData['excludeWidgetId'] = excludeWidgetId);
    this.broadCaster.broadcast('SET_GLOBAL_FILTER', boardCastData);

  } // function - syncFilterWidget

  /**
   * 전체 필터 정리
   * @param {boolean} isReloadWidget
   */
  private _organizeAllFilters(isReloadWidget?: boolean): Promise<any> {
    return new Promise<any>((res1) => {

      // 글로벌 필터 설정
      this.initializeBoardFilters(this.dashboard);

      // 차트 필터 설정
      this.chartFilters = [];
      DashboardUtil.getPageWidgets(this.dashboard).forEach((widget) => {
        if (widget.type === 'page') {
          if (widget.configuration.hasOwnProperty('filters') && widget.configuration['filters'].length > 0) {
            widget.configuration['filters'].forEach((filter: Filter) => {
              (filter.ui) || (filter.ui = {});
              filter.ui.widgetId = widget.id;
              this.chartFilters.push(filter);
            });
          }
        }
      });

      // 필터 위젯 등록
      const filters: Filter[] = DashboardUtil.getBoardFilters(this.dashboard);

      if (filters) {
        const promises = [];
        filters.forEach(filter => {
          try {
            const filterWidget = DashboardUtil.getFilterWidgetByFilter(this.dashboard, filter);
            if (filterWidget) {
              promises.push(new Promise((res2) => {
                // 변경 사항 업데이트
                filterWidget.dashBoard = this.dashboard;
                filterWidget.configuration = new FilterWidgetConfiguration(filter);
                if (isReloadWidget && null !== this.getWidgetComp(filterWidget.id)) {
                  this.reloadWidget(filterWidget);
                }
                res2(null);
              }));
            } else {
              promises.push(new Promise((res2) => {
                const newFilterWidget: FilterWidget = new FilterWidget(filter, this.dashboard);
                this.widgetService.createWidget(newFilterWidget, this.dashboard.id).then((result) => {
                  // 위젯 등록
                  this.dashboard = this._addWidget(this.dashboard, _.merge(newFilterWidget, result));
                  res2(null);
                });
              }));
            }
          } catch (err) {
            console.error(err);
          }
        });

        // 필터에 등록되지 않은 위젯 삭제
        DashboardUtil.getWidgets(this.dashboard).forEach(widget => {
          if ('filter' === widget.type
            && !DashboardUtil.getBoardFilters(this.dashboard).find(filter => DashboardUtil.isSameFilterAndWidget(this.dashboard, filter, widget))) {
            promises.push(new Promise((res2) => {
              this.widgetService.deleteWidget(widget.id).then(() => {
                this.removeWidget(widget.id);
                res2(null);
              });
            }));
          }
        });

        Promise.all(promises).then(() => {
          res1(null);
        }).catch(() => this.hideBoardLoading());
      }
    });
  } // function - _organizeAllFilters

}

enum RightTab {
  CHART = 'CHART',
  TEXT = 'TEXT',
  FILTER = 'FILTER',
  LAYOUT = 'LAYOUT',
  NONE = 'NONE'
}
