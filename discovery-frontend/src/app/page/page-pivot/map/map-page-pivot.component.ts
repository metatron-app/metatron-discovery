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

import { Component, ElementRef, EventEmitter, Injector, Input, Output } from '@angular/core';
import { Pivot } from '../../../domain/workbook/configurations/pivot';
import { BIType, Field, FieldPivot, LogicalType } from '../../../domain/datasource/datasource';
import {
  EventType, ShelveFieldType,
  UIFormatCurrencyType,
  UIFormatNumericAliasType,
  UIFormatType
} from '../../../common/component/chart/option/define/common';

import * as _ from 'lodash';
import { UIMapOption } from '../../../common/component/chart/option/ui-option/map/ui-map-chart';
import { TimestampField } from '../../../domain/workbook/configurations/field/timestamp-field';
import { DimensionField } from '../../../domain/workbook/configurations/field/dimension-field';
import { MeasureField } from '../../../domain/workbook/configurations/field/measure-field';
import { PagePivotComponent } from '../page-pivot.component';
import { Shelf } from '../../../domain/workbook/configurations/shelf/shelf';
import { Field as AbstractField } from '../../../domain/workbook/configurations/field/field';
import * as $ from "jquery";
import { MapLayerType } from '../../../common/component/chart/option/define/map/map-common';

@Component({
  selector: 'map-page-pivot',
  templateUrl: './map-page-pivot.component.html'
})
export class MapPagePivotComponent extends PagePivotComponent {

  @Input('uiOption')
  public set setUIOption(uiOption: UIMapOption) {

    if (!uiOption.layerNum) uiOption.layerNum = 0;

    this.uiOption = uiOption;
  }

  @Input('pivot')
  set setPivot(pivot: Pivot) {

    this.pivot = pivot;
  }

  // layer에 따라서 해당 index에 설정하기
  @Input('shelf')
  set setShelf(shelf: Shelf) {

    this.shelf = shelf;

    this.changeShelf();
  }

  // Pivot 정보가 바뀐 경우
  @Output('changeShelf')
  public changeShelfEvent: EventEmitter<any> = new EventEmitter();

  public shelf: Shelf;

  public uiOption: UIMapOption;

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

    let fieldPivot: FieldPivot;

    if (targetContainer === 'layer0') {
      shelf = this.shelf.layers[0];
      shelfElement = this.$element.find('#layer0');
      fieldPivot = FieldPivot.MAP_LAYER0;

    } else if (targetContainer === 'layer1') {
      shelf = this.shelf.layers[1];
      shelfElement = this.$element.find('#layer1');
      fieldPivot = FieldPivot.MAP_LAYER1;

    } else if (targetContainer === 'layer2') {
      shelf = this.shelf.layers[2];
      shelfElement = this.$element.find('#layer2');
      fieldPivot = FieldPivot.MAP_LAYER2;
    }

    const idx = shelf.findIndex((field) => {
      return field.name === targetField.name && targetField.biType === field.biType;
    });

