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

import * as $ from 'jquery';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AbstractComponent} from '@common/component/abstract.component';
import {CookieConstant} from '@common/constant/cookie.constant';
import {Filter} from '@domain/workbook/configurations/filter/filter';
import {Dashboard} from '@domain/dashboard/dashboard';
import {FilterWidgetConfiguration} from '@domain/dashboard/widget/filter-widget';
import {FilterUtil} from '../../dashboard/util/filter.util';
import {DashboardService} from '../../dashboard/service/dashboard.service';
import {DashboardComponent} from '../../dashboard/dashboard.component';
import {map} from 'rxjs/operators';
import {combineLatest} from 'rxjs';

@Component({
  selector: 'app-embedded-dashboard',
  templateUrl: './embedded-dashboard.component.html'
})
export class EmbeddedDashboardComponent extends AbstractComponent implements OnInit, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 대시보드 컴포넌트
  @ViewChild(DashboardComponent, {static: true})
  private _boardComp: DashboardComponent;

  private _boardId: string;

  private _preFilters: { [key: string]: string } = {};
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 선택된 대시보드
  public dashboard: Dashboard;

  // 임베디드 대시보드 상단바 유무
  public isShowSelectionFilter: boolean = true;
  // 임베디드 자동 업데이트 유무
  public isShowAutoOn: boolean = true;

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

    combineLatest([this.activatedRoute.params, this.activatedRoute.queryParams, this.activatedRoute.fragment,])
      .pipe(
        map( result => ({queryParam: result[0], queryParams:result[1], fragment:result[2]}))
      ).subscribe(result => {
      this._preFilters = {};
      const params = result.queryParam;
      let fragment = result.fragment;
      let queryParams = {};
      if(fragment && fragment.includes('?')){
        // fragment에서 dashboardId 와 queryParams 추출
        const paramsArr = fragment.slice(fragment.indexOf('?')+1).split('&');
        paramsArr.forEach(param => {
          const paramArr = param.split('=');
          queryParams[paramArr[0]] = paramArr[1];
        });
        fragment = fragment.slice(0,fragment.indexOf('?')); // dashboardId
      }else{
        queryParams = result.queryParams;
      }

      // 사전 필터 목록 등록
      Object.keys(queryParams).forEach(key => {
        if( 'selectionFilter' !== key && 'autoOn' !== key && 'loginToken' !== key && 'loginType' !== key && 'refreshToken' !== key && 'dashboardId' !== key ) {
          this._preFilters[key] = queryParams[key];
        }
      });

      if(!this.isNullOrUndefined(queryParams['selectionFilter'])){
        this.isShowSelectionFilter = (queryParams['selectionFilter'] == 'true');
      }
      if(!this.isNullOrUndefined(queryParams['autoOn'])){
        this.isShowAutoOn = (queryParams['autoOn'] == 'true');
      }
      // console.log('SelectionFilter: ' + this.isShowSelectionFilter);
      // console.log('ShowAutonOn: ' + this.isShowAutoOn);

      // dashboard 아이디를 넘긴경우에만 실행
      // 로그인 정보 생성s
      (params['loginToken']) && (this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN, params['loginToken'], 0, '/'));
      (params['loginType']) && (this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN_TYPE, params['loginType'], 0, '/'));
      (params['refreshToken']) && (this.cookieService.set(CookieConstant.KEY.REFRESH_LOGIN_TOKEN, params['refreshToken'], 0, '/'));

      if (params['dashboardId']) {
        // console.log( '>>>>>>>> dashboardId', params['dashboardId'] );
        this._boardId = params['dashboardId'];
        this.getDashboardDetail(params['dashboardId']);
      } else if (fragment) {
        // console.log( '>>>>>>>> fragment', params['fragment'] );
        this._boardId = fragment;
        this.getDashboardDetail(fragment);
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

  // @HostListener('window:popstate')
  // public onPopstate() {
  //   window.history.pushState(null, null, window.location.href);
  // }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 대시보드 detail 조회
  protected getDashboardDetail(dashboardId: string) {
    // 로딩 show
    this.loadingShow();
    this._boardComp.hideError();

    this.dashboardService.getDashboard(dashboardId)
      .then((result: Dashboard) => {

        this._setParameterFilterValues(result);
        this.dashboard = result;

        // 로딩 hide
        this.loadingHide();
      })
      .catch(() => {
        this._boardComp.showError();
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
      this._boardComp.hideBoardLoading();
    } else if ('RELOAD_BOARD' === event.name) {
      this.getDashboardDetail(this._boardId);
    }
  } // function - onDashboardEvent

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Query Parameter에서 받은 값을 이용하여 dashboard의 filter초기 값을 설정한다.
   * @param dashboard
   */
  private _setParameterFilterValues(dashboard) {
    Object.keys(this._preFilters).forEach(key => {
      dashboard.configuration.filters.forEach((eachFilter: Filter) => {
        if (eachFilter.field && eachFilter.field.toLowerCase() === key.toLowerCase()) {
          FilterUtil.setParameterFilterValue(eachFilter, key, this._preFilters[key]);
        }
      });
      dashboard.widgets.forEach((widget) => {
        if (widget.type === 'filter') {
          const widgetConf: FilterWidgetConfiguration = widget.configuration as FilterWidgetConfiguration;
          if(
            ( widgetConf.filter.field && widgetConf.filter.field.toLowerCase() === key.toLowerCase() )
            || widget.name.toLowerCase() === key.toLowerCase()
          ) {
            FilterUtil.setParameterFilterValue(widgetConf.filter, key, this._preFilters[key]);
          }
        }
      })
    })
  }


}
