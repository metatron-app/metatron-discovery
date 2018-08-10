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

import { ElementRef, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { BaseOptionComponent } from './base-option.component';
import { BarMarkType, ChartType } from '../../common/component/chart/option/define/common';
import { Pivot } from '../../domain/workbook/configurations/pivot';
import { UIBarChart } from '../../common/component/chart/option/ui-option/ui-bar-chart';


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
   * series datalabel, tooltip disable처리 여부
   */
  public checkSeriesDisable(): boolean {

    let seriesShow: boolean = false;

    switch (this.uiOption.type) {
      // 바차트일때에는 중첩형인경우에만 series를 보여줌
      case ChartType.BAR:
        if ((this.pivot.aggregations.length > 1 || this.pivot.rows.length >= 1) && BarMarkType.STACKED == (<UIBarChart>this.uiOption).mark) {
          seriesShow = true;
        }
        break;

      // 라인차트인경우 멀티 시리즈일때에만 series를 보여줌
      case ChartType.LINE:
        if (this.pivot.aggregations.length > 1) seriesShow = true;
        break;

      // 그이외의 차트일때
      default:
        seriesShow = true;
        break;
    }

    return seriesShow;
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
