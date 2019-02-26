import {NgModule} from "@angular/core";
import {DataGridDataSourceComponent} from "./detail-data-source/data-grid-data-source/data-grid-data-source.component";
import {CommonModule} from "../../common/common.module";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DataGridDataSourceComponent,
  ],
  exports: [
    DataGridDataSourceComponent,
  ]
})
export class DataSourceShareModule {}
