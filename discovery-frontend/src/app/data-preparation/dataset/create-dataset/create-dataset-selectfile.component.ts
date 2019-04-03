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

import {ChangeDetectorRef, Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractPopupComponent} from '../../../common/component/abstract-popup.component';
import {PopupService} from '../../../common/service/popup.service';
import {CommonConstant} from '../../../common/constant/common.constant';
import {CookieConstant} from '../../../common/constant/cookie.constant';
import {FileFormat, PrDatasetFile, StorageType} from '../../../domain/data-preparation/pr-dataset';
import {isUndefined} from 'util';
import {DatasetService} from "../service/dataset.service";
import {DeleteModalComponent} from '../../../common/component/modal/delete/delete.component';
import {Modal} from '../../../common/domain/modal';
import {PreparationCommonUtil} from "../../util/preparation-common.util";
import * as _ from 'lodash';

declare let plupload: any;

export class UploadNegotitationParameters {
  public limit_size:number = 0;
  public storage_types: string[] = [];
  public timestamp: number = 0 ;
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
  private drop_container: ElementRef;

  @ViewChild('pickfiles2')
  private pickfiles2: ElementRef;

  @ViewChild('drop_container2')
  private drop_container2: ElementRef;

  @ViewChild(DeleteModalComponent)
  public deleteModalComponent: DeleteModalComponent;

  private _isFileAdded : boolean = false;
  private _isFileAddedInterval : any;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public datasetFiles: any;

  // file uploader
  public chunk_uploader: any;
  public chunk_uploader2: any;

  public uploadNegoParams: UploadNegotitationParameters;

  public isUploading : boolean = false;

  public changeDetect: ChangeDetectorRef;

  public fileLocations: any[];
  public fileLocation: string;
  public fileLocationDefaultIdx : number = 0;

  public limitSize : number;

  public upFiles : any[];

  public sucessFileCount : number = 0;
  public supportedFileCount : number = 0;
  public unsupportedFileCount : number = 0;
  public unsupportedFileView : boolean = false;
  public isNext : boolean = false;

  public preparationUtil = PreparationCommonUtil;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasetService: DatasetService,
              private popupService: PopupService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    super.ngOnInit();

    this.upFiles = [];

    this.datasetService.getFileUploadNegotiation().then((params) => {
      this.loadingHide();

      this.uploadNegoParams = JSON.parse(JSON.stringify(params)); // deep copy for negotiation parameters

      this.fileLocations = [];
      if(this.uploadNegoParams.storage_types && this.uploadNegoParams.storage_types.length > 0){
        this.uploadNegoParams.storage_types.forEach((storage_type)=>{
          // FIXME: The storage type is currently LOCAL.
          //if( storage_type === 'LOCAL' )
            this.fileLocations.push( { 'value': storage_type, 'label': storage_type } );
        })
      } else {
        this.fileLocations.push( { 'value': 'LOCAL', 'label': 'LOCAL' } );
      }

      let idx = this.fileLocations.findIndex((item) => {
        return item.value.toUpperCase() === 'LOCAL';
      });
      if (idx == -1) idx = 0;
      this.fileLocationDefaultIdx = idx;
      this.fileLocation = this.fileLocations[idx].value;

      this.limitSize = this.uploadNegoParams.limit_size;

      this.initPlupload();
    }).catch((reason) => {
      console.log(reason);
    });

  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    this.chunk_uploader = null;

