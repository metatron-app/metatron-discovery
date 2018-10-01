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

import { Component, ElementRef, Injector, Input } from '@angular/core';
import {BaseOptionComponent} from "./base-option.component";
import { TotalValueStyle, UIGridChart } from '../../common/component/chart/option/ui-option/ui-grid-chart';
import { UIOption } from '../../common/component/chart/option/ui-option';
import {
  FontSize, GridViewType, Operator, TextAlign, UIFontStyle,
  UIPosition
} from '../../common/component/chart/option/define/common';
import * as _ from 'lodash';

@Component({
  selector: 'calrow-option',
  templateUrl: './calrow-option.component.html'
})
export class CalculatedRowOptionComponent extends BaseOptionComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 연산자 리스트
  public operatorList: Object[] = [
    {name: this.translateService.instant('msg.page.calrow.label.operator.sum'), value: Operator.SUM},
    {name: this.translateService.instant('msg.page.calrow.label.operator.average'), value: Operator.AVERAGE},
    {name: this.translateService.instant('msg.page.calrow.label.operator.max'), value: Operator.MAX},
    {name: this.translateService.instant('msg.page.calrow.label.operator.min'), value: Operator.MIN},
    {name: this.translateService.instant('msg.page.calrow.label.operator.count'), value: Operator.COUNT},
  ];
  public operatorDefaultIdx:number = 0;

  // 가로 align리스트
  public hAlignList: Object[] = [
    {name: this.translateService.instant('msg.page.chart.datalabel.text.align.default'), value: TextAlign.DEFAULT},
    {name: this.translateService.instant('msg.page.chart.datalabel.text.align.left'), value: TextAlign.LEFT},
    {name: this.translateService.instant('msg.page.chart.datalabel.text.align.center'), value: TextAlign.CENTER},
    {name: this.translateService.instant('msg.page.chart.datalabel.text.align.right'), value: TextAlign.RIGHT}
  ];
  public hAlignDefaultIdx:number = 0;

  // 차트정보
  @Input('uiOption')
  public set setUiOption(uiOption: UIOption) {

    // Set
    this.uiOption = uiOption;

    // 원본데이터인경우 연산행 제거
    if (GridViewType.MASTER == (<UIGridChart>this.uiOption).dataType && this.uiOption['totalValueStyle']) {

      this.uiOption = <UIOption>_.extend({}, this.uiOption, { totalValueStyle: null });
      this.update();
    } else if( this.uiOption ) {
      const gridUiOption = (<UIGridChart>this.uiOption);
      if( gridUiOption.totalValueStyle ) {
        this.operatorDefaultIdx = this.operatorList.findIndex( item => item['value'] === gridUiOption.totalValueStyle.aggregationType );
        this.hAlignDefaultIdx = this.hAlignList.findIndex( item => item['value'] === gridUiOption.totalValueStyle.hAlign );
        ( -1 === this.hAlignDefaultIdx ) && ( this.hAlignDefaultIdx = 0 );
      }
    }
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

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 연산행 show / hide 설정
   */
  public showCalculatedRow(): void {

    const uiOption = (<UIGridChart>this.uiOption);

    // annotation 최초설정시
    if (!uiOption.totalValueStyle) {

      uiOption.totalValueStyle = {};
      uiOption.totalValueStyle.label = this.translateService.instant('msg.page.calrow.label.grand.total');
      uiOption.totalValueStyle.fontSize = FontSize.NORMAL;
      uiOption.totalValueStyle.fontStyles = [];
      uiOption.totalValueStyle.fontColor = '';
      uiOption.totalValueStyle.backgroundColor = '#eeeeee';
      uiOption.totalValueStyle.hAlign = UIPosition.AUTO;
      uiOption.totalValueStyle.vAlign = UIPosition.MIDDLE;
      uiOption.totalValueStyle.aggregationType = Operator.SUM;

      this.operatorDefaultIdx = 0;
      this.hAlignDefaultIdx = 0;

    // annotation이 있을때
    } else {

      uiOption.totalValueStyle = null;
    }

    this.uiOption = <UIOption>_.extend({}, this.uiOption, { totalValueStyle: uiOption.totalValueStyle });

    this.update();
  }

  /**
   * 라벨을 변경시
   */
  public changeLabel(label: string): void {

    if (_.isEmpty(label)) label = 'Grand Total';

    let totalValueStyle = (<UIGridChart>this.uiOption).totalValueStyle;
    totalValueStyle.label = label;

    this.apply(totalValueStyle);
  }

  /**
   * 연산자 변경시
   */
  public changeOperator(data: Object): void {
    let totalValueStyle = (<UIGridChart>this.uiOption).totalValueStyle;
    totalValueStyle.aggregationType = data['value'];

    this.apply(totalValueStyle);
  }

  /**
   * 가로 align 변경시
   * @param data
   */
  public changeHAlign(data: Object): void {
    let totalValueStyle = (<UIGridChart>this.uiOption).totalValueStyle;
    totalValueStyle.hAlign = data['value'];

    this.apply(totalValueStyle);
  }

  /**
   * 세로 align 변경시
   * @param vAlign
   */
  public changeValign(vAlign: UIPosition): void {

    let totalValueStyle = (<UIGridChart>this.uiOption).totalValueStyle;
    totalValueStyle.vAlign = vAlign;

    this.apply(totalValueStyle);
  }

  /**
   * 폰트 사이즈 변경시
   * @param fontSize
   */
  public changeFontSize(fontSize: FontSize): void {

    let totalValueStyle = (<UIGridChart>this.uiOption).totalValueStyle;
    totalValueStyle.fontSize = fontSize;

    this.apply(totalValueStyle);
  }

  /**
   * 폰트 색상 변경시
   */
  public changeFontColor(fontColor: any): void {
    let totalValueStyle = (<UIGridChart>this.uiOption).totalValueStyle;
    totalValueStyle.fontColor = fontColor;

    this.apply(totalValueStyle);
  }

  /**
   * 배경색상 변경시
   */
  public changeFontBackground(backgroundColor: any): void {
    let totalValueStyle = (<UIGridChart>this.uiOption).totalValueStyle;
    totalValueStyle.backgroundColor = backgroundColor;

    this.apply(totalValueStyle);
  }

  /**
   * 폰트 스타일 변경시
   */
  public changeFontStyle(fontStyle: UIFontStyle): void {

    let totalValueStyle = (<UIGridChart>this.uiOption).totalValueStyle;

    if (-1 == totalValueStyle.fontStyles.indexOf(fontStyle)) {
      totalValueStyle.fontStyles.push(fontStyle);
    } else {
      totalValueStyle.fontStyles.splice(totalValueStyle.fontStyles.indexOf(fontStyle), 1);
    }

    this.apply(totalValueStyle);
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private apply(totalValueStyle: TotalValueStyle): void {
    this.uiOption = <UIOption>_.extend({}, this.uiOption, { totalValueStyle: totalValueStyle });
    this.update();
  }
}
