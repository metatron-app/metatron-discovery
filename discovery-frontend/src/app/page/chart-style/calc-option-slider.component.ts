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
import {TotalValueStyle} from '@common/component/chart/option/ui-option/ui-grid-chart';
import {FontSize, Operator, TextAlign, UIFontStyle, UIPosition} from '@common/component/chart/option/define/common';
import {AbstractComponent} from '@common/component/abstract.component';

@Component({
  selector: 'calc-option-slider',
  templateUrl: './calc-option-slider.component.html'
})
export class CalculatedOptionSliderComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public totalValueStyle: TotalValueStyle;

  // 차트정보
  @Input('totalValueStyle')
  public set setTotalValueStyle(totalValueStyle: TotalValueStyle) {
    // Set
    this.totalValueStyle = totalValueStyle;

    if (totalValueStyle) {
      this.operatorDefaultIdx = this.operatorList.findIndex(item => item['value'] === totalValueStyle.aggregationType);
      this.hAlignDefaultIdx = this.hAlignList.findIndex(item => item['value'] === totalValueStyle.hAlign);
      (-1 === this.hAlignDefaultIdx) && (this.hAlignDefaultIdx = 0);
    }
  }

  @Output() public onChanged = new EventEmitter();

  // 연산자 리스트
  public operatorList: object[] = [
    {name: this.translateService.instant('msg.page.calc.label.operator.sum'), value: Operator.SUM},
    {name: this.translateService.instant('msg.page.calc.label.operator.average'), value: Operator.AVERAGE},
    {name: this.translateService.instant('msg.page.calc.label.operator.max'), value: Operator.MAX},
    {name: this.translateService.instant('msg.page.calc.label.operator.min'), value: Operator.MIN},
    {name: this.translateService.instant('msg.page.calc.label.operator.count'), value: Operator.COUNT},
  ];
  public operatorDefaultIdx: number = 0;

  // 가로 align리스트
  public hAlignList: object[] = [
    {name: this.translateService.instant('msg.page.chart.datalabel.text.align.default'), value: TextAlign.DEFAULT},
    {name: this.translateService.instant('msg.page.chart.datalabel.text.align.left'), value: TextAlign.LEFT},
    {name: this.translateService.instant('msg.page.chart.datalabel.text.align.center'), value: TextAlign.CENTER},
    {name: this.translateService.instant('msg.page.chart.datalabel.text.align.right'), value: TextAlign.RIGHT}
  ];
  public hAlignDefaultIdx: number = 0;

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

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /**
   * 라벨을 변경시
   */
  public changeLabel(label: string): void {
    this.totalValueStyle.label = label;
    this.onChanged.emit(this.totalValueStyle);
  }

  /**
   * 연산자 변경시
   */
  public changeOperator(data: object): void {
    this.totalValueStyle.aggregationType = data['value'];
    this.onChanged.emit(this.totalValueStyle);
  }

  /**
   * 가로 align 변경시
   * @param data
   */
  public changeHAlign(data: object): void {
    this.totalValueStyle.hAlign = data['value'];
    this.onChanged.emit(this.totalValueStyle);
  }

  /**
   * 세로 align 변경시
   * @param vAlign
   */
  public changeValign(vAlign: string): void {
    this.totalValueStyle.vAlign = UIPosition[vAlign];
    this.onChanged.emit(this.totalValueStyle);
  }

  /**
   * 폰트 사이즈 변경시
   * @param fontSize
   */
  public changeFontSize(fontSize: string): void {
    this.totalValueStyle.fontSize = FontSize[fontSize];
    this.onChanged.emit(this.totalValueStyle);
  }

  /**
   * 폰트 색상 변경시
   */
  public changeFontColor(fontColor: any): void {
    this.totalValueStyle.fontColor = fontColor;
    this.onChanged.emit(this.totalValueStyle);
  }

  /**
   * 배경색상 변경시
   */
  public changeFontBackground(backgroundColor: any): void {
    this.totalValueStyle.backgroundColor = backgroundColor;
    this.onChanged.emit(this.totalValueStyle);
  }

  /**
   * 폰트 스타일 변경시
   */
  public changeFontStyle(fontStyle: string): void {

    if (-1 === this.totalValueStyle.fontStyles.indexOf(UIFontStyle[fontStyle])) {
      this.totalValueStyle.fontStyles.push(UIFontStyle[fontStyle]);
    } else {
      this.totalValueStyle.fontStyles.splice(this.totalValueStyle.fontStyles.indexOf(UIFontStyle[fontStyle]), 1);
    }

    this.onChanged.emit(this.totalValueStyle);
  }

  public isFontStyle(fontStyle: string): boolean {
    return (this.totalValueStyle && this.totalValueStyle.fontStyles.indexOf(UIFontStyle[fontStyle]) !== -1);
  }
}
