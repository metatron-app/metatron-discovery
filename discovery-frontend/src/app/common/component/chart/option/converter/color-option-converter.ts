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

import {
  UIChartColor,
  UIChartColorByDimension,
  UIChartColorBySeries,
  UIChartColorByValue,
  UIOption
} from '../ui-option';
import { PivotTableInfo } from '../../base-chart';
import {
  AxisLabelType,
  AxisType,
  CHART_STRING_DELIMITER,
  ChartColorList,
  ChartColorType,
  ChartPivotType,
  ChartType,
  ColorCustomMode,
  ColorRangeType,
  EventType,
  VisualMapDimension
} from '../define/common';
import { BaseOption } from '../base-option';
import * as _ from 'lodash'
import { OptionGenerator } from '../util/option-generator';
import { VisualMapType } from '../define/visualmap';
import { Series } from '../define/series';
import { UIScatterChart } from '../ui-option/ui-scatter-chart';
import { ColorRange } from '../ui-option/ui-color';
import { FormatOptionConverter } from './format-option-converter';
import UI = OptionGenerator.UI;
import {isNullOrUndefined} from "util";
import { UIMapOption } from '../ui-option/map/ui-map-chart';
import { ChartUtil } from '../util/chart-util';
import { GeoField } from '../../../../../domain/workbook/configurations/field/geo-field';
import {MapLayerType} from "../define/map/map-common";

/**
 * 색상 패널 converter
 */
export class ColorOptionConverter {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 색상 type(series, dimension,measure)에 따른 converter
   * @param {BaseOption} option
   * @param {UIOption} uiOption
   * @param {PivotTableInfo} fieldOriginInfo
   * @param {PivotTableInfo} fieldInfo
   * @param {PivotTableInfo} pivotInfo
   * @param {EventType} drawByType
   * @param {Series[]} series
   * @param data
   * @returns {BaseOption}
   */
  public static convertColor(
      option: BaseOption,
      uiOption: UIOption,
      fieldOriginInfo: PivotTableInfo,
      fieldInfo: PivotTableInfo,
      pivotInfo: PivotTableInfo,
      drawByType?: EventType,
      series?: Series[],
      data?: any): BaseOption {

    const color: UIChartColor = uiOption.color;

    if (!color) return option;

    switch (color.type) {
      case ChartColorType.DIMENSION: {

        // option = this.convertColorByDimension(option, fieldOriginInfo, pivotInfo, uiOption);
        option = this.convertColorByDimension(option, fieldOriginInfo, fieldInfo, pivotInfo, uiOption);
        break;
      }
      case ChartColorType.SERIES: {

        let schema = (<UIChartColorBySeries>color).schema;
        let colorCodes = _.cloneDeep(ChartColorList[schema]);

        // userCodes가 있는경우 codes대신 userCodes를 설정한다
        if ((<UIChartColorBySeries>color).mapping) {
          Object.keys((<UIChartColorBySeries>color).mapping).forEach((key, index) => {

            colorCodes[index] = (<UIChartColorBySeries>color).mapping[key];
          });
        }

        option = this.convertColorBySeries(option, fieldInfo, colorCodes, series);
        break;
      }
      case ChartColorType.MEASURE: {

        // gradation일때
        if (uiOption.color['customMode'] && ColorCustomMode.GRADIENT == uiOption.color['customMode']) {

          option = this.convertColorByValueGradation(option, uiOption);
        // 그이외의 경우일떄
        } else {
          option = this.convertColorByValue(option, uiOption);
        }
        break;
      }
    }

    return option;
  }

