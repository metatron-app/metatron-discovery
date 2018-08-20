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
import { DataflowService } from '../../../../service/dataflow.service';
import { StringUtil } from '../../../../../../common/util/string.util';
import { isNullOrUndefined } from "util";

@Component({
  selector : 'edit-rule-setformat',
  templateUrl : './edit-rule-setformat.component.html'
})
export class EditRuleSetformatComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
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
  public timestampFormats : any = [] ;
  public dsId : string;

  // 상태 저장용 T/F
  public isFocus:boolean = false;         // Input Focus 여부
  public isTooltipShow:boolean = false;   // Tooltip Show/Hide

  public selectedTimestamp : string = '';
  public customTimestamp: string; // custom format

  public defaultIndex : number = -1;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector,
              protected dataflowService: DataflowService) {
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
  public selectItem(data) {
    this.selectedTimestamp = data.value;
  }

  public getTimestampFormats() {
    let cols = this.selectedFields.map((item) => {
      return item.name
    });

    this.dataflowService.getTimestampFormatSuggestions(this.dsId, {colNames : cols} ).then((result) => {
      let keyList = [];
      for (let key in result) {
        if (result.hasOwnProperty(key)) {
          keyList.push(key);
        }
      }
      this.timestampFormats = [];
      for (let i in result[keyList[0]]) {
        if (result[keyList[0]].hasOwnProperty(i)) {
          this.timestampFormats.push({ value: i, isHover: false, matchValue: result[keyList[0]][i] })
        }
      }
      this.timestampFormats.push({ value: 'Custom format', isHover: false, matchValue : -1 });

      if (cols.length > 0 && '' === this.selectedTimestamp) {
        let max = this.timestampFormats.reduce((max, b) => Math.max(max, b.matchValue), this.timestampFormats[0].matchValue);
        let idx = this.timestampFormats.map((item) => {
          return item.matchValue
        }).findIndex((data) => {
          return data === max
        });
        this.defaultIndex = idx;
        this.selectedTimestamp = this.timestampFormats[idx].value;
      } else if ('' !==this.selectedTimestamp) {
        let items = this.timestampFormats.map((item) => {
          return item.value;
        });
        if (items && items.indexOf(this.selectedTimestamp) === -1) {
          this.customTimestamp = this.selectedTimestamp;
          this.selectedTimestamp = 'Custom format';
        } else {
          this.defaultIndex = items.indexOf(this.selectedTimestamp);
          this.selectedTimestamp = items[items.indexOf(this.selectedTimestamp)];
        }
      } else {
        this.defaultIndex = -1;
        this.selectedTimestamp = '';
      }
    });
  }

  /**
   * Rule 형식 정의 및 반환
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): { command: string, ruleString: string } {

    // 선택된 컬럼
    if (0 === this.selectedFields.length) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return undefined
    }

    if ('Custom format' === this.selectedTimestamp && '' === this.customTimestamp || '' === this.selectedTimestamp) {
      Alert.warning('Timestamp format must not be null');
      return undefined
    }

    let ruleString = 'setformat col: ' + this.selectedFields.map( item => item.name ).join(', ') + ' format: ';
    let val = this.selectedTimestamp === 'Custom format' ?  this.customTimestamp : this.selectedTimestamp;
    let check = StringUtil.checkSingleQuote(val, { isPairQuote: false, isWrapQuote: true });
    if (check[0] === false) {
      Alert.warning(this.translateService.instant('msg.dp.alert.invalid.timestamp.val'));
      return;
    } else {
      val = check[1];
    }
    ruleString += val;

    return {
      command : 'setformat',
      ruleString: ruleString
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
    this.getTimestampFormats();
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
  protected beforeShowComp() {
    this.getTimestampFormats();
  } // function - _beforeShowComp

  /**
   * 컴포넌트 표시 후 실행
   * @protected
   */
  protected afterShowComp() {

  } // function - _afterShowComp

  /**
   * rule string 을 분석한다.
   * @param ruleString
   */
  protected parsingRuleString(ruleString:string) {

    const strCol:string = this.getAttrValueInRuleString( 'col', ruleString );
    if( '' !== strCol ) {
      const arrFields:string[] = ( -1 < strCol.indexOf( ',' ) ) ? strCol.split(',') : [strCol];
      this.selectedFields = arrFields.map( item => this.fields.find( orgItem => orgItem.name === item ) );
    }

    this.dsId = this.getAttrValueInRuleString( 'dsId', ruleString );
    this.getTimestampFromRuleString(ruleString);
    this.getTimestampFormats();
  } // function - _parsingRuleString

  protected getTimestampFromRuleString(ruleString : string ) {
    let str = ruleString.split('format: ')[1];
    if (!isNullOrUndefined(str)) {
      this.selectedTimestamp = str.split(' dsId')[0].substring(1,str.split(' dsId')[0].length-1);
    } else {
      let val = ruleString.split('type: ')[1];
      val = val.split(' dsId: ')[0];
      if (val.toLowerCase() === 'timestamp') {
        this.getTimestampFormats();
      }
    }
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
