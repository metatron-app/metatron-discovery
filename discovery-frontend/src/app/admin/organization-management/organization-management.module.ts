import {NgModule} from "@angular/core";
import {CommonModule} from "@common/common.module";
import {RouterModule} from "@angular/router";
import {OrganizationManagementComponent} from "./component/organization-management.component";
import {OrganizationManagementListComponent} from "./component/list/organization-management-list.component";
import {OrganizationService} from "./service/organization.service";
import {CreateOrganizationManagementListComponent} from "./component/list/create-list/create-organization-management-list.component";
import {DetailOrganizationManagementListComponent} from "./component/list/detail-list/detail-organization-management-list.component";
import {UpdateContainerOrganizationManagementComponent} from "./component/list/update-list/update-container-organization-management.component";
import {UpdateOrganizationManagementListComponent} from "./component/list/update-list/update-organization-management-list.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: '', component: OrganizationManagementComponent},
      {path: ':tabId', component: OrganizationManagementComponent},
      {path: 'list/:orgCode', component: DetailOrganizationManagementListComponent}
    ])
  ],
  declarations: [
    OrganizationManagementComponent,
    OrganizationManagementListComponent,
    CreateOrganizationManagementListComponent,
    DetailOrganizationManagementListComponent,
    UpdateContainerOrganizationManagementComponent,
    UpdateOrganizationManagementListComponent
  ],
  providers: [
    OrganizationService
  ]
})
export class OrganizationManagementModule{
}
