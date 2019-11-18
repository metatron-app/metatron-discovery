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

import { AbstractComponent } from '../../common/component/abstract.component';
import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Field, Field as AbstractField } from '../../domain/workbook/configurations/field/field';
import { FieldRole } from '../../domain/datasource/datasource';
import { Alert } from '../../common/util/alert.util';
import * as _ from 'lodash';
import { StringUtil } from '../../common/util/string.util';
import { DIRECTION } from '../../domain/workbook/configurations/sort';
import { ChartType, EventType, SeriesType } from '../../common/component/chart/option/define/common';
import { AggregationType } from '../../domain/workbook/configurations/field/measure-field';
import { UIChartAxis } from '../../common/component/chart/option/ui-option/ui-axis';
import { Modal } from '../../common/domain/modal';
import { UIChartColorByValue, UIOption } from '../../common/component/chart/option/ui-option';
import { ByTimeUnit, GranularityType, TimeUnit } from '../../domain/workbook/configurations/field/timestamp-field';
import { Pivot } from '../../domain/workbook/configurations/pivot';
import { PageWidget } from '../../domain/dashboard/widget/page-widget';
import { Shelf } from '../../domain/workbook/configurations/shelf/shelf';
import { UIMapOption } from '../../common/component/chart/option/ui-option/map/ui-map-chart';
import { MapLayerType } from '../../common/component/chart/option/define/map/map-common';

@Component({
  selector: 'pivot-context',
  templateUrl: './pivot-context.component.html'
})
export class PivotContextComponent extends AbstractComponent implements OnInit, OnDestroy {

  @Input('uiOption')
  public uiOption: UIOption;

  @Input('editingField')
  public editingField: AbstractField;

  // Widget 데이터의 필터 목록 (필드명만 정제)
  @Input('filterFiledList')
  public filterFiledList: String[] = [];

  @Input('widget')
  public widget: PageWidget;

  // 차트 타입
  @Input('chartType')
  public chartType: string;

  @Input('pivot')
  public pivot: Pivot;

  @Input('shelf')
  public shelf: Shelf;

  // combine 차트의 현재 선택된 editing 필드의 agg index
  @Input('combineAggIndex')
  public combineAggIndex: number;

  // aggregation
  @Input('aggTypeList')
  public aggTypeList: any[];

  @Output()
  public editingFieldChange: EventEmitter<AbstractField> = new EventEmitter();

  @Output('changePivotContext')
  public changePivotContext: EventEmitter<any> = new EventEmitter();

  // editingField Alias 임시저장용
  public editingFieldAlias: string;

  // 2Depth 컨텍스트 메뉴 고정여부
  public fix2DepthContext: boolean = false;

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /**
   * 필터 On / Off 핸들러
   */
  public onChangeFilter($event): void {

    if (this.editingField.field.filtering) {
      $event.target ? $event.target.checked = true : $event.currentTarget.checked = true;
      Alert.warning(this.translateService.instant('msg.board.alert.recomm-filter.del.error'));
      return;
    }

    // emit
    this.changePivotContext.emit({type: 'toggleFilter', value: this.editingField});
  }

  /**
   * 마우스 오버시 필드 별칭 입력 초기값 설정
   * @param {Field} editingField
   */
  public setEditingFieldAlias(editingField: AbstractField) {
    if( this.isSetPivotAlias(editingField) ) {
      if( editingField.pivotAlias ) {
        this.editingFieldAlias = editingField.pivotAlias.trim();
      } else {
        this.editingFieldAlias = editingField.alias.trim();
      }
    } else {
      this.editingFieldAlias = '';
    }
  } // function - setEditingFieldAlias

  /**
   * 피봇 별칭 수정에 대한 표시 문구
   * @param {Field} editingField
   */
  public getDisplayEditingPivotAlias(editingField: AbstractField): string {
    if (editingField.pivotAlias) {
      return editingField.pivotAlias;
    } else {
      return editingField.alias ? editingField.alias : 'NONE';
    }
  } // function - getDisplayEditingPivotAlias

  /**
   * pivot Alias 가 설정되었는지 여부 반환
   * @param {Field} editingField
   * @return {boolean}
   */
  public isSetPivotAlias(editingField: AbstractField): boolean {
    if (editingField.pivotAlias) {
      return true;
    } else {
      return ( editingField.alias && editingField.alias !== editingField.name
        && editingField.fieldAlias !== editingField.alias );
    }
  } // function - isSetPivotAlias

