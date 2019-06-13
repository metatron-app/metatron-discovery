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

import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, QueryList, Renderer, ViewChildren} from '@angular/core';
import {AbstractComponent} from '../../../../common/component/abstract.component';
import {
  ConnectionType,
  Datasource,
  FieldFormat,
  FieldFormatType,
  FieldRole, LogicalType
} from '../../../../domain/datasource/datasource';
import * as _ from 'lodash';
import {MetadataService} from '../../../metadata/service/metadata.service';
import {MetadataModelService} from '../../../metadata/service/metadata.model.service';
import {MetadataColumn} from '../../../../domain/meta-data-management/metadata-column';
import {CodeTable} from '../../../../domain/meta-data-management/code-table';
import {ColumnDictionary} from '../../../../domain/meta-data-management/column-dictionary';
import {CodeTableService} from '../../../code-table/service/code-table.service';
import {CodeValuePair} from '../../../../domain/meta-data-management/code-value-pair';
import {ColumnDictionaryService} from '../../../column-dictionary/service/column-dictionary.service';
import {Alert} from '../../../../common/util/alert.util';
import {CommonUtil} from '../../../../common/util/common.util';
import {ConstantService} from '../../../../shared/datasource-metadata/service/constant.service';
import {Type} from '../../../../shared/datasource-metadata/domain/type';
import {Filter} from '../../../../shared/datasource-metadata/domain/filter';
import {DataconnectionService} from '../../../../dataconnection/service/dataconnection.service';
import {QueryParam} from '../../../../domain/dashboard/dashboard';
import {DatasourceService} from '../../../../datasource/service/datasource.service';
import {AuthenticationType, Dataconnection, ImplementorType} from '../../../../domain/dataconnection/dataconnection';
import {StringUtil} from '../../../../common/util/string.util';
import {StorageService} from '../../../../data-storage/service/storage.service';
import {Metadata} from '../../../../domain/meta-data-management/metadata';
import {DatetimeValidPopupComponent} from '../../../../shared/datasource-metadata/component/datetime-valid-popup.component';

class Order {
  key: string = 'physicalName';
  sort: string = 'asc';
}

@Component({
  selector: 'app-metadata-detail-columnschema',
  templateUrl: './column-schema.component.html'
})
export class ColumnSchemaComponent extends AbstractComponent implements OnInit, OnDestroy {

  public readonly UUID = CommonUtil.getUUID();
  public readonly ROLE = Type.Role;
  public readonly TYPE_SELECT_AND_TIMESTAMP_VALID_WRAP_ELEMENT = this.UUID + '-type-select-and-timestamp-valid-wrap-pupop-elm';
  public readonly TIMESTAMP_VALID_PUPOP_ELEMENT = this.UUID + '-timestamp-valid-pupop-elm';
  public readonly TYPE_SELECT_PUPOP_ELEMENT = this.UUID + '-type-select-pupop-elm';

  /**
   * Sort
   */
  public readonly selectedContentSort: Order = new Order();

  /**
   * Logical
   */
  public readonly LOGICAL = Type.Logical;

  @Input()
  public isNameEdit: boolean;

  /**
   * List Of Fields
   */
  public columnList: MetadataColumn[];

  /**
   * Logical Type List
   */
  public logicalTypeList: any[];

  public logicalTypeEtcList: any[];

  public selectedRole: Filter.Role = this.constantService.getRoleTypeFilterFirst();

  public selectedType: Filter.Logical = this.constantService.getTypeFiltersFirst();

  public roleTypeFilters: Filter.Role[] = this.constantService.getRoleTypeFilters();

  public typeFilters = this.constantService.getTypeFilters();

  public keyword: number | string = '';

  public isShowTypeFilters: boolean = false;

  public fieldDataList;

  public isSaveInvalid: boolean = false;

  /**
   * Code Table Preview Layer
   */
  @ViewChildren('codeTablePreview')
  private readonly _codeTablePreview: ElementRef;
  @ViewChildren('codeTable')
  private readonly _codeTable: ElementRef;

  /**
   * Logical Type Layer
   */
  @ViewChildren('logicalType')
  private readonly _logicalType: ElementRef;
  @ViewChildren('logicalTypeList')
  private readonly _logicalTypeList: ElementRef;

