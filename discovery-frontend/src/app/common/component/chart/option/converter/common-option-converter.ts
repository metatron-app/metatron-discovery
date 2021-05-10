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
  AxisLabelType,
  AxisType,
  BarMarkType,
  CHART_STRING_DELIMITER,
  FontSize,
  LineMarkType,
  Orient,
  UIOrient
} from '../define/common';
import {Axis} from '../define/axis';
import * as _ from 'lodash';
import {PivotTableInfo} from '../../base-chart';
import {OptionGenerator} from '../util/option-generator';

/**
 * 공통 설정 converter
 */
export class CommonOptionConverter {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 축 가로/세로형으로 변경
   * @param chartOption
   * @param uiOption
   * @param axisType
   * @param fieldInfo
   * @returns {BaseOption}
   */
  public static convertCommonAxis(chartOption: BaseOption, uiOption: UIOption, axisType: AxisType, fieldInfo: PivotTableInfo): BaseOption {

    // type이 없는경우 return
    if (_.isUndefined(uiOption['align'])) return chartOption;

    const type = uiOption['align'];

    const xAxis: Axis[] = chartOption.xAxis;
    const yAxis: Axis[] = chartOption.yAxis;

    // Y축 명칭 (x축쪽에서 y축 명칭을 가져오기전에 타게되므로 따로 설정해줌)
    chartOption.yAxis[0].name = uiOption.yAxis.customName ? uiOption.yAxis.customName : _.join(fieldInfo.aggs, CHART_STRING_DELIMITER);
    chartOption.yAxis[0].axisName = _.join(fieldInfo.aggs, CHART_STRING_DELIMITER);

    // 세로모드일때
    if (_.eq(type, UIOrient.VERTICAL)) {

      // 세로 모드로 축 변경 xAxis값 변경
      if (_.eq(xAxis[0].type, AxisType.VALUE) && _.eq(AxisType.X, axisType)) this.convertXAxisRotate(chartOption, type, yAxis, xAxis);
      // 세로 모드로 축 변경 yAxis값 변경
      if (_.eq(xAxis[0].type, AxisType.VALUE) && _.eq(AxisType.Y, axisType)) this.convertYAxisRotate(chartOption, type, yAxis);

      // 가로모드일때
    } else {

      // 가로모드로 축 변경 xAxis값 변경
      if (_.eq(xAxis[0].type, AxisType.CATEGORY) && _.eq(AxisType.X, axisType)) this.convertXAxisRotate(chartOption, type, xAxis, yAxis);
      // 가로모드로 축 변경 yAxis값 변경
      if (_.eq(xAxis[0].type, AxisType.CATEGORY) && _.eq(AxisType.Y, axisType)) this.convertYAxisRotate(chartOption, type, xAxis);
    }

    // 축 가로/세로형에 따라 축명 위치 변경
    if (_.eq(AxisType.X, axisType)) this.convertXAxisRotateName(chartOption, uiOption, fieldInfo);
    if (_.eq(AxisType.Y, axisType)) this.convertYAxisRotateName(chartOption, uiOption, fieldInfo);

    return chartOption;
  }

  /**
   * x축 가로/세로에 따라 축명 위치변경
   * @param chartOption
   * @param uiOption
   * @param fieldInfo
   */
  public static convertXAxisRotateName(chartOption: BaseOption, uiOption: UIOption, fieldInfo: PivotTableInfo): BaseOption {

    // type이 없는경우 return
    if (!uiOption || _.isUndefined(uiOption['align'])) return chartOption;

    const axisList = _.compact(_.concat(uiOption.xAxis, uiOption.yAxis, uiOption.secondaryAxis));
    const type = uiOption['align'];

    const yAxis = axisList.filter((item) => {
      return _.eq(item.mode, AxisLabelType.COLUMN) || _.eq(item.mode, AxisLabelType.SUBCOLUMN);
    });

    // 앞에서 category / value위치를 변경하였으므로 변경된 type에 따라서 위치변경
    const copiedOption = _.cloneDeep(chartOption);

    let yAxisType: AxisType;

    // default일때(세로모드, x축 category, y축 value)에는 변경하지않음
    if (_.eq(type, UIOrient.VERTICAL) && copiedOption.yAxis[0].type === AxisType.VALUE && copiedOption.xAxis[0].type === AxisType.CATEGORY) return chartOption;

    // 세로모드일때
    if (_.eq(type, UIOrient.VERTICAL)) {

      // y축이 value이면 => y축 값을 x축으로 넣기
      yAxisType = AxisType.VALUE;

      // 가로모드일때
    } else {
      // y축이 category이면 => y축 값을 x축으로 넣기
      yAxisType = AxisType.CATEGORY;
    }

    // Y축 명칭
    const yName = uiOption.yAxis.customName ? uiOption.yAxis.customName : _.join(fieldInfo.aggs, CHART_STRING_DELIMITER);
    const yAxisName = _.join(fieldInfo.aggs, CHART_STRING_DELIMITER);

    // y축이 yAxisType이면 => y축 값을 x축으로 넣기
    copiedOption.yAxis.forEach((axis, axisIndex) => {
      chartOption.xAxis.forEach((item, index) => {

        if (axis.type === yAxisType && copiedOption.yAxis[index].axisName) {
          item.axisName = yAxisName;

          // customName이 없을때
          if (!yAxis[axisIndex].customName && copiedOption.yAxis[index].name) {
            item.name = yName;
          }
        }
      });
    })

    return chartOption;
  }

