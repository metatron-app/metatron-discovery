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

import {Component, ElementRef, Injector, Input, ViewChild} from '@angular/core';
import {BaseOptionComponent} from "./base-option.component";
import { UIOption } from '../../common/component/chart/option/ui-option';
import * as _ from 'lodash';
import {Pivot} from "../../domain/workbook/configurations/pivot";
import {
  UILabelChart, UILabelSecondaryIndicator,
  UILabelIcon, UILabelAnnotation, UILabelChartSeries
} from "../../common/component/chart/option/ui-option/ui-label-chart";
import {
  ChartType, LabelSecondaryIndicatorType,
  LabelSecondaryIndicatorMarkType, LabelSecondaryIndicatorPeriod
} from "../../common/component/chart/option/define/common";
import {SelectComponent} from "../../common/component/select/select.component";
import {Filter} from "../../domain/workbook/configurations/filter/filter";
import {IntervalFilter} from "../../domain/workbook/configurations/filter/interval-filter";
import {Alert} from "../../common/util/alert.util";
import {PageWidget, PageWidgetConfiguration} from "../../domain/dashboard/widget/page-widget";
import {GranularityType, TimestampField} from "../../domain/workbook/configurations/field/timestamp-field";
import {Field, FieldRole, LogicalType} from "../../domain/datasource/datasource";
import { Field as AbstractField } from '../../domain/workbook/configurations/field/field';
@Component({
  selector: 'secondary-indicator-option',
  templateUrl: './secondary-indicator.component.html'
})
export class SecondaryIndicatorComponent extends BaseOptionComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('targetListComp')
  private targetListComp: SelectComponent;

  @ViewChild('indicatorListComp')
  private indicatorListComp: SelectComponent;

  @ViewChild('periodListComp')
  private periodListComp: SelectComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Pivot
  public pivot: Pivot;
  public pivotTemp: Pivot;

  // 표시 대상
  public targetList: Object[] = [
    {name: this.translateService.instant('msg.comm.ui.list.all'), value: ''}
  ];
  public target: Object = this.targetList[0];

  // 지표 유형
  public indicatorList: Object[] = [
    {name: this.translateService.instant('msg.page.common.kpi.indocator.standard.to'), value: 'STANDARD'}
    ,{name: this.translateService.instant('msg.page.common.kpi.indocator.period'), value: 'PERIOD'}
  ];

  // 비교기간
  public periodList: Object[] = [
    {name: this.translateService.instant('msg.page.common.kpi.indocator.period.year'), value: 'YEAR'},
    //{name: this.translateService.instant('msg.page.common.kpi.indocator.period.quarter'), value: 'QUARTER'},
    {name: this.translateService.instant('msg.page.common.kpi.indocator.month'), value: 'MONTH'},
    {name: this.translateService.instant('msg.page.common.kpi.indocator.day'), value: 'DAY'},
    {name: this.translateService.instant('msg.page.common.kpi.indocator.hour'), value: 'HOUR'}
  ];

  // 목표값
  public standardValueTemp: string = "";
  public standardValue: number;

  // 비교기간 여부
  public isPeriod: boolean = false;

  // 타임필드
  public timeField: AbstractField;

  @Input('widget')
  public widget: PageWidget;

  @Input('uiOption')
  public set setUiOption(uiOption: UIOption) {

    // Set
    this.uiOption = uiOption;

    // Pivot 설정
    if( _.isUndefined(this.pivot) ) {
      this.setPivot = this.pivotTemp;
    }
  }

  // Pivot 정보
  @Input('pivot')
  public set setPivot(pivot: Pivot) {

    // Pivot 정보가 없다면 중단
    if( _.isUndefined(pivot) ) {
      return;
    }

    // UI Option이 없다면 중단
    if( _.isUndefined(this.uiOption) ) {
      this.pivotTemp = pivot;
      return;
    }

    // Set
    this.pivot = pivot;

    // KPI 차트 옵션추가
    const option: UILabelChart = <UILabelChart>this.uiOption;
    if( this.uiOption.type == ChartType.LABEL && option.series ) {

      const isTargetAll: boolean = this.isTargetAll();
      this.targetList = [];
      this.targetList.push({name: this.translateService.instant('msg.comm.ui.list.all'), value: ''});
      let series: UILabelChartSeries[] = [];
      let icons: UILabelIcon[] = [];
      let annotations: UILabelAnnotation[] = [];
      let secondaryIndicators: UILabelSecondaryIndicator[] = [];

      for( let num: number = 0 ; num < this.pivot.aggregations.length ; num++ ) {

        //////////////////////////////////////////
        // 타겟
        //////////////////////////////////////////
        const field: any = this.pivot.aggregations[num];
        let alias: string = field['alias'] ? field['alias'] : field['fieldAlias'] ? field['fieldAlias'] : field['name'];
        if( field.aggregationType && field.aggregationType != "" ) {
          alias = field.aggregationType +"("+ alias +")";
        }

        /////////////////////
        // Pivot이 추가되었을때 처리
        /////////////////////

        //if( option.series.length <= num || option.series.length != this.pivot.aggregations.length ) {
        if( option.series.length <= num ) {
          if( num > 0 ) {
            option.series[num] = {
              name: alias
            };
            option.icons[num] = {
              seriesName: alias,
              show: option.icons[0].show,
              iconType: option.icons[0].iconType
            };
            option.annotations[num] = {
              seriesName: alias,
              show: option.annotations[0].show,
              description: option.annotations[0].description
            };
            option.secondaryIndicators[num] = {
              seriesName: alias,
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

        if( _.isUndefined(option.series[num].name)
          || _.isUndefined(option.icons[num].seriesName)
          || _.isUndefined(option.annotations[num].seriesName)
          || _.isUndefined(option.secondaryIndicators[num].seriesName) ) {
          option.series[num].name = alias;
          option.icons[num].seriesName = alias;
          option.annotations[num].seriesName = alias;
          option.secondaryIndicators[num].seriesName = alias;
        }

        /////////////////////
        // Pivot의 순서가 변경되었을때 처리
        /////////////////////

        let isPush: boolean = false;
        for( let num2: number = 0 ; num2 < this.pivot.aggregations.length ; num2++ ) {
          if( option.series.length >= (num2+1) && _.eq(alias, option.series[num2].name) ) {
            isPush = true;
            series.push(option.series[num2]);
          }
          if( option.icons.length >= (num2+1) && _.eq(alias, option.icons[num2].seriesName) ) {
            icons.push(option.icons[num2]);
          }
          if( option.annotations.length >= (num2+1) && _.eq(alias, option.annotations[num2].seriesName) ) {
            annotations.push(option.annotations[num2]);
          }
          if( option.secondaryIndicators.length >= (num2+1) && _.eq(alias, option.secondaryIndicators[num2].seriesName) ) {
            secondaryIndicators.push(option.secondaryIndicators[num2]);
          }
        }

        /////////////////////
        // Change alias process
        /////////////////////

        if( !isPush ) {
          option.series[num].name = alias;
          option.icons[num].seriesName = alias;
          option.annotations[num].seriesName = alias;
          option.secondaryIndicators[num].seriesName = alias;

          for( let num2: number = 0 ; num2 < this.pivot.aggregations.length ; num2++ ) {
            if( option.series.length >= (num2+1) && _.eq(alias, option.series[num2].name) ) {
              series.push(option.series[num2]);
            }
            if( option.icons.length >= (num2+1) && _.eq(alias, option.icons[num2].seriesName) ) {
              icons.push(option.icons[num2]);
            }
            if( option.annotations.length >= (num2+1) && _.eq(alias, option.annotations[num2].seriesName) ) {
              annotations.push(option.annotations[num2]);
            }
            if( option.secondaryIndicators.length >= (num2+1) && _.eq(alias, option.secondaryIndicators[num2].seriesName) ) {
              secondaryIndicators.push(option.secondaryIndicators[num2]);
            }
          }
        }

        this.targetList.push({
          name: alias,
          value: alias
        });
      }

      // 변경된 순서 반영
      option.series = series;
      option.icons = icons;
      option.annotations = annotations;
      option.secondaryIndicators = secondaryIndicators;

      this.changeDetect.detectChanges();
      if( !isTargetAll ) {
        this.targetListComp.selected(this.targetList[this.targetList.length-1]);
        // this.target = this.targetList[this.targetList.length-1];
        // this.changeTarget(this.target);
      }
      else {
        this.targetListComp.selected(this.targetList[0]);
        //this.changeTarget(this.target);
      }
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 표시대상 전체선택 여부
   * @returns {boolean}
   */
  public isTargetAll(): boolean {
    const option: UILabelChart = <UILabelChart>this.uiOption;
    let indicatorType: string = "";
    let rangeUnit: string = "";
    let targetValue: number = undefined;
    let mark: string = "";
    let isAll: boolean = true;
    _.each(option.secondaryIndicators, (series) => {
      const labelSeries: UILabelSecondaryIndicator = (<UILabelSecondaryIndicator>series);
      if( !_.isUndefined(labelSeries.show) ) {

        let seriesIndicatorType: string = String(labelSeries.indicatorType);
        if( indicatorType == "" ) {
          indicatorType = seriesIndicatorType;
        }
        else if( indicatorType != seriesIndicatorType ) {
          isAll = false;
        }

        let seriesRangeUnit: string = String(labelSeries.rangeUnit);
        if( _.isUndefined(rangeUnit) || rangeUnit == "" ) {
          rangeUnit = seriesRangeUnit;
        }
        else if( _.eq(seriesIndicatorType, LabelSecondaryIndicatorType.PERIOD)
          && _.isUndefined(rangeUnit)
          && _.isUndefined(seriesRangeUnit)
          && rangeUnit != seriesRangeUnit ) {
          isAll = false;
        }

        let seriesTargetValue: number = labelSeries.targetValue;
        if( _.isUndefined(targetValue) || targetValue == 0 ) {
          targetValue = seriesTargetValue;
        }
        else if( _.eq(seriesIndicatorType, LabelSecondaryIndicatorType.STANDARD)
          && _.isUndefined(targetValue)
          && _.isUndefined(seriesTargetValue)
          && targetValue != seriesTargetValue ) {
          isAll = false;
        }

        let seriesMark: string = String(labelSeries.mark);
        if( mark == "" ) {
          mark = seriesMark;
        }
        else if( mark != seriesMark ) {
          isAll = false;
        }
      }
    });
    return isAll;
  }

  /**
   * 보조지표 사용여부
   */
  public changeTargetUse(): void {

    const option: UILabelChart = <UILabelChart>this.uiOption;
    let show: boolean = !option.secondaryIndicators[0].show;
    _.each(option.secondaryIndicators, (series) => {
      series.show = show;
      if( show ) {
        this.changeDetect.detectChanges();
        const indicatorType: Object = this.indicatorListComp.selectedItem;
        if( indicatorType ) {
          series.indicatorType = indicatorType['value'];
        }
        else {
          series.indicatorType = this.indicatorList[0]['value'];
          this.indicatorListComp.selected(this.indicatorList[0]);
        }
      }
    });

    // 표시대상 변경
    if( show ) {
      this.targetListComp.selected(this.targetList[0]);
      //this.changeTarget(this.targetList[0]);
    }
    else {
      this.uiOption = <UIOption>_.extend({}, this.uiOption, { secondaryIndicators: option.secondaryIndicators });
      this.update();
    }
  }

  /**
   * 보조지표 타입 Index
   */
  public getIndicatorTypeIndex(): number {

    // Set Indicator Type
    let labelOption: UILabelChart = <UILabelChart>this.uiOption;
    if( _.isUndefined(labelOption.secondaryIndicators) || labelOption.secondaryIndicators.length == 0 ) {
      return 0;
    }
    else {
      let secondaryIndicators: UILabelSecondaryIndicator = labelOption.secondaryIndicators[0];
      if( _.eq(secondaryIndicators.indicatorType, LabelSecondaryIndicatorType.PERIOD) ) {
        return 1;
      }
      else {
        return 0;
      }
    }
  }

  /**
   * 표시대상 변경
   * @param iconType
   */
  public changeTarget(target: Object): void {

    this.target = target;
    this.changeDetect.detectChanges();
    if( this.target['value'] == '') {
      const option: UILabelChart = <UILabelChart>this.uiOption;
      // 지표 유형
      // this.changeIndicatorType(option.secondaryIndicators[0].indicatorType);
      this.indicatorListComp.selected(
        _.eq(option.secondaryIndicators[0].indicatorType, LabelSecondaryIndicatorType.PERIOD)
          ? this.indicatorList[1]
          : this.indicatorList[0]
      );
      // 목표값
      this.standardValueTemp = _.isUndefined(option.secondaryIndicators[0].targetValue) ? "" : String(option.secondaryIndicators[0].targetValue);
      this.standardValue = _.isUndefined(option.secondaryIndicators[0].targetValue) ? undefined : option.secondaryIndicators[0].targetValue;
      _.each(option.secondaryIndicators, (series) => {
        series.targetValue = this.standardValue;
      });
      // 표시방식
      this.changeMarkType(String(option.secondaryIndicators[0].mark));
      // 강조여부
      this.changeEmphasized(_.isUndefined(option.secondaryIndicators[0].emphasized) ? false : option.secondaryIndicators[0].emphasized);
    }
    else {
      const option: UILabelChart = <UILabelChart>this.uiOption;
      _.each(option.secondaryIndicators, (series) => {
        if( this.target['value'] == series.seriesName ) {
          // 지표 유형
          // this.changeIndicatorType(series.indicatorType);
          this.indicatorListComp.selected(
            _.eq(series.indicatorType, LabelSecondaryIndicatorType.PERIOD)
              ? this.indicatorList[1]
              : this.indicatorList[0]
          );
          // 목표값
          this.standardValueTemp = _.isUndefined(series.targetValue) ? "" : String(series.targetValue);
          this.standardValue = _.isUndefined(series.targetValue) ? undefined : series.targetValue;
          // 표시방식
          this.changeMarkType(String(series.mark));
        }
      });
    }
  }

  /**
   * 지표유형 변경
   * @param type
   */
  public changeIndicatorType(indicatorType: LabelSecondaryIndicatorType): void {

    const option: UILabelChart = <UILabelChart>this.uiOption;
    _.each(option.secondaryIndicators, (series) => {
      if( this.target['value'] == '' || this.target['value'] == series.seriesName ) {
        //series.show = true;
        series.indicatorType = indicatorType;
      }
    });

    this.isPeriod = _.eq(indicatorType, LabelSecondaryIndicatorType.PERIOD);
    // 타임필드 세팅
    if( _.isUndefined(this.timeField) ) {
      this.initTimeFieldSetting();
    }
    this.changeDetect.detectChanges();

    if( _.eq(indicatorType, LabelSecondaryIndicatorType.PERIOD) ) {
      let value: string = "";
      if( this.target['value'] == '') {
        value = _.isUndefined(option.secondaryIndicators[0].rangeUnit)
          ? this.periodList[0]['value']
          : option.secondaryIndicators[0].rangeUnit;
      }
      else {
        _.each(option.secondaryIndicators, (series) => {
          if (this.target['value'] == series.seriesName) {
            value = _.isUndefined(option.secondaryIndicators[0].rangeUnit)
              ? this.periodList[0]['value']
              : option.secondaryIndicators[0].rangeUnit;

            value = _.isUndefined(series.rangeUnit)
              ? this.periodList[0]['value']
              : series.rangeUnit;
          }
        });
      }
      _.each(this.periodList, (period, index) => {
        if( _.eq(period['value'], value) ) {
          //this.periodListComp.setDefaultIndex = value;
          this.periodListComp.selected(period);
        }
      });
    }
    else {
      this.uiOption = <UIOption>_.extend({}, this.uiOption, { secondaryIndicators: option.secondaryIndicators });
      this.update();
    }
  }

  /**
   * 목표값 원복
   * @param targetValue
   */
  public revokeTargetValue(): void {

    this.standardValueTemp = _.isUndefined(this.standardValue) || this.standardValue == 0 ? "" : String(this.standardValue);
  }

  /**
   * 표시방식 선택여부
   * @param iconType
   */
  public getMarkSelected(markTypeStr: string): boolean {

    let markType: LabelSecondaryIndicatorMarkType = LabelSecondaryIndicatorMarkType[markTypeStr];
    const option: UILabelChart = <UILabelChart>this.uiOption;
    if( this.target['value'] == '' ) {
      if( markType == option.secondaryIndicators[0].mark
          || (markType == LabelSecondaryIndicatorMarkType.INCREMENTAL && !option.secondaryIndicators[0].mark) ) {
        return true;
      }
      return false;
    }
    else {
      const labelSeries: UILabelSecondaryIndicator[] = (<UILabelSecondaryIndicator[]>option.secondaryIndicators);
      for( let num = 0 ; num < labelSeries.length ; num++ ) {
        if( labelSeries[num].seriesName == this.target['value'] ) {
          if( markType == labelSeries[num].mark
              || (markType == LabelSecondaryIndicatorMarkType.INCREMENTAL && !labelSeries[num].mark) ) {
            return true;
          }
          return false;
        }
      }
    }
  }

  /**
   * 표시방식 변경
   * @param type
   */
  public changeMarkType(markTypeStr: string): void {

    let markType: LabelSecondaryIndicatorMarkType = LabelSecondaryIndicatorMarkType[markTypeStr];
    const option: UILabelChart = <UILabelChart>this.uiOption;
    _.each(option.secondaryIndicators, (series) => {
      if( this.target['value'] == '' || this.target['value'] == series.seriesName ) {
        series.mark = markType;
      }
    });
    this.uiOption = <UIOption>_.extend({}, this.uiOption, { secondaryIndicators: option.secondaryIndicators });
    this.update();
  }

  /**
   * 강조여부
   */
  public getEmphasizedSelected(): boolean {

    const option: UILabelChart = <UILabelChart>this.uiOption;
    if( _.isUndefined(option.secondaryIndicators[0]) ) {
      return false;
    }

    if( this.target['value'] == '' ) {
      return option.secondaryIndicators[0].emphasized;
    }
    else {
      const labelSeries: UILabelSecondaryIndicator[] = (<UILabelSecondaryIndicator[]>option.secondaryIndicators);
      for( let num = 0 ; num < labelSeries.length ; num++ ) {
        if( labelSeries[num].seriesName == this.target['value'] ) {
          return labelSeries[num].emphasized;
        }
      }
    }
  }

  /**
   * 강조여부 변경
   */
  public changeEmphasized(forceEmphasized?: boolean): void {

    const option: UILabelChart = <UILabelChart>this.uiOption;
    let emphasized = _.isUndefined(forceEmphasized) ? !option.secondaryIndicators[0].emphasized : forceEmphasized;
    _.each(option.secondaryIndicators, (series) => {
      if( this.target['value'] == '' ) {
        series.emphasized = emphasized;
      }
      else if( this.target['value'] == series.seriesName ) {
        series.emphasized = !series.emphasized;
      }
    });
    this.uiOption = <UIOption>_.extend({}, this.uiOption, { secondaryIndicators: option.secondaryIndicators });
    this.update();
  }

  /**
   * 목표값 변경
   */
  public applyStandardValue(): void {

    if( Number.isNaN(Number(this.standardValueTemp)) ) {
      this.standardValueTemp = _.isUndefined(this.standardValue) ? undefined : String(this.standardValue);
      return;
    }
    this.standardValue = _.isUndefined(this.standardValueTemp) ? undefined : Number(this.standardValueTemp);
    const option: UILabelChart = <UILabelChart>this.uiOption;
    _.each(option.secondaryIndicators, (series) => {
      if( this.target['value'] == '' || this.target['value'] == series.seriesName ) {
        series.targetValue = this.standardValue;
      }
    });
    this.uiOption = <UIOption>_.extend({}, this.uiOption, { secondaryIndicators: option.secondaryIndicators });
    this.update();
  }

  /**
   * 보조지표 사용여부
   * @returns {boolean}
   */
  public isShow(): boolean {

    const option: UILabelChart = <UILabelChart>this.uiOption;
    if( _.isUndefined(option.secondaryIndicators) || option.secondaryIndicators.length == 0 ) {
      return false;
    }
    return _.isUndefined(option.secondaryIndicators[0].show) ? false : option.secondaryIndicators[0].show;
  }

  /**
   * 비교기간 타입 변경
   * @param type
   */
  public changePeriodType(periodType: LabelSecondaryIndicatorPeriod): void {

    // const indicatorType: Object = this.indicatorListComp.selectedItem;
    // if( _.eq(indicatorType['value'], LabelSecondaryIndicatorType.PERIOD) ) {
    //     && !this.checkKpiChartIntervalFilter() ) {
    //   return;
    // }

    const option: UILabelChart = <UILabelChart>this.uiOption;
    _.each(option.secondaryIndicators, (series) => {
      if( this.target['value'] == '' || this.target['value'] == series.seriesName ) {
        series.rangeUnit = periodType;
      }
    });
    this.uiOption = <UIOption>_.extend({}, this.uiOption, { secondaryIndicators: option.secondaryIndicators });
    this.update();
  }

  /**
   * 목표값(false) or 비교기간(true)
   * @returns {boolean}
   */
  public setIsPeriod(): void {

    const option: UILabelChart = <UILabelChart>this.uiOption;
    if( _.isUndefined(option.secondaryIndicators) || option.secondaryIndicators.length == 0 ) {
      this.isPeriod = false;
      return;
    }

    const isTargetAll: boolean = this.isTargetAll();
    if( isTargetAll || this.target == this.targetList[0] ) {
      this.isPeriod = _.eq(option.secondaryIndicators[0].indicatorType, LabelSecondaryIndicatorType.PERIOD);
      return;
    }
    else {
      _.each(option.secondaryIndicators, (series, index) => {
        if( this.target['value'] == series.seriesName ) {
          this.isPeriod = _.eq(series.indicatorType, LabelSecondaryIndicatorType.PERIOD);
          return;
        }
      });
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private checkKpiChartIntervalFilter(): boolean {

    if( !this.widget ) {
      return false;
    }

    let filters: Filter[] = [];
    let paramFilters: Filter[] = (<PageWidgetConfiguration>this.widget.configuration).filters;
    if (this.widget.dashBoard.configuration.hasOwnProperty('filters')) {
      filters = this.widget.dashBoard.configuration['filters'].concat(paramFilters);
    }
    // 파라미터 필터가 있을 경우 우선 적용
    if (paramFilters && paramFilters.length > 0) {
      filters = paramFilters;
    }


    if( !filters || filters.length == 0 ) {
      return false;
    }

    var intervals = (<IntervalFilter[]>filters)[0].intervals;
    if(intervals.length == 0) {
      Alert.info("비교 가능한 데이터가 존재하지 않습니다.");
      return false;
    }
    else if(intervals.length > 1) {
      Alert.info("기간필터가 1개일 경우에만 가능합니다.");
      return false;
    }
    return true;
  }

  // granularity 가중치 반환 (SECOND => YEAR로 갈수록 점수가 높아짐)
  private getGranularityScore(granularity: string): number {

    let score: number = 0;
    switch (granularity) {
      // 초단위 제거 요청으로 주석처리
      // case String(GranularityType.SECOND):
      //   score = 1;
      //   break;
      case String(GranularityType.MINUTE):
        score = 2;
        break;
      case String(GranularityType.HOUR):
        score = 3;
        break;
      case String(GranularityType.DAY):
        score = 4;
        break;
      case String(GranularityType.WEEK):
        score = 4;
        break;
      case String(GranularityType.MONTH):
        score = 6;
        break;
      case String(GranularityType.QUARTER):
        score = 6;
        break;
      case String(GranularityType.YEAR):
        score = 8;
        break;
    }
    return score;
  }

  private initTimeFieldSetting(): void {
    //////////////////////////////
    // 타임필드 세팅
    //////////////////////////////

    const fields: Field[] = (this.widget.dashBoard.configuration.fields) ? this.widget.dashBoard.configuration.fields : [];
    const idx: number = _.findIndex(fields, { role: FieldRole.TIMESTAMP, logicalType: LogicalType.TIMESTAMP });
    const timeField: AbstractField = new TimestampField();
    timeField.name = fields[idx].name;
    timeField.alias = fields[idx].alias;
    timeField.granularity = fields[idx].granularity;
    timeField.format = {
      type: "time_format",
      format: "yyyy-MM-dd HH:mm:ss",
      timeZone: "UTC",
      locale: "en"
    };
    this.timeField = timeField;

    //////////////////////////////
    // granularity 세팅
    //////////////////////////////

    let granularityScore: number = this.getGranularityScore(String(this.timeField.granularity));
    this.periodList = [];
    if( granularityScore <= 8 ) {
      this.periodList.push({name: this.translateService.instant('msg.page.common.kpi.indocator.period.year'), value: 'YEAR'});
    }
    if( granularityScore <= 6 ) {
      this.periodList.push({name: this.translateService.instant('msg.page.common.kpi.indocator.period.month'), value: 'MONTH'});
    }
    if( granularityScore <= 4 ) {
      this.periodList.push({name: this.translateService.instant('msg.page.common.kpi.indocator.period.day'), value: 'DAY'});
    }
    if( granularityScore <= 3 ) {
      this.periodList.push({name: this.translateService.instant('msg.page.common.kpi.indocator.period.hour'), value: 'HOUR'});
    }
    console.info(this.periodList);
  }

}
