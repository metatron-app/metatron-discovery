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

import { AfterViewInit, Component, ElementRef, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { BaseChart, ChartSelectInfo } from '../base-chart';
import { BaseOption } from '../option/base-option';
import {
  CellColorTarget,
  CHART_STRING_DELIMITER,
  ChartColorType,
  ChartSelectMode,
  ColorCustomMode,
  FontSize,
  GridViewType,
  ShelveFieldType,
  ShelveType,
  UIOrient,
  UIPosition
} from '../option/define/common';
import { Pivot } from '../../../../domain/workbook/configurations/pivot';
import * as _ from 'lodash';
import { UIChartColorByCell, UIOption } from '../option/ui-option';
import { UIGridChart } from '../option/ui-option/ui-grid-chart';
import { UIChartColorGradationByCell } from '../option/ui-option/ui-color';

declare let pivot: any;

@Component({
  selector: 'grid-chart',
  template: '<div class="chartCanvas" style="width: 100%; height: 100%; display: block;"></div>'
})
export class GridChartComponent extends BaseChart implements OnInit, OnDestroy, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private gridModel: any;

  // 원본보기일때 원본보기 데이터
  private originData: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public viewMode: boolean = false;

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

    setTimeout(() => {
      this.isLoaded = true;
    });

    // Chart Instance 생성
    pivot.ui.style.summaryLabel = {
      SUM : this.translateService.instant('msg.page.calrow.label.operator.sum'),
      AVERAGE : this.translateService.instant('msg.page.calrow.label.operator.average'),
      MAX : this.translateService.instant('msg.page.calrow.label.operator.max'),
      MIN : this.translateService.instant('msg.page.calrow.label.operator.min'),
      COUNT : this.translateService.instant('msg.page.calrow.label.operator.count')
    };
    this.chart = new pivot.ui.pivot.Viewer(this.$element.find('.chartCanvas')[0]);

    // 초기에 주입된 데이터를 기준으로 차트를 표현한다.
    if( this.data ) {
      this.draw();
    }
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

    if( !this.isValid(this.pivot) ) {

      // No Data 이벤트 발생
      this.noData.emit();
      return;
    }

    ////////////////////////////////////////////////////////
    // Basic (Type, Title, etc..)
    ////////////////////////////////////////////////////////

    // 차트 기본설정 정보를 변환
    this.chartOption = this.convertBasic();

    ////////////////////////////////////////////////////////
    // series
    ////////////////////////////////////////////////////////

    // 차트 시리즈 정보를 변환
    this.chartOption = this.convertSeries();

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
  }

  /**
   * 선반정보를 기반으로 차트를 그릴수 있는지 여부를 체크
   * - 반드시 각 차트에서 Override
   */
  public isValid(pivot: Pivot): boolean {
    return ((this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.DIMENSION) > 0 || this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.TIMESTAMP) > 0)
      || (this.getFieldTypeCount(pivot, ShelveType.ROWS, ShelveFieldType.DIMENSION) > 0 || this.getFieldTypeCount(pivot, ShelveType.ROWS, ShelveFieldType.TIMESTAMP) > 0))
      && (this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) > 0 || this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED) > 0);
    // return ((this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.DIMENSION) + this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.TIMESTAMP)) > 0)
    //   && (this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.MEASURE) > 0 || this.getFieldTypeCount(pivot, ShelveType.AGGREGATIONS, ShelveFieldType.CALCULATED) > 0)
    //   && (this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(pivot, ShelveType.COLUMNS, ShelveFieldType.CALCULATED) == 0)
    //   && (this.getFieldTypeCount(pivot, ShelveType.ROWS, ShelveFieldType.MEASURE) == 0 && this.getFieldTypeCount(pivot, ShelveType.ROWS, ShelveFieldType.CALCULATED) == 0);
  }

  /**
   * Grid Select(Click) Event Listener
   *
   */
  public addGridSelectEventListener(params): void {

    const selectMode = params.isSelect ? ChartSelectMode.ADD : ChartSelectMode.SUBTRACT;
    const selectDataList = [];

    const pivot = $(this)[0]['shelve'];
    // pivot값이 없는경우 return
    if (!pivot || !pivot.columns) return;

    // 행, 열 선반 리스트
    const shelveList = _.cloneDeep(pivot.columns.concat(pivot.rows));

    // 부모데이터가 있는경우 (축을 클릭했을때)
    if (!_.isUndefined(params.parentData)) {
      // 헤더 클릭
      const data = _.cloneDeep(_.find(shelveList, {alias: params.key}));

      // 찾은 데이터가 없는경우 return
      if (!data) return;

      data['data'] = [params.data];

      // dataList에 추가
      selectDataList.push(data);

      // 부모 헤더가 존재 할 경우
      if (!_.isNull(params.parentData)) {
        // 부모 헤터의 선택정보 맵핑
        _.forEach(params.parentData, (value, key) => {
          // selectData[key] = [value];

          const data = _.cloneDeep(_.find(shelveList, {alias: key}));

          // 찾은 데이터가 없는경우 return
          if (!data) return;

          data['data'] = [value];

          // dataList에 추가
          selectDataList.push(data);
        });
      }
    // 부모데이터가 없는경우 (셀을 클릭했을때)
    } else {

      let dimensionList = _.concat(this['xProperties'], this['yProperties']);
      dimensionList = dimensionList.map((dimension) => {
        return dimension.name;
      });

      _.map(params, (item: string) => {

        const splitItem = _.split(item, CHART_STRING_DELIMITER);

        if (-1 !== _.indexOf(dimensionList, splitItem[0])) {
          const data = _.cloneDeep(_.find(shelveList, {alias: splitItem[0]}));

          data['data'] = [splitItem[1]];

          selectDataList.push(data);
        }
      });
    }

    // 이벤트 데이터 전송
    this['gridSelectInfo'].emit(new ChartSelectInfo(selectMode, selectDataList, this['customParams']));
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차트 기본설정 정보를 변환한다.
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertBasic(): BaseOption {

    if (!this.uiOption) return;

    this.uiOption.maxValue = this.data.info.maxValue;
    this.uiOption.minValue = this.data.info.minValue;

    // header, body 데이터가 없는경우 설정
    this.uiOption = this.setGridData();
    // if (this.uiOption.label) {
    //   // minValue가 0보다 작은경우 scaleDisabled true
    //   if (this.data.info.minValue < 0) {
    //     this.uiOption.label.scaleDisabled = true;
    //
    //     // 0이거나 0보다 큰경우
    //   } else {
    //
    //     this.uiOption.label.scaleDisabled = false;
    //   }
    // }

    // chartOption을 쓰지 않지만 override를 위해 반환
    return this.chartOption;
  }

  /**
   * 시리즈 정보를 변환한다.
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected convertSeries(): BaseOption {

    // min, max값 설정
    const minValue = this.data.info.minValue;
    const maxValue = this.data.info.maxValue;

    // X, Y, X
    let cols: any = this.fieldInfo.cols.map((name) => {
      return {name};
    });
    let rows: any = this.fieldInfo.rows.map((name) => {
      return {name};
    });
    let aggregations: any = this.fieldInfo.aggs.map((name) => {
      return {name, digits: 2};
    });

    // 원본보기데이터 초기화
    this.originData = [];

    // 원본 보기일경우 데이터 재가공
    if( (<UIGridChart>this.uiOption).dataType == GridViewType.MASTER ) {

      // for setting aggregations original name
      let originAggregations: any = this.fieldOriginInfo.aggs.map((name) => {
        return {name, digits: 2};
      });

      const columns = this.data.columns;
      let removeAggregationType = function (field) {
        let regExp = /\((.*)\)/gi;
        let match = regExp.exec(field.name);
        if (match != null && match.length > 1) {
          field.name = match[1];
        } else field.name;
      };

      // aggregation 함수 제거
      for (let i = 0; i < originAggregations.length; i++) {
        removeAggregationType(originAggregations[i]);
      }

      originAggregations = cols.concat(rows, originAggregations);

      // 같은 이름을 가진 measure값 제거
      originAggregations = _.uniqBy(originAggregations, 'name');

      let newData = [];
      for (let i = 0; i < columns[0].value.length; i++) {
        for (let j = 0; j < originAggregations.length; j++) {
          let key = originAggregations[j].name;

          let json = {};
          json["&nbsp;"] = i + 1;
          json["COLUMNS"] = key;
          json["VALUE"] = columns[j].value[i];

          newData.push(json);
        }
      }

      cols = [{"name": "COLUMNS"}];
      rows = [{"name": "&nbsp;"}];
      originAggregations = [{name: "VALUE"}];

      aggregations = originAggregations;

      // 원본보기 데이터에 설정
      this.originData = newData;
    }

    // 차트 속성 설정
    this.gridModel = {
      xProperties: cols,
      yProperties: rows,
      zProperties: aggregations,
      axisSelectMode: 'MULTI',
      onAxisXClick: !this.isPage ? this.addGridSelectEventListener : null,
      onAxisYClick: !this.isPage ? this.addGridSelectEventListener : null,
      onBodyCellClick: !this.isPage && this.pivot.columns.length > 1 && this.pivot.rows.length > 1 ? this.addGridSelectEventListener : null, // 한쪽에만 헤더가 있는경우 cellClick이 안되게 막음
      cellWidth: 120,
      cellHeight: 30,
      showAxisZ: false,
      customParams: this.params,
      gridSelectInfo: this.chartSelectInfo,
      shelve: this.pivot,
      min: minValue,
      max: maxValue,
      header: {
        font: {},
        align: {},
      },
      body: {
        font: {},
        color: {
            stepColors: [],
            stepTextColors: []
        },
        align: {},
        showAxisZ: false
      }
    };

    // view 모드일 경우에는 클릭이벤트 삭제
    if (this.viewMode === true) {
      delete this.gridModel.onAxisXClick;
      delete this.gridModel.onAxisYClick;
      delete this.gridModel.onBodyCellClick;
    }

    // UI 옵션 적용
    if (this.uiOption && this.uiOption.color) {

      this.gridModel.useSelectStyle = this.uiOption && _.eq((<UIGridChart>this.uiOption).dataType, GridViewType.PIVOT);
      this.gridModel.leftAxisWidth = this.uiOption && _.eq((<UIGridChart>this.uiOption).dataType, GridViewType.PIVOT) ? 120 : 65;
      const schema = (<UIChartColorByCell>this.uiOption.color).schema;
      this.gridModel.showColorStep = !_.isEmpty(schema);

      const cellColor = (<UIChartColorByCell>this.uiOption.color);

      // 원본타입일때 zProperties의 VALUE값 hide
      if (_.eq((<UIGridChart>this.uiOption).dataType, GridViewType.MASTER)) this.gridModel.showDataColumn = false;

      // 색상 설정여부
      this.gridModel.body.color.showColorStep = true;

      // 색상 타입 설정
      this.gridModel.body.color.colorTarget = cellColor.colorTarget;

      // ranges 색상값이있을때 설정
      this.setRangeColor(cellColor, this.gridModel);

      // 폰트컬러가 있는겨웅 폰트컬러로 설정
      if ((<UIGridChart>this.uiOption).contentStyle.fontColor && '' !== (<UIGridChart>this.uiOption).contentStyle.fontColor) {

        // visualGradations이 있는경우 stepTextColor를 visualGradations개수만큼 설정
        if (this.uiOption.color['visualGradations'] && this.uiOption.color['visualGradations'].length > 0) {
          this.gridModel.body.color.stepTextColors = this.uiOption.color['visualGradations'].map(() => {return (<UIGridChart>this.uiOption).contentStyle.fontColor});
        } else {
          this.gridModel.body.color.stepTextColors = [(<UIGridChart>this.uiOption).contentStyle.fontColor];
        }
      }

      // 본문스타일 show head column
      this.gridModel.body.showAxisZ = (<UIGridChart>this.uiOption).contentStyle
        ? (<UIGridChart>this.uiOption).contentStyle.showHeader
          ? (<UIGridChart>this.uiOption).contentStyle.showHeader
          : false
        : false;
      this.gridModel.dataColumnMode = _.eq((<UIGridChart>this.uiOption).measureLayout, UIOrient.HORIZONTAL)
        ? this.chart.DATA_COL_MODE.TOP
        : this.chart.DATA_COL_MODE.LEFT;

      // 정렬 설정
      // 헤더에서는 문자값만 있으므로 기본설정 선택시 왼쪽정렬로 설정
      if (UIPosition.AUTO == (<UIGridChart>this.uiOption).headerStyle.hAlign) {
        this.gridModel.header.align.hAlign = UIPosition.LEFT.toString().toLowerCase();
      } else {
        // 가로정렬
        this.gridModel.header.align.hAlign = (<UIGridChart>this.uiOption).headerStyle.hAlign.toString().toLowerCase();
      }

      // 본문에서는 auto시 숫자값은 오른쪽, 문자값은 왼쪽으로 정렬됨
      this.gridModel.body.align.hAlign = (<UIGridChart>this.uiOption).contentStyle.hAlign.toString().toLowerCase();

      // 세로정렬
      this.gridModel.header.align.vAlign = (<UIGridChart>this.uiOption).headerStyle.vAlign.toString().toLowerCase();
      this.gridModel.body.align.vAlign = (<UIGridChart>this.uiOption).contentStyle.vAlign.toString().toLowerCase();

      // 폰트사이즈 설정
      this.gridModel.header.font.size = this.setFontSize((<UIGridChart>this.uiOption).headerStyle.fontSize);
      this.gridModel.body.font.size = this.setFontSize((<UIGridChart>this.uiOption).contentStyle.fontSize);

      // 폰트스타일 설정
      this.gridModel.header.font.styles = (<UIGridChart>this.uiOption).headerStyle.fontStyles;
      this.gridModel.body.font.styles = (<UIGridChart>this.uiOption).contentStyle.fontStyles;

      // 헤더 보이기
      this.gridModel.header.showHeader = (<UIGridChart>this.uiOption).headerStyle.showHeader;

      // 설명 설정
      this.gridModel.remark = (<UIGridChart>this.uiOption).annotation;

      // 헤더 색상설정
      this.gridModel.header.font.color = (<UIGridChart>this.uiOption).headerStyle.fontColor;
      this.gridModel.header.backgroundColor = (<UIGridChart>this.uiOption).headerStyle.backgroundColor;

      // 연산행 설정
      if ((<UIGridChart>this.uiOption).totalValueStyle) {
        const totalValueStyle = (<UIGridChart>this.uiOption).totalValueStyle;

        this.gridModel.totalValueStyle = (<UIGridChart>this.uiOption).totalValueStyle;
        this.gridModel.totalValueStyle.font = {};
        this.gridModel.totalValueStyle.font.size = this.setFontSize(totalValueStyle.fontSize);
        this.gridModel.totalValueStyle.font.color = totalValueStyle.fontColor;
        this.gridModel.totalValueStyle.font.styles = totalValueStyle.fontStyles;

        this.gridModel.totalValueStyle.align = {};
        this.gridModel.totalValueStyle.align.hAlign = totalValueStyle.hAlign;
        this.gridModel.totalValueStyle.align.vAlign = totalValueStyle.vAlign;
      }

      // 숫자 포멧 설정
      this.gridModel.format = this.uiOption.valueFormat;
    }

    // chartOption을 쓰지 않지만 override를 위해 반환
    return this.chartOption;
  }

  /**
   * 차트에 옵션 반영
   * - Echart기반 차트가 아닐경우 Override 필요
   * @param initFl 차트 초기화 여부
   */
  protected apply(initFl: boolean = true): void {

    // 원본보기일때 원본보기 데이터로 정제된 데이터를 설정
    const data = (<UIGridChart>this.uiOption).dataType == GridViewType.MASTER ? this.originData : this.data;

    // 차트 데이터 주입
    this.chart.initialize(data, this.gridModel);
  }

  /**
   * 차트 표현후 리사이즈
   * - 필요시 각 차트에서 Override
   * @returns {BaseOption}
   */
  protected drawFinish(): void {

    // 차트 생성 완료 이벤트 발생
    this.drawFinished.emit();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * grid 사용자 색상설정
   * @param cellColor 색상값
   * @param gridModel grid에 설정하는값
   */
  private setRangeColor(cellColor: UIChartColorByCell, gridModel: any) {

    let rangeList = [];

    // ranges값이 있는경우 stepRangeColors에 값설정
    if (cellColor.ranges && cellColor.ranges.length > 0) {

      // gradation일때
      if (this.uiOption.color['customMode'] && ColorCustomMode.GRADIENT == this.uiOption.color['customMode']) {

        this.setGradationRangeColor(<UIChartColorGradationByCell>cellColor, gridModel);
      } else {
        rangeList = _.cloneDeep(cellColor.ranges);

        let rangeColors = [];

        // gt, lte값을 min / max 값으로 치환
        rangeList.forEach((item) => {

          rangeColors.push({min: item.gt, max: item.lte, fixMin: item.fixMin, fixMax: item.fixMax, color: item.color});
        });

        // pieces값 설정
        gridModel.body.color.stepRangeColors = rangeColors;
      }
    }
  }

  /**
   * gradation 색상설정
   * @param cellColor
   * @param gridModel
   */
  private setGradationRangeColor(cellColor: UIChartColorGradationByCell, gridModel: any) {

    const codes = cellColor.visualGradations.map((item) => {return item['color']});

    if (CellColorTarget.BACKGROUND == (<UIChartColorByCell>this.uiOption.color).colorTarget) {
      gridModel.body.color.stepColors = codes;
    } else {
      gridModel.body.color.stepTextColors = codes;
    }

  }

  /**
   * 폰트사이즈에 따라 사이즈 number 리턴
   * @param fontSize
   * @returns {number}
   */
  private setFontSize(fontSize: FontSize): number {

    // 폰트사이즈 설정
    let size: number;
    switch(fontSize) {
      case FontSize.NORMAL:
        size = 13;
        break;
      case FontSize.SMALL:
        size = 11;
        break;
      case FontSize.LARGE:
        size = 15;
        break;
    }

    return size;
  }

  /**
   * uiOption headerStyle, contentStyle 기본설정
   * @returns {UIOption}
   */
  private setGridData(): UIOption {

    const uiOption = <UIGridChart>this.uiOption;

    if (!uiOption.headerStyle) uiOption.headerStyle = {};
    if (!uiOption.headerStyle.fontSize) uiOption.headerStyle.fontSize = FontSize.NORMAL;
    if (_.isUndefined(uiOption.headerStyle.showHeader)) uiOption.headerStyle.showHeader = true;
    if (!uiOption.headerStyle.fontStyles) uiOption.headerStyle.fontStyles = [];
    if (!uiOption.headerStyle.hAlign) uiOption.headerStyle.hAlign = UIPosition.LEFT;
    if (!uiOption.headerStyle.vAlign) uiOption.headerStyle.vAlign = UIPosition.MIDDLE;
    if (!uiOption.headerStyle.backgroundColor) uiOption.headerStyle.backgroundColor = '#ffffff';
    if (!uiOption.headerStyle.fontColor) uiOption.headerStyle.fontColor = '#959595';

    if (!uiOption.contentStyle) uiOption.contentStyle = {};
    if (!uiOption.contentStyle.hAlign) uiOption.contentStyle.hAlign = UIPosition.LEFT;
    if (!uiOption.contentStyle.vAlign) uiOption.contentStyle.vAlign = UIPosition.MIDDLE;
    if (!uiOption.contentStyle.fontSize) uiOption.contentStyle.fontSize = FontSize.NORMAL;
    if (!uiOption.contentStyle.fontStyles) uiOption.contentStyle.fontStyles = [];
    if (!uiOption.contentStyle.fontColor) uiOption.contentStyle.fontColor = '';
    if (_.isUndefined(uiOption.headerStyle.showHeader)) uiOption.headerStyle.showHeader = false;

    if (ChartColorType.SINGLE == uiOption.color.type && !uiOption.color['code']) uiOption.color['code'] = '';
    return this.uiOption
  }

}
