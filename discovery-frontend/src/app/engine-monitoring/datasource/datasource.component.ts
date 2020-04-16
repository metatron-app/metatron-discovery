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
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import * as _ from 'lodash';
import {ActivatedRoute} from "@angular/router";
import {AbstractComponent} from "../../common/component/abstract.component";
import {EngineService} from "../service/engine.service";
import {PageResult} from "../../domain/common/page";
import {StringUtil} from "../../common/util/string.util";
import {Criteria} from "../../domain/datasource/criteria";
import {CriterionComponent} from "../../data-storage/component/criterion/criterion.component";
import {EngineMonitoringUtil} from "../util/engine-monitoring.util";
import {CommonUtil} from "../../common/util/common.util";
import {filter} from "rxjs/operators";
import {StateService} from "../service/state.service";
import {Engine} from "../../domain/engine-monitoring/engine";
import {Alert} from "../../common/util/alert.util";
import {Modal} from "../../common/domain/modal";
import {DeleteModalComponent} from "../../common/component/modal/delete/delete.component";

@Component({
  selector: '[datasource]',
  templateUrl: './datasource.component.html',
  host: { '[class.ddp-wrap-contents-det]': 'true' },
  styles: ['.ddp-wrap-top-filtering .ddp-filter-search.type-dataname .ddp-form-filter-search {width: 100%;}'
          ,'.ddp-wrap-top-filtering .ddp-filter-search .ddp-form-filter-search {width: 280px;}']
})
export class DatasourceComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  // noinspection JSUnusedLocalSymbols
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private stateService: StateService,
              private activatedRoute: ActivatedRoute,
              private engineService: EngineService) {
    super(elementRef, injector);
  }

  @ViewChild(DeleteModalComponent)
  private deleteModalComponent: DeleteModalComponent;

  @ViewChild(CriterionComponent)
  private readonly criterionComponent: CriterionComponent;

  // search
  public searchKeyword: string;

  public datasourceTotalList: any[];
  public datasourceList: any[];

  public ngOnInit() {
    // Init
    super.ngOnInit();

    this.subscriptions.push(
      this.stateService.changeTab$
        .pipe(filter(({ current }) => current.isDatasource()))
        .subscribe(({ next }) => this._changeTab(next))
    );

    // loading show
    this.loadingShow();

    // get criterion list
    this.engineService.getCriterionListInDatasource()
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
                this.page.size = Number(params['size']);
              } else if (key === 'page') {
                this.page.page = Number(params['page']);
              } else if (key === 'containsText') {
                this.searchKeyword = params['containsText'];
              } else {
                searchParams[key] = params[key].split(',');
              }
            });
            // TODO 추후 criterion component로 이동
            delete searchParams['pseudoParam'];
            this.criterionComponent.initSearchParams(searchParams);
          }

          this.pageResult.size = this.page.size;
          this.pageResult.number = this.page.page;
          this._getDatasourceList();
        }));
      }).catch(error => this.commonExceptionHandler(error));

  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public isEmptyList(): boolean {
    return this.pageResult.totalElements === 0 || this.datasourceTotalList === undefined;
  }

  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._getQueryParams(), replaceUrl: true}
    ).then();
  } // function - reloadPage

  public changePage(data: { page: number, size: number }): void {
    // if more datasource list
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;
      this.reloadPage(false);
    }
  }

  public onClickDatasource(datasource): void {
    if (datasource.disabled) {
      return;
    } else {
      this.router.navigate(['/management/engine-monitoring/datasource', datasource.datasource]).then();
    }
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
   * Changed filter
   * @param searchParams
   */
  public onChangedFilter(searchParams): void {
    // reload page
    this.reloadPage(true);
  }

  /**
   * criterion api function
   * @param criterionKey
   * @returns {Promise<any>}
   */
  public criterionApiFunc(criterionKey: any) {
    // require injector in constructor
    return this.injector.get(EngineService).getCriterionInDatasource(criterionKey);
  }

  public onClickConfirmDatasource(datasource, type): void {
    const modal = new Modal();
    if (type === 'enable') {
      modal.name = this.translateService.instant('msg.engine.monitoring.confirm.ds.enable.title');
      modal.description = this.translateService.instant('msg.engine.monitoring.confirm.ds.enable.description');
      modal.btnName = this.translateService.instant('msg.engine.monitoring.btn.ds.enable');
    } else if (type === 'disable') {
      modal.name = this.translateService.instant('msg.engine.monitoring.btn.ds.disable');
      modal.description = this.translateService.instant('msg.engine.monitoring.confirm.ds.list.disable.description');
      modal.btnName = this.translateService.instant('msg.engine.monitoring.btn.ds.list.disable');
    } else if (type === 'delete') {
      modal.name = this.translateService.instant('msg.storage.btn.dsource.del');
      modal.description = this.translateService.instant('msg.engine.monitoring.confirm.ds.del.description');
      modal.btnName = this.translateService.instant('msg.comm.btn.del');
    }
    modal.data = {
      datasource : datasource.datasource,
      type: type
    };
    this.deleteModalComponent.init(modal);
  }

  public confirmDatasource(modal: Modal) {
    if (modal.data.type === 'enable') {
      this._enableDatasource(modal.data.datasource);
    } else if (modal.data.type === 'disable') {
      this._disableDatasource(modal.data.datasource);
    } else if (modal.data.type === 'delete') {
      this._permanentlyDeleteDataSource(modal.data.datasource);
    }
  }

  public highlightSearchText(name, searchText): string {
    return EngineMonitoringUtil.highlightSearchText(name, searchText);
  }

  public getDatasourceStatusLabel(datasource): string {
    const datasourceStatus = this.getDatasourceStatus(datasource);
    if (datasourceStatus === 'disabled') {
      return this.translateService.instant('msg.engine.monitoring.ui.criterion.disabled');
    } else if (datasourceStatus === 'actively') {
      return this.translateService.instant('msg.engine.monitoring.ui.criterion.indexing');
    } else if (datasourceStatus === 'fully') {
      return this.translateService.instant('msg.engine.monitoring.ui.criterion.fully');
    } else {
      return this.translateService.instant('msg.engine.monitoring.ui.criterion.partially') + ' (' + (Math.floor((datasource.num_available_segments / datasource.num_segments) * 1000) / 10).toFixed(1) + '%)';
    }
  }

  public getDatasourceStatus(datasource): string {
    if (datasource.disabled) {
      return 'disabled';
    } else if (datasource.status < 0) {
      return 'actively';
    } else if (datasource.num_segments === datasource.num_available_segments) {
      return 'fully';
    } else {
      return 'partially';
    }
  }

  public getDatasourceSize(datasource) {
    const size = datasource.segments ? datasource.segments.size : 0;
    return CommonUtil.formatBytes(size, 2);
  }

  public notExistSegments(datasource) {
    return datasource.disabled || _.isNil(datasource.segments);
  }

  private _filteringDatasourceList(): any[] {
    const filterParam = this._getDatasourceParams();
    return _.cloneDeep(this.datasourceTotalList).filter(item => {
      const matchSearchWord = !filterParam['containsText'] || item.datasource.indexOf(filterParam['containsText']) > -1;
      const matchAvailability = !filterParam['availability'] || filterParam['availability'].length == 0 || filterParam['availability'].some(availability => this.getDatasourceStatus(item) === availability);
      return matchSearchWord && matchAvailability;
    })
  }

  private _getDatasourcePagingList() {
    let list = this._filteringDatasourceList();
    this.pageResult = new PageResult();
    this.pageResult.size = this.page.size;
    this.pageResult.number = this.page.page;
    this.pageResult.totalElements = list.length;
    this.pageResult.totalPages = Math.ceil(this.pageResult.totalElements / this.pageResult.size);

    const endSize = (this.page.page+1)*this.pageResult.size < this.pageResult.totalElements ? (this.page.page+1)*this.pageResult.size : this.pageResult.totalElements;
    this.datasourceList = list.slice(this.page.page * this.pageResult.size, endSize);
  }

  private _getDatasourceList() {
    if (_.isNil(this.datasourceTotalList) || this.datasourceTotalList.length == 0) {
      this.loadingShow();
      this.engineService.getDatasource().then((data) => {
        const datasourceAllList = data.datasourceList;
        let datasourceList = datasourceAllList.sort((a, b) => {
          let comparison = 0;

          if (a.datasource < b.datasource) {
            comparison = -1;
          } else if (a.datasource > b.datasource) {
            comparison = 1;
          }

          return comparison;
        });
        const datasourceListIncludeDisabled = data.datasourceListIncludeDisabled;
        const disabled: string[] = datasourceListIncludeDisabled.filter((d: string) => datasourceList.find(item => item.datasource === d) == null);
        datasourceList.forEach(d =>
          data.datasourceLoadStatus[d.datasource] != undefined ? d['status'] = data.datasourceLoadStatus[d.datasource] : d['status'] = -1
        );
        this.datasourceTotalList = datasourceList.concat(disabled.map(d => ({
          datasource: d,
          disabled: true
        })));
        this._getDatasourcePagingList();
        this.loadingHide();
      }).catch((error) => this.commonExceptionHandler(error));
    } else {
      this._getDatasourcePagingList();
    }
  }

  private _getQueryParams() {
    const params = {
      page: this.page.page,
      size: this.page.size,
      pseudoParam : (new Date()).getTime(),
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

  private _getDatasourceParams(): object {
    // params
    const params = this.criterionComponent.getSearchParams();
    // if search keyword not empty
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      params['containsText'] = this.searchKeyword.trim();
    }
    return params;
  }

  private _changeTab(contentType: Engine.ContentType) {
    this.router.navigate([ `${Engine.Constant.ROUTE_PREFIX}${contentType}` ]);
  }

  private _enableDatasource(datasource) {
    this.engineService.enableDatasource(datasource).then(() => {
      Alert.success(this.translateService.instant('msg.engine.monitoring.alert.ds.enable.success'));
    });
  }

  private _disableDatasource(datasource) {
    this.engineService.disableDatasource(datasource).then(() => {
      Alert.success(this.translateService.instant('msg.engine.monitoring.alert.ds.disable.success'));
    });
  }

  private _permanentlyDeleteDataSource(datasource) {
    this.engineService.permanentlyDeleteDataSource(datasource).then(() => {
      Alert.success(this.translateService.instant('msg.engine.monitoring.alert.ds.del.success'));
    });
  }

}
