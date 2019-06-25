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


// TODO
// enum으로 할지 type으로 할지.....
// export type LineType = <any>'solid' | 'dashed'| 'dotted';
export enum ChartType {
  BAR = <any>'bar',
  GRID = <any>'grid',
  LINE = <any>'line',
  SCATTER = <any>'scatter',
  HEATMAP = <any>'heatmap',
  PIE = <any>'pie',
  MAP = <any>'map',
  CONTROL = <any>'control',
  LABEL = <any>'label',
  LABEL2 = <any>'label2',
  BOXPLOT = <any>'boxplot',
  WATERFALL = <any>'waterfall',
  WORDCLOUD = <any>'wordcloud',
  COMBINE = <any>'combine',
  TREEMAP = <any>'treemap',
  RADAR = <any>'radar',
  NETWORK = <any>'network',
  SANKEY = <any>'sankey',
  GAUGE = <any>'gauge'
}

/**
 * 시리즈 타입
 */
export enum SeriesType {
  BAR = <any>'bar',
  LINE = <any>'line',
  SCATTER = <any>'scatter',
  HEATMAP = <any>'heatmap',
  PIE = <any>'pie',
  BOXPLOT = <any>'boxplot',
  WORDCLOUD = <any>'wordCloud',
  TREEMAP = <any>'treemap',
  RADAR = <any>'radar',
  GRAPH = <any>'graph',
  SANKEY = <any>'sankey'
}

/**
 * 위치값
 */
export enum Position {
  AUTO = <any>'auto',
  START = <any>'start',
  END = <any>'end',
  LEFT = <any>'left',
  RIGHT = <any>'right',
  CENTER = <any>'center',
  TOP = <any>'top',
  MIDDLE = <any>'middle',
  BOTTOM = <any>'bottom',
  INSIDE = <any>'inside',
  INSIDETOP = <any>'insideTop',
  INSIDELEFT = <any>'insideLeft',
  INSIDERIGHT = <any>'insideRight',
  INSIDEBOTTOM = <any>'insideBottom',
  OUTSIDE = <any>'outside',
}

/**
 * 축 타입
 */
export enum AxisType {
  CATEGORY = <any>'category',
  VALUE = <any>'value',
  LOG = <any>'log',
  X = <any>'xAxis',
  Y = <any>'yAxis',
  SUB = <any>'subAxis'
}

/**
 * 라인 타입
 */
export enum LineType {
  SOLID = <any>'solid',
  DASHED = <any>'dashed',
  DOTTED = <any>'dotted'
}

/**
 * 심볼 타입
 */
export enum SymbolType {
  POLYGON = <any>'polygon',
  CIRCLE = <any>'circle',
  RECT = <any>'rect',
  ROUNDRECT = <any>'roundRect',
  TRIANGLE = <any>'triangle',
  DIAMOND = <any>'diamond',
  PIN = <any>'pin',
  ARROW = <any>'arrow'
}

/**
 * 심볼 불투명/반투명 여부
 */
export enum SymbolFill {
  SINGLE = <any>'single',
  TRANSPARENT = <any>'transparent',
}

/**
 * 폰트 스타일
 */
export enum FontStyle {
  NORMAL = <any>'normal',
  ITALIC = <any>'italic',
  OBLIQUE = <any>'oblique'
}

/**
 * 폰트
 */
export enum FontWeight {
  NORMAL = <any>'normal',
  BOLD = <any>'bold',
  BOLDER = <any>'bolder',
  LIGHTER = <any>'lighter'
}

/**
 * 표현 방향
 */
export enum Orient {
  VERTICAL = <any>'vertical',
  HORIZONTAL = <any>'horizontal',
  BOTH = <any>'both'
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
  ITEM = <any>'item',
  AXIS = <any>'axis',
  NONE = <any>'none'
}

/**
 * 툴팁이 표현되는 기준 이벤트
 */
export enum TriggerAction {
  MOUSEMOVE = <any>'mousemove',
  CLICK = <any>'click',
  NONE = <any>'none'
}

/**
 * 이미지 포멧
 */
export enum ImageFormat {
  PNG = <any>'png',
  JPEG = <any>'jpeg'
}

/**
 * 툴 박스 항목
 */
