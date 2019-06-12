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
  BoardConfiguration,
  BoardDataSource,
  BoardDataSourceRelation,
  Dashboard, JoinMapping,
  LayoutWidgetInfo
} from '../../domain/dashboard/dashboard';
import {Datasource, Field, FieldFormatType, FieldRole} from '../../domain/datasource/datasource';
import {CustomField} from '../../domain/workbook/configurations/field/custom-field';
import {Filter} from '../../domain/workbook/configurations/filter/filter';
import {Widget} from '../../domain/dashboard/widget/widget';
import {isNullOrUndefined, isObject} from 'util';
import {FilterWidget, FilterWidgetConfiguration} from '../../domain/dashboard/widget/filter-widget';
import {PageWidget} from '../../domain/dashboard/widget/page-widget';
import {TextWidget} from '../../domain/dashboard/widget/text-widget';
import {DashboardPageRelation} from '../../domain/dashboard/widget/page-widget.relation';
import {BoardWidgetOptions, WidgetShowType} from '../../domain/dashboard/dashboard.globalOptions';
import {StringUtil} from '../../common/util/string.util';
import {CommonUtil} from '../../common/util/common.util';
import {ChartType} from '../../common/component/chart/option/define/common';
import {CommonConstant} from "../../common/constant/common.constant";
import {ChartUtil} from "../../common/component/chart/option/util/chart-util";
import {FilterUtil} from "./filter.util";
import {MapLayerType} from "../../common/component/chart/option/define/map/map-common";

export class DashboardUtil {

  /**
   * 차트의 아이콘 클래스명 반환
   * @return {string}
   */
  public static getChartIconClass(widget: PageWidget): string {
    let iconClass: string = '';
    switch (widget.configuration.chart.type) {
      case ChartType.BAR :
        iconClass = 'ddp-chart-bar';
        break;
      case ChartType.LINE :
        iconClass = 'ddp-chart-linegraph';
        break;
      case ChartType.GRID :
        iconClass = 'ddp-chart-table';
        break;
      case ChartType.SCATTER :
        iconClass = 'ddp-chart-scatter';
        break;
      case ChartType.HEATMAP :
        iconClass = 'ddp-chart-heatmap';
        break;
      case ChartType.PIE :
        iconClass = 'ddp-chart-pie';
        break;
      case ChartType.MAP :
        iconClass = 'ddp-chart-map';
        break;
      case ChartType.CONTROL :
        iconClass = 'ddp-chart-cont';
        break;
      case ChartType.LABEL :
        iconClass = 'ddp-chart-kpi';
        break;
      case ChartType.LABEL2 :
        iconClass = 'ddp-chart-kpi';
        break;
      case ChartType.BOXPLOT :
        iconClass = 'ddp-chart-boxplot';
        break;
      case ChartType.WATERFALL :
        iconClass = 'ddp-chart-waterfall';
        break;
      case ChartType.WORDCLOUD :
        iconClass = 'ddp-chart-wordcloud';
        break;
      case ChartType.COMBINE :
        iconClass = 'ddp-chart-combo';
        break;
      case ChartType.TREEMAP :
        iconClass = 'ddp-chart-treemap';
        break;
      case ChartType.RADAR :
        iconClass = 'ddp-chart-radar';
        break;
      case ChartType.NETWORK :
        iconClass = 'ddp-chart-network';
        break;
      case ChartType.SANKEY :
        iconClass = 'ddp-chart-sankey';
        break;
      case ChartType.GAUGE :
        iconClass = 'ddp-chart-bar';
        break;
    }
    return iconClass;
  } // function - getChartIconClass

  /**
   * 생성/수정 시 대시보드의 데이터소스와 데이터소스 연관 관계를 설정함
   * @param {Dashboard} dashboard
   * @param {BoardDataSource[]} boardDsList
   * @param {BoardDataSourceRelation[]} relations
   */
  public static setDataSourceAndRelations(dashboard: Dashboard, boardDsList: BoardDataSource[], relations: BoardDataSourceRelation[]): Dashboard {

    // 조인 조건의 유효성 체크
    let verityJoin = function (joinMappings: JoinMapping[]): boolean {
      return joinMappings.every(join => {
          // KeyPair가 등록된게 없을 경우
          if (Object.keys(join.keyPair).length === 0) {
            return false;
          }

          // KeyPair의 값이 비어 있는 경우
          for (const key in join.keyPair) {
            if (!join.keyPair.hasOwnProperty(key) || StringUtil.isEmpty(join.keyPair[key])) {
              return false;
            }
          }

          return true;
        }
      );
    }; // function - _verityJoin

    // 데이터소스 정보 정리
    boardDsList.forEach(item => {
      if (item.joins && 0 < item.joins.length && verityJoin(item.joins)) {
        item.type = 'mapping';
        item.joins.forEach((join) => {
          if (join.join && !join.join.id) {
            join.join = undefined;
          }
        });
      } else {
        item.type = 'default';
      }
    });

    // Single / Multi Datasource 설정
    if (1 === boardDsList.length) {
      // join check
      dashboard.dataSource = boardDsList[0];
    } else {
      const multiDataSource: BoardDataSource = new BoardDataSource();
      multiDataSource.type = 'multi';
      multiDataSource.dataSources = boardDsList;

      if (relations) {   // 연계 정보 설정
        multiDataSource.associations = relations.map(item => {
          const relInfo: BoardDataSourceRelation = new BoardDataSourceRelation();
          relInfo.source = item.ui.source.engineName;
          relInfo.target = item.ui.target.engineName;
          relInfo.columnPair = {};
          relInfo.columnPair[item.ui.sourceField.name] = item.ui.targetField.name;
          delete relInfo.ui;
          return relInfo;
        });
      }

      dashboard.dataSource = multiDataSource;
    }

    return dashboard;

  } // function - setDataSourceAndRelations

