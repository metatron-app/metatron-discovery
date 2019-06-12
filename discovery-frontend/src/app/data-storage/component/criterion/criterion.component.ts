/*
 *
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

import {Criteria} from "../../../domain/datasource/criteria";
import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {AbstractComponent} from "../../../common/component/abstract.component";
import * as _ from 'lodash';
import {StringUtil} from "../../../common/util/string.util";

declare let moment: any;

@Component({
  selector: 'component-criterion',
  templateUrl: 'criterion.component.html',
})
export class CriterionComponent extends AbstractComponent {

  @Input()
  public readonly criterionApiFunc;

  // used criterion list
  public usedCriterionList: Criteria.ListCriterion[];
  // extension criterion list
  private _extensionCriterionList: Criteria.ListCriterion[];
  // query params
  public queryParams = {};

  @Output()
  public readonly changedFilter = new EventEmitter();

  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  /**
   * Init criterion list
   * @param {{criteria: Criteria.ListCriterion[]; defaultFilters: Criteria.ListFilter[]}} criterionResult
   */
  public initCriterionList(criterionResult: Criteria.Criterion): void {
    // set used criterion list
    this.usedCriterionList = _.cloneDeep(criterionResult.criteria);
    const extensionCriterion = this.usedCriterionList.find(filter => filter.criterionKey === Criteria.ListCriterionKey.MORE && !_.isNil(filter.subCriteria));
    // if exist extension criterion list in criterion list param
    if (!_.isNil(extensionCriterion)) {
      this._extensionCriterionList = _.cloneDeep(extensionCriterion.subCriteria);
    }
    // if exist default filters
    if (!_.isNil(criterionResult.defaultFilters) && criterionResult.defaultFilters.length > 0) {
      // set default selected filter list
      criterionResult.defaultFilters.forEach((filter: Criteria.ListFilter) => {
        // if exist filter property in search params
        if (this.queryParams[filter.criterionKey + Criteria.QUERY_DELIMITER + filter.filterKey]) {
          this.queryParams[filter.criterionKey + Criteria.QUERY_DELIMITER + filter.filterKey].push(filter.filterValue);
        } else {  // if not exist filter property in search params
          this.queryParams[filter.criterionKey + Criteria.QUERY_DELIMITER + filter.filterKey] = [filter.filterValue];
        }
      });
    }
  }


  /**
   * Init search params
   * @param searchParams
   */
  public initSearchParams(searchParams) {
    // if exist search params
    if (Object.keys(searchParams).length > 0) {
      this.queryParams = _.cloneDeep(searchParams);
    } else {
      this.queryParams = {};
    }
    // if exist criterion list
    if (!_.isNil(this.queryParams[Criteria.KEY_EXTENSIONS])) {
      // loop
      this.queryParams[Criteria.KEY_EXTENSIONS].forEach((criterionKey: Criteria.ListCriterionKey) => {
        const criterion = this._extensionCriterionList.find(criterion => criterion.criterionKey === criterionKey);
        // if exist criterion in extension criterion list
        if (!_.isNil(criterion) && this.isNotExistExtensionCriterionInUsedCriterionList(criterion)) {
          // push criterion to used criterion list
          this.usedCriterionList.push(criterion);
        }
      });
    }
  }

  /**
   * Add extension criterion
   * @param {Criteria.ListCriterion} criterion
   */
  public addExtensionCriterion(criterion: Criteria.ListCriterion): void {
    // add criterion in used criterion list
    this.usedCriterionList.push(criterion);
    // if not exist extensions
    if (_.isNil(this.queryParams[Criteria.KEY_EXTENSIONS])) {
      this.queryParams[Criteria.KEY_EXTENSIONS] = [];
    }
    // add criterion key in search params
    this.queryParams[Criteria.KEY_EXTENSIONS].push(criterion.criterionKey);
    // changed filter
    this.changedFilter.emit();
  }

  /**
   * Remove extension criterion in used criterion list
   * @param {Criteria.ListCriterion} criterion
   */
  public removeExtensionCriterion(criterion: Criteria.ListCriterion): void {
    // remove criterion in used criterion list
    this.usedCriterionList.splice(this.usedCriterionList.findIndex(usedCriterion => usedCriterion.criterionKey === criterion.criterionKey),1);
    // remove criterion in search params
    this.queryParams[Criteria.KEY_EXTENSIONS].splice(this.queryParams[Criteria.KEY_EXTENSIONS].findIndex(paramItem => paramItem === criterion.criterionKey), 1);
    Object.keys(this.queryParams).forEach((key) => {
      // if exist search param
      if (key.indexOf(criterion.criterionKey) !== -1) {
        delete this.queryParams[key];
      }
    });
    // changed filter
    this.changedFilter.emit();
  }

  /**
   * Is extension criterion filter box component
   * @param {Criteria.ListCriterion} criterion
   * @return {boolean}
   */
  public isExtensionCriterionBox(criterion: Criteria.ListCriterion): boolean {
    return criterion.criterionKey === Criteria.ListCriterionKey.MORE;
  }

  /**
   * Is extension criterion filter
   * @param {Criteria.ListCriterion} criterion
   * @return {boolean}
   */
  public isExtensionCriterion(criterion: Criteria.ListCriterion): boolean {
    return this._extensionCriterionList.findIndex(extensionCriterion => extensionCriterion.criterionKey === criterion.criterionKey) !== -1;
  }

  /**
   * Is criterion not exist in used criterion list
   * @param {Criteria.ListCriterion} criterion
   * @return {boolean}
   */
  public isNotExistExtensionCriterionInUsedCriterionList(criterion: Criteria.ListCriterion): boolean {
    return this.usedCriterionList.every(usedCriterion => usedCriterion.criterionKey !== criterion.criterionKey);
  }


  /**
   * Change filter
   * @param {{label: Criteria.ListCriterionKey; value}} data
   */
  public onChangeFilter(data: {label: Criteria.ListCriterionKey, value}): void {
    const filters = Object.keys(data.value);
    // remove prev DATETIME property
    if (data.label === Criteria.ListCriterionKey.MODIFIED_TIME || data.label === Criteria.ListCriterionKey.CREATED_TIME) {
      // DATETIME type
      const type = data.value[Criteria.KEY_DATETIME_TYPE_SUFFIX][0];
      filters.forEach((key) => {
        // if KEY_DATETIME_TYPE_SUFFIX
        if (key === Criteria.KEY_DATETIME_TYPE_SUFFIX) {
          this.queryParams[data.label + Criteria.QUERY_DELIMITER + Criteria.KEY_DATETIME_TYPE_SUFFIX] = data.value[Criteria.KEY_DATETIME_TYPE_SUFFIX];
        } else {
          // if BETWEEN
          if (type === Criteria.DateTimeType.BETWEEN) {
            this.queryParams[data.label + Criteria.QUERY_DELIMITER + key] =  data.value[key].map(value => value.filterValue);
          } else { // if ALL, TODAY, SEVEN_DAYS
            // remove property
            delete this.queryParams[data.label + Criteria.QUERY_DELIMITER + key];
          }
        }
      });
    } else {
      filters.forEach((key) => {
        this.queryParams[data.label + Criteria.QUERY_DELIMITER + key] =  data.value[key].map(value => value.filterValue);
      });
    }
    this.changedFilter.emit();
  }

  /**
   * Get datetime start used Criteria.DateTimeType.TODAY type
   * @return {any}
   */
  public getDateTimeStartParamInToday() {
    return moment({ hour: 0 }).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  }

  /**
   * Get datetime end used Criteria.DateTimeType.TODAY or Criteria.DateTimeType.SEVEN_DAYS type
   * @return {any}
   */
  public getDateTimeEndParamInToday() {
    return moment({ hour: 23, minute: 59, seconds: 59 }).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  }

  /**
   * Get datetime start used Criteria.DateTimeType.SEVEN_DAYS type
   * @return {any}
   */
  public getDateTimeStartParamInSevenDay() {
    return moment({ hour: 0 }).subtract(6, 'days').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  }

  /**
   * Get Query params
   * @return {{}}
   */
  public getUrlQueryParams() {
    return _.cloneDeep(this.queryParams);

  }

  /**
   * Get search params
   * @return {{}}
   */
  public getSearchParams() {
    const searchParams = {};
    const param = _.cloneDeep(this.queryParams);
    // created time
    if (!_.isNil(param[Criteria.ListCriterionKey.CREATED_TIME + Criteria.QUERY_DELIMITER + Criteria.KEY_DATETIME_TYPE_SUFFIX])) {
      const type = param[Criteria.ListCriterionKey.CREATED_TIME + Criteria.QUERY_DELIMITER + Criteria.KEY_DATETIME_TYPE_SUFFIX][0];
      if (type === Criteria.DateTimeType.BETWEEN) {
        searchParams['createdTimeFrom'] = param[Criteria.ListCriterionKey.CREATED_TIME + Criteria.QUERY_DELIMITER + 'createdTimeFrom'] ? param[Criteria.ListCriterionKey.CREATED_TIME + Criteria.QUERY_DELIMITER + 'createdTimeFrom'][0] : undefined;
        searchParams['createdTimeTo'] = param[Criteria.ListCriterionKey.CREATED_TIME + Criteria.QUERY_DELIMITER + 'createdTimeTo'] ? param[Criteria.ListCriterionKey.CREATED_TIME + Criteria.QUERY_DELIMITER + 'createdTimeTo'][0] : undefined;
      } else if (type === Criteria.DateTimeType.TODAY) {
        searchParams['createdTimeFrom'] = this.getDateTimeStartParamInToday();
        searchParams['createdTimeTo'] = this.getDateTimeEndParamInToday();
      } else if (type === Criteria.DateTimeType.SEVEN_DAYS) {
        searchParams['createdTimeFrom'] = this.getDateTimeStartParamInSevenDay();
          searchParams['createdTimeTo'] = this.getDateTimeEndParamInToday();
      }
    }
    // modified time
    if (!_.isNil(param[Criteria.ListCriterionKey.MODIFIED_TIME + Criteria.QUERY_DELIMITER + Criteria.KEY_DATETIME_TYPE_SUFFIX])) {
      const type = param[Criteria.ListCriterionKey.MODIFIED_TIME + Criteria.QUERY_DELIMITER + Criteria.KEY_DATETIME_TYPE_SUFFIX][0];
      if (type === Criteria.DateTimeType.BETWEEN) {
        searchParams['modifiedTimeFrom'] = param[Criteria.ListCriterionKey.MODIFIED_TIME + Criteria.QUERY_DELIMITER + 'modifiedTimeFrom'][0];
        searchParams['modifiedTimeTo'] = param[Criteria.ListCriterionKey.MODIFIED_TIME + Criteria.QUERY_DELIMITER + 'modifiedTimeTo'][0];
      } else if (type === Criteria.DateTimeType.TODAY) {
        searchParams['modifiedTimeFrom'] = this.getDateTimeStartParamInToday();
        searchParams['modifiedTimeTo'] = this.getDateTimeEndParamInToday();
      } else if (type === Criteria.DateTimeType.SEVEN_DAYS) {
        searchParams['modifiedTimeFrom'] = this.getDateTimeStartParamInSevenDay();
        searchParams['modifiedTimeTo'] = this.getDateTimeEndParamInToday();
      }
    }
    // others
    Object.keys(param).filter(key => key !== Criteria.KEY_EXTENSIONS && key.indexOf(Criteria.ListCriterionKey.MODIFIED_TIME) === -1 && key.indexOf(Criteria.ListCriterionKey.CREATED_TIME) === -1).forEach((key) => {
      if (!_.isNil(param[key]) && param[key].length > 0 && param[key].every(value => StringUtil.isNotEmpty(value))) {
        searchParams[key.slice(key.indexOf(Criteria.QUERY_DELIMITER) + 1)] = param[key];
      }
    });
    return searchParams;
  }
}
