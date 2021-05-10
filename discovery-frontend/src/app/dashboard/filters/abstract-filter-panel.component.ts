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
  AfterViewInit,
  ElementRef,
  EventEmitter,
  Injector,
  Input, OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import {Filter} from '@domain/workbook/configurations/filter/filter';
import {Dashboard} from '@domain/dashboard/dashboard';
import {ConnectionType, Datasource, Field} from '@domain/datasource/datasource';
import {DashboardUtil} from '../util/dashboard.util';
import {FilterUtil} from '../util/filter.util';
import {FilterWidget, FilterWidgetConfiguration} from '@domain/dashboard/widget/filter-widget';
import {AbstractDashboardComponent} from '../abstract.dashboard.component';

export abstract class AbstractFilterPanelComponent<T extends Filter> extends AbstractDashboardComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 필터
  public filter: T;
  public originalFilter: T;
  public filterWidget: FilterWidget;
  public parentWidget: FilterWidget;

  // 상세 메뉴
  public field: Field;
  public dataSource: Datasource;
  public isShowDetailMenu: boolean = false;
  public isShowFilter: boolean = false;
  public isBoardFilter: boolean = true;
  public isNewFilter: boolean = false;

  // 기능 버튼 활성화 여부
  public isDeletable: boolean = false;
  public isEditable: boolean = false;

  // 대시보드 필터 목록
  public boardFilters: Filter[];

  @Input('filter')
  public set setOriginalFilter(filter: Filter) {
    if (filter) {
      this.originalFilter = filter as T;
    }
  }

  @Input('widget')
  public set setWidget(widget: FilterWidget) {
    if (widget && widget.configuration) {
      this.filterWidget = widget;
      this.parentWidget = widget.parent;
    }
  }

  // 대시보드
  @Input()
  public dashboard: Dashboard;

  // 차트 필터 목록
  @Input()
  public chartFilters: Filter[];

  // 대시보드 화면에서 실행했는지 여부
  @Input()
  public isDashboardMode: boolean = true;

  // 레이아웃에 배치되었는지 여부 ( BoardFilter만 해당 )
  @Input()
  public isWidgetInLayout: boolean = false;

  // 위젯 배치 가능 필터 여부 ( BoardFilter만 해당 )
  @Input()
  public isDraggable: boolean = false;

  // 수정 가능 여부
  @Input()
  public isChangeable: boolean = true;

  // 필터 변경 이벤트 ( 형태 및 기본값 변경 )
  @Output()
  public updateFilterEvent: EventEmitter<Filter> = new EventEmitter();

  // 필터 삭제이벤트
  @Output()
  public deleteFilterEvent = new EventEmitter();

  // 필터 수정 팝업 오픈 이벤트
  @Output()
  public openUpdateFilterPopupEvent = new EventEmitter();

  // 차트필터를 글로벌 필터로 변경
  @Output()
  public changeChartToGlobalEvent = new EventEmitter();

  // 글로벌 필터를 차트 필터로 변경
  @Output()
  public changeGlobalToChartEvent = new EventEmitter();

  // 글로벌 필터를 차트 필터로 변경
  @Output()
  public resetFilterEvent = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  protected constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 초기 설정
   * 파라메터 조회 및 초기 데이터 조회
   */
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const boardChanges: SimpleChange = changes.dashboard;
    if (boardChanges && boardChanges.currentValue) {
      this.boardFilters = DashboardUtil.getBoardFilters(boardChanges.currentValue);
    }
  } // function - ngOnChanges

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();

    if (this.filterWidget) {
      const conf: FilterWidgetConfiguration = this.filterWidget.configuration as FilterWidgetConfiguration;
      this.originalFilter = DashboardUtil.getBoardFilter(this.dashboard, conf.filter.dataSource, conf.filter.field) as T;
    }

    if (this.originalFilter['isNew']) {
      this.isNewFilter = true;
      this.safelyDetectChanges();
      delete this.originalFilter['isNew'];
      setTimeout(() => {
        this.isNewFilter = false;
        this.safelyDetectChanges();
      }, 1500);
    }
  } // function - ngOnChanges

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 필터 초기화
   */
  public abstract resetFilter();

  /**
   * 글로벌 필터를 차트 필터로 변환 (차트에서만)
   * @param {Filter} filter
   */
  public changeGlobalToChart(filter: Filter): void {
    this.changeGlobalToChartEvent.emit(filter);
  } // function changeGlobalToChart

  /**
   * 차트 필터를 글로벌 필터로 변환 (차트에서만)
   * @param {Filter} filter
   */
  public changeChartToGlobal(filter: Filter): void {
    this.changeChartToGlobalEvent.emit(filter);
  } // function changeChartToGlobal

  /**
   * 필터 수정 팝업 오픈 이벤트
   * @param {Filter} filter
   */
  public openUpdateFilterPopup(filter: Filter) {
    this.openUpdateFilterPopupEvent.emit(filter);
  } // function - openUpdateFilterPopup

  /**
   *  필터내용 보이기 감추기
   */
  public showFilter(isShow?: boolean) {
    if (isShow != null) {
      this.isShowFilter = isShow;
    } else {
      this.isShowFilter = !this.isShowFilter;
    }
  } // function showFilter

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 패널 데이터 설정
   * @param {Filter} filter
   */
  protected setPanelData(filter: Filter) {

    this.dataSource = FilterUtil.getDataSourceForFilter(filter, this.dashboard);

    if (this.dataSource) {
      // 대시보드 필터 여부
      this.isBoardFilter = !filter.ui.widgetId;

      // 필드
      this.field = DashboardUtil.getFieldByName(this.dashboard, filter.dataSource, filter.field, filter.ref);

      // 타임스탬프, 필수필터, 추천필터일 경우에도 변경 불가능
      if ('recommended' === filter.ui.importanceType || 'timestamp' === filter.ui.importanceType) {
        this.isChangeable = false;
      }

      // 기능 버튼 활성 여부
      this.isDeletable = this.isChangeable && (this.isDashboardMode === this.isBoardFilter);
      this.isEditable = (this.isDashboardMode === this.isBoardFilter) && !(ConnectionType.LINK === this.dataSource.connType && 'recommended' === filter.ui.importanceType);
    } else {
      this.isDeletable = true;
    }

  } // function - setPanelData

  /**
   * 통신용 필터
   * return Filter;
   */
  protected getFiltersParam(filter: Filter): Filter[] {

    if (!this.boardFilters) this.boardFilters = [];
    if (!this.chartFilters) this.chartFilters = [];

    let filters: Filter[] = [];
    // 차트필터
    if (filter.ui.widgetId) {

      // 필수필터 + 글로벌필터
      filters = this.boardFilters;

      // + 자신을 제외한 차트 필터
      filters = filters.concat(this.chartFilters.filter(item => (item.field !== filter.field
        && item.ui.widgetId === filter.ui.widgetId
        && !(item.type === 'bound' && item['min'] == null))));

    } else if (filter.ui.importanceType === 'general') {
      // + 자기 자신을 제외한 글로벌 필터
      filters = filters.concat(this.boardFilters.filter(item => item.field !== filter.field && !(item.type === 'bound' && item['min'] == null)));

      // + 차트필터
      filters = filters.concat(this.chartFilters);
    } else if (filter.ui.importanceType === 'timestamp') {
      filters = [];
    } else {
      // 타임스탬프 + 자기보다 시퀀스가 낮은(우선순위가 높은) 필터
      filters = this.boardFilters.filter((item) => {
        return item.ui.importanceType === 'timestamp' || item.ui.filteringSeq < filter.ui.filteringSeq;
      });
    }

    if (!filters) filters = [];
    return filters;
  } // function - getFiltersParam

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
