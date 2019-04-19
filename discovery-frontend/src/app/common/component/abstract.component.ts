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

import * as $ from 'jquery';
import {AfterViewInit, ChangeDetectorRef, ElementRef, HostListener, Injector, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Loading} from '../util/loading.util';
import {TranslateService} from '@ngx-translate/core';
import {Page, PageResult} from '../../domain/common/page';
import {Subscription} from 'rxjs/Subscription';
import {Location} from '@angular/common';
import {CommonConstant} from '../constant/common.constant';
import {CookieConstant} from '../constant/cookie.constant';
import {Alert} from '../util/alert.util';
import {UnloadConfirmService} from '../service/unload.confirm.service';
import {CanComponentDeactivate} from '../gaurd/can.deactivate.guard';
import {CookieService} from 'ng2-cookies';
import {Modal} from 'app/common/domain/modal';
import {SYSTEM_PERMISSION} from '../permission/permission';
import {CommonUtil} from '../util/common.util';
import {User} from '../../domain/user/user';
import {Group} from '../../domain/user/group';
import {UserDetail} from '../../domain/common/abstract-history-entity';
import {StompService, StompState} from '@stomp/ng2-stompjs';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {isUndefined} from "util";
import {ImplementorType} from "../../domain/dataconnection/dataconnection";
import {LogicalType} from '../../domain/datasource/datasource';

declare let moment;

export class AbstractComponent implements OnInit, AfterViewInit, OnDestroy, CanComponentDeactivate {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 소켓관련
  private _webSocketReConnectCnt: number = 0;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // Router
  protected router: Router;

  // Location
  protected location: Location;

  // Subscription
  protected subscriptions: Subscription[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Change Detect
  public changeDetect: ChangeDetectorRef;

  // 현재 컴포넌트 jQuery 객체
  public $element: JQuery;

  public translateService: TranslateService;
  public cookieService: CookieService;

  public imagePath: string;

  // Loadded 화면이 다 Load 되었는지 확인
  public isLoaded: boolean = false;

  // Result Page
  public pageResult: PageResult = new PageResult();

  // Page
  public page: Page = new Page();

  public stomp: StompService;

  // 윈도우 JQuery 객체
  public $window: any = $(window);

  // unloadConfirm 관련
  public unloadConfirmSvc: UnloadConfirmService;
  public useUnloadConfirm: boolean = false;

  // 로그인 아이디
  public loginUserId: string;

  public compUUID: string;

  protected stompSubscriptions: Subscription[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    this.router = injector.get(Router);
    this.location = injector.get(Location);
    this.changeDetect = injector.get(ChangeDetectorRef);
    // 다국어 서비스 의존성 주입
    this.translateService = injector.get(TranslateService);
    this.imagePath = 'assets/images/';
    this.stomp = injector.get(StompService);
    this.unloadConfirmSvc = injector.get(UnloadConfirmService);
    this.cookieService = injector.get(CookieService);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  ngOnInit() {
    // 현재 컴포넌트 jQuery 객체
    this.$element = $(this.elementRef.nativeElement);

    // 로그인 사용자 아이디 조회
    this.loginUserId = CommonUtil.getLoginUserId();

    // 웹소켓 연결
    // this.checkAndConnectWebSocket().then();
    this.compUUID = CommonUtil.getUUID();
  }

  ngAfterViewInit() {
    setTimeout(
      () => {
        this.isLoaded = true;
      });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub: Subscription) => {
      sub.unsubscribe();
    });
    this.stompSubscriptions.forEach((sub: Subscription) => {
      sub.unsubscribe();
    });

    if (this.$element) {

      // 현재 엘리먼트 하위의 모든 이벤트 해제
      this.$element.find('*').off();

      // 엘리먼트 제거
      this.$element.remove();
    }
  }

  /**
   * unload 전 실행
   */
  public execBeforeUnload() {}

  /**
   * deactive 체크
   */
  public canDeactivate(): Observable<boolean> | boolean {
    this.execBeforeUnload();
    if (this.useUnloadConfirm) {
      const obConfirm: Observable<boolean> = this.unloadConfirmSvc.confirm();
      obConfirm.subscribe(data => {
        if (!data) {
          history.pushState(null, null, this.router.url);
        }
      });
      return obConfirm;
    }
    return true;
  } // function - canDeactivate

