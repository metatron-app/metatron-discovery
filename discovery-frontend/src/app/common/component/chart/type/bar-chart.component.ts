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

import { AfterViewInit, Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { BaseChart } from '../base-chart';
import { BaseOption } from '../option/base-option';
import {
  AxisType,
  BarMarkType, CHART_STRING_DELIMITER,
  ChartType,
  DataZoomRangeType, EventType,
  Position,
  SeriesType,
  ShelveFieldType,
  ShelveType,
  SymbolType,
  UIChartDataLabelDisplayType
} from '../option/define/common';
import { OptionGenerator } from '../option/util/option-generator';
import { Pivot } from '../../../../domain/workbook/configurations/pivot';
import * as _ from 'lodash';
import {UIChartAxis, UIChartAxisLabelValue, UIOption} from '../option/ui-option';
import { DataZoomType } from '../option/define/datazoom';
import {UIChartAxisGrid} from '../option/ui-option/ui-axis';
import {Axis} from '../option/define/axis';
import {AxisOptionConverter} from '../option/converter/axis-option-converter';
import { LabelOptionConverter } from '../option/converter/label-option-converter';
import { TooltipOptionConverter } from '../option/converter/tooltip-option-converter';

@Component({
  selector: 'bar-chart',
  template: '<div class="chartCanvas" style="width: 100%; height: 100%; display: block;"></div>'
})
export class BarChartComponent extends BaseChart implements OnInit, OnDestroy, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // set previous pivot (compare previous pivot, current pivot)
  private prevPivot: Pivot;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 변경된 UI 옵션을 UI로 전송
  @Output()
  public histogramUpdate = new EventEmitter();

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
    return ((this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.DIMENSION) + this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.TIMESTAMP)) > 0)
      && (this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) > 0 || this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED) > 0)
      && (this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.CALCULATED) == 0)
      && (this.getFieldTypeCount(pivot, ShelveType.ROWS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(pivot, ShelveType.ROWS, ShelveFieldType.CALCULATED) == 0);
  }

  /**
   * bar차트에서만 쓰이는 uiOption설정
   * @param isKeepRange
   */
  public draw(isKeepRange?: boolean): void {

    // uiOption에 중첩일때의 최소 / 최대값 설정
    this.uiOption = this.setStackMinMaxValue();

    // 바차트의 중첩 / 병렬에 따른 shelve 정보 변경
    this.pivot = this.changeShelveData(this.pivot);

    // 교차선반의 dimension값을 행으로 이동
    this.pivot = this.moveToAggregationFieldInfo(this.pivot);

    // 변경된 pivot정보로 fieldInfo, fieldOriginInfo 설정
    this.setFieldInfo();

    super.draw(isKeepRange);

    // 기존 선반값으로 치환
    this.pivot = _.cloneDeep(this.originPivot);

    // control차트의 바차트 업데이트 설정 (uiOptionUpdated로 하는경우 무한루프 발생)
    this.histogramUpdate.emit(this.uiOption);
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
      type: ChartType.BAR,
      grid: [OptionGenerator.Grid.verticalMode(10, 0, 0, 10, false, true, false)],
      xAxis: [OptionGenerator.Axis.categoryAxis(Position.MIDDLE, null, false, true, true, true)],
      yAxis: [OptionGenerator.Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
      legend: OptionGenerator.Legend.custom(false, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
      dataZoom: [OptionGenerator.DataZoom.horizontalDataZoom(), OptionGenerator.DataZoom.horizontalInsideDataZoom()],
      tooltip: OptionGenerator.Tooltip.itemTooltip(),
      toolbox: OptionGenerator.Toolbox.hiddenToolbox(),
      brush: OptionGenerator.Brush.selectBrush(),
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
    this.chartOption.series = this.data.columns.map((column) => {

      // // pivot rows 설정
      // const seriesName: string = column.name;
      // const rowNameList = _.split(seriesName, CHART_STRING_DELIMITER);
      // if (rowNameList.length > 1) {
      //   // 측정값 이름은 제외
      //   rows.push(_.join(_.dropRight(rowNameList), CHART_STRING_DELIMITER));
      // }

      // series의 data값이 0인경우 => null로 치환 (중첩시 log scale 적용에러때문)
      let dataList = [];
      for (let item of column.value) {
        if (item == 0) {
          item = null;
        }
        dataList.push(item);
      }
      column.value = dataList;

      // 시리즈 생성
      return {
        type: SeriesType.BAR,
        name: column.name,
        data: column.value.map( ( val, idx ) => {
          return {
            name : column.seriesName[idx],
            value : val,
            selected : false,
            itemStyle : OptionGenerator.ItemStyle.opacity1()
          }
        }),
        uiData: column,
        originData: _.cloneDeep(column.value),
        itemStyle: OptionGenerator.ItemStyle.auto(),
        label: OptionGenerator.LabelStyle.defaultLabelStyle(false, Position.TOP)
      };
    });

    return this.chartOption;
  }

  /**
   * 바차트의 series값으로 설정되는 부분
   */
  protected additionalSeries(): BaseOption {

    // 병렬 / 중첩에 따른 수치값 라벨 위치 재조정
    //this.chartOption = this.setValueLabelPosition();

    return this.chartOption;
  }

  /**
   * Chart Datazoom Event Listener
   */
  public addChartDatazoomEventListener(): void {

    this.chart.off('datazoom');
    this.chart.on('datazoom', (param) => {

      this.chartOption.dataZoom.map((zoom, index) => {
        if( _.eq(zoom.type, DataZoomType.SLIDER) ) {
          this.uiOption.chartZooms[index].start = param.start;
          this.uiOption.chartZooms[index].end = param.end;
        }
      });
    });
  }

  /**
   * 바차트의 dataZoom
   */
  protected additionalDataZoom(): BaseOption {
/*
    // 저장정보 존재 여부에 따라 미니맵 범위 자동 지정
    if (!_.isUndefined(this.uiOption.chartZooms)
      && (!_.isUndefined(this.uiOption.size) && this.uiOption.limitCheck) || (this.uiOption.chartZooms && _.isUndefined(this.uiOption.chartZooms[0].start))) {

      // Limit이 지정된 경우
      if( !_.isUndefined(this.uiOption.size) && this.uiOption.limitCheck ) {
        this.convertDataZoomRangeByType(
          this.chartOption,
          DataZoomRangeType.COUNT,
          0,
          this.uiOption.size
        );
      }
      // limit이 지정되지않은 경우
      else {
        this.convertDataZoomAutoRange(
          this.chartOption,
          20,
          500,
          10,
          this.existTimeField
        );
      }
    }
*/
    // 저장정보 존재 여부에 따라 미니맵 범위 자동 지정
    if (!_.isUndefined(this.uiOption.chartZooms)
      && (!_.isUndefined(this.uiOption.size) && this.uiOption.limitCheck) || (this.uiOption.chartZooms && _.isUndefined(this.uiOption.chartZooms[0].start))) {

      this.convertDataZoomAutoRange(
        this.chartOption,
        20,
        500,
        10,
        this.existTimeField
      );
    }
    return this.chartOption;
  }

  /**
   * 바차트의 DataZoom(미니맵) 활성화 범위 영역 자동 변경
   * @param option
   * @param count
   * @param limit
   * @param percent
   * @param isTime
   * @param idx
   * @returns {BaseOption}
   */
  protected convertDataZoomAutoRange(option: BaseOption, count: number, limit: number, percent: number, isTime: boolean, idx?: number): BaseOption {

    if (_.isUndefined(option.dataZoom)) return option;

    // 시리즈
    const series = option.series;
    // 변경하려는 DataZoom index - 따로 지정하지 않으면 0으로 설정
    const dataZoomIdx = _.isUndefined(idx) ? 0 : idx;
    // 축 단위 개수
    let colCount = !_.isUndefined(option.xAxis[0].data) ? option.xAxis[0].data.length : option.yAxis[0].data.length;

    // 종료지정 설정 (상위 n개)
    let startValue = 0;
    let endValue = count - 1;
    const isStackMode = _.eq(series[0].type, SeriesType.BAR) && !_.isUndefined(series[0].stack);
    const seriesLength = series.length;

    // bar 차트는 데이터 개수에 시리즈 개수를 곱해야 함
    // 시간 데이터는 제외
    if (!isTime) {
      colCount = isStackMode ? colCount : colCount * seriesLength;
    }
    // 기준 개수가 넘어갈 경우 경우는 n% 로 범위 변경
    if (_.gt(colCount, limit)) {
      // 전체 데이터의 10%인덱스
      endValue = seriesLength >= 20 ? 0 : Math.floor((colCount) * (percent / 100)) - 1;
    }

    // bar 차트는 시리즈 내의 개수만큼 등분
    endValue = Math.floor(endValue / seriesLength);

    // x축 개수에 따라 종료지점 설정
    endValue = _.eq(colCount, 1) ? 0 : _.eq(endValue, 0) ? 1 : endValue;

    // 시간 축이 존재한다면 확대범위를 마지막 축 기준으로 설정
    if (isTime) {
      startValue = colCount - _.cloneDeep(endValue);
      endValue = colCount - 1;
    }

    option.dataZoom[dataZoomIdx].startValue = startValue;
    option.dataZoom[dataZoomIdx].endValue = endValue;
    delete option.dataZoom[dataZoomIdx].start;
    delete option.dataZoom[dataZoomIdx].end;

    // inside datazoom 이 존재한다면 range값 동기화
    option.dataZoom.map((obj) => {
      if (_.eq(obj.type, DataZoomType.INSIDE)) {
        obj.startValue = startValue;
        obj.endValue = endValue;
        delete obj.start;
        delete obj.end;
      }
    });

    return option;
  }

  /**
   * 셀렉션 이벤트를 등록한다.
   * - 필요시 각 차트에서 Override
   */
  protected selection(): void {

    // 기존 선반값 설정
    this.originPivot = _.cloneDeep(this.pivot);

    // 교차선반의 dimension값을 행으로 이동
    this.pivot = this.moveToAggregationFieldInfo(this.pivot);

    this.addChartSelectEventListener();
    this.addChartMultiSelectEventListener();
    this.addLegendSelectEventListener();

    // 기존 선반값으로 치환
    this.pivot = _.cloneDeep(this.originPivot);
  }

  /**
   * change dataLabel, tooltip by single series, multi series
   * @returns {UIOption}
   */
  protected setDataLabel(): UIOption {

    /**
      * check multi series <=> single series
      * @type {() => boolean}
      */
    const checkChangeSeries = ((): boolean => {

      if (!this.prevPivot) return true;

      // prev series is multi(true) or single
      const prevSeriesMulti: boolean = this.prevPivot.aggregations.length > 1 || this.prevPivot.rows.length >= 1 ? true : false;

      // current series is multi(true) or single
      const currentSeriesMulti: boolean = this.pivot.aggregations.length > 1 || this.pivot.rows.length >= 1 ? true : false;

      // if it's changed
      if (prevSeriesMulti !== currentSeriesMulti) {

        return true;
      }

      // not changed
      return false;
    });

    this.uiOption = this.setAxisDataLabel(this.prevPivot,checkChangeSeries());

    // set previous pivot value (compare previous pivot, current pivot)
    this.prevPivot = this.pivot;

    return this.uiOption;
  }

  /**
   * 차트별 Y축 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalYAxis(): BaseOption {

    // Min / Max를 재계산한다.
    this.convertAxisAutoScale(AxisType.Y);


    // 차트옵션 반환
    return this.chartOption;
  }

  /**
   * 차트별 X축 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalXAxis(): BaseOption {

    // Min / Max를 재계산한다.
    this.convertAxisAutoScale(AxisType.X);


    // 차트옵션 반환
    return this.chartOption;
  }

  /**
   * Min / Max 오토스케일
   * @param axisType
   */
  protected convertAxisAutoScale(axisType: AxisType): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    // 축에 해당하는 Axis 옵션
    let axisOption: UIChartAxis[] = AxisOptionConverter.getAxisOption(this.uiOption, axisType);

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    let axis: Axis[] = this.chartOption[axisType];

    _.each(axis, (option: Axis, index) => {

      // Value축일 경우
      if ((<UIChartAxisLabelValue>axisOption[index].label) && _.eq((<UIChartAxisLabelValue>axisOption[index].label).type, AxisType.VALUE)
        && axisOption[index].grid ) {

        let min = null;
        let max = null;
        let calculateMin = null;
        if( this.isStacked() && this.originalData.categories && this.originalData.categories.length > 0 ) {
          _.each(this.originalData.categories, (category) => {
            _.each(category.value, (value) => {
              if( min == null || value < min ) {
                min = value;
              }
              if( max == null || value > max ) {
                max = value;
              }
            });
          });
          calculateMin = Math.ceil(min - ((max - min) * 0.05));
          // min = min > 0
          //   ? calculateMin >= 0 ? calculateMin : min
          //   : min;
          max = max == null ? 0 : max;
        }
        else {
          calculateMin = Math.ceil(this.originalData.info.minValue - ((this.originalData.info.maxValue - this.originalData.info.minValue) * 0.05));
          min = this.originalData.info.minValue;
          // min = this.originalData.info.minValue > 0
          //   ? calculateMin >= 0 ? calculateMin : min
          //   : this.originalData.info.minValue;
          max = this.originalData.info.maxValue;
        }

        // Min / Max 업데이트
        AxisOptionConverter.axisMinMax[axisType].min = min;
        AxisOptionConverter.axisMinMax[axisType].max = max;

        // 기준선 변경시
        let baseline = 0;
        if( axisOption[index].baseline && axisOption[index].baseline != 0 ) {
          baseline = <number>axisOption[index].baseline;
        }

        // 축 범위 자동설정이 설정되지 않았고
        // 오토스케일 적용시
        if( baseline == 0 && axisOption[index].grid.autoScaled ) {
          // // 적용
          // option.min = min > 0
          //   ? Math.ceil(min - ((max - min) * 0.05))
          //   : min;
          // option.max = max;

          delete option.min;
          delete option.max;
          option.scale = true;
        }
        else {
          delete option.scale;
        }
      }
    });

    // 반환
    return this.chartOption;
  }

  protected calculateMinMax(grid: UIChartAxisGrid, result: any, isYAsis: boolean): void {

    // 축범위 자동설정일 경우
    if( grid.autoScaled ) {
      if( this.isStacked() && result.data.categories && result.data.categories.length > 0 ) {
        let min = null;
        let max = null;
        _.each(result.data.categories, (category) => {
          _.each(category.value, (value) => {
            if( min == null || value < min ) {
              min = value;
            }
            if( max == null || value > max ) {
              max = value;
            }
          });
        });
        grid.min = min > 0
          ? Math.ceil(min - ((max - min) * 0.05))
          : min
        grid.max = max;
      }
      else {
        grid.min = result.data.info.minValue > 0
          ? Math.ceil(result.data.info.minValue - ((result.data.info.maxValue - result.data.info.minValue) * 0.05))
          : result.data.info.minValue
        grid.max = result.data.info.maxValue;
      }
    }

    // Min / Max값이 없다면 수행취소
    if( ((_.isUndefined(grid.min) || grid.min == 0)
      && (_.isUndefined(grid.max) || grid.max == 0)) ) {
      return;
    }

    // 멀티시리즈 개수를 구한다.
    let seriesList = [];
    result.data.columns.map((column, index) => {
      let nameArr = _.split(column.name, CHART_STRING_DELIMITER);
      let name = "";
      if( nameArr.length > 1 ) {
        nameArr.map((temp, index) => {
          if( index < nameArr.length - 1 ) {
            if( index > 0 ) {
              name += CHART_STRING_DELIMITER;
            }
            name += temp;
          }
        });
      }
      else {
        name = nameArr[0];
      }

      let isAlready = false;
      seriesList.map((series, index) => {
        if( series == name ) {
          isAlready = true;
          return false;
        }
      });

      if( !isAlready ) {
        seriesList.push(name);
      }
    });

    // Min/Max 처리
    if( !this.isStacked() || !result.data.categories || result.data.categories.length == 0 ) {
      result.data.columns.map((column, index) => {
        column.value.map((value, index) => {
          if( value < grid.min ) {
            column.value[index] = grid.min;
          }
          else if( value > grid.max ) {
            column.value[index] = grid.max;
          }
        });
      });
    }
    else {

      _.each(result.data.categories, (category, categoryIndex) => {
        let totalValue = [];
        let seriesValue = [];
        result.data.columns.map((column, index) => {

          if( column.name.indexOf(category.name) == -1 ) {
            return true;
          }

          column.value.map((value, index) => {
            if( _.isUndefined(totalValue[index]) || isNaN(totalValue[index]) ) {
              totalValue[index] = 0;
              seriesValue[index] = 0;
            }

            if( totalValue[index] > grid.max ) {
              column.value[index] = 0;
            }
            else if( totalValue[index] + value > grid.max ) {
              if( seriesValue[index] <= 0 ) {
                column.value[index] = grid.max;
              }
              else {
                column.value[index] = (<number>grid.max) - totalValue[index];
              }
            }
            else if( totalValue[index] + value < grid.min ) {
              column.value[index] = 0;
            }
            else if( totalValue[index] < grid.min && totalValue[index] + value > grid.min ) {
              column.value[index] = totalValue[index] + value;
            }
            else {
              column.value[index] = value;
            }
            seriesValue[index] += column.value[index];
            totalValue[index] += value;
          });
        });

        // Min값보다 작다면
        _.each(totalValue, (value, valueIndex) => {
          if( value < grid.min ) {
            result.data.columns.map((column, index) => {
              column.value.map((value, index) => {
                if( index == valueIndex ) {
                  column.value[index] = 0;
                }
              });
            });
          }
        });
      });
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터 라벨 위치 설정
   */
  // private setValueLabelPosition(): BaseOption {
  //
  //   const series = this.chartOption.series;
  //
  //   // 차트 표현 방향
  //   const orient = _.eq(this.chartOption.xAxis[0].type, AxisType.CATEGORY) ? Orient.VERTICAL : Orient.HORIZONTAL;
  //
  //   // 차트 표현 방향
  //   _.each(series, (obj) => {
  //     // 스택/병렬 모드별 구분
  //     if (!_.isUndefined(obj.stack)) {
  //       obj.label.normal = _.extend({}, obj.label.normal, OptionGenerator.LabelStyle.stackBarLabelStyle(orient, obj.label.normal.show, this.chartOption.type).normal);
  //     } else {
  //       obj.label.normal = _.extend({}, obj.label.normal, OptionGenerator.LabelStyle.multipleBarLabelStyle(orient, obj.label.normal.show).normal);
  //     }
  //   });
  //
  //   return this.chartOption;
  // }

  /**
   * 바차트의 shelve 변경 병렬일때 => 교차선반의 dimension을 행으로 이동 => 범례 같은 데이터 설정때문에
   */
  private changeShelveData(shelve: any): any {

    // mark가 없는경우 return
    if (!this.uiOption['mark']) return shelve;

    // 행값이 없는경우 return
    if (shelve.rows && shelve.rows.length == 0) return shelve;

    // 중첩일때
    if (BarMarkType.STACKED === this.uiOption['mark']) {

      // 교차선반에 있는 dimension을 행선반으로 이동
      for (let num = shelve.aggregations.length; num--;) {

        let item = shelve.aggregations[num];

        // dimension이면
        if (item.type === String(ShelveFieldType.DIMENSION)) {

          // 교차선반에서 제거
          shelve.aggregations.splice(num, 1);

          // 행선반에 추가
          shelve.rows.push(item);
        }
      }

    }
    // 병렬일떄
    else {

      // 교차선반에 있는 dimension을 행선반으로 이동
      for (let num = shelve.aggregations.length; num--;) {

        let item = shelve.aggregations[num];

        // dimension이면
        if (item.type === String(ShelveFieldType.DIMENSION)) {

          // 행선반에서 제거
          shelve.rows.splice(num, 1);

          // 교차선반에 추가
          shelve.aggregations.push(item);
        }
      }
    }

    return shelve;
  }

  /**
   * uiOption의 중첩시 최소 / 최대값 설정
   */
  private setStackMinMaxValue(): UIOption {
    const series = _.cloneDeep(this.data.columns);

    // 중첩 최소 / 최대값 초기화
    delete this.uiOption.stackedMinValue;
    delete this.uiOption.stackedMaxvalue;

    // stack이거나 음수값이 있는경우 stack의 min / max value 설정하기
    if ((series && this.uiOption['mark'] == BarMarkType.STACKED && series.length > 1) ||
         this.data.info.minValue < 0) {

      this.uiOption.stackedMinValue = 0;

      for (let num = series[0].value.length; num--;) {
        let maxValue = 0;
        let minValue = 0;
        let minArray = [];

        // series의 num에 해당하는 value값을 더하기
        for(const item of series) {
          if (item.value) {
            minArray.push(item.value[num]);
            maxValue += item.value[num];
          }
        }

        // 음수값이 있는경우 정수값을 더하지 않는다
        if (_.min(minArray) < 0) {
          minValue = _.sum(_.remove(minArray, (data) => {return data < 0}));

        } else {
          minValue = _.sum(minArray);
        }

        // 음수값이 있는경우 Minvalue 설정
        if (this.data.info.minValue < 0) {
          this.uiOption.stackedMinValue = this.uiOption.stackedMinValue > minValue ? minValue : this.uiOption.stackedMinValue;
        }
        // Maxvalue 설정
        this.uiOption.stackedMaxvalue = _.isUndefined(this.uiOption.stackedMaxvalue) || this.uiOption.stackedMaxvalue < maxValue? maxValue : this.uiOption.stackedMaxvalue;
      }
    }

    return this.uiOption;
  }

  /**
   * 병렬일때 fieldInfo값의 교차선반으로 이동된 dimension값을 행으로 이동
   * @param shelve
   * @returns {any}
   */
  private moveToAggregationFieldInfo(shelve: any): any {

    // fieldInfo 값을 교차선반의 교차의 dimension값을 행으로변경 -> 색상설정 오류때문
    for (let num = shelve.aggregations.length; num--;) {

      const item = shelve.aggregations[num];

      // dimension값의경우
      if (ShelveFieldType.DIMENSION === item.type) {

        // 교차에서 제거
        shelve.aggregations.splice(num, 1);
        // 행으로 이동
        shelve.rows.push(item);
      }
    }

    return shelve;
  }

  /**
   * Stacked 바차트 여부
   */
  private isStacked(): boolean {

    let stacked: boolean = false;

    // 행선반에 dimension 값이 있는경우 찾기
    console.info(this.originPivot);
    this.originPivot.rows.forEach((item) => {

      // dimension이면
      if (item.type === String(ShelveFieldType.DIMENSION)) {

        stacked = true;
      }
    });

    return stacked;
  }

}
