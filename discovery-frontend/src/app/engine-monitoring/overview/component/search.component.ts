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
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {Key} from '../../../domain/common/key';

@Component({
  selector: 'overview-search',
  templateUrl: './search.component.html'
})
export class SearchComponent extends AbstractComponent implements OnInit, OnDestroy {

  @ViewChild('inputElement')
  private inputElement: ElementRef;

  @Input()
  public keyword: string;

  @Input()
  public placeholder: string = '';

  @Input()
  public isTrim: boolean = true;

  @Output('changeValue')
  public changeEvent: EventEmitter<string> = new EventEmitter();

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    super.ngOnInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public blurHandler() {
    this.setValue();
  }

  public keyupEnterHandler(event: KeyboardEvent) {
    if (Key.Util.isEnter(event.keyCode)) {
      this.setValue();
    }
  }

  public keyupEscapeHandler(event: KeyboardEvent) {
    if (Key.Util.isEscape(event.keyCode)) {
      this.resetKeyword();
    }
  }

  public isNotEmptyInput(): boolean {
    if (this.inputElement) {
      return '' !== this.inputElement.nativeElement.value;
    } else {
      return false;
    }
  }

  private resetKeyword() {
    this.inputElement.nativeElement.value = this.keyword;
  }

  private setValue() {
    let inputValue = this.inputElement.nativeElement.value;
    inputValue = inputValue ? ((this.isTrim) ? inputValue.trim() : inputValue) : '';
    if (inputValue !== this.keyword) {
      this.keyword = inputValue;
      this.changeEvent.emit(this.keyword);
    }
  }

  public clearValue() {
    this.inputElement.nativeElement.value = '';
    this.keyword = '';
    this.changeEvent.emit(this.keyword);
  }
}
