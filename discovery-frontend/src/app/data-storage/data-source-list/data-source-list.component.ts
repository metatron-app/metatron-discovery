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
import { CriterionKey, DatasourceCriterion } from '../../domain/datasource/datasourceCriterion';

declare let moment: any;

@Component({
  selector: 'app-data-source',
  templateUrl: './data-source-list.component.html',
  providers: [MomentDatePipe]
})
export class DataSourceListComponent extends AbstractComponent implements OnInit {

  // criterion data object
  private _criterionDataObject: any = {};

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

  // 데이터 소스
  public datasources: Datasource[];

  // search
  public searchKeyword: string = '';

  // 정렬
  public selectedContentSort: Order = new Order();


  // TODO 684
  private _originDatasourceFilterList: DatasourceCriterion[] = [];
  public datasourceFilterList: DatasourceCriterion[] = [];
  // origin more criterion more list
  public _originMoreCriterionList: DatasourceCriterion[] = [];

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
    // loading show
    this.loadingShow();
    // get criterion list
    this.datasourceService.getDatasourceCriterionList()
      .then((result: DatasourceCriterion[]) => {
        // set origin datasource filter list
        this._originDatasourceFilterList = result;
        // set datasource filter list
        this.datasourceFilterList = result;
        // set origin more criterion list
        this._originMoreCriterionList = result.find(criterion => criterion.criterionKey === CriterionKey.MORE).subCriteria;
        // get datasource list
        this.getDatasource();
      }).catch(reason => this.commonExceptionHandler(reason));
  }

  /**
   * 모드 변경
   * @param {string} mode
   */
  public changeMode(mode: string) {
    this.useUnloadConfirm = ( 'create-data-source' === mode );
    this.mode = mode;
  } // function - changeMode

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
   * Criteria filter change event
   * @param {{label: CriterionKey; value: any}} criteriaObject
   */
  public onChangedCriteriaFilter(criteriaObject: {label: CriterionKey, value: any}): void {
    // if changed criteria filter key is MORE
    if (criteriaObject.label === CriterionKey.MORE) {
      // selected criterion filters
      Object.keys(criteriaObject.value).forEach((key) => {
        // if not exist criterion in selected criterion filters
        if (criteriaObject.value[key].length === 0) {
          // loop
          this.datasourceFilterList.forEach((criterion, index, array) => {
            // if exist criterion in filter list
            if (criterion.criterionKey.toString() === key) {
              // remove filter
              array.splice(index, 1);
            }
          });
        } else if (this.datasourceFilterList.every(criterion => criterion.criterionKey.toString() !== key)){ // if not exist criterion in filter list
          // add filter
          this.datasourceFilterList.push(this._originMoreCriterionList.find(originCriterion => originCriterion.criterionKey.toString() === key));
        }
      });
    } else {
      this._criterionDataObject[criteriaObject.label] = criteriaObject.value;
    }
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
   * Search datasource
   */
  public searchDatasource(): void {
    // 페이지 초기화
    this.page.page = 0;
    // 데이터소스 리스트 조회
    this.getDatasource();
  }

  /**
   * Search datasource keyup event
   * @param {KeyboardEvent} event
   */
  public onSearchDatasource(event: KeyboardEvent): void {
    // enter event
    if (13 === event.keyCode) {
      // search datasource
      this.searchDatasource();
    } else if (23 === event.keyCode) { // esc event
      // init search keyword
      this.searchKeyword = '';
      // search datasource
      this.searchDatasource();
    }
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
   * @returns {string}
   */
  public getDataTypeChange(type: SourceType): string {
    switch (type) {
      case SourceType.IMPORT:
        return this.translateService.instant('msg.storage.li.druid');
      case SourceType.FILE:
        return this.translateService.instant('msg.storage.li.file');
      case SourceType.JDBC:
        return this.translateService.instant('msg.storage.li.db');
      case SourceType.HIVE:
        return this.translateService.instant('msg.storage.li.hive');
      case SourceType.REALTIME:
        return this.translateService.instant('msg.storage.li.stream');
    }
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
    this.datasourceService.getDatasourceList(this.page.page, this.page.size, this.getDatasourceParams())
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
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터 소스 조회 파라메터
   * @returns {{size: number; page: number}}
   */
  private getDatasourceParams() {
    console.log(this._criterionDataObject);
    const params = {};
    // criterion filter list
    Object.keys(this._criterionDataObject).forEach((key) => {
      // key loop
      Object.keys(this._criterionDataObject[key]).forEach((criterionKey) => {
        if (this._criterionDataObject[key][criterionKey].length !== 0) {
          // set key
          params[criterionKey] = [];
          // set value
          this._criterionDataObject[key][criterionKey].forEach(item => params[criterionKey].push(item.filterValue));
        }
      });
    });
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