  /**
   * unload 체크
   * @param event
   */
  @HostListener('window:beforeunload', ['$event'])
  public beforeUnloadHandler(event) {
    this.execBeforeUnload();
    if (this.useUnloadConfirm) {
      const confirmationMessage: string = this.translateService.instant('msg.comm.ui.beforeunload');
      event.returnValue = confirmationMessage;  // Gecko, Trident, Chrome 34+
      return confirmationMessage;               // Gecko, WebKit, Chrome < 34
    }
  } // function - beforeUnloadHandler

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // noinspection JSMethodCanBeStatic
  /**
   * add body scroll hidden class
   */
  public addBodyScrollHidden() {
    $('body').removeClass('body-hidden').addClass('body-hidden');
  } // function - addBodyScrollHidden

  // noinspection JSMethodCanBeStatic
  /**
   * remove body scroll hidden class
   */
  public removeBodyScrollHidden() {
    $('body').removeClass('body-hidden');
  } // function - removeBodyScrollHidden

  // noinspection JSMethodCanBeStatic
  /**
   * 로딩 표시
   */
  public loadingShow() {
    Loading.show();
  }

  // noinspection JSMethodCanBeStatic
  /**
   * 로딩 숨김
   */
  public loadingHide() {
    Loading.hide();
  }

  /**
   * attempt to use a destroyed view detectchanges 오류를 발생하지 않기 위해
   * 안전하게 변경사항을 체크하는 메서드
   * (주의) 변경사항이 갱신되지 않을 수도 있다.
   */
  public safelyDetectChanges() {
    if (!this.changeDetect['destroyed']) {
      this.changeDetect.detectChanges();
    }
  } // function - safelyDetectChanges

  // noinspection JSMethodCanBeStatic
  /**
   * 퍼미션 관리자 여부
   */
  public isPermissionManager() {
    return CommonUtil.isValidPermission(SYSTEM_PERMISSION.MANAGE_WORKSPACE);
  } // function - isPermissionManager

  /**
   * moment 재정의
   * @param date
   */
  public customMoment( date:(Date|string) ) {
    if (date.constructor === String) {
      return moment((<string>date).replace('.000Z', ''));
    } else {
      return moment(date);
    }
  } // function - customMoment

  // noinspection JSMethodCanBeStatic
  /**
   * 필드 타입에 맞는 아이콘 클래스 명을 얻는다
   * @param {string} itemType
   * @returns {string}
   */
  public getFieldTypeIconClass(itemType: string): string {
    let result = '';
    if (itemType) {
      switch (itemType.toUpperCase()) {
        case 'TIMESTAMP':
          result = 'ddp-icon-type-calen';
          break;
        case 'BOOLEAN':
          result = 'ddp-icon-type-tf';
          break;
        case 'TEXT':
        case 'DIMENSION':
        case 'STRING':
        case 'USER_DEFINED':
          result = 'ddp-icon-type-ab';
          break;
        case 'INT':
        case 'INTEGER':
        case 'LONG':
          result = 'ddp-icon-type-int';
          break;
        case 'DOUBLE':
        case 'FLOAT':
          result = 'ddp-icon-type-float';
          break;
        case 'MAP':
          result = 'ddp-icon-type-map';
          break;
        case 'ARRAY':
          result = 'ddp-icon-type-array';
          break;
        case 'CALCULATED':
          result = 'ddp-icon-type-sharp';
          break;
        case 'LNG':
        case 'LONGITUDE':
          result = 'ddp-icon-type-longitude';
          break;
        case 'LNT':
        case 'LATITUDE':
          result = 'ddp-icon-type-latitude';
          break;
        case 'ETC':
          result = 'ddp-icon-type-etc';
          break;
        case 'IMAGE':
          result = 'ddp-icon-type-image';
          break;
        case 'BINARY':
          result = 'ddp-icon-type-binary';
          break;
        case 'SPATIAL':
          result = 'ddp-icon-type-spatial';
          break;
        case 'PRIVATE':
          result = 'ddp-icon-type-private';
          break;
        case 'PHONE':
          result = 'ddp-icon-type-phone';
          break;
        case 'EMAIL':
          result = 'ddp-icon-type-email';
          break;
        case 'GENDER':
          result = 'ddp-icon-type-gender';
          break;
        case 'URL':
          result = 'ddp-icon-type-url';
          break;
        case 'POST':
          result = 'ddp-icon-type-zipcode';
          break;
        case 'COUNTRY':
        case 'STATE':
        case 'CITY':
        case 'GU':
        case 'DONG':
          result = 'ddp-icon-type-local';
          break;
        case 'GEO_POINT':
          result = 'ddp-icon-type-point';
          break;
        case 'GEO_LINE':
          result = 'ddp-icon-type-line';
          break;
        case 'GEO_POLYGON':
          result = 'ddp-icon-type-polygon';
          break;
      }
    }
    return result;
  } // function - getIconClass

