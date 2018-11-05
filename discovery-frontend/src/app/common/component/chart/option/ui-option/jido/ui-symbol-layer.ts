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
 * symbol layer
 */

import { MapOutline } from './ui-outline';
import { MapSymbolType } from '../../define/jido/jido-common';

// TODO add extends UILayers later
// export interface UISymbolLayer extends UILayers {
export interface UISymbolLayer {

  // Type of symbol
  symbol?: MapSymbolType;

  // Size of layer
  size?: MapLayerSize;

  // Outline of layer, outline 속성이 null 이거나 없는 경우 off 처리
  outline?: MapOutline;

  // enable clustering, if true. (default false or null)
  clustering?: boolean;

  //////////////////////
  ////// only used in ui
  //////////////////////

  type?: string;
}

/**
 * Size of layer
 */
export interface MapLayerSize {

  // Size specification criteria
  by?: string;

  // Column Name
  column?: string;

  /////////////////
  // only used in ui
  /////////////////

  max?: number;

}
