/*
 *
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

import {AbstractComponent} from '@common/component/abstract.component';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {StringUtil} from '@common/util/string.util';

@Component({
  selector: 'column-select-box',
  templateUrl: 'column-select-box.component.html'
})
export class ColumnSelectBoxComponent extends AbstractComponent implements OnInit, OnChanges, OnDestroy {

  // origin list
  @Input('columnList')
  private _originList: any;

  // column list
  public columnList: any;

  // selected column
  @Input('selectedColumn')
  public selectedColumn: any;

  // search keyword
  public searchKeyword: string = '';

  @Input('placeholder')
  public placeHolder: string = this.translateService.instant('msg.comm.ui.please.select');
  @Input('searchPlaceHolder')
  public searchPlaceHolder: string;

  // select list show/hide flag
  public isListShow: boolean;

  @Output('onSelected')
  public onSelectedEvent: EventEmitter<any> = new EventEmitter();


  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * ngOnInit
   */
  public ngOnInit() {
    super.ngOnInit();
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * ngOnChanges
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    // if change origin list
    if (changes._originList) {
      // if first init
      if (changes._originList.firstChange) {
        this.columnList = this._originList;
      } else if (changes._originList.previousValue && changes._originList.currentValue) {
        this.columnList = this._originList;
        // if exist selected column, but not exist in column list
        if (this.selectedColumn && !this._originList.some(column => column.name === this.selectedColumn.name)) {
          this.selectedColumn = null;
        }
      }
      // if not empty search keyword, init keyword
      if (StringUtil.isNotEmpty(this.searchKeyword)) {
        this.searchKeyword = '';
      }
    }
  }

  /**
   * 컴포넌트 내부  host 클릭이벤트 처리
   * @param event
   */
  @HostListener('document:click', ['$event'])
  public onClickHost(event) {
    // 현재 element 내부에서 생긴 이벤트가 아닌경우 hide 처리
    if (!this.elementRef.nativeElement.contains(event.target)) {
      // close
      this.isListShow = false;
    }
  }

  /**
   * Column select event
   * @param column
   */
  public onSelectColumn(column: any): void {
    // set selected column
    this.selectedColumn = column;
    // event emit
    this.onSelectedEvent.emit(column);
  }

  /**
   * Search column event
   */
  public onSearchColumn(): void {
    // set column list
    this.columnList = StringUtil.isEmpty(this.searchKeyword) ? this._originList : this._originList.filter(item => item.name.toLowerCase().includes(this.searchKeyword.toLowerCase().trim()));
  }

  /**
   * Init search keyword
   */
  public initSearchKeyword(): void {
    // init search keyword
    this.searchKeyword = '';
    // init column list
    this.columnList = this._originList;
  }

}
