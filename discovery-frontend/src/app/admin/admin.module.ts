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
import { CommonModule } from '@common/common.module';
import { RouterModule, Routes } from '@angular/router';
import { UserAdminGuard } from '@common/gaurd/userAdmin.guard';
import { WorkspaceAdminGuard } from '@common/gaurd/workspaceAdmin.guard';

const adminRoutes: Routes = [
  { path: '', redirectTo: 'user' },
  {
    path: 'user',
    loadChildren: 'app/admin/user-management/user-management.module#UserManagementModule',
    canActivate: [UserAdminGuard]
  },
  {
    path: 'organization',
    loadChildren: 'app/admin/organization-management/organization-management.module#OrganizationManagementModule',
    canActivate: [UserAdminGuard]
  },
  {
    path: 'workspaces',
    loadChildren: 'app/admin/workspace-management/workspace-management.module#WorkspaceManagementModule',
    canActivate: [WorkspaceAdminGuard]
  }
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(adminRoutes)
  ],
  providers: [UserAdminGuard, WorkspaceAdminGuard]
})
export class AdminModule {
}
