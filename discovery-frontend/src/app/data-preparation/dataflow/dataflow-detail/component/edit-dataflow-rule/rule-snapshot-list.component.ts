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

import { Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractComponent } from '../../../../../common/component/abstract.component';
import { DataflowService } from '../../../service/dataflow.service';
//import { DataSnapshot } from '../../../../../domain/data-preparation/data-snapshot';
import { PrDataSnapshot, Status } from '../../../../../domain/data-preparation/pr-snapshot';
import { DataSnapshotService } from '../../../../data-snapshot/service/data-snapshot.service';
import { Alert } from '../../../../../common/util/alert.util';
import {PreparationCommonUtil} from "../../../../util/preparation-common.util";

@Component({
  selector: 'app-rule-snapshot-list',
  templateUrl: './rule-snapshot-list.component.html',
})
export class RuleSnapshotListComponent extends AbstractComponent implements OnInit, OnDestroy{


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  private snapshotDetailEvent = new EventEmitter();

  @Output()
  private snapshotListRefreshEvent = new EventEmitter();

  @Output()
  private retrieveAllSnapshots = new EventEmitter();

  @Output()
  private snapshotIntervalStopEvent = new EventEmitter();
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  //public snapshotList : DataSnapshot[];
  public snapshotList : PrDataSnapshot[];

  public prepCommonUtil = PreparationCommonUtil;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              protected dataflowService : DataflowService,
              protected snapshotService : DataSnapshotService) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();
  }

  public ngOnDestroy() {
    this.snapshotIntervalStopEvent.emit(); // stop interval
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Returns snapshot status
   * @param {string} status
   * @return {string[]}
   */
  public getSnapshotStatus(status : string) : string[] {

    let result = [];
    let progress = ['INITIALIZING','RUNNING','WRITING','TABLE_CREATING','NOT_AVAILABLE'];
    if ('SUCCEEDED' === status) {
      result = ['Success','success'];
    } else if ('FAILED' === status) {
      result = ['Failed','failed'];
    } else if (-1 !== progress.indexOf(status)) {
      result = ['Preparing','play'];
    }  else {
      result = [status[0].toUpperCase() + status.slice(1),'cancel'];
    }
    return result
  }

/*
  public getSnapshotType(type: string) : string {

    let result = type;
    if (type.toUpperCase() === 'FILE') {
      result = 'Local';
    } else if (type.toUpperCase() === 'JDBC') {
      result = 'Database';
    } else if (type.toUpperCase() === 'HIVE') {
      result = 'Staging DB';
    }

    return result;
  }
*/

  /**
   * Navigate to snapshot list
   */
  public goToSnapshotList() {
    this.router.navigate(['/management/datapreparation/datasnapshot']);
  } // function - goToSnapshotList

  /**
   * INIT
   * @param {DataSnapshot[]} list
   */
  //public init(list : DataSnapshot[]) {
  public init(list : PrDataSnapshot[]) {
    this.snapshotList = list;
  } // function - init

  /**
   * Open snapshot detail popup
   * @param {DataSnapshot} snapshot
   */
  //public snapshotDetail(snapshot : DataSnapshot) {
  public snapshotDetail(snapshot : PrDataSnapshot) {

    //if (snapshot.status === 'CANCELED' || snapshot.isCancel) {
    if (snapshot.status === Status.CANCELED || snapshot.isCancel) {
      return;
    }

    this.snapshotList.forEach((item) => {
      item.isCancel = false;
    });
    this.snapshotIntervalStopEvent.emit();
    this.snapshotDetailEvent.emit(snapshot.ssId);
  } // function - snapshotDetail

  /**
   * Snapshot cancel confirm popup open
   * @param {DataSnapshot} snapshot
   */
  //public cancelSnapshot(snapshot: DataSnapshot) {
  public cancelSnapshot(snapshot: PrDataSnapshot) {
    this.snapshotIntervalStopEvent.emit(); // Stop interval

    if (snapshot.elapsedTime) { // cannot cancel already created snapshot
      return;
    } else { // cancel
      snapshot.isCancel = true;
    }

  } // function - cancelSnapshot


  /**
   * Cancel snapshot
   * @param snapshot {DataSnapshot}
   */
  //public cancelSnapshotConfirm(snapshot : DataSnapshot) {
  public cancelSnapshotConfirm(snapshot : PrDataSnapshot) {
    snapshot.isCancel = false;
    this.snapshotService.cancelSnapshot(snapshot.ssId).then((result) => {
      if (result.result === 'OK') {
        this.retrieveAllSnapshots.emit(snapshot.ssId);
      } else {
        Alert.warning(this.translateService.instant('msg.dp.alert.snapshot.cancel.fail'));
        this.snapshotList.forEach((item) => {
          item.isCancel = false;
        });
      }
      setTimeout(() => {
        this.refreshSnapshotList();
      },2000)
    }).catch((error) => {
      console.info(error);
    })
  } // function - cancelSnapshotConfirm

  /**
   * 스냅샷 리스트 다시 불러오기
   * @param {DataSnapshot} snapshot
   */
  //public refreshSnapshotList(snapshot? : DataSnapshot) {
  public refreshSnapshotList(snapshot? : PrDataSnapshot) {
    if (snapshot) {
      snapshot.isCancel = false;
    }
    this.snapshotListRefreshEvent.emit();
  } // function - refreshSnapshotList
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
