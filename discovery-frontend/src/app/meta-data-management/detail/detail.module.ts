import {NgModule} from '@angular/core';
import {ColumnSchemaModule} from './column-schema/column-schema.module';

@NgModule({
  imports: [
    ColumnSchemaModule,
  ],
  exports: [
    ColumnSchemaModule,
  ],
})
export class DetailModule {
}
