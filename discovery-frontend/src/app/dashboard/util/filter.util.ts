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
  InclusionFilter,
  InclusionSelectorType
} from '../../domain/workbook/configurations/filter/inclusion-filter';
import { BoundFilter } from '../../domain/workbook/configurations/filter/bound-filter';
import {
  InequalityType,
  MeasureInequalityFilter
} from '../../domain/workbook/configurations/filter/measure-inequality-filter';
import { AggregationType } from '../../domain/workbook/configurations/field/measure-field';
import {
  MeasurePositionFilter,
  PositionType
} from '../../domain/workbook/configurations/filter/measure-position-filter';
import { ContainsType, WildCardFilter } from '../../domain/workbook/configurations/filter/wild-card-filter';
import { Datasource, Field } from '../../domain/datasource/datasource';
import { BoardDataSource, Dashboard } from '../../domain/dashboard/dashboard';
import { Filter } from '../../domain/workbook/configurations/filter/filter';
import { ByTimeUnit, TimeUnit } from '../../domain/workbook/configurations/field/timestamp-field';
import { TimeFilter } from '../../domain/workbook/configurations/filter/time-filter';
import { isNullOrUndefined } from 'util';
import { TimeListFilter } from '../../domain/workbook/configurations/filter/time-list-filter';
import { TimeAllFilter } from '../../domain/workbook/configurations/filter/time-all-filter';
import { TimeRangeFilter } from '../../domain/workbook/configurations/filter/time-range-filter';
import {
  TimeRelativeFilter,
  TimeRelativeTense
} from '../../domain/workbook/configurations/filter/time-relative-filter';
import { DashboardUtil } from './dashboard.util';
import {
  IntervalFilter,
  IntervalRelativeTimeType, IntervalSelectorType
} from '../../domain/workbook/configurations/filter/interval-filter';

declare let moment;

export class FilterUtil {

  /**
   * 필터 패널 내용 목록 조회
   * @param {Filter[]} filterList
   * @param {Dashboard} dashboard
   * @param {Function} inclusionFilterFunc
   */
  public static getPanelContentsList(filterList: Filter[], dashboard: Dashboard, inclusionFilterFunc: Function) {
    filterList.forEach((filter: Filter) => {
      filter['fieldObj'] = DashboardUtil.getFieldByName(dashboard, filter.dataSource, filter.field, filter.ref);
      if ('include' === filter.type) {
        (inclusionFilterFunc) && (inclusionFilterFunc(<InclusionFilter>filter, filter['fieldObj']));
      } else if ('bound' === filter.type) {
        const boundFilter: BoundFilter = (<BoundFilter>filter);
        filter['panelContents'] = boundFilter.min + ' ~ ' + boundFilter.max;
      } else if (FilterUtil.isTimeListFilter(filter)) {
        const vals: string[] = (<TimeListFilter>filter).valueList;
        if (vals && 0 < vals.length) {
          filter['panelContents'] = vals.join(' , ');
        } else {
          filter['panelContents'] = '(No time filtering)';
        }
      } else if (FilterUtil.isTimeRangeFilter(filter)) {
        const timeRangeFilter: TimeRangeFilter = <TimeRangeFilter>filter;
        const intervals: string[] = timeRangeFilter.intervals;
        if (intervals && 0 < intervals.length) {
          filter['panelContents'] = intervals.map(item => {
            const arrInterval: any[] = item.split('/');

            if (TimeRangeFilter.EARLIEST_DATETIME !== arrInterval[0] && TimeRangeFilter.LATEST_DATETIME !== arrInterval[0]) {
              arrInterval[0] = FilterUtil.getDateTimeFormat(arrInterval[0], timeRangeFilter.timeUnit,true);
            }
            if (TimeRangeFilter.EARLIEST_DATETIME !== arrInterval[1] && TimeRangeFilter.LATEST_DATETIME !== arrInterval[1]) {
              arrInterval[1] = FilterUtil.getDateTimeFormat(arrInterval[1], timeRangeFilter.timeUnit,false);
            }

            return arrInterval[0] + '/' + arrInterval[1];
          });
          filter['panelContents'] = filter['panelContents'].join('<br>');
        } else {
          filter['panelContents'] = '(No time filtering)';
        }
      } else if (FilterUtil.isTimeRelativeFilter(filter)) {
        const timeFilter: TimeRelativeFilter = (<TimeRelativeFilter>filter);
        filter['panelContents'] = timeFilter.value + ' ' + timeFilter.relTimeUnit.toString();
      } else if (FilterUtil.isTimeAllFilter(filter)) {
        filter['panelContents'] = '(No time filtering)';
      }
    });
  } // function - getPanelContentsList

