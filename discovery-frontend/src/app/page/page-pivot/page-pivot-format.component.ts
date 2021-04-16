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

import {AfterViewInit, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit} from '@angular/core';
import {AbstractFormatItemComponent} from '../chart-style/format/abstract-format-item.component';

@Component({
  selector: '[page-pivot-format]',
  templateUrl: './page-pivot-format.component.html'
})
export class PagePivotFormatComponent extends AbstractFormatItemComponent implements OnInit, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
    this._setPositionTypeSettingLayer();
  }

  /**
   * Window resize
   * @param _event
   */
  @HostListener('window:resize', ['$event'])
  public onResize(_event) {
    this._setPositionTypeSettingLayer();
  }

  /**
   * 포맷 클리어
   */
  public clearFormat(): void {
    this.format = {};
    // Dispatch Event
    this.changeEvent.emit(undefined);
  } // func - clearFormat

  /**
   * 그리드 포맷 설정 레이어 위치
   * @private
   */
  private _setPositionTypeSettingLayer() {
    const docHeight = document.body.clientHeight;
    // 745 - 레이어가 정상적으로 표시되는 최소 사이즈
    if (745 > docHeight) {
      const diffHeight = 745 - docHeight;
      this.elementRef.nativeElement.style.top = (-1 * (20 + diffHeight)) + 'px';
    } else {
      this.elementRef.nativeElement.style.top = '-20px';
    }
  } // func - _setPositionTypeSettingLayer
}
