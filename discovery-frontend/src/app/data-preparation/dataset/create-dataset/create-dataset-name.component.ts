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
import {isNullOrUndefined, isUndefined} from 'util';
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

  @Input() // Input from parent component if type is STAGING
  public datasetHive: DatasetHive;

  @Input() // Input from parent component if type is DB
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

  public datasetInfo : DatasetInfo[] = [];
  public fileExtension: string;


  // TODO : multisheet (separated from single but need to combine it not DRY at all)
  public isMultiSheet: boolean = false;
  public sheetInfos: any;
  public names : string [] = [];
  public descriptions : string [] = [];
  public nameErrors: string[] = [];
  public descriptionErrors: string[] = [];
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

    super.ngOnInit();

    this._setDefaultDatasetName(this.type);
    this._setDatasetInfo();

  }

  // Destroy
  public ngOnDestroy() {

    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public isBtnDisabled() : boolean {

    let result: boolean = false;

    if (!this.isMultiSheet) {
      result = (this.showNameError || this.showDescError)
    } else {
      let name = this.nameErrors.findIndex((item) => {
        return item !== ''
      });

      if (name === -1) {
        let desc = this.descriptionErrors.findIndex((item) => {
          return item !== ''
        });

        if (desc !== -1) {
          result = true;
        }
      } else {
        result = true;
      }
    }
    return result;
  }

  /**
   * Create dataset
   * When done button is clicked
   */
  public complete() {


    if (this.flag === false) {

      if (!this.isMultiSheet) { // CSV, Staging DB, JDBC, Excel(one sheet)

        // TODO : refactoring mandatory (names, descriptions, errors etc : NOT DRY AT ALL)

        // Validation - name is mandatory
        if (isUndefined(this.name) || this.name.trim() ==='' || this.name.length < 1) {
          this.showNameError = true;
          this.nameErrorDesc = this.translateService.instant('msg.dp.alert.name.error');
          return;
        } else {

          // Name length validation
          if (this.name.length > 50) {
            this.showNameError = true;
            this.nameErrorDesc = this.translateService.instant('msg.dp.alert.name.error.description');
            return;
          }

          this.datasetFile.name = this.name.trim();
          this.datasetHive.dsName = this.name.trim();
          this.datasetJdbc.dsName = this.name.trim();
        }

        // Description validation
        if (!StringUtil.isEmpty(this.description) && this.description.length > 150) {
          this.showDescError = true;
          this.nameDescErrorDesc = this.translateService.instant('msg.dp.alert.description.error.description');
          return;
        } else {

          if (!isNullOrUndefined(this.description)) {
            const desc = this.description.trim();
            this.datasetFile.desc = desc;
            this.datasetHive.dsDesc = desc;
            this.datasetJdbc.dsDesc = desc;
          }

        }

        this.loadingShow();
        this.flag = true;


        let params = {};
        if(this.type === 'STAGING')  {

          params = this._getHiveParams(this.datasetHive);

        } else if (this.type === 'FILE') {

          params = this._getFileParams(this.datasetFile);

        } else if(this.type === 'DB')  {

          params = this._getJdbcParams(this.datasetJdbc);

        }

        // Call save API
        this._createDataset(params);

      } else { // Excel - more than one sheet


        // Validation check
        this.sheetInfos.forEach((item,index) => {

          if (isUndefined(this.names[index]) || this.names[index].trim() ==='' || this.names[index].length < 1) {
            this.showNameError = true;
            this.nameErrors[index] = this.translateService.instant('msg.dp.alert.name.error');
          } else {
            // Name length validation
            if (this.names[index].length > 50) {
              this.showNameError = true;
              this.nameErrors[index] = this.translateService.instant('msg.dp.alert.name.error.description');
            }
          }

          // Description validation
          if (!StringUtil.isEmpty(this.description) && this.description.length > 150) {
            this.showDescError = true;
            this.descriptionErrors[index] = this.translateService.instant('msg.dp.alert.description.error.description');
            return;
          }

          this.datasetFile.sheetname = item.name;
          this.datasetFile.name = this.names[index];
          this.datasetFile.desc = this.descriptions[index];
        });

        // If validation fails return
        if (this.showNameError || this.showDescError) {
          return;
        }


        // validation passed
        this.loadingShow();
        this.flag = true;
        const promise = [];

        // TODO : change promise to something else
        // using promise for calling multiple APIs at once
        this.sheetInfos.forEach((item,index) => {
          this.datasetFile.sheetname = item.name;
          this.datasetFile.name = this.names[index];
          this.datasetFile.desc = this.descriptions[index];
          promise.push(this._createDatasetWithSheets(this._getFileParams(this.datasetFile)))
        });

        if (promise.length > 0) {
          Promise.all(promise).then((result) => {
            if (this.datasetService.dataflowId) {
              // dont have dataset id
              sessionStorage.setItem('DATASET_ID', ' ');
              this.router.navigate(['/management/datapreparation/dataflow/' + this.datasetService.dataflowId]);
            } else {
              this._returnToList();
            }

          }).catch((error) => {
            if (this.datasetService.dataflowId) {
              // dont have dataset id
              sessionStorage.setItem('DATASET_ID', ' ');
              this.router.navigate(['/management/datapreparation/dataflow/' + this.datasetService.dataflowId]);
            } else {
              this._returnToList();
            }

          })
        }
      }

    }
  }


  /**
   * go to previous step
   */
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

  /**
   * Close create dataset popup
   */
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

  /**
   * Show/hide name error msg
   * @param {number} index? - need it when multi sheet
   */
  public hideNameError(index? : number) {

    if (!isNullOrUndefined(index)) {

      this.showNameError = false;
      this.nameErrors[index] = '';
      this.safelyDetectChanges();

    } else {
      if (isUndefined(this.name) || this.name.length > 0 || this.name.length < 50) {
        this.showNameError = false;
        this.nameErrorDesc = '';
      }
    }

  }

  /**
   * Show/hide desc error msg
   * @param {number} index? - need it when multi sheet
   */
  public hideDescError(index? : number) {
    if (index) {
      if (isUndefined(this.descriptions[index]) || this.descriptions[index].length < 150) {
        this.showDescError = false;
        this.descriptionErrors[index] = '';
        this.safelyDetectChanges();
      }
    } else {
      if (isUndefined(this.description) || this.description.length < 150) {
        this.showDescError = false;
        this.nameDescErrorDesc = '';
      }
    }

  }


  /**
   * Success action after API call
   * @param result
   */
  public successAction(result) {
    this.flag = false;

    Alert.success(this.translateService.instant('msg.dp.alert.create-ds.success',
      {value: result.dsName }));

    if (this.datasetService.dataflowId) {

      result && sessionStorage.setItem('DATASET_ID', result.dsId);
      this.router.navigate(['/management/datapreparation/dataflow/' + this.datasetService.dataflowId]);

    }

    this.close();
    this.popupService.notiPopup({
      name: 'complete-dataset-create',
      data: null
    });

  }

  /**
   * Error action after API call
   * @param error
   */
  public errorAction(error) {
    this.flag = false;

    this.loadingHide();
    let prep_error = this.dataprepExceptionHandler(error);
    PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
  }


  /**
   * Returns sheet name separated with commas
   * @returns {string}
   */
  public getSheetNames() {
    let arr = [];
    this.sheetInfos.forEach((item) => {
      arr.push(item.name);
    });

    return arr.join(', ');
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Set default names for names of datasets
   * @param {string} type
   * @private
   */
  private _setDefaultDatasetName(type : string) : void {

    if ('FILE' === type) {
      let file = new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).exec(this.datasetFile.filename);
      this.fileExtension = file[1];
      let fileName = file[0].split('.' + this.fileExtension)[0];

      if(this.fileExtension.toUpperCase() === 'XLSX' || this.fileExtension.toUpperCase() === 'XLS') {

        let selectedSheets = this.datasetFile.selectedSheets.filter((item) => {
          if (item.selected) {

            this.names.push(`${fileName} - ${item.name} (EXCEL)`);
            this.descriptions.push('');
            this.nameErrors.push('');
            this.descriptionErrors.push('');
            return item;
          }

        });

        this.sheetInfos = selectedSheets;
        if (selectedSheets.length > 1) {
          this.isMultiSheet = true;
        } else {
          this.name = `${fileName} - ${this.datasetFile.sheetname} (EXCEL)`;
        }

      } else if (this.fileExtension.toUpperCase() === 'JSON') {
        this.name = `${fileName} (JSON)`;
      } else {
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

      if ('' !== this.datasetHive.tableName) {
        this.name = `${this.datasetHive.tableName} (STAGING)`;
      }

    }

    this.nameElement && setTimeout(() => { this.nameElement.nativeElement.select(); });
  } // function - _setDefaultDatasetName


  /**
   * Returns parameter needed for creating staging dataset
   * @param hive
   * @returns {Object}
   * @private
   */
  private _getHiveParams(hive): object {
    if (hive.databaseName) {
      this.datasetHive.custom = JSON.stringify({"databaseName": hive.databaseName});
    }
    return this.datasetHive
  }


  /**
   * Returns parameter needed for creating file dataset
   * @param file
   * @returns {Object}
   * @private
   */
  private _getFileParams(file) : object {

    const params: any = {};
    params.filename = file.filename;
    params.filekey = file.filekey;
    params.dsName = file.name;
    params.dsDesc = file.desc;
    params.dsType = 'IMPORTED';
    params.importType = 'FILE';
    params.fileType = 'LOCAL';

    let filename = file.filename.toLowerCase();
    if (filename.endsWith("xls") || filename.endsWith("xlsx")) {
      params.custom = `{"filePath":"${file.filepath}", "fileType":"EXCEL", "sheet":"${file.sheetname}"}`;
    } else if (filename.endsWith("csv")) {
      params.custom = `{"filePath":"${file.filepath}", "fileType":"DSV", "delimiter":"${file.delimiter}"}`;
    }
    return params
  }

  /**
   * Returns parameter needed for creating jdbc dataset
   * @param jdbc
   * @returns {Object}
   * @private
   */
  private _getJdbcParams(jdbc) : object {
    this.datasetJdbc.custom = JSON.stringify({"databaseName":jdbc.databaseName});
    return this.datasetJdbc
  }

  /**
   * Create dataset (call API)
   * @param {Object} params
   * @private
   */
  private _createDataset(params : object) {

    this.datasetService.createDataset(params).then((result) => {

      this.loadingHide();
      this.successAction(result);

    }).catch((error) => {

      this.loadingHide();
      this.errorAction(error);
    })
  }


  // temporary
  private _createDatasetWithSheets(params : object) {

    return new Promise ((resolve, reject) => {
      this.datasetService.createDataset(params).then((result) => {
        Alert.success(this.translateService.instant('msg.dp.alert.create-ds.success',
          {value: result.dsName }));
        resolve()
      }).catch((error) => {
        reject(error);
        Alert.error('Failed to create dataset');
      })
    })
  }

  private _setDatasetInfo() {

    if ('FILE' === this.type) {

      this.datasetInfo.push({name : this.translateService.instant('msg.dp.ui.list.file'), value : this.datasetFile.filename});

      if ('XLSX' === this.fileExtension.toUpperCase() || 'XLS' === this.fileExtension.toUpperCase()) {
        console.info('this.datasetFile. ', this.datasetFile);
        if (this.datasetFile.sheets.length === 1) {
          this.datasetInfo.push({name : this.translateService.instant('msg.dp.th.sheet'), value : this.datasetFile.sheets[0]});
        } else if (this.datasetFile.sheets.length > 1) {
          this.datasetInfo.push({name : this.translateService.instant('msg.dp.th.sheet'), value : this.getSheetNames()});
        }
      }

    } else if ('DB' === this.type || 'STAGING' === this.type) {

      let ds = 'DB' === this.type ? this.datasetJdbc : this.datasetHive;

      if ('DB' !== this.type) {
        this.datasetInfo.push({name : this.translateService.instant('msg.comm.th.type'), value : 'Staging DB'});

        if ('' !== ds.databaseName && '' !== ds.tableName) {
          this.datasetInfo.push(
            {name : this.translateService.instant('msg.dp.th.database'), value : ds.databaseName},
            {name : this.translateService.instant('msg.dp.th.ss.table'), value : ds.tableName}
          );
        }

      } else {

        this.datasetInfo.push({name : this.translateService.instant('msg.comm.th.type'), value : ds.dataconnection['connection'].implementor});

        ds.databaseName && this.datasetInfo.push({name : this.translateService.instant('msg.dp.th.database'), value : ds.databaseName});
        ds.tableName && this.datasetInfo.push({name : this.translateService.instant('msg.dp.th.ss.table'), value : ds.tableName});

        if (ds.dataconnection['connection'].hostname && ds.dataconnection['connection'].port) {
          this.datasetInfo.push(
            {name : this.translateService.instant('msg.comm.th.host'), value : ds.dataconnection['connection'].hostname},
            {name : this.translateService.instant('msg.comm.th.port'), value : ds.dataconnection['connection'].port}
          );
        } else {
          this.datasetInfo.push(
            {name : this.translateService.instant('msg.nbook.th.url'), value : ds.dataconnection['connection'].url}
          );
        }
      }

      if (ds.databaseName === '' && ds.tableName === '') {
        this.datasetInfo.push({name : this.translateService.instant('msg.dp.btn.query'), value : ds.queryStmt});
      }

    }

  }

  /**
   * Returns dataset list and refreshes the list
   * @private
   */
  private _returnToList() {
    this.loadingHide();
    this.popupService.notiPopup({
      name: 'complete-dataset-create',
      data: null
    });
  }




}

class DatasetInfo {
  name : string;
  value : any;
}
