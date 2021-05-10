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

import {Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {CreateBoardDsNetworkComponent} from './create-board-ds-network.component';
import {CreateBoardCompleteComponent} from './create-board-complete.component';

@Component({
  selector: 'app-create-board',
  templateUrl: './create-board.component.html'
})
export class CreateBoardComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(CreateBoardCompleteComponent)
  private _completeComp: CreateBoardCompleteComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(CreateBoardDsNetworkComponent, {static: true})
  public networkBoardComp: CreateBoardDsNetworkComponent;

  @Input()
  public workbookId: string;

  @Input()
  public workbookName: string;

  @Input()
  public workspaceId: string;

  public isDenyNext: boolean = true;
  public isShowButtons: boolean = true;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              protected broadCaster: EventBroadcaster) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 클래스 초기화
   */
  public ngOnInit() {
    super.ngOnInit();
    this.useUnloadConfirm = true;
  } // function - ngOnInit

  /**
   * 클래스 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 데이터소스 추가 라벨 표시 여부
   * @returns {boolean}
   */
  public get isShowLabelAddDataSource(): boolean {
    return 0 === this.networkBoardComp.getCntDataSources()
  } // get - isShowLabelAddDataSource

  /**
   * 다음 단계로 이동
   */
  public next() {
    if (this.networkBoardComp.isInvalidate()) {
      return;
    }
    const data = this.networkBoardComp.getData();
    this._completeComp.openComp(this.workbookId, this.workbookName, data.boardDataSources, data.relations);
  } // function - next

  /**
   * 컴포넌트 닫기
   */
  public closeComp(isForceClose: boolean = false) {
    if (isForceClose) {
      this.close();
    } else {
      this.unloadConfirmSvc.confirm().subscribe((isClose) => {
        (isClose) && (this.close());
      });
    }
  } // function - closeComp

  /**
   * Next 가능 여부 체크
   * @param {{isDenyNext?: boolean, isShowButtons?: boolean}} data
   */

  public checkAllowNext(data: { isDenyNext?: boolean, isShowButtons?: boolean }) {
    (data.hasOwnProperty('isDenyNext')) && (this.isDenyNext = data.isDenyNext);
    (data.hasOwnProperty('isShowButtons')) && (this.isShowButtons = data.isShowButtons);
    this.safelyDetectChanges();
  } // function - checkAllowNext

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
