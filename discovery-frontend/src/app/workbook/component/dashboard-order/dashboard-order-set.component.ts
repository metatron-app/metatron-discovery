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

import { AbstractComponent } from '../../../common/component/abstract.component';
import { Component, ElementRef, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { Dashboard } from '../../../domain/dashboard/dashboard';
import { Alert } from '../../../common/util/alert.util';
import { WorkbookService } from '../../service/workbook.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-dashboard-order',
  templateUrl: './dashboard-order-set.component.html'
})
export class DashboardOrderSetComponent extends AbstractComponent {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 대시보드 리스트 원본
  private originDashboards: Dashboard[];

  // 워크북 아이디
  private workbookId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 대시보드 리스트
  public dashboards: Dashboard[];

  // 팝업 플래그
  public isShow: boolean = false;

  // 워크스페이스 열람자 여부
  public isWorkspaceViewer: boolean = false;

  @Output()
  public updateComplete = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private workbookService: WorkbookService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // init
  public init(workbookId: string, dashboards: Dashboard[], isWorkspaceViewer: boolean) {
    // 초기화
    this.reset();
    // 대시보드 리스트
    this.originDashboards = dashboards;
    // 변경될 대시보드 리스트
    this.dashboards = _.cloneDeep(dashboards);
    // 워크북 아이디
    this.workbookId = workbookId;
    // 워크스페이스 열람자 여부
    this.isWorkspaceViewer = isWorkspaceViewer;
    // 팝업 열기
    this.isShow = true;
  }

  // 이미지 로드
  public getUserImage(item) {
    if (item.hasOwnProperty('imageUrl')) {
      return '/api/images/load/url?url=' + item.imageUrl + '/thumbnail';
    }

    return '/assets/images/@chart_bar.png';
  }


  // 정렬 순서 변경
  public changeOrder() {

    let firstSeq;
    for (let i = 0; i < this.originDashboards.length; i += 1) {
      if (this.dashboards[i].update || this.originDashboards[i].id !== this.dashboards[i].id) {
        firstSeq = i;
        break;
      }
    }

    let lastSeq;
    for (let i = 0; i < this.originDashboards.length; i += 1) {
      if (this.dashboards[i].update || this.originDashboards[i].id !== this.dashboards[i].id) {
        lastSeq = i;
      }
    }

    // 변경사항 있을 때만 변경 호출
    if (firstSeq !== undefined && lastSeq !== undefined) {

      // 로딩 show
      this.loadingShow();

      // 요청할 대시보드 리스트
      const params = [];
      lastSeq += 1;
      this.dashboards
        .slice(firstSeq, lastSeq)
        .forEach((item) => {
          params.push({
            op: 'REPLACE',
            hiding: item.hiding,
            id: item.id,
            seq: firstSeq
          });

          firstSeq += 1;
        });

      // 순서 변경
      this.workbookService.setDashboardSort(this.workbookId, params)
        .then(() => {
          // 성공 알림
          Alert.success(this.translateService.instant('msg.board.alert.dashboard.sort.success'));
          // 로딩 hide
          this.loadingHide();
          // 팝업 닫기
          this.isShow = false;
          this.updateComplete.emit();
        })
        .catch(() => {
          // 성공 알림
          Alert.error(this.translateService.instant('msg.board.alert.dashboard.sort.fail'));
          // 로딩 hide
          this.loadingHide();
        });
    } else {
      Alert.success(this.translateService.instant('msg.board.alert.dashboard.sort.success'));
      this.isShow = false;
    }
  }

  // 변경사항 여부
  public checkHiding(dashboard: Dashboard) {

    dashboard.hiding = !dashboard.hiding;

    dashboard.update = true;
  }

  // 대시보드 리스트
  public get showListCount(): string {
    return '' + this.dashboards.filter(ds => ds.hiding === false).length;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 초기화
  private reset() {
    this.dashboards = [];
    this.originDashboards = [];
    this.workbookId = '';
  }
}
