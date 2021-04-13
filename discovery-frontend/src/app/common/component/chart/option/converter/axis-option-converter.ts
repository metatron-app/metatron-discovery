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

import {BaseOption} from '../base-option';
import {UIOption} from '../ui-option';
import {
  AxisDefaultColor,
  AxisLabelRotate,
  AxisLabelType,
  AxisType,
  ChartAxisLabelType,
  UIOrient
} from '../define/common';
import {Axis} from '../define/axis';
import * as _ from 'lodash';
import {UIChartAxis, UIChartAxisLabelValue} from '../ui-option/ui-axis';
import {FormatOptionConverter} from './format-option-converter';
import {OptionGenerator} from '../util/option-generator';
import {isNull, isUndefined} from 'util';
import UI = OptionGenerator.UI;

/**
 * 축(X,Y) 옵션 컨버터
 */
export class AxisOptionConverter {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | Public Variable
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public static axisMinMax: object = {
    xAxis: {min: 0, max: 0},
    yAxis: {min: 0, max: 0},
    subAxis: {min: 0, max: 0}
  };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 축에 해당하는 옵션을 모두 적용한다.
   * @param {BaseOption} chartOption
   * @param {UIOption} uiOption
   * @param {AxisType} axisType
   * @param data
   * @returns {BaseOption}
   */
  public static convertAxis(chartOption: BaseOption, uiOption: UIOption, axisType: AxisType, data?: any): BaseOption {

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축 제목
    chartOption = this.convertAxisName(chartOption, uiOption, axisType);

    // 축 제목 표시여부
    chartOption = this.convertAxisNameShow(chartOption, uiOption, axisType);

    // 축 Label 표시여부
    chartOption = this.convertAxisLabelShow(chartOption, uiOption, axisType);

    // Y축 레이블 설정
    chartOption = this.convertAxisLabelFormatter(chartOption, uiOption, axisType);

    // 축 Label 회전
    chartOption = this.convertAxisLabelRotate(chartOption, uiOption, axisType);

    // 축 Label 최대 길이 설정
    chartOption = this.convertAxisLabelMaxLength(chartOption, uiOption, axisType);

    // 축 Min/Max 자동설정
    chartOption = this.convertAxisMinMax(chartOption, uiOption, axisType);

    // 축 범위 자동설정
    chartOption = this.convertAxisAutoScale(chartOption, uiOption, axisType, data);

    // 축 배경설정
    chartOption = this.convertAxisBackground(chartOption, uiOption, axisType);

    // 반환
    return chartOption;
  }

  /**
   * 축 제목 표시여부
   * @param {BaseOption} chartOption
   * @param {UIOption} uiOption
   * @param {AxisType} axisType
   * @returns {BaseOption}
   */
  public static convertAxisNameShow(chartOption: BaseOption, uiOption: UIOption, axisType: AxisType): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    // 축에 해당하는 Axis 옵션
    const axisOption: UIChartAxis[] = this.getAxisOption(uiOption, axisType);

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    const axis: Axis[] = chartOption[axisType];

    // 적용
    _.each(axis, (option, index) => {

      // Show 여부
      const isShow: boolean = axisOption[index].showName;

      // 적용
      option.name = !isShow ? '' : '' === option.name ? option.axisName : option.name;
    });

