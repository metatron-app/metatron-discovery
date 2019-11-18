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

import {Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild} from "@angular/core";
import {MetadataConstant} from "../../metadata.constant";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {ConnectionComponent, ConnectionValid} from "../../../data-storage/component/connection/connection.component";
import {DataconnectionService} from "../../../dataconnection/service/dataconnection.service";
import {PageResult} from "../../../domain/common/page";
import {Dataconnection} from "../../../domain/dataconnection/dataconnection";
import * as _ from 'lodash';
import {MetadataEntity} from "../metadata.entity";
import ConnectionInfo = MetadataEntity.ConnectionInfo;
import {StringUtil} from "../../../common/util/string.util";

@Component({
  selector: 'create-metadata-db-connection',
  templateUrl: 'create-metadata-db-connection.component.html'
})
export class CreateMetadataDbConnectionComponent extends AbstractComponent {

  @ViewChild(ConnectionComponent)
  private _connectionComponent: ConnectionComponent;

  private _connectionDetail: Dataconnection;

  @Input() readonly createData: MetadataEntity.CreateData;

  @Output() readonly changeStep: EventEmitter<MetadataConstant.CreateStep> = new EventEmitter();
  @Output() readonly cancel = new EventEmitter();

  connectionPresetList;
  selectedConnectionPreset;

  // constructor
  constructor(private connectionService: DataconnectionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.createData.isNotEmptyConnectionInfo()) {
      this._loadConnectionInfo(this.createData.connectionInfo);
    } else {
      this._setConnectionPresetList();
      this._connectionComponent.init();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Change selected connection preset
   * @param preset
   */
  onSelectedConnectionPreset(preset): void {
    // change selected connection preset
    this.selectedConnectionPreset = preset;
    // set connection data in connection component
    this._setConnectionPresetDetailDataInConnectionComponent();
  }

  /**
   * Change to next step
   */
  changeToNextStep(): void {
    // set click flag
    if (this._connectionComponent.isEmptyConnectionValidation()) {
      this._connectionComponent.setRequireCheckConnection();
    }
    // next enable validation
    if (this._isEnableConnection()) {
      // if not empty connection info and changed connection
      if (this.createData.isNotEmptyConnectionInfo() && this._isChangedConnection(this.createData.connectionInfo)) {
        this.createData.removeSchemaInfo();
        this.createData.removeCompleteInfo();
      }
      // Set connection info in create data
      this._setConnectionInfoInCreateData();
      this.changeStep.emit(MetadataConstant.CreateStep.DB_SELECT);
    }
  }


  /**
   * Go to set up connection page
   */
  goToCreateConnection(): void {
    this.router.navigate(['management/storage/data-connection'], {queryParams: {isCreateMode: true}}).then();
  }

  /**
   * Set connection preset list
   * @param {number} pageNumber
   */
  setConnectionPresetList(pageNumber: number): void {
    if (this._isMoreConnectionList()) {
      this.pageResult.number = pageNumber;
      // set connection preset list
      this._setConnectionPresetList();
    }
  }

  /**
   * Is empty connection preset list
   * @return {boolean}
   */
  isEmptyConnectionPresetList(): boolean {
    return _.isNil(this.connectionPresetList) || this.connectionPresetList.length === 0;
  }

  /**
   * Is more connection list
   * @return {boolean}
   * @private
   */
  private _isMoreConnectionList(): boolean {
    return this.pageResult.number < this.pageResult.totalPages - 1;
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
   * Is changed connection
   * @param data
   * @return {boolean}
   * @private
   */
  private _isChangedConnection(data): boolean {
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
   * Set connection preset list
   * @private
   */
  private _setConnectionPresetList(): void {
    // loading show
    this.loadingShow();
    // get connection preset list
    this.connectionService.getAllDataconnections(this._getConnectionPresetListParams(this.pageResult), 'forSimpleListView')
      .then((result) => {
        // if exist preset list
        if (result['_embedded']) {
          this.connectionPresetList = _.isNil(this.connectionPresetList) ? result['_embedded'].connections : this.connectionPresetList.concat(result['_embedded'].connections);
        }
        // page
        this.pageResult = result['page'];
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Set connection preset detail data in connection component
   * @private
   */
  private _setConnectionPresetDetailDataInConnectionComponent(): void {
    // loading show
    this.loadingShow();
    //  get connection data in preset
    this.connectionService.getDataconnectionDetail(this.selectedConnectionPreset.id)
      .then((connection: Dataconnection) => {
        // loading hide
        this.loadingHide();
        // init
        this._connectionComponent.init(connection);
        this._connectionDetail = connection;
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
   * Set connection info in createData
   * @private
   */
  private _setConnectionInfoInCreateData(): void {
    this.createData.connectionInfo = new ConnectionInfo(this.connectionPresetList, this.selectedConnectionPreset, this._connectionComponent.getConnectionParams(true), this._connectionDetail, this.pageResult);
  }

  /**
   * Load connection info
   * @param {ConnectionInfo} connectionInfo
   * @private
   */
  private _loadConnectionInfo(connectionInfo: ConnectionInfo): void {
    this.connectionPresetList = connectionInfo.connectionPresetList;
    this.selectedConnectionPreset = connectionInfo.selectedConnectionPreset;
    this.pageResult = connectionInfo.pageResult;
    this._connectionDetail = connectionInfo.connectionDetail;
    // connection
    this._connectionComponent.init(connectionInfo.connection);
    this._connectionComponent.connectionValidation = ConnectionValid.ENABLE_CONNECTION;
  }
}
