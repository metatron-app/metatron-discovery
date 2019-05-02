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
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {AbstractPopupComponent} from '../../../../../common/component/abstract-popup.component';
import {DatasourceInfo, Field} from '../../../../../domain/datasource/datasource';
import {Alert} from '../../../../../common/util/alert.util';
import {DatasourceService} from '../../../../../datasource/service/datasource.service';
import {header, SlickGridHeader} from '../../../../../common/component/grid/grid.header';
import {GridOption} from '../../../../../common/component/grid/grid.option';
import {GridComponent} from '../../../../../common/component/grid/grid.component';
import {isNullOrUndefined} from 'util';
import * as pixelWidth from 'string-pixel-width';
import * as _ from 'lodash';
import {
  DataSourceCreateService,
  FileDetail,
  FileResult,
  Sheet
} from "../../../../service/data-source-create.service";

@Component({
  selector: 'file-preview',
  templateUrl: './file-preview.component.html',
})
export class FilePreviewComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성될 데이터소스 정보
  @Input('sourceData')
  private readonly sourceData: DatasourceInfo;

  @ViewChild(GridComponent)
  private readonly gridComponent: GridComponent;

  // file results
  public fileResult: FileResult;

  // selected file detail data
  public selectedFileDetailData: FileDetail;

  @Input()
  public step: string;

  @Output()
  public readonly stepChange: EventEmitter<string> = new EventEmitter();

  // 그리드 row
  public rowNum: number;

  // csv 파일 구분자
  public delimiter: string = ',';
  // csv 파일 줄바꿈자
  public separator: string = '\\n';
  // Use the first row as the head column
  public isFirstHeaderRow: boolean = true;

  // flag
  public typeShowFl: boolean = false;

  // grid hide
  public clearGrid = true;

  public typeList = [];

  // flag
  public isValidFile: boolean;
  public isValidDelimiter: boolean;
  public isValidSeparator: boolean;

  // 생성자
  constructor(private datasourceService: DatasourceService,
              private _dataSourceCreateService: DataSourceCreateService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // set file result
    this.fileResult = this.sourceData.uploadData.fileResult;
    // 현재 페이지 데이터소스 파일보가 있다면
    if (this.sourceData.hasOwnProperty('fileData')) {
      // init data
      this._initData(_.cloneDeep(this.sourceData.fileData));
    } else {
      this._setFileDetail(true);
    }
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  public prev() {
    // 기존 파일 데이터 삭제후 생성
    this._deleteAndSaveFileData();
    this.step = 'file-upload';
    this.stepChange.emit(this.step);
  }

  /**
   * 다음화면으로 이동
   */
  public next() {
    if (this.fileResult) {
      if (this.isCsvFile()) {
        isNullOrUndefined(this.isValidDelimiter) && (this.isValidDelimiter = false);
        isNullOrUndefined(this.isValidSeparator) && (this.isValidSeparator = false);
      }
      // validation
      if (this.isEnableNext()) {
        // 데이터 변경이 일어난경우 스키마 데이터와 적재데이터 제거
        this._deleteSchemaData();
        // 기존 파일 데이터 삭제후 생성
        this._deleteAndSaveFileData();
        // 다음페이지로 이동
        this.step = 'file-configure-schema';
        this.stepChange.emit(this.step);
      }
    }
  }

  /**
   * logical Types
   * @returns {{}}
   */
  public setTypeList(): void {
    const result = this.selectedFileDetailData.fields.reduce((acc, field) => {
      // result 에 해당 타입이 있다면
      if (acc.hasOwnProperty(field.logicalType)) {
        acc[field.logicalType] += 1;
      } else {
        // 없다면 새로 생성
        acc[field.logicalType] = 1;
      }
      return acc;
    }, {});
    this.typeList = Object.keys(result).reduce((acc, key) => {
      acc.push({label: key, value: result[key]});
      return acc;
    }, []);
  }


  /**
   * Is CSV type file
   * @returns {boolean}
   */
  public isCsvFile(): boolean {
    return !this.fileResult.sheets;
  }

  /**
   * Is excel file
   * @return {boolean}
   */
  public isExcelFile(): boolean {
    return _.isNil(this.fileResult.sheets);
  }

  /**
   * Is enable next
   * @return {boolean}
   */
  public isEnableNext(): boolean {
    return this.isValidFile;
  }

  /**
   * Change selected sheet
   * @param {Sheet} sheet
   */
  public onChangeSelectedSheet(sheet: Sheet): void {
    if (this.fileResult.selectedSheet !== sheet) {
      // change selected sheet
      this.fileResult.selectedSheet = sheet;
      // set file detail
      this._setFileDetail(true);
    }
  }

  /**
   * Change first header row
   */
  public onChangeIsFirstHeaderRowFlag(): void {
    // change first header row flag
    this.isFirstHeaderRow = !this.isFirstHeaderRow;
    // set file detail
    this._setFileDetail(true);
  }

  /**
   * row 변경 이벤트
   */
  public onChangeRowNum() {
    // row num이 총 row 보다 클경우 변경
    if (this.rowNum > this.selectedFileDetailData.totalRows) {
      this.rowNum = this.selectedFileDetailData.totalRows;
    }
    // file data 조회
    this._setFileDetail();
  }

  /**
   * 구분자 변경 이벤트
   * @param {KeyboardEvent} event
   */
  public onChangeDelimiter(event?: KeyboardEvent) {
    // 엔터 일때만 입력
    if (event && 13 !== event.keyCode) {
      return;
    }
    // file data 조회
    this._setFileDetail(true);
  }

  /**
   * 줄바꿈 문자 변경
   * @param {KeyboardEvent} event
   */
  public onChangeSeparator(event?: KeyboardEvent) {
    // 엔터 일때만 입력
    if (event && 13 !== event.keyCode) {
      return;
    }
    // file data 조회
    this._setFileDetail(true);
  }


  /**
   * 데이터가 변경이 일어나고 스키마데이터가 있다면 스키마데이터 삭제
   * @private
   */
  private _deleteSchemaData(): void {
    // 데이터 변경이 일어난경우 스키마 삭제
    if (this._isChangeData()) {
      this.sourceData.hasOwnProperty('schemaData') && (delete this.sourceData.schemaData);
      this.sourceData.hasOwnProperty('ingestionData') && (delete this.sourceData.ingestionData);
    }
  }

  /**
   * 기존 파일 삭제후 새로 생성
   * @private
   */
  private _deleteAndSaveFileData(): void {
    // 파일 정보가 있다면 삭제
    if (this.sourceData.hasOwnProperty('fileData')) {
      delete this.sourceData.fileData;
    }
    // 현재 페이지의 데이터소스 생성정보 저장
    this._saveFileData(this.sourceData);
    // set field list, field data
    this.sourceData.fieldList = this.selectedFileDetailData.fields;
    this.sourceData.fieldData = this.selectedFileDetailData.data;
  }

  /**
   * 현재 페이지의 데이터소스 파일정보 저장
   * @param {DatasourceInfo} sourceData
   * @private
   */
  private _saveFileData(sourceData: DatasourceInfo) {
    const fileData = {
      // file result
      fileResult: this.fileResult,
      // file data
      selectedFileDetailData: this.selectedFileDetailData,
      // 그리드 row
      rowNum: this.rowNum,
      // csv 파일 구분자
      delimiter: this.delimiter,
      // csv 파일 줄바꿈자
      separator: this.separator,
      // 임의의 헤드컬럼 생성여부
      isFirstHeaderRow: this.isFirstHeaderRow,
      // type list
      typeList: this.typeList,
      // flag
      isValidFile: this.isValidFile,
      isValidDelimiter: this.isValidDelimiter,
      isValidSeparator: this.isValidSeparator,
    };
    sourceData['fileData'] = fileData;
  }

  /**
   * 그리드 출력
   * @param {any[]} headers
   * @param {any[]} rows
   * @private
   */
  private _drawGrid(headers: any[], rows: any[]) {
    // grid show
    this.clearGrid = false;
    this.changeDetect.detectChanges();
    // 그리드 옵션은 선택
    this.gridComponent.create(headers, rows, new GridOption()
      .SyncColumnCellResize(true)
      .MultiColumnSort(true)
      .RowHeight(32)
      .build()
    );
  }

  /**
   * grid 정보 업데이트
   * @param data
   * @param {Field[]} fields
   * @private
   */
  private _updateGrid(data: any, fields: Field[]) {
    // headers
    const headers: header[] = this._getHeaders(fields);
    // rows
    const rows: any[] = this._getRows(data);
    // grid 그리기
    headers && headers.length > 0 && this._drawGrid(headers, rows);
  }

  /**
   * 헤더정보 얻기
   * @param {Field[]} fields
   * @returns {header[]}
   * @private
   */
  private _getHeaders(fields: Field[]): header[] {
    return fields.map(
      (field: Field) => {
        /* 70 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth:number = Math.floor(pixelWidth(field.name, { size: 12 })) + 70;
        return new SlickGridHeader()
          .Id(field.name)
          .Name('<span style="padding-left:20px;"><em class="' + this.getFieldTypeIconClass(field.logicalType.toString()) + '"></em>' + Field.getSlicedColumnName(field) + '</span>')
          .Field(field.name)
          .Behavior('select')
          .Selectable(false)
          .CssClass('cell-selection')
          .Width(headerWidth)
          .CannotTriggerInsert(true)
          .Resizable(true)
          .Unselectable(true)
          .Sortable(true)
          .Formatter((row, cell, value) => {
            let content = value;
            // trans to string
            if (typeof value === "number") {
              content = value + '';
            }
            if (content && content.length > 50) {
              return content.slice(0,50);
            } else {
              return content;
            }
          })
          .build();
      }
    );
  }

  /**
   * rows 얻기
   * @param data
   * @returns {any[]}
   * @private
   */
  private _getRows(data: any): any[] {
    let rows: any[] = data;
    if (data.length > 0 && !data[0].hasOwnProperty('id')) {
      rows = rows.map((row: any, idx: number) => {
        row.id = idx;
        return row;
      });
    }
    return rows;
  }



  /**
   * 데이터가 변경이 일어났는지 확인
   * @return {boolean}
   * @private
   */
  private _isChangeData(): boolean {
    if (this.sourceData.fileData) {
      // 파일 key 가 변경된 경우
      // 파일 헤더 생성여부가 변경된경우
      // 파일 시트가 변경된 경우 (excel)
      // 파일의 구분자가 변경된 경우 (csv)
      if ((this.sourceData.fileData.fileResult.fileKey !== this.fileResult.fileKey)
        || this.sourceData.fileData.isFirstHeaderRow !== this.isFirstHeaderRow
        || (this.isExcelFile() && (this.sourceData.fileData.fileResult.selectedSheet.sheetName !== this.fileResult.selectedSheet.sheetName))
        || (!this.isExcelFile() && (this.sourceData.fileData.separator !== this.separator || this.sourceData.fileData.delimiter !== this.delimiter))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Set file detail data
   * @param {boolean} initRowNum
   * @private
   */
  private _setFileDetail(initRowNum?: boolean): void {
    // init selected file detail data
    this.selectedFileDetailData = undefined;
    // grid hide
    this.clearGrid = true;
    // if excel invalid file
    if (!this.isCsvFile() && !this.fileResult.selectedSheet.valid) {
      return;
    }
    // 로딩 show
    this.loadingShow();
    // if init row num
    initRowNum && (this.rowNum = 100);
    // 파일 조회
    this.datasourceService.getDatasourceFile(this.fileResult.fileKey, this._getFileParams())
      .then((result: FileDetail) => {
        // 로딩 hide
        this.loadingHide();
        // if SUCCESS FAIL
        if (result.success === false) {
          Alert.warning(this.translateService.instant('msg.storage.alert.file.import.error'));
          return;
        }
        // set file detail data
        this.selectedFileDetailData = result;
        // if total row is smaller than rowNum
        if (result.totalRows < this.rowNum) {
          // set row num
          this.rowNum = result.totalRows;
        }
        // if result is parsable
        if (result.isParsable && result.isParsable.valid) {
          // valid true
          this.isValidFile = true;
          // set type list
          this.setTypeList();
          // grid 출력
          this._updateGrid(this.selectedFileDetailData.data, this.selectedFileDetailData.fields);
          // if CSV file
          if (this.isCsvFile()) {
            this.isValidDelimiter = true;
            this.isValidSeparator = true;
          }
        } else if (result.isParsable) { // if result is not parsable
          // set error message
          this.selectedFileDetailData.errorMessage = this._dataSourceCreateService.getFileErrorMessage(result.isParsable.warning);
        }
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get file params
   * @return {any}
   * @private
   */
  private _getFileParams(): any {
    const params = {
      limit: this.rowNum,
      firstHeaderRow: this.isFirstHeaderRow,
    };
    // if excel file
    if (!this.isCsvFile()) {
      params['sheet'] = this.fileResult.selectedSheet.sheetName;
    } else {
      params['lineSep'] = this.separator;
      params['delimiter'] = this.delimiter;
    }
    return params;
  }




  /**
   * init source file data
   * @param fileData
   * @private
   */
  private _initData(fileData) {
    // file result
    this.fileResult = fileData.fileResult;
    // file data
    this.selectedFileDetailData = fileData.selectedFileDetailData;
    // 그리드 row
    this.rowNum = fileData.rowNum;
    // csv 파일 구분자
    this.delimiter = fileData.delimiter;
    // csv 파일 줄바꿈자
    this.separator = fileData.separator;
    // 임의의 헤드컬럼 생성여부
    this.isFirstHeaderRow = fileData.isFirstHeaderRow;
    // type list
    this.typeList = fileData.typeList;
    // flag
    this.isValidFile = fileData.isValidFile;
    this.isValidDelimiter = fileData.isValidDelimiter;
    this.isValidSeparator = fileData.isValidSeparator;
    // grid 출력
    this._updateGrid(this.selectedFileDetailData.data, this.selectedFileDetailData.fields);
  }

}