  // noinspection JSMethodCanBeStatic
  /**
   * 필드에 맞는 role 타입 아이콘
   * @param {string} roleType
   * @returns {string}
   */
  public getFieldRoleTypeIconClass(roleType: string): string {
    return roleType === 'MEASURE' ? 'ddp-measure' : 'ddp-dimension';
  }

  // noinspection JSMethodCanBeStatic
  /**
   * 필드에 맞는 Dimension 타입의 아이콘
   * @param {string} type
   * @returns {string}
   */
  public getFieldDimensionTypeIconClass(type: string): string {
    if (type) {
      switch (type) {
        case 'TIMESTAMP':
          return 'ddp-icon-dimension-calen';
        case 'BOOLEAN':
          return 'ddp-icon-dimension-tf';
        case 'TEXT':
        case 'DIMENSION':
        case 'STRING':
        case 'USER_DEFINED':
          return 'ddp-icon-dimension-ab';
        case 'INT':
        case 'INTEGER':
        case 'LONG':
          return 'ddp-icon-dimension-int';
        case 'DOUBLE':
        case 'FLOAT':
          return 'ddp-icon-dimension-float';
        case 'MAP':
          return 'ddp-icon-dimension-maplink';
        case 'ARRAY':
          return 'ddp-icon-dimension-array';
        case 'CALCULATED':
          return 'ddp-icon-dimension-sharp';
        case 'LNG':
        case 'LONGITUDE':
          return 'ddp-icon-dimension-longitude';
        case 'LNT':
        case 'LATITUDE':
          return 'ddp-icon-dimension-latitude';
        case 'ACCOUNT':
          return 'ddp-icon-dimension-account';
        case 'COUNTRY':
        case 'STATE':
        case 'CITY':
        case 'GU':
        case 'DONG':
          return 'ddp-icon-dimension-local';
        case 'GEO_POINT':
          return 'ddp-icon-dimension-point';
        case 'GEO_LINE':
          return 'ddp-icon-dimension-line';
        case 'GEO_POLYGON':
          return 'ddp-icon-dimension-polygon';
        default:
          return 'ddp-icon-dimension-ab';
      }
    } else {
      return '';
    }

  }

  // noinspection JSMethodCanBeStatic
  /**
   * 필드에 맞는 Measure 타입의 아이콘
   * @param {string} type
   * @returns {string}
   */
  public getFieldMeasureTypeIconClass(type: string): string {
    if (type) {
      switch (type) {
        case 'TIMESTAMP':
          return 'ddp-icon-measure-calen';
        case 'BOOLEAN':
          return 'ddp-icon-measure-tf';
        case 'TEXT':
        case 'DIMENSION':
        case 'STRING':
        case 'USER_DEFINED':
          return 'ddp-icon-measure-ab';
        case 'INT':
        case 'INTEGER':
        case 'LONG':
          return 'ddp-icon-measure-int';
        case 'DOUBLE':
        case 'FLOAT':
          return 'ddp-icon-measure-float';
        case 'MAP':
          return 'ddp-icon-measure-maplink';
        case 'ARRAY':
          return 'ddp-icon-measure-array';
        case 'CALCULATED':
          return 'ddp-icon-measure-sharp';
        case 'LNG':
        case 'LONGITUDE':
          return 'ddp-icon-measure-longitude';
        case 'LNT':
        case 'LATITUDE':
          return 'ddp-icon-measure-latitude';
        case 'ACCOUNT':
          return 'ddp-icon-measure-account';
        case 'COUNTRY':
        case 'STATE':
        case 'CITY':
        case 'GU':
        case 'DONG':
          return 'ddp-icon-measure-local';
        default:
          return 'ddp-icon-measure-ab';
      }
    } else {
      return '';
    }
  }

