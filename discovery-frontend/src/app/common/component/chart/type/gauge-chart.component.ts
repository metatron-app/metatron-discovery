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
 * Created by juheeko on 2017. 11. 14..
 */

import {Component, ElementRef, Injector, Input} from '@angular/core';
import {BaseChart, ChartSelectInfo, PivotTableInfo} from '../base-chart';
import {
  CHART_STRING_DELIMITER,
  ChartColorList,
  ChartColorType,
  ChartSelectMode,
  ChartType, ColorCustomMode,
  ColorRangeType,
  Position,
  SeriesType,
  ShelveFieldType,
  ShelveType,
  SymbolType,
  UIChartDataLabelDisplayType
} from '../option/define/common';
import {OptionGenerator} from '../option/util/option-generator';
import {Series} from '../option/define/series';
import * as _ from 'lodash';
import {Pivot} from '../../../../domain/workbook/configurations/pivot';
import {Alert} from '../../../util/alert.util';
import {BaseOption} from '../option/base-option';
import {UIChartColorByDimension, UIChartColorByValue, UIChartFormat, UIOption} from '../option/ui-option';
import {FormatOptionConverter} from '../option/converter/format-option-converter';
import {ColorRange, UIChartColor, UIChartColorBySeries} from '../option/ui-option/ui-color';
import {UIScatterChart} from '../option/ui-option/ui-scatter-chart';
import optGen = OptionGenerator;
import UI = OptionGenerator.UI;
import {DIRECTION, Sort} from '../../../../domain/workbook/configurations/sort';

