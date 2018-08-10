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

import { Component, ElementRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { AbstractComponent } from '../../common/component/abstract.component';
import { DataSnapshot } from '../../domain/data-preparation/data-snapshot';
import { DataSnapshotService } from '../data-snapshot/service/data-snapshot.service';

@Component({
  selector: 'snapshot-loading',
  templateUrl: './snapshot-loading.component.html',
})
export class SnapshotLoadingComponent extends AbstractComponent implements OnInit, OnDestroy {


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public snapshot : DataSnapshot;

  public interval;

  public isShow : boolean = false;          // 팝업 show/hide
  public snapshotFailed :  boolean = false; // 스냅샷 생성 실패 팝업
  public snapshotSuccess : boolean = false; // 스냅샷 생성 완료 팝업
  public snapshotCancel : boolean = false;  // 스냅샷 생성 취소 팝업
  public inProgress : boolean = true;       // 생성되고 있을때 열릴 팝업
  public isCanceled : boolean = false;      // 취소 완료 팝업

  public snapshotId : string ;

  public progressPercentage : number = 0;
  public isAPIRequested : boolean = false;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private snapshotService : DataSnapshotService) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
    clearInterval(this.interval);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 스냅샷 완료 후 실행
   * @param snapshotId
   */
  public init(snapshotId) {
    this.snapshotId = snapshotId;
    this.getSnapshotDetail(this.snapshotId);
    this.interval = setInterval(() => {
      this.getSnapshotDetail(this.snapshotId);
    },1000);
  } // end of init

  /**
   * 스냅샷 상세 조회
   * @param snapshotId
   */
  public getSnapshotDetail(snapshotId) {
    if (this.isAPIRequested === false) {
      this.snapshotService.getDataSnapshot(snapshotId).then((result) => {
        this.isAPIRequested = true;
        if (result) {
          this.snapshot = result;
          this.isShow = true;
          if (!this.snapshot.elapsedTime) {
            if (this.snapshot.ruleCntTotal === this.snapshot.ruleCntDone ||
              this.snapshot.ruleCntTotal < this.snapshot.ruleCntDone ) {
              clearInterval(this.interval);
              this.inProgress = false;
              this.snapshotSuccess = true;
            } else {
              let val: number  = this.snapshot.ruleCntDone * 100 / (this.snapshot.ruleCntTotal + 1);
              this.progressPercentage = val;
            }
          } else { // 스냅샷 생성 완료
            this.inProgress = false;
            this.snapshotSuccess = true;
            clearInterval(this.interval);
          }
          this.isAPIRequested = false;
        }
      });
    }
  } // end of getSnapshotDetail

  /**
   * 스냅샷 취소 확인 팝업 오픈
   */
  public openCancelSnapshotPopup() {
    this.snapshotCancel = true
  } // end of openCancelSnapshotPopup

  /**
   * 스냅샷 취소
   */
  public cancelSnapshot() {
    this.snapshotService.cancelSnapshot(this.snapshotId).then(() => {

      clearInterval(this.interval);
      this.inProgress = false;
      this.isCanceled = true;

      // 취소 팝업 띄우고 2초 후에 닫힌다.
      setTimeout(() => {
        this.close();
      },2000)

    }).catch((error) => {
      console.info(error);
      clearInterval(this.interval);
      this.close();
    })
  } // end of cancelSnapshot

  /**
   * 스냅샷 리스트로 이동
   */
  public goToSnapshotList() {
    this.router.navigate(['/management/datapreparation/datasnapshot']);
  } // end of goToSnapshotList

  /**
   * 퍕업 닫기
   */
  public close() {
    clearInterval(this.interval);
    this.isShow = false;
  } // end of close
}
