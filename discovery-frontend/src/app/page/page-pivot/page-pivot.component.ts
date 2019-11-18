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
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {Pivot} from '../../domain/workbook/configurations/pivot';
import {Field as AbstractField} from '../../domain/workbook/configurations/field/field';
import {Field, FieldPivot, FieldRole, LogicalType} from '../../domain/datasource/datasource';
import {DimensionField} from '../../domain/workbook/configurations/field/dimension-field';
import {AggregationType, MeasureField} from '../../domain/workbook/configurations/field/measure-field';
import {
  ByTimeUnit,
  GranularityType,
  TimestampField,
  TimeUnit
} from '../../domain/workbook/configurations/field/timestamp-field';
import * as $ from 'jquery';

import * as _ from 'lodash';
import {ClickOutsideDirective} from 'ng-click-outside';
import {PageWidget, PageWidgetConfiguration} from '../../domain/dashboard/widget/page-widget';
import {
  BarMarkType,
  ChartType,
  EventType, SeriesType,
  ShelveFieldType,
  ShelveType,
  UIFormatCurrencyType,
  UIFormatNumericAliasType,
  UIFormatType
} from '../../common/component/chart/option/define/common';
import {Format} from '../../domain/workbook/configurations/format';
import {Filter} from '../../domain/workbook/configurations/filter/filter';
import {UIChartAxis, UIChartColorByValue, UIOption} from '../../common/component/chart/option/ui-option';
import {Modal} from '../../common/domain/modal';
import {Shelf} from '../../domain/workbook/configurations/shelf/shelf';
import {Alert} from '../../common/util/alert.util';
import {StringUtil} from '../../common/util/string.util';
import {DIRECTION} from '../../domain/workbook/configurations/sort';
import {fromEvent} from "rxjs";
import {debounceTime, map} from "rxjs/operators";

