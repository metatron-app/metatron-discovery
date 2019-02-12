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
import {StringUtil} from "../../util/string.util";

@Component({
  selector: 'component-paging-search-select',
  templateUrl: './paging-search-select.component.html',
  host: {
    '(document:click)': 'onClickHost($event)',
  }
})
export class PagingSearchSelectComponent extends AbstractComponent implements OnInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 리스트 객체
  private array: any[];

  // 선택 아이템
  private selectedItem: any;

  // 기본 선택 인덱스
  private defaultIndex = -1;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  //
  @Input()
  public isFirstOpenItemList: boolean = false;

  // connection 옵션 허용 여부
  @Input()
  public isConnection: boolean = false;

  // search 옵션 허용 여부
  @Input()
  public isSearchOptions: boolean = false;

  // object key 사용 여부
  @Input()
  public isEnableObjectKey: boolean = false;

  // 셀렉트박스 비활성화 표시 여부
  @Input()
  public isDisabledOptions: boolean = false;

  // 내부 페이징 사용 여부
  @Input()
  public isEnableInternalPaging: boolean = false;

  // 옵션이 왼쪽으로 길어지는 여부
  @Input()
  public isOptionToLeft:boolean = false;

  // 셀렉트박스를 위로 할 것인지 여부(기본: down)
  @Input()
  public isUpSelect = false;

  // 셀렉트 리스트 show/hide 플래그
  public isShowOptions = false;

  // search text
  @Input()
  public searchText: string;

  // placeholder text
  @Input()
  public searchPlaceHolderText: string;

  // Placeholder 사용여부 (기본: 사용안함)
  @Input()
  public usePlaceholder = false;

  // 선택된 아이템 기본 메시지
  @Input()
  public unselectedMessage = this.translateService.instant('msg.comm.ui.please.select');

  // 화면에 표시하기 위한 객체의 키
  @Input()
  public objectKey: string;

  // 페이지 번호
  @Input()
  public pageNum: number = 0;

  @Input()
  public internalSize: number = 20;

  // 배열 저장
  @Input('array')
  set setArray(array: any) {
    this.array = array;

    // 선택된 아이템 설정하기
    this.setSelectedItem();
  }

  // 서버와 통신 후 인덱스를 지정해야 하는 경우
  @Input('defaultIndex')
  set setDefaultIndex(index: number) {
    this.defaultIndex = index;

    if (this.array && this.array.hasOwnProperty('length')
      && this.array.length > 0 && this.defaultIndex > -1) {
        this.selectedItem = this.array[this.defaultIndex];
      } else {
        this.selectedItem = null;
      }
  }

  // 변경 이벤트
  @Output() public onSelected = new EventEmitter();

  // 검색 이벤트
  @Output() public onSearchText = new EventEmitter();

  // 페이지 호출 이벤트
  @Output() public onLoadPage = new EventEmitter<number>();


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

  public ngAfterViewInit() {
    if (this.isFirstOpenItemList && !this.selectedItem) {
      setTimeout(() => { this.isShowOptions = true})
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * array list
   * @returns {any[]}
   */
  public get getArrayList() {
    // array list
    let arrayList = this.array;
    // search option
    if (this.isSearchOptions) {
      // 검색어 필터링
      if (StringUtil.isNotEmpty(this.searchText)) {
        arrayList = this.array.filter(item => item.includes(this.searchText));
      }
    }
    // internal page
    if (this.isEnableInternalPaging) {
      arrayList = arrayList.slice(0, (this.pageNum + 1) * this.internalSize);
    }

    return arrayList;
  }

  /**
   * 선택된 아이템
   * @returns {any}
   */
  public get getSelectedItem() {
    // 선택된 아이템이 있는경우
    if (this.selectedItem) {
      // 오브젝트 키를 사용하는 경우
      if (this.isEnableObjectKey) {
        return this.selectedItem[this.objectKey];
      }
      return this.selectedItem;
    }
    return this.unselectedMessage;
  }

  /**
   * 아이템
   * @param item
   * @returns {any}
   */
  public getItem(item) {
    // object key 가 있는경우
    if (this.isEnableObjectKey) {
      return item[this.objectKey];
    }
    return item;
  }

  /**
   * 검색아이콘 표시 여부
   * @returns {boolean}
   */
  public get getResultOption() {
    // search option 일때만 적용
    if (this.isSearchOptions
      && this.selectedItem) {
      return true;
    }
    return false;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - event
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 선택이벤트
   * @param item
   */
  public onSelectItem(item: any) {
    // 선택 변수에 저장
    this.selectedItem = item;
    // 이벤트 발생
    this.onSelected.emit(item);
  } // function - selectItem

  /**
   * 검색이벤트
   */
  public onSearchItem() {
    // 이벤트 발생
    this.onSearchText.emit(this.searchText);
  }

  /**
   * 컴포넌트 내부  host 클릭이벤트 처리
   * @param event
   */
  public onClickHost(event) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // 팝업창 닫기
      this.isShowOptions = false;
    }
  } // function - onClickHost


  /**
   * 콤보박스 옵션 표시 여부
   */
  public onOffShowOptions() {
    // disable 상태가 아닐때만 작동
    if (!this.isDisabledOptions) {
      this.isShowOptions = !this.isShowOptions;
    }
  } // function - onOffShowOptions

  /**
   * 스크롤 시 이벤트 ( 다음페이지 조회 호출 )
   */
  public onScroll() {
    if (this.isEnableInternalPaging && this.getMoreInternalPage) {
      this.pageNum++;
    } else {
      this.onLoadPage.emit(++this.pageNum);
    }
  } // function - onScroll


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * internal page 가 더 있는지 확인
   * @returns {boolean}
   */
  private get getMoreInternalPage(): boolean {
    if (this.array.length > ((this.pageNum + 1) * this.internalSize)) {
      return true;
    }
    return false;
  }

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
