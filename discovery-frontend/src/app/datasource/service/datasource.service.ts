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

import {Injectable, Injector} from '@angular/core';
import {AbstractService} from '../../common/service/abstract.service';
import {Page} from '../../domain/common/page';
import {CommonUtil} from '../../common/util/common.util';
import {MapDataSource, SearchQueryRequest} from '../../domain/datasource/data/search-query-request';

import * as _ from 'lodash';
import {PageWidgetConfiguration} from '../../domain/dashboard/widget/page-widget';
import {
  ChartType, ShelveFieldType, GridViewType, LineMode, ShelfType, FormatType, LayerViewType
} from '../../common/component/chart/option/define/common';
import {Filter} from '../../domain/workbook/configurations/filter/filter';
import {UILineChart} from '../../common/component/chart/option/ui-option/ui-line-chart';
import {UIGridChart} from '../../common/component/chart/option/ui-option/ui-grid-chart';
import {FilterUtil} from '../../dashboard/util/filter.util';
import {InclusionFilter} from '../../domain/workbook/configurations/filter/inclusion-filter';
import {BoardDataSource, Dashboard} from '../../domain/dashboard/dashboard';
import {Datasource, Field, FieldFormat, FieldFormatType, LogicalType} from '../../domain/datasource/datasource';
import {MeasureInequalityFilter} from '../../domain/workbook/configurations/filter/measure-inequality-filter';
import {AdvancedFilter} from '../../domain/workbook/configurations/filter/advanced-filter';
import {MeasurePositionFilter} from '../../domain/workbook/configurations/filter/measure-position-filter';
import {WildCardFilter} from '../../domain/workbook/configurations/filter/wild-card-filter';
import {CustomField} from '../../domain/workbook/configurations/field/custom-field';
import {TimeFilter} from '../../domain/workbook/configurations/filter/time-filter';
import {FilteringType} from '../../domain/workbook/configurations/field/timestamp-field';
import {TimeCompareRequest} from '../../domain/datasource/data/time-compare-request';
import {isNullOrUndefined} from 'util';
import {DashboardUtil} from '../../dashboard/util/dashboard.util';
import {GeoBoundaryFormat, GeoField, GeoHashFormat} from '../../domain/workbook/configurations/field/geo-field';
import {UIMapOption} from '../../common/component/chart/option/ui-option/map/ui-map-chart';
import {ChartUtil} from '../../common/component/chart/option/util/chart-util';
import {CommonConstant} from "../../common/constant/common.constant";
import {UITileLayer} from '../../common/component/chart/option/ui-option/map/ui-tile-layer';
import {MapLayerType} from '../../common/component/chart/option/define/map/map-common';
import {Pivot} from "../../domain/workbook/configurations/pivot";
import {TimezoneService} from "../../data-storage/service/timezone.service";
import {Shelf} from "../../domain/workbook/configurations/shelf/shelf";
import {RegExprFilter} from "../../domain/workbook/configurations/filter/reg-expr-filter";
import {SpatialFilter} from "../../domain/workbook/configurations/filter/spatial-filter";
import {TranslateService} from "@ngx-translate/core";
import {Criteria} from "../../domain/datasource/criteria";

@Injectable()
export class DatasourceService extends AbstractService {

  private _useMetaDataQuery: boolean = false;

  private _timezoneSvc: TimezoneService;

  private _translateSvc: TranslateService;

  constructor(protected injector: Injector) {
    super(injector);
    this._timezoneSvc = this.injector.get(TimezoneService);
    this._translateSvc = this.injector.get(TranslateService);
  }

  /**
   * 데이터 소스 목록
   * @param {string} workspaceId
   * @param page
   * @param {string} projection
   * @param {Object} options 파라미터
   * @returns {Promise<any>}
   */
  public getDatasources(workspaceId: string, page: Page, projection: string = 'default', options?: Object): Promise<any> {
    let url = this.API_URL + `workspaces/${workspaceId}/datasources?projection=${projection}`;

    url += '&' + CommonUtil.objectToUrlString(page);

    if (options) {
      url += '&' + CommonUtil.objectToUrlString(options);
    }

    return this.get(url);
  }


  /**
   * 데이터 소스 summary
   * @param {string} datasorceId
   * @returns {Promise<any>}
   */
  public getDatasourceSummary(datasorceId: string) {
    const url = this.API_URL + `datasources/${datasorceId}?projection=forDetailView`;

    return this.get(url);
  }

  public getDatasourceQuery(options: any) {
    const url = this.API_URL + 'datasources/query/search';

    return this.post(url, options);
  }

  /**
   * 데이터 소스간 유사도 정보를 가져옵니다. similarity 가 높은 순으로 리스트 형태로 전달합니다.
   * @param {string} dataSourceName
   * @param {string} compareDataSourceName
   * @returns {Promise<any>}
   */
  public getDatasourceSimilarity(dataSourceName: string, compareDataSourceName: string): Promise<any> {
    const url = this.API_URL + `datasources/query/similarity`;
    const params = {
      dataSources: [dataSourceName, compareDataSourceName]
    };

    return this.post(url, params);
  }

