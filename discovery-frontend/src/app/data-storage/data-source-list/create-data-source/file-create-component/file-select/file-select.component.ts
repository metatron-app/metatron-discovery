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
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import { DatasourceInfo, Field } from '../../../../../domain/datasource/datasource';
import { FileLikeObject, FileUploader} from 'ng2-file-upload';
import { Alert } from '../../../../../common/util/alert.util';
import { CookieConstant } from '../../../../../common/constant/cookie.constant';
import { CommonConstant } from '../../../../../common/constant/common.constant';
import { DatasourceService } from '../../../../../datasource/service/datasource.service';
import { header, SlickGridHeader } from '../../../../../common/component/grid/grid.header';
import { GridOption } from '../../../../../common/component/grid/grid.option';
import { GridComponent } from '../../../../../common/component/grid/grid.component';
import * as pixelWidth from 'string-pixel-width';
import * as _ from 'lodash';
import {
  DataSourceCreateService,
  FileDetail,
  FileResult, Sheet,
  UploadResult
} from "../../../../service/data-source-create.service";

@Component({
  selector: 'file-select',
  templateUrl: './file-select.component.html',
})
export class FileSelectComponent extends AbstractPopupComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성될 데이터소스 정보
  private sourceData: DatasourceInfo;

  @ViewChild(GridComponent)
  private gridComponent: GridComponent;

  // file uploaded results
  private _uploadResult: UploadResult;

  // file results
  public fileResult: FileResult;

  // selected file detail data
  public selectedFileDetailData: FileDetail;

  @Input('sourceData')
  public set setSourceData(sourceData: DatasourceInfo) {
    this.sourceData = sourceData;
  }

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();

  // 파일 업로드
  public uploader: FileUploader;

  // 그리드 row
  public rowNum: number = 100;

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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              private _dataSourceCreateService: DataSourceCreateService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

    this.uploader = new FileUploader(
      {
        url: CommonConstant.API_CONSTANT.API_URL + 'datasources/file/upload',
      }
    );
    // post
    this.uploader.onBeforeUploadItem = (item) => {
      item.method = 'POST';
    };
    // set uploader option
    this.uploader.setOptions({
      url: CommonConstant.API_CONSTANT.API_URL + 'datasources/file/upload',
      headers: [
        { name: 'Accept', value: 'application/json, text/plain, */*' },
        { name: 'Authorization', value: `${this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)} ${this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)}` }
      ],
    });
    // 지원하지 않는 파일 형식일 경우
    this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) => {
      Alert.error(this.translateService.instant('msg.storage.alert.file.import.error'));
    };

    // 업로드 성공
    this.uploader.onSuccessItem = (item, response, status, headers) => {
      const success = true;
      this._uploadResult = { success, item, response, status, headers };
      // loading hide
      this.loadingHide();
    };
    // 업로드 완료후 작동
    this.uploader.onCompleteAll = () => {
      if (this._uploadResult && this._uploadResult.success) {
        // 업로드한 파일 정보 세팅
        this._setFileResult(this._uploadResult);
        // set file detail data
        this._setFileDetail();
      }
    };

    // 에러 처리
    this.uploader.onErrorItem = (item, response, status, headers) => {
      // response 데이터
      const result: any = JSON.parse(response);
      // 데이터 초기화
      this.fileResult = undefined;
      // init upload result
      this._uploadResult = undefined;
      // 파일 업로드 에러 처리
      Alert.error(result.details);
      // loading hide
      this.loadingHide();
    };

    this.uploader.onAfterAddingFile = (item) => {
      this.loadingShow();
      this.uploader.uploadAll();
    };

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // 현재 페이지 데이터소스 파일보가 있다면
    if (this.sourceData.hasOwnProperty('fileData')) {
      // init data
      this._initData(_.cloneDeep(this.sourceData.fileData));
    }
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
   * 다음화면으로 이동
   */
  public next() {
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method - getter
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * logical Types
   * @returns {{}}
   */
  public getLogicalTypes() {
    const result = {};
    this.selectedFileDetailData.fields.forEach((field) => {
      // result 에 해당 타입이 있다면
      if (result.hasOwnProperty(field.logicalType)) {
        result[field.logicalType] += 1;
      } else {
        // 없다면 새로 생성
        result[field.logicalType] = 1;
      }
    });

    const keys = Object.keys(result);

    const logicalTypes = [];

    keys.forEach((key) => {
      logicalTypes.push({label: key, value: result[key]});
    });

    return logicalTypes;
  }


  /**
   * Is CSV type file
   * @returns {boolean}
   */
  public isCsvFile(): boolean {
    return !this.fileResult.sheets;
  }

  /**
   * Is enable next
   * @return {boolean}
   */
  public isEnableNext(): boolean {
    // exist selectedFileDetailData
    // exist fields in selectedFileDetailData
    // enable grid
    return !this.clearGrid && this.selectedFileDetailData && this.selectedFileDetailData.fields && this.selectedFileDetailData.isParsable.valid;
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
      this._setFileDetail();
    }
  }

  /**
   * Change first header row
   */
  public onChangeIsFirstHeaderRowFlag(): void {
    // change first header row flag
    this.isFirstHeaderRow = !this.isFirstHeaderRow;
    // set file detail
    this._setFileDetail();
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
    this._setFileDetail();
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
    this._setFileDetail();
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
      if (this.sourceData.fileData.fileResult.fileKey !== this.fileResult.fileKey) {
        return true;
      }
      // 파일 시트가 변경된 경우
      if (!this.isCsvFile() && (this.sourceData.fileData.fileResult.selectedSheet !== this.fileResult.selectedSheet)) {
        return true;
      }
      // 파일 헤더 생성여부가 변경된경우
      if (this.sourceData.fileData.isFirstHeaderRow !== this.isFirstHeaderRow){
        return true;
      }
    }
    return false;
  }

  /**
   * Set file detail data
   * @private
   */
  private _setFileDetail(): void {
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
          // grid 출력
          this._updateGrid(this.selectedFileDetailData.data, this.selectedFileDetailData.fields);
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
   * Set file result
   * @param {UploadResult} uploadResult
   * @private
   */
  private _setFileResult(uploadResult: UploadResult) {
    // response 데이터
    const response: any = JSON.parse(uploadResult.response);
    this.fileResult = {
      fileKey: response.filekey,
      filePath: response.filePath,
      fileSize: uploadResult.item.file.size,
      fileName:  uploadResult.item.file.name
    };
    // sheet 가 존재한다면
    if (response.sheets && response.sheets.length !== 0) {
      // sheet
      this.fileResult.sheets = this._dataSourceCreateService.getConvertSheets(response.sheets);
      // initial selected sheet
      this.fileResult.selectedSheet = this.fileResult.sheets[0];
    }
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
    // grid 출력
    this._updateGrid(this.selectedFileDetailData.data, this.selectedFileDetailData.fields);
  }
}
