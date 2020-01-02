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
import {Task, TaskStatus, TaskType} from "../../../../domain/engine-monitoring/task";
import {PageResult} from "../../../../domain/common/page";
import {EngineService} from "../../../service/engine.service";
import {ActivatedRoute} from "@angular/router";
import {CriterionComponent} from "../../../../data-storage/component/criterion/criterion.component";
import {Criteria} from "../../../../domain/datasource/criteria";
import {StringUtil} from "../../../../common/util/string.util";
import {TimezoneService} from "../../../../data-storage/service/timezone.service";
import {EngineMonitoringUtil} from "../../../util/engine-monitoring.util";

declare let moment: any;

@Component({
  selector: 'ingestion-task',
  templateUrl: './task.component.html',
  styles: ['.ddp-wrap-top-filtering .ddp-filter-search .ddp-form-filter-search {width: 280px;}']
})
export class TaskComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

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

  public taskTotalList: Task[];
  public taskList: Task[];

  // search
  public searchKeyword: string;

  public selectedContentSort: Order = new Order();

  public ngOnInit() {
    // loading show
    this.loadingShow();
    // get criterion list
    this.engineService.getCriterionListInTask()
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
          this._getTaskList();
        }));
      })
      .catch(error => this.commonExceptionHandler(error));

    // Init
    super.ngOnInit();
    this.loadingHide();
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public isEmptyList(): boolean {
    return this.pageResult.totalElements === 0 || this.taskTotalList === undefined;
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
      this._getTaskPagingList();
    }
  }

  public onClickTask(taskId: string): void {
    sessionStorage.setItem('IS_LOCATION_BACK_TASK_LIST', 'TRUE');
    this.router.navigate(['/management/engine-monitoring/ingestion/task', taskId]).then();
  }

  public getStatusClass(taskStatus: TaskStatus): string {
    return EngineMonitoringUtil.getTaskStatusClass(taskStatus);
  }

  public getDurationString(taskDuration: number): string {
    return moment.utc(moment.duration(taskDuration).asMilliseconds()).format("HH:mm:ss");
  }

  public getTypeTranslate(taskType: TaskType): string {
    return EngineMonitoringUtil.getTaskTypeTranslate(taskType);
  }

  public sortTaskList(key: string): void {
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
    return this.injector.get(EngineService).getCriterionInTask(criterionKey);
  }

  public get getTimezone(): string {
    return this.timezoneService.getBrowserTimezone().utc;
  }

  private _filteringTaskList(): Task[] {
    const filterParam = this._getTaskParams();
    return _.cloneDeep(this.taskTotalList).filter(item => {
      const matchStatus = !filterParam['taskStatus'] || filterParam['taskStatus'].length == 0 || filterParam['taskStatus'].some(status => item.status == status);
      const matchType = !filterParam['taskType'] || filterParam['taskType'].length == 0 || filterParam['taskType'].some(type => this.getTypeTranslate(item.type) == type);
      const matchSearchWord = !filterParam['containsText'] || item.task_id.indexOf(filterParam['containsText']) > -1 || item.datasource.indexOf(filterParam['containsText']) > -1;
      const matchCreatedTime = (_.isNil(filterParam['createdTimeFrom'] && _.isNil(filterParam['createdTimeTo'])))
        || (filterParam['createdTimeFrom'] == "" && filterParam['createdTimeTo'] == "")
        || (filterParam['createdTimeFrom'] == "" && moment(item.created_time).isSameOrBefore(filterParam['createdTimeTo']))
        || (filterParam['createdTimeTo'] == "" && moment(item.created_time).isSameOrAfter(filterParam['createdTimeFrom']))
        || moment(item.created_time).isBetween(filterParam['createdTimeFrom'], filterParam['createdTimeTo']);
      return matchStatus && matchType && matchSearchWord && matchCreatedTime;
    })
  }

  private _getTaskPagingList() {
    let list = this._filteringTaskList();
    if (this.selectedContentSort.key != 'default') {
      list = list.sort((a, b) => {
        if(this.selectedContentSort.key === 'status') {
          return a.status < b.status ? -1 : a.status > b.status ? 1 : 0;
        } else if (this.selectedContentSort.key === 'time') {
          return a.created_time < b.created_time ? -1 : a.created_time > b.created_time ? 1 : 0;
        } else if (this.selectedContentSort.key === 'duration') {
          return a.duration < b.duration ? -1 : a.duration > b.duration ? 1 : 0;
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
    this.taskList = list.slice(this.page.page * this.pageResult.size, endSize);
  }

  private _getTaskList() {
    if (_.isNil(this.taskTotalList) || this.taskTotalList.length == 0) {
      this.engineService.getTaskList().then((data) => {
        this.taskTotalList = data;
        this._getTaskPagingList();
      }).catch((error) => this.commonExceptionHandler(error));
    } else {
      this._getTaskPagingList();
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

  private _getTaskParams(): object {
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
