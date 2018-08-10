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
 * Created by Dolkkok on 2017. 7. 27..
 */

import {
  AfterContentInit, Component, ElementRef, EventEmitter, HostListener, Injector, Input, OnInit, Output,
  ViewChild
} from '@angular/core';
import { OptionGenerator } from '../../option/util/option-generator';
import {
  AxisLabelMark, SeriesType,
  AxisLabelType, ShelveFieldType, ShelveType, ChartMouseMode, BrushType, ChartType, EventType
} from '../../option/define/common';
import {
  UIChartColor, UIChartColorByValue, UIChartLegend, UIChartZoom,
  UIOption
} from '../../option/ui-option';
import { Series } from '../../option/define/series';
import * as diff from 'object-diff';
import * as _ from 'lodash';

import optGen = OptionGenerator;
import { DataZoomType, FilterMode } from '../../option/define/datazoom';
import { Pivot } from '../../../../../domain/workbook/configurations/pivot';
import { BaseChart, ChartSelectInfo } from '../../base-chart';
import { BarChartComponent } from '../bar-chart/bar-chart.component';
import { LineChartComponent } from '../line-chart/line-chart.component';
import { BaseOption } from '../../option/base-option';

declare let echarts: any;

@Component({
  selector: 'control-chart',
  templateUrl: 'control-chart.component.html'
})

export class ControlChartComponent extends BaseChart {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | View Child
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Histogram Bar 차트
  @ViewChild(BarChartComponent) protected barChart: BarChartComponent;

  // Time Line 차트
  @ViewChild(LineChartComponent) protected lineChart: LineChartComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 차트를 그리기 위한 기반 데이터
  protected data: any;

  // 저장 정보
  protected saveInfo: UIOption;

  // 선반, 차트 스펙 정보
  protected config: any;

  // 기능별 추가적으로 필요한 정보
  protected params: any;

  // UI 옵션 별 호출하는 함수 관리
  protected convertInfo: Object;

  // 변경된 UI 옵션을 UI로 전송
  @Output() protected uiOptionUpdated = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 애니메이션 또는 리사이즈시 딜레이가 필요한 경우가 있음
  @Input()
  public resizeDelay: number = 0;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 외부 UI 에서 관리하는 차트 옵션
  public uiOption: UIOption;

  // 외부 UI 연동 여부
  public useUIOption: boolean = true;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Getter & Setter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('resultData')
  set resultData(value: any) {

    // 데이터가 아예 없는경우 (차트 초기 로딩같은..)
    if( !value
      || !value.data ) {
      return;
    }

    // 서버 데이터가 비어있을 경우
    if( !(value.data instanceof Array)
      && ((!value.data.columns || !value.data.rows)
      || (value.data.columns.length == 0 && value.data.rows.length == 0))
      && ((!value.data.nodes || !value.data.links)
      || (value.data.nodes.length == 0 && value.data.links.length == 0)) ) {

      // No Data 이벤트 발생
      this.noData.emit();
      return;
    }
    // 서버 데이터가 비어있을 경우 => 네트워크 차트
    else if( value.data instanceof Array
      && value.data.length == 0 ) {

      // No Data 이벤트 발생
      this.noData.emit();
      return;
    }

    this.data = value.data;
    this.config = value.config;
    this.pivot = value.config.pivot;
    this.saveInfo = value.uiOption;
    if (value.hasOwnProperty('params')) {
      this.params = value.params;
    }

    // 초기화
    this.drawByType = null;
    // draw를 발생시킨 타입이 있는경우 설정
    if (value.hasOwnProperty('type')) {
      this.drawByType = value.type;
    }

    // uiOption값 설정
    this.setDataInfo();

    // 선반정보를 기반으로 차트를 구성하는 필드정보 설정
    this.setFieldInfo();

    // pivot 정보 설정
    this.setPivotInfo();

    if (this.lineChart.chart) {
      this.draw();
    }
  }

