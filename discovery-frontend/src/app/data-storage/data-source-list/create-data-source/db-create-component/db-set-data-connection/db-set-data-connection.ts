/*
 *
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
import {
  Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit,
  Output, ViewChild
} from '@angular/core';
import { AbstractPopupComponent } from '../../../../../common/component/abstract-popup.component';
import {
  ConnectionType, DatasourceInfo
} from '../../../../../domain/datasource/datasource';
import { DataconnectionService } from '../../../../../dataconnection/service/dataconnection.service';
import * as _ from 'lodash';
import { PageResult } from '../../../../../domain/common/page';
import { StringUtil } from '../../../../../common/util/string.util';
import {ConnectionComponent, ConnectionValid} from "../../../../component/connection/connection.component";
import {CommonUtil} from "../../../../../common/util/common.util";
import {Dataconnection} from "../../../../../domain/dataconnection/dataconnection";

/**
 * Creating datasource with Database - connection step
 */
@Component({
  selector: 'db-data-connection',
  templateUrl: './db-set-data-connection.html'
})
export class DbSetDataConnection extends AbstractPopupComponent implements OnInit, OnDestroy {

  // connection component
  @ViewChild(ConnectionComponent)
  private readonly _connectionComponent: ConnectionComponent;

  // create source data
  private _sourceData: DatasourceInfo;

  // connection preset list
  public connectionPresetList: any[] = [{name: this.translateService.instant('msg.storage.ui.user.input'), default: true}];
  // selected connection preset
  public selectedConnectionPreset: any;

  @Input('sourceData')
  public set setSourceData(sourceData: DatasourceInfo) {
    this._sourceData = sourceData;
  }

  @Input()
  public step: string;

  @Output()
  public stepChange: EventEmitter<string> = new EventEmitter();


  // ingestion type list
  public ingestionTypeList: any[];
  // selected ingestion type
  public selectedIngestionType: any;

  // constructor
  constructor(private dataconnectionService: DataconnectionService,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
  }

