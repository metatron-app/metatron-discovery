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

import { MapBy, MapLayerType } from '../../define/map/map-common';
import { ColorRange } from '../ui-color';

/**
 * map chart layer
 */
export interface UILayers {

  // layer type
  type?: MapLayerType;

  name?: string;

  color?: SymbolColor;

  ////////////////////////
  ///// UI Spec
  ////////////////////////
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
  mapping?: Object

  // color by measure custom color setting
  ranges?: ColorRange[];

  // Column Aggregation type (measure)
  aggregationType?: string;

  // Column granularity (timestamp)
  granularity?: string;
}
