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
import { Field as AbstractField } from '../../../domain/workbook/configurations/field/field';
import { BIType, Field, FieldPivot, LogicalType } from '../../../domain/datasource/datasource';
import {
  EventType,
  ShelveType,
  UIFormatCurrencyType, UIFormatNumericAliasType,
  UIFormatType
} from '../../../common/component/chart/option/define/common';

import * as _ from 'lodash';
import { UIMapOption } from '../../../common/component/chart/option/ui-option/map/ui-map-chart';
import { MapBy } from '../../../common/component/chart/option/define/map/map-common';
import { AbstractComponent } from '../../../common/component/abstract.component';
import { TimestampField } from '../../../domain/workbook/configurations/field/timestamp-field';
import { DimensionField } from '../../../domain/workbook/configurations/field/dimension-field';
import { MeasureField } from '../../../domain/workbook/configurations/field/measure-field';
import { PageWidget, PageWidgetConfiguration } from '../../../domain/dashboard/widget/page-widget';
import { Filter } from '../../../domain/workbook/configurations/filter/filter';
import { PagePivotComponent } from '../page-pivot.component';
import { Shelf } from '../../../domain/workbook/configurations/shelf/shelf';

@Component({
  selector: 'map-page-pivot',
  templateUrl: './map-page-pivot.component.html'
})
export class MapPagePivotComponent extends PagePivotComponent {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public aggregationsCnt: number = 0;
  public columnsCnt: number = 0;

  @Input('widget')
  public widget: PageWidget;

  public uiOption: UIMapOption;

  @Input('uiOption')
  public set setUIOption(uiOption: UIMapOption) {

    if (!uiOption.layerNum) uiOption.layerNum = 0;

    this.uiOption = uiOption;
  }

  public shelf: Shelf;

  @Input('pivot')
  set setPivot(pivot: Pivot) {

    this.pivot = pivot;
  }

  // layer에 따라서 해당 index에 설정하기
  @Input('shelf')
  set setShelf(shelf: Shelf) {

    // convert shelf from pivot
    if (0 === shelf.layers[this.uiOption.layerNum].length) {
      _.forEach(this.pivot, (value, key) => {
        this.pivot[key].map((item) => {
          shelf.layers[this.uiOption.layerNum].push(item);
        });
      });
    }

    this.shelf = shelf;

    this.changeShelf();
  }

  // Pivot 정보가 바뀐 경우
  @Output('changeShelf')
  public changeShelfEvent: EventEmitter<any> = new EventEmitter();

  /**
   * 선반정보 변경시
   */
  public changeShelf(eventType?: EventType) {
    this.changeShelfEvent.emit({ shelf: this.shelf, eventType: eventType });
  }

  // public layers: [AbstractField[]];

  // Widget Config 데이터
  public widgetConfig: PageWidgetConfiguration;

  // Widget 데이터의 필터 목록 (필드명만 정제)
  public filterFiledList: String[] = [];

  public globalFilters: Filter[] = [];

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

    console.log(targetContainer);

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
        //timeField.alias = timeField.granularity.toString().toUpperCase() + `(${targetField.name})`;
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
      // 선반의 dimension / measure값의 중복된값 제거, measure aggtype 설정
      // TODO map shelf
      // if (!this.distinctPivotItems(field, idx, shelf, targetContainer)) {
      if (true) {

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
      }

