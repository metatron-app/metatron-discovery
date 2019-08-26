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

import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {AbstractComponent} from '../../common/component/abstract.component';
import {MetadataService} from "../../meta-data-management/metadata/service/metadata.service";
import {Metadata, SourceType} from "../../domain/meta-data-management/metadata";
import * as _ from 'lodash';
import {CatalogService} from "../../meta-data-management/catalog/service/catalog.service";
import {Catalog} from "../../domain/catalog/catalog";
import {StringUtil} from "../../common/util/string.util";
import {MetadataContainerComponent} from "./popup/metadata-container.component";
import {DatasourceService} from "../../datasource/service/datasource.service";

@Component({
  selector: 'app-exploredata-view',
  templateUrl: './explore-data.component.html',
  entryComponents: [MetadataContainerComponent]
})
export class ExploreDataComponent extends AbstractComponent implements OnInit, OnDestroy {

  @ViewChild('component_metadata_detail', {read: ViewContainerRef}) entry: ViewContainerRef;

  entryRef: ComponentRef<MetadataContainerComponent>;

  selectedCatalog: Catalog.Tree;

  // data
  mode: ExploreMode = ExploreMode.MAIN;
  sourceTypeCount: number = 0;
  stagingTypeCount: number = 0;
  databaseTypeCount: number = 0;
  catalogList: Catalog.Tree;
  catalogSearchKeyword: string;

  isFoldingNavigation: boolean;

  // enum
  readonly EXPLORE_MODE = ExploreMode;

  // 생성자
  constructor(private metadataService: MetadataService,
              private catalogService: CatalogService,
              private resolver: ComponentFactoryResolver,
              private dataSourceService: DatasourceService,
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

  isEmptyCatalogSearchKeyword(): boolean {
    return StringUtil.isEmpty(this.catalogSearchKeyword);
  }

  onChangeTab() {
    // TODO 임시
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

  onClickCatalog(catalog: Catalog.Tree): void {
    this.mode = ExploreMode.CATALOG;
    this.selectedCatalog = catalog;
  }

  onClickMetadata(metadata: Metadata) {
    // declare variables needed for metadata-container(modal) component
    let metadataDetail;
    let recentlyQueriesForDatabase;
    let recentlyQueriesForDataSource;
    let topUserList;
    let recentlyUpdatedList;

    // get datas...
    const getRecentlyQueriesForDatabase = async (sourcetype: SourceType) => {
      if (sourcetype === SourceType.STAGEDB) {
        recentlyQueriesForDatabase = await this.dataSourceService.getRecentlyQueriesInMetadataDetailForDatabase(metadataDetail.source.id, this.page.page, this.page.size, this.page.sort)
          .catch(error => this.commonExceptionHandler(error));
      } else {
        recentlyQueriesForDatabase = await this.dataSourceService.getRecentlyQueriesInMetadataDetailForDatabase(metadataDetail.source.source.id, this.page.page, this.page.size, this.page.sort)
          .catch(error => this.commonExceptionHandler(error));
      }

    };

    const getRecentlyQueriesForDataSource = async () => {
      recentlyQueriesForDataSource = await this.dataSourceService.getRecentlyQueriesInMetadataDetailForDataSource(metadataDetail.source.source.id, this.page.page, this.page.size, this.page.sort)
        .catch(error => this.commonExceptionHandler(error));
    };

    const getTopUser = async () => {
      topUserList = await this.metadataService.getTopUserInMetadataDetail(metadata.id).catch(() => {

      });
      topUserList = topUserList === undefined ? [] : topUserList;
    };

    const getRecentlyUpdatedList = async () => {
      recentlyUpdatedList = await this.metadataService.getRecentlyUpdatedInMetadataDetail(metadata.id).catch(error => this.commonExceptionHandler(error));
    };

    // get metadataDetail to use datasourceService which is using metadataDetail
    this.metadataService.getDetailMetaData(metadata.id).then(async (result) => {
      metadataDetail = result;

      await getTopUser();
      await getRecentlyUpdatedList().catch(error => this.commonExceptionHandler(error));

      if (metadata.sourceType === SourceType.ENGINE) {
        await getRecentlyQueriesForDataSource();
        this.entryRef = this.entry.createComponent(this.resolver.resolveComponentFactory(MetadataContainerComponent));
        this.entryRef.instance.metadataDetailData = metadataDetail;
        this.entryRef.instance.topUserList = topUserList;
        this.entryRef.instance.recentlyUpdatedList = recentlyUpdatedList;
        if (recentlyQueriesForDataSource['_embedded']) {
          this.entryRef.instance.recentlyQueriesForDataSource = recentlyQueriesForDataSource['_embedded']['datasourcequeryhistories'];
        }
        this.entryRef.instance.metadataId = metadata.id;
      } else if (metadata.sourceType === SourceType.JDBC || metadata.sourceType === SourceType.STAGEDB) {
        await getRecentlyQueriesForDatabase(metadata.sourceType);
        this.entryRef = this.entry.createComponent(this.resolver.resolveComponentFactory(MetadataContainerComponent));
        this.entryRef.instance.metadataDetailData = metadataDetail;
        this.entryRef.instance.topUserList = topUserList;
        this.entryRef.instance.recentlyUpdatedList = recentlyUpdatedList;
        if (recentlyQueriesForDatabase['_embedded']) {
          this.entryRef.instance.recentlyQueriesForDataBase = recentlyQueriesForDatabase['_embedded']['queryhistories'];
        }
        this.entryRef.instance.metadataId = metadata.id;
      }
      this.entryRef.instance.closedPopup.subscribe(() => {
        // close
        this.entryRef.destroy();
      });
    }).catch(error => console.log(error));
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

  private _setCatalogListUsedSearch(): void {
    this.loadingShow();
    this.catalogService.getCatalogs({nameContains: this.catalogSearchKeyword}, 'forSimpleTreeView')
      .then((result) => {
        this.catalogList = result;
        this.loadingHide();
      })
      .catch(error => this.commonExceptionHandler(error));
  }
}

enum ExploreMode {
  MAIN = 'MAIN',
  CATALOG = 'CATALOG'
}
