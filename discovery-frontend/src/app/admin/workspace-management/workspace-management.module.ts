
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

import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@common/common.module';
import { WorkspaceAdminGuard } from '@common/gaurd/workspaceAdmin.guard';
import {
  WorkspacesManagementComponent
} from './component/workspaces-management.component';
import { DetailWorkspaceComponent } from './component/workspaces/detail-workspace/detail-workspace.component';
import { DetailWorkspaceStatisticsComponent } from './component/workspaces/detail-workspace/component/statistics/detail-workspace-statistics.component';
import { DetailWorkspaceInformationComponent } from './component/workspaces/detail-workspace/component/information/detail-workspace-information.component';
import {
  DetailWorkspaceLinkedResourcesComponent,
} from './component/workspaces/detail-workspace/component/linked-resources/detail-workspace-linked-resources.component';
import { SharedWorkspacesComponent } from './component/workspaces/shared-workspaces.component';
import { PermissionSchemasComponent } from './component/workspace-permission-schemas/permission-schemas.component';
import { DetailPermissionSchemaComponent } from './component/workspace-permission-schemas/detail-permission-schema.component';
import { CreatePermissionSchemaComponent } from './component/workspace-permission-schemas/create-permission-schema.component';
import { ResourcesViewComponent } from './component/workspaces/detail-workspace/component/viewer/resources-view.component';
import { MemberGroupViewComponent } from './component/workspaces/detail-workspace/component/viewer/member-group-view.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: WorkspacesManagementComponent, canActivate: [WorkspaceAdminGuard] },
      { path: ':tabId', component: WorkspacesManagementComponent, canActivate: [WorkspaceAdminGuard] },
      { path: 'shared/:workspaceId', component: DetailWorkspaceComponent, canActivate: [WorkspaceAdminGuard] },
      { path: 'permission/:schemaId', component: DetailPermissionSchemaComponent, canActivate: [WorkspaceAdminGuard] },
    ])
  ],
  declarations: [
    WorkspacesManagementComponent,
    // shared workspaces
    SharedWorkspacesComponent,
    DetailWorkspaceComponent,
    DetailWorkspaceStatisticsComponent,
    DetailWorkspaceInformationComponent,
    DetailWorkspaceLinkedResourcesComponent,
    ResourcesViewComponent,
    MemberGroupViewComponent,
    // permission workspaces
    PermissionSchemasComponent,
    DetailPermissionSchemaComponent,
    CreatePermissionSchemaComponent
  ],
  providers: [ WorkspaceAdminGuard ]
})
export class WorkspaceManagementModule {
}
