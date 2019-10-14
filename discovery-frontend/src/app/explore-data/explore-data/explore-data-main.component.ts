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
import {ExploreDataConstant} from "../constant/explore-data-constant";
import {EventBroadcaster} from "../../common/event/event.broadcaster";

@Component({
  selector: 'explore-data-main',
  templateUrl: './explore-data-main.component.html',
})
export class ExploreDataMainComponent extends AbstractComponent {

  popularMetadataShowStartIndex = 0;
  popularMetadataCarouselScreenIndex = [];
  // recommendedMetadataList: Metadata[];
  popularMetadataList: Metadata[] = [];
  updatedMetadataList: Metadata[] = [];
  favoriteMetadataList: Metadata[] = [];
  favoriteCreatorMetadataList: Metadata[] = [];

  // banner icon
  // bannerIconList = _.shuffle(['type-banner02', 'type-banner03', 'type-banner04', 'type-banner05']);

  // event
  @Output() readonly clickedMetadata = new EventEmitter();

  // 생성자
  constructor(protected element: ElementRef,
              protected injector: Injector,
              private broadcaster: EventBroadcaster,
              private _metadataService: MetadataService) {
    super(element, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  ngOnInit() {
    super.ngOnInit();
    const initial = async () => {
      this.loadingShow();
      await this._setPopularMetadataList();
      await this._setUpdatedMetadataList();
      // await this._setRecommendedMetadataList();
      // await this._setMyFavoriteMetadataList();
      // await this._setCreatorFavoriteMetadataList();
    };
    initial().then(() => this.broadcaster.broadcast(ExploreDataConstant.BroadCastKey.EXPLORE_INITIAL)).catch(() => this.broadcaster.broadcast(ExploreDataConstant.BroadCastKey.EXPLORE_INITIAL));
  }

  // isEmptyRecommendedMetadataList(): boolean {
  //   return _.isNil(this.recommendedMetadataList);
  // }

  isEnableTag(metadata: Metadata): boolean {
    return !Metadata.isEmptyTags(metadata);
  }

  isEnableDescription(metadata: Metadata): boolean {
    return StringUtil.isNotEmpty(metadata.description);
  }

  getBannerClass(metadata: Metadata) {
    switch (metadata.sourceType) {
      case SourceType.ENGINE:
        return 'type-datasource';
      case SourceType.JDBC:
        return 'type-database';
      case SourceType.STAGEDB:
        return 'type-stagingdb';
      default:
        return 'type-datasource';
    }
  }

  getMetadataTypeClass(metadata: Metadata): ExploreDataConstant.Metadata.TypeIconClass {
    switch (metadata.sourceType) {
      case SourceType.ENGINE:
        return ExploreDataConstant.Metadata.TypeIconClass.DATASOURCE;
      case SourceType.JDBC:
        return ExploreDataConstant.Metadata.TypeIconClass.DATABASE;
      case SourceType.STAGEDB:
        return ExploreDataConstant.Metadata.TypeIconClass.STAGING_DB;
      default:
        return ExploreDataConstant.Metadata.TypeIconClass.DATABASE;
    }
  }

  onClickMetadata(metadata: Metadata): void {
    this.loadingShow();
    this.clickedMetadata.emit(metadata);
  }

  /**
   * When click carousel right button
    */
  onClickCarouselRight(): void {
    if (this.popularMetadataShowStartIndex + 5 < this.popularMetadataList.length) {
      this.popularMetadataShowStartIndex += 5;
    }
  }

  /**
   * When click carousel left button
   */
  onClickCarouselLeft(): void {
    if (this.popularMetadataShowStartIndex >= 5)
      this.popularMetadataShowStartIndex -= 5;
  }

  onClickCarouselBullet(index: number): void {
    this.popularMetadataShowStartIndex = index * 5;
  }

  /**
   * Check if first screen of carousel
   */
  isCarouselFirstScreen(): boolean {
    return this.popularMetadataShowStartIndex !== 0;
  }

  /**
   * Check if last screen of carousel
   */
  isCarouselLastScreen(): boolean {
    return (this.popularMetadataShowStartIndex / 5) !== (this.popularMetadataCarouselScreenIndex.length - 1);
  }


  private async _setPopularMetadataList() {
    const result = await this._metadataService.getMetadataListByPopularity({size: 18, page: 0});
    if (!_.isNil(result._embedded)) {
      this.popularMetadataList = result._embedded.metadatas;

      // set carousel screen counts
      const screenNumber = this.popularMetadataList.length / 5;

      for (let i = 0; i < screenNumber; i++) {
        this.popularMetadataCarouselScreenIndex.push(i);
      }
    }
  }

  private async _setUpdatedMetadataList() {
    const result = await this._metadataService.getMetaDataList({size: 4, page: 0, sort: 'modifiedTime,desc'});
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

  // private async _setRecommendedMetadataList() {
  //   const result = await this._metadataService.getMetadataListByRecommended({size: 10, page: 0, projection: 'forListView'});
  //   if (!_.isNil(result._embedded)) {
  //     this.recommendedMetadataList = result._embedded.metadatas;
  //   }
  // }
}
