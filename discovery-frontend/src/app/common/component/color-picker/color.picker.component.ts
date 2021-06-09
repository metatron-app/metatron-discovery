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

import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '../abstract.component';
import {ColorPicker} from './colorpicker';

declare let $: any;

@Component({
  selector: 'color-picker',
  templateUrl: './color.picker.component.html'
})
export class ColorPickerComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constant Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 색상 선택시
  @Output('selected')
  private selected: EventEmitter<object> = new EventEmitter();

  // 컬러피커가 show될때
  @Output('showPicker')
  private showPicker: EventEmitter<object> = new EventEmitter();

  // 컬러피커가 hide될때
  @Output('hidePicker')
  private hidePicker: EventEmitter<object> = new EventEmitter();

  // picker element
  private pickerElement: any;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public show: boolean = false;

  // 프리셋 색상
  public color: string;

  // alpha기능 설정여부
  @Input('showAlpha')
  public showAlpha: boolean;

  // 색상 포멧
  @Input('preferredFormat')
  public preferredFormat: string = 'hex';

  // input값 설정여부
  @Input('showInput')
  public showInput: boolean;

  // palette show / hide
  @Input('showPalette')
  public showPalette: boolean = true;

  // 색상 초기값 show / hide
  @Input('showInitial')
  public showInitial: boolean;

  // 사용자 정의 색상 show / hide
  @Input('showUserColor')
  public showUserColor: boolean = false;

  // 색상 코드리스트
  @Input('palette')
  public palette: string[][] = [
    ['#ffcaba', '#fda08c', '#fb7661', '#f8533b', '#f23a2c', '#e5342c', '#d73631', '#c22a32', '#9a0b2c'],
    ['#f6f4b7', '#f9f6a1', '#fee330', '#ffd200', '#fbb700', '#f6a300', '#f28a00', '#f27603', '#fb6e2c'],
    ['#d1e5c2', '#b5d994', '#97cb63', '#83bf47', '#72b235', '#5d9f27', '#4b8a21', '#39751d', '#2d681a'],
    ['#b5e0e1', '#9ad5d2', '#75c4be', '#54b2ae', '#2b9a9e', '#0c8691', '#026e7f', '#015268', '#064059'],
    ['#c4eeed', '#a9e7eb', '#8adfe9', '#6ed0e4', '#58b5da', '#4a95cf', '#3f72c1', '#3452b5', '#23399f'],
    ['#efdffd', '#cdbaf8', '#b099f0', '#9b7fe4', '#8d6dd2', '#7c5ac1', '#6344ad', '#4c309a', '#391f8a'],
    ['#fcc9dd', '#fca0c3', '#fc79ac', '#ee5398', '#e03c8f', '#cd2287', '#ad037c', '#7d0071', '#4c006a'],
    ['#ffffff', '#eeeeee', '#cdcdcd', '#959595', '#797979', '#636363', '#4f4f4f', '#3c3c3c']
  ];

  // clickoutside시 change이벤트 발생여부
  @Input('clickoutFiresChange')
  public clickoutFiresChange: boolean = false;

  // 프리셋 색상 (필수값)
  @Input('color')
  public set setColor(color: string) {

    this.color = color;

    const data: ColorPicker = new ColorPicker();
    data.color = this.color;
    data.showAlpha = this.showAlpha;
    data.preferredFormat = this.preferredFormat;
    data.showInput = this.showInput;
    data.showPalette = this.showPalette;
    data.showInitial = this.showInitial;
    data.palette = this.palette;
    data.showUserColor = this.showUserColor;
    data.clickoutFiresChange = this.clickoutFiresChange;

    this.init(data);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {

    // spectrum element 제거
    this.pickerElement.spectrum('destroy');

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * picker 숨김
   */
  public closePicker(): void {
    ( this.pickerElement ) && ( this.pickerElement.spectrum('hide') );
  } // func - closePicker

  /**
   * picker 표시
   */
  public openPicker(): void {
    ( this.pickerElement ) && ( this.pickerElement.spectrum('show') );
  } // func - openPicker

  /**
   * init
   * @param data 색상설정 데이터
   */
  public init(data: ColorPicker): any {

    if (!data.preferredFormat) data.preferredFormat = this.preferredFormat;
    if (!data.showPalette) data.showPalette = this.showPalette;
    if (!data.palette) data.palette = this.palette;

    // 색상 show
    this.show = true;

    // ngIf 반영
    this.changeDetect.detectChanges();

    this.pickerElement = $(this.elementRef.nativeElement).find('#custom');

    this.pickerElement.spectrum({
      color: data.color,
      showAlpha: data.showAlpha,
      preferredFormat: data.preferredFormat,
      showInput: data.showInput,
      showPalette: data.showPalette,
      showInitial: data.showInitial,
      palette: data.palette,
      clickoutFiresChange: data.clickoutFiresChange,
      // 색상 선택시
      change: ((color) => {

        // 선택된 색상 emit
        this.selected.emit(color.toHexString());
      }),
      // 컬러피커 팝업 show상태일때 설정
      show: ((color) => {

        // title 마크업 설정
        const title = this.translateService.instant('msg.page.ui.color.palette');

        // ddp-pop-side-top클래스가 없는경우 color picker 마크업에 title 추가
        if (0 === $('.sp-container').not('.sp-hidden').find('.ddp-pop-side-top').length) {
          $('<div class="ddp-pop-side-top">' + title + '<a href="javascript:" class="ddp-btn-close"></a></div>').prependTo($('.sp-container').not('.sp-hidden'));
        }

        // 닫힘버튼 클릭시
        $('.ddp-btn-close').click(() => {
          this.pickerElement.spectrum('hide');
        });

        // 컬러피커 팝업 위치조정
        this.showPicker.emit(color);
      }),
      hide: ((color) => {

        this.hidePicker.emit(color);
      })
    });

    // click 이벤트 설정
    this.clickEvent(data);

    return this.pickerElement;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컬러피커 팝업에서의 click 이벤트 설정
   */
  private clickEvent(data: ColorPicker) {

    // 사용자 색상여부가 true일때에만 설정
    if (data.showUserColor) $('.sp-palette-container').append($('<span class="sp-user"><span class="sp-user-inner"></span></span>'));

    // color picker  사용자 설정 클릭시
    $('.sp-user .sp-user-inner').click(function () {
      $(this).toggleClass('ddp-selected');
      const $thumb = $('.sp-thumb-el');
      $thumb.removeClass('sp-thumb-active');
      $('.sp-picker-container').toggle();
      $('.sp-container').toggleClass('ddp-picker');
      $thumb.click(() => {
        $('.sp-user .sp-user-inner').removeClass('ddp-selected');
      });
    });
    $('.sp-thumb-el').click(() => {
      $('.sp-user .sp-user-inner').removeClass('ddp-selected');
    });

    // color picker 위치
    $('.ddp-ui-chart-side .ddp-box-color .sp-replacer').click(() => {
      const $container = $('.sp-container');
      $container.addClass('ddp-right');
      $container.removeClass('ddp-left');
    });

    $('.ddp-ui-chart-side .ddp-list-sub2.ddp-user-color .sp-replacer').click(() => {
      const $container = $('.sp-container');
      $container.addClass('ddp-right');
      $container.removeClass('ddp-left');
    });

    $('.ddp-ui-chart-lnb .ddp-box-color .sp-replacer').click(() => {
      const $container = $('.sp-container');
      $container.removeClass('ddp-right');
      $container.addClass('ddp-left');
    });

    $('.ddp-ui-chart-side .ddp-color-selectbox2 .sp-replacer').click(() => {
      $('.sp-container').addClass('ddp-select-right');
    });

    $('.ddp-colorpicker .sp-replacer').click(function () {
      $(this).parent().parent().siblings().removeClass('ddp-selected');
      $('.sp-container').addClass('ddp-select-right');
    });
  }
}
