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
 * map layer type
 */
export enum MapLayerType {
  SYMBOL = <any>'symbol',
  LINE = <any>'line',
  POLYGON = <any>'polygon',
  HEATMAP = <any>'heatmap',
  TILE = <any>'tile',
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
