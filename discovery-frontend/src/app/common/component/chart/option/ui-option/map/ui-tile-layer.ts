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



import { MapTileShape } from '../../define/map/map-common';
import { UILayers } from './ui-layers';

/**
 * tile layer
 */
export interface UITileLayer extends UILayers {

  // Shape of tile
  shape?: MapTileShape;

  // Coverage of tile(0~100), default 80
  coverage?: number;

  // Radius value (0~100), default 20
  radius?: number;

  ////////////////////////
  ///// UI Spec
  ////////////////////////
}
