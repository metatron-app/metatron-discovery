/*
 *
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

/**
 * Advanced setting component
 */
import { AbstractComponent } from '../../../common/component/abstract.component';
import { Component, ElementRef, Injector, Input } from '@angular/core';
import { StringUtil } from '../../../common/util/string.util';

@Component({
  selector: 'advanced-setting',
  templateUrl: './advanced-setting.component.html'
})
export class AdvancedSettingComponent extends AbstractComponent {

  // advanced list show hide flag
  public isShowAdvancedSetting: boolean = true;

  // tuning configuration
  @Input()
  public tuningConfig: any[];

  // Job properties
  @Input()
  public jobProperties: any[];

  @Input()
  public createType: string;

  // Constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }


  /**
   * ngOnInit
   */
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * Is text empty
   * @param {string} text
   * @returns {boolean}
   */
  public isTextEmpty(text: string): boolean {
    return StringUtil.isEmpty(text);
  }

  /**
   * Add option click event
   * @param {string} optionType
   */
  public onClickAddOption(optionType: string): void {
    this[optionType].push({key:'', value: ''});
  }

  /**
   * Delete option click event
   * @param {string} optionType
   * @param {number} index
   */
  public onClickRemoveOption(optionType: string, index: number): void {
    this[optionType].splice(index, 1);
  }
}
