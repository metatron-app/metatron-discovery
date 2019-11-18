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

import {AbstractComponent} from '../../common/component/abstract.component';
import {ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UIOption} from '../../common/component/chart/option/ui-option';
import * as _ from 'lodash';
import {ChartType} from '../../common/component/chart/option/define/common';


const possibleChartObj: any = {
  color: ['bar', 'grid', 'line', 'scatter', 'control', 'pie', 'wordcloud', 'boxplot', 'radar', 'heatmap', 'combine', 'treemap', 'gauge', 'network', 'sankey'],
  colorD: ['bar', 'line', 'scatter', 'pie', 'wordcloud', 'gauge', 'network', 'sankey', 'treemap'],
  colorS: ['bar', 'line', 'control', 'radar', 'combine'],
  colorV: ['bar', 'grid', 'line', 'grid', 'control', 'scatter', 'heatmap', 'pie', 'wordcloud', 'treemap', 'boxplot', 'gauge'],
  colorN: ['grid'],
  axis: ['bar', 'line', 'control', 'scatter', 'heatmap', 'boxplot', 'waterfall', 'combine', 'gauge'],
  logScale: ['bar', 'line', 'scatter', 'combine', 'control'],
  valueLabel: ['bar', 'line', 'control', 'scatter', 'heatmap', 'waterfall', 'combine', 'pie', 'gauge', 'radar', 'network', 'sankey', 'treemap'],
  labelCategoryName: ['bar', 'line', 'heatmap', 'control', 'waterfall', 'combine', 'radar', 'sankey', 'gauge'],
  labelCategoryValue: ['bar', 'line', 'control', 'waterfall', 'combine'],
  labelCategoryPercent: ['bar', 'line', 'control', 'combine'],
  labelSeriesName: ['bar', 'line', 'scatter', 'heatmap', 'pie', 'control', 'combine', 'treemap', 'gauge'],
  labelSeriesValue: ['bar', 'line', 'heatmap', 'pie', 'control', 'combine', 'treemap', 'gauge'],
  labelSeriesPercent: ['bar', 'line', 'pie', 'control', 'combine', 'treemap', 'gauge'],
  labelXAxisValue: ['scatter'],
  labelYAxisValue: ['scatter'],
  labelValue: ['radar'],
  labelNodeName: ['network', 'sankey'],
  labelNodeValue: ['sankey'],
  labelLinkValue: ['network'],
  labelPosition: ['bar', 'line', 'scatter', 'control', 'waterfall', 'radar', 'network', 'gauge'],
  labelRotation: ['bar', 'combine', 'gauge'],
  labelColor: ['bar', 'line', 'scatter', 'control', 'waterfall', 'combine', 'radar', 'network', 'sankey', 'gauge'],
  labelAlign: ['bar', 'line', 'scatter', 'heatmap', 'pie', 'control', 'waterfall', 'combine', 'radar', 'network', 'gauge'],
  labelDirection: ['gauge'],
  labelAxisScaleFormat: ['bar', 'line', 'scatter', 'control', 'waterfall', 'combine', 'gauge'],
  labelUseOutSideLabel: ['pie'],
  tooltipAxisScaleFormat: ['bar', 'line', 'scatter', 'control', 'boxplot', 'waterfall', 'combine', 'gauge'],
  tooltipCategoryName: ['bar', 'line', 'heatmap', 'control', 'waterfall', 'combine', 'gauge', 'radar', 'boxplot', 'sankey'],
  tooltipCategoryValue: ['bar', 'line', 'control', 'waterfall', 'combine'],
  tooltipCategoryPercent: ['bar', 'line', 'control', 'combine'],
  tooltipSeriesName: ['bar', 'line', 'scatter', 'heatmap', 'pie', 'control', 'combine', 'treemap', 'gauge'],
  tooltipSeriesValue: ['bar', 'line', 'heatmap', 'pie', 'control', 'combine', 'treemap', 'gauge'],
  tooltipSeriesPercent: ['bar', 'line', 'pie', 'control', 'combine', 'treemap', 'gauge'],
  tooltipXAxisValue: ['scatter'],
  tooltipYAxisValue: ['scatter'],
  tooltipValue: ['radar'],
  tooltipNodeName: ['network', 'sankey'],
  tooltipNodeValue: ['network', 'sankey'],
  tooltipLinkValue: ['network'],
  tooltipHighValue: ['boxplot'],
  tooltip3QValue: ['boxplot'],
  tooltipMedianValue: ['boxplot'],
  tooltip1QValue: ['boxplot'],
  tooltipLowValue: ['boxplot'],
  legend: ['bar', 'line', 'control', 'scatter', 'heatmap', 'pie', 'radar'],
  minimap: ['bar', 'line', 'control', 'scatter', 'heatmap', 'boxplot', 'waterfall'],
  barExpress: ['bar', 'waterfall'],
  lineExpress: ['line', 'control'],
  scatterExpress: ['scatter'],
  gridExpress: ['grid'],
  pieExpress: ['pie'],
  combineExpress: ['combine'],
  radarExpress: ['radar'],
  brush: ['bar'],
  kpiExpress: ['label'],
  // axis / label의 y축 title
  yAxisTitle: ['bar', 'line', 'control', 'scatter', 'heatmap', 'boxplot', 'waterfall', 'combine'],
  // value축 범위설정
  yAxisGrid: ['bar', 'line', 'scatter', 'combine'],
  // value축 기준선
  yAxisBaseline: ['bar', 'line', 'scatter', 'combine'],
  // value축 min/max
  yAxisMinMax: ['bar', 'line', 'scatter', 'combine']
};

