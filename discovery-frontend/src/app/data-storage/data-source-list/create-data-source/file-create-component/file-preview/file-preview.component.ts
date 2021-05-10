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

import * as _ from 'lodash';
import * as pixelWidth from 'string-pixel-width';
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
import {Alert} from '@common/util/alert.util';
import {StringUtil} from '@common/util/string.util';
import {Modal} from '@common/domain/modal';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {ConfirmModalComponent} from '@common/component/modal/confirm/confirm.component';
import {GridOption} from '@common/component/grid/grid.option';
import {GridComponent} from '@common/component/grid/grid.component';
import {Header, SlickGridHeader} from '@common/component/grid/grid.header';
import {DatasourceInfo, Field, FieldRole} from '@domain/datasource/datasource';
import {DatasourceService} from '../../../../../datasource/service/datasource.service';
import {Granularity, GranularityObject, GranularityService} from '../../../../service/granularity.service';
import {DataSourceCreateService, FileDetail, FileResult, Sheet} from '../../../../service/data-source-create.service';

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

  @ViewChild(ConfirmModalComponent)
  private confirmModal: ConfirmModalComponent;

  // file results
  public fileResult: FileResult;

  // selected file detail data
  public selectedFileDetailData: FileDetail;

  @Input()
  public step: string;

  @Output()
  public readonly stepChange: EventEmitter<string> = new EventEmitter();

  @Output()
  public readonly onComplete: EventEmitter<any> = new EventEmitter();

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
  public globalErrorMessage: string;

  public ingestionStatus: string;
  public ingestionPopup: boolean = false;
  public patches = [];
  public dataList = [];

  public advanceSetting: boolean = false;
  public selectedTimestampField: Field;
  // selected segment granularity
  public selectedSegmentGranularity: GranularityObject;
  // interval input text
  public startIntervalText: string;
  public endIntervalText: string;
  // interval valid message
  public intervalValidMessage: string;
  // interval valid
  public intervalValid: boolean;
  // granularity unit
  public granularityUnit: number;
  // timestamp field first/end data
  private _firstMomentData: any;
  private _endMomentData: any;

  // 생성자
  constructor(private datasourceService: DatasourceService,
              private _dataSourceCreateService: DataSourceCreateService,
              private _granularityService: GranularityService,
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
    if (this.sourceData.hasOwnProperty('fileData') && !this.isNullOrUndefined(this.sourceData.fileData.selectedFileDetailData)) {
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
    if (this.selectedFileDetailData === undefined) {
      return;
    }
    if (this.fileResult) {
      if (this.isCsvFile()) {
        this.isNullOrUndefined(this.isValidDelimiter) && (this.isValidDelimiter = false);
        this.isNullOrUndefined(this.isValidSeparator) && (this.isValidSeparator = false);
      }
      // validation
      if (this.isEnableNext()) {
        // 데이터 변경이 일어난경우 스키마 데이터와 적재데이터 제거
        this._deleteSchemaData();
        // 기존 파일 데이터 삭제후 생성
        this._deleteAndSaveFileData();

        if (this.ingestionStatus === 'append' || this.ingestionStatus === 'newcolumn') {
          this.ingestionPopupShow();
        } else {
          this._nextStep();
        }
      }
    }
  }

  /**
   * 재적재 팝업 취소
   */
  public ingestionPopupShow(): void {
    this._initGranularityIntervalInfo();
    this.ingestionPopup = true;
  }

  /**
   * 재적재 팝업 취소
   */
  public ingestionPopupCancel(): void {
    this._nextStep();
  }

  /**
   * 재적재 팝업 확인
   */
  public ingestionPopupConfirm(): void {
    this.ingestionPopup = false;
    // loading show
    this.loadingShow();
    // create datasource
    this.datasourceService.appendDatasource(this.sourceData.datasourceId, this._getIngestionParams())
      .then(() => {
        // @TODO 리소스 번들 처리
        Alert.success(`'${this.sourceData.completeData.sourceName.trim()}' ` + this.translateService.instant('msg.storage.alert.source.reingestion.success'));
        this.loadingHide();
        this.close();
        this.onComplete.emit();
      })
      .catch(() => {
        // loading hide
        this.loadingHide();
        // modal
        const modal: Modal = new Modal();
        // show cancel disable
        modal.isShowCancel = false;
        // title
        modal.name = this.translateService.instant('msg.storage.ui.dsource.reingestion.fail.title');
        // desc
        modal.description = this.translateService.instant('msg.storage.ui.dsource.reingestion.fail.description');
        // show error modal
        this.confirmModal.init(modal);
      });
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
    return _.isNil(this.fileResult.sheets) && !this.isJsonFile();
  }

  /**
   * Is excel file
   * @return {boolean}
   */
  public isExcelFile(): boolean {
    return !_.isNil(this.fileResult.sheets);
  }

  public isJsonFile(): boolean {
    return this.fileResult.fileKey.endsWith('json');
  }

  /**
   * Get file format
   * @returns {string}
   * @private
   */
  private _getFileFormat(): string {
    if (this.isJsonFile()) {
      return 'json';
    } else {
      return this.isExcelFile() ? 'excel' : 'csv';
    }
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

    if (_.isNil(this.delimiter) || this.delimiter === '') {
      this.globalErrorMessage = undefined;
      this.isValidDelimiter = false;
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

    if (_.isNil(this.separator) || this.separator === '') {
      this.globalErrorMessage = undefined;
      this.isValidSeparator = false;
      return;
    }

    // file data 조회
    this._setFileDetail(true);
  }

  public get getValidMessage() {
    if ((_.isNil(this.delimiter) || this.delimiter === '') || (_.isNil(this.separator) || this.separator === '')) {
      return this.translateService.instant('msg.common.ui.required');
    } else {
      return this.translateService.instant('msg.storage.ui.schema.valid.desc');
    }
  }

  /**
   * Get title
   * @returns {string}
   */
  public get getTitle(): string {
    if (this.sourceData.datasourceId) {
      return this.translateService.instant('msg.storage.ui.dsource.reingestion.title') + ' (' + this.translateService.instant('msg.storage.ui.dsource.create.file.title') + ')';
    } else {
      return this.translateService.instant('msg.storage.ui.dsource.create.title') + ' (' + this.translateService.instant('msg.storage.ui.dsource.create.file.title') + ')';
    }
  }

  /**
   * Get re-ingestion status message
   */
  public get getReingestionStatusMsg() {
    return this._dataSourceCreateService.getFileErrorMessage(this.ingestionStatus);
  }

  /**
   * Check start granularity interval
   */
  public checkStartInterval(): void {
    StringUtil.isEmpty(this.startIntervalText) && (this.startIntervalText = this._granularityService.getInitInterval(this._firstMomentData, this.selectedSegmentGranularity));
    // get interval validation info
    const validInfo = this._granularityService.getIntervalValidationInfo(this.startIntervalText, this.endIntervalText, this.selectedSegmentGranularity);
    this.intervalValid = validInfo.intervalValid;
    this.intervalValidMessage = validInfo.intervalValidMessage;
    this.granularityUnit = validInfo.granularityUnit;
  }

  /**
   * Check end granularity interval
   */
  public checkEndInterval(): void {
    StringUtil.isEmpty(this.endIntervalText) && (this.endIntervalText = this._granularityService.getInitInterval(this._endMomentData, this.selectedSegmentGranularity));
    // get interval validation info
    const validInfo = this._granularityService.getIntervalValidationInfo(this.startIntervalText, this.endIntervalText, this.selectedSegmentGranularity);
    this.intervalValid = validInfo.intervalValid;
    this.intervalValidMessage = validInfo.intervalValidMessage;
    this.granularityUnit = validInfo.granularityUnit;
  }

  public get getSelectedTimeStampFieldName() {
    if (_.isNil(this.selectedTimestampField)) {
      return this.translateService.instant('msg.storage.th.current-time');
    } else {
      return this.selectedTimestampField.name;
    }
  }

  public get getSelectedSegmentGranularity() {
    return this._granularityService.getSegmentGranularityList().find(
      segmentGranularity => segmentGranularity.value.toString() === this.sourceData.datasource.segGranularity.toString()).label;
  }

  public get getErrorMessage() {
    if (this.isNullOrUndefined(this.globalErrorMessage)) {
      return this.isCsvFile() ? this.selectedFileDetailData.errorMessage : this.fileResult.selectedSheet.errorMessage;
    } else {
      return this.globalErrorMessage;
    }
  }

  /**
   * 스키마 설정 화면으로 이동
   * @private
   */
  private _nextStep(): void {
    this.ingestionPopup = false;
    // 다음페이지로 이동
    this.step = 'file-configure-schema';
    this.stepChange.emit(this.step);
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
    if (!this.isNullOrUndefined(this.selectedFileDetailData)) {
      this.sourceData.fieldList = this.selectedFileDetailData.fields;
      this.sourceData.fieldData = this.selectedFileDetailData.data;
    }
  }

  /**
   * 현재 페이지의 데이터소스 파일정보 저장
   * @param {DatasourceInfo} sourceData
   * @private
   */
  private _saveFileData(sourceData: DatasourceInfo) {
    sourceData['fileData'] = {
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
    const headers: Header[] = this._getHeaders(fields);
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
  private _getHeaders(fields: Field[]): Header[] {
    return fields.map(
      (field: Field) => {
        /* 70 는 CSS 상의 padding 수치의 합산임 */
        const headerWidth: number = Math.floor(pixelWidth(field.name, {size: 12})) + 70;
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
          .Formatter((_row, _cell, value) => {
            let content = value;
            // trans to string
            if (typeof value === 'number') {
              content = value + '';
            }
            if (content && content.length > 50) {
              return content.slice(0, 50);
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
        || (this.isExcelFile() && (this.sourceData.fileData.fileResult.selectedSheet && this.fileResult.selectedSheet.sheetName)
          && (this.sourceData.fileData.fileResult.selectedSheet.sheetName !== this.fileResult.selectedSheet.sheetName))
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
    this.globalErrorMessage = undefined;
    // init selected file detail data
    this.selectedFileDetailData = undefined;
    // grid hide
    this.clearGrid = true;
    // if excel invalid file
    if (this.isExcelFile() && !this.fileResult.selectedSheet.valid) {
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
          } else if (this.isJsonFile()) {
            this.isFirstHeaderRow = false;
          }

          // 재적재 상태체크
          this._checkReingestionStatus();

        } else if (result.isParsable) { // if result is not parsable
          // set error message
          this.selectedFileDetailData.errorMessage = this._dataSourceCreateService.getFileErrorMessage(result.isParsable.warning);
        }
      })
      .catch(error => {
        if (!this.isNullOrUndefined(error.message)) {
          this.loadingHide();
          this.globalErrorMessage = error.message;
        } else {
          this.commonExceptionHandler(error)
        }
      });
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
    if (this.isExcelFile()) {
      params['sheet'] = this.fileResult.selectedSheet.sheetName;
    } else if (this.isCsvFile()) {
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

    // 재적재 상태체크
    this._checkReingestionStatus();
  }

  /**
   * check reingestion status
   * @private
   */
  private _checkReingestionStatus(): void {
    if (this.sourceData.datasourceId) {
      this.ingestionStatus = 'overwrite';

      const biggerFieldList = this.selectedFileDetailData.fields;
      const smallFieldList = this.sourceData.datasource.fields;

      if (biggerFieldList.length < smallFieldList.length) {
        return;
      }

      this.patches = [];

      let fieldCount: number = 0;
      let seq: number = smallFieldList.length - 1;
      for (const biggerField of biggerFieldList) {
        let matched: boolean = false;
        for (const smallField of smallFieldList) {
          if (smallField.name === biggerField.name) {
            fieldCount++;
            matched = true;
            break;
          }
        }
        if (!matched) {
          const patch = {
            op: 'add',
            name: biggerField.name,
            logicalName: biggerField.name,
            type: 'STRING',
            logicalType: 'STRING',
            role: 'DIMENSION',
            aggrType: 'NONE',
            seq: seq++
          };
          this.patches.push(patch);
        }
      }

      const timestampField = this.sourceData.datasource.fields.find(field => field.role === FieldRole.TIMESTAMP);
      if (!_.isNil(timestampField)) {
        for (const data of this.selectedFileDetailData.data) {
          this.dataList.push(data[timestampField.name]);
        }
      }

      if (fieldCount === smallFieldList.length) {
        if (fieldCount === biggerFieldList.length) {
          this.ingestionStatus = 'append';
        } else {
          this.ingestionStatus = 'newcolumn';
        }
      }

    }
  }

  /**
   * Get ingestion parameter
   * @returns {Object}
   * @private
   */
  private _getIngestionParams(): object {
    // ingestion param
    const ingestion = {
      type: 'local',
      format: this._dataSourceCreateService.getFileFormatParams(this._getFileFormat(), this.sourceData.fileData),
      removeFirstRow: this.isFirstHeaderRow,
      path: this.sourceData.fileData.fileResult.filePath,
      uploadFileName: this.sourceData.fileData.fileResult.fileName,
      charset: this.selectedFileDetailData.charset
    };

    if (!_.isNil(this.selectedTimestampField)) {
      ingestion['intervals'] = [this._granularityService.getIntervalUsedParam(this.startIntervalText, this.selectedSegmentGranularity) + '/' + this._granularityService.getIntervalUsedParam(this.endIntervalText, this.selectedSegmentGranularity)];
    }

    return {
      ingestionInfo: ingestion,
      patches: this.patches
    };
  }

  /**
   * Granularity interval initial
   * @private
   */
  private _initGranularityIntervalInfo(): void {
    this.selectedSegmentGranularity = this._granularityService.granularityList.find(granularityObject => granularityObject.value === Granularity[this.sourceData.datasource.segGranularity.toString()]);
    this.selectedTimestampField = this.sourceData.datasource.fields.find(field => field.role === FieldRole.TIMESTAMP);
    if (!_.isNil(this.selectedTimestampField)) {
      const info = this._granularityService.getInitializedInterval(this.dataList.sort(), this.selectedTimestampField.format.format, this.selectedSegmentGranularity, this.selectedTimestampField.format.type, this.selectedTimestampField.format.unit);
      // set interval text
      this.startIntervalText = info.startInterval;
      this.endIntervalText = info.endInterval;
      this.intervalValid = info.intervalValid;
      this.intervalValidMessage = info.intervalValidMessage;
      this.granularityUnit = info.granularityUnit;
      // set moment data
      this._firstMomentData = info.firstMoment;
      this._endMomentData = info.endMoment;
    } else {
      this.intervalValid = true;
    }
  }

}
