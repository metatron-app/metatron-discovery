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
import { WorkspaceComponent } from './workspace.component';
import { CommonModule } from '@common/common.module';
import { RouterModule, Routes } from '@angular/router';
import { CreateWorkbookComponent } from '../workbook/component/create-workbook/create-workbook.component';
import { WorkspaceService } from './service/workspace.service';
import { WorkbookService } from '../workbook/service/workbook.service';
import { DatasourceComponent } from './component/etc/data-source.component';
import { SharedMemberComponent } from './component/permission/shared-member.component';
import { UpdateWorkspaceComponent } from './component/management/update-workspace.component';
import { DeleteWorkspaceComponent } from './component/management/delete-workspace.component';
import { DatasourceService } from '../datasource/service/datasource.service';
import { DatasourceShareModule } from '../datasource/datasource-share.module';
import { WorkspaceShareModule } from './workspace-share.module';
import { CreateNotebookComponent } from '../notebook/component/create-notebook/create-notebook.component';
import { PopupService } from '@common/service/popup.service';
import { WorkbenchShareModule } from '../workbench/workbench-share.module';
import { NotebookShareModule } from '../notebook/notebook-share.module';
import { SetNotebookServerComponent } from './component/etc/set-notebook-server.component';
import { NotebookServerService } from '../model-management/notebook-server/service/notebook-server.service';
import { GroupsService } from '../admin/user-management/service/groups.service';
import { SharedMemberManageComponent } from './component/permission/shared-member-manage.component';
import { PermissionService } from '../user/service/permission.service';
import { ChangeOwnerWorkspaceComponent } from './component/management/change-owner-workspace.component';
import { WorkspacePermissionSchemaSetComponent } from './component/permission/workspace-permission-schema-set.component';

const workspaceRoutes: Routes = [
  { path: '', component: WorkspaceComponent },
  { path: ':id', component: WorkspaceComponent },
  { path: ':id/:folderId', component: WorkspaceComponent }
];

@NgModule({
  imports: [
    CommonModule,
    DatasourceShareModule,
    WorkspaceShareModule,
    NotebookShareModule,
    WorkbenchShareModule,
    RouterModule.forChild(workspaceRoutes),
  ],
  declarations: [
    WorkspaceComponent,
    CreateWorkbookComponent,
    SharedMemberComponent,
    SharedMemberManageComponent,
    DatasourceComponent,
    UpdateWorkspaceComponent,
    DeleteWorkspaceComponent,
    CreateNotebookComponent,
    SetNotebookServerComponent,
    ChangeOwnerWorkspaceComponent,
    WorkspacePermissionSchemaSetComponent
  ],
  providers: [
    WorkspaceService,
    WorkbookService,
    PopupService,
    DatasourceService,
    NotebookServerService,
    PermissionService,
    GroupsService
  ]
})
export class WorkspaceModule { }