  /**
   * 쿼리 전송
   * @param {SearchQueryRequest} query
   * @returns {Promise<any>}
   */
  public searchQuery(query: SearchQueryRequest): Promise<any> {
    // let params: any = {type:'spatial_bbox', field:'cell_point', lowerCorner: '129.444 38.444', upperCorner: '129.888 38.999', dataSource: 'cei_m1_b'};
    // let params: any = {type:'spatial_bbox', field:'cell_point', lowerCorner: '38.444 129.444', upperCorner: '38.999 129.888', dataSource: 'cei_m1_b'};

    // query.filters.push(params);

    return this.post(this.API_URL + 'datasources/query/search', query);
  } // function - searchQuery

  /**
   * KPI: 비교기간 쿼리 전송
   * @param {SearchQueryRequest} query
   * @returns {Promise<any>}
   */
  public timeCompareQuery(query: TimeCompareRequest): Promise<any> {
    return this.post(this.API_URL + 'datasources/query/search/time_compare', query);
  } // function - searchQuery

  /**
   * 후보값 조회
   * @param params
   * @returns {Promise<any>}
   */
  public getCandidate(params): Promise<any> {
    return this.post(this.API_URL + 'datasources/query/candidate', params);
  } // function - getCandidate

  /**
   * 필터의 후보값 조회
   * @param {Filter} filter
   * @param {Dashboard} board
   * @param {Filter[]} filters
   * @param {Field | CustomField} field
   * @param {string} sortBy
   * @param {string} searchWord
   * @returns {Promise<any>}
   */
  public getCandidateForFilter(filter: Filter, board: Dashboard,
                               filters?: Filter[], field?: (Field | CustomField), sortBy?: string, searchWord?: string): Promise<any> {

    const param: any = {};
    param.dataSource = DashboardUtil.getDataSourceForApi(
      _.cloneDeep(FilterUtil.getBoardDataSourceForFilter(filter, board))
    );
    param.filters = (filters && 0 < filters.length) ? _.cloneDeep(filters) : FilterUtil.getEssentialFilters(board, filter);
    param.filters = param.filters
      .map(item => FilterUtil.convertToServerSpec(item))
      .filter(item => !(item.type === 'bound' && item['min'] == null));

    if (FilterUtil.isTimeFilter(filter)) {
      const timeFilter: TimeFilter = <TimeFilter>filter;
      if (CommonConstant.COL_NAME_CURRENT_DATETIME === timeFilter.field) {
        param.targetField = {granularity: 'ALL', name: CommonConstant.COL_NAME_CURRENT_DATETIME, type: 'timestamp'};
      } else {
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
        param.sortBy = (sortBy) ? sortBy : 'COUNT';
      }

      // Timestamp Filter
      param.targetField.type = 'timestamp';
    } else {

      // 필드 설정
      if (isNullOrUndefined(field)) {
        board.dataSources.some(ds => {
          if (ds.engineName === filter.dataSource) {
            return ds.fields.some(dsField => {
              if (dsField.name === filter.field) {
                field = dsField;
                return true;
              } else {
                return false;
              }
            });
          }
        });
      }

      param.targetField = {alias: field.alias, name: field.name};
      if ('user_expr' === field.type) {
        param.targetField.ref = 'user_defined';
      } else if (field.ref) {
        param.targetField.ref = field.ref;
      }

      (board.configuration.customFields) && (param.userFields = board.configuration.customFields);

      // 조회 정보 및 필드 추가 정보 설정
      if ('include' === filter.type) {
        // Dimension Filter
        const tempFilters: Filter[] = [];
        if (((<InclusionFilter>filter).preFilters)) {
          (<InclusionFilter>filter).preFilters.filter((preFilter: AdvancedFilter) => {
            if (preFilter.type === 'measure_inequality') {
              const condition: MeasureInequalityFilter = <MeasureInequalityFilter>preFilter;
              if (condition.inequality && condition.aggregation && condition.field && 0 < condition.value) {
                tempFilters.push(FilterUtil.convertToServerSpec(condition));
              }
            } else if (preFilter.type === 'measure_position') {
              const limitation: MeasurePositionFilter = <MeasurePositionFilter>preFilter;
              if (limitation.position && limitation.aggregation && limitation.field && 0 < limitation.value) {
                tempFilters.push(FilterUtil.convertToServerSpec(limitation));
              }
            } else if (preFilter.type === 'wildcard') {
              const wildcard: WildCardFilter = <WildCardFilter>preFilter;
              if (wildcard.contains && wildcard.value && wildcard.value.length > 0) {
                tempFilters.push(FilterUtil.convertToServerSpec(wildcard));
              }
            } else if (preFilter.type === 'regexpr') {
              const regExpr: RegExprFilter = <RegExprFilter>preFilter;
              if (regExpr.expr) {
                tempFilters.push(FilterUtil.convertToServerSpec(regExpr));
              }
            }
          });
        }
        param.filters = param.filters.concat(tempFilters);
        (param.targetField) && (param.targetField.type = 'dimension');

        param.sortBy = (sortBy) ? sortBy : 'COUNT';
        param.searchWord = (searchWord) ? searchWord : '';
        param.limit = FilterUtil.CANDIDATE_LIMIT;

      } else if ('bound' === filter.type) {
        // Measure Filter
        if (param.targetField) {
          param.targetField.aggregationType = 'NONE';
          param.targetField.type = 'measure';
        }
      }

    }

    // 값이 없는 측정값 필터 제거
    param.filters = param.filters.filter(item => !(item.type === 'bound' && item['min'] == null));

    // valueAlias 설정
    param.valueAliasRef = board.id;

    return this.post(this.API_URL + 'datasources/query/candidate', param);
  } // function - getCandidateForFilter