  /**
   * 필터에 대한 보드데이터소스 반환
   * @param {Filter} filter
   * @param {Dashboard} board
   * @returns {BoardDataSource}
   */
  public static getBoardDataSourceForFilter(filter: Filter, board: Dashboard): BoardDataSource {
    const boardDataSource: BoardDataSource = board.configuration.dataSource;
    if ('multi' === boardDataSource.type) {
      return boardDataSource.dataSources.find(item => item.id === filter.dataSource);
    } else {
      return boardDataSource;
    }
  } // function - getBoardDataSourceForFilter

  /**
   * 필터에 대한 데이터소스 반환
   * @param {Filter} filter
   * @param {Dashboard} board
   * @returns {Datasource}
   */
  public static getDataSourceForFilter(filter: Filter, board: Dashboard): Datasource {
    return board.dataSources.find(item => item.id === filter.dataSource);
  } // function - getDataSourceForFilter

  /**
   * 기본 시간필터 (기본값으로) 생성
   * @param {Field} field
   * @param {boolean} isPreFilterUI   preFilters를 UI그리는 옵션까지 추가할지 여부
   * @param {string} importanceType
   * @param preFilterData
   * @return {InclusionFilter}
   */
  public static getBasicInclusionFilter(field: Field, isPreFilterUI: boolean, importanceType?: string, preFilterData?: any): InclusionFilter {
    // 시간 필터
    const inclusionFilter = new InclusionFilter(field.name);
    inclusionFilter.selector = InclusionSelectorType.SINGLE_COMBO;
    inclusionFilter.preFilters = [];
    inclusionFilter.valueList = [];
    inclusionFilter.ref = field.ref;
    inclusionFilter.dataSource = field.uiMasterDsId;

    inclusionFilter.preFilters.push(this.getBasicInequalityFilter(isPreFilterUI, preFilterData));
    inclusionFilter.preFilters.push(this.getBasicPositionFilter(isPreFilterUI, preFilterData));
    inclusionFilter.preFilters.push(this.getBasicwildCardFilter(field.name, isPreFilterUI, preFilterData));

    inclusionFilter.ui.masterDsId = field.uiMasterDsId;
    inclusionFilter.ui.dsId = field.dsId;
    (importanceType) && (inclusionFilter.ui.importanceType = importanceType);
    (-1 < field.filteringSeq) && (inclusionFilter.ui.filteringSeq = field.filteringSeq + 1);
    if (field.filteringOptions) {
      inclusionFilter.ui.filteringOptions = field.filteringOptions;
      // 셀렉터가 지정되어 있으면 셀렉터 설정
      if (field.filteringOptions.defaultSelector === InclusionSelectorType.SINGLE_LIST) {
        inclusionFilter.selector = InclusionSelectorType.SINGLE_LIST;
      }
    }

    return inclusionFilter;
  } // function - getBasicInclusionFilter

