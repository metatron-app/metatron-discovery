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
import {isUndefined} from 'util';
import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {
  AxisLabelType,
  ChartAxisGridType,
  UIFormatCurrencyType,
  UIFormatType
} from '@common/component/chart/option/define/common';
import {FormatOptionComponent} from './format-option.component';
import {UIChartAxis, UIChartAxisLabelValue} from '@common/component/chart/option/ui-option/ui-axis';
import {OptionGenerator} from '@common/component/chart/option/util/option-generator';
import {Format} from '@domain/workbook/configurations/format';
import {UIOption} from '@common/component/chart/option/ui-option';
import {AxisOptionConverter} from '@common/component/chart/option/converter/axis-option-converter';
import {Alert} from '@common/util/alert.util';
import {FormatOptionConverter} from '@common/component/chart/option/converter/format-option-converter';
import UI = OptionGenerator.UI;

@Component({
  selector: 'axis-value-option',
  templateUrl: './axis-value-option.component.html'
})
export class AxisValueOptionComponent extends FormatOptionComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 축옵션 컨버터 (min/max PH용)
  public AxisOptionConverter: any = AxisOptionConverter;

  // 선굵기 리스트
  public lineThickList: object[] = [];

  // 선유형 리스트
  public lineTypeList: object[] = [];

  public axisTemp: UIChartAxis;

  // value값 변경
  @Output('changeValueAxis')
  public changeValueAxis: EventEmitter<any> = new EventEmitter();

  // 기준선 변경
  @Output('changeBaseline')
  public changeBaseline: EventEmitter<any> = new EventEmitter();

  // axis 값설정
  public axis: UIChartAxis;

  @Input('axis')
  public set setAxis(axis: UIChartAxis) {
    this.axis = axis;
    axis.baseline = !isUndefined(axis.baseline) && !isNaN(axis.baseline as number) ? axis.baseline : undefined;
    this.axisTemp = _.cloneDeep(axis);
    if (this.axisTemp.grid) {
      const isZero: boolean = this.axisTemp.grid.min === 0 && this.axisTemp.grid.max === 0;
      this.axisTemp.grid.min = isZero || this.axisTemp.grid.autoScaled || (!_.isUndefined(axis.baseline) && axis.baseline !== 0) ? null : this.axisTemp.grid.min;
      this.axisTemp.grid.max = isZero || this.axisTemp.grid.autoScaled || (!_.isUndefined(axis.baseline) && axis.baseline !== 0) ? null : this.axisTemp.grid.max;
    }
  }

  // 차트정보
  @Input('uiOption')
  public set setUiOption(uiOption: UIOption) {

    // Set
    this.uiOption = uiOption;
  }


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
    this.changeValueAxis.emit(this.axis);
  }

  /**
   * 레이블 설정 manual로 설정시
   */
  public showLabel() {

    // 레이블 설정이 안된경우
    if (!(this.axis.label as UIChartAxisLabelValue).format) {

      // 기본 포맷 사용 false
      (this.axis.label as UIChartAxisLabelValue).useDefault = false;

      (this.axis.label as UIChartAxisLabelValue).format = UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true);

      // 레이블 설정이 되어있는경우
    } else {

      // 기본 포맷 사용 true
      (this.axis.label as UIChartAxisLabelValue).useDefault = true;

      // 포멧값 제거
      delete (this.axis.label as UIChartAxisLabelValue).format;
    }

    // 변경된 축값 emit
    this.changeValueAxis.emit(this.axis);
  }

  /**
   * format item 변경시
   * @param target
   */
  public onChange(target: object): void {

    // 축 라벨의 포맷값 설정
    (this.axis.label as UIChartAxisLabelValue).format = target as Format;

    // 변경된 축값 emit
    this.changeValueAxis.emit(this.axis);
  }

  /**
   * 축 범위설정 사용여부 변경
   */
  public changeGrid(): void {

    // 사용으로 변경
    if (_.isUndefined(this.axis.grid)) {
      this.axis.grid = {
        type: ChartAxisGridType.NUMERIC,
        autoScaled: false,
        min: 0,
        max: 0
      };
      this.axisTemp.grid = _.cloneDeep(this.axis.grid);
      this.axisTemp.grid.min = null;
      this.axisTemp.grid.max = null;
    }
    // 비사용으로 변경
    else {
      delete this.axis.grid;
    }
    this.changeBaseline.emit(this.axis);
  }

  /**
   * 축범위 자동설정 변경
   */
  public changeAutoScale(): void {

    // 자동설정 변경
    this.axis.grid.autoScaled = !this.axis.grid.autoScaled;
    this.axis.grid.min = 0;
    this.axis.grid.max = 0;
    this.axisTemp.grid.min = null;
    this.axisTemp.grid.max = null;
    this.changeBaseline.emit(this.axis);
  }

  /**
   * 기준선 변경
   */
  public changeBaseLine(): void {

    // convert string to number
    const tempBaseline = _.isEmpty(this.axisTemp.baseline) ? 0 : FormatOptionConverter.getNumberValue(this.axisTemp.baseline);

    if (isNaN(tempBaseline)) {

      // set thousand comma, decimal value
      const originBaseline = _.isUndefined(this.axis.baseline) ? undefined : FormatOptionConverter.getDecimalValue(_.cloneDeep(this.axis.baseline), this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep);

      this.axisTemp.baseline = _.isUndefined(this.axis.baseline) ? FormatOptionConverter.getNumberValue(0) : originBaseline;
      return;
    }

    // set thousand comma, decimal value
    this.axisTemp.baseline = FormatOptionConverter.getDecimalValue(this.axisTemp.baseline, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep)

    // 기준선 변경
    delete this.axis.grid;
    this.axis.baseline = tempBaseline;
    this.changeBaseline.emit(this.axis);
  }

  /**
   * 기준선 show / hide 설정
   */
  public showBaseLine(): void {

    // off일떄
    if (undefined === this.axisTemp.baseline) {

      // convert number to formatted string value
      const originBaseline = undefined !== this.axis.baseline ? FormatOptionConverter.getNumberValue(_.cloneDeep(this.axis.baseline)) : undefined;

      this.axisTemp.baseline = _.isUndefined(this.axis.baseline) ? FormatOptionConverter.getDecimalValue(0, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep) : originBaseline;

      // show일떄
    } else {
      delete this.axisTemp.baseline;

      // hide될때 축교차점값 초기화
      this.axis.baseline = undefined;
      this.changeBaseline.emit(this.axis);
    }
  }

  /**
   * Change Axsi Min Value
   */
  public changeMin(): void {

    const value = this.axisTemp.grid.min;
    if (_.isNull(value)) {
      return;
    }
    // 값이 비어있다면 0으로 치환
    if (_.eq(value, '')) {
      this.axisTemp.grid.min = 0;
    }

    // convert string to number
    this.axisTemp.grid.min = FormatOptionConverter.getNumberValue(this.axisTemp.grid.min);

    // convert number to formatted string value
    const originAxisMin = FormatOptionConverter.getNumberValue(_.cloneDeep(this.axis.grid.min));

    // Validation
    if (isNaN(this.axisTemp.grid.min)) {
      this.axisTemp.grid.min = _.isUndefined(this.axis.grid.min) || this.axis.grid.min === 0 ? null : originAxisMin;
      return;
    }

    const min: number = Number(this.axisTemp.grid.min);
    let max = Number(this.axis.grid.max);

    // max 값이 0일 경우 (설정안했을경우)
    if (max === 0) {
      const dataMax = AxisOptionConverter.axisMinMax[(_.eq(this.axis.mode, AxisLabelType.ROW) ? 'xAxis' : 'yAxis')].max;
      max = Number(dataMax.toFixed(2));
      this.axis.grid.max = max;
    }

    if (min >= max) {
      Alert.info(this.translateService.instant('msg.page.yaxis.grid.min.alert'));
      this.axisTemp.grid.min = this.axis.grid.min !== 0 ? originAxisMin : null;
      return;
    }

    // 기준선 변경
    this.axis.grid.min = Number(this.axisTemp.grid.min);
    if (this.axisTemp.grid.autoScaled || this.axis.grid.autoScaled) {
      this.axisTemp.grid.autoScaled = false;
      this.axisTemp.grid.max = null;
      this.axis.grid.autoScaled = false;
      this.axis.grid.max = 0;
    }
    this.changeBaseline.emit(this.axis);

    // 값이 0이라면 빈값으로 치환
    if (_.eq(value, '')) {
      this.axisTemp.grid.min = null;
      // set thousand comma, decimal value
    } else {
      this.axisTemp.grid.min = FormatOptionConverter.getDecimalValue(this.axisTemp.grid.min, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep);
    }
  }

  /**
   * Change Axsi Max Value
   */
  public changeMax(): void {

    const value = this.axisTemp.grid.max;
    if (_.isNull(value)) {
      return;
    }
    // 값이 비어있다면 0으로 치환
    let isDefaultValue: boolean = false;
    if (_.eq(value, '')) {
      isDefaultValue = true;
      this.axisTemp.grid.max = 0;
    }

    // convert string to number
    this.axisTemp.grid.max = FormatOptionConverter.getNumberValue(this.axisTemp.grid.max);

    // convert number to formatted string value
    const originAxisMax = FormatOptionConverter.getNumberValue(_.cloneDeep(this.axis.grid.max));

    // Validation
    if (isNaN(this.axisTemp.grid.max)) {
      this.axisTemp.grid.max = _.isUndefined(this.axis.grid.max) || this.axis.grid.max === 0 ? null : originAxisMax;
      return;
    }

    const min: number = Number(this.axis.grid.min);
    let max: number = !isNaN(this.axisTemp.grid.max) ? Number(this.axisTemp.grid.max) : 0;

    // max 값이 0일 경우 (설정안했을경우)
    if (isDefaultValue) {
      const dataMax = AxisOptionConverter.axisMinMax[(_.eq(this.axis.mode, AxisLabelType.ROW) ? 'xAxis' : 'yAxis')].max;
      max = Number(dataMax.toFixed(2));
      this.axis.grid.max = max;
    }

    if (max <= min && (max !== 0 && min !== 0) || max === 0) {
      Alert.info(this.translateService.instant('msg.page.yaxis.grid.max.alert'));
      this.axisTemp.grid.max = originAxisMax;
      return;
    }

    // 기준선 변경
    if (Number(this.axisTemp.grid.max) !== 0)
      this.axis.grid.max = Number(this.axisTemp.grid.max);

    if (this.axisTemp.grid.autoScaled || this.axis.grid.autoScaled) {
      this.axisTemp.grid.autoScaled = false;
      this.axisTemp.grid.min = null;
      this.axis.grid.autoScaled = false;
      this.axis.grid.min = 0;
    }
    this.changeBaseline.emit(this.axis);

    // 값이 0이라면 빈값으로 치환
    if (_.eq(value, '')) {
      this.axisTemp.grid.max = null;
      // set thousand comma, decimal value
    } else {
      this.axisTemp.grid.max = FormatOptionConverter.getDecimalValue(this.axisTemp.grid.max, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep);
    }
  }

  /**
   * 보조선 선색상변경
   */
  public changeGridLineColor(_event: Event): void {

  }

  /**
   * 선굵기 변경
   */
  public changeLineThick(): void {

  }

  /**
   * 선유형 변경
   */
  public changeLineType(): void {

  }

  /**
   * 사용자가 입력한 Min / Max가 실제 데이터를 벗어나는지 여부
   */
  public isOverMinMax(): boolean {

    return (this.isOverMin() || this.isOverMax());
  }

  /**
   * 사용자가 입력한 Min값이 실제 데이터를 벗어나는지 여부
   */
  public isOverMin(): boolean {

    // Auto Scale이 아닌경우에만 체크
    if (this.axisTemp.grid && !this.axisTemp.grid.autoScaled) {

      // 사용자가 입력한 min / max
      const inputMin = FormatOptionConverter.getNumberValue(this.axisTemp.grid.min);

      // 서버데이터 min / max
      const dataMin = AxisOptionConverter.axisMinMax[(_.eq(this.axis.mode, AxisLabelType.ROW) ? 'xAxis' : 'yAxis')].min;

      if (!isNaN(inputMin) && inputMin < dataMin) {
        return true;
      }
    }

    return false;
  }

  /**
   * 사용자가 입력한 Max값이 실제 데이터를 벗어나는지 여부
   */
  public isOverMax(): boolean {

    // Auto Scale이 아닌경우에만 체크
    if (this.axisTemp.grid && !this.axisTemp.grid.autoScaled) {

      // 사용자가 입력한 min / max
      const inputMax = FormatOptionConverter.getNumberValue(this.axisTemp.grid.max);

      // 서버데이터 min / max
      const dataMax = AxisOptionConverter.axisMinMax[(_.eq(this.axis.mode, AxisLabelType.ROW) ? 'xAxis' : 'yAxis')].max;

      if (!isNaN(inputMax) && inputMax > dataMax) {
        return true;
      }
    }

    return false;
  }

  /**
   * set decimal point, thousand comma
   * @param value
   */
  public getDecimalRoundNumber(value: number): string {

    return FormatOptionConverter.getDecimalValue(Number(value), this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
