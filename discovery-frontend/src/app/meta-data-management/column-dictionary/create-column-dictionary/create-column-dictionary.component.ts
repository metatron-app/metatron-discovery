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

import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {CommonUtil} from '@common/util/common.util';
import {AbstractComponent} from '@common/component/abstract.component';
import {CodeTable} from '@domain/meta-data-management/code-table';
import {FieldFormat, FieldFormatType} from '@domain/datasource/datasource';
import {ChooseCodeTableComponent} from '../../component/choose-code-table/choose-code-table.component';
import {ColumnDictionaryService} from '../service/column-dictionary.service';

@Component({
  selector: 'app-create-column-dictionary',
  templateUrl: './create-column-dictionary.component.html',
})
export class CreateColumnDictionaryComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 코드 테이블 선택 컴포넌트
  @ViewChild(ChooseCodeTableComponent)
  private _chooseCodeTableComp: ChooseCodeTableComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 논리명
  public logicalName: string;
  // 컬럼명
  public columnName: string;
  // 약어
  public shortName: string;
  // 설명
  public description: string;
  // 선택한 코드 테이블
  public selectedCodeTable: CodeTable;

  // 논리명 validation message
  public logicalNameValidationMsg: string;
  // 컬럼명 validation message
  public columnNameValidationMsg: string;
  // 약어 validation message
  public shortNameValidationMsg: string;
  // 설명 validation message
  public descriptionValidationMsg: string;

  // 메타트론 기본 타입 리스트
  public typeList: any;
  // 선택한 메타트론 기본 타입
  public selectedType: string;
  // 타임 포맷
  public timeFormat: string;
  // 값 단위
  public valueUnit: string;

  // show flag
  public showFl: boolean = false;
  // select box flag
  public typeShowFl: boolean = false;

  @Output()
  public createComplete: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    private _columnDictionaryService: ColumnDictionaryService,
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
   * init
   */
  public init(): void {
    // ui init
    this._initView();
    // show flag
    this.showFl = true;
  }

  /**
   * 현재 필드의 logical Type label
   * @returns {string}
   */
  public getSelectedLogicalTypeLabel(): string {
    return this.typeList.filter((type) => {
      return type.value === this.selectedType;
    })[0].label;
  }

  /**
   * 타입이 시간 타입일 경우에만 보여주기
   * @returns {boolean}
   */
  public isShowTimeFormat(): boolean {
    return this.selectedType === 'TIMESTAMP';
  }

  /**
   * 현재 선택한 타입인지
   * @param {string} type
   * @returns {boolean}
   */
  public isSelectedLogicalType(type: string): boolean {
    return this.selectedType === type;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * done 클릭 이벤트
   */
  public onClickDone(): void {
    // validation 체크 & 논리명 중복되는지 확인 후 컬럼 사전 생성
    if (this._doneValidation()) {
      this.doneLogicNameValidation().then(isOk => {
        (isOk) && (this._createColumnDictionary());
      });
    }
  }

  /**
   * close 클릭 이벤트
   */
  public onClickCancel(): void {
    // close
    this.showFl = false;
  }

  /**
   * 논리명 키 입력 이벤트
   */
  public onKeypressLogicalName(): void {
    this.logicalNameValidationMsg = null;
  }

  /**
   * 컬럼명 키 입력 이벤트
   */
  public onKeypressColumnName(): void {
    this.columnNameValidationMsg = null;
  }

  /**
   * 약어 키 입력 이벤트
   */
  public onKeypressShortName(): void {
    this.shortNameValidationMsg = null;
  }

  /**
   * 설명 키 입력 이벤트
   */
  public onKeypressDescription(): void {
    this.descriptionValidationMsg = null;
  }

  /**
   * 코드 테이블 선택 컴포넌트 클릭 이벤트
   */
  public onClickChooseCodeTable(): void {
    this._chooseCodeTableComp.init('CREATE', this.selectedCodeTable);
  }

  /**
   * 타입 변경 이벤트
   * @param item
   */
  public onChangeType(item: any): void {
    // 타입 변경
    this.selectedType = item;
  }

  /**
   * 코드 테이블 변경 이벤트
   * @param {CodeTable} codeTable
   */
  public onChangeSelectCodeTable(codeTable: CodeTable): void {
    this.selectedCodeTable = codeTable;
  }

  public doneLogicNameValidation(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      // 논리명 비어있는지 확인
      if (this.logicalName.trim() === '') {
        // message
        this.logicalNameValidationMsg = this.translateService.instant(
          'msg.metadata.ui.dictionary.create.valid.logical.name.required');
        // return
        return false;
      }

      // 논리명 자리수 계산
      if (CommonUtil.getByte(this.logicalName.trim()) > 150) {
        // message
        this.logicalNameValidationMsg = this.translateService.instant(
          'msg.metadata.ui.dictionary.create.valid.logical.name.length');
        // return
        return false;
      }

      // 로딩 show
      this.loadingShow();
      // 논리명이 중복인지 확인
      return this._columnDictionaryService.getDuplicateLogicalNameInColumnDictionary(this.logicalName.trim()).then((result) => {
        this.loadingHide();
        // 중복
        if (result['duplicated']) {
          // message
          this.logicalNameValidationMsg = this.translateService.instant(
            'msg.metadata.ui.dictionary.create.valid.logical.name.duplicated', {value: this.logicalName.trim()});
          // 로딩 hide
          return false;
        } else {
          resolve(true);
        }
      });
    });
  }

  public doneColNameValidation(): boolean {
    // 컬럼명 비어있는지 확인
    if (this.columnName.trim() === '') {
      // message
      this.columnNameValidationMsg = this.translateService.instant(
        'msg.metadata.ui.dictionary.create.valid.column.name.required');
      // return
      return false;
    }
    // 컬럼명 자리수 계산
    if (CommonUtil.getByte(this.columnName.trim()) > 150) {
      // message
      this.columnNameValidationMsg = this.translateService.instant(
        'msg.metadata.ui.dictionary.create.valid.column.name.length');
      // return
      return false;
    }
    return true;
  }

  public doneShortNameValidation(): boolean {
    // 약어가 자리수 계산
    if (CommonUtil.getByte(this.shortName.trim()) > 150) {
      // message
      this.shortNameValidationMsg = this.translateService.instant(
        'msg.metadata.ui.dictionary.create.valid.short.name.length');
      // return
      return false;
    }
    return true;
  }

  public doneDescValidation(): boolean {
    // 설명 자리수 계산
    if (CommonUtil.getByte(this.description.trim()) > 150) {
      // message
      this.descriptionValidationMsg = this.translateService.instant(
        'msg.metadata.ui.dictionary.create.valid.desc.length');
      // return
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
   * ui init
   * @private
   */
  private _initView(): void {
    // 소수, 정수, 시간, 문자, 논리, 위도, 경도, 전화번호, 이메일, 성별, 웹주소, 국가, 주, 시, 구/군, 동, 우편번호, 개인정보
    this.typeList = this.getMetaDataLogicalTypeList();
    this.selectedType = this.typeList[0].value;
    // 논리명 초기화
    this.logicalName = '';
    // 컬럼명 초기
    this.columnName = '';
    // 약어 초기화
    this.shortName = '';
    // 설명 초기화
    this.description = '';
    // 메세지 초기화
    this.logicalNameValidationMsg = null;
    this.columnNameValidationMsg = null;
    // select box flag
    this.typeShowFl = false;
    // 선택한 코드 테이블 초기화
    this.selectedCodeTable = null;
    // 타임포맷 초기화
    this.timeFormat = null;
  }

  /**
   * done validation
   * @returns {boolean}
   * @private
   */
  private _doneValidation(): boolean {
    return this.doneColNameValidation()
      && this.doneShortNameValidation()
      && this.doneDescValidation();
  }

  /**
   * 컬럼 사전 생성
   * @private
   */
  private _createColumnDictionary(): void {
    // 로딩 show
    this.loadingShow();
    // 컬럼 사전 생성
    this._columnDictionaryService.createColumnDictionary(this._getCreateColumnDictionaryParams()).then((result) => {
      // alert
      Alert.success(
        this.translateService.instant('msg.metadata.ui.dictionary.create.success', {value: this.logicalName.trim()}));
      // 로딩 hide
      this.loadingHide();
      this.onClickCancel();
      // close
      this.createComplete.emit(result.id);
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 컬럼 사전 생성시 필요한 파라메터
   * @returns {Object}
   * @private
   */
  private _getCreateColumnDictionaryParams(): object {
    const params = {
      name: this.columnName.trim(),
      suggestionShortName: this.shortName.trim(),
      logicalName: this.logicalName.trim(),
      description: this.description.trim(),
      logicalType: this.selectedType,
      dataType: 'STRING',
    };
    // 타입이 시간인경우 format 추가
    if (this.selectedType === 'TIMESTAMP') {
      params['format'] = new FieldFormat();
      params['format'].format = this.timeFormat;
      params['format'].type = FieldFormatType.DATE_TIME;
    }

    // 선택한 코드 테이블이 있다면
    this.selectedCodeTable && (params['codeTable'] = `api/codetables/${this.selectedCodeTable.id}`);

    return params;
  }
}
