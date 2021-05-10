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
import {CommonModule} from '@common/common.module';
import {RouterModule, Routes} from '@angular/router';
import {WorkbenchEditorModule} from '../workbench/workbench.editor.module';
import {AuditService} from './audit/service/audit.service';
import {JobLogModule} from './audit/job-log/job-log.module';
import {JobLogComponent} from './audit/job-log/job-log.component';
import {LogStatisticsComponent} from './audit/log-statistics/log-statistics.component';
import {LogStatisticsDetailComponent} from './audit/log-statistics/log-statistics.detail.component';
import {JobDetailComponent} from './audit/job-log/component/job-detail/job-detail.component';

const monitoringRoutes: Routes = [
  {path: '', component: JobLogComponent},
  {path: 'statistics', component: LogStatisticsComponent},
  {path: 'audit', component: JobLogComponent},
  {path: 'audit/:id', component: JobDetailComponent}
];

@NgModule({
  imports: [
    CommonModule,
    JobLogModule,
    RouterModule.forChild(monitoringRoutes),
    WorkbenchEditorModule
  ],
  declarations: [
    LogStatisticsComponent,
    JobLogComponent,
    LogStatisticsDetailComponent
  ],
  providers: [
    AuditService
  ]
})
export class MonitoringModule {
}
