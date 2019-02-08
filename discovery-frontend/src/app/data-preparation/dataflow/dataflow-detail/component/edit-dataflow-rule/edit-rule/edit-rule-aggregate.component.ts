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

import {AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit, ViewChildren, QueryList} from '@angular/core';
//import { Field } from '../../../../../../domain/data-preparation/dataset';
import { Field } from '../../../../../../domain/data-preparation/pr-dataset';
import { EditRuleComponent } from './edit-rule.component';
import { Alert } from '../../../../../../common/util/alert.util';
import { StringUtil } from '../../../../../../common/util/string.util';
import {RuleConditionInputComponent} from "./rule-condition-input.component";
import { RuleSuggestInputComponent } from './rule-suggest-input.component';
import * as _ from 'lodash';
import {isUndefined} from "util";

interface formula {
  id: number;
  value: string
}

@Component({
  selector: 'edit-rule-aggregate',
  templateUrl: './edit-rule-aggregate.component.html'
})
export class EditRuleAggregateComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChildren(RuleSuggestInputComponent)
  private ruleSuggestInput : QueryList<RuleSuggestInputComponent>;

  /*
  @ViewChildren(RuleConditionInputComponent)
  private ruleConditionInputComponent : RuleConditionInputComponent;
  */
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public selectedFields: Field[] = [];

  public formulaList:string[] = [''];
  public formulas: formula[];

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
    this.formulas = [ {id:0, value:''} ];
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

    // 수식
    const formulaValueList = this.ruleSuggestInput
                                 .map(el => el.getFormula())
                                 .filter( v => (!isUndefined(v) && v.trim().length > 0) );
    
    if ( !formulaValueList || formulaValueList.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.expression'));
      return undefined;
    }  

    const value = formulaValueList.join(',');
    
    // 그룹
    if (this.selectedFields.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.enter.groupby'));
      return undefined;
    }

    const columnsStr: string = this.selectedFields.map((item) => {
      return '`' + item.name + '`';
    }).join(', ');

    return {
      command: 'aggregate',
      ruleString: `aggregate value: ${value} group: ${columnsStr}`
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
    this.formulas.push({id: this.getFormulaId(), value: ''});
  } // function - addFormula

  /**
   * 특정 위치의 수식 삭제
   * @param {number} idx
   */
  public deleteFormula(idx:number) {
    if(!isUndefined(this.formulas) && this.formulas.length > 1) {
      this.formulas = this.formulas.filter(({id}) => id !== idx);
    }
  } // function - deleteFormula

  /**
   * 리스트의 개별성 체크 함수
   * @param {number} index
   * @param {string} formula
   * @return {number}
   */
  public trackByFn(index: number, formula: formula) {
    return formula.id;
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

    this.formulas = [];
    let strFormulaList:string = this.getAttrValueInRuleString( 'value', data.ruleString );
    if( '' !== strFormulaList) {
      this.formulaList = strFormulaList.split( ',' ).map( item => item.replace( /'/g, '' ) );
      this.formulaList.forEach((item,idx)=>{
        this.formulas.push({id:idx, value: item});
      })
    }

  } // function - parsingRuleString



  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private getFormulaId(): number {
    return this.formulas.length ? Math.max.apply(Math,this.formulas.map(({ id }) => id)) + 1 : 1;
  }

}

