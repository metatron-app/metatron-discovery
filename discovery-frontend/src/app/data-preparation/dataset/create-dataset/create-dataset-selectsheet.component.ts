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
  ChangeDetectorRef,
  Component, ElementRef, EventEmitter, HostListener, Injector, Input, OnDestroy, OnInit, Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { PopupService } from '../../../common/service/popup.service';
import { PrDatasetFile, StorageType } from '../../../domain/data-preparation/pr-dataset';
import { Alert } from '../../../common/util/alert.util';
import { DatasetService } from '../service/dataset.service';
import { DomSanitizer } from '@angular/platform-browser';
import { GridComponent } from '../../../common/component/grid/grid.component';
import { header, SlickGridHeader } from '../../../common/component/grid/grid.header';
import { GridOption } from '../../../common/component/grid/grid.option';

import { isNullOrUndefined, isUndefined } from 'util';
import * as pixelWidth from 'string-pixel-width';

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

  //private interval : any;

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

  // Column Delimiter - default value is comma
  public columnDelimiter : string = ',';

  public uploadLocation: string = 'LOCAL';
  public uploadLocationList: any;

  public uploadResult;

  public isChanged : boolean = false; // tell if uploaded file is changed

  // grid hide
  public clearGrid : boolean = false;

  // Change Detect
  public changeDetect: ChangeDetectorRef;

  public defaultSheetIndex : number = 0;

  public gridInfo : any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private datasetService: DatasetService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    super.ngOnInit();

    let fileType : string = new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).exec( this.datasetFile.filenameBeforeUpload )[1];

    // need to add json type
    if (fileType === 'csv' || fileType === 'txt') {
      this.isCSV = true;
    } else if (fileType === 'json'){
      this.isJSON = true;
    } else {
      this.isExcel = true;
      this.datasetFile.sheetIndex = 0;
      if( isUndefined(this.datasetFile.sheets) ) {
        this.datasetFile.sheets = [];
      }

      if(this.datasetFile.delimiter) { // delimiter 를 바꾼게 있다면 그걸 사용한다
        this.columnDelimiter = this.datasetFile.delimiter;
      }

      if(0 === this.datasetFile.selectedSheets.length) { // 벌써 선택된 sheet가 있다면 converting 필요 없다
        this.convertSheet();
      }
    }
    this.getDataFile();
    this.setUploadLcationList();
  }


  public ngOnDestroy() {
    super.ngOnDestroy();

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Convert array to object
  public convertSheet() {
    this.datasetFile.selectedSheets = [];

    this.datasetFile.sheets.filter((item) => {
      let temp = {
        name :'',
        selected : false // first not selected
      };
      temp.name = item;
      this.datasetFile.selectedSheets.push(temp);
    });
  }

  // excel 시 sheet 아이디 세팅
  public setDataSetSheetIndex(event,sheetname, idx) {
    event.stopPropagation();

    this.isChanged = false;
    this.defaultSheetIndex = idx;
    this.datasetFile.sheetName = sheetname;
    this.datasetFile.sheetIndex = idx;

    // this.getDataFile();

    if (!isNullOrUndefined(this.gridInfo) && this.gridInfo[this.defaultSheetIndex]) {
      //this.updateGrid(this.gridInfo[this.defaultSheetIndex].data, this.gridInfo[this.defaultSheetIndex].fields);
      this.updateGrid(this.gridInfo[this.defaultSheetIndex]);
    } else {
      this.clearGrid = true;
    }
  }


  /**
   * Move to next step
   */
  public next() {

    this.datasetFile.delimiter = this.columnDelimiter;

    if(isUndefined(this.datasetFile.delimiter) || this.datasetFile.delimiter === '' ){
      this.columnDelimiter = '';
      Alert.warning(this.translateService.instant('msg.dp.alert.col.delim.required'));
      return;
    }

    if (this.clearGrid) {
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
    this.loadingShow();
    this.getGridInformation(this.getParamForGrid());

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
   * Get grid information of file
   * getGridInformation 이랑 중복 함수 .. 리팩토링 필요 ! DRY !
   */
  public getDataFile() {
    if (isUndefined(this.datasetFile)) {
      return;
    }

    if(this.isChanged) { // when uploaded file is changed
      this.defaultSheetIndex = 0;
      const response: any = this.uploadResult.response;

      this.datasetFile.storedUri = response.storedUri;
      /* sheets are on file_grid
      this.datasetFile.sheets = response.sheets;
      if (response.sheets && response.sheets.length > 0) {
        this.datasetFile.sheetName = response.sheets[0];
        this.convertSheet();
      } else {
        this.datasetFile.sheetName = '';
      }
      */
      this.datasetFile.filenameBeforeUpload = response.filenameBeforeUpload;
    }

    this.loadingShow();

    this.getGridInformation(this.getParamForGrid());
  }


  public getGridStyle() {
    if( this.datasetFile.sheetName && ''!==this.datasetFile.sheetName) {
      return null;
    }
    return {'top':'0px'};
  }

  // /**
  //  * Check if uploaded
  //  * @param response
  //  */
  // public checkIfUploaded(response: any) {
  //   let res = JSON.parse(response);
  //   this.fetchUploadStatus(res.storedUri);
  //   this.interval = setInterval(() => {
  //     this.fetchUploadStatus(res.storedUri);
  //   }, 1000)
  // }

  // /**
  //  * Polling
  //  * @param {string} fileKey
  //  */
  // public fetchUploadStatus(storedUri: string) {
  //   this.datasetService.checkFileUploadStatus(storedUri).then((result) => {
  //
  //     if (result.state === 'done'  && result.success) {
  //       clearInterval(this.interval);
  //       this.interval = undefined;
  //       this.isChanged = true;
  //       this.uploadResult.response = result;
  //       this.getDataFile();
  //
  //     }  else if (result.success === false) {
  //       this.loadingHide();
  //       Alert.error(this.translateService.instant('Failed to upload. Please select another file'));
  //       clearInterval(this.interval);
  //       this.interval = undefined;
  //       return;
  //     }
  //   });
  // }

  public setUploadLcationList(){
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

  // /**
  //  * Find number of rows
  //  * @param data
  //  * @returns {any[]}
  //  */
  // private getRows(data: any) {
  //   let rows: any[] = data;
  //   if (data.length > 0 && !data[0].hasOwnProperty('id')) {
  //     rows = rows.map((row: any, idx: number) => {
  //       row.id = idx;
  //       return row;
  //     });
  //   }
  //   return rows;
  // }

  /**
   * grid 정보 업데이트
   * @param data
   * @param {any} data
   */
  private updateGrid(data : any) {

    if ( !isUndefined(data)) {
      this.clearGrid = false;

      let fields : Field[] =  data.colDescs.map(( item: object , idx:number)=>{
        item["name"] = data.colNames[idx];
        return item;
      });
      // headers
      const headers: header[] = this.getHeaders(fields);

      // rows
      let rows = data.rows.map((item: Row, idx:number)=>{
        let temp  = new Object();
        item.objCols.forEach((val, idx:number)=>{
          temp[data.colNames[idx]] =  val;
        });
        temp["id"]=idx;
        return temp;
      });

      //const rows: any[] = this.getRows(data);

      // grid
      this.drawGrid(headers, rows);
    } else {
      this.clearGrid = true;
    }
  }

  /**
   * Draw grid
   * @param {any[]} headers
   * @param {any[]} rows
   */
  private drawGrid(headers: any[], rows: any[]) {
    this.changeDetect.detectChanges();
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
   */
  private getGridInformation(param) {

    this.datasetService.getFileGridInfo(param).then((result) => {
      if (result.sheetNames && result.sheetNames.length > 0) {
        this.datasetFile.sheets = result.sheetNames;
        this.datasetFile.sheetName = result.sheetNames[0];
        this.convertSheet();
      } else {
        this.datasetFile.sheets = [];
        this.datasetFile.sheetName = '';
      }

      if (result.gridResponses && result.gridResponses.length > 0) {
        this.clearGrid = false;
        this.gridInfo = result.gridResponses;
        this.updateGrid(this.gridInfo[this.defaultSheetIndex]);
      } else {
        this.gridInfo = [];
        this.clearGrid = true;
      }
      this.loadingHide();
    }).catch((error) => {
      this.clearGrid = true;
      this.loadingHide();
    });
  }

  private getParamForGrid() {
    return {
    /*
      fileKey : this.datasetFile.filekey,
      sheetname : this.datasetFile.sheetname,
      delimiter : this.columnDelimiter,
      fileType : new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).exec( this.datasetFile.filename )[1]
      */
      storedUri : this.datasetFile.storedUri,
      sheetName : this.datasetFile.sheetName,
      delimiter : this.columnDelimiter,
      fileType : new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).exec( this.datasetFile.storedUri )[1]
    };
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
class Row{
  objCols: string[];
}
