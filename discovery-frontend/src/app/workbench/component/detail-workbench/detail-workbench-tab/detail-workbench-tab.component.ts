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
  Component, ElementRef, EventEmitter, HostListener, Injector, Input, OnChanges, OnDestroy, OnInit,
  Output
} from '@angular/core';
import { AbstractComponent } from  '@common/component/abstract.component';
import { isUndefined } from 'util';

@Component({
  selector: 'app-workbench-tab',
  templateUrl: './detail-workbench-tab.component.html'
})
export class DetailWorkbenchTabComponent extends AbstractComponent implements OnInit, OnDestroy, OnChanges {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public position: any;

  @Output()
  public showLayer: EventEmitter<string> = new EventEmitter();

  public tabLayerX: string;

  public tabLayerY: string;



  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
  }

  public ngOnChanges() {
    if (!isUndefined(this.position)) {
      this.tabLayerY = this.position.x.toString();
      this.tabLayerX = this.position.y.toString();
    }
  }
  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public init() {

  }

  // 수정 처리
  public modify() {
    this.showLayer.emit('detail-workbench-tab-modify');
  }

  // 삭제 처리
  public delete() {
    this.showLayer.emit('detail-workbench-tab-delete');
  }

  // 컴포넌트 내부  host 클릭이벤트 처리
  @HostListener('document:click', ['$event'])
  public onClickHost(event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // 팝업창 닫기
      this.showLayer.emit('detail-workbench-tab-close');
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/



  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
