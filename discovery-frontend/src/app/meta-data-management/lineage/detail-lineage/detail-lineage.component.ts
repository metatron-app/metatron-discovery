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
import {LineageService} from '../service/lineage.service';
import {ActivatedRoute} from '@angular/router';
import {Lineage} from '../../../domain/meta-data-management/lineage';
import {CodeValuePair} from '../../../domain/meta-data-management/code-value-pair';
import {Alert} from '../../../common/util/alert.util';
import {Modal} from '../../../common/domain/modal';
import * as _ from 'lodash';
import {CommonUtil} from '../../../common/util/common.util';
import {ConfirmModalComponent} from '../../../common/component/modal/confirm/confirm.component';
import {LinkedColumnDictionaryComponent} from '../../component/linked-column-dictionary/linked-column-dictionary.component';
import {ColumnDictionary} from '../../../domain/meta-data-management/column-dictionary';

@Component({
  selector: 'app-detail-lineage',
  templateUrl: './detail-lineage.component.html',
})
export class DetailLineageComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 코드 테이블 아이디
  private _lineageId: string;
  // 코드 테이블 상세정보 origin
  private _originLineage: Lineage;
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
  public lineage: Lineage;
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
    private _lineageService: LineageService,
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
      // lineage id
      this._lineageId = params['lineageId'];
      // 현재 코드테이블 상세조회
      this._getDetailLineage();
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
  public deleteLineage(): void {
    // 로딩 show
    this.loadingShow();
    // 코드 테이블 제거
    this._lineageService.deleteLineage(this._lineageId).then((result) => {
      // alert
      Alert.success(
        this.translateService.instant('msg.metadata.ui.codetable.delete.success', {value: this._originLineage.id}));
      // 코드테이블 목록으로 돌아가기
      this._location.back();
    }).catch(() => {

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
        // this._updateCodesInCodeTable();
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
   * 리니지 삭제 클릭 이벤트
   */
  public onClickDeleteLineage(): void {
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.metadata.ui.codetable.delete.title');
    modal.btnName = this.translateService.instant('msg.comm.ui.del');
    this._deleteComp.init(modal);
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
    this._updateLineage({description: this.reDesc.trim()});
  }

  /**
   * 이름 변경 모드
   */
  public onChangeNameMode(): void {
    this.nameEditFl = true;
    // this.reName = this.lineage.name;
  }

  /**
   * 설명 변경 모드
   */
  public onChangeDescMode(): void {
    this.descEditFl = true;
    // this.reDesc = this.lineage.description;
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
    this.lineage = new Lineage();
    this._originLineage = new Lineage();
  }

  /**
   * 리니지 업데이트
   * @param {Object} params
   * @private
   */
  private _updateLineage(params?: object): void {
    // 로딩 show
    this.loadingShow();

    this._lineageService.updateLineage(this._lineageId, params).
    then((result) => {
      // alert
      Alert.success(this.translateService.instant('msg.comm.alert.confirm.success'));
      // 재조회
      this._getDetailLineage();
    }).
    catch((error) => {
      // 로딩 hide
      this.loadingHide();
    });
  }

  /**
   * 리니지 상세정보 조회
   * @private
   */
  private _getDetailLineage(): void {
    // 로딩 show
    this.loadingShow();
    // 코드 테이블 상세조회
    // this._lineageeService.getLineageDetail(this._codeTableId).then((result) => {
    //   // 코드 테이블 상세조회 데이터
    //   this.lineage = result;
    //   // origin 테이블 데이터
    //   this._originLineage = _.cloneDeep(result);
    //   // 연결된 리니지 리스트
    //   this.lineageList = result['lineages'];
    //   // origin 연결된 코드 리스트
    //   this._originLineageList = _.cloneDeep(result['lineages']);
    //   // 연결된 리니지 목록 조회
    //   this._getLineageList();
    // }).catch((error) => {
    //   // 로딩 hide
    //   this.loadingHide();
    // });
  }

}
