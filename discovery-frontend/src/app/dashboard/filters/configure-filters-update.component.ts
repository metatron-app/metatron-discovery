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

import * as _ from 'lodash';
import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractFilterPopupComponent} from 'app/dashboard/filters/abstract-filter-popup.component';
import {Filter} from '../../domain/workbook/configurations/filter/filter';
import {Dashboard} from '../../domain/dashboard/dashboard';
import {ConnectionType, Datasource, Field, FieldRole} from '../../domain/datasource/datasource';
import {CustomField} from '../../domain/workbook/configurations/field/custom-field';
import {InclusionFilter} from '../../domain/workbook/configurations/filter/inclusion-filter';
import {ConfigureFiltersInclusionComponent} from './inclusion-filter/configure-filters-inclusion.component';
import {BoundFilter} from '../../domain/workbook/configurations/filter/bound-filter';
import {ConfigureFiltersBoundComponent} from './bound-filter/configure-filters-bound.component';
import {Widget} from '../../domain/dashboard/widget/widget';
import {StringUtil} from '../../common/util/string.util';
import {TimeFilter} from '../../domain/workbook/configurations/filter/time-filter';
import {ConfigureFiltersTimeComponent} from './time-filter/configure-filters-time.component';
import {FilterUtil} from '../util/filter.util';
import {CommonConstant} from "../../common/constant/common.constant";

