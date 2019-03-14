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

import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChildren} from '@angular/core';
import {AbstractComponent} from '../../../../common/component/abstract.component';
import {Datasource, FieldFormat, FieldFormatType, LogicalType, SourceType} from '../../../../domain/datasource/datasource';
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
import {CommonConstant} from '../../../../common/constant/common.constant';
import {MetadataSourceType} from '../../../../domain/meta-data-management/metadata';

class Order {
  key: string = 'physicalName';
  sort: string = 'asc';
}

@Component({
  selector: 'app-metadata-detail-columnschema',
  templateUrl: './column-schema.component.html',
})
export class ColumnSchemaComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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

  @Output()
  private readonly chooseCodeTableEvent = new EventEmitter();
  @Output()
  private readonly chooseDictionaryEvent = new EventEmitter();

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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * List Of Fields
   */
  public columnList: MetadataColumn[];

  /**
   * Logical Type List
   */
  public logicalTypeList: any[];
  public logicalTypeEtcList: any[];

  /**
   * Sort
   */
  public readonly selectedContentSort: Order = new Order();

  /**
   * Datasource LogicalType Enum
   */
  public readonly DATASOURCE_LOGICAL_TYPE = LogicalType;

  @Input()
  public isNameEdit: boolean;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(
    private _columnDictionaryService: ColumnDictionaryService,
    private _codeTableService: CodeTableService,
    private _metaDataService: MetadataService,
    public metaDataModelService: MetadataModelService,
    protected element: ElementRef,
    protected injector: Injector) {
    super(element, injector);
    this._initView();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // ui 초기화
    this._initView();
    // 컬럼 조회
    this._getColumnSchemas();
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
   * Current field logical type label
   *
   * @param {MetadataColumn} column
   * @returns {string}
   */
  public getSelectedLogicalTypeLabel(column: MetadataColumn): string {
    return column.type
      ? this.logicalTypeList.filter((type) => {
        return type.value === column.type;
      })[0].label
      : 'Select';
  }

  /**
   * Code preview data
   *
   * @param {string} codeTableId
   * @returns {CodeValuePair[]}
   */
  public getTableCodePair(codeTableId: string): CodeValuePair[] {
    const index = _.findIndex(this._codeTableDetailList, (item) => {
      return codeTableId === item.id;
    });
    return index === -1 ? [] : this._codeTableDetailList[index].codes;
  }

  /**
   * Column popularity
   *
   * @param {MetadataColumn} column
   * @returns {string}
   */
  public getColumnPopularity(column: MetadataColumn): string {
    return (column.popularity || 0) + '%';
  }

  public isDatasourceSourceTypeIsJdbc() {

    if (_.isNil(this.metaDataModelService.getMetadata().source.source)) {
      return false;
    }

    return (this.metaDataModelService.getMetadata().source.source as Datasource).srcType === SourceType.JDBC;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Whether column dictionary is selected
   *
   * @param {MetadataColumn} column
   * @returns {boolean}
   */
  public isSelectedDictionary(column: MetadataColumn): boolean {
    return !_.isNil(column.dictionary);
  }

  /**
   * Check if the type of the column is time
   *
   * @param {MetadataColumn} column
   * @returns {boolean}
   */
  public isTimeType(column: MetadataColumn): boolean {
    return column.type && column.type === LogicalType.TIMESTAMP;
  }

  /**
   * Save validation
   *
   * @returns {boolean}
   */
  public isEnableSave(): boolean {
    return this._getReplaceColumns().length > 0;
  }

  /**
   * If the column of the currently selected type is the logical type
   *
   * @param column
   * @param logicalType
   */
  public isSelectedColumnLogicalType(column: MetadataColumn, logicalType: LogicalType): boolean {
    return column.type === logicalType;
  }

  public isMetadataSourceTypeIsEngine() {
    return new MetadataSourceType(this.metaDataModelService.getMetadata().sourceType).isEngine();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Close column view in case scroll occurs
   */
  public onScrollColumnView(): void {
    this.columnList && this.columnList.forEach((column) => {
      column['typeListFl'] = false;
      column['codeTableShowFl'] = false;
    });
  }

  /**
   * When the field source recovery event is clicked
   */
  public onClickRestore(): void {
    this.columnList = _.cloneDeep(this._originColumnList);
  }

  /**
   * Save changed fields click event
   */
  public onClickSave(): void {
    // 변경사항이 있을때만 on
    this.isEnableSave() && this._updateColumnSchema();
  }

  /**
   * Logical type list show
   *
   * @param {MetadataColumn} column
   * @param {number} index
   */
  public onShowLogicalTypeList(column: MetadataColumn, index: number): void {
    // 컬럼 사전이 정해져있지 않을때
    if (!this.isSelectedDictionary(column)) {
      // show flag
      column['typeListFl'] = !column['typeListFl'];
      // detect changes
      this.changeDetect.detectChanges();
      // 레이어 팝업 위치 조정
      const logicalType = this._logicalType['_results'][index].nativeElement;
      const listView = this._logicalTypeList['_results'][index].nativeElement;
      listView.style.top = (logicalType.getBoundingClientRect().top > (this.$window.outerHeight() / 2))
        ? (logicalType.getBoundingClientRect().top - listView.offsetHeight + 'px')
        : (logicalType.getBoundingClientRect().top + 25 + 'px');
      listView.style.left = logicalType.getBoundingClientRect().left + 'px';
    }
  }

  /**
   * Logical type change event
   *
   * @param {MetadataColumn} column
   * @param logicalType
   */
  public onChangeLogicalType(column: MetadataColumn, logicalType: LogicalType): void {
    // 변경이벤트 체크
    this.onChangedValue(column);
    // 만약 변경될 타입이 logicalType이라면 format init
    if (logicalType === LogicalType.TIMESTAMP) {
      column.format = new FieldFormat();
      column.format.type = FieldFormatType.DATE_TIME;
    }
    // logical type 변경
    column.type = logicalType;
  }

  /**
   * 컬럼 사전 변경 이벤트
   * @param {ColumnDictionary} columnDictionary
   */
  public onChangedColumnDictionary(columnDictionary: ColumnDictionary): void {
    // 변경 on
    this._selectedColumn['replaceFl'] = true;
    // 현재 선택한 컬럼의 사전 변경
    this._selectedColumn.dictionary = columnDictionary;
    // 컬럼 사전이 있다면 해당 컬럼 사전의 상세정보 조회
    columnDictionary && this._getDetailColumnDictionary(columnDictionary.id);
  }

  /**
   * 코드 테이블 변경 이벤트
   * @param {CodeTable} codeTable
   */
  public onChangedCodeTable(codeTable: CodeTable): void {
    // 변경 on
    this._selectedColumn['replaceFl'] = true;
    this._setCodeTableForSelectedColumn(codeTable);
    this._releaseSelectedColumn();
  }

  /**
   * 코드 테이블 이름 클릭 이벤트
   * @param {MetadataColumn} column
   * @param {number} index
   */
  public onClickCodeTable(column: MetadataColumn, index): void {
    // event bubbling stop
    event.stopImmediatePropagation();
    // 해당 코드테이블 레이어 팝업 show flag
    column.codeTable && (column['codeTableShowFl'] = !column['codeTableShowFl']);
    // 레이어 팝업 설정
    if (column.codeTable && column['codeTableShowFl']) {
      // 코드테이블 상세정보 목록에 데이터가 있는지
      const codeIndex = _.findIndex(this._codeTableDetailList, (item) => {
        return column.codeTable.id === item.id;
      });
      // 해당 코드 정보가 존재하지 않는다면 조회
      codeIndex === -1 && this._getDetailCodeTable(column.codeTable.id);
      // detect changes
      this.changeDetect.detectChanges();
      // 레이어 팝업 위치 조정
      const table = this._codeTable['_results'][index].nativeElement;
      const preview = this._codeTablePreview['_results'][index].nativeElement;
      preview.style.top = (table.getBoundingClientRect().top > (this.$window.outerHeight() / 2))
        ? (table.getBoundingClientRect().top - preview.offsetHeight + 'px')
        : (table.getBoundingClientRect().top + 25 + 'px');
      preview.style.left = table.getBoundingClientRect().left + 'px';
    }
  }

  /**
   * Code table detail click event
   *
   * @param {CodeTable} codeTable
   */
  public onClickCodeTableDetails(codeTable: CodeTable): void {
    event.stopImmediatePropagation();
    this._gotoCodeTableDetailView(codeTable);
  }

  private _gotoCodeTableDetailView(codeTable: CodeTable) {
    this.router.navigate(['management/metadata/code-table', codeTable.id]);
  }

  /**
   * Dictionary name click event
   *
   * @param {ColumnDictionary} dictionary
   */
  public onClickDictionary(dictionary: ColumnDictionary): void {
    event.stopImmediatePropagation();
    this._gotoDictionaryDetailView(dictionary);
  }

  private _gotoDictionaryDetailView(dictionary: ColumnDictionary) {
    dictionary && this.router.navigate(['management/metadata/column-dictionary', dictionary.id]);
  }

  /**
   * Click on column dictionary search event
   *
   * @param {MetadataColumn} column
   */
  public onClickSearchDictionary(column: MetadataColumn): void {
    event.stopImmediatePropagation();
    this._saveCurrentlySelectedColumn(column);
    this.chooseDictionaryEvent.emit({name: 'CREATE', dictionary: column.dictionary}); // 컬럼 사전 선택 컴포넌트
  }

  /**
   * Save the currently selected column
   *
   * @param column
   * @private
   */
  private _saveCurrentlySelectedColumn(column: MetadataColumn) {
    this._selectedColumn = column;
  }

  /**
   * Code table search click event
   *
   * @param {MetadataColumn} column
   */
  public onClickSearchCodeTable(column: MetadataColumn): void {
    // event bubbling stop
    event.stopImmediatePropagation();
    // 현재 컬럼에 컬럼사전이 없는 경우에만 작용
    if (!this.isSelectedDictionary(column)) {
      // 현재 선택한 컬럼 저장
      this._selectedColumn = column;
      // 코드 테이블 선택 컴포넌트
      this.chooseCodeTableEvent.emit({name: 'CREATE', codeTable: column.codeTable});
    }
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // noinspection JSMethodCanBeStatic
  /**
   * Change event in column occurred
   *
   * @param column
   */
  private onChangedValue(column: MetadataColumn): void {
    // 변경이벤트 체크
    column['replaceFl'] = true;
  }

  /**
   * View initialization
   *
   * @private
   */
  private _initView(): void {
    this.columnList = [];
    this.logicalTypeList = this.getMetaDataLogicalTypeList();
    this.logicalTypeEtcList = this.getMetaDataLogicalTypeEtcList();
    this._codeTableDetailList = [];
  }

  /**
   * Column schema list lookup
   *
   * @private
   */
  private _getColumnSchemas(): void {
    this.loadingShow();
    this._metaDataService.getColumnSchemaListInMetaData(this.metaDataModelService.getMetadata().id).then((result) => {
      this._hideCurrentTime(result);
      this._saveColumnDataOriginal();
      this.loadingHide();
    }).catch(error => this.commonExceptionHandler(error));
  }

  private _hideCurrentTime(result) {
    this.columnList = result.filter((item) => item.physicalName !== CommonConstant.COL_NAME_CURRENT_DATETIME && item.physicalType !== 'TIMESTAMP');
  }

  /**
   * Saving column data original
   *
   * @private
   */
  private _saveColumnDataOriginal() {
    this._originColumnList = _.cloneDeep(this.columnList);
  }

  /**
   * Modify column schema
   *
   * @private
   */
  private _updateColumnSchema(): void {
    this.loadingShow();
    this._metaDataService.updateColumnSchema(this.metaDataModelService.getMetadata().id, this._getUpdateColumnParams()).
      then(() => {
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        this._refreshColumnSchemas();
      }).
      catch(error => this.commonExceptionHandler(error));
  }

  private _refreshColumnSchemas() {
    this._getColumnSchemas();
  }

  /**
   * Fields to be used for the change
   *
   * @returns {any}
   * @private
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
          format: item.format.format.substr(0, 254),
        };
      }
      // dictionary가 있다면
      item.dictionary && (item['dictionary'] = `/api/dictionaries/${item.dictionary.id}`);
      // code table이 있다면
      item.codeTable && (item['codeTable'] = `/api/codetables/${item.codeTable.id}`);
    });
    return result;
  }

  // noinspection JSMethodCanBeStatic
  private _convertIdFromStringTypeToNumeric(item: any) {
    (item['id']) && (item['id'] = (item['id'] * 1));
  }

  // noinspection JSMethodCanBeStatic
  private _operationSetting(item: any) {
    item['op'] = 'replace';
  }

  private _isDescriptionExistsAndExceeds1000Characters(item: any) {
    return !_.isNil(item.description) && this._isDescriptioneOver1000CharactersLong(item);
  }

  // noinspection JSMethodCanBeStatic
  private _isDescriptioneOver1000CharactersLong(item: any) {
    return item.description.length > 1000;
  }

  // noinspection JSMethodCanBeStatic
  private _removeUnnecessaryVariables(item: any) {
    this._removeReplaceFl(item);
    this._removeNameChangeFl(item);
    this._removeTypeListFl(item);
    this._removeCodeTableShowFl(item);
  }

  // noinspection JSMethodCanBeStatic
  private _removeCodeTableShowFl(item: any) {
    delete item['codeTableShowFl'];
  }

  // noinspection JSMethodCanBeStatic
  private _removeTypeListFl(item: any) {
    delete item['typeListFl'];
  }

  // noinspection JSMethodCanBeStatic
  private _removeNameChangeFl(item: any) {
    delete item['nameChangeFl'];
  }

  // noinspection JSMethodCanBeStatic
  private _removeReplaceFl(item: any) {
    delete item['replaceFl'];
  }

  private _isNameExistsAndExceeds255Characters(item: any) {
    return !_.isNil(item.name) && this._isNameOver255CharactersLong(item);
  }

  // noinspection JSMethodCanBeStatic
  private _isNameOver255CharactersLong(item: any) {
    return item.name.length > 255;
  }

  /**
   * List of columns being changed
   *
   * @private
   */
  private _getReplaceColumns(): MetadataColumn[] {
    return this.columnList.filter((field) => {
      return field['replaceFl'];
    });
  }

  /**
   * Get code table details
   *
   * @param {string} codeTableId
   * @private
   */
  private _getDetailCodeTable(codeTableId: string): void {
    this.loadingShow();
    this._codeTableService.getCodeTableDetail(codeTableId).then((result) => {
      this._addCodeTableDetailDataToCodeTableDetails(result);
      this.loadingHide();
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Add code table data to code tables
   *
   * @param result
   * @private
   */
  private _addCodeTableDetailDataToCodeTableDetails(result) {
    this._codeTableDetailList.push(result);
  }

  /**
   * Get column dictionary detail
   *
   * @param {string} dictionaryId
   * @private
   */
  private _getDetailColumnDictionary(dictionaryId: string): void {
    this.loadingShow();
    this._columnDictionaryService.getColumnDictionaryDetail(dictionaryId).then((result) => {
      // 변경된 컬럼의 사전정보로 logicalType, Format, CodeTable, Description 적용
      this._selectedColumn.type = result.logicalType || null;
      this._selectedColumn.format = result.format || new FieldFormat();
      this._selectedColumn.description = result.description || null;

      // 이름이 사용자에 의해 변경되지 않았다면 컬럼 사전의 이름을 name으로 지정함
      !this._selectedColumn['nameChangeFl'] && (this._selectedColumn.name = result.logicalName);

      if (this._hasCodeTableConnectedToColumnDictionary(result)) {
        this._getCodeTableInColumnDictionary(dictionaryId);
      } else {
        this._removeCodeTableForSelectedColumn();
        this.loadingHide();
      }
    }).catch(error => this.commonExceptionHandler(error));
  }

  // noinspection JSMethodCanBeStatic
  /**
   * If the column dictionary has a linked code table
   *
   * @param result
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
   *
   * @param dictionaryId
   * @private
   */
  private _getCodeTableInColumnDictionary(dictionaryId: string): void {
    this.loadingShow();
    this._columnDictionaryService.getCodeTableInColumnDictionary(dictionaryId).then((result) => {
      this._setCodeTableForSelectedColumn(result);
      this._releaseSelectedColumn();
      this.loadingHide();
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Release selected column
   */
  private _releaseSelectedColumn() {
    this._selectedColumn = null;
  }

  /**
   * Set code table in selected column
   *
   * @param result
   * @private
   */
  private _setCodeTableForSelectedColumn(result) {
    this._selectedColumn.codeTable = result;
  }
}
