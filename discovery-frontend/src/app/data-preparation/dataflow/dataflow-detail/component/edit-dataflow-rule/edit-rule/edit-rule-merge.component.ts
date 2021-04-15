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

import {isNullOrUndefined, isUndefined} from 'util';
import {AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {StringUtil} from '@common/util/string.util';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {Field} from '@domain/data-preparation/pr-dataset';
import {MergeRule} from '@domain/data-preparation/prep-rules';
import {EditRuleComponent} from './edit-rule.component';

@Component({
  selector: 'edit-rule-merge',
  templateUrl: './edit-rule-merge.component.html'
})
export class EditRuleMergeComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public selectedFields: Field[] = [];

  public isFocus: boolean = false;         // Input Focus t/f
  public isTooltipShow: boolean = false;   // Tooltip Show/Hide

  public delimiter: string = '';
  public newValue: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - API
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * returns rule String
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): { command: string, ruleString: string, uiRuleString: MergeRule } {

    // column
    if (0 === this.selectedFields.length) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return undefined
    }

    // New Col
    let newVal = this.newValue;
    if (!isUndefined(newVal)) {
      const withVal = StringUtil.checkSingleQuote(newVal, {isPairQuote: true, isWrapQuote: true});
      if (withVal[0] === false) {
        Alert.warning(this.translateService.instant('msg.dp.alert.merge.col.error'));
        return undefined
      } else {
        newVal = withVal[1];
      }
    } else {
      newVal = '\'\'';
    }

    // delimiter
    let clonedDelimiter = this.delimiter;
    const check = StringUtil.checkSingleQuote(clonedDelimiter, {isWrapQuote: true});
    if (check[0] === false) {
      Alert.warning(this.translateService.instant('msg.dp.alert.check.delimiter'));
      return undefined
    } else {
      clonedDelimiter = check[1];
    }

    const ruleString =
      'merge col: ' + this.getColumnNamesInArray(this.selectedFields, true).toString()
      + ' with: ' + clonedDelimiter
      + ' as: ' + newVal;

    return {
      command: 'merge',
      ruleString: ruleString,
      uiRuleString: {
        name: 'merge',
        col: this.getColumnNamesInArray(this.selectedFields),
        delimiter: this.delimiter,
        newCol: this.newValue,
        isBuilder: true
      }
    };

  } // function - getRuleData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * change field
   * @param {{target: Field, isSelect: boolean, selectedList: Field[]}} data
   */
  public changeFields(data: { target?: Field, isSelect?: boolean, selectedList: Field[] }) {
    this.selectedFields = data.selectedList;
  } // function - changeFields

  /**
   * pattern layer show
   * @param {boolean} isShow
   */
  public showHidePatternLayer(isShow: boolean) {
    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', {isShow: isShow});
    this.isFocus = isShow;
  } // function - showHidePatternLayer

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Before component is shown
   * @protected
   */
  protected beforeShowComp() {
  } // function - _beforeShowComp

  /**
   * After component is shown
   * @protected
   */
  protected afterShowComp() {

    if (this.newValue === '' || isNullOrUndefined(this.newValue)) {
      if (this.selectedFields.length > 0) {
        this.newValue = this.selectedFields[0].name + '_1';
      }
    }
  } // function - _afterShowComp

  /**
   * Parse rule string
   * @param data ({ruleString : string, jsonRuleString : MergeRule})
   */
  protected parsingRuleString(data: { ruleString: string, jsonRuleString: MergeRule }) {

    // COLUMN
    const arrFields: string[] = data.jsonRuleString.col;
    this.selectedFields = arrFields.map(item => this.fields.find(orgItem => orgItem.name === item)).filter(field => !!field);

    // NEW COLUMN NAME
    this.newValue = data.jsonRuleString.newCol;

    // DELIMITER
    this.delimiter = data.jsonRuleString.delimiter;
  } // function - _parsingRuleString

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