  /**
   * 타입이 series인 색상변경
   */
  public static convertColorBySeries(option: BaseOption, fieldInfo: PivotTableInfo, codes: ChartColorList | string[], series?: Series[]): BaseOption {

    if( !series ) {
      series = option.series;
    }

    // visualMap 존재한다면 삭제
    if (!_.isUndefined(option.visualMap)) delete option.visualMap;

    _.each(series, (obj) => {

      // 시리즈명을 delimiter 로 분리, 현재 시리즈의 측정값 필드명 추출
      const aggName = _.last(_.split(obj.name, CHART_STRING_DELIMITER));
      // 측정값 필드명의 인덱스
      const fieldIdx = _.indexOf(fieldInfo.aggs, aggName);
      // 측정값 필드명의 인덱스에 맵핑되는 컬러인덱스
      const colorIdx = fieldIdx >= codes['length'] ? fieldIdx % codes['length'] : fieldIdx;
      // 기존 스타일이 존재 하지 않을 경우 기본스타일 생성 후 적용
      if (_.isUndefined(obj.itemStyle)) obj.itemStyle = OptionGenerator.ItemStyle.auto();

      obj.itemStyle.normal.color = codes[colorIdx];
    });

    return option;
  }

  /**
   * 타입이 dimension인 색상변경
   */
  public static convertColorByDimension(
    option: BaseOption, fieldOriginInfo: PivotTableInfo, fieldInfo: PivotTableInfo, pivotInfo: PivotTableInfo, uiOption: UIOption): BaseOption {

    const schema = (<UIChartColorByDimension>uiOption.color).schema;
    const codes = _.cloneDeep(ChartColorList[schema]);
    const targetField = (<UIChartColorByDimension>uiOption.color).targetField;

    const series = option.series;

    // visualMap 존재한다면 삭제
    if (!_.isUndefined(option.visualMap)) delete option.visualMap;

    // 범례 항목을 구성하는 차원값 데이터
    let legendData: string[];
    // 열/행의 선반에서의 필드 인덱스
    let fieldIdx: number;
    // 열/행 여부
    let pivotType: ChartPivotType;
    // 색상지정 함수에서 참조하는 파라미터 키(pivotType 에 따라 다름)
    let paramType: string;

    // 열/행/교차 여부 및 몇번째 필드인지 확인
    _.forEach(fieldOriginInfo, (value, key) => {
      if (_.indexOf(value, targetField) > -1) {
        fieldIdx = _.indexOf(value, targetField);
        pivotType = _.eq(key, ChartPivotType.COLS) ? ChartPivotType.COLS : _.eq(key, ChartPivotType.ROWS) ? ChartPivotType.ROWS : ChartPivotType.AGGS;
        paramType = _.eq(key, ChartPivotType.COLS) || _.eq(key, ChartPivotType.AGGS) ? 'name' : 'seriesName';
      }
    });

    if( isNullOrUndefined( pivotType ) || isNullOrUndefined( paramType ) ) {
      _.forEach(fieldInfo, (value, key) => {
        if (_.indexOf(value, targetField) > -1) {
          fieldIdx = _.indexOf(value, targetField);
          pivotType = _.eq(key, ChartPivotType.COLS) ? ChartPivotType.COLS : _.eq(key, ChartPivotType.ROWS) ? ChartPivotType.ROWS : ChartPivotType.AGGS;
          paramType = _.eq(key, ChartPivotType.COLS) || _.eq(key, ChartPivotType.AGGS) ? 'name' : 'seriesName';
        }
      });
    }

    // 한 선반에 2개이상 올라 갈경우("-"으로 필드값이 이어진 경우는 필드의 인덱스에 해당하는 값만 추출)
    if (fieldOriginInfo[pivotType] && fieldOriginInfo[pivotType].length > 1) {
      legendData = pivotInfo[pivotType].map((value) => {
        return !_.split(value, CHART_STRING_DELIMITER)[fieldIdx] ? value : _.split(value, CHART_STRING_DELIMITER)[fieldIdx];
      });
      // 중복제거
      legendData = _.uniq(legendData);
    } else {
      legendData = pivotInfo[pivotType];
    }

    // 데이터별 색상 지정
    const setColor = ((params) => {
      let name = _.split(params[paramType], CHART_STRING_DELIMITER)[fieldIdx];
      if (_.isUndefined(name)) name = params[paramType];

      legendData = _.uniq(legendData);

      let colorIdx = _.indexOf(legendData, name);
      colorIdx = colorIdx >= codes['length'] ? colorIdx % codes['length'] : colorIdx;
      return codes[colorIdx];
    });

    _.each(series, (obj) => {

      // 기존 스타일이 존재 하지 않을 경우 기본스타일 생성 후 적용
      if (_.isUndefined(obj.itemStyle)) {
        obj.itemStyle = OptionGenerator.ItemStyle.auto();
      }

      // 각 데이터 이름과 맵핑되는 범례 항목명의 색상 인덱스을 추출하여 색상적용
      if (!_.isUndefined(obj.itemStyle) && !_.isUndefined(obj.itemStyle.normal)) {
        obj.itemStyle.normal.color = (params: any) => {
          return setColor(params);
        }
      }

      // border가 존재한다면 동일한 색상 적용
      // 기존 item color는 삭제
      if (!_.isUndefined(obj.itemStyle.normal.borderWidth)) {
        obj.itemStyle.normal.borderColor = (params: any) => {
          return setColor(params);
        };
        delete obj.itemStyle.normal.color;
      }

      // 텍스트로 구성된 차트일 경우
      if (!_.isUndefined(obj.textStyle)) {
        obj.textStyle.normal.color = (params: any) => {
          return setColor(params);
        };
      }
    });

    return option;
  }

