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
 * Created by Dolkkok on 2017. 7. 18..
 */

import { AfterViewInit, Component, ElementRef, Injector, OnInit } from '@angular/core';
import {
  AxisType,
  CHART_STRING_DELIMITER,
  ChartColorList,
  ChartColorType,
  ChartType,
  ColorCustomMode, EventType,
  LineCornerType,
  LineStyle,
  LineType,
  Position,
  SeriesType,
  ShelveFieldType,
  ShelveType,
  SymbolType,
  UIChartDataLabelDisplayType
} from '../../option/define/common';
import { OptionGenerator } from '../../option/util/option-generator';
import { UIChartColorBySeries, UILineChart, UIOption } from '../../option/ui-option';
import { Series } from '../../option/define/series';
import * as _ from 'lodash';
import { Pivot } from '../../../../../domain/workbook/configurations/pivot';
import { BaseOption } from '../../option/base-option';
import { LineChartSplit } from './line-chart.split';
import { BaseChart } from '../../base-chart';
import { ColorOptionConverter } from '../../option/converter/color-option-converter';
import { AnalysisPredictionService } from '../../../../../page/component/analysis/service/analysis.prediction.service';
import optGen = OptionGenerator;
import Legend = OptionGenerator.Legend;
import Grid = OptionGenerator.Grid;
import Axis = OptionGenerator.Axis;
import DataZoom = OptionGenerator.DataZoom;
import Tooltip = OptionGenerator.Tooltip;
import Brush = OptionGenerator.Brush;
import Toolbox = OptionGenerator.Toolbox;
import {UIChartAxis, UIChartAxisGrid, UIChartAxisLabelValue} from "../../option/ui-option/ui-axis";
import {AxisOptionConverter} from "../../option/converter/axis-option-converter";
import {Axis as AxisDefine} from "../../option/define/axis";
import {DataZoomType} from '../../option/define/datazoom';
import { LabelOptionConverter } from '../../option/converter/label-option-converter';
import { TooltipOptionConverter } from '../../option/converter/tooltip-option-converter';

const transparentSymbolImage: string = 'image://' + window.location.origin + '/assets/images/icon_transparent_symbol.png';

