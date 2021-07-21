import {NgModule} from "@angular/core";
import {CommonModule} from "@common/common.module";
import {RouterModule} from "@angular/router";
import {OrganizationManagementComponent} from "./component/organization-management.component";
import {OrganizationManagementListComponent} from "./component/list/organization-management-list.component";
import {OrganizationService} from "./service/organization.service";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: '', component: OrganizationManagementComponent},
      {path: ':tabId', component: OrganizationManagementComponent}
    ])
  ],
  declarations: [
    OrganizationManagementComponent,
    OrganizationManagementListComponent
  ],
  providers: [
    OrganizationService
  ]
})
export class OrganizationManagementModule{
}
