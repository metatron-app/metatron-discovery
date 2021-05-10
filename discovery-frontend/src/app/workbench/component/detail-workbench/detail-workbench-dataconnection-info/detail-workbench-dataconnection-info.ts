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
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';
import {Dataconnection} from '@domain/dataconnection/dataconnection';
import {StringUtil} from '@common/util/string.util';

@Component({
  selector: 'detail-workbench-dataconnection-info',
  templateUrl: './detail-workbench-dataconnection-info.html'
})
export class DetailWorkbenchDataconnectionInfoComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public dataconnection: Dataconnection;

  @Output()
  public showLayer: EventEmitter<string> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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

  public ngOnInit(): void {
    console.log('dataconnection', this.dataconnection);
    // 권한 정보가 없을 경우
    if (this.isNullOrUndefined(this.dataconnection.authenticationType)) {
      this.dataconnection.authenticationType = 'MANUAL';
    }
  }

  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 컴포넌트 내부  host 클릭이벤트 처리
  @HostListener('document:click', ['$event'])
  public onClickHost(event) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // 팝업창 닫기
      this.showLayer.emit('dataconnection-info-close');
    }
  }

  /**
   * 커넥션이 Default 타입이라면
   * @returns {boolean}
   */
  public isDefaultType(): boolean {
    return StringUtil.isEmpty(this.dataconnection.url);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
