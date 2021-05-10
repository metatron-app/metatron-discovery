/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@common/common.module';
import {CriterionComponent} from './component/criterion/criterion.component';
import {CriterionExtensionBoxComponent} from './component/criterion/criterion-extension-box.component';
import {CriterionFilterBoxComponent} from './component/criterion/criterion-filter-box.component';
import {CriterionCheckboxListComponent} from './component/criterion/criterion-checkbox-list.component';
import {CriterionTimeRadioboxListComponent} from './component/criterion/criterion-time-radiobox-list.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CriterionComponent,
    CriterionExtensionBoxComponent,
    CriterionFilterBoxComponent,
    CriterionCheckboxListComponent,
    CriterionTimeRadioboxListComponent
  ],
  exports: [
    CriterionComponent,
    CriterionExtensionBoxComponent,
    CriterionFilterBoxComponent,
    CriterionCheckboxListComponent,
    CriterionTimeRadioboxListComponent
  ],
  providers: []
})
export class DataStorageCriteriaModule {
}
