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
 * heatmap layer
 */
import { UILayers } from './ui-layers';

// TODO add extends UILayers later
// export interface UIHeatmapLayer {
export interface UIHeatmapLayer extends UILayers {

  // Blur value (0~100), default 20
  blur?: number;

  // Radius value (0~100), default 20
  radius?: number;
}
