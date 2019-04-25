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

import * as moment from 'moment';
import {APP_BASE_HREF} from '@angular/common';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {RouterModule, Routes} from '@angular/router';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {environment} from '../environments/environment';
import {PopupService} from './common/service/popup.service';
import {EventBroadcaster} from './common/event/event.broadcaster';
import {UnloadConfirmService} from './common/service/unload.confirm.service';
import {CanDeactivateGuard} from './common/gaurd/can.deactivate.guard';
import {SsoGuard} from './common/gaurd/sso.guard';
import {UserService} from './user/service/user.service';
import {CookieService} from 'ng2-cookies';
import {ClipboardModule} from 'ngx-clipboard';

// 다국어 파일 경로 지정
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// 다국어 모듈 생성
export const appTranslateModule: ModuleWithProviders = TranslateModule.forRoot({
  loader: {
    provide: TranslateLoader,
    useFactory: (createTranslateLoader),
    deps: [HttpClient]
  }
});


const appRoutes: Routes = [
  {path: 'sso', loadChildren: 'app/sso/sso.module#SsoModule'},
  {path: 'user', loadChildren: 'app/layout/none-layout/none-layout.module#NoneLayoutModule'},
  {path: 'dashboard', loadChildren: 'app/embedded/embedded-view.module#EmbeddedViewModule'},
  {path: 'embedded', loadChildren: 'app/embedded/embedded-view.module#EmbeddedViewModule'},
  {path: 'chart', loadChildren: 'app/chart-test/chart-test.module#ChartTestModule'},
  {path: '', loadChildren: 'app/layout/layout/layout.module#LayoutModule', canActivate: [SsoGuard]},
  // 존재하지 않는 URL
  {path: '**', redirectTo: '/user/login', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, {onSameUrlNavigation: 'reload'}),
    appTranslateModule,
    HttpClientModule,
    ClipboardModule
  ],
  providers: [
    {provide: APP_BASE_HREF, useValue: environment.baseHref},
    PopupService,
    SsoGuard,
    UserService,
    CookieService,
    CanDeactivateGuard,
    UnloadConfirmService,
    EventBroadcaster
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    let lang = window.navigator['userLanguage'] || window.navigator.language || 'en';
    if (window.navigator['languages']) {
      lang = window.navigator['languages'][0];
    }
    console.info(`browser's language ${lang}`);
    moment.locale(lang);
  }
}
