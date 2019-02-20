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

import {Component, ElementRef, EventEmitter, HostListener, Injector, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { PopupService } from '../../../common/service/popup.service';
import {PrDatasetFile, SheetInfo, StorageType} from '../../../domain/data-preparation/pr-dataset';
import { Alert } from '../../../common/util/alert.util';
import { DatasetService } from '../service/dataset.service';
import { GridComponent } from '../../../common/component/grid/grid.component';
import { header, SlickGridHeader } from '../../../common/component/grid/grid.header';
import { GridOption } from '../../../common/component/grid/grid.option';

import { isNullOrUndefined, isUndefined } from 'util';
import * as pixelWidth from 'string-pixel-width';
import {PreparationCommonUtil} from "../../util/preparation-common.util";
import {CommonUtil} from "../../../common/util/common.util";

@Component({
  selector: 'app-create-dataset-selectsheet',
  templateUrl: './create-dataset-selectsheet.component.html',
})
export class CreateDatasetSelectsheetComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @ViewChild(GridComponent)
  private gridComponent: GridComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  public typeEmitter = new EventEmitter<string>();

  @Input()
  public datasetFile: PrDatasetFile;

  public isCSV: boolean = false;
  public isJSON: boolean = false;
  public isExcel: boolean = false;

  public columnDelimiter : string = ',';

  public uploadLocation: string = 'LOCAL';
  public uploadLocationList: {name: string, value: string}[];

  // grid hide
  public clearGrid : boolean = false;

  public defaultSheetIndex : number = 0;

  public isMultiSheet: boolean = false;

  public isCheckAll: boolean = false;

  public isDisable: boolean = true;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(private popupService: PopupService,
              private datasetService: DatasetService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {

    super.ngOnInit();

    this.datasetFile.selectedSheets = [];

    // set 파일 타입 csv, excel, json
    this._setFileType(this.datasetFile.filenameBeforeUpload);

    this._setUploadLocationList();

    if (!this.datasetFile.sheetInfo) {

      // 그리드 그리기
      this._getGridInformation(this._getParamForGrid());
    } else {

      let idx: number = 0;
      if (this.datasetFile.sheetInfo.length > 1) {
        this.isMultiSheet = true;
        this._isAllChecked();
        idx = this.datasetFile.sheetInfo.findIndex((item) => {
          return item.selected;
        });
        this.datasetFile.sheetName = this.datasetFile.sheetInfo[idx].sheetName;
      }

      this._updateGrid(this.datasetFile.sheetInfo[idx].data,this.datasetFile.sheetInfo[idx].fields);
      this.isDisable = this._isNextBtnDisable();

    }

  }


  public ngOnDestroy() {
    super.ngOnDestroy();

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Move to next step
   */
  public next() {

    if (this.isDisable) {
      return;
    }

    this.datasetFile.delimiter = this.columnDelimiter;

    if(isUndefined(this.datasetFile.delimiter) || this.datasetFile.delimiter === '' ){
      this.columnDelimiter = '';
      Alert.warning(this.translateService.instant('msg.dp.alert.col.delim.required'));
      return;
    }

    if (this.clearGrid) {
      return;
    }

    if (this.datasetFile.sheetInfo.length > 1) {
      this.datasetFile.sheetInfo.forEach((item) => {
        if (item.selected) {
          this.datasetFile.selectedSheets.push(item.sheetName);
        }
      });
    } else {
      this.datasetFile.selectedSheets.push(this.datasetFile.sheetInfo[0].sheetName);
    }


    this.typeEmitter.emit('FILE');
    this.popupService.notiPopup({
      name: 'create-dataset-name',
      data: null
    });

  }

  /**
   * When delimiter is changed
   */
  public changeDelimiter() {

    // No change in grid when delimiter is empty
    if (isNullOrUndefined(this.columnDelimiter) || '' === this.columnDelimiter) {
      return;
    }

    this.loadingShow();
    this._getGridInformation(this._getParamForGrid())
  }


  /**
   * Previous step
   */
  public prev() {
    super.close();
    this.popupService.notiPopup({
      name: 'select-file',
      data: null
    });
  }

  /**
   * Close
   */
  public close() {
    super.close();

    // Check if came from dataflow
    if (this.datasetService.dataflowId) {
      this.datasetService.dataflowId = undefined;
    }

    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });
  }


  public getGridStyle() {
    if( this.datasetFile.sheetName && ''!==this.datasetFile.sheetName) {
      return null;
    }
    return {'top':'0px'};
  }


  private _setUploadLocationList(){
    this.uploadLocationList = [{ name:'Local', value:'LOCAL' }, { name: 'HDFS', value: 'HDFS'}];
    this.datasetFile.storageType = StorageType.LOCAL;
  }

  public onChangeUploadLocation($event: any) {
    if($event.hasOwnProperty('name') && $event.hasOwnProperty('value')) {
      this.uploadLocation = $event['value'];

      switch(this.uploadLocation ) {
        case 'HDFS':
          this.datasetFile.storageType = StorageType.HDFS;
          break;
        case 'LOCAL':
        default:
          this.datasetFile.storageType = StorageType.LOCAL;
          break;
      }
    }
  }


  /**
   * Returns true if is excel(only one sheet), csv, json, txt
   */
  public isMulti() : boolean {
    let result: boolean = false;

    if (this.isExcel) {
      result = this.datasetFile.sheetInfo.length === 1
    }

    if (this.isJSON || this.isCSV) {
      result = true;
    }

    return result
  }

  /**
   * Returns total of selected sheet
   * @returns {string}
   */
  public getTotal(): number {
    return this.datasetFile.sheetInfo.filter((obj) => {
      return obj.selected
    }).length
  }


  /**
   * When one check box is clicked
   * @param event
   * @param item
   */
  public check(event, item) {

    // stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    item.selected = !item.selected;

    this.safelyDetectChanges();

    this._isAllChecked();
    this.isDisable = this._isNextBtnDisable();

  }

  /**
   * When check all button is clicked
   * @param event
   */
  public checkAll(event) {

    // stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    this.isCheckAll = !this.isCheckAll;

    this.datasetFile.sheetInfo = this.datasetFile.sheetInfo.map((obj) => {
      obj.selected = this.isCheckAll; //  obj.selected = true or false
      return obj;
    });

    this.isDisable = this._isNextBtnDisable();

  }

  /**
   * Check if at least one is checked
   * return {boolean} returns true if at least one is checked
   */
  public partialChecked(): boolean {

    const isCheckAll = this.datasetFile.sheetInfo.every((item) => {
      return item.selected;
    });

    if (isCheckAll) {
      return false;
    }

    const unChecked = this.datasetFile.sheetInfo.every((item) => {
      return item.selected === false;
    });

    if (unChecked) {
      return false;
    }

    this.isCheckAll = false;

    return true;

  } // function - partialChecked


  /**
   * Select sheet and show grid
   * @param event
   * @param sheetName
   * @param idx
   */
  public selectSheet(event: Event, sheetName: string, idx: number) {

    // stop event bubbling
    event.stopPropagation();
    event.preventDefault();
    this.defaultSheetIndex = idx;
    this.datasetFile.sheetIndex = idx;
    this.datasetFile.sheetName = sheetName;

    // if grid info is valid show grid else clear grid
    if (!isNullOrUndefined(this.datasetFile) && this.datasetFile.sheetInfo[this.defaultSheetIndex]) {
      this._updateGrid(this.datasetFile.sheetInfo[this.defaultSheetIndex].data, this.datasetFile.sheetInfo[this.defaultSheetIndex].fields);
    } else {
      this.clearGrid = true;
    }
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 헤더정보 얻기
   * @param {Field[]} fields
   * @returns {header[]}
   */
  private getHeaders(fields: Field[]) {

    return fields.map(
      (field: Field) => {

        /* 70 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth:number = Math.floor(pixelWidth(field.name, { size: 12 })) + 70;

        return new SlickGridHeader()
          .Id(field.name)
          .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.type.toString()) + '"></em>' + field.name + '</span>')
          .Field(field.name)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(headerWidth)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(true)
          .build();
      }
    );
  }


  /**
   * Returns parameter required for grid fetching API
   * @returns result {fileKey: string, delimiter: string}
   * @private
   */
  private _getParamForGrid() {

    const result = {
      storedUri : this.datasetFile.storedUri,
    };

    if (this.isCSV) {
      result['delimiter'] = this.columnDelimiter;
    }

    return result;
  }

  /**
   * Get grid information
   * @param param {any}
   */
  private _getGridInformation(param : any) {

    this.loadingShow();

    this.datasetService.getFileGridInfo(param).then((result) => {

      if (result.gridResponses) {

        this.clearGrid = false;

        this._setSheetInformation(result.gridResponses, result.sheetNames);

        // 첫번째 시트로 그리드를 그린다.
        const sheet = this.datasetFile.sheetInfo[this.defaultSheetIndex];

        // Update grid
        this._updateGrid(sheet.data, sheet.fields);

        this.isDisable = false;

        if (result.sheetNames) {

          if (result.sheetNames.length > 1) {
            this.isMultiSheet = true;
            this.isDisable = true;
          }

          // Select first sheet in the list
          this.datasetFile.sheetName = sheet.sheetName ? sheet.sheetName : undefined;
        }



        // 엑셀이면서 시트가 하나 이상일때
        if (this.isExcel && this.isMultiSheet) {
          this._isAllChecked();
        }

      } else {

        // no result from server
        this.clearGrid = true;
        this.isDisable = true;
        this.loadingHide();

      }

    }).catch((error) => {

      // TODO : When error use toast ?
      console.info(error);
      this.clearGrid = true;
      this.loadingHide();

    });
  }




  /**
   * Change isCheckAll to true if all boxes are checked
   * @private
   */
  private _isAllChecked() {
    const num = this.datasetFile.sheetInfo.filter((data) => {
      return data.selected;
    }).length;

    this.isCheckAll = this.datasetFile.sheetInfo.length === num;
  }

  /**
   * Set sheet information - name, grid etc
   * @param gridInfo
   * @private
   */
  private _setSheetInformation(gridInfo: any, sheetNames: string[]) {

    if (gridInfo && gridInfo.length > 0) {
      this.datasetFile.sheetInfo = [];
      gridInfo.forEach((item, index) => {
        const gridData = this._getGridDataFromGridResponse(item);

        let info : SheetInfo = {
          selected : false,
          data : gridData.data,
          fields : gridData.fields,
          totalRows : 0,
          valid : true,
        };

        if (sheetNames) {
          info.sheetName = sheetNames[index]
        }

        this.datasetFile.sheetInfo.push(info);

      });

    }

  }

  /**
   * Grid update
   * @param data
   * @param {Field[]} fields
   */
  private _updateGrid(data: any, fields: Field[]) {

    if (data.length > 0 && fields.length > 0) {
      this.clearGrid = false;
      const headers: header[] = this._getHeaders(fields);
      const rows: any[] = PreparationCommonUtil.getRows(data);
      this._drawGrid(headers, rows);
    } else {
      this.loadingHide();
      this.clearGrid = true;
    }

  }

  /**
   * Draw grid
   * @param {any[]} headers
   * @param {any[]} rows
   */
  private _drawGrid(headers: any[], rows: any[]) {
    this.safelyDetectChanges();
    this.gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(true)
      .RowHeight(32)
      .build()
    );
    this.loadingHide();
  }

  /**
   * Returns header information for grid
   * @param {Field[]} fields
   * @returns {header[]}
   */
  private _getHeaders(fields: Field[]) {
    return fields.map(
      (field: Field) => {

        /* 70 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth:number = Math.floor(pixelWidth(field.name, { size: 12 })) + 70;

        return new SlickGridHeader()
          .Id(field.name)
          .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.type) + '"></em>' + field.name + '</span>')
          .Field(field.name)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(headerWidth)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(true)
          .build();
      }
    );
  }

  /**
   * API 조회 결과를 바탕으로 그리드 데이터 구조를 얻는다.
   * @param gridResponse
   * @returns {GridData}
   * @private
   */
  private _getGridDataFromGridResponse(gridResponse: any): GridData {
    let colCnt = gridResponse.colCnt;
    let colNames = gridResponse.colNames;
    let colTypes = gridResponse.colDescs;

    const gridData: GridData = new GridData();

    for (let idx = 0; idx < colCnt; idx++) {
      gridData.fields.push({
        name: colNames[idx],
        type: colTypes[idx].type,
        seq: idx,
        uuid : CommonUtil.getUUID()
      });
    }

    gridResponse.rows.forEach((row) => {
      const obj = {};
      for (let idx = 0; idx < colCnt; idx++) {
        obj[colNames[idx]] = row.objCols[idx];
      }
      gridData.data.push(obj);
    });

    return gridData;
  } // function - _getGridDataFromGridResponse



  /**
   *
   * @param fileName
   * @private
   */
  private _setFileType(fileName: string) {
    let fileType : string = new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).exec(fileName)[1].toUpperCase();
    this.isCSV = fileType === ('CSV' || 'TXT');
    this.isExcel = fileType === ('XLSX' || 'XLS');
    this.isJSON = fileType === 'JSON';
  }

  private _isNextBtnDisable(): boolean {
    let idx: number = 0;
    if (this.datasetFile.sheetInfo.length > 1) {
      idx = this.datasetFile.sheetInfo.findIndex((item)=> {
        return item.selected
      });
    }
    return idx === -1

  }


  /**
   * Go to next stage with enter key
   * @param event Event
   */
  @HostListener('document:keydown.enter', ['$event'])
  private onEnterKeydownHandler(event: KeyboardEvent) {
    if(event.keyCode === 13 ) {
      this.next();
    }
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
class Field {
  name : string;
  type : string;
  timestampStyle?: string;
}

class GridData {
  public data: any[];
  public fields: any[];

  constructor() {
    this.data = [];
    this.fields = [];
  }
}
