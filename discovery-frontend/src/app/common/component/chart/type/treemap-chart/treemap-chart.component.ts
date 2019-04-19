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
 * Created by Dolkkok on 2017. 9. 5..
 */

import { AfterViewInit, Component, ElementRef, Injector, OnInit } from '@angular/core';
import {
  CHART_STRING_DELIMITER,
  ChartColorList,
  ChartColorType,
  ChartSelectMode,
  ChartType,
  ColorCustomMode,
  SeriesType,
  ShelveFieldType,
  ShelveType,
  UIChartDataLabelDisplayType,
  UIPosition
} from '../../option/define/common';
import { OptionGenerator } from '../../option/util/option-generator';
import * as _ from 'lodash';
import { Pivot } from '../../../../../domain/workbook/configurations/pivot';
import { BaseOption } from '../../option/base-option';
import { BaseChart, ChartSelectInfo, PivotTableInfo } from '../../base-chart';
import { UIChartFormat } from '../../option/ui-option/ui-format';
import { UIChartColorBySeries, UIOption } from '../../option/ui-option';
import { FormatOptionConverter } from '../../option/converter/format-option-converter';
import { Series } from '../../option/define/series';
import { UIChartDataLabel } from '../../option/ui-option/ui-datalabel';
import { Field } from '../../../../../domain/workbook/configurations/field/field';
import { UIChartColor, UIChartColorByValue, UIChartColorGradationByValue } from '../../option/ui-option/ui-color';
import { ColorOptionConverter } from '../../option/converter/color-option-converter';
import Tooltip = OptionGenerator.Tooltip;