    clearInterval(this._isFileAddedInterval);
    this._isFileAddedInterval = null;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public initPlupload() {

    this.chunk_uploader = new plupload.Uploader({
      runtimes : 'html5,html4',
      chunk_size: '0',
      browse_button : this.pickfiles.nativeElement,
      drop_element : this.drop_container.nativeElement,
      url : CommonConstant.API_CONSTANT.API_URL + 'preparationdatasets/file_upload',
      headers:{
        'Accept': 'application/json, text/plain, */*',
        'Authorization': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
      },

      filters : {
        max_file_size : 0,
        prevent_duplicate: true,
        mime_types: [
          {title: "Datapreparation files", extensions: "csv,txt,xls,xlsx,json"}
        ],

      },

      multipart_params: {
        storage_type: '',
        upload_id: '',
        chunk_size: '',
        total_size : ''
      },

      init: {
        PostInit: () => {
          for ( let item in this.chunk_uploader.settings.multipart_params){
            this.chunk_uploader.settings.multipart_params[item] = ''
          }
        },

        // QueueChanged: (up)=>{
        // },

        FilesAdded: (up, files) => {
          this.isNext = false;

          this.chunk_uploader.setOption('chunk_size', this.limitSize );

          plupload.each(files, (file, idx) => {
            this.chunk_uploader.settings.multipart_params.upload_id = null;
            this.chunk_uploader.settings.multipart_params.chunk_size = null;
            this.chunk_uploader.settings.multipart_params.total_size = null;

            file.uploaderNo = 1;
            file.upload_id = null;
            file.isUploaded = false;
            file.isUploading = false;
            file.isCanceled = false;
            file.isFailed = false;
            file.total_chunks = 0;
            file.uploading_chunks = 0;
            file.succeeded_chunks = 0;
            file.failed_chunks = 0;
            file.progressPercent = 0;
            file.storage_type = ('LOCAL' === this.fileLocation? 'Local': this.fileLocation);

            let tmp = PreparationCommonUtil.getFileNameAndExtension(file.name);

            file.fileName = tmp[0];
            file.fileExtension = tmp[1];
            file.response = null;

            this.datasetService.getFileUploadNegotiation().then((params) => {
              this.uploadNegoParams = JSON.parse(JSON.stringify(params));
              file.upload_id = this.uploadNegoParams.upload_id;

              this.supportedFileCount++;
              this.changeDetect.detectChanges();
            });
          });

          files.forEach((file)=>{ this.upFiles.push(file); });
          this._isFileAddedCheck(1);
        },

        UploadProgress: (up, file) => {
          let idx = this.upFiles.findIndex((upFile)=>{ return upFile.id === file.id});
          this.upFiles[idx].progressPercent = file.percent;

          this.changeDetect.detectChanges();
        },

        BeforeUpload: (up, file)=>{
          this.chunk_uploader.settings.multipart_params.upload_id = file.upload_id;
          this.chunk_uploader.settings.multipart_params.chunk_size = this.limitSize;
          this.chunk_uploader.settings.multipart_params.total_size = file.size;

          this.chunk_uploader.settings.multipart_params.storage_type = this.fileLocation;

          this.changeDetect.detectChanges();
        },

        UploadFile: (up,file)=>{
          this.changeDetect.detectChanges();
        },

        FileUploaded: (up, file, info)=>{
          let response = JSON.parse(info.response);

          this.isUploading = false;
          file.isUploading = false;

          file.response = response;
          if( response.chunkIdx == 0 ) {
            file.uploading_chunks--;

            if( response.success==true ) {
              file.succeeded_chunks++;
            } else {
              file.failed_chunks++;
            }
          }

          if( file.succeeded_chunks == file.total_chunks ){
            file.isUploaded = true;
            file.storedUri = response.storedUri;
            this.sucessFileCount++;
          } else {
            file.isUploaded = false;
            file.storedUri = '';
          }

          let idx = this.upFiles.findIndex((upFile)=>{ return upFile.id === file.id});
          this.upFiles[idx].response = file.response;
          this.upFiles[idx].uploading_chunks = file.uploading_chunks;
          this.upFiles[idx].succeeded_chunks = file.succeeded_chunks;
          this.upFiles[idx].failed_chunks = file.failed_chunks;
          this.upFiles[idx].isUploading = file.isUploading;
          this.upFiles[idx].isUploaded = file.isUploaded;
          this.upFiles[idx].storedUri = file.storedUri;
          this.changeDetect.detectChanges();
        },

        BeforeChunkUpload: (up, file, result)=>{
          this.isUploading = true;

          file.total_chunks++;
          file.uploading_chunks++;
          file.isUploading = true;

          let idx = this.upFiles.findIndex((upFile)=>{ return upFile.id === file.id});
          this.upFiles[idx].total_chunks = file.total_chunks;
          this.upFiles[idx].uploading_chunks = file.uploading_chunks;
          this.upFiles[idx].isUploading = file.isUploading;

          this.changeDetect.detectChanges();
        },

        ChunkUploaded: (up, file, info)=>{
          let response = JSON.parse(info.response);

          this.isUploading = true;

          file.isUploading = true;
          file.uploading_chunks--;
          if( response.success==true ) {
            file.succeeded_chunks++;
          } else {
            file.failed_chunks++;
          }

          let idx = this.upFiles.findIndex((upFile)=>{ return upFile.id === file.id});
          this.upFiles[idx].isUploading = file.isUploading;
          this.upFiles[idx].uploading_chunks = file.uploading_chunks;
          this.upFiles[idx].succeeded_chunks = file.succeeded_chunks;
          this.upFiles[idx].failed_chunks = file.failed_chunks;

          this.changeDetect.detectChanges();
        },

        UploadComplete: (up, files) => {
          this.isUploading = false;
          this.fileUploadComplete(1);
          this.changeDetect.detectChanges();
        },

        /* error define
        -100 GENERIC_ERROR
        -200 HTTP_ERROR
        -300 IO_ERROR
        -400 SECURITY_ERROR
        -500 INIT_ERROR
        -600 FILE_SIZE_ERROR
        -601 FILE_EXTENSION_ERROR
        -602 FILE_DUPLICATE_ERROR
        -701 MEMORY_ERROR
         */
        Error: (up, err) => {
          switch (err.code){
            case -601:
              this.unsupportedFileCount++;
              this.unsupportedFileView = true;
              this._unsupportedFileView();
              //Alert.error(this.translateService.instant('msg.dp.alert.file.format.wrong'));
              break;
            case -100:
              console.log('GENERIC_ERROR', err);
              break;
            case -200:
              console.log('HTTP_ERROR', err);
              break;
            case -300:
              console.log('IO_ERROR', err);
              break;
            default:
              console.log('unknow error', err);
              break;
          }
        }
      }
    });
    this.chunk_uploader.init();

    this.chunk_uploader2 = new plupload.Uploader({
      runtimes : 'html5,html4',
      chunk_size: '0',
      browse_button : this.pickfiles2.nativeElement,
      drop_element : this.drop_container2.nativeElement,
      url : CommonConstant.API_CONSTANT.API_URL + 'preparationdatasets/file_upload',
      headers:{
        'Accept': 'application/json, text/plain, */*',
        'Authorization': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
      },

      filters : {
        max_file_size : 0,
        prevent_duplicate: true,
        mime_types: [
          {title: "Datapreparation files", extensions: "csv,txt,xls,xlsx,json"}
        ],

      },

      multipart_params: {
        storage_type: '',
        upload_id: '',
        chunk_size: '',
        total_size : ''
      },

      init: {
        PostInit: () => {
          for ( let item in this.chunk_uploader2.settings.multipart_params){
            this.chunk_uploader2.settings.multipart_params[item] = ''
          }
        },

        // QueueChanged: (up)=>{
        // },

        FilesAdded: (up, files) => {
          this.isNext = false;

          if(this.isUploading) {
            this.chunk_uploader2.disableBrowse(true);

            plupload.each(files, (file, idx) => {
              if(file.status != plupload.UPLOADING){
                this.chunk_uploader2.removeFile(file);
              }
            });

            //Alert.warning('Can not add files during file upload.');
            return;
          }

          this.chunk_uploader2.setOption('chunk_size', this.limitSize );
          plupload.each(files, (file, idx) => {
            this.chunk_uploader2.settings.multipart_params.upload_id = null;
            this.chunk_uploader2.settings.multipart_params.chunk_size = null;
            this.chunk_uploader2.settings.multipart_params.total_size = null;

            file.uploaderNo = 2;
            file.upload_id = null;
            file.isUploaded = false;
            file.isUploading = false;
            file.isCanceled = false;
            file.isFailed = false;
            file.total_chunks = 0;
            file.uploading_chunks = 0;
            file.succeeded_chunks = 0;
            file.failed_chunks = 0;
            file.progressPercent = 0;
            file.storage_type = ('LOCAL' === this.fileLocation? 'Local': this.fileLocation);

            let tmp = PreparationCommonUtil.getFileNameAndExtension(file.name);

            file.fileName = tmp[0];
            file.fileExtension = tmp[1];
            file.response = null;

            this.datasetService.getFileUploadNegotiation().then((params) => {
              this.uploadNegoParams = JSON.parse(JSON.stringify(params));
              file.upload_id = this.uploadNegoParams.upload_id;

              this.supportedFileCount++;
              this.changeDetect.detectChanges();
            });
          });

          files.forEach((file)=>{ this.upFiles.push(file); });
          this._isFileAddedCheck(2);
        },

        UploadProgress: (up, file) => {
          let idx = this.upFiles.findIndex((upFile)=>{ return upFile.id === file.id});
          this.upFiles[idx].progressPercent = file.percent;

          this.changeDetect.detectChanges();
        },

        BeforeUpload: (up, file)=>{
          this.chunk_uploader2.settings.multipart_params.upload_id = file.upload_id;
          this.chunk_uploader2.settings.multipart_params.chunk_size = this.limitSize;
          this.chunk_uploader2.settings.multipart_params.total_size = file.size;

          this.chunk_uploader2.settings.multipart_params.storage_type = this.fileLocation;

          this.changeDetect.detectChanges();
        },

        UploadFile: (up,file)=>{
          this.changeDetect.detectChanges();
        },

        FileUploaded: (up, file, info)=>{
          let response = JSON.parse(info.response);

          this.isUploading = false;
          file.isUploading = false;

          file.response = response;
          if( response.chunkIdx == 0 ) {
            file.uploading_chunks--;

            if( response.success==true ) {
              file.succeeded_chunks++;
            } else {
              file.failed_chunks++;
            }
          }

          if( file.succeeded_chunks == file.total_chunks ){
            file.isUploaded = true;
            file.storedUri = response.storedUri;
            this.sucessFileCount++;
          } else {
            file.isUploaded = false;
            file.storedUri = '';
          }

          let idx = this.upFiles.findIndex((upFile)=>{ return upFile.id === file.id});
          this.upFiles[idx].response = file.response;
          this.upFiles[idx].uploading_chunks = file.uploading_chunks;
          this.upFiles[idx].succeeded_chunks = file.succeeded_chunks;
          this.upFiles[idx].failed_chunks = file.failed_chunks;
          this.upFiles[idx].isUploading = file.isUploading;
          this.upFiles[idx].isUploaded = file.isUploaded;
          this.upFiles[idx].storedUri = file.storedUri;
          this.changeDetect.detectChanges();
        },

        BeforeChunkUpload: (up, file, result)=>{
          this.isUploading = true;

          file.total_chunks++;
          file.uploading_chunks++;
          file.isUploading = true;

          let idx = this.upFiles.findIndex((upFile)=>{ return upFile.id === file.id});
          this.upFiles[idx].total_chunks = file.total_chunks;
          this.upFiles[idx].uploading_chunks = file.uploading_chunks;
          this.upFiles[idx].isUploading = file.isUploading;

          this.changeDetect.detectChanges();
        },

        ChunkUploaded: (up, file, info)=>{
          let response = JSON.parse(info.response);

          this.isUploading = true;

          file.isUploading = true;
          file.uploading_chunks--;
          if( response.success==true ) {
            file.succeeded_chunks++;
          } else {
            file.failed_chunks++;
          }

          let idx = this.upFiles.findIndex((upFile)=>{ return upFile.id === file.id});
          this.upFiles[idx].isUploading = file.isUploading;
          this.upFiles[idx].uploading_chunks = file.uploading_chunks;
          this.upFiles[idx].succeeded_chunks = file.succeeded_chunks;
          this.upFiles[idx].failed_chunks = file.failed_chunks;

          this.changeDetect.detectChanges();
        },

        UploadComplete: (up, files) => {
          this.isUploading = false;
          this.fileUploadComplete(2);
          this.changeDetect.detectChanges();
        },

        /* error define
        -100 GENERIC_ERROR
        -200 HTTP_ERROR
        -300 IO_ERROR
        -400 SECURITY_ERROR
        -500 INIT_ERROR
        -600 FILE_SIZE_ERROR
        -601 FILE_EXTENSION_ERROR
        -602 FILE_DUPLICATE_ERROR
        -701 MEMORY_ERROR
         */
        Error: (up, err) => {
          switch (err.code){
            case -601:
              this.unsupportedFileCount++;
              this.unsupportedFileView = true;
              this._unsupportedFileView();
              //Alert.error(this.translateService.instant('msg.dp.alert.file.format.wrong'));
              break;
            case -100:
              console.log('GENERIC_ERROR', err);
              break;
            case -200:
              console.log('HTTP_ERROR', err);
              break;
            case -300:
              console.log('IO_ERROR', err);
              break;
            default:
              console.log('unknow error', err);
              break;
          }
        }
      }
    });
    this.chunk_uploader2.init();
  }