  /**
   * 대시보드 데이터소스 스펙을 서버 스펙으로 변경함
   * @param {BoardDataSource} dataSource
   * @return {BoardDataSource}
   */
  public static convertBoardDataSourceSpecToServer(dataSource: BoardDataSource): BoardDataSource {
    // 불필요 속성 제거
    let keyMap: string[] = ['type', 'name', 'joins', 'temporary', 'dataSources', 'associations'];
    for (let key of Object.keys(dataSource)) {
      if (-1 === keyMap.indexOf(key)) {
        delete dataSource[key];
      }
    }
    return dataSource;
  } // function - convertBoardDataSourceSpecToServer

  /**
   * 페이지위젯 스펙을 서버 스펙으로 변경함
   * @param {any} configuration
   * @return {any}
   */
  public static convertPageWidgetSpecToServer(configuration: any): any {

    const chart = configuration.chart;

    delete chart.fieldList;
    delete chart.fielDimensionList;
    delete chart.fieldMeasureList;
    delete chart.fieldDimensionDataList;
    delete chart.maxValue;
    delete chart.minValue;
    delete chart.stackedMinValue;
    delete chart.stackedMaxvalue;
    if (chart.dataLabel) delete chart.dataLabel.previewList;

    delete configuration.dataSource.fields;

    // convert spec UI to server ( customFields -> fields )
    if (configuration.customFields) {
      configuration['fields'] = _.cloneDeep(configuration.customFields);
      delete configuration.customFields;
    }

    // 필터 설정
    if (configuration.filters) {
      for (let filter of configuration.filters) {
        filter = FilterUtil.convertToServerSpecForDashboard(filter);
      }
    }

    // cluster를 map-option 에서 type으로 분리를 해서 CLUSTER 로 이용하고 api request 할 때는 symbol로 변경
    if (_.eq(chart.type, ChartType.MAP)) {
      chart.layers.forEach((layer) => {
        if (layer.clustering && layer.type == MapLayerType.CLUSTER) {
          layer.type = MapLayerType.SYMBOL;
        }
      });
    }

    return configuration;

  } // function - convertPageWidgetSpecToServer

  /**
   * 같은 데이터소스인지 여부 반환
   * @param {BoardDataSource} boardDs
   * @param {Datasource} dataSource
   * @return {boolean}
   */
  public static isSameDataSource(boardDs: BoardDataSource, dataSource: Datasource): boolean {
    return (boardDs.name === dataSource.name || boardDs.name === dataSource.engineName);
    // return boardDs.engineName === dataSource.engineName;
  } // function - isSameDataSource

  /**
   * 메인 데이터소스 목록 조회
   * @param {Dashboard} board
   * @returns {Datasource[]}
   */
  public static getMainDataSources(board: Dashboard): Datasource[] {
    const boardDs: BoardDataSource = board.configuration.dataSource;
    if ('multi' === boardDs.type) {
      // Multi DataSource
      return board.dataSources.filter(item => {
        return -1 < boardDs.dataSources.findIndex(item2 => {
          return DashboardUtil.isSameDataSource(item2, item);
        });
      });
    } else {
      // Single DataSource
      return board.dataSources.filter(item => DashboardUtil.isSameDataSource(boardDs, item));
    }
  } // function - getMainDataSources

  /**
   * 첫번째 대시보드 데이터소스 조회
   * @param {Dashboard} board
   * @return {BoardDataSource}
   */
  public static getFirstBoardDataSource(board: Dashboard): BoardDataSource {
    const boardDataSource: BoardDataSource = board.configuration.dataSource;
    return ('multi' === boardDataSource.type) ? boardDataSource.dataSources[0] : boardDataSource;
  } // function - getFirstBoardDataSource

