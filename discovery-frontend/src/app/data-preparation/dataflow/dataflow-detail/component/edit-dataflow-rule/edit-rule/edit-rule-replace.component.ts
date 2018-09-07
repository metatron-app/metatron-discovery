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
import { AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit } from '@angular/core';
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public selectedFields: Field[] = [];

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
      return;
    }

    // pattern
    let clonedPattern = this.pattern;
    if (isUndefined(clonedPattern) || '' === clonedPattern || clonedPattern === '//' || clonedPattern === '\'\'') {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.pattern'));
      return;
    }
    const patternResult:[boolean, string] = StringUtil.checkSingleQuote(clonedPattern, { isWrapQuote: !StringUtil.checkRegExp(clonedPattern) });
    if (!patternResult[0]) {
      Alert.warning(this.translateService.instant('msg.dp.alert.pattern.error'));
      return;
    }
    clonedPattern = patternResult[1];

    // new val
    let clonedNewValue = this.newValue;
    if (!isUndefined(clonedNewValue) && '' !== clonedNewValue) {
      let withVal = StringUtil.checkSingleQuote(clonedNewValue, { isPairQuote: true, isWrapQuote: true });
      if (withVal[0] === false) {
        Alert.warning(this.translateService.instant('mgs.dp.alert.check.new.val'));
        return
      } else {
        clonedNewValue = withVal[1];
      }
    } else {
      clonedNewValue = '\'\'';
    }

    let ruleString = `replace col: ${this.selectedFields.map( item => item.name ).join(', ')} with: ${clonedNewValue} on: ${clonedPattern} global: ${this.isGlobal} ignoreCase: ${this.isIgnoreCase}`;

    // Ignore between characters
    if (this.ignore && '' !== this.ignore.trim() && '\'\'' !== this.ignore.trim()) {
      const checkIgnore = StringUtil.checkSingleQuote(this.ignore.trim(), { isWrapQuote: true });
      if (checkIgnore[0] === false) {
        Alert.warning(this.translateService.instant('msg.dp.alert.check.ignore.char'));
        return
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
        return;
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
   * Returns rule string
   * @param ruleString
   */
  protected parsingRuleString(ruleString:string) {

    const strCol:string = this.getAttrValueInRuleString( 'col', ruleString );
    if( '' !== strCol ) {
      const arrFields:string[] = ( -1 < strCol.indexOf( ',' ) ) ? strCol.split(',') : [strCol];
      this.selectedFields = arrFields.map( item => this.fields.find( orgItem => orgItem.name === item ) );
    }

    // TODO : quotation marks
    let withVal = ruleString.split('with: ')[1];
    this.newValue = withVal.split(' on')[0];
    if (this.newValue.startsWith('\'') && this.newValue.endsWith('\'')) {
      this.newValue = this.newValue.substring(1, this.newValue.length - 1);
    }
    // this.newValue = PreparationCommonUtil.removeQuotation(this.getAttrValueInRuleString( 'with', ruleString ));

    let onVal = ruleString.split('on: ')[1];
    this.pattern = onVal.split(' global')[0];
    if (this.pattern.startsWith('\'') && this.pattern.endsWith('\'')) {
      this.pattern = this.pattern.substring(1, this.pattern.length - 1);
    }
    // this.pattern = PreparationCommonUtil.removeQuotation(this.getAttrValueInRuleString( 'on', ruleString ));

    this.isGlobal = Boolean( this.getAttrValueInRuleString( 'global', ruleString ) );

    this.isIgnoreCase = Boolean( this.getAttrValueInRuleString( 'ignoreCase', ruleString ) );

    this.ignore = PreparationCommonUtil.removeQuotation(this.getAttrValueInRuleString( 'quote', ruleString ));

    // condition has white space - removeQuotation doesn't work
    this.condition = ruleString.split('row: ')[1];
    // this.condition = PreparationCommonUtil.removeQuotation(this.getAttrValueInRuleString( 'row', ruleString ));

  } // function - _parsingRuleString

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
