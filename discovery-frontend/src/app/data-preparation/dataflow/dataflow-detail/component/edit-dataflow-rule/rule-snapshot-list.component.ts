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
import { DataSnapshot } from '../../../../../domain/data-preparation/data-snapshot';
import { DataSnapshotService } from '../../../../data-snapshot/service/data-snapshot.service';

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
  private snapshotIntervalStopEvent = new EventEmitter();
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public snapshotList : DataSnapshot[];
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

  // Init
  public ngOnInit() {
    super.ngOnInit();

  } // function - ngOnInit

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Navigate to snapshot list
   */
  public goToSnapshotList() {
    this.router.navigate(['/management/datapreparation/datasnapshot']);
  } // function - goToSnapshotList


  /**
   * 화면 오픈 및 스냅샷 리스트 데이터 전달
   * @param {DataSnapshot[]} list
   */
  public init(list : DataSnapshot[]) {
    this.snapshotList = list;
  } // function - init

  /**
   * 스냅샷 디테일 팝업 오픈
   * @param {DataSnapshot} snapshot
   */
  public snapshotDetail(snapshot : DataSnapshot) {
    this.snapshotList.forEach((item) => {
      item.isCancel = false;
    });
    this.snapshotDetailEvent.emit(snapshot.ssId);
  } // function - snapshotDetail

  /**
   * 스냅샷 취소 버튼 클릭시 팝업 오픈
   * @param {DataSnapshot} snapshot
   */
  public cancelSnapshot(snapshot: DataSnapshot) {
    this.snapshotIntervalStopEvent.emit(); // 폴링 스탑

    if (snapshot.elapsedTime) { // 생성 완료 된 스냅샷은 취소 안됨
      return;
    } else {// cancel
      snapshot.isCancel = true;
    }

  } // function - cancelSnapshot


  /**
   * 스냅샷 생성 취소 확인
   * @param snapshot
   */
  public cancelSnapshotConfirm(snapshot) {
    snapshot.isCancel = false;
    this.snapshotService.cancelSnapshot(snapshot.ssId).then(() => {
      // 취소 팝업 띄우고 2초 후에 닫힌다.
      setTimeout(() => {
        this.refreshSnapshotList();
      },1000)

    }).catch((error) => {
      console.info(error);
    })
  } // function - cancelSnapshotConfirm

  /**
   * 스냅샷 리스트 다시 불러오기
   * @param {DataSnapshot} snapshot
   */
  public refreshSnapshotList(snapshot? : DataSnapshot) {
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
