import {NgModule} from '@angular/core';
import {CommonModule} from '../../../../../common/common.module';
import {ChangeWorkspaceOwnerModalComponent} from './change-workspace-owner-modal.component';
import {WorkspaceDetailComponent} from './workspace-detail.component';
import {WorkspaceMembersSelectBoxComponent} from './workspace-members-select-box.component';
import {FilterPipe} from '../../../../../common/pipe/filter.pipe';
import {EventsService} from './service/events.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ChangeWorkspaceOwnerModalComponent,
    WorkspaceDetailComponent,
    WorkspaceMembersSelectBoxComponent,
    FilterPipe,
  ],
  exports: [
    ChangeWorkspaceOwnerModalComponent,
  ],
  providers: [
    EventsService,
  ],
})
export class ChangeWorksspaceOwnerModalModule {
}
