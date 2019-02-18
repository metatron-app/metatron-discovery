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

import {AbstractPopupComponent} from '../../../../common/component/abstract-popup.component';
import {Component, ElementRef, Injector, Input, OnInit, ViewChild} from '@angular/core';
import {GridComponent} from '../../../../common/component/grid/grid.component';
import {Datasource, Field, FieldFormat, FieldFormatType, LogicalType} from '../../../../domain/datasource/datasource';
import {QueryParam} from '../../../../domain/dashboard/dashboard';
import * as _ from 'lodash';
import {DatasourceService} from '../../../../datasource/service/datasource.service';
import {header, SlickGridHeader} from '../../../../common/component/grid/grid.header';
import {GridOption} from '../../../../common/component/grid/grid.option';
import {DataconnectionService} from '../../../../dataconnection/service/dataconnection.service';
import {Metadata} from '../../../../domain/meta-data-management/metadata';
import {isUndefined} from 'util';
import {ConnectionType, Dataconnection} from '../../../../domain/dataconnection/dataconnection';
import {TimezoneService} from "../../../service/timezone.service";

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
  public searchTextKeyword: string;

  // 그리도 data num
  public rowNum: number = 100;

  // 필드 목록
  public fields: Field[] = [];

  // 현재 마스터 데이터소스의 연결 타입
  public connType: string;
  // exist timestamp flag
  public isExistTimestamp: boolean;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              private connectionService: DataconnectionService,
              private timezoneService: TimezoneService,
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
    // set exist timestamp flag
    this.isExistTimestamp = this.datasource.fields.some(field => field.logicalType === LogicalType.TIMESTAMP && (this.timezoneService.isEnableTimezoneInDateFormat(field.format) || field.format && field.format.type === FieldFormatType.UNIX_TIME));
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
   * Is unix type field
   * @param {Field} field
   * @return {boolean}
   */
  public isUnixTypeField(field: Field): boolean {
    return field.format && field.format.type === FieldFormatType.UNIX_TIME;
  }


  /**
   * Change search text keyword and update grid list
   * @param text
   */
  public searchText(text: string): void {
    // change search text keyword
    this.searchTextKeyword = text;
    // update grid
    this._updateGrid(this._gridData, this.fields);
  }

  /**
   * Extend grid header
   * @param args
   */
  public extendGridHeader(args: any): void {
    $(`<div class="slick-data">${_.find(this.metaData.columns, {'physicalName': args.column.id}).name}</div>`).appendTo(args.node);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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
    this.searchTextKeyword = '';
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
    this.searchTextKeyword = '';
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
      this._gridComponent.search(this.searchTextKeyword);
      // ExplicitInitialization 을 true 로 줬기 떄문에 init해줘야 한다.
      this.isExistMetaData() && this._gridComponent.grid.init();
    } else {
      this._gridComponent.destroy();
    }
  }

  /**
   * Get timezone label
   * @param {FieldFormat} format
   * @return {string}
   * @private
   */
  private _getTimezoneLabel(format: FieldFormat): string {
    if (format.type === FieldFormatType.UNIX_TIME) {
      return 'Unix time';
    } else {
      return this.timezoneService.getConvertedTimezoneUTCLabel(this.timezoneService.getTimezoneObject(format).utc);
    }
  }

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
          .Name(this._getGridHeaderName(field, headerName))
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
   * Get grid header name
   * @param {Field} field
   * @param {string} headerName
   * @return {string}
   * @private
   */
  private _getGridHeaderName(field: Field, headerName: string): string {
    return field.logicalType === LogicalType.TIMESTAMP && (this.timezoneService.isEnableTimezoneInDateFormat(field.format) || field.format && field.format.type === FieldFormatType.UNIX_TIME)
      ? `<span style="padding-left:20px;"><em class="${this.getFieldTypeIconClass(field.logicalType.toString())}"></em>${headerName}<div class="slick-column-det" title="${this._getTimezoneLabel(field.format)}">${this._getTimezoneLabel(field.format)}</div></span>`
      : `<span style="padding-left:20px;"><em class="${this.getFieldTypeIconClass(field.logicalType.toString())}"></em>${headerName}</span>`;
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
        // set fields
        this.fields = data['fields'];
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