  // noinspection JSUnusedGlobalSymbols
  /**
   * 특정 데이터소스에 연계된 데이터소스 목록을 얻느다. ( 멀티데이터소스 )
   * @param {Dashboard} board
   * @param {string} engineName
   * @return {Datasource[]}
   */
  public static getRelationBoardDataSources(board: Dashboard, engineName: string): Datasource[] {
    const boardDs: BoardDataSource = board.configuration.dataSource;
    if ('multi' === boardDs.type && boardDs.associations) {
      return boardDs.associations
        .filter((rel: BoardDataSourceRelation) => (engineName === rel.source || engineName === rel.target))
        .map((rel: BoardDataSourceRelation) => {
          const relDsId: string = (rel.source === engineName) ? rel.target : rel.source;
          return board.dataSources.find(item => item.engineName === relDsId);
        });
    } else {
      // Single DataSource
      return [];
    }
  } // function - getRelationBoardDataSources

  // noinspection JSUnusedGlobalSymbols
  /**
   * 특정 데이터소스에 연계된 다른 데이터소스의 연계 필드에 대한 필터 목록을 얻는다. (멀티데이터소스)
   * @param {Dashboard} board
   * @param {string} engineName
   * @return {Filter[]}
   */
  public static getRelationDsFilters(board: Dashboard, engineName: string): Filter[] {
    const boardDs: BoardDataSource = board.configuration.dataSource;
    if ('multi' === boardDs.type && boardDs.associations) {
      return boardDs.associations
        .filter((rel: BoardDataSourceRelation) => (engineName === rel.source || engineName === rel.target))
        .reduce((acc, rel: BoardDataSourceRelation) => {
          // 연결되는 데이터소스의 필터 반환
          let relDsId: string = undefined;
          let relField: string = undefined;
          if (rel.source === engineName) {
            relDsId = boardDs.dataSources.find(item => item.engineName === rel.target).id;
            relField = rel.columnPair[Object.keys(rel.columnPair)[0]];
          } else {
            relDsId = boardDs.dataSources.find(item => item.engineName === rel.source).id;
            relField = Object.keys(rel.columnPair)[0];
          }
          acc = acc.concat(board.configuration.filters.filter(item => item.dataSource === relDsId && item.field === relField));
          return acc;
        }, []);
    } else {
      // Single DataSource
      return [];
    }
  } // function - getRelationFilters

  /**
   * 연계된 데이터소스에 대한 전체 필터 목록 조회
   * @param {Dashboard} board
   * @param {string} engineName
   * @param {Filter[]} paramFilters
   * @return {Filter[]}
   */
  public static getAllFiltersDsRelations(board: Dashboard, engineName: string, paramFilters?: Filter[]): Filter[] {
    const totalFilters: Filter[] = _.cloneDeep((paramFilters) ? paramFilters : board.configuration.filters);
    // 대상 데이터소스의 필터 목록 - getFiltersForBoardDataSource
    let srcDsFilters: Filter[] = totalFilters.filter(filter => filter.dataSource === engineName);
    // 연계 데이터소스의 연계 필드에 대응하는 대상 데이터소스의 필드의 필터
    const boardDs: BoardDataSource = board.configuration.dataSource;
    let relDsFilters: Filter[] = [];
    if ('multi' === boardDs.type && boardDs.associations) {
      const srcDs: BoardDataSource = boardDs.dataSources.find(item => item.engineName === engineName);
      relDsFilters = boardDs.associations
        .filter((rel: BoardDataSourceRelation) => (srcDs.engineName === rel.source || srcDs.engineName === rel.target))
        .reduce((acc, rel: BoardDataSourceRelation) => {
          // 연결되는 데이터소스의 필터 반환
          let srcField: string = undefined;
          let relDsEngineName: string = undefined;
          let relField: string = undefined;
          if (rel.source === srcDs.engineName) {
            relDsEngineName = boardDs.dataSources.find(item => item.engineName === rel.target).engineName;
            srcField = Object.keys(rel.columnPair)[0];
            relField = rel.columnPair[srcField];
          } else {
            relDsEngineName = boardDs.dataSources.find(item => item.engineName === rel.source).engineName;
            relField = Object.keys(rel.columnPair)[0];
            srcField = rel.columnPair[relField];
          }
          acc = acc.concat(
            totalFilters
              .filter((item: Filter) => item.dataSource === relDsEngineName && item.field === relField)
              .map((item: Filter) => {
                item.dataSource = engineName;
                item.field = srcField;
                return item;
              })
          );
          return acc;
        }, []);
    }

    if (0 < relDsFilters.length) {
      srcDsFilters.forEach(item1 => {
        const idx: number = relDsFilters.findIndex(item2 => item1.field === item2.field);
        if (-1 < idx && 'include' === item1.type) {
          const selection = relDsFilters.splice(idx, 1)[0];
          item1['valueList'] = item1['valueList'] ? _.uniq(item1['valueList'].concat(selection['valueList'])) : selection['valueList'];
        }
      });
      srcDsFilters = srcDsFilters.concat(relDsFilters);
    }
    return srcDsFilters;
  } // function - getAllFiltersDsRelations