  @ViewChildren(DatetimeValidPopupComponent)
  private readonly _datetimePopupComponentList: QueryList<DatetimeValidPopupComponent>;

  @Output('chooseCodeTableEvent')
  private readonly _chooseCodeTableEvent = new EventEmitter();
  @Output('chooseDictionaryEvent')
  private readonly _chooseDictionaryEvent = new EventEmitter();

  /**
   * Field List Original
   */
  private _originColumnList: MetadataColumn[];

  /**
   * Current Selected Columns
   */
  private _selectedColumn: MetadataColumn;

  /**
   * Organizational details of code tables
   */
  private _codeTableDetailList: CodeTable[];

  constructor(
    protected element: ElementRef,
    protected injector: Injector,
    public renderer: Renderer,
    public metaDataModelService: MetadataModelService,
    public constantService: ConstantService,
    private _columnDictionaryService: ColumnDictionaryService,
    private _codeTableService: CodeTableService,
    private _metaDataService: MetadataService,
    private _datasourceService: DatasourceService,
    private _storageService: StorageService,
    private _dataconnectionService: DataconnectionService) {
    super(element, injector);
  }

  public ngOnInit() {

    super.ngOnInit();

    this._initView();

    Promise
      .resolve()
      .then(() => this.loadingShow())
      .then(() => this._getColumnSchemas().then())
      .then(() => {
        // TODO #2172 if staging or JDBC type metadata, not used field data
        if (this.hasMetadataColumnInDatasource()) {
          return this.getFieldData()
            .then(fieldDataList => {
              this.fieldDataList = _.isNil(fieldDataList) ? [] : fieldDataList
            });
        }
      })
      .then(() => this.loadingHide())
      .catch(error => this.commonExceptionHandler(error));
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public onClickInfoIcon(metadataColumn: MetadataColumn, index: number): void {
    if (MetadataColumn.isTypeIsTimestamp(metadataColumn)) {
      if (metadataColumn[ 'typeListFl' ]) {
        metadataColumn[ 'typeListFl' ] = false;
      }
      metadataColumn.checked = true;
      this._datetimePopupComponentList.toArray()[ index ].init();
    }
  }

  public hasMetadataColumnInDatasource() {
    return this.isDatasourceSourceTypeIsJdbc() && this.isMetadataSourceTypeIsEngine();
  }

  /**
   * Current field logical type label
   */
  public getSelectedLogicalTypeLabel(metadataColumn: MetadataColumn): string {
    return metadataColumn.type
      ? this.logicalTypeList.filter((type) => {
        return type.value === metadataColumn.type;
      })[ 0 ].label
      : 'Select';
  }

  /**
   * Code preview data
   */
  public getTableCodePair(codeTableId: string): CodeValuePair[] {
    const index = _.findIndex(this._codeTableDetailList, (item) => {
      return codeTableId === item.id;
    });
    return index === -1 ? [] : this._codeTableDetailList[ index ].codes;
  }

  /**
   * Column popularity
   */
  public getColumnPopularity(metadataColumn: MetadataColumn): string {
    return (metadataColumn.popularity || 0) + '%';
  }

  /**
   * If the column of the currently selected type is the logical type
   */
  public isSelectedColumnLogicalType(metadataColumn: MetadataColumn, logicalType: Type.Logical): boolean {
    return metadataColumn.type === logicalType;
  }

  /**
   * Close column view in case scroll occurs
   */
  public onScrollColumnView(): void {
    this.columnList && this.columnList.forEach((column) => {
      column[ 'typeListFl' ] = false;
      column[ 'codeTableShowFl' ] = false;
    });
  }

  /**
   * Save changed fields click event
   */
  public onClickSave(): void {

    // TODO 추후 데이터소스 연결시 if문 제거
    if (this.hasMetadataColumnInDatasource()) {
      this.isSaveInvalid = this.columnList.some(field =>  field.role !== Type.Role.TIMESTAMP && (field.type === Type.Logical.TIMESTAMP && !field.format.isValidFormat));
    }

    if (!this.isSaveInvalid) {
      this._updateColumnSchema();
    }
  }

  /**
   * Logical type list show
   */
  public onShowLogicalTypeList(metadataColumn: MetadataColumn, typeElement, typeListElement): void {

    if (!this.isLogicalTypesLayerActivation(metadataColumn)) {
      return;
    }

    if (this.isSelectedMetadataColumnInColumnDictionaryDefined(metadataColumn) === false) {
      metadataColumn[ 'typeListFl' ] = !metadataColumn[ 'typeListFl' ];
      // detect changes
      this.changeDetect.detectChanges();

      if (metadataColumn[ 'typeListFl' ]) {
        const $selectOptionPop = $(typeListElement);
        const $selectOptionTop = $(typeElement).offset().top;
        const $selectOptionLeft = $(typeElement).offset().left;
        $selectOptionPop.css({
          'position' :'fixed',
          'left' : $selectOptionLeft,
          'top' :$selectOptionTop + 23
        });
        if($selectOptionTop >  $(window).outerHeight() / 2) {
          $selectOptionPop.css({
            'top' : $selectOptionTop - $selectOptionPop.outerHeight() - 5
          });
        }
      }
    }
  }

  /**
   * Logical type change event
   */
  public onChangeLogicalType(metadataColumn: MetadataColumn, logicalType: Type.Logical, index?: number): void {
    event.stopImmediatePropagation();
    if (metadataColumn.type !== logicalType) {
      // prev type
      const prevType: Type.Logical = metadataColumn.type;
      // 변경이벤트 체크
      this._onChangedValue(metadataColumn);
      // 만약 변경될 타입이 logicalType이라면 format init
      if (logicalType === Type.Logical.TIMESTAMP) {
        if (_.isNil(metadataColumn.format)) {
          metadataColumn.format = new FieldFormat();
          metadataColumn.format.type = FieldFormatType.DATE_TIME;
        }
      } else {
        metadataColumn.format = null;
      }
      // logical type 변경
      metadataColumn.type = logicalType;
      // if target logical type timestamp layer open
      if (logicalType === Type.Logical.TIMESTAMP) {
        this.safelyDetectChanges();
        this.onClickInfoIcon(metadataColumn, index);
      } else if (prevType === Type.Logical.TIMESTAMP) {
        this.setIsExistErrorInFieldListFlag();
      }
    }
    metadataColumn[ 'typeListFl' ] = false;
  }

  /**
   * 컬럼 사전 변경 이벤트
   */
  public onChangedColumnDictionary(columnDictionary: ColumnDictionary): void {
    // 변경 on
    this._selectedColumn.replaceFl = true;
    // 현재 선택한 컬럼의 사전 변경
    this._selectedColumn.dictionary = columnDictionary;
    // 컬럼 사전이 있다면 해당 컬럼 사전의 상세정보 조회
    columnDictionary && this._getDetailColumnDictionary(columnDictionary.id);
  }

  /**
   * 코드 테이블 변경 이벤트
   */
  public onChangedCodeTable(codeTable: CodeTable): void {
    // 변경 on
    this._selectedColumn.replaceFl = true;
    this._setCodeTableForSelectedColumn(codeTable);
    this._releaseSelectedColumn();
  }

  /**
   * 코드 테이블 이름 클릭 이벤트
   */
  public onClickCodeTable(metadataColumn: MetadataColumn, index: number): void {
    // event bubbling stop
    event.stopImmediatePropagation();
    // 해당 코드테이블 레이어 팝업 show flag
    metadataColumn.codeTable && (metadataColumn[ 'codeTableShowFl' ] = !metadataColumn[ 'codeTableShowFl' ]);
    // 레이어 팝업 설정
    if (metadataColumn.codeTable && metadataColumn[ 'codeTableShowFl' ]) {
      // 코드테이블 상세정보 목록에 데이터가 있는지
      const codeIndex = _.findIndex(this._codeTableDetailList, (item) => {
        return metadataColumn.codeTable.id === item.id;
      });
      // 해당 코드 정보가 존재하지 않는다면 조회
      codeIndex === -1 && this._getDetailCodeTable(metadataColumn.codeTable.id);
      // detect changes
      this.changeDetect.detectChanges();
      // 레이어 팝업 위치 조정
      const table = this._codeTable[ '_results' ][ index ].nativeElement;
      const preview = this._codeTablePreview[ '_results' ][ index ].nativeElement;
      preview.style.top = (table.getBoundingClientRect().top > (this.$window.outerHeight() / 2))
        ? (table.getBoundingClientRect().top - preview.offsetHeight + 'px')
        : (table.getBoundingClientRect().top + 25 + 'px');
      preview.style.left = table.getBoundingClientRect().left + 'px';
    }
  }

  /**
   * Code table detail click event
   */
  public onClickCodeTableDetails(codeTable: CodeTable): void {
    event.stopImmediatePropagation();
    this._gotoCodeTableDetailView(codeTable);
  }

  /**
   * Dictionary name click event
   */
  public onClickDictionary(dictionary: ColumnDictionary): void {
    event.stopImmediatePropagation();
    this._gotoDictionaryDetailView(dictionary);
  }

  /**
   * Click on metadata column dictionary search event
   */
  public onClickSearchDictionary(metadataColumn: MetadataColumn): void {
    event.stopImmediatePropagation();
    this._saveCurrentlySelectedColumn(metadataColumn);
    this._chooseDictionaryEvent.emit({ name: 'CREATE', dictionary: metadataColumn.dictionary }); // 컬럼 사전 선택 컴포넌트
  }

  /**
   * Code table search click event
   */
  public onClickSearchCodeTable(metadataColumn: MetadataColumn): void {
    event.stopImmediatePropagation();
    if (this.isSelectedMetadataColumnInColumnDictionaryDefined(metadataColumn) === false) {
      // Save the currently selected column
      this._selectedColumn = metadataColumn;
      // Select code table Component call
      this._chooseCodeTableEvent.emit({ name: 'CREATE', codeTable: metadataColumn.codeTable });
    }
  }

  /**
   * If a column dictionary for the selected metadata column is defined
   */
  public isSelectedMetadataColumnInColumnDictionaryDefined(metadataColumn: MetadataColumn) {
    return MetadataColumn.isColumnDictionaryDefined(metadataColumn);
  }

  /**
   * Column alignment click event
   *
   * @param {string} key
   */
  public onClickSort(key: string): void {
    // 정렬 정보 저장
    this.selectedContentSort.key = key;
    // 정렬 key와 일치하면
    if (this.selectedContentSort.key === key) {
      // asc, desc
      switch (this.selectedContentSort.sort) {
        case 'asc':
          this.selectedContentSort.sort = 'desc';
          break;
        case 'desc':
          this.selectedContentSort.sort = 'asc';
          break;
        case 'default':
          this.selectedContentSort.sort = 'desc';
          break;
      }
    }
    this.columnList = _.orderBy(this.columnList, this.selectedContentSort.key, 'asc' === this.selectedContentSort.sort ? 'asc' : 'desc');
  }

  /**
   * Set exist error in field list flag
   */
  public setIsExistErrorInFieldListFlag(): void {
    // TODO 추후 데이터소스 연결시 if문 제거
    if (this.hasMetadataColumnInDatasource()) {
      this.isSaveInvalid = this.columnList.some(field =>  field.role !== Type.Role.TIMESTAMP && (field.type === Type.Logical.TIMESTAMP && !field.format.isValidFormat));
    }
  }

  public isLogicalTypesLayerActivation(metadataColumn: MetadataColumn) {
    return metadataColumn.type !== Type.Logical.GEO_LINE
      && metadataColumn.type !== Type.Logical.GEO_POINT
      && metadataColumn.type !== Type.Logical.GEO_POLYGON
      && this.isTimestampColumn(metadataColumn) === false;
  }

  public isShowInformationIcon(metadataColumn: MetadataColumn) {
    return MetadataColumn.isTypeIsTimestamp(metadataColumn) && !MetadataColumn.isRoleIsTimestamp(metadataColumn);
  }

  public isTimestampColumn(metadataColumn: MetadataColumn) {
    return MetadataColumn.isTimestampColumn(metadataColumn);
  }

  public changeKeyword(keyword: number | string) {
    this.keyword = keyword;
  }

  public selectTypeFilter(type: Filter.Logical) {
    this.selectedType = type;
  }

  public selectRoleFilter(role: Filter.Role) {
    this.selectedRole.checked = false;
    role.checked = true;
    this.selectedRole = role;
  }

  public getColumns() {
    let keyword = _.cloneDeep(this.keyword as string);
    keyword = _.isNil(keyword) ? '' : keyword;
    return this.columnList
      .filter(column => _.isNil(this.selectedType) || this.selectedType.value === 'ALL' ? true : column.type === this.selectedType.value)
      .filter(column => {

        if (_.isNil(this.selectedRole) || this.selectedRole.value === 'ALL') {
          return true;
        }

        let isMetadataColumnRoleIsSameSelectedRole = column.role === this.selectedRole.value;
        if (_.eq(isMetadataColumnRoleIsSameSelectedRole, false)
          && this.selectedRole.value === Type.Role.DIMENSION
          && column.role === Type.Role.TIMESTAMP) {
          return true;
        }

        return isMetadataColumnRoleIsSameSelectedRole;
      }).filter(column => column.physicalName.indexOf(keyword) !== -1);
  }

  public filterInitialize() {
    this.keyword = '';
    this.selectedRole = this.constantService.getRoleTypeFilterFirst();
    this.selectedType = this.constantService.getTypeFiltersFirst();
    this.roleTypeFilters = this.constantService.getRoleTypeFilters();
    this.typeFilters = this.constantService.getTypeFilters();
    this.selectedContentSort.key = 'physicalName';
    this.selectedContentSort.sort = 'asc';
    this.columnList = _.orderBy(this.columnList, this.selectedContentSort.key, 'asc' === this.selectedContentSort.sort ? 'asc' : 'desc');
  }

  public isShowInformationMessage() {
    return this.hasMetadataColumnInDatasource() && this.isNameEdit
  }

  public isValidInformationIcon(metadataColumn: MetadataColumn) {
    return metadataColumn.format && metadataColumn.format.isValidFormat !== false;
  }

  /**
   * Is invalid information icon
   */
  public isInvalidInformationIcon(metadataColumn: MetadataColumn): boolean {
    return metadataColumn.format && metadataColumn.format.isValidFormat === false;
  }

  public onClickTypeSelectAndTimestampValidWrapElement(event: MouseEvent, metadataColumn: MetadataColumn, typeElement, typeListElement) {

    if (this._checkIfElementContainsClassName(this._getTargetElementClassList(event), this.TYPE_SELECT_AND_TIMESTAMP_VALID_WRAP_ELEMENT)) {
      this.onShowLogicalTypeList(metadataColumn, typeElement, typeListElement);
      return;
    }

    // if (this._checkIfElementContainsClassName(this._getTargetElementClassList(event), this.TYPE_SELECT_PUPOP_ELEMENT)) {
    //   metadataColumn.isShowTimestampValidPopup = false;
    //   return;
    // }
    //
    // if (this._checkIfElementContainsClassName(this._getTargetElementClassList(event), this.TIMESTAMP_VALID_PUPOP_ELEMENT)) {
    //   metadataColumn[ 'typeListFl' ] = false;
    //   return;
    // }
  }

  private getFieldData() {

    if (this.hasMetadataColumnInDatasource()) {

      const datasource = this.metaDataModelService.getMetadata().source.source as Datasource;
      if (datasource.connType === ConnectionType.ENGINE) {
        const params = new QueryParam();
        params.limits.limit = 20;
        params.dataSource.name = datasource.engineName;
        params.dataSource.engineName = datasource.engineName;
        params.dataSource.connType = 'ENGINE';
        params.dataSource.type = 'default';
        return new Promise(((resolve, reject) => {
          return this._datasourceService
            .getDatasourceQuery(params)
            .then(result => resolve(result))
            .catch(error => reject(error))
        }));
      }

      if (datasource.connType === ConnectionType.LINK) {
        return new Promise((resolve, reject) => {
          return this._dataconnectionService
            .getTableDetailWitoutId(
              this._getConnectionParams(datasource.ingestion, Datasource.getConnection(datasource)),
              Datasource.getConnection(datasource).implementor === ImplementorType.HIVE
            )
            .then((result) => resolve(result.data))
            .catch(error => reject(error))
        });
      }
    }

    else if (this.isMetadataSourceTypeIsJdbc()) {
      return new Promise((resolve, reject) => {
        return this._dataconnectionService.getTableDataForHive({
          'type': 'TABLE',
          'query': this.metaDataModelService.getMetadata().source.table,
          'database': this.metaDataModelService.getMetadata().source.schema
        })
          .then(result => resolve(result.data))
          .catch(error => reject(error))
      });
    }

    else if (this.isMetadataSourceTypeIsStaging()) {
      return new Promise((resolve, reject) => {
        return this._dataconnectionService.getTableDataForHive({
          'type': 'TABLE',
          'query': this.metaDataModelService.getMetadata().source.table,
          'database': this.metaDataModelService.getMetadata().source.schema
        })
          .then(result => resolve(result.data))
          .catch(error => reject(error))
      });
    }
  }

  /**
   * Get connection params
   * @param {any} ingestion
   * @param {Dataconnection} connection
   * @returns {{connection: {hostname; port; username; password; implementor}; database: any; type: any; query: any}}
   * @private
   */
  private _getConnectionParams(ingestion, connection: Dataconnection) {
    const connectionType = this._storageService.findConnectionType(connection.implementor);
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
      params.connection[ 'hostname' ] = connection.hostname;
      params.connection[ 'port' ] = connection.port;
      if (this._storageService.isRequireCatalog(connectionType)) {
        params.connection[ 'catalog' ] = connection.catalog;
      } else if (this._storageService.isRequireDatabase(connectionType)) {
        params.connection[ 'database' ] = connection.database;
      } else if (this._storageService.isRequireSid(connectionType)) {
        params.connection[ 'sid' ] = connection.sid;
      }
    } else {  // if used URL
      params.connection[ 'url' ] = connection.url;
    }
    // if security type is not USERINFO, add password and username
    if (connection.authenticationType !== AuthenticationType.USERINFO) {
      params.connection[ 'username' ] = connection.authenticationType === AuthenticationType.DIALOG ? ingestion.connectionUsername : connection.username;
      params.connection[ 'password' ] = connection.authenticationType === AuthenticationType.DIALOG ? ingestion.connectionPassword : connection.password;
    }
    return params;
  }

