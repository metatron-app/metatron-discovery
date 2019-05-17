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

import {Component, ElementRef, EventEmitter, Injector, Input, Output} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {StringUtil} from '../../../common/util/string.util';
import {ConnectionType, DataSourceType, SourceType, Status} from '../../../domain/datasource/datasource';
import * as _ from "lodash";
import {Criteria} from "../../../domain/datasource/criteria";

@Component({
  selector: 'criterion-filter-box',
  templateUrl: 'criterion-filter-box.component.html',
  host: {
    '(document:click)': 'onClickHost($event)',
  }
})
export class CriterionFilterBoxComponent extends AbstractComponent {

  // search params
  @Input()
  public readonly searchParams;

  // selected item list
  private _selectedItemList : any = {};

  // selected item default label
  private readonly _defaultSelectedItemLabel: string = this.translateService.instant('msg.storage.ui.criterion.all');

  // criterion api (required: true)
  @Input()
  public readonly criterionApiFunc: Function;
  // criterion (required: true)
  @Input('criterion')
  public readonly criterion: Criteria.ListCriterion;
  // is enable criterion filter remove button
  @Input('enableRemove')
  public readonly isEnableRemoveButton: boolean;

  // default selected item list
  public readonly defaultSelectedItemList = {};

  // criterion name
  public criterionName: string;

  // filter title
  public filterTitle: string;
  // search place holder
  public searchPlaceHolder: string;
  // selected item label
  public selectedItemsLabel: string;

  // Is enable ALL Option (default false)
  public isEnableAllOption: boolean = false;

  // criterion data
  public criterionData: Criteria.ListCriterion;

  // list show/hide flag
  public isShowList = false;

  // changed criteria
  @Output('changedCriteria')
  private _changedCriteriaEvent: EventEmitter<any> = new EventEmitter();

  // removed criterion
  @Output('removedCriterion')
  private _removedCriterionEvent: EventEmitter<any> = new EventEmitter();


  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * ngOnInit
   */
  public ngOnInit() {
    super.ngOnInit();
    // set criterion name
    this.criterionName = this.criterion.criterionName;
    // set filter title
    if (!_.isNil(this.criterion.criterionName)) {
      this.filterTitle = this.translateService.instant(this.criterion.criterionName);
    }
    // set search placeholder
    this.searchPlaceHolder = this.translateService.instant('msg.storage.ui.criterion.search', {value: this.translateService.instant(this.criterionName)});
    // set search params
    const param = {};
    Object.keys(this.searchParams).forEach((key) => {
      if (key.indexOf(this.criterion.criterionKey) !== -1) {
        param[key.slice(key.indexOf(Criteria.QUERY_DELIMITER)+ 1)] = this.searchParams[key];
        // if
        if (this.isRangeDateTimeType() || this.isDateTimeType()) {
          this.defaultSelectedItemList[key.slice(key.indexOf(Criteria.QUERY_DELIMITER)+ 1)] = this.searchParams[key];
        }
      }
    });
    this._setCriterionData().then(() => {
      // set selected item label
      if (!this.isRangeDateTimeType() && !this.isDateTimeType()) {
        Object.keys(this.searchParams).forEach((key) => {
          if (key.indexOf(this.criterion.criterionKey) !== -1) {
            this.searchParams[key].forEach((value) => {
              this.criterionData.subCriteria.forEach((criterion) => {
                const criterionFilter = criterion.filters.find(filter => filter.filterValue === value);
                if (!_.isNil(criterionFilter)) {
                  // not exist default
                  if (_.isNil(this.defaultSelectedItemList[criterionFilter.filterKey])) {
                    this.defaultSelectedItemList[criterionFilter.filterKey] = [];
                  }
                  this.defaultSelectedItemList[criterionFilter.filterKey].push(criterionFilter);
                }
              });
            });
          }
        });
      }

      // set selected item list
      this._selectedItemList = this.defaultSelectedItemList;
      // set selected item label
      if (!this.isRangeDateTimeType() && !this.isDateTimeType()) {
        this.selectedItemsLabel = this._makeItemsLabel(this._selectedItemList);
      }
    });
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public isCheckboxType(): boolean {
    return this.criterion.criterionType === Criteria.ListCriterionType.CHECKBOX;
  }

  public isRangeDateTimeType(): boolean {
    return this.criterion.criterionType === Criteria.ListCriterionType.RANGE_DATETIME;
  }

  public isDateTimeType(): boolean {
    return this.criterion.criterionType === Criteria.ListCriterionType.DATETIME;
  }

  /**
   * Select box outside click event
   * @param event
   */
  public onClickHost(event) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    // except date picker
    if ( !this.elementRef.nativeElement.contains(event.target) && 0 === $(event.target).closest('[class^=datepicker]').length ) {
      // close list
      this.isShowList = false;
    }
  }

