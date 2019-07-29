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

import {ConfirmModalComponent} from "../../../common/component/modal/confirm/confirm.component";

declare let moment : any;
import * as _ from 'lodash';
import {isUndefined} from 'util';
import {isNullOrUndefined} from "util";
import {Alert} from '../../../common/util/alert.util';

import {
Component,
ElementRef,
EventEmitter,
HostListener,
Injector, Input,
OnDestroy,
OnInit,
Output,
ViewChild
} from '@angular/core';
import {AbstractPopupComponent} from '../../../common/component/abstract-popup.component';
import {PopupService} from '../../../common/service/popup.service';
import {Modal} from "../../../common/domain/modal";
import {LineageService} from '../service/lineage.service';
import {Lineage} from '../../../domain/meta-data-management/lineage';

@Component({
  selector: 'edit-lineage-popup',
  templateUrl: './edit-lineage-popup.component.html',
})
export class EditLineagePopup extends AbstractPopupComponent implements OnInit,OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private _searchParams: { [key: string]: string };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public isShow : boolean = false;

  public lineageList: Lineage[];

  public searchText: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor( protected popupService: PopupService,
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
   * Initial
   * @param {null} data
   */
  public init(data : {name: string}) {
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

  /**
   * Close popup with esc button
   * @param event Event
   * @private
   */
  @HostListener('document:keydown.escape', ['$event'])
  private _onKeydownHandler(event: KeyboardEvent) {
    if (this.isShow && event.keyCode === 27 ) {
      this.close();
    }
  }

  public isEmptyList(): boolean {
    return this.lineageList.length === 0;
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
        isNullOrUndefined(result['_embedded']) ||
        (!isNullOrUndefined(result['_embedded']) && result['_embedded'].lineageedges.length === 0))
      {
        this.page.page = result.page.number - 1;
        this._getLineageList();
      }

      this._searchParams = params;

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

    if (!isNullOrUndefined(this.searchText) && this.searchText.trim() !== '') {
      params['nameContains'] = this.searchText.trim();
    }

    return params;
  }
}