export class BaseOptionComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('uiOption')
  public uiOption: UIOption;

  @Output() // Change를 붙이면 해당 모델 변경시 자동 이벤트 발생
  public uiOptionChange: EventEmitter<UIOption> = new EventEmitter();

  // drawChart에서 사용되는 파라미터 전달
  @Output('drawChartParam')
  public setDrawChartParam: EventEmitter<any> = new EventEmitter();

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
   * 위에 uiOption 을 다시 재정의 하는 경우 레퍼런스가 변경되기 때문에
   * update를 호출해서 싱크를 맞추어야 함
   * uiOption 그대로 속성만 변경하면 자동으로 uiOptionChange 호출 됨
   */
  public update(drawChartParam?: any) {
    if (drawChartParam) {
      // 서버가 재호출되어야 하는경우
      this.setDrawChartParam.emit(drawChartParam);
    } else {
      // 서버가 재호출되지 않아도 되는경우, uiOption만 변경
      this.uiOptionChange.emit(this.uiOption);
    }
  }

  /**
   * 해당차트의 구현 가능한 기능 체크
   *
   * @param {string} type
   * @param {ChartType} chartType
   * @returns {boolean}
   */
  public possibleChartCheck(type: string, chartType: ChartType) {
    return _.indexOf(possibleChartObj[type], chartType) > -1;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 첫 글자 대문자 처리
   *
   * @param string
   * @returns {string}
   */
  protected capitalize(string): string {
    return _.capitalize(string);
  }

  /**
   * 셀렉트 박스 토글
   *
   * @param event
   */
  protected toggleSelectBox(event): void {
    const $this = $(event.currentTarget).find($('ul[data-type="selectbox"]'));
    const $selectBoxes = $('ul[data-type="selectbox"]');
    const isShow = $this.is(':visible');
    if (isShow) {
      $this.hide();
      $('html').off('click');
    } else {
      // 배경눌렀을때 셀렉트박스 비활성화
      $('html').off('click').on('click', () => {
        $selectBoxes.hide();
        $('html').off('click');
      });
      $selectBoxes.hide();
      $this.show();
      event.stopPropagation();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
