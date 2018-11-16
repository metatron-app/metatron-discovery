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
  AfterViewInit, Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { Field } from '../../../../../../domain/data-preparation/dataset';
import { EditRuleComponent } from './edit-rule.component';
import { Alert } from '../../../../../../common/util/alert.util';
import { RuleConditionInputComponent } from './rule-condition-input.component';
import {isNullOrUndefined, isUndefined} from 'util';
import { StringUtil } from '../../../../../../common/util/string.util';
import * as _ from 'lodash';

@Component({
  selector: 'edit-rule-set',
  templateUrl: './edit-rule-set.component.html'
})
export class EditRuleSetComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(RuleConditionInputComponent)
  private ruleConditionInputComponent : RuleConditionInputComponent;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  public advancedEditorClickEvent = new EventEmitter();
  @Output()
  public conditionClickEvent = new EventEmitter();

  public inputValue: string;
  public condition: string = '';
//  public forceCondition : string = '';
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(
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
   * Returns rule string
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): { command: string, col: string, ruleString: string } {

    // differentiate between pressing enter key when select box is opened & adding a rule
    if (this.ruleConditionInputComponent.autoCompleteSuggestions_selectedIdx == -1) {

      // column
      if (this.selectedFields.length === 0) {
        Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
        return undefined
      }

      const columnsStr: string = _.cloneDeep(this.selectedFields).map((item) => {
        if (-1 !== item.name.indexOf(' ')) {
          item.name = '`' + item.name + '`';
        }
        return item.name
      }).join(', ');

      // val
      this.inputValue = this.ruleConditionInputComponent.getCondition();
      let val = _.cloneDeep(this.inputValue);
      if (isUndefined(val) || '' === val.trim()) {
        Alert.warning(this.translateService.instant('msg.dp.alert.insert.formula'));
        return undefined;
      }
      if (!isUndefined(val)) {
        let check = StringUtil.checkSingleQuote(val, { isPairQuote: true });
        if (check[0] === false) {
          Alert.warning(this.translateService.instant('msg.dp.alert.check.value'));
          return undefined;
        } else {
          val = check[1];
        }
      }

      let rules =  {
        command: 'set',
        col: columnsStr,
        ruleString: `set col: ${columnsStr} value: ${val}`
      };

      if ('' !== this.condition && !isNullOrUndefined(this.condition)) {
        rules.ruleString += ` row: ${this.condition}`;
      }

      return rules;

    } else {
      return undefined;
    }

  } // function - getRuleData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * change field
   * @param {{target: Field, isSelect: boolean, selectedList: Field[]}} data
   */
  public changeFields(data:{target:Field, isSelect:boolean, selectedList:Field[]}) {
    this.selectedFields = data.selectedList;
  } // function - changeFields

  /**
   * open advanced formula popup
   */
  public openPopupFormulaInput() {
    this.advancedEditorClickEvent.emit();
  } // function - openPopupFormulaInput

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Before component is shown
   * @protected
   */
  protected beforeShowComp() {} // function - _beforeShowComp

  /**
   * After component is shown
   * @protected
   */
  protected afterShowComp() {
  } // function - _afterShowComp

  /**
   * parse rule string
   * @param data ({ruleString : string, jsonRuleString : any})
   */
  protected parsingRuleString(data: {ruleString : string, jsonRuleString : any}) {
    // COLUMN
    let arrFields:string[] = typeof data.jsonRuleString.col.value === 'string' ? [data.jsonRuleString.col.value] : data.jsonRuleString.col.value;
    this.selectedFields = arrFields.map( item => this.fields.find( orgItem => orgItem.name === item ) ).filter(field => !!field);


    this.inputValue = data.jsonRuleString.value.escapedValue;
    this.inputValue = data.ruleString.split('value: ')[1];

    if (data.jsonRuleString.row) {
      let row = data.ruleString.split('row: ');
      this.condition = row[1];

      this.inputValue = row[0].split('value: ')[1];
    }

  } // function - _parsingRuleString

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
