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

import { ElementRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { AbstractPopupComponent } from '@common/component/abstract-popup.component';
import { Field } from '@domain/datasource/datasource';
import { CustomField } from '@domain/workbook/configurations/field/custom-field';

export class AbstractFilterPopupComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public aggregationTypeList = [
    { name: this.translateService.instant('msg.board.filter.ui.aggregation.sum'), value: 'SUM' },
    { name: this.translateService.instant('msg.board.filter.ui.aggregation.avg'), value: 'AVG' },
    { name: this.translateService.instant('msg.board.filter.ui.aggregation.count'), value: 'COUNT' },
    { name: this.translateService.instant('msg.board.filter.ui.aggregation.min'), value: 'MIN' },
    { name: this.translateService.instant('msg.board.filter.ui.aggregation.max'), value: 'MAX' }
  ];

  public limitTypeList = [
    {
      name: this.translateService.instant('msg.board.filter.ui.limit.top'),
      value: 'TOP',
      description: this.translateService.instant('msg.board.filter.ui.limit.top.des')
    },
    {
      name: this.translateService.instant('msg.board.filter.ui.limit.bottom'),
      value: 'BOTTOM',
      description: this.translateService.instant('msg.board.filter.ui.limit.bottom.des')
    }
  ];

  public conditionTypeList = [
    {
      name: '=',
      value: 'EQUAL_TO',
      description: this.translateService.instant('msg.board.filter.ui.condition.equal.to.des')
    },
    {
      name: '>',
      value: 'GREATER_THAN',
      description: this.translateService.instant('msg.board.filter.ui.condition.greater.than.des')
    },
    {
      name: '<',
      value: 'LESS_THAN',
      description: this.translateService.instant('msg.board.filter.ui.condition.less.than.des')
    },
    {
      name: '>=',
      value: 'EQUAL_GREATER_THAN',
      description: this.translateService.instant('msg.board.filter.ui.condition.equal.greater.than.des')
    },
    {
      name: '<=',
      value: 'EQUAL_LESS_THAN',
      description: this.translateService.instant('msg.board.filter.ui.condition.equal.less.than.des')
    }
  ];

  // 와일드 카드 타입 리스트
  public wildCardTypeList = [
    {
      name: this.translateService.instant('msg.board.filter.ui.wildcard.after'), value: 'AFTER',
      description: this.translateService.instant('msg.board.filter.ui.wildcard.after.des')
    },
    {
      name: this.translateService.instant('msg.board.filter.ui.wildcard.before'), value: 'BEFORE',
      description: this.translateService.instant('msg.board.filter.ui.wildcard.before.des')
    },
    {
      name: this.translateService.instant('msg.board.filter.ui.wildcard.both'), value: 'BOTH',
      description: this.translateService.instant('msg.board.filter.ui.wildcard.both.des')
    }
  ];


  // 대시보드 필드
  public fields: Field[] = [];
  // 대시보드 필드 + 커스텀 필드
  public summaryFields: (Field | CustomField)[] = [];
  // 커스텀 필드
  public customFields: CustomField[] = [];
  // 조건을 위한 MeasureFields
  public summaryMeasureFields: (Field | CustomField)[] = [];

  public uiData: any;

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
    this.uiData = {
      aggregationTypeList: this.aggregationTypeList,
      limitTypeList: this.limitTypeList,
      conditionTypeList: this.conditionTypeList,
      wildCardTypeList: this.wildCardTypeList
    };
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
   * 필드명으로 필드 객체 찾기
   * @param {string} fieldName
   * @return {Field}
   */
  public getField(fieldName: string): any {

    let field: Field | CustomField;
    // 필드 조회
    for (let i = 0, nMax = this.summaryFields.length; i < nMax; i += 1) {
      if (fieldName === this.summaryFields[i].name) {
        field = this.summaryFields[i];
        break;
      }
    }
    return field;
  } // function getField
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
