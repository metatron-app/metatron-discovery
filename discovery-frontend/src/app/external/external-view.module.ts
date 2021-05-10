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

import {CookieService} from 'ng2-cookies';
import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonService} from '@common/service/common.service';
import {ExternalPageComponent} from './external-page.component';

const embeddedViewRoutes: Routes = [
  {path: ':url', component: ExternalPageComponent}
];

@NgModule({
  imports: [
    RouterModule.forChild(embeddedViewRoutes)
  ],
  declarations: [
    ExternalPageComponent
  ],
  providers: [
    CookieService,
    CommonService
  ]
})
export class ExternalViewModule {
}
