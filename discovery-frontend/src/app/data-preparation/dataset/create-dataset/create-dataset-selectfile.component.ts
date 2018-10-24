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
import { FileLikeObject, FileUploader } from 'ng2-file-upload';
import { CommonConstant } from '../../../common/constant/common.constant';
import { CookieConstant } from '../../../common/constant/cookie.constant';
import { DatasetFile } from '../../../domain/data-preparation/dataset';
import { Alert } from '../../../common/util/alert.util';
import { isUndefined } from 'util';
import { DatasetService } from "../service/dataset.service";

@Component({
  selector: 'app-create-dataset-selectfile',
  templateUrl: './create-dataset-selectfile.component.html',
})
export class CreateDatasetSelectfileComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input()
  public datasetFile: DatasetFile;

  // 파일 업로드
  public uploader: FileUploader;

  // 파일 업로드 결과
  public uploadResult;

  @ViewChild('fileUpload')
  private fileUpload: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private datasetService : DatasetService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

    this.uploader = new FileUploader(
      {
        url: CommonConstant.API_CONSTANT.API_URL + 'preparationdatasets/upload',
      }
    );

    // 옵션 설정
    this.uploader.setOptions({
      url: CommonConstant.API_CONSTANT.API_URL
      + 'preparationdatasets/upload',
      headers: [
        { name: 'Accept', value: 'application/json, text/plain, */*' },
        {
          name: 'Authorization',
          value: this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
        }
      ],
    });

    // add 가 처음
    this.uploader.onAfterAddingFile = (item) => {
      this.loadingShow();
      if(!new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).test( item.file.name )) { // check file extension
        this.uploader.clearQueue();
        this.fileUpload.nativeElement.value = ''; // 같은 파일은 연속으로 올리면 잡지 못해서 초기화
        Alert.error(this.translateService.instant('msg.dp.alert.file.format.wrong'));
        this.loadingHide();
      } else{
        this.uploader.uploadAll();
      }
    };

    // add 할때 에러난다면
    this.uploader.onWhenAddingFileFailed = (item: FileLikeObject, filter: any, options: any) => {
      Alert.error(item.name + this.translateService.instant('msg.dp.alert.file.format.wrong'));
    };

    // 업로드 전 ..
    this.uploader.onBeforeUploadItem = (item) => {
      item.method = 'POST';
    };

    // 업로드 성공
    this.uploader.onSuccessItem = (item, response, status, headers) => {
      const success = true;
      this.uploadResult = { success, item, response, status, headers };
    };

    // 업로드 하고 에러났을때
    this.uploader.onErrorItem = (item, response, status, headers) => {
      Alert.error(this.translateService.instant('msg.dp.alert.file.format.wrong'));
      this.loadingHide();
    };

    // 마지막
    this.uploader.onCompleteAll = () => {
      this.loadingHide();
      let res = JSON.parse(this.uploadResult.response);
      if (res.success !== false) {
        this.getDataFile();
      } else {
        Alert.error(this.translateService.instant('Failed to upload. Please select another file'));
        return;
      }
    };

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    super.ngOnInit();
  }


  public ngOnDestroy() {
    super.ngOnDestroy();
    this.uploader = null;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public next() {
    if (!isUndefined(this.datasetFile.filename)) {
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

    const response: any = JSON.parse(this.uploadResult.response);
    this.datasetFile.filename = response.filename;
    this.datasetFile.filepath = response.filepath;
    this.datasetFile.sheets = response.sheets;
    if (response.sheets && response.sheets.length > 0) {
      this.datasetFile.sheetname = response.sheets[0];
    }
    this.datasetFile.filekey = response.filekey;

    if (!isUndefined(this.datasetFile.filename)) {
      this.popupService.notiPopup({
        name: 'select-sheet',
        data: null
      });

    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


}
