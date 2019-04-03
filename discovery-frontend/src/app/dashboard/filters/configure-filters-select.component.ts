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
import {AbstractFilterPopupComponent} from 'app/dashboard/filters/abstract-filter-popup.component';
import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {BoardConfiguration} from '../../domain/dashboard/dashboard';
import {CustomField} from '../../domain/workbook/configurations/field/custom-field';
import {Datasource, Field, FieldRole, LogicalType} from '../../domain/datasource/datasource';
import {Filter} from '../../domain/workbook/configurations/filter/filter';
import {FilterUtil} from '../util/filter.util';
import {ByTimeUnit, GranularityType, TimeUnit} from '../../domain/workbook/configurations/field/timestamp-field';
import {Widget} from '../../domain/dashboard/widget/widget';
import {BoundFilter} from '../../domain/workbook/configurations/filter/bound-filter';
import {Modal} from '../../common/domain/modal';
import {ConfirmModalComponent} from '../../common/component/modal/confirm/confirm.component';
import {TimeFilter} from '../../domain/workbook/configurations/filter/time-filter';
import {TimeAllFilter} from '../../domain/workbook/configurations/filter/time-all-filter';
import {TimeListFilter} from '../../domain/workbook/configurations/filter/time-list-filter';
import {isNullOrUndefined, isUndefined} from 'util';
import {DashboardUtil} from '../util/dashboard.util';
import {Alert} from '../../common/util/alert.util';

