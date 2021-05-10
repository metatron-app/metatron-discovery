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

import {Component, ElementRef, HostListener, Injector, OnDestroy, OnInit} from '@angular/core';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {PopupService} from '@common/service/popup.service';
import {LineageService} from '../service/lineage.service';
import {LineageEdge} from '@domain/meta-data-management/lineage';

@Component({
  selector: 'edit-lineage-popup',
  templateUrl: './edit-lineage-popup.component.html',
})
export class EditLineagePopupComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public isShow: boolean = false;

  public lineageList: LineageEdge[];

  public searchText: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(protected popupService: PopupService,
              private _lineageService: LineageService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit()
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Close popup with esc button
   * @param event Event
   * @private
   */
  @HostListener('document:keydown.escape', ['$event'])
  public onKeydownHandler(event: KeyboardEvent) {
    if (this.isShow && event.keyCode === 27) {
      this.close();
    }
  }

  /**
   * Initial
   * @param {null} data
   */
  public init(data: { name: string }) {
    data.name;
    this._initView();
    this.isShow = true;
  }

  public _initView(): void {
    // 리스트 초기화
    this.lineageList = [];
    this.page.size = 10;

    this._getLineageList();
  }

  /**
   * Close this popup
   */
  public close() {
    super.close();
    this.isShow = false;
  }

  public isEmptyList(): boolean {
    return this.lineageList.length === 0;
  }

  /**
   * 리니지 상세정보 클릭 이벤트
   * @param {string} lineageId
   */
  public onClickDetailLineage(lineageId: string): void {
    // 상세화면으로 이동
    this.router.navigate(['management/metadata/lineage', lineageId]).then();
  }

  /**
   * 코드 테이블 리스트 조회
   * @private
   */
  private _getLineageList(): void {

    this.loadingShow();

    const params = this._getLineageListParams();

    this.lineageList = [];

    this._lineageService.getLineageList(params).then((result) => {

      // 현재 페이지에 아이템이 없다면 전 페이지를 불러온다.
      if (this.page.page > 0 &&
        this.isNullOrUndefined(result['_embedded']) ||
        (!this.isNullOrUndefined(result['_embedded']) && result['_embedded'].lineageedges.length === 0)) {
        this.page.page = result.page.number - 1;
        this._getLineageList();
      }

      this.pageResult = result.page;

      this.lineageList = result['_embedded'] ? this.lineageList.concat(result['_embedded'].lineageedges) : [];

      this.loadingHide();

    }).catch((error) => {

      this.loadingHide();

      this.commonExceptionHandler(error);

    });
  }

  /**
   * 코드 테이블 목록 조회 파라메터
   * @returns {Object}
   * @private
   */
  private _getLineageListParams(): any {
    const params = {
      size: this.page.size,
      page: this.page.page
    };

    if (!this.isNullOrUndefined(this.searchText) && this.searchText.trim() !== '') {
      params['nameContains'] = this.searchText.trim();
    }

    return params;
  }
}
