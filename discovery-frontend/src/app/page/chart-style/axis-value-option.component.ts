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
import {
  AxisLabelType,
  ChartAxisGridType,
  UIFormatCurrencyType,
  UIFormatType
} from '../../common/component/chart/option/define/common';
import * as _ from 'lodash';
import { FormatOptionComponent } from './format-option.component';
import { UIChartAxis, UIChartAxisLabelValue } from '../../common/component/chart/option/ui-option/ui-axis';
import { OptionGenerator } from '../../common/component/chart/option/util/option-generator';
import { Format } from '../../domain/workbook/configurations/format';
import { UIOption } from '../../common/component/chart/option/ui-option';
import { isUndefined } from 'util';
import UI = OptionGenerator.UI;
import {AxisOptionConverter} from "../../common/component/chart/option/converter/axis-option-converter";
import {Alert} from "../../common/util/alert.util";

@Component({
  selector: 'axis-value-option',
  templateUrl: './axis-value-option.component.html'
})
export class AxisValueOptionComponent extends FormatOptionComponent {

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
  public lineThickList: Object[] = [];

  // 선유형 리스트
  public lineTypeList: Object[] = [];

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
    axis.baseline = !isUndefined(axis.baseline) && !isNaN(axis.baseline) ? axis.baseline : undefined;
    this.axisTemp = _.cloneDeep(axis);
    if( this.axisTemp.grid ) {
      let isZero: boolean = this.axisTemp.grid.min == 0 && this.axisTemp.grid.max == 0;
      this.axisTemp.grid.min = isZero || this.axisTemp.grid.autoScaled || (!_.isUndefined(axis.baseline) && axis.baseline != 0) ? null : this.axisTemp.grid.min;
      this.axisTemp.grid.max = isZero || this.axisTemp.grid.autoScaled || (!_.isUndefined(axis.baseline) && axis.baseline != 0) ? null : this.axisTemp.grid.max;
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

    if( _.eq(this.axis.mode, axisLabelType) ) {
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
    if (!(<UIChartAxisLabelValue>this.axis.label).format) {

      // 기본 포맷 사용 false
      (<UIChartAxisLabelValue>this.axis.label).useDefault = false;

      (<UIChartAxisLabelValue>this.axis.label).format = UI.Format.custom(true, null, String(UIFormatType.NUMBER), String(UIFormatCurrencyType.KRW), 2, true);

      // 레이블 설정이 되어있는경우
    } else {

      // 기본 포맷 사용 true
      (<UIChartAxisLabelValue>this.axis.label).useDefault = true;

      // 포멧값 제거
      delete (<UIChartAxisLabelValue>this.axis.label).format;
    }

    // 변경된 축값 emit
    this.changeValueAxis.emit(this.axis);
  }

  /**
   * format item 변경시
   * @param target
   */
  public onChange(target: Object): void {

    // 축 라벨의 포맷값 설정
    (<UIChartAxisLabelValue>this.axis.label).format = target as Format;

    // 변경된 축값 emit
    this.changeValueAxis.emit(this.axis);
  }

  /**
   * 축 범위설정 사용여부 변경
   */
  public changeGrid(): void {

    // 사용으로 변경
    if( _.isUndefined(this.axis.grid) ) {
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
   * @param baseline
   */
  public changeBaseLine(): void {

    if( isNaN(this.axisTemp.baseline) ) {
      this.axisTemp.baseline = _.isUndefined(this.axis.baseline) ? 0 : this.axis.baseline;
      return;
    }

    // 기준선 변경
    delete this.axis.grid;
    this.axis.baseline = Number(this.axisTemp.baseline);
    this.changeBaseline.emit(this.axis);
  }

  /**
   * 기준선 show / hide 설정
   */
  public showBaseLine(): void {

    // off일떄
    if( isNaN(this.axisTemp.baseline) ) {
      this.axisTemp.baseline = _.isUndefined(this.axis.baseline) ? 0 : this.axis.baseline;

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

    // 값이 비어있다면 0으로 치환
    let value = this.axisTemp.grid.min;
    if( _.eq(value, "") ) {
      this.axisTemp.grid.min = 0;
    }

    // Validation
    if( isNaN(this.axisTemp.grid.min) ) {
      this.axisTemp.grid.min = _.isUndefined(this.axis.grid.min) || this.axis.grid.min == 0 ? null : this.axis.grid.min;
      return;
    }

    let min: number = Number(this.axisTemp.grid.min);
    let max: number = !isNaN(this.axis.grid.max) ? Number(this.axis.grid.max) : 0;
    if( min >= max ) {
      Alert.info(this.translateService.instant('msg.page.yaxis.grid.min.alert'));
      this.axisTemp.grid.min = this.axis.grid.min != 0 ? this.axis.grid.min : null;
      return;
    }

    // 기준선 변경
    this.axis.grid.min = Number(this.axisTemp.grid.min);
    if( this.axisTemp.grid.autoScaled || this.axis.grid.autoScaled ) {
      this.axisTemp.grid.autoScaled = false;
      this.axisTemp.grid.max = null;
      this.axis.grid.autoScaled = false;
      this.axis.grid.max = 0;
    }
    this.changeBaseline.emit(this.axis);

    // 값이 0이라면 빈값으로 치환
    if( _.eq(value, "") ) {
      this.axisTemp.grid.min = null;
    }
  }

  /**
   * Change Axsi Max Value
   */
  public changeMax(): void {

    // 값이 비어있다면 0으로 치환
    let value = this.axisTemp.grid.max;
    if( _.eq(value, "") ) {
      this.axisTemp.grid.max = 0;
    }

    // Validation
    if( isNaN(this.axisTemp.grid.max) ) {
      this.axisTemp.grid.max = _.isUndefined(this.axis.grid.max) || this.axis.grid.max == 0 ? null : this.axis.grid.max;
      return;
    }

    let min: number = Number(this.axis.grid.min);
    let max: number = !isNaN(this.axisTemp.grid.max) ? Number(this.axisTemp.grid.max) : 0;
    if( max <= min ) {
      Alert.info(this.translateService.instant('msg.page.yaxis.grid.max.alert'));
      this.axisTemp.grid.max = this.axis.grid.max != 0 ? this.axis.grid.max : null;
      return;
    }

    // 기준선 변경
    this.axis.grid.max = Number(this.axisTemp.grid.max);
    if( this.axisTemp.grid.autoScaled || this.axis.grid.autoScaled ) {
      this.axisTemp.grid.autoScaled = false;
      this.axisTemp.grid.min = null;
      this.axis.grid.autoScaled = false;
      this.axis.grid.min = 0;
    }
    this.changeBaseline.emit(this.axis);

    // 값이 0이라면 빈값으로 치환
    if( _.eq(value, "") ) {
      this.axisTemp.grid.max = null;
    }
  }

  /**
   * 보조선 선색상변경
   */
  public changeGridLineColor(): void {

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
    if( this.axisTemp.grid && !this.axisTemp.grid.autoScaled ) {

      // 사용자가 입력한 min / max
      let inputMin = this.axisTemp.grid.min;

      // 서버데이터 min / max
      let dataMin = AxisOptionConverter.axisMinMax[(_.eq(this.axis.mode,AxisLabelType.ROW) ? 'xAxis' : 'yAxis')].min;

      if( !isNaN(inputMin) && inputMin < dataMin ) {
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
    if( this.axisTemp.grid && !this.axisTemp.grid.autoScaled ) {

      // 사용자가 입력한 min / max
      let inputMax = this.axisTemp.grid.max;

      // 서버데이터 min / max
      let dataMax = AxisOptionConverter.axisMinMax[(_.eq(this.axis.mode,AxisLabelType.ROW) ? 'xAxis' : 'yAxis')].max;

      if( !isNaN(inputMax) && inputMax > dataMax ) {
        return true;
      }
    }

    return false;
  }

  /**
   * 소수점 자리수 2자리에서 반올림 처리 반환
   * @param value
   */
  public getDecimalRoundNumber(value: number): number {

    return Math.round(Number(value) * (Math.pow(10, 2))) / Math.pow(10, 2);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
