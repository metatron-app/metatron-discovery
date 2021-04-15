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
import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {StringUtil} from '@common/util/string.util';
import {AbstractComponent} from '@common/component/abstract.component';

@Component({
  selector: 'advanced-setting',
  templateUrl: './advanced-setting.component.html'
})
export class AdvancedSettingComponent extends AbstractComponent implements OnInit, OnDestroy {

  // advanced list show hide flag
  @Input()
  public isShowAdvancedSetting: boolean;
  @Output()
  public changedShowFlag: EventEmitter<boolean> = new EventEmitter();

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
   * Setting option show click event
   */
  public onClickSettingOption(): void {
    this.isShowAdvancedSetting = !this.isShowAdvancedSetting;
    // emit
    this.changedShowFlag.emit(this.isShowAdvancedSetting);
  }

  /**
   * Add option click event
   * @param {string} optionType
   */
  public onClickAddOption(optionType: string): void {
    this[optionType].push({key: '', value: ''});
  }

  /**
   * Delete option click event
   * @param {string} optionType
   * @param {number} index
   */
  public onClickRemoveOption(optionType: string, index: number): void {
    this[optionType].splice(index, 1);
  }

  /**
   * property key validation
   * @param option
   * @param configList
   */
  public configKeyValidation(option: any, configList: any): void {
    // check not empty
    if (StringUtil.isNotEmpty(option.key)) {
      // check special characters, and korean (enable .dot)
      if (option.key.trim().match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\{\}\[\]\/?,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi)) {
        // set duplicate message
        option.keyValidMessage = this.translateService.instant('msg.storage.ui.custom.property.special.char.disable');
        // set error flag
        option.keyError = true;
        return;
      }
      // check duplicate
      if (configList.filter(item => item.key.trim() === option.key.trim()).length > 1) {
        // set duplicate message
        option.keyValidMessage = this.translateService.instant('msg.storage.ui.custom.property.duplicated');
        // set error flag
        option.keyError = true;
      }
    }
  }

  /**
   * Property value validation
   * #1168 remove validation
   * @param option
   */
  public configValueValidation(option: any): void {
    // check not empty, check special characters, and korean (enable .dot)
    if (StringUtil.isNotEmpty(option.value) && option.value.trim().match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\{\}\[\]\/?,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi)) {
      // set duplicate message
      option.valueValidMessage = this.translateService.instant('msg.storage.ui.custom.property.special.char.disable');
      // set error flag
      option.valueError = true;
      return;
    }
  }
}
