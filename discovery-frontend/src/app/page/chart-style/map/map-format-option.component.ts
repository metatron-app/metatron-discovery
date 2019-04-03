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

import { FormatOptionComponent } from '../format-option.component';
import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Shelf } from '../../../domain/workbook/configurations/shelf/shelf';
import { Pivot } from '../../../domain/workbook/configurations/pivot';
import { Field as AbstractField } from '../../../domain/workbook/configurations/field/field';
import * as _ from 'lodash';
import { UIMapOption } from '../../../common/component/chart/option/ui-option/map/ui-map-chart';
import { Format } from '../../../domain/workbook/configurations/format';

@Component({
  selector: 'map-format-option',
  templateUrl: './map-format-option.component.html'
})
export class MapFormatOptionComponent extends FormatOptionComponent {

  public shelf : Shelf;

  // 개별포맷 정보가 바뀐 경우
  @Output('changeEach')
  public changeEachEvent: EventEmitter<any> = new EventEmitter();

  @Input('shelf')
  public set setShelf(shelf: Shelf) {

    if (shelf === undefined) {
      this.shelf = new Shelf();
    } else {
      this.shelf = shelf;
    }

    // shelf 정보에서 매저만 골라낸다
    const fieldList: AbstractField[] = _.cloneDeep(this.shelf.layers[(<UIMapOption>this.uiOption).layerNum].fields);
    for( let num: number = fieldList.length - 1 ; num >= 0 ; num-- ) {
      if( "measure" != fieldList[num].type.toLowerCase() ) {
        fieldList.splice(num, 1);
      }
    }

    // 이전 필드목록의 포맷타입을 승계한다.
    for( let afterField of fieldList ) {
      // 공간연산 실행시 custom field가 있기 때문에 validation 추가함
      if(afterField.name == 'count' && !_.isUndefined(afterField['isCustomField']) && afterField['isCustomField'] == true) {
        continue;
      }
      let isBeforeFormat: boolean = false;
      for( let beforeField of this.fieldList ) {
        if( afterField.name == beforeField.name && afterField.aggregationType == beforeField.aggregationType ) {
          afterField.format == beforeField.format;
          isBeforeFormat = true;
          break;
        }
      }
      if( !isBeforeFormat && !afterField.format ) {
        afterField.format = this.format;

        // 현재 필드의 포맷변경
        _.concat(this.pivot.columns, this.pivot.rows, this.pivot.aggregations).forEach((field) => {
          if( field.type == 'measure' && field.name == afterField.name && field.aggregationType == afterField.aggregationType ) {
            field.format = this.format;
          }
        });

        // 이벤트 발생
        this.changeEachEvent.emit(this.shelf);
      }
    }

    // 필드 목록 치환
    this.fieldList = fieldList;

    // UI Option 반영
    if( this.format ) {
      this.apply();
    }
  }

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /**
   * change format
   * @param {Object} target
   */
  public onChange(target: Object): void {

    // 포맷
    this.format = target as Format;

    // 모든 매저의 포맷변경
    this.shelf.layers[(<UIMapOption>this.uiOption).layerNum].fields.forEach((field) => {
      if( field.type == 'measure' ) {
        field.format = this.format;
      }
    });

    // 이벤트 발생
    this.changeEachEvent.emit(this.shelf);
    this.changeCommonEvent.emit(this.format);

    // UI Option 반영
    this.apply();
  }
}
