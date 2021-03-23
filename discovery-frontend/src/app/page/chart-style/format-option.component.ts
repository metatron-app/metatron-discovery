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
  Component, ElementRef, Injector, OnDestroy, OnInit, Input, ViewChild,
  Output, EventEmitter
} from '@angular/core';
import { Field as AbstractField } from '../../domain/workbook/configurations/field/field';
import {Pivot} from "../../domain/workbook/configurations/pivot";
import * as _ from 'lodash';
import {Format} from "../../domain/workbook/configurations/format";
import {UIOption, UIChartFormat} from "../../common/component/chart/option/ui-option";
import {CustomField} from "../../domain/workbook/configurations/field/custom-field";
import {FormatItemComponent} from "./format/format-item.component";
import {BaseOptionComponent} from "./base-option.component";

@Component({
  selector: 'format-option',
  templateUrl: './format-option.component.html'
})
export class FormatOptionComponent extends BaseOptionComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('commonFormat')
  private commonFormatComp: FormatItemComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 개별포맷 정보가 바뀐 경우
  @Output('changeEach')
  public changeEachEvent: EventEmitter<any> = new EventEmitter();

  // 공통포맷 정보가 바뀐 경우
  @Output('changeCommon')
  public changeCommonEvent: EventEmitter<any> = new EventEmitter();

  // 개별 필드 목록
  public fieldList: AbstractField[] = [];

  // Pivot 데이터
  public pivot: Pivot;

  // 공통 포맷
  public format: Format;

  ////////////////////////////////////////////////
  ///// Input
  ////////////////////////////////////////////////

  @Input('pivot')
  set setPivot(pivot: Pivot) {

    if (pivot === undefined) {
      this.pivot = new Pivot();
      this.pivot.columns = [];
      this.pivot.rows = [];
      this.pivot.aggregations = [];
    } else {

      // 포멧 설정후 다른 contextmenu클릭시 pivot값이 입력되어서 차트가 두번그려지는 현상 발생
      // pivot값이 기존pivot값과 다른경우에만 진행 by juhee
      //if (_.eq(this.pivot, pivot)) return;

      this.pivot = pivot;
    }

    // Pivot 정보에서 매저만 골라낸다
    const fieldList: AbstractField[] = _.cloneDeep(_.concat(this.pivot.columns, this.pivot.rows, this.pivot.aggregations));
    for( let num: number = fieldList.length - 1 ; num >= 0 ; num-- ) {
      if( "measure" != fieldList[num].type.toLowerCase() ) {
        fieldList.splice(num, 1);
      }
    }

    // 이전 필드목록의 포맷타입을 승계한다.
    for( let afterField of fieldList ) {
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
        this.changeEachEvent.emit(this.pivot)
      }
    }

    // 필드 목록 치환
    this.fieldList = fieldList;

    // UI Option 반영
    if( this.format ) {
      this.apply();
    }
  }

  //@Input('format')
  set setFormat(format: Format) {

    if( !format ) {

      if (this.uiOption && this.uiOption.valueFormat) {
        format = this.uiOption.valueFormat;
      }
      else {
        return;
      }
    }

    // 공통적용 포맷
    this.format = format;
  }

  @Input('uiOption')
  public set setUiOption(uiOption: UIOption) {

    // Set
    this.uiOption = uiOption;

    // Format 세팅
    this.setFormat = this.uiOption.valueFormat;
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
   * 필드의 포맷타입을 변경한다.
   * @param field
   */
  public setFormatType(field: AbstractField): void {

    // 공통적용 포맷
    this.format = field.format;

    // 모든 개별포맷에도 적용
    this.onChange(this.format);
  }

  public onChange(target: Object): void {

    // 포맷
    this.format = target as Format;

    // 모든 매저의 포맷변경
    _.concat(this.pivot.columns, this.pivot.rows, this.pivot.aggregations).forEach((field) => {
      if( field.type == 'measure' ) {
        field.format = this.format;
      }
    });

    // 이벤트 발생
    this.changeEachEvent.emit(this.pivot);
    this.changeCommonEvent.emit(this.format);

    // UI Option 반영
    this.apply();
  }

  /**
   * Individual일때 각 Measure명 반환
   */
  public getFieldNmae(field: CustomField): string {

    const name: string = field.alias ? field.alias : field.fieldAlias ? field.fieldAlias : field.name;

    if( !field.aggregated && field.aggregationType && (!field.alias || field.alias == field.name) ) {
      return field.aggregationType+'('+name+')';
    }
    else {
      return name;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * UI Option 반영
   */
  protected apply(): void {

    // UI Option Format 변경
    const uiFormat: UIChartFormat = {
      isAll: true,
      type: this.format.type,
      sign: this.format.sign,
      decimal: this.format.decimal,
      useThousandsSep: this.format.useThousandsSep,
      customSymbol: this.format.customSymbol,
      abbr: this.format.abbr
    };
    this.uiOption = <UIOption>_.extend({}, this.uiOption, { valueFormat: uiFormat });

    // 이벤트 발생
    this.update();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