  /**
   * List show click event
   * @param {MouseEvent} event
   */
  public onClickShowList(event: MouseEvent) {
    if ($(event.target).hasClass('ddp-result-filtering')
        || $(event.target).hasClass('ddp-txt-label')
        || $(event.target).hasClass('ddp-ui-result')
        || $(event.target).hasClass('ddp-box-result')
        || $(event.target).hasClass('ddp-txt-result')) {
      // if list not show
      if (!this.isShowList) {
        // set criterion list
        this._setCriterionData()
          .then(() => {
            // show list
            this.isShowList = true;
          }).catch(error => this.commonExceptionHandler(error));
      } else {
        // close list
        this.isShowList = false;
      }
    }
  }

  /**
   * Change selected item
   * @param selectedItemList
   */
  public onChangedSelectItem(selectedItemList: any, isOutputEvent: boolean = true): void {
    // set selected item list
    this._selectedItemList = selectedItemList;
    // set selected item label
    this.selectedItemsLabel = this._makeItemsLabel(selectedItemList);
    // change detect
    this.safelyDetectChanges();
    // change event
    isOutputEvent && this._changedCriteriaEvent.emit({
      label: this.criterion.criterionKey,
      value: selectedItemList
    });
  }

  /**
   * Remove criterion filter click event
   */
  public onClickRemoveCriterionFilter(): void {
    this._removedCriterionEvent.emit(this.criterion);
  }

  /**
   * Is enable filter title
   * @returns {boolean}
   */
  public isEnableFilterTitle(): boolean {
    return this.selectedItemsLabel === this._defaultSelectedItemLabel;
  }

  /**
   * Make items label
   * @param selectedItemList
   * @returns {string}
   * @private
   */
  private _makeItemsLabel(selectedItemList: any): string {
    let temp: string = '';
    // is type DATETIME
    if (this.isRangeDateTimeType() || this.isDateTimeType()) {
      const isNotAllType = selectedItemList[Criteria.KEY_DATETIME_TYPE_SUFFIX] && selectedItemList[Criteria.KEY_DATETIME_TYPE_SUFFIX][0] !== Criteria.DateTimeType.ALL;
      Object.keys(selectedItemList).forEach(key => {
        if (isNotAllType && (key !== Criteria.KEY_DATETIME_TYPE_SUFFIX)) {
          temp += StringUtil.isEmpty(temp) ? (selectedItemList[key][0].filterName || this.translateService.instant('msg.storage.ui.criterion.time.past')) : ` ~ ${(selectedItemList[key][0].filterName || this.translateService.instant('msg.storage.ui.criterion.time.current'))}`;
        }
      });
      if (isNotAllType) {

      }
    } else {  // NOT DATETIME
      Object.keys(selectedItemList).forEach(key =>
        selectedItemList[key].forEach((item) => {
          if (StringUtil.isEmpty(temp)) {
            temp += this._getTranslateFilterName(item);
          } else {
            temp += `, ${this._getTranslateFilterName(item)}`;
          }
        }));
    }

    return StringUtil.isEmpty(temp) ? this._defaultSelectedItemLabel : temp;
  }

  /**
   * Criterion fit a spec
   * @param {Criteria.ListCriterion} criterion
   * @return {Criteria.ListCriterion}
   * @private
   */
  private _transCriterion(criterion: Criteria.ListCriterion): Criteria.ListCriterion {
    /**
     * fit spec
     * {
     *  criterionKey:
     *  criterionType:
     *  criterionName:
     *  subCriteria: [
     *    filters: [
     *      {
     *        filterKey:
     *        filterName:
     *        filterValue:
     *      }
     *    ]
     *  ]
     * }
     */
    // if exist filters in result
    if (criterion.filters) {
      criterion.subCriteria = [];
      const temp = new Criteria.ListCriterion();
      temp.filters = criterion.filters;
      criterion.subCriteria.push(temp);
    }
    return criterion;
  }

