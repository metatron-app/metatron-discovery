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

import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {AbstractComponent} from '@common/component/abstract.component';
import {PageResult} from '@domain/common/page';
import {WorkspaceService} from '../../../workspace/service/workspace.service';
import {DatasourceService} from '../../../datasource/service/datasource.service';
import {DataconnectionService} from '@common/service/dataconnection.service';

@Component({
  selector: 'app-set-workspace-published',
  templateUrl: './set-workspace-published.component.html'
})
export class SetWorkspacePublishedComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 연결된 타입
  private linkedType: string;
  private linkedId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 팝업 플래그
  public showFl: boolean = false;

  // mode
  public mode: string;

  @Output()
  public complete = new EventEmitter();

  // personal 검색
  public searchPersonal: string = '';
  // public 검색
  public searchPublic: string = '';

  // tab change
  public tabChange: string = 'PRIVATE';

  // personal workspaces
  public personalWorkspaces: Workspace;

  // public workspaces
  public publicWorkspaces: Workspace;

  // 추가할 워크스페이스 아이디
  public addWorkspaces: any[] = [];
  // 제거할 워크스페이스 아이디
  public deleteWorkspaces: any[] = [];


  // filter workspace
  public filterPersonalFl: boolean = false;
  public filterPublicFl: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private workspaceService: WorkspaceService,
              private datasourceService: DatasourceService,
              private connectionService: DataconnectionService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {

    super.ngOnInit();
  }

  public ngOnDestroy() {

    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 연결된 개인 워크스페이스 수
   * @returns {number}
   */
  public getLinkedPersonalWorkspace(): number {
    let count = 0;

    if (this.mode === 'create') {
      count += this.addWorkspaces.filter((workspace) => {
        return workspace.publicType === 'PRIVATE';
      }).length;
      count -= this.deleteWorkspaces.filter((workspace) => {
        return workspace.publicType === 'PRIVATE';
      }).length;
    } else if (this.mode === 'update' && this.personalWorkspaces.count) {
      count += this.personalWorkspaces.count.linked;
    }

    return count;
  }

  /**
   * 연결된 공유 워크스페이스 수
   * @returns {number}
   */
  public getLinkedPublicWorkspace(): number {
    let count = 0;

    if (this.mode === 'create') {
      count += this.addWorkspaces.filter((workspace) => {
        return workspace.publicType === 'SHARED';
      }).length;
      count -= this.deleteWorkspaces.filter((workspace) => {
        return workspace.publicType === 'SHARED';
      }).length;
    } else if (this.mode === 'update' && this.publicWorkspaces.count) {
      count += this.publicWorkspaces.count.linked;
    }

    return count;
  }

  /**
   * 개인 워크스페이스 전체 수
   * @returns {number}
   */
  public getTotalPersonalWorkspace(): number {
    return this.personalWorkspaces.hasOwnProperty('count') ? this.personalWorkspaces.count.total : 0;
  }

  /**
   * 공유 워크스페이스 전체 수
   * @returns {number}
   */
  public getTotalPublicWorkspace(): number {
    return this.publicWorkspaces.hasOwnProperty('count') ? this.publicWorkspaces.count.total : 0;
  }

  /**
   * 공유 워크스페이스 리스트
   * @returns {any[]}
   */
  public publicWorkspaceList() {
    // 생성모드는 추가할 워크스페이스 리스트만 반환
    if (this.mode === 'create' && this.filterPublicFl) {
      // 공유 워크스페이스와 정렬 된 상태로 리스트
      let result = this.addWorkspaces.filter((workspace) => {
        return workspace.publicType === 'SHARED';
      }).sort((prev, next) => {
        // 내림 차순
        if (this.publicWorkspaces.sort === 'name,desc') {
          return prev.name > next.name ? -1 : prev.name < next.name ? 1 : 0;
        } else {
          return prev.name < next.name ? -1 : prev.name > next.name ? 1 : 0;
        }
      });

      // search
      if (this.searchPublic.trim() !== '') {
        result = result.filter((workspace) => {
          if (workspace.name.toLowerCase().includes(this.searchPublic.toLowerCase().trim())) {
            return workspace;
          }
        });
      }

      return result;
    } else {
      return this.publicWorkspaces.workspace;
    }
  }

  /**
   * 개인 워크스페이스 리스트
   * @returns {any[]}
   */
  public personalWorkspaceList() {
    // 생성모드는 추가할 워크스페이스 리스트만 반환
    if (this.mode === 'create' && this.filterPersonalFl) {
      // 개인 워크스페이스와 정렬 된 상태로 리스트
      let result = this.addWorkspaces.filter((workspace) => {
        return workspace.publicType === 'PRIVATE';
      }).sort((prev, next) => {
        // 내림 차순
        if (this.personalWorkspaces.sort === 'name,desc') {
          return prev.name > next.name ? -1 : prev.name < next.name ? 1 : 0;
        } else {
          return prev.name < next.name ? -1 : prev.name > next.name ? 1 : 0;
        }
      });

      // search
      if (this.searchPersonal.trim() !== '') {
        result = result.filter((workspace) => {
          if (workspace.name.toLowerCase().includes(this.searchPersonal.toLowerCase().trim())) {
            return workspace;
          }
        });
      }

      return result;
    } else {
      return this.personalWorkspaces.workspace;
    }
  }


  /**
   * 생성일때 체크표시가 모두 되있는 상태인지
   * @returns {boolean}
   */
  public checkAllWorkspace(): boolean {
    const result = [];
    if (this.tabChange === 'PRIVATE') {
      this.personalWorkspaceList().forEach((workspace) => {
        this.addWorkspaces.forEach((item) => {
          if (workspace.id === item.id) {
            result.push(item);
          }
        });
      });
      return result.length !== 0 && result.length === this.personalWorkspaceList().length;
    } else {
      this.publicWorkspaceList().forEach((workspace) => {
        this.addWorkspaces.forEach((item) => {
          if (workspace.id === item.id) {
            result.push(item);
          }
        });
      });
      return result.length !== 0 && result.length === this.publicWorkspaceList().length;
    }
  }


  /**
   * init
   * @param {string} linkedType
   * @param {string} mode
   * @param param
   */
  public init(linkedType: string, mode: string, param: any) {
    // 초기화
    this.initView();

    // create or update
    this.mode = mode;

    if (this.mode === 'create') {
      // 데이터
      this.addWorkspaces = Object.assign([], param.addWorkspaces);
      this.deleteWorkspaces = Object.assign([], param.deleteWorkspaces);
    } else {
      // 연결된 아이디
      this.linkedId = param;
    }

    // 호출한 타입
    this.linkedType = linkedType;

    // 로딩 show
    this.loadingShow();
    // 워크스페이스 조회
    Promise.all([this.getWorkspaces('PRIVATE'), this.getWorkspaces('SHARED')])
      .then(() => {
        // 로딩 hide
        this.loadingHide();
      })
      .catch(() => {
        // 로딩 hide
        this.loadingHide();
      });
  }


  /**
   * 닫기 버튼
   */
  public close() {
    this.showFl = false;
  }


  /**
   * 적용 버튼
   */
  public done() {
    this.showFl = false;

    // let result = {
    //   addWorkspaces: this.addWorkspaces,
    //   deleteWorkspaces: this.deleteWorkspaces
    // };

    const result = this.mode === 'create' ? this.addWorkspaces : this.publicWorkspaces.count.linked + this.personalWorkspaces.count.linked;

    // 완료
    this.complete.emit(result);
  }

  /**
   * 체크박스 클릭 이벤트
   * @param workspace
   * @param workspaceType
   */
  public onCheckedWorkspace(workspace, workspaceType) {
    // 생성 모드일경우 addWorkspace 만 사용
    if (this.mode === 'create') {
      this.onCheckWorkspaceInCreateMode(workspace);
    } else {
      this.onCheckWorkspaceInUpdateMode(workspace, workspaceType);
    }
  }


  /**
   * 전체체크박스 클릭 이벤트
   * @param {boolean} checkFl
   * @param {string} mode
   */
  public onCheckAll(checkFl: boolean, mode: string) {
    let index;
    if (mode === 'PRIVATE') {
      // 개인 워크스페이스
      this.personalWorkspaceList().forEach((workspace) => {
        index = this.getFindIndexWorkspace(this.addWorkspaces, workspace.id);

        // 체크된 상태인 경우
        if (checkFl && index !== -1) {
          this.addWorkspaces.splice(index, 1);
        } else if (!checkFl && index === -1) {
          this.addWorkspaces.push(workspace);
        }
      });
    } else {
      // 공유 워크스페이스
      this.publicWorkspaceList().forEach((workspace) => {
        index = this.getFindIndexWorkspace(this.addWorkspaces, workspace.id);

        // 체크된 상태인 경우
        if (checkFl && index !== -1) {
          this.addWorkspaces.splice(index, 1);
        } else if (!checkFl && index === -1) {
          this.addWorkspaces.push(workspace);
        }
      });
    }
  }


  /**
   * 체크표시 여부
   * @param workspace
   * @returns {boolean}
   */
  public checkInWorkspaces(workspace) {
    // workspace id
    const workspaceId = workspace.id;

    // 생성 모드일경우 addWorkspace 만 사용
    if (this.mode === 'create') {
      return this.checkInAddWorkspaces(workspaceId);
    } else {
      // linked 된 워크스페이스 인지
      const linkedFl = workspace.linked;

      // linked 되었지만 변경될 워크스페이스에 없을 경우
      if (linkedFl && !this.checkInAddWorkspaces(workspaceId) && !this.checkInDeleteWorkspaces(workspaceId)) {
        return true;
      }

      return linkedFl ? !this.checkInDeleteWorkspaces(workspaceId) : this.checkInAddWorkspaces(workspaceId);
    }
  }

  /**
   * Changed personal search keyword
   * @param keyword
   */
  public onChangedPersonalSearchKeyword(keyword: string): void {
    // set search keyword
    this.searchPersonal = keyword;
    // search personal workspace
    this.getWorkspaces('PRIVATE');
  }

  /**
   * Changed public search keyword
   * @param keyword
   */
  public onChangedPublicSearchKeyword(keyword: string): void {
    // set search keyword
    this.searchPublic = keyword;
    // search public workspace
    this.getWorkspaces('SHARED');
  }

  /**
   * 정렬 이벤트
   * @param {string} type
   */
  public sort(type: string) {

    if (type === 'PRIVATE') {
      this.personalWorkspaces.sort = this.personalWorkspaces.sort === 'name,desc' ? 'name,asc' : 'name,desc';
      this.personalWorkspaces.page.number = 0;
    } else {
      this.publicWorkspaces.sort = this.publicWorkspaces.sort === 'name,desc' ? 'name,asc' : 'name,desc';
      this.publicWorkspaces.page.number = 0;
    }

    // 재조회
    this.getWorkspaces(type);
  }


  /**
   * 더보기 버튼 이벤트
   * @param {string} type
   */
  public moreWorkspace(type: string) {

    //  페이지 초기화
    type === 'PRIVATE' ? this.personalWorkspaces.page.number += 1 : this.publicWorkspaces.page.number += 1;

    // 재조회
    this.getWorkspaces(type);
  }


  /**
   * 필터링 버튼 이벤트
   * @param {string} type
   */
  public filtering(type: string) {
    // create
    if (this.mode === 'create') {
      type === 'SHARED' ? this.filterPublicFl = !this.filterPublicFl : this.filterPersonalFl = !this.filterPersonalFl;
    } else {
      type === 'SHARED' ? this.filterPublicFl = !this.filterPublicFl : this.filterPersonalFl = !this.filterPersonalFl;
      // 재조회
      this.getWorkspaces(type);
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 워크스페이스 내 index 찾기
   * @param {any[]} workspaceList
   * @param workspaceId
   * @returns {number}
   */
  private getFindIndexWorkspace(workspaceList: any[], workspaceId): number {
    return workspaceList.findIndex((workspace) => {
      return workspace.id === workspaceId;
    });
  }

  /**
   * 워크스페이스 에서 워크스페이스 아이디랑 일치하는 아이템 제거
   * @param {any[]} workspace
   * @param {string} workspaceId
   */
  private spliceWorkspace(workspace: any[], workspaceId: string) {
    // index
    const index = this.getFindIndexWorkspace(workspace, workspaceId);
    // 존재할때만 제거
    if (index !== -1) {
      workspace.splice(index, 1);
    }
  }

  /**
   * 데이터 커넥션에서 워크스페이스 연결 해제
   * @param workspace
   * @param workspaceType
   */
  private deleteWorkspaceInDataconnection(workspace, workspaceType) {
    // id
    const workspaceId = workspace.id;

    this.deleteWorkspaceInDataconnectionForServer(this.linkedId, [workspaceId])
      .then(() => {
        // 연결된 워크스페이스에서 제거
        workspace.linked = false;
        // 타입이 private 라면
        if (workspaceType === 'PRIVATE') {
          // 현재 연결된 워크스페이스 수 감소
          this.personalWorkspaces.count.linked -= 1;
          // 선택된 워크스페이스만 보기 필터일 경우에만 제거
          if (this.filterPersonalFl) {
            this.spliceWorkspace(this.personalWorkspaces.workspace, workspaceId);
          }
        } else {
          // 현재 연결된 워크스페이스 수 감소
          this.publicWorkspaces.count.linked -= 1;
          // 선택된 워크스페이스만 보기 필터일 경우에만 제거
          if (this.filterPublicFl) {
            this.spliceWorkspace(this.publicWorkspaces.workspace, workspaceId);
          }
        }
      }).catch((error) => {
      Alert.error(error);
    });
  }

  /**
   * 데이터 소스에서 워크스페이스 연결 해제
   * @param workspace
   * @param workspaceType
   */
  private deleteWorkspaceInDatasource(workspace, workspaceType) {
    // id
    const workspaceId = workspace.id;

    this.deleteWorkspaceInDatasourceForServer(this.linkedId, [workspaceId])
      .then(() => {
        // 연결된 워크스페이스에서 제거
        workspace.linked = false;
        // 타입이 private 라면
        if (workspaceType === 'PRIVATE') {
          // 현재 연결된 워크스페이스 수 감소
          this.personalWorkspaces.count.linked -= 1;
          // 선택된 워크스페이스만 보기 필터일 경우에만 제거
          if (this.filterPersonalFl) {
            this.spliceWorkspace(this.personalWorkspaces.workspace, workspaceId);
          }
        } else {
          // 현재 연결된 워크스페이스 수 감소
          this.publicWorkspaces.count.linked -= 1;
          // 선택된 워크스페이스만 보기 필터일 경우에만 제거
          if (this.filterPublicFl) {
            this.spliceWorkspace(this.publicWorkspaces.workspace, workspaceId);
          }
        }
      }).catch((error) => {
      Alert.error(error);
    });
  }

  /**
   * 데이터 커넥션에서 워크스페이스 연결
   * @param workspace
   * @param workspaceType
   */
  private addWorkspaceInDataconnection(workspace, workspaceType) {
    // id
    const workspaceId = workspace.id;

    this.addWorkspaceInDataconnectionForServer(this.linkedId, [workspaceId])
      .then(() => {
        // 연결된 워크스페이스에 추가
        workspace.linked = true;
        // 타입이 private 라면
        if (workspaceType === 'PRIVATE') {
          // 현재 연결된 워크스페이스 수 증가
          this.personalWorkspaces.count.linked += 1;

        } else {
          // 현재 연결된 워크스페이스 수 증가
          this.publicWorkspaces.count.linked += 1;
        }
      }).catch((error) => {
      Alert.error(error);
    })
  }

  /**
   * 데이터 소스에서 워크스페이스 연결
   * @param workspace
   * @param workspaceType
   */
  private addWorkspaceInDatasource(workspace, workspaceType) {
    // id
    const workspaceId = workspace.id;

    this.addWorkspaceInDatasourceForServer(this.linkedId, [workspaceId])
      .then(() => {
        // 연결된 워크스페이스에 추가
        workspace.linked = true;
        // 타입이 private 라면
        if (workspaceType === 'PRIVATE') {
          // 현재 연결된 워크스페이스 수 증가
          this.personalWorkspaces.count.linked += 1;
        } else {
          // 현재 연결된 워크스페이스 수 증가
          this.publicWorkspaces.count.linked += 1;
        }
      }).catch((error) => {
      Alert.error(error);
    });
  }

  /**
   * 생성모드 일때 체크박스 클릭 이벤트
   * @param workspace
   */
  private onCheckWorkspaceInCreateMode(workspace) {
    const index = this.getFindIndexWorkspace(this.addWorkspaces, workspace.id);
    index === -1 ? this.addWorkspaces.push(workspace) : this.addWorkspaces.splice(index, 1);
  }

  /**
   * 수정모드 일때 체크박스 클릭 이벤트
   * @param workspace
   * @param workspaceType
   */
  private onCheckWorkspaceInUpdateMode(workspace, workspaceType) {
    // linked 된 워크스페이스 인지
    const linkedFl = workspace.linked;
    // 연결된 워크스페이스 라면
    if (linkedFl) {
      // 커넥션 or 소스
      this.linkedType === 'connection'
        ? this.deleteWorkspaceInDataconnection(workspace, workspaceType)
        : this.deleteWorkspaceInDatasource(workspace, workspaceType);
    } else {
      // 연결된 워크스페이스가 아니라면
      // 커넥션 or 소스
      this.linkedType === 'connection'
        ? this.addWorkspaceInDataconnection(workspace, workspaceType)
        : this.addWorkspaceInDatasource(workspace, workspaceType);
    }
  }


  /**
   * 데이터소스에 워크스페이스 추가
   * @param {string} connId
   * @param id
   * @returns {Promise<any>}
   */
  private addWorkspaceInDatasourceForServer(connId: string, id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadingShow();
      this.datasourceService.addDatasourceWorkspaces(connId, id)
        .then((result) => {
          this.loadingHide();
          resolve(result);
        })
        .catch((error) => {
          this.loadingHide();
          reject(error);
        });
    });
  }

  /**
   * 데이터소스에 워크스페이스 제거
   * @param {string} connId
   * @param id
   * @returns {Promise<any>}
   */
  private deleteWorkspaceInDatasourceForServer(connId: string, id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadingShow();
      this.datasourceService.deleteDatasourceWorkspaces(connId, id)
        .then((result) => {
          this.loadingHide();
          resolve(result);
        })
        .catch((error) => {
          this.loadingHide();
          reject(error);
        });
    });
  }

  /**
   * 데이터커넥션에 워크스페이스 추가
   * @param {string} connId
   * @param id
   * @returns {Promise<any>}
   */
  private addWorkspaceInDataconnectionForServer(connId: string, id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // 로딩 show
      this.loadingShow();
      this.connectionService.addConnectionWorkspaces(connId, id)
        .then((result) => {
          // 로딩 hide
          this.loadingHide();
          resolve(result);
        })
        .catch((error) => {
          // 로딩 hide
          this.loadingHide();
          reject(error);
        });
    });
  }

  /**
   * 데이터커넥션에 워크스페이스 제거
   * @param {string} connId
   * @param id
   * @returns {Promise<any>}
   */
  private deleteWorkspaceInDataconnectionForServer(connId: string, id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // 로딩 show
      this.loadingShow();
      this.connectionService.deleteConnectionWorkspaces(connId, id)
        .then((result) => {
          // 로딩 hide
          this.loadingHide();
          resolve(result);
        })
        .catch((error) => {
          // 로딩 hide
          this.loadingHide();
          reject(error);
        });
    });
  }

  /**
   * 워크스페이스가 추가될 목록에 있다면
   * @param {string} workspaceId
   * @returns {boolean}
   */
  private checkInAddWorkspaces(workspaceId: string) {

    const result = this.addWorkspaces.filter((workspace) => {
      return workspaceId === workspace.id;
    });

    // 목록에 있다면 true
    return result.length !== 0;
  }

  /**
   * 워크스페이스가 제거될 목록에 있다면
   * @param {string} workspaceId
   * @returns {boolean}
   */
  private checkInDeleteWorkspaces(workspaceId: string) {

    const result = this.deleteWorkspaces.filter((workspace) => {
      return workspaceId === workspace.id;
    });

    // 목록에 있다면 true
    return result.length !== 0;
  }


  /**
   * 워크스페이스 조회
   * @param {string} type
   */
  private getWorkspaces(type: string) {

    // 로딩 show
    this.loadingShow();

    const params = {
      publicType: type,
      linkedType: this.linkedType
    };
    params['size'] = type === 'PRIVATE' ? this.personalWorkspaces.page.size : this.publicWorkspaces.page.size;
    params['page'] = type === 'PRIVATE' ? this.personalWorkspaces.page.number : this.publicWorkspaces.page.number;
    params['sort'] = type === 'PRIVATE' ? this.personalWorkspaces.sort : this.publicWorkspaces.sort;

    // 검색어 있다면
    if (type === 'PRIVATE' && this.searchPersonal.trim() !== '') {
      params['nameContains'] = this.searchPersonal;
    } else if (type === 'SHARED' && this.searchPublic.trim() !== '') {
      params['nameContains'] = this.searchPublic;
    }

    // 연결된 아이디가 있다면
    if (this.linkedId) {
      params['linkedId'] = this.linkedId;
    }

    // create 가 아닌경우
    if (this.mode !== 'create' && type === 'PRIVATE' && this.filterPersonalFl) params['onlyLinked'] = true;
    if (this.mode !== 'create' && type === 'SHARED' && this.filterPublicFl) params['onlyLinked'] = true;

    this.workspaceService.getWorkSpaceAll(params, 'forListView')
      .then((result) => {

        if (type === 'PRIVATE') {
          // 페이지가 처음일경우
          if (this.personalWorkspaces.page.number === 0) {
            this.personalWorkspaces.workspace = [];
          }

          this.personalWorkspaces.workspace = result._embedded ? this.personalWorkspaces.workspace.concat(result._embedded.workspaces) : [];
          this.personalWorkspaces.page = result.page;

          // workspace count
          this.personalWorkspaces.count = result.workspace;
        } else {
          // 페이지가 처음일경우
          if (this.publicWorkspaces.page.number === 0) {
            this.publicWorkspaces.workspace = [];
          }
          this.publicWorkspaces.workspace = result._embedded ? this.publicWorkspaces.workspace.concat(result._embedded.workspaces) : [];
          this.publicWorkspaces.page = result.page;

          // workspace count
          this.publicWorkspaces.count = result.workspace;
        }

        // 로딩 hide
        this.loadingHide();
      })
      .catch(() => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  // ui init
  private initView() {
    // show true
    this.showFl = true;
    // tabChange
    this.tabChange = 'PRIVATE';
    // 초기화
    this.publicWorkspaces = new Workspace();
    this.personalWorkspaces = new Workspace();
    // 검색어 초기화
    this.searchPersonal = '';
    this.searchPersonal = '';
  }
}

class Workspace {
  workspace: any[] = [];
  page: PageResult;
  sort: string;
  count: any;

  constructor() {
    this.page = new PageResult();
    this.page.size = 20;
    this.page.number = 0;
    this.sort = 'name,desc';
  }
}
