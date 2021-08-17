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

import {Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, NavigationExtras} from '@angular/router';
import {AbstractComponent} from '@common/component/abstract.component';
import {WorkspaceService} from '../../../../workspace/service/workspace.service';
import {Workspace} from '@domain/workspace/workspace';
import {CreateWorkspaceComponent} from '../../../../workspace/component/management/create-workspace.component';
import {WorkspaceListComponent} from '../../../../workspace/component/management/workspace-list.component';
import {Book} from '@domain/workspace/book';
import {CookieConstant} from '@common/constant/cookie.constant';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {SYSTEM_PERMISSION} from '@common/permission/permission';
import {CommonUtil} from '@common/util/common.util';
import {Modal} from '@common/domain/modal';
import {ConfirmModalComponent} from '@common/component/modal/confirm/confirm.component';
import {BuildInfo} from '@environments/build.env';
import {CommonService} from '@common/service/common.service';
import {Extension} from '@common/domain/extension';
import {Engine} from '@domain/engine-monitoring/engine';
import {StringUtil} from '@common/util/string.util';

@Component({
  selector: 'app-lnb',
  templateUrl: './lnb.component.html',
})
export class LNBComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(private broadCaster: EventBroadcaster,
              private workspaceService: WorkspaceService,
              private commonService: CommonService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);

    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        // 네비계이션 종료
        switch (val.urlAfterRedirects) {
          case '/workspace' :
            this.depth1Menu1ClickListener('WORKSPACE');
            break;
          case '/management/metadata/metadata':
          case '/management/metadata/column-dictionary':
          case '/management/metadata/code-table':
          case '/management/metadata/catalog':
            this.depth1Menu1ClickListener('MANAGEMENT');
            this.mgmtMenuClickListener('METADATA');
            break;
          case '/management/storage/datasource' :
          case '/management/storage/data-connection' :
            this.depth1Menu1ClickListener('MANAGEMENT');
            break;
          case '/management/datapreparation/dataflow' :
          case '/management/datapreparation/dataset' :
          case '/management/datapreparation/datasnapshot' :
            this.depth1Menu1ClickListener('MANAGEMENT');
            this.mgmtMenuClickListener('DATAPREPARATION');
            break;
          case '/management/model/notebook' :
            this.depth1Menu1ClickListener('MANAGEMENT');
            this.mgmtMenuClickListener('MODELMANAGER');
            break;
          case '/management/monitoring/statistics':
          case '/management/monitoring/audit' :
          case '/management/monitoring/lineage' :
            this.depth1Menu1ClickListener('MANAGEMENT');
            this.mgmtMenuClickListener('DATAMONITORING');
            break;
          case '/management/engine-monitoring/overview' :
          case '/management/engine-monitoring/ingestion' :
          case '/management/engine-monitoring/query' :
          case '/management/engine-monitoring/datasource' :
            this.depth1Menu1ClickListener('MANAGEMENT');
            this.mgmtMenuClickListener('ENGINE_MONITORING');
            break;
          case '/admin/user/members' :
          case '/admin/user/groups' :
          case '/admin/workspaces/shared':
            this.depth1Menu1ClickListener('ADMINISTRATION');
            break;
        }
      }
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public readonly ENGINE_OVERVIEW_MONITORING_STATUS = Engine.MonitoringStatus;

  // 즐겨찾기 플래그
  private isFavorFl: boolean = false;

  // 공유 워크스페이스 원본 리스트
  private list: Workspace[] = [];

  // 쿠키정보
  private cookieInfo: any = {
    viewType: null,
    folderId: null,
    folderHierarchies: null,
    workspaceId: null
  };

  // 선택된 워크스페이스
  private _selectedWorkspace: Workspace;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 메뉴 권한
  public permission = {
    myWorkspace: false,
    workspace: false,
    exploreData: true,
    exploreDataView: true,
    exploreFavorite: true,
    management: false,
    managementDatasource: false,
    managementMetadata: false,
    // TODO: 추후에 엔진 모니터링 메뉴에 대한 권한이 있는지 검사하는 로직 추가 필요 ( 임시 작업 )
    managementEngineMonitoring: false,
    userAdmin: false,
    workspaceAdmin: false,
    lineage: false
  };

  // lnb 플래그
  public isShow = false;

  // 개인 워크스페이스
  public privateWorkspace: Workspace = new Workspace();

  // 공유 워크스페이스 리스트
  public sharedWorkspace: Workspace[] = [];

  // 폴더 네비게이션 관련
  public isShowFolderNavi: boolean = false;  // 폴더 네비게이션 표시 여부
  public folderNavigation: string[] = [];    // 폴더 네비게이션
  public folderStructure: Book[][] = [];     // 폴더 탐색 구조

  // menu 관리
  public lnbManager = {
    // 워크스페이스
    workspace: {fold: false},
    // 데이터 탐색
    exploreData: {
      fold: true,
      data: {fold: true},
      favorite: {fold: true}
    },
    // 매니지먼트
    management: {
      fold: true,
      metadata: {fold: true},
      dataStorage: {fold: true},
      dataPreparation: {fold: true},
      dataMonitoring: {fold: true},
      modelManager: {fold: true},
      engineMonitoring: {fold: true}
    },
    // 어드민
    administration: {
      fold: true,
      users: {fold: true},
      organization: {fold: true},
      workspaces: {fold: true}
    }
  };

  // Metatron App. 빌드 정보
  public buildInfo = {
    appVersion: BuildInfo.METATRON_APP_VERSION
  };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Component
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 공유 워크스페이스 생성 modal
  @ViewChild(CreateWorkspaceComponent)
  public createWorkspaceComp: CreateWorkspaceComponent;

  // 워크스페이스 리스트 컴포넌트
  @ViewChild(WorkspaceListComponent)
  private workspaceListComponent: WorkspaceListComponent;

  @ViewChild(ConfirmModalComponent)
  private _confirmModalComp: ConfirmModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  ObjectKeys = Object.keys;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  ngOnInit() {
    super.ngOnInit();
    const cookiePermission: string = CommonUtil.getCurrentPermissionString();
    if (cookiePermission && '' !== cookiePermission) {
      this.permission.myWorkspace = (-1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_PRIVATE_WORKSPACE.toString()));
      this.permission.workspace = (-1 < cookiePermission.indexOf(SYSTEM_PERMISSION.VIEW_WORKSPACE.toString()));
      this.permission.managementDatasource = (-1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_DATASOURCE.toString()));
      this.permission.managementMetadata = (-1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_METADATA.toString()));
      this.permission.management = (this.permission.managementDatasource || this.permission.managementMetadata);
      this.permission.userAdmin = (
        -1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_USER.toString())
        && -1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_SYSTEM.toString())
      );
      this.permission.workspaceAdmin = (
        -1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_SHARED_WORKSPACE.toString())
        && -1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_SYSTEM.toString())
      );
    }
    const cookieWs = this.cookieService.get(CookieConstant.KEY.CURRENT_WORKSPACE);
    (cookieWs) && (this.cookieInfo = JSON.parse(cookieWs));

    // 선택 필터 설정
    this.subscriptions.push(
      this.broadCaster.on<any>('CM_CLOSE_LNB').subscribe(() => {
        this._closeLNB();
      })
    );

    // extensions 설정
    this.commonService.getExtensions('lnb').then(items => {
      if (items && 0 < items.length) {
        const exts: Extension[] = items;
        exts.forEach(ext => {

          if ('Explore Data' === ext.name) {
            this.permission.exploreData = true;
          } else if ('Lineage' === ext.name) {
            this.permission.lineage = true;
          } else if ('Engine Monitoring' === ext.name) {
            // this.permission.managementEngineMonitoring = (-1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_DATASOURCE.toString()));
            this.permission.managementEngineMonitoring = this.extensionPermission(ext);
          } else {
            if (ext.parent !== 'ROOT') {
              (this.lnbManager[ext.parent]) || (this.lnbManager[ext.parent] = {});
              this.lnbManager[ext.parent][ext.name] = {fold: true};
            }
          }
        });
      }
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * Document Click Handler ( input class 제거 )
   * @param target
   */
  @HostListener('document:click', ['$event.target'])
  documentClickHandler(target) {
    const $target = $(target);
    if (!$target.hasClass('ddp-layout-lnb') && 0 === $target.closest('.ddp-layout-lnb').length) {
      this._closeLNB();
    }
  } // function - documentClickHandler

  /**
   * 메인 화면으로 이동
   */
  public goMain() {
    this.cookieService.delete(CookieConstant.KEY.CURRENT_WORKSPACE, '/');  // 쿠키 삭제
    if ('/workspace' === this.router.url) {
      this.broadCaster.broadcast('moveFromLnb', 'my');
    } else {
      this.router.navigate(['/workspace']).then(); // 이동
    }
    this._closeLNB();
  } // function - goMain

  /**
   * 대메뉴 클릭 이벤트 리스너
   * @param {string} menuName
   */
  public depth1Menu1ClickListener(menuName: string) {
    this.lnbManager.workspace.fold = true;
    this.lnbManager.exploreData.fold = true;
    this.lnbManager.management.fold = true;
    this.lnbManager.administration.fold = true;
    this.getExtensions('ROOT').forEach(item => {
      this.lnbManager[item.name]['fold'] = true;
    });
    switch (menuName) {
      case 'WORKSPACE' :
        this.lnbManager.workspace.fold = false;
        break;
      case 'EXPLOREDATA' :
        this.lnbManager.exploreData.fold = false;
        this.exploreDataMenuClickListener('EXPLOREDATA_VIEW');
        break;
      case 'MANAGEMENT' :
        this.lnbManager.management.fold = false;
        this.mgmtMenuClickListener('DATASTORAGE');
        break;
      case 'ADMINISTRATION' :
        this.lnbManager.administration.fold = false;
        this.adminMenuClickListener('USER');
        break;
      default :
        if (this.lnbManager[menuName]) {
          this.lnbManager[menuName]['fold'] = false;
          this.rootExtensionMenuClickListener(menuName);
        }
    }
  } // function - menuDepth1ClickListener

  /**
   * Explore Data 하위 메뉴 클릭 이벤트 리스너
   * @param menuName
   */
  public exploreDataMenuClickListener(menuName: string) {
    this.lnbManager.exploreData.data.fold = true;
    this.lnbManager.exploreData.favorite.fold = true;
    switch (menuName) {
      case 'EXPLOREDATA_DATA' :
        this.lnbManager.exploreData.data.fold = false;
        break;
      case 'EXPLOREDATA_FAVORITE' :
        this.lnbManager.exploreData.favorite.fold = false;
        break;
    }
  } // function - exploreDataMenuClickListener

  /**
   * Management 하위 메뉴 클릭 이벤트 리스너
   * @param {string} menuName
   */
  public mgmtMenuClickListener(menuName: string) {
    this.lnbManager.management.metadata.fold = true;
    this.lnbManager.management.dataStorage.fold = true;
    this.lnbManager.management.dataPreparation.fold = true;
    this.lnbManager.management.dataMonitoring.fold = true;
    this.lnbManager.management.modelManager.fold = true;
    this.lnbManager.management.engineMonitoring.fold = true;
    this.getExtensions('management').forEach(item => {
      this.lnbManager.management[item.name]['fold'] = true;
    });

    switch (menuName) {
      case 'METADATA' :
        this.lnbManager.management.metadata.fold = false;
        break;
      case 'DATASTORAGE' :
        this.lnbManager.management.dataStorage.fold = false;
        break;
      case 'DATAPREPARATION' :
        this.lnbManager.management.dataPreparation.fold = false;
        break;
      case 'DATAMONITORING' :
        this.lnbManager.management.dataMonitoring.fold = false;
        break;
      case 'MODELMANAGER' :
        this.lnbManager.management.modelManager.fold = false;
        break;
      case 'ENGINE_MONITORING' :
        this.lnbManager.management.engineMonitoring.fold = false;
        break;
      default :
        if (this.lnbManager.management[menuName]) {
          this.lnbManager.management[menuName]['fold'] = false;
        }
    }
  } // function - mgmtMenuClickListener

  /**
   * Administration 하위 메뉴 클릭 이벤트 리스너
   * @param {string} menuName
   */
  public adminMenuClickListener(menuName: string) {
    this.lnbManager.administration.users.fold = true;
    this.lnbManager.administration.workspaces.fold = true;
    this.lnbManager.administration.organization.fold = true;
    this.getExtensions('administration').forEach(item => {
      this.lnbManager.administration[item.name]['fold'] = true;
    });
    switch (menuName) {
      case 'USER' :
        this.lnbManager.administration.users.fold = false;
        break;
      case 'WORKSPACE' :
        this.lnbManager.administration.workspaces.fold = false;
        break;
      case 'ORGANIZATION' :
        this.lnbManager.administration.organization.fold = false;
        break;
      default :
        if (this.lnbManager.administration[menuName]) {
          this.lnbManager.administration[menuName]['fold'] = false;
        }
    }
  } // function - adminMenuClickListener

  public rootExtensionMenuClickListener(parent: string, menuName?: string) {
    if (menuName === undefined && this.getExtensions(parent).length > 0) {
      menuName = this.getExtensions(parent)[0].name;
    }
    this.getExtensions(parent).forEach(item => {
      this.lnbManager[parent][item.name]['fold'] = true;
    });

    if (this.lnbManager[parent][menuName]) {
      this.lnbManager[parent][menuName]['fold'] = false;
    }
  } // function - exploreDataMenuClickListener

  /**
   * 워크스페이스 리스트 페이지 오픈
   */
  public workspaceList() {
    this._closeLNB();
    this.workspaceListComponent.init();
  } // function - workspaceList

  /**
   * 워크스페이스 생성 후 이벤트 처리
   * @param {string} workspaceId
   */
  public moveWorkspace(workspaceId: string) {
    this._closeLNB();
    this.router.navigate(['/workspace', workspaceId]).then();
  } // function - moveWorkspace

  /**
   * lnb 이벤트
   */
  public lnbEvent() {
    // lnb hide 상태일때
    if (this.isShow === false) {
      // 워크스페이스 조회
      this._getPrivateWorkspace();
    }
    // lnb 상태 변경
    this.isShow = !this.isShow;
    (this.isShow) || (this.isShowFolderNavi = false);
  } // function - lnbEvent

  /**
   * 워크스페이스로 이동
   */
  public moveToWorkspace(workspace?: Workspace, isRemoveCookie: boolean = true) {
    if (workspace && !workspace.active) {
      const modal = new Modal();
      modal.name = this.translateService.instant('msg.space.alert.workspace.disabled');
      modal.description = this.translateService.instant('msg.space.alert.workspace.disabled.desc');
      modal.subDescription = this.translateService.instant('msg.space.alert.workspace.disabled.desc.sub');
      modal.isShowCancel = false;
      modal.btnName = this.translateService.instant('msg.comm.ui.ok');
      modal.data = {
        type: 'INACTIVE',
        afterConfirm: () => {
        }
      };
      this._confirmModalComp.init(modal);
    } else {
      const workspaceId: string = (workspace) ? workspace.id : 'my';
      let navigateInfo: string[];
      if (workspaceId) {
        navigateInfo = ['/workspace', workspaceId];
      } else {
        navigateInfo = ['/workspace'];
      }
      if (isRemoveCookie) {
        this.cookieService.delete(CookieConstant.KEY.CURRENT_WORKSPACE, '/');  // 쿠키 삭제
      }
      this._closeLNB();
      if (navigateInfo.includes('/workspace') && this.router.url === navigateInfo.join('/')) {
        this.broadCaster.broadcast('moveFromLnb', workspaceId);
      } else {
        this.router.navigate(navigateInfo).then(); // 이동
      }
    }
  } // function - moveToWorkspace

  /**
   * URL 정보에 따라 이동
   * @param {string[]} navigateInfo
   * @param {boolean} isRemoveCookie
   */
  public moveByRouteNavigate(navigateInfo: string[], isRemoveCookie: boolean = true) {
    if (isRemoveCookie) {
      this.cookieService.delete(CookieConstant.KEY.CURRENT_WORKSPACE, '/');  // 쿠키 삭제
    }
    this._closeLNB();
    this.router.navigate(navigateInfo).then(); // 이동
  } // function - moveByRouteNavigate

  /**
   * 네비게이션에서 선택한 항목으로 이동한다.
   *
   * @param {MouseEvent} event
   * @param {Book} naviItem
   */
  public moveToNavigationContent(event: MouseEvent, naviItem: Book) {
    event.stopPropagation();
    event.preventDefault();
    const objParent = naviItem['parent'];
    const cookieData = {
      viewType: this.cookieInfo.viewType ? this.cookieInfo.viewType : 'CARD',
      workspaceId: this._selectedWorkspace.id,
      folderId: ('folder' === objParent.type) ? objParent.id : null,
      folderHierarchies: ('folder' === objParent.type) ? objParent.hierarchies : null
    };
    switch (naviItem.type) {
      case 'folder' :
        (objParent.hierarchies) || (objParent.hierarchies = []);
        objParent.hierarchies.push({id: naviItem.id, name: naviItem.name});
        cookieData['folderId'] = naviItem.id;
        cookieData['folderHierarchies'] = objParent.hierarchies;
        this.cookieService.set(CookieConstant.KEY.CURRENT_WORKSPACE, JSON.stringify(cookieData), 0, '/');
        this.moveToWorkspace(this._selectedWorkspace, false);
        break;
      case 'workbook' :
        this.cookieService.set(CookieConstant.KEY.CURRENT_WORKSPACE, JSON.stringify(cookieData), 0, '/');
        this.moveByRouteNavigate(['/workbook', naviItem.id], false);
        break;
      case 'notebook' :
        this.cookieService.set(CookieConstant.KEY.CURRENT_WORKSPACE, JSON.stringify(cookieData), 0, '/');
        this.moveByRouteNavigate(['/notebook', naviItem.id, this._selectedWorkspace.id], false);
        break;
      case 'workbench' :
        this.cookieService.set(CookieConstant.KEY.CURRENT_WORKSPACE, JSON.stringify(cookieData), 0, '/');
        this.moveByRouteNavigate(['/workbench', naviItem.id], false);
        break;
    }
  } // function - moveToNavigationContent

  /**
   * 폴더 네비게이션을 표시/숨김한다.
   * @param {MouseEvent} event
   * @param {Workspace} wsInfo
   */
  public onOffFolderNavigation(event: MouseEvent, wsInfo?: Workspace) {
    event.stopPropagation();
    event.preventDefault();

    let wsId = 'my';
    let wsName = this.translateService.instant('msg.comm.menu.space.private');
    if (wsInfo) {
      wsId = wsInfo.id;
      wsName = wsInfo.name;
    }

    // 데이터 초기화
    this.isShowFolderNavi = (this._selectedWorkspace && this._selectedWorkspace.id === wsId) ? !this.isShowFolderNavi : true;
    if (wsInfo) {
      this._selectedWorkspace = wsInfo;
    } else {
      this._selectedWorkspace = new Workspace();
      this._selectedWorkspace.id = wsId;
      this._selectedWorkspace.name = wsName;
      this._selectedWorkspace.active = true;
    }
    this.folderStructure = [];
    this.folderNavigation = [];

    // 데이터 조회
    if (this.isShowFolderNavi) {
      this.loadingShow();
      if (wsId) {
        this.workspaceService.getWorkSpace(wsId, 'forDetailView')
          .then(item => this._afterExploreNavigation(wsName, item))
          .catch(err => this.commonExceptionHandler(err));
      } else {
        this.workspaceService.getMyWorkspace('forDetailView')
          .then(item => this._afterExploreNavigation(wsName, item))
          .catch(err => this.commonExceptionHandler(err));
      }
    }
  } // function - onOffFolderNavigation

  /**
   * 특정 폴더의 하위 내용을 탐색한다.
   * @param {MouseEvent} event
   * @param {Book} bookItem
   * @param {number} idx
   */
  public exploreFolderNavigation(event: MouseEvent, bookItem: Book, idx: number) {
    // 이벤트 전파 방지
    event.stopPropagation();
    event.preventDefault();

    // 현재 선택된 Depth 이후의 정보는 삭제함
    this.loadingShow();
    this.folderStructure.splice(idx + 1);
    this.folderNavigation.splice(idx + 1);

    // 폴더 하위 내용 조회
    this.workspaceService.getFolder(bookItem.id, 'forListWithWorkspaceView')
      .then(item => this._afterExploreNavigation(bookItem.name, item))
      .catch(err => this.commonExceptionHandler(err));
  } // function - exploreFolderNavigation

  /**
   * 해당 메뉴로 이동
   */
  public move(menu: string, extras?: NavigationExtras) {
    if (this.router.url !== '/' + menu) {
      this.loadingShow();

      if (extras) {
        this.router.navigate([menu], extras).then();
      } else {
        this.router.navigate([menu]).then();
      }

      this._closeLNB();
    }
  } // function - move

  public moveExtension(ext: Extension, subKey: string) {
    if (ext.subContents[subKey].startsWith('http')) {
      this.move('external/' + ext.parent + '_' + ext.name + '_' + subKey);
    } else {
      this.move(ext.subContents[subKey]);
    }
  }

  public moveExtensionFromSubMenu(ext: Extension, parent: Extension) {
    if (ext.openTarget !== undefined && ext.route !== undefined) {
      switch (ext.openTarget) {
        case 'frame' :
          this.move('external/' + parent.parent + '_' + parent.name + '_' + ext.name);
          break;
        case 'blank' :
          window.open(ext.route, '_blank')
          break;
        default :
          this.move(ext.subContents[ext.name]);
          break;
      }
    }
  }

  public extensionPermission(ext: Extension): boolean {
    if (ext.permissions && ext.permissions.length > 0) {
      const cookiePermission: string = CommonUtil.getCurrentPermissionString();
      return ext.permissions.some(permission => cookiePermission.indexOf(permission) > -1);
    } else {
      return true;
    }
  }

  public getExtensions(parent: string): Extension[] {
    const extensions = CommonService.extensions.filter(item => parent === item.parent);
    if (parent === 'ROOT') {
      return extensions.filter(rootExtension => CommonService.extensions.filter(item => rootExtension.name === item.parent).length > 0);
    } else {
      return extensions;
    }
  }

  public isExtensionSelected(parent: string, name: string): boolean {
    return this.lnbManager[parent][name] !== undefined && this.lnbManager[parent][name]['fold'] === false;
  }

  /**
   * 메뉴얼 다운로드
   */
  public downloadManual() {
    const browserLang: string = this.translateService.getBrowserLang();
    const lang: string = browserLang.match(/en/) ? 'en' : 'ko';
    this.commonService.downloadManual(lang);
  } // function - downloadManual

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 네비게이션에서의 정보 조회 이후 작업
   * @param {string} parentName
   * @param folderInfo
   * @private
   */
  private _afterExploreNavigation(parentName: string, folderInfo) {
    if (folderInfo) {
      this.folderNavigation.push(parentName);
      folderInfo.books.forEach(item => item.parent = folderInfo);
      this.folderStructure.push(folderInfo.books);
      this.loadingHide();
    }
  } // function - _afterExploreNavigation

  /**
   * 개인 워크스페이스 조회
   * @private
   */
  private _getPrivateWorkspace() {
    const workspace = this.cookieService.get(CookieConstant.KEY.MY_WORKSPACE);
    if (StringUtil.isEmpty(workspace)) {
      // 개인 워크스페이스 조회
      this.workspaceService.getMyWorkspace().then((wsInfo) => {
        // 개인 워크스페이스 초기화
        this.privateWorkspace = null;

        if (wsInfo) {
          this.cookieService.set(CookieConstant.KEY.MY_WORKSPACE, JSON.stringify(wsInfo), 0, '/');
          // 데이터 저장
          this.privateWorkspace = wsInfo;

          // 공유 워크스페이스 조회 호출
          this._getSharedWorkspace();
        }
      });
    } else {
      this.privateWorkspace = JSON.parse(workspace);
      this._getSharedWorkspace();
    }

  } // function - _getPrivateWorkspace

  /**
   * 공유 워크스페이스 조회 api
   * @private
   */
  private _getSharedWorkspace() {
    // 공유 워크스페이스 조회
    this.workspaceService.getSharedFavoriteWorkspaces('default')
      .then((workspaces) => {
        // 공유 워크스페이스 데이터 초기화
        this.list = [];

        // 데이터 존재 시
        if (workspaces['_embedded']) {
          // 데이터 저장
          this.list = workspaces['_embedded']['workspaces'];
        }

        // 즐겨찾기 리스트
        this._getFavoriteList();
      });
  } // function - _getSharedWorkspace

  /**
   * 즐겨찾기 리스트 조회
   * @private
   */
  private _getFavoriteList() {
    // 공유 스페이스 리스트 초기화
    this.sharedWorkspace = [];

    // 즐겨찾기 토글 ON | OFF
    if (this.isFavorFl) {
      this.list.forEach((item) => {
        // 즐겨찾기 상태가 true 라면
        if (item.favorite) {
          this.sharedWorkspace.push(item);
        }
      });
    } else {
      // deep copy
      this.sharedWorkspace = Object.assign([], this.list);
    }
  } // function - _getFavoriteList

  /**
   * LNB를 닫는다.
   * @private
   */
  private _closeLNB() {
    this.isShow = false;
    this.isShowFolderNavi = false;
  } // function - _closeLNB


  public popupManual() {
    const browserLang: string = this.translateService.getBrowserLang();
    if (browserLang.match(/ko/)) {
      window.open('https://metatron-app.github.io/metatron-doc-discovery/', '_blank');
    } else {
      window.open('https://metatron-app.github.io/metatron-doc-discovery/en', '_blank');
    }
  }
}
