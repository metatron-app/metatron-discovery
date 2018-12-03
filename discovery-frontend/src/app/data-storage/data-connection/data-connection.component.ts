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

import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { AbstractComponent } from '../../common/component/abstract.component';
import { ConnectionType, Dataconnection } from '../../domain/dataconnection/dataconnection';
import { DataconnectionService } from '../../dataconnection/service/dataconnection.service';
import { SubscribeArg } from '../../common/domain/subscribe-arg';
import { PopupService } from '../../common/service/popup.service';
import { DeleteModalComponent } from '../../common/component/modal/delete/delete.component';
import { Modal } from '../../common/domain/modal';
import { Alert } from '../../common/util/alert.util';
import { MomentDatePipe } from '../../common/pipe/moment.date.pipe';
import { StringUtil } from '../../common/util/string.util';
import { CriterionKey, ListCriterion } from '../../domain/datasource/listCriterion';

@Component({
  selector: 'app-data-connection',
  templateUrl: './data-connection.component.html',
  providers: [MomentDatePipe]

})
export class DataConnectionComponent extends AbstractComponent implements OnInit {

  // criterion data object
  private _criterionDataObject: any = {};

  // origin criterion filter list
  private _originCriterionList: ListCriterion[] = [];

  // origin more criterion filter more list
  private _originMoreCriterionList: ListCriterion[] = [];

  // 공통 삭제 팝업 모달
  @ViewChild(DeleteModalComponent)
  private deleteModalComponent: DeleteModalComponent;

  // 커넥션 생성 step
  public connectionStep: string;

  // connection list
  public connectionList: Dataconnection[];

  // selected connection
  public selectedConnection: Dataconnection = new Dataconnection();

  // search
  public searchKeyword: string = '';

  // connection filter list (for UI)
  public connectionFilterList: ListCriterion[] = [];

  // removed criterion key
  public removedCriterionKey: CriterionKey;

