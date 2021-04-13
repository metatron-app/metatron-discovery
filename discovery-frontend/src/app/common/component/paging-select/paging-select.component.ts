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
  selector: 'component-paging-select',
  templateUrl: './paging-select.component.html'
})
export class PagingSelectComponent extends AbstractComponent implements OnInit, OnDestroy {

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
  @Input() public unselectedMessage = 'Please select';

  // 비활성화 여부
  @Input() public disabled = false;

  // 옵션이 왼쪽으로 길어지는 여부
  @Input() public isOptionToLeft:boolean = false;

  // 변경 이벤트
  @Output() public onSelected = new EventEmitter();

  // 페이지 호출 이벤트
  @Output() public onLoadPage = new EventEmitter<number>();

  // 선택 아이템
  public selectedItem: any;

  // 셀렉트 리스트 show/hide 플래그
  public isShowOptions = false;

  // 페이지 번호
  public pageNum: number = 0;

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
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 선택이벤트
   * @param item
   */
  public selectItem(item: any) {
    // 선택 변수에 저장
    this.selectedItem = item;
    // 이벤트 발생
    this.onSelected.emit(item);
  } // function - selectItem

  /**
   * 선택 아이템
   * @returns {any}
   */
  public getSelectedItem() {
    return this.selectedItem;
  } // function - getSelectedItem

  /**
   * 컴포넌트 내부  host 클릭이벤트 처리
   * @param event
   */
  @HostListener('document:click', ['$event'])
  public onClickHost(event) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // 팝업창 닫기
      this.isShowOptions = false;
    }
  } // function - onClickHost

  /**
   * 콤보박스 비활성화
   */
  public setDisable() {
    this.disabled = true;
  } // function - setDisable

  /**
   * 콤보박스 활성화
   */
  public setEnable() {
    this.disabled = false;
  } // function - setEnable

  /**
   * 콤보박스 옵션 표시 여부
   */
  public onOffShowOptions() {
    this.isShowOptions = !this.isShowOptions;
    if (this.isShowOptions) {
      this.pageNum = 0;
      this.onLoadPage.emit(this.pageNum);
    }
  } // function - onOffShowOptions

  /**
   * 스크롤 시 이벤트 ( 다음페이지 조회 호출 )
   */
  public onScroll() {
    this.onLoadPage.emit(this.pageNum++);
  } // function - onScroll

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
  } // function - setSelecgtedItem
}
