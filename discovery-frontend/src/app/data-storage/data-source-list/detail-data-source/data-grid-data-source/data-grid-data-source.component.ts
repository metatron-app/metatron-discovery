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
import {
  ConnectionType,
  Datasource,
  Field,
  FieldFormat,
  FieldFormatType,
  FieldRole,
  LogicalType
} from '../../../../domain/datasource/datasource';
import {QueryParam} from '../../../../domain/dashboard/dashboard';
import * as _ from 'lodash';
import {DatasourceService} from '../../../../datasource/service/datasource.service';
import {header, SlickGridHeader} from '../../../../common/component/grid/grid.header';
import {GridOption} from '../../../../common/component/grid/grid.option';
import {DataconnectionService} from '../../../../dataconnection/service/dataconnection.service';
import {Metadata} from '../../../../domain/meta-data-management/metadata';
import {isNullOrUndefined} from 'util';
import {
  AuthenticationType,
  Dataconnection,
  ImplementorType,
  JdbcDialect
} from '../../../../domain/dataconnection/dataconnection';
import {TimezoneService} from "../../../service/timezone.service";
import {DataSourceCreateService, TypeFilterObject} from "../../../service/data-source-create.service";
import {StringUtil} from "../../../../common/util/string.util";
import {StorageService} from "../../../service/storage.service";

@Component({
  selector: 'data-grid-datasource',
  templateUrl: './data-grid-data-source.component.html'
})
export class DataGridDataSourceComponent extends AbstractPopupComponent implements OnInit {

  @ViewChild("main")
  private _gridComponent: GridComponent;

  // grid data
  private _gridData: any[];

  @Input()
  public readonly datasource: Datasource;

  // 메타데이터 정보
  @Input()
  public readonly metaData: Metadata;

  // 필드 목록
  public fields: Field[];

  // filter list
  public readonly roleTypeFilterList: TypeFilterObject[] = this.datasourceCreateService.getRoleTypeFilterList();
  public selectedRoleTypeFilter: TypeFilterObject;
  public readonly logicalTypeFilterList: TypeFilterObject[] = this.datasourceCreateService.getLogicalTypeFilterList().filter(type => type.value !== LogicalType.USER_DEFINED);
  public selectedLogicalTypeFilter: TypeFilterObject;

  // 검색어
  public searchTextKeyword: string;

  // 그리도 data num
  public rowNum: number = 100;

  // exist timestamp flag
  public isExistTimestamp: boolean;
  // derived field list
  public derivedFieldList: Field[];

  // enum
  public readonly CONN_TYPE: any = ConnectionType;

  // 생성자
  constructor(private datasourceCreateService: DataSourceCreateService,
              private datasourceService: DatasourceService,
              private connectionService: DataconnectionService,
              private timezoneService: TimezoneService,
              private storageService: StorageService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // ui init
    this._initView();
    // 그리드 데이터 조회
    this.fields = this.datasource.fields;
    // set exist timestamp flag
    this.isExistTimestamp = this.fields.some(field => field.logicalType === LogicalType.TIMESTAMP && (this.timezoneService.isEnableTimezoneInDateFormat(field.format) || field.format && field.format.type === FieldFormatType.UNIX_TIME));
    // derived field list
    this._setDerivedFieldList(this.fields);
    // set field data list
    this._setFieldDataList(this.datasource)
      .then(result => this._updateGrid(this._gridData, this.fields))
      .catch(error => this.commonExceptionHandler(error));
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
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
    $(`<div class="slick-data">${_.find(this.fields, {'name': args.column.id}).logicalName || ''}</div>`).appendTo(args.node);
  }

  /**
   * Change role type event
   * @param {TypeFilterObject} type
   */
  public onChangeRoleType(type: TypeFilterObject): void {
    if (this.selectedRoleTypeFilter.value !== type.value) {
      // role type change
      this.selectedRoleTypeFilter = type;
      // grid update
      this._updateGrid(this._gridData, this.fields);
    }
  }


  /**
   * Change logical type event
   * @param {TypeFilterObject} type
   */
  public onChangeLogicalType(type: TypeFilterObject): void {
    if (this.selectedLogicalTypeFilter.value !== type.value) {
      // change logical type
      this.selectedLogicalTypeFilter = type;
      // grid update
      this._updateGrid(this._gridData, this.fields);
    }
  }

