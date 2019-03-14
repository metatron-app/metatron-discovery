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

import { NgModule } from '@angular/core';
import { CommonModule } from './common.module';
import { ChartTestService } from '../chart-test/service/chart-test.service';
import { BarChartComponent } from './component/chart/type/bar-chart/bar-chart.component';
import { LineChartComponent } from './component/chart/type/line-chart/line-chart.component';
import { NetworkChartComponent } from './component/chart/type/network-chart/network-chart.component';
import { SankeyChartComponent } from './component/chart/type/sankey-chart/sankey-chart.component';
import { ScatterChartComponent } from './component/chart/type/scatter-chart/scatter-chart.component';
import { HeatMapChartComponent } from './component/chart/type/heatmap-chart/heatmap-chart.component';
import { PieChartComponent } from './component/chart/type/pie-chart/pie-chart.component';
import { GridChartComponent } from './component/chart/type/grid-chart/grid-chart.component';
import { GaugeChartComponent } from './component/chart/type/gauge-chart/gauge-chart.component';
import { RadarChartComponent } from './component/chart/type/radar-chart/radar-chart.component';
import { ControlChartComponent } from './component/chart/type/control-chart/control-chart.component';
import { WordCloudChartComponent } from './component/chart/type/wordcloud-chart/wordcloud-chart.component';
import { BoxPlotChartComponent } from './component/chart/type/boxplot-chart/boxplot-chart.component';
import { WaterFallChartComponent } from './component/chart/type/waterfall-chart/waterfall-chart.component';
import { TreeMapChartComponent } from './component/chart/type/treemap-chart/treemap-chart.component';
import { CombineChartComponent } from './component/chart/type/combine-chart/combine-chart.component';
import { LabelChartComponent } from './component/chart/type/label-chart/label-chart.component';
import { MapChartComponent } from './component/chart/type/map-chart/map-chart.component';
import {MapChartAnalysisComponent} from "./component/chart/type/map-chart/map-chart-analysis.component";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    BarChartComponent,
    LineChartComponent,
    ControlChartComponent,
    ScatterChartComponent,
    HeatMapChartComponent,
    GridChartComponent,
    BoxPlotChartComponent,
    PieChartComponent,
    LabelChartComponent,
    WaterFallChartComponent,
    WordCloudChartComponent,
    RadarChartComponent,
    CombineChartComponent,
    TreeMapChartComponent,
    NetworkChartComponent,
    SankeyChartComponent,
    GaugeChartComponent,
    MapChartComponent,
    MapChartAnalysisComponent
  ],
  exports: [
    BarChartComponent,
    LineChartComponent,
    ControlChartComponent,
    ScatterChartComponent,
    HeatMapChartComponent,
    GridChartComponent,
    BoxPlotChartComponent,
    PieChartComponent,
    LabelChartComponent,
    WaterFallChartComponent,
    WordCloudChartComponent,
    RadarChartComponent,
    CombineChartComponent,
    TreeMapChartComponent,
    NetworkChartComponent,
    SankeyChartComponent,
    GaugeChartComponent,
    MapChartComponent,
    MapChartAnalysisComponent
  ],
  providers: [ChartTestService]
})
export class ChartModule {
}
