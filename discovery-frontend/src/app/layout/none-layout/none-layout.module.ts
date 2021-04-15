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
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {NoneLayoutComponent} from './none-layout.component';

const layoutRoutes: Routes = [
  {
    path: '', component: NoneLayoutComponent, children: [
      {path: '', redirectTo: '/user/login', pathMatch: 'full'},
      {path: 'login', loadChildren: 'app/user/user.module#UserModule'},
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(layoutRoutes),
  ],
  declarations: [NoneLayoutComponent],
})
export class NoneLayoutModule {
  constructor(private broadCaster: EventBroadcaster) {
    this.broadCaster.broadcast('ENTER_LAYOUT_MODULE');
  }
}
