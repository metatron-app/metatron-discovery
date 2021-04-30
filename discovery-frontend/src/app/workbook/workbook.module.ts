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
import {DragulaModule} from '../../lib/ng2-dragula';
import {WorkbookComponent} from './workbook.component';
import {DashboardModule} from '../dashboard/dashboard.module';
import {WorkbookService} from './service/workbook.service';
import {CommonModule} from '@common/common.module';
import {DashboardService} from '../dashboard/service/dashboard.service';
import {DataPreviewModule} from '@common/data.preview.module';
import {DataconnectionService} from '@common/service/dataconnection.service';
import {PopupInputNameDescComponent} from './component/popup-input-workbook/popup-input-namedesc.component';
import {DashboardShareModule} from '../dashboard/dashboard-share.module';
import {CanDeactivateGuard} from '@common/gaurd/can.deactivate.guard';
import {MetadataService} from '../meta-data-management/metadata/service/metadata.service';

const workbookRoutes: Routes = [
  {path: ':workbookId', component: WorkbookComponent, canDeactivate: [CanDeactivateGuard]},
  {path: ':workbookId/:dashboardId', component: WorkbookComponent, canDeactivate: [CanDeactivateGuard]},
  {path: ':workbookId/old', component: WorkbookComponent, canDeactivate: [CanDeactivateGuard]},
  {path: ':workbookId/:mode', component: WorkbookComponent, canDeactivate: [CanDeactivateGuard]}
];

@NgModule({
  imports: [
    CommonModule,
    DragulaModule,
    DashboardModule,
    DashboardShareModule,
    DataPreviewModule,
    RouterModule.forChild(workbookRoutes),
  ],
  declarations: [
    WorkbookComponent,
    PopupInputNameDescComponent
  ],
  providers: [WorkbookService, MetadataService, DashboardService, DataconnectionService]
})
export class WorkbookModule {
}
