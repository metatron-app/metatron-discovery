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

import {AbstractPopupComponent} from '../../../common/component/abstract-popup.component';
import {Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  FileFormat, PrDatasetFile, PrDatasetHive, PrDatasetJdbc,
  RsType
} from '../../../domain/data-preparation/pr-dataset';
import {PopupService} from '../../../common/service/popup.service';
import {DatasetService} from '../service/dataset.service';
import {isUndefined} from 'util';
import {StringUtil} from '../../../common/util/string.util';
import {Alert} from '../../../common/util/alert.util';
import {PreparationCommonUtil} from "../../util/preparation-common.util";
import * as _ from 'lodash';
import { concatMap } from 'rxjs/operators';
import { from} from "rxjs/observable/from";

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

  @Input()
  public datasetHive: PrDatasetHive;

  @Input()
  public datasetJdbc: PrDatasetJdbc;

  @Input()
  public datasetFiles : any;

  @Input() // [DB, STAGING, FILE]
  public type : string;

  // name error msg show/hide
  public showNameError: boolean = false;

  // desc error msg show/hide
  public showDescError: boolean = false;

  // to check request is only sent once.
  public flag: boolean = false;

  @ViewChild('nameElement')
  public nameElement : ElementRef;

  public datasetInfo : DatasetInfo[] = [];
  public fileExtension: string;

  public dsfileInformations: any;

  public isMultiSheet: boolean = false;
  public names : string [] = [];
  public clonedNames:string[] = [];
  public descriptions : string [] = [];
  public nameErrors: string[] = [];
  public descriptionErrors: string[] = [];
  public currentIndex: number = 0;
  public results: {dsId: string}[] = [];
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(private popupService: PopupService,
              private datasetService: DatasetService,
              protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit();

    this.dsfileInformations = [];

    // Set default name
    this._setDefaultDatasetName(this.type);

    // Set dataset information
    this._setDatasetInfo();

  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /** Complete */
  public complete() {

    if (this.flag) {
      return;
    }

    // Name validation
    this.names.forEach((item, index) => {
      if (isUndefined(item) || item.trim() === '' || item.length < 1) {
        this.nameErrors[index] = this.translateService.instant('msg.dp.alert.name.error');
        this.showNameError = true;
      }

      if (item.length > 50) {
        this.showNameError = true;
        this.nameErrors[index] = this.translateService.instant('msg.dp.alert.name.error.description');
      }

    });


    // description validation
    this.descriptions.forEach((item, index) => {
      if (!StringUtil.isEmpty(this.descriptions[index]) && this.descriptions[index].length > 150) {
        this.descriptionErrors[index] = this.translateService.instant('msg.dp.alert.description.error.description');
      }
    });

    if (this.showNameError || this.showDescError) {
      return;
    }


    let params = {};
    if (this.type === 'STAGING') {

      this.datasetHive.dsName = this.names[0];
      this.datasetHive.dsDesc = this.descriptions[0];
      params = this._getHiveParams(this.datasetHive);
      this._createDataset(params);
    }

    if (this.type === 'DB') {

      this.datasetJdbc.dsName = this.names[0];
      this.datasetJdbc.dsDesc = this.descriptions[0];
      params = this._getJdbcParams(this.datasetJdbc);
      this._createDataset(params);

    }

    if (this.type === 'FILE') {

      // List of parameters used to make multiple dataSets
      const params = this.names.map((name:string,index:number) => {
        this.datasetFiles[this.dsfileInformations[index].datasetFileIndex].dsName = name;
        this.datasetFiles[this.dsfileInformations[index].datasetFileIndex].dsDesc = this.descriptions[index];
        this.datasetFiles[this.dsfileInformations[index].datasetFileIndex].sheetName = this.datasetFiles[this.dsfileInformations[index].datasetFileIndex].selectedSheets[index];

        return this._getFileParams(this.datasetFiles[this.dsfileInformations[index].datasetFileIndex]);
      });

      // Make list of params into observable using from.
      // used concatMap to send multiple sequential HTTP requests
      const streams = from(params).pipe(
        concatMap(stream => this._createFileDataset(stream)
        .catch((error) => {
          console.info(error)
        })));

      this.loadingShow();
      streams.subscribe((result) => {

        // push only successful result into an array
        // because this information is required in
        // complete() but no way to access them
        if (result) {
          this.results.push({dsId : result.dsId});
        }

      },(error) => {
        console.error(error);
      },() => {
        const errorNum = this.names.length - this.results.length;
        if (errorNum > 0) {
          Alert.error(this.translateService.instant('msg.dp.alert.num.fail.dataset', {value : errorNum}));
        }

        // Close popup when all observables are subscribed
        this.loadingHide();
        if (this.datasetService.dataflowId) {
          sessionStorage.setItem('DATASET_ID', this.results[0].dsId);
          this.router.navigate(['/management/datapreparation/dataflow/' + this.datasetService.dataflowId]);
        }
        this.close();

        if (this.results.length > 0) {
          this.popupService.notiPopup({
            name: 'complete-dataset-create',
            data: this.results[0].dsId
          });
        }
      })

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


  /**
   * close popup
   * */
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
   * show/hide error msg
   * @param index
   * */
  public hideNameError(index: number) {
    if (isUndefined(this.names[index]) || this.names[index].length > 0 || this.names[index].length < 50) {
      this.showNameError = false;
      this.nameErrors[index] = '';

    }
  }

  /**
   * show/hide error msg
   * @param index
   * */
  public hideDescError(index: number) {
    if (isUndefined(this.descriptions[index]) || this.descriptions[index].length < 150) {
      this.showDescError = false;
      this.descriptionErrors[index] = '';
    }
  }


  /**
   * Success action
   * @param result
   */
  public successAction(result) {

    this.flag = false;
    if (this.datasetService.dataflowId) {
      sessionStorage.setItem('DATASET_ID', result.dsId);
      this.router.navigate(['/management/datapreparation/dataflow/' + this.datasetService.dataflowId]);
    }

    this.close();
    this.popupService.notiPopup({
      name: 'complete-dataset-create',
      data: result.dsId
    });

  }


  /**
   * Error action
   * @param error
   */
  public errorAction(error) {
    this.flag = false;
    Alert.error(this.translateService.instant('msg.dp.alert.num.fail.dataset', {value : 1}));
    this.close();
  }


  /**
   * Check if next button is disabled or not
   */
  public isBtnDisabled() : boolean {
    return this.showNameError || this.showDescError;
  }


  /**
   * Keyup event
   * @param event
   */
  public keyupEvent(event) {
    if (event.keyCode === 13) {
      this.complete();
    }
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

      this.datasetFiles.forEach((dsFile, index)=>{
        if(dsFile.sheetInfo){
          if(dsFile.fileFormat === FileFormat.EXCEL){
            dsFile.sheetInfo.forEach((sheet)=>{
              if (sheet.selected){
                this.names.push(`${dsFile.fileName} - ${sheet.sheetName} (${dsFile.fileFormat.toString()})`);
                this.descriptions.push('');
                this.nameErrors.push('');
                this.descriptionErrors.push('');
                this.dsfileInformations.push({datasetFileIndex : index, fileName: dsFile.filenameBeforeUpload, fileFormat: dsFile.fileFormat.toString()});
              }
            })
          } else {
            if(dsFile.selected){
              this.names.push(`${dsFile.fileName} (${dsFile.fileFormat.toString()})`);
              this.descriptions.push('');
              this.nameErrors.push('');
              this.descriptionErrors.push('');
              this.dsfileInformations.push({datasetFileIndex : index, fileName: dsFile.filenameBeforeUpload, fileFormat: dsFile.fileFormat.toString()});
            }
          }
        }
      })
      // For placeholder
      this.clonedNames = _.cloneDeep(this.names);

      // let file = PreparationCommonUtil.getFileNameAndExtension(this.datasetFile.filenameBeforeUpload);
      // this.fileExtension = file[1];
      // let fileName = file[0];
      // if(this.fileExtension.toUpperCase() === 'XLSX' || this.fileExtension.toUpperCase() === 'XLS') {
      //
      //   this.datasetFile.selectedSheets.forEach((item) => {
      //     this.names.push(`${fileName} - ${item} (EXCEL)`);
      //     this.descriptions.push('');
      //     this.nameErrors.push('');
      //     this.descriptionErrors.push('');
      //   });
      //
      //   // For placeholder
      //   this.clonedNames = _.cloneDeep(this.names);
      //
      //   if (this.names.length > 1) {
      //     this.isMultiSheet = true;
      //   } else {
      //     this.names[0] = `${fileName} - ${this.datasetFile.selectedSheets[0]} (EXCEL)`;
      //   }
      //
      // } else if (this.fileExtension.toUpperCase() === 'JSON') {
      //   this.names[0] = `${fileName} (JSON)`;
      // } else {
      //   this.names[0] = `${fileName} (CSV)`;
      // }

    } else if ('DB' === type) {

      // When table
      if (this.datasetJdbc.rsType === RsType.TABLE) {
        this.names[0] = this.datasetJdbc.tableInfo.tableName +' ('+this.datasetJdbc.dataconnection.connection.implementor+')';
      }

      // When query


    } else if ('STAGING' === type) {

      // When table
      if (this.datasetHive.rsType === RsType.TABLE) {
        this.names[0] = `${this.datasetHive.tableInfo.tableName} (STAGING)`;
      }

      // When query

    }

    this.nameElement && setTimeout(() => { this.nameElement.nativeElement.select(); });
  } // function - _setDefaultDatasetName


  /**
   * Set dataset information (summary)
   * @private
   */
  private _setDatasetInfo() {

    if ('FILE' === this.type) {

      // this.datasetInfo.push({name : this.translateService.instant('msg.dp.ui.list.file'), value : this.datasetFile.filenameBeforeUpload});
      //
      // if ('XLSX' === this.fileExtension.toUpperCase() || 'XLS' === this.fileExtension.toUpperCase()) {
      //
      //   if (!this.isMultiSheet) {
      //     this.datasetInfo.push({name : this.translateService.instant('msg.dp.th.sheet'), value : this.datasetFile.selectedSheets[0]});
      //   }
      //
      // }

    } else if ('DB' === this.type) {

      let ds = this.datasetJdbc;

      // TYPE
      this.datasetInfo.push({
        name : this.translateService.instant('msg.comm.th.type'),
        value : ds.dataconnection['connection'].implementor
      });

      if (this.datasetJdbc.rsType === RsType.TABLE) {

        // DATABASE NAME
        this.datasetInfo.push({
          name : this.translateService.instant('msg.dp.th.database'),
          value : ds.tableInfo.databaseName
        });

        // TABLE NAME
        this.datasetInfo.push({
          name : this.translateService.instant('msg.dp.th.ss.table'),
          value : ds.tableInfo.tableName
        });

      } else {

        this.datasetInfo.push({
          name : this.translateService.instant('msg.dp.th.database'),
          value : ds.sqlInfo.databaseName
        });

        // QUERY STATEMENT
        this.datasetInfo.push({
          name : this.translateService.instant('msg.dp.btn.query'),
          value : ds.sqlInfo.queryStmt
        });

      }

      if (ds.dataconnection['connection'].hostname && ds.dataconnection['connection'].port) {

        // HOST & PORT
        this.datasetInfo.push(
          {name : this.translateService.instant('msg.comm.th.host'), value : ds.dataconnection['connection'].hostname},
          {name : this.translateService.instant('msg.comm.th.port'), value : ds.dataconnection['connection'].port}
        );
      } else {

        // URL
        this.datasetInfo.push(
          {name : this.translateService.instant('msg.nbook.th.url'), value : ds.dataconnection['connection'].url}
        );
      }

    } else if ('STAGING' === this.type) {
      this.datasetInfo.push({name : this.translateService.instant('msg.comm.th.type'), value : 'Staging DB'});

      if (this.datasetHive.rsType === RsType.TABLE) {
        this.datasetInfo.push(
          {name : this.translateService.instant('msg.dp.th.database'), value : this.datasetHive.tableInfo.databaseName},
          {name : this.translateService.instant('msg.dp.th.ss.table'), value : this.datasetHive.tableInfo.tableName}
        );
      } else {
        this.datasetInfo.push({name : this.translateService.instant('msg.dp.btn.query'), value : this.datasetHive.sqlInfo.queryStmt});
      }

    }

  }


  /**
   * Returns parameter needed for creating staging dataset
   * @returns {Object}
   * @private
   */
  private _getHiveParams(hive): object {

    if (hive.rsType === RsType.QUERY) {
      hive.queryStmt = hive.sqlInfo.queryStmt;
      hive.dbName = hive.sqlInfo.databaseName;
    } else {
      hive.tblName = hive.tableInfo.tableName;
      hive.dbName = hive.tableInfo.databaseName;
    }
    return hive
  }


  /**
   * Returns parameter needed for creating jdbc dataset
   * @param jdbc
   * @returns {Object}
   * @private
   */
  private _getJdbcParams(jdbc) : object {

    if (jdbc.rsType === RsType.QUERY) {
      jdbc.dbName = jdbc.sqlInfo.databaseName;
      jdbc.queryStmt = jdbc.sqlInfo.queryStmt;
    } else {
      jdbc.tblName = jdbc.tableInfo.tableName;
      jdbc.dbName = jdbc.tableInfo.databaseName;
    }
    return jdbc
  }


  /**
   * Returns parameter needed for creating staging dataset
   * @returns {Object}
   * @private
   */
  private _getFileParams(file): object {
    const params: any = {};
    if (file.fileFormat === FileFormat.EXCEL){
      params.delimiter = ',';
    } else {
      params.delimiter = file.delimiter;
    }

    params.dsName = file.dsName;
    params.dsDesc = file.dsDesc;
    params.dsType = 'IMPORTED';
    params.importType = 'UPLOAD';
    params.filenameBeforeUpload = file.filenameBeforeUpload;
    params.storageType = file.storageType;
    params.sheetName = file.sheetName;
    params.storedUri = file.storedUri;

    const filenameBeforeUpload = file.filenameBeforeUpload.toLowerCase();
    if( filenameBeforeUpload.endsWith("xls") || filenameBeforeUpload.endsWith("xlsx") ) {

      params.fileFormat = "EXCEL";

    } else if(filenameBeforeUpload.endsWith("csv") || filenameBeforeUpload.endsWith("txt") ) {

      params.fileFormat = "CSV";

    } else if(filenameBeforeUpload.endsWith("json") ) {

      params.fileFormat = "JSON";

    }

    return params
  }



  /**
   * Create dataset (call API)
   * @param {Object} params
   * (staging and db)
   * @private
   */
  private _createDataset(params : object) {

    let type = this.type === 'DB' ? this.datasetJdbc : this.datasetHive;

    let tableInfo = type.tableInfo;
    let sqlInfo = type.sqlInfo;

    // delete - only use in UI
    delete type.tableInfo;
    delete type.sqlInfo;

    // Error when creating dataflow with dataset with no querystmt
    if (type.rsType === RsType.TABLE) {
      params['queryStmt'] = `select * from ${tableInfo.databaseName}.${tableInfo.tableName}`;
    }

    this.loadingShow();
    this.datasetService.createDataSet(params).then((result) => {
      this.loadingHide();
      this.successAction(result);

    }).catch((error) => {

      type.tableInfo = tableInfo;
      type.sqlInfo = sqlInfo;

      // Error when creating dataflow with dataset with no querystmt
      if (type.rsType === RsType.TABLE) {
        delete params['queryStmt'];
      }

      this.loadingHide();
      this.errorAction(error);
    })
  }


  /**
   * Create file type dataset
   * @param param
   * @private
   */
  private _createFileDataset(param): Promise<any> {
    return new Promise((resolve, reject) => {
      this.datasetService.createDataSet(param).
      then(result => resolve(result)).
      catch(error => reject(error));
    });
  }


}

class DatasetInfo {
  name : string;
  value : any;
}


