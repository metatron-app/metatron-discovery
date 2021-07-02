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

import {Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PopupService} from '@common/service/popup.service';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {CookieConstant} from '@common/constant/cookie.constant';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {WorkbookDetailProjections} from '@domain/workbook/workbook';
import {BoardLayoutType} from '@domain/dashboard/dashboard.globalOptions';
import {BoardConfiguration, Dashboard, PresentationDashboard} from '@domain/dashboard/dashboard';
import {DashboardService} from '../../dashboard/service/dashboard.service';
import {WorkbookService} from '../../workbook/service/workbook.service';
import {DashboardComponent} from '../../dashboard/dashboard.component';

@Component({
  selector: 'presentation-dashboard',
  templateUrl: './presentation-dashboard.component.html'
})
export class PresentationDashboardComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 타이머
  private _timer: any;

  // 대시보드 컴포넌트
  @ViewChild(DashboardComponent, {static: true})
  private _boardComp: DashboardComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public dashboards: PresentationDashboard[];     // 대시보드 목록
  public selectedIdx: number;         // 선택된 순번
  public selectedDashboard: PresentationDashboard;  // 선택된 대시보드 정보

  public isPlayShow: boolean = false;   // 쇼 실행 여부

  // 타이머 관련
  public timerInterval: number[] = [3, 5, 7, 9];
  public isShowIntervalLayer: boolean = false;
  public selectedInterval: number = 3;   // 선택된 타이머 간격

  // Fit to Screen/Height 관련
  public isShowFitLayer: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private _activatedRoute: ActivatedRoute,
              private _workbookService: WorkbookService,
              private _dashboardService: DashboardService,
              private _popupService: PopupService,
              protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 초기 설정
   * 파라메터 조회 및 초기 데이터 조회
   */
  public ngOnInit() {
    super.ngOnInit();

    // 필터 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('CHART_SELECTION_FILTER').subscribe(() => {
        this.toggleShow(false);
      })
    );

    // 필터 위젯 변경
    this.subscriptions.push(
      this.broadCaster.on<any>('CHANGE_FILTER_WIDGET').subscribe(() => {
        this.toggleShow(false);
      })
    );

    const list: Dashboard[] = this._popupService.ptDashboards;
    if (list) {
      // 워크북화면에서 링크로 온 경우
      const initialResult: any[] = this.initializeData(list, this._popupService.ptStartDashboard);
      this.dashboards = initialResult[0];
      this.selectedDashboard = initialResult[1];
      this.selectedIdx = initialResult[2];
    } else {
      // Embedded로 URL을 직접 호출한 경우

      window.history.pushState(null, null, window.location.href);

      this._activatedRoute.params.subscribe((params) => {

        // 로그인 정보 생성
        (params['loginToken']) && (this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN, params['loginToken'], 0, '/'));
        (params['loginType']) && (this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN_TYPE, params['loginType'], 0, '/'));
        (params['refreshToken']) && (this.cookieService.set(CookieConstant.KEY.REFRESH_LOGIN_TOKEN, params['refreshToken'], 0, '/'));

        (this._boardComp) && (this._boardComp.hideError());

        const workbookId: string = params['workbookId'];
        const dashboardId: string = params['dashboardId'];
        this._getWorkbook(workbookId, {key: 'seq', type: 'asc'}).then(dashboards => {
          if (dashboards && 0 < dashboards.length) {
            this._dashboardService.getDashboard(dashboardId ? dashboardId : dashboards[0].id)
              .then((item: Dashboard) => {
                const initialResult: any[] = this.initializeData(dashboards, item as PresentationDashboard);
                this.dashboards = initialResult[0];
                this.selectedDashboard = initialResult[1];
                this.selectedIdx = initialResult[2];
              })
              .catch(() => {
                this._boardComp.showError();
              });
          }
        });
      });
    }
  } // function - ngOnInit

  /**
   * Destory
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  @HostListener('window:popstate')
  public onPopstate() {
    window.history.pushState(null, null, window.location.href);
  }

  /**
   * 대시보드 이벤트 핸들러
   * @param {Event} event
   */
  public onDashboardEvent(event: { name: string, data?: any }) {
    if ('LAYOUT_INITIALISED' === event.name) {
      this._setTimer();
      (this._boardComp) && (this._boardComp.hideBoardLoading());
    } else if ('RELOAD_BOARD' === event.name) {
      (this._timer) && (clearTimeout(this._timer));
      this._timer = null;
      this.moveToDashboard(this.selectedIdx);
    }
  } // function - onDashboardEvent

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 초기 데이터 설정
   * @param {Dashboard[]} list
   * @param {PresentationDashboard} startData
   * @returns {[Dashboard[] , Dashboard , number]}
   */
  private initializeData(list: Dashboard[], startData?: PresentationDashboard): [Dashboard[], Dashboard, number] {
    if (startData) {
      const idx = list.findIndex(board => board.id === startData.id);
      list[idx] = startData;
      return [list, startData, idx];
    } else {
      return [list, list[0], 0];
    }
  } // function - initializeData

  /**
   * 대쉬보드 목록 조회
   * @param {string} workbookId
   * @param {any} order
   * @returns {Promise<any>}
   * @private
   */
  private _getWorkbook(workbookId: string, order: { key: string, type: string }): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this._workbookService.getWorkbook(workbookId).then((result: WorkbookDetailProjections) => {
        let tempList: Dashboard[] = result.dashBoards;
        tempList = tempList.sort((prev: Dashboard, curr: Dashboard) => {
          let sort: number;
          if (prev[order.key] === curr[order.key]) {
            sort = 0;
          } else {
            sort = (prev[order.key] < curr[order.key]) ? -1 : 1;
          }
          ('desc' === order.type) && (sort = sort * -1);
          return sort;
        });
        resolve(tempList);
      }).catch((err) => reject(err));
    });
  } // function - getWorkbook

  /**
   * 타이머를 해제/설정한다.
   * @private
   */
  private _setTimer() {
    (this._timer) && (clearTimeout(this._timer));
    this._timer = null;
    if (this.isPlayShow) {
      this._timer = setTimeout(() => this.nextDashboard(), this.selectedInterval * 1000);
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Fit Screen Type의 Dashboard 인지 체크합니다.
   * @returns {boolean}
   */
  public isFitScreenType(): boolean {
    if (this.selectedDashboard && this.selectedDashboard.configuration.options.layout) {
      return BoardLayoutType.FIT_TO_SCREEN === this.selectedDashboard.configuration.options.layout.layoutType;
    } else {
      return false;
    }
  } // function - isFitScreenType

  /**
   * 대시보드 fit type을 변경한다.
   * @param {MouseEvent} event
   * @param {string} type
   */
  public changeFitType(event: MouseEvent, type: string) {
    event.preventDefault();
    event.stopPropagation();
    const currIdx = this.selectedIdx;
    this.selectedDashboard = null;
    setTimeout(() => {
      const dashboardConfInArray: BoardConfiguration = this.dashboards[currIdx].configuration;
      if ('HEIGHT' === type) {
        dashboardConfInArray.options.layout.layoutType = BoardLayoutType.FIT_TO_HEIGHT;
        let height: number = 900;
        if (-1 === (dashboardConfInArray.layout.dimensions.confHeight + '').indexOf('%')) {
          height = (dashboardConfInArray.layout.dimensions.confHeight as number);
        }
        dashboardConfInArray.layout.dimensions.height = height;
      } else {
        dashboardConfInArray.options.layout.layoutType = BoardLayoutType.FIT_TO_SCREEN;
        dashboardConfInArray.layout.dimensions.height = '100%';
      }
      this.dashboards[currIdx].configuration = dashboardConfInArray;
      if (currIdx === this.selectedIdx) {
        this.selectedDashboard = this.dashboards[currIdx];
      }
      this.isShowFitLayer = false;
    }, 200);
  } // function - changeFitType

  /**
   * 타이머 시간 간격 옵션 펼침
   */
  public openOptionsTimerInterval() {
    if (!this.isPlayShow) {
      this.isShowIntervalLayer = true;
    }
  } // function - openOptionsTimerInterval

  /**
   * 타이머 간격 시간을 설정한다.
   * ( 타이머가 실행중일 때는 기존 타이머를 죽이고 새로운 시간 간격으로 재실행한다. )
   * @param {MouseEvent} event
   * @param {number} interval
   */
  public selectTimerInterval(event: MouseEvent, interval: number) {
    event.preventDefault();
    event.stopPropagation();
    this.isShowIntervalLayer = false;
    this.selectedInterval = interval;
    this._setTimer();
  } // function - selectTimerInterval

  /**
   * 쇼 실행 여부를 변경한다.
   * @param {boolean} isPlay
   */
  public toggleShow(isPlay?: boolean) {
    this.isPlayShow = ('boolean' === typeof isPlay) ? isPlay : !this.isPlayShow;
    this._setTimer();
  } // function - toggleShow

  /**
   * 특정 인덱스의 대시보드로 이동한다.
   * 대시보드 정보가 없을 시에는 불러오고 나서 이동한다.
   * @param {number} idx
   */
  public moveToDashboard(idx: number) {
    this.selectedIdx = idx;
    this.selectedDashboard = null;
    const item: PresentationDashboard = this.dashboards[idx];
    (this._boardComp) && (this._boardComp.hideError());
    if (item.configuration) {
      setTimeout(() => {
        this.selectedDashboard = item;
      }, 200);
    } else {
      this._dashboardService.getDashboard(this.dashboards[idx].id).then((boardItem: PresentationDashboard) => {
        this.dashboards[idx] = boardItem;
        this.selectedDashboard = boardItem;
      }).catch(() => {
        this._boardComp.showError();
      });
    }
  } // function - moveToDashboard

  /**
   * 이전 대시보드로 이동한다.
   * ( 첫 대시보드일 경우 순환 )
   */
  public prevDashboard() {
    if (0 < this.selectedIdx) {
      this.moveToDashboard(this.selectedIdx - 1);
    } else {
      this.moveToDashboard(this.dashboards.length - 1);
    }
  } // function - prevDashboard

  /**
   * 다음 대시보드로 이동한다.
   * ( 마지막 대시보드일 경우 순환 )
   */
  public nextDashboard() {
    if (this.selectedIdx < this.dashboards.length - 1) {
      this.moveToDashboard(this.selectedIdx + 1);
    } else {
      this.moveToDashboard(0);
    }
  } // function - nextDashboard

  /**
   * 화면 종료
   */
  public close() {
    this.location.back();
  } // function - close

}
