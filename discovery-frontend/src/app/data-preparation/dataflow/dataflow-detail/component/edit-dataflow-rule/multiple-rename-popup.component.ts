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
  ContentChildren,
  ElementRef,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output, QueryList,
  ViewChild,
  ViewChildren
} from "@angular/core";
import {AbstractComponent} from "../../../../../common/component/abstract.component";
import {header, SlickGridHeader} from "../../../../../common/component/grid/grid.header";
import {Field} from "../../../../../domain/data-preparation/pr-dataset";
import {GridOption} from "../../../../../common/component/grid/grid.option";
import {GridComponent} from "../../../../../common/component/grid/grid.component";
import {ScrollLoadingGridComponent} from "./edit-rule-grid/scroll-loading-grid.component";
import {ScrollLoadingGridModel} from "./edit-rule-grid/scroll-loading-grid.model";
import {CommonUtil} from "../../../../../common/util/common.util";
import {isNullOrUndefined} from "util";

@Component({
  selector: 'multiple-rename-popup',
  templateUrl: './multiple-rename-popup.component.html'
})
export class MultipleRenamePopupComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  private renameMultiColumns = new EventEmitter();

  @ViewChild(GridComponent)
  private gridComponent: GridComponent;

  @ViewChild(ScrollLoadingGridComponent)
  private _gridComp: ScrollLoadingGridComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ContentChildren('renamedAsColumns', { read: ElementRef })
  public renamedAsColumns: QueryList<ElementRef>;

  public isPopupOpen: boolean = false;

  public datasetName: string;

  public columns: Column[] = [];

  public gridData: {data : any, fields: any};

  public errorEsg: string;

  public op: string = 'APPEND' || 'UPDATE';

  // used when updating
  public currentIdx: number;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public init(dsInfo : { gridData : {data: any, fields: any}, dsName : string,
    editInfo? : {ruleCurIdx : number, cols: string[], to : string[]}}) {

    // open popup
    this.isPopupOpen = true;

    // set grid info, columns
    this.gridData = dsInfo.gridData;

    // Only show 50 rows
    this.gridData.data = this.gridData.data.splice(0,50);

    this.datasetName = dsInfo.dsName;

    // Set column information (right side)
    if (dsInfo.editInfo) {
      this._setColumns(this.gridData.fields, dsInfo.editInfo.cols, dsInfo.editInfo.to);
    } else {
      this._setColumns(this.gridData.fields);
    }

    // Edit
    if (dsInfo.editInfo) {
      this.op = 'UPDATE';
      this.currentIdx = dsInfo.editInfo.ruleCurIdx;
    }

    // Add
    if (!dsInfo.editInfo) {
      this.op = 'APPEND';
    }

    // Grid component is undefined;
    this.safelyDetectChanges();
    this._updateGrid(this.gridData.fields, this.gridData.data);

  }


  /**
   * Close popup
   */
  public close() {
    this.isPopupOpen = false;
    this.errorEsg = null;

    if (this.op === 'UPDATE') {
      this.renameMultiColumns.emit(null);
    }
  }


  /**
   * When edit button in clicked
   * @param column
   * @param index
   * @param input
   */
  public editItem(column : Column, index: number, input: any) {

    if (isNullOrUndefined(this.errorEsg)) {

      // 에러가 없을때만 !
      column.isEditing = true;

      input.focus();

    }

  }


  /**
   * Focus
   * @param column
   */
  public focus(column: Column) {
    if (isNullOrUndefined(this.errorEsg)) {
      column.isEditing = true;
      event.stopPropagation();
    }
  }


  /**
   * Done button is clicked
   */
  public applyRename() {

    // Validation check
    this.columns.forEach((item,index) => {
      this.focusOut(item,index);
    });

    // If error return
    if (this.errorEsg) {
      return;
    }

    const originals: string[] = [];
    const renamed: string[] = [];

    // wrap original columns with back ticks,
    // wrap renamed columns with single quotation
    this.columns.forEach((item) => {
      if (item.renamedAs.trim() !== '' && item.original !== item.renamedAs) {
        originals.push('`' + item.original + '`');
        renamed.push("'" + item.renamedAs + "'");
      }
    });


    // close popup
    this.isPopupOpen = false;

    // If nothing is changed, returns null
    this.renameMultiColumns.emit(originals.length > 0 ? {
      op: this.op,
      ruleString: `rename col: ${originals.toString()} to: ${renamed.toString()}`
    } : null );

  }


  /**
   * On key down
   * @param event
   * @param column
   */
  public onKeydownHandler(event: KeyboardEvent, column: Column) {

    if (event.keyCode === 9) {
      if (isNullOrUndefined(this.errorEsg)) {
        column.isEditing = true;
      } else {
        event.preventDefault();
      }
    } else {
      column.isError = false;
      this.errorEsg=null
    }

  }


  /**
   * Check if column name has back quote
   * @param column
   * @param input
   * returns trues if column name has quote (`)
   */
  public hasBackTick(column: Column, input?) : boolean {

    let result: boolean = false;
    if (-1 !== column.renamedAs.indexOf('`')) {
      this.errorEsg = this.translateService.instant('msg.dp.alert.no.backtick.colname');
      result = true;
      if(input) {
        input.focus();
      }
    }
    return result;
  }


  /**
   * Returns true if column name is empty
   * @param column
   */
  public isRenameInputEmpty(column: Column) : boolean {
    return column.renamedAs.trim() === '' || isNullOrUndefined(column.renamedAs)

  }


  /**
   * Returns true is name already exists
   * @param column
   * @param index
   */
  public isNameDuplicate(column: Column, index: number) {

    let isDuplicated: boolean = false;

    this.columns.forEach((item, idx) => {
      // 컬럼스에서 자기 자신과 같은 이름을 갖고 있는 컬럼이 있는지 확인한다.
      if (idx !== index && item.renamedAs === column.renamedAs) {
        isDuplicated = true;
        this.errorEsg = this.translateService.instant('msg.dp.alert.duplicate.colname');
      }
    });
    return isDuplicated;
  }


  /**
   * Focus out from input
   * @param column
   * @param index
   * @param event
   * @param input
   */
  public focusOut(column: Column, index: number, event?, input?) {

    // 편집중이면
    if (column.isEditing) {

      // 백틱 검사
      column.isError = this.hasBackTick(column);
      if (this.hasBackTick(column)) {
        event && event.preventDefault();
        input && input.focus();
        column.isError = true;
        return;
      }

      // 중복 검사
      if (this.isNameDuplicate(column, index)) {
        column.isError = true;
        input && input.focus();
        event && event.preventDefault();
        return;
      }

      // empty value 검사
      const isEmpty: boolean = this.isRenameInputEmpty(column);
      if (isEmpty) {
        column.renamedAs = column.original;
      }

      if (isNullOrUndefined(this.errorEsg)) {
        column.isEditing = false;
      }

      this._updateGrid(this.gridData.fields, this.gridData.data);
    }

  }

  /**
   * Returns label
   * when update : edit
   * when append : done
   */
  public getButtonLabel() : string {
    if (this.op === 'UPDATE') {
      return this.translateService.instant('msg.comm.ui.edit')
    } else {
      return this.translateService.instant('msg.comm.btn.done2')
    }

  }


  /**
   * Returns true if item is editing
   * @param column
   */
  public isEditing(column: Column) : boolean {
    return column.isEditing;
  }


  /**
   * Returns true is column name is changed from original column name
   * @param column
   */
  public isChanged(column: Column) {
    return column.renamedAs !== column.original && !column.isEditing
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Set default values for columns
   * @param fields
   * @param cols ['column1', 'column2']
   * @param tos  ['col1', 'col2']
   * column1 from cols is renamed to col1, column2 from cols is renamed to col2
   * @private
   */
  private _setColumns(fields : any, cols?:string[], tos?: string[]) {
    this.columns = [];
    fields.forEach((item) => {
      if (cols) {
        // 편집일 경우 편집한 이름으로 renamedAs 를 넣어준다
        let idx = cols.indexOf(item.name);
        this.columns.push({ original : item.name, renamedAs: idx === -1 ? item.name : tos[idx], isError: false, isEditing: false });
      } else {
        this.columns.push({ original : item.name, renamedAs: item.name, isError: false, isEditing: false });
      }
    })
  }

  /**
   * Update grid
   * @private
   */
  private _updateGrid(fields, rows) {


    // object일 때 stringify 해야한다
    if (rows.length > 0) {
      rows = rows.map((row: any) => {
        fields.forEach((field: Field) => {
          if(field.type === 'ARRAY' ||field.type === 'MAP') {
            if (typeof row[field.name] !== 'string') {
              row[field.name] = JSON.stringify(row[field.name])
            }
          }
        });
        return row;
      });
    }

    // 헤더정보 생성
    const headers: header[] = fields.map((field: Field,index) => {
      return new SlickGridHeader()
        .Id('_idProperty_')
        .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.type) + '"></em>' + this.columns[index].renamedAs + '</span>')
        .Field(field.name)
        .Behavior('select')
        .Selectable(false)
        .CssClass('cell-selection')
        .Width(200)
        .MinWidth(100)
        .CannotTriggerInsert(true)
        .Resizable(true)
        .Unselectable(true)
        .Sortable(false)
        .build();
    });

    this._gridComp.create(
      headers,
      new ScrollLoadingGridModel(
        () => {},
        () => {},
        rows
      ),
      new GridOption()
        .SyncColumnCellResize(true)
        .RowHeight(32)
        .MultiSelect(false)
        .MultiColumnSort(false)
        .EnableColumnReorder(false)
        .EnableSeqSort(false)
        .build(),
      0,
      0
    );
  }

}

class Column {
  public original: string;
  public renamedAs : string;
  public isError: boolean;
  public isEditing: boolean;
}

