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

import { MapBy, MapLinePathType, MapLineStyle } from '../../define/map/map-common';
import { UILayers } from './ui-layers';

/**
 * symbol layer
 */
export interface UILineLayer extends UILayers {

  // Type of Line
  pathType?: MapLinePathType;

  // Source column Name
  source?: string;

  // Target column Name
  target?: string;

  // Thickness of line
  thickness?: UIThickness;

  // line style (solid, dashed, dotted)
  lineStyle?: MapLineStyle;

  ////////////////////////
  ///// UI Spec
  ////////////////////////
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
