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
import { Alert } from '@common/util/alert.util';
import { Field } from '@domain/data-preparation/pr-dataset';
import {SortRule} from '@domain/data-preparation/prep-rules';
import { EditRuleComponent } from './edit-rule.component';

@Component({
  selector: 'edit-rule-sort',
  templateUrl: './edit-rule-sort.component.html'
})
export class EditRuleSortComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public selectedFields: Field[] = [];
  public sortList : any [];
  public defaultIndex : number = 0;
  public sortBy : string;

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
  public ngOnInit() {
    super.ngOnInit();

    this.sortList = [
      { type: '', name: 'asc', isHover: false },
      { type: '\'desc\'', name: 'desc', selected: false }
    ];

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
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): { command: string, ruleString: string, uiRuleString: SortRule } {

    if (this.selectedFields.length === 0) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return undefined
    }

    const rule =  {
      command: 'sort',
      ruleString: 'sort order: ' + this.getColumnNamesInArray(this.selectedFields, true).toString(),
      uiRuleString : {
        name : 'sort',
        col: this.getColumnNamesInArray(this.selectedFields),
        sortBy:'asc',
        isBuilder: true
      }
    };

    if (this.sortBy !== '') {
      rule.ruleString += ' type: '+ this.sortBy;
      rule.uiRuleString.sortBy = this.sortBy;
    }

    return rule

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


  /**
   * Sort by 선택
   * @param data
   */
  public selectItem(data) {
    this.sortBy = data.type;

  } // function - selectItem

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
  protected afterShowComp() {
    // default is asc
    this.sortBy = this.sortList[0].type;
  } // function - afterShowComp


  /**
   * parse ruleString
   * @param data ({ruleString : string, jsonRuleString : SortRule})
   */
  protected parsingRuleString(data: {jsonRuleString : SortRule}) {

    // COLUMN
    const arrFields:string[] = data.jsonRuleString.col;
    this.selectedFields = arrFields.map( item => this.fields.find( orgItem => orgItem.name === item ) ).filter(field => !!field);

    // SORT BY
    this.sortBy = data.jsonRuleString.sortBy;

    this.defaultIndex = this.sortBy === 'asc' ? 0 : 1;

  } // function - parsingRuleString

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