  /**
   * 차트 데이터를 조회하긴 위한 쿼리 생성
   * @param {PageWidgetConfiguration} pageConf
   * @param {Field[]} dataSourceFields
   * @param {{url: string, dashboardId: string, widgetId?: string}} context
   * @param resultFormatOptions
   * @param {boolean} isChartData
   * @returns {SearchQueryRequest}
   */
  public makeQuery(pageConf: PageWidgetConfiguration,
                   dataSourceFields: Field[],
                   context: { url: string, dashboardId: string, widgetId?: string },
                   resultFormatOptions?: any, isChartData?: boolean): SearchQueryRequest {
    const query: SearchQueryRequest = new SearchQueryRequest();

    // 호출 추적 정보 등록
    query.context = {
      'discovery.route.uri': context.url,
      'discovery.dashboard.id': context.dashboardId
    };
    (context.widgetId) && (query.context['discovery.widget.id'] = context.widgetId);

    if (pageConf.hasOwnProperty('customFields')) {
      query.userFields = pageConf['customFields'];
    }

    query.filters = _.cloneDeep(pageConf.filters);
    query.pivot = _.cloneDeep(pageConf.pivot);

    let allPivotFields = [];

    // datasource 설정 추가
    query.dataSource = _.cloneDeep(pageConf.dataSource);
    delete query.dataSource['fields']; // 불필요 항목 제거
    // EngineName 처리
    query.dataSource.name = query.dataSource.engineName;

    // 파라미터 치환
    // set alias list by pivot or shelf list, Datasource setting
    if (_.eq(pageConf.chart.type, ChartType.MAP)) {

      // spatial analysis
      query.analysis = _.cloneDeep((<UIMapOption>pageConf.chart).analysis);

      // alias 설정
      query.shelf = _.cloneDeep(pageConf.shelf);

      let layerNum: number = -1;
      for (let layer of query.shelf.layers) {
        layerNum++;

        // 3번째 layer는 공간연산 layer 이기 떄문에, 미포함
        if(layerNum>1) {
          break;
        }

        // layer name
        query.shelf.layers[layerNum].name = (<UIMapOption>pageConf.chart).layers[layerNum].name;

        allPivotFields = _.concat(layer.fields);
        for (let field of allPivotFields) {

          // Alias 설정
          field['alias'] = this._setFieldAlias(field, dataSourceFields);

          // Dimension 이면서 Timestamp 타입인 필드는 타입을 변경해준다.
          if (field['type'].toUpperCase() == 'TIMESTAMP' && field['subRole'] && field['subRole'].toUpperCase() == 'DIMENSION') {
            field['type'] = 'dimension';
          }

          // 그리드이면서 원본보기일 경우
          if (_.eq(pageConf.chart.type, 'grid') && (<UIGridChart>pageConf.chart).dataType == GridViewType.MASTER) {
            field['aggregationType'] = 'NONE';
          }
        }

        if( allPivotFields.length == 0 ){
          continue;
        }
        // timezone 처리 - S
        {
          const shelfConf: Shelf = query.shelf;
          if (shelfConf.layers && 0 < shelfConf.layers.length) {
            shelfConf.layers[layerNum].fields.forEach(field => {
              if ((LogicalType.TIMESTAMP.toString() === field.type.toUpperCase()
                || LogicalType.TIMESTAMP.toString() === field.subType
                || LogicalType.TIMESTAMP.toString() === field.subRole) && field.format) {
                const dsField: Field = dataSourceFields.find(item => item.name === field.name);
                if (dsField && dsField.format && TimezoneService.DISABLE_TIMEZONE_KEY === dsField.format['timeZone']) {
                  delete field.format['timeZone'];
                  delete field.format['locale'];
                } else {
                  field.format['timeZone'] = this._timezoneSvc.getBrowserTimezone().momentName;
                  field.format['locale'] = this._timezoneSvc.browserLocale;
                }
              }
            });
          }
        }
        // timezone 처리 - E
      } // end for - shelf.layers

      // allPivotFields = _.concat(query.shelf.layers[(<UIMapOption>pageConf.chart).layerNum]);
    } else {

      // timezone 처리 - S
      {
        const pivotConf: Pivot = query.pivot;
        if (pivotConf.columns && 0 < pivotConf.columns.length) {
          pivotConf.columns.forEach(column => {
            if ((LogicalType.TIMESTAMP.toString() === column.type.toUpperCase()
              || LogicalType.TIMESTAMP.toString() === column.subType
              || LogicalType.TIMESTAMP.toString() === column.subRole) && column.format) {
              const dsField: Field = dataSourceFields.find(item => item.name === column.name);
              if (dsField && dsField.format && TimezoneService.DISABLE_TIMEZONE_KEY === dsField.format['timeZone']) {
                delete column.format['timeZone'];
                delete column.format['locale'];
              } else {
                column.format.timeZone = this._timezoneSvc.getBrowserTimezone().momentName;
                column.format.locale = this._timezoneSvc.browserLocale;
              }
            }
          });
        }
        if (pivotConf.rows && 0 < pivotConf.rows.length) {
          pivotConf.rows.forEach(row => {
            if ((LogicalType.TIMESTAMP.toString() === row.type.toUpperCase()
              || LogicalType.TIMESTAMP.toString() === row.subType
              || LogicalType.TIMESTAMP.toString() === row.subRole) && row.format) {
              const dsField: Field = dataSourceFields.find(item => item.name === row.name);
              if (dsField && dsField.format && TimezoneService.DISABLE_TIMEZONE_KEY === dsField.format['timeZone']) {
                delete row.format['timeZone'];
                delete row.format['locale'];
              } else {
                row.format.timeZone = this._timezoneSvc.getBrowserTimezone().momentName;
                row.format.locale = this._timezoneSvc.browserLocale;
              }
            }
          });
        }
      }
      // timezone 처리 - E
      // alias 설정
      allPivotFields = _.concat(query.pivot.columns, query.pivot.rows, query.pivot.aggregations);
      for (let field of allPivotFields) {
        // Alias 설정
        field['alias'] = this._setFieldAlias(field, dataSourceFields);

        // Dimension 이면서 Timestamp 타입인 필드는 타입을 변경해준다.
        if (field['type'].toUpperCase() == 'TIMESTAMP' && field['subRole'] && field['subRole'].toUpperCase() == 'DIMENSION') {
          field['type'] = 'dimension';
        }

        // 그리드이면서 원본보기일 경우
        if (_.eq(pageConf.chart.type, 'grid') && (<UIGridChart>pageConf.chart).dataType == GridViewType.MASTER) {
          field['aggregationType'] = 'NONE';
        }
      }

    }
    if (0 < pageConf.chart.limit) {
      pageConf.limit.limit = pageConf.chart.limit;
    } else {
      pageConf.limit.limit = 100000;
    }
    query.limits = _.cloneDeep(pageConf.limit);

    // Value Alias & Code Table 설정
    {
      query.aliases = [];
      query.aliases.push(
        {
          type: 'value',
          ref: context.dashboardId
        }
      );
      if (this._useMetaDataQuery) {
        const codeTablesFields = dataSourceFields.filter(field => {
          return field.type !== 'user_expr' && field.uiMetaData && field.uiMetaData.codeTable;
        });
        if (0 < codeTablesFields.length) {
          query.aliases.push(
            {
              type: 'code',
              codes: codeTablesFields.reduce((acc, currVal) => {
                acc[currVal.name] = currVal.uiMetaData.codeTable.id;
                return acc;
              }, {})
            }
          );
        }
      } // end if - useMetaDataQuery
    }

    // // size 존재시
    // if( !_.isUndefined(pageConf.chart.size) ) {
    //   query.limits['limit'] = pageConf.chart.size;
    // }

    // network 차트와 sankey 차트는 resultFormat 사용안함
    if (!_.eq(pageConf.chart.type, 'network') && !_.eq(pageConf.chart.type, 'sankey')) {
      query.resultFormat = {
        type: 'chart',
        mode: pageConf.chart.type,
        options: {
          addMinMax: true
        },
        columnDelimeter: '―'
      };

      if (!_.eq(pageConf.chart.type, 'grid')) {
        query.resultFormat.options['showCategory'] = true;   // 데이터 라벨에서 사용, 카테고리값 표시여부
        query.resultFormat.options['showPercentage'] = true; // 데이터 라벨에서 사용, 퍼센티지값 표시여부
      }

      // series unitType이 있는경우 설정 추가
      // if (pageConf.chart['unitType']) {
      //
      //   // percent인 경우 ture, 아니면 false값 설정
      //   query.resultFormat.options.replacePercentile = (DataUnit.PERCENT === pageConf.chart['unitType']);
      // }

      // line / control 차트의 경우 isCumulative 설정 넣어준다
      if (ChartType.LINE === pageConf.chart.type || ChartType.CONTROL === pageConf.chart.type) {

        // accumulate 설정
        query.resultFormat.options.isCumulative = _.eq(LineMode.CUMULATIVE, (<UILineChart>pageConf.chart).lineMode);
      }

      // Grid 차트 원본보기일 경우 설정추가
      if (ChartType.GRID === pageConf.chart.type) {

        if (_.eq((<UIGridChart>pageConf.chart).dataType, GridViewType.MASTER)) {
          // 옵션 변경
          query.resultFormat.options.isOriginal = true;
        } else {
          delete query.resultFormat.options.isOriginal;
        }
      }
    }
    // sankey 차트일때 resultFormat
    else if (_.eq(pageConf.chart.type, 'sankey')) {
      query.resultFormat = {
        type: 'graph'
      };
    }
    // network 차트일때 resultFormat
    else if (_.eq(pageConf.chart.type, 'network')) {
      query.resultFormat = {
        type: 'graph',
        useLinkCount: true,
        mergeNode: true
      };
    }

    // map 차트일때 shelf
    if (_.eq(pageConf.chart.type, ChartType.MAP)) {

      let geoFieldArr: number[] = [];

      // check multiple geo type
      for (let idx = 0; idx < query.shelf.layers.length; idx++) {
        let geoFieldCnt: number = 0;
        for (let column of query.shelf.layers[idx].fields) {
          if (column && column.field && column.field.logicalType && (-1 !== column.field.logicalType.toString().indexOf('GEO'))) {
            geoFieldCnt++;
          }
        }
        geoFieldArr.push(geoFieldCnt);
      }


      // set current layer values
      for (let idx = 0; idx < query.shelf.layers.length; idx++) {
        for (let layer of query.shelf.layers[idx].fields) {

          // when it's measure
          if ('measure' === layer.type) {

            // add aggregation type
            layer.aggregationType = layer.aggregationType;

            // when it's dimension
          } else if ('dimension' === layer.type) {

            let radius = (<UITileLayer>(<UIMapOption>pageConf.chart).layers[idx]).radius;

            // to make reverse (bigger radius => set small precision), get precision from 0 - 100
            let precision = Math.round((100 - radius) / 8.33);

            if (precision > 12) precision = 12;
            if (precision < 1) precision = 1;

            if (layer.field && layer.field.logicalType) {
              // default geo format
              if (layer.field.logicalType && layer.field.logicalType.toString().indexOf('GEO') > -1) {
                layer.format = {
                  type: FormatType.GEO.toString()
                };

                // clustering
                let chart = (<UIMapOption>pageConf.chart);
                if( chart.layers[idx].type == MapLayerType.SYMBOL && chart.layers[idx]['clustering'] ) {

                  // cluster 값 변경
                  let clusterPrecision : number = 6;
                  if(chart['layers'][idx]['changeCoverage']){
                    // cluster coverage 값 변경
                    clusterPrecision = Math.round((100 - chart.layers[idx]['coverage']) / 8.33);
                  } else {
                    // zoom size 변경
                    let zoomSize = chart.zoomSize - 2;
                    clusterPrecision = Math.round((18 + (zoomSize-18)) / 1.5);
                  }

                  if (clusterPrecision > 12) clusterPrecision = 12;
                  if (clusterPrecision < 1) clusterPrecision = 1;

                  query.shelf.layers[idx].view = <GeoHashFormat>{
                    type: LayerViewType.CLUSTERING.toString(),
                    method: "h3",
                    // 0~99 퍼센트 값을 1~12값으로 변환
                    precision: (_.isNaN(clusterPrecision) ? 6 : clusterPrecision)
                  };
                }

                let spatialFilter = new SpatialFilter();
                spatialFilter.dataSource = query.shelf.layers[idx].ref;
                // spatialFilter.ref = query.shelf.layers[idx].ref;
                spatialFilter.field = layer.field.name;
                // 최초 default 값 sales-geo 초기값으로 고정 (빈값일 경우 에러리턴)
                spatialFilter.lowerCorner = _.isUndefined(chart['lowerCorner']) ? '-123.0998 25.4766' : chart['lowerCorner'];
                spatialFilter.upperCorner = _.isUndefined(chart['upperCorner']) ? '-68.7918 48.7974' : chart['upperCorner'];
                query.filters.push( spatialFilter );
              }

              // when logicalType => geo point
              if (layer.field.logicalType === LogicalType.GEO_POINT) {

                // geo_hash is only used in hexagon
                if (MapLayerType.TILE === (<UIMapOption>pageConf.chart).layers[idx].type) {

                  // 기존 polygon 스펙
                  // layer.format = <GeoHashFormat>{
                  //   type: FormatType.GEO_HASH.toString(),
                  //   method: "geohex",
                  //   precision: precision
                  // };

                  // radius precision 값 변경
                  let chart = (<UIMapOption>pageConf.chart);
                  let radiusPrecision : number = precision;
                  if(chart['layers'][idx]['changeTileRadius']){
                    // radius 값 변경
                    radiusPrecision = precision;
                  } else {
                    // zoom size 변경
                    let zoomSize = chart.zoomSize - 2;
                    radiusPrecision = Math.round((18 + (zoomSize-18)) / 1.5);
                    // radius 값 지정
                    chart['layers'][idx]['changeTileRadius'] = true;
                    chart['layers'][idx]['radius'] = Math.round(100 - (radiusPrecision * 8.33));
                    chart['layers'][idx]['tileRadius'] = chart['layers'][idx]['radius'];
                  }

                  if (radiusPrecision > 12) radiusPrecision = 12;
                  if (radiusPrecision < 1) radiusPrecision = 1;

                  query.shelf.layers[idx].view = <GeoHashFormat>{
                    type: LayerViewType.HASH.toString(),
                    method: "geohex",
                    precision: radiusPrecision
                  };
                }

                // when they have multiple geo values
                if (geoFieldArr[idx] > 1) {
                  layer.format = <GeoBoundaryFormat>{
                    type: FormatType.GEO_BOUNDARY.toString(),
                    geoColumn: query.pivot.columns[0].field.name,
                    descColumn: query.pivot.columns[0].field.name
                  }
                }

                // when polygon, line type
              } else if ((layer.field.logicalType === LogicalType.GEO_POLYGON || layer.field.logicalType === LogicalType.GEO_LINE)) {
                // when they have multiple geo values
                if (geoFieldArr[idx] > 1) {
                  layer.format = {
                    type: FormatType.GEO_JOIN.toString()
                  }
                }
              }
            }
          }
        } // end for (layer)
      } // end for (layers)


      query.shelf = {
        type: ShelfType.GEO,
        layers: query.shelf.layers
      };

      //map 은 limit 5000개 제한
      query.limits = {
        limit: 5000,
        sort: null
      }
    }

    if (!_.isEmpty(resultFormatOptions)) {
      query.resultFormat.options = _.extend(query.resultFormat.options, resultFormatOptions);
    }

    // TODO datasource name(ui상 라벨) 을 query 시에는 engineName으로 변경 해야함
    // 현재 join 했을 때의 engineName으로 밖에 없음, 필요시 추가요청 해야함
    if (!isChartData && query.dataSource.type === 'mapping') {

      query.dataSource['joins'].forEach((join) => {
        join.name = join.engineName;
      });
    }
    // else if( isChartData && query.dataSource.type === 'mapping' ) {
    //   query.dataSource['joins'].forEach((join1) => {
    //     join1.joinAlias = join1.name;
    //     join1.joins.forEach((join2) => {
    //       join2.joinAlias = join2.name;
    //     });
    //   });
    // }

    // value alias 지정한경우 value alias로 가져오게 설정
    // query.valueAliasRef = context.dashboardId;

    return query;
  } // function - makeQuery

