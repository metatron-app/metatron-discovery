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
 * Created by Dolkkok on 2017. 7. 17..
 */

/*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | Static Variable
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

export const CHART_STRING_DELIMITER: string = '―';

export const SPEC_VERSION: number = 2;

/*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | E-Chart 속성
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

export enum ChartType {
  BAR = 'bar',
  GRID = 'grid',
  LINE = 'line',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap',
  PIE = 'pie',
  MAP = 'map',
  CONTROL = 'control',
  LABEL = 'label',
  LABEL2 = 'label2',
  BOXPLOT = 'boxplot',
  WATERFALL = 'waterfall',
  WORDCLOUD = 'wordcloud',
  COMBINE = 'combine',
  TREEMAP = 'treemap',
  RADAR = 'radar',
  NETWORK = 'network',
  SANKEY = 'sankey',
  GAUGE = 'gauge'
}

/**
 * 시리즈 타입
 */
export enum SeriesType {
  BAR = 'bar',
  LINE = 'line',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap',
  PIE = 'pie',
  BOXPLOT = 'boxplot',
  WORDCLOUD = 'wordCloud',
  TREEMAP = 'treemap',
  RADAR = 'radar',
  GRAPH = 'graph',
  SANKEY = 'sankey'
}

/**
 * 위치값
 */
export enum Position {
  AUTO = 'auto',
  START = 'start',
  END = 'end',
  LEFT = 'left',
  RIGHT = 'right',
  CENTER = 'center',
  TOP = 'top',
  MIDDLE = 'middle',
  BOTTOM = 'bottom',
  INSIDE = 'inside',
  INSIDETOP = 'insideTop',
  INSIDELEFT = 'insideLeft',
  INSIDERIGHT = 'insideRight',
  INSIDEBOTTOM = 'insideBottom',
  OUTSIDE = 'outside',
}

/**
 * 축 타입
 */
export enum AxisType {
  CATEGORY = 'category',
  VALUE = 'value',
  LOG = 'log',
  X = 'xAxis',
  Y = 'yAxis',
  SUB = 'subAxis'
}

/**
 * 라인 타입
 */
export enum LineType {
  SOLID = 'solid',
  DASHED = 'dashed',
  DOTTED = 'dotted'
}

/**
 * 심볼 타입
 */
export enum SymbolType {
  POLYGON = 'polygon',
  CIRCLE = 'circle',
  RECT = 'rect',
  ROUNDRECT = 'roundRect',
  TRIANGLE = 'triangle',
  DIAMOND = 'diamond',
  PIN = 'pin',
  ARROW = 'arrow'
}

/**
 * 심볼 불투명/반투명 여부
 */
export enum SymbolFill {
  SINGLE = 'single',
  TRANSPARENT = 'transparent',
}

/**
 * 폰트 스타일
 */
export enum FontStyle {
  NORMAL = 'normal',
  ITALIC = 'italic',
  OBLIQUE = 'oblique'
}

/**
 * 폰트
 */
export enum FontWeight {
  NORMAL = 'normal',
  BOLD = 'bold',
  BOLDER = 'bolder',
  LIGHTER = 'lighter'
}

/**
 * 표현 방향
 */
export enum Orient {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  BOTH = 'both'
}

/**
 * 축 단위 라벨 회전수치
 */
export enum AxisLabelRotate {
  HORIZONTAL = 0,
  VERTICAL = 90,
  SLOPE = 45,
}

/**
 * 툴팁 표현 기준
 */
export enum TriggerType {
  ITEM = 'item',
  AXIS = 'axis',
  NONE = 'none'
}

/**
 * 툴팁이 표현되는 기준 이벤트
 */
export enum TriggerAction {
  MOUSEMOVE = 'mousemove',
  CLICK = 'click',
  NONE = 'none'
}

/**
 * 이미지 포멧
 */
export enum ImageFormat {
  PNG = 'png',
  JPEG = 'jpeg'
}

/**
 * 툴 박스 항목
 */
export enum ToolboxMagicType {
  LINE = 'line',
  BAR = 'bar',
  STACK = 'stack',
  TILED = 'tiled'
}

/**
 *
 */
export enum ThrottleType {
  DEBOUNCE = 'debounce',
  fixrate = 'fixRate'
}

/**
 * 브러쉬 타입
 */
