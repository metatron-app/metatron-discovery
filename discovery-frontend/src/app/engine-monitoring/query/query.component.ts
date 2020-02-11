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
import {AbstractComponent} from '../../common/component/abstract.component';
import {StateService} from '../service/state.service';
import {EngineService} from '../service/engine.service';
import {Engine} from '../../domain/engine-monitoring/engine';
import {filter} from 'rxjs/operators';
import {StringUtil} from "../../common/util/string.util";
import {CriterionComponent} from "../../data-storage/component/criterion/criterion.component";
import {Criteria} from "../../domain/datasource/criteria";
import {ActivatedRoute} from "@angular/router";
import * as _ from "lodash";
import {PageResult} from "../../domain/common/page";
import {TimezoneService} from "../../data-storage/service/timezone.service";
import {EngineMonitoringUtil} from "../util/engine-monitoring.util";

@Component({
  selector: '[query]',
  templateUrl: './query.component.html',
  host: { '[class.ddp-wrap-contents-det]': 'true' },
  styles: ['.ddp-wrap-top-filtering .ddp-filter-search .ddp-form-filter-search {width: 280px;}']
})
export class QueryComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  // noinspection JSUnusedLocalSymbols
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private activatedRoute: ActivatedRoute,
              private stateService: StateService,
              private engineService: EngineService,
              private timezoneService: TimezoneService) {
    super(elementRef, injector);
  }

  @ViewChild(CriterionComponent)
  private readonly criterionComponent: CriterionComponent;

  public queryTotalList: any[];
  public queryList: any[];

  // search
  public searchKeyword: string;

  public selectedContentSort: Order = new Order();

  public showDetail: boolean;
  public queryDetail: any;

  public ngOnInit() {
    super.ngOnInit();

    this.subscriptions.push(
      this.stateService.changeTab$
        .pipe(filter(({ current }) => current.isQuery()))
        .subscribe(({ next }) => this._changeTab(next))
    );

    // get criterion list
    this.engineService.getCriterionListInQuery()
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
          this.pageResult.size = this.page.size;
          this.pageResult.number = this.page.page;
          this._getQueryList();
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
    return this.pageResult.totalElements === 0 || this.queryTotalList === undefined;
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
      this._getQueryPagingList();
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
    return this.injector.get(EngineService).getCriterionInQuery(criterionKey);
  }

  public sortQueryList(key: string): void {
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

  public onClickQuery(query): void {
    this.queryDetail = query;
    this.showDetail = true;
  }

  public closeDetail(): void {
    this.showDetail = false;
    this.queryDetail = undefined;
  }

  public getStatusClass(querySuccess: String): string {
    if ('true' === querySuccess) {
      return 'ddp-success';
    } else if ('false' === querySuccess) {
      return 'ddp-fail';
    } else {
      return '';
    }
  }

  public get getTimezone(): string {
    return this.timezoneService.getBrowserTimezone().utc;
  }

  private _changeTab(contentType: Engine.ContentType) {
    this.router.navigate([ `${Engine.Constant.ROUTE_PREFIX}${contentType}` ]);
  }

  private _filteringQueryList(): any[] {
    // if search keyword not empty
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      return _.cloneDeep(this.queryTotalList).filter(item => {
        return item.queryId.indexOf(this.searchKeyword) > -1 || item.datasource.indexOf(this.searchKeyword) > -1;
      })
    } else {
      return _.cloneDeep(this.queryTotalList);
    }
  }

  private _getQueryPagingList() {
    let list = this._filteringQueryList();
    this.pageResult = new PageResult();
    this.pageResult.size = this.page.size;
    this.pageResult.number = this.page.page;
    this.pageResult.totalElements = list.length;
    this.pageResult.totalPages = Math.ceil(this.pageResult.totalElements / this.pageResult.size);

    const endSize = (this.page.page+1)*this.pageResult.size < this.pageResult.totalElements ? (this.page.page+1)*this.pageResult.size : this.pageResult.totalElements;
    this.queryList = list.slice(this.page.page * this.pageResult.size, endSize);
  }

  private _getQueryList() {
    const filterParam = this.criterionComponent.getSearchParams();
    filterParam['key'] = this.selectedContentSort.key;
    filterParam['sort'] = this.selectedContentSort.sort === 'asc' ? 'asc' : 'desc';
    this.loadingShow();
    // if search keyword not empty
    this.engineService.getQueryList(filterParam).then((data) => {
      this.loadingHide();
      this.queryTotalList = data;
      this._getQueryPagingList();
    }).catch((error) => this.commonExceptionHandler(error));
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

}

class Order {
  key: string = '__time';
  sort: string = 'default';
}
