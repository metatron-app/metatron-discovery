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

import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { AbstractComponent } from '../../common/component/abstract.component';
import { DatasourceService } from '../../datasource/service/datasource.service';
import { Datasource, SourceType, Status } from '../../domain/datasource/datasource';
import { Alert } from '../../common/util/alert.util';
import { Modal } from '../../common/domain/modal';
import { DeleteModalComponent } from '../../common/component/modal/delete/delete.component';
import { PeriodComponent } from '../../common/component/period/period.component';
import { MomentDatePipe } from '../../common/pipe/moment.date.pipe';

@Component({
  selector: 'app-data-source',
  templateUrl: './data-source-list.component.html',
  providers: [MomentDatePipe]
})
export class DataSourceListComponent extends AbstractComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 선택한 데이터 타입 필터링
  private searchDataType: string = 'all';

  // 선택한 ingestion 필터링
  private searchIngestion: string = 'all';

  // date
  private selectedDate: Date;

  // 삭제할 소스 아이디
  private deleteSourceId: string = '';

  // 공통 삭제 팝업 모달
  @ViewChild(DeleteModalComponent)
  private deleteModalComponent: DeleteModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public mode: string;

  // data 타입
  public dataTypes: any[];

  // ingestion 타입
  public ingestionTypes: any[];

  // status
  public status: any[];
  public searchStatus: string = 'all';

  // 데이터 소스
  public datasources: Datasource[];

  // search
  public searchText: string = '';

  // 정렬
  public selectedContentSort: Order = new Order();

  // 모두 공유된 소스만 보기
  public searchPublished: boolean = false;

  // period component
  @ViewChild(PeriodComponent)
  public periodComponent: PeriodComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
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
    // ui 초기화
    this.initView();
    // 데이터 소스 조회
    this.getDatasource();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 모드 변경
   * @param {string} mode
   */
  public changeMode(mode: string) {
    this.useUnloadConfirm = ( 'create-data-source' === mode );
    this.mode = mode;
  } // function - changeMode

  /**
   * 필터 모두 초기화
   */
  public initFilters(): void {
    // type list
    this.dataTypes = [
      { name: this.translateService.instant('msg.storage.ui.list.all'), value: 'all' },
      { name: this.translateService.instant('msg.storage.ui.list.import'), value: 'IMPORT' },
      { name: this.translateService.instant('msg.storage.ui.list.file'), value: 'FILE' },
      { name: this.translateService.instant('msg.storage.ui.list.jdbc'), value: 'JDBC' },
      { name: this.translateService.instant('msg.storage.ui.list.hive'), value: 'HIVE' },
    ];

    this.ingestionTypes = [
      { name: this.translateService.instant('msg.storage.ui.list.all'), value: 'all' },
      { name: this.translateService.instant('msg.storage.ui.list.ingested.data'), value: 'ENGINE' },
      { name: this.translateService.instant('msg.storage.ui.list.linked.data'), value: 'LINK' },
    ];

    this.status = [
      { name: this.translateService.instant('msg.storage.ui.list.all'), value: 'all' },
      { name: this.translateService.instant('msg.storage.ui.list.enabled'), value: 'ENABLED' },
      { name: this.translateService.instant('msg.storage.ui.list.disabled'), value: 'DISABLED' },
      { name: this.translateService.instant('msg.storage.ui.list.preparing'), value: 'PREPARING' },
      { name: this.translateService.instant('msg.storage.ui.list.failed'), value: 'FAILED' }
    ];

    // 정렬
    this.selectedContentSort = new Order();
    // db type
    this.searchDataType = 'all';
    // ingestion type
    this.searchIngestion = 'all';
    // status
    this.searchStatus = 'all';
    // 전체공개
    this.searchPublished = false;
    // create date 초기화
    this.selectedDate = null;

    // date 필터 created update 설정 default created로 설정
    this.periodComponent.selectedDate = 'CREATED';
    // 검색조건 초기화
    this.searchText = '';
    // 페이지 초기화
    this.page.page = 0;
    // date 필터 init
    this.periodComponent.setAll();
  }

  /**
   * 데이터소스 생성 완료
   */
  public createComplete(): void {
    this.changeMode( '' );
    // 재조회
    this.getDatasource();
  }

  /**
   * 데이터소스 삭제
   */
  public deleteSource(): void {
    // 로딩 show
    this.loadingShow();
    // 데이터소스 삭제
    this.datasourceService.deleteDatasource(this.deleteSourceId)
      .then((result) => {
        Alert.success(this.translateService.instant('msg.storage.alert.dsource.del.success'));
        // 초기화
        this.deleteSourceId = '';
        // 재조회
        this.getDatasource();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 데이터 소스 삭제 모달 오픈
   * @param source
   */
  public deleteModalOpen(source): void {
    // event 전파 방지
    event.stopPropagation();

    const modal = new Modal();
    modal.name = this.translateService.instant('msg.storage.ui.dsource.del.title');
    modal.description = this.translateService.instant('msg.storage.ui.dsource.del.description');
    modal.btnName = this.translateService.instant('msg.storage.btn.dsource.del');

    // 삭제할 소스 아이디 저장
    this.deleteSourceId = source.id;

    // 팝업 창 오픈
    this.deleteModalComponent.init(modal);
  }

  /**
   * 데이터소스 상세 페이지 오픈
   * @param {string} dsId
   */
  public openDatasourceDetail(sourceId: string): void {
    this.router.navigate(['/management/storage/datasource', sourceId]);
  }

  /**
   * 더보기 버튼
   */
  public getMoreList(): void {
    // 더 보여줄 데이터가 있다면
    if (this.isMoreContents()) {

      this.page.page += 1;
      // 데이터소스 조회
      this.getDatasource();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - event
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 필터링 타입 변경
   * @param type
   */
  public onChangeType(type): void {
    this.searchDataType = type.value;
    // 페이지 초기화
    this.page.page = 0;
    // 재조회
    this.getDatasource();
  }

  /**
   * 필터링 ingestion 타입 변경
   * @param type
   */
  public onChangeIngestionType(type): void {
    this.searchIngestion = type.value;
    // 페이지 초기화
    this.page.page = 0;
    // 재조회
    this.getDatasource();
  }

  /**
   * 필터링 status 변경
   * @param state
   */
  public onChangeStatus(state): void {
    this.searchStatus = state.value;
    // 페이지 초기화
    this.page.page = 0;
    // 재조회
    this.getDatasource();
  }

  /**
   * 공유된 소스만 보기
   * @param {boolean} isSearchPublished
   */
  public onChangeAllowed(isSearchPublished: boolean): void {
    // 이벤트 중복 방지
    event.preventDefault();
    // 오픈 데이터만 보기 flag 변경
    this.searchPublished = isSearchPublished;
    // 페이지 초기화
    this.page.page = 0;
    // 재조회
    this.getDatasource();
  }

  /**
   * 필터링 켈린더 선택
   * @param event
   */
  public onChangeData(event): void {
    // 페이지 초기화
    this.page.page = 0;
    // 선택한 날짜
    this.selectedDate = event;
    // 재조회
    this.getDatasource();
  }

  /**
   * 필터링 데이터 소스 정렬
   * @param {string} key
   */
  public sort(key: string): void {
    // 정렬 정보 저장
    this.selectedContentSort.key = key;

    if (this.selectedContentSort.key === key) {
      // asc, desc
      switch (this.selectedContentSort.sort) {
        case 'asc':
          this.selectedContentSort.sort = 'desc';
          break;
        case 'desc':
          this.selectedContentSort.sort = 'asc';
          break;
      }
    }
    // 페이지 초기화
    this.page.page = 0;
    // 재조회
    this.getDatasource();
  }

  /**
   * 데이터소스 검색 이벤트
   * @param {boolean} initFl
   */
  public searchEvent(initFl: boolean): void {
    // esc
    if (!initFl) {
      this.searchText = '';
    }
    // 페이지 초기화
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this.getDatasource();
  }

  /**
   * 데이터소스 텍스트 검색 이벤트
   * @param {KeyboardEvent} event
   */
  public searchDatasourceEvent(event: KeyboardEvent): void {
    ( 13 === event.keyCode ) && (this.searchEvent(true));
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터 소스 status
   * @param {Datasource} datasource
   * @returns {string}
   */
  public getSourceStatus(datasource: Datasource): string {
    const status = datasource.status;
    let result = 'Disabled';
    switch (status) {
      case Status.ENABLED:
        result = 'Enabled';
        break;
      case Status.PREPARING:
        result = 'Preparing';
        break;
      case Status.DISABLED:
        result = 'Disabled';
        break;
      case Status.FAILED:
        result = 'Failed';
        break;
      default:
        result = 'Disabled';
        break;
    }
    return result;
  }

  /**
   * 데이터 소스 status icon
   * @param {Status} status
   * @returns {string}
   */
  public getSourceStatusIcon(status: Status): string {
    switch (status) {
      case Status.ENABLED:
        return 'ddp-data-status ddp-enabled';
      case Status.PREPARING:
        return 'ddp-data-status ddp-preparing';
      case Status.DISABLED:
        return 'ddp-data-status ddp-disabled';
      case Status.FAILED:
        return 'ddp-data-status ddp-fail';
      default:
        return 'ddp-data-status ddp-disabled';
    }
  }

  /**
   * 데이터 타입 변경 값
   * @param {SourceType} type
   * @returns {any}
   */
  public getDataTypeChange(type: SourceType): any {
    let result;
    switch (type) {
      case SourceType.IMPORT:
        result = this.translateService.instant('msg.storage.ui.list.import');
        break;
      case SourceType.FILE:
        result = this.translateService.instant('msg.storage.ui.list.file');
        break;
      case SourceType.JDBC:
        result = this.translateService.instant('msg.storage.ui.list.jdbc');
        break;
      case SourceType.HIVE:
        result = this.translateService.instant('msg.storage.ui.list.hive');
        break;
    }
    return result;
  }

  /**
   * 더 조회할 컨텐츠가 있는지 여부
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.page.page < this.pageResult.totalPages - 1);
  }

  /**
   * 컨텐츠 총 갯수
   * @returns {number}
   */
  public get getTotalContentsCount(): number {
    return this.pageResult.totalElements;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터 소스 목록조회
   */
  private getDatasource(): void {
    // 로딩 show
    this.loadingShow();
    // 데이터 소스 조회 요청
    this.datasourceService.getAllDatasource(this.getDatasourceParams())
      .then((datasources) => {
        // 페이지 객체
        this.pageResult = datasources['page'];
        // 페이지가 첫번째면
        if (this.page.page === 0) {
          this.datasources = [];
        }
        // 데이터 있다면
        this.datasources = datasources['_embedded'] ? this.datasources.concat(datasources['_embedded'].datasources) : [];
        // 로딩 hide
        this.loadingHide();
      })
      .catch((error) => {
        console.error(error);
        // 로딩 hide
        this.loadingHide();
      });
  }

  /**
   * ui 초기화
   */
  private initView(): void {
    // 페이지 초기화
    this.page.page = 0;
    this.page.size = 20;

    this.dataTypes = [
      { name: this.translateService.instant('msg.storage.ui.list.all'), value: 'all' },
      { name: this.translateService.instant('msg.storage.ui.list.import'), value: 'IMPORT' },
      { name: this.translateService.instant('msg.storage.ui.list.file'), value: 'FILE' },
      { name: this.translateService.instant('msg.storage.ui.list.jdbc'), value: 'JDBC' },
      { name: this.translateService.instant('msg.storage.ui.list.hive'), value: 'HIVE' },
    ];

    this.ingestionTypes = [
      { name: this.translateService.instant('msg.storage.ui.list.all'), value: 'all' },
      { name: this.translateService.instant('msg.storage.ui.list.ingested.data'), value: 'ENGINE' },
      { name: this.translateService.instant('msg.storage.ui.list.linked.data'), value: 'LINK' },
    ];

    this.status = [
      { name: this.translateService.instant('msg.storage.ui.list.all'), value: 'all' },
      { name: this.translateService.instant('msg.storage.ui.list.enabled'), value: 'ENABLED' },
      { name: this.translateService.instant('msg.storage.ui.list.disabled'), value: 'DISABLED' },
      { name: this.translateService.instant('msg.storage.ui.list.preparing'), value: 'PREPARING' },
      { name: this.translateService.instant('msg.storage.ui.list.failed'), value: 'FAILED' },
    ];
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터 소스 조회 파라메터
   * @returns {{size: number; page: number}}
   */
  private getDatasourceParams() {
    const params = {
      size: this.page.size,
      page: this.page.page
    };
    // 공개여부
    if (this.searchPublished) {
      params['published'] = this.searchPublished;
    }
    // 이름
    if (this.searchText.trim() !== '') {
      params['nameContains'] = this.searchText.trim();
    }
    // 정렬
    if (this.selectedContentSort.sort !== 'default') {
      params['sort'] = this.selectedContentSort.key + ',' + this.selectedContentSort.sort;
    }
    // status
    if (this.searchStatus !== 'all') {
      params['status'] = this.searchStatus;
    }
    // data type
    if (this.searchDataType !== 'all') {
      params['srcType'] = this.searchDataType;
    }
    // ingested type
    if (this.searchIngestion !== 'all') {
      params['connType'] = this.searchIngestion;
    }
    // date
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {
      params['searchDateBy'] = this.selectedDate.dateType;
      if (this.selectedDate.startDateStr) {
        params['from'] = this.selectedDate.startDateStr + '.000Z';
      }
      params['to'] = this.selectedDate.endDateStr + '.000Z';
    }

    return params;
  }
}

class Order {
  key: string = 'createdTime';
  sort: string = 'desc';
}

class Date {
  dateType: string;
  endDateStr: string;
  startDateStr: string;
  type: string;
}
