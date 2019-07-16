import {NgModule} from "@angular/core";
import {CommonModule} from "../../../../common/common.module";
import {CreateWorkbenchContainerComponent} from "./create-workbench-container.component";
import {CreateWorkbenchModelService} from "./service/create-workbench-model.service";
import {CreateWorkbenchSelectComponent} from "./create-workbench-select.component";
import {WorkbenchService} from "../../../service/workbench.service";
import {ConstantService} from "../../../../shared/datasource-metadata/service/constant.service";
import {CreateWorkbenchCompleteComponent} from "./create-workbench-complete.component";

@NgModule({
  imports: [CommonModule],
  declarations: [
    CreateWorkbenchContainerComponent,
    CreateWorkbenchSelectComponent,
    CreateWorkbenchCompleteComponent,
  ],
  providers: [
    CreateWorkbenchModelService,
    WorkbenchService,
    ConstantService
  ]
})
export class CreateWorkbenchModule {}
