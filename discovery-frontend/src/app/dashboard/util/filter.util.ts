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
  InclusionItemSort,
  InclusionSelectorType,
  InclusionSortBy
} from '../../domain/workbook/configurations/filter/inclusion-filter';
import {BoundFilter} from '../../domain/workbook/configurations/filter/bound-filter';
import {
  InequalityType,
  MeasureInequalityFilter
} from '../../domain/workbook/configurations/filter/measure-inequality-filter';
import {AggregationType} from '../../domain/workbook/configurations/field/measure-field';
import {
  MeasurePositionFilter,
  PositionType
} from '../../domain/workbook/configurations/filter/measure-position-filter';
import {
  ContainsType,
  WildCardFilter
} from '../../domain/workbook/configurations/filter/wild-card-filter';
import {Datasource, Field} from '../../domain/datasource/datasource';
import {BoardDataSource, Dashboard} from '../../domain/dashboard/dashboard';
import {Filter} from '../../domain/workbook/configurations/filter/filter';
import {ByTimeUnit, TimeUnit} from '../../domain/workbook/configurations/field/timestamp-field';
import {TimeFilter} from '../../domain/workbook/configurations/filter/time-filter';
import {isNullOrUndefined} from 'util';
import {TimeListFilter} from '../../domain/workbook/configurations/filter/time-list-filter';
import {TimeAllFilter} from '../../domain/workbook/configurations/filter/time-all-filter';
import {TimeRangeFilter} from '../../domain/workbook/configurations/filter/time-range-filter';
import {
  TimeRelativeFilter,
  TimeRelativeTense
} from '../../domain/workbook/configurations/filter/time-relative-filter';
import {DashboardUtil} from './dashboard.util';
import {
  IntervalFilter,
  IntervalRelativeTimeType,
  IntervalSelectorType
} from '../../domain/workbook/configurations/filter/interval-filter';
import {DIRECTION} from '../../domain/workbook/configurations/sort';
import {RegExprFilter} from "../../domain/workbook/configurations/filter/reg-expr-filter";
import {TimezoneService} from "../../data-storage/service/timezone.service";

declare let moment;

export class FilterUtil {