  /**
   * 기본 시간필터 (기본값으로) 생성
   * @param {Field} field
   * @param {string} importanceType
   * @return {BoundFilter}
   */
  public static getBasicBoundFilter(field: Field, importanceType?: string): BoundFilter {
    // 시간 필터
    const boundFilter = new BoundFilter(field.name);
    boundFilter.max = 0;
    boundFilter.min = 0;
    boundFilter.ref = field.ref;
    boundFilter.dataSource = field.uiMasterDsId;

    boundFilter.ui.masterDsId = field.uiMasterDsId;
    boundFilter.ui.dsId = field.dsId;
    (importanceType) && (boundFilter.ui.importanceType = importanceType);

    return boundFilter;
  } // function getBasicBoundFilter

  /**
   * 기본 condition 생성
   * @param {boolean} isPreFilterUI(preFilters를 UI그리는 옵션까지 추가할지 여부)
   * @param {any} preFilterData(preFilters UI옵션)
   * @return {MeasureInequalityFilter}
   */
  public static getBasicInequalityFilter(isPreFilterUI: boolean, preFilterData: any): MeasureInequalityFilter {
    const measureInequalityFilter = new MeasureInequalityFilter();
    measureInequalityFilter.aggregationType = AggregationType.SUM;
    measureInequalityFilter.inequality = InequalityType.EQUAL_TO;
    measureInequalityFilter.value = 10;

    if (isPreFilterUI) {
      measureInequalityFilter.aggregationTypeUI = preFilterData.aggregationType;
      measureInequalityFilter.inequalityUI = preFilterData.conditionType;
    }

    return measureInequalityFilter;
  } // function getBasicInequalityFilter

  /**
   * 기본 limit 생성
   * @param {boolean} isPreFilterUI(preFilters를 UI그리는 옵션까지 추가할지 여부)
   * @param {any} preFilterData(preFilters UI옵션)
   * @return {MeasurePositionFilter}
   */
  public static getBasicPositionFilter(isPreFilterUI: boolean, preFilterData: any): MeasurePositionFilter {
    // 시간 필터
    const measurePositionFilter = new MeasurePositionFilter();
    measurePositionFilter.aggregationType = AggregationType.SUM;
    measurePositionFilter.position = PositionType.TOP;
    measurePositionFilter.value = 10;

    if (isPreFilterUI) {
      measurePositionFilter.aggregationTypeUI = preFilterData.aggregationType;
      measurePositionFilter.positionUI = preFilterData.limitType;
    }

    return measurePositionFilter;
  } // function getBasicPositionFilter

  /**
   * 기본 wildcard 생성
   * @param {string} fieldName
   * @param {boolean} isPreFilterUI
   * @param preFilterData
   * @return {WildCardFilter}
   */
  public static getBasicwildCardFilter(fieldName: string, isPreFilterUI: boolean, preFilterData: any): WildCardFilter {
    // 시간 필터
    const wildCardFilter = new WildCardFilter();
    wildCardFilter.contains = ContainsType.BEFORE;
    wildCardFilter.field = fieldName;
    wildCardFilter.value = '';

    if (isPreFilterUI) {
      wildCardFilter.containsUI = preFilterData.wildCardType;
    }

    return wildCardFilter;
  } // function getBasicwildCardFilter

