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

import { EditRuleComponent } from './edit-rule.component';
import {
  AfterViewInit, Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { Field } from '../../../../../../domain/data-preparation/dataset';
import { Alert } from '../../../../../../common/util/alert.util';
import { StringUtil } from '../../../../../../common/util/string.util';
import { isUndefined } from "util";
import { EventBroadcaster } from '../../../../../../common/event/event.broadcaster';
import { PreparationCommonUtil } from '../../../../../util/preparation-common.util';

@Component({
  selector : 'edit-rule-replace',
  templateUrl : './edit-rule-replace.component.html'
})
export class EditRuleReplaceComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('patternValue')
  private _patternValue: ElementRef;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public selectedFields: Field[] = [];

  @Output()
  public advancedEditorClickEvent = new EventEmitter();

  // T/F
  public isFocus:boolean = false;         // Input Focus t/f
  public isTooltipShow:boolean = false;   // Tooltip Show/Hide

  // Rule
  public pattern:string = '';
  public newValue:string = '';
  public ignore:string = '';
  public condition:string = '';
  public isGlobal:boolean = true;
  public isIgnoreCase:boolean = false;
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
   * Returns rulestring
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): { command: string, ruleString: string } {

    // col
    if (0 === this.selectedFields.length) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return undefined;
    }

    // pattern
    let clonedPattern = this.pattern;
    if (isUndefined(clonedPattern) || '' === clonedPattern || clonedPattern === '//' || clonedPattern === '\'\'') {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.pattern'));
      return undefined;
    }
    const patternResult:[boolean, string] = StringUtil.checkSingleQuote(clonedPattern, { isWrapQuote: !StringUtil.checkRegExp(clonedPattern) });
    if (!patternResult[0]) {
      Alert.warning(this.translateService.instant('msg.dp.alert.pattern.error'));
      return undefined;
    }
    clonedPattern = patternResult[1];

    // new val
    let clonedNewValue = this.newValue;
    if (!isUndefined(clonedNewValue) && '' !== clonedNewValue) {
      let withVal = StringUtil.checkSingleQuote(clonedNewValue, { isPairQuote: true, isWrapQuote: true });
      if (withVal[0] === false) {
        Alert.warning(this.translateService.instant('mgs.dp.alert.check.new.val'));
        return undefined;
      } else {
        clonedNewValue = withVal[1];
      }
    } else {
      clonedNewValue = '\'\'';
    }

    const columnsStr: string = this.selectedFields.map((item) => {
      if (-1 !== item.name.indexOf(' ')) {
        item.name = '`' + item.name + '`';
      }
      return item.name
    }).join(', ');

    let ruleString = `replace col: ${columnsStr} with: ${clonedNewValue} on: ${clonedPattern} global: ${this.isGlobal} ignoreCase: ${this.isIgnoreCase}`;

    // Ignore between characters
    if (this.ignore && '' !== this.ignore.trim() && '\'\'' !== this.ignore.trim()) {
      const checkIgnore = StringUtil.checkSingleQuote(this.ignore.trim(), { isWrapQuote: true });
      if (checkIgnore[0] === false) {
        Alert.warning(this.translateService.instant('msg.dp.alert.check.ignore.char'));
        return undefined;
      } else {
        ruleString += ' quote: ' + checkIgnore[1];
      }
    }

    // condition
    let clonedCondition = this.condition;
    if (!isUndefined(clonedCondition) && '' !== clonedCondition.trim() && '\'\'' !== clonedCondition.trim()) {
      let check = StringUtil.checkSingleQuote(clonedCondition, { isPairQuote: true });
      if (check[0] === false) {
        Alert.warning(this.translateService.instant('msg.dp.alert.check.condition'));
        return undefined;
      } else {
        ruleString += ' row: ' + check[1];
      }
    }

    return{
      command : 'replace',
      ruleString: ruleString
    };

  } // function - getRuleData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * change field
   * @param {{target: Field, isSelect: boolean, selectedList: Field[]}} data
   */
  public changeFields(data:{target?:Field, isSelect?:boolean, selectedList:Field[]}) {
    this.selectedFields = data.selectedList;
  } // function - changeFields

  /**
   * show pattern info tooltip
   * @param {boolean} isShow
   */
  public showHidePatternLayer(isShow:boolean) {
    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', { isShow : isShow } );
    this.isFocus = isShow;
  } // function - showHidePatternLayer

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
    if (this.selectedFields.length > 0) {
      setTimeout(() => {
        this._patternValue.nativeElement.focus();
      });
    }
  } // function - _afterShowComp

  /**
   * Returns rule string
   * @param data ({ruleString : string, jsonRuleString : any})
   */
  protected parsingRuleString(data: {ruleString : string, jsonRuleString : any}) {

    // COLUMN
    let arrFields:string[] = typeof data.jsonRuleString.col.value === 'string' ? [data.jsonRuleString.col.value] : data.jsonRuleString.col.value;
    this.selectedFields = arrFields.map( item => this.fields.find( orgItem => orgItem.name === item ) ).filter(field => !!field);

    this.newValue = data.jsonRuleString.with.escapedValue;

    this.pattern = data.jsonRuleString.on.escapedValue;

    this.isGlobal = Boolean(data.jsonRuleString.global);

    this.isIgnoreCase = Boolean(data.jsonRuleString.ignoreCase);

    if (data.jsonRuleString.quote) {
      this.ignore = data.jsonRuleString.quote.escapedValue;
    }

    if (data.jsonRuleString.row) {
      this.condition = data.ruleString.split('row: ')[1];
    }

  } // function - _parsingRuleString

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
