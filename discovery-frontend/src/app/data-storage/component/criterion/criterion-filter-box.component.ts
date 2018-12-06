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
import { AbstractComponent } from '../../../common/component/abstract.component';
import { StringUtil } from '../../../common/util/string.util';
import { CriterionKey, CriterionType, ListCriterion } from '../../../domain/datasource/listCriterion';
import { ListFilter } from '../../../domain/datasource/listFilter';

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

  // selected item default label
  private _defaultSelectedItemLabel: string = this.translateService.instant('msg.storage.ui.criterion.all');

  // criterion api (required: true)
  @Input('criterionApiFunc')
  private _getCriterionFunc: Function;

  // criterion (required: true)
  @Input('criterion')
  public criterion: ListCriterion;

  // is enable criterion filter remove button
  @Input('enableRemove')
  public isEnableRemoveButton: boolean;

  // default selected item list
  @Input('defaultSelectedItemList')
  public defaultSelectedItemList: any;

  // criterion key
  public criterionKey: CriterionKey;
  // criterion type
  public criterionType: CriterionType;
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
  public criterionData: ListCriterion;

  // list show/hide flag
  public isShowList = false;

  // changed criteria
  @Output('changedCriteria')
  private _changedCriteriaEvent: EventEmitter<any> = new EventEmitter();

  // removed criterion
  @Output('removedCriterion')
  private _removedCriterionEvent: EventEmitter<any> = new EventEmitter();

  @Input('removeCriterionKey')
  private set _removeCriterionKey(key: CriterionKey) {
    // if criterion key MORE, exist key
    if (this.criterionKey === CriterionKey.MORE && key) {
      // remove criterion in selected criterion list
      this._selectedItemList[key] = [];
      // change selected item
      this.onChangedSelectItem(this._selectedItemList);
    }
  };

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
      const temp = new ListCriterion();
      // set criterion name
      temp.criterionName = this.translateService.instant('msg.storage.ui.criterion.criteria');
      // create new filters
      temp.filters = [];
      // loop
      this.criterion.subCriteria.forEach(item => temp.filters.push(new ListFilter(item.criterionKey.toString(), this.translateService.instant(item.criterionName), null)));
      // init subCriteria
      this.criterion.subCriteria = [];
      // push translated criterion
      this.criterion.subCriteria.push(temp);
      // set criterionData
      this.criterionData = this.criterion;
    }
    // set filter title
    this.filterTitle = this.translateService.instant(this.criterionName);
    // set search placeholder
    this.searchPlaceHolder = this.translateService.instant('msg.storage.ui.criterion.search', {value: this.translateService.instant(this.criterionName)});
    // set selected item label
    this.selectedItemsLabel = this._defaultSelectedItemLabel;
    // if exist default selected item list
    if (this.defaultSelectedItemList) {
      // set selected item list
      this._selectedItemList = this.defaultSelectedItemList;
      // set selected item label
      this.selectedItemsLabel = this._makeItemsLabel(this._selectedItemList);
    }
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
   * @param {MouseEvent} event
   */
  public onClickShowList(event: MouseEvent) {
    if (this.criterionKey !== CriterionKey.MORE &&
      ($(event.target).hasClass('ddp-result-filtering')
        || $(event.target).hasClass('ddp-txt-label')
        || $(event.target).hasClass('ddp-ui-result')
        || $(event.target).hasClass('ddp-box-result')
        || $(event.target).hasClass('ddp-txt-result'))) {
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
    // only show not MORE
    return this.criterionKey !== CriterionKey.MORE && this.selectedItemsLabel === this._defaultSelectedItemLabel;
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
            if (StringUtil.isEmpty(temp)) {
              temp += this._isRequireTranslate(item.filterName) ? this.translateService.instant(item.filterName) : item.filterName;
            } else {
              temp += `, ${this._isRequireTranslate(item.filterName) ? this.translateService.instant(item.filterName) : item.filterName}`;
            }
        }));
    }

    return StringUtil.isEmpty(temp) ? this._defaultSelectedItemLabel : temp;
  }

  /**
   * Criterion fit a spec
   * @param {ListCriterion} criterion
   * @returns {ListCriterion}
   * @private
   */
  private _transCriterion(criterion: ListCriterion): ListCriterion {
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
      const temp = new ListCriterion();
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
}
