import { NgModule } from '@angular/core';
import {HivePersonalDatabaseService} from "./service/plugins.hive-personal-database.service";
import {CreationTableComponent} from "./component/creation-table/creation-table.component";
import {RenameTableComponent} from "./component/rename-table/rename-table.component";
import {ImportFileComponent} from "./component/import-file/import-file.component";
import {CommonModule} from "../../common/common.module";
import {FileModule} from "../../common/file.module";
import {DeleteTableComponent} from "./component/delete-table/delete-table.component";

@NgModule({
  imports: [CommonModule, FileModule],
  declarations: [ CreationTableComponent, RenameTableComponent, ImportFileComponent, DeleteTableComponent],
  providers: [ HivePersonalDatabaseService ],
  exports: [CreationTableComponent, RenameTableComponent, ImportFileComponent, DeleteTableComponent]
})
export class PluginHivePersonalDatabaseModule {}
