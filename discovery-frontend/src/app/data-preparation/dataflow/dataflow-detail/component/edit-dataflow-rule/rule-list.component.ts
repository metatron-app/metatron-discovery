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

import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {AbstractComponent} from '@common/component/abstract.component';
import {Rule} from '@domain/data-preparation/pr-dataset';
import {PrDataSnapshot, SsType, Status} from '@domain/data-preparation/pr-snapshot';
import {DataSnapshotService} from '../../../../data-snapshot/service/data-snapshot.service';
import {PreparationCommonUtil} from '../../../../util/preparation-common.util';
import {DataflowService} from '../../../service/dataflow.service';

@Component({
  selector: 'app-rule-list',
  templateUrl: './rule-list.component.html',
})
export class RuleListComponent extends AbstractComponent implements OnInit, OnDestroy {

  @Output()
  private snapshotDetailEvent = new EventEmitter();

  @Output()
  private snapshotListJump = new EventEmitter();
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  public jumpEvent = new EventEmitter();

  @Output()
  public redoUndoEvent = new EventEmitter();

  @Output()
  public addRuleEvent = new EventEmitter();

  @Output()
  public editEvent = new EventEmitter();

  @Output()
  public deleteEvent = new EventEmitter();

  @Input()
  public ruleList: any[] = [];

  @Input()
  public redoable: boolean = false;

  @Input()
  public undoable: boolean = false;

  @Input()
  public dsId : string;

  public tabNumber : number = 0;

  public snapshotList : PrDataSnapshot[];

  public interval : any;

  public selectedRuleIdx :number;

  public prepCommonUtil = PreparationCommonUtil;

  public isRequested: boolean = false; // 서버에 이미 요청 했는지 ?

  public snapshotStatus = Status;

  public isCancelPopupOpen: boolean = false;
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

