
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

/**
 * 수자 포맷 옵션 컨버터
 */
export class TooltipOptionConverter {

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
