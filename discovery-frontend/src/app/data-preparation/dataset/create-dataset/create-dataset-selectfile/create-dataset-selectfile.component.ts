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

import { Component, ElementRef, Injector, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractPopupComponent } from '../../../../common/component/abstract-popup.component';
import { PopupService } from '../../../../common/service/popup.service';
import { FileLikeObject, FileUploader } from 'ng2-file-upload';
import { CommonConstant } from '../../../../common/constant/common.constant';
import { CookieService } from 'ng2-cookies';
import { CookieConstant } from '../../../../common/constant/cookie.constant';
import { DatasetFile } from '../../../../domain/data-preparation/dataset';
import { Alert } from '../../../../common/util/alert.util';
import { PreparationAlert } from '../../../util/preparation-alert.util';
import { isUndefined } from 'util';
import { DatasetService } from '../../service/dataset.service';

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

  public allowFileType: string[] = ['text/csv'];

  @ViewChild('fileUpload')
  private fileUpload: ElementRef;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private popupService: PopupService,
              private datasetService: DatasetService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);

    this.uploader = new FileUploader(
      {
        url: CommonConstant.API_CONSTANT.API_URL + 'preparationdatasets/upload',
        // allowedFileType: this.allowFileType
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
      let ext = item.file.name.split('.')[1];
      if( ext !== 'csv' && false==ext.startsWith('xls') ) { // 윈도우에서 타입으로 파일 체크 불가 그래서 이름으로 ..
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
      const that: any = this;
      if (this.uploadResult && this.uploadResult.success) { // file upload 성공
        let _success = false;
        if (this.uploadResult.response) {
          let resp = JSON.parse(this.uploadResult.response);
          if(resp && true==resp.success) {
            _success = true;
          }
        }
        if(true==_success) {
          this.getDataFile();
        } else {
          Alert.error(this.translateService.instant('msg.dp.alert.file.format.wrong'));
        }
      }
      this.loadingHide();
    };

  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();
  }

  // change 이벤트 처리
  public ngOnChanges(changes: SimpleChanges) {

  }

  // Destory
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();

    // 이벤트도 해제 되겠지?
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
    super.close();

    this.popupService.notiPopup({
      name: 'close-create',
      data: null
    });
  }

// 업로드 한 파일 조회
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
    /*
    this.loadingShow();
    if (isUndefined(this.datasetFile.sheets)) {
      // csv
      this.datasetService.getDatasetCSVFile(this.datasetFile).then((result) => {
        this.datasetFile.totalLines = result.totalRows;
        this.datasetFile.totalBytes = result.totalBytes;
        this.loadingHide();
        if (result.success === false) {
          Alert.warning(this.translateService.instant('msg.dp.alert.file.format.wrong'));
          return;
        }
      })
        .catch((error) => {
                this.loadingHide();
                let prep_error = this.dataprepExceptionHandler(error);
                PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        });
    } else if (this.datasetFile.sheets.length === 0) {
      // csv
      this.datasetService.getDatasetCSVFile(this.datasetFile).then((result) => {
        this.datasetFile.totalLines = result.totalRows;
        this.datasetFile.totalBytes = result.totalBytes;
        this.loadingHide();
        if (result.success === false) {
          Alert.warning(this.translateService.instant('msg.dp.alert.file.format.wrong'));
          return;
        }
      })
        .catch((error) => {
                this.loadingHide();
                let prep_error = this.dataprepExceptionHandler(error);
                PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        });
    } else {
      // excel
      this.datasetService.getDatasetExcelFile(this.datasetFile).then((result) => {
        this.datasetFile.totalLines = result.totalRows;
        this.datasetFile.totalBytes = result.totalBytes;
        this.loadingHide();
        if (result.success === false) {
          Alert.warning(this.translateService.instant('msg.dp.alert.file.format.wrong'));
          this.datasetFile = null;
          this.datasetFile = new DatasetFile();
          return;
        }

      })
        .catch((error) => {
                this.loadingHide();
                let prep_error = this.dataprepExceptionHandler(error);
                PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        });
    }
    */

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