  /**
   * 리셋 필터링
   */
  public onClickResetFilter(): void {
    // 검색어 초기화
    this.searchTextKeyword = undefined;
    // set selected role type filter
    this.selectedRoleTypeFilter = this.roleTypeFilterList[0];
    // set selected logical type filter
    this.selectedLogicalTypeFilter = this.logicalTypeFilterList[0];
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
      // set field data list
      this._setFieldDataList(this.datasource)
        .then(result => this._updateGrid(this._gridData, this.fields))
        .catch(error => this.commonExceptionHandler(error));
    }
  }

  /**
   * ui init
   * @private
   */
  private _initView(): void {
    // set selected role type filter
    this.selectedRoleTypeFilter = this.roleTypeFilterList[0];
    // set selected logical type filter
    this.selectedLogicalTypeFilter = this.logicalTypeFilterList[0];
  }

  /**
   * 그리드 업데이트
   * @param data
   * @param fields
   * @private
   */
  private _updateGrid(data: any, fields: any): void {
    // 헤더정보 생성
    const headers: header[] = this._getGridHeader(this._getFilteredFieldList(fields));
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
      isNullOrUndefined(this.metaData)
        ? this._gridComponent.create(headers, rows, new GridOption()
        .SyncColumnCellResize(true)
        .MultiColumnSort(true)
        .RowHeight(32)
        .build())
        : this._gridComponent.create(headers, rows, new GridOption()
        .SyncColumnCellResize(true)
        .MultiColumnSort(true)
        .RowHeight(32)
        .ShowHeaderRow(true)
        .HeaderRowHeight(32)
        .ExplicitInitialization(true)
        .build());
      // search
      this._gridComponent.search(this.searchTextKeyword || '');
      // ExplicitInitialization 을 true 로 줬기 떄문에 init해줘야 한다.
      !isNullOrUndefined(this.metaData) && this._gridComponent.grid.init();
    } else {
      this._gridComponent.destroy();
    }
  }

  /**
   * Get filtered field list
   * @param {Field[]} field
   * @return {Field[]}
   * @private
   */
  private _getFilteredFieldList(field: Field[]): Field[] {
    return field.filter(field => (this.selectedRoleTypeFilter.value === 'ALL' ? true : (FieldRole.DIMENSION === this.selectedRoleTypeFilter.value && FieldRole.TIMESTAMP === field.role ? field : this.selectedRoleTypeFilter.value === field.role))
      && (this.selectedLogicalTypeFilter.value === 'ALL' ? true : this.selectedLogicalTypeFilter.value === field.logicalType));
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
    // if exist derived field list
    if (this.derivedFieldList.length > 0) {
      // Style
      const defaultStyle: string = 'line-height:30px;';
      const nullStyle: string = 'color:#b6b9c1;';
      const noPreviewGuideMessage: string = this.translateService.instant('msg.dp.ui.no.preview');

      return fields.map((field: Field) => {
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
          .Formatter((row, cell, value) => {
            // if derived expression type or LINK geo type
            if (field.derived && (field.logicalType === LogicalType.STRING || this.datasource.connType === ConnectionType.LINK)) {
              return '<div  style="' + defaultStyle + nullStyle + '">' + noPreviewGuideMessage + '</div>';
            } else {
              return value;
            }
          })
          .build();
      });
    } else {
      return fields.map((field: Field) => {
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
   * 커넥션 파라메터
   * @param {any} ingestion
   * @param {Dataconnection} connection
   * @returns {{connection: {hostname; port; username; password; implementor}; database: any; type: any; query: any}}
   * @private
   */
  private _getConnectionParams(ingestion: any, connection: Dataconnection) {
    const connectionType = this.storageService.findConnectionType(connection.implementor);
    const params = {
      connection: {
        implementor: connection.implementor,
        authenticationType: connection.authenticationType || AuthenticationType.MANUAL
      },
      database: ingestion.database,
      type: ingestion.dataType,
      query: ingestion.query
    };
    // if not used URL
    if (StringUtil.isEmpty(connection.url)) {
      params.connection['hostname'] = connection.hostname;
      params.connection['port'] = connection.port;
      if (this.storageService.isRequireCatalog(connectionType)) {
        params.connection['catalog'] = connection.catalog;
      } else if (this.storageService.isRequireDatabase(connectionType)) {
        params.connection['database'] = connection.database;
      } else if (this.storageService.isRequireSid(connectionType)) {
        params.connection['sid'] = connection.sid;
      }
    } else {  // if used URL
      params.connection['url'] = connection.url;
    }
    // if security type is not USERINFO, add password and username
    if (connection.authenticationType !== AuthenticationType.USERINFO) {
      params.connection['username'] = connection.authenticationType === AuthenticationType.DIALOG ? ingestion.connectionUsername : connection.username;
      params.connection['password'] = connection.authenticationType === AuthenticationType.DIALOG ? ingestion.connectionPassword : connection.password;
    }
    return params;
  }

  /**
   * Set derived field list
   * @param {Field[]} fieldList
   * @private
   */
  private _setDerivedFieldList(fieldList: Field[]): void {
    this.derivedFieldList = fieldList.filter(field => field.derived);
  }

  /**
   * Set field data list
   * @param {Datasource} datasource
   * @return {Promise<any>}
   * @private
   */
  public _setFieldDataList(datasource: Datasource): Promise<any> {
    return new Promise((resolve, reject) => {
      // 로딩 show
      this.loadingShow();
      // Linked datasource
      if (datasource.connType === ConnectionType.LINK) {
        // used preset : source.connection
        // not used preset : source.ingestion.connection
        const connection: Dataconnection = datasource.connection || datasource.ingestion.connection;
        this.connectionService.getTableDetailWitoutId(this._getConnectionParams(datasource.ingestion, connection), connection.implementor === ImplementorType.HIVE, this.rowNum < 1 ? 100 : this.rowNum)
          .then((result: {data: any, fields: Field[], totalRows: number}) => {
            // grid data
            this._gridData = result.data;
            // if row num different data length
            (this.rowNum !== result.data.length) && (this.rowNum = result.data.length);
            // 로딩 hide
            this.loadingHide();
            resolve(result);
          })
          .catch(error => reject(error));
      } else if (datasource.connType === ConnectionType.ENGINE) { // Engine datasource
        // params
        const params = new QueryParam();
        params.limits.limit = this.rowNum < 1 ? 100 : this.rowNum;
        params.dataSource.name = datasource.engineName;
        params.dataSource.engineName = datasource.engineName;
        params.dataSource.connType = 'ENGINE';
        params.dataSource.type = 'default';
        this.datasourceService.getDatasourceQuery(params)
          .then((result) => {
            // grid data
            this._gridData = result;
            // if row num different data length
            (this.rowNum !== result.length) && (this.rowNum = result.length);
            // 로딩 hide
            this.loadingHide();
            resolve(result);
          })
          .catch(error => reject(error));
      }
    });
  }
}
