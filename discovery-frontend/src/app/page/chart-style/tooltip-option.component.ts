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
import { ChartType, UIChartDataLabelDisplayType } from '../../common/component/chart/option/define/common';
import { UIOption } from '../../common/component/chart/option/ui-option';
import * as _ from 'lodash';
import { FormatOptionConverter } from '../../common/component/chart/option/converter/format-option-converter';
import { UIChartFormat } from '../../common/component/chart/option/ui-option/ui-format';
import { LabelBaseOptionComponent } from './labelbase-option.component';
@Component({
  selector: 'tooltip-option',
  templateUrl: './tooltip-option.component.html'
})
export class TooltipOptionComponent extends LabelBaseOptionComponent {

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

    if( !uiOption.toolTip ) {
      uiOption.toolTip = {};
    }
    // displayTypes가 없는경우 차트에 따라서 기본 displayTypes설정
    if (!uiOption.toolTip.displayTypes) {
      uiOption.toolTip.displayTypes = FormatOptionConverter.setDisplayTypes(uiOption.type);
    }

    uiOption.toolTip.previewList = this.setPreviewList(uiOption);

    // useDefaultFormat이 없는경우
    if (typeof uiOption.toolTip.useDefaultFormat === 'undefined') uiOption.toolTip.useDefaultFormat = true;

    // Set
    this.uiOption = uiOption;
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
  public toggleDisplayType(displayType: UIChartDataLabelDisplayType, typeIndex: number): void {

    // 값이 없을경우 기화
    if( !this.uiOption.toolTip.displayTypes ) {
      this.uiOption.toolTip.displayTypes = [];
    }

    // 이미 체크된 상태라면 제거
    let isFind = false;
    _.each(this.uiOption.toolTip.displayTypes, (type, index) => {
      if( _.eq(type, displayType) ) {
        isFind = true;
        this.uiOption.toolTip.displayTypes[index] = null;
      }
    });

    // 체크되지 않은 상태라면 추가
    if( !isFind ) {
      this.uiOption.toolTip.displayTypes[typeIndex] = displayType;
    }

    // preview 설정
    this.uiOption.toolTip.previewList = this.setPreviewList(this.uiOption);

    // 적용
    this.apply();
  }

