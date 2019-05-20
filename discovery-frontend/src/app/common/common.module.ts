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
import { CommonModule as AngularCommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TranslateModule } from '@ngx-translate/core';
import { SelectComponent } from './component/select/select.component';
import { PagingSelectComponent } from './component/paging-select/paging-select.component';
import { BaseFilter } from './pipe/base-filter';
import { MomentModule } from 'angular2-moment';
import { BaseSort } from './pipe/base-sort';
import { DropBoxComponent } from './component/drop-box/drop-box.component';
import { SortDropBoxComponent } from './component/sort-drop-box/sort-drop-box.component';
import { DeleteModalComponent } from './component/modal/delete/delete.component';
import { FileSizePipe } from './pipe/file-size.pipe';
import { NumberCommasPipe } from './pipe/number-commas.pipe';
import { MomentPipe } from './pipe/moment.pipe';
import { PeriodComponent } from './component/period/period.component';
import { InputMaskDirective } from './directive/input-mask.directive';
import { FocusDirective } from './directive/focus.directive';
import { InvokeDirective } from './directive/invoke.directive';
import { ClickOutsideModule } from 'ng-click-outside';
import { KeysPipe } from './pipe/keys.pipe';
import { EnumListPipe } from './pipe/enum-list.pipe';
import { MultiSelectComponent } from './component/multi-select/multi-select.component';
import { CreateModalComponent } from './component/modal/create/create.component';
import { LoadingComponent } from './component/loading/loading.component';
import { ConfirmModalComponent } from './component/modal/confirm/confirm.component';
import { GridComponent } from './component/grid/grid.component';

import { COMPOSITION_BUFFER_MODE } from '@angular/forms';
import { LogComponent } from './component/modal/log/log.component';
import { DateComponent } from './component/date/date.component';
import { MomentDatePipe } from './pipe/moment.date.pipe';
import { PagingSearchSelectComponent } from './component/paging-search-select/paging-search-select.component';
import { UserInformationComponent } from './component/user-information/user-information.component';
import { ConfirmSmallComponent } from './component/modal/confirm-small/confirm-small.component';
import { PermissionSchemaComponent } from 'app/workspace/component/permission/permission-schema.component';
import { PermissionSchemaSetComponent } from '../workspace/component/permission/permission-schema-set.component';
import { PermissionSchemaChangeComponent } from '../workspace/component/permission/permission-schema-change.component';
import { RoleSchemaComponent } from '../workspace/component/permission/role-schema.component';
import { ColorPickerComponent } from './component/color-picker/color.picker.component';
import { GradationGeneratorComponent } from './component/gradation/gradation-generator.component';
import { DashboardDatasourceComboComponent } from '../dashboard/component/dashboard-datasource-combo.component';
import { ColorTemplateComponent } from './component/color-picker/color-template.component';
import {InputComponent} from "./component/input/input.component";
import {SvgIconComponent} from "./component/icon/svg-icon.component";
import {CommonConstant} from "./constant/common.constant";
import {CookieConstant} from "./constant/cookie.constant";
import {PaginationComponent} from "./component/pagination/pagination.component";

import {StompConfig, StompService} from '@stomp/ng2-stompjs';
import * as SockJS from 'sockjs-client';


export function socketProvider() {
  return new SockJS(CommonConstant.API_CONSTANT.URL + '/stomp');
}

const stompConfig: StompConfig = {
  url: socketProvider,
  headers: {'X-AUTH-TOKEN': CommonConstant.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)},
  heartbeat_in: 1000,
  heartbeat_out: 0,
  reconnect_delay: 0,
  debug: false
};

@NgModule({
  imports: [
    AngularCommonModule,
    FormsModule,
    ClickOutsideModule,
    InfiniteScrollModule,
    TranslateModule
  ],
  declarations: [
    BaseFilter,
    BaseSort,
    FileSizePipe,
    KeysPipe,
    EnumListPipe,
    NumberCommasPipe,
    MomentPipe,
    MomentDatePipe,
    SelectComponent,
    MultiSelectComponent,
    PagingSelectComponent,
    PagingSearchSelectComponent,
    DropBoxComponent,
    SortDropBoxComponent,
    DeleteModalComponent,
    PeriodComponent,
    DateComponent,
    InputMaskDirective,
    FocusDirective,
    InvokeDirective,
    CreateModalComponent,
    ConfirmModalComponent,
    LoadingComponent,
    GridComponent,
    LogComponent,
    UserInformationComponent,
    ConfirmSmallComponent,
    RoleSchemaComponent,
    PermissionSchemaComponent,
    PermissionSchemaSetComponent,
    PermissionSchemaChangeComponent,
    ColorPickerComponent,
    GradationGeneratorComponent,
    DashboardDatasourceComboComponent,
    ColorTemplateComponent,
    SvgIconComponent,
    InputComponent,
    PaginationComponent
  ],
  exports: [
    AngularCommonModule,
    FormsModule,
    ClickOutsideModule,
    HttpClientModule,
    TranslateModule,
    BaseFilter,
    BaseSort,
    FileSizePipe,
    KeysPipe,
    EnumListPipe,
    NumberCommasPipe,
    MomentPipe,
    MomentDatePipe,
    SelectComponent,
    MultiSelectComponent,
    PagingSelectComponent,
    PagingSearchSelectComponent,
    DropBoxComponent,
    SortDropBoxComponent,
    MomentModule,
    DeleteModalComponent,
    CreateModalComponent,
    ConfirmModalComponent,
    PeriodComponent,
    DateComponent,
    InputMaskDirective,
    FocusDirective,
    InvokeDirective,
    LoadingComponent,
    GridComponent,
    LogComponent,
    UserInformationComponent,
    ConfirmSmallComponent,
    RoleSchemaComponent,
    PermissionSchemaComponent,
    PermissionSchemaSetComponent,
    PermissionSchemaChangeComponent,
    ColorPickerComponent,
    GradationGeneratorComponent,
    DashboardDatasourceComboComponent,
    ColorTemplateComponent,
    SvgIconComponent,
    InputComponent,
    PaginationComponent
  ],
  providers: [
    {
      provide: COMPOSITION_BUFFER_MODE,
      useValue: false
    },
    StompService,
    {
      provide: StompConfig,
      useValue: stompConfig
    }
  ]
})
export class CommonModule {
}
