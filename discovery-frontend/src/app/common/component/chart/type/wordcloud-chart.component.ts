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

/**
 * Created by Dolkkok on 2017. 7. 18..
 */

import {
  AfterViewInit, Component, ElementRef, Injector, OnInit, OnDestroy
} from '@angular/core';
import {BaseChart, PivotTableInfo} from '../base-chart';
import {BaseOption} from "../option/base-option";
import {
  ChartType, SymbolType, ShelveType, ShelveFieldType, SeriesType
} from '../option/define/common';
import {OptionGenerator} from '../option/util/option-generator';
import {Pivot} from "../../../../domain/workbook/configurations/pivot";
import {ColorOptionConverter} from "../option/converter/color-option-converter";
import * as _ from 'lodash';

@Component({
  selector: 'wordcloud-chart',
  template: '<div class="chartCanvas" style="width: 100%; height: 100%; display: block;"></div>'
})
export class WordCloudChartComponent extends BaseChart implements OnInit, OnDestroy, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector ) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  // After View Init
  public ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 선반정보를 기반으로 차트를 그릴수 있는지 여부를 체크
   * - 반드시 각 차트에서 Override
   */
  public isValid(pivot: Pivot): boolean {
    return this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) > 0
      && this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP) == 0
      && ((this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) + this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED)) == 1)
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차트의 기본 옵션을 생성한다.
   * - 각 차트에서 Override
   */
  protected initOption(): BaseOption {
    return {
      type: ChartType.WORDCLOUD,
      series: []
    };
  }

  /**
   * 차트별 시리즈 추가정보
   * - 반드시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertSeriesData(): BaseOption {

    // 시리즈 설정
    this.chartOption.series = [{
      type: SeriesType.WORDCLOUD,
      center: ['50%', '50%'],
      size: ['90%', '90%'],
      shape: SymbolType.CIRCLE,
      sizeRange: [12, 60],
      rotationRange: [-90, 90],
      rotationStep: 45,
      animation: false,
      textStyle: { normal: OptionGenerator.TextStyle.auto(), emphasis: {} },
      data: this.data.columns[0].value.map( item => {
        item.selected = false;
        item.textStyle = OptionGenerator.ItemStyle.auto();
        return item;
      }),
      originData: _.clone(this.data.columns[0].value)
    }];

    return this.chartOption;
  }

  /**
   * 차트별 시리즈 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalSeries(): BaseOption {

    // 컬러설정
    this.chartOption = this.convertColor();

    // 차트옵션 반환
    return this.chartOption;
  }

  /**
   * 결과데이터를 기반으로 차트를 구성하는 피봇정보 설정
   * - 필요시 각 차트에서 Override
   */
  protected setPivotInfo(): void {

    // 시리즈 데이터 설정
    const aggs = this.data.columns[0].value.map((dataObj) => {
      return dataObj.name;
    });

    // Pivot 정보 생성
    this.pivotInfo = new PivotTableInfo([], [], aggs);
  }

  /**
   * 셀렉션 이벤트를 등록한다.
   * - 필요시 각 차트에서 Override
   */
  protected selection(): void {
    this.addChartSelectEventListener();
  }

  /**
   * 툴팁 정보를 변환한다.
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertTooltip(): BaseOption {
    return this.chartOption;
  }


  /**
   * 시리즈 데이터 선택 - 차트별 재설정
   * @param seriesData
   */
  protected selectSeriesData( seriesData ) {
    delete seriesData.textStyle.normal.color;
    seriesData.selected = true;
  } // function - selectSeriesData

  /**
   * 시리즈 데이터 선택 해제 - 차트별 재설정
   * @param seriesData
   */
  protected unselectSeriesData( seriesData ) {
    seriesData.textStyle.normal.color = '#aaaaaa';
    seriesData.selected = false;
  } // function - unselectSeriesData

  /**
   * 전체 선택 해제 처리 - 차트별 재설정
   * @param seriesData
   */
  protected clearSelectSeriesData( seriesData ) {
    delete seriesData.textStyle.normal.color;
    seriesData.selected = false;
  } // function - clearSelectSeriesData

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * @override 차트 색상 변경
   *
   */
  private convertColor(): BaseOption {

    // 복사
    const cloneFieldInfo = _.cloneDeep(this.fieldInfo);

    // 값치환
    this.fieldInfo.aggs = this.pivot.aggregations.filter((agg) => {
      return _.eq(agg.type, ShelveFieldType.DIMENSION) || _.eq(agg.type, ShelveFieldType.TIMESTAMP);
    }).map((agg) => {
      return !_.isEmpty(agg.alias) ? agg.alias : agg.name;
    });

    // 색상 설정
    this.chartOption = ColorOptionConverter.convertColor(this.chartOption, this.uiOption, this.fieldOriginInfo, this.fieldInfo, this.pivotInfo, this.drawByType);

    // 원복
    this.fieldInfo = cloneFieldInfo;

    return this.chartOption;
  }

}