  private _gotoDictionaryDetailView(dictionary: ColumnDictionary) {
    dictionary && this.router.navigate([ 'management/metadata/column-dictionary', dictionary.id ]);
  }

  private _gotoCodeTableDetailView(codeTable: CodeTable) {
    this.router.navigate([ 'management/metadata/code-table', codeTable.id ]);
  }

  /**
   * Save the currently selected metadata column
   */
  private _saveCurrentlySelectedColumn(metadataColumn: MetadataColumn) {
    this._selectedColumn = metadataColumn;
  }

  /**
   * Change event in metadata column occurred
   */
  private _onChangedValue(metadataColumn: MetadataColumn): void {
    // 변경이벤트 체크
    metadataColumn.replaceFl = true;
  }

  /**
   * View initialization
   */
  private _initView(): void {
    this.columnList = [];
    this.logicalTypeList = this.getMetaDataLogicalTypeList();
    this.logicalTypeEtcList = this.getMetaDataLogicalTypeEtcList();
    this._codeTableDetailList = [];
    this.filterInitialize();
  }

  /**
   * Column schema list lookup
   */
  private _getColumnSchemas() {
    return new Promise((resolve, reject) => {
      return this._metaDataService.getColumnSchemaListInMetaData(this.metaDataModelService.getMetadata().id)
        .then((result) => {
          result.map((field) => {
            if (MetadataColumn.isTypeIsTimestamp(field)) {
              if (_.isNil(field.format)) {
                field.format = new FieldFormat();
              }
              field.format.isValidFormat = true;
            }
            return field;
          });
          this._hideCurrentTime(result);
          this.columnList = _.orderBy(result.filter((metadataColumn: MetadataColumn) => MetadataColumn.isCurrentDatetime(metadataColumn) === false), this.selectedContentSort.key, 'asc' === this.selectedContentSort.sort ? 'asc' : 'desc');
          this._saveColumnDataOriginal();
          resolve();
        })
        .catch(error => reject(error))
    });
  }