  /**
   * 데이터소스로부터 보드데이터소스 정보를 얻음
   * @param {Dashboard} board
   * @param {Datasource} dataSource
   * @returns {BoardDataSource}
   */
  public static getBoardDataSourceFromDataSource(board: Dashboard, dataSource: Datasource): BoardDataSource {
    const boardDs: BoardDataSource = board.configuration.dataSource;
    if ('multi' === boardDs.type) {
      return boardDs.dataSources.find(item => DashboardUtil.isSameDataSource(item, dataSource));
    } else {
      return DashboardUtil.isSameDataSource(boardDs, dataSource) ? boardDs : undefined;
    }
  } // function - getBoardDataSourceFromDataSource

  /**
   * 보드데이터소스로부터 데이터소스 정보를 얻음
   * @param {Dashboard} board
   * @param {BoardDataSource} boardDataSource
   * @returns {Datasource}
   */
  public static getDataSourceFromBoardDataSource(board: Dashboard, boardDataSource: BoardDataSource): Datasource {
    if (boardDataSource) {
      return board.dataSources.find(item => DashboardUtil.isSameDataSource(boardDataSource, item));
    } else {
      return undefined;
    }
  } // function - getDataSourceFromBoardDataSource

  // noinspection JSUnusedGlobalSymbols
  /**
   * 보드데이터소스에 대한 필터 목록 조회
   * @param {Dashboard} board
   * @param {string} engineName
   * @returns {Filter[]}
   */
  public static getFiltersForBoardDataSource(board: Dashboard, engineName: string): Filter[] {
    return board.configuration.filters.filter(filter => filter.dataSource === engineName);
  } // function - getFiltersForBoardDataSource

  /**
   * Current Date Time 인지 확인
   * @param field
   */
  public static isCurrentDateTime(field: Field) {
    return CommonConstant.COL_NAME_CURRENT_DATETIME === field.name
      && field.role === FieldRole.TIMESTAMP && field.format && field.format.type === FieldFormatType.TEMPORARY_TIME;
  } // function - isCurrentDateTime

  /**
   * 메인 데이터소스로부터 필드 목록을 얻는다.
   * @param {BoardConfiguration} boardConf
   * @param {string} engineName
   * @return {T[]}
   */
  public static getFieldsForMainDataSource(boardConf: BoardConfiguration, engineName: string) {
    return (boardConf.fields) ? boardConf.fields.filter(item => {
      if (item.dataSource === engineName) {
        return !DashboardUtil.isCurrentDateTime(item);
      } else {
        return false;
      }
    }) : [];
  } // function - getFieldsForMainDataSource

  /**
   * 대시보드 설정 조회
   * @param {Dashboard} board
   * @returns {BoardConfiguration}
   */
  public static getBoardConfiguration(board: Dashboard): BoardConfiguration {
    return (board) ? board.configuration : null;
  } // function - getBoardConfiguration

  /**
   * 대시보드 설정 갱신
   * @param {Dashboard} board
   * @param {BoardConfiguration} boardConf
   * @returns {Dashboard}
   */
  public static updateBoardConfiguration(board: Dashboard, boardConf: BoardConfiguration): Dashboard {
    if (board && boardConf) {

      board.configuration = _.merge(board.configuration, boardConf);

      // 위젯 타이틀 표시 설정
      const widgetOpts: BoardWidgetOptions = board.configuration.options.widget;
      if (widgetOpts && WidgetShowType.BY_WIDGET !== widgetOpts.showTitle) {
        board.configuration.widgets.forEach(item => item.title = (WidgetShowType.ON === widgetOpts.showTitle));
      }

      // 공백 설정
      if (board.configuration.options.layout.widgetPadding !== board.configuration.layout.dimensions.borderWidth) {
        board.configuration.layout.dimensions.borderWidth = board.configuration.options.layout.widgetPadding;
      }
    }

    return board;
  } // function - updateBoardConfiguration

  /**
   * 레이아웃 위젯 정보 목록 조회
   * @returns {LayoutWidgetInfo[]}
   */
  public static getLayoutWidgetInfos(board: Dashboard): LayoutWidgetInfo[] {
    if (board.configuration.widgets) {
      return board.configuration.widgets.filter(item => item.isInLayout && board.widgets.some(widget => widget.id === item.ref));
    } else {
      return [];
    }
  } // function - getLayoutWidgetInfos

  /**
   * 대시보드 컴포넌트 아이디로 레이아웃 위젯 정보 조회
   * @param {Dashboard} board
   * @param {string} layoutCompId
   * @returns {LayoutWidgetInfo}
   */
  public static getLayoutWidgetInfoByComponentId(board: Dashboard, layoutCompId: string): LayoutWidgetInfo {
    return board.configuration.widgets.find(item => item.id === layoutCompId);
  } // function - getLayoutWidgetInfoByComponentId

  /**
   * 위젯 아이디로 레이아웃 위젯 정보 조회
   * @param {Dashboard} board
   * @param {string} widgetId
   * @returns {LayoutWidgetInfo}
   */
  public static getLayoutWidgetInfoByWidgetId(board: Dashboard, widgetId: string): LayoutWidgetInfo {
    return board.configuration.widgets.find(item => item.ref === widgetId);
  } // function - getLayoutWidgetInfoByWidgetId

