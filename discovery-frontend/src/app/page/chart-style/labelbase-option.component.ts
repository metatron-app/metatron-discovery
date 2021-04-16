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

import {ElementRef, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {BaseOptionComponent} from './base-option.component';
import {ChartType} from '@common/component/chart/option/define/common';
import {Pivot} from '@domain/workbook/configurations/pivot';

export class LabelBaseOptionComponent extends BaseOptionComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('pivot')
  public pivot: Pivot;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * set category datalabel, tooltip disable
   */
  public checkCategoryDisable(): boolean {

    let categoryDisable: boolean = false;

    switch (this.uiOption.type) {
      // when bar chart has multi series, disable category value, category percentage
      case ChartType.BAR:
        if ((this.pivot.aggregations.length > 1 || this.pivot.rows.length >= 1)) {
          categoryDisable = true;
        }
        break;

      // when line, combine chart has multi series, disable category value, category percentage
      case ChartType.LINE:
      case ChartType.COMBINE:
        if (this.pivot.aggregations.length > 1) categoryDisable = true;
        break;
    }

    return categoryDisable;
  }

  /**
   * set series datalabel, tooltip disable
   */
  public checkSeriesDisable(): boolean {

    let seriesDisable: boolean = false;

    switch (this.uiOption.type) {
      // when bar chart has single series, disable series
      case ChartType.BAR:
        if (this.pivot.aggregations.length <= 1 && this.pivot.rows.length < 1) {
          seriesDisable = true;
        }
        break;

      // when line chart has single series, disable series
      case ChartType.LINE:
      case ChartType.COMBINE:
        if (this.pivot.aggregations.length <= 1) seriesDisable = true;
        break;
    }

    return seriesDisable;
  }

  /**
   * set series name datalabel disable series name
   * @returns {boolean}
   */
  public checkSeriesNameDisable(): boolean {

    let seriesNameDisable: boolean = false;

    switch (this.uiOption.type) {
      // when heatmap chart disable series name
      case ChartType.HEATMAP:
        if (this.pivot.rows.length < 1) {
          seriesNameDisable = true;
        }
        break;
    }

    return seriesNameDisable;

  }

  /**
   * categoryname disable 처리 여부
   * @returns {boolean}
   */
  public checkCategoryNameDisable(): boolean {

    let categoryNameShow: boolean = false;

    switch (this.uiOption.type) {

      case ChartType.GAUGE:
        // 차원값이 1개이상인경우
        if (this.pivot.rows.length > 1) categoryNameShow = true;
        break;
      default:
        categoryNameShow = true;
        break;
    }

    return categoryNameShow;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
