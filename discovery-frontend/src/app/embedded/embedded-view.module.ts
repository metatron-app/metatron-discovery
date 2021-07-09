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

import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@common/common.module';
import {DashboardModule} from '../dashboard/dashboard.module';
import {CookieService} from 'ng2-cookies';
import {EmbeddedDashboardComponent} from './dashboard/embedded-dashboard.component';
import {PresentationDashboardComponent} from './dashboard/presentation-dashboard.component';
import {WorkbookService} from '../workbook/service/workbook.service';
import {EmbeddedPageComponent} from './page/embedded-page.component';
import {ChartModule} from '@common/chart.module';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {EmbeddedMetadataDetailComponent} from '../meta-data-management/metadata/component/embedded-metadata-detail.component';
import {TimezoneService} from '../data-storage/service/timezone.service';

const embeddedViewRoutes: Routes = [
  {path: 'dashboard/presentation/:workbookId', component: PresentationDashboardComponent},
  {path: 'dashboard/presentation/:workbookId/:dashboardId', component: PresentationDashboardComponent},
  {path: 'dashboard/frag', component: EmbeddedDashboardComponent},
  {path: 'dashboard/frag/:loginToken/:loginType/:refreshToken', component: EmbeddedDashboardComponent},
  {path: 'dashboard/:dashboardId', component: EmbeddedDashboardComponent},
  {path: 'dashboard/:dashboardId/:loginToken/:loginType/:refreshToken', component: EmbeddedDashboardComponent},
  {path: 'page/:pageId', component: EmbeddedPageComponent},
  {path: 'page/:pageId/:loginToken/:loginType/:refreshToken', component: EmbeddedPageComponent},
  {path: 'presentation/:workbookId', component: PresentationDashboardComponent},
  {path: 'presentation/:workbookId/:dashboardId', component: PresentationDashboardComponent},
  {path: ':dashboardId', component: EmbeddedDashboardComponent},
  {path: ':dashboardId/:loginToken/:loginType/:refreshToken', component: EmbeddedDashboardComponent},
  {path: 'metadata/:id', component: EmbeddedMetadataDetailComponent},
  {path: 'workbook/:workbookId', component: EmbeddedDashboardComponent}
];

@NgModule({
  imports: [
    ChartModule,
    CommonModule,
    DashboardModule,
    RouterModule.forChild(embeddedViewRoutes)
  ],
  declarations: [
    EmbeddedPageComponent,
    EmbeddedDashboardComponent,
    EmbeddedMetadataDetailComponent,
    PresentationDashboardComponent
  ],
  providers: [
    CookieService,
    TimezoneService,
    WorkbookService
  ]
})
export class EmbeddedViewModule {
  constructor(private broadCaster: EventBroadcaster) {
    this.broadCaster.broadcast('ENTER_LAYOUT_MODULE');
  }
}
