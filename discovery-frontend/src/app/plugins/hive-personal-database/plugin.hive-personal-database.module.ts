import {NgModule} from '@angular/core';
import {HivePersonalDatabaseService} from "./service/plugins.hive-personal-database.service";
import {CreationTableComponent} from "./component/creation-table/creation-table.component";
import {RenameTableComponent} from "./component/rename-table/rename-table.component";
import {ImportFileComponent} from "./component/import-file/import-file.component";
import {CommonModule} from "../../common/common.module";
import {FileModule} from "../../common/file.module";
import {DeleteTableComponent} from "./component/delete-table/delete-table.component";
import {DataAggregateComponent} from "./component/data-aggregate/data-aggregate.component";
import {CreationDataAggregateTaskComponent} from "./component/data-aggregate/creation-data-aggregate-task/creation-data-aggregate-task.component";
import {WorkbenchEditorModule} from "../../workbench/workbench.editor.module";
import {CompleteDataAggregateTaskComponent} from "./component/data-aggregate/complete-data-aggregate-task/complete-data-aggregate-task.component";
import {DetailsDataAggregateTaskComponent} from "./component/data-aggregate/details-data-aggregate-task/details-data-aggregate-task.component";

@NgModule({
  imports: [CommonModule, FileModule, WorkbenchEditorModule],
  declarations: [ CreationTableComponent, RenameTableComponent, ImportFileComponent, DeleteTableComponent, DataAggregateComponent, CreationDataAggregateTaskComponent, CompleteDataAggregateTaskComponent, DetailsDataAggregateTaskComponent],
  providers: [ HivePersonalDatabaseService ],
  exports: [CreationTableComponent, RenameTableComponent, ImportFileComponent, DeleteTableComponent, DataAggregateComponent, CreationDataAggregateTaskComponent, CompleteDataAggregateTaskComponent, DetailsDataAggregateTaskComponent]
})
export class PluginHivePersonalDatabaseModule {}
