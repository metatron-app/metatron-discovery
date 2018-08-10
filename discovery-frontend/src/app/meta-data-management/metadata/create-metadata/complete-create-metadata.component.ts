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

import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { StringUtil } from '../../../common/util/string.util';
import { CommonUtil } from '../../../common/util/common.util';
import { MetadataService } from '../service/metadata.service';
import { Alert } from '../../../common/util/alert.util';
import { AbstractPopupComponent } from '../../../common/component/abstract-popup.component';
import { MetadataModelService } from '../service/metadata.model.service';
import { DataconnectionService } from '../../../dataconnection/service/dataconnection.service';

@Component({
  selector: 'app-complete-create-metadata',
  templateUrl: './complete-create-metadata.component.html'
})
export class CompleteCreateMetadataComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Output()
  public createComplete: EventEmitter<any> = new EventEmitter();

  // 생성 이름
  public createName: string = '';
  // 생성 설명
  public createDescription: string = '';

  // validation message
  public nameValidationMsg: string = '';
  public descValidationMsg: string = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(public metaDataModelService: MetadataModelService,
              private _metaDataService: MetadataService,
              private _connectionService: DataconnectionService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();
    // init data
    this._initData(this.metaDataModelService.getCreateData());
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
   * 생성 타입 조회
   * @returns {string}
   */
  public getCreateType(): string {
    return this.metaDataModelService.getCreateData()['createType'];
  }

  /**
   * 선택한 데이터소스 조회
   * @returns {Object}
   */
  public getSelectedDatasource(): object {
    return this._getSourceStep()['selectedDatasource'];
  }

  /**
   * 현재 타이틀 label
   * @returns {string}
   */
  public getCompleteTitle(): string {
    if (this.getCreateType() === 'datasource') {
      return this.translateService.instant('msg.metadata.ui.metadata.create.ds.title');
    } else if (this.getCreateType() === 'hive') {
      return this.translateService.instant('msg.metadata.ui.metadata.create.hive.title');
    } else if (this.getCreateType() === 'staging') {
      return this.translateService.instant('msg.metadata.ui.metadata.create.staging.title');
    }
  }

  /**
   * connectionStep 조회
   * @returns {Object}
   * @private
   */
  public getConnectionStep(): object {
    return this.metaDataModelService.getCreateData()['connectionStep'];
  }

  /**
   * schemaStep 조회
   * @returns {Object}
   */
  public getSchemaStep(): object {
    return this.metaDataModelService.getCreateData()['schemaStep'];
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - event
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 이전 클릭 이벤트
   */
  public onClickPrev(): void {
    // 현재 데이터 저장
    this._saveData();
    // 화면 전환
    this.metaDataModelService.setCreateStep(this._getPrevStep());
  }

  /**
   * 완료 이벤트
   */
  public onClickDone(): void {
    // validation && 메타데이터 중복되는지 확인 후 메타데이터 생성
    this._doneValidation() && this._checkEnableMetaDataNameAndCreateMetaData();
  }

  /**
   * 이름 키 입력 이벤트
   */
  public onKeyUpCreateName(): void {
    this.nameValidationMsg = null;
  }

  /**
   * 설명 키 입력 이벤트
   */
  public onKeyUpCreateDescription(): void {
    this.descValidationMsg = null;
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method - validation
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 현재 생성타입과 일치하는지 확인
   * @param {string} type
   * @returns {boolean}
   */
  public isCreateType(type: string): boolean {
    return type === this.getCreateType();
  }

  /**
   * 커넥션이 URL 타입인지
   * @returns {boolean}
   */
  public isUrlType(): boolean {
    return this.getConnectionStep()['selectedUrlType'] === 'URL';
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 데이터 초기화
   * @param {Object} createData
   * @private
   */
  private _initData(createData: object): void {
    // 이름
    createData['createName'] && (this.createName = createData['createName']);
    // 설명
    createData['createDescription'] && (this.createDescription = createData['createDescription']);
    // validation message
    createData['nameValidationMsg'] && (this.nameValidationMsg = createData['nameValidationMsg']);
    createData['descValidationMsg'] && (this.descValidationMsg = createData['descValidationMsg']);
  }

  /**
   * 현재 데이터 저장
   * @private
   */
  private _saveData(): void {
    // 이름
    this.metaDataModelService.patchCreateData('createName', this.createName);
    // 설명
    this.metaDataModelService.patchCreateData('createDescription', this.createDescription);
    // validation message
    this.metaDataModelService.patchCreateData('nameValidationMsg', this.nameValidationMsg);
    this.metaDataModelService.patchCreateData('descValidationMsg', this.descValidationMsg);
  }

  /**
   * done validation
   * @returns {boolean}
   * @private
   */
  private _doneValidation(): boolean {
    // 이름 필수 체크
    if (StringUtil.isEmpty(this.createName)) {
      // message
      this.nameValidationMsg = this.translateService.instant('msg.alert.edit.name.empty');
      return false;
    }
    // 이름 길이 체크
    if (CommonUtil.getByte(this.createName) > 150) {
      // message
      this.nameValidationMsg = this.translateService.instant('msg.alert.edit.name.len');
      return false;
    }
    // 설명 길이 체크
    if (!StringUtil.isEmpty(this.createDescription) && CommonUtil.getByte(this.createDescription.trim()) > 450) {
      // message
      this.descValidationMsg = this.translateService.instant('msg.alert.edit.description.len');
      return false;
    }
    return true;
  }

  /**
   * 메타데이터 생성
   * @private
   */
  private _createMetaData(): void {
    // 로딩 show
    this.loadingShow();
    // 메타데이터 생성하기
    this._metaDataService.createMetaData(this._getCreateMetaDataParams())
      .then((result) => {
        // alert
        Alert.success(this.translateService.instant('msg.metadata.alert.create.success', {value: this.createName.trim()}));
        // complete
        this.createComplete.emit();
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 커넥션 생성
   * @private
   */
  private _createConnection(): void {
    // 로딩 show
    this.loadingShow();
    // 커넥션 생성하기
    this._connectionService.createConnection(this._getCreateConnectionParams())
      .then((result) => {
        this._createMetaData()
      })
      .catch((error) => {
        this.commonExceptionHandler(error);
      });
  }

  /**
   * 메타데이터 이름 중복 체크후 메타데이터 생성
   * @private
   */
  private _checkEnableMetaDataNameAndCreateMetaData(): void {
    // 로딩 show
    this.loadingShow();
    // 논리명이 중복인지 확인
    this._metaDataService.getDuplicateMetaDataName(this.createName.trim())
      .then((result) => {
        // 중복
        if (result['duplicated']) {
          // message
          this.nameValidationMsg = this.translateService.instant('msg.metadata.ui.dictionary.create.valid.logical.name.duplicated', {value: this.createName.trim()});
          // 로딩 hide
          this.loadingHide();
        } else {
          // 생성타입이 HIVE이고 커넥션 생성을 한다면 생성후 메타데이터 생성
          this.isCreateType('hive') && this.getConnectionStep()['createConnectionFl'] ? this._createConnection() : this._createMetaData();
        }
      })
      .catch((error) => {
        // 로딩 hide
        this.loadingHide();
      });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method - getter
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 이전 step 얻기
   * @returns {string}
   * @private
   */
  private _getPrevStep(): string {
    switch (this.getCreateType()) {
      case 'datasource':
        return 'datasource';
      case 'hive':
        return 'hive-schema';
      case 'staging':
        return 'staging';
    }
  }

  /**
   * sourceStep 조회
   * @returns {Object}
   * @private
   */
  private _getSourceStep(): object {
    return this.metaDataModelService.getCreateData()['sourceStep'];
  }

  /**
   * 메타데이터 생성에 필요한 파라메터
   * @returns {Object}
   * @private
   */
  private _getCreateMetaDataParams(): object {
    const params = {
      name: this.createName.trim(),
      description: this.createDescription ?  this.createDescription.trim() : ''
    };
    // data source type
    if (this.isCreateType('datasource')) {
      const source = {
        name: this.getSelectedDatasource()['name'],
        type: this.getSelectedDatasource()['connType'],
        sourceId: this.getSelectedDatasource()['id']
      };
      params['sourceType'] = this.getSelectedDatasource()['connType'];
      params['source'] = source;
    } else if (this.isCreateType('hive')) {
      // hive
      const source = {
        name: this.getConnectionStep()['selectedConnectionPreset'].name,
        type: 'JDBC',
        sourceId: this.getConnectionStep()['selectedConnectionPreset'].id,
        schema: this.getSchemaStep()['selectedDatabase'],
        table: this.getSchemaStep()['selectedTable']
      };
      params['sourceType'] = 'JDBC';
      params['source'] = source;
    } else if (this.isCreateType('staging')) {
      // staging DB
      const source = {
        name: 'Stage DB',
        type: 'STAGE',
        sourceId: 'STAGE',
        schema: this.getSchemaStep()['selectedDatabase'],
        table: this.getSchemaStep()['selectedTable']
      };
      params['sourceType'] = 'STAGING';
      params['source'] = source;
    }
    return params;
  }

  /**
   * 커넥션 생성에 필요한 파라메터
   * @returns {Object}
   * @private
   */
  private _getCreateConnectionParams(): object {
    const params = {
      implementor: this.getConnectionStep()['implementor'],
      type: 'JDBC',
      name: this.getConnectionStep()['connectionName'].trim()
    };
    // username과 password를 사용한다면
    !StringUtil.isEmpty(this.getConnectionStep()['password']) && (params['password'] = this.getConnectionStep()['password'].trim());
    !StringUtil.isEmpty(this.getConnectionStep()['username']) && (params['username'] = this.getConnectionStep()['username'].trim());
    // URL 타입이라면
    if (this.isUrlType()) {
      params['url'] = this.getConnectionStep()['url'].trim();
    } else {
      params['hostname'] = this.getConnectionStep()['hostname'].trim();
      params['port'] = this.getConnectionStep()['port'];
    }
    return params;
  }
}

