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

import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {UIChartColorByValue, UIOption} from '../../common/component/chart/option/ui-option';
import {Pivot} from '../../domain/workbook/configurations/pivot';
import {
  AnnotationPosition,
  AxisLabelType,
  BarMarkType,
  CellColorTarget,
  ChartType,
  DataLabelPosition,
  EventType,
  FontSize,
  GridViewType,
  LabelLayoutType,
  LabelStyle,
  LineCornerType,
  LineMarkType,
  LineMode,
  LineStyle,
  PieSeriesViewType,
  PointShape, ShelveFieldType,
  SymbolType,
  UIChartDataLabelDisplayType,
  UIFontStyle,
  UIOrient,
  UIPosition,
  WaterfallBarColor,
} from '../../common/component/chart/option/define/common';
import {Modal} from '../../common/domain/modal';
import * as _ from 'lodash';
import {Alert} from '../../common/util/alert.util';
import {SelectComponent} from '../../common/component/select/select.component';
import {TimeUnit} from '../../domain/workbook/configurations/field/timestamp-field';
import {BaseOptionComponent} from './base-option.component';
import {UIBarChart} from '../../common/component/chart/option/ui-option/ui-bar-chart';
import {UILineChart} from '../../common/component/chart/option/ui-option/ui-line-chart';
import {Annotation, UIGridChart} from '../../common/component/chart/option/ui-option/ui-grid-chart';
import {
  UILabelAnnotation,
  UILabelChart,
  UILabelChartSeries,
  UILabelIcon,
  UILabelSecondaryIndicator
} from '../../common/component/chart/option/ui-option/ui-label-chart';
import {
  UIChartColorByCell,
  UIChartColorGradationByValue
} from '../../common/component/chart/option/ui-option/ui-color';
import {UIChartDataLabel} from '../../common/component/chart/option/ui-option/ui-datalabel';
import {ColorPickerComponent} from '../../common/component/color-picker/color.picker.component';
import {ColorPicker} from '../../common/component/color-picker/colorpicker';
import {BarColor, UIWaterfallChart} from '../../common/component/chart/option/ui-option/ui-waterfall-chart';
import {isNullOrUndefined} from "util";
import {OptionGenerator} from "../../common/component/chart/option/util/option-generator";
import {ChartUtil} from "../../common/component/chart/option/util/chart-util";
import {UIChartTooltip} from "../../common/component/chart/option/ui-option/ui-tooltip";

