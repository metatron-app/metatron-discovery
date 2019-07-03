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
import {LayoutComponent} from './layout/layout.component';
import {RouterModule, Routes} from '@angular/router';
import {GnbComponent} from './component/gnb/gnb.component';
import {LNBComponent} from './component/lnb/lnb.component';
import {CommonModule} from '../../common/common.module';
import {CookieService} from 'ng2-cookies';
import {UserService} from '../../user/service/user.service';
import {WorkspaceService} from '../../workspace/service/workspace.service';
import {ClickOutsideModule} from 'ng-click-outside';
import {WorkspaceShareModule} from '../../workspace/workspace-share.module';
import {DatasourceManagementGuard} from '../../common/gaurd/datasource-management.guard';
import {ProfileComponent} from '../../user/profile/profile.component';
import {FileModule} from '../../common/file.module';
import {ChangePasswordComponent} from '../../user/profile/change-password/change-password.component';
import {MembersService} from '../../admin/user-management/service/members.service';
import {MetadataManagementGuard} from '../../common/gaurd/metadata-management.guard';
import {CommonService} from "../../common/service/common.service";
import {StagedbEnabledGuard} from '../../common/gaurd/stagedb-enabled.guard';
import {StorageService} from '../../data-storage/service/storage.service';
import {ConnectionListGuard} from "../../common/gaurd/connection-list.guard";

const layoutRoutes: Routes = [
  {
    path: '', component: LayoutComponent, canActivate: [StagedbEnabledGuard, ConnectionListGuard],
    children: [
      {path: '', redirectTo: 'workspace', pathMatch: 'full'},
      {path: 'workspace', loadChildren: 'app/workspace/workspace.module#WorkspaceModule'},
      {path: 'workbook', loadChildren: 'app/workbook/workbook.module#WorkbookModule'},
      {path: 'notebook', loadChildren: 'app/notebook/notebook.module#NotebookModule'},
      {path: 'page', loadChildren: 'app/page/page.module#PageModule'},
      {path: 'workbench', loadChildren: 'app/workbench/workbench.module#WorkbenchModule'},
      {path: 'exploredata', loadChildren: 'app/explore-data/explore-data.module#ExploreDataModule'},
      {
        path: 'management/storage',
        loadChildren: 'app/data-storage/data-storage.module#DataStorageModule',
        canActivate: [DatasourceManagementGuard]
      },
      {
        path: 'management/datapreparation',
        loadChildren: 'app/data-preparation/data-preparation.module#DataPreparationModule',
        canActivate: [DatasourceManagementGuard]
      },
      {
        path: 'management/model',
        loadChildren: 'app/model-management/model-management.module#ModelManagementModule',
        canActivate: [DatasourceManagementGuard]
      },
      {
        path: 'management/monitoring',
        loadChildren: 'app/monitoring/monitoring.module#MonitoringModule',
        canActivate: [DatasourceManagementGuard]
      },
      {
        path: 'management/metadata',
        loadChildren: 'app/meta-data-management/meta-data-management.module#MetaDataManagementModule',
        canActivate: [MetadataManagementGuard]
      },
      {path: 'admin', loadChildren: 'app/admin/admin.module#AdminModule'},
      {path: 'external', loadChildren: 'app/external/external-view.module#ExternalViewModule'},
      {
        path: 'samplecomponent',
        loadChildren: 'app/sample-component/sample-component.module#SampleComponentModule'
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    ClickOutsideModule,
    WorkspaceShareModule,
    //TODO common 으로 올릴것인지 확인
    FileModule,
    RouterModule.forChild(layoutRoutes)
  ],
  declarations: [
    LayoutComponent,
    LNBComponent,
    GnbComponent,
    ProfileComponent,
    ChangePasswordComponent
  ],
  providers: [
    CookieService,
    UserService,
    MembersService,
    WorkspaceService,
    CommonService,
    MetadataManagementGuard,
    DatasourceManagementGuard,
    StorageService,
    StagedbEnabledGuard,
    ConnectionListGuard
  ]
})
export class LayoutModule {
}
