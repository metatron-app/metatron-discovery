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
import { MomentDatePipe } from '../../common/pipe/moment.date.pipe';
import { StringUtil } from '../../common/util/string.util';
import { CriterionKey, ListCriterion } from '../../domain/datasource/listCriterion';

@Component({
  selector: 'app-data-source',
  templateUrl: './data-source-list.component.html',
  providers: [MomentDatePipe]
})
export class DataSourceListComponent extends AbstractComponent implements OnInit {

  // criterion data object
  private _criterionDataObject: any = {};

  // origin criterion list
  private _originCriterionList: ListCriterion[] = [];

  // origin more criterion more list
  private _originMoreCriterionList: ListCriterion[] = [];

  // 공통 삭제 팝업 모달
  @ViewChild(DeleteModalComponent)
  private deleteModalComponent: DeleteModalComponent;

  // datasource create step
  public mode: string;

  // datasource list
  public datasourceList: Datasource[];

  // search
  public searchKeyword: string = '';

  // datasource filter list (for UI)
  public datasourceFilterList: ListCriterion[] = [];

  // 생성자
  constructor(private datasourceService: DatasourceService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // ui 초기화
    this._initView();
    // loading show
    this.loadingShow();
    // get criterion list
    this.datasourceService.getCriterionListInDatasource()
      .then((result: ListCriterion[]) => {
        // set origin criterion list
        this._originCriterionList = result;
        // set datasource filter list
        this.datasourceFilterList = result;
        // set origin more criterion list
        this._originMoreCriterionList = result.find(criterion => criterion.criterionKey === CriterionKey.MORE).subCriteria;
        // set datasource list
        this._setDatasourceList();
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
    // set datasource list
    this._setDatasourceList();
  }

  /**
   * Remove datasource
   * @param {Modal} modalData
   */
  public removeDatasource(modalData: Modal): void {
    // 로딩 show
    this.loadingShow();
    // 데이터소스 삭제
    this.datasourceService.deleteDatasource(modalData.data)
      .then((result) => {
        Alert.success(this.translateService.instant('msg.storage.alert.dsource.del.success'));
        // set datasource list
        this._setDatasourceList();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Remove datasource click event
   * @param {Datasource} datasource
   */
  public onClickRemoveDatasource(datasource: Datasource): void {
    const modal = new Modal();
    modal.name = this.translateService.instant('msg.storage.ui.dsource.del.title');
    modal.description = this.translateService.instant('msg.storage.ui.dsource.del.description');
    modal.btnName = this.translateService.instant('msg.storage.btn.dsource.del');
    // set source id
    modal.data = datasource.id;
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
   * More datasource click event
   */
  public onClickMoreDatasourceList(): void {
    // if more datasource list
    if (this.isMoreContents()) {
      // add page number
      this.page.page += 1;
      // set datasource list
      this._setDatasourceList();
    }
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
              // remove criterion in dataObject
              delete this._criterionDataObject[key];
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
   * Search datasource
   */
  public searchDatasource(): void {
    // 페이지 초기화
    this.page.page = 0;
    // set datasource list
    this._setDatasourceList();
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
    } else if (27 === event.keyCode) { // esc event
      // init search keyword
      this.searchKeyword = '';
      // search datasource
      this.searchDatasource();
    }
  }

  /**
   * Get datasource status label
   * @param {Status} status
   * @returns {string}
   */
  public getSourceStatusLabel(status: Status): string {
    switch (status) {
      case Status.ENABLED:
        return 'Enabled';
      case Status.PREPARING:
        return 'Preparing';
      case Status.DISABLED:
        return 'Disabled';
      case Status.FAILED:
        return 'Failed';
      case Status.BAD:
        return 'Bad';
      default:
        return 'Disabled';
    }
  }

  /**
   * Get datasource status icon
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
   * Is more datasource list
   * @returns {boolean}
   */
  public isMoreContents(): boolean {
    return (this.page.page < this.pageResult.totalPages - 1);
  }

  /**
   * criterion api function
   * @param criterionKey
   * @returns {Promise<ListCriterion>}
   */
  public criterionApiFunc(criterionKey: any): Promise<ListCriterion> {
    // require injector in constructor
    return this.injector.get(DatasourceService).getCriterionInDatasource(criterionKey);
  }

  /**
   * Set datasource list
   * @private
   */
  private _setDatasourceList(): void {
    // loading show
    this.loadingShow();
    // 데이터 소스 조회 요청
    this.datasourceService.getDatasourceList(this.page.page, this.page.size, this._getDatasourceParams())
      .then((result) => {
        // set page result
        this.pageResult = result['page'];
        // if page number is 0
        if (this.page.page === 0) {
          // init datasource list
          this.datasourceList = [];
        }
        // set datasource list
        this.datasourceList = result['_embedded'] ? this.datasourceList.concat(result['_embedded'].datasources) : [];
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Init UI
   * @private
   */
  private _initView(): void {
    // init page
    this.page.page = 0;
    this.page.size = 20;
  }

  /**
   * Get datasource params
   * @returns {Object}
   * @private
   */
  private _getDatasourceParams(): object {
    // params
    const params = {};
    // criterion filter list
    Object.keys(this._criterionDataObject).forEach((key: any) => {
      // key loop
      Object.keys(this._criterionDataObject[key]).forEach((criterionKey) => {
        if (this._criterionDataObject[key][criterionKey].length !== 0) {
          // if CREATED_TIME, MODIFIED_TIME
          if ((key === CriterionKey.CREATED_TIME || key === CriterionKey.MODIFIED_TIME)) {
            // if not ALL, set value
            criterionKey !== 'ALL' && this._criterionDataObject[key][criterionKey].forEach(item => params[item.filterKey] = item.filterValue);
          } else {
            // set key
            params[criterionKey] = [];
            // set value
            this._criterionDataObject[key][criterionKey].forEach(item => params[criterionKey].push(item.filterValue));
          }
        }
      });
    });
    // if search keyword not empty
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      params['containsText'] = this.searchKeyword.trim();
    }
    return params;
  }
}
