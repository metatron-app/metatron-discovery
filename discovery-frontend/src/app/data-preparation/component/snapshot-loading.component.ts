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

import {Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {AbstractComponent} from '@common/component/abstract.component';
import {PrDataSnapshot, Status} from '@domain/data-preparation/pr-snapshot';
import {DataSnapshotService} from '../data-snapshot/service/data-snapshot.service';

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
  public snapshot: PrDataSnapshot;

  public interval;

  public isShow: boolean = false;            // popup show/hide
  public snapshotCancel: boolean = false;    // snapshot cancel confirm popup show/hide
  public inProgress: boolean = true;         // t/f if in progress
  public isFinishPopupOpen: boolean = false; // t/f is status is failed, succeeded, canceled

  public snapshotId: string;

  public progressPercentage: number = 0;
  public isAPIRequested: boolean = false;

  public statusClass: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private snapshotService: DataSnapshotService) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    super.ngOnInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    clearInterval(this.interval);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Execute first
   * @param snapshotId {string}
   */
  public init(snapshotId: string) {
    this.snapshotId = snapshotId;
    this.getSnapshotDetail(this.snapshotId);
    this.getSnapshotDetailWithInterval();
  } // end of init

  /**
   * Fetch snapshot detail with 1 sec interval
   */
  public getSnapshotDetailWithInterval() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.getSnapshotDetail(this.snapshotId);
    }, 1000);
  }

  /**
   * Fetch snapshot detail
   * @param snapshotId {string}
   */
  public getSnapshotDetail(snapshotId: string) {
    if (this.isAPIRequested === false) {
      this.snapshotService.getDataSnapshot(snapshotId).then((result) => {
        this.isAPIRequested = true;
        if (result) {
          this.snapshot = result;
          this.isShow = true;
          const progress = [Status.NOT_AVAILABLE, Status.INITIALIZING, Status.RUNNING, Status.WRITING, Status.TABLE_CREATING];
          if (this.snapshot.status === Status.FAILED) {
            this._setFinishPopup('fail');
          } else if (this.snapshot.status === Status.SUCCEEDED) {
            this._setFinishPopup('success');
          } else if (-1 !== progress.indexOf(this.snapshot.status)) {
            this.progressPercentage = this.snapshot.ruleCntDone * 100 / (this.snapshot.ruleCntTotal + 1);
            this.inProgress = true;
          }

          this.isAPIRequested = false;
        }
      });
    }
  } // end of getSnapshotDetail

  /**
   * snapshot cancel confirm popup open
   */
  public openCancelSnapshotPopup() {
    this.snapshotCancel = true;
    clearInterval(this.interval);
  } // end of openCancelSnapshotPopup

  /**
   * Cancel snapshot
   */
  public cancelSnapshot() {
    this.snapshotService.cancelSnapshot(this.snapshotId).then((result) => {
      if (result.result === 'OK') {
        this._setFinishPopup('cancel');
      } else {
        Alert.warning(this.translateService.instant('msg.dp.alert.snapshot.cancel.fail'));
        this.snapshotCancel = false;
        this.inProgress = true;
        this.getSnapshotDetailWithInterval();
      }
    }).catch((error) => {
      console.log(error);
      clearInterval(this.interval);
      this.close();
    })
  } // end of cancelSnapshot

  /**
   * Jump to snapshot list
   */
  public goToSnapshotList() {
    this.router.navigate(['/management/datapreparation/datasnapshot']);
  } // end of goToSnapshotList

  /**
   * close popup
   */
  public close() {
    clearInterval(this.interval);
    this.isShow = false;
    this.isFinishPopupOpen = false;
    this.inProgress = false;
    this.snapshotCancel = false;

  } // end of close

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Set values for success, fail, canceled popup
   * @param {string} status
   */
  private _setFinishPopup(status: string) {
    this.inProgress = false;
    this.isFinishPopupOpen = true;

    if (status === 'fail') {
      this.snapshot.displayStatus = 'Failed!';
      this.statusClass = 'fail'
    } else if (status === 'success') {
      this.snapshot.displayStatus = 'Success!';
      this.statusClass = 'success'
    } else {
      this.snapshot.displayStatus = 'Canceled!';
      this.statusClass = 'success'
    }
    clearInterval(this.interval);
  }

}
