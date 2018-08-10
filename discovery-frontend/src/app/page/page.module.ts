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

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageComponent } from './page.component';
import { CommonModule } from '../common/common.module';
import { PageShareModule } from './page-share.module';
import { ImageService } from '../common/service/image.service';
import { AnalysisPredictionService } from './component/analysis/service/analysis.prediction.service';

const pageRoutes: Routes = [
  {
    path: ':pageId', component: PageComponent
  },
];

@NgModule({
  imports: [
    CommonModule,
    PageShareModule,
    RouterModule.forChild(pageRoutes)
  ],
  declarations: [],
  exports: [],
  providers: [
    ImageService,
    AnalysisPredictionService
  ]
})
export class PageModule {
}