  /**
   * ngOnInit
   */
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // ui 초기화
    this._initView();
    // if exist connectionData, load connectionData
    if (this._sourceData.hasOwnProperty('connectionData')) {
      this._loadData(_.cloneDeep(this._sourceData.connectionData));
    } else {
      // get connection preset list
      this._getDataConnectionPresetList();
      this._connectionComponent.init();
    }
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    // Destory
    super.ngOnDestroy();
  }

  /**
   * Next click event
   */
  public next(): void {
    // set click flag
    if (this._connectionComponent.isEmptyConnectionValidation()) {
      this._connectionComponent.setRequireCheckConnection();
    }
    // next enable validation
    if (this._isEnableConnection()) {
      // if exist connectionData
      if (this._sourceData.hasOwnProperty('connectionData')) {
        // if changed connectionData, delete databaseData, schemaData, ingestionData
        if (this._isChangeConnection(this._sourceData.connectionData)) {
          delete this._sourceData.databaseData;
          delete this._sourceData.schemaData;
          delete this._sourceData.ingestionData;
        }
        // if change ingestion type
        else if (this._sourceData.connectionData.selectedIngestionType.value !== this.selectedIngestionType.value) {
          delete this._sourceData.ingestionData;
        }
        // delete connectionData
        delete this._sourceData.connectionData;
      }
      // save connectionData
      this._saveConnectionData(this._sourceData);
      // move to next step
      this.step = 'db-select-data';
      this.stepChange.emit(this.step);
    }
  }


  /**
   * Get selectedConnectionPreset index in connectionPreset list
   * @returns {number}
   */
  public getConnectionDefaultIndex(): number {
    // 커넥션 있을때만 작동
    return this.selectedConnectionPreset && this.selectedConnectionPreset.id
      ? this.connectionPresetList.findIndex((item) => {
          return item.id === this.selectedConnectionPreset.id;
        })
      : 0;
  }

  /**
   * Change ingestion type click event
   * @param type
   */
  public onChangeIngestionType(type: any): void {
    this.selectedIngestionType = type;
    this._sourceData.connType = type.value;
  }

  /**
   * Change connection preset click event
   * @param preset
   */
  public onSelectedConnectionPreset(preset): void {
    // change selected connection preset
    this.selectedConnectionPreset = preset;
    // if exist preset id
    if (!this.selectedConnectionPreset.default) {
      // get connection data in preset
      this._getConnectionPresetDetailData();
    } else {
      this._connectionComponent.properties = [];
    }
  }

  /**
   * Preset list scroll event
   * @param number
   */
  public onScrollPage(number): void {
    // if remain next page
    if (this._isMorePage()) {
      // save pageResult
      this.pageResult.number = number;
      // get more preset list
      this._getDataConnectionPresetList();
    }
  }

  /**
   * Is more next page
   * @returns {boolean}
   * @private
   */
  private _isMorePage(): boolean {
    return (this.pageResult.number < this.pageResult.totalPages - 1);
  }

  /**
   * Is change connection data
   * @param prevConnection
   * @returns {boolean}
   * @private
   */
  private _isChangeConnection(data: any): boolean {
    const connection = this._connectionComponent.getConnectionParams();
    // implementor type
    if (data.connection.implementor !== connection.implementor) {
      return true;
    }
    // if used url
    if (StringUtil.isEmpty(data.connection.url) !== StringUtil.isEmpty(connection.url)) {
      return true;
    }
    // hostname
    if (data.connection.hostname !== connection.hostname) {
      return true;
    }
    // port
    if (data.connection.port !== connection.port) {
      return true;
    }
    // url
    if (data.connection.url !== connection.url) {
      return true;
    }
    // database
    if (data.connection.database !== connection.database) {
      return true;
    }
    // catalog
    if (data.connection.catalog !== connection.catalog) {
      return true;
    }
    // sid
    if (data.connection.sid !== connection.sid) {
      return true;
    }
    // if change authentication type
    if (data.connection.authenticationType !== connection.authenticationType) {
      return true;
    }
    // if change username
    if (data.connection.username !== connection.username) {
      return true;
    }
    // if change password
    if (data.connection.password !== connection.password) {
      return true;
    }
    return false;
  }

  /**
   * Is enable connection
   * @return {boolean}
   * @private
   */
  private _isEnableConnection(): boolean {
    // check valid connection
    if (!this._connectionComponent.isEnableConnection()) {
      // #1990 scroll into invalid input
      this._connectionComponent.scrollIntoConnectionInvalidInput();
      return false;
    } else {
      return true;
    }
  }

  /**
   * Get connection preset list
   * @private
   */
  private _getDataConnectionPresetList(): void {
    // loading show
    this.loadingShow();
    // get connection preset list
    this.dataconnectionService.getAllDataconnections(this._getConnectionPresetListParams(this.pageResult), 'forSimpleListView')
      .then((result) => {
        // if exist preset list
        if (result['_embedded']) {
          this.connectionPresetList = this.connectionPresetList.concat(result['_embedded'].connections);
        }
        // page
        this.pageResult = result['page'];
        // loading hide
        this.loadingHide();
      })
     .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get connection data in preset
   * @private
   */
  private _getConnectionPresetDetailData(): void {
    // loading show
    this.loadingShow();
    //  get connection data in preset
    this.dataconnectionService.getDataconnectionDetail(this.selectedConnectionPreset.id)
      .then((connection: Dataconnection) => {
        // loading hide
        this.loadingHide();
        this._connectionComponent.init( connection);
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get parameter for connection preset list
   * @param {PageResult} pageResult
   * @returns {Object}
   * @private
   */
  private _getConnectionPresetListParams(pageResult: PageResult): object {
    return {
      size: pageResult.size,
      page: pageResult.number,
      type: 'jdbc'
    };
  }

  /**
   * 현재 페이지의 커넥션 데이터 저장
   * @param {DatasourceInfo} sourceData
   * @private
   */
  private _saveConnectionData(sourceData: DatasourceInfo) {
    const connectionData = {
      connectionPresetList: this.connectionPresetList,
      selectedConnectionPreset: this.selectedConnectionPreset,
      selectedIngestionType: this.selectedIngestionType,
      pageResult: this.pageResult,
      // input
      connection: this._connectionComponent.getConnectionParams(true),
    };
    sourceData['connectionData'] = connectionData;
  }

  /**
   * ui init
   * @private
   */
  private _initView() {
    // 선택한 프리셋
    this.selectedConnectionPreset = this.connectionPresetList[0];
    // ingestion 타입 목록
    this.ingestionTypeList = [
      { label : this.translateService.instant('msg.storage.ui.list.ingested.data'), value : ConnectionType.ENGINE },
      { label : this.translateService.instant('msg.storage.ui.list.linked.data'), value : ConnectionType.LINK }
    ];
    // 선택한 ingestion 타입 목록
    this.selectedIngestionType = this.ingestionTypeList[0];
    // page result
    this.pageResult.number = 0;
    this.pageResult.size = 20;
  }

  /**
   * load connection data
   * @param connectionData
   * @private
   */
  private _loadData(connectionData: any) {
    this.connectionPresetList = connectionData.connectionPresetList;
    this.selectedConnectionPreset = connectionData.selectedConnectionPreset;
    this.selectedIngestionType = connectionData.selectedIngestionType;
    this.pageResult = connectionData.pageResult;
    // input init
    this._connectionComponent.init(connectionData.connection);
    this._connectionComponent.connectionValidation = ConnectionValid.ENABLE_CONNECTION;
  }
}