export enum ToolboxMagicType {
  LINE = <any>'line',
  BAR = <any>'bar',
  STACK = <any>'stack',
  TILED = <any>'tiled'
}

/**
 *
 */
export enum ThrottleType {
  DEBOUNCE = <any>'debounce',
  fixrate = <any>'fixRate'
}

/**
 * 브러쉬 타입
 */
export enum BrushType {
  RECT = <any>'rect',
  POLYGON = <any>'polygon',
  LINEX = <any>'lineX',
  LINEY = <any>'lineY',
  KEEP = <any>'keep',
  CLEAR = <any>'clear',
}

/**
 * 브러쉬 모드
 */
export enum BrushMode {
  SINGLE = <any>'single',
  MULTIPLE = <any>'multiple'
}

/**
 * 그래픽 객체 타입
 */
export enum GraphicType {
  IMAGE = <any>'image',
  TEXT = <any>'text',
  CIRCLE = <any>'circle',
  SECTOR = <any>'sector',
  RING = <any>'ring',
  POLYGON = <any>'polygon',
  POLYLINE = <any>'polyline',
  RECT = <any>'rect',
  LINE = <any>'line',
  BEZIERCURVE = <any>'bezierCurve',
  ARC = <any>'arc',
  GROUP = <any>'group'
}

/**
 * 그래픽 객체 액션 타입
 */
export enum GraphicAction {
  MERGE = <any>'merge',
  REPLACE = <any>'replace',
  REMOVE = <any>'remove'
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
  X = <any>'xAxisIndex',
  Y = <any>'yAxisIndex'
}

/**
 * graph 차트의 layout 타입
 */
export enum GraphLayoutType {
  NONE = <any>'none',
  FORCE = <any>'force',
  CIRCULAR = <any>'circular',
}

/**
 * KPI 차트의 layout 타입
 */
export enum LabelLayoutType {
  HORIZONTAL = <any>'HORIZONTAL',
  VERTICAL = <any>'VERTICAL'
}

/**
 * KPI 차트의 Text 위치
 */
export enum LabelTextLocation {
  HIDDEN = <any>'HIDDEN',
  BEFORE = <any>'BEFORE',
  AFTER = <any>'AFTER'
}

export enum LabelSecondaryIndicatorType {
  PERIOD = <any>'PERIOD',
  STANDARD = <any>'STANDARD'
}

export enum LabelSecondaryIndicatorPeriod {
  HOUR = <any>'HOUR',
  DAY = <any>'DAY',
  WEEK = <any>'WEEK',
  MONTH = <any>'MONTH',
  QUARTER = <any>'QUARTER',
  YEAR = <any>'YEAR'
}

export enum LabelSecondaryIndicatorMarkType {
  PERCENTAGE = <any>'PERCENTAGE',   // 퍼센테이지
  INCREMENTAL = <any>'INCREMENTAL'  // 증감분
}

export enum LabelStyle {
  LINE = <any>'LINE',
  SOLID = <any>'SOLID'
}

/**
 * 폰트 크기
 */
export enum FontSize {
  SMALL = <any>'SMALL',
  NORMAL = <any>'NORMAL',
  LARGE = <any>'LARGE'
}

/**
 * 폰트 스타일
 */
export enum UIFontStyle {
  BOLD = <any>'BOLD',
  ITALIC = <any>'ITALIC'
}

/*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | 속성 변경에 핋요한 외부(UI) 속성
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

/**
 * 선반 타입
 */
export enum ShelveType {
  COLUMNS = <any>'columns',
  ROWS = <any>'rows',
  AGGREGATIONS = <any>'aggregations',
}

/**
 * 선반내 필드 타입
 */
export enum ShelveFieldType {
  DIMENSION = <any>'dimension',
  MEASURE = <any>'measure',
  CALCULATED = <any>'calculated',
  TIMESTAMP = <any>'timestamp'
}

/**
 * 차트 Pivot 타입 Key
 */
export enum ChartPivotType {
  COLS = <any>'cols',
  ROWS = <any>'rows',
  AGGS = <any>'aggs',
}

/**
 * 차트 색상 기준
 */
export enum ChartColorType {
  DIMENSION = <any>'dimension',
  SERIES = <any>'series',
  MEASURE = <any>'measure',
  SINGLE = <any>'single'
}

