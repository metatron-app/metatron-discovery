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
import { CommonModule } from '../../../common/common.module';
import {DataSnapshotDetailComponent} from "../../../data-preparation/data-snapshot/data-snapshot-detail.component";
import {TimeComponent} from "../../component/time-compoent/time.component";
import {SchemaConfigComponent} from "../../component/schema-config/schema-config.component";
import {SchemaConfigDetailComponent} from "../../component/schema-config/schema-config-detail.component";
import {SchemaConfigActionBarComponent} from "../../component/schema-config/schema-config-action-bar.component";
import {CreateDataSourceComponent} from "./create-data-source.component";
import {SelectTypeComponent} from "./select-type/select-type.component";
import {DbSetDataConnection} from "./db-create-component/db-set-data-connection/db-set-data-connection";
import {DbSelectDataComponent} from "./db-create-component/db-select-data/db-select-data.component";
import {DbConfigureSchemaComponent} from "./db-create-component/db-configure-schema/db-configure-schema.component";
import {DbIngestionPermissionComponent} from "./db-create-component/db-ingestion-permission/db-ingestion-permission.component";
import {DbCompleteComponent} from "./db-create-component/db-complete/db-complete.component";
import {StagingDbSelectDataComponent} from "./staging-db-component/staging-db-select-data/staging-db-select-data.component";
import {StagingDbIngestionComponent} from "./staging-db-component/staging-db-ingestion/staging-db-ingestion.component";
import {StagingDbConfigureSchemaComponent} from "./staging-db-component/staging-db-configure-schema/staging-db-configure-schema.component";
import {StagingDbCompleteComponent} from "./staging-db-component/staging-db-complete/staging-db-complete.component";
import {FileSelectComponent} from "./file-create-component/file-select/file-select.component";
import {FileIngestionComponent} from "./file-create-component/file-ingestion/file-ingestion.component";
import {FileConfigureSchemaComponent} from "./file-create-component/file-configure-schema/file-configure-schema.component";
import {FileCompleteComponent} from "./file-create-component/file-complete/file-complete.component";
import {DruidSelectComponent} from "./druid-create-component/druid-select/druid-select.component";
import {CreateSnapshotSourceSelectComponent} from "./snapshot-source/create-snapshot-source-select.component";
import {CreateSnapshotSourceConfigureComponent} from "./snapshot-source/create-snapshot-source-configure.component";
import {CreateSnapshotSourceIngestionComponent} from "./snapshot-source/create-snapshot-source-ingestion.component";
import {CreateSnapshotSourceCompleteComponent} from "./snapshot-source/create-snapshot-source-complete.component";
import {SnapshotPreviewComponent} from "./snapshot-source/snapshot-preview.component";
import {IngestionSettingComponent} from "../component/ingestion-setting.component";
import {AdvancedSettingComponent} from "../component/advanced-setting.component";
import {AddColumnComponent} from "../component/add-column.component";
import {ColumnSelectBoxComponent} from "../component/column-select-box.component";
import {WorkbenchEditorModule} from "../../../workbench/workbench.editor.module";
import {FileModule} from "../../../common/file.module";
import {DataSourceCreateService} from "../../service/data-source-create.service";
import {GranularityService} from "../../service/granularity.service";
import {DatasourceService} from "../../../datasource/service/datasource.service";
import {TimezoneService} from "../../service/timezone.service";
import {DataSnapshotService} from "../../../data-preparation/data-snapshot/service/data-snapshot.service";
import {DataconnectionService} from "../../../dataconnection/service/dataconnection.service";
import {SchemaConfigDataPreviewComponent} from "../../component/schema-config/schema-config-data-preview.component";
import {DataflowModelService} from "../../../data-preparation/dataflow/service/dataflow.model.service";
import {DataStorageCommonModule} from "../../data-storage-common.module";
import {DataStorageShareModule} from "../../data-storage-share.module";


@NgModule({
  imports: [
    CommonModule,
    WorkbenchEditorModule,
    FileModule,
    DataStorageCommonModule,
    DataStorageShareModule,
  ],
  declarations: [
    TimeComponent,
    // snapshot detail view
    DataSnapshotDetailComponent,
    // schema config component
    SchemaConfigComponent,
    // schema config detail component
    SchemaConfigDetailComponent,
    // schema config action bar component
    SchemaConfigActionBarComponent,
    SchemaConfigDataPreviewComponent,
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
    // data source - create_snapshot
    CreateSnapshotSourceSelectComponent,
    CreateSnapshotSourceConfigureComponent,
    CreateSnapshotSourceIngestionComponent,
    CreateSnapshotSourceCompleteComponent,
    SnapshotPreviewComponent,
    // ingestion
    IngestionSettingComponent,
    // ingestion - advanced setting
    AdvancedSettingComponent,
    // configuration - add column
    AddColumnComponent,
    // column select box
    ColumnSelectBoxComponent,
  ],
  exports: [
    TimeComponent,
    // snapshot view
    DataSnapshotDetailComponent,
    // schema config component
    SchemaConfigComponent,
    // schema config detail component
    SchemaConfigDetailComponent,
    // schema config action bar component
    SchemaConfigActionBarComponent,
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
    // data source - create_snapshot
    CreateSnapshotSourceSelectComponent,
    CreateSnapshotSourceConfigureComponent,
    CreateSnapshotSourceIngestionComponent,
    CreateSnapshotSourceCompleteComponent,
    SnapshotPreviewComponent,
    // ingestion
    IngestionSettingComponent,
    // ingestion - advanced setting
    AdvancedSettingComponent,
    // configuration - add column
    AddColumnComponent,
    // column select box
    ColumnSelectBoxComponent,
  ],
  providers: [
    DataSourceCreateService,
    DatasourceService,
    DataconnectionService,
    GranularityService,
    TimezoneService,
    DataSnapshotService,
    DataflowModelService
  ]
})
export class DataSourceCreateModule {
}
