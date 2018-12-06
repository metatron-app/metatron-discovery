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

import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractComponent } from '../abstract.component';

@Component({
  selector: 'color-template',
  templateUrl: './color-template.component.html'
})
export class ColorTemplateComponent extends AbstractComponent {

  // popup show / hide
  @Input('show')
  public show: boolean;

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

  // series color list
  public defaultColorList: Object[] = [
    { index: 1, colorNum: 'SC1' },
    { index: 2, colorNum: 'SC2' },
    { index: 3, colorNum: 'SC3' },
    { index: 4, colorNum: 'SC4' },
    { index: 5, colorNum: 'SC5' },
    { index: 6, colorNum: 'SC6' },
    { index: 7, colorNum: 'SC7' },
    { index: 8, colorNum: 'SC8' },
    { index: 9, colorNum: 'SC9' }
  ];

  // measure color list
  public measureColorList: Object[] = [
    { index: 1, colorNum: 'VC1' },
    { index: 2, colorNum: 'VC2' },
    { index: 3, colorNum: 'VC3' },
    { index: 4, colorNum: 'VC4' },
    { index: 5, colorNum: 'VC5' },
    { index: 6, colorNum: 'VC6' },
    { index: 7, colorNum: 'VC7' }
  ];

  // measure reverse color list
  public measureReverseColorList: Object[] = [
    { index: 8, colorNum: 'VC8' },
    { index: 9, colorNum: 'VC9' },
    { index: 10, colorNum: 'VC10' },
    { index: 11, colorNum: 'VC11' },
    { index: 12, colorNum: 'VC12' },
    { index: 13, colorNum: 'VC13' },
    { index: 14, colorNum: 'VC14' },
    { index: 15, colorNum: 'VC15' },
    { index: 16, colorNum: 'VC16' },
    { index: 17, colorNum: 'VC17' },
    { index: 18, colorNum: 'VC18' },
    { index: 19, colorNum: 'VC19' }
  ];

  // map chart - heatmap color list
  public mapHeatmapColorList: Object[] = [
    { index: 1, colorNum: 'HC1' },
    { index: 2, colorNum: 'HC2' },
    { index: 3, colorNum: 'HC3' },
    { index: 4, colorNum: 'HC4' },
    { index: 5, colorNum: 'HC5' },
    { index: 6, colorNum: 'HC6' },
    { index: 7, colorNum: 'HC7' }
  ];

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /**
   *
   * @param {Object} colorObj
   */
  public changeColor(colorObj: Object) {

    this.notiChangeColor.emit(colorObj);
  }
}
