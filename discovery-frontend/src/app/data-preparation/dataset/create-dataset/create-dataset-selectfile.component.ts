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
  ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { PopupService } from '../../../common/service/popup.service';
import { CommonConstant } from '../../../common/constant/common.constant';
import { CookieConstant } from '../../../common/constant/cookie.constant';
//import { DatasetFile } from '../../../domain/data-preparation/dataset';
import { PrDatasetFile,StorageType,FileFormat } from '../../../domain/data-preparation/pr-dataset';
import { Alert } from '../../../common/util/alert.util';
import { isUndefined } from 'util';
import { DatasetService } from "../service/dataset.service";
//import {ConfirmModalComponent} from "../../../common/component/modal/confirm/confirm.component";

import {DeleteModalComponent} from '../../../common/component/modal/delete/delete.component';
import {Modal} from '../../../common/domain/modal';
import {PreparationCommonUtil} from "../../util/preparation-common.util";

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

    this.datasetService.getFileUploadNegotiation().then((params) => {
      this.loadingHide();

      this.uploadNegoParams = JSON.parse(JSON.stringify(params)); // deep copy for negotiation parameters

      this.fileLocations = [];
      if(this.uploadNegoParams.storage_types && this.uploadNegoParams.storage_types.length > 0){
        this.uploadNegoParams.storage_types.forEach((storage_type)=>{
          // FIXME: The storage type is currently LOCAL.
          if( storage_type === 'LOCAL' )
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
        QueueChanged: (up)=>{
          //console.log('[QueueChanged] up, upFiles',up,this.upFiles);
        },
        FilesAdded: (up, files) => {
          this.chunk_uploader.setOption('chunk_size', this.limitSize );
          plupload.each(files, (file, idx) => {
            this.chunk_uploader.settings.multipart_params.upload_id = null;
            this.chunk_uploader.settings.multipart_params.chunk_size = null;
            this.chunk_uploader.settings.multipart_params.total_size = null;

            file.uploadIndex = idx;
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

          this.upFiles = files;

          this._isFileAddedCheck();
        },

        UploadProgress: (up, file) => {
          this.upFiles[file.uploadIndex].progressPercent = file.percent;
          //this.drop_container.nativeElement.click();
          this.changeDetect.detectChanges();
        },

        BeforeUpload: (up, file)=>{
          //console.log('[BeforeUpload] ', file.uploadIndex, file.upload_id);

          this.chunk_uploader.settings.multipart_params.upload_id = file.upload_id;
          this.chunk_uploader.settings.multipart_params.chunk_size = this.limitSize;
          this.chunk_uploader.settings.multipart_params.total_size = file.size;

          this.chunk_uploader.settings.multipart_params.storage_type = this.fileLocation;

          //console.log('[BeforeUpload] this.chunk_uploader.settings.multipart_params', this.chunk_uploader.settings.multipart_params);

          //this.drop_container.nativeElement.click();
          this.changeDetect.detectChanges();
        },


        UploadFile: (up,file)=>{
          //this.drop_container.nativeElement.click();
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

          this.upFiles[file.uploadIndex].response = file.response;
          this.upFiles[file.uploadIndex].uploading_chunks = file.uploading_chunks;
          this.upFiles[file.uploadIndex].succeeded_chunks = file.succeeded_chunks;
          this.upFiles[file.uploadIndex].failed_chunks = file.failed_chunks;
          this.upFiles[file.uploadIndex].isUploading = file.isUploading;
          this.upFiles[file.uploadIndex].isUploaded = file.isUploaded;
          this.upFiles[file.uploadIndex].storedUri = file.storedUri;


          //this.drop_container.nativeElement.click();
          this.changeDetect.detectChanges();

        },

        BeforeChunkUpload: (up, file, result)=>{
          this.isUploading = true;

          file.total_chunks++;
          file.uploading_chunks++;
          file.isUploading = true;

          this.upFiles[file.uploadIndex].total_chunks = file.total_chunks;
          this.upFiles[file.uploadIndex].uploading_chunks = file.uploading_chunks;
          this.upFiles[file.uploadIndex].isUploading = file.isUploading;

          //this.drop_container.nativeElement.click();
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

          this.upFiles[file.uploadIndex].isUploading = file.isUploading;
          this.upFiles[file.uploadIndex].uploading_chunks = file.uploading_chunks;
          this.upFiles[file.uploadIndex].succeeded_chunks = file.succeeded_chunks;
          this.upFiles[file.uploadIndex].failed_chunks = file.failed_chunks;

          //this.drop_container.nativeElement.click();
          this.changeDetect.detectChanges();
        },
        UploadComplete: (up, files) => {
          //console.log('[UploadComplete]');
          this.isUploading = false;
          this.fileUploadComplete();
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
  }

  /**
   * File Upload Location Selected
   */
  public onSelected(event){
    this.fileLocation = event.value;
  }

  /**
   * File Upload Cancel(Plupload)
   */
  public cancelUpload(item){
    if (item.status == plupload.UPLOADING) {
      this.chunk_uploader.stop();
      this.chunk_uploader.removeFile(item);
      this.upFiles[item.uploadIndex].isUploading = false;
      this.upFiles[item.uploadIndex].isCanceled = true;
      this.chunk_uploader.start();
    }
  }
  /**
   * File Upload Start(Plupload)
   */
  public startUpload(){
    this.isUploading = true;
    this.chunk_uploader.start();
  }
  /**
   * Files Upload Complete(Plupload)
   */
  public fileUploadComplete(){
    if (this.sucessFileCount < 1 && isUndefined(this.datasetFiles)) {
      console.log('fileUploadComplete : this.sucessFileCount < 1 ');
      return;
    }

    for(let i=0; i< this.upFiles.length ; i++) {
      if (this.upFiles[i].isUploaded === true ){
        let datasetFile = new PrDatasetFile();

        datasetFile.filenameBeforeUpload = this.upFiles[i].name;
        datasetFile.storedUri = this.upFiles[i].storedUri;
        datasetFile.storageType = this._getStorageType(this.fileLocation);
        datasetFile.fileFormat = this._getFileformat(this.upFiles[i].fileExtension);
        if( datasetFile.fileFormat === FileFormat.CSV || datasetFile.fileFormat === FileFormat.EXCEL ) datasetFile.delimiter = ',';
        datasetFile.fileName = this.upFiles[i].fileName;
        datasetFile.fileExtension = this.upFiles[i].fileExtension;

        this.datasetFiles.push(datasetFile);
      }
    }

    this.isNext = ( !this.isUploading && this.sucessFileCount > 0) ;

  }

  /**
   * Next (select sheet)
   */
  public next() {
    if ( this.sucessFileCount < 1 ){
      //Alert.warning('업로드된 파일이 없습니다.');
      return;
    }
    if(this.isUploading){
      //Alert.warning('업로드 중인 파일이 있습니다');
      return;
    }

    //if (!isUndefined(this.datasetFile.filenameBeforeUpload)) {
    if (!isUndefined(this.datasetFiles[0].filenameBeforeUpload)) {
      this.popupService.notiPopup({
        name: 'select-sheet',
        data: null
      });
    }
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
    // Check if came from dataflow
    if (this.datasetService.dataflowId) {
      this.datasetService.dataflowId = undefined;
    }
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
  private _isFileAddedCheck(){
    this._isFileAddedInterval = setInterval(()=>{
      for(let i=0; i< this.upFiles.length ; i++) {
        if (this.upFiles.length == i + 1 && this.upFiles[i].upload_id != null ) {
          this._isFileAdded = true;

          clearInterval(this._isFileAddedInterval);
          this._isFileAddedInterval = null;
          this.startUpload();
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

  private _getFileformat(fileExtension) {
    let fileType : string = fileExtension.toUpperCase();
    if (fileType === 'CSV' || fileType === 'TXT'){
      return FileFormat.CSV;
    } else if (fileType === 'XLSX' || fileType === 'XLS'){
      return FileFormat.EXCEL
    } else if (fileType === 'JSON'){
      return FileFormat.JSON
    }
  }
}

