import {Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild} from "@angular/core";
import {AbstractComponent} from "../../../../../common/component/abstract.component";
import {CommonConstant} from "../../../../../common/constant/common.constant";
import {CookieConstant} from "../../../../../common/constant/cookie.constant";
import {Pluploader} from "../../../../../common/component/pluploader/pluploader";
import * as _ from 'lodash';
import ErrorCode = Pluploader.ErrorCode;
declare const plupload: any;


@Component({
  selector: 'uploader',
  templateUrl: 'uploader.component.html'
})
export class UploaderComponent extends AbstractComponent {

  @ViewChild('pickfiles')
  private readonly _pickFiles: ElementRef;
  @ViewChild('drop_container')
  private readonly _dropContainer: ElementRef;

  @Input() // TODO 멀티 업로드시 이것을 배열 형태로 받고 사용하는 모든 메서드 변경 필요
  public uploadedFile: Pluploader.File;

  // upload guide message
  public uploadGuideMessage: string;

  // file uploader
  private _chunkUploader: Pluploader.Uploader;

  @Output()
  public uploadStarted = new EventEmitter();
  @Output()
  public uploadComplete = new EventEmitter();

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    this.safelyDetectChanges();
    // init uploader
    this._initUploader();
  }

  /**
   * Get upload percent
   * @param {Pluploader.File} file
   * @return {number}
   */
  public getUploadPercent(file: Pluploader.File): number {
    return file.percent || 0;
  }

  /**
   * Get file size
   * @param {number} size
   * @param {number} split
   * @return {string}
   */
  public getFileSize(size: number, split: number): string {
    if(0 === size) return "0 Bytes";
    let c=1024,d=split||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(size)/Math.log(c));
    return parseFloat((size/Math.pow(c,f)).toFixed(d))+" "+e[f];
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
   * @param {Pluploader.File} file
   * @param {string} type
   * @return {boolean}
   */
  public isFileType(file: Pluploader.File, type: string): boolean {
    switch (type) {
      case 'csv':
        return /^.*\.csv$/.test(file.name);
      case 'xls':
        return /^.*\.xls$/.test(file.name);
      case 'xlsx':
        return /^.*\.xlsx$/.test(file.name);
    }
  }

  /**
   * Upload cancel
   * @param {Pluploader.File} file
   */
  public cancelUpload(file: Pluploader.File): void {
    if (file.status === Pluploader.FileStatus.UPLOADING) {
      // stop uploader
      this._chunkUploader.stop();
      // set upload cancel
      this.uploadedFile.isUploading = false;
      this.uploadedFile.isCanceled = true;
      // remove file
      this._chunkUploader.removeFile(file);
      // restart
      this._chunkUploader.start();
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

  /**
   * Get created uploader
   * @param dropElement
   * @param buttonElement
   * @return {Pluploader.Uploader}
   * @private
   */
  private _getCreatedUploader(dropElement, buttonElement) {
    return new plupload.Uploader(new Pluploader.Builder.UploaderOptionsBuilder()
      .Runtimes('html5,html4')
      .ChunkSize(0)
      .BrowseButton(buttonElement)
      .DropElement(dropElement)
      .Url(CommonConstant.API_CONSTANT.API_URL + 'datasources/file/upload')
      .Headers({
        'Accept': 'application/json, text/plain, */*',
        'Authorization': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
      })
      .MultiSelection(false)
      .Filters(new Pluploader.Builder.FileFiltersBuilder()
        .MimeTypes([
          {title: "files", extensions: "csv,xls,xlsx"}
        ])
        .MaxFileSize(0)
        .builder()
      )
      .Init({
        BeforeUpload: (up: Pluploader.Uploader) => {

        },
        // 파일 큐 스택 변경시
        QueueChanged: (up: Pluploader.Uploader)=>{
          // Only one file
          if (up.files.length > 0) {
            // TODO 멀티 업로드시 변경필요
            if (up.files.length > 1) {
              up.files.splice(0, up.files.length - 1);
            }
            // disable browse button
            up.disableBrowse(true);
            // set upload result
            this.uploadedFile = up.files[0];
            this.uploadedFile.isUploading = true;
            this.uploadedFile.isCanceled = false;
            this.uploadedFile.isComplete = false;
            this.uploadedFile.isFailed = false;
            this.safelyDetectChanges();
          }
        },
        // 파일 추가시
        FilesAdded: (up: Pluploader.Uploader, files) => {
          console.log('FilesAdded', files);
          // upload started
          this.uploadStarted.emit();
          // set guide message
          this.uploadGuideMessage = this.translateService.instant('msg.storage.ui.file.uploading');
          // upload start
          up.start();
          // disable upload
          up.disableBrowse(true);
        },
        // 프로그레스
        UploadProgress: (up: Pluploader.Uploader, file: Pluploader.File) => {
          // set percent
          this.uploadedFile.percent = file.percent;
          this.safelyDetectChanges();
        },
        FileUploaded: (up, file, result: {response: string, status: number, responseHeaders: string}) => {
          this.uploadedFile.response = result.response;
          this.uploadedFile.responseHeaders = result.responseHeaders;
        },
        // complete upload
        UploadComplete: (up, files) => {
          // enable upload
          up.disableBrowse(false);
          if (this.uploadedFile.isCanceled !== true || this.uploadedFile.isFailed) {
            this.uploadedFile.isUploading = false;
            this.uploadedFile.isComplete = true;
            this.safelyDetectChanges();
            this.uploadComplete.emit(this.uploadedFile);
          }
        },
        // error
        Error: (up, err: {code: number, file: Pluploader.File, message: string}) => {
          // enable upload
          up.disableBrowse(false);
          // set file
          this.uploadedFile = err.file;
          // set upload error
          this.uploadedFile.isFailed = true;
          this.uploadedFile.isCanceled = false;
          this.uploadedFile.isComplete = false;
          this.uploadedFile.isUploading = false;
          // set guide message
          this.uploadGuideMessage = this.translateService.instant('msg.storage.ui.file.failed');
          this.uploadedFile.errorMessage = err.message;
          // set error
          switch (err.code) {
            case ErrorCode.FILE_DUPLICATE_ERROR:
              break;
            case ErrorCode.FILE_EXTENSION_ERROR:
              break;
            case ErrorCode.FILE_SIZE_ERROR:
              break;
            case ErrorCode.GENERIC_ERROR:
              break;
            case ErrorCode.HTTP_ERROR:
              break;
            case ErrorCode.IO_ERROR:
              break;
            default:
              break;
          }
          this.uploadStarted.emit();
        }
      })
      .build());
  }

  /**
   * Init uploader
   * @private
   */
  private _initUploader(): void {
    this._chunkUploader = this._getCreatedUploader(this._dropContainer.nativeElement, this._pickFiles.nativeElement);
    this._chunkUploader.init();
  }
}