    if (idx > -1) {
      let field;

      // timestamp biType이거나, biType이 dimension이면서 logicalType이 timestamp인 경우
      if (targetField.biType === BIType.TIMESTAMP ||
        (targetField.biType === BIType.DIMENSION && targetField.logicalType === LogicalType.TIMESTAMP)) {

        // 타입필드로 설정
        const timeField = new TimestampField();
        field = timeField;
      }
      else if (targetField.biType === BIType.DIMENSION) {
        field = new DimensionField();
      } else if (targetField.biType === BIType.MEASURE) {

        // default로 aggregationType은 SUM으로 설정
        field = new MeasureField();
        field.aggregated = targetField.aggregated;
      }
      field.name = targetField.name;
      field.subType = targetField.type;
      field.subRole = targetField.role;
      field.expr = targetField.expr;
      field.field = targetField;

      if (targetField.name !== targetField.alias
        && ( !targetField.nameAlias || targetField.nameAlias.nameAlias !== targetField.alias )) {
        field.alias = targetField.alias;
      }
      ( targetField.nameAlias ) && ( field.fieldAlias = targetField.nameAlias.nameAlias );
      field.granularity = targetField.granularity;
      field.segGranularity = targetField.segGranularity;
      if (!_.isUndefined(targetField.ref)) {
        field.ref = targetField.ref;
      }
      else if (targetField.type == 'user_expr') {
        field.ref = 'user_defined';
      }

      // 현재 드래그된 필드
      this.dragField = field;

      shelf[idx] = field;

      let shelves = this.shelf.layers[this.uiOption.layerNum];

      // remove duplicate list
      let duplicateFl = this.distinctPivotItems(shelves, field, idx, shelf, targetContainer);

      // if map chart type is symbol or line, remove duplicate list
      duplicateFl = this.distinctMeasure(shelves, field, idx, shelf, targetContainer);

      // 선반의 dimension / measure값의 중복된값 제거, measure aggtype 설정
      if (!duplicateFl) {

        // distinctPivotItem에서 설정된 타입 targetField에 설정
        targetField.format = shelf[idx].format;

        targetField.pivot = targetField.pivot ? targetField.pivot : [];

        if (addPivotFl) targetField.pivot.push(fieldPivot);
        field.currentPivot = fieldPivot;

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

        // point, heatmap => no aggregation / hexagon, line, polygon => set aggregation
        if (MapLayerType.SYMBOL === this.uiOption.layers[this.uiOption.layerNum].type ||
          MapLayerType.HEATMAP === this.uiOption.layers[this.uiOption.layerNum].type) {
          delete field.aggregationType;
        }
      }

      // 선반 정보 변경시 (선반피봇팅 조건 이미 설정하였으므로 true)
      this.changePivot(EventType.CHANGE_PIVOT);

      // 선반 total width 설정, 애니메이션 여부 설정
      if (shelfElement) this.onShelveAnimation();
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
    let fieldPivot: FieldPivot;

    // animation에 사용할 선반 element 설정
    let shelfElement: JQuery;

    if (targetContainer === 'layer0') {
      shelf = this.shelf.layers[0];
      shelfElement = this.$element.find('#layer0');
      fieldPivot = FieldPivot.MAP_LAYER0;

    } else if (targetContainer === 'layer1') {
      shelf = this.shelf.layers[1];
      shelfElement = this.$element.find('#layer1');
      fieldPivot = FieldPivot.MAP_LAYER1;

    } else if (targetContainer === 'layer2') {
      shelf = this.shelf.layers[2];
      shelfElement = this.$element.find('#layer2');
      fieldPivot = FieldPivot.MAP_LAYER2;
    }

    // 선반의 위치가 다른선반으로 이동시에만 설정
    if (pivotField.currentPivot !== fieldPivot) {

      // 타임스탬프일때
      if (targetField.biType === BIType.TIMESTAMP ||
        (targetField.biType === BIType.DIMENSION && targetField.logicalType === LogicalType.TIMESTAMP)) {

        const timestampIndex = shelf.findIndex((field) => {
          return field.name === targetField.name && targetField.role === field.field.role && targetField.granularity === field.granularity && -1 !== targetField.format['type'].indexOf('time');
        });

        // 같은 timestamp의 다른타입이 한선반에 들어간경우
        if (-1 !== timestampIndex) {

          // 그리드를 제외한 같은선반에 timestamp가 2개이상 들어가지 못하게 설정
          let duplicateFieldFl = this.deleteDuplicatedField(targetField, timestampIndex, targetContainer);

          // 중복이 아닐때에만 해당 선반에 추가
          if (!duplicateFieldFl) {
            // 기존의 피봇값 제거
            targetField.pivot.splice(targetField.pivot.indexOf(pivotField.currentPivot), 1);
            // 이동된 피봇의값을 추가
            targetField.pivot.push(fieldPivot);
            // 현재피봇값 변경
            pivotField.currentPivot = fieldPivot;
          }
        }
      // 타임스탬프가 아닐때
      } else {

        // 기존의 피봇값 제거
        targetField.pivot.splice(targetField.pivot.indexOf(pivotField.currentPivot), 1);
        // 이동된 피봇의값을 추가
        targetField.pivot.push(fieldPivot);
        // 현재피봇값 변경
        pivotField.currentPivot = fieldPivot;
      }
    }

    // 선반 정보 변경시 (선반피봇팅 조건 이미 설정하였으므로 true)
    this.changePivot(EventType.CHANGE_PIVOT);

    // 선반 total width 설정, 애니메이션 여부 설정
    if (shelfElement) this.onShelveAnimation();
  }

   /**
    * 선반정보 변경시
    */
   public changePivot(eventType?: EventType) {

     // set layer alias
     this.shelf.layers[this.uiOption.layerNum] = this.shelf.layers[this.uiOption.layerNum].map(this.checkAlias);

     // emit
     this.changeShelfEvent.emit({ shelf: this.shelf, eventType: eventType });
   }

  /**
   * map chart - add layer
   */
  public addLayer(): void {

     // add empty layer
     this.shelf.layers.push([]);

     // set current layer number
     this.uiOption.layerNum = this.shelf.layers.length - 1;

     this.changePivot();
   }

  /**
   * map chart - remove layer
   */
  public removeLayer(): void {

  }

  /**
   * show guide or not
   * @returns {boolean}
   */
  public isGuide(): boolean {

     // before selecting chart, return false
     if (this.chartType == '') {
       return false;
     }

     // when geo dimension on shelf, hide guide
     for (let field of this.shelf.layers[this.uiOption.layerNum]) {
       if (field && field.field && field.field.logicalType && -1 !== field.field.logicalType.toString().indexOf("GEO")) {
         return false;
       }
     }

     return true;
   }

  /**
   * toggle shelf context menu
   * @param event
   * @param field
   */
  public openFieldSetting(event, field) {

    // toggle editing Field
    if (this.editingField === field) {
      this.editingField = null;
      return;
    }

    this.editingField = field;

    // 모든선반에서 같은 field aggregation Type 설정
    let shelves = this.shelf.layers[this.uiOption.layerNum];

    // set field setting
    this.fieldSetting(shelves);
  }

