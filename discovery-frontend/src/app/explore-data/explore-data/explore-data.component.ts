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
import {MetadataContainerComponent} from "./popup/metadata-container.component";
import {DatasourceService} from "../../datasource/service/datasource.service";
import {ExploreDataListComponent} from "./explore-data-list.component";
import {EventBroadcaster} from "../../common/event/event.broadcaster";
import {ExploreDataConstant} from "../constant/explore-data-constant";
import {Subscription} from "rxjs";
import {ExploreDataSearchComponent} from "./explore-data-search.component";
import {ExploreDataModelService} from "./service/explore-data-model.service";
import {ExploreDataMainComponent} from "./explore-data-main.component";
import {MetadataDataCreatorDataListComponent} from "./popup/metadata-data-creator-data-list.component";

@Component({
  selector: 'app-exploredata-view',
  templateUrl: './explore-data.component.html',
  entryComponents: [MetadataContainerComponent, MetadataDataCreatorDataListComponent]
})
export class ExploreDataComponent extends AbstractComponent implements OnInit, OnDestroy {

  @ViewChild('component_metadata_detail', {read: ViewContainerRef}) readonly metadataContainerEntry: ViewContainerRef;
  metadataContainerEntryRef: ComponentRef<MetadataContainerComponent>;

  @ViewChild('component_data_creator_data_list', {read: ViewContainerRef}) dataCreatorDataListEntry: ViewContainerRef;
  dataCreatorDataListEntryRef: ComponentRef<MetadataDataCreatorDataListComponent>;

  @ViewChild(ExploreDataListComponent)
  private readonly _exploreDataListComponent: ExploreDataListComponent;

  @ViewChild(ExploreDataMainComponent)
  private readonly _exploreDataMainComponent: ExploreDataMainComponent;

  @ViewChild(ExploreDataSearchComponent)
  exploreDataSearchComponent: ExploreDataSearchComponent;

  selectedMetadata: Metadata;

  // data
  mode: ExploreMode = ExploreMode.MAIN;
  sourceTypeCount: number = 0;
  stagingTypeCount: number = 0;
  databaseTypeCount: number = 0;
  datasetTypeCount: number = 0;

  subscription: Subscription;

  readonly $layoutContentsClass = $( '.ddp-layout-contents' );

  // enum
  readonly EXPLORE_MODE = ExploreMode;

  // 생성자
  constructor(private metadataService: MetadataService,
              private resolver: ComponentFactoryResolver,
              private dataSourceService: DatasourceService,
              private broadcaster: EventBroadcaster,
              private exploreDataModelService: ExploreDataModelService,
              protected element: ElementRef,
              protected injector: Injector) {
    super(element, injector);
  }

  // Init
  public ngOnInit() {
    super.ngOnInit();
    let broadCastSuccessCount: number = 0;
    // subscribe
    this.subscription = this.broadcaster.on(ExploreDataConstant.BroadCastKey.EXPLORE_INITIAL).subscribe(() => {
      if (broadCastSuccessCount >= 2) {
        this.loadingHide();
      } else {
        broadCastSuccessCount++;
      }
    });

    this.loadingShow();
    const initial = async () => {
      await this._setMetadataSourceTypeCount();
    };
    initial().then(() => this.broadcaster.broadcast(ExploreDataConstant.BroadCastKey.EXPLORE_INITIAL)).catch(() => this.broadcaster.broadcast(ExploreDataConstant.BroadCastKey.EXPLORE_INITIAL));
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
    this.$layoutContentsClass.addClass( 'ddp-layout-meta' );
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
    this.$layoutContentsClass.removeClass( 'ddp-layout-meta' );
    this.subscription.unsubscribe();
  }

  goToExploreMain(): void {
    this.mode = ExploreMode.MAIN;
    this.safelyDetectChanges();
    this.exploreDataSearchComponent.onChangeSearchKeyword('');
    this.exploreDataModelService.initializeAll();
  }

  onChangedSearch(): void {
    this._setExploreListMode();
    this._exploreDataListComponent.initMetadataList();
  }

  onChangedLnbData(): void {
    this._setExploreListMode();
    this._exploreDataListComponent.initMetadataList();
  }

  onClickMetadata(metadata: Metadata) {
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
        if (metadataDetail.source.source != undefined) {
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
      recentlyUsedList = await this.metadataService.getRecentlyUsedInMetadataDetail(metadata.id, {sort: 'createdTime', size: 5, page: 0}).catch(error => this.commonExceptionHandler(error));
    };

    this.metadataService.getDetailMetaData(metadata.id).then(async (result) => {
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
      this.metadataContainerEntryRef.instance.onToggleFavorite.subscribe((metadataDetail) => {
        // modal is shown in list screen
        if (this.mode === ExploreMode.LIST) {
          const index = this._exploreDataListComponent.metadataList.findIndex((metadata) => {
            return metadata.id === metadataDetail.id;
          });

          if (index !== -1) {
            this._exploreDataListComponent.metadataList[index].favorite = !this._exploreDataListComponent.metadataList[index].favorite;
          }
          // modal is shown in main screen
        } else if (this.mode === ExploreMode.MAIN)  {
          this._exploreDataMainComponent.setMyFavoriteMetadataList().catch(e => this.commonExceptionHandler(e));
        }
      });

    }).catch(error => {console.log(error); this.commonExceptionHandler(error)});
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

  private _setExploreListMode(): void {
    // if MAIN component
    if (this.mode === ExploreMode.MAIN) {
      this.mode = ExploreMode.LIST;
      this.safelyDetectChanges();
    }
  }
}

enum ExploreMode {
  MAIN = 'MAIN',
  LIST = 'LIST'
}
