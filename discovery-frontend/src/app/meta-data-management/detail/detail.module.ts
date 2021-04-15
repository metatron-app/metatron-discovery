import {NgModule} from '@angular/core';
import {InformationComponent} from './component/information/information.component';
import {TopInfoComponent} from './component/top-info/top-info.component';
import {CommonModule} from '@common/common.module';
import {ColumnSchemaComponent} from './component/column-schema/column-schema.component';
import {LineageViewComponent} from './component/lineage-view/lineage-view.component';
import {LineageDetailComponent} from './component/lineage-view/lineage-detail.component';
import {LineageViewService} from './service/lineage-view.service';
import {DatasourceMetadataSharedModule} from '../../shared/datasource-metadata/datasource-metadata-shared.module';
import {MetadataGridComponent} from './component/metadata-grid.component';
import {DataStorageCommonModule} from '../../data-storage/data-storage-common.module';
import {PopupCodeTableComponent} from '../code-table/popup/popup-code-table.component';
import {PopupColumnDictionaryComponent} from '../column-dictionary/popup/popup-column-dictionary.component';

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
    LineageDetailComponent,
    TopInfoComponent,
    PopupCodeTableComponent,
    PopupColumnDictionaryComponent
  ],
  exports: [
    InformationComponent,
    MetadataGridComponent,
    ColumnSchemaComponent,
    LineageViewComponent,
    LineageDetailComponent,
    PopupCodeTableComponent,
    PopupColumnDictionaryComponent
  ],
  providers: [
    LineageViewService
  ]
})
export class DetailModule {
}
