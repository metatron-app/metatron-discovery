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

import {
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { AbstractComponent } from '../../../../../common/component/abstract.component';
import { DataflowService } from '../../../service/dataflow.service';
import { RuleSnapshotListComponent } from './rule-snapshot-list.component';
import { DataSnapshot } from '../../../../../domain/data-preparation/data-snapshot';
import { isNullOrUndefined, isUndefined } from 'util';

@Component({
  selector: 'app-rule-list',
  templateUrl: './rule-list.component.html',
})
export class RuleListComponent extends AbstractComponent implements OnInit, OnDestroy{

  @Output()
  private snapshotDetailEvent = new EventEmitter();
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Rule Lists
  @Input()
  public ruleList: any[] = [];

  // Jumping to selected index
  @Output()
  public jumpEvent = new EventEmitter();

  @Output()
  public undoEvent = new EventEmitter();

  @Output()
  public redoEvent = new EventEmitter();

  @Output()
  public editEvent = new EventEmitter();

  @Output()
  public deleteEvent = new EventEmitter();

  @Input()
  public redoable: boolean = false;
  @Input()
  public undoable: boolean = false;

  public tabNumber : number = 0;

  public dsId : string;

  public snapshotList : DataSnapshot[];

  public interval : any;

  @ViewChild(RuleSnapshotListComponent)
  public ruleSnapshotListComponent : RuleSnapshotListComponent;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              protected dataflowService : DataflowService) {
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
    clearInterval(this.interval);
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 화면 오픈 및 데이터 셋 아이디 전달
   * @param {string} dsId
   */
  public init(dsId : string) {
    this.dsId = dsId;
    this.getSnapshotList(this.dsId);
  } // function - init

  /**
   * 스냅샷 1초 차이로 불러오기
   * @param dsId
   */
  public getSnapshotWithInterval(dsId) {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.getSnapshotList(dsId);
    },1000)
  } // function - getSnapshotWithInterval

/**
   * 스냅샷 리스트에서 아직 준비중인 스냅샷이 있는지 확인
   * @param list
   * @return {number} interval을 stop 하려면 -1을 리턴한다.
   */
  public pollingContinue(list) : number {
    let statusList = ['INITIALIZING','RUNNING','WRITING','TABLE_CREATING','NOT_AVAILABLE'];
    return list.findIndex((item) => {
      return -1 !== statusList.indexOf(item.status)
    });
  } // function - pollingContinue

  /**
   * 스냅샷 리스트 호출
   * @param {string} dsId
   * @param {boolean} withAll
   */
  public getSnapshotList(dsId : string) {
    let params = {dsId : dsId};
    this.dataflowService.getWorkList(params).then((result) => {
      if(result['snapshots'] && 0 < result['snapshots'].length ) {
        this.snapshotList = result['snapshots'];
        if (!isUndefined(this.ruleSnapshotListComponent)) { // 현재 탭이 snapshot list 아닐 때 을 하면 에러..
          if (-1 === this.pollingContinue(this.snapshotList)) {
            clearInterval(this.interval);
          }
          this.ruleSnapshotListComponent.init(this.snapshotList);
        }
      } else {
        this.snapshotList = result['snapshots'];
        if (!isNullOrUndefined(this.ruleSnapshotListComponent)) {
          this.ruleSnapshotListComponent.init(this.snapshotList);
        }
        clearInterval(this.interval);
      }
    }).catch((error) => {
      console.info(error);
    })

  } // function - getSnapshotList

  /**
   * Clear interval
   */
  public clearSnapshotInterval() {
    clearInterval(this.interval);
  } // function - clearInterval

  /**
   * Tab click 시
   * @param {number} tab
   */
  public changeTab( tab : number ) {
    this.tabNumber = tab;
    if (this.tabNumber === 1) {
      this.safelyDetectChanges();
      this.getSnapshotList(this.dsId);
      this.getSnapshotWithInterval(this.dsId);
    } else {
      clearInterval(this.interval);
    }
  } // function - changeTab

  /**
   * Open snapshot detail popup
   * @param data
   */
  public snapshotDetail(data) {
    this.snapshotDetailEvent.emit(data);
  } // function - snapshotDetail

  public setCanceledStatus(ssId) {
    this.snapshotList.forEach((item) => {
      if (item.ssId === ssId) {
          item.status = 'Canceled';
      }
    })
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
