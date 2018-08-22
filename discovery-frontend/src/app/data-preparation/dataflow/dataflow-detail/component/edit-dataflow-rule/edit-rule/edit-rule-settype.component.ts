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

          // When column is selected OR has timestamp value
          if (cols.length > 0 ||  '' !== tempTimetampValue) {
            // timestamp value is empty
            if ('' === tempTimetampValue) {
              if ('string' === this.selectedType) {
                // timestamp ->  string  (set current column timestamp type)
                if ('timestamp' === this.selectedFields[0].type.toLowerCase()) {
                  let idx = this._getFieldNameArray().indexOf(this.selectedFields[0].name);
                  this.selectedTimestamp = this.colTypes[idx].timestampStyle;
                  this.defaultTimestampIndex = this._timestampValueArray().indexOf(this.selectedTimestamp);
                } else {
                  this.selectedTimestamp = '';
                  this.defaultTimestampIndex = -1;
                }
              } else if ('timestamp' === this.selectedType) {
                if ('timestamp' === this.selectedFields[0].type.toLowerCase()) {
                  // timestamp ->  timestamp  (set current column timestamp type)
                  let idx = this._getFieldNameArray().indexOf(this.selectedFields[0].name);
                  this.selectedTimestamp = this.colTypes[idx].timestampStyle;
                  this.defaultTimestampIndex = this._timestampValueArray().indexOf(this.selectedTimestamp);
                } else if ('string' === this.selectedFields[0].type.toLowerCase()) {
                  // string -> timestamp (suggestion)
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
              // when editing
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
        let check = StringUtil.checkSingleQuote(this.customTimestamp, { isPairQuote: false, isWrapQuote: true });
        if (check[0] === false) {
          Alert.warning(this.translateService.instant('msg.dp.alert.invalid.timestamp.val'));
          return undefined;
        } else {
          this.customTimestamp = check[1];
        }
        ruleString += this.customTimestamp
      } else {
        let check = StringUtil.checkSingleQuote(this.selectedTimestamp, { isPairQuote: false, isWrapQuote: true });
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
  protected afterShowComp() {}

  /**
   * parse rule string
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
  }

  /**
   * Set format and type from rulestring
   * @param {string} ruleString
   */
  protected getTimestampFromRuleString(ruleString : string ) {
    let str = ruleString.split('format: ')[1];
    if (!isNullOrUndefined(str)) {
      this.isTimestamp = true;
      this.selectedTimestamp = str.split(' dsId')[0].substring(1,str.split(' dsId')[0].length-1);
      this.getTimestampFormats();
    } else {
      // From context menu
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

  /**
   * Find timestamp type with id in colTypes
   * @param {number} idx
   * @return {string}
   * @private
   */
  private _findTimestampStyleWithIdxInColDescs(idx : number) : string {
    return this.colTypes[idx].timestampStyle.replace(/'/g, '\\\'');
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
