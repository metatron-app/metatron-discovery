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

import * as pixelWidth from 'string-pixel-width';
import * as _ from 'lodash';
import {
  Component,
  ElementRef,
  Injector,
  OnInit,
  OnDestroy,
  Input,
  ViewChild,
  SimpleChanges,
  SimpleChange, OnChanges
} from '@angular/core';
import {ConnectionType, Datasource, DataSourceSummary, Field, Status} from '../../../domain/datasource/datasource';
import { AbstractComponent } from '../../../common/component/abstract.component';
import { EventBroadcaster } from '../../../common/event/event.broadcaster';
import { GridComponent } from '../../../common/component/grid/grid.component';
import {
  BoardConfiguration,
  BoardDataSource,
  Dashboard,
  JoinMapping,
  QueryParam
} from '../../../domain/dashboard/dashboard';
import { DatasourceService } from '../../../datasource/service/datasource.service';
import { header, SlickGridHeader } from '../../../common/component/grid/grid.header';
import { GridOption } from '../../../common/component/grid/grid.option';
import { isNullOrUndefined } from 'util';
import { Alert } from '../../../common/util/alert.util';
import { CreateBoardPopJoinComponent } from './create-board-pop-join.component';
import { CommonUtil } from '../../../common/util/common.util';
import { FilterUtil } from '../../util/filter.util';
import { InclusionFilter } from '../../../domain/workbook/configurations/filter/inclusion-filter';
import { Filter } from '../../../domain/workbook/configurations/filter/filter';

declare let Split;

