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

import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input, OnChanges,
  Output, SimpleChanges
} from "@angular/core";
import {AbstractComponent} from "../../../../common/component/abstract.component";

import * as _ from 'lodash';

@Component({
  selector: 'schema-table-list',
  templateUrl: 'schema-table-list.component.html'
})
export class SchemaTableListComponent extends AbstractComponent implements OnChanges {

  @Input() readonly tableList: string[];
  @Input() readonly selectedTable: string;
  checkedTableList: string[] = [];

  @Input() readonly tableListNoneMessage: string;

  @Output() readonly changedSelectedTable = new EventEmitter();

  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tableList && changes.tableList.previousValue && changes.tableList.currentValue) {
      // init checked table list
      this._initCheckedTableList();
    }
  }

  isEmptyCheckedTableList(): boolean {
    return _.isNil(this.checkedTableList) || this.checkedTableList.length === 0;
  }

  isEmptyTableList(): boolean {
    return _.isNil(this.tableList) || this.tableList.length === 0;
  }

  isCheckedAllTable(): boolean {
    return !_.isNil(this.tableList) && this.tableList.every(table => this.isCheckedTable(table));
  }

  isCheckedTable(table: string): boolean {
    return this._getTableIndexInCheckedTableList(table) !== -1;
  }

  isSelectedTable(table: string): boolean {
    return this.selectedTable === table;
  }

  onChangeSelectedTable(table: string, event?: MouseEvent): void {
    if (_.isNil(this.selectedTable) || this.selectedTable !== table) {
      // changed selected table
      this.changedSelectedTable.emit(table);
    }
  }

  onChangeCheckTable(table: string): void {
    if (this.isCheckedTable(table)) {
      this.checkedTableList.splice(this._getTableIndexInCheckedTableList(table), 1)
    } else {
      this.checkedTableList.push(table);
    }
  }

  onCheckAllTable(): void {
    if (!this.isEmptyTableList()) {
      if (this.isCheckedAllTable()) {
        this._initCheckedTableList();
      } else {
        this.checkedTableList = _.cloneDeep(this.tableList);
      }
    }
  }

  private _getTableIndexInCheckedTableList(table: string): number {
    return this.checkedTableList.findIndex(checkedTable => checkedTable === table);
  }

  private _initCheckedTableList(): void {
    this.checkedTableList = [];
  }

}
