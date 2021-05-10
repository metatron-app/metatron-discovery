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

import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';

@Component({
  selector: 'app-join-complete',
  templateUrl: './join-complete.component.html',
})
export class JoinCompleteComponent extends AbstractComponent implements OnInit, OnDestroy {

  public isShow = false;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  // 상위 컴포넌트로 완료 이벤트 전파
  @Output()
  public joinCompleteConfirm = new EventEmitter();

  ngOnInit() {
    super.ngOnInit();
  }

  // Init
  public init() {
    this.isShow = true;
  }

  // close
  public close() {
    this.isShow = false;
    this.joinCompleteConfirm.emit();
  }

  ngOnDestroy() {
    this.isShow = false;
    super.ngOnDestroy();

  }
}
