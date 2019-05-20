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
import {DeleteModalComponent} from '../../../common/component/modal/delete/delete.component';
import {Modal} from '../../../common/domain/modal';
import {ActivatedRoute} from '@angular/router';
import {ColumnDictionaryService} from '../service/column-dictionary.service';
import {Alert} from '../../../common/util/alert.util';
import {CommonUtil} from '../../../common/util/common.util';
import {ColumnDictionary} from '../../../domain/meta-data-management/column-dictionary';
import {ChooseCodeTableComponent} from '../../component/choose-code-table/choose-code-table.component';
import {CodeTable} from '../../../domain/meta-data-management/code-table';
import {FieldFormatType, LogicalType} from '../../../domain/datasource/datasource';
import * as _ from 'lodash';
import {LinkedMetadataComponent} from '../../component/linked-metadata-columns/linked-metadata.component';
import {LinkedMetaDataColumn} from '../../../domain/meta-data-management/metadata-column';
import {Location} from '@angular/common';

@Component({
  selector: 'app-detail-column-dictionary',
  templateUrl: './detail-column-dictionary.component.html',
})
export class DetailColumnDictionaryComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 컬럼 사전 아이디
  private _columnDictionaryId: string;

  // 삭제 컴포넌트
  @ViewChild(DeleteModalComponent)
  private _deleteComp: DeleteModalComponent;

  // 연결된 메타데이터 컬럼 리스트 컴포넌트
  @ViewChild(LinkedMetadataComponent)
  private _linkedMetadataComp: LinkedMetadataComponent;

  // 코드 테이블 선택 컴포넌트
  @ViewChild(ChooseCodeTableComponent)
  private _chooseCodeTableComp: ChooseCodeTableComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 컬럼 사전 상세정보
  public columnDictionary: ColumnDictionary;
  // 연결된 메타데이터 목록
  public linkedMetadataList: LinkedMetaDataColumn[] = [];
  // 연결된 메타데이터 목록 수
  public linkedMetadataTotalCount: number = 0;
  // 메타트론 기본 타입 리스트
  public logicalTypeList: any;
  // 타임 포맷
  public timeFormat: string;
  // 값 단위
  public valueUnit: string;
  // edit flag
  public logicalNameEditFl: boolean = false;
  public columnNameEditFl: boolean = false;
  public shortNameEditFl: boolean = false;
  public descEditFl: boolean = false;
  public timeFormatEditFl: boolean = false;
  // re named property
  public reLogicalName: string;
  public reColumnName: string;
  public reShortName: string;
  public reDesc: string;
  public reTimeFormat: string;

  // splited description
  public description: string;

  // select box show flag
  public logicalTypeShowFl: boolean = false;

  // code table detail
  public isShowCodeTableDetail: boolean = false;

  @ViewChild('logicalNameElement')
  public logicalNameElement: ElementRef;

  @ViewChild('columnNameElement')
  public columnNameElement: ElementRef;

  @ViewChild('shortNameElement')
  public shortNameElement: ElementRef;

  @ViewChild('descElement')
  public descElement: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    private _columnDictionaryService: ColumnDictionaryService,
    private _activatedRoute: ActivatedRoute,
    private _location: Location,
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
      // 사전 id
      this._columnDictionaryId = params['dictionaryId'];
      // 현재 컬럼 사전 상세조회
      this._getDetailColumnDictionary();
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
   * 컬럼 사전 제거
   */
  public deleteColumnDictionary(): void {
    // 로딩 show
    this.loadingShow();
    // 컬럼 사전 제거
    this._columnDictionaryService.deleteColumnDictionary(this._columnDictionaryId).then((result) => {
      // alert
      Alert.success(this.translateService.instant('msg.metadata.ui.dictionary.delete.success',
        {value: this.columnDictionary.logicalName}));
      // 컬럼 사전 목록으로 돌아가기
      this.router.navigate(['/management/metadata/column-dictionary']);
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 타입이 시간 타입일 경우에만 보여주기
   * @returns {boolean}
   */
  public isShowTimeFormat(): boolean {
    return this.columnDictionary.logicalType === LogicalType.TIMESTAMP;
  }

  /**
   * 현재 선택한 타입인지
   * @param {any} type
   * @returns {boolean}
   */
  public isSelectedLogicalType(type: any): boolean {
    return this.columnDictionary.logicalType === type;
  }

  /**
   * 메타트론 기본 타입 label 얻기
   * @returns {string}
   */
  public getLogicalTypeLabel(): string {
    const index = _.findIndex(this.logicalTypeList, (item) => {
      return item['value'] === this.columnDictionary.logicalType;
    });
    return index === -1 ? this.logicalTypeList[0].label : this.logicalTypeList[index].label;
  }

  /**
   * 연결된 메타데이터 목록
   * @returns {LinkedMetaDataColumn[]}
   */
  public getLinkedMetaDataColumn(): LinkedMetaDataColumn[] {
    return this.linkedMetadataList.slice(0, 3);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 이전으로 돌아가기 버튼 클릭 이벤트
   */
  public onClickPrevButton(): void {
    // 컬럼 사전 목록 화면으로 이동
    this._location.back();
  }

  /**
   * 컬럼 사전 삭제 클릭 이벤트
   */
  public onClickDeleteColumnDictionary(): void {
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.metadata.ui.dictionary.delete.title');
    modal.description = this.columnDictionary.logicalName;
    modal.btnName = this.translateService.instant('msg.comm.ui.del');
    this._deleteComp.init(modal);
  }

  /**
   * 논리명 변경 모드
   */
  public onChangeLogicalNameMode(): void {
    this.logicalNameEditFl = true;
    this.reLogicalName = this.columnDictionary.logicalName;
  }

  /**
   * 컬럼명 변경 모드
   */
  public onChangeColumnNameMode(): void {
    this.columnNameEditFl = true;
    this.reColumnName = this.columnDictionary.name;
  }

  /**
   * 약어 변경 모드
   */
  public onChangeShortNameMode(): void {
    this.shortNameEditFl = true;
    this.reShortName = this.columnDictionary.suggestionShortName;
  }

  /**
   * 설명 변경 모드
   */
  public onChangeDescMode(): void {
    this.descEditFl = true;
    this.reDesc = this.columnDictionary.description;
  }

  /**
   * 타임포맷 변경 모드
   */
  public onChangeTimeFormatMode(): void {
    this.timeFormatEditFl = true;
    this.reTimeFormat = (this.columnDictionary.format && this.columnDictionary.format.hasOwnProperty('format')) ?
      this.columnDictionary.format.format :
      this.columnDictionary.format;
  }

  /**
   * 코드 테이블 선택 컴포넌트 클릭 이벤트
   */
  public onClickChooseCodeTable(): void {
    this._chooseCodeTableComp.init('UPDATE', this.columnDictionary.codeTable, this._columnDictionaryId);
  }

  public onClickShowCodeTableDetail(): void {
    this.isShowCodeTableDetail = !this.isShowCodeTableDetail;
  }

  /**
   * 코드 테이블 변경 이벤트
   * @param {CodeTable} codeTable
   */
  public onChangeSelectCodeTable(codeTable: CodeTable): void {
    // 재조회
    this._getDetailColumnDictionary();
  }

  /**
   * LogicalType 변경 이벤트
   * @param type
   */
  public onChangeLogicalType(type: string): void {
    // 컬럼 사전 업데이트
    this._updateColumnDictionary({logicalType: type});
  }

  /**
   * 연결된 메타데이터 목록 더보기 클릭 이벤트
   */
  public onClickUsedInMetadataMoreList(): void {
    this._linkedMetadataComp.init(this._columnDictionaryId);
  }

  /**
   * 논리명 수정 클릭 이벤트
   */
  public onClickUpdateLogicalName(): void {
    // 논리명 비어있는지 확인
    if (this.reLogicalName.trim() === '') {
      // alert
      Alert.warning(this.translateService.instant('msg.metadata.ui.dictionary.create.valid.logical.name.required'));
      // return
      return;
    }
    // 논리명 자리수 계산
    if (CommonUtil.getByte(this.reLogicalName.trim()) > 150) {
      // alert
      Alert.warning(this.translateService.instant('msg.metadata.ui.dictionary.create.valid.logical.name.length'));
      // return
      return;
    }
    // 중복 체크후 업데이트
    // 로딩 show
    this.loadingShow();
    // 논리명이 중복인지 확인
    this._columnDictionaryService.getDuplicateLogicalNameInColumnDictionary(this.reLogicalName.trim()).
      then((result) => {
        // 중복
        if (result['duplicated']) {
          // alert
          Alert.warning(this.translateService.instant('msg.metadata.ui.dictionary.create.valid.logical.name.duplicated',
            {value: this.reLogicalName.trim()}));
          // 로딩 hide
          this.loadingHide();
        } else {
          // edit flag
          this.logicalNameEditFl = false;
          // blur
          // this.logicalNameElement.nativeElement.blur();
          // 컬럼 사전 업데이트
          this._updateColumnDictionary({logicalName: this.reLogicalName.trim()});
        }
      }).
      catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 컬럼명 수정 클릭 이벤트
   */
  public onClickUpdateColumnName(): void {
    // 컬럼명 비어있는지 확인
    if (this.reColumnName.trim() === '') {
      // alert
      Alert.warning(this.translateService.instant('msg.metadata.ui.dictionary.create.valid.column.name.required'));
      // return
      return;
    }
    // 컬럼명 자리수 계산
    if (CommonUtil.getByte(this.reColumnName.trim()) > 150) {
      // alert
      Alert.warning(this.translateService.instant('msg.metadata.ui.dictionary.create.valid.column.name.length'));
      // return
      return;
    }
    // edit flag
    this.columnNameEditFl = false;
    // blur
    // this.columnNameElement.nativeElement.blur();
    // 컬럼 사전 업데이트
    this._updateColumnDictionary({name: this.reColumnName.trim()});
  }

  /**
   * 약어 수정 클릭 이벤트
   */
  public onClickUpdateShortName(): void {
    // 약어가 자리수 계산
    if (CommonUtil.getByte(this.reShortName.trim()) > 150) {
      // alert
      Alert.warning(this.translateService.instant('msg.metadata.ui.dictionary.create.valid.short.name.length'));
      // return
      return;
    }
    // edit flag
    this.shortNameEditFl = false;
    // blur
    // this.shortNameElement.nativeElement.blur();
    // 컬럼 사전 업데이트
    this._updateColumnDictionary({suggestionShortName: this.reShortName.trim()});
  }

  /**
   * 설명 수정 클릭 이벤트
   */
  public onClickUpdateDescription(): void {
    // 설명 자리수 계산
    if (CommonUtil.getByte(this.reDesc.trim()) > 150) {
      // alert
      Alert.warning(this.translateService.instant('msg.metadata.ui.dictionary.create.valid.desc.length'));
      // return
      return;
    }
    // edit flag
    this.descEditFl = false;
    // blur
    // this.descElement.nativeElement.blur();
    // 컬럼 사전 업데이트
    this._updateColumnDictionary({description: this.reDesc.trim()});
  }

  /**
   * 타임포맷 수정 클릭 이벤트
   */
  public onClickUpdateTimeFormat(): void {
    // edit flag
    this.timeFormatEditFl = false;
    // blur
    // this.descElement.nativeElement.blur();
    // 컬럼 사전 업데이트
    this._updateColumnDictionary({
      format: {
        format: this.reTimeFormat.trim(),
        type: FieldFormatType.DATE_TIME,
      },
    });
  }

  /**
   * 메타데이터 이름 클릭 이벤트
   * @param {LinkedMetaDataColumn} metadata
   */
  public onClickMetadataName(metadata: LinkedMetaDataColumn): void {
    this.router.navigate(['management/metadata/metadata', metadata.metadataId]);
  }

  /**
   * 코드 테이블 디테일 클릭 이벤트
   * @param {CodeTable} codeTable
   */
  public onClickCodeTableDetails(codeTable: CodeTable): void {
    // 해당 코드 테이블 상세화면으로 이동
    this.router.navigate(['management/metadata/code-table', codeTable.id]);
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
    this.columnDictionary = new ColumnDictionary();
    // flag 초기화
    this.logicalNameEditFl = false;
    this.columnNameEditFl = false;
    this.shortNameEditFl = false;
    this.descEditFl = false;
    // 타입 리스트 (기타(default), 시간, 위도, 경도, 전화번호, 우편번호)
    this.logicalTypeList = this.getMetaDataLogicalTypeList();
    // 연결된 메타데이터 컬럼 목록 초기화
    this.linkedMetadataList = [];
  }

  /**
   * 컬럼 사전 업데이트
   * @param {Object} params
   * @private
   */
  private _updateColumnDictionary(params?: object): void {
    // 로딩 show
    this.loadingShow();
    // 컬럼 사전 업데이트
    this._columnDictionaryService.updateColumnDictionary(this._columnDictionaryId,
      params || this._getUpdateColumnDictionaryParams()).then((result) => {
      // alert
      Alert.success(this.translateService.instant('msg.comm.alert.confirm.success'));
      // 재조회
      this._getDetailColumnDictionary();
    }).catch(error => this.commonExceptionHandler(error));
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컬럼 사전 상세정보 조회
   * @private
   */
  private _getDetailColumnDictionary(): void {
    // 로딩 show
    this.loadingShow();
    // 컬럼 사전 상세조회
    this._columnDictionaryService.getColumnDictionaryDetail(this._columnDictionaryId).then((result) => {
      // 상세정보
      this.columnDictionary = result;
      // 설명이 존재한다면 enter가 있는지
      this.columnDictionary.description &&
      (this.description = this.columnDictionary.description.replace(/\r\n|\n/gi, '<br>'));
      // 현재 컬럼 사전에 연결된 메타데이터 목록 조회
      this._getMetadataInColumnDictionary();
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 컬럼 사전에 연결된 코드 테이블 조회
   * @private
   */
  private _getCodeTableInColumnDictionary(): void {
    // 로딩 show
    this.loadingShow();
    // 코드 테이블 조회
    this._columnDictionaryService.getCodeTableInColumnDictionary(this._columnDictionaryId)
      .then((result) => {
      // 코드테이블
      this.columnDictionary.codeTable = result;
      // 로딩 hide
      this.loadingHide();
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 메타데이터 목록 조회
   * @private
   */
  private _getMetadataInColumnDictionary(): void {
    // 로딩 show
    this.loadingShow();
    // 메타데이터 조회
    this._columnDictionaryService.getMetadataInColumnDictionary(this._columnDictionaryId,
      {sort: 'metadataName,asc', size: 15, page: 0}).then((result) => {
      // 메타데이터 목록 저장
      this.linkedMetadataList = result['_embedded'] ? result['_embedded'].metacolumns : [];
      // 목록 수
      this.linkedMetadataTotalCount = result['page'].totalElements;
      // 코드 테이블이 있다면 코드테이블 조회
      this.columnDictionary.linkCodeTable ? this._getCodeTableInColumnDictionary() : this.loadingHide();
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * 컬럼 사전 업데이트시 사용되는 파라메터
   * @returns {Object}
   * @private
   */
  private _getUpdateColumnDictionaryParams(): object {
    const params = {};
    return params;
  }

}
