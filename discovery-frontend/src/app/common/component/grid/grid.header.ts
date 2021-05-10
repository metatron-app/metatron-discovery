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

import { HeaderMenu } from './grid.header.menu';

declare const Slick: any;
/**
 * slick grid header builder class
 */
export class SlickGridHeader {
  /* tslint:disable:variable-name function-name */
  private _asyncPostRender: string = null;
  private _behavior: string = null;
  private _cannotTriggerInsert: boolean = null;
  private _cssClass: string = '';
  private _defaultSortAsc: boolean = true;
  private _editor: GRID_EDIT_TYPE = null;
  private _field: string = '';
  private _focusable: boolean = true;
  private _formatter: any = null;
  private _headerCssClass: string = null;
  private _id: string = '';
  private _maxWidth: string = null;
  private _minWidth: number = 30;
  private _name: string = '';
  private _rerenderOnResize: boolean = false;
  private _resizable: boolean = true;
  private _selectable: boolean = true;
  private _sortable: boolean = false;
  private _toolTip: string = '';
  private _width: number;
  private _columnType:string;

  private _header : HeaderMenu;
  ///////////////////////////////////////////////////////////
  //
  // _validator
  // _unselectable
  //
  // - 원본 라이브러리에 없는 옵션
  //
  ///////////////////////////////////////////////////////////

  private _validator: any;
  private _unselectable: boolean;

  constructor() {
  }

  get columnType(): string {
    return this._columnType;
  }

  //noinspection JSUnusedGlobalSymbols
  ColumnType(value: string): SlickGridHeader {
    this._columnType = value;
    return this;
  }

  get asyncPostRender(): string {
    return this._asyncPostRender;
  }

  //noinspection JSUnusedGlobalSymbols
  AsyncPostRender(value: string): SlickGridHeader {
    this._asyncPostRender = value;
    return this;
  }

  get behavior(): string {
    return this._behavior;
  }

  //noinspection JSUnusedGlobalSymbols
  Behavior(value: string): SlickGridHeader {
    this._behavior = value;
    return this;
  }

  get cannotTriggerInsert(): boolean {
    return this._cannotTriggerInsert;
  }

  //noinspection JSUnusedGlobalSymbols
  CannotTriggerInsert(value: boolean): SlickGridHeader {
    this._cannotTriggerInsert = value;
    return this;
  }

  get cssClass(): string {
    return this._cssClass;
  }

  //noinspection JSUnusedGlobalSymbols
  CssClass(value: string): SlickGridHeader {
    this._cssClass = value;
    return this;
  }

  get defaultSortAsc(): boolean {
    return this._defaultSortAsc;
  }

  //noinspection JSUnusedGlobalSymbols
  DefaultSortAsc(value: boolean): SlickGridHeader {
    this._defaultSortAsc = value;
    return this;
  }

  get editor(): GRID_EDIT_TYPE {
    return this._editor;
  }

  //noinspection JSUnusedGlobalSymbols
  Editor(value: GRID_EDIT_TYPE): SlickGridHeader {
    switch ( value ) {
      case GRID_EDIT_TYPE.PERCENT :
        this._editor = Slick.Editors.PercentComplete;
        break;
      case GRID_EDIT_TYPE.CHECK :
        this._editor = Slick.Editors.Checkbox;
        break;
      case GRID_EDIT_TYPE.TEXT :
      default:
        this._editor = Slick.Editors.Text;
        break;
    }
    return this;
  }

  get field(): string {
    return this._field;
  }

  //noinspection JSUnusedGlobalSymbols
  Field(value: string): SlickGridHeader {
    this._field = value;
    return this;
  }

  get focusable(): boolean {
    return this._focusable;
  }

  //noinspection JSUnusedGlobalSymbols
  Focusable(value: boolean): SlickGridHeader {
    this._focusable = value;
    return this;
  }

  get formatter(): any {
    return this._formatter;
  }

  //noinspection JSUnusedGlobalSymbols
  Formatter(value: any): SlickGridHeader {
    this._formatter = value;
    return this;
  }

  get headerCssClass(): string {
    return this._headerCssClass;
  }

  //noinspection JSUnusedGlobalSymbols
  HeaderCssClass(value: string): SlickGridHeader {
    this._headerCssClass = value;
    return this;
  }

  get id(): string {
    return this._id;
  }

  //noinspection JSUnusedGlobalSymbols
  Id(value: string): SlickGridHeader {
    this._id = value;
    return this;
  }

  get maxWidth(): string {
    return this._maxWidth;
  }

  //noinspection JSUnusedGlobalSymbols
  MaxWidth(value: string): SlickGridHeader {
    this._maxWidth = value;
    return this;
  }

  get minWidth(): number {
    return this._minWidth;
  }

  //noinspection JSUnusedGlobalSymbols
  MinWidth(value: number): SlickGridHeader {
    this._minWidth = value;
    return this;
  }

  get name(): string {
    return this._name;
  }

  //noinspection JSUnusedGlobalSymbols
  Name(value: string): SlickGridHeader {
    this._name = value;
    return this;
  }

  get rerenderOnResize(): boolean {
    return this._rerenderOnResize;
  }

  //noinspection JSUnusedGlobalSymbols
  RerenderOnResize(value: boolean): SlickGridHeader {
    this._rerenderOnResize = value;
    return this;
  }

  get resizable(): boolean {
    return this._resizable;
  }

  //noinspection JSUnusedGlobalSymbols
  Resizable(value: boolean): SlickGridHeader {
    this._resizable = value;
    return this;
  }

