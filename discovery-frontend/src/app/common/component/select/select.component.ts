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
  Component, ElementRef, EventEmitter,
  Injector, Input, OnInit, Output
} from '@angular/core';
import { AbstractComponent } from '../abstract.component';

@Component({
  selector: 'component-select',
  templateUrl: './select.component.html',
  host: {
    '(document:click)': 'onClickHost($event)',
  }
})
export class SelectComponent extends AbstractComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

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

    // 선택된 아이템 제거
    this.selectedItem = null;

    // 선택된 아이템 설정하기
    this.setSelectedItem();
  }

  // 화면에 표시하기 위한 모델의 키
  @Input() public viewKey: string;
  // 셀렉트박스를 위로 할 것인지 여부(기본: down)
  @Input() public isUpSelect = false;

  // 기본 선택 인덱스
  public defaultIndex = -1;

  // 서버와 통신 후 인덱스를 지정해야 하는 경우
  @Input('defaultIndex')
  set setDefaultIndex(index: number) {
    this.defaultIndex = index;

    if (this.array && this.array.hasOwnProperty('length')
      && this.array.length > 0) {
      if (this.defaultIndex > -1) {
        this.selectedItem = this.array[this.defaultIndex];
      } else {
        this.selectedItem = null;
      }
    }
  }

  // Placeholder 사용여부 (기본: 사용안함)
  @Input() public usePlaceholder = false;
  // 기본 메시지
  @Input() public unselectedMessage = this.translateService.instant('msg.comm.ui.please.select');
  // 비활성화 여부
  @Input() public disabled = false;
  // 변경 이벤트
  @Output() public onSelected = new EventEmitter();
  // 리스트 표시 전
  @Output() public beforeShowSelectedList = new EventEmitter();
  // 비활성화알 때 클라스 추가 필요. 노트북서버 편집화면
  @Input() public inline = false;
  // 글자길이가 길때 하위로 떨어뜨리지 않고 옆으로 넓어지게 하려고 할때 쓰이는 class
  @Input() public noWrapFl: boolean;
  // 외부에서 리스트를 조절하고 싶을 경우
  @Input() public isShowSelectListForOutSide = true;
  // select box 길이 full length 여부
  @Input() public isFull : boolean = false;
  // 옵션이 왼쪽으로 길어지는 여부
  @Input() public isOptionToLeft:boolean = false;

  // Select box width is longer when it's dataprep
  @Input() public isDataprep: boolean = false;

  // 길어지면 말줄임 여부 true ? ... : 밑으로 길어짐
  @Input() public isEllipsis?: boolean = true;

  // 선택 아이템
  public selectedItem: any;

  // 셀렉트 리스트 show/hide 플래그
  public isShowSelectList = false;


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
   * 선택값을 없앰
   */
  public clearSelect() {
    this.selectedItem = null;
  } // function - clearSelect

  // 선택이벤트
  public selected(item: any) {
    // 선택 변수에 저장
    this.selectedItem = item;
    // 이벤트 발생
    this.onSelected.emit(item);
  }

  // 선택 아이템
  public getSelectedItem() {
    return this.selectedItem;
  }

  // 컴포넌트 내부  host 클릭이벤트 처리
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

  /**
   * 선택된 아이템 설정하기
   */
  private setSelectedItem() {

    if (!this.selectedItem
      && this.usePlaceholder === false
      && this.array && this.array.hasOwnProperty('length')
      && this.array.length > 0) {
      this.selectedItem = this.array[0];
      if (this.defaultIndex > -1) {
        this.selectedItem = this.array[this.defaultIndex];
      }
    }
  }
}
