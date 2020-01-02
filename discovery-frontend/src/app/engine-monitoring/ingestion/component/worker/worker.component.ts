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
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {PageResult} from "../../../../domain/common/page";
import {EngineService} from "../../../service/engine.service";
import {CriterionComponent} from "../../../../data-storage/component/criterion/criterion.component";
import {Criteria} from "../../../../domain/datasource/criteria";
import {ActivatedRoute} from "@angular/router";
import {StringUtil} from "../../../../common/util/string.util";
import {TimezoneService} from "../../../../data-storage/service/timezone.service";
import {EngineMonitoringUtil} from "../../../util/engine-monitoring.util";

declare let moment: any;

@Component({
  selector: 'ingestion-worker',
  templateUrl: './worker.component.html',
  styles: ['.ddp-wrap-top-filtering .ddp-filter-search .ddp-form-filter-search {width: 280px;}']
})
export class WorkerComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  // noinspection JSUnusedLocalSymbols
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private activatedRoute: ActivatedRoute,
              private engineService: EngineService,
              private timezoneService: TimezoneService) {
    super(elementRef, injector);
  }

  @ViewChild(CriterionComponent)
  private readonly criterionComponent: CriterionComponent;

  public workerTotalList: any[];
  public workerList: any[];

  // search
  public searchKeyword: string;

  public selectedContentSort: Order = new Order();

  public ngOnInit() {
    // Init
    super.ngOnInit();
    // loading show
    this.loadingShow();
    // get criterion list
    this.engineService.getCriterionListInWorker()
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
          this._getWorkerList();
        }));
      })
      .catch(error => this.commonExceptionHandler(error));

    this.loadingHide();
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public isEmptyList(): boolean {
    return this.pageResult.totalElements === 0 || this.workerTotalList === undefined;
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
      this._getWorkerPagingList();
    }
  }

  public onClickWorker(host: string): void {
    this.router.navigate(['/management/engine-monitoring/ingestion/worker', host]).then();
  }

  public sortWorkerList(key: string): void {
    // set selected sort
    if (this.selectedContentSort.key != key) {
      this.selectedContentSort.key = key;
      this.selectedContentSort.sort = 'desc';
    } else {
      // asc, desc
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

  public highlightSearchText(name, searchText): string {
    return EngineMonitoringUtil.highlightSearchText(name, searchText);
  } // function - highlightSearchText

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
    return this.injector.get(EngineService).getCriterionInWorker(criterionKey);
  }

  public get getTimezone(): string {
    return this.timezoneService.getBrowserTimezone().utc;
  }

  private _filteringWorkerList(): any[] {
    const filterParam = this._getWorkerParams();
    return _.cloneDeep(this.workerTotalList).filter(item => {
      const matchSearchWord = !filterParam['containsText'] || item.worker.host.indexOf(filterParam['containsText']) > -1 || item.worker.ip.indexOf(filterParam['containsText']) > -1;
      const matchCompletedTime = (_.isNil(filterParam['completedTimeFrom'] && _.isNil(filterParam['completedTimeTo'])))
        || (filterParam['completedTimeFrom'] == "" && filterParam['completedTimeTo'] == "")
        || (filterParam['completedTimeFrom'] == "" && moment(item.lastCompletedTaskTime).isSameOrBefore(filterParam['completedTimeTo']))
        || (filterParam['completedTimeTo'] == "" && moment(item.lastCompletedTaskTime).isSameOrAfter(filterParam['completedTimeFrom']))
        || moment(item.lastCompletedTaskTime).isBetween(filterParam['completedTimeFrom'], filterParam['completedTimeTo']);
      return matchSearchWord && matchCompletedTime;
    })
  }

  private _getWorkerPagingList() {
    let list = this._filteringWorkerList();
    if (this.selectedContentSort.key != 'default') {
      list = list.sort((a, b) => {
        if(this.selectedContentSort.key === 'host') {
          return a.worker.host < b.worker.host ? -1 : a.worker.host > b.worker.host ? 1 : 0;
        } else if (this.selectedContentSort.key === 'ip') {
          return a.worker.ip < b.worker.ip ? -1 : a.worker.ip > b.worker.ip ? 1 : 0;
        } else if (this.selectedContentSort.key === 'version') {
          return a.worker.version < b.worker.version ? -1 : a.worker.version > b.worker.version ? 1 : 0;
        } else if (this.selectedContentSort.key === 'used') {
          return a.currCapacityUsed < b.currCapacityUsed ? -1 : a.currCapacityUsed > b.currCapacityUsed ? 1 : 0;
        } else if (this.selectedContentSort.key === 'groups') {
          return a.availabilityGroups.length < b.availabilityGroups.length ? -1 : a.availabilityGroups.length > b.availabilityGroups.length ? 1 : 0;
        } else if (this.selectedContentSort.key === 'running') {
          return a.runningTasks.length < b.runningTasks.length ? -1 : a.runningTasks.length > b.runningTasks.length ? 1 : 0;
        } else if (this.selectedContentSort.key === 'completed') {
          return a.lastCompletedTaskTime < b.lastCompletedTaskTime ? -1 : a.lastCompletedTaskTime > b.lastCompletedTaskTime ? 1 : 0;
        }
        return 0;
      });
      if (this.selectedContentSort.sort == 'desc') {
        list = list.reverse();
      }
    }
    this.pageResult = new PageResult();
    this.pageResult.size = this.page.size;
    this.pageResult.number = this.page.page;
    this.pageResult.totalElements = list.length;
    this.pageResult.totalPages = Math.ceil(this.pageResult.totalElements / this.pageResult.size);

    const endSize = (this.page.page+1)*this.pageResult.size < this.pageResult.totalElements ? (this.page.page+1)*this.pageResult.size : this.pageResult.totalElements;
    this.workerList = list.slice(this.page.page * this.pageResult.size, endSize);
  }

  private _getWorkerList() {
    if (_.isNil(this.workerTotalList) || this.workerTotalList.length == 0) {
      this.engineService.getWorkerList().then((data) => {
        this.workerTotalList = data;
        this._getWorkerPagingList();
      }).catch((error) => this.commonExceptionHandler(error));
    } else {
      this._getWorkerPagingList();
    }
  }

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

  private _getWorkerParams(): object {
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
  key: string = 'default';
  sort: string = 'default';
}