  /**
   * Alias for this chart: 적용
   * @param event
   */
  public onAliasApply(event: Event): void {

    // 이벤트 캔슬
    event.stopPropagation();

    // validation
    if (this.editingField.pivotAlias && this.editingField.pivotAlias.trim().length > 50) {
      Alert.info(this.translateService.instant('msg.page.alert.chart.title.maxlength.warn'));
      return;
    }

    // return pivot or shelf by chart type
    let list = this.returnPivotShelf();

    // 중복체크
    let duppIndex: number = _.findIndex(list, (item) => {
      return item.pivotAlias == this.editingFieldAlias || item.fieldAlias == this.editingFieldAlias;
    });
    if (duppIndex == -1) {
      this.widget.dashBoard.configuration['fields'].forEach((field, index) => {
        if( field.nameAlias && field.nameAlias['nameAlias'] == this.editingFieldAlias ) {
          duppIndex = index;
          return false;
        }
      });
    }

    // 중복이면 알림 후 중단
    if (duppIndex > -1) {
      Alert.info(this.translateService.instant('msg.page.alert.chart.alias.dupp.warn'));
      return;
    }

    // 값이 없다면 Reset 처리
    if (this.editingFieldAlias.trim() == '') {
      this.onAliasReset(null);
      return;
    }

    // 값 적용
    this.editingFieldAlias = this.editingFieldAlias == this.editingField.name ? this.editingFieldAlias + ' ' : this.editingFieldAlias;
    this.editingField.alias = this.editingFieldAlias;
    this.editingField.pivotAlias = this.editingFieldAlias;
    this.fix2DepthContext = false;

    // 이벤트 발생
    this.changePivotContext.emit({type: 'changePivot', value : EventType.PIVOT_ALIAS});

    //
    this.editingFieldChange.emit(this.editingField);
  }

  /**
   * Alias for this chart: 취소
   * @param event
   */
  public onAliasReset(event: Event): void {

    // 이벤트 캔슬
    if (event) {
      event.stopPropagation();
    }

    // 값 적용
    delete this.editingField.alias;
    delete this.editingField.pivotAlias;
    this.editingFieldAlias = '';
    this.fix2DepthContext = false;

    // 이벤트 발생
    this.changePivotContext.emit({type: 'changePivot', value : EventType.PIVOT_ALIAS});
  }

  /**
   * 사용자 정의 필드 Expresion 표현형태로 치환
   * @param expr
   * @returns {string}
   */
  public unescapeCustomColumnExpr(expr: string) {
    return StringUtil.unescapeCustomColumnExpr(expr);
  }

  // editFilter AlignName
  protected getAlignName() {
    if (this.editingField.direction === DIRECTION.ASC) {
      return 'Ascending';
    } else if (this.editingField.direction === DIRECTION.DESC) {
      return 'Descending';
    }
    return 'In order of data';
  }

  protected onChangeOrder(direction: string) {

    this.editingField.direction = DIRECTION[direction];

    // return pivot or shelf by chart type
    let list = this.returnPivotShelf();

    // 기존의 마지막 Sort를 제거한다.
    list.forEach((item) => {
      delete item.lastDirection;
    });
    this.editingField.lastDirection = true;

    this.changePivotContext.emit({type: 'changePivot'});
  }

  protected hasAlign(direction: string) {
    if (direction === 'NONE' && !this.editingField.hasOwnProperty('direction')) {
      return true;
    }
    return this.editingField.direction === DIRECTION[direction];
  }

  /**
   * aggregationType 변경시
   * @param aggregationTypeId aggregationType 아이디 (SUM/AVG/COUNT/MIN/MAX/PERCENTILE)
   * @param aggTypeOption PERCENTILE처럼 3depth의 선택값
   */
  protected onChangeAggregationType(aggregationTypeId: string, aggTypeOption: number) {

    // 이벤트 버블링 stop
    event.stopPropagation();

    // disabled된 aggregation Type을 선택시 return / percentile 제외
    if (-1 !== this.editingField.aggregationTypeList.indexOf(aggregationTypeId) && String(AggregationType.PERCENTILE) !== aggregationTypeId) {
      return;
    }

    // percentile일때 options값이 없는경우 return
    if (String(AggregationType.PERCENTILE) === aggregationTypeId && !aggTypeOption) {

      return;
    }

    // aggregation 함수의 타입설정
    this.editingField.aggregationType = aggregationTypeId;

    // value 값(aggType의 옵션)
    if (aggTypeOption) {

      // editingField options 설정
      this.setEditingFieldOptions('value=', aggTypeOption);
    }

    this.changePivotContext.emit({type: 'changePivot', value: EventType.AGGREGATION});
  }

