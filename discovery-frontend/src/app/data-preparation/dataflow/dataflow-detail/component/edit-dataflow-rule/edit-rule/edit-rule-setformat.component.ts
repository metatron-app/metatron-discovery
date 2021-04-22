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

import {AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {StringUtil} from '@common/util/string.util';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {Field} from '@domain/data-preparation/pr-dataset';
import {SetFormatRule} from '@domain/data-preparation/prep-rules';
import {DataflowService} from '../../../../service/dataflow.service';
import {PrepSelectBoxCustomComponent} from '../../../../../util/prep-select-box-custom.component';
import {EditRuleComponent} from './edit-rule.component';

@Component({
  selector: 'edit-rule-setformat',
  templateUrl: './edit-rule-setformat.component.html'
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
  public timestampFormats: any = [];
  public dsId: string = '';
  public isGetTimestampRunning: boolean = false;

  // 상태 저장용 T/F
  public isFocus: boolean = false;         // Input Focus 여부
  public isTooltipShow: boolean = false;   // Tooltip Show/Hide

  public selectedTimestamp: string = '';
  public customTimestamp: string; // custom format

  private tempTimetampValue: string = '';

  public defaultIndex: number = -1;
  public colTypes: any = [];

  @ViewChild(PrepSelectBoxCustomComponent)
  protected _custom: PrepSelectBoxCustomComponent;

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
   * When timestamp format is selected
   * @param data
   */
  public selectItem(data) {
    this.selectedTimestamp = data.value;
  }

  /**
   * Get timestamp formats from server
   */
  private getTimestampFormats() {
    if (!this.isGetTimestampRunning) {
      this.isGetTimestampRunning = true;
      const cols = this.selectedFields.map((item) => {
        return item.name
      });

      this.tempTimetampValue = this.selectedTimestamp;

      this.dataflowService.getTimestampFormatSuggestions(this.dsId, {colNames: cols}).then((result) => {

        const keyList = [];
        for (const key in result) {
          if (result.hasOwnProperty(key)) {
            keyList.push(key);
          }
        }
        this.timestampFormats = [];
        for (const i in result[keyList[0]]) {
          if (result[keyList[0]].hasOwnProperty(i)) {
            this.timestampFormats.push({value: i, isHover: false, matchValue: result[keyList[0]][i]})
          }
        }

        // When at least one column is selected or this.selectedTimestamp is not empty
        this.selectedTimestamp = this.tempTimetampValue;
        if (cols.length > 0 || '' !== this.tempTimetampValue) {
          if ('' === this.tempTimetampValue && this.selectedFields[0]) {
            const idx = this._getFieldNameArray().indexOf(this.selectedFields[0].name);
            if (idx !== undefined && idx >= 0) {
              this.selectedTimestamp = this.colTypes[idx].timestampStyle;
            }
          }
        }
        this.isGetTimestampRunning = false;
        this.setSelectedTimestamp();
      });
    }

  }


  /**
   * Set selected timestamp index in select box
   */
  private setSelectedTimestamp() {
    let tempnum: number = -1;
    if (this.selectedTimestamp !== null && this.selectedTimestamp !== '' && -1 !== this._timestampValueArray().indexOf(this.selectedTimestamp)) {
      tempnum = this._timestampValueArray().indexOf(this.tempTimetampValue);
    }
    this._custom.setSelectedItem(this.timestampFormats, this.selectedTimestamp, tempnum);
  }


  /**
   * Rule 형식 정의 및 반환
   * @return {{command: string, col: string, ruleString: string}}
   */
  public getRuleData(): { command: string, ruleString: string, uiRuleString: SetFormatRule } {

    // 선택된 컬럼
    if (0 === this.selectedFields.length) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return undefined;
    }

    if ('Custom format' === this.selectedTimestamp && '' === this.customTimestamp || '' === this.selectedTimestamp) {
      Alert.warning(this.translateService.instant('msg.dp.alert.format.error'));
      return undefined;
    }

    let ruleString = 'setformat col: '
      + this.getColumnNamesInArray(this.selectedFields, true).toString()
      + ' format: ';

    let val: any = this.selectedTimestamp === 'Custom format' ? this.customTimestamp : this.selectedTimestamp;
    const check = StringUtil.checkSingleQuote(val, {isPairQuote: false, isWrapQuote: true});
    if (check[0] === false) {
      Alert.warning(this.translateService.instant('msg.dp.alert.invalid.timestamp.val'));
      return undefined;
    } else {
      val = check[1];
    }
    ruleString += val;

    return {
      command: 'setformat',
      ruleString: ruleString,
      uiRuleString: {
        name: 'setformat',
        col: this.getColumnNamesInArray(this.selectedFields),
        format: this.selectedTimestamp === 'Custom format' ? this.customTimestamp : this.selectedTimestamp,
        isBuilder: true
      }
    };

  } // function - getRuleData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * When selected column is changed
   * @param {{target: Field, isSelect: boolean, selectedList: Field[]}} data
   */
  public changeFields(data: { target?: Field, isSelect?: boolean, selectedList: Field[] }) {
    this.selectedFields = data.selectedList;
    this.selectedTimestamp = '';

    if (0 === this.selectedFields.length) { // if theres nothing selected
      this.selectedTimestamp = '';
      this.defaultIndex = -1;
    } else {
      this.getTimestampFormats();
    }

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
   * Before component is shown
   * @protected
   */
  protected beforeShowComp() {

    this.fields = this.fields.filter((item) => {
      return item.type === 'TIMESTAMP'
    });

    this.selectedFields = this.selectedFields.filter((item) => {
      return item.type === 'TIMESTAMP'
    });

  } // function - _beforeShowComp

  /**
   * After component is shown
   * @protected
   */
  protected afterShowComp() {

  } // function - _afterShowComp

  /**
   * Rule string parse
   * @param data ({ruleString : string, jsonRuleString : any})
   */
  protected parsingRuleString(data: { jsonRuleString: SetFormatRule }) {

    // COLUMN
    const arrFields: string[] = data.jsonRuleString.col;
    this.selectedFields = arrFields.map(item => this.fields.find(orgItem => orgItem.name === item)).filter(field => !!field);

    // FORMAT
    if (!this.isNullOrUndefined(data.jsonRuleString.format)) {
      this.selectedTimestamp = data.jsonRuleString.format;
      this.getTimestampFormats();
    }

  } // function - _parsingRuleString


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
