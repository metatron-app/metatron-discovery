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

import {isNullOrUndefined,isUndefined} from 'util';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Alert } from '@common/util/alert.util';
import { Field } from '@domain/data-preparation/pr-dataset';
import {WindowRule} from '@domain/data-preparation/prep-rules';
import {DataflowModelService} from '../../../../service/dataflow.model.service';
import { EditRuleComponent } from './edit-rule.component';
import { RuleSuggestInputComponent } from './rule-suggest-input.component';

interface Formula {
  id: number;
  value: string
}


@Component({
  selector: 'edit-rule-window',
  templateUrl: './edit-rule-window.component.html'
})

export class EditRuleWindowComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
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
  public selectedSortFields: Field[] = [];
  public sortList : any [];
  public defaultIndex : number = 0;
  public sortBy : string;

  public formulas: Formula[];
  public formulaList:string[] = [''];
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

  public changeGroupFields(data:{target?:Field, isSelect?:boolean, selectedList:Field[]}) {
    this.selectedFields = data.selectedList;
  }

  public changeSortFields(data:{target?:Field, isSelect?:boolean, selectedList:Field[]}) {
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
   * @param {number} _index
   * @param {string} formula
   * @return {number}
   */
  public trackByFn(_index: number, formula: Formula) {
    return formula.id;
  } // function - trackByFn

  /**
   * Rule 형식 정의 및 반환
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): {command: string, col: string, ruleString: string, uiRuleString: WindowRule} {

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
    let groupStr: string = '';
    if (this.selectedFields.length !== 0) {
      groupStr = this.getColumnNamesInArray(this.selectedFields, true).toString()
    }

    // 정렬
    let sortStr: string = '';
    if (this.selectedSortFields.length !== 0) {
      sortStr = this.getColumnNamesInArray(this.selectedSortFields, true).toString()
    }

    let resultRuleString : string = `window value: ${value}`;

    if (groupStr !== '') {
      resultRuleString += ` group: ${groupStr}`;
    }

    if (sortStr !== '') {
      resultRuleString += ` order: ${sortStr}`;
    }
    return {
      command: 'window',
      col: groupStr,
      ruleString: resultRuleString,
      uiRuleString: {
        name: 'window',
        expression: formulaValueList,
        groupBy: this.getColumnNamesInArray(this.selectedFields),
        sortBy: this.getColumnNamesInArray(this.selectedSortFields),
        isBuilder: true
      }
    };

  } // function - getRuleData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Sort by 선택
   * @param data
   */
  public selectItem(data) {
    this.sortBy = data.type;

  } // function - selectItem


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
  protected afterShowComp() {} // function - _afterShowComp

  /**
   * rule string 을 분석한다.
   * @param data ({ruleString : string, jsonRuleString : WindowRule})
   */
  protected parsingRuleString(data: {jsonRuleString : WindowRule}) {

    // col
    if (!isNullOrUndefined(data.jsonRuleString.groupBy)) {
      const groupFields:string[] = data.jsonRuleString.groupBy;
      this.selectedFields = groupFields.map( item => this.fields.find( orgItem => orgItem.name === item ) );
    }

    // Order
    if (!isNullOrUndefined(data.jsonRuleString.sortBy)) {
      const orderFields: string[] = data.jsonRuleString.sortBy;
      this.selectedSortFields = orderFields.map( item => this.fields.find( orgItem => orgItem.name === item ) );
    }

    // Formula
    this.formulaList = [];
    this.formulaList = data.jsonRuleString.expression;
    this.formulas = [];
    this.formulaList.forEach((item,index) => {
      this.formulas.push({id:index, value: item});
    });

  } // function - _parsingRuleString

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private getFormulaId(): number {
    return this.formulas.length ? Math.max.apply(Math,this.formulas.map(({ id }) => id)) + 1 : 1;
  }
}