  /**
   * emit change shelf
   */
  public changeShelf(eventType?: EventType) {
    this.changeShelfEvent.emit({ shelf: this.shelf, eventType: eventType });
  }

  /**
   * return class by shelf condition
   */
  // public getGuideText(): string {
  //
  //
  //
  //   return '';
  // }

  /**
   * set shelf guide
   * @param {string} type
   * @returns {boolean}
   */
  public getMapGuideText(type?: string): boolean {

    if (!this.shelf.layers) return;

    let layers = this.shelf.layers[(<UIMapOption>this.uiOption).layerNum];

    let returnValue: boolean;

    if ('geo' === type) {
      returnValue = true;

      // hide when there is geo dimension
      layers.forEach((item) => {
        if (-1 !== item.field.logicalType.toString().indexOf('GEO')) {
          return returnValue = false;
        }
      });
    } else {
      returnValue = false;

      // show when there is geo dimension
      layers.forEach((item) => {
        if (-1 !== item.field.logicalType.toString().indexOf('GEO')) {
          return returnValue = true;
        }
      });
    }

    return returnValue;
  }

  /**
   * 아이템의 길이가 선반 길이보다 긴경우 prev / next 버튼 show설정
   */
  public onShelveAnimation() {

    if (!this.changeDetect['destroyed']) {
      // 선반의 아이템들이 나오게 설정
      this.changeDetect.detectChanges();
    }

    let element = this.$element.find('#layer' + this.uiOption.layerNum).find('.ddp-wrap-default');

    let scope = this;

    // 선반의 길이에따라 animation 설정
    element.each(function () {

      // animation total width 설정
      let totalWidth = scope.getShelveTotalWidth($(this));

      // total width 설정 (드래그시 아래로 떨어지는걸 방지하기위해서 drag item width인 150을 더해주기)
      $(this).css('width', totalWidth + 150);

      // prev / next 버튼 show / hide 설정
      if (totalWidth > $(this).parent('.ddp-ui-drag-slide-in').width()) {

        $(this).parent().parent().addClass('ddp-slide');
        $(this).parent().parent().css('padding-right', '10px');
      }
      if (totalWidth <= $(this).parent('.ddp-ui-drag-slide-in').width()) {

        $(this).parent().parent().removeClass('ddp-slide');
        $(this).parent().parent().removeAttr('padding-right');

        // ddp-wrap-default margin-left 제거
        $(this).css('margin-left', '0px');
      }
    })
  }

  /**
   * animation 이전버튼에 마우스 오버시
   */
  public mouseOverPrev(event: any) {

    // 애니메이션 동작설정 true
    this.animationPause = false;

    let scope = this;

    const $wrapDefault = $(event.currentTarget.parentElement.parentElement).find('.ddp-wrap-default');

    // 선반에 animation 설정
    $wrapDefault.animate({ marginLeft: 0 }, {
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

    const $currentShelve = $(event.currentTarget.parentElement.parentElement);

    const $wrapDefault = $(event.currentTarget.parentElement.parentElement).find('.ddp-wrap-default');

    let totalWidth = this.getShelveTotalWidth($currentShelve);

    // animation width 설정
    let moveWidth = totalWidth - $currentShelve.find('.ddp-ui-drag-slide-in').width();

    // 선반에 animation 설정
    $wrapDefault.animate({ marginLeft: -moveWidth - 40}, {
    // $wrapDefault.animate({ marginLeft: -moveWidth - 80 }, {
      duration: 1500, step: function () {

        if (scope.animationPause) {
          $(this).stop();
        }
      }
    });

  }

  /**
   * 해당 선반에서 중복데이터일때
   * @param field 필드값
   * @param idx   필드 index
   * @param targetContainer 현재 선택된 선반
   */
  protected deleteDuplicatedField(field: any, idx: number, targetContainer: string): boolean {

    // 열선반에서 해당 선반 중복시 제거
    if (this.checkDuplicatedField(this.shelf.layers[this.uiOption.layerNum], field).length > 1) {

      // 선반에서 해당 아이템 제거
      this.shelf.layers[this.uiOption.layerNum].splice(idx, 1);
      return true;
    }

    return false;
  }

  /**
   * remove the measure having same name
   * @param {Field[]} shelves
   * @param field
   * @param {number} idx
   * @param {Field[]} shelf
   * @param {string} targetContainer
   * @returns {boolean}
   */
  private distinctMeasure(shelves: AbstractField[], field: any, idx: number, shelf: AbstractField[], targetContainer: string): boolean {

    const duplicateList = [];

    shelves.forEach((item) => {

      if (item.name === field.name) {

        duplicateList.push(item);
      }
    });

    // duplicate list exists
    if (String(ShelveFieldType.MEASURE) === field.type && duplicateList.length > 1) {

      // symbol, heatmap => no aggregation type
      if (MapLayerType.SYMBOL === this.uiOption.layers[this.uiOption.layerNum].type ||
        MapLayerType.HEATMAP === this.uiOption.layers[this.uiOption.layerNum].type) {

        shelf.splice(idx, 1);
        return true;
      }
    }

    return false;
  }
}
