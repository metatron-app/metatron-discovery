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
import {isNullOrUndefined} from "util";
declare const moment: any;

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
  @ViewChildren('renamedAsColumns')
  public renamedAsColumns: QueryList<ElementRef>;

  public isPopupOpen: boolean = false;

  public datasetName: string;

  public columns: Column[] = [];

  public gridData: {data : any, fields: any};

  public errorEsg: string;

  public op: string = 'APPEND' || 'UPDATE';

  // used when updating
  public currentIdx: number;

  public typeDesc: any;

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
  /**
   * Open rename component with init
   * @param dsInfo
   */
  public init(dsInfo : {
    gridData : {data: any, fields: any},
    dsName : string,
    typeDesc: any,
    editInfo? : {ruleCurIdx : number, cols: string[], to : string[]}}) {

    // open popup
    this.isPopupOpen = true;

    // set grid info, columns
    this.gridData = dsInfo.gridData;

    // Only show 50 rows
    this.gridData.data = this.gridData.data.splice(0,50);

    this.datasetName = dsInfo.dsName;

    this.typeDesc = dsInfo.typeDesc;

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
  public editItem(column : Column, index: number, input: HTMLInputElement) {

    // 에러가 있을떄는 에러가 해결돼야 다른 컬럼을 수정할 수 있다
    if (isNullOrUndefined(this.errorEsg)) {

      // 에러가 없을때만 !
      column.isEditing = true;

      input.focus();

    }

  }


  /**
   * Focus (tab 버튼으로 이동할때 focus가 잡히지 않아서 (focus)이용
   * @param column
   */
  public focus(column: Column) {
    if (isNullOrUndefined(this.errorEsg)) {
      column.isEditing = true;
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

      if (this.op === 'UPDATE') {
        if (item.renamedAs.trim() !== '' && (item.editOriginalName !== item.renamedAs) || item.original !== item.renamedAs) {
          originals.push('`' + item.original + '`');
          renamed.push("'" + item.renamedAs + "'");
        }
      }

      if (this.op === 'APPEND') {
        if (item.renamedAs.trim() !== '' && item.original !== item.renamedAs) {
          originals.push('`' + item.original + '`');
          renamed.push("'" + item.renamedAs + "'");
        }
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

        // 에러가 있을때 탭을 눌렀다면 현재 input을 벗어나지 못함
        column.isEditing = true;
      }
    } else { // 아무 키를 눌렀다면 에러 메시지 삭제
      column.isError = false;
      this.errorEsg=null
    }

  }


  /**
   * Check if column name has back quote
   * @param column
   * returns trues if column name has quote (`)
   */
  public hasBackTick(column: Column) : boolean {

    let result: boolean = false;
    if (-1 !== column.renamedAs.indexOf('`')) {
      this.errorEsg = this.translateService.instant('msg.dp.alert.no.backtick.colname');
      result = true;
    }
    return result;
  }


  /**
   * Returns true if column name is empty
   * @param column
   */
  public isRenameInputEmpty(column: Column) : boolean {
    let result: boolean = false;
    if (column.renamedAs.trim() === '' || isNullOrUndefined(column.renamedAs)) {
      this.errorEsg = this.translateService.instant('msg.dp.alert.empty.column');
      result = true;
    }
    return result;

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
  public focusOut(column: Column, index: number, event?:FocusEvent, input?:HTMLInputElement) {

    // 편집중이면
    if (column.isEditing) {

      // Validation - back quote, duplicate name, Check if input is empty
      if (this.hasBackTick(column) || this.isNameDuplicate(column, index) || this.isRenameInputEmpty(column)) {
        column.isError = true;
        event && event.stopPropagation();
        input && input.focus();
        return;
      }

      // 포커스 아웃 할 대상은 false 로 바꿔줘야한다
      if (isNullOrUndefined(this.errorEsg)) {
        column.isEditing = false;
      }

      // 그리드 업데이트
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
        this.columns.push({
          editOriginalName: idx === -1 ? item.name : tos[idx],
          original : item.name, renamedAs: idx === -1 ? item.name : tos[idx],
          isError: false,
          isEditing: false
        });
      } else {
        this.columns.push({
          original : item.name,
          renamedAs: item.name,
          isError: false,
          isEditing: false
        });
      }
    })
  }

  /**
   * Update grid
   * @private
   */
  private _updateGrid(fields, rows) {

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
        .Formatter((row, cell, value) => {
          const colDescs = (this.typeDesc) ? this.typeDesc[cell] : {};
          if (!isNullOrUndefined(colDescs)) {
            value = this._setFieldFormatter(value, colDescs.type, colDescs);
          }
          return value;
        })
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


  /**
   * 문자열에 타임스탬프 포맷을 적용함
   * @param {string} value
   * @param {string} timestampStyle
   * @return {string}
   * @private
   */
  private _setTimeStampFormat(value: string, timestampStyle?: string): string {

    (timestampStyle) || (timestampStyle = 'YYYY-MM-DDTHH:mm:ss');
    let result = moment.utc(value).format(timestampStyle.replace(/y/g, 'Y').replace(/dd/g, 'DD').replace(/'/g, ''));
    if (result === 'Invalid date') {
      result = value;
    }
    return result;
  }

  /**
   * 필드에 대한 형식 지정
   * @param value
   * @param {string} type
   * @param {{timestampStyle: string, arrColDesc: any, mapColDesc: any}} colDescs
   * @returns {string}
   * @private
   */
  private _setFieldFormatter(value: any, type: string,
                             colDescs: { timestampStyle?: string, arrColDesc?: any, mapColDesc?: any }): string {
    let strFormatVal: string = '';
    if (colDescs) {
      if ('TIMESTAMP' === type) {
        // 단일 데이터에 대한 타임 스템프 처리
        strFormatVal = this._setTimeStampFormat(value, colDescs.timestampStyle);
      } else if ('ARRAY' === type) {
        // 배열 형식내 각 항목별 타임 스템프 처리
        const arrColDescs = colDescs.arrColDesc ? colDescs.arrColDesc : {};
        strFormatVal = JSON.stringify(
          value.map((item: any, idx: number) => {
            const colDesc = arrColDescs[idx] ? arrColDescs[idx] : {};
            if ('TIMESTAMP' === colDesc['type']) {
              return this._setTimeStampFormat(item, colDesc['timestampStyle']);
            } else {
              // 재귀 호출 부분
              const tempResult: string = this._setFieldFormatter(item, colDesc['type'], colDesc);
              // array, map 타임의 경우 stringify가 중복 적용되기에 parse 처리 해줌
              return ('ARRAY' === colDesc['type'] || 'MAP' === colDesc['type']) ? JSON.parse(tempResult) : tempResult;
            }
          })
        );
      } else if ('MAP' === type) {
        // 구조체내 각 항목별 타임 스템프 처리
        const mapColDescs = colDescs.mapColDesc ? colDescs.mapColDesc : {};
        let newMapValue = {};
        for (let key in value) {
          if (value.hasOwnProperty(key)) {
            const colDesc = mapColDescs.hasOwnProperty(key) ? mapColDescs[key] : {};
            if ('TIMESTAMP' === colDesc['type']) {
              newMapValue[key] = this._setTimeStampFormat(value[key], colDesc['timestampStyle']);
            } else {
              // 재귀 호출 부분
              const tempResult: string = this._setFieldFormatter(value[key], colDesc['type'], colDesc);
              // array, map 타임의 경우 stringify가 중복 적용되기에 parse 처리 해줌
              newMapValue[key]
                = ('ARRAY' === colDesc['type'] || 'MAP' === colDesc['type']) ? JSON.parse(tempResult) : tempResult;
            }
          }
        }
        strFormatVal = JSON.stringify(newMapValue);
      } else {
        strFormatVal = <string>value;
      }
    } else {
      strFormatVal = <string>value;
    }

    return strFormatVal;
  } // function - _setFieldFormatter



}

class Column {
  public original: string;
  public renamedAs : string;
  public editOriginalName?: string;
  public isError: boolean;
  public isEditing: boolean;
}

