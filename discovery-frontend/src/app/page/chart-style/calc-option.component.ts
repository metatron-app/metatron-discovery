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

import * as _ from 'lodash';
import {Component, ElementRef, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {TotalValueStyle, UIGridChart} from '@common/component/chart/option/ui-option/ui-grid-chart';
import {UIOption} from '@common/component/chart/option/ui-option';
import {FontSize, GridViewType, Operator, UIPosition} from '@common/component/chart/option/define/common';
import {BaseOptionComponent} from './base-option.component';

@Component({
  selector: 'calc-option',
  templateUrl: './calc-option.component.html'
})
export class CalculatedRowOptionComponent extends BaseOptionComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public operatorDefaultIdx: number = 0;

  public hAlignDefaultIdx: number = 0;

  // 차트정보
  @Input('uiOption')
  public set setUiOption(uiOption: UIOption) {
    // Set
    this.uiOption = uiOption;

    // 원본데이터인경우 연산행 제거
    if (GridViewType.MASTER === (this.uiOption as UIGridChart).dataType && this.uiOption['totalValueStyle']) {
      this.uiOption = (_.extend({}, this.uiOption, {totalValueStyle: null}) as UIOption);
      this.update();
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

    const uiOption = (this.uiOption as UIGridChart);

    // annotation 최초설정시
    if (!uiOption.totalValueStyle) {

      uiOption.totalValueStyle = {};
      // uiOption.totalValueStyle.label = this.translateService.instant('msg.page.calc.label.grand.total');
      uiOption.totalValueStyle.fontSize = FontSize.NORMAL;
      uiOption.totalValueStyle.fontStyles = [];
      uiOption.totalValueStyle.fontColor = '';
      uiOption.totalValueStyle.backgroundColor = '#eeeeee';
      uiOption.totalValueStyle.hAlign = UIPosition.AUTO;
      uiOption.totalValueStyle.vAlign = UIPosition.MIDDLE;
      uiOption.totalValueStyle.aggregationType = Operator.SUM;

      // annotation이 있을때
    } else {

      uiOption.totalValueStyle = null;
    }

    this.uiOption = (_.extend({}, this.uiOption, {totalValueStyle: uiOption.totalValueStyle}) as UIOption);

    this.update();
  }

  public onChangedCalculatedRowSlider(style: TotalValueStyle) {
    this.uiOption = (_.extend({}, this.uiOption, {totalValueStyle: style}) as UIOption);
    this.update();
  }

  public showCalculatedColumn(): void {
    const uiOption = (this.uiOption as UIGridChart);

    // annotation 최초설정시
    if (!uiOption.showCalculatedColumnStyle) {
      uiOption.showCalculatedColumnStyle = {};
      // uiOption.totalValueStyle.label = this.translateService.instant('msg.page.calc.label.grand.total');
      uiOption.showCalculatedColumnStyle.fontSize = FontSize.NORMAL;
      uiOption.showCalculatedColumnStyle.fontStyles = [];
      uiOption.showCalculatedColumnStyle.fontColor = '';
      uiOption.showCalculatedColumnStyle.backgroundColor = '#eeeeee';
      uiOption.showCalculatedColumnStyle.hAlign = UIPosition.AUTO;
      uiOption.showCalculatedColumnStyle.vAlign = UIPosition.MIDDLE;
      uiOption.showCalculatedColumnStyle.aggregationType = Operator.SUM;
    } else {
      uiOption.showCalculatedColumnStyle = null;
    }

    this.uiOption = (_.extend({}, this.uiOption, {showCalculatedColumnStyle: uiOption.showCalculatedColumnStyle}) as UIOption);

    this.update();
  }

  public onChangedCalculatedColumnSlider(style: TotalValueStyle) {
    this.uiOption = (_.extend({}, this.uiOption, {showCalculatedColumnStyle: style}) as UIOption);
    this.update();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // private apply(totalValueStyle: TotalValueStyle): void {
  //   this.uiOption = (_.extend({}, this.uiOption, {totalValueStyle: totalValueStyle}) as UIOption);
  //   this.update();
  // }
}
