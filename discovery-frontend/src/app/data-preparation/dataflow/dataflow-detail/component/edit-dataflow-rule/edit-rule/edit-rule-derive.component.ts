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
  AfterViewInit, Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild,
} from '@angular/core';
import { EditRuleComponent } from './edit-rule.component';
import { Alert } from '../../../../../../common/util/alert.util';
import { isUndefined } from "util";
import { StringUtil } from '../../../../../../common/util/string.util';
import { PreparationCommonUtil } from '../../../../../util/preparation-common.util';

@Component({
  selector : 'edit-rule-derive',
  templateUrl : './edit-rule-derive.component.html'
})
export class EditRuleDeriveComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public deriveVal:string;
  public deriveAs:string;
  public isTooltipShow:boolean = false;

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
  public getRuleData(): { command: string, ruleString:string} {
    let val = this.deriveVal;

    if (isUndefined(val) || '' === val || '\'\'' === val) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.formula'));
      return undefined
    }
    if (!isUndefined(val) && '' !== val.trim()) {
      let check = StringUtil.checkSingleQuote(val, { isPairQuote: true });
      if (check[0] === false) {
        Alert.warning('Check value');
        return undefined
      } else {
        val = check[1];
      }
    }

    if (isUndefined(this.deriveAs) || '' === this.deriveAs) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.new.col'));
      return undefined
    }
    return {
      command: 'derive',
      ruleString: 'derive value: ' + val + ' as: ' + '\'' + this.deriveAs.trim() + '\''
    }

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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 표시 전 실행
   * @protected
   */
  protected beforeShowComp() {} // function - beforeShowComp

  /**
   * 컴포넌트 표시 후 실행
   * @protected
   */
  protected afterShowComp() {
  } // function - afterShowComp

  /**
   * rule string 을 분석한다.
   * @param ruleString
   */
  protected parsingRuleString(ruleString:string) {
    // value
    // this.deriveVal = this.getAttrValueInRuleString( 'value', ruleString );
    this.deriveVal = ruleString.split('value: ')[1];
    this.deriveVal = this.deriveVal.split(' as: ')[0];

    // as
    this.deriveAs = PreparationCommonUtil.removeQuotation(this.getAttrValueInRuleString( 'as', ruleString ));
  } // function - parsingRuleString

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

