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
import {CommonModule} from './common.module';
import {DataPreviewComponent} from './component/data-preview/data.preview.component';
import {DatasourceAliasService} from '../datasource/service/datasource-alias.service';
import {DataDownloadComponent} from './component/data-download/data.download.component';
import {WidgetService} from '../dashboard/service/widget.service';
import {TimezoneService} from '../data-storage/service/timezone.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    DataPreviewComponent,
    DataDownloadComponent
  ],
  exports: [
    DataPreviewComponent,
    DataDownloadComponent
  ],
  providers: [
    DatasourceAliasService,
    WidgetService,
    TimezoneService
  ]
})
export class DataPreviewModule {
}
