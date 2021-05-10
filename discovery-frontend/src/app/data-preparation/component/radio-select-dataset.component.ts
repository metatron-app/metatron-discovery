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

import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {PrDataset} from '@domain/data-preparation/pr-dataset';
import {Page, PageResult} from '@domain/common/page';
import {PreparationCommonUtil} from '../util/preparation-common.util';

@Component({
  selector: 'radio-select-dataset',
  templateUrl: './radio-select-dataset.component.html'
})
export class RadioSelectDatasetComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  @Output() // 데이터셋 하나 클릭해서 프리뷰 볼 때
  public datasetSelectEvent = new EventEmitter();

  @Output()
  public sortEvent = new EventEmitter();

  @Output()
  public getMoreDatasetEvent = new EventEmitter();

  @Input() // 선택된 데이터셋 아이디
  public selectedDatasetId: string = '';

  @Input() // 리스트에 보일 데이터셋 리스트 ( imported only )
  public importedDatasets: PrDataset[] = [];

  @Input()
  public pageResult: PageResult;

  @Input()
  public page: Page;

  public swappingDatasetId: string;

  // 정렬
  public selectedContentSort: Order = new Order();

  public prepCommonUtil = PreparationCommonUtil;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public - Input Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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

  // Init
  public ngOnInit() {
    super.ngOnInit();
    this._initViewPage();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 정렬 정보 변경
   * @param {string} column
   */
  public changeOrder(column: string) {

    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== column ? 'default' : this.selectedContentSort.sort;
    // 정렬 정보 저장
    this.selectedContentSort.key = column;

    if (this.selectedContentSort.key === column) {
      // asc, desc, default
      switch (this.selectedContentSort.sort) {
        case 'asc':
          this.selectedContentSort.sort = 'desc';
          break;
        case 'desc':
          this.selectedContentSort.sort = 'asc';
          break;
        case 'default':
          this.selectedContentSort.sort = 'desc';
          break;
      }
    }

    // 페이지 초기화
    this.page.page = 0;

    this.page.sort = column + ',' + this.selectedContentSort.sort;

    this.sortEvent.emit(this.page);
  } // function - changeOrder


  /**
   * 데이터 셋 선택
   * @param dataset
   */
  public selectDataset(dataset: any) {

    // 지금 보고있는 데이터면 show 해제
    if (dataset.dsId === this.selectedDatasetId) {
      this.selectedDatasetId = '';
    } else {
      // 데이터 아이디 저장
      this.selectedDatasetId = dataset.dsId;
    }

    this.datasetSelectEvent.emit(this.selectedDatasetId);

  } // function - selectDataset


  /**
   * 더보기 버튼 클릭
   */
  public getMoreList() {
    // 더 보여줄 데이터가 있다면
    if (this.page.page < this.pageResult.totalPages) {
      // 데이터셋 조회
      this.getMoreDatasetEvent.emit();
    }
  } // function - getMoreList


  /**
   * 체크박스 선택
   */
  public check(event, item) {
    event.stopPropagation();
    this.swappingDatasetId = item.dsId;
  } // function - check


  public getSelectedDataset(): string {

    return this.swappingDatasetId;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Init
   * @private
   */
  private _initViewPage() {

    this.swappingDatasetId = this.selectedDatasetId;
  } // function - initViewPage


}

class Order {
  key: string = 'seq';
  sort: string = 'default';
}
