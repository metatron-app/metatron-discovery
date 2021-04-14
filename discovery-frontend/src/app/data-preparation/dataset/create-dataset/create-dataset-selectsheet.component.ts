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

import * as pixelWidth from 'string-pixel-width';
import {isNull, isNullOrUndefined} from 'util';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {CommonUtil} from '@common/util/common.util';
import {PopupService} from '@common/service/popup.service';
import {GridOption} from '@common/component/grid/grid.option';
import {GridComponent} from '@common/component/grid/grid.component';
import {Header, SlickGridHeader} from '@common/component/grid/grid.header';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {FileFormat, PrDatasetFile, SheetInfo} from '@domain/data-preparation/pr-dataset';

import {PreparationCommonUtil} from '../../util/preparation-common.util';
import {DatasetService} from '../service/dataset.service';

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
  public isEXCEL: boolean = false;
  public isJSON: boolean = false;

  public settingFoldFlag: boolean = false;

  // grid hide
  public clearGrid: boolean = false;

  public isNext: boolean = false;

  public isDelimiterRequired: boolean = false;
  public isColumnCountRequired: boolean = false;

  public currDelimiter: string = '';
  public currQuote: string = '';
  public currSheetIndex: number = 0;
  public currDSIndex: number = 0;
  public currDetail: { fileFormat: FileFormat, detailName: string, columns: number };
  public currColumnCount: number;
  public prevColumnCount: number;

  public previewErrorMsg: string = '';

  public fileFormat = FileFormat;

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

    this.currDetail = {fileFormat: null, detailName: null, columns: null};

    // Check init by selected count
    this._checkNextBtn();
    this._isInit = !this.isNext;

    // isCSV, isJSON, isJSON 여부 체크
    this._setFileFormat(this.datasetFiles[this.currDSIndex].fileFormat);

    // 처음인지 ?
    if (this._isInit) {
      this.datasetFiles.forEach((dsFile, index) => {
        this.datasetFiles[index].sheetIndex = null;
        this.datasetFiles[index].sheetName = '';
        this.datasetFiles[index].selectedSheets = [];
        this.datasetFiles[index].selected = false;

        if (index === 0) {
          this.currDelimiter = (this.isCSV ? ',' : '');
          this.currQuote = (this.isCSV ? '\"' : '');
        }

        // FIXME : UI에서 각자 따로 오는 response를 어떻게 처리할지
        this._getGridInformation(index, this._getParamForGrid(dsFile), index === 0 ? 'draw' : '');
      });

    } else { // 뒤로가기해서 다시 돌아왔을떄

      // 뒤로가기해서 다시 돌아왔을떄 현재 인덱스 정보로 그리드 그림
      if (this.datasetFiles[this.currDSIndex].sheetInfo) {
        this._updateGrid(this.datasetFiles[this.currDSIndex].sheetInfo[this.currSheetIndex].data, this.datasetFiles[this.currDSIndex].sheetInfo[this.currSheetIndex].fields);
      } else {
        this.clearGrid = true;
      }


      // JSON이 아닌경우 delimiter 설정
      this.currDelimiter = !this.isJSON ? this.datasetFiles[this.currDSIndex].delimiter : '';
      this.currQuote = this.isCSV ? this.datasetFiles[this.currDSIndex].quoteChar : '\"';

      // 컬럼 카운트 설정
      this.currColumnCount = (this.datasetFiles[this.currDSIndex].sheetInfo ? this.datasetFiles[this.currDSIndex].sheetInfo[this.currSheetIndex].columnCount : 0);
      this.prevColumnCount = this.currColumnCount;

      // Error message 있으면 보여준다.
      this.previewErrorMsg = (this.datasetFiles[this.currDSIndex].error ? this.translateService.instant(this.datasetFiles[this.currDSIndex].error.message) : '');

      // 상세 정보 설정
      this._setDetailInformation(this.currDSIndex, this.currSheetIndex);

      // 다음 버튼 활성화 여부 확인
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
      name: 'select-file',
      data: null
    });
  }


  /**
   * Move to next step
   */
  public next() {

    if (!this.isNext) return;

    this.datasetFiles.forEach((dsFile, _idx) => {
      if (dsFile.sheetInfo && dsFile.fileFormat === FileFormat.EXCEL) {
        dsFile.selectedSheets = [];
        dsFile.sheetInfo.forEach((sheet) => {
          if (sheet.selected) dsFile.selectedSheets.push(sheet.sheetName);
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
   * Advanced setting toggle
   * @returns {boolean}
   */
  public settingFold() {
    this.settingFoldFlag = !this.settingFoldFlag;
    return this.settingFoldFlag;
  }


  /**
   * When delimiter is changed(only CSV)
   */
  public changeDelimiter() {

    this.isDelimiterRequired = ('' === this.currDelimiter && this.isCSV);

    // No change in grid when delimiter is empty
    if ('' === this.currDelimiter.trim() || isNullOrUndefined(this.currDelimiter) || this.isJSON || this.isEXCEL) {
      return;
    }

    if (this.datasetFiles[this.currDSIndex].delimiter !== this.currDelimiter) {
      this.datasetFiles[this.currDSIndex].delimiter = this.currDelimiter;
      this.loadingShow();
      this._getGridInformation(this.currDSIndex, this._getParamForGrid(this.datasetFiles[this.currDSIndex]), 'draw');
    }
  }


  /**
   * When quoteChar is changed(only CSV)
   */
  public changeQuote() {

    if (isNullOrUndefined(this.currQuote) || this.isJSON || this.isEXCEL) {
      return;
    }

    if (this.datasetFiles[this.currDSIndex].quoteChar !== this.currQuote) {
      this.datasetFiles[this.currDSIndex].quoteChar = this.currQuote;
      this.loadingShow();
      this._getGridInformation(this.currDSIndex, this._getParamForGrid(this.datasetFiles[this.currDSIndex]), 'draw');
    }
  }


  /**
   * When columnCount is changed(CSV, EXCEL)
   */
  public changeColumnCount() {

    this.isColumnCountRequired = ((isNullOrUndefined(this.currColumnCount) || 1 > this.currColumnCount) && this.datasetFiles[this.currDSIndex].fileFormat !== FileFormat.JSON);

    if (isNullOrUndefined(this.currColumnCount) || 1 > this.currColumnCount || this.datasetFiles[this.currDSIndex].fileFormat === FileFormat.JSON) {
      return;
    }

    if (this.currColumnCount > 9999) {
      Alert.error(`max count must be less than 10000`);
      this.currColumnCount = this.prevColumnCount;
      return;
    }

    if (this.datasetFiles[this.currDSIndex].sheetInfo && this.datasetFiles[this.currDSIndex].sheetInfo[this.currSheetIndex].columnCount !== this.currColumnCount) {
      this.datasetFiles[this.currDSIndex].sheetInfo[this.currSheetIndex].columnCount = this.currColumnCount;
      this.loadingShow();
      this._getGridInformation(this.currDSIndex, this._getParamForGrid(this.datasetFiles[this.currDSIndex], this.currColumnCount), 'draw');
    }
  }


  /**
   * Returns grid style
   * @returns {{top: string}}
   */
  public getGridStyle() {
    return {top: '45px'};
  }


  /**
   * When Datafile Checked
   * @param event
   * @param DsIdx
   */
  public checkGroup(event: Event, DsIdx: number) {
    // stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    if (!this.datasetFiles[DsIdx].sheetInfo) return;

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
   * @param DsIdx
   * @param sheetIdx
   */
  public checkSheet(event: Event, DsIdx: number, sheetIdx: number) {
    // stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    if (!this.datasetFiles[DsIdx].sheetInfo) return;

    this.datasetFiles[DsIdx].sheetInfo[sheetIdx].selected = !this.datasetFiles[DsIdx].sheetInfo[sheetIdx].selected;
    if (!this.datasetFiles[DsIdx].sheetInfo[sheetIdx].selected) this.datasetFiles[DsIdx].selected = false;

    let selectedCount: number = 0;
    this.datasetFiles[DsIdx].sheetInfo.forEach((sheet) => {
      if (sheet.selected) selectedCount++;
    });
    if (selectedCount === this.datasetFiles[DsIdx].sheetInfo.length) this.datasetFiles[DsIdx].selected = true;

    this._checkNextBtn();
    this.safelyDetectChanges();
  }


  /**
   * Select datasetFile and show grid
   * @param {Event} event
   * @param {number} dsIdx
   */
  public selectFile(event: Event, dsIdx: number) {
    // stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    this.previewErrorMsg = (this.datasetFiles[dsIdx].error ? this.translateService.instant(this.datasetFiles[dsIdx].error.message) : '');

    this.isDelimiterRequired = false;
    this.isColumnCountRequired = false;

    if (this.datasetFiles[dsIdx].fileFormat !== FileFormat.EXCEL) {
      this._setFileFormat(this.datasetFiles[dsIdx].fileFormat);

      this.currDSIndex = dsIdx;
      this.currSheetIndex = 0;

      this._setDetailInformation(dsIdx, 0);

      this.currDelimiter = this.datasetFiles[dsIdx].delimiter;
      this.currQuote = this.datasetFiles[dsIdx].quoteChar;

      this.currColumnCount = (this.datasetFiles[dsIdx].sheetInfo ? this.datasetFiles[dsIdx].sheetInfo[0].columnCount : 0);

      if (!this.datasetFiles[dsIdx].sheetInfo) {
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
  public selectSheet(event: Event, dsIdx: number, sheetName: string, sheetIdx: number) {
    // stop event bubbling
    event.stopPropagation();
    event.preventDefault();

    this.previewErrorMsg = '';
    this.isDelimiterRequired = false;
    this.currDelimiter = '';
    this.currQuote = '\"';

    this.isColumnCountRequired = false;
    this.currColumnCount = (this.datasetFiles[dsIdx].sheetInfo ? this.datasetFiles[dsIdx].sheetInfo[sheetIdx].columnCount : 0);

    this.currDSIndex = dsIdx;
    this._setFileFormat(this.datasetFiles[dsIdx].fileFormat);
    this.currSheetIndex = sheetIdx;

    if (!this.datasetFiles[dsIdx].sheetInfo) {
      this.clearGrid = true;
      return;
    }

    this._setDetailInformation(dsIdx, sheetIdx);

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


  /**
   * keyDownEvent event on input
   * @param event
   * @param {string} type
   */
  public keyDownEvent(event: any, type: string) {
    // 13 is enter key
    if (event.keyCode === 13) {

      // Stop event bubbling
      event.stopPropagation();
      event.preventDefault();

      // Column count input
      if ('colCnt' === type) {
        this.changeColumnCount();
      }

      // File delimiter
      if ('delimiter' === type) {
        this.changeDelimiter();
      }

      // Quote character
      if ('quoteChar' === type) {
        this.changeQuote();
      }

    } else {


      // 단어가 지워지거나 추가된다면
      if (this._isKeyPressedWithChar(event.keyCode)) {

        // Column count input
        if ('colCnt' === type) {
          const value = event.target.value;
          const maxLength = 4;
          if (value && value.length <= maxLength) {
            this.prevColumnCount = value;
          }
          this.isColumnCountRequired = true;
        }

        // Column count input
        if ('delimiter' === type) {
          this.isDelimiterRequired = true;
        }

        this.isNext = false;

      }

    }
  }

  /**
   * Go to next stage with enter key
   * @param event Event
   */
  @HostListener('document:keydown.enter', ['$event'])
  public onEnterKeydownHandler(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.next();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Returns true if something is typed on the keyboard
   * Returns false if shift, tab etc is pressed
   * 즉 직접 단어 자체가 지워지거나 입력된다면 true 를 반환한다.
   * @param keyCode
   */
  private _isKeyPressedWithChar(keyCode: number): boolean {
    const exceptionList: number[] = [9, 13, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 91, 92, 219, 220, 93, 144, 145];
    return exceptionList.indexOf(keyCode) === -1
  }


  /**
   * TXT, CSV --> isCSV, JSON --> isJSON, EXCEL --> isEXCEL
   * @param {FileFormat} fileFormat
   * @private
   */
  private _setFileFormat(fileFormat: FileFormat) {
    this.isCSV = (fileFormat === FileFormat.CSV) || fileFormat === FileFormat.TXT;
    this.isJSON = (fileFormat === FileFormat.JSON);
    this.isEXCEL = (fileFormat === FileFormat.EXCEL);
  }


  /**
   * Returns parameter required for grid fetching API
   * @returns result {fileKey: string, delimiter: string}
   * @private
   */
  private _getParamForGrid(datasetFile: PrDatasetFile, manualColumnCount?: number) {
    const result = {
      storedUri: datasetFile.storedUri,
    };
    if (datasetFile.fileFormat === FileFormat.CSV || datasetFile.fileFormat === FileFormat.TXT) result['delimiter'] = datasetFile.delimiter;
    if (datasetFile.fileFormat === FileFormat.CSV || datasetFile.fileFormat === FileFormat.TXT) result['quoteChar'] = datasetFile.quoteChar;
    if (manualColumnCount && manualColumnCount > 0) result['manualColumnCount'] = manualColumnCount;

    return result;
  }

  /**
   * Fetch grid information from server
   * @param {number} idx
   * @param param
   * @param {string} option
   * @private
   */
  private _getGridInformation(idx: number, param: any, option: string) {
    this.loadingShow();

    this.datasetService.getFileGridInfo(param).then((result) => {

      if (result.gridResponses) {

        if (option && option === 'draw') this.clearGrid = false;

        this.datasetFiles[idx].error = null;
        this.previewErrorMsg = '';

        this._setSheetInformation(idx, result.gridResponses, result.sheetNames);

        // 첫번째 시트로 그리드를 그린다.
        const sheet = this.datasetFiles[idx].sheetInfo[this.currSheetIndex];

        // Update grid
        if (option && option === 'draw') this._updateGrid(sheet.data, sheet.fields);

        if (result.sheetNames) {

          // Select first sheet in the list
          this.datasetFiles[idx].sheetName = sheet.sheetName ? sheet.sheetName : undefined;
        }

      } else {

        // no result from server
        if (option && option === 'draw') this.clearGrid = true;

        this.datasetFiles[idx].error = result;
        this.previewErrorMsg = (this.datasetFiles[idx].error ? this.translateService.instant(this.datasetFiles[idx].error.message) : '');

      }

      // 다음 버튼 활성화 여부 확인
      this._checkNextBtn();

      this.loadingHide();

    }).catch((error) => {

      // Timeout
      if (error === 'Server error') {
        error['message'] = 'Server error';
      }
      this.datasetFiles[idx].error = error;
      this.selectFile(event, 0);
      if (option && option === 'draw') this.clearGrid = true;
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
      const headers: Header[] = this._getHeaders(fields);
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
        const headerWidth: number = Math.floor(pixelWidth(field.name, {size: 12})) + 70;

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
          .Formatter((_row, _cell, value, _columnDef) => {
            if (field.type === 'STRING') {
              value = (value) ? value.toString().replace(/</gi, '&lt;') : value;
              value = (value) ? value.toString().replace(/>/gi, '&gt;') : value;
              value = (value) ? value.toString().replace(/\n/gi, '&crarr;') : value;
              const tag = '<span style="color:#ff00ff; font-size: 9pt; letter-spacing: 0">&middot;</span>';
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
   * @param idx
   * @param gridInfo
   * @param sheetNames
   * @private
   */
  private _setSheetInformation(idx: number, gridInfo: any, sheetNames: string[]) {
    if (gridInfo && gridInfo.length > 0) {
      this.datasetFiles[idx].sheetInfo = [];
      gridInfo.forEach((item, index) => {
        const gridData = this._getGridDataFromGridResponse(item);

        const info: SheetInfo = {
          selected: true,
          data: gridData.data,
          fields: gridData.fields,
          totalRows: 0,
          valid: true,
          columnCount: gridData.fields.length
        };

        if (sheetNames) info.sheetName = sheetNames[index];

        this.datasetFiles[idx].sheetInfo.push(info);

        if (this.currDSIndex === 0) this._setDetailInformation(0, 0);

      });

      // set current column count
      if (idx === this.currDSIndex) this.currColumnCount = (this.datasetFiles[this.currDSIndex].sheetInfo ? this.datasetFiles[this.currDSIndex].sheetInfo[this.currSheetIndex].columnCount : null);

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
    const colCnt = gridResponse.colCnt;
    const colNames = gridResponse.colNames;
    const colTypes = gridResponse.colDescs;

    const gridData: GridData = new GridData();

    for (let idx = 0; idx < colCnt; idx++) {
      gridData.fields.push({
        name: colNames[idx],
        type: colTypes[idx].type,
        seq: idx,
        uuid: CommonUtil.getUUID()
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
  private _setDetailInformation(dsIdx: number, sheetIdx?: number) {

    if (this.datasetFiles[dsIdx].fileFormat === FileFormat.EXCEL) {
      this.currDetail.detailName = this.datasetFiles[dsIdx].fileName;
      if (this.datasetFiles[dsIdx].sheetInfo) this.currDetail.detailName += '-' + this.datasetFiles[dsIdx].sheetInfo[sheetIdx].sheetName;
    } else {
      this.currDetail.detailName = this.datasetFiles[dsIdx].fileName;
    }
    this.currDetail.fileFormat = this.datasetFiles[dsIdx].fileFormat;
    this.currDetail.columns = ((this.datasetFiles[dsIdx].sheetInfo) ? this.datasetFiles[dsIdx].sheetInfo[sheetIdx].fields.length : null);
  }


  /**
   * Check Next Button
   */
  private _checkNextBtn() {
    let selectedCount: number = 0;
    this.datasetFiles.forEach((dsFile) => {
      if (dsFile.sheetInfo) {
        dsFile.sheetInfo.forEach((sheet) => {
          if (sheet.selected) selectedCount++;
        })
      }
    });
    this.isNext = (selectedCount > 0);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

class Field {
  name: string;
  type: string;
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
