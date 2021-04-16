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

import {ShelfType} from '@common/component/chart/option/define/common';
import {GeoField} from '../field/geo-field';

/**
 * map shelf
 */
export class Shelf {

  // shelf type
  public type: ShelfType;

  // Layers
  public layers: ShelfLayers[];

  constructor() {
    this.type = ShelfType.GEO;
    const shelfLayers: ShelfLayers = new ShelfLayers();
    this.layers = [];
    this.layers.push(shelfLayers);
  }
}


export class ShelfLayers {
  name: string = '';
  ref: string = '';
  view?: any;
  fields: GeoField[] = [];
}
