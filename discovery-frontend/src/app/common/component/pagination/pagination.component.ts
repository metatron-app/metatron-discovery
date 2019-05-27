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
  Component, ElementRef, EventEmitter,
  Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange, SimpleChanges
} from '@angular/core';
import {AbstractComponent} from '../abstract.component';
import {PageResult} from "../../../domain/common/page";

@Component({
  selector: 'component-pagination',
  templateUrl: './pagination.component.html'
})
export class PaginationComponent extends AbstractComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _navigationSize: number = 10;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public range: number[] = [];

  public pageSizes = [20, 40, 60, 80, 100];
  public isOpenOpts = false;

  @Input()
  public info: PageResult;

  @Output()
  public changePageData: EventEmitter<{ page: number, size: number }> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기화
   */
  public ngOnInit() {
    super.ngOnInit();
  } // function - ngOnInit

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const infoChanges: SimpleChange = changes.info;
    if (infoChanges && infoChanges.currentValue) {
      let startPage = (Math.floor(this.info.number / this._navigationSize) * this._navigationSize);
      this._setRange(startPage);
    }
  } // function - ngOnChanges

  /**
   * 컴포넌트 종료
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 페이지 변경
   * @param {number} page
   */
  public changePage(page: number) {
    if (this.info.number !== page) {
      this.changePageData.emit({page: page, size: this.info.size});
    }
  } // function - changePage

  /**
   * 페이지 사이즈 변경
   * @param {number} size
   */
  public changePageSize(size: number) {
    if (this.info.size !== size) {
      this.info.number = 0;
      this.changePageData.emit({page: this.info.number, size: size});
    }
  } // function - changePageSize

  /**
   * 이전 범위 페이지 네비게이션
   */
  public prevPagination() {
    let startPage = this.range[0] - this._navigationSize;
    this._setRange(startPage);
  } // function - prevPagination

  /**
   * 다음 범위 페이지 네비게이션
   */
  public nextPagination() {
    let startPage = this.range[0] + this._navigationSize;
    (this.info.totalPages <= startPage) && (startPage = this.range[0]);
    this._setRange(startPage);
  } // function - nextPagination


  public openChangePageComboBox() {
    if (this.info.totalElements <= this.info.size) {
      return;
    }

    this.isOpenOpts = !this.isOpenOpts;
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 범위 설정
   * @private
   */
  private _setRange(startPage: number) {
    (0 > startPage) && (startPage = 0);
    let endPage = startPage + this._navigationSize - 1;
    (this.info.totalPages - 1 < endPage) && (endPage = this.info.totalPages - 1);

    this.range = [];
    for (let idx = startPage; idx <= endPage; idx++) {
      this.range.push(idx);
    }
  } // function - _setRange

}
