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
import * as moment from 'moment';
import { Component, ElementRef, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractComponent } from '../../../common/component/abstract.component';
import { ChartSelectInfo } from '../../../common/component/chart/base-chart';
import { ChartSelectMode } from '../../../common/component/chart/option/define/common';
import { Filter } from '../../../domain/workbook/configurations/filter/filter';
import { EventBroadcaster } from '../../../common/event/event.broadcaster';
import { TimeUnit } from '../../../domain/workbook/configurations/field/timestamp-field';
import { InclusionSelectorType } from '../../../domain/workbook/configurations/filter/inclusion-filter';

@Component({
  selector: 'selection-filter',
  templateUrl: './selection-filter.component.html'
})
export class SelectionFilterComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 차트 선택 목록 ( 최종 선택된 목록만 저장 ) - 프레젠테이션뷰에 필터 선택을 전달하기 위해 저장
  private _chartSelectionList: ChartSelectInfo[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // View용 필터
  public selectionFilterList: SelectionFilter[];

  @Input()
  public showBtnWidget: boolean = false;

  public scrollFreezing: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 클래스 초기화
   */
  public ngOnInit() {
    super.ngOnInit();

    // 필터 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('CHART_SELECTION_FILTER').subscribe(data => {
        // 셀렉션 필터에게 넘겨 줌
        this.changeFilter(data.select);
      })
    );

    this.init();
  }

  /**
   * 클래스 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차트 선택 정보를 반환한다.
   */
  public getChartSelectionList(): ChartSelectInfo[] {
    return this._chartSelectionList;
  } // function - getChartSelectionList

  /**
   * 외부에서 필터가 변경되었다는 정보
   * @param {ChartSelectInfo} select
   */
  public changeFilter(select: ChartSelectInfo) {
    if (select.mode === ChartSelectMode.ADD) {
      // 차트 선택 정보를 추가함
      this._addChartSelectionInfo(select);
      if (Array.isArray(select.data)) {
        select.data.forEach((data) => this._addSelectionFilter(this.selectionFilterList, data, select.params));
      }

    } else if (select.mode === ChartSelectMode.SUBTRACT) {
      // 차트 선택 정보 제거
      this._removeChartSelectionInfo(select);

      if (Array.isArray(select.data)) {
        select.data.forEach((data) => {
          // View용 셀렉터 필터
          let valueList = data.data;
          if (typeof valueList === 'string') {
            valueList = [valueList];
          }
          this.removeFilter(data, valueList);
        });
      }
    } else if (select.mode === ChartSelectMode.CLEAR) {
      // 초기화
      this.init();
    }

    this._broadcastSelection({ filters: this._getApiFilters(), chartSelectInfo: select });
  }

  /**
   * 필터 리셋
   */
  public resetFilter(shouldEmit: boolean = true) {
    this.init();
    if (shouldEmit) {
      this._broadcastSelection(this._getApiFilters());
    }
  } // function - resetFilter

  /**
   * 데이터 초기화
   */
  public init() {
    this.selectionFilterList = [];
    this._chartSelectionList = [];
    this.changeDetect.detectChanges();
  } // function - init

  /**
   * 필드 삭제
   * @param {SelectionFilter} selectionFilter
   * @param {boolean} changeFlag
   */
  public remove(selectionFilter: SelectionFilter, changeFlag: boolean = true) {
    // 삭제
    _.remove(this.selectionFilterList, (filter) => {
      if ('timestamp' === selectionFilter.type) {
        return filter.field === selectionFilter.field && filter.format.unit === selectionFilter.format.unit;
      } else {
        return filter.field === selectionFilter.field;
      }
    });
    // chartSelection 목록 삭제
    this._removeFieldInChartSelections(selectionFilter);

    if (changeFlag) {
      this._broadcastSelection(this._getApiFilters());
    }
  } // function - remove

  /**
   * 레이어 표시 변경
   * @param {SelectionFilter} selectionFilter
   * @param event
   */
  public toggleLayer(selectionFilter: SelectionFilter, event) {
    event.stopPropagation();
    const change: boolean = !selectionFilter.selected;
    this.closeFilter();
    selectionFilter.selected = change;
    this.scrollFreezing = change;
  }

  /**
   * 필터 레이어 닫음
   */
  public closeFilter() {
    this.scrollFreezing = false;
    this.selectionFilterList.forEach((selectFilter) => {
      selectFilter.selected = false;
    });
  }

  // noinspection JSMethodCanBeStatic
  /**
   * 타임 범위 필터
   * @param {SelectionFilter} filter
   * @return {boolean}
   */
  public isTimeRangeFilter(filter: SelectionFilter): boolean {
    return 'timestamp' === filter.type && !filter.format.discontinuous;
    // return false;
  } // function - isTimeRangeFilter

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _getApiFilters() {
    return this.selectionFilterList.map(item => {
      if ('dimension' === item.type) {
        // for InclusionFilter
        return {
          type: 'include',
          field: item.field,
          dataSource: item.dataSource,
          selector: InclusionSelectorType.MULTI_LIST,
          valueList: item.valueList,
          selectedWidgetId: item.selectedWidgetId
        };
      } else if ('measure' === item.type) {
        // for MeasureFilter
        return item;
      } else {
        if (item.format.discontinuous) {
          // for TimeListFilter
          return {
            type: 'time_list',
            field: item.field,
            dataSource: item.dataSource,
            timeUnit: TimeUnit[item.format.unit],
            discontinuous: item.format.discontinuous,
            valueList: item.valueList,
            selectedWidgetId: item.selectedWidgetId
          };
        } else {
          // for TimeRangeFilter
          return {
            type: 'time_range',
            field: item.field,
            dataSource: item.dataSource,
            timeUnit: TimeUnit[item.format.unit],
            discontinuous: item.format.discontinuous,
            intervals: [item.minTime + '/' + item.maxTime],
            selectedWidgetId: item.selectedWidgetId
          };
        }
      }
    });
  } // function - _getApiFilters

  /**
   * Selection 필터 추가
   * @param {SelectionFilter[]} filters
   * @param {SelectionInfoData} selectInfoData
   * @param {{engineName: string, widgetId: string, selectType:string}} params
   * @private
   */
  private _addSelectionFilter(filters: SelectionFilter[], selectInfoData: SelectionInfoData,
                              params: { engineName: string, widgetId: string, selectType:string }) {

    const filter: SelectionFilter = filters.find((filter: SelectionFilter) => filter.field === selectInfoData.name);

    let newValues = selectInfoData.data;
    (typeof newValues === 'string') && (newValues = [newValues]);

    if (filter) {
      ( 'MULTI' === params.selectType ) && ( filter.valueList = [] );
      // 필터가 있는 경우
      filter.valueList = _.uniq(filter.valueList.concat(newValues));
      this._setTimeRange(filter);
    } else {
      // 필터가 없는 경우
      const selectionFilter = new SelectionFilter(selectInfoData.name, params.engineName);
      selectionFilter.name = selectInfoData.name;
      selectionFilter.alias = selectInfoData.alias;
      selectionFilter.type = selectInfoData.type;
      selectionFilter.valueList = newValues;
      selectionFilter.selectedWidgetId = params.widgetId;
      (selectInfoData.format) && (selectionFilter.format = selectInfoData.format);
      this._setTimeRange(selectionFilter);
      filters.push(selectionFilter);
    }
  } // function - _addSelectionFilter

  /**
   * 필터 삭제
   * @param {any} data
   * @param {string[]} valueList
   */
  private removeFilter(data: any, valueList: string[]) {
    const idx = this.selectionFilterList.findIndex((filter) => {
      if ('timestamp' === data.type) {
        return filter.alias === data.alias && filter.format.unit === data.format.unit;
      } else {
        return filter.alias === data.alias;
      }
    });

    if (idx > -1) {
      // 삭제
      valueList.forEach((value) => {
        _.remove(this.selectionFilterList[idx].valueList, (val) => {
          return val === value;
        });
      });

      if (this.selectionFilterList[idx].valueList.length === 0) {
        this.remove(this.selectionFilterList[idx], false);
      }

    }
  } // function - removeFilter

  /**
   * 선택 필터의 타임 범위 설정
   * @param {SelectionFilter} filter
   * @private
   */
  private _setTimeRange(filter: SelectionFilter) {
    if (this.isTimeRangeFilter(filter)) {

      if (-1 === filter.valueList[0].indexOf('Q')) {
        // 일반 TimeUnit

        // 데이터를 정렬 할 수 있는 형태로 변환
        const timeValList = filter.valueList.map(item => {
          return { timestamp: moment(item).unix(), val: item };
        });

        // 시간 정렬
        timeValList.sort((a, b) => a.timestamp - b.timestamp);

        filter.minTime = timeValList[0].val;
        filter.maxTime = timeValList[timeValList.length - 1].val;
      } else {
        // Quarter

        // 데이터를 정렬 할 수 있는 형태로 변환
        const timeValList = filter.valueList.map(item => {
          const splitDate: string[] = item.split(/\s|-/);
          let strYear: string = '';
          let strQuarter: string = '';
          if (-1 < splitDate[0].indexOf('Q')) {
            strYear = splitDate[1];
            strQuarter = splitDate[0];
          } else {
            strYear = splitDate[0];
            strQuarter = splitDate[1];
          }
          return { orderStr: strYear + '-' + strQuarter, val: item };
        });

        // 시간 정렬
        timeValList.sort((a, b) => {
          if (a.orderStr < b.orderStr) return -1;
          if (a.orderStr > b.orderStr) return 1;
          return 0;
        });

        filter.minTime = timeValList[0].val;
        filter.maxTime = timeValList[timeValList.length - 1].val;

      }

    }
  } // function - _setTimeRange

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - Chart Selection
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 선택 정보를 전파한다.
   * @param data
   * @private
   */
  private _broadcastSelection(data: any) {

    // 셀렉션필터에 의한 변경
    if (_.isArray(data)) {
      const selectionFilters: SelectionFilter[] = <SelectionFilter[]>data;
      // console.info('셀렉션필터에 의한 변경', selectionFilters);
      // console.info('모든 차트에 필터 추가');

      this.broadCaster.broadcast('SET_SELECTION_FILTER', { filters: selectionFilters });

    } else {
      // 차트에 의한 변경
      // console.info('위젯에 의한 변경', data, data.chartSelectInfo.mode);
      // console.info('위젯 해당 필터들 추가해서 다시 draw 요청');

      const externalFilterData: any = {};

      // 1. widgets에서 본인차트 제외
      if (data.chartSelectInfo.params && data.chartSelectInfo.params.hasOwnProperty('widgetId')) {
        externalFilterData.excludeWidgetId = data.chartSelectInfo.params.widgetId;
      }

      // 2. 선택 필터 데이터 변환
      externalFilterData.filters = data.filters.map((filter: SelectionFilter) => {
        filter.valueList = _.uniq(_.flattenDeep(filter.valueList));
        // detail 차트를 위해 필터 선택을 한 위젯의 아이디를 저장해준다.
        // if (widgetId && isNullOrUndefined(filter.selectedWidgetId)) {
        //   filter.selectedWidgetId = widgetId;
        // }
        return filter;
      });

      this.broadCaster.broadcast('SET_SELECTION_FILTER', externalFilterData);

    }
  } // function - _broadcastSelection

  /**
   * 차트의 선택 정보를 저장한다.
   * @param {ChartSelectInfo} newItem
   * @private
   */
  private _addChartSelectionInfo(newItem: ChartSelectInfo): void {
    let savedList: ChartSelectInfo[] = this._chartSelectionList;
    if( 'MULTI' === newItem.params.selectType ) {
      savedList = savedList.filter( savedItem => savedItem.params.widgetId !== newItem.params.widgetId );
      savedList.push( newItem );
    } else {
      let isMergedWidget: boolean = savedList.some(savedItem => {
        // 동일 위젯 정보를 찾는다
        if (savedItem.params.widgetId === newItem.params.widgetId) {
          newItem.data.forEach(newItemData => {

            // 필드 정보가 존재할 경우 필드 정보 내 데이터를 추가해준다.
            let isMerged: boolean = savedItem.data.some(savedItemData => {
              if (savedItemData.alias === newItemData.alias) {
                savedItemData.data
                  = savedItemData.data
                  .concat(newItemData.data)
                  .filter((elem, pos, arr) => arr.indexOf(elem) == pos);
                return true;
              }
            });

            // 필드 정보가 없을 경우 새로운 필드를 추가해준다
            (isMerged) || (savedItem.data.push(newItemData));

          });
          return true;
        }
      });

      // 동일 위젯이 없을 경우 정보를 추가해준다.
      (isMergedWidget) || (savedList.push(newItem));
    }
  } // function - _addChartSelectionInfo

  /**
   * 차트의 선택 정보를 삭제한다.
   * @param {ChartSelectInfo} removeItem
   * @private
   */
  private _removeChartSelectionInfo(removeItem: ChartSelectInfo): void {
    let nEmptyFieldIndex: number = -1;
    this._chartSelectionList.some((savedItem: ChartSelectInfo, fieldIdx: number) => {
      // 동일 위젯 정보를 찾는다
      if (savedItem.params.widgetId === removeItem.params.widgetId) {
        removeItem.data.forEach(removeItemData => {

          // 저장된 필드 정보에서 선택된 데이터를 삭제해준다.
          let nEmptyDataIndex: number = -1;
          savedItem.data.some((savedItemData, dataIdx: number) => {
            if (savedItemData.alias === removeItemData.alias && savedItemData.data) {
              savedItemData.data = savedItemData.data.filter(item => -1 === removeItemData.data.indexOf(item));
              (0 === savedItemData.data.length) && (nEmptyDataIndex = dataIdx);
              return true;
            }
          });

          // 데이터가 없는 필드에 대해서는 필드를 제거해준다.
          (-1 < nEmptyDataIndex) && (savedItem.data.splice(nEmptyDataIndex, 1));

        });

        // 필드 정보가 없을 경우 삭제하기 위해 배열 위치 저장
        (0 === savedItem.data.length) && (nEmptyFieldIndex = fieldIdx);

        return true;
      }
    });

    // 필드 정보가 없는 선택 정보에 대해서 삭제해 준다.
    if (-1 < nEmptyFieldIndex) {
      this._chartSelectionList.splice(nEmptyFieldIndex, 1);
    }

  } // function - _removeChartSelectionInfo

  /**
   * 특정 필드를 탐색하여 삭제한다.
   * @param {SelectionFilter} filter
   * @private
   */
  private _removeFieldInChartSelections(filter: SelectionFilter): void {
    let nEmptyFieldIndex: number = -1;
    this._chartSelectionList.some((savedItem: ChartSelectInfo, fieldIdx: number) => {

      // 지정된 필드의 위치를 찾는다
      let nEmptyDataIndex: number = savedItem.data.findIndex(savedItemData => savedItemData.alias === filter.alias);

      // 데이터가 없는 필드에 대해서는 필드를 제거해준다.
      if (-1 < nEmptyDataIndex) {
        savedItem.data.splice(nEmptyDataIndex, 1);
        (0 === savedItem.data.length) && (nEmptyFieldIndex = fieldIdx);
        return true;
      }

    });

    // 필드 정보가 없는 선택 정보에 대해서 삭제해 준다.
    if (-1 < nEmptyFieldIndex) {
      this._chartSelectionList.splice(nEmptyFieldIndex, 1);
    }
  } // function - _removeFieldInChartSelections
}

