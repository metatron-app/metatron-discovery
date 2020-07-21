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
import { CommonModule } from '../common/common.module';
import { PageShareModule } from './page-share.module';
import { AnalysisPredictionService } from './component/analysis/service/analysis.prediction.service';
import {TimezoneService} from "../data-storage/service/timezone.service";
import {PageViewComponent} from "./page-view.component";
import {DragulaModule} from "../../lib/ng2-dragula";
import {ChartModule} from "../common/chart.module";
import {DashboardShareModule} from "../dashboard/dashboard-share.module";
import {DataPreviewModule} from "../common/data.preview.module";
import {AnalysisModule} from "./component/analysis/analysis.module";
import {DataconnectionService} from "../dataconnection/service/dataconnection.service";
import {StorageService} from "../data-storage/service/storage.service";

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
    PageShareModule,
    RouterModule.forChild(pageRoutes)
  ],
  declarations: [
    PageViewComponent
  ],
  exports: [],
  providers: [
    StorageService,
    TimezoneService,
    DataconnectionService,
    AnalysisPredictionService
  ]
})
export class PageModule {
}
