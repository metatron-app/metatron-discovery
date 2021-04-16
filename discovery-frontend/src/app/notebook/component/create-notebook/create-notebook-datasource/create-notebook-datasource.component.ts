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
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {PopupService} from '@common/service/popup.service';
import {NoteBook} from '@domain/notebook/notebook';
import {Alert} from '@common/util/alert.util';
import {NotebookService} from '../../../service/notebook.service';
import {Page} from '@domain/common/page';
import {ConnectionType, Datasource} from '@domain/datasource/datasource';

@Component({
  selector: 'app-create-notebook-datasource',
  templateUrl: './create-notebook-datasource.component.html'
})
export class CreateNotebookDatasourceComponent extends AbstractPopupComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('inputSearch')
  private _inputSearch: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public notebook: NoteBook;

  @Input()
  public workspaceId: string;

  // 검색
  public searchText: string = '';

  // datasource list
  public datasourceList: Datasource[] = [];
  // 데이터 소스 아이디
  public datasourceId: string = '';

  // 검색 조건
  public searchType: string = 'all';
  public searchPublished: boolean = false;

  // 정렬
  public selectedContentSort: Order = new Order();

  public typeFilter = [];

  // Page
  public page: Page = new Page();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              protected notebookService: NotebookService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.workspaceId.firstChange) {
      // 초기화
      this.initViewPage();

      // 데이터 커넥션 조회
      this.getDatasourceList();
    }
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public next(arg?: string) {
    this.notebook.type = arg;
    if (this.datasourceId === '') {
      Alert.warning(this.translateService.instant('msg.nbook.alert.sel.datasource'));
      return;
    }

    const idx = this.datasourceList.findIndex((datasource) => {
      return datasource.id === this.datasourceId;
    });

    // 선택한 값이 있다면
    if (idx > -1) {
      // 데이터 소스 리스트 저장
      this.notebook.datasource = this.datasourceList[idx];
      this.notebook.datasource.dsType = 'DATASOURCE';

      this.popupService.notiPopup({
        name: 'create-notebook-name',
        data: null
      });
    }
  }


  public close() {
    super.close();

    this.popupService.notiPopup({
      name: 'close-notebook-create',
      data: null
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /** 데이터소스 리스트 조회 */
  public getDatasourceList() {
    // 로딩 show
    this.loadingShow();

    const params = {
      size: this.page.size,
      page: this.page.page
    };
    if (this.searchType !== 'all') {
      params['connType'] = this.searchType;
    }
    if (this.searchText !== '') {
      params['nameContains'] = this.searchText;
    }
    if (this.selectedContentSort.key !== 'seq' && this.selectedContentSort.sort !== 'default') {
      params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;
    }
    // 전체공개
    (this.searchPublished) && (params['onlyPublic'] = this.searchPublished);

    this.notebookService.getNotebookDatasource(this.workspaceId, params).then((dataSources) => {

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

        // 만약 토글상태가 seq인 경우
        if (this.selectedContentSort.key === 'seq' && this.selectedContentSort.sort === 'asc') {
          // 리스트에 추가
          this.datasourceList = this.datasourceList.concat(dataSources['_embedded']['datasources'].reverse());
        } else {
          // 리스트에 추가
          this.datasourceList = this.datasourceList.concat(dataSources['_embedded']['datasources']);
        }

        this.datasourceList.forEach((item: Datasource, idx: number) => {
          item.num = this.pageResult.totalElements - idx;
        });

        this.page.page += 1;
      }
      // 로딩 hide
      this.loadingHide();
    }).catch((error) => {
      console.log(error);
      Alert.error(this.translateService.instant('msg.alert.ds.retrieve.fail'));
      // 로딩 hide
      this.loadingHide();
    });
  }

  /** 더보기 버튼 */
  public getMoreList() {
    // 더 보여줄 데이터가 있다면
    if (this.page.page < this.pageResult.totalPages) {
      // 데이터소스 조회
      this.getDatasourceList();
    }
  }

  /** 데이터소스 셀렉트 이벤트 */
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
    // 검색어 설정
    this.searchText = this._inputSearch.nativeElement.value;
    // 페이지 초기화
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this.getDatasourceList();
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

  /** 타입 선택 */
  public onChangeType(event) {
    // 검색 타입
    this.searchType = event.connType;
    // 페이지 초기화
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this.getDatasourceList();
  }

  /**
   * publish 상태 변환
   * @param {MouseEvent} $event
   */
  public togglePublished($event: MouseEvent) {
    $event.stopPropagation();
    $event.preventDefault();
    // 상태변경
    this.searchPublished = !this.searchPublished;
    // 페이지 초기화
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this.getDatasourceList();
  } // function - togglePublished

  /** 데이터소스 요약페이지 닫았을때 발생 이벤트 */
  public onCloseSummary() {
    this.datasourceId = '';
  }

  /** 정렬 */
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
          this.selectedContentSort.sort = 'default';
          break;
        case 'default':
          this.selectedContentSort.sort = 'asc';
          break;
      }
    }

    // 페이지 초기화
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this.getDatasourceList();
  }

  /** 초기화 */
  private initViewPage() {

    // 모델 초기화
    this.datasourceId = '';
    // 데이터소스 리스트
    this.datasourceList = [];
    // 검색어
    this.searchText = '';
    // 타입 초기화
    this.searchPublished = false;
    this.searchType = 'all';

    // 필터설정
    this.typeFilter = [
      {
        label: this.translateService.instant('msg.comm.ui.list.all'),
        connType: 'all'
      },
      {
        label: this.translateService.instant('msg.comm.ui.list.ds.type.engine'),
        connType: ConnectionType.ENGINE.toString()
      },
      {
        label: this.translateService.instant('msg.comm.ui.list.ds.type.link'),
        connType: ConnectionType.LINK.toString()
      }
    ];

    // 정렬
    this.selectedContentSort = new Order();

    // page 설정
    this.page.page = 0;
    this.page.size = 20;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}


class Order {
  key: string = 'seq';
  sort: string = 'default';
}