@Component({
  selector: 'gauge-chart',
  template: '<div class="chartCanvas" style="width: 100%; height: 100%; display: block;"></div>'
})
export class GaugeChartComponent extends BaseChart {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('sorts')
  private sorts: Sort[];

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
    protected injector: Injector) {

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
   *
   * @param shelve
   */
  public isValid(shelve: Pivot): boolean {
    return ((this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.DIMENSION) + this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.TIMESTAMP)) > 0)
      && ((this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) + this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED)) == 1)
      && (this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(shelve, ShelveType.ROWS, ShelveFieldType.CALCULATED) == 0)
      && (this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) == 0 && this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP) == 0)
  }

  /**
   * gauge차트에서만 쓰이는 uiOption설정
   * @param isKeepRange
   */
  public draw(isKeepRange?: boolean): void {

    // 음수값 있는지 체크
    // minValue값이 음수인경우 선반에서 measure값을 제거하고
    this.removeNegative();

    // uiOption 설정
    // stacked의 최대값 최소값 설정
    this.uiOption.stackedMaxvalue = 100;
    this.uiOption.stackedMinValue = 0;

    // 게이지 data 설정
    this.data = this.setGaugeChartData(isKeepRange);

    // 게이지 data 설정이후에 uiData값 설정
    this.data.columns = this.setUIData();

    // pivot cols, rows 초기화
    const rows: string[] = [];

    _.each(this.data.columns, (series) => {

      _.each(series, (column) => {

        // 최대값 최소값 설정
        this.data.info.maxValue = column.value > this.data.info.maxValue ? column.value : this.data.info.maxValue;
        this.data.info.minValue = this.data.info.minValue > column.value ? column.value : this.data.info.minValue;

        const columnName: string = _.split(column.name, CHART_STRING_DELIMITER)[1];
        // pivotInfo데이터의 rows 데이터 설정 (범례, 색상에서 사용)
        rows.push(columnName);
      })
    });

    // setDataInfo를 게이지 데이터 정제후 재실행
    this.setDataInfo();

    // dimension의 data리스트
    this.uiOption.fieldDimensionDataList = rows;

    // pivotInfo 설정
    this.pivotInfo = new PivotTableInfo([], rows, this.fieldInfo.aggs);

    // gauge차트의 mapping값 설정
    // this.uiOption.color = this.gaugeSetMapping(rows);

    super.draw(isKeepRange);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * color by measure의 range값 리턴
   * @returns {any}
   */
  protected setMeasureColorRange(schema): ColorRange[] {

    // return value
    let rangeList = [];

    // set color list matching this schema
    const colorList = <any>ChartColorList[schema];

    // bring the data that have the longest length
    let rowsList = <any>_.max(this.data.columns);

    let rowsListLength = rowsList.length;

    // if rows length is less than colorList length, set rows length instead 5(default)
    let colorListLength = colorList.length > rowsListLength ? rowsListLength - 1 : colorList.length - 1;

    // less than 0, set minValue
    const minValue = this.uiOption.minValue >= 0 ? 0 : _.cloneDeep(this.uiOption.minValue);

    const addValue = (this.uiOption.maxValue - minValue) / colorListLength;

    let maxValue = _.cloneDeep(this.uiOption.maxValue);

    let shape;
    if ((<UIScatterChart>this.uiOption).pointShape) {
      shape = (<UIScatterChart>this.uiOption).pointShape.toString().toLowerCase();
    }

    // set ranges
    for (let index = colorListLength; index >= 0; index--) {

      let color = colorList[index];

      // set the biggest value in min(gt)
      if (colorListLength == index) {

        rangeList.push(UI.Range.colorRange(ColorRangeType.SECTION, color, parseFloat(maxValue.toFixed(1)), null, parseFloat(maxValue.toFixed(1)), null, shape));

      } else {
        // if it's the last value, set null in min(gt)
        let min = 0 == index ? null : parseFloat((maxValue - addValue).toFixed(1));

        // if value if lower than minValue, set it as minValue
        if (min < this.uiOption.minValue && min < 0) min = _.cloneDeep(parseInt(this.uiOption.minValue.toFixed(1)));

        rangeList.push(UI.Range.colorRange(ColorRangeType.SECTION, color, min, parseFloat(maxValue.toFixed(1)), min, parseFloat(maxValue.toFixed(1)), shape));

        maxValue = min;
      }
    }

    return rangeList;
  }

  /**
   * 차트별 시리즈 추가정보
   * - 반드시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertSeriesData(): BaseOption {

    const objData = this.data;
    // pivot cols, rows 초기화
    const rows: string[] = [];

    let columnLength = _.max(objData.columns)['length'];
    // series 초기화
    this.chartOption.series = [];

    // series 배열값
    _.each(objData.columns, (series) => {

      // 시리즈 설정
      const seriesData = series.map((column) => {

        const seriesName: string = column.name;

        // 각각의 데이터 이름
        const columnName: string = _.split(seriesName, CHART_STRING_DELIMITER)[1];

        // pivotInfo데이터의 rows 데이터 설정 (범례, 색상에서 사용)
        rows.push(columnName);

        // 시리즈 생성
        let resultSeries: Series;
        resultSeries = {
          type: SeriesType.BAR,
          name: ChartType.GAUGE.toString(),
          data: [{
            value: column.percentage,
            name: column.name,
            selected : false,
            itemStyle : optGen.ItemStyle.opacity1()
          }],
          uiData: column,
          originData: [],
          itemStyle: optGen.ItemStyle.auto(),
          label: optGen.LabelStyle.defaultLabelStyle(true, Position.INSIDE)
        };

        return resultSeries;
      });

      // series가 1개인경우 데이터의 100까지 기준보다 높게 기준점이 나오므로 시리즈 한개더 추가
      if (1 == columnLength) columnLength = 2;

      // series data 개수를 맞춰주어야 하므로 가장 긴 column 값에 length를 맞추기
      for (let index = 0; index < columnLength; index++) {

        // 해당 값이 없는경우
        let item = seriesData[index];
        // 값 init
        if (!item) {

          item = {
            type: SeriesType.BAR,
            name: ChartType.GAUGE.toString(),
            // uiData: {},
            data: [{
              value: 0,
              name: '',
              label: {
                normal: {
                  formatter: ''
                }
              }
            }],
            originData: [],
            itemStyle: optGen.ItemStyle.auto(),
            label: optGen.LabelStyle.defaultLabelStyle(true, Position.INSIDE)
          };
        }

        // 기존에 series값이 있는경우
        if (this.chartOption.series[index]) {

          let singleSeries = this.chartOption.series[index];

          // 데이터 설정
          this.chartOption.series[index].data = singleSeries.data.concat(item.data);

          // origin 데이터 설정
          this.chartOption.series[index].originData = _.cloneDeep(singleSeries.data);

          // 명칭 설정
          this.chartOption.series[index].name = singleSeries.name + CHART_STRING_DELIMITER + item.name;

          // 기존 series값이 없는경우
        } else {

          // series column의 데이터 위치에 맞게 data length 설정
          if (index > 0 && this.chartOption.series[0].data.length > item.data.length) {

            const lengthDiff = this.chartOption.series[0].data.length - item.data.length;

            for (let num = 0; num < lengthDiff; num++) {
              item.data.splice(0, 0, ({value: 0}));
            }
          }

          // originData에 설정
          item.originData = _.cloneDeep(item.data);
          this.chartOption.series.push(item);
        }

        this.chartOption.series[index].data.forEach((item, dataIndex) => {

          // uiData가 없는경우
          if (!item['uiData']) {
            item['uiData'] = _.find(objData.columns[dataIndex], {'name': item.name});
          }
        });
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

    // Base Call
    this.chartOption = super.convertSeries();

    // Gradient Color Change
    if (_.eq(this.uiOption.color.type, ChartColorType.MEASURE) && this.uiOption.color['customMode'] && ColorCustomMode.GRADIENT == this.uiOption.color['customMode']) {

      _.each(this.data.columns, (column, columnIndex) => {

        // Series Total Value
        let totalValue: number = column.categoryValue;

        _.each(this.chartOption.series, (series) => {

          let data = series.data[columnIndex];

          // Validate
          if (!this.uiOption.color['ranges']) {
            return false;
          }

          // Base Data
          let value: number = null;
          if (data && isNaN(data)) {
            value = data.value;
          } else {
            value = data;
          }

          let maxValue: number = this.data.info.maxValue;
          let rangePercent: number = (maxValue / totalValue) * 100;
          let codes: string[] = _.cloneDeep(this.chartOption.visualMap.color).reverse();
          let index: number = Math.round(value / rangePercent * codes.length);
          index = index == codes.length ? codes.length - 1 : index;
          series.data[columnIndex].itemStyle = {
            normal: {
              color: codes[index]
            }
          };
        });
      });

      delete this.chartOption.visualMap;
    }
    // Default Color Change
    else if (_.eq(this.uiOption.color.type, ChartColorType.MEASURE)) {

      _.each(this.data.columns, (column, columnIndex) => {

        // Series Total Value
        let totalValue: number = column.categoryValue;

        _.each(this.chartOption.series, (series) => {

          let data = series.data[columnIndex];

          // Validate
          if (!this.uiOption.color['ranges']) {
            return false;
          }

          // Base Data
          let value: number = null;
          if (data && isNaN(data)) {
            value = data.value;
          } else {
            value = data;
          }

          let originalValue: number = totalValue * (value / 100);
          let ranges = _.cloneDeep((<UIChartColorByValue>this.uiOption.color).ranges);
          let index: number = 0;
          _.each(this.uiOption.color['ranges'], (range, rangeIndex) => {
            let min: number = range.fixMin != null ? range.fixMin : 0;
            let max: number = range.fixMax != null ? range.fixMax : min;
            if (originalValue >= min && originalValue <= max) {
              index = Number(rangeIndex);
              return false;
            }
          });
          series.data[columnIndex].itemStyle = {
            normal: {
              color: ranges[index].color
            }
          };
        });
      });

      delete this.chartOption.visualMap;
    }


    return this.chartOption;
  }

  /**
   * 셀렉션 이벤트를 등록한다.
   * - 필요시 각 차트에서 Override
   */
  protected selection(): void {
    this.addChartSelectEventListener();
  }

  /**
   * 게이지차트의 series값으로 설정되는 부분
   */
  protected additionalSeries(): BaseOption {

    // 라벨 방향 설정
    this.chartOption = this.convertLabelRotate();

    this.chartOption = this.convertGaugeFormatSeries(this.chartOption, this.uiOption);

    return this.chartOption;
  }

  /**
   * 게이지차트의 legend 설정
   */
  protected additionalLegend(): BaseOption {

    // dimension일때 게이지차트 색상 설정
    const series = this.chartOption.series;
    const legendData = this.chartOption.legend.data;

    let schema = this.uiOption.color['schema'];
    let list = <any>_.cloneDeep(ChartColorList[schema]);

    // userCodes가 있는경우 codes대신 userCodes를 설정한다
    if ((<UIChartColorByDimension>this.uiOption.color).mapping) {
      Object.keys((<UIChartColorByDimension>this.uiOption.color).mapping).forEach((key, index) => {

        const mappingValue = (<UIChartColorByDimension>this.uiOption.color).mapping[key];
        if (mappingValue) list[index] = (<UIChartColorByDimension>this.uiOption.color).mapping[key];
      });
    }

    if (ChartColorType.DIMENSION === this.uiOption.color.type) {
      _.each(series, (obj) => {

        obj.itemStyle.normal.color = ((params: any) => {

          let name: string;

          // 이름을 data의 name으로 변경
          name = _.split(params.data.name, CHART_STRING_DELIMITER)[1];
          let colorIdx = _.indexOf(legendData, name);
          colorIdx = colorIdx >= list.length ? colorIdx % list.length : colorIdx;
          return list[colorIdx];
        })
      });
    }

    return this.chartOption;
  }

  /**
   * 게이지차트의 tooltip 설정
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

    if (_.isUndefined(this.chartOption.tooltip)) {
      this.chartOption.tooltip = {};
    }
    this.chartOption.tooltip.formatter = ((params): any => {

      let option = this.chartOption.series[params.seriesIndex];

      let uiData = _.cloneDeep(option.data[params.dataIndex]['uiData']);
      if (!uiData) uiData = _.cloneDeep(option['uiData']);

      return this.getFormatGaugeValueSeriesTooltip(params, format, this.uiOption, option, uiData);
    });

    return this.chartOption;
  }

  /**
   * 차트의 기본 옵션을 생성한다.
   * - 각 차트에서 Override
   */
  protected initOption(): BaseOption {
    return {
      type: ChartType.GAUGE,
      grid: [OptionGenerator.Grid.verticalMode(17, 10, 0, 10, false, false, false)],
      xAxis: [OptionGenerator.Axis.valueAxis(Position.MIDDLE, null, false, false, true, true, true)],
      yAxis: [OptionGenerator.Axis.categoryAxis(Position.MIDDLE, null, true, true, true, true)],
      legend: OptionGenerator.Legend.custom(false, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
      tooltip: OptionGenerator.Tooltip.itemTooltip(),
      toolbox: OptionGenerator.Toolbox.hiddenToolbox(),
      brush: OptionGenerator.Brush.selectBrush(),
      series: []
    };
  }

  /**
   * uiData에 설정될 columns데이터 설정
   */
  protected setUIData(): any {

    // rows 축의 개수만큼 넣어줌
    _.each(this.data.columns, (data) => {

      data.categoryValue = 0;
      data.categoryPercent = 0;

      // category의 합을 설정
      for (const item of data) {
        data.categoryPercent += item.percentage;
        data.categoryValue += item.value;
      }

      data.categoryPercent = _.cloneDeep(Math.round(data.categoryPercent));
      data.categoryValue = _.cloneDeep(Math.round(data.categoryValue));

      // 해당 property에 값 설정
      for (const item of data) {
        item['categoryPercent'] = _.cloneDeep(Math.round(data.categoryPercent));
        item['categoryValue'] = _.cloneDeep(Math.round(data.categoryValue));
      }
    });

    return this.data.columns;
  }

  /**
   * setMapping값에서 설정 x, gaugeSetMapping에서 따로설정
   * @returns {UIChartColor}
   */
  protected setMapping(): UIChartColor {
    return this.uiOption.color;
  }

  /**
   * dataLabel, tooltip 중첩에 따라서 설정
   * @returns {UIOption}
   */
  protected setDataLabel(): UIOption {

    if (!this.pivot || !this.pivot.rows) return this.uiOption;

    const spliceCategoryTypeList = ((categoryTypeList, dataLabel: any): any => {

      // 미리보기 리스트가 빈값인지 체크
      const previewFl = !!dataLabel.previewList;

      let index: number;

      for (const item of categoryTypeList) {
        index = dataLabel.displayTypes.indexOf(item);

        if (-1 !== index) {
          // 라벨에서 제거
          dataLabel.displayTypes[index] = null;

          // previewList가 있는경우
          if (previewFl) {
            // 미리보기리스트에서 제거
            _.remove(dataLabel.previewList, {value: item});
          }
        }
      }

      return dataLabel;
    });

    // dimension이 1개일때에는 카테고리명 제거
    if (this.pivot.rows.length < 2) {

      const categoryTypeList = [UIChartDataLabelDisplayType.CATEGORY_NAME];

      // 데이터라벨에서 series관련 설정제거
      if (this.uiOption.dataLabel && this.uiOption.dataLabel.displayTypes) this.uiOption.dataLabel = spliceCategoryTypeList(categoryTypeList, this.uiOption.dataLabel);

      // 툴팁의 series관련 설정제거
      if (this.uiOption.toolTip && this.uiOption.toolTip.displayTypes) this.uiOption.toolTip = spliceCategoryTypeList(categoryTypeList, this.uiOption.toolTip);
    }

    return this.uiOption;
  }

  /**
   * 게이지차트의 그리드 정보를 변환
   * @returns {BaseOption}
   */
  protected additionalGrid(): BaseOption {

    // dataZoom이 없는축의 레이블표시가 off일때 잘리는 echart 에러 => grid값 늘려주기
    this.chartOption.grid.map((obj) => {

      // x축 레이블 표시가 false이면서 축제목이 true인 경우
      if (false == this.uiOption.xAxis.showLabel && true == this.uiOption.xAxis.showName) {
        obj.bottom = <any>(obj.bottom) + 20;
      }
    });

    return this.chartOption;
  }

  /**
   * 게이지차트의 x축 max값 설정
   * @returns {BaseOption}
   */
  protected additionalXAxis(): BaseOption {

    // x축값의 max를 100으로 설정하여 축이 100이상 나오지 않게 설정
    this.chartOption.xAxis.map((obj) => {
      obj.max = 100;
    });

    return this.chartOption;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * gauge차트의 color의 mapping, mappingArray값 설정
   */
  private gaugeSetMapping(gaugeDimensionList: string[]): UIChartColor {

    if (!this.uiOption.color) return;

    if (!(<UIChartColorByDimension>this.uiOption.color).mapping) (<UIChartColorByDimension>this.uiOption.color).mapping = {};

    // color mapping값이 있는경우
    if ((<UIChartColorByDimension>this.uiOption.color).schema) {

      // mapping값이 제거된경우 이후 색상값을 초기화
      let colorChangedFl: boolean = false;

      // fieldMeasureList에서 제거된 값 제거
      for (let key in (<UIChartColorByDimension>this.uiOption.color).mapping) {

        // const index = _.findIndex(gaugeDimensionList, key);
        const index = _.findIndex(gaugeDimensionList, (data) => {
          return data == key
        });

        // fieldMeasureList에서 없는 리스트이거나 이전의 값이 제거된경우 색상 초기화를 위해 제거
        if (-1 == index || colorChangedFl) {
          delete (<UIChartColorByDimension>this.uiOption.color).mapping[key];
          colorChangedFl = true;
        }
      }

      gaugeDimensionList.forEach((item, index) => {
        // 해당 alias값이 없을때에만 기본색상설정
        if ((<UIChartColorByDimension>this.uiOption.color).schema && !(<UIChartColorByDimension>this.uiOption.color).mapping[item]) {

          const colorListLength = ChartColorList[(<UIChartColorBySeries>this.uiOption.color).schema].length;
          // 색상리스트보다 gaugeDimensionList가 큰경우 색상 반복되게 설정
          const editIndex = index >= colorListLength ? index % colorListLength : index;
          (<UIChartColorByDimension>this.uiOption.color).mapping[item] = ChartColorList[(<UIChartColorByDimension>this.uiOption.color).schema][editIndex];
        }
      });

      // mapping map array로 변경
      (<UIChartColorByDimension>this.uiOption.color).mappingArray = [];

      Object.keys((<UIChartColorByDimension>this.uiOption.color).mapping).forEach((key) => {

        (<UIChartColorByDimension>this.uiOption.color).mappingArray.push({
          alias: key,
          color: (<UIChartColorByDimension>this.uiOption.color).mapping[key]
        });
      });
    }

    return this.uiOption.color;
  }

  /**
   * 게이지차트 series의 data label rotate 변경시
   * @returns {BaseOption}
   */
  private convertLabelRotate(): BaseOption {

    // 가로 / 세로에 따라서 rotate값 설정
    let rotate: number;
    if (!this.uiOption.dataLabel.enableRotation) {
      rotate = 0;
    } else if (this.uiOption.dataLabel.enableRotation) {
      rotate = 90;
    }

    const series = this.chartOption.series;

    // series의 label normal 값에 rotate 설정
    series.map((item) => {
      if (item.label && item.label.normal) item.label.normal.rotate = rotate;
    });

    return this.chartOption;
  }

  /**
   * 게이지 차트 데이터 형식으로 변경
   * @param {boolean} isKeepRange true일때 uiOption으로 인해서 변경된경우 데이터 설정을 바꾸지 않음
   * @returns {any}
   */
  private setGaugeChartData(isKeepRange?: boolean): any {

    // isKeepRange가 true인경우 (uiOption으로 인해서 변경된경우 데이터 설정을 바꾸지 않음
    if (isKeepRange) return this.data;

    const shelve = this.pivot;
    const data = this.data;

    // 해당 dimension의 리스트 가져오기
    const rowsList = shelve.rows.map((item) => {
      return item.alias
    });

    let value = [];
    let percentage = [];
    // 행선반에 올린 dimension개수만큼 데이터 설정
    const columnList = rowsList.map((rowData, rowIdx) => {

      // 행의 dimension 값가져오기
      let rowDuplicateList = data.rows.map((rowValue) => {

        return _.split(rowValue, CHART_STRING_DELIMITER)[rowIdx];
      });

      // 중복된값을 제거한 리스트 가져오기
      let uniqRows = _.uniq(rowDuplicateList);

      // dimension의 key, value값 가져오기
      let column = uniqRows.map((uniqRow) => {

        value = [];
        percentage = [];

        rowDuplicateList.forEach((item, index) => {

          // value값 리스트 설정
          value.push(uniqRow === item ? data.columns[0].value[index] : 0);

          // percent값 리스트 설정
          percentage.push(uniqRow === item ? data.columns[0].percentage[index] : 0);
        });

        let sumData = value.reduce((sum, current) => {
          return sum + current
        });

        let sumPercent = percentage.reduce((sum, current) => {
          return sum + current
        });
        sumData = Math.floor(sumData * 1000000) / 1000000;

        // column data 값 설정
        return {
          name: rowData + CHART_STRING_DELIMITER + uniqRow + CHART_STRING_DELIMITER + data.columns[0].name,
          value: sumData,
          percentage: sumPercent
        };
      });

      // set sort by first sort
      if (this.sorts && this.sorts.length > 0) {

        let sortFl: boolean = false;
        for (const sort of this.sorts) {
          _.sortBy(column, (item) => {

            // sort by dimension
            if (item.name.split(CHART_STRING_DELIMITER)[0] === sort.field) {
              column = _.sortBy(column, 'name');
              sortFl = true;
              // sort by measure
            } else if (item.name.split(CHART_STRING_DELIMITER)[2] === sort.field) {
              column = _.sortBy(column, 'value');
              sortFl = true;
            }
          });

          // when array is sorted, skip next sorts
          if (sortFl) {
            // asc, desc
            if (DIRECTION.DESC === sort.direction) column = column.sort().reverse();
            break;
          }
        }
      }
      return column;
    });

    // data에 해당 리스트 설정
    data.rows = rowsList;
    data.columns = columnList;

    return data;
  }

  /**
   * minValue값이 음수인경우 선반에서 measure값을 제거
   */
  private removeNegative(): void {

    if (this.data.info.minValue < 0) {

      // 선반에서 aggregation 측정값 제거
      this.changePivotData.emit({
        'shelveTypeList': [ShelveType.AGGREGATIONS],
        'shelveFieldTypeList': [String(ShelveFieldType.MEASURE), String(ShelveFieldType.CALCULATED)]
      });

      // show guide 이벤트 발생
      this.showGuide.emit();

      // Alert
      Alert.info(this.translateService.instant('msg.page.gauge.chart.negative.value'));

      return;
    }
  }

  /**
   * Tooltip: 포맷을 변경한다.
   * @param params
   * @param {UIOption} uiOption
   * @param {PivotTableInfo} fieldInfo
   * @param {Pivot} pivot
   * @returns {string}
   */
  private getFormatValueTooltip(params: any, uiOption: UIOption, fieldInfo: PivotTableInfo, pivot: Pivot): string {

    // Variable
    let format: UIChartFormat = uiOption.valueFormat;
    let colorType: ChartColorType = uiOption.color.type;
    let targetField: string = (<UIChartColorByDimension>uiOption.color).targetField;

    // 기준선 일때
    if (params.componentType === 'markLine') {
      return params.seriesName + '<br />' + params.data.value;
    } else if (params.componentType === 'series') {
      // 시리즈 일때
      // 툴팁에 표시할 생상 정보
      const colorEl = params.marker;
      // 툴팁에 표시할 범례명
      let legendName = '';
      // 데이터 천단위마다 콤마 표시
      // 데이터가 배열 형식이라면 가장 마지막 요소의 값을 변환
      if (_.isUndefined(params.value)) return '';
      let value = _.isArray(params.value) ? _.last(params.value) : params.value;
      if (_.isNull(value)) return;


      //////////////////////////////////////////////////
      // 공통포멧
      //////////////////////////////////////////////////
      if (format && format.isAll) {

        // 포맷 적용
        value = FormatOptionConverter.getFormatValue(value, format);
      }

      //////////////////////////////////////////////////
      // 포멧 정보가 없을경우
      //////////////////////////////////////////////////
      else {
        value = value.toLocaleString();
      }

      // 해당하는 데이터의 시리즈명
      let seriesName = '';

      // 게이지 차트의경우 시리즈 각각데이터별로 명칭이 다르므로 data name값으로 설정
      if (-1 < params.seriesName.indexOf(ChartType.GAUGE)) {
        seriesName = params.data.name;
      }

      // 첫번째 라인은 색상정보/범례명/수치 표현
      // 두번째 라인은 차원값/측정값 의 조합
      switch (colorType) {
        // color by dimension
        case ChartColorType.DIMENSION :
          // 어떤 선반에 몇번째 필드인지 확인
          let fieldIdx = _.indexOf(fieldInfo.cols, targetField);

          const nameArr = fieldIdx < 0
            ? _.split(params.seriesName, CHART_STRING_DELIMITER)
            : _.split(params.name, CHART_STRING_DELIMITER);
          if (fieldIdx < 0) fieldIdx = _.indexOf(fieldInfo.rows, targetField);

          // 해당하는 dimension 요소 이름
          legendName = nameArr[fieldIdx];
          break;
        // color by value
        case ChartColorType.MEASURE :
          // 범례상의 이름이 없기때문에 공백처리
          legendName = '';
          break;
      }

      // data의 data value, name이 있는경우 nameArr는 해당 데이터로 설정
      if (params && params.data.name && params.data.value) legendName = _.last(_.split(params.data.name, CHART_STRING_DELIMITER));

      // 범례값이 있는경우에만 : 값을 넣어주기
      if (legendName && '' !== legendName) value = ' : ' + value;

      return colorEl + legendName + value + '<br />' + seriesName;
    }
  }

  /**
   * Series: 포맷에 해당하는 옵션을 모두 적용한다.
   * @param chartOption
   * @param uiOption
   * @returns {BaseOption}
   */
  private convertGaugeFormatSeries(chartOption: BaseOption, uiOption: UIOption): BaseOption {

    ///////////////////////////
    // UI 옵션에서 값 추출
    ///////////////////////////

    let format: UIChartFormat = uiOption.valueFormat;
    if (_.isUndefined(format)) {
      return chartOption
    }

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
    _.each(series, (option) => {

      if (_.isUndefined(option.label)) {
        option.label = {normal: {}};
      }
      if (_.isUndefined(option.label.normal)) {
        option.label.normal = {}
      }

      // 적용
      option.label.normal.formatter = ((params): any => {

        let uiData = _.cloneDeep(option.data[params.dataIndex]['uiData']);
        if (!uiData) uiData = _.cloneDeep(option['uiData']);
        return this.getFormatGaugeValueSeries(params, format, uiOption, option, uiData);
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
  private getFormatGaugeValueSeries(params: any, format: UIChartFormat, uiOption?: UIOption, series?: any, uiData?: any): string {

    // UI 데이터 정보가 있을경우
    if (uiData) {

      if (!uiOption.dataLabel || !uiOption.dataLabel.displayTypes) return '';

      // UI 데이터 가공
      let isUiData: boolean = false;
      let result: string[] = [];
      if (this.pivot.rows.length > 1 && -1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_NAME)) {

        result.push(_.split(params.data.name, CHART_STRING_DELIMITER)[0]);
        isUiData = true;
      }
      if (-1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_VALUE)) {
        result.push(FormatOptionConverter.getFormatValue(uiData['categoryValue'], format));
        isUiData = true;
      }
      if (-1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_PERCENT)) {

        let value = uiData['categoryPercent'];
        value = Math.floor(Number(value) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal);
        result.push(value + '%');
        isUiData = true;
      }
      // 해당 dataIndex 데이터애로 뿌려줌
      if (-1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_NAME)) {

        result.push(_.split(params.data.name, CHART_STRING_DELIMITER)[1]);
        isUiData = true;
      }
      if (-1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE)) {

        result.push(FormatOptionConverter.getFormatValue(uiData.value, format));
        isUiData = true;
      }
      if (-1 !== uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT)) {
        let percentValue = Math.floor(Number(uiData.percentage) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal);
        result.push(percentValue + '%');
        isUiData = true;
      }

      let label: string = "";

      // UI 데이터기반 레이블 반환
      if (isUiData) {
        for (let num: number = 0; num < result.length; num++) {
          if (num > 0) {
            label += "\n";
          }
          if (series.label && series.label.normal && series.label.normal.rich) {
            label += '{align|' + result[num] + '}';
          } else {
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
   * 게이지차트의 포멧툴팁 설정
   * @param params
   * @param format
   * @param uiOption
   * @param series
   * @param uiData
   * @returns {any}
   */
  private getFormatGaugeValueSeriesTooltip(params: any, format: UIChartFormat, uiOption?: UIOption, series?: any, uiData?: any): string {

    // UI 데이터 정보가 있을경우
    if (uiData) {

      if (!uiOption.toolTip) uiOption.toolTip = {};
      if (!uiOption.toolTip.displayTypes) uiOption.toolTip.displayTypes = FormatOptionConverter.setDisplayTypes(uiOption.type);

      // UI 데이터 가공
      let result: string[] = [];

      if (this.pivot.rows.length > 1 && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_NAME)) {

        let categoryNameList = _.split(params.data.name, CHART_STRING_DELIMITER);
        result.push(categoryNameList[0]);
      }
      if (-1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_VALUE)) {

        let splitValue = _.split(params.data.name, CHART_STRING_DELIMITER);
        let name = splitValue[splitValue.length - 1];
        let categoryValue = FormatOptionConverter.getTooltipValue(name, this.pivot.aggregations, format, uiData['categoryValue']);

        // category percent가 있는경우
        if (-1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_PERCENT)) {
          let value = uiData['categoryPercent'];
          value = Math.floor(Number(value) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal);

          categoryValue += ' (' + value + '%)';
        }

        result.push(categoryValue);
      }
      if (-1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_PERCENT)) {

        // category value가 선택된지 않은경우
        if (-1 == uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.CATEGORY_VALUE)) {

          let splitValue = _.split(params.data.name, CHART_STRING_DELIMITER);
          let name = splitValue[splitValue.length - 1];

          let categoryValue = FormatOptionConverter.getTooltipValue(name, this.pivot.aggregations, format, uiData['categoryPercent']);

          categoryValue += '%';

          result.push(categoryValue);
        }
      }
      // 해당 dataIndex 데이터애로 뿌려줌
      if (-1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_NAME)) {

        let categoryNameList = _.split(params.data.name, CHART_STRING_DELIMITER);
        result.push(categoryNameList[0] + ' : ' + categoryNameList[1]);
      }
      if (-1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE)) {

        let splitValue = _.split(params.data.name, CHART_STRING_DELIMITER);
        let name = splitValue[splitValue.length - 1];
        let seriesValue = FormatOptionConverter.getTooltipValue(name, this.pivot.aggregations, format, uiData['value']);

        // series percent가 있는경우
        if (-1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT)) {
          let value = Math.floor(Number(uiData['percentage']) * (Math.pow(10, format.decimal))) / Math.pow(10, format.decimal);

          seriesValue += ' (' + value + '%)';
        }

        result.push(seriesValue);
      }
      if (-1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_PERCENT)) {

        // series value가 선택된지 않은경우
        if (-1 == uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.SERIES_VALUE)) {

          let splitValue = _.split(params.data.name, CHART_STRING_DELIMITER);
          let name = splitValue[splitValue.length - 1];
          let seriesValue = FormatOptionConverter.getTooltipValue(name, this.pivot.aggregations, format, uiData['value']);

          seriesValue += '%';

          result.push(seriesValue);
        }
      }

      return result.join('<br/>');
    }

    return this.getFormatValueTooltip(params, uiOption, this.fieldInfo, this.pivot);
  }
}
