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

declare let moment : any;
import * as _ from 'lodash';
import {isUndefined} from 'util';
import {Alert} from '../../common/util/alert.util';
import {PreparationAlert} from '../util/preparation-alert.util';

import {Component, ElementRef, EventEmitter, HostListener, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractPopupComponent} from '../../common/component/abstract-popup.component';
import {DatasetService} from '../dataset/service/dataset.service';
import {DataflowService} from '../dataflow/service/dataflow.service';
import {PopupService} from '../../common/service/popup.service';
import {HiveFileCompression, Engine, SsType, UriFileFormat, AppendMode, HiveFileFormat} from '../../domain/data-preparation/pr-snapshot';
import {Field} from '../../domain/data-preparation/pr-dataset';
import {DataconnectionService} from "../../dataconnection/service/dataconnection.service";
import {StorageService} from "../../data-storage/service/storage.service";

@Component({
  selector: 'create-snapshot-popup',
  templateUrl: './create-snapshot-popup.component.html',
})
export class CreateSnapshotPopup extends AbstractPopupComponent implements OnInit,OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  private uriFileFormat: UriFileFormat;

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

  public engineList: {value: Engine, label: string}[];

  public hiveEmbeddedFormat : {value: HiveFileFormat, label: string}[];

  public fileLocations: {value: string, label: string}[];

  public fileUris: string[];

  public dbList : string[];

  public isErrorShow: boolean = false;
  public fileUrlErrorMsg: string = '';
  public ssNameErrorMsg: string = '';
  public tblErrorMsg: string = '';


  @Output()
  public snapshotCreateFinishEvent = new EventEmitter();

  @Output()
  public snapshotCloseEvent = new EventEmitter();

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
  public init(data : {id: string, name: string, fields: Field[]}) {

    this.datasetId = data.id;
    this.datasetName = data.name;
    this.fields = data.fields;

    this._initialiseValues();

    this._getConfig();

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
   * Complete making snapshot
   */
  public complete() {

    if (this.isErrorShow) {
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
      this.snapshot.engine = Engine.EMBEDDED;
      if (this.snapshot.storedUri.length < 1){
        this.fileUrlErrorMsg = this.translateService.instant('msg.common.ui.required');
        this.isErrorShow = true;
        return;
      }
    }


    this.loadingShow();
    this._createSnapshot(this.datasetId, this.snapshot);

  }


  /**
   * When snapshot Name change, modify file type uris
   * */
  public changeSSUri(){
    if(this.snapshot.storedUri && this.snapshot.storedUri.lastIndexOf("/") > 0) {
      this.snapshot.storedUri = this.snapshot.storedUri.substring(0,this.snapshot.storedUri.lastIndexOf("/")+1)
        + this.snapshot.ssName.replace(/\s/gi, "")
        + '.'+this.uriFileFormat.toString().toLowerCase();
    }
  }


  /**
   * When item is selected from the list
   * @param event
   * @param type
   * */
  public onSelected(event,type) {
    switch (type){
      case 'engine':
        if ('EMBEDDED' === event.value) {
          this.snapshot.hiveFileFormat = this.hiveEmbeddedFormat[0].value;
        }
        break;
      case 'format':
        if ( this.snapshot.ssType && this.snapshot.ssType === SsType.URI) {
          this.uriFileFormat = event.value;
        }
        if ( this.snapshot.ssType && this.snapshot.ssType === SsType.STAGING_DB)
          this.snapshot.hiveFileFormat = event.value;
        this.changeSSUri();
        break;
      case 'location':
        for(let idx=0;idx<this.fileLocations.length;idx++) {
          if( event.value==this.fileLocations[idx].value ) {
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
   * Toggle Advanced setting button
   */
  public toggleAdvancedSettingBtn() {
    this.isAdvancedPrefOpen = !this.isAdvancedPrefOpen;
  }


  /**
   * Check if staging is enabled
   */
  public isStagingEnabled() :boolean {
    return StorageService.isEnableStageDB
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
   * Remove error msg when keydown in file uri
   */
  public fileUriKeyDown() {
    if (this.fileUrlErrorMsg === '') {
      return;
    }
    this.fileUrlErrorMsg = '';
    this.isErrorShow = false
  }
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  /**
   * Make snapshot with enter key
   * @param event Event
   * @private
   */
  @HostListener('document:keydown.enter', ['$event'])
  private _onEnterKeydownHandler(event: KeyboardEvent) {
    if(this.isShow && event.keyCode === 13) {
      this.complete();
    }
  }


  /**
   * Close popup with esc button
   * @param event Event
   * @private
   */
  @HostListener('document:keydown.escape', ['$event'])
  private _onKeydownHandler(event: KeyboardEvent) {
    if (this.isShow && event.keyCode === 27 ) {
      this.close();
    }
  }


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
      { value: UriFileFormat.JSON, label: 'JSON' }
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
      { value : Engine.EMBEDDED, label : 'Embedded Engine' }
    ];

  }


  /**
   * Returns default snapshot name
   * @param ssName
   * @private
   */
  private _getDefaultSnapshotName(ssName?:string) : string {
    let today = moment();
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
        this.fileLocations.push( { 'value': item, 'label': item } );
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
      if (['.csv','.json'].indexOf(this.snapshot.storedUri) < 0)
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
    if (this.isStagingEnabled()) {
      this._connectionService.getDatabaseForHive().then((data) => {
        if (data['databases']) {
          this.dbList = data['databases'];
        }
      }).catch((error) => {
        this.commonExceptionHandler(error);
      });
    }
  }


  /**
   * Fetch configuration information (ssName and file URI info)
   * @private
   */
  private _getConfig() {

    this.dataflowService.getConfiguration(this.datasetId).then((conf) => {

      this.ssName = this._getDefaultSnapshotName(conf['ss_name']);

      this._setFileLocationAndUri(conf['file_uri']);

      // Show popup
      this.isShow = true;

      this._getStagingDb();

      this.changeSsType(SsType.URI);

      this.loadingHide();
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
      let prep_error = this.dataprepExceptionHandler(error);
      PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));

    });
  }

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
  public partitionColNames?: String[];
}