  /**
   * API 를 위해서 불필요한 속성 제거
   * @param {Filter} filter
   * @return {Filter}
   */
  public static convertToServerSpec(filter: Filter): Filter {
    // 불필요 속성 제거
    let keyMap: string[];
    switch (filter.type) {
      case 'interval' :
        keyMap = ['selector', 'startDate', 'endDate', 'intervals', 'timezone',
          'locale', 'format', 'rrule', 'relValue', 'timeUnit'];
        break;
      case 'include' :
        keyMap = ['valueList', 'candidateValues'];
        break;
      case 'timestamp' :
        keyMap = ['selectedTimestamps', 'timeFormat'];
        break;
      case 'bound' :
        keyMap = ['min', 'max'];
        break;
      case 'time_all' :
        keyMap = [];
        break;
      case 'time_relative' :
        keyMap = ['relTimeUnit', 'tense', 'value', 'timeUnit', 'byTimeUnit', 'discontinuous'];
        break;
      case 'time_range' :
        keyMap = ['intervals', 'timeUnit', 'byTimeUnit', 'discontinuous'];
        break;
      case 'time_list' :
        keyMap = ['valueList', 'candidateValues', 'timeUnit', 'byTimeUnit', 'discontinuous'];
        break;
    }
    keyMap = keyMap.concat(['type', 'field', 'ref', 'dataSource']);
    for (let key of Object.keys(filter)) {
      if (-1 === keyMap.indexOf(key)) {
        delete filter[key];
      }
    }

    // Time Range 필터의 타임 형식 설정
    if (FilterUtil.isTimeRangeFilter(filter)) {
      const timeRangeFilter: TimeRangeFilter = <TimeRangeFilter>filter;
      if (timeRangeFilter.intervals && 0 < timeRangeFilter.intervals.length) {
        timeRangeFilter.intervals.forEach((item: string, idx: number) => {
          const arrInterval: any[] = item.split('/');

          if (TimeRangeFilter.EARLIEST_DATETIME !== arrInterval[0] && TimeRangeFilter.LATEST_DATETIME !== arrInterval[0]) {
            arrInterval[0] = FilterUtil.getDateTimeFormat(arrInterval[0], timeRangeFilter.timeUnit, true);
          }
          if (TimeRangeFilter.EARLIEST_DATETIME !== arrInterval[1] && TimeRangeFilter.LATEST_DATETIME !== arrInterval[1]) {
            arrInterval[1] = FilterUtil.getDateTimeFormat(arrInterval[1], timeRangeFilter.timeUnit, false);
          }

          timeRangeFilter.intervals[idx] = arrInterval[0] + '/' + arrInterval[1];
        });
        // 서버에서 quarter 에 대한 필터링을 제공하지 않기 때문에 강제적으로 Month로 변경함 ( Selection 필터를 위함 )
        ( TimeUnit.QUARTER === timeRangeFilter.timeUnit ) && ( timeRangeFilter.timeUnit = TimeUnit.MONTH );
      }
    } // end if - time_range
    else if( FilterUtil.isTimeRelativeFilter(filter)) {
      const timeRelativeFilter: TimeRelativeFilter = <TimeRelativeFilter>filter;
      ( timeRelativeFilter.timezone ) || ( timeRelativeFilter.timezone = moment.tz.guess() );
    } // end if - time_relative

    return filter;
  } // function - convertToServerSpec

