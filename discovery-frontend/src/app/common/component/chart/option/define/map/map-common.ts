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
  OSM = 'OSM'
}

/**
 * map layer style
 */
export enum MapLayerStyle {
  COLORED = 'Colored',
  LIGHT = 'Light',
  DARK = 'Dark'
}

/**
 * map layer type
 */
export enum MapLayerType {
  SYMBOL = 'symbol',
  LINE = 'line',
  POLYGON = 'polygon',
  MULTILINESTRING = 'MultiLineString',
  MULTIPOLYGON = 'multipolygon',
  HEATMAP = 'heatmap',
  TILE = 'tile',
  // cluster => UI Only
  CLUSTER = 'cluster'
}

/**
 * symbol layer - symbol type
 */
export enum MapSymbolType {
  CIRCLE = 'CIRCLE',
  SQUARE = 'SQUARE',
  TRIANGLE = 'TRIANGLE',
  PIN = 'PIN',
  PLAIN = 'PLAIN',
  USER = 'USER'
}

/**
 * line layer - line path type
 */
export enum MapLinePathType {
  STRAIGHT = 'STRAIGHT',
  ARCH = 'ARCH'
}

/**
 * Color specification criteria
 */
export enum MapBy {
  NONE = 'NONE',
  MEASURE = 'MEASURE',
  DIMENSION = 'DIMENSION'
}

/**
 * tile layer - Shape of tile
 */
export enum MapTileShape {
  HEXAGON = 'HEXAGON',
  SQUARE = 'SQUARE'
}

/**
 * outline - Thickness outline
 */
export enum MapThickness {
  THIN = 'THIN',
  NORMAL = 'NORMAL',
  THICK = 'THICK'
}

/**
 * line layer - line style
 */
export enum MapLineStyle {
  SOLID = 'SOLID',
  DOTTED = 'DOTTED',
  DASHED = 'DASHED'
}

/**
 * color - heatmap color
 */
export class HeatmapColorList {
  public static readonly HC1 = ['#1c02fe', '#0582ff', '#04dbfe', '#00ffe0', '#03ff00', '#8bff00', '#feff00', '#ffa502', '#ff0500'];
  public static readonly HC2 = ['#f702ff', '#8d01ff', '#1c01fe', '#03837a', '#03ff00', '#8bff00', '#feff00', '#ffa502', '#ff0500'];
  public static readonly HC3 = ['#090081', '#014236', '#027e03', '#80d105', '#feff00', '#fdc404', '#ff9304', '#ff5203', '#ff0500'];
  public static readonly HC4 = ['#1c01ff', '#2a00e0', '#3e00c0', '#5f019e', '#82007b', '#9f015d', '#b80247', '#df031e', '#ff0500'];
  public static readonly HC5 = ['#000000', '#330041', '#5c005f', '#a50242', '#e0031e', '#f85302', '#ffaa01', '#ffdf54', '#fffca1'];
  public static readonly HC6 = ['#000000', '#300000', '#5e0100', '#9a3e01', '#bf7300', '#d7a30d', '#edd726', '#f9f53d', '#feffa9'];
  public static readonly HC7 = ['#000000', '#09172e', '#0e2249', '#163363', '#25487f', '#2c6097', '#2391bc', '#1bb5d1', '#0af4f8'];
}

export enum MapGeometryType {
  POINT = 'Point',
  LINE = 'LineString'
}

/**
 * selection filter color, outline
 */
export enum SelectionColor {
  FEATURE_DARK = '#333333',
  FEATURE_LIGHT = '#c6cacc',
  OUTLINE_DARK = '#4c4c4c',
  OUTLINE_LIGHT = '#babebf'
}
