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

import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {StringUtil} from '../../../common/util/string.util';
import {CommonUtil} from '../../../common/util/common.util';
import {MetadataService} from '../service/metadata.service';
import {Alert} from '../../../common/util/alert.util';
import {AbstractPopupComponent} from '../../../common/component/abstract-popup.component';
import {MetadataModelService} from '../service/metadata.model.service';

/**
 * Creating metadata - complete step
 */
@Component({
  selector: 'app-complete-create-metadata',
  templateUrl: './complete-create-metadata.component.html',
})
export class CompleteCreateMetadataComponent extends AbstractPopupComponent implements OnInit, OnDestroy {

  @Output()
  public createComplete: EventEmitter<any> = new EventEmitter();

  // metadata name
  public createName: string = '';
  // metadata description
  public createDescription: string = '';

  // validation message
  public nameValidationMsg: string = '';
  public descValidationMsg: string = '';

  // constructor
  constructor(
    public metaDataModelService: MetadataModelService,
    private _metaDataService: MetadataService,
    protected element: ElementRef,
    protected injector: Injector) {
    super(element, injector);
  }

  /**
   * ngOnInit
   */
  public ngOnInit() {
    super.ngOnInit();
    // init data
    this._initData(this.metaDataModelService.getCreateData());
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
   * Get metadata create type
   * @returns {string}
   */
  public getCreateType(): string {
    return this.metaDataModelService.getCreateData()['createType'];
  }

  /**
   * Get selected datasource
   * @returns {any}
   */
  public getSelectedDatasource(): any {
    return this._getSourceStep()['selectedDatasource'];
  }

  /**
   * Get complete step title
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
   * Get connectionStep data
   * @returns {any}
   * @private
   */
  public getConnectionStep(): any {
    return this.metaDataModelService.getCreateData()['connectionStep'];
  }

  /**
   * Get schemaStep data
   * @returns {any}
   */
  public getSchemaStep(): any {
    return this.metaDataModelService.getCreateData()['schemaStep'];
  }

  /**
   * Prev button click event
   */
  public onClickPrev(): void {
    // save complete step data
    this._saveData();
    // go to prev step
    this.metaDataModelService.setCreateStep(this._getPrevStep());
  }

  /**
   * Done button click event
   */
  public onClickDone(): void {
    // if enable done button, check duplicate name and create metadata
    this._doneValidation() && this._checkEnableMetaDataNameAndCreateMetaData();
  }

  /**
   * Name keyup event
   */
  public onKeyUpCreateName(): void {
    this.nameValidationMsg = null;
  }

  /**
   * Description keyup event
   */
  public onKeyUpCreateDescription(): void {
    this.descValidationMsg = null;
  }

  /**
   * Is equal create type
   * @param {string} type
   * @returns {boolean}
   */
  public isCreateType(type: string): boolean {
    return type === this.getCreateType();
  }

  /**
   * Load complete step data
   * @param {Object} createData
   * @private
   */
  private _initData(createData: object): void {
    // name
    createData['createName'] && (this.createName = createData['createName']);
    // description
    createData['createDescription'] && (this.createDescription = createData['createDescription']);
    // validation message
    createData['nameValidationMsg'] && (this.nameValidationMsg = createData['nameValidationMsg']);
    createData['descValidationMsg'] && (this.descValidationMsg = createData['descValidationMsg']);
  }

  /**
   * Save complete step data
   * @private
   */
  private _saveData(): void {
    // name
    this.metaDataModelService.patchCreateData('createName', this.createName);
    // description
    this.metaDataModelService.patchCreateData('createDescription', this.createDescription);
    // validation message
    this.metaDataModelService.patchCreateData('nameValidationMsg', this.nameValidationMsg);
    this.metaDataModelService.patchCreateData('descValidationMsg', this.descValidationMsg);
  }

  /**
   * Is enable done validation
   * @returns {boolean}
   * @private
   */
  private _doneValidation(): boolean {
    // if empty create name
    if (StringUtil.isEmpty(this.createName)) {
      // message
      this.nameValidationMsg = this.translateService.instant('msg.alert.edit.name.empty');
      return false;
    }
    // if create name over 150
    if (CommonUtil.getByte(this.createName) > 150) {
      // message
      this.nameValidationMsg = this.translateService.instant('msg.alert.edit.name.len');
      return false;
    }
    // if empty description
    if (!StringUtil.isEmpty(this.createDescription) && CommonUtil.getByte(this.createDescription.trim()) > 450) {
      // message
      this.descValidationMsg = this.translateService.instant('msg.alert.edit.description.len');
      return false;
    }
    return true;
  }

  /**
   * Create metadata
   * @private
   */
  private _createMetaData(): void {
    // 로딩 show
    this.loadingShow();
    // 메타데이터 생성하기
    this._metaDataService.createMetaData(this._getCreateMetaDataParams()).then((result) => {
      // alert
      Alert.success(
        this.translateService.instant('msg.metadata.alert.create.success', {value: this.createName.trim()}));
      // complete
      this.loadingHide();
      this.createComplete.emit();
    }).catch((error) => {
      this.loadingHide();
      this.commonExceptionHandler(error);
    });
  }

  /**
   * 메타데이터 이름 중복 체크후 메타데이터 생성
   * @private
   */
  private _checkEnableMetaDataNameAndCreateMetaData(): void {
    // loading show
    this.loadingShow();
    // check duplicate name
    this._metaDataService.getDuplicateMetaDataName(this.createName.trim()).then((result) => {
      // if duplicated
      if (result['duplicated']) {
        // message
        this.nameValidationMsg = this.translateService.instant(
          'msg.metadata.ui.dictionary.create.valid.logical.name.duplicated', {value: this.createName.trim()});
        // loading hide
        this.loadingHide();
      } else {
        this._createMetaData();
      }
    }).catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Get prev step
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
   * Get sourceStep data
   * @returns {Object}
   * @private
   */
  private _getSourceStep(): object {
    return this.metaDataModelService.getCreateData()['sourceStep'];
  }

  /**
   * Get parameter for create metadata
   * @returns {Object}
   * @private
   */
  private _getCreateMetaDataParams(): object {
    const params = {
      name: this.createName.trim(),
      description: this.createDescription ? this.createDescription.trim() : '',
    };
    // data source type
    if (this.isCreateType('datasource')) {
      const source = {
        name: this.getSelectedDatasource()['name'],
        // type: this.getSelectedDatasource()['connType'],
        type: 'ENGINE',
        sourceId: this.getSelectedDatasource()['id'],
      };
      // params['sourceType'] = this.getSelectedDatasource()['connType'];
      params['sourceType'] = 'ENGINE';
      params['source'] = source;
    } else if (this.isCreateType('hive')) {
      // hive
      const source = {
        name: this.getConnectionStep()['selectedConnectionPreset'].name,
        type: 'JDBC',
        sourceId: this.getConnectionStep()['selectedConnectionPreset'].id,
        schema: this.getSchemaStep()['selectedDatabase'],
        table: this.getSchemaStep()['selectedTable'],
      };
      params['sourceType'] = 'JDBC';
      params['source'] = source;
    } else if (this.isCreateType('staging')) {
      // staging DB
      const source = {
        name: 'Stage DB',
        type: 'STAGEDB',
        sourceId: 'STAGE',
        schema: this.getSchemaStep()['selectedDatabase'],
        table: this.getSchemaStep()['selectedTable'],
      };
      params['sourceType'] = 'STAGEDB';
      params['source'] = source;
    }
    return params;
  }
}