export enum BrushType {
  RECT = 'rect',
  POLYGON = 'polygon',
  LINEX = 'lineX',
  LINEY = 'lineY',
  KEEP = 'keep',
  CLEAR = 'clear',
}

/**
 * 브러쉬 모드
 */
export enum BrushMode {
  SINGLE = 'single',
  MULTIPLE = 'multiple'
}

/**
 * 그래픽 객체 타입
 */
export enum GraphicType {
  IMAGE = 'image',
  TEXT = 'text',
  CIRCLE = 'circle',
  SECTOR = 'sector',
  RING = 'ring',
  POLYGON = 'polygon',
  POLYLINE = 'polyline',
  RECT = 'rect',
  LINE = 'line',
  BEZIERCURVE = 'bezierCurve',
  ARC = 'arc',
  GROUP = 'group'
}

/**
 * 그래픽 객체 액션 타입
 */
export enum GraphicAction {
  MERGE = 'merge',
  REPLACE = 'replace',
  REMOVE = 'remove'
}

/**
 * VisualMap의 색상 대상 축 인덱스
 */
export enum VisualMapDimension {
  X = 0,
  Y = 1
}

/**
 * 시리즈에 맵핑되는 축 인덱스 항목
 */
export enum AxisIndexType {
  X = 'xAxisIndex',
  Y = 'yAxisIndex'
}

/**
 * graph 차트의 layout 타입
 */
export enum GraphLayoutType {
  NONE = 'none',
  FORCE = 'force',
  CIRCULAR = 'circular',
}

/**
 * KPI 차트의 layout 타입
 */
export enum LabelLayoutType {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL'
}

/**
 * KPI 차트의 Text 위치
 */
export enum LabelTextLocation {
  HIDDEN = 'HIDDEN',
  BEFORE = 'BEFORE',
  AFTER = 'AFTER'
}

export enum LabelSecondaryIndicatorType {
  PERIOD = 'PERIOD',
  STANDARD = 'STANDARD'
}

export enum LabelSecondaryIndicatorPeriod {
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR'
}

export enum LabelSecondaryIndicatorMarkType {
  PERCENTAGE = 'PERCENTAGE',   // 퍼센테이지
  INCREMENTAL = 'INCREMENTAL'  // 증감분
}

export enum LabelStyle {
  LINE = 'LINE',
  SOLID = 'SOLID'
}

/**
 * 폰트 크기
 */
export enum FontSize {
  SMALL = 'SMALL',
  NORMAL = 'NORMAL',
  LARGE = 'LARGE'
}

/**
 * 폰트 스타일
 */
export enum UIFontStyle {
  BOLD = 'BOLD',
  ITALIC = 'ITALIC'
}

/*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | 속성 변경에 핋요한 외부(UI) 속성
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

/**
 * 선반 타입
 */
export enum ShelveType {
  COLUMNS = 'columns',
  ROWS = 'rows',
  AGGREGATIONS = 'aggregations',
}

/**
 * 선반내 필드 타입
 */
export enum ShelveFieldType {
  DIMENSION = 'dimension',
  MEASURE = 'measure',
  CALCULATED = 'calculated',
  TIMESTAMP = 'timestamp'
}

/**
 * 차트 Pivot 타입 Key
 */
export enum ChartPivotType {
  COLS = 'cols',
  ROWS = 'rows',
  AGGS = 'aggs',
}

/**
 * 차트 색상 기준
 */
export enum ChartColorType {
  DIMENSION = 'dimension',
  SERIES = 'series',
  MEASURE = 'measure',
  SINGLE = 'single'
}

/**
 * 색상 컬러 프리셋
 */
