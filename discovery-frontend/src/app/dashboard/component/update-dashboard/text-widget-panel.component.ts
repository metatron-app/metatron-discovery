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

import {
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  KeyValueDiffers,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

import {AbstractComponent} from '@common/component/abstract.component';

import {Widget} from '@domain/dashboard/widget/widget';
import {TextWidget} from '@domain/dashboard/widget/text-widget';
import {Dashboard} from '@domain/dashboard/dashboard';

import {DashboardUtil} from '../../util/dashboard.util';
import {DashboardWidgetComponent} from '../dashboard-layout/dashboard.widget.component';

@Component({
  selector: 'text-widgets-panel',
  templateUrl: './text-widget-panel.component.html'
})
export class TextWidgetPanelComponent extends AbstractComponent implements OnInit, OnDestroy, DoCheck {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _differ: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 선택된 위젯 정보
  public selectedTextWidget: TextWidget;

  // 텍스트 에디터 표시 여부
  public showTextEditor: boolean = false;

  public widgets: TextWidget[] = [];
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Input&Output Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input()
  public dashboard: Dashboard;

  @Input()
  public widgetCompsInLayout: DashboardWidgetComponent[] = [];

  @Output()
  public invokeEvent = new EventEmitter<{ elm: ElementRef, widget: TextWidget }>();     // 목록 생성 이벤트

  @Output()
  public changeEvent = new EventEmitter<{ name: string, widget: TextWidget }>();  // 위젯 변경 이벤트

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private differs: KeyValueDiffers,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
    this._differ = this.differs.find({}).create();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * Input 값 변경 체크
   */
  public ngDoCheck() {
    if (this._differ.diff(this.dashboard)) {
      this.widgets = DashboardUtil.getTextWidgets(this.dashboard);
    }
  } // function - ngDoCheck

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   *
   * @param {Widget} widget
   * @return {boolean}
   */
  public isInLayout(widget: Widget): boolean {
    return -1 < this.widgetCompsInLayout.findIndex(item => item.getWidgetId() === widget.id);
  } // function - isInLayout

  /**
   * 위젯 내용 반환
   * @param {Widget} widget
   * @return {string}
   */
  public getWidgetContents(widget: Widget): string {
    if (widget) {
      let strContents: string = widget.configuration['contents'];
      strContents = strContents.replace(/&(lt|gt);/g, (_strMatch, p1) => {
        return (p1 === 'lt') ? '<' : '>';
      });
      return strContents.replace(/<\/?[^>]+(>|$)/g, '');
    } else {
      return '';
    }
  } // function - getWidgetContents

  /**
   * 위젯 드래그 설정
   * @param {ElementRef} elm : 대상 ElementRef
   * @param {TextWidget} item : 아이템 정보
   */
  public setDragWidget(elm: ElementRef, item: TextWidget) {
    this.invokeEvent.emit({elm: elm.nativeElement, widget: item});
  } // function - setDragWidget

  /**
   * 위젯 생성
   */
  public addWidget() {
    this.selectedTextWidget = null;
    this.showTextEditor = true;
  } // function - addWidget

  /**
   * 위젯 수정
   * @param {Widget} item
   */
  public modifyWidget(item: Widget) {
    this.selectedTextWidget = item as TextWidget;
    this.showTextEditor = true;
  } // function - modifyWidget

  /**
   * 위젯 삭제
   * @param {TextWidget} item
   */
  public deleteWidget(item: TextWidget) {
    this.changeEvent.emit({name: 'DELETE', widget: item});
  } // function - deleteWidget

  /**
   * 텍스트 위젯을 설정함
   * @param {any} event
   */
  public setTextWidget(event: { name: string, widget: TextWidget }) {
    this.changeEvent.emit(event);
    this.showTextEditor = false;
  } // function - setTextWidget

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
