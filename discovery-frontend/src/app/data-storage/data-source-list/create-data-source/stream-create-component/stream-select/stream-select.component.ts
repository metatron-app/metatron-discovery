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
import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,} from '@angular/core';
import {StringUtil} from '@common/util/string.util';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {Pluploader} from '@common/component/pluploader/pluploader';
import {DatasourceInfo} from '@domain/datasource/datasource';
import {DatasourceService} from '../../../../../datasource/service/datasource.service';
import {ConnectionValid} from '../../../../component/connection/connection.component';
import {FileResult, KafkaData} from '../../../../service/data-source-create.service';

@Component({
  selector: 'stream-select',
  templateUrl: './stream-select.component.html'
})
export class StreamSelectComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성될 데이터소스 정보
  @Input('sourceData')
  private readonly sourceData: DatasourceInfo;

  @Input()
  public step: string;

  @Output()
  public readonly stepChange: EventEmitter<string> = new EventEmitter();

  public url: string;
  public useKafkaData: boolean;

  // flag
  public connectionValidation: ConnectionValid;
  // input error
  public isUrlError: boolean;

  // upload result
  public uploadedFile: Pluploader.File;
  // file results
  public fileResult: FileResult;

  public kafkaTopicList: any[];
  public selectedKafkaTopic: string;
  public isShowTopicList: boolean;
  public isKafkaDataResult: boolean;
  public isUseKafkaScheme: boolean;

  // 생성자
  constructor(private datasourceService: DatasourceService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    if (this.sourceData.hasOwnProperty('kafkaData')) {
      this.url = this.sourceData.kafkaData.bootstrapServer;
      this.useKafkaData = this.sourceData.kafkaData.useKafkaData;
      delete this.sourceData.kafkaData;
    }
    if (this.sourceData.hasOwnProperty('uploadData')) {
      delete this.sourceData.uploadData;
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
      if (this.useKafkaData !== this.isUseKafkaScheme) {
        this.sourceData.hasOwnProperty('schemaData') && (delete this.sourceData.schemaData);
        this.sourceData.hasOwnProperty('ingestionData') && (delete this.sourceData.ingestionData);
      }

      if (!this.isKafkaDataResult || !this.isUseKafkaScheme) {
        if (this._isChangeData()) {
          this.sourceData.hasOwnProperty('fileData') && (delete this.sourceData.fileData);
          this.sourceData.hasOwnProperty('schemaData') && (delete this.sourceData.schemaData);
          this.sourceData.hasOwnProperty('ingestionData') && (delete this.sourceData.ingestionData);
        }
        // 기존 파일 데이터 삭제후 생성
        this._deleteAndSaveUploadData();

        this.sourceData.kafkaData = new KafkaData();
        this.sourceData.kafkaData.bootstrapServer = this.url;
        this.sourceData.kafkaData.topic = this.selectedKafkaTopic;
      }
      this.sourceData.kafkaData.useKafkaData = this.isUseKafkaScheme;
      this.step = 'stream-preview';
      this.stepChange.emit(this.step);
    }
  }

  /**
   * Is enable next
   * @return {boolean}
   */
  public isEnableNext(): boolean {
    return this.isEnableConnection() && StringUtil.isNotEmpty(this.selectedKafkaTopic)
            && ((this.isUseKafkaScheme && this.isKafkaDataResult) || (!this.isUseKafkaScheme && !_.isNil(this.fileResult)));
  }

  /**
   * Initial connection valid
   */
  public connectionValidInitialize(): void {
    this.connectionValidation = undefined;
    this.kafkaTopicList = undefined;
    this.selectedKafkaTopic = undefined;
    this.isUseKafkaScheme = undefined;
    this.isKafkaDataResult = undefined;
  }

  public urlInputChange(event: KeyboardEvent) {
    event.keyCode === 13 && this.checkConnection();
  }

  public clickTopicList() {
    if (this.isEnableConnection()) {
      this.isShowTopicList = !this.isShowTopicList;
    }
  }

  /**
   * Check valid connection
   */
  public checkConnection(): void {
    if (StringUtil.isEmpty(this.url)) {
      this.isUrlError = true;
      return;
    }
    this.loadingShow();
    this.datasourceService.getKafkaTopic(this.url).then((data) => {
      this.loadingHide();
      this.connectionValidation = ConnectionValid.ENABLE_CONNECTION;
      this.kafkaTopicList = data;
    }).catch(() => {
      this.loadingHide();
      this.connectionValidation = ConnectionValid.DISABLE_CONNECTION;
    });
  }

  public selectTopic(topic: string) {
    this.loadingShow();
    this.datasourceService.getKafkaTopicData(this.url, topic).then((result) => {
      this.loadingHide();
      this.selectedKafkaTopic = topic;
      if (_.isNil(result.type)) {
        this.isKafkaDataResult = false;
        this.isUseKafkaScheme = false;
      } else {
        this.isKafkaDataResult = true;
        this.isUseKafkaScheme = true;

        this.sourceData.kafkaData = new KafkaData();
        this.sourceData.kafkaData.bootstrapServer = this.url;
        this.sourceData.kafkaData.topic = this.selectedKafkaTopic;
        this.sourceData.kafkaData.type = result.type;
        this.sourceData.kafkaData.fieldList = result.resultResponse.fields;
        this.sourceData.kafkaData.fieldData = result.resultResponse.data;
        this.sourceData.kafkaData.totalRows = result.resultResponse.totalRows;
      }
    }).catch(() => {
      this.loadingHide();
      this.selectedKafkaTopic = topic;
      this.isKafkaDataResult = false;
    });
  }

  /**
   * Is enable connection
   * @return {boolean}
   */
  public isEnableConnection(): boolean {
    return this.connectionValidation === ConnectionValid.ENABLE_CONNECTION;
  }

  /**
   * Is disable connection
   * @return {boolean}
   */
  public isDisableConnection(): boolean {
    return this.connectionValidation === ConnectionValid.DISABLE_CONNECTION;
  }

  /**
   * Is require check connection
   * @return {boolean}
   */
  public isRequireCheckConnection(): boolean {
    return this.connectionValidation === ConnectionValid.REQUIRE_CONNECTION_CHECK;
  }

  public showFileUpload() {
    return this.isEnableConnection() && (this.isKafkaDataResult === false || this.isUseKafkaScheme === false);
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
    this.fileResult = {
      fileKey: response.filekey,
      filePath: response.filePath,
      fileSize: uploadedFile.size,
      fileName: uploadedFile.name,
      sheets: undefined,
      selectedSheet: undefined,
    };
    this.safelyDetectChanges();
  }

  public get displayTopic() {
    return this.selectedKafkaTopic === undefined ? this.translateService.instant('msg.comm.btn.none') : this.selectedKafkaTopic;
  }

  public get searchTopicPlaceholder() {
    return this.translateService.instant('msg.comm.btn.search');
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
   * @private
   */
  private _saveUploadData(sourceData: DatasourceInfo) {
    sourceData.uploadData = {
      uploadedFile: this.uploadedFile,
      // file results
      fileResult: this.fileResult
    };
  }

}
