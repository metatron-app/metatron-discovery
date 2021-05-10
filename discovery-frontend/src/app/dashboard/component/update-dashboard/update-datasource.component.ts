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

import * as _ from 'lodash';
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {Modal} from '@common/domain/modal';
import {CommonUtil} from '@common/util/common.util';

import {Dashboard} from '@domain/dashboard/dashboard';

import {DashboardUtil} from '../../util/dashboard.util';
import {CreateBoardDsNetworkComponent} from '../create-dashboard/create-board-ds-network.component';

@Component({
  selector: 'app-update-datasource',
  templateUrl: './update-datasource.component.html'
})
export class UpdateDatasourceComponent extends AbstractPopupComponent implements OnInit, OnChanges, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(CreateBoardDsNetworkComponent)
  public networkBoardComp: CreateBoardDsNetworkComponent;

  @Input()
  public workbookId: string;

  @Input()
  public workbookName: string;

  @Input()
  public workspaceId: string;

  @Input('dashboard')
  public inputDashboard: Dashboard;

  @Output('done')
  public onDoneEvent: EventEmitter<Dashboard> = new EventEmitter();

  public isDenyDone: boolean = false;
  public dashboard: Dashboard;

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
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const dashboardChanges: SimpleChange = changes.inputDashboard;
    if (dashboardChanges.firstChange) {
      this.dashboard = _.cloneDeep(dashboardChanges.currentValue);
    }
  } // function - ngOnChanges

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
   * 저장
   */
  public save() {
    if (this.networkBoardComp.isInvalidate()) {
      return;
    }

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.board.update-datasource.confirm.title');
    modal.description = this.translateService.instant('msg.board.update-datasource.confirm.desc');
    modal.afterConfirm = () => {
      const data = this.networkBoardComp.getData();

      // 데이터소스 & 연관관계 설정
      this.dashboard = DashboardUtil.setDataSourceAndRelations(this.dashboard, data.boardDataSources, data.relations);
      this.dashboard.configuration.dataSource = this.dashboard.dataSource;
      this.dashboard.dataSources = data.dataSources.map(ds => {
        // 대시보드에 데이터소스를 add 할 수 있다는 건 이미 valid 하다는 것을 의미
        ds.valid = true;
        return ds;
      });

      this.onDoneEvent.emit(this.dashboard);
    };
    CommonUtil.confirm(modal);
  } // function - save

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
   * Done 완료 가능 여부 체크
   * @param data - { isDenyNext?: boolean, isShowButtons?: boolean }
   */
  public checkAllowDone(data: { isDenyNext?: boolean, isShowButtons?: boolean }) {
    (data.hasOwnProperty('isDenyNext')) && (this.isDenyDone = data.isDenyNext);
    this.safelyDetectChanges();
  } // function - checkAllowDone

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
