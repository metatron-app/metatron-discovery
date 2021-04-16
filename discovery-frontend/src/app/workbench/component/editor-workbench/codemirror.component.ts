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

// Imports
import * as CodeMirror from 'codemirror';
import {AfterViewInit, Component, EventEmitter, forwardRef, Input, OnDestroy, Output, ViewChild,} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {isUndefined} from 'util';

/**
 * CodeMirror component
 * Usage :
 * <codemirror [(ngModel)]="data" [config]="{...}"></codemirror>
 */
@Component({
  selector: 'codemirror',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodemirrorComponent),
      multi: true
    }
  ],
  template: `<textarea #host></textarea>`,
})
export class CodemirrorComponent implements AfterViewInit, OnDestroy {

  @Input() config;
  @Output() change = new EventEmitter();
  @Output() focus = new EventEmitter();
  @Output() blur = new EventEmitter();
  @Output() cursorActivity = new EventEmitter();

  @ViewChild('host') host;

  @Output() instance = null;

  _value = '';

  public codeMirror: any;

  /**
   * Constructor
   */
  constructor() {
  }

  get value() {
    return this._value;
  }

  @Input() set value(v) {
    if (v !== this._value) {
      this._value = v;
      this.onChange(v);
    }
  }

  /**
   * On component destroy
   */
  ngOnDestroy() {

  }

  /**
   * On component view init
   */
  ngAfterViewInit() {
    this.config = this.config || {};
    this.codemirrorInit(this.config);
  }

  /**
   * Initialize codemirror
   */
  codemirrorInit(config) {
    // CodeMirror.k.default["Shift-Tab"] = "indentLess";
    // CodeMirror.keyMap.default["Tab"] = "indentMore";
    this.instance = CodeMirror.fromTextArea(this.host.nativeElement, config);
    this.instance.setValue(this._value);

    this.instance.on('change', () => {
      this.updateValue(this.instance.getValue());
    });

    this.instance.on('focus', (instance, event) => {
      this.focus.emit({instance, event});
    });

    this.instance.on('cursorActivity', (instance) => {
      this.cursorActivity.emit({instance});
    });

    this.instance.on('blur', (instance, event) => {
      this.blur.emit({instance, event});
    });
  }

  /**
   * Value update process
   */
  updateValue(value) {
    this.value = value;
    this.onTouched();
    this.change.emit(value);
  }

  /**
   * Implements ControlValueAccessor
   */
  writeValue(value) {
    this._value = value || '';
    if (this.instance) {
      this.instance.setValue(this._value);
    }
  }

  onChange(_) {
  }

