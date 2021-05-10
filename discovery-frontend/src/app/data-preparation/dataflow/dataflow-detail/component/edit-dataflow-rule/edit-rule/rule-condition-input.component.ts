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

import {isUndefined} from 'util';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {AbstractComponent} from '@common/component/abstract.component';
import {Field} from '@domain/data-preparation/pr-dataset';
import {PreparationAlert} from '../../../../../util/preparation-alert.util';
import {DataflowService} from '../../../../service/dataflow.service';

@Component({
  selector: 'rule-condition-input',
  templateUrl: './rule-condition-input.component.html'
})
export class RuleConditionInputComponent extends AbstractComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
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

  @Input()
  public forceCondition: string;

  public formula: string;

  @Input()
  public placeholder: string = this.translateService.instant('msg.dp.th.condition.ph');

  // Auto complete 관련
  public autoCompleteSuggestions: any = [];
  public autoCompleteSuggestionsSelectedIdx: number = -1;
  public isAutoCompleteSuggestionListOpen: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector,
    private broadCaster: EventBroadcaster,
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

    this.broadCaster.on<any>('EDIT_RULE_SHOW_HIDE_LAYER').subscribe((_data: { id: string, isShow: boolean }) => {
      this.isAutoCompleteSuggestionListOpen = false;
    })
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
    const forceFormulaChanges: SimpleChange = changes.forceFormula;
    const forceConditionChanges: SimpleChange = changes.forceCondition;
    if (inputFormulaChanges && inputFormulaChanges.firstChange) {
      this.formula = inputFormulaChanges.currentValue;
    } else if (forceFormulaChanges && forceFormulaChanges.currentValue !== forceFormulaChanges.previousValue) {
      this.formula = forceFormulaChanges.currentValue;
      this.onChange.emit(this.formula);
    } else if (forceConditionChanges && forceConditionChanges.currentValue !== forceConditionChanges.previousValue) {
      this.formula = forceConditionChanges.currentValue;
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
   * Set focus on input
   */
  public setFocus() {
    this._inputFormula.nativeElement.focus();
  }

  /**
   * Returns condition va
   * @returns {string}
   */
  public getCondition(): string {
    return this.formula;
  }

  /**
   * When you want to set value to input
   * @param {string} condition
   */
  public setCondition(condition: string) {
    this.formula = condition;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - API
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public changeRule($event) {
    if (-2 === this.autoCompleteSuggestionsSelectedIdx) {
      this.autoCompleteSuggestionsSelectedIdx = -1;
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
            if (($event.metaKey === true || $event.ctrlKey === true) && $event.key === 'v') {
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
          if ($event.keyCode === 38) {  // Arrow Up
            this.autoCompleteSuggestionsSelectedIdx--;
          } else if ($event.keyCode === 40) { // Arrow Down
            this.autoCompleteSuggestionsSelectedIdx++;
          }
          if (this.autoCompleteSuggestionsSelectedIdx < 0) {
            this.autoCompleteSuggestionsSelectedIdx = this.autoCompleteSuggestions.length - 1;
          } else if (this.autoCompleteSuggestions.length <= this.autoCompleteSuggestionsSelectedIdx) {
            this.autoCompleteSuggestionsSelectedIdx = 0;
          }
          const height = 25;
          this.$element.find('.ddp-list-command').scrollTop(this.autoCompleteSuggestionsSelectedIdx * height);
          return false;
        } else if ($event.keyCode === 27) {   // ESC
          this.isAutoCompleteSuggestionListOpen = false;
          this.autoCompleteSuggestions = [];
          this.autoCompleteSuggestionsSelectedIdx = -2;
          return false;
        } else if ($event.keyCode === 13 || $event.keyCode === 108) {   // Enter
          if (0 <= this.autoCompleteSuggestionsSelectedIdx
            && this.autoCompleteSuggestionsSelectedIdx < this.autoCompleteSuggestions.length) {
            this.onSelectAutoComplete(this.autoCompleteSuggestions[this.autoCompleteSuggestionsSelectedIdx]);
          }
          return false;
        } else if ($event.keyCode === 8 || $event.keyCode === 46 || $event.keyCode === 37 || $event.keyCode === 39) {
          if (!$event.shiftKey) {
            const input = $event.target;
            let inputValue = input.value;
            let start = input.selectionStart;
            let end = input.selectionEnd;
            if ($event.keyCode === 8) {
              // 8 : Backspace
              if (0 <= start && end <= inputValue.length) {
                if (start === end) {
                  start--;
                  end--;
                  inputValue = inputValue.substring(0, start) + inputValue.substring(start + 1);
                } else if (start < end) {
                  inputValue = inputValue.substring(0, start) + inputValue.substring(end);
                  end = start;
                }
              }
            } else if ($event.keyCode === 46) {
              // 46 : Delete
              if (0 <= start && end <= inputValue.length) {
                if (start === end) {
                  inputValue = inputValue.substring(0, start + 1) + inputValue.substring(end + 2);
                } else if (start < end) {
                  inputValue = inputValue.substring(0, start) + inputValue.substring(end);
                  end = start;
                }
              }
            } else if ($event.keyCode === 37 && !$event.shiftKey) {
              // 37 : Arrow Left
              if (0 < start) {
                start--;
                end--;
              }
            } else if ($event.keyCode === 39 && !$event.shiftKey) {
              // 37 : Arrow Right
              if (end < inputValue.length) {
                start++;
                end++;
              }
            }
            input.blur();
            input.value = inputValue;
            input.selectionStart = start;
            input.selectionEnd = end;
            input.dispatchEvent(new Event('input'));
            input.focus();
            return false;
          }
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
        for (const suggest of this.autoCompleteSuggestions) {
          if (rulePart.trim().endsWith(suggest.value)) {
            if (suggest.type !== '@_OPERATOR_@'
              && suggest.type !== '@_STRING_@'
              && suggest.type !== '@_FUNCTION_EXPRESSION_@'
              && suggest.type !== '@_AGGREGATE_FUNCTION_EXPRESSION_@'
              && suggest.type !== '@_WINDOW_FUNCTION_EXPRESSION_@'
            ) {
              const lastIdx = rulePart.lastIndexOf(suggest.value);
              rulePart = rulePart.substring(0, lastIdx) + suggest.type + rulePart.substring(lastIdx + suggest.value.length);
            }
            break;
          }
        }
      }
    }
    this.onChange.emit(value);
    this.dataflowService.autoComplete('', this.command, rulePart).then((data) => {
      const columnNames = [];
      if (this.command === 'set' && 0 < this.fields.length) {
        columnNames.push('$col');
      }
      for (const _column of this.fields) {
        columnNames.push(_column.name);
      }
      const functionNames = [
        'contains', 'startswith', 'endswith', 'add_time', 'concat', 'concat_ws', 'day', 'hour', 'if', 'ismismatched', 'isnan', 'isnull', 'length', 'lower', 'ltrim', 'math.abs', 'math.acos', 'math.asin', 'math.atan', 'math.cbrt', 'math.ceil', 'math.cos', 'math.cosh', 'math.exp', 'math.expm1', 'math.getExponent', 'math.round', 'math.signum', 'math.sin', 'math.sinh', 'math.sqrt', 'math.tan', 'math.tanh', 'millisecond', 'minute', 'month', 'now', 'rtrim', 'second', 'substring', 'time_diff', 'timestamp', 'trim', 'upper', 'year'
      ];
      const functionAggrNames = [
        'sum', 'avg', 'max', 'min', 'count',
      ];
      const functionWindowNames = [
        'row_number', 'rolling_sum', 'rolling_avg', 'lag', 'lead', 'sum', 'avg', 'max', 'min', 'count',
      ];
      if (!isUndefined(data.suggest)) {
        const suggests: any = [];
        let ruleSource = '';
        const tokenSource0 = data.suggest[0].tokenSource;
        data.suggest.forEach((item) => {
          if (0 <= item.start) {
            if (item.tokenSource === '<EOF>') {
              item.tokenSource = '';
            }
            if (1 < item.tokenString.length && item.tokenString.startsWith('\'') && item.tokenString.endsWith('\'')) {
              item.tokenString = item.tokenString.substring(1, item.tokenString.length - 1);
            }
            if (item.tokenString === '@_COLUMN_NAME_@') {
              let ts = item.tokenSource;
              if (false === tokenSource0.endsWith(ts)) {
                ts = '';
              }
              for (const columnName of columnNames) {
                if (columnName.startsWith(ts)) {
                  const suggest = {
                    type: item.tokenString,
                    class: 'DodgerBlue',
                    source: item.tokenSource,
                    value: columnName
                  };
                  suggests.push(suggest);
                }
              }
            } else if (item.tokenString === '@_FUNCTION_EXPRESSION_@') {
              let ts = item.tokenSource;
              if (false === tokenSource0.endsWith(ts)) {
                ts = '';
              }
              for (const functionName of functionNames) {
                if (functionName.startsWith(ts)) {
                  const suggest = {
                    type: item.tokenString,
                    class: 'Olive',
                    source: item.tokenSource,
                    value: functionName
                  };
                  suggests.push(suggest);
                }
              }
            } else if (item.tokenString === '@_COMPLETED_BRACKET_@') {
              const openidx = ruleSource.lastIndexOf('(');
              const closeidx = ruleSource.lastIndexOf(')');
              if (0 <= openidx && closeidx < openidx) {
                // if( item.tokenSource.startsWith('(') ) {
                const suggest = {
                  type: item.tokenString,
                  class: 'LightCoral',
                  source: item.tokenSource,
                  value: ')'
                };
                suggests.push(suggest);
              }
            } else if (item.tokenString === '@_STRING_@') {
              if (item.tokenSource.startsWith('\'')) {
                const suggest = {
                  type: item.tokenString,
                  class: 'black',
                  source: item.tokenSource,
                  value: '\''
                };
                suggests.push(suggest);
              }
            } else if (item.tokenString === 'LONG') {
            } else if (item.tokenString === 'DOUBLE') {
            } else if (item.tokenString === 'BOOLEAN') {
            } else if (item.tokenString === '@_AGGREGATE_FUNCTION_EXPRESSION_@') {
              for (const functionName of functionAggrNames) {
                if (functionName.startsWith(item.tokenSource)) {
                  const suggest = {
                    type: item.tokenString,
                    class: 'Olive',
                    source: item.tokenSource,
                    value: functionName
                  };
                  suggests.push(suggest);
                }
              }
            } else if (item.tokenString === '@_WINDOW_FUNCTION_EXPRESSION_@') {
              for (const functionName of functionWindowNames) {
                if (functionName.startsWith(item.tokenSource)) {
                  const suggest = {
                    type: item.tokenString,
                    class: 'Olive',
                    source: item.tokenSource,
                    value: functionName
                  };
                  suggests.push(suggest);
                }
              }
            } else if (item.tokenString === 'count' || item.tokenString === 'avg' || item.tokenString === 'sum' || item.tokenString === 'min' || item.tokenString === 'max') {
              if (item.tokenString.startsWith(item.tokenSource)) {
                const suggest = {
                  type: '@_AGGREGATE_FUNCTION_EXPRESSION_@', // item.tokenString,
                  class: 'Olive',
                  source: item.tokenSource,
                  value: item.tokenString
                };
                suggests.push(suggest);
              }
            } else if (item.tokenString === 'row_number' || item.tokenString === 'rolling_sum' || item.tokenString === 'rolling_avg' || item.tokenString === 'lag' || item.tokenString === 'lead') {
              if (item.tokenString.startsWith(item.tokenSource)) {
                const suggest = {
                  type: '@_WINDOW_FUNCTION_EXPRESSION_@', // item.tokenString,
                  class: 'Olive',
                  source: item.tokenSource,
                  value: item.tokenString
                };
                suggests.push(suggest);
              }
            } else {
              const suggest = {
                type: '@_OPERATOR_@',
                class: 'LightCoral',
                source: item.tokenSource,
                value: item.tokenString
              };
              // column name for aggregate function
              if (suggest.value === ')' &&
                (tokenSource0.startsWith('sum') || tokenSource0.startsWith('avg') || tokenSource0.startsWith('min') || tokenSource0.startsWith('max'))
              ) {
                const colnameIdx = tokenSource0.lastIndexOf('(');
                const ts = tokenSource0.substring(colnameIdx + 1);
                for (const columnName of columnNames) {
                  if (columnName.startsWith(ts)) {
                    suggests.push({
                      type: '@_COLUMN_NAME_@',
                      class: 'DodgerBlue',
                      source: item.tokenSource,
                      value: columnName
                    });
                  }
                }
              }
              if (suggest.value !== '(' && suggest.value !== ')') {
                suggests.push(suggest);
              }
            }
          } else if (-1 === item.start && -1 === item.stop && -1 === item.tokenNum) {
            ruleSource = item.tokenSource;
          }
        });
        this.autoCompleteSuggestionsSelectedIdx = -1;
        this.autoCompleteSuggestions = suggests;
        this.isAutoCompleteSuggestionListOpen = ( 0 <= suggests.length );
      }
    }).catch((error) => {
      this.isAutoCompleteSuggestionListOpen = false;
      this.autoCompleteSuggestionsSelectedIdx = -1;
      this.autoCompleteSuggestions = [];
      const prepError = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prepError, this.translateService.instant(prepError.message));
    });
  } // function - changeRule

  public onSelectAutoComplete(item) {

    const input = this._inputFormula.nativeElement;

    if (isUndefined(input)) {
      return;
    }

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const inputVal = input.value;

    let result: any[];
    if ('pivot' === this.command || 'aggregate' === this.command) {
      result = this.formulaSuggestionPivot(item, inputVal, start, end);
    } else if ('window' === this.command) {
      result = this.formulaSuggestionWindow(item, inputVal, start, end);
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

    if (item.type !== '@_OPERATOR_@') { // && item.type!="@_FUNCTION_EXPRESSION_@" ) {
      if (start < end) {
        value = inputVal.substring(0, end);
      }
      const lastIdx = value.lastIndexOf(item.source);
      if (-1 !== lastIdx && value.endsWith(item.source)) {
        value = value.substring(0, lastIdx);
      }
    }

    const lenOfHead = value.length;
    value += item.value;
    const caretPos = value.length;
    let tail = inputVal.substring(end);
    if (start === end && lenOfHead <= start) {
      const partOfTail = value.substring(start);
      if (tail.indexOf(partOfTail) === 0) {
        tail = tail.substring(partOfTail.length);
      }
    }
    value += tail;

    return [value, caretPos];
  } // function - formulaSuggestion

  public formulaSuggestionPivot(item, inputVal, start, _end) {

    let value = inputVal.substring(0, start);

    if (item.type === '@_AGGREGATE_FUNCTION_EXPRESSION_@') {
      value = item.value;
    } else if (item.type === '@_COLUMN_NAME_@') {
      const bracketIdx = value.lastIndexOf('(');
      value = value.substring(0, bracketIdx);
      const colname = value.substring(bracketIdx + 1);
      if (item.value.startsWith(colname)) {
        value += '(';
      } else {
        value += '(' + colname;
      }
      value += item.value;
    } else if (item.type === '@_OPERATOR_@') {
      value += item.value;
    }

    const caretPos = value.length;

    return [value, caretPos];
  } // function - formulaSuggestionPivot

  public formulaSuggestionWindow(item, inputVal, start, _end) {

    let value = inputVal.substring(0, start);

    if (item.type === '@_WINDOW_FUNCTION_EXPRESSION_@' || item.type === '@_AGGREGATE_FUNCTION_EXPRESSION_@') {
      value = item.value;
    } else if (item.type === '@_COLUMN_NAME_@') {
      const bracketIdx = value.lastIndexOf('(');
      value = value.substring(0, bracketIdx);
      const colname = value.substring(bracketIdx + 1);
      if (item.value.startsWith(colname)) {
        value += '(';
      } else {
        value += '(' + colname;
      }
      value += item.value;
    } else if (item.type === '@_OPERATOR_@') {
      value += item.value;
    }

    const caretPos = value.length;

    return [value, caretPos];
  } // function - formulaSuggestionPivot

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
