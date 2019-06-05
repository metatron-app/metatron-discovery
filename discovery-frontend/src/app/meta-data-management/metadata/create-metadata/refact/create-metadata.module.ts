import {NgModule} from "@angular/core";
import {CreateMetadataMainComponent} from "./create-metadata-main.component";
import {CreateMetadataDbConnectionComponent} from "./create-metadata-db-connection.component";
import {CommonModule} from "../../../../common/common.module";
import {DataStorageShareModule} from "../../../../data-storage/data-storage-share.module";
import {ConnectionSelectBoxComponent} from "./component/connection-select-box.component";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {CreateMetadataDbSelectComponent} from "./create-metadata-db-select.component";
import {SchemaSelectBoxComponent} from "./component/schema-select-box.component";
import {SchemaTableListComponent} from "./component/schema-table-list.component";
import {SchemaTablePreviewComponent} from "./component/schema-table-preview.component";
import {CreateMetadataDbCompleteComponent} from "./create-metadata-db-complete.component";

@NgModule({
  imports: [
    CommonModule,
    DataStorageShareModule,
    InfiniteScrollModule
  ],
  declarations: [
    // common
    ConnectionSelectBoxComponent,
    SchemaSelectBoxComponent,
    // create
    CreateMetadataMainComponent,
    CreateMetadataDbConnectionComponent,
    CreateMetadataDbSelectComponent,
    CreateMetadataDbCompleteComponent,
    SchemaTableListComponent,
    SchemaTablePreviewComponent
  ],
  exports: [
    CreateMetadataMainComponent
  ]
})
export class CreateMetadataModule {
}