  /**
   * 레이아웃 컴포넌트 아이디를 바탕으로 위젯 정보 조회
   * @param {Dashboard} board
   * @param {string} layoutCompId
   * @returns {Widget}
   */
  public static getWidgetByLayoutComponentId(board: Dashboard, layoutCompId: string): Widget {
    const layoutWidgetInfo: LayoutWidgetInfo = this.getLayoutWidgetInfoByComponentId(board, layoutCompId);
    if (layoutWidgetInfo) {
      return board.widgets.find(item => item.id === layoutWidgetInfo.ref);
    } else {
      return null;
    }
  } // function - getWidgetByLayoutComponentId

  /**
   * 필드 목록 조회
   * @param {Dashboard} board
   * @returns {Field[]}
   */
  public static getFields(board: Dashboard): Field[] {
    return board.configuration.fields;
  } // function - getFields

  /**
   * 필드명으로 필드객체 조회
   * @param {Dashboard} board     대시보드 객체
   * @param {string} engineName   필드가 속한 데이터소스 아이디
   * @param {string} fieldName    필드 이름
   * @param {string} ref          필드 레퍼런스
   * @return {Field}
   */
  public static getFieldByName(board: Dashboard, engineName: string, fieldName: string, ref?: string): Field {
    const boardConf: BoardConfiguration = board.configuration;
    const fields = engineName ? boardConf.fields.filter(item => item.dataSource === engineName) : boardConf.fields;
    let customFields = [];

    // 사용자 정의 필드
    if (boardConf.hasOwnProperty('customFields')) {
      customFields = boardConf.customFields;
    }

    let field: Field;

    // 필드 조회
    let idx = -1;
    if (ref) idx = _.findIndex(fields, {ref, name: fieldName});
    else idx = _.findIndex(fields, {name: fieldName});

    if (idx > -1) field = fields[idx];

    // 일반 필드에 없으면 커스텀 필드 조회
    if (field) {
      return field;
    } else {
      idx = _.findIndex(customFields, (obj) => {
        return obj.name === fieldName
      });
      return customFields[idx];
    }
  } // function - getFieldByName

  /**
   * 특정 필드 정보 갱신
   * @param {Dashboard} board
   * @param {Field} changeField
   * @returns {Dashboard}
   */
  public static updateField(board: Dashboard, changeField: Field): Dashboard {
    const fields: Field[] = board.configuration.fields;
    const idx: number = fields.findIndex((field: Field) => (field.name === changeField.name));
    if (-1 < idx) {
      const field: Field = fields[idx];
      fields[idx] = _.merge(field, changeField);
    }
    return board;
  } // function - updateField

  /**
   * 커스텀 필드 목록 조회
   * @param {Dashboard} board
   * @returns {CustomField[]}
   */
  public static getCustomFields(board: Dashboard): CustomField[] {
    if (board.configuration && !board.configuration.customFields) {
      board.configuration.customFields = [];
    }
    return board.configuration.customFields;
  } // function - getCustomFields

  /**
   * 커스텀 필드 목록 설정
   * @param {Dashboard} board
   * @param {CustomField[]} customFields
   * @returns {Dashboard}
   */
  public static setCustomFields(board: Dashboard, customFields: CustomField[]): Dashboard {
    if (customFields) {
      board.configuration.customFields = customFields;
    } else {
      board.configuration.customFields = [];
    }
    return board;
  } // function - setCustomFields

  /**
   * 글로벌 필터 목록 조회
   * @param {Dashboard} board
   * @param {boolean} isClone
   * @returns {Filter[]}
   */
  public static getBoardFilters(board: Dashboard, isClone: boolean = false): Filter[] {
    const boardFilter: Filter[] = (board.configuration) ? board.configuration.filters : [];
    return (isClone) ? _.cloneDeep(boardFilter) : boardFilter;
  } // function - getFilters

  /**
   * 특정 필드에 대한 보드 필터 조회
   * @param {Dashboard} board
   * @param {Field} field
   * @return {Filter}
   */
  public static getBoardFilter(board: Dashboard, field: Field): Filter {
    return board.configuration.filters.find(item => item.dataSource === field.dataSource && item.field === field.name);
  } // function - getBoardFilter

  /**
   * 대시보드 설정 변경 - 글로벌 필터
   * @param {Dashboard} board
   * @param {Filter[]} filters
   * @returns {Dashboard}
   */
  public static setBoardFilters(board: Dashboard, filters: Filter[]): Dashboard {
    (filters) && (board.configuration.filters = filters);
    return board;
  } // function - setBoardFilters

  /**
   * 글로벌 필터 추가
   * @param {Dashboard} board
   * @param {Filter} filter
   * @returns {Dashboard}
   */
  public static addBoardFilter(board: Dashboard, filter: Filter): Dashboard {
    (board.configuration.filters) || (board.configuration.filters = []);
    board.configuration.filters.push(filter);
    return board;
  } // function - addBoardFilter

