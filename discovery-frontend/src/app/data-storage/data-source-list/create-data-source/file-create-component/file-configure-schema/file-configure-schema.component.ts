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
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import {
  DatasourceInfo, Field, FieldFormat, FieldFormatType,
  LogicalType
} from '../../../../../domain/datasource/datasource';
import { DatasourceService } from '../../../../../datasource/service/datasource.service';
import { isUndefined } from 'util';
import * as _ from 'lodash';
import { StringUtil } from '../../../../../common/util/string.util';
import { Alert } from '../../../../../common/util/alert.util';


@Component({
  selector: 'file-configure-schema',
  templateUrl: './file-configure-schema.component.html'
})
export class FileConfigureSchemaComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성될 데이터소스 정보
  private sourceData: DatasourceInfo;

  // field list
  private fields: any[];
  // data list
  private data: any[];

  // 선택된 컬럼리스트
  private checkedColumnList: any[];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('sourceData')
  public set setSourceData(sourceData: DatasourceInfo) {
    this.sourceData = sourceData;
  }

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  // role type list
  public roleTypeList: any[];
  // type list
  public typeList: any[];

  // 선택된 role type
  public selectedRoleType: any;
  // 선택된 type
  public selectedType: any;
  // 검색어
  public searchText: string = '';

  // 선택된 타임스탬프 타입
  public selectedTimestampType: string = 'CURRENT';
  // 선택된 타임스탬프 컬럼
  public selectedTimestampColumn: any;
  // 선택된 컬럼
  public selectedColumn: any;
  // 선택된 컬럼의 데이터
  public selectedColumnData: any[] = [];

  // show flag
  public typeShowFl: boolean = false;
  public timestampShowFl: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
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
    this.initView();

    // 현재 페이지 schema 정보가 있다면
    if (this.sourceData.hasOwnProperty('schemaData')) {
      // init data
      this.initData(this.sourceData.schemaData);
    } else {
      // 파일 데이터 상세데이터
      this.initColumnData(this.sourceData.fileData);
      // 필드 init
      this.initFields(this.fields);
      // 처음 선택한 컬럼
      this.onSelectedColumn(this.fields[0]);
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
   * 이전화면으로 이동
   */
  public prev() {
    // 기존 스키마정보 삭제후 생성
    this.deleteAndSaveSchemaData();
    // 이전 step 으로 이동
    this.step = 'file-select';
    this.stepChange.emit(this.step);
  }

  /**
   * 다음화면으로 이동
   */
  public next() {
    // validation
    if (this.getNextValidation()) {
      // 기존 스키마정보 삭제후 생성
      this.deleteAndSaveSchemaData();
      // 다음 step 으로 이동
      this.step = 'file-ingestion';
      this.stepChange.emit(this.step);
    }
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컬럼 리스트
   * @returns {any[]}
   */
  public getColumnList() {
    let columnList = this.fields;
    // role filter
    if (this.selectedRoleType.value !== 'ALL') {
      columnList = this.getColumnsRoleTypeFilter(columnList);
    }
    // type filter
    if (this.selectedType.value !== 'ALL') {
      columnList = this.getColumnsTypeFilter(columnList);
    }
    // search filter
    const searchText = this.searchText.trim();
    if (searchText !== '') {
      columnList = this.getColumnsSearchTextFilter(columnList, searchText);
    }
    return columnList;
  }

  /**
   * 체크표시된 컬럼 리스트
   * @returns {any[]}
   */
  public get getCheckedColumns() {
    return this.checkedColumnList;
  }

  /**
   * 타임타입 컬럼 리스트
   * @returns {any[]}
   */
  public getTimeTypeColumns() {
    const columnList = this.fields.filter((column) => {
      return column.logicalType === 'TIMESTAMP' && !this.isDeletedColumn(column);
    });
    return columnList;
  }

  /**
   * 삭제되지 않은 컬럼리스트
   * @returns {any[]}
   */
  public getNotDeletedColumns() {
    const columnList = this.fields.filter((column) => {
      return column.removed === false;
    });
    return columnList;
  }

  /**
   * 현재 데이터소스의 생성 타입
   * @returns {string}
   */
  public get getConnectionType(): string {
    return this.sourceData.connectionData.connType;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - init
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 타임스탬프 컬럼 init
   */
  public initTimestampColumn() {
    const columnList = this.getTimeTypeColumns();
    if (columnList.length === 0) {
      this.selectedTimestampType = 'CURRENT';
      // 기존에 선택된 타임스탬프 컬럼 초기화
      this.selectedTimestampColumn = null;
    } else {
      this.selectedTimestampType = 'COLUMN';
      // 타임스탬프 컬럼 값
      this.selectedTimestampColumn = !this.selectedTimestampColumn ? columnList[0] : this.selectedTimestampColumn;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * role 선택 이벤트
   * @param role
   */
  public onSelectedRole(role) {
    this.selectedRoleType = role;
  }

  /**
   * type 선택 이벤트
   * @param type
   */
  public onSelectedType(type) {
    this.selectedType = type;
  }

  /**
   * 타임스탬프 선택 이벤트
   * @param column
   */
  public onSelectedTimestamp(column) {
    // 타임스탬프 선택
    this.selectedTimestampColumn = column;
    // 사용자 지정 타임스탬프
    this.selectedTimestampType = 'COLUMN';
  }

  /**
   * 타임스탬프 타입 변경 이벤트
   * @param {string} type
   */
  public onSelectedTimestampType(type: string) {
    // 타임스탬프가 없는경우
    if (this.isTimestampColumnEmpty()) {
      return;
    }
    this.selectedTimestampType = type;
  }

  /**
   * 컬럼 체크 선택 이벤트
   * @param column
   */
  public onCheckedColumn(column) {
    // 현재 컬럼이 선택된 리스트에 있는지
    const index = this.checkedColumnList.findIndex((item) => {
      return item.name === column.name;
    });
    // 없다면 선택된 리스트에 넣기
    index === -1 ? this.checkedColumnList.push(column) : this.checkedColumnList.splice(index,1);
  }

  /**
   * 모든 컬럼 선택 이벤트
   */
  public onCheckedAllColumns() {
    // 모드 체크된 상태가 아니라면 모든 아이템 제거
    this.isAllCheckedColumns() ? this._deleteAllItem() : this._addAllItem();
  }

  /**
   * 컬럼 선택 이벤트
   * @param column
   */
  public onSelectedColumn(column) {
    // 삭제된 상태라면 선택 x
    if (column.removed) {
      return;
    }
    // 컬럼 선택
    this.selectedColumn = column;
    // 컬럼의 데이터 선택
    this.selectedColumnData = this.getColumnDetailData(column);
  }

  /**
   * 체크된 컬럼 선택해제 이벤트
   */
  public onClickUnselectAll() {
    // 체크된 리스트 초기화
    this.checkedColumnList = [];
  }

  /**
   * 엑션 클릭 이벤트
   */
  public onClickApplyAction(changeEvent) {
    if (changeEvent.delete) {
      // 삭제 이벤트
      this.onDeleteAction(this.checkedColumnList);
    } else {
      // 타입 변경 이벤트
      this.onTypeChangeAction(this.checkedColumnList, changeEvent.role, changeEvent.logicalType);
    }
    // 체크된 목록 초기화
    this.checkedColumnList = [];
  }

  /**
   * 삭제된 컬럼 되돌리기 이벤트
   * @param column
   */
  public onClickRevival(column) {
    // 삭제상태 해제
    column.removed = false;
    // init timestamp
    if (this.selectedTimestampType === 'CURRENT' && column.logicalType === 'TIMESTAMP') {
      this.initTimestampColumn();
    }
  }

  /**
   * timestamp 컬럼 목록 이벤트
   */
  public onShowTimestampColumns(): void {
    // 타임스탬프가 없는경우
    if (this.isTimestampColumnEmpty()) {
      return;
    }
    this.timestampShowFl = !this.timestampShowFl;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 타임스탬프 컬럼이 없는지 확인
   * @returns {boolean}
   */
  public isTimestampColumnEmpty(): boolean {
    return this.getTimeTypeColumns().length === 0;
  }


  /**
   * 모든 컬럼이 체크된 상태인지 확인
   * @returns {boolean}
   */
  public isAllCheckedColumns(): boolean {
    // 현재 필터링이 된 리스트
    const list = this._getEnabledColumnList();
    if (list.length !== 0) {
      for (let index = 0; index < list.length; index++) {
        // 목록중 check가 하나라도 없다면 false
        if (this.checkedColumnList.findIndex((item) => {
            return item.name === list[index].name;}) === -1) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }

  /**
   * 현재 컬럼이 체크된 상태인지 확인
   * @param column
   * @returns {boolean}
   */
  public isCheckedColumn(column): boolean {
    return this.checkedColumnList.findIndex((item) => {
      return item.name === column.name;
    }) !== -1;
  }

  /**
   * 컬럼이 삭제된 상태인지 확인
   * @param column
   * @returns {boolean}
   */
  public isDeletedColumn(column): boolean {
    return column.removed === true;
  }

  /**
   * 현재 선택된 상태라면
   * @param column
   * @returns {boolean}
   */
  public isSelectedColumn(column): boolean {
    // 현재 선택된 컬럼이고 삭제상태가 아닌경우
    return (!isUndefined(this.selectedColumn)
      && this.selectedColumn.name === column.name
      && !column.removed);
  }


  /**
   * 임의로 형성된 current column 표시 여부
   * @returns {boolean}
   */
  public showCurrentColumn(): boolean {
    if (this.selectedTimestampType === 'CURRENT'
      && this.selectedRoleType.value !== 'MEASURE'
      && (this.selectedType.value === 'ALL' || this.selectedType.value === 'TIMESTAMP')) {
      // search text
      const searchText = this.searchText.trim();
      // 검색어가 있는경우
      return searchText !== '' ? this.isIncludeText('Current time', searchText) : true;
    }
    return false;
  }

  /**
   * error 아이콘 표시 여부
   * @param column
   * @returns {boolean}
   */
  public getErrorIcon(column): boolean {
    // 에러가 있으면서 삭제되지 않은 컬럼
    return (!this.isDeletedColumn(column) && this.isErrorColumn(column));
  }

  /**
   * 타임스탬프 아이콘 표시 여부
   * @param column
   * @returns {boolean}
   */
  public getTimestampIcon(column): boolean {
    // 타입스탬프로 지정된 컬럼이면서 삭제되지 않은 컬럼
    return (this.selectedTimestampType === 'COLUMN' && this.isTimestampColumn(column) && !this.isDeletedColumn(column));
  }

  /**
   * 다음화면으로 넘어가기 위한 validation
   * @returns {boolean}
   */
  public getNextValidation(): boolean {
    // 모든 컬럼이 삭제된 상태이거나
    // 타임스탬프 타입이 컬럼이면서 타임스탬프로 지정된 컬럼이없거나
    // 컬럼에 error 가 있는경우
    if (this.getNotDeletedColumns().length === 0
      || this.selectedTimestampType === 'COLUMN' && this.selectedTimestampColumn === null
      || this.columnsErrorValidation(this.getNotDeletedColumns())) {
      return false;
    }
    return true;
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 현재 페이지의 schema 데이터 저장
   * @param {DatasourceInfo} sourceData
   */
  private saveSchemaData(sourceData: DatasourceInfo) {
    const schemaData = {
      // 선택된 컬럼리스트
      checkedColumnList: this.checkedColumnList,
      // 선택된 role type
      selectedRoleType: this.selectedRoleType,
      // 선택된 type
      selectedType: this.selectedType,
      // 검색어
      searchText: this.searchText,
      // 선택된 타임스탬프 타입
      selectedTimestampType: this.selectedTimestampType,
      // 선택된 타임스탬프 컬럼
      selectedTimestampColumn: this.selectedTimestampColumn,
      // 선택된 컬럼
      selectedColumn: this.selectedColumn,
      // 선택된 컬럼의 데이터
      selectedColumnData: this.selectedColumnData,
      // show flag
      typeShowFl: this.typeShowFl,
      timestampShowFl: this.timestampShowFl,
      // field list
      fields: this.fields,
      // data list
      data: this.data,
    };
    sourceData['schemaData'] = schemaData;
  }

  /**
   * 기존 스키마데이터 삭제후 새로 생성
   */
  private deleteAndSaveSchemaData() {
    // 스키마 정보가 있다면 삭제
    if (this.sourceData.hasOwnProperty('schemaData')) {
      delete this.sourceData.schemaData;
    }
    // 현재 페이지의 데이터소스 생성정보 저장
    this.saveSchemaData(this.sourceData);
  }

  /**
   * 현재 보이고 있는 아이템을 선택한 리스트에서 제거
   * @private
   */
  private _deleteAllItem(): void {
    // 아이템을 현재 선택된 리스트에서 제거
    this._getEnabledColumnList().forEach((item) => {
      this._deleteSelectedItem(item);
    });
  }

  /**
   * 현재 보이고 있는 아이템들 선택한 리스트에 추가
   * @private
   */
  private _addAllItem(): void {
    // 아이템을 현재 선택된 리스트에 추가
    this._getEnabledColumnList().forEach((item) => {
      this._addSelectedItem(item);
    });
  }

  /**
   * 아이템을 선택된 리스트에서 제거
   * @param item
   */
  public _deleteSelectedItem(item: any): void {
    // 선택된 리스트에 있는 아이템의 index
    const index = this.checkedColumnList.findIndex((column) => {
      return column.name === item.name;
    });
    // 선택된 리스트에 있을 때만 제거
    if (index !== -1) {
      this.checkedColumnList.splice(index, 1);
    }
  }

  /**
   * 아이템을 선택된리스트에서 추가
   * @param item
   */
  public _addSelectedItem(item: any): void {
    // 선택된 리스트에 있는 아이템의 index
    const index = this.checkedColumnList.findIndex((column) => {
      return column.name === item.name;
    });
    // 선택된 리스트에 없을 때만 추가
    if (index === -1) {
      this.checkedColumnList.push(item);
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컬럼명과 일치하는 데이터 얻기
   * @param column
   * @returns {Array}
   */
  private getColumnDetailData(column: any) {
    const columnName = column.name;
    const dataList = [];
    this.data.forEach((item) => {
      if (item.hasOwnProperty(columnName) && item[columnName] !== null) {
        dataList.push(item[columnName]);
      }
    });
    return dataList;
  }

  /**
   * 서버에 타임스탬프 포맷 체크 요청
   * @param columnDetailData
   * @returns {Promise<any>}
   */
  private getTimestampFormat(column, columnDetailData) {
    return new Promise(((resolve, reject) => {
      this.datasourceService.checkValidationDateTime({samples: columnDetailData})
        .then((result) => {
          // pattern 이 있을경우
          if (result.hasOwnProperty('pattern')) {
            column.format.format = result.pattern;
            //  set valid
            column.isValidTimeFormat = true;
          }
          resolve(result);
        })
        .catch((error) => {
          column.format.format = 'yyyy-MM-dd';
          reject(error);
        });
    }));
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 삭제 엑션
   * @param {any[]} columnList
   */
  private onDeleteAction(columnList: any[]) {
    columnList.forEach((column) => {
      // 삭제 플래그
      column.removed = true;
      // 타임스탬프에 대한 처리
      // 현재 컬럼이 타임스탬프로 지정된 컬럼이였다면
      if (this.isTimestampColumn(column)) {
        // 타임스탬프에서 제거
        this.selectedTimestampColumn = null;
        // 타임스탬프 init
        this.initTimestampColumn();
      }
    });
  }

  /**
   * 타입 변경 엑션
   * @param {any[]} columnList
   */
  private onTypeChangeAction(columnList: any[], role: string, logicalType: string) {

    // 타임스탬프 배열
    const timestampPromise = [];

    columnList.forEach((column) => {
      // 선택한 타입하고 같지않을때만 동작
      if (!this.isEqualType(column.logicalType, logicalType)) {

        // ingestion에 대한 처리
        this.initIngestionRuleInChangeType(column);
        // 타임스탬프에 대한 처리
        this.initTimestampInChangeType(column, logicalType, timestampPromise);
        // 타입 변경
        column.logicalType = logicalType;
        // 롤 타입 변경
        column.role = role;
      }
    });

    // init timestamp
    this.initTimestampColumn();
    // 타임포맷 체크를 요청할 컬럼이 있다면
    if (timestampPromise.length !== 0) {
      this.initTimestampFormat(timestampPromise);
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - filtering
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * role 타입 필터링
   * @param columnList
   */
  private getColumnsRoleTypeFilter(columnList) {
    return columnList.filter((column) => {
      return this.isEqualType(column.role, this.selectedRoleType);
    });
  }

  /**
   * 타입 필터링
   * @param columnList
   */
  private getColumnsTypeFilter(columnList) {
    return columnList.filter((column) => {
      return this.isEqualType(column.logicalType, this.selectedType);
    });
  }

  /**
   * 검색어 필터링
   * @param columnList
   * @param searchText
   */
  private getColumnsSearchTextFilter(columnList, searchText) {
    return columnList.filter((column) => {
      if (this.isIncludeText(column.name, searchText)) {
        return column;
      }
    });
  }

  /**
   * 현재 보여지고있는 사용가능한 컬럼 목록
   * @returns {any[]}
   * @private
   */
  private _getEnabledColumnList() {
    return this.getColumnList().filter((column) => {
      return column.removed === false;
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컬럼이 선택된 타입과 같은 타입인지 확인
   * @param {string} column
   * @param selectedType
   * @returns {boolean}
   */
  private isEqualType(columnType: string, selectedType): boolean {
    return columnType === selectedType.value;
  }

  /**
   * 해당 텍스트를 포함하고 있는지 확인
   * @param {string} text
   * @param {string} searchText
   * @returns {boolean}
   */
  private isIncludeText(text: string, searchText: string): boolean {
    return text.toUpperCase().includes(searchText.toUpperCase());
  }

  /**
   * 타입스탬프로 지정된 컬럼인지 확인
   * @param column
   * @returns {boolean}
   */
  private isTimestampColumn(column): boolean {
    if (this.selectedTimestampColumn && this.selectedTimestampColumn.name === column.name) {
      return true;
    }
    return false;
  }

  /**
   * error 가 있는 컬럼인지 확인
   * @param column
   * @returns {boolean}
   */
  private isErrorColumn(column): boolean {
    if (this._isErrorTimestamp(column)) {
      return true;
    }
    if (this._isErrorIngestionRule(column)) {
      return true;
    }
    return false;
  }

  /**
   * Is ingestion rule error
   * @param {Field} column
   * @returns {boolean}
   * @private
   */
  private _isErrorIngestionRule(column: Field): boolean {
    return column.ingestionRule
      && column.ingestionRule.type === 'replace'
      && column.isValidReplaceValue === false;
  }

  /**
   * Is timestamp error
   * @param {Field} column
   * @returns {boolean}
   * @private
   */
  private _isErrorTimestamp(column: Field): boolean {
    return column.logicalType === LogicalType.TIMESTAMP
      && column.format.type === FieldFormatType.DATE_TIME
      && column.isValidTimeFormat === false;
  }

  /**
   * 컬럼 목록에 error 가 있는지 검사
   * @param {any[]} columnList
   * @returns {boolean}
   */
  private columnsErrorValidation(columnList: any[]): boolean {
    // check error
    columnList.forEach((column: Field) => {
      if (column.logicalType === LogicalType.TIMESTAMP && column.format.type === FieldFormatType.DATE_TIME && isUndefined(column.isValidTimeFormat)) {
        column.isValidTimeFormat = false;
      }
      if (column.ingestionRule && column.ingestionRule.type === 'replace' && isUndefined(column.isValidReplaceValue)) {
        column.isValidReplaceValue = false;
        column.replaceValidMessage = this.translateService.instant('msg.storage.ui.schema.valid.desc');
      }
    });
    if (_.some(columnList, column => this.isErrorColumn(column))) {
      Alert.warning(this.translateService.instant('msg.storage.ui.schema.error.desc'));
      return true;
    } else {
      return false;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - init
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 타입변경 이벤트시 init timestamp
   * @param column
   * @param type
   * @param timestampPromise
   */
  private initTimestampInChangeType(column, type, timestampPromise) {
    // 변경된 타입이 타임일 경우
    if (this.isEqualType('TIMESTAMP', type)) {
      timestampPromise.push(column);
      delete column.isValidTimeFormat;
      delete column.isValidReplaceValue;
    }

    // 컬럼이 타임스탬프로 지정되었던 경우
    if (this.isTimestampColumn(column)) {
      this.selectedTimestampColumn = null;
    }
  }

  /**
   * 타입변경 이벤트시 init ingestion rule
   * @param column
   */
  private initIngestionRuleInChangeType(column) {
    // ingestionRule이 있다면
    if (column.hasOwnProperty('ingestionRule') && column.ingestionRule.type === 'replace') {
      column.ingestionRule.type = 'default';
    }
  }

  /**
   * init timestamp format
   * @param column
   * @param columnDetailData
   * @returns {Promise<any>}
   */
  private initTimestampFormat(columnList) {
    // 로딩 show
    this.loadingShow();

    const promise = [];
    columnList.forEach((column) => {
      // init format
      column.format = new FieldFormat();
      // column DetailData
      let columnDetailData = this.getColumnDetailData(column);

      // data 가 없다면 타임스탬프를 지정할수 없다.
      if (columnDetailData.length === 0) {
        column.isValidTimeFormat = false;
        column.timeFormatValidMessage = this.translateService.instant('msg.storage.ui.schema.column.no.data');
      } else {
        columnDetailData = columnDetailData.length > 20 ? columnDetailData.slice(0, 19) : columnDetailData;
        promise.push(this.getTimestampFormat(column, columnDetailData));
      }
    });

    // 서비스 로직 수행
    Promise.all(promise)
      .then(() => {
        // init timestamp
        this.initTimestampColumn();
        // 로딩 hide
        this.loadingHide();
      })
      .catch(() => {
        // 로딩 hide
        this.loadingHide();
      })
  }

  /**
   * 필드 init
   * @param {any[]} fields
   */
  private initFields(fields: any[]) {
    fields.forEach((column) => {
      column['removed'] = false;
    });
    // init timestamp
    this.initTimestampFormat(this.getTimeTypeColumns());
  }

  /**
   * 데이터베이스에서 선택된 데이터 init
   * @param fileData
   */
  private initColumnData(fileData: any) {
    this.fields = _.cloneDeep(fileData.datasourceFile.selectedFile.fields);
    this.data = _.cloneDeep(fileData.datasourceFile.selectedFile.data);
  }


  /**
   * init schema data
   * @param schemaData
   */
  private initData(schemaData: any) {
    // 선택된 role type
    this.selectedRoleType = schemaData.selectedRoleType;
    // 선택된 type
    this.selectedType = schemaData.selectedType;
    // 검색어
    this.searchText = schemaData.searchText;
    // 선택된 타임스탬프 타입
    this.selectedTimestampType = schemaData.selectedTimestampType;
    // 선택된 타임스탬프 컬럼
    this.selectedTimestampColumn = schemaData.selectedTimestampColumn;
    // 선택된 컬럼
    this.selectedColumn = schemaData.selectedColumn;
    // 선택된 컬럼의 데이터
    this.selectedColumnData = schemaData.selectedColumnData;
    // show flag
    this.typeShowFl = schemaData.typeShowFl;
    this.timestampShowFl = schemaData.timestampShowFl;
    // fields
    this.fields = schemaData.fields;
    // fields data
    this.data = schemaData.data;
    // 체크된 데이터
    this.checkedColumnList = schemaData.checkedColumnList;
  }

  /**
   * ui init
   */
  private initView() {
    // role
    this.roleTypeList = [
      { label: this.translateService.instant('msg.comm.ui.list.all'), value: 'ALL' },
      { label: this.translateService.instant('msg.storage.ui.list.dimension'), value: 'DIMENSION' },
      { label: this.translateService.instant('msg.storage.ui.list.measure'), value: 'MEASURE' }
    ];
    this.selectedRoleType = this.roleTypeList[0];
    // type
    this.typeList = [
      { label: this.translateService.instant('msg.comm.ui.list.all'), value: 'ALL' },
      { label: this.translateService.instant('msg.storage.ui.list.string'), value: 'STRING' },
      { label: this.translateService.instant('msg.storage.ui.list.boolean'), value: 'BOOLEAN' },
      { label: this.translateService.instant('msg.storage.ui.list.integer'), value: 'INTEGER' },
      { label: this.translateService.instant('msg.storage.ui.list.double'), value: 'DOUBLE' },
      { label: this.translateService.instant('msg.storage.ui.list.date'), value: 'TIMESTAMP' },
      { label: this.translateService.instant('msg.storage.ui.list.lnt'), value: 'LNT' },
      { label: this.translateService.instant('msg.storage.ui.list.lng'), value: 'LNG' }
    ];
    this.selectedType = this.typeList[0];

    // 선택된 컬럼리스트
    this.checkedColumnList = [];
    // 초기화
    this.fields = [];
    this.data = [];
  }
}
