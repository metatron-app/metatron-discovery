/* tslint:disable:variable-name */
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
import {isUndefined} from 'util';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import {CommonConstant} from '@common/constant/common.constant';
import {CookieConstant} from '@common/constant/cookie.constant';
import {Modal} from '@common/domain/modal';
import {PopupService} from '@common/service/popup.service';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {DeleteModalComponent} from '@common/component/modal/delete/delete.component';
import {FileFormat, PrDatasetFile, StorageType} from '@domain/data-preparation/pr-dataset';
import {PreparationCommonUtil} from '../../util/preparation-common.util';
import {DatasetService} from '../service/dataset.service';

export class UploadNegotitationParameters {
  public limit_size: number = 0;
  public storage_types: string[] = [];
  public timestamp: number = 0;
  public upload_id: string = '';
}

@Component({
  selector: 'app-create-dataset-selectfile',
  templateUrl: './create-dataset-selectfile.component.html',
})
export class CreateDatasetSelectfileComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('pickfiles')
  private pickfiles: ElementRef;

  @ViewChild('drop_container')
  private dropContainer: ElementRef;

  @ViewChild('pickfiles2')
  private pickfiles2: ElementRef;

  @ViewChild('drop_container2')
  private dropContainer2: ElementRef;

  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  private _isFileAddedInterval: any;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public datasetFiles: any;

  public uploadNegoParams: UploadNegotitationParameters;

  public isUploading: boolean = false;

  public authorization: string;

  public uploadUrl: string;

  public changeDetect: ChangeDetectorRef;

  public fileLocations: any[];
  public fileLocation: string;
  public fileLocationDefaultIdx: number = 0;

  public limitSize: number;

  public upFiles: any[];

  public successFileCount: number = 0;
  public supportedFileCount: number = 0;
  public unsupportedFileCount: number = 0;
  public unsupportedFileView: boolean = false;
  public isNext: boolean = false;

  public preparationUtil = PreparationCommonUtil;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasetService: DatasetService,
              private popupService: PopupService,
              private renderer: Renderer2,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    super.ngOnInit();

    this.authorization = this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN);
    this.uploadUrl = CommonConstant.API_CONSTANT.API_URL + 'preparationdatasets/file_upload';

    this.upFiles = [];

    this.datasetService.getFileUploadNegotiation().then((params) => {
      this.loadingHide();

      this.uploadNegoParams = JSON.parse(JSON.stringify(params)); // deep copy for negotiation parameters

      this.fileLocations = [];
      if (this.uploadNegoParams.storage_types && this.uploadNegoParams.storage_types.length > 0) {
        this.uploadNegoParams.storage_types.forEach((storage_type) => {
          this.fileLocations.push({
            value: storage_type,
            label: storage_type
          });
        })
      } else {
        this.fileLocations.push({
          value: 'LOCAL',
          label: 'LOCAL'
        });
      }

      let idx = this.fileLocations.findIndex((item) => {
        return item.value.toUpperCase() === 'LOCAL';
      });
      if (idx === -1) idx = 0;
      this.fileLocationDefaultIdx = idx;
      this.fileLocation = this.fileLocations[idx].value;

      this.limitSize = this.uploadNegoParams.limit_size;

      this.initUploader();
    }).catch((reason) => {
      console.log(reason);
    });

  }

  public ngOnDestroy() {
    super.ngOnDestroy();

    clearInterval(this._isFileAddedInterval);
    this._isFileAddedInterval = null;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public initUploader() {

    this.renderer.listen(this.pickfiles.nativeElement, 'change', (event) => {
      const files = event.target.files;
      this.addFile(files);
    });
    this.renderer.listen(this.dropContainer.nativeElement, 'dragover', (event) => {
      event.stopPropagation();
      event.preventDefault();
    });
    this.renderer.listen(this.dropContainer.nativeElement, 'drop', (event) => {
      event.stopPropagation();
      event.preventDefault();
      const files = event.dataTransfer.files;
      this.addFile(files);
    });
    this.renderer.listen(this.pickfiles2.nativeElement, 'change', (event) => {
      const files = event.target.files;
      this.addFile(files);
    });
    this.renderer.listen(this.dropContainer2.nativeElement, 'dragover', (event) => {
      event.stopPropagation();
      event.preventDefault();
    });
    this.renderer.listen(this.dropContainer2.nativeElement, 'drop', (event) => {
      event.stopPropagation();
      event.preventDefault();
      const files = event.dataTransfer.files;
      this.addFile(files);
    });

  }

  public addFile(files) {
    if (!files) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      const tmp = PreparationCommonUtil.getFileNameAndExtension(file.name);

      file.fileName = tmp[0];
      file.fileExtension = tmp[1];

      const allowedExt = ['csv', 'txt', 'json', 'xls', 'xlsx'];
      const found = allowedExt.find((e) => (file.fileExtension.toLowerCase() === e));
      if (found.length === 0) {
        this.unsupportedFileCount++;
        this.unsupportedFileView = true;
        this._unsupportedFileView();
      } else {
        this.supportedFileCount++;
      }

      file.isAdded = true;
      file.isUploaded = false;
      file.isUploading = false;
      file.isCanceled = false;
      file.isFailed = false;

      file.upload_id = null;
      file.chunks = 0;
      file.chunk_size = this.limitSize;
      file.uploading_chunks = 0;
      file.succeeded_chunks = 0;
      file.failed_chunks = 0;
      file.progressPercent = 0;
      file.storage_type = this.fileLocation;

      file.response = null;

      this.datasetService.getFileUploadNegotiation().then((params) => {
        file.upload_id = params.upload_id;
        file.chunks = Math.ceil(file.size / file.chunk_size);

        this.upFiles.push(file);
        $('.ddp-list-file-progress').scrollTop(422 * (this.upFiles.length + 1));

        this.startUpload(file);
      });
    }
  }

  /**
   * File Upload Start
   */
  public startUpload(file) {
    file.isAdded = false;
    file.isUploading = true;

    file.position = 0;
    file.sended = 0;
    for (let chunk = 0; chunk < file.chunks; chunk++) {
      if (file.isCanceled === true) {
        break;
      }

      const reader = new FileReader();
      reader.onerror = (_evt) => {
        file.isUploading = false;
        file.isFailed = true;
        file.uploading_chunks--;
        file.failed_chunks++;
      };
      reader.onabort = (_e) => {
        file.isUploading = false;
        file.isCanceled = true;
        file.uploading_chunks--;
        file.failed_chunks++;
      };
      reader.onload = ((that, _chunk) => {
        return function (_e) {
          if (file.isCanceled === true) {
            return;
          }

          const f = new File([this.result], file.name);

          const formData = new FormData();
          formData.append('storage_type', file.storage_type);
          formData.append('upload_id', file.upload_id);
          formData.append('chunk_size', file.chunk_size);
          formData.append('total_size', file.size);
          formData.append('chunk', chunk.toString());
          formData.append('chunks', file.chunks);
          formData.append('name', file.name);
          formData.append('file', f);

          const xhr = new XMLHttpRequest();
          xhr.open('POST', that.uploadUrl);
          xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
          xhr.setRequestHeader('Authorization', that.authorization);

          xhr.onerror = (_errorEvent) => {
            file.isUploading = false;
            file.isFailed = true;
            file.uploading_chunks--;
            file.failed_chunks++;
          }
          xhr.onabort = (_abortEvent) => {
            file.isUploading = false;
            file.isCanceled = true;
            file.uploading_chunks--;
            file.failed_chunks++;
          }
          xhr.onloadend = function (_loadEvent) {
            if (file.isCanceled === true) {
              return;
            }

            const response = JSON.parse(this.response);
            file.response = response;

            file.uploading_chunks--;
            if (response.success === true) {
              file.succeeded_chunks++;
            } else {
              file.failed_chunks++;
            }

            file.progressPercent = ((file.succeeded_chunks / file.chunks) * 100).toFixed(2);

            if (file.succeeded_chunks === file.chunks) {
              file.storedUri = response.storedUri;

              that.successFileCount++;
              file.isUploading = false;
              file.isUploaded = true;

              that.fileUploadComplete();
            } else {
              file.storedUri = '';
            }
          }
          xhr.send(formData);
        }
      })(this, chunk);

      file.uploading_chunks++;

      file.position = chunk * file.chunk_size;
      let endPos = file.position + file.chunk_size;
      if (file.size < endPos) {
        endPos = file.size;
      }
      const blob = file.slice(file.position, endPos);

      reader.readAsArrayBuffer(blob);
    }

    if (file.chunks === 0) {
      file.isUploading = false;
      file.isUploaded = true;
    }
  }

  /**
   * File Upload Location Selected
   */
  public onSelected(event) {
    this.fileLocation = event.value;

    let idx = this.fileLocations.findIndex((item) => {
      return item.value.toUpperCase() === event.value;
    });
    if (idx === -1) idx = 0;
    this.fileLocationDefaultIdx = idx;
  }

  /**
   * File Upload Reset
   */
  public reset() {
    this.successFileCount = 0;
    this.supportedFileCount = 0;
    this.unsupportedFileCount = 0;
    this.unsupportedFileView = false;
    this.isNext = false;

    this.upFiles.splice(0, this.upFiles.length);
    this.datasetFiles.splice(0, this.datasetFiles.length);
  }

  /**
   * File Upload Cancel(Plupload)
   */
  public cancelUpload(file) {
    if (file.isUploading === true) {
      const idx = this.upFiles.findIndex((upFile) => {
        return upFile.upload_id === file.upload_id
      });

      this.upFiles[idx].isUploading = false;
      this.upFiles[idx].isCanceled = true;
    }
  }

  /**
   * Disable Drag and Drop in File list area
   */
  public disableEvent(event: any) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  /**
   * Files Upload Complete()
   */
  public fileUploadComplete() {
    if (this.successFileCount < 1 && isUndefined(this.datasetFiles)) {
      console.log('fileUploadComplete : this.successFileCount < 1 ');
      return;
    }
    this.datasetFiles.splice(0, this.datasetFiles.length);
    for (let i = 0, nMax = this.upFiles.length; i < nMax; i++) {
      if (this.upFiles[i].isUploaded === true) {
        const datasetFile = new PrDatasetFile();

        datasetFile.filenameBeforeUpload = this.upFiles[i].name;
        datasetFile.storedUri = this.upFiles[i].storedUri;
        datasetFile.storageType = this._getStorageType(this.fileLocation);
        const fileFormat = this._getFileFormat(this.upFiles[i].fileExtension);
        datasetFile.fileFormat = fileFormat;

        // Delimiter is , when fileFormat is csv or excel or txt
        const formatWithCommaDel = ['CSV', 'EXCEL', 'TXT'];
        if (-1 !== formatWithCommaDel.indexOf(fileFormat.toString())) {
          datasetFile.delimiter = ',';
        }

        const quoteCharWithCommaDel = ['CSV', 'TXT'];
        if (-1 !== quoteCharWithCommaDel.indexOf(fileFormat.toString())) {
          datasetFile.quoteChar = '\"';
        }

        datasetFile.fileName = this.upFiles[i].fileName;
        datasetFile.fileExtension = this.upFiles[i].fileExtension;

        this.datasetFiles.push(datasetFile);
      }
    }
    this.isNext = (!this.isUploading && this.successFileCount > 0);

  }

  /**
   * Next (select sheet)
   */
  public next() {
    if (this.isUploading || this.successFileCount < 1 || isUndefined(this.datasetFiles[0].filenameBeforeUpload)) {
      return;
    }

    this.popupService.notiPopup({
      name: 'select-sheet',
      data: null
    });
  }

  /**
   * Close Check
   */
  public closeCheck() {
    if (this.isUploading) {

      event.stopPropagation();

      const modal = new Modal();
      modal.isShowCancel = true;
      modal.name = this.translateService.instant('msg.dp.ui.file.upload.cancel.title');
      modal.description = this.translateService.instant('msg.dp.ui.file.upload.cancel.description');
      // modal.subDescription = '';

      this.deleteModalComponent.init(modal);
    } else {
      this.close();
    }
  }

  /**
   * Close Imported Popup
   */
  public close() {

    super.close();

    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });
  }

  /**
   * Cancel and Close on Uploading
   */
  public confirmClose() {
    this.close();
  }

  /**
   * Upload Continue on Uploading
   */
  public cancelClose() {
  }

  /**
   * Show formatBytes
   */
  public formatBytes(a, b) { // a=크기 , b=소숫점자릿
    if (0 === a) return '0 Bytes';
    const c = 1024;
    const d = b || 2;
    const e = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const f = Math.floor(Math.log(a) / Math.log(c));
    return parseFloat((a / Math.pow(c, f)).toFixed(d)) + ' ' + e[f]
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Unsupported File Wanning
   */
  private _unsupportedFileView() {
    if (this.unsupportedFileView) {
      setTimeout(() => {
        this.unsupportedFileView = false;
      }, 3000);
    }
  }

  private _getStorageType(location) {
    for (const sType in StorageType) {
      if (StorageType[sType] === location) {
        const enumType: StorageType = StorageType['' + sType];
        return enumType;
      }
    }
    return StorageType.LOCAL;
  }


  /**
   * Returns appropriate file format for each extension
   * Extensions : CSV, TXT, JSON, XLSX, XLS
   * @param fileExtension
   * @returns {FileFormat}
   * @private
   */
  private _getFileFormat(fileExtension) {
    const fileType: string = fileExtension.toUpperCase();

    const formats = [{
      extension: 'CSV',
      fileFormat: FileFormat.CSV
    },
      {
        extension: 'TXT',
        fileFormat: FileFormat.TXT
      },
      {
        extension: 'JSON',
        fileFormat: FileFormat.JSON
      },
      {
        extension: 'XLSX',
        fileFormat: FileFormat.EXCEL
      },
      {
        extension: 'XLS',
        fileFormat: FileFormat.EXCEL
      },
    ];

    const idx = _.findIndex(formats, {
      extension: fileType
    });

    if (idx !== -1) {
      return formats[idx].fileFormat
    } else {
      return formats[0].fileFormat
    }
  }
}
