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

import { isUndefined } from 'util';
import { AbstractComponent } from '../../../../../../common/component/abstract.component';
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output, SimpleChange, SimpleChanges,
  ViewChild
} from '@angular/core';
import { Field, Rule } from '../../../../../../domain/data-preparation/dataset';
import { PreparationAlert } from '../../../../../util/preparation-alert.util';
import { DataflowService } from '../../../../service/dataflow.service';

@Component({
  selector: 'rule-condition-input',
  templateUrl: './rule-condition-input.component.html'
})
export class RuleConditionInputComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('inputFormula')
  private _inputFormula: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public fields: Field[];

  @Input()
  public command: string;

  @Input()
  public tabIndex: number;

  @Output()
  public onChange: EventEmitter<string> = new EventEmitter();

  @Input('formula')
  public inputFormula: string;

  @Input()
  public forceFormula: string;

  public formula: string;

  // Auto complete 관련
  public autoCompleteSuggestions: any = [];
  public autoCompleteSuggestions_selectedIdx: number = -1;
  public isAutoCompleteSuggestionListOpen: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
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
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const inputFormulaChanges: SimpleChange = changes.inputFormula;
    const forceFormulaChanges:SimpleChange = changes.forceFormula;
    if( inputFormulaChanges && inputFormulaChanges.firstChange ) {
      this.formula = inputFormulaChanges.currentValue;
    } else if( forceFormulaChanges && forceFormulaChanges.currentValue !== forceFormulaChanges.previousValue ) {
      this.formula = forceFormulaChanges.currentValue;
      this.onChange.emit(this.formula);
    }
  } // function - ngOnChanges

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();

  } // function - ngOnDestroy

  /**
   * Initial execution, set data
   * @param {{ruleVO: Rule, fields: Field[]}} data
   */
  public init(data: { fields: Field[], command: string, ruleVO: Rule, pivotFormulaValueList?: any, idx?: number }) {
  } // end of init

  /**
   * Returns condition va
   * @returns {string}
   */
  public getCondition(): string {
    return this.formula;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - API
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public changeRule($event) {
    if (-2 == this.autoCompleteSuggestions_selectedIdx) {
      this.autoCompleteSuggestions_selectedIdx = -1;
      return;
    }
    let value = undefined;
    if (typeof $event === 'string') {
      value = $event;
    } else {
      if ($event.target && $event.target.value) {
        value = $event.target.value.substring(0, $event.target.selectionStart);
        if ($event.key) {
          if (
            (8 <= $event.keyCode && $event.keyCode <= 9) ||
            (12 <= $event.keyCode && $event.keyCode <= 13) ||
            (16 <= $event.keyCode && $event.keyCode <= 21) ||
            $event.keyCode === 25 ||
            $event.keyCode === 27 ||
            (33 <= $event.keyCode && $event.keyCode <= 47) ||
            (91 <= $event.keyCode && $event.keyCode <= 92) ||
            (112 <= $event.keyCode && $event.keyCode <= 127) ||
            (144 <= $event.keyCode && $event.keyCode <= 145)
          ) {
            // special key
          } else {
            if (($event.metaKey == true || $event.ctrlKey == true) && $event.key == 'v') {
              // paste
              return;
            } else {
              value += $event.key;
            }
          }
        }
      }
      if (this.autoCompleteSuggestions && 0 < this.autoCompleteSuggestions.length) {
        if ($event.keyCode === 38 || $event.keyCode === 40) {
          if ($event.keyCode === 38) {
            this.autoCompleteSuggestions_selectedIdx--;
          } else if ($event.keyCode === 40) {
            this.autoCompleteSuggestions_selectedIdx++;
          }

          if (this.autoCompleteSuggestions_selectedIdx < 0) {
            this.autoCompleteSuggestions_selectedIdx = this.autoCompleteSuggestions.length - 1;
          } else if (this.autoCompleteSuggestions.length <= this.autoCompleteSuggestions_selectedIdx) {
            this.autoCompleteSuggestions_selectedIdx = 0;
          }

          let height = 25;
          this.$element.find('.ddp-list-command').scrollTop(this.autoCompleteSuggestions_selectedIdx * height);

          return false;
        } else if ($event.keyCode === 27) {
          this.isAutoCompleteSuggestionListOpen = false;
          this.autoCompleteSuggestions = [];
          this.autoCompleteSuggestions_selectedIdx = -2;
          return false;
        } else if ($event.keyCode === 13 || $event.keyCode === 108) {
          if (0 <= this.autoCompleteSuggestions_selectedIdx
            && this.autoCompleteSuggestions_selectedIdx < this.autoCompleteSuggestions.length) {
            this.onSelectAutoComplete(this.autoCompleteSuggestions[this.autoCompleteSuggestions_selectedIdx]);
          }
          return false;
        } else if ($event.keyCode === 8 || $event.keyCode === 46 || $event.keyCode === 37 || $event.keyCode === 39) {

          let input = $event.target;
          let input_value = input.value;
          let start = input.selectionStart;
          let end = input.selectionEnd;

          if ($event.keyCode === 8) {
            if (0 <= start && end <= input_value.length) {
              if (start == end) {
                start--;
                end--;
                input_value = input_value.substring(0, start) + input_value.substring(start + 1);
              } else if (start < end) {
                input_value = input_value.substring(0, start) + input_value.substring(end);
                end = start;
              }
            }
          } else if ($event.keyCode === 46) {
            if (0 <= start && end <= input_value.length) {
              if (start == end) {
                input_value = input_value.substring(0, start + 1) + input_value.substring(end + 2);
              } else if (start < end) {
                input_value = input_value.substring(0, start) + input_value.substring(end);
                end = start;
              }
            }
          } else if ($event.keyCode === 37) {
            if (0 < start) {
              start--;
              end--;
            }
          } else if ($event.keyCode === 39) {
            if (end < input_value.length) {
              start++;
              end++;
            }
          }

          input.blur();

          input.value = input_value;
          input.selectionStart = start;
          input.selectionEnd = end;

          input.dispatchEvent(new Event('input'));
          input.focus();

          return false;
        } else if (
          (8 <= $event.keyCode && $event.keyCode <= 9) ||
          (12 <= $event.keyCode && $event.keyCode <= 13) ||
          (16 <= $event.keyCode && $event.keyCode <= 21) ||
          $event.keyCode === 25 ||
          $event.keyCode === 27 ||
          (33 <= $event.keyCode && $event.keyCode <= 47) ||
          (91 <= $event.keyCode && $event.keyCode <= 92) ||
          (112 <= $event.keyCode && $event.keyCode <= 127) ||
          (144 <= $event.keyCode && $event.keyCode <= 145)
        ) {
          return false;
        } else {
          // normal character
        }
      }
    }

    let rulePart = '';
    if (undefined !== value) {
      rulePart = value;
      if (0 < rulePart.length && 0 < this.autoCompleteSuggestions.length) {
        for (let suggest of this.autoCompleteSuggestions) {
          if (rulePart.trim().endsWith(suggest.value)) {
            if (suggest.type != '@_OPERATOR_@'
              && suggest.type != '@_STRING_@'
              && suggest.type != '@_FUNCTION_EXPRESSION_@'
              && suggest.type != '@_AGGREGATE_FUNCTION_EXPRESSION_@') {
              let lastIdx = rulePart.lastIndexOf(suggest.value);
              rulePart = rulePart.substring(0, lastIdx) + suggest.type + rulePart.substring(lastIdx + suggest.value.length);
            }
            break;
          }
        }
      }
    }

    this.onChange.emit(value);

    this.dataflowService.autoComplete('', this.command, rulePart).then((data) => {
      let columnNames = [];

      if (this.command == 'set' && 0 < this.fields.length) {
        columnNames.push('$col');
      }

      for (let _column of this.fields) {
        columnNames.push(_column.name);
      }
      let functionNames = [
        'add_time', 'concat', 'concat_ws', 'day', 'hour', 'if', 'ismismatched', 'isnan', 'isnull', 'length', 'lower', 'ltrim', 'math.abs', 'math.acos', 'math.asin', 'math.atan', 'math.cbrt', 'math.ceil', 'math.cos', 'math.cosh', 'math.exp', 'math.expm1', 'math.getExponent', 'math.round', 'math.signum', 'math.sin', 'math.sinh', 'math.sqrt', 'math.tan', 'math.tanh', 'millisecond', 'minute', 'month', 'now', 'rtrim', 'second', 'substring', 'time_diff', 'timestamp', 'trim', 'upper', 'year'
      ];
      // 2018.5.23  'now','month','day','hour','minute','second','millisecond','if','isnull','isnan','length','trim','ltrim','rtrim','upper','lower','substring','math.abs','math.acos','math.asin','math.atan','math.cbrt','math.ceil','math.cos','math.cosh','math.exp','math.expm1','math.getExponent','math.round','math.signum','math.sin','math.sinh','math.sqrt','math.tan','math.tanh','left','right','if','substring','add_time','concat','concat_ws'
      let functionAggrNames = [
        'sum', 'avg', 'max', 'min', 'count',
      ];
      if (!isUndefined(data.suggest)) {
        let suggests: any = [];
        let ruleSource = '';
        let tokenSource0 = data.suggest[0].tokenSource;
        data.suggest.forEach((item) => {
          if (0 <= item.start) {
            if (item.tokenSource == '<EOF>') {
              item.tokenSource = '';
            }
            if (1 < item.tokenString.length && item.tokenString.startsWith('\'') && item.tokenString.endsWith('\'')) {
              item.tokenString = item.tokenString.substring(1, item.tokenString.length - 1);
            }
            if (item.tokenString == '@_COLUMN_NAME_@') {
              let ts = item.tokenSource;
              if (false == tokenSource0.endsWith(ts)) {
                ts = '';
              }
              for (let columnName of columnNames) {
                if (columnName.startsWith(ts)) {
                  let suggest = {
                    'type': item.tokenString,
                    'class': 'DodgerBlue',
                    'source': item.tokenSource,
                    'value': columnName
                  };
                  suggests.push(suggest);
                }
              }
            } else if (item.tokenString == '@_FUNCTION_EXPRESSION_@') {
              let ts = item.tokenSource;
              if (false == tokenSource0.endsWith(ts)) {
                ts = '';
              }
              for (let functionName of functionNames) {
                if (functionName.startsWith(ts)) {
                  let suggest = {
                    'type': item.tokenString,
                    'class': 'Olive',
                    'source': item.tokenSource,
                    'value': functionName
                  };
                  suggests.push(suggest);
                }
              }
            } else if (item.tokenString == '@_COMPLETED_BRACKET_@') {
              let openidx = ruleSource.lastIndexOf('(');
              let closeidx = ruleSource.lastIndexOf(')');
              if (0 <= openidx && closeidx < openidx) {
                //if( item.tokenSource.startsWith('(') ) {
                let suggest = {
                  'type': item.tokenString,
                  'class': 'LightCoral',
                  'source': item.tokenSource,
                  'value': ')'
                };
                suggests.push(suggest);
              }
            } else if (item.tokenString == '@_STRING_@') {
              if (item.tokenSource.startsWith('\'')) {
                let suggest = {
                  'type': item.tokenString,
                  'class': 'black',
                  'source': item.tokenSource,
                  'value': '\''
                };
                suggests.push(suggest);
              }
            } else if (item.tokenString == 'LONG') {
            } else if (item.tokenString == 'DOUBLE') {
            } else if (item.tokenString == 'BOOLEAN') {
            } else if (item.tokenString == '@_AGGREGATE_FUNCTION_EXPRESSION_@') {
              for (let functionName of functionAggrNames) {
                if (functionName.startsWith(item.tokenSource)) {
                  let suggest = {
                    'type': item.tokenString,
                    'class': 'Olive',
                    'source': item.tokenSource,
                    'value': functionName
                  };
                  suggests.push(suggest);
                }
              }
            } else if (item.tokenString == 'count' || item.tokenString == 'avg' || item.tokenString == 'sum' || item.tokenString == 'min' || item.tokenString == 'max') {
              if (item.tokenString.startsWith(item.tokenSource)) {
                let suggest = {
                  'type': '@_AGGREGATE_FUNCTION_EXPRESSION_@', // item.tokenString,
                  'class': 'Olive',
                  'source': item.tokenSource,
                  'value': item.tokenString
                };
                suggests.push(suggest);
              }
            } else {
              let suggest = {
                'type': '@_OPERATOR_@',
                'class': 'LightCoral',
                'source': item.tokenSource,
                'value': item.tokenString
              };

              // column name for aggregate function
              if (suggest.value == ')' &&
                (tokenSource0.startsWith('sum') || tokenSource0.startsWith('avg') || tokenSource0.startsWith('min') || tokenSource0.startsWith('max'))
              ) {
                let colnameIdx = tokenSource0.lastIndexOf('(');
                let ts = tokenSource0.substring(colnameIdx + 1);
                for (let columnName of columnNames) {
                  if (columnName.startsWith(ts)) {
                    let suggest = {
                      'type': '@_COLUMN_NAME_@',
                      'class': 'DodgerBlue',
                      'source': item.tokenSource,
                      'value': columnName
                    };
                    suggests.push(suggest);
                  }
                }
              }
              if (suggest.value != '(' && suggest.value != ')') {
                suggests.push(suggest);
              }
            }
          } else if (-1 == item.start && -1 == item.stop && -1 == item.tokenNum) {
            ruleSource = item.tokenSource;
          }
        });
        this.autoCompleteSuggestions_selectedIdx = -1;
        this.autoCompleteSuggestions = suggests;
        if (0 <= suggests.length) {
          this.isAutoCompleteSuggestionListOpen = true;
        } else {
          this.isAutoCompleteSuggestionListOpen = false;
        }
      }
    }).catch((error) => {
      this.isAutoCompleteSuggestionListOpen = false;
      this.autoCompleteSuggestions_selectedIdx = -1;
      this.autoCompleteSuggestions = [];

      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
    });
  } // function - changeRule

  public onSelectAutoComplete(item) {

    let input = this._inputFormula.nativeElement;

    if (isUndefined(input)) {
      return;
    }

    let start = input.selectionStart;
    let end = input.selectionEnd;
    let inputVal = input.value;

    let result: any[] = [];
    if ('pivot' === this.command || 'aggregate' === this.command) {
      result = this.formulaSuggestionPivot(item, inputVal, start, end);
    } else {
      result = this.formulaSuggestion(item, inputVal, start, end);
    }

    input.blur();

    input.value = result[0];
    input.selectionStart = result[1];
    input.selectionEnd = result[1];

    this.formula = input.value;
    this.safelyDetectChanges();
    this.onChange.emit(this.formula);

    input.focus();

  }

  public formulaSuggestion(item, inputVal, start, end) {

    let value = inputVal.substring(0, start);

    if (item.type != '@_OPERATOR_@') { // && item.type!="@_FUNCTION_EXPRESSION_@" ) {
      if (start < end) {
        value = inputVal.substring(0, end);
      }
      let lastIdx = value.lastIndexOf(item.source);
      if (-1 != lastIdx && value.endsWith(item.source)) {
        value = value.substring(0, lastIdx);
      }
    }

    let len_of_head = value.length;
    value += item.value;
    let caretPos = value.length;
    let tail = inputVal.substring(end);
    if (start == end && len_of_head <= start) {
      let part_of_tail = value.substring(start);
      if (tail.indexOf(part_of_tail) == 0) {
        tail = tail.substring(part_of_tail.length);
      }
    }
    value += tail;

    return [value, caretPos];
  } // function - formulaSuggestion

  public formulaSuggestionPivot(item, inputVal, start, end) {

    let value = inputVal.substring(0, start);

    if (item.type == '@_AGGREGATE_FUNCTION_EXPRESSION_@') {
      value = item.value;
    } else if (item.type == '@_COLUMN_NAME_@') {
      let bracketIdx = value.lastIndexOf('(');
      value = value.substring(0, bracketIdx);
      let colname = value.substring(bracketIdx + 1);
      if (item.value.startsWith(colname)) {
        value += '(';
      } else {
        value += '(' + colname;
      }
      value += item.value;
    } else if (item.type == '@_OPERATOR_@') {
      value += item.value;
    }

    let caretPos = value.length;

    return [value, caretPos];
  } // function - formulaSuggestionPivot

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
