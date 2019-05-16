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

import {Component, ElementRef, EventEmitter, HostListener, Injector, Input, Output, ViewChild} from '@angular/core';
import { StringUtil } from '../../../common/util/string.util';
import * as _ from 'lodash';
import { AbstractComponent } from '../../../common/component/abstract.component';
import { FieldRole, IngestionRuleType, LogicalType } from '../../../domain/datasource/datasource';
import {ColumnSelectBoxComponent} from "./column-select-box.component";

@Component({
  selector: 'add-column-component',
  templateUrl: './add-column.component.html'
})
export class AddColumnComponent extends AbstractComponent {

  @ViewChild('latitude_select')
  private readonly _latitudeSelectComponent: ColumnSelectBoxComponent;

  @ViewChild('longitude_select')
  private readonly _longitudeSelectComponent: ColumnSelectBoxComponent;

  // column list
  private _columnList: any;
  // method list
  public methodTypeList: any = [
    {label: this.translateService.instant('msg.storage.ui.list.geo.point'), icon: 'ddp-icon-type-point', value: LogicalType.GEO_POINT},
    // {label: this.translateService.instant('msg.storage.ui.list.geo.line'), icon: 'ddp-icon-type-line', value: LogicalType.GEO_LINE},
    // {label: this.translateService.instant('msg.storage.ui.list.geo.polygon'), icon: 'ddp-icon-type-polygon', value: LogicalType.GEO_POLYGON},
    {label: this.translateService.instant('msg.storage.ui.list.expression'), icon: 'ddp-icon-type-expression', value: LogicalType.USER_DEFINED}
  ];
  // selected method type
  public selectedMethodType: any = {label: this.translateService.instant('msg.storage.ui.list.geo.point'), icon: 'ddp-icon-type-point', value: LogicalType.GEO_POINT};
  // method type show flag
  public isMethodTypeListShow: boolean = false;
  // latitude column list
  public latitudeColumnList: any = [];
  // selected latitude column
  public selectedLatitudeColumn: any;
  // latitude column valid error
  public latitudeColumnValid: boolean;
  // longitude column list
  public longitudeColumnList: any = [];
  // selected longitude column
  public selectedLongitudeColumn: any;
  // longitude column valid error
  public longitudeColumnValid: boolean;

  // column name
  public columnName: string;
  // column name invalid message
  public columnNameInvalidMessage: string;
  // column name valid error
  public columnNameValid: boolean;

  // expression
  public expression: string;
  // expression invalid message
  public expressionInvalidMessage: string;
  // expression valid error
  public expressionValid: boolean;

  // output event
  @Output()
  public addedColumn: EventEmitter<any> = new EventEmitter();

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
   * Window resize
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  protected onResize(event) {
    // #1925
    this.closeSelectBoxes();
  }

  /**
   * Close select box
   */
  public closeSelectBoxes(): void {
    if (this.isMethodTypeListShow === true) {
      this.isMethodTypeListShow = false;
    }
    if (this.selectedMethodType.value !== 'user_defined') {
      if (this._latitudeSelectComponent && this._latitudeSelectComponent.isListShow === true) {
        this._latitudeSelectComponent.isListShow = false;
      } else if (this._longitudeSelectComponent && this._longitudeSelectComponent.isListShow === true) {
        this._longitudeSelectComponent.isListShow = false;
      }
    }
  }


  /**
   * Init
   * @param columnList
   */
  public init(columnList: any): void {
    // set column list
    this.longitudeColumnList = this.latitudeColumnList = this._columnList = _.filter(columnList, column => !column.unloaded && !column.derived);
    // if exist longitude column
    if (this.selectedLongitudeColumn) {
      // set latitude column list
      this.latitudeColumnList = this._columnList.filter(column => column.name !== this.selectedLongitudeColumn.name);
      // if unloaded column
      if (this.selectedLongitudeColumn.unloaded) {
        // init selected longitude column
        this.selectedLongitudeColumn = null;
      }
    }
    // if exist latitude column
    if (this.selectedLatitudeColumn) {
      // set longitude column list
      this.longitudeColumnList = this._columnList.filter(column => column.name !== this.selectedLatitudeColumn.name);
      // if unloaded column
      if (this.selectedLatitudeColumn.unloaded) {
        // init selected latitude column
        this.selectedLatitudeColumn = null;
      }
    }
  }

  /**
   * Close
   */
  public close(): void {
    this.addedColumn.emit();
  }

  /**
   * Add
   */
  public onClickAdd(): void {
    // if enable add
    if (this._isEnableAddColumn()) {
      // add column
      this.addedColumn.emit(this._makeColumn());
      // init view
      this._initView();
    }
  }

  /**
   * Method type change event
   * @param type
   */
  public onChangeSelectedMethodType(type: any): void {
    // if change type
    if (type.value !== this.selectedMethodType.value) {
      // set selected method type
      this.selectedMethodType = type;
    }
  }

