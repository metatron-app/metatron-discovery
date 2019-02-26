import {NgModule} from "@angular/core";
import {DataGridDataSourceComponent} from "./detail-data-source/data-grid-data-source/data-grid-data-source.component";
import {CommonModule} from "../../common/common.module";
import {DatasourceService} from "../../datasource/service/datasource.service";
import {DataconnectionService} from "../../dataconnection/service/dataconnection.service";
import {TimezoneService} from "../service/timezone.service";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DataGridDataSourceComponent,
  ],
  exports: [
    DataGridDataSourceComponent,
  ],
  providers: [
    DatasourceService,
    DataconnectionService,
    TimezoneService
  ]
})
export class DataSourceShareModule {}
