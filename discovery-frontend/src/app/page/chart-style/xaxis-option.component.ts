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
import {LogicalType} from '@domain/datasource/datasource';
import {UIOption} from '@common/component/chart/option/ui-option';
import {AxisLabelType, ChartAxisLabelType, ChartType, UIOrient} from '@common/component/chart/option/define/common';
import {Alert} from '@common/util/alert.util';
import {BaseOptionComponent} from './base-option.component';
import {UIChartAxis} from '@common/component/chart/option/ui-option/ui-axis';
import {OptionGenerator} from '@common/component/chart/option/util/option-generator';
import UI = OptionGenerator.UI;

@Component({
  selector: 'xaxis-option',
  templateUrl: './xaxis-option.component.html'
})
export class XAxisOptionComponent extends BaseOptionComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public xAxisRotateFlag: boolean = false;

  public nameUiOption: UIOption;

  // gauge: label direction
  public labelDirectionList: object[] = [
    {name: '가로방향', value: 'HORIZONTAL'},
    {name: '세로방향', value: 'VERTICAL'}
  ];

  // Alias 변경 이벤트
  @Output('changeAxisName')
  public changeAxisNameEvent: EventEmitter<any> = new EventEmitter();

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

  @Input('uiOption')
  public set setUiOption(uiOption: UIOption) {

    // Set
    this.uiOption = uiOption;

    // 라벨값이 없는경우
    if (!this.uiOption.xAxis.label) {

      // scatter 차트인경우 value값으로 설정
      if (_.eq(ChartType.SCATTER, this.uiOption.type)) {
        this.uiOption.xAxis.label = UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE);
      } else {
        // label값 생성
        this.uiOption.xAxis.label = this.uiOption['align'] && UIOrient.HORIZONTAL === this.uiOption['align'] ? UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE) : UI.AxisLabel.axisLabelForCategory(ChartAxisLabelType.CATEGORY);
      }
    }
    // 라벨값이 없는경우
    if (!this.uiOption.yAxis.label) {

      // heatmap 차트인경우 category값으로 설정
      if (_.eq(ChartType.HEATMAP, this.uiOption.type)) {
        this.uiOption.yAxis.label = UI.AxisLabel.axisLabelForCategory(ChartAxisLabelType.CATEGORY);
      } else {
        // label값 생성
        this.uiOption.yAxis.label = this.uiOption['align'] && UIOrient.HORIZONTAL === this.uiOption['align'] ? UI.AxisLabel.axisLabelForCategory(ChartAxisLabelType.CATEGORY) : UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE);
      }
    }

    // Clone
    this.nameUiOption = _.cloneDeep(this.uiOption);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 축 이름
   *
   * @param axisLabelType
   * @param name
   */
  public axisName(axisLabelType: any, name: string): void {

    // axis title이 hide이면 설정 x
    if (!this.uiOption.xAxis.showName) return;

    // enter시 currentTarget.value값으로 설정, click시 row / column에 따라 nameUiOption axis name값으로 설정
    const value = name ? name : AxisLabelType.ROW === axisLabelType ? this.nameUiOption.xAxis.customName : this.nameUiOption.yAxis.customName;

    // max length validation
    if (value && value.length > 20) {

      // alert
      Alert.info(this.translateService.instant('msg.page.alert.axis.label.warn'));
      return;
    }

    if (_.eq(this.uiOption.xAxis.mode, axisLabelType)) {
      this.uiOption.xAxis.name = value;
    }

    if (_.isEmpty(value) || (value && _.isEmpty(value.trim()))) {
      delete this.uiOption.xAxis.customName;
    } else {
      this.uiOption.xAxis.customName = value.trim();
    }

    this.uiOption = (_.extend({}, this.uiOption, {xAxis: this.uiOption.xAxis}) as UIOption);
    this.update();
    this.changeAxisNameEvent.emit();
  }

  /**
   * 축 타이틀 표시여부
   *
   * @param axisLabelType
   * @param show
   */
  public showAxisName(axisLabelType: any, show: boolean): void {

    if (_.eq(this.uiOption.xAxis.mode, axisLabelType)) {
      this.uiOption.xAxis.showName = show;
    }
    this.uiOption = (_.extend({}, this.uiOption, {xAxis: this.uiOption.xAxis}) as UIOption);

    this.update();
  }

  /**
   * 축 라벨 표시여부
   *
   * @param axisLabelType
   * @param show
   */
  public showAxisLabel(axisLabelType: any, show: boolean): void {

    if (_.eq(this.uiOption.xAxis.mode, axisLabelType)) {
      this.uiOption.xAxis.showLabel = show;
    }
    this.uiOption = (_.extend({}, this.uiOption, {xAxis: this.uiOption.xAxis}) as UIOption);

    this.update();
  }

  /**
   * 축 라벨 회전
   *
   * @param axisLabelType
   * @param rotate
   */
  public rotateAxisLabel(axisLabelType: AxisLabelType, rotate: number): void {

    // 레이블표시가 false인경우 return
    if (!this.uiOption.xAxis.showLabel) return;

    this.xAxisRotateFlag = false;

    if (_.eq(this.uiOption.xAxis.mode, axisLabelType)) {
      this.uiOption.xAxis.label = this.uiOption.xAxis.label ? this.uiOption.xAxis.label : {};
      this.uiOption.xAxis.label.type = ChartAxisLabelType.CATEGORY;
      this.uiOption.xAxis.label['rotation'] = rotate;
    }
    this.uiOption = (_.extend({}, this.uiOption, {xAxis: this.uiOption.xAxis}) as UIOption);

    this.update();
  }

  /**
   * 라인차트 numeric dimension show / hide 설정
   */
  public showAxisConfig() {

    // axisConfig show / hide 설정
    this.uiOption.xAxis.axisOption.showFl = !this.uiOption.xAxis.axisOption.showFl;
    this.uiOption = (_.extend({}, this.uiOption, {xAxis: this.uiOption.xAxis}) as UIOption);
    this.update();
  }

  /**
   * axisConfig값을 변경시
   */
  public changeAxisConfig(axisValue: number, type: string) {

    const axisConfig = this.uiOption.xAxis.axisOption;

    if (!axisConfig) return;

    switch (type) {
      case 'min' :
        // null값인경우
        if (!axisValue) axisValue = axisConfig.originMin;
        // max값보다 같거나 큰경우
        else if (axisValue >= axisConfig.max) {
          Alert.info(this.translateService.instant('msg.page.chart.color.axis.config.start.limit.alert'));
          axisValue = axisConfig.originMin;
          return;
        }
        axisConfig.min = axisValue;
        break;
      case 'max' :
        // null값인경우 초기값으로 설정
        if (!axisValue) axisValue = axisConfig.originMax;
        else if (axisValue <= axisConfig.min) {

          Alert.info(this.translateService.instant('msg.page.chart.color.axis.config.end.limit.alert'));
          axisValue = axisConfig.originMax;
          return;
        }

        axisConfig.max = axisValue;
        break;
      case 'interval' :

        // min / max값이 없는경우 기존값으로 설정
        axisConfig.max = !axisConfig.max ? axisConfig.originMax : axisConfig.max;
        axisConfig.min = !axisConfig.min ? axisConfig.originMin : axisConfig.min;

        const diffVal = axisConfig.max - axisConfig.min;
        // max - min값보다 값이 큰경우
        if (diffVal < axisValue) {
          Alert.info(this.translateService.instant('msg.page.chart.color.axis.config.unit.limit.alert', {value: diffVal.toFixed(0)}));
          // 초기화
          axisValue = null;
          return;
        }

        axisConfig.interval = axisValue;
        break;
    }

    axisConfig.changeType = type;
    this.uiOption = (_.extend({}, this.uiOption, {xAxis: this.uiOption.xAxis}) as UIOption);
    this.update();
  }

  /**
   * axis config show 설정구분값
   */
  public numericDimensionCheck(): boolean {

    const dimensionList = this.uiOption.fielDimensionList;

    // dimensionList가 없는경우 return false
    if (!dimensionList) return false;

    // 모든 dimension리스트의 값이 dimension이면서 logicalType이 integer/double일떄
    const checkDimensionList = dimensionList.filter((item) => {

      if (item.type === 'dimension' && item.field.logicalType === LogicalType.INTEGER || item.field.logicalType === LogicalType.DOUBLE) {
        return item;
      }
    });

    // length가 같을때 true
    return checkDimensionList.length === dimensionList.length;
  }

  /**
   * x축에 해당값 설정
   */
  public changeXAxisValue(axis: UIChartAxis): void {

    this.uiOption = (_.extend({}, this.uiOption, {xAxis: axis}) as UIOption);

    this.update();
  }

  /**
   * 기준선 변경
   * @param axis
   */
  public changeBaseline(axis: UIChartAxis): void {

    this.uiOption = (_.extend({}, this.uiOption, {xAxis: axis}) as UIOption);

    this.update({});
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
