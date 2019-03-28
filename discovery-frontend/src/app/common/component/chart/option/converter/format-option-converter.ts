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

import {BaseOption} from "../base-option";
import {UIOption, UIChartColorByDimension} from "../ui-option";
import * as _ from 'lodash';
import {Series} from "../define/series";
import {
  UIFormatType, UIFormatCurrencyType, CHART_STRING_DELIMITER, ChartColorType, UIFormatSymbolPosition,
  UIFormatNumericAliasType, UIChartDataLabelDisplayType, ChartAxisLabelType, AxisType, ChartType, ShelveType
} from '../define/common';
import {PivotTableInfo} from "../../base-chart";
import {UIChartFormat, UIChartFormatItem} from "../ui-option/ui-format";
import { UIChartDataLabel } from '../ui-option/ui-datalabel';
import { UIChartAxis, UIChartAxisLabelValue } from '../ui-option/ui-axis';
import { Pivot } from '../../../../../domain/workbook/configurations/pivot';
import { Field } from '../../../../../domain/workbook/configurations/field/field';

/**
 * 수자 포맷 옵션 컨버터
 */
export class FormatOptionConverter {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Series: 포맷에 해당하는 옵션을 모두 적용한다.
   * @param chartOption
   * @param uiOption
   * @returns {BaseOption}
   */
  public static convertFormatSeries(chartOption: BaseOption, uiOption: UIOption, pivot: Pivot): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    let format: UIChartFormat = uiOption.valueFormat;
    if (_.isUndefined(format)){ return chartOption };

    // 축의 포멧이 있는경우 축의 포멧으로 설정
    const axisFormat = this.getlabelAxisScaleFormat(uiOption);
    if (axisFormat) format = axisFormat;

    ///////////////////////////
    // 차트 옵션에 적용
    // - 시리즈
    ///////////////////////////

    // 시리즈
    let series: Series[] = chartOption.series;

    // 적용
    _.each(series, (option, index) => {

      if( _.isUndefined(option.label) ) { option.label = { normal: {} }; }
      if( _.isUndefined(option.label.normal) ) { option.label.normal = {} }

      // 적용
      option.label.normal.formatter = ((params): any => {

        let uiData = _.cloneDeep(option.uiData);
        // uiData값이 array인 경우 해당 dataIndex에 해당하는 uiData로 설정해준다
        if (uiData && uiData instanceof Array) uiData = option.uiData[params.dataIndex];

        return this.getFormatValueSeries(params, format, pivot, uiOption, option, uiData);
      });
    });