  get selectable(): boolean {
    return this._selectable;
  }

  //noinspection JSUnusedGlobalSymbols
  Selectable(value: boolean): SlickGridHeader {
    this._selectable = value;
    return this;
  }

  get sortable(): boolean {
    return this._sortable;
  }

  //noinspection JSUnusedGlobalSymbols
  Sortable(value: boolean): SlickGridHeader {
    this._sortable = value;
    return this;
  }

  get toolTip(): string {
    return this._toolTip;
  }

  //noinspection JSUnusedGlobalSymbols
  ToolTip(value: string): SlickGridHeader {
    this._toolTip = value;
    return this;
  }

  get width(): number {
    return this._width;
  }

  //noinspection JSUnusedGlobalSymbols
  Width(value: number): SlickGridHeader {
    this._width = value;
    return this;
  }

  get validator(): any {
    return this._validator;
  }

  //noinspection JSUnusedGlobalSymbols
  Validator(value: any): SlickGridHeader {
    this._validator = value;
    return this;
  }

  get unselectable(): boolean {
    return this._unselectable;
  }

  //noinspection JSUnusedGlobalSymbols
  Unselectable(value: boolean): SlickGridHeader {
    this._unselectable = value;
    return this;
  }

  get header(): HeaderMenu {
    return this._header;
  }

  //noinspection JSUnusedGlobalSymbols
  Header(value: HeaderMenu): SlickGridHeader {
    this._header = value;
    return this;
  }

  build(): Header {
    return new Header(this);
  }

}

export enum GRID_EDIT_TYPE {
  TEXT = 'REJECTED',
  PERCENT = 'EXPIRED',
  CHECK = 'LOCKED'
}

export class Header {

  public asyncPostRender: string;
  public behavior: string;
  public cannotTriggerInsert: boolean;
  public cssClass: string;
  public defaultSortAsc: boolean;
  public editor: any;
  public field: string;
  public focusable: boolean;
  public formatter: any;
  public headerCssClass: string;
  public id: string;
  public maxWidth: string;
  public minWidth: number;
  public name: string;
  public rerenderOnResize: boolean;
  public resizable: boolean;
  public selectable: boolean;
  public sortable: boolean;
  public toolTip: string;
  public width: number;
  public validator: any;
  public unselectable: boolean;
  public header : HeaderMenu;
  public columnType : string;

  public setFormatter( formatter:any ) {
    this.formatter = formatter;
  }

  constructor(builder: SlickGridHeader) {
    if (typeof builder.asyncPostRender !== 'undefined') {
      this.asyncPostRender = builder.asyncPostRender;
    }
    if (typeof builder.behavior !== 'undefined') {
      this.behavior = builder.behavior;
    }
    if (typeof builder.cannotTriggerInsert !== 'undefined') {
      this.cannotTriggerInsert = builder.cannotTriggerInsert;
    }
    if (typeof builder.cssClass !== 'undefined') {
      this.cssClass = builder.cssClass;
    }
    if (typeof builder.defaultSortAsc !== 'undefined') {
      this.defaultSortAsc = builder.defaultSortAsc;
    }
    if (typeof builder.editor !== 'undefined') {
      switch ( builder.editor ) {
        case GRID_EDIT_TYPE.PERCENT :
          this.editor = Slick.Editors.PercentComplete;
          break;
        case GRID_EDIT_TYPE.CHECK :
          this.editor = Slick.Editors.Checkbox;
          break;
        case GRID_EDIT_TYPE.TEXT :
        default:
          this.editor = Slick.Editors.Text;
          break;
      }
    }
    if (typeof builder.field !== 'undefined') {
      this.field = builder.field;
    }
    if (typeof builder.focusable !== 'undefined') {
      this.focusable = builder.focusable;
    }
    if (typeof builder.formatter !== 'undefined') {
      this.formatter = builder.formatter;
    }
    if (typeof builder.headerCssClass !== 'undefined') {
      this.headerCssClass = builder.headerCssClass;
    }
    if (typeof builder.id !== 'undefined') {
      this.id = builder.id;
    }
    if (typeof builder.maxWidth !== 'undefined') {
      this.maxWidth = builder.maxWidth;
    }
    if (typeof builder.minWidth !== 'undefined') {
      this.minWidth = builder.minWidth;
    }
    if (typeof builder.name !== 'undefined') {
      this.name = builder.name;
    }
    if (typeof builder.rerenderOnResize !== 'undefined') {
      this.rerenderOnResize = builder.rerenderOnResize;
    }
    if (typeof builder.resizable !== 'undefined') {
      this.resizable = builder.resizable;
    }
    if (typeof builder.selectable !== 'undefined') {
      this.selectable = builder.selectable;
    }
    if (typeof builder.sortable !== 'undefined') {
      this.sortable = builder.sortable;
    }
    if (typeof builder.toolTip !== 'undefined') {
      this.toolTip = builder.toolTip;
    }
    if (typeof builder.width !== 'undefined') {
      this.width = builder.width;
    }
    if (typeof builder.validator !== 'undefined') {
      this.validator = builder.validator;
    }
    if (typeof builder.unselectable !== 'undefined') {
      this.unselectable = builder.unselectable;
    }
    if (typeof builder.header !== 'undefined') {
      this.header = builder.header;
    }
    if (typeof builder.columnType !== 'undefined') {
      this.columnType = builder.columnType;
    }
  }
  /* tslint:enable:variable-name function-name */
}
