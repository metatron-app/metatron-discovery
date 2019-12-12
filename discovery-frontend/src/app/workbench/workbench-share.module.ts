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
import {DataconnectionService} from '../dataconnection/service/dataconnection.service';
import {CommonModule} from '../common/common.module';
import {DetailWorkbenchDataconnectionInfo} from './component/detail-workbench/detail-workbench-dataconnection-info/detail-workbench-dataconnection-info';
import {DetailWorkbenchDatabase} from './component/detail-workbench/detail-workbench-database/detail-workbench-database';
import {DetailWorkbenchTable} from './component/detail-workbench/detail-workbench-table/detail-workbench-table';
import {DetailWorkbenchNavigation} from './component/detail-workbench/detail-workbench-navigation/detail-workbench-navigation';
import {DetailWorkbenchHistory} from './component/detail-workbench/detail-workbench-history/detail-workbench-history';
import {DetailWorkbenchVariable} from './component/detail-workbench/detail-workbench-variable/detail-workbench-variable';
import {DetailWorkbenchTableInfoDesc} from './component/detail-workbench/detail-workbench-table-info-desc/detail-workbench-table-info-desc';
import {DetailWorkbenchTableInfoSchema} from './component/detail-workbench/detail-workbench-table-info-schema/detail-workbench-table-info-schema';
import {WorkbenchLoginComponent} from './component/detail-workbench/workbench-login/workbench-login.component';
import {DetailWorkbenchTabComponent} from './component/detail-workbench/detail-workbench-tab/detail-workbench-tab.component';
import {DetailWorkbenchSchemaBrowserComponent} from './component/detail-workbench/detail-workbench-schema-browser/detail-workbench-schema-browser.component';
import {RenameTableComponent} from "./component/detail-workbench/detail-workbench-table/rename-table/rename-table.component";
import {CreationTableComponent} from "../plugins/hive-personal-database/component/creation-table/creation-table.component";


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
    DetailWorkbenchDataconnectionInfo,
    DetailWorkbenchDatabase,
    DetailWorkbenchTable,
    DetailWorkbenchNavigation,
    DetailWorkbenchHistory,
    DetailWorkbenchVariable,
    DetailWorkbenchTableInfoSchema,
    DetailWorkbenchTableInfoDesc,
    WorkbenchLoginComponent,
    DetailWorkbenchTabComponent,
    DetailWorkbenchSchemaBrowserComponent,
    RenameTableComponent,
    CreationTableComponent,
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
    DetailWorkbenchDataconnectionInfo,
    DetailWorkbenchDatabase,
    DetailWorkbenchTable,
    DetailWorkbenchNavigation,
    DetailWorkbenchHistory,
    DetailWorkbenchVariable,
    DetailWorkbenchTableInfoSchema,
    DetailWorkbenchTableInfoDesc,
    WorkbenchLoginComponent,
    DetailWorkbenchTabComponent,
    DetailWorkbenchSchemaBrowserComponent,
    CreationTableComponent
  ]
})
export class WorkbenchShareModule { }
