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
import {PrDatasetFile, SheetInfo, FileFormat} from '../../../domain/data-preparation/pr-dataset';
import { DatasetService } from '../service/dataset.service';
import { GridComponent } from '../../../common/component/grid/grid.component';
import { header, SlickGridHeader } from '../../../common/component/grid/grid.header';
import { GridOption } from '../../../common/component/grid/grid.option';

import { isNull, isNullOrUndefined } from 'util';
import * as pixelWidth from 'string-pixel-width';
import {PreparationCommonUtil} from "../../util/preparation-common.util";
import {CommonUtil} from "../../../common/util/common.util";

@Component({
  selector: 'app-create-dataset-selecturl',
  templateUrl: './create-dataset-selecturl.component.html',
})
export class CreateDatasetSelecturlComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

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
  public isEXCEL: boolean = false;
  public isJSON: boolean = false;

  public settingFoldFlag: boolean = false;

  // grid hide
  public clearGrid : boolean = true;

  public isNext: boolean = false;

  public isDelimiterRequired : boolean = false;
  public isColumnCountRequired : boolean = false;

  public currDelimiter : string = '';
  public currSheetIndex : number = 0;
  public currDSIndex: number = 0;
  public currDetail : any;
  public currColumnCount: number;

  public previewErrorMessge : string;


  public storedUri : string = '';
  public isValidCheck : boolean = false;

  public errorNum: number;
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
    this.previewErrorMessge = '';

    // Check init by selected count
    this._checkNextBtn();

    this.settingFoldFlag = false;

    this._isInit = ( !this.datasetFiles[0]);

    if (this._isInit){

      let datasetFile = new PrDatasetFile();

      datasetFile.storedUri = '';
      datasetFile.sheetInfo = [];
      this.datasetFiles.push(datasetFile);

    } else {

      this.storedUri = this.datasetFiles[0].storedUri;
      this.isValidCheck = true;
      this._updateGrid(this.datasetFiles[0].sheetInfo[0].data, this.datasetFiles[0].sheetInfo[0].fields);
      this.currDelimiter = ( this.datasetFiles[0].fileFormat === FileFormat.CSV ? this.datasetFiles[0].delimiter : '');
      this.currColumnCount = ( this.datasetFiles[0].sheetInfo ? this.datasetFiles[0].sheetInfo[0].columnCount : 0 );
      this._setFileFormat(this.datasetFiles[0].fileFormat);
      this._setDetailInfomation(0,0);

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

    // Check if came from dataflow
    if (this.datasetService.dataflowId) {
      this.datasetService.dataflowId = undefined;
    }

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
      name: 'close-create',
      data: null
    });
  }

  /**
   * Move to next step
   */
  public next() {

    // 이미 validation 했고 실패한 상태
    if (!isNullOrUndefined(this.errorNum) || this.isColumnCountRequired || this.isDelimiterRequired) {
      return;
    }

    // File url can't be empty
    if (this.storedUri.trim() === '' || isNullOrUndefined(this.storedUri)) {
      this.errorNum = 0;
      this.isValidCheck = false;
      return;
    }


    if (!this.isValidCheck) {
      this.errorNum = 0;
      return;
    }

    // Find selected sheets
    this.datasetFiles.forEach((dsFile)=>{
      if(dsFile.sheetInfo && dsFile.fileFormat === FileFormat.EXCEL){
        dsFile.selectedSheets = [];
        dsFile.sheetInfo.forEach((sheet)=>{
          if( sheet.selected ) dsFile.selectedSheets.push(sheet.sheetName);
        });
      }
    });

    // Excel일 경우 Sheet가 하나 이상 선택되어있어야 한다
    if (this.isEXCEL) {
      if (this.datasetFiles[0].selectedSheets.length === 0) {
        return;
      }
    }


    this.typeEmitter.emit('URL');
    this.popupService.notiPopup({
      name: 'create-dataset-name',
      data: null
    });

  }



  /**
   * Check URL Validation
   */
  public checkValidation(){

    if(this.storedUri.length < 1){
      console.log('length error');
      this.errorNum = 0;
      this.isValidCheck = false;
      return;
    }

    this.settingFoldFlag = false;

    // Why ?
    this._setFileFormat();
    this.currDelimiter = ',';

    // this.storedUri ='file:///Development/project/metatron-app/dataprep/uploads/dfaa81a7-b702-478c-91f8-18d3b9f96a00.xlsx';
    // this.storedUri ='hdfs://localhost:9000/user/hive/dataprep/uploads/967d9cb8-f03d-4476-9f5a-b0cf22ba7fed.xlsx';
    //
    // this.storedUri = 'file:///Development/project/metatron-app/dataprep/uploads/7f680c39-7b94-44f1-ac3b-d9dc18a15367.json';
    // this.storedUri = 'hdfs://localhost:9000/user/hive/dataprep/uploads/2e73f15f-2b26-4e1a-9305-3a94fc3b4948.json';
    //
    // this.storedUri = 'file:///Development/project/metatron-app/dataprep/uploads/2579531b-2c5a-40a8-8b02-0c8bd732553f.csv';
    // this.storedUri = 'hdfs://localhost:9000/user/hive/dataprep/uploads/b5192e9e-c67c-49a6-90ef-148860a0a2ea.csv';

    this.currDetail = {fileFormat: null, detailName: null, columns: null, rows: null};
    //this.datasetFiles[0].error = [];
    delete this.datasetFiles[0].error;
    this.datasetFiles[0].fileName = this.storedUri.slice(this.storedUri.lastIndexOf('/')+1, this.storedUri.lastIndexOf('.'));
    this.datasetFiles[0].fileExtension = (this.storedUri.lastIndexOf('.')> 0? this.storedUri.slice(this.storedUri.lastIndexOf('.')+1, this.storedUri.length) : '');

    this.datasetFiles[0].filenameBeforeUpload = this.storedUri.slice(this.storedUri.lastIndexOf('/')+1, this.storedUri.length);
    this.datasetFiles[0].storedUri = this.storedUri;


    // File format
    if (!isNullOrUndefined(PreparationCommonUtil.getFileFormat(this.datasetFiles[0].fileExtension))) {
      this.datasetFiles[0].fileFormat = PreparationCommonUtil.getFileFormat(this.datasetFiles[0].fileExtension);
    } else {
      this.datasetFiles[0].fileFormat = FileFormat.CSV;
    }

    this.datasetFiles[0].delimiter = ',';

    this.datasetFiles[0].sheetIndex = null;
    this.datasetFiles[0].sheetName = '';
    this.datasetFiles[0].selectedSheets = [];
    this.datasetFiles[0].selected = false;

    this.datasetFiles[0].sheetInfo = [];

    this._setFileFormat(this.datasetFiles[0].fileFormat);

    this._getGridInformation(0, this._getParamForGrid(this.datasetFiles[0]), 'draw');
  }


  /**
   * Toggle advanced setting
   */
  public toggleAdvancedSetting(){
    this.settingFoldFlag = !this.settingFoldFlag;
    return this.settingFoldFlag;
  }


  /**
   * When delimiter is changed(only CSV)
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
      this.isColumnCountRequired = false;
    }
  }

  /**
   * Keydown event
   * @param event
   * @param type
   */
  public keydownEvent(event, type: string) {

    // 13 is enter key
    if (event.keyCode === 13 ) {

      // Stop event bubbling
      event.stopPropagation();
      event.preventDefault();

      // Column count input
      if ('colCnt' === type) {
        this.changeColumnCount();
      }

      // File url input
      if ('url' === type) {
        this.checkValidation();
      }

      // File delimiter
      if ('delimiter' === type) {
        this.changeDelimiter();
      }

    } else {


      // 단어가 지워지거나 추가된다면
      if (this._isKeyPressedWithChar(event.keyCode)) {

        // Column count input
        if ('colCnt' === type) {
          this.isColumnCountRequired = true;
        }

        // Column count input
        if ('delimiter' === type) {
          this.isDelimiterRequired = true;
        }

        // File url input
        if ('url' === type) {
          this.errorNum = null;
        }

        this.isValidCheck = false;
      }

    }

  }


  /**
   * When columnCount is changed(CSV, EXCEL)
   */
  public changeColumnCount(){
    this.isColumnCountRequired = ( (isNullOrUndefined(this.currColumnCount) || 1 > this.currColumnCount) && this.datasetFiles[this.currDSIndex].fileFormat != FileFormat.JSON);

    if (isNullOrUndefined(this.currColumnCount) || 1 > this.currColumnCount || this.datasetFiles[this.currDSIndex].fileFormat === FileFormat.JSON) {
      return;
    }

    if( this.datasetFiles[this.currDSIndex].sheetInfo && this.datasetFiles[this.currDSIndex].sheetInfo[this.currSheetIndex].columnCount !=  this.currColumnCount ) {
      this.datasetFiles[this.currDSIndex].sheetInfo[this.currSheetIndex].columnCount = this.currColumnCount;
      this.loadingShow();
      this._getGridInformation(this.currDSIndex, this._getParamForGrid(this.datasetFiles[this.currDSIndex], this.currColumnCount),'draw');
      this.isValidCheck = true;
    }
  }


  /**
   * Returns grid style
   */
  public getGridStyle() {
    return {'top':'0px'};
  }


  /**
   * When Datafile Checked
   * @param event
   * @param dsIdx
   */
  public checkGroup(event: any, dsIdx: number){

    //stop event bubbling
    event.stopPropagation();
    event.preventDefault();
    if(!this.datasetFiles[dsIdx].sheetInfo) return;

    this.datasetFiles[dsIdx].sheetInfo = this.datasetFiles[dsIdx].sheetInfo.map((obj) => {
      obj.selected = !this.datasetFiles[dsIdx].selected; //  obj.selected = true or false
      return obj;
    });

    this.datasetFiles[dsIdx].selected = !this.datasetFiles[dsIdx].selected;
    this._checkNextBtn();
  }


  /**
   * When Sheet Checked
   * @param event
   * @param dsIdx
   * @param sheetIdx
   */
  public checkSheet(event:any, dsIdx: number, sheetIdx: number){
    //stop event bubbling
    event.stopPropagation();
    event.preventDefault();
    console.log('checkSheet',this.datasetFiles[dsIdx]);
    if(!this.datasetFiles[dsIdx].sheetInfo) return;

    this.datasetFiles[dsIdx].sheetInfo[sheetIdx].selected = !this.datasetFiles[dsIdx].sheetInfo[sheetIdx].selected;
    if (!this.datasetFiles[dsIdx].sheetInfo[sheetIdx].selected) this.datasetFiles[dsIdx].selected = false;

    let selectedCount: number = 0;
    this.datasetFiles[dsIdx].sheetInfo.forEach((sheet)=>{
      if(sheet.selected) selectedCount ++;
    });
    if (selectedCount === this.datasetFiles[dsIdx].sheetInfo.length) this.datasetFiles[dsIdx].selected = true;

    this._checkNextBtn();
    this.safelyDetectChanges();
  }


  /**
   * Select datasetFile and show grid
   * @param event
   * @param dsIdx
   */
  public selectFile(event: any, dsIdx: number){
    
    // stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    this.previewErrorMessge = (this.datasetFiles[dsIdx].error? this.datasetFiles[dsIdx].error.details : '');

    this.isDelimiterRequired = false;
    this.isColumnCountRequired = false;

    if (this.datasetFiles[dsIdx].fileFormat != FileFormat.EXCEL){
      this._setFileFormat(this.datasetFiles[dsIdx].fileFormat);

      this.currDSIndex = dsIdx;
      this.currSheetIndex = 0;

      this._setDetailInfomation(dsIdx, 0);

      this.currDelimiter = this.datasetFiles[dsIdx].delimiter;

      this.currColumnCount = ( this.datasetFiles[dsIdx].sheetInfo ? this.datasetFiles[dsIdx].sheetInfo[0].columnCount : 0 );

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
   * @param dsIdx
   * @param sheetName
   * @param sheetIdx
   */
  public selectSheet(event: any, dsIdx: number,sheetName: string, sheetIdx: number) {
    event.stopPropagation();
    event.preventDefault();

    this.isDelimiterRequired = false;
    this.currDelimiter = '';

    this.isColumnCountRequired = false;
    this.currColumnCount = ( this.datasetFiles[dsIdx].sheetInfo ? this.datasetFiles[dsIdx].sheetInfo[sheetIdx].columnCount : 0 );

    this.currDSIndex = dsIdx;
    this._setFileFormat(this.datasetFiles[dsIdx].fileFormat);
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
  private _setFileFormat(fileFormat? : FileFormat){
    if (fileFormat && fileFormat.toString().length>0){
      this.isCSV = (fileFormat === FileFormat.CSV);
      this.isJSON = (fileFormat === FileFormat.JSON);
      this.isEXCEL = (fileFormat === FileFormat.EXCEL);
    } else {
      this.isCSV = false;
      this.isJSON = false;
      this.isEXCEL = false;
    }
  }

  /**
   * Returns parameter required for grid fetching API
   * @returns result {fileKey: string, delimiter: string}
   * @private
   */
  private _getParamForGrid(datasetFile : PrDatasetFile, manualColumnCount?:number) {
    const result = {
      storedUri : datasetFile.storedUri,
    };
    if (datasetFile.fileFormat === FileFormat.CSV) result['delimiter'] = datasetFile.delimiter;
    if (manualColumnCount && manualColumnCount > 0) result['manualColumnCount'] = manualColumnCount;

    return result;
  }

  private _getGridInformation(idx: number, param : any, option: string ) {
    this.loadingShow();

    this.datasetService.getFileGridInfo(param).then((result) => {

      if (result.gridResponses) {

        this.isValidCheck = true;

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

        this.errorNum = null;

      } else {

        // no result from server
        if( option && option === 'draw') this.clearGrid = true;
        this.errorNum = 1;
        this.isValidCheck = false;

      }
      this.loadingHide();

    }).catch(() => {

      this.errorNum = 1;
      this.isValidCheck = false;
      this.datasetFiles[0] = new PrDatasetFile();
      this.clearGrid = true;
      this.isEXCEL = false;
      this.gridComponent.destroy();
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
          selected : true,
          data : gridData.data,
          fields : gridData.fields,
          totalRows : 0,
          valid : true,
          columnCount : gridData.fields.length
        };

        if (sheetNames) info.sheetName = sheetNames[index];

        this.datasetFiles[idx].sheetInfo.push(info);

        if ( this.currDSIndex === 0 ) this._setDetailInfomation(0, 0);

      });

      // set current column count
      if( idx === this.currDSIndex ) this.currColumnCount = (this.datasetFiles[this.currDSIndex].sheetInfo? this.datasetFiles[this.currDSIndex].sheetInfo[this.currSheetIndex].columnCount: null);

      this.datasetFiles[idx].selected = true;
      this.isNext = true;
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


  /**
   * Returns true if something is typed on the keyboard
   * Returns false if shift, tab etc is pressed
   * 즉 직접 단어 자체가 지워지거나 입력된다면 true 를 반환한다.
   * @param keyCode
   */
  private _isKeyPressedWithChar(keyCode: number): boolean {
    const exceptionList: number[] = [9,13,16,17,18,19,20,27,33,34,35,36,37,38,39,40,45,46,91,92,219,220,93,144,145];
    return exceptionList.indexOf(keyCode) === -1
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
