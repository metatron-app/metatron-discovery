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

import {AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import * as _ from 'lodash';
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {PageResult} from "../../../../domain/common/page";
import {EngineService} from "../../../service/engine.service";
import {StringUtil} from "../../../../common/util/string.util";
import {ActivatedRoute} from "@angular/router";
import {EngineMonitoringUtil} from "../../../util/engine-monitoring.util";

@Component({
  selector: 'ingestion-supervisor',
  templateUrl: './supervisor.component.html',
  styles: ['.ddp-wrap-top-filtering .ddp-filter-search.type-dataname .ddp-form-filter-search {width: 100%;}'
          ,'.ddp-wrap-top-filtering .ddp-filter-search .ddp-form-filter-search {width: 280px;}']
})
export class SupervisorComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  // noinspection JSUnusedLocalSymbols
  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private activatedRoute: ActivatedRoute,
              private engineService: EngineService) {
    super(elementRef, injector);
  }

  // search
  public searchKeyword: string;

  public supervisorTotalList: any[];
  public supervisorList: any[];

  public ngOnInit() {
    // Init
    super.ngOnInit();
    // loading show
    this.loadingShow();

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
      }
      this._getSupervisorList();
    }));

    this.loadingHide();

  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public isEmptyList(): boolean {
    return this.pageResult.totalElements === 0 || this.supervisorTotalList === undefined;
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
      this._getSupervisorPagingList();
    }
  }

  public onClickSupervisor(supervisorId: string): void {
    this.router.navigate(['/management/engine-monitoring/ingestion/supervisor', supervisorId]).then();
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

  private _filteringSupervisorList(): any[] {
    const filterParam = this._getSupervisorParams();
    return _.cloneDeep(this.supervisorTotalList).filter(item => {
      return !filterParam['containsText'] || item.id.indexOf(filterParam['containsText']) > -1 || item.spec.dataSchema.dataSource.indexOf(filterParam['containsText']) > -1;
    })
  }

  private _getSupervisorPagingList() {
    let list = this._filteringSupervisorList();
    this.pageResult = new PageResult();
    this.pageResult.size = this.page.size;
    this.pageResult.number = this.page.page;
    this.pageResult.totalElements = list.length;
    this.pageResult.totalPages = Math.ceil(this.pageResult.totalElements / this.pageResult.size);

    const endSize = (this.page.page+1)*this.pageResult.size < this.pageResult.totalElements ? (this.page.page+1)*this.pageResult.size : this.pageResult.totalElements;
    this.supervisorList = list.slice(this.page.page * this.pageResult.size, endSize);
  }

  private _getSupervisorList() {
    if (_.isNil(this.supervisorTotalList) || this.supervisorTotalList.length == 0) {
      this.engineService.getSupervisorList().then((data) => {
        this.supervisorTotalList = data;
        this._getSupervisorPagingList();
      }).catch((error) => this.commonExceptionHandler(error));
    } else {
      this._getSupervisorPagingList();
    }
  }

  private _getQueryParams() {
    const params = {
      page: this.page.page,
      size: this.page.size,
      pseudoParam : (new Date()).getTime()
    };
    // if search keyword not empty
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      params['containsText'] = this.searchKeyword.trim();
    }
    return params;
  }

  private _getSupervisorParams(): object {
    const params = {};
    // if search keyword not empty
    if (StringUtil.isNotEmpty(this.searchKeyword)) {
      params['containsText'] = this.searchKeyword.trim();
    }
    return params;
  }

}
