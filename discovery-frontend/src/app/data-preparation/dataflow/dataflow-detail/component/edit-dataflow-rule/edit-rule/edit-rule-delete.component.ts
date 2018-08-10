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
import { Field, Rule } from '../../../../../../domain/data-preparation/dataset';
import {RuleConditionInputComponent} from "./rule-condition-input.component";
import { StringUtil } from '../../../../../../common/util/string.util';
import { Alert } from '../../../../../../common/util/alert.util';
import { isUndefined } from "util";

@Component({
  selector : 'edit-rule-delete',
  templateUrl : './edit-rule-delete.component.html'
})
export class EditRuleDeleteComponent extends EditRuleComponent implements OnInit, OnDestroy, AfterViewInit {

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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(protected elementRef : ElementRef,
              protected injector : Injector) {
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
   * 컴포넌트의 초기 실행
   * @param {Field[]} fields
   * @param {Rule} rule
   */
  public init(fields : Field[], rule ? : Rule) {
    super.init( fields, rule );

    this.safelyDetectChanges();

    this.ruleConditionInputComponent.init({ruleVO : this.ruleVO, fields : this.fields, command : 'delete'} );
  } // function - init

  /**
   * Rule 형식 정의 및 반환
   * @return
   */
  public getRuleData(): { command: string, ruleString:string} {
    let val = this.ruleConditionInputComponent.getCondition();
    if (isUndefined(val) || '' === val || '\'\'' === val) {
      Alert.warning(this.translateService.instant('msg.dp.alert.keep.warn'));
      return {
        command: this.ruleVO.command,
        ruleString: undefined
      }
    }

    if (!isUndefined(val) && '' !== val.trim() && '\'\'' !== val.trim()) {
      let check = StringUtil.checkSingleQuote(val, { isPairQuote: true });
      if (check[0] === false) {
        Alert.warning(this.translateService.instant('msg.dp.alert.check.condition'));
        return;
      } else {
        val = check[1];
      }
    }
    return {
      command: this.ruleVO.command,
      ruleString: 'delete row: ' + val
    };

  } // function - getRuleData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 수식 입력 팝업 오픈
   * @param {string} command 수식 입력 실행 커맨드
   */
  public openPopupFormulaInput(command: string) {
    this.advancedEditorClickEvent.emit();
  } // function - openPopupFormulaInput

}
