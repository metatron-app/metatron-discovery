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
import { AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Field } from '../../../../../../domain/data-preparation/pr-dataset';
import { Alert } from '../../../../../../common/util/alert.util';
import {isNullOrUndefined, isUndefined} from 'util';

@Component({
  selector: 'edit-rule-rename',
  templateUrl: './edit-rule-rename.component.html'
})
export class EditRuleRenameComponent extends EditRuleComponent implements OnInit, AfterViewInit, OnDestroy {
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
  public newFieldName: string = '';

  @ViewChild('newColName')
  private _newColName: ElementRef;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
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
   * @return {{command: string, to: string, col: string, ruleString: string}}
   */
  public getRuleData(): { command: string, to: string, col: string, ruleString: string } {


    // Check if at least one column is selected
    if (isUndefined(this.selectedFields) || 0 === this.selectedFields.length) {
      Alert.warning(this.translateService.instant('msg.dp.alert.sel.col'));
      return undefined
    }

    // check if new column name is empty
    if (isUndefined(this.newFieldName) || '' === this.newFieldName.trim()) {
      Alert.warning(this.translateService.instant('msg.dp.alert.insert.new.col'));
      return undefined
    }

    // Check if name is duplicate
    if (this.fields.some(item => this.selectedFields[0].name !== this.newFieldName && item.name ===  this.newFieldName)) {
      Alert.warning(this.translateService.instant('msg.dp.alert.duplicate.colname'));
      return undefined
    }

    // check if column name has back quote
    if (-1 !== this.newFieldName.indexOf('`')) {
      Alert.warning(this.translateService.instant('msg.dp.alert.no.backtick.colname'));
      return undefined;
    }

    let selectedFieldName:string = this.selectedFields[0].name;

    return {
      command: 'rename',
      to: this.newFieldName,
      col: selectedFieldName,
      ruleString: 'rename col: `' + selectedFieldName + '`' + ` to: '${this.newFieldName}'`
    };

  } // function - getRuleData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 필드 변경
   * @param {{target: Field, isSelect: boolean, selectedList: Field[]}} data
   */
  public changeFields(data: { target: Field, isSelect: boolean, selectedList: Field[] }) {
    this.selectedFields = data.selectedList;
  } // function - changeFields

  /**
   * Multicolumn rename popup open
   */
  public onMultiColumnRenameClick() {
    this.onEvent.emit({ cmd: 'RENAME_MULTI_COLUMN' });
  } // function - onMultiColumnRenameClick

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
    if (this.selectedFields.length === 1 && isNullOrUndefined(this.newFieldName)) {
      this.newFieldName = this.selectedFields[0].name + '_1';
    }
    setTimeout(() => {
      this._newColName.nativeElement.focus();
    });
  } // function - _afterShowComp

  /**
   * parse ruleString
   * @param data ({ruleString : string, jsonRuleString : any})
   */
  protected parsingRuleString(data: {ruleString : string, jsonRuleString : any}) {

    // COLUMN
    let arrFields:string[] = typeof data.jsonRuleString.col.value === 'string' ? [data.jsonRuleString.col.value] : data.jsonRuleString.col.value;
    this.selectedFields = arrFields.map( item => this.fields.find( orgItem => orgItem.name === item ) ).filter(field => !!field);

    // NEW COLUMN NAME
    if (data.jsonRuleString.to.escapedValue) {
      this.newFieldName = data.jsonRuleString.to.escapedValue;
    } else {
      this.newFieldName = '';
    }

  } // function - _parsingRuleString

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
