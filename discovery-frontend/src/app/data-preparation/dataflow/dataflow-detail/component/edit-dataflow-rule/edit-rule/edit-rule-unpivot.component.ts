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
} from '@angular/core';
import { Alert } from '@common/util/alert.util';
import { Field } from '@domain/data-preparation/pr-dataset';
import {UnpivotRule} from '@domain/data-preparation/prep-rules';
import { EditRuleComponent } from './edit-rule.component';

@Component({
  selector: 'edit-rule-unpivot',
  templateUrl: './edit-rule-unpivot.component.html'
})
export class EditRuleUnpivotComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  public advancedEditorClickEvent = new EventEmitter();

  public inputValue: number;

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
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): { command: string, col: string, ruleString: string, uiRuleString: UnpivotRule } {

    if (this.selectedFields.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return undefined
    }

    // limit
    if (this.isNullOrUndefined(this.inputValue) || this.inputValue.toString() === '') {
      Alert.warning(this.translateService.instant('msg.dp.alert.enter.group.every'));
      return undefined;
    }


    return {
      command: 'unpivot',
      col: this.getColumnNamesInArray(this.selectedFields, true).toString(),
      ruleString: `unpivot col: ${this.getColumnNamesInArray(this.selectedFields, true).toString()} groupEvery: ${this.inputValue}`,
      uiRuleString: {
        name: 'unpivot',
        groupEvery: this.inputValue,
        col: this.getColumnNamesInArray(this.selectedFields),
        isBuilder: true
      }
    };

  } // function - getRuleData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 필드 변경
   * @param {{target: Field, isSelect: boolean, selectedList: Field[]}} data
   */
  public changeFields(data:{target:Field, isSelect:boolean, selectedList:Field[]}) {
    this.selectedFields = data.selectedList;
  } // function - changeFields

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 표시 전 실행
   * @protected
   */
  protected beforeShowComp() {} // function - _beforeShowComp

  /**
   * 컴포넌트 표시 후 실행
   * @protected
   */
  protected afterShowComp() {} // function - _afterShowComp


  /**
   * parse rule string
   * @param data ({ruleString : string, jsonRuleString : UnpivotRule})
   */
  protected parsingRuleString(data: {jsonRuleString : UnpivotRule}) {

    // COLUMN
    const arrFields:string[] = data.jsonRuleString.col;
    this.selectedFields = arrFields.map( item => this.fields.find( orgItem => orgItem.name === item ) ).filter(field => !!field);

    this.inputValue = data.jsonRuleString.groupEvery;
  } // function - _parsingRuleString

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
