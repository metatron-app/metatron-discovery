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

import { Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractComponent } from '../../abstract.component';
import { Modal } from '../../../domain/modal';

@Component({
  selector: 'component-confirm-ref',
  templateUrl: 'confirm-ref.component.html'
})
export class ConfirmRefModalComponent extends AbstractComponent {

  // 모달 구성데이터
  modal: Modal;

  // 변경 이벤트
  @Output() readonly cancelEvent =  new EventEmitter();
  @Output() readonly confirmEvent =  new EventEmitter();

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  init(modal: Modal) {
    this.modal = modal;
  }

  closePopup() {
    this.cancelEvent.emit();
  }

  done() {
    this.confirmEvent.emit(this.modal);
  }
}
