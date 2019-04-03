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

import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractPopupComponent } from '../../../../../../../common/component/abstract-popup.component';
import { PrDataset } from '../../../../../../../domain/data-preparation/pr-dataset';
import { PopupService } from '../../../../../../../common/service/popup.service';
import { DataflowService } from '../../../../../service/dataflow.service';
import { PreparationAlert } from '../../../../../../util/preparation-alert.util';
import * as _ from 'lodash';

@Component({
  selector: 'app-union-add-datasets',
  templateUrl: './union-add-datasets.component.html',
})
export class UnionAddDatasetsComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private readonly DS_TYPE: string = 'WRANGLED';
  private readonly IMPORT_TYPE: string = '';
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public - Input Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input()
  public masterDsId: string;

  @Input()
  public dfId: string;

  @Input()
  public existingDatasets: PrDataset[];

  @Input()
  public editInfo: PrDataset[];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public - Output Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  public complete = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public searchText: string = '';

  public selectedContentSort: Order = new Order();

  public datasets: PrDataset[] = [];        // 화면에 보여지는 데이터셋 리스트

  public selectedItems: PrDataset[] = [];

  public isUpdate: boolean = false; //수정 모드 여부

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(protected popupService: PopupService,
              protected dataflowService: DataflowService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();

    this.initialisePaging();

    // Update if editInfo has value
    this.isUpdate = this.editInfo.length > 0;

    this._getDatasets(true);

  }


  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Initialise paging information
   */
  public initialisePaging() {

    // TODO: no paging ?
    this.page.size = 10000;
    this.page.sort = 'modifiedTime,desc';
  }


  /**
   * 수정 정보 세팅
   */
  public checkEditInfo(list) {
    list.forEach((item) => {
      if (item.dsId !== this.masterDsId) {
        const idx = _.findIndex(this.datasets, {dsId: item.dsId});
        if (-1 !== idx) {
          this.datasets[idx].selected= true;
          this.datasets[idx].origin = false;
          this.selectedItems.push(this.datasets[idx]);
        }
      }
    })
  }


  /**
   * Close popup
   */
  public close() {
    this.complete.emit(null);
  }


  /**
   * When add button is pressed
   */
  public addDatasets() {

    if (this.selectedItems.length === 0) {
      return;
    }
    this.complete.emit(this.selectedItems);

  }


  /**
   * Add selected item
   * @param ds
   * @private
   */
  private _addSelectedItem(ds: PrDataset) {
    this.selectedItems.push(ds);
  }


  /**
   * Delete selected item
   * @param ds
   * @private
   */
  private _deleteSelectedItem(ds: PrDataset) {
    const index = _.findIndex(this.selectedItems, {dsId: ds.dsId});
    if (-1 !== index) {
      this.selectedItems.splice(index,1);
    }
  }


  /**
   * 모든 아이템 선택 해제
   * @private
   */
  private _deleteAllItems(){
    this.datasets.forEach((item) => {
      if (!item.origin && item.selected) {
        item.selected = false;
        this._deleteSelectedItem(item);
      }
    })
  }


  /**
   * 모든 아이템 선택
   * @private
   */
  private _addAllItems() {
    this.datasets.forEach((item) => {
      if (!item.origin) {
        item.selected = true;
        if (-1 === _.findIndex(this.selectedItems, {dsId: item.dsId})) {
          this._addSelectedItem(item);
        }
      }
    })

  }

  /**
   * 체크박스 전체 선택
   */
  public checkAll() {

    this.isAllChecked() ? this._deleteAllItems() : this._addAllItems();

  }


  /**
   * 체크박스 선택
   */
  public check(ds: PrDataset) {

    // 중복 체크 방지
    event.stopImmediatePropagation();

    // Original dataset cannot be checked
    if (ds.origin) {
      return;
    }

    ds.selected = !ds.selected;
    -1 === _.findIndex(this.selectedItems, {dsId: ds.dsId}) ?
      this._addSelectedItem(ds) : this._deleteSelectedItem(ds);

  } // function - check

  /**
   * 전체 체크 박스가 비활성화 인지 확인
   */
  public isCheckAllDisabled(): boolean {
    return this.datasets.filter((item) => {
      return !item.origin
    }).length === 0;
  }

  /**
   * 전체 체크 인지 확인
   */
  public isAllChecked(): boolean {

    if (this.isCheckAllDisabled()) {
      return;
    }

    const listWithNoOrigin = this.datasets.filter((item) => {
      return !item.origin
    });
    if (listWithNoOrigin.length !== 0) {
      for (let index = 0; index < listWithNoOrigin.length; index++) {
        if (_.findIndex(this.selectedItems, {dsId: listWithNoOrigin[index].dsId}) === -1) {
          return false;
        }
      }
      return true;
    } else {
      // 조회된 멤버 목록이 없다면 false
      return false;
    }
  }

  /**
   * Check if add selections btn should be disabled or not
   * @returns {boolean}
   */
  public isAddEnabled() {
    return ( 0 === this.datasets.filter(item => item.origin === false && item.selected).length );
  }


  /**
   * Sort list
   */
  public sortList(column: string) {

    this.page.page = 0;

    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== column ? 'default' : this.selectedContentSort.sort;

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

    this.page.sort = column + ',' + this.selectedContentSort.sort;

    // 데이터소스 리스트 조회
    this._getDatasets();

  }


  /**
   * On key press event
   * @param event
   */
  public onKeyPress(event: any) {

    // Enter key
    if (13 === event.keyCode) {

      this._getDatasets();

      // ESC
    } else if (27 === event.keyCode) {

      // Refresh search text
      this.searchText = '';

    }
  }


  /**
   * Refresh search text
   */
  public refreshSearch() {
    this.searchText = '';
    this._getDatasets();
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Fetch dataset list
   */
  private _getDatasets(isInitial: boolean = false) {

    this.datasets = [];
    this.loadingShow();

    // Fetch dataset list
    this.dataflowService.getDatasets(this.searchText, this.page, 'listing', this.DS_TYPE, this.IMPORT_TYPE).then((data) => {

      // sorting
      const sorting = this.page.sort.split(',');
      this.selectedContentSort.key = sorting[0];
      this.selectedContentSort.sort = sorting[1];

      // if result exists
      if (data['_embedded'] && data['_embedded'].preparationdatasets) {

        // Show only datasets from same dataflow as master dataset
        this.datasets = data['_embedded'].preparationdatasets.filter((item) => {
          return item.creatorDfId === this.dfId;
        });

        // get upstreams
        this._getUpstreams(isInitial);

      } else {
        this.loadingHide();
      }

    }).catch((error) => {
      this.loadingHide();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });
  }


  /**
   * Fetch upstreams
   * @param isInitial 처음 실행인지 ?
   * @private
   */
  private _getUpstreams(isInitial?: boolean) {
    // Fetch upstreams
    this.dataflowService.getUpstreams(this.dfId, this.isUpdate).then((upstreams) => {

      this.loadingHide();
      const upstreamIds = [];

      // it upstream exists
      if (upstreams.length > 0) {

        // returns upstreamDsIds that has same dsId as masterDsId
        upstreams.forEach((item) => {
          if (item.dsId === this.masterDsId)  {
            upstreamIds.push(item.upstreamDsId);
          }
        });
      }

      /*
      How upstream works ?

      masterDsId : 444

      list = [
        {dsId: 111, upstreamDsId: aaa},
        {dsId: 222, upstreamDsId: bbb},
        {dsId: 333, upstreamDsId: ccc},
        {dsId: 444, upstreamDsId: ddd},
        {dsId: ddd, upstreamDsId: fff}
      ]

      list[3]is origin = true (dsId is same as masterDsId)
      list[4]os origin = true (dsId is same as ↑ upstreamDsId)
      */
      this.datasets.forEach((item) => {
        item.origin = (-1 < upstreamIds.indexOf(item.dsId)) || item.dsId === this.masterDsId;

        // set already selected items
        const idx = _.findIndex(this.selectedItems, {dsId: item.dsId});
        item.selected = (-1 < upstreamIds.indexOf(item.dsId)) || item.dsId === this.masterDsId || idx > -1;
      });


      // if initial loading, set existingDatasets
      if (isInitial && this.existingDatasets.length > 0) {
        this.checkEditInfo(this.existingDatasets);
      }

      // If editInfo exists, it's update
      if (isInitial && this.editInfo.length > 0) {

        // 편집일떄 해야하는일
        this.checkEditInfo(this.editInfo);

      }

    }).catch((error) => {
      this.loadingHide();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });

  }

}



class Order {
  key: string = 'createdTime';
  sort: string = 'default';
}
