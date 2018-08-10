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

import { AbstractComponent } from '../../common/component/abstract.component';
import { ElementRef, Injector } from '@angular/core';
import { CommonConstant } from '../../common/constant/common.constant';
import { CookieConstant } from '../../common/constant/cookie.constant';
import { WorkbenchService } from '../service/workbench.service';

export class AbstractWorkbenchComponent extends AbstractComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _subscription: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected workbenchService: WorkbenchService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnDestroy() {
    super.ngOnDestroy();
    (this._subscription) && (CommonConstant.stomp.unsubscribe(this._subscription));     // Socket 응답 해제
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 웹소켓 체크
   * @param {Function} callback
   */
  public webSocketCheck(callback?: Function) {
    this.checkAndConnectWebSocket(true).then(() => {
      try {
        this._createWebSocket(callback);
      } catch (e) {
        console.log(e);
      }
      WorkbenchService.websocketId = CommonConstant.websocketId;
    });
  } // function - webSocketCheck

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 워크벤치 웹 소켓 생성
   * @param {Function} callback
   * @private
   */
  private _createWebSocket(callback?: Function): void {
    // 웹소켓 아이디
    WorkbenchService.websocketId = CommonConstant.websocketId;
    try {
      console.info('this.websocketId', WorkbenchService.websocketId);
      const headers: any = {
        'X-AUTH-TOKEN': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
      };
      // 메세지 수신
      (this._subscription) && (CommonConstant.stomp.unsubscribe(this._subscription));     // Socket 응답 해제
      this._subscription
        = CommonConstant.stomp.subscribe('/user/queue/workbench/' + WorkbenchService.workbenchId, (data) => {
          if (data['connected'] === true) {
            console.info('connected');
          }
          (callback) && (callback.call(this));
        }, headers);
      // 메세지 발신
      const params = {
        username: WorkbenchService.webSocketLoginId || '',
        password: WorkbenchService.webSocketLoginPw || ''
      };
      CommonConstant.stomp.send('/message/workbench/' + WorkbenchService.workbenchId + '/dataconnections/' + WorkbenchService.workbench.dataConnection.id + '/connect', params, headers);
    } catch (e) {
      console.info(e);
    }
  } // function - createWebSocket
}
