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
import {
  Component,
  ElementRef, EventEmitter, HostListener,
  Injector,
  Input,
  OnChanges, OnDestroy,
  OnInit, Output,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { DatasourceService } from '../../../datasource/service/datasource.service';
import { BoundFilter } from '../../../domain/workbook/configurations/filter/bound-filter';
import { AbstractComponent } from '../../../common/component/abstract.component';

declare let $;

@Component({
  selector: 'bound-filter',
  templateUrl: './bound-filter.component.html'
})
export class BoundFilterComponent extends AbstractComponent implements OnInit, OnChanges, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild('rangeSlider')
  private _rangeSlider: ElementRef;

  @ViewChild('inputMinValue')
  private _inputMinValue: ElementRef;

  @ViewChild('inputMaxValue')
  private _inputMaxValue: ElementRef;

  private _$rangeSlider: any;
  private _$inputMin: JQuery;
  private _$inputMax: JQuery;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public filter: BoundFilter;

  // 필터
  @Input('filter')
  public inputFilter: BoundFilter;

  @Output()
  public change: EventEmitter<BoundFilter> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected datasourceService: DatasourceService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 컴포넌트 초기 실행
   */
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const filterChanges: SimpleChange = changes.inputFilter;
    if (filterChanges && filterChanges.currentValue) {
      const currFilter: BoundFilter = _.cloneDeep(filterChanges.currentValue);
      this.filter = currFilter;
      this._setSlider(currFilter.min, currFilter.max, currFilter.minValue, currFilter.maxValue);
    }
  } // function - ngOnChanges

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    this._$inputMin = $(this._inputMinValue.nativeElement);
    this._$inputMax = $(this._inputMaxValue.nativeElement);
  } // function - ngAfterViewInit

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * Document Click Handler ( input class 제거 )
   * @param target
   */
  @HostListener('document:click', ['$event.target'])
  documentClickHandler(target) {
    const $target = $(target);
    if (!$target.hasClass('ddp-input-apply') && 0 === $target.closest('.ddp-input-apply').length) {
      this.resetMinValue();
      this.resetMaxValue();
    }
  } // function - documentClickHandler

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 데이터 조회
   * @return {BoundFilter}
   */
  public getData(): BoundFilter {
    return this.filter;
  } // function - getData

  /**
   * 필터 설정
   * ( 컴포넌트 재실행 없이 강제적으로 데이터를 적용하기 위해 이용하는 메서드.. > 추후 다른 방법으로 변경 필요 )
   * @param {BoundFilter} filter
   */
  public setFilter(filter: BoundFilter) {
    this.filter = _.cloneDeep(filter);
    this._setSlider(filter.min, filter.max, filter.minValue, filter.maxValue);
  } // function - setFilter

  /**
   * 최소값 설정 - 키보드 이벤트
   * @param {KeyboardEvent} event
   */
  public setMinValueByEnter(event: KeyboardEvent) {

    if (this.filter.min !== this._$inputMin.val()) {
      this._$inputMin.parent().addClass('ddp-edit');
    } else {
      this._$inputMin.parent().removeClass('ddp-edit');
    }

    if (13 === event.keyCode) {
      this.setMinValue();
    }
  } // function - setMinValueByEnter

  /**
   * 최소값 설정
   */
  public setMinValue() {
    this._$inputMin.parent().removeClass('ddp-edit');
    let inputValue: string = <string>this._$inputMin.val();
    if (/^[+-]?\d+(\.\d+)?$/gi.test(inputValue)) {
      let numValue: number = +inputValue;
      // Validation
      if (numValue < this.filter.minValue) numValue = this.filter.minValue;
      if (numValue > this.filter.maxValue) numValue = this.filter.maxValue;

      if (numValue !== this.filter.min) {
        (numValue > this.filter.max) && (this.filter.max = numValue);
        this.filter.min = numValue;
        this._setSlider(this.filter.min, this.filter.max);
      }
    }
  } // function - setMinValue

  /**
   * 최소값 초기화
   */
  public resetMinValue() {
    const $inputContainer: JQuery = this._$inputMin.parent();
    if ($inputContainer.hasClass('ddp-edit')) {
      $inputContainer.removeClass('ddp-edit');
      this._inputMinValue.nativeElement.value = this.filter.min;
    }
  } // function - resetMinValue

  /**
   * 최대값 설정 - 키보드 이벤트
   * @param {KeyboardEvent} event
   */
  public setMaxValueByEnter(event: KeyboardEvent) {

    if (this.filter.max !== this._$inputMax.val()) {
      this._$inputMax.parent().addClass('ddp-edit');
    } else {
      this._$inputMax.parent().removeClass('ddp-edit');
    }

    if (13 === event.keyCode) {
      this.setMaxValue();
    }
  } // function - setMaxValueByEnter

  /**
   * 최대값 설정
   */
  public setMaxValue() {
    this._$inputMax.parent().removeClass('ddp-edit');
    let inputValue: string = <string>this._$inputMax.val();
    if (/^[+-]?\d+(\.\d+)?$/gi.test(inputValue)) {
      let numValue: number = +inputValue;
      if (numValue < this.filter.minValue) numValue = this.filter.minValue;
      if (numValue > this.filter.maxValue) numValue = this.filter.maxValue;

      if (numValue !== this.filter.max) {
        (numValue < this.filter.min) && (this.filter.min = numValue);
        this.filter.max = numValue;
        this._setSlider(this.filter.min, this.filter.max);
      }
    }
  } // function - setMaxValue

  /**
   * 최대값 초기화
   */
  public resetMaxValue() {
    const $inputContainer: JQuery = this._$inputMax.parent();
    if ($inputContainer.hasClass('ddp-edit')) {
      $inputContainer.removeClass('ddp-edit');
      this._inputMaxValue.nativeElement.value = this.filter.max;
    }
  } // function - resetMaxValue

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 슬라이더 설정
   * @param {number} from
   * @param {number} to
   * @param {number} min
   * @param {number} max
   * @private
   */
  private _setSlider(from: number, to: number, min?: number, max?: number) {
    if (this._$rangeSlider) {
      const slider = this._$rangeSlider.data('ionRangeSlider');
      slider.update({ from: from, to: to });
      // this.change.emit(this.filter);
    } else {
      const scope = this;
      this._$rangeSlider = $(this._rangeSlider.nativeElement);
      this._$rangeSlider.ionRangeSlider(
        {
          min: min,
          max: max,
          from: from,
          to: to,
          type: 'double',
          onChange(data) {
            scope._updateBoundValue(data);
          },
          onFinish(data) {
            scope._updateBoundValue(data);
            scope.change.emit(scope.getData());
          }
        }
      );
    }
  } // function - _setSlider

  /**
   * 슬라이더 변경 이벤트 발생 시 슬라이터 값을 로컬 변수에 업데이트
   * @param {any} data
   * @private
   */
  private _updateBoundValue(data: { min: number, max: number, from: number, to: number }): void {
    this.filter.min = data.from;
    this.filter.max = data.to;
    this.safelyDetectChanges();
  } // function - _updateBoundValue

}
