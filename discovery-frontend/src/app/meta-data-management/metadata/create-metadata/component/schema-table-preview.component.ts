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

import {Component, ElementRef, Injector,ViewChild} from "@angular/core";
import {GridComponent} from "../../../../common/component/grid/grid.component";
import {GridOption} from "../../../../common/component/grid/grid.option";
import {Field} from "../../../../domain/datasource/datasource";
import {header, SlickGridHeader} from "../../../../common/component/grid/grid.header";
import {AbstractComponent} from "../../../../common/component/abstract.component";
import * as pixelWidth from 'string-pixel-width';
import * as _ from 'lodash';

@Component({
  selector: 'schema-table-preview',
  templateUrl: 'schema-table-preview.component.html'
})
export class SchemaTablePreviewComponent extends AbstractComponent {

  @ViewChild(GridComponent)
  private readonly _gridComponent: GridComponent;

  selectedTable: string;
  hideGrid: boolean;

  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
      super(element, injector);
  }

  /**
   * Change table data
   * @param {string} selectedTable
   * @param data
   */
  changeTableData(selectedTable: string, data): void {
    this.selectedTable = selectedTable;
    // if empty data
    if (_.isNil(data)) {
      // TODO error 메시지 표시할 경우
    } else {
      this._updateGrid(data.fields, data.data);
    }
  }

  initialPreview(): void {
    this.hideGrid = true;
  }

  /**
   * 헤더정보 얻기
   * @param {Field[]} fields
   * @return {header[]}
   * @private
   */
  private _getHeaders(fields: Field[]): header[] {
    return fields.map(
      (field: Field) => {
        /* 62 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth: number = Math.floor(pixelWidth(field.name, {size: 12})) + 62;

        return new SlickGridHeader().Id(field.name).
        Name(
          '<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.logicalType.toString()) +
          '"></em>' + field.name + '</span>').
        Field(field.name).
        Behavior('select').
        Selectable(false).
        CssClass('cell-selection').
        Width(headerWidth).
        CannotTriggerInsert(true).
        Resizable(true).
        Unselectable(true).
        Sortable(true).
        build();
      },
    );
  }

  /**
   * rows 얻기
   * @param data
   * @return {any[]}
   * @private
   */
  private _getRows(data) {
    let rows = data;
    if (data.length > 0 && !data[0].hasOwnProperty('id')) {
      rows = rows.map((row: any, idx: number) => {
        row.id = idx;
        return row;
      });
    }
    return rows;
  }

  /**
   * 그리드 출력
   * @param {header[]} headers
   * @param rows
   * @private
   */
  private _drawGrid(headers: header[], rows) {
    this.hideGrid = false;
    this.changeDetect.detectChanges();
    // 그리드 옵션은 선택
    this._gridComponent.create(headers, rows,
      new GridOption()
        .SyncColumnCellResize(true)
        .MultiColumnSort(true)
        .RowHeight(32)
        .build()
    );
  }

  /**
   * grid 정보 업데이트
   * @param {Field[]} fields
   * @param data
   * @private
   */
  private _updateGrid(fields: Field[], data) {
    // headers
    const headers: header[] = this._getHeaders(fields);
    // rows
    const rows: any[] = this._getRows(data);
    // grid 그리기
    this._drawGrid(headers, rows);
  }
}
