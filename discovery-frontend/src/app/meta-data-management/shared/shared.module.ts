import {NgModule} from '@angular/core';
import {ConstantService as Constant} from './service/constant.service';
import {CommonModule} from '../../common/common.module';

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    Constant,
  ],
})
export class SharedModule {
}
