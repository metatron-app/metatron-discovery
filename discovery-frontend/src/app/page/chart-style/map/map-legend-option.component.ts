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

import {Component, ElementRef, Injector} from '@angular/core';
import {BaseOptionComponent} from '../base-option.component';
import {UIOption} from '@common/component/chart/option/ui-option';
import * as _ from 'lodash';
import {UIPosition} from '@common/component/chart/option/define/common';
import {UIMapOption} from '@common/component/chart/option/ui-option/map/ui-map-chart';

@Component({
  selector: 'map-legend-option',
  templateUrl: './map-legend-option.component.html'
})
export class MapLegendOptionComponent extends BaseOptionComponent {

  // legend position list
  public legendPositionList: object[] = [
    {
      name: this.translateService.instant('msg.page.ui.legend.legend.position.right.bottom'),
      value: UIPosition.RIGHT_BOTTOM
    },
    {name: this.translateService.instant('msg.page.ui.legend.legend.position.right.top'), value: UIPosition.RIGHT_TOP},
    {
      name: this.translateService.instant('msg.page.ui.legend.legend.position.left.bottom'),
      value: UIPosition.LEFT_BOTTOM
    },
    {name: this.translateService.instant('msg.page.ui.legend.legend.position.left.top'), value: UIPosition.LEFT_TOP}
  ];

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /**
   * change legend position
   * @param legend
   */
  public changeLegendPos(legend: any): void {

    this.uiOption.legend.pos = legend['value'];

    this.uiOption = (_.extend({}, this.uiOption, {legend: this.uiOption.legend}) as UIOption);

    this.update();
  }

  /**
   * toggle legend
   */
  public toggleLegend(): void {

    this.uiOption.legend.showName = !this.uiOption.legend.showName;

    this.uiOption = (_.extend({}, this.uiOption, {legend: this.uiOption.legend}) as UIMapOption);

    this.update();
  }

  /**
   * get index of legend position
   */
  public getLegendPosIndex(): number {

    const pos = this.uiOption.legend.pos;

    let index: number = 0;

    if (!pos) return 0;

    _.each(this.legendPositionList, (item, idx) => {

      if (item['value'] === pos) {
        index = idx;
        return;
      }
    });

    return index;
  }
}
