import {NgModule} from '@angular/core';
import {ConstantService} from './service/constant.service';
import {CommonModule} from '../../common/common.module';
import {TimezoneService} from '../../data-storage/service/timezone.service';
import {FieldConfigService} from '../../data-storage/service/field-config.service';
import {StorageFilterSelectBoxComponent} from "../../data-storage/data-source-list/component/storage-filter-select-box.component";

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    StorageFilterSelectBoxComponent
  ],
  exports: [
    StorageFilterSelectBoxComponent
  ],
  providers: [
    ConstantService,
    TimezoneService,
    FieldConfigService,
  ],
})
export class DatasourceMetadataSharedModule {
}
