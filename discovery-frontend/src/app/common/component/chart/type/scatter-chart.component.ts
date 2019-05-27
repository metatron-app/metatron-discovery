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
  AxisType,
  CHART_STRING_DELIMITER, ChartColorType, ChartPivotType, ChartSelectMode, ChartType, PointShape, Position,
  SeriesType,
  ShelveFieldType,
  ShelveType,
  SymbolType, UIChartDataLabelDisplayType
} from '../option/define/common';
import { OptionGenerator } from '../option/util/option-generator';
import * as _ from 'lodash';
import optGen = OptionGenerator;
import {
  UIChartAxis, UIChartAxisLabelValue,
  UIChartColorByDimension, UIOption
} from '../option/ui-option';
import { Pivot } from 'app/domain/workbook/configurations/pivot';
import { BaseChart, ChartSelectInfo, PivotTableInfo } from '../base-chart';
import { BaseOption } from '../option/base-option';
import { UIScatterChart } from '../option/ui-option/ui-scatter-chart';
import { FormatOptionConverter } from '../option/converter/format-option-converter';
import { UIChartFormat } from '../option/ui-option/ui-format';
import {UIChartAxisGrid} from "../option/ui-option/ui-axis";
import {AxisOptionConverter} from "../option/converter/axis-option-converter";
import {Axis} from "../option/define/axis";
import {DataZoomType} from '../option/define/datazoom';

