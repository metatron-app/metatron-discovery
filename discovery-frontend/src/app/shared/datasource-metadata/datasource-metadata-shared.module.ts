import {NgModule} from '@angular/core';
import {ConstantService} from './service/constant.service';
import {CommonModule} from '../../common/common.module';

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    ConstantService,
  ],
})
export class DatasourceMetadataSharedModule {
}