  /**
   * Set criterion data
   * @returns {Promise<any>}
   * @private
   */
  private _setCriterionData(): Promise<any> {
    return new Promise((resolve, reject) => {
      // loading show
      this.loadingShow();
      // get criterion list
      this.criterionApiFunc(this.criterion.criterionKey)
        .then((result) => {
          // translate criterion data (fit spec)
          this.criterionData = this._transCriterion(result);
          // loading hide
          this.loadingHide();
          // resovle
          resolve(result);
        })
        .catch(reason => reject(reason));
    });
  }

  /**
   * Is require translate
   * @param {string} label
   * @returns {boolean}
   * @private
   */
  private _isRequireTranslate(label: string): boolean {
    // if start with msg.*, translate label
    return -1 !== label.indexOf('msg.');
  }

  /**
   * Get translated filter name
   * @param {ListFilter} filter
   * @returns {string}
   * @private
   */
  private _getTranslateFilterName(filter: Criteria.ListFilter): string {
    switch (filter.criterionKey) {
      case Criteria.ListCriterionKey.STATUS:
        return this._getDatasourceStatusTranslate(filter.filterName);
      case Criteria.ListCriterionKey.DATASOURCE_TYPE:
        return this._getDataSourceTypeTranslate(filter.filterName);
      case Criteria.ListCriterionKey.SOURCE_TYPE:
        return this._getSourceTypeTranslate(filter.filterName);
      case Criteria.ListCriterionKey.CONNECTION_TYPE:
        return this._getConnectionTypeTranslate(filter.filterName);
      default:
        return this._isRequireTranslate(filter.filterName) ? this.translateService.instant(filter.filterName): filter.filterName;
    }
  }

  /**
   * Get datasource type translated label
   * @param {string} filterName
   * @returns {string}
   * @private
   */
  private _getDataSourceTypeTranslate(filterName: string): string {
    switch (filterName) {
      case DataSourceType.JOIN.toString():
        return this.translateService.instant('msg.storage.ui.source.type.join');
      case DataSourceType.MASTER.toString():
        return this.translateService.instant('msg.storage.ui.source.type.master');
      case DataSourceType.VOLATILITY.toString():
        return this.translateService.instant('msg.storage.ui.source.type.volatility');
      default:
        return this._isRequireTranslate(filterName) ? this.translateService.instant(filterName): filterName;
    }
  }

  /**
   * Get connection type translated label
   * @param {string} filterName
   * @returns {string}
   * @private
   */
  private _getConnectionTypeTranslate(filterName: string): string {
    switch (filterName) {
      case ConnectionType.ENGINE.toString():
        return this.translateService.instant('msg.storage.ui.list.ingested.data');
      case ConnectionType.LINK.toString():
        return this.translateService.instant('msg.storage.ui.list.linked.data');
      default:
        return this._isRequireTranslate(filterName) ? this.translateService.instant(filterName): filterName;
    }
  }

  /**
   * Get datasource status translated label
   * @param {string} filterName
   * @returns {string}
   * @private
   */
  private _getDatasourceStatusTranslate(filterName: string): string {
    switch (filterName) {
      case Status.ENABLED.toString():
        return 'Enabled';
      case Status.PREPARING.toString():
        return 'Preparing';
      case Status.DISABLED.toString():
        return 'Disabled';
      case Status.FAILED.toString():
        return 'Failed';
      case Status.BAD.toString():
        return 'Bad';
      default:
        return 'Disabled';
    }
  }

  /**
   * Get source type translated label
   * @param {string} filterName
   * @returns {string}
   * @private
   */
  private _getSourceTypeTranslate(filterName: string): string {
    switch (filterName) {
      case SourceType.IMPORT.toString():
        return this.translateService.instant('msg.storage.li.druid');
      case SourceType.FILE.toString():
        return this.translateService.instant('msg.storage.li.file');
      case SourceType.JDBC.toString():
        return this.translateService.instant('msg.storage.li.db');
      case SourceType.HIVE.toString():
        return this.translateService.instant('msg.storage.li.hive');
      case SourceType.REALTIME.toString():
        return this.translateService.instant('msg.storage.li.stream');
      case SourceType.SNAPSHOT.toString():
        return this.translateService.instant('msg.storage.li.ss');
      case SourceType.HDFS.toString():
        return filterName;
      default:
        return this._isRequireTranslate(filterName) ? this.translateService.instant(filterName): filterName;
    }
  }
}