/**
 * 색상 컬러 프리셋
 */
export enum ChartColorList {
  // color by series / dimension 색
  SC1 = <any>['#3452b5', '#f28a00', '#2b9a9e', '#ffd200', '#c3c3c3', '#4a95cf', '#7c5ac1', '#e03c8f', '#83bf47', '#fda08c', '#7b7b7b', '#fc79ac'],
  SC2 = <any>['#6ed0e4', '#026e7f', '#72b235', '#fb7661', '#fbb700', '#c22a32', '#e03c8f', '#5d9f27', '#9b7fe4', '#6344ad', '#fee330', '#c3c3c3'],
  SC3 = <any>['#fb7661', '#fee330', '#4a95cf', '#75c4be', '#0c8691', '#fbb700', '#ad037c', '#e03c8f', '#8d6dd2', '#58b5da', '#b5d994', '#83bf47'],
  SC4 = <any>['#4a95cf', '#fc79ac', '#b099f0', '#cd2287', '#adadad', '#ffd200', '#6ed0e4', '#fda08c', '#54b2ae', '#f8533b', '#f6a300', '#fee330'],
  SC5 = <any>['#f8533b', '#d73631', '#fda08c', '#fb6e2c', '#e5342c', '#9a0b2c', '#fca0c3', '#c22a32', '#fda08c', '#f23a2c', '#fb7661', '#fbb700'],
  SC6 = <any>['#f28a00', '#fbb700', '#f8533b', '#f6f4b7', '#f27603', '#fda08c', '#fee330', '#fb6e2c', '#ffd200', '#f9f6a1', '#fb7661', '#f6a300'],
  SC7 = <any>['#4b8a21', '#54b2ae', '#026e7f', '#83bf47', '#39751d', '#b5d994', '#0c8691', '#015268', '#5d9f27', '#2d681a', '#97cb63', '#72b235'],
  SC8 = <any>['#6ed0e4', '#3f72c1', '#58b5da', '#026e7f', '#54b2ae', '#8adfe9', '#4a95cf', '#3452b5', '#015268', '#75c4be', '#3f72c1', '#6ed0e4'],
  SC9 = <any>['#7c5ac1', '#7d0071', '#cd2287', '#ee5398', '#4c006a', '#9b7fe4', '#4c309a', '#b099f0', '#ad037c', '#fca0c3', '#e03c8f', '#fc79ac'],
  // color by measure
  VC1 = <any>['#ffcaba', '#fb7661', '#f23a2c', '#d73631', '#9a0b2c'],
  VC2 = <any>['#f6f4b7', '#fee330', '#fbb700', '#f28a00', '#fb6e2c'],
  VC3 = <any>['#d1e5c2', '#97cb63', '#72b235', '#4b8a21', '#2d681a'],
  VC4 = <any>['#b5e0e1', '#75c4be', '#2b9a9e', '#026e7f', '#064059'],
  VC5 = <any>['#c4eeed', '#8adfe9', '#58b5da', '#3f72c1', '#23399f'],
  VC6 = <any>['#efdffd', '#b099f0', '#8d6dd2', '#6344ad', '#391f8a'],
  VC7 = <any>['#fcc9dd', '#fc79ac', '#e03c8f', '#ad037c', '#4c006a'],
  VC8 = <any>['#ffcaba', '#fda08c', '#fb7661', '#f8533b', '#f23a2c', '#e5342c', '#d73631', '#c22a32', '#9a0b2c'],
  VC9 = <any>['#f6f4b7', '#f9f6a1', '#fee330', '#ffd200', '#fbb700', '#f6a300', '#f28a00', '#f27603', '#fb6e2c'],
  VC10 = <any>['#d1e5c2', '#b5d994', '#97cb63', '#83bf47', '#72b235', '#5d9f27', '#4b8a21', '#39751d', '#2d681a'],
  VC11 = <any>['#b5e0e1', '#9ad5d2', '#75c4be', '#54b2ae', '#2b9a9e', '#0c8691', '#026e7f', '#015268', '#064059'],
  VC12 = <any>['#c4eeed', '#a9e7eb', '#8adfe9', '#6ed0e4', '#58b5da', '#4a95cf', '#3f72c1', '#3452b5', '#23399f'],
  VC13 = <any>['#efdffd', '#cdbaf8', '#b099f0', '#9b7fe4', '#8d6dd2', '#7c5ac1', '#6344ad', '#4c309a', '#391f8a'],
  VC14 = <any>['#fcc9dd', '#fca0c3', '#fc79ac', '#ee5398', '#e03c8f', '#cd2287', '#ad037c', '#7d0071', '#4c006a'],
  VC15 = <any>['#c22a32', '#f23a2c', '#fb7661', '#ffcaba', '#ededed', '#b5e0e1', '#75c4be', '#2b9a9e', '#0c8691'],
  VC16 = <any>['#9a0b2c', '#d73631', '#f28a00', '#fbb700', '#f6f4b7', '#d1e5c2', '#75c4be', '#3f72c1', '#391f8a'],
  VC17 = <any>['#ad037c', '#e03c8f', '#fc79ac', '#fcc9dd', '#ededed', '#d1e5c2', '#97cb63', '#72b235', '#4b8a21'],
  VC18 = <any>['#fbb700', '#ffd200', '#fee330', '#f9f6a1', '#ededed', '#cdbaf8', '#b099f0', '#7c5ac1', '#4c309a'],
  VC19 = <any>['#f27603', '#f28a00', '#fbb700', '#fee330', '#f6f4b7', '#c4eeed', '#6ed0e4', '#4a95cf', '#3452b5'],
}

