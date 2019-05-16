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
 * Created by Dolkkok on 2017. 8. 1..
 */

import { AfterViewInit, Component, ElementRef, Injector, OnInit } from '@angular/core';
import {
  CHART_STRING_DELIMITER,
  ChartSelectMode,
  ChartType,
  Position,
  SeriesType,
  ShelveFieldType,
  ShelveType,
  SymbolType,
  UIChartDataLabelDisplayType,
} from '../option/define/common';
import { OptionGenerator } from '../option/util/option-generator';
import * as _ from 'lodash';
import { Pivot } from '../../../../domain/workbook/configurations/pivot';
import { UIOption } from '../option/ui-option';
import { BaseChart, ChartSelectInfo, PivotTableInfo } from '../base-chart';
import { BaseOption } from '../option/base-option';
import { UIChartFormat } from '../option/ui-option/ui-format';
import { FormatOptionConverter } from '../option/converter/format-option-converter';

@Component({
  selector: 'heatmap-chart',
  template: '<div class="chartCanvas" style="width: 100%; height: 100%; display: block;"></div>'
})
export class HeatMapChartComponent extends BaseChart implements OnInit, AfterViewInit {

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
    protected injector: Injector ) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  // Destroy
  public ngOnDestroy() {
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
    return (((this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.DIMENSION) + this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.TIMESTAMP)) > 0)
      || ((this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.DIMENSION) + this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.TIMESTAMP)) > 0))
      && (this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) > 0 || this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED) > 0)
      && (this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.CALCULATED) == 0)
      && (this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.CALCULATED) == 0)
      && (this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) == 0 && this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP) == 0)
  }

  /**
   * heatmap차트에서만 쓰이는 uiOption설정
   * @param isKeepRange
   */
  public draw(isKeepRange?: boolean): void {

    let colNameList: string[] = [];

    this.data.columns.map((column) => {
      const nameList: string[] = _.split(column.name, CHART_STRING_DELIMITER);

      let sliceList = [];
      // 열에만 dimension1개가 존재하는경우
      if (0 == nameList.indexOf(this.pivot.aggregations[0].alias)) {
        sliceList = _.slice(nameList, 0, this.fieldInfo.rows.length);
      } else {
        sliceList = _.slice(nameList, this.fieldInfo.cols.length);
      }
      colNameList.push(_.join(sliceList, CHART_STRING_DELIMITER));
    });

    colNameList = _.uniq(colNameList);

    this.pivotInfo = new PivotTableInfo(colNameList, colNameList, this.fieldInfo.aggs);

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
      type: ChartType.HEATMAP,
      grid: [OptionGenerator.Grid.bothMode(10, 0, 0, 0, false, true)],
      legend: OptionGenerator.Legend.custom(false, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
      xAxis: [OptionGenerator.Axis.categoryAxis(Position.MIDDLE, null, false, true, true, true)],
      yAxis: [OptionGenerator.Axis.categoryAxis(Position.MIDDLE, null, true, true, true, true)],
      dataZoom: [OptionGenerator.DataZoom.horizontalDataZoom(), OptionGenerator.DataZoom.verticalDataZoom(), OptionGenerator.DataZoom.verticalInsideDataZoom(), OptionGenerator.DataZoom.horizontalInsideDataZoom()],
      tooltip: OptionGenerator.Tooltip.itemTooltip(),
      toolbox: OptionGenerator.Toolbox.hiddenToolbox(),
      brush: OptionGenerator.Brush.selectBrush(),
      series: []
    };
  }

  /**
   * 차트별 시리즈 추가정보
   * - 반드시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertSeriesData(): BaseOption {

    // 시리즈 구성
    this.chartOption.series = [{
      name: _.join(this.fieldInfo.aggs, CHART_STRING_DELIMITER),
      type: SeriesType.HEATMAP,
      data: [],
      itemStyle: OptionGenerator.ItemStyle.auto(),
      label: OptionGenerator.LabelStyle.defaultLabelStyle(false, Position.AUTO),
    }];

    // 시리즈 데이터 설정
    this.chartOption.series[0].data = this.data.columns.map( item => {
      item.selected = false;
      item.itemStyle = OptionGenerator.ItemStyle.opacity1();
      return item;
    });;

    // uiData 설정
    this.chartOption.series[0].uiData = this.data.columns;

    // originData 설정
    this.chartOption.series[0].originData = _.cloneDeep(this.chartOption.series[0].data);

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
   * uiData에 설정될 columns데이터 설정
   */
  protected setUIData(): any {

    _.each(this.data.columns, (data) => {

      // x축 데이터 categoryName에 설정
      const nameList: string[] = _.split(data.name, CHART_STRING_DELIMITER);

      let categoryList = [];
      let seriesList = [];

      // 열에만 dimension1개가 존재하는경우
      if (0 == nameList.indexOf(this.pivot.aggregations[0].alias)) {
        seriesList = nameList.splice(1, this.pivot.rows.length);
      } else {
        // columns 개수만큼 리스트 잘라서 설정
        categoryList = nameList.splice(0, this.pivot.columns.length);
        // rows 개수만큼 리스트 잘라서 설정
        seriesList = nameList.splice(0, this.pivot.rows.length);
      }

      data.categoryName = _.cloneDeep(_.join(_.slice(categoryList, 0, this.pivot.columns.length), CHART_STRING_DELIMITER));

      data.seriesName = _.cloneDeep(_.join(_.slice(seriesList, 0, this.pivot.rows.length), CHART_STRING_DELIMITER));

      // 해당 dataIndex로 설정
      data.seriesValue = _.cloneDeep(data.value[2]);
    });

    return this.data.columns;
  }

  /**
   * 히트맵의 series값으로 설정되는 부분
   */
  protected additionalSeries(): BaseOption {

    // 시리즈 Label 포맷, label 위치
    this.chartOption.series.forEach((series) => {

      // label 포맷
      series.label.normal.formatter = ((params): any => {

        let uiData = _.cloneDeep(series.uiData[params.dataIndex]);

        return this.getFormatHeatmapValueSeries(params, this.uiOption.valueFormat, this.uiOption, series, uiData);
      });
    });

    return this.chartOption;
  }

  /**
   * 히트맵차트의 tooltip 추가정보 설정
   */
  protected additionalTooltip(): BaseOption {

    // 축포맷이 아닌 기존 포맷으로 tooltip 설정
    this.chartOption.tooltip.formatter = ((params): any => {

      let option = this.chartOption.series[params.seriesIndex];

      let uiData = _.cloneDeep(option.uiData);
      // uiData값이 array인 경우 해당 dataIndex에 해당하는 uiData로 설정해준다
      if (uiData && uiData instanceof Array) uiData = option.uiData[params.dataIndex];

      return this.getFormatHeatmapValueSeriesTooltip(params, this.uiOption.valueFormat, this.uiOption, option, uiData);
    });

    return this.chartOption;
  }

  /**
   * heatmap 차트별 X축 정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertXAxisData(): BaseOption {

    ////////////////////////////////////////////////////////
    // 차트 데이터를 기반으로 X축 생성
    ////////////////////////////////////////////////////////

    // X축 명칭
    let xAxisName = this.uiOption.xAxis.customName ? this.uiOption.xAxis.customName : _.join(this.fieldInfo.cols, CHART_STRING_DELIMITER);
    this.chartOption.xAxis[0].name = xAxisName;
    this.chartOption.xAxis[0].axisName = _.join(this.fieldInfo.cols, CHART_STRING_DELIMITER);

    ////////////////////////////////////////////////////////
    // 차트 데이터를 기반으로 X축 데이터 생성
    ////////////////////////////////////////////////////////

    this.data.columns.map((column) => {
      const nameList: string[] = _.split(column.name, CHART_STRING_DELIMITER);

      let sliceList = [];
      // 열에만 dimensions들이 있는경우
      if (0 == nameList.indexOf(this.pivot.aggregations[0].alias)) {
        sliceList = _.slice(nameList, 0, 1);
      } else {
        sliceList = _.slice(nameList, 0, this.fieldInfo.cols.length);
      }
      this.chartOption.xAxis[0].data.push(_.join(sliceList, CHART_STRING_DELIMITER));
    });
    this.chartOption.xAxis[0].data = _.uniq(this.chartOption.xAxis[0].data);

    return this.chartOption;
  }

  /**
   * heatmap 차트별 Y축 정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertYAxisData(): BaseOption {

    ////////////////////////////////////////////////////////
    // 차트 데이터를 기반으로 Y축 생성
    ////////////////////////////////////////////////////////

    // Y축 명칭
    let yAxisName = this.uiOption.yAxis.customName ? this.uiOption.yAxis.customName : _.join(this.fieldInfo.rows, CHART_STRING_DELIMITER);
    this.chartOption.yAxis[0].name = yAxisName;
    this.chartOption.yAxis[0].axisName = _.join(this.fieldInfo.rows, CHART_STRING_DELIMITER);

    ////////////////////////////////////////////////////////
    // 차트 데이터를 기반으로 Y축 데이터 생성
    ////////////////////////////////////////////////////////

    // Y축 데이터
    this.data.columns.map((column) => {
      const nameList: string[] = _.split(column.name, CHART_STRING_DELIMITER);

      let sliceList = [];
      // 열에만 dimension1개가 존재하는경우
      if (0 == nameList.indexOf(this.pivot.aggregations[0].alias)) {
        sliceList = _.slice(nameList, 1, this.fieldInfo.rows.length + 1);
      } else {
        sliceList = _.slice(nameList, this.fieldInfo.cols.length);
      }

      this.chartOption.yAxis[0].data.push(_.join(sliceList, CHART_STRING_DELIMITER));
    });
    this.chartOption.yAxis[0].data = _.uniq(this.chartOption.yAxis[0].data);

    // 차트옵션 반환
    return this.chartOption;
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * scatter tooltip 설정
   */
  private getFormatHeatmapValueSeriesTooltip(params: any, format: UIChartFormat, uiOption?: UIOption, series?: any, uiData?: any): string {

    // UI 데이터 정보가 있을경우
    if( uiData ) {

      if (!uiOption.toolTip) uiOption.toolTip = {};
      if (!uiOption.toolTip.displayTypes) uiOption.toolTip.displayTypes = FormatOptionConverter.setDisplayTypes(uiOption.type);

      // UI 데이터 가공
      let result: string[] = [];

      if( uiData['categoryName'] && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_NAME) ){

        let categoryNameList = _.split(uiData['categoryName'], CHART_STRING_DELIMITER);

        // category Name List 설정
        result = FormatOptionConverter.getTooltipName(categoryNameList, this.pivot.columns, result, true);
      }
      if( uiData['seriesName'] && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_NAME) ){

        let seriesNameList = _.split(uiData['seriesName'], CHART_STRING_DELIMITER);

        // series Name List 설정
        result = FormatOptionConverter.getTooltipName(seriesNameList, this.pivot.rows, result, true);
      }
      if( uiData['seriesValue'] && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE) ){

        let seriesValue = FormatOptionConverter.getTooltipValue(params.seriesName, this.pivot.aggregations, this.uiOption.valueFormat, uiData['seriesValue']);

        result.push(seriesValue);
      }

      return result.join('<br/>');
    }

    return FormatOptionConverter.noUIDataFormatTooltip(uiOption, params, format, this.fieldInfo);
  }

  /**
   * 히트맵 데이터라벨 설정
   * @param params
   * @param format
   * @param uiOption
   * @param option
   * @param uiData
   * @returns {string}
   */
  private getFormatHeatmapValueSeries(params, format: UIChartFormat, uiOption: UIOption, series?: any, uiData?: any): string {

    // UI 데이터 정보가 있을경우
    if( uiData ) {

      if (!uiOption.dataLabel || !uiOption.dataLabel.displayTypes) return '';

      // UI 데이터 가공
      let isUiData: boolean = false;
      let result: string[] = [];
      // 해당 dataIndex 데이터애로 뿌려줌
      if( uiData['categoryName'] && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_NAME) ){
        // category Name List 설정
        let categoryNameList = _.split(uiData['categoryName'], CHART_STRING_DELIMITER);
        result = FormatOptionConverter.getTooltipName(categoryNameList, this.pivot.columns, result, false);
        isUiData = true;
      }
      if( -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_NAME) ){

        let seriesNameList = _.split(uiData['seriesName'], CHART_STRING_DELIMITER);
        result = FormatOptionConverter.getTooltipName(seriesNameList, this.pivot.rows, result, false);
        isUiData = true;
      }
      if(  -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE) ){

        result.push(FormatOptionConverter.getFormatValue(uiData['seriesValue'], format));
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
    return FormatOptionConverter.noUIDataFormat(params, format);
  }
}
