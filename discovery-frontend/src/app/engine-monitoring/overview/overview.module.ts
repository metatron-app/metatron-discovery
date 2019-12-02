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
import {OverviewComponent} from './overview.component';
import {StatusComponent} from './component/status.component';
import {OkIconComponent} from './component/ok-icon.component';
import {ErrorIconComponent} from './component/error-icon.component';
import {SearchComponent} from './component/search.component';
import {RadioComponent} from './component/radio.component';
import {TableFilterPipe} from './pipe/table-filter.pipe';
import {TableSortPipe} from './pipe/table-sort.pipe';
import {EngineService} from '../service/engine.service';
import {CommonModule} from '../../common/common.module';
import {GraphComponent} from "./component/graph.component";
import {DatasourceService} from "../../datasource/service/datasource.service";
import {TimezoneService} from "../../data-storage/service/timezone.service";
import {NodeInformationComponent} from "./component/node-information.component";
import {NodeTooltipComponent} from "./component/node-tooltip.component";
import {KpiPopupComponent} from "./component/kpi-popup.component";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    OverviewComponent,
    StatusComponent,
    GraphComponent,
    OkIconComponent,
    ErrorIconComponent,
    SearchComponent,
    RadioComponent,
    TableFilterPipe,
    TableSortPipe,
    NodeInformationComponent,
    NodeTooltipComponent,
    KpiPopupComponent,
    KpiPopupComponent
  ],
  providers: [
    EngineService,
    TimezoneService,
    DatasourceService
  ],
  exports: [
    OverviewComponent
  ]
})
export class OverviewModule {
}
