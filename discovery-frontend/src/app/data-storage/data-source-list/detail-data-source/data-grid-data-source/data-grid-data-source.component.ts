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

import { AbstractPopupComponent } from '../../../../common/component/abstract-popup.component';
import { Component, ElementRef, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { GridComponent } from '../../../../common/component/grid/grid.component';
import { Datasource, Field } from '../../../../domain/datasource/datasource';
import { QueryParam } from '../../../../domain/dashboard/dashboard';
import * as _ from 'lodash';
import { DatasourceService } from '../../../../datasource/service/datasource.service';
import { header, SlickGridHeader } from '../../../../common/component/grid/grid.header';
import { GridOption } from '../../../../common/component/grid/grid.option';
import { DataconnectionService } from '../../../../dataconnection/service/dataconnection.service';
import { Metadata } from '../../../../domain/meta-data-management/metadata';
import { isUndefined } from 'util';
import { MetadataColumn } from '../../../../domain/meta-data-management/metadata-column';
import { ConnectionType, Dataconnection } from '../../../../domain/dataconnection/dataconnection';

enum FieldRoleType {
  ALL = <any>'ALL',
  DIMENSION = <any>'DIMENSION',
  MEASURE = <any>'MEASURE'
}

@Component({
  selector: 'data-grid-datasource',
  templateUrl: './data-grid-data-source.component.html'
})
export class DataGridDataSourceComponent extends AbstractPopupComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild("main")
  private _gridComponent: GridComponent;

  // grid data
  private _gridData: any[];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public datasource: Datasource;

  // 메타데이터 정보
  @Input()
  public metaData: Metadata;

  // Field Role
  public fieldRoleType = FieldRoleType;
  public selectedFieldRole: FieldRoleType = this.fieldRoleType.ALL;

  // logical type list
  public logicalTypes: any[];
  public selectedLogicalType: any;
  // logical type list flag
  public isShowLogicalTypesFl: boolean = false;

  // 검색어
  public searchText: string = '';

  // 그리도 data num
  public rowNum: number = 100;

  // 필드 목록
  public fields: Field[] = [];

  // 현재 마스터 데이터소스의 연결 타입
  public connType: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              private connectionService: DataconnectionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // ui init
    this._initView();
    // 그리드 데이터 조회
    this.fields = this.datasource.fields;
    // 마스터 소스 타입
    this.connType = this.datasource.hasOwnProperty('connType') ? this.datasource.connType.toString() : 'ENGINE';
    // linked인 경우
    if (this.connType === 'LINK') {
      // 연결형일때 데이터 조회
      this._getQueryDataInLinked(this.datasource);
    } else {
      // 수집형일 때
      this._getQueryData(this.datasource);
    }
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 메타데이터가 있는지
   * @returns {boolean}
   */
  public isExistMetaData(): boolean {
    return !isUndefined(this.metaData);
  }

  /**
   * init searchText
   * @param {boolean} updateGridFl
   */
  public initSearchText(updateGridFl?: boolean): void {
    this.searchText = '';
    // 그리드 업데이트
    if (updateGridFl) {
      this._updateGrid(this._gridData, this.fields);
    }
  }

  /**
   * 메타데이터 헤더 생성
   * @param args
   */
  public createMetaDataHeader(args: any): void {
    // TODO 추후 그리드 자체에서 생성하도록 변경하기
    $('<div class="slick-data">('+ _.find(this.metaData.columns, {'physicalName': args.column.id}).name +')</div>')
      .appendTo(args.node);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 검색 이벤트
   * @param {KeyboardEvent} event
   */
  public onSearchText(event: KeyboardEvent): void {
    if (13 === event.keyCode) {
      // search text
      this.searchText = event.target['value'];
      // grid update
      this._updateGrid(this._gridData, this.fields);
    }
  }

  /**
   * role type 필터링 변경 이벤트
   * @param {FieldRoleType} type
   */
  public onChangeRoleType(type: FieldRoleType): void {
    // role type change
    this.selectedFieldRole = type;
    // grid update
    this._updateGrid(this._gridData, this.fields);
  }

  /**
   * logical type 필터링 변경 이벤트
   * @param {MouseEvent} event
   * @param type
   */
  public onChangeLogicalType(event: MouseEvent, type): void {
    // event stop
    event.stopPropagation();
    event.preventDefault();
    // flag
    this.isShowLogicalTypesFl = false;
    // change logical type
    this.selectedLogicalType = type;
    // grid update
    this._updateGrid(this._gridData, this.fields);
  }

  /**
   * 리셋 필터링
   */
  public onClickResetFilter(): void {
    // 검색어 초기화
    this.initSearchText();
    // role type
    this.selectedFieldRole = FieldRoleType.ALL;
    // logical type
    this.selectedLogicalType = this.logicalTypes[0];
    // grid
    this._updateGrid(this._gridData, this.fields);
  }

  /**
   * 그리드 데이터 엑셀 다운로드
   */
  public onClickExcelDownload(): void {
    this._gridComponent.csvDownload(this.datasource.name);
  }

  /**
   * 가져올 데이터 row 수 변경 이벤트
   * @param {KeyboardEvent} event
   */
  public onChangeRowNumber(event: KeyboardEvent): void {
    if (13 === event.keyCode) {
      this.rowNum = event.target['value'];
      // Query Data
      this._getQueryData(this.datasource);
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // logicalType
    this.logicalTypes = [
      { label: this.translateService.instant('msg.comm.ui.list.all'), value: 'all' },
      { label: this.translateService.instant('msg.storage.ui.list.string'), value: 'STRING' },
      { label: this.translateService.instant('msg.storage.ui.list.boolean'), value: 'BOOLEAN' },
      { label: this.translateService.instant('msg.storage.ui.list.integer'), value: 'INTEGER' },
      { label: this.translateService.instant('msg.storage.ui.list.double'), value: 'DOUBLE' },
      { label: this.translateService.instant('msg.storage.ui.list.date'), value: 'TIMESTAMP' },
      { label: this.translateService.instant('msg.storage.ui.list.lnt'), value: 'LNT' },
      { label: this.translateService.instant('msg.storage.ui.list.lng'), value: 'LNG' }
    ];
    this.selectedLogicalType = this.logicalTypes[0];
    // search
    this.searchText = '';
    // filter
    this.fieldRoleType = FieldRoleType;
    this.selectedFieldRole = this.fieldRoleType.ALL;
  }

  /**
   * 그리드 업데이트
   * @param data
   * @param fields
   * @private
   */
  private _updateGrid(data: any, fields: any): void {
    // 헤더정보 생성
    const headers: header[] = this._getGridHeader(fields);
    // rows
    let rows: any[] = data;
    // row and headers가 있을 경우에만 그리드 생성
    if (rows && 0 < headers.length) {
      if (rows.length > 0 && !rows[0].hasOwnProperty('id')) {
        rows = rows.map((row: any, idx: number) => {
          row.id = idx;
          return row;
        });
      }

      ( this.rowNum > rows.length ) && ( this.rowNum = rows.length );
      // dom 이 모두 로드되었을때 작동
      this.changeDetect.detectChanges();
      // 그리드 생성
      this.isExistMetaData()
        ? this._gridComponent.create(headers, rows, new GridOption()
        .SyncColumnCellResize(true)
        .MultiColumnSort(true)
        .RowHeight(32)
        .ShowHeaderRow(true)
        .HeaderRowHeight(32)
        .ExplicitInitialization(true)
        .build())
        : this._gridComponent.create(headers, rows, new GridOption()
        .SyncColumnCellResize(true)
        .MultiColumnSort(true)
        .RowHeight(32)
        .build());
      // search
      this._gridComponent.search(this.searchText);
      // ExplicitInitialization 을 true 로 줬기 떄문에 init해줘야 한다.
      this.isExistMetaData() && this._gridComponent.grid.init();
    } else {
      this._gridComponent.destroy();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 그리드 header 리스트 생성
   * @param {Field[]} fields
   * @returns {header[]}
   * @private
   */
  private _getGridHeader(fields: Field[]): header[] {
    // header 생성
    return fields
      .filter((item: Field) => {
        // role
        let isValidRole: boolean = ( FieldRoleType.ALL === this.selectedFieldRole )
          ? true
          : ( item.role.toString() === 'TIMESTAMP' ? this.selectedFieldRole.toString() === 'DIMENSION' : item.role.toString() === this.selectedFieldRole.toString());
        // type
        let isValidType: boolean = ( 'all' === this.selectedLogicalType.value ) ? true : ( item.logicalType === this.selectedLogicalType.value );
        return ( isValidRole && isValidType );
      })
      .map((field: Field) => {
        const headerName: string = field.headerKey || field.name;
        return new SlickGridHeader()
          .Id(headerName)
          .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.logicalType.toString()) + '"></em>' + headerName + '</span>')
          .Field(headerName)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(10 * (headerName.length) + 20)
          .MinWidth(100)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(true)
          .build();
      });
  }

  /**
   * Get query data
   * @param {Datasource} source
   * @private
   */
  private _getQueryData(source: Datasource): void {
      // 로딩 show
      this.loadingShow();
      // params
      const params = new QueryParam();
      params.limits.limit = ( this.rowNum < 1 || 0 === this.rowNum) ? 100 : this.rowNum;
      // 데이터소스인 경우
      const dsInfo = _.cloneDeep(source);
      params.dataSource.name = dsInfo.engineName;
      params.dataSource.engineName = dsInfo.engineName;
      params.dataSource.connType = dsInfo.connType.toString();
      params.dataSource.type = 'default';
      // 조회
      this.datasourceService.getDatasourceQuery(params)
        .then((data) => {
          if (data && 0 < data.length) {
            // grid data
            this._gridData = data;
            // grid update
            this._updateGrid(this._gridData, this.fields);
          }
          // 로딩 hide
          this.loadingHide();
        })
        .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get query data for linked type
   * @param {Datasource} source
   * @param {boolean} extractColumnName
   * @private
   */
  private _getQueryDataInLinked(source: Datasource): void {
    // 로딩 show
    this.loadingShow();
    // 프리셋을 생성한 연결형 : source.connection 사용
    // 커넥션 정보로 생성한 연결형 : source.ingestion.connection 사용
    const connection: Dataconnection = source.connection || source.ingestion.connection;
    const params = source.ingestion && connection
      ? this._getConnectionParams(source.ingestion, connection)
      : {};
    this.connectionService.getTableDetailWitoutId(params, connection.implementor === ConnectionType.HIVE ? true : false)
      .then((data) => {
        // grid data
        this._gridData = data['data'];
        // grid update
        this._updateGrid(this._gridData, this.fields);
        // 로딩 hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 커넥션 파라메터
   * @param {any} ingestion
   * @param {any} connection
   * @returns {{connection: {hostname; port; username; password; implementor}; database: any; type: any; query: any}}
   * @private
   */
  private _getConnectionParams(ingestion: any, connection: any) {
    const params = {
      connection: {
        hostname: connection.hostname,
        port: connection.port,
        implementor: connection.implementor,
        authenticationType: connection.authenticationType || 'MANUAL'
      },
      database: ingestion.database,
      type: ingestion.dataType,
      query: ingestion.query
    };
    // if security type is not USERINFO, add password and username
    if (connection.authenticationType !== 'USERINFO') {
      params['connection']['username'] = connection.authenticationType === 'DIALOG' ? ingestion.connectionUsername : connection.username;
      params['connection']['password'] = connection.authenticationType === 'DIALOG' ? ingestion.connectionPassword : connection.password;
    }

    // 데이터 베이스가 있는경우
    if (ingestion.connection && ingestion.connection.hasOwnProperty('database')) {
      params['connection']['database'] = ingestion.connection.database;
    }

    return params;
  }
}
