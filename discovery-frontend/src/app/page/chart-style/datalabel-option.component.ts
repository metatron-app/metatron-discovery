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

import { Component, ElementRef, Injector, Input } from '@angular/core';
import { UIOption } from '../../common/component/chart/option/ui-option';
import * as _ from 'lodash';
import {
  BarMarkType,
  ChartType,
  DataLabelPosition,
  UIChartDataLabelDisplayType,
  UIOrient,
  UIPosition
} from '../../common/component/chart/option/define/common';
import { UIChartFormat } from '../../common/component/chart/option/ui-option/ui-format';
import { FormatOptionConverter } from '../../common/component/chart/option/converter/format-option-converter';
import { Pivot } from '../../domain/workbook/configurations/pivot';
import { LabelBaseOptionComponent } from './labelbase-option.component';

@Component({
  selector: 'datalabel-option',
  templateUrl: './datalabel-option.component.html'
})
export class DataLabelOptionComponent extends LabelBaseOptionComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 선반값
  public pivot: Pivot;

  // 위치설정 Bar 세로형인경우
  public positionBarVerticalList: Object[] = [
    {name: this.translateService.instant('msg.page.chart.datalabel.position.outside.top'), value: DataLabelPosition.OUTSIDE_TOP},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.inside.top'), value: DataLabelPosition.INSIDE_TOP},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.inside.bottom'), value: DataLabelPosition.INSIDE_BOTTOM},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.inside.center'), value: DataLabelPosition.CENTER}
  ];

  // 위치설정 Bar 가로형인경우
  public positionBarHorizontalList: Object[] = [
    {name: this.translateService.instant('msg.page.chart.datalabel.position.outside.right'), value: DataLabelPosition.OUTSIDE_RIGHT},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.inside.right'), value: DataLabelPosition.INSIDE_RIGHT},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.inside.left'), value: DataLabelPosition.INSIDE_LEFT},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.inside.center'), value: DataLabelPosition.CENTER}
  ];

  // 위치설정 Gauge형인경우
  public positionGaugeList: Object[] = [
    {name: this.translateService.instant('msg.page.chart.datalabel.position.inside.top'), value: DataLabelPosition.INSIDE_TOP},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.inside.bottom'), value: DataLabelPosition.INSIDE_BOTTOM},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.inside.center'), value: DataLabelPosition.CENTER}
  ];

  // 위치설정 Gauge 가로형인경우
  public positionGaugeHorizontalList: Object[] = [
    {name: this.translateService.instant('msg.page.chart.datalabel.position.inside.right'), value: DataLabelPosition.INSIDE_RIGHT},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.inside.left'), value: DataLabelPosition.INSIDE_LEFT},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.inside.center'), value: DataLabelPosition.CENTER}
  ];

  // 위치설정 Line 세로형인경우
  public positionLineVerticalList: Object[] = [
    {name: this.translateService.instant('msg.page.chart.datalabel.position.top'), value: DataLabelPosition.TOP},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.bottom'), value: DataLabelPosition.BOTTOM},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.center'), value: DataLabelPosition.CENTER}
  ];

  // 위치설정 Line 가로형인경우
  public positionLineHorizontalList: Object[] = [
    {name: this.translateService.instant('msg.page.chart.datalabel.position.right'), value: DataLabelPosition.RIGHT},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.left'), value: DataLabelPosition.LEFT},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.center'), value: DataLabelPosition.CENTER}
  ];

  // 위치설정 Box형인경우
  public positionBoxList: Object[] = [
    {name: this.translateService.instant('msg.page.chart.datalabel.position.top'), value: DataLabelPosition.TOP},
    {name: this.translateService.instant('msg.page.chart.datalabel.position.bottom'), value: DataLabelPosition.BOTTOM}
  ];

  // 빈값을 제거한 displayTypes
  public displayTypes: UIChartDataLabelDisplayType[] = [];

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

  @Input('uiOption')
  public set setUiOption(uiOption: UIOption) {

    if( !uiOption.dataLabel ) {
      uiOption.dataLabel = {};
      uiOption.dataLabel.showValue = false;
    }

    // displayTypes가 없으면서 showValue가 true인 경우 displayTypes 설정
    if ( true == uiOption.dataLabel.showValue && !uiOption.dataLabel.displayTypes) {
      uiOption.dataLabel.displayTypes = this.setDisplayTypes(uiOption.type);
    }

    // pos값이 없을때 초기설정
    if (!uiOption.dataLabel.pos) {
      let positionList = this.getPositionList(uiOption);
      if (positionList && positionList.length > 0) uiOption.dataLabel.pos = positionList[positionList.length - 1]['value'];
    }

    // treemap 차트일때
    if (ChartType.TREEMAP == uiOption.type && !uiOption.dataLabel.hAlign) {
      uiOption.dataLabel.hAlign = UIPosition.CENTER;
    }
    if (ChartType.TREEMAP == uiOption.type && !uiOption.dataLabel.vAlign) {
      uiOption.dataLabel.vAlign = UIPosition.CENTER;
    }

    uiOption.dataLabel.previewList = this.setPreviewList(uiOption);

    if (uiOption.dataLabel && uiOption.dataLabel.displayTypes) {
      // remove empty datas in displayTypes
      this.displayTypes = _.cloneDeep(uiOption.dataLabel.displayTypes.filter(Boolean));
    }

    // useDefaultFormat이 없는경우
    if (typeof uiOption.dataLabel.useDefaultFormat === 'undefined') uiOption.dataLabel.useDefaultFormat = true;

    // Set
    this.uiOption = uiOption;
  }

  @Input('pivot')
  public set setPivot(pivot: Pivot) {

    this.pivot = pivot;

    // 바차트의 중첩일때 dataLabel.pos값을 변경
    if (ChartType.BAR == this.uiOption.type && BarMarkType.STACKED == this.uiOption['mark']) {
      let positionList = this.getPositionList(this.uiOption);
      if (positionList && positionList.length > 0) this.uiOption.dataLabel.pos = positionList[positionList.length - 1]['value'];
    }
  }

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
   * 수치값 표시 여부
   * @param show
   */
  public showValueLabel(show: boolean): void {
    this.uiOption.dataLabel.showValue = show;

    // showValue가 true인 경우 displayTypes 설정
    if (true == this.uiOption.dataLabel.showValue) {
      // displayTypes가 없는경우 차트에 따라서 기본 displayTypes설정
      if (!this.uiOption.dataLabel.displayTypes) {
        this.uiOption.dataLabel.displayTypes = this.setDisplayTypes(this.uiOption.type);

        // 빈값을 제외한 displayTypes
        this.displayTypes = _.cloneDeep(this.uiOption.dataLabel.displayTypes.filter(Boolean));
      }
    } else {
      // 기본값으로 초기화
      this.uiOption.dataLabel.displayTypes = this.setDisplayTypes(this.uiOption.type);
      this.displayTypes = _.cloneDeep(this.uiOption.dataLabel.displayTypes.filter(Boolean));
    }
    this.apply();
  }

  /**
   * 표시 레이블 선택 토글
   * @param displayType
   * @param typeIndex
   */
  public toggleDisplayType(displayType: UIChartDataLabelDisplayType, typeIndex: number): void {

    // 값이 없을경우 기화
    if( !this.uiOption.dataLabel.displayTypes ) {
      this.uiOption.dataLabel.displayTypes = [];
    }

    // 이미 체크된 상태라면 제거
    let isFind = false;
    _.each(this.uiOption.dataLabel.displayTypes, (type, index) => {
      if( _.eq(type, displayType) ) {
        isFind = true;

        this.uiOption.dataLabel.displayTypes[index] = null;
      }
    });

    // 체크되지 않은 상태라면 추가
    if( !isFind ) {
      this.uiOption.dataLabel.displayTypes[typeIndex] = displayType;
    }

    // 빈값을 제외한 displayTypes
    this.displayTypes = _.cloneDeep(this.uiOption.dataLabel.displayTypes.filter(Boolean));

    // preview 설정
    this.uiOption.dataLabel.previewList = this.setPreviewList(this.uiOption);

    // 적용
    this.apply();
  }

  /**
   * 차트 및 옵션에 따른 위치설정 목록을 반환한다.
   */
  public getPositionList(uiOption: UIOption, chartSecondType?: ChartType): Object[] {

    if (!uiOption) return;

    // 바형태 가로 / 세로형 차트일 경우, 결합차트의 바차트부분인경우
    if( _.eq(uiOption.type, ChartType.BAR)) {
      // 가로형
      if( _.eq(uiOption['align'], UIOrient.HORIZONTAL) ) {
        return BarMarkType.STACKED == uiOption['mark'] ? this.positionGaugeHorizontalList : this.positionBarHorizontalList;
      }
      // 세로형
      else {
        return BarMarkType.STACKED == uiOption['mark'] ? this.positionGaugeList :this.positionBarVerticalList;
      }
    }
    else if(_.eq(uiOption.type, ChartType.WATERFALL) || (_.eq(uiOption.type, ChartType.COMBINE) && _.eq(chartSecondType, ChartType.BAR)) ) {
      // 가로형
      if( _.eq(uiOption['align'], UIOrient.HORIZONTAL) ) {
        return this.positionBarHorizontalList;
      }
      // 세로형
      else {
        return this.positionBarVerticalList;
      }
    }
    // 라인형태 가로 / 세로형 차트일 경우
    else if( _.eq(uiOption.type, ChartType.LINE)
        || _.eq(uiOption.type, ChartType.SCATTER)
        || _.eq(uiOption.type, ChartType.SCATTER)
        || _.eq(uiOption.type, ChartType.COMBINE)
        || _.eq(uiOption.type, ChartType.RADAR)
        || _.eq(uiOption.type, ChartType.NETWORK)
        || _.eq(uiOption.type, ChartType.CONTROL)) {
      // 가로형
      if( _.eq(uiOption['align'], UIOrient.HORIZONTAL) ) {
        return this.positionLineHorizontalList;
      }
      // 세로형
      else {
        return this.positionLineVerticalList;
      }
    }
    // 박스형태 차트일 경우
    else if( _.eq(uiOption.type, ChartType.BOXPLOT) ) {
      return this.positionBoxList;
    }
    // 게이지형태 차트일 경우
    else if( _.eq(uiOption.type, ChartType.GAUGE) ) {
      return this.positionGaugeList;
    }

    return [];
  }

  /**
   * 위치설정 인덱스를 반환한다.
   */
  public getPositionIndex(pos: DataLabelPosition): number {

    // 반환 인덱스
    let index: number = 0;

    // 목록
    let positionList: Object[] = this.getPositionList(this.uiOption);

    // 인덱스 찾음
    _.each(positionList, (item, idx) => {
      if( _.eq(item['value'], pos) ) {
        index = idx;
        return;
      }
    });

    return index;
  }

  /**
   * 위치설정 변경
   */
  public changePosition(position: Object): void {

    // 적용
    this.uiOption.dataLabel.pos = position['value'];
    this.apply();
  }

  /**
   * 결합차트 - line 차트부분 위치설정 변경
   */
  public changeLinePosition(position: Object): void {

    // 적용
    this.uiOption.dataLabel.secondaryPos = position['value'];
    this.apply();
  }

  /**
   * 회전 가능여부
   * @param lotation
   */
  public changeRotation(lotation: boolean): void {
    // 적용
    this.uiOption.dataLabel.enableRotation = lotation;
    this.apply();
  }

  /**
   * 배경색 On / Off
   */
  public changeBackgroundColor(): void {

    if( !this.uiOption.dataLabel.textBackgroundColor ) {
      //this.uiOption.dataLabel.textBackgroundColor = "transparent";
      this.uiOption.dataLabel.textBackgroundColor = "#000000";
    }
    else {
      delete this.uiOption.dataLabel.textBackgroundColor;
    }

    this.apply();
  }

  /**
   * 아웃라인 On / Off
   */
  public changeTextOutlineColor(): void {

    if( !this.uiOption.dataLabel.textOutlineColor ) {
      //this.uiOption.dataLabel.textOutlineColor = "transparent";
      this.uiOption.dataLabel.textOutlineColor = "#000000";
    }
    else {
      delete this.uiOption.dataLabel.textOutlineColor;
    }

    this.apply();
  }

  /**
   * 정렬변경
   */
  public changeTextAlign(align: UIPosition): void {

    // 파이차트의 showOutside상태가 true인 경우 textAlign 적용하지 않음
    if (this.uiOption['dataLabel']['showOutside']) return;

    // 적용
    this.uiOption.dataLabel.textAlign = align;
    this.apply();
  }

  /**
   * 기본포멧 사용여부
   */
  public changeUseDefaultFormat(): void {

    this.uiOption.dataLabel.useDefaultFormat = !this.uiOption.dataLabel.useDefaultFormat;
    this.apply();
  }

  /**
   * 적용
   */
  public apply(): void {

    // 옵션 적용
    this.uiOption = <UIOption>_.extend({}, this.uiOption, { dataLabel: this.uiOption.dataLabel });
    this.update();
  }

  /**
   * use outside Label 변경
   */
  public toggleOutsideLabel(showOutside: boolean): void {

    this.uiOption.dataLabel.showOutside = showOutside;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, { dataLabel: this.uiOption.dataLabel });
    this.update();
  }

  /**
   * text color setting auto / manual 설정
   */
  public showColorSetting(): void {

    // text color가 있는경우 => manual
    if (this.uiOption.dataLabel && this.uiOption.dataLabel.textColor) {

      // 색상 설정 제거
      delete this.uiOption.dataLabel.textColor;
      delete this.uiOption.dataLabel.textBackgroundColor;
      delete this.uiOption.dataLabel.textOutlineColor;

    // text color가 없는경우 => 기본값 설정
    } else {
      // 빈값 설정
      //this.uiOption.dataLabel.textColor = ' ';
      this.uiOption.dataLabel.textColor = '#FFFFFF';
    }

    this.uiOption = <UIOption>_.extend({}, this.uiOption, { dataLabel: this.uiOption.dataLabel });
    this.update();
  }

  /**
   * treemap - 가로정렬 변경
   */
  public changeHAlign(hAlign: UIPosition): void {

    this.uiOption.dataLabel.hAlign = hAlign;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, { dataLabel: this.uiOption.dataLabel });
    this.update();
  }

  /**
   * treemap - 세로정렬 변경
   */
  public changeVAlign(vAlign: UIPosition): void {

    this.uiOption.dataLabel.vAlign = vAlign;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, { dataLabel: this.uiOption.dataLabel });
    this.update();
  }



  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 미리보기 설정
   */
  private setPreviewList(uiOption: UIOption): Object[] {

    // 미리보기 리스트 초기화
    uiOption.dataLabel.previewList = [];

    let format: UIChartFormat = uiOption.valueFormat;

    // 축의 포멧이 있는경우 축의 포멧으로 설정
    const axisFormat = FormatOptionConverter.getlabelAxisScaleFormat(uiOption);
    if (axisFormat) format = axisFormat;

    // 포멧값이 설정된 숫자값
    let numValue = FormatOptionConverter.getFormatValue(1000, format);

    if (uiOption.dataLabel.displayTypes) {
      // displayType에 따라서 미리보기 설정
      for (const type of uiOption.dataLabel.displayTypes) {

        switch(type) {

          case UIChartDataLabelDisplayType.CATEGORY_NAME:
            uiOption.dataLabel.previewList.push({name: 'Category Name', value: UIChartDataLabelDisplayType.CATEGORY_NAME});
            break;
          case UIChartDataLabelDisplayType.CATEGORY_VALUE:
            uiOption.dataLabel.previewList.push({name: numValue, value: UIChartDataLabelDisplayType.CATEGORY_VALUE});
            break;
          case UIChartDataLabelDisplayType.CATEGORY_PERCENT:
            uiOption.dataLabel.previewList.push({name: '100%', value: UIChartDataLabelDisplayType.CATEGORY_PERCENT});
            break;
          case UIChartDataLabelDisplayType.SERIES_NAME:
            uiOption.dataLabel.previewList.push({name: 'Series Name', value: UIChartDataLabelDisplayType.SERIES_NAME});
            break;
          case UIChartDataLabelDisplayType.SERIES_VALUE:
            uiOption.dataLabel.previewList.push({name: numValue, value: UIChartDataLabelDisplayType.SERIES_VALUE});
            break;
          case UIChartDataLabelDisplayType.SERIES_PERCENT:
            uiOption.dataLabel.previewList.push({name: '100%', value: UIChartDataLabelDisplayType.SERIES_PERCENT});
            break;
          case UIChartDataLabelDisplayType.XAXIS_VALUE:
            uiOption.dataLabel.previewList.push({name: numValue, value: UIChartDataLabelDisplayType.XAXIS_VALUE});
            break;
          case UIChartDataLabelDisplayType.YAXIS_VALUE:
            uiOption.dataLabel.previewList.push({name: numValue, value: UIChartDataLabelDisplayType.YAXIS_VALUE});
            break;
          case UIChartDataLabelDisplayType.VALUE:
            uiOption.dataLabel.previewList.push({name: numValue, value: UIChartDataLabelDisplayType.VALUE});
            break;
          case UIChartDataLabelDisplayType.NODE_NAME:
            uiOption.dataLabel.previewList.push({name: 'Node Name', value: UIChartDataLabelDisplayType.NODE_NAME});
            break;
          case UIChartDataLabelDisplayType.LINK_VALUE:
            uiOption.dataLabel.previewList.push({name: numValue, value: UIChartDataLabelDisplayType.LINK_VALUE});
            break;
          case UIChartDataLabelDisplayType.NODE_VALUE:
            uiOption.dataLabel.previewList.push({name: numValue, value: UIChartDataLabelDisplayType.NODE_VALUE});
            break;
        }
      }
    }

    return uiOption.dataLabel.previewList;
  }

  /**
   * 차트별 displayTypes 기본값 설정
   */
  private setDisplayTypes(chartType: ChartType): UIChartDataLabelDisplayType[] {

    let displayTypes = [];

    switch (chartType) {

      case ChartType.BAR:
      case ChartType.LINE:
      case ChartType.CONTROL:
      case ChartType.COMBINE:
      case ChartType.WATERFALL:
        displayTypes[0] = UIChartDataLabelDisplayType.CATEGORY_NAME;
        displayTypes[1] = UIChartDataLabelDisplayType.CATEGORY_VALUE;
        break;
      case ChartType.HEATMAP:
      case ChartType.GAUGE:
        displayTypes[0] = UIChartDataLabelDisplayType.CATEGORY_NAME;
      case ChartType.SCATTER:
      case ChartType.PIE:
      case ChartType.TREEMAP:
        displayTypes[3] = UIChartDataLabelDisplayType.SERIES_NAME;
        break;
      case ChartType.RADAR:
        displayTypes[8] = UIChartDataLabelDisplayType.VALUE;
        break;
      case ChartType.SANKEY:
      case ChartType.NETWORK:
        displayTypes[9] = UIChartDataLabelDisplayType.NODE_NAME;
        break;
    }

    return displayTypes;
  }
}