      // 차트별 선반 조건에 따른 차원 / 측정값 제한설정
      // TODO map shelf
      // this.chartShelveLimit(this.chartType, targetContainer, shelf);
      //
      // // 선반 정보 변경시 (선반피봇팅 조건 이미 설정하였으므로 true)
      this.changePivot(EventType.CHANGE_PIVOT);
      //
      // // 선반 total width 설정, 애니메이션 여부 설정
      if (shelfElement) this.onShelveAnimation(shelfElement.find('.ddp-wrap-default'));
    }

    // template 에서 생성한 경우 추가된 선반필드는 적용이 되지 않음 그래서 처리
    this.editFieldLayerDirective.exclude = '.ddp-icon-layer';
  }

   /**
    * 선반정보 변경시
    */
   public changePivot(eventType?: EventType) {

     this.shelf.layers[this.uiOption.layerNum] = this.shelf.layers[this.uiOption.layerNum].map(this.checkAlias);

     this.changeShelfEvent.emit({ shelf: this.shelf, eventType: eventType });

     // let measureList = new Array(new Array(), new Array(), new Array());

     // for(let aggregation of this.pivot.aggregations) {
     //   let fieldAlias = aggregation.field["alias"];
     //   if(!fieldAlias) fieldAlias = aggregation.name;
     //   if(aggregation.fieldAlias) fieldAlias = aggregation.fieldAlias;
     //
     //   if(!aggregation["layerNum"] || aggregation["layerNum"] === 1) {
     //     measureList[0].push(aggregation.aggregationType + '(' + fieldAlias + ')');
     //   } else if(aggregation["layerNum"] === 2) {
     //     measureList[1].push(aggregation.aggregationType + '(' + fieldAlias + ')');
     //   } else if(aggregation["layerNum"] === 3) {
     //     measureList[2].push(aggregation.aggregationType + '(' + fieldAlias + ')');
     //   }
     // }

     // this.uiOption["measureList"] = measureList;

     // if(this.pivot.columns.length > this.columnsCnt) {
     //   let column = this.pivot.columns[this.pivot.columns.length-1];
     //   let layerNum = column["layerNum"];
     //   if(!layerNum) layerNum = 1;
     //   if((<UIMapOption>this.uiOption).layers[layerNum-1].color.by === MapBy.NONE && column.field.logicalType && column.field.logicalType.toString().indexOf('GEO') !== 0) {
     //     (<UIMapOption>this.uiOption).layers[layerNum-1].color.by = MapBy.DIMENSION;
     //     (<UIMapOption>this.uiOption).layers[layerNum-1].color.column = column.name;
     //     (<UIMapOption>this.uiOption).layers[layerNum-1].color.schema = 'SC1';
     //   }
     // }

     // if(this.pivot.aggregations.length > this.aggregationsCnt) {
     //   let aggregation = this.pivot.aggregations[this.pivot.aggregations.length-1];
     //   let layerNum = aggregation["layerNum"];
     //   if(!layerNum) layerNum = 1;
     //   let fieldAlias = aggregation.field["alias"];
     //   if(!fieldAlias) fieldAlias = aggregation.name;
     //   if(aggregation.fieldAlias) fieldAlias = aggregation.fieldAlias;
     //
     //   // only event type is changePivot, set color as measure color
     //   if (EventType.CHANGE_PIVOT == eventType) {
     //
     //     if((<UIMapOption>this.uiOption).layers[layerNum-1].color.by === MapBy.NONE || (<UIMapOption>this.uiOption).layers[layerNum-1].color.by === MapBy.DIMENSION) {
     //       (<UIMapOption>this.uiOption).layers[layerNum-1].color.by = MapBy.MEASURE;
     //       (<UIMapOption>this.uiOption).layers[layerNum-1].color.column = aggregation.aggregationType + '(' + fieldAlias + ')';
     //       (<UIMapOption>this.uiOption).layers[layerNum-1].color.schema = 'VC1';
     //
     //     } else {
     //       (<UISymbolLayer>(<UIMapOption>this.uiOption).layers[layerNum-1]).size.by = MapBy.MEASURE;
     //       (<UISymbolLayer>(<UIMapOption>this.uiOption).layers[layerNum-1]).size.column = aggregation.aggregationType + '(' + fieldAlias + ')';
     //     }
     //
     //   }
     // }

     // Aggregation type change
     // if( _.eq(eventType, EventType.AGGREGATION) ) {
     //   let aggregation = this.pivot.aggregations[this.pivot.aggregations.length-1];
     //   let layerNum = aggregation["layerNum"];
     //   let fieldAlias = aggregation.field["alias"];
     //   if(!fieldAlias) fieldAlias = aggregation.name;
     //   if(aggregation.fieldAlias) fieldAlias = aggregation.fieldAlias;
     //   (<UIMapOption>this.uiOption).layers[layerNum-1].color.column = aggregation.aggregationType + '(' + fieldAlias + ')';
     //   (<UISymbolLayer>(<UIMapOption>this.uiOption).layers[layerNum-1]).size.column = aggregation.aggregationType + '(' + fieldAlias + ')';
     // }
     //
     // this.aggregationsCnt = this.pivot.aggregations.length;
     // this.columnsCnt = this.pivot.columns.length;
     //
     // this.changePivotEvent.emit({ pivot: this.pivot, eventType: eventType });
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
   * 선반 삭제
   * @param event
   * @param {FieldPivot} fieldPivot
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
   // if (event) {
   //   let target = $(event.currentTarget.parentElement.parentElement.parentElement.parentElement);
   //
   //   // 선반 total width 설정, 애니메이션 여부 설정
   //   this.onShelveAnimation(target);
   // }

   //
   // let layerNum = field["layerNum"]-1;
   //
   // if(!field["layerNum"]) {
   //   layerNum = 0;
   // }

   let layerNum = this.uiOption.layerNum;

   if(field.field.pivot.length === 0) {
     (<UIMapOption>this.uiOption).layers[layerNum]["color"].by = MapBy.NONE;
     if(layerNum === 0) {
       (<UIMapOption>this.uiOption).layers[layerNum]["color"].schema = "#602663";
     } else if(layerNum === 1) {
       (<UIMapOption>this.uiOption).layers[layerNum]["color"].schema = "#888fb4";
     } else if(layerNum === 2) {
       (<UIMapOption>this.uiOption).layers[layerNum]["color"].schema = "#bccada";
     }
     (<UIMapOption>this.uiOption).layers[layerNum]["size"].by = "NONE";
     (<UIMapOption>this.uiOption).layers[layerNum]["color"]["customMode"] = undefined;
   } else {

   }

   // 이벤트
   this.changePivot(EventType.CHANGE_PIVOT);
  }

  /**
   * 타입(행, 열, 교차)에 따른 가이드 문구 반환
   * @param {string} type
   * @param {boolean} isText
   * @returns {string}
   */
  public getGuideText(type: string, isText: boolean = true): string {

   // 차트 타입 선택전이라면 공백 반환
   // if (this.chartType == '') {
   //   return '';
   // }

   // 행
   if (_.eq(type, ShelveType.COLUMNS)) {

       return isText ? '1+ Dimension (GEO type)' : 'ddp-box-dimension';

   }

   return '';
  }

  /**
   * 타입(행, 열, 교차)에 따른 가이드 표시여부 반환
   * @param {string} type
   * @returns {boolean}
   */
  public isGuide(type: string): boolean {

     // 차트 타입 선택전이라면 false 반환
     // if (this.chartType == '') {
     //   return false;
     // }
     //
     // // 개수체크
     // let count: number = 0;
     // for (let field of this.pivot.columns) {
     //   if (field && field.field && field.field.logicalType &&
     //       field.field.logicalType.toString().indexOf("GEO") > -1 && (_.eq(field.type, ShelveFieldType.DIMENSION) || _.eq(field.type, ShelveFieldType.TIMESTAMP))) {
     //     count++;
     //   }
     // }
     // return count < 1;
     return false;
   }

  /**
   * TODO need to update css
   * set animation in map
   * @param {JQuery} element
   */
  // public onShelveAnimation(element: JQuery) {
  //
  //   let shelfElement: JQuery;
  //
  //   shelfElement = this.$element.find('#shelfColumn' + this.layerNum);
  //
  //   super.onShelveAnimation(shelfElement.find('.ddp-wrap-default'));
  // }

  public openFieldSetting(event, field) {
    if (this.editingField === field) {
      this.editingField = null;
      // this.$editFieldLayer.hide();
      return;
    }

    this.editingField = field;

    // 모든선반에서 같은 field aggregation Type 설정
    let shelves = this.shelf.layers[this.uiOption.layerNum];

    // set field setting
    this.fieldSetting(shelves);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
