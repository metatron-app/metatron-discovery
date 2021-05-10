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
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input, OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {CommonUtil} from '@common/util/common.util';
import {StringUtil} from '@common/util/string.util';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {AbstractComponent} from '@common/component/abstract.component';

@Component({
  selector: 'prep-select-box',
  templateUrl: './prep-select-box.component.html',
  styles: [
    '.ddp-list-selectbox li.sys-focus-item { background-color: #f6f6f7 !important; }'
  ]
})
export class PrepSelectBoxComponent extends AbstractComponent implements OnInit, OnDestroy {

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

  // 화면에 표시하기 위한 모델의 키
  @Input() public viewKey: string;

  // 셀렉트박스를 위로 할 것인지 여부(기본: down)
  @Input() public isUpSelect = true;

  // Placeholder 사용여부 (기본: 사용안함)
  @Input() public usePlaceholder = false;

  // 기본 메시지
  @Input() public unselectedMessage = this.translateService.instant('msg.comm.ui.please.select');

  // 비활성화 여부
  @Input() public disabled = false;

  // 변경 이벤트
  @Output() public onSelected = new EventEmitter();

  // select box 길이 full length 여부
  @Input() public isFull: boolean = false;

  // 옵션이 왼쪽으로 길어지는 여부
  @Input() public isOptionToLeft: boolean = false;

  // 키보드 조작 가능 여부
  @Input()
  public isAllowKeyboardManipulation: boolean = false;

  @Input()
  public isSearchAllowed: boolean = false;

  @Input()
  public isWritable: boolean = false;

  // Selected item
  public selectedItem: any;

  // Show/hide select box
  public isShowSelectList = false;

  // if array is string array
  public isStringArray = false;

  // search Text
  public searchText: string;

  private _FIELD_COMBO_ID: string;

  @ViewChild('inputSearchText')
  private _searchTextElement: ElementRef;

  @ViewChild('sourceFieldCombo')
  private _sourceFieldCombo: ElementRef;

  private _$sourceFieldCombo;

  // Array List (search)
  get filteredList() {

    let arrayList = this.array;
    // 검색어가 있는지 체크
    const isSearchTextEmpty = StringUtil.isNotEmpty(this.searchText);

    // 검색어가 있다면
    if (isSearchTextEmpty) {
      arrayList = arrayList.filter((item) => {
        if (!this.isNullOrUndefined(this.viewKey)) {
          return item[this.viewKey].toLowerCase().indexOf(this.searchText.toLowerCase()) > -1;
        } else {
          return item.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1;
        }

      });
    }
    return arrayList;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
    this._FIELD_COMBO_ID = CommonUtil.getUUID();
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

    // Close select box when a command list or other select box is clicked
    this.subscriptions.push(
      this.broadCaster.on<any>('EDIT_RULE_SHOW_HIDE_LAYER').subscribe((data: { id: string, isShow: boolean }) => {
        if (data.id === 'commandList') {
          this.isShowSelectList = data.isShow;
        } else if (data.id !== this._FIELD_COMBO_ID && data.id !== 'toggleList') {
          this.isShowSelectList = false;
        }
      })
    );

    this._$sourceFieldCombo = $(this._sourceFieldCombo.nativeElement);

    super.ngOnInit();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Click inside component
   * @param event
   */
  @HostListener('document:click', ['$event'])
  public onClickHost(event) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // 팝업창 닫기
      this.isShowSelectList = false;
      !this.isWritable ? this.searchText = '' : null;
    }
  }

  /**
   * When an item is clicked from select box
   * @param item
   */
  public onSelect(item: any) {

    this.selectedItem = item;

    this.isShowSelectList = false;  // close select box

    this.safelyDetectChanges();

    this.onSelected.emit(item);     // emit event
  }

  /**
   * Select box open and close
   */
  public toggleSelectList() {

    if (this.isSearchAllowed) {
      this.isShowSelectList = true;
      setTimeout(() => this._searchTextElement.nativeElement.focus());
    } else {
      this.isShowSelectList = !this.isShowSelectList;
    }
    this.showHidePatternLayer(this.isShowSelectList);

  }

  /**
   * show pattern info tooltip
   * @param {boolean} isShow
   */
  public showHidePatternLayer(isShow: boolean) {
    this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', {id: 'toggleList', isShow: isShow});
  } // function - showHidePatternLayer


  /**
   * Combo box select box event
   * @param {KeyboardEvent} event
   */
  public comboKeyEvent(event: KeyboardEvent) {

    event.stopPropagation();
    const $currFocusItem = this._$sourceFieldCombo.find('li.sys-focus-item');

    switch (event.keyCode) {
      case 38 :
        // ArrowUP
        let $prev;
        if (0 === $currFocusItem.length) {
          $prev = this._$sourceFieldCombo.find('li:last');
        } else {
          $prev = $currFocusItem.prev('li');
          (0 === $prev.length) && ($prev = this._$sourceFieldCombo.find('li:last'));
        }

        $prev.addClass('sys-focus-item');
        $currFocusItem.removeClass('sys-focus-item');
        this._$sourceFieldCombo.scrollTop($prev.index() * 26);
        break;
      case 40 :
        // ArrowDown
        let $next;
        if (0 === $currFocusItem.length) {
          $next = this._$sourceFieldCombo.find('li:first');
        } else {
          $next = $currFocusItem.next('li');
          (0 === $next.length) && ($next = this._$sourceFieldCombo.find('li:first'));
        }

        $next.addClass('sys-focus-item');
        $currFocusItem.removeClass('sys-focus-item');
        this._$sourceFieldCombo.scrollTop($next.index() * 26);
        break;
      case 13 :
        // Enter
        $currFocusItem.trigger('click');
        $currFocusItem.removeClass('sys-focus-item');

        // Emitting event telling not to apply rule !
        this.broadCaster.broadcast('EDIT_RULE_SHOW_HIDE_LAYER', {id: 'enterKey', isShow: false});
        break;
    }
  }

  /**
   * Mouse Hover event handler to source field combo box
   * @param {MouseEvent} event
   */
  public hoverSourceItem(event: MouseEvent) {
    const $target = $(event.currentTarget);
    $target.parent().find('.sys-focus-item').removeClass('sys-focus-item');
    $target.addClass('sys-focus-item');
  } // function - hoverSourceItem


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
