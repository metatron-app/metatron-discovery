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

import {AfterContentChecked, ChangeDetectorRef, Component, Injector} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {
  Event as RouterEvent,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router
} from '@angular/router';

import * as _ from 'lodash';
import {EventBroadcaster} from './common/event/event.broadcaster';
import {UserSetting} from "./common/value/user.setting.value";
import {CommonUtil} from "./common/util/common.util";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterContentChecked {

  public isLoggedIn:boolean = false;
  public routerLoading: boolean = false;

  // Change Detect
  public changeDetect: ChangeDetectorRef;

  constructor(private translateService: TranslateService,
              private broadCaster: EventBroadcaster,
              private router: Router,
              protected injector: Injector) {

    this.changeDetect = injector.get(ChangeDetectorRef);

    this.isLoggedIn = false;

    // 레이아웃 모듈 진입 이벤트
    this.broadCaster.on<any>('ENTER_LAYOUT_MODULE').subscribe(() => {
      this.isLoggedIn = true;
      this.changeDetect.detectChanges();
    });

    const userSetting:UserSetting = CommonUtil.getUserSetting();
    CommonUtil.setThemeCss(userSetting.theme);

    // 다국어 언어 설정
    if (!this.translateService.getDefaultLang()) {
      // TODO 다국어 언어설정 index.html 과 동일한 언어를 설정
      let lang = translateService.getBrowserLang();
      const userLang = userSetting.language;
      if (!_.isNil(userLang)) {
        lang = userLang;
      }
      if (lang === "zh" || lang === "zh-CN") {
        this.translateService.use("zh")
      } else if (lang === "ko") {
        this.translateService.use("ko")
      } else {
        this.translateService.use("en")
      }
      this.translateService.setDefaultLang('en');
    }
    router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event);

      let url: string = event['url'];
      if (url && url.includes('index.html?path=')) {
        url = decodeURIComponent(url.split('?path=')[1]);
        if (_.startsWith(url, '/') === false) {
          // if (url.startsWith('/') === false) {
          url = '/' + url;
        }
        this.router.navigate([url]).then();
      }
    });

  } // constructor

  ngAfterContentChecked(): void {
    this.changeDetect.detectChanges();
  }

  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.routerLoading = true;
    }
    if (event instanceof NavigationEnd) {
      this.routerLoading = false;
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.routerLoading = false;
    }
    if (event instanceof NavigationError) {
      this.routerLoading = false;
    }
  }
}
