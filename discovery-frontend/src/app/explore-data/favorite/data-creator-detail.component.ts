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
import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AbstractComponent} from '@common/component/abstract.component';
import {StringUtil} from '@common/util/string.util';
import {CommonUtil} from '@common/util/common.util';
import {Metadata, SourceType} from '@domain/meta-data-management/metadata';
import {DataCreator} from '@domain/meta-data-management/data-creator';
import {MetadataService} from '../../meta-data-management/metadata/service/metadata.service';
import {MetadataContainerComponent} from '../explore-data/popup/metadata-container.component';
import {SortOption} from '../explore-data/service/explore-data-util.service';
import {ExploreDataConstant} from '../constant/explore-data-constant';

@Component({
  selector: 'app-favorite-creator-detail',
  templateUrl: './data-creator-detail.component.html',
  entryComponents: [MetadataContainerComponent],
})
export class DataCreatorDetailComponent extends AbstractComponent implements OnInit, OnDestroy {
  @ViewChild('component_metadata_detail', {read: ViewContainerRef}) readonly metadataContainerEntry: ViewContainerRef;
  metadataContainerEntryRef: ComponentRef<MetadataContainerComponent>;

  @Output() readonly closedPopup = new EventEmitter();
  @Output() readonly clickedMetadata = new EventEmitter();

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  creator: DataCreator = null;
  metadataList: Metadata[] = [];
  username: string = '';
  searchRange = {name: 'DATA_NAME', value: ExploreDataConstant.SearchRange.DATA_NAME};

  // sort
  selectedSort = 'createdTime,desc';

  public sortOptions = {
    // TODO: popularity is not implemented yet
    // popularity: new SortOption('popularity'),
    createdTime: new SortOption('createdTime'),
    name: new SortOption('name', 'asc'),
  };

