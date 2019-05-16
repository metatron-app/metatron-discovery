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

import {
  Component, ElementRef, EventEmitter, Injector, Output, ViewChild
} from '@angular/core';
import { DataconnectionService } from '../../dataconnection/service/dataconnection.service';
import { DeleteModalComponent } from '../../common/component/modal/delete/delete.component';
import { SetWorkspacePublishedComponent } from '../component/set-workspace-published/set-workspace-published.component';
import { CommonUtil } from '../../common/util/common.util';
import { StringUtil } from '../../common/util/string.util';
import {AuthenticationType, Dataconnection} from '../../domain/dataconnection/dataconnection';
import {ConnectionComponent, ConnectionValid} from "../component/connection/connection.component";
import {AbstractComponent} from "../../common/component/abstract.component";
import {Alert} from "../../common/util/alert.util";
import {Modal} from "../../common/domain/modal";
import * as _ from 'lodash';

@Component({
  selector: 'app-update-connection',
  templateUrl: './update-connection.component.html'
})
export class UpdateConnectionComponent extends AbstractComponent {

  @ViewChild('connection_name_element')
  private readonly CONNECTION_NAME_ELEMENT: ElementRef;

  // workspace set component
  @ViewChild(SetWorkspacePublishedComponent)
  private readonly _setWorkspaceComponent: SetWorkspacePublishedComponent;

  // connection component
  @ViewChild(ConnectionComponent)
  private readonly _connectionComponent: ConnectionComponent;

  // confirm popup modal
  @ViewChild(DeleteModalComponent)
  private readonly modalComponent: DeleteModalComponent;

  // connection ID
  private _connectionId: string;
  // origin connection data
  public originConnectionData: Dataconnection;

  // linked workspace number in connection
  public linkedWorkspaces: number;
  // connection name
  public connectionName: string;
  // name input validation
  public isShowConnectionNameRequired: boolean;
  // name validation message
  public nameErrorMsg: string;
  // workspace published
  public published: boolean;
  // show flag
  public isShowPopup: boolean;

  @Output()
  public readonly updatedConnection: EventEmitter<boolean> = new EventEmitter();

