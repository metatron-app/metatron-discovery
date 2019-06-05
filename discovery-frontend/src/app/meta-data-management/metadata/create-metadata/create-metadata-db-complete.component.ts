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

import {Component, ElementRef, EventEmitter, Injector, Input, Output} from "@angular/core";
import {MetadataConstant} from "../../metadata.constant";
import {AbstractComponent} from "../../../common/component/abstract.component";
import {MetadataEntity} from "../metadata.entity";
import {MetadataService} from "../service/metadata.service";
import {StringUtil} from "../../../common/util/string.util";
import {Metadata, SourceType} from "../../../domain/meta-data-management/metadata";
import * as _ from 'lodash';
import {MetadataSource, MetadataSourceType} from "../../../domain/meta-data-management/metadata-source";
import MetadataInComplete = MetadataEntity.MetadataInComplete;
import {AuthenticationType} from "../../../domain/dataconnection/dataconnection";
import {Alert} from "../../../common/util/alert.util";

@Component({
  selector: 'create-metadata-db-complete',
  templateUrl: 'create-metadata-db-complete.component.html'
})
export class CreateMetadataDbCompleteComponent extends AbstractComponent {

  @Input() readonly createData: MetadataEntity.CreateData;

  @Output() readonly changeStep: EventEmitter<MetadataConstant.CreateStep> = new EventEmitter();
  @Output() readonly cancel = new EventEmitter();
  @Output() readonly complete = new EventEmitter();