  /**
   * Dashboard API 를 위해서 불필요한 속성 제거
   * @param {Filter} filter
   * @return {Filter}
   */
  public static convertToServerSpecForDashboard(filter: Filter): Filter {
    // 불필요 속성 제거
    let keyMap: string[];
    switch (filter.type) {
      case 'interval' :
        keyMap = ['selector', 'startDate', 'endDate', 'intervals', 'timezone',
          'locale', 'format', 'rrule', 'relValue', 'timeUnitUI', 'timeUnit', 'byTimeUnit',
          'minTime', 'maxTime', 'valueList', 'candidateValues', 'discontinuous', 'granularity'];
        break;
      case 'include' :
        keyMap = ['selector', 'preFilters', 'valueList', 'candidateValues', 'definedValues'];
        break;
      case 'timestamp' :
        keyMap = ['selectedTimestamps', 'timeFormat'];
        break;
      case 'bound' :
        keyMap = ['min', 'max'];
        break;
      case 'time_all' :
        keyMap = [];
        break;
      case 'time_relative' :
        keyMap = ['relTimeUnit', 'tense', 'value', 'timeUnit', 'byTimeUnit', 'discontinuous'];
        break;
      case 'time_range' :
        keyMap = ['intervals', 'timeUnit', 'byTimeUnit', 'discontinuous'];
        break;
      case 'time_list' :
        keyMap = ['valueList', 'candidateValues', 'timeUnit', 'byTimeUnit', 'discontinuous'];
        break;
    }
    keyMap = keyMap.concat(['type', 'field', 'ref', 'dataSource']);
    for (let key of Object.keys(filter)) {
      if (-1 === keyMap.indexOf(key)) {
        delete filter[key];
      }
    }

    // Time Range 필터의 타임 형식 설정
    if (FilterUtil.isTimeRangeFilter(filter)) {
      const timeRangeFilter = <TimeRangeFilter>filter;
      if (timeRangeFilter.intervals && 0 < timeRangeFilter.intervals.length) {
        timeRangeFilter.intervals.forEach((item: string, idx: number) => {
          const arrInterval: any[] = item.split('/');

          if (TimeRangeFilter.EARLIEST_DATETIME !== arrInterval[0] && TimeRangeFilter.LATEST_DATETIME !== arrInterval[0]) {
            arrInterval[0] = FilterUtil.getDateTimeFormat(arrInterval[0], timeRangeFilter.timeUnit,true);
          }
          if (TimeRangeFilter.EARLIEST_DATETIME !== arrInterval[1] && TimeRangeFilter.LATEST_DATETIME !== arrInterval[1]) {
            arrInterval[1] = FilterUtil.getDateTimeFormat(arrInterval[1], timeRangeFilter.timeUnit,false);
          }

          timeRangeFilter.intervals[idx] = arrInterval[0] + '/' + arrInterval[1];
        });
      }
    } // end if - time_range
    else if( FilterUtil.isTimeRelativeFilter(filter)) {
      const timeRelativeFilter: TimeRelativeFilter = <TimeRelativeFilter>filter;
      ( timeRelativeFilter.timezone ) || ( timeRelativeFilter.timezone = moment.tz.guess() );
    } // end if - time_relative

    return filter;
  } // function - convertToServerSpecForDashboard

  /* +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=
  *
  * TimeFilter 관련 유틸
  *
   +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+= */
  /**
   * 지정된 날짜/시간 형식대로 변환한다.
   * @param {Date|string} date
   * @param {TimeUnit} timeUnit
   * @param {boolean} isStart
   * @returns {string}
   */
  public static getDateTimeFormat(date: (Date | string), timeUnit: TimeUnit, isStart:boolean = true): string {
    switch (timeUnit) {
      case TimeUnit.SECOND:
        return moment(date).format('YYYY-MM-DD HH:mm:ss');
      case TimeUnit.MINUTE:
        return moment(date).format('YYYY-MM-DD HH:mm');
      case TimeUnit.HOUR:
        return moment(date).format('YYYY-MM-DD HH');
      case TimeUnit.DAY:
        return moment(date).format('YYYY-MM-DD');
      case TimeUnit.WEEK:
        return moment(date).format('YYYY-WW');
      case TimeUnit.MONTH:
        return moment(date).format('YYYY-MM');
      case TimeUnit.QUARTER:
        if( date instanceof Date ) {
          return moment(date).format('YYYY-MM');
        } else {
          const splitDate:string[] = date.split( /\s|-/ );
          let strYear:string = '';
          let strQuarter:string = '';
          if( -1 < splitDate[0].indexOf( 'Q' ) ) {
            strYear = splitDate[1];
            strQuarter = FilterUtil.quarterToMonth( splitDate[0], isStart );
          } else {
            strYear = splitDate[0];
            strQuarter = FilterUtil.quarterToMonth( splitDate[1], isStart );
          }
          return strYear + '-' + strQuarter;
        }
      case TimeUnit.YEAR:
        return moment(date).format('YYYY');
      default:
        return moment(date).format('YYYY-MM-DD HH:mm:ss');
    }
  } // function - getDateTimeFormat

