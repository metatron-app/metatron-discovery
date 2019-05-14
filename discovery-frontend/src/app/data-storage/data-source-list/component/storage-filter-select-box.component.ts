/*
 *
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

import {Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";

@Component({
  selector: 'storage-filter-select-box',
  templateUrl: 'storage-filter-select-box.component.html',
  host: {
    '(document:click)': 'onClickHost($event)',
  },
})
export class StorageFilterSelectBoxComponent extends AbstractComponent {

  @Output('changedFilter')
  private readonly _changedFilter = new EventEmitter();

  @ViewChild('wrapElement')
  private readonly WRAP_ELEMENT: ElementRef;
  @ViewChild('listElement')
  private readonly LIST_ELEMENT: ElementRef;

  /**
   * Only {label: string, value: any} array
   */
  @Input()
  public readonly filterList;

  @Input()
  public readonly isEnableIcon: boolean;

  @Input()
  public readonly isDisableList: boolean;

  @Input()
  public readonly isOnlyStringList: boolean;

  @Input()
  public readonly isEnableFloating: boolean;

  @Input()
  public selectedFilter: any;

  // select list show/hide flag
  public isListShow: boolean;

  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * 컴포넌트 내부  host 클릭이벤트 처리
   * @param {MouseEvent} event
   */
  public onClickHost(event: MouseEvent) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // close
      this.isListShow = false;
    }
  }

  /**
   * Change filter
   * @param filter
   */
  public onChangedFilter(filter): void {
    // change filter
    this.selectedFilter = filter;
    // event emit
    this._changedFilter.emit(filter);
  }

  /**
   * Change list show
   * @param {MouseEvent} event
   */
  public onChangeListShow(event: MouseEvent): void {
    if (!this.isDisableList) {
      this.isListShow = !this.isListShow;
      // if open list and is enable floating option
      if (this.isListShow && this.isEnableFloating) {
        $(this.LIST_ELEMENT.nativeElement).css({
          'position' : 'fixed',
          'top': $(event.currentTarget).offset().top + 35,
          'left' : $(event.currentTarget).offset().left,
          'width' : $(event.currentTarget).outerWidth()
        });
      }
    }
  }
}
