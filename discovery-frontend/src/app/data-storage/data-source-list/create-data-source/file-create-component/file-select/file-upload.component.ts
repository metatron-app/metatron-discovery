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
} from '@angular/core';
import {AbstractPopupComponent} from '../../../../../common/component/abstract-popup.component';
import {DatasourceInfo} from '../../../../../domain/datasource/datasource';
import * as _ from 'lodash';
import {
  FileResult, Sheet,
} from "../../../../service/data-source-create.service";
import {Pluploader} from "../../../../../common/component/pluploader/pluploader";

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
})
export class FileUploadComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성될 데이터소스 정보
  @Input('sourceData')
  private readonly sourceData: DatasourceInfo;

  // upload result
  public uploadedFile: Pluploader.File;
  // file results
  public fileResult: FileResult;

  @Input()
  public step: string;

  @Output()
  public readonly stepChange: EventEmitter<string> = new EventEmitter();

  // 생성자
  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // 현재 페이지 데이터소스 파일보가 있다면
    if (this.sourceData.hasOwnProperty('uploadData')) {
      // init data
      this._initData(_.cloneDeep(this.sourceData.uploadData));
    }
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /**
   * 다음화면으로 이동
   */
  public next() {
    // validation
    if (this.isEnableNext()) {
      // 데이터 변경이 일어난경우 기존 데이터 삭제
      if (this._isChangeData()) {
        this.sourceData.hasOwnProperty('fileData') && (delete this.sourceData.fileData);
        this.sourceData.hasOwnProperty('schemaData') && (delete this.sourceData.schemaData);
        this.sourceData.hasOwnProperty('ingestionData') && (delete this.sourceData.ingestionData);
      }
      // 기존 파일 데이터 삭제후 생성
      this._deleteAndSaveUploadData();
      // 다음페이지로 이동
      this.step = 'file-preview';
      this.stepChange.emit(this.step);
    }
  }


  /**
   * Is enable next
   * @return {boolean}
   */
  public isEnableNext(): boolean {
    // TODO 멀티 업로드시 변경
    return !_.isNil(this.fileResult);
  }

  /**
   * Started file upload
   */
  public onStartedFileUpload() {
    this.fileResult = undefined;
  }

  /**
   * Complete file upload
   * @param {Pluploader.File} uploadedFile
   */
  public onCompletedFileUpload(uploadedFile: Pluploader.File) {
    this.uploadedFile = uploadedFile;
    // response 데이터
    const response: any = JSON.parse(uploadedFile.response);
    const fileResult = {
      fileKey: response.filekey,
      filePath: response.filePath,
      fileSize: uploadedFile.size,
      fileName: uploadedFile.name,
      sheets: undefined,
      selectedSheet: undefined,
    };
    // sheet 가 존재한다면
    if (response.sheets && response.sheets.length !== 0) {
      // sheet
      fileResult.sheets = this._getConvertSheets(response.sheets);
      // initial selected sheet
      fileResult.selectedSheet = fileResult.sheets[0];
    }
    this.fileResult = fileResult;
    this.safelyDetectChanges();
  }

  /**
   * Get convert sheets
   * @param {object} sheets
   * @return {Sheet[]}
   */
  private _getConvertSheets(sheets: object): Sheet[] {
    return Object.keys(sheets).map(key => {
      return sheets[key].valid ? {sheetName: key, valid: sheets[key].valid, warning: sheets[key].warning} : {sheetName: key, valid: sheets[key].valid, warning: sheets[key].warning, errorMessage: this.translateService.instant(`msg.storage.ui.file.result.${sheets[key].warning}`)};
    });
  }


  /**
   * 데이터가 변경이 일어났는지 확인
   * @return {boolean}
   * @private
   */
  private _isChangeData(): boolean {
    if (this.sourceData.uploadData) {
      // 파일 key 가 변경된 경우
      if (this.sourceData.uploadData.fileResult.fileKey !== this.fileResult.fileKey) {
        return true;
      }
    }
    return false;
  }

  /**
   * 기존 파일 삭제후 새로 생성
   * @private
   */
  private _deleteAndSaveUploadData(): void {
    // 파일 정보가 있다면 삭제
    if (this.sourceData.hasOwnProperty('uploadData')) {
      delete this.sourceData.uploadData;
    }
    // 현재 페이지의 데이터소스 생성정보 저장
    this._saveUploadData(this.sourceData);
  }

  /**
   * 현재 페이지의 데이터소스 파일정보 저장
   * @param {DatasourceInfo} sourceData
   * @private
   */
  private _saveUploadData(sourceData: DatasourceInfo) {
    const uploadData = {
      uploadedFile: this.uploadedFile,
      // file results
      fileResult: this.fileResult
    };
    sourceData.uploadData = uploadData;
  }

  /**
   * init source file data
   * @param uploadData
   * @private
   */
  private _initData(uploadData) {
    this.uploadedFile = uploadData.uploadedFile;
    this.fileResult = uploadData.fileResult;
  }
}
