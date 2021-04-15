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

import * as _ from 'lodash';
import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {CommonUtil} from '@common/util/common.util';
import {AbstractComponent} from '@common/component/abstract.component';
import {CodeValuePair} from '@domain/meta-data-management/code-value-pair';
import {CodeTableService} from '../service/code-table.service';

@Component({
  selector: 'app-create-code-table',
  templateUrl: './create-code-table.component.html',
})
export class CreateCodeTableComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 테이블 이름
  public tableName: string;
  // 테이블 설명
  public tableDescription: string;
  // 테이블 이름 validation message
  public tableNameValidationMsg: string;
  // 테이블 설명 validation message
  public tableDescValidationMsg: string;
  // 코드 테이블 목록
  public codeTableList: CodeValuePair[] = [];
  // 코드 validation message
  public codeValidationMsg: string;

  // show flag
  public showFl: boolean = false;

  @Output()
  public createComplete: EventEmitter<any> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    private _codeTableService: CodeTableService,
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

  public init(): void {
    // ui init
    this._initView();
    // show flag
    this.showFl = true;
  }

  /**
   * 코드 테이블 쌍이 하나 이상인지
   * @returns {boolean}
   */
  public isShowDeleteCodePair(): boolean {
    return this.codeTableList.length > 1;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * done 클릭 이벤트
   */
  public onClickDone(): void {
    // validation 체크 & 테이블 이름 중복 체크후 코드 테이블 생성
    this._doneValidation() && this._checkEnableTableNameAndCreateCodeTable();
  }

  /**
   * close 클릭 이벤트
   */
  public onClickCancel(): void {
    // close
    this.showFl = false;
  }

  /**
   * 테이블 이름 키 입력 이벤트
   */
  public onKeypressTableName(): void {
    this.tableNameValidationMsg = null;
  }

  /**
   * 테이블 설명 키 입력 이벤트
   */
  public onKeypressTableDesc(): void {
    this.tableDescValidationMsg = null;
  }

  /**
   * code table validation init
   * @param {CodeValuePair} pair
   */
  public onKeypressCodePair(pair: CodeValuePair): void {
    pair['invalid'] && (pair['invalid'] = null);
  }

  /**
   * 코드 키 입력 이벤트
   */
  public onKeypressCode(): void {
    this.codeValidationMsg = null;
  }

  /**
   * 코드 테이블 불러오기 클릭 이벤트
   */
  public onClickUploadCodeTable(): void {

  }

  /**
   * 코드 테이블 내보내기 클릭 이벤트
   */
  public onClickDownloadCodeTable(): void {

  }

  /**
   * 코드 테이블 리스트에서 제거 클릭 이벤트
   * @param {CodeValuePair} code
   */
  public onClickDeleteCode(code: CodeValuePair): void {
    // 리스트가 하나이상 있는 경우 리스트에서 제거
    this.codeTableList.length > 1 && this.codeTableList.splice(_.findIndex(this.codeTableList, (item) => {
      return item === code;
    }), 1);
  }

  /**
   * 코드 테이블 리스트에 추가 클릭 이벤트
   */
  public onClickAddCode(): void {
    this.codeTableList.push(new CodeValuePair());
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
    // 테이블 이름 초기화
    this.tableName = '';
    // 테이블 설명 초기화
    this.tableDescription = '';
    // 코드 리스트 초기화
    this.codeTableList = [];
    // 코드 리스트 초기값
    this.codeTableList.push(new CodeValuePair());
    // 메세지 초기화
    this.tableNameValidationMsg = null;
    this.codeValidationMsg = null;
  }

  /**
   * done validation
   * @returns {boolean}
   * @private
   */
  private _doneValidation(): boolean {
    // 테이블 이름이 비어있는지 확인
    if (this.tableName.trim() === '') {
      // message
      this.tableNameValidationMsg = this.translateService.instant(
        'msg.metadata.ui.codetable.create.valid.table.name.required');
      // return
      return false;
    }
    // 테이블 이름 길이 체크
    if (CommonUtil.getByte(this.tableName.trim()) > 150) {
      // message
      this.tableNameValidationMsg = this.translateService.instant(
        'msg.metadata.ui.codetable.create.valid.table.name.length');
      // return
      return false;
    }
    // 테이블 설명 길이 체크
    if (CommonUtil.getByte(this.tableDescription.trim()) > 900) {
      // message
      this.tableDescValidationMsg = this.translateService.instant(
        'msg.metadata.ui.codetable.create.valid.table.desc.length');
      // return
      return false;
    }
    // 코드 리스트가 비어있는지 확인
    return this._codeListValidation();
  }

  /**
   * 테이블 이름 중복 체크후 코드 테이블 생성
   * @private
   */
  private _checkEnableTableNameAndCreateCodeTable(): void {
    // 로딩 show
    this.loadingShow();
    // 테이블 이름이 중복인지 확인
    this._codeTableService.getDuplicateTableNameInCodeTable(this.tableName.trim()).then((result) => {
      // 중복
      if (result['duplicated']) {
        // message
        this.tableNameValidationMsg = this.translateService.instant(
          'msg.metadata.ui.codetable.create.valid.table.name.duplicated', {value: this.tableName.trim()});
        // 로딩 hide
        this.loadingHide();
      } else {
        // 테이블 생성
        this._createCodeTable();
      }
    }).catch(() => {
      // 로딩 hide
      this.loadingHide();
    });
  }

  /**
   * 코드 테이블 생성
   * @private
   */
  private _createCodeTable(): void {
    // 로딩 show
    this.loadingShow();
    // 코드 테이블 생성
    this._codeTableService.createCodeTable(this._getCreateCodeTableParams()).then((result) => {
      // alert
      Alert.success(
        this.translateService.instant('msg.metadata.ui.codetable.create.success', {value: this.tableName.trim()}));
      // close
      this.createComplete.emit(result.id);
      this.onClickCancel();
    }).catch(() => {
      // 로딩 hide
      this.loadingHide();
    });
  }

  /**
   * code list validation
   * @returns {boolean}
   * @private
   */
  private _codeListValidation(): boolean {
    for (let i = 0, nMax = this.codeTableList.length; i < nMax; i++) {
      // code나 value 둘 중 하나가 비어있으면 validation message 표시
      if (this.codeTableList[i].code && this.codeTableList[i].value && this.codeTableList[i].code.trim() !== '' &&
        this.codeTableList[i].value.trim() !== '') {
        this.codeTableList[i]['invalid'] = false;
      } else {
        this.codeTableList[i]['invalid'] = true;
        return false;
      }
    }
    return true;
  }

  /**
   * 코드 테이블 생성시 필요한 파라메터
   * @returns {Object}
   * @private
   */
  private _getCreateCodeTableParams(): object {
    return {
      name: this.tableName.trim(),
      description: this.tableDescription.trim(),
      codes: this._getCodesParams(),
    };
  }

  /**
   * 코드 리스트 파라메터
   * @returns {any}
   * @private
   */
  private _getCodesParams(): any {
    const result = [];
    this.codeTableList.forEach((item) => {
      // code와 value가 모두 존재할 때만 아이템 반환
      if (item.code && item.value && item.code.trim() !== '' && item.value.trim() !== '') {
        result.push({code: item.code, value: item.value});
      }
    });
    return result;
  }
}
