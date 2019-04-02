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
 * pie chart component
 */
import { AfterViewInit, Component, ElementRef, Injector, OnInit } from '@angular/core';
import {
  CHART_STRING_DELIMITER,
  ChartColorList,
  ChartPivotType,
  ChartType,
  Orient,
  PieSeriesViewType,
  Position,
  SeriesType,
  ShelveFieldType,
  ShelveType,
  SymbolType,
  UIChartDataLabelDisplayType
} from '../../option/define/common';
import { OptionGenerator } from '../../option/util/option-generator';
import { Series } from '../../option/define/series';
import * as _ from 'lodash';
import { Pivot } from '../../../../../domain/workbook/configurations/pivot';
import { BaseChart, PivotTableInfo } from '../../base-chart';
import { BaseOption } from '../../option/base-option';
import { FormatOptionConverter } from '../../option/converter/format-option-converter';
import { UIPieChart } from '../../option/ui-option/ui-pie-chart';
import { UIOption } from '../../option/ui-option';
import { UIChartFormat } from '../../option/ui-option/ui-format';
import { LegendOptionConverter } from '../../option/converter/legend-option-converter';
import optGen = OptionGenerator;

@Component({
  selector: 'pie-chart',
  templateUrl: 'pie-chart.component.html'
})
export class PieChartComponent extends BaseChart implements OnInit, AfterViewInit {

  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector ) {

    super(elementRef, injector);
  }

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

  // After View Init
  public ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  /**
   * @override validation to draw chart
   *
   * @param shelve
   */
  public isValid(shelve: Pivot): boolean {

    return (this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) == 1)
      && ((this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) + this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED)) == 1);
  }

  /**
   * uiOption only use in pie chart
   * @param isKeepRange
   */
  public draw(isKeepRange?: boolean): void {

    // only set dimension / timestamp data on aggregation pivot
    this.fieldInfo.aggs = this.pivot.aggregations.filter((agg) => {
      return _.eq(agg.type, ShelveFieldType.DIMENSION) || _.eq(agg.type, ShelveFieldType.TIMESTAMP);
    }).map((agg) => {
      return !_.isEmpty(agg.alias) ? agg.alias : agg.name;
    });

    // set pivot info
    this.pivotInfo = this.setPiePivotInfo();

    super.draw(isKeepRange);
  }

  /**
   * generate default option
   * - require to override each chart
   */
  protected initOption(): BaseOption {

    return {
      type: ChartType.PIE,
      legend: OptionGenerator.Legend.custom(true, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
      tooltip: OptionGenerator.Tooltip.itemTooltip(),
      series: []
    };
  }

  /**
   * additional series info
   * - require to override each chart
   * @returns {BaseOption}
   */
  protected convertSeriesData(): BaseOption {

    let pieSizeInfo: any = {};
    // set align, size depends on pie counts
    if (this.data.columns.length > 1) {
      const orient = !_.isEmpty(this.pivot.columns) ? Orient.HORIZONTAL : Orient.VERTICAL;
      pieSizeInfo = this.setPieSizeCount(this.data.columns.length, orient);
    }

    let seriesList = [];
    let existEtcData = false;

    _.each(this.data.columns, (column, idx) => {

      // convert Null String data to No Name
      for( let item of column.value ) {
        if( item['name'].trim() == '' ) {
          item['name'] = 'EMPTY';
        }
      }

      const seriesName = column.name;
      let resultSeries: Series;
      resultSeries = {
        type: SeriesType.PIE,
        name: seriesName,
        radius: !_.isEmpty(pieSizeInfo) ? pieSizeInfo.radius[idx] : ['0%', '60%'],
        center: !_.isEmpty(pieSizeInfo) ? pieSizeInfo.center[idx] : ['50%', '50%'],
        data: column.value,
        selectedMode: true,
        hoverAnimation: false,
        itemStyle: optGen.ItemStyle.auto(),
        label: optGen.LabelStyle.defaultLabelStyle(true, Position.INSIDE),
        tooltip: {
          formatter: (param) => {
            return this.tooltipFormatter(param, this.pivot);
          }
        }
      };

      let otherList = [];
      let otherValueList = resultSeries.data.filter((dataObj, index) => {
        // convert values which is bigger than maxCategory to others
        let isOtherValue = null != (<UIPieChart>this.uiOption).maxCategory && undefined != (<UIPieChart>this.uiOption).maxCategory ?
          (<UIPieChart>this.uiOption).maxCategory <= index : false;
        if( isOtherValue ) {
          otherList.push(dataObj.name);
        }
        return isOtherValue;
      }).map((dataObj) => {
        return {value : dataObj.value, percentage : dataObj.percentage};
      });

      resultSeries.data = resultSeries.data.filter((dataObj, index) => {
        return null != (<UIPieChart>this.uiOption).maxCategory && undefined != (<UIPieChart>this.uiOption).maxCategory ?
              (<UIPieChart>this.uiOption).maxCategory > index : true;
      });

      // when otherList exists
      if (otherValueList.length > 0) {
        existEtcData = true;
        resultSeries.data.push({ value: _.sumBy(otherValueList, 'value'), percentage : _.sumBy(otherValueList, 'percentage'), name: 'OTHER' });
      }
      resultSeries.originData = _.cloneDeep(resultSeries.data);

      // set uiData
      resultSeries.uiData = resultSeries.data;

      seriesList.push(resultSeries);
    });

    this.chartOption.series = seriesList;

    // set existEtcData value
    this.chartOption.dataInfo['existEtcData'] = existEtcData;

    return this.chartOption;
  }

  /**
   * set uiData in a pie chart
   */
  protected setUIData(): any {

    _.each(this.data.columns, (data) => {
      data.seriesName = _.cloneDeep(_.map(data.value, 'name'));
      data.seriesValue = _.cloneDeep(_.map(data.value, 'value'));
      data.seriesPercent = _.cloneDeep(_.map(data.value, 'percentage'));
    });

    return this.data.columns;
  }

  /**
   * set legend in a pie chart
   * @returns {BaseOption}
   */
  protected additionalLegend(): BaseOption {

    // if others data exist, add them in legend
    if (!_.isUndefined(this.chartOption.legend) && this.chartOption.dataInfo.existEtcData) {

      // if data is undefined, intialize it
      if (!this.chartOption.legend.data) this.chartOption.legend.data = [];

      this.chartOption.legend.data.push('OTHER');
    }

    return this.chartOption;
  }

  /**
   * additional series settings
   */
  protected additionalSeries(): BaseOption {

    // change chart view type (circle/donut)
    this.chartOption = this.convertViewType();

    // set series label format, label position
    this.chartOption.series.forEach((series) => {

      if (this.uiOption.dataLabel.showOutside) {
        // label position
        series.label.normal.position = Position.OUTSIDE;

        if (!series.labelLine) series.labelLine = {};
        // set labelLine
        series.labelLine.length = 10;
        series.labelLine.length2 = 15;

        // remove text align
        if (series.label.normal.rich) delete series.label.normal.rich.align;
      } else {
        // label position
        series.label.normal.position = Position.INSIDE;
      }

      // label format
      series.label.normal.formatter = ((params): any => {

        let uiData = _.cloneDeep(series.uiData[params.dataIndex]);

        return this.getFormatPieValueSeries(params, this.uiOption.valueFormat, this.uiOption, series, uiData);
      });
    });

    return this.chartOption;
  }

  /**
   * set datalabel in a pie chart
   * @param params
   * @param format
   * @param uiOption
   * @param option
   * @param uiData
   * @returns {string}
   */
  private getFormatPieValueSeries(params, format: UIChartFormat, uiOption: UIOption, series?: any, uiData?: any): string {

    // UI 데이터 정보가 있을경우
    if( uiData ) {

      if (!uiOption.dataLabel || !uiOption.dataLabel.displayTypes) return '';

      // UI 데이터 가공
      let isUiData: boolean = false;
      let result: string[] = [];
      // 해당 dataIndex 데이터애로 뿌려줌
      if( -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_NAME) ){

        let categoryNameList = _.split(uiData.name, CHART_STRING_DELIMITER);
        let dimensionPivotList = this.pivot.aggregations.filter((item) => {if ('dimension' == item.type) return item});
        result = FormatOptionConverter.getTooltipName(categoryNameList, dimensionPivotList, result);
        isUiData = true;
      }
      if(  -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE) ){

        const seriesValue = typeof uiData.value === 'undefined' ? uiData.value : uiData.value;
        result.push(FormatOptionConverter.getFormatValue(seriesValue, format));
        isUiData = true;
      }
      if(  -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT) ){
        let value = params.data.percentage;
        value = (Math.floor(Number(value) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal)).toFixed(format.decimal);
        result.push( '(' + value +'%' + ')' );
        isUiData = true;
      }

      let label: string = "";

      // UI 데이터기반 레이블 반환
      if( isUiData ) {
        for( let num: number = 0 ; num < result.length ; num++ ) {
          if( num > 0 ) {
            // label += "\n";
            label += " ";
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
    return FormatOptionConverter.noUIDataFormat(params, format);
  }

  /**
   * add selection event
   */
  protected selection(): void {

    this.addChartSelectEventListener();
    this.addLegendSelectEventListener();
  }

  /**
   * 파이차트 - 선택 데이터 설정
   *
   * @param params
   * @param colValues
   * @param rowValues
   * @returns {any}
   */
  protected setSelectData(params: any, colValues: string[], rowValues: string[]): any {

    let returnDataList: any = [];

    // 선택정보 설정
    let targetValues: string[] = [];
    _.forEach(this.pivot, (value, key) => {

      // deep copy
      let deepCopyShelve = _.cloneDeep(this.pivot[key]);

      // dimension timestamp 데이터만 설정
      deepCopyShelve = _.filter(deepCopyShelve, (obj) => {
        if (_.eq(obj.type, ShelveFieldType.DIMENSION) || _.eq(obj.type, ShelveFieldType.TIMESTAMP)) {
          return obj;
        }
      });

      deepCopyShelve.map((obj, idx) => {
        // 선택한 데이터 정보가 있을 경우에만 차원값필드와 맵핑
        if (!_.isNull(params)) {

          targetValues = _.eq(key, ShelveType.AGGREGATIONS) ? colValues : rowValues;
        }
        // 해당 차원값에 선택 데이터 값을 맵핑, null값인경우 데이터가 들어가지 않게 설정
        if (!_.isEmpty(targetValues) && targetValues[idx]) {

          // object 형식으로 returnData 설정
          if (-1 === _.findIndex(returnDataList, {name: obj.name})) {

            returnDataList.push(obj);
          }
          returnDataList[returnDataList.length - 1].data = [targetValues[idx]];

        }
      });
    });

    return returnDataList;
  }

  protected convertLegend(): BaseOption {

    ////////////////////////////////////////////////////////
    // 범례 설정이 없다면 패스
    ////////////////////////////////////////////////////////

    if( !this.chartOption.legend ) {
      return this.chartOption;
    }

    ////////////////////////////////////////////////////////
    // set legend data
    ////////////////////////////////////////////////////////

    // color by dimension / value인 경우
    // option에 범례가 있는경우
    if (this.chartOption.legend) {

      // 범례 항목을 구성하는 차원값 데이터
      let legendData: string[];
      // 열/행의 선반에서의 필드 인덱스
      let fieldIdx: number;
      // 열/행 여부
      let pivotType: ChartPivotType;

      let fieldInfo = _.cloneDeep(this.fieldInfo);

      // 열/행/교차 여부 및 몇번째 필드인지 확인
      _.forEach(fieldInfo, (value, key) => {
        if (_.indexOf(value, this.uiOption.color['targetField']) > -1) {
          fieldIdx = _.indexOf(value, this.uiOption.color['targetField']);
          pivotType = _.eq(key, ChartPivotType.COLS) ? ChartPivotType.COLS : _.eq(key, ChartPivotType.ROWS) ? ChartPivotType.ROWS : ChartPivotType.AGGS;
        }
      });
      // 한 선반에 2개이상 올라 갈경우("-"으로 필드값이 이어진 경우는 필드의 인덱스에 해당하는 값만 추출)
      if (this.fieldInfo[pivotType] && this.fieldInfo[pivotType].length > 1) {
        legendData = this.pivotInfo[pivotType].map((value) => {
          return !_.split(value, CHART_STRING_DELIMITER)[fieldIdx] ? value : _.split(value, CHART_STRING_DELIMITER)[fieldIdx];
        });
        // remove duplicate values
        legendData = _.uniq(legendData);
      } else {
        legendData = this.pivotInfo[pivotType];
      }

      this.chartOption.legend.data = legendData;
      this.chartOption.legend.color = <any>ChartColorList[this.uiOption.color['schema']];
    }

    ////////////////////////////////////////////////////////
    // set legend show / hide
    ////////////////////////////////////////////////////////

    this.chartOption = LegendOptionConverter.convertLegend(this.chartOption, this.uiOption);

    ////////////////////////////////////////////////////////
    // additional settings
    ////////////////////////////////////////////////////////

    // set additional legend options
    this.chartOption = this.additionalLegend();

    return this.chartOption;
  }

  /**
   * set align, size depends on pie counts
   *
   * @param {number} count
   * @param {Orient} orient
   * @returns {any}
   */
  private setPieSizeCount(count: number, orient: Orient): any {

    const size = 95 / count;
    const increase = size / 1.55;

    const radiusList: any[] = _.fill(Array(count), []);
    const centerList: any[] = _.fill(Array(count), []);
    const titleList: any[] = _.fill(Array(count), []);

    radiusList.map((item, idx) => {
      const location = _.eq(idx, 0) ? increase + '%' : (increase + (size * idx)) + '%';
      if (_.eq(orient, Orient.HORIZONTAL)) {
        // horizontal mode
        radiusList[idx] = ['0%', size + '%'];
        centerList[idx] = [location, '50%'];
        titleList[idx] = [location, (50 - (size / 2) - 4) + '%'];
      } else {
        // vertical mode
        radiusList[idx] = ['0%', (size - 5) + '%'];
        centerList[idx] = ['50%', location];
        titleList[idx] = ['50%', (size * idx) + '%'];
      }
    });

    return { radius: radiusList, center: centerList, title: titleList };

  }

  /**
   * change chart view type (circle/donut)
   *
   * @param type
   */
  private convertViewType(): BaseOption {

    const type: PieSeriesViewType = (<UIPieChart>this.uiOption).markType;

    const series = this.chartOption.series;

    _.each(series, (obj) => {
      const size = _.toNumber(_.join(_.dropRight(_.values(obj.radius[1])), ''));
      obj.radius = _.eq(type, PieSeriesViewType.DONUT) ? [size / 2 + '%', obj.radius[1]] : ['0%', obj.radius[1]];
    });

    return this.chartOption;
  }

  /**
   * 파이차트 pivot 정보설정
   */
  private setPiePivotInfo(): PivotTableInfo {

    // set pivotInfo
    const cols: string[] = [];
    let aggs: string[] = [];
    let allAggs = [];

    let pieSizeInfo: any = {};
    // 파이 갯수에 따른 크기 및 위치 조정
    if (this.data.columns.length > 1) {
      const orient = !_.isEmpty(this.pivot.columns) ? Orient.HORIZONTAL : Orient.VERTICAL;
      pieSizeInfo = this.setPieSizeCount(this.data.columns.length, orient);
    }

    let otherFl: boolean = false;

    _.each(this.data.columns, (column, idx) => {

      // 파이 개수가 2개 이상일 경우 파이별 타이틀 생성
      if (!_.isEmpty(pieSizeInfo)) {
        const title = _.join(_.dropRight(_.split(column.name, CHART_STRING_DELIMITER)), CHART_STRING_DELIMITER);
        cols.push(title);
      }

      let otherList = [];
      column.value.filter((dataObj, index) => {
        // maxCategory보다 큰값들을 others로 지정
        let isOtherValue = null != (<UIPieChart>this.uiOption).maxCategory && undefined != (<UIPieChart>this.uiOption).maxCategory ?
                          (<UIPieChart>this.uiOption).maxCategory <= index : false;
        if( isOtherValue ) {
          otherList.push(dataObj.name);
          otherFl = true;
        }
        return isOtherValue;
      }).map((dataObj) => {
        return dataObj.value;
      });

      // 필터링 되지않은 aggregation으로 설정 => 범례 / 색상에서 멀티일때 범례가 달라지면 안됨
      aggs = column.value.map((dataObj) => {
        return dataObj.name;
      });
      // remove Other list in aggs
      for( let num: number = aggs.length-1 ; num >= 0 ; num-- ){
        for( let item of otherList ) {
          if( item == aggs[num] ) {
            aggs.splice(num, 1);
          }
        }
      }

      // 파이차트의 measure개가 복수인경우 모든 aggs값에서 설정해야하므로
      allAggs.push(aggs);
    });

    // multi measure일때 범례에 대한 값을 모든 aggs값에서 반영하기
    let setAggs = [];
    if (allAggs && allAggs.length > 1) {

      let array = [];
      for (const item of allAggs) {

        array = array.concat(item);
      }

      setAggs = _.uniq(array);
    } else setAggs = aggs;

    // add 'OTHER' in pivotInfo (using in color option)
    if (otherFl) {
      setAggs.push('OTHER');
    }

    // set pivot info, remove duplicate aggregation data
    return new PivotTableInfo(cols, [], _.uniq(setAggs));
  }

  /**
   * tooltip formatter
   *
   * @param params
   * @param {Pivot} pivot
   * @returns {any}
   */
  private tooltipFormatter(params, pivot:Pivot): any {

    if (!this.uiOption.toolTip) this.uiOption.toolTip = {};
    if (!this.uiOption.toolTip.displayTypes) this.uiOption.toolTip.displayTypes = FormatOptionConverter.setDisplayTypes(this.uiOption.type);

    let format = this.uiOption.valueFormat;
    // tooltip data
    let result: string[] = [];

    if( -1 !== this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_NAME) ){

      const nameList = _.split(params.data.name, CHART_STRING_DELIMITER);
      const dimensionList = pivot.aggregations.filter((item) => {if ('dimension' == item.type) return item});

      result = FormatOptionConverter.getTooltipName(nameList, dimensionList, result, true);
    }
    if( -1 !== this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE) ){

      let seriesValue = FormatOptionConverter.getTooltipValue(params.seriesName, pivot.aggregations, this.uiOption.valueFormat, params.data.value);

      // when series percent is selected
      if (-1 !== this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT)) {
        let value = (Math.floor(Number(params.data.percentage) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal)).toFixed(format.decimal);

        seriesValue += ' (' + value + '%)';
      }

      result.push(seriesValue);
    }
    if( -1 !== this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT) ){

      // when series value is not selected
      if (-1 == this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE)) {
        let seriesPercent = FormatOptionConverter.getTooltipValue(params.seriesName, pivot.aggregations, this.uiOption.valueFormat, params.data.percentage);

        seriesPercent += '%';
        result.push(seriesPercent);
      }
    }

    return result.join('<br/>');
  }
}
