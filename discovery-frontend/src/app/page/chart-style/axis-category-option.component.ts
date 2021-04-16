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
import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {AxisLabelType, ChartAxisLabelType} from '@common/component/chart/option/define/common';
import {UIChartAxis} from '@common/component/chart/option/ui-option/ui-axis';
import {BaseOptionComponent} from './base-option.component';

@Component({
  selector: 'axis-category-option',
  templateUrl: './axis-category-option.component.html'
})
export class AxisCategoryOptionComponent extends BaseOptionComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 배경색상 투명도 리스트
  public transparencyList: object[] = [
    {name: 'None', value: 0},
    {name: '70%', value: 0.7},
    {name: '50%', value: 0.5},
    {name: '30%', value: 0.3},
    {name: '10%', value: 0.1},
  ];

  // axis 값설정
  @Input('axis')
  public axis: UIChartAxis;

  // 옵션패널의 상단에 위치여부 (구분선 show / hide)
  @Input('firstFl')
  public firstFl: boolean;

  // cateogry값 변경
  @Output('changeCategoryAxis')
  public changeCategoryAxis: EventEmitter<any> = new EventEmitter();

  public xAxisRotateFlag: boolean = false;

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
   * 축 라벨 표시여부
   * @param axisLabelType
   * @param show
   */
  public showAxisLabel(axisLabelType: any, show: boolean): void {

    if (_.eq(this.axis.mode, axisLabelType)) {
      this.axis.showLabel = show;
    }

    // 변경된 축값 emit
    this.changeCategoryAxis.emit(this.axis);
  }

  /**
   * 축 라벨 회전
   * @param axisLabelType
   * @param rotate
   */
  public rotateAxisLabel(axisLabelType: AxisLabelType, rotate: number): void {

    // 레이블표시가 false인경우 return
    if (!this.axis.showLabel) return;

    this.xAxisRotateFlag = false;

    if (_.eq(this.axis.mode, axisLabelType)) {
      this.axis.label = this.axis.label ? this.axis.label : {};
      this.axis.label.type = ChartAxisLabelType.CATEGORY;
      this.axis.label['rotation'] = rotate;
    }

    // 변경된 축값 emit
    this.changeCategoryAxis.emit(this.axis);
  }

  /**
   * 축 최대 길이 설정
   */
  public setMaxLength(): void {

    // 변경된 축값 emit
    this.changeCategoryAxis.emit(this.axis);
  }

  //
  // /**
  //  * 라인차트 numeric dimension show / hide 설정
  //  */
  // public showAxisConfig() {
  //
  //   // axisConfig show / hide 설정
  //   this.uiOption.xAxis.axisOption.showFl = !this.uiOption.xAxis.axisOption.showFl;
  //   this.uiOption = <UIOption>_.extend({}, this.uiOption, { xAxis: this.uiOption.xAxis });
  //   this.update();
  // }
  //
  // /**
  //  * axisConfig값을 변경시
  //  */
  // public changeAxisConfig(axisValue: number, type: string) {
  //
  //   const axisConfig = this.uiOption.xAxis.axisOption;
  //
  //   if (!axisConfig) return;
  //
  //   switch(type) {
  //     case 'min' :
  //       // null값인경우
  //       if (!axisValue) axisValue = axisConfig.originMin;
  //       // max값보다 같거나 큰경우
  //       else if (axisValue >= axisConfig.max) {
  //         Alert.info(this.translateService.instant('msg.page.chart.color.axis.config.start.limit.alert'));
  //         axisValue = axisConfig.originMin;
  //         return;
  //       }
  //       axisConfig.min = axisValue;
  //       break;
  //     case 'max' :
  //       // null값인경우 초기값으로 설정
  //       if (!axisValue) axisValue = axisConfig.originMax;
  //       else if (axisValue <= axisConfig.min) {
  //
  //         Alert.info(this.translateService.instant('msg.page.chart.color.axis.config.end.limit.alert'));
  //         axisValue = axisConfig.originMax;
  //         return;
  //       }
  //
  //       axisConfig.max = axisValue;
  //       break;
  //     case 'interval' :
  //
  //       // min / max값이 없는경우 기존값으로 설정
  //       axisConfig.max = !axisConfig.max ? axisConfig.originMax : axisConfig.max;
  //       axisConfig.min = !axisConfig.min ? axisConfig.originMin : axisConfig.min;
  //
  //       const diffVal = axisConfig.max - axisConfig.min;
  //       // max - min값보다 값이 큰경우
  //       if (diffVal < axisValue) {
  //         Alert.info(this.translateService.instant('msg.page.chart.color.axis.config.unit.limit.alert', {value: diffVal.toFixed(0)}));
  //         // 초기화
  //         axisValue = null;
  //         return;
  //       }
  //
  //       axisConfig.interval = axisValue;
  //       break;
  //   }
  //
  //   axisConfig.changeType = type;
  //   this.uiOption = <UIOption>_.extend({}, this.uiOption, { xAxis: this.uiOption.xAxis });
  //   this.update();
  // }
  //
  // /**
  //  * axis config show 설정구분값
  //  */
  // public numericDimensionCheck(): boolean {
  //
  //   const dimensionList = this.uiOption.fielDimensionList;
  //
  //   // dimensionList가 없는경우 return false
  //   if (!dimensionList) return false;
  //
  //   // 모든 dimension리스트의 값이 dimension이면서 logicalType이 integer/double일떄
  //   const checkDimensionList = dimensionList.filter((item) => {
  //
  //     if (item.type == 'dimension' && item.field.logicalType == LogicalType.INTEGER || item.field.logicalType == LogicalType.DOUBLE) {
  //       return item;
  //     }
  //   });
  //
  //   // length가 같을때 true
  //   return checkDimensionList.length == dimensionList.length;
  // }

  /**
   * 배경표시 on/off 변경
   */
  public toggleBackground(): void {

    // background가 있는경우
    if (this.axis.background) {

      // 제거
      this.axis.background = null;

      // background가 없는경우
    } else {

      // 생성
      this.axis.background = {};
      this.axis.background.color = '#eeeeee';
      this.axis.background.transparency = this.transparencyList[3]['value'];
    }

    // 변경된 축값 emit
    this.changeCategoryAxis.emit(this.axis);
  }

  /**
   * 배경 색상 변경시
   * @param {string} color
   */
  public changeBackgroundColor(color: string): void {

    // 색상 설정
    this.axis.background.color = color;

    // 변경된 축값 emit
    this.changeCategoryAxis.emit(this.axis);
  }

  /**
   * 배경 투명도 변경시
   * @param {Object} data
   */
  public changeTransprency(data: object): void {

    // 투명도 설정
    this.axis.background.transparency = data['value'];

    // 변경된 축값 emit
    this.changeCategoryAxis.emit(this.axis);
  }

  /**
   * 배경 투명도의 index 구하기
   * @returns {number}
   */
  public getTransparencyIndex(): number {

    return _.findIndex(this.transparencyList, (item) => {
      return item['value'] === this.axis.background.transparency
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
