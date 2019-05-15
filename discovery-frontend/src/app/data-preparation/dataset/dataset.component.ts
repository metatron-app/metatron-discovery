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

import {Component, ElementRef, HostListener, Injector, OnInit, ViewChild} from '@angular/core';
import {DatasetService} from './service/dataset.service';
import {AbstractComponent} from '../../common/component/abstract.component';
import {DsType, ImportType, PrDataset} from '../../domain/data-preparation/pr-dataset';
import {SubscribeArg} from '../../common/domain/subscribe-arg';
import {PopupService} from '../../common/service/popup.service';
import {Subscription} from 'rxjs/Subscription';
import {Modal} from '../../common/domain/modal';
import {DeleteModalComponent} from '../../common/component/modal/delete/delete.component';
import {Alert} from '../../common/util/alert.util';
import {PreparationAlert} from '../util/preparation-alert.util';
import {ActivatedRoute} from '@angular/router';
import {DataflowService} from '../dataflow/service/dataflow.service';
import {MomentDatePipe} from '../../common/pipe/moment.date.pipe';
import {PreparationCommonUtil} from "../util/preparation-common.util";
import {isNullOrUndefined} from "util";
import {Page} from "../../domain/common/page";
import {StringUtil} from "../../common/util/string.util";
import * as _ from 'lodash';

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

  // 검색 파라메터
  private _searchParams: { [key: string]: string };
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public searchText: string = '';

  // popup status
  public step: string;

  // dataset list
  public datasets: PrDataset[];

  public selectedDeletedsId: string;

  public selectedItem : PrDataset;

  public selectedContentSort: Order = new Order();

  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  public datasetTypes : TypeStruct[];

  public ImportType = ImportType;

  public prepCommonUtil = PreparationCommonUtil;

  public DsType = DsType; // [IMPORTED, WRANGLED]

  public selectedTypes : TypeStruct[];

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

    this._initView();

    // After creating dataset
    this.popupSubscription = this.popupService.view$.subscribe((data: SubscribeArg) => {
      this.step = data.name;
      if (this.step === 'complete-dataset-create') {
        this.page = new Page();
        this.getDatasets();
      }
    });

    this.subscriptions.push(
      // Get query param from url
      this.activatedRoute.queryParams.subscribe((params) => {

        if (!_.isEmpty(params)) {

          if (!isNullOrUndefined(params['size'])) {
            this.page.size = params['size'];
          }

          if (!isNullOrUndefined(params['page'])) {
            this.page.page = params['page'];
          }

          if (!isNullOrUndefined(params['dsName'])) {
            this.searchText = params['dsName'];
          }

          this.selectedTypes = [];
          if (params['dsType'] === '') {
            this.datasetTypes.forEach((item) => {
              item.checked = false;
            });
          } else if (params['dsType'].indexOf(',') > -1) {
            this.datasetTypes.forEach((item) => {
              item.checked = true;
              this.selectedTypes.push(item);
            });
          } else {
            this.datasetTypes.forEach((item) => {
              if (item.value.toString() === params['dsType']) {
                item.checked = true;
                this.selectedTypes.push(item);
              }
            });
          }

          const sort = params['sort'];
          if (!isNullOrUndefined(sort)) {
            const sortInfo = decodeURIComponent(sort).split(',');
            this.selectedContentSort.key = sortInfo[0];
            this.selectedContentSort.sort = sortInfo[1];
          }
        }

        this.getDatasets();
      })
    )
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Get dataset list
   */
  public getDatasets() {

    this.loadingShow();

    this.datasets = [];

    const params = this._getDsParams();

    this.datasetService.getDatasets(params)
      .then((data) => {

        this._searchParams = params;

        this.pageResult = data['page'];

        this.datasets = data['_embedded'] ? this.datasets.concat(data['_embedded'].preparationdatasets) : [];

        this.loadingHide();

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
      this.reloadPage();
    }

  }

  /** changing status
   * @param status (All, imported, wrangled)
   * */
  public changeStatus(status) {

    event.stopImmediatePropagation();

    status.checked = !status.checked;

    -1 === _.findIndex(this.selectedTypes, {name: status.name}) ?
      this._addSelectedItem(status) : this._deleteSelectedItem(status);

    this.reloadPage();

  }

  /**
   * Add selected item
   * @param val
   * @private
   */
  private _addSelectedItem(val) {
    this.selectedTypes.push(val);
  }

  /**
   * Delete selected item
   * @param val
   * @private
   */
  private _deleteSelectedItem(val) {
    const index = _.findIndex(this.selectedTypes, {name: val.name});
    if (-1 !== index) {
      this.selectedTypes.splice(index,1);
    }
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
    this.reloadPage();
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
        if (this.page.page > 0 && this.datasets.length === 1) {
          this.page.page = this.page.page - 1;
        }
        this.reloadPage(false);
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
    this.router.navigate(['/management/datapreparation/dataset', selectedItem.dsId]).then();
  }

  /** 정렬
   * @param key 소팅할 선택된 컬럼
   * */
  public changeOrder(key: string) {

    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== key ? 'default' : this.selectedContentSort.sort;
    // 정렬 정보 저장
    this.selectedContentSort.key = key;

    if (this.selectedContentSort.key === key) {
      // asc, desc
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

    // 데이터셋 리스트 조회
    this.reloadPage();

  }

  /**
   * 페이지 변경
   * @param data
   */
  public changePage(data: { page: number, size: number }) {
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;
      // 워크스페이스 조회
      this.reloadPage(false);
    }
  } // function - changePage

  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this._getDsParams();
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * @param event Event
   */
  @HostListener('document:keydown.enter', ['$event'])
  private _onEnterKeydownHandler(event: KeyboardEvent) {
    if(event.keyCode === 13  && this.deleteModalComponent.isShow) {
      this.deleteModalComponent.done();
    }
  }

  /**
   * Returns parameter for dataset list
   * @private
   */
  private _getDsParams(): any{

    const params = {
      page: this.page.page,
      size: this.page.size,
      pseudoParam : (new Date()).getTime()
    };

    if (!isNullOrUndefined(this.searchText) || StringUtil.isNotEmpty(this.searchText)) {
      params['dsName'] = this.searchText;
    }

    params['dsType'] = '';
    if (this.selectedTypes.length !== 0) {
      const list = this.selectedTypes.map((item) =>{
        return item.value;
      });
      params['dsType'] = list.toString();
    }

    this.selectedContentSort.sort !== 'default' && (params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort);

    return params;
  }


  /**
   * Initialise values
   * @private
   */
  private _initView() {

    this.datasetTypes = [
      {name : 'IMPORTED', value : DsType.IMPORTED, checked : true, class : 'ddp-imported' },
      {name : 'WRANGLED', value : DsType.WRANGLED, checked : false, class : 'ddp-wargled' }
    ];

    this.selectedTypes = [];

    // Default = imported dataset
    this.selectedTypes.push(this.datasetTypes[0]);

    this.searchText = '';
    this.selectedContentSort.sort = 'desc';
    this.selectedContentSort.key = 'createdTime';
  }


}

class Order {
  key: string = 'createdTime';
  sort: string = 'default';
}

class TypeStruct {
  name: string;
  value: DsType;
  checked: boolean;
  class: string
}