  onTouched() {
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  public setText(text: string): void {
    if (text === null || text === undefined) {
      text = '';
    }
    this.writeValue(text);
  }

  public insert(text: string): void {
    if (text === null || text === undefined) {
      text = '';
    }

    const $scrollContainer = $('.CodeMirror-scroll');
    const scrollHeight = $scrollContainer.scrollTop();

    let temp = text;
    const line: number = this.instance.doc.getCursor().line;
    const ch: number = this.instance.doc.getCursor().ch;

    const lines: any[] = this.getLines();
    let beforeText: string = this.instance.doc.getRange({line: 0, ch: 0}, {line: line, ch: ch});
    let afterText: string = this.instance.doc.getRange({line: line, ch: ch}, {line: lines.length, ch: 0});

    // 현재 커서 위치 이전 마지막 단어가 세이콜론이 아닐 경우, 현재 커서 위치 이후 세미콜론이 존재 할경우
    if (beforeText.trim() !== ''
      && beforeText.trim().substr(beforeText.trim().length - 1) !== ';'
      && afterText.search(';') !== -1) {

      const tempTextArr = afterText.split(';');

      // 이전 내용 붙이기
      beforeText += (tempTextArr[0] + ';');

      afterText = '';
      for (let idx: number = 0; idx < tempTextArr.length; idx++) {
        if (idx !== 0) {
          if (idx === tempTextArr.length - 1) {
            afterText += (tempTextArr[idx]);
            break;
          }
          afterText += (tempTextArr[idx] + ';');
        }
      }

    } // end if


    if (beforeText === '') {
      if (text.indexOf('\n') > -1) {
        temp = beforeText + temp.replace('\n', '') + afterText;
      } else {
        temp = beforeText + temp + afterText;
      }
      this.writeValue(temp);
      this.instance.setCursor({line: line + 1, ch: ch + text.length});
    } else {
      temp = beforeText + temp + afterText;
      this.writeValue(temp);
      if (text.indexOf('\n') > -1) {
        // this.instance.setCursor({ line: line + 1, ch: ch + text.length });
        this.instance.setCursor({line: beforeText.split('\n').length, ch: ch + text.length});
      } else {
        this.instance.setCursor({line: line, ch: ch + text.length});
      }
    }
    $scrollContainer.scrollTop(scrollHeight);
    this.instance.focus();
  }

  /**
   * insert column
   * @param text
   */
  public insertColumn(text: string): void {
    if (text === null || text === undefined) {
      text = '';
    }

    let temp = text;
    const line: number = this.instance.doc.getCursor().line;
    const ch: number = this.instance.doc.getCursor().ch;

    const lines: any[] = this.getLines();
    const beforeText: string = this.instance.doc.getRange({line: 0, ch: 0}, {line: line, ch: ch});
    const afterText: string = this.instance.doc.getRange({line: line, ch: ch}, {line: lines.length, ch: 0});

    if (beforeText === '') {
      if (text.indexOf('\n') > -1) {
        temp = beforeText + temp.replace('\n', '') + afterText;
      } else {
        temp = beforeText + temp + afterText;
      }
      this.writeValue(temp);
      this.instance.setCursor({line: line + 1, ch: ch + text.length});
    } else {
      temp = beforeText + temp + afterText;
      this.writeValue(temp);
      if (text.indexOf('\n') > -1) {
        this.instance.setCursor({line: line + 1, ch: ch + text.length});
      } else {
        this.instance.setCursor({line: line, ch: ch + text.length});
      }
    }
    this.instance.focus();
  }

  public replace(text: string): void {
    const range = this.getSelectedRange();
    const lines: any[] = this.getLines();
    const beforeText: string = this.instance.doc.getRange({line: 0, ch: 0}, {line: range.from.line, ch: range.from.ch})
    const afterText: string = this.instance.doc.getRange({line: range.to.line, ch: range.to.ch}, {
      line: lines.length,
      ch: 0
    })
    text = beforeText + text + afterText;
    this.writeValue(text);
    this.instance.setCursor({line: range.from.line, ch: range.from.ch});
    this.instance.focus();
  }

  private getSelectedRange() {
    return {from: this.instance.getCursor('start'), to: this.instance.getCursor('end')};
  }

  public resize(height: number): void {
    this.instance.setSize('100%', height - 2);
  }

  public getSelection(): string {
    return this.instance.getSelection();
  }

  public editorFocus(): void {
    this.instance.focus();
  }

  public getEditor(): any {
    return this.instance;
  }

  public getFocusSelection(): string {
    // const lines = this.editor.session.getDocument().$lines;
    // const lines = this.instance.doc.children[0].lines;
    const lines: any[] = this.getLines();
    const crow = this.instance.doc.getCursor().line
    let qend: number = -1;
    let qstart: number = -1;

    if (lines[crow].text.indexOf(';') > -1) {
      for (let i = crow - 1; i >= 0; i = i - 1) {
        if (lines[i].text.indexOf(';') > -1) {
          // ; 있으면
          qstart = i;
          this.instance.doc.setSelection({ch: 0, line: qstart + 1}, {ch: 0, line: crow + 1});
          break;
        }
      }
      // 없다면.
      if (qstart === -1) {
        this.instance.doc.setSelection({ch: 0, line: 0}, {ch: 0, line: crow + 1});
      }
    } else {
      // 현재 행에 ; 가 없을 경우.
      // 뒤로 조회
      for (let i = crow; i < lines.length; i = i + 1) {
        if (lines[i].text.indexOf(';') > -1) {
          // ; 있으면
          qend = i;
          // 뒤로 조회
          for (let j = crow; j >= 0; j = j - 1) {
            if (lines[j].text.indexOf(';') > -1) {
              // ; 있으면
              qstart = j;
              break;
            }
          }
          // 없다면
          if (qstart === -1) {
            qstart = 0;
            this.instance.doc.setSelection({ch: 0, line: qstart}, {ch: 0, line: qend + 1});
          } else {
            this.instance.doc.setSelection({ch: 0, line: qstart + 1}, {ch: 0, line: qend + 1});
          }
          break;
        }
        // 없다면.
        if (qend === -1) {
          // 뒤로 조회
          let cnt = 0;
          for (let j = crow; j >= 0; j = j - 1) {
            if (lines[j].text.indexOf(';') > -1 && cnt === 0) {
              // ; 있으면
              qend = j;
            }
            if (lines[j].text.indexOf(';') > -1 && cnt === 1) {
              qstart = j;
              break;
            }
            if (lines[j].text.indexOf(';') > -1) {
              cnt = cnt + 1;
            }
          }
          this.instance.doc.setSelection({ch: 0, line: qstart + 1}, {ch: 0, line: qend + 1});
        }
      }
    }
    return '';
  }

  private isSubquery(str, parenthesisLevel) {
    return parenthesisLevel - (str.replace(/\(/g, '').length - str.replace(/\)/g, '').length)
  }

  private split_sql(str, tab) {

    return str.replace(/\s{1,}/g, ' ')

      .replace(/ AND /ig, '~::~' + tab + tab + 'AND ')
      .replace(/ BETWEEN /ig, '~::~' + tab + 'BETWEEN ')
      .replace(/ CASE /ig, '~::~' + 'CASE ')
      .replace(/ ELSE /ig, '~::~' + 'ELSE ')
      .replace(/ END /ig, '~::~' + 'END ')
      .replace(/ FROM /ig, '~::~FROM ')
      .replace(/ GROUP\s{1,}BY/ig, '~::~GROUP BY ')
      .replace(/ HAVING /ig, '~::~HAVING ')
      // .replace(/ SET /ig," SET~::~")
      .replace(/ IN /ig, ' IN ')

      .replace(/ JOIN /ig, '~::~JOIN ')
      .replace(/ CROSS~::~{1,}JOIN /ig, '~::~CROSS JOIN ')
      .replace(/ INNER~::~{1,}JOIN /ig, '~::~INNER JOIN ')
      .replace(/ LEFT~::~{1,}JOIN /ig, '~::~LEFT JOIN ')
      .replace(/ RIGHT~::~{1,}JOIN /ig, '~::~RIGHT JOIN ')

      .replace(/ ON /ig, '~::~' + tab + 'ON ')
      .replace(/ OR /ig, '~::~' + tab + tab + 'OR ')
      .replace(/ ORDER\s{1,}BY/ig, '~::~ORDER BY ')
      .replace(/ OVER /ig, '~::~' + tab + 'OVER ')

      .replace(/\(\s{0,}SELECT /ig, '~::~(SELECT ')
      .replace(/\)\s{0,}SELECT /ig, ')~::~SELECT ')

      .replace(/ THEN /ig, ' ~::~' + 'THEN ')
      .replace(/ UNION /ig, '~::~UNION~::~')
      .replace(/ USING /ig, '~::~USING ')
      .replace(/ WHEN /ig, '~::~' + 'WHEN ')
      .replace(/ WHERE /ig, '~::~WHERE ')
      .replace(/ WITH /ig, '~::~WITH ')

      // .replace(/\,\s{0,}\(/ig,",~::~( ")
      // .replace(/\,/ig,",~::~"+tab+tab+ '')

      .replace(/ ALL /ig, ' ALL ')
      .replace(/ AS /ig, ' AS ')
      .replace(/ ASC /ig, ' ASC ')
      .replace(/ DESC /ig, ' DESC ')
      .replace(/ DISTINCT /ig, ' DISTINCT ')
      .replace(/ EXISTS /ig, ' EXISTS ')
      .replace(/ NOT /ig, ' NOT ')
      .replace(/ NULL /ig, ' NULL ')
      .replace(/ LIKE /ig, ' LIKE ')
      .replace(/\s{0,}SELECT /ig, 'SELECT ')
      .replace(/\s{0,}UPDATE /ig, 'UPDATE ')
      .replace(/ SET /ig, ' SET ')

      .replace(/\;/ig, '\;~::~')

      .replace(/~::~{1,}/g, '~::~')
      .split('~::~');
  }

  private createShiftArr(step) {

    let space = '    ';

    if (isNaN(parseInt(step, 10))) {  // argument is string
      space = step;
    } else { // argument is integer
      switch (step) {
        case 1:
          space = ' ';
          break;
        case 2:
          space = '  ';
          break;
        case 3:
          space = '   ';
          break;
        case 4:
          space = '    ';
          break;
        case 5:
          space = '     ';
          break;
        case 6:
          space = '      ';
          break;
        case 7:
          space = '       ';
          break;
        case 8:
          space = '        ';
          break;
        case 9:
          space = '         ';
          break;
        case 10:
          space = '          ';
          break;
        case 11:
          space = '           ';
          break;
        case 12:
          space = '            ';
          break;
      }
    }

    const shift = ['\n']; // array of shifts
    for (let ix = 0; ix < 100; ix++) {
      shift.push(shift[ix] + space);
    }
    return shift;
  }

  public formatter(text, step) {
    const that = this;
    const arByQuote = text.replace(/\s{1,}/g, ' ').replace(/\'/ig, '~::~\'').split('~::~');
    let len = arByQuote.length;
    let ar = [];
    let deep = 0;
    const tab = step; // +this.step,
    let parenthesisLevel = 0;
    let str = '';
    let ix = 0;
    const shift = step ? that.createShiftArr(step) : undefined;

    for (ix = 0; ix < len; ix++) {
      if (ix % 2) {
        ar = ar.concat(arByQuote[ix]);
      } else {
        ar = ar.concat(that.split_sql(arByQuote[ix], tab));
      }
    }

    len = ar.length;
    for (ix = 0; ix < len; ix++) {

      parenthesisLevel = that.isSubquery(ar[ix], parenthesisLevel);

      if (/\s{0,}\s{0,}SELECT\s{0,}/.exec(ar[ix])) {
        ar[ix] = ar[ix].replace(/\,/g, ',\n' + tab + tab + '')
      }

      if (/\s{0,}\s{0,}SET\s{0,}/.exec(ar[ix])) {
        ar[ix] = ar[ix].replace(/\,/g, ',\n' + tab + tab + '')
      }

      if (/\s{0,}\(\s{0,}SELECT\s{0,}/.exec(ar[ix])) {
        deep++;
        str += shift[deep] + ar[ix];
      } else if (/\'/.exec(ar[ix])) {
        if (parenthesisLevel < 1 && deep) {
          deep--;
        }
        str += ar[ix];
      } else {
        str += shift[deep] + ar[ix];
        if (parenthesisLevel < 1 && deep) {
          deep--;
        }
      }
      // const junk = 0;
    }

    str = str.replace(/^\n{1,}/, '').replace(/\n{1,}/g, '\n');
    return str;
  }

  public setOptions(param) {
    this.instance.options.hintOptions = {tables: param};
  }

  public setModeOptions(param) {
    this.instance.setOption('mode', param);
    this.instance.refresh();
  }

  public getLines() {
    const lines: any[] = [];
    this.instance.doc.children.forEach((item) => {
      if (!isUndefined(item.lines)) {
        item.lines.forEach((item2, _idx) => {
          lines.push(item2);
        });
      } else {
        this.getSubLines(item, lines);
      }
    });
    return lines;
  }

  public getSubLines(item, lines) {
    item.children.forEach((item2) => {
      if (!isUndefined(item2.lines)) {
        item2.lines.forEach((item3) => {
          lines.push(item3);
        });
      } else {
        this.getSubLines(item2, lines);
      }
    })
    return lines;
  }
}
