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

import {
  AxisLabelType,
  AxisType,
  BarMarkType,
  ChartAxisLabelType,
  ChartColorList,
  ChartColorType,
  ChartGradientType,
  ChartType,
  ColorRangeType,
  DataLabelPosition,
  DataUnit,
  FontSize,
  FontWeight,
  GraphicType,
  GridViewType,
  LabelLayoutType,
  LineCornerType,
  LineMarkType,
  LineMode,
  LineStyle as LineChartStyle,
  LineType,
  Orient,
  PieSeriesViewType,
  PointShape,
  Position,
  SymbolType,
  TriggerType,
  UIChartDataLabelDisplayType,
  UIFormatCurrencyType,
  UIFormatSymbolPosition,
  UIFormatType,
  UIOrient,
  UIPosition
} from '../define/common';
import { Title } from '../define/title';
import { Legend } from '../define/legend';
import { Grid } from '../define/grid';
import {Axis, AxisLabel, AxisLine, AxisTick, Radar, SplitLine} from '../define/axis';
import { DataZoomType, InsideDataZoom, SliderDataZoom } from '../define/datazoom';
import { Tooltip } from '../define/tooltip';
import { Toolbox } from '../define/toolbox';
import { Brush } from '../define/brush';
import { Series } from '../define/series';
import { BaseOption } from '../base-option';
import {
  ColorRange,
  UIChartAxis,
  UIChartColorByDimension,
  UIChartColorBySeries,
  UIChartColorByValue,
  UIChartFormat,
  UIChartFormatItem,
  UIChartLegend,
  UIChartZoom,
  UIOption
} from '../ui-option';
import { PiecewiseVisualmap, Visualmap, VisualMapType } from '../define/visualmap';
import * as _ from 'lodash';
import { Graphic } from '../define/graphic';
import {
  DataStyle,
  GraphicStyle,
  ItemStyleSet,
  LabelStyle,
  LabelStyleSet,
  LineStyleSet,
  SymbolStyle,
  TextStyle
} from '../define/style';
import { UIBarChart } from '../ui-option/ui-bar-chart';
import { UILineChart } from '../ui-option/ui-line-chart';
import { UIScatterChart } from '../ui-option/ui-scatter-chart';
import { UIGridChart } from '../ui-option/ui-grid-chart';
import { UIChartColorBySingle } from '../ui-option/ui-color';
import { UILabelChart } from '../ui-option/ui-label-chart';
import { UIChartDataLabel } from '../ui-option/ui-datalabel';
import { UICombineChart } from '../ui-option/ui-combine-chart';
import { UIPieChart } from '../ui-option/ui-pie-chart';
import { UIRadarChart } from '../ui-option/ui-radar-chart';

import { CustomSymbol } from '../../../../../domain/workbook/configurations/format';
import { UIChartAxisLabel, UIChartAxisLabelCategory, UIChartAxisLabelValue } from '../ui-option/ui-axis';
import {MapLineStyle, MapThickness, MapType} from '../define/map/map-common';
import { UIMapOption } from '../ui-option/map/ui-map-chart';
import {CommonConstant} from "../../../../constant/common.constant";

export namespace OptionGenerator {

  // 축 라인
  export function defaultLimit( type:ChartType ):number {
    return (ChartType.SANKEY == type) ? 50 : 1000;
  }

