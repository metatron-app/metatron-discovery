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

import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
  Injector,
  OnDestroy,
  OnInit, Output, ViewChild
} from '@angular/core';
import { AbstractComponent } from '../../../../../common/component/abstract.component';
import { Field } from '../../../../../domain/data-preparation/dataset';
import { StringUtil } from '../../../../../common/util/string.util';
import { DataflowService } from '../../../service/dataflow.service';
import { Alert } from '../../../../../common/util/alert.util';
import * as _ from 'lodash';
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

  // 페이징 관련
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

  // 수식 함수 목록
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

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private dataflowService: DataflowService) {
    super(elementRef, injector);
    this._initializeFunctionList();
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
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 팝업 열기
   * @param {Field[]} fields
   * @param {string} command : 수식 입력 대상 커맨드 명
   */
  public open(fields: Field[], command: string, forceCondition? : string ) {
    this.isShow = true;
    this._command = command;

    if ( (! forceCondition) || forceCondition == null )  forceCondition = '';

    // 필드 설정
    this._fields = _.cloneDeep(fields);

    // set 은 field 목록에 $col 추가
    if ('set' === this._command) {
      //this._fields.unshift({name :'$col', type : 'STRING'});
      this._fields.unshift({name :'$col', type : 'STRING'});
    }

    this._setFieldPage(1);

    // Input 영역 설정
    this.safelyDetectChanges();
    this._$calculationInput = $(this._calculationInput.nativeElement);

    this._$calculationInput.text(forceCondition);

    // 자동완성 설정
    this._setAutoComplete();
  } // function - open

  /**
   * 팝업 닫기
   */
  public close() {
    this.isShow = false;
  } // function - close

  /**
   * 수식 적용 및 팝업 닫기
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

    // 수식 반환
    this.doneEvent.emit({ command: this._command, formula: expr });
    this.close();
  } // function - done
  /**
   * 수식 입력 영역 키다운 이벤트 함수
   */
  public calculationInputKeyup(){
      this.verifyStateFormula = null;
      this._setDisableVerifyButton();``
  }

  /**
   * 수식 검증
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
    let color = '#439fe5';

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

      let color = '#439fe5';

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
   * @param {string} value
   * @param $li
   * @private
   */
  private _afterInsertCallback(value: string, $li: any) {

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

    // 함수 목록 설정
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'length', 'msg.dp.ui.expression.functiondesc.string.length', 'length(‘hello world’)<br>&gt;11')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'upper', 'msg.dp.ui.expression.functiondesc.string.upper', 'upper(‘Hello world’)<br>&gt;’HELLO WORLD’')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'lower', 'msg.dp.ui.expression.functiondesc.string.lower', 'lower(‘Hello WORLD’)<br>&gt;’hello world’')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'trim', 'msg.dp.ui.expression.functiondesc.string.trim','trim(‘  .   Hi!   ‘)<br>&gt;‘.   Hi!’')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'ltrim', 'msg.dp.ui.expression.functiondesc.string.ltrim','ltrim(‘  .   Hi!   ‘)<br>&gt;’.   Hi!   ‘')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'rtrim', 'msg.dp.ui.expression.functiondesc.string.rtrim','rtrim(‘  .   Hi!   ‘)<br>&gt;‘  .   Hi!’')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'substring', 'msg.dp.ui.expression.functiondesc.string.substring.','substring(‘hello world’, 1, 7)<br>&gt;‘ello w’')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'concat', 'msg.dp.ui.expression.functiondesc.string.concat','concat(‘1980’, ’02’)<br>&gt;‘198002’')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'concat_ws', 'msg.dp.ui.expression.functiondesc.string.concat_ws','concat(separator, stirng_value1, string_value2)<br>concat_ws(‘-‘, ‘010’, ‘1234’, ‘5678’)<br>&gt;’010-1234-5678’')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.LOGICAL, 'if', 'msg.dp.ui.expression.functiondesc.logical.if','if(gender==‘male’)<br>&gt;TRUE')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.LOGICAL, 'ismismatched', 'msg.dp.ui.expression.functiondesc.logical.ismismatched','')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.LOGICAL, 'isnull', 'msg.dp.ui.expression.functiondesc.logical.isnull','isnull(telephone)<br>&gt;FALSE')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.LOGICAL, 'isnan', 'msg.dp.ui.expression.functiondesc.logical.isnan','isnan(1000/ratio)<br>&gt;FALSE')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'year', 'msg.dp.ui.expression.functiondesc.timestamp.year','year(birthday)<br>&gt; 1987')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'month', 'msg.dp.ui.expression.functiondesc.timestamp.month','month(birthday)<br>&gt; 2')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'day', 'msg.dp.ui.expression.functiondesc.timestamp.day','day(birthday)<br>&gt; 13')
  );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'hour', 'msg.dp.ui.expression.functiondesc.timestamp.hour','hour(last_login)<br>&gt; 21')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'minute', 'msg.dp.ui.expression.functiondesc.timestamp.minute','minute(last_login)<br>&gt; 49')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'second', 'msg.dp.ui.expression.functiondesc.timestamp.second','second(last_login)<br>&gt; 28')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'millisecond', 'msg.dp.ui.expression.functiondesc.timestamp.millisecond','millisecond(last_login)<br>&gt; 831')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'now', 'msg.dp.ui.expression.functiondesc.timestamp.now','now()<br>&gt;2018-04-18T12:20:90.220Z')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'add_time', 'msg.dp.ui.expression.functiondesc.timestamp.add_time','add_time(timestamp, delta, time_unit)<br>&gt;add_time(end_date, 10, ‘day’)')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.AGGREGATION, 'sum', 'msg.dp.ui.expression.functiondesc.aggregation.sum','sum(profit)')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.AGGREGATION, 'avg', 'msg.dp.ui.expression.functiondesc.aggregation.avg','avg(profit)')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.AGGREGATION, 'max', 'msg.dp.ui.expression.functiondesc.aggregation.max','max(profit)')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.AGGREGATION, 'min', 'msg.dp.ui.expression.functiondesc.aggregation.min','min(profit)')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.AGGREGATION, 'count', 'msg.dp.ui.expression.functiondesc.aggregation.count','count()')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.abs', 'msg.dp.ui.expression.functiondesc.math.abs','math.abs(-10)<br>&gt;10')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.acos', 'msg.dp.ui.expression.functiondesc.math.acos','math.acos(-1)<br>&gt; 3.141592653589793')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.asin', 'msg.dp.ui.expression.functiondesc.math.asin','math.asin(-1)<br>&gt;-1.5707963267948966')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.atan', 'msg.dp.ui.expression.functiondesc.math.atan','math.atan(-1)<br>&gt;-0.7853981633974483')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.cbrt', 'msg.dp.ui.expression.functiondesc.math.cbrt','math.cbrt(5)<br>&gt; 1.709975946676697')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.ceil', 'msg.dp.ui.expression.functiondesc.math.ceil','math.ceil(15.142)<br>&gt; 16')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.cos', 'msg.dp.ui.expression.functiondesc.math.cos','math.cos(45)<br>&gt;0.5253219888177297')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.cosh', 'msg.dp.ui.expression.functiondesc.math.cosh','math.cosh(9)<br>&gt;COSH(9) &equals;&gt; 4051.5420254925943')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.exp', 'msg.dp.ui.expression.functiondesc.math.exp','math.exp(4)<br>&gt;54.598150033144236')

    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.expm1', 'msg.dp.ui.expression.functiondesc.math.expm1','math.expm1(4)<br>&gt;53.598150033144236')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.getExponent', 'msg.dp.ui.expression.functiondesc.math.getExponent','math.getExponent(9)<br>&gt;3')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.round', 'msg.dp.ui.expression.functiondesc.math.round','math.round(14.2)<br>&gt;14')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.signum', 'msg.dp.ui.expression.functiondesc.math.signum','math.signum(-24)<br>&gt;-1')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.sin', 'msg.dp.ui.expression.functiondesc.math.sin','math.sin(90)<br>&gt;0.8939966636005579')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.sinh', 'msg.dp.ui.expression.functiondesc.math.sinh','math.sinh(1)<br>&gt;1.1752011936438014')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.sqrt', 'msg.dp.ui.expression.functiondesc.math.sqrt','math.sqrt(4)<br>&gt;2')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.tan', 'msg.dp.ui.expression.functiondesc.math.tan','math.tan(10)<br>&gt;0.6483608274590866')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.tanh', 'msg.dp.ui.expression.functiondesc.math.tanh','math.tanh(4)<br>&gt;0.999329299739067')
    );

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

  } // function - _initializeFunctionList

}

enum FunctionCategory {
  STRING = <any>'STRING',
  LOGICAL = <any>'LOGICAL',
  TIMESTAMP = <any>'TIMESTAMP',
  AGGREGATION = <any>'AGGREGATION',
  MATH = <any>'MATH'
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

  constructor(category: FunctionCategory, name: string, description: string, example: string) {
    this.category = category;
    this.name = name;
    this.description = description;
    this.example = example;
  }
}
