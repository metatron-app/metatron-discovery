import {NgModule} from '@angular/core';
import {InformationComponent} from './component/information/information.component';
import {TopInfoComponent} from './component/top-info/top-info.component';
import {CommonModule} from '../../common/common.module';
import {ColumnSchemaComponent} from './component/column-schema/column-schema.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    InformationComponent,
    ColumnSchemaComponent,
    TopInfoComponent,
  ],
  exports: [
    InformationComponent,
    ColumnSchemaComponent,
  ],
})
export class DetailModule {
}