  /**
   * 쿼터를 월로 변경
   * @param {string} quarter
   * @param {boolean} isStart
   * @return {string}
   */
  public static quarterToMonth( quarter:string, isStart:boolean ):string {
    switch( quarter ) {
      case 'Q1' :
        return ( isStart ) ? '01' : '03';
      case 'Q2' :
        return ( isStart ) ? '04' : '06';
      case 'Q3' :
        return ( isStart ) ? '07' : '09';
      case 'Q4' :
        return ( isStart ) ? '10' : '12';
    }
  } // function - quarterToMonth

  /**
   * Interval Filter 를 TimeFilter 로 변환해서 반환한다.
   * @param {IntervalFilter} filter
   * @param {Dashboard} boardInfo
   * @returns {TimeFilter}
   */
  public static convertIntervalToTimeFilter(filter: IntervalFilter, boardInfo: Dashboard): TimeFilter {
    let convertFilter: TimeFilter;
    const filterField = DashboardUtil.getFieldByName(boardInfo, filter.dataSource, filter.field);
    if (filter.discontinuous) {
      // 불연속 필터 변환
      const newFilter: TimeListFilter = new TimeListFilter(filterField);
      newFilter.discontinuous = filter.discontinuous;
      newFilter.timeUnit = (filter.timeUnit) ? filter.timeUnit : TimeUnit.NONE;
      newFilter.byTimeUnit = filter.byTimeUnit;
      (filter.valueList) && (newFilter.valueList = filter.valueList);
      (filter.candidateValues) && (newFilter.candidateValues = filter.candidateValues);
      convertFilter = newFilter;
    } else {
      switch (filter.selector) {
        case IntervalSelectorType.ALL:
          convertFilter = new TimeAllFilter(filterField);
          break;
        case IntervalSelectorType.RANGE :
          const newRangeFilter: TimeRangeFilter = new TimeRangeFilter(filterField);
          newRangeFilter.timeUnit = (filter.timeUnit) ? filter.timeUnit : TimeUnit.NONE;
          newRangeFilter.intervals = filter.intervals;
          convertFilter = newRangeFilter;
          break;
        case IntervalSelectorType.RELATIVE :
          const newRelativeFilter: TimeRelativeFilter = new TimeRelativeFilter(filterField);
          newRelativeFilter.timeUnit = (filter.timeUnit) ? filter.timeUnit : TimeUnit.NONE;
          if (IntervalRelativeTimeType.LAST === filter.timeType) {
            newRelativeFilter.tense = TimeRelativeTense.PREVIOUS;
          } else {
            if (filter.timeType) {
              newRelativeFilter.tense = TimeRelativeTense[filter.timeType.toString()];
            } else {
              newRelativeFilter.tense = TimeRelativeTense.PREVIOUS;
            }
          }
          newRelativeFilter.value = filter.relValue;
          convertFilter = newRelativeFilter;
          break;
      }
    }
    return convertFilter;
  } // function - convertIntervalToTimeFilter

  /**
   * 타임 필터 여부
   * @param {Filter} filter
   * @returns {boolean}
   */
  public static isTimeFilter(filter: Filter): boolean {
    return ('time_all' === filter.type
      || 'time_list' === filter.type
      || 'time_range' === filter.type
      || 'time_relative' === filter.type);
  } // function - isTimeFilter

  /**
   * 불연속형식 필터 여부
   * @param {TimeFilter} filter
   * @returns {boolean}
   */
  public static isDiscontinuousTimeFilter(filter: TimeFilter): boolean {
    return filter.discontinuous;
  } // function - isDiscontinuousTimeFilter

  /**
   * Granularity 가 지정되지 않은 연속성 여부 판단
   * @param {TimeFilter} filter
   * @returns {boolean}
   */
  public static isContinuousByAll(filter: TimeFilter): boolean {
    return !this.isDiscontinuousTimeFilter(filter) && TimeUnit.NONE === filter.timeUnit;
  } // function - isContinuousByAll