  /**
   * 타입이 measure이고 customMode가 GRADIENT가 아닐때 색상변경
   */
  public static convertColorByValue(option: BaseOption, uiOption: UIOption): BaseOption {

    const ranges = (<UIChartColorByValue>uiOption.color).ranges;
    const schema = (<UIChartColorByDimension>uiOption.color).schema;
    const codes = _.cloneDeep(ChartColorList[schema]);

    // 기존 스타일이 존재 하지 않을 경우 기본스타일 생성 후 적용
    if (_.isUndefined(option.visualMap)) option.visualMap = OptionGenerator.VisualMap.continuousVisualMap();

    // get axis baseline
    const valueAxis = !uiOption.yAxis ? null : AxisLabelType.COLUMN == uiOption.yAxis.mode ? uiOption.yAxis : uiOption.xAxis;

    // the chart which doesn't have format
    if (uiOption.type === ChartType.WORDCLOUD) {
      if (!uiOption.valueFormat) uiOption.valueFormat = {};
      if (!uiOption.valueFormat.decimal) uiOption.valueFormat.decimal = 2;
      if (!uiOption.valueFormat.useThousandsSep) uiOption.valueFormat.useThousandsSep = true;
    }

    // 색상 리스트 적용
    option.visualMap.color = <any>codes;

    // ranges값이 있는경우 option.visualMap타입을 piecewise로 변경
    if (ranges && ranges.length > 0) {

      let rangeList = <any>_.cloneDeep(ranges);

      // set label for showing decimal number
      for (const item of rangeList) {

        if (null == item.lte) {
          // check decimal value is not null
          let itemGtVal = uiOption.valueFormat!=null
                              ?FormatOptionConverter.getDecimalValue(item.gt, uiOption.valueFormat.decimal, uiOption.valueFormat.useThousandsSep):item.gt;
          item.label = '> ' + itemGtVal;
        } else if (null == item.gt) {
          // check decimal value is not null
          let itemLteVal = uiOption.valueFormat!=null
                              ?FormatOptionConverter.getDecimalValue(item.lte, uiOption.valueFormat.decimal, uiOption.valueFormat.useThousandsSep):item.lte;
          item.label = '≤ ' + itemLteVal;
        } else {
          // check decimal value is not null
          let itemGtVal = uiOption.valueFormat!=null
                            ?FormatOptionConverter.getDecimalValue(item.gt, uiOption.valueFormat.decimal, uiOption.valueFormat.useThousandsSep):item.gt;
          let itemLteVal = uiOption.valueFormat!=null
                            ?FormatOptionConverter.getDecimalValue(item.lte, uiOption.valueFormat.decimal, uiOption.valueFormat.useThousandsSep):item.lte;
          item.label = itemGtVal + ' - ' + itemLteVal;
        }

        // deduct baseline value in range
        if (valueAxis && null !== valueAxis.baseline && undefined !== valueAxis.baseline) {
          item.fixMin = null == item.fixMin ? null : item.fixMin - <number>valueAxis.baseline;
          item.fixMax = null == item.fixMax ? null : item.fixMax - <number>valueAxis.baseline;
          item.gt = null == item.gt ? null : item.gt - <number>valueAxis.baseline;
          item.lte = null == item.lte ? null : item.lte - <number>valueAxis.baseline;
        }
      }

      delete option.visualMap.itemHeight;
      option.visualMap.type = VisualMapType.PIECEWISE;

      // pieces값 설정
      option.visualMap.pieces = rangeList;
    }

    // 수치를 표현하는 축의 인덱스로 대상 차원 지정
    if (!_.isUndefined(option.xAxis) && !_.isUndefined(option.yAxis)) {
      if ((_.eq(option.xAxis[0].type, AxisType.VALUE) || _.eq(option.xAxis[0].type, AxisType.LOG)) &&
        (_.eq(option.yAxis[0].type, AxisType.VALUE) || _.eq(option.yAxis[0].type, AxisType.LOG))) {
        option.visualMap.dimension = VisualMapDimension.Y;
      } else if (_.eq(option.xAxis[0].type, AxisType.CATEGORY) && _.eq(option.yAxis[0].type, AxisType.CATEGORY)) {
        delete option.visualMap.dimension;
      } else {
        option.visualMap.dimension = _.eq(option.xAxis[0].type, AxisType.VALUE) || _.eq(option.xAxis[0].type, AxisType.LOG) ? VisualMapDimension.X : VisualMapDimension.Y;
      }
    }

    return option;
  }

