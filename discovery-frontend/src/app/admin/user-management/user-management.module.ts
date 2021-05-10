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

/**
 * Created by juheeko on 17/10/2017.
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserManagementMembersComponent } from './component/members/user-management-members.component';
import { UserManagementGroupsComponent } from './component/group/user-management-groups.component';
import { CommonModule } from '@common/common.module';
import { MembersService } from './service/members.service';
import { UserManagementApprovalComponent } from './component/approval/user-management-approval.component';
import { UserManagementComponent } from './user-management.component';
import { CreateUserManagementGroupsComponent } from './component/group/create-group/create-user-management-groups.component';
import { UpdateUserManagementGroupsComponent } from './component/group/update-group/update-user-management-groups.component';
import { GroupsService } from './service/groups.service';
import { CreateUserManagementMembersComponent } from './component/members/create-member/create-user-management-members.component';
import { DetailUserManagementMembersComponent } from './component/members/detail-member/detail-user-management-members.component';
import { DetailUserManagementGroupsComponent } from './component/group/detail-group/detail-user-management-groups.component';
import { UpdateUserManagementMembersComponent } from './component/members/update-member/update-user-management-members.component';
import { UserManagementPermissionComponent } from './component/permission/user-management-permission.component';
import { DetailUserManagementPermissionComponent } from './component/permission/detail-user-management-permission.component';
import { SetMemberGroupComponent } from './component/permission/set-member-group.component';
import { SetMemberGroupContainerComponent } from './component/permission/set-member-group-container.component';
import { ChangeWorksspaceOwnerModalModule } from './component/members/change-workspace-owner-modal/change-worksspace-owner-modal.module';
import { UserManagementAccessComponent } from './component/access/user-management-access.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: UserManagementComponent },
      { path: ':tabId', component: UserManagementComponent },
      { path: 'members/:userId', component: DetailUserManagementMembersComponent},
      { path: 'groups/:groupId', component: DetailUserManagementGroupsComponent},
      { path: 'permission/:roleId', component: DetailUserManagementPermissionComponent},
    ]),
    ChangeWorksspaceOwnerModalModule
  ],
  declarations: [
    UserManagementComponent,
    UserManagementApprovalComponent,
    UserManagementMembersComponent,
    UserManagementGroupsComponent,
    UserManagementPermissionComponent,
    CreateUserManagementGroupsComponent,
    UpdateUserManagementGroupsComponent,
    CreateUserManagementMembersComponent,
    UpdateUserManagementMembersComponent,
    DetailUserManagementMembersComponent,
    DetailUserManagementGroupsComponent,
    UpdateUserManagementGroupsComponent,
    DetailUserManagementPermissionComponent,
    SetMemberGroupComponent,
    SetMemberGroupContainerComponent,
    UserManagementAccessComponent
  ],
  providers: [
    MembersService,
    GroupsService
  ]
})
export class UserManagementModule {
}
