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

import {NotebookService} from './service/notebook.service';
import {DatasourceShareModule} from '../datasource/datasource-share.module';
import {DashboardService} from '../dashboard/service/dashboard.service';
import {NotebookComponent} from './notebook.component';
import {NotebookShareModule} from './notebook-share.module';
import {CreateNotebookModelComponent} from './component/create-notebook-model/create-notebook-model.component';
import {CreateNotebookApiComponent} from './component/create-notebook-api/create-notebook-api.component';
import {ResultNotebookApiComponent} from './component/result-notebook-api/result-notebook-api.component';
import {MetadataService} from '../meta-data-management/metadata/service/metadata.service';

const notebookRoutes: Routes = [
  {path: ':id' + '/' + ':workspaceId', component: NotebookComponent},
];

@NgModule({
  imports: [
    CommonModule,
    DatasourceShareModule,
    NotebookShareModule,
    RouterModule.forChild(notebookRoutes),
  ],
  declarations: [
    NotebookComponent,
    CreateNotebookModelComponent,
    CreateNotebookApiComponent,
    ResultNotebookApiComponent
  ],
  providers: [NotebookService, DashboardService, MetadataService],
  exports: [
    NotebookComponent,
    CreateNotebookModelComponent,
    CreateNotebookApiComponent,
    ResultNotebookApiComponent
  ]
})
export class NotebookModule {
}
