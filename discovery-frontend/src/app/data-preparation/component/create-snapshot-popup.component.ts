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

// noinspection JSUnusedLocalSymbols

import * as _ from 'lodash';
import {isUndefined} from 'util';

import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector, Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {Alert} from '@common/util/alert.util';
import {PopupService} from '@common/service/popup.service';
import {Modal} from '@common/domain/modal';
import {AbstractPopupComponent} from '@common/component/abstract-popup.component';
import {ConfirmModalComponent} from '@common/component/modal/confirm/confirm.component';
import {Field} from '@domain/data-preparation/pr-dataset';
import {HiveFileCompression, Engine, SsType, UriFileFormat, AppendMode, HiveFileFormat} from '@domain/data-preparation/pr-snapshot';

import {DataconnectionService} from '@common/service/dataconnection.service';
import {StorageService} from '../../data-storage/service/storage.service';
import {DatasetService} from '../dataset/service/dataset.service';
import {DataflowService} from '../dataflow/service/dataflow.service';
import {PreparationAlert} from '../util/preparation-alert.util';

declare let moment : any;

@Component({
  selector: 'create-snapshot-popup',
  templateUrl: './create-snapshot-popup.component.html',
})
export class CreateSnapshotPopupComponent extends AbstractPopupComponent implements OnInit,OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private uriFileFormat: UriFileFormat;

  private _isDataprepStagingEnabled: boolean = true;
  private _isSparkEngineEnabled: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public datasetId: string;

  public datasetName : string;

  public fields : Field[];

  public ssName: string;

  public isShow : boolean = false;

  public snapshot: SnapShotCreateDomain;

  public SsType = SsType;

  public isAdvancedPrefOpen : boolean = false;

  public fileFormat: {value: UriFileFormat, label: string}[];

  public compressionType: {value:HiveFileCompression, label: string}[];

  public overwriteMethod: {value: AppendMode, label: string}[];

  public Engine = Engine;

  public engineList: {value: Engine, label: string}[];

  public hiveEmbeddedFormat : {value: HiveFileFormat, label: string}[];

  public fileLocations: {value: string, label: string}[];

  public fileUris: string[];

  public dbList : string[];

  public isErrorShow: boolean = false;
  public fileUrlErrorMsg: string = '';
  public fileFormatErrorMsg: string = '';
  public ssNameErrorMsg: string = '';
  public tblErrorMsg: string = '';

  public storedUriChangedDirectly: boolean = false;

  @Output()
  public snapshotCreateFinishEvent = new EventEmitter();

  @Output()
  public snapshotCloseEvent = new EventEmitter();

  @ViewChild(ConfirmModalComponent)
  private confirmModalComponent: ConfirmModalComponent;

  @Input()
  public isFromMainGrid?: boolean = false;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  constructor(private _connectionService: DataconnectionService,
              protected popupService: PopupService,
              protected dataflowService: DataflowService,
              protected datasetService: DatasetService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public ngOnInit() {
    super.ngOnInit()
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Initial
   * @param {id:string, name : string, fields : Field[]} data
   */
  public init(data : {id: string, name: string, isFromMainGrid?: boolean}) {

    this.datasetId = data.id;
    this.datasetName = data.name;

    if (data.isFromMainGrid) { // Check if snapshot popup is open from main grid
      this.isFromMainGrid = true;
    }

    this._initialiseValues();

    this._getConfig().then(() => {
      this._getGridData(this.datasetId);
    });

  }


  /**
   * Close this popup
   */
  public close() {
    super.close();
    this.isAdvancedPrefOpen = false;
    this.snapshotCloseEvent.emit();
    this.isShow = false;
  }


  /**
   * Open rename popup
   */
  public openRenamePopup() {

    this.snapshotCloseEvent.emit('hive');
    this.isShow = false;
  }


  /**
   * Complete making snapshot
   */
  public complete() {

    if (this.isErrorShow) {
      return;
    }

    // Only check field names for hive when isFromMainGrid
    // If Hive type (ssType)
    // open modal If there is inappropriate name for hive snapshot
    if (this.isFromMainGrid && this.snapshot.ssType === SsType.STAGING_DB && !this._isFieldsValidationPass()) {

      const modal = new Modal();
      modal.name = this.translateService.instant('msg.dp.alert.hive.column.error');
      modal.btnName = this.translateService.instant('msg.comm.ui.ok');
      this.confirmModalComponent.init(modal);

      return;
    }

    // Snapshot name cannot be empty
    if (this.snapshot.ssName.trim() === '') {
      this.isErrorShow = true;
      this.ssNameErrorMsg = this.translateService.instant('msg.common.ui.required');
      return;
    }

    if (this.snapshot.ssType === SsType.STAGING_DB) {

      // table name cannot be empty
      if (isUndefined(this.snapshot.tblName) || this.snapshot.tblName === '') {
        this.tblErrorMsg = this.translateService.instant('msg.common.ui.required');
        this.isErrorShow = true;
        return;
      }

      if (isUndefined(this.snapshot.partitionColNames)) {
        this.snapshot.partitionColNames = [];
      }

      // table name validation
      const reg = /^[a-zA-Z0-9_]*$/;
      if(!reg.test(this.snapshot.tblName)){
        this.tblErrorMsg = this.translateService.instant('msg.dp.alert.ss.table.name');
        this.isErrorShow = true;
        return;
      }
    }

    // file uri cannot be empty
    if (SsType.URI === this.snapshot.ssType) {
      if (this.snapshot.storedUri.length < 1){
        this.fileUrlErrorMsg = this.translateService.instant('msg.common.ui.required');
        this.isErrorShow = true;
        return;
      }
    }

    if ( this.snapshot.engine !== Engine.EMBEDDED && this.uriFileFormat === UriFileFormat.SQL ) {
      this.fileFormatErrorMsg = this.translateService.instant('msg.dp.alert.ss.not.support.sql');
      this.isErrorShow = true;
      return;
    }

    this.loadingShow();
    this._createSnapshot(this.datasetId, this.snapshot);

  }


  /**
   * When snapshot Name change, modify file type uris
   */
  public changeSSUri(){
    if( this.storedUriChangedDirectly === true) {
      return;
    }

    const fileName = this.snapshot.ssName.replace(/[^\w_가-힣]/gi, '_') +'.'+ this.uriFileFormat.toString().toLowerCase();
    this.changeStoredUri(fileName);
  }

  public changeStoredUri(fileName: string = null){
    const slashIndex = this.snapshot.storedUri.lastIndexOf('/');
    if(this.snapshot.storedUri && slashIndex > 0) {
      if(fileName===null) {
        fileName = this.snapshot.storedUri.substring(slashIndex+1);
      }
      const replacedFileName = fileName.replace(/[^\w_.ㄱ-힣]/gi, '_');

      this.snapshot.storedUri = this.snapshot.storedUri.substring(0,slashIndex+1) + replacedFileName;
    }
  }


  /**
   * When item is selected from the list
   * @param event
   * @param type
   */
  public onSelected(event,type) {
    switch (type){
      case 'engine':
        this.fileFormatErrorMsg = '';
        this.isErrorShow = false;
        if ('EMBEDDED' === event.value) {
          this.snapshot.hiveFileFormat = this.hiveEmbeddedFormat[0].value;
        }
        break;
      case 'format':
        this.fileFormatErrorMsg = '';
        this.isErrorShow = false;
        if ( this.snapshot.ssType && this.snapshot.ssType === SsType.URI) {
          this.uriFileFormat = event.value;
        }
        if ( this.snapshot.ssType && this.snapshot.ssType === SsType.STAGING_DB)
          this.snapshot.hiveFileFormat = event.value;
        this.changeSSUri();
        break;
      case 'location':
        for(let idx=0;idx<this.fileLocations.length;idx++) {
          if( event.value === this.fileLocations[idx].value ) {
            this.snapshot.storedUri = this.fileUris[idx];
            this.changeSSUri();
            break;
          }
        }
        break;
      case 'mode':
        this.snapshot.appendMode = event.value;
        break;
      case 'compression':
        this.snapshot.hiveFileCompression = event.value;
        break;
    }

  }


  /**
   * When db name is selected
   * @param dbName
   */
  public onSelectedDBName(dbName) {
    this.snapshot['dbName'] = dbName;
  }


  /**
   * When part key is selected
   * @param item
   */
  public onPartitionSelected(item) {
    this.snapshot.partitionColNames = item.map((x) => {
      return x.name;
    });
  }


  /**
   * Change snapshot type
   * @param ssType
   */
  public changeSsType(ssType : SsType) {

    this.snapshot = new SnapShotCreateDomain();
    this.snapshot.ssName = this.ssName;
    this.snapshot.ssType = ssType;
    this.isErrorShow = false;
    this.fileUrlErrorMsg = '';
    this.fileFormatErrorMsg = '';
    this.tblErrorMsg = '';
    this.ssNameErrorMsg = '';


    if (ssType === SsType.STAGING_DB) {
      this.snapshot.dbName = this.dbList[0];
      this.snapshot.tblName = 'snapshot1';
      this.snapshot.appendMode = this.overwriteMethod[0].value;
      this.snapshot.engine = this.engineList[0].value;
      this.snapshot.hiveFileFormat = this.hiveEmbeddedFormat[0].value;
      this.snapshot.hiveFileCompression = this.compressionType[0].value;

    } else if (ssType === SsType.URI) {

      // Default file format is CSV
      this.uriFileFormat = this.fileFormat[0].value;

      this.snapshot.storedUri = this._getDefaultStoredUri();
    }

    // Select snapshot name
    setTimeout(() => {
      const ssName = this.elementRef.nativeElement.querySelector('.prep-snapshot-name-input');
      ssName.select();
    })

  }

  /**
   * Change ETL Engine
   * @param engine
   */
  public changeEtlEngine(engine : Engine) {
    this.snapshot.engine = engine;
  }

  /**
   * Toggle Advanced setting button
   */
  public toggleAdvancedSettingBtn() {
    this.isAdvancedPrefOpen = !this.isAdvancedPrefOpen;
  }


  /**
   * Check if staging is enabled
   */
  public isStagingEnabled() :boolean {
    return StorageService.isEnableStageDB && this._isDataprepStagingEnabled;
  }


  /**
   * Check if spark engine is enabled
   */
  public isSparkEnabled() :boolean {
    return this._isSparkEngineEnabled;
  }

  /**
   * Remove error msg when keydown in ssName
   */
  public ssNameKeyDown() {
    if (this.ssNameErrorMsg === '') {
      return;
    }

    this.ssNameErrorMsg = '';
    this.isErrorShow = false
  }


  /**
   * Remove error msg when keydown in table name
   */
  public tblNameKeyDown() {
    if (this.tblErrorMsg === '') {
      return;
    }

    this.tblErrorMsg = '';
    this.isErrorShow = false
  }

  /**
   * Check if it has changed directly
   */
  public onChangeStoredUri(event) {
    if(event) {
      this.storedUriChangedDirectly = true;
      this.changeStoredUri();
    }
  }

  /**
   * Remove error msg when keydown in file uri
   */
  public fileUriKeyDown() {
    if (this.fileUrlErrorMsg === '') {
      return;
    }
    this.fileUrlErrorMsg = '';
    this.isErrorShow = false
  }

  /**
   * Make snapshot with enter key
   * @param event Event
   */
  @HostListener('document:keydown.enter', ['$event'])
  public onEnterKeydownHandler(event: KeyboardEvent) {
    if(this.isShow && event.keyCode === 13) {
      this.complete();
    }
  }

  /**
   * Close popup with esc button
   * @param event Event
   */
  @HostListener('document:keydown.escape', ['$event'])
  public onKeydownHandler(event: KeyboardEvent) {
    if (this.isShow && event.keyCode === 27 ) {
      this.close();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Initialise values
   * @private
   */
  private _initialiseValues() {

    this.snapshot = new SnapShotCreateDomain();

    // -------------------
    // File system
    // -------------------
    this.fileFormat = [
      { value: UriFileFormat.CSV, label: 'CSV' },
      { value: UriFileFormat.JSON, label: 'JSON' },
      { value: UriFileFormat.SQL, label: 'SQL' }
    ];

    this.ssName = '';
    this.fileLocations = [];
    this.fileUris = [];


    // -------------------
    // Hive
    // -------------------
    this.overwriteMethod = [
      { value: AppendMode.OVERWRITE, label: 'Overwrite' },
      { value: AppendMode.APPEND, label: 'Append' }
    ];

    this.compressionType = [
      { value: HiveFileCompression.NONE, label: 'NONE' },
      { value: HiveFileCompression.SNAPPY, label: 'SNAPPY' },
      { value: HiveFileCompression.ZLIB, label: 'ZLIB' }
    ];

    this.hiveEmbeddedFormat = [
      { value: HiveFileFormat.ORC, label: 'ORC' },
      { value: HiveFileFormat.CSV, label: 'CSV' }
    ];

    this.engineList = [
      { value : Engine.EMBEDDED, label : 'Embedded Engine' },
      { value : Engine.SPARK, label : 'Spark' }
    ];

  }


  /**
   * Returns default snapshot name
   * @param ssName
   * @private
   */
  private _getDefaultSnapshotName(ssName?:string) : string {
    const today = moment();
    return !_.isNil(ssName) ? ssName : `${this.datasetName}_${today.format('YYYYMMDD_HHmmss')}`;
  }


  /**
   * Set fileLocation and fileUris with conf['file_uri']
   * @param fileUri
   * @private
   */
  private _setFileLocationAndUri(fileUri?:object) {

    this.fileLocations = [];
    this.fileUris = [];

    if (!_.isNil(fileUri)) {
      Object.keys(fileUri).forEach((item) => {
        this.fileLocations.push( { value: item, label: item } );
        this.fileUris.push(fileUri[item] );
      });
    }
  }

  /**
   * Returns default stored uri value (using fileLocations and file Uris)
   * @private
   */
  private _getDefaultStoredUri(): string{
    let result: string;

    if (0 < this.fileLocations.length) {

      result = this.fileUris[0] ;
      if (['.csv','.json','.sql'].indexOf(this.snapshot.storedUri) < 0)
        result +=  '.' + this.uriFileFormat.toString().toLowerCase();
    }
    return result;
  }


  /**
   * Fetch staging database list
   * @private
   */
  private _getStagingDb() {
    this.dbList = [];
    this._connectionService.getDatabaseForHive().then((data) => {
      if (data['databases']) {
        this.dbList = data['databases'];
      }
    }).catch((error) => {
      console.log('error -> ', error);
      this._isDataprepStagingEnabled = false;
    });
  }


  /**
   * Fetch configuration information (ssName and file URI info)
   * @private
   */
  private _getConfig() {

    return new Promise<any>((resolve, reject) => {

      this.dataflowService.getConfiguration(this.datasetId).then((conf) => {

        if(conf['sparkEngineEnabled']) {
          this._isSparkEngineEnabled = conf['sparkEngineEnabled'];
        } else {
          this._isSparkEngineEnabled = false;
        }

        this.ssName = this._getDefaultSnapshotName(conf['ss_name']);

        this._setFileLocationAndUri(conf['file_uri']);

        // Show popup
        this.isShow = true;

        this._getStagingDb();

        // default: URI & EMBBEDED
        this.changeSsType(SsType.URI);
        this.changeEtlEngine(Engine.EMBEDDED);


        this.loadingHide();
        resolve(null);
      }).catch((err) => reject(err));

    });
  }


  /**
   * Create snapshot (API)
   * @param dsId
   * @param snapshot
   * @private
   */
  private _createSnapshot(dsId: string, snapshot: SnapShotCreateDomain) {

    this.dataflowService.createDataSnapshot(dsId, snapshot).then((result) => {
      this.loadingHide();
      if (result.errorMsg) {
        Alert.error(result.errorMsg);
      } else {
        this.snapshotCreateFinishEvent.emit(result.ssId);
        this.isShow = false;
        this.isAdvancedPrefOpen = false;
      }

    }).catch((error) => {
      this.loadingHide();
      const prepError = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prepError, this.translateService.instant(prepError.message));

    });
  }


  /**
   * Returns true is all fields only consists of small alphabet, numbers and _
   * @private
   */
  private _isFieldsValidationPass(): boolean {

    const names = this.fields.map((item) => item.name);
    const enCheckReg = /^[a-z0-9_]+$/;
    const idx = names.findIndex((item) => {
      return (-1 !== item.indexOf(' ')) || !enCheckReg.test(item)
    });

    return idx === -1
  }


  /**
   * Fetch grid data of dataset
   * @param dsId
   * @private
   */
  private _getGridData(dsId: string) {

    this.datasetService.getDatasetDetail(dsId).then((result) => {
      this.fields = this._getGridDataFromGridResponse(result.gridResponse).fields;
    })

  }

  /**
   * Change grid data to grid response
   * @param gridResponse 매트릭스 정보
   * @returns 그리드 데이터
   */
  private _getGridDataFromGridResponse(gridResponse: any) {
    const colCnt = gridResponse.colCnt;
    const colNames = gridResponse.colNames;
    const colTypes = gridResponse.colDescs;

    const gridData = {
      data: [],
      fields: []
    };

    for ( let idx = 0; idx < colCnt; idx++ ) {
      gridData.fields.push({
        name: colNames[idx],
        type: colTypes[idx].type,
        seq: idx
      });
    }

    gridResponse.rows.forEach((row) => {
      const obj = {};
      for ( let idx = 0;idx < colCnt; idx++ ) {
        obj[ colNames[idx] ] = row.objCols[idx];
      }
      gridData.data.push(obj);
    });

    return gridData;
  } // function - getGridDataFromGridResponse



}

export class SnapShotCreateDomain {
  public engine: Engine;
  public ssName: string;
  public ssType: SsType;
  public hiveFileCompression?: HiveFileCompression;
  public storedUri?: string;
  public dbName?: string;
  public tblName?: string;
  public hiveFileFormat?: HiveFileFormat;
  public appendMode?: AppendMode;
  public partitionColNames?: string[];
}