  // search
  searchedKeyword = '';

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(
    protected element: ElementRef,
    private resolver: ComponentFactoryResolver,
    private metadataService: MetadataService,
    protected activatedRoute: ActivatedRoute,
    protected injector: Injector) {
    super(element, injector);

    this.sortOptions.name.option = 'default';
    this.sortOptions.createdTime.option = 'desc';

    // path variable
    this.activatedRoute.params.subscribe((params) => {
      this.username = params['username'];
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    super.ngOnInit();

    this.subscriptions.push(this.activatedRoute.queryParams.subscribe(params => {
      const paramKeys = Object.keys(params);
      const isExistSearchParams = paramKeys.length > 0;
      const searchParams = {};
      // if exist search param in URL
      if (isExistSearchParams) {
        paramKeys.forEach((key) => {
          if (key === 'size') {
            this.page.size = params['size'];
          } else if (key === 'page') {
            this.page.page = params['page'];
          } else if (key === 'sort') {
          } else if (key === 'containsText') {
            this.searchedKeyword = params['containsText'];
          } else {
            searchParams[key] = params[key].split(',');
          }
        });
        // TODO 추후 criterion component로 이동
        delete searchParams['pseudoParam'];

        this.setMetadataList(this.getMetadataListParams()).then();
        // init criterion search param
      }

      // set datasource list
    }));

    const initial = async () => {
      this.loadingShow();
      await this.getCreatorDetail();
      await this.setMetadataList(this.getMetadataListParams());
    };


    initial().then(() => this.loadingHide()).catch(e => this.commonExceptionHandler(e));
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * Reload page for new query params.
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);
    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this.getMetadataListParams(), replaceUrl: true}
    ).then();
  } // function - reloadPage

  getMetadataListParams() {
    const params = {
      size: this.page.size,
      page: this.page.page,
      creatorContains: this.username,
      sort: this.selectedSort
    };

    // if not empty search keyword
    if (StringUtil.isNotEmpty(this.searchedKeyword)) {
      params[this.searchRange.value] = this.searchedKeyword.trim();
    }


    return params;
  }

  public async setMetadataList(params) {
    this.loadingShow();
    const result = await this.metadataService.getMetadataListByDataCreator(this.username, params).catch((e) => this.commonExceptionHandler(e));

    if (!_.isNil(result)) {
      // add ddp-scroll class to layout
      this.pageResult = result.page;
      // set metadata list
      if (result._embedded) {
        this.metadataList = result._embedded.metadatas;
      } else {
        this.metadataList = [];
      }

      this.loadingHide();
    }
  }

  public goBack() {
    this.router.navigate(['exploredata/favorite/creator']).then();
  }

  getTotalElements(): string {
    return CommonUtil.numberWithCommas(this.pageResult.totalElements);
  }

  async getCreatorDetail() {
    this.creator = await this.metadataService.getCreatorDetail(this.username)
  }

  getMetadataName(name: string) {
    if (this.isNotEmptySearchKeyword() && (this.searchRange.value === ExploreDataConstant.SearchRange.ALL || this.searchRange.value === ExploreDataConstant.SearchRange.DATA_NAME)) {
      return name.replace(this.searchedKeyword, `<span class="ddp-txt-search type-search">${this.searchedKeyword}</span>`);
    } else {
      return name;
    }
  }

  getMetadataDescription(description: string) {
    if (this.isNotEmptySearchKeyword() && (this.searchRange.value === ExploreDataConstant.SearchRange.ALL || this.searchRange.value === ExploreDataConstant.SearchRange.DESCRIPTION)) {
      return '-' + description.replace(this.searchedKeyword, `<span class="ddp-txt-search type-search">${this.searchedKeyword}</span>`);
    } else {
      return '-' + description;
    }
  }

  getMetadataCreator(creator: string) {
    if (this.isNotEmptySearchKeyword() && (this.searchRange.value === ExploreDataConstant.SearchRange.ALL || this.searchRange.value === ExploreDataConstant.SearchRange.CREATOR)) {
      return creator.replace(this.searchedKeyword, `<span class="ddp-txt-search type-search">${this.searchedKeyword}</span>`);
    } else {
      return creator;
    }
  }

  getTooltipValue(metadata): string {
    let result = metadata.name;
    if (metadata.description) {
      result += ` - ${metadata.description}`;
    }
    return result;
  }

  public getUserImage(userInfo): string {
    if (userInfo && userInfo.hasOwnProperty('imageUrl')) {
      return '/api/images/load/url?url=' + userInfo.imageUrl + '/thumbnail';
    } else {
      return this.defaultPhotoSrc;
    }
  } // function - getUserImage

  /**
   * Search connection keypress event
   * @param {string} keyword
   */
  public onChangedSearchKeyword(keyword: string): void {
    // set search keyword
    this.searchedKeyword = keyword;

    this.reloadPage(true);
  }

  onClickFavoriteIconInList(selectedMetadata: Metadata) {
    event.stopImmediatePropagation();
    event.stopPropagation();

    this.metadataService.toggleMetadataFavorite(selectedMetadata.id, selectedMetadata.favorite).catch((e) => this.commonExceptionHandler(e));

    const index = this.metadataList.findIndex((metadata) => {
      return metadata.id === selectedMetadata.id;
    });

    this.metadataList[index].favorite = !this.metadataList[index].favorite;
  }

  /**
   * More connection click event
   */
  changePage(data: { page: number, size: number }): void {
    // if more metadata list
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;
      this.setMetadataList(this.getMetadataListParams()).then();
    }
  }

  onClickMetadata(metadata: Metadata) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    // declare variables needed for metadata-container(modal) component
    let metadataDetail;
    let recentlyQueriesForDatabase;
    let topUserList;
    let recentlyUpdatedList;
    let recentlyUsedList;

    // get datas...
    const getRecentlyQueriesForDatabase = async (sourcetype: SourceType) => {
      if (sourcetype === SourceType.STAGEDB) {
        recentlyQueriesForDatabase = await this.metadataService.getRecentlyQueriesInMetadataDetailForDatabase(metadataDetail.source.id, this.page.page, this.page.size, this.page.sort)
          .catch(error => this.commonExceptionHandler(error));
      } else {
        if (metadataDetail.source.source !== undefined) {
          recentlyQueriesForDatabase = await this.metadataService.getRecentlyQueriesInMetadataDetailForDatabase(metadataDetail.source.source.id, this.page.page, this.page.size, this.page.sort)
            .catch(error => this.commonExceptionHandler(error));
        } else {
          recentlyQueriesForDatabase = await this.metadataService.getRecentlyQueriesInMetadataDetailForDatabase(metadataDetail.source.id, this.page.page, this.page.size, this.page.sort)
            .catch(error => this.commonExceptionHandler(error));
        }
      }
    };

    const getTopUser = async () => {
      topUserList = await this.metadataService.getTopUserInMetadataDetail(metadata.id).catch(error => this.commonExceptionHandler(error));
      topUserList = topUserList === undefined ? [] : topUserList;
    };

    const getRecentlyUpdatedList = async () => {
      recentlyUpdatedList = await this.metadataService.getRecentlyUpdatedInMetadataDetail(metadata.id).catch(error => this.commonExceptionHandler(error));
    };

    const getRecentlyUsedList = async () => {
      recentlyUsedList = await this.metadataService.getRecentlyUsedInMetadataDetail(metadata.id, {
        sort: 'modifiedTime',
        size: 5,
        page: 0
      }).catch(error => this.commonExceptionHandler(error));
    };

    this.metadataService.getDetailMetaData(metadata.id).then(async (result) => {
      this.loadingShow();
      metadataDetail = result;

      await getTopUser();
      await getRecentlyUpdatedList();

      if (metadata.sourceType === SourceType.ENGINE) {
        await getRecentlyUsedList();

        this.metadataContainerEntryRef = this.metadataContainerEntry.createComponent(this.resolver.resolveComponentFactory(MetadataContainerComponent));
        this.metadataContainerEntryRef.instance.metadataDetailData = metadataDetail;
        this.metadataContainerEntryRef.instance.topUserList = topUserList;
        this.metadataContainerEntryRef.instance.recentlyUpdatedList = recentlyUpdatedList;
        if (recentlyUsedList !== undefined && recentlyUsedList['_embedded'] !== undefined) {
          this.metadataContainerEntryRef.instance.recentlyUsedDashboardList = recentlyUsedList['_embedded']['dashboards'];
        }

        this.metadataContainerEntryRef.instance.metadataId = metadata.id;
      } else if (metadata.sourceType === SourceType.JDBC || metadata.sourceType === SourceType.STAGEDB) {
        await getRecentlyQueriesForDatabase(metadata.sourceType);
        this.metadataContainerEntryRef = this.metadataContainerEntry.createComponent(this.resolver.resolveComponentFactory(MetadataContainerComponent));
        this.metadataContainerEntryRef.instance.metadataDetailData = metadataDetail;
        this.metadataContainerEntryRef.instance.topUserList = topUserList;
        this.metadataContainerEntryRef.instance.recentlyUpdatedList = recentlyUpdatedList;
        if (recentlyQueriesForDatabase['_embedded']) {
          this.metadataContainerEntryRef.instance.recentlyQueriesForDataBase = recentlyQueriesForDatabase['_embedded']['queryhistories'];
        }
        this.metadataContainerEntryRef.instance.metadataId = metadata.id;
      }
      this.loadingHide();
      // close modal event listener
      this.metadataContainerEntryRef.instance.closedPopup.subscribe(() => {
        this.metadataContainerEntryRef.destroy();
      });
      // toggle favorite in modal listener
      this.metadataContainerEntryRef.instance.onToggleFavorite.subscribe(() => {
        // modal is shown in list screen
        this.setMetadataList(this.getMetadataListParams()).catch(e => this.commonExceptionHandler(e));
        // modal is shown in main screen
      });

    }).catch(error => {
      console.log(error);
      this.commonExceptionHandler(error)
    });
  }

  onClickFavoriteInUserName(selectedCreator: DataCreator) {
    event.stopImmediatePropagation();
    event.stopPropagation();

    this.metadataService.toggleCreatorFavorite(selectedCreator.creator.id, selectedCreator.favorite).then().catch(e => this.commonExceptionHandler(e));

    this.creator.favorite = !this.creator.favorite;

  };

  /**
   * Sort column clicked
   * @param type
   */
  public toggleSortOption(type: string) {
    // Initialize every column's option except selected column
    Object.keys(this.sortOptions).forEach(key => {
      if (key !== type) {
        this.sortOptions[key].option = 'default';
      }
    });
    if (this.sortOptions[type].option === 'none') {
      this.sortOptions[type].option = 'desc';
    } else if (this.sortOptions[type].option === 'asc') {
      this.sortOptions[type].option = 'desc';
    } else {
      this.sortOptions[type].option = 'asc';
    }

    this.selectedSort = type + ',' + this.sortOptions[type].option;
    this.reloadPage();
  }

  isNotEmptySearchKeyword(): boolean {
    return StringUtil.isNotEmpty(this.searchedKeyword);
  }

  isEmptyMetadataList(): boolean {
    return _.isNil(this.metadataList) || this.metadataList.length === 0;
  }

  isEnableTag(metadata: Metadata): boolean {
    return !Metadata.isEmptyTags(metadata);
  }

  isExistMoreTags(metadata: Metadata): boolean {
    return metadata.tags.length > 1;
  }

  isEnableDescription(metadata: Metadata): boolean {
    return StringUtil.isNotEmpty(metadata.description);
  }
}
