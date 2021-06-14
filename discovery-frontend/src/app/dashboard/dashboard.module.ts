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

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '@common/common.module';
import {DatasourceShareModule} from '../datasource/datasource-share.module';
import {DatasourceService} from '../datasource/service/datasource.service';
import {DashboardComponent} from './dashboard.component';
import {DashboardService} from './service/dashboard.service';
import {UpdateDashboardComponent} from './update-dashboard.component';
import {SelectionFilterComponent} from './component/selection-filter/selection-filter.component';
import {ChartModule} from '@common/chart.module';
import {TextWidgetComponent} from './widgets/text-widget/text-widget.component';
import {TextWidgetUpdateComponent} from './widgets/text-widget/text-widget.update.component';
import {FilterWidgetComponent} from './widgets/filter-widget/filter-widget.component';
import {ErrorWidgetComponent} from './widgets/error-widget.component';
import {DashboardLayoutConfigComponent} from './component/update-dashboard/dashboard.layout.config.component';
import {PageShareModule} from '../page/page-share.module';
import {WidgetService} from './service/widget.service';
import {DashboardShareModule} from './dashboard-share.module';
import {DashboardWidgetComponent} from './component/dashboard-layout/dashboard.widget.component';
import {DashboardWidgetHeaderComponent} from './component/dashboard-layout/dashboard.widget.header.component';
import {DragulaModule} from '../../lib/ng2-dragula';
import {TextWidgetEditorModule} from './widgets/text-widget/editor/text-widget-editor.module';
import {ImageService} from '@common/service/image.service';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {AnalysisPredictionService} from '../page/component/analysis/service/analysis.prediction.service';
import {PageRelationComponent} from './component/update-dashboard/page-relation.component';
import {TextWidgetPanelComponent} from './component/update-dashboard/text-widget-panel.component';
import {DatasourcePanelComponent} from './component/update-dashboard/datasource-panel.component';
import {DataPreviewModule} from '@common/data.preview.module';
import {PageWidgetComponent} from './widgets/page-widget/page-widget.component';
import {ConfigureFiltersInclusionComponent} from './filters/inclusion-filter/configure-filters-inclusion.component';
import {ConfigureFiltersBoundComponent} from './filters/bound-filter/configure-filters-bound.component';
import {ConfigureFiltersTimeComponent} from './filters/time-filter/configure-filters-time.component';
import {MetadataService} from '../meta-data-management/metadata/service/metadata.service';
import {CreateBoardComponent} from './component/create-dashboard/create-board.component';
import {CreateBoardPopDsSelectComponent} from './component/create-dashboard/create-board-pop-ds-select.component';
import {CreateBoardDsNetworkComponent} from './component/create-dashboard/create-board-ds-network.component';
import {CreateBoardDsInfoComponent} from './component/create-dashboard/create-board-ds-info.component';
import {CreateBoardDsRelationComponent} from './component/create-dashboard/create-board-ds-relation.component';
import {CreateBoardPopJoinComponent} from './component/create-dashboard/create-board-pop-join.component';
import {CreateBoardPopRelationComponent} from './component/create-dashboard/create-board-pop-relation.component';
import {CreateBoardCompleteComponent} from './component/create-dashboard/create-board-complete.component';
import {UpdateDatasourceComponent} from './component/update-dashboard/update-datasource.component';
import {TimezoneService} from '../data-storage/service/timezone.service';

const dashboardRoutes: Routes = [
  {
    path: 'dashboard', component: DashboardComponent
  },
];

@NgModule({
  imports: [
    CommonModule,
    ChartModule,
    PageShareModule,
    DatasourceShareModule,
    DragulaModule,
    DashboardShareModule,
    TextWidgetEditorModule,
    InfiniteScrollModule,
    DataPreviewModule,
    RouterModule.forChild(dashboardRoutes)
  ],
  declarations: [
    DashboardComponent,
    CreateBoardComponent,
    CreateBoardCompleteComponent,
    CreateBoardDsNetworkComponent,
    CreateBoardDsInfoComponent,
    CreateBoardDsRelationComponent,
    CreateBoardPopJoinComponent,
    CreateBoardPopRelationComponent,
    CreateBoardPopDsSelectComponent,
    UpdateDatasourceComponent,
    UpdateDashboardComponent,
    SelectionFilterComponent,
    PageWidgetComponent,
    TextWidgetComponent,
    TextWidgetUpdateComponent,
    FilterWidgetComponent,
    ErrorWidgetComponent,
    TextWidgetPanelComponent,
    DatasourcePanelComponent,
    DashboardLayoutConfigComponent,
    DashboardWidgetComponent,
    DashboardWidgetHeaderComponent,
    PageRelationComponent
  ],
  providers: [
    DashboardService,
    MetadataService,
    DatasourceService,
    WidgetService,
    ImageService,
    TimezoneService,
    AnalysisPredictionService
  ],
  exports: [
    DashboardComponent,
    UpdateDashboardComponent,
    CreateBoardComponent,
    SelectionFilterComponent,
    CreateBoardPopDsSelectComponent
  ],
  bootstrap: [
    DashboardWidgetComponent,
    DashboardWidgetHeaderComponent,
    ConfigureFiltersTimeComponent,
    ConfigureFiltersInclusionComponent,
    ConfigureFiltersBoundComponent
  ]
})
export class DashboardModule {
}
