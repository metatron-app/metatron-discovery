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
import { ChartTestService } from './service/chart-test.service';
import { CookieService } from 'ng2-cookies';
import { ChartModule } from '../common/chart.module';
//import {ChartTestComponent} from "./chart-test.component";

const chartTestRoutes: Routes = [
  //{ path: 'test', component: ChartTestComponent }
];

@NgModule({
  imports: [
    CommonModule,
    ChartModule,
    RouterModule.forChild(chartTestRoutes),
  ],
  declarations: [
    //ChartTestComponent
  ],
  providers: [CookieService, ChartTestService]
})
export class ChartTestModule {
}
