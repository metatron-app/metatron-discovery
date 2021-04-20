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
import {NotebookServerComponent} from './notebook-server/notebook-server.component';
import {ModelManagementComponent} from './model-management.component';
import {AddNotebookServerComponent} from './notebook-server/add-notebook-server/add-notebook-server.component';
import {NotebookServerService} from './notebook-server/service/notebook-server.service';

const modelManagementRoutes: Routes = [
  {path: '', redirectTo: 'notebook', pathMatch: 'full'},
  // { path: 'model', component: ModelManagementComponent, redirectTo: 'model/approval' },
  // {path: 'approval', component: ModelApprovalComponent},
  {path: 'notebook', component: NotebookServerComponent},
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(modelManagementRoutes),
  ],
  declarations: [
    ModelManagementComponent,
    // ModelApprovalComponent,
    NotebookServerComponent,
    AddNotebookServerComponent,
    // ModelApprovalDetailComponent,
    // ModelApprovalResultComponent
  ],
  providers: [
    NotebookServerService,
    // ModelApprovalService
  ]
})
export class ModelManagementModule {
}
