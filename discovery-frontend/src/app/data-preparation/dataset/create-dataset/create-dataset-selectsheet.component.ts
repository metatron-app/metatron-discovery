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
import {PrDatasetFile, SheetInfo, StorageType, FileFormat} from '../../../domain/data-preparation/pr-dataset';
import { Alert } from '../../../common/util/alert.util';
import { DatasetService } from '../service/dataset.service';
import { GridComponent } from '../../../common/component/grid/grid.component';
import { header, SlickGridHeader } from '../../../common/component/grid/grid.header';
import { GridOption } from '../../../common/component/grid/grid.option';

import { isNull, isNullOrUndefined, isUndefined } from 'util';
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

  private _isInit: boolean = true;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  public typeEmitter = new EventEmitter<string>();

  @Input()
  public datasetFiles: any;

  public isCSV: boolean = false;

  // grid hide
  public clearGrid : boolean = false;

  public isNext: boolean = false;

  public isDelimiterRequired : boolean = false;
  public currDelimiter : string = '';
  public currSheetIndex : number = 0;
  public currDSIndex: number = 0;
  public currDetail : any;

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

    this.currDSIndex = 0;
    this.currSheetIndex = 0;
    this.currDetail = {fileFormat: null, detailName: null, columns: null, rows: null};

    // Check init by selected count
    this._checkNextBtn();
    this._isInit = !this.isNext;

    if(this._isInit){
      this.datasetFiles.forEach((dsFile, index) => {
        this.datasetFiles[index].sheetIndex = null;
        this.datasetFiles[index].sheetName = '';
        this.datasetFiles[index].selectedSheets = [];
        this.datasetFiles[index].selected = false;

        if(index === 0) {
          this.isCSV = (  this.datasetFiles[index].fileFormat === FileFormat.CSV);
          this.currDelimiter = ( this.datasetFiles[index].fileFormat === FileFormat.CSV ? ',' : '');
        }
        let option: string = ( index === 0 ? 'draw' : '');

        this._getGridInformation(index, this._getParamForGrid(dsFile), option);
      });
    } else {
      this.isCSV = (this.datasetFiles[this.currDSIndex].fileFormat == FileFormat.CSV);

      if(this.datasetFiles[this.currDSIndex].sheetInfo){
        this._updateGrid(this.datasetFiles[this.currDSIndex].sheetInfo[this.currSheetIndex].data, this.datasetFiles[this.currDSIndex].sheetInfo[this.currSheetIndex].fields);
      } else {
        this.clearGrid = true;
      }
      this._setDetailInfomation(this.currDSIndex, this.currSheetIndex);
      this._checkNextBtn();
    }

  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Close
   */
  public close() {
    super.close();

    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });
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
   * Move to next step
   */
  public next() {

    if (!this.isNext)  return;

    this.datasetFiles.forEach((dsFile,idx)=>{
      if(dsFile.sheetInfo && dsFile.fileFormat === FileFormat.EXCEL){
        dsFile.selectedSheets = [];
        dsFile.sheetInfo.forEach((sheet)=>{
          if( sheet.selected ) dsFile.selectedSheets.push(sheet.sheetName);
        });
      }
    });

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
    this.isDelimiterRequired = ('' === this.currDelimiter && this.datasetFiles[this.currDSIndex].fileFormat === FileFormat.CSV);

    // No change in grid when delimiter is empty
    if (isNullOrUndefined(this.currDelimiter) || '' === this.currDelimiter || this.datasetFiles[this.currDSIndex].fileFormat != FileFormat.CSV) {
      return;
    }
    if( this.datasetFiles[this.currDSIndex].delimiter !=  this.currDelimiter ){
      this.datasetFiles[this.currDSIndex].delimiter =  this.currDelimiter;
      this.loadingShow();
      this._getGridInformation(this.currDSIndex, this._getParamForGrid(this.datasetFiles[this.currDSIndex]),'draw');
    }
  }

  public getGridStyle() {
    return {'top':'45px'};
  }

  /**
   * When Datafile Checked
   * @param event
   * @param dataFileIndex
   */
  public checkGroup(evnet: Event, DsIdx: number){
    //stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    if(!this.datasetFiles[DsIdx].sheetInfo) return;

    this.datasetFiles[DsIdx].sheetInfo = this.datasetFiles[DsIdx].sheetInfo.map((obj) => {
      obj.selected = !this.datasetFiles[DsIdx].selected; //  obj.selected = true or false
      return obj;
    });

    this.datasetFiles[DsIdx].selected = !this.datasetFiles[DsIdx].selected;
    this._checkNextBtn();
  }
  /**
   * When Sheet Checked
   * @param event
   * @param dataFileIndex
   * @param sheetIndex
   */
  public checkSheet(event:Event, DsIdx: number, sheetIdx: number){
    //stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    if(!this.datasetFiles[DsIdx].sheetInfo) return;

    this.datasetFiles[DsIdx].sheetInfo[sheetIdx].selected = !this.datasetFiles[DsIdx].sheetInfo[sheetIdx].selected;
    if (!this.datasetFiles[DsIdx].sheetInfo[sheetIdx].selected) this.datasetFiles[DsIdx].selected = false;

    let selectedCount: number = 0;
    this.datasetFiles[DsIdx].sheetInfo.forEach((sheet)=>{
      if(sheet.selected) selectedCount ++;
    });
    if (selectedCount === this.datasetFiles[DsIdx].sheetInfo.length) this.datasetFiles[DsIdx].selected = true;

    this._checkNextBtn();
    this.safelyDetectChanges();
  }

  /**
   * Select datasetFile and show grid
   */
  public selectFile(event: Event, dsIdx: number){
    // stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    this.isDelimiterRequired = false;
    this.currDelimiter = '';

    this.isCSV = (this.datasetFiles[dsIdx].fileFormat === FileFormat.CSV);

    if (this.datasetFiles[dsIdx].fileFormat != FileFormat.EXCEL){
      this.currDSIndex = dsIdx;
      this.currSheetIndex = 0;

      this._setDetailInfomation(dsIdx, 0);

      this.currDelimiter = this.datasetFiles[dsIdx].delimiter;

      if(!this.datasetFiles[dsIdx].sheetInfo){
        this.clearGrid = true;
        return;
      }

      this.currSheetIndex = 0;
      this.datasetFiles[dsIdx].sheetIndex = 0;
      this.datasetFiles[dsIdx].sheetName = this.datasetFiles[dsIdx].sheetInfo[0].sheetName;

      // if grid info is valid show grid else clear grid
      if (!isNullOrUndefined(this.datasetFiles[dsIdx]) && this.datasetFiles[dsIdx].sheetInfo[0]) {
        this._updateGrid(this.datasetFiles[dsIdx].sheetInfo[0].data, this.datasetFiles[dsIdx].sheetInfo[0].fields);
      } else {
        this.clearGrid = true;
      }
    }
  }

  /**
   * Select sheet and show grid
   * @param event
   * @param datasetFileIndex
   * @param sheetName
   * @param sheetIndex
   */
  public selectSheet(event: Event, dsIdx: number,sheetName: string, sheetIdx: number) {
    // stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    this.isDelimiterRequired = false;
    this.currDelimiter = '';
    this.currDSIndex = dsIdx;
    this.isCSV = false;
    this.currSheetIndex = sheetIdx;

    if(!this.datasetFiles[dsIdx].sheetInfo){
      this.clearGrid = true;
      return;
    }

    this._setDetailInfomation(dsIdx, sheetIdx);

    this.currSheetIndex = sheetIdx;
    this.datasetFiles[dsIdx].sheetIndex = sheetIdx;
    this.datasetFiles[dsIdx].sheetName = sheetName;

    // if grid info is valid show grid else clear grid
    if (!isNullOrUndefined(this.datasetFiles[dsIdx]) && this.datasetFiles[dsIdx].sheetInfo[sheetIdx]) {
      this._updateGrid(this.datasetFiles[dsIdx].sheetInfo[sheetIdx].data, this.datasetFiles[dsIdx].sheetInfo[sheetIdx].fields);
    } else {
      this.clearGrid = true;
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Returns parameter required for grid fetching API
   * @returns result {fileKey: string, delimiter: string}
   * @private
   */
  private _getParamForGrid(datasetFile : PrDatasetFile) {
    const result = {
      storedUri : datasetFile.storedUri,
    };
    if (datasetFile.fileFormat === FileFormat.CSV) result['delimiter'] = datasetFile.delimiter;

    return result;
  }

  private _getGridInformation(idx: number, param : any, option?: string) {
    this.loadingShow();

    this.datasetService.getFileGridInfo(param).then((result) => {

      if (result.gridResponses) {

        if( option && option === 'draw') this.clearGrid = false;

        this._setSheetInformation(idx, result.gridResponses, result.sheetNames);

        // 첫번째 시트로 그리드를 그린다.
        const sheet = this.datasetFiles[idx].sheetInfo[this.currSheetIndex];

        // Update grid
        if( option && option === 'draw') this._updateGrid(sheet.data, sheet.fields);

        if (result.sheetNames) {

          // Select first sheet in the list
          this.datasetFiles[idx].sheetName = sheet.sheetName ? sheet.sheetName : undefined;
        }

      } else {

        // no result from server
        if( option && option === 'draw') this.clearGrid = true;

      }
      this.loadingHide();

    }).catch((error) => {

      // TODO : When error use toast ?
      console.info(error);
      this.datasetFiles[idx].error = error;
      if( option && option === 'draw') this.clearGrid = true;
      this.loadingHide();

    });
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
          .ColumnType(field.type)
          .Formatter(( row, cell, value, columnDef ) => {
            if (field.type === 'STRING') {
              value = (value) ? value.toString().replace(/</gi, '&lt;') : value;
              value = (value) ? value.toString().replace(/>/gi, '&gt;') : value;
              value = (value) ? value.toString().replace(/\n/gi, '&crarr;') : value;
              let tag = '<span style="color:#ff00ff; font-size: 9pt; letter-spacing: 0px">&middot;</span>';
              value = (value) ? value.toString().replace(/\s/gi, tag) : value;
            }
            if (isNull(value)) {
              return '<div style=\'position:absolute; top:0; left:0; right:0; bottom:0; line-height:30px; padding:0 10px; font-style: italic ; color:#b8bac2;\'>' + '(null)' + '</div>';
            } else {
              return value;
            }
          })
          .build();
      }
    );
  }

  /**
   * Set sheet information - name, grid etc
   * @param gridInfo
   * @private
   */
  private _setSheetInformation(idx: number, gridInfo: any, sheetNames: string[]) {
    if (gridInfo && gridInfo.length > 0) {
      this.datasetFiles[idx].sheetInfo = [];
      gridInfo.forEach((item, index) => {
        const gridData = this._getGridDataFromGridResponse(item);

        let info : SheetInfo = {
          selected : this._isInit,
          data : gridData.data,
          fields : gridData.fields,
          totalRows : 0,
          valid : true,
        };

        if (sheetNames) info.sheetName = sheetNames[index];

        this.datasetFiles[idx].sheetInfo.push(info);

        if ( this.currDSIndex === 0 ) this._setDetailInfomation(0, 0);

      });

      this.datasetFiles[idx].selected = this._isInit;
      this.isNext = this._isInit;
    }
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
   * Detail Information of Selected Sheet
   * @private
   */
  private _setDetailInfomation(dsIdx:number, sheetIdx?:number){

    if (this.datasetFiles[dsIdx].fileFormat === FileFormat.EXCEL) {
      this.currDetail.detailName = this.datasetFiles[dsIdx].fileName;
      if(this.datasetFiles[dsIdx].sheetInfo) this.currDetail.detailName += '-' + this.datasetFiles[dsIdx].sheetInfo[sheetIdx].sheetName;
    } else {
      this.currDetail.detailName = this.datasetFiles[dsIdx].fileName;
    }
    this.currDetail.fileFormat = this.datasetFiles[dsIdx].fileFormat;
    this.currDetail.columns = ( (this.datasetFiles[dsIdx].sheetInfo)?this.datasetFiles[dsIdx].sheetInfo[sheetIdx].fields.length : null );
    this.currDetail.rows = ( (this.datasetFiles[dsIdx].sheetInfo)?this.datasetFiles[dsIdx].sheetInfo[sheetIdx].totalRows : null );
  }

  /**
   * Check Next Button
   */
  private _checkNextBtn() {
    let selectedCount : number = 0;
    this.datasetFiles.forEach((dsFile)=>{
      if ( dsFile.sheetInfo ){
        dsFile.sheetInfo.forEach((sheet)=>{
          if(sheet.selected) selectedCount ++;
        })
      }
    });
    this.isNext = (selectedCount > 0);
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
