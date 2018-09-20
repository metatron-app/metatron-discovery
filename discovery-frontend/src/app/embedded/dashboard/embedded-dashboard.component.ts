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

import { Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Dashboard } from '../../domain/dashboard/dashboard';
import { AbstractComponent } from '../../common/component/abstract.component';
import { ActivatedRoute } from '@angular/router';
import { CookieConstant } from '../../common/constant/cookie.constant';
import { DashboardService } from '../../dashboard/service/dashboard.service';
import * as $ from "jquery";
import { DashboardComponent } from '../../dashboard/dashboard.component';

@Component({
  selector: 'app-embedded-dashboard',
  templateUrl: './embedded-dashboard.component.html'
})
export class EmbeddedDashboardComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 대시보드 컴포넌트
  @ViewChild(DashboardComponent)
  private dashboardComponent: DashboardComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 선택된 대시보드
  public dashboard: Dashboard;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected dashboardService: DashboardService,
              private activatedRoute: ActivatedRoute,
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

  public ngOnInit() {
    super.ngOnInit();   // Init

    window.history.pushState(null, null, window.location.href);

    this.activatedRoute.params.subscribe((params) => {
      // dashboard 아이디를 넘긴경우에만 실행
      // 로그인 정보 생성
      (params['loginToken']) && (this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN, params['loginToken'], 0, '/'));
      (params['loginType']) && (this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN_TYPE, params['loginType'], 0, '/'));
      (params['refreshToken']) && (this.cookieService.set(CookieConstant.KEY.REFRESH_LOGIN_TOKEN, params['refreshToken'], 0, '/'));
      if (params['dashboardId']) {
        this.getDashboardDetail(params['dashboardId']);
      }
    });

    // this.cookieService.set(CookieConstant.KEY.FORCE_LOGIN, 'FORCE', 0, '/');
  }

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();
  } // function - ngAfterViewInit

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  @HostListener('window:popstate', ['$event'])
  public onPopstate() {
    window.history.pushState(null, null, window.location.href);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 대시보드 detail 조회
  protected getDashboardDetail(dashboardId: string) {
    // 로딩 show
    this.loadingShow();

    this.dashboardService.getDashboard(dashboardId)
      .then((result: Dashboard) => {

        this.dashboard = result;

        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * 대시보드 이벤트 핸들러
   * @param {Event} event
   */
  public onDashboardEvent(event: { name: string, data?: any }) {
    if ('LAYOUT_INITIALISED' === event.name) {
      $('body').removeClass('body-hidden');
      this.dashboardComponent.hideBoardLoading();
    }
  } // function - onDashboardEvent

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
