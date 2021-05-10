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
  selector: 'component-drop-box',
  templateUrl: './drop-box.component.html'
})
export class DropBoxComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // 드롭박스 목록 보이기/감추기
  public isShowSelect = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 리스트 객체
  @Input() public array: any[];
  // 화면에 표시하기 위한 모델의 키
  @Input() public viewKey: string;
  // 기본 선택 인덱스
  @Input() public defaultIndex = 0;

  // 변경 이벤트
  @Output() public onSelected =  new EventEmitter();

  // 선택 아이템
  public selectedItem: any;

  // 기본 메시지
  public unselectedMessage = 'Please select';

  // 셀렉트 리스트 show/hide 플래그
  public isSelectListShow = false;

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

      // 기본 선택 아이템
      this.selectedItem = this.array[0];
      if (this.defaultIndex > 0) {
        this.selectedItem = this.array[this.defaultIndex];
      }
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
  public selected(item: any) {
    this.isShowSelect = false;
    // 선택 변수에 저장
    this.selectedItem = item;
    // 이벤트 발생
    this.onSelected.emit(item);
  }

  // 선택 아이
  public getSelectedItem() {
    return this.selectedItem;
  }

  // 컴포넌트 내부  host 클릭이벤트 처리
  @HostListener('document:click', ['$event'])
  public onClickHost(event) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // 팝업창 닫기
      this.isShowSelect = false;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/



}