class SelectionInfoData {
  public alias: string;
  public currentPivot: string;
  public data: (string[] | string);
  public format: { type?: string, discontinuous?: boolean, unit?: string };
  public granularity: string;
  public name: string;
  public segGranularity: string;
  public subRole: string;
  public subType: string;
  public type: string;
} // Class - SelectionInfoData

export class SelectionFilter extends Filter {

  // for UI
  public selected: boolean = false;
  public name: string;
  public format: { type?: string, discontinuous?: boolean, unit?: string };
  public alias: string;
  public fieldAlias: string;
  public pivotAlias: string;

  public minTime?: string;
  public maxTime?: string;
  public valueList?: string[];

  // hierachy 를 처리하기 위한 선택 필터의 대상 위젯 아이디
  public selectedWidgetId: string;

  constructor(field: string, engineName: string) {
    super();
    this.field = field;
    this.dataSource = engineName;
  }

  /**
   * 표시 이름 설정
   * @return {string}
   */
  public getDisplayName() {
    if (this.pivotAlias) {
      return this.pivotAlias;
    } else {
      if (this.fieldAlias !== this.alias) {
        if (this.alias && this.alias !== this.name) {
          return this.alias;
        } else {
          return (this.fieldAlias) ? this.fieldAlias : this.name;
        }
      } else {
        return this.name;
      }
    }
  } // function - getDisplayName

  public getLabel() {
    if (this.valueList.length === 0) {
      return '';
    } else {
      return this.valueList[0];
    }
  }

  public getValueCnt() {
    return this.valueList.length;
  }

}