  /**
   * y축 가로/세로에 따라 축명 위치변경
   * @param chartOption
   * @param uiOption
   * @param fieldInfo
   */
  public static convertYAxisRotateName(chartOption: BaseOption, uiOption: UIOption, fieldInfo: PivotTableInfo): BaseOption {

    const axisList = _.compact(_.concat(uiOption.xAxis, uiOption.yAxis, uiOption.secondaryAxis));
    const type = uiOption['align'];

    // type이 없는경우 return
    if (_.isUndefined(type)) return chartOption;

    const xAxis = axisList.filter((item) => {
      return _.eq(item.mode, AxisLabelType.ROW) || _.eq(item.mode, AxisLabelType.SUBROW);
    });

    // 앞에서 category / value위치를 변경하였으므로 변경된 type에 따라서 위치변경
    const copiedOption = _.cloneDeep(chartOption);

    let xAxisType: AxisType;

    // default일때(세로모드, x축 category, y축 value)에는 변경하지않음
    if (_.eq(type, UIOrient.VERTICAL) && copiedOption.yAxis[0].type === AxisType.VALUE && copiedOption.xAxis[0].type === AxisType.CATEGORY) return chartOption;

    // 세로모드일때
    if (_.eq(type, UIOrient.VERTICAL)) {

      // x축이 category이면 => x축값을 y축으로 넣기
      xAxisType = AxisType.CATEGORY;

      // 가로모드일때
    } else {
      // x축이 value이면 => x축값을 y축으로 넣기
      xAxisType = AxisType.VALUE;
    }

    // X축 명칭
    const xName = uiOption.xAxis.customName ? uiOption.xAxis.customName : _.join(fieldInfo.cols, CHART_STRING_DELIMITER);

    const xAxisName = _.join(fieldInfo.cols, CHART_STRING_DELIMITER);

    // x축이 xAxisType이면 => x축값을 y축으로 넣기
    copiedOption.xAxis.forEach((axis, axisIndex) => {
      chartOption.yAxis.forEach((item, index) => {

        if (axis.type === xAxisType && copiedOption.xAxis[index].axisName) {
          item.axisName = xAxisName;

          // customName이 없을때
          if (!xAxis[axisIndex].customName && copiedOption.xAxis[index].name) {
            item.name = xName;
          }
        }
      });
    })

    return chartOption;
  }

  /**
   * x축 rotate
   * @param chartOption
   * @param orient
   * @param categoryAxis
   * @param valueAxis
   * @returns {BaseOption}
   */
  public static convertXAxisRotate(chartOption: BaseOption, orient: UIOrient, categoryAxis, valueAxis): BaseOption {

    // orient 값이 없는경우 return
    if (_.isUndefined(orient)) return chartOption;

    // 수치를 표현하던 축은 카테고리를 표현하는 축으로 변경
    valueAxis.map((axis, idx) => {
      if (_.eq(idx, 0)) {
        axis.type = AxisType.CATEGORY;
        axis.data = _.cloneDeep(categoryAxis[0].data);
      }
    });

    if (_.eq(orient, Orient.VERTICAL)) chartOption.xAxis = [valueAxis[0]];
    if (!_.eq(orient, Orient.VERTICAL)) chartOption.yAxis = [valueAxis[0]];

    // 가로 모드일 경우에는 단위라벨 순서를 역으로 정렬
    if (_.eq(orient, Orient.VERTICAL)) delete chartOption.yAxis[0].inverse;
    else chartOption.yAxis[0].inverse = true;

    return chartOption;
  }

