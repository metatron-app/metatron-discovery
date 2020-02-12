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
  Component,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {Datasource, Field, FieldRole, LogicalType} from '../../../domain/datasource/datasource';
import {Filter} from '../../../domain/workbook/configurations/filter/filter';
import {BoardConfiguration, BoardDataSource, Dashboard} from '../../../domain/dashboard/dashboard';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {FilterUtil} from '../../util/filter.util';
import * as _ from 'lodash';
import {AbstractFilterPopupComponent} from '../abstract-filter-popup.component';
import {InclusionFilter} from '../../../domain/workbook/configurations/filter/inclusion-filter';
import {BoundFilter} from '../../../domain/workbook/configurations/filter/bound-filter';
import {Alert} from '../../../common/util/alert.util';
import {CommonConstant} from '../../../common/constant/common.constant';
import {CookieConstant} from '../../../common/constant/cookie.constant';
import {ConfigureFiltersInclusionComponent} from '../inclusion-filter/configure-filters-inclusion.component';
import {ConfigureFiltersBoundComponent} from '../bound-filter/configure-filters-bound.component';
import {ConfigureFiltersTimeComponent} from '../time-filter/configure-filters-time.component';
import {TimeFilter} from '../../../domain/workbook/configurations/filter/time-filter';
import {TimeRangeFilter} from '../../../domain/workbook/configurations/filter/time-range-filter';
import {FilteringType, TimeUnit} from '../../../domain/workbook/configurations/field/timestamp-field';
import {MeasureInequalityFilter} from '../../../domain/workbook/configurations/filter/measure-inequality-filter';
import {WildCardFilter} from '../../../domain/workbook/configurations/filter/wild-card-filter';
import {MeasurePositionFilter} from '../../../domain/workbook/configurations/filter/measure-position-filter';
import {AdvancedFilter} from '../../../domain/workbook/configurations/filter/advanced-filter';
import {DashboardUtil} from '../../util/dashboard.util';
import {Message} from '@stomp/stompjs';