  @Input('uiOption')
  set setUIOption(value: UIOption) {

    this.lineChart.uiOption = value;

    if( this.chart && this.data ) {

      this.lineChart.draw(true);
    }
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

    return this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.TIMESTAMP) == 1
      && (this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) > 0 || this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED) > 0)
      && (this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.DIMENSION) == 0 && this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(shelve, ShelveType.COLUMNS, ShelveFieldType.CALCULATED) == 0)
      && (this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) == 0 && this.getFieldTypeCount(shelve, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP) == 0);
  }

  /**
   * 차트 Draw
   *
   * @param data
   */
  public draw(): void {

    if (this.isValid(this.config.pivot)) {
      // 히스토그램 차트 데이터 구성
      if (!this.barChart.chartOption) this.barChart.chartOption = optGen.BarChart.histogramBarChartOption();
      // 라인 차트 데이터 구성
      if (!this.lineChart.chartOption) this.lineChart.chartOption = optGen.LineChart.defaultLineChartOption();
      if (!this.barChart.uiOption) this.barChart.uiOption = optGen.BarChart.histogramBarChartUIOption();
      // UI 옵션이 존재 하지 않을 경우 기본 스펙으로 초기화
      if (!this.lineChart.uiOption) this.lineChart.uiOption = optGen.LineChart.defaultControlLineChartUIOption();

      // 컨트롤차트 형식 데이터로 변경
      this.setControlChartData();
    } else {
      // No Data 이벤트 발생
      this.noData.emit();
    }

  }

  /**
   * histogram 차트에 추가적으로 라인시리즈 적용
   *
   * @param uiOption
   */
  public histogramUpdate(event: any) {
    // histogram 차트에 라인 시리즈 추가
    let newSeries: Series;
    newSeries = _.cloneDeep(this.barChart.chartOption.series[0]);
    newSeries.type = SeriesType.LINE;

    this.barChart.chartOption.xAxis[0].name = '';
    // histogram 차트 툴팁 설정
    this.barChart.chartOption.tooltip.formatter = (params) => {

      return params.value + ' Counts';
    };

    // 바차트 가로모드일때 데이터 inverse true설정인거 false로 바꾸기
    if (this.barChart.chartOption.yAxis && this.barChart.chartOption.yAxis.length > 0) {
      this.barChart.chartOption.yAxis[0].inverse = false;
    }

    // 바차트의 라인옵션 설정추가
    this.barChart.chartOption.color = ['#CD0000', '#DAA520'];
    this.barChart.chartOption.series.push(newSeries);
    this.barChart.chartOption.grid[0] = optGen.Grid.verticalMode(10, null, 10, 10, this.lineChart.chartOption.legend.show, this.lineChart.chartOption.dataZoom[0].show, false);
    this.barChart.chartOption.grid[0].bottom = this.getLineChartGridBottom();
    delete this.barChart.chartOption.dataZoom;

    // 바차트에 해당 라인옵션 업데이트
    this.barChart.chart.setOption(this.barChart.chartOption, true, false);

    // 이벤트 해제
    this.barChart.chart.off('click');
  }

  /**
   * line 차트가 그려지면 변경된 UI 전송
   *
   * @param uiOption
   */
  public lineUpdate(uiOption) {

    this.uiOptionUpdated.emit(this.uiOption);
  }

  /**
   * 라인차트에서 이벤트 데이터 전송
   * @param data
   */
  public chartControlSelectInfo(data: ChartSelectInfo) {

    // 이벤트 데이터 전송
    // 컨트롤 차트일때에는 line차트가 viewchild이므로 control의 chart의 이벤트로 호출해서 control에서 chartSelectInfo호출
    this.chartSelectInfo.emit(data);
  }

  /**
   * 마우스 모드 및 멀티선택 모드시 브러쉬 형태 설정
   *
   * @param {ChartMouseMode} type
   * @param {BrushType} brushType
   */
  public convertMouseMode(type: ChartMouseMode, brushType?: BrushType): void {
    this.mouseMode = type;
    let start;
    let end;
    switch (type) {
      case ChartMouseMode.SINGLE :
        this.chart.unsetBrush();
        this.chart.unsetMultipleBrush();
        break;
      case ChartMouseMode.MULTI :
        this.brushType = brushType;
        this.chart.setBrush(brushType);
        this.chart.setMultipleBrush();
        break;
      case ChartMouseMode.DRAGZOOMIN :
        this.chart.toggleSelectZoom();
        break;
      case ChartMouseMode.ZOOMIN :
        this.lineChart.chart.getOption().dataZoom.map((dataZoom, idx) => {
          if (_.eq(dataZoom.type, DataZoomType.SLIDER)) {
            start = dataZoom.start + 10;
            start = start > 50 ? 50 : start;
            end = dataZoom.end - 10;
            end = end < 50 ? 50 : end;

            this.lineChart.chart.dispatchAction({
              start,
              end,
              type: 'dataZoom',
              dataZoomIndex: idx
            });
          }
        });
        break;
      case ChartMouseMode.ZOOMOUT :

        this.lineChart.chart.getOption().dataZoom.map((dataZoom, idx) => {
          if (_.eq(dataZoom.type, DataZoomType.SLIDER)) {
            start = dataZoom.start - 10;
            start = start < 0 ? 0 : start;
            end = dataZoom.end + 10;
            end = end > 100 ? 100 : end;
            this.lineChart.chart.dispatchAction({
              start,
              end,
              type: 'dataZoom',
              dataZoomIndex: idx
            });
          }
        });
        break;
      case ChartMouseMode.REVERT :
        const defaultZooms = this.lineChart.defaultZoomRange;
        this.lineChart.chart.getOption().dataZoom.map((dataZoom, idx) => {
          if (_.eq(dataZoom.type, DataZoomType.SLIDER)) {
            start = defaultZooms[idx].start || 0;
            end = defaultZooms[idx].end || 100;
            this.lineChart.chart.dispatchAction({
              start,
              end,
              type: 'dataZoom',
              dataZoomIndex: idx,
            });
          }
        });
        break;
      default:
        console.info(type);
    }
    this.mouseMode = type;
  }

  /**
   * control 차트 저장시 현재 미니맵 위치 정보
   */
  public saveDataZoomRange(): UIChartZoom[] {
    const resultList: UIChartZoom[] = [];
    if (!this.lineChart) {
      return;
    }
    if (!_.isEmpty(this.lineChart.chart._chartsViews)) {
      this.lineChart.chart.getOption().dataZoom.map((obj, idx) => {
        if (_.eq(obj.type, DataZoomType.SLIDER)) {
          resultList.push({
            auto: obj.show,
            start: obj.start,
            end: obj.end,
            startValue: obj.startValue,
            endValue: obj.endValue,
            orient: obj.orient.toUpperCase()
          });
        }
      });
    }

    return resultList;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차트 Resize
   *
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  protected onResize(event) {
    // 그리드스터에서 애니매이션이 있어서 딜레이가 필요...
    setTimeout(
      () => {
        this.barChart.chart.resize();
        this.lineChart.chart.resize();
      },
      this.resizeDelay);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컨트롤차트 형식 데이터로 변경
   *
   * @param data
   */
  private setControlChartData(): void {

    const data = this.data;

    let allData: number[];
    data.columns.map((column) => {
      allData = _.concat(allData, column.value);
    });
    // line 차트의 Y축을 6개 영역으로 나눔
    const min = data.info.minValue;
    const max = data.info.maxValue;
    const range = min >= 0 ? max : max + Math.abs(min);
    let unit = 10;
    let interval = range / 6;
    if (interval >= 100) {
      let idx: number = 3;
      while (idx < range.toFixed(0).length) {
        unit *= 10;
        idx += 1;
      }
      const axisMax = _.ceil(range / unit) * unit;
      interval = _.ceil((axisMax / 6) / 100) * 100;
    } else {
      interval = _.ceil(max / 6);
    }
    // 라인차트 속성 변경
    this.lineChart.chartOption.yAxis[0].interval = interval;
    this.lineChart.chartOption.yAxis[0].max = interval * 6;
    this.lineChart.chartOption.yAxis[0].splitNumber = 6;
    this.lineChart.chartOption.dataZoom[0].filterMode = FilterMode.EMPTY;

    // Y축 Interval 을 기반으로 histogram 데이터 생성
    let histogramData: number[];
    let compareData: number[];
    histogramData = [];
    compareData = [];
    while (histogramData.length < 6) {
      histogramData.push(0);
      compareData.push(interval * (compareData.length + 1));
    }
    for (const value of allData) {
      if (_.gt(compareData[0], value)) {
        histogramData[0] += 1;
      } else if (_.gt(compareData[1], value)) {
        histogramData[1] += 1;
      } else if (_.gt(compareData[2], value)) {
        histogramData[2] += 1;
      } else if (_.gt(compareData[3], value)) {
        histogramData[3] += 1;
      } else if (_.gt(compareData[4], value)) {
        histogramData[4] += 1;
      } else if (_.gt(compareData[5], value)) {
        histogramData[5] += 1;
      } else if (_.gt(compareData[6], value)) {
        histogramData[6] += 1;
      }
    }

    this.barChart.resultData = {
      data: { rows: compareData, columns: [{ name: '', value: histogramData }], info: data.info },
      config: this.config,
      params: this.params
    };

    // 라인차트의 resultData 설정
    this.lineChart.resultData = { data, config: this.config, params: this.params, uiOption: this.uiOption, type : this.drawByType };

    this.drawFinished.emit();
  }

  /**
   * line 차트 grid 영역 변경시마다 histogram grid 에 같은 높이 적용
   *
   * @returns {any}
   */
  private getLineChartGridBottom(): number {
    let bottom: number;
    bottom = 0;
    this.lineChart.chart._componentsViews.map((component) => {
      if (component.__model.mainType === 'grid') {
        bottom += component.__model.option.bottom;
      } else if (component.__model.mainType === 'xAxis') {
        if (this.lineChart.uiOption) {
          bottom += (component.__model.option.labelHeight * 0.75);
        }
      }
    });
    return bottom;
  }

}
