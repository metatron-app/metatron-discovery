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

import {AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {
  ChartColorList,
  ChartColorType,
  ChartSelectMode,
  ChartType,
  ColorCustomMode, Position,
  SeriesType,
  ShelveFieldType,
  ShelveType,
  UIChartDataLabelDisplayType,
  UIPosition
} from '../option/define/common';
import {OptionGenerator} from '../option/util/option-generator';
import * as _ from 'lodash';
import {Pivot} from '@domain/workbook/configurations/pivot';
import {BaseOption} from '../option/base-option';
import {BaseChart, ChartSelectInfo, PivotTableInfo} from '../base-chart';
import {UIChartFormat} from '../option/ui-option/ui-format';
import {UIChartColorBySeries, UIOption} from '../option/ui-option';
import {FormatOptionConverter} from '../option/converter/format-option-converter';
import {Series} from '../option/define/series';
import {UIChartDataLabel} from '../option/ui-option/ui-datalabel';
import {Field} from '@domain/workbook/configurations/field/field';
import {UIChartColor} from '../option/ui-option/ui-color';
import {ColorOptionConverter} from '../option/converter/color-option-converter';
import Tooltip = OptionGenerator.Tooltip;

@Component({
  selector: 'treemap-chart',
  template: '<div class="chartCanvas" style="width: 100%; height: 100%; display: block;"></div>'
})
export class TreeMapChartComponent extends BaseChart<UIOption> implements OnInit, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _prevTreePath: string[] = [];

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
    return (this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.DIMENSION) === 1 && this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.TIMESTAMP) === 0)
      && ((this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) + this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED)) === 1)
      && (this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.MEASURE) === 0 && this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.CALCULATED) === 0)
      && (this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.MEASURE) === 0 && this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.CALCULATED) === 0)
      && (this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) === 0 && this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP) === 0)
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
    this.chart.on('click', (params) => {

      if (this.userCustomFunction && '' !== this.userCustomFunction && -1 < this.userCustomFunction.indexOf('main')) {
        const strScript = '(' + this.userCustomFunction + ')';
        // ( new Function( 'return ' + strScript ) )();
        try {
          if (eval(strScript)({name: 'SelectionEvent', data: params ? params.name : ''})) {
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      let selectMode: ChartSelectMode;
      let selectedColValues: string[] = [];
      let selectedRowValues: string[] = [];

      // 데이터가 아닌 빈 공백을 클릭했다면
      // 모든 데이터 선택효과를 해제하며 필터에서 제거.
      if (_.isNull(params)) {
        selectMode = ChartSelectMode.CLEAR;
      } else if (params !== null) {
        // UI에 전송할 선택정보 설정
        const currTreePath = params.treePathInfo.map(item => item.name);
        if (this._prevTreePath.length < currTreePath.length) {
          // 선택 처리
          selectMode = ChartSelectMode.ADD;
          currTreePath.forEach((item, idx) => {
            if (idx >= this._prevTreePath.length) {
              if (1 === idx) {
                selectedColValues = [item];
              } else if (2 === idx) {
                selectedRowValues = [item];
              }
            }
          });
        } else {
          // 선택 해제 처리
          selectMode = ChartSelectMode.SUBTRACT;
          this._prevTreePath.forEach((item, idx) => {
            if (idx >= currTreePath.length) {
              if (1 === idx) {
                selectedColValues = [item];
              } else if (2 === idx) {
                selectedRowValues = [item];
              }
            }
          });
        }

        this._prevTreePath = currTreePath;
      } else {
        return;
      }

      // 자기자신을 선택시 externalFilters는 false로 설정
      if (this.params.externalFilters) this.params.externalFilters = false;

      // UI에 전송할 선택정보 설정
      const selectData = this.setSelectData(params, selectedColValues, selectedRowValues);

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
    const value = this.data.columns[0].value;

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

    const label: UIChartDataLabel = uiOption.dataLabel;

    if (!label) return this.chartOption;

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 시리즈
    const series: Series[] = chartOption.series;

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
      if (_.isUndefined(option.label)) {
        option.label = {normal: {}}
      }

      option.label.normal.position = align as Position;
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

      const option = this.chartOption.series[params.seriesIndex];

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
    if (_.isUndefined(format)) {
      return chartOption
    }

    // 축의 포멧이 있는경우 축의 포멧으로 설정
    const axisFormat = FormatOptionConverter.getlabelAxisScaleFormat(uiOption);
    if (axisFormat) format = axisFormat;

    ///////////////////////////
    // 차트 옵션에 적용
    // - 시리즈
    ///////////////////////////

    // 시리즈
    const series: Series[] = chartOption.series;

    // 적용
    _.each(series, (option) => {

      if (_.isUndefined(option.label)) {
        option.label = {normal: {}};
      }
      if (_.isUndefined(option.label.normal)) {
        option.label.normal = {}
      }

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
    if (uiData) {

      if (!uiOption.dataLabel || !uiOption.dataLabel.displayTypes) return '';

      // UI 데이터 가공
      let isUiData: boolean = false;
      const result: string[] = [];
      if (-1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_NAME)) {

        result.push(params.name);
        isUiData = true;
      }
      if (-1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE)) {
        result.push(FormatOptionConverter.getFormatValue(params.value, format));
        isUiData = true;
      }

      if (-1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT)) {
        let value = params.data.percentage;
        value = Math.floor(Number(value) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal);
        result.push(value + '%');
        isUiData = true;
      }

      let label: string = '';

      // UI 데이터기반 레이블 반환
      if (isUiData) {
        for (let num: number = 0; num < result.length; num++) {
          if (num > 0) {
            label += '\n';
          }
          if (series.label && series.label.normal && series.label.normal.rich) {
            label += '{align|' + result[num] + '}';
            // label += '{treemapAlign|'+ result[num] +'}';
          } else {
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
   * @param uiOption
   * @param fieldInfo
   * @param format
   * @param _series
   * @param uiData
   * @returns {any}
   */
  private getFormatTreemapValueTooltip(params: any, uiOption: UIOption, fieldInfo: PivotTableInfo, format: UIChartFormat, _series?: any, uiData?: any): string {

    // UI 데이터 정보가 있을경우
    if (uiData) {

      if (!uiOption.toolTip) uiOption.toolTip = {};
      if (!uiOption.toolTip.displayTypes) uiOption.toolTip.displayTypes = FormatOptionConverter.setDisplayTypes(uiOption.type);

      // UI 데이터 가공
      let result: string[] = [];
      if (-1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_NAME)) {

        let pivotTarget: Field[] = [];

        // 1depth의 경우 columns에서 선반 target 설정
        if (1 === params.data.depth) {
          pivotTarget = this.pivot.columns;

          // 2depth이후의 경우 rows에서 선반 target 설정
        } else {
          pivotTarget = this.pivot.rows;
        }

        result = FormatOptionConverter.getTooltipName([params.name], pivotTarget, result, true);
      }
      if (-1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE)) {

        const seriesValueName = this.pivot.aggregations[0].alias;
        let seriesValue = FormatOptionConverter.getTooltipValue(seriesValueName, this.pivot.aggregations, format, params.value);

        // series percent가 있는경우
        if (-1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT)) {
          const value = Math.floor(Number(params.data.percentage) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal);

          seriesValue += ' (' + value + '%)';
        }

        result.push(seriesValue);
      }

      if (-1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT)) {

        // series value가 선택된지 않은경우
        if (-1 === uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE)) {

          const seriesValueName = this.pivot.aggregations[0].alias;
          let seriesValue = FormatOptionConverter.getTooltipValue(seriesValueName, this.pivot.aggregations, format, params.data.percentage);

          seriesValue += '%';

          result.push(seriesValue);
        }
      }

      return result.join('<br/>');
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

        const levels = [];

        for (let index = 0; index <= depthValue; index++) {
          levels.push({colorAlpha: colorAlpha, visualMin: 0});
        }

        const schema = (this.uiOption.color as UIChartColorBySeries).schema;
        const codes = _.cloneDeep(ChartColorList[schema]);

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
        if (uiOption.color['customMode'] && ColorCustomMode.GRADIENT === uiOption.color['customMode']) {

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
