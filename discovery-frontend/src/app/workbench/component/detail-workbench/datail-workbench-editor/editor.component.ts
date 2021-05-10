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

import {AfterViewInit, Component, ElementRef, EventEmitter, Injector, Input, Output} from '@angular/core';
import {AbstractComponent} from '@common/component/abstract.component';

declare const ace: any;

@Component({
  selector: '[editor-component]',
  template: ' ',
  styles: ['' +
  ':host { ' +
  '   position: absolute;\n' +
  '   top: 0;\n' +
  '   right: 0;\n' +
  '   bottom: 0;\n' +
  '   left: 0; ' +
  '   min-height:100% !important;\n' +
  '   height:100% !important;\n' +
  '   width:100%;\n' +
  '   overflow: auto;\n' +
  '}']
})
export class EditorComponent extends AbstractComponent implements AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constant Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Fixed theme, mode
   *  - [sqlserver, sql]로 고정
   *
   * @type {string}
   */
  private THEME: string = 'sqlserver';
  private MODE: any = 'sql';

  /**
   * 그리드 옵션의 maxLines 1개 기본값
   * @type {number}
   */
  private ROW_DEFAULT_HEIGHT: number = 16;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Output()
  private textChanged = new EventEmitter();
  @Output()
  private textChange = new EventEmitter();

  @Input()
  private options: any = {};
  private readOnly: boolean = false;
  private autoUpdateContent: boolean = true;
  private editor: any;
  private durationBeforeCallback: number = 0;
  private text: string = '';
  private el: any;
  private timeoutSaving: any;
  private oldText: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 생성자
   *
   * @param {ElementRef} element
   * @param {Injector} injector
   */
  constructor(protected element: ElementRef,
              protected injector: Injector) {

    super(element, injector);

    this.el = element.nativeElement;
    this.editor = ace.edit(this.el);
    this.init();
    this.initEvents();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngAfterViewInit(): void {
    this.focus();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 에디터 텍스트 넣기
   *
   * @param {string} text
   */
  public setText(text: string): void {

    let pText: string = text;

    if (this.text !== pText) {
      if (pText === null || pText === undefined) {
        pText = '';
      }

      if (this.autoUpdateContent === true) {
        this.text = pText;
        this.getEditor().setValue('');
        this.getEditor().insert(pText);
        this.getEditor().focus();
      }
    }
  }

  /**
   * 에디터 텍스트 업데이트
   */
  public updateText(): void {
    const newVal = this.editor.getValue();
    if (newVal === this.oldText) {
      return;
    }
    if (typeof this.oldText !== 'undefined') {
      if (!this.durationBeforeCallback) {
        this.text = newVal;
        this.textChange.emit(newVal);
        this.textChanged.emit(newVal);
      } else {
        if (this.timeoutSaving) {
          clearTimeout(this.timeoutSaving);
        }

        this.timeoutSaving = setTimeout(() => {
          this.text = newVal;
          this.textChange.emit(newVal);
          this.textChanged.emit(newVal);
          this.timeoutSaving = null;
        }, this.durationBeforeCallback);

      }
    } else if (typeof this.oldText === 'undefined') {
      this.textChanged.emit(newVal);
    }
    this.oldText = newVal;
  }

  /**
   * 에디터 리사이징
   *
   * @param {number} height : 에디터를 감싸고 있는 래퍼 엘리먼트의 높이값
   */
  public resize(height: number): void {

    if (height > 0) {
      this.options.maxLines = Math.round((height - 18) / this.ROW_DEFAULT_HEIGHT);
      this.setOptions(this.options || {});
      this.editor = ace.edit(this.el);
      this.getEditor().resize(true);
    }
  }

  /**
   * 에디터 텍스트 삽입후 포커스
   *
   * @param {string} sql
   */
  public insert(sql: string): void {
    this.getEditor().insert(sql);
    this.getEditor().focus();
  }

  /**
   * 선택된 텍스트 가져오기
   *
   * @returns {string}
   */
  public getSelection(): string {
    // this.getEditor().session.
    return this.getEditor().session.getTextRange(this.getEditor().getSelectionRange());
  }

  public getFocusSelection(): string {
    const lines = this.editor.session.getDocument().$lines;
    // 현재 커서 위치
    const crow = this.editor.getCursorPosition().row;
    let qend: number = -1;
    let qstart: number = -1;

    if (lines[crow].indexOf(';') > -1) {
      for (let i = crow - 1; i >= 0; i = i - 1) {
        if (lines[i].indexOf(';') > -1) {
          // ; 있으면
          qstart = i;
          this.editor.session.selection.setSelectionRange({
            start: {
              row: qstart + 1,
              column: 0
            },
            end: {
              row: crow + 1,
              column: 0
            }
          });
          break;
        }
      }
      // 없다면.
      if (qstart === -1) {
        this.editor.session.selection.setSelectionRange({
          start: {
            row: 0,
            column: 0
          },
          end: {
            row: crow + 1,
            column: 0
          }
        });
      }
    } else {
      // 현재 행에 ; 가 없을 경우.
      // 뒤로 조회
      for (let i = crow; i < lines.length; i = i + 1) {
        if (lines[i].indexOf(';') > -1) {
          // ; 있으면
          qend = i;
          // 뒤로 조회
          for (let j = crow; j >= 0; j = j - 1) {
            if (lines[j].indexOf(';') > -1) {
              // ; 있으면
              qstart = j;
              break;
            }
          }
          // 없다면
          if (qstart === -1) {
            qstart = 0;
            this.editor.session.selection.setSelectionRange({
              start: {
                row: qstart,
                column: 0
              },
              end: {
                row: qend + 1,
                column: 0
              }
            });
          } else {
            this.editor.session.selection.setSelectionRange({
              start: {
                row: qstart + 1,
                column: 0
              },
              end: {
                row: qend + 1,
                column: 0
              }
            });
          }


          break;
        }
        // 없다면.
        if (qend === -1) {
          // 뒤로 조회
          let cnt = 0;
          console.log('crow', crow);
          for (let j = crow; j >= 0; j = j - 1) {
            console.log('j', j);
            if (lines[j].indexOf(';') > -1 && cnt === 0) {
              // ; 있으면
              qend = j;
            }
            if (lines[j].indexOf(';') > -1 && cnt === 1) {
              qstart = j;
              break;
            }
            if (lines[j].indexOf(';') > -1) {
              cnt = cnt + 1;
            }
          }

          this.editor.session.selection.setSelectionRange({
            start: {
              row: qstart + 1,
              column: 0
            },
            end: {
              row: qend + 1,
              column: 0
            }
          });
        }
      }
    }
    return '';
  }

  /**
   * 에디터 포커싱
   */
  public focus(): void {
    this.getEditor().focus();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 에디터 오브젝트 가져오기
   *
   * @returns {any}
   */
  private getEditor(): any {
    return this.editor;
  }

  /**
   * 옵션, 테마, 모드, ReadOnly 옵션 세팅
   */
  private init(): void {
    this.setOptions(this.options || {});
    this.setTheme(this.THEME);
    this.setMode(this.MODE);
    this.setReadOnly(this.readOnly);
  }

  /**
   * 에디터 이벤트 초기화
   */
  private initEvents(): void {
    this.getEditor().on('change', () => this.updateText());
    this.getEditor().on('paste', () => this.updateText());
  }

  /**
   * 에디터 ReadOnly 옵션 세팅
   */
  private setReadOnly(readOnly: any): void {
    this.readOnly = readOnly;
    this.getEditor().setReadOnly(readOnly);
  }

  /**
   * 에디터 테마 세팅
   */
  private setTheme(theme: any): void {
    this.THEME = theme;
    this.getEditor().setTheme(`ace/theme/${theme}`);
  }

  /**
   * 에디터 모드 세팅
   */
  private setMode(mode: any): void {
    this.MODE = mode;
    if (typeof this.MODE === 'object') {
      this.getEditor().getSession().setMode(this.MODE);
    } else {
      this.getEditor().getSession().setMode(`ace/mode/${this.MODE}`);
    }
  }

  /**
   * 에디터 옵션 세팅
   */
  private setOptions(options: any): void {
    this.options = options;
    this.getEditor().setOptions(options || {});
  }

  /**
   * setAutoUpdateContent 값 변경
   *
   * @param status
   */
  private setAutoUpdateContent(status: any): void {
    this.autoUpdateContent = status;
  }

  /**
   * setDurationBeforeCallback 값 변경
   *
   * @param {number} num
   */
  private setDurationBeforeCallback(num: number): void {
    this.durationBeforeCallback = num;
  }

  /**
   * setShowGutter 값 변경
   *
   * @param status
   */
  private setShowGutter(status: boolean): void {
    this.getEditor().renderer.setShowGutter(status);
  }

  /**
   * 커서 사용 disabled
   *
   * @param {boolean} status
   */
  private setCursorDisabled(status: boolean) {
    if (status) {
      this.getEditor().renderer.$cursorLayer.element.style.opacity = 0;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Getter and Setter Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  set sAutoUpdateContent(status: any) {
    this.setAutoUpdateContent(status);
  }

  @Input()
  set sDurationBeforeCallback(num: number) {
    this.setDurationBeforeCallback(num);
  }

  @Input()
  set sOptions(options: any) {
    this.setOptions(options);
  }

  @Input()
  set sReadOnly(readOnly: any) {
    this.setReadOnly(readOnly);
  }

  @Input()
  set sText(text: string) {
    this.setText(text);
  }

  @Input()
  set sShowGutter(status: boolean) {
    this.setShowGutter(status);
  }

  @Input()
  set sCursorDisable(status: boolean) {
    this.setCursorDisabled(status);
  }

  get gText() {
    return this.text;
  }

}
