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

import { Component, ElementRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { AbstractComponent } from '../../../common/component/abstract.component';
import { EventBroadcaster } from '../../../common/event/event.broadcaster';
import {Alert} from "../../../common/util/alert.util";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
})
export class LayoutComponent extends AbstractComponent implements OnInit, OnDestroy {

  constructor(private broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected  injector: Injector) {
    super(elementRef, injector);
  }

  ngOnInit() {
    super.ngOnInit();

    // Alert 에서 번역이 필요한 부분 세팅
    this._setAlertTranslateMsg();
  }

  ngAfterViewInit() {
    this.broadCaster.broadcast('ENTER_LAYOUT_MODULE');
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * 얼럿창에서 번역이 필요한 부분 세팅
   * @private
   */
  private _setAlertTranslateMsg() {
    Alert.ERROR_NAME = this.translateService.instant('msg.comm.alert.error.msg');
    Alert.MORE_BTN_DESC = this.translateService.instant('msg.comm.alert.error.btn');
    Alert.CLOSE_BTN = this.translateService.instant('msg.comm.btn.close');
  }

}

