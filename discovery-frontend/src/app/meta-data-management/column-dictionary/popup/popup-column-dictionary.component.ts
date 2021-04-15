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

import {AbstractComponent} from '@common/component/abstract.component';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {ColumnDictionaryService} from '../service/column-dictionary.service';
import {ColumnDictionary} from '@domain/meta-data-management/column-dictionary';
import {LinkedMetaDataColumn} from '@domain/meta-data-management/metadata-column';
import {StringUtil} from '@common/util/string.util';
import * as _ from 'lodash';
import {Modal} from '@common/domain/modal';
import {CommonUtil} from '@common/util/common.util';

@Component({
  selector: 'popup-column-dictionary',
  templateUrl: './popup-column-dictionary.component.html',
})
export class PopupColumnDictionaryComponent extends AbstractComponent implements OnInit, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 메타트론 기본 타입 리스트
  private _logicalTypeList: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 컬럼 사전 아이디
  @Input()
  public columnDictionaryId: string;

  @Output()
  public closeEvent:EventEmitter<any> = new EventEmitter();

  // 컬럼 사전 상세정보
  public columnDictionary: ColumnDictionary;
  // 연결된 메타데이터 목록
  public linkedMetadataList: LinkedMetaDataColumn[] = [];
  // 연결된 메타데이터 목록 수
  public linkedMetadataTotalCount: number = 0;
  public description:string;

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
  public ngOnInit() {
    super.ngOnInit();
    $( '.ddp-layout-contents' ).css( 'z-index', 127 );
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
    // ui init
    this._initView();
    // 현재 컬럼 사전 상세조회
    this._getDetailColumnDictionary();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    $( '.ddp-layout-contents' ).css( 'z-index', '' );
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public onClose() {
    this.closeEvent.emit();
  }

  /**
   * 컬럼 사전 상세 페이지로 이동
   */
  public gotoColDicDetail(): void {
    event.stopImmediatePropagation();

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.storage.alert.metadata.column.code.table.detail.modal.name');
    modal.description = this.translateService.instant('msg.storage.alert.metadata.column.code.table.detail.modal.description');
    modal.btnName = this.translateService.instant('msg.storage.alert.metadata.column.code.table.detail.modal.btn');
    modal.isShowCancel = true;
    modal.data = { id: this.columnDictionaryId };
    modal.afterConfirm = () => {
      this.router.navigate(['management/metadata/column-dictionary', this.columnDictionaryId]);
    };
    CommonUtil.confirm(modal);
  } // func - gotoCodeTableDetail

  public isEmptyDictionaryFormat(): boolean {
    return _.isNil(this.columnDictionary.format) || StringUtil.isEmpty(this.columnDictionary.format.format);
  }

  /**
   * 메타트론 기본 타입 label 얻기
   * @returns {string}
   */
  public getLogicalTypeLabel(): string {
    const index = _.findIndex(this._logicalTypeList, (item) => {
      return item['value'] === this.columnDictionary.logicalType;
    });
    return index === -1 ? this._logicalTypeList[0].label : this._logicalTypeList[index].label;
  }

  /**
   * 연결된 메타데이터 목록
   * @returns {LinkedMetaDataColumn[]}
   */
  public getLinkedMetaDataColumn(): LinkedMetaDataColumn[] {
    return this.linkedMetadataList.slice(0, 3);
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
    // 타입 리스트 (기타(default), 시간, 위도, 경도, 전화번호, 우편번호)
    this._logicalTypeList = this.getMetaDataLogicalTypeList();
    // 연결된 메타데이터 컬럼 목록 초기화
    this.linkedMetadataList = [];
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
    this._columnDictionaryService.getColumnDictionaryDetail(this.columnDictionaryId).then((result) => {
      // 상세정보
      this.columnDictionary = result;
      this.description = result.description.replace(/\r\n|\n/gi, '<br>');
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
    this._columnDictionaryService.getCodeTableInColumnDictionary(this.columnDictionaryId)
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
    this._columnDictionaryService.getMetadataInColumnDictionary(this.columnDictionaryId,
      {sort: 'metadataName,asc', size: 15, page: 0}).then((result) => {
      // 메타데이터 목록 저장
      this.linkedMetadataList = result['_embedded'] ? result['_embedded'].metacolumns : [];
      // 목록 수
      this.linkedMetadataTotalCount = result['page'].totalElements;
      // 코드 테이블이 있다면 코드테이블 조회
      this.columnDictionary.linkCodeTable ? this._getCodeTableInColumnDictionary() : this.loadingHide();
    }).catch(error => this.commonExceptionHandler(error));
  }

}
