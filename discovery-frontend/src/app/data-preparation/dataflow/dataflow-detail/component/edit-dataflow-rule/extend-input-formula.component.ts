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

import * as _ from 'lodash';
import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
  Injector,
  OnDestroy,
  OnInit, Output, ViewChild
} from '@angular/core';
import { AbstractComponent } from '@common/component/abstract.component';
import { StringUtil } from '@common/util/string.util';
import { Alert } from '@common/util/alert.util';
import { Field } from '@domain/data-preparation/pr-dataset';
import { DataflowService } from '../../../service/dataflow.service';

declare let $;

@Component({
  selector: 'app-extend-input-formula',
  templateUrl: './extend-input-formula.component.html'
})
export class ExtendInputFormulaComponent extends AbstractComponent implements OnInit, AfterViewInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _functionList: FormulaFunction[] = [];
  private _fields: Field[] = [];
  private _command: string = '';

  private _$calculationInput: any;

  @ViewChild('calculationInput')
  private _calculationInput: ElementRef;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Paging
  public pageFields: Field[] = [];
  public pageSize: number = 10;
  public currentPage: number = 1;
  public lastPage: number = 1;

  // Text
  public verifyStateFormula: string;  // 수식 유효성 상태 - S,F,Null
  public searchFunction: string = '';     // 함수 검색어

  // T/F
  public isShow: boolean = false;
  public isDisableVerifyButton: boolean = false;

  // expression list
  public totalFunctionCategoryList: FormulaFunctionCategory[] = [];
  public functionCategoryList: FormulaFunctionCategory[] = [];
  public selectedCategory: FormulaFunctionCategory;
  public selectedFunction: FormulaFunction;
  public displayDescFunction: FormulaFunction;

  @Output('done')
  public doneEvent: EventEmitter<{ command: string, formula: string }> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private dataflowService: DataflowService) {
    super(elementRef, injector);
    this._initializeFunctionList();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  public ngOnInit() {
    super.ngOnInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Open popup
   * @param {Field[]} fields
   * @param data
   */
  // public open(fields: Field[], command: string, condition?: string) {
  public open(fields: Field[], data:{command : string, val : string, needCol?:boolean}) {
    this.isShow = true;
    this._command = data.command;

    const condition = data.val;
    const needCol = data.needCol; // need $col

    // set fields (columns)
    this._fields = _.cloneDeep(fields);

    // add $col to field list when command is 'SET'
    if ( needCol ) {
      this._fields.unshift({name :'$col', type : 'STRING'});
    }

    this._setFieldPage(1);

    // Input area setting
    this.safelyDetectChanges();
    this._$calculationInput = $(this._calculationInput.nativeElement);

    // set condition
    if (!this.isNullOrUndefined(condition)) {
      this._$calculationInput.text(condition);
    }

    // auto complete setting
    this._setAutoComplete();
  } // function - open


  /**
   * Close popup
   */
  public close() {
    this.isShow = false;
  } // function - close


  /**
   * apply expression and close popup
   */
  public done() {
    // verifyStateFormula 가 Success 아닐때
    // if ('S' !== this.verifyStateFormula) {
    //  return;
    // }

    let expr: string = this._$calculationInput.text();

    // expr = expr.replace(/[[\]]/g, '"');
    expr = StringUtil.trim(expr);
    if (! expr || expr.length < 1){
      Alert.info(this.translateService.instant('msg.dp.alert.check.insert.expression'));
      return;
    }

    // Emit expression
    this.doneEvent.emit({ command: this._command, formula: expr });
    this.close();
  } // function - done


  /**
   * Expression input area Keydown event function
   */
  public calculationInputKeyup(){
      this.verifyStateFormula = null;
      this._setDisableVerifyButton();
  } // function - calculationInputKeyup


  /**
   * Verify expression
   */
  public verifyFormula() {
    const inputText: string = this._$calculationInput.text();
    if (inputText && 0 < inputText.length) {
      this.loadingShow();
      this.dataflowService.validateExpr(inputText).then(() => {
        this.loadingHide();
        this.verifyStateFormula = 'S';
      }).catch(() => {
        this.loadingHide();
        this.verifyStateFormula = 'F';
      });
    }
  } // function - verifyFormula

  /**
   * 필드 선택 -> 추가
   * @param {Field} field
   */
  public selectField(field: Field) {
    const color = '#439fe5';

    this._insertAtCursor('<span style="color: ' + color + '">' + field.name + '<span id="focusElement"></span></span>');

    // 검증 버튼 활성화
    this._setDisableVerifyButton();
  } // function - selectField

  /**
   * 함수 선택 -> 추가
   * @param {FormulaFunction} functionItem
   */
  public selectFunction(functionItem: FormulaFunction) {
    let insertFunction = '<span>';
    insertFunction += functionItem.name + '( <span id="focusElement"></span>';
    insertFunction += ' )</span>';
    this._insertAtCursor(insertFunction);

    // 검증 버튼 활성화
    this._setDisableVerifyButton();
  } // function - selectFunction

  /**
   * 이전 필드 페이지
   */
  public prevFieldPage() {
    this._setFieldPage(this.currentPage - 1);
  } // function - prevFieldPage

  /**
   * 다음 필드 페이지
   */
  public nextFieldPage() {
    this._setFieldPage(this.currentPage + 1);
  } // function - nextFieldPage

  /**
   * 함수 카테고리 선택
   * @param {FormulaFunctionCategory} selectedCategory
   */
  public selectCategory(selectedCategory: FormulaFunctionCategory) {

    if ('ALL' === selectedCategory.key) {
      this.functionCategoryList = this.totalFunctionCategoryList.filter(item => item.key !== 'ALL');
    } else {
      this.functionCategoryList
        = this.totalFunctionCategoryList.filter(item => item.key === FunctionCategory[selectedCategory.key]);
    }
    this.selectedCategory = selectedCategory;

  } // function - selectFunctionCategory

  /**
   * 마우스 오버시 리버시 함수 설명처리
   * @param {FormulaFunction} formulaFunction
   * @param {boolean} flag
   */
  public setCalculationDescription(formulaFunction: FormulaFunction, flag: boolean) {
    if (flag) {
      this.displayDescFunction = formulaFunction;
    } else if (!flag && this.selectedFunction != null) {
      this.displayDescFunction = this.selectedFunction;
    } else {
      this.displayDescFunction = null;
    }
  } // function - setCalculationDescription

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 자동완성 설정
   * @private
   */
  private _setAutoComplete() {

    if (this._$calculationInput.hasOwnProperty('length')) {
      let data: any[] = [];
      data = data.concat(this._fields);
      data = data.concat(this._functionList.map(item => {
        return { name: item.name, category: item.category }
      }));

      this._$calculationInput.atwho({
        at: '',
        data: data,
        limit: 100,
        minLen: 2,
        acceptSpaceBar: true,
        displayTpl: '<li><a href="javascript:"><em class="${class}"></em>${name}</a></li>',
        callbacks: {
          beforeInsert: this._beforeInsertCallback,
          afterInsert: this._afterInsertCallback
        }
      });
      $('.atwho-view').hide();

      this._setDisableVerifyButton();
    }

  } // function - _setAutoComplete

  // noinspection JSMethodCanBeStatic
  /**
   * 자동완성 삽입
   * @param {string} value
   * @param $li
   * @returns {string}
   * @private
   */
  private _beforeInsertCallback(value: string, $li: any): string {

    const data = $li.data().itemData;
    // ddp 앞뒤 공백 제거
    // 시작 문자가 대괄호일 경우 [ 제거
    if (data.category) {
      return '<span >' + value + '( <span id="focusElement"></span> )</span>';
    } else {

      const color = '#439fe5';

      if (value.hasOwnProperty('indexOf') && value.indexOf('[') === 0) {
        return '<span style="color:' + color + '">' + value.substring(1) + '</span>';
      } else {
        return '<span style="color:' + color + '">' + value + '</span>';
      }

    }
  } // function - _beforeInsertCallback

  // noinspection JSMethodCanBeStatic
  /**
   * 자동완성 삽입후
   * @param {string} _value
   * @param _$li
   * @private
   */
  private _afterInsertCallback(_value: string, _$li: any) {

    const sel = window.getSelection();
    const range = document.createRange();

    const focusElement = document.getElementById('focusElement');
    if (focusElement) {
      // 포커스 엘리먼트가 있으면 선택한다
      range.selectNode(focusElement);
      // 컨텐츠span을 제거후
      range.deleteContents();
      sel.removeAllRanges();
      // range를 갱신한다.
      sel.addRange(range);
    }
  } // function - _afterInsertCallback

  /**
   * 필드 페이지 설정
   * @param {number} page
   * @private
   */
  private _setFieldPage(page: number) {

    // 전체 페이지 설정
    this.lastPage = Math.ceil(this._fields.length / this.pageSize);

    // 페이지 번호 범위 설정
    (page < 1) && (page = 1);
    (page > this.lastPage) && (page = this.lastPage);

    // 페이지 설정
    this.currentPage = page;
    const startIdx: number = (this.currentPage - 1) * this.pageSize;
    const endIdx: number = (this.currentPage * this.pageSize);
    this.pageFields = this._fields.slice(startIdx, endIdx);

  } // function - _setFieldPage

  /**
   * 커서가 위치한 곳에 텍스트를 넣는다.
   * @param innerHtml
   */
  private _insertAtCursor(innerHtml) {
    this._$calculationInput.trigger('focus');
    let sel;
    let range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);

        const newSapn = document.createElement('span');
        newSapn.innerHTML = innerHtml;
        range.insertNode(newSapn);
      }
    }

    const focusElement = document.getElementById('focusElement');
    if (focusElement) {
      // 포커스 엘리먼트가 있으면 선택한다
      range.selectNode(focusElement);
      // 컨텐츠span을 제거후
      range.deleteContents();
      sel.removeAllRanges();
      // range를 갱신한다.
      sel.addRange(range);
    }
  } // function - _insertAtCursor

  /**
   * 수식 검증 버튼 활성화 여부 -> 조건 없이 활성화
   */
  private _setDisableVerifyButton() {
    this.verifyStateFormula = null;
    this.isDisableVerifyButton = (0 === this._$calculationInput.text().length);
  } // function - _setDisableVerifyButton

  /**
   * 함수 목록 정의
   * @private
   */
  public _initializeFunctionList() {


    this.dataflowService.getFunctionList().then((result) => {
      this._functionList = result['function_list'];

      // 카테고리 목록 설정
      this.totalFunctionCategoryList.push(
        new FormulaFunctionCategory('ALL', 'ALL')
      );
      this.totalFunctionCategoryList.push(
        new FormulaFunctionCategory(
          FunctionCategory.STRING,
          FunctionCategory.STRING.toString(),
          this._functionList.filter(item => item.category === FunctionCategory.STRING)
        )
      );
      this.totalFunctionCategoryList.push(
        new FormulaFunctionCategory(
          FunctionCategory.LOGICAL,
          FunctionCategory.LOGICAL.toString(),
          this._functionList.filter(item => item.category === FunctionCategory.LOGICAL)
        )
      );
      this.totalFunctionCategoryList.push(
        new FormulaFunctionCategory(
          FunctionCategory.TIMESTAMP,
          FunctionCategory.TIMESTAMP.toString(),
          this._functionList.filter(item => item.category === FunctionCategory.TIMESTAMP)
        )
      );
      this.totalFunctionCategoryList.push(
        new FormulaFunctionCategory(
          FunctionCategory.AGGREGATION,
          FunctionCategory.AGGREGATION.toString(),
          this._functionList.filter(item => item.category === FunctionCategory.AGGREGATION)
        )
      );
      this.totalFunctionCategoryList.push(
        new FormulaFunctionCategory(
          FunctionCategory.MATH,
          FunctionCategory.MATH.toString(),
          this._functionList.filter(item => item.category === FunctionCategory.MATH)
        )
      );

      this.functionCategoryList = this.totalFunctionCategoryList.filter(item => item.key !== 'ALL');

    });


  } // function - _initializeFunctionList

}

enum FunctionCategory {
  STRING = 'STRING',
  LOGICAL = 'LOGICAL',
  TIMESTAMP = 'TIMESTAMP',
  AGGREGATION = 'AGGREGATION',
  MATH = 'MATH'
}

class FormulaFunctionCategory {
  public key: (string | FunctionCategory);
  public label: string;
  public functions: FormulaFunction[];

  constructor(key: (string | FunctionCategory), label: string, functions?: FormulaFunction[]) {
    this.key = key;
    this.label = label;
    (functions) && (this.functions = functions);
  }
}

class FormulaFunction {
  public category: FunctionCategory;
  public name: string;
  public description: string;
  public example: string;
  public exampleResult: string;

  constructor(category: FunctionCategory, name: string, description: string, example: string, exampleResult: string) {
    this.category = category;
    this.name = name;
    this.description = description;
    this.example = example;
    this.exampleResult = exampleResult;
  }
}
