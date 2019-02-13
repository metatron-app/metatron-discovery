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
  ElementRef, OnChanges, SimpleChanges, Input, EventEmitter, Output, Component, Injector
} from '@angular/core';
import { RangeSliderResult } from '../../value/range-slider-result';
import { AbstractComponent } from '../../../../common/component/abstract.component';
import { Subject, Subscription, of } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";

declare let $;

@Component({
  selector: 'range-slider-component',
  template: `<input type="text" value=""/>`
})
export class RangeSliderComponent extends AbstractComponent implements OnChanges {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // -----------------------------------------
  //
  // -----------------------------------------

  private currentElement: ElementRef;

  private inputElem: any;

  private initialized = false;

  // -----------------------------------------
  //
  // -----------------------------------------

  private fromPercent: number;

  private fromValue: number;

  private toPercent: number;

  private toValue: number;

  // -------------------------------------------
  //
  // -------------------------------------------

  // 데이터 변경 알림
  private changeFromValueSubject$ = new Subject<number>();

  // 데이터 변경 알림 구독
  private changeFromValueSubjectSubscription: Subscription;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // -----------------------------------------
  //
  // -----------------------------------------

  @Input('min') min: any;

  @Input('max') max: any;

  @Input()
  public from: any;

  @Input()
  public to: any;

  @Input()
  public disable: any;

  // -----------------------------------------
  //
  // -----------------------------------------

  @Input()
  public type: any;

  @Input()
  public step: any;

  @Input()
  public minInterval: any;

  @Input()
  public maxInterval: any;

  @Input()
  public dragInterval: any;

  @Input()
  public values: any;

  @Input()
  public fromFixed: any;

  @Input()
  public fromMin: any;

  @Input()
  public fromMax: any;

  @Input()
  public fromShadow: any;

  @Input()
  public toFixed: any;

  @Input()
  public toMin: any;

  @Input()
  public toMax: any;

  @Input()
  public toShadow: any;

  @Input()
  public prettifyEnabled: any;

  @Input()
  public prettifySeparator: any;

  @Input()
  public forceEdges: any;

  @Input()
  public keyboard: any;

  @Input()
  public keyboardStep: any;

  @Input()
  public grid: any;

  @Input()
  public gridMargin: any;

  @Input()
  public gridNum: any;

  @Input()
  public gridSnap: any;

  @Input()
  public hideMinMax: any;

  @Input()
  public hideFromTo: any;

  @Input()
  public prefix: any;

  @Input()
  public postfix: any;

  @Input()
  public maxPostfix: any;

  @Input()
  public decorateBoth: any;

  @Input()
  public valuesSeparator: any;

  @Input()
  public inputValuesSeparator: any;

  // 여러개의 인스턴스가 있는경우 해당 index
  @Input()
  public currentIndex: number;

  // from 값 전에 나오는 text
  @Input()
  public foreFromText: string;

  // to 값 전에 나오는 text
  @Input()
  public foreToText: string;


  // -----------------------------------------
  //
  // -----------------------------------------

  @Input()
  public prettify: Function;

  // -----------------------------------------
  //
  // -----------------------------------------

  @Output()
  public onStart: EventEmitter<RangeSliderResult> = new EventEmitter<RangeSliderResult>();

  @Output()
  public onChange: EventEmitter<RangeSliderResult> = new EventEmitter<RangeSliderResult>();

  @Output()
  public onFinish: EventEmitter<RangeSliderResult> = new EventEmitter<RangeSliderResult>();

  @Output()
  public onUpdate: EventEmitter<RangeSliderResult> = new EventEmitter<RangeSliderResult>();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 생성자
   * @param elementRef
   * @param injector
   */
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

    this.currentElement = elementRef;

