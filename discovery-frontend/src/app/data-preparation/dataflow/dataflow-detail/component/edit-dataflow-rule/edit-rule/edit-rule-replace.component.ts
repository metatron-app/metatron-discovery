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

import {isUndefined} from 'util';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {StringUtil} from '@common/util/string.util';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {Field} from '@domain/data-preparation/pr-dataset';
import {ReplaceRule} from '@domain/data-preparation/prep-rules';
import {EditRuleComponent} from './edit-rule.component';
import {RuleSuggestInputComponent} from './rule-suggest-input.component';

@Component({
  selector: 'edit-rule-replace',
  templateUrl: './edit-rule-replace.component.html'
})
export class EditRuleReplaceComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('patternValue')
  private _patternValue: ElementRef;

  @ViewChild('replace_row_input')
  private rowInput: RuleSuggestInputComponent;
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
  public isFocus: boolean = false;         // Input Focus t/f
  public isTooltipShow: boolean = false;   // Tooltip Show/Hide

  // Rule
  public pattern: string = '';
  public newValue: string = '';
  public ignore: string = '';
  public condition: string = '';
  public isGlobal: boolean = true;
  public isIgnoreCase: boolean = false;

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
  public getRuleData(): { command: string, ruleString: string, uiRuleString: ReplaceRule } {

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
    const patternResult: [boolean, string] = StringUtil.checkSingleQuote(clonedPattern, {isWrapQuote: !StringUtil.checkRegExp(clonedPattern)});
    if (!patternResult[0]) {
      Alert.warning(this.translateService.instant('msg.dp.alert.pattern.error'));
      return undefined;
    }
    clonedPattern = patternResult[1];

    // new val
    let clonedNewValue = this.newValue;
    if (!isUndefined(clonedNewValue) && '' !== clonedNewValue) {
      const withVal = StringUtil.checkSingleQuote(clonedNewValue, {isPairQuote: true, isWrapQuote: true});
      if (withVal[0] === false) {
        Alert.warning(this.translateService.instant('mgs.dp.alert.check.new.val'));
        return undefined;
      } else {
        clonedNewValue = withVal[1];
      }
    } else {
      clonedNewValue = '\'\'';
    }

    let ruleString = `replace col: ${this.getColumnNamesInArray(this.selectedFields, true).toString()} with: ${clonedNewValue} on: ${clonedPattern} global: ${this.isGlobal} ignoreCase: ${this.isIgnoreCase}`;

    // Ignore between characters
    if (this.ignore && '' !== this.ignore.trim() && '\'\'' !== this.ignore.trim()) {
      const checkIgnore = StringUtil.checkSingleQuote(this.ignore.trim(), {isWrapQuote: true});
      if (checkIgnore[0] === false) {
        Alert.warning(this.translateService.instant('msg.dp.alert.check.ignore.char'));
        return undefined;
      } else {
        ruleString += ' quote: ' + checkIgnore[1];
      }
    }

    // condition
    this.condition = this.rowInput.getFormula();
    const clonedCondition = this.condition;
    if (!isUndefined(clonedCondition) && '' !== clonedCondition.trim() && '\'\'' !== clonedCondition.trim()) {
      const check = StringUtil.checkSingleQuote(clonedCondition, {isPairQuote: true});
      if (check[0] === false) {
        Alert.warning(this.translateService.instant('msg.dp.alert.check.condition'));
        return undefined;
      } else {
        ruleString += ' row: ' + check[1];
      }
    }

    return {
      command: 'replace',
      ruleString: ruleString,
      uiRuleString: {
        name: 'replace',
        col: this.getColumnNamesInArray(this.selectedFields),
        newVal: this.newValue,
        pattern: this.pattern,
        matchOccurrence: this.isGlobal,
        ignoreCase: this.isIgnoreCase,
        ignore: this.ignore,
        condition: this.condition,
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
   * show pattern info tooltip
   * @param {boolean} isShow
   */
  public showHidePatternLayer(isShow: boolean) {
    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', {isShow: isShow});
    this.isFocus = isShow;
  } // function - showHidePatternLayer

  /**
   * open advanced formula popup
   */
  public openPopupFormulaInput() {
    this.condition = this.rowInput.getFormula();
    this.advancedEditorClickEvent.emit({command: 'replace', val: 'condition'});
  } // function - openPopupFormulaInput

  /**
   * Apply formula using Advanced formula popup
   * @param {{command: string, formula: string}} data
   */
  public doneInputFormula(data: { command: string, formula: string }) {
    this.condition = data.formula;
    this.rowInput.setFormula(this.condition);
  }

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
    if (this.selectedFields.length > 0) {
      setTimeout(() => {
        this._patternValue.nativeElement.focus();
      });
    }
  } // function - _afterShowComp

  /**
   * Returns rule string
   * @param data ({ruleString : string, jsonRuleString : ReplaceRule})
   */
  protected parsingRuleString(data: { jsonRuleString: ReplaceRule }) {

    // COLUMN
    const arrFields: string[] = data.jsonRuleString.col;
    this.selectedFields = arrFields.map(item => this.fields.find(orgItem => orgItem.name === item)).filter(field => !!field);

    this.newValue = data.jsonRuleString.newVal;

    this.pattern = data.jsonRuleString.pattern;

    this.isGlobal = Boolean(data.jsonRuleString.matchOccurrence);

    this.isIgnoreCase = Boolean(data.jsonRuleString.ignoreCase);

    this.ignore = data.jsonRuleString.ignore;

    this.condition = data.jsonRuleString.condition;

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
