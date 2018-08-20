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
import { Compression, DataSnapshot, SsType } from '../../domain/data-preparation/data-snapshot';
import { Field } from '../../domain/data-preparation/dataset';

@Component({
  selector: 'create-snapshot-popup',
  templateUrl: './create-snapshot-popup.component.html',
})
export class CreateSnapshotPopup extends AbstractPopupComponent implements OnInit,OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public datasetId: string;
  public datasetName : string;
  public fields : Field[];

  public isShow : boolean = false;

  public fileFormat: any[];

  public snapshot: DataSnapshot;

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

  public isHiveDisable : boolean = false;
  public isAdvancedPrefOpen : boolean = false;

  @ViewChild('snapshotName')
  public snapshotName : ElementRef;

  @Output()
  public snapshotCreateFinishEvent = new EventEmitter();

  @Output()
  public snapshotCloseEvent = new EventEmitter();
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(protected popupService: PopupService,
              protected dataflowService: DataflowService,
              protected datasetService: DatasetService,
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

  }

  // Destory
  public ngOnDestroy() {

    // Destory
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

    this.getConfig();
    //this.getHiveDatabase();

    this.changeSsType('FILE');
  } // function - init


  /**
   * Close this popup
   */
  public close() {
    super.close();
    this.snapshotCloseEvent.emit();
    this.isShow = false;

  } // function - close


  /**
   * Complete making snapshot
   */
  public complete() {

    // validation..
    if (isUndefined(this.snapshot.format)) {
      Alert.warning(this.translateService.instant('msg.dp.alert.ss.sel.format'));
      return;
    }

    if (this.snapshot.ssType.toString() === 'HIVE') {

      if( this.snapshot.mode === this.overwriteMethod[0].value && this.hiveTblUntested===true ) {
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

      if (isUndefined(this.snapshot.partKeys)) {
        this.snapshot.partKeys = [];
      }

      // 테이블 이름 validation
      const reg = /^[a-zA-Z][a-zA-Z0-9_]*$/;
      if(!reg.test(this.snapshot.tblName)){
        Alert.warning('Only numbers, alphabet and _ can be included. Note that numbers and \'_\' can\'t be the first letter of the table name.');
        return;
      }
    }

    if (SsType.FILE === this.snapshot.ssType) {
      this.snapshot.compression = Compression.NONE;
      this.snapshot.engine = "EMBEDDED";

      // 변경한 게 없으면 보내지 않음
      for(let idx=0;idx<this.fileLocations.length;idx++) {
        if( this.snapshot.location == this.fileLocations[idx].value ) {
          if( this.snapshot.uri == this.fileUris[idx] ) {
            delete this.snapshot.uri;
          }
          break;
        }
      }

      if ('HDFS' === this.snapshot.location) {
        this.snapshot.ssType = SsType.HDFS;
      }
      delete this.snapshot.location
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
        }

      })
      .catch((error) => {
        this.loadingHide();
        let prep_error = this.dataprepExceptionHandler(error);
        PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));

      });

  } // function - complete

  /**
   * When item is selected from the list
   * @param event
   * @param type
   * */
  public onSelected(event,type) {
    this.snapshot[type] = event.value;
    if ('EMBEDDED' === event.value) {
      this.snapshot.format = this.hiveEmbeddedFormat[0].value;
    }
    if (type=='location') {
      for(let idx=0;idx<this.fileLocations.length;idx++) {
        if( event.value==this.fileLocations[idx].value ) {
          this.snapshot.location = this.fileLocations[idx].value;
          this.snapshot.uri = this.fileUris[idx];
          break;
        }
      }
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
    this.snapshot.partKeys = item.map(function(x) {
      return x.name;
    });
  } // function - onPartitionSelected

  // 라디오로 타입을 바꿀 때
  /**
   * Change snpshot type
   * @param sstype
   */
  public changeSsType(sstype) {

    this.snapshot = new DataSnapshot();
    //let today = moment();
    //this.snapshot.ssName = `${this.datasetName}_${today.format('YYYYMMDDHHmmss')}`;
    this.snapshot.ssName = this.ssName;
    this.snapshot.ssType = sstype;

    if (!this.isHiveDisable && sstype === 'HIVE') {
      this.snapshot.dbName = this.dbList[0];
      this.snapshot.tblName = 'snapshot1';
      this.snapshot.mode = this.overwriteMethod[0].value;
      this.snapshot.engine = this.engineList[0].value;
      this.snapshot.format = this.hiveEmbeddedFormat[0].value;
      this.snapshot.compression = this.compressionType[0].value;

      this.hiveTblExist = false;
      this.hiveTblUntested = false;

    } else if (sstype === 'FILE') {

      delete this.snapshot.elapsedTime;
      // delete this.snapshot.location;
      delete this.snapshot.dbName;

      this.snapshot.ssType = SsType.FILE;
      this.snapshot.format = this.fileFormat[0].value;

      //this.snapshot.location = this.fileLocations[0].value;
      if(0<this.fileLocations.length) {
        this.snapshot.location = this.fileLocations[0].value;
        this.snapshot.uri = this.fileUris[0];
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

  public getConfig() {
      this.loadingShow();
      this.dataflowService.getConfiguration(this.datasetId)
        .then((conf) => {
          if( !isUndefined(conf['ss_name']) ) {
            this.ssName = conf['ss_name'];
          } else {
            let today = moment();
            this.ssName = `${this.datasetName}_${today.format('YYYYMMDD_HHmmss')}`;
          }
          this.snapshot.ssName = this.ssName;

          if( !isUndefined(conf['file_uri']) ) {
            this.fileLocations = [];
            this.fileUris = [];
            for( let locType in conf['file_uri'] ) {
              let loc = locType.toUpperCase();
              this.fileLocations.push( { 'value': loc, 'label': loc } );
              this.fileUris.push( conf['file_uri'][locType] );
            }
            if(0<this.fileLocations.length) {
              this.snapshot.location = this.fileLocations[0].value;
              this.snapshot.uri = this.fileUris[0];
            }
          }

          if( !isUndefined(conf['hive_info']) ) {
            let connInfo: any = {};
            connInfo.implementor = 'HIVE';
            connInfo.hostname = conf['hive_info'].hostname;
            connInfo.port = conf['hive_info'].port;
            connInfo.username = conf['hive_info'].username;
            connInfo.password = conf['hive_info'].password;
            connInfo.url = conf['hive_info'].custom_url;
            //connInfo.nothing = conf['hive_info'].metastore_uris;

            this.datasetService.setConnInfo(connInfo);
            this.isHiveDisable = false;

            this.datasetService.getStagingSchemas().then((data) => {
              this.dbList = data;
              this.snapshot.dbName = data[0];
              if (this.dbList.length === 0 ) {
                this.isHiveDisable = true;
              }
            }).catch(() => {
              this.isHiveDisable = true;
            });
          } else {
            this.isHiveDisable = true;
          }

          this.loadingHide();
        })
        .catch((error) => {
          this.loadingHide();
          let prep_error = this.dataprepExceptionHandler(error);
          PreparationAlert.output(prep_error, this.translateService.instant(prep_error.message));
        });
  }

  /**
   * 데이터베이스 리스트 가져오기
   */
  public getHiveDatabase() {

    this.loadingShow();
    this.datasetService.getStagingConnectionInfo().then((data) => {
      this.loadingHide();
      this.datasetService.setConnInfo(data);
      this.datasetService.getStagingSchemas().then((data) => {
        this.dbList = data;
        this.snapshot.dbName = data[0];
        if (this.dbList.length === 0 ) {
          this.isHiveDisable = true;
        }
        this.loadingHide();
      }).catch(() => {
        this.isHiveDisable = true;
        this.loadingHide();
      });
    }).catch(()=> {
      this.loadingHide();
      this.isHiveDisable = true;
    });

  } // function - getHiveDatabase

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

    this.snapshot = new DataSnapshot();

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
    /*
    this.fileLocations = [
      { value: 'WAS', label: 'WAS' },
      { value: 'HDFS', label: 'HDFS' }
    ];
    */

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
      { value : 'TWINKLE', label : 'Spark' }
    ];

  }

}
