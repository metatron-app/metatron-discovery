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

import { BaseOption } from '../base-option';
import { UIOption } from '../ui-option';
import * as _ from 'lodash';
import { Series } from '../define/series';
import { UIChartDataLabel } from '../ui-option/ui-datalabel';
import { DataLabelPosition, Position, UIChartDataLabelDisplayType } from '../define/common';
import { FormatOptionConverter } from './format-option-converter';
import { UIChartFormat } from '../ui-option/ui-format';

/**
 * 데이터 레이블 옵션 컨버터
 */
export class LabelOptionConverter {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 레이블에 해당하는 옵션을 모두 적용한다.
   * @param chartOption
   * @param uiOption
   * @returns {BaseOption}
   */
  public static convertLabel(chartOption: BaseOption, uiOption: UIOption): BaseOption {

    ///////////////////////////
    // DataLabel 속성이 없으면 진행안함
    ///////////////////////////

    if( !uiOption.dataLabel ) {
      // 반환
      return chartOption;
    }

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 레이블 표시여부
    chartOption = this.convertLabelShow(chartOption, uiOption);

    // 레이블 표시위치
    chartOption = this.convertLabelPosition(chartOption, uiOption);

    // 레이블 회전
    chartOption = this.convertLabelRotation(chartOption, uiOption);

    // 레이블 색상
    chartOption = this.convertLabelColor(chartOption, uiOption);

    // 레이블 배경 색상
    chartOption = this.convertLabelBackgroundColor(chartOption, uiOption);

    // 레이블 아웃라인 색상
    chartOption = this.convertLabelOutlineColor(chartOption, uiOption);

    // 레이블 정렬
    chartOption = this.convertLabelAlign(chartOption, uiOption);

    // 반환
    return chartOption;
  }

  /**
   * 레이블 표시여부
   * @param chartOption
   * @param uiOption
   */
  public static convertLabelShow(chartOption: BaseOption, uiOption: UIOption): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    const label: UIChartDataLabel = uiOption.dataLabel;

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 시리즈
    const series: Series[] = chartOption.series;

    // 적용
    _.each(series, (option) => {

      // 적용
      if( _.isUndefined(option.label) ) { option.label = {normal: {}} }
      option.label.normal.show = label.showValue;
    });

    // 적용
    if( _.isUndefined(chartOption.label) ) { chartOption.label = {}; }
    if( _.isUndefined(chartOption.label.normal) ) { chartOption.label.normal = {}; }
    chartOption.label.normal.show = label.showValue;