@Component({
  selector: 'common-option',
  templateUrl: './common-option.component.html'
})
export class CommonOptionComponent extends BaseOptionComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('iconTargetListComp')
  private iconTargetListComp: SelectComponent;

  @ViewChild('textTargetListComp')
  private textTargetListComp: SelectComponent;

  @ViewChildren('iconType')
  private iconTypeComp: QueryList<SelectComponent>;

  @ViewChild('direction')
  private directionComp: SelectComponent;

  // @ViewChild('period')
  // private periodComp: SelectComponent;

  // 본문 폰트 색상 color picker element
  @ViewChild('contentFontcolorPicker')
  private contentFontcolorPicker: ColorPickerComponent;

  // 헤더 폰트 색상 color picker element
  @ViewChild('fontColorPicker')
  private fontColorPicker: ColorPickerComponent;

  // 헤더 배경 색상 color picker element
  @ViewChild('backgroundColorPicker')
  private backgroundColorPicker: ColorPickerComponent;

  // color picker 리턴값
  private contentFontColorPickerEle: any;
  private fontColorPickerEle: any;
  private backgroundColorPickerEle: any;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public chartUtil = ChartUtil;

  @Input()
  public isChartTest: boolean;

  // 그리드 원본보기 불가
  public isNoOriginData: boolean;

  // Barchart - 병렬 / 중첩에 따라서 선반의 위치 변경 noti
  @Output()
  public changeAxisByStack: EventEmitter<BarMarkType> = new EventEmitter();

  // 확인팝업 띄우기
  @Output()
  public showConfirmPopup: EventEmitter<Modal> = new EventEmitter();

  // Pivot 정보
  public pivot: Pivot;
  public pivotTemp: Pivot;

  public limitPlaceHolder:number;

  // 차트정보
  @Input('uiOption')
  public set setUiOption(uiOption: UIOption) {

    // Set
    this.uiOption = uiOption;

    // limit값이 체크되고 size값이 없는경우 기본값 설정
    this._setLimit( uiOption.limit );
    this.limitPlaceHolder = OptionGenerator.defaultLimit( this.uiOption.type );

    // Pivot 설정
    if (_.isUndefined(this.pivot)) {
      this.setPivot = this.pivotTemp;
    }

    // 폰트크기 기본설정
    if (!this.uiOption.fontSize) this.uiOption.fontSize = FontSize.NORMAL;

    if (ChartType.GRID == this.uiOption.type) {
      // gridChart의 기본 colorTarget 설정
      if (!(<UIChartColorByCell>uiOption.color).colorTarget) (<UIChartColorByCell>uiOption.color).colorTarget = CellColorTarget.TEXT;

      this.changeDetect.detectChanges();
      // 헤더 폰트 색상
      this.fontColorPickerEle = this.initColorPicker(this.fontColorPickerEle, this.fontColorPicker, (<UIGridChart>this.uiOption).headerStyle.fontColor);
      // 헤더 배경 색상
      this.backgroundColorPickerEle = this.initColorPicker(this.backgroundColorPickerEle, this.backgroundColorPicker, (<UIGridChart>this.uiOption).headerStyle.backgroundColor);
      // 본문의 폰트 색상 설정
      this.contentFontColorPickerEle = this.initColorPicker(this.contentFontColorPickerEle, this.contentFontcolorPicker, (<UIGridChart>this.uiOption).contentStyle.fontColor);
    }

  }

  // Pivot 정보
  @Input('pivot')
  public set setPivot(pivot: Pivot) {

    // Pivot 정보가 없다면 중단
    if (_.isUndefined(pivot)) {
      return;
    }

    // UI Option이 없다면 중단
    if (_.isUndefined(this.uiOption)) {
      this.pivotTemp = pivot;
      return;
    }

    // Set
    this.pivot = pivot;

    if (ChartType.GRID == this.uiOption.type) {
      // 교차선반에서 aggregated값 찾기
      this.isNoOriginData = false;
      for (const item of this.pivot.aggregations) {
        if (item.aggregated) {
          this.isNoOriginData = true;
          break;
        }
      }

      // isNoOriginData가 true일때 원본보기상태이면 피봇상태로 재설정
      if (this.isNoOriginData && GridViewType.MASTER == this.uiOption['dataType']) {
        let dataType = GridViewType.PIVOT;
        this.uiOption = <UIOption>_.extend({}, this.uiOption, {dataType});
        this.isNoOriginData = false;
        this.update();
      }
    }

    // KPI 차트 옵션추가
    if (this.uiOption.type == ChartType.LABEL) {

      const option: UILabelChart = <UILabelChart>this.uiOption;

      if (option.series) {

        const isIconAll: boolean = this.kpiIsIconAll();
        const isTextAll: boolean = this.kpiIsTextAll();
        this.kpiIconTargetList = [];
        this.kpiIconTargetList.push({name: this.translateService.instant('msg.comm.ui.list.all'), value: ''});
        let series: UILabelChartSeries[] = [];
        let icons: UILabelIcon[] = [];
        let annotations: UILabelAnnotation[] = [];
        let secondaryIndicators: UILabelSecondaryIndicator[] = [];

        const setFieldName = ((item, shelveFieldType?: ShelveFieldType): string => {
          // shelveFieldType이 있는경우 해당타입일때만 데이터 리턴
          if (!shelveFieldType || (shelveFieldType && item.type === shelveFieldType)) {
            let fieldName = !_.isEmpty(item.alias) ? item.alias : item.name;
            if (item['alias'] && item['alias'] !== item.name) {
              fieldName = item['alias'];
            } else {
              // aggregation type과 함께 alias 설정
              const alias: string = item['fieldAlias'] ? item['fieldAlias'] : ( item['logicalName'] ? item['logicalName'] : item['name'] );
              fieldName = item.aggregationType ? item.aggregationType + `(${alias})` : `${alias}`;
            }
            return fieldName;
          }
        });

        const aggs = this.pivot.aggregations.map((aggregation) => {
          return setFieldName(aggregation, ShelveFieldType.MEASURE);
        }).filter((item)=> {return typeof item !== 'undefined'});

        for (let num: number = 0; num < this.pivot.aggregations.length; num++) {

          //////////////////////////////////////////
          // 아이콘 타겟
          //////////////////////////////////////////
          const field: any = this.pivot.aggregations[num];
          let alias: string = field['alias'] ? field['alias'] : field['fieldAlias'] ? field['fieldAlias'] : field['name'];
          let displayName: any = aggs[num];
          if( field.aggregationType && field.aggregationType != "" ) {
            alias = field.aggregationType +"("+ alias +")";
          }

          /////////////////////
          // Pivot이 추가되었을때 처리
          /////////////////////

          //if( option.series.length <= num || option.series.length != this.pivot.aggregations.length ) {
          if (option.series.length <= num) {
            if (num > 0) {
              option.series[num] = {
                name: alias,
                displayName: displayName
              };
              option.icons[num] = {
                seriesName: alias,
                displayName: displayName,
                show: option.icons[0].show,
                iconType: option.icons[0].iconType
              };
              option.annotations[num] = {
                seriesName: alias,
                displayName: displayName,
                show: option.annotations[0].show,
                description: option.annotations[0].description
              };
              option.secondaryIndicators[num] = {
                seriesName: alias,
                displayName: displayName,
                show: option.secondaryIndicators[0].show,
                indicatorType: option.secondaryIndicators[0].indicatorType,
                rangeUnit: option.secondaryIndicators[0].rangeUnit,
                targetValue: option.secondaryIndicators[0].targetValue,
                mark: option.secondaryIndicators[0].mark,
                emphasized: option.secondaryIndicators[0].emphasized

              };
            }
            else {
              option.series[num] = {};
              option.icons[num] = {};
              option.annotations[num] = {};
              option.secondaryIndicators[num] = {};
            }
          }
          if (_.isUndefined(option.series[num].name)
            || _.isUndefined(option.icons[num].seriesName)
            || _.isUndefined(option.annotations[num].seriesName)
            || _.isUndefined(option.secondaryIndicators[num].seriesName)) {
            option.series[num].name = alias;
            option.series[num].displayName = displayName;
            option.icons[num].seriesName = alias;
            option.icons[num].displayName = displayName;
            option.annotations[num].seriesName = alias;
            option.annotations[num].displayName = displayName;
            option.secondaryIndicators[num].seriesName = alias;
            option.secondaryIndicators[num].displayName = displayName;
          }
          this.kpiIconTargetList.push({
            name: displayName,
            value: alias
          });

          /////////////////////
          // Pivot의 순서가 변경되었을때 처리
          /////////////////////

          let isPush: boolean = false;
          for (let num2: number = 0; num2 < this.pivot.aggregations.length; num2++) {
            if (option.series.length >= (num2 + 1) && _.eq(alias, option.series[num2].name)) {
              isPush = true;
              series.push(option.series[num2]);
            }
            if (option.icons.length >= (num2 + 1) && _.eq(alias, option.icons[num2].seriesName)) {
              icons.push(option.icons[num2]);
            }
            if (option.annotations.length >= (num2 + 1) && _.eq(alias, option.annotations[num2].seriesName)) {
              annotations.push(option.annotations[num2]);
            }
            if (option.secondaryIndicators.length >= (num2 + 1) && _.eq(alias, option.secondaryIndicators[num2].seriesName)) {
              secondaryIndicators.push(option.secondaryIndicators[num2]);
            }
          }

          /////////////////////
          // Change alias process
          /////////////////////

          if (!isPush) {
            option.series[num].name = alias;
            option.series[num].displayName = displayName;
            option.icons[num].seriesName = alias;
            option.icons[num].displayName = displayName;
            option.annotations[num].seriesName = alias;
            option.annotations[num].displayName = displayName;
            option.secondaryIndicators[num].seriesName = alias;
            option.secondaryIndicators[num].displayName = displayName;

            for (let num2: number = 0; num2 < this.pivot.aggregations.length; num2++) {
              if (option.series.length >= (num2 + 1) && _.eq(alias, option.series[num2].name)) {
                series.push(option.series[num2]);
              }
              if (option.icons.length >= (num2 + 1) && _.eq(alias, option.icons[num2].seriesName)) {
                icons.push(option.icons[num2]);
              }
              if (option.annotations.length >= (num2 + 1) && _.eq(alias, option.annotations[num2].seriesName)) {
                annotations.push(option.annotations[num2]);
              }
              if (option.secondaryIndicators.length >= (num2 + 1) && _.eq(alias, option.secondaryIndicators[num2].seriesName)) {
                secondaryIndicators.push(option.secondaryIndicators[num2]);
              }
            }
          }
        }

        // 변경된 순서 반영
        option.series = series;
        option.icons = icons;
        option.annotations = annotations;
        option.secondaryIndicators = secondaryIndicators;

        this.changeDetect.detectChanges();
        if (!isIconAll) {
          //this.kpiIconTarget = this.kpiIconTargetList.length > 1 ? this.kpiIconTargetList[1] : this.kpiIconTargetList[0];
          this.iconTargetListComp.selected(this.kpiIconTargetList.length > 1 ? this.kpiIconTargetList[1] : this.kpiIconTargetList[0]);
        }
        if( isTextAll ) {
          if( option.annotations && 0 < option.annotations.length && option.annotations[0].show ) {
            this.kpiText = option.annotations[0].description;
          }
          else {
            this.kpiText = "";
          }
          this.kpiTextTemp = this.kpiText;
        } else {
          //this.kpiTextTarget = this.kpiIconTargetList.length > 1 ? this.kpiIconTargetList[1] : this.kpiIconTargetList[0];
          this.textTargetListComp.selected(this.kpiIconTargetList.length > 1 ? this.kpiIconTargetList[1] : this.kpiIconTargetList[0]);

          if (option.annotations[0].show) {
            this.kpiText = this.kpiIconTargetList.length > 1 ? option.annotations[0].description : "";
          }
          else {
            this.kpiText = "";
          }
          this.kpiTextTemp = this.kpiText;
        }
      }
    }
  }

  /**
   * 색상 component init
   * @param colorPickerEle
   * @param picker
   * @param fontColor
   * @returns {any}
   */
  private initColorPicker(colorPickerEle: any, picker: ColorPickerComponent, fontColor: string): any {

    // color picker element가 없는경우에만 초기화 설정
    if (!colorPickerEle) {
      const data: ColorPicker = new ColorPicker();
      data.color = fontColor;
      data.showAlpha = true;
      data.showInitial = true;
      data.showInput = true;
      data.showUserColor = true;
      colorPickerEle = picker.init(data);
    }

    return colorPickerEle;
  }

  // KPI: 아이콘 목록
  public kpiIconList: Object[] = [
    {name: this.translateService.instant('msg.page.li.icon.user'), value: 'USER'},
    {name: this.translateService.instant('msg.page.li.icon.visits'), value: 'HITS'},
    {name: this.translateService.instant('msg.page.li.icon.time'), value: 'TIME'},
    {name: this.translateService.instant('msg.page.li.icon.views'), value: 'VIEW'}
  ];

  // KPI: 추가 차트 표시 옵션
  public kpiDirectionList: Object[] = [
    {name: this.translateService.instant('msg.page.li.kpi.horizontal'), value: 'HORIZONTAL'},
    {name: this.translateService.instant('msg.page.li.kpi.vertical'), value: 'VERTICAL'}
  ];

  // KPI: 비교기간 목록
  public kpiPeriodList: Object[] = [
    {name: this.translateService.instant('msg.page.li.previous.year'), value: TimeUnit.YEAR},
    {name: this.translateService.instant('msg.page.li.previous.quarter'), value: TimeUnit.QUARTER},
    {name: this.translateService.instant('msg.page.li.previous.month'), value: TimeUnit.MONTH},
    {name: this.translateService.instant('msg.page.li.previous.day'), value: TimeUnit.DAY}
  ];

  // KPI: 아이콘/설명 관련
  public kpiIconTargetList: Object[] = [
    {name: this.translateService.instant('msg.comm.ui.list.all'), value: ''}
  ];
  public kpiIconTarget: Object = this.kpiIconTargetList[0];
  public kpiTextTarget: Object = this.kpiIconTargetList[0];
  public kpiText: string = "";
  public kpiTextTemp: string = "";

  // 기본 limit값
  public DEFAULT_LIMIT: number = 1000;

  // grid position 리스트
  public remarkPositionList: Object[] = [
    {name: this.translateService.instant('msg.page.common.grid.enter.position.top.right'), value: AnnotationPosition.TOP_RIGHT},
    {name: this.translateService.instant('msg.page.common.grid.enter.position.top.left'), value: AnnotationPosition.TOP_LEFT},
    {name: this.translateService.instant('msg.page.common.grid.enter.position.bottom.right'), value: AnnotationPosition.BOTTOM_RIGHT},
    {name: this.translateService.instant('msg.page.common.grid.enter.position.bottom.left'), value: AnnotationPosition.BOTTOM_LEFT}
  ];

  // grid 가로정렬 리스트
  public hAlignList: Object[] = [
    {name: this.translateService.instant('msg.page.chart.datalabel.text.align.default'), value: UIPosition.AUTO},
    {name: this.translateService.instant('msg.page.chart.datalabel.text.align.left'), value: UIPosition.LEFT},
    {name: this.translateService.instant('msg.page.chart.datalabel.text.align.center'), value: UIPosition.CENTER},
    {name: this.translateService.instant('msg.page.chart.datalabel.text.align.right'), value: UIPosition.RIGHT},
  ];
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
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Bar - 차트 표시방향
   *
   * @param type
   */
  protected barOrientType(type: UIOrient): void {

    let align = _.cloneDeep((<UIBarChart>this.uiOption).align);

    if (_.eq(align, type)) return;

    // 차트표시방향에 따라 dataLabel position값 설정
    let dataLabel = this.setDataLabelByOrient();

    // 가로형인경우 rotation 사용x
    if (UIOrient.HORIZONTAL == type) dataLabel.enableRotation = false;

    // chartZooms가 1개인경우 현재타입의 반대타입으로 dataZoom 타입 설정
    if (this.uiOption.chartZooms && this.uiOption.chartZooms.length == 1) {
      this.uiOption.chartZooms[0].orient = UIOrient.HORIZONTAL === type ? UIOrient.VERTICAL : UIOrient.HORIZONTAL;
    }

    align = type;

    const row = _.compact(_.concat(this.uiOption.xAxis, this.uiOption.yAxis, this.uiOption.secondaryAxis)).filter((axis) => {
      return _.eq(axis.mode, AxisLabelType.ROW);
    })[0];
    const subRow = _.compact(_.concat(this.uiOption.xAxis, this.uiOption.yAxis, this.uiOption.secondaryAxis)).filter((axis) => {
      return _.eq(axis.mode, AxisLabelType.SUBROW);
    })[0];
    const column = _.compact(_.concat(this.uiOption.xAxis, this.uiOption.yAxis, this.uiOption.secondaryAxis)).filter((axis) => {
      return _.eq(axis.mode, AxisLabelType.COLUMN);
    })[0];
    const subColumn = _.compact(_.concat(this.uiOption.xAxis, this.uiOption.yAxis, this.uiOption.secondaryAxis)).filter((axis) => {
      return _.eq(axis.mode, AxisLabelType.SUBCOLUMN);
    })[0];

    // xAxis
    let axis = _.cloneDeep(this.uiOption.xAxis);
    switch (axis.mode) {
      case AxisLabelType.ROW :
        axis.name = column.name;
        axis.defaultName = column.defaultName;
        axis.customName = column.customName;
        break;
      case AxisLabelType.SUBROW :
        axis.name = subColumn.name;
        axis.defaultName = subColumn.defaultName;
        axis.customName = subColumn.customName;
        break;
      case AxisLabelType.COLUMN :
        axis.name = row.name;
        axis.defaultName = row.defaultName;
        axis.customName = row.customName;
        break;
      case AxisLabelType.SUBCOLUMN :
        axis.name = subRow.name;
        axis.defaultName = subRow.defaultName;
        axis.customName = subRow.customName;
        break;
    }
    const xAxis = axis;

    // yAxis
    axis = _.cloneDeep(this.uiOption.yAxis);
    switch (axis.mode) {
      case AxisLabelType.ROW :
        axis.name = column.name;
        axis.defaultName = column.defaultName;
        axis.customName = column.customName;
        break;
      case AxisLabelType.SUBROW :
        axis.name = subColumn.name;
        axis.defaultName = subColumn.defaultName;
        axis.customName = subColumn.customName;
        break;
      case AxisLabelType.COLUMN :
        axis.name = row.name;
        axis.defaultName = row.defaultName;
        axis.customName = row.customName;
        break;
      case AxisLabelType.SUBCOLUMN :
        axis.name = subRow.name;
        axis.defaultName = subRow.defaultName;
        axis.customName = subRow.customName;
        break;
    }
    const yAxis = axis;

    const xAxisLabel = _.cloneDeep(xAxis.label);
    const yAxisLabel = _.cloneDeep(yAxis.label);

    // horizontal인경우
    if (UIOrient.HORIZONTAL == type) {

      // x축 value, y축 category 설정
      xAxis.label = yAxisLabel;
      yAxis.label = xAxisLabel;
      // vertical인 경우
    } else {

      // x축 category, y축 value 설정
      xAxis.label = yAxisLabel;
      yAxis.label = xAxisLabel;
    }

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {
      align: align,
      xAxis: xAxis,
      yAxis: yAxis,
      dataLabel: dataLabel
    });

    // subAxis
    if( this.uiOption.secondaryAxis ) {
      axis = _.cloneDeep(this.uiOption.secondaryAxis);
      switch (axis.mode) {
        case AxisLabelType.ROW :
          axis.name = column.name;
          axis.defaultName = column.defaultName;
          axis.customName = column.customName;
          break;
        case AxisLabelType.SUBROW :
          axis.name = subColumn.name;
          axis.defaultName = subColumn.defaultName;
          axis.customName = subColumn.customName;
          break;
        case AxisLabelType.COLUMN :
          axis.name = row.name;
          axis.defaultName = row.defaultName;
          axis.customName = row.customName;
          break;
        case AxisLabelType.SUBCOLUMN :
          axis.name = subRow.name;
          axis.defaultName = subRow.defaultName;
          axis.customName = subRow.customName;
          break;
      }
      this.uiOption = <UIOption>_.extend({}, this.uiOption, { secondaryAxis: axis });
    }

    this.update();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Bar - 차트 시리즈 표현 타입
   * @param seriesType
   */
  public barSeriesViewType(seriesType: BarMarkType): void {

    // ranges가 있는경우 병렬 / 중첩상태를 변경시
    if (seriesType !== (<UIBarChart>this.uiOption).mark &&
      (<UIChartColorByValue>this.uiOption.color).ranges && (<UIChartColorByValue>this.uiOption.color).ranges.length > 0) {

      const modal = new Modal();
      modal.name = this.translateService.instant('msg.page.chart.color.measure.range.grid.original.description');
      modal.data = {
        data: seriesType,
        eventType: EventType.SERIES_VIEW
      };

      // 확인팝업 띄우기
      this.showConfirmPopup.emit(modal);
      return;
    }

    this.changeBarSeriesViewType(seriesType);
  }

  /**
   * 바차트의 병렬 / 중첩 변경 메소드
   * @param mark
   */
  public changeBarSeriesViewType(mark: BarMarkType) {

    // 같은타입으로 재선택시 return (사용자 색상설정이 초기화되므로)
    if (this.uiOption['mark'] == mark) {
      return;
    }

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {mark});

    // 시리즈관련 리스트 제거
    const spliceSeriesTypeList = ((seriesTypeList, dataLabel: any): any => {

      if (!dataLabel) return dataLabel;

      let index: number;
      for (const item of seriesTypeList) {

        index = dataLabel.displayTypes.indexOf(item);
        if (-1 !== index) {
          dataLabel.displayTypes[index] = null;
          _.remove(dataLabel.previewList, {value: item});
        }
      }
      return dataLabel;
    });

    // 병렬형으로 변경시 데이터라벨, 툴팁의 SERIES관련설정은 제거
    if (this.uiOption.dataLabel && this.uiOption.dataLabel.displayTypes && BarMarkType.MULTIPLE == mark) {

      const seriesTypeList = [UIChartDataLabelDisplayType.SERIES_NAME, UIChartDataLabelDisplayType.SERIES_VALUE, UIChartDataLabelDisplayType.SERIES_PERCENT];

      // 데이터라벨 설정수정
      this.uiOption.dataLabel = spliceSeriesTypeList(seriesTypeList, this.uiOption.dataLabel);

      // 툴팁의 설정수정
      this.uiOption.toolTip = spliceSeriesTypeList(seriesTypeList, this.uiOption.toolTip);
    }

    // 병렬 / 중첩에 따라서 선반의 위치 변경 noti
    this.changeAxisByStack.emit(mark);

    this.update();
  }

  /**
   * Bar - 백분위수로 표현 여부
   *
   * @param replacePercentile
   * @constructor
   */
  // public barDataUnit(type: DataUnit): void {
  //   const series = _.cloneDeep(this.uiOption.series);
  //   const label = _.cloneDeep(this.uiOption.label);
  //   label.convertType = undefined;
  //   series.convertType = SeriesConvertType.UNITTYPE;
  //   (<UIBarChartPresentation>series).unitType = type;
  //   this.uiOption = <UIOption>_.extend({}, this.uiOption, { label, series });
  //
  //   this.update({ replacePercentile: _.eq(type, DataUnit.PERCENT) });
  // }

  /**
   * Line - 라인/영역 표현
   *
   * @param {LineMarkType} mark
   */
  public lineSeriesViewType(mark: LineMarkType): void {

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {mark});
    this.update();
  }

  /**
   * Line - 직선/굴림 표현
   * @param curveStyle
   */
  public lineSeriesCornerType(curveStyle: LineCornerType): void {

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {curveStyle});
    this.update();
  }

  /**
   * Line - 라인 & 포인트 표시여부
   *
   * @param lineStyle
   */
  public showLine(lineStyle: LineStyle): void {

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {lineStyle});
    this.update();
  }

  /**
   * Line - 누적 데이터 표현 여부
   *
   * @param lineMode
   */
  public cumulativeMode(lineMode: LineMode): void {

    const uiLineMode = (<UILineChart>this.uiOption).lineMode;
    const ranges = (<UIChartColorByValue>this.uiOption.color).ranges;

    // 같은 타입일때 return (사용자 색상설정이 초기화되므로)
    if (_.eq(uiLineMode, lineMode)) {
      return;

      // ranges가 있으면서 기본 / 누적으로 변경시
    } else if (ranges && ranges.length > 0 && !_.eq(uiLineMode, lineMode)) {

      const modal = new Modal();
      modal.name = this.translateService.instant('msg.page.chart.color.measure.range.grid.original.description');
      modal.data = {
        data: lineMode,
        eventType: 'cumulativeMode'
      };

      // 확인팝업 띄우기
      this.showConfirmPopup.emit(modal);
      return;
    }

    this.changeCumulative(lineMode);
  }

  /**
   * line - 누적 데이터 변경시
   */
  public changeCumulative(lineMode: LineMode): void {

    (<UILineChart>this.uiOption).lineMode = lineMode;
    this.update({resultFormatOptions: {lineMode: lineMode}, type: 'cumulativeMode'});
  }

  /**
   * Grid - Color By Cell - Grid Chart Only
   */
  // private colorByCell(target: CellColorTarget): void {
  //   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
  //     color: {
  //       type: ChartColorType.CELL,
  //       mark: target,
  //       codes: GridCellColorList.LINE1
  //     }
  //   });
  //
  //   this.update();
  // }

  /**
   * Grid - 텍스트 정렬
   * @param hAlign
   * @param headerFl
   */
  public textAlign(hAlign: Object, headerFl: boolean): void {

    // 헤더일때
    if (headerFl) {

      const headerStyle = _.cloneDeep((<UIGridChart>this.uiOption).headerStyle);
      headerStyle.hAlign = hAlign['value'];
      this.uiOption = <UIOption>_.extend({}, this.uiOption, {headerStyle});

      // 본문일때
    } else {
      const contentStyle = _.cloneDeep((<UIGridChart>this.uiOption).contentStyle);
      contentStyle.hAlign = hAlign['value'];
      this.uiOption = <UIOption>_.extend({}, this.uiOption, {contentStyle});
    }

    this.update();
  }

  /**
   * Grid -  텍스트 세로 정렬
   * @param vAlign
   * @param headerFl
   */
  public textVAlign(vAlign: UIPosition, headerFl: boolean): void {

    // 헤더일때
    if (headerFl) {

      const headerStyle = _.cloneDeep((<UIGridChart>this.uiOption).headerStyle);
      headerStyle.vAlign = vAlign;
      this.uiOption = <UIOption>_.extend({}, this.uiOption, {headerStyle});
      // 본문일때
    } else {
      const contentStyle = _.cloneDeep((<UIGridChart>this.uiOption).contentStyle);
      contentStyle.vAlign = vAlign;
      this.uiOption = <UIOption>_.extend({}, this.uiOption, {contentStyle});
    }

    this.update();
  }

  /**
   * Grid -  Pivot / 원본 여부
   * @param gridType
   */
  public gridViewType(gridType: GridViewType): void {

    // 수식이 들어간 measure인 경우, 연산행이 true인경우 리턴
    if (this.isNoOriginData || this.uiOption['totalValueStyle']) return;

    // TODO 원본 데이터일때 가로보기 기능이 불가함
    // if (_.eq((<UIGridChart>this.uiOption).measureLayout, UIOrient.HORIZONTAL) && _.eq(gridType, GridViewType.MASTER)) {
    //   Alert.info(this.translateService.instant('msg.page.alert.original.view.error'));
    //   return;
    // }

    const dataType = (<UIGridChart>this.uiOption).dataType;
    const ranges = (<UIChartColorByValue>this.uiOption.color).ranges;

    // 피봇, 원본 타입이 변경되지 않은경우
    if (gridType == dataType) return;

    // 사용자 색상설정되고, 피봇 - 원본이 변경된경우
    if (ranges && ranges.length > 0 && gridType !== dataType) {

      const modal = new Modal();
      modal.name = this.translateService.instant('msg.page.chart.color.measure.range.grid.original.description');
      modal.data = {
        data: gridType,
        eventType: EventType.GRID_ORIGINAL
      };

      // 확인팝업 띄우기
      this.showConfirmPopup.emit(modal);
      return;
    }

    this.changeGridViewType(gridType);
  }

  /**
   * grid view type 변경시
   * @param dataType
   */
  public changeGridViewType(dataType: GridViewType) {

    // 원본보기인경우 show head column을 true로 설정
    if (GridViewType.MASTER) {
      (<UIGridChart>this.uiOption).measureLayout = UIOrient.VERTICAL;
      (<UIGridChart>this.uiOption).contentStyle = (<UIGridChart>this.uiOption).contentStyle ? (<UIGridChart>this.uiOption).contentStyle : {};
      (<UIGridChart>this.uiOption).contentStyle.showHeader = false;
    }

    this.uiOption['dataType'] = dataType;
    this.update({type: EventType.GRID_ORIGINAL});
  }

  /**
   * Grid -  layout
   *
   * @param {Orient} orient
   */
  public gridLayout(measureLayout: UIOrient): void {

    // TODO 원본 데이터일때 가로보기 기능이 불가함
    if (_.eq(measureLayout, UIOrient.HORIZONTAL) && _.eq((<UIGridChart>this.uiOption).dataType, GridViewType.MASTER)) {
      Alert.info(this.translateService.instant('msg.page.alert.original.view.error'));
      return;
    }

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {measureLayout});

    this.update();
  }

  /**
   * Scatter - 심볼 불투명/반투명
   * @param pointTransparency
   */
  public symbolFill(pointTransparency: number): void {
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {pointTransparency});

    this.update();
  }

  /**
   * Scatter - 심볼모양
   * @param pointShape
   */
  public symbolType(pointShape: PointShape): void {

    // ranges값이 있는경우
    if ((<UIChartColorByValue>this.uiOption.color).ranges && (<UIChartColorByValue>this.uiOption.color).ranges.length > 0) {

      // 선택된 symbol값으로 변경
      (<UIChartColorByValue>this.uiOption.color).ranges.forEach((item) => {
        item.symbol = SymbolType[String(pointShape)];
      })
    }
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {pointShape});

    this.update();
  }

  /**
   * Pie - 시리즈 표현
   * @param markType
   */
  public pieSeriesViewType(markType: PieSeriesViewType): void {

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {markType});
    this.update();
  }

  /**
   * Pie - maximum categories 설정
   */
  public changeMaximumCategores(maxCategory: number): void {

    if (maxCategory < 0) return;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {maxCategory});
    this.update();
  }

  /**
   * Combine - 시리즈 표현
   * @param chartType
   * @param markType
   */
  public combineSeriesViewType(chartType: string, markType: any): void {

    // bar series일때
    if (String(ChartType.BAR) === chartType) {

      this.uiOption = <UIOption>_.extend({}, this.uiOption, {barMarkType: markType});
      // line series일때
    } else {
      this.uiOption = <UIOption>_.extend({}, this.uiOption, {lineMarkType: markType});
    }

    this.update();
  }

  /**
   * radar - 시리즈 표현
   * @param mark
   */
  public radarSeriesViewType(mark: any): void {

    // const series = _.cloneDeep(this.uiOption.series);
    // series.convertType = SeriesConvertType.MARK;
    // (<UILineChartPresentation>series).mark = type;
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {mark});

    this.update();
  }

  //////////////////////////////////////////////////////////
  //                  신규 KPI
  //////////////////////////////////////////////////////////

  /**
   * KPI - 차트 유형: 가로/세로
   */
  public kpiChangeLayout(layout: LabelLayoutType): void {
    const option: UILabelChart = <UILabelChart>this.uiOption;
    option.layout = layout;
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {layout: option.layout});
    this.update();
  }

  /**
   * KPI - 차트 스타이: 라인/솔리드
   * @param style
   */
  public kpiChangeStyle(style: LabelStyle): void {
    const option: UILabelChart = <UILabelChart>this.uiOption;
    option.chartStyle = style;
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {chartStyle: option.chartStyle});
    this.update();
  }

  /**
   * KPI - Label 표시 여부
   *
   * @param show
   */
  public kpiShowLabel(idx: number, show: boolean): void {
    const option: UILabelChart = <UILabelChart>this.uiOption;
    option.showLabel = show;
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {showLabel: option.showLabel});
    this.update();
  }

  /**
   * KPI - 색상변경 사용여부
   */
  public kpiChangeColor(): void {

    const option: UILabelChart = <UILabelChart>this.uiOption;
    let isColor: boolean = !option.positiveNegativeColor;

    if (isColor) {
      option.positiveNegativeColor = {
        positiveColor: '#08b496',
        negativeColor: '#eb5f53'
      };
    }
    else {
      delete option.positiveNegativeColor;
    }
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {positiveNegativeColor: option.positiveNegativeColor});
    this.update();
  }

  /**
   * KPI - 색상변경: 양수
   * @param color
   */
  public kpiChangePositiveColor(color: string): void {
    const option: UILabelChart = <UILabelChart>this.uiOption;
    option.positiveNegativeColor.positiveColor = color;
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {positiveNegativeColor: option.positiveNegativeColor});
    this.update();
  }

  /**
   * KPI - 색상변경: 음수
   * @param color
   */
  public kpiChangeNegativeColor(color: string): void {
    const option: UILabelChart = <UILabelChart>this.uiOption;
    option.positiveNegativeColor.negativeColor = color;
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {positiveNegativeColor: option.positiveNegativeColor});
    this.update();
  }

  /**
   * KPI - 아이콘 사용여부
   */
  public kpiChangeIcon(): void {

    const option: UILabelChart = <UILabelChart>this.uiOption;
    let showIcon: boolean = !option.icons[0].show;
    _.each(option.icons, (series) => {
      series.show = showIcon;
    });
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {icons: option.icons});
    this.update();
  }

  /**
   * KPI - 아이콘 타입 변경
   * @param iconType
   */
  public kpiChangeIconType(iconType: string): void {

    const option: UILabelChart = <UILabelChart>this.uiOption;
    _.each(option.icons, (series) => {
      if (this.kpiIconTarget['value'] == '' || this.kpiIconTarget['value'] == series.seriesName) {
        series.show = true;
        series.iconType = iconType;
      }
    });
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {icons: option.icons});
    this.update();
  }

  /**
   * KPI - 아이콘 전체선택 여부
   * @returns {boolean}
   */
  public kpiIsIconAll(): boolean {
    const option: UILabelChart = <UILabelChart>this.uiOption;
    let iconType: string = "";
    let isAll: boolean = true;
    _.each(option.icons, (series) => {
      const labelSeries: UILabelIcon = (<UILabelIcon>series);
      if (!_.isUndefined(labelSeries.show)) {
        let seriesIconType: string = labelSeries.iconType;
        if (iconType == "") {
          iconType = seriesIconType;
        }
        else if (iconType != seriesIconType) {
          isAll = false;
        }
      }
    });
    return isAll;
  }

  /**
   * KPI - 아이콘 대상 Index
   */
  public kpiGetIconTargetIndex(): number {

    let isAll: boolean = this.kpiIsIconAll();
    return isAll ? 0 : 1;
  }

  /**
   * KPI - 아이콘 대상 변경
   */
  public kpiChangeIconTarget(target: Object): void {
    this.kpiIconTarget = target;
    if (this.kpiIconTarget['value'] == '') {
      const option: UILabelChart = <UILabelChart>this.uiOption;
      this.kpiChangeIconType(option.icons[0].iconType);
    }
  }

  /**
   * KPI - 아이콘 선택여부
   * @param iconType
   */
  public kpiGetIconSelected(iconType: string): boolean {

    const option: UILabelChart = <UILabelChart>this.uiOption;
    if (this.kpiIconTarget['value'] == '') {
      if (iconType == option.icons[0].iconType
        || (iconType == 'USER' && !option.icons[0].iconType)) {
        return true;
      }
      return false;
    }
    else {
      const labelSeries: UILabelIcon[] = (<UILabelIcon[]>option.icons);
      for (let num = 0; num < labelSeries.length; num++) {
        if (labelSeries[num].seriesName == this.kpiIconTarget['value']) {
          if (iconType == labelSeries[num].iconType
            || (iconType == 'USER' && !labelSeries[num].iconType)) {
            return true;
          }
          return false;
        }
      }
    }
  }

  /**
   * KPI - 설명 사용여부
   */
  public kpiChangeText(): void {

    const option: UILabelChart = <UILabelChart>this.uiOption;
    let show: boolean = !option.annotations[0].show;
    if (show) {
      this.kpiText = "";
      this.kpiTextTemp = this.kpiText;
    }
    _.each(option.annotations, (series) => {
      if (show) {
        series.description = "";
        series.show = true;
      }
      else {
        delete series.description;
        series.show = false;
      }
    });
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {annotations: option.annotations});
    this.update();
  }

  /**
   * KPI - 설명 전체선택 여부
   * @returns {boolean}
   */
  public kpiIsTextAll(): boolean {
    const option: UILabelChart = <UILabelChart>this.uiOption;
    let text: string;
    let isAll: boolean = true;
    _.each(option.annotations, (series) => {
      const labelSeries: UILabelAnnotation = (<UILabelAnnotation>series);
      if (!_.isUndefined(labelSeries.show)) {
        let seriesText: string = labelSeries.description;
        if (_.isUndefined(text)) {
          text = seriesText;
        }
        else if (!_.isUndefined(seriesText) && !_.eq(text, seriesText)) {
          isAll = false;
        }
      }
    });
    return isAll;
  }

  /**
   * KPI - 설명 전체선택 여부
   * @returns {boolean}
   */
  public kpiTextIndex(): number {
    const option: UILabelChart = <UILabelChart>this.uiOption;
    let text: string;
    let index: number = 0;
    _.each(option.annotations, (series, index) => {
      const labelSeries: UILabelAnnotation = (<UILabelAnnotation>series);
      if (!_.isUndefined(labelSeries.show)) {
        let seriesText: string = labelSeries.description;
        if (_.isUndefined(text)) {
          text = seriesText;
        }
        else if (!_.isUndefined(seriesText) && !_.eq(text, seriesText)) {
          index = index;
        }
      }
    });
    return index;
  }

  /**
   * KPI - 설명 대상 Index
   */
  public kpiGetTextTargetIndex(): number {

    // let isAll: boolean = this.kpiIsTextAll();
    // return isAll ? 0 : 1;
    return this.kpiTextIndex();
  }

  /**
   * KPI - 설명 대상 변경
   */
  public kpiChangeTextTarget(target: Object): void {
    const option: UILabelChart = <UILabelChart>this.uiOption;
    this.kpiTextTarget = target;
    if (this.kpiTextTarget['value'] == '') {
      this.kpiText = option.annotations[0].description ? option.annotations[0].description : "";
      this.kpiTextTemp = this.kpiText;
    }
    else {
      const labelSeries: UILabelAnnotation[] = (<UILabelAnnotation[]>option.annotations);
      for (let num = 0; num < labelSeries.length; num++) {
        if (labelSeries[num].seriesName == this.kpiTextTarget['value']) {
          this.kpiText = labelSeries[num].description ? labelSeries[num].description : "";
          this.kpiTextTemp = this.kpiText;
          break;
        }
      }
    }
    this.kpiApplyText();
  }

  /**
   * KPI - 설명 적용
   */
  public kpiApplyText(): void {

    this.kpiText = this.kpiTextTemp;
    const option: UILabelChart = <UILabelChart>this.uiOption;
    _.each(option.annotations, (series) => {
      if (this.kpiTextTarget['value'] == '' || this.kpiTextTarget['value'] == series.seriesName) {
        series.description = this.kpiText;
      }
    });
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {annotations: option.annotations});
    this.update();
  }

  //////////////////////////////////////////////////////////
  //                  //신규 KPI
  //////////////////////////////////////////////////////////

  /**
   * grid 측정값 컬럼 표시여부
   * @param show
   */
  public showValueColumn(show: boolean): void {

    (<UIGridChart>this.uiOption).contentStyle = (<UIGridChart>this.uiOption).contentStyle ? (<UIGridChart>this.uiOption).contentStyle : {};
    (<UIGridChart>this.uiOption).contentStyle.showHeader = show;
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {contentStyle: (<UIGridChart>this.uiOption).contentStyle});

    // 원본보기인경우 show value column false일때 alert 표시하고 off되지않게 설정
    // if (GridViewType.MASTER == (<UIGridChart>this.uiOption).dataType && (<UIGridChart>this.uiOption).dataType && !show) {
    //
    //   this.changeDetect.detectChanges();
    //
    //   Alert.info(this.translateService.instant('msg.page.alert.original.head.error'));
    //   (<UIGridChart>this.uiOption).contentStyle.showHeader = true;
    //   this.uiOption = <UIOption>_.extend({}, this.uiOption, { contentStyle: (<UIGridChart>this.uiOption).contentStyle });
    //   return;
    // }

    this.update();
  }

  /**
   * Limit 변경
   * @param {number} limit
   * @param {boolean} isLimitCheck
   */
  public onLimitChange(limit: number, isLimitCheck?:boolean): void {

    if( !isNullOrUndefined(isLimitCheck) ) {
      this.uiOption.limitCheck = isLimitCheck;
    }

    this.safelyDetectChanges();

    // limit값이 null인경우 limitCheck값 false로 설정
    if (_.isNull(limit)) this.uiOption.limitCheck = false;

    this._setLimit(limit);
    this.update({});
  }

  /**
   * Grid - 설명추가 버튼클릭시
   */
  public addAnnotation(): void {

    const uiOption = (<UIGridChart>this.uiOption);

    // annotation 최초설정시
    if (!uiOption.annotation) {

      uiOption.annotation = {};
      uiOption.annotation.pos = AnnotationPosition.TOP_RIGHT;
      uiOption.annotation.label = '';
      // annotation이 있을때
    } else {

      uiOption.annotation = null;
    }

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {annotation: uiOption.annotation});

    this.update();
  }

  /**
   * grid - 설명 라벨 설정시
   */
  public changeRemarkLabel(param: Annotation): void {

    if (!param.label || _.isEmpty(param.label)) return;

    const annotation = _.cloneDeep((<UIGridChart>this.uiOption).annotation);
    annotation.label = param.label;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {annotation: annotation});
    this.update();
  }

  /**
   * Grid - position값 변경시
   */
  public changePosition(position: any): void {

    const annotation = _.cloneDeep((<UIGridChart>this.uiOption).annotation);
    annotation.pos = position['value'];
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {annotation: annotation});
    this.update();
  }

  /**
   * remark positionList의 index 구하기
   * @returns {number}
   */
  public getPositionIndex(): number {

    return _.findIndex(this.remarkPositionList, (item) => {
      return item['value'] == this.uiOption['annotation']['pos']
    });
  }

  /**
   * 폰트사이즈 변경
   */
  public changeFontSize(fontSize: FontSize): void {

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {fontSize: fontSize});

    this.update();
  }

  /**
   * grid차트의 폰트사이즈 변경
   * @param fontSize 폰트 사이즈
   * @param headerFl 헤더여부
   */
  public gridChangeFontSize(fontSize: FontSize, headerFl: boolean): void {

    // 헤더의 폰트사이즈 변경시
    if (headerFl) {

      (<UIGridChart>this.uiOption).headerStyle.fontSize = fontSize;
      this.uiOption = <UIOption>_.extend({}, this.uiOption, {headerStyle: (<UIGridChart>this.uiOption).headerStyle});
      // 본문의 폰트사이즈 변경시
    } else {
      (<UIGridChart>this.uiOption).contentStyle.fontSize = fontSize;
      this.uiOption = <UIOption>_.extend({}, this.uiOption, {contentStyle: (<UIGridChart>this.uiOption).contentStyle});
    }

    this.update();
  }

  /**
   * Grid - Color By Measure - Grid Chart Only
   */
  public gridColorByMeasure(target: CellColorTarget): void {

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {
      color: {
        type: this.uiOption.color.type,
        colorTarget: target,
        schema: (<UIChartColorByCell>this.uiOption.color).schema,
        ranges: (<UIChartColorByValue>this.uiOption.color).ranges,
        visualGradations: (<UIChartColorGradationByValue>this.uiOption.color).visualGradations,
        customMode: (<UIChartColorByValue>this.uiOption.color).customMode
      }
    });

    this.update();
  }

  /**
   * grid - 폰트 스타일 변경시
   * @param fontStyle 폰트 스타일
   * @param headerFl 헤더인지 여부
   */
  public gridFontStyle(fontStyle: UIFontStyle, headerFl: boolean): void {

    // 헤더에 설정시
    if (headerFl) {
      let headerStyle = _.cloneDeep((<UIGridChart>this.uiOption).headerStyle);
      if (!headerStyle.fontStyles) headerStyle.fontStyles = [];

      // 없는경우 리스트에 추가
      if (-1 == headerStyle.fontStyles.indexOf(fontStyle)) {
        headerStyle.fontStyles.push(fontStyle);

        // 이미존재하는경우 리스트에서 제거
      } else {
        headerStyle.fontStyles.splice(headerStyle.fontStyles.indexOf(fontStyle), 1);
      }

      this.uiOption = <UIOption>_.extend({}, this.uiOption, {headerStyle: headerStyle});
      // 본문에 설정시
    } else {

      let contentStyle = _.cloneDeep((<UIGridChart>this.uiOption).contentStyle);

      if (!contentStyle.fontStyles) contentStyle.fontStyles = [];

      // 없는경우 리스트에 추가
      if (-1 == contentStyle.fontStyles.indexOf(fontStyle)) {
        contentStyle.fontStyles.push(fontStyle);

        // 이미존재하는경우 리스트에서 제거
      } else {
        contentStyle.fontStyles.splice(contentStyle.fontStyles.indexOf(fontStyle), 1);
      }

      this.uiOption = <UIOption>_.extend({}, this.uiOption, {contentStyle: contentStyle});
    }

    this.update();
  }

  /**
   * grid - 헤더 보이기 설정
   */
  public changeShowHeader(showHeader: boolean): void {

    let headerStyle = _.cloneDeep((<UIGridChart>this.uiOption).headerStyle);

    headerStyle.showHeader = showHeader;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {headerStyle: headerStyle});

    this.update();
  }

  /**
   * grid - 본문 폰트 색상 설정
   */
  public changeContentFontColor(fontColor: any): void {

    (<UIGridChart>this.uiOption).contentStyle.fontColor = fontColor;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {contentStyle: (<UIGridChart>this.uiOption).contentStyle});
    this.update();
  }

  /**
   * grid - 헤더 폰트 색상 설정
   * @param fontColor
   */
  public changeHeaderFontColor(fontColor: any): void {

    (<UIGridChart>this.uiOption).headerStyle.fontColor = fontColor;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {headerStyle: (<UIGridChart>this.uiOption).headerStyle});
    this.update();
  }

  /**
   * grid - 헤더 폰트 색상 설정
   * @param fontColor
   */
  public changeHeaderBackgroundColor(fontColor: any): void {

    (<UIGridChart>this.uiOption).headerStyle.backgroundColor = fontColor;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {headerStyle: (<UIGridChart>this.uiOption).headerStyle});
    this.update();
  }

  /**
   * waterfall - 색상 구분 show / hide 설정
   */
  public showWaterfallBarColor(): void {

    let barColor = (<UIWaterfallChart>this.uiOption).barColor;

    // barColor가 있는경우
    if (barColor) {

      barColor = null;
    } else {

      let color: BarColor = {};
      color.positive = WaterfallBarColor.POSITIVE.toString();
      color.negative = WaterfallBarColor.NEGATIVE.toString();

      barColor = color;
    }

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {barColor: barColor});
    this.update();
  }

  /**
   * waterfall - 양수 색상 변경시
   * @param color
   */
  public changeWaterfallPositiveColor(color: any): void {

    let barColor = (<UIWaterfallChart>this.uiOption).barColor;

    barColor.positive = color;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {barColor: barColor});
    this.update();
  }

  /**
   * waterfall - 음수 색상 변경시
   * @param color
   */
  public changeWaterfallNegativeColor(color: any): void {

    let barColor = (<UIWaterfallChart>this.uiOption).barColor;

    barColor.negative = color;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {barColor: barColor});
    this.update();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Limit 설정
   * @param limit
   * @private
   */
  private _setLimit( limit:number ) {
    // limit값이 체크되고 size값이 없는경우 기본값 설정
    if (this.uiOption.limitCheck) {
      this.uiOption.limit = ( limit ) ? limit : OptionGenerator.defaultLimit( this.uiOption.type );
    } else {
      this.uiOption.limit = undefined;
    }
    this.safelyDetectChanges();
  } // function - _setLimit

  /**
   * 차트표시방향에 따라 dataLabel position값 설정
   * @returns {UIChartDataLabel}
   */
  private setDataLabelByOrient(): UIChartDataLabel {

    this.uiOption.dataLabel.pos = DataLabelPosition.CENTER;

    return this.uiOption.dataLabel;
  }
}
