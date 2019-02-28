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
import { isUndefined } from 'util';
import { Alert } from '../../common/util/alert.util';
import { PreparationAlert } from '../util/preparation-alert.util';

import {
  Component, ElementRef, EventEmitter, HostListener, Injector, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../common/component/abstract-popup.component';
import { DatasetService } from '../dataset/service/dataset.service';
import { DataflowService } from '../dataflow/service/dataflow.service';
import { PopupService } from '../../common/service/popup.service';
import { HiveFileCompression, Engine, PrDataSnapshot, SsType, UriFileFormat } from '../../domain/data-preparation/pr-snapshot';
import { Field } from '../../domain/data-preparation/pr-dataset';
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
  private  uriFileFormat: UriFileFormat;
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public datasetId: string;
  public datasetName : string;
  public fields : Field[];

  public isShow : boolean = false;

  public fileFormat: any[];

  public snapshot: PrDataSnapshot;

  public SsType = SsType;

  public compressionType: any[];

  public overwriteMethod: any[];

  public engineList: any[];

  public hiveTwinkleFormat : any[];

  public hiveEmbeddedFormat : any[];

  public ssName: string;
  public fileLocations: any[];
  public fileUris: any[];

  public hiveTblExist: boolean;
  public hiveTblUntested: boolean;

  public dbList : any [] = []; // db name list

  public isAdvancedPrefOpen : boolean = false;

  public fileLocationDefaultIdx : number = 0;

  @ViewChild('snapshotName')
  public snapshotName : ElementRef;

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
    super.ngOnInit();

  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 화면 초기 실행
   * @param {string} data
   */
  public init(data : {id:string, name : string, fields : Field[]}) {

    this.datasetId = data.id;
    this.datasetName = data.name;
    this.fields = data.fields;
    this.isShow = true;

    this._initialiseValues();

    this.getStagingConfig();

  } // function - init


  /**
   * Close this popup
   */
  public close() {
    super.close();
    this.isAdvancedPrefOpen = false;
    this.snapshotCloseEvent.emit();
    this.isShow = false;

  } // function - close


  /**
   * Complete making snapshot
   */
  public complete() {

    if ( (this.snapshot.ssType===SsType.URI && isUndefined(this.uriFileFormat))
      || (this.snapshot.ssType===SsType.STAGING_DB && isUndefined(this.snapshot.hiveFileFormat))
    ) {
      Alert.warning(this.translateService.instant('msg.dp.alert.ss.sel.format'));
      return;
    }

    if (this.snapshot.ssType === SsType.STAGING_DB) {

      if( this.snapshot.appendMode === this.overwriteMethod[0].value && this.hiveTblUntested===true ) {
        Alert.warning(this.translateService.instant('msg.dp.alert.wait.hive.table'));
        return;
      }

      if (isUndefined(this.snapshot.dbName)) {
        Alert.warning(this.translateService.instant('msg.dp.alert.ss.require.db-name'));
        return;
      }

      if (isUndefined(this.snapshot.tblName) || this.snapshot.tblName === '') {
        Alert.warning(this.translateService.instant('msg.dp.alert.ss.require.table-name'));
        return;
      }

      if (isUndefined(this.snapshot.partitionColNames)) {
        this.snapshot.partitionColNames = [];
      }

      // 테이블 이름 validation
      const reg = /^[a-zA-Z][a-zA-Z0-9_]*$/;
      if(!reg.test(this.snapshot.tblName)){
        Alert.warning('Only numbers, alphabet and _ can be included. Note that numbers and \'_\' can\'t be the first letter of the table name.');
        return;
      }
    }

    if (SsType.URI === this.snapshot.ssType) {
      this.snapshot.hiveFileCompression = HiveFileCompression.NONE;
      this.snapshot.engine = Engine.EMBEDDED;

      if (this.snapshot.storedUri.length < 1){
        Alert.warning(this.translateService.instant('msg.dp.alert.ss.require.file-uri'));
        return;
      }

    }

    this.loadingShow();
    this.dataflowService.createDataSnapshot(this.datasetId, this.snapshot)
      .then((result) => {
        this.loadingHide();
        if (result.errorMsg) {
          Alert.error(result.errorMsg);
        } else {
          // Alert.success(result.ssName + this.translateService.instant('msg.dp.alert.success.create.ss'));
          this.snapshotCreateFinishEvent.emit(result.ssId);
          this.isShow = false;
          this.isAdvancedPrefOpen = false;
        }

      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));

      });

  } // function - complete

  /**
   * When snapshot Name change, modfiy file type uris
   * */
  public chnageSSUri(){
    if(this.snapshot.storedUri && this.snapshot.storedUri.lastIndexOf("/") > 0)
      this.snapshot.storedUri = this.snapshot.storedUri.substring(0,this.snapshot.storedUri.lastIndexOf("/")+1)  +  this.snapshot.ssName.replace(/\s/gi, "")
        + '.'+this.uriFileFormat.toString().toLowerCase();
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
        this.chnageSSUri();
        break;
      case 'location':
        for(let idx=0;idx<this.fileLocations.length;idx++) {
          if( event.value==this.fileLocations[idx].value ) {
            this.snapshot.storedUri = this.fileUris[idx];
            this.chnageSSUri();
            break;
          }
        }
        break;
    }

  } // function - onSelected


  /**
   * When db name is selected
   * @param dbName
   */
  public onSelectedDBName(dbName) {
    this.snapshot['dbName'] = dbName;
  } // function - onSelectedDBName

  /**
   * When part key is selected
   * @param item
   */
  public onPartitionSelected(item) {
    this.snapshot.partitionColNames = item.map(function(x) {
      return x.name;
    });
  } // function - onPartitionSelected

  // 라디오로 타입을 바꿀 때
  /**
   * Change snpshot type
   * @param sstype
   */
  public changeSsType(sstype : SsType) {

    this.snapshot = new PrDataSnapshot();
    //let today = moment();
    //this.snapshot.ssName = `${this.datasetName}_${today.format('YYYYMMDDHHmmss')}`;
    this.snapshot.ssName = this.ssName;
    this.snapshot.ssType = sstype;

    if (sstype === SsType.STAGING_DB) {
      this.snapshot.dbName = this.dbList[0];
      this.snapshot.tblName = 'snapshot1';
      this.snapshot.appendMode = this.overwriteMethod[0].value;
      this.snapshot.engine = this.engineList[0].value;
      this.snapshot.hiveFileFormat = this.hiveEmbeddedFormat[0].value;
      this.snapshot.hiveFileCompression = this.compressionType[0].value;

      this.hiveTblExist = false;
      this.hiveTblUntested = false;

    } else if (sstype === SsType.URI) {

      delete this.snapshot.elapsedTime;
      // delete this.snapshot.location;
      delete this.snapshot.dbName;

      this.uriFileFormat = this.fileFormat[0].value;

      if(0<this.fileLocations.length) {
        let idx = this.fileLocations.findIndex((item) => {
          return item.value.toUpperCase() === 'LOCAL';
        });

        if (idx === -1) {
          idx = 0;
        }
        this.snapshot.storedUri = this.fileUris[idx] ;
        if (['.csv','.json'].indexOf(this.snapshot.storedUri) < 0)
          this.snapshot.storedUri +=  '.' + this.uriFileFormat.toString().toLowerCase();
        this.fileLocationDefaultIdx = idx;
      }
    }

    setTimeout(() => {
      this.snapshotName.nativeElement.select();
    });
  } // function - changeSsType

  /**
   * 고급설정 오픈 여부
   */
  public openAdvancedPref() {
    this.isAdvancedPrefOpen = !this.isAdvancedPrefOpen;
  } // function - openAdvancedPref


  /**
   * Fetch Staging configuration (databases and etc)
   */
  public getStagingConfig() {


    this.dataflowService.getConfiguration(this.datasetId)
      .then((conf) => {

        // SS NAME
        if(conf.hasOwnProperty('ss_name')) {
          this.ssName = conf['ss_name'];
        } else {
          let today = moment();
          this.ssName = `${this.datasetName}_${today.format('YYYYMMDD_HHmmss')}`;
        }
        this.snapshot.ssName = this.ssName;

        // FILE URI
        if(conf.hasOwnProperty('file_uri')) {
          this.fileLocations = [];
          this.fileUris = [];

          for( let locType in conf['file_uri'] ) {
            const loc = locType.toUpperCase();
            this.fileLocations.push( { 'value': loc, 'label': loc } );
            this.fileUris.push( conf['file_uri'][locType] );
          }

          if(0 < this.fileLocations.length) {
            this.snapshot.storedUri = this.fileUris[0];
            if (['.csv','.json'].indexOf(this.snapshot.storedUri) < 0) this.snapshot.storedUri += '.csv';
          }
        }

        if (this.isStagingEnabled()) {
          this._connectionService.getDatabaseForHive().then((data) => {
            this.dbList = [];
            if (data['databases']) {
              this.dbList = data['databases'];
            }

          }).catch((error) => {
            this.commonExceptionHandler(error);
          });
        }

        this.changeSsType(SsType.URI);
        this.loadingHide();
      });

  }


  public isStagingEnabled() :boolean {
    return StorageService.isEnableStageDB
  }


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
  } // function - _onEnterKeydownHandler

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
  } // function - _onKeydownHandler

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

    this.snapshot = new PrDataSnapshot();

    // -------------------
    // File system
    // -------------------

    this.fileFormat = [
      { value: 'CSV', label: 'CSV' },
      { value: 'JSON', label: 'JSON' }
    ];

    this.ssName = '';
    this.fileLocations = [];
    this.fileUris = [];


    // -------------------
    // Hive
    // -------------------

    this.overwriteMethod = [
      { value: 'OVERWRITE', label: 'Overwrite' },
      { value: 'APPEND', label: 'Append' }
    ];

    this.compressionType = [
      { value: 'NONE', label: 'NONE' },
      { value: 'SNAPPY', label: 'SNAPPY' },
      { value: 'ZLIB', label: 'ZLIB' }
    ];

    this.hiveTwinkleFormat = [
      { value: 'ORC', label: 'ORC' },
      { value: 'PARQUET', label: 'PARQUET' }
    ];

    this.hiveEmbeddedFormat = [
      { value: 'ORC', label: 'ORC' },
      { value: 'CSV', label: 'CSV' }
    ];

    this.engineList = [
      { value : 'EMBEDDED', label : 'Embedded Engine' },
      // { value : 'TWINKLE', label : 'Spark' }
    ];

  }

}