  export function initUiOption(uiOption: UIOption): UIOption {

    // 각 차트마다 스타일 초기화
    const type: ChartType = uiOption.type;
    switch (type) {
      case ChartType.BAR :
        uiOption = OptionGenerator.BarChart.defaultBarChartUIOption();
        break;
      case ChartType.LINE :
        uiOption = OptionGenerator.LineChart.defaultLineChartUIOption();
        break;
      case ChartType.CONTROL :
        uiOption = OptionGenerator.LineChart.defaultControlLineChartUIOption();
        break;
      case ChartType.SCATTER :
        uiOption = OptionGenerator.ScatterChart.defaultScatterChartUIOption();
        break;
      case ChartType.HEATMAP :
        uiOption = OptionGenerator.HeatMapChart.defaultHeatMapChartUIOption();
        break;
      case ChartType.GRID :
        uiOption = OptionGenerator.GridChart.defaultGridChartUIOption();
        break;
      case ChartType.BOXPLOT :
        uiOption = OptionGenerator.BoxPlotChart.defaultBoxPlotChartUIOption();
        break;
      case ChartType.PIE :
        uiOption = OptionGenerator.PieChart.defaultPieChartUIOption();
        break;
      case ChartType.LABEL :
        uiOption = OptionGenerator.LabelChart.defaultLabelChartUIOption();
        break;
      case ChartType.WORDCLOUD :
        uiOption = OptionGenerator.WordCloudChart.defaultWordCloudChartUIOption();
        break;
      case ChartType.WATERFALL :
        uiOption = OptionGenerator.WateFallChart.defaultWateFallChartUIOption();
        break;
      case ChartType.RADAR :
        uiOption = OptionGenerator.RadarChart.defaultRadarChartUIOption();
        break;
      case ChartType.TREEMAP :
        uiOption = OptionGenerator.TreeMapChart.defaultTreeMapChartUIOption();
        break;
      case ChartType.COMBINE :
        uiOption = OptionGenerator.CombineChart.defaultCombineChartUIOption();
        break;
      case ChartType.NETWORK :
        uiOption = OptionGenerator.NetworkChart.defaultNetworkChartUIOption();
        break;
      case ChartType.GAUGE :
        uiOption = OptionGenerator.BarChart.gaugeBarChartUIOption();
        break;
      case ChartType.SANKEY :
        uiOption = OptionGenerator.SankeyChart.defaultSankeyChartUIOption();
        break;
      case ChartType.MAP :
        uiOption = OptionGenerator.MapViewChart.defaultMapViewChartUIOption();
        break;
      default:
        console.info('스타일 초기화 실패 => ', type);
        break;
    }

    // set default limit
    if( type !== ChartType.WORDCLOUD && type !== ChartType.SANKEY && type !== ChartType.NETWORK
      && type !== ChartType.GAUGE && type !== ChartType.TREEMAP ) {
      uiOption.limitCheck = true;
      uiOption.limit = OptionGenerator.defaultLimit( type );
    }

    console.info('== initUiOption ==');
    console.info(uiOption);
    console.info('==================');

    return uiOption;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | BaseChart Option 을 생성하기 위한 개별속성 타입별 정의
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Title
   *
   * 차트 타이틀
   */
  export namespace Title {

    /**
     * E-Chart 기본 옵션값 으로 Title 생성
     *
     * @returns {OptionGenerator.Title}
     */
    export function auto(): Title {
      return {};
    }

  }

  /**
   * Grid
   *
   * 차트 그리드 영역
   */
  export namespace Grid {

    // 기본
    const grid = ((top: number, bottom: number, left: number, right: number): Grid => {
      return {
        top,
        bottom,
        left,
        right,
        containLabel: true
      };
    });

    /**
     * E-Chart 기본 옵션값 으로 Grid 생성
     *
     * @returns {OptionGenerator.Grid}
     */
    export function auto(): Grid {
      return {};
    }

    /**
     * @preset 세로 보기일떄 Grid 생성
     *
     * @returns {Grid}
     */
    export function verticalMode(top: number, bottom: number, left: number, right: number, withLegend: boolean, withDataZoom: boolean, withSubAxis: boolean): Grid {
      // bottom 은 미니맵 여부에 따라 수치 적용
      // top, right 는 라벨이 잘릴수 있기 때문에 기본적으로 여백을 둠
      // right 는 보조축이 없는 경우에 여백을 둠
      return grid(withLegend ? 40 : top, withDataZoom ? bottom + 50 : bottom, left + 10, withSubAxis ? 0 : right);
    }

    /**
     * @preset 가로 보기일떄 Grid 생성
     *
     * @returns {Grid}
     */
    export function horizontalMode(top: number, bottom: number, left: number, right: number, withLegend: boolean, withDataZoom: boolean): Grid {
      // right 은 미니맵 여부에 따라 수치 적용
      return grid(withLegend ? 40 : top, bottom + 10, withDataZoom ? left + 50 : left + 10, right);
    }

    /**
     * @preset 가로,세로 모두 확대가 가능한 Grid 생성
     * @param top
     * @param bottom
     * @param left
     * @param right
     * @param withLegend
     * @param withDataZoom
     * @returns {Grid}
     */
    export function bothMode(top: number, bottom: number, left: number, right: number, withLegend: boolean, withDataZoom: boolean): Grid {
      // bottom, right 은 미니맵 여부에 따라 수치 적용
      return grid(withLegend ? 40 : top, withDataZoom ? bottom + 50 : bottom, withDataZoom ? left + 50 : left, right);
    }

  }

  /**
   * Axis
   */
  export namespace Axis {

    // 축 타이틀 스타일
    const axisTitleStyle = ((): TextStyle => {
      return {
        fontSize: 13,
        fontWeight: FontWeight.BOLD,
        fontFamily: 'SpoqaHanSans'
      };
    });

    // 축 라벨 스타일
    const axisLabelStyle = ((): TextStyle => {
      return {
        fontSize: 13,
        fontFamily: 'SpoqaHanSans'
      };
    });

    // 축 단위 라벨
    const axisLabel = ((show: boolean): AxisLabel => {
      return {
        show,
        inside: !show,
        fontSize: 13,
        fontFamily: 'SpoqaHanSans'
      };
    });

    // 축 단위 눈금
    const axisTick = ((show: boolean): AxisTick => {
      return {
        show
      };
    });

    // 축 라인
    const axisLine = ((show: boolean): AxisLine => {
      return {
        show
      };
    });

    // 축을 분리하는 구분선
    const splitLine = ((): SplitLine => {
      return {};
    });

    // radar
    const radar = ((): Radar => {
      return { indicator: [] };
    });

    /**
     * @preset CategoryAxis 생성
     *
     * @returns {Axis}
     */
    export function categoryAxis(nameLocation: Position, nameGap: number, inverse: boolean, showLabel: boolean, showTick: boolean, showLine: boolean): Axis {
      return {
        nameLocation,
        nameGap,
        inverse,
        type: AxisType.CATEGORY,
        nameTextStyle: axisTitleStyle(),
        axisLabel: axisLabel(showLabel),
        axisTick: axisTick(showTick),
        axisLine: axisLine(showLine),
        show: true,
        data: []
      };
    }

    /**
     * @preset ValueAxis 생성
     *
     * @returns {Axis}
     */
    export function valueAxis(nameLocation: Position, nameGap: number, scale: boolean, inverse: boolean, showLabel: boolean, showTick: boolean, showLine: boolean): Axis {
      return {
        nameLocation,
        nameGap,
        scale,
        inverse,
        type: AxisType.VALUE,
        nameTextStyle: axisTitleStyle(),
        axisLabel: axisLabel(showLabel),
        axisTick: axisTick(showTick),
        axisLine: axisLine(showLine),
        splitLine: splitLine(),
        show: true
      };
    }

    /**
     * @preset radarAxis 생성
     * @returns {Radar}
     */
    export function radarAxis(): Radar {
      return radar();
    }

  }

  /**
   * Legend
   *
   * 범례
   */
  export namespace Legend {

    // 범례 폰트 스타일
    const legendTextStyle = ((): TextStyle => {
      return {
        fontSize: 13,
        fontFamily: 'SpoqaHanSans'
      };
    });

    /**
     * E-Chart 기본 옵션값 으로 Legend 생성
     *
     * @returns {OptionGenerator.Legend}
     */
    export function auto(): Legend {
      return {};
    }

    /**
     * 속성을 개별로 지정
     *
     * @param {boolean} show
     * @param {boolean} seriesSync
     * @param {Position} left
     * @param {SymbolType} symbol
     * @param {string | number} width
     * @param {number} itemGap
     * @param {number} pageItems
     * @returns {OptionGenerator.Legend}
     */
    export function custom(show: boolean, seriesSync: boolean, left: Position, symbol: SymbolType, width: string | number, itemGap: number, pageItems: number): Legend {
      return { show, seriesSync, left, symbol, width, itemGap, pageItems, textStyle: legendTextStyle() };
    }

  }

  /**
   * DataZoom
   *
   * 차트 확대, 스크롤이 가능한 미니맵 객체
   */
  export namespace DataZoom {

    // slider
    const verticalSliderDataZoom = ((): SliderDataZoom => {
      return {
        orient: Orient.VERTICAL,
        type: DataZoomType.SLIDER,
        left: 0
      };
    });

    const horizontalSliderDataZoom = ((): SliderDataZoom => {
      return {
        orient: Orient.HORIZONTAL,
        type: DataZoomType.SLIDER,
        bottom: 0
      };
    });

    // inside
    const insideZoom = ((orient: Orient): InsideDataZoom => {
      return {
        orient,
        type: DataZoomType.INSIDE
      };
    });

    /**
     * @preset 세로 Slider DataZoom 생성
     *
     * @returns {SliderDataZoom}
     */
    export function verticalDataZoom(): SliderDataZoom {
      // 가로 슬라이더도 존재 할 경우 겹치는 부분이 없도록 bottom 조절
      return verticalSliderDataZoom();
    }

    /**
     * @preset  가로 Slider DataZoom 생성
     *
     * @returns {SliderDataZoom}
     */
    export function horizontalDataZoom(): SliderDataZoom {
      return horizontalSliderDataZoom();
    }

    /**
     * @preset  세로 Inside DataZoom 생성
     *
     * @returns {InsideDataZoom}
     */
    export function verticalInsideDataZoom(): InsideDataZoom {
      return insideZoom(Orient.VERTICAL);
    }

    /**
     * @preset  가로 Inside DataZoom 생성
     *
     * @returns {InsideDataZoom}
     */
    export function horizontalInsideDataZoom(): InsideDataZoom {
      return insideZoom(Orient.HORIZONTAL);
    }

  }

  /**
   * Toolox
   *
   * 차트 표현을 변경할 수 있는 툴박스
   */
  export namespace Toolbox {

    // 기본
    const toolbox = ((show: boolean): Toolbox => {
      return {
        show,
        feature: {
          dataZoom : {
            show
          }
        }
      };
    });

    /**
     * E-Chart 기본 옵션값 으로 Toolbox 생성
     *
     * @returns {OptionGenerator.Toolbox}
     */
    export function auto(): Toolbox {
      return {};
    }

    /**
     * @preset 차트 내부에 툴박스를 표시하지 않음
     *
     * @returns {Toolbox}
     */
    export function hiddenToolbox(): Toolbox {
      return toolbox(false);
    }

  }

  /**
   * ToolTip
   *
   * 차트 데이터 마우스 오버시 해당하는 데이터의 정보를 보여주는 툴팁
   */
  export namespace Tooltip {

    // 툴팁
    const tooltip = ((trigger: TriggerType): Tooltip => {
      return {
        trigger
      };
    });

    /**
     * E-Chart 기본 옵션값 으로 Toolbox 생성
     *
     * @returns {OptionGenerator.Tooltip}
     */
    export function auto(): Tooltip {
      return {};
    }

    /**
     * @preset 동일 dataIndex를 가진 데이터를 모두 보여주는 툴팁
     *
     * @returns {Tooltip}
     */
    export function axisTooltip(): Tooltip {
      return tooltip(TriggerType.AXIS);
    }

    /**
     * @preset 마우스 오버된 데이터만 보여주는 툴팁
     *
     * @returns {Tooltip}
     */
    export function itemTooltip(): Tooltip {
      return tooltip(TriggerType.ITEM);
    }

  }

  /**
   * Brush
   */
  export namespace Brush {

    // 브러쉬
    const brush = ((transformable?: boolean, inBrush?: SymbolStyle, outOfBrush?: SymbolStyle): Brush => {
      return {
        transformable,
        inBrush,
        outOfBrush
      };
    });

    /**
     * E-Chart 기본 옵션값 으로 Brush 생성
     *
     * @returns {OptionGenerator.Brush}
     */
    export function auto(): Brush {
      return {};
    }

    /**
     * @preset 셀렉트 모드에 사용되는 브러쉬
     *
     * @returns {Brush}
     */
    export function selectBrush(): Brush {
      return brush(false, SymbolStyle.defaultSymbolStyle(), SymbolStyle.dimmedSymbolStyle());
    }

  }

  /**
   * VisualMap
   */
  export namespace VisualMap {

    // 기본
    const visualMap = ((type: VisualMapType): Visualmap => {
      return {
        type,
        calculable: true,
        show: true,
        orient: Orient.HORIZONTAL,
        hoverLink: true,
        top: Position.TOP,
        left: Position.CENTER,
        itemHeight: '300%',
        itemWidth: 15,
      };
    });

    /**
     * @preset Continuous VisualMap 생성
     *
     * @returns {Visualmap}
     */
    export function continuousVisualMap(): Visualmap {
      return visualMap(VisualMapType.CONTINUOUS);
    }

    /**
     * @preset Piecewise VisualMap 생성
     *
     * @returns {Visualmap}
     */
    export function piecewiseVisualMap(): PiecewiseVisualmap {
      return visualMap(VisualMapType.PIECEWISE);
    }

  }

  /**
   * Series
   */
  export namespace Series {

    // 차트 시리즈
    const series = ((): Series[] => {
      return [];
    });

  }

  /**
   * Graphic
   */
  export namespace Graphic {

    // 그래픽 객체
    const graphic = ((id: string, type: GraphicType, left: Position, top: Position): Graphic => {
      return {
        id,
        type,
        left,
        top
      };
    });

    // 그래픽 객체 구성 요소
    const graphicItem = ((type: GraphicType, left: Position, top: Position | string, style: GraphicStyle): Graphic => {
      return {
        type,
        left,
        top,
        style
      };
    });

    // 그래픽 스타일
    const graphicStyle = ((fill: string, text: string, font: string): GraphicStyle => {
      return {
        fill,
        text,
        font
      };
    });

    /**
     * custom Graphic 생성
     *
     * @param {string} id
     * @param {GraphicType} type
     * @param {Position} left
     * @param {Position} top
     * @returns {OptionGenerator.Graphic}
     */
    export function customGraphic(id: string, type: GraphicType, left: Position, top: Position): Graphic {
      return graphic(id, type, left, top);
    }

    /**
     * custom Graphic 요소 생성
     *
     * @param {GraphicType} type
     * @param {Position} left
     * @param {Position | string} top
     * @param style
     * @returns {GraphicStyle}
     */
    export function customGraphicItem(type: GraphicType, left: Position, top: Position | string, style: GraphicStyle): Graphic {
      return graphicItem(type, left, top, style);
    }

    /**
     * custom Graphic 스타일 생성
     *
     * @param {string} fill
     * @param {string} text
     * @param {string} font
     * @returns {{fill: string; text: string; font: string}}
     */
    export function customGraphicStyle(fill: string, text: string, font: string): GraphicStyle {
      return graphicStyle(fill, text, font);
    }

  }

  /**
   * ItemStyle
   */
  export namespace ItemStyle {

    // 기본 아이템 Normal 스타일 생성
    const itemStyle = ((color?: string, borderColor?: string, borderWidth?: number, borderType?: LineType, shadowBlur?: number, shadowColor?: string, shadowOffsetX?: number, shadowOffsetY?: number, opacity?: number): DataStyle => {
      return {
        color,
        borderColor,
        borderWidth,
        borderType,
        shadowBlur,
        shadowColor,
        shadowOffsetX,
        shadowOffsetY,
        opacity
      };
    });

    /**
     * E-Chart 기본 옵션값 으로 ItemStyleSet 생성
     *
     * @returns {{normal: ItemStyleSet}}
     */
    export function auto(): ItemStyleSet {
      return {
        normal: {},
        emphasis: {}
      };
    }

    /**
     * E-Chart 기본 옵션값으로 ItemStyleSet 생성 - Opacity 1
     * @returns {{normal: ItemStyleSet}}
     */
    export function opacity1(): ItemStyleSet {
      return {
        normal: { opacity : 1 },
        emphasis: {}
      };
    }

    /**
     * custom item 스타일 생성
     *
     * @returns {ItemStyleSet}
     */
    export function customItemNormalStyle(color?: string, borderColor?: string, borderWidth?: number, borderType?: LineType, shadowBlur?: number, shadowColor?: string, shadowOffsetX?: number, shadowOffsetY?: number, opacity?: number): DataStyle {
      return itemStyle(color, borderColor, borderWidth, borderType, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, opacity);
    }

    export function customItemEmphasisStyle(color?: string, borderColor?: string, borderWidth?: number, borderType?: LineType, shadowBlur?: number, shadowColor?: string, shadowOffsetX?: number, shadowOffsetY?: number, opacity?: number): DataStyle {
      return itemStyle(color, borderColor, borderWidth, borderType, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, opacity);
    }

    export function customItemStyle(color?: string, borderColor?: string, borderWidth?: number, borderType?: LineType, shadowBlur?: number, shadowColor?: string, shadowOffsetX?: number, shadowOffsetY?: number, opacity?: number): ItemStyleSet {
      return {
        normal: itemStyle(color, borderColor, borderWidth, borderType, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, opacity)
      };
    }

  }

  /**
   * LineStyle
   */
  export namespace LineStyle {

    // 기본 라인 Normal 스타일 생성
    const lineStyle = ((color?: string, width?: number, type?: LineType, shadowBlur?: number, shadowColor?: string, shadowOffsetX?: number, shadowOffsetY?: number, opacity?: number): DataStyle => {
      return {
        color,
        width,
        type,
        shadowBlur,
        shadowColor,
        shadowOffsetX,
        shadowOffsetY,
        opacity
      };
    });

    /**
     * E-Chart 기본 옵션값 으로 LineStyleSet 생성
     *
     * @returns {{normal: LineStyleSet}}
     */
    export function auto(): LineStyleSet {
      return {
        normal: {}
      };
    }

    /**
     * custom line 스타일 생성
     *
     * @returns {ItemStyleSet}
     */
    export function customLineNormalStyle(color?: string, width?: number, type?: LineType, shadowBlur?: number, shadowColor?: string, shadowOffsetX?: number, shadowOffsetY?: number, opacity?: number): DataStyle {
      return lineStyle(color, width, type, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, opacity);
    }

    export function customItemStyle(color?: string, width?: number, type?: LineType, shadowBlur?: number, shadowColor?: string, shadowOffsetX?: number, shadowOffsetY?: number, opacity?: number): ItemStyleSet {
      return {
        normal: lineStyle(color, width, type, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, opacity)
      };
    }

  }

  /**
   * AreaStyle
   */
  export namespace AreaStyle {

    // 기본 영역 Normal 스타일 생성
    const areaStyle = ((opacity: number): DataStyle => {
      return {
        opacity
      };
    });

    // radar 스타일 생성
    const radarAreaStyle = ((type?: string): any => {
      return {
        type: type
      };
    });

    /**
     * E-Chart 기본 옵션값 으로 ItemStyleSet 생성
     *
     * @returns {{normal: ItemStyleSet}}
     */
    export function auto(): ItemStyleSet {
      return {
        normal: {}
      };
    }

    /**
     * custom Area 스타일 생성
     *
     * @returns {ItemStyleSet}
     */
    export function customAreaNormalStyle(opacity?: number): DataStyle {
      return areaStyle(opacity);
    }

    export function customAreaStyle(opacity?: number): ItemStyleSet {
      return {
        normal: areaStyle(opacity)
      };
    }

    export function radarItemAreaStyle(type?: string): ItemStyleSet {
      return {
        normal: radarAreaStyle(type)
      };
    }

  }

  /**
   * LabelStyle
   */
  export namespace LabelStyle {

    // 기본 라벨 Normal 스타일 생성
    const normalLabelStyle = ((show: boolean, position?: Position): LabelStyle => {
      return {
        show,
        position: _.eq(position, Position.AUTO) ? undefined : position
      };
    });

    // 기본 라벨 Emphasis 스타일 생성
    const emphasisLabelStyle = ((color?: string): LabelStyle => {
      return {
        color
      };
    });


    /**
     * E-Chart 기본 옵션값 으로 LabelStyleSet 생성
     *
     * @returns {{normal: LabelStyleSet}}
     */
    export function auto(): LabelStyleSet {
      return {
        normal: {}
      };
    }

    /**
     * @preset 기본 라벨 스타일 생성
     * @param show
     * @param position
     * @returns {{normal: LabelStyle}}
     */
    export function defaultLabelStyle(show: boolean, position: Position): LabelStyleSet {
      return {
        normal: normalLabelStyle(show, position)
      };
    }

    /**
     * @preset 스택 bar 라벨 스타일 생성
     *
     * @param orient
     * @returns {{normal: LabelStyle, emphasis: LabelStyle}}
     */
    export function stackBarLabelStyle(orient: Orient, show?: boolean, chartType?: ChartType): LabelStyleSet {
      return {
        normal: _.eq(orient, Orient.VERTICAL) ? normalLabelStyle(show, Position.INSIDETOP) : _.eq(chartType, ChartType.GAUGE) ? normalLabelStyle(show, Position.INSIDE) : normalLabelStyle(show, Position.INSIDERIGHT),
        emphasis: emphasisLabelStyle('#fff')
      };
    }

    /**
     * @preset multiple bar 라벨 스타일 생성
     *
     * @param orient
     * @returns {{normal: LabelStyle}}
     */
    export function multipleBarLabelStyle(orient: Orient, show?: boolean): LabelStyleSet {
      return {
        normal: _.eq(orient, Orient.VERTICAL) ? normalLabelStyle(show, Position.TOP) : normalLabelStyle(show, Position.RIGHT),
      };
    }

  }

  /**
   * SymbolStyle
   *
   * 심볼 스타일
   */
  export namespace SymbolStyle {

    // 기본 심볼 스타일
    const symbol = ((opacity?: number, symbol?: SymbolType): SymbolStyle => {
      return {
        opacity,
        symbol
      };
    });

    /**
     * @preset 기본 SymbolStyle 생성
     *
     * @returns {SymbolStyle}
     */
    export function defaultSymbolStyle(): SymbolStyle {
      return symbol(1);
    }

    /**
     * @preset dimmed처리 SymbolStyle 생성
     *
     * @returns {SymbolStyle}
     */
    export function dimmedSymbolStyle(): SymbolStyle {
      return symbol(0.2);
    }

  }

  /**
   * TextStyle
   *
   * 텍스트 스타일
   */
  export namespace TextStyle {

    // 기본 텍스트 스타일
    const textStyle = ((color?: string, fontFamily?: string, fontWeight?: FontWeight, fontSize?: number): TextStyle => {
      return {
        color,
        fontFamily,
        fontWeight,
        fontSize
      };
    });

    /**
     * 기본 텍스트 스타일 생성 - E-Chart 기본값
     *
     * @returns {{normal: TextStyle}}
     */
    export function auto(): TextStyle {
      return {};
    }

    /**
     * custom text 스타일 생성
     *
     * @returns {TextStyle}
     */
    export function customTextStyle(color?: string, fontFamily?: string, fontWeight?: FontWeight, fontSize?: number): TextStyle {
      return textStyle(color, fontFamily, fontWeight, fontSize);
    }

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | UI Option 을 생성하기 위한 Default 속성 Generate
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  export namespace UI {

    /**
     * 차트 색상
     */
    export namespace Color {

      /**
       * Color by Dimension 옵션 생성
       * @param schema
       * @returns {{schema: string, targetField: string, type: ChartColorType}}
       */
      export function dimensionUIChartColor(schema: string): UIChartColorByDimension {
        return {
          schema,
          targetField: '',
          type: ChartColorType.DIMENSION
        };
      }

      /**
       * Color by Measure 옵션 생성
       *
       * @param {ChartColorList} codes
       * @returns {UIChartColorByMeasure}
       */
      export function measureUIChartColor(schema: string): UIChartColorBySeries {
        return {
          schema,
          type: ChartColorType.SERIES
        };
      }

      /**
       * Color By Value 옵션 생성
       *
       * @param {ChartGradientType} mode
       * @param {ChartColorList} codes
       * @param {ColorRange[]} ranges
       * @returns {UIChartColorByValue}
       */
      export function valueUIChartColor(mode: ChartGradientType, schema: string): UIChartColorByValue {
        return {
          mode,
          schema,
          type: ChartColorType.MEASURE
        };
      }

      /**
       * Color by single 옵션 생성
       * @param code code string값 (필수값)
       * @returns {{type: ChartColorType, code: string}}
       */
      export function singleUIChartColor(code: string): UIChartColorBySingle {
        return {
          type: ChartColorType.SINGLE,
          code
        };
      }
    }

    /**
     * 차트 색상 범위
     */
    export namespace Range {

      /**
       * color range 옵션 생성
       * @param type
       * @param color
       * @param fixMin 시작 범위
       * @param fixMax 종료 범위
       * @param gt 범위내의 시작수치
       * @param lte 범위내의 종료수치
       * @param symbol
       * @returns {{type: ColorRangeType, fixMin: number, fixMax: number, gt: number, lte: number, color: string, symbol: string}}
       */
      export function colorRange(type: ColorRangeType, color: string, fixMin?: number, fixMax?: number, gt?: number, lte?: number, symbol: string = 'circle'): ColorRange {
        return {
          type,
          fixMin,
          fixMax,
          gt,
          lte,
          color,
          symbol
        };
      }
    }


    /**
     * 차트 포맷
     */
    export namespace Format {

      /**
       * 속성을 개별로 지정
       * @param isAll
       * @param each
       * @param type
       * @param sign
       * @param decimal
       * @param useThousandsSep
       * @returns {{isAll: boolean, each: UIChartFormatItem[], type: string, sign: string, decimal: number, useThousandsSep: boolean}}
       */
      export function custom(isAll: boolean, each: UIChartFormatItem[], type: string, sign: string, decimal: number, useThousandsSep: boolean): UIChartFormat {
        return {
          isAll: isAll,
          each: each,
          type: type,
          sign: sign,
          decimal: decimal,
          useThousandsSep: useThousandsSep
        };
      }

      /**
       * 사용자 기호설정
       * @param pos : 위치
       */
      export function customSymbol(pos: UIFormatSymbolPosition): CustomSymbol {
        return {
          pos,
          value: '',
          abbreviations: false
        }
      }
    }

    /**
     * 차트 축
     */
    export namespace Axis {

      /**
       * X축 옵션 생성
       *
       * @returns {UIChartAxis}
       */
      export function xAxis(mode: AxisLabelType, showName: boolean, showLabel: boolean, label?: UIChartAxisLabel): UIChartAxis {
        return {
          mode,
          showName,
          showLabel,
          label
        };
      }

      /**
       * Y축 옵션 생성
       *
       * @returns {UIChartAxis}
       */
      export function yAxis(mode: AxisLabelType, showName: boolean, showLabel: boolean, label?: UIChartAxisLabel): UIChartAxis {
        return {
          mode,
          showName,
          showLabel,
          label
        };
      }

    }

    /**
     * 축의 label
     */
    export namespace AxisLabel {

      export function axisLabelForValue(type: ChartAxisLabelType): UIChartAxisLabelValue {
        return {
          type,
          useDefault : true
        }
      }

      export function axisLabelForCategory(type: ChartAxisLabelType): UIChartAxisLabelCategory {
        return {
          type
        }
      }
    }

    /**
     * 차트 Data Label
     */
    export namespace DataLabel {

      export function label(showValue: boolean, displayTypes?: UIChartDataLabelDisplayType[], pos?: DataLabelPosition): UIChartDataLabel {
        return {
          showValue,
          displayTypes,
          pos
        }
      }
    }

    /**
     * 차트 범례
     */
    export namespace Legend {

      // 범례 폰트 스타일
      const legendTextStyle = ((): TextStyle => {
        return {
          fontSize: 13,
          fontFamily: 'SpoqaHanSans'
        };
      });

      /**
       * 페이징이 가능한 범례 옵션 생성
       * @param show
       * @param count
       * @returns {{count: number, auto: boolean, pos: UIPosition, textStyle: TextStyle}}
       */
      export function pagingLegend(show: boolean, count: number): UIChartLegend {
        return {
          count,
          auto: show,
          pos: UIPosition.TOP,
          textStyle: legendTextStyle()
        };
      }
    }

    /**
     * 차트 확대/축소 정보
     */
    export namespace DataZoom {

      /**
       * 미니맵 옵션 생성
       * @returns {UIChartZoom}
       */
      export function sliderDataZoom(show: boolean, orient: UIOrient): UIChartZoom {
        return {
          orient,
          auto: show
        };
      }

    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | 차트별 Default E-Chart, UI 옵션 Generate
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Bar Chart
   */
  export namespace BarChart {

    /**
     * 기본 Bar 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultBarChartOption(): BaseOption {
      return {
        type: ChartType.BAR,
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
     * Histogram Bar 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function histogramBarChartOption(): BaseOption {
      return {
        type: ChartType.BAR,
        grid: [Grid.verticalMode(10, null, 10, 10, false, true, false)],
        xAxis: [Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
        yAxis: [Axis.categoryAxis(Position.MIDDLE, null, false, false, true, true)],
        legend: Legend.custom(false, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
        tooltip: Tooltip.axisTooltip(),
        series: []
      };
    }

    /**
     * Gauge Bar 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function gaugeBarChartOption(): BaseOption {
      return {
        type: ChartType.GAUGE,
        grid: [Grid.verticalMode(10, 0, 0, 10, false, true, false)],
        xAxis: [Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
        yAxis: [Axis.categoryAxis(Position.MIDDLE, null, false, true, true, true)],
        legend: Legend.custom(false, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
        tooltip: Tooltip.itemTooltip(),
        toolbox: Toolbox.hiddenToolbox(),
        brush: Brush.selectBrush(),
        series: []
      };
    }

    /**
     * 화면 UI와 연동되는 기본 Bar 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultBarChartUIOption(): UIBarChart {
      return {
        type: ChartType.BAR,
        color: UI.Color.measureUIChartColor('SC1'),
        xAxis: UI.Axis.xAxis(AxisLabelType.ROW, true, true, UI.AxisLabel.axisLabelForCategory(ChartAxisLabelType.CATEGORY)),
        yAxis: UI.Axis.yAxis(AxisLabelType.COLUMN, true, true, UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE)),
        dataLabel: UI.DataLabel.label(false),
        legend: UI.Legend.pagingLegend(false, 5),
        chartZooms: [UI.DataZoom.sliderDataZoom(true, UIOrient.HORIZONTAL)],
        mark: BarMarkType.MULTIPLE,
        align: UIOrient.VERTICAL,
        //series: UI.Presentation.barPresentation(DataUnit.NONE),
        fontSize: FontSize.NORMAL,
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true)
      };
    }

    /**
     *  화면 UI와 연동되는 Histogram Bar 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function histogramBarChartUIOption(): UIBarChart {
      return {
        type: ChartType.BAR,
        color: UI.Color.measureUIChartColor('SC1'),
        xAxis: UI.Axis.xAxis(AxisLabelType.ROW, true, true, UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE)),
        yAxis: UI.Axis.yAxis(AxisLabelType.COLUMN, false, false, UI.AxisLabel.axisLabelForCategory(ChartAxisLabelType.CATEGORY)),
        dataLabel: UI.DataLabel.label(false),
        align: UIOrient.HORIZONTAL
      };
    }

    /**
     * Gauge Bar 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function gaugeBarChartUIOption(): UIBarChart {
      return {
        type: ChartType.GAUGE,
        color: UI.Color.dimensionUIChartColor('SC1'),
        xAxis: UI.Axis.xAxis(AxisLabelType.ROW, true, true, UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE)),
        yAxis: UI.Axis.yAxis(AxisLabelType.COLUMN, true, true, UI.AxisLabel.axisLabelForCategory(ChartAxisLabelType.CATEGORY)),
        dataLabel: UI.DataLabel.label(false),
        legend: UI.Legend.pagingLegend(false, 5),
        mark: BarMarkType.STACKED,
        align: UIOrient.HORIZONTAL,
        unitType: DataUnit.PERCENT,
        fontSize: FontSize.NORMAL,
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true)
      };
    }

  }

  /**
   * Line Chart
   */
  export namespace LineChart {

    /**
     * 기본 Line 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultLineChartOption(): BaseOption {
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
     * 화면 UI와 연동되는 옵션 Line 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultLineChartUIOption(): UILineChart {
      return {
        type: ChartType.LINE,
        color: UI.Color.measureUIChartColor('SC1'),
        xAxis: UI.Axis.xAxis(AxisLabelType.ROW, true, true, UI.AxisLabel.axisLabelForCategory(ChartAxisLabelType.CATEGORY)),
        yAxis: UI.Axis.yAxis(AxisLabelType.COLUMN, true, true, UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE)),
        dataLabel: UI.DataLabel.label(false),
        legend: UI.Legend.pagingLegend(true, 5),
        chartZooms: [UI.DataZoom.sliderDataZoom(true, UIOrient.HORIZONTAL)],
        mark: LineMarkType.LINE,
        curveStyle: LineCornerType.STRAIGHT,
        lineStyle: LineChartStyle.POINT_LINE,
        lineMode: LineMode.NORMAL,
        fontSize: FontSize.NORMAL,
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true)
      };
    }


    /**
     * 화면 UI와 연동되는 옵션 Control Line 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultControlLineChartUIOption(): UIOption {
      return _.extend(defaultLineChartUIOption(), { type: ChartType.CONTROL });
    }

  }

  /**
   * Scatter Chart
   */
  export namespace ScatterChart {

    /**
     * 기본 Scatter 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultScatterChartOption(): BaseOption {
      return {
        type: ChartType.SCATTER,
        grid: [Grid.bothMode(10, 0, 0, 0, false, true)],
        legend: Legend.custom(false, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
        xAxis: [Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
        yAxis: [Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
        dataZoom: [DataZoom.horizontalDataZoom(), DataZoom.verticalDataZoom(), DataZoom.verticalInsideDataZoom(), DataZoom.horizontalInsideDataZoom()],
        tooltip: Tooltip.itemTooltip(),
        toolbox: Toolbox.hiddenToolbox(),
        brush: Brush.selectBrush(),
        series: []
      };
    }

    /**
     * 화면 UI와 연동되는 Scatter 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultScatterChartUIOption(): UIScatterChart {
      return {
        type: ChartType.SCATTER,
        color: UI.Color.dimensionUIChartColor('SC1'),
        // size: 15,
        xAxis: UI.Axis.xAxis(AxisLabelType.ROW, true, true, UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE)),
        yAxis: UI.Axis.yAxis(AxisLabelType.COLUMN, true, true, UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE)),
        dataLabel: UI.DataLabel.label(false),
        legend: UI.Legend.pagingLegend(true, 5),
        chartZooms: [UI.DataZoom.sliderDataZoom(true, UIOrient.HORIZONTAL), UI.DataZoom.sliderDataZoom(true, UIOrient.VERTICAL)],
        pointShape: PointShape.CIRCLE,
        pointTransparency: 1,
        fontSize: FontSize.NORMAL,
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true)
      };
    }

  }

  /**
   * HeatMap Chart
   */
  export namespace HeatMapChart {

    /**
     * 기본 HeatMap 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultHeatMapChartOption(): BaseOption {
      return {
        type: ChartType.HEATMAP,
        grid: [Grid.bothMode(10, 0, 0, 0, false, true)],
        legend: Legend.custom(false, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
        xAxis: [Axis.categoryAxis(Position.MIDDLE, null, false, true, true, true)],
        yAxis: [Axis.categoryAxis(Position.MIDDLE, null, true, true, true, true)],
        dataZoom: [DataZoom.horizontalDataZoom(), DataZoom.verticalDataZoom(), DataZoom.verticalInsideDataZoom(), DataZoom.horizontalInsideDataZoom()],
        tooltip: Tooltip.itemTooltip(),
        toolbox: Toolbox.hiddenToolbox(),
        brush: Brush.selectBrush(),
        series: []
      };
    }

    /**
     * 화면 UI와 연동되는 HeatMap 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultHeatMapChartUIOption(): UIOption {
      return {
        type: ChartType.HEATMAP,
        color: UI.Color.valueUIChartColor(ChartGradientType.LINEAR, 'VC1'),
        xAxis: UI.Axis.xAxis(AxisLabelType.ROW, true, true, UI.AxisLabel.axisLabelForCategory(ChartAxisLabelType.CATEGORY)),
        yAxis: UI.Axis.yAxis(AxisLabelType.COLUMN, true, true, UI.AxisLabel.axisLabelForCategory(ChartAxisLabelType.CATEGORY)),
        dataLabel: UI.DataLabel.label(false),
        legend: UI.Legend.pagingLegend(true, 5),
        chartZooms: [UI.DataZoom.sliderDataZoom(true, UIOrient.HORIZONTAL), UI.DataZoom.sliderDataZoom(true, UIOrient.VERTICAL)],
        fontSize: FontSize.NORMAL,
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true)
      };
    }

  }

  /**
   * GridChart
   */
  export namespace GridChart {

    /**
     * 화면 UI와 연동되는 Grid 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultGridChartUIOption(): UIGridChart {
      return {
        type: ChartType.GRID,
        color: UI.Color.singleUIChartColor(''),
        dataType: GridViewType.PIVOT,
        measureLayout: UIOrient.VERTICAL,
        headerStyle: {
          fontSize: FontSize.NORMAL,
          showHeader: true,
          fontStyles: [],
          hAlign: UIPosition.LEFT,
          vAlign: UIPosition.MIDDLE,
          backgroundColor: '#ffffff',
          fontColor: '#959595'
        },
        contentStyle: {
          hAlign: UIPosition.LEFT,
          vAlign: UIPosition.MIDDLE,
          fontSize: FontSize.NORMAL,
          fontStyles: [],
          fontColor: '',
          showHeader: false
        },
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true)
      };
    }

  }

  /**
   * BoxPlot Chart
   */
  export namespace BoxPlotChart {

    /**
     * 기본 HeatMap 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultBoxPlotChartOption(): BaseOption {
      return {
        type: ChartType.BOXPLOT,
        grid: [Grid.verticalMode(10, 0, 0, 10, false, true, false)],
        xAxis: [Axis.categoryAxis(Position.MIDDLE, null, false, true, true, true)],
        yAxis: [Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
        dataZoom: [DataZoom.horizontalDataZoom(), DataZoom.horizontalInsideDataZoom()],
        tooltip: Tooltip.itemTooltip(),
        toolbox: Toolbox.hiddenToolbox(),
        series: []
      };
    }

    /**
     * 화면 UI와 연동되는 Boxplot 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultBoxPlotChartUIOption(): UIOption {
      return {
        type: ChartType.BOXPLOT,
        color: UI.Color.valueUIChartColor(ChartGradientType.LINEAR, 'VC1'),
        xAxis: UI.Axis.xAxis(AxisLabelType.ROW, true, true, UI.AxisLabel.axisLabelForCategory(ChartAxisLabelType.CATEGORY)),
        yAxis: UI.Axis.yAxis(AxisLabelType.COLUMN, true, true, UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE)),
        dataLabel: UI.DataLabel.label(false),
        chartZooms: [UI.DataZoom.sliderDataZoom(true, UIOrient.HORIZONTAL)],
        fontSize: FontSize.NORMAL,
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true)
      };
    }

  }

  /**
   * Pie Chart
   */
  export namespace PieChart {

    /**
     * 기본 Pie 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultPieChartOption(): BaseOption {
      return {
        type: ChartType.PIE,
        legend: Legend.custom(true, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
        tooltip: Tooltip.itemTooltip(),
        series: []
      };
    }

    /**
     * 화면 UI와 연동되는 Pie 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultPieChartUIOption(): UIPieChart {
      return {
        type: ChartType.PIE,
        color: UI.Color.dimensionUIChartColor('SC2'),
        dataLabel: UI.DataLabel.label(false),
        legend: UI.Legend.pagingLegend(true, 5),
        markType: PieSeriesViewType.SECTOR,
        fontSize: FontSize.NORMAL,
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true)
      };
    }

  }

  /**
   * Label Chart
   */
  export namespace LabelChart {

    /**
     * 기본 Pie 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultLabelChartOption(): BaseOption {
      return {
        type: ChartType.LABEL,
        series: []
      };
    }

    /**
     * 화면 UI와 연동되는 Pie 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultLabelChartUIOption(): UILabelChart {
      return {
        type: ChartType.LABEL,
        layout: LabelLayoutType.HORIZONTAL,
        showLabel: true,
        icons: [{}],
        annotations: [{}],
        secondaryIndicators: [{}],
        series: [{}],
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true)
      };
    }

  }

  /**
   * WordCloud Chart
   */
  export namespace WordCloudChart {

    /**
     * 기본 Word-Cloud 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultWordCloudChartOption(): BaseOption {
      return {
        type: ChartType.WORDCLOUD,
        series: []
      };
    }

    /**
     * 화면 UI와 연동되는 Word-Cloud 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultWordCloudChartUIOption(): UIOption {
      return {
        type: ChartType.WORDCLOUD,
        color: UI.Color.dimensionUIChartColor('SC1'),
        // 워드클라우드에는 포멧설정시 없으므로 제거
        // valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true)
      };
    }

  }

  /**
   * WaterFall Chart
   */
  export namespace WateFallChart {

    /**
     * 기본 WateFall 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultWateFallChartOption(): BaseOption {
      return {
        type: ChartType.WATERFALL,
        grid: [Grid.verticalMode(10, 0, 0, 10, false, true, false)],
        xAxis: [Axis.categoryAxis(Position.MIDDLE, null, false, true, true, true)],
        yAxis: [Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
        dataZoom: [DataZoom.horizontalDataZoom(), DataZoom.horizontalInsideDataZoom()],
        tooltip: Tooltip.axisTooltip(),
        toolbox: Toolbox.hiddenToolbox(),
        series: []
      };
    }

    /**
     * 화면 UI와 연동되는 기본 WateFall 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultWateFallChartUIOption(): UIBarChart {
      return {
        type: ChartType.WATERFALL,
        xAxis: UI.Axis.xAxis(AxisLabelType.ROW, true, true, UI.AxisLabel.axisLabelForCategory(ChartAxisLabelType.CATEGORY)),
        yAxis: UI.Axis.yAxis(AxisLabelType.COLUMN, true, true, UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE)),
        dataLabel: UI.DataLabel.label(false),
        chartZooms: [UI.DataZoom.sliderDataZoom(true, UIOrient.HORIZONTAL)],
        align: UIOrient.VERTICAL,
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true)
      };
    }

  }

  /**
   * Radar Chart
   */
  export namespace RadarChart {

    /**
     * 기본 Radar 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultRadarChartOption(): BaseOption {
      return {
        type: ChartType.RADAR,
        radar: Axis.radarAxis(),
        legend: Legend.custom(true, true, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
        tooltip: Tooltip.itemTooltip(),
        series: []
      };
    }

    /**
     * 화면 UI와 연동되는 기본 Radar 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultRadarChartUIOption(): UIRadarChart {
      return {
        type: ChartType.RADAR,
        color: UI.Color.measureUIChartColor('SC1'),
        legend: UI.Legend.pagingLegend(true, 5),
        dataLabel: UI.DataLabel.label(false),
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true),
        mark: LineMarkType.LINE
      };
    }

  }

  /**
   * Combine Chart
   */
  export namespace CombineChart {

    /**
     * 기본 Combine 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultCombineChartOption(): BaseOption {
      return {
        type: ChartType.COMBINE,
        grid: [Grid.verticalMode(10, 0, 0, 10, false, true, false)],
        xAxis: [Axis.categoryAxis(Position.MIDDLE, null, false, true, true, true)],
        yAxis: [Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true), Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
        legend: Legend.custom(false, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
        dataZoom: [DataZoom.horizontalDataZoom(), DataZoom.horizontalInsideDataZoom()],
        tooltip: Tooltip.itemTooltip(),
        toolbox: Toolbox.hiddenToolbox(),
        brush: Brush.selectBrush(),
        series: []
      };
    }

    /**
     * 화면 UI와 연동되는 기본 Combine 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultCombineChartUIOption(): UICombineChart {
      return {
        type: ChartType.COMBINE,
        color: UI.Color.measureUIChartColor('SC1'),
        xAxis: UI.Axis.xAxis(AxisLabelType.ROW, true, true, UI.AxisLabel.axisLabelForCategory(ChartAxisLabelType.CATEGORY)),
        yAxis: UI.Axis.yAxis(AxisLabelType.COLUMN, true, true, UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE)),
        secondaryAxis: UI.Axis.yAxis(AxisLabelType.SUBCOLUMN, true, true, UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE)),
        //label: UI.Label.axisLabel(false, false, [UI.Label.labelMode(AxisLabelType.ROW, true, true, AxisLabelMark.HORIZONTAL), UI.Label.labelMode(AxisLabelType.COLUMN, true, true, AxisLabelMark.HORIZONTAL), UI.Label.labelMode(AxisLabelType.SUBCOLUMN, true, true, AxisLabelMark.HORIZONTAL)]),
        dataLabel: UI.DataLabel.label(false),
        legend: UI.Legend.pagingLegend(true, 5),
        chartZooms: [UI.DataZoom.sliderDataZoom(true, UIOrient.HORIZONTAL)],
        barMarkType: BarMarkType.MULTIPLE,
        lineMarkType: LineMarkType.LINE,
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true)
      };
    }
  }

  /**
   * TreeMap Chart
   */
  export namespace TreeMapChart {

    /**
     * 기본 Radar 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultTreeMapChartOption(): BaseOption {
      return {
        type: ChartType.TREEMAP,
        tooltip: Tooltip.itemTooltip(),
        series: []
      };
    }

    /**
     * 화면 UI와 연동되는 기본 Radar 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultTreeMapChartUIOption(): UIOption {
      return {
        type: ChartType.TREEMAP,
        color: UI.Color.dimensionUIChartColor('SC1'),
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true),
        fontSize: FontSize.NORMAL,
        dataLabel: {showValue: true, hAlign: UIPosition.CENTER, vAlign: UIPosition.CENTER, displayTypes: [,,, UIChartDataLabelDisplayType.SERIES_NAME]}
      };
    }
  }

  /**
   * Network Chart
   */
  export namespace NetworkChart {

    /**
     * 기본 Radar 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultNetworkChartOption(): BaseOption {
      return {
        type: ChartType.NETWORK,
        legend: Legend.custom(false, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
        tooltip: Tooltip.itemTooltip(),
        series: []
      };
    }

    /**
     * 화면 UI와 연동되는 기본 Radar 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultNetworkChartUIOption(): UIOption {
      return {
        type: ChartType.NETWORK,
        color: UI.Color.dimensionUIChartColor('SC1'),
        legend: UI.Legend.pagingLegend(true, 5),
        dataLabel: UI.DataLabel.label(true, [,,,,,,,,, UIChartDataLabelDisplayType.NODE_NAME], DataLabelPosition.TOP),
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true)
      };
    }
  }

  /**
   * Sankey Chart
   */
  export namespace SankeyChart {

    /**
     * 기본 Sankey 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultSankeyChartOption(): BaseOption {
      return {
        type: ChartType.SANKEY,
        legend: Legend.custom(false, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
        tooltip: Tooltip.itemTooltip(),
        series: []
      };
    }

    /**
     * 화면 UI와 연동되는 기본 Sankey 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultSankeyChartUIOption(): UIOption {
      return {
        type: ChartType.SANKEY,
        color: UI.Color.dimensionUIChartColor('SC1'),
        legend: UI.Legend.pagingLegend(true, 5),
        dataLabel: UI.DataLabel.label(true, [,,,,,,,,, UIChartDataLabelDisplayType.NODE_NAME]),
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true)
      };
    }
  }

  /**
   * MapView Chart
   */
  export namespace MapViewChart {

    /**
     * 기본 MapView 차트 옵션 생성
     *
     * @returns {BaseOption}
     */
    export function defaultMapViewChartOption(): BaseOption {
      return {
        type: ChartType.MAP,
        tooltip: Tooltip.itemTooltip(),
        series: []
      };
    }

    /**
     * 화면 UI와 연동되는 기본 MapView 차트 옵션 생성
     *
     * @returns {UIOption}
     */
    export function defaultMapViewChartUIOption(): UIMapOption {

      let defaultStyle:string = 'Light';
      const propMapConf = sessionStorage.getItem( CommonConstant.PROP_MAP_CONFIG );
      if ( propMapConf ) {
        const objConf = JSON.parse( propMapConf );
        ( objConf && objConf.defaultBaseMap ) && ( defaultStyle = objConf.defaultBaseMap );
      }

      return <any>{
        type: ChartType.MAP,
        layerNum: 0,
        showMapLayer: true,
        map: MapType.OSM,
        style: defaultStyle,
        licenseNotation: "© OpenStreetMap contributors",
        showDistrictLayer: true,
        districtUnit: "state",
        layers: [
          {
            type: "symbol",
            name: "Layer1",
            symbol: "CIRCLE",        // CIRCLE, SQUARE, TRIANGLE
            color: {
              by: "NONE",            // NONE, MEASURE, DIMENSION
              column: "NONE",
              schema: "#6344ad",
              transparency: 50
            },
            size: {
              "by": "NONE",
              "column": "NONE",
              "max": 10
            },
            outline: null,
            clustering: false,
            coverage: 50,
            thickness: {
              by: "NONE",
              column: "NONE",
              maxValue: 2
            },
            lineStyle: MapLineStyle.SOLID
          }
        ],
        valueFormat: UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true),
        legend: {
          pos: UIPosition.RIGHT_BOTTOM,
          showName: false,
          auto: true
        },
        toolTip: {
          displayColumns: [],
          displayTypes: [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "LAYER_NAME",
            "LOCATION_INFO",
            "DATA_VALUE"
          ]
        }
      };
    }
  }
}
