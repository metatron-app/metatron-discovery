import {Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild} from "@angular/core";
import {AbstractComponent} from "../../../../../common/component/abstract.component";
import {CommonConstant} from "../../../../../common/constant/common.constant";
import {CookieConstant} from "../../../../../common/constant/cookie.constant";
import {Alert} from "../../../../../common/util/alert.util";
import {Pluploader} from "../../../../../common/component/pluploader/pluploader";
import * as _ from "lodash";
import ErrorCode = Pluploader.ErrorCode;
import {UploadResult} from "../../../../service/data-source-create.service";
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

  @Input()
  public uploadResult: UploadResult;

  public uploadGuideMessage: string;

  // file uploader
  private _chunkUploader: Pluploader.Uploader.IUploader;

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

  public getUploadPercent(file: Pluploader.File.IFile): number {
    return file.percent || 0;
  }

  public isFileUploading(): boolean {
    return this.uploadResult && this.uploadResult.file.isUploading;
  }

  public isFileUploadFail(): boolean {
    return this.uploadResult && this.uploadResult.file.isCanceled;
  }

  public isFileUploadComplete(): boolean {
    return this.uploadResult && this.uploadResult.file.isComplete;
  }

  public getFileSize(size: number, split: number): string {
    if(0 === size) return "0 Bytes";
    let c=1024,d=split||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(size)/Math.log(c));
    return parseFloat((size/Math.pow(c,f)).toFixed(d))+" "+e[f];
  }

  public cancelUpload(file: Pluploader.File.IFile): void {
    if (file.status === Pluploader.File.Status.UPLOADING) {
      this._chunkUploader.stop();
      this.uploadResult.file.isUploading = false;
      this.uploadResult.file.isCanceled = true;
      this._chunkUploader.removeFile(file);
      this._chunkUploader.start();
      // set guide message
      this.uploadGuideMessage = '파일을 업로드가 취소되었습니다. 파일을 다시 업로드하세요';
    }
  }

  private _getCreatedUploader(dropElement, buttonElement) {
    return new plupload.Uploader(new Pluploader.Uploader.Setting.OptionsBuilder()
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
      .Filters(new Pluploader.Uploader.Setting.FileFiltersBuilder()
        .MimeTypes([
          {title: "files", extensions: "csv,xls,xlsx"}
        ])
        .PreventDuplicates(true)
        .MaxFileSize(0)
        .builder()
      )
      .Init({
        BeforeUpload: (up: Pluploader.Uploader.IUploader) => {

        },
        // 파일 큐 스택 변경시
        QueueChanged: (up: Pluploader.Uploader.IUploader)=>{
          // Only one file
          // TODO 멀티 업로드시 변경필요
          if (up.files.length > 1) {
            up.files.splice(0, up.files.length - 1);
          }
          // disable browse button
          up.disableBrowse(true);
          // set upload result
          this.uploadResult = {file: up.files[0]};
          this.uploadResult.file.isUploading = true;
          this.uploadResult.file.isCanceled = false;
          this.uploadResult.file.isComplete = false;
        },
        // 파일 추가시
        FilesAdded: (up: Pluploader.Uploader.IUploader, files) => {
          console.log('FilesAdded', files);
          // upload started
          this.uploadStarted.emit();
          // set guide message
          this.uploadGuideMessage = '파일을 업로드 중입니다. 조금만 기다려주세요';
          // upload start
          up.start();
          // disable upload
          up.disableBrowse(true);
        },
        // 프로그레스
        UploadProgress: (up: Pluploader.Uploader.IUploader, file: Pluploader.File.IFile) => {
          this.safelyDetectChanges();
        },
        FileUploaded: (up, file, result: {response: string, status: number, responseHeaders: string}) => {
          // loading hide
          console.log('FileUploaded', file);
          this.uploadResult = {file: file, response: result.response, status: result.status, headers: result.responseHeaders}
        },

        UploadComplete: (up, files) => {
          // enable upload
          up.disableBrowse(false);
          this.uploadResult.file.isUploading = false;
          this.uploadResult.file.isComplete = true;
          this.safelyDetectChanges();
          this.uploadComplete.emit(this.uploadResult);
        },

        Error: (up, err) => {
          // enable upload
          up.disableBrowse(false);
          // set upload error
          this.uploadResult.file.isCanceled = true;
          this.uploadResult.file.isUploading = false;
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
        }
      })
      .build());
  }

  private _initUploader(): void {
    this._chunkUploader = this._getCreatedUploader(this._dropContainer.nativeElement, this._pickFiles.nativeElement);
    this._chunkUploader.init();
  }
}