  /**
   * 결합차트의 시리즈 차트타입 변경
   * @param seriesType
   */
  public combineChangeSeriesConvertType(seriesType: SeriesType) {

    // aggregation에서 현재 선택된 필드의 index 가져오기
    this.combineAggIndex = this.pivot.aggregations.indexOf(this.editingField);

    // editing field options 해당 키에 맞게 설정
    this.setEditingFieldOptions('series.type=', seriesType);

    this.changePivotContext.emit({type: 'changePivot'});
  }

  /**
   * 포맷변경 핸들러
   * @param formatType
   */
  public onChangeFormat(formatType: string): void {

    if (formatType != '') {
      // Dispatch Event
      const field: AbstractField = _.cloneDeep(this.editingField);
      if (!field.format) {
        field.format = {};
      }
      field.format.type = formatType;
      this.changePivotContext.emit({type: 'format', value: field});
    }
    else {
      this.changePivotContext.emit({type: 'format', value: null});
    }
  }

  /**
   * Show value on chart 변경 핸들러
   * @param showValue
   */
  public onChangeShowValue(showValue: boolean): void {

    // Show Value On / Off 변경
    this.editingField.showValue = showValue;

    // 이벤트 발생
    this.changePivotContext.emit({type: 'pivotFilter'});
  }

  // 시리즈로 표현가능 여부
  protected isPossibleSeries() {

    // 보조축이 가능한 차트인지 체크
    if (!_.eq(this.chartType, ChartType.BAR)
      && !_.eq(this.chartType, ChartType.LINE)
      && !_.eq(this.chartType, ChartType.CONTROL)) {
      return false;
    }

    // editingFilter가 시리즈로 표현가능한지 체크
    if (this.pivot.aggregations.length < 2) {
      return false;
    }

    // 첫번째 아이템이 아닌지 체크
    if (this.pivot.aggregations[0] == this.editingField) {
      return false;
    }

    // 모두 통과시
    return true;
  }

  /**
   * 보조축 On / Off 핸들러
   */
  public onChangeSecondaryAxis($event: Event): void {

    // 보조축
    let secondaryAxis: UIChartAxis = _.cloneDeep(this.uiOption.yAxis);
    secondaryAxis.name = this.editingField.alias;
    this.uiOption.secondaryAxis = secondaryAxis;

    // 이벤트 발생
    this.changePivotContext.emit({type: 'changePivot'});
  }

  /**
   *
   * @param field
   * @param byUnitShowFl byUnit show/hide 설정
   * @returns {string}
   */
  protected getGranularityName(field: AbstractField, byUnitShowFl?: boolean) {
    // byUnit이 있는경우 3depth에 대한 명칭도 보여줌
    return field.format && field.format.unit ? field.format.byUnit && byUnitShowFl ? field.format.unit.toString() + ' BY ' + field.format.byUnit.toString() : field.format.unit.toString() : '';
  }

  protected onChangeGranularity(discontinuous: boolean, unit: string, byUnit?: string) {

    // 같은 granularity를 선택시 return
    if (this.editingField.format.discontinuous == discontinuous && this.editingField.format.unit == TimeUnit[unit] &&
      this.editingField.format.byUnit == ByTimeUnit[byUnit]) {
      return;
    }

    // 사용자 색상이 설정된경우 granularity를 변경시
    if (this.uiOption.color && (<UIChartColorByValue>this.uiOption.color).ranges && (<UIChartColorByValue>this.uiOption.color).ranges.length > 0 &&
      (this.editingField.format.discontinuous !== discontinuous || this.editingField.format.unit !== TimeUnit[unit])) {

      const modal = new Modal();
      modal.name = this.translateService.instant('msg.page.chart.color.measure.range.grid.original.description');
      modal.data = {
        data: { discontinuous: discontinuous, unit: unit, byUnit: byUnit },
        eventType: EventType.GRANULARITY
      };

      // emit, open confirm popup
      this.changePivotContext.emit({type: 'showPopup', value: modal});
      return;
    }

    this.changePivotContext.emit({type: 'onSetGranularity', value: {discontinuous, unit, byUnit}});
  }

  /**
   * 사용 가능한 Granularity인지 여부 editingField로 호출
   * @param discontinuous
   * @param unit
   * @param byUnit
   */
  public isUseGranularity(discontinuous: boolean, unit: string, byUnit?: string): boolean {

    return this.useGranularity(discontinuous, unit, this.editingField.granularity, byUnit);
  }

