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

import {AfterViewInit, Component, ElementRef, Injector, OnInit, OnDestroy} from '@angular/core';
import {BaseChart, PivotTableInfo} from '../base-chart';
import {BaseOption} from "../option/base-option";
import {
  ChartType, SymbolType, ShelveType, ShelveFieldType, SeriesType, LineMarkType, FontSize, UIChartDataLabelDisplayType
} from '../option/define/common';
import {OptionGenerator} from '../option/util/option-generator';
import {Position} from '../option/define/common';
import {Pivot} from "../../../../domain/workbook/configurations/pivot";
import * as _ from 'lodash';
import {ColorOptionConverter} from "../option/converter/color-option-converter";
import {Series} from "../option/define/series";
import {LabelOptionConverter} from "../option/converter/label-option-converter";
import {FormatOptionConverter} from "../option/converter/format-option-converter";
import { UIChartFormat } from '../option/ui-option/ui-format';
import { UIOption } from '../option/ui-option';

@Component({
  selector: 'radar-chart',
  template: '<div class="chartCanvas" style="width: 100%; height: 100%; display: block;"></div>'
})
export class RadarChartComponent extends BaseChart implements OnInit, OnDestroy, AfterViewInit {

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
    return (this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) == 1 && this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP) == 0)
      && (this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) > 0 || this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED) > 0);
  }

  /**
   * 차트에 설정된 옵션으로 차트를 그린다.
   * - 각 차트에서 Override
   * @param isKeepRange: 현재 스크롤 위치를 기억해야 할 경우
   */
  public draw(isKeepRange?: boolean): void {

    ////////////////////////////////////////////////////////
    // Valid 체크
    ////////////////////////////////////////////////////////

    if( !this.isValid(this.pivot) ) {

      // No Data 이벤트 발생
      this.noData.emit();
      return;
    }

    ////////////////////////////////////////////////////////
    // Basic (Type, Title, etc..)
    ////////////////////////////////////////////////////////

    // 차트의 기본옵션을 생성한다.
    this.chartOption = this.initOption();

    // 차트 기본설정 정보를 변환
    this.chartOption = this.convertBasic();

    ////////////////////////////////////////////////////////
    // dataInfo
    // - 시리즈를 구성하는 데이터의 min/max 정보. E-Chart 에서 사용하는 속성 아님
    // - 그 외에도 custom한 정보를 담고 있는 속성
    ////////////////////////////////////////////////////////

    // 차트 커스텀 정보를 변환
    this.chartOption = this.convertDataInfo();

    ////////////////////////////////////////////////////////
    // series
    ////////////////////////////////////////////////////////

    // 차트 시리즈 정보를 변환
    this.chartOption = this.convertSeries();

    ////////////////////////////////////////////////////////
    // tooltip
    ////////////////////////////////////////////////////////

    // 차트 툴팁 정보를 변환
    this.chartOption = this.convertTooltip();

    ////////////////////////////////////////////////////////
    // Legend
    ////////////////////////////////////////////////////////

    this.chartOption = this.convertLegend();

    ////////////////////////////////////////////////////////
    // grid
    ////////////////////////////////////////////////////////

    // 차트 그리드(배치) 정보를 반환
    this.chartOption = this.convertGrid();

    ////////////////////////////////////////////////////////
    // 추가적인 옵션사항
    ////////////////////////////////////////////////////////

    this.chartOption = this.convertEtc();

    ////////////////////////////////////////////////////////
    // apply
    ////////////////////////////////////////////////////////

    // 차트 반영
    this.apply();

    ////////////////////////////////////////////////////////
    // Draw Finish
    // - 차트 표현 완료후 resize등 후속처리
    ////////////////////////////////////////////////////////

    this.drawFinish();

    ////////////////////////////////////////////////////////
    // Selection 이벤트 등록
    ////////////////////////////////////////////////////////

    if (!this.isPage) {
      this.selection();
    }
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
      type: ChartType.RADAR,
      radar: OptionGenerator.Axis.radarAxis(),
      legend: OptionGenerator.Legend.custom(true, true, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
      tooltip: OptionGenerator.Tooltip.itemTooltip(),
      series: []
    };
  }

  /**
   * 차트 기본설정 정보를 변환한다.
   * - 필요시 각 차트에서 Override
   * @param chartOption
   * @param option
   * @returns {BaseOption}
   */
  protected convertBasic(): BaseOption {

    // 차트가 그려진 후 UI에 필요한 옵션 설정
    this.setMeasureList();

    // pivot aggs 초기화
    const aggs: string[] = [];
    // indicator 최대치  설정
    const max = this.data.info.maxValue + (this.data.info.maxValue * 0.1);
    // indicator 설정
    this.chartOption.radar.indicator = [];
    this.data.rows.map((row) => {
      if (_.indexOf(aggs, row) < 0) {
        this.chartOption.radar.indicator.push({ max, name: row });
      }
    });

    return this.chartOption;
  }

  /**
   * 시리즈 정보를 변환한다.
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertSeries(): BaseOption {

    ////////////////////////////////////////////////////////
    // 차트 데이터를 기반으로 시리즈 생성
    ////////////////////////////////////////////////////////

    // 시리즈 설정
    this.chartOption = this.convertSeriesData();

    ////////////////////////////////////////////////////////
    // 색상옵션 적용
    ////////////////////////////////////////////////////////

    // 색상 설정
    let series: Series[] = this.chartOption.series && this.chartOption.series.length > 0 ? this.chartOption.series[0].data : [];
    this.chartOption = ColorOptionConverter.convertColor(
      this.chartOption,
      this.uiOption,
      this.fieldOriginInfo,
      this.fieldInfo,
      this.pivotInfo,
      this.drawByType,
      series
    );

    ////////////////////////////////////////////////////////
    // 데이터 레이블 옵션 적용
    ////////////////////////////////////////////////////////

    // 레이블 설정
    this.chartOption = LabelOptionConverter.convertLabel(this.chartOption, this.uiOption);

    ////////////////////////////////////////////////////////
    // 숫자 포맷 옵션 적용
    ////////////////////////////////////////////////////////

    this.chartOption = this.convertRadarFormatSeries(this.chartOption, this.uiOption);

    ////////////////////////////////////////////////////////
    // 차트별 추가사항
    ////////////////////////////////////////////////////////

    // 차트별 추가사항 반영
    this.chartOption = this.additionalSeries();

    // 차트옵션 반환
    return this.chartOption;
  }

  /**
   * 차트별 시리즈 추가정보
   * - 반드시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertSeriesData(): BaseOption {

    // 시리즈 설정
    this.chartOption.series = [];
    this.chartOption.series.push({
      type: SeriesType.RADAR,
      name: 'radar',
      data: this.data.columns.map((column) => {
        return column;
      }),
      uiData: this.data.columns.map((column) => {
        return column;
      })
    });

    return this.chartOption;
  }

  /**
   * 차트별 시리즈 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalSeries(): BaseOption {

    ////////////////////////////////////////////////////////
    // 차트 시리즈 변경 표현
    ////////////////////////////////////////////////////////

    this.chartOption = this.convertViewType();

    // 차트옵션 반환
    return this.chartOption;
  }

  /**
   * 차트별 tooltip 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalTooltip(): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    let format: UIChartFormat = this.uiOption.valueFormat;

    // 축의 포멧이 있는경우 축의 포멧으로 설정
    const axisFormat = FormatOptionConverter.getlabelAxisScaleFormatTooltip(this.uiOption);
    if (axisFormat) format = axisFormat;

    ///////////////////////////
    // 차트 옵션에 적용
    // - tooltip
    ///////////////////////////

    // 적용
    if( _.isUndefined(this.chartOption.tooltip) ) { this.chartOption.tooltip = {}; }
    this.chartOption.tooltip.formatter = ((params): any => {

      let option = this.chartOption.series[params.seriesIndex];

      let uiData = _.cloneDeep(option.uiData);
      // uiData값이 array인 경우 해당 dataIndex에 해당하는 uiData로 설정해준다
      if (uiData && uiData instanceof Array) uiData = option.uiData[params.dataIndex];

      return this.getFormatRadarValueSeriesTooltip(params, format, this.uiOption, option, uiData);
    });

    // 차트옵션 반환
    return this.chartOption;
  }

  /**
   * 데이터 정보를 변환한다.
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertDataInfo(): BaseOption {

    // min/max 값 설정
    this.chartOption.dataInfo = {
      minValue: this.data.info.minValue,
      maxValue: this.data.info.maxValue
    };

    return this.chartOption;
  }

  /**
   * 결과데이터를 기반으로 차트를 구성하는 피봇정보 설정
   * - 필요시 각 차트에서 Override
   */
  protected setPivotInfo(): void {

    // pivot aggs 초기화
    const aggs: string[] = [];

    // indicator 설정
    this.data.rows.map((row) => {
      if (_.indexOf(aggs, row) < 0) {
        aggs.push(row);
      }
    });

    // pivot 정보 설정, rows 정보는 중복값이 존재 할 수 있기 때문에 중복 제거
    this.pivotInfo = new PivotTableInfo([], [], aggs);
  }

  /**
   * 레이더의 차트별 기타 추가정보
   */
  protected additionalEtc(): BaseOption {

    // 레이더의 폰트사이즈 설정
    if (!this.uiOption.fontSize) return this.chartOption;

    const uiFontSize = this.uiOption.fontSize;
    let fontSize: number;

    switch(uiFontSize) {

      case FontSize.NORMAL:
        fontSize = 13;
        break;
      case FontSize.SMALL:
        fontSize = 11;
        break;
      case FontSize.LARGE:
        fontSize = 15;
        break;
    }

    // radar name값이 없는경우 초기설정
    if (!this.chartOption.radar.name) this.chartOption.radar.name = {};

    // 레이더의 이름에 폰트사이즈 설정
    this.chartOption.radar.name.fontSize = fontSize;

    return this.chartOption;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 공통 설정
   * - Line or Area
   */
  private convertViewType(): BaseOption {

    if( _.isUndefined(this.chartOption.series) ){ return this.chartOption; }

    let type: LineMarkType = this.uiOption['mark'];

    _.each(this.chartOption.series, (obj) => {
      if (_.eq(obj.type, SeriesType.RADAR)) {
        obj.areaStyle = _.eq(type, LineMarkType.AREA) ? OptionGenerator.AreaStyle.radarItemAreaStyle('default') : undefined;
      }
    });

    return this.chartOption;
  }

  /**
   * Series: 포맷에 해당하는 옵션을 모두 적용한다.
   * @param chartOption
   * @param uiOption
   * @returns {BaseOption}
   */
  private convertRadarFormatSeries(chartOption: BaseOption, uiOption: UIOption): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    let format: UIChartFormat = uiOption.valueFormat;
    if (_.isUndefined(format)){ return chartOption };

    // 축의 포멧이 있는경우 축의 포멧으로 설정
    const axisFormat = FormatOptionConverter.getlabelAxisScaleFormat(uiOption);
    if (axisFormat) format = axisFormat;

    ///////////////////////////
    // 차트 옵션에 적용
    // - 시리즈
    ///////////////////////////

    // 시리즈
    let series: Series[] = chartOption.series;

    // 적용
    _.each(series, (option, index) => {

      if( _.isUndefined(option.label) ) { option.label = { normal: {} }; }
      if( _.isUndefined(option.label.normal) ) { option.label.normal = {} }

      // 적용
      option.label.normal.formatter = ((params): any => {

        let uiData = _.cloneDeep(option.uiData);
        // uiData값이 array인 경우 해당 dataIndex에 해당하는 uiData로 설정해준다
        if (uiData && uiData instanceof Array) uiData = option.uiData[params.dataIndex];

        return this.getFormatRadarValueSeries(params, format, uiOption, option, uiData);
      });
    });

    // 반환
    return chartOption;
  }

  /**
   * 레이더의 포멧레이블 설정
   * @param params
   * @param format
   * @param uiOption
   * @param series
   * @param uiData
   * @returns {any}
   */
  private getFormatRadarValueSeries(params: any, format: UIChartFormat, uiOption?: UIOption, series?: any, uiData?: any): string {

    // UI 데이터 정보가 있을경우
    if( uiData ) {

      if (!uiOption.dataLabel || !uiOption.dataLabel.displayTypes) return '';

      // UI 데이터 가공
      let isUiData: boolean = false;
      let result: string[] = [];
      if( uiData['categoryName'] && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_NAME) ){

        // value의 index찾기
        const valueIndex = uiData['value'].indexOf(params.value);
        result.push(uiData['categoryName'][valueIndex]);
        isUiData = true;
      }
      if ( uiData['value'] && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.VALUE) ) {
        result.push(FormatOptionConverter.getFormatValue(params.value, format));
        isUiData = true;
      }

      let label: string = "";

      // UI 데이터기반 레이블 반환
      if( isUiData ) {
        for( let num: number = 0 ; num < result.length ; num++ ) {
          if( num > 0 ) {
            label += "\n";
          }
          if(series.label && series.label.normal && series.label.normal.rich) {
            label += '{align|'+ result[num] +'}';
          }
          else {
            label += result[num];
          }
        }
        return label;

        // 선택된 display label이 없는경우 빈값 리턴
      } else {
        return label;
      }
    }

    return FormatOptionConverter.noUIDataFormat(params, format);
  }

  /**
   * 레이더의 포멧툴팁 설정
   * @param params
   * @param format
   * @param uiOption
   * @param series
   * @param uiData
   * @returns {any}
   */
  private getFormatRadarValueSeriesTooltip(params: any, format: UIChartFormat, uiOption?: UIOption, series?: any, uiData?: any): string {

    // UI 데이터 정보가 있을경우
    if( uiData ) {

      if (!uiOption.toolTip) uiOption.toolTip = {};
      if (!uiOption.toolTip.displayTypes) uiOption.toolTip.displayTypes = FormatOptionConverter.setDisplayTypes(uiOption.type);

      // UI 데이터 가공
      let result: string[] = [];

      let categoryNameList = _.filter(this.pivot.aggregations, {type : 'dimension'});
      let categoryValueList = _.filter(this.pivot.aggregations, {type : 'measure'});

      // name, value를 두개를 선택한 경우
      if( uiData['categoryName'] && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_NAME) &&
          uiData['value'] && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.VALUE)){

        // categoryName과 categoryNameList length를 갖게설정
        while (uiData['categoryName'].length > categoryNameList.length) {
          categoryNameList.push(categoryNameList[0]);
        }

        _.each(uiData['categoryName'], (item, index: number) => {
          // categoryName 설정
          result = FormatOptionConverter.getTooltipName([item], categoryNameList, result, true);

          // categoryValue 설정
          let seriesValue = FormatOptionConverter.getTooltipValue(params.name, categoryValueList, format, uiData['value'][index]);
          result.push(seriesValue);
        });

      // 둘중 하나를 선택한 경우
      } else {
        if( uiData['categoryName'] && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_NAME) ){

          _.each(uiData['categoryName'], (item) => {
            // categoryName 설정
            result = FormatOptionConverter.getTooltipName([item], categoryNameList, result, true);
          })
        }
        if ( uiData['value'] && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.VALUE) ) {

          _.each(params.value, (item, index: number) => {
            // categoryValue 설정
            let seriesValue = FormatOptionConverter.getTooltipValue(params.name, categoryValueList, format, item);
            result.push(seriesValue);
          });
        }
      }

      return result.join('<br/>');
    }

    return FormatOptionConverter.noUIDataFormatTooltip(uiOption, params, format, this.fieldInfo);
  }
}