export class ChartColorList {
  // color by series / dimension 색
  public static readonly SC1 = ['#3452b5', '#f28a00', '#2b9a9e', '#ffd200', '#c3c3c3', '#4a95cf', '#7c5ac1', '#e03c8f', '#83bf47', '#fda08c', '#7b7b7b', '#fc79ac'];
  public static readonly SC2 = ['#6ed0e4', '#026e7f', '#72b235', '#fb7661', '#fbb700', '#c22a32', '#e03c8f', '#5d9f27', '#9b7fe4', '#6344ad', '#fee330', '#c3c3c3'];
  public static readonly SC3 = ['#fb7661', '#fee330', '#4a95cf', '#75c4be', '#0c8691', '#fbb700', '#ad037c', '#e03c8f', '#8d6dd2', '#58b5da', '#b5d994', '#83bf47'];
  public static readonly SC4 = ['#4a95cf', '#fc79ac', '#b099f0', '#cd2287', '#adadad', '#ffd200', '#6ed0e4', '#fda08c', '#54b2ae', '#f8533b', '#f6a300', '#fee330'];
  public static readonly SC5 = ['#f8533b', '#d73631', '#fda08c', '#fb6e2c', '#e5342c', '#9a0b2c', '#fca0c3', '#c22a32', '#fda08c', '#f23a2c', '#fb7661', '#fbb700'];
  public static readonly SC6 = ['#f28a00', '#fbb700', '#f8533b', '#f6f4b7', '#f27603', '#fda08c', '#fee330', '#fb6e2c', '#ffd200', '#f9f6a1', '#fb7661', '#f6a300'];
  public static readonly SC7 = ['#4b8a21', '#54b2ae', '#026e7f', '#83bf47', '#39751d', '#b5d994', '#0c8691', '#015268', '#5d9f27', '#2d681a', '#97cb63', '#72b235'];
  public static readonly SC8 = ['#6ed0e4', '#3f72c1', '#58b5da', '#026e7f', '#54b2ae', '#8adfe9', '#4a95cf', '#3452b5', '#015268', '#75c4be', '#3f72c1', '#6ed0e4'];
  public static readonly SC9 = ['#7c5ac1', '#7d0071', '#cd2287', '#ee5398', '#4c006a', '#9b7fe4', '#4c309a', '#b099f0', '#ad037c', '#fca0c3', '#e03c8f', '#fc79ac'];
  // color by measure
  public static readonly VC1 = ['#ffcaba', '#fb7661', '#f23a2c', '#d73631', '#9a0b2c'];
  public static readonly VC2 = ['#f6f4b7', '#fee330', '#fbb700', '#f28a00', '#fb6e2c'];
  public static readonly VC3 = ['#d1e5c2', '#97cb63', '#72b235', '#4b8a21', '#2d681a'];
  public static readonly VC4 = ['#b5e0e1', '#75c4be', '#2b9a9e', '#026e7f', '#064059'];
  public static readonly VC5 = ['#c4eeed', '#8adfe9', '#58b5da', '#3f72c1', '#23399f'];
  public static readonly VC6 = ['#efdffd', '#b099f0', '#8d6dd2', '#6344ad', '#391f8a'];
  public static readonly VC7 = ['#fcc9dd', '#fc79ac', '#e03c8f', '#ad037c', '#4c006a'];
  public static readonly VC8 = ['#ffcaba', '#fda08c', '#fb7661', '#f8533b', '#f23a2c', '#e5342c', '#d73631', '#c22a32', '#9a0b2c'];
  public static readonly VC9 = ['#f6f4b7', '#f9f6a1', '#fee330', '#ffd200', '#fbb700', '#f6a300', '#f28a00', '#f27603', '#fb6e2c'];
  public static readonly VC10 = ['#d1e5c2', '#b5d994', '#97cb63', '#83bf47', '#72b235', '#5d9f27', '#4b8a21', '#39751d', '#2d681a'];
  public static readonly VC11 = ['#b5e0e1', '#9ad5d2', '#75c4be', '#54b2ae', '#2b9a9e', '#0c8691', '#026e7f', '#015268', '#064059'];
  public static readonly VC12 = ['#c4eeed', '#a9e7eb', '#8adfe9', '#6ed0e4', '#58b5da', '#4a95cf', '#3f72c1', '#3452b5', '#23399f'];
  public static readonly VC13 = ['#efdffd', '#cdbaf8', '#b099f0', '#9b7fe4', '#8d6dd2', '#7c5ac1', '#6344ad', '#4c309a', '#391f8a'];
  public static readonly VC14 = ['#fcc9dd', '#fca0c3', '#fc79ac', '#ee5398', '#e03c8f', '#cd2287', '#ad037c', '#7d0071', '#4c006a'];
  public static readonly VC15 = ['#c22a32', '#f23a2c', '#fb7661', '#ffcaba', '#ededed', '#b5e0e1', '#75c4be', '#2b9a9e', '#0c8691'];
  public static readonly VC16 = ['#9a0b2c', '#d73631', '#f28a00', '#fbb700', '#f6f4b7', '#d1e5c2', '#75c4be', '#3f72c1', '#391f8a'];
  public static readonly VC17 = ['#ad037c', '#e03c8f', '#fc79ac', '#fcc9dd', '#ededed', '#d1e5c2', '#97cb63', '#72b235', '#4b8a21'];
  public static readonly VC18 = ['#fbb700', '#ffd200', '#fee330', '#f9f6a1', '#ededed', '#cdbaf8', '#b099f0', '#7c5ac1', '#4c309a'];
  public static readonly VC19 = ['#f27603', '#f28a00', '#fbb700', '#fee330', '#f6f4b7', '#c4eeed', '#6ed0e4', '#4a95cf', '#3452b5'];

