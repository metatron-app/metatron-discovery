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

import {MapLayerSize} from '@common/component/chart/option/ui-option/map/ui-symbol-layer';
import {MapBy, MapLayerType, MapLineStyle, MapSymbolType} from '../../define/map/map-common';
import {ColorRange} from '../ui-color';
import {MapOutline} from './ui-outline';

export type UISymbolLayer = Omit<UILayers, 'size'> & { size: MapLayerSize };

/**
 * map chart layer
 */
export interface UILayers {

  // layer type
  type?: MapLayerType;

  name?: string;

  color?: SymbolColor;

  symbol?: string;    // CIRCLE, SQUARE, TRIANGLE

  size?: LayerSize;

  outline?: MapOutline;

  clustering?: boolean;

  coverage?: number;

  // Thickness of line
  thickness?: UIThickness;

  // line style (solid, dashed, dotted)
  lineStyle?: MapLineStyle;

  ////////////////////////
  ///// UI Spec
  ////////////////////////

  // heatMap radius
  heatMapRadius?: number;

  // tile radius
  tileRadius?: number;

  // point radius
  pointRadius?: number;

  symbolPointType?: MapSymbolType;
  symbolOutline?: MapOutline;

  clusterPointType?: MapSymbolType;
  clusterOutline?: MapOutline;

  // color type 관련
  noneColor?: string;
  dimensionColor?: string;
  measureColor?: string;
}

/**
 * Symbol Color
 */
interface SymbolColor {

  // Color specification criteria
  by?: MapBy;

  // Column Name
  column?: string;

  // Color code or schema code
  schema?: string;

  // Transparency (0~100)
  transparency?: number;

  // Source color, if line layer case
  source?: string;

  // Target color, if line layer case
  target?: string;

  ////////////////////////
  ///// UI Spec
  ////////////////////////

  // color by dimension custom color setting
  mapping?: object;

  // color by measure custom color setting
  ranges?: ColorRange[];

  // min max range
  minValue?: number;
  maxValue?: number;

  // Column Aggregation type (measure)
  aggregationType?: string;

  // Column granularity (timestamp)
  granularity?: string;

  // custom color on / off
  settingUseFl: boolean;

  // type schema, transparency
  symbolSchema?: string;
  symbolTransparency?: number;

  heatMapSchema?: string;
  heatMapTransparency?: number;

  tileSchema?: string;
  tranTransparency?: number;

  polygonSchema?: string;

  // cluster => UI Only
  clusterSchema?: string;
  clusterTransparency?: number;

  changeRange?: boolean;
}

interface LayerSize {
  by: string;
  column: string;
  min?: number;
  max?: number;
}

/**
 * Thickness of line
 */
interface UIThickness {

  // Color specification criteria
  by?: MapBy;

  // Column Name
  column?: string;

  // Max value of thickness
  maxValue?: number;

  ////////////////////////
  ///// UI Spec
  ////////////////////////

  // Column Aggregation type (measure)
  aggregationType?: string;

  // Column granularity (timestamp)
  granularity?: string;
}
