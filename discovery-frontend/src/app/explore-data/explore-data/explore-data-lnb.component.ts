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
import {Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {StringUtil} from '@common/util/string.util';
import {EventBroadcaster} from '@common/event/event.broadcaster';
import {AbstractComponent} from '@common/component/abstract.component';
import {Tag} from '@domain/tag/tag';
import {Catalog} from '@domain/catalog/catalog';
import {MetadataService} from '../../meta-data-management/metadata/service/metadata.service';
import {CatalogService} from '../../meta-data-management/catalog/service/catalog.service';
import {ExploreDataModelService} from './service/explore-data-model.service';
import {ExploreDataConstant} from '../constant/explore-data-constant';

@Component({
  selector: 'component-explore-lnb',
  templateUrl: 'explore-data-lnb.component.html'
})
export class ExploreDataLnbComponent extends AbstractComponent implements OnInit, OnDestroy {

  selectedLnbTab: ExploreDataConstant.LnbTab = this.exploreDataModelService.selectedLnbTab;
  selectedCatalog: Catalog.Tree;
  selectedTag: Tag.Tree;

  catalogList: Catalog.Tree[];
  tagList: Tag.Tree[];
  catalogSearchKeyword: string;
  tagSearchKeyword: string;
  isFoldingNavigation: boolean = false;
  isShowFavoriteCatalog: boolean = false;

  // Dummy data before api
  favoriteCatalogList = [];

  @Output() readonly changedLnbData = new EventEmitter();

  readonly EXPLORE_LNB_MODE = ExploreDataConstant.LnbTab;

  constructor(private exploreDataModelService: ExploreDataModelService,
              private metadataService: MetadataService,
              private catalogService: CatalogService,
              private broadcaster: EventBroadcaster,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  ngOnInit() {
    super.ngOnInit();
    const initial = async () => {
      await this._setCatalogList(Catalog.Constant.CATALOG_ROOT_ID);
      await this._setTagList();
      await this._setFavoriteCatalogList();
    };
    initial().then(() => this.broadcaster.broadcast(ExploreDataConstant.BroadCastKey.EXPLORE_INITIAL)).catch(() => this.broadcaster.broadcast(ExploreDataConstant.BroadCastKey.EXPLORE_INITIAL));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.exploreDataModelService.initialLnbData();
  }

  isSelectedTagTab(): boolean {
    return this.selectedLnbTab === ExploreDataConstant.LnbTab.TAG;
  }

  isSelectedCatalogTab(): boolean {
    return this.selectedLnbTab === ExploreDataConstant.LnbTab.CATALOG;
  }

  isSelectedCatalog(catalog: Catalog.Tree): boolean {
    return !_.isNil(this.selectedCatalog) && this.selectedCatalog.id === catalog.id;
  }

  isSelectedTag(tag: Tag.Tree): boolean {
    return !_.isNil(this.selectedTag) && this.selectedTag.id === tag.id;
  }

  isEmptyCatalogSearchKeyword(): boolean {
    return StringUtil.isEmpty(this.catalogSearchKeyword);
  }

  isEmptyTagSearchKeyword(): boolean {
    return StringUtil.isEmpty(this.tagSearchKeyword);
  }

  isNotEmptyCatalogContents(): boolean {
    return !_.isNil(this.catalogList) && this.catalogList.length !== 0;
  }

  isNotEmptyTagContents(): boolean {
    return !_.isNil(this.tagList) && this.tagList.length !== 0;
  }

  getTagName(name: string) {
    // if empty search keyword
    if (StringUtil.isEmpty(this.tagSearchKeyword)) {
      return name;
    } else {
      return name.replace(this.tagSearchKeyword, `<span class="ddp-txt-search">${this.tagSearchKeyword}</span>`);
    }
  }

  initSelectedCatalog(): void {
    const realUndefined = new Catalog.Tree();
    realUndefined.name = 'realUndefined';
    this.onChangeSelectedCatalog(realUndefined);
  }

  initSelectedTag(): void {
    this.onChangeSelectedTag(undefined);
  }

  onChangeFoldingNavigation(): void {
    this.isFoldingNavigation = !this.isFoldingNavigation;
  }

  onChangeLnbTab(value: ExploreDataConstant.LnbTab): void {
    if (this.selectedLnbTab !== value) {
      this.selectedLnbTab = value;
      this.exploreDataModelService.selectedLnbTab = value;
      // if selected catalog or tag
      if ((value === ExploreDataConstant.LnbTab.CATALOG && !_.isNil(this.selectedCatalog)) || (value === ExploreDataConstant.LnbTab.TAG && !_.isNil(this.selectedTag))) {
        this._changedLnbData();
      }
    }
  }

  onChangeCatalogSearchKeyword(value: string): void {
    this.catalogSearchKeyword = value;
    // if empty catalog search keyword
    if (this.isEmptyCatalogSearchKeyword()) {
      this.loadingShow();
      this._setCatalogList(Catalog.Constant.CATALOG_ROOT_ID)
        .then(() => this.loadingHide())
        .catch(error => this.commonExceptionHandler(error));
    } else {
      this._setCatalogListUsedSearch();
    }
  }

  onChangeTagSearchKeyword(value: string): void {
    this.tagSearchKeyword = value;
    // if empty tag search keyword
    if (this.isEmptyTagSearchKeyword()) {
      this.loadingShow();
      this._setTagList()
        .then(() => this.loadingHide())
        .catch(error => this.commonExceptionHandler(error));
    } else {
      this._setTagListUsedSearch();
    }
  }

  onChangeSelectedCatalog(catalog: Catalog.Tree) {
    // if unclassified in explore lnb is clicked
    if (catalog === undefined) {
      // create empty catalog tree and initialize
      const emptyCatalog = new Catalog.Tree();
      emptyCatalog.name = 'unclassified';

      this.selectedCatalog = emptyCatalog;
      this.exploreDataModelService.selectedCatalog = emptyCatalog;

      this._changedLnbData();
      // if reset catalog button in tree hierarchy is clicked
    } else if (catalog.name === 'realUndefined') {
      this.selectedCatalog = undefined;
      this.exploreDataModelService.selectedCatalog = undefined;
    } else {
      // undefine or same catalog is selected do nothing
      if (this.selectedCatalog === undefined || this.selectedCatalog.id !== catalog.id) {
        this.catalogService.getCatalogDetail(catalog.id).then(async (result) => {
          this.selectedCatalog = result;
          this.exploreDataModelService.selectedCatalog = result;
          this._changedLnbData();
        }).catch((e) => {
          this.commonExceptionHandler(e)
        });
      }
    }
  }

  onChangeSelectedTag(tag): void {
    this.selectedTag = tag;
    this.exploreDataModelService.selectedTag = tag;
    this._changedLnbData();
  }

  onChangeFavoriteCatalogList(): void {
    // when favorite is toggled request api again to get updated data
    this._setFavoriteCatalogList().catch((e) => this.commonExceptionHandler(e));
    this._changedLnbData();
  }

  getCatalogHierarchyLabel(catalog: Catalog.Tree): string {
    let path = '';

    catalog.hierarchies.forEach((hierarchy, index) => {
      path += hierarchy.name;
      if (index !== catalog.hierarchies.length - 1) {
        path += ' > ';
      }
    });

    return path;
  }

  onToggleIsShowFavoriteCatalog() {
    this.isShowFavoriteCatalog = !this.isShowFavoriteCatalog;
  }

  private async _setCatalogList(catalogId: string) {
    const result = await this.catalogService.getTreeCatalogs(catalogId);
    if (catalogId === Catalog.Constant.CATALOG_ROOT_ID) {
      this.catalogList = result;
    }
  }

  private async _setTagList() {
    this.tagList = await this.metadataService.getMetadataTagList('forTreeView');
  }

  private async _setFavoriteCatalogList() {
    this.favoriteCatalogList = await this.catalogService.getMyFavoriteCatalogList();
  }

  private _setCatalogListUsedSearch(): void {
    this.loadingShow();
    this.catalogService.getCatalogs({nameContains: this.catalogSearchKeyword}, 'forSimpleTreeView')
      .then((result) => {
        this.catalogList = result;
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  private _setTagListUsedSearch(): void {
    this.loadingShow();
    this.metadataService.getMetadataTagList('forTreeView', {nameContains: this.tagSearchKeyword})
      .then((result) => {
        this.tagList = result;
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  private _changedLnbData(): void {
    this.changedLnbData.emit();
  }
}
