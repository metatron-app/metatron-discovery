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

import {Component, ElementRef, EventEmitter, Injector, Output} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {MetadataService} from "../../meta-data-management/metadata/service/metadata.service";
import * as _ from "lodash";
import {StringUtil} from "../../common/util/string.util";
import {Metadata, SourceType} from "../../domain/meta-data-management/metadata";

@Component({
  selector: 'explore-data-main',
  templateUrl: './explore-data-main.component.html',
})
export class ExploreDataMainComponent extends AbstractComponent {

  recommendedMetadataList: Metadata[];
  popularMetadataList: Metadata[];
  updatedMetadataList: Metadata[];
  favoriteMetadataList: Metadata[];
  favoriteCreatorMetadataList: Metadata[];

  // event
  @Output() readonly clickedMetadata = new EventEmitter();

  // 생성자
  constructor(
    protected element: ElementRef,
    protected injector: Injector,
    private _metadataService: MetadataService) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  ngOnInit() {
    super.ngOnInit();
    const init = async () => {
      this.loadingShow();
      await this._setPopularMetadataList();
      await this._updatedMetadataList();
      await this._setRecommendedMetadataList();
      await this._setMyFavoriteMetadataList();
      await this._setCreatorFavoriteMetadataList();
      this.loadingHide();
    };
    init().catch(error => this.commonExceptionHandler(error));
  }

  isEmptyRecommendedMetadataList() {
    return _.isNil(this.recommendedMetadataList);
  }

  isEnableTag(metadata: Metadata): boolean {
    return !Metadata.isEmptyTags(metadata);
  }

  isEnableDescription(metadata: Metadata): boolean {
    return StringUtil.isNotEmpty(metadata.description);
  }

  getMetadataIcon(metadata: Metadata): string {
    switch (metadata.sourceType) {
      case SourceType.ENGINE:
        return 'ddp-icon-datasource';
      case SourceType.JDBC:
        return 'ddp-icon-database';
      case SourceType.STAGEDB:
        return 'ddp-icon-stagingdb';
      default:
        return '';
    }
  }

  getMetadataImage(metadata: Metadata): string {
    switch (metadata.sourceType) {
      case SourceType.ENGINE:
        return 'ddp-data-images type-datasource';
      case SourceType.JDBC:
        return 'ddp-data-images type-database';
      case SourceType.STAGEDB:
        return 'ddp-data-images type-stagingdb';
      default:
        return 'ddp-data-images type-database';
    }
  }

  onClickMetadata(metadata: Metadata) {
    return this.clickedMetadata.emit(metadata);
  }

  private async _setPopularMetadataList() {
    const result = await this._metadataService.getMetadataListByPopularity({size: 10, page: 0});
    if (!_.isNil(result._embedded)) {
      this.popularMetadataList = result._embedded.metadatas;
    }
  }

  private async _updatedMetadataList() {
    const result = await this._metadataService.getMetaDataList({size: 10, page: 0, sort: 'modifiedTime,desc'});
    if (!_.isNil(result._embedded)) {
      this.updatedMetadataList = result._embedded.metadatas;
    }
  }

  private async _setMyFavoriteMetadataList() {
    const result = await this._metadataService.getMetadataListByMyFavorite({size: 10, page: 0, projection: 'forListView'});
    if (!_.isNil(result._embedded)) {
      this.favoriteMetadataList = result._embedded.metadatas;
    }
  }

  private async _setCreatorFavoriteMetadataList() {
    const result = await this._metadataService.getMetadataListByCreatorFavorite({size: 10, page: 0, projection: 'forListView'});
    if (!_.isNil(result._embedded)) {
      this.favoriteCreatorMetadataList = result._embedded.metadatas;
    }
  }

  private async _setRecommendedMetadataList() {
    const result = await this._metadataService.getMetadataListByRecommended({size: 10, page: 0, projection: 'forListView'});
    if (!_.isNil(result._embedded)) {
      this.recommendedMetadataList = result._embedded.metadatas;
    }
  }


}
