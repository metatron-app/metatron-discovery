import {NgModule} from '@angular/core';
import {ConstantService} from './service/constant.service';
import {CommonModule} from '../../common/common.module';
import {TimezoneService} from '../../data-storage/service/timezone.service';
import {FieldConfigService} from '../../data-storage/service/field-config.service';
import {DataStorageCommonModule} from "../../data-storage/data-storage-common.module";

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
  ],
  exports: [
  ],
  providers: [
    ConstantService,
    TimezoneService,
    FieldConfigService,
  ],
})
export class DatasourceMetadataSharedModule {
}
