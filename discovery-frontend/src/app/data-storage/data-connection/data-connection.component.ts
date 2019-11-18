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

import {Component, ElementRef, Injector, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {Dataconnection, ImplementorType} from '../../domain/dataconnection/dataconnection';
import {DataconnectionService} from '../../dataconnection/service/dataconnection.service';
import {DeleteModalComponent} from '../../common/component/modal/delete/delete.component';
import {Modal} from '../../common/domain/modal';
import {MomentDatePipe} from '../../common/pipe/moment.date.pipe';
import {StringUtil} from '../../common/util/string.util';
import {CreateConnectionComponent} from "./create-connection.component";
import {UpdateConnectionComponent} from "./update-connection.component";
import {CriterionComponent} from "../component/criterion/criterion.component";
import {Criteria} from "../../domain/datasource/criteria";
import {ActivatedRoute} from "@angular/router";
import {Alert} from "../../common/util/alert.util";
import {isNullOrUndefined} from "util";
import * as _ from 'lodash';
import {StorageService} from "../service/storage.service";

@Component({
  selector: 'app-data-connection',
  templateUrl: './data-connection.component.html',
  providers: [MomentDatePipe]

})
export class DataConnectionComponent extends AbstractComponent implements OnInit {

  @ViewChild(CriterionComponent)
  private readonly criterionComponent: CriterionComponent;

  @ViewChild(CreateConnectionComponent)
  private _createConnectionComponent: CreateConnectionComponent;
  @ViewChild(UpdateConnectionComponent)
  private _updateConnectionComponent: UpdateConnectionComponent;

  // 공통 삭제 팝업 모달
  @ViewChild(DeleteModalComponent)
  private deleteModalComponent: DeleteModalComponent;

  // connection list
  public connectionList: Dataconnection[] = [];

  // search
  public searchKeyword: string;

  // selected sort
  public selectedContentSort: Order = new Order();

  // Constructor
  constructor(private dataconnectionService: DataconnectionService,
              private storageService: StorageService,
              private activatedRoute: ActivatedRoute,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // loading show
    this.loadingShow();
    // get criterion list
    this.dataconnectionService.getCriterionListInConnection()
      .then((result: Criteria.Criterion) => {
        // init criterion list
        this.criterionComponent.initCriterionList(result);
        this.subscriptions.push(this.activatedRoute.queryParams.subscribe(params => {
          const paramKeys = Object.keys(params);
          const isExistSearchParams = paramKeys.length > 0;
          const searchParams = {};
          // if exist search param in URL
          if (isExistSearchParams) {
            paramKeys.forEach((key) => {
              // #1539 call by metadata create step
              if (key === 'isCreateMode') {
                this.onClickCreateConnection();
              }
              if (key === 'size') {
                this.page.size = params['size'];
              } else if (key === 'page') {
                this.page.page = params['page'];
              } else if (key === 'sort') {
                const sortParam = params['sort'].split(',');
                this.selectedContentSort.key = sortParam[0];
                this.selectedContentSort.sort = sortParam[1];
              } else if (key === 'containsText') {
                this.searchKeyword = params['containsText'];
              } else {
                searchParams[key] = params[key].split(',');
              }
            });
            // TODO 추후 criterion component로 이동
            delete searchParams['pseudoParam'];
            // init criterion search param
            this.criterionComponent.initSearchParams(searchParams);
          }
          // set connection list
          this._setConnectionList();
        }));
      })
      .catch(reason => this.commonExceptionHandler(reason));
  }

  isEmptyList(): boolean {
    return this.connectionList.length === 0;
  }

  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._getQueryParams(), replaceUrl: true}
    ).then();
  } // function - reloadPage

  /**
   * More connection click event
   */
  public changePage(data: { page: number, size: number }): void {
    // if more datasource list
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;
      this.reloadPage(false);
    }
  }

  /**
   * Remove connection
   * @param {Modal} modalData
   */
  public removeConnection(modalData: Modal): void {
    // loading show
    this.loadingShow();
    // remove connection
    this.dataconnectionService.deleteConnection(modalData.data)
      .then((result) => {
        Alert.success(this.translateService.instant('msg.storage.alert.dsource.del.success'));

        if (this.page.page > 0 && this.connectionList.length === 1) {
          this.page.page -=1;
        }

        // reload
        this.reloadPage(false);
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Sort connection list
   * @param {string} key
   */
  public sortConnectionList(key: string): void {
    // set selected sort
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
      }
    }
    // reload page
    this.reloadPage(true);
  }


  /**
   * Remove connection click event
   * @param {Dataconnection} connection
   */
  public onClickRemoveConnection(connection: Dataconnection): void {
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.storage.ui.dconn.del.title');
    modal.description = this.translateService.instant('msg.storage.ui.dconn.del.description');
    modal.btnName = this.translateService.instant('msg.storage.btn.dconn.del');
    // set connection id
    modal.data = connection.id;
    // 팝업 창 오픈
    this.deleteModalComponent.init(modal);
  }

  /**
   * connection click event
   * @param {Dataconnection} connection
   */
  public onClickConnection(connection: Dataconnection): void {
    this._updateConnectionComponent.init(connection.id);
  }


  /**
   * create connection click event
   */
  public onClickCreateConnection(): void {
    this._createConnectionComponent.init();
  }

  /**
   * Changed filter
   * @param searchParams
   */
  public onChangedFilter(searchParams): void {
    // reload page
    this.reloadPage(true);
  }


  /**
   * Search connection keypress event
   * @param {string} keyword
   */
  public onChangedSearchKeyword(keyword: string): void {
    // set search keyword
    this.searchKeyword = keyword;
    // reload page
    this.reloadPage(true);
  }

  /**
   * Get connection implementor label
   * @param {ConnectionType} implementor
   * @returns {string}
   */
  public getConnectionImplementorLabel(implementor: ImplementorType): string {
    const jdbc = this.storageService.findConnectionType(implementor);
    if (_.isNil(jdbc)) {
      return implementor.toString();
    } else {
      return jdbc.name;
    }
  }

  /**
   * Is default type connection
   * @param {Dataconnection} connection
   * @returns {boolean}
   */
  public isDefaultType(connection: Dataconnection): boolean {
    return StringUtil.isEmpty(connection.url);
  }

  /**
   * Is more connection list
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.page.page < this.pageResult.totalPages - 1);
  }

  /**
   * criterion api function
   * @param criterionKey
   * @returns {Promise<any>}
   */
  public criterionApiFunc(criterionKey: any) {
    // require injector in constructor
    return this.injector.get(DataconnectionService).getCriterionInConnection(criterionKey);
  }

  /**
   * Set datasource list
   * @private
   */
  private _setConnectionList(): void {
    // loading show
    this.loadingShow();
    // get connection list
    this.dataconnectionService.getConnectionList(this.page.page, this.page.size, this.selectedContentSort.key + ',' + this.selectedContentSort.sort, this._getConnectionParams())
      .then((result) => {

        // 현재 페이지에 아이템이 없다면 전 페이지를 불러온다.
        if (this.page.page > 0 &&
          isNullOrUndefined(result['_embedded']) ||
          (!isNullOrUndefined(result['_embedded']) && result['_embedded'].connections.length === 0))
        {
          this.page.page = result.page.number - 1;
          this._setConnectionList();
        }

        // set page result
        this.pageResult = result['page'];
        // set connection list
        this.connectionList = result['_embedded'] ? result['_embedded'].connections : [];
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get search query params
   * @return {{size: number; page: number; sort: string}}
   * @private
   */
  private _getQueryParams() {
    const params = {
      page: this.page.page,
      size: this.page.size,
      pseudoParam : (new Date()).getTime(),
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort
    };
    const searchParams = this.criterionComponent.getUrlQueryParams();
    // set criterion
    searchParams && Object.keys(searchParams).forEach((key) => {
      if (searchParams[key].length > 0) {
        params[key] = searchParams[key].join(',');
      }
    });
    // if search keyword not empty
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      params['containsText'] = this.searchKeyword.trim();
    }
    // remove isCreateMode property
    if (!_.isNil(params['isCreateMode'])) {
      delete params['isCreateMode'];
    }
    return params;
  }

  /**
   * Get connection params
   * @returns {Object}
   * @private
   */
  private _getConnectionParams(): object {
    // params
    const params = this.criterionComponent.getSearchParams();
    // if search keyword not empty
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      params['containsText'] = this.searchKeyword.trim();
    }
    return params;
  }
}

class Order {
  key: string = 'createdTime';
  sort: string = 'desc';
}
