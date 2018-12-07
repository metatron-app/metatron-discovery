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
  ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild,
  ViewChildren
} from '@angular/core';
import { AbstractComponent } from '../../../../../common/component/abstract.component';
import { GridComponent } from '../../../../../common/component/grid/grid.component';
import { header, SlickGridHeader } from '../../../../../common/component/grid/grid.header';
import { GridOption } from '../../../../../common/component/grid/grid.option';
//import { Field } from '../../../../../domain/data-preparation/dataset';
import { Field } from '../../../../../domain/data-preparation/pr-dataset';
import * as pixelWidth from 'string-pixel-width';
import { Alert } from '../../../../../common/util/alert.util';
import { StringUtil } from '../../../../../common/util/string.util';

@Component({
  selector: 'multicolumn-rename',
  templateUrl: './multicolumn-rename.component.html'
})
export class MulticolumnRenameComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild(GridComponent)
  private gridComponent: GridComponent;

  @ViewChildren('cols')
  private cols: ElementRef;

  // 완료 클릭
  @Output()
  private renameEvent = new EventEmitter();
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public showFlag : boolean = false;

  public colNames : any = [];
  public datasetName : string;
  public selectedColIndex : number;
  public error : boolean = false;
  public op : string = 'APPEND';
  public gridFields : any;
  public gridRows : any;
  public ruleCurIdx : number;

  public errorMsg : string = this.translateService.instant('msg.dp.ui.already.inuse');

  // Change Detect
  public changeDetect: ChangeDetectorRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Init
   * @param data {any} - {colNames, datasetName,gridResponse, cols, tos, ruleCurIdx}
   */
  public init(data:{data: any, datasetName: string, ruleCurIdx?: any, cols?: any, to?: any}) {

    this.initViewPage();
    this.showFlag = true;
    if (data) {
      if(data.ruleCurIdx) {
        this.op = 'UPDATE';
        this.ruleCurIdx = data.ruleCurIdx
      }
      this.gridFields = data.data.fields;
      this.gridRows = data.data.data;
      this.datasetName = data.datasetName;

      data.data.fields.forEach((item,index) => {
        if(data.cols) {
          let indexes = data.data.fields.map((field) => {
            return field.name;
          });
          let list = [];
          data.cols.forEach((col) => {
            list.push(indexes.indexOf(col));
          });

          if (list.indexOf(index) > -1) {
            this.colNames.push({original : item.name, renamed : 'string' === typeof data.to[list.indexOf(index)] ? data.to[list.indexOf(index)] : data.to[list.indexOf(index)]['escapedValue']});
          } else {
            this.colNames.push({original : item.name, renamed : item.name});
          }

        } else{
          this.colNames.push({original : item.name, renamed : item.name});
        }
      });
      this.changeDetect.detectChanges();
      this.updateGrid();
    }
  } // function - init

  /**
   * Init view
   */
  public initViewPage(){
    this.op = 'APPEND';
    this.colNames = [];
    this.error  = false;
  } // function - initViewPage


  /**
   * 화면 닫기
   */
  public close() {
    this.colNames =[];
    this.showFlag = false;
    this.gridFields = [];
    this.gridRows = [];
    this.error = false;
  } // function - close

  /**
   * 편집 클릭시
   * @param event
   * @param col
   * @param idx
   */
  public editRename(col,idx) {

    this.colNames.forEach((item,index) => {
      if(item.renamed.trim() === ''){
        this.showError(item,index);
        this.errorMsg = this.translateService.instant('msp.dp.alert.col.empty');
        return;
      }
    });

    if (this.error) {
      return;
    }

    let list = [];
    this.colNames.forEach((item,index) => {
      if(item.renamed === col.renamed && index !== idx){
        list.push(index);
      }
    });
    if (list.length === 0 ){
      this.cols['_results'][idx].nativeElement.focus();
      col.selected = true;
      this.selectedColIndex = idx;

    }
  } // function - editRename

  public showError(col,index){
    this.cols['_results'][index].nativeElement.focus();
    col.error = true;
    col.selected = true;
    this.error = true;
  }

  /**
   * Click outside 시.. 선택 되어있는 input을 disable한다
   * @param col
   * @param i
   */
  public disableInput( col,i) {
    const renameReg = /^[a-zA-Z가-힣\s][가-힣a-zA-Z0-9_ \s]*$/;
    if (col.selected) {
      if (col.renamed.trim() === '') {
        this.showError(col,i);
        this.errorMsg = this.translateService.instant('msp.dp.alert.col.empty');
        return;
      }
      col.selected = false;
      let flag = false;
      // this.selectedColIndex = -999;
      this.colNames.forEach((item,index) => {
        if (item.renamed === col.renamed && index !== i) {
          this.showError(col,i);
          this.errorMsg = this.translateService.instant('msg.dp.ui.already.inuse');
          this.selectedColIndex = i;
          return;
        } else if(!renameReg.test(col.renamed)) {
          this.showError(col,i);
          this.errorMsg = this.translateService.instant('There is a special character or Hangul is not completed');
          this.selectedColIndex = i;
          return;
        }
        this.gridRows.forEach((row,idx) => {
          if (!this.gridRows[idx].hasOwnProperty(item.renamed)) {
            flag = true;
            this.gridFields[index].name = item.renamed;
            let original = item.original;
            let newName = item.renamed;
            this.gridRows[idx][newName] = this.gridRows[idx][original];
          }
        })
      });
      if (flag) {
        this.selectedColIndex = -999;
        this.error= false;
        this.updateGrid();
        flag = false;
      }
    }
  } // function - disableInput

  /**
   * 완료 클릭시
   */
  public applyRename() {
    this.colNames.forEach((item,index) => {
      if (item.renamed.trim() === '') {
        this.showError(item,index);
        this.errorMsg = 'Col name must not be empty';
        return;
      }
      return;
    });

    if(this.selectedColIndex > -1) {
      let changedName = this.colNames[this.selectedColIndex].renamed;
      this.colNames.forEach((item,idx) => {
        if(item.renamed === changedName && idx !== this.selectedColIndex) {
          this.colNames[this.selectedColIndex].error = true;
          this.error = true;
          return;
        }
      });
    }

    if(!this.error) {
      let cols = [];
      let tos = [];
      let count = 0;
      this.colNames.forEach((item) => {
        if(item.renamed !== item.original) {
          cols.push(item.original);
          let check = StringUtil.checkSingleQuote(item.renamed, {isAllowBlank:false,isWrapQuote:true});
          if (check[0] === false) {
            Alert.warning('Invalid value');
            return;
          } else {
            tos.push(check[1]);
          }
        } else {
          count++;
        }
      });
      if (this.colNames.length === count) {
        this.close();
        return ;
      }

      const columnsStr: string = cols.map((item) => {
        item = '`' + item + '`';
        return item
      }).join(', ');

      let rule = {
        op: this.op,
        command : 'multipleRename',
        ruleString: 'rename col: ' + columnsStr + ' to: ' + tos.toString()
      };

      if (this.op === 'UPDATE') {
        rule['ruleCurIdx'] = this.ruleCurIdx;
        rule['ruleIdx'] = this.ruleCurIdx;
      }
      this.renameEvent.emit(rule);
    }

  } // function - applyRename

  /**
   * 업데이트 그리드
   */
  public updateGrid() {

    const maxDataLen: any = {};
    const fields: any = this.gridFields;

    let rows: any[] = this.gridRows;

    if( 0 === fields.length) {
      return;
    }

    // Row 생성 및 컬럼별 최대 길이 측정
    if (rows.length > 0) {
      rows = rows.map((row: any, idx: number) => {
        // 컬럼 길이 측정
        fields.forEach((field: Field) => {
          if(field.type === 'ARRAY' ||field.type === 'MAP') {

            if (typeof row[field.name] !== 'string') {
              row[field.name] = JSON.stringify(row[field.name])
            }

          }
          const colWidth: number = pixelWidth(row[field.name], { size: 12 });
          if (!maxDataLen[field.name] || ( maxDataLen[field.name] < colWidth )) {
            maxDataLen[field.name] = colWidth;
          }
        });
        // row id 설정
        row.id = idx;
        return row;
      });
    }

    // 헤더정보 생성
    const headers: header[] = fields.map((field: Field) => {

      const headerWidth: number = Math.floor(pixelWidth(field.name, { size: 12 })) + 72;
      return new SlickGridHeader()
        .Id(field.name)
        .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.type) + '"></em>' + field.name + '</span>')
        .Field(field.name)
        .Behavior('select')
        .Selectable(false)
        .CssClass('cell-selection')
        .Width(headerWidth > maxDataLen[field.name] ? headerWidth : maxDataLen[field.name])
        .MinWidth(100)
        .CannotTriggerInsert(true)
        .Resizable(true)
        .Unselectable(true)
        .Sortable(false)
        .build();
    });

    this.gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .RowHeight(32)
      .NullCellStyleActivate(true)
      .EnableColumnReorder(false)
      .build())

  } // function - updateGrid

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}

