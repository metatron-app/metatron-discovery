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
import {CommonUtil} from '@common/util/common.util';
import {Modal} from '@common/domain/modal';
import {AbstractComponent} from '@common/component/abstract.component';
import {CodeTable} from '@domain/meta-data-management/code-table';
import {CodeValuePair} from '@domain/meta-data-management/code-value-pair';
import {ColumnDictionary} from '@domain/meta-data-management/column-dictionary';
import {CodeTableService} from '../service/code-table.service';

@Component({
  selector: 'popup-code-table',
  templateUrl: './popup-code-table.component.html',
})
export class PopupCodeTableComponent extends AbstractComponent implements OnInit, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 코드 테이블 아이디

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input()
  public codeTableId: string;

  @Output()
  public closeEvent: EventEmitter<any> = new EventEmitter();

  // 코드 테이블 상세정보
  public codeTable: CodeTable;
  // 코드 목록
  public codeList: CodeValuePair[] = [];
  // 연결된 컬럼 사전 목록
  public linkedDictionaryList: ColumnDictionary[] = [];
  // 연결된 컬럼사전 목록 수
  public linkedDictionaryTotalCount: number = 0;

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
  public ngOnInit() {
    super.ngOnInit();
    $('.ddp-layout-contents').css('z-index', 127);
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
    // ui init
    this._initView();
    // 현재 코드테이블 상세조회
    this._getDetailCodeTable();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    $('.ddp-layout-contents').css('z-index', '');
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public onClose() {
    this.closeEvent.emit();
  }

  /**
   * 연결된 컬럼 사전 목록
   * @returns {ColumnDictionary[]}
   */
  public getLinkedColumnDictionaryList(): ColumnDictionary[] {
    return this.linkedDictionaryList.slice(0, 3);
  }

  /**
   * 코드 테이블 상세 페이지로 이동
   */
  public gotoCodeTableDetail(): void {
    event.stopImmediatePropagation();

    // notice i navigate from column dictionary page
    this._codeTableService.fromColumnDictionary = true;

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.storage.alert.metadata.column.code.table.detail.modal.name');
    modal.description = this.translateService.instant('msg.storage.alert.metadata.column.code.table.detail.modal.description');
    modal.btnName = this.translateService.instant('msg.storage.alert.metadata.column.code.table.detail.modal.btn');
    modal.isShowCancel = true;
    modal.data = {id: this.codeTableId};
    modal.afterConfirm = () => {
      this.router.navigate(['management/metadata/code-table', this.codeTableId]);
    };
    CommonUtil.confirm(modal);
  } // func - gotoCodeTableDetail

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
    // 코드 테이블 목록 초기화
    this.codeList = [];
    // 연결된 컬럼 사전 목록 초기화
    this.linkedDictionaryList = [];
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
    this._codeTableService.getCodeTableDetail(this.codeTableId).then((result) => {
      // 코드 테이블 상세조회 데이터
      this.codeTable = result;
      // 연결된 코드 리스트
      this.codeList = result['codes'];
      // 연결된 컬럼 사전 목록 조회
      this._getColumnDictionaryList();
    }).catch(() => {
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
    this._codeTableService.getColumnDictionaryInCodeTable(this.codeTableId, {
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
    }).catch(() => {
      // 로딩 hide
      this.loadingHide();
    });
  }

}