@Component({
  selector: 'app-config-filter-select',
  templateUrl: './configure-filters-select.component.html',
  styles: ['.ddp-pop-filter .ddp-filter0 .ddp-list-filter { top : 0px !important;} ']
})
export class ConfigureFiltersSelectComponent extends AbstractFilterPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(ConfirmModalComponent)
  private _confirmModalComp: ConfirmModalComponent;

  // 필드 목록 정보
  private _measureFields: (Field | CustomField)[] = [];
  private _dimensionFields: (Field | CustomField)[] = [];

  private _selectedField: (Field | CustomField);

  private _allContinuousList: string[] = ['Minute', 'Hour', 'Day', 'Week', 'Month', 'Quarter', 'Year', 'None'];
  private _allDiscontinuousList = {
    'DAY': [
      {name: 'Day by week', unit: 'DAY', byUnit: 'WEEK'},
      {name: 'Day by month', unit: 'DAY', byUnit: 'MONTH'},
      {name: 'Day by year', unit: 'DAY', byUnit: 'YEAR'}
    ],
    'WEEK': [
      {name: 'Week by month', unit: 'WEEK', byUnit: 'MONTH'},
      {name: 'Week by year', unit: 'WEEK', byUnit: 'YEAR'}
    ],
    'MONTH': [
      {name: 'Month by year', unit: 'MONTH', byUnit: 'YEAR'}
    ],
    'QUARTER': [
      {name: 'Quarter', unit: 'QUARTER'}
    ],
    'YEAR': [
      {name: 'Year', unit: 'YEAR'}
    ]
  };

  private _boardFilters: Filter[] = [];
  private _chartFilters: Filter[] = [];
  private _boardConf: BoardConfiguration;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public dataSources: Datasource[] = [];    // 데이터소스 목록
  public selectedDataSource: Datasource;    // 선택된 데이터 소스

  public isShow: boolean = false;        // 컴포넌트 표시 여부
  public isShowDimTab: boolean = true;   // Dimension Tab 표시 여부

  // 차트 편집화면에서 띄울 경우 현재 수정중인 차트 정보를 넣어준다.
  public widget: Widget;

  // 필드 목록 정보
  public measureFields: (Field | CustomField)[] = [];
  public dimensionFields: (Field | CustomField)[] = [];

  // 검색 관련
  public searchText: string = '';

  public granularity: GranularityType;
  public dpContinuousList: string[] = [];
  public dpDiscontinuousList: any[] = [];

  @Output('setFilter')
  public setFilterEvent: EventEmitter<{ key: string, filter: Filter, conf?: any }> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트를 연다.
   * @param {BoardConfiguration} boardConf
   * @param {Datasource[]} dataSources
   * @param {Datasource} targetDataSource
   * @param {Filter[]} chartFilters
   * @param {Widget} widget
   */
  public open(boardConf: BoardConfiguration, dataSources: Datasource[], targetDataSource: Datasource,
              chartFilters: Filter[], widget?: Widget) {
    this.widget = widget;

    this.dataSources = dataSources;
    this.selectedDataSource = (targetDataSource) ? targetDataSource : dataSources[0];

    this._boardFilters = isUndefined(boardConf.filters) ? [] : boardConf.filters;
    this._chartFilters = chartFilters;

    this._boardConf = boardConf;

    this.selectDataSource(this.selectedDataSource);

    this.isShow = true;
  } // function - open

  /**
   * 아무런 작업을 하지 않고 컴포넌트를 닫는다.
   */
  public close() {
    this.isShow = false;
  } // function - close

  /**
   * 데이터소스 선택
   * @param {Datasource} dataSource
   */
  public selectDataSource(dataSource: Datasource) {
    // Granularity 별 항목 설정
    this.granularity = dataSource.granularity;
    ( this.granularity ) || ( this.granularity = GranularityType.ALL );
    if (GranularityType.ALL !== this.granularity) {
      const strGranularity: string = this.granularity.toString();
      const idx: number = this._allContinuousList.findIndex(unit => unit.toUpperCase() === strGranularity);
      if (-1 < idx) {
        const dpContinuousList: string[] = this._allContinuousList.slice(idx);
        let dpDiscontinuousList: any[] = [];
        dpContinuousList.forEach(unit => {
          const data = this._allDiscontinuousList[unit.toUpperCase()];
          if (data && 0 < data.length) {
            dpDiscontinuousList = dpDiscontinuousList.concat(data);
          }
        });
        this.dpContinuousList = dpContinuousList;
        this.dpDiscontinuousList = dpDiscontinuousList;
      }
    }

    // 필드 설정
    let totalFields: (Field | CustomField)[] = DashboardUtil.getFieldsForMainDataSource(this._boardConf, dataSource.engineName);

    // 커스텀 필드 관련 잠시 주석 처리 - 멀티 데이터소스에 대한 고려 안되어 있음
    if (this._boardConf.customFields && 0 < this._boardConf.customFields.length) {
      totalFields
        = totalFields.concat(
        this._boardConf.customFields.filter(item => item.dataSource === dataSource.engineName)
      );
    }
    this._setFields(totalFields, this._boardFilters, this._chartFilters, this.widget);
  } // function - selectDataSource

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - List Item
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public getDimensionTypeIconClass = Field.getDimensionTypeIconClass;
  public getMeasureTypeIconClass = Field.getMeasureTypeIconClass;

  /**
   * 필드 선택 ( 타임 스탬프 필드가 아닐 경우 바로 편집 화면으로 이동 )
   * @param {Field | CustomField} field
   */
  public selectField(field: Field | CustomField) {
    if (this.isSelectedField(field)) {
      this._selectedField = null;
    } else {
      this._selectedField = field;

      if (!field['isTimestamp']) {
        if (field['isEditable']) {
          this.editFilter(field);
        } else {
          this.addFilter(field);
        }
      } else {
        if (field['isEditable']) {
          const timeFilter: TimeFilter = field['filter'];
          this.editTimestampFilter(field, timeFilter.timeUnit, timeFilter.byTimeUnit);
        } else {
          this.addTimestampFilter(field);
        }
      }

    }
  } // function - selectField

  /**
   * 필드 선택 여부 반환
   * @param {Field | CustomField} field
   * @return {boolean}
   */
  public isSelectedField(field: Field | CustomField): boolean {
    return (this._selectedField && this._selectedField.name === field.name);
  } // function - isSelectedField

  /**
   * 타임 스탬프의 Granularity 선택
   * @param {Field | CustomField} field
   * @param {boolean} discontinuous
   * @param {TimeUnit} unit
   * @param {ByTimeUnit} byUnit
   */
  public selectTimestampGranularity(field: Field | CustomField, discontinuous: boolean = false, unit: TimeUnit, byUnit?: ByTimeUnit) {
    if (field['isEditable']) {
      this.editTimestampFilter(field, unit, byUnit);
    } else {
      this.addTimestampFilter(field, unit, byUnit);
    }
  } // function - selectTimestampGranularity

  /**
   * 필터 추가
   * @param {Field | CustomField} field
   */
  public addFilter(field: Field | CustomField) {
    if (field.role === FieldRole.MEASURE) {
      // 측정값 필터
      const boundFilter: BoundFilter = FilterUtil.getBasicBoundFilter(<Field>field);
      (this.widget) && (boundFilter.ui.widgetId = this.widget.id);
      this.setFilterEvent.emit({key: 'ADD', filter: boundFilter});
    } else {
      // Inclusion 필터
      const preFilterData = {
        contains: this.wildCardTypeList[0].value,
        aggregation: this.aggregationTypeList[0].value,
        inequality: this.conditionTypeList[0].value,
        position: this.limitTypeList[0].value
      };
      const inclusionFilter = FilterUtil.getBasicInclusionFilter(<Field>field, null, preFilterData);
      if (field.type === 'user_expr') {
        inclusionFilter.ref = 'user_defined';
      }
      (this.widget) && (inclusionFilter.ui.widgetId = this.widget.id);
      this.setFilterEvent.emit({key: 'ADD', filter: inclusionFilter});
    }
  } // function - addFilter

  /**
   * 타임스탬프 타입 필터 추가
   * @param {Field | CustomField} field
   * @param {TimeUnit} unit
   * @param {ByTimeUnit} byUnit
   */
  public addTimestampFilter(field: Field | CustomField, unit?: TimeUnit, byUnit?: ByTimeUnit) {
    let timeFilter: TimeFilter;
    if (isNullOrUndefined(unit)) {
      timeFilter = new TimeAllFilter(<Field>field);
    } else {
      timeFilter = new TimeListFilter(<Field>field);
      timeFilter.timeUnit = unit;
      (byUnit) && (timeFilter.byTimeUnit = byUnit);
    }
    (this.widget) && (timeFilter.ui.widgetId = this.widget.id);
    this.setFilterEvent.emit({key: 'ADD', filter: timeFilter});
  } // function - addTimestampFilter

  /**
   * 필터 변경
   * @param {Field | CustomField} field
   */
  public editFilter(field: Field | CustomField) {

    if (this.widget
      && ('recommended' === field['importanceType'] || 'timestamp' === field['importanceType'])) {
      Alert.warning(this.translateService.instant('msg.board.filter.alert.change.chart.warning-recommend'));
      return;
    }

    if (field['someChartFilter']) {
      // 차트 필터를 글로벌 필터로 변경
      this._openConfirmToBoardFilter(field['someChartFilter']);
    } else {
      if (this.widget && field['useBoardFilter']) {
        // 보드 필터를 차트 필터로 변경
        this._openConfirmToChartFilter(field['filter']);
      } else {
        this.setFilterEvent.emit({key: 'EDIT', filter: field['filter']});
      }
    }
  } // function - editFilter

  /**
   * 타임스탬프 타입 필터 변경
   * @param {Field | CustomField} field
   * @param {string} unit
   * @param {string} byUnit
   */
  public editTimestampFilter(field: Field | CustomField, unit?: TimeUnit, byUnit?: ByTimeUnit) {

    if (this.widget
      && ('recommended' === field['importanceType'] || 'timestamp' === field['importanceType'])) {
      Alert.warning(this.translateService.instant('msg.board.filter.alert.change.chart.warning-recommend'));
      return;
    }

    // 필터 설정
    const isToBoardFilter: boolean = (field.hasOwnProperty('someChartFilter'));
    const timeFilter: TimeFilter = (isToBoardFilter) ? field['someChartFilter'] : field['filter'];
    if (isNullOrUndefined(unit) || TimeUnit.NONE === unit) {
      timeFilter.type = 'time_all';
    } else {
      timeFilter.type = 'time_list';
      timeFilter.timeUnit = unit;
      (byUnit) && (timeFilter.byTimeUnit = byUnit);
    }

    if (isToBoardFilter) {
      // 차트 필터를 글로벌 필터로 변경
      this._openConfirmToBoardFilter(timeFilter);
    } else {
      if (this.widget && field['useBoardFilter']) {
        // 보드 필터를 차트 필터로 변경
        this._openConfirmToChartFilter(timeFilter);
      } else {
        this.setFilterEvent.emit({key: 'EDIT', filter: timeFilter});
      }
    }

  } // function - editTimestampFilter

  /**
   * 검색 조회
   * @param {string} searchText
   */
  public searchEvent(searchText: string) {
    // 검색어 설정
    this.searchText = searchText;
    if (this.isShowDimTab) {
      this.dimensionFields = this._dimensionFields.filter(item => {
        return -1 !== item.name.toLowerCase().indexOf(this.searchText.toLowerCase());
      });
    } else {
      this.measureFields = this._measureFields.filter(item => {
        return -1 !== item.name.toLowerCase().indexOf(this.searchText.toLowerCase());
      });
    }
  } // function - searchEvent

  /**
   * 확인 팝업 확인 클릭시
   * @param {Modal} modal
   */
  public confirm(modal: Modal) {
    (modal.data.afterConfirm) && (modal.data.afterConfirm.call(this));
  } // function - confirm

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차트 필터를 대시보드 필터로 변경할지 묻는 팝업 오픈
   * @param {Filter} filter
   */
  private _openConfirmToBoardFilter(filter: Filter) {
    // 차트 필터를 글로벌필터로 변경 확인
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.board.filter.alert.change.global');
    modal.description = this.translateService.instant('msg.board.filter.alert.change.global.des');
    modal.data = {
      afterConfirm: () => {
        delete filter.ui.widgetId;
        this.setFilterEvent.emit({key: 'EDIT', filter: filter});
      }
    };
    this._confirmModalComp.init(modal);
  } // function - _openConfirmToBoardFilter

  /**
   * 대시보드 필터를 차트 필터로 변경할지 묻는 팝업 오픈
   * @param {Filter} filter
   * @private
   */
  private _openConfirmToChartFilter(filter: Filter) {
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.board.filter.alert.change.chart');
    modal.description = this.translateService.instant('msg.board.filter.alert.change.chart.des');
    modal.data = {
      afterConfirm: () => {
        filter.ui.widgetId = this.widget.id;
        this.setFilterEvent.emit({key: 'EDIT', filter: filter});
      }
    };
    this._confirmModalComp.init(modal);
  } // function - _openConfirmToChartFilter

  /**
   * 필드를 구분하여 나눈다. ( Measure, Dimension )
   * @param {(Field | CustomField)[]} fields
   * @param {Filter[]} boardFilters
   * @param {Filter[]} chartFilters
   * @param {Widget} widget
   * @private
   */
  private _setFields(fields: (Field | CustomField)[], boardFilters: Filter[], chartFilters: Filter[], widget?: Widget) {

    // 필드 설정
    fields.forEach((field: Field) => {
      let boardFilter: Filter = boardFilters.find(filter => field.name === filter.field);

      // 타임스탬프 필드 여부
      field['isTimestamp'] = ('user_expr' !== field.type && (<Field>field).logicalType === LogicalType.TIMESTAMP);

      // 타임스탬프로 지정된 필드가 없을 경우(디폴트) 또는 타임스탬프로 지정된 필드인경우
      if (field.role === FieldRole.TIMESTAMP && (<Field>field).logicalType === LogicalType.TIMESTAMP) {
        field['importanceType'] = 'timestamp';
      } else if (boardFilter && boardFilter.ui.filteringSeq) {
        field['importanceType'] = 'recommended';
        field['filteringSeq'] = boardFilter.ui.filteringSeq;
      }

      // 대시보드 필터 사용 여부
      field['useBoardFilter'] = Boolean(boardFilter);

      // 대시보드 필터 정보 설정
      (field['useBoardFilter']) && (field['filter'] = boardFilter);

      // 수정 가능 여부 및 차트 필터 정보 설정
      if (widget) {
        field['thisChartFilter'] = chartFilters.find(filter => {
          return field.name === filter.field && widget.id === filter.ui.widgetId;
        });
        field['isEditable'] = field['useBoardFilter'] || field['thisChartFilter'];
      } else {
        field['someChartFilter'] = chartFilters.filter(filter => field.name === filter.field);
        if (0 < field['someChartFilter'].length) {
          field['someChartFilter'] = field['someChartFilter'].reduce((prev, curr) => _.merge(prev, curr), {});
        } else {
          delete field['someChartFilter'];
        }
        field['isEditable'] = field['useBoardFilter'] || field['someChartFilter'];
      }
    });

    // 필드 목록에 사용할 데이터 정리
    let dimensionFields: (Field | CustomField)[] = fields.filter(item => item.role !== FieldRole.MEASURE);
    let measureFields: (Field | CustomField)[] = fields.filter(item => item.role === FieldRole.MEASURE && 'user_expr' !== item.type);

    this.dimensionFields = dimensionFields;
    this.measureFields = measureFields;
    this._dimensionFields = dimensionFields;
    this._measureFields = measureFields;
  } // function - _setFields

}
