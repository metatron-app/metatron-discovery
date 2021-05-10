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
import {CreateWorkbenchSelectComponent} from './component/create-workbench/create-workbench-select/create-workbench-select.component';
import {CreateWorkbenchCompleteComponent} from './component/create-workbench/create-workbench-complete/create-workbench-complete.component';
import {CreateWorkbenchComponent} from './component/create-workbench/create-workbench.component';
import {WorkbenchService} from './service/workbench.service';
import {DataconnectionService} from '@common/service/dataconnection.service';
import {CommonModule} from '@common/common.module';
import {DetailWorkbenchDataconnectionInfoComponent} from './component/detail-workbench/detail-workbench-dataconnection-info/detail-workbench-dataconnection-info';
import {DetailWorkbenchDatabaseComponent} from './component/detail-workbench/detail-workbench-database/detail-workbench-database';
import {DetailWorkbenchTableComponent} from './component/detail-workbench/detail-workbench-table/detail-workbench-table';
import {DetailWorkbenchNavigationComponent} from './component/detail-workbench/detail-workbench-navigation/detail-workbench-navigation';
import {DetailWorkbenchHistoryComponent} from './component/detail-workbench/detail-workbench-history/detail-workbench-history';
import {DetailWorkbenchVariableComponent} from './component/detail-workbench/detail-workbench-variable/detail-workbench-variable';
import {DetailWorkbenchTableInfoDescComponent} from './component/detail-workbench/detail-workbench-table-info-desc/detail-workbench-table-info-desc';
import {DetailWorkbenchTableInfoSchemaComponent} from './component/detail-workbench/detail-workbench-table-info-schema/detail-workbench-table-info-schema';
import {WorkbenchLoginComponent} from './component/detail-workbench/workbench-login/workbench-login.component';
import {DetailWorkbenchTabComponent} from './component/detail-workbench/detail-workbench-tab/detail-workbench-tab.component';
import {DetailWorkbenchSchemaBrowserComponent} from './component/detail-workbench/detail-workbench-schema-browser/detail-workbench-schema-browser.component';

@NgModule({
  // 모듈
  imports: [
    CommonModule,
  ],
  // 컴포넌트
  declarations: [
    CreateWorkbenchSelectComponent,
    CreateWorkbenchCompleteComponent,
    CreateWorkbenchComponent,
    DetailWorkbenchDataconnectionInfoComponent,
    DetailWorkbenchDatabaseComponent,
    DetailWorkbenchTableComponent,
    DetailWorkbenchNavigationComponent,
    DetailWorkbenchHistoryComponent,
    DetailWorkbenchVariableComponent,
    DetailWorkbenchTableInfoSchemaComponent,
    DetailWorkbenchTableInfoDescComponent,
    WorkbenchLoginComponent,
    DetailWorkbenchTabComponent,
    DetailWorkbenchSchemaBrowserComponent
  ],
  // 서비스
  providers: [
    WorkbenchService,
    DataconnectionService
  ],
  // 외부에서 참조
  exports: [
    CreateWorkbenchSelectComponent,
    CreateWorkbenchCompleteComponent,
    CreateWorkbenchComponent,
    DetailWorkbenchDataconnectionInfoComponent,
    DetailWorkbenchDatabaseComponent,
    DetailWorkbenchTableComponent,
    DetailWorkbenchNavigationComponent,
    DetailWorkbenchHistoryComponent,
    DetailWorkbenchVariableComponent,
    DetailWorkbenchTableInfoSchemaComponent,
    DetailWorkbenchTableInfoDescComponent,
    WorkbenchLoginComponent,
    DetailWorkbenchTabComponent,
    DetailWorkbenchSchemaBrowserComponent
  ]
})
export class WorkbenchShareModule {
}
