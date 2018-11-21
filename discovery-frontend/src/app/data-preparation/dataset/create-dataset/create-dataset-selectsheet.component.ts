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

import { Component, ElementRef, EventEmitter, HostListener, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { PopupService } from '../../../common/service/popup.service';
import {DatasetFile, SheetInfo} from '../../../domain/data-preparation/dataset';
import { Alert } from '../../../common/util/alert.util';
import { DatasetService } from '../service/dataset.service';
import { FileLikeObject, FileUploader } from 'ng2-file-upload';
import { CookieConstant } from '../../../common/constant/cookie.constant';
import { CommonConstant } from '../../../common/constant/common.constant';
import { DomSanitizer } from '@angular/platform-browser';
import { GridComponent } from '../../../common/component/grid/grid.component';
import { header, SlickGridHeader } from '../../../common/component/grid/grid.header';
import { Field } from '../../../domain/datasource/datasource';
import { GridOption } from '../../../common/component/grid/grid.option';

import { isNullOrUndefined, isUndefined } from 'util';
import * as pixelWidth from 'string-pixel-width';
import {PreparationCommonUtil} from "../../util/preparation-common.util";

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

  @ViewChild('fileUploadChange')
  private fileUploadChange: ElementRef;

  private interval : any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Output()
  public typeEmitter = new EventEmitter<string>();

  @Input()
  public datasetFile: DatasetFile;

  // csv, txt, and excel with one sheet is regarded as csv
  public isCSV: boolean = false;

  // default value is comma
  public columnDelimiter : string = ',';

  public uploader: FileUploader;
  public uploadResult;

  // tell if uploaded file is changed
  public isChanged : boolean = false;

  // grid hide
  public clearGrid : boolean = false;

  public defaultSheetIndex : number = 0;

  public isCheckAll: boolean = false;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private datasetService: DatasetService,
              protected elementRef: ElementRef,
              protected injector: Injector,
              public sanitizer: DomSanitizer) {

    super(elementRef, injector);

    this.uploader = new FileUploader(
      {
        url: CommonConstant.API_CONSTANT.API_URL + 'preparationdatasets/upload_async',
      }
    );

    // 옵션 설정
    this.uploader.setOptions({
      url: CommonConstant.API_CONSTANT.API_URL
      + 'preparationdatasets/upload_async',
      headers: [
        { name: 'Accept', value: 'application/json, text/plain, */*' },
        {
          name: 'Authorization',
          value: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
        }
      ],
    });

    // add 가 처음
    this.uploader.onAfterAddingFile = (item) => {
      this.loadingShow();

      if(!new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).test( item.file.name )) { // check file extension
        this.uploader.clearQueue();
        this.fileUploadChange.nativeElement.value = ''; // 같은 파일은 연속으로 올리면 잡지 못해서 초기화
        Alert.error(this.translateService.instant('msg.dp.alert.file.format.wrong'));
        this.loadingHide();
      } else{
        this.isCheckAll = false;
        this.uploader.uploadAll();
      }
    };

    // add 할때 에러난다면
    this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) => {
      Alert.error(item.name + this.translateService.instant('msg.dp.alert.file.format.wrong'));
    };

    // 업로드 전 ..
    this.uploader.onBeforeUploadItem = (item) => {
      item.method = 'POST';
    };

    // 업로드 성공
    this.uploader.onSuccessItem = (item, response, status, headers) => {
      const success = true;
      this.isChanged = true;
      this.clearGrid = true;
      this.columnDelimiter = ',';
      this.uploadResult = { success, item, response, status, headers };
      this.checkIfUploaded(response);
    };

    // 업로드 하고 에러났을때
    this.uploader.onErrorItem = (item, response, status, headers) => {
      Alert.error(this.translateService.instant('msg.dp.alert.file.format.wrong'));
      this.loadingHide();
    };

    // 마지막
    // this.uploader.onCompleteAll = () => {
    //   let res = JSON.parse(this.uploadResult.response);
    //   if (res.success !== false) {
    //     this.columnDelimiter = ',';
    //     this.isChanged = true;
    //     this.getDataFile();
    //   } else {
    //     Alert.error(this.translateService.instant('Failed to upload. Please select another file'));
    //     this.loadingHide();
    //     this.popupService.notiPopup({
    //       name: 'select-file',
    //       data: null
    //     });
    //   }
    // };
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {

    super.ngOnInit();

    // for delimiter
    this.isCSV = PreparationCommonUtil.getFileNameAndExtension(this.datasetFile.filename)[1].toLowerCase() === 'csv';

    // only get grid info when grid info is empty
    if (this.datasetFile.sheetInformation.length == 0) {
      this._getGridInformation(this._getParamForGrid());
    } else {  // don't need getting grid API since it's already there - coming back from other steps

      this.clearGrid = false;

      this._isAllChecked();

      // csv or excel with one sheet
      if (this.datasetFile.sheetInformation.length === 1) {
        this.defaultSheetIndex = 0;
      } else {

        // multiple sheet excel
        this.defaultSheetIndex = this.datasetFile.sheetInformation.findIndex((item) => {
          return item.selected;
        });

        this.datasetFile.sheetname = this.datasetFile.sheetInformation[this.defaultSheetIndex].sheetName;
        this.datasetFile.sheetIndex = this.defaultSheetIndex;
      }

      // update grid
      this._updateGrid(this.datasetFile.sheetInformation[this.defaultSheetIndex].data,this.datasetFile.sheetInformation[this.defaultSheetIndex].fields);
    }

  }


  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


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

    this.isChanged = false;
    this.defaultSheetIndex = idx;
    this.datasetFile.sheetname = sheetName;
    this.datasetFile.sheetIndex = idx;


    // if grid info is valid show grid else clear grid
    if (!isNullOrUndefined(this.datasetFile) && this.datasetFile.sheetInformation[this.defaultSheetIndex]) {
      this._updateGrid(this.datasetFile.sheetInformation[this.defaultSheetIndex].data, this.datasetFile.sheetInformation[this.defaultSheetIndex].fields);
    } else {
      this.clearGrid = true;
    }
  }


  /**
   * Move to next step
   */
  public next() {

    if (this.isDisable()) {
      return;
    }

    this.datasetFile.delimiter = this.columnDelimiter;

    if(isUndefined(this.datasetFile.delimiter) || this.datasetFile.delimiter === '' ){
      this.columnDelimiter = '';
      Alert.warning(this.translateService.instant('msg.dp.alert.col.delim.required'));
      return;
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

    this.isChanged = true;

    //  change grid
    this._getGridInformation(this._getParamForGrid());

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
   * Refresh dataset file infos
   */
  public refreshSheetInfo() {
    if (isUndefined(this.datasetFile)) {
      return;
    }

    if(this.isChanged) { // when uploaded file is changed

      const response: any = this.uploadResult.response;
      this.datasetFile.filename = response.filename;
      this.datasetFile.filepath = response.filepath;
      this.datasetFile.filekey = response.filekey;
      this.defaultSheetIndex = 0;
      this.isCSV = PreparationCommonUtil.getFileNameAndExtension(this.datasetFile.filename)[1].toLowerCase() === 'csv';

    }

  }


  /**
   * Returns grid css
   * @returns {any}
   */
  public getGridStyle() : any {
    if( this.datasetFile.sheetname && ''!==this.datasetFile.sheetname) {
      return null;
    }
    return {'top':'0px'};
  }

  /**
   * Check if uploaded
   * @param response
   */
  public checkIfUploaded(response: any) {
    let res = JSON.parse(response);
    this.fetchUploadStatus(res.filekey);
    this.interval = setInterval(() => {
      this.fetchUploadStatus(res.filekey);
    }, 1000)
  }

  /**
   * Polling
   * @param {string} fileKey
   */
  public fetchUploadStatus(fileKey: string) {
    this.datasetService.checkFileUploadStatus(fileKey).then((result) => {

      if (result.state === 'done'  && result.success) {
        clearInterval(this.interval);
        this.interval = undefined;
        this.isChanged = true;
        this.uploadResult.response = result;
        this.refreshSheetInfo();
        this._getGridInformation(this._getParamForGrid());


      }  else if (result.success === false) { // upload failed

        this.loadingHide();
        Alert.error(this.translateService.instant('Failed to upload. Please select another file'));
        clearInterval(this.interval);
        this.interval = undefined;
        return;
      }
    });
  }


  /**
   * Returns total of selected sheet
   * @returns {string}
   */
  public getTotal(): string {
    let result = '';
    let num = this.datasetFile.sheetInformation.filter((obj) => {
      return obj.selected
    }).length;
    if (num === 0 || num === 1){
      result = num + ' selection';
    } else {
      result = num + ' selections';
    }
    return result
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

    this.datasetFile.sheetInformation = this.datasetFile.sheetInformation.map((obj) => {
      obj.selected = this.isCheckAll; //  obj.selected = true or false
      return obj;
    });

  }

  /**
   * Check if at least one is checked
   * return {boolean} returns true if at least one is checked
   */
  public partialChecked(): boolean {

    const isCheckAll = this.datasetFile.sheetInformation.every((item) => {
      return item.selected;
    });

    if (isCheckAll) {
      return false;
    }

    const unChecked = this.datasetFile.sheetInformation.every((item) => {
      return item.selected === false;
    });

    if (unChecked) {
      return false;
    }

    this.isCheckAll = false;

    return true;

  } // function - partialChecked


  /**
   * Check if done btn should be disabled or not
   * @returns {boolean}
   */
  public isDisable(): boolean {

    let result: boolean = true;

    if (this.datasetFile.sheetInformation) {

      if (this.isCSV) {

        result = !this.isCSV;

      } else {

        if (this.datasetFile.sheetInformation.length > 1) {
          // check if selected
          let arr = this.datasetFile.sheetInformation.filter((obj) => {
            return obj.selected
          });

          // check if grid is valid among selected sheet
          if (arr.length > 0 ) {
            result = arr.findIndex(item => !item.valid) > -1
          }

        } else {
          result = false;
        }
      }

    }
    return result;
  }


  /**
   * Returns true with file is excel that has more than one sheet
   * @returns {boolean}
   */
  public isMultiSheet() {

    let result: boolean = false;

    if (this.isCSV) {
      result = true;
    } else {
      result = !(this.datasetFile.sheetInformation && this.datasetFile.sheetInformation.length > 1)
    }

    return result
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
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
          .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.logicalType.toString()) + '"></em>' + field.name + '</span>')
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
   * Grid update
   * @param data
   * @param {Field[]} fields
   */
  private _updateGrid(data: any, fields: any) {

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
   * Get grid information
   * @param param {any}
   */
  private _getGridInformation(param : any) {

    this.loadingShow();

    this.datasetService.getFileGridInfo(param).then((result) => {


      if (result.grids && result.grids.length > 0) {

        this.clearGrid = false;

        this._setSheetInformation(result.grids);

        if (!this.isCSV) {
          this._isAllChecked();
        }

        const sheet = this.datasetFile.sheetInformation[this.defaultSheetIndex];
        // Update grid
        this._updateGrid(sheet.data , sheet.fields);

        // Select first sheet in the list
        this.datasetFile.sheetname = sheet.sheetName ? sheet.sheetName : undefined;


      } else {

        // no result from server
        this.clearGrid = true;
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
   * Returns parameter required for grid fetching API
   * @returns result {fileKey: string, sheetname: string, delimiter: string, fileType: string}
   * @private
   */
  private _getParamForGrid() {
    return {
      fileKey : this.datasetFile.filekey,
      sheetname : this.datasetFile.sheetname,
      delimiter : this.columnDelimiter,
      fileType : PreparationCommonUtil.getFileNameAndExtension(this.datasetFile.filename)
    };
  }


  /**
   * Change isCheckAll to true if all boxes are checked
   * @private
   */
  private _isAllChecked() {
    const num = this.datasetFile.sheetInformation.filter((data) => {
      return data.selected;
    }).length;

    this.isCheckAll = this.datasetFile.sheetInformation.length === num;
  }


  /**
   * Go to next stage with enter key
   * @param event Event
   */
  @HostListener('document:keydown.enter', ['$event'])
  private _onEnterKeydownHandler(event: KeyboardEvent) {
    if(event.keyCode === 13 ) {
      this.next();
    }
  }


  /**
   * Set sheet information - name, grid etc
   * @param gridInfo
   * @private
   */
  private _setSheetInformation(gridInfo: any) {

    if (gridInfo && gridInfo.length > 0) {
      this.datasetFile.sheetInformation = [];
      gridInfo.forEach((item) => {

        let info : SheetInfo = {
          selected : false,
          data : item.data,
          fields : item.fields,
          totalRows : item.totalRows,
          valid : item.fields.length > 0 && item.data.length > 0
        };

        if (item.sheetName) {
          info['sheetName'] = item.sheetName;
        }
        this.datasetFile.sheetInformation.push(info);

      });

    }

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
