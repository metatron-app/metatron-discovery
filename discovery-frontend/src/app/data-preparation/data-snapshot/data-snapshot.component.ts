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

import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DataSnapshotService} from './service/data-snapshot.service';
import {AbstractComponent} from '../../common/component/abstract.component';
import {PrDataSnapshot, SsType, Status} from '../../domain/data-preparation/pr-snapshot';
import {DeleteModalComponent} from '../../common/component/modal/delete/delete.component';
import {Modal} from '../../common/domain/modal';
import {Alert} from '../../common/util/alert.util';
import {PreparationAlert} from '../util/preparation-alert.util';
import {MomentDatePipe} from '../../common/pipe/moment.date.pipe';
import {isUndefined,isNullOrUndefined} from 'util';
import {DataSnapshotDetailComponent} from './data-snapshot-detail.component';
import {PreparationCommonUtil} from "../util/preparation-common.util";
import {StorageService} from "../../data-storage/service/storage.service";
import {ActivatedRoute} from "@angular/router";
import * as _ from 'lodash'

@Component({
  selector: 'app-data-snapshot',
  templateUrl: './data-snapshot.component.html',
  providers: [MomentDatePipe]
})
export class DataSnapshotComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(DataSnapshotDetailComponent)
  private ssDetailComponent : DataSnapshotDetailComponent;

  // 검색 파라메터
  private _searchParams: { [key: string]: string };
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  public datasnapshots: PrDataSnapshot[];

  // 지울 데이터스냅샷 아이디
  public selectedDeletessId: string;

  public ssStatus: string;

  public searchText: string;

  public step: string;

  // 상세 조회 할 데이터스냅샷 아이디
  public ssId: string;

  public ssType : SsType;

  public selectedContentSort: Order = new Order();

  public interval : any;

  public prepCommonUtil = PreparationCommonUtil;

  public snapshotTypes: SnapshotType[];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(private dataSnapshotService: DataSnapshotService,
              private _activatedRoute: ActivatedRoute,
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

    this.subscriptions.push(
      // Get query param from url
      this._activatedRoute.queryParams.subscribe((params) => {

        if (!_.isEmpty(params)) {

          if (!isNullOrUndefined(params['size'])) {
            this.page.size = params['size'];
          }

          if (!isNullOrUndefined(params['page'])) {
            this.page.page = params['page'];
          }

          if (!isNullOrUndefined(params['ssName'])) {
            this.searchText = params['ssName'];
          }

          if (!isNullOrUndefined(params['status'])) {
            this.ssStatus = params['status'];
          }

          if (!isNullOrUndefined(params['type'])) {
            this.ssType = params['type'];
          }


          const sort = params['sort'];
          if (!isNullOrUndefined(sort)) {
            const sortInfo = decodeURIComponent(sort).split(',');
            this.selectedContentSort.key = sortInfo[0];
            this.selectedContentSort.sort = sortInfo[1];
          }
        }

        this.getSnapshots();
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
   * Get elapsed day
   * @param item
   */
  public getElapsedDay(item) {
    if (isUndefined(item) || isUndefined(item.elapsedTime) ) {
      return 0;
    }
    return item.elapsedTime.days;
  }


  /**
   * Returns formatted elapsed time
   * hour:minute:second.millisecond
   * @param item
   */
  public getElapsedTime(item: PrDataSnapshot) {

    if (isUndefined(item) ||
      isUndefined(item.elapsedTime) ||
      isUndefined(item.elapsedTime.hours) ||
      isUndefined(item.elapsedTime.minutes) ||
      isUndefined(item.elapsedTime.seconds) ||
      isUndefined(item.elapsedTime.milliseconds)
    ) {
      return '--:--:--';
    }
    return `${this.prepCommonUtil.padLeft(item.elapsedTime.hours)}:${this.prepCommonUtil.padLeft(item.elapsedTime.minutes)}:${this.prepCommonUtil.padLeft(item.elapsedTime.seconds)}.${this.prepCommonUtil.padLeft(item.elapsedTime.milliseconds)}`;
  }


  /**
   * Fetch snapshot list
   */
  public getSnapshots() {

    const params = this._getSsParams();

    this.datasnapshots = [];

    this.dataSnapshotService.getSnapshots(params).then((data) => {

      this._searchParams = params;

      this.pageResult = data['page'];

      this.datasnapshots = data['_embedded'] ? this.datasnapshots.concat(data['_embedded'].preparationsnapshots) : [];

      const preparing = [Status.INITIALIZING,Status.RUNNING,Status.WRITING,Status.TABLE_CREATING,Status.CANCELING];

      let statusNum = 0;
      this.datasnapshots.forEach((obj : PrDataSnapshot) => {
        if ( [Status.SUCCEEDED].indexOf(obj.status) >= 0){
          obj.displayStatus = 'SUCCESS';
          statusNum+=1;
        } else if (preparing.indexOf(obj.status) >= 0) {
          obj.displayStatus = 'PREPARING';
        } else  {
          obj.displayStatus = 'FAIL';
          statusNum+=1;
        }
      });


      // recursion
      const idx = this.datasnapshots.findIndex((item) => {
        return preparing.indexOf(item.status) > -1
      });
      if (idx > -1 && !this.ssDetailComponent.isShow) {
        setTimeout(() => {
          this.getSnapshots();
        }, 5000)
      }

    }).catch((error) => {

      this.loadingHide();
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));

    });
  }


  /**
   * 검색 input 에서 keydown event
   * @param event
   */
  public onSearchInputKeyPress(event : any) {

    // ESC or ENTER
    if (27 === event.keyCode || 13 === event.keyCode) {
      event.keyCode === 27 ? this.searchText = '' : null;
      this.page.page = 0;
      this.reloadPage();
    }

  }


  /** 데이터스냅샷 삭제
   * @param event  이벤트
   * @param dataset 선택한 데이터셋
   * */
  public confirmDelete(event, dataset) {

    // stop event bubbling
    event.stopPropagation();

    // delete modal
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.dp.alert.ss.del.title');
    modal.description = dataset.finishTime ? this.translateService.instant('msg.dp.alert.ss.del.description') : 'Snapshot is preparing. Are you sure you want to stop this process and delete it?';

    this.selectedDeletessId = dataset.ssId;
    this.deleteModalComponent.init(modal);

  }


  /**
   * Delete snapshot
   */
  public deleteDataSnapshot() {

    this.dataSnapshotService.deleteDataSnapshot(this.selectedDeletessId).then(() => {
      Alert.success(this.translateService.instant('msg.dp.alert.del.success'));

      if (this.page.page > 0 && this.datasnapshots.length === 1) {
        this.page.page = this.page.page - 1;
      }
      this.reloadPage(false);

    }).catch(() => {
      Alert.error(this.translateService.instant('msg.dp.alert.del.fail'));
    });

  }


  /**
   * Open snapshot detail
   * @param item
   */
  public snapshotDetail(item) {

    this.safelyDetectChanges();
    this.ssDetailComponent.init(item.ssId);
  }


  /**
   * Sorting
   * @param key
   */
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

    this.reloadPage();
  }


  /**
   * Close snapshot detail
   */
  public closeDetail(){
    this.step = 'close-detail';
    this.reloadPage(false);
  }


  /**
   * When status is changed
   * @param status
   */
  public onChangeStatus(status: string) {

    this.ssStatus = status;

    this.reloadPage();
  }


  /**
   * When snapshot type is changed
   * @param data
   */
  public onChangeType(data: SnapshotType) {

    this.ssType = data.value;

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

      this.reloadPage(false);
    }
  } // function - changePage


  /**
   * Returns name for svg component
   * @param snapshot
   */
  public getSvgName(snapshot: PrDataSnapshot) {

    const csv : string = 'CSV';
    if (snapshot.ssType === SsType.STAGING_DB) {
      return 'HIVE'
    }

    if (snapshot.storedUri.endsWith('.json')) {
      return 'JSON';
    }

    return csv;
  }


  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this._searchParams = this._getSsParams();
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Initialise values
   * @private
   */
  private _initView() {

    this.snapshotTypes = [
      {label:'All', value : null},
      {label: 'FILE', value : SsType.URI},
      // {label: 'Database', value : SsType.DATABASE},
      // {label: 'DRUID', value : SsType.DRUID}
    ];

    this.ssStatus = 'all';
    this.searchText = '';
    this.selectedContentSort.sort = 'desc';
    this.selectedContentSort.key = 'createdTime';

    // Add staging db option in snapshot type filter is staging is enabled
    if (StorageService.isEnableStageDB) {
      this.snapshotTypes.push({label: 'Staging DB', value : SsType.STAGING_DB});
    }

  }


  /**
   * Returns parameter for fetching snapshot list
   * @private
   */
  private _getSsParams(): any {
    const params = {
      page: this.page.page,
      size: this.page.size,
      status : this.ssStatus,
      type: this.ssType,
      projection:'listing',
      ssName: this.searchText,
      pseudoParam : (new Date()).getTime()
    };

    this.selectedContentSort.sort !== 'default' && (params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort);

    return params;
  }

}

class Order {
  key: string = 'createdTime';
  sort: string = 'default';
}

class SnapshotType {
  public label: string;
  public value: SsType;
}
