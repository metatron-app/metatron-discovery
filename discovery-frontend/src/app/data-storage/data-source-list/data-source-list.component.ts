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
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { AbstractComponent } from '../../common/component/abstract.component';
import { DatasourceService } from '../../datasource/service/datasource.service';
import { Datasource, SourceType, Status } from '../../domain/datasource/datasource';
import { Alert } from '../../common/util/alert.util';
import { Modal } from '../../common/domain/modal';
import { DeleteModalComponent } from '../../common/component/modal/delete/delete.component';
import { MomentDatePipe } from '../../common/pipe/moment.date.pipe';
import { StringUtil } from '../../common/util/string.util';
import {ActivatedRoute} from "@angular/router";
import {CriterionComponent} from "../component/criterion/criterion.component";
import {Criteria} from "../../domain/datasource/criteria";
import {isNullOrUndefined} from "util";

@Component({
  selector: 'app-data-source',
  templateUrl: './data-source-list.component.html',
  providers: [MomentDatePipe]
})
export class DataSourceListComponent extends AbstractComponent {

  @ViewChild(CriterionComponent)
  private readonly criterionComponent: CriterionComponent;

  // 공통 삭제 팝업 모달
  @ViewChild(DeleteModalComponent)
  private deleteModalComponent: DeleteModalComponent;

  // datasource create step
  public mode: string;

  // datasource list
  public datasourceList: Datasource[] = [];

  // search
  public searchKeyword: string;

  // selected sort
  public selectedContentSort: Order = new Order();

  // 생성자
  constructor(private datasourceService: DatasourceService,
              private activatedRoute: ActivatedRoute,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // loading show
    this.loadingShow();
    // get criterion list
    this.datasourceService.getCriterionListInDatasource()
      .then((result: Criteria.Criterion) => {
        // init criterion list
        this.criterionComponent.initCriterionList(result);
        this.subscriptions.push(this.activatedRoute.queryParams.subscribe(params => {
          const paramKeys = Object.keys(params);
          const isExistSearchParams = paramKeys.length > 0;
          const searchParams = {};
          // if exist search param in URL
          if (isExistSearchParams) {
            paramKeys.forEach((key) => {
              if (key === 'size') {
                this.page.size = params['size'];
              } else if (key === 'page') {
                this.page.page = params['page'];
              } else if (key === 'sort') {
                const sortParam = params['sort'].split(',');
                this.selectedContentSort.key = sortParam[0];
                this.selectedContentSort.sort = sortParam[1];
              } else if (key === 'containsText') {
                this.searchKeyword = params['containsText'];
              } else {
                searchParams[key] = params[key].split(',');
              }
            });
            // TODO 추후 criterion component로 이동
            delete searchParams['pseudoParam'];
            // init criterion search param
            this.criterionComponent.initSearchParams(searchParams);
          }
          // set datasource list
          this._setDatasourceList();
        }));
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  isEmptyList(): boolean {
    return this.datasourceList.length === 0;
  }

  /**
   * 페이지를 새로 불러온다.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._getQueryParams(), replaceUrl: true}
    ).then();
  } // function - reloadPage

  /**
   * More datasource click event
   */
  public changePage(data: { page: number, size: number }): void {
    // if more datasource list
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;
      this.reloadPage(false);
    }
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
    // true
    this.reloadPage();
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

        if (this.page.page > 0 && this.datasourceList.length === 1) {
          this.page.page -= 1;
        }

        // reload
        this.reloadPage(false);
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Sort datasource list
   * @param {string} key
   */
  public sortDatasourceList(key: string): void {
    // set selected sort
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
    // reload page
    this.reloadPage(true);
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
   * datasource click event
   * @param {string} sourceId
   */
  public onClickDatasource(sourceId: string): void {
    // open datasource detail
    this.router.navigate(['/management/storage/datasource', sourceId]).then();
  }

  /**
   * Changed filter
   * @param searchParams
   */
  public onChangedFilter(searchParams): void {
    // reload page
    this.reloadPage(true);
  }


  /**
   * Search connection keypress event
   * @param {string} keyword
   */
  public onChangedSearchKeyword(keyword: string): void {
    // set search keyword
    this.searchKeyword = keyword;
    // reload page
    this.reloadPage(true);
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
      case SourceType.SNAPSHOT:
        return this.translateService.instant('msg.storage.li.ss');
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
   * @return {Promise<any>}
   */
  public criterionApiFunc(criterionKey: any) {
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
    this.datasourceService.getDatasourceList(this.page.page, this.page.size, this.selectedContentSort.key + ',' + this.selectedContentSort.sort, this._getDatasourceParams())
      .then((result) => {

        // 현재 페이지에 아이템이 없다면 전 페이지를 불러온다.
        if (this.page.page > 0 &&
          isNullOrUndefined(result['_embedded']) ||
          (!isNullOrUndefined(result['_embedded']) && result['_embedded'].datasources.length === 0))
        {
          this.page.page = result.page.number - 1;
          this._setDatasourceList();
        }

        // set page result
        this.pageResult = result['page'];
        // set datasource list
        this.datasourceList = result['_embedded'] ? result['_embedded'].datasources : [];
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get search query params
   * @return {{size: number; page: number; sort: string}}
   * @private
   */
  private _getQueryParams() {
    const params = {
      page: this.page.page,
      size: this.page.size,
      pseudoParam : (new Date()).getTime(),
      sort: this.selectedContentSort.key + ',' + this.selectedContentSort.sort
    };
    const searchParams = this.criterionComponent.getUrlQueryParams();
    // set criterion
    searchParams && Object.keys(searchParams).forEach((key) => {
      if (searchParams[key].length > 0) {
        params[key] = searchParams[key].join(',');
      }
    });
    // if search keyword not empty
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      params['containsText'] = this.searchKeyword.trim();
    }
    return params;
  }

  /**
   * Get datasource params
   * @returns {Object}
   * @private
   */
  private _getDatasourceParams(): object {
    // params
    const params = this.criterionComponent.getSearchParams();
    // if search keyword not empty
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      params['containsText'] = this.searchKeyword.trim();
    }
    return params;
  }
}

class Order {
  key: string = 'createdTime';
  sort: string = 'desc';
}
