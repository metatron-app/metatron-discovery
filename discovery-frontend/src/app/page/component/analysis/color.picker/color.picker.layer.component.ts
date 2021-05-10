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
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import * as $ from 'jquery';
import * as _ from 'lodash';
import {AbstractComponent} from '@common/component/abstract.component';

@Component({
  selector: 'color-picker-layer',
  templateUrl: './color.picker.layer.component.html'
})
export class ColorPickerLayerComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constant Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 기본 제목
   * @type {string}
   */
  private DEFAULT_TITLE: string = this.translateService.instant('msg.page.chart.analysis.color.palette');

  /**
   * 색상 선택시 넣어줄 클래스 이름
   * @type {string}
   */
  private SELECTED_CLASS_NAME: string = 'ddp-selected';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 선택된 컬러 값
   * @type {string}
   */
  private selectedColor: object = {};

  /**
   * 색상 선택시 리턴되는 값
   */
  private param: any;

  /**
   * 색상표 리스트
   */
  public colorList: string[];

  /**
   * 색상 목록
   * @type {any[]}
   */
  @Input('colors')
  public colors: { [key: string]: string; } = {};

  /**
   * 색상을 나누기할 몫의 값
   * @type {number}
   */
  @Input('divisionShare')
  private divisionShare: number;

  /**
   * x 값
   * @type {number}
   */
  @Input('offsetX')
  public offsetX: string;

  /**
   * y 값
   * @type {number}
   */
  @Input('offsetY')
  public offsetY: string;

  /**
   * 선택 변경시
   * @type {EventEmitter<any>}
   */
  @Output('selected')
  private selected: EventEmitter<object> = new EventEmitter();

  /**
   * 닫기 이벤트 발생시
   * @type {EventEmitter<any>}
   */
  @Output('close')
  private close: EventEmitter<object> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * show / hide flag
   * @type {boolean}
   */
  public isShow: boolean = true;

  /**
   * 팝업 타이틀
   * @type {string}
   */
  @Input('title')
  public title: string = this.DEFAULT_TITLE;

  /**
   * colors / 색상을 나누기할 몫의 값
   *  - Array 형태로 만든다
   * @type {any[]}
   */
  public colorGroup = [];

  /**
   * Call back function 닫기 이벤트 발생시 같이 보내준다
   */
  private callBackFn: (hex) => void = () => {};

  /**
   *
   * @param _$event
   */
  @HostListener('document:click', ['$event.target'])
  public clickedOutside(_$event) {
    if (this.isShow) {
      this.hide();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * constructor
   * @param {ElementRef} elementRef
   * @param {Injector} injector
   */
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Init
   */
  public ngOnInit(): void {

    // Init
    super.ngOnInit();

    Promise
      .resolve()
      .then(() => this.initialize())
      .then(() => this.createColorGroup())
      .catch((e) => console.error(e));
  }

  /**
   * Destory
   */
  public ngOnDestroy(): void {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * clickedInside
   * @param {Event} $event
   */
  public clickedInside($event: Event): void {
    $event.preventDefault();
    $event.stopPropagation();
  }

  /**
   * 컴포넌트의 높이 값 구하기
   * @returns {number}
   */
  public getHeight(): number {
    return $('#ddpPopColorPicker').height();
  }

  /**
   * show
   * @param {string} colorHex
   * @param {Function} callBackFn
   * @param param
   */
  public show(colorHex: string = '', callBackFn: (hex) => void = () => {}, param?: any): void {

    this.param = param;

    setTimeout(() => {
      Promise
        .resolve()
        .then(() => {
          this.callBackFn = callBackFn;

          if ('' !== colorHex) {
            this.colorSelected(colorHex, false);
          }
        })
        .then(() => this.isShow = true)
        .catch((e) => console.error(e));
    }, 1);
  }

  /**
   * hide
   */
  public hide(): void {
    this.close.emit({data: _.cloneDeep(this.selectedColor), fn: this.callBackFn, param: this.param});
    this.setIsShow(false);
  }

  /**
   * 초기화
   */
  public initialize(): void {

    /**
     * 선택된 컬러 값
     * @type {string}
     */
    this.selectedColor = {};

    /**
     * 색상 목록
     * @type {any[]}
     */
    this.colorList = [
      '#c94819',
      '#007e78',
      '#02936f',
      '#4c95ce',
      '#9678bc',
      '#d57295',
      '#0d0d0d',
      '#f2f2f2',
      '#fb7100',
      '#00a99c',
      '#17d18e',
      '#589ed7',
      '#a992c7',
      '#e898b2',
      '#595959',
      '#d9d9d9',
      '#ffbe69',
      '#01cbbb',
      '#54df9a',
      '#81b8e1',
      '#c7a9c7',
      '#e898b2',
      '#7f7f7f',
      '#bfbfbf',
      '#ffd37d',
      '#70dec3',
      '#cee6d2',
      '#d3e4ef',
      '#e3d4e2',
      '#fae2ea',
      '#8f8f8f',
      '#afafaf'
    ];

    /**
     * 색상 목록
     * @type {any[]}
     */
    this.colors = {

      'ddp-bg1-color1': '#c94819',
      'ddp-bg1-color2': '#fb7100',
      'ddp-bg1-color3': '#ffbe69',
      'ddp-bg1-color4': '#ffd37d',

      'ddp-bg2-color1': '#007e78',
      'ddp-bg2-color2': '#00a99c',
      'ddp-bg2-color3': '#01cbbb',
      'ddp-bg2-color4': '#70dec3',

      'ddp-bg3-color1': '#02936f',
      'ddp-bg3-color2': '#17d18e',
      'ddp-bg3-color3': '#54df9a',
      'ddp-bg3-color4': '#cee6d2',

      'ddp-bg4-color1': '#4c95ce',
      'ddp-bg4-color2': '#589ed7',
      'ddp-bg4-color3': '#81b8e1',
      'ddp-bg4-color4': '#d3e4ef',

      'ddp-bg5-color1': '#9678bc',
      'ddp-bg5-color2': '#a992c7',
      'ddp-bg5-color3': '#c7a9c7',
      'ddp-bg5-color4': '#e3d4e2',

      'ddp-bg6-color1': '#d57295',
      'ddp-bg6-color2': '#e898b2',
      'ddp-bg6-color3': '#e898b2',
      'ddp-bg6-color4': '#fae2ea',

      'ddp-bg7-color1': '#0d0d0d',
      'ddp-bg7-color2': '#595959',
      'ddp-bg7-color3': '#7f7f7f',
      'ddp-bg7-color4': '#8f8f8f',

      'ddp-bg8-color1': '#f2f2f2',
      'ddp-bg8-color2': '#d9d9d9',
      'ddp-bg8-color3': '#bfbfbf',
      'ddp-bg8-color4': '#afafaf'
    };

    /**
     * 색상을 나누기할 몫의 값
     * @type {number}
     */
    this.divisionShare = 4;

    /**
     * x 값
     * @type {number}
     */
    this.offsetX = '0px';

    /**
     * y 값
     * @type {number}
     */
    this.offsetY = '0px';

    /**
     * show / hide flag
     * @type {boolean}
     */
    this.isShow = false;

    /**
     * 팝업 타이틀
     * @type {string}
     */
    this.title = this.DEFAULT_TITLE;

    /**
     * colors / 색상을 나누기할 몫의 값
     *  - Array 형태로 만든다
     * @type {any[]}
     */
    this.colorGroup = [];
  }

  /**
   * 색상 선택시
   * @param {string} color
   * @param emitEventUseFl
   */
  public colorSelected(color: string, emitEventUseFl: boolean = true): void {

    Promise
      .resolve()
      .then(() => {

        // 컬러 파라미터로 클래스 이름 찾기
        const className: string = this.findClass(color);

        // 선택된 컬러 값 초기화
        this.selectedColor = {};

        // 선택된 컬러 값 세팅
        this.setSelectedColor(className, color);

        // 전체 선택해제
        this.allUnSelection();

        // 클래스 이름으로 찾은 엘리먼트에 클래스를 추가
        this.addClassByClassName(className);

        if (emitEventUseFl) {
          // 선택 이벤트 방출
          this.onSelected();
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컬러 헥사 값으로 클래스명 찾기
   * @param {string} colorHex
   * @returns {string}
   */
  private findClass(colorHex: string): string {

    let className: string = '';

    this.colorGroup.forEach((color) => {
      color.forEach((group) => {
        group.forEach((c) => {
          if (c[1] === colorHex) {
            className = c[0];
          }
        });
      });
    });

    return className;
  }

  /**
   * 전체 선택 해제
   */
  private allUnSelection(): void {
    this.colorGroup.forEach((color) => {
      color.forEach((group) => {
        group.forEach((c) => {
          const className: string = c[0];
          this.$element.find(`#${className}`).removeClass(this.SELECTED_CLASS_NAME);
        });
      });
    });
  }

  /**
   * 화면에 표시할 컬러 목록 생성
   */
  private createColorGroup(): void {

    this.colorGroup = [];

    const array = Object
      .keys(this.colors)
      .map((key) => {
        return [key, this.colors[key]];
      });

    let colorGroup = [];
    array.forEach((color, index) => {

      index++;

      colorGroup.push(color);

      if (index !== 0 && index % this.divisionShare === 0) {
        this.colorGroup.push([colorGroup]);
        colorGroup = [];
      } else {
        if (array.length / this.divisionShare === this.colorGroup.length) {
          if (index % this.divisionShare === this.divisionShare - 1) {
            this.colorGroup.push([colorGroup]);
          }
        }
      }
    });
  }

  /**
   * 선택 이벤트 방출
   */
  private onSelected(): void {
    this.selected.emit({data: _.cloneDeep(this.selectedColor), fn: this.callBackFn, param: this.param});
    this.setIsShow(false);
  }

  /**
   * 클래스 이름으로 찾은 엘리먼트로 클래스 이름 추가
   * @param {string} className
   */
  private addClassByClassName(className: string): void {

    if (!_.isEmpty(className)) {
      this.$element.find(`#${className}`).addClass(this.SELECTED_CLASS_NAME);
    }
  }

  /**
   * 선택 컬러 값 세팅
   * @param {string} className
   * @param {string} color
   */
  private setSelectedColor(className: string, color: string): void {

    if (!_.isEmpty(className) && !_.isEmpty(color)) {
      this.selectedColor = {className: className, colorHex: color};
    }
  }

  /**
   * isShow 값 변경
   * @param {boolean} isShow
   */
  private setIsShow(isShow: boolean): void {
    this.isShow = isShow;
  }

}
