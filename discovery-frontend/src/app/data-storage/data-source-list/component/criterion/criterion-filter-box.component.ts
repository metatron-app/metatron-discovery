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

import { Component, ElementRef, EventEmitter, Injector, Input, Output } from '@angular/core';
import { AbstractComponent } from '../../../../common/component/abstract.component';
import { CriterionKey, CriterionType, DatasourceCriterion } from '../../../../domain/datasource/datasourceCriterion';
import { DatasourceService } from '../../../../datasource/service/datasource.service';
import { DataSourceListFilter } from '../../../../domain/datasource/datasourceListFilter';
import { StringUtil } from '../../../../common/util/string.util';

@Component({
  selector: 'criterion-filter-box',
  templateUrl: 'criterion-filter-box.component.html',
  host: {
    '(document:click)': 'onClickHost($event)',
  }
})
export class CriterionFilterBoxComponent extends AbstractComponent {

  // selected item list
  private _selectedItemList : any = {};

  // criterion (required: true)
  @Input('criterion')
  public criterion: DatasourceCriterion;

  // criterion api (required: true)
  @Input('criterionApiFunc')
  private _getCriterionFunc: Function;

  // criterion key
  public criterionKey: CriterionKey;
  // criterion type
  public criterionType: CriterionType;
  // criterion name
  public criterionName: string;

  // place holder
  public placeHolder: string;
  // search place holder
  public searchPlaceHolder: string;
  // selected item label
  public selectedItemsLabel: string = this.translateService.instant('msg.storage.ui.criterion.all');

  // Is enable ALL Option (default false)
  public isEnableAllOption: boolean = false;

  // criterion data
  public criterionData: DatasourceCriterion;

  // list show/hide flag
  public isShowList = false;

  // changed criteria
  @Output('changedCriteria')
  private _changedCriteriaEvent: EventEmitter<any> = new EventEmitter();


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
    // set criterion key
    this.criterionKey = this.criterion.criterionKey;
    // set criterion name
    this.criterionName = this.criterion.criterionName;
    // set criterion type
    this.criterionType = this.criterion.criterionType;
    // if criterion key is More, and exist subCriteria data
    if (this.criterionKey === CriterionKey.MORE && this.criterion.subCriteria) {
      // create new criterion used translate
      const temp = new DatasourceCriterion();
      // set criterion name
      temp.criterionName = this.translateService.instant('msg.storage.ui.criterion.criteria');
      // create new filters
      temp.filters = [];
      // loop
      this.criterion.subCriteria.forEach(item => temp.filters.push(new DataSourceListFilter(item.criterionKey.toString(), this.translateService.instant(item.criterionName), null)));
      // init subCriteria
      this.criterion.subCriteria = [];
      // push translated criterion
      this.criterion.subCriteria.push(temp);
      // set criterionData
      this.criterionData = this.criterion;
    }
    // set placeholder
    this.placeHolder = this.translateService.instant(this.criterionName);
    // set search placeholder
    this.searchPlaceHolder = this.translateService.instant('msg.storage.ui.criterion.search', {value: this.translateService.instant(this.criterionName)});
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
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
   */
  public onClickShowList(event: MouseEvent) {
    if ($(event.target).attr('class') && (-1 !== $(event.target).attr('class').indexOf('ddp-box-result') || -1 !== $(event.target).attr('class').indexOf('ddp-txt-result'))) {
      // if criterionKey is not MORE
      if (this.criterionKey !== CriterionKey.MORE) {
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
  }

  /**
   * Change selected item
   * @param selectedItemList
   */
  public onChangedSelectItem(selectedItemList: any): void {
    // set selected item list
    this._selectedItemList = selectedItemList;
    // if criterion key is not More
    if (this.criterionKey !== CriterionKey.MORE) {
      // set selected item label
      this.selectedItemsLabel = this._makeItemsLabel(selectedItemList);
    }
    // change event
    this._changedCriteriaEvent.emit({
      label: this.criterionKey,
      value: selectedItemList
    });
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
    if (this.criterionType.toString().indexOf('DATETIME') !== -1) {
      Object.keys(selectedItemList).forEach(key =>
        key !== 'ALL' && selectedItemList[key].forEach((item) => {
          temp += StringUtil.isEmpty(temp) ? (item.filterName || this.translateService.instant('msg.storage.ui.criterion.time.past')) : ` ~ ${(item.filterName || this.translateService.instant('msg.storage.ui.criterion.time.current'))}`;
        }));
    } else {
      Object.keys(selectedItemList).forEach(key =>
        selectedItemList[key].forEach((item) => {
          temp += StringUtil.isEmpty(temp) ? item.filterName : `, ${item.filterName}`;
        }));
    }

    return StringUtil.isEmpty(temp) ? this.translateService.instant('msg.storage.ui.criterion.all') : temp;
  }

  /**
   * Criterion fit a spec
   * @param {DatasourceCriterion} criterion
   * @returns {DatasourceCriterion}
   * @private
   */
  private _transCriterion(criterion: DatasourceCriterion): DatasourceCriterion {
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
      const temp = new DatasourceCriterion();
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
      this._getCriterionFunc(this.criterionKey)
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
}
