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

import {ChangeDetectionStrategy, Component, ElementRef, Injector, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AbstractComponent} from '@common/component/abstract.component';
import {Widget} from '@domain/dashboard/widget/widget';
import {LayoutMode, LayoutWidgetInfo} from '@domain/dashboard/dashboard';
import {BoardWidgetOptions} from '@domain/dashboard/dashboard.globalOptions';

@Component({
  selector: 'dashboard-widget',
  templateUrl: './dashboard.widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardWidgetComponent extends AbstractComponent implements OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | ViewChild Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private _widget: Widget;

  private _widgetOpts: BoardWidgetOptions;

  private _layoutMode: LayoutMode;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public isWidget: boolean = false;

  public isTextWidget: boolean = false;
  public isPageWidget: boolean = false;
  public isFilterWidget: boolean = false;

  public isShowTitle: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected activatedRoute: ActivatedRoute,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 클래스 초기화
   */
  public init(widget: Widget, widgetOpts: BoardWidgetOptions, layoutMode: LayoutMode, widgetInfo: LayoutWidgetInfo) {
    super.ngOnInit();
    this._widget = widget;
    this._widgetOpts = widgetOpts;
    this._layoutMode = layoutMode;
    switch (widget.type) {
      case 'page' :
        this.isPageWidget = true;
        break;
      case 'text' :
        this.isTextWidget = true;
        break;
      case 'filter' :
        this.isFilterWidget = true;
        break;
    }
    this.isWidget = true;
    (widgetInfo) && (this.isShowTitle = widgetInfo.title);
    this.safelyDetectChanges();
  } // function - init

  /**
   * 위젯 아이디를 반환한다.
   * @returns {string}
   */
  public getWidgetId(): string {
    return this._widget.id;
  } // function - getWidgetId

  /**
   * 위젯 객체 반환
   * @returns {Widget}
   */
  public getWidget(): Widget {
    return this._widget;
  } // function - getWidget

  /**
   * 대시보드내 차트 옵션 정보 반환
   * @returns {BoardWidgetOptions}
   */
  public getBoardWidgetOpts(): BoardWidgetOptions {
    return this._widgetOpts;
  } // function - getBoardWidgetOpts

  /**
   * 레이아웃 모드 반환
   * @return {LayoutMode}
   */
  public getLayoutMode(): LayoutMode {
    return this._layoutMode;
  } // function - getLayoutMode

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