  /**
   * File Upload Location Selected
   */
  public onSelected(event){
    this.fileLocation = event.value;

    let idx = this.fileLocations.findIndex((item) => {
      return item.value.toUpperCase() === event.value;
    });
    if (idx == -1) idx = 0;
    this.fileLocationDefaultIdx = idx;
  }

  /**
   * File Upload Reset
   */
  public reset(){
    this.sucessFileCount = 0;
    this.supportedFileCount = 0;
    this.unsupportedFileCount = 0;
    this.unsupportedFileView = false;
    this.isNext = false;

    this.chunk_uploader.splice();
    this.chunk_uploader2.splice();
    this.upFiles.splice(0, this.upFiles.length);
    this.datasetFiles.splice(0, this.datasetFiles.length);
  }

  /**
   * File Upload Cancel(Plupload)
   */
  public cancelUpload(file){
    if (file.status == plupload.UPLOADING) {
      let idx = this.upFiles.findIndex((upFile)=>{ return upFile.id === file.id});

      if(file.uploaderNo === 1) {
        this.chunk_uploader.stop();
        this.chunk_uploader.removeFile(file);
        this.upFiles[idx].isUploading = false;
        this.upFiles[idx].isCanceled = true;
        this.chunk_uploader.start();
      } else {
        this.chunk_uploader2.stop();
        this.chunk_uploader2.removeFile(file);
        this.upFiles[idx].isUploading = false;
        this.upFiles[idx].isCanceled = true;
        this.chunk_uploader2.start();
      }
    }
  }