  public static CANDIDATE_LIMIT:number = 1000;

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
              arrInterval[0] = FilterUtil.getDateTimeFormat(arrInterval[0], timeRangeFilter.timeUnit, true);
            }
            if (TimeRangeFilter.EARLIEST_DATETIME !== arrInterval[1] && TimeRangeFilter.LATEST_DATETIME !== arrInterval[1]) {
              arrInterval[1] = FilterUtil.getDateTimeFormat(arrInterval[1], timeRangeFilter.timeUnit, false);
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
      return boardDataSource.dataSources.find(item => item.engineName === filter.dataSource);
    } else {
      return boardDataSource;
    }
  } // function - getBoardDataSourceForFilter

  /**
   * 필수 필터 목록 조회
   * @param {Dashboard} board
   * @param {Filter} filter
   */
  public static getEssentialFilters(board: Dashboard, filter?: Filter): Filter[] {
    let essentialFilters: Filter[] = [];
    if (board.configuration.dataSource.temporary) {
      essentialFilters = board.configuration.filters.filter(item => {
        const filterField = DashboardUtil.getFieldByName(board, item.dataSource, item.field);
        if (filter && filter.ui && filter.ui.filteringSeq) {
          return filter.ui.filteringSeq < filterField.filteringSeq;
        } else {
          return -1 < filterField.filteringSeq;
        }
      });
    }
    return essentialFilters;
  } // function - getEssentialFilters

  /**
   * 필터에 대한 데이터소스 반환
   * @param {Filter} filter
   * @param {Dashboard} board
   * @returns {Datasource}
   */
  public static getDataSourceForFilter(filter: Filter, board: Dashboard): Datasource {
    return board.dataSources.find(item => item.engineName === filter.dataSource);
  } // function - getDataSourceForFilter

  /**
   * 기본 시간필터 (기본값으로) 생성
   * @param {Field} field
   * @param {string} importanceType
   * @param preFilterData
   * @return {InclusionFilter}
   */
  public static getBasicInclusionFilter(field: Field, importanceType?: string, preFilterData?: any): InclusionFilter {
    const inclusionFilter = new InclusionFilter(field.name);
    inclusionFilter.selector = InclusionSelectorType.SINGLE_COMBO;
    inclusionFilter.preFilters = [];
    inclusionFilter.valueList = [];
    inclusionFilter.ref = field.ref;
    inclusionFilter.dataSource = field.dataSource;

    inclusionFilter.preFilters.push(this.getBasicInequalityFilter(preFilterData));
    inclusionFilter.preFilters.push(this.getBasicPositionFilter(preFilterData));
    inclusionFilter.preFilters.push(this.getBasicWildCardFilter(field.name, preFilterData));
    inclusionFilter.preFilters.push(this.getBasicRegExprFilter(field.name, preFilterData));

    inclusionFilter.sort = new InclusionItemSort(InclusionSortBy.TEXT, DIRECTION.ASC);

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
    boundFilter.dataSource = field.dataSource;

    // boundFilter.ui.masterDsId = field.uiMasterDsId;
    // boundFilter.ui.dsId = field.dsId;
    (importanceType) && (boundFilter.ui.importanceType = importanceType);

    return boundFilter;
  } // function getBasicBoundFilter

  /**
   * 기본 condition 생성
   * @param {any} preFilterData(preFilters UI옵션)
   * @return {MeasureInequalityFilter}
   */
  public static getBasicInequalityFilter(preFilterData: any): MeasureInequalityFilter {
    const measureInequalityFilter = new MeasureInequalityFilter();
    measureInequalityFilter.aggregation = AggregationType.SUM;
    measureInequalityFilter.inequality = InequalityType.EQUAL_TO;
    measureInequalityFilter.value = 10;

    if (preFilterData) {
      measureInequalityFilter.aggregation = preFilterData.aggregation;
      measureInequalityFilter.inequality = preFilterData.inequality;
    }

    return measureInequalityFilter;
  } // function getBasicInequalityFilter

  /**
   * 기본 limit 생성
   * @param {any} preFilterData(preFilters UI옵션)
   * @return {MeasurePositionFilter}
   */
  public static getBasicPositionFilter(preFilterData: any): MeasurePositionFilter {
    // 시간 필터
    const measurePositionFilter = new MeasurePositionFilter();
    measurePositionFilter.aggregation = AggregationType.SUM;
    measurePositionFilter.position = PositionType.TOP;
    measurePositionFilter.value = 10;

    if (preFilterData) {
      measurePositionFilter.aggregation = preFilterData.aggregation;
      measurePositionFilter.position = preFilterData.position;
    }

    return measurePositionFilter;
  } // function getBasicPositionFilter

  /**
   * 기본 wildcard 생성
   * @param {string} fieldName
   * @param preFilterData
   * @return {WildCardFilter}
   */
  public static getBasicWildCardFilter(fieldName: string, preFilterData: any): WildCardFilter {
    // 시간 필터
    const wildCardFilter = new WildCardFilter();
    wildCardFilter.contains = ContainsType.BEFORE;
    wildCardFilter.field = fieldName;
    wildCardFilter.value = '';

    if (preFilterData) {
      wildCardFilter.contains = preFilterData.contains;
    }

    return wildCardFilter;
  } // function getBasicwildCardFilter

  /**
   * 기본 정규식 필터 생성
   * @param {string} fieldName
   * @param preFilterData
   * @return {RegExprFilter}
   */
  public static getBasicRegExprFilter(fieldName: string, preFilterData: any): RegExprFilter {
    const regExprFilter = new RegExprFilter();
    regExprFilter.field = fieldName;
    regExprFilter.expr = '';

    return regExprFilter;
  }

  /**
   * API 를 위해서 불필요한 속성 제거
   * @param {Filter} filter
   * @return {Filter}
   */
  public static convertToServerSpec(filter: Filter): Filter {

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
        (TimeUnit.QUARTER === timeRangeFilter.timeUnit) && (timeRangeFilter.timeUnit = TimeUnit.MONTH);
      }
    } // end if - time_range
    else if (FilterUtil.isTimeRelativeFilter(filter)) {
      const timeRelativeFilter: TimeRelativeFilter = <TimeRelativeFilter>filter;
      if (timeRelativeFilter.clzField && timeRelativeFilter.clzField.format && TimezoneService.DISABLE_TIMEZONE_KEY === timeRelativeFilter.clzField.format.timeZone) {
        delete timeRelativeFilter.timeZone;
      } else {
        (timeRelativeFilter.timeZone) || (timeRelativeFilter.timeZone = moment.tz.guess());
      }
    } // end if - time_relative

    // 불필요 속성 제거
    let keyMap: string[];
    switch (filter.type) {
      case 'interval' :
        keyMap = ['selector', 'startDate', 'endDate', 'intervals', 'timeZone',
          'locale', 'format', 'rrule', 'relValue', 'timeUnit'];
        break;
      case 'include' :
        keyMap = ['selector', 'valueList', 'candidateValues', 'sort'];
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
        keyMap = ['relTimeUnit', 'tense', 'value', 'timeUnit', 'byTimeUnit', 'discontinuous', 'timeZone'];
        break;
      case 'time_range' :
        keyMap = ['intervals', 'timeUnit', 'byTimeUnit', 'discontinuous'];
        break;
      case 'time_list' :
        keyMap = ['valueList', 'candidateValues', 'timeUnit', 'byTimeUnit', 'discontinuous'];
        break;
      case 'wildcard' :
        keyMap = ['contains', 'value'];
        break;
      case 'measure_inequality' :
        keyMap = ['aggregation', 'inequality', 'value'];
        break;
      case 'measure_position' :
        keyMap = ['aggregation', 'position', 'value'];
        break;
      case 'regexpr' :
        keyMap = ['expr'];
        break;
      case 'spatial_bbox' :
        keyMap = ['lowerCorner', 'upperCorner'];
        break;
    }
    keyMap = keyMap.concat(['type', 'field', 'ref', 'dataSource']);
    for (let key of Object.keys(filter)) {
      (keyMap.some(item => item === key)) || (delete filter[key]);
    }

    return filter;
  } // function - convertToServerSpec

  /**
   * Dashboard API 를 위해서 불필요한 속성 제거
   * @param {Filter} filter
   * @return {Filter}
   */
  public static convertToServerSpecForDashboard(filter: Filter): Filter {

    // Time Range 필터의 타임 형식 설정
    if (FilterUtil.isTimeRangeFilter(filter)) {
      const timeRangeFilter = <TimeRangeFilter>filter;
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
      }
    } // end if - time_range
    else if (FilterUtil.isTimeRelativeFilter(filter)) {
      const timeRelativeFilter: TimeRelativeFilter = <TimeRelativeFilter>filter;
      if (timeRelativeFilter.clzField && timeRelativeFilter.clzField.format && TimezoneService.DISABLE_TIMEZONE_KEY === timeRelativeFilter.clzField.format.timeZone) {
        delete timeRelativeFilter.timeZone;
      } else {
        (timeRelativeFilter.timeZone) || (timeRelativeFilter.timeZone = moment.tz.guess());
      }
    } // end if - time_relative

    // 불필요 속성 제거
    let keyMap: string[];
    switch (filter.type) {
      case 'interval' :
        keyMap = ['selector', 'startDate', 'endDate', 'intervals', 'timeZone',
          'locale', 'format', 'rrule', 'relValue', 'timeUnitUI', 'timeUnit', 'byTimeUnit',
          'minTime', 'maxTime', 'valueList', 'candidateValues', 'discontinuous', 'granularity'];
        break;
      case 'include' :
        keyMap = ['selector', 'valueList', 'candidateValues', 'definedValues', 'sort'];
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
        keyMap = ['relTimeUnit', 'tense', 'value', 'timeUnit', 'byTimeUnit', 'discontinuous', 'timeZone'];
        break;
      case 'time_range' :
        keyMap = ['intervals', 'timeUnit', 'byTimeUnit', 'discontinuous'];
        break;
      case 'time_list' :
        keyMap = ['valueList', 'candidateValues', 'timeUnit', 'byTimeUnit', 'discontinuous'];
        break;
      case 'wildcard' :
        keyMap = ['contains', 'value'];
        break;
      case 'measure_inequality' :
        keyMap = ['aggregation', 'inequality', 'value'];
        break;
      case 'measure_position' :
        keyMap = ['aggregation', 'position', 'value'];
        break;
    }
    keyMap = keyMap.concat(['type', 'field', 'ref', 'dataSource']);
    for (let key of Object.keys(filter)) {
      (keyMap.some(item => item === key)) || (delete filter[key]);
    }

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
  public static getDateTimeFormat(date: (Date | string), timeUnit: TimeUnit, isStart: boolean = true): string {
    if( date.constructor === String ) {
      date = (<string>date).replace( '.000Z', '' );
    }
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
        // return moment(date).format('YYYY-WW');
        return (<string>date);
      case TimeUnit.MONTH:
        return moment(date).format('YYYY-MM');
      case TimeUnit.QUARTER:
        if (date instanceof Date) {
          return moment(date).format('YYYY-MM');
        } else {
          const splitDate: string[] = date.split(/\s|-/);
          let strYear: string = '';
          let strQuarter: string = '';
          if (-1 < splitDate[0].indexOf('Q')) {
            strYear = splitDate[1];
            strQuarter = FilterUtil.quarterToMonth(splitDate[0], isStart);
          } else {
            strYear = splitDate[0];
            strQuarter = FilterUtil.quarterToMonth(splitDate[1], isStart);
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
  public static quarterToMonth(quarter: string, isStart: boolean): string {
    switch (quarter) {
      case 'Q1' :
        return (isStart) ? '01' : '03';
      case 'Q2' :
        return (isStart) ? '04' : '06';
      case 'Q3' :
        return (isStart) ? '07' : '09';
      case 'Q4' :
        return (isStart) ? '10' : '12';
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


  static setParameterFilterValue(filter: Filter, key: string, value: any): void {
    if (filter.type === 'include') {
      const inclusionFilter: InclusionFilter = <InclusionFilter>filter;
      if (Array.isArray(value)) {
        inclusionFilter.valueList = value;
      } else {
        inclusionFilter.valueList = [value];
      }
    } else if (filter.type === "bound") {
      const boundFilter: BoundFilter = <BoundFilter>filter;
      const paramValues: string[] = value.split(",");
      if (paramValues.length === 2) {
        const min = Number(paramValues[0]);
        const max = Number(paramValues[1]);
        if (!isNaN(min) && !isNaN(max)) {
          boundFilter.min = min;
          boundFilter.max = max;
          boundFilter.minValue = min;
          boundFilter.maxValue = max;
        }
      }
    } else if (filter.type === "time_range") {
      const timeRangeFilter: TimeRangeFilter = <TimeRangeFilter>filter;
      if (Array.isArray(value)) {
        timeRangeFilter.intervals = value;
      } else {
        timeRangeFilter.intervals = [value];
      }
    } else if (filter.type === "time_relative") {
      const timeRelativeFilter: TimeRelativeFilter = <TimeRelativeFilter>filter;
      const valueAttributes: string[] = value.split(",");
      valueAttributes.forEach(attr => {
        const keyValue = attr.split(":");
        if (keyValue[0] === "tense") {
          timeRelativeFilter.tense = TimeRelativeTense[keyValue[1]];
        } else if (keyValue[0] === "relTimeUnit") {
          timeRelativeFilter.relTimeUnit = TimeUnit[keyValue[1]];
        } else if (keyValue[0] === 'value') {
          timeRelativeFilter.value = +keyValue[1];
        }
      });
    } else if (filter.type === "time_list") {
      const timeListFilter: TimeListFilter = <TimeListFilter>filter;
      if (Array.isArray(value)) {
        timeListFilter.valueList = value;
      } else {
        timeListFilter.valueList = [value];
      }
    }
  }
}