    this.changeFromValueSubjectSubscription = this.changeFromValueSubject$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value) => of<number>(value))
      )
      .subscribe(() => {
        this.onChange.emit(this.buildCallback());
      });

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Init
   */
  public ngOnInit(): void {

    // Init
    super.ngOnInit();

    this.inputElem = this.currentElement.nativeElement.getElementsByTagName('input')[0];

    this.initSlider();
  }

  /**
   * Destroy
   */
  public ngOnDestroy(): void {

    // Destory
    super.ngOnDestroy();

    if (this.changeFromValueSubjectSubscription) {
      this.changeFromValueSubjectSubscription.unsubscribe();
    }
  }

  /**
   * Changes
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized) {

      const update = {};

      for (const propName in changes) {
        update[propName] = changes[propName].currentValue;
      }

      $(this.inputElem).data('ionRangeSlider').update(update);
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 슬라이더 업데이트
   * @param data
   */
  public update(data): void {

    $(this.inputElem)
      .data('ionRangeSlider')
      .update(data);
  }

  /**
   * 슬라이더 복원
   */
  public restore(): void {

    $(this.inputElem)
      .data('ionRangeSlider')
      .restore();
  }

  /**
   * 슬라이더 제거
   */
  public destroy(): void {

    $(this.inputElem)
      .data('ionRangeSlider')
      .destroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 슬라이더 초기화
   */
  private initSlider(): void {

    const scope = this;

    this.initialized = true;

    (<any>$(this.inputElem))
      .ionRangeSlider({

        min: scope.min,
        max: scope.max,
        from: scope.from,
        to: scope.to,
        disable: this.toBoolean(scope.disable),

        type: scope.type,
        step: scope.step,
        min_interval: scope.minInterval,
        max_interval: scope.maxInterval,
        drag_interval: scope.dragInterval,
        values: scope.values,
        from_fixed: this.toBoolean(scope.fromFixed),
        from_min: scope.fromMin,
        from_max: scope.fromMax,
        from_shadow: this.toBoolean(scope.fromShadow),
        to_fixed: this.toBoolean(scope.toFixed),
        to_min: scope.toMin,
        to_max: scope.toMax,
        to_shadow: this.toBoolean(scope.toShadow),
        prettify_enabled: this.toBoolean(scope.prettifyEnabled),
        prettify_separator: scope.prettifySeparator,
        force_edges: this.toBoolean(scope.forceEdges),
        keyboard: this.toBoolean(scope.keyboard),
        keyboard_step: scope.keyboardStep,
        grid: this.toBoolean(scope.grid),
        grid_margin: this.toBoolean(scope.gridMargin),
        grid_num: scope.gridNum,
        grid_snap: this.toBoolean(scope.gridSnap),
        hide_min_max: this.toBoolean(scope.hideMinMax),
        hide_from_to: this.toBoolean(scope.hideFromTo),
        prefix: scope.prefix,
        postfix: scope.postfix,
        max_postfix: scope.maxPostfix,
        decorate_both: this.toBoolean(scope.decorateBoth),
        values_separator: scope.valuesSeparator,
        input_values_separator: scope.inputValuesSeparator,

        prettify: scope.prettify,

        onStart() {
          scope.onStart.emit(scope.buildCallback());
        },
        onChange(v) {
          scope.updateInternalValues(v);
          // scope.onChange.emit(scope.buildCallback());
          scope.changeFromValueSubject$.next(v.from);
        },
        onFinish() {
          scope.onFinish.emit(scope.buildCallback());
        },
        onUpdate() {
          scope.onUpdate.emit(scope.buildCallback());
        }
      });

    // from , to 앞에 text 설정하기
    if (!_.isEmpty(this.foreFromText)) this.$element.find('.irs-min').text(this.foreFromText + ' ' + this.from);
    if (!_.isEmpty(this.foreToText)) this.$element.find('.irs-max').text(this.foreToText + ' ' + this.to);
  }

  /**
   * 슬라이더 변경 이벤트 발생 시 슬라이터 값을 로컬 변수에 업데이트
   * @param {RangeSliderResult} data
   */
  private updateInternalValues(data: RangeSliderResult): void {
    this.min = data.min;
    this.max = data.max;
    this.from = data.from;
    this.fromPercent = data.fromPercent;
    this.fromValue = data.fromValue;
    this.to = data.to;
    this.toPercent = data.toPercent;
    this.toValue = data.toValue;
  }

  /**
   * 이벤트 발생 시 EventEmitter 에 넣어서 넘겨줄 값
   * @returns {RangeSliderResult}
   */
  private buildCallback(): RangeSliderResult {
    const callback = new RangeSliderResult();
    callback.min = this.min;
    callback.max = this.max;
    callback.from = this.from;
    callback.fromPercent = this.fromPercent;
    callback.fromValue = this.fromValue;
    callback.to = this.to;
    callback.toPercent = this.toPercent;
    callback.toValue = this.toValue;
    callback.currentElement = this.$element;
    callback.currentIndex = this.currentIndex;
    return callback;
  }

  /**
   * boolean 인지 검사
   *  - 문자열인 경우 해당 문자열이 'false' 인지 검사
   * @param value
   * @returns {boolean}
   */
  private toBoolean(value): boolean {
    if (value && typeof value === 'string') {
      return value.toLowerCase() !== 'false';
    } else {
      return value;
    }
  }

}
