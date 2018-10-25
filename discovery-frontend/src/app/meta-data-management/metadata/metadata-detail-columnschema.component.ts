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
  Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild,
  ViewChildren
} from '@angular/core';
import { AbstractComponent } from '../../common/component/abstract.component';
import { FieldFormat, FieldRole, LogicalType } from '../../domain/datasource/datasource';
import * as _ from 'lodash';
import { ChooseCodeTableComponent } from '../component/choose-code-table/choose-code-table.component';
import { ChooseColumnDictionaryComponent } from '../component/choose-column-dictionary/choose-column-dictionary.component';
import { MetadataService } from './service/metadata.service';
import { MetadataModelService } from './service/metadata.model.service';
import { MetadataColumn } from '../../domain/meta-data-management/metadata-column';
import { CodeTable } from '../../domain/meta-data-management/code-table';
import { ColumnDictionary } from '../../domain/meta-data-management/column-dictionary';
import { CodeTableService } from '../code-table/service/code-table.service';
import { CodeValuePair } from '../../domain/meta-data-management/code-value-pair';
import { ColumnDictionaryService } from '../column-dictionary/service/column-dictionary.service';
import { Alert } from '../../common/util/alert.util';

@Component({
  selector: 'app-metadata-detail-columnschema',
  templateUrl: './metadata-detail-columnschema.component.html'
})
export class MetadataDetailColumnschemaComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 필드 목록 원본
  private _originColumnList: MetadataColumn[];

  // 코드 테이블 선택 컴포넌트
  @ViewChild(ChooseCodeTableComponent)
  private _chooseCodeTableComp: ChooseCodeTableComponent;

  // 컬럼사전 선택 컴포넌트
  @ViewChild(ChooseColumnDictionaryComponent)
  private _chooseColumnDictionaryComp: ChooseColumnDictionaryComponent;

  // 코드 테이블 프리뷰 레이어
  @ViewChildren('codeTablePreview')
  private _codeTablePreview: ElementRef;
  @ViewChildren('codeTable')
  private _codeTable: ElementRef;

  // logical type 레이어
  @ViewChildren('logicalType')
  private _logicalType: ElementRef;
  @ViewChildren('logicalTypeList')
  private _logicalTypeList: ElementRef;

  // 현재 선택한 컬럼
  private _selectedColumn: MetadataColumn;

  // 코드 테이블의 조직 상세정보
  private _codeTableDetailList: CodeTable[];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 필드 목록
  public columnList: MetadataColumn[];

  // logical type list
  public logicalTypeList: any[];
  public logicalTypeEtcList: any[];

  // 정렬
  public selectedContentSort: Order = new Order();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private _columnDictionaryService: ColumnDictionaryService,
              private _codeTableService: CodeTableService,
              private _metaDataService: MetadataService,
              public metaDataModelService: MetadataModelService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
    // ui 초기화
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
    this._getColumnSchemaList();
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
   * 현재 필드의 logical Type label
   * @param {MetadataColumn} column
   * @returns {string}
   */
  public getSelectedLogicalTypeLabel(column: MetadataColumn): string {
    return column.type ? this.logicalTypeList.filter((type) => {
      return type.value === column.type;
    })[0].label : 'Select';
  }

  /**
   * 코드 미리보기 데이터
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
   * 컬럼 인기도
   * @param {MetadataColumn} column
   * @returns {string}
   */
  public getColumnPopularity(column: MetadataColumn): string {
    return (column.popularity || 0) + '%';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /**
   * 컬럼 사전이 선택되어있는지 여부
   * @param {MetadataColumn} column
   * @returns {boolean}
   */
  public isSelectedDictionary(column: MetadataColumn): boolean {
    return !(column.dictionary === undefined || column.dictionary === null);
  }

  /**
   * 해당 컬럼의 타입이 시간인지 확인
   * @param {MetadataColumn} column
   * @returns {boolean}
   */
  public isTimeType(column: MetadataColumn): boolean {
    return column.type && column.type.toString() === 'TIMESTAMP';
  }

  /**
   * save validation
   * @returns {boolean}
   */
  public isEnableSave(): boolean {
    return this._getReplaceColumns().length > 0;
  }

  /**
   * 현재 선택된 logical 타입인지
   * @param {MetadataColumn} column
   * @param {any} type
   * @returns {boolean}
   */
  public isSelectedLogicalType(column: MetadataColumn, type: any): boolean {
    // 데이터소스 타입 메타데이터이고 기본타입 이외에 다른 값이라면 Etc
    return column.type === type;
  }

  /**
   * 기타 선택 타입인지
   * @param {MetadataColumn} column
   * @returns {boolean}
   */
  public isEtcLogicalType(column: MetadataColumn): boolean {
    return column.type === LogicalType.ETC || this.logicalTypeEtcList.findIndex((item) => {
      return item.value === column.type;
    }) !== -1;
  }

  /**
   * 메타데이터 타입이 데이터소스 인지
   * @returns {boolean}
   */
  public isDataSourceMetaDataType(): boolean {
    return this.metaDataModelService.getMetadata().sourceType.toString() === 'ENGINE';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * scroll이 발생한경우 show창 닫기
   */
  public onScrollColumnView(): void {
    this.columnList && this.columnList.forEach((column) => {
      column['typeListFl'] = false;
      column['codeTableShowFl'] = false;
    });
  }

  /**
   * 필드 원상복구 클릭 이벤트
   */
  public onClickRestore(): void {
    this.columnList = _.cloneDeep(this._originColumnList);
  }

  /**
   * 변경된 필드 저장 클릭 이벤트
   */
  public onClickSave(): void {
    // 변경사항이 있을때만 on
    this.isEnableSave() && this._updateColumnSchema();
  }

  /**
   * column 의 변경이벤트 발생
   * @param {MetadataColumn} column
   */
  public onChangedValue(column: MetadataColumn): void {
    // 변경이벤트 체크
    column['replaceFl'] = true;
  }

  /**
   * logical type list show
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
   * logical type 변경 이벤트
   * @param {MetadataColumn} column
   * @param logicalType
   */
  public onChangeLogicalType(column: MetadataColumn, logicalType: any): void {
    // 변경이벤트 체크
    this.onChangedValue(column);
    // 만약 변경될 타입이 logicalType이라면 format init
    if (logicalType === 'TIMESTAMP') {
      column.format = new FieldFormat();
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
    // 현재 선택한 컬럼의 코드 테이블 변경
    this._selectedColumn.codeTable = codeTable;
    // 현재 선택한 컬럼 해제
    this._selectedColumn = null;
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
   * 코드 테이블 디테일 클릭 이벤트
   * @param {CodeTable} codeTable
   */
  public onClickCodeTableDetails(codeTable: CodeTable): void {
    // event bubbling stop
    event.stopImmediatePropagation();
    // 해당 코드 테이블 상세화면으로 이동
    this.router.navigate(['management/metadata/code-table', codeTable.id])
  }

  /**
   * 사전 이름 클릭 이벤트
   * @param {ColumnDictionary} dictionary
   */
  public onClickDictionary(dictionary: ColumnDictionary): void {
    // event bubbling stop
    event.stopImmediatePropagation();
    // 해당 사전 상세화면으로 이동
    dictionary && this.router.navigate(['management/metadata/column-dictionary', dictionary.id]);
  }

  /**
   * 컬럼 사전 검색 클릭 이벤트
   * @param {MetadataColumn} column
   */
  public onClickSearchDictionary(column: MetadataColumn): void {
    // event bubbling stop
    event.stopImmediatePropagation();
    // 현재 선택한 컬럼 저장
    this._selectedColumn = column;
    // 컬럼 사전 선택 컴포넌트
    this._chooseColumnDictionaryComp.init('CREATE', column.dictionary);
  }

  /**
   * 코드 테이블 검색 클릭 이벤트
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
      this._chooseCodeTableComp.init('CREATE', column.codeTable);
    }
  }

  /**
   * 컬럼 정렬 클릭 이벤트
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
    this.columnList = _.orderBy(this.columnList, this.selectedContentSort.key, 'asc' === this.selectedContentSort.sort ? 'asc' : 'desc' );
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui 초기화
   * @private
   */
  private _initView(): void {
    // column list
    this.columnList = [];
    // logicalType
    this.logicalTypeList = this.getMetaDataLogicalTypeList();
    // logical etc type
    this.logicalTypeEtcList = this.getMetaDataLogicalTypeEtcList();
    // 코드 테이블 조직 상세정보 목록 초기화
    this._codeTableDetailList = [];
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컬럼 스키마 목록 조회
   * @private
   */
  private _getColumnSchemaList(): void {
    // 로딩 show
    this.loadingShow();
    // 컬럼 조회
    this._metaDataService.getColumnSchemaListInMetaData(this.metaDataModelService.getMetadata().id)
      .then((result) => {
        // 컬럼 데이터
        this.columnList = result;
        // 컬럼 데이터 원본 저장
        this._originColumnList = _.cloneDeep(result);
        // 로딩 hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 컬럼 스키마 수정
   * @private
   */
  private _updateColumnSchema(): void {
    // 로딩 show
    this.loadingShow();
    // 컬럼 수정
    this._metaDataService.updateColumnSchema(this.metaDataModelService.getMetadata().id, this._getUpdateColumnParams())
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.comm.alert.save.success'));
        // 재조회
        this._getColumnSchemaList();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 변경에 사용될 필드
   * @returns {any}
   * @private
   */
  private _getUpdateColumnParams(): any {
    // 변경이 일어난 컬럼 목록
    const result: any = _.cloneDeep(this._getReplaceColumns());
    result.forEach((item: any) => {
      // id 강제 형변환 ( string -> int )
      ( item['id'] ) && ( item['id'] = ( item['id'] * 1 ) );
      // op 설정
      item['op'] = 'replace';
      // 필요없는 변수들 제거
      delete item['replaceFl'];
      delete item['nameChangeFl'];
      delete item['typeListFl'];
      delete item['codeTableShowFl'];
      // name이 있고 255자가 넘어간다면
      if (item.name && item.name.length > 255) {
        item.name = item.name.substr(0, 254);
      }
      // description이 있고 1000자가 넘어간다면
      if (item.description && item.description.length > 1000) {
        item.description = item.description.substr(0, 999);
      }
      // format이 있고 255자가 넘어간다면
      if (item.type === 'TIMESTAMP' && item.format.format.length > 255) {
        item.format = {
          format : item.format.format.substr(0, 254)
        }
      }
      // dictionary가 있다면
      item.dictionary && (item['dictionary'] = `/api/dictionaries/${item.dictionary.id}`);
      // code table이 있다면
      item.codeTable && (item['codeTable'] = `/api/codetables/${item.codeTable.id}`);
    });
    return result;
  }

  /**
   * 변경되는 컬럼 목록
   * @returns {MetadataColumn[]}
   * @private
   */
  private _getReplaceColumns(): MetadataColumn[] {
    return this.columnList.filter((field) => {
      return field['replaceFl'];
    });
  }

  /**
   * 코드 테이블 상세정보 조회
   * @param {string} codeTableId
   * @private
   */
  private _getDetailCodeTable(codeTableId: string): void {
    // 로딩 show
    this.loadingShow();
    // 코드 테이블 상세조회
    this._codeTableService.getCodeTableDetail(codeTableId)
      .then((result) => {
        // 코드 테이블 상세조회 데이터
        this._codeTableDetailList.push(result);
        // 로딩 hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 컬럼 사전 상세정보 조회
   * @param {string} dictionaryId
   * @private
   */
  private _getDetailColumnDictionary(dictionaryId: string): void {
    // 로딩 show
    this.loadingShow();
    // 컬럼 사전 상세조회
    this._columnDictionaryService.getColumnDictionaryDetail(dictionaryId)
      .then((result) => {
        // 변경된 컬럼의 사전정보로 logicalType, Format, CodeTable, Description 적용
        this._selectedColumn.type = result.logicalType || null;
        this._selectedColumn.format = result.format || new FieldFormat();
        this._selectedColumn.description = result.description || null;
        // 이름이 사용자에 의해 변경되지 않았다면 컬럼 사전의 이름을 name으로 지정함
        !this._selectedColumn['nameChangeFl'] && (this._selectedColumn.name = result.logicalName);
        // 컬럼 사전에 연결된 코드 테이블이 있는경우
        if (result.linkCodeTable) {
          // 코드 테이블 조회
          this._getCodeTableInColumnDictionary(dictionaryId);
        } else {
          // 컬럼의 코드 테이블 제거
          this._selectedColumn.codeTable = null;
          // 로딩 hide
          this.loadingHide();
        }
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 컬럼 사전에 연결된 코드 테이블 조회
   * @private
   */
  private _getCodeTableInColumnDictionary(dictionaryId: string): void {
    // 로딩 show
    this.loadingShow();
    // 코드 테이블 조회
    this._columnDictionaryService.getCodeTableInColumnDictionary(dictionaryId)
      .then((result) => {
        // 코드테이블
        this._selectedColumn.codeTable = result;
        // 현재 선택한 컬럼 해제
        this._selectedColumn = null;
        // 로딩 hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }
}

class Order {
  key: string = 'physicalName';
  sort: string = 'asc';
}
