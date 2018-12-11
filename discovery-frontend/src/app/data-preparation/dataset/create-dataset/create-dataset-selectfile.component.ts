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

import { Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { PopupService } from '../../../common/service/popup.service';
import { CommonConstant } from '../../../common/constant/common.constant';
import { CookieConstant } from '../../../common/constant/cookie.constant';
//import { DatasetFile } from '../../../domain/data-preparation/dataset';
import { PrDatasetFile } from '../../../domain/data-preparation/pr-dataset';
import { Alert } from '../../../common/util/alert.util';
import { isUndefined } from 'util';
import { DatasetService } from "../service/dataset.service";

declare let plupload: any;

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

  private interval : any;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  @Input()
  //public datasetFile: DatasetFile;
  public datasetFile: PrDatasetFile;

  // file uploade result
  public uploadResult;

  // file uploader
  public chunk_uploader: any;

  private isUploadCancel :boolean = false;
  public progressbarWidth: string = '100%';
  public progressPercent : number = 0;
  public isUploading : boolean = false;

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

    this.initPlupload();
  }


  public ngOnDestroy() {
    super.ngOnDestroy();
    //this.uploader = null;

    this.chunk_uploader = null;

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public cancelClick(param:boolean){
    let elm = $('.ddp-wrap-progress');
    if (param) {
      if(this.progressPercent === 100) {
        Alert.info('Generating completed');
        this.isUploadCancel = false;
        this.chunk_uploader.start();
        this.isUploading = false;

      } else {
        this.isUploadCancel = true;
        this.chunk_uploader.stop();
        elm[0].style.display = "none";
        elm[1].style.display = "";
      }
    } else {
      this.isUploadCancel = false;
      this.chunk_uploader.start();
      elm[0].style.display = "";
      elm[1].style.display = "none";
    }
  }

  public cancelUpload(){
    this.isUploadCancel = true;
    this.chunk_uploader.stop();
    this.chunk_uploader.start();
    this.isUploadCancel = false;
    this.isUploading = false;
  }
  public startUpload(){
    this.isUploading = true;
    this.isUploadCancel = false;
    this.chunk_uploader.start();
  }

  public initPlupload() {
    this.chunk_uploader = new plupload.Uploader({
      runtimes : 'html5,html4',
      chunk_size: '0',
      browse_button : this.pickfiles.nativeElement,
      drop_element : this.drop_container.nativeElement,
      url : CommonConstant.API_CONSTANT.API_URL + 'preparationdatasets/upload_async',
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
        file_key : '',
        upload_target: '',
        total_size : ''
      },
      init: {
        PostInit: () => {
          for ( let idx in this.chunk_uploader.settings.multipart_params){
            this.chunk_uploader.settings.multipart_params[idx] = ''
          };
        },

        FilesAdded: (up, files) => {
          if (files && files.length > 1){
            plupload.each(files, (file) => {
              up.removeFile(file);
            });
            Alert.error('Only one file can be uploaded.');
          } else {
            plupload.each(files, (file) => {
              this.chunk_uploader.settings.multipart_params.total_size = file.size;

              // get and set file_key, chunk_size, upload_target

              this.chunk_uploader.setOption('chunk_size','0');
              //this.chunk_uploader.settings.multipart_params.file_key = '';
              //this.chunk_uploader.settings.multipart_params.upload_target = '';

            });
            this.startUpload();

          }
        },

        UploadProgress: (up, file) => {
          this.progressPercent = file.percent;
          this.progressbarWidth = file.percent + "%";
          this.drop_container.nativeElement.click();
        },

        // BeforeUpload: (up, file)=>{
        // },

        UploadFile: (up,file)=>{
          if (this.isUploadCancel) {
            up.removeFile(file);
            for ( let idx in this.chunk_uploader.settings.multipart_params){
              this.chunk_uploader.settings.multipart_params[idx] = ''
            };
          }
        },

        FileUploaded: (up, file, info)=>{
          this.isUploading = false;

          const success = true;
          let res = info.response;
          this.uploadResult = { success, res };
          this.checkIfUploaded(res);
        },

        // BeforeChunkUpload: (up, file, args, blob, offset)=>{
        // },
        // ChunkUploaded: (up, file, info)=>{
        // },

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
          this.cancelUpload();
          this.drop_container.nativeElement.click();
          switch (err.code){
            case -601:
              Alert.error(this.translateService.instant('msg.dp.alert.file.format.wrong'));
              break;
            default:
              Alert.error(err.message);
          }
          console.log('error',err);
        }
      }
    });

    this.chunk_uploader.init();
  }

  public next() {
    //if (!isUndefined(this.datasetFile.filename)) {
    if (!isUndefined(this.datasetFile.filenameBeforeUpload)) {
      this.popupService.notiPopup({
        name: 'select-sheet',
        data: null
      });


    }
  }

  public prev() {
    super.close();
    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });

  }

  public close() {

    // Check if came from dataflow
    if (this.datasetService.dataflowId) {
      this.datasetService.dataflowId = undefined;
    }

    super.close();

    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });
  }


  /**
   * Get grid information of file
   */
  public getDataFile() {
    if (isUndefined(this.datasetFile)) {
      return;
    }

    const response: any = this.uploadResult.response;
    /*
    this.datasetFile.filename = response.filename;
    this.datasetFile.filepath = response.filepath;
    this.datasetFile.sheets = response.sheets;
    if (response.sheets && response.sheets.length > 0) {
      this.datasetFile.sheetname = response.sheets[0];
    }
    */
    this.datasetFile.filenameBeforeUpload = response.filenameBeforeUpload;
    this.datasetFile.storedUri = response.storedUri;
    this.datasetFile.sheets = response.sheets;

    //if (!isUndefined(this.datasetFile.filename)) {
    if (!isUndefined(this.datasetFile.storedUri)) {
      this.popupService.notiPopup({
        name: 'select-sheet',
        data: null
      });

      this.drop_container.nativeElement.click();
    }
  }

  /**
   * Check if uploaded
   * @param response
   */
  public checkIfUploaded(response: any) {
    let res = JSON.parse(response);
    //this.fetchUploadStatus(res.filekey);
    this.fetchUploadStatus(res.storedUri);
    this.interval = setInterval(() => {
      //this.fetchUploadStatus(res.filekey);
      this.fetchUploadStatus(res.storedUri);
    }, 1000)
  }

  /**
   * Polling
   * @param {string} fileKey
   */
  //public fetchUploadStatus(fileKey: string) {
  public fetchUploadStatus(storedUri: string) {
    //this.datasetService.checkFileUploadStatus(fileKey).then((result) => {
    this.datasetService.checkFileUploadStatus(storedUri).then((result) => {
      this.loadingHide();

      if (result.state === 'done' && result.success) { // Upload finished
        clearInterval(this.interval);
        this.interval = undefined;
        this.uploadResult.response = result;
        this.getDataFile();
      } else if (result.success === false) { // upload failed
        Alert.error(this.translateService.instant('Failed to upload. Please select another file'));
        clearInterval(this.interval);
        this.interval = undefined;
        return;
      }
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
