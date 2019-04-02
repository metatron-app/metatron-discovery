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
import { CommonModule } from '../common/common.module';
import { DatasourceManagementGuard } from '../common/gaurd/datasource-management.guard';
import { RouterModule, Routes } from '@angular/router';
import { DataConnectionComponent } from './data-connection/data-connection.component';
import { DataSourceListComponent } from './data-source-list/data-source-list.component';
import { CreateDataSourceComponent } from './data-source-list/create-data-source/create-data-source.component';
import { CreateConnectionComponent } from './data-connection/create-connection.component';
import { UpdateConnectionComponent } from './data-connection/update-connection.component';
import { BatchHistoryComponent } from './data-source-list/detail-data-source/information-dats-source/component/batch-history/batch-history.component';
import { QueryDetailComponent } from './data-source-list/detail-data-source/information-dats-source/component/query-detail/query-detail.component';
import { SetWorkspacePublishedComponent } from './component/set-workspace-published/set-workspace-published.component';
import { MonitoringDataSourceComponent } from './data-source-list/detail-data-source/monitoring-data-source/monitoring-data-source.component';
import { InformationDataSourceComponent } from './data-source-list/detail-data-source/information-dats-source/information-data-source.component';
import { DetailDataSourceComponent } from './data-source-list/detail-data-source/detail-data-source.component';
import { DndModule } from 'ng2-dnd';
import { CanDeactivateGuard } from '../common/gaurd/can.deactivate.guard';
import { DataGridDataSourceComponent } from './data-source-list/detail-data-source/data-grid-data-source/data-grid-data-source.component';
import { ColumnDetailDataSourceComponent } from './data-source-list/detail-data-source/column-detail-data-source/column-detail-data-source.component';
import { EditConfigSchemaComponent } from './data-source-list/detail-data-source/column-detail-data-source/edit-config-schema.component';
import { MetadataService } from '../meta-data-management/metadata/service/metadata.service';
import { EditFilterDataSourceComponent } from './data-source-list/detail-data-source/edit-filter-data-source.component';
import { IngestionLogComponent } from './data-source-list/detail-data-source/information-dats-source/component/ingestion-log/ingestion-log.component';
import { CriterionFilterBoxComponent } from './component/criterion/criterion-filter-box.component';
import { CriterionCheckboxComponent } from './component/criterion/criterion-checkbox.component';
import { CriterionTimeRadioboxComponent } from './component/criterion/criterion-time-radiobox.component';
import {DataConnectionCreateService} from "./service/data-connection-create.service";
import {DataSourceCreateModule} from "./data-source-list/create-data-source/data-source-create.module";
import {FieldConfigService} from "./service/field-config.service";
import {DatasourceMetadataSharedModule} from "../shared/datasource-metadata/datasource-metadata-shared.module";
import {DataStorageCommonModule} from "./data-storage-common.module";
import {DataStorageShareModule} from "./data-storage-share.module";
import {ConstantService} from "../shared/datasource-metadata/service/constant.service";

const storageRoutes: Routes = [
  { path: '', component: DataSourceListComponent, canActivate: [DatasourceManagementGuard], canDeactivate:[CanDeactivateGuard] },
  { path: 'datasource', component: DataSourceListComponent, canActivate: [DatasourceManagementGuard], canDeactivate:[CanDeactivateGuard] },
  { path: 'datasource/:sourceId', component: DetailDataSourceComponent, canActivate: [DatasourceManagementGuard] },
  { path: 'data-connection', component: DataConnectionComponent, canActivate: [DatasourceManagementGuard] }
];

@NgModule({
  imports: [
    CommonModule,
    DndModule,
    DataSourceCreateModule,
    DatasourceMetadataSharedModule,
    DataStorageCommonModule,
    DataStorageShareModule,
    RouterModule.forChild(storageRoutes)
  ],
  declarations: [
    // data source
    DataSourceListComponent,
    // data source - detail
    DetailDataSourceComponent,
    InformationDataSourceComponent,
    DataGridDataSourceComponent,
    ColumnDetailDataSourceComponent,
    MonitoringDataSourceComponent,
    SetWorkspacePublishedComponent,
    QueryDetailComponent,
    BatchHistoryComponent,
    EditFilterDataSourceComponent,
    EditConfigSchemaComponent,
    IngestionLogComponent,
    // data connection
    DataConnectionComponent,
    CreateConnectionComponent,
    UpdateConnectionComponent,
    // criterion
    CriterionFilterBoxComponent,
    CriterionCheckboxComponent,
    CriterionTimeRadioboxComponent,
  ],
  exports: [
    // 워크벤치에서 사용하기 위해
    CreateDataSourceComponent
  ],
  providers: [
    DatasourceManagementGuard,
    MetadataService,
    DataConnectionCreateService,
    FieldConfigService,
    ConstantService,
  ]
})
export class DataStorageModule {
}