  // 데이터스토리지 데이터소스 조회
  public getAllDatasource(param: any, projection: string = 'forListView'): Promise<any> {
    let url = this.API_URL + 'datasources';

    if (param) {
      url += '?' + CommonUtil.objectToUrlString(param);
    }

    return this.get(url + `&projection=${projection}`);
  }

  // 데이터소스 삭제
  public deleteDatasource(datasourceId: string): Promise<any> {
    return this.delete(this.API_URL + `datasources/${datasourceId}`);
  }

  // 데이터소스 생성
  public createDatasource(param: any): Promise<any> {
    return this.post(this.API_URL + 'datasources', param);
  }

  // 데이터소스 생성
  public createDatasourceTemporary(param: any): Promise<any> {
    return this.post(this.API_URL + 'datasources/temporary', param);
  }

  /**
   * 저장된 Linked 데이터 소스 정보를 기반으로 임시 데이터 소스를 생성합니다.
   * @param {string} dataSourceId
   * @param {Filter[]} param
   * @param {boolean} async
   */
  public createLinkedDatasourceTemporary(dataSourceId: string, param?: Filter[], async: boolean = true) {
    return this.post(this.API_URL + `datasources/${dataSourceId}/temporary?async=${async}`, param);
  } // function - createLinkedDatasourceTemporary