    // Need to find out number of snapshots
    this.getSnapshotList();
  }

  // Destroy
  public ngOnDestroy() {
    this.clearExistingInterval();
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Clear interval
   */
  public clearExistingInterval() {
    if (!this.isNullOrUndefined(this.interval)) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }


  /**
   * 스냅샷 리스트에서 아직 준비중인 스냅샷이 있는지 확인
   * @param list
   * @return {number} interval을 stop 하려면 -1을 리턴한다.
   */
  public pollingContinue(list) : number {
    const statusList = ['INITIALIZING','RUNNING','WRITING','TABLE_CREATING','NOT_AVAILABLE'];
    return list.findIndex((item) => {
      return -1 !== statusList.indexOf(item.status.toString())
    });
  } // function - pollingContinue


  /**
   * Retrieve snapshot list
   */
  public getSnapshotList() {

    // Return when snapshot cancel confirm popup is opened
    if (this.isCancelPopupOpen) {
      this.clearExistingInterval();
      return;
    }

    // Check flag
    if (!this.isRequested) {
      this.isRequested = true;

      this.dataflowService.getWorkList({dsId : this.dsId}).then((result) => {
        this.isRequested = false;

        this.snapshotList = [];
        if(result['snapshots'] && 0 < result['snapshots'].length) {
          this.snapshotList = result['snapshots'];

          // When snapshot tab is selected
          if (1 === this.tabNumber) {
            this.clearExistingInterval();

            // interval
            if (-1 !== this.pollingContinue(this.snapshotList)) {
              this.interval = setInterval(() => {
                this.getSnapshotList();
              }, 2000)
            }
          }
        }
      }).catch(() => {
        this.clearExistingInterval();
      })
    }

  } // function - getSnapshotList


  /**
   * Change tab
   * @param {number} tab
   */
  public changeTab( tab : number ) {

    this.tabNumber = tab;
    this.isCancelPopupOpen = false;

    if (this.tabNumber === 1) {
      this.getSnapshotList();
    } else {
      this.clearExistingInterval();
    }
  } // function - changeTab


  /**
   * Delete rule event
   * @param {number} idx
   */
  public deleteRule(idx: number) {
    this.deleteEvent.emit(idx);
  }


  /**
   * 중간에 룰을 추가려고 클릭한다면 먼저 클릭한 곳으로 점프
   * @param {Rule} rule
   */
  public insertStep(rule : Rule) {
    this.selectedRuleIdx = undefined;
    this.addRuleEvent.emit(rule['ruleNo']);
  }


  /**
   * When edit button is clicked
   * @param {Rule} rule
   */
  public editRule(rule : Rule) {
    this.selectedRuleIdx = undefined;
    this.editEvent.emit(rule);
  }


  /**
   * REDO or UNDO
   * @param {String} action
   */
  public transformAction(action : string) {
    this.redoUndoEvent.emit(action);
  }


  /**
   * Jump action
   * @param {Number} idx
   */
  public jumpRule(idx : number ) {
    this.ruleList.forEach((rule) =>{
      rule.isEditMode = false;
    });
    this.selectedRuleIdx = idx;
    this.jumpEvent.emit(idx)
  }


  /**
   * 편집 중인 상태 취소
   * @param {Rule} rule
   * @param {Number} idx
   */
  public cancelEditMode( rule : Rule, idx : number ) {
    rule.isEditMode = false;
    this.selectedRuleIdx = idx;
    this.jumpRule(idx);
  }


  /**
   * 중간 룰 추가 상태 취소
   * @param {Rule} rule
   * @param {Number} idx
   */
  public cancelInsertMode( rule : Rule, idx : number ) {
    rule.isInsertStep = false;
    this.selectedRuleIdx = idx;
    this.jumpRule(idx);
  }


  /**
   * 편집/삭제/룰 중간 추가 hover 여부
   * @param {number} index
   * @return {boolean}
   */
  public isDisableHover(index : number) : boolean {

    // Rule list 에서 편집중인 룰이 있는지 확인한다.
    const idx = this.ruleList.findIndex((rule) => {
      return rule.isEditMode;
    });

    if (idx > -1) { // 편집중인 룰이 있다면
      return idx !== index
    } else {
      return false;
    }
  }


  /**
   * Returns snapshot status
   * @param {string} status
   * @return {string[]}
   */
  public getSnapshotStatus(status : string) : string[] {

    let result: any[];
    const progress = ['INITIALIZING','RUNNING','WRITING','TABLE_CREATING','NOT_AVAILABLE'];
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

  /**
   * Navigate to snapshot list
   */
  public goToSnapshotList() {
    this.snapshotListJump.emit();
    this.router.navigate(['/management/datapreparation/datasnapshot']);
  } // function - goToSnapshotList


  /**
   * Open snapshot detail popup
   * @param {PrDataSnapshot} snapshot
   */
  public snapshotDetail(snapshot : PrDataSnapshot) {

    if (snapshot.status === Status.CANCELED || snapshot.isCancel) {
      return;
    }

    this.snapshotList.forEach((item) => {
      item.isCancel = false;
    });
    this.snapshotDetailEvent.emit(snapshot.ssId);
  } // function - snapshotDetail


  /**
   * When snapshot cancel button is clicked from snapshot list
   * @param {PrDataSnapshot} snapshot
   */
  public onSsCancelClick(snapshot: PrDataSnapshot) {

    // Clear all interval
    this.clearExistingInterval();

    // cannot cancel already created snapshot
    if (snapshot.elapsedTime) {
      return;
    } else {

      // Open snapshot cancel confirm popup
      snapshot.isCancel = true;
      this.isCancelPopupOpen = true;
    }
  }


  /**
   * Cancel snapshot
   * @param snapshot {PrDataSnapshot}
   */
  public cancelSnapshotConfirm(snapshot : PrDataSnapshot) {

    const ok : string = 'OK';

    this.snapshotService.cancelSnapshot(snapshot.ssId).then((result) => {
      if (result.result === ok) {

        // Show STATUS in the snapshot list - visible for 2 seconds
        snapshot.status = Status.CANCELED;

        // close snapshot cancel confirm popup
        snapshot.isCancel = false;
        this.isCancelPopupOpen = false;

        // retrieve snapshot list after 2 seconds
        setTimeout(()=> {
          this.getSnapshotList();
        }, 2000);

      } else {
        Alert.warning(this.translateService.instant('msg.dp.alert.snapshot.cancel.fail'));
        this.snapshotList.forEach((item) => {
          item.isCancel = false;
        });
      }


    }).catch((error) => {
      console.log(error);
    })
  } // function - cancelSnapshotConfirm


  /**
   * Close snapshot cancel confirm popup
   * @param {PrDataSnapshot} snapshot
   */
  public closeSsCancelPopup(snapshot? : PrDataSnapshot) {
    if (snapshot) {

      // close snapshot cancel confirm popup
      snapshot.isCancel = false;
      this.isCancelPopupOpen = false;
    }

    // refresh snapshot list
    this.getSnapshotList();
  } // function - refreshSnapshotList

  public getSvgName(snapshot: PrDataSnapshot) {
    const csv: string = 'CSV';
    if (snapshot.ssType === SsType.STAGING_DB) {
      return 'HIVE'
    }

    if (snapshot.storedUri.endsWith('.json')) {
      return 'JSON';
    }

    return csv;
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