  public static readonly RVC1 = Object.keys(ChartColorList.VC1).map(key => ChartColorList.VC1[key]).reverse();
  public static readonly RVC2 = Object.keys(ChartColorList.VC2).map(key => ChartColorList.VC2[key]).reverse();
  public static readonly RVC3 = Object.keys(ChartColorList.VC3).map(key => ChartColorList.VC3[key]).reverse();
  public static readonly RVC4 = Object.keys(ChartColorList.VC4).map(key => ChartColorList.VC4[key]).reverse();
  public static readonly RVC5 = Object.keys(ChartColorList.VC5).map(key => ChartColorList.VC5[key]).reverse();
  public static readonly RVC6 = Object.keys(ChartColorList.VC6).map(key => ChartColorList.VC6[key]).reverse();
  public static readonly RVC7 = Object.keys(ChartColorList.VC7).map(key => ChartColorList.VC7[key]).reverse();
  public static readonly RVC8 = Object.keys(ChartColorList.VC8).map(key => ChartColorList.VC8[key]).reverse();
  public static readonly RVC9 = Object.keys(ChartColorList.VC9).map(key => ChartColorList.VC9[key]).reverse();
  public static readonly RVC10 = Object.keys(ChartColorList.VC10).map(key => ChartColorList.VC10[key]).reverse();
  public static readonly RVC11 = Object.keys(ChartColorList.VC11).map(key => ChartColorList.VC11[key]).reverse();
  public static readonly RVC12 = Object.keys(ChartColorList.VC12).map(key => ChartColorList.VC12[key]).reverse();
  public static readonly RVC13 = Object.keys(ChartColorList.VC13).map(key => ChartColorList.VC13[key]).reverse();
  public static readonly RVC14 = Object.keys(ChartColorList.VC14).map(key => ChartColorList.VC14[key]).reverse();
  public static readonly RVC15 = Object.keys(ChartColorList.VC15).map(key => ChartColorList.VC15[key]).reverse();
  public static readonly RVC16 = Object.keys(ChartColorList.VC16).map(key => ChartColorList.VC16[key]).reverse();
  public static readonly RVC17 = Object.keys(ChartColorList.VC17).map(key => ChartColorList.VC17[key]).reverse();
  public static readonly RVC18 = Object.keys(ChartColorList.VC18).map(key => ChartColorList.VC18[key]).reverse();
  public static readonly RVC19 = Object.keys(ChartColorList.VC19).map(key => ChartColorList.VC19[key]).reverse();
}

/**
 * waterfall 양수 / 음수 색상
 */
export enum WaterfallBarColor {

  // 양수
  POSITIVE = '#c23531',

  // 음수
  NEGATIVE = '#304554'
}

/**
 * measure의 color range
 */
export enum MeasureColorRange {

  // 범위를 벗어났을때 쓰이는 색상
  OUTOF_RANGE = '#3c4950',
  // 기본설정색상
  DEFAULT = '#c94819'
}

/**
 * 축관련 색상설정
 */
export enum AxisDefaultColor {

  // 축라인 색상
  AXIS_LINE_COLOR = '#bfbfbf',

  // 축라벨 색상
  LABEL_COLOR =  '#8f96a0',

  // 라인색상
  LINE_COLOR =  '#f2f2f2'
}

/**
 * color range의 타입
 */
export enum ColorCustomMode {
  NONE = 'NONE',
  SECTION = 'SECTION',
  GRADIENT = 'GRADIENT'
}

/**
 * range내의 타입
 */
export enum ColorRangeType {
  SECTION = 'section',
  GRADIENT = 'gradient',
}


/**
 * 옵션패널의 이벤트 타입
 */
export enum EventType {