    // 반환
    return chartOption;
  }

  /**
   * 레이블 위치
   * @param chartOption
   * @param uiOption
   */
  public static convertLabelPosition(chartOption: BaseOption, uiOption: UIOption): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    const label: UIChartDataLabel = uiOption.dataLabel;
    if( !label.pos ) {
      return chartOption;
    }

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    let position: Position = null;

    // 적용
    switch(label.pos) {
      case DataLabelPosition.OUTSIDE_TOP :
      case DataLabelPosition.TOP :
        position = Position.TOP;
        break;
      case DataLabelPosition.OUTSIDE_RIGHT :
        position = Position.RIGHT;
        break;
      case DataLabelPosition.INSIDE_TOP :
        position = Position.INSIDETOP;
        break;
      case DataLabelPosition.INSIDE_BOTTOM :
        position = Position.INSIDEBOTTOM;
        break;
      case DataLabelPosition.INSIDE_RIGHT :
        position = Position.INSIDERIGHT;
        break;
      case DataLabelPosition.INSIDE_LEFT :
        position = Position.INSIDELEFT;
        break;
      case DataLabelPosition.CENTER :
        position = Position.INSIDE;
        break;
      case DataLabelPosition.BOTTOM :
        position = Position.BOTTOM;
        break;
      default:
        position = Position.TOP;
        break;
    }

    // 시리즈
    const series: Series[] = chartOption.series;

    // 적용
    _.each(series, (option) => {

      // 적용
      if( _.isUndefined(option.label) ) { option.label = {normal: {}} }
      option.label.normal.position = position;
    });

    // 적용
    if( _.isUndefined(chartOption.label) ) { chartOption.label = {}; }
    if( _.isUndefined(chartOption.label.normal) ) { chartOption.label.normal = {}; }
    chartOption.label.normal.position = position;

    // 반환
    return chartOption;
  }

  /**
   * 레이블 회전
   * @param chartOption
   * @param uiOption
   */
  public static convertLabelRotation(chartOption: BaseOption, uiOption: UIOption): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    const label: UIChartDataLabel = uiOption.dataLabel;

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 시리즈
    const series: Series[] = chartOption.series;

    // 적용
    _.each(series, (option) => {

      // 적용
      if( _.isUndefined(option.label) ) { option.label = {normal: {}} }
      option.label.normal.rotate = label.enableRotation ? 90 : 0;
      option.label.normal.align = label.enableRotation ? 'top' : null;
    });

    // 반환
    return chartOption;
  }

  /**
   * 레이블 색상
   * @param chartOption
   * @param uiOption
   */
  public static convertLabelColor(chartOption: BaseOption, uiOption: UIOption): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    const label: UIChartDataLabel = uiOption.dataLabel;

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 시리즈
    const series: Series[] = chartOption.series;

    // 적용
    _.each(series, (option) => {

      // 적용
      if( _.isUndefined(option.label) ) { option.label = {normal: {}} }
      if( label.textColor ) {
        option.label.normal.color = label.textColor;
      }
      else {
        delete option.label.normal.color;
      }
    });

    // 반환
    return chartOption;
  }

  /**
   * 레이블 배경색상
   * @param chartOption
   * @param uiOption
   */
  public static convertLabelBackgroundColor(chartOption: BaseOption, uiOption: UIOption): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    const label: UIChartDataLabel = uiOption.dataLabel;

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 시리즈
    const series: Series[] = chartOption.series;

    // 적용
    _.each(series, (option) => {

      // 적용
      if( _.isUndefined(option.label) ) { option.label = {normal: {}} }
      if( label.textBackgroundColor ) {
        option.label.normal.backgroundColor = label.textBackgroundColor;
      }
      else {
        delete option.label.normal.backgroundColor;
      }
    });

    // 반환
    return chartOption;
  }

  /**
   * 레이블 아웃라인 색상
   * @param chartOption
   * @param uiOption
   */
  public static convertLabelOutlineColor(chartOption: BaseOption, uiOption: UIOption): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    const label: UIChartDataLabel = uiOption.dataLabel;

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 시리즈
    const series: Series[] = chartOption.series;

    // 적용
    _.each(series, (option) => {

      // 적용
      if( _.isUndefined(option.label) ) { option.label = {normal: {}} }
      if( label.textOutlineColor ) {
        option.label.normal.textBorderColor = label.textOutlineColor;
        option.label.normal.textBorderWidth = 2;
      }
      else {
        delete option.label.normal.textBorderColor;
        delete option.label.normal.textBorderWidth;
      }
    });

    // 반환
    return chartOption;
  }

  /**
   * 레이블 정렬
   * @param chartOption
   * @param uiOption
   */
  public static convertLabelAlign(chartOption: BaseOption, uiOption: UIOption): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    const label: UIChartDataLabel = uiOption.dataLabel;

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 시리즈
    const series: Series[] = chartOption.series;

    // 적용
    _.each(series, (option) => {

      // 적용
      if( _.isUndefined(option.label) ) { option.label = {normal: {}} }
      if( label.textAlign && label.displayTypes && _.filter(label.displayTypes).length >= 2 ) {
        // Rich를 만든다. 포메터에서 사용
        let color: string = '#FFF';
        // textColor가 있는경우
        if( label.textColor && label.textColor !== ' ') {
          color = label.textColor;

        // textColor가 없는경우
        } else {
          if( label.pos ) {
            if( _.eq(label.pos, DataLabelPosition.CENTER) || String(label.pos).indexOf('INSIDE') !== -1 ) {
              color = '#FFF';
            }
            else {
              color = null;
            }
          }
        }

        option.label.normal.rich = {
          align: {
            align: String(label.textAlign).toLowerCase(),
            color: color
          }
        }
      }
      else {
        if (' ' === option.label.normal.color) delete option.label.normal.color;
        delete option.label.normal.rich;
      }
    });

    // 반환
    return chartOption;
  }


  /**
   * set datalabel previewlist
   */
  public static setDataLabelPreviewList(uiOption: UIOption): object[] {

    // 미리보기 리스트 초기화
    uiOption.dataLabel.previewList = [];

    let format: UIChartFormat = uiOption.valueFormat;

    // 축의 포멧이 있는경우 축의 포멧으로 설정
    const axisFormat = FormatOptionConverter.getlabelAxisScaleFormat(uiOption);
    if (axisFormat) format = axisFormat;

    // 포멧값이 설정된 숫자값
    const numValue = FormatOptionConverter.getFormatValue(1000, format);

    if (uiOption.dataLabel.displayTypes) {
      // displayType에 따라서 미리보기 설정
      for (const type of uiOption.dataLabel.displayTypes) {

        switch(type) {

          case UIChartDataLabelDisplayType.CATEGORY_NAME:
            uiOption.dataLabel.previewList.push({name: 'Category Name', value: UIChartDataLabelDisplayType.CATEGORY_NAME});
            break;
          case UIChartDataLabelDisplayType.CATEGORY_VALUE:
            uiOption.dataLabel.previewList.push({name: numValue, value: UIChartDataLabelDisplayType.CATEGORY_VALUE});
            break;
          case UIChartDataLabelDisplayType.CATEGORY_PERCENT:
            uiOption.dataLabel.previewList.push({name: '100%', value: UIChartDataLabelDisplayType.CATEGORY_PERCENT});
            break;
          case UIChartDataLabelDisplayType.SERIES_NAME:
            uiOption.dataLabel.previewList.push({name: 'Series Name', value: UIChartDataLabelDisplayType.SERIES_NAME});
            break;
          case UIChartDataLabelDisplayType.SERIES_VALUE:
            uiOption.dataLabel.previewList.push({name: numValue, value: UIChartDataLabelDisplayType.SERIES_VALUE});
            break;
          case UIChartDataLabelDisplayType.SERIES_PERCENT:
            uiOption.dataLabel.previewList.push({name: '100%', value: UIChartDataLabelDisplayType.SERIES_PERCENT});
            break;
          case UIChartDataLabelDisplayType.XAXIS_VALUE:
            uiOption.dataLabel.previewList.push({name: numValue, value: UIChartDataLabelDisplayType.XAXIS_VALUE});
            break;
          case UIChartDataLabelDisplayType.YAXIS_VALUE:
            uiOption.dataLabel.previewList.push({name: numValue, value: UIChartDataLabelDisplayType.YAXIS_VALUE});
            break;
          case UIChartDataLabelDisplayType.VALUE:
            uiOption.dataLabel.previewList.push({name: numValue, value: UIChartDataLabelDisplayType.VALUE});
            break;
          case UIChartDataLabelDisplayType.NODE_NAME:
            uiOption.dataLabel.previewList.push({name: 'Node Name', value: UIChartDataLabelDisplayType.NODE_NAME});
            break;
          case UIChartDataLabelDisplayType.LINK_VALUE:
            uiOption.dataLabel.previewList.push({name: numValue, value: UIChartDataLabelDisplayType.LINK_VALUE});
            break;
          case UIChartDataLabelDisplayType.NODE_VALUE:
            uiOption.dataLabel.previewList.push({name: numValue, value: UIChartDataLabelDisplayType.NODE_VALUE});
            break;
        }
      }
    }

    return uiOption.dataLabel.previewList;
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
