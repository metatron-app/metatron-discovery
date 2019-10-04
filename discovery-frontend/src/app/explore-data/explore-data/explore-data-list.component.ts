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

import {Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import * as _ from "lodash";
import {StringUtil} from "../../common/util/string.util";
import {Metadata} from "../../domain/meta-data-management/metadata";
import {ExploreDataConstant} from "../constant/explore-data-constant";
import {MetadataService} from "../../meta-data-management/metadata/service/metadata.service";
import {CommonConstant} from "../../common/constant/common.constant";
import {ExploreDataModelService} from "./service/explore-data-model.service";
import {StorageService} from "../../data-storage/service/storage.service";
import {ConstantService} from "../../shared/datasource-metadata/service/constant.service";
import {CommonUtil} from "../../common/util/common.util";
import {Catalog} from "../../domain/catalog/catalog";
import {CatalogService} from "../../meta-data-management/catalog/service/catalog.service";
import {ExploreDataUtilService, SortOption} from "./service/explore-data-util.service";
import {isNullOrUndefined} from "util";
import {ActivatedRoute} from "@angular/router";
import {Criteria} from "../../domain/datasource/criteria";
import {PeriodData} from "../../common/value/period.data.value";
import {Subject} from "rxjs";

declare let moment: any;

@Component({
  selector: 'explore-data-list',
  templateUrl: './explore-data-list.component.html',
})
export class ExploreDataListComponent extends AbstractComponent {

  metadataList: Metadata[];
  // To toggle filter layer
  filterFlags: Subject<{}> = new Subject();

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
  selectedDate: PeriodData;
  // selected created filter name

  @ViewChild('startPickerInput')
  private readonly _startPickerInput: ElementRef;

  @ViewChild('endPickerInput')
  private readonly _endPickerInput: ElementRef;

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

  // 생성자
  constructor(private metadataService: MetadataService,
              private exploreDataModelService: ExploreDataModelService,
              private constant: ConstantService,
              private catalogService: CatalogService,
              private exploreDataUtilService: ExploreDataUtilService,
              protected element: ElementRef,
              protected injector: Injector,
              private _activatedRoute: ActivatedRoute) {
    super(element, injector);
  }

  public ngOnInit() {
    this.selectedDate = new PeriodData();

    this.selectedDate.type = Criteria.DateTimeType.ALL;

    this.selectedCatalog;
    this.filterFlags.next({
      [FilterTypes.DATA_TYPE]: false,
      [FilterTypes.UPDATED_TIME]: false
    });

    // Get query param from url
    this.subscriptions.push(
      this._activatedRoute.queryParams.subscribe((params) => {

        if (!_.isEmpty(params)) {

          if (!isNullOrUndefined(params['size'])) {
            this.page.size = params['size'];
          }

          if (!isNullOrUndefined(params['page'])) {
            this.page.page = params['page'];
          }

          if (!isNullOrUndefined(params['sourceType'])) {
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
      if (this.selectedCatalog != undefined && this.selectedCatalog.name != 'undefined') {
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
    this.router.navigate(['/exploredata/view']);
  }

  onClickResetSelectedTag(): void {
    // requesting lnb component to initialize tag
    this.requestInitializeSelectedTag.emit();
  }

  onChangeSelectedCatalog(catalog: Catalog.Tree): void {
    if (this.selectedCatalog.id !== catalog.id) {
      this.requestChangeSelectedCatalog.emit(catalog);
    }
  }

   onChangeDataTypeFilter(filterList: string[]) {
    // extract only value property
    this.selectedSourceTypeFilter = filterList.map((filter) => {
      return filter['value'];
    });
    this.reloadPage();
  }

  // apply created time sort from createdTime filter Component
  onChangeCreateTimeFilter(selectedDate) {
    this.selectedDate = selectedDate;
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

    // created time
    if (this.selectedDate && this.selectedDate.type !== 'ALL') {
      params['searchDateBy'] = 'UPDATED';
      params['type'] = this.selectedDate.type;
      if (this.selectedDate.startDateStr) {
        params['from'] = moment(this.selectedDate.startDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
      if (this.selectedDate.endDateStr) {
        params['to'] = moment(this.selectedDate.endDateStr).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      }
    } else {
      params['type'] = 'ALL';
    }

    params['catalogId'] = '';

    if (this.searchedKeyword === '') {
      params['catalogId'] = null;
    }

    if (this.isSelectedCatalog() && this.selectedCatalog.name !== 'undefined') {
      params['catalogId'] = this.selectedCatalog.id;
    } else if (this.isSelectedTag()) {
      params['tag'] = this.selectedTag.name;
    }

    if (this.selectedCatalog !== undefined) {
      if (this.selectedCatalog.name === 'undefined') {
        params['catalogId'] = '';
      }
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

  private async _initialMetadataList() {
    this.page.page = 0;
    this.page.size = CommonConstant.API_CONSTANT.PAGE_SIZE;
    this.reloadPage();
  }

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
}

enum FilterTypes {
  DATA_TYPE = 'DATA_TYPE',
  UPDATED_TIME = 'UPDATED_TIME'
}