/**
 * waterfall 양수 / 음수 색상
 */
export enum WaterfallBarColor {

  // 양수
  POSITIVE = <any>'#c23531',

  // 음수
  NEGATIVE = <any>'#304554'
}

/**
 * measure의 color range
 */
export enum MeasureColorRange {

  // 범위를 벗어났을때 쓰이는 색상
  OUTOF_RANGE = <any>'#3c4950',
  // 기본설정색상
  DEFAULT = <any>'#c94819'
}

/**
 * 축관련 색상설정
 */
export enum AxisDefaultColor {

  // 축라인 색상
  AXIS_LINE_COLOR = <any>'#bfbfbf',

  // 축라벨 색상
  LABEL_COLOR = <any> '#8f96a0',

  // 라인색상
  LINE_COLOR = <any> '#f2f2f2'
}

/**
 * color range의 타입
 */
export enum ColorCustomMode {
  NONE = <any>'NONE',
  SECTION = <any>'SECTION',
  GRADIENT = <any>'GRADIENT'
}

/**
 * range내의 타입
 */
export enum ColorRangeType {
  SECTION = <any>'section',
  GRADIENT = <any>'gradient',
}


/**
 * 옵션패널의 이벤트 타입
 */
export enum EventType {

  // 누적모드
  CUMULATIVE = <any>'cumulativeMode',
  // 선반 변경시
  CHANGE_PIVOT = <any>'changePivot',
  // 맵차트 옵션 변경시
  MAP_CHANGE_OPTION = <any>'mapChangeOption',
  // 공간 분석 시
  MAP_SPATIAL_ANALYSIS = <any>'spatialAnalysis',
  MAP_SPATIAL_REANALYSIS = <any>'spatialReAnalysis',
  // 그리드차트 피봇/원본
  GRID_ORIGINAL = <any>'gridViewType',
  // 바차트 병렬 / 중첩
  SERIES_VIEW = <any>'barSeriesViewType',
  // granularity 변경시
  GRANULARITY = <any>'onChangeGranularity',
  // aggregation 변경시
  AGGREGATION = <any>'onChangeAggregationType',
  // change chart type
  CHART_TYPE = <any>'chartType',
  // filter changed
  FILTER = <any>'filter',
  // change pivot alias
  PIVOT_ALIAS = <any>'pivotAlias',
  // change dashboard alias
  DASHBOARD_ALIAS = <any>'dashboardAlias'
}

/**
 * Grid 차트 한정 색상 프리셋
 *
 */
