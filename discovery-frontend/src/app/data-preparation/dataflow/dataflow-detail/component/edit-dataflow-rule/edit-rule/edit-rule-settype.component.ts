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
  public dsId : string = '';
  public colDescs : any ;
  public isTimestamp : boolean = false;
  public colTypes : any = [];
  public hasEditTimestamp : boolean = false;
  // for status T/F
  public isFocus:boolean = false;         // Input Focus t/f
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
  constructor(protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector,
              protected dataflowService: DataflowService) {
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

  /**
   * When timestamp format is selected
   * @param data
   */
  public selectTimestamp(data) {
    this.selectedTimestamp = data.value;
  }

  /**
   * Set selected timestamp index in select box
   * @param {string} selectedTimestamp
   */
  public setSelectedTimestamp(selectedTimestamp : string) {
    this.isTimestamp = true;
    if ('' === selectedTimestamp) {
      this.defaultTimestampIndex = -1;
    } else if (-1 === this._timestampValueArray().indexOf(selectedTimestamp)) {
      this.selectedTimestamp = 'Custom format';
      this.defaultTimestampIndex = this._timestampValueArray().length - 1;
      this.customTimestamp = selectedTimestamp;
    } else {
      this.defaultTimestampIndex = this._timestampValueArray().indexOf(selectedTimestamp);
    }
  }


  /**
   * Make timestamp list from formats from server
   * @param result
   */
  public makeTimestampList(result:any) {
    let keyList = [];
    this.timestampFormats = [];

    for (let key in result) {
      if (result.hasOwnProperty(key)) {
        keyList.push(key);
      }
    }

    for (let i in result[keyList[0]]) {
      if (result[keyList[0]].hasOwnProperty(i)) {
        this.timestampFormats.push({ value: i, isHover: false, matchValue: result[keyList[0]][i] })
      }
    }
    this.timestampFormats.push({ value: 'Custom format', isHover: false, matchValue: -1 });
  }

  /**
   * Gets timestamp formats from the server
   * @param {string} selectedTimestamp
   */
  public getTimestampFormats(selectedTimestamp? :string) {

    let cols = this.selectedFields.map((item) => {
      return item.name
    });

    this.dataflowService.getTimestampFormatSuggestions(this.dsId, {colNames : cols} ).then((result) => {

      if (!isNullOrUndefined(result)) {

        this.makeTimestampList(result);

        if (!isNullOrUndefined(this.selectedTimestamp) && '' !== this.selectedTimestamp) {
          this.setSelectedTimestamp(this.selectedTimestamp);
        } else if (cols.length > 0) { // 선택된 컬럼이 있다면
          if ('string' === this.selectedType.toLowerCase()) {
            // timestamp ->  string  (set current column timestamp type)
            if ('timestamp' === this.selectedFields[0].type.toLowerCase()) {
              let idx = this._getFieldNameArray().indexOf(this.selectedFields[0].name);
              this.selectedTimestamp = this.colTypes[idx].timestampStyle;
              this.setSelectedTimestamp(this.selectedTimestamp);
            } else {
              this.selectedTimestamp = '';
              this.setSelectedTimestamp(this.selectedTimestamp);
            }
          } else if ('timestamp' === this.selectedType.toLowerCase()) {
            if ('timestamp' === this.selectedFields[0].type.toLowerCase()) {
              // timestamp ->  timestamp  (set current column timestamp type)
              let idx = this._getFieldNameArray().indexOf(this.selectedFields[0].name);
              this.selectedTimestamp = this.colTypes[idx].timestampStyle;
              this.setSelectedTimestamp(this.selectedTimestamp);
            } else if ('string' === this.selectedFields[0].type.toLowerCase()) {
              // string -> timestamp (suggestion)
              let max = this.timestampFormats.reduce((max, b) => Math.max(max, b.matchValue), this.timestampFormats[0].matchValue);
              let idx = this.timestampFormats.map((item) => {
                return item.matchValue
              }).findIndex((data) => {
                return data === max
              });
              this.selectedTimestamp = this.timestampFormats[idx].value;
              this.setSelectedTimestamp(this.selectedTimestamp);
            }
          }
        } else { // 선택된 컬럼이 없다면 선택된 타임스탬프는 없다
          this.selectedTimestamp = '';
          this.setSelectedTimestamp(this.selectedTimestamp);
        }
      }
    });
  }

  /**
   * Set rule string and returns it
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): { command: string, ruleString: string } {

    // selected column
    if (0 === this.selectedFields.length) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return undefined
    }

    // selected type
    if ('' === this.selectedType) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.type'));
      return undefined;
    }

    let ruleString = 'settype col: ' + this.selectedFields.map( item => item.name ).join(', ') + ` type: ${this.selectedType}`;

    // Timestamp
    if (this.isTimestamp && '' !== this.selectedTimestamp) {
      ruleString += ' format: ';
      if ('Custom format' === this.selectedTimestamp) {
        let check = StringUtil.checkSingleQuote(this.customTimestamp, { isPairQuote: true, isWrapQuote: true });
        if (check[0] === false) {
          Alert.warning(this.translateService.instant('msg.dp.alert.invalid.timestamp.val'));
          return undefined;
        } else {
          this.customTimestamp = check[1];
        }
        ruleString += this.customTimestamp
      } else {
        let check = StringUtil.checkSingleQuote(this.selectedTimestamp, { isPairQuote: true, isWrapQuote: true });
        if (check[0] === false) {
          Alert.warning(this.translateService.instant('msg.dp.alert.invalid.timestamp.val'));
          return undefined;
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
   * Change fields
   * @param {{target: Field, isSelect: boolean, selectedList: Field[]}} data
   */
  public changeFields(data:{target?:Field, isSelect?:boolean, selectedList:Field[]}) {
    this.selectedFields = data.selectedList;
    if (!this.hasEditTimestamp) {
      this.selectedTimestamp = '';
      this.hasEditTimestamp = false;
    }
    if ('timestamp' === this.selectedType) {
      this.isTimestamp = true;
      this.getTimestampFormats(this.selectedTimestamp);
    } else if ('string' === this.selectedType) {
      if (-1 !== this._checkIfAtLeastOneColumnIsSelType(this.selectedFields, 'timestamp')){
        this.isTimestamp = true;
        this.getTimestampFormats(this.selectedTimestamp);
      } else {
        this.isTimestamp = false;
      }
    } else {
      this.isTimestamp = false;
    }
  }

  /**
   * Show/hide pattern tooltip
   * @param {boolean} isShow
   */
  public showHidePatternLayer(isShow:boolean) {
    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', { isShow : isShow } );
    this.isFocus = isShow;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Before component is shown
   * @protected
   */
  protected beforeShowComp() {}

  /**
   * After component is shown
   * @protected
   */
  protected afterShowComp() {
    if (this.dsId && this.selectedType) { // 컨텍스트 메뉴 이용
      this.defaultIndex = this.typeList.indexOf(this.selectedType.toLowerCase());
      this.getTimestampFormats();
    }
  }

  /**
   * parse rule string (When editing)
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

    // format
    if ('timestamp' === this.selectedType || 'string' === this.selectedType) {
      if ('string' === this.selectedType ) { // 선택된 모든 컬럼이 스트링일 떄는 타임스탬프 패턴 지정을 보여줄 필요 없다
        if (-1 === this._checkIfAtLeastOneColumnIsSelType(this.selectedFields, 'timestamp')){
          this.isTimestamp = false;
          return;
        }
      }
      this.getTimestampFromRuleString(ruleString);
    }
  }

  /**
   * Set format and type from rule string
   * @param {string} ruleString
   */
  protected getTimestampFromRuleString(ruleString : string ) {
    let str = ruleString.split('format: ')[1];
    if (!isNullOrUndefined(str)) { // 편집시 ruleString 에 timestamp format 이 있다면
      this.isTimestamp = true;
      this.selectedTimestamp = str.substring(1,str.length-1);
      this.hasEditTimestamp = true; // 편집 여부
    }
  }

  /**
   * returns -1 if type does not exist in array
   * @param {Field[]} selectedFields
   * @param {string} type
   * @return {number}
   * @private
   */
  private _checkIfAtLeastOneColumnIsSelType(selectedFields : Field[], type : string) : number {
    return selectedFields.findIndex((item) => {
      return item.type === type.toUpperCase();
    });
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