@Component({
  selector: 'create-board-ds-info',
  templateUrl: './create-board-ds-info.component.html'
})
export class CreateBoardDsInfoComponent extends AbstractComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('main')
  private gridComponent: GridComponent;

  @ViewChild(CreateBoardPopJoinComponent)
  private _joinPopupComp: CreateBoardPopJoinComponent;

  private _allDataSources: Datasource[];         // 전체 데이터 소스 목록
  private _candidateDataSources: Datasource[];   // 조인 할수 있는 데이터 소스 목록들

  private _split: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input()
  public workspaceId: string;

  @Input('dataSource')
  public dataSource: BoardDataSource;

  public tab = Tab;
  public selectedTab: Tab = Tab.PREVIEW;

  public joinMappings: JoinMapping[] = [];      // join 정보

  public essentialFilters: Filter[] = [];

  public headerCnt: number = 0;   // 그리드뷰 헤더 컬럼수
  public rowNum: number = 1000;   // 그리드 rows 개수
  public colTypes: { type: string, cnt: number }[] = [];  // 컬럼 타입 갯수
  public dataSourceSummary: DataSourceSummary;            // 데이터소스 요약 정보

  public isLinkedDataSource: boolean = false;   // Linked DataSource 여부
  public isEmptyMainGrid: boolean = false;      // Grid 데이터 존재 여부
  public isShowColTypeLayer: boolean = false;    // 컬럼 타입 레이어 표시 여부
  public isEnableJoin: boolean = false;         // 조인 가능 여부


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              protected broadCaster: EventBroadcaster,
              private datasourceService: DatasourceService) {
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

    // 데이터 소스 선택
    this.subscriptions.push(
      this.broadCaster.on('CREATE_BOARD_SELECT_DS').subscribe((data: { dataSource: BoardDataSource }) => {
        this.changeDataSource(data.dataSource);
      })
    );

  } // function - ngOnInit


  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const dsChanges: SimpleChange = changes.dataSource;
    if (dsChanges.firstChange) {
      this.changeDataSource(dsChanges.currentValue);
    }
  } // function - ngOnChanges

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    setTimeout(() => {
      this._split = Split(['.sys-create-board-top-panel', '.sys-create-board-bottom-panel'], {
        direction: 'vertical'
      });
    }, 500);
  } // function - ngAfterViewInit

  /**
   * 클래스 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
    this._split.destroy();
    this._split = undefined;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public commonUtil = CommonUtil;
  public getDimensionTypeIconClass = Field.getDimensionTypeIconClass;
  public getMeasureTypeIconClass = Field.getMeasureTypeIconClass;

  /**
   * 차원값의 타입 아이콘 클래스 반환
   * @param {type} logicalType
   * @return {string}
   */
  public getTypeClass(logicalType: string): string {
    if ('STRING' === logicalType || 'TEXT' === logicalType ) {
      return 'ddp-icon-dimension-ab';
    } else if ('LNG' === logicalType || 'LNT' === logicalType) {
      return 'ddp-icon-dimension-local';
    } else if ('TIMESTAMP' === logicalType) {
      return 'ddp-icon-dimension-calen';
    } else if ('BOOLEAN' === logicalType) {
      return 'ddp-icon-dimension-tf';
    } else if ('DOUBLE' === logicalType) {
      return 'ddp-icon-measure-float';
    } else if ('INTEGER' === logicalType) {
      return 'ddp-icon-measure-sharp';
    }
  } // function - getTypeClass

  /**
   * 데이터소스 변경에 대한 처리
   * @param {BoardDataSource} dataSource
   */
  public changeDataSource(dataSource: BoardDataSource) {

    if (dataSource) {
      // 초기값 설정
      (isNullOrUndefined(dataSource.type)) && (dataSource.type = 'default');

      if (ConnectionType.LINK.toString() === dataSource.connType) {
        this.isLinkedDataSource = true;

        const pseudoDashboard: Dashboard = new Dashboard();
        pseudoDashboard.configuration = new BoardConfiguration();
        pseudoDashboard.configuration.dataSource = dataSource;
        pseudoDashboard.configuration.fields = dataSource.uiFields;

        this.essentialFilters = _.cloneDeep(dataSource.uiFilters);
        FilterUtil.getPanelContentsList(
          this.essentialFilters,
          pseudoDashboard,
          (filter: InclusionFilter) => {
            const valueList: string[] = filter.valueList;
            if (valueList && 0 < valueList.length) {
              filter['panelContents'] = valueList.join(' , ');
            } else {
              filter['panelContents'] = '(' + this.translateService.instant('msg.comm.ui.list.all') + ')';
            }
          }
        );

      }

      this.dataSource = dataSource;
      this.joinMappings = dataSource.joins;
      this._getCandidateDatasource();
      this._loadGridData();

      this.safelyDetectChanges();
    }

  } // function - changeDataSource

  /**
   * 탭 변경
   * @param {Tab} tabName
   */
  public changeTab(tabName: Tab) {
    this.selectedTab = tabName;
    (Tab.PREVIEW === tabName) && (this._loadGridData());
  } // function - changeTab

  /**
   * 데이터소스 삭제
   */
  public deleteDataSource() {
    this.broadCaster.broadcast('CREATE_BOARD_REMOVE_DS', { dataSourceId: this.dataSource.id });
  } // function - deleteDataSource

  /**
   * 데이터소스 정보 영역을 닫는다.
   */
  public closeDsInfo() {
    this.broadCaster.broadcast('CREATE_BOARD_CLOSE_DS');
  } // function - closeDsInfo

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Data Preview
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Grid Row 설정
   * @param {number} event
   */
  public setGridRow(event: number) {
    // Row 설정
    this.rowNum = event;
    // 조회
    this._loadGridData();
  } // function - setGridRow

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Join
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Join 설정 팝업 표시
   * @param {JoinMapping} join
   * @param {string} targetDsId
   */
  public showJoinPopup(join?: JoinMapping, targetDsId?: string) {
    if (isNullOrUndefined(join)) {
      // New Join - 1 Depth
      this._joinPopupComp.addJoin(this.dataSource, this._candidateDataSources, this.joinMappings, this.dataSource);
    } else {
      if (isNullOrUndefined(targetDsId)) {
        // New Join - 2 Depth
        const targetDs: Datasource = this._allDataSources.find((ds) => ds.id === join.id);
        let metads: BoardDataSource = new BoardDataSource();
        metads.id = targetDs.id;
        metads.name = targetDs.name;
        metads.engineName = targetDs.engineName;
        metads.connType = targetDs.connType.toString();
        metads.uiFields = targetDs.fields;
        this._joinPopupComp.addJoin(
          this.dataSource, this._candidateDataSources, this.joinMappings,
          metads, join
        );
      } else {
        // Edit Join
        const leftDs = BoardDataSource.convertDsToMetaDs(this._allDataSources.find(ds => ds.id === targetDsId));
        const rightDs = BoardDataSource.convertDsToMetaDs(this._allDataSources.find(ds => ds.id === join.id));
        this._joinPopupComp.editJoin(
          this.dataSource, this._candidateDataSources, this.joinMappings,
          leftDs, rightDs, join, targetDsId
        );
      }
    }
  } // function - showJoinPopup

  /**
   * 조인 변경
   * @param {JoinMapping[]} joinMappings
   */
  public changeJoin(joinMappings: JoinMapping[]) {
    this.joinMappings = joinMappings;
    this.dataSource.joins = joinMappings;
    this.broadCaster.broadcast('CREATE_BOARD_UPDATE_DS', { dataSource: this.dataSource });
  } // function - changeJoin

  // noinspection JSMethodCanBeStatic
  /**
   * 조인 정보를 삭제한다.
   * @param joins
   * @param idx
   */
  public removeJoin(joins, idx) {
    joins.splice(idx, 1);
  } // function - removeJoin

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - Essential Filter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Essential Filter 재설정을 위해 팝업 표시
   */
  public showEssentialFilerPopup() {
    this.broadCaster.broadcast('CREATE_BOARD_RE_INGESTION', { dataSource: this.dataSource });
  } // function - showEssentialFilerPopup

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - Data Preview
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 그리드 데이터 조회
   * @private
   */
  private _loadGridData() {
    (this.gridComponent) && (this.gridComponent.destroy());

    this._queryData(this.joinMappings, this.dataSource.temporary).then(data => {
      this.headerCnt = data[1].length;
      if (0 < data[0].length && 0 < data[1].length) {
        // No Data 영역 숨김
        this.isEmptyMainGrid = false;
        // 조회 건수 재조정
        (this.rowNum > data[0].length) && (this.rowNum = data[0].length);
        // 그리드 표시
        this._updateGrid(data[0], data[1]);
      } else {
        this.rowNum = 0;
        this.isEmptyMainGrid = true;
      }
      this.loadingHide();
      this.changeDetect.detectChanges();
    }).catch(err => this.commonExceptionHandler(err));

  } // function - _loadGridData

  /**
   * 그리드 갱신
   * @param data
   * @param {Field[]} fields
   * @private
   */
  private _updateGrid(data: any, fields: Field[]) {

    // 헤더정보 생성
    const headers: header[] = fields.map(
      (field: Field) => {
        /* 62 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth: number = Math.floor(pixelWidth(field.name, { size: 12 })) + 62;
        return new SlickGridHeader()
          .Id(field.name)
          .Name(field.name)
          .Field(field.name)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(headerWidth)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(true)
          .build();
      }
    );

    let rows: any[] = data;

    if (data.length > 0 && !data[0].hasOwnProperty('id')) {
      rows = rows.map((row: any, idx: number) => {
        row.id = idx;
        return row;
      });
    }

    this.gridComponent.destroy();

    if (0 < headers.length) {
      this.gridComponent.create(headers, rows, new GridOption()
        .SyncColumnCellResize(true)
        .MultiColumnSort(true)
        .RowHeight(32)
        .build()
      );

      if (0 === rows.length) {
        this.gridComponent.invalidateAllRows();
        this.gridComponent.elementRef.nativeElement.querySelector('.grid-canvas').innerHTML =
          '<div class="ddp-data-empty"><span class="ddp-data-contents">'
          + this.translateService.instant('msg.space.ui.no.data')
          + '</span></div>';
      }
    }

  } // function - _updateGrid

  /**
   * 데이터를 조회한다. 
   * @param {JoinMapping[]} joins
   * @param {boolean} isTemporary
   * @param {boolean} loading
   * @return {Promise<[any , Field[]]>}
   * @private
   */
  private _queryData(joins: JoinMapping[], isTemporary: boolean = false, loading: boolean = true): Promise<[any, Field[]]> {
    return new Promise<any>((res, rej) => {

      const params = new QueryParam();
      params.limits.limit = this.rowNum;

      params.dataSource = new BoardDataSource();
      params.dataSource.type = 'default';
      params.dataSource.name = this.dataSource.engineName;
      params.dataSource.temporary = this.dataSource.temporary;

      // 조인 설정
      if (joins && joins.length > 0) {
        params.dataSource.type = 'mapping';
        params.dataSource['joins'] = joins;
      } // end if - joinMapping

      (loading) && (this.loadingShow());
      this.datasourceService.getDatasourceQuery(params).then((data) => {
        let fieldList: Field[] = [];
        if (data && 0 < data.length) {
          fieldList = Object.keys(data[0]).map(keyItem => {
            const tempInfo = new Field();
            tempInfo.name = keyItem;
            return tempInfo;
          });
        }
        res([data, fieldList]);
        this.loadingHide();
      }).catch((err) => {
        rej(err);
        this.loadingHide();
      });
    });
  } // function - _queryData


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - Data Preview
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 룩업 데이터소스 목록 가져오기
   * @private
   */
  private _getCandidateDatasource() {
    const params = {
      size: 100000,
      page: this.page.page,
      status : Status.ENABLED
    };
    this.datasourceService.getDatasources(this.workspaceId, params, 'forDetailView').then((data) => {
      this._allDataSources = data['_embedded'].datasources;
      const candidateDataSources = this._allDataSources.filter((ds) => {
        if (ds.id === this.dataSource.id) {
          // 데이터소스 요약 정보
          (ds.summary) && (this.dataSourceSummary = ds.summary);
          // 필드 정보 정리
          if (ds.fields) {
            const fieldMap = ds.fields.reduce((accumulator, field: Field) => {
              if (accumulator[field.type]) {
                accumulator[field.type] = accumulator[field.type] + 1;
              } else {
                accumulator[field.type] = 1;
              }
              return accumulator;
            }, {});
            this.colTypes = Object.keys(fieldMap).map(key => {
              return { type: key, cnt: fieldMap[key] };
            });
          }
          return false;
        } else {
          return true;
        }
      });
      this.isEnableJoin = (candidateDataSources && 0 < candidateDataSources.length);
      this._candidateDataSources = candidateDataSources;
      this.safelyDetectChanges();
    }).catch((error) => {
      console.error(error);
      Alert.error(this.translateService.instant('msg.board.alert.fail.load.datasource'))
    });
  } // function - _getCandidateDatasource

}

enum Tab {
  PREVIEW = <any>'PREVIEW',
  JOIN = <any>'JOIN',
  FILTER = <any>'FILTER'
}