    // 반환
    return chartOption;
  }

  /**
   * Tooltip: 포맷에 해당하는 옵션을 모두 적용한다.
   * @param chartOption
   * @param uiOption
   * @returns {BaseOption}
   */
  public static convertFormatTooltip(chartOption: BaseOption, uiOption: UIOption, fieldInfo: PivotTableInfo, pivot: Pivot): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    let format: UIChartFormat = uiOption.valueFormat;
    if (_.isUndefined(format)){ return chartOption };

    // 축의 포멧이 있는경우 축의 포멧으로 설정
    const axisFormat = this.getlabelAxisScaleFormatTooltip(uiOption);
    if (axisFormat) format = axisFormat;

    ///////////////////////////
    // 차트 옵션에 적용
    // - tooltip
    ///////////////////////////

    // 적용
    if( _.isUndefined(chartOption.tooltip) ) { chartOption.tooltip = {}; }
    chartOption.tooltip.formatter = ((params): any => {

      let option = chartOption.series[params.seriesIndex];

      let uiData = _.cloneDeep(option.uiData);
      // uiData값이 array인 경우 해당 dataIndex에 해당하는 uiData로 설정해준다
      if (uiData && uiData instanceof Array) uiData = option.uiData[params.dataIndex];

      return this.getFormatValueTooltip(params, uiOption, fieldInfo, format, pivot, option, uiData);
    });

    // 반환
    return chartOption;
  }

  /**
   * 포맷 옵션에 해당하는 값으로 변환한다.
   * @param value
   * @param format
   * @returns {any}
   */
  public static getFormatValue(value: any, format: UIChartFormatItem, baseline?: number): string {

    if (!format) return;

    // 기준선값이 존재할경우
    if( !_.isUndefined(baseline) && !isNaN(baseline) && baseline != 0 ) {

      // 원래 Value에서 기준선값만큼 더해준다
      //value += value >= 0 ? baseline : baseline * -1;
      value += baseline;
    }

    const customSymbol = format.customSymbol;
    const originalValue = _.cloneDeep(value);

    // 수치표기 약어설정
    if(format.abbr && format.type != String(UIFormatType.EXPONENT10)) {
      switch (format.abbr) {
        case String(UIFormatNumericAliasType.AUTO) :
          value = Math.abs(value) > 1000000000
            ? Number(value) / 1000000000
            : Math.abs(value) > 1000000
              ? Number(value) / 1000000
              : Math.abs(value) > 1000
                ? Number(value) / 1000
                : value;
          break;
        case String(UIFormatNumericAliasType.KILO) :
          value = Number(value) / 1000;
          break;
        case String(UIFormatNumericAliasType.MEGA) :
          value = Number(value) / 1000000;
          break;
        case String(UIFormatNumericAliasType.GIGA) :
          value = Number(value) / 1000000000;
          break;
      }
    }

    // 퍼센트
    else if (!customSymbol && format.type == String(UIFormatType.PERCENT)) {
      value = value * 100;
    }

    // 소수점 자리수
    if (format.type != String(UIFormatType.EXPONENT10)) {
      //value = Number(value).toFixed(format.decimal);
      value = Math.round(Number(value) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal);
    }

    // 천단위 표시여부
    if (format.type !== 'exponent10' && format.useThousandsSep) {

      let arrSplitFloatPoint = String( value ).split( '.' );

      // Decimal Separation
      let floatValue = '';
      if( 1 < arrSplitFloatPoint.length ) {
        floatValue = arrSplitFloatPoint[1];
      }

      // Thousand units
      value = arrSplitFloatPoint[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      // Append Decimal
      if( '' !== floatValue ) {
        value += '.' + floatValue;
      }
    }

    // Add decimal zero
    if (value && format.type != String(UIFormatType.EXPONENT10) && format.decimal > 0) {
      let stringValue: string = String(value);
      if( stringValue.indexOf(".") == -1 ) {
        value += ".";
        for( let num: number = 0 ; num < format.decimal ; num++ ) {
          value += "0";
        }
      }
      else {
        for( let num: number = stringValue.split(".")[1].length ; num < format.decimal ; num++ ) {
          value += "0";
        }
      }
    }

    // 수치표기 약어설정
    if(format.abbr && format.type != String(UIFormatType.EXPONENT10)) {
      switch (format.abbr) {
        case String(UIFormatNumericAliasType.AUTO) :
          value += Math.abs(originalValue) > 1000000000
            ? "B"
            : Math.abs(originalValue) > 1000000
              ? "M"
              : Math.abs(originalValue) > 1000
                ? "K"
                : "";
          break;
        case String(UIFormatNumericAliasType.KILO) :
          value += 'K';
          break;
        case String(UIFormatNumericAliasType.MEGA) :
          value += 'M';
          break;
        case String(UIFormatNumericAliasType.GIGA) :
          value += 'B';
          break;
      }
    }

    const customSymbolVal = customSymbol ? customSymbol.value : '';
    // const customSymbolVal = customSymbol ? _.trim(customSymbol.value) : '';

    // 통화
    if (0 === customSymbolVal.length && format.type == String(UIFormatType.CURRENCY)) {
      switch (format.sign) {
        case String(UIFormatCurrencyType.KRW) :
          value = '₩ ' + value;
          break;
        case String(UIFormatCurrencyType.USD) :
          value = '$ ' + value;
          break;
        case String(UIFormatCurrencyType.USCENT) :
          value = '￠ ' + value;
          break;
        case String(UIFormatCurrencyType.GBP) :
          value = '£ ' + value;
          break;
        case String(UIFormatCurrencyType.JPY) :
        case String(UIFormatCurrencyType.CNY) :
          value = '¥ ' + value;
          break;
        case String(UIFormatCurrencyType.EUR) :
          value = '€ ' + value;
          break;
      }
    }

    // 퍼센트
    else if (0 === customSymbolVal.length && format.type == String(UIFormatType.PERCENT)) {
      value = value + '%';
    }

    // 지수
    else if (format.type == String(UIFormatType.EXPONENT10)) {
      value = Number(value).toExponential(format.decimal);
    }

    // 사용자 기호 , value값이 빈값이 아닐때
    if( customSymbolVal.length > 0) {
      // front / back에 따라서 customsymbol 설정
      value = UIFormatSymbolPosition.BEFORE == customSymbol.pos ? customSymbolVal + value : value + customSymbolVal;
    }

    return value;
  }

  /**
   * Series: 포맷을 변경한다.
   * @param params
   * @param format
   * @returns {any}
   */
  public static getFormatValueSeries(params: any, format: UIChartFormat, pivot: Pivot, uiOption?: UIOption, series?: any, uiData?: any): string {

    // UI 데이터 정보가 있을경우
    if( uiData ) {

      if (!uiOption.dataLabel || !uiOption.dataLabel.displayTypes) return '';

      // UI 데이터 가공
      let isUiData: boolean = false;
      let result: string[] = [];
      if( uiData['categoryName'] && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_NAME) ){

        // string인 경우
        if (typeof uiData['categoryName'] === 'string') {

          let categoryList = _.split(uiData['categoryName'], CHART_STRING_DELIMITER);
          result = this.getTooltipName(categoryList, pivot.columns, result);
        // 리스트인경우
        } else {
          let categoryList = _.split(uiData['categoryName'][params.dataIndex], CHART_STRING_DELIMITER);

          // category Name List 설정
          result = this.getTooltipName(categoryList, pivot.columns, result);
        }
        isUiData = true;
      }
      if( uiData['categoryValue'] && uiData['categoryValue'].length > 0 && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_VALUE) ){
        result.push(this.getFormatValue(uiData['categoryValue'][params.dataIndex], format));
        isUiData = true;
      }
      if( uiData['categoryPercent'] && uiData['categoryPercent'].length > 0 && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_PERCENT) ){
        let value = uiData['categoryPercent'][params.dataIndex];
        value = (Math.floor(Number(value) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal)).toFixed(format.decimal);
        result.push(value +'%');
        isUiData = true;
      }
      // 해당 dataIndex 데이터애로 뿌려줌
      if( uiData['seriesName'] && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_NAME) ){

        let seriesName = '';
        let seriesNameList = _.split(params.seriesName, CHART_STRING_DELIMITER);

        // multi series일때
        if (seriesNameList.length > 1) {

          let pivotList = _.cloneDeep(pivot.rows);
          // category Name List 설정
          result = this.getTooltipName(seriesNameList, pivotList, result, false, pivot, ShelveType.ROWS);

          // aggregations의 measure가 2개이상인경우
        } else if (pivot.aggregations.length > 1) {

          let pivotList = _.cloneDeep(pivot.aggregations);
          // category Name List 설정
          result = this.getTooltipName(seriesNameList, pivotList, result, false, pivot, ShelveType.AGGREGATIONS);

          // 단일시리즈인 경우 category Name으로 설정
        } else {
          // string인 경우
          if (typeof uiData['categoryName'] === 'string') {

            // category Name List 설정
            result = this.getTooltipName(_.split(uiData['categoryName'], CHART_STRING_DELIMITER), pivot.columns, result);
            // 리스트인경우
          } else {
            let categoryList = _.split(uiData['categoryName'][params.dataIndex], CHART_STRING_DELIMITER);

            // category Name List 설정
            result = this.getTooltipName(categoryList, pivot.columns, result);
          }
        }
        isUiData = true;
      }
      if( uiData['seriesValue'] && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE) ){

        const seriesValue = typeof uiData['seriesValue'][params.dataIndex] === 'undefined' ? uiData['seriesValue'] : uiData['seriesValue'][params.dataIndex];
        result.push(this.getFormatValue(seriesValue, format));
        isUiData = true;
      }
      if( uiData['seriesPercent'] && uiData['seriesPercent'].length > 0 && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT) ){
        let value = uiData['seriesPercent'][params.dataIndex];
        value = (Math.floor(Number(value) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal)).toFixed(format.decimal);
        result.push(value +'%');
        isUiData = true;
      }
      if ( uiData['xAxisValue'] && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.XAXIS_VALUE) ) {
        const axisFormat = this.getlabelAxisScaleFormat(uiOption, AxisType.X);
        result.push(this.getFormatValue(uiData['xAxisValue'], axisFormat ? axisFormat : uiOption.valueFormat));
        isUiData = true;
      }
      if ( uiData['yAxisValue'] && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.YAXIS_VALUE) ) {
        const axisFormat = this.getlabelAxisScaleFormat(uiOption, AxisType.Y);
        result.push(this.getFormatValue(uiData['yAxisValue'], axisFormat ? axisFormat : uiOption.valueFormat));
        isUiData = true;
      }
      if ( uiData['value'] && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.VALUE) ) {
        result.push(this.getFormatValue(params.value, format));
        isUiData = true;
      }
      if ( uiData['nodeName'] && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.NODE_NAME) ) {
        result.push(uiData['nodeName'][params.dataIndex]);
        isUiData = true;
      }

      let label: string = "";

      // UI 데이터기반 레이블 반환
      if( isUiData ) {
        for( let num: number = 0 ; num < result.length ; num++ ) {
          if( num > 0 ) {
            label += "\n";
          }
          if(series.label && series.label.normal && series.label.normal.rich) {
            label += '{align|'+ result[num] +'}';
          }
          else {
            label += result[num];
          }
        }
        return label;

      // 선택된 display label이 없는경우 빈값 리턴
      } else {
        return label;
      }
    }

    // 기준선 일때
    return this.noUIDataFormat(params, format);
  }

  /**
   * uiData가 없는경우 리턴되는 포멧
   * @param params
   * @param format
   * @returns {any}
   */
  public static noUIDataFormat(params: any, format: UIChartFormat): string {

    // 기준선 일때
    if (params.componentType === 'markLine') {
      return params.data.value;
    } else if (params.componentType === 'series') {

      // 데이터 천단위마다 콤마 표시
      // 데이터가 배열 형식이라면 가장 마지막 요소의 값을 변환
      if (_.isUndefined(params.value)) return '';
      let value = _.isArray(params.value) ? _.last(params.value) : params.value;
      if (_.isNull(value)) return;


      //////////////////////////////////////////////////
      // 공통포멧
      //////////////////////////////////////////////////
      if( format && format.isAll ) {

        // 포맷 적용
        value = this.getFormatValue(value, format);
      }
      //////////////////////////////////////////////////
      // 개별포멧
      //////////////////////////////////////////////////
      else if( format && !format.isAll ) {

        // 포멧에 해당하는지 여부
        for( let eachFormat of format.each ) {
          if( params.seriesName == eachFormat.name
            || params.seriesName == (eachFormat.aggregationType +'('+ eachFormat.name +')')
            || params.name == eachFormat.name
            || params.name == (eachFormat.aggregationType +'('+ eachFormat.name +')') ){

            // 포맷 적용
            value = this.getFormatValue(value, eachFormat);
          }
        }
      }
      //////////////////////////////////////////////////
      // 포멧 정보가 없을경우
      //////////////////////////////////////////////////
      else {
        value = value.toLocaleString();
      }

      return value;
    }
  }

  /**
   * 데이터라벨의 축포멧 설정값을 가져온다
   * @param chartOption
   * @param uiOption
   */
  public static getlabelAxisScaleFormat(uiOption: UIOption, axisType?: AxisType): UIChartFormat {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    let label: UIChartDataLabel = uiOption.dataLabel;

    // label값이 없거나 useDefaultFormat가 true인 경우
    if (!label || typeof label.useDefaultFormat === 'undefined' || true === label.useDefaultFormat) return null;

    let valueAxis: UIChartAxis;

    // value값인 축값을 가져온다
    if ((uiOption.xAxis && ChartAxisLabelType.VALUE == uiOption.xAxis.label.type && !axisType) ||
        (axisType && axisType == AxisType.X)) {

      valueAxis = uiOption.xAxis;
    }

    if (uiOption.yAxis && ChartAxisLabelType.VALUE == uiOption.yAxis.label.type && !axisType ||
        (axisType && axisType == AxisType.Y)) {

      valueAxis = uiOption.yAxis;
    }

    // 축의 format, 축의 format이 없는경우 기존 format으로 설정
    const axisFormat = (<UIChartAxisLabelValue>valueAxis.label) ? (<UIChartAxisLabelValue>valueAxis.label).format : null;

    if (!valueAxis || !axisFormat) return null;

    // 축의 포맷값 리턴
    return axisFormat;
  }

  /**
   * 툴팁의 축포멧 설정값을 가져온다
   * @param chartOption
   * @param uiOption
   */
  public static getlabelAxisScaleFormatTooltip(uiOption: UIOption, axisType?: AxisType): UIChartFormat {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    let toolTip: UIChartDataLabel = uiOption.toolTip;

    // label값이 없거나 useDefaultFormat가 true인 경우
    if (!toolTip || typeof toolTip.useDefaultFormat === 'undefined' || true === toolTip.useDefaultFormat) return null;

    let valueAxis: UIChartAxis;

    // value값인 축값을 가져온다
    if ((uiOption.xAxis && ChartAxisLabelType.VALUE == uiOption.xAxis.label.type && !axisType) ||
      (axisType && axisType == AxisType.X)) {

      valueAxis = uiOption.xAxis;
    }

    if (uiOption.yAxis && ChartAxisLabelType.VALUE == uiOption.yAxis.label.type && !axisType ||
      (axisType && axisType == AxisType.Y)) {

      valueAxis = uiOption.yAxis;
    }

    // 축의 format, 축의 format이 없는경우 기존 format으로 설정
    const axisFormat = (<UIChartAxisLabelValue>valueAxis.label) ? (<UIChartAxisLabelValue>valueAxis.label).format : null;

    if (!valueAxis || !axisFormat) return null;

    // 축의 포맷값 리턴
    return axisFormat;
  }

  /**
   * dataLabel / tooltip name 설정
   * @param categoryList
   * @param targetPivotList
   * @param result
   * @param pivot
   * @param titleUseFl ex) 타이틀명 : 데이터명 => 타이틀명 사용여부
   * @param pivotType 선반타입
   * @returns {any}
   */
  public static getTooltipName(categoryList: any, targetPivotList: Field[], result: any, titleUseFl?: boolean, pivot?: Pivot, pivotType?: ShelveType): any {

    categoryList.forEach((item, index) => {

      // 열 / 행 / 교차 타겟
      let targetPivot = pivotType && ShelveType.AGGREGATIONS == pivotType ? _.find(targetPivotList, {alias: item}) : targetPivotList[index];

      if (!targetPivot) return result;

      if ('timestamp' == targetPivot.type) {

        let resultData: string = '';

        if (titleUseFl) {
          let granularity = targetPivot.format.unit.toString().slice(0, 1).toUpperCase();
          granularity += targetPivot.format.unit.toString().slice(1, targetPivot.format.unit.toString().length).toLowerCase();

          const name = targetPivot['fieldAlias'] ? targetPivot['fieldAlias'] : targetPivot.name;

          let defaultAlias = targetPivot.granularity + '(' + name + ')';

          if (defaultAlias === targetPivot.alias) {
            resultData = granularity + ' of ' + name + ' : ';
          } else {
            resultData = targetPivot['alias'] + ' : ';
          }
        }

        resultData += item;
        result.push(resultData);
      }
      else if ('measure' == targetPivot.type) {

        // measure인 경우 aggregation length가 2개이상인경우
        if (pivot && pivot.aggregations.length > 1) {

          let aggregationType: string;
          if (targetPivot.aggregationType) {
            aggregationType = targetPivot.aggregationType.toString().slice(0, 1).toUpperCase();
            aggregationType += targetPivot.aggregationType.toString().slice(1, targetPivot.aggregationType.toString().length).toLowerCase();

            // Avg인 경우 Average로 치환
            if ('Avg' == aggregationType) aggregationType = 'Average';
          }

          const name = targetPivot['fieldAlias'] ? targetPivot['fieldAlias'] : targetPivot.name;

          let defaultAlias = targetPivot.aggregationType + '(' + name + ')';

          if (defaultAlias === targetPivot.alias) {
            result.push((aggregationType ? aggregationType+ ' of ' : '') + name);
          } else {
            result.push(targetPivot['alias']);
          }
        }
      } else {

        let resultData: string = '';
        if (titleUseFl) {
          resultData = targetPivot.alias + ' : ';
        }
        resultData += item;
        result.push(resultData);
      }
    });

    return result;
  }

  /**
   * 툴팁에서 value값을 설정
   * @param aliasValue
   * @param aggregations
   * @param format
   * @param value
   * @param seriesName
   * @returns {string}
   */
  public static getTooltipValue(aliasValue: string, aggregations: Field[], format: UIChartFormat, value: number, seriesName?: string): string {

    let seriesValue = '';

    let aggValue = _.find(aggregations, {alias : aliasValue});
    // 해당 value값으로 찾을 수 없는경우 seriesName으로 찾기
    if (!aggValue && seriesName) aggValue = _.find(aggregations, {alias : seriesName});

    // priority of fiedAlias is higher, set fieldAlias
    let aggValueName = aggValue.fieldAlias ? aggValue.fieldAlias : aggValue.name;

    let defaultAlias = aggValue.aggregationType + '(' + aggValueName + ')';
    // when alias is not changed
    if (defaultAlias === aggValue.alias) {
      let aggregationType = "";
      if( aggValue.aggregationType ) {
        aggregationType = aggValue.aggregationType.toString().slice(0, 1).toUpperCase();
        aggregationType += aggValue.aggregationType.toString().slice(1, aggValue.aggregationType.toString().length).toLowerCase();
        // Avg인 경우 Average로 치환
        if ('Avg' == aggregationType) aggregationType = 'Average';
        aggregationType += ' of ';
      }

      seriesValue = aggregationType + aggValueName + ' : ' + this.getFormatValue(value, format);

      // when alias is changed, set tooltip name as alias
    } else {

      seriesValue = aggValue.alias + ' : ' + this.getFormatValue(value, format);
    }

    return seriesValue;
  }
  /**
   * Tooltip: 포맷을 변경한다.
   * @param params
   * @param format
   * @returns {any}
   */
  public static getFormatValueTooltip(params: any, uiOption: UIOption, fieldInfo: PivotTableInfo, format: UIChartFormat, pivot: Pivot, series?: any, uiData?: any): string {

    // UI 데이터 정보가 있을경우
    if( uiData ) {

      if (!uiOption.toolTip) uiOption.toolTip = {};
      if (!uiOption.toolTip.displayTypes) uiOption.toolTip.displayTypes = this.setDisplayTypes(uiOption.type, pivot);

      // UI 데이터 가공
      let result: string[] = [];
      if( uiData['categoryName'] && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_NAME) ){

        // string인 경우
        if (typeof uiData['categoryName'] === 'string') {

          // category Name List 설정
          result = this.getTooltipName([uiData['categoryName']], pivot.columns, result, true);
        // 리스트인경우
        } else {
          let categoryList = _.split(uiData['categoryName'][params.dataIndex], CHART_STRING_DELIMITER);

          // category Name List 설정
          result = this.getTooltipName(categoryList, pivot.columns, result, true);
        }
      }
      if( uiData['categoryValue'] && uiData['categoryValue'].length > 0 && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_VALUE) ){

        let splitValue = _.split(uiData.name, CHART_STRING_DELIMITER);
        let name = splitValue[splitValue.length - 1];
        let seriesName = -1 !== uiData.name.indexOf(CHART_STRING_DELIMITER) ? splitValue[splitValue.length - 1] : uiData.name;

        let categoryValue = FormatOptionConverter.getTooltipValue(name, pivot.aggregations, format, uiData['categoryValue'][params.dataIndex], seriesName);

        // category percent가 있는경우
        if (-1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_PERCENT)) {
          let value = uiData['categoryPercent'][params.dataIndex];

          value = (Math.floor(Number(value) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal)).toFixed(format.decimal);

          categoryValue += ' (' + value + '%)';
        }

        result.push(categoryValue);

      }
      if( uiData['categoryPercent'] && uiData['categoryPercent'].length > 0 && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_PERCENT) ){

        // category value가 선택된지 않은경우
        if (-1 == uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_VALUE)) {

          let value = uiData['categoryPercent'][params.dataIndex];
          value = Math.floor(Number(value) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal);

          let splitData = _.split(uiData.name, CHART_STRING_DELIMITER);
          let name = -1 !== uiData.name.indexOf(CHART_STRING_DELIMITER) ? splitData[splitData.length - 1] : uiData.name;
          let categoryValue = FormatOptionConverter.getTooltipValue(name, pivot.aggregations, format, value);
          categoryValue += '%';

          result.push(categoryValue);
        }
      }
      // 해당 dataIndex 데이터애로 뿌려줌
      if( uiData['seriesName'] && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_NAME) ){

        let seriesName = '';

        let seriesNameList = _.split(params.seriesName, CHART_STRING_DELIMITER);

        // multi series일때
        if (seriesNameList.length > 1) {

          let pivotList = _.cloneDeep(pivot.rows);
          // category Name List 설정
          result = this.getTooltipName(seriesNameList, pivotList, result, true, pivot, ShelveType.ROWS);

        // aggregations의 measure가 2개이상인경우
        } else if (pivot.aggregations.length > 1) {

          let pivotList = _.cloneDeep(pivot.aggregations);
          // category Name List 설정
          result = this.getTooltipName(seriesNameList, pivotList, result, true, pivot, ShelveType.AGGREGATIONS);

        // 단일시리즈인 경우 category Name으로 설정
        } else {

          // string인 경우
          if (typeof uiData['categoryName'] === 'string') {

            // category Name List 설정
            result = this.getTooltipName([uiData['categoryName']], pivot.columns, result, true);
            // 리스트인경우
          } else {
            let categoryList = _.split(uiData['categoryName'][params.dataIndex], CHART_STRING_DELIMITER);

            // category Name List 설정
            result = this.getTooltipName(categoryList, pivot.columns, result, true);
          }
        }
      }
      if( uiData['seriesValue'] && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE) ){

        let splitData = _.split(uiData.name, CHART_STRING_DELIMITER);
        let name = -1 !== uiData.name.indexOf(CHART_STRING_DELIMITER) ? splitData[splitData.length - 1] : uiData.name;

        const value = typeof uiData['seriesValue'][params.dataIndex] === 'undefined' ? uiData['seriesValue'] : uiData['seriesValue'][params.dataIndex];

        let seriesValue = FormatOptionConverter.getTooltipValue(name, pivot.aggregations, format, value);

        // series percent가 있는경우
        if (-1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT)) {
          let value = uiData['seriesPercent'][params.dataIndex];
          value = (Math.floor(Number(value) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal)).toFixed(format.decimal);

          seriesValue += ' (' + value + '%)';
        }

        result.push(seriesValue);
      }
      if( uiData['seriesPercent'] && uiData['seriesPercent'].length > 0 && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT) ){

        // series value가 선택된지 않은경우
        if (-1 == uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE)) {

          let value = uiData['seriesPercent'][params.dataIndex];
          value = Math.floor(Number(value) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal);

          let splitData = _.split(uiData.name, CHART_STRING_DELIMITER);
          let name = -1 !== uiData.name.indexOf(CHART_STRING_DELIMITER) ? splitData[splitData.length - 1] : uiData.name;

          let seriesPercent = FormatOptionConverter.getTooltipValue(name, pivot.aggregations, format, value);

          seriesPercent += '%';
          result.push(seriesPercent);
        }
      }

      return result.join('<br/>');
    }

    // 기준선 일때
    return this.noUIDataFormatTooltip(uiOption, params, format, fieldInfo);
  }

  /**
   * 차트별 displayTypes 기본값 설정
   */
  public static setDisplayTypes(chartType: ChartType, pivot?: Pivot): UIChartDataLabelDisplayType[] {

    let displayTypes = [];

    switch (chartType) {

      case ChartType.BAR:
      case ChartType.LINE:
      case ChartType.COMBINE:
        // when bar, line chart has single series
        if (((chartType === ChartType.BAR || chartType === ChartType.LINE) && pivot.aggregations.length <= 1 && pivot.rows.length < 1) ||
          (chartType === ChartType.COMBINE && pivot.aggregations.length <= 1)) {
          displayTypes[0] = UIChartDataLabelDisplayType.CATEGORY_NAME;
          displayTypes[1] = UIChartDataLabelDisplayType.CATEGORY_VALUE;
          // when bar, line chart has multi series
        } else {
          displayTypes[3] = UIChartDataLabelDisplayType.SERIES_NAME;
          displayTypes[4] = UIChartDataLabelDisplayType.SERIES_VALUE;
        }
        break;

      case ChartType.CONTROL:
      case ChartType.WATERFALL:
        displayTypes[0] = UIChartDataLabelDisplayType.CATEGORY_NAME;
        displayTypes[1] = UIChartDataLabelDisplayType.CATEGORY_VALUE;
        break;
      case ChartType.HEATMAP:
      case ChartType.GAUGE:
        displayTypes[0] = UIChartDataLabelDisplayType.CATEGORY_NAME;
      case ChartType.TREEMAP:
      case ChartType.PIE:
        displayTypes[3] = UIChartDataLabelDisplayType.SERIES_NAME;
        displayTypes[4] = UIChartDataLabelDisplayType.SERIES_VALUE;
        break;
      case ChartType.SCATTER:
        displayTypes[3] = UIChartDataLabelDisplayType.SERIES_NAME;
        break;
      case ChartType.BOXPLOT:
        displayTypes[0] = UIChartDataLabelDisplayType.CATEGORY_NAME;
        displayTypes[12] = UIChartDataLabelDisplayType.HIGH_VALUE;
        displayTypes[13] = UIChartDataLabelDisplayType.THREE_Q_VALUE;
        displayTypes[14] = UIChartDataLabelDisplayType.MEDIAN_VALUE;
        displayTypes[15] = UIChartDataLabelDisplayType.FIRST_Q_VALUE;
        displayTypes[16] = UIChartDataLabelDisplayType.LOW_VALUE;
        break;
      case ChartType.SANKEY:
        displayTypes[9] = UIChartDataLabelDisplayType.NODE_NAME;
        displayTypes[11] = UIChartDataLabelDisplayType.NODE_VALUE;
        break;
      case ChartType.NETWORK:
        displayTypes[9] = UIChartDataLabelDisplayType.NODE_NAME;
        displayTypes[10] = UIChartDataLabelDisplayType.LINK_VALUE;
        break;
      case ChartType.RADAR:
        displayTypes[0] = UIChartDataLabelDisplayType.CATEGORY_NAME;
        displayTypes[8] = UIChartDataLabelDisplayType.VALUE;
      case ChartType.MAP:
        displayTypes[17] = UIChartDataLabelDisplayType.LAYER_NAME;
        displayTypes[18] = UIChartDataLabelDisplayType.LOCATION_INFO;
        displayTypes[19] = UIChartDataLabelDisplayType.DATA_VALUE;
    }

    return displayTypes;
  }

  /**
   * uiData가 없는경우 리턴되는 포멧
   * @param params
   * @param format
   * @returns {any}
   */
  public static noUIDataFormatTooltip(uiOption: UIOption, params: any, format: UIChartFormat, fieldInfo: PivotTableInfo): string {

    // Variable
    // let format: UIChartFormat = uiOption.valueFormat;
    let colorType: ChartColorType = uiOption.color.type;
    let targetField: string = (<UIChartColorByDimension>uiOption.color).targetField;

    // 기준선 일때
    if (params.componentType === 'markLine') {
      return params.seriesName + '<br />' + params.data.value;
    } else if (params.componentType === 'series') {
      // 시리즈 일때
      // 툴팁에 표시할 생상 정보
      const colorEl = params.marker;
      // 툴팁에 표시할 범례명
      let legendName = '';
      // 데이터 천단위마다 콤마 표시
      // 데이터가 배열 형식이라면 가장 마지막 요소의 값을 변환
      if (_.isUndefined(params.value)) return '';
      let value = _.isArray(params.value) ? _.last(params.value) : params.value;
      if (_.isNull(value)) return;


      //////////////////////////////////////////////////
      // 공통포멧
      //////////////////////////////////////////////////
      if( format && format.isAll ) {

        // 포맷 적용
        value = this.getFormatValue(value, format);
      }
      //////////////////////////////////////////////////
      // 개별포멧
      //////////////////////////////////////////////////
      else if( format && !format.isAll ) {

        // 포멧에 해당하는지 여부
        for( let eachFormat of format.each ) {
          if( params.seriesName == eachFormat.name
            || params.seriesName == (eachFormat.aggregationType +'('+ eachFormat.name +')')
            || params.name == eachFormat.name
            || params.name == (eachFormat.aggregationType +'('+ eachFormat.name +')') ){

            // 포맷 적용
            value = this.getFormatValue(value, eachFormat);
          }
        }
      }
      //////////////////////////////////////////////////
      // 포멧 정보가 없을경우
      //////////////////////////////////////////////////
      else {
        value = value.toLocaleString();
      }

      // 해당하는 데이터의 시리즈명
      let seriesName = '';
      // seriesName과 component subtype이 같지않을때만 값 설정
      if (params.seriesName !== params.componentSubType) seriesName = params.name + CHART_STRING_DELIMITER + params.seriesName;

      // 첫번째 라인은 색상정보/범례명/수치 표현
      // 두번째 라인은 차원값/측정값 의 조합
      switch (colorType) {
        // color by dimension
        case ChartColorType.DIMENSION :
          // 어떤 선반에 몇번째 필드인지 확인
          let fieldIdx = _.indexOf(fieldInfo.cols, targetField);

          const nameArr = fieldIdx < 0
            ? _.split(params.seriesName, CHART_STRING_DELIMITER)
            : _.split(params.name, CHART_STRING_DELIMITER);
          if (fieldIdx < 0) fieldIdx = _.indexOf(fieldInfo.rows, targetField);

          // 해당하는 dimension 요소 이름
          legendName = nameArr[fieldIdx];
          break;
        // color by series measure
        case ChartColorType.SERIES :
          // 해당하는 mesure 시리즈 이름
          legendName = _.last(_.split(params.seriesName, CHART_STRING_DELIMITER));
          break;
        // color by value
        case ChartColorType.MEASURE :
          // 범례상의 이름이 없기때문에 공백처리
          legendName = '';
          break;
      }

      // data의 data value, name이 있는경우 nameArr는 해당 데이터로 설정
      if (params && params.data.name && params.data.value) legendName = _.last(_.split(params.data.name, CHART_STRING_DELIMITER));

      // 범례값이 있는경우에만 : 값을 넣어주기
      if (legendName && '' !== legendName) value = ' : ' + value;

      return colorEl + legendName + value + '<br />' + seriesName;
    }
  }

  /**
   * convert value to deciaml value with thousand comma
   * @param value
   * @param {number} decimal
   * @returns {string}
   */
  public static getDecimalValue(value: any, decimal: number, useThousandsSep: boolean): string {

    const numberValue = Number(value);

    if (useThousandsSep) {

      return numberValue.toLocaleString(undefined, {maximumFractionDigits: decimal, minimumFractionDigits: decimal});
    }

    else return numberValue.toFixed(decimal);
  }

  /**
   * convert decimal value with thousand comma to number value
   * @param value
   * @param {number} decimal
   * @returns {string}
   */
  public static getNumberValue(value: any): number {

    return parseFloat(value.toString().replace(/,/g, ''));
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
