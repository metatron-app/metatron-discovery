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

import {AfterViewInit, Component, ElementRef, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {StringUtil} from '@common/util/string.util';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {Field} from '@domain/data-preparation/pr-dataset';
import {UnnestRule} from '@domain/data-preparation/prep-rules';
import {EditRuleComponent} from './edit-rule.component';

@Component({
  selector: 'edit-rule-unnest',
  templateUrl: './edit-rule-unnest.component.html'
})
export class EditRuleUnnestComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input()
  private firstRow: any = null;

  public selectedFields: Field[] = [];

  // 상태 저장용 T/F
  public isFocus: boolean = false;         // Input Focus 여부
  public isTooltipShow: boolean = false;   // Tooltip Show/Hide

  // Rule 에 대한 입력 값들
  public selVal: string = '';
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();
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
   * Returns rules tring when add/update button in pressed
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): { command: string, ruleString: string, uiRuleString: UnnestRule } {

    if (0 === this.selectedFields.length) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return undefined;
    }

    if (this.selVal === '' && this.firstRow) {
      const theColumn = this.firstRow[this.selectedFields[0].name];
      const jsonVal = JSON.parse(theColumn);
      const keys = Object.keys(jsonVal);
      if (keys && keys.length) {
        if (this.selectedFields[0].type === 'MAP') {
          this.selVal = keys.map((item) => '\'' + item + '\'').join(',');
        } else if (this.selectedFields[0].type === 'ARRAY') {
          this.selVal = keys.map((_item, idx) => '\'' + idx + '\'').join(',');
        }
      }
    } else if (this.selectedFields[0].type === 'ARRAY') {
      const isIntegerIndex = this.selVal.split(',').every(item => typeof parseInt(item, 10) === 'number');
      if (isIntegerIndex) {
        this.selVal = this.selVal.split(',').map(item => '\'' + item + '\'').join(',');
      }
    }

    // surround idx with single quotation
    let clonedSelVal: string;
    const check = StringUtil.checkSingleQuote(this.selVal, {isPairQuote: true});
    if (check[0] === false && check[1] !== '') {
      Alert.warning(this.translateService.instant('Check element value'));
      return undefined;
    } else {
      clonedSelVal = check[1];
    }

    return {
      command: 'unnest',
      ruleString: `unnest col: ${this.getColumnNamesInArray(this.selectedFields, true).toString()} into: ${this.selectedFields[0].type} idx: ${clonedSelVal}`,
      uiRuleString: {
        name: 'unnest',
        col: this.getColumnNamesInArray(this.selectedFields),
        element: this.selVal,
        isBuilder: true
      }
    };

  } // function - getRuleData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public showToolTip(isShow: boolean) {
    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', {isShow: isShow});
  }

  /**
   * 필드 변경
   * @param {{target: Field, isSelect: boolean, selectedList: Field[]}} data
   */
  public changeFields(data: { target?: Field, isSelect?: boolean, selectedList: Field[] }) {
    this.selectedFields = data.selectedList;
  } // function - changeFields

  /**
   * 패턴 정보 레이어 표시
   * @param {boolean} isShow
   */
  public showHidePatternLayer(isShow: boolean) {
    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', {isShow: isShow});
    this.isFocus = isShow;
  } // function - showHidePatternLayer

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 표시 전 실행
   * @protected
   */
  protected beforeShowComp() {
    this.fields = this.fields.filter((item) => {
      return item.type === 'ARRAY' || item.type === 'MAP'
    });

    this.selectedFields = this.selectedFields.filter((item) => {
      return item.type === 'ARRAY' || item.type === 'MAP'
    });

  } // function - _beforeShowComp

  /**
   * 컴포넌트 표시 후 실행
   * @protected
   */
  protected afterShowComp() {

  } // function - _afterShowComp

  /**
   * rule string 을 분석한다.
   * @param data ({ruleString : string, jsonRuleString : any})
   */
  protected parsingRuleString(data: { jsonRuleString: UnnestRule }) {

    // COLUMN
    const arrFields: string[] = data.jsonRuleString.col;
    this.selectedFields = arrFields.map(item => this.fields.find(orgItem => orgItem.name === item)).filter(field => !!field);

    this.selVal = data.jsonRuleString.element;
  } // function - _parsingRuleString

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
