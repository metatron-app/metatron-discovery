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

import {Directive, ElementRef, Input} from '@angular/core';
import * as Inputmask from 'inputmask';

@Directive({
  selector: '[input-mask]'
})
export class InputMaskDirective {

  constructor(private el: ElementRef) {
  }

  private regexMap = {
    number: '^[0-9]*$',
    float: '^[+-]?([0-9]*[.])?[0-9]+$',
    words: '([A-z]*\\s)*',
    calendar: '^[0-9:\-\\s]*$'
  };

  @Input('input-mask')
  public set defineInputType(regexType: string) {
    if (regexType === 'number') {
      Inputmask({
        regex: this.regexMap[regexType], placeholder: '', onBeforeMask: (value) => {
          if (value) {
            return value.toString();
          }
          return value;
        }
      })
        .mask(this.el.nativeElement);
    } else {
      Inputmask({regex: this.regexMap[regexType], placeholder: ''})
        .mask(this.el.nativeElement);
    }

  }

}