  /**
   * 타입이 measure, customMode가 GRADIENT일떄 색상변경
   */
  public static convertColorByValueGradation(option: BaseOption, uiOption: UIOption): BaseOption {

    let codes = uiOption.color['visualGradations'] ? _.cloneDeep(uiOption.color['visualGradations']) : _.cloneDeep(uiOption.color['ranges']);

    // color값만 뽑아내기
    codes = codes.map((item) => {return item.color}).reverse();

    // 기존 스타일이 존재 하지 않을 경우 기본스타일 생성 후 적용
    if (_.isUndefined(option.visualMap)) option.visualMap = OptionGenerator.VisualMap.continuousVisualMap();

    // 색상 리스트 적용
    option.visualMap.color = <any>codes;

    option.visualMap.itemHeight = '300%';
    // continuous visualMap으로설정
    delete option.visualMap.pieces;
    option.visualMap.type = VisualMapType.CONTINUOUS;

    // 범위지정
    option.visualMap.min = option.dataInfo.minValue >= 0 ? 0 : parseInt(option.dataInfo.minValue.toFixed(0));
    option.visualMap.max = parseInt(option.dataInfo.maxValue.toFixed(0));

    // 수치를 표현하는 축의 인덱스로 대상 차원 지정
    if (!_.isUndefined(option.xAxis) && !_.isUndefined(option.yAxis)) {
      if ((_.eq(option.xAxis[0].type, AxisType.VALUE) || _.eq(option.xAxis[0].type, AxisType.LOG)) &&
        (_.eq(option.yAxis[0].type, AxisType.VALUE) || _.eq(option.yAxis[0].type, AxisType.LOG))) {
        option.visualMap.dimension = VisualMapDimension.Y;
      } else if (_.eq(option.xAxis[0].type, AxisType.CATEGORY) && _.eq(option.yAxis[0].type, AxisType.CATEGORY)) {
        delete option.visualMap.dimension;
      } else {
        option.visualMap.dimension = _.eq(option.xAxis[0].type, AxisType.VALUE) || _.eq(option.xAxis[0].type, AxisType.LOG) ? VisualMapDimension.X : VisualMapDimension.Y;
      }
    }

    return option;
  }