@Component({
  selector: 'app-essential-filter',
  templateUrl: './essential-filter.component.html'
})
export class EssentialFilterComponent extends AbstractFilterPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _pseudoDashboard: Dashboard;

  // 원본 필터
  // private _originalFilters: Filter[] = [];

  // 선택한 필드, 필터, 통신용 필터, 통신용 데이터소스
  private _dataSource: BoardDataSource;
  private _dataSourceId: string;

  // 필드에 대한 필터 설정 컴퍼넌트 맵
  private _compMap: any = {};

  // ingest 완료 시 결과를 반환하기 위해서 임시 저장하는 변수
  private _ingestResultFilters: Filter[] = [];
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 대시보드
  @Input('datasource')
  public inputDatasource: BoardDataSource;

  @Output()
  public done: EventEmitter<{ id: string, info: Datasource, dataSourceId: string, filters?: Filter[] }> = new EventEmitter();

  // 필터 종류
  public essentialFilters: Filter[] = [];

  // enum
  public logicalType = LogicalType;

  // 데이터소스 적재 관련 정보
  public isShowProgress: boolean = false;    // 프로그래스 팝업 표시 여부
  public ingestionStatus: { progress: number, message: string, step?: number };  // 적재 진행 정보

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private dataSourceService: DatasourceService,
              protected appRef: ApplicationRef,
              protected componentFactoryResolver: ComponentFactoryResolver,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Component Initialize Method
   */
  public ngOnInit() {
    // Init
    super.ngOnInit();

    // 데이터소스 설정
    this._dataSource = new BoardDataSource();
    const mainDs: BoardDataSource = this.inputDatasource;

    // 필드 나눔
    this._setFields(mainDs.uiFields);

    if (mainDs.temporary) {
      // 재설정인 경우
      this._dataSource.type = 'default';
      this._dataSource.connType = 'LINK';
      this._dataSource.temporary = mainDs.temporary;
      this._dataSource.name = mainDs.metaDataSource.name;
      this._dataSource.engineName = mainDs.metaDataSource.engineName;
      this._dataSourceId = mainDs.id;

      if( mainDs.metaDataSource['filters'] ) {
        this.essentialFilters = mainDs.metaDataSource['filters'];   // 필수 필터 설정
      }
    } else {
      // 초기 설정인 경우
      this._dataSource.type = 'default';
      this._dataSource.connType = 'LINK';
      this._dataSource.name = mainDs.name;
      this._dataSource.engineName = mainDs.engineName;
      this._dataSourceId = mainDs.id;
      if( mainDs.uiFilters && 0 < mainDs.uiFilters.length ) {
        this.essentialFilters = mainDs.uiFilters;
      } else {
        this.essentialFilters = this._setEssentialFilters(mainDs.uiFields);   // 필수 필터 설정
      }
    }

    this._pseudoDashboard = new Dashboard();
    this._pseudoDashboard.configuration = new BoardConfiguration();
    this._pseudoDashboard.configuration.dataSource = this._dataSource;
    this._pseudoDashboard.configuration.fields = mainDs.uiFields;

    // UI에서 표현할 수 있는 데이터로 Convert
    if (0 < this.essentialFilters.length) {

      // console.info('>>>>> this.essentialFilters', this.essentialFilters);

      this._convertServerSpecToUISpec(this.essentialFilters);
      // this._originalFilters = _.cloneDeep(this.essentialFilters);
/*
      this.loadingShow();
      this._setEssentialFilter([], 0).then(() => {
        // console.info(this.essentialFilters);
        this.loadingHide();
      }).catch((error) => {
        console.log(error);
        this.commonExceptionHandler(error, this.translateService.instant('msg.board.alert.fail.load.essential'));
        this.loadingHide();
      });
*/
    } else {
      this.ingest();
    }

  } // function - ngOnInit

  /**
   * Component Destroy Method
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public filterUtil = FilterUtil;

  /**
   * 필드에 대한 아이콘 클래스 얻음
   * @param {Filter} filter
   * @param {boolean} isDimension
   * @returns {string}
   */
  public getIconClass(filter: Filter, isDimension: boolean = true): string {
    if (isDimension) {
      return Field.getDimensionTypeIconClass(this._getField(filter.field, filter.ref));
    } else {
      return Field.getMeasureTypeIconClass(this._getField(filter.field, filter.ref));
    }
  } // function - getIconClass

  /**
   * 컴포넌트 실행
   * @param {ElementRef} elm
   * @param {Filter} filter
   */
  public startComponent(elm: ElementRef, filter: Filter) {
    const field: Field = this._getField(filter.field, filter.ref);
    if ('include' === filter.type) {
      let confFilterCompFactory = this.componentFactoryResolver.resolveComponentFactory(ConfigureFiltersInclusionComponent);
      let inclusionComp = this.appRef.bootstrap(confFilterCompFactory, elm.nativeElement).instance;
      inclusionComp.showComponent(this._pseudoDashboard, <InclusionFilter>filter, field, false);
      this._compMap[filter.field] = inclusionComp;
    } else if (FilterUtil.isTimeFilter(filter)) {
      let confFilterCompFactory = this.componentFactoryResolver.resolveComponentFactory(ConfigureFiltersTimeComponent);
      let timeComp = this.appRef.bootstrap(confFilterCompFactory, elm.nativeElement).instance;
      timeComp.showComponent(this._pseudoDashboard, <TimeFilter>filter, field, false);
      this._compMap[filter.field] = timeComp;
    } else if ('bound' === filter.type) {
      let confFilterCompFactory = this.componentFactoryResolver.resolveComponentFactory(ConfigureFiltersBoundComponent);
      let boundComp = this.appRef.bootstrap(confFilterCompFactory, elm.nativeElement).instance;
      boundComp.showComponent(this._pseudoDashboard, <BoundFilter>filter, field);
      this._compMap[filter.field] = boundComp;
    }
  } // function - startComponent

  /**
   * Ingest
   */
  public ingest() {

    this.ingestionStatus = {progress: 0, message: '', step: 1};
    this.isShowProgress = true;

    this._ingestResultFilters = this.essentialFilters.map(item => this._compMap[item.field].getData());
    let filterParams: Filter[] = _.cloneDeep(this._ingestResultFilters);

    // 필터 설정
    for (let filter of filterParams) {
      filter = FilterUtil.convertToServerSpec(filter);
      if ('include' === filter.type && filter['candidateValues']) {
        delete filter['candidateValues'];
      }
    }

    // 값이 없는 측정값 필터 제거
    filterParams = filterParams.filter(item => {
      if ('bound' === item.type) {
        // Measure Filter
        return null !== item['min'];
      } else if ('include' === item.type) {
        // Dimension Filter
        return (item['valueList'] && 0 < item['valueList'].length);
      } else {
        // Time Filter ( TimeAllFilter 를 제외한 나머지 필터 )
        return !FilterUtil.isTimeAllFilter(item);
      }
    });

    this.checkAndConnectWebSocket(true).then(() => {
      this.safelyDetectChanges();
      this.dataSourceService.createLinkedDatasourceTemporary(this._dataSourceId, filterParams)
        .then(result => {
          if (result['progressTopic']) {
            this.safelyDetectChanges();
            this._processIngestion(result);
          } else {
            this._loadTempDatasourceDetail(result['id']);
          }
        })
        .catch(err => {
          console.error(err);
          this.ingestionStatus.step = -1;
          this.ingestionStatus.progress = -1;
          this.commonExceptionHandler(err, this.translateService.instant('msg.board.alert.fail.ingestion'));
        });
    });

  } // function - ingest

  public closeProgress() {
    this.isShowProgress = false;
    if( 0 === this.essentialFilters.length ) {
      this.closeEvent.emit();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * candidate용 파라미터
   * @param {Filter[]} filters
   * @param {Filter} filter
   * @param {BoardDataSource} dataSource
   * @return {any}
   */
  private _getCandidateParam(filters: Filter[], filter: Filter, dataSource: BoardDataSource): any {

    const param: any = {};
    param.dataSource = DashboardUtil.getDataSourceForApi(_.cloneDeep(dataSource));
    param.filters = (filters) ? _.cloneDeep(filters) : [];
    param.filters = param.filters
      .map(item => FilterUtil.convertToServerSpec(item))
      .filter(item => !(item.type === 'bound' && item['min'] == null));

    if (filter.type === 'include') {
      param.targetField = {
        alias: filter.field,
        name: filter.field,
        type: 'dimension'
      };
    } else if (FilterUtil.isTimeFilter(filter)) {
      const timeFilter: TimeFilter = <TimeFilter>filter;
      param.targetField = {
        type: 'timestamp',
        name: timeFilter.field,
        alias: timeFilter.field,
        format: {
          type: 'time_continuous',
          discontinuous: FilterUtil.isDiscontinuousTimeFilter(timeFilter),
          unit: timeFilter.timeUnit,
          filteringType: FilterUtil.isTimeListFilter(timeFilter) ? FilteringType.LIST : FilteringType.RANGE
        }
      };
      (timeFilter.byTimeUnit) && (param.targetField.format.byUnit = timeFilter.byTimeUnit);
      param.sortBy = 'VALUE';
    }

    return param;
  } // function - _getCandidateParam

  /**
   * 필수 필터를 셋팅한다
   * @param {Field[]} fields
   * @return {Filter[]}
   * @private
   */
  private _setEssentialFilters(fields: Field[]) {
    let filters: Filter[] = [];
    let timeFilter: Filter;
    // 필수 필터 설정
    fields.forEach((field: Field) => {
      if (field.filtering) {
        if (FieldRole.DIMENSION === field.role) {
          if (field.logicalType === LogicalType.TIMESTAMP) {
            filters.push(FilterUtil.getTimeRangeFilter(field, TimeUnit.NONE, 'essential'));
          } else {
            const inclusionFilter: InclusionFilter = FilterUtil.getBasicInclusionFilter(field, 'essential');
            // 정렬을 위함 임시정보 설정
            inclusionFilter['showSortLayer'] = false;
            filters.push(inclusionFilter);
          }
        } else if (FieldRole.MEASURE === field.role) {
          filters.push(FilterUtil.getBasicBoundFilter(field, 'essential'));
        }
      }
    });

    filters.sort((a: Filter, b: Filter) => a.ui.filteringSeq - b.ui.filteringSeq);
    (timeFilter) && (filters.unshift(timeFilter));

    return filters;
  } // function - _setEssentialFilters

  /**
   * 리커멘드 필터 재설정
   * @param {Filter[]} filters
   * @param {number} idx
   * @returns {Promise}
   */
  private _setEssentialFilter(filters: Filter[], idx: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      let index = idx;
      // 값을 변경할 필터
      const filter = _.cloneDeep(this.essentialFilters[index]);

      // console.info('>>>>>> filters', filters);
      // console.info('>>>>>> filter', filter);
      // console.info('>>>>>> this._dataSource', this._dataSource);

      let params: any = this._getCandidateParam(filters, filter, this._dataSource);

      // candidate 서비스 요청
      this.dataSourceService.getCandidate(params).then((result) => {

        // 결과데이터로 필터에 값 셋팅
        if ('include' === filter.type) {
          if (result && result.length > 0) {

            const apiFieldName: string = filter.field.replace(/(\S+\.)\S+/gi, '$1field');
            result = result.map(item => {
              return { 'field': item[apiFieldName], 'count': item['.count'] };
            });

            if (result[0].field) (<InclusionFilter>filter).valueList = [result[0].field];
            else (<InclusionFilter>filter).valueList = [result[0][filter.field]];
          } else {
            (<InclusionFilter>filter).valueList = [];
          }
          this.essentialFilters[index]['candidateValues'] = result;
        } else if ('bound' === filter.type) {
          this._setBoundFilter(this.essentialFilters[index], result[0]);
        } else {
          this._setTimeFilter(this.essentialFilters[index], result[0]);
        }

        // api용 파라미터 filters에 현재 필터 추가
        filters.push(filter);
        index = index + 1;

        // 다음 필터가 없거나 일반 필터일 경우 종료
        if (this.essentialFilters.length <= index) {
          // console.info('>>>>>>>>> end');
          resolve(result);
        } else {
          // console.info('>>>>>>>>> recurrsive');
          // 아닐경우 재귀
          this._setEssentialFilter(filters, index).then(result => resolve(result));
        }
      }).catch((error) => {
        reject(error);
      });
    });
  } // function - _setEssentialFilter

  // noinspection JSMethodCanBeStatic
  /**
   * BoundFilter Candidate 결과 처리
   * @param {Filter} filter
   * @param result
   * @private
   */
  private _setBoundFilter(filter: Filter, result: any) {
    const boundFilter = <BoundFilter>filter;
    if (result && result.hasOwnProperty('maxValue')) {
      if ((boundFilter.min === 0 && boundFilter.max === 0) || boundFilter.min == null) {
        boundFilter.min = result.minValue;
        boundFilter.max = result.maxValue;
      }
      boundFilter.maxValue = result.maxValue;
      boundFilter.minValue = result.minValue;
    } else {
      boundFilter.min = null;
      boundFilter.max = null;
      boundFilter.maxValue = null;
      boundFilter.minValue = null;
    }
  } // function - _setBoundFilter

  // noinspection JSMethodCanBeStatic
  /**
   * TimeFilter Candidate 결과 처리
   * @param {Filter} filter
   * @param result
   */
  private _setTimeFilter(filter: Filter, result: any) {
    const rangeFilter: TimeRangeFilter = <TimeRangeFilter>filter;
    if (rangeFilter.intervals == null || rangeFilter.intervals.length === 0) {
      rangeFilter.intervals = [result.minTime + '/' + result.maxTime];
    }
  } // function - _setTimeFilter

  /**
   * Reingestion 진행
   * @param {any} tempDsInfo
   * @private
   */
  private _processIngestion(tempDsInfo: { id: string, progressTopic: string }) {
    // id: "TEMP-c5a839ae-f8a7-41e0-93f6-86e487f68dbd"
    // progressTopic : "/topic/datasources/TEMP-c5a839ae-f8a7-41e0-93f6-86e487f68dbd/progress"
    try {
      const headers: any = {'X-AUTH-TOKEN': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)};
      // 메세지 수신
      const subscription = CommonConstant.stomp.watch( tempDsInfo.progressTopic )
        .subscribe( (msg: Message) => {

          const data: { progress: number, message: string } = JSON.parse( msg.body );

          if (-1 === data.progress) {
            this.ingestionStatus = data;
            this.ingestionStatus.step = -1;
            Alert.error(data.message);
            this.safelyDetectChanges();
            subscription.unsubscribe();     // Socket 응답 해제
          } else if (100 === data.progress) {
            this.ingestionStatus = data;
            this.safelyDetectChanges();
            subscription.unsubscribe();     // Socket 응답 해제
            this._loadTempDatasourceDetail(tempDsInfo.id);
          } else {
            this.ingestionStatus = data;
            this.ingestionStatus.step = 2;
            this.safelyDetectChanges();
          }
        }, headers);
    } catch (e) {
      console.info(e);
    }
  } // function - _processIngestion

  /**
   * 임시 데이터소스 상세정보를 불러온 후 화면을 닫는다.
   * @param {string} tempDsId
   * @private
   */
  private _loadTempDatasourceDetail(tempDsId: string) {
    this.dataSourceService.getDatasourceDetail(tempDsId).then((ds: Datasource) => {
      setTimeout(() => {
        // Success 를 1초간 보여주기 위해 지연코드 추가함
        this.done.emit({id: tempDsId, info: ds, dataSourceId: this._dataSourceId, filters: this._ingestResultFilters});
      }, 1000);
      (this.ingestionStatus) && (this.ingestionStatus.step = 10);  // 프로그레스 표시를 위해 변경
      this.safelyDetectChanges();
    }).catch(err => {
      this.commonExceptionHandler(err, this.translateService.instant('msg.board.alert.fail.ingestion'));
      if (this.ingestionStatus) {
        // 프로그레스 표시를 위해 변경
        this.ingestionStatus.progress = -1;
        this.ingestionStatus.step = -1;
      }
    });
  } // function - _loadTempDatasourceDetail

  /**
   * 필드를 구분하여 나눈다. (Dimension, Measure)
   * @param {Field[]} fields
   * @private
   */
  private _setFields(fields: Field[]) {
    let fieldList: Field[] = _.cloneDeep(fields);
    if (!fieldList) {
      fieldList = [];
    }
    this.fields = [];
    this.fields = this.fields
      .concat(fieldList.filter(item => item.role !== FieldRole.MEASURE))
      .concat(fieldList.filter(item => item.role === FieldRole.MEASURE));
  } // function - _setFields

  /**
   * 필드명으로 필드 조회
   */
  private _getField(fieldName: string, ref: string): Field {

    const fields = this.fields;

    let field: Field;

    // 필드 조회
    let idx = -1;
    if (ref) idx = _.findIndex(fields, {ref, name: fieldName});
    else idx = _.findIndex(fields, {name: fieldName});

    if (idx > -1) field = fields[idx];

    return field;
  } // function - _getField

  /**
   * 서버스펙을 UI스펙으로 변경
   * @param {Filter[]} filters
   */
  private _convertServerSpecToUISpec(filters: Filter[]) {
    filters.forEach((filter: Filter) => {
      if (filter.type === 'include') {
        this._convertInclusionSpecToUI(filter);
      }
    });
  } // function - _convertServerSpecToUISpec

  /**
   * Inclusion Filter 의 서버스펙을 UI 스펙으로 변경함
   * @param {Filter} filter
   * @return {InclusionFilter}
   */
  private _convertInclusionSpecToUI(filter: Filter): InclusionFilter {

    const includeFilter: InclusionFilter = <InclusionFilter>filter;

    let condition: MeasureInequalityFilter = new MeasureInequalityFilter();
    let limitation: MeasurePositionFilter = new MeasurePositionFilter();
    let wildcard: WildCardFilter = new WildCardFilter();

    // 필터 구분
    includeFilter.preFilters.forEach((preFilter: AdvancedFilter) => {
      if (preFilter.type === 'measure_inequality') condition = <MeasureInequalityFilter>preFilter;
      else if (preFilter.type === 'measure_position') limitation = <MeasurePositionFilter>preFilter;
      else if (preFilter.type === 'wildcard') wildcard = <WildCardFilter>preFilter;
    });

    this._setUIItem(this.aggregationTypeList, condition, 'aggregationType');
    this._setUIItem(this.aggregationTypeList, limitation, 'aggregationType');
    this._setUIItem(this.conditionTypeList, condition, 'inequality');
    this._setUIItem(this.limitTypeList, limitation, 'position');
    this._setUIItem(this.wildCardTypeList, wildcard, 'contains');

    // MeasureFields
    this.summaryMeasureFields.forEach((item) => {
      if (item.name === condition.field) condition.field = item.name;
      if (item.name === limitation.field) limitation.field = item.name;
    });

    // selector 변경
    includeFilter.selectionRange = includeFilter.selector.toString().split('_')[0];
    includeFilter.selectionComponent = includeFilter.selector.toString().split('_')[1];

    return includeFilter;
  } // function - _convertInclusionSpecToUI

  /**
   * UI 아이템 설정
   * @param list
   * @param uiItem
   * @param {string} key
   * @private
   */
  private _setUIItem(list: any, uiItem: any, key: string) {
    list.forEach((item) => {
      if (item.value === uiItem[key]) {
        uiItem[key + 'UI'] = item;
      }
    });
  } // function - _setUIItem

}