@Component({
  selector: 'page-pivot',
  templateUrl: './page-pivot.component.html'
})
export class PagePivotComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private $editFieldLayer: JQuery;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  protected aggregationType = AggregationType;

  // aggregation
  public aggTypeList: any[];

  @ViewChild('editFieldLayer')
  protected editFieldLayerDirective: ClickOutsideDirective;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('uiOption')
  public uiOption: UIOption;

  @Input('widget')
  public widget: PageWidget;

  // Widget Config 데이터
  public widgetConfig: PageWidgetConfiguration;

  // Widget 데이터의 필터 목록 (필드명만 정제)
  public filterFiledList: String[] = [];

  // 현재 에디팅중인 필드
  public editingField: AbstractField;

  // 선택된 선반필드 (Drag & Drop)
  public dragField: AbstractField;

  // Pivot 데이터
  public pivot: Pivot;

  // 차트 타입
  public chartType: string;

  public unavailableShelfs: string[];

  // editingField Alias 임시저장용
  public editingFieldAlias: string;

  // 2Depth 컨텍스트 메뉴 고정여부
  public fix2DepthContext: boolean = false;

  // timestamp type list
  protected timestampTypeList: any[];

  // combine 차트의 현재 선택된 editing 필드의 agg index
  public combineAggIndex: number;

  public globalFilters: Filter[] = [];

  // animation 멈춤여부
  public animationPause: boolean;

  // page layout animation 종료여부
  public finishAnimation: boolean;

  // 확인팝업 띄우기
  @Output()
  public showPopup: EventEmitter<Modal> = new EventEmitter();

  // 데이터 (왼쪽 lnb에서 현재 올라간 선반의 아이콘 제거)
  @Output('deletePivotItem')
  public deletePivotItem: EventEmitter<Object> = new EventEmitter();

  // 데이터 (왼쪽 lnb에서 현재 올라간 선반의 아이콘 제거)
  @Output('changePivotItem')
  public changePivotItem: EventEmitter<Object> = new EventEmitter();

  // Pivot 정보가 바뀐 경우
  @Output('changePivot')
  public changePivotEvent: EventEmitter<any> = new EventEmitter();

  // 데이터를 다시 조회할 필요가 없는 Pivot 변경 이벤트 발생
  @Output('changePivotFilter')
  public changePivotFilterEvent: EventEmitter<any> = new EventEmitter();

  // 선반에 있는 필드의 필터 ON/OFF
  @Output('toggleFilter')
  public toggleFilterEvent: EventEmitter<any> = new EventEmitter();

  // 사용자 정의필드 설정
  @Output('customField')
  public customFieldEvent: EventEmitter<any> = new EventEmitter();

  // 포맷 변경
  @Output('changeFormat')
  public changeFormatEvent: EventEmitter<any> = new EventEmitter();

  @Input('widgetConfig')
  set setWidgetConfig(widgetConfig: PageWidgetConfiguration) {

    // Set
    this.widgetConfig = widgetConfig;

    // 필터 필드목록
    this.filterFiledList = [];
    if (widgetConfig && widgetConfig.filters) {
      for (let filter of widgetConfig.filters) {
        this.filterFiledList.push(filter['field']);
      }
    }
    if (this.globalFilters) {
      for (const filter of this.globalFilters) {
        this.filterFiledList.push(filter.field);
      }
    }


    console.info(this.filterFiledList);
  }

  @Input('shelf')
  public shelf: Shelf;

  @Input('pivot')
  set setPivot(pivot: Pivot) {

    if (pivot === undefined) {
      this.pivot = new Pivot();
      this.pivot.columns = [];
      this.pivot.rows = [];
      this.pivot.aggregations = [];
    } else {
      this.pivot = pivot;
    }

    console.info('pivot!', this.pivot);
    this.changePivot();
  }

  @Input('chartType')
  set setChartType(chartType: string) {

    // 기존 chartType값 설정
    const initChartType = this.chartType;

    console.info(`차트타입이 변경됨 ${this.chartType} => ${chartType}`);
    this.chartType = chartType;

    if (this.chartType) {
      // 차트타입별 불가능한 선반 설정
      this.initUnavailableShelf();

      // 선반 animation 설정, 최초 로드시 animation 설정 x => ngOnInit에서 설정
      if (initChartType && this.$element) this.onShelveAnimation(this.$element.find('.ddp-wrap-default'));
    }
  }


  @Input('globalFilters')
  set setGlobalFilters(filters: Filter[]) {
    if (filters) {
      this.globalFilters = filters;
      for (const filter of filters) {
        this.filterFiledList.push(filter.field);
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

    this.init();

    const resizeEvent$ = fromEvent(window, 'resize')
      .pipe(
        map(() => document.documentElement.clientWidth + 'x' + document.documentElement.clientHeight),
        debounceTime(500)
      );

    const windowResizeSubscribe = resizeEvent$.subscribe((data) => {
      this.onShelveAnimation(this.$element.find('.ddp-wrap-default'));
      console.info('resize pivot! - TODO scrollCheck');
    });

    this.subscriptions.push(windowResizeSubscribe);

    // animation 적용으로 setTimeout 설정
    setTimeout(() => {

      // animation 종료여부
      this.finishAnimation = true;

      // 아이템의 길이가 선반 길이보다 긴경우 prev / next 버튼 show설정
      if (this.$element) this.onShelveAnimation(this.$element.find('.ddp-wrap-default'));
    }, 700);
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
   * 선반정보 변경시
   */
  public changePivot(eventType?: EventType) {

    this.pivot.columns = this.pivot.columns.map(this.checkAlias);
    this.pivot.rows = this.pivot.rows.map(this.checkAlias);
    this.pivot.aggregations = this.pivot.aggregations.map(this.checkAlias);

    this.changePivotEvent.emit({pivot: this.pivot, eventType: eventType});
  }

  /**
   * 차트선택시 차트종류별로 선반 위치 변경
   * @param chartType
   */
  public onChangePivotPosition(chartType: string) {

    // 각 차트마다 선반 위치 변경
    const type: ChartType = ChartType[String(chartType.toUpperCase())] as ChartType;
    switch (type) {

      case ChartType.BAR :
      case ChartType.GRID :
      case ChartType.LINE :
      case ChartType.WATERFALL :
      case ChartType.COMBINE :
      case ChartType.SANKEY :
      case ChartType.CONTROL :

        if (ChartType.BAR == type) {
          // 바차트의 병렬 / 중첩에 따른 pivot 데이터 변경
          this.changeBarStackPivot();
        }
        // 차원값, 측정값의 피봇팅 조건에 따라서 이동 (차원값: 열, 측정값: 교차)
        this.autoPivoting(FieldPivot.COLUMNS, FieldPivot.AGGREGATIONS);
        break;
      case ChartType.HEATMAP :
        // 차원값, 측정값의 피봇팅 조건에 따라서 이동 (차원값: 열, 측정값: 교차)
        this.autoPivoting(FieldPivot.COLUMNS, FieldPivot.AGGREGATIONS);
        // 측정값이 한개이상인경우 제거
        this.moveShelfItemByIndex([String(ShelveFieldType.MEASURE), String(ShelveFieldType.CALCULATED)], 0);
        break;
      case ChartType.PIE :
      case ChartType.RADAR :
      case ChartType.WORDCLOUD :

        // 차원값, 측정값의 피봇팅 조건에 따라서 이동 (차원값: 교차, 측정값: 교차)
        this.autoPivoting(FieldPivot.AGGREGATIONS, FieldPivot.AGGREGATIONS);
        break;

      // 핵심지표
      case ChartType.LABEL :

        // 열 차원값 제거
        this.updatePivotList(this.pivot.columns, FieldPivot.COLUMNS, [String(ShelveFieldType.DIMENSION), String(ShelveFieldType.TIMESTAMP)]);
        // 행 차원값 제거
        this.updatePivotList(this.pivot.rows, FieldPivot.ROWS, [String(ShelveFieldType.DIMENSION), String(ShelveFieldType.TIMESTAMP)]);
        // 교차 차원값 제거
        this.updatePivotList(this.pivot.aggregations, FieldPivot.AGGREGATIONS, [String(ShelveFieldType.DIMENSION), String(ShelveFieldType.TIMESTAMP)]);
        // 차원값, 측정값의 피봇팅 조건에 따라서 이동 (차원값: x, 측정값: 교차)
        this.autoPivoting(null, FieldPivot.AGGREGATIONS);
        break;
      // 열 : 리스트 제거, 교차 : 차원값 제거, 측정값 1개이상=> 1개 빼고 모두 제거
      case ChartType.GAUGE :

        // 차원값, 측정값의 피봇팅 조건에 따라서 이동 (차원값: 행, 측정값: 교차)
        this.autoPivoting(FieldPivot.ROWS, FieldPivot.AGGREGATIONS);
        break;

      case ChartType.SCATTER:

        // 차원값 피봇팅 조건에 따라서 이동 (차원값: 교차)
        this.autoPivoting(FieldPivot.AGGREGATIONS);
        // 측정값이 3개이상인 경우 측정값 2개까지만 남겨놓고 제거
        this.moveShelfItemByIndex([String(ShelveFieldType.MEASURE), String(ShelveFieldType.CALCULATED)], 1, [0], [1]);
        break;

      case ChartType.BOXPLOT:

        // 차원값 : 열(첫번쨰 세번째이후), 행(두번째), 측정값 : 교차
        this.moveShelfItemByIndex([String(ShelveFieldType.DIMENSION), String(ShelveFieldType.TIMESTAMP)], null, [0], [1], 2);
        // 측정값 자동 피봇팅
        this.autoPivoting(null, FieldPivot.AGGREGATIONS);
        break;
      case ChartType.TREEMAP:

        // 차원값 : 열(첫번쨰), 행(두번째이후), 측정값 : 교차
        this.moveShelfItemByIndex([String(ShelveFieldType.DIMENSION), String(ShelveFieldType.TIMESTAMP)], null, [0], [], null, 1);

        // 측정값 자동 피봇팅
        this.autoPivoting(null, FieldPivot.AGGREGATIONS);
        break;
      case ChartType.NETWORK:
        // 차원값: 열(첫번째), 행(두번째), 측정값: 교차
        this.moveShelfItemByIndex([String(ShelveFieldType.DIMENSION), String(ShelveFieldType.TIMESTAMP)], null, [0], [1]);

        // 측정값 자동 피봇팅
        this.autoPivoting(null, FieldPivot.AGGREGATIONS);
        break;
    }

    // timestamp값을 같은선반에 1개이상 들어가지않도록 설정
    this.getUniqTimestampShelve();

  }

  /**
   * 데이터를 다시 조회할 필요가 없는 변경 이벤트 발생
   */
  public changePivotFilter(): void {

    // 데이터
    this.pivot.columns = this.pivot.columns.map(this.checkAlias);
    this.pivot.rows = this.pivot.rows.map(this.checkAlias);
    this.pivot.aggregations = this.pivot.aggregations.map(this.checkAlias);

    // 이벤트 발생
    this.changePivotFilterEvent.emit(this.pivot);
  }

  /**
   * 페이지에서 필드 추가 할때
   * @param {Field} targetField
   * @param {string} targetContainer
   */
  public addField(targetField: Field, targetContainer: string, pivotField: AbstractField) {
    let shelf;

    if (targetContainer === 'column') {
      shelf = this.pivot.columns;
    } else if (targetContainer === 'row') {
      shelf = this.pivot.rows;
    } else if (targetContainer === 'aggregation') {
      shelf = this.pivot.aggregations;
    } else {
      console.info('정의되지 않은 drop', targetContainer);
      return;
    }

    if (targetField) {
      shelf.push(targetField);
      this.convertField(targetField, targetContainer);
    }
  }

  /**
   * 선반 삭제
   * @param shelf
   * @param {number} idx
   */
  public removeField(event: any, fieldPivot: FieldPivot, shelf, idx: number) {

    // 선반에서 필드제거
    let field: AbstractField = shelf.splice(idx, 1)[0];

    // if (shelf[idx]) {
    // let aggregationType = shelf[idx].aggregationType;

    // aggregationTypeList에서 해당 aggregationType 제거
    // shelf.forEach((item) => {
    //   _.remove(item.aggregationTypeList, aggregationType);
    // })
    // }

    // 필드의 선반정보 제거
    field.field.pivot.splice(field.field.pivot.indexOf(fieldPivot), 1);

    // 필드의 Alias정보 제거
    // delete field.field.pivotAlias;

    // 해당 선반을 타겟으로 잡기
    if (event) {
      let target = $(event.currentTarget.parentElement.parentElement.parentElement.parentElement);

      // 선반 total width 설정, 애니메이션 여부 설정
      this.onShelveAnimation(target);
    }

    // 이벤트
    this.changePivot(EventType.CHANGE_PIVOT);
  }

  /**
   * 선반에 있는 필드 중 선반용 필드가 아닌 것들을 변환
   * @param targetField
   * @param targetContainer
   * @param addPivotFl pivot 리스트 추가 여부 (false pivot 리스트 추가하지 않음, true pivot 리스트 추가)
   */
  public convertField(targetField: Field, targetContainer: string, addPivotFl: boolean = true) {

    // 선반에 올린것 표시
    let shelf;
    // animation에 사용할 선반 element 설정
    let shelfElement: JQuery;

    if (targetContainer === 'column') {
      shelf = this.pivot.columns;
      shelfElement = this.$element.find('#shelfColumn');
    } else if (targetContainer === 'row') {
      shelf = this.pivot.rows;
      shelfElement = this.$element.find('#shelfRow');
    } else if (targetContainer === 'aggregation') {
      shelf = this.pivot.aggregations;
      shelfElement = this.$element.find('#shelfAggregation');
    } else {
      console.info('정의되지 않은 drop', targetContainer);
      return;
    }

    const idx = shelf.findIndex((field) => {
      return field.name === targetField.name && targetField.role === field.role;
    });

    if (idx > -1) {
      let field;

      // timestamp biType이거나, biType이 dimension이면서 logicalType이 timestamp인 경우
      if (targetField.role === FieldRole.TIMESTAMP ||
        (targetField.role === FieldRole.DIMENSION && targetField.logicalType === LogicalType.TIMESTAMP)) {

        // 타입필드로 설정
        const timeField = new TimestampField();
        //timeField.alias = timeField.granularity.toString().toUpperCase() + `(${targetField.name})`;
        field = timeField;
      } else if (targetField.role === FieldRole.DIMENSION) {
        field = new DimensionField();
      } else if (targetField.role === FieldRole.MEASURE) {
        // default로 aggregationType은 SUM으로 설정
        field = new MeasureField();
        field.aggregated = targetField.aggregated;
      }
      field.name = targetField.name;
      field.subType = targetField.type;
      field.subRole = targetField.role;
      //field.pivot = pivot;
      field.expr = targetField.expr;
      field.field = targetField;

      if (targetField.name !== targetField.alias
        && (!targetField.nameAlias || targetField.nameAlias.nameAlias !== targetField.alias)) {
        field.alias = targetField.alias;
      }
      (targetField.nameAlias) && (field.fieldAlias = targetField.nameAlias.nameAlias);
      field.granularity = targetField.granularity;
      field.segGranularity = targetField.segGranularity;
      if (!_.isUndefined(targetField.ref)) {
        field.ref = targetField.ref;
      } else if (targetField.type == 'user_expr') {
        field.ref = 'user_defined';
      }

      // 현재 드래그된 필드
      this.dragField = field;

      shelf[idx] = field;

      // 모든선반설정
      const shelves = this.pivot.rows.concat(this.pivot.columns.concat(this.pivot.aggregations));

      // 선반의 dimension / measure값의 중복된값 제거, measure aggtype 설정
      if (!this.distinctPivotItems(shelves, field, idx, shelf, targetContainer)) {

        // distinctPivotItem에서 설정된 타입 targetField에 설정
        targetField.format = shelf[idx].format;

        // 선반에 추가표시
        targetField.pivot = targetField.pivot ? targetField.pivot : [];
        if (targetContainer === 'column') {
          if (addPivotFl) targetField.pivot.push(FieldPivot.COLUMNS);
          field.currentPivot = FieldPivot.COLUMNS;
        } else if (targetContainer === 'row') {
          if (addPivotFl) targetField.pivot.push(FieldPivot.ROWS);
          field.currentPivot = FieldPivot.ROWS;
        } else if (targetContainer === 'aggregation') {
          if (addPivotFl) targetField.pivot.push(FieldPivot.AGGREGATIONS);
          field.currentPivot = FieldPivot.AGGREGATIONS;
        }

        // Measure일 경우
        if (field instanceof MeasureField) {
          // Format 적용
          field.format = {
            type: _.isUndefined(this.uiOption.valueFormat) || _.isUndefined(this.uiOption.valueFormat.type) ? String(UIFormatType.NUMBER) : this.uiOption.valueFormat.type,
            sign: _.isUndefined(this.uiOption.valueFormat) || _.isUndefined(this.uiOption.valueFormat.sign) ? String(UIFormatCurrencyType.KRW) : this.uiOption.valueFormat.sign,
            decimal: _.isUndefined(this.uiOption.valueFormat) || _.isUndefined(this.uiOption.valueFormat.decimal) ? 2 : this.uiOption.valueFormat.decimal,
            useThousandsSep: _.isUndefined(this.uiOption.valueFormat) || _.isUndefined(this.uiOption.valueFormat.useThousandsSep) ? true : this.uiOption.valueFormat.useThousandsSep,
            abbr: _.isUndefined(this.uiOption.valueFormat) || _.isUndefined(this.uiOption.valueFormat.abbr) ? String(UIFormatNumericAliasType.NONE) : this.uiOption.valueFormat.abbr,
            customSymbol: _.isUndefined(this.uiOption.valueFormat) || _.isUndefined(this.uiOption.valueFormat.customSymbol)
              ? null
              : this.uiOption.valueFormat.customSymbol
          }
        }
      }

      // 차트별 선반 조건에 따른 차원 / 측정값 제한설정
      this.chartShelveLimit(this.chartType, targetContainer, shelf);

      // 선반 정보 변경시 (선반피봇팅 조건 이미 설정하였으므로 true)
      this.changePivot(EventType.CHANGE_PIVOT);

      // 선반 total width 설정, 애니메이션 여부 설정
      if (shelfElement) this.onShelveAnimation(shelfElement.find('.ddp-wrap-default'));
    }

    // template 에서 생성한 경우 추가된 선반필드는 적용이 되지 않음 그래서 처리
    this.editFieldLayerDirective.exclude = '.ddp-icon-layer';
  }

  /**
   * Datasource Field의 선반 위치정보 수정
   * @param targetField
   * @param targetContainer
   */
  public changeFieldPivot(targetField: Field, targetContainer: string, pivotField: AbstractField): void {

    targetField.pivot = targetField.pivot ? targetField.pivot : [];

    let shelf;
    let pivot: FieldPivot;

    // animation에 사용할 선반 element 설정
    let shelfElement: JQuery;

    if (targetContainer === 'column') {
      pivot = FieldPivot.COLUMNS;
      shelf = this.pivot.columns;
      shelfElement = this.$element.find('#shelfColumn');
    } else if (targetContainer === 'row') {
      pivot = FieldPivot.ROWS;
      shelf = this.pivot.rows;
      shelfElement = this.$element.find('#shelfRow');
    } else if (targetContainer === 'aggregation') {
      pivot = FieldPivot.AGGREGATIONS;
      shelf = this.pivot.aggregations;
      shelfElement = this.$element.find('#shelfAggregation');
    }

    // 선반의 위치가 다른선반으로 이동시에만 설정
    if (pivotField.currentPivot !== pivot) {

      // 타임스탬프일때
      if (targetField.role === FieldRole.TIMESTAMP ||
        (targetField.role === FieldRole.DIMENSION && targetField.logicalType === LogicalType.TIMESTAMP)) {

        const timestampIndex = shelf.findIndex((field) => {
          return field.name === targetField.name && targetField.role === field.field.role && targetField.granularity === field.granularity && -1 !== targetField.format['type'].indexOf('time');
        });

        // 같은 timestamp의 다른타입이 한선반에 들어간경우
        if (-1 !== timestampIndex) {

          // 그리드를 제외한 같은선반에 timestamp가 2개이상 들어가지 못하게 설정
          let duplicateFieldFl: boolean = false;
          if ('grid' !== this.chartType) {
            duplicateFieldFl = this.deleteDuplicatedField(targetField, timestampIndex, targetContainer);
          }

          // 중복이 아닐때에만 해당 선반에 추가
          if (!duplicateFieldFl) {
            // 기존의 피봇값 제거
            targetField.pivot.splice(targetField.pivot.indexOf(pivotField.currentPivot), 1);
            // 이동된 피봇의값을 추가
            targetField.pivot.push(pivot);
            // 현재피봇값 변경
            pivotField.currentPivot = pivot;
          }
        }
        // 타임스탬프가 아닐때
      } else {

        // 기존의 피봇값 제거
        targetField.pivot.splice(targetField.pivot.indexOf(pivotField.currentPivot), 1);
        // 이동된 피봇의값을 추가
        targetField.pivot.push(pivot);
        // 현재피봇값 변경
        pivotField.currentPivot = pivot;
      }
    }

    // 차트별 선반 조건에 따른 차원 / 측정값 제한설정
    this.chartShelveLimit(this.chartType, targetContainer, shelf);

    // 선반 정보 변경시 (선반피봇팅 조건 이미 설정하였으므로 true)
    this.changePivot(EventType.CHANGE_PIVOT);

    // 선반 total width 설정, 애니메이션 여부 설정
    if (shelfElement) this.onShelveAnimation(shelfElement.find('.ddp-wrap-default'));
  }

  /**
   * Show value on chart 변경 핸들러
   * @param showValue
   */
  public onChangeShowValue(showValue: boolean): void {

    // Show Value On / Off 변경
    this.editingField.showValue = showValue;

    // 이벤트 발생
    this.changePivotFilter();
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

    // 이벤트 발생
    this.toggleFilterEvent.emit(this.editingField);
  }

  /**
   * 사용자 정의 필드 Expresion 표현형태로 치환
   * @param expr
   * @returns {string}
   */
  public unescapeCustomColumnExpr(expr: string) {
    return StringUtil.unescapeCustomColumnExpr(expr);
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
      this.changeFormatEvent.emit(field);
    } else {
      this.fix2DepthContext = false;
      this.editingField = null;
      this.changeFormatEvent.emit(null);
    }
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

    this.changePivot();
  }

  /**
   * 타입(행, 열, 교차)에 따른 가이드 표시여부 반환
   * @param type
   */
  public isGuide(type: string): boolean {

    // 차트 타입 선택전이라면 false 반환
    if (this.chartType == '') {
      return false;
    }

    // 행
    if (_.eq(type, ShelveType.COLUMNS)) {
      // 1 or more dimension
      if (_.eq(this.chartType, ChartType.BAR)
        || _.eq(this.chartType, ChartType.LINE)
        || _.eq(this.chartType, ChartType.HEATMAP)
        || _.eq(this.chartType, ChartType.BOXPLOT)
        || _.eq(this.chartType, ChartType.COMBINE)
        || _.eq(this.chartType, ChartType.SANKEY)
        || _.eq(this.chartType, ChartType.GRID)) {
        return true;
      }
      // 1 measure
      else if (_.eq(this.chartType, ChartType.SCATTER)) {

        // 개수체크
        let count: number = 0;
        for (let field of this.pivot.columns) {
          if (_.eq(field.type, ShelveFieldType.MEASURE) || _.eq(field.type, ShelveFieldType.CALCULATED)) {
            count++;
          }
        }
        return count != 1;
      }
      // 1 time dimension
      else if (_.eq(this.chartType, ChartType.CONTROL)
        || _.eq(this.chartType, ChartType.WATERFALL)) {

        // 개수체크
        let count: number = 0;
        for (let field of this.pivot.columns) {
          if (_.eq(field.type, ShelveFieldType.TIMESTAMP)) {
            count++;
          }
        }
        return count != 1;
      }
      // 1 dimension
      // TODO 태호: 차후 네트워크 차트 수치값 적용시 1-2 dimension
      else if (_.eq(this.chartType, ChartType.NETWORK)
        || _.eq(this.chartType, ChartType.TREEMAP)) {

        // 개수체크
        let count: number = 0;
        for (let field of this.pivot.columns) {
          if (_.eq(field.type, ShelveFieldType.DIMENSION) || _.eq(field.type, ShelveFieldType.TIMESTAMP)) {
            count++;
          }
        }
        return count != 1;
      }
    }
    // 열
    if (_.eq(type, ShelveType.ROWS)) {
      // 1 or more dimension
      if (_.eq(this.chartType, ChartType.HEATMAP)
        || _.eq(this.chartType, ChartType.GRID)
        || _.eq(this.chartType, ChartType.TREEMAP)
        || _.eq(this.chartType, ChartType.GAUGE)) {
        return true;
      }
      // 1 measure
      else if (_.eq(this.chartType, ChartType.SCATTER)) {

        // 개수체크
        let count: number = 0;
        for (let field of this.pivot.rows) {
          if (_.eq(field.type, ShelveFieldType.MEASURE) || _.eq(field.type, ShelveFieldType.CALCULATED)) {
            count++;
          }
        }
        return count != 1;
      }
      // 1 dimension
      // TODO 태호: 차후 네트워크 차트 수치값 적용시 1-2 dimension
      else if (_.eq(this.chartType, ChartType.NETWORK)
        || _.eq(this.chartType, ChartType.BOXPLOT)) {

        // 개수체크
        let count: number = 0;
        for (let field of this.pivot.rows) {
          if (_.eq(field.type, ShelveFieldType.DIMENSION) || _.eq(field.type, ShelveFieldType.TIMESTAMP)) {
            count++;
          }
        }
        return count != 1;
      }
    }
    // 교차
    if (_.eq(type, ShelveType.AGGREGATIONS)) {
      // 1 or more measure
      // 1 measure & 1 or more dimension
      // 1 or more measure & 1 or more dimension
      // 2 or more measure
      if (_.eq(this.chartType, ChartType.BAR)
        || _.eq(this.chartType, ChartType.LINE)
        || _.eq(this.chartType, ChartType.SCATTER)
        || _.eq(this.chartType, ChartType.LABEL)
        || _.eq(this.chartType, ChartType.WORDCLOUD)
        || _.eq(this.chartType, ChartType.RADAR)
        || _.eq(this.chartType, ChartType.GRID)) {
        return true;
      }
      // no dimension or more dimensions, no measure or more measures
      else if (_.eq(this.chartType, ChartType.PIE)) {

        // check count
        let dCount: number = 0;
        let mCount: number = 0;
        for (let field of this.pivot.aggregations) {
          if (_.eq(field.type, ShelveFieldType.DIMENSION)) {
            dCount++;
          }
        }

        for (let field of this.pivot.aggregations) {
          if (_.eq(field.type, ShelveFieldType.MEASURE) || _.eq(field.type, ShelveFieldType.CALCULATED)) {
            mCount++;
          }
        }
        return dCount == 0 || dCount > 1 || mCount == 0 || mCount > 1;
      }
      // 1 measure
      else if (_.eq(this.chartType, ChartType.HEATMAP)
        || _.eq(this.chartType, ChartType.WATERFALL)
        || _.eq(this.chartType, ChartType.NETWORK)
        || _.eq(this.chartType, ChartType.BOXPLOT)
        || _.eq(this.chartType, ChartType.SANKEY)
        || _.eq(this.chartType, ChartType.GAUGE)
        || _.eq(this.chartType, ChartType.TREEMAP)) {

        // 개수체크
        let count: number = 0;
        for (let field of this.pivot.aggregations) {
          if (_.eq(field.type, ShelveFieldType.MEASURE) || _.eq(field.type, ShelveFieldType.CALCULATED)) {
            count++;
          }
        }
        return count != 1;
      }
      // 1 time dimension
      else if (_.eq(this.chartType, ChartType.CONTROL)) {

        // 개수체크
        let count: number = 0;
        for (let field of this.pivot.aggregations) {
          if (_.eq(field.type, ShelveFieldType.TIMESTAMP)) {
            count++;
          }
        }
        return count != 1;
      }
      // 2~4 measure
      else if (_.eq(this.chartType, ChartType.COMBINE)) {

        // 개수체크
        let count: number = 0;
        for (let field of this.pivot.aggregations) {
          if (_.eq(field.type, ShelveFieldType.MEASURE) || _.eq(field.type, ShelveFieldType.CALCULATED)) {
            count++;
          }
        }
        return count < 2 || count > 4;
      }
    }

    return false;
  }

  /**
   * 타입(행, 열, 교차)에 따른 가이드 문구 반환
   * @param type
   */
  public getGuideText(type: string, isText: boolean = true): string {

    // 차트 타입 선택전이라면 공백 반환
    if (this.chartType == '') {
      return '';
    }

    // 행
    if (_.eq(type, ShelveType.COLUMNS)) {
      // 1 or more dimension
      if (_.eq(this.chartType, ChartType.BAR)
        || _.eq(this.chartType, ChartType.LINE)
        || _.eq(this.chartType, ChartType.HEATMAP)
        || _.eq(this.chartType, ChartType.BOXPLOT)
        || _.eq(this.chartType, ChartType.COMBINE)
        || _.eq(this.chartType, ChartType.GRID)) {

        return isText ? this.translateService.instant('msg.page.pivot.layout.condition.dimension.over.desc', {value: '1'}) : 'ddp-box-dimension';
      }
      // 1 measure
      else if (_.eq(this.chartType, ChartType.SCATTER)) {

        return isText ? this.translateService.instant('msg.page.pivot.layout.condition.measure.desc', {value: '1'}) : 'ddp-box-measure';
      }
      // 1 time dimension
      else if (_.eq(this.chartType, ChartType.CONTROL)
        || _.eq(this.chartType, ChartType.WATERFALL)) {

        return isText ? this.translateService.instant('msg.page.pivot.layout.condition.dimension.desc', {value: '1'}) : 'ddp-box-dimension';
      }
      // 1 dimension
      // TODO 태호: 차후 네트워크 차트 수치값 적용시 1-2 dimension
      else if (_.eq(this.chartType, ChartType.NETWORK)
        || _.eq(this.chartType, ChartType.TREEMAP)) {

        return isText ? this.translateService.instant('msg.page.pivot.layout.condition.dimension.desc', {value: '1'}) : 'ddp-box-dimension';
      }
      // 3 or more dimension
      else if (_.eq(this.chartType, ChartType.SANKEY)) {
        return isText ? this.translateService.instant('msg.page.pivot.layout.condition.dimension.over.desc', {value: '2'}) : 'ddp-box-dimension';
      }
    }
    // 열
    if (_.eq(type, ShelveType.ROWS)) {
      // 1 or more dimension
      if (_.eq(this.chartType, ChartType.HEATMAP)
        || _.eq(this.chartType, ChartType.GRID)
        || _.eq(this.chartType, ChartType.TREEMAP)
        || _.eq(this.chartType, ChartType.GAUGE)) {

        return isText ? this.translateService.instant('msg.page.pivot.layout.condition.dimension.over.desc', {value: '1'}) : 'ddp-box-dimension';
      }
      // 1 measure
      else if (_.eq(this.chartType, ChartType.SCATTER)) {

        return isText ? this.translateService.instant('msg.page.pivot.layout.condition.measure.desc', {value: '1'}) : 'ddp-box-measure';
      }
      // 1 dimension
      // TODO 태호: 차후 네트워크 차트 수치값 적용시 1-2 dimension
      else if (_.eq(this.chartType, ChartType.NETWORK)
        || _.eq(this.chartType, ChartType.BOXPLOT)) {

        return isText ? this.translateService.instant('msg.page.pivot.layout.condition.dimension.desc', {value: '1'}) : 'ddp-box-dimension';
      }
    }
    // 교차
    if (_.eq(type, ShelveType.AGGREGATIONS)) {
      // 1 or more measure
      if (_.eq(this.chartType, ChartType.BAR)
        || _.eq(this.chartType, ChartType.LINE)
        || _.eq(this.chartType, ChartType.LABEL)
        || _.eq(this.chartType, ChartType.CONTROL)
        || _.eq(this.chartType, ChartType.GRID)) {

        return isText ? this.translateService.instant('msg.page.pivot.layout.condition.measure.over.desc', {value: '1'}) : 'ddp-box-measure';
      }
      // 1 measure & 1 or more dimension
      else if (_.eq(this.chartType, ChartType.WORDCLOUD)) {

        return isText
          ? this.translateService.instant('msg.page.pivot.layout.condition.measure.desc', {value: '1'}) + this.translateService.instant('msg.page.pivot.layout.condition.dimension.and.over.desc', {value: '1'})
          : 'ddp-box-measure';
      }
      // 1 or more measure & 1 or more dimension
      else if (_.eq(this.chartType, ChartType.PIE)) {

        return isText
          ? this.translateService.instant('msg.page.pivot.layout.condition.measure.desc', {value: '1'}) + this.translateService.instant('msg.page.pivot.layout.condition.dimension.and.desc', {value: '1'})
          : 'ddp-box-measure';
      }
      // 1 or more measure & 1 dimension
      else if (_.eq(this.chartType, ChartType.RADAR)) {

        return isText
          ? this.translateService.instant('msg.page.pivot.layout.condition.measure.over.desc', {value: '1'}) + this.translateService.instant('msg.page.pivot.layout.condition.dimension.and.desc', {value: '1'})
          : 'ddp-box-measure';
      }
      // 2~4 measure
      else if (_.eq(this.chartType, ChartType.COMBINE)) {

        return isText
          ? this.translateService.instant('msg.page.pivot.layout.condition.measure.range', {
            valueFirst: '2',
            valueSecond: '4'
          })
          : 'ddp-box-measure';
      }
      // 1 measure
      else if (_.eq(this.chartType, ChartType.HEATMAP)
        || _.eq(this.chartType, ChartType.WATERFALL)
        || _.eq(this.chartType, ChartType.NETWORK)
        || _.eq(this.chartType, ChartType.BOXPLOT)
        || _.eq(this.chartType, ChartType.SANKEY)
        || _.eq(this.chartType, ChartType.GAUGE)
        || _.eq(this.chartType, ChartType.TREEMAP)) {

        return isText ? this.translateService.instant('msg.page.pivot.layout.condition.measure.desc', {value: '1'}) : 'ddp-box-measure';
      }
      // 1 or more dimension
      else if (_.eq(this.chartType, ChartType.SCATTER)) {

        return isText ? this.translateService.instant('msg.page.pivot.layout.condition.dimension.over.desc', {value: '1'}) : 'ddp-box-dimension';
      }
    }

    return '';
  }

  /**
   * 표시용 피봇 이름 반환
   * @param {Field} field
   * @return {string}
   */
  public getDisplayPivotName(field: AbstractField): string {
    if (field.alias) {
      return field.alias;
    } else {
      return (field.fieldAlias) ? field.fieldAlias : field.name;
    }
  } // function - getDisplayPivotName

  /**
   * call method from pivot context
   * @param data
   */
  public subscribeFromPivotContext(data: any) {

    let type = data['type'];

    switch (type) {
      case 'toggleFilter':
        this.toggleFilterEvent.emit(data.value);
        break;
      case 'format':
        this.changeFormatEvent.emit(data.value);
        break;
      case 'pivotFilter':
        this.changePivotFilter();
        break;
      case 'customField':
        this.customFieldEvent.emit(data.value);
        break;
      case 'changePivot':
        this.changePivot(data['value']);
        break;
      case 'showPopup':
        this.showPopup.emit(data.value);
        break;
      case 'onSetGranularity':
        let value = data.value;
        this.onSetGranularity(value.discontinuous, value.unit, value.byUnit);
        break;
      case 'outside':
        this.editingField = data.value;
        break;
    }
  }

  /**
   * 별칭에 대한 placeholder 문구 조회
   * @param {Field} field
   * @return {string}
   */
  public getAliasPlaceholder(field: AbstractField): string {
    const displayName: string = (field.fieldAlias) ? field.fieldAlias : field.name;
    return (field['aggregationType']) ? (field['aggregationType'] + '(' + displayName + ')') : displayName;
  } // function - getAliasPlaceholder

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

    // 중복체크
    let duppIndex: number = _.findIndex(_.concat(this.pivot.columns, this.pivot.rows, this.pivot.aggregations), (item) => {
      return item.pivotAlias == this.editingFieldAlias || item.fieldAlias == this.editingFieldAlias;
    });
    if (duppIndex == -1) {
      this.widget.dashBoard.configuration['fields'].forEach((field, index) => {
        if (field.nameAlias && field.nameAlias['nameAlias'] == this.editingFieldAlias) {
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
    this.changePivot();
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
    this.changePivot();
  }

  /**
   * 마우스 오버시 필드 별칭 입력 초기값 설정
   * @param {Field} editingField
   */
  public setEditingFieldAlias(editingField: AbstractField) {
    if (this.isSetPivotAlias(editingField)) {
      if (editingField.pivotAlias) {
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
      return (editingField.alias && editingField.alias !== editingField.name
        && editingField.fieldAlias !== editingField.alias);
    }
  } // function - isSetPivotAlias

  /**
   * 사용 가능한 Granularity인지 여부 editingField로 호출
   * @param discontinuous
   * @param unit
   * @param byUnit
   */
  public isUseGranularity(discontinuous: boolean, unit: string, byUnit?: string): boolean {

    return this.useGranularity(discontinuous, unit, this.editingField.granularity, byUnit);
  }

  /////////////////////////////////////////////////////////////
  //////// 애니메이션 관련
  /////////////////////////////////////////////////////////////
  /**
   * animation 이전버튼에 마우스 오버시
   */
  public mouseOverPrev(event: any) {

    // 애니메이션 동작설정 true
    this.animationPause = false;

    let scope = this;

    // 선반에 animation 설정
    $(event.currentTarget.parentElement).find('.ddp-wrap-default').animate({marginLeft: 0}, {
      duration: 1500, step: function () {

        if (scope.animationPause) {
          $(this).stop();
        }
      }
    });
  }

  /**
   * animation 다음버튼에 마우스 오버시
   */
  public mouseOverNext(event: any) {

    // 애니메이션 동작설정 true
    this.animationPause = false;

    let scope = this;

    const $currentShelve = $(event.currentTarget.parentElement);

    let totalWidth = this.getShelveTotalWidth($currentShelve);

    // animation width 설정
    let moveWidth = totalWidth - $currentShelve.find('.ddp-ui-drag-slide-in').width();

    // 선반에 animation 설정
    $(event.currentTarget.parentElement).find('.ddp-wrap-default').animate({marginLeft: -moveWidth - 80}, {
      duration: 1500, step: function () {

        if (scope.animationPause) {
          $(this).stop();
        }
      }
    });

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
    this.changePivot();
  }

  /**
   * 변경된 granularity를 반영
   */
  public onSetGranularity(discontinuous: boolean, unit: string, byUnit?: string) {

    // disabled된 granularity 선택시 return
    if (this.editingField.granularityList &&
      -1 !== this.editingField.granularityList.indexOf(unit)) {
      return;
    }

    this.editingField.format = new Format();
    this.editingField.format.type = String(UIFormatType.TIME_CONTINUOUS);
    this.editingField.format.discontinuous = discontinuous;
    this.editingField.format.unit = TimeUnit[unit];
    if (discontinuous) {
      this.editingField.format.byUnit = ByTimeUnit[byUnit];
    }

    this.changePivot(EventType.GRANULARITY);
  }

  /**
   * 아이템의 길이가 선반 길이보다 긴경우 prev / next 버튼 show설정
   */
  public onShelveAnimation(element: JQuery) {

    if (!this.changeDetect['destroyed']) {
      // 선반의 아이템들이 나오게 설정
      this.changeDetect.detectChanges();
    }

    let scope = this;

    // 선반의 길이에따라 animation 설정
    element.each(function () {

      // animation total width 설정
      let totalWidth = scope.getShelveTotalWidth($(this));

      // total width 설정 (드래그시 아래로 떨어지는걸 방지하기위해서 drag item width인 150을 더해주기)
      $(this).css('width', totalWidth + 150);

      // prev / next 버튼 show / hide 설정
      if (totalWidth > $(this).parent('.ddp-ui-drag-slide-in').width()) {

        $(this).parent().parent().find('.ddp-btn-prev').show();
        $(this).parent().parent().find('.ddp-btn-next').show();
        $(this).css('padding', '0 40px');
      }
      if (totalWidth <= $(this).parent('.ddp-ui-drag-slide-in').width()) {
        $(this).parent().parent().find('.ddp-btn-prev').hide();
        $(this).parent().parent().find('.ddp-btn-next').hide();
        $(this).css('padding', '0px');

        // marginLeft 초기화 설정
        $(this).css('marginLeft', 0);
      }
    })
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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
    } else {
      return false;
    }
  }

  protected onClickedOutside(event) {
    console.info(event);
    this.editingField = null;
  }

  /**
   * field setting
   */
  protected fieldSetting(shelves: AbstractField[]) {

    // type이 measure일떄
    if ('measure' == this.editingField.type) {

      let aggregationTypeList = [];

      // 선반에서 같은 필드값을 찾기
      for (const item of shelves) {

        // percentile의 경우 option에 값을 넣어줌
        if (this.editingField.type == item.type && this.editingField.alias == item.alias && this.editingField.name == item.name) {

          aggregationTypeList.push(item.aggregationType);
        }
      }

      // 현재 aggregationType을 리스트에서 제거
      const index = aggregationTypeList.indexOf(this.editingField.aggregationType);
      if (-1 !== index) aggregationTypeList.splice(index, 1);

      this.editingField.aggregationTypeList = aggregationTypeList;

      // type이 timestamp일때
    } else if ('timestamp' == this.editingField.type) {

      let granularityList = [];

      // 선반에서 같은 필드값을 찾기
      for (const item of shelves) {

        // percentile의 경우 option에 값을 넣어줌
        if (this.editingField.type == item.type && this.editingField.alias == item.alias && this.editingField.name == this.editingField.name) {

          granularityList.push(item.format.unit);
        }
      }

      // 현재 editingField의 granularity 제거
      const index = granularityList.indexOf(this.editingField.format.unit);
      if (-1 !== index) granularityList.splice(index, 1);

      // continuous type일때 continuous granularity list 설정
      this.editingField.granularityList = granularityList;
    }

    // combine차트일때 교차선반의 index 찾기
    if (this.pivot && this.pivot.aggregations) this.combineAggIndex = this.pivot.aggregations.indexOf(this.editingField);

    const $this = $(event.currentTarget);
    // this.$editFieldLayer.show();
    console.info('openFieldSetting', this.$editFieldLayer.width(), $this.offset());

    if ($this.offset().left > $(window).width() / 2) {
      this.$editFieldLayer.css(
        {
          top: $this.offset().top + 17,
          // left: $this.offset().left - 252 + 30
          left: $this.offset().left - this.$editFieldLayer.width() + 30 - this.$window.scrollLeft()
        });
    } else {
      this.$editFieldLayer.css(
        {
          top: $this.offset().top + 17,
          left: $this.offset().left - 30 - this.$window.scrollLeft()
        });
    }
  }

  /**
   * 선반 내 더보기
   * @param event
   * @param field
   */
  protected openFieldSetting(event, field) {
    if (this.editingField === field) {
      this.editingField = null;
      // this.$editFieldLayer.hide();
      return;
    }

    this.editingField = field;

    // 모든선반에서 같은 field aggregation Type 설정
    let shelves = this.pivot.aggregations.concat(this.pivot.rows.concat(this.pivot.columns));

    // type이 measure일떄
    if ('measure' == this.editingField.type) {

      let aggregationTypeList = [];

      // 선반에서 같은 필드값을 찾기
      for (const item of shelves) {

        // percentile의 경우 option에 값을 넣어줌
        if (this.editingField.type == item.type && this.editingField.alias == item.alias && this.editingField.name == item.name) {

          aggregationTypeList.push(item.aggregationType);
        }
      }

      // 현재 aggregationType을 리스트에서 제거
      const index = aggregationTypeList.indexOf(this.editingField.aggregationType);
      if (-1 !== index) aggregationTypeList.splice(index, 1);

      this.editingField.aggregationTypeList = aggregationTypeList;

      // type이 timestamp일때
    } else if ('timestamp' == this.editingField.type) {

      let granularityList = [];

      // 선반에서 같은 필드값을 찾기
      for (const item of shelves) {

        // percentile의 경우 option에 값을 넣어줌
        if (this.editingField.type == item.type && this.editingField.alias == item.alias && this.editingField.name == this.editingField.name) {

          granularityList.push(item.format.unit);
        }
      }

      // 현재 editingField의 granularity 제거
      const index = granularityList.indexOf(this.editingField.format.unit);
      if (-1 !== index) granularityList.splice(index, 1);

      // continuous type일때 continuous granularity list 설정
      this.editingField.granularityList = granularityList;
    }

    // combine차트일때 교차선반의 index 찾기
    if (this.pivot && this.pivot.aggregations) this.combineAggIndex = this.pivot.aggregations.indexOf(this.editingField);

    const $this = $(event.currentTarget);
    // this.$editFieldLayer.show();
    console.info('openFieldSetting', this.$editFieldLayer.width(), $this.offset());

    if ($this.offset().left > $(window).width() / 2) {
      this.$editFieldLayer.css(
        {
          top: $this.offset().top + 17,
          // left: $this.offset().left - 252 + 30
          left: $this.offset().left - this.$editFieldLayer.width() + 30 - this.$window.scrollLeft()
        });
    } else {
      this.$editFieldLayer.css(
        {
          top: $this.offset().top + 17,
          left: $this.offset().left - 30 - this.$window.scrollLeft()
        });
    }
  }

  protected onDropSuccess(field: Field, shelf) {
    // TODO event에 path 속성에 0번째 내용으로 어디에 Drop했는지 체크해서 해당 영역에 추가

    // const field: Field = event.dragData;

    console.info('onDropSuccess', field, shelf);

    let targetShelf;
    if ('column' === shelf) {
      targetShelf = this.pivot.columns;

    } else if ('row' === shelf) {
      targetShelf = this.pivot.rows;

    } else if ('aggregation' === shelf) {
      targetShelf = this.pivot.aggregations;
    }

    let targetField;

    if (field instanceof AbstractField) {
      console.info('AbstractField', field);

    } else {

      if (field.role === FieldRole.DIMENSION) {
        targetField = new DimensionField();
      } else if (field.role === FieldRole.MEASURE) {
        targetField = new MeasureField();
        targetField.aggregationType = !field.aggregated ? AggregationType.SUM : AggregationType.NONE;
      } else if (field.role === FieldRole.TIMESTAMP) {
        targetField = new TimestampField();
      }
      targetField.name = field.name;
      targetField.expr = field.expr ? field.expr.replace(new RegExp('"', 'g'), '').trim() : '';
      targetField.alias = field.alias;


      // TODO 중복인 경우 처리 필요, 타입에 따라 비교하는 로직이 달라야 함

      targetShelf.push(targetField);

    }

    this.changePivot(EventType.CHANGE_PIVOT);
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

    this.changePivot(EventType.AGGREGATION);

  }

  protected onChangeOrder(direction: string) {

    this.editingField.direction = DIRECTION[direction];
    // 기존의 마지막 Sort를 제거한다.
    _.concat(this.pivot.columns, this.pivot.rows, this.pivot.aggregations).forEach((item) => {
      delete item.lastDirection;
    });
    this.editingField.lastDirection = true;

    this.changePivot();
  }

  protected hasAlign(direction: string) {
    if (direction === 'NONE' && !this.editingField.hasOwnProperty('direction')) {
      return true;
    }
    return this.editingField.direction === DIRECTION[direction];
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
        data: {discontinuous: discontinuous, unit: unit, byUnit: byUnit},
        eventType: EventType.GRANULARITY
      }

      // 확인팝업 띄우기
      this.showPopup.emit(modal);
      return;
    }

    this.onSetGranularity(discontinuous, unit, byUnit);
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

  protected isGranularitySelected(field: AbstractField, discontinuous: boolean, unit: string, byUnit?: string) {

    if (_.isUndefined(field.format)) {
      return false;
    }

    if (!discontinuous) {
      return (!field.format.discontinuous && field.format.unit == TimeUnit[unit]);
    } else {
      return (field.format.discontinuous && field.format.unit == TimeUnit[unit])
        && (!byUnit || (byUnit && field.format.byUnit == ByTimeUnit[byUnit]));
    }
  }

  protected onSortSuccess(event) {
    console.info('onSortSuccess', event);
  }

  protected checkAlias(field: AbstractField) {

    if (['measure', 'calculated'].indexOf(field.type) > -1) {
      // TODO 계산식인경우 field.aggregated 여부에 따라 기본값 세팅
      if (field.type === 'calculated') {
        console.info('TODO 계산식인경우 field.aggregated 여부에 따라 기본값 세팅');
      }
      const aggType = _.isUndefined(field.aggregationType) ? 'SUM' : field.aggregationType;
      // field.alias = `${aggType}(${field.name})`;
    }

    // TODO 사용자 정의 alias가 있는 경우 처리
    return field;
  }

  /**
   * 각 선반에서 같은 아이템이 있는지 체크
   */
  protected checkDuplicatedField(pivotList: AbstractField[], field: any): any {

    const duplicateList = [];

    // 해당 필드가 속한 중복리스트 설정
    pivotList.forEach((item) => {

      if (item.name === field.name) {

        duplicateList.push(item);
      }
    });

    return duplicateList;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 차트타입별 불가능한 선반 설정
   */
  private initUnavailableShelf() {
    // column, row, aggregation
    this.unavailableShelfs = [];

    switch (this.chartType) {
      case 'waterfall':
      case 'combine':
      case 'sankey':
      case 'line':
      case 'control':
        this.unavailableShelfs.push('row');
        break;
      case 'pie':
      case 'label':
      case 'wordcloud':
      case 'radar':
        this.unavailableShelfs.push('column', 'row');
        break;
      case 'gauge':
        this.unavailableShelfs.push('column');
        break;
      default:
        break;
    }

  }

  private init() {
    this.$editFieldLayer = $('#editFieldLayer');

    // aggregation 함수 리스트 설정
    this.aggTypeList = [{label: 'Sum', id: AggregationType.SUM},
      {label: 'Average', id: AggregationType.AVG},
      {label: 'Count', id: AggregationType.COUNT},
      {label: 'Median', id: AggregationType.MEDIAN},
      {label: 'Min', id: AggregationType.MIN},
      {label: 'Max', id: AggregationType.MAX},
      {
        label: 'Percentile',
        id: AggregationType.PERCENTILE,
        options: [{decimal: 0.25, fraction: '1/4'}, {decimal: 0.75, fraction: '3/4'}]
      }];

    // timestamp 타입 리스트 설정
    this.timestampTypeList = [
      // 초단위 제거 요청으로 주석처리
      {label: 'Second', id: GranularityType.SECOND, discontinuous: false},
      {label: 'Minute', id: GranularityType.MINUTE, discontinuous: false},
      {label: 'Hour', id: GranularityType.HOUR, discontinuous: false},
      {label: 'Day', id: GranularityType.DAY, discontinuous: false},
      {label: 'Week', id: GranularityType.WEEK, discontinuous: false},
      {label: 'Month', id: GranularityType.MONTH, discontinuous: false},
      {label: 'Quarter', id: GranularityType.QUARTER, discontinuous: false},
      {label: 'Year', id: GranularityType.YEAR, discontinuous: false},
      {label: 'None', id: GranularityType.NONE, discontinuous: false}];
  }

  /**
   * 선반의 dimension / measure값의 중복된값 제거
   */
  public distinctPivotItems(shelves: AbstractField[], field: any, idx: number, shelf: AbstractField[], targetContainer: string): boolean {

    // pivot item들이 제거됐는지 여부 (default: 제거 안됨)
    let removedPivotItemFl: boolean = false;

    // 중복리스트
    const duplicateList = [];

    // 해당 필드가 속한 중복리스트 설정
    shelves.forEach((item) => {

      if (item.name === field.name) {

        duplicateList.push(item);
      }
    });

    switch (field.type) {
      case String(ShelveFieldType.DIMENSION):

        // 같은 명칭을 가진필드는 선반에서 제외
        if (duplicateList.length > 1) {

          shelf.splice(idx, 1);

          removedPivotItemFl = true;
        }
        break;
      case String(ShelveFieldType.MEASURE):

        // 중복된경우
        if (duplicateList.length > 1) {

          // aggregation이 적용된 custom field인 경우 제거
          if ('user_expr' == field.subType && field['aggregated']) {

            shelf.splice(idx, 1);
            removedPivotItemFl = true;
            return;
          }

          // aggregation함수값을 deep copy
          const copiedAggregation = JSON.parse(JSON.stringify(this.aggTypeList));

          // aggregation 함수가 같은경우 copiedAggregation리스트에서 제거
          loop1: for (let num = copiedAggregation.length; num--;) {

            const aggTypeId = copiedAggregation[num].id;

            for (const item2 of duplicateList) {

              if (aggTypeId && item2.aggregationType && aggTypeId === item2.aggregationType) {

                copiedAggregation.splice(_.findIndex(copiedAggregation, {id: aggTypeId}), 1);
                continue loop1;
              }
            }
          }

          // 중복값이 aggregationType 리스트를 넘어간다면 제거
          if (this.aggTypeList.length < duplicateList.length) {

            shelf.splice(idx, 1);

            removedPivotItemFl = true;

            // 같은이름을 가진값의 aggregationType값이 같은경우 => 다른 aggregationType으로 변경
          } else {
            if (copiedAggregation && copiedAggregation.length > 0) shelf[idx].aggregationType = copiedAggregation[0].id;
          }
          // 최초 aggregation값 설정
        } else {
          // SUM으로 기본설정
          shelf[idx].aggregationType = !shelf[idx]['aggregated'] ? AggregationType.SUM : null;
        }
        break;
      case String(ShelveFieldType.TIMESTAMP):

        // granularity함수값을 deep copy
        let copiedTimestampList = _.cloneDeep(this.timestampTypeList);

        if (this.dragField) {
          copiedTimestampList = copiedTimestampList.filter((item) => {

            // none인 경우 무조건 통과
            return item['id'] == GranularityType.NONE ? true : this.useGranularity(false, item['id'], this.dragField.granularity);
          });
        }

        // 중복된경우
        if (duplicateList.length > 1) {

          // granularity 함수가 같은경우 copiedAggregation리스트에서 제거
          loop1: for (let num = copiedTimestampList.length; num--;) {

            const timestampTypeId = copiedTimestampList[num].id;

            const timeDiscontinuous = copiedTimestampList[num].discontinuous;

            for (const item2 of duplicateList) {

              if (timestampTypeId && item2.format && timestampTypeId === item2.format.unit && timeDiscontinuous === item2.format.discontinuous) {

                copiedTimestampList.splice(_.findLastIndex(copiedTimestampList, {id: timestampTypeId}), 1);
                continue loop1;
              }
            }
          }

          // 중복값이 timestampTypeList 리스트를 넘어간다면 제거
          if (copiedTimestampList && copiedTimestampList.length == 0) {

            shelf.splice(idx, 1);

            removedPivotItemFl = true;

            // 같은이름을 가진값의 timestamp가 같은경우 => 다른 timestamp값으로 변경
          } else {

            // none값의 순서변경
            if (shelf[idx].field.role === FieldRole.DIMENSION) {

              const noneIndex = _.findIndex(copiedTimestampList, (obj) => {
                return obj.id === 'NONE';
              });

              // none이 있는경우
              if (-1 !== noneIndex) {
                // none위치 이동
                const item = copiedTimestampList[noneIndex];
                copiedTimestampList.splice(noneIndex, 1);
                copiedTimestampList.unshift(item);

                removedPivotItemFl = true;
              }
            }

            // shelf format에 설정
            shelf[idx].format = new Format();
            shelf[idx].format.type = String(UIFormatType.TIME_CONTINUOUS);
            shelf[idx].format.discontinuous = false;
            shelf[idx].format.unit = copiedTimestampList[0].id;
            if (field.field && field.field.format) {
              shelf[idx].format.timeZone = field.field.format.timeZone;
            }
          }
          // 최초 granularity 설정
        } else {

          // role이 dimension이면서 logicalType이 timestamp인 경우 none부터 시작
          if (shelf[idx].field.role === FieldRole.TIMESTAMP) {

            // DAY
            shelf[idx].format = new Format();
            shelf[idx].format.type = String(UIFormatType.TIME_CONTINUOUS);
            shelf[idx].format.discontinuous = false;
            shelf[idx].format.unit = copiedTimestampList[0].id;
            if (field.field && field.field.format) {
              shelf[idx].format.timeZone = field.field.format.timeZone;
            }
          } else if (shelf[idx].field.role === FieldRole.DIMENSION) {

            // NONE
            shelf[idx].format = new Format();
            shelf[idx].format.type = String(UIFormatType.TIME_CONTINUOUS);
            shelf[idx].format.discontinuous = false;
            shelf[idx].format.unit = TimeUnit.NONE;
            if (field.field && field.field.format) {
              shelf[idx].format.timeZone = field.field.format.timeZone;
            }
          }
        }

        // grid가 아닐때 각 선반에서 같은 timestamp가 있는경우 제거
        // 각 선반의 중복이 나는경우 removePivotItemFl 설정
        if (!removedPivotItemFl && 'grid' !== this.chartType) {

          if (this.deleteDuplicatedField(field, idx, targetContainer)) removedPivotItemFl = true;
        }
        break;
    }

    return removedPivotItemFl;
  }

  /**
   * 해당 선반에서 중복데이터일때
   * @param field 필드값
   * @param idx   필드 index
   * @param targetContainer 현재 선택된 선반
   */
  protected deleteDuplicatedField(field: any, idx: number, targetContainer: string): boolean {

    // 선반의 종류에 따라서설정
    switch (targetContainer) {

      case 'column' :
        // 열선반에서 해당 선반 중복시 제거
        if (this.checkDuplicatedField(this.pivot.columns, field).length > 1) {

          // 선반에서 해당 아이템 제거
          this.pivot.columns.splice(idx, 1);
          return true;
        }
        break;
      case 'row' :
        // 행선반에서 해당 선반 중복시 제거
        if (this.checkDuplicatedField(this.pivot.rows, field).length > 1) {

          // 선반에서 해당 아이템 제거
          this.pivot.rows.splice(idx, 1);
          return true;
        }
        break;
      case 'aggregation' :
        // 교차선반에서 해당 선반 중복시 제거
        if (this.checkDuplicatedField(this.pivot.aggregations, field).length > 1) {

          // 선반에서 해당 아이템 제거
          this.pivot.aggregations.splice(idx, 1);
          return true;
        }
        break;
    }

    return false;
  }

  /**
   * 바차트의 병렬 / 중첩에 따른 pivot 데이터 변경
   */
  private changeBarStackPivot() {

    // 병렬인경우
    if (this.widgetConfig.chart['mark'] === String(BarMarkType.MULTIPLE)) {

      let aggDimensionExist: boolean = false;

      // 교차에 dimension이 있는경우
      this.pivot.aggregations.forEach((item) => {
        aggDimensionExist = String(ShelveFieldType.DIMENSION) === item.type ? true : false;
      })

      // 교차에 dimension이 있는경우에만 dimension 위치 변경
      if (aggDimensionExist) {
        // 행에 dimension이 있는경우 교차로 이동
        for (let num = this.pivot.rows.length; num--;) {

          const item = this.pivot.rows[num];

          // dimension인 경우
          if (String(ShelveFieldType.DIMENSION) === item.type) {

            // 행에서 제거
            this.pivot.rows.splice(num, 1);

            // 교차에 추가
            this.pivot.aggregations.push(item);
          }
        }
      }
      // 중첩인경우
    } else {

      // 행에 dimension이 있는경우
      let rowDimensionExist: boolean = false;

      // 교차에 dimension이 있는경우
      this.pivot.rows.forEach((item) => {
        rowDimensionExist = String(ShelveFieldType.DIMENSION) === item.type ? true : false;
      })

      // 행에 dimension이 있는경우에만 dimension 위치 변경
      if (rowDimensionExist) {
        // 교차에 dimension이 있는경우 행으로 이동
        for (let num = this.pivot.aggregations.length; num--;) {

          const item = this.pivot.aggregations[num];

          // dimension인 경우
          if (String(ShelveFieldType.DIMENSION) === item.type) {

            // 교차에서 제거
            this.pivot.aggregations.splice(num, 1);

            // 행에 추가
            this.pivot.rows.push(item);
          }
        }
      }
    }
  }

  /**
   * 해당 리스트에서 type에 해당하는경우 값 제거, data에서 선반표시 제거
   * @param deleteList 삭제할 리스트
   * @param type - optional, measure / dimension 타입
   * @param addList - optional, 삭제한 아이템을 추가할 리스트
   * @param fieldPivot - optional
   */
  private updatePivotList(deleteList: AbstractField[], deleteType: FieldPivot, typeList: string[] = [''], addList?: AbstractField[], fieldPivot: FieldPivot = FieldPivot.AGGREGATIONS) {

    for (let num = deleteList.length; num--;) {

      const item = deleteList[num];

      for (const type of typeList) {

        // type이 없는경우 true, 타입이 있는경우 타입값이 아이템의 타입값과 같을때만 true
        const typeCheck: boolean = !type || '' === type ? true : type === item.type ? true : false;

        // type일떄
        if (typeCheck) {

          // 해당 값에서 measure값 제거
          deleteList.splice(num, 1);

          // 삭제한 아이템을 다른 선반으로 이동
          if (addList) {

            // 이동되는 선반을 설정
            item.currentPivot = fieldPivot;
            addList.push(item);

            // 이전의 아이템이 올라간 선반 표시 제거후 해당 선반으로 아이콘 설정
            this.changePivotItem.emit({
              data: item,
              list: this.pivot.aggregations,
              addType: fieldPivot,
              deleteType: deleteType
            });

            // 다른 선반으로 이동되지 않고 삭제시
          } else {

            // 아이템이 올라간 선반 표시 아이콘 제거
            this.deletePivotItem.emit({data: item, addType: fieldPivot, deleteType: deleteType});
          }
        }
      }
    }
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
   * 차트별 선반 제한 설정
   */
  private chartShelveLimit(chartType: string, targetContainer: string, shelf: any) {

    // 각 차트마다 선반 위치 변경
    const type: ChartType = ChartType[String(chartType.toUpperCase())] as ChartType;
    switch (type) {

      // 바차트 (열: 측정값 제거 / 행,교차 : 병렬/중첩에 따라서 설정)
      case ChartType.BAR:

        // 열 : 측정값 제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);

        // 바차트의 병렬 / 중첩에 따른 pivot 데이터 변경
        if (type === ChartType.BAR) this.changeBarStackPivot();
        break;

      // 표 (열: 측정값 제거 / 행: 측정값 제거 / 교차 : 차원값 제거)
      case ChartType.GRID:

        // 열 : 측정값 제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 행 : 측정값 제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 교차 : 차원값 제거
        this.targetFieldLimit(targetContainer, 'aggregation', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);

        break;
      // 라인 (열: 측정값 제거, 행: 모든값제거)
      case ChartType.LINE:

        // 열 : 측정값 제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 행 : 모든값제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE, ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        break;

      // 파이 (열, 행 : 모든값제거)
      case ChartType.PIE:

        // 열 : 모든값제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE, ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 행 : 모든값제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE, ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        break;
      // 스케터 (열: 측정값 1개이상시 삭제, 차원값 제거 / 행: 측정값 1개이상시 삭제, 차원값 제거 / 교차: 측정값 제거)
      case ChartType.SCATTER:

        // 열: 측정값 1개이상시 삭제
        this.deleteOverFieldCount(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf, 1);
        // 열: 차원값 제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 행: 차원값 제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 행: 측정값 1개이상시 삭제
        this.deleteOverFieldCount(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf, 1);
        // 교차: 측정값 제거
        this.targetFieldLimit(targetContainer, 'aggregation', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);

        break;
      // 히트맵 (열: 측정값 제거 / 행: 측정값 제거 / 교차: 차원값 제거)
      case ChartType.HEATMAP:

        // 열: 측정값 제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 행: 측정값 제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 교차: 차원값 제거
        this.targetFieldLimit(targetContainer, 'aggregation', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 교차: 측정값 1개이상시 삭제
        this.deleteOverFieldCount(targetContainer, 'aggregation', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf, 1);
        break;
      // 콘트롤 차트 (열: 차원값(시간제외), 행: 모든값제거, 측정값 제거 / 교차: 차원값 제거)
      case ChartType.CONTROL:

        // 열: 차원값 (시간제외), 측정값 제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.DIMENSION, ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 열: 시간값 1개이상시 제거
        this.deleteOverFieldCount(targetContainer, 'column', [ShelveFieldType.TIMESTAMP], shelf, 1);
        // 교차: 차원값 제거
        this.targetFieldLimit(targetContainer, 'aggregation', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 행 : 모든값제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE, ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        break;
      // 핵심지표 (열, 행 : 모든값제거, 교차: 차원값 제거)
      case ChartType.LABEL:

        // 열 : 모든값제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE, ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 행 : 모든값제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE, ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 교차: 차원값 제거
        this.targetFieldLimit(targetContainer, 'aggregation', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        break;
      // 박스플롯 (열: 측정값 제거 / 행: 차원값 1개이상시 제거, 측정값 제거 / 교차: 차원값 제거, 측정값 1개이상시 제거)
      case ChartType.BOXPLOT:

        // 열: 측정값 제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 행 차원값 1개이상시 제거
        this.deleteOverFieldCount(targetContainer, 'row', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf, 1);
        // 행: 측정값 제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 교차 측정값 1개이상시 제거
        this.deleteOverFieldCount(targetContainer, 'aggregation', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf, 1);
        // 열: 차원값 제거
        this.targetFieldLimit(targetContainer, 'aggregation', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);

        break;
      // 폭포 (열: 차원값(시간속성제외)제거, 측정값 제거, 시간속성 1개이상시 제거 /행: 모든값제거 / 교차: 측정값 1개이상시 제거, 차원값 제거)
      case ChartType.WATERFALL:

        // 행 : 모든값제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE, ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 열: 차원값(시간속성제외)제거, 측정값 제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.DIMENSION, ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 열 시간속성 1개이상시 제거
        this.deleteOverFieldCount(targetContainer, 'column', [ShelveFieldType.TIMESTAMP], shelf, 1);
        // 교차 측정값 1개이상시 제거
        this.deleteOverFieldCount(targetContainer, 'aggregation', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf, 1);
        // 교차: 차원값 제거
        this.targetFieldLimit(targetContainer, 'aggregation', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);

        break;
      // 워드 클라우드 (열,행 : 모든값제거, 교차: 측정값 1개이상시 제거)
      case ChartType.WORDCLOUD:

        // 열 : 모든값제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE, ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 행 : 모든값제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE, ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 교차 측정값 1개이상시 제거
        this.deleteOverFieldCount(targetContainer, 'aggregation', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf, 1);
        break;
      // 결합 (열: 측정값 제거 / 행: 모든값제거/교차: 차원값 제거, 측정값 5개부터는 제거)
      case ChartType.COMBINE:

        // 행 : 모든값제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE, ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 열: 측정값 제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 교차: 차원값 제거
        this.targetFieldLimit(targetContainer, 'aggregation', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 교차: 측정값 5개부터는 제거
        this.deleteOverFieldCount(targetContainer, 'aggregation', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf, 5);
        break;
      // 트리맵 열: 차원값 1개이상시 제거, 측정값 제거 / 행: 측정값 제거 / 교차: 차원값 제거, 측정값 1개이상시 제거
      case ChartType.TREEMAP:

        // 열: 차원값 1개이상시 제거
        this.deleteOverFieldCount(targetContainer, 'column', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf, 1);
        // 열 : 측정값 제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 교차: 측정값 1개이상시 제거
        this.deleteOverFieldCount(targetContainer, 'aggregation', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf, 1);
        // 행: 측정값 제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 교차: 차원값 제거
        this.targetFieldLimit(targetContainer, 'aggregation', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        break;
      // 레이더 (열,행 : 모든값제거, 교차: 차원값 1개이상시 제거)
      case ChartType.RADAR:

        // 열 : 모든값제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE, ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 행 : 모든값제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE, ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 교차: 측정값 1개이상시 제거
        this.deleteOverFieldCount(targetContainer, 'aggregation', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf, 1);
        break;
      // 측정차트 (열: 모든값제거 / 행: 측정값 제거 / 교차: 차원값 제거, 측정값 1개이상시 제거)
      case ChartType.GAUGE:

        // 열 : 모든값제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE, ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 행: 측정값 제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 교차: 차원값 제거
        this.targetFieldLimit(targetContainer, 'aggregation', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 교차: 측정값 1개이상시 제거
        this.deleteOverFieldCount(targetContainer, 'aggregation', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf, 1);
        break;

      // 네트워크 (열: 측정값 제거, 차원값 1개이상시 제거, 행: 측정값 제거, 차원값 1개이상시 제거, 교차 차원값 제거, 측정값 1개이상시 제거)
      case ChartType.NETWORK:

        // 열: 측정값 제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 열: 차원값 1개이상시 제거
        this.deleteOverFieldCount(targetContainer, 'column', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf, 1);
        // 행: 측정값 제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 행: 차원값 1개이상시 제거
        this.deleteOverFieldCount(targetContainer, 'row', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf, 1);
        // 교차: 차원값 제거
        this.targetFieldLimit(targetContainer, 'aggregation', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 교차: 측정값 1개이상시 제거
        this.deleteOverFieldCount(targetContainer, 'aggregation', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf, 1);
        break;

      // 센키 (열: 측정값 제거, 행: 모든값제거 /교차: 차원값 제거, 측정값 1개이상시 제거)
      case ChartType.SANKEY:

        // 행 : 모든값제거
        this.targetFieldLimit(targetContainer, 'row', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE, ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 열: 측정값 제거
        this.targetFieldLimit(targetContainer, 'column', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf);
        // 교차: 차원값 제거
        this.targetFieldLimit(targetContainer, 'aggregation', [ShelveFieldType.DIMENSION, ShelveFieldType.TIMESTAMP], shelf);
        // 교차: 측정값 1개이상시 제거
        this.deleteOverFieldCount(targetContainer, 'aggregation', [ShelveFieldType.CALCULATED, ShelveFieldType.MEASURE], shelf, 1);
        break;
    }
  }

  /**
   * overCount 개수가 넘어가는경우 제거
   * @param targetContainer
   * @param containerType
   * @param shelveFieldTypeList
   * @param shelf
   * @param overCount
   */
  private deleteOverFieldCount(targetContainer: string, containerType: string, shelveFieldTypeList: ShelveFieldType[], shelf: any, overCount: number = 0) {

    let index = 0;

    if (overCount > 0) {

      // 선반에서 해당 타입으로 overCount 이상인지 체크
      for (const type of shelveFieldTypeList) {

        for (const item of shelf) {
          // 해당 타입일때
          if (String(type) === item.type) {

            // 해당 container 타입일때
            if (targetContainer === containerType) {

              index++;
            }
          }
        }
      }

      if (index > overCount) {

        // 현재 타겟선반에서 선반에서 제거
        _.remove(shelf, this.dragField);

        // data 표시에서 제거
        if (this.dragField.field.pivot && this.dragField.field.pivot.length > 0) this.dragField.field.pivot.splice(this.dragField.field.pivot.length - 1, 1);
      }
    }
  }

  /**
   * 해당 선반에서 해당 필드타입에 대한 값 제한설정
   * @param targetContainer
   * @param containerType
   * @param shelveFieldTypeList
   * @param shelf
   * @param overCount
   */
  private targetFieldLimit(targetContainer: string, containerType: string, shelveFieldTypeList: ShelveFieldType[], shelf: any) {

    // 측정값일때
    for (const type of shelveFieldTypeList) {

      // 해당 타입일때
      if (String(type) === this.dragField.type) {

        // 해당 container 타입일때
        if (targetContainer === containerType) {

          // 현재 타겟선반에서 선반에서 제거
          _.remove(shelf, this.dragField);

          // data 표시에서 제거
          if (this.dragField.field.pivot && this.dragField.field.pivot.length > 0) this.dragField.field.pivot.splice(this.dragField.field.pivot.length - 1, 1);
        }
      }
    }
  }

  /**
   * remove animation
   */
  public removeAnimation() {

    const element = this.$element.find('.ddp-wrap-default');

    let scope = this;

    // 선반의 길이에따라 animation 설정
    element.each(function () {

      // animation total width 설정
      let totalWidth = scope.getShelveTotalWidth($(this));

      // total width 설정 (드래그시 아래로 떨어지는걸 방지하기위해서 drag item width인 150을 더해주기)
      $(this).css('width', totalWidth + 150);

      $(this).parent().parent().find('.ddp-btn-prev').hide();
      $(this).parent().parent().find('.ddp-btn-next').hide();
      $(this).css('padding', '0px');

      // marginLeft 초기화 설정
      $(this).css('marginLeft', 0);
    });
  }

  /**
   * 선반 애니메이션에서 해당 선반의 totalWidth 구하기
   * @param $currentShelve
   * @returns {number}
   */
  protected getShelveTotalWidth($currentShelve: JQuery): number {

    // 아이템들의 width 구해서 총 total width 구하기
    let totalExWidth = 0;
    let totalDefaultWidth = 0;
    let totanetworkWidth = 0;

    $currentShelve.find('.ddp-wrap-example').each(function () {
      totalExWidth += Math.ceil($(this).outerWidth() + 2);
    });
    $currentShelve.find('.ddp-ui-default').each(function (i) {
      totalDefaultWidth += Math.ceil($(this).outerWidth() + 2);
    });
    $currentShelve.find('.ddp-box-network').each(function (i) {
      totanetworkWidth += Math.ceil(($(this).outerWidth() + 4) - $(this).find('.ddp-ui-default').outerWidth() + 10);
    });
    const totalWidth = totalExWidth + totalDefaultWidth + totanetworkWidth;

    return totalWidth;
  }

  /**
   * 차원값, 측정값의 피봇팅 조건에 따라서 이동
   * @param dimensionPivotType 차원값의 피봇팅 조건
   * @param measurePivotType 측정값의 피봇팅 조건
   */
  private autoPivoting(dimensionPivotType?: FieldPivot, measurePivotType?: FieldPivot) {

    switch (dimensionPivotType) {
      case FieldPivot.COLUMNS:
        // 행 / 교차 차원값 => 열로 이동
        this.updatePivotList(this.pivot.rows, FieldPivot.ROWS, [String(ShelveFieldType.DIMENSION), String(ShelveFieldType.TIMESTAMP)], this.pivot.columns, FieldPivot.COLUMNS);
        this.updatePivotList(this.pivot.aggregations, FieldPivot.AGGREGATIONS, [String(ShelveFieldType.DIMENSION), String(ShelveFieldType.TIMESTAMP)], this.pivot.columns, FieldPivot.COLUMNS);
        break;
      case FieldPivot.ROWS:
        // 열 / 교차 차원값 => 행로 이동
        this.updatePivotList(this.pivot.columns, FieldPivot.COLUMNS, [String(ShelveFieldType.DIMENSION), String(ShelveFieldType.TIMESTAMP)], this.pivot.rows, FieldPivot.ROWS);
        this.updatePivotList(this.pivot.aggregations, FieldPivot.AGGREGATIONS, [String(ShelveFieldType.DIMENSION), String(ShelveFieldType.TIMESTAMP)], this.pivot.rows, FieldPivot.ROWS);
        break;
      case FieldPivot.AGGREGATIONS:
        // 열 / 행 차원값 => 교차로 이동
        this.updatePivotList(this.pivot.columns, FieldPivot.COLUMNS, [String(ShelveFieldType.DIMENSION), String(ShelveFieldType.TIMESTAMP)], this.pivot.aggregations);
        this.updatePivotList(this.pivot.rows, FieldPivot.ROWS, [String(ShelveFieldType.DIMENSION), String(ShelveFieldType.TIMESTAMP)], this.pivot.aggregations);
        break;
    }

    switch (measurePivotType) {
      case FieldPivot.AGGREGATIONS:
        // 열 / 행 측정값 => 교차로 이동
        this.updatePivotList(this.pivot.columns, FieldPivot.COLUMNS, [String(ShelveFieldType.MEASURE), String(ShelveFieldType.CALCULATED)], this.pivot.aggregations);
        this.updatePivotList(this.pivot.rows, FieldPivot.ROWS, [String(ShelveFieldType.MEASURE), String(ShelveFieldType.CALCULATED)], this.pivot.aggregations);
        break;
    }
  }

  /**
   * index에 따라서 선반 위치 변경
   */
  private moveShelfItemByIndex(fieldTypeList: String[], deleteIndex: number, columnIndexList?: number[], rowIndexList?: number[], columnUnlimitedIndex?: number, rowUnlimitedIndex?: number) {

    // 선반 타입에 따른 선반 리스트 리턴
    let getFieldList = (item): void => {
      if (FieldPivot.COLUMNS == item.currentPivot) {
        _.remove(this.pivot.columns, item);
      } else if (FieldPivot.ROWS == item.currentPivot) {
        _.remove(this.pivot.rows, item);
      } else if (FieldPivot.AGGREGATIONS == item.currentPivot) {
        _.remove(this.pivot.aggregations, item);
      }
    }

    if (typeof deleteIndex !== null) {
      // 측정값이 deleteIndex개이상인 경우 측정값 deleteIndex -1 개까지만 남겨놓고 제거
      let list = this.pivot.aggregations.concat(this.pivot.rows.concat(this.pivot.columns)).filter((item) => -1 !== fieldTypeList.indexOf(item.type));
      list.forEach((item, index) => {

        // deleteIndex개부터 제거
        if (index > deleteIndex) {

          // 해당 선반의 리스트에서 해당 아이템 제거
          getFieldList(item);

          // data 패널에 표시
          this.deletePivotItem.emit({data: item, list: list, deleteType: item.currentPivot});
        }
      });
    }

    if (columnIndexList && rowIndexList) {
      // deleteIndex개수까지 정제된 리스트
      let editedList = this.pivot.aggregations.concat(this.pivot.rows.concat(this.pivot.columns)).filter((item) => -1 !== fieldTypeList.indexOf(item.type));
      // 측정값: 열(첫번쨰), 행(두번째))
      editedList.forEach((item, index) => {

        // 해당 선반 리스트에서 제거
        getFieldList(item);

        // columnIndexList / columnUnlimitedIndex 값 => 열로 이동, columnUnlimitedIndex / rowUnlimitedIndex값 => 행으로 이동
        if (-1 !== columnIndexList.indexOf(index) || (columnUnlimitedIndex && index >= columnUnlimitedIndex)) {
          // data 패널 설정
          item.field.pivot.splice(item.field.pivot.indexOf(item.currentPivot), 1);
          item.field.pivot.push(FieldPivot.COLUMNS);
          item.currentPivot = FieldPivot.COLUMNS;

          // column으로 이동
          this.pivot.columns.push(item);
        } else if (-1 !== rowIndexList.indexOf(index) || (rowUnlimitedIndex && index >= rowUnlimitedIndex)) {
          // data 패널 설정
          item.field.pivot.splice(item.field.pivot.indexOf(item.currentPivot), 1);
          item.field.pivot.push(FieldPivot.ROWS);
          item.currentPivot = FieldPivot.ROWS;

          // rows으로 이동
          this.pivot.rows.push(item);
        }
      });
    }
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
   * timestamp값을 같은선반에 1개이상 들어가지않도록 설정
   */
  private getUniqTimestampShelve() {

    const getTimeStampList = ((shelve: AbstractField[], fieldPivot: FieldPivot) => {

      for (let index = shelve.length; index--;) {

        const item = shelve[index];

        // timestamp일때
        if (item.type == 'timestamp') {

          // 중복 리스트 찾기
          const duplicateList = shelve.filter((data) => {
            return data.name == item.name
          });

          // 중복리스트가 있는경우
          if (duplicateList.length > 1) {
            // 선반에서 제거
            shelve.splice(index, 1);
            // data 패널에서 해제
            item.field.pivot.splice(item.field.pivot.indexOf(fieldPivot), 1);
          }
        }
      }
    });

    if (this.pivot) {
      getTimeStampList(this.pivot.columns, FieldPivot.COLUMNS);
      getTimeStampList(this.pivot.rows, FieldPivot.ROWS);
      getTimeStampList(this.pivot.aggregations, FieldPivot.AGGREGATIONS);
    }
  }

}
