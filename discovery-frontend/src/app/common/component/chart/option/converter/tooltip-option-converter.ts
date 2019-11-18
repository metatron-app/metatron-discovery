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

import { FormatOptionConverter } from './format-option-converter';
import { UIChartFormat } from '../ui-option/ui-format';
import { UIOption } from '../ui-option';
import * as _ from 'lodash';
import { UIChartDataLabelDisplayType } from '../define/common';
import { GeoField } from '../../../../../domain/workbook/configurations/field/geo-field';

/**
 * 수자 포맷 옵션 컨버터
 */
export class TooltipOptionConverter {

  /**
   * set tooltip previewlist
   */
  public static setTooltipPreviewList(uiOption: UIOption): Object[] {

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

  /**
   * return data value list (geo)
   * @param {GeoField[]} layerItems
   * @returns {GeoField[]}
   */
  public static returnTooltipDataValue(layerItems: GeoField[]): GeoField[] {
    // if it's not custom field, exclude geo data
    layerItems = layerItems.filter((item) => {
      // map 공간연산 때 count 라는 custom field를 ui에서 생성하기 때문에 우회해야함
      // if(_.isUndefined(item['isCustomField']) || (!_.isUndefined(item['isCustomField']) && item['isCustomField'] === false)) {
        return ('user_expr' == item.field.type || (item.field.logicalType && -1 == item.field.logicalType.toString().indexOf('GEO')));
      // }
    });
    let groupList = _.groupBy(layerItems, {'type' : 'measure'});
    // remove the columns having same name in dimension
    groupList['false'] = _.uniqBy(groupList['false'], 'name');
    layerItems = _.union(groupList['true'], groupList['false']);
    return layerItems;
  }

  // /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  //  | Public Method
  //  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  //
  // /**
  //  * Tooltip: 포맷에 해당하는 옵션을 모두 적용한다.
  //  * @param chartOption
  //  * @param uiOption
  //  * @returns {BaseOption}
  //  */
  // public static convertTooltipFormat(chartOption: BaseOption, uiOption: UIOption): BaseOption {
  //
  //   ///////////////////////////
  //   // UI 옵션에서 값 추출
  //   ///////////////////////////
  //
  //   let format: UIChartFormat = uiOption.format;
  //   if (_.isUndefined(format)){ return chartOption };
  //
  //   ///////////////////////////
  //   // 차트 옵션에 적용
  //   // - 시리즈
  //   ///////////////////////////
  //
  //   // 시리즈
  //   let series: Series[] = chartOption.series;
  //
  //   // 적용
  //   _.each(series, (option, index) => {
  //
  //     if( _.isUndefined(option.label) ) { option.label = { normal: {} }; }
  //     if( _.isUndefined(option.label.normal) ) { option.label.normal = {} }
  //
  //     // 적용
  //     option.label.normal.formatter = ((params): any => {
  //       return this.getFormatValueSeries(params, format);
  //     });
  //   });
  //
  //   // 반환
  //   return chartOption;
  // }
  //
  //
  //
  // /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  //  | Private Method
  //  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  //
  // /**
  //  * Tooltip: 포맷을 변경한다.
  //  * @param params
  //  * @param format
  //  * @returns {any}
  //  */
  // private static getFormatValueSeries(params: any, format: UIChartFormat): string {
  //
  //   // 기준선 일때
  //   if (params.componentType === 'markLine') {
  //     return params.data.value;
  //   } else if (params.componentType === 'series') {
  //
  //     // 데이터 천단위마다 콤마 표시
  //     // 데이터가 배열 형식이라면 가장 마지막 요소의 값을 변환
  //     if (_.isUndefined(params.value)) return '';
  //     let value = _.isArray(params.value) ? _.last(params.value) : params.value;
  //     if (_.isNull(value)) return;
  //
  //
  //     //////////////////////////////////////////////////
  //     // 공통포멧
  //     //////////////////////////////////////////////////
  //     if( format && format.isAll ) {
  //
  //       // 포맷 적용
  //       value = this.getFormatValue(value, format);
  //     }
  //     //////////////////////////////////////////////////
  //     // 개별포멧
  //     //////////////////////////////////////////////////
  //     else if( format && !format.isAll ) {
  //
  //       // 포멧에 해당하는지 여부
  //       for( let eachFormat of format.each ) {
  //         if( params.seriesName == eachFormat.name
  //           || params.seriesName == (eachFormat.aggregationType +'('+ eachFormat.name +')')
  //           || params.name == eachFormat.name
  //           || params.name == (eachFormat.aggregationType +'('+ eachFormat.name +')') ){
  //
  //           // 포맷 적용
  //           value = FormatOptionConverter.getFormatValue(value, eachFormat);
  //         }
  //       }
  //     }
  //     //////////////////////////////////////////////////
  //     // 포멧 정보가 없을경우
  //     //////////////////////////////////////////////////
  //     else {
  //       value = value.toLocaleString();
  //     }
  //
  //     // // 파이차트의 show Label 옵션이 꺼져있는경우
  //     // if (SeriesType.PIE === params.seriesType && params.data && '' === params.data.name) {
  //     //   return '';
  //     // }
  //
  //     return value;
  //   }
  // }

}
