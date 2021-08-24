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

import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UIOption} from '@common/component/chart/option/ui-option';
import {LogicalType} from '@domain/datasource/datasource';
import {
  AxisLabelType,
  ChartAxisLabelType,
  ChartType,
  UIFormatCurrencyType,
  UIFormatType,
  UIOrient
} from '@common/component/chart/option/define/common';
import {Alert} from '@common/util/alert.util';
import * as _ from 'lodash';
import {FormatOptionComponent} from './format-option.component';
import {UIChartAxis, UIChartAxisLabelValue} from '@common/component/chart/option/ui-option/ui-axis';
import {OptionGenerator} from '@common/component/chart/option/util/option-generator';
import {Format} from '@domain/workbook/configurations/format';
import UI = OptionGenerator.UI;

@Component({
  selector: 'yaxis-option',
  templateUrl: './yaxis-option.component.html'
})
export class YAxisOptionComponent extends FormatOptionComponent implements OnInit, OnDestroy {

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

  public yAxisRotateFlag: boolean = false;

  public nameUiOption: UIOption;

  // Alias 변경 이벤트
  @Output('changeAxisName')
  public changeAxisNameEvent: EventEmitter<any> = new EventEmitter();

  // 보조축 여부
  public isSecondaryAxis: boolean = false;

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

    // Secondary Axis
    if (this.isSecondaryAxis && !this.uiOption.secondaryAxis) {

      // label값 생성
      this.uiOption.secondaryAxis = _.cloneDeep(this.uiOption.yAxis);
      this.uiOption.secondaryAxis.mode = AxisLabelType.SUBCOLUMN;
      this.uiOption.secondaryAxis.label = UI.AxisLabel.axisLabelForValue(ChartAxisLabelType.VALUE);
    }

    if( this.uiOption.secondaryAxis && this.uiOption.secondaryAxis.mode !== AxisLabelType.SUBCOLUMN ) {
      this.uiOption.secondaryAxis.mode = AxisLabelType.SUBCOLUMN;
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
   * @param _idx
   * @param name
   */
  public axisName(axisLabelType: any, _idx: number, name: string): void {

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

    if (_.eq(this.uiOption.yAxis.mode, axisLabelType)) {
      this.uiOption.yAxis.name = value;
    }

    if (_.isEmpty(value) || (value && _.isEmpty(value.trim()))) {
      delete this.uiOption.yAxis.customName;
    } else {
      this.uiOption.yAxis.customName = value.trim();
    }

    this.uiOption = _.extend({}, this.uiOption, {yAxis: this.uiOption.yAxis}) as UIOption;
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

    if (_.eq(this.uiOption.yAxis.mode, axisLabelType)) {
      this.uiOption.yAxis.showName = show;
    }
    this.uiOption = _.extend({}, this.uiOption, {yAxis: this.uiOption.yAxis}) as UIOption;

    this.update();
  }

  /**
   * 축 라벨 표시여부
   *
   * @param axisLabelType
   * @param show
   */
  public showAxisLabel(axisLabelType: any, show: boolean): void {

    if (_.eq(this.uiOption.yAxis.mode, axisLabelType)) {
      this.uiOption.yAxis.showLabel = show;
    }
    this.uiOption = _.extend({}, this.uiOption, {yAxis: this.uiOption.yAxis}) as UIOption;

    this.update();
  }

  /**
   * 축 라벨 회전
   *
   * @param axisLabelType
   * @param rotate
   */
  public rotateAxisLabel(axisLabelType: any, rotate: any): void {
    this.xAxisRotateFlag = false;
    this.yAxisRotateFlag = false;

    if (_.eq(this.uiOption.yAxis.mode, axisLabelType)) {
      this.uiOption.yAxis.label = this.uiOption.yAxis.label ? this.uiOption.yAxis.label : {};
      this.uiOption.yAxis.label['rotation'] = rotate;
    }
    this.uiOption = _.extend({}, this.uiOption, {yAxis: this.uiOption.yAxis}) as UIOption;

    this.update();
  }

  /**
   * 라인차트 numeric dimension show / hide 설정
   */
  public showAxisConfig() {

    this.uiOption.yAxis.axisOption.showFl = !this.uiOption.yAxis.axisOption.showFl;
    this.uiOption = _.extend({}, this.uiOption, {yAxis: this.uiOption.yAxis}) as UIOption;
    this.update();
  }

  /**
   * axisConfig값을 변경시
   */
  public changeAxisConfig(axisValue: number, type: string) {

    const axisConfig = this.uiOption.yAxis.axisOption;

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
    this.uiOption = _.extend({}, this.uiOption, {yAxis: this.uiOption.yAxis}) as UIOption;
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
   * 레이블 설정 manual로 설정시
   */
  public showLabel() {

    // 레이블 설정이 안된경우
    if (!(this.uiOption.yAxis.label as UIChartAxisLabelValue).format) {

      // 기본 포맷 사용 false
      (this.uiOption.yAxis.label as UIChartAxisLabelValue).useDefault = false;

      (this.uiOption.yAxis.label as UIChartAxisLabelValue).format = UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true);

      // 레이블 설정이 되어있는경우
    } else {

      // 기본 포맷 사용 true
      (this.uiOption.yAxis.label as UIChartAxisLabelValue).useDefault = true;

      // 포멧값 제거
      delete (this.uiOption.yAxis.label as UIChartAxisLabelValue).format;
    }

    // y축에 설정
    this.uiOption = _.extend({}, this.uiOption, {yAxis: this.uiOption.yAxis}) as UIOption;

    // 이벤트 발생
    this.update();
  }

  /**
   * format item 변경시
   * @param target
   */
  public onChange(target: object): void {

    // 축 라벨의 포맷값 설정
    (this.uiOption.yAxis.label as UIChartAxisLabelValue).format = target as Format;

    // y축에 설정
    this.uiOption = _.extend({}, this.uiOption, {yAxis: this.uiOption.yAxis}) as UIOption;

    // 이벤트 발생
    this.update();
  }

  /**
   * y축에 해당값 설정
   */
  public changeYAxisValue(axis: UIChartAxis): void {

    this.uiOption = _.extend({}, this.uiOption, {yAxis: axis}) as UIOption;

    this.update();
  }

  /**
   * 기준선 변경
   * @param axis
   */
  public changeBaseline(axis: UIChartAxis): void {

    this.uiOption = _.extend({}, this.uiOption, {yAxis: axis}) as UIOption;

    this.update({});
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
