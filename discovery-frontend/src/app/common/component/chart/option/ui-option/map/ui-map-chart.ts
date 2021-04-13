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

import { UIOption } from '../../ui-option';
import { UILayers } from './ui-layers';
import { MapType } from '../../define/map/map-common';

/**
 * map chart ui option
 * Version 2.0
 */
export interface UIMapOption extends UIOption {

  ////////////////////////////////////////////
  // Server Spec
  ////////////////////////////////////////////

  // map on / off
  showMapLayer?: boolean;

  // map service type
  map?: MapType;

  // service license
  licenseNotation?: string;

  // province layer on / off
  showDistrictLayer?: boolean;

  // province unit
  districtUnit?: string;

  // layer list
  layers?: UILayers[];

  ////////////////////////////////////////////
  // UI Spec
  ////////////////////////////////////////////

  // TODO specs which don't exist in server spec
  // map style (light, dark, colored)
  style?: string;
  // TODO specs which don't exist in server spec

  // current layer number (0 - 2)
  layerNum?: number;

  // map current lat, lng
  lowerCorner? : string;
  upperCorner? : string;

  // spatial analysis
  analysis? : any;

  // zoom size
  zoomSize? : number;
}