  /**
   * File Upload Start(Plupload)
   */
  public startUpload(pluploadNo:number){
    this.isUploading = true;
    this.chunk_uploader2.disableBrowse(true);

    $('.ddp-list-file-progress').scrollTop(422 * (this.upFiles.length +1));

    if (pluploadNo===1){
      this.chunk_uploader.start();
    } else {
      this.chunk_uploader2.start();
    }
  }

  /**
   * Disable Drag and Drop in File list area
   */
  public disableEvent(event:any){
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  /**
   * Files Upload Complete(Plupload)
   */
  public fileUploadComplete(pluploadNo:number){
    if (this.sucessFileCount < 1 && isUndefined(this.datasetFiles)) {
      console.log('fileUploadComplete : this.sucessFileCount < 1 ');
      return;
    }
    this.datasetFiles.splice(0, this.datasetFiles.length);
    for(let i=0; i< this.upFiles.length ; i++) {
      if (this.upFiles[i].isUploaded === true ){
        let datasetFile = new PrDatasetFile();

        datasetFile.filenameBeforeUpload = this.upFiles[i].name;
        datasetFile.storedUri = this.upFiles[i].storedUri;
        datasetFile.storageType = this._getStorageType(this.fileLocation);

        const fileFormat = PreparationCommonUtil.getFileFormat(this.upFiles[i].fileExtension);
        datasetFile.fileFormat = !_.isNil(fileFormat) ? fileFormat : FileFormat.CSV;

        datasetFile.delimiter = FileFormat.CSV || datasetFile.fileFormat === FileFormat.EXCEL ? ',' : null;

        datasetFile.fileName = this.upFiles[i].fileName;
        datasetFile.fileExtension = this.upFiles[i].fileExtension;

        this.datasetFiles.push(datasetFile);
      }
    }
    this.isNext = ( !this.isUploading && this.sucessFileCount > 0) ;

    if(pluploadNo === 1){
      this.chunk_uploader.splice();
    }else{
      this.chunk_uploader2.splice();
    }

    this.chunk_uploader2.disableBrowse(false);
  }

  /**
   * Next (select sheet)
   */
  public next() {
    if ( this.isUploading || this.sucessFileCount < 1 || isUndefined(this.datasetFiles[0].filenameBeforeUpload) ){
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
  public closeCheck(){
    if(this.isUploading){

      event.stopPropagation();
      this.chunk_uploader.stop();

      const modal = new Modal();
      modal.isShowCancel = true;
      modal.name = this.translateService.instant('msg.dp.ui.file.upload.cancel.title');
      modal.description = this.translateService.instant('msg.dp.ui.file.upload.cancel.description');
      //modal.subDescription = '';

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

    this.chunk_uploader.stop();

    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });
  }

  /**
   * Cancel and Close on Uploading
   */
  public confirmClose(){
    this.close();
  }
  /**
   * Upload Continue on Uploading
   */
  public cancelClose(){
    this.chunk_uploader.start();
  }
  /**
   * Show formatBytes
   */
  public formatBytes(a,b) { // a=크기 , b=소숫점자릿
    if(0==a) return "0 Bytes";
    let c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));
    return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * File Attach Check(Plupload)
   */
  private _isFileAddedCheck(pluploadNo:number){
    this._isFileAddedInterval = setInterval(()=>{
      for(let i=0; i< this.upFiles.length ; i++) {
        if (this.upFiles.length == i + 1 && this.upFiles[i].upload_id != null ) {
          this._isFileAdded = true;

          clearInterval(this._isFileAddedInterval);
          this._isFileAddedInterval = null;
          this.startUpload(pluploadNo);
        }
      }
    }, 1000);
  }

  /**
   * Unsupported File Wanning
   */
  private _unsupportedFileView(){
    if (this.unsupportedFileView) {
      setTimeout(() => {
        this.unsupportedFileView = false;
      }, 3000);
    }
  }

  private _getStorageType(location){
    for (let sType in StorageType) {
      if (StorageType[sType] == location) {
        let enumType :StorageType = StorageType["" + sType];
        return enumType;
      }
    }
    return StorageType.LOCAL;
  }

}

