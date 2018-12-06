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

import { ChangeDetectorRef, Component, Injector } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import {
  Router,
  // import as RouterEvent to avoid confusion with the DOM Event
  Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';

import * as _ from 'lodash';
import { EventBroadcaster } from './common/event/event.broadcaster';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

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

    // 다국어 언어 설정
    if (!this.translateService.getDefaultLang()) {
      // TODO 다국어 언어설정 index.html 과 동일한 언어를 설정
      const browserLang = translateService.getBrowserLang();
      // this.translateService.setDefaultLang('ko');
      // 브라우저 언어에 따라 메세지 선택
      if (browserLang === "zh" || browserLang === "zh-CN") {
        this.translateService.use("zh")
      } else if (browserLang === "ko") {
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
