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

import { Component, ElementRef, EventEmitter, Injector, Input, Output } from '@angular/core';
import {YAxisOptionComponent} from './yaxis-option.component';
import {AxisLabelType} from '../../common/component/chart/option/define/common';
import {Alert} from '../../common/util/alert.util';
import * as _ from 'lodash';
import {UIOption} from '../../common/component/chart/option/ui-option';
import {UIChartAxis} from '../../common/component/chart/option/ui-option/ui-axis';

@Component({
  selector: 'secondary-axis-option',
  templateUrl: './secondary-axis-option.component.html'
})
export class SecondaryAxisOptionComponent extends YAxisOptionComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 보조축 여부
  public isSecondaryAxis: boolean = true;

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
   * 축 이름
   *
   * @param axisType
   * @param index
   * @param event
   */
  public axisName(axisLabelType: any, idx: number, event: any): void {

    // enter시 currentTarget.value값으로 설정, click시 row / column에 따라 nameUiOption axis name값으로 설정
    const value = event.currentTarget.value ? event.currentTarget.value : this.nameUiOption.secondaryAxis.customName;

    // max length validation
    if (value && value.length > 20) {

      // alert
      Alert.info(this.translateService.instant('msg.page.alert.axis.label.warn'));
      return;
    }

    if( _.eq(this.uiOption.secondaryAxis.mode, axisLabelType) ) {
      this.uiOption.secondaryAxis.name = value;
    }

    if (_.isEmpty(value) || (value && _.isEmpty(value.trim()))) {
      delete this.uiOption.secondaryAxis.customName;
    }
    else {
      this.uiOption.secondaryAxis.customName = value.trim();
    }

    this.uiOption = <UIOption>_.extend({}, this.uiOption, { secondaryAxis: this.uiOption.secondaryAxis });
    this.update();
    this.changeAxisNameEvent.emit();
  }

  /**
   * Secondary Axis Setting
   */
  public changeSecondaryAxisValue(axis: UIChartAxis): void {

    this.uiOption = <UIOption>_.extend({}, this.uiOption, { secondaryAxis: axis });

    this.update();
  }

  /**
   * Secondary Axis Baseline Change
   * @param axis
   */
  public changeSecondaryAxisBaseline(axis: UIChartAxis): void {

    this.uiOption = <UIOption>_.extend({}, this.uiOption, { secondaryAxis: axis });

    this.update({});
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