  // 초기 진입시
  INIT = 'init',
  // 누적모드
  CUMULATIVE = 'cumulativeMode',
  // 선반 변경시
  CHANGE_PIVOT = 'changePivot',
  // 맵차트 옵션 변경시
  MAP_CHANGE_OPTION = 'mapChangeOption',
  // 공간 분석 시
  MAP_SPATIAL_ANALYSIS = 'spatialAnalysis',
  MAP_SPATIAL_REANALYSIS = 'spatialReAnalysis',
  // 그리드차트 피봇/원본
  GRID_ORIGINAL = 'gridViewType',
  // 바차트 병렬 / 중첩
  SERIES_VIEW = 'barSeriesViewType',
  // granularity 변경시
  GRANULARITY = 'onChangeGranularity',
  // aggregation 변경시
  AGGREGATION = 'onChangeAggregationType',
  // change chart type
  CHART_TYPE = 'chartType',
  // filter changed
  FILTER = 'filter',
  // change pivot alias
  PIVOT_ALIAS = 'pivotAlias',
  // change dashboard alias
  DASHBOARD_ALIAS = 'dashboardAlias'
}

/**
 * Grid 차트 한정 색상 프리셋
 *
 */
export class GridCellColorList {
  public static readonly LINE1 = [['#a1e1f8', '#89cdeb', '#59a4d2', '#418fc5', '#297bb8', '#246ea5', '#1e6191', '#19537e', '#13466b', '|',],
    ['#777', '#777', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']];
  public static readonly CONT1 = [['#253ba2', '#374daf', '#4668b5', '#567dbd', '#638fc0', '#85a6cc', '#a0bad7', '#cbd8e6', '#f9f9f9', '#f6d3d3', '#f1b8b8', '#eb9999', '#dc6e6e', '#cc4d4d', '#cc3333', '#b71414', '#990a00'],
    ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#777', '#777', '#777', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff']
  ];
}

/**
 * 차트 그래디언트 타입
 */
export enum ChartGradientType {
  LINEAR = 'LINEAR',
  CONTRAST = 'CONTRAST',
  CUSTOM = 'CUSTOM'
}

/**
 * grid 차트 색상 지정 대상
 */
export enum CellColorTarget {
  BACKGROUND = 'BACKGROUND',
  TEXT = 'TEXT'
}

/**
 * grid 연산행 연산자
 */
export enum Operator {
  SUM = 'SUM',
  AVERAGE = 'AVERAGE',
  MAX = 'MAX',
  MIN = 'MIN',
  COUNT = 'COUNT'
}

/**
 * 차트 라벨 타입
 */
export enum AxisOrientType {
  X = 'X',
  Y = 'Y'
}

/**
 * 차트 라벨 타입
 */
export enum AxisLabelType {
  ROW = 'row',
  COLUMN = 'column',
  SUBROW = 'sub_row',
  SUBCOLUMN = 'sub_column',
  SIMPLE = 'simple',
  AGGREGATION = 'aggregation',
}

/**
 * 축 변경 타입
 */
export enum LabelConvertType {
  NAME = 'name',
  SHOWNAME = 'showName',
  SHOWMARK = 'showMark',
  MARK = 'mark',
  SCALED = 'scaled',
  SHOWVALUE = 'showValue',
  SHOWLABEL = 'showLabel',
  ALIGN = 'align',
  AXISCONFIG = 'axisConfig'
}

/**
 * 축 단위 라벨 회전
 */
export enum AxisLabelMark {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL',
  SLOPE = 'SLOPE'
}

/**
 * 범례 변경 타입
 */
export enum LegendConvertType {
  SHOW = 'show',
  COUNT = 'count'
}

/**
 * 미니맵 변경 타입
 */
export enum DataZoomConverType {
  SHOW = 'show',
  RANGE = 'range'
}

/**
 * 차트 시리즈 표현 변경 타입
 */
export enum SeriesConvertType {
  MARK = 'mark',
  SHOW = 'show',
  UNITTYPE = 'unitType',
  ACCUMULATE = 'isAccumulate',
  SHAPE = 'shape',
  ALIGN = 'align',
  VALIGN = 'valign',
  LAYOUT = 'layout',
  FORMAT = 'format',
  DECIMAL = 'decimal',
  BAR = 'bar',
  LINE = 'line',
  LABEL = 'label',
  ROTATE = 'rotate'
}

/**
 * 차트 mark 표현 타입
 */
export enum BarMarkType {
  MULTIPLE = 'MULTIPLE',
  STACKED = 'STACKED',
}

/**
 * 차트 시리즈 데이터 표현 단위
 */
export enum DataUnit {
  NONE = 'NONE',
  PERCENT = 'PERCENT'
}

/**
 * 라인차트 marktype
 */
export enum LineMarkType {
  LINE = 'LINE',       // 라인 표시
  AREA = 'AREA'       // 면적 표시
}

/**
 * 라인차트 Corner Type
 */
export enum LineCornerType {
  STRAIGHT = 'STRAIGHT', // 직선형
  SMOOTH = 'SMOOTH'        // 굴림형
}

/**
 * 라인차트 공통 스타일
 */
export enum LineStyle {
  POINT_LINE = 'POINT_LINE', // 포인트 라인 혼합
  POINT = 'POINT', // 포인트만 표시
  LINE = 'LINE' // 라인만 표시
}

/**
 * 라인차트 기본 / 누계
 */
export enum LineMode {
  NORMAL = 'NORMAL', // 기본
  CUMULATIVE = 'CUMULATIVE' // 누계
}

/**
 * 스케터차트 포인트 사이즈
 */
export enum PointSize {
  NORMAL = 'NORMAL',          // 보통
  SMALL = 'SMALL',           // 작게
  LARGE = 'LARGE',           // 크게
  XLARGE = 'XLARGE',          // 매우 크게
}

/**
 * grid 차트 표현 타입
 */
export enum GridViewType {
  PIVOT = 'PIVOT',
  MASTER = 'MASTER',
}

/**
 * grid 차트 annotation position
 */
export enum AnnotationPosition {
  TOP_RIGHT = 'TOP_RIGHT',
  TOP_LEFT = 'TOP_LEFT',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',
  BOTTOM_LEFT = 'BOTTOM_LEFT'
}

/**
 * pie 차트 표현 타입
 */
export enum PieSeriesViewType {
  SECTOR = 'SECTOR',
  DONUT = 'DONUT',
}

/**
 * 데이터 값 포멧
 */
export enum ValueFormat {
  NUMBER = 'NUMBER',
  TEXT = 'TEXT'
}

/**
 * DataZoom Range 타입
 *
 */
export enum DataZoomRangeType {
  COUNT = 'COUNT',
  PERCENT = 'PERCENT'
}

/**
 * UILocation
 *
 */
export enum AxisOrientType {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL'
}

/**
 * 마우스 커서
 */
export enum ChartMouseMode {
  SINGLE = 'single',
  MULTI = 'multi',
  DRAGZOOMIN = 'dragzoomin',
  ZOOMIN = 'zoomin',
  ZOOMOUT = 'zoomout',
  REVERT = 'revert'
}

/**
 * 차트 선택모드
 */
export enum ChartSelectMode {
  ADD = 'add',
  SUBTRACT = 'subtract',
  CLEAR = 'clear'
}

/**
 * 위치값
 */
export enum UIPosition {
  AUTO = 'AUTO',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  CENTER = 'CENTER',
  TOP = 'TOP',
  MIDDLE = 'MIDDLE',
  BOTTOM = 'BOTTOM',
  RIGHT_BOTTOM = 'RIGHT_BOTTOM',
  LEFT_BOTTOM = 'LEFT_BOTTOM',
  RIGHT_TOP = 'RIGHT_TOP',
  LEFT_TOP = 'LEFT_TOP'
}

/**
 * 표시 레이블 선택
 */
export enum UIChartDataLabelDisplayType {
  CATEGORY_NAME = 'CATEGORY_NAME',
  CATEGORY_VALUE = 'CATEGORY_VALUE',
  CATEGORY_PERCENT = 'CATEGORY_PERCENT',
  SERIES_NAME = 'SERIES_NAME',
  SERIES_VALUE = 'SERIES_VALUE',
  SERIES_PERCENT = 'SERIES_PERCENT',
  XAXIS_VALUE = 'XAXIS_VALUE',
  YAXIS_VALUE = 'YAXIS_VALUE',
  VALUE = 'VALUE',
  NODE_NAME = 'NODE_NAME',
  LINK_VALUE = 'LINK_VALUE',
  NODE_VALUE = 'NODE_VALUE',
  HIGH_VALUE = 'HIGH_VALUE',
  THREE_Q_VALUE = 'THREE_Q_VALUE',
  MEDIAN_VALUE = 'MEDIAN_VALUE',
  FIRST_Q_VALUE = 'FIRST_Q_VALUE',
  LOW_VALUE = 'LOW_VALUE',
  LAYER_NAME = 'LAYER_NAME',
  LOCATION_INFO = 'LOCATION_INFO',
  DATA_VALUE = 'DATA_VALUE'
}

/**
 * 표현 방향
 */
export enum UIOrient {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL',
  BOTH = 'BOTH'
}

/**
 * 스케터 차트 심볼 타입
 */
export enum PointShape {
  CIRCLE = 'CIRCLE',       // 원
  RECT = 'RECT',         // 사각형(네모)
  TRIANGLE = 'TRIANGLE',     // 삼각형(세모)
  DIAMOND = 'DIAMOND',      // 마름모(다이아몬드)
  PIN = 'PIN',          // 십자
  ARROW = 'ARROW'        // 액스
}

/**
 * 포맷 타입
 */
export enum UIFormatType {
  NUMBER = 'number',
  CURRENCY = 'currency',
  PERCENT = 'percent',
  EXPONENT10 = 'exponent10',
  TIME_CONTINUOUS = 'time_continuous',
  TIME_CUSTOM = 'time_custom'
}

/**
 * 포맷 통화 심볼 타입
 */
export enum UIFormatCurrencyType {
  KRW = 'KRW',
  USD = 'USD',
  USCENT = 'USCENT',
  GBP = 'GBP',
  JPY = 'JPY',
  EUR = 'EUR',
  CNY = 'CNY',
  RUB = 'RUB'
}

/**
 * 수치표기 약어 타입
 */
export enum UIFormatNumericAliasType {
  NONE = 'NONE',
  AUTO = 'AUTO',
  KILO = 'KILO',
  MEGA = 'MEGA',
  GIGA = 'GIGA',
  KILO_KOR = 'KILO_KOR',
  MEGA_KOR = 'MEGA_KOR',
  GIGA_KOR = 'GIGA_KOR'
}

/**
 * 포맷 사용자 기호 위치
 */
export enum UIFormatSymbolPosition {
  BEFORE = 'BEFORE',
  AFTER = 'AFTER'
}

/**
 * 폰트 사이즈
 */
export enum UIFontSize {
  DEFAULT = 'default',
  SMALLER = 'smaller',
  LARGER = 'larger'
}

/**
 * 축 눈금 관련 옵션
 */
export enum ChartAxisGridType {
  TEXT = 'text',
  NUMERIC = 'numeric',
  DATETIME = 'datetime'
}

/**
 * 축 Label 타입
 */
export enum ChartAxisLabelType {
  VALUE = 'value',
  CATEGORY = 'category'
}

/**
 * 데이터라벨 위치
 */
export enum DataLabelPosition {
  OUTSIDE_TOP = 'OUTSIDE_TOP',
  INSIDE_TOP = 'INSIDE_TOP',
  INSIDE_BOTTOM = 'INSIDE_BOTTOM',
  CENTER = 'CENTER',
  OUTSIDE_RIGHT = 'OUTSIDE_RIGHT',
  INSIDE_RIGHT = 'INSIDE_RIGHT',
  INSIDE_LEFT = 'INSIDE_LEFT',
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  RIGHT = 'RIGHT',
  LEFT = 'LEFT'
}

/**
 * 데이터레이블 text align
 */
export enum TextAlign {
  DEFAULT = 'DEFAULT',
  LEFT = 'LEFT',
  CENTER = 'CENTER',
  RIGHT = 'RIGHT'
}

/**
 * shelf type
 */
export enum ShelfType {
  PIVOT = 'pivot',
  GRAPH = 'graph',
  GEO = 'geo'
}

/**
 * shelf layer view type
 */
export enum LayerViewType {
  ORIGINAL = 'original',
  HASH = 'hash',
  CLUSTERING = 'clustering'
}

/**
 * field format type
 */
export enum FormatType {
  DEFAULT = 'default',
  GEO = 'geo',
  GEO_HASH = 'geo_hash',
  GEO_BOUNDARY = 'geo_boundary',
  GEO_JOIN = 'geo_join'
}

/**
 * 기능 확인기
 */
export class FunctionValidator {

  // 차트속성맵 - 선택 기능 사용
  private _useSelection: ChartType[] = [
    ChartType.BAR, ChartType.LINE, ChartType.GRID, ChartType.SCATTER, ChartType.HEATMAP, ChartType.PIE, ChartType.CONTROL,
    ChartType.BOXPLOT, ChartType.WATERFALL, ChartType.WORDCLOUD, ChartType.COMBINE, ChartType.SANKEY, ChartType.GAUGE
  ];

  // 차트속성맵 - 복수 선택툴 사용
  private _useMultiSelection: ChartType[] = [
    ChartType.BAR, ChartType.LINE, ChartType.SCATTER, ChartType.COMBINE
  ];

  // 차트속성맵 - 확대툴 사용
  private _useZoom: ChartType[] = [
    ChartType.BAR, ChartType.LINE, ChartType.SCATTER, ChartType.HEATMAP, ChartType.CONTROL,
    ChartType.BOXPLOT, ChartType.WATERFALL, ChartType.COMBINE
  ];

  // 차트속성맵 - 범례 사용
  private _useLegend: ChartType[] = [
    ChartType.BAR, ChartType.LINE, ChartType.SCATTER, ChartType.HEATMAP, ChartType.PIE, ChartType.CONTROL,
    ChartType.COMBINE, ChartType.RADAR, ChartType.NETWORK
  ];

  // 차트속성맵 - 미니맵 사용
  private _useMiniMap: ChartType[] = [
    ChartType.BAR, ChartType.LINE, ChartType.SCATTER, ChartType.HEATMAP, ChartType.CONTROL,
    ChartType.BOXPLOT, ChartType.WATERFALL, ChartType.COMBINE
  ];

  /**
   * 선택툴 사용 여부 판단
   * @param {string} type
   * @returns {boolean}
   */
  public checkUseSelectionByTypeString(type:string): boolean {
    return -1 < this._useSelection.indexOf(ChartType[type.toUpperCase()]);
  } // function - checkUseSelectionByTypeString

  /**
   * 선택툴 사용 여부 판단
   * @param {ChartType} type
   * @returns {boolean}
   */
  public checkUseSelectionByType(type:ChartType): boolean {
    return -1 < this._useSelection.indexOf(type);
  } // function - checkUseSelectionByType

  /**
   * 선택툴 사용 여부 판단
   * @param {string} type
   * @returns {boolean}
   */
  public checkUseMultiSelectionByTypeString(type:string): boolean {
    return -1 < this._useMultiSelection.indexOf(ChartType[type.toUpperCase()]);
  } // function - checkUseMultiSelectionByTypeString

  /**
   * 선택툴 사용 여부 판단
   * @param {ChartType} type
   * @returns {boolean}
   */
  public checkUseMultiSelectionByType(type:ChartType): boolean {
    return -1 < this._useMultiSelection.indexOf(type);
  } // function - checkUseMultiSelectionByType

  /**
   * 확대툴 사용 여부 판단
   * @param {string} type
   * @returns {boolean}
   */
  public checkUseZoomByTypeString(type:string): boolean {
    return -1 < this._useZoom.indexOf(ChartType[type.toUpperCase()]);
  } // function - checkUseZoomByTypeString

  /**
   * 확대툴 사용 여부 판단
   * @param {ChartType} type
   * @returns {boolean}
   */
  public checkUseZoomByType(type:ChartType): boolean {
    return -1 < this._useZoom.indexOf(type);
  } // function - checkUseZoomByType

  /**
   * 범례 사용 여부 판단
   * @param {string} type
   * @returns {boolean}
   */
  public checkUseLegendByTypeString(type: string): boolean {
    return -1 < this._useLegend.indexOf(ChartType[type.toUpperCase()]);
  } // function - checkUseLegendByTypeString

  /**
   * 범례 사용 여부 판단
   * @param {ChartType} type
   * @returns {boolean}
   */
  public checkUseLegendByType(type: ChartType): boolean {
    return -1 < this._useLegend.indexOf(type);
  } // function - checkUseLegendByType

  /**
   * 미니맵 사용 여부 판단
   * @param {string} type
   * @returns {boolean}
   */
  public checkUseMiniMapByTypeString(type: string): boolean {
    return -1 < this._useMiniMap.indexOf(ChartType[type.toUpperCase()]);
  } // function - checkUseMiniMapByTypeString

  /**
   * 미니맵 사용 여부 판단
   * @param {ChartType} type
   * @returns {boolean}
   */
  public checkUseMiniMapByType(type: ChartType): boolean {
    return -1 < this._useMiniMap.indexOf(type);
  } // function - checkUseMiniMapByTypeString

}