  // 데이터소스 수정
  public updateDatasource(datasourceId: string, param: any): Promise<any> {
    return this.patch(this.API_URL + 'datasources/' + datasourceId, param);
  }

  // 데이터소스 상세
  public getDatasourceDetail(datasourceId: string, includeUnloadedField?: boolean): Promise<any> {
    const url = this.API_URL + (includeUnloadedField ? `datasources/${datasourceId}?projection=forDetailView&includeUnloadedField=${includeUnloadedField}` : `datasources/${datasourceId}?projection=forDetailView`);
    return this.get(url);
  }

  /**
   * timestamp 포맷 체크
   * @param param
   * @returns {Promise<any>}
   */
  public checkValidationDateTime(param: any): Promise<any> {
    return this.post(this.API_URL + 'datasources/validation/datetime', param);
  }

  /**
   * Check valid date time format in field
   * @param {Field} field
   * @param {string[]} fieldDataList
   * @param {boolean} isInitValid
   * @return {Promise<any>}
   */
  public checkValidDateTimeFormatInField(field: Field, fieldDataList: string[], isInitValid?: boolean): Promise<any> {
    const params: {samples: string[], format?: string} = {
      samples: fieldDataList.slice(0,19)
    };
    // if not exist format in field, init format
    (!field.format) && (field.format = new FieldFormat());
    // if not init valid, set format in params
    (!isInitValid) && (params.format = field.format.format);
    return new Promise<any>((resolve, reject) => {
      this.post(this.API_URL + 'datasources/validation/datetime', params)
        .then((result: {valid?: boolean, pattern?: string}) =>{
          // if valid or exist pattern
          if (result.valid || result.pattern) {
            // set time format valid TRUE
            field.isValidTimeFormat = true;
            // if exist pattern, set time format in field
            (result.pattern) && (field.format.format = result.pattern);
            // if enable timezone, set browser timezone at field
            if (this._timezoneSvc.isEnableTimezoneInDateFormat(field.format)) {
              !field.format.timeZone && (field.format.timeZone = this._timezoneSvc.getBrowserTimezone().momentName);
              field.format.locale = this._timezoneSvc.browserLocale;
            } else { // if not enable timezone
              field.format.timeZone = TimezoneService.DISABLE_TIMEZONE_KEY;
            }
          } else { // invalid
            // set time format valid FALSE
            field.isValidTimeFormat = false;
            // set time format valid message
            field.timeFormatValidMessage = this._translateSvc.instant('msg.storage.ui.schema.valid.required.match.data');
          }
          // if valid format, set enable time format
          (result.valid) && (field.isValidTimeFormat = true);
          resolve(field);
        })
        .catch((error) => {
          // if init valid, set default time format in field
          (isInitValid) && (field.format.format = 'yyyy-MM-dd');
          // set time format valid FALSE
          field.isValidTimeFormat = false;
          // set time format valid message
          field.timeFormatValidMessage = this._translateSvc.instant('msg.storage.ui.schema.valid.required.match.data');
          reject(field);
        });
    });
  }