  /**
   * 적용
   */
  public apply(): void {

    // 옵션 적용
    this.uiOption = <UIOption>_.extend({}, this.uiOption, { toolTip: this.uiOption.toolTip });
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

  /**
   * 미리보기 설정
   */
  private setPreviewList(uiOption: UIOption): Object[] {

    // 미리보기 리스트 초기화
    uiOption.toolTip.previewList = [];

    let format: UIChartFormat = uiOption.valueFormat;

    // 축의 포멧이 있는경우 축의 포멧으로 설정
    const axisFormat = FormatOptionConverter.getlabelAxisScaleFormatTooltip(uiOption);
    if (axisFormat) format = axisFormat;

    // 포멧값이 설정된 숫자값
    let numValue = FormatOptionConverter.getFormatValue(1000, format);

    if (uiOption.toolTip.displayTypes) {
      // displayType에 따라서 미리보기 설정
      for (const type of uiOption.toolTip.displayTypes) {

        switch(type) {

          case UIChartDataLabelDisplayType.CATEGORY_NAME:
            uiOption.toolTip.previewList.push({name: 'Category: Category Name', value: UIChartDataLabelDisplayType.CATEGORY_NAME});
            break;
          case UIChartDataLabelDisplayType.CATEGORY_VALUE:
            uiOption.toolTip.previewList.push({name: 'Category Value: ' + numValue, value: UIChartDataLabelDisplayType.CATEGORY_VALUE});
            break;
          case UIChartDataLabelDisplayType.CATEGORY_PERCENT:
            uiOption.toolTip.previewList.push({name: 'Category %: 100%', value: UIChartDataLabelDisplayType.CATEGORY_PERCENT});
            break;
          case UIChartDataLabelDisplayType.SERIES_NAME:
            uiOption.toolTip.previewList.push({name: 'Series: Series Name', value: UIChartDataLabelDisplayType.SERIES_NAME});
            break;
          case UIChartDataLabelDisplayType.SERIES_VALUE:
            uiOption.toolTip.previewList.push({name: 'Series Value: ' + numValue, value: UIChartDataLabelDisplayType.SERIES_VALUE});
            break;
          case UIChartDataLabelDisplayType.SERIES_PERCENT:
            uiOption.toolTip.previewList.push({name: 'Series %: 100%', value: UIChartDataLabelDisplayType.SERIES_PERCENT});
            break;
          case UIChartDataLabelDisplayType.XAXIS_VALUE:
            uiOption.toolTip.previewList.push({name: 'X axis Value: ' + numValue, value: UIChartDataLabelDisplayType.XAXIS_VALUE});
            break;
          case UIChartDataLabelDisplayType.YAXIS_VALUE:
            uiOption.toolTip.previewList.push({name: 'Y axis Value: ' + numValue, value: UIChartDataLabelDisplayType.YAXIS_VALUE});
            break;
          case UIChartDataLabelDisplayType.VALUE:
            uiOption.toolTip.previewList.push({name: 'Value: ' + numValue, value: UIChartDataLabelDisplayType.VALUE});
            break;
          case UIChartDataLabelDisplayType.NODE_NAME:
            uiOption.toolTip.previewList.push({name: 'Node: Node Name', value: UIChartDataLabelDisplayType.NODE_NAME});
            break;
          case UIChartDataLabelDisplayType.LINK_VALUE:
            uiOption.toolTip.previewList.push({name: 'Link Value: ' + numValue, value: UIChartDataLabelDisplayType.LINK_VALUE});
            break;
          case UIChartDataLabelDisplayType.NODE_VALUE:
            uiOption.toolTip.previewList.push({name: 'Node Value: ' + numValue, value: UIChartDataLabelDisplayType.NODE_VALUE});
            break;
          case UIChartDataLabelDisplayType.HIGH_VALUE:
            uiOption.toolTip.previewList.push({name: 'High: ' + numValue, value: UIChartDataLabelDisplayType.HIGH_VALUE});
            break;
          case UIChartDataLabelDisplayType.THREE_Q_VALUE:
            uiOption.toolTip.previewList.push({name: '3Q: ' + numValue, value: UIChartDataLabelDisplayType.THREE_Q_VALUE});
            break;
          case UIChartDataLabelDisplayType.MEDIAN_VALUE:
            uiOption.toolTip.previewList.push({name: 'Median: ' + numValue, value: UIChartDataLabelDisplayType.MEDIAN_VALUE});
            break;
          case UIChartDataLabelDisplayType.FIRST_Q_VALUE:
            uiOption.toolTip.previewList.push({name: '1Q: ' + numValue, value: UIChartDataLabelDisplayType.FIRST_Q_VALUE});
            break;
          case UIChartDataLabelDisplayType.LOW_VALUE:
            uiOption.toolTip.previewList.push({name: 'Low: ' + numValue, value: UIChartDataLabelDisplayType.LOW_VALUE});
            break;
        }
      }
    }

    // value / percent가 있을때 한줄로 나오게 설정
    const filteredDisplayTypes = _.cloneDeep(_.filter(uiOption.toolTip.displayTypes));
    let categoryValIdx = filteredDisplayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_VALUE);
    let categoryPerIdx = filteredDisplayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_PERCENT);
    if (-1 !== categoryValIdx && -1 !== categoryPerIdx) {
      uiOption.toolTip.previewList[categoryValIdx]['name'] = 'Category Value: ' + numValue + '(100%)';
      uiOption.toolTip.previewList.splice(categoryPerIdx, 1);
    }

    let seriesValIdx = filteredDisplayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE);
    let seriesPerIdx = filteredDisplayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT);
    if (-1 !== seriesValIdx && -1 !== seriesPerIdx) {

      // category value/percent가 둘다있는경우 previewList length가 하나줄어드므로 index 이동
      if (-1 !== categoryValIdx && -1 !== categoryPerIdx) {
        seriesValIdx += -1;
        seriesPerIdx += -1;
      }
      uiOption.toolTip.previewList[seriesValIdx]['name'] = 'Series Value: ' + numValue + '(100%)';
      uiOption.toolTip.previewList.splice(seriesPerIdx, 1);
    }

    return uiOption.toolTip.previewList;
  }
}
