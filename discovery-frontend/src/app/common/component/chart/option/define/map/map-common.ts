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
 * map type
 */
export enum MapType {
  OSM = <any>'OSM'
}

/**
 * map layer style
 */
export enum MapLayerStyle {
  COLORED = <any>'Colored',
  LIGHT = <any>'Light',
  DARK = <any>'Dark'
}

/**
 * map layer type
 */
export enum MapLayerType {
  SYMBOL = <any>'symbol',
  LINE = <any>'line',
  POLYGON = <any>'polygon',
  MULTILINESTRING = <any>'MultiLineString',
  MULTIPOLYGON = <any>'multipolygon',
  HEATMAP = <any>'heatmap',
  TILE = <any>'tile',
  // cluster => UI Only
  CLUSTER = <any>'cluster'
}

/**
 * symbol layer - symbol type
 */
export enum MapSymbolType {
  CIRCLE = <any>'CIRCLE',
  SQUARE = <any>'SQUARE',
  TRIANGLE = <any>'TRIANGLE',
  PIN = <any>'PIN',
  PLAIN = <any>'PLAIN',
  USER = <any>'USER'
}

/**
 * line layer - line path type
 */
export enum MapLinePathType {
  STRAIGHT = <any>'STRAIGHT',
  ARCH = <any>'ARCH'
}

/**
 * Color specification criteria
 */
export enum MapBy {
  NONE = <any>'NONE',
  MEASURE = <any>'MEASURE',
  DIMENSION = <any>'DIMENSION'
}

/**
 * tile layer - Shape of tile
 */
export enum MapTileShape {
  HEXAGON = <any>'HEXAGON',
  SQUARE = <any>'SQUARE'
}

/**
 * outline - Thickness outline
 */
export enum MapThickness {
  THIN = <any>'THIN',
  NORMAL = <any>'NORMAL',
  THICK = <any>'THICK'
}

/**
 * line layer - line style
 */
export enum MapLineStyle {
  SOLID = <any>'SOLID',
  DOTTED = <any>'DOTTED',
  DASHED = <any>'DASHED'
}

/**
 * color - heatmap color
 */
export enum HeatmapColorList {
  HC1 = <any>['#1c02fe', '#0582ff', '#04dbfe', '#00ffe0', '#03ff00', '#8bff00', '#feff00', '#ffa502', '#ff0500'],
  HC2 = <any>['#f702ff', '#8d01ff', '#1c01fe', '#03837a', '#03ff00', '#8bff00', '#feff00', '#ffa502', '#ff0500'],
  HC3 = <any>['#090081', '#014236', '#027e03', '#80d105', '#feff00', '#fdc404', '#ff9304', '#ff5203', '#ff0500'],
  HC4 = <any>['#1c01ff', '#2a00e0', '#3e00c0', '#5f019e', '#82007b', '#9f015d', '#b80247', '#df031e', '#ff0500'],
  HC5 = <any>['#000000', '#330041', '#5c005f', '#a50242', '#e0031e', '#f85302', '#ffaa01', '#ffdf54', '#fffca1'],
  HC6 = <any>['#000000', '#300000', '#5e0100', '#9a3e01', '#bf7300', '#d7a30d', '#edd726', '#f9f53d', '#feffa9'],
  HC7 = <any>['#000000', '#09172e', '#0e2249', '#163363', '#25487f', '#2c6097', '#2391bc', '#1bb5d1', '#0af4f8']
}

export enum MapGeometryType {
  POINT = <any>'Point',
  LINE = <any>'LineString'
}

/**
 * selection filter color, outline
 */
export enum SelectionColor {
  FEATURE_DARK = <any>'#333333',
  FEATURE_LIGHT = <any>'#c6cacc',
  OUTLINE_DARK = <any>'#4c4c4c',
  OUTLINE_LIGHT = <any>'#babebf'
}
