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
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output, SimpleChange, SimpleChanges, ViewChild
} from '@angular/core';
import { AbstractComponent } from '../../../../../../common/component/abstract.component';
import { Field } from '../../../../../../domain/data-preparation/dataset';
import { isNullOrUndefined } from "util";
import { EventBroadcaster } from '../../../../../../common/event/event.broadcaster';
import { StringUtil } from '../../../../../../common/util/string.util';
import * as $ from "jquery";

@Component({
  selector : 'edit-rule-field-combo',
  templateUrl : './edit-rule-field-combo.component.html',
  styles: ['.ddp-list-command li:hover { background-color: #f6f6f7; }']
})
export class EditRuleFieldComboComponent extends AbstractComponent implements OnInit, AfterViewInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('inputSearch')
  private _inputSearch:ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public isShowOptions: boolean = false;
  public selectedItemKeys:string[] = [];

  // 검색어
  public columnSearchText:string = '';

  @Input()
  public isMulti:boolean = false;

  @Input()
  public fields : Field[];

  @Input()
  public selected: Field[] = [];

  @Input()
  public tabIndex:number = 0;

  @Output()
  public onChange:EventEmitter<{target:Field, isSelect:boolean, selectedList:Field[]}> = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected broadCaster: EventBroadcaster,
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

    // 그리드 컬럼 선택에 대한 이벤트
    this.subscriptions.push(
      this.broadCaster.on<any>('EDIT_RULE_GRID_SEL_COL').subscribe((data: { id: string, isSelect: boolean, columns: string[], fields: any[] }) => {
        if (this.fields && this.fields.some(item => item.name === data.id)) {
          this.checkItem(data.id, false, data.isSelect);
        }
      })
    );
  } // function - ngOnInit

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    const selectedChanges: SimpleChange = changes.selected;
    if (selectedChanges && selectedChanges.firstChange ) {
      selectedChanges.currentValue.forEach(item => this.checkItem(item.name, true, true));
    }
  } // function - ngOnChanges

  /**
   * 화면 초기화
   */
  public ngAfterViewInit() {
    super.ngAfterViewInit();
  } // function - ngAfterViewInit

  /**
   * 컴포넌트 제거
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  } // function - ngOnDestroy

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Select box 클릭 시 (멀티 체크박스)
   * @param {string} checkedKey
   * @param {boolean} isEvent
   * @param {boolean} isSelect
   */
  public checkItem(checkedKey: string, isEvent: boolean = true, isSelect?: boolean) {
    let selected: boolean = isSelect;

    if( this.isMulti ) {
      (isNullOrUndefined(selected)) && (selected = !this.selectedItemKeys.some(item => item === checkedKey));
      if (selected) {
        // add key
        this.selectedItemKeys.push(checkedKey);
      } else {
        // remove key
        this.selectedItemKeys = this.selectedItemKeys.filter(item => item !== checkedKey);
      }
    } else {
      selected = true;
      this.selectedItemKeys = [checkedKey];
    }

    this.onChange.emit({
      target:this.fields.find( item => item.name === checkedKey ),
      isSelect:selected,
      selectedList: this.fields.filter( item => -1 < this.selectedItemKeys.indexOf( item.name ) )
    });

    if (isEvent) {
      this.broadCaster.broadcast('EDIT_RULE_COMBO_SEL', { name: checkedKey, isSelectOrToggle: selected, isMulti : this.isMulti });
    }
  } // function - checkItem

  /**
   * 옵션 표시
   */
  public showOptions(event:MouseEvent) {
    event.stopPropagation();
    this.isShowOptions = true;
    if( !this.isMulti) {
      this.columnSearchText = ''; // 검색어 초기화
      setTimeout(() => $(this._inputSearch.nativeElement).trigger('focus')); // 포커스
    }
    this.changeDetect.detectChanges();
  }

  /**
   * 필드 목록 유일성 체크
   * @param {number} index
   * @param {Field} item
   */
  public trackByFn(index:number, item:Field) {
    return item.name;
  } // function - trackByFn

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - Multi Select
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 선택된 아이템 이름 목록
   * @return {string}
   */
  public selectedItemsNameString(): string {
    return this.selectedItemKeys.join(',');
  } // function - selectedItemsNameString

  /**
   * 아이템 체크 여부
   * @param {string} key
   * @return {boolean}
   */
  public isItemChecked(key: string): boolean {
    return -1 < this.selectedItemKeys.indexOf(key);
  } // function - isItemChecked

  /**
   * 체크된 것이 없는지 여부
   * @return {boolean}
   */
  public isEmptyCheckedItems(): boolean {
    return 0 === this.selectedItemKeys.length;
  } // function - isEmptyCheckedItems

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - Single Select
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  // column List (search)
  get filteredColumnList():Field[] {
    let columnList = this.fields;

    const isColumnSearchTextEmpty = StringUtil.isNotEmpty(this.columnSearchText);

    // 검색어가 있다면
    if (isColumnSearchTextEmpty) {
      columnList = columnList.filter((item) => {
        return item.name.toLowerCase().indexOf(this.columnSearchText.toLowerCase()) > -1;
      });
    }
    return columnList;

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}
