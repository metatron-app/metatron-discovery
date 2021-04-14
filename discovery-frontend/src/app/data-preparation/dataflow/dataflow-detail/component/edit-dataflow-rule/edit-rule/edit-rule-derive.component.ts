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

import * as _ from 'lodash';
import {isNullOrUndefined, isUndefined} from 'util';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {DeriveRule} from '@domain/data-preparation/prep-rules';
import {RuleSuggestInputComponent} from './rule-suggest-input.component';
import {EditRuleComponent} from './edit-rule.component';

@Component({
  selector: 'edit-rule-derive',
  templateUrl: './edit-rule-derive.component.html'
})
export class EditRuleDeriveComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('derive_value_input')
  private valueInput: RuleSuggestInputComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public deriveVal: string;
  public deriveAs: string;
  public isTooltipShow: boolean = false;

  @Output()
  public advancedEditorClickEvent = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();
  } // function - ngOnInit

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();
  } // function - ngAfterViewInit

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();

  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - API
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Rule 형식 정의 및 반환
   * @return
   */
  public getRuleData(): { command: string, ruleString: string, uiRuleString: DeriveRule } {

    this.deriveVal = this.valueInput.getFormula();
    const val = _.cloneDeep(this.deriveVal);

    if (isUndefined(val) || '' === val || '\'\'' === val) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.expression'));
      return undefined
    }

    if (isUndefined(this.deriveAs) || '' === this.deriveAs) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.new.col'));
      return undefined
    }

    let deriveAs: string;
    if (this.deriveAs.indexOf(' ') === -1) {
      deriveAs = `'${this.deriveAs}'`;
    } else {
      deriveAs = '`' + this.deriveAs + '`';
    }

    return {
      command: 'derive',
      ruleString: 'derive value: ' + val + ' as: ' + deriveAs,
      uiRuleString: {
        name: 'derive',
        expression: this.deriveVal,
        newCol: this.deriveAs,
        isBuilder: true
      }
    }

  } // function - getRuleData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Open advanced editor popup
   */
  public openPopupFormulaInput() {
    this.deriveVal = this.valueInput.getFormula();
    this.advancedEditorClickEvent.emit({command: 'derive', val: 'deriveVal'});
  } // function - openPopupFormulaInput

  /**
   * Apply formula using Advanced formula popup
   * @param {{command: string, formula: string}} data
   */
  public doneInputFormula(data: { command: string, formula: string }) {
    this.deriveVal = data.formula;
    this.valueInput.setFormula(this.deriveVal);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 표시 전 실행
   * @protected
   */
  protected beforeShowComp() {
  } // function - beforeShowComp

  /**
   * 컴포넌트 표시 후 실행
   * @protected
   */
  protected afterShowComp() {

    if (this.deriveAs === '' || isNullOrUndefined(this.deriveAs)) {
      this.deriveAs = 'col_1';
    }
  } // function - afterShowComp

  /**
   * parse rule string
   * @param data ({jsonRuleString : DeriveRule})
   */
  protected parsingRuleString(data: { jsonRuleString: DeriveRule }) {

    this.deriveVal = data.jsonRuleString.expression;
    this.deriveAs = data.jsonRuleString.newCol;

  } // function - parsingRuleString

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