  /**
   * 신규 필터 여부
   * @param board
   * @param filter
   */
  public static isNewFilter(board: Dashboard, filter: Filter):boolean {
    return -1 === board.configuration.filters.findIndex(item => item.dataSource === filter.dataSource && item.field === filter.field);
  } // function - isNewFilter

  /**
   * 글로벌 필터 갱신
   * @param {Dashboard} board
   * @param {Filter} filter
   * @param {boolean} isOverwrite
   * @returns {[Dashboard, boolean]}
   */
  public static updateBoardFilter(board: Dashboard, filter: Filter, isOverwrite: boolean = false): [Dashboard, boolean] {
    const idx: number = board.configuration.filters.findIndex(item => item.dataSource === filter.dataSource && item.field === filter.field);
    let isNewFilter: boolean = false;
    if (-1 === idx) {
      isNewFilter = true;
      this.addBoardFilter(board, filter);
    } else {
      if (isOverwrite) {
        board.configuration.filters[idx] = filter;
      } else {
        board.configuration.filters[idx] = _.merge(board.configuration.filters[idx], filter);
      }
    }

    // for presentation mode
    const targetWidget: FilterWidget
      = <FilterWidget>board.widgets.find(item => this.isSameFilterAndWidget(board, filter, item));
    (targetWidget) && (targetWidget.configuration.filter = filter);

    return [board, isNewFilter];
  } // function - updateBoardFilter

  /**
   * 글로벌 필터 삭제
   * @param {Dashboard} board
   * @param {Filter} filter
   * @returns {Dashboard}
   */
  public static deleteBoardFilter(board: Dashboard, filter: Filter): Dashboard {
    // 필터 정보 삭제
    _.remove(board.configuration.filters, {field: filter.field, dataSource: filter.dataSource});
    return board;
  } // function - deleteBoardFilter

  // noinspection JSUnusedGlobalSymbols
  /**
   * 보드 데이터소스 조회
   * @param {Dashboard} board
   * @return {BoardDataSource}
   */
  public static getBoardDataSource(board: Dashboard): BoardDataSource {
    return board.configuration.dataSource;
  } // function - getBoardDataSource

  /**
   * api용 데이터소스 처리
   * @param {BoardDataSource} dataSource
   * @return {BoardDataSource}
   */
  public static getDataSourceForApi(dataSource: BoardDataSource): BoardDataSource {
    // enginName과 name가 맞지 않으면 오류 발생함
    dataSource.name = (dataSource.engineName) ? dataSource.engineName : dataSource.name;

    if (dataSource.hasOwnProperty('joins') && dataSource.joins.length > 0) {
      dataSource.joins.forEach((join) => {
        if (join.engineName) join.name = join.engineName;
        else join.engineName = join.name;

        if (join.join) {
          if (join.join.engineName) join.join.name = join.join.engineName;
          else join.join.engineName = join.join.name;
        }
      });
    }

    return dataSource;
  } // function - getDataSourceForApi

  /**
   * 대시보드 위젯 옵션 조회
   * @param {Dashboard} board
   * @returns {BoardWidgetOptions}
   */
  public static getBoardWidgetOptions(board: Dashboard): BoardWidgetOptions {
    return board.configuration.options.widget;
  } // function - getBoardWidgetOptions

  /**
   * 레이아웃 설정에 있는 위젯 정보 목록을 반환한다
   * @param {Dashboard} board
   * @returns {LayoutWidgetInfo[]}
   */
  public static getLayoutComponents(board: Dashboard): LayoutWidgetInfo[] {
    if (board && board.configuration && board.configuration.widgets) {
      return board.configuration.widgets.filter(item => item.isInLayout);
    } else {
      return [];
    }
  } // function - getLayoutComponents

  /**
   * 위젯 타이틀 표시 여부 설정
   * @param {Dashboard} board
   * @param {string} widgetId
   * @param {boolean} isVisible
   * @returns {Dashboard}
   */
  public static setVisibleWidgetTitle(board: Dashboard, widgetId: string, isVisible: boolean): Dashboard {
    board.configuration.widgets.some(item => {
      if (item.ref === widgetId) {
        item.title = isVisible;
        return true;
      }
    });
    return board;
  } // function - setVisibleWidgetTitle

  /**
   * 레이아웃에서 위젯 사용 여부 설정
   * @param {Dashboard} board
   * @param {string} widgetId
   * @param {boolean} isInLayout
   * @returns {Dashboard}
   */
  public static setUseWidgetInLayout(board: Dashboard, widgetId: string, isInLayout: boolean): Dashboard {
    board.configuration.widgets.some(item => {
      if (item.ref === widgetId) {
        item.isInLayout = isInLayout;
        return true;
      }
    });
    return board;
  } // function - setUseWidgetInLayout

  /**
   * 전체 위젯 목록을 반환한다.
   * @param {Dashboard} board
   * @returns {Widget[]}
   */
  public static getWidgets(board: Dashboard): Widget[] {
    return (board && board.widgets) ? board.widgets : [];
  } // function - getWidgets

