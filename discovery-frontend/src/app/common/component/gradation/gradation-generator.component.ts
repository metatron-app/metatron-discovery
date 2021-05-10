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

import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '../abstract.component';

declare const gradX: any;
declare const gradx: any;

@Component({
  selector: 'gradation-generator',
  templateUrl: './gradation-generator.component.html'
})
export class GradationGeneratorComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constant Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // gradation 변경 이벤트 발생시
  @Output('changeGradation')
  private changeGradation: EventEmitter<object> = new EventEmitter();
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // slider list
  public sliderList: object[];

  // visualMap에 설정되는 slider list
  public displaySliders: object[];

  public gradxObj: any;

  // 현재 선택된값
  public currentValue: string;

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

    gradx.destroy();

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * initialize
   * @param sliders
   * @param data
   * @param initFl 최초설정여부
   */
  public init(sliders: any, data: any, initFl?: boolean): object {

    this.sliderList = sliders;

    this.gradxObj = gradX('#gradX2', {

      direction: 'left',
      sliders: Object.assign([], this.sliderList),
      min: data.min,
      max: data.max,
      positionMin: data.positionMin,
      positionMax: data.positionMax,
      separateValue: data.separateValue,
      type: 'linear',
      code_shown: false,
      change: (sliderList, _values, displaySliders, currentValue) => {

        // visualMap에 설정되는 리스트
        this.displaySliders = displaySliders;

        // 변경된 sliders값을 설정
        this.sliderList = sliderList;

        // change emit을 사용하는경우에만
        if (!initFl) {
          // 변경된 sliderList emit
          this.changeGradation.emit({
            ranges: this.sliderList,
            visualGradations: this.displaySliders,
            currentValue: currentValue,
            currentSliderIndex: gradx.sliders.indexOf(gradx.get_current_slider(gradx.current_slider_id))
          });
        } else {
          initFl = false;
        }
      }
    });

    return {ranges: this.sliderList, visualGradations: this.displaySliders};
  }

  /**
   * 해당 슬라이더의 색상을 변경
   * @param sliderId
   * @param rgbColor
   */
  public changeGradationColor(sliderId: string, rgbColor: string): void {
    gradx.set_slider_id_color(sliderId, rgbColor);
  }

  /**
   * 해당 index에 해당하는 위치앞의 색상의 범위를 추가
   * @param index
   */
  public addNewRangeIndex(index: number): void {

    gradx.add_new_range_index(index);
  }

  /**
   * 색상의 범위 삭제
   */
  public deleteRange(currentIndex): void {

    gradx.delete_range(currentIndex);
  }

  /**
   * 색상범위 균등분할
   */
  public equalizeRange(): void {

    gradx.equalize_slider();
  }

  /**
   * 해당 슬라이더로 선택해제
   * @param sliderId
   */
  public unselectSlider(sliderId?: number): void {

    gradx.remove_select_class(sliderId);
  }

  /**
   * 선택된값의 값 변경
   */
  public changeSliderValue(value: string): void {

    gradx.change_value_current_index(value);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
