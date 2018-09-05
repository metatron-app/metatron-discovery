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
 * Created by Dolkkok on 2017. 8. 14..
 */

import { AfterViewInit, Component, ElementRef, Injector, OnInit } from '@angular/core';
import {
  AxisType, CHART_STRING_DELIMITER, ChartSelectMode, ChartType, EventType, LineType, Position, SeriesType,
  ShelveFieldType,
  ShelveType, UIChartDataLabelDisplayType
} from '../../option/define/common';
import { OptionGenerator } from '../../option/util/option-generator';
import { Series } from '../../option/define/series';
import * as _ from 'lodash';

import optGen = OptionGenerator;
import { Pivot } from 'app/domain/workbook/configurations/pivot';
import { UIChartColorByValue, UIOption } from '../../option/ui-option';
import { BaseChart, ChartSelectInfo, PivotTableInfo } from '../../base-chart';
import { BaseOption } from '../../option/base-option';
import { FormatOptionConverter } from '../../option/converter/format-option-converter';
import { UIChartFormat } from '../../option/ui-option/ui-format';
import { AxisOptionConverter } from '../../option/converter/axis-option-converter';


declare let echarts: any;

@Component({
  selector: 'boxplot-chart',
  templateUrl: 'boxplot-chart.component.html'
})
export class BoxPlotChartComponent extends BaseChart implements OnInit, AfterViewInit {

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

  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector ) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Getter & Setter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


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

  // After View Init
  public ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 선반정보를 기반으로 차트를 그릴수 있는지 여부를 체크
   *
   * @param shelve
   */
  public isValid(shelve: Pivot): boolean {
    return ((this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.DIMENSION) + this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.TIMESTAMP)) == 1)
      && ((this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) + this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED)) == 1)
      && ((this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.DIMENSION) + this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.TIMESTAMP)) > 0)
      && (this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.CALCULATED) == 0)
      && (this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.CALCULATED) == 0)
      && (this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) == 0 && this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP) == 0);
  }

  public draw(isKeepRange?: boolean): void {

    // pivot cols, rows 초기화
    const cols: string[] = [];

    this.data.columns.map((column) => {
      cols.push(column.name);
      return column.value;
    });

    this.pivotInfo = new PivotTableInfo(cols, [], this.fieldInfo.aggs);

    super.draw(isKeepRange);
  }

  /**
   * Chart Select(Click) Event Listener
   *
   */
  public addChartSelectEventListener(): void {
    this.chart.off('click');
    this.chart.on('click', (params) => {

      let selectMode: ChartSelectMode;
      let selectedColValues: string[];

      // 현재 차트의 시리즈
      const series = this.chartOption.series;
      // 데이터가 아닌 빈 공백을 클릭했다면
      // 모든 데이터 선택효과를 해제하며 필터에서 제거.
      if (this.isSelected && _.isNull(params)) {
        selectMode = ChartSelectMode.CLEAR;
        this.chartOption = this.selectionClear(this.chartOption);

        // 차트에서 선택한 데이터가 없음을 설정
        this.isSelected = false;
        // return;
      } else if (params != null) {

        // outlier(scatter) 영역은 필터에 해당하지 않으므로 취소
        if (_.eq(params.seriesType, SeriesType.SCATTER)) return;

        // parameter 정보를 기반으로 시리즈정보 설정
        const seriesIndex = params.seriesIndex;
        const dataIndex = params.dataIndex;
        const seriesValueList = series[seriesIndex].data;
        // 이미 선택이 되어있는지 여부
        const isSelectMode = _.isUndefined(seriesValueList[dataIndex].itemStyle);

        if (_.isUndefined(series[seriesIndex].data[dataIndex].itemStyle)) {
          series[seriesIndex].data[dataIndex].itemStyle = optGen.ItemStyle.auto();
        }

        if (isSelectMode) {
          // 선택 처리
          selectMode = ChartSelectMode.ADD;
        } else {
          // 선택 해제
          selectMode = ChartSelectMode.SUBTRACT;
        }

        // 차트에서 선택한 데이터 존재 여부 설정
        this.isSelected = isSelectMode;

        // UI에 전송할 선택정보 설정
        selectedColValues = _.split(params.name, CHART_STRING_DELIMITER);
      } else {
        return;
      }

      // 자기자신을 선택시 externalFilters는 false로 설정
      if (this.params.externalFilters) this.params.externalFilters = false;

      // UI에 전송할 선택정보 설정
      const selectData = this.setSelectData(params, selectedColValues, []);

      // 차트에 적용
      this.apply(false);
      this.lastDrawSeries = _.cloneDeep(this.chartOption['series']);

      // 이벤트 데이터 전송
      this.chartSelectInfo.emit(new ChartSelectInfo(selectMode, selectData, this.params));
    });
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
      type: ChartType.BOXPLOT,
      grid: [OptionGenerator.Grid.verticalMode(10, 0, 0, 10, false, true, false)],
      xAxis: [OptionGenerator.Axis.categoryAxis(Position.MIDDLE, null, false, true, true, true)],
      yAxis: [OptionGenerator.Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
      dataZoom: [OptionGenerator.DataZoom.horizontalDataZoom(), OptionGenerator.DataZoom.horizontalInsideDataZoom()],
      tooltip: OptionGenerator.Tooltip.itemTooltip(),
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

    let boxItem: Series;
    let outlierItem: Series;

    let boxPlotData = this.data.columns.map((column) => {
      return column.value;
    });
    boxPlotData = echarts.dataTool.prepareBoxplotData(boxPlotData);
    // Box 데이터 구성
    boxItem = {
      type: SeriesType.BOXPLOT,
      name: this.fieldInfo.aggs[0],
      data: boxPlotData.boxData,
      originData: _.cloneDeep(boxPlotData.boxData),
      hoverAnimation: false,
      itemStyle: {
        normal: { borderWidth: 1, borderType: LineType.SOLID },
        emphasis: { borderWidth: 1, borderType: LineType.SOLID }
      },
      tooltip: {
        formatter: (params) => {
          return this.tooltipFormatter(params);
        }
      }
    };
    // outlier 데이터 구성
    outlierItem = {
      type: SeriesType.SCATTER,
      symbolSize: 8,
      itemStyle: optGen.ItemStyle.auto(),
      data: boxPlotData.outliers,
      originData: _.cloneDeep(boxPlotData.outliers),
      tooltip: {
        formatter: (param) => {
          return FormatOptionConverter.getFormatValue(param.value[1], this.uiOption.valueFormat.isAll ? this.uiOption.valueFormat : this.uiOption.valueFormat.each[0]);
        }
      }
    };

    // 시리즈 설정
    this.chartOption.series = [boxItem, outlierItem];

    return this.chartOption;
  }

  /**
   * 박스플롯으로 series로 설정되는 부분
   */
  protected additionalSeries(): BaseOption {

    // outlier 색상은 빨간색으로 고정
    this.chartOption.series[1].itemStyle.normal.color = '#ca4819';

    return this.chartOption;
  }

  /**
   * 셀렉션 이벤트를 등록한다.
   * - 필요시 각 차트에서 Override
   */
  protected selection(): void {
    this.addChartSelectEventListener();
  }

  /**
   * 박스플롯으로 xAxis 설정되는 부분
   */
  protected additionalXAxis(): BaseOption {

    this.chartOption.xAxis[0].data = this.data.columns.map((column) => {
      return column.name;
    });

    // 축 Label 최대길이 설정
    this.chartOption = AxisOptionConverter.convertAxisLabelMaxLength(this.chartOption, this.uiOption, AxisType.X);

    return this.chartOption;
  }

  /**
   * 차트 선택 데이터 설정
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
          if (_.eq(key, ShelveType.ROWS)) return;
          targetValues = colValues;
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * tooltip formatter
   *
   * @param param
   * @returns {any}
   */
  private tooltipFormatter(params): any {

    let format: UIChartFormat = this.uiOption.valueFormat;

    // 축의 포멧이 있는경우 축의 포멧으로 설정
    const axisFormat = FormatOptionConverter.getlabelAxisScaleFormatTooltip(this.uiOption);
    if (axisFormat) format = axisFormat;

    let result: string[] = [];

    if (!this.uiOption.toolTip || !this.uiOption.toolTip.displayTypes) {

      const nameList = _.split(params.name, CHART_STRING_DELIMITER);
      result = FormatOptionConverter.getTooltipName(nameList, this.pivot.columns, result, true);

      result.push('High: ' + FormatOptionConverter.getFormatValue(params.data[0], format));
      result.push('3Q: ' + FormatOptionConverter.getFormatValue(params.data[1], format));
      result.push('Median: ' + FormatOptionConverter.getFormatValue(params.data[2], format));
      result.push('1Q: ' + FormatOptionConverter.getFormatValue(params.data[3], format));
      result.push('Low: ' + FormatOptionConverter.getFormatValue(params.data[4], format));
    } else {

      if (  -1 !== this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_NAME) ) {

        const nameList = _.split(params.name, CHART_STRING_DELIMITER);
        result = FormatOptionConverter.getTooltipName(nameList, this.pivot.columns, result, true);
      }
      if (  -1 !== this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.HIGH_VALUE) ) {

        result.push('High: ' + FormatOptionConverter.getFormatValue(params.data[0], format));
      }
      if (  -1 !== this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.THREE_Q_VALUE) ) {

        result.push('3Q: ' + FormatOptionConverter.getFormatValue(params.data[3], format));
      }
      if (  -1 !== this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.MEDIAN_VALUE) ) {

        result.push('Median: ' + FormatOptionConverter.getFormatValue(params.data[2], format));
      }
      if (  -1 !== this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.FIRST_Q_VALUE) ) {

        result.push('1Q: ' + FormatOptionConverter.getFormatValue(params.data[1], format));
      }
      if (  -1 !== this.uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.LOW_VALUE) ) {

        result.push('Low: ' + FormatOptionConverter.getFormatValue(params.data[4], format));
      }
    }

    return result.join('<br/>');
  }

}
