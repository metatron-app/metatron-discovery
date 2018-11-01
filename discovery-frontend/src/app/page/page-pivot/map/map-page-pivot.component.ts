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

import {Component, ElementRef, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {PagePivotComponent} from "../page-pivot.component";
import {Pivot} from "../../../domain/workbook/configurations/pivot";
import { Field as AbstractField } from '../../../domain/workbook/configurations/field/field';
import { BIType, Field, FieldPivot, FieldRole, LogicalType } from '../../../domain/datasource/datasource';
import { DimensionField } from '../../../domain/workbook/configurations/field/dimension-field';
import { AggregationType, MeasureField } from '../../../domain/workbook/configurations/field/measure-field';
import {
  GranularityType, TimestampField, TimeUnit,
  ByTimeUnit
} from '../../../domain/workbook/configurations/field/timestamp-field';
import {
  ChartType, SeriesType, ShelveFieldType,
  UIFormatType, ShelveType, EventType, BarMarkType, UIFormatCurrencyType, UIFormatNumericAliasType
} from '../../../common/component/chart/option/define/common';

import * as _ from 'lodash';

@Component({
  selector: 'map-page-pivot',
  templateUrl: './map-page-pivot.component.html'
})
export class MapPagePivotComponent extends PagePivotComponent implements OnInit, OnDestroy {
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

  @Input('pivot')
  set setPivot(pivot: Pivot) {

    if (pivot === undefined) {
      this.pivot = new Pivot();
      this.pivot.columns = [];
      this.pivot.rows = [];
      this.pivot.aggregations = [];
    } else {
      this.pivot = pivot;

      for(let column of this.pivot.columns) {
        if(column["layerNum"] > this.layerNum) {
          this.layerNum = column["layerNum"];
          this.changeLayer(this.layerNum);
        }
      }
    }

    this.changePivot(EventType.CHANGE_PIVOT);
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
    * 선반정보 변경시
    */
   public changePivot(eventType?: EventType) {

     this.pivot.columns = this.pivot.columns.map(this.checkAliasMap);
     this.pivot.rows = this.pivot.rows.map(this.checkAliasMap);
     this.pivot.aggregations = this.pivot.aggregations.map(this.checkAliasMap);

     //색상,크기 기준이 measuer일때 필드리스트
     let measureList = new Array(new Array(), new Array(), new Array());

     for(let aggregation of this.pivot.aggregations) {
       let fieldAlias = aggregation.field["alias"];
       if(!fieldAlias) fieldAlias = aggregation.name;
       if(aggregation.fieldAlias) fieldAlias = aggregation.fieldAlias;

       if(!aggregation["layerNum"] || aggregation["layerNum"] === 1) {
         measureList[0].push(aggregation.aggregationType + '(' + fieldAlias + ')');
       } else if(aggregation["layerNum"] === 2) {
         measureList[1].push(aggregation.aggregationType + '(' + fieldAlias + ')');
       } else if(aggregation["layerNum"] === 3) {
         measureList[2].push(aggregation.aggregationType + '(' + fieldAlias + ')');
       }
     }

     this.uiOption["measureList"] = measureList;

     //선반에 dimension 추가되면 option panel 색상에 자동으로 dimension 선택, 해당 필드 선택
     if(this.pivot.columns.length > this.columnsCnt) {
       let column = this.pivot.columns[this.pivot.columns.length-1];
       let layerNum = column["layerNum"];
       if(!layerNum) layerNum = 1;
       if(this.uiOption.layers[layerNum-1].color.by === 'NONE' && column.field.logicalType && column.field.logicalType.toString().indexOf('GEO') !== 0) {
         this.uiOption.layers[layerNum-1].color.by = 'DIMENSION';
         this.uiOption.layers[layerNum-1].color.column = column.name;
         this.uiOption.layers[layerNum-1].color.schema = 'SC1';
       }
       // this.uiOption.toolTip["displayColumns"].push(column.name);
     }

     //선반에 measure 추가되면 option panel 색상에 자동으로 measure 선택, 해당 필드 선택

     if(this.pivot.aggregations.length > this.aggregationsCnt) {
       let aggregation = this.pivot.aggregations[this.pivot.aggregations.length-1];
       let layerNum = aggregation["layerNum"];
       if(!layerNum) layerNum = 1;
       let fieldAlias = aggregation.field["alias"];
       if(!fieldAlias) fieldAlias = aggregation.name;
       if(aggregation.fieldAlias) fieldAlias = aggregation.fieldAlias;

       // only event type is changePivot, set color as measure color
       if (EventType.CHANGE_PIVOT == eventType) {

         if(this.uiOption.layers[layerNum-1].color.by === 'NONE' || this.uiOption.layers[layerNum-1].color.by === 'DIMENSION') {
           this.uiOption.layers[layerNum-1].color.by = 'MEASURE';
           this.uiOption.layers[layerNum-1].color.column = aggregation.aggregationType + '(' + fieldAlias + ')';
           this.uiOption.layers[layerNum-1].color.schema = 'VC1';

         } else {
           this.uiOption.layers[layerNum-1].size.by = 'MEASURE';
           this.uiOption.layers[layerNum-1].size.column = aggregation.aggregationType + '(' + fieldAlias + ')';
         }

       }

     }

     // Aggregation type change
     if( _.eq(eventType, EventType.AGGREGATION) ) {
       let aggregation = this.pivot.aggregations[this.pivot.aggregations.length-1];
       let layerNum = aggregation["layerNum"];
       let fieldAlias = aggregation.field["alias"];
       if(!fieldAlias) fieldAlias = aggregation.name;
       if(aggregation.fieldAlias) fieldAlias = aggregation.fieldAlias;
       this.uiOption.layers[layerNum-1].color.column = aggregation.aggregationType + '(' + fieldAlias + ')';
       this.uiOption.layers[layerNum-1].size.column = aggregation.aggregationType + '(' + fieldAlias + ')';
     }

     this.aggregationsCnt = this.pivot.aggregations.length;
     this.columnsCnt = this.pivot.columns.length;

     this.changePivotEvent.emit({ pivot: this.pivot, eventType: eventType });
   }

   public changeLayer(layerNum: number): void {
     let pivotChanged: boolean = false;

     if(layerNum < this.layerNum) {
       for(let column of this.pivot.columns) {
         if(column["layerNum"] === this.layerNum) {
           this.removeField("event", FieldPivot.COLUMNS, this.pivot.columns, this.pivot.columns.indexOf(column));
           pivotChanged = true;
         }
       }

       for(let aggregation of this.pivot.aggregations) {
         if(aggregation["layerNum"] === this.layerNum) {
           this.removeField("event", FieldPivot.AGGREGATIONS, this.pivot.aggregations, this.pivot.aggregations.indexOf(aggregation));
           pivotChanged = true;
         }
       }

       this.layerNum = layerNum;
     } else {
      for(let column of this.pivot.columns) {
        if(!column["layerNum"]) column["layerNum"] = 1;
        if(column.field["logicalType"].toString().indexOf('GEO') > -1 && column["layerNum"] === this.layerNum) {
          this.layerNum = layerNum;
        }
      }
     }

     this.uiOption["layerCnt"] = this.layerNum;

     // pivot이 변경될때만 실행되도록
     if(pivotChanged) this.changePivot();
   }

   /**
    * 선반 삭제
    * @param shelf
    * @param {number} idx
    */
   public removeField(event: any, fieldPivot: FieldPivot, shelf, idx: number) {

     // 선반에서 필드제거
     let field: AbstractField = shelf.splice(idx, 1)[0];

     // 필드의 선반정보 제거
     field.field.pivot.splice(field.field.pivot.indexOf(fieldPivot), 1);

     let layerNum = field["layerNum"]-1;

     if(!field["layerNum"]) {
       layerNum = 0;
     }

     if(field.field.pivot.length === 0) {
       this.uiOption.layers[layerNum]["color"].by = "NONE";
       if(layerNum === 0) {
         this.uiOption.layers[layerNum]["color"].schema = "#602663";
       } else if(layerNum === 1) {
         this.uiOption.layers[layerNum]["color"].schema = "#888fb4";
       } else if(layerNum === 2) {
         this.uiOption.layers[layerNum]["color"].schema = "#bccada";
       }
       this.uiOption.layers[layerNum]["size"].by = "NONE";
       this.uiOption.layers[layerNum]["color"]["customMode"] = undefined;
     } else {

     }

     // 이벤트
     this.changePivot(EventType.CHANGE_PIVOT);
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

         return isText ? '1+ Dimension (GEO type)' : 'ddp-box-dimension';

     }

     return '';
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

     // 개수체크
     let count: number = 0;
     for (let field of this.pivot.columns) {
       if (field && field.field && field.field.logicalType &&
           field.field.logicalType.toString().indexOf("GEO") > -1 && (_.eq(field.type, ShelveFieldType.DIMENSION) || _.eq(field.type, ShelveFieldType.TIMESTAMP))) {
         count++;
       }
     }
     return count < 1;
   }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
   private checkAliasMap(field: AbstractField) {

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
}
