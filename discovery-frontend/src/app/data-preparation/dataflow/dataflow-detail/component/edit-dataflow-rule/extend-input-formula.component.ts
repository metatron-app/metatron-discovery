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
  public open(fields: Field[], command: string) {
    this.isShow = true;
    this._command = command;

    // 필드 설정
    this._fields = fields;
    this._setFieldPage(1);

    // Input 영역 설정
    this.safelyDetectChanges();
    this._$calculationInput = $(this._calculationInput.nativeElement);

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
    if ('S' !== this.verifyStateFormula) {
      return;
    }

    let expr: string = this._$calculationInput.text();
    // expr = expr.replace(/[[\]]/g, '"');
    expr = StringUtil.trim(expr);

    // 수식 반환
    this.doneEvent.emit({ command: this._command, formula: expr });
    this.close();
  } // function - done

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
   * 수식 검증 버튼 활성화 여부
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
      new FormulaFunction(FunctionCategory.STRING, 'length', '입력된 문자열의 길이를 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'upper', '입력된 문자열 내의 알파벳을 모두 대문자로 치환하여 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'lower', '입력된 문자열 내의 알파벳을 모두 소문자로 치환하여 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'trim', '입력된 문자열의 앞/뒤에 있는 공백을 제거하여 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'ltrim', '입력된 문자열의 앞(왼쪽)에 있는 공백을 제거하여 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'rtrim', '입력된 문자열의 뒤(오른쪽)에 있는 공백을 제거하여 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'substring', '입력된 문자열의 일부를 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'concat', '입력된 복수의 문자열을 연결하여 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.STRING, 'concat_ws', '입력된 복수의 문자열을 연결하면서 문자열 사이에 Separator(구분자)를 넣어 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.LOGICAL, 'if', '조건문을 검사하여 TRUE나 FALSE에 해당하는 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.LOGICAL, 'isnull', '입력된 컬럼의 값이 null 인지 판단합니다. null이면 TRUE, 아니면 FALSE를 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.LOGICAL, 'isnan', '입력된 값이 NaN(Not-a-Number) 인지 판단합니다. NaN이면 TRUE, 아니면 FALSE를 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'year', '입력된 Timestamp 값에서 연도에 해당하는 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'month', '입력된 Timestamp 값에서 월에 해당하는 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'day', '입력된 Timestamp 값에서 일에 해당하는 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'hour', '입력된 Timestamp 값에서 시간에 해당하는 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'minute', '입력된 Timestamp 값에서 분에 해당하는 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'second', '입력된 Timestamp 값에서 초에 해당하는 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'millisecond', '입력된 Timestamp 값에서 밀리초(1/1000 초)에 해당하는 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'now', '입력된 Timezone 기준의 현재 시간을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.TIMESTAMP, 'add_time', '입력된 Timestamp 값에 일정 Time unit 값을 더하거나 뺀 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.AGGREGATION, 'sum', '대상 값들의 합을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.AGGREGATION, 'avg', '대상 값들의 평균을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.AGGREGATION, 'max', '대상 값들 중 가장 큰 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.AGGREGATION, 'min', '대상 값들 중 가장 작은 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.AGGREGATION, 'count', '대상의 줄(row)수를 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.abs', '입력된 값의 절대값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.acos', '입력된 값의 아크코사인 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.asin', '입력된 값의 아크사인 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.atan', '입력된 값의 아크탄젠트 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.cbrt', '입력된 값의 세제곱근 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.ceil', '입력된 값을 일의 배수가 되도록 올림한 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.cos', '입력된 값의 코사인 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.cosh', '입력된 값의 하이퍼볼릭 코사인 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.exp', '자연 로그값 e를 입력된 값만큼 거듭제곱한 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.expm1', '자연 로그값 e를 입력된 값만큼 거듭제곱한 값에서 1을 뺀 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.getExponent', '입력된 값 N에 대하여 2exp <= N을 만족하는 exp 값 중 가장 큰 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.round', '입력된 값을 일의 자리로 반올림 한 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.signum', '입력된 값의 부호를 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.sin', '입력된 값의 사인 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.sinh', '입력된 값의 하이퍼볼릭 사인 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.sqrt', '입력된 값의 제곱근을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.tan', '입력된 값의 탄젠트 값을 반환합니다.')
    );
    this._functionList.push(
      new FormulaFunction(FunctionCategory.MATH, 'math.tanh', '입력된 값의 하이퍼볼릭 탄젠트 값을 반환합니다.')
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

  constructor(category: FunctionCategory, name: string, description: string) {
    this.category = category;
    this.name = name;
    this.description = description;
  }
}
