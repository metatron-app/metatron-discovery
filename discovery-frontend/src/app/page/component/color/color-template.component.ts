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
import * as _ from 'lodash';

@Component({
  selector: 'div[color-template]',
  templateUrl: './color-template.component.html',
  styles: ['.sys-inverted {transform: scaleX(-1);}']
})
export class ColorTemplateComponent extends AbstractComponent implements AfterViewInit {

  // color type (dimension, measure, none)
  @Input('colorType')
  public colorType: string;

  // color schema (SC1)
  @Input('schema')
  public schema: string;

  // map chart - layer type (heatmap)
  @Input('layerType')
  public layerType: string;

  @Output('notiChangeColor')
  public notiChangeColor = new EventEmitter();

  @Output()
  public closeEvent = new EventEmitter();

  // series color list
  public defaultColorList: { index: number, colorNum: string }[] = [
    {index: 1, colorNum: 'SC1'},
    {index: 2, colorNum: 'SC2'},
    {index: 3, colorNum: 'SC3'},
    {index: 4, colorNum: 'SC4'},
    {index: 5, colorNum: 'SC5'},
    {index: 6, colorNum: 'SC6'},
    {index: 7, colorNum: 'SC7'},
    {index: 8, colorNum: 'SC8'},
    {index: 9, colorNum: 'SC9'}
  ];

  // measure color list
  public measureColorList: { index: number, colorNum: string }[] = [
    {index: 1, colorNum: 'VC1'},
    {index: 2, colorNum: 'VC2'},
    {index: 3, colorNum: 'VC3'},
    {index: 4, colorNum: 'VC4'},
    {index: 5, colorNum: 'VC5'},
    {index: 6, colorNum: 'VC6'},
    {index: 7, colorNum: 'VC7'}
  ];

  // measure reverse color list
  public measureReverseColorList: { index: number, colorNum: string }[] = [
    {index: 8, colorNum: 'VC8'},
    {index: 9, colorNum: 'VC9'},
    {index: 10, colorNum: 'VC10'},
    {index: 11, colorNum: 'VC11'},
    {index: 12, colorNum: 'VC12'},
    {index: 13, colorNum: 'VC13'},
    {index: 14, colorNum: 'VC14'},
    {index: 15, colorNum: 'VC15'},
    {index: 16, colorNum: 'VC16'},
    {index: 17, colorNum: 'VC17'},
    {index: 18, colorNum: 'VC18'},
    {index: 19, colorNum: 'VC19'}
  ];

  // map chart - heatmap color list
  public mapHeatmapColorList: { index: number, colorNum: string }[] = [
    {index: 1, colorNum: 'HC1'},
    {index: 2, colorNum: 'HC2'},
    {index: 3, colorNum: 'HC3'},
    {index: 4, colorNum: 'HC4'},
    {index: 5, colorNum: 'HC5'},
    {index: 6, colorNum: 'HC6'},
    {index: 7, colorNum: 'HC7'}
  ];

  public isTemplateColorInverted: boolean = undefined;

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
    console.log( '>>>>> schema : ' + this.schema );
    console.log( '>>>>> colorType : ' + this.colorType );
  }

  /**
   *
   * @param {object} colorObj
   */
  public changeColor(colorObj: object) {
    const color = _.cloneDeep(colorObj);
    if ($('input#invertColor').is(':checked')) {
      color['colorNum'] = 'R' + color['colorNum'];
    }
    this.notiChangeColor.emit(color);
  }

  public invertColor() {
    event.stopPropagation();

    this.isTemplateColorInverted = $('input#invertColor').is(':checked');

    let colorList: object[] = [];

    // measure color list 합치기
    colorList = colorList.concat(this.measureColorList);
    colorList = colorList.concat(this.measureReverseColorList);

    // 컬러리스트에서 같은 코드값을 가지는경우
    for (const item of colorList) {
      // 코드값이 같은경우
      if (this.isChartColorSelected(item)) {
        this.changeColor(item);
      }
    }
  }

  public isChartColorInverted() {
    return this.schema.indexOf('R') === 0;
  }

  public isChartColorSelected(item) {
    return this.schema.endsWith(item['colorNum']);
  }

  public onClose(): void {
    this.closeEvent.emit();
  } // func - onClose

}
