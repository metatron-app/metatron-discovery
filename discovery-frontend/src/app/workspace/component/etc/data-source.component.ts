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

import { AbstractComponent } from '../../../common/component/abstract.component';
import { Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import {ConnectionType, Datasource, Status} from '../../../domain/datasource/datasource';
import { WorkspaceService } from '../../service/workspace.service';
import { Page } from '../../../domain/common/page';
import { Alert } from '../../../common/util/alert.util';
import { MomentDatePipe } from '../../../common/pipe/moment.date.pipe';

@Component({
  selector: 'app-datasource-view',
  templateUrl: './data-source.component.html',
  providers: [MomentDatePipe]
})
export class DatasourceComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 현재 워크스페이스 아이디
  private workspaceId: string;

  // 검색 타입 필터링
  private searchType: string = 'all';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Output()
  public showComplete = new EventEmitter();

  // 팝업 닫기
  public isShow: boolean = false;

  // 데이터 소스 리스트
  public datasourceList: Datasource[];
  // 데이터 소스 아이디
  public datasourceId: string = '';

  // 조회 프로젝션
  public params = '';

  // 검색
  public searchText: string = '';

  // 전체공개 여부
  public searchPublished: any = 'all';

  // 정렬
  public selectedContentSort: Order = new Order();

  // 필터링 타입 종류
  public typeFilter = [];

  // Page
  public page: Page = new Page();

  public dsStatus = Status;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Component
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private workspaceService: WorkspaceService,
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

  // init
  public init(workspaceId: string) {

    // 초기 hidden 처리
    this.renderer.setStyle(document.body, 'overflow', 'hidden');

    // 초기화
    this.initViewPage();

    this.isShow = true;
    // 워크스페이스 아이디 저장
    this.workspaceId = workspaceId;

    // 데이터소스 리스트 조회
    this.getDatasourceList();
  }

  // 팝업 닫기
  public close() {
    this.isShow = false;
    this.showComplete.emit();
    this.renderer.removeStyle(document.body, 'overflow');
  }


  // 더보기 버튼
  public getMoreList() {
    // 더 보여줄 데이터가 있다면
    if (this.page.page < this.pageResult.totalPages) {
      // 데이터소스 조회
      this.getDatasourceList();
    }
  }

  // 데이터소스 셀렉트 이벤트
  public selectDatasource(datasource: Datasource) {
    // 지금 보고있는 데이터면 show 해제
    if (datasource.id === this.datasourceId) {
      this.datasourceId = '';
      return;
    }

    // 데이터 아이디 저장
    this.datasourceId = datasource.id;
  }

  /**
   * 데이터소스 검색 이벤트
   * @param {boolean} initFl
   */
  public searchEvent(initFl: boolean) {
    // esc일때만
    if (!initFl) {
      // 검색어 초기화
      this.searchText = '';
    }
    // 페이지 초기화
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this.getDatasourceList();
  }

  /**
   * 데이터소스 텍스트 검색
   * @param {KeyboardEvent} event
   */
  public searchDatasourceEvent(event: KeyboardEvent) {
    ( 13 === event.keyCode ) && (this.searchEvent(true));
  }

  // public 토글 버튼
  public togglePublished() {
    if (this.searchPublished === 'all') {
      this.searchPublished = true;
    } else {
      this.searchPublished = 'all';
    }
    // 페이지 초기화
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this.getDatasourceList();
  }

  // 타입 선택
  public onChangeType(event) {
    // 검색 타입
    this.searchType = event.connType;
    // 페이지 초기화
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this.getDatasourceList();
  }

  // 데이터소스 요약페이지 닫았을때 발생 이벤트
  public onCloseSummary() {
    this.datasourceId = '';
  }

  // 정렬
  public changeOrder(column: string) {

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
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this.getDatasourceList();
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 데이터소스 리스트 조회
  private getDatasourceList() {
    // 로딩 show
    this.loadingShow();

    const params = {
      size: this.page.size,
      page: this.page.page
    };

    // 토글 정렬
    if (this.selectedContentSort.key !== 'seq' && this.selectedContentSort.sort !== 'default') {
      params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;
    }

    // 타입 정렬
    if (this.searchType !== 'all') {
      params['connType'] = this.searchType;
    }

    // 검색 정렬
    if (this.searchText !== '') {
      params['nameContains'] = this.searchText;
    }

    // 전체공개
    if (this.searchPublished === true) {
      params['onlyPublic'] = this.searchPublished;
    }

    this.workspaceService.getDataSources(this.workspaceId, params)
      .then((dataSources) => {

        // 데이터소스 아이디 초기화
        this.datasourceId = '';

        // page 객체 저장
        this.pageResult = dataSources['page'];

        // 페이지가 첫번째면
        if (this.page.page === 0) {
          this.datasourceList = [];
        }

        // 데이터 존재 여부
        if (dataSources['_embedded']) {
          this.datasourceList = this.datasourceList.concat(dataSources['_embedded']['datasources']);

          this.page.page += 1;
        } else {
          this.datasourceList = [];
        }
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        console.log(error);
        Alert.error(this.translateService.instant('msg.alert.ds.retrieve.fail'));
        // 로딩 hide
        this.loadingHide();
      });
  }

  // 초기화
  private initViewPage() {

    // 모델 초기화
    this.datasourceId = '';
    // 데이터소스 리스트
    this.datasourceList = [];
    // 워크스페이스 아이디
    this.workspaceId = '';
    // 검색어
    this.searchText = '';
    // 타입 초기화
    this.searchPublished = 'all';
    this.searchType = 'all';

    // 필터설정
    this.typeFilter = [
      {
        label: this.translateService.instant('msg.comm.ui.list.all'),
        connType: 'all'
      },
      {
        label: this.translateService.instant('msg.comm.ui.ds.engine'),
        connType: ConnectionType.ENGINE.toString()
      },
      {
        label: this.translateService.instant('msg.comm.ui.ds.link'),
        connType: ConnectionType.LINK.toString()
      }
    ];


    // 정렬
    this.selectedContentSort = new Order();
    this.selectedContentSort.key = 'modifiedTime';
    this.selectedContentSort.sort = 'desc';

    // 공개여부 토글
    this.searchPublished = 'all';

    // page 설정
    this.page.page = 0;
    this.page.size = 20;
  }
}

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | UI class
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

class Order {
  key: string = 'seq';
  sort: string = 'default';
}

