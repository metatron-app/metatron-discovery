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
import { RouterModule, Routes } from '@angular/router';
import { PageComponent } from './page.component';
import { CommonModule } from '../common/common.module';
import { PageShareModule } from './page-share.module';
import { ImageService } from '../common/service/image.service';
import { AnalysisPredictionService } from './component/analysis/service/analysis.prediction.service';
import {TimezoneService} from "../data-storage/service/timezone.service";
import {PageViewComponent} from "./page-view.component";
import {PagePivotComponent} from "./page-pivot/page-pivot.component";
import {FormatItemComponent} from "./chart-style/format/format-item.component";
import {PageFilterPanel} from "./filter/filter-panel.component";
import {PageDataContextComponent} from "./page-data/page-data-context.component";
import {PopupValueAliasComponent} from "./page-pivot/popup-value-alias.component";
import {CommonOptionComponent} from "./chart-style/common-option.component";
import {LegendOptionComponent} from "./chart-style/legend-option.component";
import {XAxisOptionComponent} from "./chart-style/xaxis-option.component";
import {YAxisOptionComponent} from "./chart-style/yaxis-option.component";
import {SecondaryAxisOptionComponent} from "./chart-style/secondary-axis-option.component";
import {AxisValueOptionComponent} from "./chart-style/axis-value-option.component";
import {AxisCategoryOptionComponent} from "./chart-style/axis-category-option.component";
import {DataLabelOptionComponent} from "./chart-style/datalabel-option.component";
import {TooltipOptionComponent} from "./chart-style/tooltip-option.component";
import {SecondaryIndicatorComponent} from "./chart-style/secondary-indicator.component";
import {FormatOptionComponent} from "./chart-style/format-option.component";
import {ColorOptionComponent} from "./chart-style/color-option.component";
import {SplitOptionComponent} from "./chart-style/split-option.component";
import {CalculatedRowOptionComponent} from "./chart-style/calc-option.component";
import {CalculatedOptionSliderComponent} from "./chart-style/calc-option-slider.component";
import {MapPagePivotComponent} from "./page-pivot/map/map-page-pivot.component";
import {MapCommonOptionComponent} from "./chart-style/map/map-common-option.component";
import {MapLayerOptionComponent} from "./chart-style/map/map-layer-option.component";
import {MapLegendOptionComponent} from "./chart-style/map/map-legend-option.component";
import {MapTooltipOptionComponent} from "./chart-style/map/map-tooltip-option.component";
import {MapFormatOptionComponent} from "./chart-style/map/map-format-option.component";
import {PivotContextComponent} from "./page-pivot/pivot-context.component";
import {DragulaModule} from "../../lib/ng2-dragula";
import {ChartModule} from "../common/chart.module";
import {DashboardShareModule} from "../dashboard/dashboard-share.module";
import {DataPreviewModule} from "../common/data.preview.module";
import {AnalysisModule} from "./component/analysis/analysis.module";
import {DatasourceService} from "../datasource/service/datasource.service";
import {DashboardService} from "../dashboard/service/dashboard.service";
import {MetadataService} from "../meta-data-management/metadata/service/metadata.service";
import {WidgetService} from "../dashboard/service/widget.service";

const pageRoutes: Routes = [
  {
    path: '', component: PageViewComponent
  },
];

@NgModule({
  imports: [
    CommonModule,
    DragulaModule,
    ChartModule,
    DashboardShareModule,
    DataPreviewModule,
    AnalysisModule,
    RouterModule.forChild(pageRoutes)
  ],
  declarations: [
    PageViewComponent,
    PagePivotComponent,
    FormatItemComponent,
    PageFilterPanel,
    PageDataContextComponent,
    PopupValueAliasComponent,
    CommonOptionComponent,
    LegendOptionComponent,
    XAxisOptionComponent,
    YAxisOptionComponent,
    SecondaryAxisOptionComponent,
    AxisValueOptionComponent,
    AxisCategoryOptionComponent,
    DataLabelOptionComponent,
    TooltipOptionComponent,
    SecondaryIndicatorComponent,
    FormatOptionComponent,
    ColorOptionComponent,
    SplitOptionComponent,
    CalculatedRowOptionComponent,
    CalculatedOptionSliderComponent,
    MapPagePivotComponent,
    MapCommonOptionComponent,
    MapLayerOptionComponent,
    MapLegendOptionComponent,
    MapTooltipOptionComponent,
    MapFormatOptionComponent,
    PivotContextComponent
  ],
  exports: [],
  providers: [
    DatasourceService,
    DashboardService,
    MetadataService,
    WidgetService,
    ImageService,
    TimezoneService,
    AnalysisPredictionService
  ]
})
export class PageModule {
}
