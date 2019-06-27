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
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {DataflowService} from './service/dataflow.service';
import {PrDataflow} from '../../domain/data-preparation/pr-dataflow';
import {Modal} from '../../common/domain/modal';
import {DeleteModalComponent} from '../../common/component/modal/delete/delete.component';
import {Alert} from '../../common/util/alert.util';
import {MomentDatePipe} from '../../common/pipe/moment.date.pipe';
import {CreateDataflowNameDescComponent} from './create-dataflow-name-desc.component';
import {isNullOrUndefined} from "util";
import {StringUtil} from "../../common/util/string.util";
import {ActivatedRoute} from "@angular/router";
import * as _ from 'lodash';

@Component({
  selector: 'app-dataflow',
  templateUrl: './dataflow.component.html',
  providers: [MomentDatePipe]
})
export class DataflowComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 검색 파라메터
  private _searchParams: { [key: string]: string };
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  @ViewChild(CreateDataflowNameDescComponent)
  public createDataflowComponent : CreateDataflowNameDescComponent;

  public dataflows : PrDataflow[];

  public dfId: string;

  // Selected dataflow that you want to delete
  public selectedDeletedfId: string;

  // search text
  public searchText: string;

  // 정렬
  public selectedContentSort: Order = new Order();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(private dataflowService: DataflowService,
              private activatedRoute: ActivatedRoute,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {

    super.ngOnInit();

    this._initView();

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


          if (!isNullOrUndefined(params['dfName'])) {
            this.searchText = params['dfName'];
          }

          const sort = params['sort'];
          if (!isNullOrUndefined(sort)) {
            const sortInfo = decodeURIComponent(sort).split(',');
            this.selectedContentSort.key = sortInfo[0];
            this.selectedContentSort.sort = sortInfo[1];
          }
        }

        this.getDataflows();
      })
    );

  }

  public ngOnDestroy() {

    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this._getDfParams();
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage



  /**
   * Create new dataflow
   */
  public createDataflow() {
    this.createDataflowComponent.init();
  }


  /**
   * Move to dataflow detail
   * @param dfId
   */
  public goToDfDetail(dfId) {
    this.router.navigate(
      ['/management/datapreparation/dataflow',dfId])
      .then();
  }


  /**
   * Search dataflow
   * @param event
   */
  public searchDataflows(event) {

    if (13 === event.keyCode || 27 === event.keyCode) {
      if (event.keyCode === 27) {
        this.searchText = '';
      }
      this.reloadPage();
    }
  }


  /**
   * Confirm dataflow delete
   * @param event
   * @param id
   */
  public confirmDelete(event,id) {

    event.stopPropagation();

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.comm.ui.del.description');
    modal.description = this.translateService.instant('msg.dp.alert.df.del.description');
    modal.btnName = this.translateService.instant('msg.comm.btn.modal.done');

    this.selectedDeletedfId = id;
    this.deleteModalComponent.init(modal);

  }


  /**
   * Delete dataflow
   */
  public deleteDataflow() {
    this.loadingShow();
    this.dataflowService.deleteDataflow(this.selectedDeletedfId).then(() => {
      Alert.success(this.translateService.instant('msg.dp.alert.del.success'));

      if (this.page.page !== 0 && this.dataflows.length === 1) {
        this.page.page = this.page.page - 1;
      }
      // Get dataflow list again
      this.reloadPage(false);

    }).catch((error) => {
      Alert.error(this.translateService.instant('msg.dp.alert.del.fail'));
      this.loadingHide();
    });

  }


  /**
   * Fetch dataflow list
   */
  public getDataflows() {

    this.loadingShow();

    this.dataflows = [];

    const params = this._getDfParams();

    this.dataflowService.getDataflowList(params).then((data) => {

      // 현재 페이지에 아이템이 없다면 전 페이지를 불러온다
      if (this.page.page > 0 &&
        (isNullOrUndefined(data['_embedded']) ||
          (!isNullOrUndefined(data['_embedded']) && data['_embedded'].preparationdatasets.length === 0)))
      {
        this.page.page = data['page'].number - 1;
        this.getDataflows();
      }

      this._searchParams = params;

      this.pageResult = data['page'];

      this.dataflows = data['_embedded']? this.dataflows.concat(data['_embedded']['preparationdataflows']) : [];

      this.loadingHide();

    }).catch((error) => {

      this.loadingHide();

      if(error.status && error.status===500) {
        Alert.error(error.message);
      } else {
        Alert.warning(error.message);
      }

    });
  }


  /**
   * Change order of list
   * @param key
   */
  public changeOrder(key: string) {

    /// 초기화
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

    // Get dataflow list
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
    } else if (event.keyCode === 13 && this.createDataflowComponent.isShow) {
      this.createDataflowComponent.createDataflow();
    }
  }


  /**
   * Returns parameter for dataflow list
   * @private
   */
  private _getDfParams(): any {
    const params = {
      page: this.page.page,
      size: this.page.size,
      projection: 'forListView',
      pseudoParam : (new Date()).getTime()
    };

    if (!isNullOrUndefined(this.searchText) || StringUtil.isNotEmpty(this.searchText)) {
      params['dfName'] = this.searchText;
    }

    this.selectedContentSort.sort !== 'default' && (params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort);

    return params;
  }


  /**
   * Initialise values
   * @private
   */
  private _initView() {
    this.dataflows = [];
    this.searchText = '';
    this.selectedContentSort.sort = 'desc';
    this.selectedContentSort.key = 'createdTime';
  }
}

class Order {
  key: string = 'createdTime';
  sort: string = 'default';
}
