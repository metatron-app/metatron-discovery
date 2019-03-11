import {NgModule} from '@angular/core';
import {CommonModule} from '../../../common/common.module';
import {ColumnSchemaComponent} from './component/column-schema.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ColumnSchemaComponent,
  ],
  exports: [
    ColumnSchemaComponent,
  ],
})
export class ColumnSchemaModule {
}
