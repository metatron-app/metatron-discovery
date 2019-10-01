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
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {Engine} from '../../../domain/engine-monitoring/engine';
import {StateService} from '../../service/state.service';

@Component({
  selector: '[header-menu]',
  templateUrl: './header-menu.component.html',
  host: { '[class.ddp-top-menu]': 'true' }
})
export class HeaderMenuComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  public readonly content: Engine.Content;

  public readonly CONTENT_TYPE = Engine.ContentType;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private stateService: StateService) {
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

  public changeTab(next: Engine.ContentType) {
    this.stateService.changeTab(this.content, next);
  }
}