  /**
   * return ranges of color by measure
   * @returns {any}
   */
  public static setMeasureColorRange(uiOption, data, colorList: any, colorAlterList = []): ColorRange[] {

    // return value
    let rangeList = [];

    let rowsListLength = data.rows.length;

    // 차트타입에 따라서 range리스트 계산하는 rows리스트의 값을 다르게 설정
    switch (uiOption.type) {

      // 그리드차트의경우 행 / 열의 length를 합하여 비교
      case ChartType.GRID:
        let gridRowsListLength = 0;
        // when rows are not empty
        if (data.rows.length > 0 && !_.isEmpty(data.rows[0])) {

          gridRowsListLength += data.rows.length;
        }

        // when columns are not empty
        if (data.columns.length > 0 && -1 !== data.columns[0].name.indexOf(CHART_STRING_DELIMITER)) {

          gridRowsListLength += data.columns.length;

        // chart_string_delimiter 데이터가 없는경우 => original일때
        } else {
          gridRowsListLength += data.columns[0].value.length;
        }

        rowsListLength = gridRowsListLength;
        break;

      // pie, wordcloud의 경우 columns의 value length로 설정
      case ChartType.PIE:
      case ChartType.WORDCLOUD:
        rowsListLength = data.columns[0].value.length;

        if (uiOption.type === ChartType.WORDCLOUD) {
          // set 2 decimal (wordcloud doesn't have format)
          if (!uiOption['valueFormat']) uiOption['valueFormat'] = {};
          uiOption['valueFormat']['decimal'] = 2;
        }
        break;
      case ChartType.HEATMAP:
        rowsListLength = data.columns.length + data.rows.length;
        break;
      // gauge차트는 dimension에 따라서 개수가 다르므로 가장 많은 데이터를 가져온다
      case ChartType.GAUGE:
        rowsListLength = (<any>_.max(data.columns)).length;
    }

    // colAlterList가 있는경우 해당 리스트로 설정, 없을시에는 colorList 설정
    let colorListLength = colorAlterList.length > 0 ? colorAlterList.length - 1 : colorList.length - 1;

    // less than 0, set minValue
    const minValue = uiOption.minValue >= 0 ? 0 : _.cloneDeep(uiOption.minValue);

    // 차이값 설정 (최대값, 최소값은 값을 그대로 표현해주므로 length보다 2개 작은값으로 빼주어야함)
    const addValue = (uiOption.maxValue - minValue) / colorListLength;

    let maxValue = _.cloneDeep(uiOption.maxValue);

    let shape;
    if ((<UIScatterChart>uiOption).pointShape) {
      shape = (<UIScatterChart>uiOption).pointShape.toString().toLowerCase();
    }

    // set decimal value
    const formatValue = ((value) => {
      // check decimal value is needed
      return uiOption.validate!=null
        ?parseFloat((Number(value) * (Math.pow(10, uiOption.valueFormat.decimal)) / Math.pow(10, uiOption.valueFormat.decimal)).toFixed(uiOption.valueFormat.decimal))
        :value;
    });

    // decimal min value
    let formatMinValue = formatValue(uiOption.minValue);
    // decimal max value
    let formatMaxValue = formatValue(uiOption.maxValue);

    // set ranges
    for (let index = colorListLength; index >= 0; index--) {

      let color = colorList[index];

      // set the biggest value in min(gt)
      if (colorListLength == index) {

        rangeList.push(UI.Range.colorRange(ColorRangeType.SECTION, color, formatMaxValue, null, formatMaxValue, null, shape));

      } else {
        // if it's the last value, set null in min(gt)
        let min = 0 == index ? null : formatValue(maxValue - addValue);

        // if value if lower than minValue, set it as minValue
        if (min < uiOption.minValue && min < 0) min = _.cloneDeep(formatMinValue);

          rangeList.push(UI.Range.colorRange(ColorRangeType.SECTION, color, min, formatValue(maxValue), min, formatValue(maxValue), shape));

        maxValue = min;
      }
    }

    return rangeList;
  }

