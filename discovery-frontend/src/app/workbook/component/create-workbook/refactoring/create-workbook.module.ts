import {NgModule} from "@angular/core";
import {CommonModule} from "../../../../common/common.module";
import {CreateWorkbookComponent} from "./create-workbook.component";
import {WorkbookService} from "../../../service/workbook.service";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CreateWorkbookComponent
  ],
  providers: [
    WorkbookService
  ]
})
export class CreateWorkbookModule {}
