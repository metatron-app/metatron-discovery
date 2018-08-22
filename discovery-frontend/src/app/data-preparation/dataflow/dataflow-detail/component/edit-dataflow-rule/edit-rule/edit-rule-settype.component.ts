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
import { isNullOrUndefined } from 'util';

@Component({
  selector : 'edit-rule-settype',
  templateUrl : './edit-rule-settype.component.html'
})
export class EditRuleSettypeComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
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
  public colDescs : any ;
  public isTimestamp : boolean = false;
  public colTypes : any = [];
  public isGetTimestampRunning : boolean = false;

  // 상태 저장용 T/F
  public isFocus:boolean = false;         // Input Focus 여부
  public isTooltipShow:boolean = false;   // Tooltip Show/Hide

  public selectedTimestamp : string = '';
  public selectedType : string = '';
  public customTimestamp: string; // custom format
  public typeList : string [] = ['long', 'double', 'string', 'boolean', 'timestamp' ];

  public defaultIndex : number = -1;
  public defaultTimestampIndex : number = -1;
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

  /**
   * When type is selected
   * @param data
   */
  public selectItem(data) {
    this.selectedType = data;
    if ('timestamp' === this.selectedType) {
      this.isTimestamp = true;
      this.getTimestampFormats();
    } else if ('string' === this.selectedType) {
      if (-1 !== this._checkIfAtLeastOneColumnIsSelType(this.selectedFields, 'timestamp')){
        this.isTimestamp = true;
        this.getTimestampFormats();
      } else {
        this.isTimestamp = false;
      }
    } else {
      this.isTimestamp = false;
    }

  }

  public selectTimestamp(data) {
    this.selectedTimestamp = data.value;
  }

  public getTimestampFormats() {

    if (!this.isGetTimestampRunning) {
      this.isGetTimestampRunning = true;
      let cols = this.selectedFields.map((item) => {
        return item.name
      });

      let tempTimetampValue : string = '';
      if ('' !== this.selectedTimestamp) {
        tempTimetampValue = this.selectedTimestamp;
      }
      this.dataflowService.getTimestampFormatSuggestions(this.dsId, {colNames : cols} ).then((result) => {

        if (!isNullOrUndefined(result)) {
          let keyList = [];

          // 받아온 timestamp format 리스트를 ui에 맞게 가공
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

          // 선택된 컬럼이 있거나 선택된 타임스탬프는 없을 때
          if (cols.length > 0 ||  '' !== tempTimetampValue) {
            // 선택된 타임스탬프 타입이 없을 때
            if ('' === tempTimetampValue) {
              if ('string' === this.selectedType) {
                // 타임스탬프 ->  스트링  (헌재 타입 정보)
                if ('timestamp' === this.selectedFields[0].type.toLowerCase()) {
                  let idx = this._getFieldNameArray().indexOf(this.selectedFields[0].name);
                  this.selectedTimestamp = this.colTypes[idx].timestampStyle;
                  this.defaultTimestampIndex = this._timestampValueArray().indexOf(this.selectedTimestamp);
                } else {
                  this.selectedTimestamp = '';
                  this.defaultTimestampIndex = -1;
                }
              } else if ('timestamp' === this.selectedType) {
                // 타음스탬프 -> 타임스탬프 (현재 타입 정보)
                if ('timestamp' === this.selectedFields[0].type.toLowerCase()) {
                  let idx = this._getFieldNameArray().indexOf(this.selectedFields[0].name);
                  this.selectedTimestamp = this.colTypes[idx].timestampStyle;
                  this.defaultTimestampIndex = this._timestampValueArray().indexOf(this.selectedTimestamp);
                } else if ('string' === this.selectedFields[0].type.toLowerCase()) { // 스트링 -> 타임스탬프 (추천)
                  let max = this.timestampFormats.reduce((max, b) => Math.max(max, b.matchValue), this.timestampFormats[0].matchValue);
                  let idx = this.timestampFormats.map((item) => {
                    return item.matchValue
                  }).findIndex((data) => {
                    return data === max
                  });
                  this.defaultTimestampIndex = idx;
                  this.selectedTimestamp = this.timestampFormats[idx].value;
                }
              }
            } else {
              let idx = this._timestampValueArray().indexOf('' !== tempTimetampValue ? tempTimetampValue : this.selectedTimestamp);
              if (idx === -1 && tempTimetampValue !== '') {
                this.selectedTimestamp = 'Custom format';
                this.defaultTimestampIndex = this._timestampValueArray().length - 1;
                this.customTimestamp = tempTimetampValue;
              } else {
                this.defaultTimestampIndex = idx;
              }
            }
          } else {
            this.selectedTimestamp = '';
            this.defaultTimestampIndex = -1;
          }
        }
        this.isGetTimestampRunning = false;
      });
    }

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

    if ('' === this.selectedType) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.type'));
      return undefined;
    }

    let ruleString = 'settype col: ' + this.selectedFields.map( item => item.name ).join(', ') + ` type: ${this.selectedType}`;

    if (this.isTimestamp && '' !== this.selectedTimestamp) {
      ruleString += ' format: ';
      if ('Custom format' === this.selectedTimestamp) {
        let check = StringUtil.checkSingleQuote(this.customTimestamp, { isPairQuote: false, isWrapQuote: true });
        if (check[0] === false) {
          Alert.warning(this.translateService.instant('msg.dp.alert.invalid.timestamp.val'));
          return;
        } else {
          this.customTimestamp = check[1];
        }
        ruleString += this.customTimestamp
      } else {
        let check = StringUtil.checkSingleQuote(this.selectedTimestamp, { isPairQuote: false, isWrapQuote: true });
        if (check[0] === false) {
          Alert.warning(this.translateService.instant('msg.dp.alert.invalid.timestamp.val'));
          return;
        } else {
          this.selectedTimestamp = check[1];
        }
        ruleString += this.selectedTimestamp;
      }
    }

    return {
      command : 'settype',
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
    this.selectedTimestamp = '';
    if ('timestamp' === this.selectedType) {
      this.isTimestamp = true;
      this.getTimestampFormats();
    } else if ('string' === this.selectedType) {
      if (-1 !== this._checkIfAtLeastOneColumnIsSelType(this.selectedFields, 'timestamp')){
        this.isTimestamp = true;
        this.getTimestampFormats();
      } else {
        this.isTimestamp = false;
      }
    } else {
      this.isTimestamp = false;
    }
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

    // COLUMN
    const strCol:string = this.getAttrValueInRuleString( 'col', ruleString );
    if( '' !== strCol ) {
      const arrFields:string[] = ( -1 < strCol.indexOf( ',' ) ) ? strCol.split(',') : [strCol];
      this.selectedFields = arrFields.map( item => this.fields.find( orgItem => orgItem.name === item ) );
    }

    // TYPE
    this.selectedType = this.getAttrValueInRuleString( 'type', ruleString ).toLowerCase();
    this.defaultIndex = this.typeList.indexOf(this.selectedType);

    // dsID - for timestamp list
    this.dsId = ruleString.split('dsId: ')[1];

    // format
    if ('timestamp' === this.selectedType || 'string' === this.selectedType && !isNullOrUndefined(ruleString.split('dsId: ')[0])) {
      if ('string' === this.selectedType ) {
        if (-1 === this._checkIfAtLeastOneColumnIsSelType(this.selectedFields, 'timestamp')){
          this.isTimestamp = false;
        } else {
          this.isTimestamp = true;
          this.getTimestampFromRuleString(ruleString);
        }
      }
    }
  } // function - _parsingRuleString

  protected getTimestampFromRuleString(ruleString : string ) {
    let str = ruleString.split('format: ')[1];
    if (!isNullOrUndefined(str)) {
      this.isTimestamp = true;
      this.selectedTimestamp = str.split(' dsId')[0].substring(1,str.split(' dsId')[0].length-1);
      this.getTimestampFormats();
    } else {
      // 컨텍스트 메뉴에서 내려온 값
      let val = ruleString.split('type: ')[1];
      if (!isNullOrUndefined(val)) {
        val = val.split(' dsId: ')[0];
        if (val.toLowerCase() === 'timestamp' || val.toLowerCase() === 'string') {
          this.defaultIndex = this.typeList.indexOf(val.toLowerCase());
          let idx = this.fields.findIndex((item) =>  {
            return item.name === this.selectedFields[0].name;
          });

          this.selectedTimestamp = this._findTimestampStyleWithIdxInColDescs(idx);
          this.isTimestamp = true;
          this.getTimestampFormats();
        }
      }
    }

  }

  private _findTimestampStyleWithIdxInColDescs(idx : number) : string {
    return this.colTypes[idx].timestampStyle.replace(/'/g, '\\\'');
  } // function - _findTimestampStyleWithIdxInColDescs


  /**
   * returns -1 if type does not exist in array
   * @param {Field[]} selectedFields
   * @param {string} type
   * @return {number}
   * @private
   */
  private _checkIfAtLeastOneColumnIsSelType(selectedFields : Field[], type : string) : number {
    let idx : number = selectedFields.findIndex((item) => {
      return item.type === type.toUpperCase();
    });
    return idx;
  }

  /**
   * Get field name array
   * @return {string[]}
   * @private
   */
  private _getFieldNameArray() {
    return this.fields.map((item) => {
      return item.name
    });
  }

  /**
   * Get timestamp values in array
   * @private
   */
  private _timestampValueArray() {
    return this.timestampFormats.map((item) => {
      return item.value;
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
