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

import { Component, OnInit, Injector, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { DataSnapshotService } from './service/data-snapshot.service';
import { AbstractComponent } from '../../common/component/abstract.component';
import { DataSnapshot } from '../../domain/data-preparation/data-snapshot';
import { DeleteModalComponent } from '../../common/component/modal/delete/delete.component';
import { Modal } from '../../common/domain/modal';
import { Alert } from '../../common/util/alert.util';
import { PreparationAlert } from '../util/preparation-alert.util';
import { Subscription } from 'rxjs/Subscription';
import { MomentDatePipe } from '../../common/pipe/moment.date.pipe';
import { isUndefined } from 'util';
import { DataSnapshotDetailComponent } from './data-snapshot-detail.component';
import * as $ from "jquery";

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
  public datasnapshots: DataSnapshot[] = [];

  /** 데이터스냅샷 */
  public datasnapshot: DataSnapshot;

  /** 지울 데이터스냅샷 아이디 */
  public selectedDeletessId: string;

  /** search text */
  public searchText: string = '';

  /** popup status */
  public step: string;

  /** 상세 조회 할 데이터스냅샷 아이디 */
  public ssId: string;

  /** 정렬 */
  public selectedContentSort: Order = new Order();

  public interval : any;

  public pageSize : number = 20;
  public pageNum : number = 1;
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
    // 뷰
    this.initViewPage();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    clearInterval(this.interval);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public getElapsedDay(item) {
    if( true===isUndefined(item) || true===isUndefined(item.elapsedTime) ) { return 0; }
    return item.elapsedTime.days;
  }
  public getElapsedTime(item) {
    if( true===isUndefined(item) || true===isUndefined(item.elapsedTime)
     || true===isUndefined(item.elapsedTime.hours) || true===isUndefined(item.elapsedTime.minutes) || true===isUndefined(item.elapsedTime.seconds) || true===isUndefined(item.elapsedTime.milliseconds)
    ) { return '--:--:--'; }
    return this.padleft(item.elapsedTime.hours) + ':' + this.padleft(item.elapsedTime.minutes) + ':' +this.padleft(item.elapsedTime.seconds) + '.' + this.padleft(item.elapsedTime.milliseconds);
  }

  /** 데이터 스냅샷 목록 조회 */
  public getDatasnapshots() {

    this.loadingShow();
    this.dataSnapshotService.getDataSnapshotsByStatus(this.searchText, 'SUCCESS' ,this.page, 'listing')
      .then((data) => {
        this.loadingHide();

        this.pageResult = data['page'];
        const sorting = this.page.sort.split(',');
        this.selectedContentSort.key = sorting[0];
        this.selectedContentSort.sort = sorting[1];
        this.datasnapshots = [];

        let statusNum = 0;
        data['_embedded'].preparationsnapshots.forEach((obj) => {
          if( true===isUndefined(obj.finishTime) ) {
            obj.status = 'PREPARING';
          } else {
            statusNum+=1;
            if( false===isUndefined(obj.custom) && false===isUndefined(obj.custom.fail_msg) ) {
              obj.status = 'FAIL';
            } else {
              obj.status = 'SUCCESS';
            }
          }
        });

        this.datasnapshots = data['_embedded'].preparationsnapshots;

        if (this.datasnapshots.length === 0 || statusNum === this.datasnapshots.length) {
          clearInterval(this.interval);
        }
        // this.page.page += 1;
      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
      });
  }

  /** 데이터 스냅샷 검색 */
  public searchDataSnapshot(event : KeyboardEvent) {
    clearInterval(this.interval);
    this.resetPaging();

    if (13 === event.keyCode) {
      this.page.page = 0;
      this.initViewPage();
    } else if(27 === event.keyCode) {
      this.searchText = '';
      this.page.page = 0;
      this.initViewPage();
    }
  }

  /** 데이터스냅샷 삭제
   * @param event  이벤트
   * @param dataset 선택한 데이터셋
   * */
  public confirmDelete(event, dataset) {
    event.stopPropagation();

    clearInterval(this.interval);
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

      // this.resetPaging();
      // this.initViewPage();
      let idx = this.datasnapshots.findIndex((result) => {
        return result.ssId === this.selectedDeletessId;
      });
      this.datasnapshots.splice(idx,1);
      this.pageResult.totalElements = this.pageResult.totalElements-1

    }).catch((error) => {
      Alert.error(this.translateService.instant('msg.dp.alert.del.fail'));
    });

  }


  /** 스냅샷 상세 */
  public snapshotDetail(item) {

    if(!item.finishTime) {
      return;
    }

    // this.step = 'snapshot-detail';
    // this.ssId = item.ssId;
    clearInterval(this.interval);
    this.safelyDetectChanges();
    this.dataSnapshotDetailComponent.init(item.ssId);
  }

  /** 정렬 */
  public changeOrder(column: string) {
    clearInterval(this.interval);

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

    // 데이터스냅샷 리스트 조회
    this.pageSize = 20;
    this.pageNum = 1;
    this.interval =  setInterval(() => this.getDatasnapshots(), 3000);
    this.getDatasnapshots();

  }

  /** close snapshot detail */
  public closeDetail(){
    this.step = 'close-detail';
    this.resetPaging();
    this.initViewPage();

  }

  /** get snapshot list according to status */
  public changeStatus(status) {
    clearInterval(this.interval);
    this.resetPaging();
    switch(status) {
      case 'all' :
      case 'success' :
        this.initViewPage();
        break;
      case 'fail' :
        this.pageResult.totalElements = 0;
        this.datasnapshots = [];
        break;
      // case 'preparing' :
      //   this.pageResult.totalElements = 0;
      //   this.datasnapshots = [];
      //   break;
    }
  }

  public resetPaging() {
    this.pageNum = 1;
    this.pageSize = 20;
    this.page.size = 20;

  }

  /** Formatting number to 2 whole number digit */
  public padleft(data) {

    let z = '0';
    let n = data + '';
    return n.length >= 2 ? n : new Array(2 - n.length + 1).join(z) + n;
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /** View 초기화 */
  private initViewPage() {
    // Default 정렬
    this.page.sort = 'createdTime,desc';
    this.interval =  setInterval(() => this.getDatasnapshots(), 3000);
    this.getDatasnapshots();
  }
  public morePages() {
    clearInterval(this.interval);
    this.pageNum += 1;
    this.page.size = this.pageNum * this.pageSize;
    this.initViewPage();
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

/** 정렬 */
class Order {
  key: string = 'createdTime';
  sort: string = 'default';
}
