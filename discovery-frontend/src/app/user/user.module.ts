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
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '../common/common.module';
import { UserService } from './service/user.service';
import { CookieService } from 'ng2-cookies';
import { JoinComponent } from './login/component/join/join.component';
import { JoinCompleteComponent } from './login/component/join-complete/join-complete.component';
import { ResetPasswordComponent } from './login/component/reset-password/reset-password.component';
import { FileModule } from '../common/file.module';
import { StompService } from '@stomp/ng2-stompjs';
import { WorkspaceService } from '../workspace/service/workspace.service';
import { KorPolicyComponent } from './login/kor-policy.component';
import { EngPolicyComponent } from './login/eng-policy.component';
import { PermissionService } from './service/permission.service';
import {LoginLogoComponent} from "./login/component/logo/login-logo.component";

const userRoutes: Routes = [
  {
    path: '', component: LoginComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FileModule,
    RouterModule.forChild(userRoutes),
  ],
  declarations: [
    LoginComponent,
    JoinComponent,
    JoinCompleteComponent,
    ResetPasswordComponent,
    KorPolicyComponent,
    EngPolicyComponent,
    LoginLogoComponent
  ],
  providers: [
    UserService,
    PermissionService,
    CookieService,
    WorkspaceService,
    StompService
  ],
})
export class UserModule {
}
