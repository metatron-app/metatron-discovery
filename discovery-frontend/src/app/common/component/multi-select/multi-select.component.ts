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
  Component, ElementRef, EventEmitter, HostListener,
  Injector, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { AbstractComponent } from '../abstract.component';

@Component({
  selector: 'component-multi-select',
  templateUrl: './multi-select.component.html'
})
export class MultiSelectComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 보여줄 문자열
  public viewText: string;

  // 리스트 객체
  public array: any[];

  @Input('array')
  set setArray(array: any) {
    this.array = array;

    if (this.array != null && this.array.length > 0) {
      if (typeof this.array[0] === 'string') {
        this.isStringArray = true;
      }
    }
  }
  // 리스트 객체
  @Input() public selectedArray: any[];
  // 화면에 표시하기 위한 모델의 키
  @Input() public viewKey: string;
  // 화면에 체크 표시하기 위한 모델의 키
  @Input() public checkKey: string;
  // 셀렉트박스를 위로 할 것인지 여부(기본: down)
  @Input() public isUpSelect = false;
  // Placeholder 사용여부 (기본: 사용안함)
  @Input() public usePlaceholder = false;
  // 기본 메시지
  @Input() public unselectedMessage = 'Please select';
  // 비활성화 여부
  @Input() public disabled = false;
  // 옵션이 왼쪽으로 길어지는 여부
  @Input() public isOptionToLeft:boolean = false;

  // 변경 이벤트
  @Output() public onSelected = new EventEmitter();
  // 리스트 표시 전
  @Output() public beforeShowSelectedList = new EventEmitter();


  // 선택 아이템
  public selectedItems: any;

  // 셀렉트 리스트 show/hide 플래그
  public isShowSelectList = false;

  // 외부에서 리스트를 조절하고 싶을 경우
  @Input()
  public isShowSelectListForOutSide = true;

  // 문자열
  public isStringArray = false;


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
    if (this.array != null && this.array.length > 0) {
      if (typeof this.array[0] === 'string') {
        this.isStringArray = true;
      }
    }

    // array check
    if (this.selectedArray == null) {
      this.selectedArray = [];
    }

    // selected 처
    if (this.usePlaceholder === false && this.array.hasOwnProperty('length') && this.array.length > 0) {

      // 첫번째 아이템으로 셋팅
      this.selectedArray = this.array[0];
      // 뷰 텍스트셋팅
      this.viewText = typeof this.array[0] === 'string' ? this.array[0] : this.array[0][this.viewKey];

    } else {
      this.viewText = this.unselectedMessage;
    }

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

  // 선택이벤트
  public selected(item: any, $event: any) {
    if ($event.currentTarget.checked) {
      this.selectedArray.push(item);
    } else {
      const idx = this.selectedArray.indexOf(item);
      this.selectedArray.splice(idx, 1);
    }

    if (this.selectedArray == null || this.selectedArray.length === 0)  {
      this.viewText = this.unselectedMessage;
    } else {
      if (typeof item === 'string') {
        this.viewText = this.selectedArray.join(',');
      } else {
        this.viewText = this.selectedArray.map((selectedItem) => {
          return selectedItem[this.viewKey];
        }).join(',');
      }
    }


    // 이벤트 발생
    // this.onSelected.emit(item);
    this.onSelected.emit(this.selectedArray);
  }

  // 선택 아이템
  public getSelectedArray() {
    return this.selectedArray;
  }

  // 컴포넌트 내부  host 클릭이벤트 처리
  @HostListener('document:click', ['$event'])
  public onClickHost(event) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // 팝업창 닫기
      this.isShowSelectList = false;
    }
  }

  public setDisable() {
    this.disabled = true;
  }

  public setEnable() {
    this.disabled = false;
  }

  // 셀렉트박스 온오프
  public toggleSelectList() {
    this.isShowSelectList = !this.isShowSelectList;
    this.beforeShowSelectedList.emit(this.isShowSelectList);
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
