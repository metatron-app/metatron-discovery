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

import { AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { Field } from '../../../../../../domain/data-preparation/dataset';
import { EditRuleComponent } from './edit-rule.component';
import { Alert } from '../../../../../../common/util/alert.util';
import {StringUtil} from "../../../../../../common/util/string.util";

@Component({
  selector: 'edit-rule-window',
  templateUrl: './edit-rule-window.component.html'
})
export class EditRuleWindowComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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
    this.safelyDetectChanges();
  } // function - deleteFormula


  /**
   * 리스트의 개별성 체크 함수
   * @param index
   * @param {string} formula
   * @return {number}
   */
  public trackByFn(index, item) {
    return index;
  } // function - trackByFn


  /**
   * Rule 형식 정의 및 반환
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): { command: string, col: string, ruleString: string } {

    // Formula
    if (this.formulaList.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.formula'));
      return undefined;
    }

    const validFormulaList:string[] = [];
    const invalidFormula:boolean = this.formulaList.some( formula => {
      if( StringUtil.checkSingleQuote(formula, { isWrapQuote: false, isAllowBlank: false })[0] ) {
        if( StringUtil.checkFormula( formula ) ) {
          validFormulaList.push(formula );
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


    // 그룹
    let groupStr: string = '';
    if (this.selectedFields.length !== 0) {
      groupStr = this.selectedFields.map( item => item.name ).join(', ');
    }



    // sort
    if (this.selectedSortFields.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.enter.sortby'));
      return undefined;
    }
    const sortStr: string = this.selectedSortFields.map( item => item.name ).join(', ');

    let resultRuleString : string = `window value: [${validFormulaList}]`;
    if (groupStr) {
      resultRuleString += ` group: ${groupStr}`;
    }
    resultRuleString += ` order: ${sortStr}`;

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
   * @param ruleString
   */
  protected parsingRuleString(ruleString:string) {

    let groupsStr:string = this.getAttrValueInRuleString( 'group', ruleString );
    if( '' !== groupsStr ) {
      const groupFields:string[] = ( -1 < groupsStr.indexOf( ',' ) ) ? groupsStr.split(',') : [groupsStr];
      this.selectedFields = groupFields.map( item => this.fields.find( orgItem => orgItem.name === item ) );
    }

    let valueStr : string = ruleString.split('value: ')[1];

    let val = 'group';
    if (groupsStr === '') {
      val = 'order'
    }

    valueStr = valueStr.split(' ' + val)[0];
    if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
      valueStr = valueStr.substring(1, valueStr.length - 1);
    }
    if( '' !== valueStr) {
      this.formulaList = valueStr.split(',').map(item => item.replace(/'/g, ''));
    }

    let sortStr:string = this.getAttrValueInRuleString( 'order', ruleString );
    if( '' !== sortStr ) {
      const sortFields:string[] = ( -1 < sortStr.indexOf( ',' ) ) ? sortStr.split(',') : [sortStr];
      this.selectedSortFields = sortFields.map( item => this.fields.find( orgItem => orgItem.name === item ) );
    }
  } // function - _parsingRuleString


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

}
