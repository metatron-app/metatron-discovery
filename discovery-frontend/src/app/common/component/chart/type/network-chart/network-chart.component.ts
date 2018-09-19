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
import {BaseChart, PivotTableInfo} from '../../base-chart';
import {BaseOption} from "../../option/base-option";
import {
  ChartType, SymbolType, ShelveType, ShelveFieldType, SeriesType, GraphLayoutType, TriggerType, ChartColorList,
  UIChartDataLabelDisplayType, CHART_STRING_DELIMITER
} from '../../option/define/common';
import {Position} from '../../option/define/common';
import {Pivot} from "../../../../../domain/workbook/configurations/pivot";
import * as _ from 'lodash';
import {OptionGenerator} from "../../option/util/option-generator";
import {Observable} from "rxjs";
import {Legend} from "../../option/define/legend";
import { Field } from '../../../../../domain/workbook/configurations/field/field';
import {FormatOptionConverter} from "../../option/converter/format-option-converter";
import {ColorOptionConverter} from "../../option/converter/color-option-converter";
import { UIChartColorByDimension, UIChartFormat, UIChartFormatItem, UIOption } from '../../option/ui-option';
import {LegendOptionConverter} from "../../option/converter/legend-option-converter";
import {LabelOptionConverter} from "../../option/converter/label-option-converter";

declare let echarts: any;

@Component({
  selector: 'network-chart',
  templateUrl: 'network-chart.component.html'
})
export class NetworkChartComponent extends BaseChart implements OnInit, OnDestroy, AfterViewInit {

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

    // // Window resize 이벤트 정의
    // const definedObservableWindowResizeEvent: () => any = () => {
    //
    //   // debounceTime 설정
    //   //  - 가장 최근에 방출되기 전에 방출 대기를 기다리는 데 소요되는 시간을 500 ms 로 설정
    //   const DUE_TIME_500_MS: number = 500;
    //
    //   // 차트 오브젝트가 존재하고 차트 오브젝트의 리사이즈 값이 True 인 경우
    //   const hasChartObjectAndChartObjectResizeOptionIsTrue: () => boolean = () => this.chart && this.chart.resize;
    //
    //   // Window resize event
    //   //  - 500 ms 안에 들어온 리사이즈 이벤트는 무시한다
    //   //  - 네트워크 차트에 경우 리사이즈 이벤트가 발생하면 네트워크 차트 초기화 함수를 호출한다
    //   return Observable
    //     .fromEvent(window, 'resize', () => {
    //       const htmlElement = document.documentElement;
    //       return `${htmlElement.clientWidth}x${htmlElement.clientHeight}`;
    //     })
    //     .debounceTime(DUE_TIME_500_MS)
    //     .filter(() => hasChartObjectAndChartObjectResizeOptionIsTrue())
    //     .subscribe(() => {
    //       console.info("resize observable");
    //       //this.draw()
    //     });
    // };
    //
    // // AbstractComponent class 에서 Subscription 목록을 가지고 있다가
    // // Destroy 하는 시점에 공통으로 해제 시켜주기떄문에
    // // subscriptions 목록에 추가해준다
    // this.subscriptions.push(
    //   definedObservableWindowResizeEvent()
    // );

