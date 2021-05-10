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

import * as _ from 'lodash';
import {Component, ElementRef, EventEmitter, Injector, OnInit, Output} from '@angular/core';
import {StringUtil} from '@common/util/string.util';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {AbstractComponent} from '@common/component/abstract.component';
import {Metadata, SourceType} from '@domain/meta-data-management/metadata';
import {DataCreator} from '@domain/meta-data-management/data-creator';
import {MetadataService} from '../../meta-data-management/metadata/service/metadata.service';
import {ExploreDataConstant} from '../constant/explore-data-constant';

@Component({
  selector: 'explore-data-main',
  templateUrl: './explore-data-main.component.html',
})
export class ExploreDataMainComponent extends AbstractComponent implements OnInit {

  popularMetadataShowStartIndex = 0;
  popularMetadataCarouselScreenIndex = [];
  // recommendedMetadataList: Metadata[];
  popularMetadataList: Metadata[] = [];
  updatedMetadataList: Metadata[] = [];
  favoriteMetadataList: Metadata[] = [];
  favoriteCreatorList: DataCreator[] = [];

  favoriteMetadataTotalCount: number = -1;

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
    this.router.navigate(['/exploredata/view']);
    const initial = async () => {
      this.loadingShow();
      await this._setPopularMetadataList();
      await this._setUpdatedMetadataList();
      // await this._setRecommendedMetadataList();
      await this.setMyFavoriteMetadataList();
      await this._setFavoriteCreatorList();
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

  onClickCreator(username: string) {
    this.router.navigate(['exploredata/favorite/creator', username]).then();
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

  public async setMyFavoriteMetadataList() {
    const result = await this._metadataService.getMetadataListByMyFavorite({
      size: 4,
      page: 0,
      sort: 'createdTime,desc'
    });
    if (!_.isNil(result._embedded)) {
      this.favoriteMetadataList = result._embedded.metadatas;
      this.favoriteMetadataTotalCount = result.page.totalElements;
    } else {
      this.favoriteMetadataList = [];
      this.favoriteMetadataTotalCount = result.page.totalElements;
    }
  }

  private async _setPopularMetadataList() {
    const result = await this._metadataService.getMetadataListByPopularity({size: 20, page: 0});
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

  // change when api is ready
  private async _setFavoriteCreatorList() {
    const result: DataCreator[] = await this._metadataService.getFavoriteCreatorList({size: 4, page: 0});
    if (!_.isNil(result)) {
      this.favoriteCreatorList = result.filter(item => item.favorite);
    }
  }

  // private async _setRecommendedMetadataList() {
  //   const result = await this._metadataService.getMetadataListByRecommended({size: 10, page: 0, projection: 'forListView'});
  //   if (!_.isNil(result._embedded)) {
  //     this.recommendedMetadataList = result._embedded.metadatas;
  //   }
  // }
}
