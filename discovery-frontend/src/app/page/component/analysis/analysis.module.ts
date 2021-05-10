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

import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {AnalysisComponent} from './analysis.component';
import {CommonModule} from '@common/common.module';
import {AnalysisPredictionModule} from './prediction/analysis-prediction.module';
import {TrendLineModule} from './trend.line/trend.line.module';
import {ColorPickerLayerComponent} from './color.picker/color.picker.layer.component';
import {RangeSliderComponent} from './slider/range-slider.component';
import {AnalysisClusterComponent} from './cluster/analysis-cluster.component';
import {MapSpatialComponent} from './map-spatial/map-spatial.component';

@NgModule({
  imports: [
    CommonModule,
    AnalysisPredictionModule,
    TrendLineModule
  ],
  declarations: [
    AnalysisComponent,
    AnalysisClusterComponent,
    MapSpatialComponent
  ],
  exports: [
    AnalysisComponent,
    ColorPickerLayerComponent,
    RangeSliderComponent,
    MapSpatialComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AnalysisModule {
}
