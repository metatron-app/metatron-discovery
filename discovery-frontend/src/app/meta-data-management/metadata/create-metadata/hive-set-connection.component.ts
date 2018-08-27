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

import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataconnectionService } from '../../../dataconnection/service/dataconnection.service';
import { PageResult } from '../../../domain/common/page';
import { StringUtil } from '../../../common/util/string.util';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { MetadataModelService } from '../service/metadata.model.service';

/**
 * Creating metadata with Hive - connection step
 */
@Component({
  selector: 'app-hive-set-connection',
  templateUrl: './hive-set-connection.component.html'
})
export class HiveSetConnectionComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  // connection preset list
  public connectionPresetList: any[] = [];
  // selected connection preset
  public selectedConnectionPreset: any;

  // connection information
  // host
  public hostname: string = '';
  // port
  public port: number;
  // user
  public username: string = '';
  // password
  public password: string = '';
  // url
  public url: string = '';

  // database type list
  public dbTypeList: any[];
  // selected database type
  public selectedDbType: any;

  // security type list
  public securityTypeList: any[];
  // selected security type
  public selectedSecurityType: any;

  // URL enabled flag
  public isEnableUrl: boolean;

  // connection result success flag
  public connectionResultFl: boolean = null;
  // next button flag
  public isClickedNext: boolean;

  // input validation
  public isShowHostRequired: boolean;
  public isShowPortRequired: boolean;
  public isShowUrlRequired: boolean;
  public isShowUsernameRequired: boolean;
  public isShowPasswordRequired: boolean;

  // constructor
  constructor(public metaDataModelService: MetadataModelService,
              private _dataconnectionService: DataconnectionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }


  /**
   * ngOnInit
   */
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // ui init
    this._initView();
    // if exist connectionStep, load data
    this.metaDataModelService.getCreateData()['connectionStep'] && this._loadData(this.metaDataModelService.getCreateData()['connectionStep']);
    // if not exist preset list, get preset list
    this.connectionPresetList.length === 0 && this._getConnectionPresetList();
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * Get selectedConnectionPreset index in connectionPreset list
   * @returns {number}
   */
  public getConnectionDefaultIndex(): number {
    return this.selectedConnectionPreset
      ? this.connectionPresetList.findIndex((item) => {
        return item.name === this.selectedConnectionPreset.name;
      })
      : -1;
  }

  /**
   * Is enable connection validation
   * @returns {boolean}
   */
  public isEnabledConnectionValidation() : boolean {
    let result: boolean = true;
    // if disable URL
    if (!this.isEnableUrl) {
      // if empty hostname
      if (StringUtil.isEmpty(this.hostname)) {
        this.isShowHostRequired = true;
        result = false;
      }
      // if empty port
      if (!this.port) {
        this.isShowPortRequired = true;
        result = false;
      }
      // if enable URL and, empty URL
    } else if (StringUtil.isEmpty(this.url)) {
      this.isShowUrlRequired = true;
      result = false;
    }
    // if empty username
    if (this.selectedSecurityType.value !== 'USERINFO' && StringUtil.isEmpty(this.username)) {
      this.isShowUsernameRequired = true;
      result = false;
    }
    // if empty password
    if (this.selectedSecurityType.value !== 'USERINFO' && StringUtil.isEmpty(this.password)) {
      this.isShowPasswordRequired = true;
      result = false;
    }
    return result;
  }

  /**
   * Next button click event
   */
  public onClickNext(): void {
    // clicked next button flag
    this.isClickedNext = true;
    // if enable next
    if (this.connectionResultFl) {
      // save data
      this._saveData();
      // go to schema step
      this.metaDataModelService.setCreateStep('hive-schema');
    }
  }

  /**
   * Connection validation click event
   */
  public onClickConnectionValidation(): void {
    // if enable connection validation, connection test
    this.isEnabledConnectionValidation() && this._getConnectionTestResult();
  }

  /**
   * Scroll select box event
   * @param number
   */
  public onScrollSelectBoxPage(number): void {
    // if get more page
    if (this.pageResult.number < this.pageResult.totalPages - 1) {
      // set page object
      this.pageResult.number = number;
      // get preset list
      this._getConnectionPresetList();
    }
  }

  /**
   * Change connection prest event
   * @param preset
   */
  public onSelectedConnectionPreset(preset: any): void {
    // selected connection preset
    this.selectedConnectionPreset = preset;
    // init connection result flag
    this.connectionResultFl = null;
    // delete schema step
    this._deleteSchemaStep();
    // init connection flag
    this._initConnectionFlag();
    // get preset detail data
    this._getConnectionPresetDetailData(preset);
  }

  /**
   * init UI
   * @private
   */
  private _initView(): void {
    this.dbTypeList = this.getEnabledConnectionTypes(true);
    this.selectedDbType = this.dbTypeList.find(type => type.value === 'HIVE');
    this.securityTypeList = [
      { label: this.translateService.instant('msg.storage.li.connect.always'), value: 'MANUAL' },
      { label: this.translateService.instant('msg.storage.li.connect.account'), value: 'USERINFO' },
      { label: this.translateService.instant('msg.storage.li.connect.id'), value: 'DIALOG' }
    ];
    this.selectedSecurityType = this.securityTypeList[0];
    // page result
    this.pageResult.number = 0;
    this.pageResult.size = 20;
  }

  /**
   * init connection data
   * @private
   */
  private _initConnectionData(): void {
    this.hostname = '';
    this.port = null;
    this.username = '';
    this.password = '';
    this.url = '';
    this.isEnableUrl = false;
  }

  /**
   * init connection input flag
   * @private
   */
  public _initConnectionFlag(): void {
    this.isShowHostRequired = null;
    this.isShowPortRequired = null;
    this.isShowUrlRequired = null;
    this.isShowUsernameRequired = null;
    this.isShowPasswordRequired = null;
  }

  /**
   * Save connection step data
   * @private
   */
  private _saveData(): void {
    const connectionStep = {
      // enable URL flag
      isEnableUrl: this.isEnableUrl,
      // connection preset list
      connectionPresetList: this.connectionPresetList,
      // selected preset
      selectedConnectionPreset: this.selectedConnectionPreset,
      // host
      hostname: this.hostname,
      // port
      port: this.port,
      // username
      username: this.username,
      // password
      password: this.password,
      // url
      url: this.url,
      // connection valid result flag
      connectionResultFl: this.connectionResultFl,
      // preset page result
      pageResult: this.pageResult,
      // selected Security Type
      selectedSecurityType: this.selectedSecurityType,
      // selected database type
      selectedDbType: this.selectedDbType,
    };
    this.metaDataModelService.patchCreateData('connectionStep', connectionStep);
  }

  /**
   * Load connection step data
   * @param {Object} connectionStep
   * @private
   */
  private _loadData(connectionStep: object): void {
    // enable URL flag
    connectionStep['isEnableUrl'] && (this.isEnableUrl = connectionStep['isEnableUrl']);
    // preset list
    connectionStep['connectionPresetList'] && (this.connectionPresetList = connectionStep['connectionPresetList']);
    // selected preset
    connectionStep['selectedConnectionPreset'] && (this.selectedConnectionPreset = connectionStep['selectedConnectionPreset']);
    // host
    connectionStep['hostname'] && (this.hostname = connectionStep['hostname']);
    // port
    connectionStep['port'] && (this.port = connectionStep['port']);
    // user
    connectionStep['username'] && (this.username = connectionStep['username']);
    // password
    connectionStep['password'] && (this.password = connectionStep['password']);
    // url
    connectionStep['url'] && (this.url = connectionStep['url']);
    // connection valid result flag
    connectionStep['connectionResultFl'] && (this.connectionResultFl = connectionStep['connectionResultFl']);
    // preset page result
    connectionStep['pageResult'] && (this.pageResult = connectionStep['pageResult']);
    // selected security type
    connectionStep['selectedSecurityType'] && (this.selectedSecurityType = connectionStep['selectedSecurityType']);
    // selected database type
    connectionStep['selectedDbType'] && (this.selectedDbType = connectionStep['selectedDbType']);
  }

  /**
   * Setting connection data
   * @param connection
   * @private
   */
  private _setConnection(connection): void {
    // if enable URL, add URL
    if (StringUtil.isNotEmpty(connection.url)) {
      this.url = connection.url;
      this.isEnableUrl = true;
    }
    // hostname
    StringUtil.isNotEmpty(connection.hostname) && (this.hostname = connection.hostname);
    // port
    StringUtil.isNotEmpty(connection.port) && (this.port = connection.port);
    // security
    this.selectedSecurityType = this.securityTypeList.find(type => type.value === connection.authenticationType) || this.securityTypeList[0];
    // if security type is MANUAL, add password and username
    if (this.selectedSecurityType.value === 'MANUAL') {
      this.password = connection.password;
      this.username = connection.username;
    }
  }

  /**
   * Delete schemaStep data
   * @private
   */
  private _deleteSchemaStep(): void {
    this.metaDataModelService.getCreateData().hasOwnProperty('schemaStep') && (this.metaDataModelService.patchCreateData('schemaStep' , null));
  }

  /**
   * Get connection test result
   * @private
   */
  private _getConnectionTestResult(): void {
    // loading show
    this.loadingShow();
    // connection test
    this._dataconnectionService.checkConnection(this._getConnectionTestParams())
      .then((result) => {
        // set connection result flag
        this.connectionResultFl = result['connected'];
        // loading hide
        this.loadingHide();
      })
      .catch((error) => {
        // set connection result fail
        this.connectionResultFl = false;
        // loading hide
        this.commonExceptionHandler(error);
      });
  }

  /**
   * Get connection preset list
   * @private
   */
  private _getConnectionPresetList(): void {
    // loading show
    this.loadingShow();
    // get preset list
    this._dataconnectionService.getAllDataconnections(this._getConnectionPresetListParams(this.pageResult), 'forSimpleListView')
      .then((result) => {
        // if exist _embedded, update preset list
        result['_embedded'] && (this.connectionPresetList = this.connectionPresetList.concat(result['_embedded'].connections));
        // set page object
        this.pageResult = result['page'];
        // loading hide
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get selected preset detail data
   * @param preset
   * @private
   */
  private _getConnectionPresetDetailData(preset: any): void {
    // loading show
    this.loadingShow();
    // get detail data
    this._dataconnectionService.getDataconnectionDetail(preset.id)
      .then((result) => {
        // init connection data
        this._initConnectionData();
        // set connection
        this._setConnection(result);
        // loading hide
        this.loadingHide();
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
      implementor: this.selectedDbType.value,
      type: 'jdbc'
    };
  }

  /**
   * Get parameter for connection test
   * @returns {Object}
   * @private
   */
  private _getConnectionTestParams(): object {
    const connection = {
      implementor: this.selectedDbType.value,
      authenticationType: this.selectedSecurityType.value,
    };
    // if security type is not USERINFO, add password and username
    if (this.selectedSecurityType.value !== 'USERINFO') {
      connection['username'] = this.username;
      connection['password'] = this.password;
    }
    // if enable URL, add url in connection
    if (this.isEnableUrl) {
      connection['url'] = this.url;
    } else {
      connection['hostname'] = this.hostname;
      connection['port'] = this.port;
    }
    return { connection: connection };
  }
}

