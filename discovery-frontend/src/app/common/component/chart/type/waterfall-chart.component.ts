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
 * Created by Dolkkok on 2017. 8. 17..
 */

import {AfterViewInit, Component, ElementRef, Injector, OnInit} from '@angular/core';
import {
  CHART_STRING_DELIMITER, ChartSelectMode, ChartType, Position, SeriesType, ShelveFieldType,
  ShelveType, UIChartDataLabelDisplayType,
  WaterfallBarColor
} from '../option/define/common';
import {OptionGenerator} from '../option/util/option-generator';
import {Series} from '../option/define/series';

import * as _ from 'lodash';
import optGen = OptionGenerator;
import {Pivot} from '../../../../domain/workbook/configurations/pivot';
import {BaseChart, ChartSelectInfo, PivotTableInfo} from '../base-chart';
import {BaseOption} from '../option/base-option';
import {FormatOptionConverter} from "../option/converter/format-option-converter";
import {UIChartFormat} from '../option/ui-option/ui-format';
import {UIWaterfallChart} from '../option/ui-option/ui-waterfall-chart';

@Component({
  selector: 'waterfall-chart',
  template: '<div class="chartCanvas" style="width: 100%; height: 100%; display: block;"></div>'
})
export class WaterFallChartComponent extends BaseChart implements OnInit, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected elementRef: ElementRef,
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
  }

  // After View Init
  public ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 선반정보를 기반으로 차트를 그릴수 있는지 여부를 체크
   * - 반드시 각 차트에서 Override
   */
  public isValid(shelve: Pivot): boolean {
    return this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.TIMESTAMP) == 1
      && ((this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) == 1 && this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED) == 0)
        || (this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED) == 1))
      && (this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.DIMENSION) == 0 && this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.CALCULATED) == 0)
      && (this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) == 0 && this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP) == 0)
  }

  /**
   * bar차트에서만 쓰이는 uiOption설정
   * @param isKeepRange
   */
  public draw(isKeepRange?: boolean): void {

    // pivotInfo 값 설정
    this.pivotInfo = new PivotTableInfo(this.data.rows, [], this.fieldInfo.aggs);

    super.draw(isKeepRange);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차트의 기본 옵션을 생성한다.
   * - 각 차트에서 Override
   */
  protected initOption(): BaseOption {
    return {
      type: ChartType.WATERFALL,
      grid: [OptionGenerator.Grid.verticalMode(10, 0, 0, 10, false, true, false)],
      xAxis: [OptionGenerator.Axis.categoryAxis(Position.MIDDLE, null, false, true, true, true)],
      yAxis: [OptionGenerator.Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
      dataZoom: [OptionGenerator.DataZoom.horizontalDataZoom(), OptionGenerator.DataZoom.horizontalInsideDataZoom()],
      tooltip: OptionGenerator.Tooltip.axisTooltip(),
      toolbox: OptionGenerator.Toolbox.hiddenToolbox(),
      series: []
    };
  }

  /**
   * 차트별 시리즈 추가정보
   * - 반드시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertSeriesData(): BaseOption {

    const column = this.data.columns[0];
    const sourceData = column.value;
    const currentData = [0];

    let barColor = (<UIWaterfallChart>this.uiOption).barColor;

    // barColor, positiveColor가 있는경우 해당 색상으로 설정
    let positiveColor = barColor && barColor.positive ? barColor.positive : WaterfallBarColor.POSITIVE.toString();

    // barColor, negativeColor가 있는경우 해당 색상으로 설정
    let negativeColor = barColor && barColor.negative ? barColor.negative : WaterfallBarColor.NEGATIVE.toString();

    const dataItemGenerator = (name, val, color) => {
      const item = {
        name: name,
        value: val,
        selected: false,
        itemStyle: OptionGenerator.ItemStyle.opacity1()
      };
      item.itemStyle.normal.color = color;
      item.itemStyle.emphasis.color = color;
      return item;
    };

    const increaseData = [];
    const decreaseData = [];
    if (_.gt(sourceData[0], 0)) {
      increaseData.push(dataItemGenerator(column.categoryName[0], sourceData[0], positiveColor));
      decreaseData.push(dataItemGenerator(column.categoryName[0], '-', negativeColor));
    } else {
      increaseData.push(dataItemGenerator(column.categoryName[0], '-', positiveColor));
      decreaseData.push(dataItemGenerator(column.categoryName[0], sourceData[0], negativeColor));
    }

    // waterfall 데이터 구성
    sourceData.map((value, idx) => {
      if (idx > 0) {
        if (_.gt(value, sourceData[idx - 1])) {
          currentData.push(sourceData[idx - 1]);
          increaseData.push(dataItemGenerator(column.categoryName[idx], value - sourceData[idx - 1], positiveColor));
          decreaseData.push(dataItemGenerator(column.categoryName[idx], '-', negativeColor));
        } else {
          currentData.push(value);
          increaseData.push(dataItemGenerator(column.categoryName[idx], '-', positiveColor));
          decreaseData.push(dataItemGenerator(column.categoryName[idx], sourceData[idx - 1] - value, negativeColor));
        }
      }
    });

    // 기본 시리즈 설정
    const series: Series = {
      type: SeriesType.BAR,
      name: this.fieldInfo.aggs[0],
      stack: ChartType.WATERFALL.toString(),
      itemStyle: optGen.ItemStyle.auto(),
      label: optGen.LabelStyle.auto(),
      uiData: this.data.columns[0]
    };

    // series 초기화
    this.chartOption.series = [];

    // 현재수치, 증가값, 감소값 시리즈 설정
    // waterfall의 경우 클릭 취소시 원본데이터로 덮어쓰는데 originData로 쓰게되면 그려지는 데이터가 달라지게 되므로 series data로 originData 설정
    this.chartOption.series.push(_.extend({}, _.cloneDeep(series), {data: currentData, originData: currentData}));
    this.chartOption.series.push(_.extend({}, _.cloneDeep(series), {data: increaseData, originData: increaseData}));
    this.chartOption.series.push(_.extend({}, _.cloneDeep(series), {data: decreaseData, originData: decreaseData}));

    // 증가, 감소 데이터만 보여지면 되기 때문에 currentData 는 투명 처리
    this.chartOption.series[0].itemStyle.normal.opacity = 0;
    this.chartOption.series[0].itemStyle.emphasis.opacity = 0;
    this.chartOption.series[0].itemStyle.normal.color = "#ffffff";

    return this.chartOption;
  }

  /**
   * waterfall 툴팁 정보를 변환한다.
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalTooltip(): BaseOption {

    const sourceData = this.data.columns[0].categoryValue;

    // formatter 설정
    if (!_.isUndefined(this.chartOption.tooltip)) {
      this.chartOption.tooltip.formatter = (params) => {
        return this.formatter(params, sourceData);
      };
    }

    return this.chartOption;
  }

  /**
   * 셀렉션 이벤트를 등록한다.
   * - 필요시 각 차트에서 Override
   */
  protected selection(): void {
    this.addChartSelectEventListener();
    this.addChartMultiSelectEventListener();
  }

  /**
   * 차트 선택효과 전체 해제
   *
   * @param option
   * @returns {BaseOption}
   */
  protected selectionClear(option: BaseOption): BaseOption {

    const series = option.series;

    this.pivot.columns.forEach((item) => {
      delete item['data'];
    });

    this.pivot.aggregations.forEach((item) => {
      delete item['data'];
    });

    series.forEach((obj, idx) => {
      if( 0 < idx ) {
        obj.data.forEach(item => {
          this.clearSelectSeriesData(item);
        });
      }
    });
    return option;
  }

  /**
   * 차트 선택 효과 설정(단일/리스트)
   *
   * @param option
   * @param params
   * @returns {BaseOption}
   */
  // protected selectionAdd(option: BaseOption, params: any): BaseOption {
  //
  //   // 현재 차트 시리즈 리스트
  //   const series = option.series;
  //
  //   // 이미 선택된 다른 데이터가 존재하는지 확인
  //   const selectedSeriesList = series.filter((obj) => {
  //     return obj.existSelectData;
  //   });
  //
  //   // 이미 선택된 다른 데이터가 없다면 모든 데이터 dimmed 처리
  //   if (_.isEmpty(selectedSeriesList)) {
  //     series.map((obj, index) => {
  //
  //       // waterfall series 첫번째 데이터가 아닐때에만 설정
  //       if (!obj.stack || (obj.stack && index !== 0)) {
  //
  //         if (!_.isUndefined(obj.itemStyle) && !_.isUndefined(obj.itemStyle.normal)) obj.itemStyle.normal.opacity = 0.2;
  //         if (!_.isUndefined(obj.lineStyle) && !_.isUndefined(obj.lineStyle.normal)) obj.lineStyle.normal.opacity = 0.2;
  //         if (!_.isUndefined(obj.textStyle) && !_.isUndefined(obj.textStyle.normal)) obj.textStyle.normal.opacity = 0.2;
  //       }
  //       return obj;
  //     });
  //   }
  //
  //   // 선택한 데이터 선택효과 처리
  //   const setSeriesValue = ((series: Series, data: any, color: string, opacity: number = 1): any => {
  //     return {
  //       name: series.name,
  //       value: !_.isUndefined(data.value) ? data.value : data,
  //       itemStyle: {
  //         normal: {
  //           color,
  //           opacity: opacity
  //         }
  //       }
  //     };
  //   });
  //
  //   // 단일/리스트 선택에 따라 처리
  //   if (_.isUndefined(params.brushSelectData)) {
  //     // 선택한 시리즈
  //     const selectedSeries = series[params.seriesIndex];
  //     // 선택한 시리즈의 데이터 리스트
  //     const selectedSeriesData = selectedSeries.data;
  //     // 선택한 데이터
  //     const selectedData = selectedSeriesData[params.dataIndex];
  //
  //     // 시리즈 라인 선택효과 처리
  //     if (!_.isUndefined(selectedSeries.lineStyle)) selectedSeries.lineStyle.normal.opacity = 1;
  //
  //     // 선택한 데이터만 선택효과 처리
  //     if (!_.isUndefined(selectedData.value)) {
  //       // 오브젝트로 구성된 데이터는 opacity 만 조정
  //       selectedSeriesData[params.dataIndex].itemStyle = OptionGenerator.ItemStyle.auto();
  //       selectedSeriesData[params.dataIndex].itemStyle.normal.opacity = 1;
  //       selectedSeriesData[params.dataIndex].textStyle = OptionGenerator.TextStyle.auto();
  //       selectedSeriesData[params.dataIndex].textStyle = {normal: {opacity: 1}};
  //     } else {
  //
  //       let opacity = 1;
  //
  //       // waterfall 차트의 첫번째 series일때
  //       if (selectedSeries.stack && params.seriesIndex == 0) {
  //
  //         // opacity 0으로 설정
  //         opacity = 0;
  //       }
  //
  //       // 수치로 되어있는 데이터는 개별 itemStyle 을 지정하여 오브젝트로 재구성
  //       selectedSeriesData[params.dataIndex] = setSeriesValue(selectedSeries, selectedData, params.color, opacity);
  //     }
  //
  //     // 라인 존재하는 경우 심볼 크기 변경
  //     if (!_.isUndefined(selectedSeries.lineStyle)) selectedSeriesData[params.dataIndex].symbolSize = 10;
  //     // 선택된 시리즈로 처리
  //     selectedSeries.existSelectData = true;
  //   } else {
  //     const selectedBrushData = params.brushSelectData[0].selected;
  //     selectedBrushData.map((obj) => {
  //
  //       // 선택한 시리즈
  //       const selectedSeries = series[obj.seriesIndex];
  //       // 선택한 시리즈의 데이터 리스트
  //       const selectedSeriesData = selectedSeries.data;
  //       // 선택한 series data index값
  //       const selectedDataList = obj.dataIndex;
  //
  //       // 시리즈 선택 처리
  //       if (!_.isEmpty(selectedDataList)) {
  //
  //         // dataIndex 리스트 개수만큼 설정
  //         selectedDataList.map((index) => {
  //
  //           // data.value가 있는지 없는지 데이터 형태에 따라 로직 설정
  //           if (!_.isUndefined(selectedSeriesData[index].value)) {
  //             // 오브젝트로 구성된 데이터는 opacity 만 조정
  //             selectedSeriesData[index].itemStyle = OptionGenerator.ItemStyle.auto();
  //             selectedSeriesData[index].itemStyle.normal.opacity = 1;
  //           } else {
  //             // 수치로 되어있는 데이터는 개별 itemStyle 을 지정하여 오브젝트로 재구성
  //             selectedSeriesData[index] = setSeriesValue(selectedSeries, selectedSeriesData[index], params.color);
  //           }
  //         });
  //
  //         // 선택된 시리즈로 처리
  //         selectedSeries.existSelectData = true;
  //       }
  //     });
  //   }
  //   return option;
  // }

  /**
   * uiData에 설정될 columns데이터 설정
   */
  protected setUIData(): any {

    const sourceData = this.data.columns[0].value;
    const categoryValue = _.gt(sourceData[0], 0) ? [sourceData[0]] : [];

    sourceData.map((value, idx) => {
      if (idx > 0) {
        if (_.gt(value, sourceData[idx - 1])) {
          categoryValue.push(value - sourceData[idx - 1]);
        } else {
          categoryValue.push(sourceData[idx - 1] - value);
        }
      }
    });

    _.each(this.data.columns, (data) => {

      data.categoryName = _.cloneDeep(this.data.rows);
      data.categoryValue = _.cloneDeep(categoryValue);
    });

    return this.data.columns;
  }

  /**
   * 차트에 옵션 반영
   * - Echart기반 차트가 아닐경우 Override 필요
   * @param initFl 차트 초기화 여부
   */
  protected apply(initFl: boolean = true): void {

    this.chart.setOption(this.chartOption, true, false);

    // set connect
    this.chart.group = 'group1';
    this.echarts.connect('group1');

    console.info(this.chartOption);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * waterfall formatter
   * @param params
   * @param sourceData
   * @returns {string}
   */
  private formatter(params, sourceData): any {

    if (!this.uiOption.toolTip) this.uiOption.toolTip = {};
    if (!this.uiOption.toolTip.displayTypes) this.uiOption.toolTip.displayTypes = FormatOptionConverter.setDisplayTypes(this.uiOption.type);

    // 포멧값 설정
    let format: UIChartFormat = this.uiOption.valueFormat;

    // 축의 포멧이 있는경우 축의 포멧으로 설정
    const axisFormat = FormatOptionConverter.getlabelAxisScaleFormatTooltip(this.uiOption);
    if (axisFormat) format = axisFormat;

    let status;
    if (!_.eq(params[1].value, '-')) {
      status = params[2];
    } else {
      status = params[1];
    }

    let result: string[] = [];
    if (!this.uiOption.toolTip.displayTypes) {

      // category name 설정
      const nameList = _.split(status.name, CHART_STRING_DELIMITER);
      result = FormatOptionConverter.getTooltipName(nameList, this.pivot.columns, result, true);

      // category value 설정
      let seriesValue = FormatOptionConverter.getTooltipValue(status.name, this.pivot.aggregations, format, sourceData[status.dataIndex]);
      result.push(seriesValue);

    } else {
      if (-1 !== this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_NAME)) {

        const nameList = _.split(status.name, CHART_STRING_DELIMITER);
        result = FormatOptionConverter.getTooltipName(nameList, this.pivot.columns, result, true);
      }

      if (-1 !== this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_VALUE)) {

        let seriesValue = FormatOptionConverter.getTooltipValue(status.seriesName, this.pivot.aggregations, format, sourceData[status.dataIndex]);
        result.push(seriesValue);
      }
    }
    return result.join('<br/>');
  }

}
