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

import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatasetFile, DatasetHive, DatasetJdbc } from '../../../domain/data-preparation/dataset';
import { PopupService } from '../../../common/service/popup.service';
import { DatasetService } from '../service/dataset.service';
import { isUndefined } from 'util';
import { StringUtil } from '../../../common/util/string.util';
import { Alert } from '../../../common/util/alert.util';
import { PreparationAlert } from '../../util/preparation-alert.util';

@Component({
  selector: 'app-create-dataset-name',
  templateUrl: './create-dataset-name.component.html'
})
export class CreateDatasetNameComponent extends AbstractPopupComponent implements OnInit, OnDestroy  {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input() // Input from parent component if type is hive
  public datasetHive: DatasetHive;

  @Input() // Input from parent component if type is hive
  public datasetJdbc: DatasetJdbc;

  @Input() // Input from parent component if type if file
  public datasetFile : DatasetFile;

  @Input() // Type of Dataset. [DB,STAGING,FILE]
  public type : string;

  // user input
  public name : string;

  // user input
  public description : string;

  // name error msg show/hide
  public showNameError: boolean = false;

  // desc error msg show/hide
  public showDescError: boolean = false;

  // name error description
  public nameErrorDesc: string = '';

  // error description
  public nameDescErrorDesc: string = '';

  // to check request is only sent once.
  public flag: boolean = false;

  @ViewChild('nameElement')
  public nameElement : ElementRef;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Constructor
  constructor(private popupService: PopupService,
              private datasetService: DatasetService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    // Init
    super.ngOnInit();

    this._setDefaultDatasetName(this.type);

  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /** Complete */
  public complete() {

    if (this.flag === false) {

      // Validation - name is mandatory
      if (isUndefined(this.name) || this.name.trim() ==='' || this.name.length < 1) {
        this.showNameError = true;
        this.nameErrorDesc = this.translateService.instant('msg.dp.alert.name.error');
        return;
      }

      // 이름 validation
      if (this.name.length > 50) {
        this.showNameError = true;
        this.nameErrorDesc = this.translateService.instant('msg.dp.alert.name.error.description');
        return true;
      }

      // 설명 validation
      if (!StringUtil.isEmpty(this.description) && this.description.length > 150) {
        this.showDescError = true;
        this.nameDescErrorDesc = this.translateService.instant('msg.dp.alert.description.error.description');
        return true;
      }
      // 서버에 보낼 이름 설명 앞뒤 공백 제거
      switch(this.type) {
        case 'FILE':
          this.datasetFile.name = this.name.trim();
          break;
        case 'STAGING':
          this.datasetHive.dsName = this.name.trim();
          break;
        case 'DB':
          this.datasetJdbc.dsName = this.name.trim();
          break;
      }
      if (!isUndefined(this.description) && this.description.trim() !== '') {
        switch(this.type) {
          case 'FILE':
            this.datasetFile.desc = this.description.trim();
            break;
          case 'STAGING':
            this.datasetHive.dsDesc = this.description.trim()
            break;
          case 'DB':
            this.datasetJdbc.dsDesc = this.description.trim()
            break;
        }
      }

      this.loadingShow();
      this.flag = true;
      // 데이터 저장 서비스호출
      if(this.type === 'STAGING')  {
        this.datasetService.createDatasetHive(this.datasetHive).then((result) => {
          this.loadingHide();
          this.successAction(result);

        }).catch((error) => {
          this.loadingHide();
          this.errorAction(error);
        });
      } else if (this.type === 'FILE') {
        this.datasetService.createDataset(this.datasetFile,this.datasetFile.delimiter).then((result) => {
          this.loadingHide();
          this.successAction(result);

        }).catch((error) => {
          this.loadingHide();
          this.errorAction(error);
        });
      } else if(this.type === 'DB')  {
        this.datasetService.createDatasetJdbc(this.datasetJdbc).then((result) => {
          this.loadingHide();
          this.successAction(result);

        }).catch((error) => {
          this.loadingHide();
          this.errorAction(error);
        });
      }
    }
  }

  /** go to previous step */
  public prev() {

    if (this.type === 'FILE') {
      this.popupService.notiPopup({
        name: 'select-sheet',
        data: null
      });
    } else if (this.type === 'STAGING') {
      this.popupService.notiPopup({
        name: 'create-dataset-staging-selectdata',
        data: null
      });
    } else if (this.type === 'DB') {
      this.popupService.notiPopup({
        name: 'create-db-query',
        data: null
      });
    }
  }
  /** close popup */
  public close() {
    super.close();

    // Check if came from dataflow
    if (this.datasetService.dataflowId) {
      this.datasetService.dataflowId = undefined;
    }

    this.popupService.notiPopup({
      name: 'close-dataset-create',
      data: null
    });
  }

  /** show/hide error msg */
  public hideNameError() {
    if (isUndefined(this.name) || this.name.length > 0 || this.name.length < 50) {
      this.showNameError = false;
      this.nameErrorDesc = '';

    }
  }

  /** show/hide error msg */
  public hideDescError() {
    if (isUndefined(this.description) || this.description.length < 150) {
      this.showDescError = false;
      this.nameDescErrorDesc = '';
    }
  }

  public successAction(result) {
    this.flag = false;
    Alert.success(this.translateService.instant('msg.dp.alert.create-ds.success',{value:result.dsName}));

    if (this.datasetService.dataflowId) {
      sessionStorage.setItem('DATASET_ID', result.dsId);
      this.router.navigate(['/management/datapreparation/dataflow/' + this.datasetService.dataflowId]);
    }

    this.close();
    this.popupService.notiPopup({
      name: 'complete-dataset-create',
      data: null
    });

  }

  public errorAction(error) {
    this.flag = false;

    this.loadingHide();
    let prep_error = this.dataprepExceptionHandler(error);
    PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * 데이터셋 이름의 default값을 넣는다.
   * @param {string} type
   * @private
   */
  private _setDefaultDatasetName(type : string) : void {

    if ('FILE' === type) {
      let file = new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).exec(this.datasetFile.filename);
      let extension = file[1];
      let fileName = file[0].split('.' + extension)[0];

      if(extension.toUpperCase() === 'XLSX' || extension.toUpperCase() === 'XLS') {
        this.name = `${fileName} - ${this.datasetFile.sheetname} (EXCEL)`;
      } else if(extension.toUpperCase() === 'CSV') {
        this.name = `${fileName} (CSV)`;
      }
    } else if ('DB' === type) {
      if( !isUndefined(this.datasetJdbc.dataconnection.connection) ) {
        if (this.datasetJdbc.tableName){
          this.name = this.datasetJdbc.tableName +' ('+this.datasetJdbc.dataconnection.connection.implementor+')';
        }
      } else {
        this.name = this.datasetJdbc.tableName;
      }
    } else if ('STAGING' === type) {
      this.name = `${this.datasetHive.tableName} (STAGING)`;
    }

    setTimeout(() => { this.nameElement.nativeElement.select(); });
  } // function - _setDefaultDatasetName

}