  private _hideCurrentTime(result) {
    this.columnList = result.filter((metadataColumn: MetadataColumn) => MetadataColumn.isCurrentDatetime(metadataColumn) === false);
  }

  /**
   * Saving column data original
   */
  private _saveColumnDataOriginal() {
    this._originColumnList = _.cloneDeep(this.columnList);
  }

  /**
   * Modify column schema
   */
  private _updateColumnSchema(): void {
    this.loadingShow();
    this._metaDataService.updateColumnSchema(this.metaDataModelService.getMetadata().id, this._getUpdateColumnParams())
      .then(() => {
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        this._refreshColumnSchemas();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  private _refreshColumnSchemas() {
    return this._getColumnSchemas()
      .then(() => {
        this.loadingHide();
      });
  }

  /**
   * Fields to be used for the change
   */
  private _getUpdateColumnParams() {
    // 변경이 일어난 컬럼 목록
    const result = _.cloneDeep(this._getReplaceColumns());
    result.forEach((item: any) => {
      this._convertIdFromStringTypeToNumeric(item);
      this._operationSetting(item);
      this._removeUnnecessaryVariables(item);
      if (this._isNameExistsAndExceeds255Characters(item)) item.name = item.name.substr(0, 254);
      if (this._isDescriptionExistsAndExceeds1000Characters(item)) item.description = item.description.substr(0, 999);
      // format이 있고 255자가 넘어간다면
      if (item.type === 'TIMESTAMP' && item.format && item.format.format && item.format.format.length > 255) {
        item.format = {
          format: item.format.format.substr(0, 254)
        };
      }
      if (!this.hasMetadataColumnInDatasource() && item.type === 'TIMESTAMP' && item.format && item.format.type === FieldFormatType.DATE_TIME && StringUtil.isEmpty(item.format.format)) {
        item.format = null;
      }
      // dictionary가 있다면
      item.dictionary && (item[ 'dictionary' ] = `/api/dictionaries/${item.dictionary.id}`);
      // code table이 있다면
      item.codeTable && (item[ 'codeTable' ] = `/api/codetables/${item.codeTable.id}`);
    });
    return result;
  }

  private _convertIdFromStringTypeToNumeric(item: any) {
    (item[ 'id' ]) && (item[ 'id' ] = (item[ 'id' ] * 1));
  }

  private _operationSetting(item: any) {
    item[ 'op' ] = 'replace';
  }

  private _isDescriptionExistsAndExceeds1000Characters(item: any) {
    return !_.isNil(item.description) && this._isDescriptioneOver1000CharactersLong(item);
  }

  private _isDescriptioneOver1000CharactersLong(item: any) {
    return item.description.length > 1000;
  }

  private _removeUnnecessaryVariables(item: any) {
    this._removeReplaceFl(item);
    this._removeNameChangeFl(item);
    this._removeTypeListFl(item);
    this._removeCodeTableShowFl(item);
  }

  private _removeCodeTableShowFl(item: any) {
    delete item[ 'codeTableShowFl' ];
  }

  private _removeTypeListFl(item: any) {
    delete item[ 'typeListFl' ];
  }

  private _removeNameChangeFl(item: any) {
    delete item[ 'nameChangeFl' ];
  }

  private _removeReplaceFl(item: any) {
    delete item.replaceFl;
  }

  private _isNameExistsAndExceeds255Characters(item: any) {
    return !_.isNil(item.name) && this._isNameOver255CharactersLong(item);
  }

  private _isNameOver255CharactersLong(item: any) {
    return item.name.length > 255;
  }

  /**
   * List of columns being changed
   */
  private _getReplaceColumns(): MetadataColumn[] {
    return this.columnList.filter((field) => {
      return field.replaceFl;
    });
  }

  /**
   * Get code table details
   */
  private _getDetailCodeTable(codeTableId: string): void {
    this.loadingShow();
    this._codeTableService.getCodeTableDetail(codeTableId)
      .then((result) => {
        this._addCodeTableDetailDataToCodeTableDetails(result);
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Add code table data to code tables
   */
  private _addCodeTableDetailDataToCodeTableDetails(result) {
    this._codeTableDetailList.push(result);
  }

  /**
   * Get column dictionary detail
   */
  private _getDetailColumnDictionary(dictionaryId: string): void {
    this.loadingShow();
    this._columnDictionaryService.getColumnDictionaryDetail(dictionaryId)
      .then((result) => {
        // 변경된 컬럼의 사전정보로 logicalType, Format, CodeTable, Description 적용
        this._selectedColumn.type = result.logicalType || null;
        this._selectedColumn.format = result.format || null;
        this._selectedColumn.description = result.description || null;

        // 이름이 사용자에 의해 변경되지 않았다면 컬럼 사전의 이름을 name으로 지정함
        !this._selectedColumn[ 'nameChangeFl' ] && (this._selectedColumn.name = result.logicalName);

        if (this._hasCodeTableConnectedToColumnDictionary(result)) {
          this._getCodeTableInColumnDictionary(dictionaryId);
        } else {
          this._removeCodeTableForSelectedColumn();
          this.loadingHide();
        }
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * If the column dictionary has a linked code table
   */
  private _hasCodeTableConnectedToColumnDictionary(result) {
    return result.linkCodeTable;
  }

  /**
   * Remove code table for the selected column
   */
  private _removeCodeTableForSelectedColumn() {
    this._selectedColumn.codeTable = null;
  }

  /**
   * Get code table connected to column dictionary
   */
  private _getCodeTableInColumnDictionary(dictionaryId: string): void {
    this.loadingShow();
    this._columnDictionaryService.getCodeTableInColumnDictionary(dictionaryId)
      .then((result) => {
        this._setCodeTableForSelectedColumn(result);
        this._releaseSelectedColumn();
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Release selected column
   */
  private _releaseSelectedColumn() {
    this._selectedColumn = null;
  }

  /**
   * Set code table in selected column
   */
  private _setCodeTableForSelectedColumn(result) {
    this._selectedColumn.codeTable = result;
  }

  private _getTargetElementClassList(event: MouseEvent) {
    return event.target[ 'classList' ];
  }

  private _checkIfElementContainsClassName(targetElementClassList: DOMTokenList, className: string) {
    return targetElementClassList.contains(className);
  }

  private isDatasourceSourceTypeIsJdbc() {
    return _.negate(_.isNil)(this.metaDataModelService.getMetadata().source.source);
  }

  private isMetadataSourceTypeIsEngine() {
    return Metadata.isSourceTypeIsEngine(this.metaDataModelService.getMetadata().sourceType);
  }

  private isMetadataSourceTypeIsJdbc() {
    return Metadata.isSourceTypeIsJdbc(this.metaDataModelService.getMetadata().sourceType);
  }

  private isMetadataSourceTypeIsStaging() {
    return Metadata.isSourceTypeIsStaging(this.metaDataModelService.getMetadata().sourceType);
  }

  @ViewChildren('metadataColumnSchemaDescriptionInputs')
  private metadataColumnSchemaDescriptionInputs: QueryList<ElementRef>;

  @ViewChildren('metadataColumnSchemaDescriptionTds')
  private metadataColumnSchemaDescriptionTds: QueryList<ElementRef>;

  public focusMetadataColumnSchemaDescriptionInput(index: number, metadataColumn: MetadataColumn) {

    if (this.isSelectedMetadataColumnInColumnDictionaryDefined(metadataColumn)) {
      return;
    }

    this.metadataColumnSchemaDescriptionInputs.toArray()[ index ].nativeElement.focus();
    this.renderer.setElementClass(this.metadataColumnSchemaDescriptionTds.toArray()[ index ].nativeElement, 'ddp-selected', true);
  }

  public blurMetadataColumnSchemaDescriptionInput(index: number) {
    this.renderer.setElementClass(this.metadataColumnSchemaDescriptionTds.toArray()[ index ].nativeElement, 'ddp-selected', false);
  }

  @ViewChildren('metadataColumnSchemaNameInputs')
  private metadataColumnSchemaNameInputs: QueryList<ElementRef>;

  @ViewChildren('metadataColumnSchemaNameTds')
  private metadataColumnSchemaNameTds: QueryList<ElementRef>;

  public focusMetadataColumnSchemaNameInput(index: number) {
    this.metadataColumnSchemaNameInputs.toArray()[ index ].nativeElement.focus();
    this.renderer.setElementClass(this.metadataColumnSchemaNameTds.toArray()[ index ].nativeElement, 'ddp-selected', true);
  }

  public blurMetadataColumnSchemaNameInput(index: number) {
    this.renderer.setElementClass(this.metadataColumnSchemaNameTds.toArray()[ index ].nativeElement, 'ddp-selected', false);
  }
}
