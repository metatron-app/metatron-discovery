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
//import { Field } from '../../../../../../domain/data-preparation/dataset';
import { Field } from '../../../../../../domain/data-preparation/pr-dataset';
import { EditRuleComponent } from './edit-rule.component';
import { Alert } from '../../../../../../common/util/alert.util';
import {StringUtil} from "../../../../../../common/util/string.util";
import {isNullOrUndefined,isUndefined} from "util";
import * as _ from 'lodash';
import {RuleConditionInputComponent} from "./rule-condition-input.component";

@Component({
  selector: 'edit-rule-window',
  templateUrl: './edit-rule-window.component.html'
})

export class EditRuleWindowComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
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
  public formulaList:string[] = [''];
  // public selectedGroupFields: Field[] = [];
  public selectedSortFields: Field[] = [];
  public sortList : any [];
  public defaultIndex : number = 0;
  public sortBy : string;

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

    this.sortList = [
      { type: '', name: 'asc', isHover: false },
      { type: '\'desc\'', name: 'desc', selected: false }
    ];
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

  public changeGroupFields(data:{target:Field, isSelect:boolean, selectedList:Field[]}) {
    this.selectedFields = data.selectedList;
  }

  public changeSortFields(data:{target:Field, isSelect:boolean, selectedList:Field[]}) {
    this.selectedSortFields = data.selectedList;
  }

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

  /**
   * Rule 형식 정의 및 반환
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): { command: string, col: string, ruleString: string } {

    this.formulaList = [];
    this.formulas.forEach((item:formula)=>{ if(!isUndefined(item.value) && item.value.length > 0) this.formulaList.push(item.value)});
    if (this.formulaList.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.expression'));
      return undefined;
    }

    const validFormulaList:string[] = [];
    const invalidFormula:boolean = this.formulaList.some((formula, index) => {
      if( StringUtil.checkSingleQuote(formula, { isWrapQuote: false, isAllowBlank: false })[0] ) {
        formula = this.ruleConditionInputComponent['_results'][index].getCondition();
        validFormulaList.push(formula );
        return false;
      } else {
        return true;
      }
    });
    if( invalidFormula ) {
      Alert.warning(this.translateService.instant('msg.dp.alert.check.expression'));
      return undefined;
    }

    // 그룹
    let groupStr: string = '';
    if (this.selectedFields.length !== 0) {
      let selFields = _.cloneDeep(this.selectedFields);
      groupStr = selFields.map((item) => {
        if (-1 !== item.name.indexOf(' ')) {
          item.name = '`' + item.name + '`';
        }
        return item.name
      }).join(', ');
    }

    let sortStr: string = '';
    if (this.selectedSortFields.length !== 0) {
      let selSortFields = _.cloneDeep(this.selectedSortFields);
      sortStr = selSortFields.map((item) => {
        if (-1 !== item.name.indexOf(' ')) {
          item.name = '`' + item.name + '`';
        }
        return item.name
      }).join(', ');
    }

    let resultRuleString : string = `window value: ${validFormulaList}`;

    if (groupStr !== '') {
      resultRuleString += ` group: ${groupStr}`;
    }

    if (sortStr !== '') {
      resultRuleString += ` order: ${sortStr}`;
    }
    return {
      command: 'window',
      col: groupStr,
      ruleString: resultRuleString
    };

  } // function - getRuleData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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
   * rule string 을 분석한다.
   * @param data ({ruleString : string, jsonRuleString : any})
   */
  protected parsingRuleString(data: {ruleString : string, jsonRuleString : any}) {

    // Group - can be null
    if (!isNullOrUndefined(data.jsonRuleString.group)) {
      let groupFields:string[] = typeof data.jsonRuleString.group.value === 'string' ? [data.jsonRuleString.group.value] : data.jsonRuleString.group.value;
      this.selectedFields = groupFields.map( item => this.fields.find( orgItem => orgItem.name === item ) );
    }

    // Order
    if (!isNullOrUndefined(data.jsonRuleString.order)) {
      let orderFields: string[] = typeof data.jsonRuleString.order.value === 'string' ? [data.jsonRuleString.order.value] : data.jsonRuleString.order.value;
      this.selectedSortFields = orderFields.map( item => this.fields.find( orgItem => orgItem.name === item ) );
    }

    // Formula
    this.formulas = [];
    if (data.jsonRuleString.value.hasOwnProperty('functions')) {
      data.jsonRuleString.value.functions.forEach((item, idx) => {
        this.formulas.push({id:idx, value: this.getJoinedExpression(item)});
      })
    } else {
      this.formulas.push({id:0, value: this.getJoinedExpression(data.jsonRuleString.value) });
    }

  } // function - _parsingRuleString

  /**
   * Returns joined Expression
   * @param value
   * @returns {string}
   */
  public getJoinedExpression(value:any) : string {

    let result = value.name;
    if (value.args.length !== 0) {
      let list = value.args.map((item) => {
        if (item.value.toString().indexOf(' ') !== -1) {
          return '`' + item.value + '`'
        } else {
          return item.value
        }
      });
      result += `(${list.join(',')})`;
    } else {
      result += '()';
    }
    return result;
  }

  /**
   * Sort by 선택
   * @param data
   */
  public selectItem(data) {
    this.sortBy = data.type;

  } // function - selectItem


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private getFormulaId(): number {
    return this.formulas.length ? Math.max.apply(Math,this.formulas.map(({ id }) => id)) + 1 : 1;
  }
}

interface formula {
  id: number;
  value: string
}