  metadataList: MetadataInComplete[];
  isSearchableInExploreData: boolean;

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
      // changed metadata list
      this._changeMetadataList();
    } else {
      // init searchable in explore data
      this._initSearchableInExploreData();
      // make metadata list
      this._initMetadataList(this.createData.schemaInfo.checkedTableList);
    }
  }

  onChangeSearchableInExploreData(): void {
    this.isSearchableInExploreData = !this.isSearchableInExploreData;
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onComplete(): void {
    if (this._checkNameInMetadataList()) {
      this._checkDuplicatedMetadataNameFromServerAndCreateMetadata();
    }
  }

  onChangeMetadataName(metadata: MetadataInComplete, value: string): void {
    metadata.name = value;
    if (!_.isNil(metadata.isErrorName)) {
      metadata.isErrorName = undefined;
    }
  }

  onChangeMetadataDescription(metadata: MetadataInComplete, value: string): void {
    metadata.description = value;
  }

  changeDescriptionHeight(descriptionElement) {
    $(descriptionElement).css('height', '28px');
    $(descriptionElement).height(descriptionElement.scrollHeight - 8);
  }

  isEmptyMetadataList(): boolean {
    return _.isNil(this.metadataList);
  }

  isErrorInMetadataList(): boolean {
    return this.metadataList.some(metadata => this.isErrorMetadataName(metadata));
  }

  isErrorMetadataName(metadata: MetadataEntity.MetadataInComplete): boolean {
    return metadata.isErrorName === true;
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

  changeToPrevStep(): void {
    this._setCompleteInfoInCreateData();
    this.changeStep.emit(MetadataConstant.CreateStep.DB_SELECT);
  }

  private _getConnection() {
    return this.createData.connectionInfo.connection;
  }

  private _getMetadataNameList(): string[] {
    return this.metadataList.map(metadata => metadata.name);
  }

  private _getMetadataCreateParams(): Metadata[] {
    const selectedPreset = this.createData.connectionInfo.selectedConnectionPreset;
    return this.metadataList.reduce((result, metadata) => {
      const param = new Metadata();
      param.name = metadata.name.trim();
      if (StringUtil.isNotEmpty(metadata.description)) {
        param.description = metadata.description.trim();
      }
      param.sourceType = SourceType.JDBC;
      const source = new MetadataSource();
      // preset name
      source.name = selectedPreset.name;
      source.type = MetadataSourceType.JDBC;
      // preset id
      source.sourceId = selectedPreset.id;
      source.table = metadata.table;
      param.source = source;
      result.push(param);
      return result;
    }, []);
  }

  private _getRemovedTableList(): string[] {
    return this.metadataList.reduce((result, metadata) => {
      if (_.isNil(this.createData.schemaInfo.checkedTableList.find(table => table === metadata.table))) {
        result.push(metadata.table);
      }
      return result;
    }, []);
  }

  private _getAddedTableList(): string[] {
    return this.createData.schemaInfo.checkedTableList.reduce((result, table) => {
      // if not exist in metadata list
      if (_.isNil(this.metadataList.find(metadata => metadata.table === table))) {
        result.push(table);
      }
      return result;
    }, []);
  }

  private _checkNameInMetadataList(): boolean {
    let result: boolean = true;
    this.metadataList.forEach(metadata => {
      if (StringUtil.isEmpty(metadata.name)) {
        result = false;
        metadata.isErrorName = true;
        metadata.errorMessage = this.translateService.instant('msg.metadata.ui.create.name.error.empty');
      } else if (metadata.name.length > 150) {
        result = false;
        metadata.isErrorName = true;
        metadata.errorMessage = this.translateService.instant('msg.metadata.ui.create.name.error.length');
      } else if (Metadata.isDisableMetadataNameCharacter(metadata.name)) {
        result = false;
        metadata.isErrorName = true;
        metadata.errorMessage = this.translateService.instant('msg.metadata.ui.create.name.error.char');
      } else if (this.metadataList.filter(data => metadata.name.trim().toUpperCase() === data.name.trim().toUpperCase()).length > 1) {
        result = false;
        metadata.isErrorName = true;
        metadata.errorMessage = this.translateService.instant('msg.metadata.ui.create.name.error.duplicated');
      }
    });
    return result;
  }

  private _createMetadata() {
    this.loadingShow();
    this.metadataService.createMetaData(this._getMetadataCreateParams())
      .then(result => {
        this.loadingHide();
        Alert.success(this.translateService.instant('msg.metadata.alert.create.success'));
        this.complete.emit();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  private _checkDuplicatedMetadataNameFromServerAndCreateMetadata() {
    this.loadingShow();
    this.metadataService.getDuplicatedMetadataNameList(this._getMetadataNameList())
      .then(result => {
        if (_.isNil(result) || result.length === 0) {
          this._createMetadata();
        } else {
          // set name error
          result.forEach(name => {
            const metadata = this.metadataList.find(metadata => metadata.name === name);
            metadata.isErrorName = true;
            metadata.errorMessage = this.translateService.instant('msg.metadata.ui.create.name.error.duplicated');
          });
          // loading hide
          this.loadingHide();
        }
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  private _setCompleteInfoInCreateData(): void {
    this.createData.completeInfo = new MetadataEntity.CompleteInfo(this.metadataList, this.isSearchableInExploreData);
  }

  private _loadCompleteInfo(completeInfo: MetadataEntity.CompleteInfo): void {
    this.metadataList = completeInfo.metadataList;
    this.isSearchableInExploreData = completeInfo.isSearchableInExploreData;
  }

  private _changeMetadataList() {
    // remove table
    this._getRemovedTableList().forEach(table => this.metadataList.splice(this.metadataList.findIndex(metadata => metadata.table === table), 1));
    // add table
    this._getAddedTableList().forEach(table => this.metadataList.push(new MetadataInComplete(table, table)));
  }

  private _initMetadataList(tableList: string[]) {
    this.metadataList = tableList.reduce((result, table) => {
      result.push(new MetadataInComplete(table, table));
      return result;
    }, []);
  }

  private _initSearchableInExploreData(): void {
    this.isSearchableInExploreData = this.createData.connectionInfo.connectionDetail.published === false && this.createData.connectionInfo.connectionDetail.authenticationType === AuthenticationType.DIALOG ? false : true;
  }
}