  /**
   * 특정 위젯을 반환한다.
   * @param {Dashboard} board
   * @param {string} widgetId
   * @returns {Widget}
   */
  public static getWidget(board: Dashboard, widgetId: string): Widget {
    return board.widgets.find(item => item.id === widgetId);
  } // function - getWidget

  /**
   * 위젯을 추가 및 Layout 내 위젯이 배치될 수 있도록 목록 등록
   * @param {Dashboard} board
   * @param {Widget} widget
   * @param {boolean} isInLayout
   * @returns {Dashboard}
   */
  public static addWidget(board: Dashboard, widget: Widget, isInLayout: boolean = false): Dashboard {
    board.widgets.push(widget);

    const newWidget: LayoutWidgetInfo = new LayoutWidgetInfo(widget.id, widget.type);
    (isInLayout) && (newWidget.isInLayout = true);
    if (WidgetShowType.BY_WIDGET !== board.configuration.options.widget.showTitle) {
      newWidget.title = (WidgetShowType.ON === board.configuration.options.widget.showTitle);
    }

    board.configuration.widgets.push(newWidget);

    return board;
  } // function - addWidget

  /**
   * 특정 위젯 정보를 갱신합니다
   * @param {Dashboard} board
   * @param {Widget} widget
   * @returns {Dashboard}
   */
  public static updateWidget(board: Dashboard, widget: Widget): Dashboard {
    board.widgets = board.widgets.map(item => (item.id === widget.id) ? _.extend({}, item, widget) : item);
    return board;
  } // function - updateWidget

  /**
   * 위젯 삭제
   * @param {Dashboard} board
   * @param {string} widgetId
   * @returns {Dashboard}
   */
  public static removeWidget(board: Dashboard, widgetId: string): Dashboard {
    _.remove(board.widgets, (widget) => widget.id === widgetId);
    _.remove(board.configuration.widgets, (layoutWidget) => layoutWidget.ref === widgetId);
    return board;
  } // function - removeWidget


  /**
   * 페이지 위젯 목록을 반환한다.
   * @param {Dashboard} board
   * @returns {PageWidget[]}
   */
  public static getPageWidgets(board: Dashboard): PageWidget[] {
    if (board && board.widgets && board.widgets.length > 0) {
      return board.widgets.filter(item => 'page' === item.type).map(item => <PageWidget>item);
    } else {
      return [];
    }

  } // function - getPageWidgets

  /**
   * 텍스트 위젯 목록을 반환한다.
   * @param {Dashboard} board
   * @returns {TextWidget[]}
   */
  public static getTextWidgets(board: Dashboard): TextWidget[] {
    if (board && board.widgets && board.widgets.length > 0) {
      return board.widgets.filter(item => 'text' === item.type).map(item => <TextWidget>item);
    } else {
      return [];
    }
  } // function - getTextWidgets

  /**
   * 필터 위젯 목록을 반환한다.
   * @param {Dashboard} board
   * @returns {FilterWidget[]}
   */
  public static getFilterWidgets(board: Dashboard): FilterWidget[] {
    if (board && board.widgets && board.widgets.length > 0) {
      return board.configuration.filters
        .map(filter => this.getFilterWidgetByFilter(board, filter))
        .filter(filter => isObject(filter));
    } else {
      return [];
    }
  } // function - getFilterWidgets

  /**
   * 필터 위젯을 얻는다
   * @param {Dashboard} board
   * @param {Filter} filter
   * @return {FilterWidget}
   */
  public static getFilterWidgetByFilter(board: Dashboard, filter: Filter): FilterWidget {
    return <FilterWidget>board.widgets.find(item => this.isSameFilterAndWidget(board, filter, item));
  } // function - getFilterWidgetByFilter

  /**
   * 필터와 위젯이 같은 것인지 판단한다.
   * @param {Dashboard} board
   * @param {Filter} filter
   * @param {Widget} widget
   * @return {boolean}
   */
  public static isSameFilterAndWidget(board: Dashboard, filter: Filter, widget: Widget): boolean {
    if ('filter' === widget.type) {
      const filterInWidget: Filter = (<FilterWidgetConfiguration>widget.configuration).filter;
      return (filterInWidget.dataSource === filter.dataSource && filterInWidget.field === filter.field);
    } else {
      return false;
    }
  } // function - isSameFilterAndWidget

  /**
   * 페이지 연관관계 설정
   * @param {Dashboard} board
   * @param {DashboardPageRelation[]} rels
   * @returns {Dashboard}
   */
  public static setDashboardConfRelations(board: Dashboard, rels: DashboardPageRelation[]): Dashboard {
    if (rels) {
      board.configuration.relations = rels;
    }
    return board;
  } // function - setDashboardConfRelations

