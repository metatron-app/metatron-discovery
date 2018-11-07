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

import { EditRuleComponent } from './edit-rule.component';
import { AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { Field } from '../../../../../../domain/data-preparation/dataset';
import { Alert } from '../../../../../../common/util/alert.util';
import { EventBroadcaster } from '../../../../../../common/event/event.broadcaster';
import { StringUtil } from '../../../../../../common/util/string.util';
import { PreparationCommonUtil } from '../../../../../util/preparation-common.util';

@Component({
  selector : 'edit-rule-unnest',
  templateUrl : './edit-rule-unnest.component.html'
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
  public selectedFields: Field[] = [];

  // 상태 저장용 T/F
  public isFocus:boolean = false;         // Input Focus 여부
  public isTooltipShow:boolean = false;   // Tooltip Show/Hide

  // Rule 에 대한 입력 값들
  public selVal:string = '';
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
   * Returns rules tring when add/update button in pressed
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): { command: string, ruleString: string } {

    if (0 === this.selectedFields.length) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return undefined;
    }

    // surround idx with single quotation
    let clonedSelVal = this.selVal;
    let check = StringUtil.checkSingleQuote(clonedSelVal, { isWrapQuote: true });
    if (check[0] === false) {
      Alert.warning(this.translateService.instant('Check element value'));
      return undefined;
    } else {
      clonedSelVal = check[1];
    }

    const columnsStr: string = this.selectedFields.map((item) => {
      if (-1 !== item.name.indexOf(' ')) {
        item.name = '`' + item.name + '`';
      }
      return item.name
    }).join(', ');

    let ruleString = 'unnest col: ' + columnsStr;
    ruleString += ` into: ${this.selectedFields[0].type} idx: ${clonedSelVal}`;

    return{
      command : 'unnest',
      ruleString: ruleString
    };

  } // function - getRuleData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public showToolTip(isShow: boolean) {
    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', { isShow : isShow } );
  }

  /**
   * 필드 변경
   * @param {{target: Field, isSelect: boolean, selectedList: Field[]}} data
   */
  public changeFields(data:{target?:Field, isSelect?:boolean, selectedList:Field[]}) {
    this.selectedFields = data.selectedList;
  } // function - changeFields

  /**
   * 패턴 정보 레이어 표시
   * @param {boolean} isShow
   */
  public showHidePatternLayer(isShow:boolean) {
    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', { isShow : isShow } );
    this.isFocus = isShow;
  } // function - showHidePatternLayer

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

  } // function - _afterShowComp

  /**
   * rule string 을 분석한다.
   * @param data ({ruleString : string, jsonRuleString : any})
   */
  protected parsingRuleString(data: {ruleString : string, jsonRuleString : any}) {

    // COLUMN
    let arrFields:string[] = [data.jsonRuleString.col];
    this.selectedFields = arrFields.map( item => this.fields.find( orgItem => orgItem.name === item ) ).filter(field => !!field);

    this.selVal = data.jsonRuleString.idx.escapedValue;
  } // function - _parsingRuleString

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
