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

import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '../common/component/abstract.component';
import {CreateWorkbookComponent} from '../workbook/component/create-workbook/create-workbook.component';
import {CountByBookType, PermissionChecker, PublicType, Workspace} from '../domain/workspace/workspace';
import {WorkspaceService} from './service/workspace.service';
import {ActivatedRoute} from '@angular/router';
import {Book} from '../domain/workspace/book';
import {UserProfile} from '../domain/user/user-profile';
import {DatasourceComponent} from './component/etc/data-source.component';
import {SharedMemberComponent} from './component/permission/shared-member.component';
import {UpdateWorkspaceComponent} from './component/management/update-workspace.component';
import {DeleteWorkspaceComponent} from './component/management/delete-workspace.component';
import {WorkspaceListComponent} from './component/management/workspace-list.component';
import {Modal} from '../common/domain/modal';
import {WorkbookService} from '../workbook/service/workbook.service';
import {Alert} from '../common/util/alert.util';
import {Folder, Hirearchies} from '../domain/workspace/folder';
import {CommonUtil} from '../common/util/common.util';
import {Workbook} from '../domain/workbook/workbook';
import {CommonConstant} from '../common/constant/common.constant';
import {CreateNotebookComponent} from '../notebook/component/create-notebook/create-notebook.component';
import {SharedMemberManageComponent} from './component/permission/shared-member-manage.component';
import {SubscribeArg} from '../common/domain/subscribe-arg';
import {PopupService} from '../common/service/popup.service';
import {SetNotebookServerComponent} from './component/etc/set-notebook-server.component';
import {isNullOrUndefined} from 'util';
import {CookieConstant} from '../common/constant/cookie.constant';
import {DashboardService} from '../dashboard/service/dashboard.service';
import {EventBroadcaster} from '../common/event/event.broadcaster';
import {PageResult} from '../domain/common/page';
import {ChangeOwnerWorkspaceComponent} from './component/management/change-owner-workspace.component';
import {WorkspacePermissionSchemaSetComponent} from './component/permission/workspace-permission-schema-set.component';
import {ImplementorType, JdbcDialect} from '../domain/dataconnection/dataconnection';
import * as _ from 'lodash';
import {StorageService} from "../data-storage/service/storage.service";

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html'
})
export class WorkspaceComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크북 생성 컴포넌트
  @ViewChild(CreateWorkbookComponent)
  private createWorkbookComponent: CreateWorkbookComponent;

  // 워크스페이스 수정 컴포넌트
  @ViewChild(UpdateWorkspaceComponent)
  private updateWorkspaceComponent: UpdateWorkspaceComponent;

  // 워크스페이스 삭제 컴포넌트
  @ViewChild(DeleteWorkspaceComponent)
  private deleteWorkspaceComponent: DeleteWorkspaceComponent;

  // 데이터소스 뷰 컴포넌트
  @ViewChild(DatasourceComponent)
  private datasourceComponent: DatasourceComponent;

  // 멤버 뷰 컴포넌트
  @ViewChild(SharedMemberComponent)
  private sharedMemberComponent: SharedMemberComponent;

  // 멤버 관리 컴포넌트
  @ViewChild(SharedMemberManageComponent)
  private sharedMemberManageComponent: SharedMemberManageComponent;

  // 워크스페이스 리스트 컴포넌트
  @ViewChild(WorkspaceListComponent)
  private workspaceListComponent: WorkspaceListComponent;

  // 노트북 생성 컴포넌트
  @ViewChild(CreateNotebookComponent)
  private createNotebookComponent: CreateNotebookComponent;

  // 노트북 서버 설정 컴포넌트
  @ViewChild(SetNotebookServerComponent)
  private setNotebookServerComponent: SetNotebookServerComponent;

  // 퍼미션 스키마 설정 컴포넌트
  @ViewChild(WorkspacePermissionSchemaSetComponent)
  private _wsPermSchemaSetComp: WorkspacePermissionSchemaSetComponent;

  // 소유자 변경 컴포넌트
  @ViewChild(ChangeOwnerWorkspaceComponent)
  private _changeOwnerComp: ChangeOwnerWorkspaceComponent;

  // 워크스페이스 쿠키
  private cookieWorkspace: any = {
    viewType: null,
    folderId: null,
    folderHierarchies: null,
    workspaceId: null
  };

  // 저장된 초기 폴더 구조
  private initFolderHierarchies: Hirearchies[];

  // 커넥션 타입 목록
  private _connTypeList: JdbcDialect[] = [];

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크 스페이스 데이터
  public workspace: Workspace;
  // 폴더 데이터
  public folder: Folder;

  // 워크스페이스 이름
  public workspaceName: string;

  // 워크스페이스 설명
  public workspaceDescription: string;

  // 워크스페이스 컨텐츠
  public countByBookType: CountByBookType;

  // 워크스페이스 멤버
  public countByMemberType: { user: number, group: number };

  // 데이터소스 수
  public countOfDataSources: number;

  // 워크스페이스 소유자
  public owner: UserProfile;

  // 워크스페이스 아이디
  public workspaceId: string;

  // 최근 폴더 아이디
  public currentFolderId: string;

  // 루트인지
  public isRoot = true;

  // 공유 워크스페이스인지
  public isShareType: boolean = false;

  // 필터 보이기/감추기
  public contentFilter: any[];
  // 선택한 필터 키
  public selectedContentFilter: any;

  // 정렬
  public contentSort: any[];
  // 선택한 정렬 키
  public selectedContentSort: any;

  // 공유 멤버
  public member: any[] = [];

  // 뷰 선택 플래그
  public isInfoType: string = null;

  // 체크박스로 선택한 컨텐츠
  public checkContents: Book[] = [];

  // 모든 체크박스 선택
  public isAllChecked: boolean = false;

  public isDisableMoveContent: boolean = true;   // 이동 컨텐츠를 이용할 수 있는지 여부
  public isCheckedWorkbook: boolean = false;     // 워크북이 체크되었는지 여부

  // 컨텐츠 이동 대상 위치 후보
  public moveCandidateLoc: Workspace | Folder = new Workspace;

  // 이동가능한 폴더 아이디
  public moveTargetWorkspaceId: string;
  public moveTargetFolderId: string;
  public pageAvailableSpaces: PageResult = new PageResult();

  // notebook
  public notebookStep: string;
  // workbench
  public workbenchStep: string;

  // 컨텐츠 이동 선택 플래그
  public moveSelectionFl: boolean = false;

  // 뷰타입 LIST, CARD
  public viewType = 'CARD';

  // 이동 가능한 워크스페이스 목록
  public importAvailWorkspaces: Workspace[];

  // 워크스페이스 메뉴 레이어 표시 여부
  public isShowMenuLayer: boolean = false;

  // 검색어
  public srchText: string = '';

  // 권한 확인기
  public permissionChecker: PermissionChecker;

  // 노트북 서버 설정 여부
  public isSetNotebookServer: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private broadCaster: EventBroadcaster,
              private workspaceService: WorkspaceService,
              private workbookService: WorkbookService,
              private dashboardService: DashboardService,
              private activatedRoute: ActivatedRoute,
              private popupService: PopupService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 초기화 함수
   */
  public ngOnInit() {

    // Init
    super.ngOnInit();

    // 커넥션 타입 목록 저장
    this._connTypeList = StorageService.connectionTypeList;

    // Router에서 파라미터 전달 받기
    this.activatedRoute.params.subscribe((params) => {
      this._initViewPage(params['id'], params['folderId']);
    });

    // 워크벤치 생성 step 구독
    const popupSubscription = this.popupService.view$.subscribe((data: SubscribeArg) => {
      this.workbenchStep = data.name;

      // 워크벤치 생성 완료
      if (data.name === 'create-workbench') {
        // 재조회
        this.detailPage(data.data, 'workbench');
      }
    });
    this.subscriptions.push(popupSubscription);

    // 글로벌 이벤트 리스너 - 워크스페이스 폴더 이동
    this.subscriptions.push(
      this.broadCaster.on<string>('moveFromLnb').subscribe(workspaceId => {
        this._initViewPage('my' === workspaceId ? null : workspaceId);
      })
    );
    // 글로벌 이벤트 리스너 - 퍼미션 스키마 변경
    this.subscriptions.push(
      this.broadCaster.on<string>('CHANGE_WORKSPACE_PERMS_SCHEMA').subscribe(() => {
        this.loadWorkspace(true).then(() => {
          this._wsPermSchemaSetComp.init(this.workspace);
        });
      })
    );

  } // function - ngOnInit

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 워크벤치 커넥션 타입 아이콘 경로
   * @param book
   */
  public getWorkbenchConnTypeIcon(book: Book): string {
    if (isNullOrUndefined(this._connTypeList) || 0 === this._connTypeList.length) {
      this._connTypeList = StorageService.connectionTypeList;
    }
    const connType = this.getConnType(book);
    return this.getConnImplementorGrayImgUrl(
      connType,
      this._connTypeList.find(item => item.implementor === connType).iconResource3
    );
  } // function - getWorkbenchConnTypeIcon

  /**
   * 데이터를 검색한다.
   * @param {Event} event
   */
  public searchData(event: KeyboardEvent) {
    if (13 === event.keyCode) {
      this.srchText = event.target['value'].trim();
      this._updateStateSelectAll();
    }
  } // function - searchData

  /**
   * 검색어를 지움
   */
  public clearSrchText() {
    this.srchText = '';
    this._updateStateSelectAll();
  } // function - clearSrchText

  /**
   * 워크스페이스 폴더 조회
   * @return {Promise<any>}
   */
  public getWorkspaceFolder(): Promise<any> {
    return new Promise((resolve) => {
      // root
      this.isRoot = false;
      // 셀렉트 상태 초기화
      this.checkReset();

      // 로딩 show
      this.loadingShow();

      // 내부 워크스페이스 폴더인 경우
      this.workspaceService.getFolder(this.currentFolderId, 'forListWithWorkspaceView')
        .then((folder) => {
          // 홀더 저장
          this.folder = folder;
          // 저장된 폴더 구조 추적
          this._traceFolderHierarchies();
          // 로딩 hide
          (this.initFolderHierarchies) || (this.loadingHide());
          // 실행 종료 처리
          resolve();
        })
        .catch(() => {
          // 실패 알림
          Alert.error(this.translateService.instant('msg.space.alert.folder.retrieve'));
          // 로딩 hide
          this.loadingHide();
        });
    });
  } // function - getWorkspaceFolder

  // 즐겨찾기 요청 api
  public setFavorite() {

    // loading
    this.loadingShow();

    if (this.workspace.favorite) {
      this.workspaceService.deleteFavorite(this.workspaceId)
        .then(() => {
          // 즐겨찾기 상태 제거
          this.workspace.favorite = false;
          // 로딩 hide
          (this.initFolderHierarchies) || (this.loadingHide());
        })
        .catch(() => {
          // 실패 알림
          Alert.error(this.translateService.instant('msg.space.alert.del.favor'));
          // 로딩 hide
          (this.initFolderHierarchies) || (this.loadingHide());
        });
    } else {
      this.workspaceService.setFavorite(this.workspaceId)
        .then(() => {
          // 즐겨찾기 상태 추가
          this.workspace.favorite = true;
          // 로딩 hide
          (this.initFolderHierarchies) || (this.loadingHide());
        })
        .catch(() => {
          // 실패 알림
          Alert.error(this.translateService.instant('msg.space.alert.add.favor'));
          // 로딩 hide
          (this.initFolderHierarchies) || (this.loadingHide());
        });
    }
  }

  /**
   * 컨텐츠 이동 api
   * @param {MouseEvent} event
   */
  public moveContents(event: MouseEvent) {
    event.stopPropagation();

    if (this.currentFolderId === this.moveTargetFolderId
      || (!this.currentFolderId && 'ROOT' === this.moveTargetFolderId && this.workspaceId === this.moveTargetWorkspaceId)) {
      Alert.warning(this.translateService.instant('msg.space.alert.mov.currentdisable'));
      return;
    }

    // book id make
    const bookIds = this.checkContents.map(book => book.id).join(',');

    // 선택한 컨텐츠에 이동할 타겟폴더가 있을 경우
    if (bookIds.indexOf(this.moveTargetFolderId) > -1) {
      Alert.warning(this.translateService.instant('msg.space.alert.mov.disable'));
      return;
    }

    // 로딩 show
    this.loadingShow();

    if (this.isCheckedWorkbook || 'ROOT' === this.moveTargetFolderId) {
      const params = {
        'toWorkspace': this.moveTargetWorkspaceId
      };
      const folderId: string = ('ROOT' !== this.moveTargetFolderId) ? this.moveTargetFolderId : null;

      // 워크북 이동
      this.workbookService.moveWorkbook(bookIds, folderId, params)
        .then(() => this.afterMoveContents())
        .catch((err) => {
          console.error(err);
          // 실패 알림
          Alert.error(this.translateService.instant('msg.space.alert.mov.fail'));
          // 로딩 hide
          (this.initFolderHierarchies) || (this.loadingHide());
        });
    } else {
      // 다른 타입일 경우 이동
      this.workspaceService.changeFolder(bookIds, this.moveTargetFolderId)
        .then(() => this.afterMoveContents())
        .catch((err) => {
          console.error(err);
          // 실패 알림
          Alert.error(this.translateService.instant('msg.space.alert.mov.fail'));
          // 로딩 hide
          (this.initFolderHierarchies) || (this.loadingHide());
        });
    }
  } // function - moveContents

  /**
   * 워크북 복제
   */
  public cloneWorkbooks() {

    // 워크북 단건인지 확인
    if (this.checkContents.length === 1 && this.checkContents[0].type === 'workbook') {
      const srcWorkbook: Book = this.checkContents[0];
      // 로딩 시작
      this.loadingShow();
      this.workbookService.copyWorkbook(srcWorkbook.id).then(() => {
        Alert.success('\'' + srcWorkbook.name + '\' ' + this.translateService.instant('msg.space.alert.copy.workbook.success'));
        this.loadWorkspace(true).then();    // 리스트 재조회
      }).catch(() => {
        // 실패 알림
        Alert.error(this.translateService.instant('msg.space.alert.copy.workbook.fail'));
        // 로딩 hide
        (this.initFolderHierarchies) || (this.loadingHide());
      });
    }
  } // function - cloneWorkbooks

  /**
   * 폴더 이름 수정 - 엔터키를 입력하였을 경우
   * @param {KeyboardEvent} event
   * @param {Book} folder
   */
  public updateFolderNamePressEnter(event: KeyboardEvent, folder: Book) {
    (13 === event.keyCode) && (this.updateFolderName(folder));
  } // function - updateFolderNamePressEnter

  /**
   * 폴더 이름 수정
   */
  public updateFolderName(folder: Book) {
    this.broadCaster.broadcast('CM_CLOSE_LNB');
    folder.name = folder.name.trim(); // 공백제거

    // 공백 체크
    if ('' === folder.name.trim()) {
      Alert.warning(this.translateService.instant('msg.alert.edit.name.empty'));
      return;
    }

    // 이름 길이 체크
    if (150 < CommonUtil.getByte(folder.name.trim())) {
      Alert.warning(this.translateService.instant('msg.alert.edit.name.len'));
      return;
    }

    // 로딩 show
    this.loadingShow();

    this.workbookService.updateBook(folder)
      .then(() => {
        // 리스트 재조회
        this.loadWorkspace(true).then();
      })
      .catch(() => {
        // 실패 알림
        Alert.error(this.translateService.instant('msg.space.alert.edit.folder.fail'));
        // 로딩 hide
        (this.initFolderHierarchies) || (this.loadingHide());
      });
  } // function - updateFolderName

  // noinspection JSMethodCanBeStatic
  /**
   * 폴더 이름 수정 취소
   * @param {Book} folder
   */
  public cancelEditFolderName(folder: Book) {
    folder.edit = false;
    folder.name = folder['orgName'];
  } // function - cancelEditFolderName

  /**
   * 폴더 생성
   */
  public createFolder() {

    if (this.folder && this.folder.hierarchies && 9 <= this.folder.hierarchies.length) {
      Alert.warning(this.translateService.instant('msg.space.warning.can-not-create-11depth-folder'));
      return;
    }

    const param = new Workbook();
    // type 설정
    param.type = 'folder';
    // 이름 설정
    param.name = 'new folder';
    // 워크스페이스 지정
    param.workspace = CommonConstant.API_CONSTANT.API_URL + this.workspaceId;
    // 최상단 폴더가 아니라면
    if (!this.isRoot) {
      param.folderId = this.currentFolderId;
    }

    // 로딩 show
    this.loadingShow();

    // api 호출
    this.workbookService.createWorkbook(param).then((result) => {

      // 리스트 재조회
      // this.isRoot ? this.getSharedWorkspace() : this.getWorkspaceFolder();

      // 셀렉트 상태 초기화
      this.checkReset();

      if (this.isRoot) {
        // 개인 워크스페이스 조회
        this.workspaceService.getWorkSpace(this.workspaceId, 'forDetailView').then((workspace) => {
          // 초기화
          this.workspace = new Workspace;
          this.folder = new Folder;

          // 해당 워크스페이스가 공유인지 개인인지 판단
          this.isShareType = ('SHARED' === workspace.publicType);

          // 워크스페이스 데이터
          this._setWorkspaceData(false, workspace);
          // 저장된 폴더 구조 추적
          this._traceFolderHierarchies();

          // 로딩 hide
          (this.initFolderHierarchies) || (this.loadingHide());

          this.workspace.books.some((book) => {
            if (book.id === result.id) {
              // 폴더 수정 기능 활성
              book.edit = true;
              book['orgName'] = book.name;
              return true;
            }
          });
        }).catch(() => {
          // 실패 알림
          Alert.error(this.translateService.instant('msg.space.alert.retrieve'));
          // 로딩 hide
          (this.initFolderHierarchies) || (this.loadingHide());
        });
      } else {
        // 내부 워크스페이스 폴더인 경우
        this.workspaceService.getFolder(this.currentFolderId, 'forListWithWorkspaceView').then((folder) => {
          // 홀더 저장
          this.folder = folder;
          // 저장된 폴더 구조 추적
          this._traceFolderHierarchies();
          // 로딩 hide
          (this.initFolderHierarchies) || (this.loadingHide());

          this.folder.books.some((book) => {
            if (book.id === result.id) {
              book.edit = true; // 폴더 수정 기능 활성
              book['orgName'] = book.name;
              return true;
            }
          });

        }).catch(() => {
          // 실패 알림
          Alert.error(this.translateService.instant('msg.space.alert.folder.retrieve'));
          // 로딩 hide
          (this.initFolderHierarchies) || (this.loadingHide());
        });
      }
    }).catch(() => {
      // 실패 알림
      Alert.error(this.translateService.instant('msg.space.alert.add.folder.fail'));
      // 로딩 hide
      (this.initFolderHierarchies) || (this.loadingHide());
    });
  } // function - createFolder


  // 워크스페이스 아이디로 워크스페이스 조회
  public getWorkspace() {
    // 폴더 아이디가 있다면
    if (this.currentFolderId != null) {
      // 워크스페이스 폴더 조회
      this.getWorkspaceFolder().then();
    } else {
      // 워크스페이스 조회
      this.getSharedWorkspace().then();
    }
  }

  /**
   * 북 리스트 출력
   * @return {Book[]}
   */
  public getList(): Book[] {
    // 최상단 폴더라면 워크스페이스내 컨텐츠 보여주
    let list: Book[] = this.isRoot ? this.workspace.books : this.folder.books;
    (list) || (list = []);
    if (this.permissionChecker && this.permissionChecker.isWorkspaceGuest()) {
      return list ? list.filter((item: Book) => 'folder' === item.type || 'workbook' === item.type) : [];
    } else {
      return list;
    }
  } // function - getList

  /**
   * 워크북복제 버튼 활성화 체크
   * @returns {boolean}
   */
  public checkBookCopyAvailable(): boolean {
    let result = true;
    // 컨텐츠 수가 1이고 그 타입이 워크북일 경우에만 활성화
    if (this.checkContents.length === 1 && this.checkContents[0].type === 'workbook') {
      result = false;
    }
    return result;
  } // function - checkBookCopyAvailable

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | 폴더 이동관련 Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 이전 폴더로
  public previouseFolder() {
    this.broadCaster.broadcast('CM_CLOSE_LNB');
    // 이전 폴더가 있는지 확인하는 index
    const index = this.folder.hierarchies.length - 2;
    if (index < 0) {
      this.topFolder();
    } else {
      this.detailFolder(this.folder.hierarchies[index].id);
    }
  }

  /**
   * 폴더 이동
   * @param {string} id
   */
  public detailFolder(id: string) {
    this.broadCaster.broadcast('CM_CLOSE_LNB');
    // 현재 폴더 아이디
    this.currentFolderId = id;
    // 폴더 조회
    this.getWorkspaceFolder().then();
  } // function - detailFolder

  /**
   * 최상단 폴더로 이동
   */
  public topFolder() {
    this.broadCaster.broadcast('CM_CLOSE_LNB');
    if (!this.isRoot) {
      // 최상위 폴더 플래그
      this.isRoot = true;
      // 현재 폴더아이디
      this.currentFolderId = null;
      // 워크스페이스 조회
      this.getSharedWorkspace().then();
    }
  } // function - topFolder

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | 컴포넌트간 이벤트 연결 관련 Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 디테일 페이지로 이동
   * @param {string} id
   * @param {string} type
   */
  public detailPage(id: string, type: string) {
    this.broadCaster.broadcast('CM_CLOSE_LNB');

    // 쿠키 저장
    this.setCookie();

    if (type === 'workbook') {
      if (this.permissionChecker && this.permissionChecker.isViewWorkbook()) {
        this.router.navigate(['/workbook/' + id]).then();
      }
    } else if (type === 'notebook') {
      if (this.permissionChecker && this.permissionChecker.isViewNotebook()) {
        this.router.navigate(['/notebook/' + id + '/' + this.workspaceId]).then();
      }
    } else {
      if (this.permissionChecker && this.permissionChecker.isViewWorkbench()) {
        this.router.navigate(['/workbench/' + id]).then();
      }
    }
  } // function - detailPage

  /**
   * 데이터소스 뷰 페이지
   */
  public datasourceView() {
    if (this.isInfoType === 'member' || this.isInfoType === null) {
      this.sharedMemberComponent.close(false);
      this.isInfoType = 'datasource';
      this.datasourceComponent.init(this.workspaceId);
    } else {
      this.datasourceComponent.close();
    }
  }

  // 공유멤버 뷰 페이지
  public sharedMemberView() {
    if (this.isInfoType === 'datasource' || this.isInfoType === null) {
      this.datasourceComponent.close();
      this.isInfoType = 'member';
      this.sharedMemberComponent.init(this.workspace);
    } else {
      this.sharedMemberComponent.close(false);
    }
  }

  /**
   * 공유멤버 관리 페이지
   */
  public sharedMemberManage() {
    this.isInfoType = null;
    this.sharedMemberManageComponent.init(this.workspace);
  } // function - sharedMemberManage

  /**
   * 워크스페이스 리스트 페이지
   */
  public workspaceList() {
    this.workspaceListComponent.init(this.workspaceId);
  } // function - workspaceList

  /**
   * 노트북 서버 설정 페이지
   */
  public setNotebookServer() {
    this.setNotebookServerComponent.init(this.workspaceId, this.workspace.connectors);
  } // function - setNotebookServer

  /**
   * 퍼미션 설정 팝업 오픈
   */
  public openPopupSetPermissionSchema() {
    this._wsPermSchemaSetComp.init(this.workspace);
  } // function - openPopupSetPermissionSchema

  /**
   * 소유자 변경 팝업 오픈
   */
  public openPopupChangeOwner() {
    this._changeOwnerComp.init(this.workspace);
  } // function - openPopupChangeOwner

  /**
   * 워크스페이스 정보 재조회
   * > 공유 워크스페이스에서, 컴포넌트에 의해서 데이터가 변경되었을떄 호출함
   * @param {boolean} completeFl
   */
  public loadWorkspace(completeFl?: boolean): Promise<any> {
    // 업데이트 상태면 재조회
    if (completeFl) {
      // reload workspace data
      if (this.isRoot) {
        if (this.workspaceId == null) {
          return this.getMyWorkspace();
        } else {
          return this.getSharedWorkspace();
        }
      } else {
        if (this.workspaceId == null) {
          return this.workspaceService.getMyWorkspace('forDetailView').then((workspace) => {
            this.workspace = workspace;
            this._setWorkspaceData(true, workspace);
            return this.getWorkspaceFolder();
          });
        } else {
          return this.workspaceService.getWorkSpace(this.workspaceId, 'forDetailView').then((workspace) => {
            this.workspace = workspace;
            this._setWorkspaceData(true, workspace);
            return this.getWorkspaceFolder();
          });
        }
      }
    } else {
      return Promise.resolve();
    }
  } // function - loadWorkspace

  public getConnType(book: Book) {
    return _.get(book, 'contents.connType', ImplementorType.NONE);
  }

  public getConnName(book: Book) {
    return _.get(book, 'contents.connName', '');
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | CRUD 관련 Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 워크스페이스 수정
   */
  public editWorkspace() {
    if (this.permissionChecker && this.permissionChecker.isManageWorkspace()) {
      this.updateWorkspaceComponent.init(this.workspaceId, this.workspaceName, this.workspaceDescription);
    }
  } // function - editWorkspace

  /**
   * 워크스페이스 삭제
   */
  public deleteWorkspace() {
    if (this.permissionChecker && this.permissionChecker.isManageWorkspace()) {
      this.deleteWorkspaceComponent.init(this.workspaceId);
    }
  } // function - deleteWorkspace

  /**
   * 워크북 생성
   */
  public createWorkbook() {
    if (this.permissionChecker
      && (this.permissionChecker.isManageWorkbook()
        || this.permissionChecker.isEditWorkbook(this.loginUserId))) {
      if (this.isRoot) {
        this.createWorkbookComponent.init(this.workspaceId);
      } else {
        this.createWorkbookComponent.init(this.workspaceId, this.folder.id);
      }
    }
  } // function - createWorkbook

  /**
   * 워크벤치 생성
   */
  public createWorkbench() {
    if (this.permissionChecker
      && (this.permissionChecker.isManageWorkbench()
        || this.permissionChecker.isEditWorkbench(this.loginUserId))) {
      this.workbenchStep = 'workbench-create-select';
    }
  } // function - createWorkbench

  /**
   * 노트북 생성
   */
  public createNotebook() {
    if (this.permissionChecker
      && (this.permissionChecker.isManageNotebook()
        || this.permissionChecker.isEditNotebook(this.loginUserId))
      && this.isSetNotebookServer) {
      if (this.isRoot) {
        this.createNotebookComponent.init(this.workspaceId);
      } else {
        this.createNotebookComponent.init(this.workspaceId, this.folder.id);
      }
      /*
            this.loadingShow();
            this.workspaceService.getNotebookServers(this.workspaceId).then((result) => {
              // 데이터가 없다면
              if (!result['_embedded'] || result['_embedded'].connectors.length === 0) {
                const modal = new Modal();
                if (this.permissionChecker && this.permissionChecker.isManageWorkspace()) {
                  // 관리자
                  modal.name = this.translateService.instant('msg.space.ui.set.notebook.title');
                  modal.description = this.translateService.instant('msg.space.ui.create.notebook.warning');
                  modal.btnName = this.translateService.instant('msg.space.btn.set.notebook');
                  modal.data = {eventType: 'CREATE_NOTEBOOK_SET_SERVER'};
                  modal.afterConfirm = () => {
                    // 노트북 서버 설정 팝업 오픈
                    this.setNotebookServer();
                  };
                } else {
                  // 열람자
                  modal.name = this.translateService.instant('msg.space.ui.no.notebook.server');
                  modal.description = this.translateService.instant('msg.space.ui.create.notebook.warning');
                  modal.subDescription = this.translateService.instant('msg.space.ui.ask.space.admin');
                  modal.isShowCancel = false;
                  modal.data = {eventType: 'CREATE_NOTEBOOK'};
                }

                CommonUtil.confirm(modal);

              } else {
                if (this.isRoot) {
                  this.createNotebookComponent.init(this.workspaceId);
                } else {
                  this.createNotebookComponent.init(this.workspaceId, this.folder.id);
                }
              }
              this.loadingHide();
            }).catch(err => this.commonExceptionHandler(err));
      */
    }
  } // function - createNotebook

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | 권한 체크 관련 Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 생성/수정/삭제 에 대한 권한이 있는지 체크한다.
   * @param {Book} book
   * @return {boolean}
   */
  public checkEditAuth(book: Book): boolean {
    let isPossible: boolean = false;
    const bookCreator: string = (book.createdBy) ? book.createdBy.username : '';
    switch (book.type.toUpperCase()) {
      case 'WORKBOOK' :
        isPossible = (this.permissionChecker.isManageWorkbook() || this.permissionChecker.isEditWorkbook(bookCreator));
        break;
      case 'WORKBENCH' :
        isPossible = (this.permissionChecker.isManageWorkbench() || this.permissionChecker.isEditWorkbench(bookCreator));
        break;
      case 'NOTEBOOK' :
        isPossible = (this.permissionChecker.isManageNotebook() || this.permissionChecker.isEditNotebook(bookCreator));
        break;
      case 'FOLDER' :
        isPossible = this.permissionChecker.isManageWsFolder();
    }
    return isPossible;
  } // function - checkEditAuth

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | 체크박스 관련 Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 워크북 생성 후 이동
  public createCompleteWorkBook($event) {
    if ($event.createDashboardFl) {
      sessionStorage.setItem('AFTER_CREATE_WORKBOOK', 'CREATE_DASHBOARD');
    }
    this.router.navigate(['/workbook', $event.id]).then();
  }

  // 멤버 뷰 페이지에서 이동
  public completeMemeber(settingFl: boolean) {
    settingFl ? this.sharedMemberManage() : this.isInfoType = null;
  }

  // 필터 선택이벤트
  public selectedFilter($event) {
    this.selectedContentFilter = $event;
    this._updateStateSelectAll();
  }

  // 정렬 선택이벤트
  public selectedSort($event) {
    this.selectedContentSort = $event;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | 셀렉트 관련 Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 체크박스 체크 이벤트
   * @param {MouseEvent} event
   * @param {Book} book
   */
  public checkEvent(event: MouseEvent, book: Book) {
    this.broadCaster.broadcast('CM_CLOSE_LNB');
    event.stopPropagation();

    if (!book.checked) {
      // 선택된 컨텐츠에 추가
      this.checkContents.push(book);

      // 모든 체크 상태인지 확인
      if (this.isRoot) {
        if (this.checkContents.length === this.workspace.books.length) {
          this.isAllChecked = true;
        }
      } else {
        if (this.checkContents.length === this.folder.books.length) {
          this.isAllChecked = true;
        }
      }
    } else {
      // 모든 체크상태 해제
      this.isAllChecked = false;

      // 선택된 컨텐츠에서 제거
      this.checkContents = this.checkContents.filter(item => (item.id !== book.id));
    }
    book.checked = !book.checked;

    // 이동 가능 여부 체크
    this._checkContentsMoveAvailable();

  } // function - checkEvent

  /**
   * 모든 체크박스 체크 이벤트
   */
  public checkAllEvent() {
    // 모든 체크박스 표시
    this.isAllChecked = !this.isAllChecked;

    // 필터 목록 조회
    let filteredList: Book[] = this._getDisplayItems();

    // 체크 설정
    filteredList.forEach((book: Book) => book.checked = this.isAllChecked);

    // 체크 목록 저장
    if (this.isAllChecked) {
      this.checkContents = Object.assign([], filteredList);
    } else {
      this.checkContents = [];
    }

    // 이동 가능 여부 체크
    this._checkContentsMoveAvailable();
  } // function - checkAllEvent

  /**
   * 컨텐츠 이동 셀렉트 오픈
   */
  public openMoveContents() {
    // 선택한 컨텐츠가 있는지
    if (!this.isDisableMoveContent) {
      // 데이터 초기화
      this.importAvailWorkspaces = [];
      this.moveCandidateLoc = null;
      // 현재 워크스페이스를 기본 값으로 지정
      this.moveTargetWorkspaceId = this.workspace.id;
      if (this.isCheckedWorkbook) {
        this.loadingShow();
        this.importAvailWorkspaces.push(this.workspace);  // 자기 자신을 추가 시킴
        this.loadWorkspaceImportAvailable();  // 이동 가능한 워크스페이스 목록 조회
      } else {
        // deep copy
        this.moveCandidateLoc = Object.assign([], (this.isRoot) ? this.workspace : this.folder);

        // 이동할 곳의 위치 아이디
        this.moveTargetFolderId = this.isRoot ? 'ROOT' : this.moveCandidateLoc.id;

        // 오픈 팝업
        this.moveSelectionFl = true;
      }
    }
  } // function - openMoveContents

  /**
   * 이동 가능한 워크스페이스 목록을 불러옴
   */
  public loadWorkspaceImportAvailable(pageNum: number = 0) {
    let params: any = {
      excludes: this.workspace.id,
      page: pageNum,
      size: CommonConstant.API_CONSTANT.PAGE_SIZE,
      sort: CommonConstant.API_CONSTANT.PAGE_SORT_MODIFIED_TIME_DESC
    };
    this.workspaceService.getWorkspaceImportAvailable(this.checkContents[0].id, params).then(items => {
      if (items) {
        (items['page']) && (this.pageAvailableSpaces = items['page']);
        if (items['_embedded'] && items['_embedded']['workspaces']) {
          this.importAvailWorkspaces = this.importAvailWorkspaces.concat(items['_embedded']['workspaces']);
        }
      }
      this.moveSelectionFl = true;
      this.loadingHide();
    });
  } // function - loadWorkspaceImportAvailable

  /**
   * 컨텐츠를 이동시킬 target location
   * @param {MouseEvent} event
   * @param {Workspace | Folder} item
   * @param {boolean} back
   */
  public selectTargetLocation(event: MouseEvent, item: Workspace | Folder, back?: boolean) {
    event.stopPropagation();
    this.loadingShow();
    if (back) {   // 뒤로가기 버튼이라면
      if (item.hierarchies) {
        const index = item.hierarchies.length - 2;
        if (index < 0) {
          // 최상단 조회
          this.workspaceService.getWorkSpace(this.workspaceId, 'forDetailView')
            .then((workspace) => {
              this.moveCandidateLoc = workspace;
              this.moveTargetFolderId = 'ROOT';
              this.loadingHide();
            });
        } else {
          // 폴더내부인 경우
          this.workspaceService.getFolder(this.moveCandidateLoc.hierarchies[index].id, 'forListView')
            .then((folder) => {
              this.moveCandidateLoc = folder;
              this.moveTargetFolderId = folder.id;
              this.loadingHide();
            });
        }
      } else {
        this.moveCandidateLoc = null;
        this.loadingHide();
      }
    } else {
      if ((<Workspace>item).publicType) {
        // 워크스페이스인 경우
        this.workspaceService.getWorkSpace(item.id, 'forDetailView')
          .then((workspace) => {
            this.moveCandidateLoc = workspace;
            this.moveTargetWorkspaceId = item.id;
            this.moveTargetFolderId = 'ROOT';
            this.loadingHide();
          });
      } else {
        // 폴더내부인 경우
        this.workspaceService.getFolder(item.id, 'forListView')
          .then((folder) => {
            this.moveCandidateLoc = folder;
            this.moveTargetFolderId = folder.id;
            this.loadingHide();
          });
      }
    }
  } // function - selectTargetLocation

  /**
   * 이동 타겟 선택
   * @param {MouseEvent} event
   * @param {string} targetId
   * @param {string} category
   */
  public selectTarget(event: MouseEvent, targetId: string, category: string) {
    event.stopPropagation();
    if (this.isDisableMove(targetId)) {
      return;
    }
    if ('WORKSPACE' === category) {
      this.moveTargetWorkspaceId = targetId;
      this.moveTargetFolderId = 'ROOT';
    } else {
      this.moveTargetFolderId = targetId;
    }
  } // function - selectTarget

  /**
   * 이동 불가 판단
   * @param {string} targetId
   * @returns {boolean}
   */
  public isDisableMove(targetId: string): boolean {
    return (-1 < this.checkContents.findIndex((item: Book) => item.id === targetId));
  } // function - isDisableMove

  /**
   * 컨텐츠 삭제 요청
   * @param {Book} book
   */
  public deleteModalOpen(book: Book) {

    this.broadCaster.broadcast('CM_CLOSE_LNB');

    // 수정 중이었다면 수정 모드 취소
    book.edit = false;

    const modal = new Modal();

    let title: string = '';
    let description: string = '';
    let btnName: string = '';

    switch (book.type) {
      case 'workbook':
        title = this.translateService.instant('msg.book.ui.del.workbook.del.title');
        description = this.translateService.instant('msg.book.ui.del.workbook.del.description');
        btnName = this.translateService.instant('msg.book.ui.del.workbook.btn');
        break;
      case 'notebook':
        title = this.translateService.instant('msg.space.ui.del.notebook.title');
        description = this.translateService.instant('msg.space.ui.del.notebook.description');
        btnName = this.translateService.instant('msg.space.ui.del.notebook.btn');
        break;
      case 'folder':
        title = this.translateService.instant('msg.space.ui.del.folder.title');
        description = this.translateService.instant('msg.space.ui.del.folder.description');
        btnName = this.translateService.instant('msg.space.ui.del.folder.btn');
        break;
      case 'workbench':
        title = this.translateService.instant('msg.space.ui.del.workbench.title');
        description = this.translateService.instant('msg.space.ui.del.workbench.description');
        btnName = this.translateService.instant('msg.space.ui.del.workbench.btn');
        break;
    }

    modal.name = title;
    modal.description = description;
    modal.btnName = btnName;
    modal.subDescription = this.translateService.instant('msg.comm.ui.del.description');
    modal.data = {
      eventType: 'SINGLE_DELETE',
      target: book
    };
    modal.afterConfirm = () => {
      this.deleteBook(modal.data.target);  // 단건 삭제
    };

    CommonUtil.confirm(modal);
  } // function - deleteModalOpen

  /**
   * 일괄삭제 요청
   */
  public deleteMultiModalOpen() {

    // 체크된 아이템 조회
    this.checkContents = Object.assign([], this._getSelectedItems());

    // 컨텐츠 있을 때만 동작
    if (this.checkContents.length > 0) {
      const modal = new Modal();
      modal.name = this.translateService.instant('msg.comm.ui.list.batch.del');
      modal.description = this.translateService.instant('msg.alert.batch.del');
      modal.data = {
        eventType: 'MULTI_DELETE',
        target: this.checkContents
      };
      modal.afterConfirm = (confirmData: Modal) => {
        this.deleteBooks(confirmData.data.target); // 여러건 삭제
      };

      CommonUtil.confirm(modal);
    }
  } // function - deleteMultiModalOpen

  /**
   * 목록 형식을 지정함
   * @param {string} arg
   */
  public setViewType(arg: string) {
    this.viewType = arg;
    this.setCookie();
  } // function - setViewType

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 개인 워크스페이스 조회
   */
  private getMyWorkspace(): Promise<any> {
    // 로딩 show
    this.loadingShow();
    // 개인 워크스페이스 조회
    return this.workspaceService.getMyWorkspace('forDetailView').then((workspace) => {
      if (PublicType.SHARED === workspace.publicType && workspace.published) {
        // 게스트 사용자의 경우 전체 공개 워크스페이스로 강제 이동
        this.router.navigate(['/workspace', workspace.id]).then();
      } else {
        // 워크스페이스 데이터 설정
        this._setWorkspaceData(true, workspace);
        // 저장된 폴더 구조 추적
        this._traceFolderHierarchies();
        // 로딩 hide
        (this.initFolderHierarchies) || (this.loadingHide());
      }

    }).catch(() => {
      // 실패 알림
      Alert.error(this.translateService.instant('msg.space.alert.retrieve'));
      // 로딩 hide
      this.loadingHide();
    });
  } // function - getMyWorkspace

  /**
   * 공유 워크스페이스 조회 api
   * @return {Promise<any>}
   */
  private getSharedWorkspace(): Promise<any> {
    return new Promise(resolve => {
      // 로딩 show
      this.loadingShow();

      // 셀렉트 상태 초기화
      this.checkReset();

      // 개인 워크스페이스 조회
      this.workspaceService.getWorkSpace(this.workspaceId, 'forDetailView')
        .then((workspace) => {
          // 초기화
          this.workspace = new Workspace;
          this.folder = new Folder;

          // 해당 워크스페이스가 공유인지 개인인지 판단
          this.isShareType = (workspace.publicType === 'SHARED');

          // 워크스페이스 데이터 설정
          this._setWorkspaceData(true, workspace);
          // 저장된 폴더 구조 추적
          this._traceFolderHierarchies();

          // 로딩 hide
          (this.initFolderHierarchies) || (this.loadingHide());

          resolve();
        })
        .catch(() => {
          // 실패 알림
          Alert.error(this.translateService.instant('msg.space.alert.retrieve'));
          // 로딩 hide
          (this.initFolderHierarchies) || (this.loadingHide());
        });
    });
  } // function - getSharedWorkspace

  /**
   * 단건 삭제 api
   * @param {Book} deleteData
   */
  private deleteBook(deleteData: Book) {
    // 로딩 show
    this.loadingShow();

    this.workbookService.deleteWorkbook(deleteData.id).then(() => {

      let alert: string = '';
      switch (deleteData.type) {
        case 'workbook':
          alert = this.translateService.instant('msg.book.alert.workbook.del.success');
          break;
        case 'notebook':
          alert = this.translateService.instant('msg.space.alert.notebook.del.success');
          break;
        case 'workbench':
          alert = this.translateService.instant('msg.space.alert.workbench.del.success');
          break;
        case 'folder':
          alert = this.translateService.instant('msg.space.alert.folder.del.success');
          break;
      }

      Alert.success(alert);   // 성공 알림

      // 리스트 재조회
      this.loadWorkspace(true).then();
    }).catch(() => {
      // 실패 알림
      Alert.error(this.translateService.instant('msg.comm.alert.del.fail'));
      // 로딩 hide
      (this.initFolderHierarchies) || (this.loadingHide());
    });
  } // function - deleteBook


  /**
   * 여러건 삭제 api
   * @param {Book[]} books
   */
  private deleteBooks(books: Book[]) {

    // bookId array
    const chunk_size = 5;
    const bookIds = books.map(item => item.id);

    // 호출 건당 5개의 id만 허용하기 때문에 갯수에 맞춰 재배열
    const reqParams = bookIds.map((book, idx) => {
      return 0 === idx % chunk_size ? bookIds.slice(idx, idx + chunk_size).join(',') : null;
    }).filter((ids) => ids);

    // 삭제 API 호출 객체 생성
    const promises = [];
    reqParams.forEach(item => {
      promises.push(this.workbookService.deleteWorkbook(item));
    });

    // 있을 경우에만 서비스 실행
    if (promises.length > 0) {
      // // 로딩 show
      this.loadingShow();
      Promise.all(promises).then(() => {
        // 성공 알림
        Alert.success(this.translateService.instant('msg.alert.batch.del.success'));

        // 선택 정보 초기화
        this.isAllChecked = false;
        this.checkContents = [];

        // 리스트 재조회
        this.loadWorkspace(true).then();
      }).catch(() => {
        // 실패 알림
        Alert.error(this.translateService.instant('msg.alert.batch.del.fail'));
        // 로딩 hide
        (this.initFolderHierarchies) || (this.loadingHide());
      });
    }
  } // function - deleteBooks

  // 처음 진입시 워크스페이스 분기점
  private getWorkspaceData() {

    // 초기화
    this.workspace = new Workspace;
    this.folder = new Folder;
    this.datasourceComponent.isShow = this.datasourceComponent.isShow === true ? false : null;
    this.sharedMemberComponent.isShow = this.sharedMemberComponent.isShow === true ? false : null;

    // 컨텐츠 초기화
    this.checkReset();

    // 워크스페이스 아이디를 가지고 왔는지 여부
    if (this.workspaceId == null) {
      // 개인 워크스페이스 조회
      this.getMyWorkspace();
    } else {
      // 아이디로 워크스페이스 조회
      this.getWorkspace();
    }
  }

  // 쿠키 조회
  private getCookie() {
    // 쿠키 조회
    const cookieWs = this.cookieService.get(CookieConstant.KEY.CURRENT_WORKSPACE);
    let cookieWorkspace = null;
    if (cookieWs) {
      cookieWorkspace = JSON.parse(cookieWs);
    }
    if (null !== cookieWorkspace) {
      this.viewType = cookieWorkspace['viewType'];
      this.currentFolderId = cookieWorkspace['folderId'];
      this.workspaceId = cookieWorkspace['workspaceId'];
      this.initFolderHierarchies = cookieWorkspace['folderHierarchies'];
      // 쿠키 삭제
      // this.cookieService.delete(CookieConstant.KEY.CURRENT_WORKSPACE);
    }
  }

  // 쿠키 저장
  private setCookie() {
    this.cookieWorkspace.viewType = this.viewType;
    this.cookieWorkspace.folderId = this.isRoot ? null : this.currentFolderId;
    this.cookieWorkspace.folderHierarchies = this.folder.hierarchies;
    this.cookieWorkspace.workspaceId = this.workspace.id;
    this.cookieService.set(CookieConstant.KEY.CURRENT_WORKSPACE, JSON.stringify(this.cookieWorkspace), 0, '/');
  }

  // 체크 컨텐츠 리셋
  private checkReset() {
    this.checkContents = [];
    this.isAllChecked = false;
    this.moveSelectionFl = false;
    this.isDisableMoveContent = true;
    this.isCheckedWorkbook = false;
  }

  /**
   * 워크스페이스 데이터 매핑
   * @param {boolean} loadNbServer
   * @param {Workspace} workspace
   * @private
   */
  private _setWorkspaceData(loadNbServer: boolean, workspace?: Workspace,) {
    if (workspace) {
      if (workspace.active) {
        // 워크스페이스 데이터
        this.workspace = workspace;
        // 워크스페이스 이름
        this.workspaceName = workspace.name;
        // 워크스페이스 설명
        this.workspaceDescription = workspace.description;
        // 워크스페이스 소유자
        this.owner = workspace.owner;
        // 워크스페이스 아이디
        this.workspaceId = workspace.id;
        // 컨텐츠 수
        this.countByBookType = workspace.countByBookType;
        // 멤버 수
        this.countByMemberType = workspace.countByMemberType;
        // 데이터소스 수
        this.countOfDataSources = workspace.countOfDataSources;
        // 퍼미션
        (this.isRoot) && (this.permissionChecker = new PermissionChecker(workspace));

        if (loadNbServer) {
          this.workspaceService.getNotebookServers(this.workspaceId).then((result) => {
            this.isSetNotebookServer = (result['_embedded'] && 0 < result['_embedded'].connectors.length);
          });
        }

      } else {
        // 워크스페이스 이름
        this.workspaceName = workspace.name;
        // 워크스페이스 설명
        this.workspaceDescription = workspace.description;
        // 경고창 표시
        this.openAccessDeniedConfirm();
      }
    }
  } // function - _setWorkspaceData

  /**
   * 저장된 폴더 위치 추적
   * ( 초기 모든 데이터조회의 최종 종착점 )
   * @private
   */
  private _traceFolderHierarchies() {
    if (this.initFolderHierarchies) {
      this.loadingShow();
      setTimeout(() => {
        const tempId = this.initFolderHierarchies.shift().id;
        (0 === this.initFolderHierarchies.length) && (this.initFolderHierarchies = null);
        this.detailFolder(tempId);
      }, 200); // 로딩 표시를 위한 시간 지연
    } else {
      // 목록 상태가 변할때 마다 현재 상태를 쿠키로 저장함
      this.setCookie();
    }
  } //  function - _traceFolderHierarchies

  /**
   * initialize View
   * @param {string} workspaceId
   * @param {string} folderId
   * @private
   */
  private _initViewPage(workspaceId?: string, folderId?: string) {

    // 쿠키 조회
    this.getCookie();

    // initialize Data
    this.workspaceId = (workspaceId) ? workspaceId : undefined;
    this.currentFolderId = (folderId) ? folderId : undefined;

    (isNullOrUndefined(this.workspaceId)) || (this.cookieWorkspace.workspaceId = this.workspaceId);
    (isNullOrUndefined(this.currentFolderId)) || (this.cookieWorkspace.folderId = this.isRoot ? null : this.currentFolderId);

    if (this.viewType === null) {
      this.viewType = 'CARD';
      this.cookieWorkspace.viewType = this.viewType;
    }
    this.cookieService.set(CookieConstant.KEY.CURRENT_WORKSPACE, JSON.stringify(this.cookieWorkspace), 0, '/');
    // 로딩 show
    this.loadingShow();

    {
      // initialize UI Component
      this.isInfoType = null;
      this.workspace = new Workspace();
      this.workspace.books = [];
      this.countByBookType = new CountByBookType();
      this.owner = new UserProfile();
      this.isRoot = true;

      this.contentFilter = [
        {key: 'all', value: this.translateService.instant('msg.comm.ui.list.all')},
        {key: 'workbook', value: this.translateService.instant('msg.comm.ui.list.workbook')},
        {key: 'notebook', value: this.translateService.instant('msg.comm.ui.list.notebook')},
        {key: 'workbench', value: this.translateService.instant('msg.comm.ui.list.workbench')},
      ];
      this.selectedContentFilter = this.contentFilter[0];

      this.contentSort = [
        {key: 'name', value: this.translateService.instant('msg.comm.ui.list.name.asc'), type: 'asc'},
        {key: 'name', value: this.translateService.instant('msg.comm.ui.list.name.desc'), type: 'desc'},
        {key: 'modifiedTime', value: this.translateService.instant('msg.comm.ui.list.update.asc'), type: 'asc'},
        {key: 'modifiedTime', value: this.translateService.instant('msg.comm.ui.list.update.desc'), type: 'desc'},
      ];
      this.selectedContentSort = this.contentSort[3];

      // initialize data
      this.getWorkspaceData();
    }

    // Send statistics data
    if (this.workspaceId && 'my' !== this.workspaceId) {
      this.sendViewActivityStream(this.workspaceId, 'WORKSPACE');
    }

  } // function - _initViewPage

  /**
   * 컨텐츠 이동 후의 처리
   */
  private afterMoveContents() {

    // 성공 알림
    Alert.success(this.translateService.instant('msg.space.alert.mov.success'));

    // 리스트 재조회
    this.loadWorkspace(true).then();

    // 선택 관련 컨텐츠 초기화
    this.checkContents = [];
    this.importAvailWorkspaces = [];
    this.moveTargetFolderId = null;
    this.moveTargetWorkspaceId = null;
    this.isDisableMoveContent = true;
    this.isCheckedWorkbook = false;

    // 이동창 닫기
    this.moveSelectionFl = false;

  } // function - afterMoveContents

  /**
   * 컨텐츠 이동이 가능한지 체크한다
   * @private
   */
  private _checkContentsMoveAvailable() {
    // 워크북 타입이 체크되었는지 확인
    const cntContents = this.checkContents.length;
    if (0 < cntContents) {
      this.isCheckedWorkbook = (-1 < this.checkContents.findIndex(item => item.type === 'workbook'));
      // workbook 타입은 무조건 1개만 이동할 수 있고, workbook 이 아닌 경우 여러개 이동 가능
      this.isDisableMoveContent = (this.isCheckedWorkbook && 1 < cntContents);
    } else {
      this.isDisableMoveContent = true;
      this.isCheckedWorkbook = false;
    }
  } // function - _checkContentsMoveAvailable

  /**
   * 전체 선택 상태를 변경한다.
   * @private
   */
  private _updateStateSelectAll() {
    let filteredList: Book[] = this._getDisplayItems();
    this.isAllChecked = (filteredList.length === filteredList.filter((item: Book) => item.checked).length);
  } // function - _updateStateSelectAll

  /**
   * 화면상에 표시된 아이템 중 선택된 목록 조회
   * @returns {Book[]}
   * @private
   */
  private _getSelectedItems(): Book[] {
    return this._getDisplayItems().filter((item: Book) => item.checked);
  } // function - _getSelectedItems

  /**
   * 화면상에 표시된 아이템 목록 조회
   * @returns {Book[]}
   * @private
   */
  private _getDisplayItems(): Book[] {
    let filteredList: Book[] = [];
    if (this.isRoot) {
      filteredList = this.workspace.books.filter((book: Book) => book.name.toLowerCase().includes(this.srchText.toLowerCase()));
    } else {
      filteredList = this.folder.books.filter((book: Book) => book.name.toLowerCase().includes(this.srchText.toLowerCase()));
    }
    if ('all' !== this.selectedContentFilter.key) {
      filteredList = filteredList.filter((book: Book) => {
        return book.type === this.selectedContentFilter.key || 'folder' === book.type
      });
    }
    return filteredList;
  } // function - _getDisplayItems
}