    // 반환
    return chartOption;
  }

  /**
   * 축 제목
   * @param {BaseOption} chartOption
   * @param {UIOption} uiOption
   * @param {AxisType} axisType
   * @returns {BaseOption}
   */
  public static convertAxisName(chartOption: BaseOption, uiOption: UIOption, axisType: AxisType): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    // 축에 해당하는 Axis 옵션
    const axisOption: UIChartAxis[] = this.getAxisOption(uiOption, axisType);

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    const axis: Axis[] = chartOption[axisType];

    // 적용
    _.each(axis, (option, index) => {

      // 축명
      const name: string = axisOption[index].customName ? axisOption[index].customName : axisOption[index].name;

      // 적용
      option.name = _.isEmpty(name) ? option.axisName : name;
    });

    // 반환
    return chartOption;
  }

  /**
   * 축 Label 표시여부
   * @param {BaseOption} chartOption
   * @param {UIOption} uiOption
   * @param {AxisType} axisType
   * @returns {BaseOption}
   */
  public static convertAxisLabelShow(chartOption: BaseOption, uiOption: UIOption, axisType: AxisType): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    // 축에 해당하는 Axis 옵션
    const axisOption: UIChartAxis[] = this.getAxisOption(uiOption, axisType);

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    const axis: Axis[] = chartOption[axisType];

    // 적용
    _.each(axis, (option, index) => {

      // Show 여부
      const isShow: boolean = axisOption[index].showLabel;

      // 적용
      option.axisLabel.show = isShow;
      option.axisTick.show = isShow;
      option.axisLine.show = isShow;

      // split line의 경우 항상 show여야함
      // if(option.splitLine) {
      //   option.splitLine.show = true;
      // }
    });

    // 반환
    return chartOption;
  }

  /**
   * 축 Label 회전
   * @param {BaseOption} chartOption
   * @param {UIOption} uiOption
   * @param {AxisType} axisType
   * @returns {BaseOption}
   */
  public static convertAxisLabelRotate(chartOption: BaseOption, uiOption: UIOption, axisType: AxisType): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    // 축에 해당하는 Axis 옵션
    const axisOption: UIChartAxis[] = this.getAxisOption(uiOption, axisType);

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    const axis: Axis[] = chartOption[axisType];

    // 적용
    _.each(axis, (option, index) => {

      // 회전 단위 적용
      option.axisLabel.rotate = axisOption[index].label && axisOption[index].label['rotation']
        ? axisOption[index].label['rotation']
        : AxisLabelRotate.HORIZONTAL;
    });

    // 반환
    return chartOption;
  }

  /**
   * 레이블 포멧 설정
   * @param chartOption
   * @param uiOption
   * @param axisType
   */
  public static convertAxisLabelFormatter(chartOption: BaseOption, uiOption: UIOption, axisType: AxisType): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    // 축에 해당하는 Axis 옵션
    const axisOption: UIChartAxis[] = this.getAxisOption(uiOption, axisType);

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    const axis: Axis[] = chartOption[axisType];

    _.each(axis, (option: Axis, index) => {

      // align이 있으면서 horizontal인 경우
      if (uiOption['align'] && UIOrient.HORIZONTAL === uiOption['align']) {

        // axisType이 X축이면서 label값이 없는경우 value값 설정
        if (_.eq(AxisType.X, axisType)) {

          // 라벨값이 없는경우
          if (!axisOption[index].label) {
            axisOption[index].label = UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE);

          // 라벨값이 있는경우
          } else {
            // type이 category인 경우 label 값을 y축으로 이동
            if (_.eq(axisOption[index].label.type, ChartAxisLabelType.CATEGORY)) {

              // y축 label값을 x축의 label값으로 변경
              uiOption.yAxis.label = _.cloneDeep(axisOption[index].label);

              // x축을 value타입으로 설정
              axisOption[index].label = UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE);
            }
          }
        }
      }

      // value type이 아닌경우 return
      if (!_.eq(AxisLabelType.SUBCOLUMN, axisOption[index].mode) && (
          !(axisOption[index].label) || !_.eq((axisOption[index].label).type, AxisType.VALUE))
      ) {
        return chartOption;
      }

      // 축의 format
      const axisFormat = (axisOption[index].label) ? (axisOption[index].label as UIChartAxisLabelValue).format : null;

      // 축의 format값이 있는경우 축의 format값으로 설정 / 없는경우 숫자포멧값으로 설정
      const format = axisFormat ? axisFormat : uiOption.valueFormat;

      // 기준선
      const baseline: number = axisOption[index].baseline as number;

      if (format) {
        option.axisLabel.formatter = ((params): any => {
          return FormatOptionConverter.getFormatValue(params, format, baseline);
        });
      }
    });

    // 반환
    return chartOption
  }

  /**
   * 축범위 자동설정
   * @param chartOption
   * @param uiOption
   * @param axisType
   */
  public static convertAxisMinMax(chartOption: BaseOption, uiOption: UIOption, axisType: AxisType): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    // 축에 해당하는 Axis 옵션
    const axisOption: UIChartAxis[] = this.getAxisOption(uiOption, axisType);

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    const axis: Axis[] = chartOption[axisType];

    _.each(axis, (option: Axis, index) => {

      // Value축일 경우
      if ((axisOption[index].label) && _.eq((axisOption[index].label).type, AxisType.VALUE)
        && axisOption[index].grid && !axisOption[index].grid.autoScaled) {

        if( axisOption[index].grid.min && axisOption[index].grid.min !== 0 ) {
          option.min = axisOption[index].grid.min;
        }

        if( axisOption[index].grid.max && axisOption[index].grid.max !== 0 ) {
          option.max = axisOption[index].grid.max;
        }
      }
    });

    // 반환
    return chartOption
  }

  /**
   * 축범위 자동설정
   * @param chartOption
   * @param uiOption
   * @param axisType
   * @param data
   */
  public static convertAxisAutoScale(chartOption: BaseOption, uiOption: UIOption, axisType: AxisType, data?: any): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    // 축에 해당하는 Axis 옵션
    const axisOption: UIChartAxis[] = this.getAxisOption(uiOption, axisType);

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    const axis: Axis[] = chartOption[axisType];

    _.each(axis, (option: Axis, index) => {

      // Value축일 경우
      if ((axisOption[index].label) && _.eq((axisOption[index].label).type, AxisType.VALUE)
          && axisOption[index].grid ) {

        let min = null;
        let max = null;
        // let calculateMin = null;
        if( data.categories && data.categories.length > 0 ) {
          _.each(data.categories, (category) => {
            _.each(category.value, (value) => {
              if( min == null || value < min ) {
                min = value;
              }
              if( max == null || value > max ) {
                max = value;
              }
            });
          });
          // calculateMin = Math.ceil(min - ((max - min) * 0.05))
          // min = min > 0
          //   ? calculateMin >= 0 ? calculateMin : min
          //   : min;
          max = max == null ? 0 : max;
        }
        else {
          // calculateMin = Math.ceil(data.info.minValue - ((data.info.maxValue - data.info.minValue) * 0.05))
          min = data.info.minValue;
          // min = data.info.minValue > 0
          //   ? calculateMin >= 0 ? calculateMin : min
          //   : data.info.minValue;
          max = data.info.maxValue;
        }

        // Min / Max 업데이트
        AxisOptionConverter.axisMinMax[axisType].min = min;
        AxisOptionConverter.axisMinMax[axisType].max = max;

        // 기준선 변경시
        let baseline = 0;
        if( axisOption[index].baseline && axisOption[index].baseline !== 0 ) {
          baseline = axisOption[index].baseline as number;
        }

        // 축 범위 자동설정이 설정되지 않았고
        // 오토스케일 적용시
        if( baseline === 0 && axisOption[index].grid.autoScaled ) {
          // // 적용
          // option.min = min > 0
          //   ? Math.ceil(min - ((max - min) * 0.05))
          //   : min;
          // option.max = max;

          delete option.min;
          delete option.max;
          option.scale = true;
        }
        else {
          delete option.scale;
        }
      }
    });

    // 반환
    return chartOption
  }

  /**
   * 축 기본설정(기본색상, padding)
   * @param chartOption
   * @param uiOption
   * @param axisType
   * @returns {BaseOption}
   */
  public static convertAxisDefault(chartOption: BaseOption, uiOption: UIOption, axisType: AxisType) : BaseOption {

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    const axis: Axis[] = chartOption[axisType];

    // 적용
    _.each(axis, (option) => {

      if (!option.axisLine.lineStyle) option.axisLine = {lineStyle : {}};

      // default 축라인색상 설정
      option.axisLine.lineStyle['color'] = AxisDefaultColor.AXIS_LINE_COLOR.toString();
      // default 축value 색상설정
      option.axisLabel.color = AxisDefaultColor.LABEL_COLOR.toString();
      // default 축라벨 색상설정
      option.nameTextStyle.color = AxisDefaultColor.LABEL_COLOR.toString();

      if (!option.nameTextStyle.padding) option.nameTextStyle.padding = [];

      // dataZoom과 axisLabel사이의 padding값, default line색상 설정
      if (AxisType.X === axisType) {
        option.nameTextStyle.padding = [10, 10, 0, 0];
        if (_.find(uiOption.chartZooms, {orient: 'VERTICAL'})) {
          if (!option.splitLine || !option.splitLine.lineStyle) option.splitLine = {lineStyle : {}};
          option.splitLine.lineStyle['color'] = AxisDefaultColor.LINE_COLOR.toString();
        }
      } else {
        option.nameTextStyle.padding = [0, 0, 10, 10];
        if (_.find(uiOption.chartZooms, {orient: 'HORIZONTAL'})) {
          if (!option.splitLine || !option.splitLine.lineStyle) option.splitLine = {lineStyle : {}};
          option.splitLine.lineStyle['color'] = AxisDefaultColor.LINE_COLOR.toString();
        }
      }
    });

    return chartOption;
  }

  /**
   * 축 레이블의 최대 길이 설정
   * @param chartOption
   * @param uiOption
   * @param axisType
   */
  public static convertAxisLabelMaxLength(chartOption: BaseOption, uiOption: UIOption, axisType: AxisType) : BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    // 축에 해당하는 Axis 옵션
    const axisOption: UIChartAxis[] = this.getAxisOption(uiOption, axisType);

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    const axis: Axis[] = chartOption[axisType];

    let maxLength: number;
    // 적용
    _.each(axis, (option, index) => {

      if (!axisOption[index].label) return;

      maxLength = axisOption[index].label['maxLength'];

      // 카테고리 타입일때만 max length 설정
      if (ChartAxisLabelType.CATEGORY === axisOption[index].label.type && !isNull(maxLength) && !isUndefined(maxLength)) {
        // 해당 maxLength까지의 길이로 데이터 설정
        option.data = option.data.map((item) => {
          if (typeof item === 'string') {

            return item.substr(0, maxLength) + (item.length > maxLength ? '...' : '');
          }
          else return item;
        });
      }
    });

    return chartOption;
  }

  /**
   * 축의 배경색상 설정
   * @param {BaseOption} chartOption
   * @param {UIOption} uiOption
   * @param {AxisType} axisType
   * @returns {BaseOption}
   */
  public static convertAxisBackground(chartOption: BaseOption, uiOption: UIOption, axisType: AxisType) : BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    // 축에 해당하는 Axis 옵션
    const axisOption: UIChartAxis[] = this.getAxisOption(uiOption, axisType);

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    const axis: Axis[] = chartOption[axisType];

    // 적용
    _.each(axis, (option, index) => {
      // 카테고리 축일때에만 설정
      if (axisOption[index].label && ChartAxisLabelType.CATEGORY === axisOption[index].label.type) {

        if (!option.splitArea) {

          option.splitArea = {};
          if (!option.splitArea.areaStyle) option.splitArea.areaStyle = {};
        }

        // background off인경우
        if (!axisOption[index].background) {
          option.splitArea.show = false;

        // background on 인경우
        } else {
          option.splitArea.show = true;

          // 색상 설정
          option.splitArea.areaStyle.color = ['#ffffff', axisOption[index].background.color];

          // 투명도 설정
          option.splitArea.areaStyle.opacity = axisOption[index].background.transparency;
        }
      }
    });

    return chartOption;
  }

  /**
   * 축에 해당하는 Axis 옵션(UI Option)을 반환
   * @param uiOption
   * @param axisType
   */
  public static getAxisOption(uiOption: UIOption, axisType: AxisType): UIChartAxis[] {

    // // 축에 해당하는 Axis 옵션
    // let axisOption: LabelMode[] = _.filter(uiOption.label.axis, (option) => {
    //   if( axisType == AxisType.X ) {
    //     return _.eq(option.mode, AxisLabelType.ROW) || _.eq(option.mode, AxisLabelType.SUBROW);
    //   }
    //   else {
    //     return _.eq(option.mode, AxisLabelType.COLUMN) || _.eq(option.mode, AxisLabelType.SUBCOLUMN);
    //   }
    // });

    // 반환
    return _.filter(_.compact(_.concat(uiOption.xAxis, uiOption.yAxis, uiOption.secondaryAxis)), (option) => {
      if (axisType === AxisType.X) {
        return _.eq(option.mode, AxisLabelType.ROW) || _.eq(option.mode, AxisLabelType.SUBROW);
      } else {
        return _.eq(option.mode, AxisLabelType.COLUMN) || _.eq(option.mode, AxisLabelType.SUBCOLUMN);
      }
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
