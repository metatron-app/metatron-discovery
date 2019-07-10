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

import {Component, ElementRef, HostListener, Injector, OnDestroy, OnInit} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {MetadataService} from "../../meta-data-management/metadata/service/metadata.service";
import {Metadata} from "../../domain/meta-data-management/metadata";
import * as _ from 'lodash';
import {CatalogService} from "../../meta-data-management/catalog/service/catalog.service";
import {Catalog} from "../../domain/catalog/catalog";
import {StringUtil} from "../../common/util/string.util";

@Component({
  selector: 'app-exploredata-view',
  templateUrl: './explore-data.component.html',
})
export class ExploreDataComponent extends AbstractComponent implements OnInit, OnDestroy {

  selectedMetadata: Metadata;
  selectedCatalog: Catalog.Tree;
  selectedTag;

  // data
  mode: ExploreMode = ExploreMode.MAIN;
  lnbMode = ExploreLnbTab.CATALOG;
  sourceTypeCount: number = 0;
  stagingTypeCount: number = 0;
  databaseTypeCount: number = 0;
  catalogList: Catalog.Tree[];
  catalogSearchKeyword: string;
  tagList;
  tagSearchKeyword: string;
  searchKeyword: string;

  isFoldingNavigation: boolean;

  // enum
  readonly EXPLORE_MODE = ExploreMode;
  readonly EXPLORE_LNB_MODE = ExploreLnbTab;

  // 생성자
  constructor(private metadataService: MetadataService,
              private catalogService: CatalogService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  // Init
  public ngOnInit() {
    super.ngOnInit();

    const init = async () => {
      this.loadingShow();
      await this._setMetadataSourceTypeCount();
      await this._setCatalogList(Catalog.Constant.CATALOG_ROOT_ID);
      await this._setTagList();
    };
    init().catch(error => this.commonExceptionHandler(error));
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
    $( '.ddp-layout-contents' ).addClass( 'ddp-layout-meta' )
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
    $( '.ddp-layout-contents' ).removeClass( 'ddp-layout-meta' )
  }

  @HostListener('window:scroll')
  onScrolled() {
    if($(window).scrollTop() > 0){
      $('.ddp-layout-contents').addClass('ddp-scroll');
    }
    else if($(window).scrollTop() === 0) {
      $('.ddp-layout-contents').removeClass('ddp-scroll');
    }
  }

  isSelectedTagTab(): boolean {
    return this.lnbMode === ExploreLnbTab.TAG;
  }

  isSelectedCatalogTab(): boolean {
    return this.lnbMode === ExploreLnbTab.CATALOG;
  }

  isEmptyCatalogSearchKeyword(): boolean {
    return StringUtil.isEmpty(this.catalogSearchKeyword);
  }

  isEmptyTagSearchKeyword(): boolean {
    return StringUtil.isEmpty(this.tagSearchKeyword);
  }

  goToExploreMain() {
    this.mode = ExploreMode.MAIN;
  }

  onChangeFoldingNavigation(): void {
    this.isFoldingNavigation = !this.isFoldingNavigation;
  }

  onChangeCatalogSearchValue(value: string): void {
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

  onChangeTagSearchValue(value: string): void {
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

  onChangeLnbTab(value: ExploreLnbTab): void {
    this.lnbMode = value;
  }

  onChangeSearchKeyword(value: string): void {
    this.searchKeyword = value;
    // TODO
  }

  onClickCatalog(catalog: Catalog.Tree): void {
    this.mode = ExploreMode.CATALOG;
    this.selectedCatalog = catalog;
  }

  onClickMetadata(metadata: Metadata) {
    this.selectedMetadata = metadata
  }

  onCloseMetadataContainer() {
    this.selectedMetadata = null;
  }

  private async _setMetadataSourceTypeCount() {
    const result: {ENGINE: number, JDBC: number, STAGEDB: number} = await this.metadataService.getMetadataSourceTypeCount();
    if (!_.isNil(result.ENGINE)) {
      this.sourceTypeCount = result.ENGINE;
    }
    if (!_.isNil(result.JDBC)) {
      this.databaseTypeCount = result.JDBC;
    }
    if (!_.isNil(result.STAGEDB)) {
      this.stagingTypeCount = result.STAGEDB;
    }
  }

  private async _setCatalogList(catalogId: string) {
    const result = await this.catalogService.getTreeCatalogs(catalogId);
    if (catalogId === Catalog.Constant.CATALOG_ROOT_ID) {
      this.catalogList = result;
    }
  }

  private async _setTagList() {
    const result = await this.metadataService.getMetadataTagList('forTreeView');
    this.tagList = result;
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
    // this.loadingShow();
    // this.metadataService.getMetadataTagList({nameContains: this.catalogSearchKeyword}, 'forTreeView')
    //   .then((result) => {
    //     this.catalogList = result;
    //     this.loadingHide();
    //   })
    //   .catch(error => this.commonExceptionHandler(error));
  }
}

enum ExploreMode {
  MAIN = 'MAIN',
  CATALOG = 'CATALOG'
}

enum ExploreLnbTab {
  CATALOG = 'CATALOG',
  TAG = 'TAG'
}