@Component({
  selector: 'treemap-chart',
  templateUrl: 'treemap-chart.component.html',
})
export class TreeMapChartComponent extends BaseChart implements OnInit, AfterViewInit {

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
    return (this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.DIMENSION) == 1 && this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.TIMESTAMP) == 0 )
      && ((this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) + this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED)) == 1)
      && (this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.CALCULATED) == 0)
      && (this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.CALCULATED) == 0)
      && (this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) == 0 && this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP) == 0)
  }

  /**
   * bar차트에서만 쓰이는 uiOption설정
   * @param isKeepRange
   */
  public draw(isKeepRange?: boolean): void {

    // pivot cols 초기화
    const cols: string[] = this.data.columns.map((column) => {
      return column.name;
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
/*
    this.chart.on('click', (params) => {

      let selectMode: ChartSelectMode;
      let selectedColValues: string[];
      let selectedRowValues: string[];

      // 데이터가 아닌 빈 공백을 클릭했다면
      // 모든 데이터 선택효과를 해제하며 필터에서 제거.
      if ((this.isSelected && _.isNull(params)) || !params.data) {
        selectMode = ChartSelectMode.CLEAR;

        // 차트에서 선택한 데이터가 없음을 설정
        this.isSelected = false;
      } else if (params != null) {

        // 파라미터의 데이터
        const paramsData = params.data;

        // 차트를 클릭시 select mode, 하위 라벨 클릭시 unselect mode
        const isSelectMode = !_.isUndefined(paramsData);

        if (isSelectMode) {
          // 선택 처리 (하위 데이터가 있는경우 drill down이 되어버리면 소용이 없으므로 설정 x)
          selectMode = ChartSelectMode.ADD;
        } else {
          // 선택 해제 (하위 데이터가 있는경우 drill down이 되어버리면 소용이 없으므로 설정 x)
          selectMode = ChartSelectMode.SUBTRACT;
        }

        // 차트에서 선택한 데이터 존재 여부 설정
        this.isSelected = isSelectMode;

        // UI에 전송할 선택정보 설정
        if (1 === paramsData.depth) {

          selectedColValues = _.split(params.name, CHART_STRING_DELIMITER);
        } else {
          selectedRowValues = [params.name];
        }

      } else {
        return;
      }

      // UI에 전송할 선택정보 설정
      const selectData = this.setSelectData(params, selectedColValues, selectedRowValues);

      // 이벤트 데이터 전송
      this.params['selectType'] = 'SINGLE';
      this.chartSelectInfo.emit(new ChartSelectInfo(selectMode, selectData, this.params));
    });
*/
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
      type: ChartType.TREEMAP,
      tooltip: Tooltip.itemTooltip(),
      series: []
    };
  }

  /**
   * 차트별 시리즈 추가정보
   * - 반드시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertSeriesData(): BaseOption {

    // data가 1개 이상인경우 children으로 묶어주기
    let value = this.data.columns[0].value;

    // 시리즈 설정
    this.chartOption.series = [{
      name: String(ChartType.TREEMAP),
      type: SeriesType.TREEMAP,
      width: '60%',
      height: '60%',
      data: value,
      uiData: this.data.columns[0],
      leafDepth: 1,
    }];

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
   * treemap 시리즈 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalSeries(): BaseOption {

    // 레이블 정렬 설정
    this.chartOption = this.convertTreemapLabelAlign(this.chartOption, this.uiOption);

    // 포메터 설정
    this.chartOption = this.convertTreemapFormatSeries(this.chartOption, this.uiOption);

    // 색상 설정
    this.chartOption = this.convertTreemapColor(this.chartOption, this.uiOption);

    // 차트옵션 반환
    return this.chartOption;
  }

  /**
   * 레이블 정렬
   * @param chartOption
   * @param uiOption
   */
  private convertTreemapLabelAlign(chartOption: BaseOption, uiOption: UIOption): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    let label: UIChartDataLabel = uiOption.dataLabel;

    if (!label) return this.chartOption;

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 시리즈
    let series: Series[] = chartOption.series;

    if (!label.hAlign) label.hAlign = UIPosition.CENTER;
    if (!label.vAlign) label.vAlign = UIPosition.CENTER;

    let hAlign: string = '';
    switch (label.hAlign) {
      case UIPosition.LEFT:
        hAlign = 'Left';
        break;
      case UIPosition.CENTER:
        hAlign = '';
        break;
      case UIPosition.RIGHT:
        hAlign = 'Right';
        break;
    }

    let vAlign: string = '';
    switch (label.vAlign) {
      case UIPosition.TOP:
        vAlign = 'Top';
        break;
      case UIPosition.CENTER:
        vAlign = '';
        break;
      case UIPosition.BOTTOM:
        vAlign = 'Bottom';
        break;
    }

    const align = 'inside' + vAlign + hAlign;

    // 적용
    _.each(series, (option) => {

      // 적용
      if( _.isUndefined(option.label) ) { option.label = {normal: {}} }

      option.label.normal.position = <any>align;
    });

    // 반환
    return chartOption;
  }

  /**
   * treemap 툴팁 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalTooltip(): BaseOption {

    this.chartOption.tooltip.formatter = ((params): any => {

      let option = this.chartOption.series[params.seriesIndex];

      let uiData = _.cloneDeep(option.uiData);
      // uiData값이 array인 경우 해당 dataIndex에 해당하는 uiData로 설정해준다
      if (uiData && uiData instanceof Array) uiData = option.uiData[params.dataIndex];

      return this.getFormatTreemapValueTooltip(params, this.uiOption, this.fieldInfo, this.uiOption.valueFormat, option, uiData);
    });

    // 차트옵션 반환
    return this.chartOption;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Series: 포맷에 해당하는 옵션을 모두 적용한다.
   * @param chartOption
   * @param uiOption
   * @returns {BaseOption}
   */
  private convertTreemapFormatSeries(chartOption: BaseOption, uiOption: UIOption): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    let format: UIChartFormat = uiOption.valueFormat;
    if (_.isUndefined(format)){ return chartOption }

    // 축의 포멧이 있는경우 축의 포멧으로 설정
    const axisFormat = FormatOptionConverter.getlabelAxisScaleFormat(uiOption);
    if (axisFormat) format = axisFormat;

    ///////////////////////////
    // 차트 옵션에 적용
    // - 시리즈
    ///////////////////////////

    // 시리즈
    let series: Series[] = chartOption.series;

    // 적용
    _.each(series, (option) => {

      if( _.isUndefined(option.label) ) { option.label = { normal: {} }; }
      if( _.isUndefined(option.label.normal) ) { option.label.normal = {} }

      // 적용
      option.label.normal.formatter = ((params): any => {

        let uiData = _.cloneDeep(option.uiData);
        // uiData값이 array인 경우 해당 dataIndex에 해당하는 uiData로 설정해준다
        if (uiData && uiData instanceof Array) uiData = option.uiData[params.dataIndex];

        return this.getFormatTreemapValueSeries(params, format, uiOption, option, uiData);
      });
    });

    // 반환
    return chartOption;
  }

  /**
   * 트리맵의 포멧레이블 설정
   * @param params
   * @param format
   * @param uiOption
   * @param series
   * @param uiData
   * @returns {any}
   */
  private getFormatTreemapValueSeries(params: any, format: UIChartFormat, uiOption?: UIOption, series?: any, uiData?: any): string {

    // UI 데이터 정보가 있을경우
    if( uiData ) {

      if (!uiOption.dataLabel || !uiOption.dataLabel.displayTypes) return '';

      // UI 데이터 가공
      let isUiData: boolean = false;
      let result: string[] = [];
      if( -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_NAME) ){

        result.push(params.name);
        isUiData = true;
      }
      if ( -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE) ) {
        result.push(FormatOptionConverter.getFormatValue(params.value, format));
        isUiData = true;
      }

      if ( -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT) ) {
        let value = params.data.percentage;
        value = Math.floor(Number(value) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal);
        result.push(value +'%');
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
            // label += '{treemapAlign|'+ result[num] +'}';
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

    return FormatOptionConverter.noUIDataFormat(params, format);
  }

  /**
   * 트리맵의 포멧툴팁 설정
   * @param params
   * @param format
   * @param uiOption
   * @param series
   * @param uiData
   * @returns {any}
   */
  private getFormatTreemapValueTooltip(params: any, uiOption: UIOption, fieldInfo: PivotTableInfo, format: UIChartFormat, series?: any, uiData?: any): string {

    // UI 데이터 정보가 있을경우
    if( uiData ) {

      if (!uiOption.toolTip) uiOption.toolTip = {};
      if (!uiOption.toolTip.displayTypes) uiOption.toolTip.displayTypes = FormatOptionConverter.setDisplayTypes(uiOption.type);

      // UI 데이터 가공
      let result: string[] = [];
      if( -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_NAME) ){

        let pivotTarget: Field[] = [];

        // 1depth의 경우 columns에서 선반 target 설정
        if (1 == params.data.depth) {
          pivotTarget = this.pivot.columns;

        // 2depth이후의 경우 rows에서 선반 target 설정
        } else {
          pivotTarget = this.pivot.rows;
        }

        result = FormatOptionConverter.getTooltipName([params.name], pivotTarget, result, true);
      }
      if ( -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE) ) {

        let seriesValueName = this.pivot.aggregations[0].alias;
        let seriesValue = FormatOptionConverter.getTooltipValue(seriesValueName, this.pivot.aggregations, format, params.value);

        // series percent가 있는경우
        if (-1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT)) {
          let value = Math.floor(Number(params.data.percentage) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal);

          seriesValue += ' (' + value + '%)';
        }

        result.push(seriesValue);
      }

      if ( -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT) ) {

        // series value가 선택된지 않은경우
        if (-1 == uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE)) {

          let seriesValueName = this.pivot.aggregations[0].alias;
          let seriesValue = FormatOptionConverter.getTooltipValue(seriesValueName, this.pivot.aggregations, format, params.data.percentage);

          seriesValue += '%';

          result.push(seriesValue);
        }
      }

      return result.join("<br/>");
    }

    return FormatOptionConverter.noUIDataFormatTooltip(uiOption, params, format, fieldInfo);
  }

  /**
   * treemap 색상 설정
   */
  private convertTreemapColor(chartOption: BaseOption, uiOption: UIOption): BaseOption {

    const color: UIChartColor = uiOption.color;

    if (!color) return chartOption;

    switch (color.type) {
      case ChartColorType.DIMENSION: {

        // visualMap 제거
        delete chartOption.visualMap;

        const depthValue = this.pivot.columns.length + this.pivot.rows.length;

        const colorAlpha = [
          0.3,
          1
        ];

        let levels = [];

        for (let index = 0; index <= depthValue; index++) {
          levels.push({colorAlpha: colorAlpha, visualMin: 0});
        }

        let schema = (<UIChartColorBySeries>this.uiOption.color).schema;
        let codes = _.cloneDeep(ChartColorList[schema]);

        // series안에 depth의 개수만큼 levels리스트에 colorAlpha 적용
        _.each(chartOption.series, (option) => {

          // 색상설정 func 제거
          option.itemStyle.normal.color = null;
          option.data.map((data, index) => {

            if (!data.itemStyle || !data.itemStyle.normal) data.itemStyle = {normal: {}};
            data.itemStyle.normal.color = codes[index % codes.length];
          });

          option['levels'] = levels;
        });

        break;
      }
      case ChartColorType.MEASURE: {

        // gradation일때
        if (uiOption.color['customMode'] && ColorCustomMode.GRADIENT == uiOption.color['customMode']) {

          chartOption = ColorOptionConverter.convertColorByValueGradation(chartOption, uiOption);
          // 그이외의 경우일떄
        } else {
          chartOption = ColorOptionConverter.convertColorByValue(chartOption, uiOption);
        }
        break;

      }
    }

    return chartOption;
  }
}
