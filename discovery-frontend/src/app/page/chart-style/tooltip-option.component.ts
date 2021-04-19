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
import {UIChartDataLabelDisplayType} from '@common/component/chart/option/define/common';
import {UIOption} from '@common/component/chart/option/ui-option';
import {FormatOptionConverter} from '@common/component/chart/option/converter/format-option-converter';
import {LabelBaseOptionComponent} from './labelbase-option.component';
import {TooltipOptionConverter} from '@common/component/chart/option/converter/tooltip-option-converter';

@Component({
  selector: 'tooltip-option',
  templateUrl: './tooltip-option.component.html'
})
export class TooltipOptionComponent extends LabelBaseOptionComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('uiOption')
  public set setUiOption(uiOption: UIOption) {

    if (!uiOption.toolTip) {
      uiOption.toolTip = {};
    }
    // displayTypes가 없는경우 차트에 따라서 기본 displayTypes설정
    if (!uiOption.toolTip.displayTypes) {
      uiOption.toolTip.displayTypes = FormatOptionConverter.setDisplayTypes(uiOption.type, this.pivot);
    }

    uiOption.toolTip.previewList = TooltipOptionConverter.setTooltipPreviewList(uiOption);

    // useDefaultFormat이 없는경우
    if (typeof uiOption.toolTip.useDefaultFormat === 'undefined') uiOption.toolTip.useDefaultFormat = true;

    // Set
    this.uiOption = uiOption;
  }

  public get uiChartDataLabelDisplayType(): typeof UIChartDataLabelDisplayType{
    return UIChartDataLabelDisplayType;
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
   * 표시 레이블 선택 토글
   * @param displayType
   * @param typeIndex
   */
  public toggleDisplayType(displayType: string, typeIndex: number): void {

    // 값이 없을경우 기화
    if (!this.uiOption.toolTip.displayTypes) {
      this.uiOption.toolTip.displayTypes = [];
    }

    // 이미 체크된 상태라면 제거
    let isFind = false;
    _.each(this.uiOption.toolTip.displayTypes, (type, index) => {
      if (_.eq(type, displayType)) {
        isFind = true;
        this.uiOption.toolTip.displayTypes[index] = null;
      }
    });

    // 체크되지 않은 상태라면 추가
    if (!isFind) {
      this.uiOption.toolTip.displayTypes[typeIndex] = UIChartDataLabelDisplayType[displayType];
    }

    // preview 설정
    this.uiOption.toolTip.previewList = TooltipOptionConverter.setTooltipPreviewList(this.uiOption);

    // 적용
    this.apply();
  }

  /**
   * 적용
   */
  public apply(): void {

    // 옵션 적용
    this.uiOption = (_.extend({}, this.uiOption, {toolTip: this.uiOption.toolTip}) as UIOption);
    this.update();
  }

  /**
   * 기본포멧 사용여부
   */
  public changeUseDefaultFormat(): void {

    this.uiOption.toolTip.useDefaultFormat = !this.uiOption.toolTip.useDefaultFormat;
    this.apply();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
