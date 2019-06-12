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
import {AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Field } from '../../../../../../domain/data-preparation/pr-dataset';
import { Alert } from '../../../../../../common/util/alert.util';
import { EventBroadcaster } from '../../../../../../common/event/event.broadcaster';
import { DataflowService } from '../../../../service/dataflow.service';
import { StringUtil } from '../../../../../../common/util/string.util';
import { isNullOrUndefined } from 'util';
import { PrepSelectBoxComponent } from "../../../../../util/prep-select-box.component";
import { PrepSelectBoxCustomComponent } from '../../../../../util/prep-select-box-custom.component';
import {SetTypeRule} from "../../../../../../domain/data-preparation/prep-rules";

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
  public typeList : string [] = ['long', 'double', 'string', 'boolean', 'timestamp'];

  public defaultIndex : number = -1;

  @ViewChild(PrepSelectBoxComponent)
  protected prepSelectBoxComponent : PrepSelectBoxComponent;

  @ViewChild(PrepSelectBoxCustomComponent)
  protected _custom: PrepSelectBoxCustomComponent;

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
    let tempnum: number = -1;
    try{
      if(selectedTimestamp !==null && selectedTimestamp !== '' && -1 !== this._timestampValueArray().indexOf(selectedTimestamp)) {
        tempnum = this._timestampValueArray().indexOf(selectedTimestamp);
      }
    }catch (error){};
    this._custom.setSelectedItem(this.timestampFormats, selectedTimestamp, tempnum);
  }


  /**
   * Make timestamp list from formats from server
   * @param result
   */
  public makeTimestampList(result:any) {

    let keyList = [];
    this.timestampFormats = [];

    for (let key in result) {
      // if (result.hasOwnProperty(key)) {
      keyList.push(key);
      // }
    }

    for (let i in result[keyList[0]]) {
      if (result[keyList[0]].hasOwnProperty(i)) {
        this.timestampFormats.push({ value: i, isHover: false, matchValue: result[keyList[0]][i] })
      }
    }
  }

  /**
   * Gets timestamp formats from the server
   * @param {string} selectedTimestamp
   */
  private getTimestampFormats() {

    let cols = this.selectedFields.map((item) => {
      return item.name
    });

    this.dataflowService.getTimestampFormatSuggestions(this.dsId, {colNames : cols} ).then((result) => {

      if (!isNullOrUndefined(result)) {
        this.makeTimestampList(result);
        // timestamp --> string (max x)
        // string --> timestamp (max o)
        // timestamp --> timestamp (max x)
        if (!isNullOrUndefined(this.selectedTimestamp) && '' !== this.selectedTimestamp) {
          //
        } else if (cols.length > 0) { // 선택된 컬럼이 있다면
          this.selectedTimestamp = '';
          if ('string' === this.selectedType.toLowerCase()) {
            // timestamp ->  string  (set current column timestamp type)
            if ('timestamp' === this.selectedFields[0].type.toLowerCase()) {
              let idx = this._getFieldNameArray().indexOf(this.selectedFields[0].name);
              this.selectedTimestamp = this.colTypes[idx].timestampStyle;
            }
          } else if ('timestamp' === this.selectedType.toLowerCase()) {
            if ('timestamp' === this.selectedFields[0].type.toLowerCase()) {
              // timestamp ->  timestamp  (set current column timestamp type)
              let idx = this._getFieldNameArray().indexOf(this.selectedFields[0].name);
              this.selectedTimestamp = this.colTypes[idx].timestampStyle;
            } else if ('string' === this.selectedFields[0].type.toLowerCase()) {
              // string -> timestamp (suggestion)
              let max = this.timestampFormats.reduce((max, b) => Math.max(max, b.matchValue), this.timestampFormats[0].matchValue);
              let idx = this.timestampFormats.map((item) => {
                return item.matchValue
              }).findIndex((data) => {
                return data === max
              });
              this.selectedTimestamp = this.timestampFormats[idx].value;
            }
          }
        } else { // 선택된 컬럼이 없다면 선택된 타임스탬프는 없다
          this.selectedTimestamp = '';
        }
        this.setSelectedTimestamp(this.selectedTimestamp);
      }
    });
  }

  /**
   * Set rule string and returns it
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): {command: string, ruleString: string, uiRuleString: Object} {

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

    let ruleString = 'settype col: ' + this.getColumnNamesInArray(this.selectedFields, true).toString() + ` type: ${this.selectedType}`;


    let copiedTimestamp: string = this.selectedTimestamp;

    // Timestamp
    if (this.isTimestamp && '' !== copiedTimestamp) {
      ruleString += ' format: ';
      let check:any = StringUtil.checkSingleQuote(this.selectedTimestamp, { isPairQuote: true, isWrapQuote: true });
      if (check[0] === false) {
        Alert.warning(this.translateService.instant('msg.dp.alert.invalid.timestamp.val'));
        return undefined;
      } else {
        this.selectedTimestamp = check[1];
      }
      ruleString += this.selectedTimestamp;
    }

    return {
      command : 'settype',
      ruleString: ruleString,
      uiRuleString: {
        name: 'settype',
        col : this.getColumnNamesInArray(this.selectedFields),
        type: this.selectedType,
        format: copiedTimestamp,
        isBuilder: true}
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

    // Selected columns
    this.selectedFields = data.selectedList;

    // 선택된 컬럼이 타임스탬프 타입이라면 new Type 셀렉트박스에서 타임스탬프를 지운다
    let hasTimestampType = false;
    data.selectedList.forEach((item) => {
      if (item.type === 'TIMESTAMP') {
        hasTimestampType = true;
      }
    });

    if (hasTimestampType) { // 타임스탬프 타입이 하나라도 있다면 splice

      if (-1 !== this.typeList.indexOf('timestamp')) {
        this.typeList.splice(this.typeList.length-1, 1);
        this.selectedType = '';
        this.prepSelectBoxComponent.selectedItem = null;
        this.isTimestamp = false;
      }
    } else { // 타임스탬프 타입이 없다면
      if (-1 === this.typeList.indexOf('timestamp')) {
        this.typeList.push('timestamp');
      }
    }


    if (!this.hasEditTimestamp) {
      this.selectedTimestamp = '';
      this.hasEditTimestamp = false;
    }
    if ('timestamp' === this.selectedType.toLowerCase()) {
      this.isTimestamp = true;
      this.getTimestampFormats();
    } else if ('string' === this.selectedType.toLowerCase()) {
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
  protected beforeShowComp() {

    // 선택된 컬럼이 타임스탬프일 경우 New type 에서 타임스탬프를 뺸다
    if (-1 !== this._checkIfAtLeastOneColumnIsSelType(this.selectedFields,'timestamp')) {
      let items = [];
      this.selectedFields.forEach((item) => {
        if (item.type.toLowerCase() === 'timestamp') {
          items.push(item);
        }
      });
      if (items.length === this.selectedFields.length) {
        this.typeList.splice(this.typeList.length-1,1);
      }
    }
  }

  /**
   * After component is shown
   * @protected
   */
  protected afterShowComp() {
    if (this.dsId && this.selectedType) { // 컨텍스트 메뉴 이용
      this.defaultIndex = this.typeList.indexOf(this.selectedType.toLowerCase());
      // Only get timestamp formats when it is timestamp type
      if (-1 !== this._checkIfAtLeastOneColumnIsSelType(this.selectedFields, 'timestamp') || this.selectedType.toLowerCase() === 'timestamp' ){
        this.isTimestamp = true;
        this.getTimestampFormats();
      } else {
        this.isTimestamp = false;
      }

    }
  }

  /**
   * parse rule string (When editing)
   * @param data ({ruleString : string, jsonRuleString : any})
   */
  protected parsingRuleString(data: {jsonRuleString : SetTypeRule}) {

    if (typeof data.jsonRuleString.col === 'string') {
      data.jsonRuleString.col = [data.jsonRuleString.col];
    }

    // COLUMN
    let arrFields:string[] = data.jsonRuleString.col;
    this.selectedFields = arrFields.map( item => {
      if(item.length>2 && item.startsWith('`') && item.endsWith('`')) {
        item = item.substring(1,item.length-1);
      }
      return this.fields.find( orgItem => orgItem.name === item );
    } ).filter(field => !!field);

    // TYPE
    this.selectedType = data.jsonRuleString.type.toLowerCase();

    // TODO :
    this.defaultIndex = this.typeList.indexOf(this.selectedType);

    // FORMAT
    if ('timestamp' === this.selectedType || 'string' === this.selectedType) {
      if ('string' === this.selectedType ) { // 선택된 모든 컬럼이 스트링일 떄는 타임스탬프 패턴 지정을 보여줄 필요 없다
        if (-1 === this._checkIfAtLeastOneColumnIsSelType(this.selectedFields, 'timestamp')){
          this.isTimestamp = false;
          return;
        }
      }
      this.isTimestamp = true;
      this.selectedTimestamp = data.jsonRuleString.format;
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