@Component({
  selector: 'line-chart',
  templateUrl: 'line-chart.component.html'
})
export class LineChartComponent extends BaseChart implements OnInit, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 스플릿 옵션
  private split: LineChartSplit = new LineChartSplit();

  // set previous pivot (compare previous pivot, current pivot)
  private prevPivot: Pivot;

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
  constructor(protected elementRef: ElementRef, protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Getter & Setter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Init
   *
   */
  ngOnInit() {
    super.ngOnInit();
  }

  /**
   * ngAfterViewInit
   *
   */
  ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  /**
   * Destory
   *
   */
  ngOnDestroy() {
    super.ngOnDestroy();
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
    return ((this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.DIMENSION) + this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.TIMESTAMP)) > 0)
      && (this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) > 0 || this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED) > 0)
      && (this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.CALCULATED) == 0);
  }

  /**
   * line차트 draw
   * @param isKeepRange
   */
  public draw(isKeepRange?: boolean): void {

    // this.uiOption.split = {
    //   by: this.splitBy[0]['value'],
    //   column: this.columnCount,
    //   row: this.rowCount
    // }

    if (this.split.isSplit(this.uiOption)) {
      this.chartOption = this.split.setSplitData(this.data, this.pivot, this.uiOption, this.chartOption);

      this.apply(false);

    } else {
      // 변경된 pivot값에 따른 fieldInfo 정보 변경
      this.setFieldInfo();

      // 교차선반에 dimension이 있는경우 제거 (selection filter, 범례에서 필요)
      this.pivot = this.editPivotByColorType();

      super.draw(isKeepRange);
    }
  }

  // -----------------------------------------------
  // 고급분석 - 예측선 관련
  // -----------------------------------------------

  /**
   * 고급분석 - 예측선 사용시 라인차트를 그리기 위해서 사용
   */
  public predictionDraw(): void {

    this.draw(true);
  }

  /**
   * Forecast 변경시
   */
  public changeForecast() : void {

    this.chartOption = this.predictionLineLineStyleColorBySeries();
    this.draw(true);
  }

  /**
   * Confidence 변경시
   */
  public changeConfidence() : void {

    this.chartOption = this.predictionLineAreaStyleColorBySeries();
    this.draw(true);
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
      type: ChartType.LINE,
      grid: [Grid.verticalMode(10, 0, 0, 10, false, true, false)],
      xAxis: [Axis.categoryAxis(Position.MIDDLE, null, false, true, true, true)],
      yAxis: [Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
      legend: Legend.custom(false, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
      dataZoom: [DataZoom.horizontalDataZoom(), DataZoom.horizontalInsideDataZoom()],
      tooltip: Tooltip.itemTooltip(),
      toolbox: Toolbox.hiddenToolbox(),
      brush: Brush.selectBrush(),
      series: []
    };
  }

  /**
   * 차트별 시리즈 추가정보
   * - 반드시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertSeriesData(): BaseOption {

    this.chartOption.series = this.data.columns.map((column) => {

      // 시리즈 생성
      return {
        type: SeriesType.LINE,
        name: column.name,
        data: column.value,
        originData: _.cloneDeep(column.value),
        connectNulls: true,
        showAllSymbol: true,
        symbol: SymbolType.CIRCLE,
        sampling: 'max',
        itemStyle: optGen.ItemStyle.auto(),
        label: optGen.LabelStyle.defaultLabelStyle(false, Position.TOP),
        uiData: column
      };
    });

    return this.chartOption;
  }

  /**
   * 라인차트의 series값으로 설정되는 부분
   */
  protected additionalSeries(): BaseOption {

    // 차트 시리즈 라인 표현 타입 변경(라인&포인트/라인만/포인트만)
    this.chartOption = this.convertLineStyle();

    // 차트 라인 코너 스타일 변경
    this.chartOption = this.convertCornerStyle();

    // 색상 설정 변경
    this.chartOption = this.convertColor();

    // 예측선 사용시
    if (this.isAnalysisPredictionLineEmpty() === false) {
      // 늘어난 예측기간 만큼 count 를 늘려준다
      const count = 20 + Number(this.analysis.interval);
      this.convertDataZoomAutoRange(this.chartOption, count, 500, 10, this.existTimeField);
    }

    return this.chartOption;
  }

  /**
   * 라인차트의 범례 설정부분
   */
  protected additionalLegend(): BaseOption {

    // color by dimension일때에는 color by series에 해당되는 부분으로 설정
    if (this.uiOption.color.type == ChartColorType.DIMENSION) {

      this.chartOption.legend.data = this.chartOption.series.map(item => item.name);
    }

    return this.chartOption;
  }

  /**
   * Chart Datazoom Event Listener
   */
  public addChartDatazoomEventListener(): void {

    this.chart.off('datazoom');
    this.chart.on('datazoom', (param) => {

      this.chartOption.dataZoom.map((zoom, index) => {
        if( _.eq(zoom.type, DataZoomType.SLIDER) ) {
          this.uiOption.chartZooms[index].start = param.start;
          this.uiOption.chartZooms[index].end = param.end;
        }
      });
    });
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
   * change dataLabel, tooltip by single series, multi series
   * @returns {UIOption}
   */
  protected setDataLabel(): UIOption {

    /**
     * check multi series <=> single series
     * @type {() => boolean}
     */
    const checkChangeSeries = ((): boolean => {

      if (!this.prevPivot) return true;

      // prev series is multi(true) or single
      const prevSeriesMulti: boolean = this.prevPivot.aggregations.length > 1 || this.prevPivot.rows.length > 0 ? true : false;

      // current series is multi(true) or single
      const currentSeriesMulti: boolean = this.pivot.aggregations.length > 1 || this.pivot.rows.length > 0 ? true : false;

      // if it's changed
      if (prevSeriesMulti !== currentSeriesMulti) {

        return true;
      }

      // not changed
      return false;
    });

    this.uiOption = this.setAxisDataLabel(this.prevPivot, checkChangeSeries());

    // set previous pivot value (compare previous pivot, current pivot)
    this.prevPivot = this.pivot;

    return this.uiOption;
  }

  /**
   * 차트별 Y축 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalYAxis(): BaseOption {

    // Min / Max를 재계산한다.
    this.convertAxisAutoScale(AxisType.Y);


    // 차트옵션 반환
    return this.chartOption;
  }

  /**
   * 차트별 X축 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalXAxis(): BaseOption {

    // Min / Max를 재계산한다.
    this.convertAxisAutoScale(AxisType.X);


    // 차트옵션 반환
    return this.chartOption;
  }

  /**
   * Min / Max 연산
   * @param grid
   * @param result
   * @param isYAsis
   */
  protected calculateMinMax(grid: UIChartAxisGrid, result: any, isYAsis: boolean): void {

    // 라인차트는 Override 함으로서 데이터 가공처리를 하지 않음

    // // 축범위 자동설정일 경우
    // if( grid.autoScaled ) {
    //   if( result.data.categories && result.data.categories.length > 0 ) {
    //     let min = null;
    //     let max = null;
    //     _.each(result.data.columns, (column) => {
    //       _.each(column.value, (value) => {
    //         if( min == null || value < min ) {
    //           min = value;
    //         }
    //         if( max == null || value > max ) {
    //           max = value;
    //         }
    //       });
    //     });
    //     grid.min = min > 0
    //       ? Math.ceil(min - ((max - min) * 0.05))
    //       : min
    //     grid.max = max;
    //   }
    //   else {
    //     grid.min = result.data.info.minValue > 0
    //       ? Math.ceil(result.data.info.minValue - ((result.data.info.maxValue - result.data.info.minValue) * 0.05))
    //       : result.data.info.minValue
    //     grid.max = result.data.info.maxValue;
    //   }
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
    // result.data.columns.map((column, index) => {
    //   column.value.map((value, index) => {
    //     if( value < grid.min ) {
    //       column.value[index] = grid.min;
    //     }
    //     else if( value > grid.max ) {
    //       column.value[index] = grid.max;
    //     }
    //   });
    // });
  }

  /**
   * 축 교차점 연산
   * @param baseline
   * @param result
   * @param isYAsis
   */
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
    result.data.columns.map((column, index) => {
      column.value.map((value, index) => {
        if( value > 0 ) {
          column.value[index] = value - baseline;
        }
        else {
          column.value[index] = (Math.abs(value) + Math.abs(baseline)) * -1;
        }
      });
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Min / Max 오토스케일
   * @param axisType
   */
  private convertAxisAutoScale(axisType: AxisType): BaseOption {

    // Min / Max값을 재계산한다.
    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    // 축에 해당하는 Axis 옵션
    let axisOption: UIChartAxis[] = AxisOptionConverter.getAxisOption(this.uiOption, axisType);

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    let axis: AxisDefine[] = this.chartOption[axisType];

    _.each(axis, (option: AxisDefine, index) => {

      // Value축일 경우
      if ((<UIChartAxisLabelValue>axisOption[index].label) && _.eq((<UIChartAxisLabelValue>axisOption[index].label).type, AxisType.VALUE)
        && axisOption[index].grid) {

        let min = null;
        let max = null;
        let calculateMin = null;
        if( this.originalData.categories || this.originalData.categories.length > 0 ) {
          _.each(this.originalData.columns, (column) => {
            _.each(column.value, (value) => {
              if( min == null || value < min ) {
                min = value;
              }
              if( max == null || value > max ) {
                max = value;
              }
            });
          });
          calculateMin = Math.ceil(this.originalData.info.minValue - ((this.originalData.info.maxValue - this.originalData.info.minValue) * 0.05));
          // min = min > 0
          //   ? calculateMin >= 0 ? calculateMin : min
          //   : min;
          max = max;
        }
        else {
          calculateMin = Math.ceil(this.originalData.info.minValue - ((this.originalData.info.maxValue - this.originalData.info.minValue) * 0.05));
          min = this.originalData.info.minValue;
          // min = this.originalData.info.minValue > 0
          //   ? calculateMin >= 0 ? calculateMin : min
          //   : this.originalData.info.minValue;
          max = this.originalData.info.maxValue;
        }

        // Min / Max 업데이트
        AxisOptionConverter.axisMinMax[axisType].min = min;
        AxisOptionConverter.axisMinMax[axisType].max = max;

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
   * 차트 시리즈 라인 표현 타입 변경(라인&포인트/라인만/포인트만)
   *
   */
  private convertLineStyle(): BaseOption {

    const lineUIOption = <UILineChart>this.uiOption;

    if (this.isAnalysisPredictionLineEmpty()) {
      const series = this.chartOption.series;

      series.map((obj) => {
        // 유효 데이터가 1개만 있다면 포인트는 무조건 표시
        const dataLength = obj.originData.filter((value) => {
          return value != null;
        }).length;

        // 포인트가 있는경우 circle로 설정
        const transparentSymbolImage: string = 'image://' + window.location.origin + '/assets/images/icon_transparent_symbol.png';
        obj.symbol = obj.data.length === 1 || dataLength === 1 || LineStyle.LINE !== lineUIOption.lineStyle ? 'circle' : transparentSymbolImage;

        // 기존 라인 스타일이 존재 하지 않을 경우 기본스타일 생성 후 적용
        if (_.isUndefined(obj.lineStyle)) obj.lineStyle = optGen.LineStyle.auto();
        // 라인 표시여부에 따라 불투명도 적용 (라인이 있는경우 opacity 1적용)
        if (!_.isUndefined(obj.lineStyle) && !_.isUndefined(obj.lineStyle.normal)) obj.lineStyle.normal.opacity = LineStyle.POINT !== lineUIOption.lineStyle ? 1 : 0;
      });
    } else {
      this.chartOption = this.exceptPredictionLineShowLine(lineUIOption.lineStyle);
    }

    return this.chartOption;
  }

  /**
   * 코너 스타일 변경
   */
  private convertCornerStyle(): BaseOption {

    const lineUIOption = <UILineChart>this.uiOption;
    const series = this.chartOption.series;

    series.map((obj) => {
      obj.smooth = _.eq(lineUIOption.curveStyle, LineCornerType.SMOOTH);
    });

    return this.chartOption;
  }

  /**
   * color by dimension / series에 따라 fieldInfo를 변경하여 => 범례 설정을 변경
   */
  private editPivotByColorType(): Pivot{

    const shelve = this.pivot;

    // agg 선반에서 설정
    for (let num = shelve.aggregations.length; num--;) {

      let item = shelve.aggregations[num];

      // 타입이 dimension인
      if (String(ShelveFieldType.DIMENSION) == item.type) {

        // 값을 shelve에서 제거
        shelve.aggregations.splice(num, 1);

        // rows에 추가
        shelve.rows.push(item);
      }
    }

    return this.pivot;
  }

  /**
   * line차트에서의 color by dimension 설정
   * @returns {BaseOption}
   */
  private convertLineColorByDimension(): BaseOption {

    // color by dimension일때에는 색상 설정
    if (this.uiOption.color.type == ChartColorType.DIMENSION) {

      const option = this.chartOption;
      let schema = (<UIChartColorBySeries>this.uiOption.color).schema;
      let codes = _.cloneDeep(ChartColorList[schema]);

      // visualMap 존재한다면 삭제
      if (!_.isUndefined(option.visualMap)) delete option.visualMap;

      const series: any = _.cloneDeep(option.series.map(item => item.name));

      _.each(option.series, (obj) => {

        // 라인차트의 dimension때에는 name을 그대로 가져오기
        const aggName = obj.name;
        // 측정값 필드명의 인덱스
        const fieldIdx = _.indexOf(series, aggName);
        // 측정값 필드명의 인덱스에 맵핑되는 컬러인덱스
        const colorIdx = fieldIdx >= codes['length'] ? fieldIdx % codes['length'] : fieldIdx;

        obj.itemStyle.normal.color = codes[colorIdx];
      });
    }

    return this.chartOption;
  }

  // -----------------------------------------------
  // 고급분석 - 예측선 관련
  // -----------------------------------------------

  /**
   * 고급분석 - 예측선 데이터가 없을 경우
   * @returns {boolean}
   */
  private isAnalysisPredictionLineEmpty(): boolean {
    return _.isUndefined(this.analysis) || _.isEmpty(this.analysis);
  }


  /**
   * 고급분석 시리즈 데이터 series measure 수치값 기준으로 색상 지정
   *  - 라인차트에 고급분석 데이터가 있는 경우만 사용하는 함수
   * @returns {BaseOption}
   */
  private predictionLineLineStyleColorBySeries(): BaseOption {

    // 라인타입 LineType<Enum> 으로 변환
    const convertLineTypeEnum: Function = (lineType: string | LineType): string | LineType => {
      if (lineType === 'SOLID') {
        lineType = LineType.SOLID;
      } else if (lineType === 'DASHED') {
        lineType = LineType.DASHED;
      } else if (lineType === 'DOTTED') {
        lineType = LineType.DOTTED;
      }
      return lineType;
    };

    // 시리즈
    let series = this.chartOption.series;

    this.analysis.forecast.parameters.forEach((parameter) => {
      series
        .filter((obj) => {
          return obj.name === parameter.field;
        })
        .map((obj) => {

          const index = series.findIndex((data) => {
            return data.name === parameter.field;
          });

          // 예측선의 forecast.style.color 값
          let color: string = this.analysis.forecast.style.color;

          // 예측선내에서 색상 설정하는부분이 아닐때
          if (!this.analysis.forecast.style.predictColorUseFl) {
            color = obj.itemStyle.normal.color;
          }

          const lineThickness: number = this.analysis.forecast.style.lineThickness;
          const lineType: LineType = convertLineTypeEnum(this.analysis.forecast.style.lineType);

          const lowerSeries =        series[index + 1];
          const observationsSeries = series[index + 2];
          const upperSeries =        series[index + 3];
          const addSeries  =         series[index + 4];

          if (_.isUndefined(lowerSeries.lineStyle)) {
            lowerSeries.lineStyle = optGen.LineStyle.auto();
          }

          if (_.isUndefined(observationsSeries.lineStyle)) {
            observationsSeries.lineStyle = optGen.LineStyle.auto();
          }

          if (_.isUndefined(upperSeries.lineStyle)) {
            upperSeries.lineStyle = optGen.LineStyle.auto();
          }

          lowerSeries.lineStyle.normal.color = color;
          lowerSeries.lineStyle.normal.type = lineType;
          lowerSeries.lineStyle.normal.width = lineThickness;
          lowerSeries.lineStyle.normal.opacity = 0;
          lowerSeries.showSymbol = false;

          observationsSeries.lineStyle.normal.color = color;
          observationsSeries.lineStyle.normal.type = lineType;
          observationsSeries.lineStyle.normal.width = lineThickness;
          observationsSeries.showSymbol = false;

          upperSeries.lineStyle.normal.color = color;
          upperSeries.lineStyle.normal.type = lineType;
          upperSeries.lineStyle.normal.width = lineThickness;
          upperSeries.lineStyle.normal.opacity = 0;
          upperSeries.showSymbol = false;

          if (_.isUndefined(addSeries) === false) {
            if (addSeries.name === `${obj.name} - ${AnalysisPredictionService.predictionLineTypeAdditional}`) {
              addSeries.lineStyle = optGen.LineStyle.auto();
              addSeries.lineStyle.normal.color = color;
              addSeries.lineStyle.normal.type = lineType;
              addSeries.lineStyle.normal.width = lineThickness;
              addSeries.lineStyle.normal.opacity = 0;
              addSeries.showSymbol = false;
            }
          }

        });
    });

    return this.chartOption;
  }

  /**
   * 고급분석 시리즈 데이터 series measure 수치값 기준으로 색상 지정
   *  - 라인차트에 고급분석 데이터가 있는 경우만 사용하는 함수
   * @returns {BaseOption}
   */
  private predictionLineAreaStyleColorBySeries(): BaseOption {

    // 시리즈에 영역 색상 지정
    const setSeriesAreaStyleColor: Function = (series: Series, color: string): void => {
      if (_.isUndefined(series.areaStyle)) {
        series.areaStyle = optGen.AreaStyle.auto();
      }
      series.areaStyle.normal.color = color;
    };

    // confidence.style.transparency 값을 나누기 위한 몫
    const transparencyDivisionShare: number = 100;

    // Confidence opacity 계산
    const confidenceOpacityCalculator: Function = (): number => {
      return this.analysis.confidence.style.transparency / transparencyDivisionShare;
    };

    // 시리즈에 영역 투명도 지정
    const setSeriesAreaStyleOpacity: Function = (series: Series, opacity: number): void => {
      series.areaStyle.normal.opacity = opacity;
    };

    // 시리즈
    let series = this.chartOption.series;

    this.analysis.forecast.parameters.forEach((parameter) => {
      series
        .filter((obj) => {
          return obj.name === parameter.field;
        })
        .map((obj) => {

          const index = series.findIndex((data) => {
            return data.name === parameter.field;
          });

          let color: string = this.analysis.confidence.style.color;

          // const isConfidenceStyleInColorEmpty = _.isEmpty(color);
          // if (isConfidenceStyleInColorEmpty) {
          //   const seriesLineStyleNormalColor = series[index].itemStyle.normal.color;

          // 예측선내에서 색상 설정하는부분이 아닐때
          if (!this.analysis.confidence.style.predictColorUseFl) {
            color = series[index].itemStyle.normal.color;
          }
          // }

          const lowerSeries = series[index + 1];
          const upperSeries = series[index + 3];
          const addSeries =   series[index + 4];

          lowerSeries.stack = upperSeries.name;
          upperSeries.stack = upperSeries.name;

          // 투명도
          const opacity: number = confidenceOpacityCalculator();

          // 영역 색상 지정
          setSeriesAreaStyleColor(upperSeries, color);

          // 영역 색상 투명도 지정
          setSeriesAreaStyleOpacity(upperSeries, opacity);

          if (_.isUndefined(addSeries) === false) {
            if (addSeries.name === `${obj.name} - ${AnalysisPredictionService.predictionLineTypeAdditional}`) {

              // 영역 색상 지정
              setSeriesAreaStyleColor(addSeries, color);

              // 영역 색상 투명도 지정
              setSeriesAreaStyleOpacity(addSeries, opacity);
            }
          }

        });
    });

    return this.chartOption;
  }

  /**
   * 고급분석 시리즈를 제외하고 원본라인 & 포인트 표시여부
   * @param lineStyle
   * @returns {BaseOption}
   */
  private exceptPredictionLineShowLine(lineStyle: LineStyle): BaseOption {
    const series = this.chartOption.series;
    this.analysis.forecast.parameters.forEach((parameter) => {
      series
        .filter((obj) => {
          return obj.name === parameter.field;
        })
        .map((obj) => {
          if (_.eq(obj.type, SeriesType.LINE)) {
            // 유효 데이터가 1개만 있다면 포인트는 무조건 표시
            const dataLength = obj.originData.filter((value) => {
              return value != null;
            }).length;
            // 포인트가 있는경우 circle로 설정
            obj.symbol = obj.data.length === 1 || dataLength === 1 || LineStyle.LINE !== lineStyle ? 'circle' : transparentSymbolImage;
            // 기존 라인 스타일이 존재 하지 않을 경우 기본스타일 생성 후 적용
            if (_.isUndefined(obj.lineStyle)) obj.lineStyle = optGen.LineStyle.auto();
            // 라인 표시여부에 따라 불투명도 적용(라인이 있는경우 opacity 1적용)
            if (!_.isUndefined(obj.lineStyle) && !_.isUndefined(obj.lineStyle.normal)) {
              obj.lineStyle.normal.opacity = LineStyle.POINT !== lineStyle ? 1 : 0;
            }
          }
        });
    });
    return this.chartOption;
  }

  /**
   * 고급분석 시리즈를 제외하고 원본 데이터 series measure 수치값 기준으로 색상 지정
   *  - 라인차트에 고급분석 데이터가 있는 경우만 사용하는 함수
   * @returns {BaseOption}
   */
  private exceptPredictionLineColorBySeries(): BaseOption {

    const color = (<UIChartColorBySeries>this.uiOption.color);
    let schema = color.schema;
    let list: any = _.cloneDeep(ChartColorList[schema]);

    // userCodes가 있는경우 codes대신 userCodes를 설정한다
    if ((<UIChartColorBySeries>color).mapping) {
      Object.keys((<UIChartColorBySeries>color).mapping).forEach((key, index) => {

        list[index] = (<UIChartColorBySeries>color).mapping[key];
      });
    }

    // userCodes가 있는경우 codes대신 userCodes를 설정한다
    // if((<UIChartColorBySeries>this.uiOption.color).mapping) list = _.cloneDeep((<UIChartColorBySeries>this.uiOption.color).mapping);

    // subType이 value가 아닌경우visualMap 존재한다면 삭제
    if (this.uiOption.color.type !== ChartColorType.MEASURE) delete this.chartOption.visualMap;

    // 시리즈
    let series = this.chartOption.series;

    this.analysis.forecast.parameters.forEach((parameter, parameterIdx) => {
      series
        .filter((obj) => {
          return obj.name === parameter.field;
        })
        .map((obj) => {
          // 시리즈명을 delimiter 로 분리, 현재 시리즈의 측정값 필드명 추출, 라인차트의 dimension때에는 name을 그대로 가져오기
          const aggName = _.last(_.split(obj.name, CHART_STRING_DELIMITER));
          const mappingInfo = (<UIChartColorBySeries>this.uiOption.color).mapping;
          // 기존 스타일이 존재 하지 않을 경우 기본스타일 생성 후 적용
          if (_.isUndefined(obj.itemStyle)) obj.itemStyle = optGen.ItemStyle.auto();

          if( mappingInfo && mappingInfo[aggName] ) {
            // 현재 시리즈에 컬러 적용 - border 가 존재한다면 border 에 컬러 적용
            if (!_.isUndefined(obj.itemStyle.normal.borderWidth) && obj.itemStyle.normal.borderWidth > 0) {
              obj.itemStyle.normal.borderColor = mappingInfo[aggName];
              delete obj.itemStyle.normal.color;
            } else {
              obj.itemStyle.normal.color = mappingInfo[aggName];
            }
            // 텍스트로 구성되는 차트일 경우
            if (!_.isUndefined(obj.textStyle)) obj.textStyle.normal.color = mappingInfo[aggName];
          } else {
            // 측정값 필드명의 인덱스
            const fieldIdx = _.indexOf(this.fieldInfo.aggs, aggName);
            // 측정값 필드명의 인덱스에 맵핑되는 컬러인덱스
            const colorIdx = fieldIdx >= list.length ? fieldIdx % list.length : fieldIdx;
            // 현재 시리즈에 컬러 적용 - border 가 존재한다면 border 에 컬러 적용
            if (!_.isUndefined(obj.itemStyle.normal.borderWidth) && obj.itemStyle.normal.borderWidth > 0) {
              obj.itemStyle.normal.borderColor = list[colorIdx];
              delete obj.itemStyle.normal.color;
            } else {
              obj.itemStyle.normal.color = list[parameterIdx];
            }
            // 텍스트로 구성되는 차트일 경우
            if (!_.isUndefined(obj.textStyle)) obj.textStyle.normal.color = list[colorIdx];
          }
        });
    });

    return this.chartOption;
  }

  /**
   * 차트 표현 방향에 따른 그리드 위치값 변경
   * @param option
   * @param orient
   */
  // private gridPosition(orient: Orient): BaseOption {
  //   // 범례 존재여부
  //   const withLegend: boolean = (!_.isUndefined(this.chartOption.legend) && this.chartOption.legend.show) || (!_.isUndefined(this.chartOption.visualMap) && this.chartOption.visualMap.show);
  //   // DataZoom(미니맵) 존재여부
  //   const withDataZooom: boolean = !_.isUndefined(this.chartOption.dataZoom) && this.chartOption.dataZoom[0].show;
  //   const withSubAxis: boolean = this.chartOption.xAxis.length > 1 || this.chartOption.yAxis.length > 1;
  //   // DataZoom(미니맵) 존재 여부에 따라서 여백 조정
  //   this.chartOption.grid.map((obj, idx) => {
  //     this.chartOption.grid[idx] = _.eq(orient, Orient.BOTH)
  //       ? OptionGenerator.Grid.bothMode(10, 0, 0, 20, withLegend, withDataZooom)
  //       : _.eq(orient, Orient.VERTICAL)
  //         ? OptionGenerator.Grid.verticalMode(20, 0, 0, 10, withLegend, withDataZooom, withSubAxis)
  //         : OptionGenerator.Grid.horizontalMode(10, 0, 0, 20, withLegend, withDataZooom);
  //   });
  //   return this.chartOption;
  // }

  /**
   * 차트 공통 속성 변경 - 색상( UI를 통한 변경 )
   * @returns {BaseOption}
   */
   private convertColor(): BaseOption {

     const color = this.uiOption.color;

    // 라인차트의 경우 dimension을 series 타입으로 타게함
    switch (color.type) {
      case ChartColorType.SERIES: {

        let schema = (<UIChartColorBySeries>color).schema;
        let colorCodes = _.cloneDeep(ChartColorList[schema]);

        // userCodes가 있는경우 codes대신 userCodes를 설정한다
        if ((<UIChartColorBySeries>color).mapping) {
          Object.keys((<UIChartColorBySeries>color).mapping).forEach((key, index) => {
            colorCodes[index] = (<UIChartColorBySeries>color).mapping[key];
          });
        }

        if (this.isAnalysisPredictionLineEmpty()) {

          this.chartOption = ColorOptionConverter.convertColorBySeries(this.chartOption, this.fieldInfo, colorCodes);
        } else {

          this.chartOption = this.exceptPredictionLineColorBySeries();
          this.chartOption = this.predictionLineLineStyleColorBySeries();
          this.chartOption = this.predictionLineAreaStyleColorBySeries();
        }

        break;
      }
      case ChartColorType.DIMENSION: {

        this.chartOption = this.convertLineColorByDimension();
        if (!this.isAnalysisPredictionLineEmpty()) {
          this.chartOption = this.exceptPredictionLineColorBySeries();
          this.chartOption = this.predictionLineLineStyleColorBySeries();
          this.chartOption = this.predictionLineAreaStyleColorBySeries();
        }

        break;
      }
      case ChartColorType.MEASURE: {

        // gradation일때
        if (this.uiOption.color['customMode'] && ColorCustomMode.GRADIENT == this.uiOption.color['customMode']) {

          this.chartOption = ColorOptionConverter.convertColorByValueGradation(this.chartOption, this.uiOption);
          // 그이외의 경우일떄
        } else {
          this.chartOption = ColorOptionConverter.convertColorByValue(this.chartOption, this.uiOption);
        }

        if (!this.isAnalysisPredictionLineEmpty()) {
          this.chartOption = this.exceptPredictionLineColorBySeries();
          this.chartOption = this.predictionLineLineStyleColorBySeries();
          this.chartOption = this.predictionLineAreaStyleColorBySeries();
        }
        break;
      }
    }

    return this.chartOption;
  }
}

