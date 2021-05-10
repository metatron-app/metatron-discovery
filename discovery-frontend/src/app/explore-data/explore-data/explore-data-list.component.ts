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
import {Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {StringUtil} from '@common/util/string.util';
import {CommonUtil} from '@common/util/common.util';
import {CommonConstant} from '@common/constant/common.constant';
import {AbstractComponent} from '@common/component/abstract.component';
import {Catalog} from '@domain/catalog/catalog';
import {Criteria} from '@domain/datasource/criteria';
import {PeriodData} from '@common/value/period.data.value';
import {Metadata, SourceType} from '@domain/meta-data-management/metadata';
import {MetadataService} from '../../meta-data-management/metadata/service/metadata.service';
import {StorageService} from '../../data-storage/service/storage.service';
import {ConstantService} from '../../shared/datasource-metadata/service/constant.service';
import {CatalogService} from '../../meta-data-management/catalog/service/catalog.service';
import {ExploreDataConstant} from '../constant/explore-data-constant';
import {ExploreDataModelService} from './service/explore-data-model.service';
import {SortOption} from './service/explore-data-util.service';
import ListCriterionKey = Criteria.ListCriterionKey;
import ListCriterionType = Criteria.ListCriterionType;
import ListCriterion = Criteria.ListCriterion;

declare let moment: any;

@Component({
  selector: 'explore-data-list',
  templateUrl: './explore-data-list.component.html',
})
export class ExploreDataListComponent extends AbstractComponent implements OnInit, OnDestroy {

  metadataList: Metadata[];

  // updated time, name sorting options
  public sortOptions = {
    // TODO: popularity is not implemented yet
    // popularity: new SortOption('popularity'),
    modifiedTime: new SortOption('modifiedTime'),
    name: new SortOption('name', 'asc'),
  };

  private _searchParams: any;

  // only used in UI
  selectedLnbTab: ExploreDataConstant.LnbTab;
  searchRange;
  searchedKeyword: string;
  selectedCatalog: Catalog.Tree = null;
  // source type filter
  selectedSourceTypeFilter: string[] = [];
  // name, updated sorting
  selectedSort: string;
  // created filter
  selectedDate = new PeriodData();
  selectedDateFilterType = Criteria.DateTimeType.ALL;
  // selected created filter name

  showUpdatedTimeFilter: boolean = false;
  showSourceTypeFilter: boolean = false;

  // selected item label
  public sourceTypeSelectedItemsLabel: string[] = ['msg.comm.ui.list.all'];
  public updatedTimeSelectedItemsLabel: string = 'msg.comm.ui.list.all';

  startTime: string = '';
  finishTime: string = '';
  betweenPastTime = 'msg.storage.ui.criterion.time.past';
  betweenCurrentTime = 'msg.storage.ui.criterion.time.current';

  timeFilterCriterion: Criteria.ListCriterion;
  typeFilterCriterion: Criteria.ListCriterion;

  selectedTag;
  treeHierarchy: Catalog.Tree[];

  @Input() readonly $layoutContentsClass;

  // filters
  // TODO 추후 동적필터가 들어오게되면 제거 필요
  dataTypeFilterList = StorageService.isEnableStageDB ? this.constant.getMetadataTypeFilters() : this.constant.getMetadataTypeFiltersExceptStaging();

  // event
  @Output() readonly clickedMetadata = new EventEmitter();
  @Output() readonly changedMetadataPresence = new EventEmitter();
  @Output() readonly requestInitializeSelectedCatalog = new EventEmitter();
  @Output() readonly requestInitializeSelectedTag = new EventEmitter();
  @Output() readonly requestChangeSelectedCatalog = new EventEmitter();
  @Output() readonly requestToggleFavoriteCatalog = new EventEmitter();

  // 생성자
  constructor(private metadataService: MetadataService,
              private exploreDataModelService: ExploreDataModelService,
              private constant: ConstantService,
              private catalogService: CatalogService,
              protected element: ElementRef,
              protected injector: Injector,
              private _activatedRoute: ActivatedRoute) {
    super(element, injector);
  }

  public ngOnInit() {
    this.selectedDate.type = Criteria.DateTimeType.ALL;

    this.timeFilterCriterion = {
      criterionKey: ListCriterionKey.CREATED_TIME,
      criterionType: ListCriterionType.RANGE_DATETIME,
      criterionName: 'msg.storage.ui.criterion.created-time',
      filters: [
        {
          criterionKey: ListCriterionKey.CREATED_TIME,
          filterKey: 'updatedTimeFrom',
          filterName: 'msg.storage.ui.criterion.created-time',
          filterSubKey: 'updatedTimeTo',
          filterSubValue: '',
          filterValue: ''
        }
      ]
    };

    this.typeFilterCriterion = {
      criterionKey: ListCriterionKey.SOURCE_TYPE,
      criterionType: ListCriterionType.CHECKBOX,
      criterionName: 'msg.storage.ui.criterion.created-time',
      filters: [
        {
          criterionKey: ListCriterionKey.SOURCE_TYPE,
          filterKey: 'sourceType',
          filterName: SourceType.ENGINE.toString(),
          filterValue: 'ENGINE'
        },
        {
          criterionKey: ListCriterionKey.SOURCE_TYPE,
          filterKey: 'sourceType',
          filterName: SourceType.JDBC.toString(),
          filterValue: 'JDBC'
        },
        {
          criterionKey: ListCriterionKey.SOURCE_TYPE,
          filterKey: 'sourceType',
          filterName: SourceType.STAGEDB.toString(),
          filterValue: 'STAGEDB'
        },
      ],
      subCriteria: [
        {
          filters: [
            {criterionKey: 'SOURCE_TYPE', filterKey: 'sourceType', filterName: 'JDBC', filterValue: 'JDBC'},
            {criterionKey: 'SOURCE_TYPE', filterKey: 'sourceType', filterName: 'ENGINE', filterValue: 'ENGINE'},
            {criterionKey: 'SOURCE_TYPE', filterKey: 'sourceType', filterName: 'STAGEDB', filterValue: 'STAGEDB'}
          ]
        } as ListCriterion,
      ]
    };

    // Get query param from url
    this.subscriptions.push(
      this._activatedRoute.queryParams.subscribe((params) => {

        if (!_.isEmpty(params)) {

          if (!this.isNullOrUndefined(params['size'])) {
            this.page.size = params['size'];
          }

          if (!this.isNullOrUndefined(params['page'])) {
            this.page.page = params['page'];
          }

          if (!this.isNullOrUndefined(params['sourceType'])) {
            this.selectedSourceTypeFilter = params['sourceType'].split(',');
          }

          if (!_.isNil(params['sort'])) {
            this.selectedSort = params['sort'];
          }

          this.selectedDate = new PeriodData();
          this.selectedDate.startDate = params['from'];
          this.selectedDate.endDate = params['to'];

          this.selectedDate.startDateStr = decodeURIComponent(params['from']);
          this.selectedDate.endDateStr = decodeURIComponent(params['to']);
          this.selectedDate.type = params['type'];

          this._setMetadataList(params).then();
        }
        // get metadata list

      })
    );
  }

  ngOnDestroy() {
    this.$layoutContentsClass.removeClass('ddp-scroll');
    this.requestInitializeSelectedCatalog.emit();
    this.selectedCatalog = undefined;
    super.ngOnDestroy();
  }

  /**
   * reload page
   * @param {boolean} isFirstPage
   */
  public reloadPage(isFirstPage: boolean = true) {
    (isFirstPage) && (this.page.page = 0);

    this._searchParams = this._getMetadataListParams();

    this.router.navigate(
      [this.router.url.replace(/\?.*/gi, '')],
      {queryParams: this._searchParams, replaceUrl: true}
    ).then();
  } // function - reloadPage

  initMetadataList() {
    this.loadingShow();
    // set external data
    this.selectedLnbTab = this.exploreDataModelService.selectedLnbTab;
    this.searchRange = this.exploreDataModelService.selectedSearchRange;
    this.searchedKeyword = this.exploreDataModelService.searchKeyword;
    this.selectedCatalog = this.exploreDataModelService.selectedCatalog;
    this.selectedTag = this.exploreDataModelService.selectedTag;

    const initial = async () => {
      if (this.selectedCatalog !== undefined && this.selectedCatalog.name !== 'unclassified') {
        this.treeHierarchy = await this.catalogService.getTreeCatalogs(this.selectedCatalog.id, true);
      }
      this.page.page = 0;
      this.page.size = CommonConstant.API_CONSTANT.PAGE_SIZE;
      this.reloadPage();
    };

    initial().then(() => {
      this.loadingHide();
    }).catch(error => this.commonExceptionHandler(error));
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

  isNotEmptySearchKeyword(): boolean {
    return StringUtil.isNotEmpty(this.searchedKeyword);
  }

  isSelectedCatalog(): boolean {
    return this.selectedLnbTab === ExploreDataConstant.LnbTab.CATALOG && !_.isNil(this.selectedCatalog);
  }

  isSelectedTag(): boolean {
    return this.selectedLnbTab === ExploreDataConstant.LnbTab.TAG && !_.isNil(this.selectedTag);
  }

  getTotalElements(): string {
    return CommonUtil.numberWithCommas(this.pageResult.totalElements);
  }

  getTranslatedSourceTypeSelectedItemsLabel() {
    return this.sourceTypeSelectedItemsLabel.map(filter => {
      return this.translateService.instant(filter);
    }).join(',');
  }

  getTranslatedUpdatedTimeSelectedItemsLabel() {
    if (this.selectedDateFilterType === Criteria.DateTimeType.ALL) {
      return this.translateService.instant(this.updatedTimeSelectedItemsLabel);
    } else if (this.selectedDateFilterType === Criteria.DateTimeType.TODAY || this.selectedDateFilterType === Criteria.DateTimeType.SEVEN_DAYS) {
      return `${this.startTime} ~ ${this.finishTime}`
    } else {
      return `${this.translateService.instant(this.betweenPastTime)} ~ ${this.translateService.instant(this.betweenCurrentTime)}`
    }
  }

  getTotalElementsGuide() {
    if (this.isNotEmptySearchKeyword()) {
      return this.translateService.instant('msg.explore.ui.list.content.total.searched', {
        totalElements: this.getTotalElements(),
        searchedKeyword: this.searchedKeyword.trim()
      });
    } else {
      return this.translateService.instant('msg.explore.ui.list.content.total', {totalElements: this.getTotalElements()});
    }
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

  /**
   * More connection click event
   */
  changePage(data: { page: number, size: number }): void {
    // if more metadata list
    if (data) {
      this.page.page = data.page;
      this.page.size = data.size;

      this.reloadPage(false);
    }
  }

  onClickMetadata(metadata: Metadata): void {
    this.loadingShow();
    this.clickedMetadata.emit(metadata);
  }

  onClickResetSelectedCatalog(): void {
    // requesting lnb component to initialize catalog
    this.requestInitializeSelectedCatalog.emit();
    this.selectedCatalog = undefined;
    this.reloadPage();
  }

  onClickResetSelectedTag(): void {
    // requesting lnb component to initialize tag
    this.requestInitializeSelectedTag.emit();
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

  onClickFavoriteIconInCatalogTree() {
    event.stopImmediatePropagation();
    event.stopPropagation();

    // toggle favorite in server
    this.catalogService.toggleCatalogFavorite(this.selectedCatalog.id, this.selectedCatalog.favorite)
      .then(() => {
        this.requestToggleFavoriteCatalog.emit();
      })
      .catch((e) => this.commonExceptionHandler(e));

    // toggle favorite in
    this.selectedCatalog.favorite = !this.selectedCatalog.favorite;
  }

  onChangeSelectedCatalog(catalog: Catalog.Tree): void {
    if (this.selectedCatalog.id !== catalog.id) {
      this.requestChangeSelectedCatalog.emit(catalog);
    }
  }

  onChangeDataTypeFilter(filterList: any) {
    // extract only value property
    this.selectedSourceTypeFilter = filterList['sourceType'].map((filter) => {
      return filter['filterName'];
    });

    if (this.selectedSourceTypeFilter.length > 0) {
      this.sourceTypeSelectedItemsLabel = this.selectedSourceTypeFilter.map((filter) => {
        if (filter === 'ENGINE') {
          return 'msg.storage.li.engine';
        } else if (filter === 'JDBC') {
          return 'msg.storage.li.db';
        } else if (filter === 'STAGEDB') {
          return 'msg.storage.li.stagedb';
        }
      });
    } else {
      this.sourceTypeSelectedItemsLabel = ['msg.comm.ui.list.all'];
    }
    this.reloadPage();
  }

  // apply created time sort from createdTime filter Component
  onChangeUpdateTimeFilter(selectedDate) {
    this.selectedDateFilterType = selectedDate.TYPE[0];

    const betweenFrom = selectedDate.updatedTimeFrom[0].filterName;
    const betweenTo = selectedDate.updatedTimeTo[0].filterName;

    let startDate;
    let endDate;
    let type;
    let startDateStr;
    let endDateStr;
    const dateType = null;

    const returnFormat = 'YYYY-MM-DDTHH:mm';

    // if filter type is between
    if (this.selectedDateFilterType === Criteria.DateTimeType.BETWEEN) {
      if (betweenFrom) {
        this.betweenPastTime = betweenFrom;
      }
      if (betweenTo) {
        this.betweenCurrentTime = betweenTo;
      }

      // Only set params need to request api according to condition otherwise just leave it null
      // if from and to is all exist
      if (betweenFrom && betweenTo) {
        startDate = betweenFrom;
        endDate = betweenTo;
        startDateStr = moment(betweenFrom).format(returnFormat);
        endDateStr = moment(betweenTo).format(returnFormat);
        // if only 'from' time is selected
      } else if (betweenFrom && !betweenTo) {
        startDate = betweenFrom;
        startDateStr = moment(betweenFrom).format(returnFormat);
        // if only 'to' time is selected
      } else if (!betweenFrom && betweenTo) {
        endDate = betweenTo;
        endDateStr = moment(betweenTo).format(returnFormat);
      }
      // if filter type is not between
    } else {
      this.startTime = betweenFrom;
      this.finishTime = betweenTo;

      if (this.selectedDateFilterType === Criteria.DateTimeType.ALL) {
        this.updatedTimeSelectedItemsLabel = 'msg.comm.ui.list.all';
      }
      startDate = betweenFrom;
      endDate = betweenTo;
      type = this.selectedDateFilterType;
      startDateStr = moment(betweenFrom).format(returnFormat);
      endDateStr = moment(betweenTo).format(returnFormat);
    }

    this.selectedDate = {
      startDate: startDate,
      endDate: endDate,
      type: type,
      startDateStr: startDateStr,
      endDateStr: endDateStr,
      dateType: dateType
    };

    this.reloadPage();
  }

  private _getMetadataListParams() {
    let params;
    if (this.selectedSort !== undefined) {
      params = {
        page: this.page.page,
        size: this.page.size,
        sort: this.selectedSort,
      };
    } else {
      params = {
        page: this.page.page,
        size: this.page.size,
      };
    }

    // if not empty search keyword
    if (StringUtil.isNotEmpty(this.searchedKeyword)) {
      params[this.searchRange.value] = this.searchedKeyword.trim();
    }

    // source type
    if (this.selectedSourceTypeFilter !== undefined && this.selectedSourceTypeFilter.length > 0) {
      const tempList = this.selectedSourceTypeFilter.slice();
      params['sourceType'] = tempList.join(',');
    }

    // update time - not All type
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {
      params['searchDateBy'] = 'UPDATED';
      params['type'] = this.selectedDate.type;
      if (this.selectedDate.startDate) {
        params['from'] = moment(this.selectedDate.startDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      if (this.selectedDate.endDate) {
        params['to'] = moment(this.selectedDate.endDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
    } else {
      params['type'] = 'ALL';
    }

    if (this.isSelectedCatalog()) {
      params['catalogId'] = '';

      if (this.selectedCatalog === undefined) {
        params['catalogId'] = null;
      } else {
        if (this.selectedCatalog.name === 'unclassified') {
          params['catalogId'] = '';
        } else if (this.selectedCatalog.name !== 'unclassified') {
          params['catalogId'] = this.selectedCatalog.id;
        }
      }
    }

    if (this.isSelectedTag()) {
      params['tag'] = this.selectedTag.name;
    }

    return params;
  }

  private async _setMetadataList(params) {
    this.loadingShow();
    const result = await this.metadataService.getMetaDataList(params);

    if (!_.isNil(result)) {
      // add ddp-scroll class to layout
      this.$layoutContentsClass.addClass('ddp-scroll');
      this.pageResult = result.page;
      // set metadata list
      if (result._embedded) {
        this.metadataList = result._embedded.metadatas;
      } else {
        this.metadataList = [];
      }
      // broadcast changed metadata presence
      this.changedMetadataPresence.emit(this.isEmptyMetadataList());
    }
  }

  // private async _initialMetadataList() {
  //   this.page.page = 0;
  //   this.page.size = CommonConstant.API_CONSTANT.PAGE_SIZE;
  //   this.reloadPage();
  // }

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

  /**
   * List show click event
   */
  public toggleUpdatedTimeFilter() {
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.showUpdatedTimeFilter = !this.showUpdatedTimeFilter;
    this.showSourceTypeFilter = false;
  }

  /**
   * List show click event
   * @param {MouseEvent} event
   */
  toggleSourceTypeFilter(event: MouseEvent) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.showSourceTypeFilter = !this.showSourceTypeFilter;
    this.showUpdatedTimeFilter = false;
  }

  /**
   * Close Source type filter
   */
  closeSourceTypeFilter() {
    this.showSourceTypeFilter = false;
  }

  /**
   * Close time filter
   */
  closeTimeFilter() {
    // if click event is not generated by date picker==
    if (0 === $(event.target).closest('[class^=datepicker]').length) {
      // close list
      this.showUpdatedTimeFilter = false;
    }
  }
}
