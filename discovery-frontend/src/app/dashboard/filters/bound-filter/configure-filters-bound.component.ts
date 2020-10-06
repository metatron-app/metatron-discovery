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

import * as _ from 'lodash';
import { AbstractFilterPopupComponent } from '../abstract-filter-popup.component';
import { ElementRef, OnDestroy, OnInit, Injector, Component, ViewChild } from '@angular/core';
import { BoundFilter } from '../../../domain/workbook/configurations/filter/bound-filter';
import { Field } from '../../../domain/datasource/datasource';
import { CustomField } from '../../../domain/workbook/configurations/field/custom-field';
import { Dashboard } from '../../../domain/dashboard/dashboard';
import { DatasourceService } from '../../../datasource/service/datasource.service';
import { BoundFilterComponent } from './bound-filter.component';

@Component({
  selector: 'app-config-filter-bound',
  templateUrl: './configure-filters-bound.component.html'
})
export class ConfigureFiltersBoundComponent extends AbstractFilterPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(BoundFilterComponent)
  private _boundFilterComp: BoundFilterComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public isShow: boolean = false;         // 컴포넌트 표시 여부

  // 수정 정보
  public targetFilter: BoundFilter;         // 필터
  public targetField: Field | CustomField;  // 필드
  public dashboard: Dashboard;              // 대시보드

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 컴포넌트를 표시한다.
   * @param {Dashboard} board
   * @param {BoundFilter} targetFilter
   * @param {Field | CustomField} targetField
   */
  public showComponent(board: Dashboard, targetFilter: BoundFilter, targetField?: (Field | CustomField)) {
    this.loadingShow();
    this.datasourceService.getCandidateForFilter(targetFilter, board, [], targetField).then((result) => {
      this._setBoundFilter(result, targetFilter);
      this.dashboard = _.cloneDeep( board );
      this.targetField = _.cloneDeep( targetField );
      this.targetFilter = _.cloneDeep( targetFilter );
      this.isShow = true;
      this.safelyDetectChanges();
      this.loadingHide();
    }).catch(err => this.commonExceptionHandler(err));
  } // function - showComponent

  /**
   * 현재 설정된 정보를 반환한다.
   * @return {BoundFilter}
   */
  public getData(): BoundFilter {
    return this._boundFilterComp.getData();
  } // function - getData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * BoundFilter Candidate 결과 처리
   * @param result
   * @param {BoundFilter} targetFilter
   * @private
   */
  private _setBoundFilter(result: any, targetFilter: BoundFilter) {
    const boundFilter: BoundFilter = targetFilter;
    if (result && result.hasOwnProperty('maxValue')) {
      if ((boundFilter.min === Number.MIN_SAFE_INTEGER && boundFilter.max === Number.MAX_SAFE_INTEGER) || boundFilter.min == null) {
        boundFilter.min = result.minValue;
        boundFilter.max = result.maxValue;
      }
      boundFilter.maxValue = result.maxValue;
      boundFilter.minValue = result.minValue;
    } else {
      boundFilter.min = null;
      boundFilter.max = null;
      boundFilter.maxValue = null;
      boundFilter.minValue = null;
    }
  } // function - _setBoundFilter

}
