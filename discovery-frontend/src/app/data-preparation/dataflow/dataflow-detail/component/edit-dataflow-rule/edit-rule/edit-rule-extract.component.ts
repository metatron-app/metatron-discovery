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

import {AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {StringUtil} from '@common/util/string.util';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {Field} from '@domain/data-preparation/pr-dataset';
import {ExtractRule} from '@domain/data-preparation/prep-rules';
import {EditRuleComponent} from './edit-rule.component';

@Component({
  selector: 'edit-rule-extract',
  templateUrl: './edit-rule-extract.component.html'
})
export class EditRuleExtractComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {

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
  public isFocus: boolean = false;         // Input Focus 여부
  public isTooltipShow: boolean = false;   // Tooltip Show/Hide

  // Rule 에 대한 입력 값들
  public pattern: string = '';
  public limit: number;
  public ignore: string = '';
  public isIgnoreCase: boolean = false;

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
   * Rule 형식 정의 및 반환
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): { command: string, ruleString: string, uiRuleString: ExtractRule } {

    // Column (must select more than one)
    if (0 === this.selectedFields.length) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return undefined;
    }

    // pattern
    let clonedPattern = this.pattern;
    if (this.isNullOrUndefined(clonedPattern) || '' === clonedPattern || clonedPattern === '//' || clonedPattern === '\'\'') {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.pattern'));
      return undefined;
    }
    const patternResult: [boolean, string] = StringUtil.checkSingleQuote(clonedPattern, {isWrapQuote: !StringUtil.checkRegExp(clonedPattern)});
    if (!patternResult[0]) {
      Alert.warning(this.translateService.instant('msg.dp.alert.pattern.error'));
      return undefined;
    }
    clonedPattern = patternResult[1];

    // limit
    if (this.isNullOrUndefined(this.limit)) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.times'));
      return undefined;
    }


    let ruleString = 'extract col: ' + this.getColumnNamesInArray(this.selectedFields, true).toString()
      + ' on: ' + clonedPattern + ' limit : ' + this.limit + ' ignoreCase: ' + this.isIgnoreCase;

    // 다음 문자 사이 무시
    if (this.ignore && '' !== this.ignore.trim() && '\'\'' !== this.ignore.trim()) {
      const checkIgnore = StringUtil.checkSingleQuote(this.ignore.trim(), {isWrapQuote: true});
      if (checkIgnore[0] === false) {
        Alert.warning(this.translateService.instant('msg.dp.alert.check.ignore.char'));
        return undefined;
      } else {
        ruleString += ' quote: ' + checkIgnore[1];
      }
    }

    return {
      command: 'extract',
      ruleString: ruleString,
      uiRuleString: {
        name: 'extract',
        col: this.getColumnNamesInArray(this.selectedFields),
        pattern: this.pattern,
        limit: this.limit,
        ignore: this.ignore,
        ignoreCase: this.isIgnoreCase,
        isBuilder: true
      }
    };

  } // function - getRuleData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Change fields
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
  } // function - _beforeShowComp

  /**
   * 컴포넌트 표시 후 실행
   * @protected
   */
  protected afterShowComp() {

  } // function - _afterShowComp

  /**
   * Parse rule string
   * @param data ({jsonRuleString : any})
   */
  protected parsingRuleString(data: { jsonRuleString: ExtractRule }) {

    // COLUMN
    const arrFields: string[] = data.jsonRuleString.col;
    this.selectedFields = arrFields.map(item => this.fields.find(orgItem => orgItem.name === item)).filter(field => !!field);

    // NUMBER OF MATCHES
    this.limit = data.jsonRuleString.limit;

    // PATTERN
    this.pattern = data.jsonRuleString.pattern;

    // IGNORE CASE
    this.isIgnoreCase = Boolean(data.jsonRuleString.ignoreCase);

    this.ignore = data.jsonRuleString.ignore;

  } // function - _parsingRuleString

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
