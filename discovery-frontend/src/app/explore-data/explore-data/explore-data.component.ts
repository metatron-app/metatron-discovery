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

@Component({
  selector: 'app-exploredata-view',
  templateUrl: './explore-data.component.html',
})
export class ExploreDataComponent extends AbstractComponent implements OnInit, OnDestroy {

  public selectedMetadata: Metadata;
  selectedCatalog: Catalog.Tree;

  // data
  mode: ExploreMode = ExploreMode.MAIN;
  sourceTypeCount: number = 0;
  stagingTypeCount: number = 0;
  databaseTypeCount: number = 0;
  catalogList: Catalog.Tree;

  isFoldingNavigation: boolean;

  // enum
  readonly EXPLORE_MODE = ExploreMode;

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
    this._setCatalogList(Catalog.Constant.CATALOG_ROOT_ID);
    // set count
    this._setMetadataSourceTypeCount();
  }

  public ngAfterViewInit() {
    this.loadingHide();
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

  onChangeTab() {
    // TODO 임시
    this.mode = ExploreMode.MAIN;
  }

  onChangeFoldingNavigation(): void {
    this.isFoldingNavigation = !this.isFoldingNavigation;
  }

  onClickCatalog(catalog: Catalog.Tree): void {
    this.mode = ExploreMode.CATALOG;
    this.selectedCatalog = catalog;
  }

  public onClickMetadata(metadata: Metadata) {
    this.selectedMetadata = metadata
  }

  public onCloseMetadataContainer() {
    this.selectedMetadata = null;
  }

  private _setMetadataSourceTypeCount(): void {
    this.loadingShow();
    this.metadataService.getMetadataSourceTypeCount()
      .then((result: {ENGINE: number, JDBC: number, STAGEDB: number}) => {
        if (!_.isNil(result.ENGINE)) {
          this.sourceTypeCount = result.ENGINE;
        }
        if (!_.isNil(result.JDBC)) {
          this.databaseTypeCount = result.JDBC;
        }
        if (!_.isNil(result.STAGEDB)) {
          this.stagingTypeCount = result.STAGEDB;
        }
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }

  private _setCatalogList(catalogId: string): void {
    this.loadingShow();
    this.catalogService.getTreeCatalogs(catalogId)
      .then((result) => {
        if (catalogId === Catalog.Constant.CATALOG_ROOT_ID) {
          this.catalogList = result;
        }
      })
      .catch(error => this.commonExceptionHandler(error));
  }
}

enum ExploreMode {
  MAIN = 'MAIN',
  CATALOG = 'CATALOG'
}