  /**
   * Convert spec to UI
   * @param {Dashboard} boardInfo
   * @return {Dashboard}
   */
  public static convertSpecToUI(boardInfo: Dashboard): Dashboard {
    // Change spec server to ui ( userDefinedFields -> customFields )
    if (boardInfo.configuration['userDefinedFields']) {
      boardInfo.configuration.customFields = _.cloneDeep(CommonUtil.objectToArray(boardInfo.configuration['userDefinedFields']));
    }

    if (boardInfo.dataSources) {
      // Filter ( dataSource ( id -> engineName ) )
      const filters: Filter[] = DashboardUtil.getBoardFilters(boardInfo);
      if (filters && 0 < filters.length) {
        const uniqFilterKeyList: string[] = [];
        boardInfo.configuration.filters
          = filters.filter((filter: Filter) => {
          const uniqFilterKey: string = filter.dataSource + '_' + filter.field;
          if (-1 === uniqFilterKeyList.indexOf(uniqFilterKey)) {
            const filterDs: Datasource = boardInfo.dataSources.find(ds => ds.id === filter.dataSource);
            (filterDs) && (filter.dataSource = filterDs.engineName);
            if (isNullOrUndefined(filter.dataSource)) {
              const fieldDs: Datasource = boardInfo.dataSources.find(ds => ds.fields.some(item => item.name === filter.field));
              (fieldDs) && (filter.dataSource = fieldDs.engineName);
            }
            uniqFilterKeyList.push(uniqFilterKey);
            return true;
          } else {
            return false;
          }
        });
      }
      // Widget
      const widgets: Widget[] = boardInfo.widgets;
      if (widgets && 0 < widgets.length) {
        widgets.forEach((widget: Widget) => {
          if ('filter' === widget.type) {
            // FilterWidget : Filter ( dataSource ( id -> engineName ) )
            const filter: Filter = (<FilterWidget>widget).configuration.filter;
            const filterDs: Datasource = boardInfo.dataSources.find(ds => ds.id === filter.dataSource);
            (filterDs) && (filter.dataSource = filterDs.engineName);

            if (isNullOrUndefined(filter.dataSource)) {
              const fieldDs: Datasource = boardInfo.dataSources.find(ds => ds.fields.some(item => item.name === filter.field));
              (fieldDs) && (filter.dataSource = fieldDs.engineName);
            }
          } else if ('page' === widget.type) {
            // PageWidget ( fields -> customFields )
            if (widget.configuration['fields']) {
              (<PageWidget>widget).configuration.customFields = widget.configuration['fields'];
            }
          }
        });
      }
    }

    return boardInfo;
  } // function - convertSpecToUI

  /* ----------------------------------------------------------------
  For Chart Limit
   ------------------------------------------------------------------ */
  /**
   * 차트 제한 정보
   * @param widgetId
   * @param type
   * @param data
   */
  public static getChartLimitInfo(widgetId: string, type: ChartType, data: { rows: any[], info: any, columns: any[] }): ChartLimitInfo {
    let limitInfo: ChartLimitInfo = {
      id: widgetId,
      isShow: false,
      currentCnt: 0,
      maxCnt: 0
    };
    if (ChartUtil.isUsingLimitOption(type) && data.info) {
      limitInfo.maxCnt = data.info.totalCategory;
      if (ChartType.PIE === type || ChartType.LABEL === type || ChartType.WORDCLOUD === type) {
        if (data.columns && 0 < data.columns.length) {
          limitInfo.currentCnt = data.columns[0].value.length;
        }
      }
      if (ChartType.GRID === type || ChartType.HEATMAP === type) {
        if (data.rows && 0 < data.rows.length) {
          limitInfo.currentCnt = data.rows.length;
        } else {
          limitInfo.currentCnt = data.columns.length;
        }
      } else {
        if (data.rows && 0 < data.rows.length) {
          limitInfo.currentCnt = data.rows.length;
        }
      }
      limitInfo.isShow = limitInfo.currentCnt < limitInfo.maxCnt;
    }
    return limitInfo;
  } // function - getChartLimitInfo


  /**
   * Returns icon class for field
   * @param name
   */
  public static getFieldIconClass(name: string): string {

    const fieldIconClasses = [
      {name: 'STRING', class: 'ddp-icon-type-ab'},
      {name: 'TIMESTAMP', class: 'ddp-icon-type-calen'},
      {name: 'LONG', class: 'ddp-icon-type-sharp'},
      {name: 'LNG', class: 'ddp-icon-type-longitude'},
      {name: 'LNT', class: 'ddp-icon-type-latitude'},
      {name: 'GEO_POINT', class: 'ddp-icon-type-point'},
      {name: 'GEO_LINE', class: 'ddp-icon-type-line'},
      {name: 'GEO_POLYGON', class: 'ddp-icon-type-polygon'},
    ];

    if (_.isNil(name)) { // is it necessary?
      return 'ddp-icon-type-ab'
    }

    // find index using name
    const idx = fieldIconClasses.findIndex((item) => {
      return item.name === name
    });

    // return string class if name doesn't exist in list
    return idx !== -1 ? fieldIconClasses[idx].class : 'ddp-icon-type-ab'

  }
} // class - DashboardUtil

export class ChartLimitInfo {
  public id: string;
  public isShow: boolean;
  public currentCnt: number;
  public maxCnt: number
}