@Component({
  selector: 'scatter-chart',
  template: '<div class="chartCanvas" style="width: 100%; height: 100%; display: block;"></div>'
})
export class ScatterChartComponent extends BaseChart implements OnInit, AfterViewInit {

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
    return ((this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.MEASURE) + this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.CALCULATED)) == 1)
      && ((this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.MEASURE) + this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.CALCULATED)) == 1)
      && ((this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) + this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP)) > 0)
      && (this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.DIMENSION) == 0 && this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.TIMESTAMP) == 0)
      && (this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.DIMENSION) == 0 && this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.TIMESTAMP) == 0)
      && (this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED) == 0);
  }

  /**
   * draw
   * @param isKeepRange
   */
  public draw(isKeepRange?: boolean): void {

    // 스케터차트의 경우 aggs값에 dimension타입이 들어가므로 따로 fieldInfo의 aggs값 설정
    this.fieldInfo.aggs = this.pivot.aggregations.map((item) => {
      return !_.isEmpty(item.alias) ? item.alias : item.name;
    });

    const symbolNameList = this.data.columns.map((column) => {
      return column.name;
    });

    this.pivotInfo = new PivotTableInfo([], [], symbolNameList);

    super.draw(isKeepRange);
  }

  /**
   * Chart Click Event Listener
   *
   */
  public addChartMultiSelectEventListener(): void {
    this.chart.off('brushDragEnd');
    this.chart.on('brushDragEnd', (params) => {

      let selectDataList = [];

      const selectedBrushData: any = params.brushSelectData[0].selected;

      // 선택된값이 없는경우
      if (!selectedBrushData.some(item => item.dataIndex && 0 < item.dataIndex.length)) {
        // 브러쉬 영역 삭제
        this.chart.clearBrush();
        return;
      }

      // 브러쉬 영역 삭제
      this.chart.clearBrush();

      // 선택효과 처리
      this.chartOption = this.selectionAdd(this.chartOption, selectedBrushData, true);

      // 열 선반 데이터 요소
      const cols = this.pivotInfo.cols;
      // 교차선반 데이터 요소 ( scatter )
      const aggs = this.pivotInfo.aggs;

      // UI에 전송할 선택정보 설정
      selectedBrushData.map((selected) => {
        // 해당 시리즈의 선택한 데이터 인덱스 모음
        const colIdxList = selected.dataIndex;
        colIdxList.map((colIdx) => {
          // 열 혹은 교차선반의 필드명과 데이터를 맵핑
          const dataName = !_.isEmpty(cols) ? cols[colIdx] : aggs[colIdx];

          _.each(_.split(dataName, CHART_STRING_DELIMITER), (name, idx) => {

            // filter관련 데이터 변경
            const shelveData = !_.isEmpty(cols) ? this.pivot.columns[idx] : this.pivot.aggregations[idx];

            // selectDataList에 해당 name의 값이 없을때
            if (-1 === _.findIndex(selectDataList, (obj) => { return obj.name === shelveData.name; })) {

              // selectDataList에 추가
              selectDataList.push(shelveData);
            }

            // 기존데이터에 신규데이터 추가
            selectDataList[idx].data = _.union(selectDataList[idx].data, [name]);
          });
        });

      });

      // 자기자신을 선택시 externalFilters는 false로 설정
      if (this.params.externalFilters) this.params.externalFilters = false;

      // 차트에 적용
      this.apply(false);
      this.lastDrawSeries = _.cloneDeep(this.chartOption['series']);

      // 이벤트 데이터 전송
      this.params['selectType'] = 'MULTI';
      this.chartSelectInfo.emit(new ChartSelectInfo(ChartSelectMode.ADD, selectDataList, this.params));
    });
  }

  /**
   * Chart Legend Select Event Listener
   *
   */
  public addLegendSelectEventListener(): void {
    this.chart.off('legendselectchanged');
    this.chart.on('legendselectchanged', (params) => {
      // 시리즈와 연동없이 구성된 범레 일때만 처리
      if (!this.chartOption.legend.seriesSync) {
        // series 데이터
        const series = this.chartOption.series;

        // 선택한 범례항목 정보
        const selectedName = params.name;
        const isSelected = params.selected[selectedName];

        // 열/행의 선반에서의 필드 인덱스
        let fieldIdx: number;
        // 열/행/교차 여부
        let pivotType: any;


        if (_.eq(this.uiOption.color.type, ChartColorType.DIMENSION)) {
          const targetField = (<UIChartColorByDimension>this.uiOption.color).targetField;
          // 열/행/교차 여부 및 몇번째 필드인지 확인
          _.forEach(this.fieldOriginInfo, (value, key) => {
            if (_.indexOf(value, targetField) > -1) {
              fieldIdx = _.indexOf(value, targetField);
              pivotType = _.eq(key, ChartPivotType.COLS) ? ChartPivotType.COLS : _.eq(key, ChartPivotType.ROWS) ? ChartPivotType.ROWS : ChartPivotType.AGGS;
            }
          });
        } else if (_.eq(this.uiOption.color.type, ChartColorType.SERIES)) {
          // color by measure 일때
          pivotType = ChartPivotType.AGGS;
        }

        // series 를 돌면서 각 시리즈 데이터의 내용을 수정
        // show : 해당 범례에 해당하는 데이터를 원래 값으로 처리
        // hide : 해당 범례에 해당하는 데이터를 null처리
        // color by dimension 일때
        series.map((obj) => {
          obj.data.map((valueData, idx) => {
            // 선택한 범례와 동일한지 비교할 데이터의 이름
            let compareName = _.split(valueData.name, CHART_STRING_DELIMITER)[fieldIdx];

            if (_.eq(compareName, selectedName)) {
              if (_.isObject(valueData)) {
                const originValue = _.isUndefined(obj.originData[idx].value) ? obj.originData[idx] : obj.originData[idx].value;
                obj.data[idx].value = isSelected ? originValue : null;
              } else {
                obj.data[idx] = isSelected ? obj.originData[idx] : null;
              }
            }
          });
          return obj;
        });

        // 차트에 적용
        this.apply(false);
      }
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
      type: ChartType.SCATTER,
      grid: [OptionGenerator.Grid.bothMode(10, 0, 0, 0, false, true)],
      legend: OptionGenerator.Legend.custom(false, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
      xAxis: [OptionGenerator.Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
      yAxis: [OptionGenerator.Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
      dataZoom: [OptionGenerator.DataZoom.horizontalDataZoom(), OptionGenerator.DataZoom.verticalDataZoom(),
                 OptionGenerator.DataZoom.verticalInsideDataZoom(), OptionGenerator.DataZoom.horizontalInsideDataZoom()],
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
      type: SeriesType.SCATTER,
      large: true,
      largeThreshold: 5000,
      data: [],
      symbolSize: 15,
      symbol: String((<UIScatterChart>this.uiOption).pointShape),
      itemStyle: optGen.ItemStyle.auto(),
      label: optGen.LabelStyle.defaultLabelStyle(false, Position.TOP),
    }];

    // 시리즈 데이터 설정
    this.chartOption.series[0].data = this.data.columns.map( item => {
      item.selected = false;
      item.itemStyle = optGen.ItemStyle.opacity1();
      return item;
    });

    // uiData 설정
    this.chartOption.series[0].uiData = this.data.columns;

    // originData 설정
    this.chartOption.series[0].originData = _.cloneDeep(this.chartOption.series[0].data);

    return this.chartOption;
  }

  /**
   * 바차트의 series값으로 설정되는 부분
   */
  protected additionalSeries(): BaseOption {

    // 심볼 불투명/반투명 변경
    this.chartOption = this.symbolFill();

    // 심볼 모양 변경
    this.chartOption = this.symbolType();

    // label 설정
    this.chartOption.series.forEach((series) => {
      // label 포맷
      series.label.normal.formatter = ((params): any => {

        let option = this.chartOption.series[params.seriesIndex];

        let uiData = _.cloneDeep(option.uiData);
        // uiData값이 array인 경우 해당 dataIndex에 해당하는 uiData로 설정해준다
        if (uiData && uiData instanceof Array) uiData = option.uiData[params.dataIndex];

        return this.getFormatScatterValueSeries(params, this.uiOption.valueFormat, this.uiOption, series, uiData);
      });
    });

    return this.chartOption;
  }

  /**
   * 스케터차트의 tooltip 추가정보 설정
   */
  protected additionalTooltip(): BaseOption {

    // 축포맷이 아닌 기존 포맷으로 tooltip 설정
    this.chartOption.tooltip.formatter = ((params): any => {

      let option = this.chartOption.series[params.seriesIndex];

      let uiData = _.cloneDeep(option.uiData);
      // uiData값이 array인 경우 해당 dataIndex에 해당하는 uiData로 설정해준다
      if (uiData && uiData instanceof Array) uiData = option.uiData[params.dataIndex];

      return this.getFormatScatterValueSeriesTooltip(params, this.uiOption.valueFormat, this.uiOption, option, uiData);
    });

    return this.chartOption;
  }

  /**
   * 셀렉션 이벤트를 등록한다.
   * - 필요시 각 차트에서 Override
   */
  protected selection(): void {
    this.addChartSelectEventListener();
    this.addChartMultiSelectEventListener();
    this.addLegendSelectEventListener();
  }

  /**
   * 차트별 줌관련 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalDataZoom(): BaseOption {
    return this.chartOption;
  }

  /**
   * 차트별 X축 정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertXAxisData(): BaseOption {

    const xAxis = this.fieldInfo.cols;

    let xAxisName = this.uiOption.xAxis.customName ? this.uiOption.xAxis.customName : _.join(xAxis, CHART_STRING_DELIMITER);

    this.chartOption.xAxis[0].name = xAxisName;
    // 여기는 기존 axisName으로 설정필요
    this.chartOption.xAxis[0].axisName = _.join(xAxis, CHART_STRING_DELIMITER);

    return this.chartOption;
  }

  /**
   * 차트별 Y축 정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertYAxisData(): BaseOption {

    const yAxis = this.fieldInfo.rows;

    let yAxisName = this.uiOption.yAxis.customName ? this.uiOption.yAxis.customName : _.join(yAxis, CHART_STRING_DELIMITER);

    this.chartOption.yAxis[0].name = yAxisName;
    // 여기는 기존 axisName으로 설정필요
    this.chartOption.yAxis[0].axisName = _.join(yAxis, CHART_STRING_DELIMITER);

    return this.chartOption;
  }

  /**
   * scatter차트의 uiData 설정
   */
  protected setUIData(): any {

    // rows 축의 개수만큼 넣어줌
    _.each(this.data.columns, (data, index) => {
      // console.info(data);
      // console.info(this.originalData.columns[index]);
      data.seriesName = _.cloneDeep(data.name);
      //data.xAxisValue = _.cloneDeep(data.value[0]);
      //data.yAxisValue = _.cloneDeep(data.value[1]);
      data.xAxisValue = _.cloneDeep(this.originalData.columns[index].value[0]);
      data.yAxisValue = _.cloneDeep(this.originalData.columns[index].value[1]);
    });

    return this.data.columns;
  }

  protected calculateBaseline(baseline: number, result: any, isYAsis: boolean): void {

    // 멀티시리즈 개수를 구한다.
    let seriesList = [];
    result.data.columns.map((column, index) => {
      let nameArr = _.split(column.name, CHART_STRING_DELIMITER);
      let name = "";
      if( nameArr.length > 1 ) {
        nameArr.map((temp, index) => {
          if( index < nameArr.length - 1 ) {
            if( index > 0 ) {
              name += CHART_STRING_DELIMITER;
            }
            name += temp;
          }
        });
      }
      else {
        name = nameArr[0];
      }

      let isAlready = false;
      seriesList.map((series, index) => {
        if( series == name ) {
          isAlready = true;
          return false;
        }
      });

      if( !isAlready ) {
        seriesList.push(name);
      }
    });

    // Value값을 마이너스 처리
    if( !result.data.categories || result.data.categories.length == 0 ) {
      result.data.columns.map((column, index) => {
        column.value.map((value, index) => {
          if( (isYAsis && index == 1) || (!isYAsis && index == 0) ) {
            if( value > 0 ) {
              column.value[index] = value - baseline;
            }
            else {
              column.value[index] = (Math.abs(value) + Math.abs(baseline)) * -1;
            }
          }
        });
      });
    }
    else {
      let categoryVal = [];
      let categoryPer = [];
      for( let num = 0 ; num < result.data.categories.length ; num++ ) {

        let category = result.data.categories[num];
        for( let num2 = 0 ; num2 < category.value.length ; num2++ ) {

          let value = category.value[num2];
          let index = (num * category.value.length) + num2;
          let baselineGap = Math.abs(value - baseline);
          let baselinePer = baselineGap / Math.abs(value);
          categoryVal[index] = value;
          categoryPer[index] = baselinePer;
        }
      }

      result.data.columns.map((column, index) => {
        column.value.map((value, index) => {
          if( (isYAsis && index == 1) || (!isYAsis && index == 0) ) {
            if (categoryVal[index] < baseline) {
              column.value[index] = (Math.abs(value) * categoryPer[index]) * -1;
            }
            else {
              column.value[index] = Math.abs(value) * categoryPer[index];
            }
          }
        });
      });
    }
  }

  /**
   * Chart Datazoom Event Listener
   */
  public addChartDatazoomEventListener(): void {

    this.chart.off('datazoom');
    this.chart.on('datazoom', (param) => {

      this.chartOption.dataZoom.map((zoom, index) => {

        if( _.eq(zoom.type, DataZoomType.SLIDER)
            && !_.isUndefined(param)
            && !_.isUndefined(param.dataZoomId)
            && param.dataZoomId.indexOf(index) != -1 ) {
          this.uiOption.chartZooms[index].start = param.start;
          this.uiOption.chartZooms[index].end = param.end;
        }
      });
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 심볼 불투명/반투명 변경
   * @returns {any}
   */
  private symbolFill(): BaseOption {

    const opacity: number = (<UIScatterChart>this.uiOption).pointTransparency;

    if (!opacity) return this.chartOption;

    const series = this.chartOption.series;

    _.each(series, (obj) => {
      if (_.isUndefined(obj.itemStyle)) obj.itemStyle = optGen.ItemStyle.auto();
      obj.itemStyle.normal.opacity = opacity;
    })
    return this.chartOption;
  }

  /**
   * 심볼 모양 변경
   * @returns {any}
   */
  private symbolType(): BaseOption {

    const type: PointShape = (<UIScatterChart>this.uiOption).pointShape;

    if (!type) return this.chartOption;

    const series = this.chartOption.series;
    _.each(series, (obj) => {
      obj.symbol = <any>type.toString().toLowerCase();
    })

    // visualMap, pieces가 있는경우 해당 type으로 심볼 변경
    const visualMap = this.chartOption.visualMap;
    if (visualMap && visualMap.pieces) {

      visualMap.pieces.forEach((item) => {
        item.symbol = <any>type.toString().toLowerCase();
      })
    }

    return this.chartOption;
  }

  /**
   * scatter tooltip 설정
   */
  private getFormatScatterValueSeries(params: any, format: UIChartFormat, uiOption?: UIOption, series?: any, uiData?: any): string {

    // UI 데이터 정보가 있을경우
    if( uiData ) {

      if (!uiOption.dataLabel || !uiOption.dataLabel.displayTypes) return '';

      // UI 데이터 가공
      let isUiData: boolean = false;

      // UI 데이터 가공
      let result: string[] = [];

      if( uiData['seriesName'] && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_NAME) ){

        const seriesNameList = _.split(uiData['seriesName'], CHART_STRING_DELIMITER);
        result = FormatOptionConverter.getTooltipName(seriesNameList, this.pivot.aggregations, result);
        isUiData = true;
      }
      if ( uiData['xAxisValue'] && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.XAXIS_VALUE) ) {

        const axisFormat = FormatOptionConverter.getlabelAxisScaleFormatTooltip(uiOption, AxisType.X);
        let value = FormatOptionConverter.getFormatValue(uiData['xAxisValue'], axisFormat ? axisFormat : uiOption.valueFormat);
        result.push(value);
        isUiData = true;
      }
      if ( uiData['yAxisValue'] && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.YAXIS_VALUE) ) {

        const axisFormat = FormatOptionConverter.getlabelAxisScaleFormatTooltip(uiOption, AxisType.Y);
        let value = FormatOptionConverter.getFormatValue(uiData['yAxisValue'], axisFormat ? axisFormat : uiOption.valueFormat);
        result.push(value);
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

  /**
   * scatter tooltip 설정
   */
  private getFormatScatterValueSeriesTooltip(params: any, format: UIChartFormat, uiOption?: UIOption, series?: any, uiData?: any): string {

    // UI 데이터 정보가 있을경우
    if( uiData ) {

      if (!uiOption.toolTip) uiOption.toolTip = {};
      if (!uiOption.toolTip.displayTypes) uiOption.toolTip.displayTypes = FormatOptionConverter.setDisplayTypes(uiOption.type);

      // UI 데이터 가공
      let result: string[] = [];

      if( uiData['seriesName'] && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_NAME) ){

        const seriesNameList = _.split(uiData['seriesName'], CHART_STRING_DELIMITER);
        result = FormatOptionConverter.getTooltipName(seriesNameList, this.pivot.aggregations, result, true);
      }
      if ( uiData['xAxisValue'] && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.XAXIS_VALUE) ) {

        const axisFormat = FormatOptionConverter.getlabelAxisScaleFormatTooltip(uiOption, AxisType.X);
        let seriesValue = FormatOptionConverter.getTooltipValue(this.fieldInfo.cols[0], this.pivot.columns, axisFormat ? axisFormat : uiOption.valueFormat, uiData['xAxisValue']);

        result.push(seriesValue);
      }
      if ( uiData['yAxisValue'] && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.YAXIS_VALUE) ) {

        const axisFormat = FormatOptionConverter.getlabelAxisScaleFormatTooltip(uiOption, AxisType.Y);
        let seriesValue = FormatOptionConverter.getTooltipValue(this.fieldInfo.rows[0], this.pivot.rows, axisFormat ? axisFormat : uiOption.valueFormat, uiData['yAxisValue']);

        result.push(seriesValue);
      }

      return result.join('<br/>');
    }

    return FormatOptionConverter.noUIDataFormatTooltip(uiOption, params, format, this.fieldInfo);
  }


  protected calculateMinMax(grid: UIChartAxisGrid, result: any, isYAsis: boolean): void {

    // 스캐터차트는 Override 함으로서 데이터 가공처리를 하지 않음

    // // 축범위 자동설정일 경우
    // if( grid.autoScaled ) {
    //   let min = null;
    //   let max = null;
    //   result.data.columns.map((column, index) => {
    //     column.value.map((value, index) => {
    //       if( index == 1 ) {
    //         if (min == null || value < min) {
    //           min = value;
    //         }
    //         if (max == null || value > max) {
    //           max = value;
    //         }
    //       }
    //     });
    //   });
    // }
    //
    // // Min / Max값이 없다면 수행취소
    // if( ((_.isUndefined(grid.min) || grid.min == 0)
    //   && (_.isUndefined(grid.max) || grid.max == 0)) ) {
    //   return;
    // }
    //
    // // 멀티시리즈 개수를 구한다.
    // let seriesList = [];
    // result.data.columns.map((column, index) => {
    //   let nameArr = _.split(column.name, CHART_STRING_DELIMITER);
    //   let name = "";
    //   if( nameArr.length > 1 ) {
    //     nameArr.map((temp, index) => {
    //       if( index < nameArr.length - 1 ) {
    //         if( index > 0 ) {
    //           name += CHART_STRING_DELIMITER;
    //         }
    //         name += temp;
    //       }
    //     });
    //   }
    //   else {
    //     name = nameArr[0];
    //   }
    //
    //   let isAlready = false;
    //   seriesList.map((series, index) => {
    //     if( series == name ) {
    //       isAlready = true;
    //       return false;
    //     }
    //   });
    //
    //   if( !isAlready ) {
    //     seriesList.push(name);
    //   }
    // });
    //
    // // Min/Max 처리
    // if( !result.data.categories || result.data.categories.length == 0 ) {
    //   result.data.columns.map((column, index) => {
    //     column.value.map((value, index) => {
    //       if( !isYAsis && index == 0 || !index && index == 1 ) {
    //         if( value < grid.min ) {
    //           column.value[index] = grid.min;
    //         }
    //         else if( value > grid.max ) {
    //           column.value[index] = grid.max;
    //         }
    //       }
    //     });
    //   });
    // }
    // else {
    //
    //   _.each(result.data.categories, (category, categoryIndex) => {
    //     let totalValue = [];
    //     let seriesValue = [];
    //     result.data.columns.map((column, index) => {
    //
    //       if( column.name.indexOf(category.name) == -1 ) {
    //         return true;
    //       }
    //
    //       column.value.map((value, index) => {
    //         if( _.isUndefined(totalValue[index]) || isNaN(totalValue[index]) ) {
    //           totalValue[index] = 0;
    //           seriesValue[index] = 0;
    //         }
    //
    //         if( totalValue[index] > grid.max ) {
    //           column.value[index] = 0;
    //         }
    //         else if( totalValue[index] + value > grid.max ) {
    //           if( seriesValue[index] <= 0 ) {
    //             column.value[index] = grid.max;
    //           }
    //           else {
    //             column.value[index] = grid.max - totalValue[index];
    //           }
    //         }
    //         else if( totalValue[index] + value < grid.min ) {
    //           column.value[index] = 0;
    //         }
    //         else if( totalValue[index] < grid.min && totalValue[index] + value > grid.min ) {
    //           column.value[index] = totalValue[index] + value;
    //         }
    //         else {
    //           column.value[index] = value;
    //         }
    //         seriesValue[index] += column.value[index];
    //         totalValue[index] += value;
    //       });
    //     });
    //
    //     // Min값보다 작다면
    //     _.each(totalValue, (value, valueIndex) => {
    //       if( value < grid.min ) {
    //         result.data.columns.map((column, index) => {
    //           column.value.map((value, index) => {
    //             if( index == valueIndex ) {
    //               column.value[index] = 0;
    //             }
    //           });
    //         });
    //       }
    //     });
    //   });
    // }
  }

  /**
   * 차트별 Y축 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalYAxis(): BaseOption {

    // Min / Max값을 재계산한다.
    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    // 축에 해당하는 Axis 옵션
    let axisOption: UIChartAxis[] = AxisOptionConverter.getAxisOption(this.uiOption, AxisType.Y);

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    let axis: Axis[] = this.chartOption[AxisType.Y];

    _.each(axis, (option: Axis, index) => {

      // Value축일 경우
      if ((<UIChartAxisLabelValue>axisOption[index].label) && _.eq((<UIChartAxisLabelValue>axisOption[index].label).type, AxisType.VALUE)
        && axisOption[index].grid) {

        // Min / Max값을 다시 구한다.
        let min = null;
        let max = null;
        let calculateMin = null;
        this.data.columns.map((column, index) => {
          column.value.map((value, index) => {
            if( index == 1 ) {
              if (min == null || value < min) {
                min = value;
              }
              if (max == null || value > max) {
                max = value;
              }
            }
          });
        });

        calculateMin = Math.ceil(min - ((max - min) * 0.05));
        // min = min > 0
        //   ? calculateMin >= 0 ? calculateMin : min
        //   : min;
        max = max;

        // Min / Max 업데이트
        AxisOptionConverter.axisMinMax[AxisType.Y].min = min;
        AxisOptionConverter.axisMinMax[AxisType.Y].max = max;

        // 기준선 변경시
        let baseline = 0;
        if( axisOption[index].baseline && axisOption[index].baseline != 0 ) {
          baseline = <number>axisOption[index].baseline;
        }

        // 축 범위 자동설정이 설정되지 않았고
        // 오토스케일 적용시
        if( baseline == 0 && axisOption[index].grid.autoScaled ) {
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


    // 차트옵션 반환
    return this.chartOption;
  }

  /**
   * 차트별 X축 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalXAxis(): BaseOption {

    // Min / Max값을 재계산한다.
    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    // 축에 해당하는 Axis 옵션
    let axisOption: UIChartAxis[] = AxisOptionConverter.getAxisOption(this.uiOption, AxisType.X);

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    let axis: Axis[] = this.chartOption[AxisType.X];

    _.each(axis, (option: Axis, index) => {

      // Value축일 경우
      if ((<UIChartAxisLabelValue>axisOption[index].label) && _.eq((<UIChartAxisLabelValue>axisOption[index].label).type, AxisType.VALUE)
        && axisOption[index].grid) {

        // Min / Max값을 다시 구한다.
        let min = null;
        let max = null;
        let calculateMin = null;
        this.data.columns.map((column, index) => {
          column.value.map((value, index) => {
            if( index == 0 ) {
              if (min == null || value < min) {
                min = value;
              }
              if (max == null || value > max) {
                max = value;
              }
            }
          });
        });

        calculateMin = Math.ceil(min - ((max - min) * 0.05));
        // min = min > 0
        //   ? calculateMin >= 0 ? calculateMin : min
        //   : min;
        max = max;

        // Min / Max 업데이트
        AxisOptionConverter.axisMinMax[AxisType.X].min = min;
        AxisOptionConverter.axisMinMax[AxisType.X].max = max;

        // 기준선 변경시
        let baseline = 0;
        if( axisOption[index].baseline && axisOption[index].baseline != 0 ) {
          baseline = <number>axisOption[index].baseline;
        }

        // 축 범위 자동설정이 설정되지 않았고
        // 오토스케일 적용시
        if( baseline == 0 && axisOption[index].grid.autoScaled ) {
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


    // 차트옵션 반환
    return this.chartOption;
  }

}