  /**
   * y축 rotate
   * @param chartOption
   * @param orient
   * @param categoryAxis
   * @returns {BaseOption}
   */
  public static convertYAxisRotate(chartOption: BaseOption, orient: UIOrient, categoryAxis): BaseOption {

    // orient 값이 없는경우 return
    if (_.isUndefined(orient)) return chartOption;

    const valueAxisType = AxisType.VALUE;
    const subAxis: Axis[] = [];

    // 카테로리를 표현하던 축은 수치를 표현하는 축으로 변경
    categoryAxis.map((axis) => {
      axis.type = valueAxisType;
      delete axis.data;
    });

    if (!_.eq(orient, Orient.VERTICAL)) chartOption.xAxis = _.concat(categoryAxis, subAxis);
    if (_.eq(orient, Orient.VERTICAL)) chartOption.yAxis = _.concat(categoryAxis, subAxis);

    // 가로 모드일 경우에는 단위라벨 순서를 역으로 정렬
    if (_.eq(orient, Orient.VERTICAL)) delete chartOption.yAxis[0].inverse;
    else chartOption.yAxis[0].inverse = true;

    return chartOption;
  }

  /**
   * 공통옵션의 시리즈 데이터 설정
   * @param chartOption
   * @param uiOption
   * @param fieldInfo
   */
  public static convertCommonSeries(chartOption: BaseOption, uiOption: UIOption, fieldInfo: PivotTableInfo): BaseOption {

    if (!uiOption || !uiOption['mark']) return chartOption;

    const type = uiOption['mark'];

    // TODO 고급분석은 나중에
    // if (this.isAnalysisPredictionLineEmpty()) {

    const series = chartOption.series;
    series.map((obj) => {

      // area 타입 설정
      obj.areaStyle = _.eq(type, LineMarkType.AREA) ? OptionGenerator.AreaStyle.customAreaStyle(0.5) : undefined;

      // stack 설정
      let stackName: string = '';
      // 모드에 따라 스택명, 수치값 라벨 위치 변경
      if (_.eq(uiOption['mark'], BarMarkType.STACKED)) {
        // 시리즈명을 delimiter로 분리, 현재 시리즈의 측정값 필드명 추출
        stackName = _.last(_.split(obj.name, CHART_STRING_DELIMITER));
        obj.stack = _.isEmpty(fieldInfo.rows) ? 'measureStack' : stackName;
      } else {
        delete obj.stack;
      }

    });
    // } else {
    //   this.chartOption = optCon.LineSeries.exceptPredictionLineViewType(this.analysis, this.chartOption, type);
    // }

    return chartOption;
  }

  /**
   * 공통옵션의 폰트사이즈 설정
   * @param chartOption
   * @param uiOption
   */
  public static convertCommonFont(chartOption: BaseOption, uiOption: UIOption): BaseOption {

    if (!uiOption.fontSize) return chartOption;

    const uiFontSize = uiOption.fontSize;
    let fontSize: number;

    switch (uiFontSize) {

      case FontSize.NORMAL:
        fontSize = 13;
        break;
      case FontSize.SMALL:
        fontSize = 11;
        break;
      case FontSize.LARGE:
        fontSize = 15;
        break;
    }

    // x축 폰트 사이즈 설정
    _.each(chartOption.xAxis, (item) => {
      item.axisLabel.fontSize = fontSize;
      item.nameTextStyle.fontSize = fontSize;
    });

    // y축 폰트 사이즈 설정
    _.each(chartOption.yAxis, (item) => {
      item.axisLabel.fontSize = fontSize;
      item.nameTextStyle.fontSize = fontSize;
    });

    // 범례 폰트 사이즈 설정
    if (chartOption.legend) chartOption.legend.textStyle.fontSize = fontSize;

    // 데이터 라벨의 폰트 사이즈 설정
    _.each(chartOption.series, (item) => {
      if (item.label) {

        // rich가 있는경우
        if (item.label.normal.rich && item.label.normal.rich['align']) {
          item.label.normal.rich['align']['fontSize'] = fontSize;

          // rich가 없는경우
        } else {
          item.label.normal.fontSize = fontSize;
        }
      }
    });

    // visualMap 폰트 사이즈 설정
    if (chartOption.visualMap) {
      if (!chartOption.visualMap.textStyle) chartOption.visualMap.textStyle = {};

      chartOption.visualMap.textStyle.fontSize = fontSize;
    }

    // large인 경우 dataZoom을 하위로 이동시킨다
    if (_.eq(FontSize.LARGE, uiFontSize) && (!uiOption['align'] || (uiOption['align'] && _.eq(UIOrient.VERTICAL, uiOption['align'])))) {
      if (chartOption.dataZoom && chartOption.dataZoom.length > 0) chartOption.dataZoom[0].bottom = chartOption.dataZoom[0].bottom - 5;
    }

    return chartOption;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
