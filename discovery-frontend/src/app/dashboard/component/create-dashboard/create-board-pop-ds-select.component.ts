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

import { Component, ElementRef, Injector, OnInit, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import {ConnectionType, Datasource, Status} from '../../../domain/datasource/datasource';
import { StringUtil } from '../../../common/util/string.util';
import { PageResult } from '../../../domain/common/page';
import { Alert } from '../../../common/util/alert.util';
import { WorkspaceService } from '../../../workspace/service/workspace.service';

@Component({
  selector: 'create-board-pop-ds-select',
  templateUrl: './create-board-pop-ds-select.component.html',
})
export class CreateBoardPopDsSelectComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private _workspaceId: string;  // 워크스페이스 아이디

  private _prevDataSourceIds: string[] = [];   // 이전에 선택되었던 데이터소스 아이디 목록
  private _selectedDataSources: Datasource[] = [];   // 현재 선택된 데이터소스 목록

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 정렬
  public selectedContentSort: Order = new Order();

  public summaryTargetDsId: string = '';
  public dataSources: Datasource[] = [];

  public searchText: string = '';
  public searchType: string = '';
  public searchPublished: boolean = false;

  public typeFilter = [];

  public isShow: boolean = false;

  @Output('done')
  public doneEvent: EventEmitter<{ add: Datasource[], remove: string[] }> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private workspaceService: WorkspaceService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 클래스 초기화
   */
  public ngOnInit() {
    super.ngOnInit();

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

    this.selectedContentSort = new Order();
  } // function - ngOnInit

  /**
   * 클래스 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 팝업 열기
   * @param {string} workspaceId
   * @param {string[]} dataSourceIds
   */
  public open(workspaceId: string, dataSourceIds: string[]) {
    this._workspaceId = workspaceId;

    this.summaryTargetDsId = '';

    // 기존에 선택되었던 데이터소스 아이디 목록 저장
    this._prevDataSourceIds = dataSourceIds;

    // 정렬
    this.selectedContentSort.key = 'modifiedTime';
    this.selectedContentSort.sort = 'desc';

    // 공개여부 토글
    this.searchPublished = false;

    // page 설정
    this.page.page = 0;
    this.page.size = 20;

    // 데이터초기화
    this._selectedDataSources = [];

    this.isShow = true;

    // 데이터 소스 조회
    this._getDataSources();

  } // function - open

  /**
   * 팝업 닫기
   */
  public close() {
    super.close();
    this.isShow = false;
  } // function - close

  /**
   * 선택 완료
   */
  public done() {

    const addDataSources: Datasource[] = this._selectedDataSources.filter(item => {
      return -1 === this._prevDataSourceIds.indexOf(item.id);
    });
    const removeDataSources: string[] = this._prevDataSourceIds.filter(id => {
      return -1 === this._selectedDataSources.findIndex(item => item.id === id);
    });

    this.doneEvent.emit({ add: addDataSources, remove: removeDataSources });
    this.close();
  } // function - done

  /**
   * 검색 조회
   * @param {string} inputText
   */
  public searchEvent(inputText:string) {
    // 검색어 설정
    this.searchText = inputText;
    // 페이지 초기화
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this._getDataSources();
  } // function - searchEvent

  /**
   * publish 상태 변환
   * @param {MouseEvent} event
   */
  public togglePublished(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    // 상태변경
    this.searchPublished = !this.searchPublished;
    // 페이지 초기화
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this._getDataSources();
  } // function - togglePublished

  /**
   * 타입 선택
   * @param event
   */
  public onChangeType(event) {
    // 검색 타입
    this.searchType = event.connType;
    // 페이지 초기화
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this._getDataSources();
  } // function - onChangeType

  /**
   * 정렬 정보 변경
   * @param {string} column
   */
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
    this._getDataSources();
  } // function - changeOrder

  /**
   * 데이터 소스 선택
   * @param {Datasource} datasource
   */
  public selectDatasource(datasource: Datasource) {

    // 데이터 아이디 저장
    this.summaryTargetDsId = datasource.id;

    if (this.isSelectedDatasource(datasource)) {
      this._selectedDataSources = this._selectedDataSources.filter(item => item.id !== datasource.id);
    } else {
      this._selectedDataSources.push(datasource);
    }
  } // function - selectDatasource

  /**
   * 데이터 소스 선택 여부
   * @param {Datasource} datasource
   */
  public isSelectedDatasource(datasource: Datasource) {
    return -1 < this._selectedDataSources.findIndex(item => item.id === datasource.id);
  } // function - isSelectedDatasource

  /**
   * 데이터소스 요약페이지 닫았을때 발생 이벤트
   */
  public onCloseSummary() {
    this.summaryTargetDsId = '';
  } // function - onCloseSummary

  /**
   * 더보기 버튼
   */
  public getMoreList() {
    // 더 보여줄 데이터가 있다면
    if (this.page.page < this.pageResult.totalPages) {
      // 데이터소스 조회
      this._getDataSources();
    }
  } // function - getMoreList

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터 목록 조회
   */
  private _getDataSources() {
    const workspaceId: string = this._workspaceId;

    if (StringUtil.isEmpty(workspaceId)) return;

    this.loadingShow();

    const params = {
      size: this.page.size,
      page: this.page.page,
      status : Status.ENABLED
    };

    // 토글 정렬
    if (this.selectedContentSort.key !== 'seq' && this.selectedContentSort.sort !== 'default') {
      params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;
    } else {
      params['sort'] = 'modifiedTime,desc';
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
    (this.searchPublished) && (params['onlyPublic'] = this.searchPublished);

    // 페이지가 첫번째면
    if (this.page.page === 0) {
      // page 객체 저장
      this.pageResult = new PageResult();
      this.dataSources = [];
    }

    this.workspaceService.getDataSources(workspaceId, params).then((datasources) => {

      // page 객체 저장
      this.pageResult = datasources['page'];

      // 데이터 존재 여부
      if (datasources['_embedded']) {
        this.dataSources = this.dataSources.concat(datasources['_embedded']['datasources']);
        this.page.page += 1;
      } else {
        this.dataSources = [];
      }

      this.dataSources.forEach((item: Datasource, idx: number) => {
        item.num = this.pageResult.totalElements - idx;
        if (-1 < this._prevDataSourceIds.indexOf(item.id)) {
          this._selectedDataSources.push(item);
        }
      });

      // 데이터소스 아이디 초기화
      if ('' === this.summaryTargetDsId && 0 < this.dataSources.length) {
        this.summaryTargetDsId = this.dataSources[0].id;
      }

      // 로딩 hide
      this.loadingHide();

      this.changeDetect.detectChanges();
    }).catch((error) => {
      console.log(error);
      Alert.error(this.translateService.instant('msg.alert.ds.retrieve.fail'));
      // 로딩 hide
      this.loadingHide();
    });
  } // function - _getDataSources

}

class Order {
  key: string = 'seq';
  sort: string = 'default';
}
