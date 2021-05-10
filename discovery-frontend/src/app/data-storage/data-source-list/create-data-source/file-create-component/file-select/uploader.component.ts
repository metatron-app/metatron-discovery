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
import {
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import {CommonConstant} from '@common/constant/common.constant';
import {CookieConstant} from '@common/constant/cookie.constant';
import {AbstractComponent} from '@common/component/abstract.component';

@Component({
  selector: 'uploader',
  templateUrl: 'uploader.component.html'
})
export class UploaderComponent extends AbstractComponent implements OnInit {

  @ViewChild('pickfiles')
  private readonly _pickFiles: ElementRef;
  @ViewChild('drop_container')
  private readonly _dropContainer: ElementRef;

  @Input() // TODO 멀티 업로드시 이것을 배열 형태로 받고 사용하는 모든 메서드 변경 필요
  public uploadedFile: any;

  // upload guide message
  public uploadGuideMessage: string;

  public xhr;

  @Output()
  public uploadStarted = new EventEmitter();
  @Output()
  public uploadComplete = new EventEmitter();

  constructor(protected elementRef: ElementRef,
              protected renderer: Renderer2,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    this.safelyDetectChanges();

    this.renderer.listen(this._pickFiles.nativeElement, 'change', (event) => {
      const files = event.target.files;
      this.addFiles(files);
    });
    this.renderer.listen(this._dropContainer.nativeElement, 'dragover', (event) => {
      this.disableEvent(event);
    });
    this.renderer.listen(this._dropContainer.nativeElement, 'drop', (event) => {
      this.disableEvent(event);
      const files = event.dataTransfer.files;
      this.addFiles(files);
    });

    this.xhr = null;
  }

  public addFiles(files) {
    console.log('FilesAdded', files);

    if (!files || 0 === files.length) {
      return;
    }
    const file = files[0]; // one file is allowed only

    // upload started
    this.uploadStarted.emit();
    // set guide message
    this.uploadGuideMessage = this.translateService.instant('msg.storage.ui.file.uploading');

    this.uploadFile(file);
  }

  public uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file, file.name);

    this.uploadedFile = file;
    this.uploadedFile.isUploading = true;
    this.uploadedFile.isCanceled = false;
    this.uploadedFile.isComplete = false;
    this.uploadedFile.isFailed = false;
    this.safelyDetectChanges();

    this.xhr = new XMLHttpRequest();
    this.xhr.open('POST', CommonConstant.API_CONSTANT.API_URL + 'datasources/file/upload');
    this.xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
    this.xhr.setRequestHeader('Authorization', this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN));

    const that = this;
    this.xhr.onprogress = (e) => {
      file.percent = ((e.loaded / file.size) * 100).toFixed(2);
      that.uploadedFile.percent = file.percent;
      that.safelyDetectChanges();
    };
    this.xhr.onabort = () => {
      that.uploadedFile.isUploading = false;
      that.uploadedFile.isFailed = false;
      that.uploadedFile.isComplete = false;
      that.uploadedFile.isCanceled = true;
    };
    this.xhr.onloadstart = () => {
      file.percent = 0.00;
      that.uploadedFile.percent = file.percent;
      that.uploadGuideMessage = that.translateService.instant('msg.storage.ui.file.uploading');
      that.safelyDetectChanges();
    };
    this.xhr.onload = function () {
      that.uploadedFile.response = this.response;
      const jsonResponse = JSON.parse(this.response);

      if (this.status === 200) {
        file.percent = 100.00;
        that.uploadedFile.percent = file.percent;

        that.uploadedFile.isUploading = false;
        that.uploadedFile.isFailed = false;
        that.uploadedFile.isCanceled = false;
        that.uploadedFile.isComplete = true;
        that.safelyDetectChanges();

        that.uploadComplete.emit(that.uploadedFile);
      } else {
        that.uploadedFile.isFailed = true;
        that.uploadedFile.isCanceled = false;
        that.uploadedFile.isComplete = false;
        that.uploadedFile.isUploading = false;

        // set guide message
        that.uploadGuideMessage = that.translateService.instant('msg.storage.ui.file.failed');
        that.uploadedFile.errorMessage = jsonResponse.message;
        that.uploadStarted.emit();
      }
    };
    this.xhr.onloadend = function () {
      this.xhr = null;
    };
    this.xhr.send(formData);
  }

  /**
   * Get upload percent
   * @param {any} file
   * @return {number}
   */
  public getUploadPercent(file: any): number {
    return file.percent || 0;
  }

  /**
   * Get file size
   * @param {number} size
   * @param {number} split
   * @return {string}
   */
  public getFileSize(size: number, split: number): string {
    if (0 === size) return '0 Bytes';
    const c = 1024;
    const d = split || 2;
    const e = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const f = Math.floor(Math.log(size) / Math.log(c));
    return parseFloat((size / Math.pow(c, f)).toFixed(d)) + ' ' + e[f];
  }

  /**
   * Is exist upload file
   * @return {boolean}
   */
  public isExistUploadFile(): boolean {
    return !_.isNil(this.uploadedFile);
  }

  /**
   * Is file uploading
   * @return {boolean}
   */
  public isFileUploading(): boolean {
    return this.uploadedFile && this.uploadedFile.isUploading;
  }

  /**
   * Is file upload cancel
   * @return {boolean}
   */
  public isFileUploadCancel(): boolean {
    return this.uploadedFile && this.uploadedFile.isCanceled;
  }

  /**
   * Is file upload fail
   * @return {boolean}
   */
  public isFileUploadFail(): boolean {
    return this.uploadedFile && this.uploadedFile.isFailed;
  }

  /**
   * Is file upload complete
   * @return {boolean}
   */
  public isFileUploadComplete(): boolean {
    return this.uploadedFile && this.uploadedFile.isComplete;
  }

  /**
   * Is file type
   * @param {any} file
   * @param {string} type
   * @return {boolean}
   */
  public isFileType(file: any, type: string): boolean {
    switch (type) {
      case 'csv':
        return /^.*\.csv$/.test(file.name);
      case 'xls':
        return /^.*\.xls$/.test(file.name);
      case 'xlsx':
        return /^.*\.xlsx$/.test(file.name);
      case 'json':
        return /^.*\.json$/.test(file.name);
    }
  }

  /**
   * Upload cancel
   * @param {any} _file
   */
  public cancelUpload(_file: any): void {
    if (this.isFileUploading()) {
      // stop uploader
      // set upload cancel
      this.uploadedFile.isUploading = false;
      this.uploadedFile.isCanceled = true;
      // remove file
      if (this.xhr) {
        this.xhr.abort();
      }
      // restart
      // set guide message
      this.uploadGuideMessage = this.translateService.instant('msg.storage.ui.file.canceled');
    }
  }

  /**
   * Disable event
   * @param event
   */
  public disableEvent(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  /**
   * Disable DragDrop
   * @param event
   */
  public disableDragDrop(event) {
    // if file uploading status
    if (this.isFileUploading()) {
      this.disableEvent(event);
    }
  }

}
