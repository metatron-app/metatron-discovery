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
import {isUndefined} from 'util';
import {DataSnapshotDetailComponent} from './data-snapshot-detail.component';
import {PreparationCommonUtil} from "../util/preparation-common.util";
import {StorageService} from "../../data-storage/service/storage.service";

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
  private dataSnapshotDetailComponent : DataSnapshotDetailComponent;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  /** 데이터스냅샷 리스트 */
  public datasnapshots: PrDataSnapshot[] = [];

  /** 데이터스냅샷 */
  public datasnapshot: PrDataSnapshot;

  /** 지울 데이터스냅샷 아이디 */
  public selectedDeletessId: string;

  /** search status */
  public searchStatus: string ='all';

  /** search text */
  public searchText: string = '';

  /** popup status */
  public step: string;

  /** 상세 조회 할 데이터스냅샷 아이디 */
  public ssId: string;

  public ssType : string;

  /** 정렬 */
  public selectedContentSort: Order = new Order();

  public interval : any;

  public pageSize : number = 20;
  public pageNum : number = 1;

  public prepCommonUtil = PreparationCommonUtil;

  public snapshotTypes: SnapshotType[] = [];
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(private dataSnapshotService: DataSnapshotService,
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

    this.snapshotTypes = [
      {label:'All', value : null},
      {label: 'FILE', value : SsType.URI},
      // {label: 'Database', value : SsType.DATABASE},
      // {label: 'DRUID', value : SsType.DRUID}
    ];

    // Add staging db option in snapshot type filter is staging is enabled
    if (StorageService.isEnableStageDB) {
      this.snapshotTypes.push({label: 'Staging DB', value : SsType.STAGING_DB});
    }

    // Paging reset
    this.resetPaging();

    // default paging
    this.page.sort = 'createdTime,desc';

    // Get snapshot list
    this.getIntervalSnapshot();
  }

  public ngOnDestroy() {

    this._removeExistingInterval();
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
    if( true===isUndefined(item) || true===isUndefined(item.elapsedTime) ) { return 0; }
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


  /** Fetch snapshot list */
  public getDatasnapshots() {
    this.loadingShow();

    this.dataSnapshotService.getDataSnapshotsByStatus({searchText : this.searchText, page :this.page, status : this.searchStatus, projection : 'listing', ssType : this.ssType})
      .then((data) => {
        this.loadingHide();

        this.pageResult = data['page'];
        const sorting = this.page.sort.split(',');
        this.selectedContentSort.key = sorting[0];
        this.selectedContentSort.sort = sorting[1];
        this.datasnapshots = [];

        let statusNum = 0;
        data['_embedded'].preparationsnapshots.forEach((obj : PrDataSnapshot) => {
          if ( [Status.SUCCEEDED].indexOf(obj.status) >= 0){
            obj.displayStatus = 'SUCCESS';
            statusNum+=1;
          } else if ( [Status.INITIALIZING,Status.RUNNING,Status.WRITING,Status.TABLE_CREATING,Status.CANCELING].indexOf(obj.status) >= 0) {
            obj.displayStatus = 'PREPARING';
          } else  {
            obj.displayStatus = 'FAIL';
            statusNum+=1;
          }
        });

        this.datasnapshots = data['_embedded'].preparationsnapshots;

        if (this.datasnapshots.length === 0 || statusNum === this.datasnapshots.length) {
          this._removeExistingInterval();
        }
      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));

        this._removeExistingInterval();
      });
  }


  /**
   * 검색 input 에서 keydown event
   * @param event
   */
  public onSearchInputKeyPress(event : any) {

    // interval 삭제
    this._removeExistingInterval();

    // ESC or ENTER
    if (27 === event.keyCode || 13 === event.keyCode) {

      // 페이지는 처음부터
      this.resetPaging();

      // esc 는 검색어 초기화
      if(27 === event.keyCode) {
        this.searchText = '';
      }

      // 스냅샷 목록 불러오기
      this.getIntervalSnapshot();
    }

  }


  /** 데이터스냅샷 삭제
   * @param event  이벤트
   * @param dataset 선택한 데이터셋
   * */
  public confirmDelete(event, dataset) {

    // stop event bubbling
    event.stopPropagation();


    // remove interval
    this._removeExistingInterval();


    // delete modal
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.dp.alert.ss.del.title');
    modal.description = dataset.finishTime ? this.translateService.instant('msg.dp.alert.ss.del.description') : 'Snapshot is preparing. Are you sure you want to stop this process and delete it?';

    this.selectedDeletessId = dataset.ssId;
    this.deleteModalComponent.init(modal);

  }


  /** 데이터스냅샷 삭제 */
  public deleteDataSnapshot() {

    this.dataSnapshotService.deleteDataSnapshot(this.selectedDeletessId).then(() => {
      Alert.success(this.translateService.instant('msg.dp.alert.del.success'));

      // 스냅샷을 지우고 화면이 refresh 되는게 싫다고 하셔서 리스트에서 지워진 아이템만 지움 (confirmed by jooho)
      let idx = this.datasnapshots.findIndex((result) => {
        return result.ssId === this.selectedDeletessId;
      });
      this.datasnapshots.splice(idx,1);
      this.pageResult.totalElements = this.pageResult.totalElements-1

    }).catch(() => {
      Alert.error(this.translateService.instant('msg.dp.alert.del.fail'));
    });

  }


  /** 스냅샷 상세 */
  public snapshotDetail(item) {
    this._removeExistingInterval();

    this.safelyDetectChanges();
    this.dataSnapshotDetailComponent.init(item.ssId);
  }


  /** 정렬 */
  public changeOrder(column: string) {

    this._removeExistingInterval();

    this.resetPaging();

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

    // 데이터스냅샷 리스트 조회
    // this.pageSize = 20;
    // this.pageNum = 1;

    this.getIntervalSnapshot();

  }


  /** close snapshot detail */
  public closeDetail(){
    this.step = 'close-detail';
    this.resetPaging();
    this.getIntervalSnapshot();
  }


  /** get snapshot list according to status */
  public changeStatus(status) {
    this._removeExistingInterval();

    this.resetPaging();
    this.searchStatus = status;
    this.getIntervalSnapshot();
  }


  /**
   * Reset paging
   */
  public resetPaging() {
    this.pageResult.totalElements = 0;
    this.page.page = 0;
    this.pageNum = 1;
    this.pageSize = 20;
    this.page.size = 20;
  }


  /**
   * Change snapshot type
   * @param data
   */
  public onChangeType(data) {

    this.ssType = data.value;

    this._removeExistingInterval();

    this.getIntervalSnapshot();

  }


  /**
   * Get more data
   */
  public morePages() {
    this._removeExistingInterval();

    this.pageNum += 1;
    this.page.size = this.pageNum * this.pageSize;
    this.getIntervalSnapshot();
  }


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
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Snapshot list interval 로 불러오기
   */
  private getIntervalSnapshot() {

    // Default 정렬
    this.interval =  setInterval(() => this.getDatasnapshots(), 3000);
    this.getDatasnapshots();

  }


  /**
   * Removes existing interval
   * @private
   */
  private _removeExistingInterval() {
    clearInterval(this.interval);
    this.interval = null;
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

class Order {
  key: string = 'createdTime';
  sort: string = 'default';
}

class SnapshotType {
  public label: string;
  public value: SsType;
}
