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

import { AbstractComponent } from '../../../common/component/abstract.component';
import { Component, ElementRef, Injector, Input } from '@angular/core';
import { Field } from '../../../domain/datasource/datasource';
import { isUndefined } from 'util';
import { DragDropConfig, DragDropService, DragDropSortableService, SortableContainer } from 'ng2-dnd';

@Component({
  selector: 'app-set-filter-order',
  templateUrl: './set-filter-order.component.html',
  providers: [DragDropService, DragDropConfig, DragDropSortableService]
})
export class SetFilterOrderComponent extends AbstractComponent {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('connType')
  public connType: string;

  // 팝업 플래그
  public isShow: boolean = false;

  // 필드 리스트
  public fields: Field[];


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // init
  public init(fields) {
    // 필드 리스트
    this.fields = fields;
    // filteringSeq 순서로 정렬
    this.fields = this.fields.sort((prev, next) => {
      return prev.filteringSeq - next.filteringSeq;
    });
    // flag
    this.isShow = true;
  }

  // 창 닫기
  public close() {
    this.isShow = false;
  }

  // 정렬 순서 변경
  public changeOrder() {
    // 변경된 순서 저장
    this.fields.forEach((field, index) => {
      field.filteringSeq = index;
    });

    // 창 닫기
    this.isShow = false;
  }

  // icon get
  public getIconClass(itemType: string): string {
    let result = '';
    if (isUndefined(itemType)) {
      result = 'ddp-icon-type-ab';
    } else {
      switch (itemType.toUpperCase()) {
        case 'TIMESTAMP':
          result = 'ddp-icon-type-calen';
          break;
        case 'BOOLEAN':
          result = 'ddp-icon-type-tf';
          break;
        case 'TEXT':
        case 'DIMENSION':
        case 'STRING':
          result = 'ddp-icon-type-ab';
          break;
        case 'USER_DEFINED':
          result = 'ddp-icon-type-ab';
          break;
        case 'INT':
        case 'INTEGER':
        case 'LONG':
          result = 'ddp-icon-type-int';
          break;
        case 'DOUBLE':
          result = 'ddp-icon-type-int';
          result = 'ddp-icon-type-float';
          break;
        case 'LNG':
        case 'LATITUDE':
          result = 'ddp-icon-type-latitude';
          break;
        case 'LNT':
        case 'LONGITUDE':
          result = 'ddp-icon-type-longitude';
          break;
        default:
          console.error('정의되지 않은 아이콘 타입입니다.', itemType);
          break;
      }
    }
    return result;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
}
