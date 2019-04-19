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

import { Component, ElementRef, HostListener, Injector, OnInit, ViewChild } from '@angular/core';
import { DatasetService } from './service/dataset.service';
import { AbstractComponent } from '../../common/component/abstract.component';
import { PrDataset, DsType, ImportType } from '../../domain/data-preparation/pr-dataset';
import { SubscribeArg } from '../../common/domain/subscribe-arg';
import { PopupService } from '../../common/service/popup.service';
import { Subscription } from 'rxjs/Subscription';
import { Modal } from '../../common/domain/modal';
import { DeleteModalComponent } from '../../common/component/modal/delete/delete.component';
import { Alert } from '../../common/util/alert.util';
import { PreparationAlert } from '../util/preparation-alert.util';
import { ActivatedRoute } from '@angular/router';
import { DataflowService } from '../dataflow/service/dataflow.service';
import { MomentDatePipe } from '../../common/pipe/moment.date.pipe';
import {PreparationCommonUtil} from "../util/preparation-common.util";

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  providers: [MomentDatePipe]
})
export class DatasetComponent extends AbstractComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private popupSubscription: Subscription;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public searchText: string = '';
  public dsType : DsType | string  = DsType.IMPORTED ;

  // popup status
  public step: string;

  // dataset list
  public datasets: PrDataset[] = [];

  public selectedDeletedsId: string;

  public selectedItem : PrDataset;

  public selectedContentSort: Order = new Order();

  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  public datasetTypes : any;

  public ImportType = ImportType;

  public prepCommonUtil = PreparationCommonUtil;

  public datasetType = DsType; // [IMPORTED, WRANGLED]

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(private datasetService: DatasetService,
              private dataflowService: DataflowService,
              private activatedRoute: ActivatedRoute,
              private popupService: PopupService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // 뷰
    this._initViewPage();

    this.popupSubscription = this.popupService.view$.subscribe((data: SubscribeArg) => {

      this.step = data.name;
      if (this.step === 'complete-dataset-create') {
        this.page.page = 0;
        this.getDatasets();
      }
    });

    // 데이터플로우에서 데이터셋 생성으로 넘어왔을 때
    if (sessionStorage.getItem('DATAFLOW_ID')) {
      this.createDataSet();
    }

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Get dataset list
   */
  public getDatasets() {

    this.loadingShow();

    let params = {
      searchText : this.searchText,
      page : this.page,
      dsType : this.dsType
    };

    this.datasetService.getDatasets(params)
      .then((data) => {
        this.loadingHide();
        this.pageResult = data['page'];
        const sorting = this.page.sort.split(',');
        this.selectedContentSort.key = sorting[0];
        this.selectedContentSort.sort = sorting[1];

        if (this.page.page === 0) {
          this.datasets = [];
        }

        this.datasets = this.datasets.concat(data['_embedded'].preparationdatasets);
        this.page.page += 1;

      })
      .catch((error) => {
          this.loadingHide();
          let prep_error = this.dataprepExceptionHandler(error);
          PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  }

  /** 데이터셋 검색
   * @param event
   * */
  public searchDataset(event : any) {

    if (13 === event.keyCode || 27 === event.keyCode) {
      event.keyCode === 27 ? this.searchText = '' : null;
      this.page.page = 0;
      this.getDatasets();
    }

  }

  /** changing status
   * @param status (All, imported, wrangled)
   * */
  public changeStatus(status) {

    status.checked = !status.checked;
    this.datasets = [];
    this.page.page = 0;

    // this.datasetTypes 를 돌면서 전체선택 / 전체 해제 / 하나만인지 확인
    let items = this.datasetTypes.filter((item) => {
      return item.checked;
    });

    if (items.length === 1) {
      this.dsType = items[0].value;
    } else {
      this.dsType = '';
    }

    this.getDatasets();

  }

  /** 데이터 셋 생성 */
  public createDataSet() {
    this.step = 'select-datatype';
  }

  /** 데이터셋 지우기 확인
   * @param event
   * @param dataset 삭제할 데이터셋
   * */
  public confirmDelete(event : any, dataset : PrDataset) {

    event.stopPropagation();
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.comm.ui.del.description');
    modal.description = this.translateService.instant('msg.dp.alert.ds.del.description');
    modal.btnName = this.translateService.instant('msg.comm.btn.modal.done');

    this.selectedDeletedsId = dataset.dsId;
    this.deleteModalComponent.init(modal);

  }

  /**
   *  검색어 삭제 시
   *  */
  public clearSearch() {
    this.searchText = '';
    this.page.page = 0;
    this.getDatasets();
  }

  /**
   * 데이터 셋 지우기
   * */
  public deleteDataset() {

    this.loadingShow();
    this.datasetService.deleteChainDataset(this.selectedDeletedsId).then((result) => {
      if (result.hasOwnProperty('errorMsg')) {
        Alert.error(result.errorMsg);
        this.loadingHide();
      } else {
        Alert.success(this.translateService.instant('msg.dp.alert.del.success'));
        this.loadingHide();
        let idx = this.datasets.findIndex((result) => {
          return result.dsId === this.selectedDeletedsId;
        });
        this.datasets.splice(idx,1);
        this.pageResult.totalElements = this.pageResult.totalElements-1
      }
    }).catch((error) => {
      this.loadingHide();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });
  }


  /** row click (상세화면)
   * @param selectedItem 선택된 데이터셋
   * */
  public itemRowClick(selectedItem: PrDataset) {
    this.router.navigate(['/management/datapreparation/dataset', selectedItem.dsId]);
  }

  /** 정렬
   * @param column 소팅할 선택된 컬럼
   * */
  public changeOrder(column: string) {

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

    // 데이터셋 리스트 조회
    this.getDatasets();

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   *  View 초기화
   */
  private _initViewPage() {

    this.datasetTypes = [
      {name : 'IMPORTED', value : DsType.IMPORTED, checked : true, class : 'ddp-imported' },
      {name : 'WRANGLED', value : DsType.WRANGLED, checked : false, class : 'ddp-wargled' }
    ];
    this.page.sort = 'createdTime,desc';
    this.getDatasets();
  }

  /**
   * @param event Event
   */
  @HostListener('document:keydown.enter', ['$event'])
  private _onEnterKeydownHandler(event: KeyboardEvent) {
    if(event.keyCode === 13  && this.deleteModalComponent.isShow) {
      this.deleteModalComponent.done();
    }
  }

}

class Order {
  key: string = 'createdTime';
  sort: string = 'default';
}
