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

// import { AfterViewInit, Component, ElementRef, Injector, Input, OnInit, ViewChild } from '@angular/core';
// import {
//   LabelMode, UIChartLabel, UICombineChartPresentation, UIGridChartPresentation,
//   UIOption, UIPieChartPresentation
// } from '../common/component/chart/option/ui-option';
// import { OptionGenerator } from '../common/component/chart/option/util/option-generator';
// import { ChartTestService } from './service/chart-test.service';
// import { AbstractComponent } from '../common/component/abstract.component';
// import * as testData from './test-data.json';
//
// import * as _ from 'lodash';
// import optGen = OptionGenerator;
// import { Alert } from '../common/util/alert.util';
// import {BaseChart} from "../common/component/chart/base-chart";
// import {
//   UIOrient, ChartColorList, ChartColorType, Orient, ChartType, SymbolType, SymbolFill,
//   ChartGradientType, AxisLabelType, LabelConvertType, LegendConvertType, SeriesConvertType, DataUnit, AxisLabelMark,
//   CellColorTarget, GridCellColorList, Position, GridViewType, PieSeriesViewType, UIPosition,
//   BarMarkType, LineMarkType, PointShape, LineMode, LineStyle
// }
//   from '../common/component/chart/option/define/common';
// import { UILineChart } from '../common/component/chart/option/ui-option/ui-line-chart';
// import { UIBarChart } from '../common/component/chart/option/ui-option/ui-bar-chart';
//
// const possibleChartObj: any = {
//   format: ['bar','line'],
//   color: ['bar', 'grid', 'line', 'scatter', 'control', 'pie', 'wordcloud', 'boxplot', 'radar', 'heatmap', 'combine', 'treemap'],
//   colorD: ['bar', 'line', 'scatter', 'pie', 'wordcloud'],
//   colorM: ['bar', 'line', 'control', 'boxplot', 'radar', 'combine'],
//   colorV: ['bar', 'line', 'grid', 'control', 'scatter', 'heatmap', 'pie', 'wordcloud', 'treemap', 'boxplot'],
//   axis: ['bar', 'line', 'control', 'scatter', 'heatmap', 'boxplot', 'waterfall', 'combine'],
//   logScale: ['bar', 'line', 'scatter'],
//   valueLabel: ['bar', 'line', 'control', 'scatter', 'heatmap', 'pie', 'waterfall'],
//   legend: ['bar', 'line', 'control', 'scatter', 'heatmap', 'pie', 'radar'],
//   minimap: ['bar', 'line', 'control', 'scatter', 'heatmap', 'boxplot', 'waterfall'],
//   barExpress: ['bar', 'waterfall', 'combine'],
//   lineExpress: ['line', 'control', 'combine'],
//   scatterExpress: ['scatter'],
//   gridExpress: ['grid'],
//   pieExpress: ['pie'],
//   brush: ['bar']
// };
//
// @Component({
//   selector: 'app-chart-test',
//   templateUrl: 'chart-test.component.html',
//   styleUrls: ['chart-test.component.css']
// })
//
// export class ChartTestComponent extends AbstractComponent implements OnInit, AfterViewInit {
//
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | ViewChild
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   @ViewChild('chart')
//   protected chart: BaseChart;
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Private Variables
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Protected Variables
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   protected testData: any;
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Public Variables
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   public uiOption: UIOption;
//
//   public currentChart: any;
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Constructor
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   // 생성자
//   constructor(private chartTestService: ChartTestService,
//               protected elementRef: ElementRef,
//               protected injector: Injector) {
//
//     super(elementRef, injector);
//   }
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Override Method
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   ngOnInit() {
//     this.initUIOption(String(ChartType.BAR));
//   }
//
//   ngAfterViewInit(): void {
//     super.ngAfterViewInit();
//     console.info(this.chart);
//     this.search(String(ChartType.BAR), {});
//   }
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Public Method
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   /**
//    * 차트 선택
//    *
//    * @param type
//    */
//   public selectChart(type: string): void {
//     if (_.eq(this.currentChart, type)) return;
//     this.search(type, {});
//   }
//
//   /**
//    * 해당차트의 구현 가능한 기능 체크
//    *
//    * @param {string} type
//    * @param {ChartType} chartType
//    * @returns {boolean}
//    */
//   public possibleChartCheck(type: string, chartType: ChartType) {
//     return _.indexOf(possibleChartObj[type], chartType) > -1;
//   }
//
//   public draw(isKeepRange?: boolean): void {
//
//     if( this.chart ) {
//       this.chart.draw(isKeepRange);
//     }
//   }
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Protected Method
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    | Private Method
//    |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
//
//   /**
//    * 테스트 쿼리 기반으로 search쿼리 실행
//    *
//    * @param {ChartType} type
//    * @param option
//    */
//   private search(type: string, option: any) {
//     let query: any;
//     query = testData[type] || testData['bar'];
//     // 로딩 show
//     this.loadingShow();
//     this.chartTestService.search(type, query, option)
//       .then((data) => {
//         this.testData = { data, config: query };
//         if (!_.eq(this.currentChart, type)) {
//           this.initUIOption(type);
//           this.currentChart = type;
//         }
//         //this.chart.draw();
//         this.loadingHide();
//       })
//       .catch((error) => {
//         this.loadingHide();
//       });
//   }
//
//   /**
//    * 차트 기본 옵셥 초기화
//    *
//    * @param type
//    */
//   private initUIOption(type: string) {
//     // 색상 필드
//     switch (type) {
//       case String(ChartType.BAR) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.BarChart.defaultBarChartUIOption())
//           : optGen.BarChart.defaultBarChartUIOption();
//         break;
//       case String(ChartType.LINE) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.LineChart.defaultLineChartUIOption())
//           : optGen.LineChart.defaultLineChartUIOption();
//         break;
//       case String(ChartType.CONTROL) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.LineChart.defaultControlLineChartUIOption())
//           : optGen.LineChart.defaultControlLineChartUIOption();
//         break;
//       case String(ChartType.SCATTER) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.ScatterChart.defaultScatterChartUIOption())
//           : optGen.ScatterChart.defaultScatterChartUIOption();
//         break;
//       case String(ChartType.HEATMAP) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.HeatMapChart.defaultHeatMapChartUIOption())
//           : optGen.HeatMapChart.defaultHeatMapChartUIOption();
//         break;
//       case String(ChartType.GRID) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.GridChart.defaultGridChartUIOption())
//           : optGen.GridChart.defaultGridChartUIOption();
//         break;
//       case String(ChartType.BOXPLOT) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.BoxPlotChart.defaultBoxPlotChartOption())
//           : optGen.BoxPlotChart.defaultBoxPlotChartUIOption();
//         break;
//       case String(ChartType.PIE) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.PieChart.defaultPieChartOption())
//           : optGen.PieChart.defaultPieChartUIOption();
//         break;
//       case String(ChartType.LABEL) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.LabelChart.defaultLabelChartOption())
//           : optGen.LabelChart.defaultLabelChartUIOption();
//         break;
//       case String(ChartType.WORDCLOUD) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.WordCloudChart.defaultWordCloudChartUIOption())
//           : optGen.WordCloudChart.defaultWordCloudChartUIOption();
//         break;
//       case String(ChartType.WATERFALL) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.WateFallChart.defaultWateFallChartUIOption())
//           : optGen.WateFallChart.defaultWateFallChartUIOption();
//         break;
//       case String(ChartType.RADAR) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.RadarChart.defaultRadarChartUIOption())
//           : optGen.RadarChart.defaultRadarChartUIOption();
//         break;
//       case String(ChartType.COMBINE) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.CombineChart.defaultCombineChartUIOption())
//           : optGen.CombineChart.defaultCombineChartUIOption();
//         break;
//       case String(ChartType.TREEMAP) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.TreeMapChart.defaultTreeMapChartUIOption())
//           : optGen.TreeMapChart.defaultTreeMapChartUIOption();
//         break;
//       case String(ChartType.NETWORK) :
//         this.uiOption = _.eq(this.currentChart, type)
//           ? _.extend({}, this.uiOption, optGen.NetworkChart.defaultNetworkChartUIOption())
//           : optGen.NetworkChart.defaultNetworkChartUIOption();
//         break;
//     }
//   }
//
//   /**
//    * 차트가 그려진 후 변경되는 UI Option 업데이트
//    *
//    * @param type
//    */
//   public updateUIOption(uiOption) {
//     setTimeout(() => {
//       this.uiOption = _.extend({}, this.uiOption, uiOption);
//     },         0);
//
//   }
//
//   /**
//    * 차트항목 선택시 선택정보
//    *
//    */
//   public chartSelectInfo(selectInfo) {
//     console.info(selectInfo);
//   }
//
//   /**
//    * Color By Dimension
//    */
//   public colorByDimension(targetField: string): void {
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
//       color: {
//         type: ChartColorType.DIMENSION,
//         codes: ChartColorList.SC2,
//         targetField: !targetField ? _.last(this.uiOption.fieldList) : targetField
//       }
//     });
//
//     this.draw(true);
//   }
//
//   /**
//    * Color By Measure
//    */
//   public colorByMeasure(): void {
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
//       color: {
//         type: ChartColorType.SERIES,
//         codes: ChartColorList.SC1
//       }
//     });
//
//     this.draw(true);
//   }
//
//   /**
//    * Color By Value
//    */
//   public colorByValue(): void {
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
//       color: {
//         type: ChartColorType.MEASURE,
//         mode: ChartGradientType.LINEAR,
//         codes: ChartColorList.VC1
//       }
//     });
//
//     this.draw(true);
//   }
//
//   /**
//    * Color By Cell - Grid Chart Only
//    */
//   public colorByCell(target: CellColorTarget): void {
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
//       color: {
//         type: ChartColorType.SINGLE,
//         mark: target,
//         codes: GridCellColorList.LINE1
//       }
//     });
//
//     this.draw(true);
//   }
//
//   /**
//    * on/off 버튼 텍스트 변경
//    *
//    * @param show
//    * @returns {string|string}
//    * @constructor
//    */
//   public showButtonValue(show: boolean): string {
//     return show ? 'Off' : 'On';
//   }
//
//
//   /**
//    * 축 정보 변경
//    *
//    * @param axisType
//    * @param convertType
//    * @param index
//    * @param value
//    * @returns {{xAxis: {uiAxis: UIAxis}}|{yAxis: {uiAxis: UIAxis}}}
//    */
//   public convertLabel(axisLabelType: AxisLabelType, type: LabelConvertType, value: any): UIChartLabel {
//     const list: LabelMode[] = _.cloneDeep(this.uiOption.label.axis);
//     list.map((axis) => {
//       if (_.eq(axis.mode, axisLabelType)) {
//         axis[type] = value;
//       }
//     });
//     const label = _.cloneDeep(this.uiOption.label);
//     label.axis = list;
//     return label;
//   }
//
//   /**
//    * 축 타이틀 표시여부
//    *
//    * @param axisType
//    * @param index
//    * @param show
//    * @param event
//    */
//   public showAxisName(axisLabelType: AxisLabelType, show: boolean): void {
//     const label = this.convertLabel(axisLabelType, LabelConvertType.SHOWNAME, show);
//     label.convertType = LabelConvertType.SHOWNAME;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { label });
//
//     this.draw(true);
//   }
//
//   /**
//    * 축 이름
//    *
//    * @param axisType
//    * @param index
//    * @param event
//    */
//   public axisName(axisLabelType: AxisLabelType, idx: number, event: any): void {
//     const value = event.currentTarget.value;
//     const label = this.convertLabel(axisLabelType, LabelConvertType.NAME, value);
//     if (_.isEmpty(value)) label.axis[idx].name = label.axis[idx].defaultName;
//     label.convertType = LabelConvertType.NAME;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { label });
//
//     this.draw(true);
//   }
//
//   /**
//    * 축 라벨 표시여부
//    *
//    * @param axisType
//    * @param index
//    * @param show
//    * @param event
//    */
//   public showAxisLabel(axisLabelType: AxisLabelType, show: boolean, name: string = null): void {
//     const label = this.convertLabel(axisLabelType, LabelConvertType.SHOWMARK, show);
//     label.convertType = LabelConvertType.SHOWMARK;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { label });
//
//     this.draw(true);
//   }
//
//   /**
//    * 축 라벨 회전
//    *
//    * @param axisType
//    * @param index
//    * @param rotate
//    */
//   public rotateAxisLabel(axisLabelType: AxisLabelType, rotate: AxisLabelMark): void {
//     const label = this.convertLabel(axisLabelType, LabelConvertType.MARK, rotate);
//     label.convertType = LabelConvertType.MARK;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { label });
//
//     this.draw(true);
//   }
//
//   /**
//    * 수치값 표시 여부
//    *
//    * @param show
//    */
//   public showValueLabel(show: boolean): void {
//     const label = _.cloneDeep(this.uiOption.label);
//     label.convertType = LabelConvertType.SHOWVALUE;
//     label.showValue = show;
//     // 특정 Series만 Value를 표시할 경우
//     // label.showValueList = ["Furniture―Sales"];
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { label });
//
//     this.draw(true);
//   }
//
//   /**
//    * 포맷: 타입 변경
//    * @param show
//    */
//   public format(type: string): void {
//     const format = _.cloneDeep(this.uiOption.valueFormat);
//     format.type = type;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { valueFormat: format });
//
//     this.draw(true);
//   }
//
//   /**
//    * 포맷: 1000단위 분리
//    * @param useThousandsSep
//    */
//   public formatUseThousandsSep(useThousandsSep: boolean): void {
//     const format = _.cloneDeep(this.uiOption.valueFormat);
//     format.useThousandsSep = useThousandsSep;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { valueFormat: format });
//
//     this.draw(true);
//   }
//
//   /**
//    * 포맷: 소수점 자리수
//    * @param useThousandsSep
//    */
//   public formatDecimal(decimal: number): void {
//     const format = _.cloneDeep(this.uiOption.valueFormat);
//     format.decimal = decimal;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { valueFormat: format });
//
//     this.draw(true);
//   }
//
//   /**
//    * 로그스케일 여부
//    *
//    * @param isLogSclale
//    */
//   public logScaleMode(isLogScaleMode: boolean): void {
//     const label = _.cloneDeep(this.uiOption.label);
//     label.convertType = LabelConvertType.SCALED;
//     label.scaled = isLogScaleMode;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { label });
//
//     this.draw(true);
//   }
//
//   /***
//    * 범례 표시여부
//    *
//    * @param {boolean} show
//    */
//   public showLegend(show: boolean): void {
//     const legend = _.cloneDeep(this.uiOption.legend);
//     legend.auto = show;
//     legend.convertType = LegendConvertType.SHOW;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { legend });
//
//     this.draw(true);
//   }
//
//   /**
//    * 미니맵 표시 여부
//    *
//    * @param show
//    */
//   public showDataZoom(show: boolean): void {
//     const chartZooms = _.cloneDeep(this.uiOption.chartZooms);
//     chartZooms.map((zoom) => {
//       zoom.auto = show;
//     });
//
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { chartZooms });
//
//     this.draw(true);
//   }
//
//   /**
//    * 차트 표시방향
//    *
//    * @param type
//    */
//   public orientType(type: UIOrient): void {
//     let align = _.cloneDeep((<UIBarChart>this.uiOption).align);
//
//     align = type;
//
//     const row = this.uiOption.label.axis.filter((axis) => {
//       return _.eq(axis.mode, AxisLabelType.ROW);
//     })[0];
//     const subRow = this.uiOption.label.axis.filter((axis) => {
//       return _.eq(axis.mode, AxisLabelType.SUBROW);
//     })[0];
//     const column = this.uiOption.label.axis.filter((axis) => {
//       return _.eq(axis.mode, AxisLabelType.COLUMN);
//     })[0];
//     const subColumn = this.uiOption.label.axis.filter((axis) => {
//       return _.eq(axis.mode, AxisLabelType.SUBCOLUMN);
//     })[0];
//
//     const label = _.cloneDeep(this.uiOption.label);
//     label.axis.map((axis) => {
//       switch (axis.mode) {
//         case AxisLabelType.ROW :
//           axis.name = column.name;
//           axis.defaultName = column.defaultName;
//           axis.forceName = column.forceName;
//           break;
//         case AxisLabelType.SUBROW :
//           axis.name = subColumn.name;
//           axis.defaultName = subColumn.defaultName;
//           axis.forceName = subColumn.forceName;
//           break;
//         case AxisLabelType.COLUMN :
//           axis.name = row.name;
//           axis.defaultName = row.defaultName;
//           axis.forceName = row.forceName;
//           break;
//         case AxisLabelType.SUBCOLUMN :
//           axis.name = subRow.name;
//           axis.defaultName = subRow.defaultName;
//           axis.forceName = subRow.forceName;
//           break;
//       }
//     });
//     label.convertType = LabelConvertType.NAME;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { align, label });
//
//     this.draw(true);
//   }
//
//   /**
//    * 차트 시리즈 표현 타입
//    *
//    * @param rotate
//    */
//   public barSeriesViewType(mark: BarMarkType): void {
//     const series = _.cloneDeep(this.uiOption.series);
//
//     if (_.eq(this.currentChart, ChartType.BAR)) {
//       this.uiOption = <UIOption>_.extend({}, this.uiOption, { mark });
//     } else {
//       const barMarkType = mark;
//       this.uiOption = <UIOption>_.extend({}, this.uiOption, { barMarkType });
//     }
//
//     this.draw(true);
//   }
//   public lineSeriesViewType(mark: LineMarkType): void {
//
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { mark });
//
//     this.draw(true);
//   }
//   public pieSeriesViewType(type: PieSeriesViewType): void {
//     const series = _.cloneDeep(this.uiOption.series);
//     series.convertType = SeriesConvertType.MARK;
//     (<UIPieChartPresentation>series).mark = type;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { series });
//
//     this.draw(true);
//   }
//
//   /**
//    * 라인 & 포인트 표시여부
//    *
//    * @param rotate
//    */
//   public showLine(lineStyle: LineStyle): void {
//
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { lineStyle });
//
//     this.draw(true);
//   }
//
//   /**
//    * 백분위수로 표현 여부
//    *
//    * @param replacePercentile
//    * @constructor
//    */
//   public dataUnit(type: DataUnit): void {
//     // const series = _.cloneDeep(this.uiOption.series);
//     // series.convertType = SeriesConvertType.UNITTYPE;
//     // (<UIBarChartPresentation>series).unitType = type;
//     // this.uiOption = <UIOption>_.extend({}, this.uiOption, { series });
//     // this.search(String(ChartType.BAR), { replacePercentile: _.eq(type, DataUnit.PERCENT) });
//   }
//
//   /**
//    * 누적 데이터 표현 여부
//    *
//    * @param replacePercentile
//    */
//   public cumulativeMode(lineMode: LineMode): void {
//
//     const uiLineMode = (<UILineChart>this.uiOption).lineMode;
//
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { uiLineMode });
//     this.search(String(ChartType.LINE), { lineMode: lineMode });
//   }
//
//   /**
//    * 심볼 불투명/반투명
//    *
//    * @param {SymbolFill} type
//    */
//   public symbolFill(pointTransparency: number): void {
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { pointTransparency });
//     this.draw(true);
//   }
//
//   /**
//    * 심볼모양
//    *
//    * @param {SymbolType} type
//    */
//   public symbolType(pointShape: PointShape): void {
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { pointShape });
//
//     this.draw(true);
//   }
//
//   /**
//    * grid 텍스트 정렬
//    *
//    * @param {Position} type
//    */
//   public textAlign(type: UIPosition): void {
//     const series = _.cloneDeep(this.uiOption.series);
//     series.convertType = SeriesConvertType.ALIGN;
//     (<UIGridChartPresentation>series).align.hAlign = type;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { series });
//
//     this.draw(true);
//   }
//
//   /**
//    * grid 텍스트 세로 정렬
//    *
//    * @param {Position} type
//    */
//   public textVAlign(type: UIPosition): void {
//     const series = _.cloneDeep(this.uiOption.series);
//     series.convertType = SeriesConvertType.VALIGN;
//     (<UIGridChartPresentation>series).align.vAlign = type;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { series });
//
//     this.draw(true);
//   }
//
//   /**
//    * grid layout
//    *
//    * @param {Orient} orient
//    */
//   public gridLayout(orient: UIOrient): void {
//     if (_.eq((<UIGridChartPresentation>this.uiOption.series).dataType, GridViewType.MASTER)) {
//       Alert.info('MASTER');
//     }
//     const series = _.cloneDeep(this.uiOption.series);
//     series.convertType = SeriesConvertType.LAYOUT;
//     (<UIGridChartPresentation>series).layout = orient;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { series });
//     this.search(String(ChartType.GRID), {});
//   }
//
//   /**
//    * grid 측정값 컬럼 표시여부
//    *
//    * @param {Orient} orient
//    */
//   public showValueColumn(show: boolean): void {
//     if (_.eq((<UIGridChartPresentation>this.uiOption.series).showValueColumn, GridViewType.MASTER)) {
//       Alert.info('MASTER');
//     }
//     const series = _.cloneDeep(this.uiOption.series);
//     series.convertType = SeriesConvertType.SHOW;
//     (<UIGridChartPresentation>series).showValueColumn = show;
//     this.uiOption = <UIOption>_.extend({}, this.uiOption, { series });
//     this.search(String(ChartType.GRID), {});
//   }
//
// }
//
