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
import { Component, ElementRef, Injector, Input } from '@angular/core';
import { BaseOptionComponent } from '../base-option.component';
import { Pivot } from '../../../domain/workbook/configurations/pivot';
import { UIJidoOption } from '../../../common/component/chart/option/ui-option/jido/ui-jido-chart';

@Component({
  selector: 'jido-layer-option',
  templateUrl: './jido-layer-option.component.html'
})
export class JidoLayerOptionComponent extends BaseOptionComponent {

  @Input('uiOption')
  public uiOption: UIJidoOption;

  // 선반데이터
  @Input('pivot')
  public pivot: Pivot;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }
}
