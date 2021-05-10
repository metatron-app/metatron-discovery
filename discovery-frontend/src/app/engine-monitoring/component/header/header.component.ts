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

import {AfterViewInit, Component, ElementRef, HostBinding, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {Engine} from '@domain/engine-monitoring/engine';
import {AbstractComponent} from '@common/component/abstract.component';

@Component({
  selector: '[header]',
  templateUrl: './header.component.html'
})
export class HeaderComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  @HostBinding('class')
  public hostClass: string = 'ddp-layout-top-menu ddp-clear';

  @Input()
  public readonly content: Engine.Content;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    super.ngOnInit();
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }
}
