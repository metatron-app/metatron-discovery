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
import {AfterViewInit, Component, ElementRef, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {TextWidget} from '@domain/dashboard/widget/text-widget';

import {AbstractWidgetComponent} from '../abstract-widget.component';

@Component({
  selector: 'text-widget',
  templateUrl: './text-widget.component.html',
  styleUrls: ['./text-widget.component.css']
})
export class TextWidgetComponent extends AbstractWidgetComponent<TextWidget> implements OnInit, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public widget: TextWidget;

  public isMaximize = false;                // 최대 여부

  @Input('widget')
  set setWidget(widget: TextWidget) {
    this.widget = widget;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(public sanitizer: DomSanitizer,
              protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(broadCaster, elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
    this.processStart();
    this.processEnd();
  }

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();
    setTimeout(() => {
      this._setIsVisibleScrollbar();    // 스크롤바 표시 여부 설정
      this.safelyDetectChanges();
    }, 1000);
  }

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
   * 위젯 설정 변경
   * @param {any} objConfig
   */
  public setConfiguration(objConfig: any) {
    this.widget.configuration = objConfig;
  } // function - setConfiguration

  /**
   * 위젯 사이즈 전환
   */
  public toggleWidgetSize() {
    this.isMaximize = !this.isMaximize;
    this.broadCaster.broadcast('TOGGLE_SIZE', {widgetId: this.widget.id});
  } // function - toggleWidgetSize

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Editor Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 스크롤바 표시 여부를 설정한다.
   */
  private _setIsVisibleScrollbar() {
    const $container: JQuery = $(this.elementRef.nativeElement).find('.ddp-view-widget');
    const $contents: JQuery = $container.children();
    this.isVisibleScrollbar = ($container.height() < $contents.height());
    this.safelyDetectChanges();
  } // function - _setIsVisibleScrollbar

}
