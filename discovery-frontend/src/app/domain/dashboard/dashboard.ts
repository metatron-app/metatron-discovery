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
import { AbstractHistoryEntity } from '../common/abstract-history-entity';
import { Datasource, Field, FieldNameAlias, FieldValueAlias } from '../datasource/datasource';
import { Widget } from './widget/widget';
import { Workbook } from '../workbook/workbook';
import { ChartSelectInfo } from '../../common/component/chart/base-chart';
import { Filter } from '../workbook/configurations/filter/filter';
import { BoardGlobalOptions } from './dashboard.globalOptions';
import { CustomField } from '../workbook/configurations/field/custom-field';
import { CommonUtil } from '../../common/util/common.util';
import { DashboardPageRelation } from './widget/page-widget.relation';
import {Sort} from "../workbook/configurations/sort";

/**
 * 대시보드 구조체
 */
export class Dashboard extends AbstractHistoryEntity {
  public id: string;
  public name: string;
  public description: string;
  public configuration: BoardConfiguration;
  public temporaryId: string;  // Linked Datasource 에서의 임시 데이터소스에 대한 아이디
  public tag: string;
  public imageUrl: string;
  public hiding: boolean = false;
  public seq: number;
  public workBook: Workbook;
  public dataSources: Datasource[];
  public widgets: Widget[];

  // Response Only
  public aliases: (FieldNameAlias | FieldValueAlias)[] = [];
  public dataSource: BoardDataSource = new BoardDataSource();

  // for UI
  public selectDatasource: Datasource;
  public updateId:string;
} // structure - Dashboard

/**
 * 대시보드 구조체 - for 프레젠테이션 뷰
 */
export class PresentationDashboard extends Dashboard {
  public selectionFilters: ChartSelectInfo[];
} // structure - PresentationDashboard

/**
 * 대시보드 설정 구조체
 */
export class BoardConfiguration {
  public dataSource: BoardDataSource;   // 데이터 소스 연결 설정
  public options?: BoardGlobalOptions;  // 보드 전체 옵션
  public widgets?: LayoutWidgetInfo[];  // 대시보드 내 배치되는 Widget 정보
  public content?: any[];
  public relations?: DashboardPageRelation[];    // 페이지 관계 설정
  public customFields?: CustomField[];  // 사용자 정의 필드 정보 -> 추후에 userDefinedFields 으로 변경되어야 한다.
  public filters?: Filter[];            // WorkBoard 내 Global Filter 설정

  // for UI
  public fields?: Field[];              // 필드 목록
  public layout?: DashboardLayout;      // Layout 정보

  constructor() {
    this.options = new BoardGlobalOptions();
    this.layout = new DashboardLayout();
    this.widgets = [];
  }
} // structure - BoardConfiguration


// 대시보드에서 사용하는 데이터소스 정보 ( 조인등의 정보 )
export class BoardDataSource {
  public id: string;
  public type: string;
  public name: string;
  public engineName: string;
  public connType: string;
  public joins: JoinMapping[] = [];
  public metaDataSource: Datasource;
  public temporary: boolean = false;
  public dataSources:BoardDataSource[];
  public associations:BoardDataSourceRelation[];

  // for UI
  public uiFields: Field[];
  public uiFilters:Filter[];
  public uiDescription:string;

  /**
   * 데이터소스를 메타데이터소스로 변경한다.
   * @param {Datasource} ds
   * @return {BoardDataSource}
   */
  public static convertDsToMetaDs(ds: Datasource):BoardDataSource {
    const metaDs = new BoardDataSource();
    metaDs.id = ds.id;
    metaDs.name = ds.name;
    metaDs.uiDescription = ds.description;
    metaDs.engineName = ds.engineName;
    metaDs.uiFields = ds.fields;
    metaDs.connType = ds.connType.toString();
    metaDs.temporary = !!( ds.temporary );
    return metaDs;
  } // function - _convertDsToMetaDs
} // structure - BoardDataSource

/**
 * Join 정보 구조체
 */
export class JoinMapping {
  public id: string;
  public type: string;
  public name: string;
  public joinAlias: string;
  public keyPair: { [key: string]: string };
  public join: JoinMapping;

  // for UI
  public uiFields: Field[];
  public engineName: string;    // ui에서만 사용하지만 BoardDataSource와의 필드명을 맞추기 위해 ui prefix를 붙이지 않음
} // structure - JoinMapping