  // Constructor
  constructor(private dataconnectionService: DataconnectionService,
              private popupService: PopupService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // init UI
    this._initView();
    // loading show
    this.loadingShow();
    // get criterion list
    this.dataconnectionService.getCriterionListInConnection()
      .then((result: ListCriterion[]) => {
        // set origin criterion list
        this._originCriterionList = result;
        // set connection filter list
        this.connectionFilterList = result;
        // set origin more criterion list
        this._originMoreCriterionList = result.find(criterion => criterion.criterionKey === CriterionKey.MORE).subCriteria;
        // set connection list
        this._setConnectionList();
      }).catch(reason => this.commonExceptionHandler(reason));
    // 커넥션 생성 step 구독
    const popupSubscription = this.popupService.view$.subscribe((data: SubscribeArg) => {
      this.connectionStep = data.name;
      // created connection
      if (data.name === 'reload-connection') {
        // 페이지 초기화
        this.page.page = 0;
        // set connection list
        this._setConnectionList();
      }
    });
    this.subscriptions.push(popupSubscription);
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
        // set connection list
        this._setConnectionList();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Remove criterion filter in connection criterion filter list
   * @param {ListCriterion} criterion
   */
  public removeCriterionFilterInConnectionFilterList(criterion: ListCriterion): void {
    // set removed key
    this.removedCriterionKey = criterion.criterionKey;
  }

  /**
   * Search connection
   */
  public searchConnection(): void {
    // 페이지 초기화
    this.page.page = 0;
    // set connection list
    this._setConnectionList();
  }

  /**
   * Remove connection click event
   * @param {Dataconnection} connection
   */
  public onClickRemoveConnection(connection: Dataconnection): void {
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.storage.ui.dconn.delete.title');
    modal.description = this.translateService.instant('msg.storage.ui.delete.title');
    modal.btnName = this.translateService.instant('msg.storage.ui.dconn.delete.btn');
    // set connection id
    modal.data = connection.id;
    // 팝업 창 오픈
    this.deleteModalComponent.init(modal);
  }

  /**
   * create connection click event
   */
  public onClickCreateConnection(): void {
    // open create connection
    this.connectionStep = 'create-connection';
    this.selectedConnection = new Dataconnection();
  }

  /**
   * connection click event
   * @param {Dataconnection} connection
   */
  public onClickConnection(connection: Dataconnection): void {
    // open connection detail
    this.connectionStep = 'update-connection';
    this.selectedConnection = connection;
  }

  /**
   * More connection click event
   */
  public onClickMoreConnectionList(): void {
    // if more connection list
    if (this.isMoreContents()) {
      // add page number
      this.page.page += 1;
      // set connection list
      this._setConnectionList();
    }
  }

  /**
   * Criteria filter change event
   * @param {{label: CriterionKey; value: any}} criteriaObject
   */
  public onChangedCriteriaFilter(criteriaObject: {label: CriterionKey, value: any}): void {
    // if changed criteria filter key is MORE
    if (criteriaObject.label === CriterionKey.MORE) {
      // selected criterion filters
      Object.keys(criteriaObject.value).forEach((key) => {
        // if not exist criterion in selected criterion filters
        if (criteriaObject.value[key].length === 0) {
          // loop
          this.connectionFilterList.forEach((criterion, index, array) => {
            // if exist criterion in filter list
            if (criterion.criterionKey.toString() === key) {
              // remove criterion in dataObject
              delete this._criterionDataObject[key];
              // remove filter
              array.splice(index, 1);
              // search connection
              this.searchConnection();
            }
          });
        } else if (this.connectionFilterList.every(criterion => criterion.criterionKey.toString() !== key)){ // if not exist criterion in filter list
          // add filter
          this.connectionFilterList.push(this._originMoreCriterionList.find(originCriterion => originCriterion.criterionKey.toString() === key));
          // init removed key
          this.removedCriterionKey && (this.removedCriterionKey = null);
        }
      });
    } else {
      this._criterionDataObject[criteriaObject.label] = criteriaObject.value;
      // search connection
      this.searchConnection();
    }
  }

  /**
   * Search connection keyup event
   * @param {KeyboardEvent} event
   */
  public onSearchConnection(event: KeyboardEvent): void {
    // enter event
    if (13 === event.keyCode) {
      // search connection
      this.searchConnection();
    } else if (27 === event.keyCode) { // esc event
      // init search keyword
      this.searchKeyword = '';
      // search connection
      this.searchConnection();
    }
  }

  /**
   * Get connection implementor label
   * @param {ConnectionType} implementor
   * @returns {string}
   */
  public getConnectionImplementorLabel(implementor: ConnectionType): string {
    switch (implementor) {
      case ConnectionType.MYSQL:
        return 'MySQL';
      case ConnectionType.ORACLE:
        return 'Oracle';
      case ConnectionType.TIBERO:
        return 'Tibero';
      case ConnectionType.HIVE:
        return 'Hive';
      case ConnectionType.POSTGRESQL:
        return 'PostgreSQL';
      case ConnectionType.PRESTO:
        return 'Presto';
      case ConnectionType.MSSQL:
        return 'MsSQL';
      case ConnectionType.STAGE:
        return 'StagingDB';
      case ConnectionType.FILE:
        return 'File';
      default:
        return implementor.toString();
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
   * Is criterion in origin more criterion list
   * @param {ListCriterion} criterion
   * @returns {boolean}
   */
  public isAdvancedCriterion(criterion: ListCriterion): boolean {
    return -1 !== this._findCriterionIndexInCriterionList(this._originMoreCriterionList, criterion);
  }

  /**
   * criterion api function
   * @param criterionKey
   * @returns {Promise<ListCriterion>}
   */
  public criterionApiFunc(criterionKey: any): Promise<ListCriterion> {
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
    this.dataconnectionService.getConnectionList(this.page.page, this.page.size, this._getConnectionParams())
      .then((result) => {
        // set page result
        this.pageResult = result['page'];
        // if page number is 0
        if (this.page.page === 0) {
          // init connection list
          this.connectionList = [];
        }
        // set connection list
        this.connectionList = result['_embedded'] ? this.connectionList.concat(result['_embedded'].connections) : [];
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Init UI
   * @private
   */
  private _initView(): void {
    // init page
    this.page.page = 0;
    this.page.size = 20;
  }

  /**
   * Get connection params
   * @returns {Object}
   * @private
   */
  private _getConnectionParams(): object {
    // params
    const params = {};
    // criterion filter list
    Object.keys(this._criterionDataObject).forEach((key: any) => {
      // key loop
      Object.keys(this._criterionDataObject[key]).forEach((criterionKey) => {
        if (this._criterionDataObject[key][criterionKey].length !== 0) {
          // if CREATED_TIME, MODIFIED_TIME
          if ((key === CriterionKey.CREATED_TIME || key === CriterionKey.MODIFIED_TIME)) {
            // if not ALL, set value
            criterionKey !== 'ALL' && this._criterionDataObject[key][criterionKey].forEach(item => params[item.filterKey] = item.filterValue);
          } else {
            // set key
            params[criterionKey] = [];
            // set value
            this._criterionDataObject[key][criterionKey].forEach(item => params[criterionKey].push(item.filterValue));
          }
        }
      });
    });
    // if search keyword not empty
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      params['containsText'] = this.searchKeyword.trim();
    }
    return params;
  }

  /**
   * Find criterion index in criterion list
   * @param {ListCriterion[]} criterionList
   * @param {ListCriterion} criterion
   * @returns {number}
   * @private
   */
  private _findCriterionIndexInCriterionList(criterionList: ListCriterion[], criterion: ListCriterion): number {
    return criterionList.findIndex(item => item.criterionKey === criterion.criterionKey);
  }
}
