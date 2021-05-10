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

import {ChartSummaryComponent} from './component/chart-summary/chart-summary.component';
import {CreateNotebookDashboardComponent} from './component/create-notebook/create-notebook-dashboard/create-notebook-dashboard.component';
import {CreateNotebookDatasourceComponent} from './component/create-notebook/create-notebook-datasource/create-notebook-datasource.component';
import {CreateNotebookNameComponent} from './component/create-notebook/create-notebook-name/create-notebook-name.component';
import {CreateNotebookChartComponent} from './component/create-notebook/create-notebook-chart/create-notebook-chart.component';
import {CreateNotebookSelectComponent} from './component/create-notebook/create-notebook-select/create-notebook-select.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@common/common.module';
import {DatasourceShareModule} from '../datasource/datasource-share.module';
import {NotebookService} from './service/notebook.service';
import {DashboardService} from '../dashboard/service/dashboard.service';
import {MetadataService} from '../meta-data-management/metadata/service/metadata.service';

@NgModule({
  imports: [
    CommonModule,
    DatasourceShareModule
  ],
  declarations: [
    CreateNotebookSelectComponent,
    CreateNotebookChartComponent,
    CreateNotebookNameComponent,
    CreateNotebookDatasourceComponent,
    CreateNotebookDashboardComponent,
    ChartSummaryComponent
  ],
  providers: [
    NotebookService,
    DashboardService,
    MetadataService
  ],
  exports: [
    CreateNotebookSelectComponent,
    CreateNotebookChartComponent,
    CreateNotebookNameComponent,
    CreateNotebookDatasourceComponent,
    CreateNotebookDashboardComponent,
    ChartSummaryComponent
  ]
})
export class NotebookShareModule {
}