@Component({
  selector: 'app-config-filter-update',
  templateUrl: './configure-filters-update.component.html'
})
export class ConfigureFiltersUpdateComponent extends AbstractFilterPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('inputSearch')
  private _inputSearch: ElementRef;

  @ViewChild('inputNewCandidateValue')
  private _inputNewCandidateValue: ElementRef;

  @ViewChild(ConfigureFiltersTimeComponent)
  private _timeComp: ConfigureFiltersTimeComponent;

  @ViewChild(ConfigureFiltersInclusionComponent)
  private _inclusionComp: ConfigureFiltersInclusionComponent;

  @ViewChild(ConfigureFiltersBoundComponent)
  private _boundComp: ConfigureFiltersBoundComponent;

  @ViewChild('ddpTxtSub')
  private _ddpTxtSub: ElementRef;

  // 수정여부
  private _isEdit: boolean = false;

  // 대시보드
  private _dashboard: Dashboard;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public isShowDsTooltip: boolean = false; // 데이터소스 툴팁 표시 여부
  public isShow: boolean = false;         // 컴포넌트 표시 여부
  public isDirectEdit: boolean = false;   // 바로 수정 여부

  // 수정 대상
  public targetFilter: Filter;
  public targetField: Field | CustomField;

  // 검색어
  public searchText = '';

  // 차트 편집화면에서 띄울 경우 현재 수정중인 차트 정보를 넣어준다.
  public widget: Widget;

  // 연관 데이터소스
  public dataSource: Datasource;

  @Output()
  public goToSelectField: EventEmitter<Filter> = new EventEmitter();

  @Output()
  public done: EventEmitter<Filter> = new EventEmitter();

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
    super.ngOnInit();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 신규 필터를 추가하기 위해 컴포넌트를 연다.
   * @param {Dashboard} board
   * @param {any} data
   * @param {Widget} widget
   */
  public openForAddFilter(board: Dashboard, data: { key: string, filter: Filter }, widget?: Widget) {
    this.widget = widget;
    this.isDirectEdit = false;
    this._openComponent(board, data, false);
  } // function - openForAddFilter

  /**
   * 기존 필터를 수정하기 위해 컴포넌트를 연다.
   * @param {Dashboard} board
   * @param {any} data
   * @param {boolean} isDirect
   * @param {Widget} widget
   */
  public openForEditFilter(board: Dashboard, data: { key: string, filter: Filter }, isDirect: boolean, widget?: Widget) {
    this.widget = widget;
    this.isDirectEdit = isDirect;
    this._openComponent(board, data, true);
  } // function - openForEditFilter

  /**
   * Back Button 클릭 이벤트 핸들러
   */
  public clickBtnBack() {
    this.goToSelectField.emit(this.targetFilter);
  } // function - clickBtnBack

  /**
   * 아무런 작업을 하지 않고 컴포넌트를 닫는다.
   */
  public close() {
    this.isShow = false;
  } // function - close

  /**
   * 필터 변경을 요청한다.
   */
  public emitUpdateFilter() {
    let filter: Filter;
    if ('include' === this.targetFilter.type) {
      filter = this._inclusionComp.getData();
    } else if ('bound' === this.targetFilter.type) {
      filter = this._boundComp.getData();
    } else {
      filter = this._timeComp.getData();
    }

    // 스코프 설정
    if (this.widget) {
      if (this.targetFilter.ui.widgetId) {
        filter.ui.widgetId = this._getWidgetId();
      } else {
        delete filter.ui.widgetId;
      }
    }

    this.done.emit(filter);
  } // function - emitUpdateFilter

  public getDimensionTypeIconClass = Field.getDimensionTypeIconClass;
  public getMeasureTypeIconClass = Field.getMeasureTypeIconClass;

  /**
   * 측정값 여부 반환
   * @return {boolean}
   */
  public isMeasure() {
    return (this.targetField && this.targetField.role === FieldRole.MEASURE);
  } // function - isMeasure

  /**
   * 타임스탬프 여부 반환
   */
  public isTimestamp(): boolean {
    return (
      this.targetField
      && this.targetField.type === 'TIMESTAMP'
      && this.targetField.role === FieldRole.TIMESTAMP
    ) || (
      this.targetField == null && this.targetFilter.field === CommonConstant.COL_NAME_CURRENT_DATETIME
    );
  } // function - isTimestamp

  /**
   * 추천필터 여부 반환
   * @return {boolean}
   */
  public isRecommend(): boolean {
    return ConnectionType.ENGINE.toString() === this._dashboard.configuration.dataSource.connType
      && this.targetFilter.ui.filteringSeq > 0;
  } // function - isRecommend

  /**
   * 필수필터 여부 반환
   * @return {boolean}
   */
  public isEssential(): boolean {
    return ConnectionType.LINK.toString() === this._dashboard.configuration.dataSource.connType
      && this.targetFilter.ui.filteringSeq > 0;
  } // function - isEssential

  /**
   * 위젯 아이디에 대한 위젯이름 조회
   * @return {string}
   */
  public getWidgetName(): string {
    return this.widget.name;
  } // function - getWidgetName

  /**
   * 필터의 Scope ( 적용범위 ) 를 변경한다.
   */
  public toggleFilterScope() {
    if (this.widget) {
      if (this.targetFilter.ui.widgetId) {
        delete this.targetFilter.ui.widgetId;
      } else {
        this.targetFilter.ui.widgetId = this._getWidgetId();
      }
    }
  } // function - toggleFilterScope
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 위젯 아이디 조회
   * @returns {string}
   * @private
   */
  private _getWidgetId(): string {
    return StringUtil.isEmpty(this.widget.id) ? 'NEW' : this.widget.id;
  } // function - _getWidgetId

  /**
   * 컴포넌트를 연다.
   * @param {Dashboard} board
   * @param {any} data
   * @param {boolean} isEdit
   * @private
   */
  private _openComponent(board: Dashboard, data: { key: string, filter: Filter }, isEdit: boolean = true) {
    const targetFilter: Filter = _.cloneDeep(data.filter);
    this._isEdit = isEdit;

    if (this.widget) {
      targetFilter.ui.widgetId = this._getWidgetId();
    }

    this._dashboard = _.cloneDeep(board);
    this.targetFilter = targetFilter;
    (this.targetFilter.ui) || (this.targetFilter.ui = {});
    this.targetField = this._getTargetField(targetFilter, board.configuration.fields, board.configuration.customFields);

    this.dataSource = FilterUtil.getDataSourceForFilter(targetFilter, board);

    this.isShow = true;

    this.safelyDetectChanges();

    if ('include' === targetFilter.type) {
      this._inclusionComp.showComponent(board, <InclusionFilter>targetFilter, this.targetField);
    } else if ('bound' === targetFilter.type) {
      this._boundComp.showComponent(board, <BoundFilter>targetFilter, this.targetField);
    } else {
      this._timeComp.showComponent(board, <TimeFilter>targetFilter, this.targetField);
    }

    if(this._ddpTxtSub && this.isEllipsisActive(this._ddpTxtSub)) {
      $(this._ddpTxtSub.nativeElement).attr("title", this.dataSource.name);
    }
  } // function - _openComponent

  private isEllipsisActive(el : ElementRef) : boolean {
    if(el.nativeElement.offsetWidth < el.nativeElement.scrollWidth) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 필터 대상 필드를 특정짓는다.
   * @param {Filter} filter
   * @param {Field[]} fields
   * @param {CustomField[]} customFields
   * @return {Field | CustomField}
   * @private
   */
  private _getTargetField(filter: Filter, fields: Field[], customFields?: CustomField[]): Field | CustomField {

    // 필드 목록에 사용할 데이터 정리
    let fieldList: (Field | CustomField)[] = _.cloneDeep(fields);

    if (customFields) {
      fieldList = fieldList.concat(customFields);
    }


    // 글로벌 필터
    if (fieldList && 0 < fieldList.length) {
      return fieldList.find((field: Field | CustomField) => field.name === filter.field && field.dataSource === filter.dataSource);
    } else {
      return null;
    }
  } // function - _getTargetField

}
