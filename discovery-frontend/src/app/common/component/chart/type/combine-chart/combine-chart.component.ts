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
  AfterViewInit, Component, ElementRef, Injector, OnInit, OnDestroy,
  Output, EventEmitter
} from '@angular/core';
import {BaseChart, PivotTableInfo} from '../../base-chart';
import {BaseOption} from "../../option/base-option";
import {
  ChartType, SymbolType, ShelveType, ShelveFieldType, CHART_STRING_DELIMITER, SeriesType, AxisType,
  Orient, SeriesConvertType, BarMarkType, LineMarkType, DataLabelPosition
} from '../../option/define/common';
import {OptionGenerator} from '../../option/util/option-generator';
import {Position} from '../../option/define/common';
import {Pivot} from "../../../../../domain/workbook/configurations/pivot";
import * as _ from 'lodash';
import {Series} from "../../option/define/series";
import { UICombineChart } from '../../option/ui-option/ui-combine-chart';
import {UIChartAxis, UIChartAxisGrid, UIChartAxisLabelValue} from "../../option/ui-option/ui-axis";
import {AxisOptionConverter} from "../../option/converter/axis-option-converter";
import {Axis} from "../../option/define/axis";

@Component({
  selector: 'combine-chart',
  templateUrl: 'combine-chart.component.html'
})
export class CombineChartComponent extends BaseChart implements OnInit, OnDestroy, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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
      && ((this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) + this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED)) >= 2
      && (this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) + this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED)) <= 4)
      && (this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.CALCULATED) == 0)
      && (this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) == 0 && this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP) == 0)
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
      type: ChartType.COMBINE,
      grid: [OptionGenerator.Grid.verticalMode(10, 0, 0, 10, false, true, false)],
      xAxis: [OptionGenerator.Axis.categoryAxis(Position.MIDDLE, null, false, true, true, true)],
      yAxis: [OptionGenerator.Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true), OptionGenerator.Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
      legend: OptionGenerator.Legend.custom(false, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
      dataZoom: [OptionGenerator.DataZoom.horizontalDataZoom(), OptionGenerator.DataZoom.horizontalInsideDataZoom()],
      tooltip: OptionGenerator.Tooltip.itemTooltip(),
      toolbox: OptionGenerator.Toolbox.hiddenToolbox(),
      brush: OptionGenerator.Brush.selectBrush(),
      series: []
    };
  }

  /**
   * 차트별 기본설정 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalBasic(): BaseOption {

    // 차트가 그려진 후 UI에 필요한 옵션 설정 - 축 정보
    this.setAxisNameInfo();

    // 차트가 그려진 후 UI에 필요한 옵션 설정 - 측정값 리스트
    this.setMeasureList();

    // 차트옵션 반환
    return this.chartOption;
  }

  /**
   * 차트별 X축 정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertXAxisData(): BaseOption {

    const xAxisName = _.join(this.fieldInfo.cols, CHART_STRING_DELIMITER);
    this.chartOption.xAxis[0].name = xAxisName;
    this.chartOption.xAxis[0].axisName = xAxisName;
    this.chartOption.xAxis[0].data = this.data.rows;

    return this.chartOption;
  }

  /**
   * 차트별 Y축 정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertYAxisData(): BaseOption {

    const yAxis: string[] = this.fieldInfo.aggs;
    _.each(yAxis, (axis, idx) => {
      const axisIdx = idx % 2;
      if (idx < 2) {
        this.chartOption.yAxis[axisIdx].name = yAxis[idx];
        this.chartOption.yAxis[axisIdx].axisName = yAxis[idx];
      } else {
        this.chartOption.yAxis[axisIdx].name += CHART_STRING_DELIMITER + yAxis[idx];
        this.chartOption.yAxis[axisIdx].axisName += CHART_STRING_DELIMITER + yAxis[idx];
      }
    });

    return this.chartOption;
  }

  /**
   * 차트별 Y축 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalYAxis(): BaseOption {

    // Min / Max값을 재계산한다.
    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    // 축에 해당하는 Axis 옵션
    let axisOption: UIChartAxis[] = AxisOptionConverter.getAxisOption(this.uiOption, AxisType.Y);

    ///////////////////////////
    // 차트 옵션에 적용
    ///////////////////////////

    // 축
    let axis: Axis[] = this.chartOption[AxisType.Y];

    _.each(axis, (option: Axis, index) => {

      // Value축일 경우
      if ((<UIChartAxisLabelValue>axisOption[index].label) && _.eq((<UIChartAxisLabelValue>axisOption[index].label).type, AxisType.VALUE)
        && axisOption[index].grid) {

        // Min / Max값을 다시 구한다.
        let min = null;
        let max = null;
        this.data.columns.map((column, index) => {
          if( index % 2 == 0 ) {
            column.value.map((value) => {
              if (min == null || value < min) {
                min = value;
              }
              if (max == null || value > max) {
                max = value;
              }
            });
          }
        });

        min = min > 0
          ? Math.ceil(min - ((max - min) * 0.05))
          : min;
        max = max;

        // Min / Max 업데이트
        AxisOptionConverter.axisMinMax[AxisType.Y].min = min;
        AxisOptionConverter.axisMinMax[AxisType.Y].max = max;

        // 기준선 변경시
        let baseline = 0;
        if( axisOption[index].baseline != 0 ) {
          baseline = axisOption[index].baseline
        }

        // 축 범위 자동설정이 설정되지 않았고
        // 오토스케일 적용시
        if( baseline == 0 && axisOption[index].grid.autoScaled ) {
          // 적용
          option.min = min > 0
            ? Math.ceil(min - ((max - min) * 0.05))
            : min;
          option.max = max;
        }
      }
    });


    // 차트옵션 반환
    return this.chartOption;
  }

  /**
   * 차트별 시리즈 추가정보
   * - 반드시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertSeriesData(): BaseOption {

    let typeValue: SeriesType;
    this.chartOption.series = this.data.columns.map((column, idx) => {

      typeValue = null;

      // aggregation값에 type을 지정한값이 있는경우
      if (this.pivot.aggregations[idx] && this.pivot.aggregations[idx].options) {
        // bar타입일때
        if (-1 !== this.pivot.aggregations[idx].options.indexOf(SeriesType.BAR.toString())) {

          typeValue = SeriesType.BAR;
        // line타입일때
        } else {
          typeValue = SeriesType.LINE;
        }
      }
      // 시리즈 생성
      const series: Series = {
        type: typeValue ? typeValue : _.eq(idx % 2, 0) ? SeriesType.BAR : SeriesType.LINE,
        name: column.name,
        data: column.value,
        originData: _.cloneDeep(column.value),
        yAxisIndex: _.eq(idx % 2, 0) ? 0 : 1,
        itemStyle: OptionGenerator.ItemStyle.auto(),
        label: OptionGenerator.LabelStyle.defaultLabelStyle(false, Position.TOP),
        uiData: column
      };

      if (_.eq(series.type, SeriesType.BAR)) {

      } else {
        series.symbol = SymbolType.CIRCLE;
        series.connectNulls = true;
        series.showAllSymbol = true;
        series.symbol = SymbolType.CIRCLE;
        series.sampling = 'max';
      }
      return series;
    });

    return this.chartOption;
  }

  /**
   * 차트별 시리즈 추가정보
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected additionalSeries(): BaseOption {

    // 차트 표현 모양 변경(스택/병렬)
    this.chartOption = this.convertBarViewType();
    // 차트 시리즈 표현 타입 변경(라인/면적)
    this.chartOption = this.convertLineViewType();
    // 차트 라벨 position 변경
    this.chartOption = this.convertCombinePosition();

    // 차트옵션 반환
    return this.chartOption;
  }

  /**
   * 결과데이터를 기반으로 차트를 구성하는 피봇정보 설정
   * - 필요시 각 차트에서 Override
   */
  protected setPivotInfo(): void {

    // pivot cols, rows 초기화
    const cols: string[] = this.data.rows;
    const rows: string[] = [];

    // Pivot 정보 생성
    this.pivotInfo = new PivotTableInfo(cols, _.uniq(rows), this.fieldInfo.aggs);
  }

  /**
   * 셀렉션 이벤트를 등록한다.
   * - 필요시 각 차트에서 Override
   */
  protected selection(): void {
    this.addChartSelectEventListener();
    this.addChartMultiSelectEventListener();
    this.addLegendSelectEventListener();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차트 표현 모양 변경(스택/병렬)
   *
   * @param type
   */
  private convertBarViewType(): BaseOption {

    const type = (<UICombineChart>this.uiOption).barMarkType;

    const series = this.chartOption.series;
    series.map((obj) => {
      if (_.eq(obj.type, SeriesType.BAR)) {
        let stackName: string = '';
        // 모드에 따라 스택명, 수치값 라벨 위치 변경
        if (_.eq(type, BarMarkType.STACKED)) {
          // 시리즈명을 delimiter로 분리, 현재 시리즈의 측정값 필드명 추출
          stackName = _.last(_.split(obj.name, CHART_STRING_DELIMITER));
          obj.stack = _.isEmpty(this.fieldInfo.rows) ? 'measureStack' : stackName;
        } else {
          delete obj.stack;
        }
      }
    });

    // 수치값 라벨 위치 재조정
    //return this.valueLabelPosition();

    return this.chartOption;
  }

  /**
   * 스택/병렬 모드에 따른 수치값 라벨 위치 변경
   *
   * @param option
   * @returns {BaseOption}
   */
  private  valueLabelPosition(): BaseOption {

    // 차트 표현 방향
    const orient: Orient = _.eq(this.chartOption.xAxis[0].type, AxisType.CATEGORY) ? Orient.VERTICAL : Orient.HORIZONTAL;

    const series = this.chartOption.series;
    // 차트 표현 방향
    series.map((obj) => {
      // 스택/병렬 모드별 구분
      if (!_.isUndefined(obj.stack)) {
        obj.label.normal = _.extend({}, obj.label.normal, OptionGenerator.LabelStyle.stackBarLabelStyle(orient, obj.label.normal.show, this.chartOption.type).normal);
      } else {
        obj.label.normal = _.extend({}, obj.label.normal, OptionGenerator.LabelStyle.multipleBarLabelStyle(orient, obj.label.normal.show).normal);
      }
    });

    return this.chartOption;
  }

  /**
   * 차트 시리즈 표현 타입 변경(라인/면적)
   *
   * @param type
   */
  private convertLineViewType(): BaseOption {

    const type = (<UICombineChart>this.uiOption).lineMarkType;

    const series = this.chartOption.series;
    series.map((obj) => {
      if (_.eq(obj.type, SeriesType.LINE)) {
        obj.areaStyle = _.eq(type, LineMarkType.AREA) ? OptionGenerator.AreaStyle.customAreaStyle(0.5) : undefined;
      }
    });
    return this.chartOption;
  }

  /**
   * 결합차트의 position 변경
   * @returns {BaseOption}
   */
  private convertCombinePosition() {

    const getPosition = ((pos: DataLabelPosition): Position => {
      let position: Position = null;

      switch(pos) {
        case DataLabelPosition.OUTSIDE_TOP :
        case DataLabelPosition.TOP :
          position = Position.TOP;
          break;
        case DataLabelPosition.OUTSIDE_RIGHT :
          position = Position.RIGHT;
          break;
        case DataLabelPosition.INSIDE_TOP :
          position = Position.INSIDETOP;
          break;
        case DataLabelPosition.INSIDE_BOTTOM :
          position = Position.INSIDEBOTTOM;
          break;
        case DataLabelPosition.INSIDE_RIGHT :
          position = Position.INSIDERIGHT;
          break;
        case DataLabelPosition.INSIDE_LEFT :
          position = Position.INSIDELEFT;
          break;
        case DataLabelPosition.CENTER :
          position = Position.INSIDE;
          break;
        case DataLabelPosition.BOTTOM :
          position = Position.BOTTOM;
          break;
        default:
          position = Position.TOP;
          break;
      }

      return position;
    });

    _.each(this.chartOption.series, (option, index: number) => {

      if (!option.label) option.label = {normal: {}};

      // 짝수인경우 => 바차트
      if (index % 2 == 0) {

        option.label.normal.position = getPosition(this.uiOption.dataLabel.pos);
        // 홀수인경우 => 라인차트
      } else {
        option.label.normal.position = getPosition(this.uiOption.dataLabel.secondaryPos);
      }
    });

    return this.chartOption;
  }

  protected calculateMinMax(grid: UIChartAxisGrid, result: any, isYAsis: boolean): void {

    // 축범위 자동설정일 경우
    if( grid.autoScaled ) {
      // Min / Max값을 다시 구한다.
      let min = null;
      let max = null;
      result.data.columns.map((column, index) => {
        if( index % 2 == 0 ) {
          column.value.map((value) => {
            if (min == null || value < min) {
              min = value;
            }
            if (max == null || value > max) {
              max = value;
            }
          });
        }
      });
      grid.min = min > 0
        ? Math.ceil(min - ((max - min) * 0.05))
        : min
      grid.max = max;

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
    if( !result.data.categories || result.data.categories.length == 0 ) {
      result.data.columns.map((column, index) => {
        if( index % 2 == 0 ) {
          column.value.map((value, index) => {
            if( value < grid.min ) {
              column.value[index] = grid.min;
            }
            else if( value > grid.max ) {
              column.value[index] = grid.max;
            }
          });
        }
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
                column.value[index] = grid.max - totalValue[index];
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


}