export class JoinMappingDataSource {
  public joinMappings: JoinMapping[];
  public candidateDataSources: Datasource[];

  constructor(joinMappings: JoinMapping[], candidateDataSources: Datasource[]) {
    this.joinMappings = joinMappings;
    this.candidateDataSources = candidateDataSources;
  }
}

/**
 * 데이터소스 연계정보
 */
export class BoardDataSourceRelation {
  public id : string;
  public source : string;
  public target: string;
  public columnPair: { [key: string]: string };

  public ui: {
    source?: BoardDataSource,
    target?: BoardDataSource,
    sourceField?:Field,
    targetField?:Field
  };

  constructor() {
    this.ui = {};
  }
} // structure - BoardDataSourceRelation

/**
 * 조회 수 조건 정보 클래스
 */
export class QueryParamLimit {
  public limit: number;
  public sort: Sort[];

  constructor() {
    this.limit = 1000;
    this.sort = [];
  }
} // end of QueryParamLimit Class

/**
 * 조회 조건 정보 클래스
 */
export class QueryParam {
  public dataSource: BoardDataSource;
  public filters: any[];
  public projections: any[];
  public limits: QueryParamLimit;
  public preview: boolean;
  public metaQuery:boolean;

  constructor() {
    this.dataSource = new BoardDataSource();
    this.filters = [];
    this.projections = [];
    this.limits = new QueryParamLimit();
    this.preview = true;
    this.metaQuery = false;
  }
}  // end of QueryParam Class

/**
 * 레이아웃 내 위젯 정보
 */
export class LayoutWidgetInfo {
  public id: string;
  public type: string;
  public ref:string;
  public title: boolean;

  // for UI
  public isSaved:boolean;
  public isInLayout:boolean;
  public isLoaded:boolean;

  constructor(widgetId: string, widgetType: string) {
    this.id = CommonUtil.getUUID();
    this.type = widgetType;
    this.ref = widgetId;
    this.title = ( 'page' !== widgetType );
    this.isSaved = false;
    this.isInLayout = false;
  }
} // Class - LayoutWidgetInfo

/**
 * 레이아웃 모드
 */
export enum LayoutMode {
  VIEW = <any>'VIEW',
  VIEW_AUTH_MGMT = <any>'VIEW_AUTH_MGMT',
  EDIT = <any>'EDIT',
  STANDALONE = <any>'STANDALONE'
}

/**
 * 대시보드 레이아웃 정보
 */
export class DashboardLayout {
  public settings: LayoutSettings;
  public dimensions: LayoutDimensions;
  public content: any[];

  constructor() {
    this.settings = new LayoutSettings();
    this.dimensions = new LayoutDimensions();
    this.content = [];
  }
} // structure - DashboardLayout

/**
 * 레이아웃 설정 정보
 */
export class LayoutSettings {
  public hasHeaders: boolean;
  public constrainDragToContainer?: boolean;
  public reorderEnabled?: boolean;
  public selectionEnabled: boolean;
  public popoutWholeStack: boolean;
  public blockedPopoutsThrowError: boolean;
  public closePopoutsOnUnload: boolean;
  public showPopoutIcon: boolean;
  public showMaximiseIcon?: boolean;
  public showCloseIcon: boolean;
  public enableComponentResize:boolean;

  constructor() {
    this.hasHeaders = true;
    this.selectionEnabled = false;
    this.popoutWholeStack = false;
    this.blockedPopoutsThrowError = false;
    this.closePopoutsOnUnload = false;
    this.showPopoutIcon = false;
    this.showCloseIcon = false;
  }
} // structure - LayoutSettings

/**
 * 레이아웃 치수 정보
 */
export class LayoutDimensions {
  public minItemHeight?: number;
  public minItemWidth?: number;
  public headerHeight: number;
  public borderWidth:number;

  // custom properties
  public height: (string | number);
  public width: (string | number);
  public margin: number;
  public confHeight: (string | number); // 설정되어진 값 - presentation에서 FIT_TYPE을 바꾸는 상황이 있어 설정값을 유지하기 위해 추가

  constructor() {
    this.minItemWidth = 50;
    this.minItemHeight = 50;
    this.headerHeight = 25;
    this.borderWidth = 5;
    this.confHeight = '100%';
    this.height = '100%';
    this.width = '100%';
    this.margin = 5;
  }
} // structure - LayoutDimensions