  /**
   * cron validation 체크
   * @param param
   * @returns {Promise<any>}
   */
  public checkValidationCron(param: any): Promise<any> {
    let url = this.API_URL + 'datasources/validation/cron';
    if (param) {
      url += '?' + CommonUtil.objectToUrlString(param);
    }
    return this.post(url, null);
  }

  /**
   * 현재 데이터소스에 워크스페이스 연결
   * @param {string} datasourceId
   * @param param
   * @returns {Promise<any>}
   */
  public addDatasourceWorkspaces(datasourceId: string, param: any): Promise<any> {
    const connIds = param.map((id) => {
      return '/api/workspaces/' + id;
    }).join('\n');
    return this.patch(this.API_URL + `datasources/${datasourceId}/workspaces`, connIds, 'text/uri-list');
  }

  /**
   * 현재 데이터소스에 연결된 워크스페이스 제거
   * @param {string} datasourceId
   * @param param
   * @returns {Promise<any>}
   */
  public deleteDatasourceWorkspaces(datasourceId: string, param: any): Promise<any> {
    const connIds = param.map((connection) => {
      return connection;
    }).join(',');
    return this.delete(this.API_URL + `datasources/${datasourceId}/workspaces/${connIds}`);
  }

  /**
   * Covariance 조회 (측정값만 가능)
   * @param params
   * @returns {Promise<any>}
   */
  public getFieldCovariance(params: any): Promise<any> {
    return this.post(this.API_URL + 'datasources/covariance', params);
  }

