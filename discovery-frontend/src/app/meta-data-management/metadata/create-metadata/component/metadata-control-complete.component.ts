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
import {MetadataEntity} from "../../metadata.entity";
import * as _ from "lodash";
import {AbstractComponent} from "../../../../common/component/abstract.component";
import {Metadata, SourceType} from "../../../../domain/meta-data-management/metadata";
import {StringUtil} from "../../../../common/util/string.util";
import {MetadataSource, MetadataSourceType} from "../../../../domain/meta-data-management/metadata-source";


@Component({
  selector: 'metadata-control-complete-component',
  templateUrl: 'metadata-control-complete.component.html'
})
export class MetadataControlCompleteComponent extends AbstractComponent {

  metadataList: MetadataEntity.MetadataInComplete[];
  isSearchableInExploreData: boolean;

  // constructor
  constructor(protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  /**
   * Init metadata list
   * @param {string[]} tableList
   */
  initMetadataList(tableList: string[]) {
    this.metadataList = tableList.reduce((result, table) => {
      result.push(new MetadataEntity.MetadataInComplete(table, table));
      return result;
    }, []);
  }

  /**
   * Init searchable flag
   * @param {boolean} isSearchableInExploreData
   */
  initSearchable(isSearchableInExploreData: boolean) {
    this.isSearchableInExploreData = isSearchableInExploreData;
  }

  /**
   * Load metadata list
   * @param {MetadataEntity.MetadataInComplete[]} metadataList
   * @param {string[]} checkTableList
   */
  loadMetadataList(metadataList: MetadataEntity.MetadataInComplete[], checkTableList: string[]) {
    this.metadataList = metadataList;
    this._changeMetadataList(checkTableList);
  }

  onChangeMetadataName(metadata: MetadataEntity.MetadataInComplete, value: string): void {
    metadata.name = value;
    if (!_.isNil(metadata.isErrorName)) {
      metadata.isErrorName = undefined;
    }
  }

  onChangeMetadataDescription(metadata: MetadataEntity.MetadataInComplete, value: string): void {
    metadata.description = value;
  }

  onChangeSearchableInExploreData(): void {
    this.isSearchableInExploreData = !this.isSearchableInExploreData;
  }

  changeDescriptionHeight(descriptionElement) {
    $(descriptionElement).css('height', '28px');
    $(descriptionElement).height(descriptionElement.scrollHeight - 8);
  }

  getMetadataTableList(): string[] {
    return this.metadataList.map(metadata => metadata.name);
  }

  getMetadataCreateParams(schema: string, selectedPreset): Metadata[] {
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
      source.schema = schema;
      source.table = metadata.table;
      param.source = source;
      result.push(param);
      return result;
    }, []);
  }

  getMetadataCreateParamsUsedStaging(schema: string): Metadata[] {
    return this.metadataList.reduce((result, metadata) => {
      const param = new Metadata();
      param.name = metadata.name.trim();
      if (StringUtil.isNotEmpty(metadata.description)) {
        param.description = metadata.description.trim();
      }
      param.sourceType = SourceType.STAGEDB;
      const source = new MetadataSource();
      source.name = 'Stage DB';
      source.type = MetadataSourceType.STAGEDB;
      source.sourceId = SourceType.STAGING.toString();
      source.schema = schema;
      source.table = metadata.table;
      param.source = source;
      result.push(param);
      return result;
    }, []);
  }

  isValidMetadataNameInMetadataList(): boolean {
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


  isErrorInMetadataList(): boolean {
    return this.metadataList.some(metadata => this.isErrorMetadataName(metadata));
  }

  isErrorMetadataName(metadata: MetadataEntity.MetadataInComplete): boolean {
    return metadata.isErrorName === true;
  }

  isEmptyMetadataList(): boolean {
    return _.isNil(this.metadataList);
  }

  /**
   * Change metadata list
   * @param checkTableList
   * @private
   */
  private _changeMetadataList(checkTableList: string[]) {
    // remove table
    this._getRemovedTableList(checkTableList).forEach(table => this.metadataList.splice(this.metadataList.findIndex(metadata => metadata.table === table), 1));
    // add table
    this._getAddedTableList(checkTableList).forEach(table => this.metadataList.push(new MetadataEntity.MetadataInComplete(table, table)));
  }

  /**
   * Get removed table list
   * @param {string[]} checkTableList
   * @returns {string[]}
   * @private
   */
  private _getRemovedTableList(checkTableList: string[]): string[] {
    return this.metadataList.reduce((result, metadata) => {
      if (_.isNil(checkTableList.find(table => table === metadata.table))) {
        result.push(metadata.table);
      }
      return result;
    }, []);
  }

  /**
   * Get added table list
   * @param {string[]} checkTableList
   * @returns {string[]}
   * @private
   */
  private _getAddedTableList(checkTableList: string[]): string[] {
    return checkTableList.reduce((result, table) => {
      // if not exist in metadata list
      if (_.isNil(this.metadataList.find(metadata => metadata.table === table))) {
        result.push(table);
      }
      return result;
    }, []);
  }
}