export enum GridCellColorList {
  LINE1 = <any>[['#a1e1f8', '#89cdeb', '#59a4d2', '#418fc5', '#297bb8', '#246ea5', '#1e6191', '#19537e', '#13466b', '|',],
    ['#777', '#777', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']],
  CONT1 = <any>[['#253ba2', '#374daf', '#4668b5', '#567dbd', '#638fc0', '#85a6cc', '#a0bad7', '#cbd8e6', '#f9f9f9', '#f6d3d3', '#f1b8b8', '#eb9999', '#dc6e6e', '#cc4d4d', '#cc3333', '#b71414', '#990a00'],
    ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#777', '#777', '#777', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff']
  ]
}

/**
 * 차트 그래디언트 타입
 */
export enum ChartGradientType {
  LINEAR = <any>'LINEAR',
  CONTRAST = <any>'CONTRAST',
  CUSTOM = <any>'CUSTOM'
}

/**
 * grid 차트 색상 지정 대상
 */
export enum CellColorTarget {
  BACKGROUND = <any>'BACKGROUND',
  TEXT = <any>'TEXT'
}

/**
 * grid 연산행 연산자
 */
export enum Operator {
  SUM = <any>'SUM',
  AVERAGE = <any>'AVERAGE',
  MAX = <any>'MAX',
  MIN = <any>'MIN',
  COUNT = <any>'COUNT'
}

/**
 * 차트 라벨 타입
 */
export enum AxisOrientType {
  X = <any>'X',
  Y = <any>'Y'
}

/**
 * 차트 라벨 타입
 */
export enum AxisLabelType {
  ROW = <any>'row',
  COLUMN = <any>'column',
  SUBROW = <any>'sub_row',
  SUBCOLUMN = <any>'sub_column',
  SIMPLE = <any>'simple',
  AGGREGATION = <any>'aggregation',
}

/**
 * 축 변경 타입
 */
export enum LabelConvertType {
  NAME = <any>'name',
  SHOWNAME = <any>'showName',
  SHOWMARK = <any>'showMark',
  MARK = <any>'mark',
  SCALED = <any>'scaled',
  SHOWVALUE = <any>'showValue',
  SHOWLABEL = <any>'showLabel',
  ALIGN = <any>'align',
  AXISCONFIG = <any>'axisConfig'
}

/**
 * 축 단위 라벨 회전
 */
export enum AxisLabelMark {
  HORIZONTAL = <any>'HORIZONTAL',
  VERTICAL = <any>'VERTICAL',
  SLOPE = <any>'SLOPE'
}

/**
 * 범례 변경 타입
 */
export enum LegendConvertType {
  SHOW = <any>'show',
  COUNT = <any>'count'
}

/**
 * 미니맵 변경 타입
 */
export enum DataZoomConverType {
  SHOW = <any>'show',
  RANGE = <any>'range'
}

/**
 * 차트 시리즈 표현 변경 타입
 */
export enum SeriesConvertType {
  MARK = <any>'mark',
  SHOW = <any>'show',
  UNITTYPE = <any>'unitType',
  ACCUMULATE = <any>'isAccumulate',
  SHAPE = <any>'shape',
  ALIGN = <any>'align',
  VALIGN = <any>'valign',
  LAYOUT = <any>'layout',
  FORMAT = <any>'format',
  DECIMAL = <any>'decimal',
  BAR = <any>'bar',
  LINE = <any>'line',
  LABEL = <any>'label',
  ROTATE = <any>'rotate'
}

/**
 * 차트 mark 표현 타입
 */
export enum BarMarkType {
  MULTIPLE = <any>'MULTIPLE',
  STACKED = <any>'STACKED',
}

/**
 * 차트 시리즈 데이터 표현 단위
 */
export enum DataUnit {
  NONE = <any>'NONE',
  PERCENT = <any>'PERCENT'
}

/**
 * 라인차트 marktype
 */
export enum LineMarkType {
  LINE = <any>'LINE',       // 라인 표시
  AREA = <any>'AREA'       // 면적 표시
}

/**
 * 라인차트 Corner Type
 */
export enum LineCornerType {
  STRAIGHT = <any>'STRAIGHT', // 직선형
  SMOOTH = <any>'SMOOTH'        // 굴림형
}

/**
 * 라인차트 공통 스타일
 */
export enum LineStyle {
  POINT_LINE = <any>'POINT_LINE', // 포인트 라인 혼합
  POINT = <any>'POINT', // 포인트만 표시
  LINE = <any>'LINE' // 라인만 표시
}

/**
 * 라인차트 기본 / 누계
 */
export enum LineMode {
  NORMAL = <any>'NORMAL', // 기본
  CUMULATIVE = <any>'CUMULATIVE' // 누계
}

/**
 * 스케터차트 포인트 사이즈
 */
export enum PointSize {
  NORMAL = <any>'NORMAL',          // 보통
  SMALL = <any>'SMALL',           // 작게
  LARGE = <any>'LARGE',           // 크게
  XLARGE = <any>'XLARGE',          // 매우 크게
}

/**
 * grid 차트 표현 타입
 */
export enum GridViewType {
  PIVOT = <any>'PIVOT',
  MASTER = <any>'MASTER',
}

/**
 * grid 차트 annotation position
 */
export enum AnnotationPosition {
  TOP_RIGHT = <any>'TOP_RIGHT',
  TOP_LEFT = <any>'TOP_LEFT',
  BOTTOM_RIGHT = <any>'BOTTOM_RIGHT',
  BOTTOM_LEFT = <any>'BOTTOM_LEFT'
}

/**
 * pie 차트 표현 타입
 */
export enum PieSeriesViewType {
  SECTOR = <any>'SECTOR',
  DONUT = <any>'DONUT',
}

/**
 * 데이터 값 포멧
 */
export enum ValueFormat {
  NUMBER = <any>'NUMBER',
  TEXT = <any>'TEXT'
}

/**
 * DataZoom Range 타입
 *
 */
export enum DataZoomRangeType {
  COUNT = <any>'COUNT',
  PERCENT = <any>'PERCENT'
}

/**
 * UILocation
 *
 */
export enum AxisOrientType {
  HORIZONTAL = <any>'HORIZONTAL',
  VERTICAL = <any>'VERTICAL'
}

/**
 * 마우스 커서
 */
export enum ChartMouseMode {
  SINGLE = <any>'single',
  MULTI = <any>'multi',
  DRAGZOOMIN = <any>'dragzoomin',
  ZOOMIN = <any>'zoomin',
  ZOOMOUT = <any>'zoomout',
  REVERT = <any>'revert'
}

/**
 * 차트 선택모드
 */
export enum ChartSelectMode {
  ADD = <any>'add',
  SUBTRACT = <any>'subtract',
  CLEAR = <any>'clear'
}

/**
 * 위치값
 */
export enum UIPosition {
  AUTO = <any>'AUTO',
  LEFT = <any>'LEFT',
  RIGHT = <any>'RIGHT',
  CENTER = <any>'CENTER',
  TOP = <any>'TOP',
  MIDDLE = <any>'MIDDLE',
  BOTTOM = <any>'BOTTOM',
  RIGHT_BOTTOM = <any>'RIGHT_BOTTOM',
  LEFT_BOTTOM = <any>'LEFT_BOTTOM',
  RIGHT_TOP = <any>'RIGHT_TOP',
  LEFT_TOP = <any>'LEFT_TOP'
}

/**
 * 표시 레이블 선택
 */
export enum UIChartDataLabelDisplayType {
  CATEGORY_NAME = <any>'CATEGORY_NAME',
  CATEGORY_VALUE = <any>'CATEGORY_VALUE',
  CATEGORY_PERCENT = <any>'CATEGORY_PERCENT',
  SERIES_NAME = <any>'SERIES_NAME',
  SERIES_VALUE = <any>'SERIES_VALUE',
  SERIES_PERCENT = <any>'SERIES_PERCENT',
  XAXIS_VALUE = <any>'XAXIS_VALUE',
  YAXIS_VALUE = <any>'YAXIS_VALUE',
  VALUE = <any>'VALUE',
  NODE_NAME = <any>'NODE_NAME',
  LINK_VALUE = <any>'LINK_VALUE',
  NODE_VALUE = <any>'NODE_VALUE',
  HIGH_VALUE = <any>'HIGH_VALUE',
  THREE_Q_VALUE = <any>'THREE_Q_VALUE',
  MEDIAN_VALUE = <any>'MEDIAN_VALUE',
  FIRST_Q_VALUE = <any>'FIRST_Q_VALUE',
  LOW_VALUE = <any>'LOW_VALUE',
  LAYER_NAME = <any>'LAYER_NAME',
  LOCATION_INFO = <any>'LOCATION_INFO',
  DATA_VALUE = <any>'DATA_VALUE'
}

/**
 * 표현 방향
 */
export enum UIOrient {
  VERTICAL = <any>'VERTICAL',
  HORIZONTAL = <any>'HORIZONTAL',
  BOTH = <any>'BOTH'
}

/**
 * 스케터 차트 심볼 타입
 */
export enum PointShape {
  CIRCLE = <any>'CIRCLE',       // 원
  RECT = <any>'RECT',         // 사각형(네모)
  TRIANGLE = <any>'TRIANGLE',     // 삼각형(세모)
  DIAMOND = <any>'DIAMOND',      // 마름모(다이아몬드)
  PIN = <any>'PIN',          // 십자
  ARROW = <any>'ARROW'        // 액스
}

/**
 * 포맷 타입
 */
export enum UIFormatType {
  NUMBER = <any>'number',
  CURRENCY = <any>'currency',
  PERCENT = <any>'percent',
  EXPONENT10 = <any>'exponent10',
  TIME_CONTINUOUS = <any>'time_continuous',
  TIME_CUSTOM = <any>'time_custom'
}

/**
 * 포맷 통화 심볼 타입
 */
export enum UIFormatCurrencyType {
  KRW = <any>'KRW',
  USD = <any>'USD',
  USCENT = <any>'USCENT',
  GBP = <any>'GBP',
  JPY = <any>'JPY',
  EUR = <any>'EUR',
  CNY = <any>'CNY'
}

/**
 * 수치표기 약어 타입
 */
export enum UIFormatNumericAliasType {
  NONE = <any>'NONE',
  AUTO = <any>'AUTO',
  KILO = <any>'KILO',
  MEGA = <any>'MEGA',
  GIGA = <any>'GIGA'
}

/**
 * 포맷 사용자 기호 위치
 */
export enum UIFormatSymbolPosition {
  BEFORE = <any>'BEFORE',
  AFTER = <any>'AFTER'
}

/**
 * 폰트 사이즈
 */
export enum UIFontSize {
  DEFAULT = <any>'default',
  SMALLER = <any>'smaller',
  LARGER = <any>'larger'
}

/**
 * 축 눈금 관련 옵션
 */
export enum ChartAxisGridType {
  TEXT = <any>'text',
  NUMERIC = <any>'numeric',
  DATETIME = <any>'datetime'
}

/**
 * 축 Label 타입
 */
export enum ChartAxisLabelType {
  VALUE = <any>'value',
  CATEGORY = <any>'category'
}

/**
 * 데이터라벨 위치
 */
export enum DataLabelPosition {
  OUTSIDE_TOP = <any>'OUTSIDE_TOP',
  INSIDE_TOP = <any>'INSIDE_TOP',
  INSIDE_BOTTOM = <any>'INSIDE_BOTTOM',
  CENTER = <any>'CENTER',
  OUTSIDE_RIGHT = <any>'OUTSIDE_RIGHT',
  INSIDE_RIGHT = <any>'INSIDE_RIGHT',
  INSIDE_LEFT = <any>'INSIDE_LEFT',
  TOP = <any>'TOP',
  BOTTOM = <any>'BOTTOM',
  RIGHT = <any>'RIGHT',
  LEFT = <any>'LEFT'
}

/**
 * 데이터레이블 text align
 */
export enum TextAlign {
  DEFAULT = <any>'DEFAULT',
  LEFT = <any>'LEFT',
  CENTER = <any>'CENTER',
  RIGHT = <any>'RIGHT'
}

/**
 * shelf type
 */
export enum ShelfType {
  PIVOT = <any>'pivot',
  GRAPH = <any>'graph',
  GEO = <any>'geo'
}

/**
 * shelf layer view type
 */
export enum LayerViewType {
  ORIGINAL = <any>'original',
  HASH = <any>'hash',
  CLUSTERING = <any>'clustering'
}

/**
 * field format type
 */
export enum FormatType {
  DEFAULT = <any>'default',
  GEO = <any>'geo',
  GEO_HASH = <any>'geo_hash',
  GEO_BOUNDARY = <any>'geo_boundary',
  GEO_JOIN = <any>'geo_join'
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