  protected isGranularitySelected(field: AbstractField, discontinuous: boolean, unit: string, byUnit?: string) {

    if (_.isUndefined(field.format)) {
      return false;
    }

    if (!discontinuous) {
      return (!field.format.discontinuous && field.format.unit == TimeUnit[unit]);
    }
    else {
      return (field.format.discontinuous && field.format.unit == TimeUnit[unit])
        && (!byUnit || (byUnit && field.format.byUnit == ByTimeUnit[byUnit]));
    }
  }

  /**
   * 별칭에 대한 placeholder 문구 조회
   * @param {Field} field
   * @return {string}
   */
  public getAliasPlaceholder(field: AbstractField): string {
    const displayName: string = ( field.fieldAlias ) ? field.fieldAlias : field.name;
    return ( field['aggregationType'] ) ? ( field['aggregationType'] + '(' + displayName + ')' ) : displayName;
  } // function - getAliasPlaceholder


  /**
   * 보조축으로 사용중인 필드여부
   */
  protected isSecondaryAxis(): boolean {

    // X, Y축만 있다면 사용중이 아님
    if (this.uiOption.secondaryAxis) {
      return false;
    }

    // 현재필드의 보조축인지 체크
    if (this.uiOption.secondaryAxis && this.uiOption.secondaryAxis.name == this.editingField.alias) {
      return true;
    }
    else {
      return false;
    }
  }

  /**
   * when click outside of context menu
   */
  public clickOutside() {
    this.editingField = null;
    this.fix2DepthContext = false;

    // when it's null, two way binding doesn't work
    this.changePivotContext.emit({type: 'outside', value: this.editingField});
  }

  /**
   * show / hide aggregate context menu
   * @returns {boolean}
   */
  public showAggregate(): boolean {

    let returnValue: boolean = false;

    // type is measure, custom field aggregated is false => show
    if (this.editingField.type == 'measure' && !this.editingField.aggregated) {

      // map chart => point, heatmap
      if (ChartType.MAP === this.uiOption.type) {

        let mapUIOption = (<UIMapOption>this.uiOption);
        let layerType = mapUIOption.layers[mapUIOption.layerNum].type;

        // point, heatmap, line, polygon => no aggregation / hexagon => set aggregation
        if (MapLayerType.TILE === layerType) {
          returnValue = true;
        }
      }
      // not map chart
      else {
        returnValue = true;
      }
    }

    return returnValue;
  }

  /**
   * 사용 가능한 Granularity인지 여부
   * @param discontinuous
   * @param unit
   * @param byUnit
   */
  private useGranularity(discontinuous: boolean, unit: string, granularity: GranularityType, byUnit?: string): boolean {

    // granularity 가중치 반환 (SECOND => YEAR로 갈수록 점수가 높아짐)
    const getGranularityScore = (granularity: string): number => {
      let score: number = 0;
      switch (granularity) {
        // 초단위 제거 요청으로 주석처리
        case String(GranularityType.SECOND):
          score = 1;
          break;
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
    };

    // 해당 필드가 가능한 최소 Granularity Scope
    let minGranularityScore: number = getGranularityScore(String(granularity));

    // 체크할 Granularity가 최소 Granularity Scope보다 같거나 높아야만 true
    let granularityScore: number = getGranularityScore(unit);

    return granularityScore >= minGranularityScore;
  }

  /**
   * editing field options 해당 키에 맞게 설정
   * @param key       options에 들어갈 key값
   * @param optionData options에 해당 key의 데이터
   */
  private setEditingFieldOptions(key: string, optionData: any) {

    // options가 없는경우
    if (!this.editingField.options) {

      this.editingField.options = key + optionData;

      // options가 있는경우
    } else {

      // value가 있는경우
      if (this.editingField.options.indexOf(key) != -1) {

        const optionsList = this.editingField.options.split(',');

        for (let num = 0; num < optionsList.length; num++) {

          const option = optionsList[num];

          // 해당 key가 있는경우
          if (option.indexOf(key) != -1) {
            optionsList[num] = num !== 0 ? key + optionData : key + optionData;
          }
        }

        this.editingField.options = optionsList.join();
        // 해당 key가 없는경우
      } else {

        // 기존 option값에 해당 key 추가
        this.editingField.options = this.editingField.options + ',' + key + optionData;
      }
    }
  }

  /**
   * return pivot or shelf by chart type
   * @returns {any[]}
   */
  private returnPivotShelf(): Field[] {

    let list = [];

    if (ChartType.MAP === this.uiOption.type) {
      list = this.shelf.layers[(<UIMapOption>this.uiOption).layerNum].fields;
    } else {
      list = _.concat(this.pivot.columns, this.pivot.rows, this.pivot.aggregations);
    }

    return list;
  }
}
