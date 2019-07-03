import {NgModule} from '@angular/core';
import {InformationComponent} from './component/information/information.component';
import {TopInfoComponent} from './component/top-info/top-info.component';
import {CommonModule} from '../../common/common.module';
import {ColumnSchemaComponent} from './component/column-schema/column-schema.component';
import {LineageViewComponent} from './component/lineage-view/lineage-view.component';
import {LineageColumnViewComponent} from './component/lineage-view/lineage-column-view.component';
import {LineageViewService} from './service/lineage-view.service';
import {DatasourceMetadataSharedModule} from '../../shared/datasource-metadata/datasource-metadata-shared.module';
import {MetadataGridComponent} from "./component/metadata-grid.component";
import {DataStorageCommonModule} from "../../data-storage/data-storage-common.module";

@NgModule({
  imports: [
    CommonModule,
    DatasourceMetadataSharedModule,
    DataStorageCommonModule
  ],
  declarations: [
    InformationComponent,
    MetadataGridComponent,
    ColumnSchemaComponent,
    LineageViewComponent,
    LineageColumnViewComponent,
    TopInfoComponent,
  ],
  exports: [
    InformationComponent,
    MetadataGridComponent,
    ColumnSchemaComponent,
    LineageViewComponent,
    LineageColumnViewComponent,
  ],
  providers: [
    LineageViewService
  ]
})
export class DetailModule {
}
