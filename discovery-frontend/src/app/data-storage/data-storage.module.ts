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
import { DatasourceService } from '../datasource/service/datasource.service';
import { DataconnectionService } from '../dataconnection/service/dataconnection.service';
import { HandlerDataConnectionComponent } from './data-connection/handler-data-connection/handler-data-connection.component';
import { CreateConnectionComponent } from './data-connection/handler-data-connection/create-data-connection/create-connection.component';
import { UpdateConnectionComponent } from './data-connection/handler-data-connection/update-data-connection/update-connection.component';
import { BatchHistoryComponent } from './data-source-list/detail-data-source/information-dats-source/component/batch-history/batch-history.component';
import { QueryDetailComponent } from './data-source-list/detail-data-source/information-dats-source/component/query-detail/query-detail.component';
import { SetWorkspacePublishedComponent } from './component/set-workspace-published/set-workspace-published.component';
import { MonitoringDataSourceComponent } from './data-source-list/detail-data-source/monitoring-data-source/monitoring-data-source.component';
import { InformationDataSourceComponent } from './data-source-list/detail-data-source/information-dats-source/information-data-source.component';
import { DetailDataSourceComponent } from './data-source-list/detail-data-source/detail-data-source.component';
import { DataPreviewModule } from '../common/data.preview.module';
import { TimeComponent } from './component/time-compoent/time.component';
import { DndModule } from 'ng2-dnd';
import { DbCompleteComponent } from './data-source-list/create-data-source/db-create-component/db-complete/db-complete.component';
import { SelectTypeComponent } from './data-source-list/create-data-source/select-type/select-type.component';
import { DbSetDataConnection } from './data-source-list/create-data-source/db-create-component/db-set-data-connection/db-set-data-connection';
import { DbSelectDataComponent } from './data-source-list/create-data-source/db-create-component/db-select-data/db-select-data.component';
import { DbConfigureSchemaComponent } from './data-source-list/create-data-source/db-create-component/db-configure-schema/db-configure-schema.component';
import { DbIngestionPermissionComponent } from './data-source-list/create-data-source/db-create-component/db-ingestion-permission/db-ingestion-permission.component';
import { WorkbenchEditorModule } from '../workbench/workbench.editor.module';
import { StagingDbSelectDataComponent } from './data-source-list/create-data-source/staging-db-component/staging-db-select-data/staging-db-select-data.component';
import { StagingDbIngestionComponent } from './data-source-list/create-data-source/staging-db-component/staging-db-ingestion/staging-db-ingestion.component';
import { StagingDbConfigureSchemaComponent } from './data-source-list/create-data-source/staging-db-component/staging-db-configure-schema/staging-db-configure-schema.component';
import { StagingDbCompleteComponent } from './data-source-list/create-data-source/staging-db-component/staging-db-complete/staging-db-complete.component';
import { FileModule } from '../common/file.module';
import { FileCompleteComponent } from './data-source-list/create-data-source/file-create-component/file-complete/file-complete.component';
import { FileConfigureSchemaComponent } from './data-source-list/create-data-source/file-create-component/file-configure-schema/file-configure-schema.component';
import { FileIngestionComponent } from './data-source-list/create-data-source/file-create-component/file-ingestion/file-ingestion.component';
import { FileSelectComponent } from './data-source-list/create-data-source/file-create-component/file-select/file-select.component';
import { CanDeactivateGuard } from '../common/gaurd/can.deactivate.guard';
import { DruidSelectComponent } from './data-source-list/create-data-source/druid-create-component/druid-select/druid-select.component';
import { DataGridDataSourceComponent } from './data-source-list/detail-data-source/data-grid-data-source/data-grid-data-source.component';
import { ColumnDetailDataSourceComponent } from './data-source-list/detail-data-source/column-detail-data-source/column-detail-data-source.component';
import { EditConfigSchemaComponent } from './data-source-list/detail-data-source/column-detail-data-source/edit-config-schema/edit-config-schema.component';
import { MetadataService } from '../meta-data-management/metadata/service/metadata.service';
import { EditFilterDataSourceComponent } from './data-source-list/detail-data-source/edit-filter-data-source.component';
import { IngestionSettingComponent } from './data-source-list/component/ingestion-setting.component';
import { AdvancedSettingComponent } from './data-source-list/component/advanced-setting.component';
import { IngestionLogComponent } from './data-source-list/detail-data-source/information-dats-source/component/ingestion-log/ingestion-log.component';
import { AddColumnComponent } from './data-source-list/component/add-column.component';
import { ColumnSelectBoxComponent } from './data-source-list/component/column-select-box.component';
import { CriterionFilterBoxComponent } from './component/criterion/criterion-filter-box.component';
import { CriterionCheckboxComponent } from './component/criterion/criterion-checkbox.component';
import { CriterionTimeRadioboxComponent } from './component/criterion/criterion-time-radiobox.component';
import { SchemaConfigComponent } from './component/schema-config/schema-config.component';
import { SchemaConfigDetailComponent } from './component/schema-config/schema-config-detail.component';
import { SchemaConfigActionBarComponent } from './component/schema-config/schema-config-action-bar.component';
import { GranularityService } from './service/granularity.service';
import { TimezoneService } from "./service/timezone.service";
import {DataSourceCreateService} from "./service/data-source-create.service";
import {DataConnectionCreateService} from "./service/data-connection-create.service";

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
    DataPreviewModule,
    WorkbenchEditorModule,
    FileModule,
    RouterModule.forChild(storageRoutes)
  ],
  declarations: [
    // common
    TimeComponent,
    // schema config component
    SchemaConfigComponent,
    // schema config detail component
    SchemaConfigDetailComponent,
    // schema config action bar component
    SchemaConfigActionBarComponent,
    // data source
    DataSourceListComponent,
    // data source - create
    CreateDataSourceComponent,
    SelectTypeComponent,
    // data source - create_database
    DbSetDataConnection,
    DbSelectDataComponent,
    DbConfigureSchemaComponent,
    DbIngestionPermissionComponent,
    DbCompleteComponent,
    // data source - create_staging
    StagingDbSelectDataComponent,
    StagingDbIngestionComponent,
    StagingDbConfigureSchemaComponent,
    StagingDbCompleteComponent,
    // data source - create_file
    FileSelectComponent,
    FileIngestionComponent,
    FileConfigureSchemaComponent,
    FileCompleteComponent,
    // data source - create_druid
    DruidSelectComponent,
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
    // ingestion
    IngestionSettingComponent,
    // ingestion - advanced setting
    AdvancedSettingComponent,
    // configuration - add column
    AddColumnComponent,
    // column select box
    ColumnSelectBoxComponent,

    // data connection
    DataConnectionComponent,
    HandlerDataConnectionComponent,
    // data connection - create
    CreateConnectionComponent,
    // data connection - update
    UpdateConnectionComponent,
    // criterion filter creator box
    CriterionFilterBoxComponent,
    // criterion checkbox
    CriterionCheckboxComponent,
    // criterion time radiobox
    CriterionTimeRadioboxComponent
  ],
  exports: [
    // 워크벤치에서 사용하기 위해
    CreateDataSourceComponent
  ],
  providers: [
    DatasourceManagementGuard,
    DatasourceService,
    DataconnectionService,
    MetadataService,
    GranularityService,
    DataSourceCreateService,
    DataConnectionCreateService,
    TimezoneService
  ]
})
export class DataStorageModule {
}
