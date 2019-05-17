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

import { AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { BaseChart, ChartSelectInfo, PivotTableInfo } from '../base-chart';
import { BaseOption } from '../option/base-option';
import {
  CHART_STRING_DELIMITER,
  ChartColorList,
  ChartSelectMode,
  ChartType,
  GraphLayoutType,
  Position,
  SeriesType,
  ShelveFieldType,
  ShelveType,
  SymbolType,
  TriggerType,
  UIChartDataLabelDisplayType
} from '../option/define/common';
import { Pivot } from '../../../../domain/workbook/configurations/pivot';
import * as _ from 'lodash';
import { OptionGenerator } from '../option/util/option-generator';
import { Legend } from '../option/define/legend';
import { Field } from '../../../../domain/workbook/configurations/field/field';
import { FormatOptionConverter } from '../option/converter/format-option-converter';
import { ColorOptionConverter } from '../option/converter/color-option-converter';
import { UIChartColorByDimension, UIChartFormat, UIChartFormatItem, UIOption } from '../option/ui-option';
import { LegendOptionConverter } from '../option/converter/legend-option-converter';
import { LabelOptionConverter } from '../option/converter/label-option-converter';

declare let echarts: any;

@Component({
  selector: 'network-chart',
  template: '<div class="chartCanvas" style="width: 100%; height: 100%; display: block;"></div>'
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
          item.edgeLabel.normal.formatter = (params) => {
            return FormatOptionConverter.getFormatValue(params.data.value, this.uiOption.valueFormat);
          }
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
            formatter: (params) => {
              return FormatOptionConverter.getFormatValue(params.data.value, this.uiOption.valueFormat);
            }
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
      _.forEach(this.data.nodes, (item) => {

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
            columnField = _.find(this.pivot.columns, {'alias' : field});
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
   * add selection event
   */
  protected selection(): void {
    this.addChartSelectEventListener();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Chart Select(Click) Event Listener
   *
   */
  public addChartSelectEventListener(): void {
    this.chart.off('click');
    this.chart.on('click', (params) => {

      let selectMode: ChartSelectMode;
      let selectedColValues: string[];
      let selectedRowValues: string[];

      // current chart seires
      const series = this.chartOption.series;
      // when click empty space, clear dimmed style, remove filter
      if (this.isSelected && _.isNull(params)) {
        selectMode = ChartSelectMode.CLEAR;
        this.chartOption = this.selectionClear(this.chartOption);

        this.isSelected = false;
      } else if (params != null) {

        // parameter 정보를 기반으로 시리즈정보 설정
        const seriesIndex = params.seriesIndex;
        const dataIndex = params.dataIndex;
        const selectedData = series[seriesIndex].data[dataIndex];

        // check selected or not selected
        const isSelectMode = params.data['sourceField'] ? _.isUndefined(series[seriesIndex].links[dataIndex].lineStyle) : _.isUndefined(params.data.itemStyle);

        if (isSelectMode) {
          // set add style
          selectMode = ChartSelectMode.ADD;
          this.chartOption = this.selectionAdd(this.chartOption, params);
        } else {
          // set substract style
          selectMode = ChartSelectMode.SUBTRACT;
          this.chartOption = this.selectionSubstract(this.chartOption, params);
        }

        this.isSelected = isSelectMode;

        // get source, target matching params
        let sourceTarget = this.getSourceTarget(series[params.seriesIndex].data, params);

        // when it's link
        if (params.data['originalSource'] && params.data['originalTarget']) {

          const sourceLinkList = series[seriesIndex].links.filter((item) => {
            if (item.originalSource === sourceTarget['source'].name && item.linkCnt > 0) return item;
          });

          const targetLinkList = series[seriesIndex].links.filter((item) => {
            if (item.originalTarget === sourceTarget['target'].name && item.linkCnt > 0) return item;
          });

          const sourceCon = (undefined === sourceTarget['source'].selectCnt || 0 === sourceTarget['source'].selectCnt) && 0 == sourceLinkList.length;
          const targetCon = (undefined === sourceTarget['target'].selectCnt || 0 === sourceTarget['target'].selectCnt) && 0 == targetLinkList.length;

          if ((ChartSelectMode.SUBTRACT == selectMode && sourceCon) || ChartSelectMode.SUBTRACT !== selectMode) {

            selectedColValues = [params.data['originalSource']];
            // if fields are multiple, remove in multiple fields
            if (sourceTarget['target'].fields.length > 1 && !sourceTarget['target'].itemStyle) {
              if (undefined == selectedColValues) selectedColValues = [];
              selectedColValues.push(params.data['originalTarget']);
            }
          }
          if ((ChartSelectMode.SUBTRACT == selectMode && targetCon) || ChartSelectMode.SUBTRACT !== selectMode) {
            selectedRowValues = [params.data['originalTarget']];
            // if fields are multiple, remove in multiple fields
            if (sourceTarget['source'].fields.length > 1 && !sourceTarget['source'].itemStyle) {
              if (undefined == selectedColValues) selectedColValues = [];
              selectedColValues.push(params.data['originalSource']);
            }
          }

        // when it's node
        } else {

          if (!isNaN(selectedData.selectCnt)) {

            // source of link has target value, do not remove in filter
            const sourceLinkList = series[seriesIndex].links.filter((item) => {
              if (item.originalSource === params.data.originalName && item.linkCnt > 0) return item;
            });

            // target of link has target value, do not remove in filter
            const targetLinkList = series[seriesIndex].links.filter((item) => {
              if (item.originalTarget === params.data.originalName && item.linkCnt > 0) return item;
            });

            const colCondition = (ChartSelectMode.SUBTRACT == selectMode && selectedData.selectCnt == 0 && sourceLinkList.length == 0) || (ChartSelectMode.SUBTRACT !== selectMode);
            const rowCondition = (ChartSelectMode.SUBTRACT == selectMode && selectedData.selectCnt == 0 && targetLinkList.length == 0) || (ChartSelectMode.SUBTRACT !== selectMode);

            // when it's substract mode, only the last data is removed in filter
            const colMatchPivot = colCondition ? this.pivot.columns.filter((item) => {return -1 !== params.data.fields.indexOf(item.name)}) : [];
            selectedColValues = colMatchPivot.length > 0 ? [params.data.originalName] : [];

            const rowMatchPivot = rowCondition ? this.pivot.rows.filter((item) => {return -1 !== params.data.fields.indexOf(item.name)}) : [];
            selectedRowValues = rowMatchPivot.length > 0 ? [params.data.originalName] : [];
          }
        }

      } else {
        return;
      }

      // if choose itself, set externalFilters as false
      if (this.params.externalFilters) this.params.externalFilters = false;

      // set filter data
      const selectData = this.setSelectData(params, selectedColValues, selectedRowValues);

      this.isUpdateRedraw = true;
      // apply to chart
      this.networkFilterApply();

      // set selection event
      if (!this.isPage) {
        this.selection();
      }

      this.lastDrawSeries = _.cloneDeep(this.chartOption['series']);

      // emit event
      this.chartSelectInfo.emit(new ChartSelectInfo(selectMode, selectData, this.params));
    });
  }

  /**
   * when add selection filter
   * @param {BaseOption} option
   * @param params
   * @returns {BaseOption}
   */
  protected selectionAdd(option: BaseOption, params: any): BaseOption {

    const series = option.series;
    const selectedSeries = series[params.seriesIndex];

    // when it's link
    if (params.data['sourceField']) {

      // set series links (lineStyle)
      const seriesLink = selectedSeries.links[params.dataIndex];

      if (!seriesLink.lineStyle) seriesLink.lineStyle = {normal : {}};
      seriesLink.lineStyle.normal['opacity'] = 0.7;
      seriesLink.linkCnt = undefined == seriesLink.linkCnt ? 1 : seriesLink.linkCnt + 1;

      // set other values dimmed
      if (selectedSeries.lineStyle && selectedSeries.lineStyle.normal) selectedSeries.lineStyle.normal.opacity = 0.2;

      seriesLink.existSelectData = true;

      // set source, target style (itemStyle)
      const sourceTarget = this.getSourceTarget(selectedSeries.data, params);

      const source = sourceTarget['source'];
      const target = sourceTarget['target'];

      if (!source.itemStyle) source.itemStyle = {normal : {}};
      source.itemStyle.normal['opacity'] = 0.7;
      // set select count
      // source.selectCnt = undefined == source.selectCnt ? 1 : source.selectCnt + 1;

      if (!target.itemStyle) target.itemStyle = {normal : {}};
      target.itemStyle.normal['opacity'] = 0.7;
      // target.selectCnt = undefined == target.selectCnt ? 1 : target.selectCnt + 1;

      // set other values dimmed
      if (selectedSeries.itemStyle && selectedSeries.itemStyle.normal) selectedSeries.itemStyle.normal.opacity = 0.2;

    // when it's node
    } else {
      // set series data style (itemStyle)
      const seriesData = selectedSeries.data[params.dataIndex];

      if (!seriesData.itemStyle) seriesData.itemStyle = {normal : {}};
      seriesData.itemStyle.normal['opacity'] = 0.7;

      // set other values dimmed
      if (selectedSeries.itemStyle && selectedSeries.itemStyle.normal) selectedSeries.itemStyle.normal.opacity = 0.2;
      if (selectedSeries.lineStyle && selectedSeries.lineStyle.normal) selectedSeries.lineStyle.normal.opacity = 0.2;

      // set select count
      seriesData.selectCnt = undefined == seriesData.selectCnt ? 1 : seriesData.selectCnt + 1;
    }

    return option;
  }

  private getSourceTarget(data : any[], params: any) {

    const sourceIndex = _.findIndex(data, (item) => {
      return item.name === params.data.source;
    });

    // find target
    const targetIndex = _.findIndex(data, (item) => {
      return item.name === params.data.target;
    });

    return {source: data[sourceIndex], target : data[targetIndex]};
  }

  /**
   * clear all selection filter
   *
   * @param option
   * @returns {BaseOption}
   */
  protected selectionClear(option: BaseOption): BaseOption {

    const series = option.series;

    // init opacity
    series.map((obj) => {

      obj.data.map((item) => {
        delete item.itemStyle;
        delete item.selectCnt;
      });

      obj.links.map((item) => {
        delete item.itemStyle;
        delete item.existSelectData;
        delete item.linkCnt;
      });

      if (obj.lineStyle && obj.lineStyle.normal) obj.lineStyle.normal.opacity = 0.7;
      if (obj.itemStyle && obj.itemStyle.normal) obj.itemStyle.normal.opacity = 0.7;

    });
    return option;
  }

  /**
   * clear selected filter
   *
   * @param option
   * @param params
   * @returns {BaseOption}
   */
  protected selectionSubstract(option: BaseOption, params: any): BaseOption {

    // 현재 차트 시리즈 리스트
    const series = option.series;
    const selectedSeries = series[params.seriesIndex];
    const selectedData = selectedSeries.data[params.dataIndex];

    // when it's link
    if (params.data['sourceField']) {

      // set series link style(lineStyle)
      const link = selectedSeries.links[params.dataIndex];

      link.linkCnt -= 1;

      // set source, target style (itemStyle)
      let sourceTarget = this.getSourceTarget(selectedSeries.data, params);

      const source = sourceTarget['source'];
      const target = sourceTarget['target'];

      // when it's last selected value, init itemStyle
      if (0 === link.linkCnt) {
        delete link.lineStyle;

        const sourceLinkList = selectedSeries.links.filter((item) => {
          if ((item.originalSource === source.name || item.originalTarget === source.name) && item.linkCnt > 0) return item;
        });

        const targetLinkList = selectedSeries.links.filter((item) => {
          if ((item.originalSource === target.name || item.originalTarget === target.name) && item.linkCnt > 0) return item;
        });

        if ((undefined === source.selectCnt || 0 === source.selectCnt) && 0 == sourceLinkList.length) delete source.itemStyle;
        if ((undefined === target.selectCnt || 0 === target.selectCnt) && 0 == targetLinkList.length) delete target.itemStyle;
      }

      link.existSelectData = false;

      // when it's last data, init opacity
      let selectedList = selectedSeries.links.filter((item) => {
        return item.linkCnt && 0 !== item.linkCnt;
      });

      let selectedDataList = selectedSeries.data.filter((item) => {
        return item.selectCnt && 0 !== item.selectCnt;
      });

      if ((!selectedList || 0 == selectedList.length) && (!selectedDataList || 0 == selectedDataList.length)) {
        selectedSeries.lineStyle.normal['opacity'] = 0.7;
      }

    // when it's node
    } else {

      if (isNaN(selectedData.selectCnt - 1) || selectedData.selectCnt <= 0) return option;

      selectedData.selectCnt -= 1;

      const filterLink = selectedSeries.links.filter((item) => {
        if ((item.originalSource === selectedData.name || item.originalTarget === selectedData.name) && item.linkCnt) return item;
      });

      // clear dimmed value
      if (0 === selectedData.selectCnt && 0 === filterLink.length) {
        delete selectedData.itemStyle;
      }
    }

    // when it's last data, init opacity
    let selectedList = selectedSeries.data.filter((item) => {
      return item.selectCnt && 0 !== item.selectCnt;
    });

    // when it's last data, init opacity
    let selectedLinkList = selectedSeries.links.filter((item) => {
      return item.linkCnt && 0 !== item.linkCnt;
    });

    if (!selectedList || 0 == selectedList.length && (!selectedLinkList || 0 == selectedLinkList.length)) {
      selectedSeries.itemStyle.normal['opacity'] = 0.7;
      selectedSeries.lineStyle.normal['opacity'] = 0.7;
    }

    return option;
  }

  /**
   * apply network chart filter
   * @param {boolean} initFl
   */
  private networkFilterApply(initFl: boolean = true): void {

    // 초기화를 하는경우
    // externalFilters가 true인 경우 - 다른차트에서 selection필터를 설정시 적용되는 차트를 그리는경우 차트 초기화
    if ((this.isUpdateRedraw && initFl) || (this.params && this.params.externalFilters)) {
      // 차트 제거
      this.chart.dispose();

      // Chart Instance 생성
      this.chart = this.echarts.init(this.$element.find('.chartCanvas')[0], 'exntu');
    }

    // Apply!
    // chart.setOption(option, notMerge, lazyUpdate);
    this.chart.setOption(this.chartOption, true, false);
  }
}

