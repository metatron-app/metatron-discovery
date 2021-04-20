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
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChildren,
  QueryList
} from '@angular/core';
import { Field } from '@domain/data-preparation/pr-dataset';
import { EditRuleComponent } from './edit-rule.component';
import { Alert } from '@common/util/alert.util';
import { RuleSuggestInputComponent } from './rule-suggest-input.component';
import {isUndefined} from 'util';
import {AggregateRule} from '@domain/data-preparation/prep-rules';
import {DataflowModelService} from '../../../../service/dataflow.model.service';

interface Formula {
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public selectedFields: Field[] = [];

  public formulaList:string[] = [''];
  public formulas: Formula[];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(
    private dataflowModelService:DataflowModelService,
    protected elementRef: ElementRef,
    protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();
    this.formulas = [ {id:0, value:''} ];
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
   * Rule 형식 정의 및 반환
   * @return {{command: string, ruleString: string}}
   */
  public getRuleData(): { command: string, ruleString: string, uiRuleString: AggregateRule } {

    // 수식
    const formulaValueList = this.ruleSuggestInput
                                 .map(el => el.getFormula())
                                 .filter( v => (!isUndefined(v) && v.trim().length > 0) );

    if ( !formulaValueList || formulaValueList.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.expression'));
      return undefined;
    }

    const value = formulaValueList.join(',');

    let ruleString = `aggregate value: ${value}`;
    if (0 < this.selectedFields.length) {
      ruleString = `${ruleString} group: ${this.getColumnNamesInArray(this.selectedFields, true).toString()}`;
    }

    return {
      command: 'aggregate',
      ruleString: `${ruleString}`,
      uiRuleString: {
        name: 'aggregate',
        expression: formulaValueList,
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
  public changeFields(data:{target?:Field, isSelect?:boolean, selectedList:Field[]}) {
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
   * @param {number} _index
   * @param {string} formula
   * @return {number}
   */
  public trackByFn(_index: number, formula: Formula) {
    return formula.id;
  } // function - trackByFn


  /**
   * When scrolled
   */
  public scrollHandler() {
    this.dataflowModelService.scrollClose.next();
  }
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
   * @param data ({jsonRuleString : AggregateRule})
   */
  protected parsingRuleString(data : {jsonRuleString : AggregateRule}) {
    // COLUMN
    const arrFields:string[] = data.jsonRuleString.col;
    this.selectedFields = arrFields.map( item => this.fields.find( orgItem => orgItem.name === item ) ).filter(field => !!field);
    this.formulaList = [];
    this.formulas = [];
    this.formulaList = data.jsonRuleString.expression;
    this.formulaList.forEach((item,index) => {
      this.formulas.push({id:index, value: item});
    });

  } // function - parsingRuleString



  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private getFormulaId(): number {
    return this.formulas.length ? Math.max.apply(Math,this.formulas.map(({ id }) => id)) + 1 : 1;
  }

}

