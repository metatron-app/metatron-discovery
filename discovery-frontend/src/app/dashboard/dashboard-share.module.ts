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

import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgModule } from '@angular/core';
import { CommonModule } from '@common/common.module';
import { CustomFieldComponent } from './component/custom-field/custom-field.component';
import { FilterSelectComponent } from './filters/component/filter-select/filter-select.component';
import { InclusionFilterPanelComponent } from './filters/inclusion-filter/inclusion-filter-panel.component';
import { BoundFilterPanelComponent } from './filters/bound-filter/bound-filter-panel.component';
import { EssentialFilterComponent } from './filters/essential-filter/essential-filter.component';
import { ConfigureFiltersComponent } from './filters/configure-filters.component';
import { ConfigureFiltersSelectComponent } from './filters/configure-filters-select.component';
import { ConfigureFiltersUpdateComponent } from './filters/configure-filters-update.component';
import { ConfigureFiltersInclusionComponent } from './filters/inclusion-filter/configure-filters-inclusion.component';
import { ConfigureFiltersBoundComponent } from './filters/bound-filter/configure-filters-bound.component';
import { BoundFilterComponent } from './filters/bound-filter/bound-filter.component';
import { TimeRangeFilterComponent } from './filters/time-filter/time-range-filter.component';
import { TimeRelativeFilterComponent } from './filters/time-filter/time-relative-filter.component';
import { TimeListFilterComponent } from './filters/time-filter/time-list-filter.component';
import { ConfigureFiltersTimeComponent } from './filters/time-filter/configure-filters-time.component';
import { TimeFilterPanelComponent } from './filters/time-filter/time-filter-panel.component';
import { TimeDateFilterComponent } from './filters/time-filter/time-date-filter.component';
import { TimeUnitSelectComponent } from './filters/component/timeUnit-select.component';
import { TimeRangeComponent } from './filters/component/time-range.component';
import {TimeDateComponent} from './filters/component/time-date.component';

@NgModule({
  imports: [
    CommonModule,
    InfiniteScrollModule
  ],
  declarations: [
    FilterSelectComponent,
    TimeRangeComponent,
    InclusionFilterPanelComponent,
    BoundFilterComponent,
    BoundFilterPanelComponent,
    ConfigureFiltersComponent,
    ConfigureFiltersSelectComponent,
    ConfigureFiltersUpdateComponent,
    ConfigureFiltersInclusionComponent,
    ConfigureFiltersBoundComponent,
    EssentialFilterComponent,
    CustomFieldComponent,
    TimeUnitSelectComponent,
    TimeFilterPanelComponent,
    ConfigureFiltersTimeComponent,
    TimeRangeFilterComponent,
    TimeRelativeFilterComponent,
    TimeListFilterComponent,
    TimeDateFilterComponent,
    TimeDateComponent
  ],
  exports: [
    FilterSelectComponent,
    TimeRangeComponent,
    InclusionFilterPanelComponent,
    BoundFilterComponent,
    BoundFilterPanelComponent,
    ConfigureFiltersComponent,
    ConfigureFiltersSelectComponent,
    ConfigureFiltersUpdateComponent,
    ConfigureFiltersInclusionComponent,
    ConfigureFiltersBoundComponent,
    EssentialFilterComponent,
    CustomFieldComponent,
    TimeUnitSelectComponent,
    TimeFilterPanelComponent,
    ConfigureFiltersTimeComponent,
    TimeRangeFilterComponent,
    TimeRelativeFilterComponent,
    TimeListFilterComponent,
    TimeDateFilterComponent,
    TimeDateComponent
  ]
})
export class DashboardShareModule { }
