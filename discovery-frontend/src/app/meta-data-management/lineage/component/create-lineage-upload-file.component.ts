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

import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Input, Output, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractPopupComponent} from '../../../common/component/abstract-popup.component';
import {PopupService} from '../../../common/service/popup.service';
import {CommonConstant} from '../../../common/constant/common.constant';
import {CookieConstant} from '../../../common/constant/cookie.constant';
import {isUndefined} from 'util';
import {DeleteModalComponent} from '../../../common/component/modal/delete/delete.component';
import {Modal} from '../../../common/domain/modal';
import * as _ from 'lodash';
import {Alert} from "../../../common/util/alert.util";
import {LineageService} from '../service/lineage.service';

declare let plupload: any;

@Component({
  selector: 'app-create-lineage-upload-file',
  templateUrl: './create-lineage-upload-file.component.html',
})
export class CreateLineageUploadFileComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @ViewChild('pickfiles')
  private pickfiles: ElementRef;

  @ViewChild('drop_container')
  private drop_container: ElementRef;

  public unsupportedFileView: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public lineageData: any;

  @Output()
  public lineageDataChange = new EventEmitter();

  // file uploader
  public chunk_uploader: any;

  public changeDetect: ChangeDetectorRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor( private popupService: PopupService,
              private _lineageService: LineageService,
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
    this.chunk_uploader = null;
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
      url : CommonConstant.API_CONSTANT.API_URL + 'metadatas/lineages/file_upload',
      headers:{
        'Accept': 'application/json, text/plain, */*',
        'Authorization': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
      },

      filters : {
        max_file_size : 0,
        prevent_duplicate: true,
        mime_types: [
          {title: "Lineage Edge files", extensions: "csv,txt"}
        ],

      },

      init: {
        PostInit: () => {
        },

        FilesAdded: (up, files) => {
          this.lineageData = null;
          this.startUpload();
        },

        FileUploaded: (up, file, info)=>{
          var response = JSON.parse(info.response);
          if( true===response.hasOwnProperty('storedUri') ) {
            this.getLineageData(response);
          }
        },

        UploadComplete: (up, files) => {
          this.next();
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
              //Alert.error(this.translateService.instant('format.wrong'));
              break;
            case -100:
              console.log('GENERIC_ERROR', err);
              break;
            case -200:
              console.log('HTTP_ERROR', err);
              if (err.response) {
                const res = JSON.parse(err.response);
                Alert.error(this.translateService.instant(res.message));
              }
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
   * File Upload Cancel(Plupload)
   */
  public cancelUpload(file){
    if (file.status == plupload.UPLOADING) {
        this.chunk_uploader.stop();
        this.chunk_uploader.removeFile(file);
        this.chunk_uploader.start();
    }
  }

  /**
   * File Upload Start(Plupload)
   */
  public startUpload(){
      this.chunk_uploader.start();
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
   * Next (confirm file)
   */
  public next() {
    if(this.lineageData) {
      this.popupService.notiPopup({
        name: 'confirm-grid',
        data: null
      });
    }
  }

  /**
   * Close Imported Popup
   */
  public close() {

    super.close();

    this.chunk_uploader.stop();

    this.popupService.notiPopup({
      name: 'close',
      data: null
    });
  }

  public getLineageData( params : any ) {
    this.loadingShow();

    this._lineageService.getLineageFile(params).then((result) => {
      this.loadingHide();

      var headerRow = null;
      var header = null;
      var rows = [];
      var gridResponse = result.gridResponses[0];
      gridResponse.rows.forEach( (item) => {
        if(headerRow==null) {
          headerRow = item.objCols;
          header = item.objCols.filter( (k) => k );
        } else {
          var row = {};
          header.forEach( (k) => {
            var idx = headerRow.indexOf(k);
            row[k] = item.objCols[idx];
          });
          rows.push(row);
        }
      });
      this.lineageData = {};
      this.lineageData['header'] = header;
      this.lineageData['rows'] = rows;

      this.lineageDataChange.emit(this.lineageData);
      this.changeDetect.detectChanges();

    }).catch((error) => {
      this.loadingHide();
      this.commonExceptionHandler(error);
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

}

