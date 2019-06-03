import {NgModule} from "@angular/core";
import {CreateMetadataMainComponent} from "./create-metadata-main.component";
import {CreateMetadataDbConnectionComponent} from "./create-metadata-db-connection.component";
import {CommonModule} from "../../../../common/common.module";
import {DataStorageShareModule} from "../../../../data-storage/data-storage-share.module";
import {ConnectionSelectBoxComponent} from "./component/connection-select-box.component";
import {InfiniteScrollModule} from "ngx-infinite-scroll";

@NgModule({
  imports: [
    CommonModule,
    DataStorageShareModule,
    InfiniteScrollModule
  ],
  declarations: [
    CreateMetadataMainComponent,
    CreateMetadataDbConnectionComponent,
    ConnectionSelectBoxComponent
  ],
  exports: [
    CreateMetadataMainComponent
  ]
})
export class CreateMetadataModule {
}
