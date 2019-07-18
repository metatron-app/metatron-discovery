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
  Renderer2
} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {NotebookServerService} from '../../../model-management/notebook-server/service/notebook-server.service';
import {Page, PageResult} from '../../../domain/common/page';
import {NotebookConnector} from '../../../domain/notebook/notebookConnector';
import {WorkspaceService} from '../../service/workspace.service';
import {Alert} from '../../../common/util/alert.util';
import {NotebookService} from '../../../notebook/service/notebook.service';

@Component({
  selector: 'app-set-notebook-server',
  templateUrl: './set-notebook-server.component.html'
})
export class SetNotebookServerComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 현재 워크스페이스 아이디
  private workspaceId: string;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 팝업 플래그
  public isShow: boolean = false;

  // jupyter 검색
  public searchJupyter: string = '';
  // zeppelin 검색
  public searchZeppelin: string = '';

  // 선택한 server
  public selectedJupyter: NotebookConnector = new NotebookConnector();
  public selectedZeppelin: NotebookConnector = new NotebookConnector();

  // tab change
  public selectedTab: string = '';

  // server List
  public notebookConnectorList: any[] = [];

  // Jupyter
  public jupyter: Server = new Server();

  // zeppelin
  public zeppelin: Server = new Server();

  // 정렬
  public selectedContentSort: Order = new Order();

  @Output()
  public updateComplete = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private notebookServerService: NotebookServerService,
              private notebookService: NotebookService,
              private workspaceService: WorkspaceService,
              protected renderer: Renderer2,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {
    super.ngOnDestroy();
    this.renderer.removeStyle(document.body, 'overflow');
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 초기화
  public init(workspaceId: string, connectors: NotebookConnector[]) {

    // 초기 hidden 처리
    this.renderer.setStyle(document.body, 'overflow', 'hidden');

    this.workspaceId = workspaceId;
    // ui 초기화
    this.initView();
    // 팝업 열기
    this.isShow = true;
    // 워크스페이스 아이디
    this.workspaceId = workspaceId;

    // 워크스페이스에 연결된 서버가 있을 경우
    if (connectors && connectors.length > 0) {
      connectors.forEach((connector) => {
        connector.type === 'jupyter' ? this.selectedJupyter = connector : this.selectedZeppelin = connector;
      });
    }

    // 노트북 서버 최초조회
    const promise = [];
    promise.push(this.getNotebookServers('jupyter'));
    promise.push(this.getNotebookServers('zeppelin'));

    Promise.all(promise);
  }

  public close() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.isShow = false;
  }

  // 설정 완료
  public done() {

    const selectConnectorIds = [];

    if (this.selectedJupyter.id !== undefined) {
      selectConnectorIds.push(this.selectedJupyter.id);
    }

    if (this.selectedZeppelin.id !== undefined) {
      selectConnectorIds.push(this.selectedZeppelin.id);
    }

    // 등록가능한 서버가 없다면
    if (selectConnectorIds.length === 0) {
      Alert.warning(this.translateService.instant('msg.space.alert.reg.notebook.fail'));
      return;
    }

    // 로딩 show
    this.loadingShow();

    // 워크스페이스에서 사용할 노트북 서버 설정
    this.workspaceService.setNotebookServer(this.workspaceId, selectConnectorIds)
      .then((result) => {
        Alert.success(this.translateService.instant('msg.space.alert.reg.notebook.success'));
        // 로딩 hide
        this.loadingHide();
        this.isShow = false;
        this.updateComplete.emit(true);
        this.renderer.removeStyle(document.body, 'overflow');
      })
      .catch((error) => {
        // 로딩 hide
        this.loadingHide();
        Alert.error(error.message);
      });
  }

  // 검색
  public searchEvent(server: string) {
    const page = server === 'jupyter' ? this.jupyter.page : this.zeppelin.page;

    // 페이지 초기화
    page.page = 0;
    // 재조회
    this.getNotebookServers(server);
  }

  // 더보기 버튼
  public getMoreList(server: string) {

    const page = server === 'jupyter' ? this.jupyter.page : this.zeppelin.page;
    const pageResult = server === 'jupyter' ? this.jupyter.pageResult : this.zeppelin.pageResult;

    // 더 보여줄 데이터가 있다면
    if (page.page < pageResult.totalPages) {
      // 재조회
      this.getNotebookServers(server);
    }
  }

  // 정렬
  public changeOrder(column: string) {

    const page = this.selectedTab === 'jupyter' ? this.jupyter.page : this.zeppelin.page;

    // 초기화
    this.selectedContentSort.sort = this.selectedContentSort.key !== column ? 'default' : this.selectedContentSort.sort;
    // 정렬 정보 저장
    this.selectedContentSort.key = column;

    if (this.selectedContentSort.key === column) {
      // asc, desc, default
      switch (this.selectedContentSort.sort) {
        case 'asc':
          this.selectedContentSort.sort = 'desc';
          break;
        case 'desc':
          this.selectedContentSort.sort = 'asc';
          break;
        case 'default':
          this.selectedContentSort.sort = 'desc';
          break;
      }
    }

    // 페이지 초기화
    page.page = 0;
    // 데이터소스 리스트 조회
    this.getNotebookServers(this.selectedTab);
  }

  public reset() {
    if (this.selectedTab === 'jupyter') {
      this.selectedJupyter = new NotebookConnector();
    } else {
      this.selectedZeppelin = new NotebookConnector();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 노트북 서버 조회
  private getNotebookServers(server: string) {

    // 로딩 show
    this.loadingShow();

    this.notebookService.getNotebookConnectionList()
      .then((result) => {
        this.notebookConnectorList = result['_embedded']['connectors'];
        console.info(this.notebookConnectorList);
      })
      .catch((error) => {
        Alert.error(error);
      });

    const page = server === 'jupyter' ? this.jupyter.page : this.zeppelin.page;
    page.sort = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;
    let pageResult = server === 'jupyter' ? this.jupyter.pageResult : this.zeppelin.pageResult;
    const searchText = server === 'jupyter' ? this.searchJupyter : this.searchZeppelin;
    const options = {
      sort : 'hostname,' + this.selectedContentSort.sort
    };

    this.notebookServerService.getNotebookServerTypeList(searchText, server, page, 'default', options)
      .then((servers) => {

        // 페이지 객체 저장
        pageResult = servers['page'];

        // 페이지가 첫 번째이면
        if (page.page === 0) {
          server === 'jupyter' ? this.jupyter.servers = [] : this.zeppelin.servers = [];
        }

        // 데이터 있을 때
        if (servers['_embedded'].connectors.length > 0) {
          server === 'jupyter' ? this.jupyter.servers = servers['_embedded'].connectors : this.zeppelin.servers = servers['_embedded'].connectors;

          page.page += 1;
        }

        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  // 초기화
  private initView() {
    // page 설정
    this.jupyter.page.page = 0;
    this.jupyter.page.size = 20;
    this.zeppelin.page.page = 0;
    this.zeppelin.page.size = 20;

    this.selectedTab = 'jupyter';
    this.searchJupyter = '';
    this.searchZeppelin = '';
    this.selectedJupyter = new NotebookConnector();
    this.selectedZeppelin = new NotebookConnector();

    // 정렬
    this.selectedContentSort = new Order();
  }
}

class Server {
  servers: NotebookConnector[] = [];
  page = new Page();
  pageResult = new PageResult();
}

class Order {
  key: string = 'name';
  sort: string = 'default';
}