  /**
   * 사용가능한 커넥션 타입
   * @param {boolean} isDeleteAll
   * @returns {any}
   */
  public getEnabledConnectionTypes(isDeleteAll: boolean = false) {
    const types = [
      {label: this.translateService.instant('msg.storage.ui.list.all'), value: 'all'},
      // { label: 'Oracle', value: 'ORACLE', icon: 'type-oracle'  },
      {label: 'MySQL', value: 'MYSQL', icon: 'type-mysql'},
      {label: 'PostgreSQL', value: 'POSTGRESQL', icon: 'type-postgre'},
      {label: 'Hive', value: 'HIVE', icon: 'type-hive'},
      {label: 'Presto', value: 'PRESTO', icon: 'type-presto'},
      {label: 'Druid', value: 'DRUID', icon: 'type-druid'}
      // { label: 'Apache Phoenix', value: 'PHOENIX', icon: 'type-pache' },
      // { label: 'Tibero', value: 'TIBERO', icon: 'type-tibero' }
    ];

    // isDelete all
    if (isDeleteAll) {
      types.shift();
    }

    return types;
  }

  /**
   * 메타데이터 LogicalType 목록
   * @returns {any[]}
   */
  public getMetaDataLogicalTypeList(): any[] {
    return [
      {
        label: this.translateService.instant('msg.metadata.ui.dictionary.type.string'),
        value: 'STRING',
        icon: 'ddp-icon-type-ab'
      },
      {
        label: this.translateService.instant('msg.metadata.ui.dictionary.type.boolean'),
        value: 'BOOLEAN',
        icon: 'ddp-icon-type-tf'
      },
      {
        label: this.translateService.instant('msg.metadata.ui.dictionary.type.integer'),
        value: 'INTEGER',
        icon: 'ddp-icon-type-int'
      },
      {
        label: this.translateService.instant('msg.metadata.ui.dictionary.type.double'),
        value: 'DOUBLE',
        icon: 'ddp-icon-type-float'
      },
      {
        label: this.translateService.instant('msg.storage.ui.list.date'),
        value: 'TIMESTAMP',
        icon: 'ddp-icon-type-calen'
      },
      {
        label: this.translateService.instant('msg.metadata.ui.dictionary.type.latitude'),
        value: 'LNT',
        icon: 'ddp-icon-type-latitude'
      },
      {
        label: this.translateService.instant('msg.metadata.ui.dictionary.type.longitude'),
        value: 'LNG',
        icon: 'ddp-icon-type-longitude'
      },
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.image'), value: 'IMAGE', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.binary'), value: 'BINARY', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.spatial'), value: 'SPATIAL', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.private'), value: 'PRIVATE', icon: ''},
      {
        label: this.translateService.instant('msg.metadata.ui.dictionary.type.phone'),
        value: 'PHONE_NUMBER',
        icon: ''
      },
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.email'), value: 'EMAIL', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.gender'), value: 'SEX', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.url'), value: 'URL', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.post'), value: 'POSTAL_CODE', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.country'), value: 'COUNTRY', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.state'), value: 'STATE', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.city'), value: 'CITY', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.gu'), value: 'GU', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.dong'), value: 'DONG', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.etc'), value: 'ETC', icon: ''},
      {
        label: this.translateService.instant('msg.storage.ui.list.geo.point'),
        value: LogicalType.GEO_POINT,
        icon: 'ddp-icon-type-point'
      },
      {
        label: this.translateService.instant('msg.storage.ui.list.geo.polygon'),
        value: LogicalType.GEO_POLYGON,
        icon: 'ddp-icon-type-polygon'
      },
      {
        label: this.translateService.instant('msg.storage.ui.list.geo.line'),
        value: LogicalType.GEO_LINE,
        icon: 'ddp-icon-type-line'
      },
    ];
  }

  /**
   * 메타데이터 Logical Etc Type 목록
   * @returns {any[]}
   */
  public getMetaDataLogicalTypeEtcList(): any[] {
    return [
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.image'), value: 'IMAGE', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.binary'), value: 'BINARY', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.spatial'), value: 'SPATIAL', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.private'), value: 'PRIVATE', icon: ''},
      {
        label: this.translateService.instant('msg.metadata.ui.dictionary.type.phone'),
        value: 'PHONE_NUMBER',
        icon: ''
      },
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.email'), value: 'EMAIL', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.gender'), value: 'SEX', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.url'), value: 'URL', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.post'), value: 'POSTAL_CODE', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.country'), value: 'COUNTRY', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.state'), value: 'STATE', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.city'), value: 'CITY', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.gu'), value: 'GU', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.dong'), value: 'DONG', icon: ''},
      {label: this.translateService.instant('msg.metadata.ui.dictionary.type.etc'), value: 'ETC', icon: ''},
    ];
  }


  /**
   * 접근불가 경고창을 띄운다
   */
  public openAccessDeniedConfirm() {
    const modal = new Modal();
    modal.isShowCancel = false;
    modal.name = this.translateService.instant('msg.comm.alert.access-denied.title');
    modal.description = this.translateService.instant('msg.comm.alert.access-denied.desc');
    modal.btnName = this.translateService.instant('msg.comm.ui.ok');
    CommonUtil.confirm(modal);
  } // function - openAccessDeniedConfirm

  // noinspection JSMethodCanBeStatic
  /**
   * 사용자의 Full Name 조회
   * @param {User | UserDetail} user
   * @return {string}
   */
  public getUserFullName(user: User | UserDetail) {
    return (user && '__UNKNOWN_USER' !== user.fullName) ? user.fullName : '';
  } // function - getUserFullName

  /**
   * 그룹 이름 조회
   * @param {Group} group
   * @return {string}
   */
  public getGroupName(group: Group) {
    return (group && '__UNKNOWN_GROUP' !== group.name) ? group.name : '';
  } // function - getGroupName

  /**
   * 커넥션 타입 이미지 URL 반환 ( Color )
   * @param {ImplementorType} impType
   * @param {string} imgResource
   * @return {string}
   */
  public getConnImplementorImgUrl(impType:ImplementorType, imgResource?:string ):string {
    let connImgUrl = '';
    switch (impType) {
      case ImplementorType.MYSQL:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_mysql.png';
        break;
      case ImplementorType.HIVE:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_hive.png';
        break;
      case ImplementorType.DRUID:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_druid.png';
        break;
      case ImplementorType.POSTGRESQL:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_post.png';
        break;
      case ImplementorType.PRESTO:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_presto.png';
        break;
      default:
        connImgUrl = imgResource ? imgResource : location.origin + '/assets/images/img_db/ic_DB.png';
        break;
    }
    return connImgUrl;
  } // function - getConnImplementorImgUrl

  /**
   * 커넥션 타입 이미지 URL 반환 ( White )
   * @param {ImplementorType} impType
   * @param {string} imgResource
   * @return {string}
   */
  public getConnImplementorWhiteImgUrl(impType:ImplementorType, imgResource?:string ):string {
    let connImgUrl = '';
    switch (impType) {
      case ImplementorType.MYSQL:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_mysql_w.png';
        break;
      case ImplementorType.HIVE:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_hive_w.png';
        break;
      case ImplementorType.DRUID:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_druid_w.png';
        break;
      case ImplementorType.POSTGRESQL:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_post_w.png';
        break;
      case ImplementorType.PRESTO:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_presto_w.png';
        break;
      default:
        connImgUrl = imgResource ? imgResource : location.origin + '/assets/images/img_db/ic_db_w.png';
        break;
    }
    return connImgUrl;
  } // function - getConnImplementorWhiteImgUrl


  /**
   * 커넥션 타입 이미지 URL 반환 ( Gray )
   * @param {ImplementorType} impType
   * @param {string} imgResource
   * @return {string}
   */
  public getConnImplementorGrayImgUrl(impType:ImplementorType, imgResource?:string ):string {
    let connImgUrl = '';
    switch (impType) {
      case ImplementorType.MYSQL:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_mysql_b.png';
        break;
      case ImplementorType.HIVE:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_hive_b.png';
        break;
      case ImplementorType.DRUID:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_druid_b.png';
        break;
      case ImplementorType.POSTGRESQL:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_post_b.png';
        break;
      case ImplementorType.PRESTO:
        connImgUrl = location.origin + '/assets/images/img_db/ic_db_presto_b.png';
        break;
      default:
        connImgUrl = imgResource ? imgResource : location.origin + '/assets/images/img_db/ic_db_b.png';
        break;
    }
    return connImgUrl;
  } // function - getConnImplementorGrayImgUrl

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 웹소켓 연결 체크 및 재연결
   * @param {boolean} isReload
   * @return {Promise<string>}
   * @protected
   */
  protected checkAndConnectWebSocket(isReload: boolean = false): Promise<string> {

    this._webSocketReConnectCnt = this._webSocketReConnectCnt + 1;
    // 초기화 -> 연결 재 시도
    if (20 === this._webSocketReConnectCnt) {
      Alert.error(this.translateService.instant(this.translateService.instant('msg.bench.alert.socket.link.fail.retry')));
      (isReload) && (window.location.reload());
    }

    if (0 === this.stompSubscriptions.length) {
      this.stomp.configure({
        connectHeaders: {'X-AUTH-TOKEN': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)}
      });
      this.stomp.initAndConnect();
      (isUndefined(CommonConstant.stomp)) && (CommonConstant.stomp = this.stomp);
      return new Promise<string>((resolve, reject) => {
        console.log('Status init');
        // let state = this.stomp.state.pipe(
        //   map((state: number) => {
        //     console.log(`Current state: ${StompState[state]}`);
        //     return StompState[state];
        //   })
        // );
        // this.stompSubscriptions.forEach((sub: Subscription) => {
        //   sub.unsubscribe();
        // });
        // this.stompSubscriptions = [];

        const MAX_RETRIES = 3;
        let numRetries = MAX_RETRIES;

        this.stompSubscriptions.push(
          this.stomp.state.pipe(
            filter((state: number) => state === StompState.CLOSED)
          ).subscribe(() => {
            console.log(`Will retry ${numRetries} times`);
            if (numRetries <= 0) {
              console.info('>>>> disconnect');
              this.stomp.disconnect();
            }
            numRetries--;
          })
        );

        this.stompSubscriptions.push(
          this.stomp.connectObservable.subscribe(() => {
            console.log('connectObservable');
            numRetries = MAX_RETRIES;
          })
        );

        this.stompSubscriptions.push(
          this.stomp.connected$.subscribe(() => {
            console.log('I will be called for each time connection is established.');
            this._webSocketReConnectCnt = 0;
            const webSocket = CommonConstant.stomp['stompClient']['_webSocket'];
            if (webSocket && webSocket['_transport'] && webSocket['_transport']['url']) {
              const temp: string = webSocket['_transport']['url'];
              const tempArr = temp.split('/');
              CommonConstant.websocketId = tempArr[5];
            }
            resolve('CONNECTED');
          })
        );

      });
    } else {
      // if (this.stomp.connected()) {
      return new Promise<string>((resolve, reject) => {
        resolve('CONNECTED');
      });
      // }
    }

    /*
        return new Promise<string>((resolve, reject) => {
          try {
            (isUndefined(CommonConstant.stomp)) && (CommonConstant.stomp = this.stomp);

            if ('CONNECTED' === CommonConstant.stomp.status) {
              this._webSocketReConnectCnt = 0;
              const temp: string = CommonConstant.stomp['socket']['_transport']['url'];
              const tempArr = temp.split('/');
              CommonConstant.websocketId = tempArr[5];
              resolve('CONNECTED');
            } else if ('CONNECTING' === CommonConstant.stomp.status) {
              setTimeout(() => {
                this.checkAndConnectWebSocket().then(resolve);
              }, 500);
            } else if (CommonConstant.stomp.status === 'CLOSED') {
              this.stomp.configure({
                brokerURL: CommonConstant.API_CONSTANT.URL + '/stomp',
                connectHeaders: { 'X-AUTH-TOKEN': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN) },
                heartbeatOutgoing: 1000,
                heartbeatIncoming: 0,
                debug: (str) => {
                  console.log(new Date(), str);
                }
              });
              this.stomp.activate();
              const temp: string = this.stomp['socket']['_transport']['url'];
              const tempArr = temp.split('/');
              CommonConstant.websocketId = tempArr[5];
              this.checkAndConnectWebSocket().then(resolve);
            }
          } catch (err) {
            console.error(err);
            reject('ERROR');
          }
        });
    */
  } // function - checkAndConnectWebSocket

  // noinspection JSUnusedGlobalSymbols
  /**
   * 웹소켓 연결 해제
   */
  protected disconnectWebSocket() {
    (CommonConstant.stomp) && (CommonConstant.stomp.disconnect());
  } // function - disconnectWebSocket

  /**
   * Send View Activity Stream
   * @param {string} id
   * @param {string} type : WORKBOOK, NOTEBOOK, WORKBENCH, DASHBOARD
   */
  protected sendViewActivityStream(id: string, type: string) {
    setTimeout(() => {
      this.checkAndConnectWebSocket().then(() => {
        try {
          // 메세지 발신
          const params = {
            'type': 'View',
            'object': {'id': id, 'type': type},
            'generator': {'type': 'WEBAPP', 'name': navigator.userAgent}
          };
          CommonConstant.stomp.publish(
            {
              destination: '/message/activities/add',
              headers: {'X-AUTH-TOKEN': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)},
              body: JSON.stringify(params)
            }
          );
        } catch (err) {
          console.error(err);
        }
      });
    }, 500);
  } // function - sendViewActivityStream

  /**
   * Send Link Activity Stream
   * @param {string} sourceId
   * @param {string} sourceType : DASHBOARD
   * @param {string} targetId
   * @param {string} targetType : DATASOURCE
   */
  protected sendLinkActivityStream(sourceId: string, sourceType: string, targetId: string, targetType: string) {
    setTimeout(() => {
      this.checkAndConnectWebSocket().then(() => {
        try {
          // 메세지 발신
          const params = {
            'type': 'Link',
            'object': {'id': sourceId, 'type': sourceType},
            'target': {'id': targetId, 'type': targetType},
            'generator': {'type': 'WEBAPP', 'name': navigator.userAgent}
          };
          CommonConstant.stomp.publish(
            {
              destination: '/message/activities/add',
              headers: {'X-AUTH-TOKEN': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)},
              body: JSON.stringify(params)
            }
          );
        } catch (err) {
          console.error(err);
        }
      });
    }, 500);
  } // function - sendLinkActivityStream

  /**
   * xhr 에 대한 공통 에러 핸들러
   * @param {any} err
   * @param {string} errMessage
   */
  protected commonExceptionHandler(err: any, errMessage?: string) {
    console.error(err);
    const url: string = this.router.url;
    if (-1 < url.indexOf('/management') || -1 < url.indexOf('/admin') || -1 < url.indexOf('/workbook')) {
      Alert.errorDetail(err.message, err.details);
    } else {
      if (err && err.details) {
        Alert.error(err.details);
      } else if (errMessage) {
        Alert.error(errMessage);
      } else {
        Alert.error(this.translateService.instant('msg.alert.retrieve.fail'));
      }
    }
    this.loadingHide();
  } // function - commonExceptionHandler

  // noinspection JSMethodCanBeStatic
  /**
   * dataprep exception 에 대한 공통 에러 핸들러
   * @param err
   */
  protected dataprepExceptionHandler(err) {
    //this.loadingHide();
    console.error(err);

    if (err.code && err.code.startsWith('PR') && err.message) {
      return err;
    } else if (err.message && err.message.startsWith('msg.dp.alert.')) {
      return err;
    } else {
      return {
        'message': 'msg.dp.alert.unknown.error',
        'details': JSON.stringify(err)
      };
    }
  } // function - commonExceptionHandler

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
