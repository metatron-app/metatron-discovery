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

import {AbstractComponent} from '../../../common/component/abstract.component';
import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Location} from '@angular/common';
import {DeleteModalComponent} from '../../../common/component/modal/delete/delete.component';
import {CodeTableService} from '../service/code-table.service';
import {ActivatedRoute} from '@angular/router';
import {CodeTable} from '../../../domain/meta-data-management/code-table';
import {CodeValuePair} from '../../../domain/meta-data-management/code-value-pair';
import {Alert} from '../../../common/util/alert.util';
import {Modal} from '../../../common/domain/modal';
import * as _ from 'lodash';
import {CommonUtil} from '../../../common/util/common.util';
import {ConfirmModalComponent} from '../../../common/component/modal/confirm/confirm.component';
import {LinkedColumnDictionaryComponent} from '../../component/linked-column-dictionary/linked-column-dictionary.component';
import {ColumnDictionary} from '../../../domain/meta-data-management/column-dictionary';

@Component({
  selector: 'app-detail-code-table',
  templateUrl: './detail-code-table.component.html',
})
export class DetailCodeTableComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 코드 테이블 아이디
  private _codeTableId: string;
  // 코드 테이블 상세정보 origin
  private _originCodeTable: CodeTable;
  // 코드 목록 origin
  private _originCodeList: CodeValuePair[] = [];
  // 삭제 컴포넌트
  @ViewChild(DeleteModalComponent)
  private _deleteComp: DeleteModalComponent;
  // 확인 컴포넌트
  @ViewChild(ConfirmModalComponent)
  private _confirmComp: ConfirmModalComponent;
  // 연결된 컬럼 사전 전체목록 컴포넌트
  @ViewChild(LinkedColumnDictionaryComponent)
  private _linkedColumnDictionaryComp: LinkedColumnDictionaryComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 코드 테이블 상세정보
  public codeTable: CodeTable;
  // 코드 목록
  public codeList: CodeValuePair[] = [];
  // 연결된 컬럼 사전 목록
  public linkedDictionaryList: ColumnDictionary[] = [];
  // 연결된 컬럼사전 목록 수
  public linkedDictionaryTotalCount: number = 0;

  // re name
  public reName: string = '';
  // re description
  public reDesc: string = '';
  // name edit flag
  public nameEditFl: boolean = false;
  // desc edit flag
  public descEditFl: boolean = false;

  @ViewChild('nameElement')
  public nameElement: ElementRef;

  @ViewChild('descElement')
  public descElement: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    private _location: Location,
    private _codeTableService: CodeTableService,
    private _activatedRoute: ActivatedRoute,
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

    this._activatedRoute.params.subscribe((params) => {
      // ui init
      this._initView();
      // code table id
      this._codeTableId = params['codeTableId'];
      // 현재 코드테이블 상세조회
      this._getDetailCodeTable();
    });

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
   * 코드 테이블 제거
   */
  public deleteCodeTable(): void {
    // 로딩 show
    this.loadingShow();
    // 코드 테이블 제거
    this._codeTableService.deleteCodeTable(this._codeTableId).then((result) => {
      // alert
      Alert.success(
        this.translateService.instant('msg.metadata.ui.codetable.delete.success', {value: this._originCodeTable.name}));
      // 코드테이블 목록으로 돌아가기
      this.router.navigate(['/management/metadata/code-table']);
    }).catch((error) => {

      // 로딩 hide
      this.loadingHide();
    });
  }

  /**
   * 확인 이벤트 핸들러
   * @param {Modal} modal
   */
  public confirmHandler(modal: Modal): void {
    // 코드 테이블 업데이트
    switch (modal.data) {
      case 'CODE':
        // 코드 테이블 업데이트
        this._updateCodesInCodeTable();
        return;
    }
  }

  /**
   * 코드 테이블 쌍이 하나 이상인지
   * @returns {boolean}
   */
  public isShowDeleteCodePair(): boolean {
    return this.codeList.length > 1;
  }

  /**
   * 연결된 컬럼 사전 목록
   * @returns {ColumnDictionary[]}
   */
  public getLinkedColumnDictionaryList(): ColumnDictionary[] {
    return this.linkedDictionaryList.slice(0, 3);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 이전으로 돌아가기 버튼 클릭 이벤트
   */
  public onClickPrevButton(): void {
    // 코드 테이블 목록 화면으로 이동
    this._location.back();
  }

  /**
   * 코드 테이블 삭제 클릭 이벤트
   */
  public onClickDeleteCodeTable(): void {
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.metadata.ui.codetable.delete.title');
    modal.description = this._originCodeTable.name;
    modal.btnName = this.translateService.instant('msg.comm.ui.del');
    this._deleteComp.init(modal);
  }

  /**
   * 연결된 컬럼 사전 목록 더보기 클릭 이벤트
   */
  public onClickUsedInColumnDictionaryMoreList(): void {
    this._linkedColumnDictionaryComp.init(this._codeTableId);
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
   */
  public onClickDeleteCode(code: any): void {
    // 리스트에서 제거
    this.codeList.splice(_.findIndex(this.codeList, (item) => {
      return item === code;
    }), 1);
  }

  /**
   * 코드 테이블 리스트에 추가 클릭 이벤트
   */
  public onClickAddCode(): void {
    this.codeList.push(new CodeValuePair());
  }

  /**
   * 이전 코드 테이블로 되돌리기
   */
  public onClickResetCodeTable(): void {
    this.codeList = _.cloneDeep(this._originCodeList);
  }

  /**
   * 변경된 코드 테이블 저장
   */
  public onClickSaveCodeTable(): void {
    // code list validation
    if (this._codeListValidation()) {
      const modal: Modal = new Modal();
      modal.name = this.translateService.instant('msg.comm.ui.confirm.title');
      modal.description = this.translateService.instant('msg.comm.ui.confirm.desc');
      modal.btnName = this.translateService.instant('msg.comm.btn.confirm.done');
      modal.btnCancel = this.translateService.instant('msg.comm.btn.confirm.cancel');
      // code
      modal.data = 'CODE';
      // 확인 컴포넌트 열기
      this._confirmComp.init(modal);
    }
  }

  /**
   * 테이블 이름 수정 이벤트
   */
  public onClickUpdateName(): void {
    // 테이블 이름이 비어있다면
    if (this.reName.trim() === '') {
      // alert
      Alert.warning(this.translateService.instant('msg.metadata.ui.codetable.create.valid.table.name.required'));
      // return
      return;
    }
    // 테이블 이름 길이 체크
    if (CommonUtil.getByte(this.reName.trim()) > 150) {
      // alert
      Alert.warning(this.translateService.instant('msg.metadata.ui.codetable.create.valid.table.name.length'));
      // return
      return;
    }
    // 테이블 중복 체크 후 업데이트 요청
    this._checkEnableTableNameAndUpdateCodeTable();
  }

  /**
   * 테이블 설명 클릭 이벤트
   */
  public onClickUpdateDesc(): void {
    // 테이블 설명 길이 체크
    if (CommonUtil.getByte(this.reDesc.trim()) > 900) {
      // alert
      Alert.warning(this.translateService.instant('msg.metadata.ui.codetable.create.valid.table.desc.length'));
      // return
      return;
    }
    // edit flag
    this.descEditFl = false;
    // blur
    // this.descElement.nativeElement.blur();
    // 테이블 업데이트
    this._updateCodeTable({description: this.reDesc.trim()});
  }

  /**
   * 이름 변경 모드
   */
  public onChangeNameMode(): void {
    this.nameEditFl = true;
    this.reName = this.codeTable.name;
  }

  /**
   * 설명 변경 모드
   */
  public onChangeDescMode(): void {
    this.descEditFl = true;
    this.reDesc = this.codeTable.description;
  }

  /**
   * code table validation init
   * @param {CodeValuePair} pair
   */
  public onKeypressCodePair(pair: CodeValuePair): void {
    pair['invalid'] && (pair['invalid'] = null);
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
    // 상세정보 초기화
    this.codeTable = new CodeTable();
    this._originCodeTable = new CodeTable();
    // 코드 테이블 목록 초기화
    this.codeList = [];
    this._originCodeList = [];
    // 연결된 컬럼 사전 목록 초기화
    this.linkedDictionaryList = [];
  }

  /**
   * 코드 테이블 업데이트
   * @param {Object} params
   * @private
   */
  private _updateCodeTable(params?: object): void {
    // 로딩 show
    this.loadingShow();

    this._codeTableService.updateCodeTable(this._codeTableId, params ? params : this._getUpdateCodeTableParams()).
      then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.comm.alert.confirm.success'));
        // 재조회
        this._getDetailCodeTable();
      }).
      catch((error) => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 코드 테이블 내의 코드와 값 업데이트
   * @private
   */
  private _updateCodesInCodeTable(): void {
    // 로딩 show
    this.loadingShow();
    // 코드와 값 업데이트
    this._codeTableService.updateCodeValueInCodeTable(this._codeTableId, this._getUpdateCodeParams()).then((result) => {
      // alert
      Alert.success(this.translateService.instant('msg.comm.alert.confirm.success'));
      // 재조회
      this._getDetailCodeTable();
    }).catch((error) => {
      // 로딩 hide
      this.loadingHide();
    });
  }

  /**
   * 테이블 이름 중복 체크후 코드 테이블 업데이트
   * @private
   */
  private _checkEnableTableNameAndUpdateCodeTable(): void {
    // 로딩 show
    this.loadingShow();
    // 테이블 이름이 중복인지 확인
    this._codeTableService.getDuplicateTableNameInCodeTable(this.reName.trim()).then((result) => {
      // 중복
      if (result['duplicated']) {
        // alert
        Alert.warning(
          this.translateService.instant(
            'msg.metadata.ui.codetable.create.valid.table.name.duplicated',
            {value: this.reName.trim()},
          ),
        );
        // 로딩 hide
        this.loadingHide();
      } else {
        // edit flag
        this.nameEditFl = false;
        // blur
        // this.nameElement.nativeElement.blur();
        // 테이블 업데이트
        this._updateCodeTable({name: this.reName.trim()});
      }
    }).catch((error) => {
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
    for (let i = 0; i < this.codeList.length; i++) {
      // code나 value 둘 중 하나가 비어있으면 validation message 표시
      if (this.codeList[i].code && this.codeList[i].value && this.codeList[i].code.trim() !== '' &&
        this.codeList[i].value.trim() !== '') {
        this.codeList[i]['invalid'] = false;
      } else {
        this.codeList[i]['invalid'] = true;
        return false;
      }
    }
    return true;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 코드 테이블 상세정보 조회
   * @private
   */
  private _getDetailCodeTable(): void {
    // 로딩 show
    this.loadingShow();
    // 코드 테이블 상세조회
    this._codeTableService.getCodeTableDetail(this._codeTableId).then((result) => {
      // 코드 테이블 상세조회 데이터
      this.codeTable = result;
      // origin 테이블 데이터
      this._originCodeTable = _.cloneDeep(result);
      // 연결된 코드 리스트
      this.codeList = result['codes'];
      // origin 연결된 코드 리스트
      this._originCodeList = _.cloneDeep(result['codes']);
      // 연결된 컬럼 사전 목록 조회
      this._getColumnDictionaryList();
    }).catch((error) => {
      // 로딩 hide
      this.loadingHide();
    });
  }

  /**
   * 연결된 컬럼 사전 목록 조회
   * @private
   */
  private _getColumnDictionaryList(): void {
    // 로딩 show
    this.loadingShow();
    // 컬럼 사전 목록 조회
    this._codeTableService.getColumnDictionaryInCodeTable(this._codeTableId, {
      size: 15,
      page: 0,
      sort: 'logicalName,asc',
    }).then((result) => {
      // 수
      this.linkedDictionaryTotalCount = result['page'].totalElements;
      // 목록
      this.linkedDictionaryList = result['_embedded'] ? result['_embedded'].dictionaries : [];
      // 로딩 hide
      this.loadingHide();
    }).catch((error) => {
      // 로딩 hide
      this.loadingHide();
    });
  }

  /**
   * 코드 테이블 업데이트시 사용되는 파라메터
   * @returns {Object}
   * @private
   */
  private _getUpdateCodeTableParams(): object {
    const params = {
      name: this.codeTable.name.trim(),
      description: this.codeTable.description.trim(),
    };
    return params;
  }

  /**
   * 변경될 코드 파라메터
   * @returns {any}
   * @private
   */
  private _getUpdateCodeParams(): any {
    const params = [];
    // remove
    this._originCodeList.forEach((origin) => {
      _.findIndex(this.codeList, (code) => {
        return origin.id && origin.id === code.id;
      }) === -1 && params.push({id: origin.id, op: 'remove'});
    });
    // add | replace
    this.codeList.forEach((code) => {
      // origin index
      const originIndex = _.findIndex(this._originCodeList, (origin) => {
        return origin.id && code.id === origin.id;
      });

      if (originIndex === -1) {
        // add
        params.push({op: 'add', code: code.code, value: code.value});
      } else if (code.code !== this._originCodeList[originIndex].code || code.value !==
        this._originCodeList[originIndex].value) {
        // replace
        params.push({op: 'replace', code: code.code, value: code.value, id: code.id});
      }
    });

    return params;
  }
}
