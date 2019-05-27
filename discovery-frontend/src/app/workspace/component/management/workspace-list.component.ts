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
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { AbstractComponent } from '../../../common/component/abstract.component';
import { WorkspaceService } from '../../service/workspace.service';
import { CreateWorkspaceComponent } from './create-workspace.component';
import { Page } from '../../../domain/common/page';
import { Workspace, PermissionChecker } from '../../../domain/workspace/workspace';
import { Alert } from '../../../common/util/alert.util';
import { ConfirmModalComponent } from '../../../common/component/modal/confirm/confirm.component';
import { Modal } from '../../../common/domain/modal';
import { CookieConstant } from '../../../common/constant/cookie.constant';
import { EventBroadcaster } from '../../../common/event/event.broadcaster';
import { SYSTEM_PERMISSION } from '../../../common/permission/permission';
import { CommonUtil } from '../../../common/util/common.util';

@Component({
  selector: 'app-workspace-list',
  templateUrl: './workspace-list.component.html',
})
export class WorkspaceListComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 현재 워크스페이스 아이디
  private workspaceId: string;

  // 변경된 사항 체크 flag
  private updateFl: boolean = false;

  @ViewChild('inputSearch')
  private _inputSearch: ElementRef;

  // 공유 워크스페이스 생성 modal
  @ViewChild(CreateWorkspaceComponent)
  public createWorkspaceComp: CreateWorkspaceComponent;

  // 확인 모달 팝업
  @ViewChild(ConfirmModalComponent)
  private confirmModalComponent: ConfirmModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Output()
  public updateComplete = new EventEmitter();

  public isFavorFl: boolean = false;            // 즐겨찾기 플래그
  public isMyWokrspaceFl: boolean = false;      // 내 워크스페이스 플래그
  public isOpenWorkspaceFl: boolean = false;    // 전체공개 워크스페이스 여부

  // 팝업 플래그
  public isShow: boolean = false;

  // 공유 워크스페이스 리스트
  public sharedWorkspace: Workspace[] = [];
  public cntAllWorkspaces:number = 0;

  // 정렬
  public sort = [
    { name: this.translateService.instant('msg.comm.ui.list.name.asc'), value: 'name,asc', selected: true },
    { name: this.translateService.instant('msg.comm.ui.list.name.desc'), value: 'name,desc', selected: false }
  ];

  // 정렬 선택 값
  public sortText = this.sort[0];

  // 검색어
  public searchText = '';

  // 정렬 플래그
  public isSortFl: boolean = false;

  // 조회 프로젝션
  public params = '';

  // Page
  public page: Page = new Page();

  // 관리자 여부
  public sharedWorkspaceManager: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private broadCaster: EventBroadcaster,
              protected renderer: Renderer2,
              protected element: ElementRef,
              protected injector: Injector,
              private workspaceService: WorkspaceService,) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
    this.renderer.removeStyle(document.body, 'overflow');
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // init
  public init(workspaceId?: string) {

    // 초기 hidden 처리
    this.renderer.setStyle(document.body, 'overflow', 'hidden');

    // 초기화
    this.reset();
    // 팝업 열기
    this.isShow = true;
    // 접속한 워크스페이스 아이디
    this.workspaceId = workspaceId;
    // 관리자 여부
    this.sharedWorkspaceManager = CommonUtil.isValidPermission(SYSTEM_PERMISSION.MANAGE_SHARED_WORKSPACE);
    // 공유 워크스페이스 조회
    this.getSharedWorkspace(0);
  }

  /**
   * 공유 워크스페이스 조회 api
   * @param {number} pageNum
   */
  public getSharedWorkspace(pageNum?: number) {
    // 로딩 show
    this.loadingShow();

    ('undefined' !== typeof pageNum) && (this.page.page = pageNum);

    const params = {
      size: this.page.size,
      page: this.page.page,
      sort: this.sortText.value
    };

    (this.isMyWokrspaceFl) && (params['myWorkspace'] = true);   // 내 워크스페이스 만
    (this.isFavorFl) && (params['onlyFavorite'] = true);        // 즐겨찾기
    (this.isOpenWorkspaceFl) && (params['published'] = true);    // 공개 워크스페이스 만

    // 검색
    if (this.searchText !== '') {
      this.searchText = this.searchText.trim();
      params['nameContains'] = this.searchText;
    }

    // 페이지가 첫번째면
    (0 === this.page.page) && (this.sharedWorkspace = []);

    // 공유 워크스페이스 조회
    this.workspaceService.getSharedWorkspaces('forListView', params).then((workspaces) => {

      // page 객체 저장
      this.pageResult = workspaces['page'];
      this.cntAllWorkspaces = this.pageResult.totalElements;

      // 결과가 있을 경우
      if (workspaces['_embedded']) {
        // 리스트에 추가
        this.sharedWorkspace = this.sharedWorkspace.concat(workspaces['_embedded']['workspaces']);
        this.page.page += 1;
      }

      // 로딩 hide
      this.loadingHide();
    }).catch(() => {
      // alert
      Alert.error(this.translateService.instant('msg.space.alert.retrieve'));
      // 로딩 hide
      this.loadingHide();
    });
  }

  // 공유 워크스페이스 생성 이벤트
  public createWorkspace() {
    this.createWorkspaceComp.init();
  }

  /**
   * 즐겨찾기 워크스페이스 필터 On/Off
   */
  public filterFavoriteWorkspace() {
    this.isFavorFl = !this.isFavorFl;   // 즐겨찾기 토글
    this.getSharedWorkspace(0);         // 워크스페이스 조회
  } // function - filterFavoriteWorkspace

  /**
   * 전체 공개 워크스페잇 필터 On/Off
   */
  public filterOpenWorkspace() {
    this.isOpenWorkspaceFl = !this.isOpenWorkspaceFl;   // 플래그 토글
    this.getSharedWorkspace(0);  // 워크스페이스 조회
  } // function - filterOpenWorkspace

  /**
   * Owner 워크스페이스 필터 On/Off
   */
  public filterOwnWorkspaces() {
    this.isMyWokrspaceFl = !this.isMyWokrspaceFl;   // 플래그 토글
    this.getSharedWorkspace(0);                     // 워크스페이스 조회
  } // function - filterOwnWorkspaces

  // 공유 워크스페이스 즐겨찾기 이벤트
  public favoriteEvent(workspace: Workspace) {
    workspace.favorite = !workspace.favorite;

    // 즐겨찾기 요청
    if (workspace.favorite) {
      this.setFavorite(workspace);
    } else {
      this.deleteFavorite(workspace);
    }
  }

  /**
   * 검색 조회 - 키보드 이벤트
   * @param {KeyboardEvent} event
   */
  public searchEventPressKey(event: KeyboardEvent) {
    (13 === event.keyCode) && (this.searchEvent());
  } // function - searchEventPressKey

  /**
   * 검색 조회
   */
  public searchEvent() {
    this.searchText = this._inputSearch.nativeElement.value;    // 검색어 설정
    this.getSharedWorkspace(0);   // 워크스페이스 조회
  } // function - searchEvent

  /**
   * 검색어 리셋
   */
  public resetSearchText(isClear: boolean) {
    if (isClear) {
      this._inputSearch.nativeElement.value = '';
    } else {
      // 검색어 설정
      this._inputSearch.nativeElement.value = this.searchText;
    }
  } // function - resetSearchText

  // 정렬 조회
  public selectSort(item: any) {
    this.sort.forEach((value) => {
      value.selected = false;
    });

    // 정렬
    this.sortText = item;
    item.selected = true;

    this.getSharedWorkspace(0);     // 워크스페이스 조회
  }

  // 닫기
  public close() {
    this.isShow = false;
    this.renderer.removeStyle(document.body, 'overflow');
    this.updateComplete.emit(this.updateFl);
  }

  /**
   * 해당 워크스페이스로 이동
   * @param {Workspace} workspace
   */
  public moveWorkspace(workspace?: Workspace) {
    if (workspace && !workspace.active) {
      const modal = new Modal();
      modal.name = this.translateService.instant('msg.space.alert.workspace.disabled');
      modal.description = this.translateService.instant('msg.space.alert.workspace.disabled.desc');
      modal.subDescription = this.translateService.instant('msg.space.alert.workspace.disabled.desc.sub');
      modal.isShowCancel = false;
      modal.btnName = this.translateService.instant('msg.comm.ui.ok');
      modal.data = {
        type: 'INACTIVE',
        afterConfirm: function () {
        }
      };
      this.confirmModalComponent.init(modal);
    } else {
      // 활성 워크스페이스 경우
      this.isShow = false;
      this.renderer.removeStyle(document.body, 'overflow');

      this.cookieService.delete(CookieConstant.KEY.CURRENT_WORKSPACE, '/');  // 쿠키 삭제

      const workspaceId: string = (workspace) ? workspace.id : '';
      let navigateInfo: string[] = [];
      if (workspaceId) {
        navigateInfo = ['/workspace', workspaceId];
      } else {
        navigateInfo = ['/workspace'];
      }

      if (navigateInfo.includes('/workspace') && this.router.url === navigateInfo.join('/')) {
        this.broadCaster.broadcast('moveFromLnb', workspaceId);
      } else {
        this.router.navigate(navigateInfo).then(); // 이동
      }
    }

  } // function - moveWorkspace

  /**
   * 워크스페이스 삭제
   * @param {MouseEvent} event
   * @param {string} workspaceId
   */
  public removeWorkspace(event: MouseEvent, workspaceId: string) {
    event.stopPropagation();
    event.preventDefault();

    // 컨텐츠 있을 때만 동작
    if ('' !== workspaceId) {
      const modal = new Modal();
      modal.name = this.translateService.instant('msg.space.ui.del.workspace.del.title');
      modal.description = this.translateService.instant('msg.space.ui.del.workspace.del.description');
      modal.subDescription = this.translateService.instant('msg.comm.ui.del.description');
      modal.data = { eventType: 'DELETE', target: workspaceId };
      this.confirmModalComponent.init(modal);
    }


  } // function - removeWorkspace

  /**
   * 모달 팝업에 대한 이벤트 처리
   * @param {Modal} modal
   */
  public onModalConfirm(modal: Modal) {
    switch (modal.data.eventType) {
      case 'DELETE' :
        this.loadingShow();
        this.workspaceService.deleteWorkspace(modal.data.target).then(() => {
          this.loadingHide();
          Alert.success(this.translateService.instant('msg.space.alert.del.workspace.success'));
          this.getSharedWorkspace(0);  // 공유 워크스페이스 조회
        }).catch(() => {
          this.loadingHide();
          Alert.error(this.translateService.instant('msg.space.alert.del.workspace.fail'));
        });
        break;
    }
  } // function - onModalConfirm

  /**
   * 권한 확인기 객체를 반환함
   * @param {Workspace} workspace
   * @returns {PermissionChecker}
   */
  public getPermissionChecker(workspace: Workspace): PermissionChecker {
    return new PermissionChecker(workspace);
  } // function - getPermissionChecker

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 즐겨찾기 요청 api
  private setFavorite(workspace: Workspace) {
    // 로딩 show
    this.loadingShow();

    this.workspaceService.setFavorite(workspace.id).then(() => {
      this.updateFl = true;
      // 로딩 hide
      this.loadingHide();
    }).catch(() => {
      // alert
      Alert.error(this.translateService.instant('msg.space.alert.add.favor'));
      // 로딩 hide
      this.loadingHide();
    });
  }

  // 즐겨찾기 해제 api
  private deleteFavorite(workspace: Workspace) {
    // 로딩 show
    this.loadingShow();

    this.workspaceService.deleteFavorite(workspace.id).then(() => {
      this.updateFl = true;
      // 로딩 hide
      this.loadingHide();
    }).catch(() => {
      // alert
      Alert.error(this.translateService.instant('msg.space.alert.del.favor'));
      // 로딩 hide
      this.loadingHide();
    });
  }


  // 초기화
  private reset() {
    this.isShow = false;              // 팝업 플래그
    this.isFavorFl = false;           // 즐겨찾기 플래그
    this.isMyWokrspaceFl = false;     // 내 워크스페이스 플래그
    this.isOpenWorkspaceFl = false;   // 전체공개 플래그
    this.updateFl = false;            // 업데이트 플래그

    // 공유 워크스페이스 리스트
    this.sharedWorkspace = [];
    this.cntAllWorkspaces = 0;
    // 정렬 선택 값
    this.sortText = this.sort[0];
    // 검색어
    this.searchText = '';
    // 정렬 플래그
    this.isSortFl = false;
    // 조회 프로젝션
    this.params = '';
    // 현재 워크스페이스 아이디
    this.workspaceId = null;
    // page 설정
    this.page.page = 0;
    this.page.size = 20;
  }
}
