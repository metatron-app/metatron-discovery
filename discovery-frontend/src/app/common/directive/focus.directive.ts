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

import {Directive, ElementRef, Inject, Input, OnChanges} from '@angular/core';

@Directive({
  selector: '[focus]'
})
export class FocusDirective implements OnChanges {
  @Input() focus: boolean;

  constructor(@Inject(ElementRef) private element: ElementRef) {
  }

  public ngOnChanges() {
    this.element.nativeElement.focus();
  }
}