  /**
   * 필드 통계
   * @param params
   * @returns {Promise<any>}
   */
  public getFieldStats(params: any): Promise<any> {
    return this.post(this.API_URL + 'datasources/stats', params);
  }

  /**
   * batch history 조회
   * @param {string} datasourceId
   * @param params
   * @returns {Promise<any>}
   */
  public getBatchHistories(datasourceId: string, params: any): Promise<any> {
    let url = this.API_URL + `datasources/${datasourceId}/ingestion/histories`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  /**
   * 질의 이력 조회
   * @param {string} datasourceId
   * @param params
   * @returns {Promise<any>}
   */
  public getQueryHistories(datasourceId: string, params: any): Promise<any> {
    let url = this.API_URL + `datasources/${datasourceId}/query/histories`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }


  /**
   * 질의 수(트랜잭션) 조회
   * @param {string} datasourceId
   * @returns {Promise<any>}
   */
  public getQueryHistoriesCount(datasourceId: string): Promise<any> {
    let url = this.API_URL + `datasources/${datasourceId}/query/histories/stats/count`;
    return this.get(url);
  }


  /**
   * 용량 추이 조회
   * @param {string} datasourceId
   * @returns {Promise<any>}
   */
  public getHistoriesSize(datasourceId: string): Promise<any> {
    let url = this.API_URL + `datasources/${datasourceId}/histories/size/stats/hour`;
    return this.get(url);
  }

  /**
   * 사용자별 질의 분포
   * @param {string} datasourceId
   * @param {string} duration
   * @returns {Promise<any>}
   */
  public getQueryHistoriesStatsUser(datasourceId: string, duration: string = '-P7D'): Promise<any> {
    let url = this.API_URL + `datasources/${datasourceId}/query/histories/stats/user?duration=${duration}`;
    return this.get(url);
  }

  /**
   * 소요시간별 질의 분포
   * @param {string} datasourceId
   * @param {string} duration
   * @returns {Promise<any>}
   */
  public getQueryHistoriesStatsTime(datasourceId: string, duration: string = '-P7D'): Promise<any> {
    let url = this.API_URL + `datasources/${datasourceId}/query/histories/stats/elapsed?duration=${duration}`;
    return this.get(url);
  }

  /**
   * 데이터소스 파일 조회
   * @param {string} fileKey
   * @param params
   * @returns {Promise<any>}
   */
  public getDatasourceFile(fileKey: string, params: any): Promise<any> {
    let url = this.API_URL + 'datasources/file/' + fileKey + '/data';
    if (params) {
      // 주요 이스케이프 시퀀스에 대한 replace 처리 ( \n, \r, \t )
      const replaceParams = {};
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          replaceParams[key] = (params[key] + '').replace(/\\n/gi, '\n').replace(/\\r/gi, '\r').replace(/\\t/gi, '\t');
        }
      }
      url += '?' + CommonUtil.objectToUrlString(replaceParams);
    }

