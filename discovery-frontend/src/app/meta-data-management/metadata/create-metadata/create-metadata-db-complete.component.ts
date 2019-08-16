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
import {MetadataEntity} from "../metadata.entity";
import {MetadataService} from "../service/metadata.service";
import * as _ from 'lodash';
import {AuthenticationType} from "../../../domain/dataconnection/dataconnection";
import {Alert} from "../../../common/util/alert.util";
import {MetadataControlCompleteComponent} from "./component/metadata-control-complete.component";

@Component({
  selector: 'create-metadata-db-complete',
  templateUrl: 'create-metadata-db-complete.component.html'
})
export class CreateMetadataDbCompleteComponent extends AbstractComponent {

  @ViewChild(MetadataControlCompleteComponent)
  private readonly _metadataControlCompleteComponent: MetadataControlCompleteComponent;

  @Input() readonly createData: MetadataEntity.CreateData;

  @Output() readonly changeStep: EventEmitter<MetadataConstant.CreateStep> = new EventEmitter();
  @Output() readonly cancel = new EventEmitter();
  @Output() readonly complete = new EventEmitter();

  // constructor
  constructor(private metadataService: MetadataService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.createData.isNotEmptyCompleteInfo()) {
      this._loadCompleteInfo(this.createData.completeInfo);
    } else {
      this._initCompleteInfo();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onComplete(): void {
    if (this._metadataControlCompleteComponent.isValidMetadataNameInMetadataList()) {
      this._checkDuplicatedMetadataNameFromServerAndCreateMetadata();
    }
  }

  isEnableURL(): boolean {
    return !_.isNil(this.getUrl());
  }

  isRequiredSid(): boolean {
    return !_.isNil(this.getSid());
  }

  isRequireDatabase(): boolean {
    return !_.isNil(this.getDatabase());
  }

  isRequireCatalog(): boolean {
    return !_.isNil(this.getCatalog());
  }

  getDataType() {
    return this._getConnection().implementor;
  }

  getHost() {
    return this._getConnection().hostname
  }

  getPort() {
    return this._getConnection().port;
  }

  getUrl() {
    return this._getConnection().url;
  }

  getDatabase() {
    return this._getConnection().database;
  }

  getSid() {
    return this._getConnection().sid;
  }

  getCatalog() {
    return this._getConnection().catalog;
  }

  getSchema() {
    return this.createData.schemaInfo.selectedSchema;
  }

  getSelectedConnectionPreset() {
    return this.createData.connectionInfo.selectedConnectionPreset;
  }

  changeToPrevStep(): void {
    this._setCompleteInfoInCreateData();
    this.changeStep.emit(MetadataConstant.CreateStep.DB_SELECT);
  }

  private _getConnection() {
    return this.createData.connectionInfo.connection;
  }


  /**
   * get initial searchable flag
   * @return {boolean}
   * @private
   */
  private _getInitSearchableInExploreData(): boolean {
    return this.createData.connectionInfo.connectionDetail.published === false && this.createData.connectionInfo.connectionDetail.authenticationType === AuthenticationType.DIALOG ? false : true;
  }

  /**
   * Set complete info in create data
   * @private
   */
  private _setCompleteInfoInCreateData(): void {
    this.createData.completeInfo = new MetadataEntity.CompleteInfo(this._metadataControlCompleteComponent.metadataList, this._metadataControlCompleteComponent.isSearchableInExploreData);
  }

  /**
   * Create metadata
   * @private
   */
  private _createMetadata() {
    this.loadingShow();
    this.metadataService.createMetaData(this._metadataControlCompleteComponent.getMetadataCreateParams(this.createData.schemaInfo.selectedSchema, this.getSelectedConnectionPreset()))
      .then(result => {
        this.loadingHide();
        Alert.success(this.translateService.instant('msg.metadata.alert.create.success'));
        // if created metadata only one
        if (result.length === 1) {
          this.complete.emit(result[0].id);
        } else {
          this.complete.emit();
        }
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Check duplicated metadata name in metadata list used server
   * @private
   */
  private _checkDuplicatedMetadataNameFromServerAndCreateMetadata() {
    this.loadingShow();
    this.metadataService.getDuplicatedMetadataNameList(this._metadataControlCompleteComponent.getMetadataTableList())
      .then(result => {
        if (_.isNil(result) || result.length === 0) {
          this._createMetadata();
        } else {
          // set name error
          result.forEach(name => {
            const metadata = this._metadataControlCompleteComponent.metadataList.find(metadata => metadata.name === name);
            metadata.isErrorName = true;
            metadata.errorMessage = this.translateService.instant('msg.metadata.ui.create.name.error.duplicated');
          });
          // loading hide
          this.loadingHide();
        }
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  /**
   * Load complete info in metadataControlCompleteComponent
   * @param {MetadataEntity.CompleteInfo} completeInfo
   * @private
   */
  private _loadCompleteInfo(completeInfo: MetadataEntity.CompleteInfo): void {
    this.safelyDetectChanges();
    this._metadataControlCompleteComponent.loadMetadataList(completeInfo.metadataList, this.createData.schemaInfo.checkedTableList);
    this._metadataControlCompleteComponent.initSearchable(completeInfo.isSearchableInExploreData);
  }

  /**
   * Init complete info in metadataControlCompleteComponent
   * @private
   */
  private _initCompleteInfo(): void {
    this.safelyDetectChanges();
    // make metadata list
    this._metadataControlCompleteComponent.initMetadataList(this.createData.schemaInfo.checkedTableList);
    this._metadataControlCompleteComponent.initSearchable(this._getInitSearchableInExploreData());
  }
}
