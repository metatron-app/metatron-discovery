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

import {AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit, ViewChildren} from '@angular/core';
import { Field } from '../../../../../../domain/data-preparation/dataset';
import { EditRuleComponent } from './edit-rule.component';
import { Alert } from '../../../../../../common/util/alert.util';
import { StringUtil } from '../../../../../../common/util/string.util';
import { Filter } from '../../../../../../domain/workbook/configurations/filter/filter';
import {PreparationCommonUtil} from "../../../../../util/preparation-common.util";
import {RuleConditionInputComponent} from "./rule-condition-input.component";
import * as _ from 'lodash';

@Component({
  selector: 'edit-rule-aggregate',
  templateUrl: './edit-rule-aggregate.component.html'
})
export class EditRuleAggregateComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChildren(RuleConditionInputComponent)
  private ruleConditionInputComponent : RuleConditionInputComponent;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public selectedFields: Field[] = [];

  public formulaList:string[] = [''];

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
   * @return {{command: string, ruleString: string}}
   */
  public getRuleData(): { command: string, ruleString: string } {

    if (this.selectedFields.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.enter.groupby'));
      return undefined;
    }
    const columnsStr: string = _.cloneDeep(this.selectedFields).map((item) => {
      if (-1 !== item.name.indexOf(' ')) {
        item.name = '`' + item.name + '`';
      }
      return item.name
    }).join(', ');

    // Formula
    if (this.formulaList.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.formula'));
      return undefined;
    }

    const validFormulaList:string[] = [];
    const invalidFormula:boolean = this.formulaList.some( (formula, index) => {

      formula = this.ruleConditionInputComponent['_results'][index].getCondition();

      if( StringUtil.checkSingleQuote(formula, { isWrapQuote: false, isAllowBlank: false })[0] ) {
        if( StringUtil.checkFormula( formula ) ) {
          validFormulaList.push( '\'' + formula + '\'' );
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    });
    if( invalidFormula ) {
      Alert.warning(this.translateService.instant('msg.dp.alert.check.formula'));
      return undefined;
    }

    return {
      command: 'aggregate',
      ruleString: 'aggregate value: ' + validFormulaList.join(',') + ' group: ' + columnsStr
    };

  } // function - getRuleData

  public getRuleDataWithoutValidation() {

  } // function - getRuleDataWithoutValidation

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

  /**
   * 신규 수식 추가
   */
  public addFormula() {
    this.formulaList.push('');
  } // function - addFormula

  /**
   * 특정 위치의 수식 삭제
   * @param {number} idx
   */
  public deleteFormula(idx:number) {
    if (this.formulaList.length === 1) {
      return;
    }
    this.formulaList.splice( idx, 1 );
  } // function - deleteFormula

  // public getTempRuleStringFunc():Function {
  //   const parentScope = this;
  //   return (value:string) => {
  //     const columnsStr: string = parentScope.selectedFields.map( item => item.name ).join(', ');
  //
  //     if( StringUtil.checkSingleQuote(value, { isWrapQuote: false, isAllowBlank: false })[0] ) {
  //       if( StringUtil.checkFormula( value ) ) {
  //         value = '\'' + value + '\'';
  //         return false;
  //       }
  //     }
  //
  //     return 'aggregate value: ' + value + ' group: ' + columnsStr;
  //   };
  // } // function - getTempRuleStringFunc

  /**
   * 리스트의 개별성 체크 함수
   * @param index
   * @param {string} formula
   * @return {number}
   */
  public trackByFn(index, formula: string) {
    return index;
  } // function - trackByFn

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
  protected afterShowComp() {} // function - afterShowComp

  /**
   * rule string 을 분석한다.
   * @param data ({ruleString : string, jsonRuleString : any})
   */
  protected parsingRuleString(data : {ruleString : string, jsonRuleString : any}) {
    // COLUMN
    let arrFields:string[] = typeof data.jsonRuleString.group.value === 'string' ? [data.jsonRuleString.group.value] : data.jsonRuleString.group.value;
    this.selectedFields = arrFields.map( item => this.fields.find( orgItem => orgItem.name === item ) ).filter(field => !!field);

    let strFormulaList:string = this.getAttrValueInRuleString( 'value', data.ruleString );
    if( '' !== strFormulaList) {
      this.formulaList = strFormulaList.split( ',' ).map( item => item.replace( /'/g, '' ) );
    }

  } // function - parsingRuleString



  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