    return this.getFormData(url);
  }


  /**
   *  import 가능한 메타트론 엔진 데이터소스 리스트 가져오기
   * @returns {Promise<any>}
   */
  public getDatasourceImportableEngineList(): Promise<any> {
    return this.get(this.API_URL + 'datasources/import/datasources');
  }


  /**
   * import 가능한 데이터소스 프리뷰
   * @param {string} engineName
   * @param {Object} params
   * @returns {Promise<any>}
   */
  public getDatasourceImportableEnginePreview(engineName: string, params: object): Promise<any> {
    let url = this.API_URL + `datasources/import/${engineName}/preview`;
    if (params) {
      url += '?' + CommonUtil.objectToUrlString(params);
    }
    return this.get(url);
  }

  /**
   * 데이터소스 import
   * @param {string} engineName
   * @returns {Promise<any>}
   */
  public importDatasource(engineName: string): Promise<any> {
    return this.post(this.API_URL + `datasources/import/${engineName}`, null);
  }

  /**
   * 데이터소스 필드 수정
   * @param {string} datasourceId
   * @param {any} params
   * @returns {Promise<any>}
   */
  public updateDatasourceFields(datasourceId: string, params: any): Promise<any> {
    return this.patch(this.API_URL + `datasources/${datasourceId}/fields`, params);
  }

  /**
   * Ingestion 기본 옵션 조회
   * @param {string} ingestionType
   * @returns {Promise<any>}
   */
  public getDefaultIngestionOptions(ingestionType: string): Promise<any> {
    return this.get(this.API_URL + `datasources/ingestion/options?ingestionType=${ingestionType}`);
  }

  public synchronizeDatasourceFields(datasourceId: string): Promise<any> {
    return this.patch(this.API_URL + `datasources/${datasourceId}/fields/sync`, null);
  }

  /**
   * 데이터소스 적재 로그 조회
   * @param {string} datasourceId
   * @param {string} historyId
   * @param {number} offset
   * @returns {Promise<any>}
   */
  public getDatasourceIngestionLog(datasourceId: string, historyId: string, offset?: number): Promise<any> {
    if (offset) {
      return this.get(this.API_URL + `datasources/${datasourceId}/histories/${historyId}/log?offset=${offset}`);
    } else {
      return this.get(this.API_URL + `datasources/${datasourceId}/histories/${historyId}/log`);
    }
  }


  /**
   * Get criterion list in datasource
   * @return {Promise<any>}
   */
  public getCriterionListInDatasource() {
    return this.get(this.API_URL + 'datasources/criteria');
  }

  /**
   *  Get criterion in datasource
   * @param {Criteria.ListCriterionKey} criterionKey
   * @return {Promise<any>}
   */
  public getCriterionInDatasource(criterionKey: Criteria.ListCriterionKey) {
    return this.get(this.API_URL + `datasources/criteria/${criterionKey}`);
  }

  /**
   * Get datasource list
   * @param {number} page
   * @param {number} size
   * @param {string} sort
   * @param params
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getDatasourceList(page: number, size: number, sort: string, params: any, projection: string = 'forListView'): Promise<any> {
    return this.post(this.API_URL + `datasources/filter?projection=${projection}&page=${page}&size=${size}&sort=${sort}`, params);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 필드 Alias 설정
   * @param field
   * @param {Field[]} dataSourceFields
   * @returns {any}
   * @private
   */
  private _setFieldAlias(field: any, dataSourceFields: Field[]): any {

    if (this._useMetaDataQuery) {
      // 메타데이터 처리
      const dsField: Field
        = dataSourceFields.find(item => item.name === field.name && !isNullOrUndefined(item.uiMetaData));
      (dsField) && (field['logicalName'] = dsField.uiMetaData.name);
    }

    // Alias 처리
    if (ShelveFieldType.MEASURE.toString() === field.type) {    // measure 일때

      // fix set alias without aggregation type
      // if (field['alias'] && field['alias'] !== field.name) {
      //   field['alias'] = field['alias'];
      // } else {
      // aggregation type과 함께 alias 설정
      // const alias: string = field['fieldAlias'] ? field['fieldAlias'] : ( field['logicalName'] ? field['logicalName'] : field['name'] );
      // field['alias'] = field.aggregationType ? field.aggregationType + `(${alias})` : `${alias}`;

      field['alias'] = ChartUtil.getAlias(field);
      // }

    } else if (ShelveFieldType.TIMESTAMP.toString() === field.type) {   // timestamp 일때

      // alias랑 name이 같지않은경우 (alias 변경시 => granularity Type을 alias에 설정하지 않음)
      const alias: string = field['alias'] ? field['alias'] : field['fieldAlias'] ? field['fieldAlias'] : (field['logicalName'] ? field['logicalName'] : field['name']);
      if (alias === field.name) {
        // aggregation type과 함께 alias 설정
        if (field.format && field.format.unit) field['alias'] = (field.format && field.format.unit ? field.format.unit : 'NONE') + `(${alias})`;
      }
    } else {
      field['alias'] = ChartUtil.getAlias(field);
      // field['alias'] = field['alias'] ? field['alias'] : field['fieldAlias'] ? field['fieldAlias'] : ( field['logicalName'] ? field['logicalName'] : field['name'] );
    }

    return field['alias'];
  } // function - _setFieldAlias
}