  /**
   * Latitude column change event
   * @param column
   */
  public onChangeSelectedLatitudeColumn(column: any): void {
    // if not exist selected latitude column or different column
    if (!this.selectedLatitudeColumn || this.selectedLatitudeColumn.name !== column.name) {
      // set longitude column list
      this.longitudeColumnList = _.filter(this._columnList, item => column.name !== item.name);
      // set selected latitude column
      this.selectedLatitudeColumn = column;
      // set valid
      this.latitudeColumnValid = true;
    }
  }

  /**
   * Longitude column change event
   * @param column
   */
  public onChangeSelectedLongitudeColumn(column: any): void {
    // if not exist selected longitude column or different column
    if (!this.selectedLongitudeColumn || this.selectedLongitudeColumn.name !== column.name) {
      // set latitude column list
      this.latitudeColumnList = _.filter(this._columnList, item => column.name !== item.name);
      // set selected latitude column
      this.selectedLongitudeColumn = column;
      // set valid
      this.longitudeColumnValid = true;
    }
  }

  /**
   * Column name focus out event
   */
  public onFocusOutColumnNameField(): void {
    // check column name valid
    this._checkColumnNameValid();
  }

  /**
   * Expression focus out event
   */
  public onFocusOutExpressionField(): void {
    // check expression valid
    this._checkExpressionValid();
  }

  /**
   * Init UI
   * @private
   */
  private _initView(): void {
    // init column
    this.columnName = '';
    this.columnNameValid = null;
    // init expression
    this.expression = '';
    this.expressionValid = null;
    // init column
    this.selectedLatitudeColumn = null;
    this.latitudeColumnValid = null;
    this.selectedLongitudeColumn = null;
    this.longitudeColumnValid = null;
    // init selected method type
    this.selectedMethodType = this.methodTypeList[0];
  }

  /**
   * Is enable add column
   * @returns {boolean}
   * @private
   */
  private _isEnableAddColumn(): boolean {
    // check name valid
    this._checkColumnNameValid();
    // if method type expression
    if (this.selectedMethodType.value === LogicalType.USER_DEFINED) {
      // check expression valid
      this._checkExpressionValid();
      // return
      return this.columnNameValid && this.expressionValid;
    } else {
      // check column valid
      this._checkGeoColumnValid();
      // return
      return this.columnNameValid && this.latitudeColumnValid && this.longitudeColumnValid;
    }
  }


  /**
   * Check column name valid
   * @private
   */
  private _checkColumnNameValid(): void {
    // is empty
    if (StringUtil.isEmpty(this.columnName)) {
      // set invalid message
      this.columnNameInvalidMessage = this.translateService.instant('msg.storage.ui.required');
      // set valid error
      this.columnNameValid = false;
      // return
      return;
    }
    // duplicated name
    if (_.some(this._columnList, column => this.columnName.trim() === column.name)) {
      // set invalid message
      this.columnNameInvalidMessage = this.translateService.instant('msg.storage.ui.duplicated');
      // set valid error
      this.columnNameValid = false;
      // return
      return;
    }
    // set valid
    this.columnNameValid = true;
  }

  /**
   * Check expression valid
   * @private
   */
  private _checkExpressionValid(): void {
    // is empty
    if (StringUtil.isEmpty(this.expression)) {
      // set invalid message
      this.expressionInvalidMessage = this.translateService.instant('msg.storage.ui.required');
      // set valid error
      this.expressionValid = false;
      // return
      return;
    }
    // set valid
    this.expressionValid = true;
  }

  /**
   * Check geo column valid
   * @private
   */
  private _checkGeoColumnValid(): void {
    // if empty latitude column
    if (!this.selectedLatitudeColumn) {
      // set valid error
      this.latitudeColumnValid = false;
    }
    // if empty longitude column
    if (!this.selectedLongitudeColumn) {
      // set valid error
      this.longitudeColumnValid = false;
    }
  }

  /**
   * Make column
   * @returns {Object}
   * @private
   */
  private _makeColumn(): object {
    const column = {
      name: this.columnName.trim(),
      derived: true,
      role: FieldRole.DIMENSION,
      ingestionRule: {
        type: IngestionRuleType.DEFAULT
      },
      derivationRule: {
        type: this.selectedMethodType.value.toLowerCase()
      }
    };
    // if method type Expression
    if (this.selectedMethodType.value === LogicalType.USER_DEFINED) {
      column['type'] = LogicalType.STRING;
      column['logicalType'] = LogicalType.STRING;
      column.derivationRule['expr'] = this.expression.trim();
    } else { // if method type not Expression
      column['type'] = LogicalType.STRUCT;
      column['logicalType'] = this.selectedMethodType.value;
      // add format
      column['format'] = {
        type: this.selectedMethodType.value.toLowerCase(),
        originalSrsName: 'EPSG:4326'
      };
      column.derivationRule['latField'] = this.selectedLatitudeColumn.name;
      column.derivationRule['lonField'] = this.selectedLongitudeColumn.name;
    }
    return column;
  }
}