  /**
   * return ranges of color by measure
   * @returns {any}
   */
  public static setMapMeasureColorRange(uiOption: UIMapOption, data: any, colorList: any, layerIndex: number, layers: GeoField[], colorAlterList = []): ColorRange[] {
    // return value
    let rangeList = [];

    // colAlterList가 있는경우 해당 리스트로 설정, 없을시에는 colorList 설정
    let colorListLength = colorAlterList.length > 0 ? colorAlterList.length - 1 : colorList.length - 1;

    let alias = ChartUtil.getFieldAlias(uiOption.layers[layerIndex].color.column, layers, uiOption.layers[layerIndex].color.aggregationType);

    if( !_.isUndefined(uiOption['analysis']) && !_.isUndefined(uiOption['analysis']['use']) && uiOption['analysis']['use'] ) {
      if( uiOption['analysis']['operation']['choropleth']
        && uiOption['analysis']['operation']['aggregation']['column'] == 'count') {
        alias = uiOption['analysis']['operation']['aggregation']['column'];
      }
    } else {
      // symbol 타입 , cluster 사용일 경우
      if( uiOption.layers[layerIndex].type == MapLayerType.CLUSTER && uiOption.layers[layerIndex]['clustering'] ){
        alias = 'count';
      }
    }

    let minValue = 0;
    let maxValue = 0;
    if( !_.isUndefined( data.valueRange[alias] ) ){
      // less than 0, set minValue
      minValue = _.cloneDeep(data.valueRange[alias].minValue);
      maxValue = _.cloneDeep(data.valueRange[alias].maxValue);
    }

    // map 챠트에서 aggregation 타입이 변경 될 경우 min / max 값을 변경해야함
    if(!_.isUndefined(uiOption.layers[uiOption.layerNum]['isColorOptionChanged']) && uiOption.layers[uiOption.layerNum]['isColorOptionChanged']) {
      delete uiOption.layers[uiOption.layerNum]['isColorOptionChanged'];
      uiOption.layers[layerIndex].color.minValue = minValue;
      uiOption.layers[layerIndex].color.maxValue = maxValue;
    } else {
      // uiOption.minValue = minValue;
      ( _.isUndefined(uiOption.layers[layerIndex].color.minValue) || uiOption.layers[layerIndex].color.minValue > minValue ? uiOption.layers[layerIndex].color.minValue = minValue : minValue = uiOption.layers[layerIndex].color.minValue);
      ( _.isUndefined(uiOption.layers[layerIndex].color.maxValue) || uiOption.layers[layerIndex].color.maxValue < maxValue ? uiOption.layers[layerIndex].color.maxValue = maxValue : maxValue = uiOption.layers[layerIndex].color.maxValue);
    }

    // 차이값 설정 (최대값, 최소값은 값을 그대로 표현해주므로 length보다 2개 작은값으로 빼주어야함)
    const addValue = (maxValue - minValue) / (colorListLength);

    let shape;

    // set decimal value
    const formatValue = ((value) => {
      return parseFloat((Number(value) * (Math.pow(10, uiOption.valueFormat.decimal)) / Math.pow(10, uiOption.valueFormat.decimal)).toFixed(uiOption.valueFormat.decimal));
    });

    // decimal min value
    let formatMinValue = formatValue(minValue);
    // decimal max value
    let formatMaxValue = formatValue(maxValue);

    // set ranges
    for (let index = colorListLength; index >= 0; index--) {

      let color = colorList[index];

      // set the biggest value in min(gt)
      if (colorListLength === index) {

        rangeList.push(UI.Range.colorRange(ColorRangeType.SECTION, color, formatMaxValue, null, formatMaxValue, null, shape));
      } else {

        // if it's the last value, set null in min(gt)
        let min = 0 == index ? null : formatValue(maxValue - addValue);

        // if value if lower than minValue, set it as minValue
        // if (min < data.valueRange.minValue && min < 0) min = _.cloneDeep(formatMinValue);
        if (min < minValue && min < 0) min = _.cloneDeep(formatMinValue);

        rangeList.push(UI.Range.colorRange(ColorRangeType.SECTION, color, min, formatValue(maxValue), min, formatValue(maxValue), shape));

        maxValue = min;
      }
    }

    return rangeList;
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
