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

import {
  ChangeDetectionStrategy, Component, ElementRef, Injector, OnDestroy,
  OnInit, ViewChild
} from '@angular/core';
import {AbstractComponent} from "../common/component/abstract.component";
import {ActivatedRoute} from "@angular/router";
import {CookieConstant} from "../common/constant/cookie.constant";
import {CommonService} from "../common/service/common.service";
import {Extension} from "../common/domain/extension";

@Component({
  selector: 'app-external-page',
  templateUrl: './external-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalPageComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('externalView')
  private _externalView: ElementRef;

  private _url: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private activatedRoute: ActivatedRoute,
              private commonService: CommonService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();
    this.loadingShow();
    window.history.pushState(null, null, window.location.href);
  } // function - ngOnInit

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();
    this.activatedRoute.params.subscribe((params) => {
      // dashboard 아이디를 넘긴경우에만 실행
      // 로그인 정보 생성
      this._url = params['url'];
      this._loadMenu();
    });
  } // function - ngAfterViewInit

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private _loadMenu() {
    this.loadingShow();
    const arrUrl:string[] = this._url.split('_');
    if( 0 < CommonService.extensions.length ) {
      const menuItem = CommonService.extensions.filter( item => ( item.parent === arrUrl[0] && item.name === arrUrl[1] ) )[0];
      this._openExternalView(this._getRouteUrl(menuItem, arrUrl[2]));
      this.loadingHide();
    } else {
      this.commonService.getExtensions('lnb').then( items => {
        if( items && 0 < items.length ) {
          const exts:Extension[] = items;
          const menuItem = exts.filter( item => ( item.parent === arrUrl[0] && item.name === arrUrl[1] ) )[0];
          this._openExternalView(this._getRouteUrl(menuItem, arrUrl[2]));
          this.loadingHide();
        }
      });
    }
  } // function - _loadMenu

  private _getRouteUrl(menuItem: Extension, name: string):string{
    if (menuItem.subContents != undefined) {
      return menuItem.subContents[name];
    } else if (menuItem.subMenus != undefined) {
      const subMenuItem = menuItem.subMenus.filter( item => item.name == name)[0];
      return subMenuItem.route;
    }
  }

  /**
   * Open external view in iframe
   * @param {string} targetUrl
   * @private
   */
  private _openExternalView(targetUrl: string) {
    const target = 'externalView';
    const formName = 'externalViewForm';
    const token = this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN);
    const refreshToken = this.cookieService.get(CookieConstant.KEY.REFRESH_LOGIN_TOKEN);
    const type = this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE);
    const userId = this.cookieService.get(CookieConstant.KEY.LOGIN_USER_ID);
    let existForm = document.getElementsByName(formName)[0];
    if (existForm) {
      existForm.remove();
    }
    const url:string = targetUrl.replace( '${token}', token ).replace( '${refreshToken}', refreshToken ).replace( '${type}', type ).replace( '${userId}', userId );

    let form = document.createElement('form');
    form.setAttribute('name', formName);
    form.setAttribute('method', 'post');
    form.setAttribute('action', url );
    form.setAttribute('target', target);
    document.getElementsByTagName('body')[0].appendChild(form);
    form.submit();
  } // function - _openExternalView

}