    super.ngAfterViewInit();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차트에 설정된 옵션으로 차트를 그린다.
   * - 각 차트에서 Override
   * @param isKeepRange: 현재 스크롤 위치를 기억해야 할 경우
   */
  public draw(isKeepRange?: boolean): void {

    ////////////////////////////////////////////////////////
    // Valid 체크
    ////////////////////////////////////////////////////////

    if (!this.isValid(this.pivot)) {

      // No Data 이벤트 발생
      this.noData.emit();
      return;
    }

    ////////////////////////////////////////////////////////
    // Basic (Type, Title, etc..)
    ////////////////////////////////////////////////////////

    // 차트의 기본옵션을 생성한다.
    this.chartOption = this.initOption();

    ////////////////////////////////////////////////////////
    // series
    ////////////////////////////////////////////////////////

    // 차트 시리즈 정보를 변환
    this.chartOption = this.convertSeries();

    ////////////////////////////////////////////////////////
    // Legend
    ////////////////////////////////////////////////////////

    this.chartOption = this.convertLegend();

    ////////////////////////////////////////////////////////
    // 추가적인 옵션사항
    ////////////////////////////////////////////////////////

    this.chartOption = this.convertEtc();

    ////////////////////////////////////////////////////////
    // 셀렉션 필터 유지
    ////////////////////////////////////////////////////////

    //this.chartOption = this.convertSelectionData();

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

  /**
   * 선반정보를 기반으로 차트를 그릴수 있는지 여부를 체크
   * - 반드시 각 차트에서 Override
   */
  public isValid(pivot: Pivot): boolean {
    // TODO: 추후에 네트워크 차트의 선반정보 검사하는 부분을 수정할 예정
    //  - 현재는 최소 그리기 조건에 대한 처리만 되어 있음, 하지만 차트가 그려지지 않아서 오류로 생각하는 경우가 있어서 해당 조건을 원래대로 원복 시킨다
    //  - 최소 그리기 조건 : Source data, Target data, Link data 각각 1개씩인 경우
    const result = (this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.DIMENSION) == 1 && this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.TIMESTAMP) == 0)
      && (this.getFieldTypeCount(pivot, ShelveType.ROWS, ShelveFieldType.DIMENSION) == 1 && this.getFieldTypeCount(pivot, ShelveType.ROWS, ShelveFieldType.TIMESTAMP) == 0)
      && ((this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) + this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED)) == 1)
      && (this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.CALCULATED) == 0)
      && (this.getFieldTypeCount(pivot, ShelveType.ROWS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(pivot, ShelveType.ROWS, ShelveFieldType.CALCULATED) == 0)
      && (this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.DIMENSION) == 0 && this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.TIMESTAMP) == 0)
    return result;
  }

  /**
   * Chart Legend Select Event Listener
   */
  public addLegendSelectEventListener(): void {

    this.chart.off('legendselectchanged');

    this.chart.on('legendselectchanged', (params) => {

      const legend: Legend = this.chartOption.legend;
      legend.selected = params.selected;

      this.apply(false);
    });
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
      type: ChartType.NETWORK,
      legend: OptionGenerator.Legend.custom(false, false, Position.LEFT, SymbolType.CIRCLE, '100%', 20, 5),
      tooltip: OptionGenerator.Tooltip.itemTooltip(),
      series: []
    };
  }

  /**
   * 결과데이터를 기반으로 차트를 구성하는 피봇정보 설정
   * - 필요시 각 차트에서 Override
   */
  protected setPivotInfo(): void {

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
    this.chartOption = ColorOptionConverter.convertColor(this.chartOption, this.uiOption, this.fieldOriginInfo, this.fieldInfo, this.pivotInfo, this.drawByType);

    ////////////////////////////////////////////////////////
    // 숫자 포맷 옵션 적용
    ////////////////////////////////////////////////////////

    this.chartOption = FormatOptionConverter.convertFormatSeries(this.chartOption, this.uiOption, this.pivot);

    ////////////////////////////////////////////////////////
    // 데이터 레이블 옵션 적용
    ////////////////////////////////////////////////////////

    // 하위 호환을위해 Label정보 없이 저장된 데이터는 Show를 true로 변경해준다.
    if( !this.uiOption.dataLabel ) { this.uiOption.dataLabel = {showValue: true}; }
    if( _.eq(typeof this.uiOption.dataLabel.showValue, "undefined") ) { this.uiOption.dataLabel.showValue = true; }

    // 레이블 설정
    this.chartOption = LabelOptionConverter.convertLabel(this.chartOption, this.uiOption);

    ////////////////////////////////////////////////////////
    // 차트별 추가사항
    ////////////////////////////////////////////////////////

    // 차트별 추가사항 반영
    this.chartOption = this.additionalSeries();

    // 차트옵션 반환
    return this.chartOption;
  }

  /**
   * 네트워크차트 시리즈 추가정보
   */
  protected additionalSeries(): BaseOption {

    if (!this.uiOption.dataLabel || !this.uiOption.dataLabel.displayTypes) return this.chartOption;

    let showFl: boolean;

    // link value가 있는경우
    if (-1 !== this.uiOption.dataLabel.displayTypes.indexOf(UIChartDataLabelDisplayType.LINK_VALUE)) {

      showFl = true;
    // link value가 없는경우
    } else {
      showFl = false;
    }

    this.chartOption.series.forEach((item) => {

      if (item.edgeLabel && item.edgeLabel.normal) {

        if (showFl) {
          item.edgeLabel.normal.show = showFl;
          item.edgeLabel.normal.formatter = "{c}";
        } else {
          item.edgeLabel.normal.show = showFl;
          // show만 false로 설정시 source쪽에 숫자가 겹쳐서 나오므로 formatter에 빈값을 설정
          item.edgeLabel.normal.formatter = "";
        }

      }
    });

    return this.chartOption;
  }

  /**
   * 차트별 시리즈 추가정보
   * - 반드시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertSeriesData(): BaseOption {

    let sourceField: string = '';
    let sourceColorField: string = '';
    let sourceSizeField: string = '';

    let targetField: string = '';
    let targetColorField: string = '';
    let targetSizeField: string = '';
    const aggs: string[] = [];

    // Source data
    this.pivot.columns
      .map((column, idx) => {

        const fieldName: string = column.alias ? column.alias : column.fieldAlias ? column.fieldAlias : column.name;

        if (_.eq(idx, 0)) {
          sourceField = fieldName;
        }

        if (_.eq(idx, 1) && (_.eq(column.type, ShelveFieldType.DIMENSION) || _.eq(column.type, ShelveFieldType.TIMESTAMP))) {
          sourceColorField = fieldName;
        }
        else if (_.eq(idx, 1) && (_.eq(column.type, ShelveFieldType.MEASURE) || _.eq(column.type, ShelveFieldType.CALCULATED))) {
          sourceSizeField = fieldName;
        }

        aggs.push(fieldName);
      });

    // Target data
    this.pivot.rows
      .map((row, idx) => {

        const fieldName: string = row.alias ? row.alias : row.fieldAlias ? row.fieldAlias : row.name;

        if (_.eq(idx, 0)) {
          targetField = fieldName;
        }

        if (_.eq(idx, 1) && (_.eq(row.type, ShelveFieldType.DIMENSION) || _.eq(row.type, ShelveFieldType.TIMESTAMP))) {
          targetColorField = fieldName;
        }
        else if (_.eq(idx, 1) && (_.eq(row.type, ShelveFieldType.MEASURE) || _.eq(row.type, ShelveFieldType.CALCULATED))) {
          targetSizeField = fieldName;
        }
      });

    // link 수치 정보
    const agg: Field = this.pivot.aggregations[0];
    let linkField: string = agg.alias ? agg.alias : agg.fieldAlias ? agg.fieldAlias : agg.name;

    // Legend List
    let categories: string[] = [];
    const nodeNameList: string[] = [];
    _.each(this.data.nodes, (node) => {
      categories.push(node.originalName);
      nodeNameList.push(node.originalName);
      // categories.push(node.name);
      // nodeNameList.push(node.name);
    });

    const format: UIChartFormatItem = !this.uiOption.valueFormat.isAll && this.uiOption.valueFormat.each.length > 0 ? this.uiOption.valueFormat.each[0] : this.uiOption.valueFormat;

    this.chartOption.series = [
      {
        type: SeriesType.GRAPH,
        layout: GraphLayoutType.FORCE,
        roam: true,
        data: this.data.nodes,
        links: this.data.links,
        uiData: {nodeName: nodeNameList},
        symbolSize: _.isUndefined(linkField) ? undefined : 40,
        force: {
          layoutAnimation: false,
          repulsion: this.data.links.length < 70 ? 100 : this.data.links.length * 1.5,
          edgeLength: this.data.links.length < 50 ? 150 : 40,
          initLayout: 'circular'
        },
        focusNodeAdjacency: true,
        itemStyle: {
          normal: {
            opacity: 0.7
          }
        },
        lineStyle: {
          normal: {
            curveness: 0.3,
            width: 1,
            color: '#aaa',
            opacity: 0.7
          }
        },
        animationDuration: 1000,
        animationEasingUpdate: 'quinticInOut',
        edgeSymbol: ['none', 'arrow'],
        edgeLabel: {
          normal: {
            show: true,
            formatter: "{c}"
          }
        },
        tooltip: {
          trigger: TriggerType.ITEM,
          formatter: (params, ticket, callback) => {
            return this.getFormatNetworkValueSeriesTooltip(params, this.uiOption.valueFormat, this.uiOption);
          }
        }
      }
    ];

    const legend: Legend = this.chartOption.legend;
    const colorList: any = ChartColorList.SC1;
    this.chartOption.series[0].categories = categories
      .map((category, idx) => {

        const obj: any = {};
        obj.name = category;

        const colorIdx = idx >= colorList.length ? idx % colorList.length : idx;
        obj.itemStyle = {
          normal: {
            color: colorList[colorIdx]
          }
        };

        return obj;
      });

    legend.data = categories;
    legend.color = colorList;

    this.uiOption.fieldList = [sourceField];
    (<UIChartColorByDimension>this.uiOption.color).targetField = _.last(this.uiOption.fieldList);

    // Pivot 정보 생성
    this.pivotInfo = new PivotTableInfo(nodeNameList, [], aggs);

    return this.chartOption;
  }

  /**
   * sankey uiData에 설정될 columns데이터 설정
   */
  protected setUIData(): any {

    // 노드명 가공
    for (let node of this.data.nodes) {

      node.originalName = node.name;
      // if fields are multiple (have same name in different nodes), don't put field name
      node.name = node.name + (node.fields && node.fields.length == 1 ? CHART_STRING_DELIMITER + node.fields[0] : '');
    }

    // 링크명 가공
    for (let link of this.data.links) {

      link.originalSource = link.source;
      link.originalTarget = link.target;

      link.source = link.source + CHART_STRING_DELIMITER + link.sourceField;
      link.target = link.target + CHART_STRING_DELIMITER + link.targetField;

      // nodes의 fields값에서 sourceField이면서 name값과 source값이 같은경우
      _.find(this.data.nodes, (item) => {

        // set the source that exists in multiple fields
        if (item.fields.length > 1 && item.originalName === link.source.split(CHART_STRING_DELIMITER)[0]) {
          link.source = link.source.split(CHART_STRING_DELIMITER)[0];
        }

        // set the target that exists in multiple fields
        if (item.fields.length > 1 && item.originalName === link.target.split(CHART_STRING_DELIMITER)[0]) {
          link.target = link.target.split(CHART_STRING_DELIMITER)[0];
        }
      });
    }
  }

  protected convertLegend(): BaseOption {

    this.chartOption = LegendOptionConverter.convertLegend(this.chartOption, this.uiOption);
    return this.chartOption;
  }

  /**
   * network차트 tooltip 설정
   * @param params
   * @param format
   * @param uiOption
   * @param series
   * @param uiData
   * @returns {string}
   */
  private getFormatNetworkValueSeriesTooltip(params: any, format: UIChartFormat, uiOption?: UIOption, uiData?: any): string {

    if( params.data.value ) {
      // UI 데이터 정보가 있을경우
      if (!uiOption.toolTip) uiOption.toolTip = {};
      if (!uiOption.toolTip.displayTypes) uiOption.toolTip.displayTypes = FormatOptionConverter.setDisplayTypes(uiOption.type);

      // UI 데이터 가공
      let result: string[] = [];

      // set link tooltip
      if ( undefined !== params.data.target && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.NODE_NAME) ) {

        // 주체 노드
        result = FormatOptionConverter.getTooltipName([params.data.originalSource], this.pivot.columns, result, true, this.pivot);
        // 타겟 노드
        result = FormatOptionConverter.getTooltipName([params.data.originalTarget], this.pivot.rows, result, true, this.pivot);
      }
      // set node tooltip
      else if ( undefined == params.data.target && -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.NODE_NAME) ) {

        // set fields
        if (params.data.fields && params.data.fields.length > 0) {

          let columnField;
          for (const field of params.data.fields) {

            // find column value by field name
            columnField = _.find(this.pivot.columns, {'name' : field});
            result = FormatOptionConverter.getTooltipName([params.data.originalName], (!columnField ? this.pivot.rows : this.pivot.columns), result, true, this.pivot);
          }
        }
      }
      if ( -1 !== uiOption.toolTip.displayTypes.indexOf(UIChartDataLabelDisplayType.LINK_VALUE) ) {

        let value = FormatOptionConverter.getTooltipValue(this.pivot.aggregations[0].alias, this.pivot.aggregations, format, params.data.value);

        result.push(value);
      }

      return result.join('<br/>');
    }
  }

  /**
   * 차트에 옵션 반영
   * - Echart기반 차트가 아닐경우 Override 필요
   * @param initFl 차트 초기화 여부
   */
  protected apply(initFl: boolean = true): void {

    setTimeout(() => {
      super.apply(initFl)
    }, 500);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