  // constructor
  constructor(private connectionService: DataconnectionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * Init
   * @param {string} connectionId
   */
  public init(connectionId: string): void {
    // init
    this.connectionName = undefined;
    this.nameErrorMsg = undefined;
    this.isShowConnectionNameRequired = undefined;
    this.published = undefined;
    this.linkedWorkspaces = undefined;
    // set connection id
    this._connectionId = connectionId;
    // loading show
    this.loadingShow();
    // get connection detail data
    this.connectionService.getDataconnectionDetail(connectionId)
      .then((result: Dataconnection) => {
        // set origin connection data
        this.originConnectionData = result;
        this.published = result.published;
        this.linkedWorkspaces = result.linkedWorkspaces;
        this.connectionName = result.name;
        // loading hide
        this.loadingHide();
        // show popup
        this.isShowPopup = true;
        // detect
        this.safelyDetectChanges();
        // set connection data in component
        this._connectionComponent.init(_.cloneDeep(result));
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Done button click event
   */
  public done(): void {
    // set click flag
    if (this._connectionComponent.isEmptyConnectionValidation()) {
      this._connectionComponent.setRequireCheckConnection();
    }
    // if enable update connection, done modal open
    if (this._isEnableUpdateConnection()) {
      const modal = new Modal();
      modal.data = 'update';
      modal.name = this.translateService.instant('msg.storage.ui.dconn.edit.title');
      modal.description = this.translateService.instant('msg.storage.ui.dconn.edit.description');
      modal.btnName = this.translateService.instant('msg.comm.btn.save');
      this.modalComponent.init(modal);
    }
  }

  /**
   * Cancel button click event
   */
  public cancel(): void {
    this.isShowPopup = undefined;
  }

  /**
   * Confirm modal event
   * @param data
   */
  public confirmModal(data): void {
    // delete
    if (data.data === 'delete') {
      this._deleteConnection();
    } else if (data.data === 'published') {
      this._updatePublished();
    } else {
      this._updateConnection();
    }
  }

  /**
   * Click workspace setting open
   */
  public onClickSetWorkspace(): void {
    this._setWorkspaceComponent.init('connection', 'update', this._connectionId);
  }

  /**
   * Publish connection for workspace click event
   */
  public onClickPublishConnection(): void {
    event.preventDefault();
    const modal = new Modal();
    modal.data = 'published';
    // if connection is published
    if (this.originConnectionData.published) {
      modal.name = `'${this.originConnectionData.name}' ` + this.translateService.instant('msg.storage.alert.dconn.change-selected');
      modal.description = this.translateService.instant('msg.storage.alert.dconn-publish.description');
      modal.btnName = this.translateService.instant('msg.storage.btn.dconn.private');
    } else {
      modal.name = `'${this.originConnectionData.name}' ` + this.translateService.instant('msg.storage.alert.dconn.change-public');
      modal.btnName = this.translateService.instant('msg.storage.btn.dconn.public');
    }
    this.modalComponent.init(modal);
  }

  /**
   * Delete connection click event
   */
  public onClickDeleteConnection(): void {
    const modal = new Modal();
    modal.data = 'delete';
    modal.name = this.translateService.instant('msg.storage.ui.dconn.del.title');
    modal.description = this.translateService.instant('msg.storage.ui.dconn.del.description');
    modal.btnName = this.translateService.instant('msg.storage.btn.dconn.del');
    this.modalComponent.init(modal);
  }

  /**
   * Is enable update connection
   * @return {boolean}
   * @privatedafs
   */
  private _isEnableUpdateConnection(): boolean {
    // check valid connection
    if (!this._connectionComponent.isEnableConnection()) {
      // #1990 scroll into invalid input
      this._connectionComponent.scrollIntoConnectionInvalidInput();
      return false;
    }
    // if empty connection name
    if (StringUtil.isEmpty(this.connectionName)) {
      this.isShowConnectionNameRequired = true;
      this.nameErrorMsg = this.translateService.instant('msg.storage.dconn.name.error');
      // #1990 scroll into invalid input
      this._scrollIntoConnectionNameInput();
      return false;
    }
    // if connection name over 150 byte
    else if (CommonUtil.getByte(this.connectionName.trim()) > 150) {
      this.isShowConnectionNameRequired = true;
      this.nameErrorMsg = this.translateService.instant('msg.alert.edit.name.len');
      // #1990 scroll into invalid input
      this._scrollIntoConnectionNameInput();
      return false;
    }
    // if exist properties and invalid property
    if (this._connectionComponent.isExistProperties() && !this._connectionComponent.isValidProperties()) {
      // #1990 scroll into invalid input
      this._connectionComponent.scrollIntoPropertyInvalidInput();
      return false;
    }
    return true;
  }

  /**
   * Scroll into connection name input
   * @private
   */
  private _scrollIntoConnectionNameInput() {
    this.CONNECTION_NAME_ELEMENT.nativeElement.scrollIntoView();
  }

  /**
   * Is changed properties
   * @returns {boolean}
   * @private
   */
  private _isChangedProperties(): boolean {
    if (this.originConnectionData.properties) {
      // not exist key in properties, different value
      return Object.keys(this.originConnectionData.properties).some((key) => {
        return this._connectionComponent.properties.every((property) => {
          return key !==  property.key || this.originConnectionData.properties[key] !== property.value;
        });
        })
        || this._connectionComponent.properties.some((property) => {
          return !this.originConnectionData.properties.hasOwnProperty(property.key) || property.value !== this.originConnectionData.properties[property.key];
        });
    } else {
      return this._connectionComponent.isExistProperties();
    }
  }

  /**
   * Update connection
   * @private
   */
  private _updateConnection(): void {
    // loading show
    this.loadingShow();
    // update connection
    this.connectionService.updateConnection(this._connectionId, this._getUpdateParams())
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.comm.alert.modify.success'));
        // loading hide
        this.loadingHide();
        // emit
        this.updatedConnection.emit(true);
        // close
        this.cancel();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Delete connection
   * @private
   */
  private _deleteConnection(): void {
    // loading show
    this.loadingShow();
    // delete connection
    this.connectionService.deleteConnection(this._connectionId)
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.storage.alert.dconn.del.success'));
        // loading hide
        this.loadingHide();
        // emit
        this.updatedConnection.emit(true);
        // close
        this.cancel();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Update connection published
   */
  private _updatePublished(): void {
    // loading show
    this.loadingShow();
    // update connection
    this.connectionService.updateConnection(this._connectionId, {published: !this.originConnectionData.published})
      .then((result) => {
        this.originConnectionData.published = this.published = result.published;
        this.originConnectionData.modifiedTime = this.published = result.modifiedTime;
        // alert
        result['published']
          ? Alert.success(this.translateService.instant('msg.storage.alert.dconn-public.success'))
          : Alert.success(this.translateService.instant('msg.storage.alert.dconn-selected.success'));
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get update params in PATCH method
   * @returns {Object}
   * @private
   */
  private _getUpdateParams(): object {
    // only the changed, update
    const params: any = {};
    // if different connection name
    if (this.connectionName.trim() !== this.originConnectionData.name) {
      params.name = this.connectionName.trim();
    }
    // not use URL
    if (!this._connectionComponent.isUsedUrl) {
      // 입력한 host가 다른경우
      if (this._connectionComponent.hostname.trim() !== this.originConnectionData.hostname) {
        params.hostname = this._connectionComponent.hostname.trim();
      }
      // 입력한 port가 다른경우
      if (this._connectionComponent.port !== this.originConnectionData.port) {
        params.port = this._connectionComponent.port;
      }
      // 기존에 URL이 있었다면
      if (StringUtil.isNotEmpty(this.originConnectionData.url)) {
        params.url = '';
      }
      // if enable database and different database
      if (!this._connectionComponent.isDisableDatabase() && this._connectionComponent.database.trim() !== this.originConnectionData.database) {
        params.database = this._connectionComponent.database.trim();
      }
      // if enable SID and different SID
      if (!this._connectionComponent.isDisableSid() && this._connectionComponent.sid.trim() !== this.originConnectionData.sid) {
        params.sid = this._connectionComponent.sid.trim();
      }
      // if enable catalog and different catalog
      if (!this._connectionComponent.isDisableCatalog() && this._connectionComponent.catalog.trim() !== this.originConnectionData.catalog) {
        params.catalog = this._connectionComponent.catalog.trim();
      }
      // if enable URL and different URL
    } else if (this._connectionComponent.url.trim() !== this.originConnectionData.url) {
      params.url = this._connectionComponent.url.trim();
      // if exist hostname or port in origin connection data
      if (this.originConnectionData.hostname || this.originConnectionData.port) {
        params.hostname = '';
        params.port = '';
      }
    }
    // if security type is MANUAL
    if (this._connectionComponent.selectedAuthenticationType.value === AuthenticationType.MANUAL) {
      // if password different
      if (this._connectionComponent.password.trim() !== this.originConnectionData.password) {
        params.password = this._connectionComponent.password.trim();
      }
      // if username different
      if (this._connectionComponent.username.trim() !== this.originConnectionData.username) {
        params.username = this._connectionComponent.username.trim();
      }
    }
    // if changed security type
    if (this.originConnectionData.authenticationType !== this._connectionComponent.selectedAuthenticationType.value) {
      params.authenticationType = this._connectionComponent.selectedAuthenticationType.value;
      // if origin security type is MANUAL, delete username and password
      if (this.originConnectionData.authenticationType === AuthenticationType.MANUAL) {
        params.username = '';
        params.password = '';
      }
    }
    // if changed property
    if (this._isChangedProperties()) {
      params.properties = this._connectionComponent.getProperties();
    }
    return params;
  }
}