  /**
   * All Selector 여부
   * @param {Filter} filter
   * @returns {boolean}
   */
  public static isTimeAllFilter(filter: Filter): boolean {
    return filter.type === 'time_all';
  } // function - isTimeAllFilter

  /**
   * Relative Selector 여부
   * @param {Filter} filter
   * @return {boolean}
   */
  public static isTimeRelativeFilter(filter: Filter): boolean {
    return filter.type === 'time_relative';
  } // function - isTimeRelativeFilter

  /**
   * Range Selector 여부
   * @param {Filter} filter
   * @return {boolean}
   */
  public static isTimeRangeFilter(filter: Filter): boolean {
    return filter.type === 'time_range';
  } // function - isTimeRangeFilter

  /**
   * List Time Filter 여부
   * @param {Filter} filter
   * @returns {boolean}
   */
  public static isTimeListFilter(filter: Filter): boolean {
    return filter.type === 'time_list';
  } // function - isTimeListFilter

  /**
   * All Time Filter 생성
   * @param {Field} field
   * @param {string} importanceType
   * @return {TimeAllFilter}
   */
  public static getTimeAllFilter(field: Field, importanceType?: string): TimeAllFilter {
    // 시간 필터
    const timeFilter = new TimeAllFilter(field);
    timeFilter.timeUnit = TimeUnit.NONE;

    if (importanceType) {
      timeFilter.ui.importanceType = importanceType;
      ('timestamp' === importanceType) && (timeFilter.ui.filteringSeq = 0);
    }

    return timeFilter;
  } // function - getTimeAllFilter

  /**
   * TimeRangeFilter 설정
   * @param {Field} field
   * @param {TimeUnit} timeUnit
   * @param {string} importanceType
   * @returns {TimeRangeFilter}
   */
  public static getTimeRangeFilter(field: Field, timeUnit?: TimeUnit, importanceType?: string): TimeRangeFilter {
    const timeFilter = new TimeRangeFilter(field);
    timeFilter.timeUnit = isNullOrUndefined(timeUnit) ? TimeUnit.NONE : timeUnit;

    (importanceType) && (timeFilter.ui.importanceType = importanceType);

    return timeFilter;
  } // function - getTimeRangeFilter

  /**
   * TimeRelativeFilter 설정
   * @param {Field} field
   * @param {TimeUnit} timeUnit
   * @param {string} importanceType
   * @returns {TimeRelativeFilter}
   */
  public static getTimeRelativeFilter(field: Field, timeUnit?: TimeUnit, importanceType?: string): TimeRelativeFilter {
    const timeFilter = new TimeRelativeFilter(field);
    timeFilter.timeUnit = isNullOrUndefined(timeUnit) ? TimeUnit.NONE : timeUnit;

    (importanceType) && (timeFilter.ui.importanceType = importanceType);

    return timeFilter;
  } // function - getTimeRelativeFilter

  /**
   * TimeListFilter 설정
   * @param {Field} field
   * @param {boolean} discontinuous
   * @param {TimeUnit} timeUnit
   * @param {ByTimeUnit} byTimeUnit
   * @param {string} importanceType
   * @returns {TimeListFilter}
   */
  public static getTimeListFilter(field: Field, discontinuous: boolean, timeUnit: TimeUnit, byTimeUnit?: ByTimeUnit, importanceType?: string): TimeListFilter {
    const timeFilter = new TimeListFilter(field);
    timeFilter.timeUnit = timeUnit;
    timeFilter.discontinuous = discontinuous;
    timeFilter.valueList = [];
    (isNullOrUndefined(byTimeUnit)) || (timeFilter.byTimeUnit = byTimeUnit);

    (importanceType) && (timeFilter.ui.importanceType = importanceType);

    return timeFilter;
  } // function - getTimeListFilter


}
